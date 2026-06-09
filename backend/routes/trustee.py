"""Trustee Management API — per-deal task tracking."""
from datetime import datetime

from flask import Blueprint, jsonify, request

from services.trustee_service import TrusteeService

trustee_bp = Blueprint("trustee", __name__)


def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


def _svc():
    return TrusteeService()


# ---------- deal-scoped ----------

@trustee_bp.get("/deals/<deal_id>/tasks")
def deal_tasks(deal_id: str):
    phase = request.args.get("phase")
    return _ok(_svc().get_tasks(deal_id, phase))


@trustee_bp.post("/deals/<deal_id>/tasks")
def add_deal_task(deal_id: str):
    body = request.get_json(silent=True) or {}
    if not body.get("task_label"):
        return _err("task_label is required")
    row = _svc().add_task(deal_id, body)
    if not row:
        return _err("Failed to create task", 500)
    return _ok(row, 201)


# ---------- task-level ----------

@trustee_bp.get("/tasks/<task_id>")
def get_task(task_id: str):
    row = _svc().get_task(task_id)
    if not row:
        return _err("Task not found", 404)
    return _ok(row)


@trustee_bp.patch("/tasks/<task_id>")
def update_task(task_id: str):
    body = request.get_json(silent=True) or {}
    row = _svc().update_task(task_id, body)
    if not row:
        return _err("Task not found", 404)
    return _ok(row)


# ---------- global (no deal filter — used by legacy TrusteeManagementPanel) ----------

@trustee_bp.get("/tasks")
def all_tasks():
    phase = request.args.get("phase")
    return _ok(_svc().all_tasks(phase))
