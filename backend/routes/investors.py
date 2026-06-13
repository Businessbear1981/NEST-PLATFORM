"""Investor management routes — backed by Supabase investors table."""
import threading
import uuid
from flask import Blueprint, jsonify, request
from datetime import datetime
from services.auth import require_auth

try:
    from services.database import db
except ImportError:
    db = None

investors_bp = Blueprint("investors", __name__)

_lock = threading.RLock()
_investors = {}  # in-memory fallback only


def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


def _use_db():
    return db and db.configured


# ── Deal match summary helper ────────────────────────────────────

_SECTOR_NAICS = {
    "ccrc": "6232", "senior_living": "6232", "assisted_living": "6232",
    "skilled_nursing": "6231", "multifamily": "5311", "construction": "2361",
    "bond": "6232",
}

_DEMO_INVESTORS = [
    {
        "id": "inv_demo_1",
        "name": "Redwood Family Office",
        "entity_type": "family_office",
        "investor_type": "family_office",
        "aum": 450_000_000,
        "tier": "A",
        "status": "active",
        "accredited_verified": True,
        "qib_qualified": False,
        "kyc_aml_cleared": True,
        "total_committed_usd": 5_000_000,
        "positions": [],
        "fund_positions": [],
        "created_at": "2025-01-15T00:00:00",
    },
    {
        "id": "inv_demo_2",
        "name": "Cascadia Endowment Fund",
        "entity_type": "institutional",
        "investor_type": "institutional",
        "aum": 1_200_000_000,
        "tier": "A",
        "status": "active",
        "accredited_verified": True,
        "qib_qualified": True,
        "kyc_aml_cleared": True,
        "total_committed_usd": 15_000_000,
        "positions": [],
        "fund_positions": [],
        "created_at": "2025-01-15T00:00:00",
    },
    {
        "id": "inv_demo_3",
        "name": "Mariner Credit Partners",
        "entity_type": "institutional",
        "investor_type": "fund",
        "aum": 800_000_000,
        "tier": "B",
        "status": "prospect",
        "accredited_verified": True,
        "qib_qualified": True,
        "kyc_aml_cleared": True,
        "total_committed_usd": 8_000_000,
        "positions": [],
        "fund_positions": [],
        "created_at": "2025-01-15T00:00:00",
    },
]


def _get_live_deals():
    """Pull non-closed deals from Supabase for deal match summaries."""
    if not _use_db():
        return []
    rows = db.select("deals", {"status": "neq.closed", "order": "bond_face.desc", "limit": "20"}) or []
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "status": r.get("status", "pipeline"),
            "bond_face": float(r.get("bond_face") or 0),
            "dscr": float(r.get("dscr") or 0),
            "ltv": float(r.get("ltv") or 0),
            "deal_type": r.get("deal_type", "bond"),
            "naics": _SECTOR_NAICS.get((r.get("deal_type") or "bond").lower(), "6232"),
        }
        for r in rows
    ]


def _build_deal_matches(investor, deals):
    """Score investor against each deal and return top 3."""
    aum = float(investor.get("aum") or 0)
    min_ticket = max(2_000_000, int(aum * 0.005)) if aum else 5_000_000
    max_ticket = min(200_000_000, int(aum * 0.08)) if aum else 50_000_000
    tier = investor.get("tier", "B")
    preferred_sectors = ["6232", "6231"]
    matches = []
    for deal in deals:
        score = 0
        a_tranche = deal["bond_face"] * 0.75
        if deal["naics"] in preferred_sectors:
            score += 30
        if min_ticket <= a_tranche <= max_ticket * 3:
            score += 25
        elif a_tranche > 0:
            score += 10
        dscr = deal["dscr"]
        dscr_floor = 2.0 if tier == "A" else 1.5
        if dscr == 0:
            score += 10  # construction
        elif dscr >= dscr_floor:
            score += 25
        elif dscr >= 1.5:
            score += 12
        if deal["ltv"] == 0 or deal["ltv"] <= (55 if tier == "A" else 65):
            score += 10
        matches.append({
            "deal_id": deal["id"],
            "deal_name": deal["name"],
            "bond_face": deal["bond_face"],
            "dscr": deal["dscr"],
            "ltv": deal["ltv"],
            "status": deal["status"],
            "match_score": score,
        })
    matches.sort(key=lambda m: m["match_score"], reverse=True)
    return matches[:3]


