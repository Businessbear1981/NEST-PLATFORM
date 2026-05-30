# NEST Enterprise Wiring — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the NEST platform end-to-end — Supabase persistence, real data connectors, Bernard preflight → Roots → Credit Engine → Rating → Structuring → Placement chain, EagleEye intelligence with live data sources, and the V3 Next.js frontend connected to real backend APIs.

**Architecture:** Flask backend with 23+ data connectors feeding through a plugin hub into business logic agents (Maxwell, Prometheus, Sentinel, Vector) that persist to Supabase. V3 Next.js App Router frontend with gutted V2 components rewired to real API calls. Two business lines (Bond, Sparrow) sharing platform tools (EagleEye, Hawkeye, Aria, Maxwell, Marketing).

**Tech Stack:** Flask (Python), Next.js 14 App Router, Supabase (PostgreSQL), Anthropic Claude API, 23+ data connectors (FRED, EMMA, EDGAR, ATTOM, CoStar, D&B, FINRA, etc.)

**Source of truth:** `docs/Bible_Pass1_v2.md` (Silo 3: workflow stages, Silo 15: formulas, Silo 17: agent specs, Silo 18: tech wire-up). `CONTEXT.md` (domain glossary). `docs/Operating_Framework_v1.md` (org structure).

---

## Phase 0 — Foundation (Database + Persistence)

Nothing works without persistence. Every agent, every signal, every deal is lost on restart today.

### Task 1: Supabase Schema — Deals Core

**Files:**
- Create: `backend/migrations/001_deals_core.sql`
- Modify: `backend/services/database.py` (add migration runner helper)

This is the central table everything else references. Schema follows `models/deal.py` structure but adds Supabase-native columns.

- [ ] **Step 1: Write the migration SQL**

```sql
-- 001_deals_core.sql
-- Core deal table for both Bond and Sparrow business lines

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  deal_type text not null default 'bond' check (deal_type in ('bond', 'sparrow')),
  status text not null default 'intake' check (status in (
    'intake', 'document_ingestion', 'sponsor_diligence', 'underwriting',
    'structuring', 'engagement', 'document_drafting', 'marketing',
    'working_group', 'approvals', 'rating_committee', 'pricing',
    'closing', 'post_close', 'surveillance'
  )),
  -- Header fields (shown on pipeline cards regardless of deal type)
  deal_size numeric,
  location_state text,
  location_city text,
  sector text,
  naics_code text,
  sponsor_name text,
  risk_grade text,
  -- Project details (JSONB for flexibility per deal type)
  project jsonb not null default '{}',
  -- Sponsor details
  sponsor jsonb not null default '{}',
  -- Working group / team
  team jsonb not null default '{}',
  -- Readiness tracking
  readiness_score integer not null default 0,
  readiness_checklist jsonb not null default '{}',
  -- Financials (populated by credit engine, updated as analysis deepens)
  financials jsonb not null default '{}',
  -- Metadata
  source_channel text check (source_channel in ('direct', 'merlin_ma', 'eagleeye', 'referral', 'outbound')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at
  before update on deals
  for each row execute function update_updated_at();

-- Indexes
create index idx_deals_status on deals(status);
create index idx_deals_type on deals(deal_type);
create index idx_deals_sector on deals(sector);
```

- [ ] **Step 2: Run migration against Supabase**

Run via Supabase SQL editor or:
```bash
cd backend && python -c "from services.database import db; print(db.configured)"
```
Paste SQL into Supabase Dashboard → SQL Editor → Run.

- [ ] **Step 3: Verify table exists**

```bash
cd backend && python -c "
from services.database import db
result = db.select('deals', {'limit': '1'})
print('deals table exists:', result is not None)
"
```
Expected: `deals table exists: True` (empty list is fine)

- [ ] **Step 4: Commit**

```bash
git add backend/migrations/001_deals_core.sql
git commit -m "feat: add deals core Supabase migration (Stage 0-12 statuses)"
```

---

### Task 2: Supabase Schema — Credit, Bonds, Risk, Signals

**Files:**
- Create: `backend/migrations/002_credit_bonds_risk.sql`

These tables store the outputs of Maxwell, Prometheus, Sentinel, Vector, and EagleEye.

- [ ] **Step 1: Write the migration SQL**

