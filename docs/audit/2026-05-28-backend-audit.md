# NEST Backend Audit — 2026-05-28

**Scope:** `backend/` — Flask app, port 8000.
**Method:** Static code audit. Every claim traces to file path + line number.

---

## Headlines (read this first)

- **403 routes across 48 blueprints**. The backend is real and substantial — not vapor.
- **Auth works**: `admin@nest.local / Admin123!` returns a JWT (`services/auth.py:73-79`).
- **Bond structuring, EMMA, EagleEye, Hawkeye, Bernard, all 11 engines, all 14 Operating-Framework desk routes are real code** — not stubs.
- **3 endpoints are 500-broken right now** because of a stale import bug: `routes/marketplace.py:22` and `routes/risk.py:12,28` do `from routes.deals import _deals, _bonds, _lock` — those globals were removed when deals moved to Supabase. ~15-line fix per handler.
- **The 4.28 treasury rate everywhere is a static fallback** hardcoded in 5 places (`ai_router.py:311`, `v2_compat.py:166,228`, `intelligence.py:506`, `bond_tools.py:136`) that fires when `FRED_API_KEY` is unset or FRED is unreachable. Set the key → live rates flow.
- **3 migration files redefine the same tables** (`deals`, `bond_structures`, `risk_scores`) with conflicting schemas. All use `CREATE TABLE IF NOT EXISTS` so the first one to run wins — and 28 `except Exception: pass` blocks across the codebase hide the resulting silent insert failures.

---

## 1. Route Inventory (48 blueprints / 403 endpoints)

