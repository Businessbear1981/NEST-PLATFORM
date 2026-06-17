"""
SendGrid email delivery service for NEST deal distribution.
Uses SendGrid's Web API v3 via httpx (already in requirements).
Requires SENDGRID_API_KEY env var. Falls back to dry-run if key absent.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

SENDGRID_API = "https://api.sendgrid.com/v3/mail/send"
FROM_EMAIL = os.environ.get("SENDGRID_FROM_EMAIL", "deals@ardanedgecapital.com")
FROM_NAME  = os.environ.get("SENDGRID_FROM_NAME", "NEST Advisors — Deal Desk")


def _api_key() -> Optional[str]:
    return os.environ.get("SENDGRID_API_KEY")


def send_deal_package(
    to_email: str,
    to_name: str,
    deal_name: str,
    teaser_text: str,
    subject: Optional[str] = None,
    reply_to: Optional[str] = None,
) -> dict:
    """
    Send a deal teaser to one recipient.
    Returns {"ok": True, "dry_run": bool, "status": int|None, "error": str|None}.
    """
    key = _api_key()
    dry_run = not bool(key)

    subj = subject or f"NEST Advisors — Deal Opportunity: {deal_name}"

    html_body = f"""
<!DOCTYPE html>
<html>
<body style="background:#030A06;color:#EDE8DC;font-family:'Georgia',serif;padding:40px;max-width:680px;margin:0 auto;">
  <div style="border-bottom:1px solid #C4A048;padding-bottom:16px;margin-bottom:28px;">
    <span style="font-family:'Courier New',monospace;font-size:11px;color:#7A9A82;letter-spacing:0.2em;text-transform:uppercase;">
      NEST ADVISORS · DEAL DESK · CONFIDENTIAL
    </span>
  </div>
  <h1 style="color:#C4A048;font-size:26px;margin:0 0 8px;">{deal_name}</h1>
  <div style="font-family:'Courier New',monospace;font-size:11px;color:#7A9A82;margin-bottom:28px;">
    INVESTOR TEASER · {datetime.utcnow().strftime("%B %d, %Y").upper()}
  </div>
  <div style="white-space:pre-wrap;line-height:1.7;color:#EDE8DC;font-size:15px;">{teaser_text}</div>
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #1E4A2E;">
    <p style="font-family:'Courier New',monospace;font-size:11px;color:#7A9A82;margin:0;">
      This communication is confidential and intended solely for the named recipient.
      NEST Advisors · Arden Edge Capital · {FROM_EMAIL}
    </p>
    <p style="font-family:'Courier New',monospace;font-size:10px;color:#2D6B3D;margin:8px 0 0;">
      To unsubscribe, reply with REMOVE in the subject line.
    </p>
  </div>
</body>
</html>"""

    payload = {
        "personalizations": [{"to": [{"email": to_email, "name": to_name}]}],
        "from": {"email": FROM_EMAIL, "name": FROM_NAME},
        "subject": subj,
        "content": [
            {"type": "text/plain", "value": teaser_text},
            {"type": "text/html",  "value": html_body},
        ],
    }
    if reply_to:
        payload["reply_to"] = {"email": reply_to}

    if dry_run:
        logger.info("[SendGrid DRY-RUN] Would send '%s' to %s <%s>", subj, to_name, to_email)
        return {"ok": True, "dry_run": True, "status": None, "error": None}

    try:
        resp = httpx.post(
            SENDGRID_API,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
            timeout=15,
        )
        ok = resp.status_code in (200, 202)
        if not ok:
            logger.warning("[SendGrid] %s → %d %s", to_email, resp.status_code, resp.text[:200])
        return {"ok": ok, "dry_run": False, "status": resp.status_code, "error": None if ok else resp.text[:300]}
    except Exception as exc:
        logger.exception("[SendGrid] delivery failed to %s", to_email)
        return {"ok": False, "dry_run": False, "status": None, "error": str(exc)}


def send_bulk_deal_package(
    recipients: list[dict],
    deal_name: str,
    teaser_text: str,
    subject: Optional[str] = None,
) -> list[dict]:
    """
    Send to multiple recipients. Each dict must have 'email' and 'name'.
    Returns per-recipient delivery results.
    """
    results = []
    for r in recipients:
        email = r.get("email") or r.get("contact_email") or ""
        name  = r.get("name") or r.get("firm") or email
        if not email:
            results.append({"recipient": name, "ok": False, "error": "no email address"})
            continue
        res = send_deal_package(email, name, deal_name, teaser_text, subject=subject)
        res["recipient"] = name
        res["email"] = email
        results.append(res)
    return results
