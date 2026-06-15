"""
NEST Deal Outcomes — Self-Learning Loop
Blueprint prefix: /api/deal-outcomes

After a deal closes, records the outcome and triggers Claude to generate
learning_signals that improve future structure recommendations.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime

from flask import Blueprint, jsonify, request
from services.auth import require_auth
from services.database import db

log = logging.getLogger(__name__)

deal_outcomes_bp = Blueprint("deal_outcomes", __name__)


def _ts() -> str:
    return datetime.utcnow().isoformat()


def _ok(data, code: int = 200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg: str, code: int = 400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


def _claude(prompt: str) -> str:
    try:
        from services.ai_router import plugin_hub
        result = plugin_hub.route("credit_memo", prompt)
        if result and result.get("success"):
            return result.get("content", "")
    except Exception as exc:
        log.warning("Claude call failed: %s", exc)
    return ""


def _parse_signals(raw: str) -> list:
    if not raw:
        return []
    try:
        text = raw.strip()
        if text.startswith("```"):
            text = "\n".join(l for l in text.splitlines() if not l.startswith("```")).strip()
        return json.loads(text)
    except Exception:
        return []


_LEARNING_PROMPT = (
    "You are the NEST self-learning engine. A deal just closed:\n"
    "Rating: {moodys_rating}, Spread: {spread_bps}bps, Days to close: {days}, "
    "DSCR: {dscr}, LTV: {ltv}%, Surety: {surety_success}, Green Bond: {green_bond}.\n"
    "Return a JSON array of 5-7 learning signals: "
    '[{{"factor": "...", "weight": 0.0-1.0, "outcome": "positive/negative/neutral", '
    '"recommendation": "..."}}]\n'
    "Focus on what drove the rating and spread. Raw JSON only, no markdown."
)

_RECOMMENDATION_PROMPT = (
    "You are Morgan, NEST bond structuring advisor. Jimmy Lee tone — direct, decisive, no hedging.\n"
    "Based on {n} similar closed deals averaging {spread}bps and {days} days to close, "
    "what structure would you recommend for this deal with DSCR {dscr}x and LTV {ltv}%?\n"
    "Three sentences max. Lead with the rating target."
)

_RATING_ANCHORS = {
    "Aaa": (2.2, 50), "Aa1": (2.1, 52), "Aa2": (2.05, 53), "Aa3": (2.0, 55),
    "A1":  (1.9, 57), "A2":  (1.85, 58), "A3":  (1.8, 60),
    "Baa1": (1.75, 62), "Baa2": (1.65, 65), "Baa3": (1.5, 70),
    "Ba1":  (1.35, 75), "Ba2":  (1.2, 78),  "Ba3":  (1.1, 80),
}


@deal_outcomes_bp.route("/close/<deal_id>", methods=["POST"])
@require_auth()
def close_deal(deal_id: str):
    """
    POST /api/deal-outcomes/close/<deal_id>
    Record final outcome, generate Claude learning signals, advance workflow to closed.
    """
    body = request.get_json(silent=True) or {}

    required = [
        "moodys_rating", "spread_bps_achieved", "coupon_pct_achieved",
        "total_principal_usd", "intake_date", "close_date",
        "ltv_pct", "dscr_achieved", "ltc_pct",
    ]
    missing = [f for f in required if body.get(f) is None]
    if missing:
        return _err(f"Missing required fields: {', '.join(missing)}", 422)

    moodys = body["moodys_rating"]
    spread = float(body["spread_bps_achieved"])
    dscr   = float(body["dscr_achieved"])
    ltv    = float(body["ltv_pct"])
    surety = bool(body.get("surety_success", False))
    green  = bool(body.get("green_bond", False))

    try:
        from datetime import date
        d_intake = date.fromisoformat(body["intake_date"])
        d_close  = date.fromisoformat(body["close_date"])
        days     = (d_close - d_intake).days
    except Exception:
        days = 0

    signals = _parse_signals(_claude(_LEARNING_PROMPT.format(
        moodys_rating=moodys, spread_bps=spread, days=days,
        dscr=dscr, ltv=ltv, surety_success=surety, green_bond=green,
    )))

    payload = {
        "deal_id":             deal_id,
        "moodys_rating":       moodys,
        "sp_rating":           body.get("sp_rating"),
        "fitch_rating":        body.get("fitch_rating"),
        "spread_bps_achieved": spread,
        "coupon_pct_achieved": float(body["coupon_pct_achieved"]),
        "total_principal_usd": float(body["total_principal_usd"]),
        "intake_date":         body["intake_date"],
        "close_date":          body["close_date"],
        "surety_success":      surety,
        "lc_required":         bool(body.get("lc_required", False)),
        "green_bond":          green,
        "green_cert_body":     body.get("green_cert_body"),
        "series_count":        int(body.get("series_count", 1)),
        "ltv_pct":             ltv,
        "dscr_achieved":       dscr,
        "ltc_pct":             float(body["ltc_pct"]),
        "learning_signals":    json.dumps(signals),
        "notes":               body.get("notes"),
    }

    try:
        created = db.insert("deal_outcomes", payload)
    except Exception as exc:
        log.error("deal_outcomes insert: %s", exc)
        return _err(f"Database write failed: {exc}", 500)

    try:
        wf_rows = db.select("bond_workflows", {"deal_id": f"eq.{deal_id}"})
        if wf_rows:
            wf_id = wf_rows[0]["id"]
            if created and created.get("id"):
                db.update("deal_outcomes", {"workflow_id": wf_id}, {"id": f"eq.{created['id']}"})
            db.update("bond_workflows", {"current_phase": "placement"}, {"deal_id": f"eq.{deal_id}"})
    except Exception as exc:
        log.warning("Workflow phase update: %s", exc)

    # Self-learning EMA: update OPBA weights based on predicted vs actual outcome
    ema_update = {}
    try:
        from services.self_learning_engine import update_weights_ema, get_weights
        from services.bond_type_engine import sp_opba_score
        w           = get_weights()
        leverage    = max((ltv / 100) * 5, 0.01)
        opba_result = sp_opba_score(dscr, leverage, 0.80, weights=w)
        predicted   = opba_result["readiness_pct"]
        # Infer actual outcome from spread: 50bps → 100%, 300bps → 0%
        actual      = max(0.0, min(100.0, round(100.0 - (spread / 3.0), 1)))
        ema_update  = update_weights_ema(predicted, actual, {"dscr": dscr, "ltv": ltv})
    except Exception as _ema_exc:
        log.warning("EMA weight update non-fatal: %s", _ema_exc)

    return _ok({
        "outcome": created or payload,
        "learning_signals": signals,
        "days_to_close": days,
        "weights_updated": ema_update,
    }, 201)


@deal_outcomes_bp.route("/stats", methods=["GET"])
def get_stats():
    """GET /api/deal-outcomes/stats — aggregate outcome_stats view. No auth."""
    try:
        stats = db.select("outcome_stats") or []
    except Exception as exc:
        return _err(f"Stats unavailable: {exc}", 500)

    total_deals = sum(int(r.get("deal_count", 0)) for r in stats)
    avg_spread  = (
        round(sum(float(r.get("avg_spread_bps", 0)) * int(r.get("deal_count", 0)) for r in stats) / total_deals, 1)
        if total_deals else None
    )
    avg_days = (
        round(sum(float(r.get("avg_days_to_close", 0)) * int(r.get("deal_count", 0)) for r in stats) / total_deals, 0)
        if total_deals else None
    )

    return _ok({"stats": stats, "total_deals_closed": total_deals,
                "avg_spread_bps": avg_spread, "avg_days_to_close": avg_days})


@deal_outcomes_bp.route("/deal/<deal_id>", methods=["GET"])
def get_outcome(deal_id: str):
    """GET /api/deal-outcomes/deal/<deal_id>"""
    try:
        rows = db.select("deal_outcomes", {"deal_id": f"eq.{deal_id}"})
    except Exception as exc:
        return _err(f"Database error: {exc}", 500)

    if not rows:
        return _err(f"No outcome recorded for deal {deal_id}", 404)

    outcome = sorted(rows, key=lambda r: r.get("created_at", ""), reverse=True)[0]
    if isinstance(outcome.get("learning_signals"), str):
        try:
            outcome["learning_signals"] = json.loads(outcome["learning_signals"])
        except Exception:
            outcome["learning_signals"] = []

    return _ok(outcome)


@deal_outcomes_bp.route("/recommendations/<deal_id>", methods=["GET"])
def get_recommendations(deal_id: str):
    """GET /api/deal-outcomes/recommendations/<deal_id> — structure advice from closed-deal history."""
    try:
        deal_rows = db.select("deals", {"id": f"eq.{deal_id}"})
    except Exception as exc:
        return _err(f"Database error: {exc}", 500)

    if not deal_rows:
        return _err(f"Deal {deal_id} not found", 404)

    deal      = deal_rows[0]
    deal_dscr = float(deal.get("dscr") or 0)
    deal_ltv  = float(deal.get("ltv") or 0)
    naics     = deal.get("naics_code") or ""

    try:
        stats = db.select("outcome_stats") or []
    except Exception as exc:
        return _err(f"Stats unavailable: {exc}", 500)

    if not stats:
        return _err("No closed deals in system yet.", 404)

    best_bucket = None
    best_score  = float("inf")
    for row in stats:
        anchor = _RATING_ANCHORS.get(row.get("moodys_rating", ""))
        if anchor:
            anchor_dscr, anchor_ltv = anchor
        else:
            anchor_dscr = float(row.get("avg_dscr") or 0)
            anchor_ltv  = float(row.get("avg_ltv") or 0)
        dist = abs(deal_dscr - anchor_dscr) * 3.0 + abs(deal_ltv - anchor_ltv) * 0.05
        if dist < best_score:
            best_score, best_bucket = dist, row

    best_bucket = best_bucket or stats[0]
    rec_rating  = best_bucket.get("moodys_rating", "Baa2")
    rec_spread  = float(best_bucket.get("avg_spread_bps") or 0)
    rec_days    = int(best_bucket.get("avg_days_to_close") or 0)
    n_deals     = int(best_bucket.get("deal_count") or 0)

    ai_text = _claude(_RECOMMENDATION_PROMPT.format(
        n=n_deals, spread=rec_spread, days=rec_days,
        dscr=round(deal_dscr, 2), ltv=round(deal_ltv, 1),
    ))

    return _ok({
        "deal_id":              deal_id,
        "deal_dscr":            deal_dscr,
        "deal_ltv":             deal_ltv,
        "naics_code":           naics,
        "recommended_rating":   rec_rating,
        "estimated_spread_bps": rec_spread,
        "estimated_days":       rec_days,
        "comparable_deals":     n_deals,
        "ai_recommendation":    ai_text,
    })
