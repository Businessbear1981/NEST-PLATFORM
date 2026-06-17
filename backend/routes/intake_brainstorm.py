"""
Intake Brainstorm routes — ADR-0002
Stage 0 of the NEST data pipeline: Bernard produces a first-look memo +
targeted gap questions from minimal deal-input data.

Routes:
  POST /api/intake-brainstorm/<deal_id>/run
  POST /api/intake-brainstorm/<deal_id>/responses
  POST /api/intake-brainstorm/<deal_id>/greenlight
  POST /api/intake-brainstorm/<deal_id>/park
"""
from flask import Blueprint, jsonify, request
from datetime import datetime
import os
import json

intake_brainstorm_bp = Blueprint("intake_brainstorm", __name__)

# In-memory response store (adequate for demo; replace with DB write in prod)
_responses: dict = {}


def ok(data):
    return jsonify({"success": True, "data": data, "error": None,
                    "timestamp": datetime.utcnow().isoformat()}), 200


def err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg,
                    "timestamp": datetime.utcnow().isoformat()}), code


# ─────────────────────────────────────────────
# Demo brainstorm — returned when NEST_DEMO_MODE=1
# Modelled on Jacaranda Trace ($205M CCRC, Florida)
# ─────────────────────────────────────────────
_DEMO_BRAINSTORM = {
    "bond_type_assessment": {
        "naics_code": "623311",
        "naics_label": "Continuing Care Retirement Communities",
        "sector": "senior_living",
        "deal_intent": "construction",
        "borrower_type": "501(c)(3) Nonprofit",
        "preferred": [
            {
                "type": "501(c)(3) Revenue Bond",
                "preferred": True,
                "rationale": (
                    "Nonprofit CCRC borrower qualifies for tax-exempt financing under "
                    "IRC §501(c)(3). Series A at 75% LTC with Hylant surety LC is the "
                    "anchor structure. Coupon target 6.5–7.5% fixed. Comparable: "
                    "Jacaranda Trace PLOM Series 2025."
                ),
                "source_row_id": "jacaranda_trace_2025",
            }
        ],
        "alternatives": [
            {
                "type": "HUD 232 / FHA LEAN",
                "preferred": False,
                "rationale": (
                    "Available for licensed SNF/CCRC. Lower rate but 24–36 month "
                    "processing timeline conflicts with sponsor's construction schedule."
                ),
            },
            {
                "type": "USDA Community Facilities",
                "preferred": False,
                "rationale": (
                    "Eligible if project is in a rural community (<50k population). "
                    "Confirm location before pursuing."
                ),
            },
        ],
        "operating_framework_refs": ["Bible §4 — Senior Living / CCRC", "ADR-0002"],
        "engine_error": None,
    },
    "credit_profile_snapshot": {
        "benchmarks": {
            "A":    {"DSCR": 2.0, "LTV": 55, "D_EBITDA": 4.5, "ICR": 3.5},
            "BBB+": {"DSCR": 1.75, "LTV": 62, "D_EBITDA": 5.5, "ICR": 2.75},
            "BBB-": {"DSCR": 1.5, "LTV": 70, "D_EBITDA": 6.5, "ICR": 2.25},
        },
        "founder_inputs": {
            "DSCR": None,
            "LTV": None,
            "D_EBITDA": None,
            "ICR": None,
        },
        "metrics": {
            "DSCR": {
                "label": "DSCR",
                "value": None,
                "status": "unknown",
                "note": "Awaiting Stage 1 financials upload via Roots",
            },
            "LTV": {
                "label": "LTV",
                "value": None,
                "status": "unknown",
                "note": "Appraisal + cost basis required",
            },
            "D_EBITDA": {
                "label": "Debt / EBITDA",
                "value": None,
                "status": "unknown",
                "note": "Pro-forma NOI needed",
            },
            "ICR": {
                "label": "Interest Coverage",
                "value": None,
                "status": "unknown",
                "note": "Run after coupon is set",
            },
        },
        "suggested_grade": "BBB+",
        "sub_ig_breach": False,
        "source": "deterministic_heuristic_demo — upload financials for real metrics",
    },
    "structural_template": {
        "name": "NEST Series A/B CCRC Construction Structure",
        "summary": (
            "Series A: 75% LTC, tax-exempt 501(c)(3) revenue bonds, "
            "Hylant surety LC, 6.5–7.5% coupon, 30-yr maturity. "
            "Series B: incremental 7% (82% CLTV), bank-managed, 10–14% coupon. "
            "IO pre-funded from proceeds. 2.5% maturity reserve escrowed."
        ),
        "irc_anchor": "IRC §501(c)(3) / §142(a)(3)",
        "bible_ref": "Bible §4 — Senior Living / CCRC · Jacaranda Trace PLOM",
        "anchor_bond_type": "501(c)(3) Revenue Bond",
        "anchor_rationale": (
            "Tax-exempt status drives 150–200bps coupon savings vs. taxable alternative. "
            "Hylant surety wraps the A tranche to investment-grade."
        ),
    },
    "deal_killer_flags": [],
    "narration": {
        "bond_type_assessment": (
            "Bernard here. NAICS 623311 is a clean bond play — nonprofit CCRC with "
            "surety enhancement is the same structure that closed Jacaranda Trace at "
            "$231M. No flags. Proceed to document ingestion."
        ),
        "credit_profile_snapshot": (
            "No financials uploaded yet, so all metrics are pending. Historical CCRC "
            "comps at this scale grade BBB+. Upload the operating pro-forma to Stage 1 "
            "and I will produce real DSCR, LTV, and D/EBITDA."
        ),
        "structural_template": (
            "Series A at 75% LTC with Hylant surety is the anchor. The B tranche adds "
            "the remaining 7% CLTV at bank rates. IO is pre-funded so the borrower has "
            "zero cash drag during the construction period."
        ),
        "deal_killer_flags": (
            "No deal-killers raised at intake. CCRC sector clears all NAICS eligibility "
            "filters. Proceed to gap-fill and then Roots."
        ),
    },
    "_brainstorm_narration_pending": False,
}

