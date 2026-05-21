# GENIE — Bond Desk Arrangement Terminal

**Date:** 2026-05-21
**Author:** Sean Gilmore + Claude Code
**Status:** Design — Awaiting Approval
**Route:** `/bond-desk`

---

## Executive Summary

Replace the current fragmented Bond Desk (10 mock components, no unified workflow) with a single cinematic Bloomberg-grade arrangement terminal called GENIE. Five modules sharing a common deal state context, enabling real-time counterparty collaboration via ephemeral token-gated sandboxes, with Bernard AI narrating every action at adjustable depth.

**No existing platform does this.** CoStar does CMBS analytics (read-only). DebtX does loan auctions (document sharing). Moody's has internal rating tools (not shared). Nobody lets the arranger, rating agency, insurer, and placement desk interact with a live model simultaneously while AI mediates conflicts and explains trade-offs.

---

## Architecture: Module Composition (Approach B)

Five independent modules communicating through a shared `DealStateContext`. Each module is its own file, own responsibility, pluggable. Counterparty sandboxes fork the context. Bernard reacts to every state change.

### Why Module Composition

- Counterparty sandboxes require forkable state — each sandbox branches from the context
- Bernard's three modes are a clean provider pattern (`<BernardProvider mode="educational">`)
- Cross-module reactions (rate tick → coupon recalc → Bernard narration) flow through shared context
- NEST Treasury (Ramp card integration) plugs in later as another module without touching Bond Desk code

---

## Module 0: DealStateContext (The Spine)

**File:** `frontend-v2/src/contexts/DealStateContext.tsx`

All modules read from and write to this context. Every mutation is logged before applying.

```
DealStateContext
├── activeDeal          — deal being structured (project, sponsor, commitment, phase)
├── marketSnapshot      — latest rates, spreads, SOFR, yield curve (refreshes every 15s)
├── capitalStack        — array of tranches (series, size, coupon, spread, LTC, LTV, DSCR, call/put schedule)
├── cmbsPool            — array of deals pooled for CMBS stacking (each with own capitalStack)
├── counterparties      — map of active sandbox sessions (token → role → forked state)
├── bernardQueue        — narration events (each tagged with mode: expert/standard/educational)
├── bernardMode         — current mode toggle (expert | standard | educational)
├── dealOptimizerOn     — boolean, AI suggestions active or not
├── issuanceWindow      — computed signal (open/narrowing/closed + hours remaining + confidence)
└── auditLog            — immutable append-only log of every state change (who, what, when, token)
```

### Key Behaviors

- Every mutation appends to `auditLog` before applying
- Bernard watches every mutation and queues narration at appropriate depth
- `marketSnapshot` updates trigger automatic recalculation of deal impact
- Counterparty sandboxes are shallow forks — they get a copy of `capitalStack` to manipulate, but `marketSnapshot` and `auditLog` stay shared
- `capitalStack` lives flat at context level (not nested in `activeDeal`) because CMBS stacking needs to pull tranches across deals

---

## Module 1: Deal Pulse Ticker

**File:** `frontend-v2/src/components/bond-desk/DealPulseTicker.tsx`

### What It Does

Animated band across top of page (~120px). NOT a generic Bloomberg ticker — it shows what every market movement means for YOUR active deal in real time.

### Layout — Three Zones

**Left — Market Vitals (25% width)**
- 10yr Treasury, SOFR, IG spread, VIX — small mono text (IBM Plex Mono)
- Each with delta arrow (up/down since session open)
- Subtle pulse glow animation on update

**Center — Deal Impact Stream (50% width)**
- Scrolling ticker tape of deal-specific impact statements
- Every `marketSnapshot` update computes: "what changed for the active deal?"
- Example: `10yr +3bp → Series A coupon 6.50→6.72% → DSCR buffer -0.18x → Moody's threshold watch`
- Color coded: green = favorable, amber = watch, red = action needed
- Clicking any line opens Bernard's explanation at current depth mode

**Right — Issuance Window Gauge (25% width)**
- Arc gauge — cinematic, not a traffic light
- Label: "OPEN — 72hr optimal window" or "NARROWING — spread widening trend"
- Bernard one-liner: "Price this week. Waiting costs ~8bps."

### Tech Brief

**Consumes from context:** `marketSnapshot`, `activeDeal`, `capitalStack`, `issuanceWindow`, `bernardMode`

