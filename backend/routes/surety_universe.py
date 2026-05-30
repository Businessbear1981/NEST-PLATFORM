"""Surety Universe API — reverse-engineer credit-enhancement
provider universe from the EMMA bond corpus.

Backend-only consumption surface. Frontends that want to read
the resulting partners universe should hit:
    GET /api/contacts/partners?role=surety_carrier
    GET /api/contacts/partners?role=bond_insurer
    GET /api/contacts/partners?role=loc_bank
"""
from datetime import datetime

from flask import Blueprint, jsonify, request

from services.surety_universe_service import SuretyUniverseService

surety_universe_bp = Blueprint("surety_universe", __name__)


# ── response helpers (matching the platform pattern) ───────────

def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({
        "success": True, "data": data, "error": None, "timestamp": _ts(),
    }), code


def _err(msg, code=400):
    return jsonify({
        "success": False, "data": None, "error": msg, "timestamp": _ts(),
    }), code


def _svc():
    return SuretyUniverseService()


# ── routes ─────────────────────────────────────────────────────

@surety_universe_bp.post("/scan/seed")
def scan_seed():
    """Scan the in-memory EMMA SEED_BONDS. Idempotent."""
    try:
        summary = _svc().scan_emma_seed()
    except Exception as e:
        return _err(f"seed scan failed: {e}", 500)
    return _ok(summary)


@surety_universe_bp.post("/scan/live")
def scan_live():
    """Scan live EMMA via the EMMAPlugin.

    Degrades to {status: EMMA_PLUGIN_NOT_CONFIGURED} when no key.
    """
    body = request.get_json(silent=True) or {}
    try:
        summary = _svc().scan_emma_live(query_filters=body)
    except Exception as e:
        return _err(f"live scan failed: {e}", 500)
    return _ok(summary)


@surety_universe_bp.get("")
def list_universe():
    """List the current universe. Optional filters: category, sector, state."""
    category = request.args.get("category")
    sector = request.args.get("sector")
    state = request.args.get("state")
    rows = _svc().list_universe(
        category=category, sector=sector, state=state,
    )
    return _ok({
        "filters": {"category": category, "sector": sector, "state": state},
        "providers": rows,
        "count": len(rows),
    })


@surety_universe_bp.get("/graph")
def relationship_graph():
    """Co-appearance graph: which bond counsels / trustees / FAs
    most frequently appear on bonds enhanced by each provider."""
    try:
        graph = _svc().relationship_graph()
    except Exception as e:
        return _err(f"graph build failed: {e}", 500)
    return _ok(graph)
