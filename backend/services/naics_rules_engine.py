"""
NAICS Rules Engine — Deterministic lookup: NAICS code → eligible bond types →
required documents → feasibility study requirements.

This module is intentionally NOT AI. It is pure structured data + lookup.
Bernard explains the engine's output to founders/sponsors but does not decide
the bond type. See ADR-0002 (Deal Lifecycle Entry Points) for why.

Sources
-------
- Operating Framework v1, Appendix A — Bond Type Decision Table
  (docs/Operating_Framework_v1.md, lines ~10294-10319)
- Operating Framework v1, Appendix C — NAICS Cross-Reference
  (docs/Operating_Framework_v1.md, lines ~10350-10376)
- Operating Framework v1, Appendix E — Feasibility Consultants by Sector
  (docs/Operating_Framework_v1.md, lines ~10489-10503)
- Bible Pass 1 v2, Silo 4 — The Documents
  (docs/Bible_Pass1_v2.md, lines ~1261-1672)
- Bible Pass 1 v2, Silo 2 (Players) §2.14 Feasibility Consultant, §2.15 Market Study
  (docs/Bible_Pass1_v2.md, lines ~515-525)
- backend/services/intelligence_engine.py — SECTOR_MULTIPLES, SECTOR_LEVERAGE_CAPACITY
  (sector keys reused so downstream IntelligenceEngine sizing stays compatible)

Engine surface
--------------
- lookup(naics_code, deal_intent, borrower_type, state) -> dict
- all_bond_types() -> list[dict]
- documents_for_bond_type(bond_type) -> list[dict]
- naics_list() -> list[dict]
"""
from __future__ import annotations

from copy import deepcopy
from typing import Any


# =====================================================================
# DATA — NAICS Cross-Reference (Operating Framework Appendix C)
# =====================================================================
#
# Each entry maps to a sector key used by services/intelligence_engine.py
# (SECTOR_MULTIPLES / SECTOR_LEVERAGE_CAPACITY). Reusing those keys keeps
# the rules engine and the sizing engine in lock-step.
#
# Source: Operating Framework v1, Appendix C (lines 10350-10376).
# NAICS codes NOT in Appendix C are intentionally NOT here — the framework
# is the source of truth; we do not invent entries.
#
# Codes covered (per the caller's pipeline visibility request):
#   623311 (CCRC)                          — Appendix C row 3
#   623312 (Assisted Living)               — Appendix C row 4
#   623110 (Skilled Nursing)               — Appendix C row 5 (bonus, adjacent)
#   622110 (General Hospitals)             — Appendix C row 1
#   622310 (Specialty Hospitals)           — Appendix C row 2 (bonus, adjacent)
#   611110 (K-12 Schools / Charter)        — Appendix C row 6
#   611310 (Higher Education)              — Appendix C row 7 (bonus, adjacent)
#   531110 (Multifamily Residential)       — Appendix C rows 8-9
#   721110 (Hotels)                        — Appendix C row 10
#   518210 (Data Centers)                  — Appendix C row 11
#   562212 (Solid Waste Landfill)          — Appendix C row 12
#   221320 (Sewage Treatment)              — Appendix C row 13
#   221310 (Water Utilities)               — Appendix C row 14 (bonus)
#   221110 (Electric Power Generation)     — Appendix C row 15 (bonus)
#   488119 (Airports)                      — Appendix C row 16
#   31-33  (Manufacturing — general range) — Appendix C row 17
#
# Codes from the caller's list that ARE NOT in Appendix C (so OMITTED):
#   624410 (Child Daycare)                 — NOT in Appendix C
#   531120-531190 (CRE asset types)        — not enumerated; Appendix C lumps 531110
#   511210 (Software Publishers / SaaS)    — NOT in Appendix C
#   541xxx (Professional services)         — NOT in Appendix C
#   484xxx (Trucking)                      — NOT in Appendix C
# These are intentionally omitted rather than guessed.
NAICS_CROSS_REFERENCE: dict[str, dict[str, Any]] = {
    "622110": {
        "label": "General Medical and Surgical Hospitals",
        "sector": "healthcare_services",
        "appendix_c_row": 1,
    },
    "622310": {
        "label": "Specialty (except Psychiatric and Substance Abuse) Hospitals",
        "sector": "healthcare_services",
        "appendix_c_row": 2,
    },
    "623311": {
        "label": "Continuing Care Retirement Communities",
        "sector": "senior_living",
        "appendix_c_row": 3,
    },
    "623312": {
        "label": "Assisted Living Facilities for the Elderly",
        "sector": "senior_living",
        "appendix_c_row": 4,
    },
    "623110": {
        "label": "Nursing Care Facilities (Skilled Nursing Facilities)",
        "sector": "senior_living",
        "appendix_c_row": 5,
    },
    "611110": {
        "label": "Elementary and Secondary Schools",
        "sector": "education_charter",
        "appendix_c_row": 6,
    },
    "611310": {
        "label": "Colleges, Universities, and Professional Schools",
        "sector": "education_higher",
        "appendix_c_row": 7,
    },
    "531110": {
        "label": "Lessors of Residential Buildings and Dwellings",
        "sector": "real_estate",
        "appendix_c_row": "8-9",  # Appendix C uses the same NAICS for affordable + market-rate
    },
    "721110": {
        "label": "Hotels (except Casino Hotels) and Motels",
        "sector": "hospitality",
        "appendix_c_row": 10,
    },
    "518210": {
        "label": "Computing Infrastructure Providers, Data Processing, Web Hosting",
        "sector": "data_centers",
        "appendix_c_row": 11,
    },
    "562212": {
        "label": "Solid Waste Landfill",
        "sector": "solid_waste",
        "appendix_c_row": 12,
    },
    "221320": {
        "label": "Sewage Treatment Facilities",
        "sector": "utilities_sewage",
        "appendix_c_row": 13,
    },
    "221310": {
        "label": "Water Supply and Irrigation Systems",
        "sector": "utilities_water",
        "appendix_c_row": 14,
    },
    "221110": {
        "label": "Electric Power Generation",
        "sector": "utilities_power",
        "appendix_c_row": 15,
    },
    "488119": {
        "label": "Other Airport Operations",
        "sector": "transportation_airport",
        "appendix_c_row": 16,
    },
    "31-33": {
        "label": "Manufacturing (varies by specific industry)",
        "sector": "industrial_manufacturing",
        "appendix_c_row": 17,
    },
}


# Codes from the caller's pipeline list that are NOT in Appendix C.
# Surfaced so callers can see what was intentionally skipped.
NAICS_OMITTED_FROM_APPENDIX_C: dict[str, str] = {
    "624410": "Child Day Care Services — not in Appendix C; no bond-type rule in Operating Framework v1",
    "531120": "Lessors of Nonresidential Buildings — Appendix C only enumerates 531110 (residential)",
    "531130": "Lessors of Miniwarehouses / Self-Storage — not in Appendix C",
    "531190": "Lessors of Other Real Estate Property — not in Appendix C",
    "511210": "Software Publishers (SaaS) — not in Appendix C; sector exists in intelligence_engine SECTOR_MULTIPLES but Operating Framework gives no bond-type guidance",
    "541xxx": "Professional / Scientific / Technical Services — not in Appendix C",
    "484xxx": "Trucking — not in Appendix C; sector exists in intelligence_engine but no Appendix A row",
}


