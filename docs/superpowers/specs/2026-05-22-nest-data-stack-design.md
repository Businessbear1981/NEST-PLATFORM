# NEST Data Stack — Real Data Connectors + Chrome

**Date:** 2026-05-22
**Author:** Sean Gilmore / Claude
**Status:** Draft
**Purpose:** Wire every NEST module to real data sources. Free stack first. Chrome for full internet access.

---

## 1. The Problem

Every NEST module runs on mock data. A digital investment bank cannot run on fake numbers. Each desk needs real feeds to operate.

## 2. Data Sources → Module Mapping

### 2.1 Free Public APIs (Zero Cost)

| Source | API | What It Provides | Feeds Into |
|--------|-----|-----------------|------------|
| **MSRB/EMMA** | emma.msrb.org/API | Every muni bond trade in the US — buyer, size, price, yield, CUSIP | Bond Desk (comps, spreads), Hawkeye (who bought what) |
| **SEC EDGAR** | efts.sec.gov/LATEST | 13F institutional holdings (quarterly), 10-K/10-Q filings | Hawkeye (investor portfolios), EagleEye (M&A target financials) |
| **FRED** | api.stlouisfed.org | Treasury curves, SOFR, economic indicators, yield curves | Bond Desk (rate environment), all desks (macro context) |
| **EPA CERCLIS** | epa.gov/enviro/facts | Superfund sites, brownfield registries, contamination data | Phoenix (environmental track) |
| **FDIC** | banks.data.fdic.gov | Failed bank assets, OREO portfolios | Phoenix (distressed asset sourcing) |
| **Secretary of State** | Varies by state (CA, TX, WA, FL have free search) | Entity registration, officers, agents, filing history | EagleEye (M&A targets), Hawkeye (investor entity verification) |
| **SEC XBRL** | data.sec.gov | Structured financial data from filings | EagleEye (automated financial analysis) |
| **FINRA TRACE** | finra.org/finra-data | Corporate/agency bond trades (delayed) | Bond Desk (secondary market comps) |

### 2.2 Chrome (Full Internet Access)

Chrome is the universal fallback. When there's no API, there's a browser.

| Use Case | What Chrome Does |
|----------|-----------------|
| Company websites | Leadership pages, press releases, investor relations |
| LinkedIn profiles | Decision maker identification (no API needed) |
| News / sentiment | Real-time news on counterparties, markets, deals |
| Title companies | Property records, lien searches |
| County assessor | Property valuations, tax records |
| NAIC filings | Insurance company portfolios (PDF scraping) |
| Pension fund reports | CalPERS, CalSTRS, TRS Texas annual reports |
| Court records | Litigation search on counterparties |
| Brokerage listings | CBRE, JLL, Cushman distressed listings for Phoenix |
| Rating agency | Moody's, S&P publications and methodology updates |

Chrome integration: headless Chromium via Playwright or Puppeteer, managed by a backend service. Bernard or any agent can request "go look at X" and the browser fetches, extracts, and returns structured data.

## 3. Connector Architecture

```
backend/services/data_connectors/
├── __init__.py
├── base.py              — BaseConnector class (shared fetch/cache/retry logic)
├── emma_connector.py    — MSRB/EMMA municipal bond data
├── edgar_connector.py   — SEC EDGAR 13F + XBRL filings
├── fred_connector.py    — Federal Reserve economic data
├── epa_connector.py     — EPA Superfund/brownfield registry
├── fdic_connector.py    — FDIC failed bank assets
├── sos_connector.py     — Secretary of State entity search
├── trace_connector.py   — FINRA TRACE bond trades
└── chrome_connector.py  — Headless Chrome for everything else
```

Each connector:
- Has a `fetch()` method that returns structured data
- Caches responses (configurable TTL — rates update hourly, holdings update quarterly)
- Handles rate limiting and retries
- Returns data in a standardized format that modules consume

### 3.1 Base Connector

```python
class BaseConnector:
    name: str
    base_url: str
    cache_ttl: int  # seconds
    
    async def fetch(self, endpoint: str, params: dict) -> dict
    async def fetch_cached(self, key: str, fetcher: callable) -> dict
    def standardize(self, raw: dict) -> dict  # normalize to NEST schema
```

### 3.2 EMMA Connector (Bond Desk + Hawkeye)

```
Endpoints:
  GET /trade/search — search muni bond trades by CUSIP, date range, issuer
  GET /trade/detail — individual trade details
  GET /security/search — search securities by state, type, maturity
  GET /issuer/search — search issuers

Returns: trade_date, settlement_date, par_value, price, yield, buyer_type,
         cusip, issuer_name, state, security_type, coupon, maturity

Feeds:
  Bond Desk → comparable deal pricing, spread analysis, market comps
  Hawkeye → who's buying what (buyer_type + par_value = investor profiling)
```

### 3.3 EDGAR Connector (Hawkeye + EagleEye)

```
Endpoints:
  GET /submissions — company filings index by CIK
  GET /efts/search — full-text search across all filings
  13F holdings — quarterly institutional holdings

Returns: institution_name, holdings[{cusip, value, shares, type}],
         filing_date, report_period

Feeds:
  Hawkeye → investor portfolio analysis (what bonds they already hold)
  EagleEye → M&A target financials from 10-K/10-Q
  Dossiers → enrichment layer for any entity with SEC filings
```

### 3.4 FRED Connector (All Desks)

