"""Bond Structuring Service — computes tranche structure from credit metrics.

Capital structure per CLAUDE.md:
  Series A: 75% LTC, investment grade, 6.5-7.5% coupon
  Series B: +7% (82% CLTV), B/BBB, 10-14% coupon
"""
import json
from datetime import datetime, timezone

try:
    from services.database import db as _db
except ImportError:
    _db = None

# ── Coupon Tables ────────────────────────────────────────────────

_A_COUPONS = {
    "A":        6.50,
    "AAA":      6.50,
    "AA":       6.50,
    "BBB_plus": 7.00,
    "BBB":      7.25,
    "BBB_minus": 7.50,
}
_A_COUPON_DEFAULT = 7.50  # sub-IG or unknown

_B_COUPONS = {
    "A":        10.00,
    "AAA":      10.00,
    "AA":       10.00,
    "BBB_plus": 11.00,
    "BBB":      12.00,
    "BBB_minus": 13.00,
}
_B_COUPON_DEFAULT = 14.00  # sub-IG or unknown

# ── LTC / CLTV Defaults ─────────────────────────────────────────

A_LTC = 0.75
CLTV  = 0.82   # Series A + Series B cap

# ── Target DSCR for A-tranche sizing cap ────────────────────────

TARGET_DSCR_A = 1.50   # minimum acceptable DSCR at Series-A debt service


