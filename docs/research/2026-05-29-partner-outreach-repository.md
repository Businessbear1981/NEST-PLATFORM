# NEST Partner Outreach Repository — Scaffold, Seed List, EMMA Harvest Playbook

**Status:** Draft scaffold · 2026-05-29
**Owner:** Sean Gilmore
**Audience:** Aria (client / BD outreach agent), Sterling (investor placement agent), LenderScout (direct lender sourcing agent), Hawkeye (dossier system), Bernard (Intake Brainstorm references), EagleEye (signal generation)
**Type:** Data-spec + seed list + harvest playbook — feeds existing agents as data, no new modules
**Companion to:**
- `2026-05-28-feasibility-study-requirements.md`
- `2026-05-28-surety-and-credit-enhancement-requirements.md`

---

## Why this exists

The feasibility-study and surety/credit-enhancement research docs identified a universe of ~150–200 industry firms NEST needs to know, track, and selectively engage. Per `project_hawkeye_dossier`, the platform builds living dossiers on top 20 investors + deal counterparties. Per `project_nest_priority_demo`, Phase 1 is investor-visible relationship infrastructure. Per ADR-0002, the NAICS rules engine returns deterministic counterparty short-lists per deal.

This document is the **bridge between research output (firm names) and platform operation (named contacts, EMMA-validated track records, outreach queues that Aria/Sterling/LenderScout consume)**. It is a data spec, a seed list, and an execution playbook — not a new module. Existing agents (Aria, Sterling, LenderScout, Hawkeye) read this data; the data shape is defined here; the data population is the next-session work (Path B).

Per the locked frontend + backend posture (2026-05-29 confirmation): **no new modules, no new screens, no new routes, no new tables.** This document is pure research artifact / data feed.

---

## Environment note

WebFetch and WebSearch remain denied in this sandbox. This document delivers the **schema** (complete), the **seed firm list** (~150 firms from Bible + CLAUDE.md + Jacaranda artifacts + companion research docs), and the **harvest playbook** (the exact EMMA queries and parsing rules for the next-session Path B run). Contact rows are **deliberately empty** in the seed list — they get populated when WebFetch is enabled.

---

## Repository structure (file layout)

```
docs/research/partners/
├── README.md                          # this document, summarized
├── _schema.yaml                       # canonical schema definition
├── _harvest_playbook.md               # EMMA / web harvest procedure
├── _outreach_queue_logic.md           # how Aria/Sterling/LenderScout rank prospects
│
├── 01_surety_brokers/
│   ├── hylant.yaml                    # PRIMARY relationship
│   ├── marsh.yaml
│   ├── aon.yaml
│   ├── willis_towers_watson.yaml
│   ├── lockton.yaml
│   ├── usi.yaml
│   ├── brown_and_brown.yaml
│   └── hub_international.yaml
│
├── 02_surety_carriers/
│   ├── travelers.yaml
│   ├── liberty_mutual.yaml
│   ├── zurich.yaml
│   ├── cna.yaml
│   ├── chubb.yaml
│   ├── hartford.yaml
│   ├── arch.yaml
│   ├── amtrust.yaml
│   └── old_republic.yaml
│
├── 03_loc_banks/
│   ├── jpmorgan_chase.yaml
│   ├── bofa.yaml
│   ├── wells_fargo.yaml
│   ├── us_bank.yaml
│   ├── bny_mellon.yaml
│   ├── pnc.yaml
│   ├── bmo.yaml
│   ├── fifth_third.yaml
│   ├── regions.yaml
│   ├── hsbc.yaml
│   ├── rbc.yaml
│   └── barclays.yaml
│
├── 04_bond_insurers/
│   ├── assured_guaranty_municipal.yaml
│   └── build_america_mutual.yaml
│
├── 05_federal_program_desks/
│   ├── hud_multifamily_office.yaml
│   ├── hud_232_lean_office.yaml
│   ├── hud_242_hospitals.yaml
│   ├── usda_rural_development.yaml
│   ├── ginnie_mae.yaml
│   ├── fannie_mae_dus.yaml
│   └── freddie_mac_optigo.yaml
│
├── 06_state_hfas_and_intercept/
│   ├── florida_lgfc.yaml               # Jacaranda's conduit
│   ├── new_york_dasny.yaml
│   ├── new_york_state_hfa.yaml
│   ├── pennsylvania_phfa.yaml
│   ├── pennsylvania_act_150.yaml
│   ├── massachusetts_massdevelopment.yaml
│   ├── massachusetts_masshousing.yaml
│   ├── new_jersey_eda.yaml
│   ├── new_jersey_hmfa.yaml
│   ├── illinois_ihda.yaml
│   ├── california_calhfa.yaml
│   ├── california_cscda.yaml
│   ├── texas_psf_guarantee.yaml
│   ├── texas_tsahc.yaml
│   ├── colorado_charter_credit.yaml
│   ├── indiana_charter_credit.yaml
│   ├── michigan_school_bond_loan_fund.yaml
│   └── wisconsin_public_finance_authority.yaml
│
├── 07_feasibility_and_market_consultants/
│   ├── forvis_mazars.yaml              # Jacaranda's feasibility firm
│   ├── clifton_larson_allen.yaml
│   ├── marcum.yaml
│   ├── plante_moran_living_forward.yaml
│   ├── kaufman_hall.yaml
│   ├── ponder.yaml
│   ├── ecg_management_consultants.yaml
│   ├── pmd_advisors.yaml
│   ├── aspire_senior_insight.yaml
│   ├── kmc_partners.yaml
│   ├── public_impact.yaml
│   ├── bellwether_education.yaml
│   ├── novogradac.yaml
│   ├── rprg.yaml
│   ├── valbridge.yaml
│   ├── healthtrust.yaml
│   ├── continuing_care_actuaries.yaml
│   ├── av_powell.yaml
│   ├── milliman_senior_living.yaml
│   ├── cbre.yaml
│   ├── jll.yaml
│   ├── cushman_wakefield.yaml
│   └── newmark.yaml
│
├── 08_conduit_issuers/
│   ├── florida_lgfc.yaml               # cross-reference with 06
│   ├── california_pfa.yaml
│   ├── public_finance_authority_wi.yaml
│   ├── california_municipal_finance_authority.yaml
│   ├── california_statewide_communities_development_authority.yaml
│   ├── new_jersey_eda.yaml              # cross-reference with 06
│   ├── new_jersey_hmfa.yaml             # cross-reference with 06
│   ├── massachusetts_massdevelopment.yaml # cross-reference with 06
│   ├── colorado_educational_cultural_facilities_authority.yaml
│   └── arizona_industrial_development_authority.yaml
│
└── 09_underwriters_bd_partners/
    ├── ziegler.yaml                     # Jacaranda's underwriter; dominant CCRC
    ├── hj_sims.yaml
    ├── cain_brothers.yaml
    ├── truist_capital_markets.yaml
    ├── rbc_capital_markets.yaml
    ├── piper_sandler.yaml
    ├── stifel.yaml
    ├── raymond_james.yaml
    ├── ramirez.yaml
    ├── siebert_williams_shank.yaml
    └── academy_securities.yaml
```

