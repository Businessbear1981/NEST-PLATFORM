"""Full deal lifecycle routes — CRUD, bond structure, refi, covenants, checklist, memo.

Backed by Supabase. Falls back to in-memory if DB is not configured.
"""
import json
import threading
import uuid as _uuid
from flask import Blueprint, jsonify, request, current_app
from datetime import datetime
from models.deal import new_deal, compute_readiness_score, DEAL_STATUSES
from models.bond import new_bond_structure, new_series
from models.refi import new_refi_cycle
from services.auth import require_auth

try:
    from services.database import db
except ImportError:
    db = None

deals_bp = Blueprint("deals", __name__)

# In-memory fallback (only used when Supabase is not configured)
_lock = threading.RLock()
_bonds = {}
_refis = {}
_covenants = {}

# Seed the three live NEST deals so the workbench always has data
_deals = {
    "jacaranda-2025": {
        "id": "jacaranda-2025",
        "name": "Jacaranda Trace CCRC",
        "status": "structuring",
        "state": "FL",
        "market": "Palm Beach Gardens",
        "deal_type": "senior_living_bond",
        "bond_face": 205000000,
        "amount": 205000000,
        "readiness_score": 82,
        "risk_grade": "BBB+",
        "series_a_amount": 153750000,
        "series_b_amount": 14350000,
        "issuer": "Jacaranda Trace Community Foundation",
        "created_at": "2025-01-15T09:00:00",
        "createdAt": "2025-01-15T09:00:00",
        "notes": "LGFC Series 2025. 504-unit CCRC. Hylant surety. JP Morgan comp.",
    },
    "st-pete-construction-2025": {
        "id": "st-pete-construction-2025",
        "name": "St. Petersburg Mixed-Use Construction",
        "status": "credit_underwriting",
        "state": "FL",
        "market": "St. Petersburg",
        "deal_type": "construction_bond",
        "bond_face": 172500000,
        "amount": 172500000,
        "readiness_score": 64,
        "risk_grade": "BBB-",
        "series_a_amount": 129375000,
        "series_b_amount": 12075000,
        "issuer": "St. Pete Development LLC",
        "created_at": "2025-02-01T09:00:00",
        "createdAt": "2025-02-01T09:00:00",
        "notes": "Ground-up mixed-use. IO period 24mo. Pre-sold 40% units.",
    },
    "hbo2-equity-2025": {
        "id": "hbo2-equity-2025",
        "name": "HBO2 Equity Placement",
        "status": "placement",
        "state": "CA",
        "market": "Los Angeles",
        "deal_type": "equity_placement",
        "bond_face": 155000000,
        "amount": 155000000,
        "readiness_score": 91,
        "risk_grade": "A-",
        "series_a_amount": 116250000,
        "series_b_amount": 10850000,
        "issuer": "HBO2 Capital Partners",
        "created_at": "2025-03-10T09:00:00",
        "createdAt": "2025-03-10T09:00:00",
        "notes": "Media equity round. NEST as placement agent. BD-sponsorship track.",
    },
}


def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


def _use_db():
    return db and db.configured


# ── Supabase <-> Deal model mapping ──────────────────────────────

def _deal_to_row(d):
    """Convert in-memory deal dict to Supabase row."""
    project = d.get("project", {})
    return {
        "name": d["name"],
        "status": _map_status(d.get("status", "intake")),
        "state": project.get("state"),
        "market": project.get("city"),
        "deal_type": project.get("asset_type", "bond"),
        "bond_face": project.get("total_project_cost_usd", 0),
        "readiness_score": d.get("readiness_score", 0),
        "checklist": json.dumps(d.get("readiness_checklist", {})),
        "notes": json.dumps({
            "project": d.get("project", {}),
            "sponsor": d.get("sponsor", {}),
            "team": d.get("team", {}),
            "slug": d.get("slug", ""),
        }),
    }


