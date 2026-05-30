# Surety & Credit Enhancement Requirements — NEST Reference

**Status:** Draft research · 2026-05-28
**Owner:** Sean Gilmore
**Audience:** Bond Desk ALADDIN structuring agent, NAICS rules engine, Bernard Intake Brainstorm, Hawkeye dossier seed list, Hylant relationship layer
**Type:** Reference document — what credit enhancements exist, when each applies, who provides them, and how the NEST AUM-phased LC progression maps onto rating-agency uplift math
**Companion to:** `2026-05-28-feasibility-study-requirements.md`

---

## Environment note on sources

Same constraint as the feasibility-study research run: **WebSearch and WebFetch are denied in this sandbox.** All claims are sourced from:

1. **NEST artifacts cited inline** — Bible §2.18, §2.17, §9.1–9.11 (Credit Enhancement), §3.11 (rating committee), §8 (reserves & waterfalls), `CLAUDE.md` Capital Structure block, ADR-0002, and the Jacaranda Trace deal materials
2. **Industry knowledge — tagged `[VERIFY]`** where I cannot anchor to a NEST artifact
3. **URLs to fetch in a permitted environment** — listed in Sources

The Bible's Silo 9 already covers credit enhancement in operator depth. **This document does not duplicate Silo 9; it extends it** with: (a) the Hylant surety relationship the Bible doesn't yet name, (b) the NEST AUM-phased LC progression from CLAUDE.md, (c) sector-by-sector enhancement decision data the NAICS rules engine needs, and (d) the integration with the feasibility-study research.

---

## Why this exists

ADR-0002 makes NAICS → bond type → required documents → feasibility a deterministic rules-engine lookup. **Credit enhancement is the parallel lookup** on the same NAICS spine, and it's the layer where the platform's *actual money* gets made: Hylant's surety + LC capacity is a NEST competitive moat, the AUM-phased progression (CLAUDE.md) is NEST's house structural template, and the rating-agency uplift math is what determines whether a deal gets done at A-grade or sub-IG (per the JPM benchmarks in CLAUDE.md, a sub-IG deal is one whose DSCR < 1.5x — and enhancement is one of the levers that moves a deal across that line without changing the underlying obligor).

This document feeds:

