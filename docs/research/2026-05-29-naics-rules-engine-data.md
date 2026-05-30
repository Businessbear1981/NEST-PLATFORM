# NAICS Rules Engine — Data Payload Specification

**Status:** Draft data spec · 2026-05-29
**Owner:** Sean Gilmore
**Audience:** `services/naics_rules_engine.py` (ADR-0002 named); Bernard Intake Brainstorm; Roots Stage 1; Bond Desk ALADDIN; Atlas/Prometheus modeling agents; Maxwell credit agent
**Type:** Data spec — the lookup table mapping NAICS → bond type → required documents → feasibility variant → eligible enhancements → consultant short-list → structural template → COI line items
**Companion to:**
- `2026-05-28-feasibility-study-requirements.md`
- `2026-05-28-surety-and-credit-enhancement-requirements.md`
- `2026-05-29-partner-outreach-repository.md`

---

## Why this exists

ADR-0002 declared:

> "NAICS → bond type → required documents is a deterministic rules engine, not AI inference. The NAICS code entered at Deal Input drives a structured backend lookup that returns the eligible bond type(s) (from Bible Appendix A — Bond Type Decision Table), the document checklist (from Bible Silo 4 — Documents), and the feasibility study requirements (whether one is needed, what kind — healthcare feasibility vs housing market study vs charter school enrollment study). The mapping lives as data, not inference."

The three prior research docs gathered the inputs. This document is the **lookup table itself** — the deterministic data payload `services/naics_rules_engine.py` consumes to drive Bernard's first-look memo, Roots Stage 1 document demands, and Bond Desk ALADDIN structural scenarios.

Per the locked posture (2026-05-29): no new modules, no new tables, no new routes, no UI changes. This is pure data — the rules-engine endpoint already exists per ADR-0002; this is the payload it loads.

---

## Anchor — Jacaranda Trace PLOM as structural template

`CLAUDE.md` Project Identity: **"Bond Blueprint: Jacaranda Trace PLOM (Series 2025, $231M, Florida LGFC)."**

Every NAICS row that lands in the senior-living bucket inherits Jacaranda's structural template as default. The blueprint specifically:

- **Conduit:** Florida LGFC (state-level conduit; replaced by equivalent state HFA / conduit in other states)
- **Senior tranche:** Tax-exempt, fixed rate, 6.25–7.125% coupon — matches `CLAUDE.md` Capital Structure Series A "6.5-7.5% coupon"
- **Subordinate tranche:** Tax-exempt, 5.75% coupon (Series 2025B — LURA-bearing) — note this is *lower* coupon than Series 2025A because of the LURA set-aside; the standard NEST Series B (per CLAUDE.md) is "+7% (82% CLTV) · B/BBB · Bank managed · 10-14% coupon," which differs from the Jacaranda Series 2025B specifics
- **Taxable tranche:** Series 2025C, 7.0% coupon, $4.73M — used for non-PAB-eligible uses
- **Reserves:** DSRF $15.3M cash-funded, capitalized interest $11.5M for 26 months, marketing reserve, operating reserve
- **Feasibility:** Forvis Mazars examined forecast
- **Underwriter:** B.C. Ziegler & Co
- **Trustee:** UMB Bank, N.A.
- **Construction surety:** Stevens Construction (post-CORE-exit May 2025) — Hylant placement default
- **Florida Chapter 651** statutory reserves maintained

This template populates the senior-living NAICS rows below as the recommended NEST house structure.

---

## Schema — single NAICS row

