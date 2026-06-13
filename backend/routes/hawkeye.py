"""
NEST Hawkeye Routes — Institutional Placement & Sales Engine.
Pillar 4: Buyer matching, AI teasers, order book, allocation.
"""
from flask import Blueprint, jsonify, request
from services.auth import require_auth
from datetime import datetime
import threading

try:
    from services.database import db
except ImportError:
    db = None

hawkeye_bp = Blueprint("hawkeye", __name__)

_order_book = {}  # deal_id -> list of indications
_teasers = {}     # deal_id -> list of generated teasers
_lock = threading.Lock()


def _use_db():
    return db and db.configured


# Institutional buyer universe (fallback when no investors table data)
BUYER_UNIVERSE = [
    {"id": "inv_1", "name": "Redwood Family Office", "type": "family_office",
     "aum_usd": 450_000_000, "min_ticket_usd": 5_000_000, "max_ticket_usd": 50_000_000,
     "preferred_rating": "A", "preferred_sectors": ["6232", "6231", "5311"],
     "yield_floor_pct": 5.5, "relationship": "existing"},
    {"id": "inv_2", "name": "Cascadia Endowment Fund", "type": "endowment",
     "aum_usd": 1_200_000_000, "min_ticket_usd": 10_000_000, "max_ticket_usd": 100_000_000,
     "preferred_rating": "BBB+", "preferred_sectors": ["6232", "6231"],
     "yield_floor_pct": 6.0, "relationship": "existing"},
    {"id": "inv_3", "name": "Mariner Credit Partners", "type": "credit_fund",
     "aum_usd": 800_000_000, "min_ticket_usd": 15_000_000, "max_ticket_usd": 75_000_000,
     "preferred_rating": "BBB", "preferred_sectors": ["6232", "5311", "2361"],
     "yield_floor_pct": 7.0, "relationship": "new"},
    {"id": "inv_4", "name": "Pacific Northwest Pension", "type": "pension",
     "aum_usd": 3_500_000_000, "min_ticket_usd": 25_000_000, "max_ticket_usd": 200_000_000,
     "preferred_rating": "A", "preferred_sectors": ["6232", "6231"],
     "yield_floor_pct": 5.0, "relationship": "new"},
    {"id": "inv_5", "name": "Evergreen Insurance Co.", "type": "insurance",
     "aum_usd": 2_100_000_000, "min_ticket_usd": 20_000_000, "max_ticket_usd": 150_000_000,
     "preferred_rating": "A", "preferred_sectors": ["6232", "6231", "5311"],
     "yield_floor_pct": 4.8, "relationship": "existing"},
    {"id": "inv_6", "name": "Summit Capital Advisors", "type": "ria",
     "aum_usd": 280_000_000, "min_ticket_usd": 2_000_000, "max_ticket_usd": 25_000_000,
     "preferred_rating": "BBB+", "preferred_sectors": ["6232", "2361"],
     "yield_floor_pct": 6.5, "relationship": "new"},
]

# Sector NAICS codes by deal_type
_SECTOR_NAICS = {
    "ccrc": "6232",
    "senior_living": "6232",
    "assisted_living": "6232",
    "skilled_nursing": "6231",
    "multifamily": "5311",
    "construction": "2361",
    "bond": "6232",  # default for NEST bond deals
}


def _get_buyers():
    """Return buyer universe from Supabase investors table if populated, else BUYER_UNIVERSE."""
    if not _use_db():
        return BUYER_UNIVERSE
    rows = db.select("investors", {"status": "neq.dead", "limit": "100"}) or []
    if not rows:
        return BUYER_UNIVERSE
    # Map DB schema to buyer schema
    result = []
    for r in rows:
        aum = float(r.get("aum") or 0)
        result.append({
            "id": r["id"],
            "name": r["name"],
            "type": r.get("investor_type") or r.get("entity_type") or "institutional",
            "aum_usd": aum,
            "min_ticket_usd": max(2_000_000, int(aum * 0.005)) if aum else 5_000_000,
            "max_ticket_usd": min(200_000_000, int(aum * 0.08)) if aum else 50_000_000,
            "preferred_rating": "A" if (r.get("tier") == "A") else "BBB+",
            "preferred_sectors": ["6232", "6231"],
            "yield_floor_pct": 5.5,
            "relationship": "existing" if r.get("status") == "active" else "new",
            "tier": r.get("tier", "B"),
        })
    return result if result else BUYER_UNIVERSE