def compute_and_persist(deal_id: str, deal_data: dict, credit_result: dict) -> dict:
    """Compute initial bond structure from credit metrics and persist to bond_structures.

    Sizing logic:
      1. Series A = min(75% LTC, NOI / (target_DSCR * A_coupon))
      2. Series B = 82% CLTV − Series A  (floored at 0)
      3. Coupons keyed to credit grade from credit_result
      4. DSRF = max(NOI * 10%, par * 2.5%)
      5. Waterfall: debt service A → DSRF replenishment → debt service B → surplus

    Args:
        deal_id:       UUID of the deal in Supabase.
        deal_data:     Raw financials (noi, total_project_cost / project_value, …).
        credit_result: Return value from CreditEngine.run_and_persist().

    Returns:
        Dict with tranche sizes, coupons, DSRF, waterfall, and blended coupon.
    """
    metrics = (credit_result or {}).get("metrics", {})
    grade   = (credit_result or {}).get("grade", "BB")

    noi = float(deal_data.get("noi", 0))
    tpc = float(
        deal_data.get("total_project_cost")
        or deal_data.get("project_value")
        or deal_data.get("appraised_value")
        or 0
    )

    # ── Coupon selection ────────────────────────────────────────
    a_coupon = _A_COUPONS.get(grade, _A_COUPON_DEFAULT) / 100
    b_coupon = _B_COUPONS.get(grade, _B_COUPON_DEFAULT) / 100

    # ── Series A sizing ─────────────────────────────────────────
    # 75% LTC cap
    a_by_ltc = tpc * A_LTC

    # DSCR cap: annual A debt service = A_amount * a_coupon  →  A_amount = NOI / (dscr_target * coupon)
    if noi > 0 and a_coupon > 0:
        a_by_dscr = noi / (TARGET_DSCR_A * a_coupon)
    else:
        a_by_dscr = a_by_ltc  # no income data → fall back to LTC

    a_amount = min(a_by_ltc, a_by_dscr) if tpc > 0 else a_by_dscr

    # ── Series B sizing ─────────────────────────────────────────
    cltv_cap  = tpc * CLTV
    b_amount  = max(0.0, cltv_cap - a_amount)

    par_value = a_amount + b_amount
    equity    = max(0.0, tpc - par_value)

    # ── Annual debt service ──────────────────────────────────────
    ds_a = a_amount * a_coupon   # interest-only (IO period)
    ds_b = b_amount * b_coupon

    # ── DSRF (Debt Service Reserve Fund) ────────────────────────
    dsrf = max(noi * 0.10, par_value * 0.025) if par_value > 0 else 0

    # ── Blended coupon ───────────────────────────────────────────
    blended = ((ds_a + ds_b) / par_value) if par_value > 0 else 0

    # ── Basic waterfall (annual, IO phase) ───────────────────────
    available = noi
    waterfall_a = min(available, ds_a)
    available  -= waterfall_a
    dsrf_replen = min(available, dsrf * 0.10)   # 10% annual DSRF replenishment target
    available  -= dsrf_replen
    waterfall_b = min(available, ds_b)
    available  -= waterfall_b
    surplus     = max(0.0, available)

    # In-memory result returned to caller (flat, easy for the agent chain to read)
    structure = {
        "deal_id":          deal_id,
        "credit_grade":     grade,
        "total_project_cost": round(tpc),
        # Series A
        "a_amount":         round(a_amount),
        "a_ltc_pct":        round(A_LTC * 100, 1),
        "a_coupon_pct":     round(a_coupon * 100, 2),
        "a_annual_ds":      round(ds_a),
        # Series B
        "b_amount":         round(b_amount),
        "b_cltv_pct":       round(CLTV * 100, 1),
        "b_coupon_pct":     round(b_coupon * 100, 2),
        "b_annual_ds":      round(ds_b),
        # Totals
        "par_value":        round(par_value),
        "equity":           round(equity),
        "equity_pct":       round(equity / tpc * 100, 1) if tpc > 0 else 0,
        "blended_coupon_pct": round(blended * 100, 3),
        "dsrf":             round(dsrf),
        # Waterfall (annual, IO phase)
        "wf_ds_a":          round(waterfall_a),
        "wf_dsrf_replen":   round(dsrf_replen),
        "wf_ds_b":          round(waterfall_b),
        "wf_surplus":       round(surplus),
        "structured_at":    datetime.now(timezone.utc).isoformat(),
    }

    # Schema-correct row for bond_structures (migration 002):
    #   par_amount, series jsonb[], capital_stack jsonb, blended_coupon,
    #   weighted_avg_life, all_in_tic, waterfall jsonb, dsrf,
    #   capitalized_interest, cost_of_issuance
    series_payload = [
        {
            "label": "A",
            "face_amount_usd": round(a_amount),
            "ltc_pct": round(A_LTC * 100, 1),
            "coupon_rate_pct": round(a_coupon * 100, 2),
            "annual_ds_usd": round(ds_a),
            "rating_target": grade,
            "is_io": True,
        },
        {
            "label": "B",
            "face_amount_usd": round(b_amount),
            "cltv_pct": round(CLTV * 100, 1),
            "coupon_rate_pct": round(b_coupon * 100, 2),
            "annual_ds_usd": round(ds_b),
            "rating_target": "B",
            "is_io": False,
        },
    ]
    capital_stack_payload = {
        "senior_a": round(a_amount),
        "sub_b": round(b_amount),
        "equity": round(equity),
        "total_capitalization": round(tpc),
        "arrangement_fee_usd": round(par_value * 0.025),
        "placement_fee_usd": round(par_value * 0.0075),
        "cost_of_issuance_usd": round(par_value * 0.025),
    }
    waterfall_payload = {
        "annual_ds_a": round(waterfall_a),
        "dsrf_replenishment": round(dsrf_replen),
        "annual_ds_b": round(waterfall_b),
        "surplus": round(surplus),
        "available_noi": round(noi),
    }

    db_row = {
        "deal_id": deal_id,
        "par_amount": round(par_value),
        "series": json.dumps(series_payload),
        "capital_stack": json.dumps(capital_stack_payload),
        "blended_coupon": round(blended * 100, 3),
        "weighted_avg_life": float(deal_data.get("tenor_years", 10)),  # placeholder until amort engine
        "all_in_tic": round(blended * 100 + 0.25, 3),  # +25bp amortized fees
        "waterfall": json.dumps(waterfall_payload),
        "dsrf": round(dsrf),
        "capitalized_interest": round(ds_a * 1.5),  # 18 months IO
        "cost_of_issuance": round(par_value * 0.025),
    }

    if _db and _db.configured and deal_id:
        try:
            _db.insert("bond_structures", db_row)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                "structuring_service: bond_structures insert failed for deal %s: %s",
                deal_id, e,
            )

    return structure