# =====================================================================
# DATA — Bond Type Catalogue (Operating Framework Appendix A)
# =====================================================================
#
# Each canonical bond type has: human label, IRC / statute citation, taxable
# vs tax-exempt flag, and a one-line plain-English summary. The Appendix A
# decision rows below reference these by key.
BOND_TYPES: dict[str, dict[str, str]] = {
    "tax_exempt_501c3": {
        "label": "Tax-Exempt Qualified 501(c)(3) Revenue Bonds",
        "citation": "IRC §145",
        "tax_status": "tax_exempt",
        "summary": "Conduit revenue bond for 501(c)(3) borrowers; interest exempt from federal tax.",
    },
    "tax_exempt_governmental": {
        "label": "Tax-Exempt Governmental Purpose Bonds (GO or Revenue)",
        "citation": "IRC §103",
        "tax_status": "tax_exempt",
        "summary": "State / local government issuer for public purpose; no volume cap; no AMT.",
    },
    "tax_exempt_pab_142d": {
        "label": "Tax-Exempt Private Activity Bonds — Qualified Residential Rental (Multifamily)",
        "citation": "IRC §142(d)",
        "tax_status": "tax_exempt",
        "summary": "Multifamily affordable rental PAB; volume cap allocation; 20/50 or 40/60 test; LIHTC pairing typical.",
    },
    "tax_exempt_pab_142": {
        "label": "Tax-Exempt Exempt Facility Bonds (PAB)",
        "citation": "IRC §142",
        "tax_status": "tax_exempt",
        "summary": "PAB for permitted facility categories (airports, solid waste, sewage, etc.); volume cap may apply.",
    },
    "tax_exempt_qmb_single_family": {
        "label": "Tax-Exempt Qualified Mortgage Bonds (Single-Family)",
        "citation": "IRC §143",
        "tax_status": "tax_exempt",
        "summary": "State HFA first-time homebuyer mortgages; volume cap allocation.",
    },
    "tax_exempt_qsib_manufacturing": {
        "label": "Tax-Exempt Qualified Small Issue Manufacturing Bonds",
        "citation": "IRC §144(a)",
        "tax_status": "tax_exempt",
        "summary": "Up to $10M per project for manufacturing facility; AMT applies; volume cap.",
    },
    "tax_exempt_tribal": {
        "label": "Tax-Exempt Tribal Economic Development Bonds",
        "citation": "IRC §7871",
        "tax_status": "tax_exempt",
        "summary": "Tribe-specific allocation for federally recognized tribes.",
    },
    "taxable_corporate": {
        "label": "Taxable Corporate Bonds (Public 144A or Registered)",
        "citation": "Securities Act §4(a)(2) / Rule 144A",
        "tax_status": "taxable",
        "summary": "Investment-grade C&I corporate; 5-30yr; bullet at maturity typical.",
    },
    "taxable_high_yield": {
        "label": "Taxable High-Yield Corporate Bonds",
        "citation": "Rule 144A",
        "tax_status": "taxable",
        "summary": "Sponsor-backed / LBO / dividend recap; covenant package; call schedule.",
    },
    "taxable_real_estate_pp": {
        "label": "Taxable Real Estate-Backed Bonds (Private Placement)",
        "citation": "Rule 506 / 144A",
        "tax_status": "taxable",
        "summary": "Hotels, market-rate multifamily, CMBS-adjacent; DSCR-driven.",
    },
    "taxable_lease_backed": {
        "label": "Taxable Lease-Backed Bonds (CMBS-Adjacent, Private Placement)",
        "citation": "Rule 144A",
        "tax_status": "taxable",
        "summary": "Long-term tenant leases (data centers); tenant credit drives pricing.",
    },
    "fha_232_wrap": {
        "label": "FHA Section 232 Insured / Wrap (Senior Living)",
        "citation": "12 USC §1715w",
        "tax_status": "credit_enhancement_overlay",
        "summary": "FHA insurance for skilled nursing / assisted living / intermediate care; can wrap tax-exempt or taxable.",
    },
    "fha_242_wrap": {
        "label": "FHA Section 242 Insured / Wrap (Hospitals)",
        "citation": "12 USC §1715z-7",
        "tax_status": "credit_enhancement_overlay",
        "summary": "FHA insurance for hospital projects; produces near-AAA ratings.",
    },
    "fha_221d4_or_223f": {
        "label": "FHA 221(d)(4) (new construction) / 223(f) (refi) Wrap",
        "citation": "12 USC §1715l / §1715n",
        "tax_status": "credit_enhancement_overlay",
        "summary": "FHA insurance for multifamily; can wrap taxable or tax-exempt structures.",
    },
    "restructured_or_dip": {
        "label": "Restructured Bonds / DIP Financing",
        "citation": "11 USC §364 (DIP) / indenture amendment",
        "tax_status": "varies",
        "summary": "Workout / distressed; bondholder consents required; specialty counsel.",
    },
}


