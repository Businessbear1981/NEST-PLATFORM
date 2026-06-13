"""Bond grading, project audit, and bond optimization routes."""
import threading
import uuid as _uuid
from flask import Blueprint, jsonify, request
from datetime import datetime
from services.auth import require_auth

bond_tools_bp = Blueprint("bond_tools", __name__)

# ── In-memory pipeline store (seeded with NEST live deals) ────────
_pipeline_lock = threading.RLock()
_pipeline: list = []


def _seed_pipeline():
    """Seed the pipeline with the 3 NEST live deals."""
    return [
        {
            "id": "jacaranda-001",
            "deal_name": "Jacaranda Trace",
            "borrower": "Soparrow Capital / Arden Edge Capital",
            "state": "FL",
            "sector": "senior_living",
            "par_amount": 231_000_000,
            "coupon_rate": 5.75,
            "maturity_years": 30,
            "rating_moodys": "Baa1",
            "rating_sp": "BBB+",
            "status": "active",
            "stage": "structuring",
            "enhancement": "surety",
            "enhancement_provider": "Hylant Insurance",
            "dscr": 1.82,
            "ltv": 55.8,
            "created_at": datetime.utcnow().isoformat(),
            # Fields for DealPipelineDashboard kanban
            "name": "Jacaranda Trace",
            "sponsor": "Soparrow Capital",
            "total_project_cost_usd": 231_000_000,
            "stabilized_noi_usd": 18_500_000,
            "appraised_value_usd": 277_200_000,
            "use_of_proceeds": "Ground-up senior living — 364-unit IL/AL/MC campus",
            "phase": "structuring",
            "grade": "BBB+",
            "assignedPartners": ["Moody's", "Hylant"],
            "lastActivity": "Series 2025 — $231M LGFC placement",
        },
        {
            "id": "stpete-002",
            "deal_name": "St. Pete Construction",
            "borrower": "Arden Edge Capital",
            "state": "FL",
            "sector": "multifamily",
            "par_amount": 172_500_000,
            "coupon_rate": 6.25,
            "maturity_years": 10,
            "rating_moodys": "",
            "rating_sp": "BBB",
            "status": "active",
            "stage": "structuring",
            "enhancement": "surety",
            "enhancement_provider": "Hylant Insurance",
            "dscr": 1.65,
            "ltv": 62.0,
            "created_at": datetime.utcnow().isoformat(),
            # Fields for DealPipelineDashboard kanban
            "name": "St. Pete Construction",
            "sponsor": "Arden Edge Capital",
            "total_project_cost_usd": 172_500_000,
            "stabilized_noi_usd": 14_200_000,
            "appraised_value_usd": 207_000_000,
            "use_of_proceeds": "Ground-up multifamily construction — St. Petersburg FL",
            "phase": "structuring",
            "grade": "BBB",
            "assignedPartners": ["Hylant"],
            "lastActivity": "$172.5M construction bond — structuring phase",
        },
        {
            "id": "hbo2-003",
            "deal_name": "HBO2 Equity",
            "borrower": "Arden Edge Capital",
            "state": "TX",
            "sector": "mixed_use",
            "par_amount": 155_000_000,
            "coupon_rate": 7.5,
            "maturity_years": 7,
            "rating_moodys": "",
            "rating_sp": "BB+",
            "status": "active",
            "stage": "placement",
            "enhancement": "self-collateralized",
            "enhancement_provider": "",
            "dscr": 1.52,
            "ltv": 68.5,
            "created_at": datetime.utcnow().isoformat(),
            # Fields for DealPipelineDashboard kanban
            "name": "HBO2 Equity",
            "sponsor": "Arden Edge Capital",
            "total_project_cost_usd": 155_000_000,
            "stabilized_noi_usd": 12_800_000,
            "appraised_value_usd": 186_000_000,
            "use_of_proceeds": "Mixed-use equity raise — Texas",
            "phase": "placement",
            "grade": "BB+",
            "assignedPartners": ["Hawkeye"],
            "lastActivity": "$155M equity — BD outreach active",
        },
    ]


with _pipeline_lock:
    _pipeline = _seed_pipeline()


def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


# ── Root handler ──────────────────────────────────────────────

@bond_tools_bp.route("/", methods=["GET"])
def bond_tools_root():
    """GET /api/bond-tools — pipeline summary + available tool endpoints."""
    with _pipeline_lock:
        pipeline = list(_pipeline)

    active = [d for d in pipeline if d.get("status") == "active"]
    structuring = [d for d in pipeline if d.get("stage") == "structuring"]
    placement = [d for d in pipeline if d.get("stage") == "placement"]
    total_par = sum(d.get("par_amount", 0) for d in pipeline)

    return _ok({
        "summary": "NEST Bond Desk — structuring, grading & optimization engine",
        "pipeline": {
            "total_deals": len(pipeline),
            "active": len(active),
            "structuring": len(structuring),
            "placement": len(placement),
            "total_par_usd": total_par,
        },
        "deals": pipeline,
        "endpoints": {
            "pipeline": "/api/bond-tools/pipeline",
            "grade": "/api/bond-tools/grade",
            "audit": "/api/bond-tools/audit",
            "optimize": "/api/bond-tools/optimize",
            "stress_rates": "/api/bond-tools/stress/rates",
        },
    })


# ── Bond Grading ────────────────────────────────────────────────

