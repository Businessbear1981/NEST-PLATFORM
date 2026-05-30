"""
Intake Brainstorm Service — Bernard's first-look surface between Deal Input
and Roots Stage 1 ingestion.

Per ADR-0002 (Deal Lifecycle Entry Points), the Intake Brainstorm fires
ONCE after the `deals` row is inserted and BEFORE the founder commits to
the expensive document-collection workflow. It produces two outputs in
parallel:

  1. First-Look Memo — four sections:
       a. Bond Type Assessment        (from naics_rules_engine.ENGINE.lookup)
       b. Credit Profile Snapshot     (founder inputs vs JPM benchmarks)
       c. Structural Template         (Jacaranda Trace PLOM, §501c3 refunding,
                                       LIHTC §142 stack, ...)
       d. Deal-Killer Flags           (synthesized from a + b + state-level
                                       red flags + sponsor-track-record gaps)

  2. Gap-Filling Q&A — 5-10 targeted structured questions whose answers
     update the deal record and feed Stage 1.

The NAICS engine is deterministic; Bernard SUPPLEMENTS its output with a
short narrative per section but never overrides the engine. If Claude is
unavailable, the memo still returns — narration sections are templated
and the response is flagged with `_brainstorm_narration_pending: True`.

Persistence
-----------
Founder responses + status live on the `deals` row (see migration
004_intake_brainstorm.sql):
  intake_brainstorm_responses jsonb
  intake_brainstorm_status    text  (pending | brainstormed | greenlit | parked)
  intake_brainstorm_memo      jsonb
  intake_brainstorm_run_at    timestamptz

Lifecycle
---------
  run()              → status becomes "brainstormed"
  submit_responses() → no status change, answers persisted
  greenlight()       → status becomes "greenlit", returns handoff payload
  park()             → status becomes "parked"
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from services.naics_rules_engine import ENGINE as naics_engine
from services.database import db

try:
    # Claude is optional — service degrades gracefully if not configured.
    from agents._claude import complete as _claude_complete, ClaudeUnavailable
except Exception:  # pragma: no cover — defensive import
    _claude_complete = None

    class ClaudeUnavailable(RuntimeError):  # type: ignore[no-redef]
        pass


# =====================================================================
# JPM Credit Benchmarks
#
# Source: CLAUDE.md "JP Morgan Credit Benchmarks (hardcode these
# everywhere)" — A / BBB+ / BBB- / Sub-IG thresholds. Mirrors
# services/core.JPM but kept here as a self-contained dict so the
# brainstorm service has no surprise coupling to the credit-engine
# internals.
# =====================================================================
JPM_BENCHMARKS: dict[str, dict[str, float]] = {
    # grade: {dscr_min, cf_leverage_max, bs_leverage_max, ltv_max_pct, d_ebitda_max, icr_min}
    "A":    {"dscr": 2.00, "cf": 1.50, "bs": 2.00, "ltv": 55, "de": 4.5, "icr": 3.50},
    "BBB+": {"dscr": 1.75, "cf": 1.75, "bs": 2.25, "ltv": 62, "de": 5.5, "icr": 2.75},
    "BBB-": {"dscr": 1.50, "cf": 2.00, "bs": 2.50, "ltv": 70, "de": 6.5, "icr": 2.25},
}
SUB_IG_DSCR_THRESHOLD = 1.50  # any single breach = sub-investment grade

# =====================================================================
# Structural Template lookup — Bible Silo references per sector.
# Each entry names the canonical NEST blueprint structure for the sector
# (e.g., Jacaranda Trace PLOM for senior living conduit) plus the IRC /
# Bible reference. Bernard's narrative cites these by name.
# =====================================================================
STRUCTURAL_TEMPLATES: dict[str, dict[str, str]] = {
    "senior_living": {
        "name": "Jacaranda Trace PLOM",
        "summary": "Senior living conduit revenue bond — Series 2025, $231M, Florida LGFC.",
        "irc_anchor": "IRC §145 qualified 501(c)(3) bond, alternative §142(d) qualified residential rental",
        "bible_ref": "Bible Silo 6 §6.3 Senior Living Conduit; Appendix A row 3",
    },
    "healthcare_services": {
        "name": "501(c)(3) Hospital Refunding Stack",
        "summary": "Non-profit hospital revenue bond — qualified 501(c)(3) refunding under IRC §145.",
        "irc_anchor": "IRC §145 qualified 501(c)(3) bond",
        "bible_ref": "Bible Silo 6 §6.1 Healthcare Conduit; Appendix A row 1",
    },
    "charter_school": {
        "name": "Charter School Conduit Revenue Bond",
        "summary": "501(c)(3) qualified bond financing facility acquisition / construction.",
        "irc_anchor": "IRC §145 qualified 501(c)(3) bond",
        "bible_ref": "Bible Silo 6 §6.4 Education Conduit; Appendix A row 6",
    },
    "education_higher": {
        "name": "Higher-Ed Revenue Bond (Public or 501(c)(3))",
        "summary": "Public university revenue or 501(c)(3) private college conduit.",
        "irc_anchor": "IRC §103 governmental bond OR IRC §145 qualified 501(c)(3)",
        "bible_ref": "Bible Silo 6 §6.5 Higher Education; Appendix A row 7",
    },
    "affordable_housing": {
        "name": "LIHTC §142(d) Multifamily Stack",
        "summary": "Tax-exempt private activity bond paired with 4% LIHTC equity.",
        "irc_anchor": "IRC §142(d) qualified residential rental + §42 LIHTC",
        "bible_ref": "Bible Silo 6 §6.6 Affordable Multifamily; Appendix A rows 8-9",
    },
    "hospitality": {
        "name": "Taxable Hospitality Project Bond",
        "summary": "Taxable revenue bond — no IRS tax-exempt status available for hotels.",
        "irc_anchor": "Taxable corporate bond (Reg D / Rule 144A placement)",
        "bible_ref": "Bible Silo 6 §6.7 Hospitality; Appendix A row 10",
    },
    "data_center": {
        "name": "Data Center Project Finance Bond",
        "summary": "Taxable project finance with hyperscaler take-or-pay anchor lease.",
        "irc_anchor": "Taxable corporate bond, optional §501(c)(3) sleeve if research-anchored",
        "bible_ref": "Bible Silo 6 §6.8 Data Centers; Appendix A row 11",
    },
    "utilities_water": {
        "name": "Water/Sewer Revenue Bond",
        "summary": "Governmental utility revenue bond secured by ratepayer pledge.",
        "irc_anchor": "IRC §103 governmental bond",
        "bible_ref": "Bible Silo 6 §6.9 Utilities; Appendix A rows 13-14",
    },
    "utilities_sewage": {
        "name": "Water/Sewer Revenue Bond",
        "summary": "Governmental utility revenue bond secured by ratepayer pledge.",
        "irc_anchor": "IRC §103 governmental bond",
        "bible_ref": "Bible Silo 6 §6.9 Utilities; Appendix A row 13",
    },
    "utilities_power": {
        "name": "Electric Utility Revenue Bond",
        "summary": "Governmental or cooperative power revenue bond.",
        "irc_anchor": "IRC §103 governmental bond OR taxable cooperative",
        "bible_ref": "Bible Silo 6 §6.9 Utilities; Appendix A row 15",
    },
    "transportation_airport": {
        "name": "Airport Special Facility / GARB",
        "summary": "Governmental airport revenue bond or special facility bond.",
        "irc_anchor": "IRC §103 governmental bond, optional §142(a)(1) airport PAB",
        "bible_ref": "Bible Silo 6 §6.10 Transportation; Appendix A row 16",
    },
    "industrial_manufacturing": {
        "name": "Industrial Development Bond (IDB)",
        "summary": "Small-issue manufacturing IDB under IRC §144(a), $10M cap.",
        "irc_anchor": "IRC §144(a) small-issue IDB or taxable corporate",
        "bible_ref": "Bible Silo 6 §6.11 Industrial; Appendix A row 17",
    },
    "solid_waste": {
        "name": "Solid Waste Disposal Revenue Bond",
        "summary": "Qualified solid waste disposal facility bond under IRC §142(a)(6).",
        "irc_anchor": "IRC §142(a)(6) qualified solid waste",
        "bible_ref": "Bible Silo 6 §6.12 Environmental; Appendix A row 12",
    },
}


# =====================================================================
# Default gap-filling questions
# =====================================================================
DEFAULT_GAP_QUESTIONS: list[dict[str, Any]] = [
    {
        "id": "sponsor_track_record",
        "prompt": "Sponsor history — how many similar projects has the sponsor closed in the last 7 years, and what is the current portfolio AUM or unit count?",
        "field_type": "text",
        "why_we_ask": "First-time sponsors in regulated sectors get a deal-killer flag; track record drives rating committee.",
        "feeds_stage": "feeds Hawkeye dossier + Roots sponsor diligence",
    },
    {
        "id": "project_stage",
        "prompt": "Current project stage — pre-development, entitled, under construction, CO issued, or stabilized?",
        "field_type": "select",
        "options": ["pre_development", "entitled", "under_construction", "co_issued", "stabilized"],
        "why_we_ask": "Stage determines whether you need a feasibility study, market study, or audited financials.",
        "feeds_stage": "feeds Roots document checklist + Prometheus feasibility model",
    },
    {
        "id": "closing_window",
        "prompt": "Required commitment window — when do you need executed bond documents and what external deadline is driving the clock?",
        "field_type": "text",
        "why_we_ask": "Drives placement urgency and whether bridge financing is required.",
        "feeds_stage": "feeds Sterling placement scheduler",
    },
    {
        "id": "occupancy_or_co_status",
        "prompt": "If real assets — current occupancy %, CO date if applicable, and lease-up / absorption status.",
        "field_type": "text",
        "why_we_ask": "Stabilized vs construction radically changes capital structure (Series A LTC vs Series B HFT).",
        "feeds_stage": "feeds Atlas proforma + Maxwell credit grade",
    },
    {
        "id": "existing_debt",
        "prompt": "Existing debt outstanding — list any current bonds, mortgages, lines of credit, and balances. Include CUSIPs if known.",
        "field_type": "textarea",
        "why_we_ask": "Existing senior debt subordinates new bonds; refundings have call premiums.",
        "feeds_stage": "feeds EMMA refunding analysis + capital stack model",
    },
    {
        "id": "credit_enhancement_pref",
        "prompt": "Credit enhancement preference — will sponsor cash-collateralize, accept Hylant surety, post an LOC, or go standalone on native credit?",
        "field_type": "select",
        "options": ["cash_collateral", "surety", "loc", "bond_insurance", "standalone_native"],
        "why_we_ask": "Determines whether we engage Hylant, a money-center bank, or rating committee directly.",
        "feeds_stage": "feeds SuretyScout + Sentinel risk routing",
    },
    {
        "id": "special_legal_structure",
        "prompt": "Special legal structure — TIF, joint venture, 501(c)(3) parent guarantor, master indenture, ground lease? Note anything non-standard.",
        "field_type": "textarea",
        "why_we_ask": "Non-standard structures trigger bond counsel work and rating methodology overrides.",
        "feeds_stage": "feeds counterparty assignment (bond counsel) + Bible Silo 7",
    },
    {
        "id": "auditor_firm",
        "prompt": "Auditor / accounting firm currently engaged (for the OS opinion). Include partner name if known.",
        "field_type": "text",
        "why_we_ask": "Required for the official statement consent; Big-4 vs regional changes diligence depth.",
        "feeds_stage": "feeds counterparty assignment (auditor)",
    },
    {
        "id": "trustee_counsel_refunding",
        "prompt": "If this is a refunding — existing trustee, bond counsel, and disclosure counsel on the prior issue?",
        "field_type": "textarea",
        "why_we_ask": "Continuity counsel relationships shorten refunding execution by 4-6 weeks.",
        "feeds_stage": "feeds counterparty assignment + refunding workflow",
    },
    {
        "id": "biggest_risk_self_id",
        "prompt": "In one sentence — what is the single biggest risk in this deal and what is the mitigant the sponsor proposes?",
        "field_type": "textarea",
        "why_we_ask": "Sponsor's self-identified risk is the fastest signal for Sentinel's risk model.",
        "feeds_stage": "feeds Sentinel risk score + first-draft credit memo",
    },
]


# =====================================================================
# Service
# =====================================================================
class IntakeBrainstormService:
    """Bernard's post-Deal-Input, pre-Roots assessment surface."""

    # --- public API ---------------------------------------------------

    def run(self, deal_id: str) -> dict[str, Any]:
        """Generate the first-look memo + gap questions for a deal.

        Persists the memo to deals.intake_brainstorm_memo and flips
        status to 'brainstormed' so the next page-load returns the
        cached result instead of re-paying for Claude.
        """
        deal = self._load_deal(deal_id)
        if not deal:
            return {
                "deal_id": deal_id,
                "error": f"Deal {deal_id} not found",
                "first_look_memo": None,
                "gap_questions": [],
            }

        # Pull the inputs needed to drive the NAICS engine + JPM compare.
        intake = self._extract_intake(deal)

        # 1. Bond Type Assessment ------------------------------------------
        bond_type_assessment = self._bond_type_assessment(intake)

        # 2. Credit Profile Snapshot ----------------------------------------
        credit_snapshot = self._credit_profile_snapshot(intake)

        # 3. Structural Template -------------------------------------------
        structural_template = self._structural_template(
            sector=bond_type_assessment.get("sector"),
            eligible=bond_type_assessment.get("eligible_bond_types", []),
        )

        # 4. Deal-Killer Flags ---------------------------------------------
        deal_killer_flags = self._deal_killer_flags(
            intake=intake,
            bond_type_assessment=bond_type_assessment,
            credit_snapshot=credit_snapshot,
        )

        # Bernard narration (optional — falls back to template if Claude down).
        narration, narration_pending = self._bernard_narration(
            intake=intake,
            bond_type_assessment=bond_type_assessment,
            credit_snapshot=credit_snapshot,
            structural_template=structural_template,
            deal_killer_flags=deal_killer_flags,
        )

        memo = {
            "bond_type_assessment": bond_type_assessment,
            "credit_profile_snapshot": credit_snapshot,
            "structural_template": structural_template,
            "deal_killer_flags": deal_killer_flags,
            "narration": narration,
            "_brainstorm_narration_pending": narration_pending,
        }

        envelope: dict[str, Any] = {
            "deal_id": deal_id,
            "first_look_memo": memo,
            "gap_questions": DEFAULT_GAP_QUESTIONS,
            "generated_at": _now_iso(),
        }

        # Persist memo + flip status (best-effort; never crash the request).
        self._persist(deal_id, {
            "intake_brainstorm_memo": memo,
            "intake_brainstorm_status": "brainstormed",
            "intake_brainstorm_run_at": _now_iso(),
        })

        return envelope

    def submit_responses(
        self,
        deal_id: str,
        responses: dict[str, Any],
    ) -> dict[str, Any]:
        """Persist the founder's answers to the gap questions.

        Does NOT change brainstorm status — that only flips on
        greenlight() or park(). This lets the founder save partial
        answers and come back later.
        """
        deal = self._load_deal(deal_id)
        if not deal:
            return {"deal_id": deal_id, "saved": False, "error": "Deal not found"}

        # Merge with whatever's already in intake_brainstorm_responses.
        existing = deal.get("intake_brainstorm_responses") or {}
        if not isinstance(existing, dict):
            existing = {}
        merged = {**existing, **(responses or {})}

        ok = self._persist(deal_id, {
            "intake_brainstorm_responses": merged,
        })

        return {
            "deal_id": deal_id,
            "saved": bool(ok),
            "responses": merged,
            "saved_at": _now_iso(),
        }

    def greenlight(self, deal_id: str) -> dict[str, Any]:
        """Founder approves the deal — advance to Roots Stage 1.

        Returns a handoff payload the frontend can use to navigate to
        the next stage (currently /upload, the Roots ingestion page).
        """
        deal = self._load_deal(deal_id)
        if not deal:
            return {"deal_id": deal_id, "advanced": False, "error": "Deal not found"}

        self._persist(deal_id, {
            "intake_brainstorm_status": "greenlit",
            # Workflow advances to document_ingestion (Roots Stage 1).
            "status": "document_ingestion",
        })

        return {
            "deal_id": deal_id,
            "advanced": True,
            "next_stage": "roots_stage_1",
            "next_route": "/upload",
            "handoff": {
                "deal_id": deal_id,
                "sector": (deal.get("sector") or "") or None,
                "naics": (deal.get("naics_code") or "") or None,
                "structural_template": (
                    (deal.get("intake_brainstorm_memo") or {})
                    .get("structural_template", {})
                    .get("name")
                ),
                "gap_responses_count": len(deal.get("intake_brainstorm_responses") or {}),
            },
            "advanced_at": _now_iso(),
        }

    def park(self, deal_id: str) -> dict[str, Any]:
        """Founder parks the deal — saves answers, does NOT advance."""
        deal = self._load_deal(deal_id)
        if not deal:
            return {"deal_id": deal_id, "parked": False, "error": "Deal not found"}

        self._persist(deal_id, {
            "intake_brainstorm_status": "parked",
        })

        return {
            "deal_id": deal_id,
            "parked": True,
            "parked_at": _now_iso(),
        }

    # --- internals ----------------------------------------------------

    def _load_deal(self, deal_id: str) -> dict[str, Any] | None:
        if not db or not getattr(db, "configured", False):
            return None
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if not rows or not isinstance(rows, list):
            return None
        return rows[0]

    def _persist(self, deal_id: str, patch: dict[str, Any]) -> bool:
        if not db or not getattr(db, "configured", False):
            return False
        result = db.update("deals", {"id": f"eq.{deal_id}"}, patch)
        return result is not None

    def _extract_intake(self, deal: dict[str, Any]) -> dict[str, Any]:
        """Pull the fields needed for the brainstorm from the deal row.

        Tolerates missing fields. The DealInputPage does NOT currently
        capture DSCR / LTV / D/EBITDA / ICR — see "honest gaps" in the
        agent report. When absent the credit snapshot returns
        `_metric_unknown: True` per metric so the founder is prompted
        rather than silently passed.
        """
        notes = deal.get("notes") or {}
        if isinstance(notes, str):
            try:
                import json
                notes = json.loads(notes)
            except Exception:
                notes = {}
        project = notes.get("project") or {}
        sponsor = notes.get("sponsor") or {}

        return {
            "deal_id": deal.get("id"),
            "name": deal.get("name") or "",
            "naics_code": deal.get("naics_code") or project.get("naics") or "",
            "sector": deal.get("sector") or "",
            "state": deal.get("state") or project.get("state") or "",
            "deal_type": deal.get("deal_type") or "",
            "deal_size": float(deal.get("deal_size") or deal.get("bond_face") or 0),
            "borrower": deal.get("sponsor_name") or sponsor.get("name") or "",
            "sponsor_type": sponsor.get("type") or project.get("sponsor_type") or "",
            # Credit inputs (mostly missing from current DealInputPage)
            "dscr": float(deal.get("dscr") or 0),
            "ltv": float(deal.get("ltv") or 0),
            "cf_leverage": float(deal.get("cf_leverage") or 0),
            "bs_leverage": float(deal.get("bs_leverage") or 0),
            "d_ebitda": float(deal.get("d_ebitda") or 0),
            "icr": float(deal.get("icr") or 0),
        }

    def _bond_type_assessment(self, intake: dict[str, Any]) -> dict[str, Any]:
        """Wrap naics_rules_engine.lookup() with the intent inferred
        from the deal_type. Returns the engine result plus a UI-shaped
        `preferred` / `alternatives` split."""
        deal_intent = _deal_type_to_intent(intake.get("deal_type") or "")
        borrower_type = _sponsor_type_to_borrower_type(intake.get("sponsor_type") or "")

        engine_result = naics_engine.lookup(
            naics_code=intake.get("naics_code") or "",
            deal_intent=deal_intent,
            borrower_type=borrower_type,
            state=(intake.get("state") or "") or None,
        )

        eligible = engine_result.get("eligible_bond_types") or []
        preferred = [b for b in eligible if b.get("preferred") is True]
        ambiguous = [b for b in eligible if b.get("preferred") is None]
        alternatives = [b for b in eligible if b.get("preferred") is False]

        return {
            "naics_code": engine_result.get("naics_code"),
            "naics_label": engine_result.get("naics_label"),
            "sector": engine_result.get("sector"),
            "deal_intent": deal_intent,
            "borrower_type": borrower_type,
            "eligible_bond_types": eligible,
            "preferred": preferred,
            "ambiguous": ambiguous,
            "alternatives": alternatives,
            "feasibility_study_profile": engine_result.get("feasibility_study_profile") or {},
            "operating_framework_refs": engine_result.get("operating_framework_refs") or [],
            "engine_error": engine_result.get("error"),
        }

    def _credit_profile_snapshot(self, intake: dict[str, Any]) -> dict[str, Any]:
        """Compare founder's input numbers to each JPM grade row.

        For each metric returns a status string:
          - "unknown"    : founder didn't provide it
          - "pass"       : meets or beats threshold
          - "borderline" : within 10% of threshold on the wrong side
          - "fail"       : misses threshold
        Plus the suggested grade ceiling.
        """
        metrics: dict[str, dict[str, Any]] = {}
        for label, key, direction in [
            ("DSCR", "dscr", "higher_is_better"),
            ("CF Leverage", "cf_leverage", "lower_is_better"),
            ("BS Leverage", "bs_leverage", "lower_is_better"),
            ("LTV %", "ltv", "lower_is_better"),
            ("Debt / EBITDA", "d_ebitda", "lower_is_better"),
            ("ICR", "icr", "higher_is_better"),
        ]:
            value = intake.get(key, 0) or 0
            metrics[key] = self._compare_metric(label, value, key, direction)

        # Best achievable grade = highest grade where every metric passes.
        suggested_grade = self._infer_grade(intake)

        # Sub-IG breach flag — any DSCR < 1.50 is sub-investment grade.
        sub_ig_breach = (
            intake.get("dscr") and intake.get("dscr") > 0 and intake.get("dscr") < SUB_IG_DSCR_THRESHOLD
        )

        return {
            "benchmarks": JPM_BENCHMARKS,
            "founder_inputs": {
                "dscr": intake.get("dscr"),
                "cf_leverage": intake.get("cf_leverage"),
                "bs_leverage": intake.get("bs_leverage"),
                "ltv": intake.get("ltv"),
                "d_ebitda": intake.get("d_ebitda"),
                "icr": intake.get("icr"),
            },
            "metrics": metrics,
            "suggested_grade": suggested_grade,
            "sub_ig_breach": bool(sub_ig_breach),
            "source": "CLAUDE.md JP Morgan Credit Benchmarks",
        }

    def _compare_metric(
        self,
        label: str,
        value: float,
        key: str,
        direction: str,
    ) -> dict[str, Any]:
        if not value:
            return {
                "label": label,
                "value": None,
                "status": "unknown",
                "note": "Not yet captured at Deal Input — gap-fill in Q&A.",
                "_metric_unknown": True,
            }

        # For each grade, get the threshold and check pass/borderline/fail.
        grade_results: dict[str, str] = {}
        for grade, thresholds in JPM_BENCHMARKS.items():
            threshold = thresholds.get(_metric_key_to_threshold_key(key))
            if threshold is None:
                grade_results[grade] = "unknown"
                continue
            if direction == "higher_is_better":
                if value >= threshold:
                    grade_results[grade] = "pass"
                elif value >= threshold * 0.90:
                    grade_results[grade] = "borderline"
                else:
                    grade_results[grade] = "fail"
            else:  # lower_is_better
                if value <= threshold:
                    grade_results[grade] = "pass"
                elif value <= threshold * 1.10:
                    grade_results[grade] = "borderline"
                else:
                    grade_results[grade] = "fail"

        # Overall status = best grade where this metric passes.
        if grade_results.get("A") == "pass":
            overall = "pass"
        elif "pass" in grade_results.values():
            overall = "pass"
        elif "borderline" in grade_results.values():
            overall = "borderline"
        else:
            overall = "fail"

        return {
            "label": label,
            "value": value,
            "status": overall,
            "per_grade": grade_results,
        }

    def _infer_grade(self, intake: dict[str, Any]) -> str | None:
        """Walk grades A → BBB+ → BBB- and return the best one where
        every captured metric passes. Returns None if metrics are
        missing entirely."""
        if not any(intake.get(k) for k in ("dscr", "ltv", "icr", "d_ebitda")):
            return None
        for grade, thresholds in JPM_BENCHMARKS.items():
            ok = True
            if intake.get("dscr") and intake["dscr"] < thresholds["dscr"]:
                ok = False
            if intake.get("ltv") and intake["ltv"] > thresholds["ltv"]:
                ok = False
            if intake.get("icr") and intake["icr"] < thresholds["icr"]:
                ok = False
            if intake.get("d_ebitda") and intake["d_ebitda"] > thresholds["de"]:
                ok = False
            if ok:
                return grade
        return "Sub-IG"

    def _structural_template(
        self,
        sector: str | None,
        eligible: list[dict[str, Any]],
    ) -> dict[str, Any]:
        template = STRUCTURAL_TEMPLATES.get(sector or "") or {
            "name": "Generic Revenue Bond Template",
            "summary": "No sector-specific NEST blueprint registered — defaulting to taxable revenue bond structure.",
            "irc_anchor": "Taxable corporate bond",
            "bible_ref": "Bible Silo 6 — generic conduit reference",
        }

        # Surface the engine's preferred bond type as the template anchor.
        anchor_bond_type = None
        anchor_rationale = None
        for b in eligible:
            if b.get("preferred") is True:
                anchor_bond_type = b.get("type")
                anchor_rationale = b.get("rationale")
                break

        return {
            **template,
            "anchor_bond_type": anchor_bond_type,
            "anchor_rationale": anchor_rationale,
        }

    def _deal_killer_flags(
        self,
        intake: dict[str, Any],
        bond_type_assessment: dict[str, Any],
        credit_snapshot: dict[str, Any],
    ) -> list[dict[str, Any]]:
        flags: list[dict[str, Any]] = []

        # (a) NAICS-engine errors / no eligible bond type
        if bond_type_assessment.get("engine_error"):
            flags.append({
                "severity": "high",
                "category": "sector_restriction",
                "message": bond_type_assessment["engine_error"],
                "source": "naics_rules_engine",
            })
        elif not bond_type_assessment.get("eligible_bond_types"):
            flags.append({
                "severity": "high",
                "category": "sector_restriction",
                "message": (
                    f"No eligible bond type for sector={bond_type_assessment.get('sector')} "
                    f"+ deal_intent={bond_type_assessment.get('deal_intent')} "
                    f"+ borrower_type={bond_type_assessment.get('borrower_type')}. "
                    "Re-confirm the deal intent and sponsor entity type before proceeding."
                ),
                "source": "naics_rules_engine",
            })

        if bond_type_assessment.get("ambiguous"):
            flags.append({
                "severity": "medium",
                "category": "structural_ambiguity",
                "message": (
                    "Multiple Operating Framework Appendix A rows match — bond type is "
                    "ambiguous. Bond counsel guidance required before placement."
                ),
                "source": "naics_rules_engine",
            })

        # (b) Credit-profile fails
        if credit_snapshot.get("sub_ig_breach"):
            flags.append({
                "severity": "high",
                "category": "credit_profile",
                "message": (
                    f"DSCR {intake.get('dscr')} is below 1.50 — sub-investment grade. "
                    "Credit enhancement (surety, LOC, cash collateral) required to reach IG."
                ),
                "source": "JPM benchmarks (CLAUDE.md)",
            })
        metrics = credit_snapshot.get("metrics", {})
        for key, m in metrics.items():
            if m.get("status") == "fail":
                flags.append({
                    "severity": "medium",
                    "category": "credit_profile",
                    "message": (
                        f"{m['label']} = {m['value']} fails every JPM grade band. "
                        "Will not clear rating committee without restructuring."
                    ),
                    "source": "JPM benchmarks (CLAUDE.md)",
                })

        # (c) State-level red flags — narrow list of regulatory friction states.
        state = (intake.get("state") or "").upper()
        if state in {"PR", "VI", "GU"}:
            flags.append({
                "severity": "medium",
                "category": "state_regulatory",
                "message": f"Issuer in U.S. territory {state} — secondary market liquidity will be limited.",
                "source": "intake_brainstorm",
            })
        if state == "CA" and bond_type_assessment.get("sector") == "charter_school":
            flags.append({
                "severity": "low",
                "category": "state_regulatory",
                "message": "CA charter school sector under elevated scrutiny — flag for Sentinel deep diligence.",
                "source": "intake_brainstorm",
            })

        # (d) First-time sponsor pattern (heuristic — refined by gap-fill answer)
        if not intake.get("borrower"):
            flags.append({
                "severity": "low",
                "category": "sponsor_track_record",
                "message": "Borrower / obligor name not captured — Hawkeye cannot dossier without it.",
                "source": "intake_brainstorm",
            })

        # (e) Feasibility study required but no audited financials path
        feas = bond_type_assessment.get("feasibility_study_profile") or {}
        if feas.get("required"):
            flags.append({
                "severity": "low",
                "category": "diligence_requirement",
                "message": (
                    "Feasibility study required for this sector + deal intent. "
                    "Budget 10-14 weeks and engage a Bible §2.14 consultant before Roots."
                ),
                "source": "naics_rules_engine + Bible §2.14",
            })

        return flags

    def _bernard_narration(
        self,
        intake: dict[str, Any],
        bond_type_assessment: dict[str, Any],
        credit_snapshot: dict[str, Any],
        structural_template: dict[str, Any],
        deal_killer_flags: list[dict[str, Any]],
    ) -> tuple[dict[str, str], bool]:
        """Ask Claude for a 2-3 sentence narrative per memo section.

        Falls back to deterministic templates if Claude is unavailable.
        Returns (narration_dict, narration_pending_flag).
        """
        # Build a deterministic fallback up front — we use it if Claude
        # is missing OR if the call errors. Bernard's job is to
        # SUPPLEMENT, never to override (ADR-0002).
        fallback = {
            "bond_type_assessment": (
                f"NAICS {bond_type_assessment.get('naics_code') or '—'} maps to sector "
                f"{bond_type_assessment.get('sector') or '—'}. The Operating Framework "
                f"Appendix A returns "
                f"{len(bond_type_assessment.get('eligible_bond_types') or [])} eligible bond type(s)."
            ),
            "credit_profile_snapshot": (
                "Founder inputs compared to the JPM credit benchmark grid (CLAUDE.md). "
                f"Suggested grade ceiling: {credit_snapshot.get('suggested_grade') or 'unknown'}."
            ),
            "structural_template": (
                f"Recommended template: {structural_template.get('name')}. "
                f"{structural_template.get('summary')} {structural_template.get('bible_ref')}."
            ),
            "deal_killer_flags": (
                f"{len(deal_killer_flags)} flag(s) raised. "
                "Founder should resolve all 'high' severity flags before greenlighting to Roots."
            ),
        }

        if _claude_complete is None:
            return fallback, True

        prompt = (
            "You are Bernard, CEO of NEST Advisors. Produce four 2-sentence narrative "
            "paragraphs supplementing a deterministic NAICS rules-engine output and "
            "JPM credit benchmark compare. Lead with the conclusion, no hedging.\n\n"
            f"Deal: {intake.get('name')} — borrower {intake.get('borrower')}, "
            f"sector {intake.get('sector')}, NAICS {intake.get('naics_code')}, "
            f"state {intake.get('state')}, size ${intake.get('deal_size'):,.0f}.\n\n"
            f"Bond type assessment: {bond_type_assessment.get('preferred')}\n"
            f"Credit snapshot suggested grade: {credit_snapshot.get('suggested_grade')}\n"
            f"Structural template: {structural_template.get('name')}\n"
            f"Deal-killer flags ({len(deal_killer_flags)}): "
            f"{[f['message'] for f in deal_killer_flags]}\n\n"
            "Return JSON with four keys: bond_type_assessment, credit_profile_snapshot, "
            "structural_template, deal_killer_flags. Each value is a single string of "
            "1-3 sentences. Cite Jacaranda Trace PLOM if relevant. No preamble."
        )
        system = (
            "You are Bernard, the CEO of NEST Advisors. Tone: Jimmy Lee — direct, "
            "decisive, no hedging. Banned words: may, might, could, potentially, "
            "approximately, it seems. Output: a single JSON object, nothing else."
        )

        try:
            raw = _claude_complete(system, prompt, max_tokens=1024)
        except ClaudeUnavailable:
            return fallback, True
        except Exception:
            return fallback, True

        import json as _json
        import re as _re
        # Tolerate fenced ```json blocks.
        match = _re.search(r"\{[\s\S]*\}", raw or "")
        if not match:
            return fallback, True
        try:
            parsed = _json.loads(match.group(0))
        except Exception:
            return fallback, True

        # Validate the four expected keys; fall back to template for any
        # missing sections.
        out = dict(fallback)
        for key in fallback.keys():
            if isinstance(parsed.get(key), str) and parsed[key].strip():
                out[key] = parsed[key].strip()
        return out, False


