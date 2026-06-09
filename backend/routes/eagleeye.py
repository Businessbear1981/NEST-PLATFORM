"""
NEST EagleEye Routes — Business Development & Deal Sourcing.
Pillar 1: Scans UCC filings, title reports, permits, EDGAR, market signals.
Live sources: EMMA, EDGAR, FINRA via EagleEyeService Scouts.
"""
from flask import Blueprint, jsonify, request
from services.auth import require_auth
from datetime import datetime
import threading
from services.deals import DealsRegistry
from services.eagleeye_intelligence import EagleEyeIntelligence
from services.operator_intelligence import OperatorIntelligence
from services.eagleeye_scanner import EagleEyeScanner
from services.eagleeye_service import eagleeye

eagleeye_bp = Blueprint("eagleeye", __name__)

_lock = threading.Lock()
_deals = DealsRegistry()
_intelligence = EagleEyeIntelligence()
_operator_intel = OperatorIntelligence()
_scanner = EagleEyeScanner()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None,
                    "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg,
                    "timestamp": datetime.utcnow().isoformat()}), code


@eagleeye_bp.route("/signals", methods=["GET"])
def list_signals():
    """All discovered deal signals from Supabase, sorted by score."""
    status_filter = request.args.get("status")
    signals = eagleeye.list_signals(status=status_filter)
    return _ok({
        "signals": signals,
        "total": len(signals),
        "hot": sum(1 for s in signals if s.get("status") == "hot"),
        "warm": sum(1 for s in signals if s.get("status") == "warm"),
    })


@eagleeye_bp.route("/signals/<signal_id>", methods=["GET"])
def get_signal(signal_id):
    from services.database import DatabaseService
    _db = DatabaseService()
    sig = _db.select("signals", {"id": f"eq.{signal_id}"}, single=True)
    if not sig:
        return _err("Signal not found", 404)
    return _ok(sig)


@eagleeye_bp.route("/signals/<signal_id>/status", methods=["PATCH"])
def update_signal_status(signal_id):
    b = request.get_json() or {}
    new_status = b.get("status")
    valid = ["hot", "warm", "review", "passed", "converted"]
    if new_status not in valid:
        return _err(f"Status must be one of: {valid}")
    from services.database import DatabaseService
    _db = DatabaseService()
    updated = _db.update("signals", {"id": f"eq.{signal_id}"}, {"status": new_status})
    if not updated:
        return _err("Signal not found or DB unavailable", 404)
    result = updated[0] if isinstance(updated, list) else updated
    return _ok(result)


# ── Scout routes ─────────────────────────────────────────────────

@eagleeye_bp.route("/scouts", methods=["GET"])
def list_scouts():
    """List all scout profiles."""
    scouts = eagleeye.list_scouts()
    return _ok({"scouts": scouts, "total": len(scouts)})


@eagleeye_bp.route("/scouts", methods=["POST"])
def create_scout():
    """Create a new Scout search profile."""
    b = request.get_json() or {}
    name = b.get("name")
    criteria = b.get("criteria", {})
    sources = b.get("sources", ["emma", "edgar", "finra"])
    if not name:
        return _err("Provide name")
    try:
        scout = eagleeye.create_scout(name, criteria, sources)
        return _ok(scout, 201)
    except Exception as exc:
        return _err(str(exc))


@eagleeye_bp.route("/scouts/<scout_id>/run", methods=["POST"])
def run_scout(scout_id):
    """Execute a scout — queries EMMA, EDGAR, FINRA, scores with Claude."""
    try:
        result = eagleeye.run_scout(scout_id)
        return _ok(result)
    except ValueError as exc:
        return _err(str(exc), 404)
    except Exception as exc:
        return _err(str(exc))


@eagleeye_bp.route("/scouts/from-deal/<deal_id>", methods=["POST"])
def create_scout_from_deal(deal_id):
    """Create a scout from an existing deal — 'find me more like this'."""
    try:
        scout = eagleeye.create_scout_from_deal(deal_id)
        return _ok(scout, 201)
    except ValueError as exc:
        return _err(str(exc), 404)
    except Exception as exc:
        return _err(str(exc))


# ── Prospects route ───────────────────────────────────────────────

