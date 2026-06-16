"""Central Nervous System — orchestrates the full bond computation chain.

Bond Type → Amortization → Par Value → Call/Put Layering → Optimization.
Each step's output is the next step's input. Nothing is static data.
"""
from flask import Blueprint, jsonify, request
from datetime import datetime

cns_bp = Blueprint("cns", __name__)


def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


# ── Bond type definitions — drive every downstream parameter ─────────────────

BOND_TYPE_PROFILES = {
    "revenue_bond": {
        "label": "Municipal Revenue Bond",
        "amort_type": "level_debt_service",
        "typical_term_years": 30,
        "io_period_months": 0,
        "call_protection_years": 10,
        "call_type": "par_call",
        "make_whole_spread_bps": None,
        "coupon_type": "fixed",
        "tax_status": "tax_exempt",
        "enhancement_required": "surety_or_lc",
        "series": "A",
    },
    "construction_bond": {
        "label": "Construction Bond (IO then Amortizing)",
        "amort_type": "io_then_level_ds",
        "typical_term_years": 30,
        "io_period_months": 36,
        "call_protection_years": 10,
        "call_type": "par_call",
        "make_whole_spread_bps": None,
        "coupon_type": "fixed",
        "tax_status": "tax_exempt",
        "enhancement_required": "surety",
        "series": "A",
    },
    "cmbs": {
        "label": "CMBS — Commercial Mortgage-Backed",
        "amort_type": "io_balloon",
        "typical_term_years": 10,
        "io_period_months": 60,
        "call_protection_years": 5,
        "call_type": "yield_maintenance",
        "make_whole_spread_bps": 50,
        "coupon_type": "fixed",
        "tax_status": "taxable",
        "enhancement_required": "none",
        "series": "A/B",
    },
    "b_tranche": {
        "label": "B-Tranche (Subordinate Floating)",
        "amort_type": "io_only",
        "typical_term_years": 7,
        "io_period_months": 84,
        "call_protection_years": 0,
        "call_type": "optional_redemption",
        "make_whole_spread_bps": None,
        "coupon_type": "floating_sofr",
        "tax_status": "taxable",
        "enhancement_required": "bank_managed",
        "series": "B",
    },
    "mini_bond": {
        "label": "Mini-Bond (Modular Sinking Fund)",
        "amort_type": "sinking_fund",
        "typical_term_years": 5,
        "io_period_months": 0,
        "call_protection_years": 2,
        "call_type": "par_call",
        "make_whole_spread_bps": None,
        "coupon_type": "fixed",
        "tax_status": "tax_exempt",
        "enhancement_required": "none",
        "series": "Mini",
    },
    "go_bond": {
        "label": "General Obligation Bond",
        "amort_type": "level_principal",
        "typical_term_years": 20,
        "io_period_months": 0,
        "call_protection_years": 10,
        "call_type": "par_call",
        "make_whole_spread_bps": None,
        "coupon_type": "fixed",
        "tax_status": "tax_exempt",
        "enhancement_required": "none",
        "series": "GO",
    },
}


