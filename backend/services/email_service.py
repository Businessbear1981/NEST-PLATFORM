"""
NEST Email Service — SendGrid adapter.
If SENDGRID_API_KEY is empty, emails are logged but not sent (safe for dev/demo).
"""
from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any

import httpx

log = logging.getLogger(__name__)

_SENDGRID_KEY = os.environ.get("SENDGRID_API_KEY", "")
_FROM_EMAIL = os.environ.get("NEST_FROM_EMAIL", "nest@ardanedgecapital.com")
_FROM_NAME = os.environ.get("NEST_FROM_NAME", "NEST Advisors")
_SENDGRID_API = "https://api.sendgrid.com/v3/mail/send"


def send_email(
    *,
    to_email: str,
    to_name: str = "",
    subject: str,
    body_html: str,
    body_text: str = "",
    reply_to: str = "",
    category: str = "outreach",
) -> dict[str, Any]:
    """
    Send an email via SendGrid.
    Returns {"sent": True/False, "message_id": str, "status": str}.
    If API key is not set, logs the email and returns {"sent": False, "status": "no_key"}.
    """
    if not _SENDGRID_KEY:
        log.warning(
            "SENDGRID_API_KEY not set — email to %s queued as draft: %s",
            to_email, subject
        )
        return {
            "sent": False,
            "status": "no_key",
            "to": to_email,
            "subject": subject,
            "drafted_at": datetime.utcnow().isoformat(),
        }

    payload: dict[str, Any] = {
        "personalizations": [
            {
                "to": [{"email": to_email, "name": to_name or to_email.split("@")[0]}],
                "subject": subject,
            }
        ],
        "from": {"email": _FROM_EMAIL, "name": _FROM_NAME},
        "content": [],
        "categories": [category],
        "tracking_settings": {
            "click_tracking": {"enable": True},
            "open_tracking": {"enable": True},
        },
    }

    if reply_to:
        payload["reply_to"] = {"email": reply_to}

    if body_text:
        payload["content"].append({"type": "text/plain", "value": body_text})
    payload["content"].append({"type": "text/html", "value": body_html or f"<p>{body_text}</p>"})

    try:
        resp = httpx.post(
            _SENDGRID_API,
            headers={
                "Authorization": f"Bearer {_SENDGRID_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=15,
        )
        if resp.status_code in (200, 202):
            message_id = resp.headers.get("X-Message-Id", "")
            log.info("Email sent to %s — message_id=%s", to_email, message_id)
            return {"sent": True, "status": "delivered", "message_id": message_id, "to": to_email}
        else:
            log.error("SendGrid error %s: %s", resp.status_code, resp.text[:300])
            return {"sent": False, "status": f"sendgrid_error_{resp.status_code}", "to": to_email}
    except httpx.HTTPError as exc:
        log.error("SendGrid network error: %s", exc)
        return {"sent": False, "status": "network_error", "to": to_email}


def send_outreach(
    *,
    to_email: str,
    to_name: str,
    subject: str,
    draft_content: str,
    lead_id: str = "",
) -> dict[str, Any]:
    """Convenience wrapper for Aria outreach emails."""
    html = draft_content.replace("\n", "<br>")
    result = send_email(
        to_email=to_email,
        to_name=to_name,
        subject=subject,
        body_html=f"<div style='font-family:Georgia,serif;max-width:600px'>{html}</div>",
        body_text=draft_content,
        category="aria_outreach",
    )
    result["lead_id"] = lead_id
    return result
