"""
Contacts Service — universal address book.

Backs the `contacts` table created by migration
003_contacts_counterparties.sql. A Contact is either a person
(David Rosenberg) or a firm (Greenberg Traurig). Person Contacts
link to a firm Contact via `firm_id`.

A Contact exists independently of any Deal. The same Contact
can become a Counterparty (role assignment) on many Deals over
time — see counterparty_assignments_service.

The "partners database" surface is a filtered view: firms whose
`serves_as` overlaps a known set of Counterparty roles.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Iterable, Optional

from services.database import db


# Roles that promote a firm Contact into the "partners database" view.
# Keep this in sync with the roles enumerated under CONTEXT.md "Counterparty".
COUNTERPARTY_ROLES = (
    "bond_counsel",
    "trustee",
    "financial_advisor",
    "surety_carrier",
    "placement_partner",
    "rating_agent",
    "feasibility_consultant",
    "construction_lender",
    "underwriter_counsel",
    "muni_advisor",
    "broker_dealer",
    "bd_sponsor",
    "investment_bank",
    "qoe_firm",
    "verification_agent",
    "dissemination_agent",
    "construction_monitor",
    "loc_bank",
    "bond_insurer",
)


# ── helpers ────────────────────────────────────────────────────

# Fields we accept on create / update. Anything else is silently dropped
# so callers can post the seed JSON wholesale.
_CONTACT_FIELDS = {
    "external_id", "type", "name", "doing_business_as", "title",
    "firm_id", "firm_type", "email", "phone", "linkedin", "website",
    "hq_address", "secondary_offices", "finra_bd_number", "msrb_ma_id",
    "serves_as", "osint_dossier_ref", "background_notes",
    "sector_fit_flag", "tags",
}

# Identity columns we never overwrite on update.
_CONTACT_IMMUTABLE = {"id", "external_id", "type", "created_at"}


def _scrub(payload: dict, allowed: set, drop_immutable: bool = False) -> dict:
    out = {k: v for k, v in (payload or {}).items() if k in allowed}
    if drop_immutable:
        for k in _CONTACT_IMMUTABLE:
            out.pop(k, None)
    return out


def _csv_in(values: Iterable[str]) -> str:
    """Build a PostgREST `in.(a,b,c)` filter value, quoting safely."""
    parts = []
    for v in values:
        s = str(v).replace('"', '\\"')
        parts.append(f'"{s}"')
    return f"in.({','.join(parts)})"


# ── service ────────────────────────────────────────────────────

class ContactsService:
    """CRUD + search + seed loader for the contacts address book."""

    # — single-row CRUD —

    def create_contact(self, payload: dict) -> Optional[dict]:
        row = _scrub(payload, _CONTACT_FIELDS)
        if not row.get("name") or not row.get("type"):
            raise ValueError("contact requires both 'name' and 'type'")
        if row["type"] not in ("person", "firm"):
            raise ValueError("contact.type must be 'person' or 'firm'")
        result = db.insert("contacts", row)
        if not result:
            return None
        return result[0] if isinstance(result, list) else result

    def update_contact(self, contact_id: str, payload: dict) -> Optional[dict]:
        row = _scrub(payload, _CONTACT_FIELDS, drop_immutable=True)
        if not row:
            return self.get_contact(contact_id)
        db.update("contacts", {"id": f"eq.{contact_id}"}, row)
        return self.get_contact(contact_id)

    def get_contact(self, contact_id: str) -> Optional[dict]:
        rows = db.select("contacts", {"id": f"eq.{contact_id}"})
        if not rows:
            return None
        return rows[0]

    def get_by_external_id(self, external_id: str) -> Optional[dict]:
        rows = db.select("contacts", {"external_id": f"eq.{external_id}"})
        if not rows:
            return None
        return rows[0]

    def delete_contact(self, contact_id: str) -> bool:
        return bool(db.delete("contacts", {"id": f"eq.{contact_id}"}))

    # — search —

    def find_contacts(self, filters: dict | None = None) -> list:
        """Search contacts.

        Supported filters:
          type        — 'person' | 'firm'
          q           — name substring (case-insensitive)
          firm_id     — uuid
          serves_as   — role string (matches if contact.serves_as contains it)
          tag         — tag string (matches if contact.tags contains it)
        """
        filters = filters or {}
        params: dict[str, str] = {"order": "name.asc"}
        if filters.get("type"):
            params["type"] = f"eq.{filters['type']}"
        if filters.get("firm_id"):
            params["firm_id"] = f"eq.{filters['firm_id']}"
        if filters.get("q"):
            params["name"] = f"ilike.*{filters['q']}*"
        if filters.get("serves_as"):
            # PostgREST array contains: `cs.{role}`
            params["serves_as"] = f"cs.{{{filters['serves_as']}}}"
        if filters.get("tag"):
            params["tags"] = f"cs.{{{filters['tag']}}}"
        return db.select("contacts", params) or []

    # — partners database (filtered view) —

    def list_partner_firms(self, role: str | None = None) -> list:
        """Firms whose serves_as overlaps a counterparty role set.

        If `role` is provided, narrow to that role; otherwise return any
        firm whose serves_as overlaps the full COUNTERPARTY_ROLES set.
        """
        params: dict[str, str] = {
            "type": "eq.firm",
            "order": "name.asc",
        }
        if role:
            params["serves_as"] = f"cs.{{{role}}}"
        else:
            # ov = "overlaps" — any element of the array matches.
            roles_csv = ",".join(COUNTERPARTY_ROLES)
            params["serves_as"] = f"ov.{{{roles_csv}}}"
        return db.select("contacts", params) or []

    # — seed loader —

    def seed_from_json(self, path: str | os.PathLike | None = None) -> dict:
        """Idempotent loader for the Brett-launch seed.

        Matches existing rows by `external_id`. Updates mutable fields
        on a hit, inserts on a miss. Returns a count summary.

        Two passes are run because person Contacts reference firm
        Contacts via `firm_id`, and the seed JSON uses external ids
        ("britehorn_securities") for that linkage.
        """
        path = Path(path) if path else self._default_seed_path()
        if not path.exists():
            raise FileNotFoundError(f"seed file not found: {path}")

        with open(path, "r", encoding="utf-8") as f:
            seed = json.load(f)

        contacts_in = seed.get("contacts", []) or []
        cp_in = seed.get("deal_counterparty_assignments", []) or []
        outreach_in = seed.get("outreach_events", []) or []

        summary = {
            "contacts_inserted": 0,
            "contacts_updated": 0,
            "contacts_skipped": 0,
            "counterparties_inserted": 0,
            "counterparties_updated": 0,
            "counterparties_skipped": 0,
            "outreach_inserted": 0,
            "outreach_skipped": 0,
            "warnings": [],
        }

        # — Pass 1: upsert firms first so person.firm_id can resolve —
        ordered = sorted(
            contacts_in,
            key=lambda c: 0 if c.get("type") == "firm" else 1,
        )
        ext_to_uuid: dict[str, str] = {}

        for c in ordered:
            ext = c.get("external_id")
            if not ext:
                summary["warnings"].append(
                    f"contact missing external_id, skipped: {c.get('name')}"
                )
                summary["contacts_skipped"] += 1
                continue

            existing = self.get_by_external_id(ext)
            payload = dict(c)

            # Resolve firm_id from external_id form if needed.
            raw_firm = payload.get("firm_id") or payload.get("parent_or_affiliate_firm")
            if raw_firm and not _looks_like_uuid(raw_firm):
                resolved = ext_to_uuid.get(raw_firm)
                if not resolved:
                    firm_row = self.get_by_external_id(raw_firm)
                    resolved = firm_row["id"] if firm_row else None
                if resolved:
                    payload["firm_id"] = resolved
                else:
                    payload.pop("firm_id", None)
                    summary["warnings"].append(
                        f"unresolved firm reference '{raw_firm}' on contact '{ext}'"
                    )

            payload.pop("parent_or_affiliate_firm", None)
            # Seed JSON has a couple of free-form keys we want to keep
            # somewhere; fold them into background_notes if there's room.
            for extra_key in ("platform_model", "affiliated_ib",
                              "track_record_summary", "joined"):
                if extra_key in payload:
                    extra_val = payload.pop(extra_key)
                    notes = payload.get("background_notes") or ""
                    sep = " | " if notes else ""
                    payload["background_notes"] = (
                        f"{notes}{sep}{extra_key}: {extra_val}"
                    )

            if existing:
                row = self.update_contact(existing["id"], payload)
                if row:
                    ext_to_uuid[ext] = row["id"]
                    summary["contacts_updated"] += 1
                else:
                    summary["contacts_skipped"] += 1
            else:
                row = self.create_contact(payload)
                if row:
                    ext_to_uuid[ext] = row["id"]
                    summary["contacts_inserted"] += 1
                else:
                    summary["contacts_skipped"] += 1
                    summary["warnings"].append(
                        f"insert failed for contact '{ext}'"
                    )

        # — Pass 2: counterparty_assignments —
        # Imports here to avoid a hard cycle at module load time.
        from services.counterparty_assignments_service import (
            CounterpartyAssignmentsService,
        )
        from services.outreach_service import OutreachService

        cp_svc = CounterpartyAssignmentsService()
        out_svc = OutreachService()

        for a in cp_in:
            deal_ref = a.get("deal_name_or_id")
            firm_ext = a.get("contact_external_id")
            role = a.get("role")
            if not (deal_ref and firm_ext and role):
                summary["warnings"].append(
                    f"assignment missing deal/firm/role, skipped: {a}"
                )
                summary["counterparties_skipped"] += 1
                continue

            deal_id = _resolve_deal_id(deal_ref)
            if not deal_id:
                summary["warnings"].append(
                    f"deal not found for assignment: '{deal_ref}'"
                )
                summary["counterparties_skipped"] += 1
                continue

            firm_id = ext_to_uuid.get(firm_ext) or _ext_to_uuid(firm_ext)
            rep_id = _ext_to_uuid_opt(
                a.get("rep_contact_external_id"), ext_to_uuid
            )
            comp_id = _ext_to_uuid_opt(
                a.get("compliance_contact_external_id"), ext_to_uuid
            )
            if not firm_id:
                summary["warnings"].append(
                    f"firm contact '{firm_ext}' unresolved on assignment"
                )
                summary["counterparties_skipped"] += 1
                continue

            existing = cp_svc.find_assignment(deal_id, role, firm_id)
            extra_fields = {
                k: v for k, v in a.items() if k in (
                    "status", "engagement_basis", "fee_amount_usd",
                    "fee_basis", "fee_milestones", "engagement_letter_url",
                    "sector_fit_flag",
                )
            }
            note_payload = {}
            if a.get("notes"):
                note_payload["notes"] = a["notes"]
            if note_payload:
                extra_fields["notes"] = note_payload

            if existing:
                cp_svc.update_assignment(existing["id"], extra_fields)
                summary["counterparties_updated"] += 1
            else:
                cp_svc.assign_counterparty(
                    deal_id=deal_id,
                    role=role,
                    firm_contact_id=firm_id,
                    rep_contact_id=rep_id,
                    compliance_contact_id=comp_id,
                    **extra_fields,
                )
                summary["counterparties_inserted"] += 1

        # — Pass 3: outreach_events —
        for e in outreach_in:
            kind = e.get("kind")
            to_ext = e.get("to_contact_external_id")
            if not (kind and to_ext):
                summary["outreach_skipped"] += 1
                continue
            to_id = ext_to_uuid.get(to_ext) or _ext_to_uuid(to_ext)
            if not to_id:
                summary["warnings"].append(
                    f"outreach to_contact unresolved: '{to_ext}'"
                )
                summary["outreach_skipped"] += 1
                continue

            # Idempotency for outreach: match on (kind, to_contact_id,
            # scheduled_at) — same touch on same day to same person.
            scheduled_at = e.get("scheduled_at")
            if _outreach_exists(kind, to_id, scheduled_at):
                summary["outreach_skipped"] += 1
                continue

            out_svc.log_outreach(
                kind=kind,
                channel=e.get("channel"),
                to_contact_id=to_id,
                deal_ids=[],
                scheduled_at=scheduled_at,
                from_contact_name=e.get("from_contact_name"),
                subject_line=e.get("subject_line_intent"),
                framing_notes=e.get("framing_notes"),
                attachments=e.get("attachments") or [],
                expected_response_window_days=e.get(
                    "expected_response_window_days"
                ),
            )
            summary["outreach_inserted"] += 1

        return summary

    # — internals —

    @staticmethod
    def _default_seed_path() -> Path:
        # backend/services/contacts_service.py → ../../docs/seeds/…
        backend_dir = Path(__file__).resolve().parent.parent
        return backend_dir.parent / "docs" / "seeds" / "2026-05-29-brett-launch.json"


# ── module-level utilities ─────────────────────────────────────

_UUID_HEX_LEN = 32


def _looks_like_uuid(value: str) -> bool:
    if not isinstance(value, str):
        return False
    stripped = value.replace("-", "")
    return len(stripped) == _UUID_HEX_LEN and all(
        c in "0123456789abcdefABCDEF" for c in stripped
    )


def _ext_to_uuid(external_id: str) -> Optional[str]:
    rows = db.select("contacts", {"external_id": f"eq.{external_id}"})
    if not rows:
        return None
    return rows[0]["id"]


def _ext_to_uuid_opt(
    external_id: Optional[str], cache: dict[str, str]
) -> Optional[str]:
    if not external_id:
        return None
    return cache.get(external_id) or _ext_to_uuid(external_id)


def _resolve_deal_id(deal_ref: str) -> Optional[str]:
    """Resolve a deal name or id to a deal uuid. Returns None on miss."""
    if not deal_ref:
        return None
    if _looks_like_uuid(deal_ref):
        rows = db.select("deals", {"id": f"eq.{deal_ref}"})
        return rows[0]["id"] if rows else None
    # Name match — case-insensitive, exact.
    rows = db.select("deals", {"name": f"ilike.{deal_ref}"})
    if rows:
        return rows[0]["id"]
    # Fallback: leading-substring match.
    rows = db.select("deals", {"name": f"ilike.{deal_ref}*"})
    if rows:
        return rows[0]["id"]
    return None


def _outreach_exists(
    kind: str, to_contact_id: str, scheduled_at: Optional[str]
) -> bool:
    params = {
        "kind": f"eq.{kind}",
        "to_contact_id": f"eq.{to_contact_id}",
    }
    if scheduled_at:
        params["scheduled_at"] = f"eq.{scheduled_at}"
    rows = db.select("outreach_events", params)
    return bool(rows)
