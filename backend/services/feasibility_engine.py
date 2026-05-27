"""Feasibility Engine — extracts, validates, and scores bond feasibility studies.

The feasibility study is THE critical document in bond origination.
Every projection, covenant test, and credit decision flows from it.

Based on Jacaranda Trace PLOM (Series 2025, $203M, FL LGFC) as structural template.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

# ── Bond Covenant Thresholds ──────────────────────────────────────

COVENANT_THRESHOLDS = {
    "dscr_floor": 1.20,
    "dscr_target_new_issuance": 1.50,
    "days_cash_minimum": 150,
    "occupancy_il_stabilized": 0.85,
    "occupancy_al_stabilized": 0.90,
    "occupancy_snf_stabilized": 0.90,
    "ief_coverage_minimum": 1.00,
}

# ── Scoring Weights ───────────────────────────────────────────────

SCORING_WEIGHTS = {
    "dscr_trajectory": 25,
    "days_cash_above_200": 20,
    "revenue_growth": 15,
    "expense_control": 15,
    "ief_coverage": 15,
    "funded_interest_months": 10,
}

# ── Jacaranda Trace Feasibility (Real Data — Series 2025) ────────

JACARANDA_TRACE_FEASIBILITY: dict[str, Any] = {
    "deal_name": "Convivial Jacaranda Trace, LLC",
    "issuer": "Florida Local Government Finance Commission",
    "underwriter": "B.C. Ziegler and Company",
    "accountant": "Forvis Mazars, LLP",
    "forecast_period": "2025-2029",
    "bond_par": 203_080_000,
    "series": {
        "2025A": {"amount": 178_080_000, "type": "tax_exempt_fixed", "oid": 3_715_000},
        "2025B": {"amount": 20_270_000, "type": "tax_exempt_fixed"},
        "2025C": {"amount": 4_730_000, "type": "taxable_short"},
    },
    "sources_total": 205_527_000,
    "uses": {
        "waj_units_purchase": 29_000_000,
        "clubhouse_whittier_improvements": 12_956_000,
        "healthcare_renovation": 9_488_000,
        "capital_reimbursement": 11_000_000,
        "title_insurance": 320_000,
        "refunding_existing_bonds": 112_105_000,
        "dsrf_2025a": 13_820_000,
        "dsrf_2025b": 1_166_000,
        "dsrf_2025c": 331_000,
        "funded_interest": 11_513_000,
        "cost_of_issuance": 3_828_000,
    },
    "forecast": {
        2025: {"revenue": 23_160, "expenses": 35_371, "dscr": 1.52, "days_cash": 209, "income_for_ds": 13_717, "debt_service": 9_026},
        2026: {"revenue": 27_553, "expenses": 37_048, "dscr": 1.81, "days_cash": 235, "income_for_ds": 17_569, "debt_service": 9_730},
        2027: {"revenue": 33_403, "expenses": 43_827, "dscr": 1.93, "days_cash": 235, "income_for_ds": 20_984, "debt_service": 10_856},
        2028: {"revenue": 38_988, "expenses": 46_923, "dscr": 1.83, "days_cash": 273, "income_for_ds": 25_338, "debt_service": 13_814},
        2029: {"revenue": 41_925, "expenses": 48_182, "dscr": 1.90, "days_cash": 314, "income_for_ds": 26_291, "debt_service": 13_818},
    },
    "unit_config": {
        "before": {"il": 248, "al": 19, "mc": 36, "snf": 0, "total": 303},
        "after": {"il": 371, "al": 51, "mc": 18, "snf": 16, "total": 456},
    },
    "timeline": {
        "bond_close": "2025-06",
        "whittier_reno_start": "2025-07",
        "snf_conversion_start": "2025-07",
        "new_al_open": "2026-06",
        "snf_open": "2027-01",
        "il_stabilized": "2027-07",
        "al_stabilized": "2027-12",
        "snf_stabilized": "2028-06",
    },
    "ief_pool": {
        "total_forecast": 38_705_219,
        "required_amount": 25_000_000,
        "coverage_pct": 1.548,
    },
    "funded_interest_months": 26,
}


class FeasibilityEngine:
    """Extracts, validates, and scores bond feasibility studies."""

    def extract_financial_forecast(self, data: dict) -> dict:
        """Structure raw feasibility data into platform-standard 5-year projections.

        Args:
            data: Raw feasibility study data with 'forecast' key containing
                  year-keyed dicts of financial metrics.

        Returns:
            Structured forecast with per-year projections and summary statistics.
        """
        raw_forecast = data.get("forecast", {})
        if not raw_forecast:
            return {"error": "No forecast data provided", "years": {}}

        years = sorted(raw_forecast.keys())
        structured: dict[int, dict] = {}

        for year in years:
            row = raw_forecast[year]
            structured[year] = {
                "revenue": row.get("revenue", 0),
                "expenses": row.get("expenses", 0),
                "net_income": row.get("revenue", 0) - row.get("expenses", 0),
                "dscr": row.get("dscr", 0),
                "days_cash_on_hand": row.get("days_cash", 0),
                "income_available_for_ds": row.get("income_for_ds", 0),
                "annual_debt_service": row.get("debt_service", 0),
            }

        # Compute summary across the forecast window
        first_year = years[0]
        last_year = years[-1]
        first_rev = structured[first_year]["revenue"]
        last_rev = structured[last_year]["revenue"]
        num_periods = len(years) - 1

        revenue_cagr = 0.0
        if first_rev > 0 and num_periods > 0:
            revenue_cagr = round((last_rev / first_rev) ** (1 / num_periods) - 1, 4)

        dscr_values = [structured[y]["dscr"] for y in years]

        return {
            "deal_name": data.get("deal_name", "Unknown"),
            "forecast_period": data.get("forecast_period", f"{first_year}-{last_year}"),
            "years": structured,
            "summary": {
                "revenue_cagr": revenue_cagr,
                "dscr_min": min(dscr_values),
                "dscr_max": max(dscr_values),
                "dscr_avg": round(sum(dscr_values) / len(dscr_values), 2),
                "dscr_trend": "improving" if dscr_values[-1] > dscr_values[0] else "declining",
                "total_debt_service": sum(structured[y]["annual_debt_service"] for y in years),
                "total_income_for_ds": sum(structured[y]["income_available_for_ds"] for y in years),
            },
            "extracted_at": datetime.utcnow().isoformat(),
        }

    def validate_bond_covenants(self, forecast: dict) -> dict:
        """Check projected financials against bond covenants.

        Tests DSCR floors, days cash on hand, occupancy, and IEF pool coverage
        against standard bond indenture requirements.

        Args:
            forecast: Output of extract_financial_forecast or dict with
                      'years' key and optional 'occupancy'/'ief_pool' data.

        Returns:
            Per-covenant pass/fail with specific values and overall status.
        """
        # Handle both raw feasibility data and processed output
        years_data = forecast.get("years", {})
        if not years_data and "forecast" in forecast:
            raw = forecast["forecast"]
            years_data = {
                y: {
                    "dscr": d.get("dscr", 0),
                    "days_cash_on_hand": d.get("days_cash", d.get("days_cash_on_hand", 0)),
                    "revenue": d.get("revenue", 0),
                    "expenses": d.get("expenses", 0),
                }
                for y, d in raw.items()
            }
        results: dict[str, dict] = {}
        all_pass = True

        # ── DSCR Floor (1.20x) ────────────────────────────────────
        dscr_values = {y: d["dscr"] for y, d in years_data.items()}
        min_dscr = min(dscr_values.values()) if dscr_values else 0
        dscr_floor_pass = min_dscr >= COVENANT_THRESHOLDS["dscr_floor"]
        results["dscr_floor"] = {
            "covenant": f"Minimum {COVENANT_THRESHOLDS['dscr_floor']}x",
            "actual": min_dscr,
            "year_of_minimum": min(dscr_values, key=dscr_values.get) if dscr_values else None,
            "all_years": dscr_values,
            "pass": dscr_floor_pass,
        }
        if not dscr_floor_pass:
            all_pass = False

        # ── DSCR Target for New Issuance (1.50x) ──────────────────
        dscr_target_pass = min_dscr >= COVENANT_THRESHOLDS["dscr_target_new_issuance"]
        results["dscr_new_issuance_target"] = {
            "covenant": f"Target {COVENANT_THRESHOLDS['dscr_target_new_issuance']}x for new issuance",
            "actual": min_dscr,
            "pass": dscr_target_pass,
            "note": "Advisory — not a hard covenant, but underwriters want this",
        }

        # ── Days Cash on Hand (150 minimum) ───────────────────────
        days_cash_values = {y: d.get("days_cash_on_hand", 0) for y, d in years_data.items()}
        min_days_cash = min(days_cash_values.values()) if days_cash_values else 0
        days_cash_pass = min_days_cash >= COVENANT_THRESHOLDS["days_cash_minimum"]
        results["days_cash_on_hand"] = {
            "covenant": f"Minimum {COVENANT_THRESHOLDS['days_cash_minimum']} days",
            "actual_minimum": min_days_cash,
            "year_of_minimum": min(days_cash_values, key=days_cash_values.get) if days_cash_values else None,
            "all_years": days_cash_values,
            "pass": days_cash_pass,
        }
        if not days_cash_pass:
            all_pass = False

        # ── Occupancy at Stabilization ────────────────────────────
        occupancy = forecast.get("occupancy", {})
        occ_results: dict[str, dict] = {}
        for care_level, threshold_key in [
            ("il", "occupancy_il_stabilized"),
            ("al", "occupancy_al_stabilized"),
            ("snf", "occupancy_snf_stabilized"),
        ]:
            if care_level in occupancy:
                actual = occupancy[care_level]
                threshold = COVENANT_THRESHOLDS[threshold_key]
                occ_pass = actual >= threshold
                occ_results[care_level] = {
                    "covenant": f"Minimum {threshold:.0%} at stabilization",
                    "actual": actual,
                    "pass": occ_pass,
                }
                if not occ_pass:
                    all_pass = False

        results["occupancy_stabilized"] = occ_results if occ_results else {
            "note": "No occupancy data provided — requires manual verification"
        }

        # ── IEF Pool Coverage ─────────────────────────────────────
        ief = forecast.get("ief_pool", {})
        if ief:
            coverage = ief.get("coverage_pct", 0)
            ief_pass = coverage >= COVENANT_THRESHOLDS["ief_coverage_minimum"]
            results["ief_pool"] = {
                "covenant": f"Coverage >= {COVENANT_THRESHOLDS['ief_coverage_minimum']:.0%}",
                "total_forecast": ief.get("total_forecast", 0),
                "required_amount": ief.get("required_amount", 0),
                "coverage_pct": coverage,
                "pass": ief_pass,
            }
            if not ief_pass:
                all_pass = False
        else:
            results["ief_pool"] = {"note": "No IEF pool data provided"}

        return {
            "overall_pass": all_pass,
            "covenants": results,
            "validated_at": datetime.utcnow().isoformat(),
        }

    def extract_sources_and_uses(self, data: dict) -> dict:
        """Structure a Sources & Uses table from feasibility data.

        Args:
            data: Raw feasibility data with 'series', 'sources_total', and 'uses' keys.

        Returns:
            Formatted sources and uses with totals, balance check, and per-item breakdown.
        """
        # ── Sources ───────────────────────────────────────────────
        series = data.get("series", {})
        sources: list[dict] = []
        sources_total_computed = 0

        for name, details in sorted(series.items()):
            amount = details.get("amount", 0)
            oid = details.get("oid", 0)
            net = amount - oid
            sources.append({
                "name": name,
                "par_amount": amount,
                "oid": oid,
                "net_proceeds": net,
                "type": details.get("type", "unknown"),
            })
            sources_total_computed += net

        # Add OID back for total par
        total_par = sum(s.get("amount", 0) for s in series.values())

        # ── Uses ──────────────────────────────────────────────────
        raw_uses = data.get("uses", {})
        uses: list[dict] = []
        uses_total = 0

        for category, amount in raw_uses.items():
            label = category.replace("_", " ").title()
            uses.append({"category": category, "label": label, "amount": amount})
            uses_total += amount

        # ── Balance ───────────────────────────────────────────────
        stated_sources = data.get("sources_total", sources_total_computed)
        balance = stated_sources - uses_total

        return {
            "deal_name": data.get("deal_name", "Unknown"),
            "bond_par": data.get("bond_par", total_par),
            "sources": {
                "series": sources,
                "total_par": total_par,
                "total_net_proceeds": sources_total_computed,
                "stated_total": stated_sources,
            },
            "uses": {
                "items": sorted(uses, key=lambda u: u["amount"], reverse=True),
                "total": uses_total,
            },
            "balance": balance,
            "balanced": abs(balance) < 1_000,  # Allow minor rounding
            "extracted_at": datetime.utcnow().isoformat(),
        }

    def extract_project_timeline(self, data: dict) -> dict:
        """Pull construction/ramp milestones with dates.

        Args:
            data: Raw feasibility data with 'timeline' key.

        Returns:
            Ordered milestones with phase groupings.
        """
        raw_timeline = data.get("timeline", {})
        if not raw_timeline:
            return {"error": "No timeline data provided", "milestones": []}

        # Group milestones by phase
        phase_map = {
            "bond_close": "financing",
            "whittier_reno_start": "construction",
            "snf_conversion_start": "construction",
            "new_al_open": "construction",
            "snf_open": "construction",
            "il_stabilized": "stabilization",
            "al_stabilized": "stabilization",
            "snf_stabilized": "stabilization",
        }

        milestones: list[dict] = []
        for event, date_str in sorted(raw_timeline.items(), key=lambda x: x[1]):
            milestones.append({
                "event": event,
                "label": event.replace("_", " ").title(),
                "date": date_str,
                "phase": phase_map.get(event, "other"),
            })

        # Compute duration from first to last
        dates = sorted(raw_timeline.values())
        first_date = dates[0]
        last_date = dates[-1]

        return {
            "deal_name": data.get("deal_name", "Unknown"),
            "milestones": milestones,
            "earliest": first_date,
            "latest": last_date,
            "phases": {
                "financing": [m for m in milestones if m["phase"] == "financing"],
                "construction": [m for m in milestones if m["phase"] == "construction"],
                "stabilization": [m for m in milestones if m["phase"] == "stabilization"],
            },
            "extracted_at": datetime.utcnow().isoformat(),
        }

    def extract_unit_configuration(self, data: dict) -> dict:
        """Before/after unit mix with level of care breakdown.

        Args:
            data: Raw feasibility data with 'unit_config' key.

        Returns:
            Unit configuration with deltas and care level percentages.
        """
        config = data.get("unit_config", {})
        before = config.get("before", {})
        after = config.get("after", {})

        if not before or not after:
            return {"error": "Incomplete unit configuration data"}

        care_levels = ["il", "al", "mc", "snf"]
        before_total = before.get("total", sum(before.get(c, 0) for c in care_levels))
        after_total = after.get("total", sum(after.get(c, 0) for c in care_levels))

        deltas: dict[str, dict] = {}
        for care in care_levels:
            b = before.get(care, 0)
            a = after.get(care, 0)
            deltas[care] = {
                "before": b,
                "after": a,
                "change": a - b,
                "pct_of_total_before": round(b / before_total, 3) if before_total else 0,
                "pct_of_total_after": round(a / after_total, 3) if after_total else 0,
            }

        return {
            "deal_name": data.get("deal_name", "Unknown"),
            "before": {"units": before, "total": before_total},
            "after": {"units": after, "total": after_total},
            "net_new_units": after_total - before_total,
            "growth_pct": round((after_total - before_total) / before_total, 3) if before_total else 0,
            "deltas": deltas,
            "care_mix_shift": {
                "il_concentration_before": round(before.get("il", 0) / before_total, 3) if before_total else 0,
                "il_concentration_after": round(after.get("il", 0) / after_total, 3) if after_total else 0,
                "healthcare_pct_after": round(
                    (after.get("al", 0) + after.get("mc", 0) + after.get("snf", 0)) / after_total, 3
                ) if after_total else 0,
            },
            "extracted_at": datetime.utcnow().isoformat(),
        }

    def score_feasibility(self, forecast: dict) -> dict:
        """Score 0-100 on feasibility strength across six dimensions.

        Scoring dimensions (total 100):
          - DSCR trajectory (improving = good, declining = bad): 25 pts
          - Days cash on hand above 200: 20 pts
          - Revenue growth rate: 15 pts
          - Expense control (expense growth < revenue growth): 15 pts
          - IEF pool coverage above 120%: 15 pts
          - Funded interest coverage (months): 10 pts

        Args:
            forecast: Output from extract_financial_forecast or raw feasibility data
                      enriched with 'ief_pool' and 'funded_interest_months'.

        Returns:
            Score breakdown with total, grade, and per-dimension detail.
        """
        # Handle both raw feasibility data and processed output
        years_data = forecast.get("years", {})
        if not years_data and "forecast" in forecast:
            raw = forecast["forecast"]
            years_data = {
                y: {
                    "dscr": d.get("dscr", 0),
                    "days_cash_on_hand": d.get("days_cash", d.get("days_cash_on_hand", 0)),
                    "revenue": d.get("revenue", 0),
                    "expenses": d.get("expenses", 0),
                }
                for y, d in raw.items()
            }
        years = sorted(years_data.keys())
        scores: dict[str, dict] = {}
        total = 0

        # ── 1. DSCR Trajectory (25 pts) ──────────────────────────
        if len(years) >= 2:
            dscr_values = [years_data[y]["dscr"] for y in years]
            first_dscr = dscr_values[0]
            last_dscr = dscr_values[-1]
            dscr_change = last_dscr - first_dscr

            # Full marks if improving by 0.3+, zero if declining
            if dscr_change >= 0.3:
                pts = 25
            elif dscr_change > 0:
                pts = round(25 * (dscr_change / 0.3))
            else:
                pts = max(0, round(25 + 25 * dscr_change))  # Penalize decline

            # Bonus check: never drops below 1.20
            min_dscr = min(dscr_values)
            if min_dscr < 1.20:
                pts = max(0, pts - 10)

            scores["dscr_trajectory"] = {
                "points": pts,
                "max": 25,
                "first_year_dscr": first_dscr,
                "last_year_dscr": last_dscr,
                "change": round(dscr_change, 2),
                "trend": "improving" if dscr_change > 0 else "declining",
            }
            total += pts
        else:
            scores["dscr_trajectory"] = {"points": 0, "max": 25, "note": "Insufficient data"}

        # ── 2. Days Cash on Hand Above 200 (20 pts) ───────────────
        if years:
            days_cash_values = [years_data[y].get("days_cash_on_hand", 0) for y in years]
            avg_days = sum(days_cash_values) / len(days_cash_values)
            min_days = min(days_cash_values)

            if min_days >= 200:
                pts = 20
            elif min_days >= 150:
                pts = round(20 * (min_days - 100) / 100)
            else:
                pts = max(0, round(20 * (min_days / 200)))

            scores["days_cash_above_200"] = {
                "points": pts,
                "max": 20,
                "average": round(avg_days),
                "minimum": min_days,
            }
            total += pts
        else:
            scores["days_cash_above_200"] = {"points": 0, "max": 20, "note": "No data"}

        # ── 3. Revenue Growth Rate (15 pts) ───────────────────────
        if len(years) >= 2:
            first_rev = years_data[years[0]].get("revenue", 0)
            last_rev = years_data[years[-1]].get("revenue", 0)
            num_periods = len(years) - 1

            if first_rev > 0:
                cagr = (last_rev / first_rev) ** (1 / num_periods) - 1
            else:
                cagr = 0

            # 10%+ CAGR = full marks, 0% = zero
            if cagr >= 0.10:
                pts = 15
            elif cagr > 0:
                pts = round(15 * (cagr / 0.10))
            else:
                pts = 0

            scores["revenue_growth"] = {
                "points": pts,
                "max": 15,
                "cagr": round(cagr, 4),
                "first_year_revenue": first_rev,
                "last_year_revenue": last_rev,
            }
            total += pts
        else:
            scores["revenue_growth"] = {"points": 0, "max": 15, "note": "Insufficient data"}

        # ── 4. Expense Control (15 pts) ───────────────────────────
        if len(years) >= 2:
            first_exp = years_data[years[0]].get("expenses", 0)
            last_exp = years_data[years[-1]].get("expenses", 0)

            if first_exp > 0:
                exp_cagr = (last_exp / first_exp) ** (1 / num_periods) - 1
            else:
                exp_cagr = 0

            rev_cagr = cagr  # Reuse from above

            # Full marks if expense growth is significantly below revenue growth
            gap = rev_cagr - exp_cagr
            if gap >= 0.03:
                pts = 15
            elif gap > 0:
                pts = round(15 * (gap / 0.03))
            else:
                pts = max(0, round(15 * (1 + gap)))

            scores["expense_control"] = {
                "points": pts,
                "max": 15,
                "revenue_cagr": round(rev_cagr, 4),
                "expense_cagr": round(exp_cagr, 4),
                "spread": round(gap, 4),
            }
            total += pts
        else:
            scores["expense_control"] = {"points": 0, "max": 15, "note": "Insufficient data"}

        # ── 5. IEF Pool Coverage Above 120% (15 pts) ─────────────
        ief = forecast.get("ief_pool", {})
        if ief:
            coverage = ief.get("coverage_pct", 0)
            if coverage >= 1.50:
                pts = 15
            elif coverage >= 1.20:
                pts = round(15 * (coverage - 1.0) / 0.5)
            elif coverage >= 1.0:
                pts = round(15 * (coverage - 1.0) / 0.2 * 0.5)
            else:
                pts = 0

            scores["ief_coverage"] = {
                "points": pts,
                "max": 15,
                "coverage_pct": coverage,
                "total_forecast": ief.get("total_forecast", 0),
                "required": ief.get("required_amount", 0),
            }
            total += pts
        else:
            scores["ief_coverage"] = {"points": 0, "max": 15, "note": "No IEF data"}

        # ── 6. Funded Interest Coverage in Months (10 pts) ────────
        funded_months = forecast.get("funded_interest_months", 0)
        if funded_months >= 24:
            pts = 10
        elif funded_months >= 12:
            pts = round(10 * (funded_months / 24))
        elif funded_months > 0:
            pts = round(10 * (funded_months / 24))
        else:
            pts = 0

        scores["funded_interest_months"] = {
            "points": pts,
            "max": 10,
            "months": funded_months,
        }
        total += pts

        # ── Grade Assignment ──────────────────────────────────────
        if total >= 90:
            grade = "A"
            assessment = "Exceptional feasibility — strong across all dimensions"
        elif total >= 75:
            grade = "B+"
            assessment = "Solid feasibility — minor areas for improvement"
        elif total >= 60:
            grade = "B"
            assessment = "Adequate feasibility — some covenants tight"
        elif total >= 45:
            grade = "C"
            assessment = "Marginal feasibility — structural enhancements needed"
        else:
            grade = "D"
            assessment = "Weak feasibility — significant concerns, may not be bondable"

        return {
            "total_score": total,
            "max_score": 100,
            "grade": grade,
            "assessment": assessment,
            "dimensions": scores,
            "scored_at": datetime.utcnow().isoformat(),
        }