```sql
-- 002_credit_bonds_risk.sql

-- Credit analysis results (Maxwell output)
create table if not exists credit_analyses (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  -- Core metrics (Silo 15 formulas)
  noi numeric,
  ebitda numeric,
  debt_service numeric,
  total_debt numeric,
  project_value numeric,
  equity numeric,
  interest_expense numeric,
  -- Computed metrics
  dscr numeric,
  ltv numeric,
  cf_leverage numeric,
  bs_leverage numeric,
  d_ebitda numeric,
  icr numeric,
  debt_yield numeric,
  break_even_occupancy numeric,
  -- Grading (JP Morgan benchmarks)
  grade text,
  score integer,
  score_breakdown jsonb not null default '{}',
  -- LGD
  lgd_bare numeric,
  lgd_surety numeric,
  lgd_dual_wrap numeric,
  -- Stress test results
  stress_results jsonb not null default '{}',
  -- Metadata
  version integer not null default 1,
  run_by text, -- agent name
  created_at timestamptz not null default now()
);

create index idx_credit_deal on credit_analyses(deal_id);

-- Bond structure (tranches, series)
create table if not exists bond_structures (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  -- Structure
  par_amount numeric,
  series jsonb not null default '[]', -- array of series objects
  capital_stack jsonb not null default '{}',
  -- Pricing
  blended_coupon numeric,
  weighted_avg_life numeric,
  all_in_tic numeric,
  -- Call provisions
  call_provisions jsonb not null default '{}',
  -- Waterfall
  waterfall jsonb not null default '{}',
  -- Reserves
  dsrf numeric,
  capitalized_interest numeric,
  cost_of_issuance numeric,
  -- Metadata
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create index idx_bonds_deal on bond_structures(deal_id);

-- Risk scores (Sentinel output)
create table if not exists risk_scores (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  overall_score integer,
  credit_risk integer,
  market_risk integer,
  construction_risk integer,
  legal_risk integer,
  operational_risk integer,
  environmental_risk integer,
  political_risk integer,
  grade text,
  alerts jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index idx_risk_deal on risk_scores(deal_id);

-- Modeling results (Prometheus output)
create table if not exists modeling_results (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id),
  model_type text not null, -- 'proforma', 'feasibility', 'stress', 'napkin'
  version integer not null default 1,
  inputs jsonb not null default '{}',
  outputs jsonb not null default '{}',
  irr numeric,
  npv numeric,
  dscr_min numeric,
  dscr_avg numeric,
  is_feasible boolean default false,
  run_by text,
  created_at timestamptz not null default now()
);

create index idx_modeling_deal on modeling_results(deal_id);

-- EagleEye signals
create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  scout_id uuid, -- references the scout that found it
  signal_type text not null, -- 'ucc_filing', 'permit', 'emma_maturity', 'edgar_filing', 'title_transfer'
  source text not null, -- 'emma', 'edgar', 'county_permits', 'ucc', 'attom'
  -- Entity info
  entity_name text,
  entity_type text, -- 'company', 'property', 'bond', 'person'
  location_state text,
  location_city text,
  sector text,
  naics_code text,
  -- Signal data
  data jsonb not null default '{}',
  -- Scoring
  node_count integer not null default 0, -- how many scoring nodes hit
  score numeric,
  -- Lifecycle
  status text not null default 'raw' check (status in ('raw', 'scored', 'prospect', 'dismissed')),
  promoted_to_prospect_at timestamptz,
  dismissed_at timestamptz,
  -- Metadata
  created_at timestamptz not null default now()
);

create index idx_signals_status on signals(status);
create index idx_signals_type on signals(signal_type);
create index idx_signals_score on signals(score desc);

-- EagleEye scouts (persistent search profiles)
create table if not exists scouts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  -- Search criteria (multi-dimensional)
  criteria jsonb not null default '{}',
  -- Which data sources to scan
  sources text[] not null default '{}', -- ['emma', 'edgar', 'ucc', 'permits']
  -- Derived from deal?
  source_deal_id uuid references deals(id),
  -- Activity
  is_active boolean not null default true,
  last_run_at timestamptz,
  total_signals_found integer not null default 0,
  created_at timestamptz not null default now()
);

-- Prospects (graduated signals entering marketing pipeline)
create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references signals(id),
  -- Entity info (denormalized from signal for pipeline display)
  entity_name text not null,
  sector text,
  location text,
  estimated_deal_size numeric,
  -- Contact info
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_linkedin text,
  -- Pipeline stage (continuous, no hard gates)
  stage text not null default 'new' check (stage in (
    'new', 'marketing_engaged', 'responded', 'meeting_scheduled',
    'meeting_held', 'proposal_sent', 'engaged', 'client'
  )),
  -- Marketing
  marketing_sequence_started_at timestamptz,
  touch_count integer not null default 0,
  last_touch_at timestamptz,
  -- Metadata
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prospects_stage on prospects(stage);

-- Documents (Roots)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  doc_type text not null, -- 'rent_roll', 'operating_statement', 'appraisal', 'title', 'pfs', etc.
  filename text not null,
  storage_path text, -- Supabase storage path
  file_size integer,
  -- Processing
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'parsed', 'reviewed', 'error')),
  parsed_data jsonb, -- structured data extracted by OCR/Claude
  -- Metadata
  uploaded_by text,
  created_at timestamptz not null default now()
);

create index idx_docs_deal on documents(deal_id);

-- Deal correspondence (AI-mediated inboxes)
create table if not exists correspondence (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null default 'email' check (channel in ('email', 'phone', 'meeting', 'portal')),
  from_name text,
  from_email text,
  to_name text,
  to_email text,
  subject text,
  body text,
  -- AI processing
  ai_summary text,
  ai_action_items jsonb default '[]',
  ai_category text, -- 'rating_followup', 'client_question', 'counsel_comment', etc.
  -- Status
  is_read boolean default false,
  requires_action boolean default false,
  action_completed boolean default false,
  created_at timestamptz not null default now()
);

create index idx_correspondence_deal on correspondence(deal_id);

-- Sub-industry silos (emerge organically)
create table if not exists industry_silos (
  id uuid primary key default gen_random_uuid(),
  naics_code text not null,
  naics_label text not null,
  deal_count integer not null default 0,
  signal_count integer not null default 0,
  is_active boolean not null default false, -- becomes true at 3+ deals/signals
  intelligence jsonb not null default '{}', -- accumulated sector knowledge
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

- [ ] **Step 2: Run migration against Supabase**

Paste SQL into Supabase Dashboard → SQL Editor → Run.

- [ ] **Step 3: Verify all tables exist**

```bash
cd backend && python -c "
from services.database import db
tables = ['deals', 'credit_analyses', 'bond_structures', 'risk_scores',
          'modeling_results', 'signals', 'scouts', 'prospects', 'documents',
          'correspondence', 'industry_silos']
for t in tables:
    result = db.select(t, {'limit': '1'})
    print(f'{t}: {\"OK\" if result is not None else \"MISSING\"}')"
```

- [ ] **Step 4: Commit**

```bash
git add backend/migrations/002_credit_bonds_risk.sql
git commit -m "feat: add credit, bonds, risk, signals, prospects, documents schema"
```

---

### Task 3: Kill In-Memory Fallbacks — Force Supabase

**Files:**
- Modify: `backend/routes/deals.py` — remove `_deals`, `_bonds`, `_refis`, `_covenants` dicts
- Modify: `backend/services/database.py` — add `require_configured()` method
- Modify: `backend/app.py` — fail fast if Supabase not configured

Every route currently falls back to in-memory dicts when Supabase isn't configured. This must stop — if DB isn't configured, the app should refuse to start.

- [ ] **Step 1: Add require check to database.py**

Add after the `configured` property in `backend/services/database.py`:

```python
def require_configured(self):
    """Call at app startup. Raises if Supabase is not configured."""
    if not self._configured:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. "
            "NEST requires Supabase for all persistence."
        )
```

- [ ] **Step 2: Call require check in app.py startup**

Add to `backend/app.py` after app creation, before route registration:

```python
from services.database import db
db.require_configured()
```

- [ ] **Step 3: Remove in-memory fallback dicts from deals.py**

In `backend/routes/deals.py`, remove lines 23-27 (the `_lock`, `_deals`, `_bonds`, `_refis`, `_covenants` declarations) and remove all branches that check `if not _use_db()`. Every route should go through `db.*` methods only.

- [ ] **Step 4: Test that app starts with Supabase configured**

```bash
cd backend && python -c "from app import create_app; app = create_app(); print('App started OK')"
```

- [ ] **Step 5: Commit**

```bash
git add backend/services/database.py backend/routes/deals.py backend/app.py
git commit -m "fix: remove in-memory fallbacks, require Supabase for all persistence"
```

---

## Phase 1 — Bernard Preflight + Deal Intake Chain

The entry point. Bernard interviews the operator about a deal, generates draft memos, and creates the deal record that everything else computes from.

### Task 4: Bernard Preflight Engine

**Files:**
- Create: `backend/services/preflight_service.py`
- Modify: `backend/routes/bernard.py`
- Modify: `backend/agents/bernard.py`

Bernard conducts a conversational preflight interview (Bible Silo 3, Stage 0). Not a form — a conversation. Outputs: draft feasibility study, draft rating memo, draft enhancement memo, and a structured deal record saved to Supabase.

- [ ] **Step 1: Write preflight_service.py**

```python
"""Bernard Preflight Service — conversational deal intake that produces
draft memos and a structured deal record.

This is Stage 0 (Inbound and Triage) from the Bible.
Bernard asks investment-banking-depth questions, not generic intake questions.
"""
from datetime import datetime
from services.database import db
from agents._claude import ask_claude