**API endpoints:**
- `GET /market/rates/live` — existing (FRED with fallback)
- `GET /market/signals/latest` — existing (Vector score + signals)
- **NEW:** `GET /market/deal-impact/:dealId` — computes impact of latest rate move on deal's stack

**Bernard integration:**
- Each deal impact line is clickable → pushes to `bernardQueue`
- Educational mode auto-expands top impact line

**Counterparty behavior:**
- Read-only for all roles — market data is never gated
- Deal Impact Stream shows impacts relative to counterparty's sandbox if they're in one

**Workflow:**
- Feeds from: Backend market data + context
- Feeds to: BondStructuringEngine (rate changes trigger coupon/spread drift display)

**Token scope:** Visible in ALL phase tokens

---

## Module 2: Bond Structuring Engine

**File:** `frontend-v2/src/components/bond-desk/BondStructuringEngine.tsx`

### What It Does

The core tool. Input a deal, build tranches, set coupon/spread/maturity, add call/put optionality. Manipulate every lever. See the capital stack update live. Bernard explains every move.

### Layout — Three Columns

**Left Column (4/12) — Deal Input & Tranche Builder**
- Deal basics: project name, sponsor, total project cost, use of proceeds
- "Add Tranche" button → tranche form:
  - Series (A/B/C/subordinate), size, LTC%, coupon, spread to benchmark, maturity, amortization
  - Call schedule: optional call dates + prices (par, make-whole, declining premium)
  - Put schedule: optional put dates + trigger conditions
- Each tranche as a card — draggable to reorder priority
- Edit/delete any tranche inline

**Center Column (5/12) — Live Capital Stack Visualization**
- Stacked bar chart — each tranche a segment, height proportional to size
- Color by credit quality (gold=A, cyan=BBB, amber=B, red=sub-IG per JP Morgan benchmarks)
- Hover → tooltip with full tranche detail
- Key metrics panel:
  - Total raise, CLTV, blended coupon, weighted avg spread, total debt service
  - DSCR, LTV, ICR — color-coded per JP Morgan benchmarks:
    - A-grade: DSCR>2.0, LTV<55%, ICR>3.5
    - BBB+: DSCR>1.75, LTV<62%, ICR>2.75
    - BBB-: DSCR>1.5, LTV<70%, ICR>2.25
    - Sub-IG: DSCR<1.5
- Stress test strip: 4 scenario thumbnails (base, rates+100bp, NOI-20%, vacancy+10%)

**Right Column (3/12) — Bernard Narrator (Inline)**
- Bernard lives INSIDE the structuring engine, not a separate sidebar
- Every action triggers a narration card, newest on top
- **Expert mode:** one-liner. "Series B at 82% CLTV. Sub-IG."
- **Standard mode:** 2-3 lines with key implication
- **Educational mode:** full card with cause→effect chain + mini visualization
- **Deal Optimizer** (when on): proactive suggestions between narration cards

### Tech Brief

**Consumes from context:** `activeDeal`, `capitalStack`, `marketSnapshot`, `bernardMode`, `dealOptimizerOn`

**API endpoints:**
- `POST /bond-tools/grade` — existing, credit grade for stack
- `POST /bond-tools/optimize` — existing, optimization analysis
- `POST /rating-esg/rating-assess` — existing, indicative rating + score
- **NEW:** `POST /bond-tools/structure` — takes full stack + deal inputs, returns computed metrics (DSCR, LTV, ICR, debt service, blended coupon), stress scenarios, and Bernard narration at all three depths
- **NEW:** `POST /bond-tools/call-put-analysis` — takes tranche + schedule, returns optionality value, exercise scenarios, yield impact

**Bernard integration:**
- Every `capitalStack` mutation triggers `POST /bond-tools/structure` → returns narration at all three depths → context picks by `bernardMode`
- Deal Optimizer runs `POST /bond-tools/optimize` in background on every stack change

**Counterparty behavior:**

