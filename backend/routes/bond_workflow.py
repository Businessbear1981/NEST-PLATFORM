"""
NEST Bond Workflow Routes — Master orchestration for the BondCommandCenter.
Tracks deal readiness across all 4 pillars (EagleEye, Roots, Bond Desk, Hawkeye).
Persists to Supabase bond_workflows + bond_workflow_checklists tables after each write.
"""
from flask import Blueprint, jsonify, request
from services.auth import require_auth
from datetime import datetime
import threading
import json

bond_workflow_bp = Blueprint("bond_workflow", __name__)

_workflows: dict = {}
_lock = threading.Lock()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _db():
    try:
        from services.database import db as _d
        if _d and _d.configured:
            return _d
    except Exception:
        pass
    return None


def _persist(deal_id: str, wf: dict):
    """Upsert workflow to Supabase bond_workflows. Fails silently."""
    d = _db()
    if not d:
        return
    try:
        d.upsert("bond_workflows", {
            "deal_id": deal_id,
            "deal_type": wf.get("dealType", "Development"),
            "current_phase": wf.get("phase", "sourcing"),
            "overall_readiness_score": wf.get("overallReadinessScore", 0),
            "ai_evaluation_summary": wf.get("pillarScores", {}),
            "tranche_structure": wf.get("capitalStack", []),
        }, on_conflict="deal_id")
    except Exception:
        pass


def _load_supabase(deal_id: str) -> dict | None:
    """Return workflow dict hydrated from Supabase, or None."""
    d = _db()
    if not d:
        return None
    try:
        rows = d.select("bond_workflows", {"deal_id": f"eq.{deal_id}"})
        if not rows:
            return None
        row = rows[0]
        ai_summary = row.get("ai_evaluation_summary") or {}
        if isinstance(ai_summary, str):
            try:
                ai_summary = json.loads(ai_summary)
            except Exception:
                ai_summary = {}
        return {
            "id": row.get("id"),
            "dealId": deal_id,
            "dealType": row.get("deal_type", "Development"),
            "phase": row.get("current_phase", "sourcing"),
            "overallReadinessScore": float(row.get("overall_readiness_score") or 0),
            "pillarScores": ai_summary if isinstance(ai_summary, dict) else {},
            "checklist": [],
            "events": [],
            "createdAt": row.get("created_at", datetime.utcnow().isoformat()),
            "updatedAt": row.get("updated_at", datetime.utcnow().isoformat()),
        }
    except Exception:
        return None


def _get_or_create_workflow(deal_id: str) -> dict:
    # 1. In-memory cache
    with _lock:
        if deal_id in _workflows:
            return _workflows[deal_id]

    # 2. Supabase
    from_db = _load_supabase(deal_id)
    if from_db:
        with _lock:
            _workflows[deal_id] = from_db
        return from_db

    # 3. Derive from deals table
    d = _db()
    deal = None
    if d:
        try:
            rows = d.select("deals", {"id": f"eq.{deal_id}"})
            if rows:
                deal = rows[0]
        except Exception:
            pass

    if deal:
        readiness  = float(deal.get("readiness_score", 0))
        dscr       = float(deal.get("dscr", 0))
        ltv        = float(deal.get("ltv", 0))
        bond_face  = float(deal.get("bond_face", 0))

        checklist = deal.get("checklist", [])
        if isinstance(checklist, str):
            try:
                checklist = json.loads(checklist)
            except Exception:
                checklist = []
        if isinstance(checklist, dict):
            checklist = [{"label": k, "done": v} for k, v in checklist.items()]

        eagle_score = min(100, 40 + (10 if bond_face > 50_000_000 else 0))
        roots_score = int(readiness)
        bond_score  = min(100, int(dscr * 30) + (20 if ltv < 70 else 0))
        hawk_score  = min(100, 20 + (30 if dscr > 1.5 else 0))
        phase       = ("structuring" if readiness > 60
                       else "readiness" if readiness > 30
                       else "sourcing")
        overall     = int((eagle_score + roots_score + bond_score + hawk_score) / 4)

        wf = {
            "dealId":   deal_id,
            "dealName": deal.get("name", ""),
            "dealType": deal.get("deal_type", "Development"),
            "phase":    phase,
            "overallReadinessScore": overall,
            "pillarScores": {
                "eagleeye": eagle_score,
                "roots":    roots_score,
                "bondDesk": bond_score,
                "hawkeye":  hawk_score,
            },
            "dealMetrics": {
                "bondFace":    bond_face,
                "dscr":        dscr,
                "ltv":         ltv,
                "state":       deal.get("state"),
                "market":      deal.get("market"),
                "aeEconomics": float(deal.get("ae_economics", 0)),
            },
            "capitalStack":    deal.get("capital_stack", []),
            "stressScenarios": deal.get("stress_scenarios", []),
            "sourcesUses":     deal.get("sources_uses", []),
            "checklist":       checklist,
            "events":          [],
            "aiAssessment": (
                f"Deal {deal.get('name','')} — "
                f"${bond_face/1e6:.0f}M {deal.get('state','')} | "
                f"DSCR {dscr}x | LTV {ltv}% | Readiness {int(readiness)}%"
            ),
            "createdAt": deal.get("created_at", datetime.utcnow().isoformat()),
            "updatedAt": deal.get("updated_at", datetime.utcnow().isoformat()),
        }
    else:
        wf = {
            "dealId":   deal_id,
            "dealType": "Development",
            "phase":    "sourcing",
            "overallReadinessScore": 0,
            "pillarScores": {"eagleeye": 0, "roots": 0, "bondDesk": 0, "hawkeye": 0},
            "checklist": [],
            "events":    [],
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        }

    with _lock:
        _workflows[deal_id] = wf
    _persist(deal_id, wf)
    return wf


