"""
NEST EagleEye Routes — Business Development & Deal Sourcing.
Pillar 1: Scans UCC filings, title reports, permits, EDGAR, market signals.
"""
from flask import Blueprint, jsonify, request
from services.auth import require_auth
from datetime import datetime
import json
import threading
import uuid

from agents._claude import complete
from services.eagleeye_scanner import EagleEyeScanner

eagleeye_bp = Blueprint("eagleeye", __name__)

_signals: list[dict] = []
_scout_runs = []
_lock = threading.Lock()
_scanner = EagleEyeScanner()


def _seed_signals_from_edgar() -> None:
    """Lazily populate _signals from EDGAR on first GET /signals request."""
    global _signals
    try:
        raw = _scanner.search_edgar_comparables(
            sector="senior_living", state="FL",
            min_amount=25_000_000, max_amount=500_000_000
        )
        seeded = []
        for i, item in enumerate(raw[:10], start=1):
            seeded.append({
                "id": f"sig_{i}",
                "type": "edgar_filing",
                "source": "SEC EDGAR",
                "entity": item.get("entity", "Unknown"),
                "amount_usd": 0,
                "naics": "6232",
                "state": "US",
                "county": "",
                "detail": item.get("snippet", "")[:200],
                "score": max(10, 80 - i * 5),
                "status": "warm",
                "discoveredAt": item.get("filing_date", datetime.utcnow().isoformat()),
            })
        if seeded:
            _signals = seeded
    except Exception:
        pass  # Leave _signals empty — caller handles gracefully


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg,
                    "timestamp": datetime.utcnow().isoformat()}), code


@eagleeye_bp.route("/signals", methods=["GET"])

def list_signals():
    """All discovered deal signals, sorted by score."""
    # Lazy seed from EDGAR on first call
    with _lock:
        if not _signals:
            _seed_signals_from_edgar()

    status_filter = request.args.get("status")
    naics_filter = request.args.get("naics")
    with _lock:
        filtered = _signals[:]
    if status_filter:
        filtered = [s for s in filtered if s["status"] == status_filter]
    if naics_filter:
        filtered = [s for s in filtered if s["naics"] == naics_filter]
    filtered.sort(key=lambda s: s["score"], reverse=True)
    return _ok({
        "signals": filtered,
        "total": len(filtered),
        "hot": sum(1 for s in filtered if s["status"] == "hot"),
        "warm": sum(1 for s in filtered if s["status"] == "warm"),
    })


@eagleeye_bp.route("/signals/<signal_id>", methods=["GET"])

def get_signal(signal_id):
    with _lock:
        sig = next((s for s in _signals if s["id"] == signal_id), None)
    if not sig:
        return _err("Signal not found", 404)
    return _ok(sig)


@eagleeye_bp.route("/signals/<signal_id>/status", methods=["PATCH"])
def update_signal_status(signal_id):
    b = request.get_json() or {}
    new_status = b.get("status")
    valid = ["hot", "warm", "review", "passed", "converted"]
    if new_status not in valid:
        return _err(f"Status must be one of: {valid}")
    with _lock:
        sig = next((s for s in _signals if s["id"] == signal_id), None)
        if not sig:
            return _err("Signal not found", 404)
        sig["status"] = new_status
    return _ok(sig)