def _row_to_deal(row):
    """Convert Supabase row to deal dict for API response."""
    notes = row.get("notes") or {}
    if isinstance(notes, str):
        try:
            notes = json.loads(notes)
        except (json.JSONDecodeError, TypeError):
            notes = {}

    checklist = row.get("checklist") or {}
    if isinstance(checklist, str):
        try:
            checklist = json.loads(checklist)
        except (json.JSONDecodeError, TypeError):
            checklist = {}

    return {
        "id": row["id"],
        "name": row["name"],
        "slug": notes.get("slug", row["name"].lower().replace(" ", "-")),
        "status": row.get("status", "pipeline"),
        "created_at": row.get("created_at", ""),
        "updated_at": row.get("updated_at", ""),
        "readiness_score": row.get("readiness_score", 0),
        "readiness_checklist": checklist if isinstance(checklist, dict) else {},
        "project": notes.get("project", {
            "name": row["name"],
            "state": row.get("state"),
            "city": row.get("market"),
            "asset_type": row.get("deal_type"),
            "total_project_cost_usd": float(row.get("bond_face", 0)),
        }),
        "sponsor": notes.get("sponsor", {}),
        "team": notes.get("team", {}),
        # Supabase-specific fields
        "bond_face": float(row.get("bond_face", 0)),
        "dscr": float(row.get("dscr", 0)),
        "ltv": float(row.get("ltv", 0)),
        "cf_leverage": float(row.get("cf_leverage", 0)),
        "bs_leverage": float(row.get("bs_leverage", 0)),
        "d_ebitda": float(row.get("d_ebitda", 0)),
        "icr": float(row.get("icr", 0)),
        "refi_cycles": row.get("refi_cycles", 0),
        "ae_economics": float(row.get("ae_economics", 0)),
        "state": row.get("state"),
        "market": row.get("market"),
        "stress_scenarios": row.get("stress_scenarios", []),
        "capital_stack": row.get("capital_stack", []),
        "sources_uses": row.get("sources_uses", []),
    }


def _map_status(status):
    """Map in-memory statuses to Supabase CHECK constraint values."""
    mapping = {
        "intake": "pipeline",
        "underwriting": "active",
        "structured": "active",
        "placed": "active",
        "active": "active",
        "refi_cycle": "active",
        "bridge": "active",
        "closed": "closed",
    }
    return mapping.get(status, status)


# ── Supabase startup seed ────────────────────────────────────────

