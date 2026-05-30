# CTO Handoff — NEST V4 · 2026-05-29

**For:** Keven (CTO)
**From:** Sean Gilmore (founder) — drafted via Claude session
**Window covered:** 2026-05-28 through 2026-05-29
**Single-page TL;DR at the bottom.**

---

## 1. State of the platform you're inheriting

### Repos and runtimes
- **GitHub:** `BusinessBear1981/NEST-ADVISORS-V3` (private). Local on Sean's machine is **21 commits ahead of `origin/main`**. Those 21 are real backend value (engine work). Frontend is deployed from a separate branch — `origin/claude/v3-audit-v2-integration-iqq7d` — which is what nestadvisors.ai actually serves and what was pulled to `frontend-v2/` locally as the canonical V4 cinematic frontend.
- **Backend:** Flask, port 8000, `backend/` directory. `python app.py` to start. 403 endpoints across 48 blueprints — most are real Python (not stubs); a few specific surfaces are broken (see §3).
- **Frontend (V4 cinematic):** Vite + React + Tailwind + framer-motion + lucide, `frontend-v2/`, port 8101 locally. Vercel deploys this to nestadvisors.ai. Design language is gold (`#C4A048`) on dark forest (`#030A06` / `#0D2218`) institutional cockpit — Cormorant Garamond headings, IBM Plex Mono for figures, Space Grotesk body. **The design is LOCKED.** Per memory and this session's confirmation, no design rewrites — all new work uses existing tokens.
- **Frontend (V3 minimalist, deprecated):** `frontend/` directory. Has the public landing page (`(public)/page.tsx`) and a few auth pages. Most admin routes are empty shells. Not the canonical surface — use V4.
- **Backend on production:** Hosted on Render at `https://nest-backend-q789.onrender.com`. Vercel frontend uses that URL via `NEXT_PUBLIC_API_URL` for the deployed site.
- **Database:** Supabase. Migrations in `backend/migrations/`. Three legacy migrations have conflicting schemas for `deals`, `bond_structures`, `risk_scores` — see §3.

### Live deals already in the platform's mental model
Jacaranda Trace ($231M FL CCRC refi — the structural blueprint), Convivial St. Petersburg ($172M FL senior living construction with underwater Ziegler acquisition seed bond), Palmetto Ridge ($78M), Meridian Cove ($142M), Life Star Pointe Loop ($231M).

