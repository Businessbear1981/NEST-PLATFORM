from flask import Blueprint, current_app, jsonify, request
from datetime import datetime

from agents.morgan import CONTENT_TYPES
from services.auth import require_auth

try:
    from services.database import db as _db
except ImportError:
    _db = None

marketing_bp = Blueprint("marketing", __name__)


def _morgan():
    return current_app.config["MORGAN"]


def _aria():
    return current_app.config["ARIA"]


def _sterling():
    return current_app.config["STERLING"]


# ---------- Morgan (content) ----------

@marketing_bp.get("/content-types")
def content_types():
    return jsonify([
        {"value": k, "label": v["label"]} for k, v in CONTENT_TYPES.items()
    ])


@marketing_bp.post("/generate")
def generate():
    body = request.get_json(silent=True) or {}
    content_type = body.get("content_type")
    context = body.get("context") or {}
    if not content_type:
        return jsonify({"error": "content_type required"}), 400
    try:
        record = _morgan().generate(content_type, context)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify(record)


@marketing_bp.post("/batch")
def batch():
    body = request.get_json(silent=True) or {}
    deal_id = body.get("deal_id")
    context = body.get("context") or {}
    if not deal_id:
        return jsonify({"error": "deal_id required"}), 400
    return jsonify(_morgan().generate_batch(deal_id, context))


@marketing_bp.get("/history")
def history():
    """
    Return generation history. Reads from Supabase correspondence table
    (where corr_type='generated_content') if available; falls back to
    Morgan's in-memory history, then [].
    """
    limit = int(request.args.get("limit", 50))

    # Try Supabase correspondence table first
    if _db and _db.configured:
        try:
            rows = _db.select("correspondence", {
                "corr_type": "eq.generated_content",
                "order": "created_at.desc",
                "limit": str(limit),
            }) or []
            if rows:
                return jsonify(rows)
        except Exception:
            pass

    # Fall back to Morgan's in-memory history
    try:
        return jsonify(_morgan().history(limit=limit))
    except Exception:
        return jsonify([])


@marketing_bp.get("/history/<gen_id>")
@require_auth("admin")
def history_one(gen_id: str):
    rec = _morgan().get(gen_id)
    if rec is None:
        return jsonify({"error": "not_found"}), 404
    return jsonify(rec)


# ---------- Aria (outreach) ----------

