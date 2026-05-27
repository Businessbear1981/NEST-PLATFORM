"""Ramp Monitor — tracks construction draws and lease-up absorption for active deals.

Monitors every deal from bond close through stabilization: construction draws
vs budget, unit absorption vs ramp schedule, covenant compliance in real time.

Seeded with real WAJ unit acquisition data (125 units, Jacaranda Trace Series 2025).
"""
from __future__ import annotations

from datetime import datetime, date, timedelta
from typing import Any

# ── Variance Alert Thresholds ─────────────────────────────────────

VARIANCE_YELLOW = 0.05   # 5% over budget
VARIANCE_RED = 0.10      # 10% over budget

# ── Covenant Monitoring Thresholds ────────────────────────────────

DEFAULT_COVENANTS = {
    "dscr_minimum": 1.20,
    "days_cash_minimum": 150,
    "ief_coverage_minimum": 1.00,
    "occupancy_target": 0.90,
}

# ── WAJ Unit Data (Real — 125 Units, Jacaranda Trace) ────────────

WAJ_UNIT_SEED: dict[str, Any] = {
    "acquisition_name": "WAJ Unit Acquisition",
    "deal": "Convivial Jacaranda Trace, LLC",
    "total_units": 125,
    "purchase_price": 29_000_000,
    "status_breakdown": {
        "SOLD": 22,
        "RESERVED": 19,
        "AVAILABLE": 66,
        "PENDING_SETTLEMENT": 10,
        "MODEL_UNIT": 4,
        "OFFICE_USE": 4,
    },
    "average_absorption_months": 4.3,
    "unit_types": {
        "1BR": {"count": 45, "avg_ief": 185_000, "avg_monthly": 3_200},
        "2BR": {"count": 55, "avg_ief": 265_000, "avg_monthly": 4_100},
        "2BR_DEN": {"count": 18, "avg_ief": 325_000, "avg_monthly": 4_800},
        "3BR": {"count": 7, "avg_ief": 410_000, "avg_monthly": 5_500},
    },
    "ief_pool_target": 25_000_000,
    "projected_total_ief": 38_705_219,
}


