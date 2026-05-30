"""
Counterparty Assignments Service.

Per-Deal role assignments that point at Contacts. Backed by the
`counterparty_assignments` table from migration
003_contacts_counterparties.sql.

A `Counterparty` is a role assignment on a specific Deal — it
points at a firm Contact (e.g., Britehorn Securities) and, where
useful, a rep Contact (Brett Story) and a compliance Contact
(Natalia Story). Fee economics live here, not on the Contact.
"""
from __future__ import annotations

from typing import Optional

from services.database import db


_ALLOWED_STATUSES = {
    "candidate", "pending_response", "active",
    "declined", "terminated", "completed",
}

_ALLOWED_FEE_BASES = {
    "flat", "tiered_flat", "bps", "pct_of_par", "hourly", "annual",
}

_UPDATABLE = {
    "role", "firm_contact_id", "rep_contact_id", "compliance_contact_id",
    "status", "engagement_basis", "fee_amount_usd", "fee_basis",
    "fee_milestones", "engagement_letter_url", "notes", "sector_fit_flag",
}


class CounterpartyAssignmentsService:
    """CRUD over counterparty_assignments."""

    # — create —

    def assign_counterparty(
        self,
        deal_id: str,
        role: str,
        firm_contact_id: Optional[str] = None,
        rep_contact_id: Optional[str] = None,
        compliance_contact_id: Optional[str] = None,
        **fields,
    ) -> Optional[dict]:
        row = {
            "deal_id": deal_id,
            "role": role,
            "firm_contact_id": firm_contact_id,
            "rep_contact_id": rep_contact_id,
            "compliance_contact_id": compliance_contact_id,
        }
        for k, v in fields.items():
            if k in _UPDATABLE:
                row[k] = v
        self._validate(row)
        # strip None to let DB defaults take effect
        row = {k: v for k, v in row.items() if v is not None}
        result = db.insert("counterparty_assignments", row)
        if not result:
            return None
        return result[0] if isinstance(result, list) else result

    # — read —

    def get_assignment(self, assignment_id: str) -> Optional[dict]:
        rows = db.select(
            "counterparty_assignments",
            {"id": f"eq.{assignment_id}"},
        )
        return rows[0] if rows else None

    def list_deal_counterparties(self, deal_id: str) -> list:
        rows = db.select(
            "counterparty_assignments",
            {"deal_id": f"eq.{deal_id}", "order": "role.asc"},
        )
        return rows or []

    def find_assignment(
        self, deal_id: str, role: str, firm_contact_id: str
    ) -> Optional[dict]:
        """Return an existing assignment for (deal, role, firm) — used by the
        seed loader for idempotency."""
        rows = db.select(
            "counterparty_assignments",
            {
                "deal_id": f"eq.{deal_id}",
                "role": f"eq.{role}",
                "firm_contact_id": f"eq.{firm_contact_id}",
            },
        )
        return rows[0] if rows else None

    # — update —

    def update_assignment(
        self, assignment_id: str, fields: dict
    ) -> Optional[dict]:
        row = {k: v for k, v in (fields or {}).items() if k in _UPDATABLE}
        if not row:
            return self.get_assignment(assignment_id)
        self._validate(row)
        db.update(
            "counterparty_assignments",
            {"id": f"eq.{assignment_id}"},
            row,
        )
        return self.get_assignment(assignment_id)

    def update_assignment_status(
        self, assignment_id: str, new_status: str
    ) -> Optional[dict]:
        if new_status not in _ALLOWED_STATUSES:
            raise ValueError(
                f"status must be one of {sorted(_ALLOWED_STATUSES)}"
            )
        return self.update_assignment(assignment_id, {"status": new_status})

    def set_assignment_fee(
        self,
        assignment_id: str,
        amount_usd: Optional[float],
        basis: Optional[str],
        milestones: Optional[list] = None,
    ) -> Optional[dict]:
        if basis is not None and basis not in _ALLOWED_FEE_BASES:
            raise ValueError(
                f"fee_basis must be one of {sorted(_ALLOWED_FEE_BASES)}"
            )
        fields: dict = {
            "fee_amount_usd": amount_usd,
            "fee_basis": basis,
        }
        if milestones is not None:
            fields["fee_milestones"] = milestones
        return self.update_assignment(assignment_id, fields)

    # — delete —

    def delete_assignment(self, assignment_id: str) -> bool:
        return bool(
            db.delete(
                "counterparty_assignments",
                {"id": f"eq.{assignment_id}"},
            )
        )

    # — internal —

    @staticmethod
    def _validate(row: dict) -> None:
        status = row.get("status")
        if status is not None and status not in _ALLOWED_STATUSES:
            raise ValueError(
                f"status must be one of {sorted(_ALLOWED_STATUSES)}"
            )
        basis = row.get("fee_basis")
        if basis is not None and basis not in _ALLOWED_FEE_BASES:
            raise ValueError(
                f"fee_basis must be one of {sorted(_ALLOWED_FEE_BASES)}"
            )
