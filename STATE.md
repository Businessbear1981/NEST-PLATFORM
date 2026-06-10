# NEST Platform — Live State Document
Last updated: 2026-06-09

This file is the single source of truth on what is actually built, wired, and working.
It is updated in place after every session so we never re-explain history.

---

## Version history (brief — do not re-litigate)

| Version | What happened |
|---|---|
| V1 | Full backend logic written on wrong frontend design. Deleted. |
| V2 | Correct design look but all modules were demo stubs — no real backend calls. |
| V3 | Redesign + rebuild. Became V4. |
| **V4 (current)** | Vite + React frontend at `frontend-v2/`, Flask backend at `backend/`, both in `NEST-PLATFORM` GitHub repo. Active sessions have wired and rewired various modules. |

---

## Repo layout

```
nest/
├── backend/          Flask, port 8000
│   ├── app.py        All blueprints registered here
│   ├── agents/       18 agents
│   ├── services/     70+ service files
│   ├── routes/       55+ route files
│   └── migrations/   006 SQL files (001–006)
├── frontend-v2/      Vite + React, port 8100 (Vercel deployed)
│   └── src/
│       ├── App.tsx           ~40 routes registered
│       └── pages/v4/         12 V4 module pages
├── frontend/         Empty Next.js shell — IGNORE (was V1, stripped)
├── CONTEXT.md        Domain glossary (canonical)
├── CLAUDE.md         Stack + brand + agent fleet
└── docs/adr/         ADR-0001 (licensing), ADR-0002 (deal lifecycle)
```

---

## Database — Supabase

Migrations applied (SQL files in `backend/migrations/`):

| File | Tables created |
|---|---|
| 001_deals_core.sql | `deals` (type: bond or sparrow only) |
| 002_credit_bonds_risk.sql | `signals`, `scouts`, `prospects`, `documents`, `correspondence` |
| 003_contacts_counterparties.sql | `contacts`, `counterparties` |
| 004_intake_brainstorm.sql | `intake_sessions`, `brainstorm_responses` |
| 005_study_progress.sql | `study_progress`, `study_sessions` |
| 006_phoenix_treasury.sql | `phoenix_deals`, `treasury_transactions`, `treasury_budgets` |

**NOTE:** These SQL files exist on disk. Whether they have been RUN against the live Supabase instance is unconfirmed. Must verify before calling any DB-dependent route in production.

---

## Backend — what is real vs mock

### REAL (live DB or live API calls)

| Module | File | What it does |
|---|---|---|
| Bernard | `agents/bernard.py` | Real Claude API calls, real system prompt |
| EagleEye | `services/eagleeye_service.py` | Real EDGAR + EMMA + FINRA + Claude scoring → Supabase |
| EMMA | `services/emma_engine.py` | Real HTTP calls to emma.msrb.org + Claude PDF parsing |
| Rating | `agents/moodys_mirror.py`, `sp_mirror.py` | Real published Moody's/S&P methodology in system prompts |
| Doc Ingestion | `services/doc_ingestion.py` | Real Claude classification + extraction, 7 doc types |
| Surety/Insurance | `services/surety_universe_service.py` | Real carrier whitelist + IFS rating cap logic |
| Contacts/Counterparties | `services/contacts_service.py`, `counterparty_db.py` | Supabase-backed |
| Deals | `services/deals.py` | Supabase-backed |
| Auth | `services/auth.py` | In-memory JWT (NOT Supabase GoTrue yet — see gaps) |
| Phoenix Engine | `services/phoenix_engine.py` | **Rewritten this session** — Supabase-backed, deterministic scoring, no randoms |
| Treasury Engine | `services/treasury_engine.py` | **Rewritten this session** — Supabase-backed, no random.Random |

### MOCK / STUB (not yet real)

| Module | File | Problem |
|---|---|---|
| Auth | `services/auth.py` | In-memory user store, not Supabase GoTrue |
| Hawkeye buyer universe | `services/hawkeye_placement.py` | Investor list is hardcoded, not pulled from Supabase |
| CMBS Stacking | frontend: `CMBSStackingDesk.tsx` | No backend endpoint exists for this |
| SendGrid | `.env` | Key is empty — Aria can draft but cannot send |
| Trustee | `routes/rating_esg.py` | `TRUSTEE_TASKS` is a hardcoded list, no dedicated service |
| World Labs | `config.py` | Key loaded, not wired to any endpoint |

---

## Frontend-to-Backend wiring — V4 pages

| Page | Route | API calls | Status |
|---|---|---|---|
| TreasuryPage | `/treasury` | `/api/treasury/deal-1/overview`, `/budget`, `/rebate` | **Wired** |
| EMMAPage | `/emma` | `/api/emma/stats`, `/comps`, `/search`, `/templates` | **Wired** |
| DealInputPage | `/deal-input-v4` | `/api/deals`, `/api/workflow/init`, `/api/intake-brainstorm` | **Wired** |
| DealsPage | `/deals` | `/api/deal-flow/seed-deals`, `/api/deal-flow/run` | **Wired** |
| RootsUploadPage | `/upload` | `/api/deals`, `/api/docs/ingest` | **Wired** |
| BernardPage | `/bernard` | **NONE** | Not wired |
| CreditUWPage | `/credit` | **NONE** | Not wired |
| TrusteePage | `/trustee` | **NONE** | Not wired |
| ConstructionPage | `/construction` | Unknown | Not verified |
| SurveillancePage | `/surveillance` | Unknown | Not verified |
| ClientDashboardPage | `/client` | Unknown | Not verified |
| StudyPage | `/study` | Unknown | Not verified |

---

## The build series (active work)

In the previous session we identified 8 items to fix in series. Status:

| # | Item | Status |
|---|---|---|
| 1 | Phoenix Engine → Supabase-backed | **DONE** |
| 2 | Treasury Engine → Supabase-backed, no randoms | **DONE** (this session) |
| 3 | Hawkeye buyer universe → move to Supabase `investors` table | Pending |
| 4 | Supabase Auth → swap in-memory auth for GoTrue | Pending |
| 5 | CMBS Stacking → build `/api/bond-structuring/cmbs-stack` backend | Pending |
| 6 | SendGrid → add key, activate Aria send flow | Pending |
| 7 | Trustee module → dedicated `routes/trustee.py` + `services/trustee_service.py` | Pending |
| 8 | World Labs → wire to EagleEye deal cards + Hawkeye investor teasers | Pending |

Items 3–8 = the next session's work. Wire front-to-back one module at a time.

---

## Known gaps that will crash production

1. **Migrations not confirmed live.** If 006 was never run against Supabase, Phoenix and Treasury routes will 500 on every call.
2. **Auth is in-memory.** Server restart = all sessions dead, all tokens invalid.
3. **SendGrid key empty.** Any email route returns 500 silently.
4. **CMBS frontend has no backend.** Loading `/bond-desk` with CMBS tab will hang.
5. **BernardPage has no API calls.** The main AI surface renders blank.
6. **deal_id="deal-1" hardcoded in TreasuryPage.** Will 404 if no deal with that ID exists in DB.

---

## What to do next session

1. Confirm migrations 001–006 are applied to live Supabase (run them or check dashboard).
2. Wire BernardPage to `POST /api/bernard/chat`.
3. Wire CreditUWPage to `/api/credit/*`.
4. Continue build series items 3–8 in order.

Do not start a new session without reading this file first.