def _get_live_deals():
    """Pull active + pipeline deals from Supabase. Falls back to key reference deals."""
    if _use_db():
        rows = db.select("deals", {"status": "neq.closed", "order": "bond_face.desc", "limit": "50"}) or []
        if rows:
            return [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "status": r.get("status", "pipeline"),
                    "bond_face": float(r.get("bond_face") or 0),
                    "dscr": float(r.get("dscr") or 0),
                    "ltv": float(r.get("ltv") or 0),
                    "state": r.get("state", "FL"),
                    "market": r.get("market", ""),
                    "deal_type": r.get("deal_type", "bond"),
                    "naics": _SECTOR_NAICS.get(
                        (r.get("deal_type") or "bond").lower(), "6232"
                    ),
                    "refi_cycles": r.get("refi_cycles", 0),
                    "ae_economics": float(r.get("ae_economics") or 0),
                }
                for r in rows
            ]
    # Reference fallback (real known NEST pipeline deals)
    return [
        {"id": "jacaranda", "name": "Jacaranda Trace", "status": "active",
         "bond_face": 231_000_000, "dscr": 2.35, "ltv": 52.0,
         "state": "FL", "market": "Sarasota", "deal_type": "ccrc", "naics": "6232",
         "refi_cycles": 3, "ae_economics": 18_400_000},
        {"id": "convivial", "name": "Convivial St. Pete", "status": "pipeline",
         "bond_face": 172_500_000, "dscr": 0.0, "ltv": 0.0,
         "state": "FL", "market": "St. Petersburg", "deal_type": "construction", "naics": "2361",
         "refi_cycles": 0, "ae_economics": 0},
        {"id": "palmetto", "name": "Palmetto Ridge", "status": "pipeline",
         "bond_face": 78_000_000, "dscr": 1.88, "ltv": 63.0,
         "state": "FL", "market": "Jacksonville", "deal_type": "senior_living", "naics": "6232",
         "refi_cycles": 1, "ae_economics": 6_100_000},
        {"id": "meridian", "name": "Meridian Cove", "status": "active",
         "bond_face": 142_000_000, "dscr": 2.12, "ltv": 58.0,
         "state": "FL", "market": "Tampa", "deal_type": "senior_living", "naics": "6232",
         "refi_cycles": 2, "ae_economics": 11_200_000},
    ]


def _score_match(buyer, deal):
    """Score a buyer against a deal. Max 100 pts."""
    score = 0
    rationale = []
    bond_face = deal["bond_face"]
    dscr = deal["dscr"]
    ltv = deal["ltv"]
    naics = deal["naics"]

    # Sector match (30 pts)
    if naics in buyer["preferred_sectors"]:
        score += 30
        rationale.append("Sector match")

    # Deal size vs buyer capacity (25 pts)
    a_tranche = bond_face * 0.75
    if buyer["min_ticket_usd"] <= a_tranche <= buyer["max_ticket_usd"] * 3:
        score += 25
        rationale.append("Ticket size fit")
    elif a_tranche > buyer["max_ticket_usd"] * 3:
        # Can still participate in a tranche slice
        score += 10
        rationale.append("Partial ticket fit")

    # DSCR vs risk appetite (25 pts)
    rating_order = ["A", "BBB+", "BBB", "BBB-", "BB+", "BB"]
    preferred = buyer.get("preferred_rating", "BBB+")
    pref_idx = rating_order.index(preferred) if preferred in rating_order else 2
    # A-grade investors want DSCR > 2.0; BBB want > 1.5
    dscr_floor = 2.0 if pref_idx == 0 else (1.75 if pref_idx == 1 else 1.5)
    if dscr == 0:
        # Construction deal — score neutral
        score += 10
        rationale.append("Construction / pre-DSCR (ground-up)")
    elif dscr >= dscr_floor:
        score += 25
        rationale.append(f"DSCR {dscr:.2f}x meets {dscr_floor:.2f}x floor")
    elif dscr >= 1.5:
        score += 12
        rationale.append(f"DSCR {dscr:.2f}x — BBB- threshold")

    # LTV comfort (10 pts)
    ltv_ceiling = 55 if pref_idx == 0 else (62 if pref_idx == 1 else 70)
    if ltv == 0 or ltv <= ltv_ceiling:
        score += 10
        rationale.append(f"LTV {ltv:.1f}% within {ltv_ceiling}% ceiling")

    # Yield clearance (5 pts — assume 7% Series A coupon standard)
    if 7.0 >= buyer.get("yield_floor_pct", 6.0):
        score += 5
        rationale.append(f"7.0% coupon >= {buyer.get('yield_floor_pct', 6.0)}% floor")

    # Relationship bonus (5 pts)
    if buyer.get("relationship") == "existing":
        score += 5
        rationale.append("Existing relationship")

    suggested_ticket = min(
        buyer["max_ticket_usd"],
        max(buyer["min_ticket_usd"], int(a_tranche * 0.15))
    )

    return score, rationale, suggested_ticket


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg,
                    "timestamp": datetime.utcnow().isoformat()}), code