**Total seed entries:** ~120 firms across 9 categories. Real count after EMMA harvest expected: ~150–200 (additions: bond counsel firms, disclosure counsel firms, trustee corporate-trust groups, specialty boutiques surfaced by OS counterparty extraction).

**Naming convention:** `lowercase_snake_case.yaml`. Folder prefixes (`01_`, `02_`) preserve sort order in file explorers; category numbers match the surety/credit-enhancement research doc.

---

## Canonical schema (`_schema.yaml`)

```yaml
# Every partner file conforms to this shape.
# Fields marked [REQUIRED] must be populated at seed time.
# Fields marked [HARVEST] get populated by EMMA/web research (Path B).
# Fields marked [RELATIONSHIP] get populated by Sean/Josh after first contact.

partner_id: string                              # [REQUIRED] slug, matches filename
category: enum                                  # [REQUIRED] 01_surety_brokers | 02_surety_carriers | 03_loc_banks | 04_bond_insurers | 05_federal_program_desks | 06_state_hfas_and_intercept | 07_feasibility_and_market_consultants | 08_conduit_issuers | 09_underwriters_bd_partners
firm_name: string                               # [REQUIRED]
firm_name_aliases: list[string]                 # [HARVEST] historical names, M&A predecessors
website: url                                    # [REQUIRED]
headquarters:                                   # [REQUIRED]
  city: string
  state: string
  country: string

sector_focus:                                   # [REQUIRED at seed; refined HARVEST]
  - senior_living_ccrc                          # NEST priority sector
  - charter_schools
  - multifamily_pab_142
  - healthcare_hospitals
  - corporate_project_finance
  - municipal_essential_service
  - other: string

naics_alignment: list[string]                   # [REQUIRED] e.g., ['623110', '623210', '623311', '623312']

geographic_focus:                               # [HARVEST]
  national: bool
  states: list[string]                          # state codes; empty if national
  international: bool

services_offered: list[string]                  # [REQUIRED]
                                                # for brokers: ['surety_placement', 'specialty_lines', 'po_bonds']
                                                # for carriers: ['performance_bond', 'payment_bond', 'dsrf_surety']
                                                # for LOC banks: ['direct_pay_loc', 'standby_loc', 'liquidity_facility']
                                                # for insurers: ['muni_wrap', 'public_finance_insurance']
                                                # etc.

# CARRIER / BANK CREDIT QUALITY (where applicable)
am_best_rating: string                          # [HARVEST] e.g., 'A++', 'A', 'A-'
sp_rating: string                               # [HARVEST]
moodys_rating: string                           # [HARVEST]
fitch_rating: string                            # [HARVEST]
rating_outlook: enum                            # [HARVEST] stable | positive | negative | watch

# CONTACTS
contacts:                                       # [HARVEST + RELATIONSHIP]
  - name: string
    title: string
    practice_area: string                       # e.g., 'CCRC bond practice', 'surety underwriting'
    email: string
    phone: string
    linkedin_url: url
    source: enum                                # emma_os | linkedin | firm_directory | trade_publication | personal_intro | conference
    last_verified: date
    relationship_owner_at_nest: string          # sean | josh | aria_agent | sterling_agent | lenderscout_agent
    relationship_strength: enum                 # cold | warm | active | strategic
    notes: string

# EMMA TRACK RECORD (sector counterparties)
emma_track_record:                              # [HARVEST]
  search_query: string                          # the EMMA query used
  last_harvest_date: date
  total_deals_24mo: int
  total_par_24mo: int
  recent_deals:                                 # last 10
    - cusip_or_os_id: string
      issuance_date: date
      obligor_name: string
      conduit_issuer_name: string
      par_amount: int
      sector: string
      role_in_deal: string                      # underwriter | bond_counsel | trustee | feasibility | etc.
      partners_on_same_deal: list[string]       # other firms in the same OS — builds the graph
  market_share_estimate:
    sector: string
    rank: int
    estimated_share_pct: float
  preferred_deal_size_range:
    min: int
    max: int
  preferred_sector_mix: list[string]

# CAPACITY (where applicable)
capacity:                                       # [HARVEST]
  surety_aggregate_capacity_usd: int            # for carriers
  loc_program_capacity_usd: int                 # for LOC banks
  insurance_aggregate_par_capacity_usd: int     # for insurers
  notes: string

# PRICING BENCHMARKS
pricing_benchmarks:                             # [HARVEST + RELATIONSHIP]
  most_recent_quote_date: date
  surety_premium_pct_of_contract: float         # for carriers
  loc_annual_fee_bps: int                       # for LOC banks
  loc_upfront_bps: int
  insurance_upfront_premium_bps: int            # for insurers
  consultant_typical_fee_usd: int               # for consultants
  notes: string

# NEST RELATIONSHIP
nest_relationship:                              # [RELATIONSHIP]
  hawkeye_dossier_id: string                    # foreign key into hawkeye dossier system
  first_meeting_date: date
  primary_relationship_owner: string
  active_deal_count: int
  closed_deal_count: int
  total_par_placed_through_partner_usd: int
  notes_thread_id: string                       # link to notes / CRM thread

# OUTREACH STATE MACHINE
outreach_status:                                # [RELATIONSHIP, but agents update]
  current_stage: enum                           # not_started | prospecting | qualified | first_touch_sent | first_touch_responded | meeting_scheduled | meeting_completed | active_engagement | closed_partner | dormant | declined
  qualification_score: int                      # 0-100, computed (see _outreach_queue_logic.md)
  qualification_reason: string                  # why this score
  next_action: string
  next_action_due: date
  next_action_owner: string                     # sean | josh | aria_agent | sterling_agent | lenderscout_agent
  history:
    - date: date
      action: string
      owner: string
      outcome: string
      next_step: string

# CROSS-REFERENCES
cross_references:                               # [HARVEST]
  related_partner_ids: list[string]             # partners frequently appearing together in EMMA filings
  jacaranda_referenced: bool                    # was this partner involved in Jacaranda Series 2025?
  bible_silo_reference: string                  # which Bible Silo / section
  research_doc_reference: list[string]          # which companion research doc
```

