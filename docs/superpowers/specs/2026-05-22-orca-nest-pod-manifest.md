# ORCA × NEST — Pod Manifest & Integration Spec

**Date:** 2026-05-22
**Author:** Sean Gilmore / Claude
**Status:** Draft
**Purpose:** Wire ORCA's pod/dispatch architecture into NEST. NEST's 16 agents become managed seats in an ORCA pod with Bernard as matriarch.

---

## 1. Why

NEST has 16 agents defined in CLAUDE.md. Currently they're standalone Python objects in `app.config` with no coordination, no dispatch, no authority boundaries, no conflict resolution. They're props, not operators.

ORCA turns them into a real AI org chart: Bernard dispatches, agents execute within bounded authority, results flow back up, conflicts escalate to human. The digital investment bank gets a real workforce.

## 2. The NEST Pod Manifest

```yaml
pod:
  id: nest-advisors-primary
  project: nest
  state: active

  matriarch:
    agent: bernard
    instance_id: bernard-nest-001
    identity_version: "2.0-professional"  # NOT Jax Teller
    authority_scope:
      - credit_analysis
      - memo_generation
      - bond_structuring
      - placement_coordination
      - ma_intelligence
      - compliance_review
      - acquisition_underwriting
      - treasury_management
      - market_monitoring
      - client_outreach
      - strategic_planning

  seats:
    # ── ORIGINATION DESK ──────────────────────────────────
    - role: Head of Origination
      name: Merlin
      instance_id: merlin-001
      archetype: "Senior M&A banker — pattern recognition, NAICS expertise"
      authority_scope:
        - ma_target_scoring
        - naics_scan
        - business_plan_analysis
        - acquisition_recommendation
      tools: [edgar_connector, sos_connector, chrome_connector]
      reports_to: matriarch

    - role: Deal Scout
      name: Aria
      instance_id: aria-001
      archetype: "BD associate — outreach, follow-up, relationship management"
      authority_scope:
        - cold_outreach
        - warm_followup
        - meeting_scheduling
        - relationship_tracking
      tools: [chrome_connector]
      reports_to: matriarch

    # ── STRUCTURING DESK ──────────────────────────────────
    - role: Head of Structuring
      name: Atlas
      instance_id: atlas-001
      archetype: "Senior structurer — 10yr proforma, stress scenarios"
      authority_scope:
        - proforma_modeling
        - stress_testing
        - capital_stack_design
        - feasibility_analysis
      tools: [fred_connector, emma_connector]
      reports_to: matriarch

    - role: Credit Analyst
      name: Maxwell
      instance_id: maxwell-001
      archetype: "Credit officer — DSCR, LTV, LGD, obligor grading"
      authority_scope:
        - credit_scoring
        - dscr_calculation
        - ltv_analysis
        - obligor_grading
        - covenant_threshold_setting
      tools: [edgar_connector, fred_connector]
      reports_to: matriarch

    - role: Bond Optimizer
      name: BondOptimizer
      instance_id: bondopt-001
      archetype: "Quant — tranche sizing, waterfall optimization"
      authority_scope:
        - tranche_sizing
        - waterfall_modeling
        - coupon_optimization
        - call_put_structure
      tools: [emma_connector, fred_connector, trace_connector]
      reports_to: matriarch

    # ── SALES & PLACEMENT DESK ────────────────────────────
    - role: Head of Sales
      name: Sterling
      instance_id: sterling-001
      archetype: "Placement agent — book building, investor CRM, AEC token"
      authority_scope:
        - investor_matching
        - book_building
        - teaser_generation
        - allocation_recommendation
      tools: [edgar_connector, emma_connector, chrome_connector]
      reports_to: matriarch

    - role: Lender Relations
      name: LenderScout
      instance_id: lenderscout-001
      archetype: "Lender sourcing — 800+ lender database, match engine"
      authority_scope:
        - lender_sourcing
        - term_sheet_comparison
        - lender_matching
      tools: [chrome_connector]
      reports_to: matriarch

    # ── TRADING DESK ──────────────────────────────────────
    - role: Head of Trading
      name: Vector
      instance_id: vector-001
      archetype: "Trader — call/put timing, 14 market signals, 15-min intervals"
      authority_scope:
        - call_put_timing
        - market_signal_monitoring
        - rate_watch
        - spread_tracking
      tools: [fred_connector, emma_connector, trace_connector]
      reports_to: matriarch

    - role: Short Position Manager
      name: Apex
      instance_id: apex-001
      archetype: "Hedge strategist — TLT puts, T-note futures, IRS"
      authority_scope:
        - short_position_management
        - hedge_execution
        - irs_monitoring
      tools: [fred_connector, trace_connector]
      reports_to: matriarch

    - role: HFT Fund Manager
      name: Quantum
      instance_id: quantum-001
      archetype: "Quant PM — $32.4M AUM, 21.3% YTD, B tranche optimization"
      authority_scope:
        - hft_execution
        - portfolio_rebalancing
        - b_tranche_optimization
      tools: [fred_connector, trace_connector]
      reports_to: matriarch

    # ── RISK & COMPLIANCE ─────────────────────────────────
    - role: Chief Compliance Officer
      name: Sentinel
      instance_id: sentinel-001
      archetype: "Risk officer — 7-dimension risk assessment, automated alerts"
      authority_scope:
        - risk_assessment
        - alert_generation
        - covenant_breach_detection
        - exposure_monitoring
      tools: [edgar_connector, fred_connector]
      reports_to: matriarch

    - role: Surety Specialist
      name: SuretyScout
      instance_id: suretyscout-001
      archetype: "Insurance specialist — Hylant pipeline, 3C scoring"
      authority_scope:
        - surety_underwriting
        - carrier_matching
        - premium_estimation
        - lc_strategy
      tools: [chrome_connector]
      reports_to: matriarch

    # ── OPERATIONS ────────────────────────────────────────
    - role: Bridge Monitor
      name: Bridge
      instance_id: bridge-001
      archetype: "Perm debt monitor — 18mo before stabilization"
      authority_scope:
        - perm_debt_monitoring
        - stabilization_tracking
        - refi_signal_detection
      tools: [fred_connector, emma_connector]
      reports_to: matriarch

    - role: Blockchain Executor
      name: Chain
      instance_id: chain-001
      archetype: "Smart contract operator — ERC-1400, tokenized bonds"
      authority_scope:
        - token_issuance
        - smart_contract_execution
        - blockchain_settlement
      tools: []  # direct blockchain RPC
      reports_to: matriarch

    # ── CONTENT & RESEARCH ────────────────────────────────
    - role: Head of Research
      name: Morgan
      instance_id: morgan-001
      archetype: "Jimmy Lee tone — credit memos, investor teasers, marketing"
      authority_scope:
        - memo_writing
        - teaser_drafting
        - marketing_content
        - investor_presentation
      tools: [chrome_connector, edgar_connector]
      reports_to: matriarch

    - role: Audit Specialist
      name: Prometheus
      instance_id: prometheus-001
      archetype: "Financial modeler — proforma, feasibility, audit simulation"
      authority_scope:
        - financial_modeling
        - audit_simulation
        - feasibility_analysis
      tools: [edgar_connector, fred_connector]
      reports_to: matriarch

  current_id: nest-current-001
  adapter_id: nest-adapter-001
```

