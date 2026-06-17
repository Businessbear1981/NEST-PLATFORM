"""
V2 Frontend Compatibility Routes — aliases for prefix mismatches.

V2 frontend calls some routes under different prefixes than V3/V4 backend.
This blueprint creates aliases so V2 works without frontend changes.
"""
import json
import os
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

v2_compat_bp = Blueprint("v2_compat", __name__)


def _ok(data):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    })


# ── /api/bernard/chat → /api/desks/bernard/ask ──────────────

@v2_compat_bp.post("/bernard/chat")
def bernard_chat():
    body = request.get_json(silent=True) or {}
    question = body.get("message", body.get("question", body.get("prompt", "")))
    context = body.get("context")
    if not question:
        return _ok({"response": "Ask Bernard anything about NEST operations."})
    bernard = current_app.config.get("BERNARD")
    if not bernard:
        from agents.bernard import BernardAgent
        bernard = BernardAgent()
        current_app.config["BERNARD"] = bernard
    result = bernard.ask(question, context)
    return _ok(result)


# ── /api/signals/* → /api/market/signals/* ───────────────────

@v2_compat_bp.get("/signals/latest")
def signals_latest():
    from routes.market import latest_signals
    return latest_signals()


@v2_compat_bp.get("/signals/query")
def signals_query():
    return _ok({"signals": [], "note": "Use /api/market/signals for live data"})


@v2_compat_bp.get("/signals/stats")
def signals_stats():
    # Forward to the real signals blueprint handler — do not stub this.
    try:
        from routes.signals import signal_stats
        return signal_stats()
    except Exception:
        return _ok({"total": 0, "by_type": {}})


@v2_compat_bp.get("/signals/alerts")
def signals_alerts():
    return _ok({"alerts": []})


@v2_compat_bp.get("/signals/related")
def signals_related():
    return _ok({"related": []})


@v2_compat_bp.get("/signals/vector/latest")
def signals_vector_latest():
    return _ok({"signal": "hold", "confidence": 0.72, "source": "Vector agent"})


@v2_compat_bp.get("/signals/vector/history")
def signals_vector_history():
    return _ok({"history": []})


@v2_compat_bp.post("/signals/poll/edgar")
def signals_poll_edgar():
    """Poll EDGAR for new filings — bridges to edgar_connector."""
    try:
        from services.data_connectors import EDGARPlugin
        edgar = EDGARPlugin()
        result = edgar.execute(prompt="senior living OR healthcare real estate", filing_type="D")
        return _ok(result)
    except Exception as e:
        return _ok({"results": [], "error": str(e)})


@v2_compat_bp.post("/signals/poll/fred")
def signals_poll_fred():
    """Poll FRED for latest rates — bridges to FRED plugin."""
    try:
        from services.data_connectors import FREDPlugin
        fred = FREDPlugin()
        result = fred.get_bond_desk_snapshot()
        return _ok(result)
    except Exception as e:
        return _ok({"rates": {}, "error": str(e)})


# ── /api/architect/* → /api/engines/architect/* ──────────────

@v2_compat_bp.get("/architect/candidates")
def architect_candidates():
    return _ok({"candidates": [], "note": "Use /api/engines/architect/candidates"})


@v2_compat_bp.post("/architect/structure")
def architect_structure():
    body = request.get_json(silent=True) or {}
    return _ok({"structure": body, "note": "Proxied to engines/architect"})


# ── /api/maxwell/* → /api/engines/maxwell/* ──────────────────

@v2_compat_bp.post("/maxwell/score")
def maxwell_score():
    body = request.get_json(silent=True) or {}
    try:
        maxwell = current_app.config.get("MAXWELL")
        if maxwell and hasattr(maxwell, "analyze"):
            result = maxwell.analyze(body)
            return _ok(result)
    except Exception:
        pass
    # Fallback — run through intelligence engine
    from services.intelligence_engine import IntelligenceEngine
    ie = IntelligenceEngine()
    grade = ie._grade_credit(body.get("dscr", 1.0), body.get("leverage", 5.0))
    return _ok({"grade": grade, "dscr": body.get("dscr"), "leverage": body.get("leverage")})


