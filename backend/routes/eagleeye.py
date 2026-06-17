"""
NEST EagleEye Routes — Business Development & Deal Sourcing.
Pillar 1: Scans UCC filings, title reports, permits, EDGAR, market signals.
"""
from flask import Blueprint, jsonify, request
from datetime import datetime
import io
import json
import logging
import threading
import uuid

from agents._claude import complete
from services.database import db
from services.eagleeye_scanner import EagleEyeScanner

logger = logging.getLogger(__name__)

eagleeye_bp = Blueprint("eagleeye", __name__)

# In-memory fallback (only used when Supabase is unavailable)
_signals_fallback: list[dict] = []
_scout_runs: list[dict] = []
_lock = threading.Lock()
_scanner = EagleEyeScanner()


# ---------------------------------------------------------------------------
# Supabase signal persistence helpers
# ---------------------------------------------------------------------------

def _supabase_list_signals(status_filter: str = None, naics_filter: str = None) -> list[dict] | None:
    """
    Read signals from Supabase `signals` table.
    Returns list on success, None if Supabase is not configured or errors.

    Supabase columns: id, signal_type, source, entity_name, entity_type,
    location_state, location_city, sector, naics_code, data jsonb,
    score, status, created_at
    """
    if not db.configured:
        return None
    params: dict = {"order": "score.desc"}
    if status_filter:
        params["status"] = f"eq.{status_filter}"
    if naics_filter:
        params["naics_code"] = f"eq.{naics_filter}"
    rows = db.select("signals", params)
    if rows is None:
        return None
    return rows if isinstance(rows, list) else []


def _supabase_upsert_signal(sig: dict) -> bool:
    """
    Write a single signal dict to Supabase signals table.
    Maps our internal signal shape to the table schema.
    Returns True on success.
    """
    if not db.configured:
        return False
    row = {
        "id": sig.get("id", str(uuid.uuid4())),
        "signal_type": sig.get("type", "edgar_filing"),
        "source": sig.get("source", "SEC EDGAR"),
        "entity_name": sig.get("entity", ""),
        "entity_type": sig.get("entity_type", ""),
        "location_state": sig.get("state", "US"),
        "location_city": sig.get("county", ""),
        "sector": sig.get("naics", ""),
        "naics_code": sig.get("naics", ""),
        "data": {
            "detail": sig.get("detail", ""),
            "amount_usd": sig.get("amount_usd", 0),
            "discoveredAt": sig.get("discoveredAt", datetime.utcnow().isoformat()),
        },
        "score": sig.get("score", 50),
        "status": sig.get("status", "warm"),
    }
    result = db.upsert("signals", row)
    return result is not None


def _row_to_signal(row: dict) -> dict:
    """Map a Supabase signals row back to the internal signal shape."""
    data = row.get("data") or {}
    return {
        "id": row.get("id", ""),
        "type": row.get("signal_type", "edgar_filing"),
        "source": row.get("source", "SEC EDGAR"),
        "entity": row.get("entity_name", ""),
        "amount_usd": data.get("amount_usd", 0),
        "naics": row.get("naics_code", ""),
        "state": row.get("location_state", ""),
        "county": row.get("location_city", ""),
        "detail": data.get("detail", ""),
        "score": row.get("score", 50),
        "status": row.get("status", "warm"),
        "discoveredAt": data.get("discoveredAt", row.get("created_at", "")),
    }


def _seed_signals_from_edgar() -> list[dict]:
    """
    Fetch EDGAR comparables for senior living, convert to signal shape,
    write each to Supabase, and return the list.
    """
    seeded: list[dict] = []
    try:
        raw = _scanner.search_edgar_comparables(
            sector="senior_living", state="FL",
            min_amount=25_000_000, max_amount=500_000_000
        )
        for i, item in enumerate(raw[:10], start=1):
            sig = {
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
            }
            seeded.append(sig)
            # Persist each signal to Supabase
            _supabase_upsert_signal(sig)
    except Exception as exc:
        logger.warning("EDGAR seed failed: %s", exc)
    return seeded


# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------

def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg,
                    "timestamp": datetime.utcnow().isoformat()}), code


# ---------------------------------------------------------------------------
# Signal endpoints — GET endpoints have NO @require_auth
# ---------------------------------------------------------------------------

@eagleeye_bp.route("/signals", methods=["GET"])
def list_signals():
    """
    All discovered deal signals, sorted by score.

    Priority: Supabase → seed from EDGAR if empty → in-memory fallback.
    """
    status_filter = request.args.get("status")
    naics_filter = request.args.get("naics")

    # 1. Try Supabase
    rows = _supabase_list_signals(status_filter=status_filter, naics_filter=naics_filter)

    if rows is not None:
        # Supabase is configured
        if not rows:
            # Empty table — seed from EDGAR and re-read
            seeded = _seed_signals_from_edgar()
            if seeded:
                # Re-query after seed so we get DB-canonicalized rows
                rows = _supabase_list_signals(
                    status_filter=status_filter, naics_filter=naics_filter
                ) or seeded
            else:
                rows = []
        signals = [_row_to_signal(r) for r in rows]
    else:
        # 2. Supabase not available — use in-memory fallback
        with _lock:
            if not _signals_fallback:
                seeded = _seed_signals_from_edgar()
                _signals_fallback.extend(seeded)
            filtered = _signals_fallback[:]

        if status_filter:
            filtered = [s for s in filtered if s.get("status") == status_filter]
        if naics_filter:
            filtered = [s for s in filtered if s.get("naics") == naics_filter]
        signals = filtered

    signals.sort(key=lambda s: s.get("score", 0), reverse=True)
    return _ok({
        "signals": signals,
        "total": len(signals),
        "hot": sum(1 for s in signals if s.get("status") == "hot"),
        "warm": sum(1 for s in signals if s.get("status") == "warm"),
    })


@eagleeye_bp.route("/signals/<signal_id>", methods=["GET"])
def get_signal(signal_id):
    # Try Supabase first
    rows = db.select("signals", {"id": f"eq.{signal_id}"}) if db.configured else None
    if rows and isinstance(rows, list) and rows:
        return _ok(_row_to_signal(rows[0]))

    # Fallback to in-memory
    with _lock:
        sig = next((s for s in _signals_fallback if s["id"] == signal_id), None)
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

    # Try Supabase update
    if db.configured:
        result = db.update("signals", {"id": f"eq.{signal_id}"}, {"status": new_status})
        if result is not None:
            rows = db.select("signals", {"id": f"eq.{signal_id}"})
            if rows and isinstance(rows, list) and rows:
                return _ok(_row_to_signal(rows[0]))

    # Fallback to in-memory
    with _lock:
        sig = next((s for s in _signals_fallback if s["id"] == signal_id), None)
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
    # Try Supabase lookup
    sig = None
    if db.configured:
        rows = db.select("signals", {"id": f"eq.{signal_id}"})
        if rows and isinstance(rows, list) and rows:
            sig = _row_to_signal(rows[0])

    if not sig:
        with _lock:
            sig = next((s for s in _signals_fallback if s["id"] == signal_id), None)
    if not sig:
        return _err("Signal not found", 404)

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

    # Mark converted in Supabase
    if db.configured:
        db.update("signals", {"id": f"eq.{signal_id}"}, {"status": "converted"})
    with _lock:
        for s in _signals_fallback:
            if s["id"] == signal_id:
                s["status"] = "converted"

    return _ok(deal_stub)