# ── ROUTES ───────────────────────────────────────────────────────────────────

@bond_workflow_bp.route("/deal/<deal_id>", methods=["GET"])
def get_by_deal(deal_id):
    return _ok(_get_or_create_workflow(deal_id))


@bond_workflow_bp.route("/deal/<deal_id>/run-evaluation", methods=["POST"])
@require_auth()
def run_full_ai_evaluation(deal_id):
    """Run full AI evaluation across all pillars — updates readiness score + persists."""
    wf = _get_or_create_workflow(deal_id)

    checklist = wf.get("checklist", [])
    completed = sum(1 for c in checklist if c.get("completed"))
    roots_score = int(completed / max(len(checklist), 1) * 100) if checklist else 30

    eagleeye_score = min(100, len(wf.get("events", [])) * 15 + 25)
    bond_score     = 40 if wf.get("phase") in ("structuring", "placed") else 20
    hawkeye_score  = 15

    # Claude qualitative assessment
    ai_note = ""
    try:
        from services.ai_router import plugin_hub
        result = plugin_hub.route(
            "risk_assessment",
            f"Evaluate bond readiness for deal {deal_id}. "
            f"EagleEye sourcing: {eagleeye_score}/100, "
            f"Roots docs: {roots_score}/100, "
            f"Structuring: {bond_score}/100, "
            f"Placement: {hawkeye_score}/100. "
            f"Give a 2-sentence institutional assessment.",
        )
        ai_note = result.get("content", "") if result.get("success") else ""
    except Exception:
        pass

    overall = int(
        eagleeye_score * 0.20 +
        roots_score    * 0.35 +
        bond_score     * 0.30 +
        hawkeye_score  * 0.15
    )

    with _lock:
        wf["pillarScores"] = {
            "eagleeye": eagleeye_score,
            "roots":    roots_score,
            "bondDesk": bond_score,
            "hawkeye":  hawkeye_score,
        }
        wf["overallReadinessScore"] = overall
        wf["aiAssessment"]          = ai_note
        wf["updatedAt"]             = datetime.utcnow().isoformat()
        wf["events"].append({
            "type":      "ai_evaluation",
            "score":     overall,
            "timestamp": datetime.utcnow().isoformat(),
        })

    _persist(deal_id, wf)
    return _ok(wf)


@bond_workflow_bp.route("/deal/<deal_id>/checklist", methods=["POST"])
@require_auth()
def update_checklist(deal_id):
    """Add a new checklist item or toggle an existing one."""
    b  = request.get_json() or {}
    wf = _get_or_create_workflow(deal_id)

    item_id = b.get("itemId")
    if item_id:
        with _lock:
            for item in wf["checklist"]:
                if item.get("id") == item_id:
                    item["completed"] = not item.get("completed", False)
                    item["completedAt"] = datetime.utcnow().isoformat() if item["completed"] else None
                    break
    else:
        with _lock:
            wf["checklist"].append({
                "id":        f"chk_{len(wf['checklist']) + 1}",
                "label":     b.get("label", "Untitled item"),
                "category":  b.get("category", "general"),
                "completed": False,
                "required":  b.get("required", True),
            })

    _persist(deal_id, wf)
    return _ok(wf)