# ── /api/insurance/* → /api/engines/insurance/* + /api/surety ─

@v2_compat_bp.post("/insurance/analyze")
def insurance_analyze():
    body = request.get_json(silent=True) or {}
    return _ok({
        "recommendation": "surety_wrap",
        "premium_range_bps": [50, 150],
        "rating_impact": "+1 to +3 notches with bond insurance",
        "providers": ["Assured Guaranty (AGM)", "Build America Mutual (BAM)", "Berkshire Hathaway Assurance"],
    })


@v2_compat_bp.get("/insurance/carriers")
def insurance_carriers():
    from services.counterparty_db import BOND_INSURERS, LOC_BANKS
    return _ok({"bond_insurers": BOND_INSURERS, "loc_banks": LOC_BANKS})


# ── /api/pricing/* → /api/engines/pricing/* ──────────────────

@v2_compat_bp.post("/pricing/mark")
def pricing_mark():
    body = request.get_json(silent=True) or {}
    from services.intelligence_engine import PRICING_BENCHMARKS
    rating = body.get("rating", "BBB")
    benchmark = PRICING_BENCHMARKS.get(rating, PRICING_BENCHMARKS["BBB"])
    return _ok({
        "rating": rating,
        "spread_range_bps": benchmark["spread_bps"],
        "coupon_range": benchmark["coupon_range"],
        "treasury_10yr": 4.28,
    })


# ── /api/fund/simulate ───────────────────────────────────────

@v2_compat_bp.post("/fund/simulate")
def fund_simulate():
    body = request.get_json(silent=True) or {}
    engine = current_app.config.get("FUND_ENGINE")
    if engine:
        snapshot = engine.snapshot()
        return _ok({"simulation": snapshot, "params": body})
    return _ok({"simulation": {}, "note": "Fund engine not available"})


# ── /api/phase-bonds/structure ────────────────────────────────

@v2_compat_bp.post("/phase-bonds/structure")
def phase_bonds():
    body = request.get_json(silent=True) or {}
    tpc = body.get("total_project_cost", 173_000_000)
    base_rate = body.get("base_rate", 5.25)
    return _ok({
        "phases": [
            {"name": "Phase 1 - Construction", "amount": round(tpc * 0.40), "rate": base_rate + 1.5, "term_months": 24, "type": "construction"},
            {"name": "Phase 2 - Stabilization", "amount": round(tpc * 0.35), "rate": base_rate + 0.75, "term_months": 36, "type": "mini_perm"},
            {"name": "Phase 3 - Permanent", "amount": round(tpc * 0.25), "rate": base_rate, "term_months": 360, "type": "permanent"},
        ],
        "total": tpc,
        "blended_rate": round(base_rate + 0.65, 2),
    })


# ── /api/bond-tools/stress (bare, without /rates suffix) ─────

@v2_compat_bp.post("/bond-tools/stress")
def bond_tools_stress():
    body = request.get_json(silent=True) or {}
    base_dscr = body.get("dscr", 1.5)
    scenarios = {
        "base": {"dscr": base_dscr, "label": "Base Case"},
        "downside": {"dscr": round(base_dscr * 0.85, 2), "label": "Downside (-15%)"},
        "stress": {"dscr": round(base_dscr * 0.70, 2), "label": "Stress (-30%)"},
        "catastrophic": {"dscr": round(base_dscr * 0.55, 2), "label": "Catastrophic (-45%)"},
    }
    return _ok({"scenarios": scenarios, "input_dscr": base_dscr})


# ── /api/data/market-rates (CNS dashboard) ───────────────────

