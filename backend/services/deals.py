"""
Deals registry — minimal in-memory seed that feeds the public Active Deals
preview and the marketing studio. Swap for persistence when a DB lands.
"""
from __future__ import annotations

import threading
from datetime import date, timedelta


_SEED = [
    {
        "id": "JT-2025-42",
        "name": "Jacaranda Trace",
        "blind_name": "Sunbelt Senior Living Portfolio",
        "asset_class": "senior_housing",
        "location": "Tampa, FL",
        "size_usd": 231_000_000,
        "projected_yield_pct": 11.2,
        "stage": "book_building",
        "deal_type": "refi",
        "sector": "senior_living",
        "target_close": (date.today() + timedelta(days=38)).isoformat(),
        "summary": "Three-property seniors housing portfolio. A/B tranche, LC endgame.",
        "financials": {
            "par_amount": 231_000_000,
            "coupon": 5.75,
            "issuer": "Florida LGFC",
            "cusip": "34077EAA1",
            "enhancement": "hylant_surety",
            "enhanced_rating": "A",
            "underlying_rating": "Baa1/BBB+",
        },
    },
    {
        "id": "BW-2025-18",
        "name": "Bellwether Cold Storage",
        "blind_name": "PNW Industrial Cold Chain",
        "asset_class": "industrial",
        "location": "Tacoma, WA",
        "size_usd": 18_500_000,
        "projected_yield_pct": 9.8,
        "stage": "structuring",
        "target_close": (date.today() + timedelta(days=71)).isoformat(),
        "summary": "Single-tenant cold storage, 20-yr NNN lease, investment-grade tenant.",
    },
    {
        "id": "CV-2025-26",
        "name": "Cascadia Vista",
        "blind_name": "PNW Multifamily Infill",
        "asset_class": "multifamily",
        "location": "Portland, OR",
        "size_usd": 26_000_000,
        "projected_yield_pct": 10.4,
        "stage": "teaser_live",
        "target_close": (date.today() + timedelta(days=54)).isoformat(),
        "summary": "Mid-rise infill multifamily, lease-up stabilized, refi-ready structure.",
    },
    {
        "id": "MH-2025-12",
        "name": "Mariners' Harbor",
        "blind_name": "PNW Marine Infrastructure",
        "asset_class": "infrastructure",
        "location": "Bellingham, WA",
        "size_usd": 12_750_000,
        "projected_yield_pct": 9.1,
        "stage": "structuring",
        "target_close": (date.today() + timedelta(days=92)).isoformat(),
        "summary": "Deep-water terminal upgrade, 30-yr concession, municipal offtake.",
    },
    # ── New pipeline deals ──────────────────────────────────────────────
    {
        "id": "LS-2025-50",
        "name": "LifeStar Point Loop",
        "blind_name": "Southeast Senior Living Bridge-to-Perm",
        "asset_class": "senior_housing",
        "location": "Florida",
        "size_usd": 50_000_000,
        "projected_yield_pct": 7.5,
        "stage": "structuring",
        "deal_type": "bridge_to_bond",
        "sector": "senior_living",
        "target_close": (date.today() + timedelta(days=60)).isoformat(),
        "summary": "Bridge-to-permanent structure. $15M bridge facility + $35M perm bond takeout. Senior living CCRC operator.",
        "financials": {
            "bridge_amount": 15_000_000,
            "perm_amount": 35_000_000,
            "total_facilities": 50_000_000,
        },
    },
    {
        "id": "SP-2025-172",
        "name": "St. Petersburg Senior Living",
        "blind_name": "Gulf Coast CCRC Development",
        "asset_class": "senior_housing",
        "location": "St. Petersburg, FL",
        "size_usd": 172_500_000,
        "projected_yield_pct": 5.875,
        "stage": "structuring",
        "deal_type": "construction",
        "sector": "senior_living",
        "target_close": (date.today() + timedelta(days=120)).isoformat(),
        "summary": "New construction 300-unit CCRC. Tax-exempt bonds through Florida LGFC. Hylant surety enhanced.",
        "financials": {
            "total_project_cost": 230_000_000,
            "ltc_ratio": 0.75,
            "units": 300,
            "construction_months": 24,
        },
    },
    {
        "id": "HBO2-2025-155",
        "name": "HBO2",
        "blind_name": "Biotech Defense Platform",
        "asset_class": "biotech_defense",
        "location": "Norwalk, CT",
        "size_usd": 155_000_000,
        "projected_yield_pct": None,
        "stage": "structuring",
        "deal_type": "equity_raise",
        "sector": "biotech_pharma",
        "target_close": (date.today() + timedelta(days=180)).isoformat(),
        "summary": "Hyperbaric oxygen therapy platform. Military/DOD applications. $155M equity injection for manufacturing facility + FDA trials. Pre-revenue, platform technology.",
        "financials": {
            "pre_money_valuation": 300_000_000,
            "primary_equity": 105_000_000,
            "secondary_purchases": 50_000_000,
            "revenue_at_maturity": 500_000_000,
            "ebitda_at_maturity": 150_000_000,
            "exit_multiple": 15.0,
            "hold_period_years": 5,
            "fda_required": True,
            "government_contract_dependent": True,
        },
    },
    {
        "id": "CC-2025-1.5",
        "name": "Celebrity Crush",
        "blind_name": "Mobile Gaming Seed",
        "asset_class": "gaming_entertainment",
        "location": "Los Angeles, CA",
        "size_usd": 1_500_000,
        "projected_yield_pct": None,
        "stage": "intake",
        "deal_type": "equity_raise",
        "sector": "technology",
        "target_close": (date.today() + timedelta(days=90)).isoformat(),
        "summary": "Mobile gaming studio. Celebrity-driven social gaming platform. Seed equity round. Pre-revenue.",
        "financials": {
            "pre_money_valuation": 5_000_000,
            "primary_equity": 1_500_000,
            "revenue_at_maturity": 25_000_000,
            "ebitda_at_maturity": 5_000_000,
            "exit_multiple": 12.0,
            "hold_period_years": 4,
        },
    },
    {
        "id": "AIP-2025-3100",
        "name": "AI Pathfinder",
        "blind_name": "UK Sovereign AI Infrastructure",
        "asset_class": "data_centers",
        "location": "United Kingdom",
        "size_usd": 3_100_000_000,
        "projected_yield_pct": 5.25,
        "stage": "intake",
        "deal_type": "construction",
        "sector": "data_centers",
        "target_close": (date.today() + timedelta(days=365)).isoformat(),
        "summary": "Sovereign AI compute platform. 560K GPUs, 2GW power by 2029. £100M seed + £250M convert + £750M Series A equity. £2.0B infrastructure debt — data center bonds. NVIDIA expected Series A. Dell strategic partner. UK MoD + NHS anchor customers.",
        "financials": {
            "total_project_cost": 3_600_000_000,
            "equity_raise": 1_100_000_000,
            "debt_raise": 2_000_000_000,
            "gpu_count": 560_000,
            "power_gw": 2.0,
            "construction_months": 36,
        },
    },
]


