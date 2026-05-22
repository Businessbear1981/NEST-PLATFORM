# Hawkeye Intelligence — Dossier System & OSINT Integration

**Date:** 2026-05-21
**Author:** Sean Gilmore / Claude
**Status:** Draft — Brainstorming
**Module location:** Hawkeye pillar enhancement

---

## 1. Concept

Every investor, counterparty, and deal interaction builds a **living dossier** — a persistent intelligence file that accumulates over time. Not a CRM contact card. A dossier. Like a PI case file that gets richer with every interaction, every data pull, every public filing discovered.

The dossier ecosystem ties together:
- Free public data (MSRB/EMMA, SEC EDGAR, NAIC, pension disclosures)
- AI-powered OSINT (Maltego-style entity resolution, web scraping, relationship mapping)
- Multi-model AI enrichment (Claude for analysis, Grok for real-time, specialized models for entity extraction)
- Every NEST interaction (emails, calls, meetings, deal history, term sheets exchanged)

## 2. Dossier Structure

Each entity (investor, counterparty, broker, issuer) gets a dossier:

```
Dossier: CalPERS
├── Identity
│   ├── Legal name, jurisdiction, type (pension fund)
│   ├── AUM: $503B (as of Q1 2026)
│   ├── Key contacts (CIO, fixed income PM, allocator)
│   └── Org chart (who reports to who)
│
├── Investment Profile (from EDGAR 13F + NAIC + public disclosures)
│   ├── Fixed income allocation: $187B
│   ├── Muni bond holdings: $23B
│   ├── Construction/CRE bond holdings: $4.2B
│   ├── Preferred ratings: A and above
│   ├── Typical ticket: $25M-$100M
│   ├── Geographic preferences: CA, TX, FL heavy
│   └── Recent purchases (last 12mo from EMMA)
│
├── OSINT Layer
│   ├── News mentions (sentiment scored)
│   ├── Board meeting minutes (public)
│   ├── Investment policy changes
│   ├── Key personnel changes
│   ├── RFP/RFI activity
│   └── Conference attendance / speaking
│
├── Relationship History (NEST interactions)
│   ├── Emails exchanged (count, last date, sentiment)
│   ├── Calls logged (notes, outcomes)
│   ├── Meetings (agenda, attendees, follow-ups)
│   ├── Term sheets sent/received
│   ├── Deals participated in
│   └── Allocation history with NEST
│
├── AI Analysis
│   ├── Propensity score (0-100): likelihood to buy our next offering
│   ├── Relationship warmth: cold / warm / hot
│   ├── Best approach vector: who to call, what to lead with
│   ├── Portfolio gap analysis: what they NEED but don't have
│   └── Timing signal: budget cycle, allocation window
│
└── Linked Dossiers
    ├── Other entities connected to this one
    ├── Shared board members, advisors, consultants
    └── Co-investors on prior deals
```

## 3. Free Data Stack (Phase 1)

### 3.1 MSRB/EMMA API
- **What:** Every municipal bond transaction in the US
- **Gets us:** Who bought what, at what price, what size, what rating, what sector
- **API:** https://emma.msrb.org/API — free, no key required for basic data
- **Update frequency:** Daily
- **Dossier feeds:** Investment Profile → recent purchases, typical ticket, rating preferences

### 3.2 SEC EDGAR
- **What:** 13F filings (quarterly institutional holdings), 10-K/10-Q for issuers
- **Gets us:** Exact bond holdings for every institution with >$100M AUM
- **API:** https://efts.sec.gov/LATEST/search-index — free, no key
- **Update frequency:** Quarterly (45 days after quarter end)
- **Dossier feeds:** Investment Profile → full portfolio, allocation %, sector breakdown

### 3.3 NAIC Statutory Filings
- **What:** Insurance company investment portfolios (Schedule D)
- **Gets us:** Every bond held by every insurance company in the US
- **Access:** State insurance department websites, some aggregated by NAIC
- **Dossier feeds:** Investment Profile → exact holdings, duration, yield targets