| Role | Can Adjust | Cannot Touch | Bounds |
|------|-----------|-------------|--------|
| Credit (Moody's) | Covenants, rating inputs, enhancement suggestions | Tranche sizes, coupons, spreads | DSCR covenant: 1.0x–2.5x |
| Surety (Hylant) | Coverage %, premium, 3C inputs, wrap recommendations | Capital stack, coupons | Coverage: 0–100%, premium: 0–500bps |
| Placement (Hawkeye) | Spread counters, demand indications, placability flags | Structure, covenants, ratings | Spread: ±50bps from base |

All counterparty moves appear as colored overlay annotations on center visualization.

**Workflow:**
- Feeds from: DealPulseTicker (market rates), DealStateContext
- Feeds to: CMBSStackingDesk (graded deals become available for pooling)
- Deal must have at least one graded tranche to be eligible for stacking

**Token scope:** "Structuring Phase" tokens. Burns on phase advance.

---

## Module 3: CMBS Stacking Desk

**File:** `frontend-v2/src/components/bond-desk/CMBSStackingDesk.tsx`

### What It Does

Pool multiple structured deals into a CMBS offering. Push leverage by combining credit profiles. All tranche classes available.

### Layout — Two Rows

**Top Row — Pool Builder**
- Left: "Available Deals" — structured + graded deals as compact cards (name, size, rating, DSCR)
- Right: "CMBS Pool" — deals dragged here join the offering
- Bernard narrates every add/remove with pool impact

**Bottom Row — Waterfall + Economics**
- Left (6/12): Waterfall visualization — horizontal stacked bar
  - AAA/Super Senior, AA, A, BBB, BB, B/Equity classes
  - Attachment/detachment points labeled
  - Subordination levels as percentage markers
  - Click any class → drilldown to contributing deals
- Right (6/12): Pool Economics Panel
  - WAC, WAL, pool DSCR, pool LTV, diversification score
  - Fee structure: NEST arrangement fee, trustee fee, surety premium, net proceeds
  - "Push Leverage" slider — adjusts subordination, Bernard shows impact

### Tech Brief

**Consumes from context:** `capitalStack` (available deals), `cmbsPool`, `bernardMode`

**API endpoints:**
- **NEW:** `POST /bond-tools/pool-analysis` — takes deal array, returns blended metrics, waterfall, subordination, diversification
- **NEW:** `POST /bond-tools/leverage-scenario` — takes pool + target subordination, returns impact per tranche class
- Reuses: `POST /bond-tools/grade` for pool-level grading

**Bernard integration:**
- Every pool mutation triggers narration
- Educational mode: before/after mini-graphic inline
- Deal Optimizer: "Consider adding multifamily to improve sector diversification. Pool is 80% office."

**Counterparty behavior:**
- Moody's: flag concentration risk, suggest subordination floors. Cannot add/remove deals.
- Hylant: propose surety wraps on specific tranches. Shows premium impact.
- Placement: indicate demand by tranche class. Feeds back as leverage slider constraint.

**Workflow:**
- Feeds from: BondStructuringEngine (graded deals)
- Feeds to: Hawkeye placement desk (finalized pool gets marketed)
- Pool must pass minimum diversification + rating thresholds to advance

**Token scope:** "Structuring Phase" (same as structuring engine)

---

## Module 4: Counterparty Sandbox & Token System

**Files:**
- `frontend-v2/src/components/bond-desk/CounterpartySandbox.tsx`
- `backend/services/deal_tokens.py`
- `backend/routes/deal_tokens.py`

### Token Lifecycle

1. **Issue** — NEST operator clicks "Invite Counterparty" → selects role, sets guardrails (fields, bounds), sets expiry (time or phase)
2. **Active** — Counterparty accesses via unique URL with token. Sees deal through role lens. Manipulates within guardrails. Every action logged with token ID.
3. **Freeze** — Deal advances phase → all prior-phase tokens freeze. Sandbox becomes read-only history.
4. **Burn** — Token invalidated. URL returns "session expired." Audit log persists permanently.

### Counterparty View (Their Screen)

- Same Bond Desk UI filtered through role guardrails
- Locked fields: visible but grayed, lock icon
- Editable fields: colored glow border (blue=Credit, green=Surety, amber=Placement)
- Changes appear as "proposed" overlays — not committed until NEST approves
- Bernard narrates their changes in their sandbox

### NEST Operator View (Overlay Panel)

- Floating panel showing all active sandboxes
- Each counterparty's changes as colored annotations on master deal
- "Accept" / "Reject" / "Counter" per change
- "Merge All" to pull approved changes into master
- Bernard flags conflicts with resolution options

### Backend Endpoints

- `POST /tokens/issue` — create token (role, dealId, phase, guardrails, expiry) → unique URL
- `GET /tokens/validate/:token` — validate, return role + guardrails + sandbox state
- `POST /tokens/:token/action` — record action (validates against guardrails)
- `POST /tokens/freeze/:phase` — freeze all tokens for deal's phase
- `DELETE /tokens/:token` — burn

---

## Module 5: Bernard Provider

**File:** `frontend-v2/src/contexts/BernardContext.tsx`

### Context Shape

```
BernardContext
├── mode              — 'expert' | 'standard' | 'educational'
├── optimizerOn       — boolean
├── queue             — narration events (type, data, depths: { expert, standard, educational })
├── push(event)       — add narration event
├── setMode(mode)     — toggle depth
├── toggleOptimizer() — on/off
```

### How Narration Works

1. Module mutates deal state (e.g., add tranche)
2. Mutation hits backend (e.g., `POST /bond-tools/structure`)
3. Backend returns narration payloads at all three depths
4. Module calls `bernard.push({ type, data, depths })`
5. Bernard renderer picks `depths[mode]` and renders appropriate card
6. Educational cards include inline mini-visualizations (bar charts, before/after)

### Mode Toggle UI

Three-segment toggle at top of Bernard column: `[E]xpert | [S]tandard | [E]ducational` + Deal Optimizer switch

### Sales Use Case

- Client proposal: wrap page in `<BernardProvider mode="educational">`. Every action shows full cause-and-effect chains. "This is what NEST does for you."
- Internal team: `<BernardProvider mode="expert">`. Headlines only. Fast execution.
- Demo: toggle live between modes. "This is what clients see. This is how we operate."

---

## Future Module: NEST Treasury (Under Trustee)

**Not in current scope. Captured for future design cycle.**

Commercial card program (Ramp partnership) tied to bond construction projects:
- Virtual cards with merchant category codes derived from bond covenants
- Use-of-proceeds restrictions → MCC auto-restrictions
- Draw schedule milestones → card activation windows
- DSCR covenant → dynamic spending limits
- Automatic cost allocation per tranche/draw/cost code
- 1-2% cash back on construction spend ($200M project = $2-4M rebate)
- Real-time covenant compliance reporting (replaces manual quarterly reports)
- Lives under Trustee panel — trustee already controls disbursements

---

## Competitive Landscape

**No existing platform combines arrangement, real-time counterparty collaboration, and AI narration.**

| Platform | What They Do | What They Don't Do |
|----------|-------------|-------------------|
| CoStar CMBS Advantage | CMBS analytics for investors (read-only) | No structuring, no collaboration |
| DebtX | Loan sale auctions, document sharing | No live model manipulation |
| Debtwire/Octus | LevFin intelligence and news | Not a structuring tool |
| Moody's Structured Finance | Internal rating tools | Not a shared workspace |
| Bond.AI / Bond Treasury | Consumer/corporate treasury | Different universe |
| Built Technologies / Rabbet | Construction draw management | No bond structure connection |

GENIE is the only platform positioning the arranger as both intelligence layer AND collaboration surface.

---

## File Structure

```
frontend-v2/src/
├── contexts/
│   ├── DealStateContext.tsx        — Module 0: shared state spine
│   └── BernardContext.tsx          — Module 5: narration provider
├── components/bond-desk/
│   ├── BondDeskPage.tsx            — page layout composing all modules
│   ├── DealPulseTicker.tsx         — Module 1: market ticker + deal impact
│   ├── BondStructuringEngine.tsx   — Module 2: individual deal tool
│   ├── CMBSStackingDesk.tsx        — Module 3: CMBS pooling
│   └── CounterpartySandbox.tsx     — Module 4: token-gated access

backend/
├── routes/
│   ├── deal_tokens.py              — token CRUD endpoints
│   ├── bond_tools.py               — existing + new structuring endpoints
│   └── market.py                   — existing + new deal-impact endpoint
├── services/
│   └── deal_tokens.py              — token lifecycle logic
```

---

## Demo Priority

For investor demo, build in this order:
1. DealPulseTicker + BondStructuringEngine + Bernard (this IS the demo)
2. CMBSStackingDesk (shows scale ambition)
3. CounterpartySandbox (show as prototype/walkthrough, doesn't need full token backend)

---

## Brand Compliance

- All financial figures: IBM Plex Mono, NEST gold (#C4A048)
- Backgrounds: NEST void (#030A06) with radial gradients (cyan/amber accents)
- Headings: Cormorant Garamond
- Body: Space Grotesk
- Bernard voice: Jimmy Lee tone — direct, decisive, no hedging
- JP Morgan credit benchmarks hardcoded in all grading logic