```yaml
naics_code: string                              # 6-digit NAICS
naics_title: string
sector_bucket: enum                             # senior_living | charter_school | multifamily_housing | healthcare | corporate | infrastructure | other

# BOND TYPE ELIGIBILITY (Bible Appendix A reference)
eligible_bond_types:
  - bond_type: enum                             # tax_exempt_pab_142 | tax_exempt_501c3 | tax_exempt_governmental | taxable_corporate | taxable_144a | revenue_bond | ga_bond | vrdb
    use_case: string
    typical_tenor_years: int
    typical_amortization: enum                  # level_debt_service | level_principal | bullet | sinking_fund
    rationale: string

# DEFAULT BOND TYPE (rule-engine pick)
default_bond_type: enum
default_rationale: string

# FEASIBILITY / MARKET STUDY REQUIREMENT
feasibility_requirement:
  required: bool
  recommended: bool
  variant: enum                                 # full_feasibility | market_study | velocity_only | actuarial | enrollment | hospital_feasibility | none
  variant_2: enum                               # secondary variant if both apply
  consultant_shortlist:                         # FK to partner repository Cat 7
    - partner_id: string
      tier: enum                                # tier_1_default | tier_2_alternative | tier_3_sector_specialist
  typical_fee_usd:
    low: int
    high: int
  typical_timeline_weeks:
    low: int
    high: int

# CREDIT ENHANCEMENT — ELIGIBILITY MATRIX
credit_enhancement:
  performance_payment_surety:
    required_if_construction: bool
    placement_broker_default: string            # 'hylant' (Cat 1 FK)
    carrier_universe: list[string]              # FKs into Cat 2
  dsrf_surety_substitution:
    eligible: bool
    notes: string
  letter_of_credit:
    eligible: bool
    recommended_for_vrdo: bool
    nest_aum_phase_3_4_internal: bool           # if NEST self-LCs at Phase 3-4
    bank_universe: list[string]                 # FKs into Cat 3
  bond_insurance:
    eligible: bool
    recommended: bool
    insurer_universe: list[string]              # FKs into Cat 4 (AGM, BAM)
  moral_obligation:
    eligible_by_state: list[string]
    state_hfa_required: bool
  state_intercept:
    eligible_by_state: list[string]
    typical_uplift_notches: int
  parent_corporate_guarantee:
    eligible: bool
    typical_scenarios: list[string]
  federal_guarantee:
    eligible_programs:
      - program: string                         # 'hud_232' | 'hud_242' | 'hud_221d4' | 'hud_223f' | 'usda_rd' | 'fannie_dus' | 'freddie_optigo' | 'ginnie_mae'
        scope: string
  self_collateralization:
    eligible: bool
    nest_aum_phase_4_only: bool

# DEFAULT STRUCTURAL TEMPLATE (NEST house template)
nest_structural_template:
  series_a:
    par_pct: float                              # of total
    coupon_range_bps: [int, int]
    tenor_years: int
    rating_target: string                       # 'investment_grade', 'A', 'BBB+', etc.
    enhancement_default: string                 # 'hylant_surety' | 'nest_lc' | 'self_collateral'
  series_b:
    par_pct: float
    coupon_range_bps: [int, int]
    tenor_years: int
    rating_target: string
    enhancement_default: string
    bank_managed: bool                          # CLAUDE.md "Bank managed"
  capitalized_interest:
    required_if_construction: bool
    months_funded: int
  reserves:
    dsrf_required: bool
    dsrf_sizing_rule: string                    # 'mads' | '10pct_par' | 'lesser_of_mads_10pct_125pct_aads'
    marketing_reserve_required: bool
    operating_reserve_pct: float
    maturity_reserve_pct: float                 # CLAUDE.md "2.5% maturity reserve escrowed"

# REQUIRED DOCUMENTS (Bible Silo 4 + feasibility schema)
required_documents:
  master_transaction_docs: list[string]
  security_docs: list[string]
  marketing_docs: list[string]
  opinion_docs: list[string]
  operational_docs: list[string]
  sector_specific_docs:                         # CCRC: feasibility + actuarial + Chapter 651 etc.
    - doc_id: string
      doc_class: string
      schema_reference: string                  # path to schema doc (e.g., feasibility 14-section schema)
      required: bool
      freshness_days: int                       # staleness threshold

# ROOTS STAGE 1 DEMAND LIST (sponsor-side)
roots_stage_1_demands:
  - demand_id: string
    description: string
    document_class: string
    required: bool
    freshness_days: int
    bernard_intake_question_id: string          # which Intake Brainstorm question this validates

# RATING-AGENCY METHODOLOGY POINTERS (companion feasibility-doc references)
rating_agency_methodologies:
  fitch: list[string]                           # methodology titles
  moodys: list[string]
  sp: list[string]
  kbra: list[string]

# COI ESTIMATE (Bible §5 / Silo 5)
coi_estimate:
  bond_counsel_usd: [int, int]
  disclosure_counsel_usd: [int, int]
  sponsor_counsel_usd: [int, int]
  trustee_acceptance_usd: [int, int]
  conduit_issuance_bps: [int, int]
  rating_agency_per_agency_usd: [int, int]
  underwriter_discount_bps: [int, int]
  feasibility_consultant_usd: [int, int]
  market_study_usd: [int, int]
  surety_placement_usd: [int, int]              # Hylant broker fee
  surety_premium_pct_of_contract: [float, float]
  loc_annual_fee_bps: [int, int]
  bond_insurance_upfront_bps: [int, int]
  nest_structuring_fee_usd: [int, int]

# AGENT ROUTING (CLAUDE.md 15-agent fleet)
agent_routing:
  intake_first_look_memo: 'morgan'              # Jimmy Lee tone memo
  re_underwriting: ['atlas', 'prometheus']      # modeling
  credit_grading: 'maxwell'                     # DSCR/LTV/LGD/obligor grade
  feasibility_audit_sim: 'prometheus'
  sponsor_outreach: 'aria'
  investor_placement: 'sterling'                # book building
  direct_lender_match: 'lenderscout'            # 800+ lender match engine
  ma_intelligence: 'merlin'                     # NAICS scan
  risk_assessment: 'sentinel'                   # 7 dimensions
  marketing_collateral: 'blaze'
  market_signals_call_put: 'vector'             # 14 signals, 15-min intervals
  hedging: 'apex'
  blockchain_execution: 'chain'                 # ERC-1400 tokenization layer
  hft_b_tranche: 'quantum'
  perm_debt_monitor_post_stabilization: 'bridge'

# BERNARD INTAKE BRAINSTORM PROMPTS
bernard_intake_questions:
  - id: string
    question: string
    answer_type: enum                           # text | number | boolean | enum | date | upload
    drives: list[string]                        # which downstream field this answer drives
    rule_engine_dependency: string

# CROSS-REFERENCES
cross_references:
  bible_silos: list[string]                     # e.g., ['§2.14', '§9.1-9.11', '§17.5']
  research_docs: list[string]
  companion_naics_codes: list[string]           # related NAICS in same sector_bucket
  jacaranda_blueprint_anchor: bool
```

---

## Sector 1 — Senior Living / CCRC (Jacaranda blueprint sector)

### NAICS 623110 — Nursing Care Facilities (Skilled Nursing)

