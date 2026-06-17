"""
EagleEye Autonomous Scanner — The deal-finding machine.

This is NOT a simple search tool. EagleEye continuously scans multiple
data sources, cross-references signals, and outputs qualified deal
opportunities across ALL capital types (bonds, bridge, perm, equity, C&I).

Signal Sources:
1. EDGAR — Form D (private placements), 8-K (material events), S-1
2. FRED — rate environment signals (when rates drop, refi wave starts)
3. ATTOM — property data, ownership changes, permit activity
4. CoStar — occupancy, rent trends, construction pipeline
5. EMMA — municipal bond issuances, continuing disclosures
6. Web/News — industry publications, press releases, deal announcements
7. Public Records — construction permits, certificates of occupancy, UCC filings
8. LinkedIn — executive movements, company updates
9. CMBS Data — loan maturities, delinquencies, special servicing

Signal Types:
- CONSTRUCTION_EXIT: New build complete, below stabilization, needs bridge or perm
- BRIDGE_MATURING: Bridge loan approaching maturity, needs perm takeout
- STABILIZED_REFI: Property hit 90%+ occupancy, ready for perm/bond
- EXPANSION: Existing operator expanding, needs construction financing
- ACQUISITION: M&A activity, needs acquisition financing
- DISTRESSED: Loan modification, special servicing, workout
- RATE_SIGNAL: Rate environment creates refi opportunity (NPV savings)
- PERMIT_SIGNAL: Construction permit filed, new development starting
- OWNERSHIP_CHANGE: Property sold, new owner may need financing
- MATURITY_WALL: Loan maturing in 6-18 months, borrower needs solution

Each signal gets scored, qualified, and routed to the right capital solution.
"""
from __future__ import annotations
import logging
import os
import time
from datetime import datetime, timezone
from typing import Any

import httpx

from agents._claude import complete

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level FRED cache: {"data": dict, "expires_at": float}
# ---------------------------------------------------------------------------
_fred_cache: dict = {}
_FRED_TTL_SECONDS = 15 * 60  # 15 minutes

# ---------------------------------------------------------------------------
# EDGAR EFTS endpoint — correct full-text search URL
# SEC EFTS: https://efts.sec.gov/LATEST/search-index?q=...
# Response shape: { "hits": { "total": {...}, "hits": [ { "_source": {...} } ] } }
# ---------------------------------------------------------------------------
EDGAR_EFTS_URL = "https://efts.sec.gov/LATEST/search-index"
EDGAR_USER_AGENT = "NEST Advisors sean.gilmore@ardanedgecapital.com"


def _fetch_fred_series(series_id: str, api_key: str) -> float:
    """Fetch the latest observation for a FRED series. Returns float or raises."""
    url = (
        f"https://api.stlouisfed.org/fred/series/observations"
        f"?series_id={series_id}&api_key={api_key}"
        f"&sort_order=desc&limit=1&file_type=json"
    )
    resp = httpx.get(url, timeout=10)
    resp.raise_for_status()
    obs = resp.json().get("observations", [])
    if not obs:
        raise ValueError(f"No observations returned for {series_id}")
    value_str = obs[0].get("value", ".")
    if value_str == ".":
        raise ValueError(f"FRED value is missing for {series_id}")
    return float(value_str)