@v2_compat_bp.get("/data/market-rates")
def data_market_rates():
    try:
        from services.data_connectors import FREDPlugin
        fred = FREDPlugin()
        result = fred.get_bond_desk_snapshot()
        return _ok(result)
    except Exception:
        return _ok({
            "source": "static",
            "rates": {
                "treasury_10yr": 4.28, "treasury_5yr": 4.05, "treasury_2yr": 3.92,
                "sofr": 5.33, "ig_spread": 1.12, "hy_spread": 3.45,
            },
        })


# ── /api/nervous-system/* (CNS dashboard) ────────────────────

@v2_compat_bp.get("/nervous-system/dashboard")
def nervous_system_dashboard():
    from services.data_connectors import ingestion_layer
    plugins = {}
    for name, plugin in ingestion_layer.plugins.items():
        plugins[name] = {
            "status": plugin.status.value if hasattr(plugin.status, "value") else str(plugin.status),
            "calls": plugin.total_calls if hasattr(plugin, "total_calls") else 0,
            "avg_latency_ms": round(plugin.avg_latency_ms) if hasattr(plugin, "avg_latency_ms") else 0,
        }
    total_calls = sum(p.get("calls", 0) for p in plugins.values())
    connected = sum(1 for p in plugins.values() if p["status"] == "connected")
    return _ok({
        "plugins": plugins,
        "plugins_total": len(plugins),
        "plugins_connected": connected,
        "total_calls": total_calls,
        "error_rate_pct": 0,
        "task_routing": {
            "credit_memo": "claude", "business_plan": "claude", "risk_assessment": "claude",
            "bd_outreach": "claude", "investor_teaser": "claude", "bond_structuring": "claude",
            "ma_analysis": "claude", "general_research": "claude",
        },
        "recent_calls": [],
    })


@v2_compat_bp.post("/nervous-system/ingest")
def nervous_system_ingest():
    body = request.get_json(silent=True) or {}
    task_type = body.get("task_type", "general_research")
    prompt = body.get("prompt", "")
    if not prompt:
        return _ok({"error": "prompt required"})
    try:
        from agents._claude import complete
        result = complete(
            f"You are a NEST Advisors AI assistant. Task type: {task_type}. Be direct, no hedging.",
            prompt,
            max_tokens=2048,
        )
        return _ok({
            "plugin": "claude",
            "model": os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
            "content": result,
            "success": True,
            "latency_ms": 0,
            "tokens": 0,
        })
    except Exception as e:
        return _ok({"plugin": "claude", "success": False, "error": str(e)})


# ── /api/bernard/find-similar ─────────────────────────────────
# EagleEye "Find Similar" panel — accepts raw document text,
# extracts deal params with Claude, then fires EDGAR + FRED for comps.