---

## Seed list — 9 categories with rationale and source

For each firm: the field set that can be populated *today* without web access. The full schema above is the target shape; the rows below are what we have anchored to NEST artifacts.

### Category 1 — Surety Brokers

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `hylant` | Hylant Insurance | CLAUDE.md (NEST Insurance Partner) | **PRIMARY relationship.** Strategic partner per CLAUDE.md. Default surety placement broker. |
| `marsh` | Marsh McLennan | Bible §2.17 | Top-tier global specialty broker |
| `aon` | Aon | Bible §2.17 | Top-tier global specialty broker |
| `willis_towers_watson` | Willis Towers Watson | Bible §2.17 | Top-tier global specialty broker |
| `lockton` | Lockton | Bible §2.17 | Largest private US broker, strong specialty practice |
| `usi` | USI Insurance Services | Bible §2.17 | Mid-market US specialty broker |
| `brown_and_brown` | Brown & Brown | Bible §2.17 | US specialty + regional |
| `hub_international` | HUB International | Bible §2.17 | US specialty + regional |

### Category 2 — Surety Carriers (A.M. Best A- or better, Bible §2.18)

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `travelers` | Travelers Bond & Specialty | Bible §2.18 | Dominant US surety market share |
| `liberty_mutual` | Liberty Mutual Surety | Bible §2.18 | Major surety carrier |
| `zurich` | Zurich North America Surety | Bible §2.18 | Major surety carrier |
| `cna` | CNA Surety | Bible §2.18 | Major surety carrier |
| `chubb` | Chubb Surety | Bible §2.18 | Major surety carrier |
| `hartford` | The Hartford Bond | Bible §2.18 | Major surety carrier |
| `arch` | Arch Insurance Surety | Bible §2.18 | Major surety carrier |
| `amtrust` | AmTrust Surety | Bible §2.18 | Specialty markets — at lower edge of acceptability per §2.18 |
| `old_republic` | Old Republic Surety | Bible §2.18 | Major surety carrier |