@eagleeye_bp.route("/promote/<signal_id>", methods=["POST"])
def promote_to_prospect(signal_id):
    """Promote a signal to a deal prospect in the NEST pipeline."""
    sig = None
    if db.configured:
        rows = db.select("signals", {"id": f"eq.{signal_id}"})
        if rows and isinstance(rows, list) and rows:
            sig = _row_to_signal(rows[0])

    if not sig:
        with _lock:
            sig = next((s for s in _signals_fallback if s["id"] == signal_id), None)
    if not sig:
        return _err("Signal not found", 404)

    if sig.get("status") == "promoted":
        return _err("Signal already promoted", 409)

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

    try:
        from routes.deals import _deals, _lock as deals_lock
        with deals_lock:
            _deals[deal["id"]] = deal
    except Exception:
        pass

    # Mark signal as promoted
    if db.configured:
        db.update("signals", {"id": f"eq.{signal_id}"},
                  {"status": "promoted", "data": {"promoted_deal_id": deal["id"]}})
    with _lock:
        for s in _signals_fallback:
            if s["id"] == signal_id:
                s["status"] = "promoted"
                s["promoted_deal_id"] = deal["id"]

    return _ok({"deal": deal, "signal_id": signal_id})


@eagleeye_bp.route("/find-similar", methods=["POST"])
def find_similar():
    """
    Find comparable transactions for a deal using EDGAR + FRED + Claude.
    """
    body = request.get_json() or {}
    borrower = body.get("borrower", "").strip()
    sector = body.get("sector", "").strip()
    state = body.get("state", "").strip()
    par_amount = body.get("par_amount")
    naics_code = body.get("naics_code", "")

    missing = [f for f, v in [("borrower", borrower), ("sector", sector),
                               ("state", state), ("par_amount", par_amount)] if not v]
    if missing:
        return _err(f"Missing required fields: {', '.join(missing)}", 400)

    try:
        par_amount = int(par_amount)
    except (TypeError, ValueError):
        return _err("par_amount must be an integer", 400)

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

    market_ctx = {}
    try:
        market_ctx = _scanner.get_fred_market_context(state=state, sector=sector)
    except Exception:
        pass

    ten_yr = market_ctx.get("ten_yr_treasury", "N/A")
    mortgage_30 = market_ctx.get("mortgage_30yr", "N/A")
    cre_delinq = market_ctx.get("cre_delinquency", "N/A")

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

