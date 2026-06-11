"""
DAPT Models — Dynamic Asset Pricing Theory math engine for NEST.

Pure Python, stdlib only. No numpy, no sklearn.
Implements: SDF calibration, Vasicek term structure, VRP computation,
Ridge regression, Long-run risk cycle detector, Disaster scenario pricer.

All formulas sourced from the 8-phase DAPT research report (June 2026).
"""
from __future__ import annotations

import math
import statistics
from typing import Any


# ---------------------------------------------------------------------------
# Matrix utilities (pure Python — no numpy)
# ---------------------------------------------------------------------------

def _matmul(A: list, B: list) -> list:
    rows_A, cols_A, cols_B = len(A), len(A[0]), len(B[0])
    C = [[0.0] * cols_B for _ in range(rows_A)]
    for i in range(rows_A):
        for j in range(cols_B):
            for k in range(cols_A):
                C[i][j] += A[i][k] * B[k][j]
    return C


def _transpose(A: list) -> list:
    return [[A[i][j] for i in range(len(A))] for j in range(len(A[0]))]


def _mat_add(A: list, B: list) -> list:
    return [[A[i][j] + B[i][j] for j in range(len(A[0]))] for i in range(len(A))]


def _eye(n: int) -> list:
    return [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]


def _solve(A: list, b: list) -> list:
    """Solve Ax = b via Gaussian elimination with partial pivoting."""
    n = len(A)
    M = [A[i][:] + [b[i]] for i in range(n)]
    for col in range(n):
        max_row = max(range(col, n), key=lambda r: abs(M[r][col]))
        M[col], M[max_row] = M[max_row], M[col]
        pivot = M[col][col]
        if abs(pivot) < 1e-14:
            continue
        for row in range(col + 1, n):
            f = M[row][col] / pivot
            M[row] = [M[row][j] - f * M[col][j] for j in range(n + 1)]
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        x[i] = M[i][n]
        for j in range(i + 1, n):
            x[i] -= M[i][j] * x[j]
        x[i] /= M[i][i] if abs(M[i][i]) > 1e-14 else 1.0
    return x


# ---------------------------------------------------------------------------
# PHASE 1 — Stochastic Discount Factor Calibrator
# Hansen-Jagannathan [1991]: σ(M)/E(M) ≥ |E(R_i) - R_f| / σ(R_i)
# ---------------------------------------------------------------------------

class SDFCalibrator:
    """
    Calibrates the pricing kernel from observable market prices.

    The SDF is the single object that unifies all pricing models.
    Its volatility must be at least as large as the market Sharpe ratio
    (Hansen-Jagannathan bound). When SDF vol is high, spreads widen.
    """

    # Long-run US equity premium calibration (Mehra-Prescott [1985] + Barro [2006])
    EQUITY_PREMIUM_ANNUAL = 0.062      # 6.2% historical US equity premium
    EQUITY_VOL_LONG_RUN   = 0.155      # 15.5% long-run equity vol
    BETA_TIME_DISCOUNT    = 0.99       # time discount factor per period

    def calibrate(self, market_signals: dict) -> dict:
        """
        Calibrate SDF from current market observables.

        Inputs (from Vector signals):
            vix: float — current VIX level (annualized %)
            treasury_10yr: float — 10yr Treasury yield
            credit_spread_ig: float — IG spread in bps
            credit_spread_hy: float — HY spread in bps

        Returns SDF diagnostic packet.
        """
        vix = market_signals.get("vix", 18.5)
        rf = market_signals.get("treasury_10yr", 4.35) / 100.0  # decimal
        ig_spread_bps = market_signals.get("credit_spread_ig", 95)
        hy_spread_bps = market_signals.get("credit_spread_hy", 340)

        # Implied equity vol from VIX (VIX = 30-day annualized implied vol)
        sigma_equity = vix / 100.0

        # Hansen-Jagannathan bound: min SDF vol = market Sharpe ratio
        # Using long-run equity premium (Mehra-Prescott calibration)
        hj_bound = self.EQUITY_PREMIUM_ANNUAL / max(sigma_equity, 0.05)

        # SDF volatility = max(HJ bound, VIX-implied) — ensures consistency
        sdf_vol = max(hj_bound, sigma_equity * 0.8)

        # Implied risk aversion (γ) from SDF vol and consumption growth vol
        # With power utility: σ(M) = γ * σ(ΔC)
        # σ(ΔC) ≈ 0.032 (Bansal-Yaron US consumption growth vol)
        consumption_vol = 0.032
        gamma_implied = sdf_vol / consumption_vol

        # Pricing stress multiplier: how much to scale spreads given current SDF vol
        # Normalized to VIX=18 baseline (long-run average)
        vix_baseline = 18.0
        stress_multiplier = max(1.0, (vix / vix_baseline) ** 0.5)

        # Regime classification
        if vix < 15:
            sdf_regime = "CALM"
        elif vix < 25:
            sdf_regime = "NORMAL"
        elif vix < 35:
            sdf_regime = "ELEVATED"
        else:
            sdf_regime = "CRISIS"

        # Credit spread decomposition:
        # IG spread = expected loss + SDF covariance premium
        # BBB CMBS spread ≈ term premium + credit risk premium + SDF covariance premium
        sdf_covariance_premium_bps = round(ig_spread_bps * (sdf_vol / 0.30), 0)

        return {
            "hj_bound": round(hj_bound, 4),
            "sdf_vol_implied": round(sdf_vol, 4),
            "kernel_sharpe": round(hj_bound, 4),
            "risk_aversion_implied": round(min(gamma_implied, 30.0), 2),
            "time_discount_beta": self.BETA_TIME_DISCOUNT,
            "stress_multiplier": round(stress_multiplier, 3),
            "sdf_regime": sdf_regime,
            "sdf_covariance_premium_bps": int(sdf_covariance_premium_bps),
            "vix_used": vix,
            "rf_used": round(rf * 100, 3),
        }