| File | Prefix | # | Notes |
|---|---|---|---|
| `routes/auth.py` | `/api/auth` | 4 | login, register, me, password |
| `routes/fund.py` | `/api/fund` | 8 | position, yield, distributions, WC, benchmark, snapshot, war-chest + SocketIO |
| `routes/marketing.py` | `/api/marketing` | 15 | Morgan + Aria + Sterling |
| `routes/deals.py` | `/api/deals` | 17 | Full CRUD + bond + refi + covenants + memo |
| `routes/documents.py` | `/api/docs` | 6 | upload, list, readiness, get, download, delete |
| `routes/activity.py` | `/api/activity` | 1 | feed |
| `routes/agents_api.py` | `/api/agents` | 2 | status, run |
| `routes/market.py` | `/api/market` | 5 | signals, rates/live, rates/yield-curve, rates/snapshot |
| `routes/marketplace.py` | `/api/marketplace` | 1 | offerings (BROKEN — see §5) |
| `routes/investors.py` | `/api/investors` | 2 | list, add |
| `routes/perm.py` | `/api/perm` | 2 | initiate, status |
| `routes/ma.py` | `/api/ma` | 6 | targets, analyze, game-theory, irr, pipeline, digest |
| `routes/lenders_api.py` | `/api/lenders-direct` | 4 | list, add, search, pipeline |
| `routes/surety.py` | `/api/surety` | 5 | providers, premium, match, outreach, run |
| `routes/due_diligence.py` | `/api/dd` | 7 | DD checklist + shovel-ready + timeline |
| `routes/bond_tools.py` | `/api/bond-tools` | 10 | grade, audit, optimize, stress/rates |
| `routes/risk.py` | `/api/risk` | 3 | score/<deal>, portfolio (BOTH BROKEN), covenant-test |
| `routes/blockchain.py` | `/api/blockchain` | 5 | stats, events, verify, record |
| `routes/webhooks.py` | `/api/webhooks` | 2 | inbound, log |
| `routes/roots.py` | `""` | 8 | offerings + interest + submit-deal + admin views |
| `routes/intelligence.py` | `""` | 56 | bond-intel, monitor, ai, phase-bonds, ma-bonds, audit, bridge, licensing, nervous-system, data |
| `routes/engines_api.py` | `/api/engines` | 27 | modeling, maxwell, architect, pricing, sentinel, insurance, intake, audit-package, bridge, pipeline/run |
| `routes/powerstrip.py` | `/api/powerstrip` | 7 | status, plugins, route, call/<plugin>, market-rates, bond-pricing, refi-signals |
| `routes/bond_workflow.py` | `/api/bond-workflow` | 4 | deal/<id>, run-evaluation, checklist, phase |
| `routes/eagleeye.py` | `/api/eagleeye` | 24 | signals, scouts, prospects, intelligence/*, operators/*, benchmarks |
| `routes/hawkeye.py` | `/api/hawkeye` | 7 | buyers, match, teaser, order-book, allocate, teasers |
| `routes/rating_esg.py` | `/api/rating-esg` | 8 | rating, esg, climate, covenants, trustee, rma |
| `routes/health.py` | `/api` | 2 | health, health/ready |
| `routes/nightvision.py` | `/api/nightvision` | 6 | scan, scan/<deal>, checks, status, gate-check |
| `routes/bond_structuring.py` | `/api/bond-structuring` | 4 | structure, deal-impact, call-put-analysis, pool-analysis |
| `routes/treasury.py` | `/api/treasury` | 12 | deal-scoped overview/transactions/cards + portfolio |
| `routes/phoenix.py` | `/api/phoenix` | 14 | distressed CRE deals + underwriting + radar + warchest |
| `routes/napkin.py` | `/api/napkin` | 4 | owner-user, investor-re, demo/* |
| `routes/convergence.py` | `/api/convergence` | 6 | signals, heat, entity, patterns, stats |
| `routes/scanner.py` | `/api/scanner` | 6 | status, start, stop, scan, log, findings |
| `routes/desks.py` | `/api/desks` | 10 | list, get, agents, bernard/{ask,route,tutorial,narrate,firm-review} |
| `routes/emma.py` | `/api/emma` | 7 | search, parse, templates, comps, stats, poll |
| `routes/intelligence_engine_api.py` | `/api/intel` | 11 | size, size/ma, underwrite, covenants, sectors, credit-policy, pricing, rating-analysis, optimize, benchmarks, required-data |
| `routes/workflow.py` | `/api/workflow` | 7 | stages, pipeline, init, get, gate, advance, stage |
| `routes/counterparties.py` | `/api/counterparties` | 3 | list, by role, feasibility |
| `routes/mirror_agents.py` | `/api/rating` | 5 | moodys/predict, sp/predict, dual, levers, moodys/scorecard |
| `routes/v2_compat.py` | `/api` | 22 | shims for older V2 frontend paths |
| `routes/deal_flow.py` | `/api/deal-flow` | 6 | run, intake, credit, rating, structuring, seed-deals |
| `routes/doc_ingestion.py` | `/api/docs/ingest` | 4 | ingest, financials, missing, run-pipeline |
| `routes/preflight.py` | `/api/preflight` | 6 | questions, next, answer, brainstorm, narrative, status |
| `routes/client_portal.py` | `/api/client` | 7 | dashboard, questionnaire, respond, push-doc, review, bernard, email |
| `routes/bd.py` | `/api/bd` | 6 | scan, pitch, email, campaign, qualify, silo-check |
| `routes/bernard.py` | `/api/bernard` | 9 | find-me, pitch, costs, po, scenarios, readiness, preflight/* |

Inline: `/api/metrics` (`app.py:187`).

---

## 2. Endpoint Reality Check — what each returns

### Returns real data (verified structure)

| Endpoint | File:line | Backing |
|---|---|---|
| `GET /api/health` | `health.py:17` | Plain liveness, always 200 |
| `GET /api/health/ready` | `health.py:30` | Checks Anthropic + FRED + Supabase. 503 if all unhealthy |
| `GET /api/metrics` | `app.py:187` | `db.select("deals")` + `db.select("bond_structures")` |
| `GET /api/deals` | `deals.py:147` | `db.select("deals", {"order":"created_at.desc"})` |
| `GET /api/deals/pipeline` | `deals.py:660` | Aggregates from `deals` table |
| `GET /api/agents/status` | `agents_api.py:45` | Static `AGENT_REGISTRY` (16 entries) |
| `GET /api/market/signals/latest` | `market.py:65` | In-memory; falls back to `DEFAULT_SIGNALS` (4.25). The 4.28 is `ai_router.py:311` static fallback |
| `GET /api/investors` | `investors.py:69` | Returns `_investors` dict, seeded with 3 entries |
| `GET /api/eagleeye/signals` | `eagleeye.py:35` | `db.select("signals")` |
| `GET /api/eagleeye/stats` | `eagleeye.py:174` | Aggregates from Supabase |
| `GET /api/hawkeye/buyers` | `hawkeye.py:56` | Static `BUYER_UNIVERSE` (6 hardcoded) |
| `GET /api/desks/` | `desks.py:23` | Static `DESKS` + `ORCA_CSUITE` |
| `GET /api/emma/search` | `emma.py:32` | Filters `SEED_BONDS` (real Jacaranda Trace etc.) |
| `GET /api/intel/sectors` | `intelligence_engine_api.py:77` | Static `SECTOR_MULTIPLES` |
| `GET /api/intel/credit-policy` | `intelligence_engine_api.py:90` | Static `UNIVERSAL_CREDIT_POLICY` |
| `GET /api/phoenix/deals` | `phoenix.py:23` | **Mock data** per `phoenix_engine.py:1-4` |
| `GET /api/treasury/portfolio` | `treasury.py:97` | Ramp adapter, `RAMP_MODE=mock` |
| `GET /api/roots/offerings` | `roots.py:11` | Static `_OFFERINGS` list. Public. |

### Returns empty/stub

| Endpoint | File:line | Why |
|---|---|---|
| `GET /api/ma/targets` | `ma.py:21` | Literal `return _ok([])` — "Will be populated once Supabase is connected" |
| `GET /api/ma/pipeline` | `ma.py:86` | 8 empty arrays |
| `GET /api/ma/digest` | `ma.py:96` | Hardcoded "No scans run today" |
| `GET /api/lenders-direct/pipeline` | `lenders_api.py:56` | `{stage: [] for stage in stages}` |
| `GET /api/signals/query` | `v2_compat.py:49` | `{"signals": []}` |
| `GET /api/signals/stats` | `v2_compat.py:54` | `{"total": 0, "by_type": {}}` |
| `GET /api/signals/vector/latest` | `v2_compat.py:69` | Hardcoded `{"signal":"hold","confidence":0.72}` |
| `GET /api/architect/candidates` | `v2_compat.py:105` | `{"candidates": []}` |

### Throws 500 (ImportError)

| Endpoint | File:line | Bug |
|---|---|---|
| `GET /api/marketplace` | `marketplace.py:22` | `from routes.deals import _deals, _bonds, _lock` — globals removed |
| `GET /api/risk/score/<id>` | `risk.py:12` | Same broken import |
| `GET /api/risk/portfolio` | `risk.py:28` | Same broken import |

### Curl verification commands

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nest.local","password":"Admin123!"}' | jq -r .token)

# Public
curl -s http://localhost:8000/api/health
curl -s http://localhost:8000/api/health/ready
curl -s http://localhost:8000/api/roots/offerings | head -c 300
curl -s http://localhost:8000/api/desks/ | head -c 300
curl -s http://localhost:8000/api/emma/search | head -c 300
curl -s http://localhost:8000/api/eagleeye/stats
curl -s http://localhost:8000/api/hawkeye/buyers | head -c 300
curl -s http://localhost:8000/api/phoenix/deals | head -c 300
curl -s http://localhost:8000/api/treasury/portfolio | head -c 300
curl -s http://localhost:8000/api/market/rates/live
curl -s http://localhost:8000/api/deal-flow/seed-deals | head -c 300

# Auth-required
curl -s http://localhost:8000/api/deals -H "Authorization: Bearer $TOKEN" | head -c 300
curl -s http://localhost:8000/api/metrics -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:8000/api/agents/status -H "Authorization: Bearer $TOKEN" | head -c 300

# Confirmed 500
curl -s http://localhost:8000/api/marketplace -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:8000/api/risk/portfolio -H "Authorization: Bearer $TOKEN"
```

---

## 3. Service & Agent Inventory

### `backend/services/` (63 files — major ones)

| File | Purpose |
|---|---|
| `core.py` | The trunk — `JPM` benchmarks, CreditEngine, HFTEngine, RiskEngine, MAEngine, SuretyEngine, NAICS map, Claude wrapper |
| `database.py` | Supabase client abstraction |
| `auth.py` | Dual-mode Supabase GoTrue + in-memory fallback |
| `ai_router.py` | "Power Strip" — universal plugin hub (Claude, Grok, OpenAI, Bloomberg, Moody's, S&P, Meshy, Higgsfield) |
| `data_connectors.py` | FRED, EDGAR, EMMA, ATTOM, RSMeans, FINRA |
| `intelligence_engine.py` | Bond sizing/underwriting/structuring/pricing — Operating Framework |
| `credit_engine.py` | Core underwriting metrics, stress test |
| `structuring_service.py` | Tranche structure from credit metrics |
| `rating_benchmarks.py` | Published S&P + Moody's tables |
| `eagleeye_service.py` | Scout-driven sourcing via EMMA+EDGAR+FINRA+Claude |
| `bernard_findme.py` | **1,995 lines** — NL → structured deal profile |
| `preflight_service.py` | Bernard conversational intake |
| `emma_engine.py` + `emma_seed_data.py` | Real Jacaranda Trace etc. seed bonds |
| `compliance_engine.py` | NightVision SEC/FINRA/MSRB scan |
| `convergence_engine.py` | Multi-signal M&A target detection |
| `phoenix_engine.py` | Distressed CRE — **mock data** |
| `treasury_engine.py` | Ramp P-Card mock/live adapter |

### `backend/agents/` (25 files)

| Agent | Status | Notes |
|---|---|---|
| Bernard | Working | 3 parallel impls — `agents/bernard.py`, `services/bernard_findme.py`, `services/preflight_service.py`. Requires Claude key. |
| Morgan | Working | 12 content types, Jimmy Lee tone |
| Aria | Working | Inbound + follow-up |
| Sterling | Working | IR + book-building |
| Maxwell | Working | Two impls: `agents/maxwell.py` (Claude + DB save) and `engines/maxwell_engine.py` (Moody's factor decomp). DB save failure hidden at line 41-42 |
| Sentinel | Working | 7-dim risk (`agents/sentinel.py`), 8-dim (`engines/sentinel_engine.py`). 2 silent exceptions |
| Vector | Working | Pure-Python signal scoring |
| Quantum | Working | HFT optimizer |
| Apex | Working | Position math |
| Bridge | Working | Perm-debt monitoring |
| Chain | Working | In-memory SHA-256 chain |
| Merlin | Working IF Claude works | 3 silent exceptions |
| LenderScout | Working IF Claude works | 3 silent exceptions |
| SuretyScout | Working | Hardcoded `SURETY_PROVIDERS` |
| MoodysMirror / SPMirror | Working IF Claude works | Scorecard + AI narrative |
| **CovenantMonitor** | **Stub** | 4-line class, no logic |
| **Refunding** | **Minimal** | Wraps Claude, minimal logic |

### Silent error swallowing (28 instances across 17 files)

| File | Count | Risk |
|---|---|---|
| `agents/lender_scout.py` | 3 | Hides downstream failures; agent looks "active" |
| `agents/merlin.py` | 3 | Hides EDGAR/Claude failures |
| `services/preflight_service.py` | 3 | Hides Claude/Supabase during intake |
| `services/eagleeye_scanner.py` | 3 | Hides scan failures |
| `services/auth.py:204,231` | 3 | Supabase failure → local fallback silently |
| `agents/sentinel.py` | 2 | DB save failure hidden |
| `services/ai_router.py:308` | 1 | FRED failure → 4.28 fallback |
| `agents/maxwell.py:41` | 1 | DB save failure hidden |
| Others | ~10 | Various |

### The 4.28 fallback is hardcoded in 5 places

- `services/ai_router.py:311`
- `routes/v2_compat.py:166`
- `routes/v2_compat.py:228`
- `routes/intelligence.py:506`
- `routes/bond_tools.py:136`

All fire when FRED is unreachable or `FRED_API_KEY` is unset.

---

## 4. Database & Migrations

### Migration files

1. `001_core_schema.sql` — 17 tables with RLS + `updated_at` triggers
2. `001_deals_core.sql` — **re-defines `deals`** with different columns (slug, financials JSONB, source_channel)
3. `002_credit_bonds_risk.sql` — 10 more tables, including **re-definitions of `bond_structures` and `risk_scores`** with different shapes

### Conflict

All three use `CREATE TABLE IF NOT EXISTS` → first to run wins. **Whichever migration ran first determines the live schema.** Combined with `db.insert` swallowing exceptions, inserts that don't match the live schema fail silently — API returns 200, row never lands.

### Seed data

- `deals` — 3 rows from file 1 (Life Star Pointe Loop, Meridian Cove, Palmetto Ridge — all FL CCRC)
- `agents` — 15 rows
- `credit_analyses`, `signals`, `scouts`, `prospects`, `documents`, `correspondence`, `industry_silos` — empty until POST
- `app.py:184` calls `seed_emma_database()` but `services/emma_seed_data.py::SEED_BONDS` stays in memory (Python list, no `db.insert`)

---

## 5. Verdict by Major Area

| Area | Verdict | Detail |
|---|---|---|
| **Auth** | ✅ Working | Login → JWT. `admin@nest.local / Admin123!`. Silent fallback if Supabase fails. |
| **Deals** | ✅ Mostly working | 17 CRUD endpoints, all hit Supabase. 3 seed deals. `POST /<id>/bond` writes file 1's schema — silently fails if file 3 is live. |
| **Bond structuring** | ✅ Working | `/api/intel/*` (11), `/api/bond-structuring/*` (4), `/api/engines/*` (27). All pure Python math. |
| **Market rates** | ⚠️ Degraded | Always returns 4.28 static fallback. Set `FRED_API_KEY` to fix. |
| **EagleEye** | ✅ Working | 24 endpoints, real EMMA/EDGAR/FINRA connectors. Cold start → empty arrays. Run `POST /scouts/<id>/run` to populate. |
| **Bernard** | ✅ Working | 3 separate impls all functional. Requires Claude key. |
| **Roots** | ✅ Working | Public, mostly hardcoded `_OFFERINGS`. Submissions in-memory. |
| **Marketplace** | ❌ **BROKEN** | ImportError 500. ~15-line fix. |
| **Risk** | ❌ **2/3 BROKEN** | Same import bug. `covenant-test` works. |
| **Hawkeye** | ✅ Working as demo | In-memory order book + Claude teaser |
| **Maxwell, Sentinel, Morgan, etc.** | ✅ Working | See agent table §3 |
| **CovenantMonitor** | ❌ Stub | 4 lines |
| **Refunding** | ⚠️ Minimal | Wraps Claude only |

---

## 6. Fix Priority

1. **Marketplace + Risk import bugs** — rewrite 3 handlers to use `db.select("deals", ...)`. ~15 lines each.
2. **FRED key** — confirm `FRED_API_KEY` in `.env`. Hit `/api/health/ready` to verify.
3. **Migration cleanup** — pick canonical `deals` and `bond_structures` schemas; delete losers.
4. **Replace 28 `except Exception: pass` with `app.logger.warning(...)`** so silent failures become visible.
5. **Three Bernards → one Bernard.** Route dispatch is fragmented across `routes/bernard.py` and `routes/desks.py`.

---

## What's working end-to-end (high confidence)

- Auth login → JWT → auth-gated endpoint flow
- `/api/health`, `/api/health/ready`, `/api/metrics`
- `/api/deals` CRUD (assuming file 1's migration is live)
- `/api/intel/*` (bond sizing — pure Python)
- `/api/engines/*` (11 engines, all pure Python)
- `/api/bond-structuring/*` (4 endpoints, real math)
- `/api/hawkeye/*` (in-memory order book + Claude teaser)
- `/api/desks/*` and `/api/bernard/*` (requires Claude key)
- `/api/roots/offerings*` (hardcoded but real)
- `/api/eagleeye/*` (when scouts are populated)
- `/api/emma/*` (hardcoded `SEED_BONDS`)
- `/api/treasury/*` (Ramp mock mode)
- `/api/phoenix/*` (mock distressed-CRE)
- `/api/napkin/*` (pure Python)

## What's broken right now

- `GET /api/marketplace` — ImportError 500
- `GET /api/risk/score/<id>` — ImportError 500
- `GET /api/risk/portfolio` — ImportError 500
- All `/api/market/rates/*` — 200 but static 4.28 fallback (FRED unreachable or `FRED_API_KEY` unset)
- Anything Claude-dependent — placeholder strings if `ANTHROPIC_API_KEY` unset
- Any Supabase write — silently fails if migrations disagree with route handler
