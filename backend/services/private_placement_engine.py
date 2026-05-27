"""
NEST Private Placement Engine — converts deals that cannot achieve
investment-grade ratings or are too small for public bond markets
into structured private placement instruments.

Handles: sub-$10M deals, pre-revenue companies, single-asset
concentrations, speculative sectors, and weak credit profiles.
Produces term sheets, pricing, offering memos, and hybrid structures
that split bondable pieces from PP pieces.

Seeded with Celebrity Crush / Vertical Games as test case.

Feeds Into:
- HawkeyePlacement — investor matching and order book
- Intelligence Engine — bond sizing fallback path
- Bond Desk — hybrid deal structuring
- Bernard — term sheet narration and deal routing
"""
from __future__ import annotations

from datetime import datetime
from typing import Any


# ── PP Trigger Thresholds ──────────────────────────────────────

PP_TRIGGERS: dict[str, Any] = {
    "size_below_threshold": 10_000_000,
    "no_rating_achievable": True,
    "pre_revenue": True,
    "single_asset_concentration": True,
    "speculative_sector": [
        "gaming", "entertainment", "crypto", "cannabis",
        "early_stage_tech", "gaming_entertainment",
    ],
    "dscr_below_floor": 1.20,
    "startup_years": 3,
}

# ── Pricing Components ─────────────────────────────────────────

RISK_FREE_RATE = 4.28  # 10yr Treasury (bps: 428)

CREDIT_SPREADS_BPS: dict[str, tuple[int, int]] = {
    "implied_A": (80, 140),
    "implied_BBB": (130, 220),
    "implied_BB": (250, 400),
    "implied_B": (400, 650),
    "implied_CCC": (650, 1000),
    "unrated": (500, 800),
    "pre_revenue": (800, 1200),
}

ILLIQUIDITY_PREMIUM_BPS: dict[str, int] = {
    "rule_144a": 150,
    "reg_d_506b": 250,
    "reg_d_506c": 200,
    "direct": 300,
}

SECTOR_RISK_PREMIUM_BPS: dict[str, int] = {
    "gaming": 150,
    "gaming_entertainment": 150,
    "entertainment": 100,
    "crypto": 250,
    "cannabis": 300,
    "early_stage_tech": 200,
    "real_estate": 0,
    "senior_living": 0,
    "healthcare": 50,
    "technology": 100,
    "software_saas": 75,
}

# ── Instrument Type Logic ──────────────────────────────────────

INSTRUMENT_TYPES: dict[str, dict[str, Any]] = {
    "senior_secured_note": {
        "label": "Senior Secured Note",
        "typical_maturity": (3, 7),
        "amortization": "bullet_or_io_with_sweep",
        "call_protection": "NC-2, make-whole premium thereafter",
        "security": "first_lien",
        "seniority": 1,
    },
    "convertible_note": {
        "label": "Convertible Note",
        "typical_maturity": (2, 5),
        "amortization": "bullet",
        "call_protection": "NC-2, forced conversion trigger",
        "security": "unsecured_or_subordinated",
        "seniority": 3,
        "equity_kicker": True,
    },
    "revenue_participation_note": {
        "label": "Revenue Participation Note",
        "typical_maturity": (3, 7),
        "amortization": "revenue_percentage_sweep",
        "call_protection": "minimum_return_hurdle",
        "security": "second_lien_or_unsecured",
        "seniority": 2,
    },
    "mezzanine_note": {
        "label": "Mezzanine Note",
        "typical_maturity": (5, 10),
        "amortization": "io_then_bullet",
        "call_protection": "NC-3, step-down premium",
        "security": "second_lien",
        "seniority": 2,
        "equity_kicker": True,
    },
}

# ── Celebrity Crush Test Case ──────────────────────────────────

CELEBRITY_CRUSH_PP: dict[str, Any] = {
    "deal_name": "Celebrity Crush / Vertical Games",
    "deal_type": "equity_raise",
    "sector": "gaming_entertainment",
    "size_usd": 1_500_000,
    "pre_revenue": True,
    "operating_history_years": 0,
    "ebitda": 0,
    "revenue": 0,
    "projected_revenue_yr3": 25_000_000,
    "projected_ebitda_yr3": 5_000_000,
    "use_of_proceeds": "Game development, marketing, team expansion",
    "collateral": "IP portfolio, game assets, platform technology",
    "principals": "Celebrity partnership, experienced gaming team",
}