# ---------------------------------------------------------------------------
# PHASE 2 — Vasicek Term Structure Model
# Vasicek [1977]: dr_t = κ(θ - r_t)dt + σ dW_t
# ---------------------------------------------------------------------------

class VasicekTermStructure:
    """
    Single-factor affine term structure model.

    Bond price: P(t,T) = exp[A(τ) - B(τ) * r_t]
    where τ = T - t (time to maturity in years)

    Decomposes yields into: rate expectations + term premium
    Provides shadow rate estimate for ZLB/inverted-curve regimes.
    """

    # Calibrated to post-2000 US Treasury market
    KAPPA = 0.20   # mean reversion speed (~5yr half-life)
    THETA = 0.038  # long-run rate equilibrium (3.8%)
    SIGMA = 0.015  # rate vol (150bps annualized)

    def _B(self, tau: float) -> float:
        """Duration factor B(τ) = (1 - exp(-κτ)) / κ"""
        if self.KAPPA < 1e-10:
            return tau
        return (1.0 - math.exp(-self.KAPPA * tau)) / self.KAPPA

    def _A(self, tau: float) -> float:
        """Level factor A(τ) under Vasicek."""
        B = self._B(tau)
        kappa, theta, sigma = self.KAPPA, self.THETA, self.SIGMA
        term1 = (B - tau) * (kappa ** 2 * theta - sigma ** 2 / 2.0) / kappa ** 2
        term2 = -sigma ** 2 * B ** 2 / (4.0 * kappa)
        return term1 + term2

    def yield_from_short_rate(self, r0: float, tau: float) -> float:
        """Compute Vasicek yield y(t, τ) = (-A(τ) + B(τ)*r0) / τ"""
        if tau < 1e-6:
            return r0
        return (-self._A(tau) + self._B(tau) * r0) / tau

    def term_premium(self, r0: float, observed_yield: float, tau: float) -> float:
        """
        Term premium = observed yield - risk-neutral expected yield.
        Positive = upward sloping (normal), Negative = inverted.
        """
        risk_neutral_yield = self.yield_from_short_rate(r0, tau)
        return (observed_yield - risk_neutral_yield) * 10000  # convert to bps

    def shadow_rate(self, sofr: float, treasury_10yr: float) -> float:
        """
        Estimate shadow rate when curve is inverted.
        Wu-Xia [2016] insight: shadow rate < observed when QE/rate compression active.
        Simple proxy: weighted average of SOFR and back-solved Vasicek rate.
        """
        implied_r = self.THETA + (treasury_10yr - self.THETA) * 0.7 + \
                    (sofr - self.THETA) * 0.3
        return round(implied_r, 4)

    def decompose(self, sofr: float, treasury_10yr: float) -> dict:
        """
        Full yield curve decomposition.

        Returns: rate expectation, term premium, shadow rate, curve regime.
        """
        r0 = sofr / 100.0  # decimal
        y10 = treasury_10yr / 100.0

        expected_short_rate_10yr = self.yield_from_short_rate(r0, 10.0) * 100.0
        tp_bps = self.term_premium(r0, y10, 10.0)
        shadow = self.shadow_rate(sofr, treasury_10yr) * 100.0
        slope_bps = (treasury_10yr - sofr) * 100.0

        if slope_bps < -100:
            curve_regime = "DEEPLY_INVERTED"
        elif slope_bps < 0:
            curve_regime = "INVERTED"
        elif slope_bps < 50:
            curve_regime = "FLAT"
        elif slope_bps < 150:
            curve_regime = "NORMAL"
        else:
            curve_regime = "STEEP"

        return {
            "sofr": round(sofr, 3),
            "treasury_10yr": round(treasury_10yr, 3),
            "yield_curve_slope_bps": round(slope_bps, 1),
            "rate_expectation_10yr_pct": round(expected_short_rate_10yr, 3),
            "term_premium_bps": round(tp_bps, 1),
            "shadow_rate_pct": round(shadow, 3),
            "curve_regime": curve_regime,
            "decomposition": f"{round(expected_short_rate_10yr, 2)}% (rate exp) + "
                             f"{round(tp_bps, 0):+.0f}bps (term premium) = "
                             f"{round(treasury_10yr, 2)}% observed",
        }