class RampMonitor:
    """Tracks construction progress and lease-up absorption for active deals."""

    def create_ramp_schedule(self, units: list[dict], timeline: dict) -> dict:
        """Build a month-by-month ramp schedule from unit data and project timeline.

        Args:
            units: List of unit dicts, each with keys:
                   type, status, ief_amount, monthly_fee
            timeline: Dict with milestone dates (bond_close, il_stabilized, etc.)

        Returns:
            Month-by-month schedule with unit counts, IEF collections, occupancy
            trajectory, and projected stabilization.
        """
        total_units = len(units)
        if total_units == 0:
            return {"error": "No unit data provided"}

        # Count current statuses
        status_counts: dict[str, int] = {}
        for unit in units:
            status = unit.get("status", "UNKNOWN")
            status_counts[status] = status_counts.get(status, 0) + 1

        already_sold = status_counts.get("SOLD", 0)
        already_reserved = status_counts.get("RESERVED", 0)
        available = status_counts.get("AVAILABLE", 0)
        non_sellable = sum(
            status_counts.get(s, 0)
            for s in ["MODEL_UNIT", "OFFICE_USE"]
        )

        sellable_units = total_units - non_sellable
        remaining_to_sell = sellable_units - already_sold - already_reserved

        # Compute average IEF per unit
        ief_amounts = [u.get("ief_amount", 0) for u in units if u.get("ief_amount", 0) > 0]
        avg_ief = sum(ief_amounts) / len(ief_amounts) if ief_amounts else 250_000

        # Absorption rate: ~4.3 months average from WAJ data
        # Convert to units per month
        avg_absorption_months = 4.3
        monthly_absorption = max(1, round(sellable_units / (sellable_units * avg_absorption_months / 12)))

        # Build month-by-month schedule (24 months from bond close)
        schedule: list[dict] = []
        cumulative_sold = already_sold
        cumulative_reserved = already_reserved
        cumulative_ief = already_sold * avg_ief

        bond_close = timeline.get("bond_close", "2025-06")
        close_year, close_month = map(int, bond_close.split("-"))

        stabilization_reached = False
        stabilization_month = None

        for month_offset in range(36):
            m = (close_month - 1 + month_offset) % 12 + 1
            y = close_year + (close_month - 1 + month_offset) // 12
            month_label = f"{y}-{m:02d}"

            # New sales this month (ramp up: slower at start, faster mid-project)
            if month_offset < 3:
                new_sales = max(0, min(1, remaining_to_sell))
            elif month_offset < 12:
                new_sales = max(0, min(3, remaining_to_sell))
            elif month_offset < 24:
                new_sales = max(0, min(4, remaining_to_sell))
            else:
                new_sales = max(0, min(2, remaining_to_sell))

            # Reserved converting to sold
            new_from_reserved = 0
            if cumulative_reserved > 0 and month_offset >= 2:
                new_from_reserved = min(2, cumulative_reserved)
                cumulative_reserved -= new_from_reserved

            cumulative_sold += new_sales + new_from_reserved
            remaining_to_sell = max(0, remaining_to_sell - new_sales)
            cumulative_ief += (new_sales + new_from_reserved) * avg_ief

            occupied = cumulative_sold  # Sold = occupied for ILU
            occupancy_pct = round(occupied / sellable_units, 3) if sellable_units else 0

            month_data = {
                "month": month_label,
                "month_offset": month_offset,
                "units_available": max(0, remaining_to_sell),
                "units_reserved": cumulative_reserved,
                "units_sold": cumulative_sold,
                "units_occupied": occupied,
                "occupancy_pct": occupancy_pct,
                "cumulative_ief": round(cumulative_ief),
                "new_sales_this_month": new_sales + new_from_reserved,
            }
            schedule.append(month_data)

            # Check stabilization (90% occupancy)
            if occupancy_pct >= 0.90 and not stabilization_reached:
                stabilization_reached = True
                stabilization_month = month_label

            # Stop if fully absorbed
            if remaining_to_sell == 0 and cumulative_reserved == 0:
                break

        return {
            "total_units": total_units,
            "sellable_units": sellable_units,
            "non_sellable": non_sellable,
            "initial_status": status_counts,
            "avg_ief_per_unit": round(avg_ief),
            "schedule": schedule,
            "projected_stabilization": stabilization_month,
            "stabilization_reached": stabilization_reached,
            "final_occupancy": schedule[-1]["occupancy_pct"] if schedule else 0,
            "final_ief_collected": schedule[-1]["cumulative_ief"] if schedule else 0,
            "created_at": datetime.utcnow().isoformat(),
        }

    def track_draw_schedule(self, project_budget: dict, draws: list[dict]) -> dict:
        """Track construction draws against budget with variance alerts.

        Args:
            project_budget: Dict of line_item -> budgeted_amount.
            draws: List of draw dicts with keys:
                   draw_number, date, line_item, amount, description

        Returns:
            Per-line-item tracking with budget, actual, remaining, variance,
            and alert status.
        """
        tracking: dict[str, dict] = {}

        # Initialize tracking from budget
        total_budget = 0
        for line_item, budgeted in project_budget.items():
            tracking[line_item] = {
                "label": line_item.replace("_", " ").title(),
                "budgeted": budgeted,
                "drawn": 0,
                "remaining": budgeted,
                "pct_complete": 0.0,
                "variance": 0.0,
                "variance_pct": 0.0,
                "alert": "green",
                "draws": [],
            }
            total_budget += budgeted

        # Process draws
        total_drawn = 0
        for draw in sorted(draws, key=lambda d: d.get("date", "")):
            line_item = draw.get("line_item", "unallocated")
            amount = draw.get("amount", 0)
            total_drawn += amount

            if line_item not in tracking:
                tracking[line_item] = {
                    "label": line_item.replace("_", " ").title(),
                    "budgeted": 0,
                    "drawn": 0,
                    "remaining": 0,
                    "pct_complete": 0.0,
                    "variance": 0.0,
                    "variance_pct": 0.0,
                    "alert": "red",
                    "draws": [],
                }

            item = tracking[line_item]
            item["drawn"] += amount
            item["remaining"] = item["budgeted"] - item["drawn"]
            item["pct_complete"] = round(item["drawn"] / item["budgeted"], 3) if item["budgeted"] else 1.0
            item["variance"] = item["drawn"] - item["budgeted"]
            item["variance_pct"] = round(item["variance"] / item["budgeted"], 4) if item["budgeted"] else 0

            # Set alert level
            if item["variance_pct"] > VARIANCE_RED:
                item["alert"] = "red"
            elif item["variance_pct"] > VARIANCE_YELLOW:
                item["alert"] = "yellow"
            else:
                item["alert"] = "green"

            item["draws"].append({
                "draw_number": draw.get("draw_number"),
                "date": draw.get("date"),
                "amount": amount,
                "description": draw.get("description", ""),
            })

        # Summary
        over_budget_items = [k for k, v in tracking.items() if v["alert"] != "green"]

        return {
            "total_budget": total_budget,
            "total_drawn": total_drawn,
            "total_remaining": total_budget - total_drawn,
            "overall_pct_complete": round(total_drawn / total_budget, 3) if total_budget else 0,
            "line_items": tracking,
            "alerts": {
                "red": [k for k, v in tracking.items() if v["alert"] == "red"],
                "yellow": [k for k, v in tracking.items() if v["alert"] == "yellow"],
            },
            "over_budget_count": len(over_budget_items),
            "tracked_at": datetime.utcnow().isoformat(),
        }

    def monitor_covenants(self, current_data: dict, covenants: dict | None = None) -> dict:
        """Real-time covenant monitoring with breach distance and trend analysis.

        Args:
            current_data: Current financial metrics:
                          dscr, days_cash, ief_current, ief_required,
                          occupancy, occupancy_target,
                          dscr_history (list of recent values for trend)
            covenants: Override covenant thresholds (uses defaults if None).

        Returns:
            Per-covenant status (compliant/watch/breach), distance to breach,
            and projected breach date if trending toward breach.
        """
        thresholds = covenants or DEFAULT_COVENANTS
        results: dict[str, dict] = {}
        overall_status = "compliant"

        # ── DSCR ──────────────────────────────────────────────────
        current_dscr = current_data.get("dscr", 0)
        dscr_min = thresholds.get("dscr_minimum", 1.20)
        dscr_distance = round(current_dscr - dscr_min, 3)

        if current_dscr < dscr_min:
            dscr_status = "breach"
            overall_status = "breach"
        elif dscr_distance < 0.15:
            dscr_status = "watch"
            if overall_status == "compliant":
                overall_status = "watch"
        else:
            dscr_status = "compliant"

        # Trend analysis
        dscr_history = current_data.get("dscr_history", [])
        projected_breach_date = None
        if len(dscr_history) >= 3:
            # Simple linear trend from last 3 readings
            recent = dscr_history[-3:]
            slope = (recent[-1] - recent[0]) / 2  # Per-period change
            if slope < 0 and current_dscr > dscr_min:
                periods_to_breach = (current_dscr - dscr_min) / abs(slope)
                projected_breach_date = (
                    datetime.utcnow() + timedelta(days=int(periods_to_breach * 30))
                ).strftime("%Y-%m")

        results["dscr"] = {
            "current": current_dscr,
            "minimum": dscr_min,
            "distance_to_breach": dscr_distance,
            "status": dscr_status,
            "trend": _compute_trend(dscr_history),
            "projected_breach_date": projected_breach_date,
        }

        # ── Days Cash on Hand ─────────────────────────────────────
        current_days = current_data.get("days_cash", 0)
        days_min = thresholds.get("days_cash_minimum", 150)
        days_distance = current_days - days_min

        if current_days < days_min:
            days_status = "breach"
            overall_status = "breach"
        elif days_distance < 30:
            days_status = "watch"
            if overall_status == "compliant":
                overall_status = "watch"
        else:
            days_status = "compliant"

        results["days_cash"] = {
            "current": current_days,
            "minimum": days_min,
            "distance_to_breach": days_distance,
            "status": days_status,
        }

        # ── IEF Pool ──────────────────────────────────────────────
        ief_current = current_data.get("ief_current", 0)
        ief_required = current_data.get("ief_required", 0)
        ief_coverage = round(ief_current / ief_required, 3) if ief_required else 0
        ief_min = thresholds.get("ief_coverage_minimum", 1.00)

        if ief_coverage < ief_min:
            ief_status = "breach"
            overall_status = "breach"
        elif ief_coverage < 1.10:
            ief_status = "watch"
            if overall_status == "compliant":
                overall_status = "watch"
        else:
            ief_status = "compliant"

        results["ief_pool"] = {
            "current": ief_current,
            "required": ief_required,
            "coverage": ief_coverage,
            "status": ief_status,
            "shortfall": max(0, ief_required - ief_current),
        }

        # ── Occupancy ─────────────────────────────────────────────
        current_occ = current_data.get("occupancy", 0)
        occ_target = thresholds.get("occupancy_target", 0.90)

        if current_occ < occ_target * 0.85:
            occ_status = "breach"
            if overall_status != "breach":
                overall_status = "watch"  # Occupancy below 85% of target is serious but not hard breach
        elif current_occ < occ_target:
            occ_status = "watch"
            if overall_status == "compliant":
                overall_status = "watch"
        else:
            occ_status = "compliant"

        results["occupancy"] = {
            "current": current_occ,
            "target": occ_target,
            "gap": round(occ_target - current_occ, 3),
            "status": occ_status,
        }

        return {
            "overall_status": overall_status,
            "covenants": results,
            "breach_count": sum(1 for v in results.values() if v.get("status") == "breach"),
            "watch_count": sum(1 for v in results.values() if v.get("status") == "watch"),
            "monitored_at": datetime.utcnow().isoformat(),
        }

    def generate_monthly_report(self, deal_id: str, deal_data: dict | None = None) -> dict:
        """Generate a monthly monitoring report consolidating all metrics.

        Args:
            deal_id: Unique deal identifier.
            deal_data: Optional current deal state. If None, returns a template.

        Returns:
            Consolidated monthly report with construction, absorption,
            covenant status, and action items.
        """
        if deal_data is None:
            return {
                "deal_id": deal_id,
                "report_type": "monthly_monitoring",
                "template": True,
                "sections": [
                    "construction_progress",
                    "draw_schedule",
                    "absorption_ramp",
                    "covenant_compliance",
                    "cash_position",
                    "action_items",
                ],
                "note": "Provide deal_data to generate a populated report",
                "generated_at": datetime.utcnow().isoformat(),
            }

        # Build report from available data
        report: dict[str, Any] = {
            "deal_id": deal_id,
            "deal_name": deal_data.get("deal_name", "Unknown"),
            "report_type": "monthly_monitoring",
            "report_period": datetime.utcnow().strftime("%Y-%m"),
        }

        # ── Construction Progress ─────────────────────────────────
        budget = deal_data.get("project_budget", {})
        draws = deal_data.get("draws", [])
        if budget:
            report["construction"] = self.track_draw_schedule(budget, draws)
        else:
            report["construction"] = {"note": "No budget data available"}

        # ── Absorption / Ramp ─────────────────────────────────────
        units = deal_data.get("units", [])
        timeline = deal_data.get("timeline", {})
        if units:
            report["absorption"] = self.create_ramp_schedule(units, timeline)
        else:
            report["absorption"] = {"note": "No unit data available"}

        # ── Covenant Compliance ───────────────────────────────────
        financials = deal_data.get("current_financials", {})
        if financials:
            report["covenants"] = self.monitor_covenants(financials)
        else:
            report["covenants"] = {"note": "No current financial data available"}

        # ── Cash Position ─────────────────────────────────────────
        report["cash_position"] = {
            "operating_cash": deal_data.get("operating_cash", 0),
            "dsrf_balance": deal_data.get("dsrf_balance", 0),
            "funded_interest_remaining": deal_data.get("funded_interest_remaining", 0),
            "ief_collected": deal_data.get("ief_collected", 0),
        }

        # ── Action Items ──────────────────────────────────────────
        action_items: list[str] = []

        # Check construction alerts
        construction = report.get("construction", {})
        red_items = construction.get("alerts", {}).get("red", [])
        if red_items:
            action_items.append(
                f"CRITICAL: {len(red_items)} line item(s) >10% over budget: {', '.join(red_items)}"
            )

        yellow_items = construction.get("alerts", {}).get("yellow", [])
        if yellow_items:
            action_items.append(
                f"WARNING: {len(yellow_items)} line item(s) 5-10% over budget: {', '.join(yellow_items)}"
            )

        # Check covenant status
        cov_status = report.get("covenants", {}).get("overall_status", "unknown")
        if cov_status == "breach":
            action_items.append("BREACH: One or more bond covenants in violation — notify trustee")
        elif cov_status == "watch":
            action_items.append("WATCH: Covenant metrics trending toward breach — increased monitoring")

        # Check absorption pace
        absorption = report.get("absorption", {})
        stabilization = absorption.get("projected_stabilization")
        if stabilization:
            action_items.append(f"Projected stabilization: {stabilization}")

        if not action_items:
            action_items.append("All metrics within acceptable ranges — no action required")

        report["action_items"] = action_items
        report["generated_at"] = datetime.utcnow().isoformat()

        return report


def _compute_trend(history: list[float]) -> str:
    """Compute simple trend direction from a list of values."""
    if len(history) < 2:
        return "insufficient_data"
    if history[-1] > history[-2]:
        return "improving"
    if history[-1] < history[-2]:
        return "declining"
    return "stable"
