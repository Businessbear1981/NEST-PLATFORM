"""CNS Signal Bus — platform-wide reactive event propagation.

When any module emits a signal, the CNS evaluates it against a rule engine
and returns the full set of downstream consequences. DSCR changes here trigger
EMMA gate checks there. Rate moves fire Vector. Doc uploads chain to Bond Desk.

This is the "police force" — one endpoint watching all components, evaluating
every change against rules, and telling every affected module what to do next.
"""
from flask import Blueprint, jsonify, request
from datetime import datetime
import threading

cns_signals_bp = Blueprint("cns_signals", __name__)

_lock = threading.RLock()


def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


# ── Signal type definitions ──────────────────────────────────────────────────

SIGNAL_TYPES = {
    # Credit signals
    "dscr_change": "DSCR moved — re-evaluate bond eligibility, EMMA gates, grade",
    "ltv_change": "LTV moved — re-evaluate tranche sizing, surety requirement",
    "noi_change": "NOI changed — recalculate DSCR, regrade, re-structure",
    "credit_breach": "Credit metric breached threshold — escalate, block gates",
    "credit_restore": "Credit metric restored — re-open gates",
    # Rate signals
    "rate_move": "Market rate moved — re-run call/put analysis, optimization",
    "spread_widen": "Credit spread widened — repricing required",
    "fed_decision": "Fed rate decision — recalibrate all floating rates",
    # Doc/pipeline signals
    "doc_uploaded": "Document uploaded — trigger parse → spread → ratios chain",
    "doc_parsed": "Document parsed — trigger spread",
    "spread_complete": "Spread complete — trigger ratios",
    "ratios_complete": "Ratios complete — trigger memo + bond chain",
    "memo_approved": "Memo approved — trigger structure",
    "structure_approved": "Structure approved — trigger surety",
    "surety_bound": "Surety bound — trigger grading",
    "grade_assigned": "Grade assigned — trigger bond desk",
    "bond_desk_ready": "Bond desk ready — trigger placement",
    # EMMA signals
    "emma_gate_check": "EMMA compliance gate evaluated",
    "emma_disclosure_due": "EMMA disclosure filing due",
    # Market intelligence
    "eagleeye_hit": "EagleEye found new acquisition target",
    "convergence_signal": "Convergence engine detected pattern",
    "counterparty_change": "Counterparty risk profile changed",
}

# ── Rule engine — signal → downstream consequences ─────────────────────────
# Each rule: signal_type → list of consequence objects