```yaml
naics_code: '623110'
naics_title: 'Nursing Care Facilities (Skilled Nursing Facilities)'
sector_bucket: senior_living

eligible_bond_types:
  - bond_type: tax_exempt_501c3
    use_case: Non-profit SNF (Section 145 qualified)
    typical_tenor_years: 30
    typical_amortization: level_debt_service
    rationale: Tax-exempt revenue bond, conduit issued
  - bond_type: tax_exempt_pab_142
    use_case: For-profit SNF with affordable housing component
    typical_tenor_years: 30
    typical_amortization: level_debt_service
    rationale: Rare; PAB §142(d) qualified housing component
  - bond_type: taxable_corporate
    use_case: For-profit SNF without affordable component
    typical_tenor_years: 30
    typical_amortization: level_debt_service
    rationale: Default for for-profit SNF

default_bond_type: tax_exempt_501c3
default_rationale: NEST visible pipeline trends non-profit; tax-exempt is dominant SNF bond structure

feasibility_requirement:
  required: true
  recommended: true
  variant: full_feasibility
  variant_2: actuarial
  consultant_shortlist:
    - partner_id: forvis_mazars
      tier: tier_1_default
    - partner_id: clifton_larson_allen
      tier: tier_1_default
    - partner_id: marcum
      tier: tier_2_alternative
    - partner_id: plante_moran_living_forward
      tier: tier_2_alternative
    - partner_id: kaufman_hall
      tier: tier_3_sector_specialist
  typical_fee_usd:
    low: 100000
    high: 250000
  typical_timeline_weeks:
    low: 10
    high: 14

credit_enhancement:
  performance_payment_surety:
    required_if_construction: true
    placement_broker_default: hylant
    carrier_universe: [travelers, liberty_mutual, zurich, cna, chubb, hartford, arch, old_republic]
  dsrf_surety_substitution:
    eligible: true
    notes: Common where DSRF cash-funding impairs forecast ratios; carrier must be A-rated or better per Bible §3277
  letter_of_credit:
    eligible: true
    recommended_for_vrdo: true
    nest_aum_phase_3_4_internal: true
    bank_universe: [jpmorgan_chase, bofa, wells_fargo, us_bank, bny_mellon, pnc]
  bond_insurance:
    eligible: false
    recommended: false
    insurer_universe: []
  moral_obligation:
    eligible_by_state: []
    state_hfa_required: false
  state_intercept:
    eligible_by_state: []
    typical_uplift_notches: 0
  parent_corporate_guarantee:
    eligible: true
    typical_scenarios: [multi_campus_operator_guarantees_individual_campus]
  federal_guarantee:
    eligible_programs:
      - program: hud_232
        scope: New construction, substantial rehab, or refinance of SNF (35-40 yr term, FHA-insured); standalone SNF or SNF component of CCRC
  self_collateralization:
    eligible: true
    nest_aum_phase_4_only: true

nest_structural_template:
  series_a:
    par_pct: 0.86
    coupon_range_bps: [625, 712]
    tenor_years: 30
    rating_target: investment_grade
    enhancement_default: hylant_surety
  series_b:
    par_pct: 0.10
    coupon_range_bps: [1000, 1400]
    tenor_years: 15
    rating_target: BBB-
    enhancement_default: none
    bank_managed: true
  capitalized_interest:
    required_if_construction: true
    months_funded: 26
  reserves:
    dsrf_required: true
    dsrf_sizing_rule: lesser_of_mads_10pct_125pct_aads
    marketing_reserve_required: true
    operating_reserve_pct: 0.05
    maturity_reserve_pct: 0.025

required_documents:
  sector_specific_docs:
    - doc_id: feasibility_study
      doc_class: examined_financial_forecast
      schema_reference: docs/research/2026-05-28-feasibility-study-requirements.md#ccrc-feasibility-study-section-by-section
      required: true
      freshness_days: 540
    - doc_id: actuarial_study
      doc_class: actuarial
      schema_reference: docs/research/2026-05-28-feasibility-study-requirements.md#variant-4-actuarial-study
      required: false
      freshness_days: 1095
    - doc_id: state_regulatory_filings
      doc_class: regulatory
      schema_reference: docs/research/2026-05-28-surety-and-credit-enhancement-requirements.md#state-specific-enhancement-programs
      required: true
      freshness_days: 365

roots_stage_1_demands:
  - demand_id: audited_financials_5yr
    description: Audited financials, prior 5 years
    document_class: audited_financial
    required: true
    freshness_days: 180
    bernard_intake_question_id: cash_flow_history
  - demand_id: monthly_operating_2yr
    description: Monthly operating statements, prior 24 months
    document_class: operating_data
    required: true
    freshness_days: 60
    bernard_intake_question_id: occupancy_history
  - demand_id: rate_schedule_5yr
    description: Entrance fee + monthly service fee schedule, 5-year history + planned
    document_class: pricing
    required: true
    freshness_days: 90
    bernard_intake_question_id: pricing_history
  - demand_id: resident_demographic_profile
    description: Current resident roster — age at entry, source of funds, length of stay, internal transfers
    document_class: demographic
    required: true
    freshness_days: 90
    bernard_intake_question_id: resident_profile
  - demand_id: waitlist_depositor_data
    description: Current depositor count, demographics, conversion rate
    document_class: marketing_data
    required: true
    freshness_days: 30
    bernard_intake_question_id: marketing_pipeline
  - demand_id: gmp_contract
    description: GMP contract + draw schedule + contractor surety evidence
    document_class: construction
    required: true
    freshness_days: 90
    bernard_intake_question_id: construction_status
  - demand_id: appraisal
    description: Independent appraisal of community
    document_class: appraisal
    required: true
    freshness_days: 365
    bernard_intake_question_id: appraisal_status
  - demand_id: existing_debt_documents
    description: All existing bond, bank, lease, swap documents
    document_class: debt_stack
    required: true
    freshness_days: 365
    bernard_intake_question_id: existing_debt
  - demand_id: residency_agreement_template
    description: Current and historical residency agreement templates
    document_class: contracts
    required: true
    freshness_days: 365
    bernard_intake_question_id: contract_type

rating_agency_methodologies:
  fitch: ['U.S. Not-for-Profit Life Plan Community Rating Criteria']
  moodys: ['U.S. Not-for-Profit Senior Living Methodology']
  sp: ['U.S. Not-for-Profit Senior Living Methodology']
  kbra: ['U.S. Senior Living Rating Methodology']

coi_estimate:
  bond_counsel_usd: [125000, 250000]
  disclosure_counsel_usd: [50000, 125000]
  sponsor_counsel_usd: [75000, 150000]
  trustee_acceptance_usd: [5000, 15000]
  conduit_issuance_bps: [25, 100]
  rating_agency_per_agency_usd: [100000, 200000]
  underwriter_discount_bps: [150, 250]
  feasibility_consultant_usd: [100000, 250000]
  market_study_usd: [0, 0]
  surety_placement_usd: [10000, 30000]
  surety_premium_pct_of_contract: [0.005, 0.030]
  loc_annual_fee_bps: [50, 250]
  bond_insurance_upfront_bps: [0, 0]
  nest_structuring_fee_usd: [200000, 500000]

agent_routing:
  intake_first_look_memo: morgan
  re_underwriting: [atlas, prometheus]
  credit_grading: maxwell
  feasibility_audit_sim: prometheus
  sponsor_outreach: aria
  investor_placement: sterling
  direct_lender_match: lenderscout
  ma_intelligence: merlin
  risk_assessment: sentinel
  marketing_collateral: blaze
  market_signals_call_put: vector
  hedging: apex
  blockchain_execution: chain
  hft_b_tranche: quantum
  perm_debt_monitor_post_stabilization: bridge

bernard_intake_questions:
  - id: project_type
    question: Is this a new-construction project, a refinancing of a stabilized community, or a major expansion / repositioning?
    answer_type: enum
    drives: [feasibility_requirement.variant, credit_enhancement.performance_payment_surety.required_if_construction, nest_structural_template.capitalized_interest.required_if_construction]
    rule_engine_dependency: drives feasibility variant + surety requirement + cap-i sizing
  - id: contract_type
    question: What contract type does the community offer — Type A life-care, Type B modified, Type C fee-for-service, or rental?
    answer_type: enum
    drives: [feasibility_requirement.variant_2, required_documents.sector_specific_docs.actuarial_study.required]
    rule_engine_dependency: drives actuarial study requirement
  - id: existing_feasibility
    question: Do you have a feasibility study commissioned in the last 18 months?
    answer_type: boolean
    drives: [feasibility_requirement.required]
    rule_engine_dependency: drives refresh-vs-new-commission decision
  - id: feasibility_consultant
    question: Who is the feasibility consultant?
    answer_type: text
    drives: [feasibility_requirement.consultant_shortlist]
    rule_engine_dependency: validates consultant against rating-agency-accepted list
  - id: entrance_fee_turnover_3yr
    question: What is your historical entrance-fee turnover rate (last 3 years)?
    answer_type: number
    drives: [feasibility_requirement.variant_2]
    rule_engine_dependency: drives §11 Entrance-Fee Velocity emphasis in feasibility schema
  - id: waitlist_count
    question: Current waitlist depositor count?
    answer_type: number
    drives: [feasibility_requirement.variant_2]
    rule_engine_dependency: drives §9 Marketing emphasis
  - id: project_capture_rate_prior_study
    question: Project capture rate from the most recent feasibility study (%)?
    answer_type: number
    drives: [credit_grading]
    rule_engine_dependency: drives target-rating realism check
  - id: state
    question: What state is the community located in?
    answer_type: text
    drives: [required_documents.sector_specific_docs.state_regulatory_filings, credit_enhancement.moral_obligation.eligible_by_state]
    rule_engine_dependency: drives state regulatory requirement (FL Ch 651, CA 1792, etc.)
  - id: aum_phase_at_deal
    question: NEST AUM at deal initiation?
    answer_type: number
    drives: [credit_enhancement.letter_of_credit.nest_aum_phase_3_4_internal, credit_enhancement.self_collateralization.nest_aum_phase_4_only]
    rule_engine_dependency: drives NEST house enhancement template per CLAUDE.md LC Phase

cross_references:
  bible_silos: ['§2.7', '§2.14', '§2.17', '§2.18', '§3.5', '§4.x', '§9.1-9.11', '§17.3-17.7']
  research_docs:
    - docs/research/2026-05-28-feasibility-study-requirements.md
    - docs/research/2026-05-28-surety-and-credit-enhancement-requirements.md
    - docs/research/2026-05-29-partner-outreach-repository.md
  companion_naics_codes: ['623210', '623311', '623312']
  jacaranda_blueprint_anchor: true
```

