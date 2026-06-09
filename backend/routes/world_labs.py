"""World Labs — 3D world generation endpoints."""
from datetime import datetime

from flask import Blueprint, jsonify, request

from services.world_labs import generate_property_world, generate_teaser_world, get_world_status

world_labs_bp = Blueprint("world_labs", __name__)


def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


@world_labs_bp.post("/property")
def property_world():
    """Generate a 3D aerial world for a deal property address."""
    body = request.get_json(silent=True) or {}
    address = (body.get("address") or "").strip()
    if not address:
        return _err("address is required")
    result = generate_property_world(
        address=address,
        deal_name=body.get("deal_name", ""),
        asset_class=body.get("asset_class", ""),
        image_url=body.get("image_url"),
    )
    return _ok(result, 202 if result.get("status") == "queued" else 200)


@world_labs_bp.post("/teaser")
def teaser_world():
    """Generate a cinematic world for an investor teaser."""
    body = request.get_json(silent=True) or {}
    deal_name = (body.get("deal_name") or "").strip()
    if not deal_name:
        return _err("deal_name is required")
    result = generate_teaser_world(
        deal_name=deal_name,
        location=body.get("location", ""),
        deal_type=body.get("deal_type", "commercial real estate"),
        size_usd=float(body.get("size_usd", 0)),
    )
    return _ok(result, 202 if result.get("status") == "queued" else 200)


@world_labs_bp.get("/worlds/<world_id>")
def world_status(world_id: str):
    """Poll a world generation job for completion."""
    return _ok(get_world_status(world_id))