RULE_ENGINE = {
    "dscr_change": [
        {
            "module": "maxwell",
            "action": "regrade_credit",
            "condition": lambda v, ctx: True,
            "description": "Maxwell re-runs credit grade with new DSCR",
            "priority": "HIGH",
            "thresholds": {
                "A": 2.0, "BBB+": 1.75, "BBB": 1.6, "BBB-": 1.5, "sub_ig": 1.5
            },
        },
        {
            "module": "emma",
            "action": "check_gate",
            "condition": lambda v, ctx: v < 1.5,
            "description": "EMMA financial covenant gate — DSCR < 1.5x triggers notice requirement",
            "priority": "CRITICAL",
            "gate_rule": "DSCR < 1.50x for consecutive measurement dates → notice of default risk",
        },
        {
            "module": "bond_desk",
            "action": "rerun_bond_type_eligibility",
            "condition": lambda v, ctx: True,
            "description": "Bond Desk re-evaluates eligible bond types given new credit profile",
            "priority": "HIGH",
            "bond_type_matrix": {
                "dscr_ge_200": "revenue_bond",
                "dscr_ge_175": "revenue_bond or construction_bond",
                "dscr_ge_150": "construction_bond or cmbs",
                "dscr_lt_150": "b_tranche or mini_bond only",
            },
        },
        {
            "module": "surety",
            "action": "reprice_surety",
            "condition": lambda v, ctx: v < 1.75,
            "description": "Hylant surety repricing — DSCR < 1.75x triggers Tier 2 pricing",
            "priority": "MEDIUM",
        },
        {
            "module": "cns_chain",
            "action": "rerun_full_chain",
            "condition": lambda v, ctx: True,
            "description": "Re-run full bond computation chain with updated credit metrics",
            "priority": "HIGH",
        },
    ],

    "ltv_change": [
        {
            "module": "maxwell",
            "action": "regrade_credit",
            "condition": lambda v, ctx: True,
            "description": "Maxwell updates LTV component in credit model",
            "priority": "HIGH",
        },
        {
            "module": "bond_desk",
            "action": "resize_tranches",
            "condition": lambda v, ctx: True,
            "description": "Bond Desk re-sizes Series A/B tranche split based on new LTV",
            "priority": "HIGH",
            "tranche_matrix": {
                "ltv_lt_55": "Series A at 75% LTC, Series B at 7% add-on",
                "ltv_55_62": "Series A at 70% LTC, Series B at 12% add-on",
                "ltv_62_70": "Series A at 65% LTC, B-Tranche bank-managed",
                "ltv_gt_70": "Sub-IG — restructure required",
            },
        },
        {
            "module": "surety",
            "action": "recheck_collateral",
            "condition": lambda v, ctx: v > 0.70,
            "description": "Surety rechecks collateral requirement — LTV > 70% = LC required",
            "priority": "CRITICAL",
        },
    ],

    "noi_change": [
        {
            "module": "prometheus",
            "action": "rebuild_proforma",
            "condition": lambda v, ctx: True,
            "description": "Prometheus rebuilds 10yr proforma with updated NOI",
            "priority": "HIGH",
        },
        {
            "module": "maxwell",
            "action": "recalculate_dscr",
            "condition": lambda v, ctx: True,
            "description": "Maxwell recalculates DSCR — emits dscr_change signal if changed",
            "priority": "HIGH",
            "cascades_to": "dscr_change",
        },
    ],

    "rate_move": [
        {
            "module": "vector",
            "action": "evaluate_call_trigger",
            "condition": lambda v, ctx: True,
            "description": "Vector evaluates all live bonds against new rate — fires call alert if differential > 100bps",
            "priority": "HIGH",
        },
        {
            "module": "cns_chain",
            "action": "rerun_call_put_optimization",
            "condition": lambda v, ctx: True,
            "description": "Re-run Steps 4-5 of bond chain (call/put + optimization) with new rate",
            "priority": "HIGH",
        },
        {
            "module": "emma",
            "action": "check_variable_rate_disclosure",
            "condition": lambda v, ctx: ctx.get("bond_type") == "b_tranche",
            "description": "EMMA variable-rate disclosure update required for floating B-Tranche",
            "priority": "MEDIUM",
        },
        {
            "module": "atlas",
            "action": "run_rate_sensitivity",
            "condition": lambda v, ctx: abs(v) >= 0.50,
            "description": "Atlas runs rate sensitivity — move >= 50bps triggers full stress test",
            "priority": "MEDIUM",
        },
    ],

    "doc_uploaded": [
        {
            "module": "roots",
            "action": "parse_document",
            "condition": lambda v, ctx: True,
            "description": "Roots parses uploaded document — extracts financial data",
            "priority": "HIGH",
            "cascades_to": "doc_parsed",
        },
    ],

    "doc_parsed": [
        {
            "module": "prometheus",
            "action": "run_spread",
            "condition": lambda v, ctx: True,
            "description": "Prometheus spreads financials per RMA standards",
            "priority": "HIGH",
            "cascades_to": "spread_complete",
        },
    ],

    "spread_complete": [
        {
            "module": "maxwell",
            "action": "compute_ratios",
            "condition": lambda v, ctx: True,
            "description": "Maxwell computes DSCR, LTV, ICR, D/EBITDA from spread",
            "priority": "HIGH",
            "cascades_to": "ratios_complete",
        },
    ],

    "ratios_complete": [
        {
            "module": "morgan",
            "action": "generate_memo",
            "condition": lambda v, ctx: True,
            "description": "Morgan generates deal memo with JPMorgan tone",
            "priority": "MEDIUM",
            "cascades_to": "memo_approved",
        },
        {
            "module": "cns_chain",
            "action": "run_bond_chain",
            "condition": lambda v, ctx: True,
            "description": "CNS runs full bond type → amort → par → call/put → optimization chain",
            "priority": "HIGH",
        },
        {
            "module": "maxwell",
            "action": "emit_dscr_change",
            "condition": lambda v, ctx: True,
            "description": "Emit dscr_change signal with computed DSCR to trigger all credit rules",
            "priority": "HIGH",
            "cascades_to": "dscr_change",
        },
    ],

    "memo_approved": [
        {
            "module": "bond_desk",
            "action": "open_structure_session",
            "condition": lambda v, ctx: True,
            "description": "Bond Desk opens structuring session — GENIE ready for term sheet",
            "priority": "MEDIUM",
        },
        {
            "module": "sterling",
            "action": "update_investor_crm",
            "condition": lambda v, ctx: True,
            "description": "Sterling updates investor CRM with new deal memo",
            "priority": "LOW",
        },
    ],

    "surety_bound": [
        {
            "module": "maxwell",
            "action": "apply_surety_enhancement",
            "condition": lambda v, ctx: True,
            "description": "Maxwell applies Hylant surety enhancement — upgrades grade 1-2 notches",
            "priority": "HIGH",
            "cascades_to": "dscr_change",
        },
        {
            "module": "bond_desk",
            "action": "lock_series_a_tranche",
            "condition": lambda v, ctx: True,
            "description": "Bond Desk locks Series A tranche with surety wrap",
            "priority": "HIGH",
        },
    ],

    "grade_assigned": [
        {
            "module": "bond_desk",
            "action": "calculate_pricing",
            "condition": lambda v, ctx: True,
            "description": "Bond Desk prices coupon based on grade + current market spread",
            "priority": "HIGH",
        },
        {
            "module": "emma",
            "action": "check_rating_disclosure",
            "condition": lambda v, ctx: True,
            "description": "EMMA checks rating disclosure requirements for assigned grade",
            "priority": "HIGH",
        },
        {
            "module": "sterling",
            "action": "update_book_building",
            "condition": lambda v, ctx: True,
            "description": "Sterling updates book-building with final grade — activates investor outreach",
            "priority": "MEDIUM",
        },
    ],

    "eagleeye_hit": [
        {
            "module": "merlin",
            "action": "run_ma_analysis",
            "condition": lambda v, ctx: ctx.get("deal_type") == "ma",
            "description": "Merlin runs M&A analysis on new target",
            "priority": "MEDIUM",
        },
        {
            "module": "hawkeye",
            "action": "run_dossier",
            "condition": lambda v, ctx: True,
            "description": "Hawkeye runs counterparty OSINT dossier on new target entity",
            "priority": "MEDIUM",
        },
        {
            "module": "bernard",
            "action": "narrate_opportunity",
            "condition": lambda v, ctx: True,
            "description": "Bernard narrates deal opportunity and recommends next action",
            "priority": "LOW",
        },
    ],

    "credit_breach": [
        {
            "module": "sentinel",
            "action": "raise_alert",
            "condition": lambda v, ctx: True,
            "description": "Sentinel raises CRITICAL alert — all team members notified",
            "priority": "CRITICAL",
        },
        {
            "module": "emma",
            "action": "check_notice_requirement",
            "condition": lambda v, ctx: True,
            "description": "EMMA checks Material Event Notice requirement (Rule 15c2-12)",
            "priority": "CRITICAL",
        },
        {
            "module": "preflight",
            "action": "block_next_stage",
            "condition": lambda v, ctx: True,
            "description": "Preflight blocks deal from advancing to next pipeline stage",
            "priority": "CRITICAL",
        },
    ],
}


