# NEST V3 — Complete Build Brief

**Date:** 2026-05-23
**From:** Sean Gilmore
**For:** Next Claude Code session / Kevin
**Repo:** github.com/Businessbear1981/NEST-ADVISORS-V3
**Local:** C:/Users/sgill/nest
**Backend:** Flask, port 8000 (271 routes)
**Frontend:** Vite + React + TypeScript, port 8100
**Priority:** CRITICAL — the platform looks like an investment bank but doesn't work like one yet. Numbers must flow through a real workflow. No placeholders. No fake generated deals.

---

## WHERE WE ARE (Honest State)

### What EXISTS and RUNS:
- Home page with bottom masthead
- Sidebar with full org chart (all sections, all links)
- 39 module pages (most are populated templates, not functional workflows)
- Backend: 271 Flask routes across treasury, phoenix, napkin, bond structuring, hawkeye, eagleeye, etc.
- TreasuryDesk (4 tabs, mock Ramp data)
- PhoenixDesk (3 tabs, 5 demo deals)
- Back of the Napkin calculator (backend working, frontend form needed)
- Bernard concierge (professional tone, routes to Claude API)
- Demo data seeded for covenants (6), draws (5), tenants (5)

### What DOES NOT WORK:
- **Operations Workbench is not built** — the deal detail page requires auth + a created deal, and the workflow between modules doesn't function
- **Command Center is static** — shows a bond command component, not a real pipeline view
- **No data flows between modules** — each module generates its own fake numbers independently
- **EagleEye is full of fabricated deals** — 1,103 lines of fake signals that don't match reality
- **Deal Intake doesn't feed downstream** — you can create a deal record but nothing computes from it
- **Dashboards show static numbers** — not computed from any real data
- **No real data connectors** — FRED, EMMA, EDGAR are specced but not built

---

## THE PRODUCT (What It Should Do)

NEST is a digital investment bank. The workflow is:

```
CLIENT/CREDIT OFFICER SUBMITS DEAL
  ↓
DEAL INTAKE (parameters entered: NOI, cap rate, loan amount, tenants, financials)
  ↓
ROOTS (documents uploaded, checklist tracked, Back of Napkin auto-runs)
  ↓
OPERATIONS WORKBENCH (deal lives here — all modules as tabs)
  ↓
  ├── Bond Desk: tranches computed from deal NOI/DSCR/LTV
  ├── Rating: credit grade computed from deal financials
  ├── Surety: premium estimated from deal loan amount
  ├── Treasury: budget categories from deal cost structure
  ├── Draws: schedule from deal budget
  ├── Covenants: thresholds from deal parameters
  ├── Hawkeye: investor matching from deal rating/size/sector
  └── All numbers are LIVE CALCULATIONS from the same source data
  ↓
PLACEMENT (Hawkeye matches investors, book builds, deal closes)
  ↓
POST-CLOSE MONITORING (covenants, draws, treasury)
```

**The #1 thing that needs to happen:** When deal parameters are entered, every downstream module computes from those parameters. Not fake data. Not placeholders. Real math.

---

## THE BUILD (Start to Finish)

### Phase 0: Fix What's Broken NOW
1. **Operations Workbench** — this is the CORE of the platform. A deal detail page where every module lives as a tab. It exists in code (OperationsPages.tsx → OperationsDealDetailPage) but requires creating a deal first, and the tabs don't compute from deal data. This needs to work without auth for demo purposes.
2. **Command Center** — needs to be the pipeline dashboard showing all deals with status, not a static bond command component
3. **Remove fake EagleEye data** — the 1,103 lines of fabricated signals make the platform look hollow

### Phase 1: Deal Data Foundation
4. **Deal data model** — comprehensive schema covering all deal types (Bond, M&A, Sparrow, Term Lending) with all parameters: property/company info, financials, loan terms, tenants, sponsors
5. **Deal Intake form** — real input form that captures all parameters. Different fields per deal type. Saves to backend.
6. **Deal API** — CRUD endpoints + computed metrics endpoints. When you GET a deal, it returns the entered parameters PLUS all computed metrics (DSCR, LTV, ICR, rating grade, tranche sizing, premium estimate)
7. **Seed 2-3 demo deals** — pre-loaded with realistic parameters so the platform has data to display on first load. Use Jacaranda Trace PLOM ($231M) as the anchor deal.

