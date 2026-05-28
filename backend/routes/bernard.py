"""Bernard — the NEST action engine. Find-me, pitch, cost estimate, PO, preflight intake."""
import uuid
from flask import Blueprint, jsonify, request
from datetime import datetime
from services.bernard_findme import BernardFindMe
from services.pitch_generator import PitchGenerator
import services.preflight_service as preflight

bernard_bp = Blueprint("bernard", __name__)
_bernard = BernardFindMe()
_pitch = PitchGenerator()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": datetime.utcnow().isoformat()}), code


@bernard_bp.route("/find-me", methods=["POST"])
def find_me():
    body = request.get_json() or {}
    query = body.get("query", "")
    context = body.get("context", {})
    if not query:
        return _err("Provide a 'query' string")
    result = _bernard.find_me(query, context)
    return _ok(result)


@bernard_bp.route("/pitch", methods=["POST"])
def generate_pitch():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    result = _pitch.generate_pitch(deal)
    return _ok(result)


@bernard_bp.route("/costs", methods=["POST"])
def estimate_costs():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    structure = body.get("structure", "base")
    result = _pitch.estimate_costs(deal, structure)
    return _ok(result)


@bernard_bp.route("/po", methods=["POST"])
def generate_po():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    costs = _pitch.estimate_costs(deal)
    po = _pitch.generate_purchase_order(deal, costs)
    return _ok(po)


@bernard_bp.route("/scenarios", methods=["POST"])
def bond_scenarios():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    result = _pitch.generate_bond_scenarios(deal)
    return _ok(result)


@bernard_bp.route("/readiness", methods=["POST"])
def assess_readiness():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    result = _pitch.assess_readiness(deal)
    return _ok(result)


# ── Preflight — Conversational Deal Intake (Stage 0) ─────────────────────────

@bernard_bp.route("/preflight/start", methods=["POST"])
def start_preflight():
    body = request.get_json(silent=True) or {}
    session_id = str(uuid.uuid4())
    result = preflight.start_session(session_id, body.get("context", ""))
    return _ok(result)


@bernard_bp.route("/preflight/<session_id>/message", methods=["POST"])
def preflight_message(session_id):
    body = request.get_json(silent=True) or {}
    message = body.get("message", "")
    if not message:
        return _err("message is required")
    result = preflight.continue_session(session_id, message)
    return _ok(result)


@bernard_bp.route("/preflight/<session_id>", methods=["GET"])
def get_preflight(session_id):
    session = preflight.get_session(session_id)
    if not session:
        return _err("Session not found", 404)
    return _ok(session)