@eagleeye_bp.route("/scout", methods=["POST"])
def run_scout():
    """Run AI-powered scout — searches for new deal opportunities."""
    b = request.get_json() or {}
    target_naics = b.get("naics", "6232")
    target_states = b.get("states", ["FL", "TX", "AZ", "CA", "WA"])
    min_size = b.get("min_size_usd", 25_000_000)

    from services.ai_router import plugin_hub
    from services.core import NAICS

    naics_desc = NAICS.get(target_naics, "Unknown")
    prompt = (
        f"You are a bond origination scout. Find 3 realistic deal opportunities "
        f"in {naics_desc} (NAICS {target_naics}) across {', '.join(target_states)}. "
        f"Minimum deal size: ${min_size:,.0f}. "
        f"For each, provide: entity name, city/state, estimated project cost, "
        f"NAICS code, deal type (new development/acquisition/refinance), "
        f"and a 1-sentence rationale. Format as numbered list."
    )

    result = plugin_hub.route("bd_outreach", prompt)

    run = {
        "id": f"scout_{len(_scout_runs)+1}",
        "naics": target_naics,
        "naics_desc": naics_desc,
        "states": target_states,
        "min_size_usd": min_size,
        "ai_results": result.get("content", "") if result.get("success") else "Scout unavailable",
        "tool_used": result.get("tool", "none"),
        "timestamp": datetime.utcnow().isoformat(),
    }
    with _lock:
        _scout_runs.append(run)

    return _ok(run)


@eagleeye_bp.route("/scout/history", methods=["GET"])

def scout_history():
    with _lock:
        return _ok(_scout_runs[::-1])


@eagleeye_bp.route("/convert/<signal_id>", methods=["POST"])
def convert_to_deal(signal_id):
    """Convert a signal into a NEST deal — pushes to Roots."""
    with _lock:
        sig = next((s for s in _signals if s["id"] == signal_id), None)
    if not sig:
        return _err("Signal not found", 404)

    # Create deal stub from signal
    deal_stub = {
        "name": sig["entity"],
        "source": "eagleeye",
        "signal_id": sig["id"],
        "naics": sig["naics"],
        "state": sig["state"],
        "county": sig.get("county", ""),
        "estimated_cost_usd": sig["amount_usd"],
        "status": "intake",
        "eagleeye_score": sig["score"],
        "convertedAt": datetime.utcnow().isoformat(),
    }

    with _lock:
        sig["status"] = "converted"

    return _ok(deal_stub)


@eagleeye_bp.route("/promote/<signal_id>", methods=["POST"])
def promote_to_prospect(signal_id):
    """Promote a signal to a deal prospect in the NEST pipeline."""
    with _lock:
        sig = next((s for s in _signals if s["id"] == signal_id), None)
    if not sig:
        return _err("Signal not found", 404)

    if sig.get("status") == "promoted":
        return _err("Signal already promoted", 409)

    # Build a deal stub from the signal fields
    deal = {
        "id": str(uuid.uuid4()),
        "name": sig.get("entity", sig.get("name", "Unknown")),
        "source": "eagleeye_signal",
        "signal_id": signal_id,
        "sector": sig.get("naics", sig.get("signal_type", "unknown")),
        "state": sig.get("state", ""),
        "stage": "prospect",
        "status": "intake",
        "amount": sig.get("amount_usd", sig.get("par_amount", 0)),
        "created_at": datetime.utcnow().isoformat(),
        "grade": sig.get("grade", "WARM"),
        "source_url": sig.get("edgar_url", ""),
        "notes": sig.get("detail", sig.get("snippet", "")),
        "eagleeye_score": sig.get("score", 0),
    }

    # Push into deals in-memory store
    try:
        from routes.deals import _deals, _lock as deals_lock
        with deals_lock:
            _deals[deal["id"]] = deal
    except Exception:
        pass  # Deals store unavailable — deal stub still returned

    # Mark signal as promoted
    with _lock:
        sig["status"] = "promoted"
        sig["promoted_deal_id"] = deal["id"]

    return _ok({"deal": deal, "signal_id": signal_id})