# ---------------------------------------------------------------------------
# PHASE 3 — Variance Risk Premium Signal
# Carr & Wu [2009]: VRP = E^Q[realized var] - E^P[realized var] = VIX² - RV
# ---------------------------------------------------------------------------

class VRPSignal:
    """
    Real-time stress detector via Variance Risk Premium.

    VRP is the compensation investors demand for bearing variance risk.
    When VRP is elevated, the SDF is more volatile, spreads are underpriced.
    Bollerslev, Tauchen, Zhou [2009]: VRP predicts equity returns at 1-month horizon.
    """

    # Historical VRP statistics (US equity market, 2000-2026)
    VRP_MEAN  = 0.0018   # monthly variance units (VIX²/12 - RV²/12 average)
    VRP_STD   = 0.0012   # standard deviation
    VRP_CRISIS_THRESHOLD = 0.006   # ~3σ above mean — crisis level

    # Spread widening table: VRP regime → additional spread premium in bps
    SPREAD_WIDENING = {
        "CALM":    0,
        "NORMAL":  12,
        "ELEVATED": 35,
        "CRISIS":  125,
    }

    def compute(self, vix: float, realized_vol_proxy: float = None) -> dict:
        """
        Compute VRP from VIX and realized vol.

        VIX is the 30-day risk-neutral (implied) vol.
        Realized vol is typically 75-85% of implied vol in normal markets.
        Historical VRP: positive means implied vol > realized vol
        (investors pay for crash protection — the normal state).
        """
        # Realized vol proxy: if not provided, use 82% of VIX (historical ratio)
        if realized_vol_proxy is None:
            realized_vol_proxy = vix * 0.82

        vix_dec = vix / 100.0
        rv_dec = realized_vol_proxy / 100.0

        # Monthly variance units
        implied_var_monthly = (vix_dec ** 2) / 12.0
        realized_var_monthly = (rv_dec ** 2) / 12.0
        vrp_monthly = implied_var_monthly - realized_var_monthly

        # Z-score relative to historical distribution
        vrp_zscore = (vrp_monthly - self.VRP_MEAN) / self.VRP_STD

        # Regime classification
        if vrp_monthly < self.VRP_MEAN * 0.5:
            regime = "CALM"
        elif vrp_monthly < self.VRP_MEAN * 1.5:
            regime = "NORMAL"
        elif vrp_monthly < self.VRP_CRISIS_THRESHOLD:
            regime = "ELEVATED"
        else:
            regime = "CRISIS"

        # Spread widening signal
        spread_widening_bps = self.SPREAD_WIDENING[regime]

        # Interpretation for bond desk
        if regime == "CALM":
            interpretation = "Risk appetite strong. Spreads likely to tighten."
        elif regime == "NORMAL":
            interpretation = "Moderate tail risk priced. Spreads fairly valued."
        elif regime == "ELEVATED":
            interpretation = "Elevated crash insurance demand. Spreads underpricing risk."
        else:
            interpretation = "Crisis-level VRP. Spreads 100-150bps too tight vs. realized SDF vol."

        return {
            "vix": vix,
            "realized_vol_proxy": round(realized_vol_proxy, 2),
            "implied_var_monthly": round(implied_var_monthly, 6),
            "realized_var_monthly": round(realized_var_monthly, 6),
            "vrp_monthly": round(vrp_monthly, 6),
            "vrp_zscore": round(vrp_zscore, 2),
            "regime": regime,
            "spread_widening_signal_bps": spread_widening_bps,
            "interpretation": interpretation,
        }