### Category 3 — LOC Banks (Bible §9.2)

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `jpmorgan_chase` | JPMorgan Chase | Bible §9.2 | Major US LOC bank |
| `bofa` | Bank of America | Bible §9.2 | Major US LOC bank |
| `wells_fargo` | Wells Fargo | Bible §9.2 | Major US LOC bank; **referenced in Jacaranda credit memo** as bank takeout target ("Wells Fargo gets the boring years") |
| `us_bank` | U.S. Bank | Bible §9.2 | Major US LOC bank, large muni trust practice |
| `bny_mellon` | BNY Mellon | Bible §9.2 | Major US LOC bank + dominant trustee |
| `pnc` | PNC | Bible §9.2 | Major US LOC bank |
| `bmo` | BMO | Bible §9.2 | Major US LOC bank |
| `fifth_third` | Fifth Third | Bible §9.2 | Regional bank with active LOC book |
| `regions` | Regions Bank | Bible §9.2 | Regional bank with active LOC book |
| `hsbc` | HSBC USA | Bible §9.2 | International — selective US muni LOC |
| `rbc` | RBC | Bible §9.2 | International — active US muni LOC |
| `barclays` | Barclays | Bible §9.2 | International — selective US muni LOC |

### Category 4 — Bond Insurers (Bible §9.3, post-2008 survivors)

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `assured_guaranty_municipal` | Assured Guaranty Municipal (AGM) | Bible §9.3 | One of two active US muni bond insurers |
| `build_america_mutual` | Build America Mutual (BAM) | Bible §9.3 | One of two active US muni bond insurers |

### Category 5 — Federal Program Desks (Bible §9.7)

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `hud_multifamily_office` | HUD Office of Multifamily Housing | Bible §9.7 | Section 221(d)(4), 223(f) for multifamily affordable |
| `hud_232_lean_office` | HUD Section 232 LEAN Office | Bible §9.7 + companion surety doc | **Highly relevant to NEST CCRC pipeline** — AL/MC/SNF FHA insurance |
| `hud_242_hospitals` | HUD Section 242 Hospital Insurance | Bible §9.7 | Non-profit hospital FHA insurance |
| `usda_rural_development` | USDA Rural Development | Bible §9.7 | Rural multifamily + community facilities |
| `ginnie_mae` | Ginnie Mae | Bible §9.7 | GNMA securitization of HUD-insured loans |
| `fannie_mae_dus` | Fannie Mae DUS | Companion surety doc | Multifamily DUS structures |
| `freddie_mac_optigo` | Freddie Mac Optigo | Companion surety doc | Multifamily Optigo structures |

### Category 6 — State HFAs / Conduits / Intercept Agencies

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `florida_lgfc` | Florida Local Government Finance Commission | Jacaranda teaser line 14 | **Jacaranda's conduit issuer.** Critical relationship for NEST FL pipeline. |
| `new_york_dasny` | Dormitory Authority of the State of New York (DASNY) | Bible §9.4 + companion | Strong moral obligation, dominant NY higher-ed/healthcare conduit |
| `new_york_state_hfa` | NY State Housing Finance Agency | Bible §9.4 | NY multifamily conduit with moral obligation |
| `pennsylvania_phfa` | Pennsylvania Housing Finance Agency | Bible §9.4 | PA affordable multifamily |
| `pennsylvania_act_150` | PA State Public School Building Authority (Act 150) | Companion surety doc §9.5 | PA charter / school intercept — 3-notch uplift |
| `massachusetts_massdevelopment` | MassDevelopment | Bible §9.4 | MA industrial / charter / multifamily conduit |
| `massachusetts_masshousing` | MassHousing | Bible §9.4 | MA multifamily HFA |
| `new_jersey_eda` | New Jersey EDA | Bible §9.4 | NJ industrial + multifamily conduit |
| `new_jersey_hmfa` | New Jersey HMFA | Bible §9.4 | NJ multifamily HFA |
| `illinois_ihda` | Illinois Housing Development Authority | Bible §9.4 | IL multifamily HFA |
| `california_calhfa` | California Housing Finance Agency | Bible §9.4 | CA multifamily HFA (limited moral obligation) |
| `california_cscda` | California Statewide Communities Development Authority | Companion surety doc | National-scope CA conduit, heavy CCRC use |
| `california_cmfa` | California Municipal Finance Authority | Companion surety doc | National-scope CA conduit |
| `texas_psf_guarantee` | Texas Permanent School Fund Guarantee | Companion surety doc §9.5 | AAA-equivalent for qualifying school district bonds |
| `texas_tsahc` | Texas State Affordable Housing Corp | Companion surety doc | TX multifamily affordable |
| `colorado_charter_credit` | Colorado Charter School Credit Enhancement | Companion surety doc §9.5 | CO charter school intercept + reserve |
| `indiana_charter_credit` | Indiana Charter and Innovation Network School Loan | Companion surety doc §9.5 | IN charter intercept |
| `michigan_school_bond_loan_fund` | Michigan School Bond Loan Fund | Companion surety doc §9.5 | MI school district intercept |
| `wisconsin_public_finance_authority` | Public Finance Authority (WI) | Companion surety doc | National-scope WI conduit |