### Phase 2: Wire Modules to Deal Data  
8. **Bond Desk** reads deal parameters → computes tranche structure, waterfall, pricing
9. **Rating Intelligence** reads deal parameters → computes credit metrics against JP Morgan benchmarks
10. **Back of the Napkin** auto-runs when deal is created → stores results
11. **Surety** reads deal parameters → estimates premium, recommends LC strategy
12. **Treasury** generates budget categories from deal cost structure
13. **Covenants** sets thresholds from deal type defaults
14. **Draws** creates schedule from deal budget
15. **Hawkeye** matches investors from deal rating/size/sector

### Phase 3: Data Stack (Real External Data)
16. **FRED connector** — live treasury curves, SOFR (Bond Desk needs this)
17. **EMMA connector** — muni bond trade comps (Bond Desk + Hawkeye)
18. **EDGAR connector** — institutional holdings (Hawkeye investor profiling)
19. **Chrome connector** — universal web access for anything without an API

### Phase 4: BD & Content
20. **EagleEye** — real pipeline, not fabricated signals
21. **Contact Strategy** — CRM with actual relationship tracking
22. **Outreach** — email/call sequences tied to contacts
23. **Content Library** — actual produced memos, teasers, decks
24. **Heat Maps** — geographic viz of deal pipeline

### Phase 5: Advanced
25. **ORCA/C-Suite** — agent management, dispatch visualization
26. **Tech Stack** — API subscription management panel
27. **Data Connectors** — connector health dashboard
28. **Atticus** — legal matter tracking
29. **Dashboard aggregation** — all dashboard numbers computed from live deal data

---

## CORE PRINCIPLE

**Data entered once flows everywhere.** When a deal is loaded with parameters (NOI, cap rate, loan amount, coupon, tenants, etc.), those numbers must compute and display correctly in EVERY module downstream — Bond Desk, Rating, Surety, Treasury, Hawkeye, Dashboards. Nothing is a placeholder. Everything is a live calculation from the source data.

---

## MODULE STATUS & BUILD REQUIREMENTS

### 1. DEAL INTAKE (CRITICAL — BUILD FIRST)
**Status:** Has a basic modeling page but NOT a real deal input system
**What It Needs:**
- Full deal parameter input form: property address, asset type, NOI, cap rate, purchase price, loan amount, coupon, term, amortization, occupancy
- Tenant rent roll input (name, unit, SF, rent, lease expiry, lease type)
- Owner/user financials input (revenue, COGS, EBITDA, balance sheet items)
- Sponsor/guarantor PFS input
- Deal type selector: Bond / M&A / Sparrow / Term Lending
- **ON SAVE:** deal parameters write to backend and become the source of truth for every other module
- Every number entered here MUST flow downstream

### 2. COMMAND CENTER (NOT BUILT)
**Status:** Shows a static bond command center component, not a real command center
**What It Needs:**
- Pipeline overview: all active deals across all LOBs with status
- Deal cards showing key metrics pulled LIVE from deal parameters
- Status progression: Intake → Underwriting → Structuring → Rating → Placement → Closed
- Action items / tasks per deal
- Bernard integration: ask Bernard about any deal, get real answers based on deal data
- This is the HOME BASE — the first thing you see when you log in

### 3. OPERATIONS / DEAL DETAIL
**Status:** Has workspace tabs but most show demo data not tied to actual deal parameters
**What It Needs:**
- When you click into a deal, ALL tabs compute from that deal's entered parameters
- Bond Stack: computes tranches, DSCR, LTV, spread from the deal's actual NOI/cap rate/loan amount
- Draws/Covenants: covenant thresholds set from deal parameters, draw schedule from budget
- Treasury: card spend and budget categories from deal's actual budget breakdown
- Rating: credit metrics computed from deal's actual financials
- Surety: premium estimates from deal's actual loan amount and risk profile