def _compute_amortization(profile: dict, face_usd: float, coupon_pct: float) -> dict:
    """Step 2: Compute amortization schedule from bond type profile + deal inputs."""
    amort_type = profile["amort_type"]
    term_years = profile["typical_term_years"]
    io_months = profile["io_period_months"]
    coupon = coupon_pct / 100.0
    io_years = io_months / 12

    annual_interest = face_usd * coupon
    amort_years = term_years - io_years

    if amort_type == "io_only":
        annual_ds = annual_interest
        annual_principal = 0.0
        balloon_usd = face_usd
        avg_life_years = term_years
        amort_label = "Interest Only — balloon at maturity"

    elif amort_type == "io_balloon":
        # IO for io_years, then balloon
        annual_ds = annual_interest
        annual_principal = 0.0
        balloon_usd = face_usd
        avg_life_years = term_years * 0.85
        amort_label = f"IO {int(io_years)}yr then balloon maturity"

    elif amort_type == "level_debt_service":
        # Standard muni: level annual P+I using standard annuity formula
        if coupon > 0:
            r = coupon
            n = term_years
            annual_ds = face_usd * r / (1 - (1 + r) ** -n)
        else:
            annual_ds = face_usd / term_years
        annual_principal = annual_ds - annual_interest
        balloon_usd = 0.0
        avg_life_years = term_years * 0.55
        amort_label = f"Level debt service, {term_years}yr"

    elif amort_type == "io_then_level_ds":
        # IO period then level debt service over remaining term
        if amort_years > 0 and coupon > 0:
            r = coupon
            n = amort_years
            amort_ds = face_usd * r / (1 - (1 + r) ** -n)
        else:
            amort_ds = face_usd / max(amort_years, 1)
        annual_ds = annual_interest  # during IO
        annual_ds_amort = amort_ds   # after IO
        annual_principal = amort_ds - (face_usd * coupon)
        balloon_usd = 0.0
        avg_life_years = io_years + amort_years * 0.55
        amort_label = f"IO {int(io_years)}yr, then level DS {int(amort_years)}yr"
        return {
            "amort_type": amort_type,
            "label": amort_label,
            "io_period_years": io_years,
            "amort_period_years": amort_years,
            "total_term_years": term_years,
            "annual_ds_io_phase_usd": round(annual_interest),
            "annual_ds_amort_phase_usd": round(annual_ds_amort),
            "annual_interest_usd": round(annual_interest),
            "annual_principal_usd": round(annual_principal),
            "balloon_usd": round(balloon_usd),
            "avg_life_years": round(avg_life_years, 2),
            "total_interest_usd": round(annual_interest * io_years + (annual_ds_amort - face_usd * coupon) * 0 + annual_ds_amort * amort_years - face_usd),
        }

    elif amort_type == "level_principal":
        annual_principal = face_usd / term_years
        annual_ds = annual_principal + annual_interest
        balloon_usd = 0.0
        avg_life_years = (term_years + 1) / 2
        amort_label = f"Level principal, {term_years}yr"

    elif amort_type == "sinking_fund":
        # Level principal with sinking fund schedule
        annual_principal = face_usd / term_years
        annual_ds = annual_principal + annual_interest
        balloon_usd = 0.0
        avg_life_years = (term_years + 1) / 2
        amort_label = f"Sinking fund, {term_years}yr"

    else:
        annual_ds = annual_interest
        annual_principal = 0.0
        balloon_usd = face_usd
        avg_life_years = term_years
        amort_label = "Custom"

    total_payments = annual_ds * term_years
    total_interest = total_payments - face_usd + balloon_usd

    return {
        "amort_type": amort_type,
        "label": amort_label,
        "io_period_years": io_years,
        "amort_period_years": term_years - io_years,
        "total_term_years": term_years,
        "annual_ds_usd": round(annual_ds),
        "annual_interest_usd": round(annual_interest),
        "annual_principal_usd": round(annual_principal),
        "balloon_usd": round(balloon_usd),
        "avg_life_years": round(avg_life_years, 2),
        "total_interest_usd": round(total_interest),
        "dscr_required": None,  # filled downstream
    }


