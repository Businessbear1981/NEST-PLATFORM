"""
Construction Risk Management Routes — Milestones, draws, change orders.
Backed by Supabase construction_milestones / construction_draws / change_orders tables.
Falls back to deal-derived defaults when tables are empty.
"""
from flask import Blueprint, jsonify, request
from datetime import datetime
from services.auth import require_auth

construction_bp = Blueprint("construction", __name__)


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _db():
    from services.database import DatabaseService
    return DatabaseService()


# Default milestone templates based on deal size
_DEFAULT_MILESTONES = [
    {"task_key": "site_work", "task_label": "Site Work & Foundation", "phase_pct": 0, "budget_pct": 0.12, "critical": True},
    {"task_key": "structural", "task_label": "Structural Steel / Framing", "phase_pct": 15, "budget_pct": 0.27, "critical": True},
    {"task_key": "mep", "task_label": "MEP Rough-In", "phase_pct": 35, "budget_pct": 0.18, "critical": True},
    {"task_key": "exterior", "task_label": "Exterior Envelope", "phase_pct": 55, "budget_pct": 0.15, "critical": False},
    {"task_key": "interior", "task_label": "Interior Finishes", "phase_pct": 70, "budget_pct": 0.21, "critical": False},
    {"task_key": "ffe", "task_label": "FF&E Installation", "phase_pct": 90, "budget_pct": 0.07, "critical": False},
    {"task_key": "substantial", "task_label": "Substantial Completion", "phase_pct": 100, "budget_pct": 0.0, "critical": True},
]


def _seed_milestones(deal_id: str, deal_size: float):
    db = _db()
    rows = []
    for m in _DEFAULT_MILESTONES:
        rows.append({
            "id": f"{deal_id}_{m['task_key']}",
            "deal_id": deal_id,
            "task_key": m["task_key"],
            "task_label": m["task_label"],
            "budget_usd": round(deal_size * m["budget_pct"]),
            "spent_usd": 0,
            "completion_pct": 0,
            "critical": m["critical"],
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
        })
    try:
        db.upsert("construction_milestones", rows, on_conflict="id")
    except Exception:
        pass
    return rows


@construction_bp.route("/deals/<deal_id>/milestones", methods=["GET"])
def get_milestones(deal_id):
    db = _db()
    rows = db.select("construction_milestones", {"deal_id": f"eq.{deal_id}"}) or []
    if not rows:
        # Seed from deal
        deal_rows = db.select("deals", {"id": f"eq.{deal_id}"}) or []
        deal = deal_rows[0] if deal_rows else {}
        deal_size = float(deal.get("bond_face") or deal.get("total_raise_usd") or 50_000_000)
        rows = _seed_milestones(deal_id, deal_size)

    total_budget = sum(r.get("budget_usd", 0) for r in rows)
    total_spent = sum(r.get("spent_usd", 0) for r in rows)
    avg_pct = round(sum(r.get("completion_pct", 0) for r in rows) / max(len(rows), 1))

    return _ok({
        "milestones": rows,
        "total_budget_usd": total_budget,
        "total_spent_usd": total_spent,
        "overall_pct": avg_pct,
        "deal_id": deal_id,
    })


@construction_bp.route("/deals/<deal_id>/milestones/<milestone_id>", methods=["PATCH"])
def update_milestone(deal_id, milestone_id):
    b = request.get_json() or {}
    allowed = {"completion_pct", "spent_usd", "status", "actual_date", "notes"}
    updates = {k: v for k, v in b.items() if k in allowed}
    if not updates:
        return _err("No valid fields to update")
    db = _db()
    result = db.update("construction_milestones", {"id": f"eq.{milestone_id}"}, updates)
    if not result:
        return _err("Milestone not found", 404)
    return _ok(result[0] if isinstance(result, list) else result)