### 3.4 Pension Fund Public Disclosures
- **What:** Investment reports, board meeting minutes, CAFR (Comprehensive Annual Financial Report)
- **Gets us:** Asset allocation, investment policy, approved manager list, recent commitments
- **Access:** Public websites (CalPERS, CalSTRS, TRS Texas, etc.)
- **Dossier feeds:** Investment Profile + OSINT layer

### 3.5 Secretary of State / Business Registries
- **What:** Entity registration, officers, registered agents, filing history
- **Gets us:** Corporate structure, key personnel, status, related entities
- **API:** Varies by state — many have free search
- **Dossier feeds:** Identity → org structure, officers

### 3.6 FRED (Federal Reserve Economic Data)
- **What:** Interest rates, economic indicators, yield curves
- **Gets us:** Market context for timing placement
- **API:** https://api.stlouisfed.org — free with key
- **Dossier feeds:** AI Analysis → timing signals

## 4. OSINT / AI Enrichment (Phase 2)

### 4.1 Maltego Integration
- Entity resolution and relationship mapping
- Link analysis: who connects to who through what
- Transform chains: name → company → officers → other companies → connections
- Visual graph output feeds into dossier "Linked Dossiers" section

### 4.2 Multi-Model AI Pipeline
- **Claude:** Deep analysis, memo generation, relationship strategy, propensity scoring
- **Grok:** Real-time news, social media signals, breaking events
- **Entity extraction model:** Pull structured data from unstructured sources (PDFs, web pages, meeting minutes)

### 4.3 Web Intelligence
- Company websites: leadership pages, press releases, investor relations
- LinkedIn (via Apollo or similar): contact info, role changes, connections
- News aggregation: deal announcements, personnel changes, policy shifts
- Conference/event tracking: who's speaking where, what panels

## 5. Dossier Lifecycle

```
New entity enters NEST (manual or via deal flow)
  ↓
Auto-enrich from free data stack (EMMA, EDGAR, SoS)
  ↓
AI scores propensity + identifies portfolio gaps
  ↓
OSINT layer pulls news, filings, personnel changes
  ↓
Dossier is "warm" — ready for outreach
  ↓
Every interaction logged (email, call, meeting, term sheet)
  ↓
AI re-scores after each interaction
  ↓
Dossier grows richer over time — never deleted, always accumulating
  ↓
Cross-linked to other dossiers (shared connections, co-investors)
```

## 6. How This Changes Hawkeye

Current Hawkeye: mock investor list → match by sector/rating/size → generate teaser

**Dossier-powered Hawkeye:**
- Pull real investor holdings from EDGAR/EMMA
- Score propensity based on what they already own
- Identify portfolio gaps (they have CA munis but no construction — opportunity)
- Time outreach to allocation cycles (pension funds rebalance quarterly)
- Track every interaction in the dossier
- AI generates personalized pitch based on their specific portfolio
- After placement: dossier records the allocation, informs next deal

## 7. Architecture

### Backend
- `backend/services/dossier_engine.py` — dossier CRUD, enrichment pipeline
- `backend/services/osint_connectors/` — individual connectors per data source
  - `emma_connector.py` — MSRB/EMMA API
  - `edgar_connector.py` — SEC EDGAR API
  - `sos_connector.py` — Secretary of State lookups
  - `fred_connector.py` — FRED economic data
  - `maltego_connector.py` — Maltego API (Phase 2)
- `backend/routes/dossier.py` — REST endpoints for dossier CRUD + search

### Frontend
- `DossierView.tsx` — full dossier page for a single entity
- `DossierSearch.tsx` — search/filter across all dossiers
- Enhancement to existing `HawkeyePlacementScout.tsx` — link to dossiers from match results

### Storage
- Supabase PostgreSQL — dossier records, interaction logs, enrichment cache
- Full-text search across dossier content

## 8. Not In Scope (v1)
- Maltego integration (Phase 2)
- LinkedIn/Apollo integration (Phase 2)
- Automated email tracking (Phase 2)
- Real-time news streaming (Phase 2)
- Graph visualization of entity relationships (Phase 2)

## 9. IP Note

The dossier system — where every investor interaction, public filing, OSINT signal, and AI analysis accumulates into a persistent intelligence file that informs placement strategy — is a significant differentiator. Traditional placement desks use CRMs (Salesforce). This is closer to intelligence agency tradecraft applied to bond placement.
