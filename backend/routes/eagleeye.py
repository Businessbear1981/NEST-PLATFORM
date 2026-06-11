"""
NEST EagleEye Routes — Business Development & Deal Sourcing.
Pillar 1: Scans UCC filings, title reports, permits, EDGAR, market signals.
"""
from flask import Blueprint, jsonify, request
from services.auth import require_auth
from datetime import datetime
import json
import threading

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