@eagleeye_bp.route("/prospects", methods=["GET"])
def list_prospects():
    """Prospects auto-promoted from high-confidence signals (node_count >= 3)."""
    stage_filter = request.args.get("stage")
    prospects = eagleeye.list_prospects(stage=stage_filter)
    return _ok({"prospects": prospects, "total": len(prospects)})


@eagleeye_bp.route("/convert/<signal_id>", methods=["POST"])
def convert_to_deal(signal_id):
    """Convert a signal into a NEST deal — pushes to Roots."""
    from services.database import DatabaseService
    _db = DatabaseService()
    sig = _db.select("signals", {"id": f"eq.{signal_id}"}, single=True)
    if not sig:
        return _err("Signal not found", 404)

    raw = sig.get("raw_data") or {}

    # Build deal stub from signal metadata
    deal_stub = {
        "name": raw.get("entity_name") or raw.get("name") or sig.get("keyword", "Unknown Entity"),
        "source": "eagleeye",
        "signal_id": sig["id"],
        "scout_id": sig.get("scout_id"),
        "sector": sig.get("keyword"),
        "source_system": sig.get("source"),
        "status": "intake",
        "eagleeye_score": sig.get("score", 0),
        "node_hits": sig.get("node_hits", []),
        "summary": sig.get("summary", ""),
        "converted_at": datetime.utcnow().isoformat(),
    }

    # Mark signal as converted
    _db.update("signals", {"id": f"eq.{signal_id}"}, {"status": "converted"})

    return _ok(deal_stub)


@eagleeye_bp.route("/ipo-readiness", methods=["POST"])
def ipo_readiness():
    """Assess IPO readiness for a target company."""
    body = request.get_json() or {}
    from agents.merlin import merlin
    result = merlin.assess_ipo_readiness(body.get("target", {}))
    return _ok(result)


@eagleeye_bp.route("/stats", methods=["GET"])
def stats():
    signals = eagleeye.list_signals()
    prospects = eagleeye.list_prospects()
    scouts = eagleeye.list_scouts()
    hot = sum(1 for s in signals if s.get("status") == "hot")
    warm = sum(1 for s in signals if s.get("status") == "warm")
    converted = sum(1 for s in signals if s.get("status") == "converted")
    return _ok({
        "total_signals": len(signals),
        "total_prospects": len(prospects),
        "total_scouts": len(scouts),
        "hot": hot,
        "warm": warm,
        "converted": converted,
    })


# ── Cross-Deal Intelligence Engine ──────────────────────────────

@eagleeye_bp.route("/intelligence/report", methods=["GET"])
def intelligence_report():
    """Full cross-deal intelligence report across the entire pipeline."""
    deals = _deals.list_active(blind=False)
    report = _intelligence.generate_intelligence_report(deals)
    return _ok(report)


@eagleeye_bp.route("/intelligence/patterns", methods=["GET"])
def intelligence_patterns():
    """Cross-deal pattern detection — sectors, geography, size tiers."""
    deals = _deals.list_active(blind=False)
    patterns = _intelligence.detect_cross_deal_patterns(deals)
    return _ok({"patterns": patterns, "deal_count": len(deals)})


@eagleeye_bp.route("/intelligence/bond-angles", methods=["POST"])
def intelligence_bond_angles():
    """Find bond structuring angles for a specific deal."""
    body = request.get_json() or {}
    deal_id = body.get("deal_id")
    deal = body.get("deal")

    if deal:
        # Ad-hoc analysis on a deal payload
        angles = _intelligence.find_bond_angles(deal)
        return _ok(angles)

    if not deal_id:
        return _err("Provide deal_id or deal object")

    deal = _deals.get(deal_id)
    if not deal:
        return _err("Deal not found", 404)

    angles = _intelligence.find_bond_angles(deal)
    return _ok(angles)


@eagleeye_bp.route("/intelligence/ipo-tracker", methods=["POST"])
def intelligence_ipo_tracker():
    """Pre-IPO trajectory analysis for a deal."""
    body = request.get_json() or {}
    deal_id = body.get("deal_id")

    if not deal_id:
        return _err("Provide deal_id")

    deal = _deals.get(deal_id)
    if not deal:
        return _err("Deal not found", 404)

    trajectory = _intelligence.assess_ipo_trajectory(deal)
    return _ok(trajectory)