def _evaluate_signal(signal_type: str, value, context: dict) -> list:
    """Run the signal through the rule engine and return triggered consequences."""
    rules = RULE_ENGINE.get(signal_type, [])
    triggered = []
    for rule in rules:
        cond = rule.get("condition", lambda v, c: True)
        try:
            fires = cond(value, context)
        except Exception:
            fires = True
        if fires:
            consequence = {k: v for k, v in rule.items() if k != "condition"}
            consequence["triggered"] = True
            triggered.append(consequence)
    return triggered


def _determine_bond_type(dscr: float) -> str:
    if dscr >= 2.0:
        return "revenue_bond"
    elif dscr >= 1.75:
        return "revenue_bond"
    elif dscr >= 1.5:
        return "construction_bond"
    elif dscr >= 1.25:
        return "cmbs"
    else:
        return "b_tranche"


def _credit_grade_from_dscr(dscr: float, ltv: float = 0.60) -> str:
    if dscr >= 2.0 and ltv <= 0.55:
        return "A"
    elif dscr >= 1.75 and ltv <= 0.62:
        return "BBB+"
    elif dscr >= 1.6 and ltv <= 0.65:
        return "BBB"
    elif dscr >= 1.5 and ltv <= 0.70:
        return "BBB-"
    else:
        return "Sub-IG"


