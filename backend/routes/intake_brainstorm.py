"""
Intake Brainstorm REST API.

Surfaces Bernard's first-look memo + gap Q&A between Deal Input and
Roots Stage 1, per ADR-0002.

Routes
------
POST /api/intake-brainstorm/<deal_id>/run
    Generate (or regenerate) the first-look memo + gap questions.
    Persists the memo and flips intake_brainstorm_status to "brainstormed".

POST /api/intake-brainstorm/<deal_id>/responses
    Persist founder answers to the gap questions. Body: {responses: {...}}.

POST /api/intake-brainstorm/<deal_id>/greenlight
    Founder approves — advance to Roots Stage 1. Returns the next-stage
    handoff payload (next_route: /upload).

POST /api/intake-brainstorm/<deal_id>/park
    Save answers, do NOT advance. Status flips to "parked".
"""
from datetime import datetime

from flask import Blueprint, jsonify, request

from services.intake_brainstorm import SERVICE as brainstorm_service


intake_brainstorm_bp = Blueprint("intake_brainstorm", __name__)


def _ok(data, code: int = 200):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


def _bad(msg: str, code: int = 400):
    return jsonify({
        "success": False,
        "data": None,
        "error": msg,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


@intake_brainstorm_bp.post("/<deal_id>/run")
def run_brainstorm(deal_id: str):
    """Generate first-look memo + gap questions for a deal."""
    if not deal_id:
        return _bad("deal_id is required")
    result = brainstorm_service.run(deal_id)
    if result.get("error"):
        return _bad(result["error"], 404)
    return _ok(result)


@intake_brainstorm_bp.post("/<deal_id>/responses")
def submit_responses(deal_id: str):
    """Persist founder answers to the gap questions."""
    if not deal_id:
        return _bad("deal_id is required")
    body = request.get_json(silent=True) or {}
    responses = body.get("responses")
    if responses is None or not isinstance(responses, dict):
        return _bad("body.responses (object) is required")
    result = brainstorm_service.submit_responses(deal_id, responses)
    if result.get("error"):
        return _bad(result["error"], 404)
    return _ok(result)


@intake_brainstorm_bp.post("/<deal_id>/greenlight")
def greenlight(deal_id: str):
    """Founder approves — deal advances to Roots Stage 1."""
    if not deal_id:
        return _bad("deal_id is required")
    body = request.get_json(silent=True) or {}
    # Optional: accept last-minute responses bundled with greenlight.
    last_responses = body.get("responses")
    if isinstance(last_responses, dict) and last_responses:
        brainstorm_service.submit_responses(deal_id, last_responses)
    result = brainstorm_service.greenlight(deal_id)
    if result.get("error"):
        return _bad(result["error"], 404)
    return _ok(result)


@intake_brainstorm_bp.post("/<deal_id>/park")
def park(deal_id: str):
    """Save answers, do NOT advance."""
    if not deal_id:
        return _bad("deal_id is required")
    body = request.get_json(silent=True) or {}
    last_responses = body.get("responses")
    if isinstance(last_responses, dict) and last_responses:
        brainstorm_service.submit_responses(deal_id, last_responses)
    result = brainstorm_service.park(deal_id)
    if result.get("error"):
        return _bad(result["error"], 404)
    return _ok(result)