@bond_workflow_bp.route("/deal/<deal_id>/checklists", methods=["GET"])
def get_checklists(deal_id):
    """Return checklist items from Supabase bond_workflow_checklists for this deal."""
    d = _db()
    if d:
        try:
            # Resolve workflow id first
            wf_rows = d.select("bond_workflows", {"deal_id": f"eq.{deal_id}"})
            if wf_rows:
                wf_id = wf_rows[0]["id"]
                items = d.select("bond_workflow_checklists", {"workflow_id": f"eq.{wf_id}"})
                return _ok(items or [])
        except Exception:
            pass
    # Fall back to in-memory
    wf = _get_or_create_workflow(deal_id)
    return _ok(wf.get("checklist", []))


@bond_workflow_bp.route("/checklists/<checklist_id>", methods=["PATCH"])
@require_auth()
def patch_checklist_item(checklist_id):
    """Update a single checklist item in Supabase bond_workflow_checklists."""
    b = request.get_json() or {}
    d = _db()
    if d:
        try:
            patch = {}
            if "completed" in b:
                patch["completed"]    = b["completed"]
                patch["completed_at"] = datetime.utcnow().isoformat() if b["completed"] else None
            if "notes" in b:
                patch["notes"] = b["notes"]
            if "uploaded_doc_url" in b:
                patch["uploaded_doc_url"] = b["uploaded_doc_url"]
            if patch:
                d.update("bond_workflow_checklists", patch, {"id": f"eq.{checklist_id}"})
            rows = d.select("bond_workflow_checklists", {"id": f"eq.{checklist_id}"})
            return _ok(rows[0] if rows else {})
        except Exception as e:
            return _err(str(e), 500)
    return _err("Database unavailable", 503)


# ── BIBLE PIPELINE — 10-step NEST data chain ─────────────────────────────────
# Source: docs/project_nest_data_pipeline.md + Sean's mandate 2026-06-14
# Each phase OUTPUT is the next phase INPUT. Nothing works in isolation.
PIPELINE_PHASES = [
    {
        "id": "ingestion", "phase_num": 1,
        "label": "Document Ingestion",
        "description": "Parse financials from uploaded docs (tax returns, P&L, balance sheet, appraisal, feasibility study)",
        "pillar": "roots", "agent": "Roots",
        "output": "raw financial numbers (NOI, revenue, expenses, assets, liabilities, debt service)",
        "gate_fields": ["uploaded_docs", "parsed_financials", "noi_raw"],
    },
    {
        "id": "spreads", "phase_num": 2,
        "label": "Financial Spreading (RMA)",
        "description": "RMA benchmark comparison, financial spreading",
        "pillar": "roots", "agent": "Maxwell",
        "output": "spread analysis (industry comparison, trend analysis, normalized EBITDA)",
        "gate_fields": ["noi_normalized", "ebitda_spread", "rma_benchmark"],
    },
    {
        "id": "ratios", "phase_num": 3,
        "label": "Credit Ratios",
        "description": "Credit metric computation via Maxwell engine using JP Morgan thresholds",
        "pillar": "roots", "agent": "Maxwell",
        "output": "DSCR, LTV, CF leverage, BS leverage, D/EBITDA, ICR, obligor grade",
        "gate_fields": ["dscr", "ltv", "icr", "obligor_grade"],
    },
    {
        "id": "memo", "phase_num": 4,
        "label": "Credit Memo",
        "description": "AI-generated institutional credit memo — Morgan agent, Jimmy Lee tone",
        "pillar": "bond_desk", "agent": "Morgan",
        "output": "formatted credit memo with narrative, risk factors, recommendation",
        "gate_fields": ["credit_memo_draft", "risk_factors", "recommendation"],
    },
    {
        "id": "structure", "phase_num": 5,
        "label": "Bond Structuring",
        "description": "Tranches, capital stack, sources & uses — Series A/B split",
        "pillar": "bond_desk", "agent": "Atlas",
        "output": "Series A/B split, coupon rates, LTC%, capital stack, S&U table",
        "gate_fields": ["capital_structure", "series_a_coupon", "sources_uses"],
    },
    {
        "id": "surety", "phase_num": 6,
        "label": "Surety & LC (Hylant)",
        "description": "Insurance/surety package preparation for Hylant submission",
        "pillar": "bond_desk", "agent": "SuretyScout",
        "output": "3C scoring (Character/Capacity/Capital), LC recommendation, premium estimate",
        "gate_fields": ["surety_tier", "lc_amount", "hylant_submission"],
    },
    {
        "id": "grading", "phase_num": 7,
        "label": "Rating Intelligence",
        "description": "S&P / Moody's estimation via mirror agents — zero direct API cost",
        "pillar": "bond_desk", "agent": "Maxwell",
        "output": "estimated rating, rating factors, enhancement recommendations",
        "gate_fields": ["indicative_rating", "moodys_estimate", "sp_estimate"],
    },
    {
        "id": "bond_desk", "phase_num": 8,
        "label": "Bond Desk & Stress Testing",
        "description": "Live monitoring, stress testing, call/put analysis via FRED live rates",
        "pillar": "bond_desk", "agent": "Vector",
        "output": "stress scenarios, Vector call/put signals, refi triggers",
        "gate_fields": ["stress_scenarios", "call_put_signal", "refi_trigger"],
    },
    {
        "id": "monitoring", "phase_num": 9,
        "label": "Call/Put Monitoring",
        "description": "Ongoing surveillance — Vector + Apex agents, covenant compliance",
        "pillar": "hawkeye", "agent": "Apex",
        "output": "execute/hold/alert recommendations, covenant compliance status",
        "gate_fields": ["covenant_compliance", "vector_signal", "apex_position"],
    },
    {
        "id": "placement", "phase_num": 10,
        "label": "Investor Placement",
        "description": "Investor matching, teasers, book building — Hawkeye + Sterling",
        "pillar": "hawkeye", "agent": "Sterling",
        "output": "matched investors, AI teasers, order book, allocation",
        "gate_fields": ["order_book_covered", "teasers_sent", "allocation_complete"],
    },
]