# ---------------------------------------------------------------------------
# PHASE 4 — Ridge Regression Spread Model
# Gu, Kelly, Xiu [2020]: regularized ML for return prediction
# ---------------------------------------------------------------------------

class RidgeSpreadModel:
    """
    Ridge regression for CMBS spread factor selection.

    Gu, Kelly, and Xiu [2020] showed LASSO/Ridge substantially outperforms
    OLS for financial prediction by eliminating spurious factors.

    Factor zoo problem: never use OLS with 20+ spread determinants.
    LASSO kills factors; ridge shrinks them. Both require out-of-sample validation.
    """

    LAMBDA_DEFAULT = 0.5  # regularization strength

    FEATURE_NAMES = [
        "dscr",               # debt service coverage (negative spread pressure)
        "ltv",                # loan-to-value (positive spread pressure)
        "vix",                # market vol (positive)
        "term_premium_bps",   # Treasury term premium (positive when curve steep)
        "vrp_zscore",         # variance risk premium z-score (positive)
        "lrr_signal",         # long-run risk component (positive when negative)
        "regime_flag",        # 1=EXPANSION, 2=LATE_CYCLE, 3=STRESS, 4=DISTRESS
        "credit_spread_ig",   # current IG spread level (positive — reflexive)
    ]

    def __init__(self):
        self.coefficients: list[float] = [0.0] * len(self.FEATURE_NAMES)
        self.intercept: float = 150.0  # base spread in bps
        self.is_fitted: bool = False
        self.training_samples: list[dict] = []
        self.rmse_history: list[float] = []

    def _extract_features(self, obs: dict) -> list[float]:
        """Extract feature vector from observation dict."""
        regime_map = {"EXPANSION": 1, "LATE_CYCLE": 2, "STRESS": 3, "DISTRESS": 4}
        return [
            float(obs.get("dscr", 1.5)),
            float(obs.get("ltv", 65.0)),
            float(obs.get("vix", 18.5)),
            float(obs.get("term_premium_bps", 30.0)),
            float(obs.get("vrp_zscore", 0.0)),
            float(obs.get("lrr_signal", 0.0)),
            float(regime_map.get(obs.get("regime", "EXPANSION"), 1)),
            float(obs.get("credit_spread_ig", 95.0)),
        ]

    def fit(self, observations: list[dict], lambda_: float = None) -> dict:
        """
        Fit ridge regression: β = (X'X + λI)⁻¹ X'y

        observations: list of dicts, each with feature keys + "actual_spread_bps"
        Returns fit diagnostics.
        """
        if len(observations) < 5:
            return {"fitted": False, "reason": "Insufficient data (need ≥5 samples)"}

        lam = lambda_ or self.LAMBDA_DEFAULT
        n = len(observations)
        p = len(self.FEATURE_NAMES)

        # Build X matrix and y vector
        X = [self._extract_features(obs) for obs in observations]
        y = [float(obs.get("actual_spread_bps", 150.0)) for obs in observations]

        # Standardize X (mean=0, std=1) for ridge to work properly
        means = [statistics.mean(X[i][j] for i in range(n)) for j in range(p)]
        stds  = [statistics.stdev(X[i][j] for i in range(n)) or 1.0 for j in range(p)]
        X_std = [[(X[i][j] - means[j]) / stds[j] for j in range(p)] for i in range(n)]
        y_mean = statistics.mean(y)
        y_c = [yi - y_mean for yi in y]

        # X'X
        Xt = _transpose(X_std)
        XtX = _matmul(Xt, X_std)

        # X'y
        Xty = [sum(Xt[j][i] * y_c[i] for i in range(n)) for j in range(p)]

        # Ridge: (X'X + λI)β = X'y
        reg_mat = _mat_add(XtX, [[lam * p if i == j else 0.0 for j in range(p)] for i in range(p)])
        beta_std = _solve(reg_mat, Xty)

        # Unstandardize coefficients
        self.coefficients = [beta_std[j] / stds[j] for j in range(p)]
        self.intercept = y_mean - sum(self.coefficients[j] * means[j] for j in range(p))
        self.is_fitted = True

        # In-sample RMSE
        preds = [self.intercept + sum(self.coefficients[j] * X[i][j] for j in range(p)) for i in range(n)]
        rmse = math.sqrt(statistics.mean((preds[i] - y[i]) ** 2 for i in range(n)))
        self.rmse_history.append(rmse)

        # Factor importance (absolute normalized coefficient)
        total_abs = sum(abs(c) for c in self.coefficients) or 1.0
        importance = {name: round(abs(self.coefficients[j]) / total_abs, 4)
                      for j, name in enumerate(self.FEATURE_NAMES)}

        return {
            "fitted": True,
            "n_samples": n,
            "lambda": lam,
            "rmse": round(rmse, 2),
            "intercept": round(self.intercept, 2),
            "coefficients": {name: round(self.coefficients[j], 4)
                             for j, name in enumerate(self.FEATURE_NAMES)},
            "factor_importance": importance,
        }

    def predict(self, features: dict) -> dict:
        """Predict spread adjustment in bps."""
        if not self.is_fitted:
            return {"predicted_spread_adj_bps": 0, "fitted": False}

        x = self._extract_features(features)
        p = len(self.FEATURE_NAMES)
        pred = self.intercept + sum(self.coefficients[j] * x[j] for j in range(p))

        return {
            "predicted_spread_bps": round(pred, 1),
            "predicted_spread_adj_bps": round(pred - 150.0, 1),  # adj vs. 150bps base
            "fitted": True,
            "model_rmse": round(self.rmse_history[-1], 2) if self.rmse_history else None,
        }

    def record_outcome(self, features: dict, actual_spread_bps: float):
        """Record deal outcome for self-learning loop."""
        obs = {**features, "actual_spread_bps": actual_spread_bps}
        self.training_samples.append(obs)
        # Auto-refit when we have 10+ new samples since last fit
        if len(self.training_samples) % 10 == 0 and len(self.training_samples) >= 10:
            self.fit(self.training_samples[-50:])  # rolling 50-sample window


