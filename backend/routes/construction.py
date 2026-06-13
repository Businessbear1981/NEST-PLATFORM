"""
Construction Risk Management Desk Routes.
Draw processing, budget tracking, milestone monitoring, change orders.
Seeded with Convivial St. Petersburg ($172.5M new construction).
"""
from datetime import datetime
from flask import Blueprint, jsonify, request

construction_bp = Blueprint("construction", __name__)

# ── Seed data — Convivial St. Petersburg Senior Living ($172.5M) ─────────────

_DEALS: dict[str, dict] = {
    "convivial-st-pete": {
        "id": "convivial-st-pete",
        "name": "Convivial St. Petersburg",
        "asset_type": "senior_living_construction",
        "city": "St. Petersburg",
        "state": "FL",
        "total_budget_usd": 172_500_000,
        "construction_target_usd": 143_100_000,
        "units": 235,
        "status": "active",
        "stage": "new_construction",
        "gc": "Skanska USA Building",
        "architect": "HHCP Architects",
        "overall_pct": 34,
        "total_spent_usd": 48_700_000,
        "milestones": [
            {"id": "m1", "task_label": "Site Clearing & Demolition", "completion_pct": 100, "budget_usd": 4_200_000, "spent_usd": 4_075_000, "status": "completed", "critical": False},
            {"id": "m2", "task_label": "Deep Foundation / Piling", "completion_pct": 100, "budget_usd": 8_500_000, "spent_usd": 8_720_000, "status": "completed", "critical": True},
            {"id": "m3", "task_label": "Podium Concrete — Levels 1-3", "completion_pct": 85, "budget_usd": 22_000_000, "spent_usd": 19_100_000, "status": "in_progress", "critical": True},
            {"id": "m4", "task_label": "Structural Steel — Residential Tower", "completion_pct": 40, "budget_usd": 31_500_000, "spent_usd": 12_800_000, "status": "in_progress", "critical": True},
            {"id": "m5", "task_label": "MEP Rough-In — Common Areas", "completion_pct": 20, "budget_usd": 18_400_000, "spent_usd": 3_600_000, "status": "in_progress", "critical": False},
            {"id": "m6", "task_label": "Exterior Envelope / Facade", "completion_pct": 0, "budget_usd": 14_200_000, "spent_usd": 0, "status": "not_started", "critical": False},
            {"id": "m7", "task_label": "Interior Finishes — Memory Care Wing", "completion_pct": 0, "budget_usd": 11_800_000, "spent_usd": 0, "status": "not_started", "critical": False},
            {"id": "m8", "task_label": "Amenity Spaces & Dining", "completion_pct": 0, "budget_usd": 9_500_000, "spent_usd": 0, "status": "not_started", "critical": False},
            {"id": "m9", "task_label": "Landscaping & Site Work", "completion_pct": 0, "budget_usd": 5_200_000, "spent_usd": 0, "status": "not_started", "critical": False},
            {"id": "m10", "task_label": "TCO / Licensing / AHCA Inspection", "completion_pct": 0, "budget_usd": 1_200_000, "spent_usd": 0, "status": "not_started", "critical": True},
        ],
        "draws": [
            {"id": "d1", "draw_number": 1, "category": "Site & Foundation", "amount_usd": 9_800_000, "status": "funded", "funded_date": "2025-09-15", "lender_approved": True},
            {"id": "d2", "draw_number": 2, "category": "Piling & Substructure", "amount_usd": 11_200_000, "status": "funded", "funded_date": "2025-11-30", "lender_approved": True},
            {"id": "d3", "draw_number": 3, "category": "Podium Concrete L1-L2", "amount_usd": 14_600_000, "status": "funded", "funded_date": "2026-02-28", "lender_approved": True},
            {"id": "d4", "draw_number": 4, "category": "Podium Concrete L3 + Steel Mobilization", "amount_usd": 13_100_000, "status": "funded", "funded_date": "2026-05-15", "lender_approved": True},
            {"id": "d5", "draw_number": 5, "category": "Tower Steel Phase 1 + MEP Mobilization", "amount_usd": 16_800_000, "status": "pending", "funded_date": None, "lender_approved": False},
            {"id": "d6", "draw_number": 6, "category": "Tower Steel Phase 2", "amount_usd": 18_400_000, "status": "scheduled", "funded_date": None, "lender_approved": False},
            {"id": "d7", "draw_number": 7, "category": "MEP + Facade", "amount_usd": 19_200_000, "status": "scheduled", "funded_date": None, "lender_approved": False},
            {"id": "d8", "draw_number": 8, "category": "Interiors Phase 1", "amount_usd": 17_800_000, "status": "scheduled", "funded_date": None, "lender_approved": False},
            {"id": "d9", "draw_number": 9, "category": "Interiors Phase 2 + Amenities", "amount_usd": 16_900_000, "status": "scheduled", "funded_date": None, "lender_approved": False},
            {"id": "d10","draw_number": 10, "category": "Closeout + Retainage Release", "amount_usd": 12_700_000, "status": "scheduled", "funded_date": None, "lender_approved": False},
        ],
        "change_orders": [
            {"id": "co1", "co_id": "CO-001", "description": "Piling depth increase — 8ft due to unexpected soil layer at -42ft elevation", "amount_usd": 620_000, "status": "approved", "schedule_impact": "+4 days"},
            {"id": "co2", "co_id": "CO-002", "description": "Structural steel upsize — W14x82 → W14x99 per updated wind load calcs (FL Building Code 2023)", "amount_usd": 895_000, "status": "approved", "schedule_impact": None},
            {"id": "co3", "co_id": "CO-003", "description": "Upgrade memory care wing security to Wanderguard RFID door system (AHCA requirement 59A-36)", "amount_usd": 210_000, "status": "pending", "schedule_impact": None},
        ],
        "stats": {
            "total_budget_usd": 172_500_000,
            "total_spent_usd": 48_700_000,
            "overall_pct": 34,
            "draws_funded": 4,
            "draws_total": 10,
            "change_order_total_usd": 1_725_000,
            "projected_completion": "2027-Q3",
            "schedule_status": "ON_TRACK",
        },
    }
}