- **Bond Desk ALADDIN scenarios** — which enhancement combinations to model (Bible §9.9 names five common combinations; the NAICS-keyed expansion below is what makes the agent's option space concrete)
- **NAICS rules engine** — per NAICS, the eligible enhancement universe and the recommended structural template
- **Bernard Intake Brainstorm** — for every CCRC, charter, multifamily, healthcare deal at intake, Bernard asks "is this a Series A under the Hylant surety phase, the hybrid phase, the LC-dominant phase, or the self-collateralized phase" *based on the AUM at deal time*, and then explains the resulting cost/uplift trade-off
- **Hawkeye dossier seed list** — the LOC bank universe (Bible §9.2: JPMorgan / BofA / Wells / US Bank / BNY Mellon / PNC / BMO / Fifth Third / Regions, plus HSBC / RBC / Barclays internationally), the bond insurers (AGM, BAM), the surety underwriters (Travelers, Liberty Mutual, Zurich, CNA, Chubb, Hartford, Arch, AmTrust, Old Republic — Bible §2.18), and Hylant as the placement broker
- **Cost of Issuance calculator** — enhancement premiums and annual fees per Bible §9.11 Quick Reference, NAICS-keyed
- **Maxwell credit agent** (CLAUDE.md agent fleet) — when scoring DSCR / LTV / LGD / obligor grade, the enhancement's rating substitution flag changes the obligor grade output

---

## CLAUDE.md anchor: the NEST AUM-phased enhancement progression

From `CLAUDE.md` Capital Structure block, verbatim:

> **LC Phase:** AUM $0-15M=surety · $15-40M=hybrid · $40-80M=LC dominant · $80M+=self-collateralized

This is the platform's house rule for *which enhancement type* NEST itself supplies to its own deals, as a function of NEST's AUM. It is not a rule about what the obligor can buy in the market — it is a rule about what NEST puts on the deal as captured spread / captured economic position. Reading each phase:

### Phase 1 — Surety phase (AUM $0–$15M)

- **Mechanism:** Hylant-placed surety bonds (performance + payment on construction; surety substitution on DSRF; specialty surety lines)
- **Why:** At sub-$15M AUM, NEST cannot self-collateralize and cannot fund its own LCs. Hylant's surety capacity (with the §2.18 carrier universe: Travelers, Liberty Mutual, Zurich, CNA, Chubb, Hartford, Arch, AmTrust, Old Republic) is the leverage point — Hylant brings the surety, NEST captures the placement spread
- **Captured spread:** Surety placement commission (broker fee from the carrier, paid by the obligor as part of the surety premium) — typically 5–15% of the surety premium **[INDUSTRY KNOWLEDGE — VERIFY exact Hylant commission split]**
- **Rating uplift:** Surety bond on DSRF in lieu of cash funding produces minor rating-treatment improvement (Bible §3047: "Funding source — Bond proceeds at closing, or built up from operating cash flow over a defined period, or a surety bond / LOC in lieu of cash"). The rating agencies give partial credit to surety-DSRF if the surety carrier is A.M. Best A or better (Bible §2.18: "A.M. Best A- or better required by the indenture")
- **Sector fit:** Construction-heavy deals (CCRC expansions, multifamily new construction, charter school facilities). Jacaranda Trace Series 2025 fits this — Stevens Construction's surety (replacing CORE Construction post their May 2025 exit) needs A- carrier with capacity to bond the $9.5M healthcare units renovation + $13M clubhouse/Whittier work

### Phase 2 — Hybrid phase (AUM $15M–$40M)

- **Mechanism:** Hylant surety on construction; NEST-arranged bank LC participations on Series A; the surety + LC stack is layered
- **Why:** NEST has the balance sheet to take meaningful LC participation but not to dominate. Combination structure gives obligor flexibility and lets NEST capture both surety placement and LC participation economics
- **Captured spread:** Surety placement + LC participation fee (typically 10–25% of the LC bank's annual fee allocable to NEST's participation slice) **[VERIFY exact participation economics]**
- **Rating uplift:** LC-enhanced portion is rated to the LC bank's rating (Bible §9.2). The surety portion is on DSRF and contractor performance, no rating uplift on the bonds themselves
- **Sector fit:** Mid-size CCRC refundings, charter school portfolios, healthcare expansions where both construction and operating-period enhancement are needed

### Phase 3 — LC-dominant phase (AUM $40M–$80M)

- **Mechanism:** NEST writes its own LC capacity (likely via a NEST-affiliated bank entity or via dominant participation in a syndicated LC). Hylant still places construction surety
- **Why:** At $40M+ AUM, NEST can underwrite its own enhancement risk on Series A. The bond is effectively rated to NEST's own LC rating, which becomes a strategic credit-rating consideration for the firm
- **Captured spread:** Full LC fee economics (Bible §9.2: 50–250 bps annually + 10–50 bps upfront) flow to NEST, net of any underlying funding cost
- **Rating uplift:** Bond rated to LC issuer (NEST itself) — which means NEST has to maintain its own institutional credit rating, likely targeting A/A2 or better to be useful
- **Sector fit:** Becomes the default Series A structure for all sectors where the obligor wants speed and certainty over the cheapest possible Stage-1 pricing
- **Strategic implication:** This phase requires NEST to obtain its own credit rating from at least one major agency — a major firm milestone

### Phase 4 — Self-collateralized phase (AUM $80M+)

- **Mechanism:** Cash or securities collateral held by trustee, fully or partially supporting the bond (Bible §9.8). At $80M+ AUM, NEST has the cash to fully or partially collateralize Series A on smaller deals and partially collateralize larger ones
- **Why:** Cash collateralization produces effectively risk-free Series A (Bible §9.11: "Cash Collateral — Effectively risk-free if fully collateralized") — the highest possible enhancement, no premium, no fee, just opportunity cost on the parked cash
- **Captured spread:** The full coupon spread between Treasury and the bond's tax-exempt yield, less the opportunity cost of the parked cash. Per Bible §9.8: "Tax-exempt arbitrage opportunity (specific to certain corporate or institutional contexts)" — this is the structural endpoint NEST is building toward
- **Rating uplift:** Effectively risk-free if fully cash-secured, near-Treasury pricing
- **Sector fit:** Any sector — the structural endpoint of the LC Phase progression, used selectively on the highest-margin opportunities

### The progression as a Bernard Intake Brainstorm decision

```
Bernard at Deal Input:
  IF deal_amount > NEST_current_AUM × multiplier_threshold:
    → Cannot self-supply enhancement; bring in third-party LC bank
       (Bible §9.2 universe) or insurer (AGM/BAM)
  ELSE:
    → Apply NEST AUM-phase rule:
       AUM < $15M  → Hylant surety placement (Phase 1)
       AUM < $40M  → Hylant surety + NEST LC participation (Phase 2)
       AUM < $80M  → NEST LC dominant + Hylant surety on construction (Phase 3)
       AUM ≥ $80M  → Self-collateralized + Hylant surety on construction (Phase 4)
```

This is the rule-engine payload the structuring agent at Bible §17.7 (Rating Strategy Agent) should consume.

---

## Gap vs Bible Silo 9: what the Bible already has, what this doc adds

Silo 9 (Bible lines 3460–3777) is already excellent. It catalogues seven enhancement categories with mechanics, pricing, rating impact, and a decision framework. **What the Bible does *not* have:**

| Item | Bible status | Where it lives now |
|---|---|---|
| Hylant insurance partner | Not named anywhere in Bible | `CLAUDE.md` Project Identity |
| NEST AUM-phased LC progression | Not in Bible | `CLAUDE.md` Capital Structure |
| Performance & payment surety bonds (contractor side) | §2.18 names role + carrier universe but no rule-engine data | This doc §"Performance & Payment Surety" |
| Surety bond on DSRF in lieu of cash | §3047, §3277 mention as alternative but no decision rule | This doc §"DSRF surety substitution" |
| Sector-by-sector enhancement matrix | Scattered across §9.x | Consolidated table below |
| State-specific enhancement programs (intercept by state, moral-obligation by state) | §9.4–9.5 describe categorically; no state-level inventory | This doc §"State-specific enhancement programs" |
| Florida Chapter 651 statutory reserves | Referenced in Jacaranda teaser, not in Bible | This doc §"Sector-specific" |
| AGM / BAM current market position | §9.3 mentions both as current market | Updated below with current ratings/capacity |
| HUD 232 / 223(f) program details for senior living | §9.7 mentions HUD broadly | This doc §"HUD programs" |
| GNMA / FNMA wraps for affordable multifamily | Implicit in §9.7 | This doc §"Federal & GSE wraps" |
| Hylant surety carrier short-list — A.M. Best A- or better carriers | Not in Bible | This doc §"Performance & Payment Surety" |
| Rating triggers in LC reimbursement agreements | §5791 referenced | Expanded below |

**Recommended Bible patches** (companion to feasibility-doc patch list):

- §2.17 Insurance Broker — add Hylant by name as NEST's primary surety + specialty broker
- §2.18 Surety Companies — add A.M. Best rating field to the carrier list; note Hylant places through this carrier universe
- §9.1 — expand to eight categories, adding **Performance & Payment Bonds** as a distinct category from DSRF surety substitution (currently §9.1 implicitly bundles surety wrap with bond insurance)
- §9.2 — note that NEST itself may be the LC participant in Phase 3 of the AUM progression
- §9.8 — note that self-collateralization is NEST's Phase 4 structural endpoint
- New §9.12 — NEST AUM-Phased Enhancement Progression (from CLAUDE.md)

---

## Eight enhancement categories — operational reference

Reorganizing Silo 9's seven categories into eight by separating performance/payment surety (contractor side, construction only) from DSRF surety substitution (debt service reserve, operating period).

### Category 1 — Performance & Payment Surety Bonds

**What:** Surety company guarantees the contractor will finish the job (performance bond) and pay subcontractors and suppliers (payment bond). Required by virtually every indenture financing construction (Bible §2.18).

**Bond mechanics — different from bond credit enhancement:** These do NOT enhance the bond's credit rating. They enhance the *project completion certainty*, which protects the bondholders' collateral position. The indenture and the bond counsel opinion typically condition closing on the bonds upon the contractor delivering the surety bond evidence.

**Carrier universe (A.M. Best A- or better, Bible §2.18):**
- Travelers (A++ rated, dominant US surety market share **[VERIFY current rating]**)
- Liberty Mutual (A rated)
- Zurich (A+ rated)
- CNA (A rated)
- Chubb (A++ rated)
- Hartford (A+ rated)
- Arch (A+ rated)
- AmTrust (A- — at the lower edge of acceptability)
- Old Republic Surety (A+ rated)

**Placement broker:** Hylant (per CLAUDE.md). NEST places through Hylant, Hylant places with the carrier above.

**Pricing:** 0.5%–3.0% of contract value (Bible §2.18). Contractor pays the premium; cost is built into the GMP.

**NEST role (Bible §2.18 verbatim):**
- Confirming contractor's bonding capacity is adequate
- Verifying surety's A.M. Best rating
- Capturing surety bond forms in closing binder
- Monitoring renewal during construction

**Failure mode — Jacaranda case:** Teaser line 202: "CORE Construction's May 2025 exit from the senior living sector triggered a transition to Stevens Construction." When the contractor exits, the surety bond is generally voided (it was specific to that contractor and that contract). NEST has to confirm Stevens Construction's new surety is in place and rated. This is the operational watch item the platform's covenant monitoring agent must enforce.

**Rule-engine payload:** Per NAICS where construction is in scope:
- NAICS 623xxx (senior living): always required
- NAICS 611xxx (charter school facility): required if real-estate component
- NAICS 531110/531311 (multifamily): always required
- NAICS 622xxx (healthcare): required for construction; not for refundings
- NAICS 221xxx (utilities), 482xxx (rail), other infrastructure: always required

### Category 2 — DSRF Surety Substitution

**What:** Instead of cash-funding the Debt Service Reserve Fund (typically MADS or 10% of par per Bible §3437), the obligor uses a surety bond from a financial-guaranty-rated carrier. The surety bond promises to pay the DSRF shortfall amount if drawn.

**Why it matters:** DSRF funding from bond proceeds eats par. A 10% DSRF on a $200M bond is $20M of par devoted to reserve. A surety substitution releases that $20M to project use.

**Carrier universe:** Distinct from contractor-surety. DSRF surety is provided by financial guaranty insurers — primarily AGM (Assured Guaranty Municipal) and BAM (Build America Mutual). Some traditional surety carriers (Travelers, Zurich) also write DSRF surety on specific sectors. **[VERIFY which traditional surety carriers currently write DSRF surety post-2008]**

**Pricing:** Typically 0.5%–2.0% of DSRF amount annually **[VERIFY]**

**Rating-agency treatment (Bible §3277):** "Surety substitution for credits where cash funding is uneconomic." Agencies generally accept surety-DSRF if the surety provider is rated at or above the bond's target rating. A BBB bond cannot use a BBB DSRF surety — the surety must be A-rated or better for the substitution to add structural value.

**Sector fit:**
- CCRC: Common on large issues where 10–12% DSRF is material par drag (Jacaranda's $15.3M DSRF per teaser line 72 is 7.4% of par — manageable but a surety substitution would free $15M of project capital)
- Multifamily affordable: Common, especially with HUD risk-share
- Charter schools: Less common; charter authorities often require cash DSRF
- Healthcare: Selective; depends on system credit

### Category 3 — Letter of Credit (LOC)

[Bible §9.2 is the authoritative reference. Summarizing here only the rule-engine-relevant payload.]

**Provider universe:** Bank LOC market (Bible §9.2):
- US majors: JPMorgan Chase, BofA, Wells Fargo, US Bank, BNY Mellon, PNC, BMO, Fifth Third, Regions
- International: HSBC, RBC, Barclays
- NEST itself in AUM Phase 3 (per CLAUDE.md)

**Pricing (Bible §9.2):** 0.10%–0.50% upfront + 0.50%–2.50% annual

**Rating-agency uplift (Bible §9.11):** Bond rated to LC bank's rating

**Sector fit:**
- VRDOs: Almost always LOC-enhanced (Bible §9.2: "Variable-rate bonds (VRDOs) — almost always LOC-enhanced")
- Construction bridges: Short-tenor LC is the standard structure
- Sub-AA obligors with rating uplift math favorable: case-by-case NPV analysis (Bible §9.10)

### Category 4 — Bond Insurance / Financial Guaranty (Surety Wrap)

[Bible §9.3 is authoritative.]

**Current providers (post-2008 market, Bible §9.3):**
- **Assured Guaranty Municipal (AGM)** — AA rated by S&P, A1 by Moody's, **[VERIFY current ratings]**
- **Build America Mutual (BAM)** — AA rated by S&P, **[VERIFY]**
- Defunct: MBIA, Ambac, FGIC, FSA, XL Capital, CIFG (per Bible §9.3 — 2008 crisis casualties)

**Pricing (Bible §9.3, §9.11):** 50–200 bps upfront premium

**Rating-agency uplift (Bible §9.11):** Bond rated to insurer (AA or AA-)

**Sector fit:**
- Municipal essential-service revenue bonds: common
- Municipal GO: common (BAM is heavily concentrated here)
- CCRC: rare — CCRCs more typically issue on native non-rated or rated credit and use feasibility + DSRF structure rather than wraps **[INDUSTRY KNOWLEDGE — VERIFY]**
- Charter schools: rare, agencies skeptical of insurance on charter credits
- Healthcare: occasional on small systems

**NPV math example (Bible §9.10):** $50M bond, native BBB+ at T+175, AA-insured at T+95, 100 bps insurance premium = ~$5–7M NPV positive

### Category 5 — Moral Obligation Pledge

[Bible §9.4 is authoritative.]

**Provider universe:** State HFAs and state agencies with statutory moral-obligation authority. **State-level inventory needed for the rule engine** — partial list:
- New York (NY HFA, NY State Mortgage Agency, DASNY)
- Pennsylvania (PHFA)
- Massachusetts (MassHousing, MassDevelopment)
- New Jersey (NJ HMFA, NJ EDA)
- Illinois (IHDA)
- California (CalHFA — limited)
- Texas (Texas State Affordable Housing Corp — limited)
- **[VERIFY full state-by-state moral obligation availability]**

**Pricing:** Free (Bible §9.11: "Free where available")

**Rating-agency uplift (Bible §9.11):** 1–2 notches above native credit

**Sector fit:**
- Multifamily affordable housing via state HFAs: common
- State-agency-issued revenue bonds for higher ed: occasional
- CCRC: not available (private obligor)
- Charter schools: not directly available; sometimes nested through state credit-enhancement programs

### Category 6 — State Intercept

[Bible §9.5 is authoritative.]

**Provider universe — state-by-state inventory needed:**
- Texas (Permanent School Fund Guarantee — AAA-equivalent for qualifying school district bonds)
- Pennsylvania (PA Act 150 intercept — strong, ~3 notch uplift per Bible §9.5)
- Michigan (school bond loan fund)
- Colorado (CO state intercept)
- Indiana (IN charter school credit enhancement program)
- **[VERIFY full state-by-state intercept inventory and strength rating per state]**

**Pricing:** Free (Bible §9.11)

**Rating-agency uplift (Bible §9.11):** 2–3 notches above native credit

**Sector fit:**
- Charter schools in qualifying states: highly desirable, often the difference between BBB and A rating
- School districts: standard practice where available
- Healthcare: rare (Medicaid intercept exists in theory, Bible §9.5, but rarely used in practice)

### Category 7 — Parent or Corporate Guarantee

[Bible §9.6 is authoritative — full + limited + bad-boy + springing variants.]

**Sector fit:**
- Corporate project bonds with strong parent: standard
- Real estate project bonds with wealthy sponsor: case-by-case (sponsor's financial capacity must justify the rating uplift)
- CCRC: occasional — when a multi-campus operator (Convivial Life, Acts Retirement, Brookdale) guarantees individual campus bonds. Jacaranda: Convivial Life Inc. is the sole member of Convivial Jacaranda Trace LLC (teaser line 178–179) but the structure does not include an upstream guarantee — the 501(c)(3) tax-exempt structure typically precludes corporate-style guarantees

**Rating-agency treatment (Bible §9.6):** Bond rated to parent's credit, subject to fraudulent-conveyance structural considerations

### Category 8 — Federal Guarantee Programs

[Bible §9.7 is authoritative — USDA, HUD, DOE, DOT, ED.]

**Most-used programs for NEST's visible sector mix:**

#### HUD programs (multifamily and senior living)

- **Section 221(d)(4):** New construction or substantial rehab of multifamily, 40-year term, fixed rate, FHA-insured. Used heavily in affordable multifamily.
- **Section 223(f):** Refinance or acquisition of existing multifamily, 35-year term, FHA-insured. The workhorse for affordable refinances.
- **Section 232:** New construction, substantial rehab, or refinance of senior living (assisted living, skilled nursing, memory care, board-and-care). 35-40-year term, FHA-insured. **Highly relevant to NEST's CCRC pipeline** — though pure IL CCRC is generally not 232-eligible; only the AL/MC/SNF components.
  - **Jacaranda implication:** The teaser line 70–71 shows $9.5M of new AL + SNF beds being built. The healthcare component (not the IL component) could in principle be HUD 232-financed if NEST chose to structure it as a separate tranche or take-out. The teaser's actual structure uses tax-exempt revenue bonds for the full campus, not 232 — but the platform should flag 232 as an available alternative on similar CCRC expansion deals
- **Section 242:** Hospital FHA insurance — used for non-profit hospitals
- **Risk-share programs:** HFA + HUD share insurance risk, lower premium, faster process

**Pricing (Bible §9.7, §9.11):** Application fees + Mortgage Insurance Premium (typically 0.45%–0.65% upfront + 0.45%–0.65% annual depending on program) **[VERIFY current MIP rates]**

**Timeline (Bible §9.7):** 6–18 months for federal application — much slower than private LC or insurance

**Rating-agency uplift (Bible §9.11):** AAA or near-AAA effective

#### USDA Rural Development

- **Rural Housing Service Section 538:** Rural multifamily guarantee
- **Community Facilities programs:** Rural healthcare, education, public safety
- **Rural Energy for America Program (REAP):** Rural energy projects

**Sector fit:** Limited to defined rural geography (USDA-defined). Where applicable, AAA effective rating

#### GSE wraps (related to but distinct from HUD)

- **Fannie Mae DUS (Delegated Underwriting and Servicing):** Multifamily, 5-30 year terms
- **Freddie Mac Optigo:** Multifamily, similar structure
- **GNMA pools:** Securitization of HUD-insured loans, AAA effective

**Bible gap:** Silo 9 doesn't separate GNMA / FNMA / FHLMC wraps from HUD insurance. They're distinct products even though related. The rule engine should treat them as separate options.

### Category 9 (new) — Cash or Securities Collateral / Self-Collateralization

[Bible §9.8 is authoritative.]

**NEST positioning:** This is NEST AUM Phase 4 (CLAUDE.md). At $80M+ AUM, NEST self-collateralizes Series A on smaller deals, partially collateralizes on larger.

**Variants (Bible §9.8):**
- Fully cash-secured
- Partially cash-secured
- Securities-collateralized (government securities)
- Defeasance escrow (refundings)

**Rating-agency uplift:** Effectively risk-free if fully collateralized

---

## Sector-by-sector enhancement decision matrix

For the NAICS rules engine. Each row: which categories are eligible, which are recommended, which are typical NEST house template.

### Senior Living / CCRC (NAICS 623110, 623210, 623311, 623312)

| Category | Eligible | Recommended | NEST house template |
|---|---|---|---|
| Performance & Payment Surety | Yes — construction-only | Yes if construction | Hylant placement |
| DSRF Surety Substitution | Yes | Case-by-case | Phase 2+ NEST hybrid |
| LOC | Yes | Only for VRDO portion or construction bridge | Phase 3 NEST-dominant |
| Bond Insurance (AGM/BAM) | Rare in market | Generally not — feasibility + DSRF + reserves typically preferred over wrap | Skip |
| Moral Obligation | Not available (private obligor) | N/A | N/A |
| State Intercept | Not available | N/A | N/A |
| Parent / Corporate Guarantee | Yes if multi-campus operator | Case-by-case | Confirm at Bernard Intake |
| Federal Guarantee (HUD 232) | Yes — for AL/MC/SNF components only | Yes if pure healthcare facility; not for IL | Document as alternative |
| Self-Collateralization | NEST Phase 4 only | Yes at $80M+ AUM | Phase 4 endpoint |

**Recommended NEST structural template for CCRC** (mirrors Jacaranda Trace pattern):
- Series A (senior, tax-exempt): Hylant surety on construction + DSRF cash-funded + state-specific reserves (Florida Chapter 651 if Florida)
- Series B (subordinate): native credit, no enhancement
- Capitalized interest reserve: bond proceeds
- Marketing reserve: bond proceeds (Bible §3323: "Marketing Reserve (2-4%)")
- Operating reserve: bond proceeds (Bible §3323: "Operating Reserve (5-8%)")

### Charter Schools (NAICS 611110, 611310)

| Category | Eligible | Recommended | NEST house template |
|---|---|---|---|
| Performance & Payment Surety | Yes if construction | Yes if construction | Hylant placement |
| DSRF Surety Substitution | Authority-dependent | Often required cash-only by authority | Per state authority rules |
| LOC | Yes | Generally not — most charter bonds are fixed-rate | Skip unless VRDO |
| Bond Insurance | Rare in market | Generally not | Skip |
| Moral Obligation | Not directly | N/A | N/A |
| **State Intercept** | **Yes in qualifying states (TX/PA/MI/CO/IN)** | **Aggressively pursue — 2-3 notch uplift, free** | **Default if state offers** |
| Parent / CMO Guarantee | Yes if managed by CMO | Yes if CMO is strong | Confirm at Bernard Intake |
| Federal Guarantee | Rare | N/A | N/A |
| Self-Collateralization | NEST Phase 4 only | Case-by-case | Phase 4 endpoint |

**Critical:** State intercept availability is the single most-impactful rating-uplift lever for charter schools (Bible §9.5, §9.11). The NAICS rules engine must geo-key on state intercept availability before all other recommendations.

### Multifamily Housing — PAB §142 / LIHTC (NAICS 531110, 531311)

| Category | Eligible | Recommended | NEST house template |
|---|---|---|---|
| Performance & Payment Surety | Yes if construction | Yes | Hylant placement |
| DSRF Surety Substitution | Yes | Often used to preserve par | Phase 2+ NEST |
| LOC | Yes | Case-by-case for VRDOs | Phase 3 NEST-dominant if economic |
| Bond Insurance | Occasional | Rare — agencies prefer the underlying credit | Skip |
| **Moral Obligation** | **Yes via state HFA** | **Yes if state HFA conduit** | **Default if state HFA is conduit** |
| State Intercept | N/A | N/A | N/A |
| Parent / Sponsor Guarantee | Yes — sponsor guarantees common | Yes if sponsor strong | Confirm at Bernard Intake |
| **Federal Guarantee (HUD 221(d)(4), 223(f), GSE wraps)** | **Yes** | **Yes — workhorse for affordable** | **Default for affordable construction or refinance** |
| Self-Collateralization | NEST Phase 4 only | Rare | Phase 4 endpoint |

**Critical:** Affordable multifamily is the sector where federal guarantees are most economic and most-used. State HFA conduits routinely produce AAA-rated tax-exempt bonds via HUD risk-share. The NAICS engine should default to this stack.

### Healthcare Facilities (NAICS 622110, 622210, 622310)

| Category | Eligible | Recommended | NEST house template |
|---|---|---|---|
| Performance & Payment Surety | Yes if construction | Yes if construction | Hylant placement |
| DSRF Surety Substitution | Yes | Case-by-case | Phase 2+ NEST |
| LOC | Yes | Generally not for fixed-rate | Skip unless VRDO |
| Bond Insurance | Rare | Generally not | Skip |
| Moral Obligation | Not available | N/A | N/A |
| State Intercept (Medicaid) | Theoretically yes, rarely used | Generally not | Skip |
| Parent / System Guarantee | Yes if system-affiliated | Yes if system strong | Default if multi-hospital system |
| **Federal Guarantee (HUD 242)** | **Yes for non-profit hospitals** | **Case-by-case** | **Document as alternative** |
| Self-Collateralization | NEST Phase 4 only | Rare | Phase 4 endpoint |

---

## State-specific enhancement programs — partial inventory

Beyond what the Bible §9 covers categorically. The NAICS rules engine needs this state-keyed.

**[ENTIRE SECTION: INDUSTRY KNOWLEDGE — VERIFY each state-specific program through its issuing-agency website in a permitted-WebFetch environment.]**

| State | Program | Sector | Type | Strength |
|---|---|---|---|---|
| Texas | Permanent School Fund Guarantee | Charter schools, school districts | Direct guarantee | AAA equivalent |
| Texas | Texas State Affordable Housing Corp | Multifamily affordable | Moral obligation / conduit | A category |
| Pennsylvania | Act 150 / State Public School Building Authority | Charter schools, school districts | Intercept | Strong, 3-notch |
| Michigan | School Bond Loan Fund | School districts | Intercept | Strong |
| Colorado | Charter School Credit Enhancement | Charter schools | Reserve fund + intercept | Moderate-strong |
| Indiana | Charter and Innovation Network School Loan | Charter schools | Intercept | Moderate |
| Florida | Chapter 651 Statutory Reserves | CCRC | Reserve requirement (not enhancement, regulatory floor) | N/A as enhancement |
| New York | DASNY (Dormitory Authority) | Higher ed, healthcare | Moral obligation + conduit | Strong |
| New York | NY State Mortgage Agency | Multifamily | Moral obligation + insurance | Strong |
| Massachusetts | MassDevelopment | Industrial, charter, multifamily | Conduit + various | Variable |
| Illinois | IHDA | Multifamily affordable | Moral obligation + state HFA | Moderate (IL fiscal) |
| California | CalHFA | Multifamily affordable | Conduit + limited moral obligation | Moderate |
| New Jersey | NJ EDA, NJ HMFA | Industrial, multifamily | Conduit + various | Moderate |

**Florida Chapter 651 specifically:** Not a credit enhancement in the rating-agency sense — it is a state regulatory minimum reserve requirement on CCRCs. The Jacaranda teaser (line 196) notes "statutory reserves under Florida Chapter 651" as part of the structural protections. The rating agencies recognize Chapter 651 as evidence of operating discipline but do not award rating uplift directly for it.

---

## Hylant relationship — what the platform must encode

`CLAUDE.md` names Hylant as the platform's Insurance Partner for surety and specialty lines. The Bible (§2.17 Insurance Broker) describes the broker role generically (Marsh, Aon, Willis, Lockton, USI, Brown & Brown, Hub International named) but does not name Hylant.

### Hylant as broker — where in the workflow

| Workflow stage | Hylant role | NEST role |
|---|---|---|
| Stage 1 — Roots ingestion | Sponsor's existing insurance certificates flow in | Identify whether Hylant or another broker holds the relationship |
| Stage 4 — Structuring memo | Surety capacity assessment requested | Request Hylant capacity quote for performance/payment + DSRF substitution |
| Stage 5 — Engagement | Hylant formally engaged as broker | Engagement letter (Bible §17.7 Engagement Letter Agent) |
| Stage 6 — Document drafting | Surety bond forms drafted by Hylant + carrier | NEST captures forms in closing binder |
| Stage 11 — Pricing | Surety bond terms locked | Coordinate with closing |
| Stage 12 — Closing | Surety bond delivered | Capture in binder |
| Stage 13 — Post-closing | Renewal monitoring | NEST covenant monitoring layer pings Hylant pre-renewal |

### Hylant in the Hawkeye dossier system

Per `project_hawkeye_dossier`, NEST builds living dossiers on top 20 investors and deal counterparties. Hylant should be the first non-investor dossier — relationship contact, capacity by carrier, recent placement history, pricing benchmarks. Suggested fields:

- Primary relationship lead at Hylant
- Carrier capacity matrix (Hylant → Travelers/Liberty/Zurich/CNA/Chubb/Hartford/Arch/AmTrust/Old Republic)
- Recent NEST placement history
- Recent placement pricing per carrier per sector
- Carrier A.M. Best rating watch list

---

## Integration with feasibility-study research

The two research documents (this one + the feasibility-study one) interlock:

| Feasibility-study artifact | Surety / enhancement implication |
|---|---|
| Section 12 examined forecast — MADS coverage projection | Drives required DSRF size; surety substitution decision keys on whether cash funding the DSRF would impair the projected ratios |
| Section 11 entrance-fee velocity | If volatile, indenture may require larger DSRF or longer surety term |
| Section 9 marketing & sales plan | Determines marketing reserve sizing — Hylant can sometimes write surety on marketing reserves on CCRCs **[VERIFY]** |
| Section 8 pricing and service schedule | If entrance-fee CCRC is Type A (life-care), actuarial reserves required — Florida Chapter 651 / California 1792 may demand specific minimums beyond DSRF |
| Section 4 sponsor/management | Bernard checks: is the sponsor an existing Hylant client, or does NEST need to introduce Hylant? |
| Section 3 the community/project | Capex schedule drives performance/payment surety bond sizing |

The NAICS rules engine should output a *combined* enhancement + feasibility recommendation for each deal, with the dependencies explicit.

---

## Rating triggers and downgrade risk in LC-enhanced structures

Bible §5791 flags this in passing. Expanding for the rule engine.

**The risk:** When a bond is rated to an LC bank's credit, a downgrade of the LC bank cascades to the bond. If the bond indenture has rating triggers tied to the LC bank, the obligor may face mandatory tender or LOC replacement requirements.

**Structural protections the structuring agent should consider:**
- LOC replacement provisions with reasonable timing windows (typically 30–60 days, not immediate)
- Substitute LC bank universe pre-approved in indenture
- Coverage of mandatory tender shortfall by a backup liquidity facility
- Springing fixed-rate conversion if LC cannot be replaced

**Bible §5791 verbatim:** "Rating triggers in operational documents — LOC reimbursement agreements, hedging arrangements, and other obligations sometimes have rating triggers; the structuring agent considers whether these are appropriate or whether they create undue downgrade risk."

This is operational guidance the Bond Desk ALADDIN scenarios should explicitly model when the LC-enhanced structure is on the table.

---

## Jacaranda Trace mapping — example application

Applying the framework above to the actual Jacaranda Series 2025 deal:

| Element | Jacaranda Structure | Framework slot |
|---|---|---|
| Series 2025A (tax-exempt) | $178.08M at 6.25–7.125% | Series A; non-rated (per teaser line 200); native-credit pricing |
| Series 2025B (tax-exempt) | $20.27M at 5.75% | Series A subordinate; LURA-bearing (231 IL units at 50% AMI set-aside) |
| Series 2025C (taxable) | $4.73M at 7.0% | Taxable layer for non-PAB-eligible uses |
| DSRF | $15.317M cash-funded | Category 9 (cash collateral, partial); not surety-substituted on this deal |
| Capitalized interest | $11.513M | Bond proceeds — Bible §3319 standard |
| Construction surety | Stevens Construction (replacing CORE Construction) | Category 1 (P&P surety) — Hylant could/should be the placement broker; the teaser does not say who placed |
| Florida Chapter 651 | Statutory reserves maintained | Regulatory floor; not rating-agency enhancement |
| Feasibility | Forvis Mazars examined forecast | Companion research doc |

**NEST house-template recommendation for a similar deal in Phase 1–2 (sub-$40M AUM):**
- Hylant placement of construction surety (replacing whoever placed for CORE/Stevens)
- DSRF cash-funded (since deal is non-rated, surety substitution adds no rating uplift)
- No bond insurance (deal is non-rated; insurance doesn't fit non-rated issuance economics)
- Florida Chapter 651 reserves maintained per regulatory requirement
- If NEST AUM had been Phase 3+: consider NEST-LC-enhanced Series A to push the bonds to rated investment grade; rating uplift math vs cost would need to be NPV'd

---

## NEST platform implications — what gets wired (data only, no new modules)

Per the locked-in posture: this research feeds existing engines as data, not new platform modules. Specific deliverables:

1. **Rule data for `naics_rules_engine.py`** — Per NAICS, output the eligible enhancement universe (the 8 categories above), the recommended NEST house template, and the cost band per category. The data shape exists; the data itself is what this document provides.

2. **Hawkeye dossier seed entries** — Hylant relationship, the 9 surety carriers (Bible §2.18 universe with A.M. Best rating field), the 9+ LOC bank universe (Bible §9.2), AGM, BAM, the federal program contacts (HUD Multifamily, HUD 232 LEAN, USDA RD), the state HFA universe per state intercept and moral obligation availability.

3. **Bernard Intake Brainstorm prompts** — Three sector-specific question additions:
   - CCRC: "Is there construction or major repositioning? If yes, what's the GMP and which contractor — and who's their surety carrier?"
   - Charter school: "What state is this in? Does the state offer credit enhancement (intercept, reserve fund)?"
   - Multifamily: "Tax-exempt PAB §142? If so, is the conduit a state HFA, and is HUD risk-share in scope?"

4. **Bond Desk ALADDIN scenarios** — For every deal, the structuring agent should run minimum these scenarios:
   - Native credit, no enhancement
   - Hylant surety on DSRF (if A-rated obligor or above)
   - LC enhancement at current NEST AUM phase
   - Bond insurance (AGM or BAM) if obligor BBB+ or below
   - Self-collateralization if NEST Phase 4
   - Per-scenario: rating uplift, all-in cost, NPV (Bible §9.10 Step 6)

5. **Maxwell credit agent inputs** — When computing obligor grade per the JPM benchmarks (CLAUDE.md), include a "post-enhancement obligor grade" field that runs the Bible §9.11 rating-uplift substitution table.

6. **Cost-of-Issuance line items** — Per Bible §5 fee architecture:
   - Surety placement (Hylant): broker fee, typically a percentage of surety premium
   - Surety premium (carrier): 0.5%–3.0% of contract value (P&P) or 0.5%–2.0% of DSRF amount (DSRF surety)
   - LOC fee: 50–250 bps annual + 10–50 bps upfront (Bible §9.11)
   - Bond insurance: 50–200 bps upfront (Bible §9.11)
   - HUD MIP: 0.45%–0.65% upfront + annual (program-dependent) **[VERIFY]**

---

## Sources

### NEST artifacts cited inline

- `C:\Users\sgill\nest\docs\Bible_Pass1_v2.md` — Silo 2 (§2.17, §2.18), Silo 8 (§3047 DSRF funding, §3271–3327 DSRF sizing, §3437 DSRF quick-reference), Silo 9 (§9.1–9.11 complete credit enhancement reference — the authoritative Bible coverage)
- `C:\Users\sgill\nest\CLAUDE.md` — Insurance Partner: Hylant; Capital Structure LC Phase progression; JP Morgan Credit Benchmarks
- `C:\Users\sgill\nest\docs\adr\0002-deal-lifecycle-entry-points.md` — NAICS → docs → feasibility → enhancement deterministic lookup
- `C:\Users\sgill\nest\docs\research\2026-05-28-feasibility-study-requirements.md` — companion document (feasibility study requirements)
- `C:\Users\sgill\Downloads\sellside_unzip\jacaranda-institutional-teaser.md` — Series 2025 structure ($203.08M, three tranches, Stevens Construction post-CORE-exit, Florida Chapter 651, $15.317M DSRF, $11.513M capitalized interest)
- `C:\Users\sgill\Downloads\Jacaranda_Trace_Credit_Memorandum.pdf` — bridge structure references with first-lien + assignment of rents + cash management as security stack
- `C:\Users\sgill\Downloads\jacaranda_lender_memo.pdf` — HealthTrust appraisal reference

### URLs to fetch in a permitted environment

The next research pass with WebFetch enabled should pull these to harden the `[VERIFY]` tags:

- Hylant Insurance — hylant.com (surety practice page, specialty lines)
- A.M. Best — ambest.com (current ratings of Travelers, Liberty Mutual, Zurich, CNA, Chubb, Hartford, Arch, AmTrust, Old Republic)
- AGM (Assured Guaranty Municipal) — assuredguaranty.com — current S&P, Moody's, Fitch ratings; recent rated CCRC and multifamily wraps
- BAM (Build America Mutual) — buildamerica.com — current ratings; recent rated muni wraps
- HUD Multifamily program pages — hud.gov — current MIP rates for 221(d)(4), 223(f), 232, 242
- USDA Rural Development — rd.usda.gov — Section 538 multifamily, Community Facilities programs
- Fannie Mae DUS — fanniemae.com/multifamily — DUS structures
- Freddie Mac Optigo — freddiemac.com/multifamily — Optigo structures
- State HFA pages — for each named state (NY, PA, MA, NJ, IL, CA, TX, CO, IN, MI), confirm moral obligation language and intercept availability
- Texas Permanent School Fund — tea.texas.gov/finance-and-grants/bond-finance — guarantee terms
- Florida OIR — floir.com — Chapter 651 statutory reserve requirements
- Recent EMMA filings — emma.msrb.org — Ziegler-underwritten CCRC issuances with surety-DSRF substitution for comp pricing

### Bible patches recommended (companion to feasibility-doc patch list)

- **§2.17** — add Hylant by name as NEST's primary surety + specialty broker; note that the broker selection at Stage 5 typically defaults to Hylant
- **§2.18** — add A.M. Best current rating field to the carrier list (refresh post-VERIFY pass); note Hylant places through this carrier universe
- **§9.1** — expand from 7 to 8 categories: separate Performance & Payment Surety (Category 1) from DSRF Surety Substitution (Category 2); current Bible §9.1 implicitly groups these
- **§9.2** — note that NEST itself may be the LC participant in Phase 3 of the AUM progression
- **§9.4 / §9.5** — add state-by-state inventory tables for moral obligation and intercept availability (the data goes into the NAICS rules engine; the Bible should note where to find it)
- **§9.7** — separate GNMA / FNMA / FHLMC wraps from HUD insurance; they are distinct products
- **§9.8** — note that self-collateralization is NEST's Phase 4 structural endpoint per CLAUDE.md
- **New §9.12** — NEST AUM-Phased Enhancement Progression (the four-phase progression from CLAUDE.md formalized in the Bible as the house template)
