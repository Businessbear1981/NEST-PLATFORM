# Phoenix — Distressed CRE Acquisition & Rehabilitation Engine

**Date:** 2026-05-21
**Author:** Sean Gilmore / Claude
**Status:** Approved
**Module location:** Standalone page + deal detail workspace tab

---

## 1. Problem

Banks, brokerages, and servicers hold portfolios of "problem assets" — commercial real estate where the rent roll doesn't service the debt, or where environmental contamination makes the property untouchable. These assets are stuck:

- **No investor buys** — no equity upside, low ROI, or environmental liability
- **No lender refinances** — DSCR < 1.0, or contamination makes collateral unfinanceable
- **No developer touches** — remediation costs unknown, timeline measured in years
- **Community suffers** — blight, declining surrounding values, environmental hazard

These assets trade at 30–80% discounts to clean/stabilized value. Every major bank has them. CBRE, JLL, Cushman & Wakefield all manage distressed portfolios.

## 2. Solution

**Phoenix uses the NEST bond structure to unlock distressed assets.** The key insight: the bond's no-P&I period during stabilization/remediation eliminates the constraint that kills every other approach (immediate debt service on an asset that can't produce it).

**NEST acquires these assets as principal** — small offerings, one-off deals — building a warchest of rehabilitated properties over time. The 60-day bond timeline (NEST's speed advantage over traditional 9–12 month funding) makes it feasible to bridge the acquisition with short-term partner capital.

### Two Tracks

| | Problem Asset Track | Environmental Track |
|---|---|---|
| **Source** | Bank problem portfolios, CBRE, broker direct | EPA Superfund, state brownfield registries |
| **Discount** | 30–40% below market | 50–80% below clean value |
| **Bond purpose** | Stabilization — TI, lease-up, rent raises | Remediation — Phase I/II/III, cleanup, indemnity |
| **No-P&I window** | 24–36 months | 12–60 months |
| **Equity creation** | Discount = instant LTV cushion | Post-cleanup value vs. contaminated basis |
| **Public benefit** | Prevents blight, stabilizes community | Removes hazard, enables redevelopment |
| **Exit** | Refi or sell at stabilized value | Redevelop, sell clean, or refi |

### Capital Stack

```
Day 0:    CBRE surfaces asset at $68M ($100M market value)
Day 1-5:  NEST/Phoenix underwrites — discount math, stabilization plan, bond feasibility
Day 5-10: Bridge partner goes hard (earnest money / LOI)
Day 10-60: Bond Desk structures, rates, places the bond
Day 60:   Bond closes → takes out bridge → funds stabilization/remediation
Month 1-36: No-P&I window, cash flow accumulates, asset stabilizes
Maturity: Refi or sell at stabilized value — spread over $68M basis is the return
```

Bridge partner risk: 60 days max, secured by asset at 32% discount, known bond takeout. Extremely short duration with fat equity cushion.

## 3. Economics — San Jose Example

| Layer | Amount | Notes |
|-------|--------|-------|
| Market / loan value | $100,000,000 | Current appraised |
| CBRE problem price | $68,000,000 | 32% discount |
| **Instant equity** | **$32,000,000** | The LTV cushion |
| LTV at acquisition | 68% | Investment grade territory |
| Bond size | ~$68,000,000 | Takes out bridge + funds stabilization |
| Stabilization budget | $4,200,000 | TI, common area, marketing, lease-up |
| No-P&I period | 30 months | Cash flow accumulates |
| Target stabilized NOI | $7,800,000 | After rent raises + backfill |
| Stabilized cap rate | 6.5% | Market for San Jose office/mixed |
| Stabilized value | $120,000,000 | NOI / cap rate |
| **NEST equity at exit** | **$52,000,000** | Stabilized value minus bond |
| Bridge partner return | 12–15% annualized | 60-day deployment, secured |

## 4. Architecture

### 4.1 UI Structure — Two Tabs

**Tab A: Deal Desk (primary working interface)**
Manual deal intake and underwriting. This is where deals get worked from day one.

**Tab B: Sourcing Radar (available, builds over time)**
Systematic sourcing from data feeds — CBRE listings, EPA brownfield registry, bank OREO portfolios, FDIC assets. Scores and surfaces opportunities. Not required to operate, but there when ready.

### 4.2 Tab A: Deal Desk

```
Phoenix Deal Desk
├── Deal Intake Form
│   ├── Asset details (address, type, SF, current value, loan balance)
│   ├── Problem classification
│   │   ├── Rent Shortfall — DSCR, current NOI, occupancy rate
│   │   ├── Environmental — contamination type, Phase status, remediation estimate
│   │   └── Both
│   ├── Discount offered (purchase price vs. market value)
│   ├── Source (CBRE, broker name, bank direct, EPA registry)
│   └── Contact / relationship
│
├── Underwriting Engine
│   ├── Discount-to-Equity Calculator
│   │   ├── Purchase price → market value → instant equity
│   │   ├── LTV at acquisition (auto-grades: <65% green, 65-75% amber, >75% red)
│   │   └── Equity cushion as % of bond
│   ├── Stabilization Plan Builder
│   │   ├── TI budget per unit/SF
│   │   ├── Lease-up timeline (months to stabilized occupancy)
│   │   ├── Target rent per unit/SF → target NOI
│   │   ├── Market rent comps (manual input v1)
│   │   └── Stabilized DSCR projection
│   ├── Remediation Plan Builder (environmental track)
│   │   ├── Phase I/II/III scope and cost
│   │   ├── Remediation timeline (months)
│   │   ├── Environmental indemnity requirements
│   │   ├── Post-cleanup appraised value estimate
│   │   └── Regulatory approvals needed
│   ├── Bond Feasibility Check
│   │   ├── Can this asset support a NEST bond structure?
│   │   ├── Recommended bond size, coupon range, term
│   │   ├── No-P&I window recommendation (months)
│   │   └── JP Morgan credit benchmarks check (DSCR, LTV, ICR at stabilization)
│   └── Exit Modeling
│       ├── Refi scenario (stabilized value, new LTV, cash-out)
│       ├── Sale scenario (cap rate, broker fee, net proceeds)
│       └── Hold scenario (ongoing cash flow at stabilized NOI)
│
├── Bridge Timeline (60-day countdown)
│   ├── Milestones: LOI → Due Diligence → Appraisal → Rating → Bond Close
│   ├── Days elapsed / remaining
│   ├── Bridge capital deployed (earnest money, deposits, soft costs)
│   └── Status indicators per milestone (pending / complete / blocked)
│
├── Handoff to Bond Desk
│   ├── One-click: generate bond structure from Phoenix underwriting
│   ├── Pre-populates deal intake in Bond Desk
│   ├── Links stabilization plan to draw schedule
│   └── Links remediation plan to covenant monitoring
│
└── Active Deals Pipeline
    ├── Kanban: Sourced → Underwriting → LOI → Due Diligence → Bond Structuring → Closed
    ├── Each card shows: asset, discount, LTV, days in pipeline
    └── Click-to-open full deal view
```

### 4.3 Tab B: Sourcing Radar

```
Phoenix Sourcing Radar
├── Feed Aggregator (mock data v1, live feeds v2)
│   ├── Problem Asset Feed
│   │   ├── CBRE distressed listings
│   │   ├── Bank OREO portfolios
│   │   ├── FDIC failed bank assets
│   │   └── JLL / Cushman distressed
│   ├── Environmental Feed
│   │   ├── EPA Superfund National Priorities List
│   │   ├── State brownfield registries (CA, TX, WA, FL)
│   │   └── EPA Brownfields Program grants
│   └── Opportunity Zone overlay (bonus scoring)
│
├── Auto-Scoring Engine
│   ├── Discount depth (deeper = higher score)
│   ├── Market strength (MSA employment, population, rent growth)
│   ├── Bond feasibility (quick DSCR/LTV check at stabilized projections)
│   ├── Remediation complexity (Phase I only = easy, Superfund = hard)
│   └── Community impact (OZ, QCT, HUBZone overlaps)
│
├── Heat Map
│   ├── Geographic view of scored opportunities
│   ├── Color by score (green = high opportunity, red = high risk)
│   └── Click-to-view asset detail
│
└── Watchlist
    ├── Saved assets for monitoring
    ├── Price change alerts
    └── One-click send to Deal Desk
```

### 4.4 NEST Warchest

Portfolio dashboard showing Phoenix assets across their lifecycle:

```
NEST Warchest
├── Active Stabilization — assets in the no-P&I window
│   ├── Asset, acquisition price, current estimated value
│   ├── Stabilization progress (occupancy %, rent roll health)
│   ├── Cash flow accumulated during no-P&I
│   └── Days to bond maturity
├── Completed — stabilized, generating cash flow
│   ├── Stabilized NOI, current DSCR
│   ├── Equity position (current value minus bond balance)
│   └── Refi/sale readiness score
├── Exited — sold or refinanced
│   ├── Acquisition price → exit price → realized gain
│   ├── Hold period, IRR, multiple
│   └── Bond payoff details
└── Portfolio Totals
    ├── Total assets acquired
    ├── Total equity created (sum of discounts captured)
    ├── Total cash flow accumulated
    ├── Total exits realized
    └── Warchest NAV
```

## 5. Backend

**New files:**

- `backend/routes/phoenix.py` — REST endpoints (blueprint: `phoenix_bp`, prefix `/api/phoenix`)
- `backend/services/phoenix_engine.py` — underwriting logic, mock data, scoring

**Endpoints:**

```
GET  /api/phoenix/deals                     — list all Phoenix deals (pipeline)
GET  /api/phoenix/deals/:id                 — single deal detail
POST /api/phoenix/deals                     — create new Phoenix deal (intake form)
PUT  /api/phoenix/deals/:id                 — update deal

GET  /api/phoenix/deals/:id/underwriting    — full underwriting output
POST /api/phoenix/deals/:id/underwriting    — run/re-run underwriting engine
GET  /api/phoenix/deals/:id/timeline        — 60-day bridge timeline + milestones
PUT  /api/phoenix/deals/:id/timeline/:milestone — update milestone status

GET  /api/phoenix/deals/:id/bond-handoff    — generate Bond Desk pre-population payload
POST /api/phoenix/deals/:id/bond-handoff    — push deal to Bond Desk

GET  /api/phoenix/radar/feed                — sourcing radar feed (mock v1)
GET  /api/phoenix/radar/scores              — auto-scored opportunities
GET  /api/phoenix/radar/watchlist            — saved watchlist items
POST /api/phoenix/radar/watchlist            — add to watchlist

GET  /api/phoenix/warchest                  — portfolio dashboard
GET  /api/phoenix/warchest/economics        — total equity, cash flow, NAV
```

**Response format (per CLAUDE.md):**

```python
{
    "success": True,
    "data": { ... },
    "error": None,
    "timestamp": "2026-05-21T14:30:00Z"
}
```

## 6. Frontend

**New file:** `frontend-v2/src/components/PhoenixDesk.tsx`

Standalone page accessible via sidebar (new PILLARS entry: "Phoenix") AND as a workspace tab in deal detail for deals sourced through Phoenix.

### Component Structure

```
PhoenixDesk.tsx
├── Tab bar: Deal Desk | Sourcing Radar | Warchest
├── Deal Desk tab
│   ├── Pipeline kanban (top)
│   ├── Deal intake form (slide-out or inline)
│   ├── Underwriting output panel
│   ├── Bridge timeline (60-day visual)
│   └── "Send to Bond Desk" action button
├── Sourcing Radar tab
│   ├── Feed list with auto-scores
│   ├── Filter by track (problem asset / environmental / both)
│   ├── Score breakdown per asset
│   └── "Add to Deal Desk" action
└── Warchest tab
    ├── Portfolio summary metrics (total equity, NAV, cash accumulated)
    ├── Asset cards by lifecycle stage
    └── Exit performance table
```

## 7. Demo Data

Mock engine generates:

- **5 Phoenix deals** in various pipeline stages:
  1. San Jose office — $100M value, $68M purchase, rent shortfall, in underwriting
  2. Oakland warehouse — $42M value, $28M purchase, environmental (Phase II), LOI signed
  3. Sacramento retail — $31M value, $22M purchase, rent shortfall, bond structuring
  4. Portland mixed-use — $56M value, $38M purchase, both tracks, due diligence
  5. Seattle industrial — $88M value, $61M purchase, environmental, closed (in stabilization)

- **12 sourcing radar opportunities** across CA, TX, WA, OR with auto-scores

- **Warchest**: 2 active stabilization, 1 completed, 1 exited (Seattle industrial — acquired $61M, exited $94M, 54% return over 28 months)

## 8. Visual Treatment

Per CLAUDE.md brand guidelines:

- **Primary tone:** Red/amber hybrid — this is a high-conviction acquisition module
- **Deal Desk:** Red borders (risk awareness, human gates on acquisitions)
- **Sourcing Radar:** Cyan (intelligence/scanning)
- **Warchest:** Gold (financial returns, portfolio value)
- **Financial figures:** IBM Plex Mono
- **Headings:** Cormorant Garamond
- **Pipeline kanban:** Matches existing NEST card/terminal aesthetic

## 9. Integration Points

| System | Integration |
|--------|-------------|
| **Bond Desk** | One-click handoff pre-populates bond structure from Phoenix underwriting |
| **EagleEye** | Phoenix deals that involve M&A (acquiring the entity, not just the asset) route through EagleEye scoring |
| **Draw Management** | Stabilization plan links to draw schedule for post-close funding |
| **Treasury (Ramp)** | Stabilization expenses flow through prefunded P-card |
| **Approval Rail** | Every acquisition requires human gate — no auto-purchases |
| **Bernard** | Narrates deal status, underwriting output, timeline alerts |

## 10. Sidebar Placement

```
PILLARS
  EagleEye     — Deal Sourcing & BD
  Roots        — Readiness & Docs
  Bond Desk    — Structuring & Live Ops
  Hawkeye      — Placement & Sales
  Phoenix      — Distressed Acquisition    ← NEW
  NightVision  — Compliance
```

Icon: `Flame` from Lucide (phoenix = fire + rebirth)

## 11. File Manifest

| File | Action | Purpose |
|------|--------|---------|
| `backend/routes/phoenix.py` | Create | REST endpoints |
| `backend/services/phoenix_engine.py` | Create | Underwriting logic + mock data |
| `backend/app.py` | Edit | Register `phoenix_bp` blueprint |
| `frontend-v2/src/components/PhoenixDesk.tsx` | Create | Full Phoenix module UI |
| `frontend-v2/src/pages/OperationsPages.tsx` | Edit | Add workspace tab for Phoenix deals |
| `frontend-v2/src/components/AppShell.tsx` | Edit | Add Phoenix to sidebar under PILLARS |

## 12. Not In Scope (v1)

- Live data feeds (CBRE API, EPA CERCLIS, FDIC)
- Automated appraisal ordering
- Environmental insurance quoting
- Bridge fund LP management / reporting
- Title / escrow integration
- Property management post-acquisition

## 13. IP Note

The systematic application of bond-structure no-P&I windows to acquire and rehabilitate distressed/contaminated CRE — using the discount as the equity position and the payment holiday as the stabilization runway — appears novel. Combined with the 60-day bond timeline (vs. industry standard 9–12 months), this creates a repeatable acquisition strategy for assets previously considered unfinanceable. The environmental track (brownfield → bond-funded remediation → redevelopment) extends this further. Consider including in provisional patent filing alongside Treasury/Ramp innovation.