PREFLIGHT_SYSTEM = """You are Bernard, the CEO intelligence agent for NEST Advisors,
a digital investment bank specializing in bond structuring.

You are conducting a preflight interview for a new deal. Ask investment-banking-level
questions — not generic intake. You are a senior banker with 18 years at JPMorgan.

Your job:
1. Understand the deal (asset type, location, size, sponsor, capital structure)
2. Identify the financing strategy (bond type, tranche structure, enhancement needs)
3. Probe for risks (COGS trends, AP days, tenant concentration, lease rollover)
4. Ask follow-up questions that a rating agency would ask
5. Build toward: feasibility assessment, credit profile, structural recommendation

When you have enough information, produce a STRUCTURED OUTPUT with:
- deal_summary: one paragraph
- deal_parameters: {name, deal_type, sector, location_state, location_city,
  deal_size, noi, ebitda, debt_service, project_value, total_debt, equity,
  sponsor_name, asset_type, units_or_sf, occupancy_pct}
- risk_flags: list of identified risks
- recommended_structure: initial structural recommendation
- next_questions: follow-up questions for deeper diligence
- draft_feasibility_summary: 2-3 paragraph draft
- draft_rating_memo_outline: bullet points for rating memo
- draft_enhancement_memo: surety/LC recommendation

Respond as JSON when you have enough info. Until then, ask ONE focused question at a time.
Use the Jimmy Lee tone: direct, decisive, no hedging. Numbers are authority."""


class PreflightService:
    def __init__(self):
        self._sessions = {}  # session_id -> conversation history

    def start_session(self, session_id: str, initial_context: str = "") -> dict:
        """Start a new preflight session."""
        messages = []
        if initial_context:
            messages.append({"role": "user", "content": initial_context})

        prompt = initial_context or "I have a new deal to discuss."
        response = ask_claude(PREFLIGHT_SYSTEM, prompt, history=messages)

        self._sessions[session_id] = {
            "messages": messages + [
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": response}
            ],
            "started_at": datetime.utcnow().isoformat(),
            "deal_id": None,
        }

        return {"session_id": session_id, "response": response, "deal_created": False}

    def continue_session(self, session_id: str, user_message: str) -> dict:
        """Continue the preflight conversation."""
        session = self._sessions.get(session_id)
        if not session:
            return {"error": "Session not found"}

        session["messages"].append({"role": "user", "content": user_message})

        response = ask_claude(
            PREFLIGHT_SYSTEM,
            user_message,
            history=session["messages"][:-1]  # exclude the message we just added
        )

        session["messages"].append({"role": "assistant", "content": response})

        # Check if Bernard produced structured output (deal ready to create)
        deal_created = False
        deal_id = None
        if '"deal_parameters"' in response and '"deal_summary"' in response:
            deal_id = self._create_deal_from_preflight(session_id, response)
            deal_created = True
            session["deal_id"] = deal_id

        return {
            "session_id": session_id,
            "response": response,
            "deal_created": deal_created,
            "deal_id": deal_id,
        }

    def _create_deal_from_preflight(self, session_id: str, response: str) -> str:
        """Extract deal parameters from Bernard's structured output and save to Supabase."""
        import json

        # Parse the JSON from Bernard's response
        try:
            # Find JSON block in response
            start = response.index('{')
            end = response.rindex('}') + 1
            data = json.loads(response[start:end])
        except (ValueError, json.JSONDecodeError):
            return None

        params = data.get("deal_parameters", {})

        row = {
            "name": params.get("name", "Untitled Deal"),
            "slug": params.get("name", "untitled").lower().replace(" ", "-"),
            "deal_type": params.get("deal_type", "bond"),
            "status": "intake",
            "deal_size": params.get("deal_size"),
            "location_state": params.get("location_state"),
            "location_city": params.get("location_city"),
            "sector": params.get("sector") or params.get("asset_type"),
            "sponsor_name": params.get("sponsor_name"),
            "source_channel": "direct",
            "project": json.dumps(params),
            "financials": json.dumps({
                "noi": params.get("noi"),
                "ebitda": params.get("ebitda"),
                "debt_service": params.get("debt_service"),
                "project_value": params.get("project_value"),
                "total_debt": params.get("total_debt"),
                "equity": params.get("equity"),
                "occupancy_pct": params.get("occupancy_pct"),
            }),
            "readiness_checklist": json.dumps({}),
            "team": json.dumps({}),
        }

        result = db.insert("deals", row)
        if result and isinstance(result, list) and len(result) > 0:
            return result[0].get("id")
        return None

    def get_session(self, session_id: str) -> dict:
        """Get current session state."""
        session = self._sessions.get(session_id)
        if not session:
            return None
        return {
            "session_id": session_id,
            "message_count": len(session["messages"]),
            "deal_id": session.get("deal_id"),
            "started_at": session["started_at"],
        }


preflight = PreflightService()
```

- [ ] **Step 2: Add preflight routes to bernard.py**

Add these routes to `backend/routes/bernard.py`:

```python
from services.preflight_service import preflight
import uuid

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
```

- [ ] **Step 3: Test preflight endpoint**

```bash
cd backend && python -c "
import requests
# Start a preflight session
r = requests.post('http://localhost:8000/api/desks/bernard/preflight/start',
    json={'context': 'Senior living facility in Tampa FL, 120 units, \$45M project cost, sponsor is Sunrise Senior Living'})
