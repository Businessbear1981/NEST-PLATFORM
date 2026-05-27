"""
NEST Pitch Generator — Client-facing pitch packages, cost estimates,
purchase orders, bond scenarios, and deal readiness assessments.

Produces everything a client needs to understand:
- What NEST brings to the table
- What's missing from their documentation
- Bond structure options with real unit mechanics
- Complete cost estimate (NEST fees + third-party)
- Formal purchase order / engagement letter

Seeded with Jacaranda Trace ($203M senior living CCRC) as test case.

Feeds Into:
- Bernard — pitch narration and client presentation
- Bond Desk — structure execution after engagement
- Hawkeye — investor matching once structure is locked
- Intelligence Engine — bond sizing and pricing inputs
"""
from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Any

from services.intelligence_engine import (
    PRICING_BENCHMARKS,
    SECTOR_MULTIPLES,
    SECTOR_LEVERAGE_CAPACITY,
    UNIVERSAL_CREDIT_POLICY,
    IntelligenceEngine,
)


# ── NEST Fee Schedule ────────────────────────────────────────────

NEST_FEE_SCHEDULE = {
    "structuring_fee": {
        "description": "Bond structuring and arrangement fee",
        "rate_pct": 0.025,  # 2.5% of bond par
        "minimum_usd": 150_000,
        "notes": "Covers deal structuring, credit analysis, S&U, term sheet, covenant design",
    },
    "placement_fee": {
        "description": "Investor placement and book building",
        "rate_pct": 0.0075,  # 75bps
        "minimum_usd": 75_000,
        "notes": "Hawkeye investor matching, order book, allocation",
    },
    "ongoing_admin_fee": {
        "description": "Ongoing bond administration and EMMA compliance",
        "rate_bps": 62.5,  # per annum on outstanding
        "minimum_annual_usd": 25_000,
        "notes": "Continuing disclosure, trustee liaison, covenant monitoring",
    },
    "advisory_retainer": {
        "description": "Pre-engagement advisory retainer",
        "flat_usd": 25_000,
        "notes": "Credited against structuring fee at closing. Non-refundable.",
    },
}

# ── Third-Party Costs (Client Pays) ──────────────────────────────

THIRD_PARTY_COSTS = {
    "feasibility_study": {
        "description": "Independent accountant's examination report (Forvis Mazars, CliftonLarsonAllen, etc.)",
        "range_usd": (75_000, 175_000),
        "typical_usd": 125_000,
        "timeline_weeks": 8,
        "required_for": "All public bond offerings",
    },
    "appraisal": {
        "description": "MAI-certified appraisal (HealthTrust, Cushman & Wakefield, CBRE)",
        "range_usd": (15_000, 50_000),
        "typical_usd": 25_000,
        "timeline_weeks": 4,
        "required_for": "All deals with real estate collateral",
    },
    "rating_agency": {
        "description": "Credit rating (S&P, Moody's, Fitch, or KBRA)",
        "range_usd": (50_000, 150_000),
        "typical_usd": 75_000,
        "timeline_weeks": 6,
        "required_for": "Public bond offerings. Optional for PP.",
        "note": "Annual surveillance fee ~$25K-50K additional",
    },
    "bond_counsel": {
        "description": "Tax opinion and bond documentation (Nabors Giblin, Orrick, etc.)",
        "range_usd": (75_000, 200_000),
        "typical_usd": 125_000,
        "timeline_weeks": 8,
        "required_for": "All bond offerings",
    },
    "borrower_counsel": {
        "description": "Borrower's legal counsel",
        "range_usd": (50_000, 150_000),
        "typical_usd": 75_000,
        "timeline_weeks": 8,
        "required_for": "All deals",
    },
    "trustee": {
        "description": "Bond trustee (UMB Bank, U.S. Bank, Wilmington Trust)",
        "acceptance_fee_usd": 5_000,
        "annual_fee_usd": 7_500,
        "required_for": "All bond offerings",
    },
    "surety_insurance": {
        "description": "Hylant surety wrap / bond insurance (if applicable)",
        "rate_bps_annual": (25, 75),
        "typical_bps": 50,
        "required_for": "Credit-enhanced deals",
        "note": "Annual premium on outstanding par",
    },
    "environmental_report": {
        "description": "Phase I ESA (Phase II if triggered)",
        "range_usd": (3_000, 15_000),
        "typical_usd": 5_000,
        "timeline_weeks": 3,
        "required_for": "All deals with real estate",
    },
    "title_insurance": {
        "description": "Title insurance and survey",
        "rate_per_thousand": 5.75,
        "minimum_usd": 10_000,
        "required_for": "All deals with real estate",
    },
    "construction_consultant": {
        "description": "Pre-construction estimating and project monitoring",
        "range_usd": (25_000, 100_000),
        "typical_usd": 50_000,
        "required_for": "Construction deals",
    },
    "market_study": {
        "description": "Independent market study (if not included in feasibility)",
        "range_usd": (15_000, 40_000),
        "typical_usd": 25_000,
        "timeline_weeks": 4,
        "required_for": "New development",
    },
    "accounting_audit": {
        "description": "Annual audited financial statements",
        "range_usd": (25_000, 75_000),
        "typical_usd": 40_000,
        "timeline_weeks": 6,
        "required_for": "All public offerings — ongoing annual requirement",
    },
}

# ── Sector-Specific Document Requirements ────────────────────────

SECTOR_DOC_REQUIREMENTS: dict[str, list[str]] = {
    "senior_living": [
        "feasibility_study", "appraisal", "rating_agency", "bond_counsel",
        "borrower_counsel", "trustee", "environmental_report", "title_insurance",
        "market_study", "accounting_audit",
    ],
    "real_estate": [
        "appraisal", "bond_counsel", "borrower_counsel", "trustee",
        "environmental_report", "title_insurance", "accounting_audit",
    ],
    "healthcare_services": [
        "feasibility_study", "appraisal", "rating_agency", "bond_counsel",
        "borrower_counsel", "trustee", "environmental_report", "accounting_audit",
    ],
    "construction": [
        "feasibility_study", "appraisal", "rating_agency", "bond_counsel",
        "borrower_counsel", "trustee", "environmental_report", "title_insurance",
        "construction_consultant", "market_study", "accounting_audit",
    ],
}

# Default for sectors not listed
DEFAULT_DOC_REQUIREMENTS = [
    "bond_counsel", "borrower_counsel", "trustee", "accounting_audit",
]

# ── Deal Readiness Document Checklist ────────────────────────────

READINESS_DOCUMENTS: dict[str, dict[str, Any]] = {
    "audited_financials": {
        "label": "Audited financial statements (3 years)",
        "weight": 15,
        "critical": True,
    },
    "interim_financials": {
        "label": "Interim (unaudited) financial statements",
        "weight": 5,
        "critical": False,
    },
    "feasibility_study": {
        "label": "Independent feasibility study / accountant's report",
        "weight": 15,
        "critical": True,
    },
    "appraisal": {
        "label": "MAI-certified appraisal",
        "weight": 10,
        "critical": True,
    },
    "entity_documents": {
        "label": "Entity formation docs (articles, bylaws, operating agreement)",
        "weight": 5,
        "critical": True,
    },
    "tax_exempt_determination": {
        "label": "IRS determination letter (501(c)(3)) or tax status docs",
        "weight": 8,
        "critical": True,
    },
    "environmental_report": {
        "label": "Phase I Environmental Site Assessment",
        "weight": 5,
        "critical": False,
    },
    "title_report": {
        "label": "Preliminary title report and survey",
        "weight": 5,
        "critical": False,
    },
    "management_agreement": {
        "label": "Management / operator agreement",
        "weight": 5,
        "critical": False,
    },
    "insurance_certificates": {
        "label": "Insurance certificates and schedules",
        "weight": 3,
        "critical": False,
    },
    "capital_plan": {
        "label": "Capital improvement plan / budget",
        "weight": 5,
        "critical": False,
    },
    "occupancy_data": {
        "label": "Historical occupancy and revenue data",
        "weight": 8,
        "critical": True,
    },
    "regulatory_approvals": {
        "label": "Regulatory approvals / licenses (CON, state licensure)",
        "weight": 6,
        "critical": False,
    },
    "existing_debt_schedule": {
        "label": "Existing debt schedule and payoff letters",
        "weight": 5,
        "critical": True,
    },
}

