"""
NAICS Rules Engine REST API.

Deterministic NAICS → bond type → required documents → feasibility lookup.
Surfaces the engine in services/naics_rules_engine.py.

Routes
------
GET  /api/naics
    List every NAICS code the engine knows (covered + omitted).

GET  /api/naics/<code>/bond-types
    Eligible bond types for a NAICS code given deal_intent + borrower_type.
    Query string: deal_intent, borrower_type, state (optional)

POST /api/naics/lookup
    Full lookup. Body: {naics_code, deal_intent, borrower_type, state}

GET  /api/naics/bond-types/<bond_type>/documents
    Document list for a bond type.

GET  /api/naics/bond-types
    Catalogue of every canonical bond type.
"""
from datetime import datetime
from flask import Blueprint, jsonify, request

from services.naics_rules_engine import ENGINE

naics_bp = Blueprint("naics", __name__)


def _ok(data):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    }), 200


def _bad(msg: str, status: int = 400):
    return jsonify({
        "success": False,
        "data": None,
        "error": msg,
        "timestamp": datetime.utcnow().isoformat(),
    }), status


@naics_bp.get("")
def list_naics():
    """List every NAICS code the engine knows (covered + omitted)."""
    return _ok({"naics": ENGINE.naics_list()})


@naics_bp.get("/bond-types")
def list_bond_types():
    """Catalogue of every canonical bond type."""
    return _ok({"bond_types": ENGINE.all_bond_types()})


@naics_bp.get("/bond-types/<bond_type>/documents")
def documents_for_bond_type(bond_type: str):
    """Documents that apply to a given bond type."""
    docs = ENGINE.documents_for_bond_type(bond_type)
    return _ok({"bond_type": bond_type, "documents": docs, "count": len(docs)})


@naics_bp.get("/<code>/bond-types")
def bond_types_for_naics(code: str):
    """Eligible bond types for a NAICS code given deal_intent + borrower_type."""
    deal_intent = request.args.get("deal_intent", "").strip()
    borrower_type = request.args.get("borrower_type", "").strip()
    state = request.args.get("state", "").strip() or None
    if not deal_intent or not borrower_type:
        return _bad("deal_intent and borrower_type are required query params")
    result = ENGINE.lookup(
        naics_code=code,
        deal_intent=deal_intent,
        borrower_type=borrower_type,
        state=state,
    )
    return _ok({
        "naics_code": result["naics_code"],
        "naics_label": result.get("naics_label"),
        "sector": result.get("sector"),
        "eligible_bond_types": result.get("eligible_bond_types", []),
        "operating_framework_refs": result.get("operating_framework_refs", []),
        "error": result.get("error"),
    })


@naics_bp.post("/lookup")
def full_lookup():
    """Full deterministic lookup."""
    body = request.get_json(silent=True) or {}
    naics_code = (body.get("naics_code") or "").strip()
    deal_intent = (body.get("deal_intent") or "").strip()
    borrower_type = (body.get("borrower_type") or "").strip()
    state = (body.get("state") or "").strip() or None
    if not naics_code or not deal_intent or not borrower_type:
        return _bad("naics_code, deal_intent, and borrower_type are required")
    result = ENGINE.lookup(
        naics_code=naics_code,
        deal_intent=deal_intent,
        borrower_type=borrower_type,
        state=state,
    )
    return _ok(result)
