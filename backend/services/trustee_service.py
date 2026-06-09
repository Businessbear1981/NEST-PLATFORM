"""
Trustee Management Service — per-deal task tracking backed by Supabase.
Falls back to in-memory defaults when the DB table isn't populated yet.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from services.database import DatabaseService


_DEFAULT_TASKS = [
    {"task_key": "t1",  "task_label": "Bond indenture review & execution",     "phase": "pre-issuance"},
    {"task_key": "t2",  "task_label": "Paying agent agreement",                "phase": "pre-issuance"},
    {"task_key": "t3",  "task_label": "Escrow account setup",                  "phase": "pre-issuance"},
    {"task_key": "t4",  "task_label": "CUSIP/ISIN registration",               "phase": "pre-issuance"},
    {"task_key": "t5",  "task_label": "DTC eligibility confirmation",          "phase": "pre-issuance"},
    {"task_key": "t6",  "task_label": "Coupon payment processing",             "phase": "post-issuance"},
    {"task_key": "t7",  "task_label": "Sinking fund administration",           "phase": "post-issuance"},
    {"task_key": "t8",  "task_label": "Bondholder communication",              "phase": "post-issuance"},
    {"task_key": "t9",  "task_label": "Annual compliance certification",       "phase": "ongoing"},
    {"task_key": "t10", "task_label": "Event of default monitoring",           "phase": "ongoing"},
]


class TrusteeService:
    def __init__(self) -> None:
        self._db = DatabaseService()

    # ---------- read ----------

    def get_tasks(self, deal_id: str, phase: Optional[str] = None) -> dict:
        rows = self._db.select(
            "trustee_tasks",
            filters={"deal_id": deal_id} if deal_id else None,
        ) or []

        if not rows and deal_id:
            rows = self._seed_deal(deal_id)

        if phase:
            rows = [r for r in rows if r.get("phase") == phase]

        completed = sum(1 for r in rows if r.get("status") == "completed")
        return {
            "deal_id": deal_id,
            "tasks": rows,
            "total": len(rows),
            "completed": completed,
            "completion_pct": round(completed / len(rows) * 100) if rows else 0,
        }

    def get_task(self, task_id: str) -> Optional[dict]:
        rows = self._db.select("trustee_tasks", filters={"id": task_id}) or []
        return rows[0] if rows else None

    # ---------- write ----------

    def update_task(self, task_id: str, updates: dict) -> Optional[dict]:
        allowed = {"status", "assignee", "due_date", "completed_at", "notes"}
        payload = {k: v for k, v in updates.items() if k in allowed}
        if not payload:
            return self.get_task(task_id)

        if payload.get("status") == "completed" and "completed_at" not in payload:
            payload["completed_at"] = datetime.utcnow().isoformat() + "Z"

        self._db.update("trustee_tasks", payload, filters={"id": task_id})
        return self.get_task(task_id)

    def add_task(self, deal_id: str, data: dict) -> Optional[dict]:
        row = {
            "deal_id":    deal_id,
            "task_key":   data.get("task_key", f"custom_{datetime.utcnow().timestamp():.0f}"),
            "task_label": data.get("task_label", "Custom task"),
            "phase":      data.get("phase", "ongoing"),
            "status":     data.get("status", "pending"),
            "assignee":   data.get("assignee"),
            "due_date":   data.get("due_date"),
            "notes":      data.get("notes"),
        }
        result = self._db.insert("trustee_tasks", row)
        return result

    # ---------- global (no deal filter) ----------

    def all_tasks(self, phase: Optional[str] = None) -> dict:
        rows = self._db.select("trustee_tasks") or []
        if phase:
            rows = [r for r in rows if r.get("phase") == phase]
        completed = sum(1 for r in rows if r.get("status") == "completed")
        return {
            "tasks": rows,
            "total": len(rows),
            "completed": completed,
            "completion_pct": round(completed / len(rows) * 100) if rows else 0,
        }

    # ---------- internal ----------

    def _seed_deal(self, deal_id: str) -> list[dict]:
        rows = []
        for t in _DEFAULT_TASKS:
            row = self._db.insert("trustee_tasks", {
                "deal_id":    deal_id,
                "task_key":   t["task_key"],
                "task_label": t["task_label"],
                "phase":      t["phase"],
                "status":     "pending",
            })
            if row:
                rows.append(row)
        return rows