### NAICS 623210 — Residential Intellectual and Developmental Disability Facilities

Inherits 623110 row except:
- `default_bond_type: tax_exempt_501c3` (almost always non-profit)
- `feasibility_requirement.variant: full_feasibility` (no actuarial unless contract Type A)
- `nest_structural_template.series_a.coupon_range_bps: [600, 700]` (smaller sector, modestly tighter pricing)
- `consultant_shortlist` reweights to `clifton_larson_allen` and `marcum` (specialty in this sub-sector); Forvis Mazars second-tier

### NAICS 623311 — Continuing Care Retirement Communities

**Primary CCRC code — Jacaranda anchor.** Identical to 623110 except:
- `feasibility_requirement.variant: full_feasibility`
- `feasibility_requirement.variant_2: actuarial` (likely Type A or B contract)
- `nest_structural_template`: full Jacaranda template per blueprint
  - Series A coupon 6.25-7.125% (matches Jacaranda 2025A directly)
  - Cap-I 26 months funded (matches Jacaranda)
  - Marketing reserve required (CCRC-specific)
- `roots_stage_1_demands` adds: `entrance_fee_velocity_history_5yr` as required document
- `bernard_intake_questions` adds: `florida_chapter_651_status` if state=FL

### NAICS 623312 — Assisted Living Facilities for the Elderly

Inherits 623311 except:
- `feasibility_requirement.variant_2: none` (rare to have Type A actuarial contracts)
- `credit_enhancement.federal_guarantee.eligible_programs`: HUD 232 is **highly relevant** (workhorse for AL)
- `nest_structural_template.series_a.coupon_range_bps: [600, 700]`
- `default_bond_type: tax_exempt_501c3` OR `tax_exempt_pab_142` if affordable component

---

## Sector 2 — Charter Schools / Education

### NAICS 611110 — Elementary and Secondary Schools

```yaml
naics_code: '611110'
naics_title: 'Elementary and Secondary Schools'
sector_bucket: charter_school

eligible_bond_types:
  - bond_type: tax_exempt_governmental
    use_case: Public school district GO or revenue bond
    typical_tenor_years: 25
    typical_amortization: level_debt_service
    rationale: Public school district direct issuance
  - bond_type: tax_exempt_501c3
    use_case: Charter school (501(c)(3))
    typical_tenor_years: 30
    typical_amortization: level_debt_service
    rationale: Charter holder is 501(c)(3); conduit-issued

default_bond_type: tax_exempt_501c3
default_rationale: NEST visible pipeline emphasizes charter; default to 501(c)(3) conduit issuance

feasibility_requirement:
  required: true
  recommended: true
  variant: enrollment
  consultant_shortlist:
    - partner_id: public_impact
      tier: tier_1_default
    - partner_id: bellwether_education
      tier: tier_1_default
  typical_fee_usd:
    low: 50000
    high: 125000
  typical_timeline_weeks:
    low: 8
    high: 12

credit_enhancement:
  performance_payment_surety:
    required_if_construction: true
    placement_broker_default: hylant
    carrier_universe: [travelers, liberty_mutual, zurich, cna, chubb, hartford, arch, old_republic]
  dsrf_surety_substitution:
    eligible: false
    notes: Charter authorizers typically require cash DSRF
  letter_of_credit:
    eligible: true
    recommended_for_vrdo: false
    nest_aum_phase_3_4_internal: true
    bank_universe: [jpmorgan_chase, bofa, wells_fargo, us_bank, pnc]
  bond_insurance:
    eligible: false
    recommended: false
    insurer_universe: []
  moral_obligation:
    eligible_by_state: []
    state_hfa_required: false
  state_intercept:
    eligible_by_state: [TX, PA, CO, IN, MI]
    typical_uplift_notches: 3
  parent_corporate_guarantee:
    eligible: true
    typical_scenarios: [cmo_guarantees_individual_school]
  federal_guarantee:
    eligible_programs: []
  self_collateralization:
    eligible: true
    nest_aum_phase_4_only: true

nest_structural_template:
  series_a:
    par_pct: 0.90
    coupon_range_bps: [475, 600]
    tenor_years: 30
    rating_target: A
    enhancement_default: state_intercept_if_available
  series_b:
    par_pct: 0.10
    coupon_range_bps: [800, 1200]
    tenor_years: 15
    rating_target: BBB
    enhancement_default: none
    bank_managed: true
  capitalized_interest:
    required_if_construction: true
    months_funded: 18
  reserves:
    dsrf_required: true
    dsrf_sizing_rule: mads
    marketing_reserve_required: false
    operating_reserve_pct: 0.03
    maturity_reserve_pct: 0.025

required_documents:
  sector_specific_docs:
    - doc_id: charter_contract
      doc_class: regulatory
      required: true
      freshness_days: 365
    - doc_id: enrollment_study
      doc_class: demand_study
      schema_reference: docs/research/2026-05-28-feasibility-study-requirements.md#variant-6-charter-school-demand-enrollment-study
      required: true
      freshness_days: 540
    - doc_id: academic_performance_review
      doc_class: performance_review
      required: false
      freshness_days: 540
    - doc_id: authorizer_accountability_reports
      doc_class: regulatory
      required: true
      freshness_days: 365

bernard_intake_questions:
  - id: state
    question: What state is the school located in?
    answer_type: text
    drives: [credit_enhancement.state_intercept.eligible_by_state]
    rule_engine_dependency: critical — state intercept availability is the single largest rating uplift lever
  - id: state_intercept_program
    question: Does the state offer a charter school credit enhancement / intercept program?
    answer_type: enum
    drives: [credit_enhancement.state_intercept]
    rule_engine_dependency: confirms 2-3 notch uplift availability
  - id: charter_authorizer
    question: Who is the charter authorizer and what is the renewal track record?
    answer_type: text
    drives: [credit_grading]
    rule_engine_dependency: rating-agency factor for charter contract security
  - id: enrollment_history_5yr
    question: 5-year enrollment history with waitlist counts?
    answer_type: upload
    drives: [feasibility_requirement.variant]
    rule_engine_dependency: drives demand study scope
  - id: cmo_affiliation
    question: Is the school managed by a CMO (Charter Management Organization)?
    answer_type: enum
    drives: [credit_enhancement.parent_corporate_guarantee]
    rule_engine_dependency: drives parent guarantee availability

cross_references:
  bible_silos: ['§2.14', '§9.5', '§17.3-17.7']
  research_docs:
    - docs/research/2026-05-28-feasibility-study-requirements.md
    - docs/research/2026-05-28-surety-and-credit-enhancement-requirements.md
    - docs/research/2026-05-29-partner-outreach-repository.md
  companion_naics_codes: ['611310']
  jacaranda_blueprint_anchor: false
```