def _compute_par_value(amort: dict, face_usd: float, coupon_pct: float,
                       market_rate_pct: float, issue_price: float = 100.0) -> dict:
    """Step 3: Derive par value, issue economics, and discount/premium status."""
    coupon = coupon_pct / 100.0
    market = market_rate_pct / 100.0
    term = amort["total_term_years"]

    # Price relative to par (simple duration-based approximation)
    # When coupon < market → discount; coupon > market → premium
    if market > 0 and term > 0:
        # PV of coupons + PV of par
        pv_coupons = (coupon * face_usd) * (1 - (1 + market) ** -term) / market
        pv_par = face_usd / (1 + market) ** term
        theoretical_price = (pv_coupons + pv_par) / face_usd * 100
    else:
        theoretical_price = 100.0

    premium_discount_pct = round(theoretical_price - 100.0, 3)
    is_premium = theoretical_price > 100.5
    is_discount = theoretical_price < 99.5
    oid_flag = issue_price < 97.75  # Original Issue Discount threshold

    proceeds_usd = round(face_usd * issue_price / 100)
    oid_discount_usd = round(face_usd - proceeds_usd) if oid_flag else 0

    # Yield to maturity approximation
    annual_coupon_usd = face_usd * coupon
    ytm = round((annual_coupon_usd + (face_usd - proceeds_usd) / term) /
                ((face_usd + proceeds_usd) / 2) * 100, 4) if term > 0 else coupon_pct

    return {
        "face_amount_usd": round(face_usd),
        "issue_price": round(issue_price, 4),
        "theoretical_price": round(theoretical_price, 4),
        "proceeds_usd": proceeds_usd,
        "premium_discount_pct": premium_discount_pct,
        "pricing_status": "premium" if is_premium else ("discount" if is_discount else "at_par"),
        "oid_flag": oid_flag,
        "oid_discount_usd": oid_discount_usd,
        "yield_to_maturity_pct": ytm,
        "coupon_vs_market_spread_bps": round((coupon_pct - market_rate_pct) * 100, 1),
        "accreted_value_schedule": "OID amortization applies" if oid_flag else "N/A",
        "avg_life_years": amort["avg_life_years"],
    }


def _compute_call_put(profile: dict, par: dict, amort: dict,
                      face_usd: float, coupon_pct: float, market_rate_pct: float) -> dict:
    """Step 4: Compute call/put options, protection window, and trigger thresholds."""
    call_prot_years = profile["call_protection_years"]
    call_type = profile["call_type"]
    term_years = amort["total_term_years"]
    coupon = coupon_pct / 100.0
    market = market_rate_pct / 100.0

    # Call window
    call_eligible_year = call_prot_years + 1
    years_in_call_window = max(0, term_years - call_prot_years)

    # Make-whole premium (if applicable)
    if call_type == "yield_maintenance" and profile.get("make_whole_spread_bps"):
        spread = profile["make_whole_spread_bps"] / 10000
        make_whole_yield = market + spread
        remaining_cashflows_pv = face_usd * coupon * (1 - (1 + make_whole_yield) ** -term_years) / make_whole_yield + \
                                  face_usd / (1 + make_whole_yield) ** term_years
        make_whole_premium_usd = round(max(0, remaining_cashflows_pv - face_usd))
        make_whole_price = round(remaining_cashflows_pv / face_usd * 100, 4)
    else:
        make_whole_premium_usd = 0
        make_whole_price = 100.0

    # Rate trigger for optional call: refinance if market rates drop enough
    refi_breakeven_rate = coupon_pct - 0.50  # 50bps savings threshold
    call_triggered = market_rate_pct <= refi_breakeven_rate
    rate_differential_bps = round((coupon_pct - market_rate_pct) * 100, 1)
    annual_savings_if_called = round(face_usd * abs(coupon - market) * 0.95) if call_triggered else 0

    # Extraordinary redemption events
    extraordinary_triggers = [
        "Damage/destruction of project beyond insurance proceeds",
        "IRS determination of tax-exempt status loss",
        "Condemnation of pledged revenues",
        "Revenue decline below 1.0x DSCR for 2 consecutive years",
    ]

    # Put features (rare, typically on variable-rate demand bonds)
    has_put = profile["coupon_type"] == "floating_sofr"
    put_period_days = 7 if has_put else None

    return {
        "call_type": call_type,
        "call_protection_years": call_prot_years,
        "first_optional_call_year": call_eligible_year,
        "call_window_years": years_in_call_window,
        "par_call_price": 100.0 if call_type == "par_call" else None,
        "make_whole_price": make_whole_price if call_type == "yield_maintenance" else None,
        "make_whole_premium_usd": make_whole_premium_usd if call_type == "yield_maintenance" else None,
        "rate_trigger": {
            "refi_breakeven_rate_pct": round(refi_breakeven_rate, 3),
            "current_market_rate_pct": market_rate_pct,
            "rate_differential_bps": rate_differential_bps,
            "call_triggered": call_triggered,
            "annual_savings_usd": annual_savings_if_called,
        },
        "extraordinary_redemption_triggers": extraordinary_triggers,
        "put_feature": {
            "has_put": has_put,
            "put_period_days": put_period_days,
        },
        "vector_agent_signal": "MONITOR" if not call_triggered else "EXECUTE_CALL",
    }