_PHASE_INDEX = {p["id"]: i for i, p in enumerate(PIPELINE_PHASES)}


@bond_workflow_bp.route("/phases", methods=["GET"])
def get_pipeline_phases():
    """Return the canonical NEST 10-step data pipeline phase definitions."""
    return _ok(PIPELINE_PHASES)


@bond_workflow_bp.route("/deal/<deal_id>/phase-status", methods=["GET"])
def get_phase_status(deal_id):
    """Return current pipeline position + gate status for a deal."""
    wf = _get_or_create_workflow(deal_id)
    current_phase = wf.get("phase", "ingestion")

    idx = _PHASE_INDEX.get(current_phase, 0)
    phase_def = PIPELINE_PHASES[idx] if idx < len(PIPELINE_PHASES) else PIPELINE_PHASES[0]
    next_phase = PIPELINE_PHASES[idx + 1] if idx + 1 < len(PIPELINE_PHASES) else None
    completed  = PIPELINE_PHASES[:idx]

    return _ok({
        "current_phase":     current_phase,
        "current_phase_num": phase_def["phase_num"],
        "current_phase_def": phase_def,
        "next_phase":        next_phase,
        "completed_phases":  completed,
        "pipeline_total":    len(PIPELINE_PHASES),
        "pct_complete":      round((idx / len(PIPELINE_PHASES)) * 100, 1),
    })


@bond_workflow_bp.route("/deal/<deal_id>/advance-phase", methods=["POST"])
@require_auth()
def advance_phase(deal_id):
    """Advance deal to the next Bible pipeline phase."""
    wf = _get_or_create_workflow(deal_id)
    current = wf.get("phase", "ingestion")
    idx = _PHASE_INDEX.get(current, 0)

    if idx >= len(PIPELINE_PHASES) - 1:
        return _ok({**wf, "_message": "Deal is at final pipeline phase (placement)"})

    next_phase = PIPELINE_PHASES[idx + 1]
    with _lock:
        wf["phase"]     = next_phase["id"]
        wf["updatedAt"] = datetime.utcnow().isoformat()
        wf["events"].append({
            "type":      "phase_advance",
            "from":      current,
            "to":        next_phase["id"],
            "timestamp": datetime.utcnow().isoformat(),
        })
    _persist(deal_id, wf)
    return _ok(wf)


