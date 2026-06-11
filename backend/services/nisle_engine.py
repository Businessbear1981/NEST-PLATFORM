"""
NISLE — NEST Intelligence Self-Learning Engine

Orchestrates all 8 DAPT phases into a single signal packet that enriches
every agent in the NEST platform without replacing any of them.

Architecture:
  Phase 1: SDF Calibration  → sdf_calibrator
  Phase 2: Term Structure   → vasicek_ts
  Phase 3: VRP Signal       → vrp_signal
  Phase 4: ML Spread Model  → ridge_model
  Phase 5: Disaster Pricer  → disaster_pricer
  Phase 6: Cycle Detector   → cycle_detector
  Phase 7: Self-Learning    → model_monitor
  Phase 8: Agent Injection  → inject() methods on Sentinel / Vector / pricing

Output: canonical NISLE packet injected into all downstream agents.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from services.dapt_models import (
    SDFCalibrator,
    VasicekTermStructure,
    VRPSignal,
    RidgeSpreadModel,
    DisasterPricer,
    CycleDetector,
    ModelMonitor,
)

# Static PRICING_BENCHMARKS from intelligence_engine.py — NISLE adjusts these dynamically
_BASE_PRICING = {
    "AAA": {"spread_bps": (20, 50),   "coupon_range": (3.50, 4.50)},
    "AA":  {"spread_bps": (40, 80),   "coupon_range": (4.00, 5.00)},
    "A":   {"spread_bps": (80, 140),  "coupon_range": (4.50, 5.75)},
    "BBB": {"spread_bps": (130, 220), "coupon_range": (5.25, 6.75)},
    "BB":  {"spread_bps": (250, 400), "coupon_range": (7.00, 9.00)},
    "B":   {"spread_bps": (400, 650), "coupon_range": (8.50, 11.00)},
}


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class NISLEEngine:
    """
    NEST Intelligence Self-Learning Engine.

    One singleton. Every agent calls nisle.run() to get the current
    market intelligence packet, then optionally calls inject() methods
    to enrich their own output.
    """

    def __init__(self):
        self.sdf           = SDFCalibrator()
        self.ts            = VasicekTermStructure()
        self.vrp           = VRPSignal()
        self.ridge         = RidgeSpreadModel()
        self.disaster      = DisasterPricer()
        self.cycle         = CycleDetector()
        self.monitor       = ModelMonitor()

        self._last_packet: dict | None = None
        self._run_count: int = 0

    # ------------------------------------------------------------------
    # PHASE 1-6: Run all DAPT models
    # ------------------------------------------------------------------

    def run(self, market_signals: dict = None, deal_data: dict = None,
            macro_signals: dict = None) -> dict:
        """
        Run all 8 NISLE phases and return the canonical intelligence packet.

        market_signals: Vector-compatible signal dict
            {vix, treasury_10yr, sofr, credit_spread_ig, credit_spread_hy,
             treasury_change_bps, refi_market_access, ...}

        deal_data: deal-level dict for disaster pricing
            {noi, debt_service, ltv, bond_amount, property_type, tenor_years}

        macro_signals: cycle-level dict
            {noi_growth_yoy, vix, credit_spread_ig, treasury_10yr, sofr}
        """
        signals = market_signals or {}
        deal    = deal_data or {}
        macro   = macro_signals or {}

        # ── Merge macro context from market signals when not separately provided ──
        if not macro:
            macro = {
                "noi_growth_yoy": deal.get("noi_growth_yoy", 2.0),
                "vix":            signals.get("vix", 18.5),
                "credit_spread_ig": signals.get("credit_spread_ig", 95),
                "treasury_10yr":  signals.get("treasury_10yr", 4.35),
                "sofr":           signals.get("sofr", 5.31),
            }

        # ── Phase 1: SDF Calibration ──
        sdf_result = self.sdf.calibrate(signals)

        # ── Phase 2: Term Structure ──
        sofr_pct = signals.get("sofr", 5.31)
        t10yr_pct = signals.get("treasury_10yr", 4.35)
        ts_result = self.ts.decompose(sofr_pct, t10yr_pct)

        # ── Phase 3: VRP Signal ──
        vix = signals.get("vix", 18.5)
        vrp_result = self.vrp.compute(vix)

        # ── Phase 4: ML Spread Prediction ──
        ml_features = {
            "dscr":             deal.get("dscr", 1.5),
            "ltv":              deal.get("ltv", 65.0),
            "vix":              vix,
            "term_premium_bps": ts_result["term_premium_bps"],
            "vrp_zscore":       vrp_result["vrp_zscore"],
            "lrr_signal":       self.cycle.x_t,
            "credit_spread_ig": signals.get("credit_spread_ig", 95),
        }
        ml_result = self.ridge.predict(ml_features)

        # ── Phase 5: Disaster Scenarios ──
        disaster_result = self.disaster.price_deal(deal)

        # ── Phase 6: Cycle Detector ──
        cycle_result = self.cycle.update(macro)

        # ── Phase 7: Model Health ──
        health_result = self.monitor.health()

        # ── Phase 8: Dynamic Spread Computation ──
        dynamic_spreads = self._compute_dynamic_spreads(
            sdf_result, vrp_result, cycle_result, disaster_result
        )

        # ── Agent Injection Packets ──
        injections = self._build_injections(
            sdf_result, vrp_result, ts_result, cycle_result, dynamic_spreads
        )

        self._run_count += 1
        packet = {
            "nisle_version": "1.0",
            "run_count": self._run_count,
            "generated_at": _utcnow(),
            "regime": {
                "phase": cycle_result["regime"],
                "confidence": round(min(1.0, abs(self.cycle.x_t) * 10 + 0.6), 2),
                "quarter_in_cycle": cycle_result["cycle_quarter_estimate"],
                "days_in_regime": cycle_result["days_in_current_regime"],
            },
            "sdf": sdf_result,
            "term_structure": ts_result,
            "vrp": vrp_result,
            "ml_model": {
                **ml_result,
                "active_factors": self.monitor.active_factors or self.ridge.FEATURE_NAMES,
                "calibration_count": len(self.monitor.calibration_log),
            },
            "disaster_scenarios": disaster_result,
            "cycle": cycle_result,
            "dynamic_spreads": dynamic_spreads,
            "model_health": health_result,
            "agent_injections": injections,
        }

        self._last_packet = packet
        return packet

    # ------------------------------------------------------------------
    # Dynamic Spread Computation
    # ------------------------------------------------------------------

    def _compute_dynamic_spreads(self, sdf: dict, vrp: dict,
                                  cycle: dict, disaster: dict) -> dict:
        """
        Build regime-adjusted spread table from DAPT signals.

        Three components added to base spreads:
        1. SDF stress premium (from VIX/risk aversion)
        2. VRP signal premium (crash insurance demand)
        3. Cycle regime premium (counter-cyclical Bansal-Yaron effect)
        4. Disaster probability-weighted EL spread
        """
        # Total spread premium (bps) on top of base benchmarks
        sdf_premium   = round((sdf["stress_multiplier"] - 1.0) * 80)
        vrp_premium   = vrp["spread_widening_signal_bps"]
        cycle_premium = cycle["implied_risk_premium_bps"]
        disaster_prem = disaster["disaster_spread_premium_bps"]

        total_adj_bps = sdf_premium + vrp_premium + cycle_premium + disaster_prem

        # Build adjusted table
        adjusted = {}
        for rating, base in _BASE_PRICING.items():
            lo, hi = base["spread_bps"]
            c_lo, c_hi = base["coupon_range"]
            # Scale adjustment by credit quality: sub-IG gets more, IG gets less
            quality_scalar = {"AAA": 0.6, "AA": 0.7, "A": 0.8, "BBB": 1.0,
                               "BB": 1.2, "B": 1.4}.get(rating, 1.0)
            adj = round(total_adj_bps * quality_scalar)
            # Coupon adjustment (100bps spread = ~0.60% coupon approx)
            coupon_adj = round(adj * 0.006, 2)
            adjusted[rating] = {
                "base_bps":   [lo, hi],
                "nisle_bps":  [lo + adj, hi + adj],
                "adj_bps":    adj,
                "base_coupon_range": [c_lo, c_hi],
                "nisle_coupon_range": [round(c_lo + coupon_adj, 2), round(c_hi + coupon_adj, 2)],
            }

        return {
            "total_adj_bps": total_adj_bps,
            "components": {
                "sdf_stress_premium_bps":    sdf_premium,
                "vrp_premium_bps":           vrp_premium,
                "cycle_regime_premium_bps":  cycle_premium,
                "disaster_el_premium_bps":   disaster_prem,
            },
            "by_rating": adjusted,
        }

    # ------------------------------------------------------------------
    # Agent Injection Packets (Phase 8)
    # ------------------------------------------------------------------

    def _build_injections(self, sdf: dict, vrp: dict, ts: dict,
                           cycle: dict, spreads: dict) -> dict:
        """Build per-agent injection packets."""
        total_adj = spreads["total_adj_bps"]
        regime = cycle["regime"]

        # Sentinel: add VRP as 8th risk dimension (score 0-100)
        vrp_regime_score = {
            "CALM": 5, "NORMAL": 20, "ELEVATED": 50, "CRISIS": 85
        }.get(vrp["regime"], 20)

        # Market risk baseline adjustment from SDF stress
        market_risk_adj = round((sdf["stress_multiplier"] - 1.0) * 40)

        # Vector: new signal #15
        vrp_signal_value = {
            "CALM": 80, "NORMAL": 50, "ELEVATED": 25, "CRISIS": 5
        }.get(vrp["regime"], 50)

        # Maxwell: pricing adjustment for deal structuring
        pricing_multiplier = round(sdf["stress_multiplier"], 3)

        # Prometheus: disaster EL overlay
        disaster_el = 0.0
        if hasattr(self, '_last_packet') and self._last_packet:
            disaster_el = self._last_packet.get(
                "disaster_scenarios", {}
            ).get("total_prob_weighted_el_pct", 0.0)

        # Atlas: dynamic discount rate adjustment
        discount_rate_adj_bps = total_adj
        cap_rate_expansion_bps = round(cycle["implied_risk_premium_bps"] * 0.15)

        # Merlin: M&A cycle signal
        ma_regime_signal = {
            "EXPANSION":  "ACTIVE_BUYER — credit available, valuations elevated",
            "LATE_CYCLE": "SELECTIVE_BUYER — credit tightening, focus on quality",
            "STRESS":     "OPPORTUNISTIC — contra-cyclical acquisitions only",
            "DISTRESS":   "HOLD — preserve capital, avoid new leverage",
        }.get(regime, "HOLD")

        return {
            "sentinel": {
                "market_risk_adj": market_risk_adj,
                "vrp_risk_dimension": {
                    "name": "sdf_market_stress",
                    "description": "VRP + SDF volatility composite risk dimension",
                    "score": vrp_regime_score,
                    "level": vrp["regime"].lower(),
                    "factors": [vrp["interpretation"]],
                },
            },
            "vector": {
                "signal_15_name": "vrp_regime",
                "signal_15_value": vrp_signal_value,
                "signal_15_regime": vrp["regime"],
                "curve_regime": ts["curve_regime"],
                "term_premium_bps": ts["term_premium_bps"],
            },
            "maxwell": {
                "pricing_multiplier": pricing_multiplier,
                "dynamic_spread_adj_bps": total_adj,
                "cycle_regime": regime,
            },
            "prometheus": {
                "disaster_el_overlay_pct": round(disaster_el, 4),
                "disaster_spread_premium_bps": spreads["components"]["disaster_el_premium_bps"],
            },
            "atlas": {
                "dynamic_discount_rate_adj_bps": discount_rate_adj_bps,
                "regime_cap_rate_expansion_bps": cap_rate_expansion_bps,
                "cycle_regime": regime,
            },
            "merlin": {
                "ma_regime_signal": ma_regime_signal,
                "cycle_phase": regime,
                "lrr_signal": cycle["lrr_signal"],
                "suggested_action": ma_regime_signal.split(" — ")[0],
            },
        }

    # ------------------------------------------------------------------
    # Self-Learning Feedback Loop (Phase 7)
    # ------------------------------------------------------------------

    def record_deal_outcome(self, deal_id: str, predicted_spread_bps: float,
                             actual_spread_bps: float, features: dict):
        """
        Record a prediction/outcome pair.
        Triggers model recalibration when RMSE degrades 15%+ (McLean-Pontiff guard).
        """
        timestamp = _utcnow()
        tracking = self.monitor.record_prediction(
            predicted_spread_bps, actual_spread_bps, features, timestamp
        )

        # Record for ML model training
        self.ridge.record_outcome(features, actual_spread_bps)

        # Check if recalibration needed
        health = self.monitor.health()
        if health.get("recalibration_needed") and len(self.ridge.training_samples) >= 10:
            fit_result = self.ridge.fit(self.ridge.training_samples[-50:])
            self.monitor.log_calibration(fit_result, timestamp)
            return {
                "tracked": True,
                "deal_id": deal_id,
                "recalibrated": True,
                "new_rmse": fit_result.get("rmse"),
                **tracking,
            }

        return {
            "tracked": True,
            "deal_id": deal_id,
            "recalibrated": False,
            **tracking,
        }

    # ------------------------------------------------------------------
    # Direct Agent Enrichment Methods (Phase 8)
    # ------------------------------------------------------------------

    def enrich_sentinel_score(self, base_result: dict, signals: dict = None) -> dict:
        """
        Enrich a Sentinel score_deal() result with NISLE's 8th dimension.
        Adds sdf_market_stress dimension to dimension_scores.
        """
        if not self._last_packet:
            return base_result

        injection = self._last_packet["agent_injections"]["sentinel"]
        vrp_dim = injection["vrp_risk_dimension"]
        market_adj = injection["market_risk_adj"]

        # Add 8th dimension to dimension_scores
        enriched = dict(base_result)
        dims = dict(enriched.get("dimension_scores", {}))
        dims["sdf_market_stress"] = {
            "score": vrp_dim["score"],
            "level": vrp_dim["level"],
            "top_factors": vrp_dim["factors"],
        }

        # Recompute composite with 8 dimensions (add 8th weight at 0.05, scale others)
        # New weights: reduce all existing by 5% total, add sdf at 5%
        old_composite = enriched.get("composite_score", 50.0)
        sdf_contribution = vrp_dim["score"] * 0.05
        adjusted_composite = round(old_composite * 0.95 + sdf_contribution + market_adj * 0.05, 1)

        enriched["dimension_scores"] = dims
        enriched["composite_score"] = min(100.0, adjusted_composite)
        enriched["nisle_enriched"] = True
        enriched["nisle_market_regime"] = self._last_packet["regime"]["phase"]

        return enriched

    def enrich_vector_signals(self, signals: dict) -> dict:
        """
        Add NISLE's signal #15 (VRP regime) and term structure context to Vector signals.
        """
        if not self._last_packet:
            return signals

        injection = self._last_packet["agent_injections"]["vector"]
        return {
            **signals,
            "vrp_regime_value": injection["signal_15_value"],
            "vrp_regime":       injection["signal_15_regime"],
            "curve_regime":     injection["curve_regime"],
            "term_premium_bps": injection["term_premium_bps"],
            "nisle_regime":     self._last_packet["regime"]["phase"],
        }

    def get_dynamic_pricing(self, rating: str) -> dict:
        """
        Get NISLE-adjusted spread range for a given credit rating.
        Replaces static PRICING_BENCHMARKS in intelligence_engine.py.
        """
        if not self._last_packet:
            return _BASE_PRICING.get(rating, _BASE_PRICING["BBB"])

        by_rating = self._last_packet["dynamic_spreads"]["by_rating"]
        nisle_entry = by_rating.get(rating, {})
        if not nisle_entry:
            return _BASE_PRICING.get(rating, _BASE_PRICING["BBB"])

        return {
            "spread_bps":   tuple(nisle_entry["nisle_bps"]),
            "coupon_range": tuple(nisle_entry["nisle_coupon_range"]),
            "adj_bps":      nisle_entry["adj_bps"],
            "source":       "NISLE",
        }

    def get_last_packet(self) -> dict | None:
        """Return the most recent NISLE intelligence packet."""
        return self._last_packet

    def status(self) -> dict:
        """NISLE engine status summary."""
        health = self.monitor.health()
        regime = (self._last_packet or {}).get("regime", {})
        return {
            "active": True,
            "run_count": self._run_count,
            "last_run": (self._last_packet or {}).get("generated_at"),
            "current_regime": regime.get("phase", "UNKNOWN"),
            "model_health": health["status"],
            "model_rmse": health.get("rmse"),
            "calibrations": health.get("calibrations", 0),
            "training_samples": len(self.ridge.training_samples),
            "phases": {
                "sdf_calibrator": "ACTIVE",
                "term_structure": "ACTIVE",
                "vrp_signal": "ACTIVE",
                "ml_spread_model": "ACTIVE" if self.ridge.is_fitted else "DEFAULT",
                "disaster_pricer": "ACTIVE",
                "cycle_detector": "ACTIVE",
                "model_monitor": health["status"],
                "agent_injection": "ACTIVE",
            },
        }


# ── Singleton ────────────────────────────────────────────────────────────────
nisle = NISLEEngine()
