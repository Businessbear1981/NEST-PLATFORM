"""
EMMA Deep Integration API — Municipal bond intelligence layer.

Endpoints for searching EMMA, parsing Official Statements,
generating sector templates, and finding comparable transactions.
"""
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

emma_bp = Blueprint("emma", __name__)


def _ok(data):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    })


def _engine():
    engine = current_app.config.get("EMMA_ENGINE")
    if not engine:
        from services.emma_engine import EMMAEngine
        engine = EMMAEngine()
        current_app.config["EMMA_ENGINE"] = engine
    return engine


@emma_bp.get("/search")
def search():
    """Search EMMA for municipal bond issues."""
    issuer = request.args.get("issuer", "")
    cusip = request.args.get("cusip", "")
    state = request.args.get("state", "")
    sector = request.args.get("sector", "")
    q = request.args.get("q", "")
    limit = int(request.args.get("limit", 20))
    # If ?q= is provided, route through search_emma_bonds (real MSRB + EDGAR)
    if q:
        results = _engine().search_emma_bonds(q, sector=sector or None)
        if state:
            results = [r for r in results if (r.get("state") or "").upper() == state.upper()]
        return _ok({"results": results[:limit], "count": min(len(results), limit), "source": "msrb_live"})
    results = _engine().search(issuer=issuer, cusip=cusip, state=state, sector=sector, limit=limit)
    return _ok({"results": results, "count": len(results)})


@emma_bp.get("/bonds")
def bonds():
    """Bond search endpoint.

    ?q=<query>  → call MSRB issuer search + EDGAR fallback (live)
    (no query)  → return PARSED_BONDS seed database
    """
    q = request.args.get("q", "").strip()
    sector = request.args.get("sector", "")
    state = request.args.get("state", "")
    limit = int(request.args.get("limit", 20))

    if q:
        results = _engine().search_emma_bonds(q, sector=sector or None)
        if state:
            results = [r for r in results if (r.get("state") or "").upper() == state.upper()]
        return _ok({"results": results[:limit], "count": min(len(results), limit), "source": "msrb_live"})

    # No query — return seed parsed bonds from emma_seed_data
    from services.emma_engine import PARSED_BONDS
    seed = PARSED_BONDS
    if sector:
        seed = [b for b in seed if b.get("sector") == sector]
    if state:
        seed = [b for b in seed if (b.get("state") or "").upper() == state.upper()]
    return _ok({"results": seed[:limit], "count": min(len(seed), limit), "source": "parsed_bonds"})


@emma_bp.get("/bonds/<cusip>")
def bond_detail(cusip: str):
    """Look up a specific CUSIP on EMMA SecurityView."""
    result = _engine().get_bond_detail(cusip)
    return _ok(result)


@emma_bp.post("/parse")
def parse_os():
    """Parse an Official Statement into structured bond profile."""
    body = request.get_json(silent=True) or {}
    text = body.get("text", "")
    source_url = body.get("source_url", "")
    if not text:
        return jsonify({"success": False, "error": "text required (Official Statement content)", "timestamp": datetime.utcnow().isoformat()}), 400
    result = _engine().parse_official_statement(text, source_url)
    return _ok(result)


@emma_bp.get("/templates")
def templates():
    """Get default bond structure template for a sector."""
    sector = request.args.get("sector", "senior_living")
    min_par = float(request.args.get("min_par", 0))
    max_par = float(request.args.get("max_par", 1e12))
    result = _engine().generate_template(sector, min_par, max_par)
    return _ok(result)


@emma_bp.get("/templates/sectors")
def template_sectors():
    """List all sectors with available templates."""
    from services.emma_engine import SECTOR_NAICS_MAP
    return _ok({
        "sectors": list(SECTOR_NAICS_MAP.keys()) + ["corporate_ma", "working_capital", "equipment"],
        "naics_map": SECTOR_NAICS_MAP,
    })


@emma_bp.get("/comps")
def comps():
    """Find comparable bond transactions."""
    sector = request.args.get("sector", "")
    min_par = float(request.args.get("min_par", 0))
    max_par = float(request.args.get("max_par", 1e12))
    rating = request.args.get("rating", "")
    state = request.args.get("state", "")
    tax_status = request.args.get("tax_status", "")
    limit = int(request.args.get("limit", 20))
    results = _engine().find_comps(
        sector=sector, min_par=min_par, max_par=max_par,
        rating=rating, state=state, tax_status=tax_status, limit=limit,
    )
    return _ok({"comps": results, "count": len(results)})


@emma_bp.get("/stats")
def stats():
    """Parsed bond database statistics."""
    return _ok(_engine().stats())


@emma_bp.post("/poll")
def poll():
    """Trigger a polling cycle for new EMMA filings."""
    body = request.get_json(silent=True) or {}
    sector = body.get("sector", "senior living")
    limit = int(body.get("limit", 10))
    result = _engine().poll(sector, limit)
    return _ok(result)