## 3. Current (Tool Connections for NEST Pod)

```yaml
current:
  id: nest-current-001
  consumer: nest-advisors-primary
  connections:
    - tool_key: fred
      provider: Federal Reserve Economic Data
      endpoint: https://api.stlouisfed.org/fred
      credentials_ref: vault://fred-api-key
      rate_limit: 120/minute
      cache_ttl: 3600  # 1 hour

    - tool_key: emma
      provider: MSRB/EMMA
      endpoint: https://emma.msrb.org/API
      credentials_ref: null  # no key required
      rate_limit: 60/minute
      cache_ttl: 86400  # 24 hours

    - tool_key: edgar
      provider: SEC EDGAR
      endpoint: https://efts.sec.gov/LATEST
      credentials_ref: null  # no key required, user-agent header only
      rate_limit: 10/second
      cache_ttl: 86400  # quarterly data, cache 24h

    - tool_key: epa
      provider: EPA Envirofacts
      endpoint: https://enviro.epa.gov/enviro/efservice
      credentials_ref: null
      rate_limit: 30/minute
      cache_ttl: 604800  # weekly

    - tool_key: fdic
      provider: FDIC BankFind
      endpoint: https://banks.data.fdic.gov/api
      credentials_ref: null
      rate_limit: 30/minute
      cache_ttl: 604800  # weekly

    - tool_key: trace
      provider: FINRA TRACE
      endpoint: https://api.finra.org/data
      credentials_ref: null
      rate_limit: 10/minute
      cache_ttl: 3600

    - tool_key: chrome
      provider: Headless Chrome (Playwright)
      endpoint: local://playwright
      credentials_ref: null
      rate_limit: 10/minute
      cache_ttl: 300  # 5 min for web pages

    - tool_key: claude
      provider: Anthropic Claude API
      endpoint: https://api.anthropic.com/v1
      credentials_ref: vault://anthropic-api-key
      rate_limit: 60/minute
      cache_ttl: 0  # no caching for AI responses

    - tool_key: ramp
      provider: Ramp Financial
      endpoint: https://api.ramp.com/v1
      credentials_ref: vault://ramp-api-key
      rate_limit: 100/minute
      cache_ttl: 300
```

