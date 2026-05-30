"""
Study API — Series 50 / 54 / 7 / 24/63 curriculum + progress.

Per ADR-0001 (Layered Licensing Path) the Series 50/54 (Track 2) and
Series 7/24/63 (Track 1) study modules are v1 platform surfaces. Sean
studies while running deals.

Routes (mounted at /api/study):
  GET  /api/study/curriculum?exam=series_50  — list sections for one exam
  GET  /api/study/progress?exam=series_50    — current user's progress
  POST /api/study/progress                   — upsert one section's status
  GET  /api/study/summary                    — aggregate across exams
"""
from datetime import datetime

from flask import Blueprint, jsonify, request

from services.auth import current_user, require_auth
from services.study_service import StudyService, VALID_EXAMS

study_bp = Blueprint("study", __name__)


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


def _svc() -> StudyService:
    return StudyService()


# ── routes ─────────────────────────────────────────────────────


@study_bp.get("/curriculum")
def curriculum():
    """Return the curriculum for one exam.

    Query: ?exam=series_50 (default).
    Public — the outline itself is not user-specific.
    """
    exam = request.args.get("exam", "series_50")
    try:
        data = _svc().list_curriculum(exam)
    except ValueError as e:
        return _err(str(e), 400)
    return _ok(data)


@study_bp.get("/curriculum/all")
def curriculum_all():
    """Return curricula for all four exams keyed by code."""
    return _ok(_svc().list_all_curricula())


@study_bp.get("/progress")
@require_auth()
def progress():
    """Return the current user's progress for one exam.

    Query: ?exam=series_50 (default).
    """
    exam = request.args.get("exam", "series_50")
    user = current_user()
    if user is None:
        return _err("Authentication required", 401)
    try:
        data = _svc().get_progress(user.id, exam)
    except ValueError as e:
        return _err(str(e), 400)
    return _ok(data)


@study_bp.post("/progress")
@require_auth()
def mark_progress():
    """Upsert a single (exam, section_id) progress row for the current user.

    Body:
        {
          "exam": "series_50",
          "section_id": "s50_municipal_fund_securities",
          "status": "in_progress" | "completed" | "not_started",
          "score": 82,                    # optional
          "time_spent_minutes": 45,       # optional
          "notes": "..."                  # optional
        }
    """
    body = request.get_json(silent=True) or {}
    exam = body.get("exam")
    section_id = body.get("section_id")
    status = body.get("status")
    if not exam or not section_id or not status:
        return _err("exam, section_id, and status are required", 400)
    user = current_user()
    if user is None:
        return _err("Authentication required", 401)
    try:
        row = _svc().mark_section(
            user_id=user.id,
            exam=exam,
            section_id=section_id,
            status=status,
            score=body.get("score"),
            time_spent_minutes=body.get("time_spent_minutes"),
            notes=body.get("notes"),
        )
    except ValueError as e:
        return _err(str(e), 400)
    return _ok(row, 200)


@study_bp.get("/summary")
@require_auth()
def summary():
    """Aggregate progress across all four exams for the current user."""
    user = current_user()
    if user is None:
        return _err("Authentication required", 401)
    return _ok({
        "exams": list(VALID_EXAMS),
        "summary": _svc().summary(user.id),
    })