@eagleeye_bp.route("/find-similar", methods=["POST"])
def find_similar():
    """
    Find comparable transactions for a deal using EDGAR + FRED + Claude.

    Body: {
        "borrower":   str,
        "sector":     str,   # senior_living | healthcare | multifamily | etc.
        "state":      str,   # two-letter code
        "par_amount": int,   # dollars
        "naics_code": str    # optional
    }
    """
    body = request.get_json() or {}
    borrower = body.get("borrower", "").strip()
    sector = body.get("sector", "").strip()
    state = body.get("state", "").strip()
    par_amount = body.get("par_amount")
    naics_code = body.get("naics_code", "")

    # Validate required fields
    missing = [f for f, v in [("borrower", borrower), ("sector", sector),
                               ("state", state), ("par_amount", par_amount)] if not v]
    if missing:
        return _err(f"Missing required fields: {', '.join(missing)}", 400)

    try:
        par_amount = int(par_amount)
    except (TypeError, ValueError):
        return _err("par_amount must be an integer", 400)

    # 1 — EDGAR comparables
    edgar_results = []
    try:
        edgar_results = _scanner.search_edgar_comparables(
            sector=sector,
            state=state,
            min_amount=int(par_amount * 0.5),
            max_amount=int(par_amount * 1.5),
        )
    except Exception:
        pass

    # 2 — FRED market context
    market_ctx = {}
    try:
        market_ctx = _scanner.get_fred_market_context(state=state, sector=sector)
    except Exception:
        pass

    ten_yr = market_ctx.get("ten_yr_treasury", "N/A")
    mortgage_30 = market_ctx.get("mortgage_30yr", "N/A")
    cre_delinq = market_ctx.get("cre_delinquency", "N/A")

    # 3 — Ask Claude to rank + supplement to 5 comps
    edgar_json = json.dumps(edgar_results, indent=2)
    system_prompt = (
        "You are a capital markets analyst at NEST Advisors. "
        "Return ONLY valid JSON — no markdown fences, no commentary."
    )
    user_prompt = (
        f"Given this deal:\n"
        f"Borrower: {borrower}, Sector: {sector}, State: {state}, "
        f"Amount: ${par_amount:,.0f}\n\n"
        f"Market context: 10yr={ten_yr}%, 30yr mortgage={mortgage_30}%, "
        f"CRE delinquency={cre_delinq}%\n\n"
        f"EDGAR comparable filings found:\n{edgar_json}\n\n"
        "Return exactly 5 comparable transactions as a JSON array. "
        "Each item must have these keys: "
        '"name" (str), "sector" (str), "state" (str), "amount" (int), '
        '"similarity_score" (float 0-1), "rationale" (str, one sentence), '
        '"source" ("edgar" or "market_intelligence"). '
        "If fewer than 5 EDGAR results exist, supplement with market knowledge. "
        "Sort by similarity_score descending."
    )

    comparables = []
    try:
        raw_response = complete(system_prompt, user_prompt, max_tokens=1024)
        comparables = json.loads(raw_response)
        if not isinstance(comparables, list):
            raise ValueError("Response is not a list")
    except Exception:
        # Best-effort: convert EDGAR results directly
        comparables = [
            {
                "name": r.get("entity", "Unknown"),
                "sector": sector,
                "state": state,
                "amount": par_amount,
                "similarity_score": 0.5,
                "rationale": r.get("snippet", "EDGAR filing comparable."),
                "source": "edgar",
            }
            for r in edgar_results[:5]
        ]

    return _ok({
        "comparables": comparables[:5],
        "market_context": market_ctx,
        "query": {
            "borrower": borrower,
            "sector": sector,
            "state": state,
            "par_amount": par_amount,
            "naics_code": naics_code,
        },
    })


@eagleeye_bp.route("/ipo-readiness", methods=["POST"])
def ipo_readiness():
    """Assess IPO readiness for a target company."""
    body = request.get_json() or {}
    from agents.merlin import merlin
    result = merlin.assess_ipo_readiness(body.get("target", {}))
    return _ok(result)


# ── M&A ENGINE ─────────────────────────────────────────────────────────────

MA_NAICS_TARGETS = {
    "3310": "Primary Metal Manufacturing",
    "3320": "Fabricated Metal Manufacturing",
    "3340": "Computer & Electronic Products",
    "3360": "Transportation Equipment",
    "5610": "Administrative Support Services",
    "5620": "Waste Management Services",
    "6210": "Ambulatory Health Care",
    "6230": "Nursing & Residential Care",
    "7210": "Accommodation",
    "4940": "Warehousing & Storage",
}