class DealsRegistry:
    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._deals: dict[str, dict] = {d["id"]: dict(d) for d in _SEED}

    def list_active(self, *, blind: bool = True) -> list[dict]:
        with self._lock:
            out = []
            for d in self._deals.values():
                if d["stage"] in {"closed", "cancelled"}:
                    continue
                copy = dict(d)
                copy["name"] = d["blind_name"] if blind else d["name"]
                out.append(copy)
            return sorted(out, key=lambda d: d["target_close"])

    def get(self, deal_id: str) -> dict | None:
        with self._lock:
            d = self._deals.get(deal_id)
            return dict(d) if d else None

    def add_deal(self, deal: dict) -> dict:
        """Add a deal dynamically. Returns the stored copy."""
        with self._lock:
            deal_id = deal["id"]
            self._deals[deal_id] = dict(deal)
            return dict(deal)

    def get_by_sector(self, sector: str) -> list[dict]:
        """Filter deals by sector field."""
        with self._lock:
            return [dict(d) for d in self._deals.values()
                    if d.get("sector") == sector]

    def get_by_type(self, deal_type: str) -> list[dict]:
        """Filter deals by deal_type field."""
        with self._lock:
            return [dict(d) for d in self._deals.values()
                    if d.get("deal_type") == deal_type]

    def pipeline_total(self) -> int:
        with self._lock:
            return sum(int(d["size_usd"]) for d in self._deals.values())

    def pipeline_by_sector(self) -> dict:
        """Returns {sector: total_usd} breakdown across all deals."""
        with self._lock:
            breakdown: dict[str, int] = {}
            for d in self._deals.values():
                sector = d.get("sector", "unclassified")
                breakdown[sector] = breakdown.get(sector, 0) + int(d["size_usd"])
            return breakdown

    def cross_deal_summary(self) -> dict:
        """Summary stats: total pipeline, deal count, sector & type breakdown."""
        with self._lock:
            deals = list(self._deals.values())
            total = sum(int(d["size_usd"]) for d in deals)

            sector_breakdown: dict[str, int] = {}
            type_breakdown: dict[str, int] = {}
            for d in deals:
                sector = d.get("sector", "unclassified")
                sector_breakdown[sector] = sector_breakdown.get(sector, 0) + int(d["size_usd"])
                dtype = d.get("deal_type", "unclassified")
                type_breakdown[dtype] = type_breakdown.get(dtype, 0) + int(d["size_usd"])

            return {
                "total_pipeline_usd": total,
                "deal_count": len(deals),
                "sector_breakdown": sector_breakdown,
                "type_breakdown": type_breakdown,
            }