```
Endpoints:
  GET /series/observations — time series data for any indicator

Key Series:
  DGS10  — 10-year treasury yield
  DGS5   — 5-year treasury yield
  DGS30  — 30-year treasury yield
  SOFR   — Secured Overnight Financing Rate
  MORTGAGE30US — 30-year mortgage rate
  UNRATE — Unemployment rate
  CPIAUCSL — CPI (inflation)

Returns: date, value for each observation

Feeds:
  Bond Desk → live rate environment for pricing
  All desks → macro context for every decision
  Bernard → "What's the 10yr at today?" answered with real data
```

### 3.5 Chrome Connector (Universal)

```python
class ChromeConnector(BaseConnector):
    """Headless browser for scraping when no API exists."""
    
    async def navigate(self, url: str) -> str:
        """Returns page HTML."""
        
    async def extract_structured(self, url: str, schema: dict) -> dict:
        """Navigate + extract data matching schema."""
        
    async def search(self, query: str, engine: str = "google") -> list[dict]:
        """Web search, return top N results with snippets."""
        
    async def screenshot(self, url: str) -> bytes:
        """Visual capture for verification."""
```

Use cases already identified:
- Company leadership pages → EagleEye M&A target dossiers
- County assessor records → Phoenix property valuations
- CBRE/JLL listings → Phoenix distressed asset sourcing
- Pension fund annual reports → Hawkeye investor intelligence
- Court/litigation records → NightVision compliance checks
- News search → Bernard real-time context for any query

## 4. Module Wiring

### Bond Desk
```
FRED (DGS10, DGS5, DGS30, SOFR) → live rate curves in DealPulseTicker
EMMA (trade/search) → comparable deal pricing in BondStackDesk
TRACE (delayed trades) → secondary market reference
Chrome → rating agency methodology updates
```

### Hawkeye
```
EDGAR (13F) → investor holdings → propensity scoring
EMMA (trade/search) → who bought similar bonds → buyer identification
SoS → entity verification for investors
Chrome → pension fund reports, NAIC filings
```

### EagleEye
```
EDGAR (10-K/10-Q) → target company financials
SoS → entity registration, officers, related entities
Chrome → company websites, LinkedIn, news
SEC XBRL → structured financial data for automated analysis
```

### Phoenix
```
EPA CERCLIS → Superfund/brownfield sites
FDIC → failed bank OREO portfolios
Chrome → CBRE/JLL/Cushman distressed listings, county assessor
SoS → entity ownership chains on distressed properties
```

### Treasury
```
Ramp API → real card transactions (when API keys arrive)
FRED → interest rates for escrow yield calculations
```

### NightVision
```
EDGAR → regulatory filings
Chrome → court records, litigation search
MSRB → disclosure filings
```

### Bernard (across all desks)
```
FRED → "What's the 10yr?" answered live
Chrome → "Look up [anything]" — universal fallback
All connectors → Bernard can query any data source on demand
```

## 5. Implementation Priority

| Priority | Connector | Impact | Effort |
|----------|-----------|--------|--------|
| 1 | **FRED** | Every desk gets live rates. Bernard answers market questions with real data. | Low — simple REST API, free key |
| 2 | **EMMA** | Bond Desk gets real comps. Hawkeye gets real buyer data. | Medium — pagination, data normalization |
| 3 | **EDGAR** | Hawkeye gets investor portfolios. EagleEye gets target financials. | Medium — bulk data, XML/JSON parsing |
| 4 | **Chrome** | Universal fallback. Every desk gets internet access. | Medium — Playwright setup, extraction logic |
| 5 | **EPA + FDIC** | Phoenix gets real distressed asset feeds. | Low — simple APIs |
| 6 | **SoS** | Entity verification across all desks. | Medium — varies by state |
| 7 | **TRACE** | Secondary market data for Bond Desk. | Low — simple API |

## 6. Backend Integration

New route: `backend/routes/data_feeds.py`

```
GET /api/data/rates                    — FRED live rates (cached hourly)
GET /api/data/rates/:series            — specific FRED series
GET /api/data/emma/trades              — EMMA bond trade search
GET /api/data/emma/security/:cusip     — security detail
GET /api/data/edgar/holdings/:cik      — 13F holdings for institution
GET /api/data/edgar/filings/:cik       — filing index for entity
GET /api/data/epa/sites                — EPA brownfield/Superfund search
GET /api/data/fdic/oreo                — FDIC failed bank assets
GET /api/data/sos/entity/:state/:name  — Secretary of State lookup
GET /api/data/chrome/fetch             — Chrome: fetch + extract from URL
GET /api/data/chrome/search            — Chrome: web search
```

Existing modules call these endpoints instead of generating mock data. The transition: each module's engine class gets a `mode` flag (mock/live) — flip to live and it calls the data feed routes instead of generating random numbers.

## 7. ORCA Integration

When ORCA pods are wired in, each seat (agent) gets access to the data connectors through its Current (Layer 4). Bernard as matriarch can dispatch data queries to any connector as part of task decomposition.

```
Human: "What's CalPERS holding in munis?"
  → Bernard receives task
    → Bernard dispatches to Hawkeye seat
      → Hawkeye seat calls EDGAR connector (13F for CalPERS CIK)
        → Returns structured holdings data
          → Bernard composes analysis
            → Returns to human via NEST UI
```

## 8. Chrome as the Full Internet

Chrome is not just a scraping tool. It's NEST's window to the entire internet. Any agent, any desk, any query that doesn't have a dedicated API connector falls through to Chrome. This means:

- Bernard can research ANYTHING on demand
- EagleEye can scout company websites without an API
- Phoenix can browse CBRE listings in real time
- Hawkeye can pull pension fund reports directly
- NightVision can search court records

The Chrome connector is the LAST connector built but the FIRST one that matters for the "digital IB run by AI" vision. An IB analyst with a Bloomberg terminal AND a browser can research anything. NEST's agents get the same.