_ma_cache: dict = {}
_ma_lock = threading.Lock()


@eagleeye_bp.route("/ma-scan", methods=["POST"])
def ma_scan():
    """
    M&A deal sourcing: targets $30-150M revenue, sub-$20M EBITDA.
    Body: { naics?: str[], states?: str[], refresh?: bool }
    """
    body = request.get_json() or {}
    target_naics = body.get("naics", list(MA_NAICS_TARGETS.keys())[:5])
    target_states = body.get("states", ["FL", "TX", "AZ", "WA", "CA", "GA", "NC"])
    refresh = body.get("refresh", False)

    cache_key = f"{'_'.join(sorted(target_states))}"
    with _ma_lock:
        if not refresh and cache_key in _ma_cache:
            cached = _ma_cache[cache_key]
            if (datetime.utcnow() - cached["ts"]).seconds < 1800:
                return _ok(cached["data"])

    # Build EDGAR scan results per NAICS group
    all_edgar = []
    for naics in target_naics[:3]:
        try:
            results = _scanner.search_edgar_comparables(
                sector=MA_NAICS_TARGETS.get(naics, "industrial"),
                state=target_states[0],
                min_amount=30_000_000,
                max_amount=150_000_000,
            )
            for r in results[:3]:
                all_edgar.append({
                    "entity": r.get("entity", "Unknown"),
                    "naics": naics,
                    "sector_label": MA_NAICS_TARGETS.get(naics, "Unknown"),
                    "state": r.get("state", target_states[0]),
                    "source": "EDGAR",
                    "snippet": r.get("snippet", "")[:200],
                    "filing_date": r.get("filing_date", ""),
                })
        except Exception:
            pass

    # Ask Claude to synthesize 6 qualified M&A targets
    system_prompt = (
        "You are an M&A deal origination specialist at NEST Advisors. "
        "NEST arranges financing for acquisitions of lower-middle-market companies "
        "($30M–$150M revenue) using proprietary bond structures. "
        "Return ONLY valid JSON, no markdown."
    )
    user_prompt = (
        f"Generate 6 qualified M&A acquisition targets for NEST. "
        f"Focus states: {', '.join(target_states)}. "
        f"Revenue range: $30M–$150M. EBITDA: sub-$20M. "
        f"Target sectors: {', '.join(MA_NAICS_TARGETS.values())}. "
        f"EDGAR signals found:\n{json.dumps(all_edgar, indent=2)}\n\n"
        "Return a JSON array of 6 targets, each with keys: "
        '"name" (company name, str), "sector" (str), "naics_code" (str), '
        '"state" (2-letter), "city" (str), '
        '"est_revenue_usd" (int, $30M–$150M range), '
        '"est_ebitda_usd" (int, sub-$20M), '
        '"deal_type" ("acquisition"|"recap"|"growth_capital"), '
        '"acquisition_thesis" (str, one sentence), '
        '"score" (int 1-100), '
        '"source" ("edgar"|"market_intelligence"). '
        "Sort by score descending."
    )

    targets = []
    try:
        raw = complete(system_prompt, user_prompt, max_tokens=1500)
        parsed = json.loads(raw)
        targets = parsed if isinstance(parsed, list) else parsed.get("targets", [])
    except Exception:
        # Fallback static targets if Claude or EDGAR unavailable
        targets = [
            {
                "name": "Apex Industrial Holdings LLC",
                "sector": "Fabricated Metal Manufacturing",
                "naics_code": "3320",
                "state": "FL",
                "city": "Tampa",
                "est_revenue_usd": 78_000_000,
                "est_ebitda_usd": 8_200_000,
                "deal_type": "acquisition",
                "acquisition_thesis": "Family-owned fabricator, no succession plan — NEST bond structure achieves tax-efficient transfer at 6.5x EBITDA.",
                "score": 87,
                "source": "market_intelligence",
            },
            {
                "name": "Coastal Healthcare Services Group",
                "sector": "Ambulatory Health Care",
                "naics_code": "6210",
                "state": "GA",
                "city": "Atlanta",
                "est_revenue_usd": 112_000_000,
                "est_ebitda_usd": 14_600_000,
                "deal_type": "growth_capital",
                "acquisition_thesis": "Regional outpatient platform expanding into FL/NC; needs $50M structured capital for 3 clinic acquisitions.",
                "score": 82,
                "source": "market_intelligence",
            },
            {
                "name": "Sunstate Distribution Partners",
                "sector": "Warehousing & Storage",
                "naics_code": "4940",
                "state": "TX",
                "city": "Houston",
                "est_revenue_usd": 55_000_000,
                "est_ebitda_usd": 6_800_000,
                "deal_type": "recap",
                "acquisition_thesis": "Last-mile logistics operator; PE exit in 18 months creates acquisition window at sub-8x EBITDA.",
                "score": 74,
                "source": "market_intelligence",
            },
            {
                "name": "Pacific Waste Solutions Inc",
                "sector": "Waste Management Services",
                "naics_code": "5620",
                "state": "WA",
                "city": "Seattle",
                "est_revenue_usd": 43_000_000,
                "est_ebitda_usd": 5_100_000,
                "deal_type": "acquisition",
                "acquisition_thesis": "Essential services platform with municipal contracts; stable cash flows ideal for NEST bond financing at 6.0% coupon.",
                "score": 71,
                "source": "market_intelligence",
            },
            {
                "name": "Meridian Administrative Solutions",
                "sector": "Administrative Support Services",
                "naics_code": "5610",
                "state": "AZ",
                "city": "Phoenix",
                "est_revenue_usd": 38_000_000,
                "est_ebitda_usd": 4_400_000,
                "deal_type": "growth_capital",
                "acquisition_thesis": "BPO firm with government contracts; organic growth constrained by capital — $20M structured note unlocks 3 new contracts.",
                "score": 65,
                "source": "market_intelligence",
            },
            {
                "name": "Blue Ridge Accommodations LLC",
                "sector": "Accommodation",
                "naics_code": "7210",
                "state": "NC",
                "city": "Charlotte",
                "est_revenue_usd": 67_000_000,
                "est_ebitda_usd": 9_300_000,
                "deal_type": "recap",
                "acquisition_thesis": "Extended-stay portfolio owner seeking recap to fund 2 new properties; existing lender relationship provides pre-diligence advantage.",
                "score": 60,
                "source": "market_intelligence",
            },
        ]

    payload = {
        "targets": targets[:6],
        "total": len(targets),
        "scan_states": target_states,
        "scan_naics": target_naics,
        "edgar_signals": len(all_edgar),
        "timestamp": datetime.utcnow().isoformat(),
    }
    with _ma_lock:
        _ma_cache[cache_key] = {"data": payload, "ts": datetime.utcnow()}
    return _ok(payload)