# =====================================================================
# DATA — Appendix A Decision Rows (Bond Type Decision Table)
# =====================================================================
#
# Each row = one literal cell from Appendix A (Operating Framework lines
# 10300-10319). Stored as data so the lookup can reason over them without
# inference. Borrower types are the canonical strings the form should pass.
#
# Source: Operating Framework v1, Appendix A. Row index matches the order
# of appearance in the source table for traceability.
APPENDIX_A_ROWS: list[dict[str, Any]] = [
    # Row 1: 501(c)(3) hospital — new construction / expansion
    {
        "row_id": "A1",
        "borrower_types": ["501c3_nonprofit"],
        "project_types": ["new_construction", "expansion"],
        "sectors": ["healthcare_services"],
        "preferred_bond_type": "tax_exempt_501c3",
        "alternative_bond_types": ["fha_242_wrap"],
        "rationale": "501(c)(3) hospital new build → tax-exempt revenue bonds under IRC §145; 30yr tenor; revenue pledge. FHA 242 wrap available if rating uplift needed.",
        "considerations": "Rated through Moody's/S&P; revenue pledge of hospital operating revenues; 30-year tenor typical.",
    },
    # Row 2: 501(c)(3) hospital — refunding
    {
        "row_id": "A2",
        "borrower_types": ["501c3_nonprofit"],
        "project_types": ["refunding"],
        "sectors": ["healthcare_services"],
        "preferred_bond_type": "tax_exempt_501c3",
        "alternative_bond_types": ["taxable_corporate"],
        "rationale": "Current refunding (within 90 days of call) keeps §145 tax-exempt treatment. Taxable advance refunding only outside the 90-day window (TCJA 2017 eliminated tax-exempt advance refunding).",
        "considerations": "NPV savings analysis required; current vs advance refunding window.",
    },
    # Row 3: 501(c)(3) CCRC — new construction / expansion
    {
        "row_id": "A3",
        "borrower_types": ["501c3_nonprofit"],
        "project_types": ["new_construction", "expansion"],
        "sectors": ["senior_living"],
        "preferred_bond_type": "tax_exempt_501c3",
        "alternative_bond_types": ["fha_232_wrap"],
        "rationale": "501(c)(3) CCRC new build → tax-exempt revenue bonds; entry-fee model drives DSCR; KBRA / Fitch active in sector.",
        "considerations": "Entry-fee model drives debt service capacity; KBRA or Fitch often used; 30-year tenor.",
    },
    # Row 4: For-profit senior living — new / expansion
    {
        "row_id": "A4",
        "borrower_types": ["for_profit"],
        "project_types": ["new_construction", "expansion"],
        "sectors": ["senior_living"],
        "preferred_bond_type": "taxable_real_estate_pp",
        "alternative_bond_types": ["fha_232_wrap"],
        "rationale": "For-profit operator cannot use §145; taxable bonds with sponsor balance-sheet credit; FHA 232 wrap available.",
        "considerations": "Sponsor balance sheet credit underwriting; cash flow waterfall; sponsor equity 20%+.",
    },
    # Row 5: 501(c)(3) charter school — new construction / acquisition
    {
        "row_id": "A5",
        "borrower_types": ["501c3_nonprofit"],
        "project_types": ["new_construction", "acquisition"],
        "sectors": ["education_charter"],
        "preferred_bond_type": "tax_exempt_501c3",
        "alternative_bond_types": [],
        "rationale": "Charter schools issued as 501(c)(3) conduit revenue bonds; per-pupil funding flow; charter renewal risk priced.",
        "considerations": "Per-pupil state funding flow; charter renewal risk; KBRA dominant rating agency for sector.",
    },
    # Row 6: 501(c)(3) college / university
    {
        "row_id": "A6",
        "borrower_types": ["501c3_nonprofit"],
        "project_types": ["new_construction", "expansion", "refunding"],
        "sectors": ["education_higher"],
        "preferred_bond_type": "tax_exempt_501c3",
        "alternative_bond_types": ["tax_exempt_governmental"],
        "rationale": "501(c)(3) higher ed → §145 revenue bonds; state HFA conduit available; endowment-backed credit.",
        "considerations": "Endowment-driven credit; demographics and enrollment trends; long tenor (30+ years).",
    },
    # Row 7: For-profit affordable housing — new construction
    {
        "row_id": "A7",
        "borrower_types": ["for_profit"],
        "project_types": ["new_construction"],
        "sectors": ["real_estate"],
        "preferred_bond_type": "tax_exempt_pab_142d",
        "alternative_bond_types": ["fha_221d4_or_223f"],
        "rationale": "Affordable rental PAB under IRC §142(d) paired with 4% LIHTC equity; volume cap allocation required.",
        "considerations": "Volume cap allocation; 20/50 or 40/60 test; bifurcated taxable/tax-exempt structure common.",
        "additional_filters": {"property_type": "affordable_multifamily"},
    },
    # Row 8: For-profit market-rate multifamily
    {
        "row_id": "A8",
        "borrower_types": ["for_profit"],
        "project_types": ["new_construction", "refinancing"],
        "sectors": ["real_estate"],
        "preferred_bond_type": "taxable_real_estate_pp",
        "alternative_bond_types": ["fha_221d4_or_223f"],
        "rationale": "Market-rate multifamily does not qualify for §142(d); taxable real estate PP; possible FHA wrap.",
        "considerations": "DSCR 1.20x+; debt yield 8-12%; sponsor equity 20-30%.",
        "additional_filters": {"property_type": "market_rate_multifamily"},
    },
    # Row 9: For-profit hotel
    {
        "row_id": "A9",
        "borrower_types": ["for_profit"],
        "project_types": ["new_construction", "repositioning"],
        "sectors": ["hospitality"],
        "preferred_bond_type": "taxable_real_estate_pp",
        "alternative_bond_types": [],
        "rationale": "Hotels are taxable real estate-backed bonds (private placement); cash flow sweep at low DSCR.",
        "considerations": "Sponsor equity 25-35%; brand and franchise considerations.",
    },
    # Row 10: For-profit data center
    {
        "row_id": "A10",
        "borrower_types": ["for_profit"],
        "project_types": ["new_construction", "refinancing"],
        "sectors": ["data_centers"],
        "preferred_bond_type": "taxable_lease_backed",
        "alternative_bond_types": [],
        "rationale": "Data centers funded as lease-backed bonds (CMBS-adjacent); tenant credit drives pricing.",
        "considerations": "Lease quality and tenant credit drive pricing; long-term contracts preferred.",
    },
    # Row 11: Investment-grade C&I corporate
    {
        "row_id": "A11",
        "borrower_types": ["for_profit"],
        "project_types": ["working_capital", "ma", "refinancing"],
        "sectors": ["industrial_manufacturing", "business_services", "consumer_products", "distribution"],
        "preferred_bond_type": "taxable_corporate",
        "alternative_bond_types": [],
        "rationale": "Investment-grade corporate borrower → public 144A or registered taxable bonds.",
        "considerations": "Investment grade rating; 5-30 year tenor; bullet at maturity typical.",
        "additional_filters": {"credit_grade": "investment_grade"},
    },
    # Row 12: High-yield / sponsor-backed corporate
    {
        "row_id": "A12",
        "borrower_types": ["for_profit"],
        "project_types": ["acquisition", "dividend_recap", "refinancing"],
        "sectors": ["industrial_manufacturing", "business_services", "consumer_products", "distribution"],
        "preferred_bond_type": "taxable_high_yield",
        "alternative_bond_types": [],
        "rationale": "Sponsor-backed or sub-IG credit → high-yield 144A bonds with covenant package.",
        "considerations": "Sponsor-backed credit; significant covenant package; equity claw; call schedule.",
        "additional_filters": {"credit_grade": "sub_investment_grade"},
    },
    # Row 13: Small manufacturer — manufacturing facility
    {
        "row_id": "A13",
        "borrower_types": ["for_profit"],
        "project_types": ["new_construction", "equipment"],
        "sectors": ["industrial_manufacturing"],
        "preferred_bond_type": "tax_exempt_qsib_manufacturing",
        "alternative_bond_types": ["taxable_corporate"],
        "rationale": "Qualified small-issue manufacturing PAB under IRC §144(a) — up to $10M per project; AMT applies.",
        "considerations": "Volume cap allocation; manufacturing facility limitations; AMT applies.",
        "additional_filters": {"project_size_max": 10_000_000},
    },
    # Row 14: Solid waste / sewage (private)
    {
        "row_id": "A14",
        "borrower_types": ["for_profit", "501c3_nonprofit"],
        "project_types": ["new_construction", "expansion"],
        "sectors": ["solid_waste", "utilities_sewage"],
        "preferred_bond_type": "tax_exempt_pab_142",
        "alternative_bond_types": ["taxable_real_estate_pp"],
        "rationale": "Exempt facility PAB under IRC §142 for solid waste / sewage facility categories.",
        "considerations": "Facility category compliance; volume cap if PAB.",
    },
    # Row 15: Airport
    {
        "row_id": "A15",
        "borrower_types": ["governmental", "for_profit"],
        "project_types": ["new_construction", "expansion"],
        "sectors": ["transportation_airport"],
        "preferred_bond_type": "tax_exempt_pab_142",
        "alternative_bond_types": ["tax_exempt_governmental"],
        "rationale": "Airport facility — PAB under IRC §142 (private) or governmental purpose bonds (public). AMT considerations.",
        "considerations": "Governmental vs PAB structure; AMT considerations.",
    },
    # Row 16: State / local government
    {
        "row_id": "A16",
        "borrower_types": ["governmental"],
        "project_types": ["public_infrastructure", "general_budget"],
        "sectors": ["utilities_water", "utilities_sewage", "utilities_power", "transportation_airport"],
        "preferred_bond_type": "tax_exempt_governmental",
        "alternative_bond_types": [],
        "rationale": "Governmental purpose bonds (GO or revenue) — no volume cap; no AMT.",
        "considerations": "Full faith and credit pledge vs revenue pledge; no volume cap; no AMT.",
    },
    # Row 17: State HFA — single-family / multifamily
    {
        "row_id": "A17",
        "borrower_types": ["state_hfa"],
        "project_types": ["new_construction", "mortgage_program"],
        "sectors": ["real_estate"],
        "preferred_bond_type": "tax_exempt_qmb_single_family",
        "alternative_bond_types": ["tax_exempt_pab_142d"],
        "rationale": "State HFAs issue QMBs for first-time homebuyer programs (single-family) or §142(d) PABs for multifamily.",
        "considerations": "Volume cap allocation; moral obligation pledge common.",
    },
    # Row 18: Tribal economic development
    {
        "row_id": "A18",
        "borrower_types": ["tribal"],
        "project_types": ["economic_development"],
        "sectors": [],  # any sector
        "preferred_bond_type": "tax_exempt_tribal",
        "alternative_bond_types": [],
        "rationale": "Federally recognized tribes can issue tax-exempt economic development bonds under IRC §7871.",
        "considerations": "Tribe-specific allocation under IRC §7871.",
    },
    # Row 19: Distressed obligor
    {
        "row_id": "A19",
        "borrower_types": ["for_profit", "501c3_nonprofit", "governmental"],
        "project_types": ["restructuring", "workout"],
        "sectors": [],  # any sector
        "preferred_bond_type": "restructured_or_dip",
        "alternative_bond_types": [],
        "rationale": "Restructured exchange offer or DIP financing; bondholder consents required; specialty workout counsel.",
        "considerations": "Sector-specific; bondholder consents required; specialized workout counsel.",
        "additional_filters": {"distressed": True},
    },
]