# ---------------------------------------------------------------------------
# PHASE 5 — Disaster Scenario Pricer
# Barro [2006, 2009]: rare disasters + CMBS-specific historical calibration
# ---------------------------------------------------------------------------

class DisasterPricer:
    """
    Prices tail/disaster risk using Barro rare disaster framework.

    Three CMBS-calibrated scenarios:
    A: 2008 Global Financial Crisis (AAA CMBS: 125bp → 1500bp)
    B: COVID Office Collapse (occupancy -35%, structural demand shift)
    C: Physical Climate Risk (insurance cost spike, NOI drag)

    Annual probabilities from Barro [2006] + CMBS historical frequency.
    """

    SCENARIOS = {
        "scenario_a_2008": {
            "name": "2008 CMBS Crisis",
            "description": "GFC-calibrated: property values -40%, AAA spreads +1375bps",
            "annual_prob": 0.017,          # Barro: ~1.7%/yr for severe dislocations
            "property_decline_pct": 40.0,
            "aaa_spread_widen_bps": 1375,  # AAA: 125bp → ~1500bp peak 2009
            "bbb_spread_widen_bps": 5000,  # BBB CMBS essentially zeroed out
            "default_rate_pct": 8.5,       # CMBS delinquency peak 2010
            "recovery_years": 4,
        },
        "scenario_b_covid_office": {
            "name": "COVID Office Collapse",
            "description": "Structural office demand shift: occupancy -35%, 8yr recovery",
            "annual_prob": 0.025,          # elevated for office-heavy portfolios
            "occupancy_decline_pct": 35.0,
            "noi_decline_pct": 28.0,
            "extension_option_triggered": True,
            "aaa_spread_widen_bps": 200,
            "bbb_spread_widen_bps": 800,
            "default_rate_pct": 12.3,
            "recovery_years": 8,           # structural, not cyclical
        },
        "scenario_c_climate": {
            "name": "Physical Climate Risk",
            "description": "FL/TX-style insurance spike: 45% cost increase, NOI drag",
            "annual_prob": 0.040,          # location-dependent; 4% baseline
            "insurance_cost_increase_pct": 45.0,
            "noi_drag_pct": 8.0,
            "cap_rate_expansion_bps": 50,
            "aaa_spread_widen_bps": 75,
            "bbb_spread_widen_bps": 250,
            "default_rate_pct": 3.2,
            "recovery_years": 3,
        },
    }

    def price_deal(self, deal_data: dict) -> dict:
        """
        Compute disaster-adjusted expected loss and required credit enhancement
        for a specific deal.

        deal_data keys: noi, debt_service, ltv, bond_amount, property_type, state
        """
        noi = deal_data.get("noi", 0)
        ds = deal_data.get("debt_service", 1)
        ltv = deal_data.get("ltv", 65.0)
        bond_amount = deal_data.get("bond_amount", 0)
        prop_type = deal_data.get("property_type", "mixed")

        base_dscr = noi / ds if ds > 0 else 0

        results = {}
        total_probability_weighted_el = 0.0

        for scenario_key, scenario in self.SCENARIOS.items():
            prob = scenario["annual_prob"]

            # Scenario A: property value decline
            if scenario_key == "scenario_a_2008":
                stressed_value_decline = scenario["property_decline_pct"] / 100.0
                stressed_ltv = ltv / (1.0 - stressed_value_decline)
                el_pct = max(0.0, (stressed_ltv - 100.0) / stressed_ltv * 100.0) if stressed_ltv > 100 else 0.0
                el_pct = min(el_pct, scenario["default_rate_pct"])

            # Scenario B: NOI collapse
            elif scenario_key == "scenario_b_covid_office":
                office_multiplier = 1.5 if "office" in prop_type.lower() else 0.7
                noi_decline = scenario["noi_decline_pct"] / 100.0 * office_multiplier
                stressed_noi = noi * (1.0 - noi_decline)
                stressed_dscr = stressed_noi / ds if ds > 0 else 0
                el_pct = scenario["default_rate_pct"] if stressed_dscr < 1.0 else \
                         scenario["default_rate_pct"] * 0.4 if stressed_dscr < 1.2 else 0.0

            # Scenario C: climate/insurance
            elif scenario_key == "scenario_c_climate":
                noi_drag = scenario["noi_drag_pct"] / 100.0
                stressed_noi = noi * (1.0 - noi_drag)
                stressed_dscr = stressed_noi / ds if ds > 0 else 0
                el_pct = scenario["default_rate_pct"] if stressed_dscr < 1.1 else \
                         scenario["default_rate_pct"] * 0.3
            else:
                el_pct = 0.0

            # Required credit enhancement = EL / (1 - recovery rate)
            recovery = 0.60  # 60% recovery assumption (CMBS historical)
            ce_required_bps = round((el_pct / 100.0) / (1.0 - recovery) * 10000)

            prob_weighted_el = prob * el_pct
            total_probability_weighted_el += prob_weighted_el

            results[scenario_key] = {
                "name": scenario["name"],
                "annual_prob": prob,
                "expected_loss_pct": round(el_pct, 2),
                "prob_weighted_el_pct": round(prob_weighted_el, 4),
                "credit_enhancement_required_bps": ce_required_bps,
                "aaa_spread_widen_bps": scenario["aaa_spread_widen_bps"],
                "bbb_spread_widen_bps": scenario.get("bbb_spread_widen_bps", 0),
                "recovery_years": scenario["recovery_years"],
                "description": scenario["description"],
            }

        # Disaster-adjusted spread premium (probability-weighted EL → spread cost)
        # Convert expected loss to spread: EL% per year * 10,000 / tenor_years
        tenor = deal_data.get("tenor_years", 7)
        disaster_spread_premium_bps = round(
            (total_probability_weighted_el / 100.0) * 10000.0 / tenor
        )

        return {
            "scenarios": results,
            "total_prob_weighted_el_pct": round(total_probability_weighted_el, 4),
            "disaster_spread_premium_bps": disaster_spread_premium_bps,
            "interpretation": (
                f"Probability-weighted expected loss: {total_probability_weighted_el:.3f}% — "
                f"adds {disaster_spread_premium_bps}bps to required spread over {tenor}yr tenor"
            ),
        }


