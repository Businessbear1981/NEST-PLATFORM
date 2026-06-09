"""
World Labs — 3D spatial world generation for deal cards and investor teasers.
Generates aerial/property visualizations from address + deal context.
Graceful no-op when API key is absent.
"""
from __future__ import annotations

import logging
import os
from typing import Optional

import httpx

log = logging.getLogger(__name__)

_API_KEY  = os.environ.get("WORLD_LABS_API_KEY", "")
_BASE_URL = "https://api.worldlabs.ai/v1"
_TIMEOUT  = 30


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {_API_KEY}",
        "Content-Type": "application/json",
    }


def _no_key(context: str) -> dict:
    return {"world_available": False, "reason": "no_key", "context": context}


# ---------- public ----------

def generate_property_world(
    *,
    address: str,
    deal_name: str,
    asset_class: str = "",
    image_url: Optional[str] = None,
) -> dict:
    """
    Request a 3D world for a real estate deal property.
    Returns a world_id + scene_url when available, or a stub when not.
    """
    if not _API_KEY:
        return _no_key(deal_name)

    prompt = (
        f"Aerial view of {address}. "
        f"Asset class: {asset_class or 'commercial real estate'}. "
        "High resolution, realistic lighting, suitable for investor presentation."
    )
    payload: dict = {"prompt": prompt, "mode": "aerial", "quality": "high"}
    if image_url:
        payload["image_url"] = image_url

    try:
        r = httpx.post(f"{_BASE_URL}/worlds", headers=_headers(), json=payload, timeout=_TIMEOUT)
        if r.status_code in (200, 201, 202):
            data = r.json()
            world_id = data.get("id") or data.get("world_id", "")
            return {
                "world_available": True,
                "world_id": world_id,
                "status": data.get("status", "queued"),
                "scene_url": data.get("scene_url") or f"{_BASE_URL}/worlds/{world_id}/scene",
                "preview_url": data.get("preview_url"),
                "deal_name": deal_name,
                "address": address,
            }
        log.warning("World Labs %s: %s", r.status_code, r.text[:200])
        return {"world_available": False, "reason": f"api_error_{r.status_code}", "deal_name": deal_name}
    except httpx.HTTPError as e:
        log.error("World Labs network error: %s", e)
        return {"world_available": False, "reason": "network_error", "deal_name": deal_name}


def get_world_status(world_id: str) -> dict:
    """Poll a previously requested world for completion."""
    if not _API_KEY:
        return _no_key(world_id)
    try:
        r = httpx.get(f"{_BASE_URL}/worlds/{world_id}", headers=_headers(), timeout=_TIMEOUT)
        if r.status_code == 200:
            return r.json()
        return {"status": "error", "code": r.status_code}
    except httpx.HTTPError as e:
        return {"status": "network_error", "detail": str(e)}


def generate_teaser_world(
    *,
    deal_name: str,
    location: str,
    deal_type: str,
    size_usd: float,
) -> dict:
    """
    Hawkeye investor teaser — cinematic world for the deal overview card.
    """
    if not _API_KEY:
        return _no_key(deal_name)

    prompt = (
        f"Cinematic aerial world for a {deal_type} investment opportunity. "
        f"Location: {location}. "
        f"Deal size: ${size_usd:,.0f}. "
        "Professional investment presentation quality, dramatic lighting."
    )
    payload = {"prompt": prompt, "mode": "cinematic", "quality": "high"}

    try:
        r = httpx.post(f"{_BASE_URL}/worlds", headers=_headers(), json=payload, timeout=_TIMEOUT)
        if r.status_code in (200, 201, 202):
            data = r.json()
            world_id = data.get("id") or data.get("world_id", "")
            return {
                "world_available": True,
                "world_id": world_id,
                "status": data.get("status", "queued"),
                "scene_url": data.get("scene_url") or f"{_BASE_URL}/worlds/{world_id}/scene",
                "preview_url": data.get("preview_url"),
                "deal_name": deal_name,
            }
        return {"world_available": False, "reason": f"api_error_{r.status_code}"}
    except httpx.HTTPError as e:
        log.error("World Labs teaser error: %s", e)
        return {"world_available": False, "reason": "network_error"}
