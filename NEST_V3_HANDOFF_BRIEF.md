# NEST V3 — Handoff Brief for Next Session

**Date:** 2026-05-25
**Repo:** github.com/Businessbear1981/NEST-ADVISORS-V3
**Local:** C:/Users/sgill/nest
**Backend:** Flask, port 8000, 283 routes
**Frontend:** Vite + React, port 8100

---

## STEP 1: READ THIS DOCUMENT FIRST

**`nest/docs/Nest_Operating_Framework_v1.docx`** — 750KB operating manual. This is the MASTER DOCUMENT. Everything in the platform maps to this. Read Part 4 (The Organizational Structure) completely before touching any code. It defines:

- ORCA C-Suite (§4.1)
- 14 operational desks (§4.2 through §4.14)
- Agent roles at each desk
- Inputs, outputs, handoffs between desks
- Where humans plug in (§4.15)

The 14 desks are:
1. Bond Desk
2. Credit Underwriting Desk
3. Structuring Desk
4. Rating Desk (Moody's/S&P Mirror Agents)
5. Documents Desk
6. Legal and Compliance Desk
7. Trustee Liaison Desk
8. Construction Risk Management Desk
9. Insurance, Surety, and Credit Enhancement Desk
10. Placement Desk
11. Operations Desk
12. Surveillance Desk
13. Business Development Organization (Eagle Eye)
14. Where Humans Plug In

Each desk in the framework = a module in the platform. Agents get renamed/created to match the framework's specifications.

---

## STEP 2: UNDERSTAND CURRENT STATE

### What works:
- Home page (investor pitch — don't touch)
- Backend: 283 routes, 20,000+ lines of Python intelligence (16 agents, 9 services, 9 data connectors)
- FRED + EDGAR connectors pulling real data
- Autonomous Scanner (pulls FRED rates + EDGAR filings, Claude analyzes)
- Convergence Engine (multi-signal M&A target detection, 8 HEAT events)
- Treasury (Ramp P-card), Phoenix (distressed CRE), Back of the Napkin (credit calculators)
- Bernard concierge (professional tone, routes to Claude API)
- 8 V1 intelligence engines ported (Dashboard, Forensic Audit, Bond Intel, CNS, Risk, Modeling, Lender Scout, Marketing Studio)

### What's broken:
- **ModulePages.tsx** (90KB) contains 39 FAKE dashboard components that replaced real content on many routes
- **App.tsx** routes are a mess — some point to real V1 engines, some point to ModulePages fakes
- **AppShell.tsx** sidebar has been restructured multiple times and has links to routes that don't show real content
- The V1 intelligence engines (ForensicAudit.tsx, BondIntelligence.tsx, etc.) exist as files but aren't consistently wired
- EagleEye has 1,103 lines of fabricated demo signals that don't match reality

### What needs to happen:
1. **DELETE ModulePages.tsx** — it's 90KB of fake dashboards that are the root cause of "everything looks like a placeholder"
2. **Rebuild App.tsx routes** from scratch based on the Operating Framework's 14 desks
3. **Rebuild AppShell.tsx sidebar** to match the framework's organizational structure
4. **Wire each desk's route to a REAL component** — either an existing V1 port or a new component built to the framework spec

---

## STEP 3: THE BUILD

For each of the 14 desks in the Operating Framework:

1. Read the desk's specification in Part 4
2. Check if a component exists (V1 port or V2/V3 component)
3. If exists: wire it to the correct route, verify it calls real backend APIs
4. If doesn't exist: build it to the framework spec
5. Rename agents to match framework terminology

### Desk → Existing Component Mapping:

| Framework Desk | Existing Component | Backend Routes | Status |
|---------------|-------------------|----------------|--------|
| Bond Desk (§4.2) | BondDeskPage, BondStackDesk | /api/bond-structuring, /api/bond-tools | Working |
| Credit Underwriting (§4.3) | Back of the Napkin, Maxwell agent | /api/napkin, /api/rating-esg | Partial |
| Structuring (§4.4) | BondIntelligence.tsx (V1 port) | /api/bond-intel, /api/phase-bonds | Has V1 port |
| Rating (§4.5) | RatingIntelligencePage | /api/rating-esg | Working |
| Documents (§4.6) | RootsWorkspace | /api/roots, /api/docs | Working |
| Legal/Compliance (§4.7) | NightVisionComplianceLair, CompliancePortal | /api/nightvision | Working |
| Trustee Liaison (§4.8) | — | /api/monitor | Needs build |
| Construction Risk (§4.9) | DrawManagement | /api/monitor | Partial |
| Insurance/Surety (§4.10) | CompleteSuretyModule | /api/surety | Working |
| Placement (§4.11) | HawkeyePlacementScout, Sterling agent | /api/hawkeye | Working |
| Operations (§4.12) | OperationsDealsPage, TreasuryDesk | /api/deals, /api/treasury | Working |
| Surveillance (§4.13) | CovenantsDashboard, Sentinel agent | /api/risk | Partial |
| BD/Eagle Eye (§4.14) | EagleEyeScoutDashboard, ConvergenceRadar | /api/eagleeye, /api/convergence | Has fake data |
| Human Layer (§4.15) | — | — | Framework only |

### Also in the framework but not yet mapped:
- 18 operational silos (Part 3) — the complete bond lifecycle field guide
- Sub-Industry Silo Framework (Part 5) — vertical specialization
- EMMA/Public Records Ingestion Strategy (Part 6) — intelligence layer
- Universal Credit Policy Framework (Appendix F) — the credit standards

---

## STEP 4: DO NOT

- Do NOT use subagents to edit App.tsx or AppShell.tsx — do those by hand
- Do NOT replace existing working components — only ADD or IMPROVE
- Do NOT create placeholder/fake dashboard pages — every page must have real content or real API calls
- Do NOT add features not in the Operating Framework — the framework is the scope
- Do NOT break what's working to add something new — test before every commit
- Do NOT revert commits without first cherry-picking good files out

---

## FILES ON DESKTOP (reference)

- `NEST_V3_BUILD_BRIEF_FOR_KEVIN.md` — module-by-module requirements
- `V1_MODULES_TO_PORT.md` — V1 intelligence engine details with exact API calls
- `NEST_API_LIBRARY.md` — all 283 routes, all API keys, all agents, all services
- `NEST_V3_SOURCE_CODE_AUDIT.txt` — full line count inventory
- `SESSION_SCORECARD_2026-05-21-22.md` — what was built in prior sessions
- `PAYLOAD_SESSION_BRIEF.md` — Payload (separate project, separate session)

---

## API KEYS (in backend/.env)

Active: Anthropic (Claude), OpenRouter, FRED, DeepSeek, Supabase, Composio, Mediastack, Manus
Not set: SendGrid, Stripe

---

## RUN THE PLATFORM

```bash
cd C:/Users/sgill/nest/backend && venv/Scripts/python app.py    # port 8000
cd C:/Users/sgill/nest/frontend-v2 && npm run dev               # port 8100
```

---

## THE ONE THING

The Operating Framework v1 defines the firm. The platform implements the framework. Read the framework. Build to the framework. Every desk, every agent, every workflow in the framework gets a corresponding module in the platform. That's the job.
