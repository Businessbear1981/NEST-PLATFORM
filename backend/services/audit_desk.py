"""
Audit Desk — assembles everything needed for a financial audit by a qualified
CPA firm (Baker Tilly, CLA, etc).

Same concept as FeasibilityAssembly: NEST organizes the complete audit binder,
the CPA validates. A typical senior living / bond issuer audit runs $50K-120K
and takes 6-10 weeks. With NEST pre-organizing the PBC list and populating
document binders, the engagement drops to $25K-70K and 3-6 weeks.

Revenue model: NEST structures the audit engagement so the CPA validates
rather than builds from scratch.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any


# ── Audit Requirements by Audit Area ─────────────────────────────

AUDIT_REQUIREMENTS: dict[str, dict[str, Any]] = {
    "general_information": {
        "title": "General Entity Information",
        "documents": [
            {"doc": "organizational_chart", "description": "Legal entity structure, ownership, related parties"},
            {"doc": "articles_of_incorporation", "description": "Formation documents, bylaws, operating agreement"},
            {"doc": "board_minutes", "description": "Board meeting minutes for fiscal year"},
            {"doc": "tax_returns", "description": "Federal and state tax returns (3 years)", "years": 3},
            {"doc": "irs_determination_letter", "description": "501(c)(3) determination letter if tax-exempt"},
            {"doc": "management_agreement", "description": "Property management agreement with fee schedule"},
            {"doc": "insurance_policies", "description": "All insurance policies in force"},
        ],
    },
    "cash_and_investments": {
        "title": "Cash, Investments, and Assets Limited as to Use",
        "documents": [
            {"doc": "bank_statements", "description": "All bank account statements for fiscal year (12 months)"},
            {"doc": "bank_reconciliations", "description": "Monthly bank reconciliations"},
            {"doc": "investment_statements", "description": "Investment account statements (monthly or quarterly)"},
            {"doc": "trustee_statements", "description": "Bond trustee statements showing reserve fund balances"},
            {"doc": "dsrf_balance", "description": "Debt service reserve fund balance confirmation"},
        ],
    },
    "receivables_and_revenue": {
        "title": "Accounts Receivable and Revenue",
        "documents": [
            {"doc": "ar_aging", "description": "Accounts receivable aging schedule as of year-end"},
            {"doc": "rent_roll", "description": "Rent roll / occupancy report as of year-end"},
            {"doc": "entrance_fee_ledger", "description": "Entrance fee receipts, refunds, and amortization schedule"},
            {"doc": "revenue_detail", "description": "Revenue by category (monthly fees, entrance fees, care fees, other)"},
            {"doc": "bad_debt_analysis", "description": "Allowance for doubtful accounts analysis"},
        ],
    },
    "property_and_equipment": {
        "title": "Property, Equipment, and Capital",
        "documents": [
            {"doc": "fixed_asset_schedule", "description": "Fixed asset register with additions, disposals, depreciation"},
            {"doc": "capital_expenditure_detail", "description": "Capital expenditures for the year with invoices"},
            {"doc": "construction_draws", "description": "Construction draw requests and approvals (if applicable)"},
            {"doc": "appraisal", "description": "Most recent property appraisal"},
        ],
    },
    "debt_and_bonds": {
        "title": "Debt, Bonds, and Financing",
        "documents": [
            {"doc": "debt_schedule", "description": "Schedule of all outstanding debt with terms"},
            {"doc": "bond_indenture", "description": "Trust indenture / bond resolution"},
            {"doc": "continuing_disclosure", "description": "Annual continuing disclosure filing (EMMA)"},
            {"doc": "covenant_compliance", "description": "Covenant compliance calculations (DSCR, days cash, occupancy)"},
            {"doc": "interest_payment_schedule", "description": "Debt service payment schedule"},
            {"doc": "trustee_annual_report", "description": "Bond trustee annual report"},
        ],
    },
    "liabilities_and_entrance_fees": {
        "title": "Liabilities, Entrance Fees, and Deferred Revenue",
        "documents": [
            {"doc": "entrance_fee_liability", "description": "Refundable entrance fee obligation schedule"},
            {"doc": "deferred_revenue_schedule", "description": "Deferred entrance fee revenue amortization"},
            {"doc": "accounts_payable_aging", "description": "AP aging as of year-end"},
            {"doc": "accrued_expenses", "description": "Accrued expense detail as of year-end"},
            {"doc": "actuarial_study", "description": "Actuarial study for future service obligation (if CCRC)"},
        ],
    },
    "payroll_and_staffing": {
        "title": "Payroll, Benefits, and Staffing",
        "documents": [
            {"doc": "payroll_register", "description": "Annual payroll register by department"},
            {"doc": "benefit_plan_docs", "description": "Employee benefit plan documents (health, 401k, etc)"},
            {"doc": "workers_comp", "description": "Workers compensation policy and claims history"},
            {"doc": "staffing_schedule", "description": "Staffing matrix by department and shift"},
        ],
    },
    "regulatory_compliance": {
        "title": "Regulatory and Compliance",
        "documents": [
            {"doc": "state_license", "description": "State operating license / certificate of authority"},
            {"doc": "regulatory_reports", "description": "State regulatory filings and exam results"},
            {"doc": "medicare_medicaid_certs", "description": "Medicare/Medicaid certifications (if applicable)"},
            {"doc": "lura_compliance", "description": "LURA compliance report (if tax-exempt bonds)"},
            {"doc": "fire_safety_inspection", "description": "Most recent fire safety and health inspection reports"},
        ],
    },
}

# All known audit doc types
_ALL_AUDIT_DOCS: set[str] = set()
_TOTAL_DOC_COUNT = 0
for _area_data in AUDIT_REQUIREMENTS.values():
    for _d in _area_data["documents"]:
        _ALL_AUDIT_DOCS.add(_d["doc"])
        _TOTAL_DOC_COUNT += 1

# Audit area ordering
AUDIT_AREA_ORDER = [
    "general_information",
    "cash_and_investments",
    "receivables_and_revenue",
    "property_and_equipment",
    "debt_and_bonds",
    "liabilities_and_entrance_fees",
    "payroll_and_staffing",
    "regulatory_compliance",
]

# ── Qualified CPA Firms ──────────────────────────────────────────

QUALIFIED_AUDITORS: list[dict[str, Any]] = [
    {
        "name": "Baker Tilly",
        "specialty": "Healthcare, senior living, government, nonprofits",
        "typical_fee_range": (50_000, 100_000),
        "timeline_weeks": 8,
        "locations": ["Chicago", "New York", "Madison"],
        "sectors": ["senior_living", "healthcare", "government", "nonprofit"],
    },
    {
        "name": "CliftonLarsonAllen (CLA)",
        "specialty": "Senior living, affordable housing, nonprofits, government",
        "typical_fee_range": (45_000, 95_000),
        "timeline_weeks": 8,
        "locations": ["Minneapolis", "Milwaukee", "Charlotte"],
        "sectors": ["senior_living", "affordable_housing", "nonprofit", "government"],
    },
    {
        "name": "Forvis Mazars, LLP",
        "specialty": "Senior living, healthcare, education, real estate",
        "typical_fee_range": (55_000, 120_000),
        "timeline_weeks": 8,
        "locations": ["Atlanta", "Nashville", "St. Louis"],
        "sectors": ["senior_living", "healthcare", "education", "real_estate"],
    },
    {
        "name": "Plante Moran",
        "specialty": "Senior living, healthcare, real estate",
        "typical_fee_range": (45_000, 90_000),
        "timeline_weeks": 6,
        "locations": ["Detroit", "Chicago", "Denver"],
        "sectors": ["senior_living", "healthcare", "real_estate"],
    },
    {
        "name": "RSM US LLP",
        "specialty": "Healthcare, real estate, nonprofits",
        "typical_fee_range": (55_000, 110_000),
        "timeline_weeks": 8,
        "locations": ["Chicago", "New York", "Minneapolis"],
        "sectors": ["healthcare", "real_estate", "nonprofit"],
    },
    {
        "name": "BDO USA",
        "specialty": "Real estate, healthcare, financial services",
        "typical_fee_range": (60_000, 120_000),
        "timeline_weeks": 8,
        "locations": ["New York", "Chicago", "Los Angeles"],
        "sectors": ["real_estate", "healthcare", "financial_services"],
    },
    {
        "name": "Wipfli LLP",
        "specialty": "Senior living, healthcare, nonprofits",
        "typical_fee_range": (35_000, 75_000),
        "timeline_weeks": 6,
        "locations": ["Milwaukee", "Minneapolis", "Denver"],
        "sectors": ["senior_living", "healthcare", "nonprofit"],
    },
    {
        "name": "Moss Adams LLP",
        "specialty": "Real estate, healthcare, government",
        "typical_fee_range": (50_000, 100_000),
        "timeline_weeks": 8,
        "locations": ["Seattle", "Portland", "San Francisco"],
        "sectors": ["real_estate", "healthcare", "government"],
    },
    {
        "name": "Eide Bailly LLP",
        "specialty": "Healthcare, senior living, government",
        "typical_fee_range": (35_000, 70_000),
        "timeline_weeks": 6,
        "locations": ["Minneapolis", "Fargo", "Denver"],
        "sectors": ["healthcare", "senior_living", "government"],
    },
    {
        "name": "KPMG LLP",
        "specialty": "Large healthcare systems, REITs, public issuers",
        "typical_fee_range": (100_000, 250_000),
        "timeline_weeks": 10,
        "locations": ["New York", "Chicago", "Los Angeles", "Dallas"],
        "sectors": ["healthcare", "real_estate", "financial_services", "reit"],
    },
]

# ── Audit Area Weights for Scoring ───────────────────────────────

_AREA_WEIGHTS: dict[str, float] = {
    "general_information": 0.10,
    "cash_and_investments": 0.15,
    "receivables_and_revenue": 0.15,
    "property_and_equipment": 0.10,
    "debt_and_bonds": 0.20,
    "liabilities_and_entrance_fees": 0.10,
    "payroll_and_staffing": 0.10,
    "regulatory_compliance": 0.10,
}


class AuditDesk:
    """Assembles everything needed for a financial audit by a qualified CPA firm.

    NEST organizes, CPA validates. The complete PBC (Prepared By Client) list
    is pre-populated with what we already have, so the client provides only
    what is actually missing.
    """

    # ── 1. Generate Audit Checklist ──────────────────────────────

    def generate_audit_checklist(self, deal: dict) -> dict:
        """Complete audit document checklist organized by audit area.

        Args:
            deal: Deal dict with at minimum 'id' and 'deal_name'. May include
                  'received_docs' (list of doc type keys already uploaded),
                  'sector', 'tax_exempt', 'has_construction', 'has_medicare'.

        Returns:
            Checklist with received/pending/not_applicable status per doc,
            completeness % by area and overall.
        """
        received_set = set(deal.get("received_docs", []))
        areas_out: dict[str, dict] = {}
        total_required = 0
        total_received = 0

        for area_key in AUDIT_AREA_ORDER:
            area = AUDIT_REQUIREMENTS[area_key]
            area_docs: list[dict] = []
            area_required = 0
            area_received = 0

            for doc_spec in area["documents"]:
                doc_type = doc_spec["doc"]
                status = self._resolve_doc_status(doc_type, doc_spec, deal, received_set)

                entry = {
                    "doc": doc_type,
                    "description": doc_spec["description"],
                    "status": status,
                }
                if "years" in doc_spec:
                    entry["years_required"] = doc_spec["years"]

                if status != "not_applicable":
                    area_required += 1
                    if status == "received":
                        area_received += 1

                area_docs.append(entry)

            complete_pct = round(area_received / area_required * 100, 1) if area_required else 100.0

            areas_out[area_key] = {
                "title": area["title"],
                "docs": area_docs,
                "complete_pct": complete_pct,
                "received": area_received,
                "required": area_required,
            }
            total_required += area_required
            total_received += area_received

        overall_pct = round(total_received / total_required * 100, 1) if total_required else 0

        return {
            "deal_id": deal.get("id", "unknown"),
            "deal_name": deal.get("deal_name", "Unknown"),
            "audit_areas": areas_out,
            "summary": {
                "total_documents": total_required,
                "documents_received": total_received,
                "documents_pending": total_required - total_received,
                "overall_pct": overall_pct,
            },
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 2. Assess Audit Readiness ────────────────────────────────

    def assess_audit_readiness(self, deal: dict, received_docs: list[str]) -> dict:
        """How ready is this deal for audit?

        Args:
            deal: Deal dict with id, deal_name, sector, bond_amount, etc.
            received_docs: List of document type keys that have been received.

        Returns:
            Score 0-100, blockers, estimated prep time, estimated audit fee.
        """
        deal_with_docs = {**deal, "received_docs": received_docs}
        checklist = self.generate_audit_checklist(deal_with_docs)
        areas = checklist.get("audit_areas", {})

        # Weighted score by audit area importance
        weighted_score = 0.0
        area_scores: dict[str, float] = {}
        blockers: list[str] = []
        critical_missing: list[str] = []

        for area_key in AUDIT_AREA_ORDER:
            area_data = areas.get(area_key, {})
            pct = area_data.get("complete_pct", 0)
            weight = _AREA_WEIGHTS.get(area_key, 0.10)
            weighted_score += pct * weight
            area_scores[area_key] = pct

            # Identify blockers (areas below 50%)
            if pct < 50:
                blockers.append(
                    f"{area_data.get('title', area_key)}: only {area_data.get('received', 0)} of "
                    f"{area_data.get('required', 0)} documents received ({pct}%)"
                )

            # Critical missing docs that block audit start
            for doc_entry in area_data.get("docs", []):
                if doc_entry["status"] == "pending" and doc_entry["doc"] in _CRITICAL_AUDIT_DOCS:
                    critical_missing.append(doc_entry["doc"])

        score = round(weighted_score)

        # Grade
        if score >= 90:
            grade = "Audit-Ready"
            prep_weeks = 1
        elif score >= 70:
            grade = "Near-Ready"
            prep_weeks = 3
        elif score >= 40:
            grade = "In Progress"
            prep_weeks = 6
        else:
            grade = "Early Stage"
            prep_weeks = 10

        # Estimate audit fee based on readiness (more ready = less auditor fieldwork)
        base_fee_low = 50_000
        base_fee_high = 120_000
        readiness_discount = min(0.40, score / 100 * 0.40)  # Up to 40% discount for full readiness
        estimated_fee_low = round(base_fee_low * (1 - readiness_discount), -3)
        estimated_fee_high = round(base_fee_high * (1 - readiness_discount), -3)

        return {
            "deal_id": deal.get("id", "unknown"),
            "deal_name": deal.get("deal_name", "Unknown"),
            "readiness_score": score,
            "grade": grade,
            "area_scores": area_scores,
            "blockers": blockers,
            "critical_missing_documents": critical_missing,
            "estimated_prep_time_weeks": prep_weeks,
            "estimated_audit_fee": {
                "low": estimated_fee_low,
                "high": estimated_fee_high,
                "note": f"Based on {score}% readiness. Full PBC reduces fieldwork hours.",
            },
            "next_steps": self._generate_next_steps(areas),
            "assessed_at": datetime.utcnow().isoformat(),
        }

    # ── 3. Assemble Audit Binder ─────────────────────────────────

    def assemble_audit_binder(self, deal: dict, deal_data: dict) -> dict:
        """Organize all received documents into standard audit binder structure.

        The PBC (Prepared By Client) binder is the deliverable the auditor expects.
        NEST organizes it by audit area with cross-references.

        Args:
            deal: Deal dict.
            deal_data: All available data keyed by document type.

        Returns:
            Binder with each section populated or marked as missing.
        """
        received_docs = list(deal_data.keys())
        received_set = set(received_docs)
        binder_sections: dict[str, dict] = {}
        total_populated = 0
        total_missing = 0

        for area_key in AUDIT_AREA_ORDER:
            area = AUDIT_REQUIREMENTS[area_key]
            section_docs: list[dict] = []

            for doc_spec in area["documents"]:
                doc_type = doc_spec["doc"]

                if doc_type in received_set:
                    doc_data = deal_data[doc_type]
                    section_docs.append({
                        "doc": doc_type,
                        "description": doc_spec["description"],
                        "status": "populated",
                        "data_summary": self._summarize_doc_data(doc_type, doc_data),
                        "cross_references": self._find_cross_references(doc_type),
                        "auditor_notes": self._generate_auditor_notes(doc_type, doc_data),
                    })
                    total_populated += 1
                else:
                    status = self._resolve_doc_status(doc_type, doc_spec, deal, received_set)
                    section_docs.append({
                        "doc": doc_type,
                        "description": doc_spec["description"],
                        "status": "missing" if status == "pending" else status,
                        "auditor_notes": f"Required: {doc_spec['description']}",
                    })
                    if status == "pending":
                        total_missing += 1

            binder_sections[area_key] = {
                "title": area["title"],
                "tab_number": AUDIT_AREA_ORDER.index(area_key) + 1,
                "documents": section_docs,
            }

        total_docs = total_populated + total_missing
        completeness = round(total_populated / total_docs * 100, 1) if total_docs else 0

        return {
            "deal_id": deal.get("id", "unknown"),
            "deal_name": deal.get("deal_name", "Unknown"),
            "audit_period": deal.get("audit_period", f"FY {datetime.utcnow().year - 1}"),
            "binder_sections": binder_sections,
            "binder_summary": {
                "total_tabs": len(AUDIT_AREA_ORDER),
                "documents_populated": total_populated,
                "documents_missing": total_missing,
                "completeness_pct": completeness,
            },
            "assembled_at": datetime.utcnow().isoformat(),
        }

    # ── 4. Generate PBC List ─────────────────────────────────────

    def generate_pbc_list(self, deal: dict) -> dict:
        """Generate the Prepared By Client list that the auditor sends.

        NEST pre-populates it with what we already have, so the client only
        needs to provide what is actually missing.

        Args:
            deal: Deal dict with received_docs list and deal metadata.

        Returns:
            PBC list organized by audit area with status for each item.
        """
        received_set = set(deal.get("received_docs", []))
        pbc_items: list[dict] = []
        items_complete = 0
        items_pending = 0
        item_number = 0

        for area_key in AUDIT_AREA_ORDER:
            area = AUDIT_REQUIREMENTS[area_key]

            for doc_spec in area["documents"]:
                doc_type = doc_spec["doc"]
                item_number += 1
                status = self._resolve_doc_status(doc_type, doc_spec, deal, received_set)

                if status == "not_applicable":
                    continue

                is_received = doc_type in received_set

                pbc_entry = {
                    "item_number": item_number,
                    "audit_area": area["title"],
                    "audit_area_key": area_key,
                    "document": doc_spec["description"],
                    "doc_type": doc_type,
                    "status": "complete" if is_received else "pending",
                    "prepared_by": "NEST" if is_received else "Client",
                    "due_date": deal.get("pbc_due_date", ""),
                    "notes": "Pre-populated by NEST" if is_received else "Client to provide",
                }

                if "years" in doc_spec:
                    pbc_entry["years_required"] = doc_spec["years"]
                    pbc_entry["notes"] = (
                        f"Pre-populated by NEST ({doc_spec['years']} years)" if is_received
                        else f"Client to provide {doc_spec['years']} years of records"
                    )

                pbc_items.append(pbc_entry)
                if is_received:
                    items_complete += 1
                else:
                    items_pending += 1

        total_items = items_complete + items_pending

        return {
            "deal_id": deal.get("id", "unknown"),
            "deal_name": deal.get("deal_name", "Unknown"),
            "audit_period": deal.get("audit_period", f"FY {datetime.utcnow().year - 1}"),
            "auditor": deal.get("auditor", ""),
            "pbc_items": pbc_items,
            "summary": {
                "total_items": total_items,
                "items_complete": items_complete,
                "items_pending": items_pending,
                "pct_complete": round(items_complete / total_items * 100, 1) if total_items else 0,
                "nest_pre_populated": items_complete,
                "client_remaining": items_pending,
            },
            "client_message": (
                f"Of {total_items} PBC items, NEST has pre-populated {items_complete}. "
                f"You need to provide {items_pending} remaining items."
                if items_pending > 0
                else f"All {total_items} PBC items are complete. Audit binder is ready for delivery."
            ),
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 5. Estimate Audit Scope ──────────────────────────────────

    def estimate_audit_scope(self, readiness: dict) -> dict:
        """Based on readiness, estimate audit hours, fee, timeline, best firms.

        Args:
            readiness: Output of assess_audit_readiness.

        Returns:
            Estimated audit hours, fee range, timeline, recommended firms.
        """
        score = readiness.get("readiness_score", 0)
        sector = readiness.get("sector", "senior_living")

        # Base audit parameters (full-scope engagement)
        base_hours_partner = 60
        base_hours_manager = 120
        base_hours_senior = 200
        base_hours_staff = 160
        base_total_hours = base_hours_partner + base_hours_manager + base_hours_senior + base_hours_staff

        # Readiness reduces fieldwork
        # 100% readiness = 50% reduction (auditor still substantively tests everything)
        # 0% readiness = 20% increase (auditor spends time requesting and organizing)
        if score >= 80:
            adjustment = 0.50 + (score - 80) / 100 * 0.10  # 50-52% reduction
        elif score >= 50:
            adjustment = 0.20 + (score - 50) / 30 * 0.30  # 20-50% reduction
        else:
            adjustment = -(0.20 - score / 50 * 0.20)  # 0-20% increase

        adjusted_hours = round(base_total_hours * (1 - adjustment))

        # Hourly rates by level
        rates = {
            "partner": 600,
            "manager": 400,
            "senior": 275,
            "staff": 175,
        }

        # Distribute adjusted hours by level
        hours_breakdown = {
            "partner": round(adjusted_hours * 0.10),
            "manager": round(adjusted_hours * 0.22),
            "senior": round(adjusted_hours * 0.38),
            "staff": round(adjusted_hours * 0.30),
        }

        fee_low = sum(h * rates[level] * 0.85 for level, h in hours_breakdown.items())
        fee_high = sum(h * rates[level] * 1.15 for level, h in hours_breakdown.items())

        # Timeline
        if score >= 80:
            weeks = 4
        elif score >= 50:
            weeks = 6
        else:
            weeks = 10

        # Find best-suited firms
        recommended = self.list_qualified_auditors(sector=sector)[:3]

        # Savings vs. unorganized engagement
        unorganized_hours = round(base_total_hours * 1.20)  # 20% overhead without NEST
        unorganized_fee_low = sum(
            round(unorganized_hours * pct * rate * 0.85)
            for (_, pct), (_, rate) in zip(
                [("p", 0.10), ("m", 0.22), ("s", 0.38), ("st", 0.30)],
                rates.items()
            )
        )
        unorganized_fee_high = sum(
            round(unorganized_hours * pct * rate * 1.15)
            for (_, pct), (_, rate) in zip(
                [("p", 0.10), ("m", 0.22), ("s", 0.38), ("st", 0.30)],
                rates.items()
            )
        )

        return {
            "deal_name": readiness.get("deal_name", "Unknown"),
            "readiness_score": score,
            "estimated_scope": {
                "total_hours": adjusted_hours,
                "hours_by_level": hours_breakdown,
                "fee_range": (round(fee_low, -3), round(fee_high, -3)),
                "fee_range_formatted": f"${round(fee_low, -3):,.0f} - ${round(fee_high, -3):,.0f}",
                "timeline_weeks": weeks,
                "engagement_type": "standard_audit" if score < 50 else "streamlined_audit",
            },
            "comparison_without_nest": {
                "total_hours": unorganized_hours,
                "fee_range": (round(unorganized_fee_low, -3), round(unorganized_fee_high, -3)),
                "timeline_weeks": 10,
            },
            "estimated_savings": {
                "hours_saved": unorganized_hours - adjusted_hours,
                "fee_savings_low": round(unorganized_fee_low - fee_low, -3),
                "fee_savings_high": round(unorganized_fee_high - fee_high, -3),
                "weeks_saved": 10 - weeks,
            },
            "recommended_firms": [
                {
                    "name": f["name"],
                    "specialty": f["specialty"],
                    "fee_range": f"${f['typical_fee_range'][0]:,} - ${f['typical_fee_range'][1]:,}",
                    "timeline": f"{f['timeline_weeks']} weeks",
                }
                for f in recommended
            ],
            "estimated_at": datetime.utcnow().isoformat(),
        }

    # ── 6. List Qualified Auditors ───────────────────────────────

    def list_qualified_auditors(self, sector: str = None) -> list[dict]:
        """CPA firms qualified for this type of audit.

        Args:
            sector: Optional sector filter (e.g., 'senior_living', 'healthcare',
                    'real_estate', 'nonprofit', 'government').

        Returns:
            List of qualified auditor firm dicts, filtered by sector if provided.
        """
        firms = QUALIFIED_AUDITORS

        if sector:
            sector_lower = sector.lower().replace(" ", "_")
            firms = [f for f in firms if sector_lower in f.get("sectors", [])]

        return [
            {
                **firm,
                "fee_range_formatted": f"${firm['typical_fee_range'][0]:,} - ${firm['typical_fee_range'][1]:,}",
                "timeline_formatted": f"{firm['timeline_weeks']} weeks",
            }
            for firm in firms
        ]

    # ── Private Helpers ──────────────────────────────────────────

    @staticmethod
    def _resolve_doc_status(
        doc_type: str, doc_spec: dict, deal: dict, received_set: set[str]
    ) -> str:
        """Determine document status: received / pending / not_applicable."""
        if doc_type in received_set:
            return "received"

        # Conditional documents
        if doc_type == "construction_draws" and not deal.get("has_construction", False):
            return "not_applicable"
        if doc_type == "irs_determination_letter" and not deal.get("tax_exempt", True):
            return "not_applicable"
        if doc_type == "medicare_medicaid_certs" and not deal.get("has_medicare", False):
            return "not_applicable"
        if doc_type == "lura_compliance" and not deal.get("tax_exempt_bonds", True):
            return "not_applicable"
        if doc_type == "actuarial_study" and deal.get("sector", "senior_living") not in ("senior_living", "ccrc"):
            return "not_applicable"

        return "pending"

    @staticmethod
    def _summarize_doc_data(doc_type: str, doc_data: Any) -> str:
        """Generate a brief summary of document data for binder organization."""
        if isinstance(doc_data, dict):
            keys = list(doc_data.keys())[:5]
            return f"Structured data with {len(doc_data)} fields: {', '.join(keys)}"
        if isinstance(doc_data, list):
            return f"List with {len(doc_data)} entries"
        if isinstance(doc_data, str):
            return f"Document text ({len(doc_data)} chars)"
        return "Data available"

    @staticmethod
    def _find_cross_references(doc_type: str) -> list[str]:
        """Find which audit areas reference this document."""
        refs: list[str] = []
        for area_key, area_data in AUDIT_REQUIREMENTS.items():
            for doc_spec in area_data["documents"]:
                if doc_spec["doc"] == doc_type:
                    refs.append(area_key)
        return refs

    @staticmethod
    def _generate_auditor_notes(doc_type: str, doc_data: Any) -> str:
        """Generate notes for the auditor about this document."""
        notes_map = {
            "bank_statements": "Verify 12 months of statements are present. Reconcile to GL.",
            "bank_reconciliations": "Test outstanding items. Verify subsequent clearance.",
            "ar_aging": "Confirm aging buckets. Test collectibility of 90+ day balances.",
            "rent_roll": "Trace to monthly fee revenue. Verify occupancy count.",
            "entrance_fee_ledger": "Recalculate amortization. Verify refund obligations.",
            "fixed_asset_schedule": "Test additions >$5K. Verify depreciation calculations.",
            "debt_schedule": "Confirm balances to trustee statements. Test interest accruals.",
            "covenant_compliance": "Independently recalculate DSCR, days cash, occupancy.",
            "payroll_register": "Test to W-2s and 941s. Verify departmental allocations.",
            "bond_indenture": "Extract all financial covenants. Confirm compliance.",
            "actuarial_study": "Review assumptions. Compare to prior year.",
            "tax_returns": "Reconcile to audited financial statements.",
        }
        return notes_map.get(doc_type, "Review for completeness and accuracy.")

    @staticmethod
    def _generate_next_steps(areas: dict) -> list[dict]:
        """Generate prioritized next steps from checklist gaps."""
        steps: list[dict] = []
        priority = 0

        # Critical areas first (debt, revenue, cash)
        priority_order = [
            "debt_and_bonds",
            "cash_and_investments",
            "receivables_and_revenue",
            "general_information",
            "property_and_equipment",
            "liabilities_and_entrance_fees",
            "payroll_and_staffing",
            "regulatory_compliance",
        ]

        for area_key in priority_order:
            area_data = areas.get(area_key, {})
            for doc_entry in area_data.get("docs", []):
                if doc_entry["status"] == "pending":
                    priority += 1
                    steps.append({
                        "priority": priority,
                        "action": f"Obtain: {doc_entry['description']}",
                        "audit_area": area_data.get("title", area_key),
                        "doc": doc_entry["doc"],
                    })

        return steps[:10]


# Critical docs that must be present before audit fieldwork can begin
_CRITICAL_AUDIT_DOCS: set[str] = {
    "bank_statements",
    "bank_reconciliations",
    "ar_aging",
    "fixed_asset_schedule",
    "debt_schedule",
    "bond_indenture",
    "payroll_register",
    "tax_returns",
    "financial_statements_prior",  # Not in checklist but conceptually required
}
