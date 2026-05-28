"""
EagleEye Service — Scout-driven deal sourcing with live data connectors.

Scouts are persistent search profiles. Each scout queries EMMA, EDGAR, and FINRA
for live market data, scores results with Claude, and writes signals to Supabase.
High-confidence signals (node_count >= 3) auto-promote to prospects.
"""
from __future__ import annotations

import json
import uuid
import logging
from datetime import datetime
from typing import Optional

from services.database import DatabaseService
from services.data_connectors import EDGARPlugin, EMMAPlugin, FINRABrokerCheckPlugin
from agents._claude import complete

log = logging.getLogger(__name__)

db = DatabaseService()

# Connector singletons — instantiated once at module load
_edgar = EDGARPlugin()
_emma = EMMAPlugin()
_finra = FINRABrokerCheckPlugin()

_SYSTEM_PROMPT = """\
You are Morgan, NEST Advisors' bond origination intelligence engine.
Tone: Jimmy Lee (JPMorgan) — direct, decisive, no hedging.
Banned: may, might, could, potentially, approximately, it seems.
You evaluate raw data hits for private bond financing fit and return strict JSON.\
"""

_SCORE_PROMPT_TEMPLATE = """\
Evaluate this market data hit for bond financing potential on behalf of NEST Advisors.

Source: {source}
Raw data: {raw_data}

Scout criteria: {criteria}

NEST sweet spot: $15M–$300M deals, sectors (senior_living, infrastructure, multifamily,
industrial, data_centers). Jacaranda Trace PLOM ($231M, FL LGFC) is the structural benchmark.

Score on these five nodes — award a node_hit only when evidence is clear:
1. deal_size_fit      — estimated size $15M–$300M
2. sector_suitability — suitable for tax-exempt or private bond financing
3. credit_indicators  — positive financial signals (revenue, occupancy, DSCR proxies)
4. geographic_strength — active bond market state (FL, TX, AZ, CA, WA, OR, CO, NC)
5. structural_complexity — multi-tranche or conduit structure likely needed

Return ONLY valid JSON (no markdown, no prose):
{{
  "score": <int 0-100>,
  "node_hits": [<list of node names that fired>],
  "summary": "<2 sentences, direct, no hedging>",
  "recommended_action": "<one of: pass | watch | warm_outreach | hot_pursue>"
}}
"""


