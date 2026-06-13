"""
Covenant package API — returns live covenant packages for tracked bond issues.
Seeded with Jacaranda Trace Series 2025 ($231M, Florida LGFC).
Live data pulled from Supabase deals table; falls back to Jacaranda fixture.
"""
from datetime import datetime
from flask import Blueprint, jsonify, request

try:
    from services.database import db
except ImportError:
    db = None

covenants_bp = Blueprint("covenants", __name__)

# ── Covenant thresholds ────────────────────────────────────────────────────────
_DSCR_THRESHOLD = 1.20
_DSCR_WATCH = 1.10
_LTV_THRESHOLD = 75.0
_LTV_WATCH = 80.0
_ICR_THRESHOLD = 2.0


def _dscr_status(dscr: float) -> str:
    if dscr >= _DSCR_THRESHOLD:
        return "PASSING"
    if dscr >= _DSCR_WATCH:
        return "WATCH"
    return "BREACH"


def _ltv_status(ltv: float) -> str:
    if ltv <= _LTV_THRESHOLD:
        return "PASSING"
    if ltv <= _LTV_WATCH:
        return "WATCH"
    return "BREACH"


def _icr_status(icr: float) -> str:
    return "PASSING" if icr >= _ICR_THRESHOLD else "WATCH"


def _overall_status(dscr: float, ltv: float, icr: float) -> tuple[str, str]:
    """Returns (overall_status, risk_level)."""
    if dscr < _DSCR_WATCH or ltv > _LTV_WATCH:
        return "BREACH", "HIGH"
    if dscr < _DSCR_THRESHOLD or ltv > _LTV_THRESHOLD or icr < _ICR_THRESHOLD:
        return "WATCH", "MEDIUM"
    return "COMPLIANT", "LOW"


def _cushion(current: float, threshold: float, higher_is_better: bool = True) -> float:
    if higher_is_better:
        return round((current / threshold - 1) * 100, 1) if threshold else 0.0
    return round((threshold / current - 1) * 100, 1) if current else 0.0


def _mock_cusip(deal_id: str) -> str:
    return (deal_id.replace("-", "").upper()[:8]) if deal_id else "UNKNOWN"


def _row_to_package(row: dict, idx: int) -> dict:
    deal_id = row.get("id", f"cov-{idx:03d}")
    name = row.get("name", "Unknown Deal")
    bond_face = float(row.get("bond_face") or 0)
    dscr = float(row.get("dscr") or 0)
    ltv = float(row.get("ltv") or 0)
    icr = float(row.get("icr") or 0)
    state = row.get("state", "")

    ds_status = _dscr_status(dscr)
    lv_status = _ltv_status(ltv)
    ic_status = _icr_status(icr)
    overall, risk = _overall_status(dscr, ltv, icr)

    # Rough debt service estimate: bond_face * 6% annual
    annual_ds = round(bond_face * 0.06, 0)
    noi_ttm = round(annual_ds * dscr, 0) if dscr else 0

    return {
        "id": f"cov-{deal_id[-8:]}",
        "deal_id": deal_id,
        "deal_name": name,
        "cusip": _mock_cusip(deal_id),
        "par_amount": bond_face,
        "series": "Series 2025",
        "issuer": f"{state} Local Government Finance Commission" if state else "Municipal Issuer",
        "state": state,
        "sector": row.get("deal_type", "cre"),
        "covenants": {
            "dscr_threshold": _DSCR_THRESHOLD,
            "dscr_current": dscr,
            "dscr_status": ds_status,
            "cushion_pct": _cushion(dscr, _DSCR_THRESHOLD),
            "ltv_threshold": _LTV_THRESHOLD,
            "ltv_current": ltv,
            "ltv_status": lv_status,
            "icr_threshold": _ICR_THRESHOLD,
            "icr_current": icr,
            "icr_status": ic_status,
            "additional_bonds_test": "1.20x historical",
            "additional_bonds_status": ds_status,
            "restricted_payments": "standard",
            "distribution_trap": 1.10,
            "distribution_trap_status": "PASSING" if dscr >= 1.10 else "BREACH",
            "rate_covenant": "100% of annual debt service",
            "rate_covenant_status": ds_status,
        },
        "debt_service": {
            "annual_ds": annual_ds,
            "noi_ttm": noi_ttm,
            "dscr_ttm": dscr,
            "next_payment_date": "2026-07-01",
            "next_payment_amount": round(annual_ds / 2, 0),
        },
        "compliance_items": [
            {
                "covenant": "DSCR",
                "threshold": f"{_DSCR_THRESHOLD}x minimum",
                "current": f"{dscr:.2f}x",
                "status": ds_status,
                "cushion_pct": _cushion(dscr, _DSCR_THRESHOLD),
            },
            {
                "covenant": "LTV",
                "threshold": f"{_LTV_THRESHOLD}% maximum",
                "current": f"{ltv:.1f}%",
                "status": lv_status,
                "cushion_pct": _cushion(ltv, _LTV_THRESHOLD, higher_is_better=False),
            },
            {
                "covenant": "ICR",
                "threshold": f"{_ICR_THRESHOLD}x minimum",
                "current": f"{icr:.2f}x",
                "status": ic_status,
                "cushion_pct": _cushion(icr, _ICR_THRESHOLD),
            },
            {
                "covenant": "Distribution Trap",
                "threshold": "1.10x triggers trap",
                "current": f"{dscr:.2f}x",
                "status": "PASSING" if dscr >= 1.10 else "BREACH",
                "cushion_pct": _cushion(dscr, 1.10),
            },
        ],
        "next_test_date": "2026-09-30",
        "last_test_date": "2026-03-31",
        "test_frequency": "quarterly",
        "overall_status": overall,
        "risk_level": risk,
        "watchlist": overall != "COMPLIANT",
        "notes": (
            f"Auto-generated from live Supabase deal data. "
            f"DSCR {dscr:.2f}x vs {_DSCR_THRESHOLD}x threshold. "
            f"LTV {ltv:.1f}% vs {_LTV_THRESHOLD}% threshold."
        ),
        "agent": "Covenant Monitor",
        "updated_at": row.get("updated_at", datetime.utcnow().isoformat()),
    }


# ── Fallback fixture ───────────────────────────────────────────────────────────
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

# In-memory fallback store — seeded with Jacaranda fixture
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


def _load_packages() -> list:
    """Load covenant packages from Supabase. Falls back to _PACKAGES fixture."""
    try:
        if db and db.configured:
            rows = db.select("deals", {"order": "created_at.desc"}) or []
            if rows:
                return [_row_to_package(r, i) for i, r in enumerate(rows, start=1)]
    except Exception:
        pass
    return list(_PACKAGES)


@covenants_bp.get("/")
def list_covenants():
    """Return all tracked covenant packages, pulled live from Supabase deals."""
    deal_name = request.args.get("deal_name")
    status = request.args.get("status")
    result = _load_packages()
    if deal_name:
        result = [p for p in result if deal_name.lower() in p["deal_name"].lower()]
    if status:
        result = [p for p in result if p["overall_status"].upper() == status.upper()]
    return _ok(result)


@covenants_bp.get("/<package_id>")
def get_covenant(package_id: str):
    """Return a single covenant package by cov-id or deal_id suffix."""
    packages = _load_packages()
    pkg = next((p for p in packages if p["id"] == package_id), None)
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

    packages = _load_packages()
    pkg = next((p for p in packages if p["id"] == package_id), JACARANDA_PACKAGE)

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
