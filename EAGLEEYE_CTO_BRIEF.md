# EagleEye Module — CTO Technical Brief

**Module**: EagleEye — Deal Intelligence Radar  
**Owner**: Sean Gilmore  
**Date**: May 20, 2026  
**Status**: Spec Locked — Ready for Build  
**Budget**: $5,000/month data vendors  

---

## What EagleEye Does

EagleEye is the top-of-funnel deal intelligence engine for NEST Advisors. It finds deals before they hit the market through two parallel signal engines, packages opportunities for offensive outreach, and nurtures prospects through a structured contact cadence.

**The competitive thesis**: Banks won't engage companies under $20M EBITDA. NEST serves the $30M-$150M revenue / sub-$20M EBITDA gap — thousands of companies nobody is advising. EagleEye finds them first.

**NEST's edge**: We can structure a debt vehicle at any level in 45 days. So we don't just find the deal — we show up with the capital structure already designed.

---

## Architecture: 4 Tabs

```
/eagleeye
├── Tab 1: M&A Intelligence (geographic heat map + signal feed)
├── Tab 2: CRE / Development Intelligence (geographic heat map + signal feed)
├── Tab 3: Bullseye (offensive pitch engine — AI-generated packages)
└── Tab 4: Boxing Out (8-10 touch outreach cadence + contact tracking)
```

---

## Tab 1: M&A Intelligence

### Purpose
Find emerging middle market companies at their first sell-side event. Target: $30M-$150M revenue, under $20M EBITDA.

### Signal Types

| Signal | Data Source | API Available? | Fallback |
|--------|------------|---------------|----------|
| SEC Form D filings (new fund raises) | EDGAR API | ✅ Free | — |
| 8-K filings (acquisitions, material events) | EDGAR API | ✅ Free | — |
| SC 13D (activist stakes >5%) | EDGAR API | ✅ Free | — |
| Secretary of State filings | OpenCorporates API | ✅ Paid (~$300/mo) | Manual state-by-state |
| UCC filings (who holds debt, subordination) | OpenCorporates + state DBs | ⚠️ Partial | Manual lookup |
| PE fund activity (new funds, mandates) | SEC Form D + Crunchbase | ✅ Free + Paid | Manual research |
| Portfolio company mapping | Apollo.io + press releases | ⚠️ Partial | Bernard AI research |
| Founder age / succession signals | Apollo.io + LinkedIn | ⚠️ Partial | Cold call discovery |
| 3rd gen family business identification | D&B / OpenCorporates | ⚠️ Partial | CPA outreach channel |
| C-suite movement (CEO/CFO changes) | NewsAPI + Apollo.io | ✅ Paid (~$400/mo) | — |
| PE consolidation patterns by sector | EDGAR + news + NAICS clustering | ✅ Free + enrichment | Bernard analysis |
| Press releases / large wires | NewsAPI Pro | ✅ Paid (~$450/mo) | — |
| Revenue/EBITDA estimates | D&B or ZoomInfo | ⚠️ Paid (expensive) | Manual / cold call |
| NAICS code clustering | Census Bureau API | ✅ Free | — |

### Signal Scoring Model (0-100)

```
Score = weighted sum of:
  Revenue in range ($30-150M)         → +15 pts
  EBITDA under $20M                   → +15 pts (banks won't touch = our window)
  EBITDA trajectory (margin expanding)→ +10 pts (approaching threshold = urgency)
  Founder age > 60                    → +10 pts
  3rd generation ownership            → +12 pts (70%+ failure rate)
  No PE sponsor currently             → +8 pts
  No investment bank engaged          → +8 pts
  PE consolidation in sector          → +7 pts
  UCC filing activity (distress)      → +5 pts
  C-suite changes                     → +5 pts
  Multiple SoS filings (common owner) → +5 pts

  Total possible: 100
  HOT threshold: 75+
  WARM threshold: 50-74
  REVIEW threshold: 30-49
```