### Category 7 — Feasibility & Market Consultants (companion feasibility-study research doc)

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `forvis_mazars` | Forvis Mazars LLP (Atlanta) | Jacaranda teaser line 14, 182 | **Jacaranda's feasibility examiner.** Big-4 CCRC feasibility leader. |
| `clifton_larson_allen` | CliftonLarsonAllen (CLA) | Bible §2.14 | CCRC, senior living, multifamily |
| `marcum` | Marcum LLP | Companion feasibility doc | CCRC, senior living, healthcare |
| `plante_moran_living_forward` | Plante Moran Living Forward | Companion feasibility doc | CCRC, senior living, master planning |
| `kaufman_hall` | Kaufman Hall & Associates | Bible §2.14 | Healthcare/hospital feasibility |
| `ponder` | Ponder & Co. | Bible §2.14 | Healthcare, senior living |
| `ecg_management_consultants` | ECG Management Consultants | Bible §2.14 | Healthcare/hospital |
| `pmd_advisors` | PMD Advisors | Bible §2.14 | Senior living |
| `aspire_senior_insight` | Aspire Senior Insight | Companion feasibility doc | Senior living market study |
| `kmc_partners` | KMC Partners | Companion feasibility doc | Senior living occupancy/absorption |
| `public_impact` | Public Impact | Bible §2.14 | Charter school demand/enrollment |
| `bellwether_education` | Bellwether Education Partners | Bible §2.14 | Charter academic performance review |
| `novogradac` | Novogradac & Co. | Bible §2.14 | Affordable multifamily market study |
| `rprg` | Real Property Research Group | Companion feasibility doc | Multifamily market study |
| `valbridge` | Valbridge Property Advisors | Companion feasibility doc | Multifamily market study |
| `healthtrust` | HealthTrust LLC | Jacaranda lender memo line 7 | **Jacaranda's appraiser.** Senior living valuation. |
| `continuing_care_actuaries` | Continuing Care Actuaries (CCA) | Companion feasibility doc | Type A CCRC actuarial |
| `av_powell` | A.V. Powell & Associates | Companion feasibility doc | Type A CCRC actuarial |
| `milliman_senior_living` | Milliman Senior Living Practice | Companion feasibility doc | CCRC actuarial |
| `cbre` | CBRE Senior Housing | Bible §2.15 + Jacaranda lender memo (HealthTrust comp) | Senior housing valuation + market |
| `jll` | JLL Senior Housing | Bible §2.15 | Senior housing valuation + market |
| `cushman_wakefield` | Cushman & Wakefield | Bible §2.15 | RE market study |
| `newmark` | Newmark | Bible §2.15 | RE market study |

### Category 8 — Conduit Issuers (subset; cross-references Category 6)

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `florida_lgfc` | Florida LGFC | Jacaranda teaser line 14 | Cross-reference with Cat 6; **Jacaranda's conduit** |
| `california_cscda` | CSCDA | Companion surety doc | National-scope, heavy CCRC use |
| `california_cmfa` | CMFA | Companion surety doc | National-scope |
| `wisconsin_public_finance_authority` | Public Finance Authority (WI) | Companion surety doc | National-scope, heaviest national-scope conduit |
| `colorado_educational_cultural_facilities_authority` | Colorado ECFA | Companion surety doc | National-scope cultural/educational |
| `arizona_industrial_development_authority` | Arizona IDA | Companion surety doc | National-scope industrial |
| `new_jersey_eda` | NJ EDA | Bible §9.4 | NJ conduit |
| `massachusetts_massdevelopment` | MassDevelopment | Bible §9.4 | MA conduit |

### Category 9 — Underwriters / BD Partners (Bible §2.19 BD partner target profile + companion docs)

| partner_id | firm_name | source | rationale |
|---|---|---|---|
| `ziegler` | B.C. Ziegler and Company | Jacaranda teaser line 14, 32 | **Jacaranda's underwriter.** "#1 CCRC bond underwriter, 100+ year history." |
| `hj_sims` | HJ Sims | Companion feasibility doc | Major senior living underwriter |
| `cain_brothers` | Cain Brothers (KeyBanc) | Companion feasibility doc | Senior living + healthcare |
| `truist_capital_markets` | Truist Capital Markets | Bible §2.19 inference | Strong municipal practice |
| `rbc_capital_markets` | RBC Capital Markets | Bible §2.19 inference | Active muni |
| `piper_sandler` | Piper Sandler | Bible §2.19 inference | Active middle-market muni |
| `stifel` | Stifel | Bible §2.19 inference | Active middle-market muni |
| `raymond_james` | Raymond James | Bible §2.19 inference | Active middle-market muni |
| `ramirez` | Ramirez & Co. | Bible §2.19 inference | MWBE-classified muni underwriter |
| `siebert_williams_shank` | Siebert Williams Shank | Bible §2.19 inference | MWBE-classified muni underwriter |
| `academy_securities` | Academy Securities | Bible §2.19 inference | Veteran-owned muni underwriter |

---

## EMMA harvest playbook (`_harvest_playbook.md`)

This is the next-session Path B procedure once WebFetch / WebSearch / LEV MCP are unblocked.

### Phase 1 — EMMA OS harvest

EMMA Advanced Search URL pattern:
```
https://emma.msrb.org/Search/Search.aspx
```

EMMA filing-type endpoints to crawl:
```
https://emma.msrb.org/IssueView/IssueDetails/{cusip}
https://emma.msrb.org/SecurityView/Statements/{cusip}
```

#### Query 1 — Senior Living / CCRC issuances, last 24 months

- Filter: Issue Type = "Health Care/Hospital Bonds" + "Continuing Care Retirement Community" subtype
- Filter: Issuance Date ≥ 2024-05-29
- Sort by par descending; cap at 100 results
- For each: download Official Statement PDF