@marketing_bp.post("/outreach")
@require_auth("admin")
def outreach():
    """Aria-backed: draft and (symbolically) send an outreach email."""
    body = request.get_json(silent=True) or {}
    lead_id = body.get("lead_id")
    attempt = int(body.get("attempt", 1))
    if not lead_id:
        return jsonify({"error": "lead_id required"}), 400
    try:
        draft = _aria().generate_follow_up(lead_id, attempt)
    except KeyError:
        return jsonify({"error": "lead_not_found"}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    draft["sent"] = bool(body.get("send", False))
    return jsonify(draft)


@marketing_bp.post("/proposal")
@require_auth("admin")
def proposal():
    body = request.get_json(silent=True) or {}
    lead_id = body.get("lead_id")
    concept = body.get("deal_concept")
    if not lead_id:
        return jsonify({"error": "lead_id required"}), 400
    try:
        return jsonify(_aria().draft_proposal(lead_id, concept))
    except KeyError:
        return jsonify({"error": "lead_not_found"}), 404


@marketing_bp.post("/inbound/classify")
@require_auth("admin")
def classify_inbound():
    body = request.get_json(silent=True) or {}
    msg = body.get("message", "")
    sender = body.get("sender")
    return jsonify(_aria().classify_inbound(msg, sender))


@marketing_bp.post("/intake")
def intake():
    body = request.get_json(silent=True) or {}
    try:
        return jsonify(_aria().intake(body))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@marketing_bp.get("/leads")
@require_auth("admin")
def leads():
    return jsonify(_aria().leads())


# ---------- Sterling (IR) ----------

@marketing_bp.get("/investors")
@require_auth("admin")
def investors():
    return jsonify(_sterling().investors())


@marketing_bp.post("/investors/match")
@require_auth("admin")
def match_investors():
    """
    Match investors to a deal.
    Frontend may send: { deal_id, deal: { name, angles } }
    Backend needs:     { size_usd, asset_class, projected_yield_pct }

    Resolution order:
      1. If deal_id provided and Supabase is live → pull deal record for those fields
      2. Fall back to whatever fields the frontend passed inline
    """
    body = request.get_json(silent=True) or {}
    deal_id = body.get("deal_id")
    deal_inline = body.get("deal") or {}

    # Start with whatever the frontend sent
    deal_payload = {
        "size_usd": deal_inline.get("size_usd", 0),
        "asset_class": deal_inline.get("asset_class", ""),
        "projected_yield_pct": deal_inline.get("projected_yield_pct", 0),
        **deal_inline,
    }

    # Override with live Supabase data when deal_id is present
    if deal_id and _db and _db.configured:
        try:
            rows = _db.select("deals", {"id": f"eq.{deal_id}", "limit": "1"}) or []
            if rows:
                r = rows[0]
                bond_face = float(r.get("bond_face") or 0)
                deal_payload.update({
                    "size_usd": bond_face,
                    "asset_class": r.get("deal_type") or deal_inline.get("asset_class", ""),
                    "projected_yield_pct": float(r.get("coupon_pct") or r.get("projected_yield_pct") or 7.0),
                    "name": r.get("name") or deal_inline.get("name", ""),
                })
        except Exception:
            pass  # keep inline payload on DB error

    return jsonify(_sterling().match_investors(deal_payload))


@marketing_bp.post("/investors/update")
@require_auth("admin")
def investor_update():
    body = request.get_json(silent=True) or {}
    investor_id = body.get("investor_id")
    deal_id = body.get("deal_id")
    if not investor_id or not deal_id:
        return jsonify({"error": "investor_id and deal_id required"}), 400
    try:
        return jsonify(_sterling().generate_investor_update(investor_id, deal_id, body.get("deal")))
    except KeyError:
        return jsonify({"error": "investor_not_found"}), 404


@marketing_bp.post("/book/indication")
@require_auth("admin")
def book_indication():
    body = request.get_json(silent=True) or {}
    return jsonify(_sterling().add_indication(
        body.get("deal_id"), body.get("investor_id"), body.get("amount", 0)
    ))


@marketing_bp.post("/book/build")
@require_auth("admin")
def book_build():
    body = request.get_json(silent=True) or {}
    return jsonify(_sterling().manage_book_building(
        body.get("deal_id"), body.get("target_raise")
    ))


# ---------- AI Distribution: Morgan → Sterling → SendGrid ----------

@marketing_bp.post("/distribute")
@require_auth("admin")
def distribute():
    """
    Full automation: generate deal package via Morgan, match investors via
    Sterling, deliver teaser to each qualified partner via SendGrid.

    Body: { deal_id, context?, deal?, send_email? }
      context  — forwarded to Morgan batch generator
      deal     — deal dict for Sterling matching (size_usd, asset_class, projected_yield_pct)
      send_email — default True; set False for dry-run preview
    """
    from services.sendgrid_service import send_bulk_deal_package

    body = request.get_json(silent=True) or {}
    deal_id = body.get("deal_id")
    if not deal_id:
        return jsonify({"success": False, "error": "deal_id required"}), 400

    context      = body.get("context") or {}
    deal_meta    = body.get("deal") or {}
    send_email   = body.get("send_email", True)

    # 1 — Generate the 4-piece marketing package
    try:
        package = _morgan().generate_batch(deal_id, context)
    except Exception as exc:
        return jsonify({"success": False, "error": f"Morgan batch failed: {exc}"}), 500

    # 2 — Pull teaser content (investor_teaser piece preferred, else executive_summary)
    pieces    = package.get("pieces", {})
    teaser    = pieces.get("investor_teaser") or pieces.get("executive_summary") or ""
    deal_name = context.get("deal_name") or deal_meta.get("name") or deal_id

    # 3 — Match investors via Sterling
    match_payload = {
        "size_usd":             deal_meta.get("size_usd", 0),
        "asset_class":          deal_meta.get("asset_class", ""),
        "projected_yield_pct":  deal_meta.get("projected_yield_pct", 0),
        **deal_meta,
    }
    matched = _sterling().match_investors(match_payload)
    qualified = [m for m in matched if m.get("score", 0) >= 30]

    # 4 — Deliver to qualified partners
    delivery_results: list[dict] = []
    if send_email and qualified:
        delivery_results = send_bulk_deal_package(
            recipients=qualified,
            deal_name=deal_name,
            teaser_text=teaser,
            subject=f"NEST Deal Desk — {deal_name}: Investor Opportunity",
        )
    elif not qualified:
        delivery_results = []

    delivered_count = sum(1 for r in delivery_results if r.get("ok"))
    dry_run_mode    = any(r.get("dry_run") for r in delivery_results) or not send_email

    return jsonify({
        "success":         True,
        "deal_id":         deal_id,
        "deal_name":       deal_name,
        "package_pieces":  list(pieces.keys()),
        "investors_matched": len(matched),
        "qualified_count": len(qualified),
        "delivered_count": delivered_count,
        "dry_run":         dry_run_mode,
        "delivery_results": delivery_results,
        "teaser_preview":  teaser[:500] if teaser else "",
    })
