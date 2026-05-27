"""
Feasibility Assembly — assembles a complete feasibility study package from
ingested documents so an accountant (Forvis Mazars, CLA, Baker Tilly) examines
and signs rather than building from scratch.

NEST does the heavy lifting: financial projections, market data, unit configs,
sources & uses, covenant schedules, penetration analysis. The accountant validates,
applies AICPA standards, and issues the examination report.

Revenue model: More NEST assembles = fewer accountant hours = lower fee.
The accountant charges $60K-175K for a full build. With NEST pre-assembly,
the validation-only engagement drops to $30K-80K.

Based on Jacaranda Trace Forvis Mazars feasibility study (Series 2025, $203M).
"""
from __future__ import annotations

from datetime import datetime
from typing import Any


# ── Qualified Accountant Firms ────────────────────────────────────

QUALIFIED_FIRMS: list[dict[str, Any]] = [
    {
        "name": "Forvis Mazars, LLP",
        "specialty": "Senior living, healthcare, education",
        "typical_fee_range": (100_000, 175_000),
        "timeline_weeks": 8,
        "locations": ["Atlanta", "Nashville", "St. Louis"],
    },
    {
        "name": "CliftonLarsonAllen (CLA)",
        "specialty": "Senior living, affordable housing, nonprofits",
        "typical_fee_range": (75_000, 150_000),
        "timeline_weeks": 8,
        "locations": ["Minneapolis", "Milwaukee", "Charlotte"],
    },
    {
        "name": "Baker Tilly",
        "specialty": "Healthcare, senior living, government",
        "typical_fee_range": (80_000, 150_000),
        "timeline_weeks": 8,
        "locations": ["Chicago", "New York", "Madison"],
    },
    {
        "name": "Plante Moran",
        "specialty": "Senior living, healthcare",
        "typical_fee_range": (75_000, 125_000),
        "timeline_weeks": 6,
        "locations": ["Detroit", "Chicago", "Denver"],
    },
    {
        "name": "Dixon Hughes Goodman (now Forvis)",
        "specialty": "Healthcare, nonprofits",
        "typical_fee_range": (70_000, 120_000),
        "timeline_weeks": 6,
        "locations": ["Charlotte", "Atlanta", "Richmond"],
    },
    {
        "name": "RSM US LLP",
        "specialty": "Healthcare, real estate, nonprofits",
        "typical_fee_range": (80_000, 140_000),
        "timeline_weeks": 8,
        "locations": ["Chicago", "New York", "Minneapolis"],
    },
    {
        "name": "BDO USA",
        "specialty": "Real estate, healthcare",
        "typical_fee_range": (90_000, 160_000),
        "timeline_weeks": 8,
        "locations": ["New York", "Chicago", "Los Angeles"],
    },
    {
        "name": "Wipfli LLP",
        "specialty": "Senior living, healthcare, nonprofits",
        "typical_fee_range": (60_000, 100_000),
        "timeline_weeks": 6,
        "locations": ["Milwaukee", "Minneapolis", "Denver"],
    },
]

# ── Feasibility Study Sections ────────────────────────────────────

FEASIBILITY_SECTIONS: list[dict[str, Any]] = [
    {
        "section": "independent_accountant_report",
        "title": "Independent Accountant's Examination Report",
        "assembled_by": "accountant",
        "nest_provides": "Draft language referencing all sections below, pre-populated with deal specifics",
    },
    {
        "section": "forecasted_statements_of_operations",
        "title": "Forecasted Statements of Operations and Changes in Net Deficit",
        "assembled_by": "nest",
        "source_docs": ["financial_statements", "operating_budget", "management_agreement"],
        "engine": "credit_memo_engine.model_campus_cashflow",
        "output": "5-year P&L with revenue by care level, expense by category, net deficit trajectory",
    },
    {
        "section": "forecasted_cash_flows",
        "title": "Forecasted Statements of Cash Flows",
        "assembled_by": "nest",
        "source_docs": ["financial_statements", "sources_and_uses", "construction_budget"],
        "output": "5-year cash flows: operating, investing, financing activities",
    },
    {
        "section": "forecasted_balance_sheets",
        "title": "Forecasted Balance Sheets",
        "assembled_by": "nest",
        "source_docs": ["financial_statements", "appraisal"],
        "output": "5-year balance sheets with assets, liabilities, net deficit",
    },
    {
        "section": "financial_ratios",
        "title": "Schedule of Forecasted Financial Ratios",
        "assembled_by": "nest",
        "source_docs": ["financial_statements", "bond_terms"],
        "output": "DSCR, days cash on hand, annual debt service, income available for DS",
    },
    {
        "section": "basis_of_presentation",
        "title": "Basis of Presentation",
        "assembled_by": "nest",
        "output": "Standard AICPA forecast presentation language + deal-specific modifications",
    },
    {
        "section": "background",
        "title": "Background",
        "assembled_by": "nest",
        "source_docs": ["entity_docs", "organizational_chart"],
        "output": "Entity structure, formation date, sole member, tax status, related parties",
    },
    {
        "section": "description_of_community",
        "title": "Description of the Community/Project",
        "assembled_by": "nest",
        "source_docs": ["appraisal", "unit_mix", "rent_roll", "site_plan"],
        "output": "Unit configuration table, square footage, fee schedules, campus description",
    },
    {
        "section": "description_of_project",
        "title": "Description of the Project",
        "assembled_by": "nest",
        "source_docs": ["construction_budget", "architect_plans", "construction_timeline"],
        "output": "Project scope, timeline, unit configuration before/after, milestones",
    },
    {
        "section": "summary_of_financing",
        "title": "Summary of Financing",
        "assembled_by": "nest",
        "source_docs": ["sources_and_uses", "bond_terms", "term_sheet"],
        "output": "Sources and uses table, series breakdown, funded interest, reserves, COI",
    },
    {
        "section": "significant_agreements",
        "title": "Summary of Significant Agreements",
        "assembled_by": "nest",
        "source_docs": ["management_agreement", "ground_lease", "lura", "trust_indenture"],
        "output": "Management agreement terms, home office agreement, master association, LURA requirements",
    },
    {
        "section": "residency_agreements",
        "title": "Description of Residency/Care Agreements",
        "assembled_by": "nest",
        "source_docs": ["residency_agreement", "continuing_care_contract"],
        "output": "Contract types (life lease, continuing care), entrance fee plans (traditional, 80/75, 50%), refund policies",
    },
    {
        "section": "market_analysis",
        "title": "Characteristics of the Market Area",
        "assembled_by": "nest",
        "source_docs": ["market_study", "census_data"],
        "output": "Demographics, income levels, age-qualified households, penetration rates, competition analysis",
    },
    {
        "section": "utilization_il",
        "title": "Description and Utilization of Independent Living",
        "assembled_by": "nest",
        "source_docs": ["unit_mix", "rent_roll", "historical_occupancy"],
        "output": "Unit inventory, occupancy history/projections, turnover rates, entrance fee collections, monthly fee revenue",
    },
    {
        "section": "penetration_analysis",
        "title": "Penetration Analysis",
        "assembled_by": "nest",
        "source_docs": ["market_study", "census_data", "competition_data"],
        "output": "Age/income qualified households, market penetration rate, absorption assumptions",
    },
    {
        "section": "utilization_al",
        "title": "Description and Utilization of Assisted Living",
        "assembled_by": "nest",
        "source_docs": ["unit_mix", "care_level_data"],
        "output": "AL unit inventory, occupancy projections, monthly fee revenue, staffing assumptions",
    },
    {
        "section": "utilization_snf",
        "title": "Description and Utilization of Nursing Care",
        "assembled_by": "nest",
        "source_docs": ["unit_mix", "care_level_data", "medicaid_rates"],
        "output": "SNF bed count, occupancy, daily rate, payor mix (private/Medicare/Medicaid)",
    },
    {
        "section": "accounting_policies",
        "title": "Summary of Significant Accounting Policies",
        "assembled_by": "accountant",
        "nest_provides": "Draft based on standard CCRC/senior living accounting (ASC 954, entrance fee recognition)",
    },
    {
        "section": "revenue_assumptions",
        "title": "Summary of Revenue and Entrance Fee Assumptions",
        "assembled_by": "nest",
        "source_docs": ["unit_mix", "fee_schedule", "historical_collections"],
        "output": "Entrance fee by plan type, monthly fee escalation, re-occupancy assumptions, second person fees",
    },
    {
        "section": "expense_assumptions",
        "title": "Summary of Operating Expense Assumptions",
        "assembled_by": "nest",
        "source_docs": ["operating_budget", "staffing_plan", "historical_expenses"],
        "output": "Expense by department, inflation assumptions, staffing ratios, management fee calculation",
    },
]