# ── In-memory seed (fallback only) ──────────────────────────────

def _seed():
    with _lock:
        for inv in _DEMO_INVESTORS:
            _investors[inv["id"]] = inv.copy()


_seed()


# ── Routes ───────────────────────────────────────────────────────

@investors_bp.route("", methods=["GET"])
@require_auth()
def list_investors():
    deals = _get_live_deals()

    if _use_db():
        rows = db.select("investors", {"order": "created_at.desc", "limit": "100"}) or []
        if rows:
            result = []
            for r in rows:
                inv = {
                    "id": r["id"],
                    "name": r["name"],
                    "entity_type": r.get("entity_type", ""),
                    "investor_type": r.get("investor_type", ""),
                    "aum": float(r.get("aum") or 0),
                    "tier": r.get("tier", "B"),
                    "status": r.get("status", "prospect"),
                    "notes": r.get("notes", ""),
                    "contact_email": r.get("contact_email", ""),
                    "created_at": r.get("created_at", ""),
                    "deal_matches": _build_deal_matches(r, deals),
                }
                result.append(inv)
            return _ok({"investors": result, "total": len(result), "source": "supabase"})

    # Fallback to demo investors with live deal matches injected
    result = []
    for inv in _DEMO_INVESTORS:
        enriched = {**inv, "deal_matches": _build_deal_matches(inv, deals)}
        result.append(enriched)
    return _ok({"investors": result, "total": len(result), "source": "seed"})


@investors_bp.route("", methods=["POST"])
@require_auth()
def add_investor():
    body = request.get_json() or {}
    if not body.get("name"):
        return _err("name is required")

    if _use_db():
        row = {
            "name": body["name"],
            "entity_type": body.get("entity_type", "hnwi"),
            "investor_type": body.get("investor_type", "hnwi"),
            "aum": body.get("aum", 0),
            "tier": body.get("tier", "B"),
            "status": body.get("status", "prospect"),
            "contact_email": body.get("contact_email"),
            "contact_phone": body.get("contact_phone"),
            "notes": body.get("notes"),
        }
        result = db.insert("investors", row)
        if not result:
            return _err("Failed to create investor", 500)
        saved = result[0] if isinstance(result, list) else result
        return _ok(saved, 201)

    inv_id = str(uuid.uuid4())
    investor = {
        "id": inv_id,
        "name": body["name"],
        "entity_type": body.get("entity_type", "hnwi"),
        "investor_type": body.get("investor_type", "hnwi"),
        "aum": body.get("aum", 0),
        "tier": body.get("tier", "B"),
        "status": body.get("status", "prospect"),
        "contact_email": body.get("contact_email", ""),
        "total_committed_usd": body.get("total_committed_usd", 0),
        "positions": [],
        "fund_positions": [],
        "created_at": _ts(),
    }
    with _lock:
        _investors[inv_id] = investor
    return _ok(investor, 201)


@investors_bp.route("/<inv_id>", methods=["GET"])
@require_auth()
def get_investor(inv_id):
    deals = _get_live_deals()

    if _use_db():
        rows = db.select("investors", {"id": f"eq.{inv_id}"})
        if rows:
            r = rows[0]
            return _ok({
                **r,
                "aum": float(r.get("aum") or 0),
                "deal_matches": _build_deal_matches(r, deals),
            })
        return _err("Investor not found", 404)

    with _lock:
        inv = _investors.get(inv_id)
    if not inv:
        return _err("Investor not found", 404)
    return _ok({**inv, "deal_matches": _build_deal_matches(inv, deals)})
