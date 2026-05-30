"""
Study Service — Series 50 / 54 / 7 / 24/63 curriculum + progress.

Per ADR-0001 (Layered Licensing Path):
  Track 1 (Britehorn-sponsored Registered Rep): Series 7 + 24 + 63
  Track 2 (NEST Advisors LLC as MSRB Municipal Advisor): Series 50 + 54

Both study tracks are v1 platform surfaces — Sean studies while running deals.

Curriculum content notes:
  - Series 50 and Series 54 outlines below follow the MSRB published
    content-outline structure. Section weights are approximate and reflect
    publicly stated MSRB content distribution; verify against the current
    MSRB Series 50/54 study guide before treating as authoritative.
  - Series 7 and Series 24/63 outlines are placeholder stubs to be
    replaced with the corresponding FINRA / NASAA published content
    outlines.

All sections carry `content_source` to make verification scope explicit.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from services.database import db


# ── Curriculum ────────────────────────────────────────────────────────
#
# Each exam has a list of sections. Sections may carry a `subsections`
# array — the frontend renders these inside an Accordion. The shape is
# stable and consumed by the frontend cards directly.

MSRB_SERIES_50_SOURCE = (
    "MSRB content outline — to be verified against current MSRB Series 50/54 study guide"
)
MSRB_SERIES_54_SOURCE = (
    "MSRB content outline — to be verified against current MSRB Series 50/54 study guide"
)
FINRA_PLACEHOLDER_SOURCE = (
    "Placeholder — to be loaded from FINRA / NASAA content outline"
)


CURRICULUM: dict[str, dict[str, Any]] = {
    "series_50": {
        "code": "series_50",
        "name": "Series 50",
        "long_name": "MSRB Municipal Advisor Representative Qualification Examination",
        "regulator": "MSRB",
        "track": "Track 2 — MA registration (NEST direct on muni)",
        "format": "100 scored multiple-choice items (75 scored + 10 pretest in current MSRB practice — verify)",
        "question_count": 60,
        "duration_minutes": 150,
        "passing_score_pct": 70,
        "content_source": MSRB_SERIES_50_SOURCE,
        "sections": [
            {
                "id": "s50_municipal_fund_securities",
                "title": "Municipal Fund Securities & Municipal Securities Overview",
                "description": (
                    "Categories of municipal securities (GO, revenue, conduit 501(c)(3), "
                    "PAB §142, governmental purpose), municipal fund securities (529 plans, "
                    "LGIPs), tax status, basic market structure."
                ),
                "estimated_minutes": 240,
                "weight_pct": 11,
                "content_source": MSRB_SERIES_50_SOURCE,
            },
            {
                "id": "s50_issuers_and_obligated_persons",
                "title": "Issuers, Obligated Persons & State / Local Government Structure",
                "description": (
                    "Issuer types, obligated persons under SEC Rule 15c2-12, federal vs "
                    "state vs local authority, conduit issuers, authorities and special "
                    "districts, sovereign immunity considerations."
                ),
                "estimated_minutes": 300,
                "weight_pct": 14,
                "content_source": MSRB_SERIES_50_SOURCE,
                "subsections": [
                    {
                        "id": "s50_issuers_state_local",
                        "title": "State & local government issuers",
                        "estimated_minutes": 120,
                    },
                    {
                        "id": "s50_issuers_conduit",
                        "title": "Conduit issuers & obligated persons",
                        "estimated_minutes": 120,
                    },
                    {
                        "id": "s50_issuers_federal_overlay",
                        "title": "Federal tax overlay (501(c)(3), PAB, governmental purpose)",
                        "estimated_minutes": 60,
                    },
                ],
            },
            {
                "id": "s50_ma_activities_and_scope",
                "title": "Municipal Advisor Activities & Scope of Engagement",
                "description": (
                    "What constitutes municipal advisory activity, IRMA exclusion, "
                    "advice vs solicitation, statutory exclusions (registered investment "
                    "advisers, attorneys, engineers acting in their professional capacity)."
                ),
                "estimated_minutes": 360,
                "weight_pct": 18,
                "content_source": MSRB_SERIES_50_SOURCE,
            },
            {
                "id": "s50_fiduciary_and_standards_of_conduct",
                "title": "Fiduciary Duty & Standards of Conduct",
                "description": (
                    "MSRB Rule G-42 — duty of loyalty and duty of care to municipal "
                    "entity clients, suitability obligations to obligated person clients, "
                    "conflicts of interest, documentation requirements."
                ),
                "estimated_minutes": 420,
                "weight_pct": 22,
                "content_source": MSRB_SERIES_50_SOURCE,
                "subsections": [
                    {
                        "id": "s50_g42_duty_of_loyalty",
                        "title": "G-42 duty of loyalty",
                        "estimated_minutes": 150,
                    },
                    {
                        "id": "s50_g42_duty_of_care",
                        "title": "G-42 duty of care",
                        "estimated_minutes": 150,
                    },
                    {
                        "id": "s50_g42_conflicts_disclosure",
                        "title": "Conflicts of interest disclosure & mitigation",
                        "estimated_minutes": 120,
                    },
                ],
            },
            {
                "id": "s50_regulatory_framework",
                "title": "Regulatory Framework — Dodd-Frank, SEC, MSRB",
                "description": (
                    "Section 975 of Dodd-Frank, SEC Rule 15Ba1, MA registration on "
                    "Forms MA / MA-I, MSRB membership and registration, qualification "
                    "and continuing education."
                ),
                "estimated_minutes": 300,
                "weight_pct": 14,
                "content_source": MSRB_SERIES_50_SOURCE,
            },
            {
                "id": "s50_record_keeping_and_supervision",
                "title": "Books, Records, Supervision & Reporting",
                "description": (
                    "MSRB Rules G-8, G-9 (records), G-44 (supervision), Form G-37 "
                    "political contribution reporting, gifts and gratuities (G-20), "
                    "fair dealing (G-17)."
                ),
                "estimated_minutes": 300,
                "weight_pct": 14,
                "content_source": MSRB_SERIES_50_SOURCE,
            },
            {
                "id": "s50_transaction_lifecycle_basics",
                "title": "Municipal Transaction Lifecycle — Representative Topics",
                "description": (
                    "POS / OS, EMMA continuing disclosure (Rule 15c2-12), bond counsel "
                    "and disclosure counsel roles, rating process, credit enhancement, "
                    "underwriter selection and method of sale."
                ),
                "estimated_minutes": 240,
                "weight_pct": 7,
                "content_source": MSRB_SERIES_50_SOURCE,
            },
        ],
    },

    "series_54": {
        "code": "series_54",
        "name": "Series 54",
        "long_name": "MSRB Municipal Advisor Principal Qualification Examination",
        "regulator": "MSRB",
        "track": "Track 2 — MA registration (NEST direct on muni)",
        "format": "100 scored multiple-choice items, principal-level practical scenarios",
        "question_count": 100,
        "duration_minutes": 210,
        "passing_score_pct": 70,
        "content_source": MSRB_SERIES_54_SOURCE,
        "sections": [
            {
                "id": "s54_supervision_compliance_program",
                "title": "Supervision & Compliance Program Design",
                "description": (
                    "MSRB Rule G-44 supervisory structure for MA firms — written "
                    "supervisory procedures, designated principal, annual compliance "
                    "review, escalation paths, conflicts review process."
                ),
                "estimated_minutes": 480,
                "weight_pct": 26,
                "content_source": MSRB_SERIES_54_SOURCE,
                "subsections": [
                    {
                        "id": "s54_g44_wsp",
                        "title": "Written Supervisory Procedures (G-44)",
                        "estimated_minutes": 180,
                    },
                    {
                        "id": "s54_g44_designated_principal",
                        "title": "Designated principal responsibilities",
                        "estimated_minutes": 150,
                    },
                    {
                        "id": "s54_g44_annual_review",
                        "title": "Annual compliance review & testing",
                        "estimated_minutes": 150,
                    },
                ],
            },
            {
                "id": "s54_fiduciary_principal_oversight",
                "title": "Fiduciary Duty — Principal-Level Oversight (G-42)",
                "description": (
                    "Reviewing and approving advice to municipal entity clients, "
                    "evaluating reasonable basis for recommendations, supervising "
                    "conflicts disclosures, documenting client-specific suitability."
                ),
                "estimated_minutes": 420,
                "weight_pct": 22,
                "content_source": MSRB_SERIES_54_SOURCE,
            },
            {
                "id": "s54_regulatory_reporting_and_records",
                "title": "Regulatory Reporting, Books & Records",
                "description": (
                    "G-8 / G-9 firm-level books and records, Form MA / MA-I amendments, "
                    "Form G-37 political contribution review and filing, supervision of "
                    "associated person disclosures."
                ),
                "estimated_minutes": 300,
                "weight_pct": 16,
                "content_source": MSRB_SERIES_54_SOURCE,
            },
            {
                "id": "s54_gifts_political_outside_activities",
                "title": "Gifts, Political Contributions & Outside Business Activities",
                "description": (
                    "G-20 gifts and gratuities limits, G-37 pay-to-play, supervising "
                    "outside business activities of associated persons, personal "
                    "securities transaction reporting."
                ),
                "estimated_minutes": 240,
                "weight_pct": 12,
                "content_source": MSRB_SERIES_54_SOURCE,
            },
            {
                "id": "s54_engagement_process_and_documentation",
                "title": "Client Engagement Process & Documentation",
                "description": (
                    "G-42 engagement letter requirements, scope of services, conflict "
                    "disclosures at engagement, mid-engagement scope changes, "
                    "termination and wind-down records."
                ),
                "estimated_minutes": 300,
                "weight_pct": 14,
                "content_source": MSRB_SERIES_54_SOURCE,
            },
            {
                "id": "s54_enforcement_and_examinations",
                "title": "MSRB / SEC Examinations & Enforcement",
                "description": (
                    "Exam preparation, response to deficiency letters, common findings "
                    "in MA exams, disciplinary process, statutory disqualification "
                    "events for associated persons."
                ),
                "estimated_minutes": 240,
                "weight_pct": 10,
                "content_source": MSRB_SERIES_54_SOURCE,
            },
        ],
    },

    "series_7": {
        "code": "series_7",
        "name": "Series 7",
        "long_name": "FINRA General Securities Representative (Top-Off)",
        "regulator": "FINRA",
        "track": "Track 1 — Britehorn-sponsored registered rep",
        "format": "125 scored multiple-choice items (current FINRA format)",
        "question_count": 125,
        "duration_minutes": 225,
        "passing_score_pct": 72,
        "content_source": FINRA_PLACEHOLDER_SOURCE,
        "sections": [
            {
                "id": "s7_placeholder",
                "title": "Curriculum loading…",
                "description": (
                    "FINRA Series 7 content outline to be loaded. Four functional "
                    "areas per FINRA: seeks business, opens accounts, provides "
                    "information / recommendations, processes transactions."
                ),
                "estimated_minutes": 0,
                "weight_pct": 100,
                "content_source": FINRA_PLACEHOLDER_SOURCE,
            },
        ],
    },

    "series_24_63": {
        "code": "series_24_63",
        "name": "Series 24 / 63",
        "long_name": "FINRA General Securities Principal (Series 24) + NASAA Uniform Securities Agent (Series 63)",
        "regulator": "FINRA + NASAA",
        "track": "Track 1 — Britehorn-sponsored registered rep / principal",
        "format": "Series 24: 150 items · Series 63: 65 items",
        "question_count": 215,
        "duration_minutes": 360,
        "passing_score_pct": 70,
        "content_source": FINRA_PLACEHOLDER_SOURCE,
        "sections": [
            {
                "id": "s24_63_placeholder",
                "title": "Curriculum loading…",
                "description": (
                    "FINRA Series 24 (supervision of registered reps, trading, "
                    "underwriting, sales practice) and NASAA Series 63 (Uniform "
                    "Securities Act, state-level registration and ethics) outlines "
                    "to be loaded."
                ),
                "estimated_minutes": 0,
                "weight_pct": 100,
                "content_source": FINRA_PLACEHOLDER_SOURCE,
            },
        ],
    },
}


VALID_EXAMS = tuple(CURRICULUM.keys())
VALID_STATUSES = ("not_started", "in_progress", "completed")


# ── Service ───────────────────────────────────────────────────────────


class StudyService:
    """Curriculum + progress tracking for the licensing study modules."""

    # ─── Curriculum (static) ────────────────────────────────────

    def list_curriculum(self, exam: str) -> dict[str, Any]:
        """Return the full curriculum for an exam (header + sections).

        Shape:
            {
              "exam": "series_50",
              "name": "Series 50",
              "long_name": "...",
              "regulator": "MSRB",
              "track": "...",
              "format": "...",
              "question_count": 60,
              "duration_minutes": 150,
              "passing_score_pct": 70,
              "content_source": "...",
              "sections": [
                {
                  "id": "s50_xxx",
                  "title": "...",
                  "description": "...",
                  "estimated_minutes": 240,
                  "weight_pct": 11,
                  "content_source": "...",
                  "subsections": [ ... ]  # optional
                },
                ...
              ]
            }
        """
        if exam not in CURRICULUM:
            raise ValueError(f"Unknown exam '{exam}'. Valid: {VALID_EXAMS}")
        return CURRICULUM[exam]

    def list_all_curricula(self) -> dict[str, dict[str, Any]]:
        """Return curricula for all four exams keyed by exam code."""
        return CURRICULUM

    # ─── Progress (persisted) ────────────────────────────────────

    def get_progress(self, user_id: str, exam: str) -> dict[str, Any]:
        """Return current user's progress for one exam, keyed by section_id.

        Shape:
            {
              "exam": "series_50",
              "sections": {
                "s50_municipal_fund_securities": {
                  "status": "in_progress",
                  "score": 78,
                  "time_spent_minutes": 95,
                  "completed_at": null,
                  "notes": "..."
                },
                ...
              }
            }
        """
        self._require_exam(exam)
        rows = self._select_rows(user_id, exam)
        sections: dict[str, dict[str, Any]] = {}
        for row in rows:
            sections[row.get("section_id")] = {
                "status": row.get("status", "not_started"),
                "score": row.get("score"),
                "time_spent_minutes": row.get("time_spent_minutes", 0),
                "completed_at": row.get("completed_at"),
                "notes": row.get("notes"),
                "updated_at": row.get("updated_at"),
            }
        return {"exam": exam, "sections": sections}

    def mark_section(
        self,
        user_id: str,
        exam: str,
        section_id: str,
        status: str,
        score: Optional[float] = None,
        time_spent_minutes: Optional[int] = None,
        notes: Optional[str] = None,
    ) -> dict[str, Any]:
        """Upsert a study_progress row for (user_id, exam, section_id)."""
        self._require_exam(exam)
        if status not in VALID_STATUSES:
            raise ValueError(
                f"Invalid status '{status}'. Valid: {VALID_STATUSES}"
            )
        if not section_id:
            raise ValueError("section_id is required")
        # Light validation that section_id belongs to the exam curriculum.
        if not self._section_exists(exam, section_id):
            raise ValueError(
                f"section_id '{section_id}' is not part of curriculum for {exam}"
            )

        payload: dict[str, Any] = {
            "user_id": user_id,
            "exam": exam,
            "section_id": section_id,
            "status": status,
        }
        if score is not None:
            payload["score"] = float(score)
        if time_spent_minutes is not None:
            payload["time_spent_minutes"] = int(time_spent_minutes)
        if notes is not None:
            payload["notes"] = notes
        if status == "completed":
            payload["completed_at"] = datetime.now(timezone.utc).isoformat()

        existing = self._find_row(user_id, exam, section_id)
        if existing:
            updated = db.update(
                "study_progress",
                {"id": f"eq.{existing['id']}"},
                payload,
            )
            if updated and isinstance(updated, list):
                return updated[0]
            return existing | payload

        created = db.insert("study_progress", payload)
        if created and isinstance(created, list):
            return created[0]
        # In-memory fallback so the frontend gets something coherent
        # even when Supabase is unconfigured (dev mode).
        return payload | {
            "id": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    def summary(self, user_id: str) -> dict[str, Any]:
        """Aggregate progress across all four exams.

        Returns:
            {
              "series_50": {
                "sections_total": 7,
                "sections_completed": 2,
                "sections_in_progress": 1,
                "completion_pct": 28.6,
                "estimated_minutes_total": 1980,
                "time_spent_minutes_total": 240,
                "last_studied_at": "2026-05-29T..."
              },
              ...
            }
        """
        out: dict[str, Any] = {}
        for exam, curriculum in CURRICULUM.items():
            sections = curriculum["sections"]
            sections_total = len(sections)
            estimated_total = sum(
                int(s.get("estimated_minutes") or 0) for s in sections
            )
            rows = self._select_rows(user_id, exam)
            completed = sum(1 for r in rows if r.get("status") == "completed")
            in_progress = sum(1 for r in rows if r.get("status") == "in_progress")
            time_spent = sum(
                int(r.get("time_spent_minutes") or 0) for r in rows
            )
            last_studied_at: Optional[str] = None
            for r in rows:
                ts = r.get("updated_at") or r.get("created_at")
                if ts and (last_studied_at is None or ts > last_studied_at):
                    last_studied_at = ts
            completion_pct = round(
                (completed / sections_total) * 100, 1
            ) if sections_total else 0.0
            out[exam] = {
                "sections_total": sections_total,
                "sections_completed": completed,
                "sections_in_progress": in_progress,
                "completion_pct": completion_pct,
                "estimated_minutes_total": estimated_total,
                "time_spent_minutes_total": time_spent,
                "last_studied_at": last_studied_at,
            }
        return out

    # ─── internals ───────────────────────────────────────────────

    @staticmethod
    def _require_exam(exam: str) -> None:
        if exam not in CURRICULUM:
            raise ValueError(f"Unknown exam '{exam}'. Valid: {VALID_EXAMS}")

    @staticmethod
    def _section_exists(exam: str, section_id: str) -> bool:
        sections = CURRICULUM[exam]["sections"]
        for s in sections:
            if s["id"] == section_id:
                return True
            for sub in s.get("subsections", []) or []:
                if sub.get("id") == section_id:
                    return True
        return False

    @staticmethod
    def _select_rows(user_id: str, exam: str) -> list[dict[str, Any]]:
        rows = db.select(
            "study_progress",
            params={
                "user_id": f"eq.{user_id}",
                "exam": f"eq.{exam}",
                "select": "*",
            },
        )
        return rows or []

    @staticmethod
    def _find_row(
        user_id: str, exam: str, section_id: str
    ) -> Optional[dict[str, Any]]:
        rows = db.select(
            "study_progress",
            params={
                "user_id": f"eq.{user_id}",
                "exam": f"eq.{exam}",
                "section_id": f"eq.{section_id}",
                "select": "*",
                "limit": "1",
            },
        )
        if rows and isinstance(rows, list):
            return rows[0]
        return None
