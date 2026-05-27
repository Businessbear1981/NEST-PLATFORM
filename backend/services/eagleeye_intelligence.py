"""
EagleEye Cross-Deal Intelligence Engine.
Detects patterns, scores attractiveness, finds bond angles and IPO trajectories
across the entire NEST deal pipeline.
"""
from __future__ import annotations

import threading
from datetime import datetime, date


class EagleEyeIntelligence:
    """Cross-deal intelligence over the full DealsRegistry."""

    def __init__(self) -> None:
        self._lock = threading.Lock()

    # ── Full report ──────────────────────────────────────────────
    def generate_intelligence_report(self, deals: list[dict]) -> dict:
        """Master report: patterns + scores + bond angles + sister deals + feasibility signals + market context."""
        patterns = self.detect_cross_deal_patterns(deals)
        scores = [self.score_deal_attractiveness(d) for d in deals]
        scores.sort(key=lambda s: s["score"], reverse=True)
        bond_angles = [self.find_bond_angles_with_portfolio(d, deals) if len(deals) > 1 else self.find_bond_angles(d) for d in deals if d.get("deal_type") not in ("equity_raise",)]

        total_pipeline = sum(d.get("size_usd", 0) for d in deals)
        avg_score = round(sum(s["score"] for s in scores) / max(len(scores), 1), 1)

        # Sister deal detection across pipeline
        sister_deals = {}
        for d in deals:
            sisters = self.detect_sister_deals(d, deals)
            if sisters:
                sister_deals[d.get("id", "unknown")] = {
                    "deal_name": d.get("name", ""),
                    "related_count": len(sisters),
                    "relationships": sisters,
                }

        # Feasibility signals for deals that have feasibility data
        feasibility_intel = {}
        for d in deals:
            feas = d.get("feasibility_data") or d.get("feasibility")
            if feas:
                signals = self.extract_feasibility_signals(feas)
                if signals:
                    feasibility_intel[d.get("id", "unknown")] = {
                        "deal_name": d.get("name", ""),
                        "signal_count": len(signals),
                        "signals": signals,
                        "critical_signals": [s for s in signals if s.get("severity") == "critical"],
                        "warning_signals": [s for s in signals if s.get("severity") == "warning"],
                    }

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "deal_count": len(deals),
            "total_pipeline_usd": total_pipeline,
            "average_attractiveness": avg_score,
            "patterns": patterns,
            "ranked_scores": scores,
            "bond_angles": bond_angles,
            "sister_deals": sister_deals,
            "feasibility_intelligence": feasibility_intel,
            "market_context": self._market_context(),
        }

    # ── Cross-deal patterns ──────────────────────────────────────
    def detect_cross_deal_patterns(self, deals: list[dict]) -> list[dict]:
        """Identify recurring themes, geographic clusters, sector concentration."""
        patterns = []

        # Sector concentration
        sectors: dict[str, list] = {}
        for d in deals:
            sec = d.get("sector", d.get("asset_class", "unknown"))
            sectors.setdefault(sec, []).append(d)
        for sec, group in sectors.items():
            if len(group) >= 2:
                patterns.append({
                    "type": "sector_concentration",
                    "sector": sec,
                    "deal_count": len(group),
                    "combined_usd": sum(d.get("size_usd", 0) for d in group),
                    "deals": [d["id"] for d in group],
                    "insight": f"{len(group)} active deals in {sec} — potential portfolio play or cross-collateralisation opportunity.",
                })

        # Geographic clusters
        states: dict[str, list] = {}
        for d in deals:
            loc = d.get("location", "")
            state = loc.split(",")[-1].strip() if "," in loc else loc
            states.setdefault(state, []).append(d)
        for st, group in states.items():
            if len(group) >= 2:
                patterns.append({
                    "type": "geographic_cluster",
                    "state": st,
                    "deal_count": len(group),
                    "combined_usd": sum(d.get("size_usd", 0) for d in group),
                    "deals": [d["id"] for d in group],
                    "insight": f"{len(group)} deals in {st} — local knowledge advantage, shared counsel/issuer potential.",
                })

        # Size tier distribution
        tiers = {"mega_cap": 0, "large": 0, "mid": 0, "small": 0}
        for d in deals:
            s = d.get("size_usd", 0)
            if s >= 500_000_000:
                tiers["mega_cap"] += 1
            elif s >= 100_000_000:
                tiers["large"] += 1
            elif s >= 25_000_000:
                tiers["mid"] += 1
            else:
                tiers["small"] += 1
        patterns.append({
            "type": "size_distribution",
            "tiers": tiers,
            "insight": f"Pipeline spans {sum(1 for v in tiers.values() if v)} size tiers — diversified risk profile.",
        })

        # Deal type mix
        deal_types: dict[str, int] = {}
        for d in deals:
            dt = d.get("deal_type", "unknown")
            deal_types[dt] = deal_types.get(dt, 0) + 1
        patterns.append({
            "type": "deal_type_mix",
            "types": deal_types,
            "insight": "Portfolio includes " + ", ".join(f"{v} {k}" for k, v in deal_types.items()) + " structures.",
        })

        return patterns

    # ── Bond angles ──────────────────────────────────────────────
    def find_bond_angles(self, deal: dict) -> dict:
        """Identify bond structuring opportunities for a deal."""
        angles = []
        deal_id = deal.get("id", "unknown")
        size = deal.get("size_usd", 0)
        sector = deal.get("sector", deal.get("asset_class", ""))
        financials = deal.get("financials", {})

        # Tax-exempt municipal
        if sector in ("senior_living", "senior_housing", "infrastructure", "data_centers"):
            angles.append({
                "angle": "tax_exempt_municipal",
                "structure": "501(c)(3) or governmental issuer conduit",
                "estimated_savings_bps": 150,
                "confidence": "high" if sector in ("senior_living", "senior_housing") else "medium",
            })

        # A/B tranche
        if size >= 50_000_000:
            angles.append({
                "angle": "ab_tranche",
                "structure": "Series A (75% LTC, IG) + Series B (7% mezzanine, sub-IG)",
                "rationale": "Deal size supports multi-tranche execution",
                "confidence": "high",
            })

        # Surety enhancement
        if financials.get("enhancement") or size <= 300_000_000:
            angles.append({
                "angle": "surety_enhancement",
                "structure": "Hylant surety wrap — underlying to enhanced rating uplift",
                "estimated_uplift_notches": 2,
                "confidence": "high",
            })

        # Construction bridge
        if deal.get("deal_type") == "construction":
            angles.append({
                "angle": "construction_bridge",
                "structure": "Bridge-to-bond with draw schedule, perm takeout at CO",
                "confidence": "high",
            })

        # HFT fund B-tranche
        if size >= 25_000_000:
            angles.append({
                "angle": "hft_b_tranche",
                "structure": "B-tranche AUM routed through Quantum HFT fund for yield arbitrage",
                "target_return_pct": "15-25%",
                "confidence": "medium",
            })

        # Funded interest structure
        funded_interest_months = financials.get("funded_interest_months", 0)
        if funded_interest_months > 18:
            angles.append({
                "angle": "funded_interest_structure",
                "structure": f"{funded_interest_months} months funded interest from bond proceeds — covers full ramp period",
                "rationale": "Eliminates cash flow drag during lease-up/construction, strengthens DSCR trajectory",
                "confidence": "high",
            })

        # LURA tax-exempt
        entity_type = deal.get("entity_type", "")
        borrower_type = deal.get("borrower_type", "")
        summary_lower = deal.get("summary", "").lower()
        if "501(c)(3)" in entity_type or "501(c)(3)" in borrower_type or "501(c)(3)" in summary_lower or "lura" in summary_lower:
            angles.append({
                "angle": "lura_tax_exempt",
                "structure": "LURA-qualified 501(c)(3) conduit — tax-exempt bond issuance via governmental issuer",
                "rationale": "Land Use Restriction Agreement enables deep tax-exempt pricing, 150-250bps below taxable",
                "confidence": "high",
            })

        return {
            "deal_id": deal_id,
            "deal_name": deal.get("name", ""),
            "angles_found": len(angles),
            "angles": angles,
        }

    def find_bond_angles_with_portfolio(self, deal: dict, all_deals: list[dict]) -> dict:
        """Bond angles including portfolio-level cross-collateral detection."""
        result = self.find_bond_angles(deal)
        sponsor = deal.get("sponsor", deal.get("owner", ""))
        if sponsor:
            same_sponsor = [d for d in all_deals if d.get("sponsor", d.get("owner", "")) == sponsor and d.get("id") != deal.get("id")]
            if len(same_sponsor) >= 1:
                result["angles"].append({
                    "angle": "portfolio_cross_collateral",
                    "structure": f"Cross-collateralise with {len(same_sponsor)} other {sponsor} deals for portfolio-level credit enhancement",
                    "related_deals": [d.get("name", d.get("id", "")) for d in same_sponsor],
                    "rationale": "Pooled collateral reduces single-asset risk, potential rating uplift",
                    "confidence": "medium" if len(same_sponsor) == 1 else "high",
                })
                result["angles_found"] = len(result["angles"])
        return result

    # ── IPO trajectory ───────────────────────────────────────────
    def assess_ipo_trajectory(self, deal: dict) -> dict:
        """Pre-IPO readiness and trajectory for equity deals."""
        deal_id = deal.get("id", "unknown")
        financials = deal.get("financials", {})
        size = deal.get("size_usd", 0)
        summary = deal.get("summary", "").lower()

        # Pull from financials OR top-level (deals store them nested)
        revenue_at_mat = financials.get("revenue_at_maturity", deal.get("revenue_at_maturity", 0))
        ebitda_at_mat = financials.get("ebitda_at_maturity", deal.get("ebitda_at_maturity", 0))
        hold_years = financials.get("hold_period_years", deal.get("hold_period_years", 5))
        exit_mult = financials.get("exit_multiple", deal.get("exit_multiple", 0))

        ipo_score = 0
        factors = []

        # Revenue scale
        if revenue_at_mat >= 100_000_000:
            ipo_score += 30
            factors.append({"factor": "revenue_scale", "value": revenue_at_mat, "impact": "+30"})
        elif revenue_at_mat >= 25_000_000:
            ipo_score += 15
            factors.append({"factor": "revenue_scale", "value": revenue_at_mat, "impact": "+15"})

        # EBITDA scale
        if ebitda_at_mat >= 50_000_000:
            ipo_score += 25
            factors.append({"factor": "ebitda_scale", "value": ebitda_at_mat, "impact": "+25"})
        elif ebitda_at_mat >= 10_000_000:
            ipo_score += 12
            factors.append({"factor": "ebitda_scale", "value": ebitda_at_mat, "impact": "+12"})

        # Exit multiple quality
        if exit_mult >= 10:
            ipo_score += 20
            factors.append({"factor": "exit_multiple", "value": exit_mult, "impact": "+20"})

        # Deal size (larger = more institutional readiness)
        if size >= 500_000_000:
            ipo_score += 20
            factors.append({"factor": "deal_size_mega", "value": size, "impact": "+20"})
        elif size >= 100_000_000:
            ipo_score += 15
            factors.append({"factor": "deal_size", "value": size, "impact": "+15"})

        # Government/defense anchor customers
        if financials.get("government_contract_dependent") or any(kw in summary for kw in ("mod ", "nhs", "dod", "government", "military", "defense")):
            ipo_score += 10
            factors.append({"factor": "government_anchor", "value": True, "impact": "+10"})

        # Strategic investor backing (NVIDIA, Dell, etc.)
        strategic_keywords = ("nvidia", "dell", "microsoft", "google", "amazon", "intel", "qualcomm", "softbank")
        if any(kw in summary for kw in strategic_keywords):
            ipo_score += 15
            factors.append({"factor": "strategic_investor_backing", "value": True, "impact": "+15"})

        # Equity raise size signals institutional scale
        equity_raise = financials.get("equity_raise", financials.get("primary_equity", 0))
        if equity_raise >= 500_000_000:
            ipo_score += 10
            factors.append({"factor": "institutional_equity_scale", "value": equity_raise, "impact": "+10"})

        # Infrastructure/data center plays have natural IPO paths
        sector = deal.get("sector", deal.get("asset_class", ""))
        if sector in ("data_centers", "technology", "biotech_pharma"):
            ipo_score += 5
            factors.append({"factor": "sector_ipo_frequency", "value": sector, "impact": "+5"})

        # Debt component signals capital markets sophistication
        debt_raise = financials.get("debt_raise", 0)
        if debt_raise >= 500_000_000:
            ipo_score += 5
            factors.append({"factor": "debt_capital_markets_activity", "value": debt_raise, "impact": "+5"})

        trajectory = "not_viable"
        if ipo_score >= 70:
            trajectory = "strong_candidate"
        elif ipo_score >= 40:
            trajectory = "possible_with_milestones"
        elif ipo_score >= 20:
            trajectory = "long_term_potential"

        # NEST positioning — what role do we play at each stage
        nest_positioning = self._nest_ipo_positioning(trajectory, deal, debt_raise)

        return {
            "deal_id": deal_id,
            "deal_name": deal.get("name", ""),
            "ipo_score": min(ipo_score, 100),
            "trajectory": trajectory,
            "hold_period_years": hold_years,
            "factors": factors,
            "nest_positioning": nest_positioning,
            "recommendation": self._ipo_recommendation(trajectory, deal),
        }

    def _nest_ipo_positioning(self, trajectory: str, deal: dict, debt_raise: float) -> dict:
        """Determine NEST's role at each stage of the company's lifecycle."""
        positioning = {"current_stage": deal.get("stage", "intake"), "roles": []}

        if debt_raise > 0:
            positioning["roles"].append({
                "stage": "pre_ipo",
                "role": "Infrastructure debt structuring",
                "value": f"${debt_raise:,.0f} bond/project finance",
                "timing": "Now",
            })

        if trajectory in ("strong_candidate", "possible_with_milestones"):
            positioning["roles"].append({
                "stage": "growth",
                "role": "Pre-IPO convertible note / bridge facility",
                "timing": "12-18 months pre-IPO",
            })
            positioning["roles"].append({
                "stage": "ipo",
                "role": "Co-manager or selling group on IPO",
                "timing": "At IPO",
            })
            positioning["roles"].append({
                "stage": "post_ipo",
                "role": "Corporate bond issuance for expansion",
                "timing": "6-12 months post-IPO",
            })

        return positioning

    # ── Deal attractiveness scoring ──────────────────────────────
    def score_deal_attractiveness(self, deal: dict) -> dict:
        """Score a deal 0-100 on attractiveness to NEST's mandate."""
        score = 0
        breakdown = {}

        size = deal.get("size_usd", 0)
        # Size fit (NEST sweet spot $15M-$300M)
        if 15_000_000 <= size <= 300_000_000:
            size_pts = 25
        elif size > 300_000_000:
            size_pts = 15  # big but executable
        else:
            size_pts = 10
        breakdown["size_fit"] = size_pts
        score += size_pts

        # Sector alignment
        sector = deal.get("sector", deal.get("asset_class", ""))
        sector_pts = {"senior_living": 25, "senior_housing": 25, "infrastructure": 20,
                      "industrial": 18, "multifamily": 18, "data_centers": 15,
                      "biotech_pharma": 12, "technology": 8}.get(sector, 5)
        breakdown["sector_alignment"] = sector_pts
        score += sector_pts

        # Stage advancement
        stage = deal.get("stage", "intake")
        stage_pts = {"book_building": 20, "structuring": 15, "teaser_live": 12,
                     "intake": 8}.get(stage, 5)
        breakdown["stage_advancement"] = stage_pts
        score += stage_pts

        # Bond structurability
        deal_type = deal.get("deal_type", "")
        bond_pts = {"refi": 20, "construction": 18, "bridge_to_bond": 16,
                    "equity_raise": 5}.get(deal_type, 10)
        breakdown["bond_structurability"] = bond_pts
        score += bond_pts

        # Yield
        yld = deal.get("projected_yield_pct") or 0
        yield_pts = min(int(yld * 1.5), 10)
        breakdown["yield_premium"] = yield_pts
        score += yield_pts

        return {
            "deal_id": deal.get("id", "unknown"),
            "deal_name": deal.get("name", ""),
            "score": min(score, 100),
            "breakdown": breakdown,
            "tier": "A" if score >= 75 else "B" if score >= 55 else "C",
        }

    # ── Deal Pitch Generation ───────────────────────────────────
    def generate_deal_pitch(self, deal: dict, all_deals: list[dict] | None = None) -> dict:
        """Generate a pitch for a specific deal, using cross-deal intelligence.

        This is what you show the client: why NEST is the right partner,
        what we see in their deal, and what we bring beyond capital.
        """
        deal_id = deal.get("id", "unknown")
        name = deal.get("name", "Unknown")
        size = deal.get("size_usd", 0)
        sector = deal.get("sector", deal.get("asset_class", ""))
        deal_type = deal.get("deal_type", "")
        financials = deal.get("financials", {})

        # Bond angles for this deal
        angles = self.find_bond_angles(deal)

        # Cross-deal leverage — show sector expertise
        sector_deals = []
        portfolio_value = 0
        if all_deals:
            for d in all_deals:
                d_sector = d.get("sector", d.get("asset_class", ""))
                if d_sector == sector and d.get("id") != deal_id:
                    sector_deals.append(d.get("name", ""))
                    portfolio_value += d.get("size_usd", 0)

        # Capital solutions menu
        solutions = []
        if deal_type in ("refi", "bridge_to_bond"):
            solutions.append({"solution": "Tax-Exempt Bond Refinancing", "structure": "Conduit issuer (LGFC/IDA), Hylant surety enhancement, 20-30yr term", "advantage": "150-200bps savings vs taxable"})
        if deal_type == "construction":
            solutions.append({"solution": "Construction-to-Perm Bond", "structure": "Draw schedule during construction, auto-convert to perm at CO", "advantage": "Single closing, no refi risk"})
        if size >= 50_000_000:
            solutions.append({"solution": "A/B Tranche Execution", "structure": "Series A (IG, 75% LTC) + Series B (mezzanine, higher yield)", "advantage": "Maximize proceeds while maintaining investment grade on senior"})
        solutions.append({"solution": "Surety Enhancement", "structure": "Hylant wrap — 2-3 notch rating uplift", "advantage": "Lower coupon, broader investor base"})
        if deal_type == "equity_raise":
            solutions.append({"solution": "Equity + Debt Hybrid", "structure": "Equity injection paired with project finance bonds for infrastructure", "advantage": "NEST participates in both equity returns and bond fees"})

        # Pitch narrative
        pitch_points = []
        if sector_deals:
            pitch_points.append(f"NEST has {len(sector_deals)} active deals in {sector} totaling ${portfolio_value:,.0f} — deep sector knowledge and established investor relationships.")
        pitch_points.append(f"Jacaranda Trace ($231M, FL LGFC) serves as our structural blueprint — proven execution on similar structures.")
        if angles["angles_found"] > 0:
            pitch_points.append(f"We identified {angles['angles_found']} structuring angles that reduce cost of capital.")
        pitch_points.append("Hylant Insurance partnership provides surety enhancement unavailable through traditional channels.")
        pitch_points.append("Full-stack platform: origination through placement, with AI-driven credit analysis and real-time EMMA monitoring.")

        return {
            "deal_id": deal_id,
            "deal_name": name,
            "pitch_type": "institutional_client",
            "capital_solutions": solutions,
            "bond_angles": angles["angles"],
            "sector_expertise": {
                "active_sector_deals": sector_deals,
                "sector_portfolio_value": portfolio_value,
                "sector": sector,
            },
            "pitch_points": pitch_points,
            "competitive_advantages": [
                "18-year JPMorgan pedigree — top nationally 11x",
                "Hylant surety partnership — 2-3 notch rating uplift",
                "AI-powered underwriting — 48hr term sheet, not 6 weeks",
                "Full EMMA integration — real-time continuing disclosure monitoring",
                "Blueprint execution — Jacaranda Trace $231M as proven template",
            ],
            "next_steps": [
                "30-minute discovery call to review current capital structure",
                "NDA + document package (financials, appraisal, rent roll)",
                "Indicative term sheet within 48 hours of document receipt",
                "Credit committee approval within 2 weeks",
            ],
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── Feasibility study signal extraction ────────────────────
    def extract_feasibility_signals(self, feasibility_data: dict) -> list[dict]:
        """Mine a feasibility study for EagleEye signals.

        Expects feasibility_data with keys like:
            dscr_projections: list[float]  (year-over-year DSCRs)
            revenue_projections: list[float]  (annual revenues)
            expense_projections: list[float]  (annual expenses)
            funded_interest_months: int
            ramp_period_months: int
            ief_pool_current: float  (current IEF pool balance)
            ief_pool_required: float  (required IEF pool)
            covenants: dict[str, dict]  e.g. {"dscr": {"current": 1.8, "minimum": 1.25}}
            entities: dict  e.g. {"owner": "...", "manager": "...", "underwriter": "..."}
            related_properties: list[dict]  e.g. [{"name": "Cabana at Jensen Dunes", ...}]
        """
        signals = []

        # DSCR trajectory
        dscr_proj = feasibility_data.get("dscr_projections", [])
        if len(dscr_proj) >= 2:
            first, last = dscr_proj[0], dscr_proj[-1]
            if last > first * 1.05:
                trajectory = "improving"
            elif last < first * 0.95:
                trajectory = "declining"
            else:
                trajectory = "flat"
            signals.append({
                "signal_type": "dscr_trajectory",
                "value": trajectory,
                "detail": {"start": first, "end": last, "years": len(dscr_proj)},
                "severity": "positive" if trajectory == "improving" else "warning" if trajectory == "declining" else "neutral",
                "insight": f"DSCR moves from {first:.2f} to {last:.2f} over {len(dscr_proj)} years — {trajectory} trajectory.",
            })

        # Revenue growth (CAGR)
        rev_proj = feasibility_data.get("revenue_projections", [])
        if len(rev_proj) >= 2 and rev_proj[0] > 0:
            years = len(rev_proj) - 1
            cagr = (rev_proj[-1] / rev_proj[0]) ** (1 / years) - 1 if years > 0 else 0
            signals.append({
                "signal_type": "revenue_growth",
                "value": round(cagr * 100, 2),
                "detail": {"start_revenue": rev_proj[0], "end_revenue": rev_proj[-1], "years": years, "cagr_pct": round(cagr * 100, 2)},
                "severity": "positive" if cagr > 0.03 else "warning" if cagr < 0.01 else "neutral",
                "insight": f"Revenue CAGR of {cagr*100:.1f}% over {years} years.",
            })

        # Expense control
        exp_proj = feasibility_data.get("expense_projections", [])
        if len(exp_proj) >= 2 and len(rev_proj) >= 2 and exp_proj[0] > 0 and rev_proj[0] > 0:
            years = len(exp_proj) - 1
            exp_cagr = (exp_proj[-1] / exp_proj[0]) ** (1 / years) - 1 if years > 0 else 0
            rev_cagr = (rev_proj[-1] / rev_proj[0]) ** (1 / years) - 1 if years > 0 else 0
            controlled = exp_cagr < rev_cagr
            signals.append({
                "signal_type": "expense_control",
                "value": "controlled" if controlled else "outpacing_revenue",
                "detail": {"expense_cagr_pct": round(exp_cagr * 100, 2), "revenue_cagr_pct": round(rev_cagr * 100, 2)},
                "severity": "positive" if controlled else "warning",
                "insight": f"Expense growth {exp_cagr*100:.1f}% vs revenue growth {rev_cagr*100:.1f}% — {'margin expansion' if controlled else 'margin compression'}.",
            })

        # Funded interest coverage
        fi_months = feasibility_data.get("funded_interest_months", 0)
        ramp_months = feasibility_data.get("ramp_period_months", 0)
        if fi_months > 0 and ramp_months > 0:
            coverage_pct = round((fi_months / ramp_months) * 100, 1)
            signals.append({
                "signal_type": "funded_interest_coverage",
                "value": coverage_pct,
                "detail": {"funded_interest_months": fi_months, "ramp_period_months": ramp_months},
                "severity": "positive" if coverage_pct >= 100 else "warning" if coverage_pct >= 75 else "critical",
                "insight": f"Funded interest covers {coverage_pct}% of {ramp_months}-month ramp period ({fi_months} months funded).",
            })

        # IEF pool coverage
        ief_current = feasibility_data.get("ief_pool_current", 0)
        ief_required = feasibility_data.get("ief_pool_required", 0)
        if ief_required > 0:
            ief_ratio = round(ief_current / ief_required, 3)
            signals.append({
                "signal_type": "ief_pool_coverage",
                "value": ief_ratio,
                "detail": {"current": ief_current, "required": ief_required},
                "severity": "positive" if ief_ratio >= 1.0 else "warning" if ief_ratio >= 0.8 else "critical",
                "insight": f"IEF pool at {ief_ratio:.1%} of requirement (${ief_current:,.0f} vs ${ief_required:,.0f}).",
            })

        # Covenant headroom
        covenants = feasibility_data.get("covenants", {})
        for cov_name, cov_data in covenants.items():
            current = cov_data.get("current", 0)
            minimum = cov_data.get("minimum", 0)
            maximum = cov_data.get("maximum")
            if minimum > 0:
                headroom = round((current - minimum) / minimum * 100, 1)
                breach = current < minimum
            elif maximum and maximum > 0:
                headroom = round((maximum - current) / maximum * 100, 1)
                breach = current > maximum
            else:
                continue
            signals.append({
                "signal_type": "covenant_headroom",
                "value": {"covenant": cov_name, "headroom_pct": headroom, "in_breach": breach},
                "detail": {"current": current, "minimum": minimum, "maximum": maximum},
                "severity": "critical" if breach else "warning" if abs(headroom) < 15 else "positive",
                "insight": f"{cov_name}: {'IN BREACH' if breach else f'{headroom:.1f}% headroom'} (current {current:.2f} vs {'min' if minimum else 'max'} {minimum or maximum:.2f}).",
            })

        # Entity relationships
        entities = feasibility_data.get("entities", {})
        if entities:
            signals.append({
                "signal_type": "entity_relationships",
                "value": entities,
                "detail": {k: v for k, v in entities.items()},
                "severity": "neutral",
                "insight": "Key parties: " + ", ".join(f"{k}={v}" for k, v in entities.items()) + ".",
            })

        # Related / sister properties
        related = feasibility_data.get("related_properties", [])
        if related:
            signals.append({
                "signal_type": "related_entities",
                "value": [r.get("name", "unknown") for r in related],
                "detail": related,
                "severity": "positive",
                "insight": f"{len(related)} sister properties identified — potential portfolio expansion: {', '.join(r.get('name', '') for r in related)}.",
            })

        return signals

    # ── Sister deal detection ───────────────────────────────────
    def detect_sister_deals(self, deal: dict, all_deals: list[dict]) -> list[dict]:
        """Find related entities/deals across the pipeline.

        Returns a list of relationship records, each linking the target deal
        to another deal via sponsor, manager, underwriter, geography, or sector.
        """
        results = []
        deal_id = deal.get("id", "unknown")

        sponsor = deal.get("sponsor", deal.get("owner", ""))
        manager = deal.get("manager", deal.get("property_manager", ""))
        underwriter = deal.get("underwriter", "")
        location = deal.get("location", "")
        state = location.split(",")[-1].strip() if "," in location else location
        sector = deal.get("sector", deal.get("asset_class", ""))

        for other in all_deals:
            if other.get("id") == deal_id:
                continue
            relationships = []

            o_sponsor = other.get("sponsor", other.get("owner", ""))
            if sponsor and o_sponsor and sponsor.lower() == o_sponsor.lower():
                relationships.append({
                    "link": "same_sponsor",
                    "entity": sponsor,
                    "play": "portfolio_play",
                    "insight": f"Same sponsor ({sponsor}) — portfolio-level credit, cross-collateral potential.",
                })

            o_manager = other.get("manager", other.get("property_manager", ""))
            if manager and o_manager and manager.lower() == o_manager.lower():
                relationships.append({
                    "link": "same_manager",
                    "entity": manager,
                    "play": "operating_efficiency",
                    "insight": f"Same manager ({manager}) — proven operating track record, shared overhead.",
                })

            o_underwriter = other.get("underwriter", "")
            if underwriter and o_underwriter and underwriter.lower() == o_underwriter.lower():
                relationships.append({
                    "link": "same_underwriter",
                    "entity": underwriter,
                    "play": "relationship_leverage",
                    "insight": f"Same underwriter ({underwriter}) — fee leverage, repeat execution efficiency.",
                })

            o_location = other.get("location", "")
            o_state = o_location.split(",")[-1].strip() if "," in o_location else o_location
            if state and o_state and state.lower() == o_state.lower():
                relationships.append({
                    "link": "same_geography",
                    "entity": state,
                    "play": "local_knowledge",
                    "insight": f"Same state ({state}) — shared counsel, issuer relationships, local market intelligence.",
                })

            o_sector = other.get("sector", other.get("asset_class", ""))
            if sector and o_sector and sector.lower() == o_sector.lower():
                relationships.append({
                    "link": "same_sector",
                    "entity": sector,
                    "play": "sector_expertise",
                    "insight": f"Same sector ({sector}) — investor overlap, comp analysis, operating benchmarks.",
                })

            if relationships:
                results.append({
                    "related_deal_id": other.get("id", "unknown"),
                    "related_deal_name": other.get("name", ""),
                    "related_deal_size": other.get("size_usd", 0),
                    "relationship_count": len(relationships),
                    "relationships": relationships,
                })

        results.sort(key=lambda r: r["relationship_count"], reverse=True)
        return results

    # ── Feasibility document checklist ──────────────────────────
    def generate_feasibility_checklist(self, deal: dict) -> dict:
        """Return required docs and their status for deal feasibility.

        Reads deal.get('documents', {}) — a dict of doc_type -> status.
        Status values: 'received', 'pending', 'not_applicable'.
        """
        required_docs = [
            {"doc_type": "feasibility_study", "description": "Market feasibility study by qualified third party"},
            {"doc_type": "appraisal", "description": "MAI-certified appraisal (as-is and as-complete)"},
            {"doc_type": "financial_statements_3yr", "description": "Audited financial statements (3 years)"},
            {"doc_type": "rent_roll", "description": "Current rent roll / unit mix with occupancy"},
            {"doc_type": "officer_certificate", "description": "Officer's certificate re: no material adverse change"},
            {"doc_type": "proforma", "description": "10-year proforma with assumptions"},
            {"doc_type": "sources_and_uses", "description": "Sources & uses of funds"},
            {"doc_type": "legal_opinion", "description": "Bond counsel legal opinion (tax-exempt status)"},
            {"doc_type": "title_insurance", "description": "Title insurance commitment"},
            {"doc_type": "environmental", "description": "Phase I environmental site assessment (Phase II if warranted)"},
        ]

        existing_docs = deal.get("documents", {})
        checklist = []
        received = 0
        total = len(required_docs)

        for doc in required_docs:
            status = existing_docs.get(doc["doc_type"], "pending")
            checklist.append({
                "doc_type": doc["doc_type"],
                "description": doc["description"],
                "status": status,
            })
            if status == "received":
                received += 1

        completeness = round((received / total) * 100, 1) if total > 0 else 0

        return {
            "deal_id": deal.get("id", "unknown"),
            "deal_name": deal.get("name", ""),
            "checklist": checklist,
            "received_count": received,
            "total_required": total,
            "completeness_pct": completeness,
            "ready_for_credit_committee": completeness >= 80,
            "blocking_items": [c["doc_type"] for c in checklist if c["status"] == "pending"],
        }

    # ── Deal readiness scoring (enhanced with feasibility) ──────
    def score_deal_readiness(self, deal: dict, feasibility: dict | None = None) -> dict:
        """Score deal readiness 0-100, optionally enhanced with feasibility data.

        Without feasibility: scores based on deal metadata (docs, stage, size).
        With feasibility: adds DSCR trajectory, covenant compliance, revenue growth,
        expense control, and IEF coverage into the score.
        """
        score = 0
        breakdown = {}

        # Base scoring from deal metadata
        # Stage progress (0-20)
        stage = deal.get("stage", "intake")
        stage_pts = {"book_building": 20, "structuring": 16, "teaser_live": 12,
                     "underwriting": 10, "intake": 5}.get(stage, 3)
        breakdown["stage_progress"] = stage_pts
        score += stage_pts

        # Document completeness (0-20)
        checklist = self.generate_feasibility_checklist(deal)
        doc_pts = int(checklist["completeness_pct"] * 0.2)
        breakdown["document_completeness"] = doc_pts
        score += doc_pts

        # Deal size in sweet spot (0-10)
        size = deal.get("size_usd", 0)
        if 15_000_000 <= size <= 300_000_000:
            size_pts = 10
        elif size > 300_000_000:
            size_pts = 7
        elif size > 0:
            size_pts = 4
        else:
            size_pts = 0
        breakdown["size_fit"] = size_pts
        score += size_pts

        # Has key parties identified (0-10)
        parties = 0
        if deal.get("sponsor") or deal.get("owner"):
            parties += 3
        if deal.get("underwriter"):
            parties += 3
        if deal.get("manager") or deal.get("property_manager"):
            parties += 2
        if deal.get("bond_counsel") or deal.get("legal"):
            parties += 2
        breakdown["key_parties"] = min(parties, 10)
        score += min(parties, 10)

        # Without feasibility, max is ~60 — scale remaining from metadata
        if feasibility is None:
            # Projected yield as proxy (0-10)
            yld = deal.get("projected_yield_pct", 0) or 0
            yield_pts = min(int(yld * 1.5), 10)
            breakdown["yield_indicator"] = yield_pts
            score += yield_pts

            # Sector alignment bonus (0-10)
            sector = deal.get("sector", deal.get("asset_class", ""))
            sector_pts = {"senior_living": 10, "senior_housing": 10, "infrastructure": 8,
                          "industrial": 7, "multifamily": 7, "data_centers": 6}.get(sector, 3)
            breakdown["sector_alignment"] = sector_pts
            score += sector_pts
        else:
            # Enhanced scoring with feasibility signals
            signals = self.extract_feasibility_signals(feasibility)
            signal_map = {s["signal_type"]: s for s in signals}

            # DSCR trajectory (0-10)
            dscr_sig = signal_map.get("dscr_trajectory")
            if dscr_sig:
                dscr_pts = {"improving": 10, "flat": 6, "declining": 2}.get(dscr_sig["value"], 4)
            else:
                dscr_pts = 0
            breakdown["dscr_trajectory"] = dscr_pts
            score += dscr_pts

            # Covenant compliance (0-10)
            cov_signals = [s for s in signals if s["signal_type"] == "covenant_headroom"]
            if cov_signals:
                breaches = sum(1 for s in cov_signals if s["value"]["in_breach"])
                tight = sum(1 for s in cov_signals if not s["value"]["in_breach"] and abs(s["value"]["headroom_pct"]) < 15)
                if breaches > 0:
                    cov_pts = 0
                elif tight > 0:
                    cov_pts = 5
                else:
                    cov_pts = 10
            else:
                cov_pts = 4  # no data, neutral
            breakdown["covenant_compliance"] = cov_pts
            score += cov_pts

            # Revenue growth (0-8)
            rev_sig = signal_map.get("revenue_growth")
            if rev_sig:
                cagr = rev_sig["value"]
                rev_pts = 8 if cagr > 5 else 6 if cagr > 3 else 3 if cagr > 0 else 0
            else:
                rev_pts = 0
            breakdown["revenue_growth"] = rev_pts
            score += rev_pts

            # Expense control (0-6)
            exp_sig = signal_map.get("expense_control")
            if exp_sig:
                exp_pts = 6 if exp_sig["value"] == "controlled" else 2
            else:
                exp_pts = 0
            breakdown["expense_control"] = exp_pts
            score += exp_pts

            # IEF coverage (0-6)
            ief_sig = signal_map.get("ief_pool_coverage")
            if ief_sig:
                ief_pts = 6 if ief_sig["value"] >= 1.0 else 3 if ief_sig["value"] >= 0.8 else 1
            else:
                ief_pts = 0
            breakdown["ief_coverage"] = ief_pts
            score += ief_pts

        final_score = min(score, 100)
        if final_score >= 80:
            readiness = "ready_for_credit_committee"
        elif final_score >= 60:
            readiness = "near_ready"
        elif final_score >= 40:
            readiness = "in_progress"
        else:
            readiness = "early_stage"

        return {
            "deal_id": deal.get("id", "unknown"),
            "deal_name": deal.get("name", ""),
            "readiness_score": final_score,
            "readiness_level": readiness,
            "breakdown": breakdown,
            "feasibility_enhanced": feasibility is not None,
            "scored_at": datetime.utcnow().isoformat(),
        }

    # ── Helpers ──────────────────────────────────────────────────
    def _market_context(self) -> dict:
        return {
            "10yr_treasury": 4.28,
            "muni_aaa_10yr": 3.15,
            "spread_bps": 113,
            "environment": "Rising rate environment — favor floating-to-fixed structures",
            "as_of": datetime.utcnow().isoformat(),
        }

    def _ipo_recommendation(self, trajectory: str, deal: dict) -> str:
        if trajectory == "strong_candidate":
            return f"{deal.get('name', 'Deal')} has strong IPO trajectory. Target dual-track: private placement now, IPO window in 18-24 months post-revenue ramp."
        elif trajectory == "possible_with_milestones":
            return f"{deal.get('name', 'Deal')} needs key milestones before IPO viability. Focus on revenue scale and institutional investor base first."
        elif trajectory == "long_term_potential":
            return f"{deal.get('name', 'Deal')} is early-stage. Build toward $50M+ revenue before evaluating public market exit."
        return f"{deal.get('name', 'Deal')} does not currently present a viable IPO path. Focus on private liquidity events."