# ---------------------------------------------------------------------------
# PHASE 6 — Long-Run Risk Cycle Detector
# Bansal & Yaron [2004] LRR + Campbell-Cochrane [1999] habit formation proxy
# ---------------------------------------------------------------------------

class CycleDetector:
    """
    Detects credit cycle regime using DAPT macro-state variables.

    Long-run risk (Bansal-Yaron): persistent component x_t in growth rate
    drives counter-cyclical risk premia. When x_t is negative, expected
    returns should be higher — markets are in late/stress regime.

    Surplus ratio (Campbell-Cochrane): when consumption approaches habit
    (S_t → 0), effective risk aversion spikes. Proxy: NOI/wealth ratio.
    """

    # Bansal-Yaron [2004] calibration
    PHI_X = 0.979   # persistence of LRR component (near unit root)

    # Regime-implied risk premium (bps to add to all pricing)
    REGIME_PREMIUM = {
        "EXPANSION":  0,
        "LATE_CYCLE": 35,
        "STRESS":     85,
        "DISTRESS":   175,
    }

    def __init__(self):
        self.x_t: float = 0.0          # LRR state variable
        self.surplus_ratio: float = 0.85  # S_t proxy (habit formation)
        self.growth_history: list[float] = []
        self.regime_history: list[str] = []
        self.cycle_quarter: int = 0

    def update(self, macro_signals: dict) -> dict:
        """
        Update cycle state from macro observables.

        macro_signals keys:
            noi_growth_yoy: float — year-over-year NOI/revenue growth %
            credit_spread_ig: float — current IG spread bps
            vix: float — VIX level
            treasury_10yr: float — 10yr yield
            sofr: float — short rate
        """
        noi_growth = macro_signals.get("noi_growth_yoy", 2.0) / 100.0
        vix = macro_signals.get("vix", 18.5)
        ig_spread = macro_signals.get("credit_spread_ig", 95.0)
        slope_bps = (macro_signals.get("treasury_10yr", 4.35) -
                     macro_signals.get("sofr", 5.31)) * 100.0

        # Long-run risk state variable update (AR(1) with PHI_X persistence)
        # Bansal-Yaron: Δc_{t+1} = μ + x_t + σ*ε, x_t = φ_x * x_{t-1} + ε_x
        self.x_t = self.PHI_X * self.x_t + (1.0 - self.PHI_X) * noi_growth
        self.growth_history.append(noi_growth)
        if len(self.growth_history) > 20:
            self.growth_history = self.growth_history[-20:]

        # LRR trend direction
        if len(self.growth_history) >= 4:
            recent_avg = statistics.mean(self.growth_history[-4:])
            older_avg = statistics.mean(self.growth_history[-8:-4]) if len(self.growth_history) >= 8 else self.x_t
            lrr_trend = "RISING" if recent_avg > older_avg else "DECLINING"
        else:
            lrr_trend = "STABLE"

        # Surplus ratio proxy (Campbell-Cochrane):
        # S_t ≈ normalized distance from habit (proxy: credit spread + VIX composite)
        # High VIX + wide spreads → S_t low → near habit → risk aversion spikes
        spread_norm = ig_spread / 200.0  # normalize to typical range
        vix_norm = vix / 30.0
        self.surplus_ratio = max(0.1, 1.0 - (spread_norm * 0.5 + vix_norm * 0.5) * 0.5)

        # Regime classification (4-state):
        # EXPANSION: LRR positive, VIX low, curve normal/steep
        # LATE_CYCLE: LRR declining, VIX rising, curve flattening
        # STRESS: LRR negative, VIX elevated, curve flat/inverted
        # DISTRESS: LRR deeply negative, VIX crisis, covenant breaches
        if self.x_t > 0.01 and vix < 20 and slope_bps > -50:
            regime = "EXPANSION"
        elif self.x_t > -0.01 and vix < 28 and ig_spread < 150:
            regime = "LATE_CYCLE"
        elif self.x_t > -0.03 and vix < 40 and ig_spread < 250:
            regime = "STRESS"
        else:
            regime = "DISTRESS"

        # Track regime changes
        if self.regime_history and self.regime_history[-1] != regime:
            self.cycle_quarter = 0
        else:
            self.cycle_quarter += 1
        self.regime_history.append(regime)
        if len(self.regime_history) > 100:
            self.regime_history = self.regime_history[-100:]

        implied_premium_bps = self.REGIME_PREMIUM[regime]

        return {
            "regime": regime,
            "lrr_signal": round(self.x_t, 5),
            "lrr_trend": lrr_trend,
            "surplus_ratio": round(self.surplus_ratio, 3),
            "effective_risk_aversion_multiplier": round(1.0 / max(self.surplus_ratio, 0.1), 2),
            "implied_risk_premium_bps": implied_premium_bps,
            "cycle_quarter_estimate": self.cycle_quarter,
            "days_in_current_regime": self.cycle_quarter,
            "noi_growth_used": round(noi_growth * 100, 2),
        }


