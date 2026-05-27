"""
NEST Bernard "Find Me" Engine — converts natural language deal descriptions
into structured EagleEye signals, deal profiles, capital structure
recommendations, and investor matching.

Bernard is NEST's action engine. When someone describes what they want —
"I'm in beauty, I want to acquire wholesale distributors" — this engine:
1. Parses the intent (acquisition, expansion, startup, refinancing)
2. Identifies the sector and sub-sector
3. Determines what capital solution fits
4. Structures a preliminary deal
5. Generates EagleEye watchlist signals
6. Routes to Hawkeye for investor matching

Feeds Into:
- Intelligence Engine — bond sizing for structured deals
- Private Placement Engine — PP for sub-threshold deals
- Hawkeye Placement — investor matching and order book
- EagleEye — signal generation for deal sourcing
- Bond Desk — capital structure assembly
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any


# ── Sector Intelligence Database ──────────────────────────────────

SECTOR_INTELLIGENCE: dict[str, dict[str, Any]] = {
    "beauty_cosmetics": {
        "naics": "4461",
        "sub_sectors": {
            "manufacturing": {
                "naics": "3256",
                "description": "Soap, cleaning compound, toilet preparation manufacturing",
                "multiples": (6, 10),
                "metric": "EBITDA",
            },
            "wholesale": {
                "naics": "4244",
                "description": "Grocery and related product wholesalers (beauty/personal care)",
                "multiples": (4, 7),
                "metric": "EBITDA",
            },
            "retail": {
                "naics": "4461",
                "description": "Health and personal care stores",
                "multiples": (5, 8),
                "metric": "EBITDA",
            },
            "ecommerce": {
                "naics": "4541",
                "description": "Electronic shopping / mail-order",
                "multiples": (8, 15),
                "metric": "revenue",
            },
            "hair_extensions_wigs": {
                "naics": "3999",
                "description": "All other miscellaneous manufacturing",
                "multiples": (5, 8),
                "metric": "EBITDA",
            },
        },
        "market_data": {
            "us_market_size_usd": 100_000_000_000,
            "black_beauty_market_usd": 14_000_000_000,
            "hair_extensions_market_usd": 6_400_000_000,
            "growth_rate": 0.065,
            "key_players": [
                "Revlon",
                "L'Oreal (Carol's Daughter)",
                "Sundial Brands (Unilever)",
                "Mayvenn",
                "Indique Hair",
                "Beauty Exchange",
                "Sensationnel",
            ],
            "acquisition_targets_profile": {
                "wholesale_distributors": (
                    "Regional beauty supply distributors serving salons and "
                    "independent retailers. Revenue $5M-$50M. Often family-owned, "
                    "succession planning creates acquisition opportunities."
                ),
                "manufacturers": (
                    "Contract manufacturers producing wigs, extensions, closures. "
                    "Often overseas sourcing with domestic finishing. Revenue $2M-$25M."
                ),
                "dtc_brands": (
                    "Direct-to-consumer brands with social media following. "
                    "Revenue $1M-$10M. High growth, low margins initially."
                ),
            },
        },
    },
    "senior_living": {
        "naics": "6232",
        "sub_sectors": {
            "ccrc": {"naics": "6232", "multiples": (8, 12), "metric": "EBITDA"},
            "assisted_living": {"naics": "6231", "multiples": (8, 12), "metric": "EBITDA"},
            "memory_care": {"naics": "6231", "multiples": (10, 14), "metric": "EBITDA"},
            "skilled_nursing": {"naics": "6231", "multiples": (6, 8), "metric": "EBITDA"},
        },
        "market_data": {
            "us_market_size_usd": 475_000_000_000,
            "growth_rate": 0.055,
            "key_players": [
                "Brookdale Senior Living",
                "Five Star Senior Living",
                "Sunrise Senior Living",
                "Atria Senior Living",
                "Life Care Services",
            ],
            "acquisition_targets_profile": {
                "ccrc_portfolios": (
                    "Continuing Care Retirement Communities with entrance fee models. "
                    "Per-unit pricing $150K-$350K. Strong demographics in Sun Belt states."
                ),
                "assisted_living_clusters": (
                    "Regional assisted living operators with 3-10 communities. "
                    "Revenue $20M-$100M. Often founder-operated with succession needs."
                ),
            },
        },
    },
    "multifamily": {
        "naics": "5311",
        "sub_sectors": {
            "conventional": {"naics": "5311", "multiples": (10, 16), "metric": "NOI"},
            "affordable": {"naics": "5311", "multiples": (8, 12), "metric": "NOI"},
            "student_housing": {"naics": "5311", "multiples": (10, 14), "metric": "NOI"},
        },
        "market_data": {
            "us_market_size_usd": 3_400_000_000_000,
            "growth_rate": 0.04,
            "key_players": [
                "Greystar",
                "Lincoln Property",
                "MAA",
                "AvalonBay",
                "Equity Residential",
            ],
            "acquisition_targets_profile": {
                "value_add_portfolios": (
                    "Class B/C apartments in growth MSAs needing renovation. "
                    "50-300 units per property. Cap rates 5.5%-7.5%."
                ),
            },
        },
    },
    "technology": {
        "naics": "5112",
        "sub_sectors": {
            "saas": {"naics": "5112", "multiples": (8, 15), "metric": "ARR"},
            "gaming": {"naics": "5112", "multiples": (6, 12), "metric": "EBITDA"},
            "ai_infrastructure": {"naics": "5182", "multiples": (12, 20), "metric": "EBITDA"},
        },
        "market_data": {
            "us_market_size_usd": 1_800_000_000_000,
            "growth_rate": 0.12,
            "key_players": [
                "Microsoft",
                "Google",
                "Amazon",
                "Salesforce",
                "ServiceNow",
            ],
        },
    },
    "healthcare": {
        "naics": "6211",
        "sub_sectors": {
            "biotech": {"naics": "3254", "multiples": (12, 25), "metric": "pipeline_value"},
            "medical_devices": {"naics": "3391", "multiples": (10, 18), "metric": "EBITDA"},
            "healthcare_services": {"naics": "6211", "multiples": (8, 14), "metric": "EBITDA"},
        },
        "market_data": {
            "us_market_size_usd": 4_300_000_000_000,
            "growth_rate": 0.07,
            "key_players": [
                "UnitedHealth Group",
                "CVS Health",
                "HCA Healthcare",
                "Pfizer",
                "Johnson & Johnson",
            ],
        },
    },
    "food_beverage": {
        "naics": "3121",
        "sub_sectors": {
            "manufacturing": {"naics": "3111", "multiples": (6, 10), "metric": "EBITDA"},
            "distribution": {"naics": "4244", "multiples": (4, 7), "metric": "EBITDA"},
            "restaurant_chain": {"naics": "7225", "multiples": (5, 8), "metric": "EBITDA"},
        },
        "market_data": {
            "us_market_size_usd": 1_100_000_000_000,
            "growth_rate": 0.035,
            "key_players": [
                "Nestle",
                "PepsiCo",
                "Tyson Foods",
                "Sysco",
                "US Foods",
            ],
        },
    },
    "real_estate": {
        "naics": "5311",
        "sub_sectors": {
            "industrial": {"naics": "5311", "multiples": (12, 18), "metric": "NOI"},
            "office": {"naics": "5311", "multiples": (8, 14), "metric": "NOI"},
            "retail": {"naics": "5311", "multiples": (8, 12), "metric": "NOI"},
            "hospitality": {"naics": "7211", "multiples": (8, 12), "metric": "EBITDA"},
        },
        "market_data": {
            "us_market_size_usd": 20_700_000_000_000,
            "growth_rate": 0.03,
            "key_players": [
                "Prologis",
                "Simon Property Group",
                "CBRE",
                "Vornado",
                "Boston Properties",
            ],
        },
    },
}

# ── Intent Keyword Maps ───────────────────────────────────────────

INTENT_KEYWORDS: dict[str, list[str]] = {
    "acquisition": [
        "acquire", "buy", "purchase", "acquisition", "roll-up", "rollup",
        "bolt-on", "tuck-in", "take over", "takeover", "consolidate",
        "merge", "merger", "m&a",
    ],
    "construction": [
        "build", "construct", "construction", "develop", "development",
        "ground-up", "new construction", "greenfield", "brownfield",
        "bridge financing", "construction project",
    ],
    "refinancing": [
        "refinance", "refi", "restructure", "lower rate", "reduce rate",
        "defease", "defeasance", "refunding",
    ],
    "equity_raise": [
        "raise capital", "raise money", "raise funds", "raise",
        "fundraise", "seed", "series a", "series b", "growth capital",
        "venture", "investors",
    ],
    "startup": [
        "start", "launch", "found", "create", "new company",
        "new business", "startup", "start-up",
    ],
    "expansion": [
        "expand", "grow", "scale", "add locations", "new markets",
        "geographic expansion",
    ],
}

SECTOR_KEYWORDS: dict[str, list[str]] = {
    "beauty_cosmetics": [
        "beauty", "cosmetics", "makeup", "hair", "wig", "weave",
        "extension", "hair extension", "personal care", "skincare",
        "skin care", "salon", "barber", "nail", "fragrance",
        "beauty supply",
    ],
    "senior_living": [
        "senior living", "senior housing", "ccrc", "assisted living",
        "memory care", "skilled nursing", "nursing home", "retirement",
        "elderly", "aging", "55+",
    ],
    "multifamily": [
        "multifamily", "apartment", "residential", "housing",
        "affordable housing", "student housing",
    ],
    "technology": [
        "tech", "technology", "software", "saas", "app", "platform",
        "ai", "artificial intelligence", "gaming", "cloud",
    ],
    "healthcare": [
        "healthcare", "health care", "biotech", "pharma",
        "pharmaceutical", "medical device", "hospital", "clinic",
        "dod", "defense", "fda",
    ],
    "food_beverage": [
        "food", "beverage", "restaurant", "catering", "grocery",
        "food service", "cpg", "consumer packaged",
    ],
    "real_estate": [
        "real estate", "commercial real estate", "cre", "industrial",
        "office", "retail", "hotel", "hospitality", "warehouse",
    ],
}

SUB_SECTOR_KEYWORDS: dict[str, dict[str, list[str]]] = {
    "beauty_cosmetics": {
        "manufacturing": ["manufacturer", "manufacturers", "manufacturing", "produce", "production", "factory"],
        "wholesale": ["wholesale", "wholesaler", "wholesalers", "distributor", "distributors", "distribution", "supply chain", "b2b"],
        "retail": ["retail", "retailer", "store", "shop", "brick and mortar"],
        "ecommerce": ["ecommerce", "e-commerce", "online", "dtc", "direct to consumer", "d2c"],
        "hair_extensions_wigs": ["wig", "wigs", "weave", "weaves", "extension", "extensions", "hair extension", "hair extensions", "closure", "lace front"],
    },
    "senior_living": {
        "ccrc": ["ccrc", "continuing care", "life plan", "entrance fee"],
        "assisted_living": ["assisted living", "assisted"],
        "memory_care": ["memory care", "alzheimer", "dementia"],
        "skilled_nursing": ["skilled nursing", "snf", "nursing home", "nursing facility"],
    },
    "multifamily": {
        "conventional": ["conventional", "market rate", "class a", "class b"],
        "affordable": ["affordable", "lihtc", "section 8", "hud", "workforce"],
        "student_housing": ["student", "university", "college"],
    },
    "technology": {
        "saas": ["saas", "software", "subscription", "cloud"],
        "gaming": ["gaming", "game", "esports", "interactive entertainment"],
        "ai_infrastructure": ["ai", "artificial intelligence", "machine learning", "gpu", "inference"],
    },
    "healthcare": {
        "biotech": ["biotech", "pharma", "pharmaceutical", "drug", "fda", "clinical trial", "dod"],
        "medical_devices": ["medical device", "medtech", "surgical", "diagnostic"],
        "healthcare_services": ["healthcare services", "clinic", "hospital", "physician"],
    },
    "food_beverage": {
        "manufacturing": ["food manufacturing", "food production", "cpg", "packaged"],
        "distribution": ["food distribution", "food service", "sysco", "wholesale food"],
        "restaurant_chain": ["restaurant", "fast casual", "qsr", "dining", "chain"],
    },
    "real_estate": {
        "industrial": ["industrial", "warehouse", "logistics", "distribution center"],
        "office": ["office", "co-working", "coworking"],
        "retail": ["retail", "shopping center", "mall", "strip center"],
        "hospitality": ["hotel", "hospitality", "resort", "lodging"],
    },
}

# ── Capital Solution Map ──────────────────────────────────────────

CAPITAL_SOLUTIONS: dict[str, dict[str, Any]] = {
    "acquisition": {
        "primary": "senior_secured_bond",
        "alternatives": ["private_placement", "bridge_to_bond", "mezzanine"],
        "typical_ltc": 0.70,
        "typical_equity": 0.30,
        "timeline_months": 3,
    },
    "construction": {
        "primary": "construction_bond",
        "alternatives": ["bridge_loan", "hud_fha"],
        "typical_ltc": 0.75,
        "typical_equity": 0.25,
        "timeline_months": 24,
    },
    "refinancing": {
        "primary": "refunding_bond",
        "alternatives": ["rate_and_term_refi", "cash_out_refi"],
        "typical_ltv": 0.70,
        "typical_equity": 0.30,
        "timeline_months": 2,
    },
    "equity_raise": {
        "primary": "private_placement_equity",
        "alternatives": ["convertible_note", "revenue_participation"],
        "typical_dilution": 0.25,
        "timeline_months": 4,
    },
    "startup": {
        "primary": "seed_convertible_note",
        "alternatives": ["safe", "pre_seed_equity"],
        "typical_raise": (500_000, 5_000_000),
        "timeline_months": 3,
    },
    "expansion": {
        "primary": "growth_equity",
        "alternatives": ["working_capital_bond", "line_of_credit"],
        "typical_ltc": 0.65,
        "typical_equity": 0.35,
        "timeline_months": 3,
    },
}

# ── Size Estimation Defaults ──────────────────────────────────────

SIZE_ESTIMATES: dict[str, dict[str, Any]] = {
    "acquisition": {
        "small": {"ebitda": 2_000_000, "label": "Small-cap ($10M-$25M EV)"},
        "mid": {"ebitda": 8_000_000, "label": "Mid-market ($50M-$120M EV)"},
        "large": {"ebitda": 25_000_000, "label": "Large ($150M-$400M EV)"},
    },
    "construction": {
        "small": {"tpc": 15_000_000, "label": "Small project ($15M TPC)"},
        "mid": {"tpc": 75_000_000, "label": "Mid project ($75M TPC)"},
        "large": {"tpc": 250_000_000, "label": "Large project ($250M TPC)"},
    },
    "refinancing": {
        "small": {"outstanding": 20_000_000, "label": "Small refi ($20M)"},
        "mid": {"outstanding": 100_000_000, "label": "Mid refi ($100M)"},
        "large": {"outstanding": 300_000_000, "label": "Large refi ($300M)"},
    },
}


class BernardFindMe:
    """Bernard's "Find Me" engine — converts natural language deal
    descriptions into structured deal profiles, capital solutions,
    EagleEye signals, and investor routing."""

    @staticmethod
    def _word_match(keyword: str, text: str) -> bool:
        """Match a keyword using word boundaries to avoid substring false positives.
        E.g., 'ai' should not match inside 'raise'."""
        return bool(re.search(r'\b' + re.escape(keyword) + r'\b', text))

    # ── 1. Main Entry Point ───────────────────────────────────────

    def find_me(self, query: str, context: dict | None = None) -> dict:
        """Take a natural language deal description and return a full
        structured deal analysis with capital solution, signals, and next steps.

        Args:
            query: Natural language description of what the user wants.
            context: Optional dict with relationship, stage, capital_available,
                     geography_preference, demographic_focus, etc.

        Returns:
            Complete deal analysis: intent, sector brief, capital structure,
            EagleEye signals, pitch deck outline, next steps.
        """
        context = context or {}

        # 1. Parse intent from natural language
        intent = self.parse_intent(query)

        # Merge context into intent
        if context.get("geography_preference"):
            intent["geography"] = context["geography_preference"]
        if context.get("demographic_focus"):
            intent["demographic_focus"] = context["demographic_focus"]
        if context.get("capital_available"):
            intent["capital_available"] = context["capital_available"]
        if context.get("stage"):
            intent["stage"] = context.get("stage", intent.get("stage", "exploration"))

        # 2. Sector brief with market intelligence
        sector_brief = self.generate_sector_brief(
            intent["sector"],
            intent.get("sub_sectors", []),
        )

        # 3. Structure the deal from intent
        deal_structure = self.structure_deal_from_intent(intent)

        # 4. Generate EagleEye watchlist
        watchlist = self.generate_eagleeye_watchlist(intent)

        # 5. Generate pitch deck outline
        pitch_outline = self.generate_pitch_deck_outline(intent, deal_structure)

        # 6. Next steps — concrete, actionable
        next_steps = self._generate_next_steps(intent, deal_structure)

        return {
            "bernard_action": "find_me",
            "query": query,
            "parsed_intent": intent,
            "sector_brief": sector_brief,
            "deal_structure": deal_structure,
            "eagleeye_watchlist": watchlist,
            "pitch_deck_outline": pitch_outline,
            "next_steps": next_steps,
            "bernard_summary": self._generate_summary(intent, deal_structure, sector_brief),
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ── 2. Intent Parsing ─────────────────────────────────────────

    def parse_intent(self, query: str) -> dict:
        """NLP-lite intent parsing from natural language query.

        Extracts: action, sector, sub-sectors, geography, size hints,
        special requirements. Maps to deal_type and identifies sub-sectors.

        Args:
            query: Natural language deal description.

        Returns:
            Structured intent dict with all extracted fields.
        """
        q = query.lower()

        # 1. Extract deal type from action keywords
        deal_type = "acquisition"  # default
        action_verb = "acquire"
        best_match_count = 0
        for dtype, keywords in INTENT_KEYWORDS.items():
            matches = sum(1 for kw in keywords if self._word_match(kw, q))
            if matches > best_match_count:
                best_match_count = matches
                deal_type = dtype
                # Pick the first matching keyword as the verb
                for kw in keywords:
                    if self._word_match(kw, q):
                        action_verb = kw
                        break

        # 2. Identify sector
        sector = "real_estate"  # default
        sector_score = 0
        for sec, keywords in SECTOR_KEYWORDS.items():
            score = sum(1 for kw in keywords if self._word_match(kw, q))
            if score > sector_score:
                sector_score = score
                sector = sec

        # 3. Identify sub-sectors
        sub_sectors: list[str] = []
        sub_sector_details: list[dict] = []
        sector_subs = SUB_SECTOR_KEYWORDS.get(sector, {})
        for sub, keywords in sector_subs.items():
            for kw in keywords:
                if self._word_match(kw, q):
                    if sub not in sub_sectors:
                        sub_sectors.append(sub)
                        sector_data = SECTOR_INTELLIGENCE.get(sector, {})
                        sub_data = sector_data.get("sub_sectors", {}).get(sub, {})
                        sub_sector_details.append({
                            "sub_sector": sub,
                            "naics": sub_data.get("naics", ""),
                            "description": sub_data.get("description", ""),
                            "multiples": sub_data.get("multiples", (0, 0)),
                            "metric": sub_data.get("metric", "EBITDA"),
                        })
                    break

        # 4. Extract geography hints
        geography = "national"
        geo_patterns = {
            "florida": "florida",
            "texas": "texas",
            "california": "california",
            "new york": "new_york",
            "southeast": "southeast",
            "northeast": "northeast",
            "midwest": "midwest",
            "southwest": "southwest",
            "pacific northwest": "pacific_northwest",
            "national": "national",
        }
        for pattern, geo in geo_patterns.items():
            if self._word_match(pattern, q):
                geography = geo
                break

        # 5. Extract size hints
        size_hint = "mid"  # default
        size_usd = 0
        # Look for dollar amounts
        dollar_match = re.search(r'\$(\d+(?:\.\d+)?)\s*(m|mm|million|b|billion|k|thousand)?', q, re.IGNORECASE)
        if dollar_match:
            amount = float(dollar_match.group(1))
            unit = (dollar_match.group(2) or "").lower()
            if unit in ("m", "mm", "million"):
                size_usd = int(amount * 1_000_000)
            elif unit in ("b", "billion"):
                size_usd = int(amount * 1_000_000_000)
            elif unit in ("k", "thousand"):
                size_usd = int(amount * 1_000)
            else:
                # Bare number — assume millions if > 1
                size_usd = int(amount * 1_000_000) if amount >= 1 else int(amount)

            if size_usd < 25_000_000:
                size_hint = "small"
            elif size_usd < 150_000_000:
                size_hint = "mid"
            else:
                size_hint = "large"

        # 6. Special requirements
        special: list[str] = []
        if "african american" in q or self._word_match("black", q):
            special.append("african_american_market_focus")
        if self._word_match("women", q) or self._word_match("female", q):
            special.append("female_demographic")
        if self._word_match("portfolio", q):
            special.append("portfolio_acquisition")
        if self._word_match("dod", q) or self._word_match("defense", q) or self._word_match("government", q):
            special.append("government_contracts")
        if self._word_match("bridge", q):
            special.append("bridge_financing_needed")
        if "lower rate" in q or "reduce rate" in q or self._word_match("savings", q):
            special.append("rate_reduction_target")

        return {
            "deal_type": deal_type,
            "action_verb": action_verb,
            "sector": sector,
            "sub_sectors": sub_sectors,
            "sub_sector_details": sub_sector_details,
            "geography": geography,
            "size_hint": size_hint,
            "size_usd": size_usd,
            "special_requirements": special,
            "stage": "exploration",
            "raw_query": query,
        }

    # ── 3. Sector Brief ──────────────────────────────────────────

    def generate_sector_brief(
        self, sector: str, sub_sectors: list[str] | None = None
    ) -> dict:
        """Market intelligence for a sector with multiples, players,
        and acquisition target profiles.

        Args:
            sector: Sector key from SECTOR_INTELLIGENCE.
            sub_sectors: Optional list of sub-sector keys.

        Returns:
            Sector brief with market size, multiples, key players,
            target profiles, and capital structures used.
        """
        sector_data = SECTOR_INTELLIGENCE.get(sector, {})
        if not sector_data:
            return {
                "sector": sector,
                "available": False,
                "note": f"Sector '{sector}' not in intelligence database — build custom brief",
            }

        market = sector_data.get("market_data", {})
        all_subs = sector_data.get("sub_sectors", {})

        # Filter to requested sub-sectors or show all
        target_subs = sub_sectors if sub_sectors else list(all_subs.keys())
        sub_sector_analysis: list[dict] = []
        for sub_key in target_subs:
            sub = all_subs.get(sub_key)
            if not sub:
                continue
            low, high = sub.get("multiples", (0, 0))
            metric = sub.get("metric", "EBITDA")

            # Compute illustrative EV ranges at different scales
            if metric == "EBITDA":
                illustrative = {
                    "small_target": {
                        "metric_value": 2_000_000,
                        "ev_low": 2_000_000 * low,
                        "ev_high": 2_000_000 * high,
                        "label": f"$2M {metric} target",
                    },
                    "mid_target": {
                        "metric_value": 8_000_000,
                        "ev_low": 8_000_000 * low,
                        "ev_high": 8_000_000 * high,
                        "label": f"$8M {metric} target",
                    },
                    "large_target": {
                        "metric_value": 25_000_000,
                        "ev_low": 25_000_000 * low,
                        "ev_high": 25_000_000 * high,
                        "label": f"$25M {metric} target",
                    },
                }
            elif metric == "NOI":
                illustrative = {
                    "small_target": {
                        "metric_value": 3_000_000,
                        "ev_low": 3_000_000 * low,
                        "ev_high": 3_000_000 * high,
                        "label": f"$3M {metric} target",
                    },
                    "mid_target": {
                        "metric_value": 10_000_000,
                        "ev_low": 10_000_000 * low,
                        "ev_high": 10_000_000 * high,
                        "label": f"$10M {metric} target",
                    },
                }
            elif metric == "revenue":
                illustrative = {
                    "small_target": {
                        "metric_value": 5_000_000,
                        "ev_low": 5_000_000 * low,
                        "ev_high": 5_000_000 * high,
                        "label": f"$5M {metric} target",
                    },
                    "mid_target": {
                        "metric_value": 20_000_000,
                        "ev_low": 20_000_000 * low,
                        "ev_high": 20_000_000 * high,
                        "label": f"$20M {metric} target",
                    },
                }
            elif metric == "ARR":
                illustrative = {
                    "small_target": {
                        "metric_value": 5_000_000,
                        "ev_low": 5_000_000 * low,
                        "ev_high": 5_000_000 * high,
                        "label": f"$5M {metric} target",
                    },
                    "mid_target": {
                        "metric_value": 15_000_000,
                        "ev_low": 15_000_000 * low,
                        "ev_high": 15_000_000 * high,
                        "label": f"$15M {metric} target",
                    },
                }
            else:
                illustrative = {}

            sub_sector_analysis.append({
                "sub_sector": sub_key,
                "naics": sub.get("naics", ""),
                "description": sub.get("description", ""),
                "valuation_multiples": {
                    "low": low,
                    "high": high,
                    "metric": metric,
                    "note": f"{low}x-{high}x {metric}",
                },
                "illustrative_valuations": illustrative,
            })

        # Acquisition target profiles
        target_profiles = market.get("acquisition_targets_profile", {})

        # Capital structures typically used in this sector
        capital_structures = self._sector_capital_structures(sector)

        return {
            "sector": sector,
            "naics": sector_data.get("naics", ""),
            "market_overview": {
                "us_market_size_usd": market.get("us_market_size_usd", 0),
                "growth_rate": market.get("growth_rate", 0),
                "growth_rate_pct": f"{market.get('growth_rate', 0) * 100:.1f}%",
            },
            "niche_markets": {
                k: v
                for k, v in market.items()
                if k.endswith("_usd") and k != "us_market_size_usd"
            },
            "key_players": market.get("key_players", []),
            "sub_sector_analysis": sub_sector_analysis,
            "acquisition_target_profiles": target_profiles,
            "typical_capital_structures": capital_structures,
        }

    # ── 4. Deal Structuring ───────────────────────────────────────

    def structure_deal_from_intent(self, intent: dict) -> dict:
        """Build a preliminary deal structure from parsed intent.

        Sizes the opportunity using sector multiples, determines capital
        solution, and produces a preliminary term sheet with all assumptions
        clearly marked.

        Args:
            intent: Output of parse_intent().

        Returns:
            Preliminary deal structure with term sheet, assumptions,
            sources and uses, and capital solution options.
        """
        deal_type = intent.get("deal_type", "acquisition")
        sector = intent.get("sector", "real_estate")
        sub_sectors = intent.get("sub_sectors", [])
        size_hint = intent.get("size_hint", "mid")
        explicit_size = intent.get("size_usd", 0)

        sector_data = SECTOR_INTELLIGENCE.get(sector, {})
        subs = sector_data.get("sub_sectors", {})

        # Get representative multiples from sub-sectors or sector default
        if sub_sectors:
            all_lows = []
            all_highs = []
            primary_metric = "EBITDA"
            for sub_key in sub_sectors:
                sub = subs.get(sub_key, {})
                mult = sub.get("multiples", (6, 10))
                all_lows.append(mult[0])
                all_highs.append(mult[1])
                primary_metric = sub.get("metric", "EBITDA")
            mult_low = min(all_lows) if all_lows else 6
            mult_high = max(all_highs) if all_highs else 10
        else:
            # Use first sub-sector as representative
            first_sub = next(iter(subs.values()), {})
            mult_range = first_sub.get("multiples", (6, 10))
            mult_low, mult_high = mult_range
            primary_metric = first_sub.get("metric", "EBITDA")

        mult_mid = (mult_low + mult_high) / 2

        if deal_type == "acquisition":
            return self._structure_acquisition(
                intent, mult_low, mult_high, mult_mid, primary_metric,
                size_hint, explicit_size, sector,
            )
        elif deal_type == "construction":
            return self._structure_construction(intent, size_hint, explicit_size, sector)
        elif deal_type == "refinancing":
            return self._structure_refinancing(intent, size_hint, explicit_size, sector)
        elif deal_type in ("equity_raise", "startup"):
            return self._structure_equity_raise(
                intent, mult_low, mult_high, primary_metric,
                size_hint, explicit_size, sector,
            )
        elif deal_type == "expansion":
            return self._structure_expansion(
                intent, mult_low, mult_high, mult_mid, primary_metric,
                size_hint, explicit_size, sector,
            )

        # Fallback — treat as acquisition
        return self._structure_acquisition(
            intent, mult_low, mult_high, mult_mid, primary_metric,
            size_hint, explicit_size, sector,
        )

    # ── 5. EagleEye Watchlist ─────────────────────────────────────

    def generate_eagleeye_watchlist(self, intent: dict) -> list[dict]:
        """Create EagleEye signals to monitor for deal opportunities.

        Produces scan parameters for EDGAR, permits, news, and proprietary
        databases based on the intent.

        Args:
            intent: Output of parse_intent().

        Returns:
            List of watchlist items with scan parameters, keywords, and triggers.
        """
        sector = intent.get("sector", "")
        sub_sectors = intent.get("sub_sectors", [])
        geography = intent.get("geography", "national")
        deal_type = intent.get("deal_type", "acquisition")
        special = intent.get("special_requirements", [])

        sector_data = SECTOR_INTELLIGENCE.get(sector, {})
        naics_codes = [sector_data.get("naics", "")]
        for sub_key in sub_sectors:
            sub = sector_data.get("sub_sectors", {}).get(sub_key, {})
            naics_code = sub.get("naics", "")
            if naics_code and naics_code not in naics_codes:
                naics_codes.append(naics_code)

        watchlist: list[dict] = []

        # 1. EDGAR / SEC filings signal
        watchlist.append({
            "signal_type": "edgar_filings",
            "priority": "high",
            "description": f"Monitor SEC EDGAR for {sector.replace('_', ' ')} company filings indicating M&A activity or distress",
            "scan_parameters": {
                "naics_codes": naics_codes,
                "filing_types": ["8-K", "SC 13D", "S-1", "10-K", "14A"],
                "keywords": self._edgar_keywords(deal_type, sector, sub_sectors),
                "geography": geography,
            },
            "trigger_conditions": [
                "Change in control filing (8-K Item 5.01)",
                "Going concern qualification in 10-K",
                "Proxy fight / activist filing (SC 13D)",
                "Material asset sale announcement",
            ],
        })

        # 2. Permit and licensing signals
        if deal_type in ("acquisition", "expansion"):
            watchlist.append({
                "signal_type": "permits_licenses",
                "priority": "medium",
                "description": f"Track new business permits and license applications in {sector.replace('_', ' ')}",
                "scan_parameters": {
                    "naics_codes": naics_codes,
                    "geography": geography,
                    "permit_types": self._permit_types(sector),
                },
                "trigger_conditions": [
                    "Business license non-renewal (potential closure/sale)",
                    "New competitor permits (market intelligence)",
                    "Zoning change applications (development signals)",
                ],
            })

        # 3. News and media signals
        news_keywords = self._news_keywords(sector, sub_sectors, deal_type)
        if "african_american_market_focus" in special:
            news_keywords.extend([
                "Black-owned beauty", "African American beauty",
                "Black beauty market", "multicultural beauty",
                "Black hair care", "natural hair",
            ])

        watchlist.append({
            "signal_type": "news_media",
            "priority": "high",
            "description": f"Monitor news for {sector.replace('_', ' ')} acquisition and distress signals",
            "scan_parameters": {
                "keywords": news_keywords,
                "sources": ["bloomberg", "reuters", "wsj", "trade_publications", "local_business_journals"],
                "geography": geography,
                "sentiment_filter": ["negative", "neutral"],
            },
            "trigger_conditions": [
                "CEO/founder retirement announcement",
                "Private equity exit / portfolio sale",
                "Revenue decline or restructuring",
                "Succession planning stories",
                "Competitor acquisition (market consolidation)",
            ],
        })

        # 4. Proprietary database signals
        watchlist.append({
            "signal_type": "proprietary_databases",
            "priority": "high",
            "description": "Scan business-for-sale databases and M&A platforms",
            "scan_parameters": {
                "platforms": ["BizBuySell", "DealStream", "Axial", "IBBA MarketPlace"],
                "naics_codes": naics_codes,
                "revenue_range": self._revenue_range(intent),
                "geography": geography,
            },
            "trigger_conditions": [
                "New listing matching sector and size",
                "Price reduction on existing listing",
                "Off-market deal from intermediary network",
            ],
        })

        # 5. EMMA / muni bond signals (for refinancing or bond-related)
        if deal_type in ("refinancing", "construction") or sector in ("senior_living", "multifamily", "real_estate"):
            watchlist.append({
                "signal_type": "emma_muni_bonds",
                "priority": "high" if deal_type == "refinancing" else "medium",
                "description": "Monitor EMMA for outstanding bonds approaching call dates or showing distress",
                "scan_parameters": {
                    "sector_keywords": self._emma_keywords(sector),
                    "geography": geography,
                    "bond_status": ["outstanding", "in_default", "approaching_call"],
                    "maturity_window_years": 5,
                },
                "trigger_conditions": [
                    "Bond approaching optional call date",
                    "DSCR covenant violation notice",
                    "Continuing disclosure delinquency",
                    "Material event notice (default, draw on reserves)",
                ],
            })

        # 6. LinkedIn / professional network signals
        watchlist.append({
            "signal_type": "professional_network",
            "priority": "low",
            "description": f"Monitor executive changes and company updates in {sector.replace('_', ' ')}",
            "scan_parameters": {
                "platforms": ["LinkedIn", "Crunchbase", "PitchBook"],
                "keywords": [
                    f"{sector.replace('_', ' ')} acquisition",
                    f"{sector.replace('_', ' ')} sale",
                    "retiring", "succession", "looking for partners",
                ],
                "title_filters": ["CEO", "Owner", "Founder", "President", "CFO"],
            },
            "trigger_conditions": [
                "C-suite departure at target company",
                "Company growth metrics slowing",
                "Founder posting about 'next chapter'",
            ],
        })

        # 7. Sector-specific signals
        sector_specific = self._sector_specific_signals(sector, sub_sectors, intent)
        watchlist.extend(sector_specific)

        return watchlist

    # ── 6. Pitch Deck Outline ─────────────────────────────────────

    def generate_pitch_deck_outline(
        self, intent: dict, structure: dict
    ) -> dict:
        """Outline for a pitch deck based on the deal intent and structure.

        Args:
            intent: Output of parse_intent().
            structure: Output of structure_deal_from_intent().

        Returns:
            Structured pitch deck outline with all key sections.
        """
        sector = intent.get("sector", "")
        deal_type = intent.get("deal_type", "acquisition")
        sector_data = SECTOR_INTELLIGENCE.get(sector, {})
        market = sector_data.get("market_data", {})
        sub_sectors = intent.get("sub_sectors", [])
        geography = intent.get("geography", "national")

        # Market opportunity numbers
        market_size = market.get("us_market_size_usd", 0)
        growth_rate = market.get("growth_rate", 0)
        niche_sizes = {
            k: v for k, v in market.items()
            if k.endswith("_usd") and k != "us_market_size_usd"
        }

        # Deal sizing from structure
        scenarios = structure.get("scenarios", {})
        mid_scenario = scenarios.get("mid", scenarios.get("base", {}))
        ev = mid_scenario.get("enterprise_value", mid_scenario.get("total_project_cost", 0))
        bond_amount = mid_scenario.get("bond_amount", mid_scenario.get("raise_amount", 0))

        return {
            "title": f"{sector.replace('_', ' ').title()} — {deal_type.replace('_', ' ').title()} Strategy",
            "slides": {
                "1_cover": {
                    "title": f"{sector.replace('_', ' ').title()} {deal_type.replace('_', ' ').title()} Opportunity",
                    "subtitle": "Confidential Investment Memorandum",
                    "prepared_by": "NEST Advisors — Arden Edge Capital",
                },
                "2_executive_summary": {
                    "title": "Executive Summary",
                    "content": [
                        f"Strategy: {deal_type.replace('_', ' ').title()} in {sector.replace('_', ' ').title()}",
                        f"Target sub-sectors: {', '.join(s.replace('_', ' ').title() for s in sub_sectors) if sub_sectors else 'Broad sector'}",
                        f"Geography: {geography.replace('_', ' ').title()}",
                        f"Estimated deal size: ${ev:,.0f}" if ev else "Deal size: To be determined based on target identification",
                        f"Capital structure: {structure.get('capital_solution', {}).get('primary', 'TBD')}",
                    ],
                },
                "3_market_opportunity": {
                    "title": "Market Opportunity",
                    "content": {
                        "total_addressable_market": f"${market_size:,.0f}" if market_size else "Research required",
                        "growth_rate": f"{growth_rate * 100:.1f}% annually" if growth_rate else "TBD",
                        "niche_market_sizes": {
                            k.replace("_usd", "").replace("_", " ").title(): f"${v:,.0f}"
                            for k, v in niche_sizes.items()
                        },
                        "key_trends": self._sector_trends(sector),
                    },
                },
                "4_acquisition_strategy": {
                    "title": f"{deal_type.replace('_', ' ').title()} Strategy",
                    "content": {
                        "target_criteria": self._target_criteria(intent),
                        "value_creation_thesis": self._value_creation_thesis(intent),
                        "competitive_advantage": self._competitive_advantages(intent),
                    },
                },
                "5_capital_structure": {
                    "title": "Capital Structure",
                    "content": {
                        "primary_instrument": structure.get("capital_solution", {}).get("primary", "TBD"),
                        "total_capital_required": f"${ev:,.0f}" if ev else "TBD",
                        "debt_component": f"${bond_amount:,.0f}" if bond_amount else "TBD",
                        "equity_component": structure.get("capital_solution", {}).get("equity_required_label", "TBD"),
                        "terms_summary": structure.get("preliminary_terms", {}),
                    },
                },
                "6_financial_projections": {
                    "title": "Financial Projections",
                    "content": self._projection_outline(intent, structure),
                },
                "7_team_execution": {
                    "title": "Team & Execution Plan",
                    "content": {
                        "nest_role": "Structuring, placement, and ongoing surveillance",
                        "execution_timeline": structure.get("capital_solution", {}).get("timeline_months", 3),
                        "key_milestones": [
                            "Target identification and LOI",
                            "Due diligence and valuation",
                            "Capital structure and placement",
                            "Closing and integration",
                        ],
                    },
                },
                "8_the_ask": {
                    "title": "The Ask",
                    "content": {
                        "capital_needed": f"${bond_amount:,.0f}" if bond_amount else "TBD",
                        "use_of_proceeds": self._use_of_proceeds(intent, structure),
                        "investor_returns": structure.get("investor_returns", {}),
                        "next_steps": [
                            "Execute NDA",
                            "Review detailed financial model",
                            "Management meeting",
                            "Submit IOI / term sheet",
                        ],
                    },
                },
            },
        }

    # ── Private: Acquisition Structuring ──────────────────────────

    def _structure_acquisition(
        self,
        intent: dict,
        mult_low: float,
        mult_high: float,
        mult_mid: float,
        primary_metric: str,
        size_hint: str,
        explicit_size: int,
        sector: str,
    ) -> dict:
        """Structure an acquisition deal with three scenarios."""
        # Determine base metric value
        size_defaults = SIZE_ESTIMATES.get("acquisition", {})
        defaults = size_defaults.get(size_hint, size_defaults.get("mid", {}))
        base_ebitda = defaults.get("ebitda", 8_000_000)

        # If explicit size was given, back into EBITDA from midpoint multiple
        if explicit_size > 0:
            base_ebitda = round(explicit_size / mult_mid)

        # Three scenarios: conservative, base, aggressive
        scenarios = {}
        for label, mult, ebitda_adj in [
            ("conservative", mult_low, 0.85),
            ("base", mult_mid, 1.0),
            ("aggressive", mult_high, 1.15),
        ]:
            ebitda = round(base_ebitda * ebitda_adj)
            ev = round(ebitda * mult)
            equity_pct = 0.30
            equity = round(ev * equity_pct)
            bond_amount = ev - equity
            # Reserves
            annual_ds = round(bond_amount * 0.075)  # ~7.5% indicative
            dsrf = annual_ds  # MADS
            cap_i = round(annual_ds * 1.5)  # 18 months IO
            coi = round(bond_amount * 0.025)
            total_sources = ev + dsrf + cap_i + coi
            dscr = ebitda / annual_ds if annual_ds > 0 else 0

            scenarios[label] = {
                "metric": primary_metric,
                "metric_value": ebitda,
                "multiple": mult,
                "enterprise_value": ev,
                "equity_required": equity,
                "equity_pct": equity_pct,
                "bond_amount": bond_amount,
                "annual_debt_service": annual_ds,
                "dscr": round(dscr, 2),
                "reserves": {"dsrf": dsrf, "capitalized_interest": cap_i, "coi": coi},
                "total_capital_required": total_sources,
            }

        # Capital solution
        solution = CAPITAL_SOLUTIONS.get("acquisition", {})

        # If it is a small deal, flag for private placement
        base_ev = scenarios["base"]["enterprise_value"]
        capital_market = "public_bond" if base_ev >= 25_000_000 else "private_placement"

        return {
            "deal_type": "acquisition",
            "sector": sector,
            "sub_sectors": intent.get("sub_sectors", []),
            "scenarios": scenarios,
            "capital_solution": {
                "primary": solution.get("primary", "senior_secured_bond"),
                "alternatives": solution.get("alternatives", []),
                "recommended_market": capital_market,
                "equity_required_label": f"${scenarios['base']['equity_required']:,.0f} ({scenarios['base']['equity_pct']:.0%} of EV)",
                "timeline_months": solution.get("timeline_months", 3),
            },
            "preliminary_terms": {
                "instrument": "Senior Secured Bond" if capital_market == "public_bond" else "Private Placement Note",
                "tenor_years": 7,
                "indicative_coupon": "6.50% - 8.50%" if capital_market == "public_bond" else "8.00% - 12.00%",
                "amortization": "18mo IO then 1% annual amortization with bullet at maturity",
                "call_protection": "NC-3, step-down premium thereafter",
                "security": "First lien on all acquired assets",
                "covenants": "DSCR 1.20x, additional bonds test, distribution restrictions",
            },
            "investor_returns": {
                "base_case_dscr": scenarios["base"]["dscr"],
                "equity_irr_target": "18% - 25%",
                "note": "Returns assume successful integration and sector-average growth",
            },
            "assumptions": [
                f"Valuation based on {primary_metric} multiples of {mult_low}x-{mult_high}x",
                f"Base {primary_metric} of ${base_ebitda:,.0f} — ILLUSTRATIVE, requires target financials",
                "30% equity contribution assumed (NEST minimum)",
                "7.5% indicative coupon for debt service calculations",
                "18-month capitalized interest reserve",
                "MADS-based debt service reserve fund",
            ],
        }

    def _structure_construction(
        self, intent: dict, size_hint: str, explicit_size: int, sector: str
    ) -> dict:
        """Structure a construction/development deal."""
        size_defaults = SIZE_ESTIMATES.get("construction", {})
        defaults = size_defaults.get(size_hint, size_defaults.get("mid", {}))
        base_tpc = explicit_size if explicit_size > 0 else defaults.get("tpc", 75_000_000)

        ltc = 0.75
        bond_amount = round(base_tpc * ltc)
        equity = base_tpc - bond_amount
        construction_interest = round(bond_amount * 0.075 * 2)  # 2yr construction at 7.5%
        soft_costs = round(base_tpc * 0.15)
        hard_costs = base_tpc - soft_costs

        # Stabilized NOI estimate (for takeout sizing)
        if sector == "multifamily":
            stabilized_noi = round(base_tpc * 0.07)  # 7% yield on cost
        elif sector == "senior_living":
            stabilized_noi = round(base_tpc * 0.08)
        else:
            stabilized_noi = round(base_tpc * 0.065)

        perm_ds = round(bond_amount * 0.06)  # 6% perm rate
        stabilized_dscr = stabilized_noi / perm_ds if perm_ds > 0 else 0

        scenarios = {
            "base": {
                "total_project_cost": base_tpc,
                "hard_costs": hard_costs,
                "soft_costs": soft_costs,
                "construction_interest": construction_interest,
                "bond_amount": bond_amount,
                "ltc_ratio": ltc,
                "equity_required": equity,
                "stabilized_noi": stabilized_noi,
                "perm_debt_service": perm_ds,
                "stabilized_dscr": round(stabilized_dscr, 2),
            },
        }

        solution = CAPITAL_SOLUTIONS.get("construction", {})

        return {
            "deal_type": "construction",
            "sector": sector,
            "sub_sectors": intent.get("sub_sectors", []),
            "scenarios": scenarios,
            "capital_solution": {
                "primary": solution.get("primary", "construction_bond"),
                "alternatives": solution.get("alternatives", []),
                "recommended_market": "bridge_financing",
                "equity_required_label": f"${equity:,.0f} (25% of TPC)",
                "timeline_months": solution.get("timeline_months", 24),
            },
            "preliminary_terms": {
                "instrument": "Construction-to-Perm Bond",
                "construction_period_months": 24,
                "indicative_rate": "SOFR + 350-500 bps (construction), 6.00%-7.50% (perm)",
                "ltc_ratio": f"{ltc:.0%}",
                "amortization": "Interest-only during construction, level debt service post-stabilization",
                "completion_guaranty": "Required",
                "cost_overrun_reserve": "5% of hard costs",
                "security": "First lien deed of trust, assignment of rents and leases",
            },
            "investor_returns": {
                "stabilized_dscr": scenarios["base"]["stabilized_dscr"],
                "yield_on_cost": f"{stabilized_noi / base_tpc * 100:.1f}%",
                "equity_irr_target": "15% - 22%",
            },
            "assumptions": [
                f"Total project cost of ${base_tpc:,.0f} — ILLUSTRATIVE",
                f"75% LTC financing",
                "24-month construction timeline",
                "7.5% construction period rate",
                "6.0% permanent rate assumption",
            ],
        }

    def _structure_refinancing(
        self, intent: dict, size_hint: str, explicit_size: int, sector: str
    ) -> dict:
        """Structure a refinancing deal."""
        size_defaults = SIZE_ESTIMATES.get("refinancing", {})
        defaults = size_defaults.get(size_hint, size_defaults.get("mid", {}))
        outstanding = explicit_size if explicit_size > 0 else defaults.get("outstanding", 100_000_000)

        # Assume current rate vs target rate
        current_rate = 0.075  # 7.5% existing
        target_rate = 0.060   # 6.0% target
        annual_savings = round(outstanding * (current_rate - target_rate))
        present_value_savings = round(annual_savings * 8)  # ~8yr PV factor

        current_ds = round(outstanding * current_rate)
        new_ds = round(outstanding * target_rate)

        scenarios = {
            "base": {
                "outstanding_principal": outstanding,
                "current_rate": current_rate,
                "target_rate": target_rate,
                "current_annual_ds": current_ds,
                "new_annual_ds": new_ds,
                "annual_savings": annual_savings,
                "present_value_savings": present_value_savings,
                "bond_amount": outstanding,
                "refunding_costs": round(outstanding * 0.02),
            },
        }

        solution = CAPITAL_SOLUTIONS.get("refinancing", {})

        return {
            "deal_type": "refinancing",
            "sector": sector,
            "sub_sectors": intent.get("sub_sectors", []),
            "scenarios": scenarios,
            "capital_solution": {
                "primary": solution.get("primary", "refunding_bond"),
                "alternatives": solution.get("alternatives", []),
                "recommended_market": "public_bond",
                "equity_required_label": "None — refinancing existing debt",
                "timeline_months": solution.get("timeline_months", 2),
            },
            "preliminary_terms": {
                "instrument": "Refunding Revenue Bond",
                "par_amount": f"${outstanding:,.0f}",
                "target_coupon": f"{target_rate * 100:.2f}%",
                "savings_target": f"${annual_savings:,.0f} annually (${present_value_savings:,.0f} PV)",
                "structure": "Current refunding (if within 90-day call window) or advance refunding",
                "security": "Same security as refunded bonds",
            },
            "investor_returns": {
                "annual_savings": annual_savings,
                "pv_savings": present_value_savings,
                "savings_pct": f"{(current_rate - target_rate) / current_rate * 100:.1f}%",
            },
            "assumptions": [
                f"Outstanding principal of ${outstanding:,.0f} — verify from EMMA",
                f"Current coupon of {current_rate * 100:.1f}% — verify from bond indenture",
                f"Target refunding rate of {target_rate * 100:.1f}% based on current market",
                "Refunding costs estimated at 2% of par",
                "Assumes bonds are currently callable or approaching call date",
            ],
        }

    def _structure_equity_raise(
        self,
        intent: dict,
        mult_low: float,
        mult_high: float,
        primary_metric: str,
        size_hint: str,
        explicit_size: int,
        sector: str,
    ) -> dict:
        """Structure an equity raise / startup deal."""
        if explicit_size > 0:
            raise_amount = explicit_size
        elif intent.get("deal_type") == "startup":
            raise_ranges = CAPITAL_SOLUTIONS.get("startup", {}).get("typical_raise", (500_000, 5_000_000))
            raise_amount = (raise_ranges[0] + raise_ranges[1]) // 2
        else:
            raise_lookup = {"small": 5_000_000, "mid": 25_000_000, "large": 75_000_000}
            raise_amount = raise_lookup.get(size_hint, 25_000_000)

        pre_money = round(raise_amount * 3)  # Implies ~25% dilution
        post_money = pre_money + raise_amount
        dilution = raise_amount / post_money

        # Exit projections
        if primary_metric in ("EBITDA", "ARR"):
            projected_metric_yr5 = round(raise_amount * 2.5)  # illustrative
            exit_ev_low = round(projected_metric_yr5 * mult_low)
            exit_ev_high = round(projected_metric_yr5 * mult_high)
            investor_value_low = round(exit_ev_low * dilution)
            investor_value_high = round(exit_ev_high * dilution)
            moic_low = investor_value_low / raise_amount if raise_amount else 0
            moic_high = investor_value_high / raise_amount if raise_amount else 0
        else:
            projected_metric_yr5 = 0
            exit_ev_low = round(post_money * 3)
            exit_ev_high = round(post_money * 8)
            investor_value_low = round(exit_ev_low * dilution)
            investor_value_high = round(exit_ev_high * dilution)
            moic_low = investor_value_low / raise_amount if raise_amount else 0
            moic_high = investor_value_high / raise_amount if raise_amount else 0

        scenarios = {
            "base": {
                "raise_amount": raise_amount,
                "pre_money_valuation": pre_money,
                "post_money_valuation": post_money,
                "dilution_pct": round(dilution * 100, 1),
                "projected_metric_yr5": projected_metric_yr5,
                "exit_ev_range": {"low": exit_ev_low, "high": exit_ev_high},
                "investor_value_range": {"low": investor_value_low, "high": investor_value_high},
                "moic_range": {"low": round(moic_low, 1), "high": round(moic_high, 1)},
            },
        }

        deal_subtype = intent.get("deal_type", "equity_raise")
        solution = CAPITAL_SOLUTIONS.get(deal_subtype, CAPITAL_SOLUTIONS.get("equity_raise", {}))

        return {
            "deal_type": deal_subtype,
            "sector": sector,
            "sub_sectors": intent.get("sub_sectors", []),
            "scenarios": scenarios,
            "capital_solution": {
                "primary": solution.get("primary", "private_placement_equity"),
                "alternatives": solution.get("alternatives", []),
                "recommended_market": "private_placement",
                "equity_required_label": f"${raise_amount:,.0f} equity raise",
                "timeline_months": solution.get("timeline_months", 4),
            },
            "preliminary_terms": {
                "instrument": "Series A Preferred Equity" if raise_amount >= 10_000_000 else "Convertible Note / SAFE",
                "raise_amount": f"${raise_amount:,.0f}",
                "pre_money": f"${pre_money:,.0f}",
                "dilution": f"{dilution * 100:.1f}%",
                "structure": "Preferred equity with 1x liquidation preference, anti-dilution, board seat",
                "investor_rights": "Pro-rata, information rights, drag-along, tag-along",
            },
            "investor_returns": {
                "moic_range": f"{moic_low:.1f}x - {moic_high:.1f}x",
                "hold_period": "5 years",
                "exit_paths": ["Strategic sale", "IPO", "Sponsor recapitalization", "Secondary sale"],
            },
            "assumptions": [
                f"Raise amount of ${raise_amount:,.0f} — ILLUSTRATIVE",
                f"Pre-money valuation of ${pre_money:,.0f} — requires market comp analysis",
                "25% dilution target — standard for growth equity",
                f"Exit multiples based on sector range: {mult_low}x-{mult_high}x {primary_metric}",
                "5-year hold period assumed",
            ],
        }

    def _structure_expansion(
        self,
        intent: dict,
        mult_low: float,
        mult_high: float,
        mult_mid: float,
        primary_metric: str,
        size_hint: str,
        explicit_size: int,
        sector: str,
    ) -> dict:
        """Structure an expansion deal — hybrid of acquisition and equity."""
        # Use acquisition logic but with growth capital framing
        result = self._structure_acquisition(
            intent, mult_low, mult_high, mult_mid, primary_metric,
            size_hint, explicit_size, sector,
        )
        result["deal_type"] = "expansion"
        solution = CAPITAL_SOLUTIONS.get("expansion", {})
        result["capital_solution"]["primary"] = solution.get("primary", "growth_equity")
        result["capital_solution"]["alternatives"] = solution.get("alternatives", [])
        result["capital_solution"]["timeline_months"] = solution.get("timeline_months", 3)
        return result

    # ── Private: EagleEye Helpers ─────────────────────────────────

    def _edgar_keywords(
        self, deal_type: str, sector: str, sub_sectors: list[str]
    ) -> list[str]:
        """Generate EDGAR search keywords."""
        base = [sector.replace("_", " ")]
        for sub in sub_sectors:
            base.append(sub.replace("_", " "))

        if deal_type == "acquisition":
            base.extend(["merger", "acquisition", "change of control", "sale of assets"])
        elif deal_type == "refinancing":
            base.extend(["refunding", "defeasance", "call", "redemption"])
        elif deal_type == "construction":
            base.extend(["development", "construction", "ground lease"])

        return base

    def _permit_types(self, sector: str) -> list[str]:
        """Permit types to monitor by sector."""
        permits: dict[str, list[str]] = {
            "beauty_cosmetics": ["business license", "manufacturing permit", "FDA registration", "cosmetology license"],
            "senior_living": ["certificate of need", "healthcare license", "assisted living license", "building permit"],
            "multifamily": ["building permit", "zoning variance", "environmental clearance"],
            "healthcare": ["certificate of need", "DEA registration", "state health license"],
            "food_beverage": ["health department permit", "FDA registration", "liquor license"],
            "real_estate": ["building permit", "zoning change", "environmental review"],
            "technology": ["business license", "data privacy registration"],
        }
        return permits.get(sector, ["business license", "building permit"])

    def _news_keywords(
        self, sector: str, sub_sectors: list[str], deal_type: str
    ) -> list[str]:
        """Generate news monitoring keywords."""
        keywords = [sector.replace("_", " ")]
        for sub in sub_sectors:
            keywords.append(sub.replace("_", " "))

        keywords.extend([
            f"{sector.replace('_', ' ')} acquisition",
            f"{sector.replace('_', ' ')} sale",
            f"{sector.replace('_', ' ')} bankruptcy",
            f"{sector.replace('_', ' ')} restructuring",
            f"{sector.replace('_', ' ')} CEO",
            f"{sector.replace('_', ' ')} growth",
        ])

        # Add key players as keywords
        sector_data = SECTOR_INTELLIGENCE.get(sector, {})
        players = sector_data.get("market_data", {}).get("key_players", [])
        keywords.extend(players[:5])

        return keywords

    def _emma_keywords(self, sector: str) -> list[str]:
        """EMMA search keywords by sector."""
        emma: dict[str, list[str]] = {
            "senior_living": ["CCRC", "continuing care", "senior living", "assisted living", "retirement"],
            "multifamily": ["multifamily", "housing", "apartment", "residential"],
            "healthcare": ["hospital", "healthcare", "medical", "health system"],
            "real_estate": ["real estate", "development", "commercial"],
        }
        return emma.get(sector, [sector.replace("_", " ")])

    def _revenue_range(self, intent: dict) -> dict:
        """Revenue range for database searches based on intent."""
        size_hint = intent.get("size_hint", "mid")
        ranges: dict[str, dict[str, int]] = {
            "small": {"min": 2_000_000, "max": 25_000_000},
            "mid": {"min": 10_000_000, "max": 100_000_000},
            "large": {"min": 50_000_000, "max": 500_000_000},
        }
        return ranges.get(size_hint, ranges["mid"])

    def _sector_specific_signals(
        self, sector: str, sub_sectors: list[str], intent: dict
    ) -> list[dict]:
        """Sector-specific EagleEye signals."""
        signals: list[dict] = []

        if sector == "beauty_cosmetics":
            signals.append({
                "signal_type": "trade_shows_events",
                "priority": "medium",
                "description": "Monitor beauty industry trade shows for acquisition targets and market intelligence",
                "scan_parameters": {
                    "events": [
                        "Cosmoprof North America",
                        "International Beauty Show (IBS)",
                        "Bronner Bros International Beauty Show",
                        "ISSE Long Beach",
                    ],
                    "keywords": ["exhibitor", "new brand", "distribution partnership"],
                },
                "trigger_conditions": [
                    "New exhibitor matching target profile",
                    "Brand seeking distribution partners (acquisition signal)",
                    "Company scaling beyond booth size (growth signal)",
                ],
            })
            if "african_american_market_focus" in intent.get("special_requirements", []):
                signals.append({
                    "signal_type": "demographic_market_intelligence",
                    "priority": "high",
                    "description": "Monitor African American beauty market trends and acquisition signals",
                    "scan_parameters": {
                        "data_sources": [
                            "Nielsen multicultural data",
                            "Mintel ethnic beauty reports",
                            "NaturallyCurly market data",
                        ],
                        "keywords": [
                            "Black beauty brands", "African American hair care",
                            "natural hair products", "textured hair",
                            "Black-owned beauty", "multicultural beauty",
                        ],
                    },
                    "trigger_conditions": [
                        "Brand acquisition by major conglomerate (consolidation signal)",
                        "Distribution deal announcement",
                        "Market share shift in Black beauty segment",
                    ],
                })

        elif sector == "senior_living":
            signals.append({
                "signal_type": "regulatory_filings",
                "priority": "high",
                "description": "Monitor state health department filings for senior living operators",
                "scan_parameters": {
                    "filing_types": ["license_renewal", "deficiency_report", "certificate_of_need"],
                    "geography": intent.get("geography", "national"),
                },
                "trigger_conditions": [
                    "License non-renewal (distressed operator)",
                    "Multiple deficiency citations (operational problems)",
                    "CON application withdrawn (stalled project — opportunity)",
                ],
            })

        elif sector == "healthcare" and "government_contracts" in intent.get("special_requirements", []):
            signals.append({
                "signal_type": "government_contracts",
                "priority": "high",
                "description": "Monitor DOD/federal contract awards and solicitations",
                "scan_parameters": {
                    "platforms": ["SAM.gov", "FPDS", "USASpending"],
                    "naics_codes": ["3254", "3391", "5417"],
                    "keywords": ["biodefense", "BARDA", "DOD medical", "CBRN"],
                },
                "trigger_conditions": [
                    "New BARDA/DOD contract award to target company",
                    "Contract recompete / incumbent vulnerable",
                    "New solicitation matching capabilities",
                ],
            })

        return signals

    # ── Private: Capital Structure Helpers ─────────────────────────

    def _sector_capital_structures(self, sector: str) -> list[dict]:
        """Typical capital structures used in a sector."""
        structures: dict[str, list[dict]] = {
            "beauty_cosmetics": [
                {"structure": "PE-backed LBO", "typical_leverage": "4x-5x EBITDA", "equity": "30-40%", "note": "Standard for $20M+ EBITDA targets"},
                {"structure": "SBA 7(a) Loan", "typical_leverage": "Up to $5M", "equity": "10-20%", "note": "For smaller acquisitions under $5M"},
                {"structure": "Seller Financing", "typical_leverage": "20-40% of purchase price", "equity": "20-30%", "note": "Common for family-owned distributors"},
                {"structure": "Private Placement", "typical_leverage": "3x-4x EBITDA", "equity": "35-50%", "note": "For smaller or pre-revenue brands"},
            ],
            "senior_living": [
                {"structure": "Tax-Exempt Revenue Bond", "typical_leverage": "70-80% LTV", "equity": "20-30%", "note": "Standard for 501(c)(3) CCRCs"},
                {"structure": "HUD/FHA 232", "typical_leverage": "Up to 85% LTV", "equity": "15%", "note": "For licensed skilled nursing/ALF"},
                {"structure": "Bridge-to-Perm", "typical_leverage": "75% LTC", "equity": "25%", "note": "For new construction or value-add"},
                {"structure": "REIT JV Equity", "typical_leverage": "90% of equity", "equity": "10% co-invest", "note": "Harrison Street, Welltower JV structures"},
            ],
            "multifamily": [
                {"structure": "Agency (Fannie/Freddie)", "typical_leverage": "75-80% LTV", "equity": "20-25%", "note": "Lowest cost of capital for stabilized"},
                {"structure": "Bridge Loan", "typical_leverage": "75-80% LTC", "equity": "20-25%", "note": "SOFR+300-500 for value-add"},
                {"structure": "Construction Loan", "typical_leverage": "65-75% LTC", "equity": "25-35%", "note": "For ground-up development"},
                {"structure": "LIHTC Equity", "typical_leverage": "Tax credit equity", "equity": "Developer fee + GP", "note": "For affordable housing"},
            ],
            "healthcare": [
                {"structure": "Growth Equity", "typical_leverage": "Minority or control", "equity": "PE sponsors", "note": "For biotech/medical devices"},
                {"structure": "Revenue Bond", "typical_leverage": "65-75% LTV", "equity": "25-35%", "note": "For hospital/health system"},
                {"structure": "Venture Debt", "typical_leverage": "25-50% of equity raised", "equity": "Existing investors", "note": "Bridge between equity rounds"},
            ],
        }
        return structures.get(sector, [
            {"structure": "Senior Secured Bond", "typical_leverage": "60-70% LTV", "equity": "30-40%", "note": "Standard NEST structure"},
            {"structure": "Private Placement", "typical_leverage": "Varies", "equity": "Varies", "note": "For sub-$10M or pre-revenue"},
        ])

    # ── Private: Pitch Deck Helpers ───────────────────────────────

    def _sector_trends(self, sector: str) -> list[str]:
        """Key trends for a sector."""
        trends: dict[str, list[str]] = {
            "beauty_cosmetics": [
                "Clean beauty and natural ingredients driving premium pricing",
                "DTC brands disrupting traditional wholesale/retail distribution",
                "Black beauty market growing 2x overall market rate",
                "Hair extensions/wigs market growing 8%+ annually",
                "Consolidation of family-owned distributors accelerating",
            ],
            "senior_living": [
                "Baby Boomer demographic wave (10,000/day turning 65)",
                "Post-COVID occupancy recovery to 85%+",
                "Memory care demand outpacing supply",
                "Labor costs stabilizing after COVID surge",
                "Middle-market affordable senior housing gap",
            ],
            "multifamily": [
                "Chronic housing undersupply in growth MSAs",
                "Insurance costs driving up operating expenses",
                "Build-to-rent emerging as sub-sector",
                "Remote work shifting demand to Sun Belt",
                "Affordable housing regulatory tailwinds",
            ],
            "technology": [
                "AI infrastructure driving massive capex cycle",
                "SaaS multiples compressing from 2021 peaks",
                "Cybersecurity spend growth accelerating",
                "Cloud migration still early innings",
                "Vertical SaaS commanding premium multiples",
            ],
            "healthcare": [
                "Biodefense spending increasing post-pandemic",
                "Medical device innovation in diagnostics",
                "Value-based care shifting revenue models",
                "Aging population driving demand",
                "GLP-1 and obesity treatment market explosion",
            ],
            "food_beverage": [
                "Health and wellness driving premium CPG",
                "Supply chain reshoring from Asia",
                "Ghost kitchens and delivery-first concepts",
                "Plant-based alternatives maturing",
                "Food tech and automation investment",
            ],
            "real_estate": [
                "Industrial/logistics demand from e-commerce",
                "Office sector repricing creates value-add opportunities",
                "Data center demand from AI infrastructure",
                "Retail bifurcation — experiential thriving, commodity declining",
                "Interest rate stabilization improving transaction volume",
            ],
        }
        return trends.get(sector, ["Sector research required — NEST EagleEye will provide current intelligence"])

    def _target_criteria(self, intent: dict) -> list[str]:
        """Target criteria for acquisition strategy."""
        sector = intent.get("sector", "")
        sub_sectors = intent.get("sub_sectors", [])
        geography = intent.get("geography", "national")

        criteria = [
            f"Sector: {sector.replace('_', ' ').title()}",
        ]
        if sub_sectors:
            criteria.append(f"Sub-sectors: {', '.join(s.replace('_', ' ').title() for s in sub_sectors)}")
        criteria.append(f"Geography: {geography.replace('_', ' ').title()}")

        # Add sector-specific criteria
        sector_data = SECTOR_INTELLIGENCE.get(sector, {})
        subs = sector_data.get("sub_sectors", {})
        if sub_sectors:
            for sub_key in sub_sectors:
                sub = subs.get(sub_key, {})
                mult = sub.get("multiples", (0, 0))
                metric = sub.get("metric", "EBITDA")
                criteria.append(f"{sub_key.replace('_', ' ').title()}: {mult[0]}x-{mult[1]}x {metric}")

        if "african_american_market_focus" in intent.get("special_requirements", []):
            criteria.append("Demographic focus: African American consumer base")
        if "portfolio_acquisition" in intent.get("special_requirements", []):
            criteria.append("Portfolio approach — multiple acquisitions for platform build")

        return criteria

    def _value_creation_thesis(self, intent: dict) -> list[str]:
        """Value creation thesis for the deal."""
        deal_type = intent.get("deal_type", "acquisition")
        sector = intent.get("sector", "")

        theses: dict[str, list[str]] = {
            "acquisition": [
                "Platform build-up: acquire initial platform and add bolt-on acquisitions",
                "Operational improvement: professionalize management, implement systems",
                "Revenue synergies: cross-sell across acquired customer bases",
                "Purchasing power: negotiate better supplier terms at scale",
                "Geographic expansion: fill white space in adjacent markets",
            ],
            "construction": [
                "Greenfield development at below-replacement cost",
                "First-mover advantage in underserved market",
                "Pre-leasing/pre-sales to de-risk construction period",
                "Tax incentive capture (LIHTC, Opportunity Zone, New Markets)",
            ],
            "refinancing": [
                "Lower cost of capital through rate reduction",
                "Extend maturity to reduce near-term refinancing risk",
                "Release reserves for capital improvements",
                "Improve debt service coverage through lower payments",
            ],
            "equity_raise": [
                "Growth capital for market expansion",
                "Fund R&D and product development",
                "Build team and operational infrastructure",
                "First-mover advantage in emerging segment",
            ],
        }
        return theses.get(deal_type, theses["acquisition"])

    def _competitive_advantages(self, intent: dict) -> list[str]:
        """Competitive advantages for the pitch."""
        sector = intent.get("sector", "")
        advantages = [
            "NEST Advisors provides end-to-end structuring, placement, and surveillance",
            "Proprietary deal flow from EagleEye signal intelligence",
            "Institutional-quality underwriting and credit analysis",
        ]

        if sector == "beauty_cosmetics":
            advantages.extend([
                "Deep understanding of multicultural beauty market dynamics",
                "Relationships with beauty industry intermediaries and operators",
            ])
        elif sector == "senior_living":
            advantages.extend([
                "Jacaranda Trace bond blueprint — proven structuring template",
                "Direct relationships with seniors housing investors (Harrison Street, Welltower, Kayne Anderson)",
            ])

        return advantages

    def _projection_outline(self, intent: dict, structure: dict) -> dict:
        """Financial projection outline for pitch deck."""
        deal_type = intent.get("deal_type", "acquisition")
        scenarios = structure.get("scenarios", {})
        base = scenarios.get("base", scenarios.get("mid", {}))

        if deal_type in ("acquisition", "expansion"):
            ev = base.get("enterprise_value", 0)
            ebitda = base.get("metric_value", 0)
            return {
                "year_1": {
                    "revenue": f"${round(ebitda * 5):,.0f}" if ebitda else "TBD",
                    "ebitda": f"${ebitda:,.0f}" if ebitda else "TBD",
                    "note": "Acquired run-rate — integration year",
                },
                "year_3": {
                    "revenue": f"${round(ebitda * 5 * 1.15 ** 2):,.0f}" if ebitda else "TBD",
                    "ebitda": f"${round(ebitda * 1.20 ** 2):,.0f}" if ebitda else "TBD",
                    "note": "Organic growth + operational improvements",
                },
                "year_5": {
                    "revenue": f"${round(ebitda * 5 * 1.15 ** 4):,.0f}" if ebitda else "TBD",
                    "ebitda": f"${round(ebitda * 1.20 ** 4):,.0f}" if ebitda else "TBD",
                    "note": "Mature platform — bolt-on acquisitions accelerate growth",
                },
                "assumptions": "15% revenue CAGR, 20% EBITDA CAGR through margin expansion and operating leverage",
            }
        elif deal_type == "construction":
            tpc = base.get("total_project_cost", 0)
            noi = base.get("stabilized_noi", 0)
            return {
                "construction_period": "24 months — interest-only, no revenue",
                "stabilization": f"12-18 months to reach ${noi:,.0f} NOI" if noi else "TBD",
                "stabilized_yield": f"{noi / tpc * 100:.1f}% yield on cost" if tpc else "TBD",
            }
        else:
            return {
                "note": "Detailed projections require target identification and financial analysis",
            }

    def _use_of_proceeds(self, intent: dict, structure: dict) -> list[str]:
        """Use of proceeds breakdown."""
        deal_type = intent.get("deal_type", "acquisition")
        if deal_type == "acquisition":
            return [
                "Acquisition purchase price",
                "Transaction expenses (legal, accounting, advisory)",
                "Closing reserves (DSRF, capitalized interest)",
                "Working capital cushion",
                "Cost of issuance",
            ]
        elif deal_type == "construction":
            return [
                "Hard construction costs",
                "Soft costs (A&E, permits, inspections)",
                "Capitalized interest during construction",
                "Development fee",
                "Reserves and contingency",
            ]
        elif deal_type == "refinancing":
            return [
                "Refund outstanding bonds at par + call premium",
                "Escrow deposit (if advance refunding)",
                "Cost of issuance",
                "New reserve deposits (if required)",
            ]
        else:
            return [
                "Growth capital / market expansion",
                "Team and operational build-out",
                "Working capital",
                "Reserves and contingency",
            ]

    # ── Private: Next Steps & Summary ─────────────────────────────

    def _generate_next_steps(self, intent: dict, structure: dict) -> list[dict]:
        """Generate concrete, actionable next steps."""
        deal_type = intent.get("deal_type", "acquisition")
        steps: list[dict] = []

        if deal_type in ("acquisition", "expansion"):
            steps = [
                {"step": 1, "action": "Identify target universe", "detail": "Use EagleEye signals to build a list of 10-20 potential acquisition targets matching criteria", "timeline": "2 weeks"},
                {"step": 2, "action": "Preliminary screening", "detail": "Size each target using sector multiples, filter to 3-5 actionable opportunities", "timeline": "1 week"},
                {"step": 3, "action": "Approach strategy", "detail": "Determine direct approach vs intermediary for each target. Draft teaser letter.", "timeline": "1 week"},
                {"step": 4, "action": "LOI and exclusivity", "detail": "Submit Letter of Intent with indicative valuation range and deal structure", "timeline": "2 weeks"},
                {"step": 5, "action": "Due diligence", "detail": "Financial, legal, operational DD. Roots document parser ingests all materials.", "timeline": "4-6 weeks"},
                {"step": 6, "action": "Capital structure", "detail": "Intelligence Engine sizes the bond, Hawkeye matches investors", "timeline": "2 weeks"},
                {"step": 7, "action": "Closing", "detail": "Final documents, funding, ownership transfer", "timeline": "2-4 weeks"},
            ]
        elif deal_type == "construction":
            steps = [
                {"step": 1, "action": "Site selection and entitlements", "detail": "Identify site, confirm zoning, begin environmental review", "timeline": "4-8 weeks"},
                {"step": 2, "action": "Design and cost estimation", "detail": "Engage architect, produce schematic design, GC cost estimate", "timeline": "6-8 weeks"},
                {"step": 3, "action": "Capital structure", "detail": "Intelligence Engine sizes construction bond, determine bridge vs perm", "timeline": "2 weeks"},
                {"step": 4, "action": "Investor placement", "detail": "Hawkeye matches investors, build order book", "timeline": "4-6 weeks"},
                {"step": 5, "action": "Construction closing", "detail": "Loan closing, construction commencement", "timeline": "2-4 weeks"},
            ]
        elif deal_type == "refinancing":
            steps = [
                {"step": 1, "action": "Pull existing bond documents", "detail": "Obtain indenture, OS, EMMA filings. Confirm call provisions.", "timeline": "1 week"},
                {"step": 2, "action": "Savings analysis", "detail": "Model current vs refunding rates, calculate PV savings", "timeline": "1 week"},
                {"step": 3, "action": "Rating strategy", "detail": "Engage rating agency (if rated), or structure for non-rated", "timeline": "2 weeks"},
                {"step": 4, "action": "Market and close", "detail": "Price refunding bonds, execute escrow, defease old bonds", "timeline": "4-6 weeks"},
            ]
        elif deal_type in ("equity_raise", "startup"):
            steps = [
                {"step": 1, "action": "Pitch materials", "detail": "Build pitch deck, financial model, and data room", "timeline": "2 weeks"},
                {"step": 2, "action": "Investor targeting", "detail": "Hawkeye identifies matching investors, builds outreach list", "timeline": "1 week"},
                {"step": 3, "action": "Roadshow", "detail": "Management presentations to 10-15 targeted investors", "timeline": "3-4 weeks"},
                {"step": 4, "action": "Term sheet negotiation", "detail": "Negotiate lead investor term sheet, close round", "timeline": "2-4 weeks"},
            ]

        return steps

    def _generate_summary(
        self, intent: dict, structure: dict, sector_brief: dict
    ) -> str:
        """Generate Bernard's executive summary of the analysis.

        Written in Jimmy Lee tone — direct, decisive, no hedging.
        """
        deal_type = intent.get("deal_type", "acquisition")
        sector = intent.get("sector", "").replace("_", " ").title()
        sub_sectors = intent.get("sub_sectors", [])
        geography = intent.get("geography", "national").replace("_", " ").title()
        special = intent.get("special_requirements", [])

        scenarios = structure.get("scenarios", {})
        base = scenarios.get("base", scenarios.get("mid", {}))

        market_size = sector_brief.get("market_overview", {}).get("us_market_size_usd", 0)
        growth_rate = sector_brief.get("market_overview", {}).get("growth_rate_pct", "")

        sub_text = ", ".join(s.replace("_", " ").title() for s in sub_sectors) if sub_sectors else "broad sector"

        # Build the summary
        parts: list[str] = []

        if deal_type == "acquisition":
            ev = base.get("enterprise_value", 0)
            bond = base.get("bond_amount", 0)
            dscr = base.get("dscr", 0)
            parts.append(f"{sector} {deal_type} targeting {sub_text}.")
            if market_size:
                parts.append(f"${market_size / 1_000_000_000:.0f}B addressable market growing {growth_rate}.")
            if ev:
                parts.append(f"Illustrative EV: ${ev:,.0f}. Bond sizing: ${bond:,.0f}. DSCR: {dscr:.2f}x.")
            if "african_american_market_focus" in special:
                niche = sector_brief.get("niche_markets", {})
                black_beauty = niche.get("black_beauty_market", 0)
                if black_beauty:
                    parts.append(f"African American segment: ${black_beauty / 1_000_000_000:.0f}B — underserved by institutional capital.")
            parts.append(f"Geography: {geography}. Capital market: {structure.get('capital_solution', {}).get('recommended_market', 'TBD').replace('_', ' ')}.")
            parts.append("EagleEye signals activated. Hawkeye investor matching ready on target identification.")

        elif deal_type == "construction":
            tpc = base.get("total_project_cost", 0)
            bond = base.get("bond_amount", 0)
            parts.append(f"{sector} construction project in {geography}.")
            if tpc:
                parts.append(f"Total project cost: ${tpc:,.0f}. Bond: ${bond:,.0f} at {base.get('ltc_ratio', 0.75):.0%} LTC.")
            parts.append(f"Stabilized DSCR: {base.get('stabilized_dscr', 0):.2f}x.")
            parts.append("Bridge-to-perm structure recommended. Hawkeye has matched bridge lenders.")

        elif deal_type == "refinancing":
            outstanding = base.get("outstanding_principal", 0)
            savings = base.get("annual_savings", 0)
            pv = base.get("present_value_savings", 0)
            parts.append(f"{sector} refinancing — ${outstanding:,.0f} outstanding.")
            parts.append(f"Annual savings: ${savings:,.0f}. PV savings: ${pv:,.0f}.")
            parts.append("Pull EMMA filings to confirm call provisions and timing.")

        elif deal_type in ("equity_raise", "startup"):
            raise_amt = base.get("raise_amount", 0)
            moic = base.get("moic_range", {})
            parts.append(f"{sector} equity raise — ${raise_amt:,.0f}.")
            if moic:
                parts.append(f"Projected MOIC: {moic.get('low', 0):.1f}x-{moic.get('high', 0):.1f}x over 5 years.")
            parts.append("Private placement channel. Hawkeye targeting growth equity and family offices.")

        else:
            parts.append(f"{sector} {deal_type} opportunity identified.")
            parts.append("Analysis complete. Awaiting further direction.")

        return " ".join(parts)


# ── Test Harness ──────────────────────────────────────────────────

def _run_tests() -> None:
    """Run the beauty industry test case and cross-sector queries."""
    import json

    engine = BernardFindMe()

    print("=" * 80)
    print("BERNARD FIND ME ENGINE — TEST HARNESS")
    print("=" * 80)

    # ── Beauty Industry Test Case ─────────────────────────────────

    BEAUTY_QUERY = (
        "My girlfriend is in the beauty space — specifically makeup lines "
        "and hair extensions, wigs, weaves targeted to African American women. "
        "We want to identify wholesale distributors and manufacturers to acquire."
    )

    BEAUTY_CONTEXT = {
        "relationship": "personal",
        "stage": "exploration",
        "capital_available": "to_be_determined",
        "geography_preference": "national",
        "demographic_focus": "african_american_female",
    }

    print("\n" + "=" * 80)
    print("TEST 1: BEAUTY INDUSTRY ACQUISITION")
    print("=" * 80)
    print(f"Query: {BEAUTY_QUERY}")
    print(f"Context: {json.dumps(BEAUTY_CONTEXT, indent=2)}")

    result = engine.find_me(BEAUTY_QUERY, BEAUTY_CONTEXT)

    print(f"\n--- PARSED INTENT ---")
    intent = result["parsed_intent"]
    print(f"  Deal Type: {intent['deal_type']}")
    print(f"  Sector: {intent['sector']}")
    print(f"  Sub-sectors: {intent['sub_sectors']}")
    print(f"  Geography: {intent['geography']}")
    print(f"  Special: {intent['special_requirements']}")

    print(f"\n--- SECTOR BRIEF ---")
    brief = result["sector_brief"]
    print(f"  Market Size: ${brief['market_overview']['us_market_size_usd']:,.0f}")
    print(f"  Growth Rate: {brief['market_overview']['growth_rate_pct']}")
    print(f"  Niche Markets: {json.dumps(brief.get('niche_markets', {}), indent=4)}")
    print(f"  Sub-sector Analysis ({len(brief['sub_sector_analysis'])} sub-sectors):")
    for sub in brief["sub_sector_analysis"]:
        mult = sub["valuation_multiples"]
        print(f"    {sub['sub_sector']}: {mult['note']}")
        for k, v in sub.get("illustrative_valuations", {}).items():
            print(f"      {v['label']}: ${v['ev_low']:,.0f} - ${v['ev_high']:,.0f}")

    print(f"\n--- DEAL STRUCTURE ---")
    ds = result["deal_structure"]
    for scenario_name, scenario in ds.get("scenarios", {}).items():
        print(f"  {scenario_name.upper()} scenario:")
        for k, v in scenario.items():
            if isinstance(v, dict):
                print(f"    {k}: {json.dumps(v)}")
            elif isinstance(v, (int, float)) and v > 1000:
                print(f"    {k}: ${v:,.0f}" if isinstance(v, int) else f"    {k}: {v}")
            else:
                print(f"    {k}: {v}")
    print(f"  Capital Solution: {ds.get('capital_solution', {}).get('primary', 'N/A')}")
    print(f"  Recommended Market: {ds.get('capital_solution', {}).get('recommended_market', 'N/A')}")

    print(f"\n--- EAGLEEYE WATCHLIST ({len(result['eagleeye_watchlist'])} signals) ---")
    for signal in result["eagleeye_watchlist"]:
        print(f"  [{signal['priority'].upper()}] {signal['signal_type']}: {signal['description'][:80]}...")

    print(f"\n--- BERNARD SUMMARY ---")
    print(f"  {result['bernard_summary']}")

    print(f"\n--- NEXT STEPS ---")
    for step in result["next_steps"]:
        print(f"  Step {step['step']}: {step['action']} ({step['timeline']})")

    # ── Cross-Sector Tests ────────────────────────────────────────

    TEST_QUERIES = [
        "I want to acquire a portfolio of senior living communities in Florida",
        "We need bridge financing for a multifamily construction project in Texas",
        "Looking to raise $50M for a biotech company with DOD contracts",
        "Want to refinance a $200M CCRC bond at a lower rate",
    ]

    for i, query in enumerate(TEST_QUERIES, start=2):
        print(f"\n{'=' * 80}")
        print(f"TEST {i}: {query[:60]}...")
        print("=" * 80)

        result = engine.find_me(query)
        intent = result["parsed_intent"]
        ds = result["deal_structure"]
        scenarios = ds.get("scenarios", {})
        base = scenarios.get("base", scenarios.get("mid", {}))

        print(f"  Deal Type: {intent['deal_type']}")
        print(f"  Sector: {intent['sector']}")
        print(f"  Sub-sectors: {intent['sub_sectors']}")
        print(f"  Geography: {intent['geography']}")
        if intent.get("size_usd"):
            print(f"  Extracted Size: ${intent['size_usd']:,.0f}")
        print(f"  Capital Solution: {ds.get('capital_solution', {}).get('primary', 'N/A')}")
        print(f"  Recommended Market: {ds.get('capital_solution', {}).get('recommended_market', 'N/A')}")

        # Print key financials from base scenario
        for key in ("enterprise_value", "bond_amount", "raise_amount",
                     "outstanding_principal", "total_project_cost",
                     "dscr", "stabilized_dscr", "annual_savings"):
            val = base.get(key)
            if val is not None:
                if isinstance(val, float) and val < 100:
                    print(f"  {key}: {val}")
                elif isinstance(val, (int, float)):
                    print(f"  {key}: ${val:,.0f}")

        print(f"  EagleEye Signals: {len(result['eagleeye_watchlist'])}")
        print(f"  Summary: {result['bernard_summary'][:120]}...")

    print(f"\n{'=' * 80}")
    print("ALL TESTS COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    _run_tests()