print(r.json())
"
```

- [ ] **Step 4: Commit**

```bash
git add backend/services/preflight_service.py backend/routes/bernard.py
git commit -m "feat: Bernard preflight engine — conversational deal intake with Claude"
```

---

### Task 5: Auto-Trigger Credit Engine on Deal Creation

**Files:**
- Modify: `backend/services/preflight_service.py` (add credit trigger)
- Modify: `backend/services/credit_engine.py` (add `run_and_persist` method)

When Bernard creates a deal from the preflight conversation, the credit engine automatically runs on the deal's financials and persists the results to Supabase. This is the "data entered once flows everywhere" principle.

- [ ] **Step 1: Add run_and_persist to credit_engine.py**

Add to `backend/services/credit_engine.py` after the `CreditEngine` class:

```python
def run_and_persist(self, deal_id: str, deal_data: dict) -> dict:
    """Run full credit analysis and persist to Supabase."""
    from services.database import db
    import json

    metrics = self.compute_metrics(deal_data)
    grade_result = self.grade(metrics)
    stress = self.stress_test(deal_data)

    row = {
        "deal_id": deal_id,
        "noi": deal_data.get("noi"),
        "ebitda": deal_data.get("ebitda"),
        "debt_service": deal_data.get("debt_service"),
        "total_debt": deal_data.get("total_debt"),
        "project_value": deal_data.get("project_value"),
        "equity": deal_data.get("equity"),
        "interest_expense": deal_data.get("interest_expense"),
        "dscr": metrics.get("dscr"),
        "ltv": metrics.get("ltv"),
        "cf_leverage": metrics.get("cf_leverage"),
        "bs_leverage": metrics.get("bs_leverage"),
        "d_ebitda": metrics.get("d_ebitda"),
        "icr": metrics.get("icr"),
        "debt_yield": metrics.get("debt_yield"),
        "grade": grade_result.get("grade"),
        "score": grade_result.get("score"),
        "score_breakdown": json.dumps(grade_result.get("breakdown", {})),
        "lgd_bare": metrics.get("lgd_bare"),
        "lgd_surety": metrics.get("lgd_surety"),
        "lgd_dual_wrap": metrics.get("lgd_dual_wrap"),
        "stress_results": json.dumps(stress),
        "run_by": "maxwell",
    }

    result = db.insert("credit_analyses", row)

    # Update deal's risk_grade
    if grade_result.get("grade"):
        db.update("deals", {"id": f"eq.{deal_id}"}, {
            "risk_grade": grade_result["grade"]
        })

    return {**metrics, **grade_result, "stress": stress, "persisted": True}
```

- [ ] **Step 2: Trigger credit engine from preflight deal creation**

In `preflight_service.py`, add to the end of `_create_deal_from_preflight`:

```python
# Auto-trigger credit engine if we have financials
financials = {
    "noi": params.get("noi", 0),
    "ebitda": params.get("ebitda", 0),
    "debt_service": params.get("debt_service", 0),
    "total_debt": params.get("total_debt") or params.get("deal_size", 0),
    "project_value": params.get("project_value", 0),
    "equity": params.get("equity", 0),
    "interest_expense": params.get("debt_service", 0) * 0.6 if params.get("debt_service") else 0,
}
if any(v for v in financials.values() if v and v > 0):
    from services.credit_engine import CreditEngine
    engine = CreditEngine()
    engine.run_and_persist(deal_id, financials)
```

- [ ] **Step 3: Commit**

```bash
git add backend/services/credit_engine.py backend/services/preflight_service.py
git commit -m "feat: credit engine auto-triggers on deal creation, persists to Supabase"
```

---

### Task 6: Auto-Trigger Risk Scoring + Bond Structuring

**Files:**
- Modify: `backend/agents/sentinel.py` (add `run_and_persist` method)
- Create: `backend/services/structuring_service.py` (bond structure computation + persist)
- Modify: `backend/services/preflight_service.py` (chain triggers)

After credit engine runs, Sentinel scores risk and the structuring service computes initial tranche structure. The chain: Bernard → Deal → Credit → Risk → Structure.

- [ ] **Step 1: Add run_and_persist to Sentinel**

In `backend/agents/sentinel.py`, add:

```python
def run_and_persist(self, deal_id: str, deal_data: dict, credit_result: dict) -> dict:
    """Run risk assessment and persist to Supabase."""
    from services.database import db
    import json

    scores = self.assess(deal_data, credit_result)

    row = {
        "deal_id": deal_id,
        "overall_score": scores.get("overall", 0),
        "credit_risk": scores.get("credit", 0),
        "market_risk": scores.get("market", 0),
        "construction_risk": scores.get("construction", 0),
        "legal_risk": scores.get("legal", 0),
        "operational_risk": scores.get("operational", 0),
        "environmental_risk": scores.get("environmental", 0),
        "political_risk": scores.get("political", 0),
        "grade": scores.get("grade"),
        "alerts": json.dumps(scores.get("alerts", [])),
    }

    db.insert("risk_scores", row)
    return scores
```

- [ ] **Step 2: Create structuring_service.py**

```python
"""Bond Structuring Service — computes tranche structure from credit metrics.

Uses Silo 15 sizing formulas and Silo 10 tranching logic from the Bible.
Capital structure per CLAUDE.md:
  Series A: 75% LTC, investment grade, 6.5-7.5% coupon
  Series B: +7% (82% CLTV), B/BBB, 10-14% coupon
"""
import json
from services.database import db


def compute_and_persist(deal_id: str, deal_data: dict, credit_result: dict) -> dict:
    """Compute initial bond structure and persist."""
    grade = credit_result.get("grade", "BBB_minus")
    dscr = credit_result.get("dscr", 1.0)
    ltv = credit_result.get("ltv", 100)
    project_value = deal_data.get("project_value", 0)
    total_project_cost = deal_data.get("total_debt", 0) + deal_data.get("equity", 0)
    noi = deal_data.get("noi", 0)

    # Series A sizing (75% LTC, target DSCR > 1.5)
    max_a_from_ltc = total_project_cost * 0.75
    max_a_from_dscr = (noi / 1.5) / 0.07 if noi > 0 else 0  # assume 7% coupon
    series_a_par = min(max_a_from_ltc, max_a_from_dscr)

    # Series B sizing (82% CLTV - Series A)
    max_total = total_project_cost * 0.82
    series_b_par = max(0, max_total - series_a_par)

    # Coupon estimates based on grade
    a_coupon = 6.5 if grade in ("A", "AA", "AAA") else 7.0 if grade == "BBB_plus" else 7.5
    b_coupon = 10.0 if grade in ("A", "BBB_plus") else 12.0 if grade == "BBB_minus" else 14.0

    # Blended
    total_par = series_a_par + series_b_par
    blended = ((series_a_par * a_coupon) + (series_b_par * b_coupon)) / total_par if total_par > 0 else 0

    structure = {
        "deal_id": deal_id,
        "par_amount": total_par,
        "series": json.dumps([
            {"name": "Series A", "par": series_a_par, "coupon": a_coupon,
             "grade": grade, "ltc_pct": 75, "type": "senior"},
            {"name": "Series B", "par": series_b_par, "coupon": b_coupon,
             "grade": "BB_plus", "ltc_pct": 7, "type": "subordinate"},
        ]),
        "capital_stack": json.dumps({
            "series_a": series_a_par,
            "series_b": series_b_par,
            "equity": deal_data.get("equity", 0),
            "total": total_project_cost,
        }),
        "blended_coupon": round(blended, 2),
        "dsrf": round(max(noi * 0.1, total_par * 0.025), 2),
        "waterfall": json.dumps({
            "1_debt_service_a": series_a_par * (a_coupon / 100),
            "2_dsrf_replenishment": 0,
            "3_debt_service_b": series_b_par * (b_coupon / 100),
            "4_surplus": noi - (series_a_par * a_coupon / 100) - (series_b_par * b_coupon / 100),
        }),
    }

    result = db.insert("bond_structures", structure)
    return {
        "par_amount": total_par,
        "series_a": {"par": series_a_par, "coupon": a_coupon},
        "series_b": {"par": series_b_par, "coupon": b_coupon},
        "blended_coupon": round(blended, 2),
        "grade": grade,
        "persisted": True,
    }