**Parse targets in each OS:**
1. Cover page — par amount, series, coupon range, dated date, maturity range, ratings, underwriter, conduit issuer, obligor
2. "Counsel and Other Parties" / "Plan of Distribution" / "Underwriting" section — full counterparty list with firm names
3. Appendix list — feasibility study presence/absence, feasibility consultant name
4. Trustee section — trustee firm name + corporate-trust group
5. Conduit issuer detail — issuance fee, board approval mechanics
6. Bond counsel / disclosure counsel — firm name + opinion letter signatories
7. Surety / Bond Insurance — if present, insurer name and policy details
8. LOC — if present, LOC bank name and reimbursement terms

#### Query 2 — Charter School issuances, last 24 months

- Filter: Issue Type = "Educational Facilities/Charter School Bonds"
- For each: extract counterparty list, sector intercept usage (TX PSF, PA Act 150, CO charter credit, IN charter credit, MI school bond loan fund flags)

#### Query 3 — Multifamily PAB §142 issuances, last 24 months

- Filter: Issue Type = "Housing Bonds — Multi-Family"
- For each: extract counterparty list, federal program flags (HUD 221(d)(4), 223(f), risk-share, GNMA, Fannie DUS, Freddie Optigo)

#### Query 4 — Hospital / Healthcare issuances, last 24 months

- Filter: Issue Type = "Hospital/Health Care Facility Bonds"
- For each: extract counterparty list, system-affiliation flags, HUD 242 usage

### Phase 2 — Build the appearance-frequency graph

For each unique firm name extracted:
1. Increment appearance counter in each sector / role
2. Track co-appearance pairs (firm A appears with firm B in same OS — this builds the relationship graph)
3. Rank by recent appearance frequency, sector overlap with NEST pipeline (CCRC priority), and absence from current seed list
4. **Surface new firms not in the seed list** — these are the gaps the seed list missed

### Phase 3 — Contact extraction (manual + LinkedIn cross-reference)

For each seed-list firm + each new firm surfaced in Phase 2:
1. Firm directory page → extract practice area leads
2. LinkedIn public profile pages → extract title, current role, recent activity, contact info where public
3. EMMA OS opinion-letter signatories → extract bond counsel / disclosure counsel partners by name
4. Trade press (Bond Buyer, Senior Housing News, Charter School Capital trade press) → extract recent named deal leads

**Hard rules:**
- No paywalled content scraped
- No private LinkedIn data (only public profile-page data)
- No personal email guessing (`first.last@firm.com` patterns are acceptable, then verified)
- Contact data sources must be cited in the `source` field

### Phase 4 — A.M. Best, S&P, Moody's, Fitch rating refresh

For each carrier (Cat 2) and bank (Cat 3) and insurer (Cat 4):
- Pull current A.M. Best rating from ambest.com (public lookup)
- Pull current S&P / Moody's / Fitch ratings from each agency's public issuer-credit page
- Update the `am_best_rating`, `sp_rating`, `moodys_rating`, `fitch_rating`, `rating_outlook` fields
- Flag any rating ≤ A- for review (per Bible §2.18: A.M. Best A- or better is the indenture floor)

### Phase 5 — State HFA / intercept program detail (Cat 6)

For each state HFA / intercept agency:
- Pull moral obligation language from agency's enabling statute
- Pull current intercept program documentation
- Pull current sector eligibility (some intercepts are charter-only, some school-district-only)
- Verify rating uplift Bible §9.5 cites (TX/PA strong; others moderate)

### Phase 6 — Federal program desk contacts (Cat 5)

For each federal program:
- HUD LEAN office regional contact list
- HUD Multifamily HQ + regional contacts
- USDA RD state office directors
- Ginnie Mae issuer relations
- Fannie DUS / Freddie Optigo approved lender directories

### Phase 7 — Push results into Hawkeye dossier system

Per `project_hawkeye_dossier`: top 20 investors + deal counterparties. The partners surfaced above become Hawkeye dossier seeds. Foreign key `nest_relationship.hawkeye_dossier_id` ties each partner file to its dossier.

### Estimated harvest time

| Phase | Time |
|---|---|
| Phase 1 — EMMA OS harvest (4 sectors × ~50 OS each) | 30 min |
| Phase 2 — Appearance-frequency graph | 10 min |
| Phase 3 — Contact extraction | 30 min |
| Phase 4 — Rating refresh | 10 min |
| Phase 5 — State HFA / intercept detail | 15 min |
| Phase 6 — Federal program desks | 10 min |
| Phase 7 — Hawkeye dossier push | included in pipeline |
| **Total** | **~105 min** |

---

## Outreach queue logic (`_outreach_queue_logic.md`)

How Aria, Sterling, and LenderScout consume the populated repository.

### Qualification score (0–100, computed per partner)

```
score = (
  35 * naics_alignment_with_active_deals          # 0-1 multiplier
  + 25 * recent_emma_appearance_frequency_norm    # 0-1 multiplier, log-scaled
  + 15 * sector_priority_weight                   # CCRC=1.0, Charter=0.7, Multifamily=0.6, Healthcare=0.5
  + 15 * geographic_overlap_with_pipeline         # 0-1 multiplier
  + 10 * relationship_gap_score                   # 1.0 if cold/no relationship, 0.0 if active/strategic
)
```

