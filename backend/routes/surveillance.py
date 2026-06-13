"""
NEST Surveillance Desk Routes — Portfolio monitoring, refunding identification,
risk re-rating, restructuring, and workout support.
"""
from flask import Blueprint, jsonify
from datetime import datetime, timezone

try:
    from services.database import db
except ImportError:
    db = None

surveillance_bp = Blueprint("surveillance", __name__)

# Fallback fixture data used when Supabase is unavailable
_FALLBACK_PIPELINE = [
    {
        "cusip": "34077EAA1",
        "deal_id": "fallback-001",
        "name": "Jacaranda Trace 2025",
        "current_rate": 5.75,
        "market_rate": 4.85,
        "call_date": "2035-03-01",
        "par_outstanding": 231_000_000,
        "npv_savings": 8_200_000,
        "refunding_score": 0.82,
        "recommendation": "MONITOR",
        "payment_status": "on_track",
        "days_since_payment": 14,
        "next_payment_date": "2026-07-01",
        "dscr": 1.42,
        "ltv": 52.0,
        "sector": "senior_living",
        "state": "FL",
    },
    {
        "cusip": "NEST-DC-001",
        "deal_id": "fallback-002",
        "name": "Dominion Edge Data Centers 2024",
        "current_rate": 5.25,
        "market_rate": 4.60,
        "call_date": "2034-08-01",
        "par_outstanding": 120_000_000,
        "npv_savings": 4_100_000,
        "refunding_score": 0.68,
        "recommendation": "WATCH",
        "payment_status": "watch",
        "days_since_payment": 28,
        "next_payment_date": "2026-07-15",
        "dscr": 1.89,
        "ltv": 61.0,
        "sector": "data_centers",
        "state": "VA",
    },
]


def _ok(data, code=200):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


def _payment_status(dscr: float) -> str:
    if dscr >= 1.25:
        return "on_track"
    if dscr >= 1.0:
        return "watch"
    return "default"


def _refunding_score(dscr: float, ltv: float) -> float:
    """Simple heuristic: lower LTV + higher DSCR = less urgency to refund."""
    score = min(1.0, max(0.0, (1.5 - dscr) * 0.4 + (ltv / 100) * 0.6))
    return round(score, 2)


def _recommendation(score: float) -> str:
    if score >= 0.75:
        return "REFUND"
    if score >= 0.50:
        return "MONITOR"
    return "WATCH"


def _days_since(iso_ts: str) -> int:
    try:
        updated = datetime.fromisoformat(iso_ts.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return max(0, (now - updated).days)
    except Exception:
        return 0


def _row_to_surveillance(row: dict) -> dict:
    deal_id = row.get("id", "")
    dscr = float(row.get("dscr") or 0)
    ltv = float(row.get("ltv") or 0)
    bond_face = float(row.get("bond_face") or 0)
    updated_at = row.get("updated_at", "")
    days = _days_since(updated_at)
    score = _refunding_score(dscr, ltv)

    # Estimate next payment 6 months out from last update (semi-annual bond payments)
    try:
        base = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
        if base.month <= 6:
            next_pay = base.replace(month=base.month + 6)
        else:
            next_pay = base.replace(year=base.year + 1, month=base.month - 6)
        next_payment_date = next_pay.strftime("%Y-%m-%d")
    except Exception:
        next_payment_date = "2026-07-01"

    # Mock CUSIP from last 8 chars of UUID if not available
    cusip = (deal_id.replace("-", "").upper()[:8]) if deal_id else "UNKNOWN"

    return {
        "cusip": cusip,
        "deal_id": deal_id,
        "name": row.get("name", "Unknown Deal"),
        "current_rate": 5.75,      # placeholder — not stored in deals table
        "market_rate": 4.85,       # placeholder — would come from market feed
        "call_date": "2035-01-01", # placeholder — would come from bond structure
        "par_outstanding": bond_face,
        "npv_savings": round(bond_face * 0.035, 0),  # ~3.5% NPV estimate
        "refunding_score": score,
        "recommendation": _recommendation(score),
        "payment_status": _payment_status(dscr),
        "days_since_payment": days,
        "next_payment_date": next_payment_date,
        "dscr": dscr,
        "ltv": ltv,
        "sector": row.get("deal_type", "cre"),
        "state": row.get("state", ""),
        "status": row.get("status", "pipeline"),
        "market": row.get("market", ""),
    }


@surveillance_bp.get("/pipeline")
def get_refunding_pipeline():
    """Return current refunding candidates with payment status and NPV savings analysis."""
    try:
        if db and db.configured:
            rows = db.select("deals", {"order": "created_at.desc"}) or []
            pipeline = [_row_to_surveillance(r) for r in rows]
            if pipeline:
                return _ok(pipeline)
    except Exception:
        pass

    # Fallback to fixture data
    return _ok(_FALLBACK_PIPELINE)