class PrivatePlacementEngine:
    """Converts deals that cannot access public bond markets into
    structured private placement instruments with full term sheets,
    pricing, and offering documentation."""

    # ── 1. Evaluate for PP vs Public Bond ──────────────────────

    def evaluate_for_pp(
        self, deal: dict, bond_sizing: dict | None = None
    ) -> dict:
        """Determine whether a deal should be private placement,
        public bond, or hybrid.

        Args:
            deal: Deal dict with size_usd, sector, pre_revenue,
                  operating_history_years, ebitda, revenue, dscr, etc.
            bond_sizing: Optional output from IntelligenceEngine.size_bond().

        Returns:
            recommendation, reasons, suggested_structure.
        """
        triggers_hit: list[dict] = []
        bondable_pct = 1.0

        # Size check
        size = deal.get("size_usd", 0)
        if size < PP_TRIGGERS["size_below_threshold"]:
            triggers_hit.append({
                "trigger": "size_below_threshold",
                "detail": f"Deal size ${size:,.0f} below ${PP_TRIGGERS['size_below_threshold']:,.0f} threshold",
                "severity": "high" if size < 5_000_000 else "medium",
            })
            bondable_pct -= 0.30

        # Pre-revenue
        if deal.get("pre_revenue", False):
            triggers_hit.append({
                "trigger": "pre_revenue",
                "detail": "No operating revenue — cannot calculate DSCR",
                "severity": "high",
            })
            bondable_pct -= 0.40

        # Operating history
        history = deal.get("operating_history_years", 0)
        if history < PP_TRIGGERS["startup_years"]:
            triggers_hit.append({
                "trigger": "startup_years",
                "detail": f"Operating history {history}yr below {PP_TRIGGERS['startup_years']}yr minimum",
                "severity": "high" if history < 1 else "medium",
            })
            bondable_pct -= 0.20

        # Speculative sector
        sector = deal.get("sector", "")
        if sector in PP_TRIGGERS["speculative_sector"]:
            triggers_hit.append({
                "trigger": "speculative_sector",
                "detail": f"Sector '{sector}' classified as speculative",
                "severity": "medium",
            })
            bondable_pct -= 0.15

        # Single asset concentration
        if deal.get("single_asset", False) or deal.get("single_asset_concentration", False):
            triggers_hit.append({
                "trigger": "single_asset_concentration",
                "detail": "Single asset/property — no revenue diversification",
                "severity": "medium",
            })
            bondable_pct -= 0.10

        # DSCR check
        dscr = deal.get("dscr", 0)
        ebitda = deal.get("ebitda", 0)
        if ebitda > 0 and dscr > 0 and dscr < PP_TRIGGERS["dscr_below_floor"]:
            triggers_hit.append({
                "trigger": "dscr_below_floor",
                "detail": f"DSCR {dscr:.2f}x below {PP_TRIGGERS['dscr_below_floor']}x floor",
                "severity": "high",
            })
            bondable_pct -= 0.25

        # Bond sizing failure
        if bond_sizing and bond_sizing.get("error"):
            triggers_hit.append({
                "trigger": "bond_sizing_failed",
                "detail": f"Bond sizing returned error: {bond_sizing['error']}",
                "severity": "high",
            })
            bondable_pct -= 0.50

        # Rating achievability from bond sizing
        if bond_sizing:
            credit = bond_sizing.get("credit", {})
            grade = credit.get("grade", "")
            if grade in ("B", "CCC") or not credit.get("meets_universal_floor", True):
                triggers_hit.append({
                    "trigger": "no_rating_achievable",
                    "detail": f"Implied rating {grade} — investment grade not achievable",
                    "severity": "high",
                })
                bondable_pct -= 0.30

        bondable_pct = max(0.0, bondable_pct)

        # Decision
        if not triggers_hit:
            recommendation = "public_bond"
            rationale = "No PP triggers hit — deal qualifies for public bond market"
        elif bondable_pct >= 0.60:
            recommendation = "hybrid"
            rationale = (
                f"Partial bond eligibility ({bondable_pct:.0%}) — "
                "split into bondable senior piece and PP subordinate piece"
            )
        else:
            recommendation = "private_placement"
            rationale = (
                f"Bond eligibility {bondable_pct:.0%} — "
                "deal requires private placement structure"
            )

        # Suggested structure
        suggested = self._suggest_instrument(deal, triggers_hit, bondable_pct)

        # Hybrid split
        hybrid_structure = None
        if recommendation == "hybrid":
            bond_piece = round(size * bondable_pct)
            pp_piece = size - bond_piece
            hybrid_structure = {
                "bond_piece": {
                    "amount": bond_piece,
                    "pct_of_deal": round(bondable_pct * 100, 1),
                    "structure": "senior_secured_bond",
                    "market": "public_or_144A",
                },
                "pp_piece": {
                    "amount": pp_piece,
                    "pct_of_deal": round((1 - bondable_pct) * 100, 1),
                    "structure": suggested["instrument_type"],
                    "market": "private_placement",
                },
            }

        return {
            "recommendation": recommendation,
            "rationale": rationale,
            "triggers_hit": triggers_hit,
            "trigger_count": len(triggers_hit),
            "bondable_pct": round(bondable_pct, 2),
            "suggested_structure": suggested,
            "hybrid_structure": hybrid_structure,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 2. Structure Private Placement ─────────────────────────

    def structure_private_placement(self, deal: dict) -> dict:
        """Create a full PP structure with instrument type, terms,
        covenants, security package, and regulatory exemption.

        Args:
            deal: Deal dict with size_usd, sector, pre_revenue,
                  ebitda, revenue, projected values, collateral, etc.

        Returns:
            Complete term sheet dict.
        """
        size = deal.get("size_usd", 0)
        sector = deal.get("sector", "")
        pre_revenue = deal.get("pre_revenue", False)
        ebitda = deal.get("ebitda", 0)
        revenue = deal.get("revenue", 0)

        # Select instrument type
        instrument = self._select_instrument(deal)
        instrument_data = INSTRUMENT_TYPES[instrument]

        # Maturity
        mat_range = instrument_data["typical_maturity"]
        if pre_revenue:
            maturity = mat_range[1]  # longer runway for pre-revenue
        elif size < 5_000_000:
            maturity = mat_range[0]  # shorter for small deals
        else:
            maturity = (mat_range[0] + mat_range[1]) // 2

        # Equity kicker
        equity_kicker = None
        if instrument_data.get("equity_kicker") or pre_revenue:
            warrant_pct = self._calc_warrant_pct(deal)
            equity_kicker = {
                "type": "warrants",
                "pct_of_fully_diluted": warrant_pct,
                "strike_price": "at-the-money (current valuation)",
                "exercise_period_years": maturity + 2,
                "anti_dilution": "broad-based weighted average",
            }

        # Covenants
        covenants = self._build_pp_covenants(deal, pre_revenue)

        # Security package
        security = self._build_security_package(deal, instrument)

        # Regulatory exemption
        exemption = self._determine_exemption(deal)

        # Amortization schedule
        amortization = self._build_amortization(deal, instrument, maturity)

        # Call protection
        call_protection = self._build_call_protection(instrument, maturity)

        return {
            "deal_name": deal.get("deal_name", "Unknown"),
            "instrument_type": instrument,
            "instrument_label": instrument_data["label"],
            "principal_amount": size,
            "terms": {
                "maturity_years": maturity,
                "maturity_date_estimated": f"{datetime.utcnow().year + maturity}-{datetime.utcnow().month:02d}",
                "amortization": amortization,
                "call_protection": call_protection,
                "seniority": instrument_data["seniority"],
            },
            "equity_kicker": equity_kicker,
            "covenants": covenants,
            "security_package": security,
            "regulatory_exemption": exemption,
            "use_of_proceeds": deal.get("use_of_proceeds", "General corporate purposes"),
            "minimum_denomination": self._min_denomination(deal, exemption),
            "transfer_restrictions": self._transfer_restrictions(exemption),
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 3. Price Private Placement ─────────────────────────────

    def price_private_placement(
        self, deal: dict, structure: dict
    ) -> dict:
        """Detailed pricing with spread decomposition.

        Args:
            deal: Deal dict.
            structure: Output of structure_private_placement().

        Returns:
            Indicated coupon range, YTM, all-in cost, spread breakdown.
        """
        size = deal.get("size_usd", 0)
        sector = deal.get("sector", "")
        pre_revenue = deal.get("pre_revenue", False)
        ebitda = deal.get("ebitda", 0)
        dscr = deal.get("dscr", 0)

        # 1. Credit spread
        implied_rating = self._imply_rating(deal)
        spread_key = f"implied_{implied_rating}" if f"implied_{implied_rating}" in CREDIT_SPREADS_BPS else "unrated"
        if pre_revenue:
            spread_key = "pre_revenue"
        credit_spread_range = CREDIT_SPREADS_BPS[spread_key]
        credit_spread_mid = (credit_spread_range[0] + credit_spread_range[1]) // 2

        # 2. Illiquidity premium
        exemption_type = structure.get("regulatory_exemption", {}).get("type", "reg_d_506b")
        illiquidity_bps = ILLIQUIDITY_PREMIUM_BPS.get(exemption_type, 250)

        # 3. Size adjustment — +100bps per $5M under $25M
        size_premium_bps = 0
        if size < 25_000_000:
            increments = (25_000_000 - size) / 5_000_000
            size_premium_bps = round(increments * 100)
        size_premium_bps = min(size_premium_bps, 500)  # cap at 500bps

        # 4. Pre-revenue premium
        pre_revenue_bps = 200 if pre_revenue else 0

        # 5. Sector risk premium
        sector_bps = SECTOR_RISK_PREMIUM_BPS.get(sector, 100)

        # Totals
        total_spread_low = credit_spread_range[0] + illiquidity_bps + size_premium_bps + pre_revenue_bps + sector_bps
        total_spread_high = credit_spread_range[1] + illiquidity_bps + size_premium_bps + pre_revenue_bps + sector_bps
        total_spread_mid = (total_spread_low + total_spread_high) // 2

        coupon_low = RISK_FREE_RATE + total_spread_low / 100
        coupon_high = RISK_FREE_RATE + total_spread_high / 100
        coupon_mid = RISK_FREE_RATE + total_spread_mid / 100

        # YTM adjustment for equity kicker
        ytm_discount = 0
        if structure.get("equity_kicker"):
            warrant_pct = structure["equity_kicker"].get("pct_of_fully_diluted", 0)
            ytm_discount = warrant_pct * 10  # 10bps per 1% warrant coverage
            coupon_low -= ytm_discount / 100
            coupon_high -= ytm_discount / 100
            coupon_mid -= ytm_discount / 100

        # All-in cost to borrower (coupon + fees)
        structuring_fee_pct = 2.5
        placement_fee_pct = 1.0
        legal_estimated_pct = 1.5
        total_upfront_fees = structuring_fee_pct + placement_fee_pct + legal_estimated_pct
        maturity = structure.get("terms", {}).get("maturity_years", 5)
        annualized_fee_bps = round(total_upfront_fees * 100 / maturity)

        all_in_cost_low = coupon_low + annualized_fee_bps / 100
        all_in_cost_high = coupon_high + annualized_fee_bps / 100

        return {
            "risk_free_rate": RISK_FREE_RATE,
            "spread_decomposition": {
                "credit_spread_bps": {
                    "range": credit_spread_range,
                    "midpoint": credit_spread_mid,
                    "basis": spread_key,
                },
                "illiquidity_premium_bps": illiquidity_bps,
                "size_premium_bps": size_premium_bps,
                "pre_revenue_premium_bps": pre_revenue_bps,
                "sector_premium_bps": sector_bps,
                "total_spread_bps": {
                    "low": total_spread_low,
                    "high": total_spread_high,
                    "midpoint": total_spread_mid,
                },
            },
            "indicated_coupon": {
                "low": round(coupon_low, 2),
                "high": round(coupon_high, 2),
                "midpoint": round(coupon_mid, 2),
            },
            "equity_kicker_yield_discount_bps": round(ytm_discount),
            "yield_to_maturity": {
                "low": round(coupon_low, 2),
                "high": round(coupon_high, 2),
                "note": "YTM approximates coupon for bullet structures; equity kicker provides additional return",
            },
            "all_in_cost_to_borrower": {
                "coupon_range": f"{coupon_low:.2f}% - {coupon_high:.2f}%",
                "upfront_fees_pct": total_upfront_fees,
                "annualized_fee_bps": annualized_fee_bps,
                "effective_cost_range": f"{all_in_cost_low:.2f}% - {all_in_cost_high:.2f}%",
            },
            "fees": {
                "structuring_fee_usd": round(deal.get("size_usd", 0) * structuring_fee_pct / 100),
                "structuring_fee_pct": structuring_fee_pct,
                "placement_fee_usd": round(deal.get("size_usd", 0) * placement_fee_pct / 100),
                "placement_fee_pct": placement_fee_pct,
                "estimated_legal_usd": round(deal.get("size_usd", 0) * legal_estimated_pct / 100),
            },
            "implied_rating": implied_rating,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 4. Convert Bond to PP ──────────────────────────────────

    def convert_bond_to_pp(self, bond_sizing: dict) -> dict:
        """Take a failed/weak bond sizing and convert to PP structure.

        Args:
            bond_sizing: Output of IntelligenceEngine.size_bond().

        Returns:
            PP structure with adjusted sizing, pricing, and bridge-to-bond analysis.
        """
        # Extract bond parameters
        bond_amount = 0
        if "bond_structure" in bond_sizing:
            bond_amount = bond_sizing["bond_structure"].get("principal", 0)
        elif "bond_amount" in bond_sizing:
            bond_amount = bond_sizing["bond_amount"]

        credit = bond_sizing.get("credit", {})
        grade = credit.get("grade", "BB")
        dscr = credit.get("dscr", 0)
        meets_floor = credit.get("meets_universal_floor", False)

        use_case = bond_sizing.get("use_case", "unknown")
        sector = bond_sizing.get("sector", "")

        # Size reduction for PP — smaller, more concentrated
        if not meets_floor or grade in ("B", "CCC"):
            size_factor = 0.60  # significant reduction
        elif grade == "BB":
            size_factor = 0.80
        else:
            size_factor = 0.90

        pp_size = round(bond_amount * size_factor)

        # Build a deal dict from bond sizing
        deal = {
            "deal_name": f"PP Conversion — {use_case}",
            "deal_type": use_case,
            "sector": sector,
            "size_usd": pp_size,
            "pre_revenue": dscr == 0,
            "ebitda": bond_sizing.get("valuation", {}).get("ebitda", 0),
            "revenue": 0,
            "dscr": dscr,
            "operating_history_years": 3,  # assume some history if bond was attempted
        }

        # Generate PP structure and pricing
        structure = self.structure_private_placement(deal)
        pricing = self.price_private_placement(deal, structure)

        # Bridge-to-bond analysis — what would it take to get to public bond
        bridge_requirements = self._bridge_to_bond_analysis(bond_sizing, deal)

        return {
            "original_bond": {
                "amount": bond_amount,
                "grade": grade,
                "dscr": dscr,
                "meets_floor": meets_floor,
            },
            "pp_conversion": {
                "pp_size": pp_size,
                "size_reduction_pct": round((1 - size_factor) * 100, 1),
                "structure": structure,
                "pricing": pricing,
            },
            "bridge_to_bond": bridge_requirements,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 5. Generate PP Offering Memo ───────────────────────────

    def generate_pp_offering_memo(
        self, deal: dict, structure: dict
    ) -> dict:
        """Structured PP offering memorandum for 144A/Reg D distribution.

        Args:
            deal: Deal dict.
            structure: Output of structure_private_placement().

        Returns:
            Structured offering memo with all required sections.
        """
        pricing = self.price_private_placement(deal, structure)
        risk_factors = self._generate_risk_factors(deal)

        # Investment highlights
        highlights = self._generate_investment_highlights(deal)

        # Financial projections
        projections = self._generate_financial_projections(deal)

        return {
            "memo_type": "Confidential Private Placement Memorandum",
            "memo_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "confidentiality_legend": (
                "This memorandum is confidential and is provided solely for the purpose "
                "of evaluating a potential investment. Distribution to unauthorized parties "
                "is strictly prohibited. This offering has not been registered under the "
                "Securities Act of 1933."
            ),
            "sections": {
                "executive_summary": {
                    "deal_name": deal.get("deal_name", "Unknown"),
                    "issuer": deal.get("issuer", deal.get("deal_name", "Unknown")),
                    "instrument": structure.get("instrument_label", ""),
                    "principal_amount": structure.get("principal_amount", 0),
                    "indicated_coupon": pricing.get("indicated_coupon", {}),
                    "maturity": structure.get("terms", {}).get("maturity_years", 0),
                    "use_of_proceeds": deal.get("use_of_proceeds", ""),
                    "exemption": structure.get("regulatory_exemption", {}).get("type", ""),
                    "minimum_investment": structure.get("minimum_denomination", 0),
                },
                "investment_highlights": highlights,
                "risk_factors": risk_factors,
                "use_of_proceeds": {
                    "description": deal.get("use_of_proceeds", "General corporate purposes"),
                    "breakdown": self._use_of_proceeds_breakdown(deal),
                },
                "terms_summary": {
                    "instrument_type": structure.get("instrument_label", ""),
                    "principal": structure.get("principal_amount", 0),
                    "coupon": pricing.get("indicated_coupon", {}),
                    "maturity": structure.get("terms", {}).get("maturity_years", 0),
                    "amortization": structure.get("terms", {}).get("amortization", {}),
                    "call_protection": structure.get("terms", {}).get("call_protection", {}),
                    "equity_kicker": structure.get("equity_kicker"),
                    "covenants": structure.get("covenants", {}),
                    "security": structure.get("security_package", {}),
                },
                "financial_projections": projections,
                "security_description": structure.get("security_package", {}),
                "regulatory": {
                    "exemption": structure.get("regulatory_exemption", {}),
                    "transfer_restrictions": structure.get("transfer_restrictions", {}),
                    "investor_qualifications": self._investor_qualifications(
                        structure.get("regulatory_exemption", {}).get("type", "reg_d_506b")
                    ),
                },
            },
            "pricing_summary": pricing,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── Private: Instrument Selection ──────────────────────────

    def _suggest_instrument(
        self, deal: dict, triggers: list[dict], bondable_pct: float
    ) -> dict:
        """Suggest the best instrument type based on deal characteristics."""
        instrument = self._select_instrument(deal)
        instrument_data = INSTRUMENT_TYPES[instrument]
        return {
            "instrument_type": instrument,
            "instrument_label": instrument_data["label"],
            "rationale": self._instrument_rationale(deal, instrument),
        }

    def _select_instrument(self, deal: dict) -> str:
        """Select the optimal PP instrument for a deal."""
        pre_revenue = deal.get("pre_revenue", False)
        size = deal.get("size_usd", 0)
        sector = deal.get("sector", "")
        deal_type = deal.get("deal_type", "")
        ebitda = deal.get("ebitda", 0)

        # Pre-revenue or equity raise -> convertible note
        if pre_revenue or deal_type == "equity_raise":
            if size <= 5_000_000:
                return "convertible_note"
            return "revenue_participation_note"

        # Has cash flow but weak -> senior secured or mezzanine
        if ebitda > 0:
            dscr = deal.get("dscr", 0)
            if dscr >= 1.0:
                return "senior_secured_note"
            return "mezzanine_note"

        # Real estate / tangible assets -> senior secured
        if sector in ("real_estate", "senior_living", "multifamily"):
            return "senior_secured_note"

        # Default to convertible for high-risk
        return "convertible_note"

    def _instrument_rationale(self, deal: dict, instrument: str) -> str:
        """Explain why this instrument was selected."""
        rationales = {
            "senior_secured_note": (
                "Cash flow positive with tangible collateral — senior secured "
                "note provides best pricing and investor protection"
            ),
            "convertible_note": (
                "Pre-revenue or early-stage — convertible note aligns investor "
                "interests with equity upside while providing downside debt protection"
            ),
            "revenue_participation_note": (
                "Revenue trajectory justifies participation structure — investors "
                "share in upside while maintaining debt priority"
            ),
            "mezzanine_note": (
                "Operating business with below-threshold coverage — mezzanine "
                "position with equity kicker compensates for subordination risk"
            ),
        }
        return rationales.get(instrument, "Selected based on deal risk profile")

    # ── Private: PP Covenants ──────────────────────────────────

    def _build_pp_covenants(self, deal: dict, pre_revenue: bool) -> dict:
        """Build lighter-than-bond covenant package for PP."""
        covenants: dict[str, Any] = {
            "financial_covenants": {},
            "reporting_requirements": {
                "quarterly_financials": True,
                "monthly_cash_report": True,
                "annual_audited_financials": True,
                "annual_budget_and_projections": True,
                "material_event_notice": True,
            },
            "negative_covenants": {
                "no_additional_senior_debt": True,
                "no_liens_on_collateral": True,
                "no_asset_sales_above_threshold": True,
                "asset_sale_threshold_usd": max(100_000, deal.get("size_usd", 0) * 0.05),
                "restricted_payments": "No dividends or distributions until note repaid",
                "change_of_control_put": 101,
            },
            "affirmative_covenants": {
                "maintain_insurance": True,
                "maintain_corporate_existence": True,
                "comply_with_laws": True,
                "permit_inspection": True,
                "use_of_proceeds_certification": True,
            },
        }

        if pre_revenue:
            covenants["financial_covenants"] = {
                "minimum_cash_balance": round(deal.get("size_usd", 0) * 0.15),
                "minimum_cash_note": "15% of note proceeds maintained at all times",
                "revenue_milestones": {
                    "year_1": round(deal.get("projected_revenue_yr3", 0) * 0.10),
                    "year_2": round(deal.get("projected_revenue_yr3", 0) * 0.35),
                    "year_3": deal.get("projected_revenue_yr3", 0),
                    "consequence": "Mandatory prepayment at 105% if missed by 6+ months",
                },
                "burn_rate_cap_monthly": round(deal.get("size_usd", 0) / 18),
            }
        else:
            ebitda = deal.get("ebitda", 0)
            dscr = deal.get("dscr", 0)
            covenants["financial_covenants"] = {
                "minimum_dscr": max(1.10, dscr - 0.10) if dscr > 0 else 1.10,
                "minimum_cash_balance": round(max(500_000, ebitda * 0.25)),
                "maximum_leverage_ratio": 5.0,
                "maximum_capex_annual": round(max(250_000, ebitda * 0.30)) if ebitda > 0 else 250_000,
            }

        return covenants

    # ── Private: Security Package ──────────────────────────────

    def _build_security_package(self, deal: dict, instrument: str) -> dict:
        """Build security / collateral package."""
        instrument_data = INSTRUMENT_TYPES[instrument]
        security_position = instrument_data.get("security", "first_lien")

        package: dict[str, Any] = {
            "lien_position": security_position,
            "collateral": [],
            "guarantees": [],
        }

        collateral_desc = deal.get("collateral", "")
        if collateral_desc:
            package["collateral"].append({
                "type": "described_assets",
                "description": collateral_desc,
            })

        # IP pledge for tech/gaming
        sector = deal.get("sector", "")
        if sector in ("gaming_entertainment", "gaming", "technology", "early_stage_tech", "software_saas"):
            package["collateral"].append({
                "type": "intellectual_property",
                "description": "All patents, trademarks, copyrights, trade secrets, and source code",
            })

        # Real property for RE deals
        if sector in ("real_estate", "senior_living", "multifamily"):
            package["collateral"].append({
                "type": "real_property",
                "description": "First lien deed of trust on all owned real property",
            })

        # Universal: equity pledge + personal guaranty
        package["collateral"].append({
            "type": "equity_pledge",
            "description": "100% pledge of equity interests in borrower entity",
        })

        package["guarantees"].append({
            "type": "personal_guaranty",
            "description": "Limited personal guaranty of principals (bad acts / fraud carveout)",
            "scope": "non_recourse_with_carveouts",
        })

        # Deposit account control agreement
        package["deposit_account_control"] = {
            "required": True,
            "description": "DACA on all operating accounts — springing control upon event of default",
        }

        return package

    # ── Private: Regulatory Exemption ──────────────────────────

    def _determine_exemption(self, deal: dict) -> dict:
        """Determine appropriate securities exemption."""
        size = deal.get("size_usd", 0)

        # Rule 144A for larger deals ($10M+) targeting QIBs
        if size >= 10_000_000:
            return {
                "type": "rule_144a",
                "description": "Rule 144A — restricted to Qualified Institutional Buyers (QIBs)",
                "minimum_qib_assets": 100_000_000,
                "resale": "Rule 144A secondary market among QIBs",
                "registration_rights": "Demand registration after 2 years",
                "blue_sky_filing": False,
            }

        # Reg D 506(c) for deals wanting general solicitation
        if deal.get("general_solicitation", False):
            return {
                "type": "reg_d_506c",
                "description": "Regulation D Rule 506(c) — general solicitation permitted, accredited investors only",
                "investor_verification": "Reasonable steps to verify accredited status required",
                "max_non_accredited": 0,
                "form_d_filing": True,
                "blue_sky_preemption": True,
            }

        # Default: Reg D 506(b) — most common for smaller PP
        return {
            "type": "reg_d_506b",
            "description": "Regulation D Rule 506(b) — no general solicitation, up to 35 sophisticated non-accredited",
            "max_non_accredited": 35,
            "accredited_unlimited": True,
            "form_d_filing": True,
            "blue_sky_preemption": True,
            "no_general_solicitation": True,
        }

    # ── Private: Pricing Helpers ───────────────────────────────

    def _imply_rating(self, deal: dict) -> str:
        """Imply a shadow credit rating for pricing purposes."""
        dscr = deal.get("dscr", 0)
        ebitda = deal.get("ebitda", 0)
        pre_revenue = deal.get("pre_revenue", False)
        history = deal.get("operating_history_years", 0)

        if pre_revenue or ebitda <= 0:
            return "CCC"
        if dscr >= 2.0 and history >= 5:
            return "BBB"
        if dscr >= 1.50 and history >= 3:
            return "BB"
        if dscr >= 1.20:
            return "B"
        return "CCC"

    def _calc_warrant_pct(self, deal: dict) -> float:
        """Calculate warrant coverage percentage based on risk."""
        pre_revenue = deal.get("pre_revenue", False)
        size = deal.get("size_usd", 0)
        sector = deal.get("sector", "")

        base_pct = 5.0  # 5% base warrant coverage

        if pre_revenue:
            base_pct += 10.0  # high risk = more equity
        if sector in PP_TRIGGERS["speculative_sector"]:
            base_pct += 5.0
        if size < 2_000_000:
            base_pct += 5.0  # micro deals need more upside

        return min(base_pct, 25.0)  # cap at 25%

    # ── Private: Amortization & Call Protection ────────────────

    def _build_amortization(
        self, deal: dict, instrument: str, maturity: int
    ) -> dict:
        """Build amortization schedule."""
        instrument_data = INSTRUMENT_TYPES[instrument]
        amort_type = instrument_data.get("amortization", "bullet")

        if amort_type == "bullet":
            return {
                "type": "bullet",
                "description": f"Interest-only for {maturity} years, principal at maturity",
                "io_period_years": maturity,
            }
        elif amort_type == "bullet_or_io_with_sweep":
            return {
                "type": "io_with_cash_sweep",
                "description": f"Interest-only with excess cash flow sweep beginning year 2",
                "io_period_years": 1,
                "sweep_pct": 50,
                "sweep_note": "50% of excess cash flow above 1.25x DSCR applied to principal",
            }
        elif amort_type == "revenue_percentage_sweep":
            return {
                "type": "revenue_participation",
                "description": "Fixed coupon plus revenue participation sweep",
                "base_coupon": True,
                "revenue_share_pct": 5.0,
                "revenue_share_note": "5% of gross revenue above $5M applied to principal and return",
                "minimum_annual_payment": round(deal.get("size_usd", 0) * 0.08),
            }
        elif amort_type == "io_then_bullet":
            io_years = min(3, maturity - 1)
            return {
                "type": "io_then_bullet",
                "description": f"{io_years}-year IO period, then bullet at maturity",
                "io_period_years": io_years,
            }

        return {
            "type": "bullet",
            "description": f"Interest-only for {maturity} years, principal at maturity",
            "io_period_years": maturity,
        }

    def _build_call_protection(self, instrument: str, maturity: int) -> dict:
        """Build call protection schedule."""
        instrument_data = INSTRUMENT_TYPES[instrument]

        nc_years = min(2, maturity - 1)  # NC-2 typical
        if instrument == "mezzanine_note":
            nc_years = min(3, maturity - 1)

        # Step-down premiums
        premiums: list[dict] = []
        remaining = maturity - nc_years
        for i in range(min(remaining, 3)):
            year = nc_years + i + 1
            premium = max(0, 3 - i)  # 3%, 2%, 1% step-down
            premiums.append({
                "year": year,
                "premium_pct": premium,
                "call_price": 100 + premium,
            })
        if maturity > nc_years + 3:
            premiums.append({
                "year": f"{nc_years + 4}+",
                "premium_pct": 0,
                "call_price": 100,
            })

        return {
            "non_call_years": nc_years,
            "make_whole_premium": instrument_data.get("call_protection", ""),
            "step_down_schedule": premiums,
            "par_call_after_year": nc_years + 3 if maturity > nc_years + 3 else maturity,
        }

    # ── Private: Offering Memo Helpers ─────────────────────────

    def _generate_risk_factors(self, deal: dict) -> list[dict]:
        """Generate risk factors required for 144A/Reg D."""
        risks: list[dict] = []
        sector = deal.get("sector", "")
        pre_revenue = deal.get("pre_revenue", False)

        # Universal risks
        risks.append({
            "category": "Investment Risk",
            "risk": "Illiquidity",
            "description": (
                "These securities have not been registered under the Securities Act "
                "and are subject to significant transfer restrictions. No public market "
                "exists and none is expected to develop."
            ),
        })

        risks.append({
            "category": "Investment Risk",
            "risk": "Subordination / Priority",
            "description": (
                "In a liquidation or bankruptcy, holders may be subordinated to "
                "senior secured creditors, tax obligations, and regulatory claims."
            ),
        })

        if pre_revenue:
            risks.append({
                "category": "Business Risk",
                "risk": "Pre-Revenue — No Operating History",
                "description": (
                    "The issuer has no operating revenue. Projected financial performance "
                    "is speculative and actual results may differ materially from projections."
                ),
            })
            risks.append({
                "category": "Business Risk",
                "risk": "Cash Burn and Capital Requirements",
                "description": (
                    "The issuer is expected to incur operating losses and negative cash flow. "
                    "Additional financing may be required, which may not be available on "
                    "acceptable terms or at all."
                ),
            })

        # Sector-specific risks
        sector_risks = {
            "gaming_entertainment": {
                "risk": "Gaming Industry Concentration",
                "description": (
                    "The gaming industry is highly competitive and subject to rapid "
                    "technological change. Success depends on market acceptance of products "
                    "that have not yet been released."
                ),
            },
            "crypto": {
                "risk": "Regulatory Uncertainty",
                "description": (
                    "Digital asset regulations are evolving rapidly. Changes in regulatory "
                    "treatment could materially and adversely affect the business."
                ),
            },
            "cannabis": {
                "risk": "Federal Illegality / Banking Restrictions",
                "description": (
                    "Cannabis remains a Schedule I substance under federal law. Banking "
                    "and financial services access is limited and could be disrupted."
                ),
            },
        }

        if sector in sector_risks:
            risks.append({
                "category": "Industry Risk",
                **sector_risks[sector],
            })

        # Small deal risk
        if deal.get("size_usd", 0) < 5_000_000:
            risks.append({
                "category": "Structural Risk",
                "risk": "Small Issue Size",
                "description": (
                    "The small principal amount limits diversification, increases "
                    "per-unit transaction costs, and reduces secondary market liquidity."
                ),
            })

        risks.append({
            "category": "Market Risk",
            "risk": "Interest Rate Risk",
            "description": (
                "Changes in prevailing interest rates could affect the market value "
                "of the securities and the issuer's cost of refinancing at maturity."
            ),
        })

        risks.append({
            "category": "Business Risk",
            "risk": "Key Person Dependency",
            "description": (
                "The issuer's success depends on the continued involvement of key "
                "management personnel. Loss of key individuals could materially affect operations."
            ),
        })

        return risks

    def _generate_investment_highlights(self, deal: dict) -> list[dict]:
        """Generate investment highlights for the offering memo."""
        highlights: list[dict] = []

        # Market opportunity
        projected_rev = deal.get("projected_revenue_yr3", 0)
        projected_ebitda = deal.get("projected_ebitda_yr3", 0)
        if projected_rev > 0:
            highlights.append({
                "highlight": "Significant Revenue Potential",
                "detail": f"Projected Year 3 revenue of ${projected_rev:,.0f} with ${projected_ebitda:,.0f} EBITDA",
            })

        # Team / principals
        principals = deal.get("principals", "")
        if principals:
            highlights.append({
                "highlight": "Experienced Team",
                "detail": principals,
            })

        # Collateral / IP
        collateral = deal.get("collateral", "")
        if collateral:
            highlights.append({
                "highlight": "Asset-Backed Security",
                "detail": f"Secured by {collateral}",
            })

        # Use of proceeds
        uop = deal.get("use_of_proceeds", "")
        if uop:
            highlights.append({
                "highlight": "Defined Use of Proceeds",
                "detail": uop,
            })

        # Structural protections
        highlights.append({
            "highlight": "Structural Protections",
            "detail": (
                "Comprehensive covenant package including financial milestones, "
                "reporting requirements, deposit account control, and change of control put"
            ),
        })

        return highlights

    def _generate_financial_projections(self, deal: dict) -> dict:
        """Generate financial projection summary."""
        revenue = deal.get("revenue", 0)
        ebitda = deal.get("ebitda", 0)
        proj_rev_3 = deal.get("projected_revenue_yr3", 0)
        proj_ebitda_3 = deal.get("projected_ebitda_yr3", 0)

        # Build 5-year projection from available data
        projections: dict[str, dict] = {}
        for yr in range(1, 6):
            if proj_rev_3 > 0 and revenue == 0:
                # Pre-revenue: S-curve ramp
                ramp = [0.05, 0.20, 1.0, 1.8, 2.5]
                rev = round(proj_rev_3 * ramp[yr - 1])
                margin = 0 if yr <= 1 else (0.10 if yr == 2 else 0.20)
                ebitda_yr = round(rev * margin)
            elif revenue > 0:
                growth = 1 + 0.15  # 15% annual growth assumed
                rev = round(revenue * growth ** yr)
                ebitda_yr = round(ebitda * growth ** yr) if ebitda > 0 else round(rev * 0.15)
            else:
                rev = 0
                ebitda_yr = 0

            projections[f"year_{yr}"] = {
                "revenue": rev,
                "ebitda": ebitda_yr,
                "ebitda_margin": round(ebitda_yr / rev * 100, 1) if rev > 0 else 0,
            }

        return {
            "projections": projections,
            "assumptions": {
                "revenue_growth": "15% annual (operating) or S-curve ramp (pre-revenue)",
                "ebitda_margin_at_scale": "20%",
                "basis": "Management projections — not independently verified",
            },
            "disclaimer": (
                "These projections are forward-looking statements and are not guarantees "
                "of future performance. Actual results may differ materially."
            ),
        }

    def _use_of_proceeds_breakdown(self, deal: dict) -> dict:
        """Break down use of proceeds."""
        size = deal.get("size_usd", 0)
        uop_text = deal.get("use_of_proceeds", "")

        # Try to parse from text or provide standard breakdown
        if "development" in uop_text.lower() or "product" in uop_text.lower():
            return {
                "product_development": round(size * 0.40),
                "sales_and_marketing": round(size * 0.25),
                "team_expansion": round(size * 0.15),
                "working_capital": round(size * 0.10),
                "reserves_and_contingency": round(size * 0.10),
            }

        if "construction" in uop_text.lower() or "real estate" in uop_text.lower():
            return {
                "acquisition_construction": round(size * 0.70),
                "soft_costs": round(size * 0.10),
                "reserves": round(size * 0.10),
                "fees_and_expenses": round(size * 0.10),
            }

        return {
            "primary_purpose": round(size * 0.60),
            "working_capital": round(size * 0.20),
            "reserves_and_contingency": round(size * 0.10),
            "transaction_costs": round(size * 0.10),
        }

    def _min_denomination(self, deal: dict, exemption: dict) -> int:
        """Determine minimum denomination / investment size."""
        exemption_type = exemption.get("type", "reg_d_506b")
        if exemption_type == "rule_144a":
            return 250_000
        # Reg D: typically $100K-$250K minimum
        size = deal.get("size_usd", 0)
        if size < 2_000_000:
            return 50_000
        if size < 10_000_000:
            return 100_000
        return 250_000

    def _transfer_restrictions(self, exemption: dict) -> dict:
        """Define transfer restriction language."""
        exemption_type = exemption.get("type", "reg_d_506b")

        if exemption_type == "rule_144a":
            return {
                "resale_permitted": "To QIBs pursuant to Rule 144A",
                "holding_period": "None for QIB-to-QIB transfers",
                "registration_rights": "Demand registration after 2 years",
                "legend_required": True,
            }

        return {
            "resale_permitted": "Only pursuant to registration or available exemption",
            "holding_period": "Minimum 6 months (Rule 144) for affiliates, 12 months for non-affiliates",
            "registration_rights": "None unless separately negotiated",
            "legend_required": True,
            "issuer_consent_required": True,
        }

    def _investor_qualifications(self, exemption_type: str) -> dict:
        """Define investor qualification requirements."""
        if exemption_type == "rule_144a":
            return {
                "type": "Qualified Institutional Buyer (QIB)",
                "minimum_assets": 100_000_000,
                "entity_types": ["Insurance companies", "Investment companies", "Pension funds", "Banks", "Broker-dealers"],
                "individual_eligible": False,
            }
        if exemption_type == "reg_d_506c":
            return {
                "type": "Accredited Investor (verified)",
                "individual_requirements": {
                    "income": "$200K individual / $300K joint for 2 consecutive years",
                    "net_worth": "$1M excluding primary residence",
                    "professional_certifications": "Series 7, 65, or 82",
                },
                "entity_requirements": {
                    "assets": "$5M+",
                    "all_owners_accredited": True,
                },
                "verification_required": True,
            }

        # Reg D 506(b)
        return {
            "type": "Accredited Investor (self-certified) + up to 35 sophisticated non-accredited",
            "individual_requirements": {
                "income": "$200K individual / $300K joint for 2 consecutive years",
                "net_worth": "$1M excluding primary residence",
            },
            "entity_requirements": {
                "assets": "$5M+",
            },
            "non_accredited_maximum": 35,
            "non_accredited_requirement": "Sufficient financial sophistication to evaluate the investment",
            "verification_required": False,
        }

    def _bridge_to_bond_analysis(
        self, bond_sizing: dict, deal: dict
    ) -> dict:
        """Analyze what it would take to bridge from PP to public bond."""
        credit = bond_sizing.get("credit", {})
        grade = credit.get("grade", "BB")
        dscr = credit.get("dscr", 0)

        requirements: list[dict] = []

        if dscr < 1.20:
            gap = 1.20 - dscr
            requirements.append({
                "requirement": "Improve DSCR to 1.20x minimum",
                "current": f"{dscr:.2f}x",
                "target": "1.20x",
                "path": "Increase NOI, reduce debt service, or add credit enhancement (surety/LC)",
            })

        if grade in ("B", "CCC"):
            requirements.append({
                "requirement": "Achieve minimum BB+ shadow rating",
                "current": grade,
                "target": "BB+",
                "path": "Build operating track record (3+ years), demonstrate stable cash flow",
            })

        if deal.get("pre_revenue", False):
            requirements.append({
                "requirement": "Establish revenue and operating history",
                "current": "Pre-revenue",
                "target": "3+ years audited financials",
                "path": "Execute business plan, achieve revenue milestones, obtain audited financials",
            })

        size = deal.get("size_usd", 0)
        if size < PP_TRIGGERS["size_below_threshold"]:
            requirements.append({
                "requirement": f"Grow deal size above ${PP_TRIGGERS['size_below_threshold']:,.0f}",
                "current": f"${size:,.0f}",
                "target": f"${PP_TRIGGERS['size_below_threshold']:,.0f}+",
                "path": "Aggregate with other assets, grow the business, or pursue portfolio bond program",
            })

        estimated_timeline = "18-36 months" if deal.get("pre_revenue") else "12-24 months"

        return {
            "requirements": requirements,
            "requirement_count": len(requirements),
            "estimated_timeline": estimated_timeline,
            "recommendation": (
                "Execute PP now, use proceeds to build operating history, "
                "then refinance into public bond market at lower cost of capital"
                if requirements
                else "Deal is near bond-eligible — consider credit enhancement for direct bond issuance"
            ),
        }