@bond_tools_bp.route("/grade", methods=["POST"])
def grade_bond():
    """Grade a bond structure and identify rating."""
    body = request.get_json() or {}
    from services.bond_grader import bond_grader
    result = bond_grader.grade_bond(
        deal_data=body.get("deal", {}),
        bond_data=body.get("bond", {}),
        credit_metrics=body.get("credit_metrics", {}),
    )
    return _ok(result)


@bond_tools_bp.route("/grade/criteria", methods=["GET"])
def rating_criteria():
    """List S&P-aligned rating criteria."""
    from services.bond_grader import RATING_CRITERIA
    return _ok(RATING_CRITERIA)


@bond_tools_bp.route("/grade/enhancements", methods=["GET"])
def structural_enhancements():
    """List available structural enhancements and their impact."""
    from services.bond_grader import STRUCTURAL_ENHANCEMENTS
    return _ok(STRUCTURAL_ENHANCEMENTS)


# ── Project Audit ───────────────────────────────────────────────

@bond_tools_bp.route("/audit", methods=["POST"])
def audit_deal():
    """Run full project audit."""
    body = request.get_json() or {}
    from agents.auditor import auditor
    result = auditor.audit_deal(
        deal=body.get("deal", {}),
        bond=body.get("bond"),
        checklist=body.get("checklist"),
        credit_metrics=body.get("credit_metrics"),
    )
    return _ok(result)


@bond_tools_bp.route("/audit/report", methods=["POST"])
def audit_report():
    """Generate formatted audit report."""
    body = request.get_json() or {}
    from agents.auditor import auditor
    audit_result = body.get("audit_result", {})
    report = auditor.generate_audit_report(audit_result)
    return _ok({"report": report})


# ── Bond Optimization ──────────────────────────────────────────

@bond_tools_bp.route("/optimize", methods=["POST"])
def optimize_bond():
    """Run bond optimization analysis."""
    body = request.get_json() or {}
    from agents.bond_optimizer import bond_optimizer
    result = bond_optimizer.optimize(
        deal_data=body.get("deal", {}),
        bond_data=body.get("bond", {}),
        market_signals=body.get("market_signals", {}),
    )
    return _ok(result)


@bond_tools_bp.route("/optimize/call-analysis", methods=["POST"])
def call_analysis():
    """Analyze whether to execute a bond call."""
    body = request.get_json() or {}
    from agents.bond_optimizer import bond_optimizer
    result = bond_optimizer.analyze_call_opportunity(
        bond_data=body.get("bond", {}),
        market_signals=body.get("market_signals", {}),
        project_schedule=body.get("project_schedule", {}),
    )
    return _ok(result)


@bond_tools_bp.route("/optimize/new-issuance", methods=["POST"])
def new_issuance():
    """Calculate new bond issuance with fee schedule."""
    body = request.get_json() or {}
    from agents.bond_optimizer import bond_optimizer
    result = bond_optimizer.calculate_new_issuance(body)
    return _ok(result)


@bond_tools_bp.route("/optimize/savings", methods=["POST"])
def savings_analysis():
    """Calculate savings from a call/refi action."""
    body = request.get_json() or {}
    from agents.bond_optimizer import bond_optimizer
    result = bond_optimizer.calculate_savings(
        current_bond=body.get("current_bond", {}),
        proposed_terms=body.get("proposed_terms", {}),
    )
    return _ok(result)


# ── Live Stress Test Rates ────────────────────────────────────

@bond_tools_bp.route("/stress/rates", methods=["GET"])
def stress_test_rates():
    """Live rates formatted for Bond Desk stress testing engine."""
    try:
        from services.data_connectors import FREDPlugin
        fred = FREDPlugin()
        snapshot = fred.get_bond_desk_snapshot()
        rates = snapshot.get("rates", {})
    except Exception:
        rates = {"treasury_10yr": 4.28, "treasury_5yr": 4.05, "sofr": 5.33, "fed_funds": 5.33}

    base_10yr = rates.get("treasury_10yr", 4.28)
    return _ok({
        "base_rates": rates,
        "source": snapshot.get("source", "static"),
        "stress_scenarios": {
            "base": {"treasury_10yr": base_10yr, "label": "Current market"},
            "rates_up_100": {"treasury_10yr": base_10yr + 1.0, "label": "+100bps shock"},
            "rates_up_200": {"treasury_10yr": base_10yr + 2.0, "label": "+200bps shock"},
            "rates_down_100": {"treasury_10yr": max(0, base_10yr - 1.0), "label": "-100bps relief"},
            "spread_widen": {"ig_spread_bps": rates.get("ig_spread", 1.12) * 100 + 50, "label": "Spread widening +50bps"},
        },
    })


# ── Bond Desk Pipeline ─────────────────────────────────────────

@bond_tools_bp.route("/pipeline", methods=["GET"])
def bond_desk_pipeline():
    """Return the Bond Desk deal pipeline (seeded with NEST live deals).

    No auth required so the frontend Bond Desk module renders without
    needing a valid session cookie.
    """
    status = request.args.get("status")
    stage = request.args.get("stage")
    with _pipeline_lock:
        result = list(_pipeline)
    if status:
        result = [d for d in result if d.get("status") == status]
    if stage:
        result = [d for d in result if d.get("stage") == stage]
    return _ok(result)


@bond_tools_bp.route("/pipeline/<deal_id>", methods=["GET"])
def bond_desk_pipeline_deal(deal_id):
    """Return a single pipeline deal by id."""
    with _pipeline_lock:
        match = next((d for d in _pipeline if d["id"] == deal_id), None)
    if not match:
        return _err("Deal not found", 404)
    return _ok(match)
