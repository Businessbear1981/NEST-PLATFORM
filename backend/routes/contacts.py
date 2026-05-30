"""Contacts API — universal address book.

CRUD over the contacts table plus a partners-database view and an
admin seed-loader for docs/seeds/2026-05-29-brett-launch.json.
"""
from datetime import datetime

from flask import Blueprint, jsonify, request

from services.contacts_service import ContactsService

contacts_bp = Blueprint("contacts", __name__)


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
    return ContactsService()


# ── routes ─────────────────────────────────────────────────────

@contacts_bp.get("")
def list_contacts():
    filters = {
        "type":      request.args.get("type"),
        "q":         request.args.get("q"),
        "firm_id":   request.args.get("firm_id"),
        "serves_as": request.args.get("serves_as"),
        "tag":       request.args.get("tag"),
    }
    rows = _svc().find_contacts(filters)
    return _ok({"contacts": rows, "count": len(rows)})


@contacts_bp.post("")
def create_contact():
    body = request.get_json(silent=True) or {}
    try:
        row = _svc().create_contact(body)
    except ValueError as e:
        return _err(str(e), 400)
    if not row:
        return _err("Failed to create contact", 500)
    return _ok(row, 201)


@contacts_bp.get("/partners")
def partners_view():
    """Filtered view of firms that serve as Counterparties.

    Optional ?role=bond_counsel narrows to a single role.
    """
    role = request.args.get("role")
    rows = _svc().list_partner_firms(role=role)
    return _ok({"role": role, "partners": rows, "count": len(rows)})


@contacts_bp.post("/seed")
def seed_contacts():
    """Admin: idempotent load of the Brett-launch seed JSON.

    Override path with body {"path": "...absolute path..."}.
    """
    body = request.get_json(silent=True) or {}
    path = body.get("path")
    try:
        summary = _svc().seed_from_json(path)
    except FileNotFoundError as e:
        return _err(str(e), 404)
    except Exception as e:
        return _err(f"seed failed: {e}", 500)
    return _ok(summary)


@contacts_bp.get("/<contact_id>")
def get_contact(contact_id):
    row = _svc().get_contact(contact_id)
    if not row:
        return _err("Contact not found", 404)
    return _ok(row)


@contacts_bp.patch("/<contact_id>")
def update_contact(contact_id):
    body = request.get_json(silent=True) or {}
    row = _svc().update_contact(contact_id, body)
    if not row:
        return _err("Contact not found", 404)
    return _ok(row)


@contacts_bp.delete("/<contact_id>")
def delete_contact(contact_id):
    ok = _svc().delete_contact(contact_id)
    if not ok:
        return _err("Failed to delete contact", 500)
    return _ok({"id": contact_id, "deleted": True})
