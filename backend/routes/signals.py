"""
NEST Signal Pipeline Routes — Three-Node Signal Intelligence.

Node 1: Origination Scanner  — EDGAR M&A/CRE + census permits
Node 2: Qualification Engine — NAICS rules, JP Morgan benchmarks, NEST grade
Node 3: Action Router        — desk assignment + Bernard memo trigger
"""
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import threading
import time

from services.signal_engine import SignalEngine

signals_bp = Blueprint("signals", __name__)

# ---------------------------------------------------------------------------
# In-memory state
# ---------------------------------------------------------------------------
_engine = SignalEngine()
_last_run: dict = {}           # result of last run_signal_pipeline()
_last_run_ts: float = 0        # time.time() of last run
_signals_by_id: dict = {}      # {signal_id: signal_dict}
_run_lock = threading.Lock()
CACHE_TTL = 1800               # 30 minutes


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _ok(data, code=200):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


def _err(msg, code=400):
    return jsonify({
        "success": False,
        "data": None,
        "error": msg,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


def _refresh_cache(max_signals: int = 50) -> dict:
    """Run the full pipeline and repopulate in-memory state. Must be called
    inside _run_lock."""
    global _last_run, _last_run_ts, _signals_by_id

    result = _engine.run_signal_pipeline(max_signals=max_signals)
    _last_run = result
    _last_run_ts = time.time()

    # Index signals by ID for O(1) lookup
    signals = result.get("signals", [])
    _signals_by_id = {s["id"]: s for s in signals if "id" in s}

    return result


def _cache_is_stale() -> bool:
    return (time.time() - _last_run_ts) > CACHE_TTL


def _build_meta(signals: list) -> dict:
    now_ts = datetime.utcnow()
    next_refresh_ts = datetime.utcfromtimestamp(_last_run_ts + CACHE_TTL) if _last_run_ts else now_ts
    return {
        "total": len(signals),
        "hot": sum(1 for s in signals if str(s.get("grade", "")).upper() == "HOT"),
        "warm": sum(1 for s in signals if str(s.get("grade", "")).upper() == "WARM"),
        "run_at": datetime.utcfromtimestamp(_last_run_ts).isoformat() if _last_run_ts else None,
        "next_refresh": next_refresh_ts.isoformat(),
    }


def _filter_signals(signals: list, desk: str = None, grade: str = None, limit: int = 50) -> list:
    result = signals
    if desk:
        result = [s for s in result if s.get("desk") == desk]
    if grade:
        result = [s for s in result if str(s.get("grade", "")).upper() == grade.upper()]
    return result[:limit]


def _generate_memo_prompt(signal: dict) -> str:
    entity = signal.get("entity", signal.get("name", "Unknown Entity"))
    desk = signal.get("desk", "bond_desk")
    grade = signal.get("grade", "WARM")
    amount = signal.get("amount_usd", 0)
    naics = signal.get("naics", "")
    state = signal.get("state", "")
    return (
        f"You are Morgan, NEST Advisors' capital markets memo writer. "
        f"Draft an executive memo for a {grade} signal: {entity}, "
        f"NAICS {naics}, {state}, estimated ${amount:,.0f}. "
        f"Desk: {desk.upper().replace('_', ' ')}. "
        f"Lead with recommendation. Reference Jacaranda Trace PLOM as structural template. "
        f"Jimmy Lee tone — direct, no hedging, one idea per sentence."
    )


# ---------------------------------------------------------------------------
# GET /api/signals
# ---------------------------------------------------------------------------
@signals_bp.route("", methods=["GET"])
def list_signals():
    """Return all signals from the last pipeline run, with optional filtering."""
    desk = request.args.get("desk")
    grade = request.args.get("grade")
    try:
        limit = int(request.args.get("limit", 50))
    except (TypeError, ValueError):
        limit = 50

    # Validate desk filter
    valid_desks = {"ma", "cre", "bond_desk"}
    if desk and desk not in valid_desks:
        return _err(f"desk must be one of: {sorted(valid_desks)}")

    # Validate grade filter
    valid_grades = {"HOT", "WARM", "COLD"}
    if grade and grade.upper() not in valid_grades:
        return _err(f"grade must be one of: {sorted(valid_grades)}")

    with _run_lock:
        if not _last_run or _cache_is_stale():
            try:
                _refresh_cache(max_signals=50)
            except Exception as exc:
                if not _last_run:
                    return _err(f"Pipeline unavailable: {exc}", 503)
                # Stale cache is acceptable — serve what we have

        all_signals = list(_last_run.get("signals", []))

    filtered = _filter_signals(all_signals, desk=desk, grade=grade, limit=limit)
    meta = _build_meta(filtered if (desk or grade) else all_signals)

    return _ok({"signals": filtered, "meta": meta})


# ---------------------------------------------------------------------------
# POST /api/signals/scan
# ---------------------------------------------------------------------------
@signals_bp.route("/scan", methods=["POST"])
def scan_signals():
    """Force a fresh pipeline run regardless of cache state."""
    body = request.get_json() or {}
    max_signals = int(body.get("max_signals", 50))
    desks_filter = body.get("desks")  # optional list — ["ma", "cre"]

    with _run_lock:
        try:
            result = _refresh_cache(max_signals=max_signals)
        except Exception as exc:
            return _err(f"Pipeline scan failed: {exc}", 503)

        all_signals = list(result.get("signals", []))

    if desks_filter and isinstance(desks_filter, list):
        filtered = [s for s in all_signals if s.get("desk") in desks_filter]
    else:
        filtered = all_signals

    meta = _build_meta(filtered if desks_filter else all_signals)
    return _ok({"signals": filtered, "meta": meta})


# ---------------------------------------------------------------------------
# GET /api/signals/stats
# ---------------------------------------------------------------------------
@signals_bp.route("/stats", methods=["GET"])
def signal_stats():
    """Pipeline statistics — does NOT trigger a new scan."""
    with _run_lock:
        if not _last_run:
            return _ok({
                "last_run": None,
                "total_qualified": 0,
                "hot": 0,
                "warm": 0,
                "cold": 0,
                "by_desk": {"ma": 0, "cre": 0, "bond_desk": 0},
                "edgar_sources": 0,
                "permit_sources": 0,
            })

        signals = list(_last_run.get("signals", []))
        stats = _last_run.get("stats", {})
        run_at = datetime.utcfromtimestamp(_last_run_ts).isoformat() if _last_run_ts else None

    by_desk = {
        "ma": sum(1 for s in signals if s.get("desk") == "ma"),
        "cre": sum(1 for s in signals if s.get("desk") == "cre"),
        "bond_desk": sum(1 for s in signals if s.get("desk") == "bond_desk"),
    }

    return _ok({
        "last_run": run_at,
        "total_qualified": len(signals),
        "hot": sum(1 for s in signals if str(s.get("grade", "")).upper() == "HOT"),
        "warm": sum(1 for s in signals if str(s.get("grade", "")).upper() == "WARM"),
        "cold": sum(1 for s in signals if str(s.get("grade", "")).upper() == "COLD"),
        "by_desk": by_desk,
        "edgar_sources": stats.get("edgar_sources", 0),
        "permit_sources": stats.get("permit_sources", 0),
    })


# ---------------------------------------------------------------------------
# GET /api/signals/node-status
# ---------------------------------------------------------------------------
@signals_bp.route("/node-status", methods=["GET"])
def node_status():
    """Health check for all three pipeline nodes."""
    with _run_lock:
        last_scan = datetime.utcfromtimestamp(_last_run_ts).isoformat() if _last_run_ts else None

    return _ok({
        "node1": {
            "name": "Origination Scanner",
            "status": "active",
            "last_scan": last_scan,
            "sources": ["edgar_ma", "edgar_cre", "census_permits"],
        },
        "node2": {
            "name": "Qualification Engine",
            "status": "active",
            "benchmarks": ["naics_ma", "jp_morgan_cre", "nest_grade"],
        },
        "node3": {
            "name": "Action Router",
            "status": "active",
            "desks": ["ma", "cre", "bond_desk"],
        },
    })


# ---------------------------------------------------------------------------
# GET /api/signals/<signal_id>
# ---------------------------------------------------------------------------
@signals_bp.route("/<signal_id>", methods=["GET"])
def get_signal(signal_id):
    """Return a single signal by ID."""
    with _run_lock:
        sig = _signals_by_id.get(signal_id)

    if not sig:
        return _err(f"Signal '{signal_id}' not found", 404)

    return _ok(sig)


# ---------------------------------------------------------------------------
# POST /api/signals/<signal_id>/action
# ---------------------------------------------------------------------------
@signals_bp.route("/<signal_id>/action", methods=["POST"])
def signal_action(signal_id):
    """Route a signal to a desk action: approve | pass | watch."""
    body = request.get_json() or {}
    action = body.get("action", "").lower()

    valid_actions = {"approve", "pass", "watch"}
    if action not in valid_actions:
        return _err(f"action must be one of: {sorted(valid_actions)}")

    with _run_lock:
        sig = _signals_by_id.get(signal_id)

    if not sig:
        return _err(f"Signal '{signal_id}' not found", 404)

    # Determine new status and generate memo prompt when approved
    status_map = {
        "approve": "approved",
        "pass": "passed",
        "watch": "watching",
    }
    new_status = status_map[action]

    # Mutate the in-memory signal record
    with _run_lock:
        if signal_id in _signals_by_id:
            _signals_by_id[signal_id]["status"] = new_status
            _signals_by_id[signal_id]["actioned_at"] = datetime.utcnow().isoformat()

    memo_prompt = ""
    if action == "approve":
        memo_prompt = _generate_memo_prompt(sig)

    return _ok({
        "signal_id": signal_id,
        "status": new_status,
        "memo_prompt": memo_prompt,
    })