# ── Timeline Templates ───────────────────────────────────────────

TIMELINE_TEMPLATE: list[dict[str, Any]] = [
    {"phase": "Engagement & Kickoff", "weeks": 1, "description": "Execute engagement letter, retainer, initial doc request"},
    {"phase": "Due Diligence & Document Collection", "weeks": 4, "description": "Financial analysis, site visit, document assembly"},
    {"phase": "Credit Analysis & Structuring", "weeks": 3, "description": "Credit memo, bond sizing, S&U, covenant design"},
    {"phase": "Third-Party Reports", "weeks": 8, "description": "Feasibility, appraisal, environmental (parallel)"},
    {"phase": "Rating Agency Application", "weeks": 6, "description": "Rating presentation, Q&A, indicative rating"},
    {"phase": "Legal Documentation", "weeks": 6, "description": "Bond counsel drafting, borrower review, issuer approval"},
    {"phase": "Investor Marketing", "weeks": 3, "description": "Hawkeye placement, investor presentations, order book"},
    {"phase": "Pricing & Closing", "weeks": 2, "description": "Final pricing, bond purchase agreement, fund"},
]


# ── Jacaranda Test Case ──────────────────────────────────────────

JACARANDA_PITCH_INPUT = {
    "deal_name": "Convivial Jacaranda Trace",
    "sector": "senior_living",
    "deal_type": "refi",
    "size_usd": 203_080_000,
    "location": "Venice, FL",
    "units": 456,
    "noi": 18_500_000,
    "dscr_projected": 1.52,
    "tax_exempt": True,
    "issuer": "Florida LGFC",
    "enhancement": "surety",
    "has_feasibility": True,
    "has_appraisal": True,
    "has_financials": True,
    "borrower_type": "501(c)(3)",
}