# Default deal ID (Convivial St Pete)
_DEFAULT_DEAL = "convivial-st-pete"


def _ok(data, code=200):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


def _err(msg, code=400):
    return jsonify({
        "success": False,
        "data": None,
        "error": msg,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


@construction_bp.get("/deals")
def list_construction_deals():
    """Return all construction deals tracked by the desk."""
    return _ok([
        {k: v for k, v in d.items() if k not in ("milestones", "draws", "change_orders")}
        for d in _DEALS.values()
    ])


@construction_bp.get("/deals/<deal_id>/summary")
def get_deal_summary(deal_id: str):
    """Return full construction summary — milestones, draws, change orders, stats."""
    deal = _DEALS.get(deal_id) or _DEALS.get(_DEFAULT_DEAL)
    return _ok({
        "id": deal["id"],
        "name": deal["name"],
        "stats": deal["stats"],
        "milestones": deal["milestones"],
        "draws": deal["draws"],
        "change_orders": deal["change_orders"],
    })


@construction_bp.patch("/deals/<deal_id>/milestones/<milestone_id>")
def patch_milestone(deal_id: str, milestone_id: str):
    """Update milestone completion percentage."""
    deal = _DEALS.get(deal_id) or _DEALS.get(_DEFAULT_DEAL)
    body = request.get_json(silent=True) or {}
    pct = body.get("completion_pct")
    if pct is None:
        return _err("completion_pct required")
    for m in deal["milestones"]:
        if m["id"] == milestone_id:
            m["completion_pct"] = max(0, min(100, int(pct)))
            if m["completion_pct"] == 100:
                m["status"] = "completed"
            return _ok(m)
    return _err(f"Milestone {milestone_id} not found", 404)


@construction_bp.patch("/deals/<deal_id>/draws/<draw_id>")
def patch_draw(deal_id: str, draw_id: str):
    """Update draw status (pending → funded)."""
    deal = _DEALS.get(deal_id) or _DEALS.get(_DEFAULT_DEAL)
    body = request.get_json(silent=True) or {}
    status = body.get("status")
    if not status:
        return _err("status required")
    for d in deal["draws"]:
        if d["id"] == draw_id:
            d["status"] = status
            if status == "funded":
                d["funded_date"] = datetime.utcnow().date().isoformat()
                d["lender_approved"] = True
            return _ok(d)
    return _err(f"Draw {draw_id} not found", 404)
