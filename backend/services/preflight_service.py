"""
Preflight Service — Bernard-driven conversational deal intake (Stage 0 / Inbound & Triage).

Not a form. A conversation.

Bernard acts as a senior JPMorgan investment banker conducting a live deal interview.
He asks one focused question at a time, builds context across turns, and when he has
enough to make a call, produces structured JSON deal parameters and auto-creates the
deal record in Supabase.

Sessions are ephemeral (in-memory dict). Deals persist to Supabase.

Flow:
  1. POST /bernard/preflight/start          → session_id + Bernard's opening question
  2. POST /bernard/preflight/<id>/message   → continue conversation, get next question
  3. When Bernard has enough data he emits JSON in his response — service parses it,
     creates deal record, and sets session status = "complete"

Bernard's JSON output shape (when ready):
  {
    "deal_parameters": { ... },
    "risk_flags": [ ... ],
    "recommended_structure": { ... },
    "draft_feasibility_summary": "...",
    "draft_rating_memo_outline": "..."
  }
"""
from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from typing import Any

from agents._claude import _get_client, _backend, Config
from services.database import db

# ── System Prompt ───────────────────────────────────────────────────────────

PREFLIGHT_SYSTEM_PROMPT = """You are Bernard — CEO of NEST Advisors and the firm's lead deal intake officer. \
NEST is a digital commercial investment bank specializing in private bond structuring, PE fund, and M&A intelligence.

Your job right now: conduct a live deal intake interview. This is Stage 0 — Inbound and Triage.

RULES:
- Ask ONE question per response. Never cluster multiple questions.
- Lead with your question. No preamble, no throat-clearing.
- If the answer is thin or evasive, follow up before moving on.
- When you have enough data (typically 8-15 exchanges) produce the structured JSON below.
- Until you produce JSON, NEVER summarize "what we've covered so far."
- Use Jimmy Lee tone: direct, decisive, no hedging. Banned words: may, might, could, potentially, approximately, it seems.

QUESTION SEQUENCE (adapt based on deal type — these are the mandatory threads):
  1. "What's the deal? Give me the one-sentence version — what are we financing and for whom."
  2. NOI / EBITDA: "What's the NOI? Trailing 12-month or projected? Give me the actual number."
  3. Occupancy / Utilization: "Occupancy — stabilized or still in lease-up? If lease-up, what's the absorption timeline and the comp set supporting it?"
  4. Capital request: "What's the total bond ask and the primary use of proceeds — acquisition, construction, refinance, or a blend?"
  5. LTV / Appraisal: "What's the current appraised value and when was the appraisal done? MAI-certified?"
  6. Debt service: "Debt service coverage at your target coupon — have you run the math? What rate are you modeling?"
  7. Sponsor track record: "Sponsor track record — how many similar projects closed and performing? Any defaults or workouts in the last 5 years?"
  8. Entity / Tax status: "Legal entity and tax-exempt eligibility — 501(c)(3), private activity bond eligible under IRC §142, or taxable?"
  9. Timeline: "When do you need commitment and what external deadline is driving the clock?"
  10. Enhancement: "Are you expecting credit enhancement — surety, LC, bond insurance — or are we going standalone on native credit?"
  11. Equity contribution: "How much equity is the sponsor putting in at closing? Cash or rolled?"
  12. Risk: "What's the single biggest risk in this deal and what's the mitigant?"

After collecting answers across these threads, produce EXACTLY this JSON block (fenced with ```json ... ```):

```json
{
  "deal_parameters": {
    "deal_name": "",
    "deal_type": "",
    "borrower_name": "",
    "property_type": "",
    "location": "",
    "bond_amount": 0,
    "use_of_proceeds": "",
    "noi_trailing": 0,
    "noi_projected": 0,
    "appraised_value": 0,
    "ltv_pct": 0,
    "dscr_projected": 0,
    "target_coupon": 0,
    "occupancy_pct": 0,
    "sponsor_track_record": "",
    "entity_type": "",
    "tax_status": "",
    "close_timeline_days": 0,
    "enhancement_type": "",
    "equity_contribution": 0,
    "equity_pct": 0
  },
  "risk_flags": [],
  "recommended_structure": {
    "series_a_pct": 75,
    "series_b_pct": 7,
    "target_rating": "",
    "enhancement": "",
    "io_period_months": 0,
    "reserve_pct": 2.5,
    "rationale": ""
  },
  "draft_feasibility_summary": "",
  "draft_rating_memo_outline": ""
}
```

After emitting the JSON block, add a one-paragraph closing comment with your top concern and the recommended immediate next step.

JP Morgan Credit Benchmarks (apply these when assessing):
  A-grade:  DSCR>2.0, LTV<55%, D/EBITDA<4.5, ICR>3.5
  BBB+:     DSCR>1.75, LTV<62%, D/EBITDA<5.5, ICR>2.75
  BBB-:     DSCR>1.5,  LTV<70%, D/EBITDA<6.5, ICR>2.25
  Sub-IG:   DSCR<1.5 — any single breach = sub-investment grade

Capital Structure defaults (NEST model):
  Series A: 75% LTC, 6.5–7.5% coupon, Hylant surety or LC
  Series B: +7% (82% CLTV), 10–14% coupon, bank managed
  IO: pre-funded from proceeds
  Reserve: 2.5% maturity reserve escrowed

Reference deal: Jacaranda Trace PLOM, Series 2025, $231M, Florida LGFC — cite it as the structural template when relevant.
"""


