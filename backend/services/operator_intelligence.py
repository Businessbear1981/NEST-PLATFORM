"""
Operator Intelligence — Targeted operator analysis for EagleEye deal sourcing.

Instead of scanning the entire market blindly, this module targets SPECIFIC
operators we know, have relationships with, or have identified as high-value
prospects. Each operator has a full profile: properties, financing signals,
relationship status, and pitch angles.

This is how top investment banks work — you don't wait for deals to appear,
you map the operator landscape and pursue the ones that fit your capabilities.

Operators Tracked:
1. Convivial Life — Active client (Jacaranda Trace), $509M pipeline, 501(c)(3) CCRC
2. Greystar — Prospect, $79B AUM, 900K units, construction/refi maturity wall
3. [Expandable: add new operators to OPERATOR_DATABASE as pipeline grows]

Feeds Into:
- EagleEye Scanner — operator-specific signal filtering
- Intelligence Engine — benchmark comparison for deal underwriting
- Bond Desk — operator pipeline sizing for bond programs
- Bernard — pitch deck generation and relationship tracking
"""
from __future__ import annotations

from datetime import datetime
from typing import Any


# ── Operator Database — Seed Data for Known Targets ─────────────
OPERATOR_DATABASE: dict[str, dict[str, Any]] = {
    "convivial_life": {
        "name": "Convivial Life, Inc.",
        "entity_type": "501(c)(3)",
        "headquarters": "Venice, FL",
        "sector": "senior_living",
        "model": "CCRC",
        "known_properties": [
            {
                "name": "Jacaranda Trace",
                "location": "Venice, FL",
                "units": 456,
                "status": "active_client",
                "bond_par": 203_080_000,
            },
            {
                "name": "Cabana at Jensen Dunes",
                "location": "Jensen Beach, FL",
                "units": 126,
                "status": "expansion_planned",
                "expansion_cost": 102_100_000,
            },
            {
                "name": "Convivial St. Petersburg",
                "location": "St. Petersburg, FL",
                "units": 225,
                "status": "new_development",
                "estimated_cost": 204_200_000,
            },
        ],
        "manager": "LifeStar Living, LLC",
        "total_pipeline_usd": 509_380_000,
        "relationship_status": "active_client",
        "contact_approach": "Direct — existing client relationship via Jacaranda",
        "pitch_angle": (
            "Portfolio bond program: single master trust covering all 3 properties, "
            "cross-collateralization, shared issuer (FL LGFC)"
        ),
    },
    "greystar": {
        "name": "Greystar Real Estate Partners",
        "entity_type": "Private",
        "headquarters": "Charleston, SC",
        "sector": "multifamily",
        "model": "Conventional + Affordable",
        "portfolio_size": 900_000,  # units managed globally
        "us_properties_estimated": 2500,
        "aum_usd": 79_000_000_000,
        "known_issues": [
            "Construction loans maturing 2024-2026 need perm takeout",
            "Value-add acquisitions need refinancing as stabilized",
            "Affordable housing tax credit properties need bond refinancing",
        ],
        "target_signals": [
            "CMBS loan maturity within 18 months",
            "Construction loan approaching maturity with <90% occupancy",
            "Properties acquired 2021-2022 at peak pricing — potential distress",
            "Affordable properties with expiring LIHTC compliance periods",
        ],
        "relationship_status": "prospect",
        "contact_approach": "Target regional VPs in Southeast, Texas, Pacific Northwest",
        "pitch_angle": (
            "Perm takeout bonds for stabilized multifamily — 150bps savings vs CMBS, "
            "no balloon risk"
        ),
    },
}


# ── Multifamily Market Benchmarks — Intelligence Engine Data ────
MULTIFAMILY_MARKET_BENCHMARKS: dict[str, dict[str, Any]] = {
    "national_averages": {
        "avg_effective_rent": 1_742,
        "yoy_rent_growth": 0.023,
        "vacancy_rate": 0.068,
        "cap_rate_class_a": 0.048,
        "cap_rate_class_b": 0.055,
        "cap_rate_class_c": 0.065,
        "construction_cost_psf": 275,
        "operating_expense_ratio": 0.42,
        "noi_margin": 0.58,
    },
    "refi_triggers": {
        "rate_savings_threshold_bps": 75,
        "maturity_wall_months": 18,
        "ltv_max_refi": 0.75,
        "dscr_min_refi": 1.25,
        "occupancy_min_refi": 0.90,
    },
    "construction_exit_triggers": {
        "months_post_co": 12,
        "min_occupancy_for_perm": 0.85,
        "max_ltv_construction": 0.80,
        "typical_bridge_term_months": 36,
        "bridge_maturity_warning_months": 6,
    },
    "senior_living_benchmarks": {
        "ccrc_entrance_fee_avg": 400_000,
        "ccrc_monthly_fee_avg": 4_800,
        "al_monthly_fee_avg": 6_500,
        "mc_monthly_fee_avg": 7_200,
        "snf_daily_fee_avg": 500,
        "ccrc_stabilized_occupancy": 0.93,
        "al_stabilized_occupancy": 0.90,
        "ccrc_operating_expense_ratio": 0.65,
        "ccrc_dscr_target": 1.50,
        "ccrc_days_cash_target": 250,
    },
}