# =====================================================================
# DATA — Document Inventory (Bible Silo 4)
# =====================================================================
#
# Each document carries:
#   id              — stable internal id
#   label           — human label
#   category        — Bible Silo 4 group (master | security | marketing |
#                     opinion | operational | closing_cert | public_filing |
#                     financials | feasibility | environmental | property |
#                     regulatory | sector_specific)
#   bible_section   — exact subsection of Silo 4 where the doc is defined
#   established_by  — party who signs/produces (per Bible)
#   drafted_by      — party who drafts (per Bible)
#   when            — when in the lifecycle the doc is produced
#   required_for    — deal intents for which the doc is required
#   bond_types      — bond_type keys the doc applies to ([] = all)
#   sectors         — sector keys the doc applies to ([] = all)
#
# Source: Bible_Pass1_v2.md Silo 4 (lines 1261-1672). Stage 1 ingestion list
# (lines 793, 7163) confirms feasibility/market study/pro forma/audited
# financials as the canonical Stage-1 sponsor package.
DOCUMENT_INVENTORY: list[dict[str, Any]] = [
    # --- Master transaction documents (Bible §4.1) ---
    {
        "id": "trust_indenture",
        "label": "Trust Indenture",
        "category": "master",
        "bible_section": "Silo 4 §4.1 Trust Indenture",
        "established_by": "Issuer + Trustee",
        "drafted_by": "Bond counsel (from Nest first draft)",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "equipment", "working_capital", "ma", "mortgage_program", "public_infrastructure", "general_budget", "restructuring", "workout", "economic_development", "dividend_recap"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "loan_agreement_conduit",
        "label": "Loan Agreement (Conduit Deals)",
        "category": "master",
        "bible_section": "Silo 4 §4.1 Loan Agreement (Conduit Deals)",
        "established_by": "Conduit issuer + Obligor",
        "drafted_by": "Bond counsel",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing"],
        # Conduit structure applies to all tax-exempt non-governmental bond types
        "bond_types": [
            "tax_exempt_501c3",
            "tax_exempt_pab_142",
            "tax_exempt_pab_142d",
            "tax_exempt_qsib_manufacturing",
        ],
        "sectors": [],
    },
    {
        "id": "tax_regulatory_agreement",
        "label": "Tax Regulatory Agreement",
        "category": "master",
        "bible_section": "Silo 4 §4.1 Tax Regulatory Agreement",
        "established_by": "Obligor (and issuer in some cases)",
        "drafted_by": "Bond counsel",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "mortgage_program", "public_infrastructure", "general_budget", "economic_development"],
        # Only tax-exempt deals carry a TRA
        "bond_types": [
            "tax_exempt_501c3",
            "tax_exempt_governmental",
            "tax_exempt_pab_142",
            "tax_exempt_pab_142d",
            "tax_exempt_qmb_single_family",
            "tax_exempt_qsib_manufacturing",
            "tax_exempt_tribal",
        ],
        "sectors": [],
    },
    {
        "id": "bond_purchase_agreement",
        "label": "Bond Purchase Agreement (BPA)",
        "category": "master",
        "bible_section": "Silo 4 §4.1 Bond Purchase Agreement",
        "established_by": "Issuer (+ Obligor on conduit) + Underwriter",
        "drafted_by": "Underwriter's counsel (reviewed by bond counsel)",
        "when": "pricing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "equipment", "working_capital", "ma", "mortgage_program", "public_infrastructure", "general_budget", "restructuring", "economic_development", "dividend_recap"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "regulatory_agreement_sector",
        "label": "Regulatory Agreement (Sector-Specific)",
        "category": "regulatory",
        "bible_section": "Silo 4 §4.1 Regulatory Agreement (Sector-Specific)",
        "established_by": "Obligor + Regulator (state HFA, charter authorizer, etc.)",
        "drafted_by": "Regulator's counsel or specialty counsel",
        "when": "closing",
        "required_for": ["new_construction", "acquisition", "refunding"],
        "bond_types": ["tax_exempt_pab_142d", "tax_exempt_501c3"],
        "sectors": ["real_estate", "education_charter"],
    },
    # --- Security documents (Bible §4.2) ---
    {
        "id": "mortgage_security_agreement",
        "label": "Mortgage and Security Agreement",
        "category": "security",
        "bible_section": "Silo 4 §4.2 Mortgage and Security Agreement",
        "established_by": "Obligor (grantor) → Trustee (grantee for bondholders)",
        "drafted_by": "Bond counsel + obligor's real estate counsel",
        "when": "closing (recorded immediately post-closing)",
        "required_for": ["new_construction", "expansion", "acquisition", "refinancing", "repositioning"],
        "bond_types": ["taxable_real_estate_pp", "taxable_lease_backed", "tax_exempt_501c3", "tax_exempt_pab_142d", "fha_221d4_or_223f", "fha_232_wrap", "fha_242_wrap"],
        "sectors": ["senior_living", "healthcare_services", "real_estate", "hospitality", "data_centers", "education_charter", "education_higher"],
    },
    {
        "id": "ucc_filings",
        "label": "UCC Financing Statements (UCC-1)",
        "category": "security",
        "bible_section": "Silo 4 §4.2 UCC Financing Statements",
        "established_by": "Obligor (debtor) → Trustee (secured party)",
        "drafted_by": "Bond counsel",
        "when": "closing (filed immediately)",
        "required_for": ["new_construction", "expansion", "acquisition", "refinancing", "equipment"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "assignment_rents_leases",
        "label": "Assignment of Rents and Leases",
        "category": "security",
        "bible_section": "Silo 4 §4.2 Assignment of Rents and Leases",
        "established_by": "Obligor → Trustee",
        "drafted_by": "Bond counsel",
        "when": "closing (recorded with mortgage)",
        "required_for": ["new_construction", "expansion", "acquisition", "refinancing", "repositioning"],
        "bond_types": ["taxable_real_estate_pp", "taxable_lease_backed", "tax_exempt_pab_142d", "tax_exempt_501c3"],
        "sectors": ["real_estate", "hospitality", "data_centers", "senior_living", "healthcare_services"],
    },
    # --- Marketing documents (Bible §4.3) ---
    {
        "id": "preliminary_official_statement",
        "label": "Preliminary Official Statement (POS)",
        "category": "marketing",
        "bible_section": "Silo 4 §4.3 Preliminary Official Statement",
        "established_by": "Issuer (+ Obligor on conduit)",
        "drafted_by": "Nest platform first draft → disclosure counsel finalizes",
        "when": "released at start of marketing period",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "equipment", "working_capital", "ma", "mortgage_program", "public_infrastructure", "general_budget", "economic_development", "dividend_recap"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "official_statement",
        "label": "Official Statement (OS)",
        "category": "marketing",
        "bible_section": "Silo 4 §4.3 Official Statement",
        "established_by": "Issuer (+ Obligor on conduit)",
        "drafted_by": "Nest platform, finalized by disclosure counsel",
        "when": "finalized at closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "equipment", "working_capital", "ma", "mortgage_program", "public_infrastructure", "general_budget", "economic_development", "dividend_recap"],
        "bond_types": [],
        "sectors": [],
    },
    # --- Opinion documents (Bible §4.4) ---
    {
        "id": "bond_counsel_opinion",
        "label": "Bond Counsel Opinion",
        "category": "opinion",
        "bible_section": "Silo 4 §4.4 Bond Counsel Opinion",
        "established_by": "Bond counsel",
        "drafted_by": "Bond counsel",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "equipment", "working_capital", "ma", "mortgage_program", "public_infrastructure", "general_budget", "economic_development", "restructuring", "dividend_recap"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "borrowers_counsel_opinion",
        "label": "Borrower's Counsel Opinion",
        "category": "opinion",
        "bible_section": "Silo 4 §4.4 Borrower's Counsel Opinion",
        "established_by": "Sponsor's counsel",
        "drafted_by": "Sponsor's counsel",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "equipment", "working_capital", "ma", "economic_development", "dividend_recap"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "comfort_letter",
        "label": "Auditor Comfort Letter (SAS 72)",
        "category": "opinion",
        "bible_section": "Silo 4 §4.4 Comfort Letter",
        "established_by": "Independent auditor",
        "drafted_by": "Auditor",
        "when": "pricing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "working_capital", "ma"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "auditor_consent_letter",
        "label": "Auditor's Consent Letter",
        "category": "opinion",
        "bible_section": "Silo 4 §4.4 Auditor's Consent Letter",
        "established_by": "Independent auditor",
        "drafted_by": "Auditor",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "working_capital", "ma", "economic_development", "dividend_recap"],
        "bond_types": [],
        "sectors": [],
    },
    # --- Operational documents (Bible §4.5) ---
    {
        "id": "continuing_disclosure_agreement",
        "label": "Continuing Disclosure Agreement (CDA — Rule 15c2-12)",
        "category": "operational",
        "bible_section": "Silo 4 §4.5 Continuing Disclosure Agreement",
        "established_by": "Obligor (+ dissemination agent if separate)",
        "drafted_by": "Bond counsel or disclosure counsel",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "mortgage_program", "public_infrastructure", "general_budget", "economic_development"],
        # 15c2-12 applies to municipal bonds — i.e. all tax-exempt categories
        "bond_types": [
            "tax_exempt_501c3",
            "tax_exempt_governmental",
            "tax_exempt_pab_142",
            "tax_exempt_pab_142d",
            "tax_exempt_qmb_single_family",
            "tax_exempt_qsib_manufacturing",
            "tax_exempt_tribal",
        ],
        "sectors": [],
    },
    {
        "id": "construction_disbursement_agreement",
        "label": "Construction Disbursement Agreement",
        "category": "operational",
        "bible_section": "Silo 4 §4.5 Construction Disbursement Agreement",
        "established_by": "Obligor + Trustee + Construction monitor (+ conduit)",
        "drafted_by": "Bond counsel",
        "when": "closing",
        "required_for": ["new_construction", "expansion"],
        "bond_types": [],
        "sectors": [],
    },
    # --- Closing certificates (Bible §4.6) ---
    {
        "id": "officers_certificate",
        "label": "Officer's Certificate (Issuer and Obligor)",
        "category": "closing_cert",
        "bible_section": "Silo 4 §4.6 Officer's Certificate",
        "established_by": "Authorized officer of issuer / obligor",
        "drafted_by": "Bond counsel",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "equipment", "working_capital", "ma", "mortgage_program", "public_infrastructure", "general_budget", "economic_development", "dividend_recap", "restructuring"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "tax_certificate",
        "label": "Tax Certificate (Tax-Exempt Deals)",
        "category": "closing_cert",
        "bible_section": "Silo 4 §4.6 Tax Certificate",
        "established_by": "Obligor (and sometimes issuer)",
        "drafted_by": "Bond counsel",
        "when": "closing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "mortgage_program", "public_infrastructure", "general_budget", "economic_development"],
        "bond_types": [
            "tax_exempt_501c3",
            "tax_exempt_governmental",
            "tax_exempt_pab_142",
            "tax_exempt_pab_142d",
            "tax_exempt_qmb_single_family",
            "tax_exempt_qsib_manufacturing",
            "tax_exempt_tribal",
        ],
        "sectors": [],
    },
    # --- Public filings (Bible §4.7) ---
    {
        "id": "irs_form_8038",
        "label": "IRS Form 8038 / 8038-G",
        "category": "public_filing",
        "bible_section": "Silo 4 §4.7 IRS Form 8038 / 8038-G",
        "established_by": "Issuer",
        "drafted_by": "Bond counsel",
        "when": "post-closing (within IRS deadline)",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "mortgage_program", "public_infrastructure", "general_budget", "economic_development"],
        "bond_types": [
            "tax_exempt_501c3",
            "tax_exempt_governmental",
            "tax_exempt_pab_142",
            "tax_exempt_pab_142d",
            "tax_exempt_qmb_single_family",
            "tax_exempt_qsib_manufacturing",
            "tax_exempt_tribal",
        ],
        "sectors": [],
    },
    {
        "id": "emma_filings",
        "label": "EMMA Filings (OS + Continuing Disclosure)",
        "category": "public_filing",
        "bible_section": "Silo 4 §4.7 EMMA Filings",
        "established_by": "Obligor / dissemination agent",
        "drafted_by": "Nest platform automation",
        "when": "post-closing + ongoing",
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "mortgage_program", "public_infrastructure", "general_budget", "economic_development"],
        "bond_types": [
            "tax_exempt_501c3",
            "tax_exempt_governmental",
            "tax_exempt_pab_142",
            "tax_exempt_pab_142d",
            "tax_exempt_qmb_single_family",
            "tax_exempt_qsib_manufacturing",
            "tax_exempt_tribal",
        ],
        "sectors": [],
    },
    # --- Sponsor / underwriting inputs (Stage 1 ingestion list, Bible §3 + §4.3 appendices) ---
    {
        "id": "audited_financials",
        "label": "Audited Financial Statements",
        "category": "financials",
        "bible_section": "Silo 4 §4.3 (appendix to POS); Stage 1 ingestion (Bible line 793)",
        "established_by": "Obligor / sponsor",
        "drafted_by": "Independent auditor",
        "when": "Stage 1 (intake)",
        "lookback_years": 3,
        "required_for": ["new_construction", "expansion", "acquisition", "refunding", "refinancing", "repositioning", "ma", "working_capital", "dividend_recap"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "sponsor_proforma",
        "label": "Sponsor Pro Forma (10yr)",
        "category": "financials",
        "bible_section": "Stage 1 ingestion (Bible line 793, line 7163)",
        "established_by": "Sponsor",
        "drafted_by": "Sponsor / financial advisor",
        "when": "Stage 1 (intake)",
        "required_for": ["new_construction", "expansion", "acquisition", "refinancing", "ma"],
        "bond_types": [],
        "sectors": [],
    },
    {
        "id": "feasibility_study",
        "label": "Feasibility Study",
        "category": "feasibility",
        "bible_section": "Silo 2 §2.14 Feasibility Consultant; Silo 4 §4.3 (appendix to POS)",
        "established_by": "Sector-specialist feasibility consultant",
        "drafted_by": "Feasibility consultant",
        "when": "Stage 1 (intake) → finalized for POS",
        "required_for": ["new_construction", "expansion", "repositioning"],
        # New / greenfield deals only. Refundings & stabilized refis use a market study instead.
        "bond_types": [],
        # Required (by Bible §2.14) where the project is new / greenfield. Limited to
        # sectors where the framework explicitly names feasibility specialists (App. E).
        "sectors": ["senior_living", "healthcare_services", "education_charter", "education_higher", "real_estate", "hospitality", "data_centers", "solid_waste"],
    },
    {
        "id": "market_study",
        "label": "Market Study",
        "category": "feasibility",
        "bible_section": "Silo 2 §2.15 Market Study Consultant",
        "established_by": "Market study consultant",
        "drafted_by": "Market study consultant (CBRE / JLL / Cushman / Newmark or specialty)",
        "when": "Stage 1 (intake)",
        "required_for": ["new_construction", "expansion", "acquisition", "refinancing", "repositioning"],
        "bond_types": [],
        "sectors": ["real_estate", "hospitality", "senior_living", "data_centers"],
    },
    {
        "id": "phase_i_environmental",
        "label": "Phase I Environmental Site Assessment",
        "category": "environmental",
        "bible_section": "Operating Framework Appx F.6 (Stabilized) — environmental Phase I required for real estate-backed deals",
        "established_by": "Environmental consultant",
        "drafted_by": "Environmental consultant",
        "when": "Stage 1 / underwriting",
        "required_for": ["new_construction", "expansion", "acquisition", "refinancing", "repositioning"],
        "bond_types": ["taxable_real_estate_pp", "taxable_lease_backed", "tax_exempt_pab_142d", "fha_221d4_or_223f", "fha_232_wrap", "fha_242_wrap", "tax_exempt_501c3"],
        "sectors": ["real_estate", "hospitality", "senior_living", "healthcare_services", "data_centers", "education_charter", "education_higher", "solid_waste"],
    },
    {
        "id": "property_condition_assessment",
        "label": "Property Condition Assessment (PCA)",
        "category": "property",
        "bible_section": "Operating Framework Appx F.6 (Stabilized)",
        "established_by": "Engineering consultant",
        "drafted_by": "Engineering consultant",
        "when": "Stage 1 / underwriting",
        "required_for": ["acquisition", "refinancing", "repositioning"],
        "bond_types": ["taxable_real_estate_pp", "taxable_lease_backed", "tax_exempt_pab_142d", "fha_221d4_or_223f"],
        "sectors": ["real_estate", "hospitality", "data_centers", "senior_living"],
    },
    {
        "id": "appraisal",
        "label": "MAI Appraisal",
        "category": "property",
        "bible_section": "Operating Framework Appx F.6 (Stabilized); Silo 2 (real estate diligence)",
        "established_by": "MAI-designated appraiser",
        "drafted_by": "Appraiser",
        "when": "Stage 1 / underwriting",
        "required_for": ["new_construction", "expansion", "acquisition", "refinancing", "repositioning"],
        "bond_types": ["taxable_real_estate_pp", "taxable_lease_backed", "tax_exempt_pab_142d", "fha_221d4_or_223f", "fha_232_wrap"],
        "sectors": ["real_estate", "hospitality", "senior_living", "healthcare_services", "data_centers"],
    },
    # --- Sector-specific documents (Bible §4.1 Regulatory Agreement narrative) ---
    {
        "id": "charter_authorizer_agreement",
        "label": "Charter Authorizer Agreement",
        "category": "sector_specific",
        "bible_section": "Silo 4 §4.1 Regulatory Agreement (charter school example)",
        "established_by": "Obligor + charter authorizer (state board)",
        "drafted_by": "Specialty counsel",
        "when": "Stage 1 / closing",
        "required_for": ["new_construction", "expansion", "acquisition"],
        "bond_types": ["tax_exempt_501c3"],
        "sectors": ["education_charter"],
    },
    {
        "id": "lihtc_partnership_documents",
        "label": "LIHTC Limited Partnership / Investor Documents",
        "category": "sector_specific",
        "bible_section": "Silo 4 §4.1 Regulatory Agreement (affordable housing example)",
        "established_by": "Sponsor + LIHTC investor",
        "drafted_by": "Sponsor / tax credit counsel",
        "when": "Stage 1 / closing",
        "required_for": ["new_construction", "acquisition"],
        "bond_types": ["tax_exempt_pab_142d"],
        "sectors": ["real_estate"],
    },
    {
        "id": "healthcare_licensure_evidence",
        "label": "Healthcare Licensure & Certificate of Need (CON)",
        "category": "sector_specific",
        "bible_section": "Silo 4 §4.1 Regulatory Agreement (healthcare licensure covenants)",
        "established_by": "Obligor",
        "drafted_by": "Obligor / specialty counsel",
        "when": "Stage 1",
        "required_for": ["new_construction", "expansion", "acquisition"],
        "bond_types": ["tax_exempt_501c3", "taxable_real_estate_pp", "fha_242_wrap", "fha_232_wrap"],
        "sectors": ["healthcare_services", "senior_living"],
    },
]