# ── CRE HEAT MAP ────────────────────────────────────────────────────────────

CRE_STATES = [
    "FL", "TX", "CA", "AZ", "GA", "NC", "WA", "CO", "NV", "TN",
    "OH", "IL", "PA", "NY", "VA",
]

_cre_cache: dict = {}
_cre_lock = threading.Lock()


@eagleeye_bp.route("/cre-heatmap", methods=["GET"])
def cre_heatmap():
    """
    CRE distressed-property heat map — bridge maturities, dark zones, refi signals.
    Returns state-level summaries and top property targets.
    """
    refresh = request.args.get("refresh", "false").lower() == "true"

    with _cre_lock:
        if not refresh and "heatmap" in _cre_cache:
            cached = _cre_cache["heatmap"]
            if (datetime.utcnow() - cached["ts"]).seconds < 900:
                return _ok(cached["data"])

    # Aggregate signals by state from existing signal store
    with _lock:
        cre_signals = [
            s for s in _signals
            if s.get("naics", "").startswith("62") or s.get("status") in ("hot", "warm")
        ]

    # Build state heat map via Claude
    system_prompt = (
        "You are a CRE distressed asset analyst at NEST Advisors. "
        "Return ONLY valid JSON, no markdown fences."
    )
    user_prompt = (
        "Generate a CRE distressed-property heat map for NEST deal sourcing. "
        "Focus on: (1) bridge loans maturing 6-18 months, "
        "(2) CMBS special servicing, (3) stabilized refi opportunities. "
        "Asset classes: senior living, multifamily, industrial, retail, hospitality. "
        f"Target states: {', '.join(CRE_STATES[:10])}. "
        "Return JSON with two keys: "
        '"states" (array of 10 state objects, each with: '
        '"state" (2-letter), "heat_score" (int 1-100), '
        '"signal_count" (int), "pipeline_usd" (int), '
        '"top_signal" (str, one sentence), '
        '"deal_types" (array of str)); '
        '"top_properties" (array of 5 property objects, each with: '
        '"name" (str), "asset_type" (str), "state" (2-letter), "city" (str), '
        '"signal_type" ("bridge_maturing"|"stabilized_refi"|"distressed"|"cmbs_watch"), '
        '"loan_amount_usd" (int), "maturity_months" (int or null), '
        '"estimated_noi_usd" (int), "opportunity_score" (int 1-100), '
        '"thesis" (str, one sentence)). '
        "Sort states by heat_score desc, properties by opportunity_score desc."
    )

    states_data = []
    top_properties = []
    try:
        raw = complete(system_prompt, user_prompt, max_tokens=2000)
        parsed = json.loads(raw)
        states_data = parsed.get("states", [])
        top_properties = parsed.get("top_properties", [])
    except Exception:
        # Fallback static heat map
        states_data = [
            {"state": "FL", "heat_score": 94, "signal_count": 18, "pipeline_usd": 412_000_000,
             "top_signal": "CMBS bridge maturities concentrated in Orlando + Tampa senior living corridor",
             "deal_types": ["senior_living", "multifamily", "hospitality"]},
            {"state": "TX", "heat_score": 88, "signal_count": 14, "pipeline_usd": 310_000_000,
             "top_signal": "Houston industrial bridge wave — $200M+ maturing Q3-Q4 2026",
             "deal_types": ["industrial", "multifamily", "mixed_use"]},
            {"state": "AZ", "heat_score": 81, "signal_count": 11, "pipeline_usd": 225_000_000,
             "top_signal": "Phoenix multifamily stabilized — 87% occupancy, ready for perm bond takeout",
             "deal_types": ["multifamily", "senior_living", "retail"]},
            {"state": "GA", "heat_score": 76, "signal_count": 9, "pipeline_usd": 188_000_000,
             "top_signal": "Atlanta suburban office conversion wave — 3 CMBS loans in special servicing",
             "deal_types": ["office", "multifamily", "industrial"]},
            {"state": "NC", "heat_score": 71, "signal_count": 7, "pipeline_usd": 142_000_000,
             "top_signal": "Charlotte metro senior living expansion — 4 operators seeking construction bonds",
             "deal_types": ["senior_living", "multifamily"]},
            {"state": "WA", "heat_score": 68, "signal_count": 6, "pipeline_usd": 98_000_000,
             "top_signal": "Seattle industrial last-mile stabilized refi opportunity — low cap rates",
             "deal_types": ["industrial", "multifamily"]},
            {"state": "CO", "heat_score": 64, "signal_count": 5, "pipeline_usd": 87_000_000,
             "top_signal": "Denver hospitality portfolio — bridge maturity wall in 9 months",
             "deal_types": ["hospitality", "multifamily"]},
            {"state": "CA", "heat_score": 61, "signal_count": 8, "pipeline_usd": 215_000_000,
             "top_signal": "LA multifamily distressed — rising vacancies + CMBS watch list",
             "deal_types": ["multifamily", "retail"]},
            {"state": "NV", "heat_score": 57, "signal_count": 4, "pipeline_usd": 63_000_000,
             "top_signal": "Vegas hospitality CMBS special servicing — 2 loans in workout",
             "deal_types": ["hospitality"]},
            {"state": "TN", "heat_score": 53, "signal_count": 4, "pipeline_usd": 71_000_000,
             "top_signal": "Nashville senior living construction exit — below stabilization, needs bridge",
             "deal_types": ["senior_living", "multifamily"]},
        ]
        top_properties = [
            {"name": "Jacaranda Trace Senior Living",
             "asset_type": "senior_living", "state": "FL", "city": "Venice",
             "signal_type": "stabilized_refi", "loan_amount_usd": 231_000_000,
             "maturity_months": None, "estimated_noi_usd": 18_500_000,
             "opportunity_score": 96,
             "thesis": "Series 2025 PAB positioned for $231M permanent bond — Baa1/BBB+ rated, surety-enhanced."},
            {"name": "Convivial St. Petersburg",
             "asset_type": "senior_living", "state": "FL", "city": "St. Petersburg",
             "signal_type": "bridge_maturing", "loan_amount_usd": 172_500_000,
             "maturity_months": 8, "estimated_noi_usd": 14_200_000,
             "opportunity_score": 91,
             "thesis": "Construction loan matures Q1 2027 — $172.5M construction bond under structuring."},
            {"name": "Pacific Ridge Senior Living",
             "asset_type": "senior_living", "state": "WA", "city": "Bellevue",
             "signal_type": "bridge_maturing", "loan_amount_usd": 67_000_000,
             "maturity_months": 6, "estimated_noi_usd": 5_800_000,
             "opportunity_score": 83,
             "thesis": "Bridge approaching maturity at 78% occupancy — NEST bridge-to-bond structure fits."},
            {"name": "Desert Springs CCRC",
             "asset_type": "senior_living", "state": "AZ", "city": "Scottsdale",
             "signal_type": "cmbs_watch", "loan_amount_usd": 85_000_000,
             "maturity_months": 12, "estimated_noi_usd": 7_100_000,
             "opportunity_score": 78,
             "thesis": "CMBS loan on watch list — A3 rated CCRC seeking perm bond refinance."},
            {"name": "Dominion Edge Data Centers",
             "asset_type": "industrial", "state": "VA", "city": "Ashburn",
             "signal_type": "stabilized_refi", "loan_amount_usd": 120_000_000,
             "maturity_months": None, "estimated_noi_usd": 9_600_000,
             "opportunity_score": 74,
             "thesis": "Stabilized data center at 96% occupancy — revenue bond refi saves 85bps vs current rate."},
        ]

    payload = {
        "states": states_data,
        "top_properties": top_properties,
        "total_pipeline_usd": sum(s.get("pipeline_usd", 0) for s in states_data),
        "total_signals": sum(s.get("signal_count", 0) for s in states_data),
        "timestamp": datetime.utcnow().isoformat(),
    }
    with _cre_lock:
        _cre_cache["heatmap"] = {"data": payload, "ts": datetime.utcnow()}
    return _ok(payload)


