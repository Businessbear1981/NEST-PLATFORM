"""
Covenant package API — returns live covenant packages for tracked bond issues.
Seeded with Jacaranda Trace Series 2025 ($231M, Florida LGFC).
"""
from datetime import datetime
from flask import Blueprint, jsonify, request

covenants_bp = Blueprint("covenants", __name__)

JACARANDA_PACKAGE = {
    "id": "cov-001",
    "deal_name": "Jacaranda Trace Senior Living",
    "cusip": "34077EAA1",
    "par_amount": 231_000_000,
    "series": "Series 2025",
    "issuer": "Florida Local Government Finance Commission",
    "state": "FL",
    "sector": "senior_living",
    "covenants": {
        "dscr_threshold": 1.20,
        "dscr_current": 1.42,
        "dscr_status": "PASSING",
        "cushion_pct": round((1.42 / 1.20 - 1) * 100, 1),
        "additional_bonds_test": "1.20x historical",
        "additional_bonds_status": "PASSING",
        "restricted_payments": "standard",
        "distribution_trap": 1.10,
        "distribution_trap_status": "PASSING",
        "rate_covenant": "100% of annual debt service",
        "rate_covenant_status": "PASSING",
    },
    "reserves": {
        "dsrf_required": 15_500_000,
        "dsrf_actual": 15_500_000,
        "dsrf_funded_pct": 100.0,
        "dsrf_status": "FUNDED",
        "operating_reserve": 4_800_000,
        "cap_i_reserve": 28_000_000,
        "repair_replacement_reserve": 1_155_000,
    },
    "debt_service": {
        "annual_principal": 3_200_000,
        "annual_interest": 15_015_000,
        "total_annual_ds": 18_215_000,
        "noi_ttm": 25_865_300,
        "dscr_ttm": 1.42,
        "next_payment_date": "2026-07-01",
        "next_payment_amount": 9_107_500,
    },
    "compliance_items": [
        {
            "covenant": "DSCR",
            "threshold": "1.20x minimum",
            "current": "1.42x",
            "status": "PASSING",
            "cushion_pct": 18.3,
        },
        {
            "covenant": "Additional Bonds Test",
            "threshold": "1.20x historical DSCR",
            "current": "No additional debt issued",
            "status": "PASSING",
            "cushion_pct": None,
        },
        {
            "covenant": "Distribution Trap",
            "threshold": "1.10x triggers trap",
            "current": "1.42x",
            "status": "PASSING",
            "cushion_pct": 29.1,
        },
        {
            "covenant": "Rate Covenant",
            "threshold": "100% of annual debt service",
            "current": "142% of annual debt service",
            "status": "PASSING",
            "cushion_pct": 42.0,
        },
        {
            "covenant": "DSRF Funding",
            "threshold": "$15,500,000",
            "current": "$15,500,000",
            "status": "FUNDED",
            "cushion_pct": 0.0,
        },
        {
            "covenant": "Operating Reserve",
            "threshold": "90 days operating expenses",
            "current": "$4,800,000 — 94 days",
            "status": "PASSING",
            "cushion_pct": 4.4,
        },
    ],
    "next_test_date": "2026-09-30",
    "last_test_date": "2026-03-31",
    "test_frequency": "quarterly",
    "overall_status": "COMPLIANT",
    "risk_level": "LOW",
    "watchlist": False,
    "notes": "All covenants passing as of Q1 2026. DSCR headroom of 18.3% above 1.20x threshold. DSRF fully funded.",
    "agent": "Covenant Monitor",
    "updated_at": "2026-06-10T00:00:00",
}

# In-memory store — seeded with Jacaranda package
_PACKAGES = [JACARANDA_PACKAGE]


def _ok(data):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    })


def _err(msg, code=400):
    return jsonify({
        "success": False,
        "data": None,
        "error": msg,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


@covenants_bp.get("/")
def list_covenants():
    """Return all tracked covenant packages."""
    deal_name = request.args.get("deal_name")
    status = request.args.get("status")
    result = list(_PACKAGES)
    if deal_name:
        result = [p for p in result if deal_name.lower() in p["deal_name"].lower()]
    if status:
        result = [p for p in result if p["overall_status"].upper() == status.upper()]
    return _ok(result)


@covenants_bp.get("/<package_id>")
def get_covenant(package_id: str):
    """Return a single covenant package by id."""
    pkg = next((p for p in _PACKAGES if p["id"] == package_id), None)
    if not pkg:
        return _err(f"Covenant package '{package_id}' not found", 404)
    return _ok(pkg)


@covenants_bp.post("/test")
def run_covenant_test():
    """Run a covenant test against posted financials.
    Body: { package_id, financials: { dscr, noi, ... } }
    """
    from agents.covenant_monitor_agent import CovenantMonitorAgent
    b = request.get_json(silent=True) or {}
    package_id = b.get("package_id", "cov-001")
    financials = b.get("financials", {})

    pkg = next((p for p in _PACKAGES if p["id"] == package_id), JACARANDA_PACKAGE)

    bond_input = {
        "id": pkg["id"],
        "covenant_package": {
            "dscr_threshold": pkg["covenants"]["dscr_threshold"],
            "additional_bonds_test": pkg["covenants"]["additional_bonds_test"],
            "distribution_trap": pkg["covenants"]["distribution_trap"],
        },
    }

    if not financials:
        financials = {
            "dscr": pkg["covenants"]["dscr_current"],
            "period_end": pkg["last_test_date"],
        }

    agent = CovenantMonitorAgent()
    result = agent.test_covenants(bond_input, financials)
    return _ok(result)