### NAICS 611310 — Colleges, Universities, and Professional Schools

Inherits 611110 structure except:
- `feasibility_requirement.variant: market_study` (higher ed less enrollment-driven, more market-position-driven)
- `consultant_shortlist`: opens to higher-ed specialists
- `nest_structural_template.series_a.tenor_years: 30`
- `credit_enhancement.moral_obligation.eligible_by_state: [NY]` (DASNY route)
- `default_bond_type` may shift to `tax_exempt_governmental` for public university issuance

---

## Sector 3 — Multifamily Housing (PAB §142 / LIHTC)

### NAICS 531110 — Lessors of Residential Buildings and Dwellings

```yaml
naics_code: '531110'
naics_title: 'Lessors of Residential Buildings and Dwellings'
sector_bucket: multifamily_housing

eligible_bond_types:
  - bond_type: tax_exempt_pab_142
    use_case: Affordable multifamily under §142(d) (20-50 or 40-60 rule)
    typical_tenor_years: 35
    typical_amortization: level_debt_service
    rationale: PAB volume-cap; default for affordable
  - bond_type: taxable_corporate
    use_case: Market-rate multifamily
    typical_tenor_years: 30
    typical_amortization: level_debt_service
    rationale: Non-LIHTC market-rate

default_bond_type: tax_exempt_pab_142
default_rationale: NEST visible pipeline emphasizes affordable; PAB §142 is the workhorse

feasibility_requirement:
  required: false
  recommended: true
  variant: market_study
  consultant_shortlist:
    - partner_id: novogradac
      tier: tier_1_default
    - partner_id: rprg
      tier: tier_1_default
    - partner_id: valbridge
      tier: tier_2_alternative
    - partner_id: cbre
      tier: tier_2_alternative
  typical_fee_usd:
    low: 25000
    high: 75000
  typical_timeline_weeks:
    low: 6
    high: 10

credit_enhancement:
  performance_payment_surety:
    required_if_construction: true
    placement_broker_default: hylant
    carrier_universe: [travelers, liberty_mutual, zurich, cna, chubb, hartford, arch]
  dsrf_surety_substitution:
    eligible: true
    notes: Common; preserves par for project use
  letter_of_credit:
    eligible: true
    recommended_for_vrdo: true
    nest_aum_phase_3_4_internal: true
    bank_universe: [jpmorgan_chase, bofa, wells_fargo, us_bank, pnc, bmo]
  bond_insurance:
    eligible: true
    recommended: false
    insurer_universe: [assured_guaranty_municipal, build_america_mutual]
  moral_obligation:
    eligible_by_state: [NY, PA, MA, NJ, IL, CA, TX]
    state_hfa_required: true
  state_intercept:
    eligible_by_state: []
    typical_uplift_notches: 0
  parent_corporate_guarantee:
    eligible: true
    typical_scenarios: [sponsor_guarantees_project]
  federal_guarantee:
    eligible_programs:
      - program: hud_221d4
        scope: New construction or substantial rehab; 40-year term FHA-insured
      - program: hud_223f
        scope: Refinance or acquisition of existing; 35-year term FHA-insured
      - program: fannie_dus
        scope: Multifamily DUS structure
      - program: freddie_optigo
        scope: Multifamily Optigo structure
      - program: ginnie_mae
        scope: Securitization of HUD-insured loans for AAA effective rating
  self_collateralization:
    eligible: true
    nest_aum_phase_4_only: true

nest_structural_template:
  series_a:
    par_pct: 0.75
    coupon_range_bps: [475, 575]
    tenor_years: 35
    rating_target: A
    enhancement_default: hud_risk_share
  series_b:
    par_pct: 0.07
    coupon_range_bps: [800, 1100]
    tenor_years: 15
    rating_target: BBB
    enhancement_default: none
    bank_managed: true
  capitalized_interest:
    required_if_construction: true
    months_funded: 24
  reserves:
    dsrf_required: true
    dsrf_sizing_rule: 12pct_par
    marketing_reserve_required: false
    operating_reserve_pct: 0.025
    maturity_reserve_pct: 0.025

required_documents:
  sector_specific_docs:
    - doc_id: market_study
      doc_class: market_study
      schema_reference: docs/research/2026-05-28-feasibility-study-requirements.md#multifamily-housing-pab-142
      required: true
      freshness_days: 540
    - doc_id: regulatory_agreement
      doc_class: regulatory
      schema_reference: Bible §4.1 (Regulatory Agreement)
      required: true
      freshness_days: 0
    - doc_id: lihtc_application
      doc_class: tax_credit
      required: false
      freshness_days: 365
    - doc_id: hud_firm_commitment
      doc_class: federal_program
      required: false
      freshness_days: 365

bernard_intake_questions:
  - id: tax_exempt_eligibility
    question: Does the project qualify under PAB §142(d)? If so, which set-aside (20-50 or 40-60)?
    answer_type: enum
    drives: [eligible_bond_types, default_bond_type]
  - id: conduit_issuer
    question: Is the planned conduit a state HFA?
    answer_type: enum
    drives: [credit_enhancement.moral_obligation]
    rule_engine_dependency: drives moral obligation availability
  - id: hud_risk_share
    question: Is HUD risk-share in scope?
    answer_type: boolean
    drives: [credit_enhancement.federal_guarantee.eligible_programs]
  - id: lihtc_4pct_9pct
    question: 4% or 9% LIHTC (or neither)?
    answer_type: enum
    drives: [required_documents.sector_specific_docs.lihtc_application]
  - id: sponsor_track_record
    question: How many prior LIHTC projects has the sponsor completed?
    answer_type: number
    drives: [credit_grading]

cross_references:
  bible_silos: ['§2.14', '§4.1', '§9.4', '§9.7', '§17.3-17.7']
  research_docs:
    - docs/research/2026-05-28-feasibility-study-requirements.md
    - docs/research/2026-05-28-surety-and-credit-enhancement-requirements.md
    - docs/research/2026-05-29-partner-outreach-repository.md
  companion_naics_codes: ['531311']
  jacaranda_blueprint_anchor: false
```