@eagleeye_bp.route("/stats", methods=["GET"])
def stats():
    with _lock:
        total = len(_signals)
        pipeline_usd = sum(s["amount_usd"] for s in _signals if s["status"] in ("hot", "warm"))
        converted = sum(1 for s in _signals if s["status"] == "converted")
    return _ok({
        "total_signals": total,
        "pipeline_usd": pipeline_usd,
        "converted": converted,
        "scout_runs": len(_scout_runs),
    })


# ── OPERATORS: LEARNING LOOP ─────────────────────────────────────────────────
# EagleEye mounts this on load to prime the intelligence cycle.
# Fires EDGAR + FRED → Claude synthesizes → returns actionable items.

@eagleeye_bp.route("/operators/learning-loop", methods=["POST"])
def operators_learning_loop():
    """
    Auto-fired on EagleEye mount. Pulls live EDGAR + FRED signals,
    runs Claude analysis, and returns a prioritized action list.

    Body: { sector?: str, state?: str }   (both optional — scans broadly if omitted)
    Returns: { actions: [...], signals_pulled: int, market_snapshot: {...} }
    """
    body = request.get_json(silent=True) or {}
    sector = body.get("sector", "senior_living")
    state = body.get("state", "FL")

    # 1 — Pull live EDGAR signals
    edgar_signals = []
    try:
        edgar_signals = _scanner.search_edgar_comparables(
            sector=sector,
            state=state,
            min_amount=25_000_000,
            max_amount=500_000_000,
        )
    except Exception:
        pass

    # 2 — Pull FRED market context
    market_ctx = {}
    try:
        market_ctx = _scanner.get_fred_market_context(state=state, sector=sector)
    except Exception:
        pass

    # 3 — Claude synthesizes into action items
    system_prompt = (
        "You are Bernard, the AI CEO of NEST Advisors — a private bond structuring and "
        "capital markets intelligence platform. You are reviewing live market signals. "
        "Return ONLY valid JSON — no markdown fences, no commentary."
    )
    user_prompt = (
        f"Live market intelligence pull for sector={sector}, state={state}:\n\n"
        f"EDGAR filings found: {len(edgar_signals)}\n"
        f"{json.dumps([{'entity': s.get('entity'), 'form': s.get('form_type'), 'date': s.get('filing_date')} for s in edgar_signals[:8]], indent=2)}\n\n"
        f"Market context: {json.dumps(market_ctx)}\n\n"
        "Synthesize into a JSON object with key 'actions': an array of 3-5 prioritized action items. "
        "Each action must have: "
        '"title" (str), "description" (str one sentence), "priority" ("critical"|"high"|"medium"), '
        '"agent" (str — which NEST agent to deploy: Merlin/Maxwell/Sentinel/LenderScout/Sterling), '
        '"signal_source" (str). '
        "Focus on deal opportunities, rate movements, and risks. Be direct."
    )

    actions = []
    try:
        raw = complete(system_prompt, user_prompt, max_tokens=1024)
        parsed = json.loads(raw)
        actions = parsed.get("actions", parsed) if isinstance(parsed, dict) else parsed
        if not isinstance(actions, list):
            actions = []
    except Exception:
        # Fallback — structured summary without Claude
        actions = [
            {
                "title": f"EDGAR scan complete — {len(edgar_signals)} filings found",
                "description": f"Review {sector.replace('_', ' ')} filings in {state} for deal opportunities.",
                "priority": "high" if edgar_signals else "medium",
                "agent": "Merlin",
                "signal_source": "SEC EDGAR",
            }
        ]
        if market_ctx.get("ten_yr_treasury"):
            actions.append({
                "title": f"10yr Treasury at {market_ctx['ten_yr_treasury']}%",
                "description": "Rate environment affects bond pricing — update coupon assumptions.",
                "priority": "medium",
                "agent": "Maxwell",
                "signal_source": "FRED",
            })

    # Also seed local _signals from this EDGAR pull (so Signal Feed has live data)
    with _lock:
        if not _signals and edgar_signals:
            seeded = []
            for i, item in enumerate(edgar_signals[:10], start=1):
                seeded.append({
                    "id": f"ll_{i}",
                    "type": "edgar_filing",
                    "source": "SEC EDGAR",
                    "entity": item.get("entity", "Unknown"),
                    "amount_usd": 0,
                    "naics": "6232",
                    "state": state,
                    "county": "",
                    "detail": item.get("snippet", "")[:200],
                    "score": max(10, 80 - i * 5),
                    "status": "warm",
                    "discoveredAt": item.get("filing_date", datetime.utcnow().isoformat()),
                })
            _signals.extend(seeded)

    return _ok({
        "actions": actions,
        "signals_pulled": len(edgar_signals),
        "market_snapshot": market_ctx,
        "sector": sector,
        "state": state,
    })
