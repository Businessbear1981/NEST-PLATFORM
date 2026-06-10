"""
NEST Phoenix Engine — Distressed CRE Acquisition & Rehabilitation.
Supabase-backed. All deals persist to phoenix_deals table.
Radar pulls from EagleEye signals table (distressed CRE signals).
Business logic: underwriting math, LTV calc, bond handoff — all real.
Run migration 006_phoenix_treasury.sql before first use.
"""
from __future__ import annotations

import uuid
import logging
from datetime import datetime
from typing import Any

from services.database import DatabaseService

log = logging.getLogger(__name__)
db = DatabaseService()

PIPELINE_STAGES = ["sourced", "underwriting", "loi", "due_diligence", "bond_structuring", "closed"]
DISTRESSED_SECTORS = {"office", "industrial", "retail", "mixed_use", "multifamily", "hospitality"}


def _ts() -> str:
    return datetime.utcnow().isoformat()


def _score_radar_signal(signal: dict) -> int:
    """Deterministic Phoenix fit score 0-100. No random."""
    score = 0
    data = signal.get("data", {})

    discount = data.get("discount_pct", 0)
    if discount >= 40:
        score += 35
    elif discount >= 30:
        score += 25
    elif discount >= 20:
        score += 15

    current_dscr = data.get("current_dscr", 0)
    target_dscr = data.get("stabilized_dscr", 0)
    if current_dscr < 1.0 and target_dscr >= 1.25:
        score += 25
    elif current_dscr < 1.2 and target_dscr >= 1.1:
        score += 15

    size = data.get("market_value", data.get("asking_price", 0))
    if 15_000_000 <= size <= 300_000_000:
        score += 20
    elif 10_000_000 <= size <= 400_000_000:
        score += 10

    state = signal.get("location_state", "")
    if state in ("FL", "TX", "AZ", "CA", "WA", "OR", "CO", "NC", "GA", "VA"):
        score += 10
    elif state in ("NY", "IL", "PA", "OH", "NV", "TN"):
        score += 5

    no_pi = data.get("no_pi_months", 0)
    if no_pi >= 36:
        score += 10
    elif no_pi >= 24:
        score += 6
    elif no_pi >= 12:
        score += 3

    return min(100, score)


def _default_milestones() -> list[dict]:
    return [
        {"id": "ms-1", "name": "LOI Executed", "target_day": 5, "status": "pending"},
        {"id": "ms-2", "name": "Due Diligence Complete", "target_day": 15, "status": "pending"},
        {"id": "ms-3", "name": "Appraisal Ordered", "target_day": 20, "status": "pending"},
        {"id": "ms-4", "name": "Environmental Phase I", "target_day": 25, "status": "pending"},
        {"id": "ms-5", "name": "Rating Submission", "target_day": 35, "status": "pending"},
        {"id": "ms-6", "name": "Bond Placement", "target_day": 50, "status": "pending"},
        {"id": "ms-7", "name": "Bond Close", "target_day": 60, "status": "pending"},
    ]


_STAGE_MILESTONE_MAP = {
    1: ["ms-1"],
    2: ["ms-1"],
    3: ["ms-1", "ms-2", "ms-3", "ms-4"],
    4: ["ms-1", "ms-2", "ms-3", "ms-4", "ms-5"],
    5: ["ms-1", "ms-2", "ms-3", "ms-4", "ms-5", "ms-6", "ms-7"],
}