@construction_bp.route("/deals/<deal_id>/draws", methods=["GET"])
def get_draws(deal_id):
    db = _db()
    rows = db.select("construction_draws", {"deal_id": f"eq.{deal_id}"}) or []
    if not rows:
        # Generate default draw schedule from deal size
        deal_rows = db.select("deals", {"id": f"eq.{deal_id}"}) or []
        deal = deal_rows[0] if deal_rows else {}
        deal_size = float(deal.get("bond_face") or 50_000_000)
        # 6-draw schedule proportional to deal size
        amounts = [0.14, 0.16, 0.19, 0.18, 0.18, 0.15]
        rows = [{
            "id": f"{deal_id}_draw_{i+1}",
            "deal_id": deal_id,
            "draw_number": i + 1,
            "amount_usd": round(deal_size * pct),
            "status": "funded" if i < 3 else ("pending" if i == 3 else "scheduled"),
            "category": ["Site Work", "Foundation", "Structural", "Structural + MEP", "MEP + Exterior", "Exterior + Interior"][i],
        } for i, pct in enumerate(amounts)]
        try:
            db.upsert("construction_draws", rows, on_conflict="id")
        except Exception:
            pass

    total_funded = sum(r.get("amount_usd", 0) for r in rows if r.get("status") == "funded")
    total_scheduled = sum(r.get("amount_usd", 0) for r in rows)

    return _ok({
        "draws": rows,
        "total_funded_usd": total_funded,
        "total_scheduled_usd": total_scheduled,
        "deal_id": deal_id,
    })


@construction_bp.route("/deals/<deal_id>/draws/<draw_id>", methods=["PATCH"])
def update_draw(deal_id, draw_id):
    b = request.get_json() or {}
    allowed = {"status", "funded_date", "notes", "amount_usd"}
    updates = {k: v for k, v in b.items() if k in allowed}
    if not updates:
        return _err("No valid fields")
    db = _db()
    result = db.update("construction_draws", {"id": f"eq.{draw_id}"}, updates)
    if not result:
        return _err("Draw not found", 404)
    return _ok(result[0] if isinstance(result, list) else result)


@construction_bp.route("/deals/<deal_id>/change-orders", methods=["GET"])
def get_change_orders(deal_id):
    db = _db()
    rows = db.select("change_orders", {"deal_id": f"eq.{deal_id}"}) or []
    total = sum(r.get("amount_usd", 0) for r in rows)
    approved = sum(r.get("amount_usd", 0) for r in rows if r.get("status") == "approved")
    return _ok({
        "change_orders": rows,
        "total_amount_usd": total,
        "approved_amount_usd": approved,
        "pending_count": len([r for r in rows if r.get("status") == "pending"]),
    })


@construction_bp.route("/deals/<deal_id>/change-orders", methods=["POST"])
def add_change_order(deal_id):
    b = request.get_json() or {}
    if not b.get("description") or not b.get("amount_usd"):
        return _err("description and amount_usd required")
    db = _db()
    row = {
        "deal_id": deal_id,
        "co_id": f"CO-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "description": b["description"],
        "amount_usd": float(b["amount_usd"]),
        "status": b.get("status", "pending"),
        "schedule_impact": b.get("schedule_impact", "TBD"),
        "created_at": datetime.utcnow().isoformat(),
    }
    result = db.insert("change_orders", row)
    return _ok(result or row, 201)


@construction_bp.route("/deals/<deal_id>/summary", methods=["GET"])
def construction_summary(deal_id):
    """Full construction summary — milestones + draws + change orders in one call."""
    db = _db()

    milestones = db.select("construction_milestones", {"deal_id": f"eq.{deal_id}"}) or []
    draws = db.select("construction_draws", {"deal_id": f"eq.{deal_id}"}) or []
    cos = db.select("change_orders", {"deal_id": f"eq.{deal_id}"}) or []

    if not milestones:
        deal_rows = db.select("deals", {"id": f"eq.{deal_id}"}) or []
        deal = deal_rows[0] if deal_rows else {}
        deal_size = float(deal.get("bond_face") or 50_000_000)
        milestones = _seed_milestones(deal_id, deal_size)

    return _ok({
        "deal_id": deal_id,
        "milestones": milestones,
        "draws": draws,
        "change_orders": cos,
        "stats": {
            "total_budget_usd": sum(m.get("budget_usd", 0) for m in milestones),
            "total_spent_usd": sum(m.get("spent_usd", 0) for m in milestones),
            "overall_pct": round(sum(m.get("completion_pct", 0) for m in milestones) / max(len(milestones), 1)),
            "draws_funded": sum(d.get("amount_usd", 0) for d in draws if d.get("status") == "funded"),
            "change_order_total_usd": sum(c.get("amount_usd", 0) for c in cos),
        },
    })