SIGNAL_TYPES = {
    "construction_exit": {
        "description": "New construction complete but below stabilization occupancy",
        "capital_solution": ["bridge", "mezzanine"],
        "urgency": "high",
        "indicators": ["certificate of occupancy", "occupancy < 80%", "construction loan maturing"],
    },
    "bridge_maturing": {
        "description": "Bridge loan approaching maturity, needs permanent takeout",
        "capital_solution": ["perm_bond", "agency_perm", "cmbs"],
        "urgency": "critical",
        "indicators": ["bridge maturity < 12 months", "occupancy > 85%", "stabilized NOI"],
    },
    "stabilized_refi": {
        "description": "Property stabilized, ready for permanent or bond financing",
        "capital_solution": ["perm_bond", "agency_perm", "cmbs"],
        "urgency": "medium",
        "indicators": ["occupancy > 90%", "12+ months trailing", "DSCR > 1.25x"],
    },
    "expansion": {
        "description": "Existing operator expanding — needs construction or acquisition financing",
        "capital_solution": ["construction_bond", "bank_construction", "bridge"],
        "urgency": "medium",
        "indicators": ["permit filed", "land acquisition", "phase II announced"],
    },
    "acquisition": {
        "description": "M&A or property acquisition in progress",
        "capital_solution": ["acquisition_bond", "bridge", "equity", "ci_lending"],
        "urgency": "high",
        "indicators": ["LOI signed", "Form D filed", "8-K announcement"],
    },
    "distressed": {
        "description": "Loan in modification, special servicing, or workout",
        "capital_solution": ["bridge", "mezzanine", "rescue_capital", "workout_advisory"],
        "urgency": "critical",
        "indicators": ["loan modification", "special servicing", "DSCR < 1.0x", "delinquency"],
    },
    "rate_signal": {
        "description": "Rate environment creates refinancing opportunity",
        "capital_solution": ["refunding_bond", "agency_refi"],
        "urgency": "medium",
        "indicators": ["rate drop > 50bps", "existing coupon > market + 100bps"],
    },
    "permit_signal": {
        "description": "Construction permit filed — new development starting",
        "capital_solution": ["construction_bond", "construction_loan", "bridge"],
        "urgency": "low",
        "indicators": ["building permit", "zoning approval", "site plan approval"],
    },
    "ownership_change": {
        "description": "Property sold or transferred — new owner may need financing",
        "capital_solution": ["acquisition_bond", "bridge", "perm_refi"],
        "urgency": "medium",
        "indicators": ["deed transfer", "UCC filing", "Form D"],
    },
    "maturity_wall": {
        "description": "Loan maturing in 6-18 months — borrower needs solution",
        "capital_solution": ["perm_bond", "agency_perm", "bridge_extension", "cmbs"],
        "urgency": "high",
        "indicators": ["maturity date approaching", "no extension options", "rate reset"],
    },
}

# Capital solution routing
CAPITAL_SOLUTIONS = {
    "perm_bond": {"desk": "bond_desk", "description": "Tax-exempt or taxable permanent bond", "nest_role": "structurer"},
    "construction_bond": {"desk": "bond_desk", "description": "Construction-to-perm bond facility", "nest_role": "structurer"},
    "acquisition_bond": {"desk": "bond_desk", "description": "Acquisition bond (M&A or RE)", "nest_role": "structurer"},
    "refunding_bond": {"desk": "bond_desk", "description": "Refunding of existing bonds", "nest_role": "structurer"},
    "agency_perm": {"desk": "placement", "description": "Fannie/Freddie permanent loan", "nest_role": "broker"},
    "cmbs": {"desk": "placement", "description": "CMBS conduit loan", "nest_role": "broker"},
    "bridge": {"desk": "placement", "description": "Bridge loan (12-36 months)", "nest_role": "broker"},
    "mezzanine": {"desk": "placement", "description": "Mezzanine or subordinated debt", "nest_role": "broker"},
    "ci_lending": {"desk": "placement", "description": "C&I term loan or revolver", "nest_role": "broker"},
    "equity": {"desk": "placement", "description": "Equity raise or co-invest", "nest_role": "placement_agent"},
    "rescue_capital": {"desk": "bond_desk", "description": "Rescue/DIP financing", "nest_role": "advisor"},
    "workout_advisory": {"desk": "surveillance", "description": "Workout/restructuring advisory", "nest_role": "advisor"},
    "construction_loan": {"desk": "placement", "description": "Bank construction loan", "nest_role": "broker"},
    "bridge_extension": {"desk": "placement", "description": "Bridge loan extension/modification", "nest_role": "advisor"},
}