### UI: Signal Detail Panel (slide-out from right)

When user clicks a signal on the map or in the feed, a panel slides out showing:

```
┌─ SIGNAL DETAIL ──────────────────────────────────┐
│ Company Name          Score: 87/100  [HOT]        │
│ Location · NAICS · Revenue · EBITDA               │
│                                                    │
│ ── OWNERSHIP INTELLIGENCE ──                      │
│ • Generation, founder age, succession status       │
│ • Current PE sponsor (or "None — open field")     │
│ • Board composition, advisors engaged              │
│                                                    │
│ ── PE LANDSCAPE (sector + geography) ──           │
│ • Named PE firms active in space                   │
│ • Their fund size, mandate, recent acquisitions    │
│ • Portfolio companies (bolt-on candidates)         │
│                                                    │
│ ── CAPITAL FORMATION ──                           │
│ • Recent Form D filings in sector                  │
│ • Family office LP appetite signals                │
│ • New fund closes                                  │
│                                                    │
│ ── UCC FILINGS ──                                 │
│ • Who holds current debt                           │
│ • Subordination structure                          │
│ • Filing amendments / terminations                 │
│                                                    │
│ ── AI DEAL THESIS ── (Bernard generates)          │
│ "Platform play: Acquire as anchor, 2 bolt-ons     │
│  identified within 20mi, exit at $200M+ to        │
│  strategic. NEST structures $35M Series A bond,   │
│  45-day close."                                    │
│                                                    │
│ [DEPLOY OUTREACH] [MAP PE NETWORK] [SEND TO ROOTS]│
└──────────────────────────────────────────────────┘
```

---

## Tab 2: CRE / Development Intelligence

### Purpose
Find large real estate deals before they hit market, or distressed assets where traditional equity doesn't pencil but bonds make the math work ("dark zone" properties).

### Signal Types

| Signal | Data Source | API Available? | Fallback |
|--------|------------|---------------|----------|
| Title reports / ownership changes | ATTOM Data API | ✅ Paid (~$500/mo) | Manual title search |
| Rezoning applications | City/county open data portals | ⚠️ City-by-city | Manual / AI scrape PDFs |
| Building permit applications | ATTOM + city portals | ⚠️ Partial | ConstructConnect |
| City council meeting minutes | City websites (PDFs) | ❌ Manual | Bernard AI parses PDFs |
| NAICS clustering (demand signal) | Census Bureau API | ✅ Free | — |
| Port / logistics hub proximity | US DOT + GIS data | ✅ Free | — |
| Power access / substation distance | EIA API + GIS | ✅ Free | — |
| Maturing loans (CMBS) | Trepp / CRED iQ | ✅ Paid (~$1,500/mo) | — |
| Foreclosure proceedings | ATTOM Data | ✅ Paid (included) | County recorder |
| Lis pendens / default notices | ATTOM Data | ✅ Paid (included) | County recorder |
| Environmental / Superfund | EPA Envirofacts API | ✅ Free | — |
| Underperforming leases | CoStar (expensive) or manual | ❌ Expensive | Broker relationships |
| Change orders (MEP) | Permit amendments | ⚠️ City-by-city | Manual |
| Developer rolodex | Internal CRM + Apollo | ✅ Internal | Relationship building |
| CPA outreach channel | Apollo.io | ✅ Paid (included) | Cold call |
| LEV real estate data | LEV API | ✅ Available | — |

### "Dark Zone" Concept

Properties where cap rate and NOI don't support traditional equity investor ROI. These are dead deals for everyone else — but NEST can structure a bond around them (lower cost of capital, longer duration) and make the math work.

**Dark Zone Scoring:**
```
If (cap_rate < investor_threshold) AND (NOI / debt_service < 1.25):
  → Flag as DARK ZONE
  → Calculate: "What bond coupon makes this pencil?"
  → If bond structure viable: Score +20, tag "BOND OPPORTUNITY"
```