```

- [ ] **Step 3: Chain all triggers in preflight_service.py**

Update `_create_deal_from_preflight` to chain: Credit → Risk → Structure:

```python
# After credit engine runs:
if credit_result:
    # Risk scoring
    from agents.sentinel import SentinelAgent
    sentinel = SentinelAgent()
    sentinel.run_and_persist(deal_id, financials, credit_result)

    # Bond structuring
    from services.structuring_service import compute_and_persist
    compute_and_persist(deal_id, financials, credit_result)
```

- [ ] **Step 4: Commit**

```bash
git add backend/agents/sentinel.py backend/services/structuring_service.py backend/services/preflight_service.py
git commit -m "feat: auto-chain Credit → Risk → Structure on deal creation"
```

---

## Phase 2 — EagleEye Intelligence Engine

The game-changer. Live data sources feeding Scouts that find real deals.

### Task 7: Wire Live Data Connectors to EagleEye

**Files:**
- Create: `backend/services/eagleeye_service.py`
- Modify: `backend/services/data_connectors.py` (ensure FRED, EDGAR, EMMA are live)
- Modify: `backend/routes/eagleeye.py` (replace hardcoded signals with real queries)

Connect EagleEye to the connectors that are already coded: FRED (live rates), EDGAR (SEC filings — public API), EMMA (muni bonds — public API), FINRA BrokerCheck (public API), Treasury Direct (public API). These 5 work without paid API keys.

- [ ] **Step 1: Create eagleeye_service.py**

```python
"""EagleEye Intelligence Service — orchestrates Scouts across live data sources.

Scouts run against: EMMA (muni bonds), EDGAR (SEC filings), FRED (rates),
FINRA (broker checks), Treasury Direct (auction data).
Future: ATTOM (property), CoStar (CRE), D&B (credit), UCC filings, county permits.
"""
import json
from datetime import datetime
from services.database import db
from services.data_connectors import (
    FREDPlugin, EDGARPlugin, EMMAPlugin, FINRABrokerCheckPlugin, TreasuryDirectPlugin
)
from agents._claude import ask_claude

# Initialize live connectors
fred = FREDPlugin()
edgar = EDGARPlugin()
emma = EMMAPlugin()
finra = FINRABrokerCheckPlugin()
treasury = TreasuryDirectPlugin()

SIGNAL_SCORING_PROMPT = """You are EagleEye, the intelligence engine for NEST Advisors.
Score this signal for bond financing potential. Consider:
1. Deal size (sweet spot $15M-$300M)
2. Asset type suitability for bond financing
3. Credit indicators visible in the data
4. Geographic market strength
5. Structural complexity / Nest's edge

Return JSON:
{
  "score": 0-100,
  "node_hits": ["size_fit", "sector_match", "geography", "credit_signal", "timing"],
  "summary": "one sentence",
  "recommended_action": "monitor" | "prospect" | "dismiss"
}"""


class EagleEyeService:

    def create_scout(self, name: str, criteria: dict, sources: list) -> dict:
        """Create a persistent Scout search profile."""
        row = {
            "name": name,
            "description": criteria.get("description", ""),
            "criteria": json.dumps(criteria),
            "sources": sources,
            "is_active": True,
        }
        result = db.insert("scouts", row)
        return result[0] if result else None

    def create_scout_from_deal(self, deal_id: str) -> dict:
        """Create a Scout derived from an existing deal — 'find me more like this.'"""
        deal = db.select("deals", {"id": f"eq.{deal_id}"}, single=True)
        if not deal:
            return None

        criteria = {
            "description": f"Similar to {deal['name']}",
            "sector": deal.get("sector"),
            "deal_size_min": (deal.get("deal_size") or 0) * 0.5,
            "deal_size_max": (deal.get("deal_size") or 0) * 2.0,
            "location_state": deal.get("location_state"),
            "naics_code": deal.get("naics_code"),
        }

        sources = ["emma", "edgar"]
        if deal.get("deal_type") == "bond":
            sources.append("finra")

        return self.create_scout(
            f"Similar to {deal['name']}",
            criteria,
            sources,
            # source_deal_id stored separately
        )

    def run_scout(self, scout_id: str) -> list:
        """Execute a Scout against all its data sources."""
        scout = db.select("scouts", {"id": f"eq.{scout_id}"}, single=True)
        if not scout:
            return []

        criteria = scout.get("criteria", {})
        if isinstance(criteria, str):
            criteria = json.loads(criteria)

        sources = scout.get("sources", [])
        signals = []

        for source in sources:
            raw_hits = self._query_source(source, criteria)
            for hit in raw_hits:
                signal = self._score_and_save(hit, scout_id, source)
                if signal:
                    signals.append(signal)

        # Update scout stats
        db.update("scouts", {"id": f"eq.{scout_id}"}, {
            "last_run_at": datetime.utcnow().isoformat(),
            "total_signals_found": scout.get("total_signals_found", 0) + len(signals),
        })

        return signals

    def _query_source(self, source: str, criteria: dict) -> list:
        """Query a data source with Scout criteria."""
        sector = criteria.get("sector", "")
        state = criteria.get("location_state", "")

        if source == "emma":
            result = emma.execute(issuer=sector or "revenue bond")
            if result.get("success"):
                data = result.get("data", {})
                # EMMA returns various formats — normalize
                if isinstance(data, list):
                    return [{"source": "emma", "raw": item} for item in data[:20]]
                elif isinstance(data, dict):
                    return [{"source": "emma", "raw": data}]
            return []

        elif source == "edgar":
            query = f"{sector} {state}".strip() or "bond"
            result = edgar.execute(company=query, filing_type="S-1,10-K")
            if result.get("success"):
                return [{"source": "edgar", "raw": f} for f in result.get("filings", [])]
            return []

        elif source == "finra":
            result = finra.execute(name=criteria.get("sponsor_name", sector))
            if result.get("success"):
                return [{"source": "finra", "raw": i} for i in result.get("individuals", [])]
            return []

        return []

    def _score_and_save(self, hit: dict, scout_id: str, source: str) -> dict:
        """Score a raw hit using Claude and save as a Signal."""
        # Use Claude to score the signal
        score_response = ask_claude(
            SIGNAL_SCORING_PROMPT,
            f"Score this signal from {source}:\n{json.dumps(hit['raw'], default=str)}"
        )

        score_data = {}
        try:
            start = score_response.index('{')
            end = score_response.rindex('}') + 1
            score_data = json.loads(score_response[start:end])
        except (ValueError, json.JSONDecodeError):
            score_data = {"score": 30, "node_hits": [], "summary": "Could not parse",
                          "recommended_action": "monitor"}

        node_count = len(score_data.get("node_hits", []))
        status = "prospect" if node_count >= 3 else "scored"

        row = {
            "scout_id": scout_id,
            "signal_type": self._infer_signal_type(source, hit["raw"]),
            "source": source,
            "entity_name": self._extract_entity_name(hit["raw"]),
            "data": json.dumps(hit["raw"], default=str),
            "node_count": node_count,
            "score": score_data.get("score", 0),
            "status": status,
        }

        if status == "prospect":
            row["promoted_to_prospect_at"] = datetime.utcnow().isoformat()

        result = db.insert("signals", row)

        # If promoted to prospect, create prospect record
        if status == "prospect" and result:
            signal_id = result[0]["id"] if result else None
            if signal_id:
                self._create_prospect(signal_id, row, score_data)

        return result[0] if result else None

    def _create_prospect(self, signal_id: str, signal_row: dict, score_data: dict):
        """Create a prospect from a signal that hit 3+ nodes."""
        db.insert("prospects", {
            "signal_id": signal_id,
            "entity_name": signal_row.get("entity_name", "Unknown"),
            "sector": signal_row.get("sector"),
            "location": signal_row.get("location_state"),
            "stage": "new",
        })

    def _infer_signal_type(self, source: str, raw: dict) -> str:
        if source == "emma":
            return "emma_issuance"
        elif source == "edgar":
            return "edgar_filing"
        elif source == "finra":
            return "finra_check"
        return "unknown"

    def _extract_entity_name(self, raw: dict) -> str:
        if isinstance(raw, dict):
            for key in ["name", "issuerName", "display_names", "entity_name"]:
                val = raw.get(key)
                if val:
                    return val[0] if isinstance(val, list) else str(val)
        return "Unknown Entity"