### NAICS 531311 — Residential Property Managers

Inherits 531110 except — this NAICS rarely is the obligor; it's typically an operating entity inside a 531110 structure. Rule engine should flag this NAICS as **non-obligor** and prompt Bernard to identify the true obligor entity.

---

## Sector 4 — Healthcare Facilities

### NAICS 622110 — General Medical and Surgical Hospitals

```yaml
naics_code: '622110'
naics_title: 'General Medical and Surgical Hospitals'
sector_bucket: healthcare

eligible_bond_types:
  - bond_type: tax_exempt_501c3
    use_case: Non-profit hospital
    typical_tenor_years: 30
    typical_amortization: level_debt_service
    rationale: Workhorse for non-profit hospital revenue bonds
  - bond_type: tax_exempt_governmental
    use_case: Public hospital district
    typical_tenor_years: 30
    typical_amortization: level_debt_service
    rationale: Public hospital direct issuance

default_bond_type: tax_exempt_501c3

feasibility_requirement:
  required: true
  recommended: true
  variant: hospital_feasibility
  consultant_shortlist:
    - partner_id: kaufman_hall
      tier: tier_1_default
    - partner_id: ponder
      tier: tier_1_default
    - partner_id: ecg_management_consultants
      tier: tier_1_default
  typical_fee_usd:
    low: 150000
    high: 300000
  typical_timeline_weeks:
    low: 12
    high: 16

credit_enhancement:
  performance_payment_surety:
    required_if_construction: true
    placement_broker_default: hylant
    carrier_universe: [travelers, liberty_mutual, zurich, cna, chubb, hartford, arch]
  dsrf_surety_substitution:
    eligible: true
    notes: Selective; depends on system credit
  letter_of_credit:
    eligible: true
    recommended_for_vrdo: false
    nest_aum_phase_3_4_internal: true
    bank_universe: [jpmorgan_chase, bofa, wells_fargo, us_bank, bny_mellon]
  bond_insurance:
    eligible: false
    recommended: false
    insurer_universe: []
  moral_obligation:
    eligible_by_state: [NY]
    state_hfa_required: true
  state_intercept:
    eligible_by_state: []
    typical_uplift_notches: 0
  parent_corporate_guarantee:
    eligible: true
    typical_scenarios: [health_system_guarantees_individual_hospital]
  federal_guarantee:
    eligible_programs:
      - program: hud_242
        scope: Non-profit hospital FHA insurance
  self_collateralization:
    eligible: true
    nest_aum_phase_4_only: true

nest_structural_template:
  series_a:
    par_pct: 0.88
    coupon_range_bps: [550, 700]
    tenor_years: 30
    rating_target: A
    enhancement_default: hylant_surety
  series_b:
    par_pct: 0.10
    coupon_range_bps: [900, 1300]
    tenor_years: 15
    rating_target: BBB-
    enhancement_default: none
    bank_managed: true
  capitalized_interest:
    required_if_construction: true
    months_funded: 24
  reserves:
    dsrf_required: true
    dsrf_sizing_rule: lesser_of_mads_10pct_125pct_aads
    marketing_reserve_required: false
    operating_reserve_pct: 0.0
    maturity_reserve_pct: 0.025

required_documents:
  sector_specific_docs:
    - doc_id: hospital_feasibility_study
      doc_class: examined_financial_forecast
      schema_reference: docs/research/2026-05-28-feasibility-study-requirements.md#healthcare-facilities-hospitals-health-systems-senior-living-adjacencies
      required: true
      freshness_days: 540
    - doc_id: utilization_statistics_3yr
      doc_class: operating_data
      required: true
      freshness_days: 90
    - doc_id: payor_mix_history
      doc_class: operating_data
      required: true
      freshness_days: 90
    - doc_id: cms_cost_reports
      doc_class: regulatory
      required: true
      freshness_days: 365

bernard_intake_questions:
  - id: hospital_type
    question: General acute, critical access, specialty, rehab, or psychiatric hospital?
    answer_type: enum
    drives: [feasibility_requirement.variant]
  - id: system_affiliation
    question: Is the hospital part of a multi-hospital system?
    answer_type: boolean
    drives: [credit_enhancement.parent_corporate_guarantee]
  - id: hud_242_eligibility
    question: Has the hospital previously used HUD 242 financing or considered it?
    answer_type: boolean
    drives: [credit_enhancement.federal_guarantee.eligible_programs]

cross_references:
  bible_silos: ['§2.14', '§9.6', '§9.7', '§17.3-17.7']
  research_docs:
    - docs/research/2026-05-28-feasibility-study-requirements.md
    - docs/research/2026-05-28-surety-and-credit-enhancement-requirements.md
    - docs/research/2026-05-29-partner-outreach-repository.md
  companion_naics_codes: ['622210', '622310']
  jacaranda_blueprint_anchor: false
```

### NAICS 622210 — Psychiatric and Substance Abuse Hospitals / NAICS 622310 — Specialty Hospitals

Inherit 622110 except `consultant_shortlist` reweights to specialty subset; `feasibility_requirement.variant` may collapse to standard hospital feasibility.