# ---------------------------------------------------------------------------
# PHASE 7 — Self-Learning Model Monitor
# McLean & Pontiff [2016]: factor returns decay post-publication
# ---------------------------------------------------------------------------

class ModelMonitor:
    """
    Tracks model performance and triggers recalibration.

    Implements the McLean-Pontiff effect: factors that stop predicting
    spreads post-discovery should be downweighted automatically.
    """

    RMSE_DRIFT_THRESHOLD = 0.15     # 15% drift triggers recalibration
    FACTOR_DECAY_THRESHOLD = 0.05   # factor weight below 5% → retire it

    def __init__(self):
        self.predictions: list[dict] = []
        self.calibration_log: list[dict] = []
        self.active_factors: list[str] = []
        self.retired_factors: list[str] = []

    def record_prediction(self, prediction_bps: float, actual_bps: float,
                          features: dict, timestamp: str = None) -> dict:
        """Record a prediction/outcome pair for tracking."""
        error = abs(prediction_bps - actual_bps)
        self.predictions.append({
            "predicted": prediction_bps,
            "actual": actual_bps,
            "error": error,
            "features": features,
            "timestamp": timestamp,
        })
        # Rolling 100 predictions
        if len(self.predictions) > 100:
            self.predictions = self.predictions[-100:]

        return {"error_bps": round(error, 2), "n_tracked": len(self.predictions)}

    def health(self) -> dict:
        """Return model health diagnostics."""
        if not self.predictions:
            return {
                "status": "UNCALIBRATED",
                "n_predictions": 0,
                "rmse": None,
                "rmse_trend": None,
                "calibrations": len(self.calibration_log),
                "factors_active": len(self.active_factors),
                "factors_retired": len(self.retired_factors),
                "recalibration_needed": False,
            }

        errors = [p["error"] for p in self.predictions]
        current_rmse = math.sqrt(statistics.mean(e ** 2 for e in errors))

        # RMSE trend (compare last 10 vs previous 10)
        if len(errors) >= 20:
            recent = math.sqrt(statistics.mean(e ** 2 for e in errors[-10:]))
            older = math.sqrt(statistics.mean(e ** 2 for e in errors[-20:-10]))
            drift = (recent - older) / (older or 1.0)
            if drift > self.RMSE_DRIFT_THRESHOLD:
                rmse_trend = "DEGRADING"
                recalibration_needed = True
            elif drift < -self.RMSE_DRIFT_THRESHOLD:
                rmse_trend = "IMPROVING"
                recalibration_needed = False
            else:
                rmse_trend = "STABLE"
                recalibration_needed = False
        else:
            rmse_trend = "INSUFFICIENT_DATA"
            recalibration_needed = False

        last_calib = self.calibration_log[-1] if self.calibration_log else {}

        return {
            "status": "ACTIVE" if self.calibration_log else "DEFAULT",
            "n_predictions": len(self.predictions),
            "rmse": round(current_rmse, 2),
            "rmse_trend": rmse_trend,
            "calibrations": len(self.calibration_log),
            "last_calibrated": last_calib.get("timestamp"),
            "factors_active": len(self.active_factors) or 8,
            "factors_retired": len(self.retired_factors),
            "recalibration_needed": recalibration_needed,
        }

    def log_calibration(self, result: dict, timestamp: str):
        """Log a calibration event."""
        self.calibration_log.append({"timestamp": timestamp, **result})
        if "factor_importance" in result:
            self.active_factors = [
                f for f, w in result["factor_importance"].items()
                if w >= self.FACTOR_DECAY_THRESHOLD
            ]
            self.retired_factors = [
                f for f, w in result["factor_importance"].items()
                if w < self.FACTOR_DECAY_THRESHOLD
            ]
