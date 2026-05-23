# V1 Intelligence Engines to Port to V3

**These modules exist in `nest/frontend/app/(app)/` and call REAL backend APIs.**
**They need to be adapted from Next.js App Router → Vite/React and styled in the V3 terminal aesthetic.**

## Priority 1 — The Good Stuff

### Dashboard (534 lines) — `frontend/app/(app)/dashboard/page.tsx`
- Pulls live: deals, agent status, market signals, HFT war chest, blockchain events
- APIs: `/api/deals`, `/api/agents/status`, `/api/market/signals/latest`, `/api/fund/hft/war-chest`, `/api/blockchain/events`
- KPIs: Total Pipeline, Active Deals, Agents Active, Vector recommendation
- Rate ticker: Treasury 10yr, SOFR, VIX
- Deal cards with readiness bars
- Agent fleet grid (15 agents)
- HFT War Chest strip (AUM, YTD return, LC capacity, M&A deploy)
- Blockchain event feed

### Forensic Audit (128 lines) — `frontend/app/(app)/admin/forensic/page.tsx`
- APIs: `/api/audit/standards`, `/api/audit/run`
- Expandable audit category list with checks
- "Run Full Forensic Audit" button → returns overall score, clean opinion, JP Morgan ready flag
- Critical issues list with recommendations
- Category breakdown with progress bars
- Audit trail hash

### Bond Intelligence (267 lines) — `frontend/app/(app)/admin/bond-intel/page.tsx`
- 5 tabs: Rating Readiness, Milestone Gates, Professional Team, Phase Bonds, 100% Path
- APIs: `/api/bond-intel/milestones`, `/api/bond-intel/team`, `/api/bond-intel/100pct-path`, `/api/bond-intel/types`, `/api/bond-intel/rating-readiness`, `/api/phase-bonds/structure`
- Rating Readiness: input form (DSCR, LTV, presales, operator years, checkboxes) → returns achievable ratings, gaps, coupon estimate
- Phase Bonds: input TPC + base rate → returns multi-phase structure with rates, terms, call/put
- NEST Economics comparison (phase bonds vs single bond)

### AI Tools / Central Nervous System (284 lines) — `frontend/app/(app)/admin/ai-tools/page.tsx`
- APIs: `/api/nervous-system/dashboard`, `/api/data/market-rates`, `/api/nervous-system/ingest`
- Plugin grid with logos that LIGHT UP when active (13 plugins across 6 categories)
- Live market rates panel
- Task router: select type + enter prompt → routes to correct AI agent
- Route result display with plugin badge, latency, token count
- Recent activity table

### Risk / Sentinel (83 lines) — `frontend/app/(app)/admin/risk/page.tsx`
- APIs: `/api/deals`, `/api/bond-tools/audit`
- 7-dimension risk bars per deal (Market, Construction, Credit, Operational, Regulatory, Sponsor, Environmental)
- Click deal → runs Sentinel audit → returns grade, composite score, recommendation, passed/failed/blocker counts

### Modeling / Prometheus (141 lines) — `frontend/app/(app)/admin/modeling/page.tsx`
- 3 tabs: Bond Grading, Stress Testing, Bond Optimization
- APIs: `/api/bond-tools/grade`, `/api/bond-tools/optimize`
- Bond Grading: base grade → enhanced grade with structural enhancements, component scores, gap analysis
- Stress Testing: 4 scenarios (Base/Downside/Stress/Catastrophic) with DSCR outcomes
- Bond Optimization: current rate vs market rate, recommended actions, annual savings, additional capacity

### Lender Scout (88 lines) — `frontend/app/(app)/admin/lenders/page.tsx`
- APIs: `/api/surety/providers`, `/api/lenders-direct/search`
- 800+ lender database with provider cards (type, premium bps, turnaround days, relationship status)
- Lender pipeline kanban (Targeted → Outreach → Responded → Term Sheet → Committed → Closed)
- Search: deal params → matched lenders

### Marketing Studio (219 lines) — `frontend/app/(app)/admin/marketing/page.tsx`
- APIs: marketing.ts lib (listContentTypes, generate, generateBatch, listHistory)
- 3-column layout: content type selector + output preview + history
- Content types: exec summary, teaser, term sheet cover, deck slide
- Jimmy Lee tone
- Batch: full deal marketing package in one click
- Copy/download/print actions
- Markdown rendering with react-markdown

## Priority 2

### Monitor (140 lines) — `frontend/app/(app)/admin/monitor/page.tsx`
### Blockchain (109 lines) — `frontend/app/(app)/admin/blockchain/page.tsx`
### HFT Fund (95 lines) — `frontend/app/(app)/fund/page.tsx`
### Licensing (216 lines) — `frontend/app/(app)/admin/licensing/page.tsx`
### Marketplace (96 lines) — `frontend/app/(app)/admin/marketplace/page.tsx`

## Porting Rules
- Keep V3 stack (Vite + React, NOT Next.js App Router)
- Replace `'use client'` with nothing (Vite is all client)
- Replace `process.env.NEXT_PUBLIC_API_URL` with empty string (Vite proxy handles it)
- Replace `useRouter` / `router.push` with wouter `useLocation`
- Replace V1 CSS classes (serif, sage, mono, card, kpi, etc.) with V3 Tailwind + inline styles
- Keep ALL API calls — the backend services exist and respond
- Keep ALL intelligence logic — the grading, scoring, routing, structuring is the value