@bond_workflow_bp.route("/deal/<deal_id>/green-bond-check", methods=["POST"])
def green_bond_check(deal_id):
    """
    Evaluate green bond eligibility using NAICS + project attributes.
    No auth required — public intelligence.
    """
    b = request.get_json() or {}
    naics        = str(b.get("naics_code", ""))
    project_type = str(b.get("project_type", ""))
    energy_eff   = bool(b.get("energy_efficiency", False))
    water_mgmt   = bool(b.get("water_management", False))
    community    = bool(b.get("community_impact", False))
    emissions    = bool(b.get("emissions_tracking", False))

    GREEN_NAICS = {
        "2211": "Renewable Energy",
        "2212": "Hydroelectric Power",
        "4911": "Solar Development",
        "6231": "Senior Housing (Energy-Efficient)",
        "6232": "CCRC / Assisted Living (Green Certified)",
        "6233": "Community Housing",
        "8011": "Healthcare Facilities",
        "9211": "Government / Public Infrastructure",
    }
    GREEN_TYPES = {
        "renewable_energy", "sustainable_housing", "healthcare",
        "clean_water", "green_building", "ccrc", "senior_housing",
    }
    CERT_PATHS = {
        "CBI":    {"body": "Climate Bonds Initiative",   "timeline_months": 3, "cost_usd": 25000},
        "ICMA":   {"body": "ICMA Green Bond Principles", "timeline_months": 1, "cost_usd": 0},
        "EU_GBF": {"body": "EU Green Bond Framework",    "timeline_months": 6, "cost_usd": 50000},
    }

    base_eligible = naics in GREEN_NAICS or project_type.lower() in GREEN_TYPES
    score = sum([energy_eff, water_mgmt, community, emissions]) * 25

    eligible     = base_eligible and score >= 50
    cert_key     = "CBI" if score >= 75 else ("ICMA" if score >= 50 else None)
    sector_label = GREEN_NAICS.get(naics, "General")

    use_of_proceeds = []
    if energy_eff:   use_of_proceeds.append("Energy Efficiency")
    if water_mgmt:   use_of_proceeds.append("Water Management")
    if community:    use_of_proceeds.append("Social & Community Impact")
    if emissions:    use_of_proceeds.append("Climate Change Mitigation")

    checklist = [
        {"item": "NAICS sector qualifies as green",          "met": bool(naics in GREEN_NAICS)},
        {"item": "Project type in approved use-of-proceeds", "met": bool(project_type.lower() in GREEN_TYPES)},
        {"item": "Energy efficiency measures documented",    "met": energy_eff},
        {"item": "Water management plan in place",           "met": water_mgmt},
        {"item": "Community impact statement",               "met": community},
        {"item": "Emissions tracking & reporting",           "met": emissions},
        {"item": "Third-party verifier engaged",             "met": False},
        {"item": "Green bond framework published",           "met": False},
    ]

    return _ok({
        "eligible":               eligible,
        "score":                  score,
        "sector_label":           sector_label,
        "recommended_cert":       cert_key,
        "cert_detail":            CERT_PATHS.get(cert_key) if cert_key else None,
        "premium_bps_reduction":  10 if eligible else 0,
        "eligible_use_of_proceeds": use_of_proceeds,
        "checklist":              checklist,
    })


