"""Outreach API — log of touches against Contacts and Deals."""
from datetime import datetime

from flask import Blueprint, jsonify, request

from services.outreach_service import OutreachService

outreach_bp = Blueprint("outreach", __name__)


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
    return OutreachService()


@outreach_bp.get("")
def list_outreach():
    filters = {
        "to_contact_id": request.args.get("to_contact_id"),
        "kind":          request.args.get("kind"),
        "channel":       request.args.get("channel"),
        "deal_id":       request.args.get("deal_id"),
        "since":         request.args.get("since"),
        "limit":         request.args.get("limit"),
    }
    rows = _svc().list_outreach({k: v for k, v in filters.items() if v})
    return _ok({"events": rows, "count": len(rows)})


@outreach_bp.post("")
def log_outreach():
    body = request.get_json(silent=True) or {}
    kind = body.get("kind")
    if not kind:
        return _err("kind is required")
    try:
        row = _svc().log_outreach(
            kind=kind,
            channel=body.get("channel"),
            to_contact_id=body.get("to_contact_id"),
            deal_ids=body.get("deal_ids") or [],
            scheduled_at=body.get("scheduled_at"),
            sent_at=body.get("sent_at"),
            from_contact_name=body.get("from_contact_name"),
            subject_line=body.get("subject_line"),
            framing_notes=body.get("framing_notes"),
            attachments=body.get("attachments") or [],
            expected_response_window_days=body.get(
                "expected_response_window_days"
            ),
            outcome=body.get("outcome"),
            notes=body.get("notes"),
        )
    except ValueError as e:
        return _err(str(e), 400)
    if not row:
        return _err("Failed to log outreach", 500)
    return _ok(row, 201)


@outreach_bp.get("/<event_id>")
def get_event(event_id: str):
    row = _svc().get_event(event_id)
    if not row:
        return _err("Outreach event not found", 404)
    return _ok(row)


@outreach_bp.patch("/<event_id>/response")
def record_response(event_id: str):
    body = request.get_json(silent=True) or {}
    outcome = body.get("outcome")
    if not outcome:
        return _err("outcome is required")
    row = _svc().record_response(
        event_id,
        outcome=outcome,
        response_received_at=body.get("response_received_at"),
    )
    if not row:
        return _err("Outreach event not found", 404)
    return _ok(row)


@outreach_bp.patch("/<event_id>")
def update_event(event_id: str):
    body = request.get_json(silent=True) or {}
    try:
        row = _svc().update_event(event_id, body)
    except ValueError as e:
        return _err(str(e), 400)
    if not row:
        return _err("Outreach event not found", 404)
    return _ok(row)


@outreach_bp.delete("/<event_id>")
def delete_event(event_id: str):
    ok = _svc().delete_event(event_id)
    if not ok:
        return _err("Failed to delete outreach event", 500)
    return _ok({"id": event_id, "deleted": True})