# =====================================================================
# DATA — Feasibility Study Profiles by Sector (App. E + Bible §2.14)
# =====================================================================
#
# Source for consultants: Operating Framework Appendix E (lines 10489-10503).
# Source for methodology references: published rating agency criteria
# (general industry knowledge — agency names only; specific criteria docs
# referenced where the Operating Framework names them).
FEASIBILITY_STUDY_PROFILES: dict[str, dict[str, Any]] = {
    "senior_living": {
        "required": True,
        "study_type": "ccrc_market_demand_study",
        # Bible §2.14 explicitly names Dixon Hughes Goodman, PMD Advisors, CLA;
        # Operating Framework App. E adds Kaufman Hall, Plante Moran, Ziegler,
        # SmithGroup, Continuum Development Services.
        "consultant_types": [
            "Dixon Hughes Goodman",
            "Plante Moran",
            "CliftonLarsonAllen",
            "Ziegler",
            "Kaufman Hall",
            "SmithGroup",
            "Continuum Development Services",
            "PMD Advisors",
        ],
        "sections_required": [
            "market_demand",
            "competition_analysis",
            "financial_projections",
            "occupancy_ramp",
            "entrance_fee_velocity",
            "demographic_penetration",
            "monthly_service_fees",
        ],
        "agency_methodology_refs": [
            "Fitch CCRC Rating Criteria",
            "S&P Senior Living Sector Criteria",
            "KBRA Senior Living Methodology",
        ],
    },
    "healthcare_services": {
        "required": True,
        "study_type": "hospital_financial_feasibility",
        # Operating Framework App. E: Kaufman Hall, Crowe, BDO, Vizient, ECG.
        # Bible §2.14: Kaufman Hall, Ponder & Co., ECG.
        "consultant_types": [
            "Kaufman Hall",
            "Crowe",
            "BDO USA",
            "Vizient Advisory Solutions",
            "ECG Management Consultants",
            "Ponder & Co.",
        ],
        "sections_required": [
            "service_area_demographics",
            "utilization_projections",
            "payor_mix_analysis",
            "financial_projections",
            "physician_alignment",
            "competitive_landscape",
        ],
        "agency_methodology_refs": [
            "Moody's Not-For-Profit Healthcare Methodology",
            "S&P Public Finance Healthcare Criteria",
            "Fitch Not-for-Profit Hospitals Criteria",
        ],
    },
    "education_charter": {
        "required": True,
        "study_type": "charter_school_enrollment_demand_study",
        # Operating Framework App. E: EdTec, Charter School Capital, Building Hope, IFF.
        # Bible §2.14: Public Impact, Bellwether Education.
        "consultant_types": [
            "EdTec",
            "Charter School Capital",
            "Building Hope",
            "IFF",
            "Public Impact",
            "Bellwether Education",
        ],
        "sections_required": [
            "enrollment_projections",
            "wait_list_analysis",
            "academic_performance",
            "charter_renewal_track_record",
            "per_pupil_funding_projections",
            "competitive_school_landscape",
        ],
        "agency_methodology_refs": [
            "KBRA Charter School Methodology",
            "S&P Public Finance Charter School Criteria",
        ],
    },
    "education_higher": {
        "required": True,
        "study_type": "higher_education_demand_study",
        "consultant_types": [
            "Kaufman Hall",
            "EAB",
            "Huron Consulting",
        ],
        "sections_required": [
            "enrollment_projections",
            "tuition_pricing_analysis",
            "demographic_trends",
            "endowment_analysis",
            "competitive_position",
        ],
        "agency_methodology_refs": [
            "Moody's Higher Education Methodology",
            "S&P Public Finance Higher Education Criteria",
        ],
    },
    "real_estate": {
        # Market study is the canonical artifact; feasibility only for greenfield
        "required": False,
        "study_type": "real_estate_market_study",
        "consultant_types": [
            "Novogradac",
            "Reznick Group",
            "CohnReznick",
            "Plante Moran",
            "CBRE",
            "JLL",
            "Cushman & Wakefield",
            "Newmark",
        ],
        "sections_required": [
            "submarket_supply_demand",
            "comparable_rents",
            "absorption_projections",
            "demographic_analysis",
        ],
        "agency_methodology_refs": [
            "S&P Public Finance Affordable Housing Criteria",
            "Moody's US Multifamily Housing Methodology",
        ],
    },
    "hospitality": {
        "required": True,
        "study_type": "hotel_feasibility_study",
        "consultant_types": [
            "STR Inc.",
            "HVS",
            "CBRE Hotels Advisory",
            "Pinnacle Advisory Group",
        ],
        "sections_required": [
            "submarket_occupancy_adr",
            "comp_set_revpar",
            "brand_franchise_analysis",
            "stabilized_pro_forma",
        ],
        "agency_methodology_refs": [
            "S&P CMBS Hotel Criteria",
            "Fitch US Hotel Criteria",
        ],
    },
    "data_centers": {
        "required": True,
        "study_type": "data_center_feasibility_study",
        "consultant_types": [
            "Cushman & Wakefield Data Center Advisory",
            "JLL Data Centers",
            "CBRE Data Center Solutions",
        ],
        "sections_required": [
            "tenant_credit_analysis",
            "lease_structure",
            "submarket_power_water",
            "build_cost_benchmarking",
        ],
        "agency_methodology_refs": [
            "S&P Single-Tenant CMBS Criteria",
            "KBRA Data Center Methodology",
        ],
    },
    "solid_waste": {
        "required": True,
        "study_type": "solid_waste_facility_engineering_feasibility",
        "consultant_types": [
            "SCS Engineers",
            "GBB Solid Waste Management Consultants",
            "HDR Engineering",
        ],
        "sections_required": [
            "tonnage_projections",
            "tipping_fee_analysis",
            "permitting_status",
            "remaining_airspace",
        ],
        "agency_methodology_refs": [
            "S&P Public Finance Solid Waste Criteria",
        ],
    },
    # Sectors below: no feasibility study required by default
    "industrial_manufacturing": {"required": False},
    "business_services": {"required": False},
    "consumer_products": {"required": False},
    "distribution": {"required": False},
    "utilities_water": {"required": False},
    "utilities_sewage": {"required": False},
    "utilities_power": {"required": False},
    "transportation_airport": {"required": False},
}