_SEED_DEALS = [
    {
        "name": "Jacaranda Trace CCRC",
        "status": "active",
        "state": "FL",
        "market": "Palm Beach Gardens",
        "deal_type": "senior_living_bond",
        "bond_face": 205000000,
        "readiness_score": 82,
        "dscr": 1.82,
        "ltv": 58.0,
        "cf_leverage": 1.65,
        "bs_leverage": 2.15,
        "d_ebitda": 5.2,
        "icr": 2.85,
        "ae_economics": 5125000,
        "checklist": json.dumps({
            "appraisal": True, "env_phase1": True, "title_search": True,
            "sponsor_financials": True, "market_study": True,
            "surety_commitment": True, "legal_counsel": True, "insurance": False,
        }),
        "notes": json.dumps({
            "slug": "jacaranda-trace-ccrc",
            "project": {
                "name": "Jacaranda Trace CCRC",
                "asset_type": "senior_living_bond",
                "state": "FL",
                "city": "Palm Beach Gardens",
                "total_project_cost_usd": 205000000,
                "description": "504-unit Continuing Care Retirement Community. LGFC Series 2025. "
                               "Hylant surety. JP Morgan comp. Series A $153.75M @ 7.0%, "
                               "Series B $14.35M @ 11.5%. 24-month IO pre-funded from proceeds.",
                "sector": "Senior Housing",
                "naics": "623110",
                "units": 504,
                "construction_months": 28,
            },
            "sponsor": {
                "entity_name": "Jacaranda Trace Community Foundation",
                "type": "nonprofit_operator",
                "borrower": "Jacaranda Trace Community Foundation",
                "track_record_years": 22,
                "existing_ccrc_units": 312,
            },
            "team": {
                "placement_agent": "NEST Advisors",
                "surety": "Hylant Insurance",
                "bond_counsel": "Squire Patton Boggs",
                "trustee": "U.S. Bank",
            },
        }),
    },
    {
        "name": "St. Petersburg Mixed-Use Construction",
        "status": "active",
        "state": "FL",
        "market": "St. Petersburg",
        "deal_type": "construction_bond",
        "bond_face": 172500000,
        "readiness_score": 64,
        "dscr": 1.54,
        "ltv": 67.0,
        "cf_leverage": 1.92,
        "bs_leverage": 2.38,
        "d_ebitda": 6.1,
        "icr": 2.31,
        "ae_economics": 4312500,
        "checklist": json.dumps({
            "appraisal": True, "env_phase1": True, "title_search": True,
            "sponsor_financials": True, "market_study": False,
            "surety_commitment": False, "legal_counsel": True, "insurance": False,
        }),
        "notes": json.dumps({
            "slug": "st-pete-construction",
            "project": {
                "name": "St. Petersburg Mixed-Use Construction",
                "asset_type": "construction_bond",
                "state": "FL",
                "city": "St. Petersburg",
                "total_project_cost_usd": 172500000,
                "description": "Ground-up mixed-use: 380 multifamily units + 42,000 SF retail. "
                               "24-month IO period. Pre-sold 40% of units. Series A $129.375M @ 7.25%, "
                               "Series B $12.075M @ 12.0%. Downtown Pinellas County opportunity zone.",
                "sector": "Mixed-Use / Multifamily",
                "naics": "236220",
                "units": 380,
                "retail_sf": 42000,
                "construction_months": 24,
                "presold_pct": 40,
            },
            "sponsor": {
                "entity_name": "St. Pete Development LLC",
                "type": "private_developer",
                "borrower": "St. Pete Development LLC",
                "track_record_years": 14,
                "completed_projects": 8,
            },
            "team": {
                "placement_agent": "NEST Advisors",
                "surety": "Hylant Insurance",
                "bond_counsel": "GrayRobinson PA",
                "general_contractor": "Skanska USA",
            },
        }),
    },
    {
        "name": "HBO2 Equity Placement",
        "status": "active",
        "state": "CA",
        "market": "Los Angeles",
        "deal_type": "equity_placement",
        "bond_face": 155000000,
        "readiness_score": 91,
        "dscr": 2.14,
        "ltv": 51.0,
        "cf_leverage": 1.38,
        "bs_leverage": 1.87,
        "d_ebitda": 4.1,
        "icr": 3.62,
        "ae_economics": 3875000,
        "checklist": json.dumps({
            "appraisal": True, "env_phase1": True, "title_search": True,
            "sponsor_financials": True, "market_study": True,
            "surety_commitment": True, "legal_counsel": True, "insurance": True,
        }),
        "notes": json.dumps({
            "slug": "hbo2-equity-placement",
            "project": {
                "name": "HBO2 Equity Placement",
                "asset_type": "equity_placement",
                "state": "CA",
                "city": "Los Angeles",
                "total_project_cost_usd": 155000000,
                "description": "Media equity round. NEST as placement agent under BD-sponsorship track. "
                               "Britehorn BD sponsorship. $116.25M Series A preferred + $10.85M Series B. "
                               "Streaming + licensing IP collateral. A-grade credit metrics.",
                "sector": "Media / Entertainment",
                "naics": "512110",
            },
            "sponsor": {
                "entity_name": "HBO2 Capital Partners",
                "type": "media_operator",
                "borrower": "HBO2 Capital Partners",
                "track_record_years": 18,
            },
            "team": {
                "placement_agent": "NEST Advisors",
                "bd_sponsor": "Britehorn Partners",
                "legal_counsel": "Latham & Watkins LLP",
                "auditor": "Deloitte",
            },
        }),
    },
]


def _seed_supabase_deals():
    """On startup: if the Supabase deals table is empty, insert the 3 live NEST deals."""
    if not _use_db():
        return
    try:
        existing = db.select("deals", {"limit": "1"})
        if existing and len(existing) > 0:
            return  # Table already has data — do not re-seed
        for seed in _SEED_DEALS:
            result = db.insert("deals", seed)
            if result:
                row = result[0] if isinstance(result, list) else result
                # Also populate in-memory cache so same process can serve immediately
                deal = _row_to_deal(row)
                with _lock:
                    _deals[deal["id"]] = deal
    except Exception:
        pass  # Seed failure is non-fatal — in-memory fallback covers it