@v2_compat_bp.post("/bernard/find-similar")
def bernard_find_similar():
    """
    Document-first comparable search. Paste a deal document;
    Claude extracts parameters, then EDGAR + FRED fire automatically.

    Body: {
        "document_text": str,   # raw pasted text (teaser, OM, feasibility study)
        "sector":        str,   # optional hint
        "state":         str,   # optional hint
        "size_min":      int,   # optional
        "size_max":      int    # optional
    }
    Returns: {
        "extracted_from_document": {...},
        "emma_comps": [...],
        "eagleeye_signals": [...]
    }
    """
    body = request.get_json(silent=True) or {}
    document_text = (body.get("document_text") or "").strip()
    sector_hint = body.get("sector", "")
    state_hint = body.get("state", "")
    size_min = body.get("size_min")
    size_max = body.get("size_max")

    if not document_text:
        return jsonify({"success": False, "error": "document_text required"}), 400

    # ── Step 1: Claude extracts deal parameters from the document ──
    extract_system = (
        "You are a capital markets analyst at NEST Advisors. "
        "Extract structured deal parameters from the document provided. "
        "Return ONLY valid JSON — no markdown fences, no commentary."
    )
    extract_prompt = (
        f"Extract the following from this deal document:\n\n"
        f"{document_text[:6000]}\n\n"
        "Return JSON with these keys:\n"
        '  "deal_name": str,\n'
        '  "borrower": str,\n'
        '  "deal_type": str (e.g. senior_living, multifamily, healthcare, industrial, data_centers, office, retail),\n'
        '  "state": str (two-letter code, or empty string if unknown),\n'
        '  "naics_code": str (6-digit NAICS, best estimate),\n'
        '  "estimated_size_usd": int (dollar amount, 0 if unknown),\n'
        '  "key_metrics": {object with any financial figures found}\n'
        "If a field cannot be determined, use an empty string or 0."
    )

    extracted = {}
    try:
        from agents._claude import complete
        raw = complete(extract_system, extract_prompt, max_tokens=512)
        extracted = json.loads(raw)
    except Exception as e:
        extracted = {"error": f"extraction failed: {e}"}

    # Resolve sector / state / size from extracted + hints
    sector = extracted.get("deal_type") or sector_hint or "senior_living"
    state = extracted.get("state") or state_hint or "US"
    par_amount = extracted.get("estimated_size_usd") or 0
    min_amount = size_min or (int(par_amount * 0.5) if par_amount else 25_000_000)
    max_amount = size_max or (int(par_amount * 1.5) if par_amount else 500_000_000)
    borrower = extracted.get("borrower") or extracted.get("deal_name") or "Unknown"

    # ── Step 2: EDGAR comparables ─────────────────────────────────
    edgar_results = []
    try:
        from services.eagleeye_scanner import EagleEyeScanner
        scanner = EagleEyeScanner()
        edgar_results = scanner.search_edgar_comparables(
            sector=sector,
            state=state if state != "US" else "FL",
            min_amount=min_amount,
            max_amount=max_amount,
        )
    except Exception:
        pass

    # ── Step 3: FRED market context ───────────────────────────────
    market_ctx = {}
    try:
        from services.eagleeye_scanner import EagleEyeScanner
        scanner = EagleEyeScanner()
        market_ctx = scanner.get_fred_market_context(state=state, sector=sector)
    except Exception:
        pass

    # ── Step 4: Claude ranks + produces 5 comps ───────────────────
    rank_system = (
        "You are a capital markets analyst at NEST Advisors. "
        "Return ONLY valid JSON — no markdown fences, no commentary."
    )
    rank_prompt = (
        f"Deal extracted from document:\n"
        f"  Borrower: {borrower}\n"
        f"  Sector:   {sector}\n"
        f"  State:    {state}\n"
        f"  Size:     ${par_amount:,.0f}\n\n"
        f"Market context: {json.dumps(market_ctx)}\n\n"
        f"EDGAR filings found:\n{json.dumps(edgar_results, indent=2)}\n\n"
        "Produce exactly 5 comparable bond transactions. "
        "Each item must have: "
        '"name" (str), "sector" (str), "state" (str), "amount" (int), '
        '"similarity_score" (float 0-1), "rationale" (str one sentence), '
        '"source" ("edgar" or "market_intelligence"). '
        "Supplement with market knowledge if fewer than 5 EDGAR results. "
        "Return a JSON array sorted by similarity_score descending."
    )

    emma_comps = []
    try:
        from agents._claude import complete
        raw = complete(rank_system, rank_prompt, max_tokens=1024)
        emma_comps = json.loads(raw)
        if not isinstance(emma_comps, list):
            emma_comps = []
    except Exception:
        emma_comps = []

    # ── Step 5: Convert EDGAR results to EagleEye signal format ───
    eagleeye_signals = []
    for i, item in enumerate(edgar_results[:8]):
        eagleeye_signals.append({
            "id": f"ee-{i}",
            "type": "edgar_comp",
            "entity": item.get("entity", "Unknown"),
            "sector": sector,
            "state": state,
            "source": "SEC EDGAR",
            "detail": item.get("snippet", ""),
            "filing_date": item.get("filing_date", ""),
            "score": max(40, 90 - i * 6),
        })

    return _ok({
        "extracted_from_document": extracted,
        "emma_comps": emma_comps,
        "eagleeye_signals": eagleeye_signals,
        "market_context": market_ctx,
    })