## 4. Integration Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     PAYLOAD (C2)                          │
│  Strategic brain, OSINT, day planning, full internet      │
└──────────────────────┬───────────────────────────────────┘
                       │ REST API
┌──────────────────────▼───────────────────────────────────┐
│                      ORCA                                 │
│  Pod management, dispatch, authority, conflict resolution │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            NEST Pod (nest-advisors-primary)          │ │
│  │  Matriarch: Bernard                                  │ │
│  │  16 Seats: Vector, Atlas, Maxwell, Sterling, etc.    │ │
│  │  Current: FRED, EMMA, EDGAR, Chrome, Claude, Ramp    │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────┘
                       │ dispatch
┌──────────────────────▼───────────────────────────────────┐
│                      NEST                                 │
│  Flask backend (port 8000) + Vite frontend (port 8100)    │
│  267 routes, 7 pillars, 2 new modules (Treasury, Phoenix) │
│  Data connectors: FRED, EMMA, EDGAR, EPA, FDIC, Chrome    │
└──────────────────────────────────────────────────────────┘
```

## 5. How Dispatch Changes NEST

**Before ORCA (current):**
```
User clicks "Run Credit Analysis" in NEST UI
  → Frontend calls /api/rating-esg/assess
    → Flask route calls static RatingEngine
      → Returns mock numbers
```

**After ORCA:**
```
User clicks "Run Credit Analysis" in NEST UI
  → Frontend calls /api/rating-esg/assess
    → Flask route calls ORCA dispatcher
      → Bernard receives task, decomposes:
        1. Maxwell: run DSCR/LTV/ICR (parallel)
        2. Atlas: run stress scenarios (parallel)
        3. Sentinel: check risk exposure (parallel)
      → All three seats execute against real data connectors
      → Bernard composes final credit report
        → Returns to Flask → returns to frontend
```

## 6. Implementation Plan

### Phase 1: ORCA Python Package in NEST
- Add `orca` as a dependency in NEST's backend
- Import Pod, Matriarch, Seat, Dispatcher from orca package
- Stamp the NEST pod from the manifest above
- Bernard becomes the real dispatcher

### Phase 2: Data Connector Layer
- Build connectors in `backend/services/data_connectors/`
- FRED first (simplest, highest impact)
- Wire into ORCA current so seats can query data

### Phase 3: Seat Execution
- Each NEST agent becomes a seat with real execution logic
- Maxwell actually calls EDGAR + FRED to compute DSCR
- Sterling actually queries EMMA for investor holdings
- Merlin actually searches EDGAR for M&A targets

### Phase 4: Bernard as Real Matriarch
- Bernard decomposes tasks into subtask chains
- Dispatches to seats in parallel/sequence as appropriate
- Composes final outputs from seat results
- Handles conflicts and escalates to human

## 7. File Changes in NEST

| File | Action |
|------|--------|
| `backend/requirements.txt` | Add `orca` package (path dependency to C:/Users/sgill/orca) |
| `backend/services/pod_manager.py` | Create — stamps and manages the NEST pod |
| `backend/services/data_connectors/*.py` | Create — 8 connector files |
| `backend/routes/data_feeds.py` | Create — REST endpoints for data queries |
| `backend/app.py` | Edit — initialize pod + connectors at startup |
| `backend/routes/*.py` | Edit — route handlers call ORCA dispatch instead of static engines |