# Seed on module load (Railway startup)
_seed_supabase_deals()

# In-memory store starts empty — real deals come from Supabase or user input.
# EMMA comparable bonds live in services/emma_seed_data.py (real CUSIP data — do not remove).


def _normalize_deal(d: dict) -> dict:
    """Ensure the in-memory deal dict has flat top-level fields the frontend expects."""
    project = d.get("project") or {}
    sponsor = d.get("sponsor") or {}
    # amount — prefer explicit flat field, fall back to project sub-object
    if "amount" not in d:
        d["amount"] = project.get("total_project_cost_usd", 0)
    # issuer — prefer explicit flat field, fall back to sponsor entity name
    if "issuer" not in d:
        d["issuer"] = sponsor.get("entity_name", "")
    # createdAt (camelCase) — what the frontend deal list renders
    if "createdAt" not in d:
        d["createdAt"] = d.get("created_at", "")
    return d


# ── Deal CRUD ───────────────────────────────────────────────────

@deals_bp.route("", methods=["POST"])
@require_auth()
def create_deal():
    body = request.get_json() or {}
    name = body.get("name")
    if not name:
        return _err("name is required")

    # Accept flat payload from the intake form OR the nested project/sponsor format.
    # Intake form sends: deal_type, sector, naics, borrower, sponsor (string),
    # sponsor_type, project_size, state, description, status at top level.
    project = body.get("project")
    if not project:
        project = {
            "asset_type": body.get("deal_type", "bond"),
            "state": body.get("state"),
            "city": body.get("market"),
            "total_project_cost_usd": float(body.get("project_size") or 0),
            "description": body.get("description", ""),
            "sector": body.get("sector"),
            "naics": body.get("naics"),
        }
    sponsor_raw = body.get("sponsor")
    sponsor = sponsor_raw if isinstance(sponsor_raw, dict) else {
        "entity_name": sponsor_raw or "",
        "type": body.get("sponsor_type", ""),
        "borrower": body.get("borrower", ""),
    }

    if _use_db():
        row = _deal_to_row(new_deal(name, project, sponsor))
        # Supabase row needs state + deal_type at top level for RLS/query
        row["state"] = project.get("state")
        row["deal_type"] = project.get("asset_type", "bond")
        row["bond_face"] = project.get("total_project_cost_usd", 0)
        row["notes"] = json.dumps({
            "project": project,
            "sponsor": sponsor,
            "slug": name.lower().replace(" ", "-"),
        })
        result = db.insert("deals", row)
        if result:
            deal = _row_to_deal(result[0] if isinstance(result, list) else result)
            # Mirror into in-memory dict for zero-latency subsequent reads
            with _lock:
                _deals[deal["id"]] = deal
            return _ok(deal, 201)
        # Supabase insert failed (table may not exist yet) — fall through to in-memory

    d = new_deal(name, project, sponsor)
    d["amount"] = project.get("total_project_cost_usd", 0)
    d["state"] = project.get("state")
    d["deal_type"] = project.get("asset_type", "bond")
    _normalize_deal(d)
    with _lock:
        _deals[d["id"]] = d
    return _ok(d, 201)


@deals_bp.route("", methods=["GET"])
@require_auth()
def list_deals():
    status = request.args.get("status")

    if _use_db():
        params = {"order": "created_at.desc"}
        if status:
            params["status"] = f"eq.{status}"
        rows = db.select("deals", params)
        deals_from_db = [_row_to_deal(r) for r in (rows or [])]
        if deals_from_db:
            return _ok(deals_from_db)
        # Supabase empty — fall through to seed data so workbench always has deals

    with _lock:
        result = [_normalize_deal(d) for d in _deals.values()]
    if status:
        result = [d for d in result if d["status"] == status]
    result.sort(key=lambda d: d.get("created_at", ""), reverse=True)
    return _ok(result)


