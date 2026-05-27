"""
Preflight Engine — Intelligent Q&A for deal intake and gap analysis.

Generates personalized question lists based on what's known and what's missing.
Processes answers, auto-populates deal fields, and identifies gaps before
advancing to the next pipeline stage.

Feeds: doc_readiness.py, credit_memo, Bernard orchestrator, bond_desk.
Distinct from preflight_interview.py — that file drives Bernard's credit-memo
interview. This engine handles the structured intake questionnaire and
readiness gap analysis upstream of memo writing.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


# ── Preflight Question Bank ─────────────────────────────────────

PREFLIGHT_QUESTIONS: dict[str, list[dict]] = {
    "borrower_profile": [
        {
            "id": "bp_1",
            "question": "What is the legal entity name and structure (LLC, LP, Inc, 501(c)(3))?",
            "why": "Determines tax-exempt eligibility and issuer structure",
            "triggers": ["entity_type"],
        },
        {
            "id": "bp_2",
            "question": "Who are the key principals and what is their experience in this asset class?",
            "why": "Sponsor Standards require 3-7 years experience",
            "triggers": ["sponsor_experience"],
        },
        {
            "id": "bp_3",
            "question": "Has the borrower or any principal had a default, bankruptcy, or foreclosure in the last 5 years?",
            "why": "Universal Credit Policy max lookback",
            "triggers": ["default_history"],
        },
        {
            "id": "bp_4",
            "question": "Are all federal and state tax filings current?",
            "why": "KYC/AML requirement",
            "triggers": ["tax_current"],
        },
        {
            "id": "bp_5",
            "question": "What is the borrower's current net worth and liquidity position?",
            "why": "Equity contribution and guaranty capacity",
            "triggers": ["net_worth"],
        },
    ],
    "property_description": [
        {
            "id": "pd_1",
            "question": "What is the property type, location, and total square footage?",
            "why": "Determines sector benchmarks and market analysis scope",
            "triggers": ["property_type", "location", "sqft"],
        },
        {
            "id": "pd_2",
            "question": "What is the current unit mix (number and type of units by floor plan)?",
            "why": "Revenue modeling and comp analysis",
            "triggers": ["unit_mix"],
        },
        {
            "id": "pd_3",
            "question": "What is current occupancy and 12-month occupancy trend?",
            "why": "Stabilization assessment and DSCR projection",
            "triggers": ["occupancy"],
        },
        {
            "id": "pd_4",
            "question": "What are current monthly fees/rents by unit type?",
            "why": "Revenue benchmarking against market",
            "triggers": ["monthly_fees"],
        },
        {
            "id": "pd_5",
            "question": "Year built, last major renovation, and current condition?",
            "why": "Capital needs assessment and appraisal basis",
            "triggers": ["year_built", "condition"],
        },
        {
            "id": "pd_6",
            "question": "Are there any environmental concerns or deferred maintenance items?",
            "why": "Environmental liability and capital reserve requirements",
            "triggers": ["environmental"],
        },
    ],
    "financial_overview": [
        {
            "id": "fo_1",
            "question": "What is trailing 12-month NOI (or EBITDA for non-real estate)?",
            "why": "Primary sizing metric — drives bond amount",
            "triggers": ["noi", "ebitda"],
        },
        {
            "id": "fo_2",
            "question": "What is the current debt structure (lender, balance, rate, maturity)?",
            "why": "Refinancing analysis and savings calculation",
            "triggers": ["current_debt"],
        },
        {
            "id": "fo_3",
            "question": "What is the most recent appraised value and date?",
            "why": "LTV calculation and MAI requirement",
            "triggers": ["appraisal"],
        },
        {
            "id": "fo_4",
            "question": "What is the total capital request and intended use of proceeds?",
            "why": "Sources & uses and deal type determination",
            "triggers": ["capital_request", "use_of_proceeds"],
        },
        {
            "id": "fo_5",
            "question": "For entrance fee communities: what is the IEF pool balance and refund obligation?",
            "why": "Liquidity covenant and cash flow modeling",
            "triggers": ["ief_pool"],
            "conditional_on": "senior_living",
        },
        {
            "id": "fo_6",
            "question": "For construction: what is total project cost and construction timeline?",
            "why": "LTC ratio and draw schedule",
            "triggers": ["tpc", "construction_timeline"],
            "conditional_on": "construction",
        },
    ],
    "deal_structure": [
        {
            "id": "ds_1",
            "question": "Is the borrower seeking tax-exempt or taxable financing?",
            "why": "Determines issuer, LURA requirements, and pricing",
            "triggers": ["tax_status"],
        },
        {
            "id": "ds_2",
            "question": "What is the desired bond maturity and amortization schedule?",
            "why": "Term structure and call provisions",
            "triggers": ["maturity"],
        },
        {
            "id": "ds_3",
            "question": "Is credit enhancement (surety, LC, bond insurance) desired or required?",
            "why": "Rating uplift and pricing impact",
            "triggers": ["enhancement"],
        },
        {
            "id": "ds_4",
            "question": "Are there any existing covenants or restrictions from current debt?",
            "why": "Defeasance, prepayment penalties, consent requirements",
            "triggers": ["existing_covenants"],
        },
    ],
    "regulatory_compliance": [
        {
            "id": "rc_1",
            "question": "What state regulatory body oversees this facility type?",
            "why": "Certificate of Need, licensing, continuing care registration",
            "triggers": ["regulatory_body"],
        },
        {
            "id": "rc_2",
            "question": "Is the property subject to any affordability restrictions (LURA, LIHTC, Section 8)?",
            "why": "Rent restrictions and compliance monitoring",
            "triggers": ["affordability_restrictions"],
        },
        {
            "id": "rc_3",
            "question": "Does the facility have all required licenses and certifications current?",
            "why": "Operating license validity",
            "triggers": ["licenses_current"],
        },
    ],
}

# Category display order and labels
_CATEGORY_ORDER = [
    ("borrower_profile", "Borrower Profile"),
    ("property_description", "Property Description"),
    ("financial_overview", "Financial Overview"),
    ("deal_structure", "Deal Structure"),
    ("regulatory_compliance", "Regulatory & Compliance"),
]

# Auto-population rules: answer patterns → deal fields
_AUTO_POPULATE_RULES: list[dict] = [
    {
        "question_ids": ["bp_1"],
        "patterns": {
            r"501\s*\(?\s*c\s*\)?\s*\(?\s*3\s*\)?": {"tax_exempt": True, "entity_type": "501c3"},
            r"\bllc\b": {"entity_type": "LLC"},
            r"\blp\b": {"entity_type": "LP"},
            r"\binc\b": {"entity_type": "Inc"},
        },
    },
    {
        "question_ids": ["ds_1"],
        "patterns": {
            r"tax.?exempt": {"tax_status": "tax_exempt"},
            r"taxable": {"tax_status": "taxable"},
        },
    },
    {
        "question_ids": ["ds_3"],
        "patterns": {
            r"surety": {"enhancement_type": "surety"},
            r"letter\s*of\s*credit|l\.?c\.?": {"enhancement_type": "lc"},
            r"bond\s*insurance": {"enhancement_type": "bond_insurance"},
            r"no\s*enhancement|none|unenhanced": {"enhancement_type": "none"},
        },
    },
    {
        "question_ids": ["bp_3"],
        "patterns": {
            r"\bno\b|none|clean|no\s*default|no\s*bankrupt": {"default_history": False},
            r"\byes\b|default|bankrupt|foreclos": {"default_history": True},
        },
    },
    {
        "question_ids": ["bp_4"],
        "patterns": {
            r"\byes\b|current|up\s*to\s*date|filed": {"tax_current": True},
            r"\bno\b|behind|delinquent|not\s*filed": {"tax_current": False},
        },
    },
]

# Conditional question logic: what deal attributes activate conditional questions
_CONDITION_MAP = {
    "senior_living": lambda deal: deal.get("property_type", "").lower() in (
        "senior_living", "ccrc", "assisted_living", "memory_care",
        "independent_living", "skilled_nursing",
    ),
    "construction": lambda deal: deal.get("deal_type", "").lower() in (
        "construction", "new_construction", "substantial_rehab",
    ),
}

# Fields required for each target stage
_STAGE_REQUIRED_FIELDS: dict[str, list[str]] = {
    "intake": ["entity_type", "property_type", "capital_request", "use_of_proceeds"],
    "underwriting": [
        "entity_type", "sponsor_experience", "property_type", "location",
        "sqft", "unit_mix", "occupancy", "monthly_fees", "noi",
        "current_debt", "appraisal", "capital_request", "use_of_proceeds",
        "tax_status", "enhancement",
    ],
    "structuring": [
        "entity_type", "sponsor_experience", "default_history", "tax_current",
        "net_worth", "property_type", "location", "sqft", "unit_mix",
        "occupancy", "monthly_fees", "year_built", "condition", "environmental",
        "noi", "current_debt", "appraisal", "capital_request", "use_of_proceeds",
        "tax_status", "maturity", "enhancement", "existing_covenants",
        "regulatory_body", "licenses_current",
    ],
    "credit_committee": [
        "entity_type", "sponsor_experience", "default_history", "tax_current",
        "net_worth", "property_type", "location", "sqft", "unit_mix",
        "occupancy", "monthly_fees", "year_built", "condition", "environmental",
        "noi", "current_debt", "appraisal", "capital_request", "use_of_proceeds",
        "tax_status", "maturity", "enhancement", "existing_covenants",
        "regulatory_body", "affordability_restrictions", "licenses_current",
    ],
}


# ── Build lookup index: question_id → (category, question_dict) ──

_QUESTION_INDEX: dict[str, tuple[str, dict]] = {}
for _cat, _questions in PREFLIGHT_QUESTIONS.items():
    for _q in _questions:
        _QUESTION_INDEX[_q["id"]] = (_cat, _q)


class PreflightEngine:
    """Generates and manages preflight Q&A for deal intake."""

    def __init__(self):
        # deal_id → {question_id: {"answer": str, "answered_at": str, "auto_fields": dict}}
        self._answers: dict[str, dict[str, dict]] = {}
        # deal_id → {field: value} — auto-populated from answers
        self._deal_fields: dict[str, dict[str, Any]] = {}

    # ── Public API ──────────────────────────────────────────────

    def generate_preflight(self, deal: dict, known_data: dict | None = None) -> dict:
        """Generate personalized question list for a deal.

        Args:
            deal: Deal dict with 'id' and optionally 'property_type', 'deal_type', etc.
            known_data: Dict of already-known field values to skip answered questions.

        Returns:
            {
                "deal_id": str,
                "categories": [
                    {
                        "category": str,
                        "label": str,
                        "questions": [question_dict, ...],
                        "answered": int,
                        "total": int,
                    },
                    ...
                ],
                "total_questions": int,
                "answered_questions": int,
                "completion_pct": float,
                "next_priority": dict | None,
                "generated_at": str,
            }
        """
        deal_id = deal.get("id", "unknown")
        if known_data is None:
            known_data = {}

        # Merge stored fields with provided known_data
        stored = self._deal_fields.get(deal_id, {})
        merged_known = {**stored, **known_data}

        # Merge stored answers
        stored_answers = self._answers.get(deal_id, {})

        categories_out = []
        total_q = 0
        total_answered = 0
        first_unanswered = None

        for cat_key, cat_label in _CATEGORY_ORDER:
            questions = PREFLIGHT_QUESTIONS.get(cat_key, [])
            cat_questions = []
            cat_answered = 0

            for q in questions:
                # Check conditional — skip if condition not met
                condition = q.get("conditional_on")
                if condition:
                    checker = _CONDITION_MAP.get(condition)
                    if checker and not checker(deal):
                        continue

                # Check if already answered
                is_answered = q["id"] in stored_answers
                # Also consider answered if all triggered fields are in known_data
                if not is_answered:
                    triggers = q.get("triggers", [])
                    if triggers and all(t in merged_known for t in triggers):
                        is_answered = True

                q_out = {
                    **q,
                    "answered": is_answered,
                }
                if is_answered and q["id"] in stored_answers:
                    q_out["answer"] = stored_answers[q["id"]].get("answer")

                cat_questions.append(q_out)
                total_q += 1
                if is_answered:
                    cat_answered += 1
                    total_answered += 1
                elif first_unanswered is None:
                    first_unanswered = q_out

            categories_out.append({
                "category": cat_key,
                "label": cat_label,
                "questions": cat_questions,
                "answered": cat_answered,
                "total": len(cat_questions),
            })

        completion_pct = round((total_answered / total_q * 100) if total_q > 0 else 0, 1)

        return {
            "deal_id": deal_id,
            "categories": categories_out,
            "total_questions": total_q,
            "answered_questions": total_answered,
            "completion_pct": completion_pct,
            "next_priority": first_unanswered,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def process_answer(self, deal_id: str, question_id: str, answer: str) -> dict:
        """Record an answer and return updated state.

        Args:
            deal_id: Deal identifier.
            question_id: Question ID from the question bank.
            answer: Free-text answer from the user.

        Returns:
            {
                "deal_id": str,
                "question_id": str,
                "recorded": bool,
                "auto_populated": dict,
                "completion_pct": float,
                "triggered_fields": [str, ...],
                "next_question": dict | None,
            }
        """
        if deal_id not in self._answers:
            self._answers[deal_id] = {}
        if deal_id not in self._deal_fields:
            self._deal_fields[deal_id] = {}

        # Validate question exists
        if question_id not in _QUESTION_INDEX:
            return {
                "deal_id": deal_id,
                "question_id": question_id,
                "recorded": False,
                "error": f"Unknown question_id: {question_id}",
            }

        _cat, q_def = _QUESTION_INDEX[question_id]

        # Record the answer
        now = datetime.now(timezone.utc).isoformat()
        auto_fields = self._extract_auto_fields(question_id, answer)

        self._answers[deal_id][question_id] = {
            "answer": answer,
            "answered_at": now,
            "auto_fields": auto_fields,
        }

        # Store auto-populated fields
        self._deal_fields[deal_id].update(auto_fields)

        # Also store triggered field names with the raw answer as value
        # (auto_fields override these where pattern matching works)
        for field in q_def.get("triggers", []):
            if field not in self._deal_fields[deal_id]:
                self._deal_fields[deal_id][field] = answer

        # Compute updated completion
        deal_stub = {"id": deal_id, **self._deal_fields[deal_id]}
        preflight = self.generate_preflight(deal_stub)

        return {
            "deal_id": deal_id,
            "question_id": question_id,
            "recorded": True,
            "auto_populated": auto_fields,
            "completion_pct": preflight["completion_pct"],
            "triggered_fields": q_def.get("triggers", []),
            "next_question": preflight.get("next_priority"),
        }

    def get_deal_profile(self, deal_id: str) -> dict:
        """Return everything known about the deal from preflight answers.

        Args:
            deal_id: Deal identifier.

        Returns:
            {
                "deal_id": str,
                "fields": dict,
                "answers": {question_id: {"question": str, "answer": str, "answered_at": str}, ...},
                "answer_count": int,
                "generated_at": str,
            }
        """
        fields = self._deal_fields.get(deal_id, {})
        raw_answers = self._answers.get(deal_id, {})

        answers_out = {}
        for qid, data in raw_answers.items():
            if qid in _QUESTION_INDEX:
                _cat, q_def = _QUESTION_INDEX[qid]
                answers_out[qid] = {
                    "question": q_def["question"],
                    "answer": data["answer"],
                    "answered_at": data["answered_at"],
                    "category": _cat,
                }

        return {
            "deal_id": deal_id,
            "fields": dict(fields),
            "answers": answers_out,
            "answer_count": len(answers_out),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def identify_gaps(self, deal: dict, target_stage: str = "underwriting") -> dict:
        """Compare what's known vs what's needed for a target stage.

        Args:
            deal: Deal dict with 'id'.
            target_stage: Pipeline stage to check readiness for.

        Returns:
            {
                "deal_id": str,
                "target_stage": str,
                "known_fields": [str, ...],
                "missing_fields": [str, ...],
                "gap_questions": [question_dict, ...],
                "readiness_pct": float,
                "ready": bool,
            }
        """
        deal_id = deal.get("id", "unknown")
        required_fields = _STAGE_REQUIRED_FIELDS.get(target_stage, [])
        if not required_fields:
            return {
                "deal_id": deal_id,
                "target_stage": target_stage,
                "error": f"Unknown target stage: {target_stage}",
            }

        # Merge all known data
        stored_fields = self._deal_fields.get(deal_id, {})
        deal_fields = {**deal, **stored_fields}

        known = [f for f in required_fields if f in deal_fields]
        missing = [f for f in required_fields if f not in deal_fields]

        # Find questions that would fill the gaps
        gap_questions = []
        for field in missing:
            q = self._find_question_for_field(field, deal)
            if q:
                gap_questions.append(q)

        # Deduplicate (one question may cover multiple fields)
        seen_ids = set()
        deduped = []
        for q in gap_questions:
            if q["id"] not in seen_ids:
                seen_ids.add(q["id"])
                deduped.append(q)

        readiness_pct = round((len(known) / len(required_fields) * 100) if required_fields else 100, 1)

        return {
            "deal_id": deal_id,
            "target_stage": target_stage,
            "known_fields": known,
            "missing_fields": missing,
            "gap_questions": deduped,
            "readiness_pct": readiness_pct,
            "ready": len(missing) == 0,
        }

    # ── Internal Helpers ────────────────────────────────────────

    @staticmethod
    def _extract_auto_fields(question_id: str, answer: str) -> dict:
        """Extract auto-populated fields from an answer using pattern rules."""
        import re

        auto = {}
        answer_lower = answer.lower()

        for rule in _AUTO_POPULATE_RULES:
            if question_id in rule["question_ids"]:
                for pattern, fields in rule["patterns"].items():
                    if re.search(pattern, answer_lower):
                        auto.update(fields)

        return auto

    @staticmethod
    def _find_question_for_field(field: str, deal: dict) -> dict | None:
        """Find the question that triggers a given field."""
        for cat, questions in PREFLIGHT_QUESTIONS.items():
            for q in questions:
                if field in q.get("triggers", []):
                    # Check conditional
                    condition = q.get("conditional_on")
                    if condition:
                        checker = _CONDITION_MAP.get(condition)
                        if checker and not checker(deal):
                            continue
                    return {**q, "category": cat}
        return None