class OperatorIntelligence:
    """Targets specific property management operators to find deals.

    This is the proactive deal-sourcing layer. Instead of waiting for signals
    to arrive, we map known operators, track their portfolios, and identify
    financing events before they hit the market.
    """

    def __init__(self) -> None:
        self._operators = dict(OPERATOR_DATABASE)
        self._benchmarks = dict(MULTIFAMILY_MARKET_BENCHMARKS)

    # ── Portfolio Scan ──────────────────────────────────────────
    def scan_operator_portfolio(self, operator_key: str) -> dict:
        """Analyze an operator's portfolio for deal opportunities.

        Returns known properties with financing signals, estimated pipeline
        from maturity walls, cross-selling opportunities, and competitive
        positioning.
        """
        operator = self._operators.get(operator_key)
        if not operator:
            return {
                "success": False,
                "error": f"Operator '{operator_key}' not found in database",
                "available_operators": list(self._operators.keys()),
            }

        opportunities: list[dict] = []
        total_pipeline = 0

        # Scan known properties for financing signals
        for prop in operator.get("known_properties", []):
            signals = self._detect_property_signals(prop, operator)
            if signals:
                deal_size = self._estimate_deal_size(prop)
                total_pipeline += deal_size
                opportunities.append({
                    "property": prop["name"],
                    "location": prop.get("location", "Unknown"),
                    "units": prop.get("units", 0),
                    "status": prop.get("status", "unknown"),
                    "signals": signals,
                    "estimated_deal_size_usd": deal_size,
                    "capital_solutions": self._match_capital_solutions(signals),
                    "urgency": self._score_urgency(signals),
                })

        # Estimate additional pipeline from target signals (for prospects)
        estimated_additional = 0
        for signal in operator.get("target_signals", []):
            estimated_additional += self._estimate_signal_pipeline(signal, operator)

        # Cross-selling: sister properties, same operator, portfolio programs
        cross_sell = self._identify_cross_sell(operator)

        # Competitive positioning
        competitive = self._assess_competitive_position(operator)

        return {
            "success": True,
            "operator": operator["name"],
            "relationship_status": operator.get("relationship_status", "unknown"),
            "scan_timestamp": datetime.utcnow().isoformat(),
            "known_opportunities": opportunities,
            "known_pipeline_usd": total_pipeline,
            "estimated_additional_pipeline_usd": estimated_additional,
            "total_estimated_pipeline_usd": total_pipeline + estimated_additional,
            "cross_sell_opportunities": cross_sell,
            "competitive_position": competitive,
            "recommended_next_steps": self._recommend_actions(operator, opportunities),
        }

    # ── Operator Pitch Generation ───────────────────────────────
    def generate_operator_pitch(self, operator_key: str) -> dict:
        """Create an operator-specific pitch package.

        Builds the case for why NEST is the right capital partner, with
        specific deals we can help with, fee savings estimates, and
        platform capabilities mapped to their needs.
        """
        operator = self._operators.get(operator_key)
        if not operator:
            return {
                "success": False,
                "error": f"Operator '{operator_key}' not found in database",
            }

        sector = operator.get("sector", "general")
        properties = operator.get("known_properties", [])

        # Calculate fee savings vs traditional approaches
        savings = self._calculate_savings(operator)

        # Map NEST capabilities to operator needs
        capabilities = self._map_capabilities(operator)

        # Build specific deal list
        actionable_deals: list[dict] = []
        for prop in properties:
            deal_size = self._estimate_deal_size(prop)
            if deal_size > 0:
                actionable_deals.append({
                    "property": prop["name"],
                    "deal_size_usd": deal_size,
                    "deal_type": self._infer_deal_type(prop),
                    "nest_role": self._infer_nest_role(prop, operator),
                    "estimated_fee_usd": self._estimate_fee(deal_size, prop),
                    "timeline": self._estimate_timeline(prop),
                })

        # Portfolio program opportunity (multi-property operators)
        portfolio_program = None
        if len(properties) >= 2:
            total_par = sum(self._estimate_deal_size(p) for p in properties)
            portfolio_program = {
                "description": "Master trust bond program covering entire portfolio",
                "total_par_usd": total_par,
                "benefits": [
                    "Single issuance — lower transaction costs",
                    "Cross-collateralization — stronger credit",
                    "Shared reserves — capital efficiency",
                    "Streamlined ongoing compliance",
                ],
                "estimated_savings_vs_individual_usd": int(total_par * 0.005),
            }

        return {
            "success": True,
            "operator": operator["name"],
            "generated_at": datetime.utcnow().isoformat(),
            "pitch_angle": operator.get("pitch_angle", ""),
            "contact_approach": operator.get("contact_approach", ""),
            "why_nest": capabilities,
            "actionable_deals": actionable_deals,
            "fee_savings": savings,
            "portfolio_program": portfolio_program,
            "total_addressable_pipeline_usd": operator.get("total_pipeline_usd", 0),
            "relationship_status": operator.get("relationship_status", "unknown"),
        }

    # ── Signal-Based Operator Search ────────────────────────────
    def find_operators_by_signal(self, signal_type: str) -> list[dict]:
        """Find operators matching a given signal type.

        Signal types:
        - construction_maturing: operators with construction loans expiring
        - occupancy_below_benchmark: operators with underperforming properties
        - refi_opportunity: operators with above-market rates
        - expansion_planned: operators with announced expansion projects
        - distressed: operators showing financial stress signals
        """
        signal_matchers: dict[str, Any] = {
            "construction_maturing": self._match_construction_maturing,
            "occupancy_below_benchmark": self._match_occupancy_below,
            "refi_opportunity": self._match_refi_opportunity,
            "expansion_planned": self._match_expansion,
            "distressed": self._match_distressed,
        }

        matcher = signal_matchers.get(signal_type)
        if not matcher:
            return [{
                "success": False,
                "error": f"Unknown signal type: {signal_type}",
                "available_signals": list(signal_matchers.keys()),
            }]

        results: list[dict] = []
        for key, operator in self._operators.items():
            matches = matcher(operator)
            if matches:
                results.append({
                    "operator_key": key,
                    "operator_name": operator["name"],
                    "sector": operator.get("sector", "unknown"),
                    "relationship_status": operator.get("relationship_status", "unknown"),
                    "matching_signals": matches,
                    "estimated_pipeline_usd": operator.get("total_pipeline_usd", 0),
                    "contact_approach": operator.get("contact_approach", ""),
                })

        results.sort(key=lambda r: r.get("estimated_pipeline_usd", 0), reverse=True)
        return results

    # ── Self-Learning Loop ──────────────────────────────────────
    def self_learning_loop(
        self, deals: list[dict], docs: list[dict]
    ) -> dict:
        """Analyze current deals and docs to find gaps, leads, and deviations.

        This is the feedback loop that makes the intelligence engine smarter
        over time. It examines active deals, compares metrics to benchmarks,
        identifies missing documents, and surfaces new deal leads from
        existing relationships.

        Returns action items sorted by priority (critical → low).
        """
        action_items: list[dict] = []
        benchmarks = self._benchmarks

        # 1. Gap analysis — missing documents, stalled stages
        for deal in deals:
            gaps = self._find_deal_gaps(deal, docs)
            for gap in gaps:
                action_items.append({
                    "type": "gap",
                    "priority": gap["priority"],
                    "deal_name": deal.get("name", "Unknown"),
                    "deal_id": deal.get("id", ""),
                    "description": gap["description"],
                    "action": gap["action"],
                    "deadline_days": gap.get("deadline_days", 14),
                })

        # 2. New deal leads from existing relationships
        for deal in deals:
            operator_key = deal.get("operator_key") or deal.get("operator", "")
            if operator_key in self._operators:
                leads = self._find_sister_deals(deal, self._operators[operator_key])
                for lead in leads:
                    action_items.append({
                        "type": "new_lead",
                        "priority": "medium",
                        "deal_name": deal.get("name", "Unknown"),
                        "deal_id": deal.get("id", ""),
                        "description": lead["description"],
                        "action": lead["action"],
                        "estimated_size_usd": lead.get("estimated_size_usd", 0),
                    })

        # 3. Benchmark deviations — deal metrics vs market
        for deal in deals:
            deviations = self._check_benchmark_deviations(deal, benchmarks)
            for dev in deviations:
                action_items.append({
                    "type": "benchmark_deviation",
                    "priority": dev["priority"],
                    "deal_name": deal.get("name", "Unknown"),
                    "deal_id": deal.get("id", ""),
                    "metric": dev["metric"],
                    "deal_value": dev["deal_value"],
                    "benchmark_value": dev["benchmark_value"],
                    "deviation_pct": dev["deviation_pct"],
                    "description": dev["description"],
                    "action": dev["action"],
                })

        # 4. Suggested follow-up actions
        for deal in deals:
            follow_ups = self._suggest_follow_ups(deal)
            for fu in follow_ups:
                action_items.append({
                    "type": "follow_up",
                    "priority": fu["priority"],
                    "deal_name": deal.get("name", "Unknown"),
                    "deal_id": deal.get("id", ""),
                    "description": fu["description"],
                    "action": fu["action"],
                })

        # Sort by priority: critical → high → medium → low
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        action_items.sort(key=lambda x: priority_order.get(x.get("priority", "low"), 4))

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "deals_analyzed": len(deals),
            "docs_analyzed": len(docs),
            "total_action_items": len(action_items),
            "critical_items": len([i for i in action_items if i["priority"] == "critical"]),
            "high_items": len([i for i in action_items if i["priority"] == "high"]),
            "action_items": action_items,
        }

    # ── Private: Property Signal Detection ──────────────────────
    def _detect_property_signals(
        self, prop: dict, operator: dict
    ) -> list[str]:
        """Detect financing signals from a property's status and attributes."""
        signals: list[str] = []
        status = prop.get("status", "")

        if status == "active_client":
            if prop.get("bond_par", 0) > 0:
                signals.append("existing_bond_surveillance")
            signals.append("cross_sell_additional_services")

        if status == "expansion_planned":
            signals.append("construction_financing_needed")
            if prop.get("expansion_cost", 0) > 50_000_000:
                signals.append("bond_eligible_expansion")

        if status == "new_development":
            signals.append("construction_to_perm_needed")
            if prop.get("estimated_cost", 0) > 100_000_000:
                signals.append("large_bond_eligible")

        if status == "stabilized":
            signals.append("refi_candidate")

        # Operator-level signals
        for issue in operator.get("known_issues", []):
            lower = issue.lower()
            if "maturing" in lower or "maturity" in lower:
                signals.append("maturity_wall_exposure")
            if "refinancing" in lower or "refi" in lower:
                signals.append("refi_pipeline")

        return signals

    def _estimate_deal_size(self, prop: dict) -> int:
        """Estimate deal size from property attributes."""
        if prop.get("bond_par"):
            return prop["bond_par"]
        if prop.get("expansion_cost"):
            return prop["expansion_cost"]
        if prop.get("estimated_cost"):
            return prop["estimated_cost"]
        # Fallback: estimate from units
        units = prop.get("units", 0)
        if units > 0:
            return units * 350_000  # conservative per-unit estimate
        return 0

    def _match_capital_solutions(self, signals: list[str]) -> list[str]:
        """Map signals to appropriate capital solutions."""
        solution_map = {
            "construction_financing_needed": "construction_bond",
            "construction_to_perm_needed": "construction_to_perm_bond",
            "bond_eligible_expansion": "tax_exempt_bond",
            "large_bond_eligible": "tax_exempt_bond",
            "refi_candidate": "refunding_bond",
            "maturity_wall_exposure": "perm_takeout_bond",
            "refi_pipeline": "refunding_bond",
            "existing_bond_surveillance": "surveillance_advisory",
            "cross_sell_additional_services": "portfolio_advisory",
        }
        solutions = []
        for signal in signals:
            solution = solution_map.get(signal)
            if solution and solution not in solutions:
                solutions.append(solution)
        return solutions

    def _score_urgency(self, signals: list[str]) -> str:
        """Score urgency based on signal types."""
        critical_signals = {"maturity_wall_exposure", "construction_to_perm_needed"}
        high_signals = {"construction_financing_needed", "bond_eligible_expansion", "large_bond_eligible"}

        if any(s in critical_signals for s in signals):
            return "critical"
        if any(s in high_signals for s in signals):
            return "high"
        return "medium"

    def _estimate_signal_pipeline(self, signal: str, operator: dict) -> int:
        """Estimate pipeline value from a target signal."""
        lower = signal.lower()
        portfolio_size = operator.get("portfolio_size", 0)
        us_properties = operator.get("us_properties_estimated", 0)

        # CMBS maturity — estimate 5% of US portfolio in maturity wall
        if "cmbs" in lower and "maturity" in lower:
            return int(us_properties * 0.05 * 25_000_000)  # avg deal size

        # Construction maturing — estimate 2% of portfolio
        if "construction" in lower and "maturity" in lower:
            return int(us_properties * 0.02 * 40_000_000)

        # Peak pricing distress — estimate 3% of portfolio
        if "peak pricing" in lower or "distress" in lower:
            return int(us_properties * 0.03 * 20_000_000)

        # LIHTC expiring — estimate 1% of portfolio
        if "lihtc" in lower:
            return int(us_properties * 0.01 * 15_000_000)

        return 0

    def _identify_cross_sell(self, operator: dict) -> list[dict]:
        """Identify cross-selling opportunities within an operator."""
        cross_sell: list[dict] = []
        properties = operator.get("known_properties", [])
        has_active = any(p.get("status") == "active_client" for p in properties)

        if has_active and len(properties) > 1:
            non_active = [p for p in properties if p.get("status") != "active_client"]
            for prop in non_active:
                cross_sell.append({
                    "type": "sister_property",
                    "property": prop["name"],
                    "status": prop.get("status", "unknown"),
                    "estimated_size_usd": self._estimate_deal_size(prop),
                    "rationale": (
                        f"Existing relationship via active client — warm introduction "
                        f"for {prop['name']} ({prop.get('status', 'unknown')})"
                    ),
                })

        if operator.get("entity_type") == "501(c)(3)":
            cross_sell.append({
                "type": "tax_exempt_advantage",
                "rationale": (
                    "501(c)(3) status enables tax-exempt bond issuance — "
                    "significant cost of capital advantage vs taxable alternatives"
                ),
            })

        return cross_sell

    def _assess_competitive_position(self, operator: dict) -> dict:
        """Assess NEST's competitive position for this operator."""
        advantages: list[str] = []
        risks: list[str] = []

        if operator.get("relationship_status") == "active_client":
            advantages.append("Existing relationship — trust established")
            advantages.append("Knowledge of operator's financials and operations")
            advantages.append("Reference deal for portfolio program pitch")
        else:
            risks.append("No existing relationship — cold outreach required")

        if operator.get("entity_type") == "501(c)(3)":
            advantages.append("Tax-exempt bond expertise is rare — strong moat")

        sector = operator.get("sector", "")
        if sector == "senior_living":
            advantages.append("CCRC bond structuring is specialized — limited competition")
            advantages.append("Jacaranda Trace as proof of concept")
        elif sector == "multifamily":
            risks.append("Highly competitive — agency lenders, CMBS shops, banks")
            advantages.append("Bond alternative offers no balloon risk — differentiated")
            advantages.append("150bps savings pitch vs CMBS is quantifiable")

        aum = operator.get("aum_usd", 0)
        if aum > 50_000_000_000:
            risks.append("Institutional operator — sophisticated, will compare multiple options")
            advantages.append("Scale of pipeline justifies dedicated bond program")

        return {
            "advantages": advantages,
            "risks": risks,
            "win_probability": self._estimate_win_probability(advantages, risks),
        }

    def _estimate_win_probability(
        self, advantages: list[str], risks: list[str]
    ) -> str:
        """Rough win probability based on advantages vs risks."""
        score = len(advantages) * 15 - len(risks) * 10 + 30
        score = max(5, min(95, score))
        if score >= 70:
            return "high"
        if score >= 40:
            return "moderate"
        return "low"

    def _recommend_actions(
        self, operator: dict, opportunities: list[dict]
    ) -> list[str]:
        """Generate recommended next steps for an operator."""
        actions: list[str] = []
        status = operator.get("relationship_status", "")

        if status == "active_client":
            actions.append("Schedule portfolio review meeting — discuss expansion financing")
            if len(opportunities) > 1:
                actions.append("Propose master trust bond program for multi-property portfolio")
            actions.append("Confirm construction timelines for pipeline deals")
        elif status == "prospect":
            actions.append(f"Execute outreach: {operator.get('contact_approach', 'Direct contact')}")
            actions.append("Prepare savings analysis comparing NEST bonds vs current financing")
            actions.append("Identify specific properties with near-term financing needs")
        else:
            actions.append("Research operator background and decision-making contacts")
            actions.append("Identify warm introduction paths through existing network")

        return actions

    # ── Private: Pitch Helpers ──────────────────────────────────
    def _calculate_savings(self, operator: dict) -> dict:
        """Calculate estimated fee savings for the operator."""
        total_pipeline = operator.get("total_pipeline_usd", 0)
        if total_pipeline == 0:
            # Estimate from properties
            total_pipeline = sum(
                self._estimate_deal_size(p)
                for p in operator.get("known_properties", [])
            )

        # Traditional investment bank: 1.5-2.0% underwriting fee
        # NEST bond program: 0.75-1.25% (technology-driven efficiency)
        traditional_fee_pct = 0.0175
        nest_fee_pct = 0.0100
        savings_pct = traditional_fee_pct - nest_fee_pct

        # Rate savings: bonds vs CMBS/bank (75-150bps annually)
        annual_rate_savings_bps = 100  # conservative estimate
        avg_term_years = 10

        return {
            "total_pipeline_usd": total_pipeline,
            "traditional_fee_usd": int(total_pipeline * traditional_fee_pct),
            "nest_fee_usd": int(total_pipeline * nest_fee_pct),
            "fee_savings_usd": int(total_pipeline * savings_pct),
            "fee_savings_pct": round(savings_pct * 100, 2),
            "annual_rate_savings_bps": annual_rate_savings_bps,
            "lifetime_rate_savings_usd": int(
                total_pipeline * (annual_rate_savings_bps / 10_000) * avg_term_years
            ),
        }

    def _map_capabilities(self, operator: dict) -> list[dict]:
        """Map NEST platform capabilities to operator needs."""
        capabilities: list[dict] = []
        sector = operator.get("sector", "")

        capabilities.append({
            "capability": "Bond Structuring (GENIE)",
            "relevance": "Direct — structures tax-exempt and taxable bonds for all property types",
            "differentiator": "Automated structuring reduces timeline from 90 to 45 days",
        })

        if sector == "senior_living":
            capabilities.append({
                "capability": "CCRC Feasibility Engine",
                "relevance": "Purpose-built for entrance fee communities — actuarial + financial model",
                "differentiator": "Integrates NIC MAP benchmarks for real-time assumption validation",
            })

        capabilities.append({
            "capability": "EagleEye Scanner",
            "relevance": "Monitors operator portfolio for financing triggers in real-time",
            "differentiator": "Proactive deal identification — we find opportunities before competitors",
        })

        capabilities.append({
            "capability": "Roots Document Intelligence",
            "relevance": "Automated document ingestion and financial spreading",
            "differentiator": "Reduces underwriting preparation from weeks to hours",
        })

        if len(operator.get("known_properties", [])) >= 2:
            capabilities.append({
                "capability": "Portfolio Bond Programs",
                "relevance": "Master trust covering multiple properties under single indenture",
                "differentiator": "Cross-collateralization, shared reserves, single compliance framework",
            })

        return capabilities

    def _infer_deal_type(self, prop: dict) -> str:
        """Infer deal type from property status."""
        status = prop.get("status", "")
        type_map = {
            "active_client": "surveillance_and_advisory",
            "expansion_planned": "construction_bond",
            "new_development": "construction_to_perm_bond",
            "stabilized": "refunding_or_perm_bond",
        }
        return type_map.get(status, "advisory")

    def _infer_nest_role(self, prop: dict, operator: dict) -> str:
        """Infer NEST's role for a specific deal."""
        status = prop.get("status", "")
        if status == "active_client":
            return "advisor_and_structurer"
        if operator.get("entity_type") == "501(c)(3)":
            return "senior_managing_underwriter"
        return "structurer_and_placement_agent"

    def _estimate_fee(self, deal_size: int, prop: dict) -> int:
        """Estimate NEST fee for a deal."""
        status = prop.get("status", "")
        if status == "active_client":
            # Surveillance fee: 5bps annually on outstanding par
            return int(deal_size * 0.0005)
        # New deal underwriting: 1.0-1.25%
        return int(deal_size * 0.0110)

    def _estimate_timeline(self, prop: dict) -> str:
        """Estimate deal timeline based on property status."""
        status = prop.get("status", "")
        timelines = {
            "active_client": "Ongoing — annual review",
            "expansion_planned": "6-12 months to closing",
            "new_development": "9-18 months to closing",
            "stabilized": "3-6 months to closing",
        }
        return timelines.get(status, "TBD — requires further analysis")

    # ── Private: Signal Matchers ────────────────────────────────
    def _match_construction_maturing(self, operator: dict) -> list[str]:
        """Match operators with construction loans approaching maturity."""
        matches: list[str] = []
        for issue in operator.get("known_issues", []):
            if "construction" in issue.lower() and "matur" in issue.lower():
                matches.append(issue)
        for signal in operator.get("target_signals", []):
            if "construction" in signal.lower() and "matur" in signal.lower():
                matches.append(signal)
        for prop in operator.get("known_properties", []):
            if prop.get("status") in ("new_development", "expansion_planned"):
                matches.append(f"{prop['name']} — {prop['status']}")
        return matches

    def _match_occupancy_below(self, operator: dict) -> list[str]:
        """Match operators with properties below occupancy benchmarks."""
        matches: list[str] = []
        sector = operator.get("sector", "")
        benchmark = self._benchmarks.get("national_averages", {}).get("vacancy_rate", 0.068)
        min_occupancy = 1.0 - benchmark

        for signal in operator.get("target_signals", []):
            if "occupancy" in signal.lower():
                matches.append(signal)

        for issue in operator.get("known_issues", []):
            if "occupancy" in issue.lower() or "stabiliz" in issue.lower():
                matches.append(issue)

        # Senior living has different benchmarks
        if sector == "senior_living":
            sl_benchmarks = self._benchmarks.get("senior_living_benchmarks", {})
            target_occ = sl_benchmarks.get("ccrc_stabilized_occupancy", 0.93)
            for prop in operator.get("known_properties", []):
                occ = prop.get("occupancy", 0)
                if 0 < occ < target_occ:
                    matches.append(
                        f"{prop['name']} — occupancy {occ:.0%} vs target {target_occ:.0%}"
                    )

        return matches

    def _match_refi_opportunity(self, operator: dict) -> list[str]:
        """Match operators with refinancing opportunities."""
        matches: list[str] = []
        for issue in operator.get("known_issues", []):
            lower = issue.lower()
            if "refin" in lower or "refi" in lower or "rate" in lower:
                matches.append(issue)
        for signal in operator.get("target_signals", []):
            lower = signal.lower()
            if "matur" in lower or "refi" in lower or "rate" in lower:
                matches.append(signal)
        for prop in operator.get("known_properties", []):
            if prop.get("status") == "stabilized":
                matches.append(f"{prop['name']} — stabilized, refi candidate")
        return matches

    def _match_expansion(self, operator: dict) -> list[str]:
        """Match operators with expansion plans."""
        matches: list[str] = []
        for prop in operator.get("known_properties", []):
            if prop.get("status") in ("expansion_planned", "new_development"):
                size = self._estimate_deal_size(prop)
                matches.append(
                    f"{prop['name']} — {prop['status']} (${size:,.0f})"
                )
        return matches

    def _match_distressed(self, operator: dict) -> list[str]:
        """Match operators showing distress signals."""
        matches: list[str] = []
        distress_keywords = ["distress", "workout", "delinquen", "special servicing", "peak pricing"]
        for issue in operator.get("known_issues", []):
            if any(kw in issue.lower() for kw in distress_keywords):
                matches.append(issue)
        for signal in operator.get("target_signals", []):
            if any(kw in signal.lower() for kw in distress_keywords):
                matches.append(signal)
        return matches

    # ── Private: Self-Learning Helpers ──────────────────────────
    def _find_deal_gaps(self, deal: dict, docs: list[dict]) -> list[dict]:
        """Identify missing documents or stalled stages in a deal."""
        gaps: list[dict] = []
        deal_id = deal.get("id", "")
        deal_docs = [d for d in docs if d.get("deal_id") == deal_id]
        doc_types = {d.get("type", "") for d in deal_docs}

        # Required documents by deal stage
        stage = deal.get("stage", "")
        required_docs: dict[str, list[str]] = {
            "origination": ["term_sheet", "preliminary_financials"],
            "underwriting": ["audited_financials", "appraisal", "environmental", "title"],
            "structuring": ["bond_indenture_draft", "official_statement_draft", "legal_opinion"],
            "closing": ["final_indenture", "final_os", "rating_letter", "insurance_binder"],
        }

        required = required_docs.get(stage, [])
        for req in required:
            if req not in doc_types:
                gaps.append({
                    "priority": "high" if stage in ("underwriting", "closing") else "medium",
                    "description": f"Missing {req.replace('_', ' ')} for {stage} stage",
                    "action": f"Request {req.replace('_', ' ')} from borrower/counsel",
                    "deadline_days": 7 if stage == "closing" else 14,
                })

        # Stalled deal detection — no activity in 14+ days
        last_update = deal.get("updated_at") or deal.get("last_activity")
        if last_update:
            try:
                if isinstance(last_update, str):
                    last_dt = datetime.fromisoformat(last_update.replace("Z", "+00:00"))
                else:
                    last_dt = last_update
                days_stale = (datetime.utcnow() - last_dt.replace(tzinfo=None)).days
                if days_stale > 14:
                    gaps.append({
                        "priority": "high",
                        "description": f"Deal stalled — no activity in {days_stale} days",
                        "action": "Contact borrower for status update, escalate internally",
                        "deadline_days": 3,
                    })
            except (ValueError, TypeError):
                pass

        return gaps

    def _find_sister_deals(self, deal: dict, operator: dict) -> list[dict]:
        """Find additional deal opportunities from the same operator."""
        leads: list[dict] = []
        deal_property = deal.get("property_name", "") or deal.get("name", "")

        for prop in operator.get("known_properties", []):
            # Skip the current deal's property
            if prop["name"] == deal_property:
                continue
            if prop.get("status") in ("expansion_planned", "new_development"):
                leads.append({
                    "description": (
                        f"Sister property: {prop['name']} ({prop.get('location', 'Unknown')}) — "
                        f"{prop['status']}"
                    ),
                    "action": (
                        f"Pitch {prop['name']} financing as part of portfolio program "
                        f"with existing deal"
                    ),
                    "estimated_size_usd": self._estimate_deal_size(prop),
                })

        return leads

    def _check_benchmark_deviations(
        self, deal: dict, benchmarks: dict
    ) -> list[dict]:
        """Check deal metrics against market benchmarks."""
        deviations: list[dict] = []
        sector = deal.get("sector", "") or deal.get("property_type", "")

        # DSCR check
        dscr = deal.get("dscr") or deal.get("debt_service_coverage_ratio")
        if dscr and isinstance(dscr, (int, float)):
            min_dscr = benchmarks.get("refi_triggers", {}).get("dscr_min_refi", 1.25)
            if dscr < min_dscr:
                deviations.append({
                    "priority": "critical",
                    "metric": "DSCR",
                    "deal_value": dscr,
                    "benchmark_value": min_dscr,
                    "deviation_pct": round((dscr - min_dscr) / min_dscr * 100, 1),
                    "description": f"DSCR {dscr:.2f}x below minimum {min_dscr:.2f}x",
                    "action": "Review NOI assumptions, stress test, consider credit enhancement",
                })

        # LTV check
        ltv = deal.get("ltv") or deal.get("loan_to_value")
        if ltv and isinstance(ltv, (int, float)):
            max_ltv = benchmarks.get("refi_triggers", {}).get("ltv_max_refi", 0.75)
            if ltv > max_ltv:
                deviations.append({
                    "priority": "high",
                    "metric": "LTV",
                    "deal_value": ltv,
                    "benchmark_value": max_ltv,
                    "deviation_pct": round((ltv - max_ltv) / max_ltv * 100, 1),
                    "description": f"LTV {ltv:.0%} exceeds maximum {max_ltv:.0%}",
                    "action": "Reduce loan amount, increase equity, or obtain subordinate financing",
                })

        # Occupancy check
        occupancy = deal.get("occupancy") or deal.get("occupancy_rate")
        if occupancy and isinstance(occupancy, (int, float)):
            min_occ = benchmarks.get("refi_triggers", {}).get("occupancy_min_refi", 0.90)
            if occupancy < min_occ:
                deviations.append({
                    "priority": "high",
                    "metric": "Occupancy",
                    "deal_value": occupancy,
                    "benchmark_value": min_occ,
                    "deviation_pct": round((occupancy - min_occ) / min_occ * 100, 1),
                    "description": f"Occupancy {occupancy:.0%} below minimum {min_occ:.0%}",
                    "action": "Defer permanent financing until stabilization target reached",
                })

        # Cap rate check (sector-specific)
        cap_rate = deal.get("cap_rate")
        if cap_rate and isinstance(cap_rate, (int, float)):
            national = benchmarks.get("national_averages", {})
            benchmark_cap = national.get("cap_rate_class_b", 0.055)
            if cap_rate > benchmark_cap * 1.2:
                deviations.append({
                    "priority": "medium",
                    "metric": "Cap Rate",
                    "deal_value": cap_rate,
                    "benchmark_value": benchmark_cap,
                    "deviation_pct": round((cap_rate - benchmark_cap) / benchmark_cap * 100, 1),
                    "description": (
                        f"Cap rate {cap_rate:.1%} significantly above benchmark "
                        f"{benchmark_cap:.1%} — potential value-add or risk premium"
                    ),
                    "action": "Verify NOI sustainability, check for deferred maintenance or operational issues",
                })

        # Senior living specific checks
        if sector in ("senior_living", "ccrc"):
            sl = benchmarks.get("senior_living_benchmarks", {})
            deal_dscr = deal.get("dscr") or deal.get("debt_service_coverage_ratio")
            if deal_dscr and isinstance(deal_dscr, (int, float)):
                ccrc_target = sl.get("ccrc_dscr_target", 1.50)
                if deal_dscr < ccrc_target:
                    deviations.append({
                        "priority": "high",
                        "metric": "CCRC DSCR Target",
                        "deal_value": deal_dscr,
                        "benchmark_value": ccrc_target,
                        "deviation_pct": round((deal_dscr - ccrc_target) / ccrc_target * 100, 1),
                        "description": f"CCRC DSCR {deal_dscr:.2f}x below target {ccrc_target:.2f}x",
                        "action": "Review entrance fee pricing, monthly fee adequacy, expense controls",
                    })

        return deviations

    def _suggest_follow_ups(self, deal: dict) -> list[dict]:
        """Suggest follow-up actions based on deal characteristics."""
        follow_ups: list[dict] = []
        stage = deal.get("stage", "")
        deal_type = deal.get("deal_type", "")

        if stage == "origination":
            follow_ups.append({
                "priority": "high",
                "description": "Complete preliminary underwriting and term sheet",
                "action": "Run deal through NEST intelligence engine for sizing and pricing",
            })

        if stage == "underwriting":
            follow_ups.append({
                "priority": "medium",
                "description": "Verify financial assumptions against market benchmarks",
                "action": "Compare deal metrics to MULTIFAMILY_MARKET_BENCHMARKS",
            })

        if deal_type in ("construction_bond", "construction_to_perm"):
            follow_ups.append({
                "priority": "medium",
                "description": "Monitor construction progress and absorption",
                "action": "Set up monthly construction draw monitoring via Bridge agent",
            })

        # High-value deals get extra attention
        size = deal.get("size_usd", 0) or deal.get("deal_size", 0)
        if size > 100_000_000:
            follow_ups.append({
                "priority": "high",
                "description": f"High-value deal (${size:,.0f}) — ensure senior coverage",
                "action": "Schedule weekly status call, assign dedicated deal team",
            })

        return follow_ups