@deals_bp.route("/<deal_id>", methods=["GET"])
@require_auth()
def get_deal(deal_id):
    if _use_db():
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if rows:
            return _ok(_row_to_deal(rows[0]))
        # Supabase miss — check in-memory dict (covers pre-Supabase seed IDs like "jacaranda-2025")
        with _lock:
            d = _deals.get(deal_id)
        if d:
            return _ok(_normalize_deal(d))
        return _err("Deal not found", 404)

    with _lock:
        d = _deals.get(deal_id)
    if not d:
        return _err("Deal not found", 404)
    return _ok(_normalize_deal(d))


@deals_bp.route("/<deal_id>", methods=["PATCH"])
@require_auth()
def update_deal(deal_id):
    body = request.get_json() or {}

    if _use_db():
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if not rows:
            return _err("Deal not found", 404)
        update_data = {}
        if "status" in body:
            mapped = _map_status(body["status"])
            if mapped in ("pipeline", "active", "closing", "closed", "dead"):
                update_data["status"] = mapped
        if "name" in body:
            update_data["name"] = body["name"]
        if "state" in body:
            update_data["state"] = body["state"]
        if "bond_face" in body:
            update_data["bond_face"] = body["bond_face"]
        if "dscr" in body:
            update_data["dscr"] = body["dscr"]
        if "ltv" in body:
            update_data["ltv"] = body["ltv"]
        if "readiness_score" in body:
            update_data["readiness_score"] = body["readiness_score"]
        # Handle nested project/sponsor via notes column
        if "project" in body or "sponsor" in body or "team" in body:
            existing = _row_to_deal(rows[0])
            notes = {
                "project": {**existing.get("project", {}), **(body.get("project", {}))},
                "sponsor": {**existing.get("sponsor", {}), **(body.get("sponsor", {}))},
                "team": {**existing.get("team", {}), **(body.get("team", {}))},
                "slug": existing.get("slug", ""),
            }
            update_data["notes"] = json.dumps(notes)
            if "state" not in update_data and body.get("project", {}).get("state"):
                update_data["state"] = body["project"]["state"]
            if "market" not in update_data and body.get("project", {}).get("city"):
                update_data["market"] = body["project"]["city"]

        if update_data:
            db.update("deals", {"id": f"eq.{deal_id}"}, update_data)
        updated = db.select("deals", {"id": f"eq.{deal_id}"})
        return _ok(_row_to_deal(updated[0]))

    with _lock:
        d = _deals.get(deal_id)
        if not d:
            return _err("Deal not found", 404)
        if "status" in body and body["status"] in DEAL_STATUSES:
            d["status"] = body["status"]
        if "project" in body:
            d["project"].update(body["project"])
        if "sponsor" in body:
            d["sponsor"].update(body["sponsor"])
        if "team" in body:
            d["team"].update(body["team"])
        d["updated_at"] = _ts()
    return _ok(d)


# ── Bond Structure ──────────────────────────────────────────────

@deals_bp.route("/<deal_id>/bond", methods=["POST"])
@require_auth()
def create_bond(deal_id):
    if _use_db():
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if not rows:
            return _err("Deal not found", 404)
        deal = _row_to_deal(rows[0])
    else:
        with _lock:
            if deal_id not in _deals:
                return _err("Deal not found", 404)
            deal = _deals[deal_id]

    body = request.get_json() or {}
    structure_type = body.get("structure_type", "dual_tranche")
    series_input = body.get("series", [])
    series_list = []

    if not series_input:
        tpc = deal.get("project", {}).get("total_project_cost_usd", 0) or float(deal.get("bond_face", 100_000_000))
        a_face = tpc * 0.75
        b_face = tpc * 0.07
        series_list.append(new_series("A", a_face, 75, 7.0, 5))
        series_list.append(new_series("B", b_face, 82, 12.0, 5))
    else:
        for s in series_input:
            series_list.append(new_series(
                s.get("label", "A"), s.get("face_amount_usd", 0),
                s.get("ltc_pct", 75), s.get("coupon_rate_pct", 7.0),
                s.get("duration_years", 5),
            ))

    bond = new_bond_structure(deal_id, structure_type, series_list)
    total_face = sum(s["face_amount_usd"] for s in series_list)
    bond["capital_stack"] = {
        "total_raise_usd": total_face * 1.065,
        "project_proceeds_usd": total_face,
        "coupon_reserve_usd": total_face * 0.025,
        "surety_premium_usd": total_face * 0.015,
        "arrangement_fee_usd": total_face * 0.025,
        "contingency_usd": total_face * 0.005,
        "io_impound_usd": total_face * 0.02,
    }

    if _use_db():
        for s in series_list:
            db.insert("bond_structures", {
                "deal_id": deal_id,
                "tranche": s["label"],
                "amount": s["face_amount_usd"],
                "pct": s["ltc_pct"],
                "rate": f"{s['coupon_rate_pct']}%",
                "grade": s.get("rating_target"),
                "coupon": s["coupon_rate_pct"],
                "is_io": False,
            })
    else:
        with _lock:
            _bonds[deal_id] = bond

    return _ok(bond, 201)