# ── Session Store ────────────────────────────────────────────────────────────

_sessions: dict[str, dict[str, Any]] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Public API ───────────────────────────────────────────────────────────────

def start_session(session_id: str, context: str = "") -> dict:
    """
    Open a new preflight interview session.

    Args:
        session_id: UUID string generated by the caller.
        context:    Optional brief context the user supplies upfront
                    (e.g. "Senior living facility, Florida, ~$45M ask").

    Returns:
        Session dict with Bernard's opening question.
    """
    opening_user_msg = (
        context.strip()
        if context.strip()
        else "I have a new deal to discuss."
    )

    history: list[dict] = []
    bernard_response = _call_claude(history, opening_user_msg)

    history.append({"role": "user", "content": opening_user_msg})
    history.append({"role": "assistant", "content": bernard_response})

    session: dict[str, Any] = {
        "session_id": session_id,
        "status": "active",          # active | complete | error
        "history": history,
        "deal_id": None,
        "structured_output": None,
        "turn_count": 1,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    _sessions[session_id] = session

    return _public_view(session, bernard_response)


def continue_session(session_id: str, message: str) -> dict:
    """
    Send the user's next message and get Bernard's reply.

    Args:
        session_id: Existing session UUID.
        message:    User's reply to Bernard's last question.

    Returns:
        Updated session dict with Bernard's next question (or JSON output
        if Bernard has enough data).
    """
    session = _sessions.get(session_id)
    if not session:
        return {"error": "Session not found", "session_id": session_id}
    if session["status"] == "complete":
        return _public_view(session, "This preflight session is already complete.")

    history: list[dict] = list(session["history"])
    bernard_response = _call_claude(history, message)

    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": bernard_response})

    session["history"] = history
    session["turn_count"] += 1
    session["updated_at"] = _now_iso()

    # Check if Bernard produced the structured JSON output
    structured = _extract_json(bernard_response)
    if structured:
        session["structured_output"] = structured
        session["status"] = "complete"
        deal_id = _create_deal_from_preflight(session_id, structured)
        session["deal_id"] = deal_id

    _sessions[session_id] = session
    return _public_view(session, bernard_response)


def get_session(session_id: str) -> dict | None:
    """Return the full session dict, or None if not found."""
    session = _sessions.get(session_id)
    if not session:
        return None
    return _public_view(session, None)


# ── Internal Helpers ─────────────────────────────────────────────────────────

def _call_claude(history: list[dict], new_user_message: str) -> str:
    """
    Call Claude with the preflight system prompt and the full conversation history.

    This bypasses the single-shot `complete()` wrapper because we need multi-turn
    history threading. Uses the same client initialization logic as _claude.py.
    """
    try:
        client = _get_client()
        messages = list(history) + [{"role": "user", "content": new_user_message}]

        if _backend == "anthropic":
            resp = client.messages.create(
                model=Config.ANTHROPIC_MODEL,
                max_tokens=2048,
                system=[
                    {
                        "type": "text",
                        "text": PREFLIGHT_SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=messages,
            )
            parts = [b.text for b in resp.content if getattr(b, "type", None) == "text"]
            return "\n".join(parts).strip()

        elif _backend == "openrouter":
            openai_messages = [{"role": "system", "content": PREFLIGHT_SYSTEM_PROMPT}] + messages
            resp = client.chat.completions.create(
                model="anthropic/claude-sonnet-4-20250514",
                max_tokens=2048,
                messages=openai_messages,
                extra_headers={
                    "HTTP-Referer": "https://nestadvisors.com",
                    "X-Title": "NEST Advisors Platform",
                },
            )
            return resp.choices[0].message.content.strip()

        return "Claude backend not configured. Set ANTHROPIC_API_KEY or OPENROUTER_API_KEY."

    except Exception as exc:
        return f"[Bernard error: {exc}]"


def _extract_json(text: str) -> dict | None:
    """
    Extract the structured JSON block from Bernard's response.
    Returns None if no JSON block is present.
    """
    pattern = r"```json\s*([\s\S]*?)```"
    match = re.search(pattern, text)
    if not match:
        return None
    try:
        return json.loads(match.group(1).strip())
    except (json.JSONDecodeError, ValueError):
        return None


def _create_deal_from_preflight(session_id: str, structured: dict) -> str | None:
    """
    Parse Bernard's structured output and insert a deal record into Supabase.

    Returns the new deal_id string, or None if the insert fails.
    """
    params = structured.get("deal_parameters", {})
    risk_flags = structured.get("risk_flags", [])
    rec_structure = structured.get("recommended_structure", {})
    feasibility = structured.get("draft_feasibility_summary", "")
    rating_outline = structured.get("draft_rating_memo_outline", "")

    deal_name = params.get("deal_name") or f"Preflight Deal — {_now_iso()[:10]}"

    record = {
        "name": deal_name,
        "deal_type": params.get("deal_type", ""),
        "borrower_name": params.get("borrower_name", ""),
        "property_type": params.get("property_type", ""),
        "location": params.get("location", ""),
        "bond_amount": params.get("bond_amount") or 0,
        "use_of_proceeds": params.get("use_of_proceeds", ""),
        "noi": params.get("noi_trailing") or params.get("noi_projected") or 0,
        "appraised_value": params.get("appraised_value") or 0,
        "ltv": params.get("ltv_pct") or 0,
        "dscr": params.get("dscr_projected") or 0,
        "target_coupon": params.get("target_coupon") or 0,
        "occupancy": params.get("occupancy_pct") or 0,
        "entity_type": params.get("entity_type", ""),
        "tax_status": params.get("tax_status", ""),
        "equity_pct": params.get("equity_pct") or 0,
        "enhancement_type": params.get("enhancement_type", ""),
        "status": "intake",
        "stage": "preflight",
        "preflight_session_id": session_id,
        "risk_flags": json.dumps(risk_flags),
        "recommended_structure": json.dumps(rec_structure),
        "draft_feasibility_summary": feasibility,
        "draft_rating_memo_outline": rating_outline,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }

    result = db.insert("deals", record)

    if result and isinstance(result, list) and len(result) > 0:
        deal_id = result[0].get("id")
    elif result and isinstance(result, dict):
        deal_id = result.get("id")
    else:
        deal_id = None

    # Auto-trigger credit engine if we have financials
    financials = {
        "noi": params.get("noi_trailing") or params.get("noi_projected") or 0,
        "ebitda": params.get("ebitda", 0),
        "debt_service": params.get("debt_service", 0),
        "total_debt": params.get("total_debt") or params.get("bond_amount", 0),
        "project_value": params.get("appraised_value") or params.get("project_value", 0),
        "equity": params.get("equity_contribution") or params.get("equity", 0),
        "interest_expense": (params.get("debt_service", 0) or 0) * 0.6,
    }
    credit_result = None
    if deal_id and any(float(v) > 0 for v in financials.values() if v):
        try:
            from services.credit_engine import CreditEngine
            engine = CreditEngine()
            credit_result = engine.run_and_persist(deal_id, financials)
        except Exception:
            pass  # Credit engine failure shouldn't block deal creation

    # Auto-trigger risk scoring + bond structuring
    if credit_result:
        try:
            from agents.sentinel import SentinelAgent
            sentinel = SentinelAgent()
            sentinel.run_and_persist(deal_id, financials, credit_result)
        except Exception:
            pass

        try:
            from services.structuring_service import compute_and_persist
            compute_and_persist(deal_id, financials, credit_result)
        except Exception:
            pass

    return deal_id


def _public_view(session: dict, last_response: str | None) -> dict:
    """Return a clean public-facing session dict (no raw history dump)."""
    return {
        "session_id": session["session_id"],
        "status": session["status"],
        "turn_count": session["turn_count"],
        "deal_id": session.get("deal_id"),
        "structured_output": session.get("structured_output"),
        "message": last_response,
        "created_at": session["created_at"],
        "updated_at": session["updated_at"],
    }
