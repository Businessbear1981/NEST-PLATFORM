"""Counterparty API.

Two layers live here:

1. The static directory from Appendix E of the Operating Framework
   (`services/counterparty_db.py`) — broker_dealers, bond_counsel,
   trustees, etc. Useful as a starting universe.

2. The per-Deal role assignments — `counterparty_assignments` table,
   service `CounterpartyAssignmentsService`. A Counterparty in the
   domain sense is a **role assignment on a specific Deal** that
   points at one or more Contacts (firm + rep + compliance).
"""
from datetime import datetime

from flask import Blueprint, jsonify, request

from services.counterparty_assignments_service import (
    CounterpartyAssignmentsService,
)

counterparties_bp = Blueprint("counterparties", __name__)


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
    return CounterpartyAssignmentsService()


# ── Static directory (Appendix E) ──────────────────────────────

@counterparties_bp.get("/")
def all_counterparties():
    from services.counterparty_db import get_all_counterparties
    return _ok(get_all_counterparties())


@counterparties_bp.get("/feasibility/<sector>")
def feasibility(sector: str):
    from services.counterparty_db import get_feasibility_consultants
    result = get_feasibility_consultants(sector)
    return _ok({"sector": sector, "consultants": result, "count": len(result)})


# ── Per-Deal role assignments ──────────────────────────────────

@counterparties_bp.get("/deal/<deal_id>")
def list_deal_counterparties(deal_id: str):
    rows = _svc().list_deal_counterparties(deal_id)
    return _ok({"deal_id": deal_id, "assignments": rows, "count": len(rows)})


@counterparties_bp.post("/deal/<deal_id>")
def create_deal_assignment(deal_id: str):
    body = request.get_json(silent=True) or {}
    role = body.get("role")
    if not role:
        return _err("role is required")
    try:
        row = _svc().assign_counterparty(
            deal_id=deal_id,
            role=role,
            firm_contact_id=body.get("firm_contact_id"),
            rep_contact_id=body.get("rep_contact_id"),
            compliance_contact_id=body.get("compliance_contact_id"),
            status=body.get("status"),
            engagement_basis=body.get("engagement_basis"),
            fee_amount_usd=body.get("fee_amount_usd"),
            fee_basis=body.get("fee_basis"),
            fee_milestones=body.get("fee_milestones"),
            engagement_letter_url=body.get("engagement_letter_url"),
            notes=body.get("notes") or {},
            sector_fit_flag=body.get("sector_fit_flag"),
        )
    except ValueError as e:
        return _err(str(e), 400)
    if not row:
        return _err("Failed to create assignment", 500)
    return _ok(row, 201)


@counterparties_bp.patch("/assignment/<assignment_id>")
def update_assignment(assignment_id: str):
    body = request.get_json(silent=True) or {}
    try:
        if "fee_amount_usd" in body or "fee_basis" in body:
            row = _svc().set_assignment_fee(
                assignment_id,
                amount_usd=body.get("fee_amount_usd"),
                basis=body.get("fee_basis"),
                milestones=body.get("fee_milestones"),
            )
            # Apply any other patchable fields too.
            extras = {
                k: v for k, v in body.items()
                if k not in {"fee_amount_usd", "fee_basis", "fee_milestones"}
            }
            if extras:
                row = _svc().update_assignment(assignment_id, extras)
        else:
            row = _svc().update_assignment(assignment_id, body)
    except ValueError as e:
        return _err(str(e), 400)
    if not row:
        return _err("Assignment not found", 404)
    return _ok(row)


@counterparties_bp.delete("/assignment/<assignment_id>")
def delete_assignment(assignment_id: str):
    ok = _svc().delete_assignment(assignment_id)
    if not ok:
        return _err("Failed to delete assignment", 500)
    return _ok({"id": assignment_id, "deleted": True})


# ── Role lookup (static directory) — kept last so /<role> doesn't
# capture /deal, /assignment, /feasibility paths above. ────────

@counterparties_bp.get("/<role>")
def by_role(role: str):
    from services.counterparty_db import get_counterparties_by_role
    result = get_counterparties_by_role(role)
    return _ok({"role": role, "counterparties": result, "count": len(result)})