# =====================================================================
# Engine
# =====================================================================
class NaicsRulesEngine:
    """Deterministic NAICS → bond type → documents → feasibility lookup."""

    # --------- public surface ---------
    def lookup(
        self,
        naics_code: str,
        deal_intent: str,
        borrower_type: str,
        state: str | None = None,
    ) -> dict[str, Any]:
        """Full lookup. Returns the result envelope documented in the module docstring."""
        naics_entry = NAICS_CROSS_REFERENCE.get(naics_code)
        if not naics_entry:
            return {
                "naics_code": naics_code,
                "naics_label": None,
                "sector": None,
                "eligible_bond_types": [],
                "required_documents": [],
                "feasibility_study_profile": {"required": False},
                "operating_framework_refs": [],
                "error": f"NAICS {naics_code} is not in Operating Framework v1 Appendix C",
                "omission_reason": NAICS_OMITTED_FROM_APPENDIX_C.get(naics_code),
            }

        sector = naics_entry["sector"]

        eligible = self._match_bond_types(
            sector=sector,
            deal_intent=deal_intent,
            borrower_type=borrower_type,
            naics_code=naics_code,
            state=state,
        )

        # Required documents = union over the eligible bond_types,
        # gated by sector + deal intent.
        preferred_types = [b["type"] for b in eligible if b["preferred"] is True]
        all_types = [b["type"] for b in eligible]
        # Build doc list from the preferred type when available; otherwise fall back
        # to the union of all eligible.
        doc_basis = preferred_types or all_types
        required_documents = self._documents_for(
            bond_types=doc_basis,
            sector=sector,
            deal_intent=deal_intent,
        )

        feas_profile = self._feasibility_profile(sector=sector, deal_intent=deal_intent)

        framework_refs = [
            f"Appendix C entry for {naics_code} (sector={sector})",
        ]
        framework_refs += [f"Appendix A row {row_id}" for row_id in self._matched_row_ids(
            sector=sector,
            deal_intent=deal_intent,
            borrower_type=borrower_type,
            naics_code=naics_code,
            state=state,
        )]
        framework_refs.append("Bible Silo 4 — The Documents (full document inventory)")

        return {
            "naics_code": naics_code,
            "naics_label": naics_entry["label"],
            "sector": sector,
            "eligible_bond_types": eligible,
            "required_documents": required_documents,
            "feasibility_study_profile": feas_profile,
            "operating_framework_refs": framework_refs,
        }

    def all_bond_types(self) -> list[dict[str, Any]]:
        """Return every canonical bond type known to the engine."""
        out = []
        for key, payload in BOND_TYPES.items():
            entry = {"type": key}
            entry.update(payload)
            out.append(entry)
        return out

    def documents_for_bond_type(self, bond_type: str) -> list[dict[str, Any]]:
        """Return every document the engine knows about that applies to a bond type."""
        return self._documents_for(
            bond_types=[bond_type],
            sector=None,
            deal_intent=None,
        )

    def naics_list(self) -> list[dict[str, Any]]:
        """Return every NAICS code the engine knows + the omitted codes for transparency."""
        covered = []
        for code, entry in NAICS_CROSS_REFERENCE.items():
            covered.append({
                "naics_code": code,
                "label": entry["label"],
                "sector": entry["sector"],
                "appendix_c_row": entry["appendix_c_row"],
                "covered": True,
            })
        omitted = [
            {"naics_code": code, "covered": False, "omission_reason": reason}
            for code, reason in NAICS_OMITTED_FROM_APPENDIX_C.items()
        ]
        return covered + omitted

    # --------- internal helpers ---------
    def _match_bond_types(
        self,
        *,
        sector: str,
        deal_intent: str,
        borrower_type: str,
        naics_code: str,
        state: str | None,
    ) -> list[dict[str, Any]]:
        """Walk Appendix A rows and return the eligible bond types as
        ordered: preferred first, then alternatives. Each entry carries
        preferred flag, rationale, source row, and ambiguity flag.
        """
        matches: list[tuple[dict[str, Any], dict[str, Any]]] = []
        for row in APPENDIX_A_ROWS:
            if borrower_type not in row["borrower_types"]:
                continue
            if deal_intent not in row["project_types"]:
                continue
            row_sectors = row["sectors"]
            if row_sectors and sector not in row_sectors:
                continue
            matches.append((row, row))

        if not matches:
            return []

        # Collapse matches → bond type list. Preferred wins ties.
        results: dict[str, dict[str, Any]] = {}
        for row, _ in matches:
            preferred_key = row["preferred_bond_type"]
            self._add_bond_type(
                results=results,
                bond_type=preferred_key,
                preferred=True,
                rationale=row["rationale"],
                row_id=row["row_id"],
                considerations=row["considerations"],
            )
            for alt in row.get("alternative_bond_types", []):
                self._add_bond_type(
                    results=results,
                    bond_type=alt,
                    preferred=False,
                    rationale=f"Alternative per Appendix A row {row['row_id']}: {row['rationale']}",
                    row_id=row["row_id"],
                    considerations=row["considerations"],
                )

        # Ambiguity: if more than one row sets a different preferred type for
        # the same (borrower, intent, sector), mark all as preferred=None.
        preferred_keys = {k for k, v in results.items() if v["preferred"] is True}
        if len(preferred_keys) > 1:
            for k in preferred_keys:
                results[k]["preferred"] = None
                results[k]["rationale"] = (
                    f"ambiguous — multiple Appendix A rows match "
                    f"({', '.join(sorted(v['source_row_id'] for v in results.values() if v['preferred'] is None))})"
                )

        ordered = sorted(
            results.values(),
            key=lambda x: (0 if x["preferred"] is True else (1 if x["preferred"] is None else 2)),
        )
        return ordered

    def _add_bond_type(
        self,
        *,
        results: dict[str, dict[str, Any]],
        bond_type: str,
        preferred: bool,
        rationale: str,
        row_id: str,
        considerations: str,
    ) -> None:
        if bond_type in results:
            # If the same bond type comes up as both preferred and alternative,
            # preferred wins.
            if preferred and results[bond_type]["preferred"] is False:
                results[bond_type]["preferred"] = True
                results[bond_type]["rationale"] = rationale
                results[bond_type]["source_row_id"] = row_id
            return
        bt_meta = BOND_TYPES.get(bond_type, {"label": bond_type, "citation": "", "tax_status": "", "summary": ""})
        results[bond_type] = {
            "type": bond_type,
            "label": bt_meta["label"],
            "citation": bt_meta["citation"],
            "tax_status": bt_meta["tax_status"],
            "summary": bt_meta["summary"],
            "preferred": preferred,
            "rationale": rationale,
            "source_row_id": row_id,
            "considerations": considerations,
        }

    def _matched_row_ids(
        self,
        *,
        sector: str,
        deal_intent: str,
        borrower_type: str,
        naics_code: str,
        state: str | None,
    ) -> list[str]:
        out = []
        for row in APPENDIX_A_ROWS:
            if borrower_type not in row["borrower_types"]:
                continue
            if deal_intent not in row["project_types"]:
                continue
            row_sectors = row["sectors"]
            if row_sectors and sector not in row_sectors:
                continue
            out.append(row["row_id"])
        return out

    def _documents_for(
        self,
        *,
        bond_types: list[str],
        sector: str | None,
        deal_intent: str | None,
    ) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for doc in DOCUMENT_INVENTORY:
            if doc["bond_types"] and bond_types and not any(bt in doc["bond_types"] for bt in bond_types):
                continue
            if doc["sectors"] and sector is not None and sector not in doc["sectors"]:
                continue
            if deal_intent is not None and deal_intent not in doc["required_for"]:
                continue
            out.append(deepcopy(doc))
        return out

    def _feasibility_profile(self, *, sector: str, deal_intent: str) -> dict[str, Any]:
        profile = deepcopy(FEASIBILITY_STUDY_PROFILES.get(sector, {"required": False}))
        # Feasibility studies are required only for greenfield / expansion /
        # repositioning per Bible §2.14. Refundings and stabilized refis
        # use a market study instead.
        if profile.get("required") and deal_intent not in {"new_construction", "expansion", "repositioning"}:
            profile["required"] = False
            profile["note"] = (
                f"Feasibility study not required for deal_intent={deal_intent}; "
                f"market study + audited financials suffice (Bible §2.14, Op Framework Appx F.6)."
            )
        return profile


# Module-level singleton — instantiate once and import elsewhere.
ENGINE = NaicsRulesEngine()