### 4. ROOTS (INGESTION LAYER)
**Status:** Has a workspace component but document management is not functional
**What It Needs:**
- Document upload that actually stores files (Dropbox integration specced)
- Document checklist per deal type (Bond needs: appraisal, Phase I, rent roll, financials, title, survey. M&A needs: CIM, financials, org chart, customer concentration. Sparrow needs: tax returns, PFS, business plan)
- Status tracking: which docs received, which missing, which reviewed
- Back of the Napkin auto-runs when financials are uploaded
- OCR/parsing of uploaded financials into structured data

### 5. BOND DESK / GENIE
**Status:** Has components (DealPulseTicker, BondStackDesk, CMBSStackingDesk, etc.) with demo data
**What It Needs:**
- Pull deal parameters from Deal Intake — don't generate fake numbers
- Tranche sizing computed from actual NOI, DSCR targets, and LTV constraints
- Coupon, spread, and pricing based on actual rate environment (FRED integration)
- Call/put analysis based on actual deal terms
- Waterfall model computed from actual tranche structure
- Export: term sheet generation from computed structure

### 6. EAGLEEYE (BUSINESS DEVELOPMENT)
**Status:** Has a scout dashboard with 1,103 lines of fabricated demo signals
**What It Needs:**
- REMOVE all fake generated deals
- Replace with actual pipeline: real prospects, real contacts, real deal flow
- Contact Strategy: real CRM with actual relationship data
- Outreach: email/call tracking tied to real contacts
- Heat Maps: geographic visualization of actual deal pipeline
- Content Library: actual memos, teasers, decks that have been produced
- BD sub-engines (Bond, ICRE, O/U, M&A): filtered views of the same real pipeline

### 7. HAWKEYE (BOND PLACEMENT)
**Status:** Has a placement scout with mock investor data
**What It Needs:**
- Investor matching based on actual deal parameters (rating, size, sector, geography)
- Investor data from real sources (EDGAR 13F, EMMA trades) — specced in data stack doc
- Book building: track indications of interest per deal
- Allocation: when deal is placed, record who bought what
- Teaser generation from actual deal parameters, not templates

### 8. BACK OF THE NAPKIN
**Status:** Backend calculators built and working (owner/user + investor RE)
**What It Needs:**
- Frontend page with input form (currently shows placeholder or API-only)
- Form fields match the calculator inputs (financials for O/U, property data for ICRE)
- Results display with the 8 ratios, grades, and officer's read
- Integration: when deal parameters are entered in Deal Intake, Napkin auto-computes
- Link from Deal Intake: "Run Quick Spread" button triggers Napkin with deal's data

### 9. RATING INTELLIGENCE
**Status:** Has a component but runs on static data
**What It Needs:**
- Compute credit metrics from deal parameters: DSCR, LTV, ICR, D/EBITDA
- Grade against JP Morgan benchmarks (A/BBB+/BBB-/Sub-IG thresholds in CLAUDE.md)
- Moody's/S&P methodology comparison using actual deal metrics
- Rating recommendation based on computed metrics, not static display

### 10. SURETY & INSURANCE
**Status:** Has a complete surety module component
**What It Needs:**
- Premium estimates computed from actual deal loan amount
- 3C scoring (Character, Capacity, Capital) from sponsor data entered in Deal Intake
- LC strategy recommendation based on deal AUM tier (from CLAUDE.md: $0-15M surety, $15-40M hybrid, $40-80M LC dominant, $80M+ self-collateralized)
- Carrier matching from actual deal parameters

### 11. TREASURY (RAMP)
**Status:** Built with mock data engine (240 txns, 18 cards)
**What It Needs:**
- Budget categories generated from deal's actual budget breakdown
- Card spend simulation based on deal's actual cost structure
- Rebate calculation from actual managed spend (1.5%)
- When Ramp API keys arrive: flip RAMP_MODE=live, zero frontend changes needed