def _compute_optimization(call_put: dict, par: dict, amort: dict,
                           face_usd: float, coupon_pct: float,
                           market_rate_pct: float, profile: dict) -> dict:
    """Step 5: Run Vector agent optimization — timing, savings, and action priority."""
    rate_diff = call_put["rate_trigger"]["rate_differential_bps"]
    call_triggered = call_put["rate_trigger"]["call_triggered"]
    annual_savings = call_put["rate_trigger"]["annual_savings_usd"]
    term = amort["total_term_years"]
    io_years = amort.get("io_period_years", 0)
    call_prot = call_put["call_protection_years"]

    # NPV of refinancing savings
    remaining_term = max(0, term - call_prot)
    discount_rate = market_rate_pct / 100
    if discount_rate > 0 and remaining_term > 0:
        npv_savings = annual_savings * (1 - (1 + discount_rate) ** -remaining_term) / discount_rate
    else:
        npv_savings = annual_savings * remaining_term

    # Breakeven analysis (refi costs ~2% of face)
    refi_cost_usd = round(face_usd * 0.02)
    breakeven_months = round(refi_cost_usd / (annual_savings / 12)) if annual_savings > 0 else None

    # Action priority from Vector agent
    if rate_diff >= 100 and call_triggered:
        action = "EXECUTE_CALL"
        priority = "CRITICAL"
        rationale = f"Rate differential {rate_diff}bps exceeds 100bps threshold. Annual savings ${annual_savings:,.0f}. Execute call at first available date."
    elif rate_diff >= 50:
        action = "MONITOR_CLOSELY"
        priority = "HIGH"
        rationale = f"{rate_diff}bps differential approaching call threshold. Set Vector alert at 100bps trigger."
    elif rate_diff > 0:
        action = "HOLD"
        priority = "MEDIUM"
        rationale = f"Rate advantage only {rate_diff}bps — below 50bps monitoring threshold. Review quarterly."
    else:
        action = "NO_ACTION"
        priority = "LOW"
        rationale = f"Current market rate {market_rate_pct}% exceeds bond coupon {coupon_pct}%. Hold to maturity optimal."

    # Par value optimization — can additional capacity be unlocked?
    avg_life = amort["avg_life_years"]
    target_spread_bps = 120 if profile["tax_status"] == "tax_exempt" else 200
    optimal_coupon = round(market_rate_pct + target_spread_bps / 100, 3)
    additional_capacity_usd = 0
    if par["pricing_status"] == "premium" and call_triggered:
        # Premium bonds can be refunded at lower rate, unlocking capacity
        additional_capacity_usd = round(face_usd * (coupon_pct - market_rate_pct) / 100 * avg_life * 0.15)

    return {
        "vector_action": action,
        "priority": priority,
        "rationale": rationale,
        "annual_savings_usd": annual_savings,
        "npv_savings_usd": round(npv_savings),
        "refi_cost_usd": refi_cost_usd,
        "breakeven_months": breakeven_months,
        "optimal_new_coupon_pct": optimal_coupon,
        "additional_capacity_usd": additional_capacity_usd,
        "io_optimization": {
            "current_io_period_years": io_years,
            "recommended": "Fund IO from proceeds to eliminate cash drag" if io_years > 0 else "N/A",
        },
        "atlas_model_note": f"10yr proforma based on {amort['label']}, avg life {avg_life}yr",
        "prometheus_flag": "Run sensitivity analysis if rate differential shifts >25bps",
    }


