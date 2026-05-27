"""
NEST Intelligence Engine — Bond sizing, underwriting, structuring, pricing.

Implements the math from the Operating Framework + Use Case Manual Ch.1.
Each use case (M&A, Construction, Working Capital, Equipment, Real Estate)
follows the six-layer template but with different parameters.

This engine is the core product — it takes deal inputs and produces
a fully structured bond with sizing, pricing, covenants, and reserves.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from services.rating_benchmarks import (
    score_sp_financial_risk,
    score_moodys_financial,
    get_structuring_targets,
    SP_ANCHOR_MATRIX,
    SP_FINANCIAL_RISK_BENCHMARKS,
    MOODYS_FINANCIAL_METRICS,
    STRUCTURING_CRITERIA,
    REQUIRED_FINANCIAL_DATA,
    SP_ENHANCEMENT_OVERRIDES,
    SP_RECOVERY_RATINGS,
)


# ── NAICS-Driven Sector Intelligence ─────────────────────────

SECTOR_MULTIPLES = {
    "software_saas": {"range": (8, 15), "metric": "EBITDA", "alt_metric": "ARR", "alt_range": (4, 10)},
    "healthcare_services": {"range": (8, 14), "metric": "EBITDA"},
    "business_services": {"range": (6, 10), "metric": "EBITDA"},
    "industrial_manufacturing": {"range": (6, 9), "metric": "EBITDA"},
    "distribution": {"range": (6, 8), "metric": "EBITDA"},
    "consumer_products": {"range": (8, 12), "metric": "EBITDA"},
    "trucking_logistics": {"range": (4, 6), "metric": "EBITDA"},
    "specialty_contractors": {"range": (5, 7), "metric": "EBITDA"},
    "energy_services": {"range": (4, 7), "metric": "EBITDA"},
    "financial_services": {"range": (8, 12), "metric": "EBITDA"},
    "senior_living": {"range": (8, 12), "metric": "EBITDA"},
    "hospitality": {"range": (8, 12), "metric": "EBITDA"},
    "data_centers": {"range": (12, 20), "metric": "EBITDA"},
    "real_estate": {"range": (10, 16), "metric": "NOI", "cap_rate_range": (5.0, 8.0)},
    "biotech_pharma": {"range": (12, 25), "metric": "EBITDA", "note": "Pre-revenue valued on pipeline/platform"},
    "defense_gov": {"range": (10, 18), "metric": "EBITDA", "note": "Contract-driven, recurring revenue"},
    "technology": {"range": (10, 20), "metric": "EBITDA", "alt_metric": "ARR", "alt_range": (5, 15)},
}

SECTOR_LEVERAGE_CAPACITY = {
    "software_saas": {"senior": 4.0, "total": 6.5, "quality": "high"},
    "healthcare_services": {"senior": 4.0, "total": 6.5, "quality": "high"},
    "business_services": {"senior": 3.5, "total": 5.5, "quality": "mid"},
    "industrial_manufacturing": {"senior": 3.5, "total": 5.5, "quality": "mid"},
    "distribution": {"senior": 3.0, "total": 5.0, "quality": "mid"},
    "consumer_products": {"senior": 3.5, "total": 5.5, "quality": "mid"},
    "trucking_logistics": {"senior": 2.5, "total": 4.0, "quality": "low"},
    "specialty_contractors": {"senior": 2.5, "total": 4.5, "quality": "low"},
    "energy_services": {"senior": 2.5, "total": 4.0, "quality": "low"},
    "financial_services": {"senior": 4.0, "total": 6.0, "quality": "high"},
    "senior_living": {"senior": 3.5, "total": 5.5, "quality": "mid"},
    "hospitality": {"senior": 3.0, "total": 5.0, "quality": "mid"},
    "data_centers": {"senior": 4.5, "total": 7.0, "quality": "high"},
    "real_estate": {"senior": 3.5, "total": 5.5, "quality": "mid"},
}

# ── Universal Credit Policy (Appendix F) ─────────────────────

UNIVERSAL_CREDIT_POLICY = {
    "sponsor_standards": {
        "min_experience_years_new_construction": 7,
        "min_experience_years_stabilized": 3,
        "kyc_aml_required": True,
        "ofac_screening_required": True,
        "pep_screening_required": True,
        "max_default_lookback_years": 5,
        "tax_filings_current_required": True,
    },
    "financial_standards": {
        "min_dscr_universal_floor": 1.20,
        "min_debt_yield_universal_floor": 0.08,
        "max_leverage_universal_ceiling": 0.80,
        "min_equity_contribution_universal_floor": 0.20,
        "dsrf_default": "MADS",
        "operating_reserve_months": 3,
    },
    "structural_standards": {
        "security_position": "first_lien",
        "maturity_range_tax_exempt": (20, 30),
        "maturity_range_taxable": (5, 30),
        "covenant_minimums": ["dscr", "additional_bonds_test", "distribution_restrictions", "reporting"],
        "cash_sweep_trigger_dscr": 1.20,
    },
    "exception_authority": {
        "minor": "Senior Credit Underwriter Agent approves with documentation",
        "moderate": "CCO + founders escalation",
        "material": "Founders explicit approval required",
    },
}

# ── Pricing Benchmarks ───────────────────────────────────────

PRICING_BENCHMARKS = {
    "AAA": {"spread_bps": (20, 50), "coupon_range": (3.50, 4.50)},
    "AA": {"spread_bps": (40, 80), "coupon_range": (4.00, 5.00)},
    "A": {"spread_bps": (80, 140), "coupon_range": (4.50, 5.75)},
    "BBB": {"spread_bps": (130, 220), "coupon_range": (5.25, 6.75)},
    "BB": {"spread_bps": (250, 400), "coupon_range": (7.00, 9.00)},
    "B": {"spread_bps": (400, 650), "coupon_range": (8.50, 11.00)},
}

# ── Fee Architecture ─────────────────────────────────────────

FEE_SCHEDULE = {
    "structuring_fee_pct": (0.02, 0.03),
    "placement_fee_pct": (0.005, 0.01),
    "ongoing_admin_fee_bps": (50, 75),
    "commitment_fee_bps": (25, 50),
}


class IntelligenceEngine:
    """Core bond intelligence — sizing, underwriting, structuring, pricing."""

    # ── M&A Acquisition Bond Sizing (Ch.1) ────────────────────

    def size_ma_acquisition(self, inputs: dict) -> dict:
        """Size an M&A acquisition bond per Use Case Manual Ch.1.

        Required inputs:
            ebitda: float — trailing 12-month adjusted EBITDA
            sector: str — sector key from SECTOR_MULTIPLES
            acquisition_multiple: float — agreed EV/EBITDA multiple
            sponsor_equity_pct: float — sponsor equity as % of EV (default 0.30)
            rollover_equity: float — rollover equity amount (default 0)
            seller_note: float — seller financing amount (default 0)
            net_debt_at_close: float — target's existing debt being refinanced (default 0)
            transaction_expenses: float — legal, accounting, advisory (default 0)
            working_capital_cushion: float — additional WC (default 0)
        """
        ebitda = inputs.get("ebitda", 0)
        sector = inputs.get("sector", "business_services")
        mult = inputs.get("acquisition_multiple", 0)
        sponsor_pct = inputs.get("sponsor_equity_pct", 0.30)
        rollover = inputs.get("rollover_equity", 0)
        seller_note = inputs.get("seller_note", 0)
        net_debt = inputs.get("net_debt_at_close", 0)
        tx_expenses = inputs.get("transaction_expenses", 0)
        wc_cushion = inputs.get("working_capital_cushion", 0)

        # Validate sector
        sector_data = SECTOR_MULTIPLES.get(sector, SECTOR_MULTIPLES["business_services"])
        leverage_data = SECTOR_LEVERAGE_CAPACITY.get(sector, SECTOR_LEVERAGE_CAPACITY["business_services"])

        # Enterprise value
        ev = ebitda * mult
        equity_value = ev - net_debt

        # Senior leverage capacity
        senior_leverage = leverage_data["senior"]
        max_senior_bond = ebitda * senior_leverage

        # Sponsor equity check
        sponsor_equity = ev * sponsor_pct

        # Bond sizing = EV - sponsor equity - rollover - seller note
        bond_needed = ev - sponsor_equity - rollover - seller_note
        bond_amount = min(bond_needed, max_senior_bond)

        # Total leverage
        total_leverage = (bond_amount + seller_note) / ebitda if ebitda else 0

        # Reserves
        annual_debt_service = bond_amount * 0.085  # estimated at indicative coupon
        dsrf = annual_debt_service  # MADS
        cap_i_reserve = annual_debt_service * 1.5  # 18 months IO
        closing_reserves = dsrf + cap_i_reserve

        # Cost of issuance
        coi = bond_amount * 0.025

        # Sources and Uses
        total_sources = bond_amount + seller_note + sponsor_equity + rollover
        total_uses = equity_value + net_debt + tx_expenses + closing_reserves + coi + wc_cushion

        # Balance check — adjust bond if needed
        gap = total_uses - total_sources
        if gap > 0:
            bond_amount += gap
            total_sources += gap

        sources = {
            "senior_bond": round(bond_amount),
            "seller_note": round(seller_note),
            "sponsor_equity": round(sponsor_equity),
            "rollover_equity": round(rollover),
            "total": round(total_sources),
        }

        uses = {
            "equity_purchase_price": round(equity_value),
            "debt_refinancing": round(net_debt),
            "transaction_expenses": round(tx_expenses),
            "closing_reserves": round(closing_reserves),
            "cost_of_issuance": round(coi),
            "working_capital_cushion": round(wc_cushion),
            "total": round(total_uses),
        }

        # Credit assessment
        dscr = ebitda / annual_debt_service if annual_debt_service else 0
        credit_grade = self._grade_credit(dscr, total_leverage)

        # Pricing
        pricing = PRICING_BENCHMARKS.get(credit_grade, PRICING_BENCHMARKS["BB"])

        return {
            "use_case": "ma_acquisition",
            "sector": sector,
            "sector_quality": leverage_data["quality"],
            "valuation": {
                "ebitda": ebitda,
                "multiple": mult,
                "sector_multiple_range": sector_data["range"],
                "multiple_in_range": sector_data["range"][0] <= mult <= sector_data["range"][1],
                "enterprise_value": round(ev),
                "equity_value": round(equity_value),
            },
            "capital_structure": {
                "senior_bond": round(bond_amount),
                "senior_leverage": round(bond_amount / ebitda, 2) if ebitda else 0,
                "max_senior_leverage": senior_leverage,
                "total_leverage": round(total_leverage, 2),
                "max_total_leverage": leverage_data["total"],
                "leverage_headroom": round(leverage_data["total"] - total_leverage, 2),
                "equity_pct_of_ev": round(sponsor_pct * 100, 1),
            },
            "sources_and_uses": {"sources": sources, "uses": uses, "balanced": abs(total_sources - total_uses) < 1},
            "bond_structure": {
                "type": "taxable_senior_secured",
                "principal": round(bond_amount),
                "tenor_years": 7,
                "coupon_range": pricing["coupon_range"],
                "spread_range_bps": pricing["spread_bps"],
                "amortization": "18mo_io_then_1pct_annual_then_bullet",
                "call_schedule": {"nc_years": 3, "step_down_premium": True, "par_call_after_year": 5},
            },
            "reserves": {
                "dsrf": round(dsrf),
                "dsrf_type": "MADS",
                "cap_i_reserve": round(cap_i_reserve),
                "cap_i_months": 18,
            },
            "credit": {
                "dscr": round(dscr, 2),
                "grade": credit_grade,
                "meets_universal_floor": dscr >= UNIVERSAL_CREDIT_POLICY["financial_standards"]["min_dscr_universal_floor"],
            },
            "fees": {
                "structuring_fee": round(bond_amount * 0.025),
                "structuring_fee_pct": 2.5,
                "placement_fee": round(bond_amount * 0.0075),
                "placement_fee_pct": 0.75,
                "ongoing_admin_bps": 62.5,
            },
            "readiness_flags": self._ma_readiness_flags(inputs, dscr, total_leverage, leverage_data),
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── Universal Bond Sizing ─────────────────────────────────

    def size_bond(self, inputs: dict) -> dict:
        """Size a bond for any use case based on deal type."""
        deal_type = inputs.get("deal_type", "ma_acquisition")
        if deal_type == "ma_acquisition":
            return self.size_ma_acquisition(inputs)
        elif deal_type == "construction":
            return self._size_construction(inputs)
        elif deal_type == "working_capital":
            return self._size_working_capital(inputs)
        elif deal_type == "equipment":
            return self._size_equipment(inputs)
        elif deal_type == "real_estate":
            return self._size_real_estate(inputs)
        elif deal_type in ("equity_raise", "equity", "m_and_a_equity"):
            return self.size_equity_raise(inputs)
        return {"error": f"Unknown deal type: {deal_type}"}

    def _size_construction(self, inputs: dict) -> dict:
        """Construction & Development bond sizing (Ch.2 template — spec pending)."""
        tpc = inputs.get("total_project_cost", 0)
        ltc = inputs.get("ltc_ratio", 0.75)
        bond_amount = tpc * ltc
        equity = tpc - bond_amount
        return {
            "use_case": "construction",
            "total_project_cost": tpc,
            "bond_amount": round(bond_amount),
            "ltc_ratio": ltc,
            "equity_required": round(equity),
            "amortization": "interest_only_during_construction_then_level_debt_service",
            "note": "Full spec pending Use Case Manual Ch.2",
            "generated_at": datetime.utcnow().isoformat(),
        }

    def size_equity_raise(self, inputs: dict) -> dict:
        """Size an equity raise / M&A investment — learned from HBO2 deal.

        Handles: primary equity, secondary purchases, control vs minority,
        MOIC/IRR projections, cap table, liquidation preferences.
        """
        pre_money = inputs.get("pre_money_valuation", 0)
        primary_equity = inputs.get("primary_equity", 0)
        secondary = inputs.get("secondary_purchases", 0)
        total_investment = primary_equity + secondary
        post_money = pre_money + primary_equity

        # Ownership
        primary_ownership = primary_equity / post_money if post_money else 0
        total_ownership = (primary_equity + secondary) / post_money if post_money else 0
        control = total_ownership > 0.50

        # Revenue/EBITDA projections
        revenue_at_maturity = inputs.get("revenue_at_maturity", 0)
        ebitda_at_maturity = inputs.get("ebitda_at_maturity", 0)
        ebitda_margin = ebitda_at_maturity / revenue_at_maturity if revenue_at_maturity else 0
        exit_multiple = inputs.get("exit_multiple", 12.0)
        hold_period = inputs.get("hold_period_years", 5)

        # Exit valuation
        exit_ev = ebitda_at_maturity * exit_multiple
        investor_exit_value = exit_ev * total_ownership
        moic = investor_exit_value / total_investment if total_investment else 0
        irr = (moic ** (1 / hold_period) - 1) if hold_period and moic > 0 else 0

        # Downside scenario
        downside_multiple = inputs.get("downside_multiple", 8.0)
        downside_ev = ebitda_at_maturity * 0.6 * downside_multiple  # 60% of base EBITDA
        downside_investor = downside_ev * total_ownership
        downside_moic = downside_investor / total_investment if total_investment else 0

        # Upside scenario
        upside_multiple = inputs.get("upside_multiple", 15.0)
        upside_ev = ebitda_at_maturity * 1.5 * upside_multiple  # 150% of base EBITDA
        upside_investor = upside_ev * total_ownership
        upside_moic = upside_investor / total_investment if total_investment else 0

        # Use of proceeds
        uses = inputs.get("use_of_proceeds", {})
        if not uses and primary_equity:
            uses = {
                "facility_construction": round(primary_equity * 0.40),
                "rd_and_trials": round(primary_equity * 0.30),
                "working_capital": round(primary_equity * 0.20),
                "reserves": round(primary_equity * 0.10),
            }

        return {
            "use_case": "equity_raise",
            "deal_type": "control_equity" if control else "minority_equity",
            "valuation": {
                "pre_money": pre_money,
                "post_money": post_money,
                "primary_equity": primary_equity,
                "secondary_purchases": secondary,
                "total_investment": total_investment,
            },
            "ownership": {
                "primary_pct": round(primary_ownership * 100, 1),
                "total_pct": round(total_ownership * 100, 1),
                "control": control,
                "governance": "Full board control + capital allocation" if control else "Board seats + protective provisions",
            },
            "projections": {
                "revenue_at_maturity": revenue_at_maturity,
                "ebitda_at_maturity": ebitda_at_maturity,
                "ebitda_margin": round(ebitda_margin * 100, 1),
                "exit_multiple": exit_multiple,
                "hold_period_years": hold_period,
            },
            "returns": {
                "base_case": {
                    "exit_ev": round(exit_ev),
                    "investor_value": round(investor_exit_value),
                    "moic": round(moic, 1),
                    "irr": round(irr * 100, 1),
                },
                "downside": {
                    "exit_ev": round(downside_ev),
                    "investor_value": round(downside_investor),
                    "moic": round(downside_moic, 1),
                },
                "upside": {
                    "exit_ev": round(upside_ev),
                    "investor_value": round(upside_investor),
                    "moic": round(upside_moic, 1),
                },
            },
            "use_of_proceeds": uses,
            "risk_factors": self._equity_risk_factors(inputs),
            "generated_at": datetime.utcnow().isoformat(),
        }

    def _equity_risk_factors(self, inputs: dict) -> list[dict]:
        """Generate risk factors for equity deals."""
        risks = []
        sector = inputs.get("sector", "")

        if "biotech" in sector or "pharma" in sector or inputs.get("fda_required"):
            risks.append({"risk": "Regulatory/FDA approval risk", "severity": "high", "mitigant": "Late-stage platform, defined approval pathway"})
            risks.append({"risk": "Clinical trial execution risk", "severity": "high", "mitigant": "Manufacturing facility de-risks supply chain"})

        if inputs.get("pre_revenue", True):
            risks.append({"risk": "Pre-revenue — no operating cash flow", "severity": "high", "mitigant": "Capital deployed to defined milestones"})

        if inputs.get("single_product", True):
            risks.append({"risk": "Single product concentration", "severity": "medium", "mitigant": "Platform technology with multiple applications"})

        if inputs.get("government_contract_dependent"):
            risks.append({"risk": "Government/DOD contract dependency", "severity": "medium", "mitigant": "Critical infrastructure designation, bipartisan support"})

        risks.append({"risk": "Execution risk on facility completion", "severity": "medium", "mitigant": "Defined budget and timeline, experienced operators"})
        risks.append({"risk": "Market/exit timing risk", "severity": "medium", "mitigant": "Multiple exit paths: IPO, strategic sale, sponsor recap"})

        return risks

    def _size_working_capital(self, inputs: dict) -> dict:
        """Working Capital bond sizing (Ch.3 template — spec pending)."""
        revenue = inputs.get("annual_revenue", 0)
        wc_pct = inputs.get("wc_pct_revenue", 0.15)
        bond_amount = revenue * wc_pct
        return {
            "use_case": "working_capital",
            "annual_revenue": revenue,
            "bond_amount": round(bond_amount),
            "wc_pct_revenue": wc_pct,
            "structure": "revolving_or_term",
            "note": "Full spec pending Use Case Manual Ch.3",
            "generated_at": datetime.utcnow().isoformat(),
        }

    def _size_equipment(self, inputs: dict) -> dict:
        """Equipment bond sizing (Ch.4 template — spec pending)."""
        equipment_cost = inputs.get("equipment_cost", 0)
        ltv = inputs.get("ltv_ratio", 0.80)
        useful_life = inputs.get("useful_life_years", 7)
        bond_amount = equipment_cost * ltv
        return {
            "use_case": "equipment",
            "equipment_cost": equipment_cost,
            "bond_amount": round(bond_amount),
            "ltv_ratio": ltv,
            "tenor_years": useful_life,
            "amortization": "straight_line_matched_to_depreciation",
            "note": "Full spec pending Use Case Manual Ch.4",
            "generated_at": datetime.utcnow().isoformat(),
        }

    def _size_real_estate(self, inputs: dict) -> dict:
        """Real Estate Acquisition & Stabilization bond sizing (Ch.5 template — spec pending)."""
        noi = inputs.get("noi", 0)
        cap_rate = inputs.get("cap_rate", 0.065)
        ltv = inputs.get("ltv_ratio", 0.70)
        property_value = noi / cap_rate if cap_rate else 0
        bond_amount = property_value * ltv
        dscr = noi / (bond_amount * 0.06) if bond_amount else 0  # estimated at 6% coupon
        return {
            "use_case": "real_estate",
            "noi": noi,
            "cap_rate": cap_rate,
            "property_value": round(property_value),
            "bond_amount": round(bond_amount),
            "ltv_ratio": ltv,
            "estimated_dscr": round(dscr, 2),
            "amortization": "level_debt_service_30yr",
            "note": "Full spec pending Use Case Manual Ch.5",
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── Underwriting Assessment ───────────────────────────────

    def underwrite(self, deal: dict) -> dict:
        """Run Universal Credit Policy against a deal."""
        policy = UNIVERSAL_CREDIT_POLICY
        flags = []

        dscr = deal.get("dscr", 0)
        leverage = deal.get("total_leverage", 0)
        equity_pct = deal.get("equity_pct", 0)
        sponsor_experience = deal.get("sponsor_experience_years", 0)
        deal_type = deal.get("deal_type", "stabilized")

        min_exp = policy["sponsor_standards"]["min_experience_years_new_construction"] if deal_type == "construction" else policy["sponsor_standards"]["min_experience_years_stabilized"]

        if dscr < policy["financial_standards"]["min_dscr_universal_floor"]:
            flags.append({"field": "dscr", "value": dscr, "threshold": 1.20, "severity": "material", "message": f"DSCR {dscr:.2f}x below universal floor of 1.20x"})

        if leverage > 1 / policy["financial_standards"]["min_equity_contribution_universal_floor"]:
            flags.append({"field": "leverage", "value": leverage, "threshold": 5.0, "severity": "moderate", "message": f"Total leverage {leverage:.1f}x exceeds implied ceiling"})

        if equity_pct < policy["financial_standards"]["min_equity_contribution_universal_floor"]:
            flags.append({"field": "equity_pct", "value": equity_pct, "threshold": 0.20, "severity": "material", "message": f"Equity contribution {equity_pct:.0%} below 20% floor"})

        if sponsor_experience < min_exp:
            flags.append({"field": "sponsor_experience", "value": sponsor_experience, "threshold": min_exp, "severity": "moderate", "message": f"Sponsor experience {sponsor_experience}yr below {min_exp}yr minimum"})

        passed = all(f["severity"] != "material" for f in flags)

        return {
            "passed": passed,
            "flags": flags,
            "flag_count": len(flags),
            "material_flags": sum(1 for f in flags if f["severity"] == "material"),
            "exception_required": not passed,
            "exception_authority": policy["exception_authority"]["material"] if not passed else None,
        }

    # ── Credit Grading — Real S&P/Moody's Benchmarks ─────────

    def _grade_credit(self, dscr: float, leverage: float) -> str:
        """Grade credit using REAL S&P/Moody's published benchmarks.

        Uses S&P Financial Risk Profile (Debt/EBITDA thresholds) as primary,
        cross-referenced with Moody's Debt/EBITDA ranges. The more conservative
        of the two agencies determines the grade.
        """
        # S&P scoring
        sp_result = score_sp_financial_risk({
            "ffo_to_debt": dscr * 0.15 if dscr else 0,  # Approximate FFO/Debt from DSCR
            "debt_to_ebitda": leverage,
        })
        sp_score = sp_result["combined_score"]

        # Moody's scoring
        moodys_result = score_moodys_financial({
            "debt_to_ebitda": leverage,
            "ebitda_minus_capex_to_interest": dscr * 2.5 if dscr else 0,  # Approximate
        })

        # Map S&P financial risk score to rating grade (using anchor with moderate business risk)
        sp_anchor = SP_ANCHOR_MATRIX.get((3, sp_score), "BBB")  # Assume satisfactory business risk

        # Map Moody's
        moodys_leverage = moodys_result.get("debt_to_ebitda", {}).get("implied_rating", "Baa")
        moodys_map = {"Aaa": "AAA", "Aa": "AA", "A": "A", "Baa": "BBB", "Ba": "BB", "B": "B", "Caa": "CCC"}
        moodys_equiv = moodys_map.get(moodys_leverage, "BB")

        # Take the more conservative (S&P anchor vs Moody's implied)
        rating_order = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB", "BB-", "B+", "B", "B-", "CCC"]

        sp_idx = rating_order.index(sp_anchor) if sp_anchor in rating_order else 9
        m_idx = rating_order.index(moodys_equiv) if moodys_equiv in rating_order else 9
        conservative_idx = max(sp_idx, m_idx)

        # Return simplified grade (no +/-)
        result = rating_order[min(conservative_idx, len(rating_order) - 1)]
        for grade in ["AAA", "AA", "A", "BBB", "BB", "B", "CCC"]:
            if result.startswith(grade):
                return grade
        return "BB"

    def full_rating_analysis(self, financials: dict) -> dict:
        """Run complete S&P + Moody's analysis with all ratios.

        This is the comprehensive analysis that uses every ratio both agencies publish.
        Should be called after Roots has extracted all financial data from client docs.
        """
        sp_result = score_sp_financial_risk(financials)
        moodys_result = score_moodys_financial(financials)

        # S&P anchor (assume moderate business risk unless provided)
        business_risk = financials.get("sp_business_risk_score", 3)
        financial_risk = sp_result["combined_score"]
        anchor = SP_ANCHOR_MATRIX.get((business_risk, financial_risk), "BBB")

        # Enhancement impact
        enhancement = financials.get("enhancement", "none")
        if enhancement in SP_ENHANCEMENT_OVERRIDES:
            enhancement_note = SP_ENHANCEMENT_OVERRIDES[enhancement]
        else:
            enhancement_note = None

        # Structuring targets for the predicted rating
        target_grade = anchor.rstrip("+-").replace("+", "").replace("-", "")
        structuring = get_structuring_targets(target_grade)

        return {
            "sp_analysis": {
                "financial_risk_profile": sp_result,
                "business_risk_score": business_risk,
                "anchor": anchor,
                "enhancement_impact": enhancement_note,
            },
            "moodys_analysis": {
                "financial_metrics": moodys_result,
            },
            "predicted_rating": anchor,
            "structuring_targets": structuring,
            "required_data_checklist": {
                k: [f for f in v if financials.get(f) is None]
                for k, v in REQUIRED_FINANCIAL_DATA.items()
                if isinstance(v, list)
            },
        }

    def optimize_structure(self, financials: dict, scenarios: list[dict] = None) -> list[dict]:
        """Run multiple structuring scenarios and compare rating outcomes.

        Each scenario modifies the base financials (e.g., add surety, tighten covenants,
        increase equity) and re-scores to show the rating impact.
        """
        if not scenarios:
            scenarios = [
                {"name": "Base Case", "changes": {}},
                {"name": "Add Bond Insurance (BAM)", "changes": {"enhancement": "bond_insurance"}},
                {"name": "Add Cash-Collateralized LC", "changes": {"enhancement": "cash_collateralized_lc"}},
                {"name": "Increase Equity to 35%", "changes": {"equity_pct": 0.35}},
                {"name": "Tighten DSCR Covenant to 1.25x", "changes": {"dscr_covenant": 1.25}},
            ]

        results = []
        for scenario in scenarios:
            modified = {**financials, **scenario.get("changes", {})}
            analysis = self.full_rating_analysis(modified)
            results.append({
                "scenario": scenario["name"],
                "changes": scenario.get("changes", {}),
                "predicted_rating": analysis["predicted_rating"],
                "sp_financial_risk": analysis["sp_analysis"]["financial_risk_profile"]["combined_category"],
                "enhancement_impact": analysis["sp_analysis"]["enhancement_impact"],
                "structuring_targets": analysis["structuring_targets"],
            })
        return results

    # ── M&A Readiness Flags ───────────────────────────────────

    def _ma_readiness_flags(self, inputs: dict, dscr: float, leverage: float, leverage_data: dict) -> list[dict]:
        """Acquirer Readiness Checklist per Use Case Manual Ch.1 Section 3.3."""
        flags = []

        if leverage > leverage_data["total"]:
            flags.append({"check": "leverage_capacity", "status": "fail", "message": f"Total leverage {leverage:.1f}x exceeds sector maximum {leverage_data['total']}x"})
        else:
            flags.append({"check": "leverage_capacity", "status": "pass", "message": f"Leverage {leverage:.1f}x within sector capacity {leverage_data['total']}x"})

        equity_pct = inputs.get("sponsor_equity_pct", 0)
        if equity_pct < 0.25:
            flags.append({"check": "equity_contribution", "status": "fail", "message": f"Sponsor equity {equity_pct:.0%} below 25% minimum"})
        else:
            flags.append({"check": "equity_contribution", "status": "pass", "message": f"Sponsor equity {equity_pct:.0%} meets 25% minimum"})

        if dscr < 1.20:
            flags.append({"check": "dscr_floor", "status": "fail", "message": f"DSCR {dscr:.2f}x below 1.20x universal floor"})
        else:
            flags.append({"check": "dscr_floor", "status": "pass", "message": f"DSCR {dscr:.2f}x meets 1.20x floor"})

        mult = inputs.get("acquisition_multiple", 0)
        sector = inputs.get("sector", "business_services")
        sector_range = SECTOR_MULTIPLES.get(sector, {}).get("range", (0, 99))
        if mult > sector_range[1]:
            flags.append({"check": "valuation", "status": "warn", "message": f"Multiple {mult}x above sector range ({sector_range[0]}-{sector_range[1]}x)"})
        else:
            flags.append({"check": "valuation", "status": "pass", "message": f"Multiple {mult}x within sector range"})

        return flags

    # ── Covenant Package Builder ──────────────────────────────

    def build_covenant_package(self, deal_type: str, credit_grade: str, sector: str) -> dict:
        """Build a covenant package based on deal type, credit grade, and sector."""
        base_dscr = {"A": 1.25, "BBB": 1.20, "BB": 1.15, "B": 1.10}.get(credit_grade, 1.20)

        package = {
            "dscr_covenant": base_dscr,
            "additional_bonds_test": f"{base_dscr}x historical, {base_dscr - 0.10:.2f}x projected",
            "restricted_payments": "standard" if credit_grade in ("A", "BBB") else "tight",
            "distribution_trap_dscr": base_dscr - 0.10,
            "reporting": {
                "annual_audited": True,
                "quarterly_unaudited": True,
                "emma_continuing_disclosure": True,
                "material_event_notice": True,
            },
        }

        if deal_type == "ma_acquisition":
            package["acquisition_coverage_test"] = {
                "max_pro_forma_leverage": 5.5,
                "min_fixed_charge_coverage": 2.0,
                "equity_contribution_required": True,
            }
            package["permitted_acquisition_basket"] = "same sector, <$25M individually"
            package["change_of_control_put"] = 101
            package["integration_covenant_holiday_months"] = 18

        elif deal_type == "construction":
            package["construction_completion_deadline"] = True
            package["cost_overrun_reserve"] = "5% of hard costs"
            package["capitalized_interest_reserve"] = True

        return package