# ── Signal endpoint ──────────────────────────────────────────────────────────

@cns_signals_bp.route("/signal", methods=["POST"])
def emit_signal():
    """Emit a signal into the CNS rule engine.

    The engine evaluates the signal against all rules, returns every
    triggered consequence, and tells each affected module what to do next.
    This is the platform's reactive nervous system.
    """
    body = request.get_json() or {}

    signal_type = body.get("signal_type", "")
    value = body.get("value")
    deal_id = body.get("deal_id", "")
    context = body.get("context", {})

    if not signal_type:
        return _err("signal_type is required")
    if signal_type not in RULE_ENGINE and signal_type not in SIGNAL_TYPES:
        return _err(f"Unknown signal '{signal_type}'. Valid: {list(SIGNAL_TYPES.keys())}")

    # Evaluate rule engine
    consequences = _evaluate_signal(signal_type, value, context)

    # Compute derived values when relevant
    derived = {}

    if signal_type in ("dscr_change", "noi_change"):
        dscr = float(value) if value is not None else context.get("dscr", 1.5)
        ltv = float(context.get("ltv", 0.60))
        derived = {
            "computed_grade": _credit_grade_from_dscr(dscr, ltv),
            "eligible_bond_type": _determine_bond_type(dscr),
            "jpm_benchmark_check": {
                "A_threshold": dscr >= 2.0,
                "BBB_plus_threshold": dscr >= 1.75,
                "BBB_minus_threshold": dscr >= 1.5,
                "sub_ig": dscr < 1.5,
            },
            "emma_gate_status": "BREACH_NOTICE_REQUIRED" if dscr < 1.5 else ("WATCH" if dscr < 1.75 else "COMPLIANT"),
            "surety_tier": "Tier 1 Standard" if dscr >= 1.75 else ("Tier 2 Enhanced" if dscr >= 1.5 else "LC Required"),
        }

    elif signal_type == "rate_move":
        rate_delta_bps = float(value) if value is not None else 0
        derived = {
            "call_trigger_threshold_bps": 100,
            "call_triggered": abs(rate_delta_bps) >= 100,
            "vector_alert": "EXECUTE_CALL" if rate_delta_bps <= -100 else ("MONITOR" if rate_delta_bps <= -50 else "HOLD"),
            "affected_bond_types": ["b_tranche"] if rate_delta_bps > 0 else ["revenue_bond", "construction_bond"],
            "atlas_stress_required": abs(rate_delta_bps) >= 50,
        }

    elif signal_type in ("doc_uploaded", "doc_parsed", "spread_complete", "ratios_complete"):
        pipeline_stages = ["preflight", "doc_upload", "parse", "spread", "ratios", "memo",
                           "structure", "surety", "grading", "bond_desk", "placement"]
        stage_map = {
            "doc_uploaded": "parse",
            "doc_parsed": "spread",
            "spread_complete": "ratios",
            "ratios_complete": "memo",
        }
        next_stage = stage_map.get(signal_type, "unknown")
        derived = {
            "current_stage": signal_type.replace("_", " "),
            "next_stage": next_stage,
            "pipeline_stages": pipeline_stages,
            "auto_chains_to": next_stage,
        }

    # Build complete signal evaluation result
    result = {
        "signal_type": signal_type,
        "signal_description": SIGNAL_TYPES.get(signal_type, ""),
        "deal_id": deal_id,
        "value": value,
        "context": context,
        "evaluated_at": _ts(),
        "consequences": consequences,
        "consequence_count": len(consequences),
        "critical_count": len([c for c in consequences if c.get("priority") == "CRITICAL"]),
        "high_count": len([c for c in consequences if c.get("priority") == "HIGH"]),
        "derived": derived,
        "modules_affected": list({c["module"] for c in consequences}),
        "cascades": [c["cascades_to"] for c in consequences if c.get("cascades_to")],
        "next_actions": [
            {"module": c["module"], "action": c["action"], "priority": c["priority"]}
            for c in sorted(consequences, key=lambda x: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(x.get("priority", "LOW"), 4))
        ],
    }

    return _ok(result)