@deals_bp.route("/<deal_id>/bond", methods=["GET"])
@require_auth()
def get_bond(deal_id):
    if _use_db():
        rows = db.select("bond_structures", {"deal_id": f"eq.{deal_id}", "order": "created_at.asc"})
        if not rows:
            return _err("No bond structure for this deal", 404)
        # Reconstruct bond structure from rows
        series_list = [{
            "series_id": r["id"],
            "label": r["tranche"],
            "face_amount_usd": float(r["amount"]),
            "ltc_pct": float(r.get("pct", 0)),
            "coupon_rate_pct": float(r.get("coupon", 0)),
            "rating_target": r.get("grade"),
            "is_io": r.get("is_io", False),
        } for r in rows]
        return _ok({
            "deal_id": deal_id,
            "series": series_list,
            "structure_type": "dual_tranche" if len(rows) == 2 else "multi_series",
        })

    with _lock:
        bond = _bonds.get(deal_id)
    if not bond:
        return _err("No bond structure for this deal", 404)
    return _ok(bond)


# ── Refi Cycles ─────────────────────────────────────────────────

@deals_bp.route("/<deal_id>/refi", methods=["POST"])
@require_auth()
def trigger_refi(deal_id):
    if _use_db():
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if not rows:
            return _err("Deal not found", 404)
        existing = db.select("refi_cycles", {"deal_id": f"eq.{deal_id}"})
        cycle_num = len(existing or []) + 1
        body = request.get_json() or {}
        result = db.insert("refi_cycles", {
            "deal_id": deal_id,
            "cycle_number": cycle_num,
            "status": "pending",
            "target_rate": body.get("trigger", {}).get("rate_at_trigger_pct"),
            "notes": json.dumps(body.get("trigger", {})),
        })
        if not result:
            return _err("Failed to create refi cycle", 500)
        return _ok(result[0] if isinstance(result, list) else result, 201)

    with _lock:
        if deal_id not in _deals:
            return _err("Deal not found", 404)
        bond = _bonds.get(deal_id)
        if not bond:
            return _err("No bond structure — create bond first", 400)
        existing = _refis.get(deal_id, [])
        cycle_num = len(existing) + 1
        refi = new_refi_cycle(deal_id, bond["id"], cycle_num)
        body = request.get_json() or {}
        if "trigger" in body:
            refi["trigger"].update(body["trigger"])
        existing.append(refi)
        _refis[deal_id] = existing
    return _ok(refi, 201)


@deals_bp.route("/<deal_id>/refis", methods=["GET"])
@require_auth()
def list_refis(deal_id):
    if _use_db():
        rows = db.select("refi_cycles", {"deal_id": f"eq.{deal_id}", "order": "cycle_number.asc"})
        return _ok(rows or [])

    with _lock:
        refis = _refis.get(deal_id, [])
    return _ok(refis)


# ── Covenants ───────────────────────────────────────────────────

@deals_bp.route("/<deal_id>/covenants", methods=["GET"])
@require_auth()
def get_covenants(deal_id):
    if _use_db():
        rows = db.select("covenants", {"deal_id": f"eq.{deal_id}"})
        return _ok(rows or [])

    with _lock:
        covs = _covenants.get(deal_id, [])
    return _ok(covs)