class PitchGenerator:
    """Generates complete client pitch packages for NEST bond engagements."""

    def __init__(self):
        self._engine = IntelligenceEngine()

    # ══════════════════════════════════════════════════════════════
    # 1. GENERATE PITCH — Complete client pitch package
    # ══════════════════════════════════════════════════════════════

    def generate_pitch(self, deal: dict, options: dict | None = None) -> dict:
        """Generate a complete client pitch package.

        Args:
            deal: Deal dict with name, sector, size, NOI, DSCR, etc.
            options: Optional overrides (e.g., force_scenarios, skip_costs).

        Returns:
            Full pitch package: executive summary, gap analysis, scenarios,
            unit mechanics, placement strategy, timeline, recommendation.
        """
        options = options or {}
        par = deal.get("size_usd", 0)
        sector = deal.get("sector", "")
        deal_name = deal.get("deal_name", "Unknown Deal")

        # Build components
        readiness = self.assess_readiness(deal)
        scenarios = self.generate_bond_scenarios(deal)
        costs = self.estimate_costs(deal, structure="base")

        # Executive summary
        executive_summary = self._build_executive_summary(deal)

        # What we have
        what_we_have = self._build_what_we_have(deal, readiness)

        # What's missing
        whats_missing = self._build_whats_missing(deal, readiness)

        # Placement strategy
        placement_strategy = self._build_placement_strategy(deal, scenarios)

        # Timeline
        timeline = self._build_timeline(deal)

        # Recommendation
        recommendation = self._build_recommendation(deal, scenarios, readiness)

        return {
            "pitch_type": "NEST Bond Structuring & Placement",
            "deal_name": deal_name,
            "generated_at": datetime.utcnow().isoformat(),
            "executive_summary": executive_summary,
            "what_we_have": what_we_have,
            "whats_missing": whats_missing,
            "bond_structure_options": scenarios,
            "cost_estimate": costs,
            "placement_strategy": placement_strategy,
            "timeline": timeline,
            "recommendation": recommendation,
            "readiness_assessment": readiness,
        }

    # ══════════════════════════════════════════════════════════════
    # 2. ESTIMATE COSTS — Complete cost estimate for all parties
    # ══════════════════════════════════════════════════════════════

    def estimate_costs(self, deal: dict, structure: str = "base") -> dict:
        """Generate complete cost estimate for a deal.

        Args:
            deal: Deal dict.
            structure: "conservative", "base", or "aggressive".

        Returns:
            Itemized costs: NEST fees, third-party, total COI, funded
            from proceeds, due at engagement.
        """
        par = deal.get("size_usd", 0)
        sector = deal.get("sector", "")
        deal_type = deal.get("deal_type", "")
        enhancement = deal.get("enhancement", "none")
        tax_exempt = deal.get("tax_exempt", False)

        # Adjust par for scenario
        if structure == "conservative":
            par = round(par * 0.90)
        elif structure == "aggressive":
            par = round(par * 1.10)

        # ── NEST Fees ────────────────────────────────────────────
        structuring_fee = max(
            round(par * NEST_FEE_SCHEDULE["structuring_fee"]["rate_pct"]),
            NEST_FEE_SCHEDULE["structuring_fee"]["minimum_usd"],
        )
        placement_fee = max(
            round(par * NEST_FEE_SCHEDULE["placement_fee"]["rate_pct"]),
            NEST_FEE_SCHEDULE["placement_fee"]["minimum_usd"],
        )
        ongoing_admin_annual = max(
            round(par * NEST_FEE_SCHEDULE["ongoing_admin_fee"]["rate_bps"] / 10_000),
            NEST_FEE_SCHEDULE["ongoing_admin_fee"]["minimum_annual_usd"],
        )
        retainer = NEST_FEE_SCHEDULE["advisory_retainer"]["flat_usd"]

        nest_fees = {
            "structuring_fee": {
                "amount_usd": structuring_fee,
                "rate": f"{NEST_FEE_SCHEDULE['structuring_fee']['rate_pct'] * 100:.1f}% of par",
                "description": NEST_FEE_SCHEDULE["structuring_fee"]["description"],
                "payment_trigger": "Due at closing, funded from bond proceeds",
                "notes": NEST_FEE_SCHEDULE["structuring_fee"]["notes"],
            },
            "placement_fee": {
                "amount_usd": placement_fee,
                "rate": f"{NEST_FEE_SCHEDULE['placement_fee']['rate_pct'] * 100:.2f}% of par",
                "description": NEST_FEE_SCHEDULE["placement_fee"]["description"],
                "payment_trigger": "Due at funding",
                "notes": NEST_FEE_SCHEDULE["placement_fee"]["notes"],
            },
            "ongoing_admin_fee": {
                "amount_annual_usd": ongoing_admin_annual,
                "rate": f"{NEST_FEE_SCHEDULE['ongoing_admin_fee']['rate_bps']:.1f} bps per annum",
                "description": NEST_FEE_SCHEDULE["ongoing_admin_fee"]["description"],
                "payment_trigger": "Quarterly in arrears",
                "notes": NEST_FEE_SCHEDULE["ongoing_admin_fee"]["notes"],
            },
            "advisory_retainer": {
                "amount_usd": retainer,
                "description": NEST_FEE_SCHEDULE["advisory_retainer"]["description"],
                "payment_trigger": "Due at engagement signing",
                "notes": NEST_FEE_SCHEDULE["advisory_retainer"]["notes"],
            },
            "total_nest_upfront_usd": structuring_fee + placement_fee + retainer,
        }

        # ── Third-Party Costs ────────────────────────────────────
        required_reports = SECTOR_DOC_REQUIREMENTS.get(sector, DEFAULT_DOC_REQUIREMENTS)
        # Add sector-specific extras
        if deal_type in ("construction", "new_development"):
            if "construction_consultant" not in required_reports:
                required_reports = list(required_reports) + ["construction_consultant"]
        if enhancement in ("surety", "bond_insurance"):
            if "surety_insurance" not in required_reports:
                required_reports = list(required_reports) + ["surety_insurance"]
        if not tax_exempt:
            # Taxable deals may skip rating for PP
            required_reports = [r for r in required_reports if r != "rating_agency"]

        third_party_items: list[dict] = []
        tp_total_low = 0
        tp_total_typical = 0
        tp_total_high = 0

        for report_key in required_reports:
            cost_data = THIRD_PARTY_COSTS.get(report_key)
            if not cost_data:
                continue

            item: dict[str, Any] = {
                "item": report_key,
                "description": cost_data["description"],
                "required_for": cost_data.get("required_for", "This deal"),
            }

            # Handle different cost structures
            if "range_usd" in cost_data:
                low, high = cost_data["range_usd"]
                typical = cost_data.get("typical_usd", (low + high) // 2)
                item["low_usd"] = low
                item["typical_usd"] = typical
                item["high_usd"] = high
                tp_total_low += low
                tp_total_typical += typical
                tp_total_high += high
            elif "acceptance_fee_usd" in cost_data:
                # Trustee: one-time + annual
                acceptance = cost_data["acceptance_fee_usd"]
                annual = cost_data.get("annual_fee_usd", 0)
                item["acceptance_fee_usd"] = acceptance
                item["annual_fee_usd"] = annual
                item["low_usd"] = acceptance
                item["typical_usd"] = acceptance
                item["high_usd"] = acceptance
                tp_total_low += acceptance
                tp_total_typical += acceptance
                tp_total_high += acceptance
            elif "rate_bps_annual" in cost_data:
                # Surety: basis points on par
                bps_low, bps_high = cost_data["rate_bps_annual"]
                typical_bps = cost_data.get("typical_bps", (bps_low + bps_high) // 2)
                annual_low = round(par * bps_low / 10_000)
                annual_typical = round(par * typical_bps / 10_000)
                annual_high = round(par * bps_high / 10_000)
                item["annual_premium_low_usd"] = annual_low
                item["annual_premium_typical_usd"] = annual_typical
                item["annual_premium_high_usd"] = annual_high
                item["low_usd"] = annual_low  # first year
                item["typical_usd"] = annual_typical
                item["high_usd"] = annual_high
                tp_total_low += annual_low
                tp_total_typical += annual_typical
                tp_total_high += annual_high
            elif "rate_per_thousand" in cost_data:
                # Title insurance: rate per $1,000 of par
                rate = cost_data["rate_per_thousand"]
                minimum = cost_data.get("minimum_usd", 10_000)
                calculated = round(par / 1_000 * rate)
                amount = max(calculated, minimum)
                item["low_usd"] = minimum
                item["typical_usd"] = amount
                item["high_usd"] = round(amount * 1.25)
                tp_total_low += minimum
                tp_total_typical += amount
                tp_total_high += round(amount * 1.25)

            if "timeline_weeks" in cost_data:
                item["timeline_weeks"] = cost_data["timeline_weeks"]

            third_party_items.append(item)

        third_party_costs = {
            "items": third_party_items,
            "total_low_usd": tp_total_low,
            "total_typical_usd": tp_total_typical,
            "total_high_usd": tp_total_high,
        }

        # ── Total Cost of Issuance ───────────────────────────────
        nest_upfront = structuring_fee + placement_fee
        total_coi_low = nest_upfront + tp_total_low
        total_coi_typical = nest_upfront + tp_total_typical
        total_coi_high = nest_upfront + tp_total_high

        coi_pct_low = round(total_coi_low / par * 100, 2) if par else 0
        coi_pct_typical = round(total_coi_typical / par * 100, 2) if par else 0
        coi_pct_high = round(total_coi_high / par * 100, 2) if par else 0

        total_coi = {
            "low_usd": total_coi_low,
            "typical_usd": total_coi_typical,
            "high_usd": total_coi_high,
            "as_pct_of_par": {
                "low": coi_pct_low,
                "typical": coi_pct_typical,
                "high": coi_pct_high,
            },
            "market_benchmark_pct": "2.0% - 4.0% for tax-exempt bonds of this size",
        }

        # ── Funded from Proceeds ─────────────────────────────────
        funded_from_proceeds = {
            "structuring_fee": structuring_fee,
            "placement_fee": placement_fee,
            "bond_counsel": next(
                (i["typical_usd"] for i in third_party_items if i["item"] == "bond_counsel"), 0
            ),
            "rating_agency": next(
                (i["typical_usd"] for i in third_party_items if i["item"] == "rating_agency"), 0
            ),
            "trustee_acceptance": next(
                (i.get("acceptance_fee_usd", i.get("typical_usd", 0)) for i in third_party_items if i["item"] == "trustee"), 0
            ),
            "title_insurance": next(
                (i["typical_usd"] for i in third_party_items if i["item"] == "title_insurance"), 0
            ),
            "environmental_report": next(
                (i["typical_usd"] for i in third_party_items if i["item"] == "environmental_report"), 0
            ),
        }
        funded_from_proceeds["total_usd"] = sum(funded_from_proceeds.values())
        funded_from_proceeds["note"] = (
            "These costs are included in the Sources & Uses and paid from bond proceeds at closing. "
            "Client does not pay out-of-pocket at closing."
        )

        # ── Due at Engagement ────────────────────────────────────
        # Retainer + initial third-party deposits
        initial_deposits: dict[str, int] = {"advisory_retainer": retainer}

        # Client typically deposits for feasibility and appraisal upfront
        for item in third_party_items:
            if item["item"] in ("feasibility_study", "appraisal", "environmental_report"):
                deposit = round(item["typical_usd"] * 0.50)  # 50% deposit
                initial_deposits[f"{item['item']}_deposit"] = deposit

        initial_deposits["total_usd"] = sum(initial_deposits.values())
        initial_deposits["note"] = (
            "Retainer is non-refundable but credited against structuring fee at closing. "
            "Third-party deposits are pass-through to vendors."
        )

        return {
            "par_amount": par,
            "structure_scenario": structure,
            "nest_fees": nest_fees,
            "third_party_costs": third_party_costs,
            "total_cost_of_issuance": total_coi,
            "funded_from_proceeds": funded_from_proceeds,
            "due_at_engagement": initial_deposits,
            "ongoing_annual_costs": {
                "nest_admin_fee": ongoing_admin_annual,
                "trustee_annual": next(
                    (i.get("annual_fee_usd", 7_500) for i in third_party_items if i["item"] == "trustee"), 7_500
                ),
                "surety_annual": next(
                    (i.get("annual_premium_typical_usd", 0) for i in third_party_items if i["item"] == "surety_insurance"), 0
                ),
                "rating_surveillance": 35_000 if "rating_agency" in required_reports else 0,
                "audit_annual": next(
                    (i["typical_usd"] for i in third_party_items if i["item"] == "accounting_audit"), 0
                ),
            },
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ══════════════════════════════════════════════════════════════
    # 3. GENERATE PURCHASE ORDER — Formal engagement letter
    # ══════════════════════════════════════════════════════════════

    def generate_purchase_order(self, deal: dict, costs: dict | None = None) -> dict:
        """Generate a formal purchase order / engagement letter.

        Args:
            deal: Deal dict.
            costs: Output of estimate_costs(). Will compute if not provided.

        Returns:
            Structured engagement letter with scope, fees, terms, signatures.
        """
        if costs is None:
            costs = self.estimate_costs(deal)

        par = costs.get("par_amount", deal.get("size_usd", 0))
        deal_name = deal.get("deal_name", "Unknown Deal")
        today = datetime.utcnow()
        nest_fees = costs.get("nest_fees", {})
        due_at_engagement = costs.get("due_at_engagement", {})

        # Scope of services
        scope_of_services = [
            {
                "item": "Credit Analysis & Underwriting",
                "description": (
                    "Complete credit analysis including financial ratio computation, "
                    "DSCR modeling, leverage assessment, and shadow rating determination "
                    "per S&P/Moody's published methodologies."
                ),
            },
            {
                "item": "Bond Structuring",
                "description": (
                    "Design bond structure including series breakdown, coupon determination, "
                    "maturity schedule, amortization, call provisions, covenant package, "
                    "and Sources & Uses statement."
                ),
            },
            {
                "item": "Credit Enhancement Coordination",
                "description": (
                    "Coordinate surety bond or letter of credit enhancement with Hylant Insurance "
                    "or other approved providers to achieve target credit rating."
                ),
            },
            {
                "item": "Rating Agency Coordination",
                "description": (
                    "Prepare rating agency presentation, coordinate with S&P/Moody's/Fitch/KBRA, "
                    "manage Q&A process, and negotiate indicative rating."
                ),
            },
            {
                "item": "Legal Coordination",
                "description": (
                    "Coordinate with bond counsel, borrower counsel, and issuer counsel. "
                    "Review all legal documentation including indenture, loan agreement, "
                    "and continuing disclosure agreement."
                ),
            },
            {
                "item": "Investor Placement",
                "description": (
                    "Hawkeye-powered investor matching, roadshow coordination, order book management, "
                    "allocation, and final pricing. Target institutional qualified buyers."
                ),
            },
            {
                "item": "EMMA Compliance & Ongoing Administration",
                "description": (
                    "Post-issuance EMMA filings, continuing disclosure compliance, "
                    "covenant monitoring, trustee liaison, and annual reporting."
                ),
            },
        ]

        # Fee schedule with payment triggers
        fee_schedule = [
            {
                "fee": "Advisory Retainer",
                "amount_usd": nest_fees.get("advisory_retainer", {}).get("amount_usd", 25_000),
                "payment_trigger": "Due upon execution of this engagement letter",
                "notes": "Non-refundable. Credited against structuring fee at closing.",
            },
            {
                "fee": "Structuring Fee",
                "amount_usd": nest_fees.get("structuring_fee", {}).get("amount_usd", 0),
                "rate": nest_fees.get("structuring_fee", {}).get("rate", ""),
                "payment_trigger": "Due at closing, funded from bond proceeds",
                "notes": "Advisory retainer credited. Net amount funded from COI.",
            },
            {
                "fee": "Placement Fee",
                "amount_usd": nest_fees.get("placement_fee", {}).get("amount_usd", 0),
                "rate": nest_fees.get("placement_fee", {}).get("rate", ""),
                "payment_trigger": "Due at funding",
                "notes": "Funded from bond proceeds.",
            },
            {
                "fee": "Ongoing Administration",
                "amount_annual_usd": nest_fees.get("ongoing_admin_fee", {}).get("amount_annual_usd", 0),
                "rate": nest_fees.get("ongoing_admin_fee", {}).get("rate", ""),
                "payment_trigger": "Quarterly in arrears, commencing first full quarter post-closing",
                "notes": "Continues for life of bonds.",
            },
        ]

        # Timeline commitments
        timeline = self._build_timeline(deal)
        total_weeks = sum(p["weeks"] for p in timeline)
        target_closing = today + timedelta(weeks=total_weeks)

        # Terms and conditions
        terms_and_conditions = [
            {
                "term": "Exclusivity",
                "description": (
                    "Client grants NEST Advisors exclusive right to structure and place "
                    "the described bond transaction for a period of 12 months from execution."
                ),
            },
            {
                "term": "Confidentiality",
                "description": (
                    "All information shared is confidential and will not be disclosed to "
                    "third parties except as required for deal execution (rating agencies, "
                    "legal counsel, approved investors)."
                ),
            },
            {
                "term": "Retainer Terms",
                "description": (
                    "The advisory retainer is non-refundable and is earned upon receipt. "
                    "It will be credited dollar-for-dollar against the structuring fee "
                    "at closing."
                ),
            },
            {
                "term": "Termination",
                "description": (
                    "Either party may terminate with 30 days written notice. Upon termination "
                    "by client, the retainer is forfeited and client is responsible for "
                    "any third-party costs incurred to date."
                ),
            },
            {
                "term": "Third-Party Costs",
                "description": (
                    "Client is responsible for all third-party costs (feasibility, appraisal, "
                    "legal, rating, trustee, etc.). NEST will coordinate engagement of "
                    "third parties but all costs are direct obligations of the client."
                ),
            },
            {
                "term": "Governing Law",
                "description": "This engagement shall be governed by the laws of the State of Washington.",
            },
            {
                "term": "Standard of Care",
                "description": (
                    "NEST Advisors will perform services with the degree of skill and care "
                    "ordinarily exercised by professionals performing similar services."
                ),
            },
        ]

        # Signature blocks
        signature_blocks = {
            "nest_advisors": {
                "entity": "NEST Advisors, LLC",
                "signer": "Sean Gilmore, Managing Partner",
                "date_line": "Date: _______________",
                "signature_line": "Signature: _______________",
            },
            "client": {
                "entity": deal.get("borrower_name", deal_name),
                "signer": "Authorized Representative",
                "title_line": "Title: _______________",
                "date_line": "Date: _______________",
                "signature_line": "Signature: _______________",
            },
        }

        # Total estimated engagement value
        structuring = nest_fees.get("structuring_fee", {}).get("amount_usd", 0)
        placement = nest_fees.get("placement_fee", {}).get("amount_usd", 0)
        admin_5yr = nest_fees.get("ongoing_admin_fee", {}).get("amount_annual_usd", 0) * 5
        total_engagement_value = structuring + placement + admin_5yr

        return {
            "document_type": "Engagement Letter / Purchase Order",
            "document_date": today.strftime("%B %d, %Y"),
            "deal_name": deal_name,
            "parties": {
                "advisor": "NEST Advisors, LLC",
                "client": deal.get("borrower_name", deal_name),
                "issuer": deal.get("issuer", "To be determined"),
            },
            "deal_summary": {
                "transaction": f"{'Tax-Exempt' if deal.get('tax_exempt') else 'Taxable'} Revenue Bond Offering",
                "estimated_par_amount": par,
                "sector": deal.get("sector", ""),
                "location": deal.get("location", ""),
                "purpose": self._deal_purpose_text(deal),
            },
            "scope_of_services": scope_of_services,
            "fee_schedule": fee_schedule,
            "third_party_cost_estimates": {
                "total_estimated_range": f"${costs.get('third_party_costs', {}).get('total_low_usd', 0):,.0f} - ${costs.get('third_party_costs', {}).get('total_high_usd', 0):,.0f}",
                "note": "Pass-through at actual cost. Estimates provided for budgeting purposes.",
                "items": costs.get("third_party_costs", {}).get("items", []),
            },
            "timeline": {
                "phases": timeline,
                "total_weeks": total_weeks,
                "target_closing_date": target_closing.strftime("%B %d, %Y"),
                "note": "Timeline assumes timely client cooperation and document delivery.",
            },
            "terms_and_conditions": terms_and_conditions,
            "signature_blocks": signature_blocks,
            "total_estimated_engagement_value": {
                "upfront_nest_fees": structuring + placement,
                "ongoing_5yr_admin": admin_5yr,
                "total_5yr_value": total_engagement_value,
                "retainer_due_at_signing": due_at_engagement.get("total_usd", 25_000),
            },
            "generated_at": today.isoformat(),
        }

    # ══════════════════════════════════════════════════════════════
    # 4. GENERATE BOND SCENARIOS — 3 structure scenarios
    # ══════════════════════════════════════════════════════════════

    def generate_bond_scenarios(self, deal: dict) -> list[dict]:
        """Generate 3 bond structure scenarios: conservative, base, aggressive.

        Each includes full unit mechanics: par, coupon, maturity, amortization,
        call schedule, put provisions, DSCR, spread decomposition.
        """
        par = deal.get("size_usd", 0)
        noi = deal.get("noi", 0)
        dscr_projected = deal.get("dscr_projected", 0)
        tax_exempt = deal.get("tax_exempt", False)
        enhancement = deal.get("enhancement", "none")
        sector = deal.get("sector", "")

        # Base rate: use MMD for tax-exempt, Treasury for taxable
        base_rate_te = 3.85   # 30yr AAA MMD
        base_rate_tax = 4.65  # 30yr Treasury
        base_rate = base_rate_te if tax_exempt else base_rate_tax

        scenarios = []

        # ── SCENARIO 1: CONSERVATIVE ─────────────────────────────
        cons_par = round(par * 0.85)
        cons_dscr = noi / (cons_par * 0.055 / 1) if cons_par and noi else dscr_projected * 1.15
        cons_coupon = round(base_rate + 0.75, 3)  # tighter spread
        cons_annual_ds = self._compute_annual_debt_service(cons_par, cons_coupon / 100, 30, io_years=0)
        cons_dscr_actual = round(noi / cons_annual_ds, 2) if cons_annual_ds and noi else cons_dscr
        cons_rating = "A" if enhancement in ("surety", "bond_insurance") else "BBB"

        cons_spread_decomp = self._spread_decomposition(
            base_rate, cons_rating, enhancement, tax_exempt, par_amount=cons_par
        )

        scenarios.append({
            "scenario": "Conservative",
            "description": (
                "Lower leverage, investment-grade target, tighter covenants. "
                "Maximizes rating and investor appetite. Lowest coupon."
            ),
            "structure": {
                "par_amount": cons_par,
                "series": [{"name": "Series A", "amount": cons_par, "tax_status": "tax-exempt" if tax_exempt else "taxable"}],
                "tax_status": "Tax-Exempt" if tax_exempt else "Taxable",
                "coupon_pct": cons_coupon,
                "yield_pct": round(cons_coupon + 0.05, 3),
                "maturity_years": 30,
                "final_maturity": datetime.utcnow().year + 30,
                "amortization": self._build_amortization_schedule(cons_par, cons_coupon / 100, 30, io_years=0),
                "call_schedule": self._build_call_schedule(nc_years=10, start_premium=2),
                "put_provisions": {"type": "None", "description": "No put provisions — standard fixed-rate structure"},
            },
            "credit": {
                "dscr_at_issuance": cons_dscr_actual,
                "dscr_at_stabilization": round(cons_dscr_actual * 1.05, 2),
                "estimated_rating": cons_rating,
                "enhancement": enhancement,
                "ltv_pct": round(cons_par / (noi / 0.06) * 100, 1) if noi else 0,
            },
            "spread_decomposition": cons_spread_decomp,
            "investor_appetite": {
                "assessment": "Strong",
                "target_buyers": ["Insurance companies", "Mutual funds", "Pension funds", "Bank trust departments"],
                "estimated_demand_multiple": "3.0x - 4.0x",
            },
            "pros": [
                "Highest credit rating achievable",
                "Lowest coupon and cost of capital",
                "Broadest investor base",
                "Most favorable covenant terms from lender perspective",
            ],
            "cons": [
                "Lowest proceeds to borrower",
                "Tightest covenants restrict operational flexibility",
                "May require additional equity contribution",
            ],
        })

        # ── SCENARIO 2: BASE CASE ────────────────────────────────
        base_par = par
        base_coupon = round(base_rate + 1.25, 3)
        base_annual_ds = self._compute_annual_debt_service(base_par, base_coupon / 100, 30, io_years=2)
        base_dscr_actual = round(noi / base_annual_ds, 2) if base_annual_ds and noi else dscr_projected
        base_rating = "BBB" if enhancement in ("surety", "bond_insurance") else "BB"

        base_spread_decomp = self._spread_decomposition(
            base_rate, base_rating, enhancement, tax_exempt, par_amount=base_par
        )

        # Series breakdown for larger deals
        if base_par > 100_000_000:
            series_a = round(base_par * 0.70)
            series_b = base_par - series_a
            series = [
                {"name": "Series A (Senior)", "amount": series_a, "tax_status": "tax-exempt" if tax_exempt else "taxable", "coupon_pct": base_coupon},
                {"name": "Series B (Subordinate)", "amount": series_b, "tax_status": "taxable", "coupon_pct": round(base_coupon + 1.50, 3)},
            ]
        else:
            series = [{"name": "Series A", "amount": base_par, "tax_status": "tax-exempt" if tax_exempt else "taxable", "coupon_pct": base_coupon}]

        scenarios.append({
            "scenario": "Base Case",
            "description": (
                "Standard structure per NEST model. Balanced leverage, "
                "market-clearing coupon, standard covenants. Recommended starting point."
            ),
            "structure": {
                "par_amount": base_par,
                "series": series,
                "tax_status": "Tax-Exempt" if tax_exempt else "Taxable",
                "coupon_pct": base_coupon,
                "yield_pct": round(base_coupon + 0.10, 3),
                "maturity_years": 30,
                "final_maturity": datetime.utcnow().year + 30,
                "amortization": self._build_amortization_schedule(base_par, base_coupon / 100, 30, io_years=2),
                "call_schedule": self._build_call_schedule(nc_years=10, start_premium=2),
                "put_provisions": {
                    "type": "Optional Tender",
                    "description": "Holders may tender at par on each 5-year anniversary",
                    "tender_dates": [f"Year {y}" for y in range(5, 31, 5)],
                },
            },
            "credit": {
                "dscr_at_issuance": base_dscr_actual,
                "dscr_at_stabilization": round(base_dscr_actual * 1.08, 2),
                "estimated_rating": base_rating,
                "enhancement": enhancement,
                "ltv_pct": round(base_par / (noi / 0.06) * 100, 1) if noi else 0,
            },
            "spread_decomposition": base_spread_decomp,
            "investor_appetite": {
                "assessment": "Good",
                "target_buyers": ["Hedge funds", "Insurance companies", "High-yield mutual funds", "Family offices"],
                "estimated_demand_multiple": "2.0x - 3.0x",
            },
            "pros": [
                "Maximizes proceeds while maintaining market access",
                "Standard structure with established precedent",
                "Balanced covenant package",
                "IO period provides cash flow cushion during ramp-up",
            ],
            "cons": [
                "Higher coupon than conservative scenario",
                "May require credit enhancement for IG rating",
                "Some institutional buyers limited to IG only",
            ],
        })

        # ── SCENARIO 3: AGGRESSIVE ───────────────────────────────
        agg_par = round(par * 1.10)
        agg_coupon = round(base_rate + 2.50, 3)
        agg_annual_ds = self._compute_annual_debt_service(agg_par, agg_coupon / 100, 25, io_years=3)
        agg_dscr_actual = round(noi / agg_annual_ds, 2) if agg_annual_ds and noi else dscr_projected * 0.85
        agg_rating = "BB" if enhancement in ("surety", "bond_insurance") else "B"

        agg_spread_decomp = self._spread_decomposition(
            base_rate, agg_rating, enhancement, tax_exempt, par_amount=agg_par
        )

        scenarios.append({
            "scenario": "Aggressive",
            "description": (
                "Maximum leverage, sub-investment-grade, looser covenants, "
                "highest coupon. Maximizes borrower proceeds at higher cost."
            ),
            "structure": {
                "par_amount": agg_par,
                "series": [
                    {"name": "Series A (Senior)", "amount": round(agg_par * 0.60), "tax_status": "tax-exempt" if tax_exempt else "taxable", "coupon_pct": round(agg_coupon - 0.50, 3)},
                    {"name": "Series B (Mezzanine)", "amount": round(agg_par * 0.25), "tax_status": "taxable", "coupon_pct": agg_coupon},
                    {"name": "Series C (Subordinate)", "amount": round(agg_par * 0.15), "tax_status": "taxable", "coupon_pct": round(agg_coupon + 2.00, 3)},
                ],
                "tax_status": "Mixed (Tax-Exempt Senior / Taxable Sub)" if tax_exempt else "Taxable",
                "coupon_pct": agg_coupon,
                "yield_pct": round(agg_coupon + 0.25, 3),
                "maturity_years": 25,
                "final_maturity": datetime.utcnow().year + 25,
                "amortization": self._build_amortization_schedule(agg_par, agg_coupon / 100, 25, io_years=3),
                "call_schedule": self._build_call_schedule(nc_years=5, start_premium=3),
                "put_provisions": {
                    "type": "Mandatory Tender at Year 7",
                    "description": "Mandatory tender at par + accrued at Year 7. Remarket or redeem.",
                },
            },
            "credit": {
                "dscr_at_issuance": agg_dscr_actual,
                "dscr_at_stabilization": round(agg_dscr_actual * 1.10, 2),
                "estimated_rating": agg_rating,
                "enhancement": "none — sub-IG does not benefit from enhancement",
                "ltv_pct": round(agg_par / (noi / 0.06) * 100, 1) if noi else 0,
            },
            "spread_decomposition": agg_spread_decomp,
            "investor_appetite": {
                "assessment": "Moderate — targeted placement",
                "target_buyers": ["Hedge funds", "Distressed/special situations", "Private credit funds", "Family offices"],
                "estimated_demand_multiple": "1.5x - 2.0x",
            },
            "pros": [
                "Maximum proceeds to borrower",
                "Greater operational flexibility",
                "Looser covenants allow faster growth",
                "Shorter NC period provides refinance optionality",
            ],
            "cons": [
                "Highest cost of capital",
                "Limited investor universe",
                "Tighter DSCR cushion — less margin for error",
                "May require personal guaranty or additional collateral",
                "Sub-IG rating limits secondary market liquidity",
            ],
        })

        return scenarios

    # ══════════════════════════════════════════════════════════════
    # 5. ASSESS READINESS — What's ready vs what's needed
    # ══════════════════════════════════════════════════════════════

    def assess_readiness(self, deal: dict) -> dict:
        """Assess deal readiness: documents, financials, legal, market.

        Returns readiness score 0-100, blockers, and critical path items.
        """
        # ── Document Readiness ───────────────────────────────────
        doc_status: list[dict] = []
        doc_score = 0
        doc_max = 0

        doc_field_map = {
            "audited_financials": "has_financials",
            "feasibility_study": "has_feasibility",
            "appraisal": "has_appraisal",
            "entity_documents": "has_entity_docs",
            "tax_exempt_determination": "has_tax_determination",
            "environmental_report": "has_environmental",
            "title_report": "has_title",
            "management_agreement": "has_management_agreement",
            "insurance_certificates": "has_insurance",
            "capital_plan": "has_capital_plan",
            "occupancy_data": "has_occupancy_data",
            "regulatory_approvals": "has_regulatory",
            "existing_debt_schedule": "has_debt_schedule",
            "interim_financials": "has_interim_financials",
        }

        for doc_key, doc_info in READINESS_DOCUMENTS.items():
            weight = doc_info["weight"]
            doc_max += weight
            field = doc_field_map.get(doc_key, "")
            received = deal.get(field, False)
            if received:
                doc_score += weight
            doc_status.append({
                "document": doc_key,
                "label": doc_info["label"],
                "received": received,
                "weight": weight,
                "critical": doc_info["critical"],
            })

        # ── Financial Readiness ──────────────────────────────────
        financial_metrics: list[dict] = []
        financial_score = 0
        financial_max = 0

        metrics_check = [
            ("noi", "Net Operating Income", 20, True),
            ("dscr_projected", "Projected DSCR", 15, True),
            ("units", "Unit Count", 5, False),
            ("occupancy_pct", "Occupancy Rate", 10, False),
            ("revenue", "Total Revenue", 10, True),
            ("operating_expenses", "Operating Expenses", 10, False),
            ("capex_reserve", "Capital Reserve / CapEx Budget", 5, False),
            ("debt_outstanding", "Existing Debt Outstanding", 10, False),
        ]

        for field, label, weight, critical in metrics_check:
            financial_max += weight
            has_it = deal.get(field) is not None and deal.get(field, 0) != 0
            if has_it:
                financial_score += weight
            financial_metrics.append({
                "metric": field,
                "label": label,
                "available": has_it,
                "value": deal.get(field),
                "weight": weight,
                "critical": critical,
            })

        # ── Legal Readiness ──────────────────────────────────────
        legal_items: list[dict] = []
        legal_score = 0
        legal_max = 0

        legal_checks = [
            ("borrower_type", "Entity Type / Tax Status", 15, True),
            ("issuer", "Conduit Issuer Identified", 15, True),
            ("tax_exempt", "Tax Exemption Status Determined", 10, True),
            ("has_prior_bonds", "Prior Bond History Reviewed", 5, False),
            ("state_authorization", "State Authorization for Issuance", 10, False),
        ]

        for field, label, weight, critical in legal_checks:
            legal_max += weight
            has_it = deal.get(field) is not None
            if has_it:
                legal_score += weight
            legal_items.append({
                "item": field,
                "label": label,
                "available": has_it,
                "value": deal.get(field),
                "weight": weight,
                "critical": critical,
            })

        # ── Market Readiness ─────────────────────────────────────
        market_items: list[dict] = []
        market_score = 0
        market_max = 0

        market_checks = [
            ("location", "Property Location", 10, True),
            ("sector", "Sector Classification", 10, True),
            ("units", "Unit / Bed Count", 10, False),
            ("competition_analysis", "Competitive Market Analysis", 10, False),
            ("demand_indicators", "Demand / Waitlist Data", 10, False),
            ("management_track_record", "Management Track Record", 10, False),
        ]

        for field, label, weight, critical in market_checks:
            market_max += weight
            has_it = deal.get(field) is not None and deal.get(field, 0) != 0 and deal.get(field) != ""
            if has_it:
                market_score += weight
            market_items.append({
                "item": field,
                "label": label,
                "available": has_it,
                "value": deal.get(field),
                "weight": weight,
                "critical": critical,
            })

        # ── Composite Score ──────────────────────────────────────
        total_max = doc_max + financial_max + legal_max + market_max
        total_score = doc_score + financial_score + legal_score + market_score
        readiness_pct = round(total_score / total_max * 100) if total_max else 0

        # ── Blockers ─────────────────────────────────────────────
        blockers: list[dict] = []

        # Critical missing documents
        for ds in doc_status:
            if ds["critical"] and not ds["received"]:
                blockers.append({
                    "type": "document",
                    "item": ds["document"],
                    "label": ds["label"],
                    "severity": "blocker",
                    "action": f"Obtain {ds['label']}",
                })

        # Critical missing financials
        for fm in financial_metrics:
            if fm["critical"] and not fm["available"]:
                blockers.append({
                    "type": "financial",
                    "item": fm["metric"],
                    "label": fm["label"],
                    "severity": "blocker",
                    "action": f"Provide {fm['label']}",
                })

        # Critical missing legal
        for li in legal_items:
            if li["critical"] and not li["available"]:
                blockers.append({
                    "type": "legal",
                    "item": li["item"],
                    "label": li["label"],
                    "severity": "blocker",
                    "action": f"Determine {li['label']}",
                })

        # DSCR floor check
        dscr = deal.get("dscr_projected", 0)
        if dscr and dscr < UNIVERSAL_CREDIT_POLICY["financial_standards"]["min_dscr_universal_floor"]:
            blockers.append({
                "type": "credit",
                "item": "dscr_below_floor",
                "label": f"DSCR {dscr:.2f}x below 1.20x universal floor",
                "severity": "warning",
                "action": "Review structure to improve coverage or add credit enhancement",
            })

        # ── Critical Path ────────────────────────────────────────
        critical_path: list[dict] = []
        if not deal.get("has_feasibility"):
            critical_path.append({
                "item": "Feasibility Study",
                "timeline_weeks": 8,
                "action": "Engage independent accountant (Forvis Mazars, CLA)",
                "dependency": "Required before rating agency application",
            })
        if not deal.get("has_appraisal"):
            critical_path.append({
                "item": "Appraisal",
                "timeline_weeks": 4,
                "action": "Engage MAI-certified appraiser",
                "dependency": "Required for bond sizing and S&U",
            })
        if not deal.get("has_financials"):
            critical_path.append({
                "item": "Audited Financial Statements",
                "timeline_weeks": 6,
                "action": "Engage auditor for 3-year audit",
                "dependency": "Required for credit analysis and rating",
            })
        if not deal.get("issuer"):
            critical_path.append({
                "item": "Conduit Issuer",
                "timeline_weeks": 4,
                "action": "Apply to conduit issuer (state HFA, LGFC, etc.)",
                "dependency": "Required before legal documentation can begin",
            })

        return {
            "readiness_score": readiness_pct,
            "category_scores": {
                "documents": {
                    "score": doc_score,
                    "max": doc_max,
                    "pct": round(doc_score / doc_max * 100) if doc_max else 0,
                    "items": doc_status,
                },
                "financials": {
                    "score": financial_score,
                    "max": financial_max,
                    "pct": round(financial_score / financial_max * 100) if financial_max else 0,
                    "items": financial_metrics,
                },
                "legal": {
                    "score": legal_score,
                    "max": legal_max,
                    "pct": round(legal_score / legal_max * 100) if legal_max else 0,
                    "items": legal_items,
                },
                "market": {
                    "score": market_score,
                    "max": market_max,
                    "pct": round(market_score / market_max * 100) if market_max else 0,
                    "items": market_items,
                },
            },
            "blockers": blockers,
            "blocker_count": len([b for b in blockers if b["severity"] == "blocker"]),
            "warning_count": len([b for b in blockers if b["severity"] == "warning"]),
            "critical_path": critical_path,
            "estimated_weeks_to_ready": max(
                (cp["timeline_weeks"] for cp in critical_path), default=0
            ),
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ══════════════════════════════════════════════════════════════
    # PRIVATE HELPERS
    # ══════════════════════════════════════════════════════════════

    def _build_executive_summary(self, deal: dict) -> dict:
        """Build executive summary section of pitch."""
        par = deal.get("size_usd", 0)
        sector = deal.get("sector", "")
        sector_label = sector.replace("_", " ").title()

        return {
            "deal_name": deal.get("deal_name", ""),
            "par_amount": par,
            "par_amount_formatted": f"${par:,.0f}",
            "sector": sector_label,
            "deal_type": deal.get("deal_type", "").replace("_", " ").title(),
            "location": deal.get("location", ""),
            "issuer": deal.get("issuer", "TBD"),
            "tax_status": "Tax-Exempt" if deal.get("tax_exempt") else "Taxable",
            "borrower_type": deal.get("borrower_type", ""),
            "what_nest_does": (
                f"NEST Advisors will structure, underwrite, and place a "
                f"{'tax-exempt' if deal.get('tax_exempt') else 'taxable'} revenue bond offering "
                f"of approximately ${par / 1_000_000:.1f}M for {deal.get('deal_name', 'the project')}. "
                f"Our scope includes credit analysis, bond structuring, rating agency coordination, "
                f"legal documentation oversight, and Hawkeye-powered institutional placement."
            ),
            "key_metrics": {
                "noi": deal.get("noi"),
                "dscr_projected": deal.get("dscr_projected"),
                "units": deal.get("units"),
                "enhancement": deal.get("enhancement", "none"),
            },
        }

    def _build_what_we_have(self, deal: dict, readiness: dict) -> dict:
        """Build 'What We Have' section from readiness assessment."""
        received_docs = [
            item for item in readiness["category_scores"]["documents"]["items"]
            if item["received"]
        ]
        available_metrics = [
            item for item in readiness["category_scores"]["financials"]["items"]
            if item["available"]
        ]
        available_legal = [
            item for item in readiness["category_scores"]["legal"]["items"]
            if item["available"]
        ]

        return {
            "documents_received": [d["label"] for d in received_docs],
            "documents_received_count": len(received_docs),
            "financial_data_available": [
                {"metric": m["label"], "value": m["value"]}
                for m in available_metrics
            ],
            "legal_status_confirmed": [
                {"item": l["label"], "value": l["value"]}
                for l in available_legal
            ],
            "data_completeness_pct": readiness["readiness_score"],
        }

    def _build_whats_missing(self, deal: dict, readiness: dict) -> dict:
        """Build 'What's Missing' gap analysis."""
        missing_docs = [
            item for item in readiness["category_scores"]["documents"]["items"]
            if not item["received"]
        ]
        missing_metrics = [
            item for item in readiness["category_scores"]["financials"]["items"]
            if not item["available"]
        ]
        missing_legal = [
            item for item in readiness["category_scores"]["legal"]["items"]
            if not item["available"]
        ]

        return {
            "documents_needed": [
                {"document": d["label"], "critical": d["critical"]}
                for d in missing_docs
            ],
            "data_gaps": [
                {"metric": m["label"], "critical": m["critical"]}
                for m in missing_metrics
            ],
            "legal_gaps": [
                {"item": l["label"], "critical": l["critical"]}
                for l in missing_legal
            ],
            "blockers": readiness["blockers"],
            "critical_path": readiness["critical_path"],
            "total_gaps": len(missing_docs) + len(missing_metrics) + len(missing_legal),
        }

    def _build_placement_strategy(self, deal: dict, scenarios: list[dict]) -> dict:
        """Build investor placement strategy."""
        par = deal.get("size_usd", 0)
        tax_exempt = deal.get("tax_exempt", False)
        enhancement = deal.get("enhancement", "none")

        # Determine primary buyer universe
        if tax_exempt and enhancement in ("surety", "bond_insurance"):
            primary_buyers = [
                "Tax-exempt municipal bond mutual funds",
                "Insurance company general accounts",
                "Bank trust departments (CRA credit)",
                "State and local pension funds",
                "Separately managed accounts (SMAs)",
            ]
            distribution = "Broad institutional syndication"
        elif tax_exempt:
            primary_buyers = [
                "High-yield municipal funds",
                "Hedge funds with muni allocation",
                "Insurance companies (surplus lines)",
                "Family offices",
                "Specialty credit funds",
            ]
            distribution = "Targeted placement to qualified institutional buyers"
        else:
            primary_buyers = [
                "Corporate bond mutual funds",
                "Insurance companies",
                "CLO managers",
                "Private credit funds",
                "Pension funds",
            ]
            distribution = "Institutional placement via Hawkeye platform"

        return {
            "strategy": distribution,
            "primary_buyers": primary_buyers,
            "minimum_denomination": 100_000 if par > 50_000_000 else 25_000,
            "expected_investors": "8-15 institutional investors" if par > 100_000_000 else "5-10 institutional investors",
            "marketing_period_weeks": 3,
            "marketing_approach": [
                "Hawkeye AI-powered investor matching",
                "Confidential information memorandum distribution",
                "One-on-one investor presentations (virtual and in-person)",
                "Site visit coordination for interested parties",
                "Order book management and allocation",
            ],
            "hawkeye_advantage": (
                "NEST's proprietary Hawkeye platform matches deal characteristics "
                "against investor mandates, historical purchase patterns, and current "
                "appetite signals to identify the highest-probability buyers."
            ),
        }

    def _build_timeline(self, deal: dict) -> list[dict]:
        """Build deal timeline with phase-level detail."""
        timeline = []
        cumulative_weeks = 0
        today = datetime.utcnow()

        for phase in TIMELINE_TEMPLATE:
            weeks = phase["weeks"]
            # Adjust for deal specifics
            if phase["phase"] == "Third-Party Reports":
                if deal.get("has_feasibility") and deal.get("has_appraisal"):
                    weeks = 2  # just review existing
                elif deal.get("has_feasibility") or deal.get("has_appraisal"):
                    weeks = 5  # partial
            elif phase["phase"] == "Rating Agency Application":
                if deal.get("enhancement") in ("surety", "bond_insurance"):
                    weeks = max(4, weeks - 2)  # enhancement simplifies rating

            start_week = cumulative_weeks
            end_week = cumulative_weeks + weeks
            start_date = today + timedelta(weeks=start_week)
            end_date = today + timedelta(weeks=end_week)

            timeline.append({
                "phase": phase["phase"],
                "weeks": weeks,
                "start_week": start_week,
                "end_week": end_week,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "description": phase["description"],
            })
            cumulative_weeks = end_week

        return timeline

    def _build_recommendation(self, deal: dict, scenarios: list[dict], readiness: dict) -> dict:
        """Build NEST's recommendation."""
        dscr = deal.get("dscr_projected", 0)
        enhancement = deal.get("enhancement", "none")
        readiness_score = readiness.get("readiness_score", 0)
        blocker_count = readiness.get("blocker_count", 0)

        # Select recommended scenario
        if dscr >= 1.75 and enhancement in ("surety", "bond_insurance"):
            recommended = "Conservative"
            rationale = (
                f"Strong projected DSCR of {dscr:.2f}x combined with {enhancement} enhancement "
                "supports an investment-grade structure. The conservative scenario achieves "
                "the lowest cost of capital and broadest investor base."
            )
        elif dscr >= 1.35:
            recommended = "Base Case"
            rationale = (
                f"Projected DSCR of {dscr:.2f}x supports the base case structure. "
                "This balances borrower proceeds against cost of capital and "
                "provides a market-standard structure with proven investor demand."
            )
        else:
            recommended = "Aggressive"
            rationale = (
                f"Projected DSCR of {dscr:.2f}x is tight for investment-grade. "
                "Consider the aggressive structure to maximize proceeds, "
                "or explore credit enhancement to improve coverage ratios."
            )

        # Override if DSCR is strong enough for conservative
        if dscr >= 1.50 and enhancement in ("surety", "bond_insurance"):
            recommended = "Base Case"
            rationale = (
                f"DSCR of {dscr:.2f}x with {enhancement} enhancement positions this deal "
                "for a strong base case execution. The surety wrap provides rating uplift "
                "while the base structure maximizes borrower proceeds."
            )

        next_steps = [
            "Execute engagement letter and fund advisory retainer ($25,000)",
        ]
        if blocker_count > 0:
            next_steps.append(
                f"Address {blocker_count} critical blocker(s) identified in readiness assessment"
            )
        next_steps.extend([
            "Schedule kickoff call and initial document request",
            "Engage bond counsel and begin legal workstream",
            "Commission any outstanding third-party reports",
        ])

        return {
            "recommended_scenario": recommended,
            "rationale": rationale,
            "readiness_score": readiness_score,
            "readiness_assessment": (
                "Deal is substantially ready for engagement"
                if readiness_score >= 60
                else "Additional preparation needed before formal engagement"
            ),
            "next_steps": next_steps,
            "nest_commitment": (
                "NEST Advisors is prepared to move immediately upon engagement. "
                "Our team will dedicate senior resources to this transaction and "
                "leverage our full platform — Intelligence Engine, Hawkeye placement, "
                "and EMMA compliance — to deliver optimal execution."
            ),
        }

    def _deal_purpose_text(self, deal: dict) -> str:
        """Generate purpose text for engagement letter."""
        deal_type = deal.get("deal_type", "")
        deal_name = deal.get("deal_name", "the project")

        purposes = {
            "refi": f"Refinancing of existing indebtedness for {deal_name}",
            "construction": f"New construction financing for {deal_name}",
            "acquisition": f"Acquisition financing for {deal_name}",
            "new_development": f"Development financing for {deal_name}",
            "expansion": f"Expansion and capital improvement financing for {deal_name}",
        }
        return purposes.get(deal_type, f"Financing for {deal_name}")

    # ── Math Helpers ─────────────────────────────────────────────

    def _compute_annual_debt_service(
        self, par: float, rate: float, term_years: int, io_years: int = 0
    ) -> float:
        """Compute annual debt service (level debt service after IO).

        Uses standard mortgage-style amortization formula:
        PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
        """
        if par <= 0 or rate <= 0 or term_years <= 0:
            return 0.0

        amort_years = term_years - io_years
        if amort_years <= 0:
            # All IO
            return par * rate

        # Level debt service (P&I) on remaining amortization period
        r = rate  # annual rate
        n = amort_years
        if r == 0:
            return par / n

        pmt = par * (r * (1 + r) ** n) / ((1 + r) ** n - 1)
        return round(pmt, 2)

    def _build_amortization_schedule(
        self, par: float, rate: float, term_years: int, io_years: int = 0
    ) -> dict:
        """Build year-by-year amortization for first 10 years."""
        schedule: list[dict] = []
        balance = par
        annual_ds = self._compute_annual_debt_service(par, rate, term_years, io_years)
        amort_years = term_years - io_years

        for year in range(1, min(11, term_years + 1)):
            if year <= io_years:
                # Interest-only period
                interest = round(balance * rate)
                principal = 0
                ds = interest
            else:
                # Amortizing period
                interest = round(balance * rate)
                principal = round(annual_ds - interest) if annual_ds > interest else 0
                ds = round(interest + principal)

            balance = max(0, balance - principal)

            schedule.append({
                "year": year,
                "beginning_balance": round(balance + principal),
                "interest": interest,
                "principal": principal,
                "debt_service": ds,
                "ending_balance": round(balance),
            })

        return {
            "type": f"{io_years}yr IO then {amort_years}yr level debt service" if io_years else f"{term_years}yr level debt service",
            "io_period_years": io_years,
            "amortization_period_years": amort_years,
            "annual_debt_service_after_io": round(annual_ds),
            "schedule_first_10_years": schedule,
        }

    def _build_call_schedule(self, nc_years: int = 10, start_premium: int = 2) -> list[dict]:
        """Build call schedule with step-down premiums.

        Standard muni structure: NC-10, then step-down to par.
        """
        schedule = [
            {"period": f"Years 1-{nc_years}", "call_price": "Non-callable", "premium_pct": None}
        ]

        premium = start_premium
        year = nc_years + 1
        while premium > 0:
            schedule.append({
                "period": f"Year {year}",
                "call_price": 100 + premium,
                "premium_pct": premium,
            })
            premium -= 1
            year += 1

        schedule.append({
            "period": f"Year {year}+",
            "call_price": 100,
            "premium_pct": 0,
        })

        return schedule

    def _spread_decomposition(
        self, base_rate: float, rating: str, enhancement: str,
        tax_exempt: bool, par_amount: float = 0
    ) -> dict:
        """Decompose all-in yield into component spreads."""
        # Credit spread from benchmarks
        benchmarks = PRICING_BENCHMARKS.get(rating, PRICING_BENCHMARKS.get("BB", {}))
        credit_spread_low = benchmarks.get("spread_bps", (200, 350))[0]
        credit_spread_high = benchmarks.get("spread_bps", (200, 350))[1]
        credit_spread_mid = (credit_spread_low + credit_spread_high) // 2

        # Enhancement benefit
        enhancement_benefit_bps = 0
        if enhancement in ("surety", "bond_insurance"):
            enhancement_benefit_bps = -50  # 50bps tighter with enhancement
        elif enhancement == "lc":
            enhancement_benefit_bps = -30

        # Illiquidity premium (for smaller or non-standard deals)
        illiquidity_bps = 0
        if par_amount < 50_000_000:
            illiquidity_bps = 25
        if par_amount < 25_000_000:
            illiquidity_bps = 50

        # Tax-exempt adjustment (already in base rate via MMD)
        tax_exempt_note = "Base rate uses MMD (tax-exempt benchmark)" if tax_exempt else "Base rate uses Treasury (taxable benchmark)"

        total_spread = credit_spread_mid + enhancement_benefit_bps + illiquidity_bps
        all_in_yield = round(base_rate + total_spread / 100, 3)

        return {
            "base_rate": {
                "rate_pct": base_rate,
                "benchmark": "30yr AAA MMD" if tax_exempt else "30yr Treasury",
                "note": tax_exempt_note,
            },
            "credit_spread_bps": {
                "low": credit_spread_low,
                "mid": credit_spread_mid,
                "high": credit_spread_high,
                "basis": f"Implied {rating} rating",
            },
            "enhancement_benefit_bps": enhancement_benefit_bps,
            "illiquidity_premium_bps": illiquidity_bps,
            "total_spread_bps": total_spread,
            "all_in_yield_pct": all_in_yield,
        }