@bond_workflow_bp.route("/deal/<deal_id>/full-automation", methods=["POST"])
def full_automation(deal_id):
    """
    POST /api/bond-workflow/deal/<deal_id>/full-automation
    Runs the complete NEST intelligence stack on a deal:
      1. Pulls deal metrics from DB
      2. Runs S&P OPBA scoring with live self-learning weights
      3. Generates all bond type × par × amortization options
      4. Calls Claude for a 3-sentence Jimmy Lee structure recommendation
      5. Saves results + advances phase to 'structure'
    No auth required — callable from the Bond Desk Command Center.
    """
    from services.bond_type_engine import generate_all_bond_options, sp_opba_score
    from services.self_learning_engine import get_weights

    # Pull deal
    d    = _db()
    deal = None
    if d:
        try:
            rows = d.select("deals", {"id": f"eq.{deal_id}"})
            if rows:
                deal = rows[0]
        except Exception:
            pass

    # Build deal_data dict — fall back to request body
    body = request.get_json(silent=True) or {}
    deal_data = {
        "noi":            float((deal or {}).get("noi") or body.get("noi") or 0),
        "dscr":           float((deal or {}).get("dscr") or body.get("dscr") or 1.35),
        "ltv":            float((deal or {}).get("ltv") or body.get("ltv") or 70),
        "bond_face":      float((deal or {}).get("bond_face") or body.get("bond_face") or 0),
        "green_bond":     bool((deal or {}).get("green_bond") or body.get("green_bond", False)),
        "liquidity_ratio": float(body.get("liquidity_ratio") or 0.80),
        "naics_code":     str((deal or {}).get("naics_code") or body.get("naics_code") or ""),
        "borrower_type":  str((deal or {}).get("borrower_type") or body.get("borrower_type") or ""),
    }

    weights = get_weights()
    result  = generate_all_bond_options(deal_data, weights=weights)

    # Claude 3-sentence recommendation (Jimmy Lee tone)
    ai_rec = ""
    try:
        from services.ai_router import plugin_hub
        top = result["recommendations"][0] if result["recommendations"] else {}
        prompt = (
            f"You are Morgan, NEST bond structuring advisor. Jimmy Lee tone — direct, decisive.\n"
            f"Deal: DSCR {deal_data['dscr']}x, LTV {deal_data['ltv']}%, NOI ${deal_data['noi']:,.0f}.\n"
            f"OPBA score: {result['opba']['opba_score']}/12 → {result['opba']['indicative_rating']} indicative.\n"
            f"Top recommendation: {top.get('bond_type','—')} at {top.get('par_label','—')}, "
            f"{top.get('coupon_pct','—')}% coupon, {top.get('amortization','—')}.\n"
            f"Three sentences max. Lead with the rating target. No hedging."
        )
        r = plugin_hub.route("credit_memo", prompt)
        if r and r.get("success"):
            ai_rec = r.get("content", "")
    except Exception:
        pass

    # Advance phase → structure
    wf = _get_or_create_workflow(deal_id)
    with _lock:
        wf["phase"]     = "structure"
        wf["updatedAt"] = datetime.utcnow().isoformat()
        wf["events"].append({
            "type":      "full_automation",
            "opba":      result["opba"]["opba_score"],
            "options":   result["total_options"],
            "timestamp": datetime.utcnow().isoformat(),
        })
    _persist(deal_id, wf)

    return _ok({
        **result,
        "ai_recommendation": ai_rec,
        "weights_version":   weights.get("version", 1),
        "phase_advanced_to": "structure",
    })


@bond_workflow_bp.route("/deal/<deal_id>/bond-options", methods=["GET"])
def bond_options(deal_id):
    """GET /api/bond-workflow/deal/<deal_id>/bond-options — cached bond option matrix."""
    from services.bond_type_engine import generate_all_bond_options
    from services.self_learning_engine import get_weights

    d    = _db()
    deal = {}
    if d:
        try:
            rows = d.select("deals", {"id": f"eq.{deal_id}"})
            if rows:
                deal = rows[0]
        except Exception:
            pass

    result = generate_all_bond_options(deal, weights=get_weights())
    return _ok(result)


@bond_workflow_bp.route("/opba", methods=["POST"])
def opba_score():
    """
    POST /api/bond-workflow/opba
    Run S&P OPBA score on arbitrary deal metrics. No auth, no deal required.
    Body: {dscr, leverage, liquidity, qualitative}
    """
    from services.bond_type_engine import sp_opba_score
    from services.self_learning_engine import get_weights
    b = request.get_json(silent=True) or {}
    result = sp_opba_score(
        dscr=float(b.get("dscr", 1.35)),
        leverage=float(b.get("leverage", 3.5)),
        liquidity=float(b.get("liquidity", 0.80)),
        qualitative=float(b.get("qualitative", 0.0)),
        weights=get_weights(),
    )
    return _ok(result)


@bond_workflow_bp.route("/deal/<deal_id>/phase", methods=["PATCH"])
@require_auth()
def update_phase(deal_id):
    b  = request.get_json() or {}
    wf = _get_or_create_workflow(deal_id)
    new_phase = b.get("phase")
    valid = [
        # Bible pipeline phases
        "ingestion", "spreads", "ratios", "memo",
        "structure", "surety", "grading", "bond_desk", "monitoring", "placement",
        # Legacy phases (backwards compat)
        "sourcing", "readiness", "structuring", "placed", "closed",
    ]
    if new_phase not in valid:
        return _err(f"Invalid phase. Must be one of: {valid}")
    with _lock:
        wf["phase"]     = new_phase
        wf["updatedAt"] = datetime.utcnow().isoformat()
        wf["events"].append({
            "type":      "phase_change",
            "phase":     new_phase,
            "timestamp": datetime.utcnow().isoformat(),
        })
    _persist(deal_id, wf)
    return _ok(wf)