@deals_bp.route("/<deal_id>/covenants/test", methods=["POST"])
@require_auth()
def test_covenants(deal_id):
    body = request.get_json() or {}
    metrics = body.get("metrics", {})

    if _use_db():
        covs = db.select("covenants", {"deal_id": f"eq.{deal_id}"})
        if not covs:
            # Create default covenants in DB
            defaults = [
                ("dscr", "minimum", 1.5, "quarterly"),
                ("ltv", "maximum", 75, "quarterly"),
                ("cash_flow_leverage", "maximum", 2.0, "quarterly"),
                ("balance_sheet_leverage", "maximum", 2.5, "quarterly"),
                ("debt_to_ebitda", "maximum", 6.5, "quarterly"),
                ("interest_coverage_ratio", "minimum", 2.25, "quarterly"),
            ]
            for cov_type, _, thresh, freq in defaults:
                db.insert("covenants", {
                    "deal_id": deal_id,
                    "covenant_type": cov_type,
                    "description": f"{cov_type} {_} {thresh}",
                    "threshold_value": thresh,
                    "test_frequency": freq,
                    "in_compliance": True,
                })
            covs = db.select("covenants", {"deal_id": f"eq.{deal_id}"})

        results = []
        for cov in (covs or []):
            metric_val = metrics.get(cov["covenant_type"], 0)
            threshold = float(cov["threshold_value"] or 0)
            # Determine pass/fail based on covenant type name
            if "minimum" in (cov.get("description", "") or ""):
                passed = metric_val >= threshold
            else:
                passed = metric_val <= threshold
            db.update("covenants", {"id": f"eq.{cov['id']}"}, {
                "current_value": metric_val,
                "in_compliance": passed,
            })
            results.append({
                "covenant_id": cov["id"],
                "metric": cov["covenant_type"],
                "value": metric_val,
                "threshold": threshold,
                "passed": passed,
                "status": "green" if passed else "red",
            })
        return _ok(results)

    # In-memory fallback
    with _lock:
        covs = _covenants.get(deal_id, [])
        if not covs:
            bond = _bonds.get(deal_id)
            if bond:
                covs = _default_covenants(deal_id, bond["id"])
                _covenants[deal_id] = covs

    results = []
    for cov in covs:
        metric_val = metrics.get(cov["metric"], cov.get("last_test_value", 0))
        threshold = cov["threshold_value"]
        if cov["threshold_type"] == "minimum":
            passed = metric_val >= threshold
        else:
            passed = metric_val <= threshold
        cov["last_test_date"] = _ts()
        cov["last_test_value"] = metric_val
        cov["status"] = "green" if passed else "red"
        results.append({
            "covenant_id": cov["id"],
            "metric": cov["metric"],
            "value": metric_val,
            "threshold": threshold,
            "threshold_type": cov["threshold_type"],
            "passed": passed,
            "status": cov["status"],
        })
    return _ok(results)


def _default_covenants(deal_id, bond_id):
    defaults = [
        ("dscr", "minimum", 1.5, "quarterly"),
        ("ltv", "maximum", 75, "quarterly"),
        ("cash_flow_leverage", "maximum", 2.0, "quarterly"),
        ("balance_sheet_leverage", "maximum", 2.5, "quarterly"),
        ("debt_to_ebitda", "maximum", 6.5, "quarterly"),
        ("interest_coverage_ratio", "minimum", 2.25, "quarterly"),
        ("occupancy_pct", "minimum", 60, "monthly"),
    ]
    covs = []
    for metric, thresh_type, thresh_val, freq in defaults:
        covs.append({
            "id": str(_uuid.uuid4()),
            "deal_id": deal_id,
            "bond_structure_id": bond_id,
            "covenant_type": "financial_maintenance",
            "metric": metric,
            "threshold_type": thresh_type,
            "threshold_value": thresh_val,
            "test_frequency": freq,
            "last_test_date": None,
            "last_test_value": None,
            "status": "green",
            "cure_period_days": 30,
            "cure_deadline": None,
            "breach_history": [],
        })
    return covs


