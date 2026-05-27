"""
NEST Credit Memo Engine — unit-level analysis, campus cash flow modeling,
appraisal cross-referencing, and structured credit memo generation.

Takes unit-level data (WAJ spreadsheet: 125 IL units with purchase prices,
appraisals, renovation costs, square footage, status) and produces a full
credit memo with campus-level financial projections.

Seeded with real Jacaranda Trace / Convivial WAJ data.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any


# ── WAJ Unit Data (Real — Convivial Jacaranda Trace) ────────────────

WAJ_UNIT_DATA: dict[str, dict[str, Any]] = {
    "villas": {
        "count": 11,
        "avg_purchase": 382_636,
        "avg_appraisal": 381_636,
        "avg_reno": 0,
        "avg_sqft": 1826,
        "avg_ief_traditional": 571_038,
        "avg_ief_80_75": 929_275,
        "avg_monthly_fee": 5469,
    },
    "whittier": {
        "count": 84,
        "avg_purchase": 245_000,
        "avg_appraisal": 251_000,
        "avg_reno": 110_000,
        "avg_sqft": 1350,
        "avg_ief_traditional": 350_000,
        "avg_ief_80_75": 550_000,
        "avg_monthly_fee": 4041,
    },
    "barclay": {
        "count": 201,
        "avg_purchase": 0,
        "avg_appraisal": 0,
        "avg_reno": 0,
        "avg_sqft": 1680,
        "avg_ief_traditional": 419_886,
        "avg_ief_80_75": 680_216,
        "avg_monthly_fee": 5065,
    },
}

# ── Multifamily / Senior Living Benchmarks ──────────────────────────

MULTIFAMILY_BENCHMARKS: dict[str, dict[str, Any]] = {
    "ccrc_senior_living": {
        "avg_monthly_fee_il": 4800,
        "avg_entrance_fee": 400_000,
        "stabilized_occupancy": 0.93,
        "operating_expense_ratio": 0.65,
        "management_fee_pct": 0.05,
        "dscr_target": 1.50,
        "ltv_max": 0.75,
        "cap_rate_range": (0.055, 0.075),
    },
    "multifamily_conventional": {
        "avg_monthly_rent": 1800,
        "stabilized_occupancy": 0.95,
        "operating_expense_ratio": 0.45,
        "management_fee_pct": 0.04,
        "dscr_target": 1.25,
        "ltv_max": 0.80,
        "cap_rate_range": (0.045, 0.065),
        "construction_cost_psf": 250,
    },
    "multifamily_affordable": {
        "avg_monthly_rent": 1200,
        "stabilized_occupancy": 0.97,
        "operating_expense_ratio": 0.55,
        "dscr_target": 1.15,
        "ltv_max": 0.85,
    },
}

# ── Default Cash Flow Assumptions ───────────────────────────────────

DEFAULT_ASSUMPTIONS: dict[str, Any] = {
    "monthly_fee_il_avg": 4964,
    "monthly_fee_al_avg": 6894,
    "entrance_fee_avg_traditional": 413_927,
    "entrance_fee_avg_80_75": 670_832,
    "ef_plan_mix": {"traditional": 0.55, "80_75": 0.45},
    "annual_fee_escalation": 0.03,
    "stabilized_occupancy_il": 0.93,
    "stabilized_occupancy_al": 0.93,
    "ramp_months_to_stabilization": 24,
    "annual_expense_growth": 0.03,
}

# ── CSI Division Benchmarks (Manhattan Trade Package) ───────────────

CSI_DIVISION_BENCHMARKS: dict[str, dict[str, float]] = {
    "03_concrete": {"pct_of_hard": 0.08, "label": "Concrete & Foundations"},
    "04_masonry": {"pct_of_hard": 0.04, "label": "Masonry"},
    "05_metals": {"pct_of_hard": 0.10, "label": "Structural & Misc Metals"},
    "06_wood_plastics": {"pct_of_hard": 0.06, "label": "Wood, Plastics & Composites"},
    "07_thermal_moisture": {"pct_of_hard": 0.07, "label": "Thermal & Moisture Protection"},
    "08_openings": {"pct_of_hard": 0.06, "label": "Openings (Doors, Windows)"},
    "09_finishes": {"pct_of_hard": 0.12, "label": "Finishes"},
    "10_specialties": {"pct_of_hard": 0.03, "label": "Specialties"},
    "14_conveying": {"pct_of_hard": 0.04, "label": "Conveying Equipment (Elevators)"},
    "21_fire_suppression": {"pct_of_hard": 0.03, "label": "Fire Suppression"},
    "22_plumbing": {"pct_of_hard": 0.08, "label": "Plumbing"},
    "23_hvac": {"pct_of_hard": 0.12, "label": "HVAC"},
    "26_electrical": {"pct_of_hard": 0.10, "label": "Electrical"},
    "31_earthwork": {"pct_of_hard": 0.05, "label": "Earthwork & Site"},
    "32_exterior": {"pct_of_hard": 0.02, "label": "Exterior Improvements"},
}


class CreditMemoEngine:
    """Unit-level analysis, campus cash flow modeling, and credit memo generation."""

    # ── 1. Build Unit Stack ─────────────────────────────────────────

    def build_unit_stack(self, units: list[dict]) -> dict:
        """Aggregate unit-level data into a portfolio-level unit stack.

        Args:
            units: List of unit dicts, each with keys: type, purchase_price,
                   appraisal, renovation_cost, sqft, status, entrance_fee_traditional,
                   entrance_fee_80_75, monthly_fee.
                   OR pass pre-aggregated WAJ_UNIT_DATA format with type-keyed dicts.

        Returns:
            Portfolio summary with unit counts, cost analysis, LTV, and status breakdown.
        """
        if not units:
            return {"error": "No unit data provided", "generated_at": datetime.utcnow().isoformat()}

        # Detect format: list of individual units vs. aggregated type dicts
        if isinstance(units[0], dict) and "count" in units[0]:
            return self._build_unit_stack_from_aggregated(units)

        return self._build_unit_stack_from_individual(units)

    def _build_unit_stack_from_aggregated(self, units: list[dict]) -> dict:
        """Build unit stack from pre-aggregated WAJ-format data."""
        type_summaries: dict[str, dict] = {}
        total_units = 0
        total_acquisition = 0.0
        total_appraisal = 0.0
        total_sqft = 0
        total_ef_weighted = 0.0
        total_ef_units = 0

        for unit in units:
            unit_type = unit.get("type", "unknown")
            count = unit.get("count", 0)
            avg_purchase = unit.get("avg_purchase", 0)
            avg_appraisal = unit.get("avg_appraisal", 0)
            avg_reno = unit.get("avg_reno", 0)
            avg_sqft = unit.get("avg_sqft", 0)
            avg_ief_traditional = unit.get("avg_ief_traditional", 0)
            avg_ief_80_75 = unit.get("avg_ief_80_75", 0)
            avg_monthly = unit.get("avg_monthly_fee", 0)

            all_in_cost = avg_purchase + avg_reno
            total_type_cost = all_in_cost * count
            total_type_appraisal = avg_appraisal * count
            cost_psf = all_in_cost / avg_sqft if avg_sqft else 0

            type_summaries[unit_type] = {
                "count": count,
                "avg_purchase_price": round(avg_purchase),
                "avg_appraisal": round(avg_appraisal),
                "avg_renovation_cost": round(avg_reno),
                "avg_all_in_cost": round(all_in_cost),
                "total_acquisition_cost": round(total_type_cost),
                "total_appraisal_value": round(total_type_appraisal),
                "avg_sqft": avg_sqft,
                "cost_per_sqft": round(cost_psf, 2),
                "avg_ief_traditional": round(avg_ief_traditional),
                "avg_ief_80_75": round(avg_ief_80_75),
                "weighted_avg_ief": round(avg_ief_traditional * 0.55 + avg_ief_80_75 * 0.45),
                "avg_monthly_fee": round(avg_monthly),
                "ltv": round(all_in_cost / avg_appraisal, 4) if avg_appraisal else 0,
            }

            total_units += count
            total_acquisition += total_type_cost
            total_appraisal += total_type_appraisal
            total_sqft += avg_sqft * count
            if avg_ief_traditional > 0:
                weighted_ef = (avg_ief_traditional * 0.55 + avg_ief_80_75 * 0.45) * count
                total_ef_weighted += weighted_ef
                total_ef_units += count

        portfolio_ltv = total_acquisition / total_appraisal if total_appraisal else 0
        portfolio_cost_psf = total_acquisition / total_sqft if total_sqft else 0
        weighted_avg_ef = total_ef_weighted / total_ef_units if total_ef_units else 0

        return {
            "total_units": total_units,
            "unit_types": type_summaries,
            "portfolio": {
                "total_acquisition_cost": round(total_acquisition),
                "total_appraisal_value": round(total_appraisal),
                "portfolio_ltv": round(portfolio_ltv, 4),
                "total_sqft": total_sqft,
                "avg_cost_per_sqft": round(portfolio_cost_psf, 2),
                "weighted_avg_entrance_fee": round(weighted_avg_ef),
            },
            "status_summary": {
                "note": "Status breakdown requires individual unit data",
            },
            "generated_at": datetime.utcnow().isoformat(),
        }

    def _build_unit_stack_from_individual(self, units: list[dict]) -> dict:
        """Build unit stack from individual unit records."""
        by_type: dict[str, list[dict]] = {}
        status_counts: dict[str, int] = {}

        for unit in units:
            unit_type = unit.get("type", "unknown")
            by_type.setdefault(unit_type, []).append(unit)

            status = unit.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1

        type_summaries: dict[str, dict] = {}
        total_acquisition = 0.0
        total_appraisal = 0.0
        total_sqft = 0
        total_ef_weighted = 0.0
        total_ef_units = 0

        for unit_type, type_units in by_type.items():
            count = len(type_units)
            purchases = [u.get("purchase_price", 0) for u in type_units]
            appraisals = [u.get("appraisal", 0) for u in type_units]
            renos = [u.get("renovation_cost", 0) for u in type_units]
            sqfts = [u.get("sqft", 0) for u in type_units]
            ief_trad = [u.get("entrance_fee_traditional", 0) for u in type_units]
            ief_80 = [u.get("entrance_fee_80_75", 0) for u in type_units]
            monthly = [u.get("monthly_fee", 0) for u in type_units]

            avg_purchase = sum(purchases) / count
            avg_appraisal = sum(appraisals) / count
            avg_reno = sum(renos) / count
            avg_sqft = sum(sqfts) / count
            all_in = avg_purchase + avg_reno
            cost_psf = all_in / avg_sqft if avg_sqft else 0

            avg_ief_trad = sum(ief_trad) / count
            avg_ief_80 = sum(ief_80) / count
            avg_monthly = sum(monthly) / count

            type_acq = sum(p + r for p, r in zip(purchases, renos))
            type_appr = sum(appraisals)

            type_summaries[unit_type] = {
                "count": count,
                "avg_purchase_price": round(avg_purchase),
                "avg_appraisal": round(avg_appraisal),
                "avg_renovation_cost": round(avg_reno),
                "avg_all_in_cost": round(all_in),
                "total_acquisition_cost": round(type_acq),
                "total_appraisal_value": round(type_appr),
                "avg_sqft": round(avg_sqft),
                "cost_per_sqft": round(cost_psf, 2),
                "avg_ief_traditional": round(avg_ief_trad),
                "avg_ief_80_75": round(avg_ief_80),
                "weighted_avg_ief": round(avg_ief_trad * 0.55 + avg_ief_80 * 0.45),
                "avg_monthly_fee": round(avg_monthly),
                "ltv": round(all_in / avg_appraisal, 4) if avg_appraisal else 0,
            }

            total_acquisition += type_acq
            total_appraisal += type_appr
            total_sqft += sum(sqfts)
            if avg_ief_trad > 0:
                weighted_ef = (avg_ief_trad * 0.55 + avg_ief_80 * 0.45) * count
                total_ef_weighted += weighted_ef
                total_ef_units += count

        portfolio_ltv = total_acquisition / total_appraisal if total_appraisal else 0
        portfolio_cost_psf = total_acquisition / total_sqft if total_sqft else 0
        weighted_avg_ef = total_ef_weighted / total_ef_units if total_ef_units else 0

        return {
            "total_units": len(units),
            "unit_types": type_summaries,
            "portfolio": {
                "total_acquisition_cost": round(total_acquisition),
                "total_appraisal_value": round(total_appraisal),
                "portfolio_ltv": round(portfolio_ltv, 4),
                "total_sqft": total_sqft,
                "avg_cost_per_sqft": round(portfolio_cost_psf, 2),
                "weighted_avg_entrance_fee": round(weighted_avg_ef),
            },
            "status_summary": status_counts,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 2. Model Campus Cash Flow ───────────────────────────────────

    def model_campus_cashflow(self, unit_stack: dict, assumptions: dict) -> dict:
        """Project 5-year campus cash flows from unit stack and assumptions.

        Args:
            unit_stack: Output of build_unit_stack.
            assumptions: Override dict merged with DEFAULT_ASSUMPTIONS. Must include
                         bond_amount and coupon_rate for debt service calculation.

        Returns:
            5-year projection with NOI waterfall, DSCR, and cash flow after debt service.
        """
        a = {**DEFAULT_ASSUMPTIONS, **assumptions}

        total_il_units = unit_stack.get("total_units", 0)
        al_units = a.get("al_units", 0)
        snf_units = a.get("snf_units", 0)
        il_units = total_il_units - al_units - snf_units

        # Bond parameters
        bond_amount = a.get("bond_amount", 203_080_000)
        coupon_rate = a.get("coupon_rate", 0.065)
        annual_debt_service = bond_amount * coupon_rate
        amort_years = a.get("amortization_years", 30)
        if amort_years and amort_years > 0:
            # Level debt service (P&I)
            monthly_rate = coupon_rate / 12
            n_months = amort_years * 12
            if monthly_rate > 0:
                monthly_payment = bond_amount * (monthly_rate * (1 + monthly_rate) ** n_months) / ((1 + monthly_rate) ** n_months - 1)
                annual_debt_service = monthly_payment * 12
            else:
                annual_debt_service = bond_amount / amort_years

        # Entrance fee revenue model
        ef_avg_traditional = a.get("entrance_fee_avg_traditional", 413_927)
        ef_avg_80_75 = a.get("entrance_fee_avg_80_75", 670_832)
        ef_mix = a.get("ef_plan_mix", {"traditional": 0.55, "80_75": 0.45})
        blended_ef = ef_avg_traditional * ef_mix.get("traditional", 0.55) + ef_avg_80_75 * ef_mix.get("80_75", 0.45)

        # EF amortization: traditional recognized over expected tenure (7yr),
        # 80/75 plan — 80% refundable, 20% earned, recognized over 7yr
        ef_recognition_years = a.get("ef_recognition_years", 7)
        trad_pct = ef_mix.get("traditional", 0.55)
        refundable_pct = ef_mix.get("80_75", 0.45)
        # Traditional: 100% earned. 80/75: 25% earned (20% non-refundable + amort on balance)
        earned_ef_per_unit = (ef_avg_traditional * trad_pct * 1.0 + ef_avg_80_75 * refundable_pct * 0.25)
        annual_ef_amort_per_unit = earned_ef_per_unit / ef_recognition_years

        # Monthly fee parameters
        monthly_il = a.get("monthly_fee_il_avg", 4964)
        monthly_al = a.get("monthly_fee_al_avg", 6894)
        monthly_snf = a.get("monthly_fee_snf_avg", 12_000)
        escalation = a.get("annual_fee_escalation", 0.03)

        # Occupancy ramp
        stabilized_occ_il = a.get("stabilized_occupancy_il", 0.93)
        stabilized_occ_al = a.get("stabilized_occupancy_al", 0.93)
        stabilized_occ_snf = a.get("stabilized_occupancy_snf", 0.90)
        ramp_months = a.get("ramp_months_to_stabilization", 24)

        # Expense parameters
        expense_per_unit_day = a.get("expense_per_unit_day", 75)
        mgmt_fee_pct = a.get("management_fee_pct", 0.05)
        condo_fees_annual = a.get("condo_fees_annual", 0)
        insurance_annual = a.get("insurance_annual", 0)
        taxes_annual = a.get("taxes_annual", 0)
        expense_growth = a.get("annual_expense_growth", 0.03)

        # Vacancy assumption
        vacancy_pct = a.get("vacancy_reserve_pct", 0.05)

        projections: dict[int, dict] = {}
        base_year = a.get("base_year", datetime.utcnow().year)

        for yr_offset in range(5):
            year = base_year + yr_offset
            year_number = yr_offset + 1

            # Occupancy ramp: linear from 30% to stabilized over ramp_months
            months_elapsed = yr_offset * 12 + 6  # midpoint of year
            if months_elapsed >= ramp_months:
                occ_il = stabilized_occ_il
                occ_al = stabilized_occ_al
                occ_snf = stabilized_occ_snf
            else:
                ramp_pct = months_elapsed / ramp_months
                floor_occ = 0.30
                occ_il = floor_occ + (stabilized_occ_il - floor_occ) * ramp_pct
                occ_al = floor_occ + (stabilized_occ_al - floor_occ) * ramp_pct
                occ_snf = floor_occ + (stabilized_occ_snf - floor_occ) * ramp_pct

            # Revenue: monthly fees (escalated)
            esc_factor = (1 + escalation) ** yr_offset
            il_monthly_rev = il_units * monthly_il * esc_factor * occ_il * 12
            al_monthly_rev = al_units * monthly_al * esc_factor * occ_al * 12
            snf_monthly_rev = snf_units * monthly_snf * esc_factor * occ_snf * 12

            # Revenue: entrance fee amortization
            # New move-ins generate EF revenue; assume turnover fills vacant units
            occupied_il = round(il_units * occ_il)
            ef_amort_rev = occupied_il * annual_ef_amort_per_unit * esc_factor

            gross_revenue = il_monthly_rev + al_monthly_rev + snf_monthly_rev + ef_amort_rev

            # Vacancy reserve
            vacancy_loss = gross_revenue * vacancy_pct
            effective_revenue = gross_revenue - vacancy_loss

            # Operating expenses
            total_occupied = round(il_units * occ_il + al_units * occ_al + snf_units * occ_snf)
            exp_growth_factor = (1 + expense_growth) ** yr_offset
            base_operating = total_occupied * expense_per_unit_day * 365 * exp_growth_factor
            mgmt_fee = effective_revenue * mgmt_fee_pct
            condo = condo_fees_annual * exp_growth_factor if condo_fees_annual else 0
            ins = insurance_annual * exp_growth_factor if insurance_annual else 0
            tax = taxes_annual * exp_growth_factor if taxes_annual else 0

            total_expenses = base_operating + mgmt_fee + condo + ins + tax

            # NOI
            noi = effective_revenue - total_expenses

            # DSCR
            dscr = noi / annual_debt_service if annual_debt_service else 0

            # Cash flow after debt service
            cf_after_ds = noi - annual_debt_service

            projections[year] = {
                "year_number": year_number,
                "occupancy": {
                    "il": round(occ_il, 3),
                    "al": round(occ_al, 3),
                    "snf": round(occ_snf, 3),
                },
                "revenue": {
                    "il_monthly_fees": round(il_monthly_rev),
                    "al_monthly_fees": round(al_monthly_rev),
                    "snf_revenue": round(snf_monthly_rev),
                    "ef_amortization": round(ef_amort_rev),
                    "gross_revenue": round(gross_revenue),
                    "vacancy_loss": round(vacancy_loss),
                    "effective_revenue": round(effective_revenue),
                },
                "expenses": {
                    "operating": round(base_operating),
                    "management_fee": round(mgmt_fee),
                    "condo_fees": round(condo),
                    "insurance": round(ins),
                    "taxes": round(tax),
                    "total_expenses": round(total_expenses),
                },
                "noi": round(noi),
                "debt_service": round(annual_debt_service),
                "dscr": round(dscr, 2),
                "cash_flow_after_ds": round(cf_after_ds),
            }

        # Summary
        years = sorted(projections.keys())
        dscr_values = [projections[y]["dscr"] for y in years]
        noi_values = [projections[y]["noi"] for y in years]

        return {
            "unit_count": {"il": il_units, "al": al_units, "snf": snf_units, "total": total_il_units},
            "bond_amount": round(bond_amount),
            "annual_debt_service": round(annual_debt_service),
            "projections": projections,
            "summary": {
                "dscr_min": min(dscr_values),
                "dscr_max": max(dscr_values),
                "dscr_avg": round(sum(dscr_values) / len(dscr_values), 2),
                "dscr_trend": "improving" if dscr_values[-1] > dscr_values[0] else "declining",
                "noi_year_1": noi_values[0],
                "noi_year_5": noi_values[-1],
                "noi_cagr": round((noi_values[-1] / noi_values[0]) ** 0.25 - 1, 4) if noi_values[0] > 0 else 0,
                "stabilized_year": next(
                    (y for y in years if projections[y]["occupancy"]["il"] >= stabilized_occ_il),
                    years[-1],
                ),
            },
            "assumptions_used": a,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 3. Cross-Reference Appraisal ───────────────────────────────

    def cross_reference_appraisal(self, units: list[dict]) -> dict:
        """Compare unit acquisition cost vs. appraisal values.

        Args:
            units: List of unit dicts with purchase_price, renovation_cost, appraisal,
                   entrance_fee_traditional, entrance_fee_80_75.
                   Also accepts WAJ-format aggregated dicts with 'count' key.

        Returns:
            Per-unit and portfolio LTV, underwater units, appraisal coverage, IEF gap analysis.
        """
        if not units:
            return {"error": "No unit data provided"}

        # Handle aggregated format
        is_aggregated = isinstance(units[0], dict) and "count" in units[0]

        unit_analyses: list[dict] = []
        total_cost = 0.0
        total_appraisal = 0.0
        total_ef_pool = 0.0
        underwater_count = 0
        total_units = 0

        if is_aggregated:
            for unit in units:
                unit_type = unit.get("type", "unknown")
                count = unit.get("count", 0)
                avg_purchase = unit.get("avg_purchase", 0)
                avg_reno = unit.get("avg_reno", 0)
                avg_appraisal = unit.get("avg_appraisal", 0)
                avg_ief_trad = unit.get("avg_ief_traditional", 0)
                avg_ief_80 = unit.get("avg_ief_80_75", 0)

                all_in = avg_purchase + avg_reno
                ltv = all_in / avg_appraisal if avg_appraisal else 0
                blended_ef = avg_ief_trad * 0.55 + avg_ief_80 * 0.45
                ef_covers_gap = blended_ef > all_in

                is_underwater = all_in > avg_appraisal and avg_appraisal > 0

                unit_analyses.append({
                    "type": unit_type,
                    "count": count,
                    "avg_all_in_cost": round(all_in),
                    "avg_appraisal": round(avg_appraisal),
                    "ltv": round(ltv, 4),
                    "underwater": is_underwater,
                    "gap_per_unit": round(all_in - avg_appraisal) if is_underwater else 0,
                    "blended_entrance_fee": round(blended_ef),
                    "ief_covers_gap": ef_covers_gap,
                })

                type_cost = all_in * count
                type_appraisal = avg_appraisal * count
                total_cost += type_cost
                total_appraisal += type_appraisal
                total_ef_pool += blended_ef * count
                if is_underwater:
                    underwater_count += count
                total_units += count
        else:
            for unit in units:
                purchase = unit.get("purchase_price", 0)
                reno = unit.get("renovation_cost", 0)
                appraisal = unit.get("appraisal", 0)
                ief_trad = unit.get("entrance_fee_traditional", 0)
                ief_80 = unit.get("entrance_fee_80_75", 0)

                all_in = purchase + reno
                ltv = all_in / appraisal if appraisal else 0
                blended_ef = ief_trad * 0.55 + ief_80 * 0.45
                is_underwater = all_in > appraisal and appraisal > 0

                unit_analyses.append({
                    "unit_id": unit.get("unit_id", "unknown"),
                    "type": unit.get("type", "unknown"),
                    "all_in_cost": round(all_in),
                    "appraisal": round(appraisal),
                    "ltv": round(ltv, 4),
                    "underwater": is_underwater,
                    "gap": round(all_in - appraisal) if is_underwater else 0,
                    "blended_entrance_fee": round(blended_ef),
                    "ief_covers_gap": blended_ef > all_in,
                })

                total_cost += all_in
                total_appraisal += appraisal
                total_ef_pool += blended_ef
                if is_underwater:
                    underwater_count += 1
                total_units += 1

        portfolio_ltv = total_cost / total_appraisal if total_appraisal else 0
        appraisal_coverage = total_appraisal / total_cost if total_cost else 0
        ef_coverage_of_cost = total_ef_pool / total_cost if total_cost else 0

        # Flag: IEF covers the gap when entrance fees exceed cost basis
        ief_covers_gap = total_ef_pool > total_cost

        return {
            "total_units": total_units,
            "unit_analyses": unit_analyses,
            "portfolio": {
                "total_acquisition_cost": round(total_cost),
                "total_appraisal_value": round(total_appraisal),
                "portfolio_weighted_avg_ltv": round(portfolio_ltv, 4),
                "appraisal_coverage_ratio": round(appraisal_coverage, 4),
                "total_entrance_fee_pool": round(total_ef_pool),
                "ef_coverage_of_cost_basis": round(ef_coverage_of_cost, 4),
            },
            "risk_flags": {
                "units_underwater": underwater_count,
                "pct_underwater": round(underwater_count / total_units, 4) if total_units else 0,
                "ief_covers_gap": ief_covers_gap,
                "ief_gap_note": (
                    "IEF covers the gap — entrance fees exceed the cost basis, providing additional collateral coverage"
                    if ief_covers_gap
                    else "Entrance fee pool does not fully cover acquisition cost basis"
                ),
            },
            "benchmark_comparison": {
                "ltv_vs_max": {
                    "portfolio_ltv": round(portfolio_ltv, 4),
                    "ccrc_max_ltv": MULTIFAMILY_BENCHMARKS["ccrc_senior_living"]["ltv_max"],
                    "within_limit": portfolio_ltv <= MULTIFAMILY_BENCHMARKS["ccrc_senior_living"]["ltv_max"],
                },
            },
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 4. Generate Credit Memo ─────────────────────────────────────

    def generate_credit_memo(
        self,
        deal: dict,
        unit_stack: dict,
        cashflow: dict,
        appraisal_analysis: dict,
    ) -> dict:
        """Produce a structured credit memo from analyzed components.

        Args:
            deal: Deal-level info (name, size, sector, structure, sponsor, issuer, etc.)
            unit_stack: Output of build_unit_stack.
            cashflow: Output of model_campus_cashflow.
            appraisal_analysis: Output of cross_reference_appraisal.

        Returns:
            Structured credit memo with all standard sections.
        """
        bond_amount = deal.get("bond_amount", cashflow.get("bond_amount", 0))
        dscr_summary = cashflow.get("summary", {})
        portfolio = unit_stack.get("portfolio", {})
        risk_flags = appraisal_analysis.get("risk_flags", {})

        # Rating recommendation based on DSCR
        min_dscr = dscr_summary.get("dscr_min", 0)
        rating = self._recommend_rating(min_dscr, appraisal_analysis)

        # Covenant package
        covenants = self._build_covenant_recommendations(min_dscr, deal)

        # Credit strengths and risks
        strengths, risks = self._assess_credit(deal, unit_stack, cashflow, appraisal_analysis)

        # Structuring recommendation
        structuring = self._structuring_recommendation(deal, cashflow, appraisal_analysis)

        return {
            "memo_type": "Credit Memo",
            "memo_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "sections": {
                "executive_summary": {
                    "deal_name": deal.get("deal_name", "Unknown"),
                    "bond_amount": bond_amount,
                    "sector": deal.get("sector", "senior_living"),
                    "structure": deal.get("structure", "tax_exempt_revenue_bonds"),
                    "issuer": deal.get("issuer", ""),
                    "underwriter": deal.get("underwriter", ""),
                    "rating_recommendation": rating,
                    "dscr_range": f"{dscr_summary.get('dscr_min', 0):.2f}x - {dscr_summary.get('dscr_max', 0):.2f}x",
                    "portfolio_ltv": f"{appraisal_analysis.get('portfolio', {}).get('portfolio_weighted_avg_ltv', 0):.1%}",
                },
                "transaction_overview": {
                    "sources": deal.get("sources", {}),
                    "uses": deal.get("uses", {}),
                    "bond_par": bond_amount,
                    "series": deal.get("series", {}),
                },
                "borrower_sponsor": {
                    "name": deal.get("sponsor_name", ""),
                    "experience_years": deal.get("sponsor_experience_years", 0),
                    "portfolio_size": deal.get("sponsor_portfolio_size", ""),
                    "track_record": deal.get("sponsor_track_record", ""),
                    "management_team": deal.get("management_team", []),
                },
                "property_description": {
                    "total_units": unit_stack.get("total_units", 0),
                    "unit_mix": unit_stack.get("unit_types", {}),
                    "total_sqft": portfolio.get("total_sqft", 0),
                    "amenities": deal.get("amenities", []),
                    "location": deal.get("location", ""),
                    "year_built": deal.get("year_built", ""),
                    "renovation_scope": deal.get("renovation_scope", ""),
                },
                "market_analysis": {
                    "market": deal.get("market", ""),
                    "competitive_set": deal.get("competitive_set", []),
                    "demand_drivers": deal.get("demand_drivers", []),
                    "penetration_rate": deal.get("penetration_rate", 0),
                    "note": "Full market study required — placeholder for feasibility consultant data",
                },
                "financial_analysis": {
                    "noi_waterfall": self._format_noi_waterfall(cashflow),
                    "dscr_trajectory": {
                        "min": dscr_summary.get("dscr_min", 0),
                        "max": dscr_summary.get("dscr_max", 0),
                        "avg": dscr_summary.get("dscr_avg", 0),
                        "trend": dscr_summary.get("dscr_trend", ""),
                        "stabilized_year": dscr_summary.get("stabilized_year", 0),
                    },
                    "days_cash_on_hand": deal.get("days_cash", 0),
                    "debt_yield": round(
                        cashflow.get("projections", {}).get(
                            dscr_summary.get("stabilized_year", 0), {}
                        ).get("noi", 0) / bond_amount, 4
                    ) if bond_amount else 0,
                    "appraisal_analysis": {
                        "portfolio_ltv": appraisal_analysis.get("portfolio", {}).get("portfolio_weighted_avg_ltv", 0),
                        "appraisal_coverage": appraisal_analysis.get("portfolio", {}).get("appraisal_coverage_ratio", 0),
                        "ef_coverage": appraisal_analysis.get("portfolio", {}).get("ef_coverage_of_cost_basis", 0),
                        "underwater_units": risk_flags.get("units_underwater", 0),
                    },
                },
                "credit_strengths": strengths,
                "credit_risks": risks,
                "rating_recommendation": rating,
                "covenant_package": covenants,
                "structuring_recommendation": structuring,
            },
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 5. Model Construction Draws ─────────────────────────────────

    def model_construction_draws(self, budget: dict, timeline: dict) -> list[dict]:
        """Month-by-month construction draw schedule.

        Args:
            budget: Dict with hard_costs, soft_cost_pct (default 0.14), contingency_pct
                    (default 0.05), interest_rate (for carry), and optional csi_overrides.
            timeline: Dict with start_month (YYYY-MM), duration_months, and optional
                      phase_schedule (list of {phase, start_month, end_month, pct_of_hard}).

        Returns:
            List of monthly draw records with cumulative spend and remaining budget.
        """
        hard_costs = budget.get("hard_costs", 0)
        soft_cost_pct = budget.get("soft_cost_pct", 0.14)
        contingency_pct = budget.get("contingency_pct", 0.05)
        interest_rate = budget.get("interest_rate", 0.065)
        duration_months = timeline.get("duration_months", 24)
        start_month = timeline.get("start_month", datetime.utcnow().strftime("%Y-%m"))

        # Total budget
        soft_costs = hard_costs * soft_cost_pct
        contingency = hard_costs * contingency_pct
        escalation_reserve = hard_costs * 0.05  # 5% escalation reserve
        total_budget = hard_costs + soft_costs + contingency + escalation_reserve

        # Soft cost breakdown
        gc_fee = soft_costs * 0.35  # GC overhead/profit
        perf_bond = soft_costs * 0.15  # Performance & payment bonds
        builders_risk = soft_costs * 0.10  # Builder's risk insurance
        cm_fee = soft_costs * 0.25  # Construction management fee
        other_soft = soft_costs * 0.15  # Permits, testing, misc

        # CSI division breakdown with optional overrides
        csi_overrides = budget.get("csi_overrides", {})
        csi_allocations: dict[str, float] = {}
        for div_code, div_data in CSI_DIVISION_BENCHMARKS.items():
            override_pct = csi_overrides.get(div_code, div_data["pct_of_hard"])
            csi_allocations[div_code] = hard_costs * override_pct

        # Build draw curve: S-curve (slow start, ramp, peak, taper)
        # Standard construction draw curve percentages by month
        draw_curve = self._generate_s_curve(duration_months)

        # Phase schedule override
        phase_schedule = timeline.get("phase_schedule", [])

        draws: list[dict] = []
        cumulative_hard = 0.0
        cumulative_soft = 0.0
        cumulative_contingency = 0.0
        cumulative_interest = 0.0
        cumulative_total = 0.0

        # Parse start month
        start_year, start_mo = (int(x) for x in start_month.split("-"))

        for month_idx in range(duration_months):
            # Calculate calendar month
            cal_month = (start_mo - 1 + month_idx) % 12 + 1
            cal_year = start_year + (start_mo - 1 + month_idx) // 12
            month_label = f"{cal_year}-{cal_month:02d}"

            pct_draw = draw_curve[month_idx] if month_idx < len(draw_curve) else 0

            # Hard cost draw
            hard_draw = hard_costs * pct_draw

            # Soft cost draw (front-loaded for bonds/insurance, then pro-rata)
            if month_idx == 0:
                soft_draw = perf_bond + builders_risk  # Bonds and insurance at start
            elif month_idx == 1:
                soft_draw = gc_fee * 0.5  # Mobilization
            else:
                remaining_soft = soft_costs - perf_bond - builders_risk - gc_fee * 0.5
                soft_draw = remaining_soft * pct_draw

            # Contingency: draw proportionally with hard costs, with 5% escalation
            contingency_draw = contingency * pct_draw
            escalation_draw = escalation_reserve * pct_draw if month_idx >= 6 else 0  # Escalation kicks in after 6 months

            # Interest carry on outstanding balance
            outstanding_balance = cumulative_total
            monthly_interest = outstanding_balance * (interest_rate / 12)

            # Month total
            month_total = hard_draw + soft_draw + contingency_draw + escalation_draw + monthly_interest

            cumulative_hard += hard_draw
            cumulative_soft += soft_draw
            cumulative_contingency += contingency_draw + escalation_draw
            cumulative_interest += monthly_interest
            cumulative_total += month_total

            pct_complete = cumulative_hard / hard_costs if hard_costs else 0

            # CSI division breakdown for this month's hard costs
            csi_this_month: dict[str, float] = {}
            for div_code, total_div in csi_allocations.items():
                csi_this_month[div_code] = round(total_div * pct_draw)

            draws.append({
                "month": month_idx + 1,
                "month_label": month_label,
                "draws": {
                    "hard_costs": round(hard_draw),
                    "soft_costs": round(soft_draw),
                    "contingency": round(contingency_draw + escalation_draw),
                    "interest_carry": round(monthly_interest),
                    "month_total": round(month_total),
                },
                "csi_breakdown": csi_this_month,
                "cumulative": {
                    "hard_costs": round(cumulative_hard),
                    "soft_costs": round(cumulative_soft),
                    "contingency": round(cumulative_contingency),
                    "interest_carry": round(cumulative_interest),
                    "total_spent": round(cumulative_total),
                },
                "remaining_budget": round(total_budget + cumulative_interest - cumulative_total + monthly_interest),
                "pct_complete": round(pct_complete, 4),
            })

        return {
            "budget_summary": {
                "hard_costs": round(hard_costs),
                "soft_costs": round(soft_costs),
                "soft_cost_breakdown": {
                    "gc_fee": round(gc_fee),
                    "performance_bonds": round(perf_bond),
                    "builders_risk_insurance": round(builders_risk),
                    "cm_fee": round(cm_fee),
                    "other": round(other_soft),
                },
                "contingency": round(contingency),
                "escalation_reserve": round(escalation_reserve),
                "total_budget_ex_interest": round(total_budget),
                "estimated_interest_carry": round(cumulative_interest),
                "total_project_cost": round(total_budget + cumulative_interest),
            },
            "timeline": {
                "start": start_month,
                "duration_months": duration_months,
                "completion": draws[-1]["month_label"] if draws else start_month,
            },
            "csi_divisions": {
                code: {
                    "label": CSI_DIVISION_BENCHMARKS[code]["label"],
                    "total": round(amount),
                    "pct_of_hard": CSI_DIVISION_BENCHMARKS[code]["pct_of_hard"],
                }
                for code, amount in csi_allocations.items()
            },
            "monthly_draws": draws,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── Private Helpers ─────────────────────────────────────────────

    def _generate_s_curve(self, duration: int) -> list[float]:
        """Generate an S-curve draw schedule for construction.

        Standard construction S-curve: slow mobilization, ramp to peak,
        taper for closeout. Uses a simplified logistic approach.
        """
        import math

        raw: list[float] = []
        midpoint = duration / 2
        steepness = 6.0 / duration  # Controls curve shape

        for i in range(duration):
            # Logistic function
            x = (i + 0.5)  # midpoint of each month
            cumulative = 1 / (1 + math.exp(-steepness * (x - midpoint)))
            raw.append(cumulative)

        # Convert cumulative to incremental
        incremental: list[float] = []
        prev = 0.0
        for val in raw:
            incremental.append(val - prev)
            prev = val

        # Normalize to sum to 1.0
        total = sum(incremental)
        if total > 0:
            incremental = [v / total for v in incremental]

        return incremental

    def _recommend_rating(self, min_dscr: float, appraisal_analysis: dict) -> dict:
        """Recommend a credit rating based on DSCR and appraisal coverage."""
        ltv = appraisal_analysis.get("portfolio", {}).get("portfolio_weighted_avg_ltv", 0)
        ef_coverage = appraisal_analysis.get("portfolio", {}).get("ef_coverage_of_cost_basis", 0)

        # JP Morgan Credit Benchmarks
        if min_dscr >= 2.0 and ltv <= 0.55:
            grade = "A"
            outlook = "Strong credit profile — investment grade, stable outlook"
        elif min_dscr >= 1.75 and ltv <= 0.62:
            grade = "BBB+"
            outlook = "Solid investment grade — adequate coverage and leverage"
        elif min_dscr >= 1.50 and ltv <= 0.70:
            grade = "BBB-"
            outlook = "Low investment grade — meets minimum thresholds"
        elif min_dscr >= 1.25:
            grade = "BB+"
            outlook = "Below investment grade — enhanced structure needed"
        elif min_dscr >= 1.10:
            grade = "BB"
            outlook = "Speculative — requires significant credit enhancement"
        else:
            grade = "B"
            outlook = "Highly speculative — substantial risk, not recommended without restructuring"

        # Adjust for IEF coverage
        if ef_coverage > 1.5 and grade in ("BBB-", "BB+"):
            grade = "BBB"
            outlook += " (upgraded: strong entrance fee coverage provides additional security)"

        return {
            "recommended_grade": grade,
            "outlook": outlook,
            "basis": {
                "min_dscr": round(min_dscr, 2),
                "portfolio_ltv": round(ltv, 4),
                "ef_coverage": round(ef_coverage, 4),
            },
        }

    def _build_covenant_recommendations(self, min_dscr: float, deal: dict) -> dict:
        """Build covenant package based on credit profile."""
        is_ig = min_dscr >= 1.50

        dscr_covenant = 1.20 if is_ig else 1.15
        abt_historical = 1.20
        abt_projected = 1.10

        return {
            "rate_covenant": {
                "dscr_minimum": dscr_covenant,
                "test_frequency": "quarterly",
                "cure_period_days": 90,
                "consultant_trigger_dscr": dscr_covenant - 0.05,
            },
            "additional_bonds_test": {
                "historical_dscr": abt_historical,
                "projected_dscr": abt_projected,
                "periods": "12-month trailing + 12-month projected",
            },
            "liquidity_covenant": {
                "days_cash_minimum": 150,
                "operating_reserve_months": 3,
                "dsrf": "Maximum Annual Debt Service (MADS)",
            },
            "distribution_restrictions": {
                "type": "tight" if not is_ig else "standard",
                "distribution_trap_dscr": dscr_covenant - 0.10,
                "payout_cap_pct": 0.50 if is_ig else 0.25,
            },
            "reporting": {
                "annual_audited_financials": True,
                "quarterly_unaudited": True,
                "emma_continuing_disclosure": True,
                "material_event_notice": True,
                "occupancy_reporting": "monthly",
                "entrance_fee_receipts": "monthly",
            },
            "construction_specific": {
                "completion_deadline": deal.get("construction_deadline", ""),
                "cost_overrun_reserve": "5% of hard costs",
                "capitalized_interest_reserve": True,
                "draw_certification": "Independent engineer sign-off required",
            } if deal.get("has_construction", False) else None,
        }

    def _assess_credit(
        self,
        deal: dict,
        unit_stack: dict,
        cashflow: dict,
        appraisal_analysis: dict,
    ) -> tuple[list[dict], list[dict]]:
        """Identify credit strengths and risks."""
        strengths: list[dict] = []
        risks: list[dict] = []

        summary = cashflow.get("summary", {})
        portfolio = appraisal_analysis.get("portfolio", {})
        risk_flags = appraisal_analysis.get("risk_flags", {})

        # DSCR assessment
        min_dscr = summary.get("dscr_min", 0)
        if min_dscr >= 1.50:
            strengths.append({
                "factor": "Debt Service Coverage",
                "detail": f"Minimum DSCR of {min_dscr:.2f}x exceeds 1.50x new issuance target",
                "weight": "high",
            })
        elif min_dscr >= 1.20:
            strengths.append({
                "factor": "Debt Service Coverage",
                "detail": f"DSCR of {min_dscr:.2f}x meets covenant floor but below 1.50x target",
                "weight": "medium",
            })
        else:
            risks.append({
                "factor": "Debt Service Coverage",
                "detail": f"DSCR of {min_dscr:.2f}x below 1.20x covenant floor",
                "severity": "high",
                "mitigant": "Funded interest reserve, entrance fee pool backstop",
            })

        # DSCR trend
        if summary.get("dscr_trend") == "improving":
            strengths.append({
                "factor": "Coverage Trajectory",
                "detail": "DSCR improves through forecast period — positive operating momentum",
                "weight": "medium",
            })

        # LTV
        ltv = portfolio.get("portfolio_weighted_avg_ltv", 0)
        if ltv > 0 and ltv <= 0.75:
            strengths.append({
                "factor": "Loan-to-Value",
                "detail": f"Portfolio LTV of {ltv:.1%} within CCRC senior living maximum of 75%",
                "weight": "high",
            })
        elif ltv > 0.75:
            risks.append({
                "factor": "Loan-to-Value",
                "detail": f"Portfolio LTV of {ltv:.1%} exceeds 75% CCRC maximum",
                "severity": "high",
                "mitigant": "Entrance fee pool provides additional collateral coverage",
            })

        # IEF coverage
        if risk_flags.get("ief_covers_gap"):
            strengths.append({
                "factor": "Entrance Fee Coverage",
                "detail": "IEF covers the gap — entrance fees exceed cost basis, providing embedded equity cushion",
                "weight": "high",
            })
        ef_coverage = portfolio.get("ef_coverage_of_cost_basis", 0)
        if ef_coverage > 0 and ef_coverage < 1.0:
            risks.append({
                "factor": "Entrance Fee Coverage",
                "detail": f"Entrance fee pool covers only {ef_coverage:.1%} of cost basis",
                "severity": "medium",
                "mitigant": "Monthly service fees provide recurring revenue backstop",
            })

        # Underwater units
        underwater = risk_flags.get("units_underwater", 0)
        if underwater > 0:
            risks.append({
                "factor": "Underwater Units",
                "detail": f"{underwater} units with all-in cost exceeding appraisal",
                "severity": "medium",
                "mitigant": "Renovation investment expected to lift values at stabilization",
            })

        # Sponsor experience
        experience = deal.get("sponsor_experience_years", 0)
        if experience >= 10:
            strengths.append({
                "factor": "Sponsor Experience",
                "detail": f"{experience} years of operating experience in sector",
                "weight": "medium",
            })
        elif experience < 5 and experience > 0:
            risks.append({
                "factor": "Sponsor Experience",
                "detail": f"Limited operating experience ({experience} years)",
                "severity": "medium",
                "mitigant": "Experienced management team, third-party operator",
            })

        # Diversification
        total_units = unit_stack.get("total_units", 0)
        if total_units >= 200:
            strengths.append({
                "factor": "Portfolio Scale",
                "detail": f"{total_units} units provides revenue diversification and operating scale",
                "weight": "medium",
            })

        # Construction risk
        if deal.get("has_construction", False):
            risks.append({
                "factor": "Construction Risk",
                "detail": "Active construction/renovation introduces execution and cost overrun risk",
                "severity": "medium",
                "mitigant": "Capitalized interest reserve, completion guarantee, independent engineer oversight",
            })

        # Occupancy ramp
        ramp_months = cashflow.get("assumptions_used", {}).get("ramp_months_to_stabilization", 24)
        if ramp_months > 18:
            risks.append({
                "factor": "Lease-Up Risk",
                "detail": f"{ramp_months}-month ramp to stabilization extends cash flow uncertainty",
                "severity": "medium",
                "mitigant": f"Funded interest reserve covers {ramp_months} months of debt service",
            })

        return strengths, risks

    def _structuring_recommendation(
        self,
        deal: dict,
        cashflow: dict,
        appraisal_analysis: dict,
    ) -> dict:
        """Generate bond structuring recommendations."""
        summary = cashflow.get("summary", {})
        min_dscr = summary.get("dscr_min", 0)
        bond_amount = cashflow.get("bond_amount", 0)

        # Series structure
        series_a_pct = 0.88  # Senior tax-exempt
        series_b_pct = 0.10  # Subordinate tax-exempt
        series_c_pct = 0.02  # Taxable short-term

        return {
            "recommended_structure": {
                "series_a": {
                    "type": "tax_exempt_fixed_rate",
                    "amount": round(bond_amount * series_a_pct),
                    "pct": series_a_pct,
                    "maturity_years": 30,
                    "coupon_range": "6.50% - 7.50%",
                    "rating_target": "BBB-/Baa3",
                },
                "series_b": {
                    "type": "tax_exempt_subordinate",
                    "amount": round(bond_amount * series_b_pct),
                    "pct": series_b_pct,
                    "maturity_years": 30,
                    "coupon_range": "8.00% - 10.00%",
                    "rating_target": "NR",
                },
                "series_c": {
                    "type": "taxable_short_term",
                    "amount": round(bond_amount * series_c_pct),
                    "pct": series_c_pct,
                    "maturity_years": 3,
                    "coupon_range": "9.00% - 11.00%",
                    "rating_target": "NR",
                },
            },
            "reserves": {
                "dsrf": "Maximum Annual Debt Service (MADS)",
                "capitalized_interest_months": max(18, cashflow.get("assumptions_used", {}).get("ramp_months_to_stabilization", 24)),
                "operating_reserve_months": 3,
                "repair_replacement_reserve": "$500/unit/year",
            },
            "credit_enhancement": {
                "surety_bond": deal.get("surety_available", False),
                "letter_of_credit": deal.get("lc_available", False),
                "bond_insurance": deal.get("bond_insurance_available", False),
                "recommendation": self._enhancement_recommendation(min_dscr),
            },
            "amortization": {
                "io_period_months": 24,
                "then": "Level debt service to maturity",
                "call_protection": "Non-call 10, par call thereafter",
            },
        }

    def _enhancement_recommendation(self, min_dscr: float) -> str:
        """Recommend credit enhancement based on DSCR."""
        if min_dscr >= 2.0:
            return "No enhancement required — standalone investment grade"
        if min_dscr >= 1.50:
            return "Surety bond recommended for rating uplift to A-category"
        if min_dscr >= 1.25:
            return "Bond insurance or LC required for investment grade rating"
        return "Multiple layers of enhancement needed — surety + LC + funded reserves"

    def _format_noi_waterfall(self, cashflow: dict) -> dict:
        """Format the NOI waterfall for the credit memo."""
        projections = cashflow.get("projections", {})
        waterfall: dict[int, dict] = {}

        for year, data in sorted(projections.items()):
            rev = data.get("revenue", {})
            exp = data.get("expenses", {})
            waterfall[year] = {
                "gross_revenue": rev.get("gross_revenue", 0),
                "vacancy_loss": rev.get("vacancy_loss", 0),
                "effective_revenue": rev.get("effective_revenue", 0),
                "total_expenses": exp.get("total_expenses", 0),
                "noi": data.get("noi", 0),
                "debt_service": data.get("debt_service", 0),
                "dscr": data.get("dscr", 0),
                "cash_flow_after_ds": data.get("cash_flow_after_ds", 0),
            }

        return waterfall