_DEMO_GAP_QUESTIONS = [
    {
        "id": "occupancy_rate",
        "prompt": "What is the projected stabilized occupancy rate?",
        "field_type": "number",
        "why_we_ask": "DSCR and NOI waterfall require a stabilized occupancy assumption.",
        "feeds_stage": "Stage 1 — Credit Memo / Roots",
    },
    {
        "id": "total_units",
        "prompt": "How many units / beds in the facility?",
        "field_type": "number",
        "why_we_ask": "Revenue per unit drives per-bed debt sizing and comparable selection.",
        "feeds_stage": "Stage 1 — Roots spread",
    },
    {
        "id": "construction_timeline_months",
        "prompt": "What is the construction timeline (months)?",
        "field_type": "number",
        "why_we_ask": "IO pre-funding period is sized to the construction draw schedule.",
        "feeds_stage": "Stage 1 — Bond structuring / IO reserve",
    },
    {
        "id": "existing_debt",
        "prompt": "Does the borrower carry any existing debt or lien obligations?",
        "field_type": "yesno",
        "why_we_ask": "Senior lien priority and cross-default analysis require full debt schedule.",
        "feeds_stage": "Stage 1 — Credit Memo",
    },
    {
        "id": "hylant_relationship",
        "prompt": "Has the sponsor worked with Hylant Insurance or any surety provider before?",
        "field_type": "yesno",
        "why_we_ask": "Existing surety relationship accelerates Series A LC approval.",
        "feeds_stage": "Stage 2 — Surety / Enhancement",
    },
    {
        "id": "feasibility_study",
        "prompt": "Has a feasibility study been completed or commissioned?",
        "field_type": "select",
        "options": ["completed", "in_progress", "not_started", "not_required"],
        "why_we_ask": "Rating agencies require a feasibility study for CCRC bond issuance.",
        "feeds_stage": "Stage 3 — Rating Memo",
    },
    {
        "id": "sponsor_equity_pct",
        "prompt": "What percentage of total project cost is sponsor equity?",
        "field_type": "number",
        "why_we_ask": "Equity cushion affects LTV and Series B sizing.",
        "feeds_stage": "Stage 1 — Credit Memo",
    },
]