# ── Readiness Checklist ─────────────────────────────────────────

@deals_bp.route("/<deal_id>/checklist", methods=["GET"])
@require_auth()
def get_checklist(deal_id):
    if _use_db():
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if not rows:
            return _err("Deal not found", 404)
        deal = _row_to_deal(rows[0])
        return _ok({
            "checklist": deal["readiness_checklist"],
            "readiness_score": deal["readiness_score"],
        })

    with _lock:
        d = _deals.get(deal_id)
    if not d:
        return _err("Deal not found", 404)
    return _ok({
        "checklist": d["readiness_checklist"],
        "readiness_score": d["readiness_score"],
    })


@deals_bp.route("/<deal_id>/checklist", methods=["PATCH"])
@require_auth()
def update_checklist(deal_id):
    body = request.get_json() or {}

    if _use_db():
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if not rows:
            return _err("Deal not found", 404)
        deal = _row_to_deal(rows[0])
        checklist = deal["readiness_checklist"]
        for key, val in body.items():
            if key in checklist:
                checklist[key] = val
        score = compute_readiness_score(checklist)
        db.update("deals", {"id": f"eq.{deal_id}"}, {
            "checklist": json.dumps(checklist),
            "readiness_score": score,
        })
        return _ok({"checklist": checklist, "readiness_score": score})

    with _lock:
        d = _deals.get(deal_id)
        if not d:
            return _err("Deal not found", 404)
        for key, val in body.items():
            if key in d["readiness_checklist"]:
                d["readiness_checklist"][key] = val
        d["readiness_score"] = compute_readiness_score(d["readiness_checklist"])
        d["updated_at"] = _ts()
    return _ok({
        "checklist": d["readiness_checklist"],
        "readiness_score": d["readiness_score"],
    })


# ── Memo Generation ─────────────────────────────────────────────

@deals_bp.route("/<deal_id>/memo", methods=["POST"])
@require_auth()
def generate_memo(deal_id):
    if _use_db():
        rows = db.select("deals", {"id": f"eq.{deal_id}"})
        if not rows:
            return _err("Deal not found", 404)
        d = _row_to_deal(rows[0])
        bond_rows = db.select("bond_structures", {"deal_id": f"eq.{deal_id}"})
        bond = bond_rows if bond_rows else None
    else:
        with _lock:
            d = _deals.get(deal_id)
        if not d:
            return _err("Deal not found", 404)
        bond = _bonds.get(deal_id)

    body = request.get_json() or {}
    memo_type = body.get("memo_type", "executive_summary")
    morgan = current_app.config.get("MORGAN")
    if not morgan:
        return _err("Morgan agent not initialized", 500)
    valid_types = [
        "credit_memo", "executive_summary", "investor_teaser",
        "refi_notice", "term_sheet_cover"
    ]
    content_type = memo_type if memo_type in valid_types else "executive_summary"
    context = {"deal": d, "bond": bond, "memo_type": memo_type}
    result = morgan.generate(content_type, context)
    return _ok(result)


# ── Pipeline Metrics ────────────────────────────────────────────

@deals_bp.route("/pipeline", methods=["GET"])
@require_auth()
def pipeline():
    if _use_db():
        rows = db.select("deals") or []
        active = [r for r in rows if r.get("status") != "closed"]
        total_usd = sum(float(r.get("bond_face", 0)) for r in active)
        by_status = {}
        for r in rows:
            s = r.get("status", "unknown")
            by_status[s] = by_status.get(s, 0) + 1
        return _ok({
            "total_pipeline_usd": total_usd,
            "deal_count": len(active),
            "by_status": by_status,
        })

    with _lock:
        deals_list = list(_deals.values())
    active = [d for d in deals_list if d["status"] != "closed"]
    total_usd = sum(
        d.get("project", {}).get("total_project_cost_usd", 0) for d in active
    )
    by_status = {}
    for d in deals_list:
        s = d.get("status", "unknown")
        by_status[s] = by_status.get(s, 0) + 1
    return _ok({
        "total_pipeline_usd": total_usd,
        "deal_count": len(active),
        "by_status": by_status,
    })
