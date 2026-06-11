"""
NISLE API Routes — NEST Intelligence Self-Learning Engine endpoints.

All routes under /api/nisle/
"""
from __future__ import annotations

from datetime import datetime
from flask import Blueprint, jsonify, request

from services.nisle_engine import nisle

nisle_bp = Blueprint("nisle", __name__)


def _ok(data: dict) -> tuple:
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    }), 200


def _err(msg: str, code: int = 400) -> tuple:
    return jsonify({
        "success": False,
        "data": None,
        "error": msg,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


# ---------------------------------------------------------------------------
# GET /api/nisle/status
# Quick health check — does not run the engine
# ---------------------------------------------------------------------------

@nisle_bp.route("/status", methods=["GET"])
def nisle_status():
    """NISLE engine status and model health."""
    return _ok(nisle.status())


# ---------------------------------------------------------------------------
# POST /api/nisle/run
# Full 8-phase NISLE run for a deal
# ---------------------------------------------------------------------------

@nisle_bp.route("/run", methods=["POST"])
def nisle_run():
    """
    Run all 8 NISLE phases and return the intelligence packet.

    Body (all optional — uses defaults/fallbacks):
      market_signals: {vix, treasury_10yr, sofr, credit_spread_ig,
                       credit_spread_hy, treasury_change_bps}
      deal_data:      {noi, debt_service, ltv, bond_amount, property_type,
                       tenor_years, dscr, noi_growth_yoy}
      macro_signals:  {noi_growth_yoy, vix, credit_spread_ig}
    """
    body = request.get_json(silent=True) or {}
    market_signals = body.get("market_signals", {})
    deal_data      = body.get("deal_data", {})
    macro_signals  = body.get("macro_signals", {})

    packet = nisle.run(market_signals, deal_data, macro_signals)
    return _ok(packet)


# ---------------------------------------------------------------------------
# GET /api/nisle/signals
# Current market regime snapshot — fast, uses last packet
# ---------------------------------------------------------------------------

@nisle_bp.route("/signals", methods=["GET"])
def nisle_signals():
    """Return last NISLE market signals or run with defaults."""
    packet = nisle.get_last_packet()
    if not packet:
        packet = nisle.run()

    return _ok({
        "regime":         packet["regime"],
        "sdf":            packet["sdf"],
        "term_structure": packet["term_structure"],
        "vrp":            packet["vrp"],
        "cycle":          packet["cycle"],
        "generated_at":   packet["generated_at"],
    })


# ---------------------------------------------------------------------------
# GET /api/nisle/spreads?rating=BBB
# Dynamic spread for a given rating
# ---------------------------------------------------------------------------

@nisle_bp.route("/spreads", methods=["GET"])
def nisle_spreads():
    """Get NISLE-adjusted spread ranges for all ratings or a specific rating."""
    rating = request.args.get("rating", "").upper()
    packet = nisle.get_last_packet()
    if not packet:
        packet = nisle.run()

    dynamic = packet["dynamic_spreads"]

    if rating and rating in dynamic["by_rating"]:
        return _ok({
            "rating": rating,
            "base_bps":     dynamic["by_rating"][rating]["base_bps"],
            "nisle_bps":    dynamic["by_rating"][rating]["nisle_bps"],
            "adj_bps":      dynamic["by_rating"][rating]["adj_bps"],
            "nisle_coupon_range": dynamic["by_rating"][rating]["nisle_coupon_range"],
            "regime":       packet["regime"]["phase"],
            "components":   dynamic["components"],
        })

    return _ok({
        "total_adj_bps": dynamic["total_adj_bps"],
        "components":    dynamic["components"],
        "by_rating":     dynamic["by_rating"],
        "regime":        packet["regime"]["phase"],
    })


# ---------------------------------------------------------------------------
# POST /api/nisle/disaster-scenarios
# Run disaster scenario pricer for a specific deal
# ---------------------------------------------------------------------------

@nisle_bp.route("/disaster-scenarios", methods=["POST"])
def nisle_disaster():
    """
    Price disaster tail risk for a deal.

    Body: {noi, debt_service, ltv, bond_amount, property_type, tenor_years}
    """
    body = request.get_json(silent=True) or {}
    if not body:
        return _err("Deal data required: {noi, debt_service, ltv, bond_amount}")

    from services.dapt_models import DisasterPricer
    pricer = DisasterPricer()
    result = pricer.price_deal(body)
    return _ok(result)


# ---------------------------------------------------------------------------
# GET /api/nisle/cycle
# Current credit cycle regime
# ---------------------------------------------------------------------------

@nisle_bp.route("/cycle", methods=["GET"])
def nisle_cycle():
    """Current credit cycle regime from LRR + habit formation models."""
    packet = nisle.get_last_packet()
    if not packet:
        packet = nisle.run()

    return _ok({
        "cycle":       packet["cycle"],
        "regime":      packet["regime"],
        "injections": {
            "merlin":  packet["agent_injections"]["merlin"],
            "atlas":   packet["agent_injections"]["atlas"],
            "maxwell": packet["agent_injections"]["maxwell"],
        },
    })


# ---------------------------------------------------------------------------
# GET /api/nisle/model-health
# ML model performance and calibration status
# ---------------------------------------------------------------------------

@nisle_bp.route("/model-health", methods=["GET"])
def nisle_model_health():
    """ML model performance tracking and self-learning loop status."""
    return _ok({
        "model_health": nisle.monitor.health(),
        "status":       nisle.status(),
        "ridge_fitted": nisle.ridge.is_fitted,
        "training_samples": len(nisle.ridge.training_samples),
        "active_factors": nisle.monitor.active_factors or nisle.ridge.FEATURE_NAMES,
        "retired_factors": nisle.monitor.retired_factors,
        "calibration_log": nisle.monitor.calibration_log[-5:],  # last 5
    })


# ---------------------------------------------------------------------------
# POST /api/nisle/train
# Submit a deal outcome to train the ML model
# ---------------------------------------------------------------------------

@nisle_bp.route("/train", methods=["POST"])
def nisle_train():
    """
    Record a deal outcome to train NISLE's spread model.

    Body: {
      deal_id: str,
      predicted_spread_bps: float,
      actual_spread_bps: float,
      features: {dscr, ltv, vix, term_premium_bps, vrp_zscore, ...}
    }
    """
    body = request.get_json(silent=True) or {}
    deal_id = body.get("deal_id", "unknown")
    predicted = float(body.get("predicted_spread_bps", 150))
    actual = float(body.get("actual_spread_bps", 150))
    features = body.get("features", {})

    result = nisle.record_deal_outcome(deal_id, predicted, actual, features)
    return _ok(result)


# ---------------------------------------------------------------------------
# POST /api/nisle/fit
# Manually trigger ML model refit
# ---------------------------------------------------------------------------

@nisle_bp.route("/fit", methods=["POST"])
def nisle_fit():
    """
    Manually trigger ridge regression refit.

    Body (optional): {lambda: float}  — regularization strength (default 0.5)
    """
    body = request.get_json(silent=True) or {}
    lam = float(body.get("lambda", 0.5))

    samples = nisle.ridge.training_samples
    if len(samples) < 5:
        return _err(
            f"Insufficient training data: {len(samples)} samples. Need ≥5. "
            "Submit deal outcomes via POST /api/nisle/train."
        )

    result = nisle.ridge.fit(samples, lambda_=lam)
    if result.get("fitted"):
        nisle.monitor.log_calibration(result, datetime.utcnow().isoformat())

    return _ok(result)


# ---------------------------------------------------------------------------
# GET /api/nisle/agent-injections
# Current injection packets for all agents
# ---------------------------------------------------------------------------

@nisle_bp.route("/agent-injections", methods=["GET"])
def nisle_agent_injections():
    """Current NISLE injection packets for Sentinel, Vector, Maxwell, Prometheus, Atlas, Merlin."""
    packet = nisle.get_last_packet()
    if not packet:
        packet = nisle.run()

    return _ok({
        "agent_injections": packet["agent_injections"],
        "regime":           packet["regime"]["phase"],
        "generated_at":     packet["generated_at"],
    })


# ---------------------------------------------------------------------------
# POST /api/nisle/enrich/sentinel
# Enrich a Sentinel deal score with NISLE's 8th dimension
# ---------------------------------------------------------------------------

@nisle_bp.route("/enrich/sentinel", methods=["POST"])
def nisle_enrich_sentinel():
    """
    Enrich an existing Sentinel deal score with NISLE's SDF market stress dimension.

    Body: {sentinel_result: <output of sentinel.score_deal()>}
    """
    body = request.get_json(silent=True) or {}
    sentinel_result = body.get("sentinel_result", {})
    if not sentinel_result:
        return _err("sentinel_result required — pass output of Sentinel.score_deal()")

    enriched = nisle.enrich_sentinel_score(sentinel_result)
    return _ok(enriched)