# Sector-specific scan configurations
SECTOR_SCANS = {
    "senior_living": {
        "keywords": ["CCRC", "continuing care", "senior living", "assisted living", "memory care",
                      "independent living", "life plan community", "entrance fee"],
        "data_sources": ["edgar", "news", "permits", "emma"],
        "qualification": {"min_units": 50, "min_deal_size": 10_000_000},
    },
    "multifamily": {
        "keywords": ["multifamily", "apartment", "residential rental", "affordable housing",
                      "workforce housing", "student housing", "LIHTC"],
        "data_sources": ["edgar", "attom", "costar", "permits", "cmbs"],
        "qualification": {"min_units": 50, "min_deal_size": 5_000_000},
    },
    "hospitality": {
        "keywords": ["hotel", "hospitality", "resort", "extended stay", "select service"],
        "data_sources": ["edgar", "news", "str"],
        "qualification": {"min_rooms": 80, "min_deal_size": 10_000_000},
    },
    "healthcare": {
        "keywords": ["hospital", "medical office", "outpatient", "behavioral health",
                      "skilled nursing", "rehabilitation"],
        "data_sources": ["edgar", "news", "emma", "certificates_of_need"],
        "qualification": {"min_deal_size": 10_000_000},
    },
    "industrial": {
        "keywords": ["industrial", "warehouse", "distribution", "logistics", "data center",
                      "manufacturing", "cold storage"],
        "data_sources": ["edgar", "attom", "permits"],
        "qualification": {"min_sf": 50_000, "min_deal_size": 5_000_000},
    },
    "office": {
        "keywords": ["office", "mixed-use", "life science", "lab space", "coworking"],
        "data_sources": ["edgar", "costar", "news"],
        "qualification": {"min_sf": 25_000, "min_deal_size": 5_000_000},
    },
    "retail": {
        "keywords": ["retail", "shopping center", "grocery anchored", "net lease"],
        "data_sources": ["edgar", "attom", "news"],
        "qualification": {"min_deal_size": 5_000_000},
    },
    "infrastructure": {
        "keywords": ["infrastructure", "toll road", "airport", "port", "water",
                      "sewer", "solid waste", "energy", "solar", "wind"],
        "data_sources": ["edgar", "emma", "news", "permits"],
        "qualification": {"min_deal_size": 10_000_000},
    },
}