eagleeye = EagleEyeService()
```

- [ ] **Step 2: Replace hardcoded signals in eagleeye.py routes**

In `backend/routes/eagleeye.py`, replace the `_signals` list and related routes:

```python
from services.eagleeye_service import eagleeye

@eagleeye_bp.route("/scouts", methods=["POST"])
def create_scout():
    body = request.get_json(silent=True) or {}
    result = eagleeye.create_scout(
        body.get("name", "New Scout"),
        body.get("criteria", {}),
        body.get("sources", ["emma", "edgar"])
    )
    return _ok(result)

@eagleeye_bp.route("/scouts/<scout_id>/run", methods=["POST"])
def run_scout(scout_id):
    signals = eagleeye.run_scout(scout_id)
    return _ok({"signals_found": len(signals), "signals": signals})

@eagleeye_bp.route("/scouts/from-deal/<deal_id>", methods=["POST"])
def scout_from_deal(deal_id):
    result = eagleeye.create_scout_from_deal(deal_id)
    return _ok(result)

@eagleeye_bp.route("/signals", methods=["GET"])
def list_signals():
    status = request.args.get("status")
    params = {"order": "score.desc", "limit": "50"}
    if status:
        params["status"] = f"eq.{status}"
    signals = db.select("signals", params)
    return _ok(signals or [])

@eagleeye_bp.route("/prospects", methods=["GET"])
def list_prospects():
    params = {"order": "created_at.desc", "limit": "50"}
    stage = request.args.get("stage")
    if stage:
        params["stage"] = f"eq.{stage}"
    prospects = db.select("prospects", params)
    return _ok(prospects or [])
```

- [ ] **Step 3: Test EMMA + EDGAR queries**

```bash
cd backend && python -c "
from services.data_connectors import EMMAPlugin, EDGARPlugin
emma = EMMAPlugin()
edgar = EDGARPlugin()
print('EMMA:', emma.execute(issuer='senior living revenue bond'))
print('EDGAR:', edgar.execute(company='senior living', filing_type='S-1'))
"
```

- [ ] **Step 4: Commit**

```bash
git add backend/services/eagleeye_service.py backend/routes/eagleeye.py
git commit -m "feat: EagleEye intelligence engine with live EMMA, EDGAR, FINRA, FRED connectors"
```

---

## Phase 3 — V3 Frontend Restoration + Wiring

### Task 8: Restore V3 Frontend Directory

**Files:**
- Restore: `frontend/` from zip at `/tmp/nest-v3/NEST-ADVISORS-V3-main/frontend/`

The V3 Next.js frontend exists in the zip but is missing from the working repo.

- [ ] **Step 1: Copy V3 frontend into repo**

```bash
cp -r /tmp/nest-v3/NEST-ADVISORS-V3-main/frontend C:/Users/sgill/nest/frontend
```

- [ ] **Step 2: Install dependencies**

```bash
cd C:/Users/sgill/nest/frontend && npm install
```

- [ ] **Step 3: Create .env.local**

```bash
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000/api' > C:/Users/sgill/nest/frontend/.env.local
```

- [ ] **Step 4: Verify it starts**

```bash
cd C:/Users/sgill/nest/frontend && npm run dev
```
Expected: Next.js dev server on port 3000 (or configure for 8100).

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: restore V3 Next.js frontend from backup"
```

---

### Task 9: Wire Dashboard to Real Backend APIs

**Files:**
- Modify: `frontend/app/(app)/dashboard/page.tsx`
- Modify: `frontend/lib/marketing.ts` (update base URL)

The dashboard already fetches from `/api/deals`, `/api/agents/status`, `/api/market/signals/latest`. These endpoints exist in the backend. Wire them to return real Supabase data.

- [ ] **Step 1: Verify backend endpoints return real data**

```bash
curl http://localhost:8000/api/deals | python -m json.tool
curl http://localhost:8000/api/market/rates | python -m json.tool
```

- [ ] **Step 2: Update API base URL in frontend**

In `frontend/lib/marketing.ts`, ensure:

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
```

- [ ] **Step 3: Test dashboard renders real deals**

Open `http://localhost:8100` in browser. Dashboard should show deals from Supabase, live FRED rates, and agent status.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/marketing.ts frontend/app/(app)/dashboard/page.tsx
git commit -m "feat: wire dashboard to real Supabase deals + FRED rates"
```

---

### Task 10: Wire Deal Detail Page to Real Credit + Structure Data

**Files:**
- Modify: `frontend/app/(app)/deals/[id]/page.tsx`

The deal detail page has 4 tabs (Overview, Credit Engine, Bond Structure, Agents). Wire each tab to fetch from the new Supabase-backed endpoints.

- [ ] **Step 1: Add API routes for deal credit + structure**

In `backend/routes/deals.py`, add:

```python
@deals_bp.route("/<deal_id>/credit", methods=["GET"])
def get_deal_credit(deal_id):
    results = db.select("credit_analyses", {
        "deal_id": f"eq.{deal_id}",
        "order": "created_at.desc",
        "limit": "1"
    })
    if results:
        return _ok(results[0])
    return _ok(None)