# =====================================================================
# Helpers
# =====================================================================
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _deal_type_to_intent(deal_type: str) -> str:
    """Map DealInputPage's deal_type to the NAICS engine's deal_intent
    vocabulary. The engine expects: new_construction | expansion |
    repositioning | acquisition | refunding | working_capital |
    equipment | stabilized_refi.
    """
    mapping = {
        "construction": "new_construction",
        "ma_acquisition": "acquisition",
        "real_estate": "acquisition",
        "refunding": "refunding",
        "equipment": "equipment",
        "working_capital": "working_capital",
        "bridge": "acquisition",
        "mezzanine": "acquisition",
        "equity_raise": "acquisition",
        "ci_lending": "working_capital",
        "general_advisory": "acquisition",
    }
    return mapping.get(deal_type, "acquisition")


def _sponsor_type_to_borrower_type(sponsor_type: str) -> str:
    """DealInputPage sponsor_type → NAICS engine borrower_type.

    Engine vocabulary: corporate | nonprofit_501c3 | governmental |
    public_authority | tribal.
    """
    mapping = {
        "pe_firm": "corporate",
        "family_office": "corporate",
        "strategic_acquirer": "corporate",
        "nonprofit": "nonprofit_501c3",
        "government": "governmental",
        "developer": "corporate",
    }
    return mapping.get(sponsor_type, "corporate")


def _metric_key_to_threshold_key(metric_key: str) -> str:
    """Translate intake metric keys to JPM_BENCHMARKS keys."""
    return {
        "dscr": "dscr",
        "cf_leverage": "cf",
        "bs_leverage": "bs",
        "ltv": "ltv",
        "d_ebitda": "de",
        "icr": "icr",
    }.get(metric_key, metric_key)


# Module-level singleton — same pattern as naics_rules_engine.ENGINE.
SERVICE = IntakeBrainstormService()