### Outside relationships in motion
- **Britehorn Securities** (FINRA BD #36402, Brett Story Founding Partner, brett@britehorn.com) — inaugural Placement Partner and BD-sponsorship host. Outreach launched 2026-05-29 with three deal teasers (HBO2, Celebrity Crush, Jacaranda) framed as platform engagement, not transactional pitch. Britehorn is the answer to "we need a BD" — they host 40+ outside-banker registered reps under their license; Sean becomes a Britehorn-sponsored rep once Series 7+24+63 clears.
- **See:** `docs/seeds/2026-05-29-brett-launch.json` for the canonical Britehorn + Brett + Britehorn-team seed data, ready to load into Contacts as soon as the Supabase migration runs.

---

## 2. Operating model locked this session (read these first)

Two ADRs codify the decisions. Both are short — read them in this order.

- **`docs/adr/0001-operating-model-licensing-path.md`** — Layered licensing. NEST is NOT standing up its own Broker-Dealer as a prerequisite to revenue. Three lawful capture mechanisms layered:
  - **Track 1 — Britehorn-sponsored rep** (Sean takes Series 7+24+63, ~3 mo) — fastest path to transaction-based commissions on any deal through Britehorn
  - **Track 2 — NEST as MSRB Municipal Advisor** (Sean takes Series 50+54, ~4-5 mo) — NEST-direct transaction fees on muni
  - **Track 3 — NEST-owned Broker-Dealer** (~12-18 mo, optional, can stay on Britehorn platform indefinitely)
  - Every `Deal` carries a `regulatory_path` enum: `path_a_advisory_partnered` | `bd_sponsored_via_britehorn` | `ma_nest_direct` | `bd_nest_direct`. Fee mechanics dispatch on this field.

- **`docs/adr/0002-deal-lifecycle-entry-points.md`** — Single front door. Only Deal Input inserts into `deals`. EagleEye carries a "Promote to Deal" action that navigates the founder to Deal Input with prefilled fields. NAICS → bond type → required documents is a **deterministic rules engine, not AI inference**. Bernard explains the engine output; doesn't override it. Bernard Intake Brainstorm fires post-Deal-Input, pre-Roots — first-look memo + targeted gap-filling Q&A — founder greenlights to advance to Roots Stage 1.

### Domain glossary
**`CONTEXT.md`** — sharpened with: BD disambiguation (Business Development vs Broker-Dealer), Licensing path, Britehorn (active Placement Partner), Advisory Fee, Arrangement Fee (substance-over-form constraint — no % of par, milestone-tied to deliverables, owed even if deal terminates), Trail Fee, Placement Fee, Placement Partner, Contact (universal address book), Counterparty (role assignment on Deal pointing at Contact).

---

## 3. What's broken — surgical fixes you can knock out fast

From the backend audit at `docs/audit/2026-05-28-backend-audit.md`:

| Issue | Where | Cost | Fix |
|---|---|---|---|
| `GET /api/marketplace` → 500 ImportError | `routes/marketplace.py:22` does `from routes.deals import _deals, _bonds, _lock`. Those globals were removed when deals moved to Supabase. | ~15 lines | Rewrite handler to use `db.select("deals", {"status": "in.(active,closing)"})` directly. |
| `GET /api/risk/score/<id>` → 500 ImportError | `routes/risk.py:12` — same import bug | ~15 lines | Same pattern as marketplace |
| `GET /api/risk/portfolio` → 500 ImportError | `routes/risk.py:28` — same import bug | ~15 lines | Same pattern |
| `/api/market/rates/live` returns `4.28` for everything | `FRED_API_KEY` is not set OR FRED is unreachable. Static fallback hardcoded in **5 places**: `services/ai_router.py:311`, `routes/v2_compat.py:166,228`, `routes/intelligence.py:506`, `routes/bond_tools.py:136`. | 1 env var | Set `FRED_API_KEY` in backend env. Real key is free from fred.stlouisfed.org. Hit `/api/health/ready` to verify FRED status. |
| Three migration files redefine `deals`, `bond_structures`, `risk_scores` with conflicting shapes | `001_core_schema.sql`, `001_deals_core.sql`, `002_credit_bonds_risk.sql` — all use `CREATE TABLE IF NOT EXISTS` so first one to run wins. | Decision needed | Pick canonical schema, drop the losers. Whichever one is live determines which routes actually persist correctly. Best to consolidate into a single `001_canonical_schema.sql` and run that against a fresh project. |
| 28 `except Exception: pass` blocks across 17 files | grep `except Exception:\\n\\s+pass` to find them all. Top offenders: `agents/maxwell.py:41`, `agents/sentinel.py`, `services/auth.py:204,231`, `services/ai_router.py:308`, `services/eagleeye_scanner.py`, `services/preflight_service.py`. | Mechanical | Replace each with `app.logger.warning(...)` so silent failures become visible. Most are around DB inserts that silently no-op when schemas don't match. |
| `structuring_service.py` was writing wrong columns to `bond_structures` | I fixed it in this session — now writes schema-correct `par_amount`, `series` jsonb, `capital_stack` jsonb, `waterfall` jsonb. | done | Verify against the canonical `bond_structures` schema after you resolve the migration conflict. |
| `eagleeye_service.create_scout()` silent insert failure | I attempted a fix this session but Python module caching didn't pick it up cleanly. Status: needs your verification. Symptom: scout creation returns 201 with full data, but the `scouts` table has 0 rows after. | Investigate | Likely either (a) `is_active`/`total_signals_found` column renames I made didn't take effect because module reload didn't fire, or (b) deeper Supabase REST API rejection on a column not in your live schema. |

---

## 4. What got built this session

### Two ADRs
- `docs/adr/0001-operating-model-licensing-path.md` (licensing decision)
- `docs/adr/0002-deal-lifecycle-entry-points.md` (Deal Input front door, EagleEye promote, NAICS rules engine, Intake Brainstorm)

### Five new backend blueprints (registered in `app.py`)
| Prefix | Service | Migration | Purpose |
|---|---|---|---|
| `/api/contacts` | `services/contacts_service.py` | `003_contacts_counterparties.sql` | Universal address book; idempotent loader for Britehorn seed |
| `/api/counterparties/deal/<id>` (extension of existing) | `services/counterparty_assignments_service.py` | (same migration) | Per-deal role assignments with fee economics |
| `/api/outreach` | `services/outreach_service.py` | (same migration) | Outreach event log |
| `/api/naics` | `services/naics_rules_engine.py` | n/a | Deterministic NAICS → bond type → required docs lookup. Sourced from Bible Appendix A + C + Silo 4. Pure Python, no LLM. |
| `/api/intake-brainstorm` | `services/intake_brainstorm.py` | `004_intake_brainstorm.sql` | Post-Deal-Input Bernard memo + gap-fill Q&A. Calls NAICS engine + JPM benchmarks. |
| `/api/study` | `services/study_service.py` | `005_study_progress.sql` | Series 50/54 (populated) + Series 7/24/63 (placeholder) curriculum + per-user progress |
| `/api/surety-universe` | `services/surety_universe_service.py` | n/a | EMMA reverse-engineer of surety / bond insurance / LOC / federal credit-enhancement universe. Backend-only. **(Agent 8 still running as of doc write — verify on disk.)** |

### Frontend additions (V4 cinematic, no design changes)
- **EagleEyeV2.tsx** — `promoteSignalToDeal()` + small gold "Promote" chip on each signal card. ADR-0002 invariant: navigation-only, never inserts into `deals`.
- **DealInputPage.tsx** — URL-param prefill (`?from_signal=...&naics=...&state=...&sector=...&entity=...&estimated_size=...&source=eagleeye`), provenance badge, POST body includes `source_signal_id` + `source_channel`. Post-submit flow replaces the old PreflightInterview with the Bernard Intake Brainstorm view (two-column memo + 10 gap questions + greenlight/park action bar).
- **StudyPage.tsx** — `/study` route, tabbed for Series 50, 54, 7, 24/63. Sidebar entry added to AppShell SYSTEM section with `GraduationCap` icon.
- **AppShell.tsx** — reordered ORIGINATION (EagleEye → Roots → New Deal first), added Study link, added Roots link earlier in session. Otherwise unchanged.

### Backend refactor
- **`billing_engine.py`** — refactored to dispatch on `regulatory_path`. Added `FEE_SCHEDULE_PATH_A` (tiered flat Engagement Retainer + Arrangement Fee + Trail Fee — never % of par). Added `nest_pnl()` and `cost_of_issuance()` views. Renamed `FEE_SCHEDULE → FEE_SCHEDULE_DIRECT` with back-compat alias.

### Research artifacts in `docs/research/`
| File | Authorized | Useful |
|---|---|---|
| `2026-05-28-feasibility-study-requirements.md` | ✓ | Yes — 14-section CCRC feasibility schema + variant decision tree |
| `2026-05-28-surety-and-credit-enhancement-requirements.md` | self-generated by agent | Yes — Bible §2.18 surety carrier universe, AUM-phase progression, state-by-state inventory |
| `2026-05-29-partner-outreach-repository.md` | self-generated by agent | Maybe — 9-category partner schema, EMMA harvest playbook, ~120 seed firms |
| `2026-05-29-naics-rules-engine-data.md` | self-generated by agent | Possibly redundant with `services/naics_rules_engine.py` — review for delta |

### Brett launch seed data
- `docs/seeds/2026-05-29-brett-launch.json` — Britehorn firm + Britehorn Partners firm + Brett, Bobbi, Steve, Andrew, Natalia as person Contacts + 4 deal counterparty assignments (Jacaranda, St. Pete, HBO2, Celebrity Crush) + 1 outreach event scheduled 2026-05-29. **Idempotent.** Run `curl -X POST http://localhost:8000/api/contacts/seed -H "Content-Type: application/json" -d '{}'` after the contacts migration runs.

---

## 5. To make any of this actually run, three steps

1. **Run the three new Supabase migrations in order** — paste each `.sql` into Supabase SQL Editor → Run:
   - `backend/migrations/003_contacts_counterparties.sql`
   - `backend/migrations/004_intake_brainstorm.sql`
   - `backend/migrations/005_study_progress.sql`

2. **Restart Flask backend** — `python backend/app.py`. New blueprints come online.

3. **Frontend Vite hot-reloads** automatically — just refresh the browser at `localhost:8101`.

Then load `/eagleeye-v2` → click Promote on a signal → see Deal Input prefilled. Submit → see the Bernard Intake Brainstorm with NAICS-driven memo + 10 gap questions. Load `/study` to see Series 50/54 outlines. Load `/deals` to see Jacaranda + St. Pete + 3 others.

Run the Brett seed loader to get Contacts populated.

---

## 6. Open architectural questions for you

1. **Migration consolidation.** Three competing schemas for `deals`. Pick the canonical one and drop the losers. My read: file 3 (`002_credit_bonds_risk.sql`) is the cleanest, but file 1 has the `state` and `bond_face` columns that existing `routes/deals.py` writes. Worth a 30-minute reconciliation pass.

2. **`regulatory_path` column on `deals`.** Doesn't exist yet. Agent A's `billing_engine.py` refactor reads `deal["regulatory_path"]` with a default of `"path_a_advisory_partnered"`. Needs a migration to add the column and a frontend field for it. Default existing rows to `path_a_advisory_partnered`.

3. **Credit metrics on DealInputPage.** Agent 6 (Intake Brainstorm) flagged that the existing Deal Input form doesn't capture DSCR/LTV/D-EBITDA/ICR. The credit profile snapshot returns "unknown" for every metric without these. Recommendation: add a collapsible "Credit Inputs (optional)" card.

4. **Three Bernards.** `routes/bernard.py` + `services/bernard_findme.py` (1,995 lines) + `services/preflight_service.py` + now my new `services/intake_brainstorm.py` are four overlapping Bernard surfaces. Plus the V4 frontend has BernardConcierge mounted globally (with the legacy "bruv/mate" prompt — see Frontend Audit), a per-page `/bernard` chat, and per-deal `Bernard.tsx`. Three Bernards on screen at once at worst. Architectural cleanup needed.

5. **Frontend audit punch list.** `docs/audit/2026-05-28-frontend-audit.md` — ~200 findings. Top issue: BernardConcierge.tsx still has the "bruv/mate/muppet" Jax Teller voice in its system prompt (per `project_bernard` memory, tone was changed to professional institutional on 2026-05-21; that file didn't get the memo). Plus "Sarah Chen" appears in 4 different roles, "Apex Capital Partners" in 4, multiple pages render literal "demo" / "frontend-demo simulated" copy. Most fixes are surgical text edits. Audit doc lists each finding by file:line.

6. **CTO scope on backend perfection.** Sean explicitly handed backend perfection to you (this session). The backend audit at `docs/audit/2026-05-28-backend-audit.md` is your starting hit-list. The architectural decisions (ADRs 1 + 2) are locked — your work is operational excellence on top of those, not relitigating them.

---

## 7. Single-page TL;DR

You inherit a platform with:
- A working V4 cinematic frontend, locked design language, three new pages added cleanly in the same idiom
- A 403-endpoint backend with five new blueprints registered, three new migrations to run, real engine logic underneath, and a documented list of 3 specific 500-ImportError fixes + FRED-key + migration cleanup + 28 silent-except cleanups
- Two ADRs that lock the operating model (licensing path, deal lifecycle)
- A sharpened CONTEXT.md glossary
- Two audit docs (backend + frontend) listing every known issue by file:line
- A real Placement Partner relationship in motion (Britehorn / Brett Story) with seed data ready to load
- Five live deals already conceptually in the system, with Jacaranda Trace as the structural blueprint

**The first hour:** run the three new migrations, restart Flask, load the Brett seed, click around `localhost:8101` to see the surface state. Then pick whichever of the §6 architectural questions feels most blocking.

**The first week:** kill the three 500 ImportErrors, set FRED key, consolidate migrations, replace `except Exception: pass` with logged warnings, unify the four Bernard surfaces into one canonical orchestrator. After that the platform stops feeling fragile.

Hit Sean for anything ambiguous. Memory and grill-with-docs transcripts are in `memory/MEMORY.md` index — every prior architectural decision has a memory entry. `project_nest_operating_model.md` is the most recent and the most load-bearing.