@hawkeye_bp.route("/buyers", methods=["GET"])
def list_buyers():
    buyers = _get_buyers()
    source = "supabase" if (_use_db() and buyers is not BUYER_UNIVERSE) else "seed"
    return _ok({"buyers": buyers, "total": len(buyers), "source": source})


@hawkeye_bp.route("/deals", methods=["GET"])
def list_hawkeye_deals():
    """Return live pipeline deals with investor match summaries."""
    deals = _get_live_deals()
    buyers = _get_buyers()
    result = []
    for deal in deals:
        matches = []
        for buyer in buyers:
            score, rationale, ticket = _score_match(buyer, deal)
            matches.append({"investor": buyer["name"], "score": score, "suggested_ticket_usd": ticket})
        matches.sort(key=lambda m: m["score"], reverse=True)
        qualified = [m for m in matches if m["score"] >= 40]
        result.append({
            **deal,
            "top_buyers": matches[:3],
            "qualified_buyer_count": len(qualified),
            "potential_demand_usd": sum(m["suggested_ticket_usd"] for m in qualified),
        })
    source = "supabase" if _use_db() else "seed"
    return _ok({"deals": result, "total": len(result), "source": source})


@hawkeye_bp.route("/match", methods=["POST"])
def match_buyers():
    """Match buyers to a deal. Accepts deal_id (pulls from Supabase) or inline deal params."""
    b = request.get_json() or {}
    deal_id = b.get("deal_id")

    # If deal_id provided, pull from Supabase
    if deal_id and _use_db():
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if rows:
            r = rows[0]
            deal = {
                "id": r["id"],
                "name": r["name"],
                "bond_face": float(r.get("bond_face") or 0),
                "dscr": float(r.get("dscr") or 0),
                "ltv": float(r.get("ltv") or 0),
                "deal_type": r.get("deal_type", "bond"),
                "naics": _SECTOR_NAICS.get((r.get("deal_type") or "bond").lower(), "6232"),
            }
        else:
            return _err(f"Deal {deal_id} not found", 404)
    else:
        # Inline params (legacy support)
        deal = {
            "id": b.get("deal_id", "unknown"),
            "name": b.get("dealName", "NEST Deal"),
            "bond_face": b.get("total_raise_usd", 100_000_000),
            "dscr": b.get("dscr", 0),
            "ltv": b.get("ltv", 0),
            "deal_type": b.get("deal_type", "bond"),
            "naics": b.get("naics", "6232"),
        }

    buyers = _get_buyers()
    matches = []
    for buyer in buyers:
        score, rationale, ticket = _score_match(buyer, deal)
        matches.append({
            **buyer,
            "match_score": score,
            "rationale": rationale,
            "suggested_ticket_usd": ticket,
        })

    matches.sort(key=lambda m: m["match_score"], reverse=True)
    qualified = [m for m in matches if m["match_score"] >= 40]

    return _ok({
        "deal": deal,
        "matches": matches,
        "total_matched": len(qualified),
        "potential_demand_usd": sum(m["suggested_ticket_usd"] for m in qualified),
        "source": "supabase" if _use_db() else "seed",
    })


