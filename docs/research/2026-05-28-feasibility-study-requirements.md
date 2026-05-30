# Feasibility Study Requirements — NEST Reference

**Status:** Draft research · 2026-05-28
**Owner:** Sean Gilmore
**Audience:** Roots ingestion engine, Bernard Intake Brainstorm, NAICS rules engine, Bond Desk, EagleEye
**Type:** Reference document — what a bond feasibility study **must contain**, sourced from rating-agency criteria, consultant practice, and one grounded CCRC example (Jacaranda Trace, Series 2025, Florida LGFC).

---

## Important environment note on sources

This research run was executed in an environment with **WebSearch and WebFetch disabled**. The document below is built from three categories of source:

1. **Primary, citable to NEST artifacts** — the Bible (`docs/Bible_Pass1_v2.md`), ADR-0002 (`docs/adr/0002-deal-lifecycle-entry-points.md`), `CLAUDE.md` JPM credit benchmarks, and the Jacaranda Trace artifacts in `C:\Users\sgill\Downloads\` (institutional teaser, lender memo, credit memorandum, draft Official Statement filename). These are quoted directly and cited inline.
2. **Industry knowledge — verify** — any claim about the public methodology titles, the structure of a Forvis Mazars / Marcum / Plante Moran study, agency thresholds, or the standard table-of-contents of a CCRC feasibility study that I cannot anchor to a NEST artifact is explicitly tagged **[INDUSTRY KNOWLEDGE — VERIFY]** so the next analyst can confirm against the live source before the platform encodes it as a rule.
3. **Cited URLs that need to be fetched in a permitted environment** — listed in the Sources section at the bottom with the title of the methodology document and the URL pattern; a separate research pass with WebFetch enabled should pull each and replace the corresponding **[VERIFY]** stub.

Every claim is intended to be either citable inline today or flagged for verification. Per the assignment guardrails: "If you can't cite it, mark it as 'industry knowledge — verify.'"

---

## Why this exists

ADR-0002 (`docs/adr/0002-deal-lifecycle-entry-points.md`) makes the **NAICS → bond type → required documents → feasibility study requirements** a deterministic rules-engine output, not AI inference. The ADR is explicit:

> "The NAICS code entered at Deal Input drives a structured backend lookup that returns the eligible bond type(s) (from Bible Appendix A — Bond Type Decision Table), the document checklist (from Bible Silo 4 — Documents), and the feasibility study requirements (whether one is needed, what kind — healthcare feasibility vs housing market study vs charter school enrollment study)." (ADR-0002, Decision)

For that rules engine to be correct, the platform needs a **canonical answer per sector** to four questions:

1. Is a feasibility study required, recommended, or optional for this NAICS / bond type / rating target combination?
2. Who is the eligible universe of consultants the sponsor can pick from?
3. What sections must the study contain to satisfy the rating agency in question (Fitch / Moody's / S&P / KBRA)?
4. What does the sponsor have to hand the consultant on day 1 to keep the study on the critical path?

This document is the canonical answer set, pre-platform encoding. It feeds:

- `services/naics_rules_engine.py` — feasibility flag + consultant short-list per NAICS
- Bernard Intake Brainstorm — "you need a feasibility study from one of these firms; here is what they will ask you for"
- Roots Stage 1 document slots — the "Feasibility Study" slot is not a single document, it is a 14-section structured artifact, and Roots must parse each section to feed downstream agents
- Cost-of-Issuance line item — `Feasibility Consultant` per Bible §2.14, fee range $50K–$250K
- Bond Desk rating model — sponsor-provided projections must match feasibility-examined projections within rating-agency tolerances

---

## Sector coverage and rating-agency methodology refs

### Senior Living / CCRC — priority sector

The Bible's visible v1 pipeline names five CCRC deals (Jacaranda Trace, Convivial St. Petersburg, Palmetto Ridge, Meridian Cove, Life Star Pointe Loop), so this is the deepest section. The CCRC sector's rating-agency methodology landscape:

#### Fitch Ratings

- **Methodology title:** *U.S. Not-for-Profit Life Plan Community Rating Criteria* (re-titled from "Continuing Care Retirement Communities" around 2018–2019; LPC and CCRC are used interchangeably in the criteria). **[INDUSTRY KNOWLEDGE — VERIFY title and current revision date]**
- **Key Rating Drivers (KRDs)** per Fitch's framework for not-for-profit healthcare and senior living: Revenue Defensibility (market position, demand indicators, occupancy, payor mix), Operating Risk (operating performance, capital-related metrics, capex needs), and Financial Profile (leverage, liquidity, stress sensitivity). **[INDUSTRY KNOWLEDGE — VERIFY]**
- **Headline ratios Fitch publishes for senior living/LPC:**
  - Maximum Annual Debt Service (MADS) coverage
  - Days Cash on Hand (DCOH)
  - Cash-to-Adjusted Debt (or Cash to Debt)
  - Net Debt to Adjusted EBITDA
  - Occupancy by level of care (IL / AL / MC / SNF)
  - Entrance fee receipts (net) for entrance-fee CCRCs
  - **[INDUSTRY KNOWLEDGE — VERIFY exact category thresholds; the Jacaranda teaser footnotes Forvis Mazars-examined ratios of 1.90x MADS / 314 DCOH and describes those as "approaching investment-grade levels" — which is consistent with public Fitch BBB+/A- LPC benchmarks]**
- **Feasibility study expectation:** Fitch explicitly looks for an independent feasibility study on new-construction, expansion, and significant repositioning deals. On stabilized refundings of mature LPCs (Jacaranda is 27 years operating, per teaser line 5), the requirement is softer — historical audited performance can substitute — but a "Big-4 examined feasibility" is still treated as a credit positive worth a notch of uplift in practice. (Bible §2.14: "A high-quality feasibility study can support a rating uplift of one to two notches.")
- **URL to fetch in next pass:** `https://www.fitchratings.com/...not-for-profit-life-plan-community-rating-criteria`

#### Moody's Investors Service