---

## Sector 5 — Other / Future Expansion

### NAICS 221xxx — Utilities (water, electric, gas)

Stub row — future expansion. Bond type: `revenue_bond` (essential service). Bond insurance: `eligible: true` (AGM/BAM are heavily active in essential-service revenue bonds). Feasibility: typically engineering feasibility, not financial feasibility. Federal programs: TIFIA, USDA (rural utilities). Consultant short-list: Black & Veatch, HDR, AECOM, Burns & McDonnell. **Not in NEST visible pipeline yet — defer detailed schema.**

### NAICS 487xxx / 488xxx — Transportation

Stub. Bond type: `revenue_bond`. Federal: TIFIA. **Not in NEST visible pipeline yet.**

### NAICS 92xxxx — Government

Stub. Bond type: `tax_exempt_governmental` (GO or revenue). **Not in NEST visible pipeline yet.**

---

## Default fallback row (when NAICS unrecognized)

```yaml
naics_code: '__DEFAULT__'
naics_title: 'Unrecognized NAICS'
sector_bucket: other

# Falls back to general-purpose middle-market conduit bond defaults
default_bond_type: taxable_corporate
default_rationale: Conservative fallback; assume corporate taxable until refined

feasibility_requirement:
  required: false
  recommended: true
  variant: market_study
  consultant_shortlist: []
  typical_fee_usd: [25000, 100000]
  typical_timeline_weeks: [6, 12]

# All other fields populated with conservative middle-market defaults
# Bernard flags to Sean/Josh for manual NAICS review

bernard_intake_questions:
  - id: naics_review_required
    question: 'NAICS code not in rule library; Sean/Josh manual review required before proceeding'
    answer_type: text
    drives: []
    rule_engine_dependency: human_review_gate
```

---

## Agent routing summary (CLAUDE.md 15-agent fleet)

Every NAICS row routes the same agents but the *prompts and parameters per agent* vary by sector. The mapping:

| Agent | Function in deal pipeline | Per-sector parameter set |
|---|---|---|
| **Morgan** | First-look memo (Jimmy Lee tone) at Intake Brainstorm | Sector-specific opening line + JPM credit benchmark applied + Jacaranda blueprint reference |
| **Atlas** | 10-year proforma model | Sector-specific revenue and expense templates from feasibility schema |
| **Prometheus** | Modeling engine, feasibility audit sim | Replicates feasibility consultant's examined forecast; flags divergence |
| **Maxwell** | Credit grading (DSCR/LTV/LGD/obligor grade) | JPM benchmarks + sector-specific ratios from companion feasibility doc §"Mapping each feasibility-study section…" |
| **Sentinel** | Risk assessment (7 dimensions) | Sector-specific dimensions: CCRC adds entrance-fee velocity dimension; charter adds authorizer renewal dimension; multifamily adds LIHTC compliance dimension |
| **Vector** | Call/put timing (14 market signals, 15-min intervals) | Same engine, different sensitivity per sector to UST rates and credit spreads |
| **Apex** | Short position manager (TLT puts, T-note futures, IRS) | Portfolio-level, not sector-specific |
| **Chain** | Blockchain execution (ERC-1400) | Same engine; tokenization layer for AEC token |
| **Sterling** | Investor placement, book building, AEC token | Sector-specific investor pool list from Cat 9 underwriters + Cat 7 buyer-side pools |
| **Aria** | Client + BD outreach | Per-sector sponsor template; Cat 7-9 outreach scripts |
| **Merlin** | M&A intelligence | NAICS-keyed scan; same engine |
| **LenderScout** | Direct lender sourcing (800+ lenders, match engine) | Cat 3 LOC banks + Cat 5 federal program desks |
| **Bridge** | Perm debt monitoring (18mo before stabilization) | Per-sector stabilization triggers from feasibility schema |
| **Quantum** | HFT fund optimizer ($32.4M AUM, 21.3% YTD) | Receives Series B tranche allocations per Capital Structure block |
| **Blaze** | Elite marketing engine | Sector-specific decks (Jacaranda template for CCRC) |

---

## Bernard Intake Brainstorm — universal questions (asked on every deal regardless of NAICS)

After the NAICS-specific questions above, Bernard always asks:

1. **AUM Phase question.** "NEST AUM at deal initiation?" → drives `credit_enhancement.letter_of_credit.nest_aum_phase_3_4_internal` and `credit_enhancement.self_collateralization.nest_aum_phase_4_only` per CLAUDE.md LC Phase
2. **Target rating.** "Target rating for senior tranche?" → A, BBB+, BBB, BBB-, non-rated
3. **Timing.** "Target closing date?" → backsolves working-group calendar
4. **Sponsor identity verification.** "Sponsor entity legal name + EIN" → triggers Sponsor Diligence Agent at Stage 2
5. **Counterparty preferences.** "Existing relationships with bond counsel, trustee, underwriter we should preserve?" → routes Engagement Letter Agent at Stage 5
6. **Existing Hylant relationship.** "Does the sponsor have an existing Hylant relationship?" → routes Cat 1 surety placement
7. **Use of proceeds breakdown.** Critical for §145 / §142 qualification on tax-exempt deals
8. **Series B intent.** "Does the deal need Series B?" → drives Capital Structure template per CLAUDE.md

---

## Cross-references back into platform surfaces

| Surface | Reads from this document |
|---|---|
| Bernard Intake Brainstorm UI | `bernard_intake_questions` per matched NAICS row |
| Roots Stage 1 demand list | `roots_stage_1_demands` per matched NAICS row |
| Bond Desk ALADDIN scenarios | `nest_structural_template` + `credit_enhancement` eligibility matrix |
| Cost-of-Issuance calculator | `coi_estimate` per matched NAICS row |
| Maxwell credit agent | `rating_agency_methodologies` + JPM benchmarks (CLAUDE.md) |
| EagleEye signal generation | `sector_bucket` for filter/grouping |
| Hawkeye dossier system | `consultant_shortlist`, `bank_universe`, `carrier_universe`, `insurer_universe`, `state_hfa` (FK chains into partner repository) |
| Aria / Sterling / LenderScout agents | `consultant_shortlist`, `bank_universe`, `carrier_universe` for outreach targeting |
| Morgan memo agent | NAICS row + CLAUDE.md voice rules + Jacaranda blueprint reference |

---

## Validation rules (deterministic, no AI inference per ADR-0002)