### 12. PHOENIX (DISTRESSED CRE)
**Status:** Built with 5 demo deals and 12 radar opportunities
**What It Needs:**
- Replace demo deals with real pipeline when deals exist
- Underwriting calculator should accept real inputs, not just return precomputed data
- 60-day bridge timeline should be editable per deal
- Bond handoff should actually create a deal in Bond Desk with Phoenix parameters

### 13. NIGHTVISION (COMPLIANCE)
**Status:** Has a component with compliance monitoring
**What It Needs:**
- Covenant thresholds set from deal parameters
- Breach detection computed from actual covenant values vs thresholds
- KYC/AML/OFAC checks integrated with real entity data
- Regulatory calendar per deal type

### 14. ATTICUS (IN-HOUSE COUNSEL)
**Status:** Placeholder page
**What It Needs:**
- Legal matter tracker per deal
- Document review queue (from Roots)
- Regulatory compliance checklist per deal type
- Opinion letter drafting (Bernard/Morgan integration)

### 15. C-SUITE (ORCA)
**Status:** Placeholder page
**What It Needs:**
- Agent roster with real status (which agents are active, idle, working)
- Dispatch log: what Bernard has sent to which agents
- Pod status visualization
- Performance metrics per agent
- This is the management lair — executive view of the entire AI workforce

### 16. TECH STACK (NEST LABS)
**Status:** Placeholder page
**What It Needs:**
- Table of all API integrations: service name, status (active/trial/inactive/not connected), monthly cost, last sync, admin toggle to enable/disable
- Services: Claude API, FRED, EMMA, EDGAR, Ramp, Dropbox, Stripe, SendGrid, Supabase
- Credential management (masked keys, rotation status)
- Usage tracking per API

### 17. DATA CONNECTORS
**Status:** Placeholder page, connectors specced but not built
**What It Needs:**
- Build the actual connector layer (specced in data-stack-design.md)
- Priority: FRED first (live rates for Bond Desk), then EMMA (bond comps), then EDGAR (investor holdings)
- Chrome connector for universal web access
- Status dashboard showing connector health, last sync, record counts

### 18. ALL DASHBOARDS (11 dashboards)
**Status:** Built with static demo numbers
**What It Needs:**
- Every number computed from actual deal data in the system
- Bond Dashboard: metrics aggregated from all bond deals
- M&A Dashboard: metrics from M&A pipeline
- ICRE Dashboard: property portfolio metrics
- Owner/User Dashboard: business banking portfolio
- Treasury dashboards: actual card spend, rebate, escrow data
- Comp/Success Fee: computed from deal fees
- P×V: deal economics computed from actual volume and pricing
- Investor/Partner/Client: role-appropriate views of the same data

---

## THE FUNDAMENTAL FIX

**The #1 problem is: data doesn't flow.** Every module generates its own fake numbers independently. The fix:

1. **Deal Intake becomes the single source of truth** — all parameters entered here
2. **Backend stores deal parameters** in a real data model (Supabase or in-memory with persistence)
3. **Every module READS from the deal data** — no module generates its own numbers
4. **Calculations happen in backend services** — credit metrics, tranche sizing, rating grades, premium estimates all computed from deal parameters
5. **Frontend displays computed results** — no static numbers, everything live

This is the difference between a demo and a product. Right now it's a demo with pretty screens. The product is when you enter a $150M bond deal and every module instantly shows the correct DSCR, LTV, tranche structure, premium estimate, investor matches, and rating grade — all computed from the same source data.

---

## BUILD ORDER (Kevin's Sprint Plan)

### Sprint 1: Data Foundation
1. Deal data model (backend) — all parameters, persisted
2. Deal Intake form (frontend) — full parameter entry
3. Deal API endpoints — CRUD + computed metrics
4. Wire existing modules to read from deal data instead of generating mock

