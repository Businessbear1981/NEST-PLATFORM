"""Bernard — the NEST action engine. Find-me, pitch, cost estimate, PO, preflight intake."""
import uuid
from flask import Blueprint, jsonify, request
from datetime import datetime
from services.bernard_findme import BernardFindMe
from services.pitch_generator import PitchGenerator
import services.preflight_service as preflight

bernard_bp = Blueprint("bernard", __name__)
_bernard = BernardFindMe()
_pitch = PitchGenerator()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": datetime.utcnow().isoformat()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": datetime.utcnow().isoformat()}), code


@bernard_bp.route("/find-me", methods=["POST"])
def find_me():
    body = request.get_json() or {}
    query = body.get("query", "")
    context = body.get("context", {})
    if not query:
        return _err("Provide a 'query' string")
    result = _bernard.find_me(query, context)
    return _ok(result)


@bernard_bp.route("/find-similar", methods=["POST"])
def find_similar():
    """Bernard ingests a document or parameters → finds similar deals.

    Two modes:
      1) Doc mode: body = {"document_text": "..."} OR {"document_url": "..."}
         Bernard runs doc_ingestion to extract entity + financials, then searches
         EMMA + EagleEye for comparable bonds and signals.
      2) Param mode: body = {"sector":"senior_living", "size_min":50000000,
         "size_max":250000000, "state":"FL", "asset_type":"CCRC", ...}
         Bernard searches comps directly on the parameters.

    Returns Bernard's natural-language narrative + structured EMMA comps,
    EagleEye matched signals, and an intent-derived watchlist.
    """
    body = request.get_json() or {}
    doc_text = body.get("document_text") or body.get("text")
    params = {k: v for k, v in body.items() if k not in ("document_text", "text", "document_url")}

    extracted = {}
    if doc_text:
        try:
            from services.doc_ingestion import DocumentIngestion
            di = DocumentIngestion()
            doc_type = di.classify(doc_text)
            extracted = di.extract(doc_text, doc_type=doc_type)
            entity = di.extract_entity_info(doc_text)
            prop = di.extract_property_intelligence(doc_text)
            extracted = {**(extracted or {}), "entity": entity, "property": prop, "doc_type": doc_type}
        except Exception as e:
            extracted = {"error": f"doc_ingestion failed: {e}"}

    # Build a query string for Bernard from params + extracted info
    sector = params.get("sector") or (extracted.get("property", {}) or {}).get("sector") or "real_estate"
    state = params.get("state") or (extracted.get("entity", {}) or {}).get("state")
    asset_type = params.get("asset_type") or (extracted.get("property", {}) or {}).get("asset_type")
    size_min = params.get("size_min") or 0
    size_max = params.get("size_max") or 0

    query_parts = []
    if asset_type:
        query_parts.append(f"{asset_type} deals")
    if sector:
        query_parts.append(f"in {sector}")
    if state:
        query_parts.append(f"in {state}")
    if size_min or size_max:
        query_parts.append(f"size {size_min}-{size_max}")
    query = " ".join(query_parts) or "comparable deals"

    bernard_result = _bernard.find_me(query, {**params, "extracted": extracted})

    # EMMA comps
    emma_comps = []
    try:
        from services.emma_engine import EMMAEngine
        emma = EMMAEngine()
        emma_comps = emma.find_comps(
            sector=sector or "",
            min_par=float(size_min or 0),
            max_par=float(size_max or float("inf")),
            state=state or "",
            limit=10,
        )
    except Exception as e:
        emma_comps = [{"error": f"emma find_comps failed: {e}"}]

    # EagleEye matching signals
    eagleeye_signals = []
    try:
        from services.eagleeye_service import eagleeye
        all_sigs = eagleeye.list_signals()
        eagleeye_signals = [
            s for s in all_sigs
            if (not sector or s.get("sector") == sector)
            and (not state or s.get("state") == state)
        ][:10]
    except Exception as e:
        eagleeye_signals = [{"error": f"eagleeye signals failed: {e}"}]

    return _ok({
        "narration": bernard_result.get("narrative") or bernard_result.get("answer"),
        "intent": bernard_result.get("intent"),
        "extracted_from_document": extracted,
        "emma_comps": emma_comps,
        "eagleeye_signals": eagleeye_signals,
        "watchlist": bernard_result.get("watchlist", []),
        "query_used": query,
    })


@bernard_bp.route("/pitch", methods=["POST"])
def generate_pitch():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    result = _pitch.generate_pitch(deal)
    return _ok(result)


@bernard_bp.route("/costs", methods=["POST"])
def estimate_costs():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    structure = body.get("structure", "base")
    result = _pitch.estimate_costs(deal, structure)
    return _ok(result)


@bernard_bp.route("/po", methods=["POST"])
def generate_po():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    costs = _pitch.estimate_costs(deal)
    po = _pitch.generate_purchase_order(deal, costs)
    return _ok(po)


@bernard_bp.route("/scenarios", methods=["POST"])
def bond_scenarios():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    result = _pitch.generate_bond_scenarios(deal)
    return _ok(result)


@bernard_bp.route("/readiness", methods=["POST"])
def assess_readiness():
    body = request.get_json() or {}
    deal = body.get("deal", body)
    result = _pitch.assess_readiness(deal)
    return _ok(result)


# ── Preflight — Conversational Deal Intake (Stage 0) ─────────────────────────

@bernard_bp.route("/preflight/start", methods=["POST"])
def start_preflight():
    body = request.get_json(silent=True) or {}
    session_id = str(uuid.uuid4())
    result = preflight.start_session(session_id, body.get("context", ""))
    return _ok(result)


@bernard_bp.route("/preflight/<session_id>/message", methods=["POST"])
def preflight_message(session_id):
    body = request.get_json(silent=True) or {}
    message = body.get("message", "")
    if not message:
        return _err("message is required")
    result = preflight.continue_session(session_id, message)
    return _ok(result)


@bernard_bp.route("/preflight/<session_id>", methods=["GET"])
def get_preflight(session_id):
    session = preflight.get_session(session_id)
    if not session:
        return _err("Session not found", 404)
    return _ok(session)