Higher score = higher priority for first-touch outreach. Already-active relationships score lower on the queue (they're already engaged), but the existing-relationship signal is captured separately for deal-routing.

### Outreach owner routing

```
IF category IN ['01_surety_brokers', '02_surety_carriers']:
  owner = Aria (BD/operations partner outreach)
  cc = Sean (relationship oversight for Hylant specifically)

IF category IN ['03_loc_banks', '04_bond_insurers']:
  owner = LenderScout (direct credit-enhancement provider outreach)
  cc = Josh (credit/structure oversight)

IF category IN ['05_federal_program_desks']:
  owner = LenderScout
  cc = Josh

IF category IN ['06_state_hfas_and_intercept', '08_conduit_issuers']:
  owner = Aria (relationship-driven)
  cc = Sean

IF category IN ['07_feasibility_and_market_consultants']:
  owner = Aria (vendor sourcing)
  cc = sponsor (relationship is sponsor-led, NEST is referrer)

IF category IN ['09_underwriters_bd_partners']:
  owner = Sterling (placement partner)
  cc = Sean (strategic relationship per Bible §2.19)
```

### Triggering deal-routing (not outreach)

When a Deal enters Stage 4 (Structuring Memorandum) or Stage 5 (Engagement & Rating Strategy), the rules engine queries this repository for:
1. The recommended NEST house template per Bible §9 / companion surety doc
2. The shortlist of partners eligible for the deal's NAICS + state
3. The current `relationship_strength` per shortlist partner
4. Routes the engagement letter request to the highest-relationship-strength qualified partner

If no `active` or `strategic` relationship exists in the shortlist, the engine flags to Sean/Josh for cold-outreach decision before the Stage 5 engagement letter is sent.

---

## Cross-references back into platform

| Platform surface | Reads from |
|---|---|
| Bernard Intake Brainstorm | Cat 7 (feasibility consultant short-list), Cat 6 (state HFA / intercept availability for NAICS-state pair) |
| EagleEye signal generation | Cat 9 (underwriter activity), Cat 8 (conduit issuer activity) — high activity = sector heat |
| Hawkeye dossier system | All 9 categories (top 20 dossier seeds drawn from Cat 9 underwriters + Cat 6 state HFAs + Cat 1 Hylant + Cat 7 Forvis Mazars) |
| Bond Desk ALADDIN scenarios | Cat 2/3/4 (enhancement providers), Cat 5 (federal programs), Cat 6 (state intercept) |
| Maxwell credit agent | Cat 2/3/4 (rating substitution per Bible §9.11) |
| Aria agent | Categories 1, 6, 7, 8 — operational partner outreach |
| Sterling agent | Category 9 — underwriter / BD placement |
| LenderScout agent | Categories 3, 4, 5 — direct credit enhancement provider sourcing |

---

## Critical artifact references (Jacaranda Trace Series 2025 grounding)

The Jacaranda artifacts provide an end-to-end real-deal example of how the repository connects to operations. Every named party on Jacaranda has a slot in this repository:

| Jacaranda role | Repository entry | Source |
|---|---|---|
| Conduit issuer | `06_state_hfas_and_intercept/florida_lgfc.yaml` | teaser line 14, 177 |
| Underwriter | `09_underwriters_bd_partners/ziegler.yaml` | teaser line 14, 32, 181 |
| Feasibility examiner | `07_feasibility_and_market_consultants/forvis_mazars.yaml` | teaser line 14, 125, 182 |
| Trustee / compliance monitor | NEW seed needed: `umb_bank.yaml` — UMB Bank, N.A. | teaser line 185 |
| Architect | NEW seed needed: `rlps_architects.yaml` | teaser line 183 |
| Construction manager | NEW seed needed: `stevens_construction.yaml` | teaser line 184; replaced CORE Construction May 2025 |
| Appraiser | `07_feasibility_and_market_consultants/healthtrust.yaml` | Jacaranda lender memo line 7 |

**Gap to flag:** Categories 10–12 not currently in the repository structure, would round out the deal stack:
- Cat 10: Corporate Trustees (UMB Bank, US Bank Corporate Trust, BNY Mellon, Computershare, Wilmington Trust, ZB National)
- Cat 11: Architects (RLPS Architects, Perkins Eastman, HDR, AECOM senior living practice)
- Cat 12: Construction Managers (Stevens Construction, Whiting-Turner, Skanska senior living, Brasfield & Gorrie senior living practice)
- Cat 13: Bond Counsel / Disclosure Counsel (Orrick, Hawkins Delafield, Chapman & Cutler, Greenberg Traurig, Squire Patton Boggs, Norton Rose Fulbright, Hogan Lovells, Kutak Rock)

**Recommendation:** Add Cat 10–13 in the next iteration. The 9 categories in this scaffold cover the *credit-enhancement and feasibility universe* (the focus of the surety + feasibility research docs); 10–13 cover the *full transaction working group*. The schema is identical; the data files just slot in.

---

## Sources

### NEST artifacts cited inline

- `C:\Users\sgill\nest\docs\Bible_Pass1_v2.md` — Silo 2 (§2.14 feasibility consultants, §2.15 market study, §2.17 broker, §2.18 surety carriers, §2.19 BD partners), Silo 9 (§9.1–9.11 credit enhancement, including §9.2 LOC bank universe, §9.3 bond insurers, §9.4 moral obligation, §9.5 intercept, §9.7 federal programs)
- `C:\Users\sgill\nest\CLAUDE.md` — Insurance Partner: Hylant; Capital Structure LC Phase; agent fleet (Aria, Sterling, LenderScout, Hawkeye, Maxwell, Bernard)
- `C:\Users\sgill\nest\docs\adr\0002-deal-lifecycle-entry-points.md` — NAICS deterministic lookup
- `C:\Users\sgill\nest\docs\research\2026-05-28-feasibility-study-requirements.md` — feasibility consultant universe (Cat 7 seed)
- `C:\Users\sgill\nest\docs\research\2026-05-28-surety-and-credit-enhancement-requirements.md` — enhancement universe (Cat 1–6 seed); state-specific programs; AUM-phased progression
- `C:\Users\sgill\Downloads\sellside_unzip\jacaranda-institutional-teaser.md` — real-deal grounding; named conduit, underwriter, feasibility firm, trustee, architect, construction manager
- `C:\Users\sgill\Downloads\Jacaranda_Trace_Credit_Memorandum.pdf` — Wells Fargo bank takeout reference
- `C:\Users\sgill\Downloads\jacaranda_lender_memo.pdf` — HealthTrust appraiser reference

### URLs to crawl in Path B (next session with WebFetch enabled)

#### EMMA crawl roots
- `https://emma.msrb.org/Search/Search.aspx` (advanced search)
- `https://emma.msrb.org/IssueView/IssueDetails/{cusip}` (per-deal detail)
- `https://emma.msrb.org/SecurityView/Statements/{cusip}` (per-deal disclosures)

#### Firm sites for contact extraction
- Cat 1: hylant.com, marsh.com, aon.com, wtwco.com, lockton.com, usi.com, bbinsurance.com, hubinternational.com
- Cat 2: travelers.com/bond-specialty, libertymutualsurety.com, zurichna.com/surety, cnasurety.com, chubb.com/us-en/business/surety, thehartford.com/bond, archinsurance.com/surety, amtrustsurety.com, orsurety.com
- Cat 3: jpmorgan.com (Public Sector), bankofamerica.com (Public Sector), wellsfargo.com (Government & Institutional Banking), usbank.com (Corporate Trust), bnymellon.com (Corporate Trust), pnc.com (Public Finance), bmo.com (US Public Finance), 53.com (Public Finance), regions.com (Public Finance), us.hsbc.com, rbccm.com, barclays.com
- Cat 4: assuredguaranty.com, buildamerica.com
- Cat 5: hud.gov/program_offices/housing/mfh, hud.gov/section232, hud.gov/section242, rd.usda.gov, ginniemae.gov, fanniemae.com/multifamily, mf.freddiemac.com
- Cat 6: floridalgfc.com, dasny.org, nyshfa.org, phfa.org, papsbpa.org (Act 150), massdevelopment.com, masshousing.com, njeda.gov, njhmfa.gov, ihda.org, calhfa.ca.gov, cscda.org, cmfa-ca.com, tea.texas.gov/finance-and-grants/bond-finance, tsahc.org, cocharter.org, in.gov, michigan.gov/treasury, pfauthority.org
- Cat 7: forvismazars.us, claconnect.com, marcumllp.com, plantemoran.com, kaufmanhall.com, ponderco.com, ecgmc.com, pmdadvisors.com, aspireseniorinsight.com, kmcpartners.com, publicimpact.com, bellwether.org, novoco.com, rprg.net, valbridge.com, healthtrustllc.com, ccactuaries.org, avpowell.com, milliman.com, cbre.com, jll.com, cushmanwakefield.com, nmrk.com
- Cat 9: ziegler.com, hjsims.com, cainbrothers.com, truist.com (Capital Markets), rbccm.com, pipersandler.com, stifel.com, raymondjames.com, ramirezco.com, sws.com, academysecurities.com

#### Rating agency lookup
- ambest.com (A.M. Best Company)
- spglobal.com/ratings
- moodys.com
- fitchratings.com

---

## Recommended Bible patches (companion to feasibility + surety docs)

- **§2.17** — add Hylant by name as NEST's primary surety + specialty broker
- **§2.19** — formalize the "BD Partner Target Profile" against named candidates (Ziegler is dominant in CCRC; Truist/RBC/Piper Sandler/Stifel/Raymond James fit the mid-tier criteria)
- **New §2.23** — Partner Outreach Repository as a data layer fed by EMMA harvest; references this document

---

## What's deliberately NOT in this document

Per the locked frontend + backend posture (2026-05-29):

- **No new module proposals.** All consumption happens through existing agents (Aria, Sterling, LenderScout, Hawkeye, Bernard, Maxwell).
- **No new database tables.** The YAML files are flat-file data the agents read; the existing Hawkeye dossier table is the relational store via the `hawkeye_dossier_id` foreign key.
- **No new UI surfaces.** Hawkeye dossier surface already exists and consumes this data; no other UI changes proposed.
- **No new routes.** Existing agent endpoints serve the data.

This is pure data scaffold + harvest playbook. The next session's Path B work — populating actual contact rows — is also pure data, not code.