# All unique source docs across all sections
_ALL_SOURCE_DOCS: set[str] = set()
for _sec in FEASIBILITY_SECTIONS:
    for _doc in _sec.get("source_docs", []):
        _ALL_SOURCE_DOCS.add(_doc)

# Sections NEST assembles vs accountant writes
_NEST_SECTIONS = [s for s in FEASIBILITY_SECTIONS if s["assembled_by"] == "nest"]
_ACCOUNTANT_SECTIONS = [s for s in FEASIBILITY_SECTIONS if s["assembled_by"] == "accountant"]

# ── Default Assumptions for Financial Table Generation ────────────

_DEFAULT_FINANCIAL_ASSUMPTIONS: dict[str, Any] = {
    "annual_fee_escalation": 0.03,
    "annual_expense_growth": 0.03,
    "stabilized_occupancy_il": 0.93,
    "stabilized_occupancy_al": 0.93,
    "stabilized_occupancy_snf": 0.90,
    "ramp_months_to_stabilization": 24,
    "vacancy_reserve_pct": 0.05,
    "management_fee_pct": 0.05,
    "ef_recognition_years": 7,
    "ef_plan_mix": {"traditional": 0.55, "80_75": 0.45},
    "depreciation_years": 40,
    "amortization_coi_years": 30,
    "working_capital_pct_revenue": 0.02,
    "replacement_reserve_per_unit": 500,
}