### Sprint 2: Core Modules Live
5. Bond Desk reads from deal parameters
6. Rating Intelligence computes from deal parameters
7. Back of the Napkin auto-runs on deal entry
8. Surety estimates from deal parameters
9. Command Center shows real pipeline

### Sprint 3: Data Stack
10. FRED connector (live rates)
11. EMMA connector (bond comps)
12. EDGAR connector (investor holdings)
13. Chrome connector (universal web)
14. Wire into Hawkeye and EagleEye

### Sprint 4: BD & Outreach
15. Replace EagleEye fake data with real pipeline
16. Contact Strategy CRM
17. Outreach tracking
18. Content Library (actual docs)

### Sprint 5: Advanced
19. Roots document management (Dropbox)
20. ORCA/C-Suite agent management
21. Tech Stack admin panel
22. Dashboard aggregation from live deal data

---

## SPECS & REFERENCE DOCS (in repo)

All in `nest/docs/superpowers/specs/`:
- `2026-05-21-nest-treasury-ramp-design.md`
- `2026-05-21-phoenix-distressed-cre-design.md`
- `2026-05-21-hawkeye-intelligence-dossier-design.md`
- `2026-05-22-nest-data-stack-design.md`
- `2026-05-22-orca-nest-pod-manifest.md`

Backend: Flask on port 8000 (271 routes), `C:/Users/sgill/nest/backend/`
Frontend: Vite on port 8100, `C:/Users/sgill/nest/frontend-v2/`
Repo: github.com/Businessbear1981/NEST-ADVISORS-V3

---

---

## V1 (MANUS) MODULES MISSING FROM V3

These modules existed in the Manus V2 build (live at nestadvisors.ai) and were NOT carried into V3. The code is in the repo at `frontend/app/(app)/admin/` — needs to be ported to V3 design system.

| Module | V1 Lines | Description | Priority |
|--------|----------|-------------|----------|
| **Dashboard** | 534 | Full institutional dashboard — the V1 was the good one | HIGH |
| **Forensic Audit** | 128 | Document checklist, financial integrity, severity-weighted findings, review gate | HIGH |
| **AI Tools** | 284 | Agent tooling panel — configure and deploy AI agents | HIGH |
| **Bond Intel** | 267 | Bond intelligence — market data, comps, spread analysis | HIGH |
| **Marketing** | 219 | Marketing engine — campaigns, content calendar, outreach | MEDIUM |
| **Licensing** | 216 | Licensing management — regulatory, state licenses, compliance | MEDIUM |
| **Modeling** | 141 | Financial modeling — proforma, scenarios, stress testing | HIGH |
| **Monitor** | 140 | Post-close monitoring — covenant surveillance, alerts | MEDIUM |
| **Blockchain** | 109 | Chain agent — ERC-1400, tokenized bond issuance | LOW |
| **HFT Fund** | 95 | Quantum agent — $32.4M AUM, portfolio management | MEDIUM |
| **Marketplace** | 96 | Bond marketplace — secondary market, listings | LOW |
| **Lenders** | 88 | LenderScout — 800+ lender database, matching | HIGH |
| **Risk** | 83 | Sentinel — 7-dimension risk assessment | HIGH |
| **Docs** | 83 | Document management (Roots should absorb this) | MEDIUM |
| **Vector Agent** | 95 | Market signal monitoring — 14 signals, 15-min intervals | MEDIUM |
| **Deals Detail** | 72 | Deal detail page — V1 version | REFERENCE |

**V1 source code location:** `nest/frontend/app/(app)/admin/`
**Action:** Port each module to V3 design system (Vite + React, NEST terminal aesthetic). The V1 code is Next.js App Router — needs adaptation but the content and layout are the reference.

---

## BOTTOM LINE

The platform LOOKS like an investment bank. It needs to WORK like one. Enter a deal → every number flows → every module computes → every dashboard updates.

The V1 Manus build had modules that worked. V3 lost them in the rebuild. Port them back, wire them to real data, and make the workflow flow. That's the product.