- **Methodology title:** *Not-for-Profit Senior Living* (or "U.S. Not-for-Profit Senior Living Methodology"). **[INDUSTRY KNOWLEDGE — VERIFY current title and date — Moody's last updated this around 2022–2023]**
- **Scorecard factors:** Market position, operating performance, debt and capital position, financial policy, governance. **[INDUSTRY KNOWLEDGE — VERIFY weightings]**
- **Headline metrics Moody's publishes:** Operating cash flow margin, MADS coverage, days cash on hand, debt-to-cash flow, total cash and investments to direct debt. **[INDUSTRY KNOWLEDGE — VERIFY]**
- **Feasibility study expectation:** Moody's specifically asks for a CCRC feasibility study on (a) new-construction CCRCs, (b) major expansions adding >10% to capacity, and (c) any deal where >25% of debt service capacity depends on entrance-fee turnover. For Jacaranda Trace, where the entrance-fee engine produces $18–25M of recurring annual principal-sweep capacity (teaser), the deal sits squarely in this third bucket — even on a refunding. **[INDUSTRY KNOWLEDGE — VERIFY specific 10%/25% thresholds; the principle is broadly correct]**

#### S&P Global Ratings

- **Methodology title:** *U.S. Not-for-Profit Senior Living Methodology* (re-released June 2024 per industry references). **[INDUSTRY KNOWLEDGE — VERIFY]**
- **Rating factors:** Enterprise profile (market position, demand, governance/management) and financial profile (financial performance, liquidity & financial flexibility, debt and contingent liabilities). **[INDUSTRY KNOWLEDGE — VERIFY weighting]**
- **Feasibility study expectation:** S&P, like Fitch, treats an independent feasibility study as effectively required on new construction, start-up CCRCs, and major expansions/repositionings. S&P's framework distinguishes "Type A" (life-care / extensive contract), "Type B" (modified contract), "Type C" (fee-for-service), and rental CCRCs — each has different default behavior of entrance-fee receipts and therefore different study emphasis. **[INDUSTRY KNOWLEDGE — VERIFY contract-type taxonomy]**

#### KBRA (Kroll) and DBRS Morningstar

- KBRA has rated several recent CCRC and senior living deals where Fitch/Moody's/S&P were not engaged; KBRA publishes a "U.S. Senior Living Rating Methodology." **[INDUSTRY KNOWLEDGE — VERIFY]**
- DBRS does not have meaningful market share in U.S. CCRC bond ratings.
- The Bible (§2.7) acknowledges Kroll and DBRS as part of the rating-agency universe but does not give them sector-specific treatment for CCRC.

#### Key sections rating agencies look for (consolidated across the three)

Rating agencies will not rate a CCRC bond above non-investment-grade without seeing:

1. **A defined Primary Market Area (PMA)** with ZIP-code-level demographic data — qualified age-and-income households, growth rates, penetration rates.
2. **Competitive supply inventory** — every competitor in the PMA by unit count, entrance-fee schedule, occupancy, and amenity tier.
3. **A demand-supply gap analysis** producing a "market penetration rate required" — the percent of qualified households the project must capture to fill. Jacaranda's teaser cites 0.3% project penetration / 6.7% gross — both are inside the "favorable" zone, which is generally <10% gross / <2% project. **[INDUSTRY KNOWLEDGE — VERIFY exact agency thresholds; the principle is consistent with widely-cited Ziegler / HJ Sims market commentary]**
4. **An entrance-fee velocity / turnover analysis** — for entrance-fee CCRCs specifically, the rate at which units turn over and generate net entrance-fee cash. Jacaranda's audited 2023 Barclay-Manor data (13.4% turnover, $8.28M net entrance-fee cash) is the kind of artifact agencies want to see.
5. **A multi-year examined financial forecast** — typically a 5-year forecast (some studies extend to 7 or 10) showing revenue, expenses, MADS coverage, DCOH, and entrance-fee receipts under a base case and at least two stress cases.
6. **Sensitivity / stress analysis** — Jacaranda's teaser table at line 161 shows five stress cases (longer fill-up, zero turnover entrance fees, 25% reduction in turnover entrance fees, opex inflation +1%). This is the form agencies expect.
7. **Management track record narrative** — the operator's prior CCRC track record. For Jacaranda this is LifeStar Management; for Convivial deals it is Convivial Life, Inc.
8. **Construction / capex feasibility** (on construction or significant-repositioning deals) — third-party review of the construction budget, schedule, and contingency.

#### Mandatory inputs from the sponsor (CCRC feasibility study intake checklist)

For Roots to know what to demand on Day 1 of a CCRC deal, here is what the feasibility consultant (Forvis Mazars on Jacaranda; Marcum, Plante Moran, CliftonLarsonAllen, or Dixon Hughes Goodman on others) will request:

- **Five years of audited financials** (the obligor entity and any predecessor obligated group entities)
- **Most recent two years of monthly operating statements** (units sold, residents in residence, entrance-fee receipts gross and refunds paid, monthly service fee collections, expense detail)
- **Current rate schedule** — entrance fees by unit type (1-BR, 2-BR, cottage, premium, etc.), monthly service fees by level of care, ancillary charges, second-person fees, refund schedule (90% refundable, 50% refundable, declining-balance)
- **Current residency agreement template** and any historical versions still in force
- **Resident demographic profile** — current resident origin ZIPs, age at entry, source of funds, length of stay by level of care, internal-transfer history (IL → AL, AL → MC, AL → SNF)
- **Waitlist data** — current depositor count, depositor demographics, conversion rate from depositor to resident
- **Marketing pipeline data** — lead counts, lead source breakdown, sales calendar, marketing spend
- **Construction documents** (on expansion/repositioning) — GMP contract, draw schedule, construction monitor reports, architect's certificate of substantial completion if any phase is in service
- **Site / market materials** — appraisal (HealthTrust appraisal referenced in Jacaranda lender memo), survey, environmental Phase I, demographic study if previously commissioned
- **State regulatory filings** — Florida Chapter 651 (Jacaranda is regulated under this), reserve compliance, Continuing Care Provider Annual Reports for prior 3+ years
- **Existing-debt term sheets** — Series 2022, 2023 bond documents for Jacaranda; any bank loans, leases, swap agreements
- **Sponsor / management bios and CCRC track record** — for each principal officer and asset manager
- **Insurance certificates** — property, GL, professional liability, malpractice, builder's risk if applicable
- **Capital plan / capex schedule** — next 5–10 years of routine capex and one-time replacement reserve calls

This list is operational, not aspirational — it's what Forvis Mazars would have asked for on Jacaranda Trace before producing the May 30, 2025 examined forecast referenced in the teaser at line 125. The Roots ingestion engine should encode each as a distinct slot tied to a freshness threshold (Bible §17.3 — Data Validation Agent: "freshness threshold rules").

---

### Charter Schools

- **Primary methodology refs:**
  - S&P: *U.S. Charter Schools* methodology / criteria
  - Fitch: charter school criteria nested within *U.S. Public Finance Tax-Supported Rating Criteria* and a sector supplement
  - Moody's: *U.S. Charter Schools* methodology
  - **[INDUSTRY KNOWLEDGE — VERIFY exact titles and current dates for all three]**
- **Key rating factors:** Academic performance (test scores vs. district / state averages, growth metrics), enrollment trajectory and demand (waitlist size, applications per seat), charter authorizer relationship and renewal track record, financial performance (operating margin, days cash on hand, MADS coverage, debt-to-revenue), management quality, facility quality.
- **Charter-school "feasibility study" terminology:** In this sector, the study is more often called a **Demand / Enrollment Study** or **Market Study** rather than "feasibility study." Standard consultants: Public Impact, Bellwether Education Partners, Charter Schools Development Corporation (CSDC), and academic/demographic firms like Davis Demographics. (Bible §2.14: "Charter schools use Public Impact, Bellwether Education, or sector-specific advisors.")
- **Required sections of a charter school demand/enrollment study:**
  1. Local district demographics and student-age population trends
  2. Charter sector competitive landscape (other charters in the catchment, district magnet schools, private schools)
  3. Application and waitlist analysis — applications received vs. seats offered, conversion to enrollment, attrition by grade
  4. Academic performance benchmark — proposed school vs. district vs. state, with multi-year trend
  5. Authorizer relationship — charter contract terms, renewal history, performance framework
  6. Enrollment forecast — typically 5 years, by grade level, with stress cases
  7. Financial forecast — per-pupil revenue (state PPF, federal Title I, NSLP, local), expense ramp, MADS coverage
- **Mandatory sponsor inputs:** Charter contract, state authorizer accountability reports, 3+ years application/enrollment data with conversion rates, audited financial statements, IRS determination letter for the 501(c)(3) charter holder, facility plans and construction contracts, management organization (CMO) contract if applicable.
- **Variant study — Academic Performance Review:** Some agencies (and lenders) ask for a separate Academic Performance Review by a specialist firm (Bellwether, NACSA-affiliated reviewers) covering performance against the authorizer's framework. This is distinct from the demand/enrollment study.

---

### Multifamily Housing / PAB §142

- **Primary methodology refs:**
  - Moody's: *Affordable Housing* and *Public Housing Authority* methodologies
  - S&P: *U.S. Multifamily Affordable Housing* methodology
  - Fitch: *U.S. Multifamily Affordable Housing Bond Rating Criteria*
  - **[INDUSTRY KNOWLEDGE — VERIFY current titles/dates]**
- **Multifamily "feasibility study" terminology:** This sector uses **Market Study** as the primary term — produced by Novogradac, Valbridge, Real Property Research Group (RPRG), or specialty multifamily market researchers. (Bible §2.14: "Multifamily housing uses firms like Novogradac for affordable housing or specialty market study firms for market-rate.")
- **Required sections of a multifamily market study:**
  1. Site and neighborhood analysis (employment drivers, school quality, transit, services)
  2. Demand analysis (target income bands, household formation, qualified-renter pool at AMI restrictions)
  3. Competitive supply inventory (within typically 3–5 mile radius, by unit type, AMI tier, rent, concessions)
  4. Capture rate analysis (units to lease ÷ qualified renter pool) — typical threshold for LIHTC: <10% capture rate
  5. Achievable rents by unit type with rent comparability grid
  6. Absorption forecast (units leased per month, time to stabilization)
  7. Market stress conclusions
- **Tax-exempt PAB §142 specifics:** For multifamily volume-cap bonds, the deal must satisfy IRS §142(d) set-aside rules (20-50 or 40-60 rule), which the **Regulatory Agreement** (Bible §4.1) enforces for 15+ years post-closing. The market study must demonstrate the project is leasable under the income/rent restrictions. The Bible already calls this out in §4.1: "a Regulatory Agreement binds the obligor to maintain affordability restrictions — income limits, rent limits, set-asides for low-income tenants — for a defined regulatory period (typically 15-30 years)."
- **Mandatory sponsor inputs:** Site control documents, environmental Phase I, zoning verification, LIHTC application (if 4% or 9%), syndication LOIs, GMP construction contract, draw schedule, sponsor's prior LIHTC track record, audited financials of the developer/sponsor parent, LURA / Regulatory Agreement draft, HUD subsidy documentation (Section 8, PBV) if applicable.

---

### Healthcare Facilities (Hospitals, Health Systems, Senior Living adjacencies)

- **Primary methodology refs:**
  - Fitch: *U.S. Not-for-Profit Hospitals and Health Systems Rating Criteria*
  - Moody's: *Not-for-Profit and Public Healthcare* methodology
  - S&P: *U.S. Not-for-Profit Acute Health Care* methodology
  - **[INDUSTRY KNOWLEDGE — VERIFY exact current titles/dates]**
- **Key rating factors:** Operating margin, MADS coverage, DCOH, debt to capitalization, market share / service area position, payor mix, case mix index, physician integration, regulatory risk (CMS reimbursement, state Medicaid).
- **Hospital feasibility study terminology:** "Feasibility Study" remains the standard term. (Bible §2.14: "Healthcare uses firms like Kaufman Hall, Ponder & Co., and ECG Management Consultants.")
- **Required sections:**
  1. Service area definition and demographics
  2. Hospital and physician competitive landscape, including discharge data by zip / payor / DRG
  3. Volume forecast (admissions, outpatient visits, surgery cases) typically by service line
  4. Payor mix forecast
  5. Multi-year examined financial forecast with stress cases (Medicare reimbursement haircuts, volume shocks)
  6. Regulatory / strategic-context narrative
- **Mandatory sponsor inputs:** 3+ years audited financials, monthly financials YTD, 3+ years of utilization statistics (admissions, ALOS, case mix, payor mix), medical staff roster, physician compensation arrangements, malpractice claim history, CMS cost reports, state HHRP filings.

---

## Consultant landscape

The Bible (§2.14) names specific feasibility-consultant firms per sector. Below is a consolidated, augmented matrix. Fees and timelines are stated as ranges; the exact number on a given deal depends on complexity, sector, geography, and counterparty selection.

| Firm | Sector strength | Typical deliverables | Approx. timeline | Approx. fee range | NEST artifact |
|---|---|---|---|---|---|
| **Forvis Mazars LLP** | CCRC, senior living | Examined financial forecast, feasibility study, entrance-fee velocity analysis | 10–14 weeks | $125K–$250K | Jacaranda Trace teaser (line 14, 125, 182) — Forvis Mazars examined the May 30, 2025 forecast |
| **Marcum LLP** | CCRC, senior living, healthcare | Feasibility study, market study, financial projections | 8–12 weeks | $75K–$150K | **[INDUSTRY KNOWLEDGE — VERIFY]** |
| **Plante Moran (Plante Moran Living Forward)** | CCRC, senior living | Feasibility study, market study, master planning | 10–14 weeks | $100K–$200K | **[INDUSTRY KNOWLEDGE — VERIFY]** |
| **CliftonLarsonAllen (CLA)** | CCRC, senior living, multifamily affordable | Feasibility study, financial projections, actuarial review | 8–12 weeks | $75K–$175K | Bible §2.14 |
| **Dixon Hughes Goodman / now FORVIS / Forvis Mazars** | CCRC, healthcare | Same as Forvis Mazars (the merger of DHG + BKD in 2022 produced FORVIS, which then merged with Mazars in 2024) | 10–14 weeks | $125K–$250K | Bible §2.14 (still named "Dixon Hughes Goodman") — **flag: Bible Silo 4 references "Dixon Hughes Goodman" as a current firm; in 2026 the correct name is "Forvis Mazars."** Roots's consultant short-list needs to update. |
| **Kaufman Hall & Associates** | Healthcare, hospitals | Feasibility study, strategic & financial advisory | 12–16 weeks | $150K–$300K | Bible §2.14 |
| **Ponder & Co.** | Healthcare, senior living | Feasibility study, financial advisory | 10–14 weeks | $100K–$200K | Bible §2.14 |
| **ECG Management Consultants** | Healthcare, hospitals | Feasibility study, strategic | 12–16 weeks | $150K–$300K | Bible §2.14 |
| **PMD Advisors** | Senior living | Market study, feasibility | 8–12 weeks | $75K–$150K | Bible §2.14 |
| **Aspire Senior Insight** | Senior living | Market study, feasibility, occupancy forecast | 6–10 weeks | $50K–$125K | **[INDUSTRY KNOWLEDGE — VERIFY]** |
| **KMC Partners** | Senior living | Market study, occupancy/absorption forecast | 6–10 weeks | $50K–$125K | **[INDUSTRY KNOWLEDGE — VERIFY]** |
| **Public Impact** | Charter schools | Demand / enrollment study, academic-performance review | 8–12 weeks | $50K–$125K | Bible §2.14 |
| **Bellwether Education Partners** | Charter schools | Academic-performance review, market study | 8–12 weeks | $75K–$150K | Bible §2.14 |
| **Novogradac** | Affordable housing, multifamily | Market study, LIHTC compliance support | 6–10 weeks | $25K–$75K | Bible §2.14 |
| **Real Property Research Group (RPRG)** | Multifamily (affordable and market-rate) | Market study, capture-rate analysis | 6–10 weeks | $25K–$60K | **[INDUSTRY KNOWLEDGE — VERIFY]** |
| **HealthTrust LLC** | Senior living, healthcare | Appraisal (not feasibility), market analysis | 4–8 weeks | $25K–$60K | Jacaranda lender memo line 7 — "HealthTrust appraisal supports ~$199M on partial 331-unit interest" |
| **CBRE, JLL, Cushman & Wakefield, Newmark** | Real estate market study | Market study, valuation | 6–10 weeks | $25K–$75K | Bible §2.15 |

**Gap to flag:** The Bible's Silo 4 narrative (§2.14) describes the consultant universe but does not formalize a structured consultant short-list per NAICS. This is exactly what `naics_rules_engine.py` should generate.

**Bible name-update needed:** §2.14 still references "Dixon Hughes Goodman" — the post-2024 entity is Forvis Mazars. Recommend a Bible patch.

---

## CCRC feasibility study — section by section

This is the canonical TOC for a CCRC examined financial forecast and feasibility study. It is reconstructed from the Forvis Mazars artifact referenced in the Jacaranda Trace teaser (line 125: "Forvis Mazars LLP examined financial forecast, May 30, 2025") and from the standard structure used by the major CCRC consultants. Where I am inferring from industry practice rather than a NEST artifact, it is tagged **[INDUSTRY KNOWLEDGE — VERIFY]**.

For each section: required tables/exhibits, sponsor inputs needed, rating-agency factor satisfied, and the Bible/Silo 4 touchpoint.

### 1. Independent Accountants' Examination Report

- **Required exhibits:** Letter from the accounting firm (Forvis Mazars in Jacaranda's case) stating that the financial forecast is presented in conformity with AICPA guidelines for prospective financial information and that the assumptions provide a reasonable basis for the forecast.
- **Inputs from sponsor:** Engagement letter, signed management representation letter, signed Letter of Reasonable Assumptions.
- **Rating-agency factor satisfied:** Threshold credibility — without this letter the document is a marketing piece, not a feasibility study.
- **Bible touchpoint:** Bible §4.4 — Opinion Documents. The examined-forecast letter is *not* the same as the Comfort Letter (Bible §2.16, §4.4) and *not* the same as the auditor's consent letter; it is a separate AICPA-AT-301-governed examination engagement.
- **Bond Counsel / Trustee touchpoint:** Disclosure counsel reviews the letter before inclusion in POS Appendix.

### 2. Executive Summary / Introduction

- **Required exhibits:** 2–4 page narrative covering project description, sponsor, scope of the examination, key conclusions, key assumptions, key sensitivities.
- **Inputs from sponsor:** Project summary, sponsor narrative, target rating, target debt amount.
- **Rating-agency factor satisfied:** Frames the rating committee's read; the executive summary anchors the analyst's initial impressions.
- **Bible touchpoint:** Silo 8 — Rating Strategy.

### 3. The Community / Project Description

- **Required exhibits:**
  - Site map and aerial
  - Unit count table by level of care (IL / AL / MC / SNF) — pre- and post-project
  - Square-footage table by unit type
  - Common-area inventory (clubhouse, dining, wellness)
  - Phased-development timeline
- **Inputs from sponsor:** Architectural plans, site plan, unit mix schedule, common-area program. Jacaranda's teaser shows the exact form (line 42–48): "33-acre, multi-phase, 55+ continuing care retirement community in Venice, Florida (Sarasota County, ZIP 34293)…436 total independent living units…Post-Project: 371 IL + 51 AL + 18 MC + 16 new Skilled Nursing beds = 456 units."
- **Rating-agency factor satisfied:** Operating Risk / Capital position — the agencies need to see the physical asset specification.
- **Bible touchpoint:** Silo 4 — feeds POS Project section.

### 4. The Sponsor and Management

- **Required exhibits:**
  - Sponsor org chart (Convivial Jacaranda Trace LLC → Convivial Life Inc. (501(c)(3)) → LifeStar Management Jacaranda Trace LLC, per teaser line 178–180)
  - Principals bios
  - Track record of prior CCRCs operated
  - Management contract summary
  - Governance — board composition, independence, committee charters
- **Inputs from sponsor:** Org chart, principal bios, prior project list, management agreement.
- **Rating-agency factor satisfied:** Moody's "Governance" factor; Fitch Revenue Defensibility (management quality is embedded).
- **Bible touchpoint:** Stage 2 — Sponsor Diligence Agent (Bible §17.4). Feasibility study sponsor section should match the Sponsor Profile Agent's output; mismatches are red flags.

### 5. Primary Market Area (PMA) Definition and Demographics

- **Required exhibits:**
  - PMA map with ZIP-code boundaries
  - Justification of PMA scope (typically based on origin of current residents — Jacaranda's PMA is 11 ZIP codes capturing 80% of current residents, per teaser line 49)
  - Population by age cohort (75+, 80+, 85+) for PMA and SMA (secondary market area) with 5-year forecast
  - Households by age cohort and income band (typically Age 75+ with $50K+ income — Jacaranda teaser line 134 cites 25,511 in 2026 and 30,647 in 2030)
  - Income distribution within the PMA
  - Net wealth indicators where available
- **Inputs from sponsor:** Current resident roster with origin ZIP codes; depositor roster with origin ZIPs; prior market studies if any.
- **Data sources the consultant pulls:** Claritas / Environics Analytics demographic data, Esri Business Analyst, U.S. Census ACS, sometimes proprietary CCRC-industry datasets.
- **Rating-agency factor satisfied:** Revenue Defensibility (Fitch) / Market Position (Moody's / S&P).
- **Bible touchpoint:** EagleEye sector intelligence — should be pre-loading PMA demographics on signal generation, but not substituting for the feasibility consultant's defined PMA.

### 6. Competitive Supply Analysis

- **Required exhibits:**
  - Competitor inventory table — every CCRC, AL community, MC community, SNF, and active-adult community in the PMA
  - For each competitor: address, ownership, unit count by level of care, contract type, entrance-fee range, monthly service fee range, current occupancy, age of facility, amenities, target market positioning
  - Map of competitive supply
  - Pipeline of announced/under-construction supply
- **Inputs from sponsor:** Sponsor's own competitive intelligence; sponsor management's understanding of "real" vs. "stated" competitors.
- **Data sources:** Consultant's own database, NIC MAP Vision (the industry-standard senior living data service), state regulator filings, on-site visits / mystery shopper calls.
- **Rating-agency factor satisfied:** Revenue Defensibility — agencies will benchmark the subject project against the competitive set on price and amenity.
- **Bible touchpoint:** Should feed back into EagleEye's senior-living signal layer.

### 7. Penetration / Capture Rate Analysis

- **Required exhibits:**
  - Qualified household count (age 75+ × income $50K+ filter applied to PMA)
  - Required project capture rate (Project IL units to fill ÷ qualified households)
  - Gross market penetration (total CCRC IL units in PMA including subject and competitors ÷ qualified households)
  - Comparison to industry threshold (industry rule of thumb: <2% project, <12% gross; Jacaranda's 0.3% / 6.7% (teaser line 137–138) is solidly favorable)
- **Inputs from sponsor:** Number of units to fill (or to maintain occupancy); project IL inventory by phase.
- **Rating-agency factor satisfied:** Revenue Defensibility — the demand-supply gap calculation is the single most-cited datapoint in rating reports.
- **Bible touchpoint:** Silo 8 — Rating Strategy Agent inputs.

### 8. Pricing and Service Schedule

- **Required exhibits:**
  - Entrance fee schedule by unit type (Jacaranda teaser line 90: implied avg fee $430K from 27-unit turnover at $11.59M gross)
  - Monthly service fee schedule by unit type and by level of care
  - Refund schedule (50%, 90%, declining-balance)
  - Second-person fees
  - Comparison to competitive supply pricing
  - Resident contract type breakdown (Type A / B / C)
  - Historical pricing increases (typically 5-year history)
- **Inputs from sponsor:** Current rate cards, prior-year rate cards (5 years), planned future increases, signed residency agreements.
- **Rating-agency factor satisfied:** Revenue Defensibility — pricing power vs. competition.

### 9. Marketing and Sales Plan

- **Required exhibits:**
  - Marketing-staff org chart and headcount
  - Marketing budget (current and projected)
  - Lead generation history (5-year, by source)
  - Lead-to-deposit conversion rate
  - Deposit-to-move-in conversion rate
  - Waitlist size and demographic
  - Current depositor pipeline by unit type
- **Inputs from sponsor:** CRM extract (Salesforce, REPS, OneDayHQ, sector-specific tools), marketing-spend history, marketing strategy memo.
- **Rating-agency factor satisfied:** Revenue Defensibility — demand realization, not just demand existence.

### 10. Resident Profile and Occupancy History

- **Required exhibits:**
  - Resident demographic profile (age, marital status, source of funds, prior residence ZIP)
  - Historical occupancy by level of care (5-year, monthly)
  - Length-of-stay analysis by level of care
  - Internal-transfer history (IL → AL → MC → SNF)
  - Mortality and morbidity actuarial assumptions
- **Inputs from sponsor:** Resident roster, move-in/move-out log, transfer log, prior actuarial study if any.
- **Rating-agency factor satisfied:** Operating Risk — internal-transfer assumptions drive the financial forecast's occupancy assumption.

### 11. Entrance Fee Velocity / Turnover Analysis (entrance-fee CCRCs only)

- **Required exhibits:**
  - Historical turnover rate by year (Jacaranda teaser line 95: audited 2023 = 13.4%)
  - Net entrance-fee cash by year — gross receipts, refunds, net (Jacaranda teaser line 92–94: $11.59M gross, $3.31M refunds, $8.28M net)
  - Stress-case turnover scenarios
  - Refund-liability roll-forward
- **Inputs from sponsor:** 5-year entrance-fee receipt journal, refund payment journal, residency-agreement contract type breakdown.
- **Rating-agency factor satisfied:** Financial Profile — for Fitch/Moody's, this is the highest-leverage section because entrance-fee receipts often drive >50% of incremental debt service capacity.
- **Bible touchpoint:** This is the section Bernard should aggressively explain to founders — it's the difference between rating a CCRC like an apartment complex (wrong) and rating it on cash-velocity economics (right). The Jacaranda teaser line 80 captures the framing: "The core misunderstanding institutional lenders make on CCRCs is evaluating them like a rental NOI asset."

### 12. Examined Financial Forecast — Multi-Year

- **Required exhibits:**
  - 5-year P&L forecast (Jacaranda teaser line 116–123 shows 2025–2029)
  - 5-year balance sheet forecast
  - 5-year cash flow forecast including entrance-fee receipts and refunds
  - Sources and uses of funds (Jacaranda teaser line 52–75 shows the $205.5M S&U)
  - Debt service schedule by series
  - MADS coverage by year (Jacaranda teaser line 122: 1.52x → 1.81x → 1.93x → 1.83x → 1.90x)
  - Days Cash on Hand by year (Jacaranda teaser line 123: 209 → 235 → 235 → 273 → 314)
  - Liquidity covenant compliance
- **Inputs from sponsor:** Sponsor pro forma (which the consultant re-underwrites — Bible §17.5 calls this the "Re-Underwriting Agent" step on the platform side), capex schedule, financing assumptions.
- **Rating-agency factor satisfied:** Financial Profile (all three agencies).
- **Bible touchpoint:** Bible §17.5 — Re-Underwriting Agent. The platform's re-underwriting output should be reconciled against the feasibility consultant's examined forecast; material divergence is a flag.

### 13. Sensitivity / Stress Analysis

- **Required exhibits:**
  - At least 3 stress scenarios — typically: (a) fill-up delay, (b) entrance-fee receipt stress, (c) operating expense inflation. Jacaranda teaser line 161 shows 5 stresses.
  - For each: revised MADS coverage, revised DCOH, time-to-covenant-breach
- **Inputs from sponsor:** Sensitivity preferences; sponsor's view on plausible downsides.
- **Rating-agency factor satisfied:** Financial Profile — stress-case behavior is what differentiates a BBB from an A rating.

### 14. Underlying Assumptions and Schedules / Appendices

- **Required exhibits:**
  - Detailed assumption tables for every revenue and expense line
  - Staffing model with FTEs and wage rates
  - Capex assumption schedule
  - Insurance assumption schedule
  - Property tax / PILOT assumption
  - Inflation indices used
  - Construction cost schedule (on projects with construction)
- **Inputs from sponsor:** Operating budgets, staffing plan, insurance certificates, property-tax history.
- **Rating-agency factor satisfied:** Auditable trail behind every forecast line.

---

## Document variants — which one does a given Deal need?

Different consultants produce different things. The Roots ingestion engine needs to recognize and demand the correct artifact per deal type. Here is the decision tree.

### Variant 1 — Examined Financial Forecast / Feasibility Study (full)

- **What it is:** The 14-section document detailed above, produced under AICPA AT-C 305 / 301 examination standards with an accountant's report.
- **When required:** New-construction CCRCs, charter schools at start-up or major expansion, hospitals at significant expansion or repositioning, tax-exempt healthcare and senior living refundings where the agency demands a fresh forecast.
- **Who produces:** Forvis Mazars, CLA, Marcum, Plante Moran Living Forward, Kaufman Hall, ECG.
- **Timeline:** 10–14 weeks.
- **Fee:** $100K–$250K.
- **Jacaranda example:** Forvis Mazars, May 30, 2025 examined forecast.

### Variant 2 — Market Study (standalone)

- **What it is:** PMA demographics + competitive supply + capture/penetration analysis + achievable rents. No examined forecast.
- **When required:** Multifamily PAB §142 (LIHTC and tax-exempt mixed-use); refunding or refinancing of a stabilized CCRC where no new construction is involved AND the agency does not require a fresh examined forecast; multifamily market-rate.
- **Who produces:** Novogradac, RPRG, Valbridge, CBRE/JLL, PMD Advisors, Aspire Senior Insight, KMC Partners.
- **Timeline:** 6–10 weeks.
- **Fee:** $25K–$75K.

### Variant 3 — Entrance-Fee Velocity / Turnover Analysis (standalone)

- **What it is:** Just Section 11 of the full feasibility study, written as a standalone artifact when a sponsor needs to defend the entrance-fee math to a private-credit counterparty (e.g., Jacaranda's Track B bridge counterparties) without commissioning a full feasibility study.
- **When required:** Private placements where rating agencies are not engaged but the lender wants forensic comfort on the entrance-fee engine.
- **Who produces:** Most of the CCRC feasibility firms can write this as a standalone deliverable; also some sector specialists (Greystone Healthcare Capital affiliates, etc.).
- **Timeline:** 4–6 weeks.
- **Fee:** $40K–$80K.
- **Jacaranda Track B relevance:** Jacaranda's bridge tracks (Track B, Track C in the institutional teaser) explicitly rely on the entrance-fee engine; a standalone velocity analysis would be valuable for those counterparties as a supplement to the Forvis Mazars examined forecast.

### Variant 4 — Actuarial Study

- **What it is:** Long-horizon (typically 30-year) actuarial projection of resident mortality, morbidity, internal transfers, and refund liabilities under Type A (life-care) contracts. Distinct from feasibility study — actuarial firms (e.g., Continuing Care Actuaries, A.V. Powell & Associates) produce these.
- **When required:** Type A CCRCs at issuance (rating-agency required for life-care contracts); periodic re-examination per state regulation (Florida Chapter 651, California §1792, others); certain expansion bonds where contract liabilities shift.
- **Who produces:** Continuing Care Actuaries (CCA), A.V. Powell & Associates, Milliman senior living practice.
- **Timeline:** 8–12 weeks.
- **Fee:** $75K–$200K.

### Variant 5 — Occupancy Ramp / Absorption Analysis

- **What it is:** A focused analysis of the rate at which a new project will fill — units per month, by unit type, with sensitivity. Often embedded in the full feasibility study but sometimes produced standalone for development financings.
- **When required:** Construction financings where the bridge lender or surety needs comfort on ramp economics.
- **Who produces:** PMD, Aspire, KMC, sometimes the same firm producing the full feasibility.
- **Timeline:** 4–6 weeks.
- **Fee:** $30K–$70K.

### Variant 6 — Charter School Demand / Enrollment Study

- **What it is:** Analogue of CCRC feasibility for the charter school sector. Application/enrollment trends + academic performance + financial forecast.
- **Who produces:** Public Impact, Bellwether, Charter School Capital, CSDC.
- **Timeline:** 8–12 weeks.
- **Fee:** $50K–$125K.

### Variant 7 — Hospital / Healthcare Feasibility Study

- **What it is:** Service area + volume forecast + payor mix + examined financial forecast for hospital and health-system bonds.
- **Who produces:** Kaufman Hall, Ponder & Co., ECG.
- **Timeline:** 12–16 weeks.
- **Fee:** $150K–$300K.

### Decision tree (NAICS → variant)

```
NAICS 623110 / 623210 / 623311 / 623312 — Senior living / CCRC
  → New construction or major repositioning?
      → YES → Variant 1 (full feasibility) + Variant 4 (actuarial) if Type A
      → NO (refunding of stabilized) → Variant 1 if rating agency requires;
                                       Variant 2 (market study) + Variant 3 (entrance-fee velocity) otherwise

NAICS 611110 / 611310 — Charter schools / education
  → New school or major expansion?
      → YES → Variant 6 (demand/enrollment study) + Academic Performance Review
      → NO (refunding) → Variant 6 update or Variant 2 lite

NAICS 531110 / 531311 (multifamily housing)
  → Tax-exempt PAB §142 / LIHTC?
      → YES → Variant 2 (market study) — Novogradac
      → NO (market-rate) → Variant 2 (market study) — CBRE/JLL/Valbridge

NAICS 622110 / 622210 / 622310 (hospital / health system)
  → ANY material new debt → Variant 7 (hospital feasibility)
```

---

## Mapping each feasibility-study section to NEST's rating-agency factor model

The CLAUDE.md JP Morgan credit benchmarks are the platform's ratings spine:

```
A-grade:  DSCR>2.0, CF_leverage<1.5, BS_leverage<2.0, LTV<55%, D/EBITDA<4.5, ICR>3.5
BBB+:     DSCR>1.75, CF_leverage<1.75, BS_leverage<2.25, LTV<62%, D/EBITDA<5.5, ICR>2.75
BBB-:     DSCR>1.5, CF_leverage<2.0, BS_leverage<2.5, LTV<70%, D/EBITDA<6.5, ICR>2.25
Sub-IG:   DSCR<1.5 (any single breach = sub-investment grade)
```

For CCRC bonds specifically, the JPM general-corporate benchmarks need to be supplemented with the **sector-specific** ratios the agencies actually publish:

| Sector ratio | A category (industry) | BBB category (industry) | Below IG | Feeding feasibility section |
|---|---|---|---|---|
| MADS coverage | >2.00x | 1.50x–2.00x | <1.50x | §12 Examined Forecast |
| Days Cash on Hand | >400 | 200–400 | <200 | §12 Examined Forecast |
| Cash-to-Adjusted-Debt | >75% | 35%–75% | <35% | §12 Examined Forecast |
| Project Capture Rate (CCRC) | <2% | 2%–6% | >6% | §7 Penetration |
| Gross Market Penetration (CCRC) | <8% | 8%–15% | >15% | §7 Penetration |
| IL Occupancy at stabilization | >95% | 90%–95% | <90% | §10 Resident Profile |
| Entrance Fee Turnover | 8%–14% | 5%–8% | <5% | §11 Velocity |

**[INDUSTRY KNOWLEDGE — VERIFY exact agency thresholds against the live Fitch/Moody's/S&P methodologies. The directionality and order-of-magnitude are widely cited in Ziegler / HJ Sims / Cain Brothers market commentary.]**

Jacaranda Trace's stated metrics (Forvis Mazars examined, per teaser): 1.90x MADS at stabilization, 314 DCOH, 0.3% project capture, 6.7% gross penetration. Mapping those against the table above: **BBB / BBB+ on coverage and liquidity, A-category on demand defensibility.** The teaser's own claim — "approaching investment-grade levels" — is consistent.

---

## Gaps and conflicts vs. Bible Silo 4

Per the assignment: "Cross-reference against the Bible's Silo 4 (Documents) at `C:\Users\sgill\nest\docs\Bible_Pass1_v2.md` — note any gaps or conflicts between what Bible Silo 4 lists and what the rating agency criteria actually require."

### Bible Silo 4 — what is documented

The Bible's Silo 4 document inventory (§4.9, lines 1651–1671) explicitly categorizes:

- Master Transaction Documents (Indenture, Loan Agreement, Tax Regulatory, BPA, Regulatory Agreement)
- Security Documents (Mortgage, UCC, Assignment of Rents, Subordination)
- Marketing Documents (POS, OS, Pitch Book)
- Opinion Documents (Bond Counsel, Disclosure, Borrower's, Trustee's, Underwriter's, Comfort Letter, Auditor's Consent, Tax)
- Operational Documents (CDA, Construction Disbursement, Paying Agent, Bondholder Representative)
- Closing Certificates
- Public Filings

Silo 4 mentions feasibility studies as an *appendix to the POS* (line 1413: "appendices (audited financials, feasibility study, market study, appraisal, form of indenture, form of legal opinion, form of continuing disclosure agreement)") and treats the feasibility consultant as a counterparty (§2.14, lines 515–521).

### Gaps Bible Silo 4 should close

1. **The feasibility study is not catalogued as its own structured-document class.** It is treated as a POS appendix and as an output of a §2.14 counterparty, but the 14-section internal structure of the study is not documented anywhere in the Bible. **This is the gap this reference document fills.** Recommend that a Silo 4 supplement be added that names the feasibility study (and market study, actuarial study, occupancy ramp, entrance-fee velocity) as first-class document classes with section-level schemas.

2. **No "Independent Accountants' Examination Report" entry in §4.4 Opinion Documents.** The examination report is conceptually distinct from the auditor's consent letter and the comfort letter; both are SAS-72-based for selected financial information, whereas the feasibility examination report is AICPA AT-C 305 / AT-301-based for prospective financial information. Recommend §4.4 add it as a distinct opinion class.

3. **No actuarial study category.** Type A CCRCs require an actuarial study; the Bible does not name this artifact. Recommend a new sub-section under §4.5 (Operational Documents) or as a sector-specific addendum for senior living and Type A contracts.

4. **No multifamily market study category.** PAB §142 deals require a market study satisfying state HFA / LIHTC allocator standards; the Bible mentions Novogradac as a counterparty but does not name the artifact.

5. **No charter school demand study category.** Same gap.

6. **Bible §2.14 names "Dixon Hughes Goodman."** The post-2024 firm is **Forvis Mazars** (BKD + DHG → FORVIS in 2022; FORVIS + Mazars → Forvis Mazars in 2024). The Jacaranda Trace teaser uses the correct current name. Recommend a Bible patch.

7. **Bible §17.3 — Data Validation Agent.** The agent's "sector-specific document requirements" rule library is referenced but not defined for CCRC. The 14-section schema in this document is the rule library payload for CCRC.

---

## NEST platform implications

### What Roots demands at Stage 1 ingestion (per NAICS)

For Roots to be specific and helpful, the Stage 1 document-completeness report must say more than "feasibility study — missing." It must say:

- "CCRC feasibility study — missing. Required sections (14). Acceptable consultants: Forvis Mazars, CLA, Marcum, Plante Moran. Estimated cost $100K-$250K. Estimated timeline 10-14 weeks. Estimated critical-path impact: blocks Stage 3 (Project Underwriting), Stage 5 (Rating Strategy), and Stage 8 (Rating Presentation)."

This implies Roots needs:

- A **feasibility-study schema** with one slot per of the 14 sections above, each tagged to its rating-agency factor.
- A **consultant short-list** per NAICS that the NAICS rules engine returns.
- A **freshness threshold** for each sub-section. A feasibility study with a 2-year-old PMA demographic update is stale; a study with a 6-month-old examined forecast is fresh.
- A **section-level extractor** so each section is parsed into structured data, not stored as one giant blob PDF.

### What Bernard's Intake Brainstorm asks the founder

Per ADR-0002, the Intake Brainstorm is a Bernard surface that fires after Deal Input and before Roots ingestion. For CCRC NAICS codes, Bernard should ask:

1. "Is this a new-construction project, a refinancing of a stabilized community, or a major expansion / repositioning?" → drives Variant selection
2. "What contract type does your community offer — Type A life-care, Type B modified, Type C fee-for-service, or rental?" → drives actuarial requirement
3. "Do you have a feasibility study commissioned in the last 18 months?" → drives whether refresh is needed
4. "Who is the feasibility consultant — and are they on the rating-agency-accepted list (Forvis Mazars, CLA, Marcum, Plante Moran, Kaufman Hall, Ponder, ECG)?" → flags off-list consultants
5. "What is your historical entrance-fee turnover rate (last 3 years)?" → drives Section 11 emphasis
6. "What is your current waitlist depositor count?" → drives Section 9 emphasis
7. "What is the project capture rate the most recent feasibility study showed?" → drives target-rating realism check

These map directly to the rating-agency factor model in §"Mapping each feasibility-study section…" above. Bernard's first-look memo should produce — at this NAICS — a synthesis line for each.

### What goes into the Cost of Issuance line item for "Feasibility consultant"

Per Bible §2.14 and §5.2 (lines 659, 1727): **$50K–$250K**. For CCRC specifically:

- Sub-50-unit deals (rare in bond market): $50K–$80K
- 50–150-unit middle-market CCRC: $80K–$150K
- 150–400-unit CCRC (Jacaranda scale at 436 IL units pre-project / 456 post-project): $125K–$250K
- 400+ -unit master-planned CCRC: $200K–$400K (sometimes split into a base feasibility + actuarial + occupancy ramp)

These should be encoded as `naics_rules_engine` outputs that the Cost of Issuance calculator in Bond Desk pulls.

### Counterparty roles → consultant types

The Bible's §2.21 (Roles and Loyalties) puts feasibility consultants on the issuer/obligor side. Suggested Hawkeye Dossier coverage (per `project_hawkeye_dossier`):

| NEST role | Bible §2.x | Suggested Hawkeye dossier seed list |
|---|---|---|
| CCRC feasibility consultant | §2.14 | Forvis Mazars (Atlanta — Jacaranda), CLA (Minneapolis), Marcum (NYC), Plante Moran (Detroit), Kaufman Hall (Chicago) |
| Healthcare feasibility consultant | §2.14 | Kaufman Hall, Ponder & Co., ECG Management Consultants |
| Charter school study consultant | §2.14 | Public Impact, Bellwether Education Partners, Charter Schools Development Corp |
| Multifamily market study consultant | §2.14 / §2.15 | Novogradac, RPRG, Valbridge, CBRE, JLL |
| Actuarial consultant (Type A CCRCs) | NEW — gap in Bible | Continuing Care Actuaries (CCA), A.V. Powell & Associates, Milliman senior living |
| Appraiser (senior living) | NEW — gap in Bible | HealthTrust (referenced Jacaranda lender memo), CBRE Senior Housing, JLL Senior Housing |

---

## Quick reference — what a NEST CCRC deal needs, on Day 1

Based on Jacaranda Trace's actual artifact set (institutional teaser, lender memo, credit memorandum, audited 2023–2024 financials, Q2 2025 financial report, draft Official Statement filename), the minimum Day-1 artifact set Roots should demand for a CCRC Deal Input:

1. ✅ **Audited financials, last 3–5 years** — Jacaranda has `Jacaranda_audited_2023_2024_fINANCIALS.pdf`
2. ✅ **Most recent quarterly / monthly operating statements** — Jacaranda has `Q2 2025 Jacaranda Financial Report.pdf`
3. ✅ **EMMA disclosure filings for any existing bonds** — Jacaranda has `620-Jacaranda Trace-Financials Internal-EMMA.pdf` (CUSIP/EMMA series 620)
4. ✅ **Sponsor pro forma / model** — Jacaranda has `Jacaranda_24M_Model_Investor_Deck.xlsx`
5. ⏳ **Examined feasibility study** — Jacaranda has Forvis Mazars (May 30, 2025) referenced in the teaser but the document itself is "available in the data room" (teaser line 214) — Roots needs the full document not just the cover memo
6. ✅ **Appraisal** — Jacaranda has HealthTrust appraisal referenced (~$199M on 331-unit interest, per lender memo line 7)
7. ✅ **Project / construction documents** — Jacaranda has `Jacaranda Trace Program Estimate 03.18.2024.pdf` (program/construction estimate)
8. ✅ **Capital memorandum** — Jacaranda has `Jacaranda_Capital_Memo_Final.pdf` and `Jacaranda_Trace_Credit_Memorandum.pdf`
9. ✅ **Investor deck / lender deck** — Jacaranda has `jacaranda_master_lender_deck_v2.pdf`
10. ⏳ **Actuarial study** — not visible in Jacaranda artifacts; required if Type A contracts exist (which is unclear from teaser; Convivial historically operates modified-contract communities — needs verification)
11. ⏳ **Florida Chapter 651 reserve / regulatory filings** — referenced in teaser line 196 ("statutory reserves under Florida Chapter 651") but the underlying filings aren't in the Downloads folder
12. ⏳ **Residency agreement template** — required by feasibility consultant but not visible in Jacaranda artifacts
13. ⏳ **Waitlist / depositor data** — required by feasibility consultant but not visible
14. ⏳ **PMA resident-origin ZIP data** — Jacaranda teaser line 49 cites "80% of current residents originate from this PMA" but the underlying resident-origin dataset is not visible

The ⏳ items are the gaps Roots should flag as outstanding requests on Day 1 of a Jacaranda-pattern deal.

---

## Sources

### NEST artifacts cited inline (today, no fetch needed)

- `C:\Users\sgill\nest\docs\Bible_Pass1_v2.md` — Silo 2 (Counterparties, §2.7, 2.14, 2.15, 2.16, 2.21), Silo 3 (Stages 0–1, §3.1, 3.2), Silo 4 (Documents, §4.1–4.9), Silo 5 (Fee Architecture, §5.2), Silo 17 (Agent Specifications, §17.3, 17.4, 17.5)
- `C:\Users\sgill\nest\docs\adr\0002-deal-lifecycle-entry-points.md` — Deal-creation single front-door; NAICS → bond type → docs → feasibility deterministic rules; Intake Brainstorm
- `C:\Users\sgill\nest\CLAUDE.md` — JPM Credit Benchmarks (A-grade through Sub-IG)
- `C:\Users\sgill\Downloads\sellside_unzip\jacaranda-institutional-teaser.md` — Jacaranda Trace $203M senior living revenue bonds Series 2025, Forvis Mazars examined forecast, audited 2023 turnover data, sponsor/counterparty stack
- `C:\Users\sgill\Downloads\Jacaranda_Trace_Credit_Memorandum.pdf` — Bridge-to-bank-and-bond refinancing proposal, bridge-period economics, stabilized basis, bond takeout mechanics
- `C:\Users\sgill\Downloads\jacaranda_lender_memo.pdf` — HealthTrust appraisal reference, loan request structures
- `C:\Users\sgill\Downloads\20251386 Jacaranda Trace Retirement Community-DRAFT (1) 2026.02.04.pdf` — Draft Official Statement / disclosure document (filename indicates Florida LGFC series, dated Feb 4, 2026)

### URLs that should be fetched in a permitted environment to verify [INDUSTRY KNOWLEDGE — VERIFY] tags

The next research pass with WebFetch / WebSearch enabled should pull:

- Fitch: *U.S. Not-for-Profit Life Plan Community Rating Criteria* (most recent) — fitchratings.com
- Fitch: *U.S. Not-for-Profit Hospitals and Health Systems Rating Criteria* — fitchratings.com
- Fitch: *U.S. Charter Schools Rating Criteria* — fitchratings.com
- Fitch: *U.S. Multifamily Affordable Housing Bond Rating Criteria* — fitchratings.com
- Moody's: *U.S. Not-for-Profit Senior Living Methodology* — moodys.com
- Moody's: *Not-for-Profit and Public Healthcare Methodology* — moodys.com
- Moody's: *U.S. Charter Schools Methodology* — moodys.com
- Moody's: *U.S. Public Housing Authority Methodology* — moodys.com
- S&P: *U.S. Not-for-Profit Senior Living Methodology* (re-released ~June 2024) — spglobal.com
- S&P: *U.S. Not-for-Profit Acute Health Care Methodology* — spglobal.com
- S&P: *U.S. Charter Schools Methodology* — spglobal.com
- S&P: *U.S. Multifamily Affordable Housing Methodology* — spglobal.com
- KBRA: *U.S. Senior Living Rating Methodology* — kbra.com
- Consultant marketing pages: forvismazars.us, claconnect.com, marcumllp.com, plantemoran.com (Living Forward practice), kaufmanhall.com, ponderco.com, ecgmc.com, publicimpact.com, bellwether.org, novoco.com, rprg.net
- Industry market commentary referenced for thresholds: Ziegler senior living publications (ziegler.com), HJ Sims commentary (hjsims.com), Cain Brothers senior living research (cainbrothers.com)
- Florida Office of Insurance Regulation (OIR) — Chapter 651 reserves regime, Continuing Care Provider Annual Reports — floir.com
- For comparable issued bond Official Statements (real feasibility-study TOCs): EMMA municipal disclosure — emma.msrb.org — search for: Florida LGFC senior living bond series, Ziegler-underwritten CCRC issuances 2022–2025

### Bible patches recommended

- §2.14 — change "Dixon Hughes Goodman" to "Forvis Mazars" (or list both with a note)
- §4.4 — add **Independent Accountants' Examination Report** as a distinct opinion class
- §4.5 — add **Actuarial Study** as a sector-specific operational/disclosure document (Type A CCRCs and state-regulated CCRCs)
- §4.9 — add a Document Inventory entry "Sector-Specific Studies" listing: Feasibility Study (CCRC, hospital), Market Study (multifamily, real estate), Demand/Enrollment Study (charter schools), Actuarial Study (Type A CCRCs), Entrance-Fee Velocity Analysis (CCRC private placements), Occupancy Ramp Analysis (construction deals)
- §17.3 — Data Validation Agent rule library should reference this document's 14-section CCRC schema as the sector-specific document-requirement payload for NAICS 623110 / 623210 / 623311 / 623312