class EagleEyeService:

    # ── Scout management ─────────────────────────────────────────

    def create_scout(self, name: str, criteria: dict, sources: list[str]) -> dict:
        """Save a new Scout profile to Supabase `scouts` table."""
        scout = {
            "id": f"scout_{uuid.uuid4().hex[:12]}",
            "name": name,
            "criteria": criteria,
            "sources": sources,
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
            "last_run_at": None,
            "signal_count": 0,
        }
        saved = db.insert("scouts", scout)
        if saved:
            if isinstance(saved, list):
                return saved[0]
            return saved
        # DB not configured — return in-memory object so callers always get a dict
        return scout

    def create_scout_from_deal(self, deal_id: str) -> dict:
        """Read a deal from Supabase, extract its sector/size/location, build a scout."""
        deal = db.select("deals", {"id": f"eq.{deal_id}"}, single=True)
        if not deal:
            raise ValueError(f"Deal {deal_id} not found")

        sector = deal.get("sector") or deal.get("asset_class") or "general"
        size_usd = deal.get("size_usd") or 0
        location = deal.get("location") or ""
        state = location.split(",")[-1].strip() if "," in location else location
        deal_type = deal.get("deal_type") or "bond"

        criteria = {
            "sector": sector,
            "min_size_usd": int(size_usd * 0.5) if size_usd else 15_000_000,
            "max_size_usd": int(size_usd * 2.0) if size_usd else 300_000_000,
            "states": [state] if state else ["FL", "TX", "AZ", "CA", "WA"],
            "deal_types": [deal_type],
            "keyword": sector.replace("_", " "),
        }

        name = f"Find more like {deal.get('name', deal_id)}"
        sources = ["emma", "edgar", "finra"]

        return self.create_scout(name, criteria, sources)

    # ── Scout execution ──────────────────────────────────────────

    def run_scout(self, scout_id: str) -> dict:
        """Execute a scout: query each source, score hits, save signals."""
        scout = db.select("scouts", {"id": f"eq.{scout_id}"}, single=True)
        if not scout:
            raise ValueError(f"Scout {scout_id} not found")

        criteria = scout.get("criteria", {})
        sources = scout.get("sources", ["emma", "edgar", "finra"])

        signals_created = []
        prospects_created = []
        errors = []

        for source in sources:
            try:
                hits = self._query_source(source, criteria)
                for hit in hits:
                    result = self._score_and_save(hit, scout_id, source, criteria)
                    if result:
                        signals_created.append(result["signal_id"])
                        if result.get("promoted_to_prospect"):
                            prospects_created.append(result["prospect_id"])
            except Exception as exc:
                log.warning("Scout %s source %s failed: %s", scout_id, source, exc)
                errors.append({"source": source, "error": str(exc)})

        # Update scout last_run_at and signal_count
        db.update(
            "scouts",
            {"id": f"eq.{scout_id}"},
            {
                "last_run_at": datetime.utcnow().isoformat(),
                "signal_count": (scout.get("signal_count") or 0) + len(signals_created),
            },
        )

        return {
            "scout_id": scout_id,
            "scout_name": scout.get("name"),
            "sources_queried": sources,
            "signals_created": len(signals_created),
            "prospects_promoted": len(prospects_created),
            "signal_ids": signals_created,
            "prospect_ids": prospects_created,
            "errors": errors,
            "run_at": datetime.utcnow().isoformat(),
        }

    # ── Source dispatch ──────────────────────────────────────────

    def _query_source(self, source: str, criteria: dict) -> list[dict]:
        """Call the right connector and normalise results to a list of raw hit dicts."""
        keyword = criteria.get("keyword") or criteria.get("sector", "senior living")
        keyword = keyword.replace("_", " ")

        if source == "emma":
            result = _emma.execute(issuer=keyword)
            if not result.get("success"):
                return []
            # EMMA returns {"data": {...}} — flatten to list
            data = result.get("data", {})
            # EMMA API may return a list or a dict with items
            if isinstance(data, list):
                items = data[:10]
            elif isinstance(data, dict):
                items = data.get("results", data.get("items", data.get("issuers", [])))
                if not isinstance(items, list):
                    # Wrap the whole dict as a single hit if no list found
                    items = [data] if data else []
            else:
                items = []
            return [{"_source": "emma", "_raw": item, "keyword": keyword} for item in items[:10]]

        elif source == "edgar":
            result = _edgar.execute(company=keyword, filing_type="10-K")
            if not result.get("success"):
                return []
            filings = result.get("filings", [])
            return [{"_source": "edgar", "_raw": f, "keyword": keyword} for f in filings[:10]]

        elif source == "finra":
            result = _finra.execute(name=keyword)
            if not result.get("success"):
                return []
            individuals = result.get("individuals", [])
            return [{"_source": "finra", "_raw": ind, "keyword": keyword} for ind in individuals[:10]]

        else:
            log.warning("Unknown source: %s", source)
            return []

    # ── Scoring and persistence ──────────────────────────────────

    def _score_and_save(
        self, hit: dict, scout_id: str, source: str, criteria: dict
    ) -> Optional[dict]:
        """Use Claude to score a raw hit, save to `signals`, auto-promote if score >= 3 nodes."""
        raw_summary = json.dumps(hit.get("_raw", hit), default=str)[:2000]

        prompt = _SCORE_PROMPT_TEMPLATE.format(
            source=source,
            raw_data=raw_summary,
            criteria=json.dumps(criteria, default=str),
        )

        try:
            raw_response = complete(_SYSTEM_PROMPT, prompt)
            # Strip any accidental markdown fences
            clean = raw_response.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            scoring = json.loads(clean)
        except Exception as exc:
            log.warning("Claude scoring failed for hit from %s: %s", source, exc)
            scoring = {
                "score": 40,
                "node_hits": [],
                "summary": "Scoring unavailable.",
                "recommended_action": "watch",
            }

        score = int(scoring.get("score", 0))
        node_hits = scoring.get("node_hits", [])
        node_count = len(node_hits)
        recommended_action = scoring.get("recommended_action", "watch")

        status_map = {
            "hot_pursue": "hot",
            "warm_outreach": "warm",
            "watch": "review",
            "pass": "passed",
        }
        status = status_map.get(recommended_action, "review")

        signal_id = f"sig_{uuid.uuid4().hex[:12]}"
        signal = {
            "id": signal_id,
            "scout_id": scout_id,
            "source": source,
            "keyword": hit.get("keyword", ""),
            "raw_data": hit.get("_raw", {}),
            "score": score,
            "node_hits": node_hits,
            "node_count": node_count,
            "summary": scoring.get("summary", ""),
            "recommended_action": recommended_action,
            "status": status,
            "created_at": datetime.utcnow().isoformat(),
        }

        db.insert("signals", signal)

        result: dict = {"signal_id": signal_id, "score": score, "node_count": node_count}

        # Auto-promote to prospects if node_count >= 3
        if node_count >= 3:
            prospect_id = f"pros_{uuid.uuid4().hex[:12]}"
            prospect = {
                "id": prospect_id,
                "signal_id": signal_id,
                "scout_id": scout_id,
                "source": source,
                "summary": scoring.get("summary", ""),
                "score": score,
                "node_hits": node_hits,
                "node_count": node_count,
                "recommended_action": recommended_action,
                "stage": "identified",
                "created_at": datetime.utcnow().isoformat(),
            }
            db.insert("prospects", prospect)
            result["promoted_to_prospect"] = True
            result["prospect_id"] = prospect_id
        else:
            result["promoted_to_prospect"] = False

        return result

    # ── Query helpers (for route layer) ─────────────────────────

    def list_signals(self, status: Optional[str] = None) -> list[dict]:
        params: dict = {"order": "score.desc"}
        if status:
            params["status"] = f"eq.{status}"
        result = db.select("signals", params)
        return result or []

    def list_prospects(self, stage: Optional[str] = None) -> list[dict]:
        params: dict = {"order": "score.desc"}
        if stage:
            params["stage"] = f"eq.{stage}"
        result = db.select("prospects", params)
        return result or []

    def list_scouts(self) -> list[dict]:
        result = db.select("scouts", {"order": "created_at.desc"})
        return result or []


# Singleton used by route layer
eagleeye = EagleEyeService()
