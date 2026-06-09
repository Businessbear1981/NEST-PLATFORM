"""
NEST Hawkeye Placement Engine — investor matching, order book building,
teaser generation, and deal routing for bonds and private placements.

This is the buy-side of NEST: finding investors/buyers for every deal
that comes through the platform, whether public bond, private placement,
bridge financing, or equity.

Investor Database: Family offices, PE firms, muni bond buyers, bridge lenders.
Each investor has AUM, sector preferences, check sizes, geography, and
contact approach.

Feeds Into:
- Private Placement Engine — PP investor matching
- Bond Desk — public bond distribution
- Bernard — investor outreach narration, talking points
- Sterling Agent — CRM tracking, AEC token distribution
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from services.database import DatabaseService


# ── Investor Database (seed data — loaded to Supabase on first run) ────

INVESTOR_DATABASE: dict[str, list[dict[str, Any]]] = {
    "family_offices": [
        {
            "name": "Pritzker Organization",
            "aum_usd": 15_000_000_000,
            "sectors": ["real_estate", "senior_living", "healthcare"],
            "min_check": 5_000_000,
            "max_check": 100_000_000,
            "preferences": ["tax_exempt", "investment_grade"],
            "geography": "national",
            "contact_approach": "direct",
        },
        {
            "name": "Stephens Inc",
            "aum_usd": 3_500_000_000,
            "sectors": ["infrastructure", "healthcare", "real_estate"],
            "min_check": 2_000_000,
            "max_check": 50_000_000,
            "preferences": ["muni_bonds", "private_placement"],
            "geography": "southeast",
            "contact_approach": "direct",
        },
        {
            "name": "Sievert Larsen & Associates",
            "aum_usd": 1_200_000_000,
            "sectors": ["senior_living", "multifamily", "healthcare"],
            "min_check": 1_000_000,
            "max_check": 25_000_000,
            "preferences": ["ccrc_bonds", "high_yield"],
            "geography": "national",
            "contact_approach": "intermediary",
        },
        {
            "name": "Bezos Expeditions",
            "aum_usd": 20_000_000_000,
            "sectors": ["technology", "real_estate", "infrastructure", "biotech"],
            "min_check": 10_000_000,
            "max_check": 500_000_000,
            "preferences": ["growth_equity", "venture"],
            "geography": "national",
            "contact_approach": "intermediary",
        },
        {
            "name": "Emerson Collective",
            "aum_usd": 3_000_000_000,
            "sectors": ["healthcare", "education", "social_impact", "senior_living"],
            "min_check": 5_000_000,
            "max_check": 50_000_000,
            "preferences": ["impact_investing", "tax_exempt"],
            "geography": "national",
            "contact_approach": "intermediary",
        },
        {
            "name": "Koch Industries / Koch Disruptive Technologies",
            "aum_usd": 10_000_000_000,
            "sectors": ["technology", "energy", "infrastructure", "real_estate"],
            "min_check": 10_000_000,
            "max_check": 200_000_000,
            "preferences": ["growth_equity", "infrastructure_debt"],
            "geography": "national",
            "contact_approach": "direct",
        },
        {
            "name": "Ballmer Group",
            "aum_usd": 2_000_000_000,
            "sectors": ["technology", "social_impact", "healthcare"],
            "min_check": 5_000_000,
            "max_check": 100_000_000,
            "preferences": ["impact", "growth_equity"],
            "geography": "national",
            "contact_approach": "intermediary",
        },
    ],
    "pe_firms": [
        {
            "name": "Blackstone Real Estate",
            "aum_usd": 330_000_000_000,
            "sectors": ["real_estate", "senior_living", "multifamily", "logistics"],
            "min_check": 25_000_000,
            "max_check": 5_000_000_000,
            "preferences": ["value_add", "opportunistic", "core_plus"],
            "geography": "global",
            "contact_approach": "direct",
        },
        {
            "name": "Brookfield Asset Management",
            "aum_usd": 925_000_000_000,
            "sectors": ["infrastructure", "real_estate", "renewable_energy"],
            "min_check": 50_000_000,
            "max_check": 10_000_000_000,
            "preferences": ["infrastructure_debt", "real_assets"],
            "geography": "global",
            "contact_approach": "direct",
        },
        {
            "name": "KKR Real Estate",
            "aum_usd": 70_000_000_000,
            "sectors": ["real_estate", "multifamily", "office", "industrial"],
            "min_check": 25_000_000,
            "max_check": 1_000_000_000,
            "preferences": ["value_add", "development"],
            "geography": "global",
            "contact_approach": "direct",
        },
        {
            "name": "Harrison Street",
            "aum_usd": 56_000_000_000,
            "sectors": ["senior_living", "student_housing", "healthcare", "life_sciences"],
            "min_check": 10_000_000,
            "max_check": 500_000_000,
            "preferences": ["seniors_housing_debt", "healthcare_re"],
            "geography": "national",
            "contact_approach": "direct",
            "note": "Top seniors housing investor",
        },
        {
            "name": "Welltower (REIT)",
            "aum_usd": 40_000_000_000,
            "sectors": ["senior_living", "healthcare"],
            "min_check": 20_000_000,
            "max_check": 500_000_000,
            "preferences": ["triple_net", "ridea", "development_jv"],
            "geography": "national",
            "contact_approach": "direct",
            "note": "Largest seniors REIT",
        },
        {
            "name": "Ventas (REIT)",
            "aum_usd": 25_000_000_000,
            "sectors": ["senior_living", "healthcare", "life_sciences"],
            "min_check": 15_000_000,
            "max_check": 300_000_000,
            "preferences": ["triple_net", "development"],
            "geography": "national",
            "contact_approach": "direct",
        },
        {
            "name": "Kayne Anderson",
            "aum_usd": 35_000_000_000,
            "sectors": ["senior_living", "medical_office", "healthcare"],
            "min_check": 10_000_000,
            "max_check": 200_000_000,
            "preferences": ["seniors_debt", "bridge_lending", "mezzanine"],
            "geography": "national",
            "contact_approach": "direct",
            "note": "Active seniors bridge lender",
        },
        {
            "name": "Blue Owl Capital",
            "aum_usd": 175_000_000_000,
            "sectors": ["real_estate", "technology", "healthcare"],
            "min_check": 25_000_000,
            "max_check": 1_000_000_000,
            "preferences": ["direct_lending", "net_lease"],
            "geography": "national",
            "contact_approach": "direct",
        },
        {
            "name": "Ares Management",
            "aum_usd": 395_000_000_000,
            "sectors": ["real_estate", "infrastructure", "credit"],
            "min_check": 25_000_000,
            "max_check": 500_000_000,
            "preferences": ["direct_lending", "opportunistic_credit", "real_estate_debt"],
            "geography": "global",
            "contact_approach": "direct",
        },
    ],
    "muni_bond_buyers": [
        {
            "name": "Nuveen",
            "aum_usd": 250_000_000_000,
            "sectors": ["muni_bonds", "senior_living", "healthcare", "education"],
            "min_check": 5_000_000,
            "max_check": 50_000_000,
            "preferences": ["investment_grade", "tax_exempt"],
            "geography": "national",
        },
        {
            "name": "BlackRock Muni",
            "aum_usd": 185_000_000_000,
            "sectors": ["muni_bonds"],
            "min_check": 10_000_000,
            "max_check": 100_000_000,
            "preferences": ["investment_grade", "aaa_enhanced"],
            "geography": "national",
        },
        {
            "name": "Vanguard Muni",
            "aum_usd": 130_000_000_000,
            "sectors": ["muni_bonds"],
            "min_check": 10_000_000,
            "max_check": 50_000_000,
            "preferences": ["investment_grade"],
            "geography": "national",
        },
        {
            "name": "Lord Abbett",
            "aum_usd": 25_000_000_000,
            "sectors": ["muni_bonds", "high_yield_muni"],
            "min_check": 2_000_000,
            "max_check": 25_000_000,
            "preferences": ["high_yield_muni", "non_rated"],
            "geography": "national",
            "note": "Active HY muni buyer",
        },
        {
            "name": "Oppenheimer/Invesco Muni",
            "aum_usd": 40_000_000_000,
            "sectors": ["muni_bonds", "healthcare_bonds"],
            "min_check": 5_000_000,
            "max_check": 50_000_000,
            "preferences": ["healthcare_revenue_bonds", "ccrc_bonds"],
            "geography": "national",
        },
        {
            "name": "Ziegler Wealth",
            "aum_usd": 5_000_000_000,
            "sectors": ["senior_living_bonds", "ccrc_bonds"],
            "min_check": 500_000,
            "max_check": 10_000_000,
            "preferences": ["ccrc_bonds", "senior_living_debt"],
            "geography": "national",
            "note": "Captive buyer for Ziegler-underwritten deals",
        },
    ],
    "bridge_lenders": [
        {
            "name": "MidCap Financial",
            "aum_usd": 50_000_000_000,
            "sectors": ["senior_living", "healthcare", "multifamily"],
            "min_check": 5_000_000,
            "max_check": 100_000_000,
            "preferences": ["bridge", "value_add", "construction"],
            "geography": "national",
            "rates": "SOFR+350-550",
        },
        {
            "name": "Mesa West Capital",
            "aum_usd": 10_000_000_000,
            "sectors": ["multifamily", "industrial", "office", "retail"],
            "min_check": 15_000_000,
            "max_check": 200_000_000,
            "preferences": ["bridge", "transitional"],
            "geography": "national",
            "rates": "SOFR+300-500",
        },
        {
            "name": "Acore Capital",
            "aum_usd": 20_000_000_000,
            "sectors": ["multifamily", "industrial", "office", "hospitality"],
            "min_check": 20_000_000,
            "max_check": 300_000_000,
            "preferences": ["bridge", "mezzanine", "construction"],
            "geography": "national",
            "rates": "SOFR+325-475",
        },
        {
            "name": "Churchill Real Estate",
            "aum_usd": 5_000_000_000,
            "sectors": ["multifamily", "senior_living", "self_storage"],
            "min_check": 5_000_000,
            "max_check": 75_000_000,
            "preferences": ["bridge", "value_add"],
            "geography": "national",
            "rates": "SOFR+375-550",
        },
        {
            "name": "Dwight Capital",
            "aum_usd": 3_000_000_000,
            "sectors": ["multifamily", "senior_living", "healthcare", "hospitality"],
            "min_check": 3_000_000,
            "max_check": 100_000_000,
            "preferences": ["bridge", "hud_fha", "construction"],
            "geography": "national",
            "rates": "SOFR+350-600",
            "note": "Also does FHA/HUD",
        },
        {
            "name": "Capital One Healthcare",
            "aum_usd": 15_000_000_000,
            "sectors": ["senior_living", "healthcare", "medical_office"],
            "min_check": 10_000_000,
            "max_check": 200_000_000,
            "preferences": ["bridge", "perm", "construction"],
            "geography": "national",
            "rates": "SOFR+275-400",
            "note": "Top seniors lender",
        },
    ],
}

# ── Sector Aliases for Matching ────────────────────────────────

SECTOR_ALIASES: dict[str, list[str]] = {
    "senior_living": ["senior_living", "ccrc_bonds", "senior_living_bonds", "seniors_housing_debt", "senior_living_debt", "healthcare"],
    "healthcare": ["healthcare", "healthcare_bonds", "healthcare_re", "healthcare_revenue_bonds", "medical_office"],
    "real_estate": ["real_estate", "multifamily", "industrial", "office", "retail", "logistics", "net_lease", "self_storage"],
    "multifamily": ["multifamily", "real_estate"],
    "technology": ["technology", "software_saas", "biotech", "life_sciences"],
    "gaming_entertainment": ["gaming", "entertainment", "technology"],
    "infrastructure": ["infrastructure", "renewable_energy", "energy"],
    "education": ["education", "student_housing"],
    "muni_bonds": ["muni_bonds", "tax_exempt"],
}

# ── Channel Routing Rules ──────────────────────────────────────

CHANNEL_RULES: dict[str, dict[str, Any]] = {
    "public_bond": {
        "investor_types": ["muni_bond_buyers"],
        "min_deal_size": 10_000_000,
        "requires_rating": True,
        "timeline_weeks": 8,
    },
    "private_placement": {
        "investor_types": ["pe_firms", "family_offices"],
        "min_deal_size": 1_000_000,
        "requires_rating": False,
        "timeline_weeks": 6,
    },
    "bridge_financing": {
        "investor_types": ["bridge_lenders"],
        "min_deal_size": 3_000_000,
        "requires_rating": False,
        "timeline_weeks": 4,
    },
    "equity_placement": {
        "investor_types": ["pe_firms", "family_offices"],
        "min_deal_size": 1_000_000,
        "requires_rating": False,
        "timeline_weeks": 10,
    },
}


class HawkeyePlacement:
    """Investor matching, order book building, and deal placement engine.
    Connects every deal to the right capital source."""

    def __init__(self) -> None:
        self._db = DatabaseService()
        self._investors = self._load_investors()

    def _load_investors(self) -> dict[str, list[dict]]:
        """Load investors from Supabase; seed from constants if empty."""
        rows = self._db.select("investors", filters={"active": True}) or []
        if not rows:
            self._seed_investors()
            rows = self._db.select("investors", filters={"active": True}) or []
        result: dict[str, list[dict]] = {k: [] for k in INVESTOR_DATABASE}
        for row in rows:
            cat = row.get("category", "other")
            if cat not in result:
                result[cat] = []
            result[cat].append({
                "name": row.get("name", ""),
                "aum_usd": row.get("aum_usd", 0),
                "sectors": row.get("sectors") or [],
                "min_check": row.get("min_check", 0),
                "max_check": row.get("max_check", 0),
                "preferences": row.get("preferences") or [],
                "geography": row.get("geography", "national"),
                "contact_approach": row.get("contact_approach", "direct"),
                "rates": row.get("rates", ""),
                "note": row.get("note", ""),
            })
        return result

    def _seed_investors(self) -> None:
        """Insert INVESTOR_DATABASE into Supabase on first run."""
        for category, investors in INVESTOR_DATABASE.items():
            for inv in investors:
                self._db.insert("investors", {
                    "name": inv["name"],
                    "category": category,
                    "aum_usd": inv.get("aum_usd"),
                    "min_check": inv.get("min_check"),
                    "max_check": inv.get("max_check"),
                    "sectors": inv.get("sectors", []),
                    "preferences": inv.get("preferences", []),
                    "geography": inv.get("geography", "national"),
                    "contact_approach": inv.get("contact_approach", "direct"),
                    "rates": inv.get("rates"),
                    "note": inv.get("note"),
                })

    # ── 1. Match Investors ─────────────────────────────────────

    def match_investors(
        self, deal: dict, structure: dict
    ) -> list[dict]:
        """Match a deal to investors ranked by fit score.

        Args:
            deal: Deal dict with sector, size_usd, geography, deal_type, etc.
            structure: Structure dict (bond or PP) with instrument type, preferences.

        Returns:
            Ranked list of investor matches with scores and rationale, tiered.
        """
        deal_size = deal.get("size_usd", 0)
        deal_sector = deal.get("sector", "")
        deal_geography = deal.get("geography", "national")
        deal_type = deal.get("deal_type", "")
        is_tax_exempt = deal.get("tax_exempt", False)
        is_investment_grade = deal.get("investment_grade", False)
        structure_type = structure.get("instrument_type", structure.get("type", ""))

        # Determine which investor categories to search
        categories = self._select_investor_categories(deal, structure)

        matches: list[dict] = []

        for category in categories:
            investors = self._investors.get(category, [])
            for investor in investors:
                score, reasons = self._score_match(
                    investor, deal_size, deal_sector, deal_geography,
                    deal_type, is_tax_exempt, is_investment_grade, structure_type
                )
                if score > 0:
                    matches.append({
                        "investor_name": investor["name"],
                        "investor_category": category,
                        "aum_usd": investor.get("aum_usd", 0),
                        "check_range": {
                            "min": investor.get("min_check", 0),
                            "max": investor.get("max_check", 0),
                        },
                        "fit_score": score,
                        "match_reasons": reasons,
                        "contact_approach": investor.get("contact_approach", "direct"),
                        "note": investor.get("note", ""),
                        "rates": investor.get("rates", ""),
                    })

        # Sort by score descending
        matches.sort(key=lambda m: m["fit_score"], reverse=True)

        # Assign tiers
        for match in matches:
            score = match["fit_score"]
            if score >= 70:
                match["tier"] = 1
                match["tier_label"] = "Strong Match"
            elif score >= 40:
                match["tier"] = 2
                match["tier_label"] = "Moderate Match"
            else:
                match["tier"] = 3
                match["tier_label"] = "Possible Match"

        return matches

    # ── 2. Build Investor Book ─────────────────────────────────

    def build_investor_book(
        self, deal: dict, matches: list[dict]
    ) -> dict:
        """Create the order book with target allocations and outreach sequence.

        Args:
            deal: Deal dict.
            matches: Output of match_investors().

        Returns:
            Order book with allocations, outreach sequence, and talking points.
        """
        deal_size = deal.get("size_usd", 0)
        deal_name = deal.get("deal_name", "Unknown")

        if not matches:
            return {
                "deal_name": deal_name,
                "deal_size": deal_size,
                "error": "No investor matches found",
                "generated_at": datetime.utcnow().isoformat(),
            }

        # Split into tiers
        tier_1 = [m for m in matches if m.get("tier") == 1]
        tier_2 = [m for m in matches if m.get("tier") == 2]
        tier_3 = [m for m in matches if m.get("tier") == 3]

        # Target allocation
        anchor_target = deal_size * 0.40  # anchor takes 40%
        co_lead_target = deal_size * 0.30  # co-leads take 30%
        participant_target = deal_size * 0.30  # participants take 30%

        allocations: list[dict] = []

        # Anchor — top tier 1 match
        if tier_1:
            anchor = tier_1[0]
            anchor_amount = min(anchor_target, anchor["check_range"]["max"])
            allocations.append({
                "role": "Anchor Investor",
                "investor": anchor["investor_name"],
                "target_amount": round(anchor_amount),
                "pct_of_deal": round(anchor_amount / deal_size * 100, 1),
                "fit_score": anchor["fit_score"],
                "priority": 1,
            })

        # Co-leads — remaining tier 1 + top tier 2
        co_lead_pool = tier_1[1:] + tier_2[:3]
        co_lead_allocated = 0
        for i, investor in enumerate(co_lead_pool):
            remaining = co_lead_target - co_lead_allocated
            if remaining <= 0:
                break
            amount = min(
                remaining / max(1, len(co_lead_pool) - i),
                investor["check_range"]["max"],
            )
            amount = max(amount, investor["check_range"]["min"])
            if amount > remaining:
                amount = remaining
            allocations.append({
                "role": "Co-Lead",
                "investor": investor["investor_name"],
                "target_amount": round(amount),
                "pct_of_deal": round(amount / deal_size * 100, 1),
                "fit_score": investor["fit_score"],
                "priority": 2,
            })
            co_lead_allocated += amount

        # Participants — remaining tier 2 + tier 3
        participant_pool = tier_2[3:] + tier_3
        participant_allocated = 0
        for i, investor in enumerate(participant_pool[:5]):  # cap at 5 participants
            remaining = participant_target - participant_allocated
            if remaining <= 0:
                break
            amount = min(
                remaining / max(1, min(5, len(participant_pool)) - i),
                investor["check_range"]["max"],
            )
            amount = max(amount, investor["check_range"]["min"])
            if amount > remaining:
                amount = remaining
            allocations.append({
                "role": "Participant",
                "investor": investor["investor_name"],
                "target_amount": round(amount),
                "pct_of_deal": round(amount / deal_size * 100, 1),
                "fit_score": investor["fit_score"],
                "priority": 3,
            })
            participant_allocated += amount

        total_allocated = sum(a["target_amount"] for a in allocations)

        # Outreach sequence
        outreach_sequence = self._build_outreach_sequence(allocations, deal)

        # Talking points per investor type
        talking_points = self._build_talking_points(deal, matches)

        return {
            "deal_name": deal_name,
            "deal_size": deal_size,
            "book_summary": {
                "total_allocated": round(total_allocated),
                "book_coverage_pct": round(total_allocated / deal_size * 100, 1) if deal_size else 0,
                "investor_count": len(allocations),
                "anchor_count": sum(1 for a in allocations if a["role"] == "Anchor Investor"),
                "co_lead_count": sum(1 for a in allocations if a["role"] == "Co-Lead"),
                "participant_count": sum(1 for a in allocations if a["role"] == "Participant"),
            },
            "allocations": allocations,
            "outreach_sequence": outreach_sequence,
            "talking_points": talking_points,
            "oversubscription_target": round(deal_size * 1.50),
            "oversubscription_note": "Target 1.5x book coverage to ensure full placement with pricing tension",
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 3. Generate Teaser ─────────────────────────────────────

    def generate_teaser(
        self, deal: dict, structure: dict
    ) -> dict:
        """Blind teaser for investor outreach — no deal name.

        Args:
            deal: Deal dict.
            structure: Structure dict (bond or PP).

        Returns:
            Blind teaser with key metrics and structure summary.
        """
        deal_size = deal.get("size_usd", 0)
        sector = deal.get("sector", "")
        geography = deal.get("geography", "")
        dscr = deal.get("dscr", 0)
        ltv = deal.get("ltv", 0)

        # Blind description
        sector_labels = {
            "senior_living": "Seniors Housing / CCRC",
            "multifamily": "Multifamily Residential",
            "healthcare": "Healthcare Services",
            "real_estate": "Commercial Real Estate",
            "technology": "Technology",
            "gaming_entertainment": "Interactive Entertainment",
            "infrastructure": "Infrastructure",
        }
        sector_label = sector_labels.get(sector, sector.replace("_", " ").title())

        # Size range (blind the exact number)
        if deal_size < 5_000_000:
            size_range = "$1M - $5M"
        elif deal_size < 25_000_000:
            size_range = "$5M - $25M"
        elif deal_size < 100_000_000:
            size_range = "$25M - $100M"
        elif deal_size < 250_000_000:
            size_range = "$100M - $250M"
        else:
            size_range = "$250M+"

        # Geography blind
        geo_labels = {
            "national": "National (U.S.)",
            "southeast": "Southeastern U.S.",
            "northeast": "Northeastern U.S.",
            "midwest": "Midwestern U.S.",
            "southwest": "Southwestern U.S.",
            "west": "Western U.S.",
            "pacific_northwest": "Pacific Northwest",
        }
        geo_label = geo_labels.get(geography, geography if geography else "U.S.")

        # Key metrics
        metrics: dict[str, Any] = {}
        if dscr > 0:
            metrics["dscr"] = f"{dscr:.2f}x"
        if ltv > 0:
            metrics["ltv"] = f"{ltv:.0%}"

        # Yield indication
        coupon = structure.get("terms", {}).get("coupon_range", "")
        if not coupon:
            pricing = structure.get("pricing_summary", structure.get("indicated_coupon", {}))
            if isinstance(pricing, dict) and "low" in pricing:
                coupon = f"{pricing['low']:.2f}% - {pricing['high']:.2f}%"

        instrument = structure.get("instrument_label", structure.get("type", "Debt Instrument"))
        maturity = structure.get("terms", {}).get("maturity_years", "")

        return {
            "teaser_type": "Confidential Investment Summary",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "confidentiality_note": (
                "This summary is provided on a confidential basis for the purpose "
                "of evaluating a potential investment opportunity. Do not distribute."
            ),
            "opportunity_summary": {
                "sector": sector_label,
                "geography": geo_label,
                "size_range": size_range,
                "instrument": instrument,
                "maturity": f"{maturity} years" if maturity else "To be determined",
                "indicated_yield": coupon if coupon else "To be determined at pricing",
            },
            "key_metrics": metrics,
            "structure_summary": {
                "type": instrument,
                "security": structure.get("security_package", {}).get("lien_position", ""),
                "covenants": "Standard financial and reporting covenants",
                "equity_kicker": "Yes — warrant coverage" if structure.get("equity_kicker") else "None",
            },
            "investment_highlights": [
                f"{sector_label} sector with strong growth fundamentals",
                f"Located in {geo_label}",
                "Experienced management team with sector track record",
                "Comprehensive covenant and security package",
            ],
            "next_steps": [
                "Execute non-disclosure agreement (NDA)",
                "Receive full confidential information memorandum",
                "Management presentation and Q&A",
                "Submit indication of interest (IOI)",
            ],
            "contact": {
                "firm": "NEST Advisors — Arden Edge Capital",
                "note": "For more information, contact your NEST relationship manager",
            },
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 4. Track Placement ─────────────────────────────────────

    def track_placement(self, deal_id: str) -> dict:
        """Return placement pipeline status for a deal."""
        rows = self._db.select("placement_pipeline", filters={"deal_id": deal_id}) or []
        if rows:
            pipeline = rows[0]
        else:
            pipeline = self._db.insert("placement_pipeline", {
                "deal_id": deal_id,
                "status": "not_started",
                "investors_contacted": [],
                "ndas_executed": [],
                "iois_received": [],
                "commitments": [],
            }) or {}

        total_committed = sum(c.get("amount", 0) for c in pipeline.get("commitments") or [])
        deal_size = pipeline.get("deal_size") or 0

        return {
            "deal_id": deal_id,
            "status": pipeline.get("status", "not_started"),
            "summary": {
                "investors_contacted": len(pipeline.get("investors_contacted", [])),
                "ndas_executed": len(pipeline.get("ndas_executed", [])),
                "iois_received": len(pipeline.get("iois_received", [])),
                "ioi_total_usd": sum(
                    i.get("amount", 0) for i in pipeline.get("iois_received", [])
                ),
                "commitments": len(pipeline.get("commitments", [])),
                "committed_total_usd": total_committed,
                "book_coverage_pct": round(total_committed / deal_size * 100, 1) if deal_size else 0,
            },
            "detail": {
                "investors_contacted": pipeline.get("investors_contacted", []),
                "ndas_executed": pipeline.get("ndas_executed", []),
                "iois_received": pipeline.get("iois_received", []),
                "commitments": pipeline.get("commitments", []),
            },
            "milestones": {
                "teaser_distributed": bool(pipeline.get("investors_contacted")),
                "nda_phase_complete": len(pipeline.get("ndas_executed", [])) >= 3,
                "cim_distributed": pipeline.get("cim_distributed", False),
                "management_presentations_scheduled": pipeline.get("mgmt_presentations", 0),
                "pricing_call_scheduled": pipeline.get("pricing_call_scheduled", False),
                "closing_scheduled": pipeline.get("closing_scheduled", False),
            },
            "updated_at": pipeline.get("updated_at", datetime.utcnow().isoformat()),
        }

    def update_placement(
        self, deal_id: str, event_type: str, data: dict
    ) -> dict:
        """Update placement pipeline with a new event and persist to Supabase."""
        current = self.track_placement(deal_id)
        detail = current.get("detail", {})
        timestamp = datetime.utcnow().isoformat()
        event_entry = {**data, "timestamp": timestamp}

        updates: dict[str, Any] = {}

        if event_type == "contacted":
            lst = list(detail.get("investors_contacted") or [])
            lst.append(event_entry)
            updates["investors_contacted"] = lst
            updates["status"] = "marketing"
        elif event_type == "nda":
            lst = list(detail.get("ndas_executed") or [])
            lst.append(event_entry)
            updates["ndas_executed"] = lst
            updates["status"] = "due_diligence"
        elif event_type == "ioi":
            lst = list(detail.get("iois_received") or [])
            lst.append(event_entry)
            updates["iois_received"] = lst
            updates["status"] = "indications"
        elif event_type == "commitment":
            lst = list(detail.get("commitments") or [])
            lst.append(event_entry)
            updates["commitments"] = lst
            updates["status"] = "committed"
        elif event_type == "status":
            updates["status"] = data.get("status", current.get("status", "not_started"))
            for key in ("cim_distributed", "mgmt_presentations", "pricing_call_scheduled", "closing_scheduled"):
                if key in data:
                    updates[key] = data[key]

        if updates:
            rows = self._db.select("placement_pipeline", filters={"deal_id": deal_id}) or []
            if rows:
                self._db.update("placement_pipeline", rows[0]["id"], updates)
            else:
                self._db.insert("placement_pipeline", {"deal_id": deal_id, **updates})

        return self.track_placement(deal_id)

    # ── 5. Route Deal ──────────────────────────────────────────

    def route_deal(self, deal: dict) -> dict:
        """Master routing: determine the best channel for a deal and
        return matched investors with a suggested process timeline.

        Args:
            deal: Deal dict with deal_type, size_usd, sector, tax_exempt,
                  investment_grade, dscr, ltv, etc.

        Returns:
            Recommended channel, investor matches, process timeline.
        """
        deal_type = deal.get("deal_type", "")
        size = deal.get("size_usd", 0)
        tax_exempt = deal.get("tax_exempt", False)
        ig = deal.get("investment_grade", False)
        pre_revenue = deal.get("pre_revenue", False)
        dscr = deal.get("dscr", 0)

        # Determine primary channel
        channel = self._determine_channel(deal)
        channel_config = CHANNEL_RULES.get(channel, CHANNEL_RULES["private_placement"])

        # Secondary channels (backup or parallel)
        secondary_channels = self._determine_secondary_channels(deal, channel)

        # Build a dummy structure for matching
        structure = {
            "type": channel,
            "instrument_type": self._channel_to_instrument(channel),
            "instrument_label": self._channel_to_instrument_label(channel),
        }

        # Match investors for primary channel
        primary_matches = self.match_investors(deal, structure)

        # Match for secondary channels
        secondary_matches: dict[str, list[dict]] = {}
        for sec_channel in secondary_channels:
            sec_structure = {
                "type": sec_channel,
                "instrument_type": self._channel_to_instrument(sec_channel),
            }
            sec_matches = self.match_investors(deal, sec_structure)
            if sec_matches:
                secondary_matches[sec_channel] = sec_matches[:5]  # top 5 per channel

        # Process timeline
        timeline = self._build_process_timeline(channel, deal)

        return {
            "recommended_channel": channel,
            "channel_label": channel.replace("_", " ").title(),
            "rationale": self._channel_rationale(channel, deal),
            "channel_requirements": channel_config,
            "primary_matches": primary_matches,
            "primary_match_count": len(primary_matches),
            "tier_1_count": sum(1 for m in primary_matches if m.get("tier") == 1),
            "secondary_channels": {
                ch: {
                    "match_count": len(matches),
                    "top_matches": matches,
                }
                for ch, matches in secondary_matches.items()
            },
            "process_timeline": timeline,
            "estimated_closing_weeks": channel_config.get("timeline_weeks", 8),
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── Private: Scoring ───────────────────────────────────────

    def _score_match(
        self,
        investor: dict,
        deal_size: int,
        deal_sector: str,
        deal_geography: str,
        deal_type: str,
        is_tax_exempt: bool,
        is_investment_grade: bool,
        structure_type: str,
    ) -> tuple[int, list[str]]:
        """Score an investor match 0-100 with reasons."""
        score = 0
        reasons: list[str] = []

        # 1. Size fit (0-30 points)
        min_check = investor.get("min_check", 0)
        max_check = investor.get("max_check", 0)
        if min_check <= deal_size <= max_check:
            score += 30
            reasons.append(f"Deal size ${deal_size:,.0f} within check range ${min_check:,.0f}-${max_check:,.0f}")
        elif deal_size < min_check:
            # Could still participate at minimum check if deal is club
            if deal_size >= min_check * 0.50:
                score += 10
                reasons.append(f"Deal below min check but within club range")
            elif deal_size >= min_check * 0.20:
                score += 5
                reasons.append(f"Deal below min check — requires anchor syndicate or fund allocation")
            else:
                return 0, []  # too small, skip entirely
        elif deal_size > max_check:
            # Large deal — investor can still participate at their max
            score += 20
            reasons.append(f"Deal exceeds max check — investor participates at ${max_check:,.0f}")

        # 2. Sector fit (0-30 points)
        preferences = investor.get("preferences", [])
        investor_sectors = investor.get("sectors", [])
        sector_aliases = SECTOR_ALIASES.get(deal_sector, [deal_sector])
        sector_match = False
        for alias in sector_aliases:
            if alias in investor_sectors:
                sector_match = True
                break
        # Also check if any investor sector is an alias for the deal sector
        if not sector_match:
            for inv_sector in investor_sectors:
                inv_aliases = SECTOR_ALIASES.get(inv_sector, [])
                if deal_sector in inv_aliases:
                    sector_match = True
                    break

        if sector_match:
            score += 30
            reasons.append(f"Sector match: {deal_sector}")
        else:
            # Check for broad matches (PE firms often have flexible mandates)
            broad_match = False
            if "real_estate" in investor_sectors and deal_sector in (
                "senior_living", "multifamily", "healthcare"
            ):
                score += 15
                reasons.append(f"Broad real estate mandate covers {deal_sector}")
                broad_match = True
            elif "technology" in investor_sectors and deal_sector in (
                "gaming_entertainment", "software_saas", "early_stage_tech",
                "gaming", "entertainment",
            ):
                score += 15
                reasons.append(f"Technology mandate covers {deal_sector}")
                broad_match = True
            elif "credit" in investor_sectors or "direct_lending" in [
                p for p in preferences
            ]:
                score += 10
                reasons.append(f"Broad credit mandate — flexible sector")
                broad_match = True

            # Growth equity / venture investors often go cross-sector
            if not broad_match:
                growth_prefs = {"growth_equity", "venture", "impact", "impact_investing"}
                if growth_prefs & set(preferences):
                    score += 10
                    reasons.append(f"Growth/venture mandate — sector-agnostic")
                    broad_match = True

            if not broad_match:
                return 0, []  # no sector overlap

        # 3. Preference fit (0-20 points)
        pref_score = 0
        pref_reasons: list[str] = []

        if is_tax_exempt and "tax_exempt" in preferences:
            pref_score += 10
            pref_reasons.append("Tax-exempt preference match")
        if is_investment_grade and "investment_grade" in preferences:
            pref_score += 10
            pref_reasons.append("Investment-grade preference match")
        if "private_placement" in preferences and structure_type in (
            "private_placement", "convertible_note", "senior_secured_note",
            "mezzanine_note", "revenue_participation_note",
        ):
            pref_score += 10
            pref_reasons.append("Private placement preference match")
        if "muni_bonds" in preferences and is_tax_exempt:
            pref_score += 10
            pref_reasons.append("Municipal bond buyer")
        if "high_yield" in preferences or "high_yield_muni" in preferences:
            if not is_investment_grade:
                pref_score += 10
                pref_reasons.append("High-yield buyer")
        if "growth_equity" in preferences or "venture" in preferences:
            if deal_type in ("equity_raise", "equity"):
                pref_score += 10
                pref_reasons.append("Growth/venture equity preference")
        if "direct_lending" in preferences and structure_type in (
            "senior_secured_note", "mezzanine_note"
        ):
            pref_score += 10
            pref_reasons.append("Direct lending mandate")
        if "bridge" in preferences and deal_type in ("bridge", "construction"):
            pref_score += 10
            pref_reasons.append("Bridge lending preference")

        # Cap preference score at 20
        pref_score = min(pref_score, 20)
        score += pref_score
        reasons.extend(pref_reasons[:3])  # top 3 preference reasons

        # 4. Geography fit (0-10 points)
        investor_geo = investor.get("geography", "national")
        if investor_geo in ("national", "global"):
            score += 10
            reasons.append(f"Geography: {investor_geo}")
        elif investor_geo == deal_geography:
            score += 10
            reasons.append(f"Geography match: {deal_geography}")
        else:
            score += 3  # some geographic mismatch penalty but not a dealbreaker

        # 5. Relationship / approach bonus (0-10 points)
        approach = investor.get("contact_approach", "")
        if approach == "direct":
            score += 10
            reasons.append("Direct contact approach — faster execution")
        elif approach == "intermediary":
            score += 5
            reasons.append("Intermediary approach — requires introduction")

        return min(score, 100), reasons

    # ── Private: Category Selection ────────────────────────────

    def _select_investor_categories(
        self, deal: dict, structure: dict
    ) -> list[str]:
        """Select which investor categories to search."""
        deal_type = deal.get("deal_type", "")
        tax_exempt = deal.get("tax_exempt", False)
        structure_type = structure.get("type", structure.get("instrument_type", ""))

        categories: list[str] = []

        # Public bond -> muni buyers first
        if tax_exempt or structure_type == "public_bond":
            categories.append("muni_bond_buyers")

        # Private placement -> PE + family offices
        if structure_type in (
            "private_placement", "convertible_note", "senior_secured_note",
            "mezzanine_note", "revenue_participation_note",
        ):
            categories.extend(["pe_firms", "family_offices"])

        # Equity -> PE + family offices
        if deal_type in ("equity_raise", "equity", "m_and_a_equity"):
            if "pe_firms" not in categories:
                categories.append("pe_firms")
            if "family_offices" not in categories:
                categories.append("family_offices")

        # Bridge / construction -> bridge lenders
        if deal_type in ("bridge", "construction", "construction_bond"):
            categories.append("bridge_lenders")

        # If nothing selected, search everything
        if not categories:
            categories = list(self._investors.keys())

        return categories

    # ── Private: Outreach Sequence ─────────────────────────────

    def _build_outreach_sequence(
        self, allocations: list[dict], deal: dict
    ) -> list[dict]:
        """Build ordered outreach sequence."""
        sequence: list[dict] = []
        week = 1

        # Week 1: Contact anchors
        anchors = [a for a in allocations if a["role"] == "Anchor Investor"]
        if anchors:
            sequence.append({
                "week": week,
                "phase": "Anchor Outreach",
                "actions": [
                    f"Call {a['investor']} — present teaser, gauge interest"
                    for a in anchors
                ],
                "goal": "Secure anchor commitment or strong IOI",
            })
            week += 1

        # Week 2: Co-lead outreach
        co_leads = [a for a in allocations if a["role"] == "Co-Lead"]
        if co_leads:
            sequence.append({
                "week": week,
                "phase": "Co-Lead Outreach",
                "actions": [
                    f"Send teaser to {a['investor']}, schedule intro call"
                    for a in co_leads
                ],
                "goal": "Distribute CIM, execute NDAs with co-leads",
            })
            week += 1

        # Week 3: Participant outreach
        participants = [a for a in allocations if a["role"] == "Participant"]
        if participants:
            sequence.append({
                "week": week,
                "phase": "Broad Marketing",
                "actions": [
                    f"Distribute teaser to {a['investor']}"
                    for a in participants
                ],
                "goal": "Build full book coverage, generate competitive tension",
            })
            week += 1

        # Week 4+: Management presentations and pricing
        sequence.append({
            "week": week,
            "phase": "Management Presentations",
            "actions": [
                "Schedule group or 1-on-1 management presentations",
                "Distribute updated financial projections",
                "Collect IOIs from all interested parties",
            ],
            "goal": "Collect IOIs, finalize allocation",
        })
        week += 1

        sequence.append({
            "week": week,
            "phase": "Pricing & Allocation",
            "actions": [
                "Set final pricing based on book demand",
                "Notify investors of allocation",
                "Distribute final documents for execution",
            ],
            "goal": "Close placement, execute documents",
        })

        return sequence

    # ── Private: Talking Points ────────────────────────────────

    def _build_talking_points(
        self, deal: dict, matches: list[dict]
    ) -> dict:
        """Generate investor-type-specific talking points."""
        deal_name = deal.get("deal_name", "the opportunity")
        sector = deal.get("sector", "")
        size = deal.get("size_usd", 0)
        dscr = deal.get("dscr", 0)
        pre_revenue = deal.get("pre_revenue", False)

        points: dict[str, list[str]] = {}

        # Family offices
        points["family_offices"] = [
            f"Direct access to {sector.replace('_', ' ')} deal — no fund layers, no blind pool",
            "Co-investment alongside NEST Advisors principals",
            "Quarterly reporting with full transparency",
            "Tax-efficient structuring available" if deal.get("tax_exempt") else "Attractive risk-adjusted yield",
        ]

        # PE firms
        points["pe_firms"] = [
            f"Proprietary deal sourced by NEST — not broadly marketed",
            f"Deal size ${size:,.0f} — right-sized for direct lending or equity",
        ]
        if dscr > 0:
            points["pe_firms"].append(f"DSCR {dscr:.2f}x with defined coverage trajectory")
        if pre_revenue:
            points["pe_firms"].append("Early-stage with significant upside — equity kicker included")
        points["pe_firms"].append("NEST provides ongoing surveillance and reporting")

        # Muni bond buyers
        points["muni_bond_buyers"] = [
            "Tax-exempt revenue bonds with full covenant package",
            "EMMA continuing disclosure compliant",
        ]
        if dscr >= 1.50:
            points["muni_bond_buyers"].append(f"Strong coverage: {dscr:.2f}x DSCR")
        points["muni_bond_buyers"].append("Structured by NEST using Jacaranda Trace bond blueprint")

        # Bridge lenders
        points["bridge_lenders"] = [
            f"Bridge-to-perm opportunity in {sector.replace('_', ' ')}",
            "Clear exit strategy via permanent bond takeout",
            "NEST structures the perm takeout — single-source execution",
        ]
        if deal.get("ltv", 0) > 0:
            points["bridge_lenders"].append(f"LTV: {deal['ltv']:.0%}")

        return points

    # ── Private: Channel Routing ───────────────────────────────

    def _determine_channel(self, deal: dict) -> str:
        """Determine the primary channel for a deal."""
        deal_type = deal.get("deal_type", "")
        size = deal.get("size_usd", 0)
        tax_exempt = deal.get("tax_exempt", False)
        ig = deal.get("investment_grade", False)
        pre_revenue = deal.get("pre_revenue", False)
        dscr = deal.get("dscr", 0)

        # Equity raise -> equity placement
        if deal_type in ("equity_raise", "equity", "m_and_a_equity"):
            return "equity_placement"

        # Bridge / construction -> bridge
        if deal_type in ("bridge", "construction"):
            return "bridge_financing"

        # Tax-exempt + IG + large enough -> public bond
        if tax_exempt and ig and size >= 10_000_000:
            return "public_bond"

        # Tax-exempt + large but not IG -> public bond (HY muni)
        if tax_exempt and size >= 25_000_000:
            return "public_bond"

        # Large IG deal -> public bond
        if ig and size >= 25_000_000:
            return "public_bond"

        # Pre-revenue or small -> PP
        if pre_revenue or size < 10_000_000:
            return "private_placement"

        # Weak credit -> PP
        if dscr > 0 and dscr < 1.20:
            return "private_placement"

        # Default: PP for anything that doesn't clearly qualify for public
        return "private_placement"

    def _determine_secondary_channels(
        self, deal: dict, primary: str
    ) -> list[str]:
        """Determine secondary/backup channels."""
        channels: list[str] = []

        if primary == "public_bond":
            channels.append("private_placement")  # fallback if bond doesn't work
        elif primary == "private_placement":
            if deal.get("deal_type") in ("construction", "bridge"):
                channels.append("bridge_financing")
        elif primary == "equity_placement":
            channels.append("private_placement")  # convertible as alternative
        elif primary == "bridge_financing":
            channels.append("private_placement")

        return channels

    def _channel_to_instrument(self, channel: str) -> str:
        """Map channel to instrument type."""
        mapping = {
            "public_bond": "tax_exempt_revenue_bond",
            "private_placement": "senior_secured_note",
            "bridge_financing": "bridge_loan",
            "equity_placement": "equity",
        }
        return mapping.get(channel, "unknown")

    def _channel_to_instrument_label(self, channel: str) -> str:
        """Map channel to human-readable instrument label."""
        mapping = {
            "public_bond": "Tax-Exempt Revenue Bond",
            "private_placement": "Private Placement Note",
            "bridge_financing": "Bridge Loan",
            "equity_placement": "Equity Investment",
        }
        return mapping.get(channel, channel.replace("_", " ").title())

    def _channel_rationale(self, channel: str, deal: dict) -> str:
        """Explain why this channel was selected."""
        size = deal.get("size_usd", 0)
        rationales = {
            "public_bond": (
                f"Deal size ${size:,.0f} with tax-exempt eligibility and investment-grade "
                "profile — public bond market provides lowest cost of capital"
            ),
            "private_placement": (
                f"Deal characteristics (size, credit, sector) best suited for "
                "private placement with institutional investors"
            ),
            "bridge_financing": (
                "Near-term financing need with clear permanent takeout path — "
                "bridge lenders provide fastest execution"
            ),
            "equity_placement": (
                "Equity raise structure — targeting PE firms and family offices "
                "with growth equity mandates"
            ),
        }
        return rationales.get(channel, f"Routed to {channel} based on deal profile")

    def _build_process_timeline(
        self, channel: str, deal: dict
    ) -> list[dict]:
        """Build a process timeline for the placement."""
        config = CHANNEL_RULES.get(channel, CHANNEL_RULES["private_placement"])
        total_weeks = config.get("timeline_weeks", 8)

        if channel == "public_bond":
            return [
                {"week": "1-2", "phase": "Document Preparation", "activities": "Draft Official Statement, finalize bond indenture, engage rating agency"},
                {"week": "3-4", "phase": "Rating Process", "activities": "Rating agency presentation, site visit, receive preliminary rating"},
                {"week": "5-6", "phase": "Marketing Period", "activities": "Distribute POS, investor roadshow, collect orders"},
                {"week": "7", "phase": "Pricing", "activities": "Price bonds, allocate orders, confirm pricing wire"},
                {"week": "8", "phase": "Closing", "activities": "Execute documents, fund escrow, deliver bonds"},
            ]
        elif channel == "private_placement":
            return [
                {"week": "1", "phase": "Teaser Distribution", "activities": "Distribute blind teaser to target investors, gauge interest"},
                {"week": "2", "phase": "NDA & CIM", "activities": "Execute NDAs with interested parties, distribute offering memorandum"},
                {"week": "3-4", "phase": "Due Diligence", "activities": "Management presentations, Q&A, data room access"},
                {"week": "5", "phase": "IOI Collection", "activities": "Collect indications of interest, negotiate terms"},
                {"week": "6", "phase": "Closing", "activities": "Finalize documents, fund, close"},
            ]
        elif channel == "bridge_financing":
            return [
                {"week": "1", "phase": "Term Sheet", "activities": "Submit to target lenders, receive term sheets"},
                {"week": "2", "phase": "Selection", "activities": "Compare terms, select lender, execute term sheet"},
                {"week": "3", "phase": "Underwriting", "activities": "Lender due diligence, appraisal, environmental"},
                {"week": "4", "phase": "Closing", "activities": "Loan documents, fund, close"},
            ]
        else:  # equity
            return [
                {"week": "1-2", "phase": "Teaser & NDA", "activities": "Distribute teaser, execute NDAs with potential investors"},
                {"week": "3-4", "phase": "CIM & Meetings", "activities": "Distribute offering memo, management presentations"},
                {"week": "5-7", "phase": "Due Diligence", "activities": "Detailed DD, term negotiation, legal review"},
                {"week": "8-9", "phase": "Documentation", "activities": "Negotiate investment agreements, shareholder agreements"},
                {"week": "10", "phase": "Closing", "activities": "Execute documents, fund, close"},
            ]