@cns_signals_bp.route("/rules", methods=["GET"])
def list_rules():
    """Return the full rule engine — every signal and its downstream consequences."""
    rules_summary = {}
    for sig_type, rules in RULE_ENGINE.items():
        rules_summary[sig_type] = {
            "description": SIGNAL_TYPES.get(sig_type, ""),
            "consequence_count": len(rules),
            "modules_affected": [r["module"] for r in rules],
            "has_critical": any(r.get("priority") == "CRITICAL" for r in rules),
        }
    return _ok({
        "total_signal_types": len(RULE_ENGINE),
        "total_rules": sum(len(r) for r in RULE_ENGINE.values()),
        "rules": rules_summary,
    })


@cns_signals_bp.route("/signal-types", methods=["GET"])
def list_signal_types():
    """Return all signal types the CNS understands."""
    return _ok(SIGNAL_TYPES)


@cns_signals_bp.route("/dscr-impact", methods=["POST"])
def dscr_impact():
    """Fast path: POST a DSCR value, get back full platform impact — grade, bond type, gates, surety."""
    body = request.get_json() or {}
    dscr = float(body.get("dscr", 1.5))
    ltv = float(body.get("ltv", 0.60))
    deal_id = body.get("deal_id", "")

    grade = _credit_grade_from_dscr(dscr, ltv)
    bond_type = _determine_bond_type(dscr)

    consequences = _evaluate_signal("dscr_change", dscr, {"ltv": ltv, "deal_id": deal_id})
    derived = {
        "computed_grade": grade,
        "eligible_bond_type": bond_type,
        "jpm_benchmark_check": {
            "A_threshold": dscr >= 2.0,
            "BBB_plus_threshold": dscr >= 1.75,
            "BBB_minus_threshold": dscr >= 1.5,
            "sub_ig": dscr < 1.5,
        },
        "emma_gate_status": "BREACH_NOTICE_REQUIRED" if dscr < 1.5 else ("WATCH" if dscr < 1.75 else "COMPLIANT"),
        "surety_tier": "Tier 1 Standard" if dscr >= 1.75 else ("Tier 2 Enhanced" if dscr >= 1.5 else "LC Required"),
    }

    return _ok({
        "deal_id": deal_id,
        "input": {"dscr": dscr, "ltv": ltv},
        "impact": derived,
        "consequences": consequences,
        "modules_affected": list({c["module"] for c in consequences}),
        "next_actions": [
            {"module": c["module"], "action": c["action"], "priority": c["priority"]}
            for c in sorted(consequences, key=lambda x: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(x.get("priority", "LOW"), 4))
        ],
    })