class FeasibilityAssembly:
    """Assembles a complete feasibility study package from ingested documents.

    The accountant examines and signs rather than building from scratch.
    NEST does the projection math, the accountant validates the assumptions.
    """

    # ── 1. Assess Readiness ───────────────────────────────────────

    def assess_readiness(self, deal: dict, received_docs: list[str]) -> dict:
        """For each section, check if we have the source docs.

        Args:
            deal: Deal dict with at minimum 'deal_name'. May include 'bond_amount',
                  'sector', 'unit_config', etc.
            received_docs: List of document type keys that have been uploaded/received.

        Returns:
            Section-by-section status (ready/partial/missing), overall completeness %,
            what's needed next.
        """
        received_set = set(received_docs)
        sections_status: list[dict] = []
        ready_count = 0
        partial_count = 0
        missing_count = 0
        all_missing_docs: list[str] = []

        for section in FEASIBILITY_SECTIONS:
            section_id = section["section"]
            title = section["title"]
            assembled_by = section["assembled_by"]

            if assembled_by == "accountant":
                # Accountant sections are always "needs_accountant" — NEST provides draft
                sections_status.append({
                    "section": section_id,
                    "title": title,
                    "assembled_by": "accountant",
                    "status": "needs_accountant",
                    "nest_provides": section.get("nest_provides", ""),
                    "missing_docs": [],
                })
                continue

            source_docs = section.get("source_docs", [])
            if not source_docs:
                # No source docs needed (e.g., basis_of_presentation) — always ready
                sections_status.append({
                    "section": section_id,
                    "title": title,
                    "assembled_by": "nest",
                    "status": "ready",
                    "source_docs_required": [],
                    "source_docs_received": [],
                    "source_docs_missing": [],
                })
                ready_count += 1
                continue

            docs_received = [d for d in source_docs if d in received_set]
            docs_missing = [d for d in source_docs if d not in received_set]

            if not docs_missing:
                status = "ready"
                ready_count += 1
            elif docs_received:
                status = "partial"
                partial_count += 1
            else:
                status = "missing"
                missing_count += 1

            all_missing_docs.extend(docs_missing)

            sections_status.append({
                "section": section_id,
                "title": title,
                "assembled_by": "nest",
                "status": status,
                "source_docs_required": source_docs,
                "source_docs_received": docs_received,
                "source_docs_missing": docs_missing,
            })

        # Compute overall completeness as % of NEST sections that are ready
        total_nest_sections = len(_NEST_SECTIONS)
        completeness_pct = round(ready_count / total_nest_sections * 100, 1) if total_nest_sections else 0

        # Deduplicate missing docs and prioritize
        unique_missing = sorted(set(all_missing_docs))

        # Count how many sections each missing doc blocks
        doc_block_count: dict[str, int] = {}
        for doc in all_missing_docs:
            doc_block_count[doc] = doc_block_count.get(doc, 0) + 1
        priority_docs = sorted(unique_missing, key=lambda d: doc_block_count.get(d, 0), reverse=True)

        return {
            "deal_name": deal.get("deal_name", "Unknown"),
            "sections": sections_status,
            "summary": {
                "total_sections": len(FEASIBILITY_SECTIONS),
                "nest_sections": total_nest_sections,
                "accountant_sections": len(_ACCOUNTANT_SECTIONS),
                "ready": ready_count,
                "partial": partial_count,
                "missing": missing_count,
                "completeness_pct": completeness_pct,
            },
            "documents_received": sorted(received_set & _ALL_SOURCE_DOCS),
            "documents_missing": priority_docs,
            "next_steps": [
                f"Upload {doc} (unblocks {doc_block_count.get(doc, 0)} section{'s' if doc_block_count.get(doc, 0) != 1 else ''})"
                for doc in priority_docs[:5]
            ],
            "assessed_at": datetime.utcnow().isoformat(),
        }

    # ── 2. Assemble Package ──────────────────────────────────────

    def assemble_package(self, deal: dict, deal_data: dict) -> dict:
        """Build the full feasibility package from available data.

        For each section where assembled_by == "nest", generate the content
        using existing engines. For accountant sections, provide draft language
        and mark as needs-accountant.

        Args:
            deal: Deal dict with deal_name, bond_amount, sector, issuer, underwriter, etc.
            deal_data: All available data keyed by document type. Expected keys include:
                       financial_statements, operating_budget, unit_mix, rent_roll,
                       sources_and_uses, bond_terms, construction_budget, appraisal,
                       market_study, management_agreement, entity_docs, etc.

        Returns:
            Complete package with each section populated or marked as needs-accountant.
        """
        package_sections: dict[str, dict] = {}
        assembled_count = 0
        draft_count = 0
        needs_accountant_count = 0

        for section in FEASIBILITY_SECTIONS:
            section_id = section["section"]
            assembled_by = section["assembled_by"]

            if assembled_by == "accountant":
                package_sections[section_id] = self._assemble_accountant_section(section, deal, deal_data)
                needs_accountant_count += 1
                continue

            # Check if we have enough data for this section
            source_docs = section.get("source_docs", [])
            available_sources = {d: deal_data[d] for d in source_docs if d in deal_data}

            if not source_docs or available_sources:
                content = self._assemble_nest_section(section_id, deal, deal_data, available_sources)
                if content.get("status") == "assembled":
                    assembled_count += 1
                else:
                    draft_count += 1
                package_sections[section_id] = content
            else:
                package_sections[section_id] = {
                    "title": section["title"],
                    "status": "missing_data",
                    "required_docs": source_docs,
                    "expected_output": section.get("output", ""),
                }
                draft_count += 1

        # Financial tables are the core deliverable
        financial_tables = self.generate_financial_tables(deal_data)

        return {
            "deal_name": deal.get("deal_name", "Unknown"),
            "issuer": deal.get("issuer", ""),
            "underwriter": deal.get("underwriter", ""),
            "bond_amount": deal.get("bond_amount", 0),
            "forecast_period": deal.get("forecast_period", ""),
            "sections": package_sections,
            "financial_tables": financial_tables,
            "assembly_summary": {
                "total_sections": len(FEASIBILITY_SECTIONS),
                "fully_assembled": assembled_count,
                "draft_or_partial": draft_count,
                "needs_accountant": needs_accountant_count,
                "assembly_pct": round(assembled_count / len(FEASIBILITY_SECTIONS) * 100, 1),
            },
            "assembled_at": datetime.utcnow().isoformat(),
        }

    # ── 3. Generate Financial Tables ─────────────────────────────

    def generate_financial_tables(self, deal_data: dict) -> dict:
        """The core output: forecasted P&L, cash flows, balance sheets, and ratio schedules.

        Produces tabular data matching the Forvis Mazars feasibility structure.
        Uses real math from the cashflow model.

        Args:
            deal_data: Dict with keys: bond_amount, coupon_rate, unit_config,
                       assumptions (overrides), financial_statements, sources_and_uses, etc.

        Returns:
            Dict with forecasted_operations, forecasted_cash_flows, forecasted_balance_sheets,
            and financial_ratios — each containing 5-year tabular data.
        """
        assumptions = {**_DEFAULT_FINANCIAL_ASSUMPTIONS, **deal_data.get("assumptions", {})}

        bond_amount = deal_data.get("bond_amount", 0)
        coupon_rate = deal_data.get("coupon_rate", 0.065)
        amort_years = deal_data.get("amortization_years", 30)

        # Compute level debt service
        annual_debt_service = self._compute_annual_debt_service(bond_amount, coupon_rate, amort_years)

        # Unit configuration
        unit_config = deal_data.get("unit_config", {})
        il_units = unit_config.get("il", 0)
        al_units = unit_config.get("al", 0)
        mc_units = unit_config.get("mc", 0)
        snf_units = unit_config.get("snf", 0)
        total_units = il_units + al_units + mc_units + snf_units

        # Fee structure
        monthly_fee_il = deal_data.get("monthly_fee_il", 4964)
        monthly_fee_al = deal_data.get("monthly_fee_al", 6894)
        monthly_fee_mc = deal_data.get("monthly_fee_mc", 7500)
        monthly_fee_snf = deal_data.get("monthly_fee_snf", 12000)

        # Entrance fee parameters
        avg_ef_traditional = deal_data.get("avg_ef_traditional", 413_927)
        avg_ef_80_75 = deal_data.get("avg_ef_80_75", 670_832)
        ef_mix = assumptions["ef_plan_mix"]
        blended_ef = avg_ef_traditional * ef_mix["traditional"] + avg_ef_80_75 * ef_mix["80_75"]

        # EF amortization
        ef_recognition_years = assumptions["ef_recognition_years"]
        trad_pct = ef_mix["traditional"]
        refund_pct = ef_mix["80_75"]
        earned_ef_per_unit = avg_ef_traditional * trad_pct + avg_ef_80_75 * refund_pct * 0.25
        annual_ef_amort_per_unit = earned_ef_per_unit / ef_recognition_years

        # Expense parameters
        expense_per_unit_day = deal_data.get("expense_per_unit_day", 75)
        mgmt_fee_pct = assumptions["management_fee_pct"]
        escalation = assumptions["annual_fee_escalation"]
        expense_growth = assumptions["annual_expense_growth"]
        vacancy_pct = assumptions["vacancy_reserve_pct"]
        ramp_months = assumptions["ramp_months_to_stabilization"]
        stabilized_il = assumptions["stabilized_occupancy_il"]
        stabilized_al = assumptions["stabilized_occupancy_al"]
        stabilized_snf = assumptions["stabilized_occupancy_snf"]

        # Balance sheet starting values
        total_assets_start = deal_data.get("total_assets", bond_amount * 1.05)
        construction_cost = deal_data.get("construction_cost", 0)
        coi = deal_data.get("cost_of_issuance", bond_amount * 0.02)
        dsrf = deal_data.get("dsrf_balance", annual_debt_service * 1.25)
        funded_interest = deal_data.get("funded_interest", 0)
        replacement_reserve_per_unit = assumptions["replacement_reserve_per_unit"]

        base_year = deal_data.get("base_year", datetime.utcnow().year)

        # ── Build 5-year projections ─────────────────────────────
        operations: dict[int, dict] = {}
        cash_flows: dict[int, dict] = {}
        balance_sheets: dict[int, dict] = {}
        ratio_schedules: dict[int, dict] = {}

        cumulative_net_deficit = deal_data.get("initial_net_deficit", -(bond_amount * 0.10))
        cash_balance = deal_data.get("initial_cash", dsrf + funded_interest)
        total_property = total_assets_start
        total_debt = bond_amount
        deferred_ef_liability = 0.0

        for yr_offset in range(5):
            year = base_year + yr_offset
            esc_factor = (1 + escalation) ** yr_offset
            exp_factor = (1 + expense_growth) ** yr_offset

            # Occupancy ramp
            months_elapsed = yr_offset * 12 + 6
            if months_elapsed >= ramp_months:
                occ_il = stabilized_il
                occ_al = stabilized_al
                occ_snf = stabilized_snf
            else:
                ramp_pct = months_elapsed / ramp_months
                floor_occ = 0.30
                occ_il = floor_occ + (stabilized_il - floor_occ) * ramp_pct
                occ_al = floor_occ + (stabilized_al - floor_occ) * ramp_pct
                occ_snf = floor_occ + (stabilized_snf - floor_occ) * ramp_pct

            # ── Forecasted Statement of Operations ───────────────
            il_monthly_rev = il_units * monthly_fee_il * esc_factor * occ_il * 12
            al_monthly_rev = al_units * monthly_fee_al * esc_factor * occ_al * 12
            mc_monthly_rev = mc_units * monthly_fee_mc * esc_factor * occ_al * 12
            snf_revenue = snf_units * monthly_fee_snf * esc_factor * occ_snf * 12
            occupied_il = round(il_units * occ_il)
            ef_amort_revenue = occupied_il * annual_ef_amort_per_unit * esc_factor

            gross_revenue = il_monthly_rev + al_monthly_rev + mc_monthly_rev + snf_revenue + ef_amort_revenue
            vacancy_loss = gross_revenue * vacancy_pct
            effective_revenue = gross_revenue - vacancy_loss

            # Expenses by category
            total_occupied = round(il_units * occ_il + al_units * occ_al + mc_units * occ_al + snf_units * occ_snf)
            nursing_salaries = total_occupied * 45 * 365 * exp_factor
            dietary = total_occupied * 8 * 365 * exp_factor
            housekeeping = total_occupied * 5 * 365 * exp_factor
            plant_operations = total_occupied * 7 * 365 * exp_factor
            admin_general = total_occupied * 10 * 365 * exp_factor
            mgmt_fee = effective_revenue * mgmt_fee_pct
            insurance = total_units * 2000 * exp_factor
            real_estate_taxes = deal_data.get("real_estate_taxes", total_units * 1500) * exp_factor
            depreciation = total_property / assumptions["depreciation_years"]
            coi_amortization = coi / assumptions["amortization_coi_years"]

            total_operating_expenses = (
                nursing_salaries + dietary + housekeeping + plant_operations +
                admin_general + mgmt_fee + insurance + real_estate_taxes
            )
            total_expenses_with_depreciation = total_operating_expenses + depreciation + coi_amortization

            operating_income = effective_revenue - total_expenses_with_depreciation
            interest_expense = total_debt * coupon_rate

            # Funded interest offset in early years
            funded_interest_used = 0.0
            if funded_interest > 0 and yr_offset < 3:
                funded_interest_used = min(interest_expense * 0.5, funded_interest)
                funded_interest -= funded_interest_used

            net_income = operating_income - interest_expense + funded_interest_used
            cumulative_net_deficit += net_income

            operations[year] = {
                "revenue": {
                    "il_monthly_fees": round(il_monthly_rev),
                    "al_monthly_fees": round(al_monthly_rev),
                    "mc_monthly_fees": round(mc_monthly_rev),
                    "snf_revenue": round(snf_revenue),
                    "entrance_fee_amortization": round(ef_amort_revenue),
                    "gross_revenue": round(gross_revenue),
                    "vacancy_loss": round(vacancy_loss),
                    "effective_revenue": round(effective_revenue),
                },
                "expenses": {
                    "nursing_salaries": round(nursing_salaries),
                    "dietary": round(dietary),
                    "housekeeping": round(housekeeping),
                    "plant_operations": round(plant_operations),
                    "admin_general": round(admin_general),
                    "management_fee": round(mgmt_fee),
                    "insurance": round(insurance),
                    "real_estate_taxes": round(real_estate_taxes),
                    "depreciation": round(depreciation),
                    "coi_amortization": round(coi_amortization),
                    "total_operating": round(total_operating_expenses),
                    "total_with_depreciation": round(total_expenses_with_depreciation),
                },
                "operating_income": round(operating_income),
                "interest_expense": round(interest_expense),
                "funded_interest_applied": round(funded_interest_used),
                "net_income": round(net_income),
                "cumulative_net_deficit": round(cumulative_net_deficit),
            }

            # ── Forecasted Statement of Cash Flows ───────────────
            # Operating activities
            cf_operating = net_income + depreciation + coi_amortization  # Add back non-cash

            # New entrance fee collections (cash inflow)
            turnover_rate = 0.08 if yr_offset >= 2 else 0.04
            new_moveins = round(il_units * occ_il * turnover_rate)
            ef_cash_collected = new_moveins * blended_ef
            ef_refunds = round(new_moveins * 0.6) * blended_ef * 0.80 * ef_mix["80_75"]  # Refunds to departing residents
            net_ef_cash = ef_cash_collected - ef_refunds

            # Working capital changes
            wc_change = -(effective_revenue * assumptions["working_capital_pct_revenue"]) if yr_offset == 0 else 0

            net_cf_operating = cf_operating + net_ef_cash + wc_change

            # Investing activities
            replacement_reserve = total_units * replacement_reserve_per_unit * exp_factor
            construction_spend = construction_cost * 0.40 if yr_offset == 0 else (
                construction_cost * 0.40 if yr_offset == 1 else
                construction_cost * 0.20 if yr_offset == 2 else 0
            )
            net_cf_investing = -(replacement_reserve + construction_spend)

            # Financing activities
            principal_payment = self._compute_annual_principal(bond_amount, coupon_rate, amort_years, yr_offset + 1)
            net_cf_financing = -interest_expense - principal_payment + funded_interest_used

            net_change_cash = net_cf_operating + net_cf_investing + net_cf_financing
            cash_balance += net_change_cash

            cash_flows[year] = {
                "operating_activities": {
                    "net_income": round(net_income),
                    "depreciation_amortization": round(depreciation + coi_amortization),
                    "entrance_fees_collected": round(ef_cash_collected),
                    "entrance_fee_refunds": round(ef_refunds),
                    "net_entrance_fee_cash": round(net_ef_cash),
                    "working_capital_change": round(wc_change),
                    "net_operating": round(net_cf_operating),
                },
                "investing_activities": {
                    "replacement_reserve_deposits": round(replacement_reserve),
                    "construction_expenditures": round(construction_spend),
                    "net_investing": round(net_cf_investing),
                },
                "financing_activities": {
                    "interest_payments": round(interest_expense),
                    "principal_payments": round(principal_payment),
                    "funded_interest_released": round(funded_interest_used),
                    "net_financing": round(net_cf_financing),
                },
                "net_change_in_cash": round(net_change_cash),
                "ending_cash_balance": round(cash_balance),
            }

            # ── Forecasted Balance Sheet ─────────────────────────
            total_property -= depreciation
            deferred_ef_liability += (ef_cash_collected - ef_amort_revenue - ef_refunds)
            total_debt -= principal_payment

            balance_sheets[year] = {
                "assets": {
                    "cash_and_equivalents": round(max(0, cash_balance)),
                    "accounts_receivable": round(effective_revenue / 12 * 0.5),  # ~0.5 months AR
                    "dsrf": round(dsrf),
                    "property_plant_equipment": round(total_property),
                    "other_assets": round(coi - coi_amortization * (yr_offset + 1)),
                    "total_assets": round(max(0, cash_balance) + dsrf + total_property + effective_revenue / 12 * 0.5),
                },
                "liabilities": {
                    "accounts_payable": round(total_operating_expenses / 12 * 0.5),
                    "bonds_payable": round(total_debt),
                    "deferred_entrance_fees": round(max(0, deferred_ef_liability)),
                    "total_liabilities": round(total_debt + max(0, deferred_ef_liability) + total_operating_expenses / 12 * 0.5),
                },
                "net_assets": {
                    "net_deficit": round(cumulative_net_deficit),
                },
            }

            # ── Financial Ratio Schedule ─────────────────────────
            income_available_for_ds = effective_revenue - total_operating_expenses
            dscr = income_available_for_ds / annual_debt_service if annual_debt_service else 0
            days_cash = (cash_balance / (total_operating_expenses / 365)) if total_operating_expenses else 0

            ratio_schedules[year] = {
                "income_available_for_ds": round(income_available_for_ds),
                "annual_debt_service": round(annual_debt_service),
                "dscr": round(dscr, 2),
                "days_cash_on_hand": round(max(0, days_cash)),
                "occupancy_il": round(occ_il, 3),
                "occupancy_al": round(occ_al, 3),
                "occupancy_snf": round(occ_snf, 3),
                "operating_expense_ratio": round(total_operating_expenses / effective_revenue, 4) if effective_revenue else 0,
                "debt_yield": round(income_available_for_ds / total_debt, 4) if total_debt else 0,
            }

        return {
            "forecasted_operations": operations,
            "forecasted_cash_flows": cash_flows,
            "forecasted_balance_sheets": balance_sheets,
            "financial_ratios": ratio_schedules,
            "assumptions": assumptions,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 4. Estimate Accountant Scope ─────────────────────────────

    def estimate_accountant_scope(self, package: dict) -> dict:
        """Based on how much NEST assembled, estimate accountant hours, fee, timeline.

        More NEST assembly = less accountant work = lower fee.

        Args:
            package: Output of assemble_package.

        Returns:
            Estimated accountant hours, fee range, timeline, and what remains.
        """
        summary = package.get("assembly_summary", {})
        assembly_pct = summary.get("assembly_pct", 0)

        # Base accountant scope: full feasibility study engagement
        base_hours = 600  # Partner + manager + staff hours for full study
        base_fee_low = 100_000
        base_fee_high = 175_000
        base_weeks = 8

        # NEST pre-assembly reduces accountant scope
        # 0% assembly = full engagement, 100% = validation-only
        reduction_factor = assembly_pct / 100 * 0.60  # Max 60% reduction with full NEST assembly
        # Accountant always needs minimum hours for examination standards
        min_floor = 0.35  # 35% of base is the absolute minimum for AICPA compliance

        adjusted_factor = max(min_floor, 1.0 - reduction_factor)

        estimated_hours = round(base_hours * adjusted_factor)
        estimated_fee_low = round(base_fee_low * adjusted_factor, -3)  # Round to nearest $1K
        estimated_fee_high = round(base_fee_high * adjusted_factor, -3)
        estimated_weeks = max(3, round(base_weeks * adjusted_factor))

        # What the accountant still needs to do
        remaining_work: list[dict] = []

        # Accountant-owned sections always need work
        for section in _ACCOUNTANT_SECTIONS:
            remaining_work.append({
                "section": section["section"],
                "title": section["title"],
                "type": "accountant_owned",
                "description": f"Write and issue: {section.get('nest_provides', section['title'])}",
                "estimated_hours": 40 if section["section"] == "independent_accountant_report" else 24,
            })

        # NEST-assembled sections need validation
        sections = package.get("sections", {})
        for section_id, content in sections.items():
            status = content.get("status", "")
            if status == "assembled":
                remaining_work.append({
                    "section": section_id,
                    "title": content.get("title", section_id),
                    "type": "validation",
                    "description": "Review NEST projections, validate assumptions, test calculations",
                    "estimated_hours": 8,
                })
            elif status == "missing_data":
                remaining_work.append({
                    "section": section_id,
                    "title": content.get("title", section_id),
                    "type": "build_from_scratch",
                    "description": "Build section — source documents not available to NEST",
                    "estimated_hours": 24,
                })

        savings_low = base_fee_low - estimated_fee_low
        savings_high = base_fee_high - estimated_fee_high

        return {
            "deal_name": package.get("deal_name", "Unknown"),
            "nest_assembly_pct": assembly_pct,
            "accountant_scope": {
                "estimated_hours": estimated_hours,
                "estimated_fee_range": (estimated_fee_low, estimated_fee_high),
                "estimated_timeline_weeks": estimated_weeks,
                "engagement_type": "examination" if assembly_pct > 50 else "full_build",
            },
            "full_build_comparison": {
                "hours": base_hours,
                "fee_range": (base_fee_low, base_fee_high),
                "timeline_weeks": base_weeks,
            },
            "estimated_savings": {
                "hours_saved": base_hours - estimated_hours,
                "fee_savings_range": (savings_low, savings_high),
                "weeks_saved": base_weeks - estimated_weeks,
                "savings_pct": round((1 - adjusted_factor) * 100, 1),
            },
            "remaining_work": remaining_work,
            "estimated_at": datetime.utcnow().isoformat(),
        }

    # ── 5. List Qualified Firms ──────────────────────────────────

    def list_qualified_firms(self) -> list[dict]:
        """Accountant firms that do feasibility studies for bond offerings.

        Returns:
            List of qualified firm dicts with name, specialty, fee range, timeline, locations.
        """
        return [
            {
                **firm,
                "fee_range_formatted": f"${firm['typical_fee_range'][0]:,} - ${firm['typical_fee_range'][1]:,}",
                "timeline_formatted": f"{firm['timeline_weeks']} weeks",
            }
            for firm in QUALIFIED_FIRMS
        ]

    # ── Private Helpers ──────────────────────────────────────────

    def _assemble_accountant_section(self, section: dict, deal: dict, deal_data: dict) -> dict:
        """Generate draft language for accountant-owned sections."""
        section_id = section["section"]

        if section_id == "independent_accountant_report":
            return {
                "title": section["title"],
                "status": "needs_accountant",
                "draft_language": (
                    f"Independent Accountant's Examination Report\n\n"
                    f"To the Board of Directors of {deal.get('deal_name', '[Entity Name]')}\n\n"
                    f"We have examined the accompanying forecasted financial statements of "
                    f"{deal.get('deal_name', '[Entity Name]')} for the period "
                    f"{deal.get('forecast_period', '[Forecast Period]')}, including the "
                    f"forecasted statements of operations and changes in net deficit, "
                    f"forecasted statements of cash flows, and forecasted balance sheets.\n\n"
                    f"[Accountant completes examination language per AT-C Section 305]"
                ),
                "nest_provides": section.get("nest_provides", ""),
            }

        if section_id == "accounting_policies":
            return {
                "title": section["title"],
                "status": "needs_accountant",
                "draft_language": (
                    "Summary of Significant Accounting Policies\n\n"
                    "Basis of Accounting: The accompanying forecasted financial statements "
                    "have been prepared on the accrual basis of accounting in accordance with "
                    "accounting principles generally accepted in the United States of America.\n\n"
                    "Revenue Recognition: Monthly service fees are recognized as revenue in the "
                    "period services are provided. Entrance fees are recognized in accordance with "
                    "ASC 954-440 (Health Care Entities - Continuing Care Retirement Communities).\n\n"
                    "Entrance Fee Amortization: Non-refundable entrance fees are amortized into "
                    "revenue using the straight-line method over the estimated remaining life "
                    "expectancy of the resident.\n\n"
                    "Refundable Entrance Fees: Refundable amounts are recorded as a liability "
                    "until earned through contract terms or resident departure.\n\n"
                    "[Accountant reviews and modifies per deal-specific accounting elections]"
                ),
                "nest_provides": section.get("nest_provides", ""),
            }

        return {
            "title": section["title"],
            "status": "needs_accountant",
            "nest_provides": section.get("nest_provides", ""),
        }

    def _assemble_nest_section(
        self, section_id: str, deal: dict, deal_data: dict, available_sources: dict
    ) -> dict:
        """Generate content for a NEST-assembled section."""
        section_spec = next((s for s in FEASIBILITY_SECTIONS if s["section"] == section_id), None)
        if not section_spec:
            return {"title": section_id, "status": "error", "error": "Unknown section"}

        title = section_spec["title"]
        builder = getattr(self, f"_build_{section_id}", None)

        if builder:
            content = builder(deal, deal_data, available_sources)
            return {
                "title": title,
                "status": "assembled",
                "content": content,
                "source_docs_used": list(available_sources.keys()),
            }

        # Generic assembly: return structured output description with deal data overlay
        return {
            "title": title,
            "status": "assembled",
            "content": {
                "deal_name": deal.get("deal_name", "Unknown"),
                "expected_output": section_spec.get("output", ""),
                "data_available": list(available_sources.keys()),
            },
            "source_docs_used": list(available_sources.keys()),
        }

    def _build_forecasted_statements_of_operations(
        self, deal: dict, deal_data: dict, sources: dict
    ) -> dict:
        """Build 5-year P&L from available financial data."""
        tables = self.generate_financial_tables(deal_data)
        return {
            "forecast_period": deal.get("forecast_period", "5-year"),
            "operations": tables.get("forecasted_operations", {}),
        }

    def _build_forecasted_cash_flows(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        tables = self.generate_financial_tables(deal_data)
        return {
            "forecast_period": deal.get("forecast_period", "5-year"),
            "cash_flows": tables.get("forecasted_cash_flows", {}),
        }

    def _build_forecasted_balance_sheets(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        tables = self.generate_financial_tables(deal_data)
        return {
            "forecast_period": deal.get("forecast_period", "5-year"),
            "balance_sheets": tables.get("forecasted_balance_sheets", {}),
        }

    def _build_financial_ratios(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        tables = self.generate_financial_tables(deal_data)
        return {
            "forecast_period": deal.get("forecast_period", "5-year"),
            "ratios": tables.get("financial_ratios", {}),
        }

    def _build_basis_of_presentation(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        return {
            "standard": "AICPA Guide for Prospective Financial Information",
            "basis": "Accrual basis of accounting in accordance with US GAAP",
            "presentation_note": (
                "The accompanying forecasted financial statements present, to the best of "
                f"management's knowledge and belief, the expected financial position, results of "
                f"operations, and cash flows of {deal.get('deal_name', 'the Entity')} for the "
                f"forecast period. The assumptions disclosed herein are those that management "
                f"believes are significant to the forecast."
            ),
            "responsible_party": deal.get("deal_name", "Management"),
        }

    def _build_background(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        entity_docs = sources.get("entity_docs", {})
        return {
            "entity_name": deal.get("deal_name", "Unknown"),
            "formation_type": deal.get("entity_type", "Limited Liability Company"),
            "state_of_formation": deal.get("state", ""),
            "tax_status": deal.get("tax_status", "501(c)(3) tax-exempt" if deal.get("tax_exempt") else "Taxable"),
            "sole_member": deal.get("sole_member", deal.get("sponsor_name", "")),
            "organizational_structure": entity_docs.get("structure", ""),
            "related_parties": deal.get("related_parties", []),
        }

    def _build_summary_of_financing(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        s_and_u = sources.get("sources_and_uses", deal_data.get("sources_and_uses", {}))
        return {
            "bond_amount": deal.get("bond_amount", 0),
            "series": deal.get("series", {}),
            "sources_and_uses": s_and_u,
            "issuer": deal.get("issuer", ""),
            "underwriter": deal.get("underwriter", ""),
            "bond_counsel": deal.get("bond_counsel", ""),
            "trustee": deal.get("trustee", ""),
        }

    def _build_description_of_community(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        unit_mix = sources.get("unit_mix", deal_data.get("unit_config", {}))
        return {
            "project_name": deal.get("deal_name", "Unknown"),
            "location": deal.get("location", ""),
            "campus_description": deal.get("campus_description", ""),
            "unit_configuration": unit_mix,
            "total_units": sum(unit_mix.values()) if isinstance(unit_mix, dict) else 0,
            "amenities": deal.get("amenities", []),
        }

    def _build_description_of_project(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        return {
            "scope": deal.get("project_scope", ""),
            "timeline": deal.get("timeline", {}),
            "unit_config_before": deal.get("unit_config_before", {}),
            "unit_config_after": deal.get("unit_config_after", deal_data.get("unit_config", {})),
            "construction_budget": sources.get("construction_budget", deal_data.get("construction_cost", 0)),
            "milestones": deal.get("milestones", []),
        }

    def _build_market_analysis(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        market = sources.get("market_study", deal_data.get("market_data", {}))
        return {
            "market_area": deal.get("market_area", deal.get("location", "")),
            "demographics": market.get("demographics", {}),
            "age_qualified_households": market.get("age_qualified_households", 0),
            "income_qualified_pct": market.get("income_qualified_pct", 0),
            "penetration_rate": market.get("penetration_rate", 0),
            "competition": market.get("competition", []),
            "demand_drivers": deal.get("demand_drivers", []),
        }

    def _build_penetration_analysis(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        market = sources.get("market_study", deal_data.get("market_data", {}))
        census = sources.get("census_data", {})
        unit_config = deal_data.get("unit_config", {})
        total_units = sum(unit_config.values()) if isinstance(unit_config, dict) else 0
        age_qualified = market.get("age_qualified_households", census.get("age_qualified_households", 0))
        penetration = (total_units / age_qualified * 100) if age_qualified else 0

        return {
            "primary_market_area": deal.get("market_area", ""),
            "age_qualified_households": age_qualified,
            "income_qualified_households": market.get("income_qualified_households", 0),
            "total_units_proposed": total_units,
            "market_penetration_rate": round(penetration, 2),
            "benchmark_penetration": 5.0,  # National average ~5%
            "absorption_assumptions": market.get("absorption", {
                "il_units_per_month": max(2, total_units // 60),
                "months_to_stabilization": 24,
            }),
        }

    def _build_revenue_assumptions(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        assumptions = {**_DEFAULT_FINANCIAL_ASSUMPTIONS, **deal_data.get("assumptions", {})}
        return {
            "monthly_fee_escalation": assumptions["annual_fee_escalation"],
            "entrance_fee_plan_mix": assumptions["ef_plan_mix"],
            "avg_ef_traditional": deal_data.get("avg_ef_traditional", 413_927),
            "avg_ef_80_75": deal_data.get("avg_ef_80_75", 670_832),
            "monthly_fee_il": deal_data.get("monthly_fee_il", 4964),
            "monthly_fee_al": deal_data.get("monthly_fee_al", 6894),
            "monthly_fee_snf": deal_data.get("monthly_fee_snf", 12000),
            "second_person_fee": deal_data.get("second_person_fee", 1500),
            "re_occupancy_assumption_months": deal_data.get("re_occupancy_months", 6),
        }

    def _build_expense_assumptions(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        assumptions = {**_DEFAULT_FINANCIAL_ASSUMPTIONS, **deal_data.get("assumptions", {})}
        return {
            "inflation_rate": assumptions["annual_expense_growth"],
            "management_fee_pct": assumptions["management_fee_pct"],
            "expense_per_unit_day": deal_data.get("expense_per_unit_day", 75),
            "staffing_ratio": deal_data.get("staffing_ratio", {
                "il": 0.3,
                "al": 0.6,
                "mc": 0.8,
                "snf": 1.2,
            }),
            "replacement_reserve_per_unit": assumptions["replacement_reserve_per_unit"],
        }

    def _build_utilization_il(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        unit_config = deal_data.get("unit_config", {})
        return {
            "il_units": unit_config.get("il", 0),
            "occupancy_target": _DEFAULT_FINANCIAL_ASSUMPTIONS["stabilized_occupancy_il"],
            "monthly_fee": deal_data.get("monthly_fee_il", 4964),
            "turnover_rate": 0.08,
            "historical_occupancy": deal_data.get("historical_occupancy_il", []),
        }

    def _build_utilization_al(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        unit_config = deal_data.get("unit_config", {})
        return {
            "al_units": unit_config.get("al", 0),
            "mc_units": unit_config.get("mc", 0),
            "occupancy_target": _DEFAULT_FINANCIAL_ASSUMPTIONS["stabilized_occupancy_al"],
            "monthly_fee_al": deal_data.get("monthly_fee_al", 6894),
            "monthly_fee_mc": deal_data.get("monthly_fee_mc", 7500),
        }

    def _build_utilization_snf(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        unit_config = deal_data.get("unit_config", {})
        return {
            "snf_beds": unit_config.get("snf", 0),
            "occupancy_target": _DEFAULT_FINANCIAL_ASSUMPTIONS["stabilized_occupancy_snf"],
            "daily_rate_private": deal_data.get("snf_daily_private", 400),
            "daily_rate_medicare": deal_data.get("snf_daily_medicare", 550),
            "daily_rate_medicaid": deal_data.get("snf_daily_medicaid", 250),
            "payor_mix": deal_data.get("snf_payor_mix", {
                "private": 0.40,
                "medicare": 0.25,
                "medicaid": 0.35,
            }),
        }

    def _build_significant_agreements(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        return {
            "management_agreement": {
                "manager": deal.get("property_manager", ""),
                "fee_pct": deal_data.get("management_fee_pct", 0.05),
                "term_years": deal_data.get("mgmt_term_years", 10),
                "termination": deal_data.get("mgmt_termination", "90 days written notice"),
            },
            "ground_lease": sources.get("ground_lease", None),
            "lura": deal_data.get("lura_requirements", None),
            "trust_indenture": {
                "trustee": deal.get("trustee", ""),
                "covenants": deal.get("covenant_summary", []),
            },
        }

    def _build_residency_agreements(self, deal: dict, deal_data: dict, sources: dict) -> dict:
        return {
            "contract_types": deal_data.get("contract_types", ["life_lease", "continuing_care"]),
            "entrance_fee_plans": {
                "traditional": {
                    "description": "Non-refundable entrance fee, lower monthly fee",
                    "refund_pct": 0,
                },
                "80_75": {
                    "description": "80% refundable declining to 75% over 48 months",
                    "refund_pct": 0.75,
                    "decline_months": 48,
                },
                "50_pct": {
                    "description": "50% refundable, mid-range monthly fee",
                    "refund_pct": 0.50,
                },
            },
            "plan_mix": _DEFAULT_FINANCIAL_ASSUMPTIONS["ef_plan_mix"],
        }

    @staticmethod
    def _compute_annual_debt_service(bond_amount: float, coupon_rate: float, amort_years: int) -> float:
        """Compute level annual debt service (P&I)."""
        if bond_amount <= 0 or coupon_rate <= 0:
            return 0.0
        monthly_rate = coupon_rate / 12
        n_months = amort_years * 12
        if monthly_rate > 0 and n_months > 0:
            monthly_payment = bond_amount * (monthly_rate * (1 + monthly_rate) ** n_months) / (
                (1 + monthly_rate) ** n_months - 1
            )
            return monthly_payment * 12
        return bond_amount / amort_years if amort_years else 0.0

    @staticmethod
    def _compute_annual_principal(
        bond_amount: float, coupon_rate: float, amort_years: int, year_number: int
    ) -> float:
        """Compute principal portion of debt service for a given year."""
        if bond_amount <= 0 or coupon_rate <= 0 or amort_years <= 0:
            return 0.0
        monthly_rate = coupon_rate / 12
        n_months = amort_years * 12
        if monthly_rate <= 0:
            return bond_amount / amort_years

        monthly_payment = bond_amount * (monthly_rate * (1 + monthly_rate) ** n_months) / (
            (1 + monthly_rate) ** n_months - 1
        )

        # Sum principal payments for months in this year
        remaining = bond_amount
        total_principal = 0.0
        start_month = (year_number - 1) * 12 + 1
        end_month = year_number * 12

        for month in range(1, end_month + 1):
            interest_portion = remaining * monthly_rate
            principal_portion = monthly_payment - interest_portion
            if month >= start_month:
                total_principal += principal_portion
            remaining -= principal_portion

        return total_principal