class PhoenixEngine:
    """Supabase-backed Phoenix distressed CRE acquisition engine."""

    # ── Deal CRUD ────────────────────────────────────────────────────────

    def list_deals(self) -> list[dict[str, Any]]:
        rows = db.select("phoenix_deals") or []
        return sorted(rows, key=lambda r: r.get("created_at", ""), reverse=True)

    def get_deal(self, deal_id: str) -> dict[str, Any] | None:
        rows = db.select("phoenix_deals", filters={"id": deal_id}) or []
        return rows[0] if rows else None

    def create_deal(self, data: dict[str, Any]) -> dict[str, Any]:
        payload = {
            "id": str(uuid.uuid4()),
            "name": data.get("name", "Untitled Phoenix Deal"),
            "address": data.get("address", ""),
            "asset_type": data.get("asset_type", "Office"),
            "track": data.get("track", "rent_shortfall"),
            "stage": data.get("stage", "sourced"),
            "market_value": data.get("market_value", 0),
            "purchase_price": data.get("purchase_price", 0),
            "current_noi": data.get("current_noi", 0),
            "target_noi": data.get("target_noi", 0),
            "current_occupancy": data.get("current_occupancy", 0),
            "target_occupancy": data.get("target_occupancy", 90),
            "current_dscr": data.get("current_dscr", 0),
            "stabilized_dscr": data.get("stabilized_dscr", 0),
            "no_pi_months": data.get("no_pi_months", 0),
            "remediation_cost": data.get("remediation_cost"),
            "phase_status": data.get("phase_status"),
            "contamination": data.get("contamination"),
            "source": data.get("source", ""),
            "source_contact": data.get("source_contact", ""),
            "msa": data.get("msa", ""),
            "notes": data.get("notes", ""),
            "financials": data.get("financials", {}),
            "milestones": data.get("milestones", _default_milestones()),
            "created_at": _ts(),
            "updated_at": _ts(),
        }
        result = db.insert("phoenix_deals", payload)
        return result or payload

    def update_deal(self, deal_id: str, data: dict[str, Any]) -> dict[str, Any] | None:
        data["updated_at"] = _ts()
        db.update("phoenix_deals", deal_id, data)
        return self.get_deal(deal_id)

    # ── Underwriting ─────────────────────────────────────────────────────

    def underwriting(self, deal_id: str) -> dict[str, Any] | None:
        deal = self.get_deal(deal_id)
        if not deal:
            return None

        mv = float(deal.get("market_value") or 0)
        pp = float(deal.get("purchase_price") or 0)
        target_noi = float(deal.get("target_noi") or 0)
        current_noi = float(deal.get("current_noi") or 0)
        no_pi = int(deal.get("no_pi_months") or 0)
        stab_dscr = float(deal.get("stabilized_dscr") or 0)

        instant_equity = mv - pp
        ltv = (pp / mv * 100) if mv > 0 else 100
        discount_pct = (instant_equity / mv * 100) if mv > 0 else 0
        stabilized_value = target_noi / 0.065 if target_noi > 0 else mv
        exit_equity = stabilized_value - pp
        hold_years = no_pi / 12 if no_pi > 0 else 3
        irr = ((exit_equity / pp) ** (1 / hold_years) - 1) * 100 if pp > 0 and hold_years > 0 else 0
        occupancy_gap = int(deal.get("target_occupancy") or 90) - int(deal.get("current_occupancy") or 0)

        result = {
            "deal_id": deal_id,
            "discount_to_equity": {
                "market_value": mv,
                "purchase_price": pp,
                "instant_equity": round(instant_equity),
                "discount_pct": round(discount_pct, 1),
                "ltv_at_acquisition": round(ltv, 1),
                "ltv_grade": "green" if ltv < 65 else "amber" if ltv < 75 else "red",
            },
            "stabilization_plan": {
                "current_noi": current_noi,
                "target_noi": target_noi,
                "noi_uplift_needed": round(target_noi - current_noi),
                "current_occupancy": deal.get("current_occupancy", 0),
                "target_occupancy": deal.get("target_occupancy", 90),
                "occupancy_gap_pct": occupancy_gap,
                "no_pi_months": no_pi,
                "ti_budget_estimate": round(mv * 0.008),
                "lease_up_months": max(12, occupancy_gap // 2),
            },
            "bond_feasibility": {
                "recommended_bond_size": round(pp),
                "coupon_range": "6.5% - 7.5%",
                "term_years": max(3, round(no_pi / 12)),
                "no_pi_window_months": no_pi,
                "stabilized_dscr": stab_dscr,
                "dscr_grade": "green" if stab_dscr > 1.25 else "amber" if stab_dscr > 1.0 else "red",
                "feasible": ltv < 75 and stab_dscr > 1.25,
            },
            "exit_modeling": {
                "stabilized_value": round(stabilized_value),
                "exit_equity": round(exit_equity),
                "cap_rate_used": 6.5,
                "refi_ltv": round(pp / stabilized_value * 100, 1) if stabilized_value > 0 else 0,
                "projected_irr": round(irr, 1),
                "hold_years": round(hold_years, 1),
            },
        }

        if deal.get("track") in ("environmental", "both"):
            result["remediation_plan"] = {
                "contamination_type": deal.get("contamination", "Unknown"),
                "phase_status": deal.get("phase_status", "Phase I"),
                "estimated_cost": float(deal.get("remediation_cost") or 0),
                "timeline_months": no_pi,
                "post_cleanup_value": round(stabilized_value * 1.15),
                "indemnity_required": True,
            }

        return result

    # ── Timeline ─────────────────────────────────────────────────────────

    def timeline(self, deal_id: str) -> dict[str, Any] | None:
        deal = self.get_deal(deal_id)
        if not deal:
            return None

        stage = deal.get("stage", "sourced")
        stage_idx = PIPELINE_STAGES.index(stage) if stage in PIPELINE_STAGES else 0
        milestones = deal.get("milestones") or _default_milestones()

        completed_ids: set[str] = set()
        for si in range(stage_idx + 1):
            completed_ids.update(_STAGE_MILESTONE_MAP.get(si, []))

        for ms in milestones:
            if ms["id"] in completed_ids and ms["status"] == "pending":
                ms["status"] = "complete"

        return {
            "deal_id": deal_id,
            "total_days": 60,
            "days_elapsed": stage_idx * 12,
            "days_remaining": max(0, 60 - stage_idx * 12),
            "current_stage": stage,
            "milestones": milestones,
            "bridge_capital_deployed": round(float(deal.get("purchase_price") or 0) * 0.05),
        }

    def update_milestone(self, deal_id: str, milestone_id: str, status: str) -> dict[str, Any] | None:
        deal = self.get_deal(deal_id)
        if not deal:
            return None
        milestones = deal.get("milestones") or _default_milestones()
        for ms in milestones:
            if ms["id"] == milestone_id:
                ms["status"] = status
        self.update_deal(deal_id, {"milestones": milestones})
        return self.timeline(deal_id)

    # ── Bond handoff ─────────────────────────────────────────────────────

    def bond_handoff(self, deal_id: str) -> dict[str, Any] | None:
        deal = self.get_deal(deal_id)
        if not deal:
            return None
        uw = self.underwriting(deal_id)
        return {
            "deal_id": deal_id,
            "bond_desk_payload": {
                "name": f"Phoenix — {deal['name']}",
                "issuer": "NEST Advisors (Phoenix Fund)",
                "amount": float(deal.get("purchase_price") or 0),
                "asset_type": deal.get("asset_type"),
                "address": deal.get("address"),
                "ltv": uw["discount_to_equity"]["ltv_at_acquisition"],
                "target_dscr": float(deal.get("stabilized_dscr") or 0),
                "term_years": uw["bond_feasibility"]["term_years"],
                "no_pi_months": uw["stabilization_plan"]["no_pi_months"],
                "coupon_range": "6.5% - 7.5%",
                "source": "Phoenix Acquisition",
                "source_channel": "phoenix",
            },
            "ready": uw["bond_feasibility"]["feasible"],
        }

    # ── Radar — EagleEye signals ─────────────────────────────────────────

    def radar_feed(self) -> list[dict[str, Any]]:
        try:
            rows = db.select("signals", filters={"status": "scored"}) or []
            distressed = [
                r for r in rows
                if r.get("sector") in DISTRESSED_SECTORS
                or r.get("signal_type") == "distressed_cre"
            ]
            distressed.sort(key=lambda r: float(r.get("score") or 0), reverse=True)
            return distressed[:20]
        except Exception as exc:
            log.warning("radar_feed: %s", exc)
            return []

    def radar_scores(self) -> list[dict[str, Any]]:
        signals = self.radar_feed()
        scored = []
        for sig in signals:
            data = sig.get("data", {})
            phoenix_score = _score_radar_signal(sig)
            scored.append({
                "signal_id": sig.get("id"),
                "entity_name": sig.get("entity_name", ""),
                "address": data.get("address", ""),
                "asset_type": data.get("asset_type", sig.get("sector", "")),
                "market_value": data.get("market_value", 0),
                "asking_price": data.get("asking_price", 0),
                "discount_pct": data.get("discount_pct", 0),
                "track": data.get("track", "rent_shortfall"),
                "msa": data.get("msa", f"{sig.get('location_city','')} {sig.get('location_state','')}".strip()),
                "phoenix_score": phoenix_score,
                "score_breakdown": {
                    "discount_depth": min(35, int(data.get("discount_pct", 0) * 0.875)),
                    "dscr_recovery": 25 if (data.get("current_dscr", 0) < 1.0 and data.get("stabilized_dscr", 0) >= 1.25) else 10,
                    "deal_size_fit": 20 if 15_000_000 <= data.get("market_value", 0) <= 300_000_000 else 5,
                    "geo_strength": 10 if sig.get("location_state") in ("FL", "TX", "AZ", "CA", "WA", "OR", "CO", "NC") else 5,
                    "no_pi_window": 10 if data.get("no_pi_months", 0) >= 36 else 3,
                },
                "recommended_action": "hot_pursue" if phoenix_score >= 80 else "warm_outreach" if phoenix_score >= 60 else "watch",
            })
        scored.sort(key=lambda r: r["phoenix_score"], reverse=True)
        return scored

    def promote_to_deal(self, signal_id: str) -> dict[str, Any]:
        rows = db.select("signals", filters={"id": signal_id}) or []
        if not rows:
            return {"error": "signal_not_found"}
        sig = rows[0]
        data = sig.get("data", {})
        deal = self.create_deal({
            "name": sig.get("entity_name") or data.get("address", "Phoenix Deal"),
            "address": data.get("address", ""),
            "asset_type": data.get("asset_type", "Office"),
            "track": data.get("track", "rent_shortfall"),
            "market_value": data.get("market_value", 0),
            "purchase_price": data.get("asking_price", data.get("purchase_price", 0)),
            "current_noi": data.get("current_noi", 0),
            "target_noi": data.get("target_noi", 0),
            "current_occupancy": data.get("current_occupancy", 0),
            "target_occupancy": data.get("target_occupancy", 90),
            "current_dscr": data.get("current_dscr", 0),
            "stabilized_dscr": data.get("stabilized_dscr", 0),
            "no_pi_months": data.get("no_pi_months", 0),
            "remediation_cost": data.get("remediation_cost"),
            "phase_status": data.get("phase_status"),
            "contamination": data.get("contamination"),
            "msa": data.get("msa", ""),
            "source": "EagleEye Signal",
            "source_contact": sig.get("source", ""),
        })
        db.update("signals", signal_id, {"status": "prospect"})
        return deal

    # ── Warchest ─────────────────────────────────────────────────────────

    def warchest(self) -> dict[str, Any]:
        all_deals = self.list_deals()

        def _card(d: dict) -> dict:
            mv = float(d.get("market_value") or 0)
            pp = float(d.get("purchase_price") or 0)
            return {
                "deal_id": d["id"],
                "name": d["name"],
                "acquisition_price": pp,
                "current_estimated_value": mv,
                "occupancy_pct": d.get("current_occupancy", 0),
                "target_occupancy_pct": d.get("target_occupancy", 90),
                "stage": d.get("stage"),
                "track": d.get("track"),
                "unrealized_equity": round(mv - pp),
                "status": "stabilizing" if int(d.get("current_occupancy") or 0) < int(d.get("target_occupancy") or 90) else "stabilized",
            }

        return {
            "active_stabilization": [_card(d) for d in all_deals if d.get("stage") not in ("closed",)],
            "ready_for_bond": [_card(d) for d in all_deals if d.get("stage") == "bond_structuring"],
            "closed": [_card(d) for d in all_deals if d.get("stage") == "closed"],
        }

    def warchest_economics(self) -> dict[str, Any]:
        all_deals = self.list_deals()
        if not all_deals:
            return {"total_assets": 0, "total_acquired": 0, "total_equity_created": 0, "avg_discount_pct": 0, "portfolio_nav": 0}

        total_acquired = sum(float(d.get("purchase_price") or 0) for d in all_deals)
        total_mv = sum(float(d.get("market_value") or 0) for d in all_deals)
        discounts = [
            (float(d.get("market_value") or 0) - float(d.get("purchase_price") or 0)) / float(d.get("market_value") or 1) * 100
            for d in all_deals if float(d.get("market_value") or 0) > 0
        ]

        return {
            "total_assets": len(all_deals),
            "total_acquired": round(total_acquired),
            "total_equity_created": round(total_mv - total_acquired),
            "avg_discount_pct": round(sum(discounts) / len(discounts), 1) if discounts else 0,
            "portfolio_nav": round(total_mv),
        }