@deals_bp.route("/<deal_id>/structure", methods=["GET"])
def get_deal_structure(deal_id):
    results = db.select("bond_structures", {
        "deal_id": f"eq.{deal_id}",
        "order": "created_at.desc",
        "limit": "1"
    })
    if results:
        return _ok(results[0])
    return _ok(None)

@deals_bp.route("/<deal_id>/risk", methods=["GET"])
def get_deal_risk(deal_id):
    results = db.select("risk_scores", {
        "deal_id": f"eq.{deal_id}",
        "order": "created_at.desc",
        "limit": "1"
    })
    if results:
        return _ok(results[0])
    return _ok(None)
```

- [ ] **Step 2: Update deal detail page to fetch credit + structure**

In the deal detail page, add fetches for the Credit Engine and Bond Structure tabs:

```typescript
// In the useEffect that fetches deal data, add:
fetch(`${API}/deals/${id}/credit`).then(r => r.json()).then(d => setCredit(d.data));
fetch(`${API}/deals/${id}/structure`).then(r => r.json()).then(d => setStructure(d.data));
fetch(`${API}/deals/${id}/risk`).then(r => r.json()).then(d => setRisk(d.data));
```

- [ ] **Step 3: Test end-to-end**

1. Start Bernard preflight, talk through a deal
2. Bernard creates deal → credit engine runs → risk scores → structure computed
3. Navigate to deal detail page → all 3 tabs show real computed data

- [ ] **Step 4: Commit**

```bash
git add backend/routes/deals.py frontend/app/(app)/deals/\\[id\\]/page.tsx
git commit -m "feat: wire deal detail page to real credit, structure, and risk data"
```

---

## Phase 4 — Connector Health + EagleEye Frontend

### Task 11: Connector Health Dashboard

**Files:**
- Create: `backend/routes/connectors.py`
- Modify: `backend/app.py` (register blueprint)

Create an endpoint that reports the health of all 23+ connectors.

- [ ] **Step 1: Create connectors.py**

```python
"""Connector health routes — shows which data sources are live."""
from flask import Blueprint, jsonify
from datetime import datetime
from services.data_connectors import (
    FREDPlugin, TreasuryDirectPlugin, ATTOMPlugin, CoStarPlugin,
    EDGARPlugin, EMMAPlugin, FINRABrokerCheckPlugin, DnBPlugin, RSMeansPlugin
)
from services.ai_router import plugin_hub

connectors_bp = Blueprint("connectors", __name__)

def _ts():
    return datetime.utcnow().isoformat()

DATA_CONNECTORS = [
    FREDPlugin(), TreasuryDirectPlugin(), ATTOMPlugin(), CoStarPlugin(),
    EDGARPlugin(), EMMAPlugin(), FINRABrokerCheckPlugin(), DnBPlugin(), RSMeansPlugin(),
]

@connectors_bp.route("/health", methods=["GET"])
def connector_health():
    health = []
    for c in DATA_CONNECTORS:
        health.append({
            "name": c.name,
            "description": c.description,
            "configured": c.is_configured(),
            "status": c.status,
            "capabilities": c.capabilities,
            "requires_key": c.requires_key,
        })

    # AI connectors from plugin hub
    for name, plugin in plugin_hub.plugins.items():
        health.append({
            "name": name,
            "description": plugin.description,
            "configured": plugin.is_available,
            "status": "connected" if plugin.is_available else "disconnected",
            "type": "ai_model",
        })

    configured = sum(1 for h in health if h["configured"])
    return jsonify({
        "success": True,
        "data": {
            "total": len(health),
            "configured": configured,
            "disconnected": len(health) - configured,
            "connectors": health,
        },
        "timestamp": _ts(),
    })
```

- [ ] **Step 2: Register blueprint in app.py**

```python
from routes.connectors import connectors_bp
app.register_blueprint(connectors_bp, url_prefix="/api/connectors")
```

- [ ] **Step 3: Test**

```bash
curl http://localhost:8000/api/connectors/health | python -m json.tool
```

- [ ] **Step 4: Commit**

```bash
git add backend/routes/connectors.py backend/app.py
git commit -m "feat: connector health dashboard endpoint — reports all 23+ data sources"
```

---

### Task 12: EagleEye Frontend Page

**Files:**
- Modify: `frontend/app/(app)/admin/eagleeye/page.tsx`

Replace the static EagleEye page with a real interface: Scout management, live signals, prospect pipeline.

- [ ] **Step 1: Rewrite EagleEye admin page**

This page needs three sections:
1. **Scouts** — create, list, run scouts. "Find me more like this deal" button.
2. **Signals** — live feed of scored signals from all sources, filterable by status/source/score
3. **Prospects** — graduated signals in the marketing pipeline with stage tracking

The page fetches from:
- `GET /api/eagleeye/scouts` — list all scouts
- `POST /api/eagleeye/scouts` — create a scout
- `POST /api/eagleeye/scouts/:id/run` — execute a scout
- `GET /api/eagleeye/signals?status=scored` — list signals
- `GET /api/eagleeye/prospects` — list prospects

Implementation: follow the existing V3 pattern — inline styled components using NEST brand tokens (gold for financial data, sage for secondary text, forest for cards).

- [ ] **Step 2: Test EagleEye end-to-end**

1. Create a scout: "Senior living revenue bonds in Florida, $20M-$100M"
2. Run the scout → watch signals populate from EMMA/EDGAR
3. Signals that hit 3+ nodes auto-promote to prospects
4. Prospects appear in the pipeline view

- [ ] **Step 3: Commit**

```bash
git add frontend/app/(app)/admin/eagleeye/page.tsx
git commit -m "feat: EagleEye frontend — scouts, signals, prospects with live data"
```

---

## Phase 5 — Bernard Preflight Frontend + Roots

### Task 13: Bernard Preflight Chat Interface

**Files:**
- Modify: `frontend/app/(app)/admin/bernard/page.tsx`

Add a "Preflight" mode to Bernard that conducts the deal interview. Conversational interface — not a form.

- [ ] **Step 1: Add Preflight tab to Bernard page**

Add a fourth mode button ("Preflight") alongside Ask, Route Task, Tutorial. When active, renders a chat interface that calls:
- `POST /api/desks/bernard/preflight/start` to begin
- `POST /api/desks/bernard/preflight/:session_id/message` for each message

When Bernard produces structured output (deal_created: true), show a success message with a link to the new deal detail page.

- [ ] **Step 2: Test the full preflight flow**

1. Click "Preflight" in Bernard
2. Type: "Senior living facility in Tampa FL, 120 units, $45M"
3. Bernard asks follow-up questions (NOI? Sponsor? Occupancy?)
4. Answer questions until Bernard produces a structured deal
5. Deal auto-created → credit engine runs → click through to deal detail
6. All tabs populated with real computed data

- [ ] **Step 3: Commit**

```bash
git add frontend/app/(app)/admin/bernard/page.tsx
git commit -m "feat: Bernard preflight chat interface — conversational deal intake"
```

---

### Task 14: Roots Document Upload

**Files:**
- Modify: `frontend/app/(app)/docs/page.tsx` (or create `frontend/app/(app)/admin/documents/page.tsx`)
- Modify: `backend/routes/documents.py`

Wire Roots to actually upload documents to Supabase Storage and track them in the documents table.

- [ ] **Step 1: Add Supabase Storage upload to backend**

In `backend/routes/documents.py`:

```python
@docs_bp.route("/upload", methods=["POST"])
def upload_document():
    deal_id = request.form.get("deal_id")
    doc_type = request.form.get("doc_type", "other")
    file = request.files.get("file")

    if not file or not deal_id:
        return _err("deal_id and file are required")

    filename = file.filename
    storage_path = f"deals/{deal_id}/{doc_type}/{filename}"

    # Upload to Supabase Storage
    # (uses REST API — POST to storage endpoint)
    import httpx
    upload_url = f"{db.url}/storage/v1/object/documents/{storage_path}"
    headers = {
        "Authorization": f"Bearer {db.key}",
        "apikey": db.key,
    }
    r = httpx.post(upload_url, headers=headers, content=file.read(),
                   headers={**headers, "Content-Type": file.content_type})

    # Save metadata to documents table
    row = {
        "deal_id": deal_id,
        "doc_type": doc_type,
        "filename": filename,
        "storage_path": storage_path,
        "file_size": file.content_length,
        "status": "uploaded",
    }
    result = db.insert("documents", row)

    return _ok(result[0] if result else row)
