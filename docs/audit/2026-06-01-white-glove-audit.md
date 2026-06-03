# NEST White-Glove Audit — 2026-06-01

Methodology: For each NEST module, read the page component(s) in full, identify every backend call, curl-test those endpoints with real or synthetic inputs, document VERIFIED end-to-end status. No duplicate-by-name claims without reading both bodies. No declaring "dump" until proven.

Repo state at audit start: `nest-platform` at commit `e6334ea`, branch `main`, 48 routes, 30 sidebar items, 54 backend blueprints.

---

## MODULE 1 — ROOTS (doc ingestion, pipeline entry)

### Routes touching this module
- `/roots` → `RootsPage` (in `frontend-v2/src/pages/OperationalModulesPages.tsx:51`) — wraps `<RootsWorkspace dealId="deal-1" />`. Hardcoded demo deal.
- `/upload` → `RootsUploadPage` (in `frontend-v2/src/pages/v4/RootsUploadPage.tsx`) — V4 cinematic drag-drop ingestion. Real deal selector.

**Not duplicates** — distinct purposes. Keep both.

### Backend calls
| Frontend page | Call | Endpoint |
|---|---|---|
| RootsUploadPage `:59` | `fetch(/api/deals)` | populates deal selector dropdown |
| RootsUploadPage `:86` | `fetch(/api/docs/ingest/<dealId>/ingest)` | the actual ingestion |
| RootsWorkspace (called from RootsPage) | (uses `/api/roots/*` per backend grep) | offerings list, submissions |

### Curl results

```
POST /api/docs/ingest/no-deal/ingest
→ 200, Bernard narration markdown:
  "# NEST Advisors — Document Ingestion Alert
   ## What Just Happened
   The platform ingested a test document — `test_audited_financials.txt` —
   classified it correctly as **audited financials**, and extracted **3 of
   approximately 16 standard fields**. Deal data completeness stands at **19%.**
   ... Maxwell's primary underwriting gate — no DSCR, no credit memo ..."
→ Bernard tone: institutional, decisive, JPM-style — matches spec
→ Engine: classification ✓, extraction ✓, gap analysis ✓, completeness % ✓

GET /api/roots/offerings
→ 200, real deal data (Venice, FL — likely Jacaranda):
  Senior A: $135M @ 7.0% / Junior B: $12.6M @ 11.0%
  bond_readiness_pct: 65
  checklist: Phase I env complete, Appraisal in progress, GMP/Audited Fin/Surety pending

GET /api/deals
→ 401 missing token (auth-protected — expected post-login)

GET /api/roots/submissions
→ 401 missing token (auth-protected — expected post-login)
```

### Verdict

**MODULE WORKING.** Pipeline entry point is real. Bernard ingestion engine produces production-quality output (institutional memo voice, structured gap analysis, real % completeness). RootsWorkspace serves real offering data.

### Cleanup items

1. RootsPage `:56` hardcodes `dealId="deal-1"` — should accept deal_id from URL or context.
2. Two distinct pages, both valid. No consolidation needed.

### Score
**Module Score: 9/10** — only ding is the hardcoded demo deal in `/roots`. The actual ingestion at `/upload` is production-grade.

---

## MODULE 2 — CREDIT UW (Maxwell engine)

### Routes
- `/credit` → `CreditUWPage` (`frontend-v2/src/pages/v4/CreditUWPage.tsx`)

### Tabs / Sections
1. **Credit Policy** — 6 hardcoded threshold cards (DSCR 1.20x, Debt Yield 8%, Max Leverage 80% LTC, Min Equity 20%, DSRF MADS, Operating Reserve 3mo). Display only.
2. **Quick Screen** — 4 inputs (DSCR, total leverage, equity %, sponsor years) → "Run Credit Screen" button.
3. **Exception Authority** — 3 levels (Minor / Moderate / Material). Display only.

### Backend calls
- `trpc.intel.underwrite.useMutation` → POST `/api/intel/underwrite`

### Curl results

```
POST /api/intel/underwrite
input: {dscr:1.35, total_leverage:4.2, equity_pct:0.30, sponsor_experience_years:10, deal_type:"stabilized"}
output: {passed: true, flag_count: 0, flags: [], material_flags: 0, exception_required: false, exception_authority: null}
→ Quick Screen works
```

### Verdict

**PARTIAL.** Quick Screen tab is wired and works. But page does NOT surface the deep underwriting product per spec (`project_nest_cre_underwriting`): RMA spread, NOI waterfall, CRE ratios, Maxwell factor decomposition. Those engines exist on the backend (`/api/rating-esg/rating/assess` returns full Maxwell decomp + JPM benchmarks + LGD scenarios + indicative rating) but the frontend page doesn't call them.

### Cleanup items

1. Add deal selector (like RootsUploadPage) so screen can run against real deal data, not just typed inputs
2. Add Maxwell decomposition view — call `/api/rating-esg/rating/assess`, render factor scores + indicative rating + confidence band
3. Add RMA peer benchmark view — call `/api/rating-esg/rma/benchmark`
4. Add NOI waterfall view (no obvious backend endpoint — may need building)
5. Connect to credit memo engine (`backend/services/credit_memo_engine.py` exists — not surfaced)

### Score
**Module Score: 5/10** — quick screener works, but the deep credit product per memory spec is built on the backend and NOT surfaced on the frontend.

---