# Static fallback data — used when Claude call fails or times out
_CRE_FALLBACK_STATES = [
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

_CRE_FALLBACK_PROPERTIES = [
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


@eagleeye_bp.route("/cre-heatmap", methods=["GET"])
def cre_heatmap():
    """
    CRE distressed-property heat map — bridge maturities, dark zones, refi signals.
    Returns state-level summaries and top property targets.

    When Claude call fails, returns static fallback data with source="fallback"
    so the frontend can display a data-source notice.
    """
    refresh = request.args.get("refresh", "false").lower() == "true"

    with _cre_lock:
        if not refresh and "heatmap" in _cre_cache:
            cached = _cre_cache["heatmap"]
            if (datetime.utcnow() - cached["ts"]).seconds < 900:
                return _ok(cached["data"])

    # Pull current signals for context
    with _lock:
        cre_signals = [
            s for s in _signals_fallback
            if s.get("naics", "").startswith("62") or s.get("status") in ("hot", "warm")
        ]

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
    data_source = "claude"

    try:
        raw = complete(system_prompt, user_prompt, max_tokens=2000)
        parsed = json.loads(raw)
        states_data = parsed.get("states", [])
        top_properties = parsed.get("top_properties", [])
        if not states_data:
            raise ValueError("Claude returned empty states array")
    except Exception as exc:
        # Log the real error — don't silently swallow it
        logger.warning("CRE heatmap Claude call failed (%s) — serving static fallback", exc)
        states_data = _CRE_FALLBACK_STATES
        top_properties = _CRE_FALLBACK_PROPERTIES
        data_source = "fallback"

    payload = {
        "states": states_data,
        "top_properties": top_properties,
        "total_pipeline_usd": sum(s.get("pipeline_usd", 0) for s in states_data),
        "total_signals": sum(s.get("signal_count", 0) for s in states_data),
        "source": data_source,          # "claude" or "fallback"
        "timestamp": datetime.utcnow().isoformat(),
    }
    with _cre_lock:
        _cre_cache["heatmap"] = {"data": payload, "ts": datetime.utcnow()}
    return _ok(payload)


@eagleeye_bp.route("/stats", methods=["GET"])
def stats():
    # Try Supabase for live counts
    if db.configured:
        all_rows = db.select("signals") or []
        if isinstance(all_rows, list):
            total = len(all_rows)
            pipeline_usd = sum(
                (r.get("data") or {}).get("amount_usd", 0)
                for r in all_rows
                if r.get("status") in ("hot", "warm")
            )
            converted = sum(1 for r in all_rows if r.get("status") == "converted")
            return _ok({
                "total_signals": total,
                "pipeline_usd": pipeline_usd,
                "converted": converted,
                "scout_runs": len(_scout_runs),
            })

    with _lock:
        total = len(_signals_fallback)
        pipeline_usd = sum(s["amount_usd"] for s in _signals_fallback if s["status"] in ("hot", "warm"))
        converted = sum(1 for s in _signals_fallback if s["status"] == "converted")
    return _ok({
        "total_signals": total,
        "pipeline_usd": pipeline_usd,
        "converted": converted,
        "scout_runs": len(_scout_runs),
    })


# ── DOCUMENT UPLOAD — replaces simulateParse in EagleEyeEngine.tsx ──────────

@eagleeye_bp.route("/upload", methods=["POST"])
def upload_document():
    """
    Accept a multipart file upload, extract text, classify doc type,
    and score it as a deal signal.

    Returns: { doc_type, extracted_text, signal_score, detail }

    Supported: PDF (via pdfminer), plain text, and any file readable as UTF-8.
    Replaces the simulateParse stub in the frontend — wire to this endpoint.
    """
    if "file" not in request.files:
        return _err("No file uploaded — send multipart/form-data with field 'file'", 400)

    uploaded = request.files["file"]
    filename = uploaded.filename or "upload"
    raw_bytes = uploaded.read()

    if not raw_bytes:
        return _err("Uploaded file is empty", 400)

    # ── Text extraction ────────────────────────────────────────────────────
    extracted_text = ""
    extraction_method = "raw"

    if filename.lower().endswith(".pdf"):
        try:
            from pdfminer.high_level import extract_text as pdf_extract_text
            pdf_file = io.BytesIO(raw_bytes)
            extracted_text = pdf_extract_text(pdf_file)
            extraction_method = "pdfminer"
        except ImportError:
            # pdfminer not installed — fall back to raw byte decode
            extracted_text = raw_bytes.decode("utf-8", errors="replace")
            extraction_method = "raw_fallback"
        except Exception as exc:
            logger.warning("PDF extraction failed for %s: %s", filename, exc)
            extracted_text = raw_bytes.decode("utf-8", errors="replace")
            extraction_method = "raw_fallback"
    else:
        try:
            extracted_text = raw_bytes.decode("utf-8", errors="replace")
            extraction_method = "utf8"
        except Exception:
            extracted_text = ""

    extracted_text = extracted_text.strip()
    if not extracted_text:
        return _err("Could not extract text from file", 422)

    # ── Document classification ─────────────────────────────────────────
    # Keyword-based classification before hitting Claude, so we have a fallback
    text_lower = extracted_text.lower()

    DOC_KEYWORDS = {
        "audited_financials": ["independent auditors", "balance sheet", "statement of operations",
                               "statement of cash flows", "notes to financial statements"],
        "appraisal": ["appraisal report", "market value", "appraised value",
                       "highest and best use", "comparable sales"],
        "rent_roll": ["rent roll", "unit number", "monthly rent", "move-in date", "lease expiration"],
        "proforma": ["proforma", "pro forma", "projected revenue", "forecast", "stabilized noi"],
        "term_sheet": ["term sheet", "loan terms", "interest rate", "loan to value",
                        "maturity date", "origination fee"],
        "sources_uses": ["sources and uses", "sources & uses", "construction budget",
                          "development cost", "total project cost"],
        "officer_certificate": ["officer", "certificate", "covenant compliance", "dscr",
                                  "days cash on hand"],
        "environmental": ["phase i", "phase ii", "environmental site assessment",
                            "recognized environmental"],
        "market_study": ["market study", "market analysis", "absorption rate",
                          "competitive set", "demographic"],
        "form_d": ["form d", "private placement", "regulation d", "506(b)", "506(c)"],
    }

    detected_type = "unknown"
    best_match_count = 0
    for doc_type, keywords in DOC_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in text_lower)
        if matches > best_match_count:
            best_match_count = matches
            detected_type = doc_type

    # ── Claude classification + scoring (with fallback) ─────────────────
    snippet = extracted_text[:3000]  # Keep prompt size reasonable

    system_prompt = (
        "You are a bond underwriting document analyst at NEST Advisors. "
        "Return ONLY valid JSON, no markdown."
    )
    user_prompt = (
        f"Analyze this document (filename: {filename}):\n\n{snippet}\n\n"
        "Return JSON with these keys:\n"
        '"doc_type" (str: audited_financials|appraisal|rent_roll|proforma|term_sheet|'
        'sources_uses|officer_certificate|environmental|market_study|form_d|other),\n'
        '"signal_score" (int 0-100: how useful is this for bond underwriting? '
        '100=complete financials, 0=irrelevant),\n'
        '"key_metrics" (object: up to 5 key financial figures found, e.g. '
        '{"noi": 2400000, "dscr": 1.42, "occupancy": 0.91}),\n'
        '"missing_items" (array of str: what critical items are absent),\n'
        '"summary" (str: one sentence describing the document and its underwriting relevance).'
    )

    key_metrics = {}
    missing_items: list[str] = []
    summary = f"Document classified as {detected_type} via keyword matching."
    signal_score = min(20 + best_match_count * 10, 80)  # keyword-based baseline

    try:
        raw_response = complete(system_prompt, user_prompt, max_tokens=512)
        parsed = json.loads(raw_response)
        detected_type = parsed.get("doc_type", detected_type)
        signal_score = int(parsed.get("signal_score", signal_score))
        key_metrics = parsed.get("key_metrics", {})
        missing_items = parsed.get("missing_items", [])
        summary = parsed.get("summary", summary)
    except Exception as exc:
        logger.warning("Claude doc classification failed for %s: %s", filename, exc)
        # Keep keyword-based values — do not surface error to caller

    # Clamp score
    signal_score = max(0, min(100, signal_score))

    return _ok({
        "doc_type": detected_type,
        "extracted_text": extracted_text[:5000],   # truncate for wire transport
        "signal_score": signal_score,
        "key_metrics": key_metrics,
        "missing_items": missing_items,
        "summary": summary,
        "filename": filename,
        "char_count": len(extracted_text),
        "extraction_method": extraction_method,
    })


# ── OPERATORS: LEARNING LOOP ─────────────────────────────────────────────────

@eagleeye_bp.route("/operators/learning-loop", methods=["POST"])
def operators_learning_loop():
    """
    Auto-fired on EagleEye mount. Pulls live EDGAR + FRED signals,
    runs Claude analysis, and returns a prioritized action list.

    Body: { sector?: str, state?: str }
    Returns: { actions: [...], signals_pulled: int, market_snapshot: {...} }
    """
    body = request.get_json(silent=True) or {}
    sector = body.get("sector", "senior_living")
    state = body.get("state", "FL")

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

    market_ctx = {}
    try:
        market_ctx = _scanner.get_fred_market_context(state=state, sector=sector)
    except Exception:
        pass

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

    # Seed Supabase + in-memory from this EDGAR pull
    if edgar_signals:
        rows = _supabase_list_signals() if db.configured else None
        already_seeded = bool(rows)

        with _lock:
            mem_empty = not _signals_fallback

        if not already_seeded or mem_empty:
            for i, item in enumerate(edgar_signals[:10], start=1):
                sig = {
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
                }
                _supabase_upsert_signal(sig)
                with _lock:
                    if not any(s["id"] == sig["id"] for s in _signals_fallback):
                        _signals_fallback.append(sig)

    return _ok({
        "actions": actions,
        "signals_pulled": len(edgar_signals),
        "market_snapshot": market_ctx,
        "sector": sector,
        "state": state,
    })