```

- [ ] **Step 2: Build upload UI in frontend**

Drag-and-drop upload zone per deal, showing document checklist (from Bible Silo 3 Stage 1 — what's received, what's missing).

- [ ] **Step 3: Commit**

```bash
git add backend/routes/documents.py frontend/app/(app)/admin/documents/page.tsx
git commit -m "feat: Roots document upload — Supabase Storage + checklist tracking"
```

---

## Phase 6 — Self-Learning Follow-Up Questions

### Task 15: Credit Engine Follow-Up Intelligence

**Files:**
- Create: `backend/services/followup_engine.py`

When credit metrics are computed, use Claude to generate investment-banking-depth follow-up questions based on anomalies in the numbers. This is the "COGS went up, why?" feature.

- [ ] **Step 1: Create followup_engine.py**

```python
"""Follow-Up Engine — generates investment-banking-depth questions
from credit analysis anomalies.

Runs after every credit analysis. Surfaces questions like:
- "AP days jumped from 45 to 67 — supplier issues or cash management?"
- "COGS up 12%, margins compressed — what changed?"
- "Top tenant is 38% of NOI — what's the lease term and rollover risk?"
"""
import json
from agents._claude import ask_claude
from services.database import db

FOLLOWUP_PROMPT = """You are a senior investment banker at JPMorgan reviewing a credit analysis.
Generate 5-8 specific follow-up questions based on these credit metrics.

Focus on:
1. Anomalies (numbers that don't match expected patterns for this asset type)
2. Risk concentrations (tenant, geographic, revenue source)
3. Trend concerns (what would a rating agency probe?)
4. Structural implications (how do these numbers affect bond structure?)
5. Comparables (how does this compare to sector benchmarks?)

Be specific. Not "tell me about revenue" but "revenue per unit of $X is 15% below
sector median of $Y — is this a pricing strategy or a market constraint?"

Return JSON array of objects:
[{"question": "...", "category": "credit|structure|market|sponsor", "priority": "high|medium|low",
  "triggered_by": "which metric triggered this question"}]"""


def generate_followups(deal_id: str, credit_result: dict) -> list:
    """Generate follow-up questions from credit analysis."""
    response = ask_claude(
        FOLLOWUP_PROMPT,
        f"Credit analysis results:\n{json.dumps(credit_result, default=str)}"
    )

    questions = []
    try:
        start = response.index('[')
        end = response.rindex(']') + 1
        questions = json.loads(response[start:end])
    except (ValueError, json.JSONDecodeError):
        questions = [{"question": "Review credit metrics manually", "category": "credit",
                      "priority": "high", "triggered_by": "parse_error"}]

    # Persist questions as correspondence items on the deal
    for q in questions:
        db.insert("correspondence", {
            "deal_id": deal_id,
            "direction": "outbound",
            "channel": "portal",
            "from_name": "EagleEye Intelligence",
            "subject": f"Follow-up: {q.get('category', 'credit').title()}",
            "body": q["question"],
            "ai_category": f"followup_{q.get('category', 'credit')}",
            "requires_action": True,
        })

    return questions
```

- [ ] **Step 2: Wire into credit engine chain**

In `preflight_service.py`, after credit engine runs:

```python
from services.followup_engine import generate_followups
followups = generate_followups(deal_id, credit_result)
```

- [ ] **Step 3: Commit**

```bash
git add backend/services/followup_engine.py backend/services/preflight_service.py
git commit -m "feat: self-learning follow-up questions from credit analysis anomalies"
```

---

## Summary — The Chain

After all 15 tasks, the data flow chain works end-to-end:

```
Bernard Preflight (conversational interview)
  → Deal created in Supabase
    → Credit Engine auto-runs (DSCR, LTV, ICR, grade, LGD)
      → Risk Scoring auto-runs (7 dimensions)
        → Bond Structure auto-computed (tranches, waterfall, coupon)
          → Follow-up questions generated (investment banking depth)
            → All data visible in deal detail page (real numbers, not demo)

EagleEye (parallel intelligence)
  → Scouts query EMMA, EDGAR, FINRA, FRED (live APIs)
    → Signals scored (multi-node, Claude-powered)
      → 3+ nodes → auto-promote to Prospect
        → Marketing pipeline engaged

All persisted to Supabase. Nothing lost on restart.
```

**What's NOT in this plan (future phases):**
- SendGrid email integration (Aria outreach)
- Higgsfield video generation
- ATTOM, CoStar, D&B connector activation (need paid API keys)
- UCC filing scanner, county permit watcher
- Sparrow business line (separate intake + LenderScout workflow)
- OSINT dossier building
- Payload integration
- Post-close monitoring
- Marketing 8-touch sequence automation