def _build_prompt(deal_id: str, body: dict) -> str:
    deal_name = body.get("deal_name", "unnamed deal")
    deal_type = body.get("deal_type", "unknown")
    sector = body.get("sector", "unknown")
    size_usd = body.get("size_usd", 0)
    sponsor_type = body.get("sponsor_type", "unknown")
    naics = body.get("naics_code", "unknown")

    return f"""You are Bernard, the NEST Platform's chief AI advisor (Jimmy Lee tone — direct, decisive, no hedging).

Analyze this deal intake and produce a JSON first-look memo.

Deal ID: {deal_id}
Deal Name: {deal_name}
Deal Type: {deal_type}
Sector: {sector}
NAICS: {naics}
Estimated Size: ${size_usd:,}
Sponsor Type: {sponsor_type}

NEST Capital Structure reference:
- Series A: 75% LTC, investment-grade, Hylant surety/LC, 6.5-7.5% coupon
- Series B: +7% (82% CLTV), B/BBB, bank managed, 10-14% coupon
- JP Morgan credit benchmarks: A-grade DSCR>2.0 LTV<55%; BBB+ DSCR>1.75 LTV<62%; BBB- DSCR>1.5 LTV<70%

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{{
  "bond_type_assessment": {{
    "naics_code": "<string>",
    "naics_label": "<string>",
    "sector": "<string>",
    "deal_intent": "<string>",
    "borrower_type": "<string>",
    "preferred": [{{"type": "<string>", "preferred": true, "rationale": "<string>", "source_row_id": "<string|null>"}}],
    "alternatives": [{{"type": "<string>", "preferred": false, "rationale": "<string>"}}],
    "operating_framework_refs": ["<string>"],
    "engine_error": null
  }},
  "credit_profile_snapshot": {{
    "benchmarks": {{"A": {{"DSCR": 2.0, "LTV": 55}}, "BBB+": {{"DSCR": 1.75, "LTV": 62}}, "BBB-": {{"DSCR": 1.5, "LTV": 70}}}},
    "founder_inputs": {{"DSCR": null, "LTV": null}},
    "metrics": {{
      "DSCR": {{"label": "DSCR", "value": null, "status": "unknown", "note": "<string>"}},
      "LTV":  {{"label": "LTV",  "value": null, "status": "unknown", "note": "<string>"}}
    }},
    "suggested_grade": "<A|BBB+|BBB-|Sub-IG>",
    "sub_ig_breach": false,
    "source": "bernard_intake_brainstorm"
  }},
  "structural_template": {{
    "name": "<string>",
    "summary": "<string>",
    "irc_anchor": "<string|null>",
    "bible_ref": "<string|null>",
    "anchor_bond_type": "<string|null>",
    "anchor_rationale": "<string|null>"
  }},
  "deal_killer_flags": [],
  "narration": {{
    "bond_type_assessment": "<2 sentences max, Jimmy Lee tone>",
    "credit_profile_snapshot": "<2 sentences max>",
    "structural_template": "<2 sentences max>",
    "deal_killer_flags": "<1 sentence>"
  }},
  "_brainstorm_narration_pending": false
}}"""


@intake_brainstorm_bp.post("/api/intake-brainstorm/<deal_id>/run")
def run_brainstorm(deal_id: str):
    body = request.get_json(silent=True) or {}

    # NEST_DEMO_MODE only bypasses auth — it never bypasses the AI call.
    # Always attempt real Claude first; fall back to seed data if key missing or call fails.
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        # Fall back to demo if no API key configured
        return ok({
            "deal_id": deal_id,
            "first_look_memo": {**_DEMO_BRAINSTORM, "_brainstorm_narration_pending": True},
            "gap_questions": _DEMO_GAP_QUESTIONS,
            "generated_at": datetime.utcnow().isoformat(),
        })

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        prompt = _build_prompt(deal_id, body)
        message = client.messages.create(
            model=os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rsplit("```", 1)[0]
        memo = json.loads(raw)
        return ok({
            "deal_id": deal_id,
            "first_look_memo": memo,
            "gap_questions": _DEMO_GAP_QUESTIONS,
            "generated_at": datetime.utcnow().isoformat(),
        })
    except Exception as exc:
        # On any failure return demo with narration_pending flag
        return ok({
            "deal_id": deal_id,
            "first_look_memo": {**_DEMO_BRAINSTORM, "_brainstorm_narration_pending": True},
            "gap_questions": _DEMO_GAP_QUESTIONS,
            "generated_at": datetime.utcnow().isoformat(),
            "_error": str(exc),
        })


@intake_brainstorm_bp.post("/api/intake-brainstorm/<deal_id>/responses")
def save_responses(deal_id: str):
    body = request.get_json(silent=True) or {}
    _responses[deal_id] = body
    return ok({"saved": True, "deal_id": deal_id})


@intake_brainstorm_bp.post("/api/intake-brainstorm/<deal_id>/greenlight")
def greenlight(deal_id: str):
    return ok({
        "status": "greenlighted",
        "next": f"/preflight?deal_id={deal_id}",
        "next_route": f"/preflight?deal_id={deal_id}",
        "deal_id": deal_id,
        "message": (
            "Deal greenlighted. Advancing to Preflight Interview — "
            "Bernard will gather the credit memo inputs."
        ),
    })


@intake_brainstorm_bp.post("/api/intake-brainstorm/<deal_id>/park")
def park(deal_id: str):
    return ok({
        "status": "parked",
        "deal_id": deal_id,
        "message": "Deal parked. Responses saved. Resume when ready.",
    })