### CRE Signal Detail Panel

Same slide-out pattern as M&A, but with:
- Property details (address, size, zoning, current use)
- Financial snapshot (NOI, cap rate, assessed value, outstanding debt)
- Dark zone analysis (why equity doesn't work, why bonds do)
- Maturing loan details (lender, maturity date, current rate, payoff amount)
- Environmental status (if applicable)
- Nearby development activity
- Developer/owner intelligence
- AI-generated deal thesis

---

## Tab 3: Bullseye — Offensive Pitch Engine

### Purpose
Flip the script. Don't wait for deals to come to you — approach PE firms, family offices, and developers WITH the opportunity already packaged. Come with your hands full.

### How It Works

1. User selects signals from Tab 1 or Tab 2 (or Bullseye auto-suggests based on score)
2. Bernard AI generates a complete pitch package:

```
┌─ BULLSEYE PITCH PACKAGE ─────────────────────────┐
│                                                    │
│ TARGET: NexGen HVAC Holdings ($62M rev)           │
│ APPROACH: Summit Growth Partners                   │
│                                                    │
│ ── WHY THEM ──                                    │
│ • $400M Fund III, essential services mandate       │
│ • 3 acquisitions in HVAC space last 12mo          │
│ • Bay Area geography matches their thesis          │
│ • Fund is 40% deployed — actively deploying       │
│                                                    │
│ ── WHY THIS DEAL ──                               │
│ • 3rd gen family, founder 71, no succession plan   │
│ • $62M rev / $8.2M EBITDA — platform anchor size  │
│ • 3 bolt-on targets identified within 20mi        │
│ • No competing banker engaged                      │
│                                                    │
│ ── WHY NOW ──                                     │
│ • Founder health event (public record)             │
│ • Key employee departures last 6mo                 │
│ • Sector multiples compressing — window closing    │
│                                                    │
│ ── NEST'S ROLE ──                                 │
│ • Structure $35M Series A bond for acquisition     │
│ • 45-day close                                     │
│ • Can also structure the bolt-on financing         │
│ • Full bond desk support through exit              │
│                                                    │
│ ── APPROACH STRATEGY ──                           │
│ • Warm intro via Morrison & Foerster (LP counsel)  │
│ • Alt: Direct to Partner Mike Chen (deal lead)     │
│ • Email template: [VIEW]                           │
│ • Call script: [VIEW]                              │
│                                                    │
│ [DEPLOY OUTREACH] [EDIT PITCH] [SAVE TO PIPELINE] │
└──────────────────────────────────────────────────┘
```

### Bullseye AI Generation (Bernard)

**Input to Claude:**
- Selected signal data (company, financials, ownership, sector)
- PE landscape data (active firms, their mandates, portcos)
- NEST capabilities (bond structuring, 45-day close, full stack)

**Output from Claude:**
- Pitch narrative (who, why, when, how)
- Email template (first touch)
- Call script (30-second pitch)
- Approach strategy (warm intro path or direct)

### Bullseye Data Requirements

| Data Needed | Source | API? |
|-------------|--------|------|
| PE firm mandates | Crunchbase + SEC Form D | ✅ |
| PE firm portcos | Apollo.io + press releases | ✅ |
| PE firm partners/contacts | Apollo.io | ✅ |
| Family office LPs | SEC Form D + ADV filings | ✅ Free |
| Developer contacts | Apollo.io + internal CRM | ✅ |
| Warm intro paths | Apollo.io relationship mapping | ⚠️ |

---

## Tab 4: Boxing Out — Outreach & Contact Cadence

### Purpose
It takes 8-10 contacts to close a sale. Boxing Out tracks every prospect through a structured cadence, automates email sequences, logs calls, and drips useful content that keeps NEST top of mind. "Stay around the basket until they convert."

### 8-10 Touch Cadence

| Touch | Type | Timing | Content | Automated? |
|-------|------|--------|---------|------------|
| 1 | Welcome email | Day 0 | Intro + market insight for their sector | ✅ Instantly.ai |
| 2 | Market intel drop | Day 3 | Business journal article / trend report | ✅ Instantly.ai |
| 3 | Cold call #1 | Day 5 | Intro call, reference email, offer insight | 🗣️ Manual (logged) |
| 4 | Content drip | Day 10 | Market analysis for their geography/NAICS | ✅ Instantly.ai |
| 5 | Case study email | Day 14 | "How we structured a similar deal in 45 days" | ✅ Instantly.ai |
| 6 | Cold call #2 | Day 18 | Follow up, reference content, gauge interest | 🗣️ Manual (logged) |
| 7 | Targeted intel | Day 25 | PE activity in their space / UCC data / unique intel | ✅ Bernard generates |
| 8 | Direct ask email | Day 30 | "We have a thesis on [company]. 15 min?" | ✅ Instantly.ai |
| 9 | Cold call #3 | Day 35 | Direct pitch with Bullseye package ready | 🗣️ Manual (logged) |
| 10 | Close or recycle | Day 42 | Meeting booked → Roots pipeline, OR recycle to nurture | — |

### Boxing Out UI

```
┌─ BOXING OUT — ACTIVE PROSPECTS ──────────────────┐
│                                                    │
│ PIPELINE: 47 active │ 12 hot │ 8 meetings booked  │
│                                                    │
│ ┌─ PROSPECT CARD ─────────────────────────────┐   │
│ │ Summit Growth Partners — Mike Chen (Partner) │   │
│ │ Touch 6/10 │ Last: Call 05/18 │ Next: Intel  │   │
│ │ Status: WARM │ Response: Opened 3 emails     │   │
│ │ Source: Bullseye match (NexGen HVAC)         │   │
│ │ [LOG CALL] [SEND NEXT] [VIEW HISTORY] [SKIP]│   │
│ └─────────────────────────────────────────────┘   │
│                                                    │
│ ┌─ PROSPECT CARD ─────────────────────────────┐   │
│ │ Heritage Capital — Lisa Park (Principal)     │   │
│ │ Touch 3/10 │ Last: Email 05/15 │ Next: Call  │   │
│ │ Status: COLD │ Response: No opens            │   │
│ │ Source: PE Landscape (Tab 1)                 │   │
│ │ [LOG CALL] [SEND NEXT] [VIEW HISTORY] [SKIP]│   │
│ └─────────────────────────────────────────────┘   │
│                                                    │
│ CONTENT QUEUE (Bernard auto-generates):            │
│ • 3 market intel pieces ready for Week 21          │
│ • 2 case studies drafted                           │
│ • 1 targeted intel report (UCC data for Summit)    │
│                                                    │
└──────────────────────────────────────────────────┘
```

### Boxing Out Integrations

| Function | Tool | API | Cost |
|----------|------|-----|------|
| Email sequences | Instantly.ai | ✅ REST API | ~$100/mo |
| Contact data | Apollo.io | ✅ REST API | ~$400/mo |
| Call logging | Built-in (Supabase) | ✅ Internal | Free |
| Content generation | Bernard (Claude API) | ✅ Anthropic API | Usage-based |
| Email tracking (opens/clicks) | Instantly.ai | ✅ Included | — |
| Market intel content | NewsAPI + FRED | ✅ REST APIs | ~$450/mo |
| CRM / pipeline tracking | Built-in (Supabase) | ✅ Internal | Free |

### Content Drip: What Gets Sent

Bernard auto-generates useful content that positions NEST as experts:
- **Business journal summaries** — relevant M&A activity in their sector
- **Market analysis** — rate environment, sector multiples, deal volume
- **Trend reports** — PE dry powder by sector, geographic heat
- **Unique intel** — UCC filing changes, permit activity, signals they can't get elsewhere
- **Case studies** — "Here's how we structured X in 45 days" (anonymized)

The key: every touch provides VALUE. Not "checking in" — delivering intel they find useful. That's why they remember NEST.

---

## Geographic Heat Map (Both Tabs)

### Implementation

- **Library**: Mapbox GL JS (account needed, ~$50/mo at scale)
- **Fallback for demo**: Leaflet.js (free, open source) OR custom SVG US map with state-level heat
- **Data layer**: GeoJSON points for each signal, clustered by density
- **Interaction**: Click cluster → zoom in → click individual signal → slide-out panel

### Heat Map Layers

| Layer | Visual | Data |
|-------|--------|------|
| Signal density | Color gradient (cool→hot) | Count of signals per region |
| M&A targets | Blue pins | Company locations |
| CRE deals | Green pins | Property locations |
| PE activity | Purple circles | PE firm offices + recent acquisitions |
| Dark zone | Red overlay | Properties where equity doesn't pencil |
| Maturing loans | Orange pulse | Loans within 12mo of maturity |

---

## Backend API Endpoints Needed

### New Routes (Flask backend, port 8000)

```python
# EagleEye signals
GET  /api/eagleeye/signals              # All signals (paginated, filterable)
GET  /api/eagleeye/signals/:id          # Signal detail
POST /api/eagleeye/scout                # Trigger AI scout scan
POST /api/eagleeye/score                # Calculate signal score

# Bullseye
POST /api/eagleeye/bullseye/generate    # Generate pitch package (Claude)
GET  /api/eagleeye/bullseye/pitches     # Saved pitch packages
POST /api/eagleeye/bullseye/deploy      # Deploy outreach from pitch

# Boxing Out
GET  /api/eagleeye/boxingout/prospects  # All active prospects
POST /api/eagleeye/boxingout/prospect   # Add prospect to cadence
PUT  /api/eagleeye/boxingout/prospect/:id/touch  # Log a touch
POST /api/eagleeye/boxingout/content/generate    # Bernard generates content
GET  /api/eagleeye/boxingout/queue      # Content queue (ready to send)

# External API proxies
GET  /api/data/edgar/filings            # SEC EDGAR proxy
GET  /api/data/edgar/formd              # Form D (fund raises)
GET  /api/data/epa/superfund            # EPA Envirofacts
GET  /api/data/naics/:code              # NAICS lookup
GET  /api/data/news/search              # NewsAPI proxy
GET  /api/data/fred/:series             # FRED macro data
GET  /api/data/attom/property           # ATTOM property data (paid)
GET  /api/data/opencorp/search          # OpenCorporates (paid)
GET  /api/data/trepp/maturing           # Trepp maturing loans (paid)
```

### Supabase Tables Needed

```sql
-- EagleEye signals (discovered deals)
CREATE TABLE eagleeye_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'ma' | 'cre'
  subtype TEXT, -- 'edgar_8k', 'ucc_filing', 'permit', 'dark_zone', etc.
  entity_name TEXT NOT NULL,
  description TEXT,
  state TEXT,
  county TEXT,
  lat DECIMAL,
  lng DECIMAL,
  naics TEXT,
  revenue_usd BIGINT,
  ebitda_usd BIGINT,
  amount_usd BIGINT,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'review', -- 'hot', 'warm', 'review', 'passed', 'converted'
  pe_landscape JSONB, -- { firms: [], portcos: [], capital_formation: [] }
  ownership_intel JSONB, -- { founder_age, generation, succession_plan, pe_sponsor }
  ucc_data JSONB, -- { filings: [], lien_type, lender }
  deal_thesis TEXT, -- Bernard-generated
  source TEXT,
  source_url TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bullseye pitches
CREATE TABLE bullseye_pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES eagleeye_signals(id),
  target_firm TEXT NOT NULL, -- PE firm / family office / developer name
  target_contact TEXT, -- Person to approach
  pitch_narrative TEXT NOT NULL, -- Bernard-generated full pitch
  why_them TEXT,
  why_this_deal TEXT,
  why_now TEXT,
  nest_role TEXT,
  approach_strategy TEXT,
  email_template TEXT,
  call_script TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'deployed', 'converted'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boxing Out prospects (contact cadence tracking)
CREATE TABLE boxingout_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES eagleeye_signals(id),
  pitch_id UUID REFERENCES bullseye_pitches(id),
  firm_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  contact_title TEXT,
  source TEXT, -- 'bullseye', 'manual', 'pe_landscape', 'cpa_referral'
  current_touch INTEGER DEFAULT 0, -- 0-10
  status TEXT DEFAULT 'cold', -- 'cold', 'warm', 'hot', 'meeting_booked', 'converted', 'recycled'
  last_touch_date TIMESTAMPTZ,
  next_touch_date TIMESTAMPTZ,
  next_touch_type TEXT, -- 'email', 'call', 'content', 'direct_ask'
  email_opens INTEGER DEFAULT 0,
  email_clicks INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boxing Out touch log
CREATE TABLE boxingout_touches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES boxingout_prospects(id),
  touch_number INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'email_welcome', 'email_intel', 'call', 'content_drip', 'case_study', 'targeted_intel', 'direct_ask'
  content TEXT, -- What was sent/said
  outcome TEXT, -- 'sent', 'opened', 'clicked', 'replied', 'voicemail', 'connected', 'meeting_booked'
  notes TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content queue (Bernard-generated drip content)
CREATE TABLE boxingout_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES boxingout_prospects(id),
  type TEXT NOT NULL, -- 'market_intel', 'case_study', 'trend_report', 'targeted_intel'
  title TEXT,
  body TEXT NOT NULL,
  source_data JSONB, -- What data Bernard used to generate this
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'sent'
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Data Vendor Summary ($5,000/month budget)

| Vendor | Monthly Cost | What It Powers |
|--------|-------------|----------------|
| Apollo.io (Business) | ~$400 | Contact data, company search, PE firm contacts, outreach |
| ATTOM Data | ~$500 | Property data, foreclosures, lis pendens, title, permits |
| OpenCorporates | ~$300 | SoS filings, corporate ownership, UCC data |
| Trepp / CRED iQ | ~$1,500 | CMBS maturing loans, loan-level data |
| NewsAPI Pro | ~$450 | Business journals, press releases, market news |
| Instantly.ai | ~$100 | Cold email automation, warmup, sequences, tracking |
| Mapbox | ~$50 | Geographic heat map visualization |
| **Free APIs** | $0 | SEC EDGAR, EPA, Census/NAICS, FRED, EIA |
| **Buffer** | ~$1,200 | Overages or adding vendors (ZoomInfo, CoStar) |
| **TOTAL** | **~$3,800** | Full EagleEye data stack |

---

## Free APIs — Wire Immediately

| API | Endpoint | What It Returns |
|-----|----------|----------------|
| SEC EDGAR | `efts.sec.gov/LATEST/search-index?q=...` | Full-text search of all SEC filings |
| EDGAR Form D | `efts.sec.gov/LATEST/search-index?forms=D` | New fund raises (PE, VC, family office) |
| EDGAR 8-K | `efts.sec.gov/LATEST/search-index?forms=8-K` | Material events, acquisitions |
| EDGAR SC 13D | `efts.sec.gov/LATEST/search-index?forms=SC 13D` | Activist stakes >5% |
| EPA Envirofacts | `enviro.epa.gov/enviro/efservice/...` | Superfund sites, brownfields, violations |
| Census NAICS | `api.census.gov/data/...` | Business counts by NAICS + geography |
| FRED | `api.stlouisfed.org/fred/series/...` | Macro data (rates, GDP, employment) |
| EIA | `api.eia.gov/v2/...` | Energy infrastructure, power plants, substations |

---

## Bernard's Role in EagleEye

Bernard (Claude API) handles everything that can't be purely API-driven:

1. **Signal scoring enrichment** — Reads signal data + context, adjusts scores based on qualitative factors
2. **Deal thesis generation** — Writes the narrative for each signal ("Platform play: acquire as anchor...")
3. **Bullseye pitch packages** — Generates who to approach, why, with what, and how
4. **Boxing Out content** — Writes market intel emails, trend reports, targeted intel pieces
5. **City council minute parsing** — Reads PDF meeting minutes, extracts development signals
6. **Document classification** — Identifies uploaded doc types when naming convention fails
7. **PE landscape analysis** — Cross-references Form D + news + portcos to map competitive landscape

**Claude API cost estimate**: ~$50-150/month at demo volume, scaling with usage.

---

## Demo Build Plan (Phase 1)

For the clickable investor demo, use pre-loaded realistic data:

### Demo Signals (pre-loaded)

**M&A Tab (5 signals):**
1. NexGen HVAC Holdings — Bay Area, 3rd gen, $62M rev, $8.2M EBITDA, score 87
2. Cascadia Senior Living — Portland, founder 71, $45M rev, $5.1M EBITDA, score 78
3. Lone Star Waste Services — Dallas, PE rollup target, $98M rev, $14M EBITDA, score 72
4. Heritage Manufacturing — Chicago, UCC distress signal, $38M rev, $4.8M EBITDA, score 65
5. Pacific Marine Services — Seattle, succession crisis, $55M rev, $6.2M EBITDA, score 61

**CRE Tab (5 signals):**
1. Former Kmart site, Maricopa AZ — dark zone, $14M maturing loan, rezoning approved, score 92
2. Industrial corridor, Pierce County WA — 3 permits filed, logistics hub proximity, score 78
3. Superfund-adjacent parcel, Oakland CA — undervalued 40%, clearance achievable, score 71
4. Senior living campus, Travis TX — cost overrun, MEP change orders, developer distress, score 68
5. Office-to-residential conversion, Portland OR — underperforming lease, maturing CMBS, score 58

**Bullseye (3 pitches pre-loaded):**
1. Approach Summit Growth with NexGen HVAC (platform play)
2. Approach Heritage Capital with Cascadia Senior Living (bolt-on to existing portco)
3. Approach developer consortium with Maricopa dark zone site (bond-financed development)

**Boxing Out (demo prospects):**
- 3-5 prospects at various stages of the 10-touch cadence
- Show email opens, call logs, content queue

---

## Existing Code Base

**Current file**: `src/components/EagleEyeScoutDashboard.tsx` (330 lines)  
**Current state**: 4 tabs (All, M&A, RE, AI Scout), basic signal cards, scoring, AI scout button  
**What's missing**: Heat map, PE intelligence detail, Bullseye, Boxing Out, slide-out panels  

### Files to Create/Modify

```
src/
├── components/
│   ├── EagleEyeScoutDashboard.tsx  ← EXTEND (add tabs, heat map integration)
│   ├── EagleEyeHeatMap.tsx         ← NEW (Mapbox/Leaflet geographic map)
│   ├── EagleEyeSignalDetail.tsx    ← NEW (slide-out panel with full intelligence)
│   ├── BullseyePitchEngine.tsx     ← NEW (AI pitch generation UI)
│   ├── BoxingOutTracker.tsx        ← NEW (contact cadence tracking)
│   ├── BoxingOutProspectCard.tsx   ← NEW (individual prospect card)
│   └── BoxingOutContentQueue.tsx   ← NEW (Bernard-generated content queue)
├── shared/
│   └── eagleEyeDemo.ts            ← NEW (comprehensive demo data for all tabs)
└── lib/
    └── api.ts                      ← EXTEND (add eagleeye/bullseye/boxingout endpoints)
```

### Backend Files to Create

```
backend/
├── routes/
│   ├── eagleeye.py                 ← NEW (signal CRUD, scoring, search)
│   ├── bullseye.py                 ← NEW (pitch generation, deployment)
│   └── boxingout.py                ← NEW (prospect tracking, touch logging, content)
├── services/
│   ├── eagleeye_service.py         ← NEW (signal scoring, API integrations)
│   ├── bullseye_service.py         ← NEW (Claude pitch generation)
│   ├── boxingout_service.py        ← NEW (cadence automation, email triggers)
│   └── data_providers/
│       ├── edgar.py                ← NEW (SEC EDGAR API client)
│       ├── epa.py                  ← NEW (EPA Envirofacts client)
│       ├── attom.py                ← NEW (ATTOM Data client)
│       ├── opencorp.py             ← NEW (OpenCorporates client)
│       ├── trepp.py                ← NEW (Trepp/CRED iQ client)
│       ├── apollo.py               ← NEW (Apollo.io client)
│       ├── news.py                 ← NEW (NewsAPI client)
│       └── instantly.py            ← NEW (Instantly.ai email client)
└── agents/
    └── eagle_eye_agent.py          ← EXISTS (extend with Bullseye + Boxing Out)
```

---

## Dependencies Between Modules

```
EagleEye (finds signal)
    ↓
Bullseye (packages the pitch)
    ↓
Boxing Out (executes outreach cadence)
    ↓
Meeting Booked → ROOTS (document collection begins)
    ↓
Bond Desk → Hawkeye → Close in 45 days
```

---

## Success Metrics (Demo)

- [ ] Heat map loads with signal clusters in both tabs
- [ ] Clicking a signal opens slide-out with full intelligence
- [ ] Signal score visible and color-coded (hot/warm/review)
- [ ] Bullseye tab shows 3 pre-generated pitch packages
- [ ] "Deploy Outreach" button moves prospect to Boxing Out
- [ ] Boxing Out shows prospect cards at various cadence stages
- [ ] Content queue shows Bernard-generated intel pieces
- [ ] "Run Scout" button triggers Claude and returns new signals
- [ ] Cross-tab intel visible (CRE signals shown on M&A detail panel and vice versa)

---

## Environment Variables Needed

```env
# Free APIs
SEC_EDGAR_USER_AGENT=nest-advisors admin@nestadvisors.com
FRED_API_KEY=<get from fred.stlouisfed.org>
EIA_API_KEY=<get from eia.gov>

# Paid APIs ($5k/mo budget)
APOLLO_API_KEY=<apollo.io>
ATTOM_API_KEY=<attom.com>
OPENCORPORATES_API_KEY=<opencorporates.com>
TREPP_API_KEY=<trepp.com>
NEWSAPI_KEY=<newsapi.org>
INSTANTLY_API_KEY=<instantly.ai>
MAPBOX_TOKEN=<mapbox.com>

# AI
ANTHROPIC_API_KEY=<existing - Claude for Bernard>

# Document storage
DROPBOX_APP_KEY=<stored as env var - DO NOT HARDCODE>
DROPBOX_APP_SECRET=<stored as env var - DO NOT HARDCODE>
```

---

## Timeline Estimate (CTO reference)

| Phase | Scope | Estimate |
|-------|-------|----------|
| **Phase 1: Demo** | Pre-loaded data, all 4 tabs clickable, no real APIs | 1-2 weeks |
| **Phase 2: Free APIs** | Wire EDGAR, EPA, NAICS, FRED, EIA | 1 week |
| **Phase 3: Paid APIs** | Wire Apollo, ATTOM, Trepp, NewsAPI, Instantly | 2 weeks |
| **Phase 4: Bernard AI** | Claude generates thesis, pitches, content | 1 week |
| **Phase 5: Automation** | Boxing Out cadence auto-triggers, email sends | 1-2 weeks |

**Total to production EagleEye: ~6-8 weeks with one senior dev.**

---

*Generated by Claude Code — May 20, 2026*  
*For: NEST Advisors CTO Handoff*