@eagleeye_bp.route("/intelligence/scores", methods=["GET"])
def intelligence_scores():
    """Score all active deals on attractiveness — ranked list."""
    deals = _deals.list_active(blind=False)
    scores = [_intelligence.score_deal_attractiveness(d) for d in deals]
    scores.sort(key=lambda s: s["score"], reverse=True)
    return _ok({
        "scores": scores,
        "deal_count": len(scores),
        "average_score": round(sum(s["score"] for s in scores) / max(len(scores), 1), 1),
    })


@eagleeye_bp.route("/pipeline", methods=["GET"])
def pipeline_view():
    """Enhanced pipeline — deals + intelligence scores + patterns."""
    deals = _deals.list_active(blind=False)
    scores_map = {}
    for d in deals:
        s = _intelligence.score_deal_attractiveness(d)
        scores_map[d["id"]] = s

    enriched = []
    for d in deals:
        entry = dict(d)
        entry["intelligence"] = scores_map.get(d["id"], {})
        enriched.append(entry)

    enriched.sort(key=lambda x: x.get("intelligence", {}).get("score", 0), reverse=True)

    patterns = _intelligence.detect_cross_deal_patterns(deals)

    return _ok({
        "deals": enriched,
        "deal_count": len(enriched),
        "total_pipeline_usd": sum(d.get("size_usd", 0) for d in deals),
        "patterns": patterns,
    })


@eagleeye_bp.route("/intelligence/pitch", methods=["POST"])
def intelligence_pitch():
    """Generate a client pitch for a specific deal, powered by cross-deal intelligence."""
    body = request.get_json() or {}
    deal_id = body.get("deal_id")

    if not deal_id:
        return _err("Provide deal_id")

    deal = _deals.get(deal_id)
    if not deal:
        return _err("Deal not found", 404)

    all_deals = _deals.list_active(blind=False)
    pitch = _intelligence.generate_deal_pitch(deal, all_deals)

    # Attach a World Labs 3D property world if address is available
    address = deal.get("address") or deal.get("location") or ""
    if address:
        from services.world_labs import generate_property_world
        pitch["world_labs"] = generate_property_world(
            address=address,
            deal_name=deal.get("name", ""),
            asset_class=deal.get("asset_class") or deal.get("sector", ""),
        )

    return _ok(pitch)


# ── Operator Intelligence ─────────────────────────────────────────

@eagleeye_bp.route("/operators", methods=["GET"])
def list_operators():
    """List all tracked operators with summary data."""
    result = _scanner.scan_all_operators()
    return _ok(result)


@eagleeye_bp.route("/operators/<operator_key>", methods=["GET"])
def get_operator(operator_key):
    """Full portfolio scan for a specific operator."""
    result = _scanner.scan_operator(operator_key)
    if not result.get("success"):
        return _err(result.get("error", "Operator not found"), 404)
    return _ok(result)


@eagleeye_bp.route("/operators/<operator_key>/pitch", methods=["GET"])
def get_operator_pitch(operator_key):
    """Generate an operator-specific pitch package."""
    result = _operator_intel.generate_operator_pitch(operator_key)
    if not result.get("success"):
        return _err(result.get("error", "Operator not found"), 404)
    return _ok(result)


@eagleeye_bp.route("/operators/by-signal", methods=["GET"])
def operators_by_signal():
    """Find operators matching a specific signal type."""
    signal_type = request.args.get("signal")
    if not signal_type:
        return _err("Provide 'signal' query param (construction_maturing, occupancy_below_benchmark, refi_opportunity, expansion_planned, distressed)")
    results = _operator_intel.find_operators_by_signal(signal_type)
    if results and isinstance(results[0], dict) and not results[0].get("success", True):
        return _err(results[0].get("error", "Unknown signal type"))
    return _ok({"signal_type": signal_type, "operators": results, "total": len(results)})


@eagleeye_bp.route("/operators/learning-loop", methods=["POST"])
def operator_learning_loop():
    """Run self-learning loop across deals and docs for action items."""
    deals = _deals.list_active(blind=False)
    body = request.get_json() or {}
    docs = body.get("docs", [])
    result = _operator_intel.self_learning_loop(deals, docs)
    return _ok(result)


@eagleeye_bp.route("/benchmarks/multifamily", methods=["GET"])
def multifamily_benchmarks():
    """Return current multifamily market benchmarks."""
    result = _scanner.get_market_benchmarks()
    return _ok(result)