@hawkeye_bp.route("/teaser", methods=["POST"])
def generate_teaser():
    """Generate AI-powered investor teaser for a deal."""
    b = request.get_json() or {}
    deal_id = b.get("dealId", "unknown")
    deal_name = b.get("dealName", "NEST Bond Offering")
    deal_size = b.get("totalRaise", 100_000_000)
    coupon = b.get("coupon", 6.5)
    rating = b.get("rating", "A")
    asset_type = b.get("assetType", "Senior Living CCRC")
    state = b.get("state", "FL")

    from services.ai_router import plugin_hub
    prompt = (
        f"Write a 200-word institutional investor teaser for:\n"
        f"Deal: {deal_name}\n"
        f"Asset: {asset_type} in {state}\n"
        f"Total raise: ${deal_size:,.0f}\n"
        f"Series A coupon: {coupon}%\n"
        f"Target rating: {rating}\n"
        f"Structure: NEST dual-tranche (A senior + B subordinate), Hylant surety wrap\n"
        f"Include: investment highlights, credit strengths, call protection, "
        f"and a clear call-to-action. Jimmy Lee tone — direct, decisive."
    )

    result = plugin_hub.route("investor_teaser", prompt)
    teaser = {
        "id": f"teaser_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "dealId": deal_id,
        "dealName": deal_name,
        "content": result.get("content", "") if result.get("success") else "Teaser generation unavailable",
        "tool_used": result.get("tool", "none"),
        "generatedAt": datetime.utcnow().isoformat(),
    }

    with _lock:
        _teasers.setdefault(deal_id, []).append(teaser)

    return _ok(teaser)


@hawkeye_bp.route("/order-book/<deal_id>", methods=["GET"])
def get_order_book(deal_id):
    with _lock:
        book = _order_book.get(deal_id, [])
    total = sum(o["amount_usd"] for o in book)
    return _ok({
        "dealId": deal_id,
        "orders": book,
        "total_indications_usd": total,
        "order_count": len(book),
    })


@hawkeye_bp.route("/order-book/<deal_id>/indicate", methods=["POST"])
def add_indication(deal_id):
    """Add investor indication to the order book."""
    b = request.get_json() or {}
    indication = {
        "id": f"ord_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "investorId": b.get("investorId"),
        "investorName": b.get("investorName", "Unknown"),
        "amount_usd": b.get("amount_usd", 0),
        "tranche": b.get("tranche", "A"),
        "yield_target_pct": b.get("yield_target_pct"),
        "status": "indicated",
        "indicatedAt": datetime.utcnow().isoformat(),
    }
    with _lock:
        _order_book.setdefault(deal_id, []).append(indication)
    return _ok(indication)


@hawkeye_bp.route("/order-book/<deal_id>/allocate", methods=["POST"])
def allocate(deal_id):
    """Run allocation — prioritize existing relationships, then largest indications."""
    b = request.get_json() or {}
    target_raise = b.get("target_raise_usd", 100_000_000)

    with _lock:
        book = _order_book.get(deal_id, [])

    # Sort: existing relationships first, then by amount descending
    existing_ids = {buyer["id"] for buyer in _get_buyers() if buyer.get("relationship") == "existing"}
    sorted_book = sorted(
        book,
        key=lambda o: (o["investorId"] in existing_ids, o["amount_usd"]),
        reverse=True,
    )

    allocated = 0
    allocations = []
    for order in sorted_book:
        if allocated >= target_raise:
            break
        alloc_amount = min(order["amount_usd"], target_raise - allocated)
        allocations.append({
            **order,
            "allocated_usd": alloc_amount,
            "status": "allocated",
        })
        allocated += alloc_amount

    return _ok({
        "dealId": deal_id,
        "target_raise_usd": target_raise,
        "total_allocated_usd": allocated,
        "remaining_usd": max(0, target_raise - allocated),
        "coverage_pct": round(allocated / target_raise * 100, 1) if target_raise else 0,
        "allocations": allocations,
    })


@hawkeye_bp.route("/teasers/<deal_id>", methods=["GET"])
def list_teasers(deal_id):
    with _lock:
        return _ok(_teasers.get(deal_id, []))
