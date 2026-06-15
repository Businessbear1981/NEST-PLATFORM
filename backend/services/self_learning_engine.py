"""
NEST Self-Learning Engine — EMA weight updates after deal close.
Adjusts S&P OPBA scoring weights based on predicted vs actual outcomes.
Persists to model_weights table in Supabase.
"""
from __future__ import annotations
import json
import logging
import threading

log = logging.getLogger(__name__)

_LOCK = threading.Lock()
LEARNING_RATE = 0.30  # EMA decay

_WEIGHTS: dict = {
    "dscr": 0.40, "leverage": 0.30, "liquidity": 0.30,
    "version": 1, "updates": 0,
}


def get_weights() -> dict:
    global _WEIGHTS
    with _LOCK:
        if _WEIGHTS["updates"] == 0:
            loaded = _load()
            if loaded:
                _WEIGHTS = loaded
        return dict(_WEIGHTS)


def update_weights_ema(
    predicted_score: float,
    actual_score: float,
    deal_metrics: dict,
) -> dict:
    """
    EMA update after a deal closes.
    predicted_score: OPBA readiness_pct we predicted
    actual_score:    actual outcome (e.g. spread-implied rating converted to 0-100)
    """
    global _WEIGHTS

    dscr      = float(deal_metrics.get("dscr") or 1.5)
    ltv       = float(deal_metrics.get("ltv") or 70)
    liquidity = float(deal_metrics.get("liquidity_ratio") or 0.80)
    leverage  = max((ltv / 100) * 5, 0.01)

    # Observed factor impacts (normalized)
    dscr_obs      = (dscr - 1.0) / 2.0
    leverage_obs  = 1.0 / leverage
    liquidity_obs = liquidity
    total_obs     = max(dscr_obs + leverage_obs + liquidity_obs, 0.001)
    dscr_obs     /= total_obs
    leverage_obs /= total_obs
    liquidity_obs /= total_obs

    with _LOCK:
        w = _WEIGHTS
        nd = w["dscr"]      * (1 - LEARNING_RATE) + dscr_obs      * LEARNING_RATE
        nl = w["leverage"]  * (1 - LEARNING_RATE) + leverage_obs  * LEARNING_RATE
        nq = w["liquidity"] * (1 - LEARNING_RATE) + liquidity_obs * LEARNING_RATE

        # Renormalize
        t  = nd + nl + nq
        nd /= t; nl /= t; nq /= t

        _WEIGHTS = {
            "dscr":       round(nd, 4),
            "leverage":   round(nl, 4),
            "liquidity":  round(nq, 4),
            "version":    w.get("version", 1) + 1,
            "updates":    w.get("updates", 0) + 1,
            "last_error": round(actual_score - predicted_score, 3),
        }
        updated = dict(_WEIGHTS)

    _save(updated)
    log.info("OPBA weights updated v%s: %s", updated["version"], updated)
    return updated


def _load() -> dict | None:
    try:
        from services.database import db
        if not db or not db.configured:
            return None
        rows = db.select("model_weights", {"key": "eq.opba_v1"})
        if rows:
            v = rows[0].get("value")
            return json.loads(v) if isinstance(v, str) else v
    except Exception as exc:
        log.debug("model_weights load: %s", exc)
    return None


def _save(weights: dict) -> None:
    try:
        from services.database import db
        if not db or not db.configured:
            return
        db.upsert("model_weights", {"key": "opba_v1", "value": json.dumps(weights)},
                  on_conflict="key")
    except Exception as exc:
        log.debug("model_weights save: %s", exc)