# ── Main chain endpoint ──────────────────────────────────────────────────────

@cns_bp.route("/bond-chain", methods=["POST"])
def bond_chain():
    """Full bond computation chain: bond_type → amortization → par_value → call/put → optimization.

    Each step's output feeds the next. Nothing is hardcoded — every number
    derives from the bond type and deal inputs.
    """
    body = request.get_json() or {}

    bond_type = body.get("bond_type", "revenue_bond")
    face_usd = float(body.get("face_amount_usd", 205_000_000))
    coupon_pct = float(body.get("coupon_pct", 6.5))
    market_rate_pct = float(body.get("market_rate_pct", 4.25))
    issue_price = float(body.get("issue_price", 100.0))
    deal_id = body.get("deal_id", "")

    profile = BOND_TYPE_PROFILES.get(bond_type)
    if not profile:
        return _err(f"Unknown bond type '{bond_type}'. Valid: {list(BOND_TYPE_PROFILES.keys())}")

    # ── Step 1: Bond type profile ────────────────────────────────
    step1_bond_type = {
        "bond_type": bond_type,
        "profile": profile,
    }

    # ── Step 2: Amortization ──────────────────────────────────────
    amort = _compute_amortization(profile, face_usd, coupon_pct)
    step2_amort = amort

    # ── Step 3: Par value ─────────────────────────────────────────
    par = _compute_par_value(amort, face_usd, coupon_pct, market_rate_pct, issue_price)
    step3_par = par

    # ── Step 4: Call/put layering ─────────────────────────────────
    call_put = _compute_call_put(profile, par, amort, face_usd, coupon_pct, market_rate_pct)
    step4_call_put = call_put

    # ── Step 5: Optimization (Vector agent) ──────────────────────
    optimization = _compute_optimization(call_put, par, amort, face_usd, coupon_pct, market_rate_pct, profile)
    step5_optimization = optimization

    # ── Assemble CNS chain output ─────────────────────────────────
    chain = {
        "deal_id": deal_id,
        "computed_at": _ts(),
        "inputs": {
            "bond_type": bond_type,
            "face_amount_usd": face_usd,
            "coupon_pct": coupon_pct,
            "market_rate_pct": market_rate_pct,
            "issue_price": issue_price,
        },
        "chain": {
            "step1_bond_type": step1_bond_type,
            "step2_amortization": step2_amort,
            "step3_par_value": step3_par,
            "step4_call_put": step4_call_put,
            "step5_optimization": step5_optimization,
        },
        "summary": {
            "bond_label": profile["label"],
            "annual_ds_usd": amort.get("annual_ds_usd", amort.get("annual_ds_io_phase_usd", 0)),
            "avg_life_years": amort["avg_life_years"],
            "pricing_status": par["pricing_status"],
            "ytm_pct": par["yield_to_maturity_pct"],
            "call_action": call_put["vector_agent_signal"],
            "optimization_action": optimization["vector_action"],
            "priority": optimization["priority"],
            "annual_savings_usd": optimization["annual_savings_usd"],
        },
    }

    return _ok(chain)


@cns_bp.route("/bond-types", methods=["GET"])
def list_bond_types():
    """Return all available bond type profiles."""
    return _ok({k: v for k, v in BOND_TYPE_PROFILES.items()})


@cns_bp.route("/pipeline-status", methods=["GET"])
def pipeline_status():
    """CNS pipeline status — what stage each live deal is in."""
    from routes.deals import _deals
    stages = ["preflight", "doc_upload", "parse", "spread", "ratios", "memo",
              "structure", "surety", "grading", "bond_desk", "placement"]
    deal_status = []
    for deal_id, deal in _deals.items():
        deal_status.append({
            "deal_id": deal_id,
            "name": deal.get("name"),
            "current_stage": deal.get("status", "structuring"),
            "pipeline_stages": stages,
            "next_action": "Run bond chain to advance",
        })
    return _ok({"deals": deal_status, "pipeline_stages": stages})