```python
# Pseudo-code expressing the rule-engine validation semantics
def validate(deal, naics_row):
    errors = []

    # Required documents must be uploaded or scheduled
    for doc in naics_row.required_documents.sector_specific_docs:
        if doc.required and doc not in deal.documents:
            errors.append(f"Missing required document: {doc.doc_id}")

    # Feasibility variant must be commissioned if required
    if naics_row.feasibility_requirement.required:
        if not deal.feasibility_study_status in ['commissioned', 'received']:
            errors.append("Feasibility study not commissioned")

    # Consultant must be on tier_1_default or tier_2_alternative list
    if deal.feasibility_consultant and naics_row.feasibility_requirement.consultant_shortlist:
        accepted = [p.partner_id for p in naics_row.feasibility_requirement.consultant_shortlist]
        if deal.feasibility_consultant not in accepted:
            errors.append(f"Feasibility consultant {deal.feasibility_consultant} not on rating-agency-accepted list")

    # State-specific eligibility checks
    if naics_row.credit_enhancement.state_intercept.eligible_by_state:
        if deal.state in naics_row.credit_enhancement.state_intercept.eligible_by_state:
            deal.recommended_enhancement.append('state_intercept')

    # JPM credit benchmarks
    if deal.dscr_projected < 1.5:
        errors.append("Sub-IG: DSCR projected below 1.5x (CLAUDE.md JPM benchmark)")

    # NEST AUM Phase enhancement
    if deal.nest_aum < 15_000_000:
        deal.recommended_enhancement_phase = 'hylant_surety'
    elif deal.nest_aum < 40_000_000:
        deal.recommended_enhancement_phase = 'hylant_surety_plus_nest_lc_participation'
    elif deal.nest_aum < 80_000_000:
        deal.recommended_enhancement_phase = 'nest_lc_dominant'
    else:
        deal.recommended_enhancement_phase = 'self_collateralized'

    return errors, deal
```

Note: this is **specification pseudo-code** to communicate the deterministic logic, not new code. The actual implementation lives at `services/naics_rules_engine.py` per ADR-0002, which was already in scope before this research artifact existed.

---

## Sources

### NEST artifacts cited inline

- `C:\Users\sgill\nest\docs\Bible_Pass1_v2.md` — Silo 1 (bond anatomy), Silo 2 (counterparties, all §2.x referenced), Silo 3 (Stage 1–5 workflow), Silo 4 (documents §4.1-4.9), Silo 5 (fee architecture), Silo 8 (reserves §3047-3437), Silo 9 (credit enhancement §9.1-9.11), Silo 17 (agent specs §17.3-17.7)
- `C:\Users\sgill\nest\CLAUDE.md` — Jacaranda Trace PLOM blueprint ($231M, Florida LGFC), JP Morgan Credit Benchmarks, Capital Structure (Series A 75% LTC / 6.5-7.5%, Series B +7% / 10-14%, IO pre-funded, 2.5% maturity reserve, LC Phase), 15-agent fleet (Vector, Apex, Chain, Atlas, Morgan, Sterling, Bridge, Quantum, Maxwell, Aria, Merlin, LenderScout, Prometheus, Sentinel, Blaze), Hylant Insurance Partner, brand and voice
- `C:\Users\sgill\nest\docs\adr\0002-deal-lifecycle-entry-points.md` — Deterministic rules engine, single Deal front door, Intake Brainstorm
- `C:\Users\sgill\nest\docs\research\2026-05-28-feasibility-study-requirements.md` — 14-section CCRC schema + variant decision tree
- `C:\Users\sgill\nest\docs\research\2026-05-28-surety-and-credit-enhancement-requirements.md` — Hylant + 8 enhancement categories + AUM-phased progression + state-by-state inventory
- `C:\Users\sgill\nest\docs\research\2026-05-29-partner-outreach-repository.md` — Partner FK universe used in shortlist references
- `C:\Users\sgill\Downloads\sellside_unzip\jacaranda-institutional-teaser.md` — Series 2025 structure (3-tranche $205M; CLAUDE.md states $231M blueprint figure)

### URLs to harvest in Path B (next session)

Same harvest list as the partner-outreach-repository doc. No new URLs introduced by this artifact.

---

## Recommended Bible patches (cumulative across all 4 research docs)

This document adds:
- **§17.3 Data Validation Agent rule library** — populate with the per-NAICS payload from this document
- **§17.5 Re-Underwriting Agent + §17.6 Structuring Memorandum** — explicit reference to this document's `nest_structural_template` per NAICS
- **§17.7 Rating Strategy Agent** — explicit reference to this document's `rating_agency_methodologies` field
- **New §17.x or Appendix A.x** — formalize NAICS Rules Engine Data Payload as Bible-tracked data with cross-reference back into this document

Cumulative Bible patch list across all four research docs (feasibility + surety + partner repo + NAICS rules engine):
- §2.14 — rename Dixon Hughes Goodman → Forvis Mazars
- §2.17 — add Hylant by name
- §2.18 — add A.M. Best ratings field; Hylant carrier-universe linkage
- §2.19 — formalize BD partner profile against named candidates (Ziegler dominant CCRC, Truist/RBC/Piper Sandler/Stifel/Raymond James mid-tier)
- §4.4 — add Independent Accountants' Examination Report as opinion class
- §4.5 — add Actuarial Study as sector-specific operational/disclosure document
- §4.9 — add Sector-Specific Studies inventory entry
- §9.1 — expand to 8 categories (separate P&P surety from DSRF surety substitution)
- §9.2 — note NEST as LC participant in Phase 3
- §9.4/§9.5 — state-by-state inventory tables
- §9.7 — separate GNMA/FNMA/FHLMC wraps from HUD insurance
- §9.8 — self-collateralization as NEST Phase 4 endpoint
- New §9.12 — NEST AUM-Phased Enhancement Progression (CLAUDE.md formalized)
- New §2.23 — Partner Outreach Repository as data layer
- §17.3 / §17.5 / §17.7 — reference NAICS Rules Engine Data Payload
- New Appendix A.x — NAICS Rules Engine Data Payload formal entry

---

## What's deliberately NOT in this document

Per the locked frontend + backend posture (2026-05-29):

- **No new modules.** `services/naics_rules_engine.py` already exists per ADR-0002 scope; this is its data payload, not new code.
- **No new database tables.** YAML row data files loaded by the existing service.
- **No new UI surfaces.** Bernard Intake Brainstorm UI already exists; this populates its question library.
- **No new routes.** Existing endpoints serve the rules-engine output.
- **No new agents.** The CLAUDE.md 15-agent fleet stands; this document maps which agent reads which NAICS field.

Pure data spec. The lookup tables above are the operational payload.
