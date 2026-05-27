"""
Document Readiness Tracker — Tracks what's received and what's missing per deal stage.

Wires document uploads to the deal pipeline. Every deal moves through
five stages (intake → underwriting → structuring → credit_committee → closing),
and each stage requires specific documents. This tracker:

1. Maintains the full checklist per stage
2. Auto-classifies uploads by filename + content hints
3. Records receipts and computes readiness scores
4. Tells Bernard exactly what to ask for next

Feeds: preflight_engine.py, credit_memo, bond_desk, Bernard orchestrator.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any


# ── Required Documents by Deal Stage ────────────────────────────

REQUIRED_DOCS: dict[str, list[dict]] = {
    "intake": [
        {"doc": "executive_summary", "description": "Deal overview, sponsor background, capital request", "required": True},
        {"doc": "financial_statements", "description": "3 years audited financial statements", "required": True, "years": 3},
        {"doc": "sponsor_resume", "description": "Key principal background and experience", "required": True},
    ],
    "underwriting": [
        {"doc": "feasibility_study", "description": "Independent accountant examination report with 5yr projections", "required": True},
        {"doc": "appraisal", "description": "MAI-certified appraisal, less than 12 months old", "required": True},
        {"doc": "rent_roll", "description": "Current rent roll or unit occupancy report", "required": True},
        {"doc": "unit_mix", "description": "Unit configuration with SF, pricing, and status", "required": True},
        {"doc": "operating_budget", "description": "Current year operating budget", "required": True},
        {"doc": "capital_budget", "description": "5-year capital expenditure plan", "required": True},
        {"doc": "construction_budget", "description": "Detailed construction cost estimate by trade", "required_if": "construction"},
        {"doc": "environmental_report", "description": "Phase I ESA, Phase II if triggered", "required": True},
        {"doc": "title_report", "description": "Preliminary title commitment", "required": True},
        {"doc": "survey", "description": "ALTA/NSPS survey", "required": True},
        {"doc": "insurance_schedule", "description": "Current insurance coverage schedule", "required": True},
    ],
    "structuring": [
        {"doc": "sources_and_uses", "description": "Detailed sources and uses of bond proceeds", "required": True},
        {"doc": "bond_counsel_opinion", "description": "Tax-exempt opinion from bond counsel", "required": True},
        {"doc": "trust_indenture", "description": "Draft trust indenture/bond resolution", "required": True},
        {"doc": "official_statement", "description": "Preliminary official statement (POS)", "required": True},
        {"doc": "continuing_disclosure", "description": "Continuing disclosure agreement", "required": True},
        {"doc": "management_agreement", "description": "Property management agreement", "required": True},
        {"doc": "ground_lease", "description": "Ground lease or deed", "required_if": "leasehold"},
        {"doc": "regulatory_approvals", "description": "State licensing, CON, zoning approvals", "required": True},
    ],
    "credit_committee": [
        {"doc": "credit_memo", "description": "Internal credit memorandum with recommendation", "required": True},
        {"doc": "rating_letter", "description": "Rating agency letter or assessment", "required": True},
        {"doc": "surety_commitment", "description": "Hylant surety commitment letter", "required_if": "surety_enhanced"},
        {"doc": "lc_commitment", "description": "Letter of credit commitment", "required_if": "lc_enhanced"},
    ],
    "closing": [
        {"doc": "final_official_statement", "description": "Final official statement", "required": True},
        {"doc": "closing_certificates", "description": "Officer certificates, incumbency, no-litigation", "required": True},
        {"doc": "legal_opinions", "description": "All required legal opinions", "required": True},
        {"doc": "insurance_binder", "description": "Insurance binder with bond trustee as additional insured", "required": True},
    ],
}

STAGE_ORDER = ["intake", "underwriting", "structuring", "credit_committee", "closing"]

# ── Filename → Doc Type Patterns ────────────────────────────────

_FILENAME_PATTERNS: list[tuple[str, str]] = [
    # intake
    (r"exec.*summ|deal.*overview|capital.*request", "executive_summary"),
    (r"financ.*state|audit.*report|annual.*report|balance.*sheet|income.*state", "financial_statements"),
    (r"sponsor.*resume|principal.*bio|cv.*sponsor|key.*person", "sponsor_resume"),
    # underwriting
    (r"feasib.*stud|examination.*report|5.?yr.*proj|five.?year.*proj", "feasibility_study"),
    (r"apprais|mai.*cert|property.*val", "appraisal"),
    (r"rent.*roll|occupancy.*report|unit.*census", "rent_roll"),
    (r"unit.*mix|floor.*plan.*summ|unit.*config", "unit_mix"),
    (r"operat.*budget|annual.*budget|current.*budget", "operating_budget"),
    (r"capital.*budget|cap.*ex.*plan|5.?yr.*capital|capex", "capital_budget"),
    (r"construct.*budget|cost.*estimate|trade.*break|hard.*cost", "construction_budget"),
    (r"environ.*report|phase.*[i1].*esa|phase.*[i1]$|environmental", "environmental_report"),
    (r"title.*report|title.*commit|prelim.*title", "title_report"),
    (r"survey|alta.*nsps|boundary.*survey", "survey"),
    (r"insurance.*sched|coverage.*sched|insurance.*cert", "insurance_schedule"),
    # structuring
    (r"source.*use|s.*&.*u|bond.*proceed", "sources_and_uses"),
    (r"bond.*counsel|tax.*exempt.*opinion|tax.*opinion", "bond_counsel_opinion"),
    (r"trust.*indent|bond.*resolut|indenture", "trust_indenture"),
    (r"official.*state|pos$|preliminary.*os", "official_statement"),
    (r"continu.*disclos|cda$|annual.*filing", "continuing_disclosure"),
    (r"manage.*agree|prop.*manage|management.*contract", "management_agreement"),
    (r"ground.*lease|lease.*agree|deed$", "ground_lease"),
    (r"regulat.*approv|zon.*approv|con$|license.*cert|certificate.*need", "regulatory_approvals"),
    # credit_committee
    (r"credit.*memo|internal.*memo|underwriting.*memo", "credit_memo"),
    (r"rating.*letter|rating.*assess|s&p|moody|fitch|kroll", "rating_letter"),
    (r"surety.*commit|hylant.*commit|surety.*bond", "surety_commitment"),
    (r"letter.*credit|lc.*commit|loc.*commit", "lc_commitment"),
    # closing
    (r"final.*official.*state|final.*os|fos$", "final_official_statement"),
    (r"closing.*cert|officer.*cert|incumbency|no.*litig", "closing_certificates"),
    (r"legal.*opinion|counsel.*opinion|bond.*opinion", "legal_opinions"),
    (r"insurance.*bind|binder|bond.*trustee.*insur", "insurance_binder"),
]

_CONTENT_PATTERNS: list[tuple[str, str]] = [
    (r"independent.*auditor|report.*on.*financial.*statements|gaap", "financial_statements"),
    (r"appraised.*value|market.*value.*conclusion|highest.*best.*use", "appraisal"),
    (r"feasibility.*examination|projected.*revenue|independent.*accountant", "feasibility_study"),
    (r"sources.*and.*uses|use.*of.*proceeds|bond.*proceeds", "sources_and_uses"),
    (r"rent.*roll|unit.*number.*tenant.*rent|occupancy.*schedule", "rent_roll"),
    (r"phase.*i.*environmental|recognized.*environmental.*condition", "environmental_report"),
    (r"credit.*memorandum|recommendation.*to.*committee|credit.*analysis", "credit_memo"),
    (r"preliminary.*official.*statement|in.*connection.*with.*the.*offering", "official_statement"),
    (r"trust.*indenture|bond.*resolution|pledge.*agreement", "trust_indenture"),
    (r"continuing.*disclosure|annual.*report.*filing|material.*event", "continuing_disclosure"),
    (r"surety.*bond|performance.*guarantee|hylant", "surety_commitment"),
    (r"certificate.*of.*need|state.*licensing|zoning.*approval", "regulatory_approvals"),
]

# All known doc type keys for validation
_ALL_DOC_TYPES: set[str] = set()
for _stage_docs in REQUIRED_DOCS.values():
    for _d in _stage_docs:
        _ALL_DOC_TYPES.add(_d["doc"])


class DocReadinessTracker:
    """Tracks document readiness for deals across all pipeline stages."""

    def __init__(self):
        # deal_id → {doc_type: {received_at, metadata, filename, ...}}
        self._received: dict[str, dict[str, dict]] = {}

    # ── Public API ──────────────────────────────────────────────

    def get_checklist(self, deal: dict) -> dict:
        """Full checklist with status per doc and completeness % per stage.

        Args:
            deal: Deal dict with at minimum 'id'. May include 'deal_type',
                  'enhancement_type', 'land_tenure' for conditional logic.

        Returns:
            {
                "deal_id": str,
                "stages": {
                    "intake": {
                        "docs": [{"doc": ..., "status": "received"|"pending"|"not_applicable", ...}],
                        "complete_pct": float,
                        "received": int,
                        "required": int,
                    },
                    ...
                },
                "overall_pct": float,
                "generated_at": str,
            }
        """
        deal_id = deal.get("id", "unknown")
        deal_received = self._received.get(deal_id, {})

        stages_out = {}
        total_required = 0
        total_received = 0

        for stage in STAGE_ORDER:
            docs_spec = REQUIRED_DOCS.get(stage, [])
            stage_docs = []
            stage_required = 0
            stage_received = 0

            for spec in docs_spec:
                doc_type = spec["doc"]
                status = self._resolve_status(spec, deal, deal_received)

                entry = {
                    "doc": doc_type,
                    "description": spec["description"],
                    "status": status,
                }

                if status == "received":
                    entry["received_at"] = deal_received[doc_type].get("received_at")
                    entry["filename"] = deal_received[doc_type].get("filename")

                if status != "not_applicable":
                    stage_required += 1
                    if status == "received":
                        stage_received += 1

                stage_docs.append(entry)

            complete_pct = round((stage_received / stage_required * 100) if stage_required > 0 else 0, 1)
            stages_out[stage] = {
                "docs": stage_docs,
                "complete_pct": complete_pct,
                "received": stage_received,
                "required": stage_required,
            }
            total_required += stage_required
            total_received += stage_received

        overall_pct = round((total_received / total_required * 100) if total_required > 0 else 0, 1)

        return {
            "deal_id": deal_id,
            "stages": stages_out,
            "overall_pct": overall_pct,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def classify_document(self, filename: str, content_hints: str = "") -> str:
        """Auto-classify an uploaded document by filename and content.

        Args:
            filename: Original filename of the upload.
            content_hints: First ~500 chars or extracted text for content matching.

        Returns:
            Doc type key (e.g., 'appraisal', 'financial_statements') or 'unknown'.
        """
        name_lower = filename.lower().replace("_", " ").replace("-", " ")

        # Try filename patterns first — most reliable
        for pattern, doc_type in _FILENAME_PATTERNS:
            if re.search(pattern, name_lower):
                return doc_type

        # Fall back to content-based classification
        if content_hints:
            hints_lower = content_hints.lower()
            for pattern, doc_type in _CONTENT_PATTERNS:
                if re.search(pattern, hints_lower):
                    return doc_type

        return "unknown"

    def receive_document(self, deal_id: str, doc_type: str, metadata: dict) -> dict:
        """Record a document as received.

        Args:
            deal_id: Deal identifier.
            doc_type: Document type key (must be in REQUIRED_DOCS).
            metadata: Arbitrary metadata — filename, file_size, uploaded_by, etc.

        Returns:
            {
                "deal_id": str,
                "doc_type": str,
                "status": "received",
                "received_at": str,
                "is_known_type": bool,
                "stage": str | None,
                "metadata": dict,
            }
        """
        if deal_id not in self._received:
            self._received[deal_id] = {}

        now = datetime.now(timezone.utc).isoformat()
        record = {
            "received_at": now,
            **metadata,
        }
        self._received[deal_id][doc_type] = record

        # Find which stage this doc belongs to
        stage = self._find_stage(doc_type)
        is_known = doc_type in _ALL_DOC_TYPES

        return {
            "deal_id": deal_id,
            "doc_type": doc_type,
            "status": "received",
            "received_at": now,
            "is_known_type": is_known,
            "stage": stage,
            "metadata": metadata,
        }

    def get_readiness_score(self, deal_id: str, deal: dict | None = None) -> dict:
        """Compute 0-100 readiness score with next-steps list.

        Args:
            deal_id: Deal identifier.
            deal: Optional deal dict for conditional doc logic.

        Returns:
            {
                "deal_id": str,
                "score": int,
                "grade": str,
                "stage_scores": {stage: int, ...},
                "next_steps": [{"priority": int, "action": str, "stage": str, "doc": str}, ...],
                "blockers": [str, ...],
            }
        """
        if deal is None:
            deal = {"id": deal_id}
        elif "id" not in deal:
            deal["id"] = deal_id

        checklist = self.get_checklist(deal)
        deal_received = self._received.get(deal_id, {})

        # Stage weights — earlier stages matter more for forward progress
        stage_weights = {
            "intake": 25,
            "underwriting": 30,
            "structuring": 20,
            "credit_committee": 15,
            "closing": 10,
        }

        weighted_score = 0.0
        stage_scores = {}
        next_steps = []
        blockers = []
        priority_counter = 0

        for stage in STAGE_ORDER:
            stage_data = checklist["stages"][stage]
            pct = stage_data["complete_pct"]
            stage_scores[stage] = round(pct)
            weighted_score += (pct / 100.0) * stage_weights[stage]

            # Build next steps from pending docs
            for doc_entry in stage_data["docs"]:
                if doc_entry["status"] == "pending":
                    priority_counter += 1
                    next_steps.append({
                        "priority": priority_counter,
                        "action": f"Obtain {doc_entry['description']}",
                        "stage": stage,
                        "doc": doc_entry["doc"],
                    })

            # If intake is incomplete, everything downstream is blocked
            if stage == "intake" and pct < 100:
                blockers.append("Intake documents incomplete — cannot advance to underwriting")

        score = round(weighted_score)

        # Grade based on score
        if score >= 90:
            grade = "Ready"
        elif score >= 70:
            grade = "Near-Ready"
        elif score >= 40:
            grade = "In Progress"
        else:
            grade = "Early Stage"

        return {
            "deal_id": deal_id,
            "score": score,
            "grade": grade,
            "stage_scores": stage_scores,
            "next_steps": next_steps[:10],  # Top 10 priorities
            "blockers": blockers,
        }

    def get_missing_docs(self, deal_id: str, stage: str | None = None, deal: dict | None = None) -> list[dict]:
        """Return list of missing documents, optionally filtered by stage.

        Args:
            deal_id: Deal identifier.
            stage: If set, only return missing docs for that stage.
            deal: Optional deal dict for conditional logic.

        Returns:
            [{"doc": str, "description": str, "stage": str}, ...]
        """
        if deal is None:
            deal = {"id": deal_id}
        elif "id" not in deal:
            deal["id"] = deal_id

        checklist = self.get_checklist(deal)
        missing = []

        stages_to_check = [stage] if stage and stage in STAGE_ORDER else STAGE_ORDER

        for s in stages_to_check:
            stage_data = checklist["stages"].get(s)
            if not stage_data:
                continue
            for doc_entry in stage_data["docs"]:
                if doc_entry["status"] == "pending":
                    missing.append({
                        "doc": doc_entry["doc"],
                        "description": doc_entry["description"],
                        "stage": s,
                    })

        return missing

    # ── Internal Helpers ────────────────────────────────────────

    def _resolve_status(self, spec: dict, deal: dict, received: dict) -> str:
        """Determine doc status: received / pending / not_applicable."""
        doc_type = spec["doc"]

        # Check conditional requirements
        condition = spec.get("required_if")
        if condition:
            if not self._condition_met(condition, deal):
                return "not_applicable"

        # Check if received
        if doc_type in received:
            return "received"

        return "pending"

    @staticmethod
    def _condition_met(condition: str, deal: dict) -> bool:
        """Evaluate a conditional requirement against deal attributes."""
        deal_type = deal.get("deal_type", "")
        enhancement = deal.get("enhancement_type", "")
        land_tenure = deal.get("land_tenure", "")
        flags = deal.get("flags", [])

        condition_map = {
            "construction": deal_type in ("construction", "new_construction", "substantial_rehab"),
            "leasehold": land_tenure == "leasehold",
            "surety_enhanced": enhancement in ("surety", "hybrid") or "surety" in flags,
            "lc_enhanced": enhancement in ("lc", "hybrid") or "lc" in flags,
        }
        return condition_map.get(condition, False)

    @staticmethod
    def _find_stage(doc_type: str) -> str | None:
        """Find which stage a doc_type belongs to."""
        for stage, docs in REQUIRED_DOCS.items():
            for spec in docs:
                if spec["doc"] == doc_type:
                    return stage
        return None