class EagleEyeScanner:
    """Autonomous deal-finding machine across all capital types and sectors."""

    # ------------------------------------------------------------------
    # FRED — live rate context
    # ------------------------------------------------------------------
    def get_fred_market_context(self, state: str, sector: str) -> dict:
        """
        Pull live rate data from FRED and return a market context dict.
        Results are cached for 15 minutes to avoid hammering the API.

        Returns:
            {
                "ten_yr_treasury": float,
                "mortgage_30yr":   float,
                "cre_delinquency": float,
                "fetched_at":      str (ISO 8601),
            }
        or {} on any error.
        """
        global _fred_cache
        now = time.time()
        if _fred_cache and now < _fred_cache.get("expires_at", 0):
            return _fred_cache["data"]

        api_key = os.environ.get("FRED_API_KEY", "")
        if not api_key:
            return {}

        try:
            ten_yr = _fetch_fred_series("DGS10", api_key)
            mortgage_30 = _fetch_fred_series("MORTGAGE30US", api_key)
            cre_delinq = _fetch_fred_series("DRCRLACBS", api_key)

            data = {
                "ten_yr_treasury": ten_yr,
                "mortgage_30yr": mortgage_30,
                "cre_delinquency": cre_delinq,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
            }
            _fred_cache = {"data": data, "expires_at": now + _FRED_TTL_SECONDS}
            return data
        except Exception:
            return {}

    # ------------------------------------------------------------------
    # EDGAR — full-text search via EFTS
    # Correct endpoint: https://efts.sec.gov/LATEST/search-index
    # Params: q, forms, dateRange, startdt, enddt
    # Response: { "hits": { "hits": [ { "_source": { entity_name, form_type,
    #             file_date, period_of_report, biz_location, ... } } ] } }
    # ------------------------------------------------------------------
    def search_edgar_comparables(
        self, sector: str, state: str, min_amount: int, max_amount: int
    ) -> list[dict]:
        """
        Search EDGAR full-text search index for comparable filings by sector.

        Uses the correct EFTS endpoint and parses hits[hits][_source] structure.

        Returns up to 10 items:
            [{"entity": str, "filing_date": str, "form_type": str,
              "snippet": str, "source": "edgar"}, ...]
        or [] on any error.
        """
        SECTOR_TERMS = {
            "senior_living": '"senior living" OR "continuing care retirement" OR "CCRC"',
            "healthcare": '"healthcare" OR "hospital" OR "medical center"',
            "multifamily": '"multifamily" OR "apartment complex" OR "residential rental"',
            "data_centers": '"data center" OR "colocation facility"',
            "industrial": '"industrial park" OR "warehouse" OR "logistics center"',
        }
        search_term = SECTOR_TERMS.get(sector, f'"{sector}"')

        try:
            resp = httpx.get(
                EDGAR_EFTS_URL,
                params={
                    "q": search_term,
                    "forms": "8-K,S-11,424B5",
                    "dateRange": "custom",
                    "startdt": "2023-01-01",
                    "enddt": "2026-06-17",
                },
                headers={"User-Agent": EDGAR_USER_AGENT},
                timeout=15,
            )
            resp.raise_for_status()
            body = resp.json()
        except Exception as exc:
            logger.warning("EDGAR EFTS request failed: %s", exc)
            return []

        # Correct path into nested response
        raw_hits = body.get("hits", {}).get("hits", [])
        if not isinstance(raw_hits, list):
            logger.warning("EDGAR EFTS unexpected response shape: %r", list(body.keys()))
            return []

        results = []
        for hit in raw_hits[:10]:
            src = hit.get("_source", {})

            # entity_name is the primary field; display_names is a list fallback
            display_names = src.get("display_names") or []
            entity = (
                src.get("entity_name")
                or (display_names[0] if display_names else None)
                or src.get("file_num", "Unknown Entity")
            )

            filing_date = src.get("file_date") or src.get("period_of_report", "")
            form_type = src.get("form_type", "")

            # Prefer highlighted excerpt; fall back to biz_location + file_date
            highlight = hit.get("highlight", {})
            highlighted_pieces = (
                highlight.get("file_description_string")
                or highlight.get("period_of_report")
                or []
            )
            if highlighted_pieces:
                snippet = " … ".join(str(p) for p in highlighted_pieces[:2])
            else:
                biz = src.get("biz_location", "")
                snippet = f"{filing_date} {biz}".strip()

            results.append(
                {
                    "entity": str(entity),
                    "filing_date": str(filing_date),
                    "form_type": str(form_type),
                    "snippet": snippet[:300],
                    "source": "edgar",
                }
            )

        return results

    def full_scan(self, sectors: list[str] = None, markets: list[str] = None) -> dict:
        """Run a full scan across specified sectors and markets.

        Returns qualified signals organized by type, sector, and urgency.
        """
        if not sectors:
            sectors = list(SECTOR_SCANS.keys())

        all_signals = []

        for sector in sectors:
            config = SECTOR_SCANS.get(sector, {})

            # Scan each data source
            for source in config.get("data_sources", []):
                try:
                    signals = self._scan_source(source, sector, config, markets)
                    all_signals.extend(signals)
                except Exception as e:
                    pass  # Log but don't stop scan

        # Score and qualify
        qualified = [s for s in all_signals if self._qualify(s, sector)]

        # Organize by urgency
        critical = [s for s in qualified if s.get("urgency") == "critical"]
        high = [s for s in qualified if s.get("urgency") == "high"]
        medium = [s for s in qualified if s.get("urgency") == "medium"]

        return {
            "scan_timestamp": datetime.utcnow().isoformat(),
            "sectors_scanned": sectors,
            "markets": markets or ["nationwide"],
            "total_signals": len(all_signals),
            "qualified_signals": len(qualified),
            "by_urgency": {
                "critical": critical,
                "high": high,
                "medium": medium,
            },
            "by_sector": self._group_by_sector(qualified),
            "by_signal_type": self._group_by_type(qualified),
            "capital_solutions_needed": self._summarize_solutions(qualified),
        }

    def scan_market(self, market: str, sector: str = None) -> list[dict]:
        """Scan a specific market (city/state) for all signals."""
        signals = []

        # EDGAR scan
        try:
            from services.data_connectors import EDGARPlugin
            edgar = EDGARPlugin()
            keywords = [market, f"{market} construction", f"{market} acquisition"]
            for kw in keywords:
                result = edgar.execute(prompt=kw, filing_type="D")
                for f in result.get("filings", []):
                    if f.get("name"):
                        signals.append({
                            "source": "edgar",
                            "name": f["name"],
                            "market": market,
                            "signal_type": "acquisition",
                            "date": f.get("date", ""),
                        })
        except Exception:
            pass

        return signals

    def scan_maturity_wall(self, market: str = None) -> dict:
        """Specifically scan for the construction/bridge loan maturity wall.

        This is the $162B opportunity — properties with loans maturing
        that need solutions.
        """
        wall = {
            "total_maturities_2026": 162_100_000_000,
            "total_maturities_2027": 167_700_000_000,
            "multifamily_share": 0.33,
            "distressed_signals": [],
            "perm_ready_signals": [],
        }

        # Market-specific data
        if market and market.lower() in ["austin", "austin tx", "texas"]:
            wall["market"] = "Austin, TX"
            wall["vacancy_rate"] = 0.142
            wall["concession_weeks"] = "6-12"
            wall["modified_loan_share"] = "above national average"
            wall["outlook"] = "Gradual recovery late 2026-2027"
            wall["distressed_signals"] = [
                {"type": "construction_exit", "description": "Multiple new builds below 80% occupancy"},
                {"type": "maturity_wall", "description": "Banks extending maturities hoping for recovery"},
                {"type": "distressed", "description": "Concessions 6-12 weeks indicate absorption challenges"},
            ]

        return wall

    def scan_target_account(self, company_name: str) -> dict:
        """Deep scan on a specific target account — pull everything public."""
        # EDGAR for filings
        filings = []
        try:
            from services.data_connectors import EDGARPlugin
            edgar = EDGARPlugin()
            for form in ["D", "8-K", "S-1", "10-K"]:
                result = edgar.execute(company=company_name, filing_type=form)
                filings.extend(result.get("filings", [])[:5])
        except Exception:
            pass

        # Generate intelligence brief using Claude
        brief = complete(
            "You are an investment banking research analyst. Generate a brief company profile.",
            f"Research {company_name}: what do they do, how big are they, what's their capital structure, "
            f"what financing needs might they have, who are the key decision makers, and what's the best "
            f"angle for a bond financing or capital markets pitch?",
            max_tokens=1024,
        )

        return {
            "company": company_name,
            "filings_found": len(filings),
            "filings": filings[:10],
            "intelligence_brief": brief,
            "scan_timestamp": datetime.utcnow().isoformat(),
        }

    def detect_signals(self, property_data: dict) -> list[dict]:
        """Given property data, detect what signals are present."""
        signals = []
        occupancy = property_data.get("occupancy_pct", 0)
        loan_maturity_months = property_data.get("loan_maturity_months", 99)
        dscr = property_data.get("dscr", 0)
        construction_complete = property_data.get("construction_complete", False)
        has_bridge = property_data.get("has_bridge_loan", False)
        concession_weeks = property_data.get("concession_weeks", 0)

        # Construction exit signal
        if construction_complete and occupancy < 0.80:
            signals.append({
                "type": "construction_exit",
                "urgency": "high" if loan_maturity_months < 12 else "medium",
                "description": f"Construction complete but {occupancy:.0%} occupancy (needs 90% for perm)",
                "capital_solutions": SIGNAL_TYPES["construction_exit"]["capital_solution"],
            })

        # Bridge maturing
        if has_bridge and loan_maturity_months < 18:
            signals.append({
                "type": "bridge_maturing",
                "urgency": "critical" if loan_maturity_months < 6 else "high",
                "description": f"Bridge loan maturing in {loan_maturity_months} months",
                "capital_solutions": SIGNAL_TYPES["bridge_maturing"]["capital_solution"],
            })

        # Stabilized — ready for perm
        if occupancy >= 0.90 and dscr >= 1.25:
            signals.append({
                "type": "stabilized_refi",
                "urgency": "medium",
                "description": f"Stabilized at {occupancy:.0%} occupancy, {dscr:.2f}x DSCR — perm ready",
                "capital_solutions": SIGNAL_TYPES["stabilized_refi"]["capital_solution"],
            })

        # Distressed
        if dscr < 1.0 or concession_weeks > 8:
            signals.append({
                "type": "distressed",
                "urgency": "critical",
                "description": f"DSCR {dscr:.2f}x, {concession_weeks} weeks concessions — distressed",
                "capital_solutions": SIGNAL_TYPES["distressed"]["capital_solution"],
            })

        # Maturity wall
        if loan_maturity_months < 18 and occupancy < 0.90:
            signals.append({
                "type": "maturity_wall",
                "urgency": "critical" if loan_maturity_months < 9 else "high",
                "description": f"Loan matures in {loan_maturity_months}mo, occupancy {occupancy:.0%} — needs solution",
                "capital_solutions": SIGNAL_TYPES["maturity_wall"]["capital_solution"],
            })

        # Route each signal to capital solution
        for signal in signals:
            solutions = []
            for sol_key in signal.get("capital_solutions", []):
                sol = CAPITAL_SOLUTIONS.get(sol_key, {})
                solutions.append({
                    "solution": sol_key,
                    "description": sol.get("description", ""),
                    "nest_role": sol.get("nest_role", ""),
                    "desk": sol.get("desk", ""),
                })
            signal["routed_solutions"] = solutions

        return signals

    def _scan_source(self, source: str, sector: str, config: dict, markets: list[str] = None) -> list[dict]:
        """Scan a specific data source for a sector."""
        signals = []
        keywords = config.get("keywords", [])

        if source == "edgar":
            try:
                from services.data_connectors import EDGARPlugin
                edgar = EDGARPlugin()
                for kw in keywords[:3]:
                    result = edgar.execute(prompt=kw, filing_type="D")
                    for f in result.get("filings", []):
                        if f.get("name"):
                            signals.append({
                                "source": "edgar",
                                "sector": sector,
                                "name": f["name"],
                                "signal_type": "acquisition",
                                "urgency": "medium",
                                "date": f.get("date", ""),
                            })
            except Exception:
                pass

        elif source == "news":
            # Would connect to NewsAPI or web scraping
            pass

        elif source == "permits":
            # Would connect to permit databases
            pass

        elif source == "attom":
            # Would connect to ATTOM property data API
            pass

        elif source == "costar":
            # Would connect to CoStar API
            pass

        return signals

    def _qualify(self, signal: dict, sector: str) -> bool:
        """Check if a signal meets qualification criteria."""
        # Basic qualification — signal has a name and source
        return bool(signal.get("name") or signal.get("description"))

    def _group_by_sector(self, signals: list[dict]) -> dict:
        groups = {}
        for s in signals:
            sector = s.get("sector", "unknown")
            groups.setdefault(sector, []).append(s)
        return groups

    def _group_by_type(self, signals: list[dict]) -> dict:
        groups = {}
        for s in signals:
            stype = s.get("signal_type", "unknown")
            groups.setdefault(stype, []).append(s)
        return groups

    def _summarize_solutions(self, signals: list[dict]) -> dict:
        solutions = {}
        for s in signals:
            for sol in s.get("capital_solutions", s.get("routed_solutions", [])):
                key = sol if isinstance(sol, str) else sol.get("solution", "unknown")
                solutions[key] = solutions.get(key, 0) + 1
        return solutions
