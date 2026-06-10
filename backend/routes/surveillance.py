"""
Surveillance Desk Routes — Portfolio monitoring, refunding identification,
risk re-rating, restructuring, workout support.
Backed by Supabase portfolio_bonds + surveillance_alerts tables.
"""
from flask import Blueprint, jsonify, request
from datetime import datetime

surveillance_bp = Blueprint("surveillance", __name__)


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _db():
    from services.database import DatabaseService
    return DatabaseService()


@surveillance_bp.route("/refunding", methods=["GET"])
def refunding_candidates():
    """Return bonds in portfolio that are candidates for advance refunding."""
    db = _db()
    bonds = db.select("portfolio_bonds", {"refunding_candidate": "eq.true"}) or []

    if not bonds:
        # Return computed candidates from EMMA parsed bonds
        emma_bonds = db.select("parsed_bonds") or []
        candidates = []
        for b in emma_bonds:
            coupon = float(b.get("coupon_rate") or 0)
            par = float(b.get("par_amount") or 0)
            if coupon <= 0 or par <= 0:
                continue
            market_rate = coupon * 0.80  # simplified current market assumption
            spread = coupon - market_rate
            if spread > 0.5:
                pv_savings = round(spread * par / coupon * 100 / par * 100, 1) if par else 0
                candidates.append({
                    "issuer": b.get("issuer_name", "Unknown"),
                    "cusip": b.get("cusip", ""),
                    "coupon": coupon,
                    "market_rate": round(market_rate, 2),
                    "par": par,
                    "pv_savings": pv_savings,
                    "call_date": b.get("maturity_date", ""),
                    "urgency": "high" if pv_savings > 5 else ("medium" if pv_savings > 3 else "low"),
                    "source": "emma",
                })
        candidates.sort(key=lambda x: x["pv_savings"], reverse=True)
        bonds = candidates[:10]

    return _ok({
        "candidates": bonds,
        "total": len(bonds),
        "high_urgency": len([b for b in bonds if b.get("urgency") == "high"]),
        "total_pv_savings_pct": round(sum(b.get("pv_savings", 0) for b in bonds) / max(len(bonds), 1), 1) if bonds else 0,
    })


@surveillance_bp.route("/alerts", methods=["GET"])
def surveillance_alerts():
    """Active surveillance alerts across the portfolio."""
    db = _db()
    severity_filter = request.args.get("severity")
    query = {"deal_id": "not.is.null"}
    if severity_filter:
        query["severity"] = f"eq.{severity_filter}"

    alerts = db.select("surveillance_alerts", query) or []

    # Also pull active alerts from risk_assessments table
    risk_rows = db.select("risk_assessments", {"overall_risk": "eq.high"}) or []
    for r in risk_rows:
        alerts.append({
            "id": f"risk_{r.get('id','')}",
            "bond": r.get("deal_id", "Unknown Deal"),
            "type": "Risk Escalation",
            "detail": r.get("summary") or "Overall risk rating elevated to HIGH",
            "severity": "warning",
            "created_at": r.get("assessed_at", datetime.utcnow().isoformat()),
        })

    return _ok({
        "alerts": alerts,
        "total": len(alerts),
        "warnings": len([a for a in alerts if a.get("severity") == "warning"]),
        "watches": len([a for a in alerts if a.get("severity") == "watch"]),
    })


@surveillance_bp.route("/alerts", methods=["POST"])
def create_alert():
    b = request.get_json() or {}
    required = ["bond", "type", "detail"]
    missing = [f for f in required if not b.get(f)]
    if missing:
        return _err(f"Missing: {missing}")
    db = _db()
    row = {
        "bond": b["bond"],
        "type": b["type"],
        "detail": b["detail"],
        "severity": b.get("severity", "watch"),
        "deal_id": b.get("deal_id"),
        "created_at": datetime.utcnow().isoformat(),
    }
    result = db.insert("surveillance_alerts", row)
    return _ok(result or row, 201)


@surveillance_bp.route("/alerts/<alert_id>", methods=["PATCH"])
def update_alert(alert_id):
    b = request.get_json() or {}
    allowed = {"severity", "detail", "resolved", "resolved_at"}
    updates = {k: v for k, v in b.items() if k in allowed}
    if not updates:
        return _err("No valid fields")
    db = _db()
    result = db.update("surveillance_alerts", {"id": f"eq.{alert_id}"}, updates)
    if not result:
        return _err("Alert not found", 404)
    return _ok(result[0] if isinstance(result, list) else result)


@surveillance_bp.route("/portfolio", methods=["GET"])
def portfolio_summary():
    """Full portfolio surveillance summary — bonds + alerts + refunding."""
    db = _db()
    bonds = db.select("portfolio_bonds") or []
    alerts = db.select("surveillance_alerts") or []
    return _ok({
        "bonds": bonds,
        "total_bonds": len(bonds),
        "total_par_usd": sum(float(b.get("par_amount", 0)) for b in bonds),
        "active_alerts": len([a for a in alerts if not a.get("resolved")]),
        "refunding_candidates": len([b for b in bonds if b.get("refunding_candidate")]),
    })


@surveillance_bp.route("/rerating/<deal_id>", methods=["POST"])
def run_rerating(deal_id):
    """Re-rate a deal using the Mirror Agents (Moody's + S&P simulators)."""
    db = _db()
    deal_rows = db.select("deals", {"id": f"eq.{deal_id}"}) or []
    if not deal_rows:
        return _err("Deal not found", 404)
    deal = deal_rows[0]

    from services.ai_router import plugin_hub
    prompt = (
        f"Re-rate this bond for surveillance purposes:\n"
        f"Deal: {deal.get('name', deal_id)}\n"
        f"Current rating: {deal.get('target_rating', 'BBB+')}\n"
        f"DSCR: {deal.get('dscr', 'N/A')}\n"
        f"LTV: {deal.get('ltv', 'N/A')}\n"
        f"Status: {deal.get('status', 'active')}\n"
        f"Provide a surveillance re-rating recommendation with rationale. "
        f"Note any covenant breaches or credit trend changes."
    )
    result = plugin_hub.route("credit_analysis", prompt)
    return _ok({
        "deal_id": deal_id,
        "deal_name": deal.get("name"),
        "rerating": result.get("content", "") if result.get("success") else "Re-rating unavailable",
        "tool_used": result.get("tool", "none"),
        "run_at": datetime.utcnow().isoformat(),
    })
