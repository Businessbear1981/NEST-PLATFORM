"""
Outreach Service — log of touches against Contacts and Deals.

Backs the `outreach_events` table from migration
003_contacts_counterparties.sql. Each row is one outreach action:
the Brett-launch email, a follow-up call, an event invitation, etc.

An outreach event may be associated with zero or more deals via
the `deal_ids` uuid[] column.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from services.database import db


_ALLOWED_CHANNELS = {"email", "call", "meeting", "linkedin", "event"}

_UPDATABLE = {
    "kind", "scheduled_at", "sent_at", "channel", "to_contact_id",
    "from_contact_name", "subject_line", "framing_notes",
    "attachments", "deal_ids", "expected_response_window_days",
    "response_received_at", "outcome", "notes",
}


class OutreachService:
    """CRUD over outreach_events."""

    # — create —

    def log_outreach(
        self,
        kind: str,
        channel: Optional[str] = None,
        to_contact_id: Optional[str] = None,
        deal_ids: Optional[list] = None,
        **fields,
    ) -> Optional[dict]:
        if not kind:
            raise ValueError("kind is required")
        if channel is not None and channel not in _ALLOWED_CHANNELS:
            raise ValueError(
                f"channel must be one of {sorted(_ALLOWED_CHANNELS)}"
            )
        row = {
            "kind": kind,
            "channel": channel,
            "to_contact_id": to_contact_id,
            "deal_ids": deal_ids or [],
        }
        for k, v in fields.items():
            if k in _UPDATABLE:
                row[k] = v
        row = {k: v for k, v in row.items() if v is not None}
        result = db.insert("outreach_events", row)
        if not result:
            return None
        return result[0] if isinstance(result, list) else result

    # — read —

    def get_event(self, event_id: str) -> Optional[dict]:
        rows = db.select("outreach_events", {"id": f"eq.{event_id}"})
        return rows[0] if rows else None

    def list_outreach(self, filters: Optional[dict] = None) -> list:
        """List outreach with optional filters.

        Supported filters:
          to_contact_id    — uuid
          kind             — string
          channel          — email|call|meeting|linkedin|event
          deal_id          — uuid (matches if event.deal_ids contains it)
          since            — ISO timestamp; sent_at OR scheduled_at >=
          limit            — int (default 100, server-capped at 500)
        """
        filters = filters or {}
        params: dict[str, str] = {"order": "sent_at.desc.nullslast"}
        if filters.get("to_contact_id"):
            params["to_contact_id"] = f"eq.{filters['to_contact_id']}"
        if filters.get("kind"):
            params["kind"] = f"eq.{filters['kind']}"
        if filters.get("channel"):
            params["channel"] = f"eq.{filters['channel']}"
        if filters.get("deal_id"):
            # array contains
            params["deal_ids"] = f"cs.{{{filters['deal_id']}}}"
        if filters.get("since"):
            params["sent_at"] = f"gte.{filters['since']}"
        limit = int(filters.get("limit") or 100)
        if limit < 1:
            limit = 1
        if limit > 500:
            limit = 500
        params["limit"] = str(limit)
        return db.select("outreach_events", params) or []

    # — update —

    def update_event(
        self, event_id: str, fields: dict
    ) -> Optional[dict]:
        row = {k: v for k, v in (fields or {}).items() if k in _UPDATABLE}
        channel = row.get("channel")
        if channel is not None and channel not in _ALLOWED_CHANNELS:
            raise ValueError(
                f"channel must be one of {sorted(_ALLOWED_CHANNELS)}"
            )
        if not row:
            return self.get_event(event_id)
        db.update("outreach_events", {"id": f"eq.{event_id}"}, row)
        return self.get_event(event_id)

    def record_response(
        self,
        event_id: str,
        outcome: str,
        response_received_at: Optional[str] = None,
    ) -> Optional[dict]:
        ts = response_received_at or datetime.utcnow().isoformat()
        return self.update_event(
            event_id,
            {"outcome": outcome, "response_received_at": ts},
        )

    # — delete —

    def delete_event(self, event_id: str) -> bool:
        return bool(
            db.delete("outreach_events", {"id": f"eq.{event_id}"})
        )
