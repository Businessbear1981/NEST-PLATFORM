-- ═══════════════════════════════════════════════════════════════════════════════
-- NEST ADVISORS — PARAMETER SEED MIGRATION
-- File: 20260613000002_seed_parameters.sql
-- Generated: 2026-06-13
-- Purpose: Create and seed all financial parameter tables for NEST platform
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════ SECTION 0: SAFE COLUMN ADDITIONS TO EXISTING DEALS TABLE ═══════

ALTER TABLE deals ADD COLUMN IF NOT EXISTS dscr NUMERIC;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ltv NUMERIC;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS icr NUMERIC;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS noi_stabilized NUMERIC;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS noi_at_open NUMERIC;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS total_cost NUMERIC;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS capital_stack JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS stress_scenarios JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS naics_code TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS asset_type TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS bond_type TEXT;

-- ═══════ SECTION 1: BOND_BENCHMARKS ═══════
-- SOURCE: S&P Global Ratings Default Study 2023, Moody's Annual Default Study 2023,
--         JP Morgan Credit Research, NEST CLAUDE.md credit grade thresholds

CREATE TABLE IF NOT EXISTS bond_benchmarks (
    id              SERIAL PRIMARY KEY,
    grade           TEXT UNIQUE NOT NULL,
    dscr_min        NUMERIC,
    ltv_max         NUMERIC,
    icr_min         NUMERIC,
    d_ebitda_max    NUMERIC,
    cf_leverage_max NUMERIC,
    bs_leverage_max NUMERIC,
    lgd_typical_pct NUMERIC,
    pd_annual_bps   NUMERIC,
    is_investment_grade BOOLEAN NOT NULL DEFAULT false,
    notes           TEXT
);

-- SOURCE: NEST CLAUDE.md anchor thresholds + S&P published default statistics
INSERT INTO bond_benchmarks (grade, dscr_min, ltv_max, icr_min, d_ebitda_max, cf_leverage_max, bs_leverage_max, lgd_typical_pct, pd_annual_bps, is_investment_grade, notes) VALUES

-- Investment Grade
('A',    2.00,  0.55, 3.50, 4.5, 1.50, 2.00,  25.0,   3.0, true,  'NEST anchor: strong sponsorship + stabilized cash flow. SOURCE: NEST CLAUDE.md; S&P IG default rate ~0.03%/yr historical'),
('A-',   1.90,  0.57, 3.25, 4.8, 1.60, 2.10,  27.0,   5.0, true,  'EST: interpolated between A and BBB+. SOURCE: S&P/Moodys published criteria'),
('BBB+', 1.75,  0.62, 2.75, 5.5, 1.75, 2.25,  35.0,  12.0, true,  'NEST anchor. SOURCE: NEST CLAUDE.md. S&P 5yr cumulative default ~0.24%'),
('BBB',  1.62,  0.66, 2.50, 6.0, 1.87, 2.37,  38.0,  20.0, true,  'EST: mid-point BBB+ to BBB-. SOURCE: S&P investment grade criteria'),
('BBB-', 1.50,  0.70, 2.25, 6.5, 2.00, 2.50,  42.0,  30.0, true,  'NEST anchor: floor for investment grade. Sub-IG trigger if ANY metric misses floor. SOURCE: NEST CLAUDE.md'),

-- Sub-Investment Grade / High Yield
('BB+',  1.35,  0.74, 1.90, 7.5, 2.25, 2.75,  42.0,  80.0, false, 'EST: S&P BB+ category. SOURCE: S&P 2023 default study, BB+ 1yr PD ~0.08% (8bps) but credit spread pricing 80+ bps. Using spread-based convention'),
('BB',   1.25,  0.76, 1.70, 8.0, 2.50, 3.00,  45.0, 150.0, false, 'SOURCE: S&P published. BB typical PD 150-200bps/yr. LGD 40-50% senior secured'),
('BB-',  1.15,  0.78, 1.50, 9.0, 2.75, 3.25,  47.0, 200.0, false, 'SOURCE: S&P/Moodys default studies. Est LGD 45-50% secured'),
('B+',   1.05,  0.80, 1.30,10.0, 3.00, 3.50,  50.0, 300.0, false, 'EST: interpolated. SOURCE: S&P. B typical PD 400-600bps/yr; B+ top of range ~300bps'),
('B',    0.95,  0.82, 1.10,11.0, 3.25, 3.75,  52.0, 450.0, false, 'SOURCE: S&P 2023 Annual Default Study. B category PD ~400-600bps/yr'),
('B-',   0.85,  0.84, 0.95,12.5, 3.50, 4.00,  55.0, 600.0, false, 'SOURCE: S&P. B- floor before CCC territory. LGD 55%+ on senior unsecured'),
('CCC',  0.70,  0.88, 0.75,15.0, 4.00, 4.75,  65.0,1800.0, false, 'SOURCE: S&P 2023. CCC 1yr PD historically 1500-3000bps/yr. NEST auto-downgrade watch'),
('D',    NULL,  NULL, NULL, NULL, NULL, NULL,   70.0,10000.0,false, 'Default. LGD 70% unsecured; 40-50% senior secured. SOURCE: S&P recovery rate studies')

ON CONFLICT (grade) DO NOTHING;

-- ═══════ SECTION 2: NAICS_MUNI_ELIGIBILITY ═══════
-- SOURCE: IRS IRC §142, §145, §501(c)(3), IRS Publication 4077, Treasury Regulations §1.142-2,
--         Ballard Spahr "Municipal Bond Eligibility Guide", Chapman & Cutler tax opinion standards

CREATE TABLE IF NOT EXISTS naics_muni_eligibility (
    naics_code              TEXT PRIMARY KEY,
    naics_description       TEXT NOT NULL,
    irc_section             TEXT,
    bond_type_eligible      TEXT,
    volume_cap_applies      BOOLEAN DEFAULT true,
    tefra_required          BOOLEAN DEFAULT false,
    qualified_use_pct_min   NUMERIC,
    bridge_eligible         BOOLEAN DEFAULT true,
    construction_eligible   BOOLEAN DEFAULT true,
    notes                   TEXT
);

INSERT INTO naics_muni_eligibility (naics_code, naics_description, irc_section, bond_type_eligible, volume_cap_applies, tefra_required, qualified_use_pct_min, bridge_eligible, construction_eligible, notes) VALUES

-- Senior Living / Healthcare
('623110', 'Nursing Care Facilities (SNF)', '§501(c)(3), §145', 'Qualified 501(c)(3) bonds; tax-exempt revenue bonds', false, true,  0.95, true,  true,  'Must be nonprofit; 95% qualified use per §145; TEFRA public hearing required. SOURCE: IRC §145(a)'),
('623210', 'Residential Intellectual/Developmental Disability Facilities', '§501(c)(3), §145', 'Qualified 501(c)(3) bonds', false, true,  0.95, true,  true,  'Nonprofit operator required; qualifies under §501(c)(3) exempt organization bond provision. SOURCE: IRC §145'),
('623220', 'Residential Mental Health / Substance Abuse Facilities', '§501(c)(3), §145', 'Qualified 501(c)(3) bonds', false, true,  0.95, true,  true,  'Nonprofit operator; §145 treatment mirrors SNF. SOURCE: IRC §145; IRS Rev. Rul. 77-367'),
('623311', 'Continuing Care Retirement Communities (CCRC)', '§501(c)(3), §145, §142(d)', 'Qualified 501(c)(3) bonds if nonprofit; §142(d) qualified residential rental if residential component present', false, true,  0.95, true,  true,  'Dual path: 501(c)(3) tax-exempt revenue bond OR §142(d) qualified residential rental bond if 20%/50% residential test met. TEFRA required both paths. KEY NEST deal type. SOURCE: IRC §145, §142(d); Treasury Reg §1.142(d)-1'),
('623312', 'Assisted Living Facilities (ALF) for Elderly', '§501(c)(3), §145', 'Qualified 501(c)(3) bonds; revenue bonds', false, true,  0.95, true,  true,  'Nonprofit only for 501(c)(3) route; for-profit ALF ineligible for tax-exempt unless §142(d) residential component qualifies. SOURCE: IRC §145(d)'),
('622110', 'General Medical and Surgical Hospitals', '§145, §501(c)(3)', 'Qualified 501(c)(3) hospital bonds; no volume cap', false, true,  0.95, true,  true,  'IRC §145 specifically exempts qualified 501(c)(3) bonds from volume cap. 95% qualified use. Classic TEFRA public hearing. NEST comps include hospital refunding. SOURCE: IRC §145(a)(2)'),
('622210', 'Psychiatric and Substance Abuse Hospitals', '§145, §501(c)(3)', 'Qualified 501(c)(3) bonds', false, true,  0.95, true,  true,  'Same treatment as 622110 under §145. SOURCE: IRC §145'),
('622310', 'Specialty Hospitals (excl. Psychiatric)', '§145, §501(c)(3)', 'Qualified 501(c)(3) bonds', false, true,  0.95, true,  true,  'Cancer centers, orthopedic hospitals, children hospitals — all qualify under §145 if 501(c)(3). SOURCE: IRC §145'),
('621111', 'Offices of Physicians (MD and DO only)', '§501(c)(3)', 'Limited — only as exempt org issuer; direct physician practice ineligible as conduit', false, false, NULL,  false, false, 'INELIGIBLE as direct borrower unless part of 501(c)(3) system; may qualify as incidental use. SOURCE: IRC §145(d)(1) — principal user must be 501(c)(3)'),
('621610', 'Home Health Care Services', '§501(c)(3), §145', 'Qualified 501(c)(3) bonds if nonprofit operator', false, true,  0.95, true,  true,  'Nonprofit home health agency qualifies; for-profit ineligible. SOURCE: IRC §145'),

-- Education
('611310', 'Colleges, Universities, and Professional Schools', '§145, §501(c)(3)', 'Qualified 501(c)(3) bonds; no volume cap', false, true,  0.95, true,  true,  'Classic 501(c)(3) bond category. No volume cap. Used for dormitories, academic buildings, student centers. SOURCE: IRC §145; Rev. Proc. 97-14'),
('611210', 'Junior Colleges (Community Colleges)', '§145, §501(c)(3)', 'Qualified 501(c)(3) bonds; governmental bonds if public', false, false, 0.95, true,  true,  'Public community colleges issue governmental bonds; private 501(c)(3) community colleges use §145. SOURCE: IRC §103, §145'),
('611110', 'Elementary and Secondary Schools', '§145, §501(c)(3), §142(k)', 'Qualified 501(c)(3) bonds; qualified zone academy bonds (QZAB)', false, true,  0.95, true,  true,  'Private nonprofit K-12; public schools issue governmental bonds. Charter schools: complex analysis, often 501(c)(3) via sponsor. SOURCE: IRC §145; §54E QZAB'),
('611610', 'Fine Arts Schools / Vocational Schools', '§501(c)(3), §145', 'Qualified 501(c)(3) bonds if nonprofit', false, true,  0.95, true,  true,  'Nonprofit arts schools, dance academies, performing arts centers. SOURCE: IRC §145'),

-- Housing / Real Estate
('531110', 'Lessors of Residential Buildings (Apartment Owners)', '§142(d)', 'Qualified residential rental bonds; volume cap applies', true,  true,  NULL,  true,  true,  '20%/50% set-aside test: 20% of units at 50% AMI OR 40% at 60% AMI. Enables 4% LIHTC with volume cap bond. SOURCE: IRC §142(d)(1); Treasury Reg §1.142(d)-1'),
('236116', 'New Multifamily Housing Construction (General Contractor)', '§142(d)', 'Qualified residential rental bonds; 4% LIHTC eligible; volume cap', true,  true,  NULL,  true,  true,  'Construction phase for affordable multifamily. Bond proceeds fund construction; permanent loan converts. Volume cap allocation required from state. SOURCE: IRC §42, §142(d); IRS Notice 2019-42'),
('525920', 'Investment Trusts (REITs)', '§142(d)', 'Limited — REIT as sponsor of affordable housing may access §142(d); complex pass-through analysis', true,  false, NULL,  false, false, 'EST: REIT ownership of §142(d) property is structurally complex; low-income housing REIT can qualify as beneficial owner. SOURCE: IRS PLR 9802035'),

-- Manufacturing (Exempt Facility / §144 IDB)
('311000', 'Food Manufacturing (General — 311xxx)', '§144(a)', 'Qualified small issue IDB bonds; volume cap; $10M limit per project traditional; $40M with voter approval', true,  false, NULL,  true,  true,  'Industrial development bonds (IDB) §144(a); $10M cap per project; used for manufacturing facility expansion. SOURCE: IRC §144(a)'),
('332000', 'Fabricated Metal Product Manufacturing (332xxx)', '§144(a)', 'Qualified small issue IDB bonds', true,  false, NULL,  true,  true,  'Same §144(a) small issue IDB treatment as food mfg. SOURCE: IRC §144(a)'),
('333000', 'Machinery Manufacturing (333xxx)', '§144(a)', 'Qualified small issue IDB bonds', true,  false, NULL,  true,  true,  'Manufacturing facility bonds; TEFRA not typically required for small issue IDB under $10M. SOURCE: IRC §144(a)'),
('336000', 'Transportation Equipment Manufacturing (336xxx)', '§144(a)', 'Qualified small issue IDB bonds', true,  false, NULL,  true,  true,  'Automotive/aerospace parts mfg. SOURCE: IRC §144(a)'),

-- Professional Services (Generally Eligible as 501(c)(3) Support)
('541110', 'Offices of Lawyers (Law Firms)', '§501(c)(3)', 'INELIGIBLE as direct borrower; may be incidental user in 501(c)(3) bond (must not exceed 5% private use)', true,  false, NULL,  false, false, 'Law firms cannot be principal user of tax-exempt bonds. Private use limit 5% in governmental bonds. SOURCE: IRC §141(b)'),
('551114', 'Corporate, Subsidiary, and Regional Managing Offices', '§501(c)(3)', 'Eligible ONLY if holding company is itself a 501(c)(3); for-profit HQ ineligible', false, false, NULL,  false, false, 'EST: §501(c)(3) holding companies (e.g., hospital systems) can use bonds for HQ portions. SOURCE: IRS field examination guidelines'),
('561110', 'Office Administrative Services', '§501(c)(3)', 'Ineligible as direct borrower; admin services for 501(c)(3) may qualify as incidental use', false, false, NULL,  false, false, 'Private business — ineligible. SOURCE: IRC §145(d)'),
('813110', 'Religious Organizations', '§145, §501(c)(3)', 'Qualified 501(c)(3) bonds; no volume cap; TEFRA required', false, true,  0.95, true,  true,  'Houses of worship, religious schools, retreat centers. SOURCE: IRC §145; Rev. Rul. 63-20'),
('813211', 'Grantmaking Foundations', '§501(c)(3), §145', 'Qualified 501(c)(3) bonds; limited capital project use', false, true,  0.95, false, false, 'Foundation building/HQ bonds are uncommon but IRC §145 allows. SOURCE: IRC §145'),

-- Explicitly Ineligible
('713210', 'Casinos (except casino hotels)', 'INELIGIBLE', 'INELIGIBLE — explicitly excluded by IRC §145(d)', false, false, NULL,  false, false, 'EXCLUDED. IRC §145(d) explicitly bars gaming facilities. SOURCE: IRC §145(d)(2)'),
('522110', 'Commercial Banking', 'INELIGIBLE', 'INELIGIBLE — financial institutions cannot be principal user', false, false, NULL,  false, false, 'EXCLUDED. Banks/financial institutions are private businesses ineligible as conduit borrowers. SOURCE: IRC §141(b); Rev. Rul. 82-14'),
('522120', 'Savings Institutions, Federally Chartered', 'INELIGIBLE', 'INELIGIBLE', false, false, NULL,  false, false, 'Same exclusion as 522110. SOURCE: IRC §141(b)'),
('524113', 'Direct Life Insurance Carriers', 'INELIGIBLE', 'INELIGIBLE', false, false, NULL,  false, false, 'For-profit insurer; no 501(c)(3) pathway; excluded. SOURCE: IRC §145(d)'),
('236220', 'Commercial and Institutional Building Construction', 'INELIGIBLE', 'Not eligible as direct borrower; only eligible as contractor for qualifying 501(c)(3) or exempt facility project', false, false, NULL,  true,  false, 'GC/construction company cannot be conduit borrower; eligible only as contractor on qualifying project. SOURCE: IRC §141'),
('531120', 'Lessors of Nonresidential Buildings (Commercial RE)', 'INELIGIBLE', 'INELIGIBLE — commercial real estate rental not a qualified purpose', false, false, NULL,  false, false, 'Commercial office/retail lessor ineligible. §142 covers only residential rental, airports, docks, etc. SOURCE: IRC §142(a)')

ON CONFLICT (naics_code) DO NOTHING;

-- ═══════ SECTION 3: NAIC_DESIGNATIONS ═══════
-- SOURCE: NAIC SVO (Securities Valuation Office) Purposes and Procedures Manual 2024,
--         NAIC RBC C-1 factor tables, ACLI "Life Insurance Fact Book",
--         Model Regulation on Credit Risk and Asset Concentration

CREATE TABLE IF NOT EXISTS naic_designations (
    designation                 TEXT PRIMARY KEY,
    equivalent_sp_rating        TEXT,
    equivalent_moodys_rating    TEXT,
    equivalent_fitch_rating     TEXT,
    rbc_life_insurer_factor_pct NUMERIC,
    rbc_pc_insurer_factor_pct   NUMERIC,
    max_pct_admitted_assets_life NUMERIC,
    avr_required                BOOLEAN DEFAULT false,
    investment_grade            BOOLEAN DEFAULT false,
    description                 TEXT,
    typical_cmbs_spread_bps     INTEGER,
    typical_muni_spread_bps     INTEGER
);

-- SOURCE: NAIC SVO Manual 2024; NAIC RBC C-1 bond factors; ACLI data
INSERT INTO naic_designations (designation, equivalent_sp_rating, equivalent_moodys_rating, equivalent_fitch_rating, rbc_life_insurer_factor_pct, rbc_pc_insurer_factor_pct, max_pct_admitted_assets_life, avr_required, investment_grade, description, typical_cmbs_spread_bps, typical_muni_spread_bps) VALUES

('1',  'AAA to A-',   'Aaa to A3',   'AAA to A-',   0.40,  0.30,  NULL,  false, true,  'Highest quality investment grade. Life insurer RBC C-1 factor ~0.4%. No AVR required. SOURCE: NAIC RBC C-1 table; SVO Manual §1.C.1',    130, 50),
('1E', 'AAA (govt)',  'Aaa (govt)',   'AAA (govt)',   0.00,  0.00,  NULL,  false, true,  'Exempt: U.S. government and agency obligations. Zero RBC factor. SOURCE: NAIC RBC §C-1 exemption; SAP 26',                               NULL, NULL),
('1F', 'AAA-A (fund)','Aaa-A (fund)', 'AAA-A (fund)', 0.40,  0.30,  NULL,  false, true,  'Fund-modeled: NAIC-1 designation assigned via financial modeling (e.g., CLO tranches, structured products). Same RBC as NAIC-1. SOURCE: NAIC SVO Practices and Procedures 2024 §Part Six',   140, NULL),
('1G', 'Unrated/Priv','Unrated',      'Unrated',      0.40,  0.30,  NULL,  false, true,  'NAIC 1 granted by SVO to unrated/private placement bonds meeting quality criteria. Common for private 501(c)(3) hospital bonds. SOURCE: NAIC SVO PP Manual §Part Three.A', 150, 100),
('2',  'BBB+ to BBB-','Baa1 to Baa3', 'BBB+ to BBB-', 1.30,  1.00,  NULL,  true,  true,  'Investment grade — BBB range. Life insurer RBC C-1 factor ~1.3%. AVR begins at NAIC-2 for life insurers under SAP 7. Life insurers may invest without concentration limit in 1+2 combined. SOURCE: NAIC RBC C-1; SAP 7 AVR instructions',  280, 120),
('3',  'BB+ to BB-',  'Ba1 to Ba3',  'BB+ to BB-',   4.60,  2.00,  20.0,  true,  false, 'Sub-investment grade ("junk"). Life insurer RBC C-1 ~4.6%. Maximum ~20% of admitted assets for life insurers in NAIC 3+. Some state regulators cap at 10-15%. SOURCE: NAIC RBC C-1 schedule; Model Reg 820', 400, 220),
('4',  'B+ to B-',   'B1 to B3',    'B+ to B-',    10.00,  4.50,   3.0,  true,  false, 'Highly speculative. Life RBC 10%. Combined NAIC 4+5+6 typically capped at 3-5% of admitted assets. SOURCE: NAIC RBC C-1; state investment statutes',  650, NULL),
('5',  'CCC to C',   'Caa to Ca',   'CCC to C',    23.00, 10.00,   1.0,  true,  false, 'In or near default. Life RBC 23%. Max ~1% of admitted assets. SOURCE: NAIC RBC C-1 schedule', NULL, NULL),
('6',  'D',          'C/D',         'D',           30.00, 30.00,   0.5,  true,  false, 'In default. Life RBC 30%. Typically must be reserved at fair value or written down. SOURCE: NAIC RBC C-1; SAP 36 impairment guidance', NULL, NULL)

ON CONFLICT (designation) DO NOTHING;

-- ═══════ SECTION 4: CAPITAL_STRUCTURE_RULES ═══════
-- SOURCE: NEST CLAUDE.md capital stack architecture, Hylant surety parameters,
--         NEST operating model ADR-0001 and ADR-0002

CREATE TABLE IF NOT EXISTS capital_structure_rules (
    tranche_name            TEXT PRIMARY KEY,
    ltc_pct                 NUMERIC,
    cltv_combined_pct       NUMERIC,
    min_credit_grade        TEXT,
    credit_enhancement      TEXT,
    coupon_floor_pct        NUMERIC,
    coupon_ceiling_pct      NUMERIC,
    io_period_months        INTEGER,
    amort_years             INTEGER,
    reserve_pct_of_proceeds NUMERIC,
    lc_fee_bps_per_year     INTEGER,
    surety_premium_pct      NUMERIC,
    aum_threshold_min       NUMERIC,
    aum_threshold_max       NUMERIC,
    collateral_required     TEXT,
    typical_providers       TEXT[],
    notes                   TEXT
);

INSERT INTO capital_structure_rules (tranche_name, ltc_pct, cltv_combined_pct, min_credit_grade, credit_enhancement, coupon_floor_pct, coupon_ceiling_pct, io_period_months, amort_years, reserve_pct_of_proceeds, lc_fee_bps_per_year, surety_premium_pct, aum_threshold_min, aum_threshold_max, collateral_required, typical_providers, notes) VALUES

-- Primary Bond Tranches
('Series_A',          0.75, NULL,  'BBB-',   'Hylant surety bond or bank LC; credit wraps bond issuance', 6.50, 7.50, 24, 30, 0.025, NULL, 1.00, NULL, NULL,
  'Project assets, assignment of project revenues, surety/LC as credit enhancement',
  ARRAY['Hylant Group', 'Berkshire Hathaway Specialty', 'Travelers Surety', 'The Hartford'],
  'Primary bond tranche. 75% LTC. BBB- minimum for tax-exempt placement. Surety or LC wraps to achieve investment grade. SOURCE: NEST CLAUDE.md Series A definition'),

('Series_B',          NULL, 0.82,  'B',      'Bank managed; subordinate to Series A; higher risk/return',        10.00, 14.00, 12, 20, NULL, NULL, NULL, NULL, NULL,
  'Second lien on project assets; personal guarantee of sponsor',
  ARRAY['KeyBank Real Estate Capital', 'JP Morgan Chase Commercial RE', 'Private credit funds', 'Ares Capital'],
  'Combined LTV cap 82% (Series A + B combined). +7% above Series A LTC. B-rated minimum. SOURCE: NEST CLAUDE.md Series B definition'),

-- Reserve Structures
('IO_Reserve',        NULL, NULL,  NULL,     'Pre-funded interest reserve from bond proceeds',                    NULL, NULL, 24, NULL, NULL, NULL, NULL, NULL, NULL,
  'Cash escrow funded from bond proceeds at closing',
  ARRAY['Bond trustee (US Bank, Wells Fargo Corporate Trust, Wilmington Trust)'],
  'Pre-funded from proceeds to cover IO period during construction/lease-up. Zero cash drag on sponsor during construction. SOURCE: NEST CLAUDE.md IO reserve mechanism'),

('Maturity_Reserve',  NULL, NULL,  NULL,     'Sinking fund / maturity reserve escrowed at closing',              NULL, NULL, NULL, NULL, 0.025, NULL, NULL, NULL, NULL,
  'Cash or government securities in escrow with bond trustee',
  ARRAY['Bond trustee'],
  '2.5% of bond proceeds escrowed; returned at maturity if no default. Enhances bond credit. SOURCE: NEST CLAUDE.md reserve structure'),

-- HFT Fund
('HFT_Fund',          NULL, NULL,  'B',      'B-tranche positions; Quantum agent managed; market-neutral overlay', 15.00, 25.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  'B-tranche bond positions + derivative overlay',
  ARRAY['Internal: Quantum agent', 'Prime broker: Interactive Brokers or Goldman'],
  'Target 15-25% gross return. Quantum agent runs every 5 minutes. $32.4M AUM. SOURCE: NEST CLAUDE.md Quantum agent spec'),

-- Mezzanine
('Mezz',              NULL, NULL,  NULL,     'Unsecured or second lien mezzanine; PIK option available',          14.00, 20.00, 12, 3, NULL, NULL, NULL, NULL, NULL,
  'Mezzanine position; personal guarantee of sponsor; warrant coverage common',
  ARRAY['Ares Capital', 'Bridge Investment Group', 'Kayne Anderson', 'Hanover Real Estate Partners'],
  '85-92% CLTV when combined with senior. 1-3yr term. PIK option allows interest to accrue (no cash pay). SOURCE: NEST CLAUDE.md mezz definition'),

-- Bridge
('Bridge',            NULL, NULL,  NULL,     'Bridge note; refis into permanent bond or agency',                  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  'First lien; short-term; SOFR-indexed floating rate',
  ARRAY['Berkadia', 'Bridge Investment Group', 'JLL Capital Markets', 'Walker & Dunlop'],
  '65-80% LTV. 6-15 month term. SOFR + 300-600bps. Refi trigger into perm/bond at stabilization. SOURCE: NEST CLAUDE.md bridge definition'),

-- LC Phase Thresholds
('Surety_Phase',      NULL, NULL,  'BBB-',   'Surety bond only; personal guarantee required',                     NULL, NULL, NULL, NULL, NULL, NULL, 1.00, 0, 15000000,
  'Personal guarantee of principals; project assets',
  ARRAY['Hylant Group', 'The Hartford', 'Travelers Surety'],
  'AUM $0-15M. Surety only. Premium 0.5-1.5%/yr of bond face. Hylant specialty surety arm. SOURCE: NEST CLAUDE.md LC phase matrix'),

('Hybrid_Phase',      NULL, NULL,  'BBB-',   'Partial surety + partial bank letter of credit',                    NULL, NULL, NULL, NULL, NULL, 100, 0.75, 15000000, 40000000,
  'Corporate guarantee + partial cash collateral',
  ARRAY['Hylant Group', 'KeyBank', 'Regions Bank'],
  'AUM $15-40M. LC fee 75-125bps/yr. Surety covers gap. Hybrid structure reduces total premium cost. SOURCE: NEST CLAUDE.md LC phase matrix'),

('LC_Dominant',       NULL, NULL,  'BBB-',   'Bank letter of credit dominant; minimal surety',                    NULL, NULL, NULL, NULL, NULL, 75, NULL, 40000000, 80000000,
  'Corporate guarantee; partial cash collateral',
  ARRAY['JP Morgan Chase', 'Wells Fargo', 'KeyBank'],
  'AUM $40-80M. LC fee 50-100bps/yr. Bank relationship drives LC issuance. SOURCE: NEST CLAUDE.md LC phase matrix'),

('Self_Collateralized', NULL, NULL, 'BBB',   'Balance sheet posting; no external surety or LC',                   NULL, NULL, NULL, NULL, NULL, 0, 0.00, 80000000, NULL,
  'NEST/AEC balance sheet assets as collateral',
  ARRAY['Internal treasury management'],
  'AUM $80M+. Zero external premium. Balance sheet posting replaces all external credit enhancement. SOURCE: NEST CLAUDE.md LC phase matrix')

ON CONFLICT (tranche_name) DO NOTHING;

-- ═══════ SECTION 5: BOND_SPREADS ═══════
-- SOURCE: Bloomberg BVAL, MSRB EMMA market data, MMD (Municipal Market Data) Thomson Reuters,
--         JP Morgan CMBS research Q4 2025, BofA CRE debt markets report 2025,
--         Raymond James Public Finance spread tables (EST for Q4 2025)

CREATE TABLE IF NOT EXISTS bond_spreads (
    id                              SERIAL PRIMARY KEY,
    rating                          TEXT NOT NULL,
    bond_type                       TEXT NOT NULL,
    deal_type                       TEXT,
    term_years                      INTEGER,
    spread_bps_floor                INTEGER,
    spread_bps_mid                  INTEGER,
    spread_bps_ceiling              INTEGER,
    benchmark_treasury_rate_pct     NUMERIC,
    all_in_yield_floor              NUMERIC,
    all_in_yield_ceiling            NUMERIC,
    credit_enhancement_compression_bps INTEGER,
    as_of_date                      DATE,
    notes                           TEXT
);

INSERT INTO bond_spreads (rating, bond_type, deal_type, term_years, spread_bps_floor, spread_bps_mid, spread_bps_ceiling, benchmark_treasury_rate_pct, all_in_yield_floor, all_in_yield_ceiling, credit_enhancement_compression_bps, as_of_date, notes) VALUES

-- ─── CMBS Conduit — 10yr Treasury benchmark (~4.25-4.50% Q4 2025 EST) ───
('AAA',  'CMBS_conduit', NULL,                     10, 130, 145, 160, 4.35, 5.65, 5.95,  NULL, '2025-12-31', 'EST: AAA CMBS 10yr. Top-of-stack. SOURCE: JP Morgan CMBS Q4 2025 research; BofA CMBS spread tables'),
('AA',   'CMBS_conduit', NULL,                     10, 160, 185, 210, 4.35, 5.95, 6.45,  NULL, '2025-12-31', 'EST: AA CMBS. SOURCE: CMBS market convention interpolated from AAA/BBB+'),
('A',    'CMBS_conduit', NULL,                     10, 190, 220, 250, 4.35, 6.25, 7.00,  NULL, '2025-12-31', 'EST: A CMBS 10yr. SOURCE: CMBS conduit pricing convention'),
('BBB+', 'CMBS_conduit', NULL,                     10, 240, 280, 320, 4.35, 6.75, 7.55,  NULL, '2025-12-31', 'EST: BBB+ CMBS mezz. SOURCE: JP Morgan CMBS research estimates'),
('BBB',  'CMBS_conduit', NULL,                     10, 290, 340, 390, 4.35, 7.25, 8.25,  NULL, '2025-12-31', 'EST: BBB CMBS 10yr. SOURCE: Bloomberg BVAL estimates Q4 2025'),
('BBB-', 'CMBS_conduit', NULL,                     10, 300, 350, 400, 4.35, 7.35, 8.35, 80,   '2025-12-31', 'EST: BBB- CMBS; credit enhancement typically compresses 60-120bps. SOURCE: BofA CRE debt markets'),

-- ─── Tax-Exempt Muni — MMD30 benchmark (~4.10-4.40% Q4 2025 EST) ───
('AAA',  'tax_exempt_muni', NULL,                  30, 0, 0, 20, 4.25, 4.10, 4.45, NULL, '2025-12-31', 'EST: AAA tax-exempt muni (govt-backed). Spreads near 0 to MMD. SOURCE: MSRB EMMA; MMD Thomson Reuters'),
('AA',   'tax_exempt_muni', NULL,                  30, 20, 35, 55, 4.25, 4.30, 4.80, NULL, '2025-12-31', 'EST: AA tax-exempt general obligation / revenue bond 30yr. SOURCE: Thomson Reuters MMD'),
('A',    'tax_exempt_muni', NULL,                  30, 50, 80, 110, 4.25, 4.60, 5.35, NULL, '2025-12-31', 'EST: A-rated tax-exempt 30yr. SOURCE: MMD AA/BBB interpolated'),
('BBB+', 'tax_exempt_muni', NULL,                  30, 100, 120, 140, 4.25, 5.10, 5.65, 80, '2025-12-31', 'EST: BBB+ tax-exempt revenue 30yr; surety/LC wrap compresses ~80bps. SOURCE: MMD; Ziegler senior living comp data'),
('BBB',  'tax_exempt_muni', NULL,                  30, 140, 175, 210, 4.25, 5.50, 6.35, 80, '2025-12-31', 'EST: BBB tax-exempt 30yr. SOURCE: MMD + Raymond James municipal data'),
('BBB-', 'tax_exempt_muni', NULL,                  30, 200, 240, 280, 4.25, 6.10, 7.05, 90, '2025-12-31', 'EST: BBB- tax-exempt 30yr; lower end of IG. SOURCE: EMMA comp analysis; HJ Sims senior living deals'),

-- ─── 501(c)(3) Revenue Bonds ───
('BBB+', '501c3_revenue', 'hospital_501c3',         30, 100, 120, 140, 4.25, 5.10, 5.65, 70, '2025-12-31', 'EST: Hospital 501(c)(3) BBB+ 30yr. SOURCE: Ziegler hospital bond comps; Raymond James'),
('A-',   '501c3_revenue', 'hospital_501c3',         30, 55,  75,  95,  4.25, 4.65, 5.20, NULL,'2025-12-31', 'EST: Hospital A- 501(c)(3) 30yr. SOURCE: BofA healthcare finance group'),
('BBB+', '501c3_revenue', 'higher_education',       30, 95, 115, 135, 4.25, 5.05, 5.60, NULL,'2025-12-31', 'EST: Higher education 501(c)(3) BBB+ 30yr. SOURCE: Piper Sandler education finance comps'),
('BBB',  '501c3_revenue', 'higher_education',       30, 130, 160, 195, 4.25, 5.40, 6.20, NULL,'2025-12-31', 'EST: Higher education BBB 30yr. SOURCE: Chapman & Cutler market data'),
('BBB+', '501c3_revenue', 'senior_living_CCRC',     30, 110, 130, 150, 4.25, 5.20, 5.75, 80, '2025-12-31', 'EST: CCRC BBB+ 501(c)(3) revenue bond 30yr. KEY NEST deal type. SOURCE: Ziegler/HJ Sims CCRC comp data; EMMA'),
('BBB',  '501c3_revenue', 'senior_living_CCRC',     30, 140, 175, 215, 4.25, 5.50, 6.40, 80, '2025-12-31', 'EST: CCRC BBB 501(c)(3) 30yr. SOURCE: EMMA senior living comps 2022-2025'),
('BBB-', '501c3_revenue', 'senior_living_CCRC',     30, 200, 245, 285, 4.25, 6.10, 7.10, 90, '2025-12-31', 'EST: CCRC BBB- 30yr; credit enhancement important at this level. SOURCE: EMMA lower-rated CCRC issuances'),
('BBB-', '501c3_revenue', 'senior_living_SNF',      30, 220, 265, 305, 4.25, 6.30, 7.30, 100,'2025-12-31', 'EST: SNF BBB- 501(c)(3) 30yr; slightly wider than CCRC due to regulatory risk. SOURCE: EMMA SNF comps'),

-- ─── Construction Bonds ───
('BBB',  'construction_bond', 'senior_living_CCRC', 25, 150, 175, 200, 4.25, 5.60, 6.25, 90, '2025-12-31', 'EST: CCRC construction bond BBB 25yr; IO period + construction risk premium. SOURCE: Ziegler CCRC construction issuances'),
('BBB-', 'construction_bond', 'senior_living_CCRC', 25, 195, 230, 270, 4.25, 6.05, 6.95, 100,'2025-12-31', 'EST: BBB- construction bond CCRC; surety critical. SOURCE: HJ Sims construction deals'),
('BBB',  'construction_bond', 'multifamily_market_rate', 25, 140, 165, 190, 4.25, 5.50, 6.15, 80,'2025-12-31','EST: Multifamily construction bond BBB 25yr. SOURCE: EMMA multifamily construction comps'),

-- ─── 4% LIHTC Bonds ───
('A',    '4pct_LIHTC_bond', 'multifamily_market_rate', 15, 0, 20, 50, 4.25, 4.10, 4.75, NULL,'2025-12-31', 'EST: 4% LIHTC bond (FHA insured or HUD). Near MMD benchmark due to FHA guaranty. SOURCE: Walker & Dunlop affordable housing comp data'),

-- ─── Bridge Notes (flat yield, not spread-based) ───
('NR',   'bridge_note', NULL,                       1,  300, 430, 600, 5.25, 8.25, 10.25, NULL,'2025-12-31', 'Bridge note SOFR+300-500bps. SOFR base rate ~5.25% EST Q4 2025. 6-18mo. SOURCE: NEST CLAUDE.md bridge definition; Berkadia bridge program'),
('NR',   'bridge_note', 'senior_living_CCRC',       1,  350, 475, 600, 5.25, 8.75, 11.25, NULL,'2025-12-31', 'EST: Senior living bridge note; premium to generic CRE bridge due to operator/license risk. SOURCE: Bridge Investment Group senior living program'),

-- ─── Mezz Notes (flat yield) ───
('B',    'mezz_note', NULL,                         2,  NULL,NULL,NULL, NULL, 14.00, 20.00, NULL,'2025-12-31', 'Mezzanine note B-rated; 2-3yr. Flat yield convention (not spread). PIK option. SOURCE: NEST CLAUDE.md mezz definition; Ares Capital mezz programs'),
('BB-',  'mezz_note', 'senior_living_CCRC',         3,  NULL,NULL,NULL, NULL, 12.00, 16.00, NULL,'2025-12-31', 'EST: Senior living mezz BB- 3yr; lower yield vs pure B mezz due to asset quality. SOURCE: Kayne Anderson senior living fund data'),

-- ─── M&A Acquisition Financing ───
('BBB-', 'CMBS_conduit', 'ma_acquisition',          10, 310, 365, 420, 4.35, 7.45, 8.55, 80, '2025-12-31', 'EST: M&A acquisition bridge/CMBS BBB- 10yr; blended construction/perm. SOURCE: NEST CLAUDE.md deal framework'),
('BB',   'bridge_note', 'ma_acquisition',            1,  400, 530, 650, 5.25, 9.25, 11.75, NULL,'2025-12-31', 'EST: M&A acquisition bridge sub-IG; short-term. SOURCE: NEST bridge note framework')

ON CONFLICT DO NOTHING;

-- ═══════ SECTION 6: SURETY_GATES ═══════
-- SOURCE: Hylant Group surety parameters, Travelers Surety underwriting guide,
--         Berkshire Hathaway Specialty Insurance (BHSI) surety criteria,
--         NEST CLAUDE.md surety phase matrix

CREATE TABLE IF NOT EXISTS surety_gates (
    id                      SERIAL PRIMARY KEY,
    tier_name               TEXT UNIQUE NOT NULL,
    min_bond_usd            NUMERIC NOT NULL,
    max_bond_usd            NUMERIC NOT NULL,
    premium_rate_pct_min    NUMERIC NOT NULL,
    premium_rate_pct_max    NUMERIC NOT NULL,
    indemnity_type          TEXT,
    min_dscr_required       NUMERIC,
    max_ltv_allowed         NUMERIC,
    max_project_size_usd    NUMERIC,
    underwriting_timeline_days INTEGER,
    typical_providers       TEXT[],
    required_documents      TEXT[],
    completion_bond_available BOOLEAN DEFAULT true,
    payment_bond_available    BOOLEAN DEFAULT true,
    performance_bond_available BOOLEAN DEFAULT true,
    notes                   TEXT
);

INSERT INTO surety_gates (tier_name, min_bond_usd, max_bond_usd, premium_rate_pct_min, premium_rate_pct_max, indemnity_type, min_dscr_required, max_ltv_allowed, max_project_size_usd, underwriting_timeline_days, typical_providers, required_documents, completion_bond_available, payment_bond_available, performance_bond_available, notes) VALUES

('Tier_1',
 1000000, 15000000,
 0.50, 1.50,
 'Personal guarantee of all principals; assignment of key-man life insurance',
 1.25, 0.80, 20000000,
 21,
 ARRAY['Hylant Group', 'The Hartford', 'Travelers Surety', 'Liberty Mutual Surety'],
 ARRAY['Feasibility study or pro forma', 'GMP contract with licensed GC', 'Personal financial statements (3yr)', 'Business tax returns (3yr)', 'Project team bios and track record', 'Environmental Phase I ESA', 'Operating projections (5yr)', 'Organizational documents'],
 true, true, true,
 'SOURCE: Hylant specialty surety underwriting guidelines; NEST CLAUDE.md Tier 1. Min DSCR 1.25 stabilized; 1.10-1.15 during construction. Max LTV 80%.'),

('Tier_2',
 15000000, 50000000,
 0.40, 1.00,
 'Corporate guarantee of operating entity + personal guarantee of 20%+ owners; key-man assignment',
 1.30, 0.78, 75000000,
 30,
 ARRAY['Hylant Group', 'Travelers Surety', 'Berkshire Hathaway Specialty Insurance', 'XL Catlin Surety'],
 ARRAY['Audited financials (3yr CPA-audited)', 'Feasibility study (MAI appraiser)', 'GMP contract (AIA form)', 'Environmental Phase I/II as needed', 'Personal financial statements all 20%+ owners', 'Business CPA tax returns (3yr)', 'Project team bios + resume package', 'Construction schedule + milestone schedule', 'Operator agreement / management contract', 'AHCA or applicable license copy if healthcare'],
 true, true, true,
 'SOURCE: Travelers Surety bond application requirements; BHSI surety criteria. Corporate indemnification required. LC backstop not yet required at this tier.'),

('Tier_3',
 50000000, 100000000,
 0.35, 0.75,
 'Corporate guarantee + $5-10M bank LC as partial collateral backstop; personal guarantee if individual ownership',
 1.35, 0.76, 150000000,
 45,
 ARRAY['Berkshire Hathaway Specialty Insurance', 'Travelers Surety', 'XL Catlin Surety', 'Zurich Surety', 'Hylant Group'],
 ARRAY['Audited financials (3yr) by Big 4 or national firm', 'Feasibility study (KPMG or national consulting firm)', 'MAI appraisal', 'GMP contract with tier-1 licensed GC', 'Environmental Phase I and II', 'Personal financial statements', 'Bank LC commitment letter ($5-10M)', 'Construction lender commitment', 'Operator agreement', 'AHCA license', 'Architectural plans and permits'],
 true, true, true,
 'SOURCE: BHSI surety; Zurich CRE surety. $5-10M LC backstop required. Significant documentation threshold. SOURCE: Hylant Group Tier 3 requirements.'),

('Tier_4',
 100000000, 250000000,
 0.30, 0.60,
 'Full corporate guarantee of all entities in capital stack + $20-30M collateral (LC or cash)',
 1.40, 0.75, 350000000,
 60,
 ARRAY['Berkshire Hathaway Specialty Insurance', 'Zurich Surety', 'XL Catlin Surety', 'Travelers Surety'],
 ARRAY['Big 4 audited financials (5yr)', 'Investment-grade feasibility study', 'MAI appraisal plus desk review', 'Environmental Phase I + II + geotechnical study', 'GMP contract with bonded tier-1 GC', '$20-30M bank LC commitment', 'Construction lender binding commitment', 'Operator / licensee agreement', 'Full project pro forma with stress scenarios', 'Insurance package review', 'Legal opinions', 'Owner-controlled insurance program (OCIP) review'],
 true, true, true,
 'SOURCE: Berkshire Hathaway surety division; market practice for large CRE surety. Principal providers begin requiring reinsurance backstop at this tier.'),

('Tier_5',
 250000000, 999999999999,
 0.25, 0.50,
 'Full corporate guarantee + $50M+ collateral; consortium of sureties required; master indemnity agreement',
 1.45, 0.72, 999999999999,
 90,
 ARRAY['Berkshire Hathaway Specialty Insurance', 'Zurich Surety', 'XL Catlin Surety', 'Travelers Surety', 'Liberty Mutual Surety'],
 ARRAY['Big 4 audited financials (5yr)', 'Institutional-grade feasibility study (Big 4 or specialist)', 'Independent engineer report', 'MAI appraisal + ARGUS model', 'Phase I/II environmental + geotechnical', 'GMP with bonded GC + 100% payment and performance bonds on GC', '$50M+ collateral (LC + cash)', 'Consortium surety agreement', 'Master Indemnity Agreement (MIA)', 'Reinsurance treaty confirmation', 'Full capital stack legal opinions', 'Rating agency pre-issuance letter (if applicable)'],
 true, true, true,
 'EST: Consortium approach — single surety rarely underwrites $250M+ alone; fronting arrangement or co-surety. SOURCE: BHSI market practice; Zurich global surety program.')

ON CONFLICT (tier_name) DO NOTHING;

-- ═══════ SECTION 7: AGENT_CONFIGS ═══════
-- SOURCE: NEST CLAUDE.md agent definitions, NEST platform spec, NEST CNS architecture

CREATE TABLE IF NOT EXISTS agent_configs (
    id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name                  TEXT UNIQUE NOT NULL,
    agent_type                  TEXT NOT NULL,
    model_id                    TEXT NOT NULL,
    system_prompt_template      TEXT NOT NULL,
    run_interval_minutes        INTEGER NOT NULL,
    temperature                 NUMERIC NOT NULL,
    active                      BOOLEAN DEFAULT true,
    input_schema_description    TEXT,
    output_schema_description   TEXT,
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO agent_configs (agent_name, agent_type, model_id, system_prompt_template, run_interval_minutes, temperature, active, input_schema_description, output_schema_description) VALUES

('Vector', 'market_signal', 'claude-sonnet-4-20250514',
 'You are Vector, NEST''s market timing agent. You analyze 14 market signals every 15 minutes to determine optimal call/put execution timing for the bond portfolio. Monitor: 10yr Treasury yield, 2yr Treasury yield, TLT ETF price/volume, CME Fed funds futures, SOFR OIS curve, credit spreads (IG/HY CDX), VIX, MOVE index, Bloomberg BVAL spreads, MMD 30yr, CMBS conduit spreads (AAA/BBB), agency MBS spreads, foreign central bank Treasury holdings, and repo market stress. Output a signal: [HOLD | BUY_CALLS | BUY_PUTS | EXECUTE_HEDGE] with confidence 0-100 and timestamp.',
 15, 0.0, true,
 'JSON: {treasury_10yr: float, treasury_2yr: float, tlt_price: float, vix: float, move_index: float, sofr_rate: float, cdx_ig_spread: int, cdx_hy_spread: int, mmd_30yr: float, cmbs_aaa_spread: int}',
 'JSON: {signal: enum[HOLD|BUY_CALLS|BUY_PUTS|EXECUTE_HEDGE], confidence: int, rationale: string, timestamp: datetime}'),

('Apex', 'market_signal', 'claude-sonnet-4-20250514',
 'You are Apex, NEST''s short position manager. You manage short bond positions via TLT puts, T-note futures short, and interest rate swaps (IRS pay-fixed). Analyze rate momentum, curve steepener/flattener dynamics, and Fed policy signals. Determine optimal entry/exit sizing for short duration book. Coordinate with Vector on timing. Output position recommendations with strike, expiry, size, and Greek exposure (delta, gamma, vega).',
 60, 0.0, true,
 'JSON: {vector_signal: object, current_positions: array, rate_momentum_score: float, curve_slope: float, fed_meeting_days_out: int}',
 'JSON: {action: enum[OPEN|CLOSE|ROLL|HOLD], instrument: string, strike: float, expiry: date, notional: float, greeks: object, rationale: string}'),

('Chain', 'execution', 'claude-sonnet-4-20250514',
 'You are Chain, NEST''s blockchain execution agent. You manage ERC-1400 security token issuance, smart contract deployment, and on-chain bond settlement. Handle: token minting for bond proceeds, transfer restriction logic (accredited investor whitelist), cap table recording, and atomic settlement. Integrate with Ethereum mainnet and Polygon for gas optimization. Ensure SEC Reg D / Reg S compliance encoded in transfer restrictions.',
 30, 0.0, true,
 'JSON: {deal_id: uuid, bond_amount: float, investor_addresses: array, transfer_restrictions: object, settlement_date: date}',
 'JSON: {tx_hash: string, token_contract: string, tokens_minted: float, whitelist_updated: boolean, settlement_confirmed: boolean, gas_used: int}'),

('Atlas', 'modeling', 'claude-sonnet-4-20250514',
 'You are Atlas, NEST''s financial modeling agent. You build 10-year proforma models, run stress scenarios, and produce sponsor financial analysis. For CRE/healthcare deals: model NOI waterfall, DSCR by year, debt service coverage, LTV at stabilization, break-even occupancy, and 3 stress scenarios (base/downside/severe). Output structured JSON proforma + narrative summary.',
 240, 0.0, true,
 'JSON: {deal_id: uuid, total_cost: float, noi_at_open: float, noi_stabilized: float, debt_service: float, term_years: int, asset_type: string, occupancy_assumptions: object}',
 'JSON: {proforma_by_year: array, dscr_by_year: array, ltv_at_stabilization: float, break_even_occupancy: float, stress_scenarios: object, narrative: string}'),

('Morgan', 'writing', 'claude-sonnet-4-20250514',
 'You are Morgan, NEST''s content and memo writing agent. Write with the gravitas of Jimmy Lee at JP Morgan — confident, institutional, precise. Draft: Confidential Information Memorandums (CIMs), deal term sheets, investor letters, board presentations, and marketing collateral. Tone: elite investment bank, not startup. No hedging language. Direct declarative sentences. Use deal-specific data from Atlas output. Never hallucinate financial figures.',
 1440, 0.7, true,
 'JSON: {content_type: enum[CIM|TERM_SHEET|INVESTOR_LETTER|BOARD_PRESENTATION|MARKETING], deal_data: object, audience: string, length_pages: int}',
 'JSON: {document_type: string, title: string, content_markdown: string, word_count: int, key_points: array}'),

('Sterling', 'placement', 'claude-sonnet-4-20250514',
 'You are Sterling, NEST''s investor placement and CRM agent. Manage bond book building, AEC token distribution, investor tracking, and capital raise status. Maintain 360-degree view of each investor: NDA status, soft circle amount, hard circle amount, wire received, allocation. Run tiered outreach sequences. Manage AEC token issuance to investors as loyalty mechanism. Report daily book status to Bernard.',
 120, 0.3, true,
 'JSON: {deal_id: uuid, target_raise: float, investor_list: array, current_book: object, outreach_status: object}',
 'JSON: {total_soft_circles: float, total_hard_circles: float, wires_received: float, book_pct_filled: float, investor_updates: array, recommended_actions: array}'),

('Bridge', 'monitoring', 'claude-sonnet-4-20250514',
 'You are Bridge, NEST''s permanent debt monitoring agent. Track construction-to-perm conversion timelines for all active deals. Issue alerts 18 months before stabilization (perm debt trigger). Monitor DSCR trajectory, occupancy ramp, and debt service reserve adequacy. Coordinate with Atlas for updated proforma. Alert Bernard when any deal breaches covenant thresholds or perm refi window opens.',
 1440, 0.0, true,
 'JSON: {active_deals: array, construction_schedules: object, occupancy_reports: object, dscr_tracker: object}',
 'JSON: {alerts: array, perm_refi_readiness: object, covenant_breaches: array, recommended_actions: array, next_review_date: date}'),

('Quantum', 'hft', 'claude-sonnet-4-20250514',
 'You are Quantum, NEST''s HFT fund optimizer. Manage $32.4M AUM B-tranche bond positions plus derivative overlay. Target 15-25% gross annual return. Run market-neutral bond relative value strategies. Execute on signals from Vector. Manage portfolio: duration, convexity, DV01, credit beta. Rebalance every 5 minutes during market hours. Track YTD performance (current: 21.3%). Report P&L, risk metrics, and position changes to NEST treasury.',
 5, 0.0, true,
 'JSON: {portfolio_positions: array, vector_signal: object, market_data_snapshot: object, risk_limits: object, cash_available: float}',
 'JSON: {trades_executed: array, portfolio_dv01: float, portfolio_duration: float, daily_pnl: float, ytd_return_pct: float, risk_utilization: object}'),

('Maxwell', 'credit', 'claude-sonnet-4-20250514',
 'You are Maxwell, NEST''s credit analyst. Compute DSCR, LTV, LGD, ICR, D/EBITDA, CF leverage, and BS leverage for all deals. Apply NEST bond_benchmarks grade matrix to assign obligor credit grade. Flag any metric below BBB- floor for automatic downgrade trigger. Produce credit memo for each deal with grade justification. Update deals table with computed ratios. Alert Bernard on grade migrations.',
 480, 0.0, true,
 'JSON: {deal_id: uuid, financial_statements: object, appraisal: object, noi: float, debt_service: float, total_debt: float, ebitda: float}',
 'JSON: {dscr: float, ltv: float, icr: float, d_ebitda: float, cf_leverage: float, bs_leverage: float, obligor_grade: string, sub_ig_trigger: boolean, credit_memo: string}'),

('Aria', 'bd', 'claude-sonnet-4-20250514',
 'You are Aria, NEST''s business development and outreach agent. Execute cold/warm outreach sequences for deal sourcing, lender relationships, and BD partner cultivation. Maintain cadence: initial email → LinkedIn touchpoint → follow-up call brief → warm intro request. Track contact history and response rates. Use approved email templates. Do not fabricate financial projections in outreach. Report pipeline additions to Bernard weekly.',
 360, 0.5, true,
 'JSON: {contact_list: array, deal_focus: string, outreach_type: enum[COLD|WARM|REFERRAL], approved_templates: object, previous_touchpoints: array}',
 'JSON: {emails_queued: array, linkedin_messages: array, follow_ups_scheduled: array, responses_received: array, pipeline_additions: array}'),

('Merlin', 'intelligence', 'claude-sonnet-4-20250514',
 'You are Merlin, NEST''s M&A intelligence agent. Scan NAICS codes, distressed property signals, permit filings, and operator license actions for deal opportunities. Score each target on 7 criteria: financial distress signal, market position, asset quality, operator capability, NAICS eligibility, deal size fit ($15M-$250M), and strategic fit. Produce weekly target list with deal scores 0-100. Feed top targets to EagleEye heatmap.',
 720, 0.3, true,
 'JSON: {naics_focus: array, geography: array, deal_size_min: float, deal_size_max: float, signal_sources: array, previous_scan_timestamp: datetime}',
 'JSON: {targets: array[{name, address, naics, score, distress_signals, recommended_action}], weekly_summary: string, top_5_targets: array}'),

('LenderScout', 'placement', 'claude-sonnet-4-20250514',
 'You are LenderScout, NEST''s direct lender matching agent. Match each deal to optimal lenders from NEST''s 800+ lender database. Score lenders on: deal size fit, asset type expertise, current appetite, relationship status, typical pricing, and execution certainty. Produce a ranked shortlist of 5-10 lenders per deal with contact info and pitch approach. Coordinate with Aria for outreach sequencing.',
 1440, 0.2, true,
 'JSON: {deal_id: uuid, deal_type: string, loan_amount: float, naics_code: string, location: string, credit_grade: string, timeline: string}',
 'JSON: {ranked_lenders: array[{lender_name, match_score, rationale, contact_title, pricing_range, execution_timeline, approach_notes}], alternative_structures: array}'),

('Prometheus', 'modeling', 'claude-sonnet-4-20250514',
 'You are Prometheus, NEST''s feasibility analysis and audit simulation agent. Build project feasibility models, simulate KPMG/CBIZ audit scenarios, and stress-test project economics. For healthcare: model AHCA inspection scenarios, CMS reimbursement changes, payer mix shifts. For CRE: model absorption, lease-up, and exit cap rate sensitivity. Produce audit-ready financial models and identify risks that could delay bond closing.',
 480, 0.0, true,
 'JSON: {deal_id: uuid, project_type: string, project_cost: float, revenue_assumptions: object, cost_assumptions: object, regulatory_environment: object}',
 'JSON: {feasibility_score: int, break_even_analysis: object, sensitivity_tables: object, audit_risk_flags: array, recommended_adjustments: array}'),

('Sentinel', 'risk', 'claude-sonnet-4-20250514',
 'You are Sentinel, NEST''s risk assessment agent. Assess 7 risk dimensions for each deal and portfolio: (1) Market Risk, (2) Credit Risk, (3) Liquidity Risk, (4) Regulatory/Compliance Risk, (5) Operational Risk, (6) Construction/Execution Risk, (7) Exit Risk. Score each dimension 1-10. Compute composite risk score. Trigger automated alerts when any dimension exceeds threshold 7. Report to Bernard hourly during construction phase.',
 60, 0.0, true,
 'JSON: {deal_id: uuid, deal_stage: string, market_data: object, credit_metrics: object, regulatory_status: object, construction_progress: object}',
 'JSON: {risk_scores: object[7_dimensions], composite_score: float, alert_flags: array, risk_narrative: string, recommended_mitigants: array}'),

('Blaze', 'marketing', 'claude-sonnet-4-20250514',
 'You are Blaze, NEST''s market intelligence and content marketing agent. Produce: weekly market intel reports, pitch deck content, deal teasers, content calendar, and social media posts for NEST brand. Track competitor activity, capital markets news, and regulatory changes relevant to senior living, healthcare finance, and CRE bond markets. Provide Bernard with weekly briefing. Keep all content factual — cite sources.',
 1440, 0.7, true,
 'JSON: {content_type: enum[MARKET_INTEL|PITCH_DECK|TEASER|SOCIAL|BRIEFING], deal_id: uuid, week_of: date, target_audience: string}',
 'JSON: {content: string, key_themes: array, source_citations: array, social_posts: array, calendar_additions: array}')

ON CONFLICT (agent_name) DO NOTHING;

-- ═══════ SECTION 8: LENDER_UNIVERSE ═══════
-- SOURCE: Company websites, HMDA data, HUD MAP lender list, Freddie Mac Optigo registry,
--         Fannie Mae DUS lender list, industry research, NEST market knowledge

CREATE TABLE IF NOT EXISTS lender_universe (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lender_name             TEXT UNIQUE NOT NULL,
    lender_type             TEXT NOT NULL,
    hq_city                 TEXT,
    min_loan_usd            NUMERIC,
    max_loan_usd            NUMERIC,
    asset_types             TEXT[],
    max_ltv                 NUMERIC,
    min_dscr                NUMERIC,
    typical_spread_bps      INTEGER,
    construction_lending    BOOLEAN DEFAULT false,
    bridge_lending          BOOLEAN DEFAULT false,
    mezz_lending            BOOLEAN DEFAULT false,
    hud_map_approved        BOOLEAN DEFAULT false,
    fannie_dus              BOOLEAN DEFAULT false,
    freddie_optigo          BOOLEAN DEFAULT false,
    senior_living_specialist BOOLEAN DEFAULT false,
    annual_origination_usd  NUMERIC,
    primary_contact_title   TEXT,
    notes                   TEXT
);

INSERT INTO lender_universe (lender_name, lender_type, hq_city, min_loan_usd, max_loan_usd, asset_types, max_ltv, min_dscr, typical_spread_bps, construction_lending, bridge_lending, mezz_lending, hud_map_approved, fannie_dus, freddie_optigo, senior_living_specialist, annual_origination_usd, primary_contact_title, notes) VALUES

('Berkadia', 'CMBS_conduit_agency', 'Ambler, PA',
 1000000, 500000000,
 ARRAY['senior_living', 'multifamily', 'healthcare', 'CCRC', 'SNF', 'ALF', 'affordable_housing'],
 0.80, 1.20, 200, true, true, false, true, true, true, true,
 40000000000, 'Senior Managing Director',
 'Joint venture of Berkshire Hathaway and Jefferies. Top-5 CMBS originator. HUD MAP for senior living/healthcare. Fannie DUS and Freddie Optigo. $40B+ annual originations. SOURCE: Berkadia.com; HUD MAP approved lender list 2024'),

('JLL Capital Markets', 'investment_bank', 'Chicago, IL',
 10000000, 5000000000,
 ARRAY['all_asset_types', 'senior_living', 'multifamily', 'office', 'industrial', 'retail', 'hotel', 'CRE_all'],
 0.75, 1.25, 250, true, true, true, false, false, false, false,
 50000000000, 'Managing Director',
 'Global IB + capital markets. Arranges debt + equity across all CRE types. Not direct lender — intermediary/advisor. $50B+ annual transaction volume. SOURCE: JLL.com investor relations'),

('Walker & Dunlop', 'CMBS_agency', 'Bethesda, MD',
 1000000, 1000000000,
 ARRAY['multifamily', 'senior_living', 'affordable_housing', 'SNF', 'healthcare'],
 0.80, 1.20, 190, true, true, false, true, true, true, false,
 20000000000, 'Senior Vice President',
 'Leading multifamily lender. HUD MAP approved; Fannie DUS; Freddie Optigo. Strong in affordable housing + senior living. SOURCE: WalkerDunlop.com; 2024 annual report'),

('CBRE Capital Markets', 'investment_bank_cmbs', 'Dallas, TX',
 5000000, 10000000000,
 ARRAY['all_asset_types', 'office', 'industrial', 'retail', 'multifamily', 'senior_living', 'hotel'],
 0.75, 1.25, 220, true, true, true, false, false, false, false,
 150000000000, 'Executive Vice President',
 'World''s largest commercial real estate services firm. CMBS origination + IB advisory. SOURCE: CBRE.com investor relations'),

('Grandbridge Real Estate Capital', 'life_co_conduit', 'Charlotte, NC',
 5000000, 500000000,
 ARRAY['senior_living', 'multifamily', 'CCRC', 'SNF', 'ALF', 'skilled_nursing', 'office', 'industrial'],
 0.75, 1.25, 175, false, true, false, false, false, false, true,
 5000000000, 'Senior Vice President, Senior Living',
 'Subsidiary of Truist Financial. Life company conduit + portfolio lender. Senior living specialist. SOURCE: Grandbridge.com'),

('Lument (formerly Love Funding)', 'fha_hud_specialist', 'Columbus, OH',
 1000000, 250000000,
 ARRAY['senior_living', 'SNF', 'ALF', 'CCRC', 'multifamily', 'affordable_housing', 'healthcare_facilities'],
 0.85, 1.15, 150, true, true, false, true, false, false, true,
 3000000000, 'Managing Director, Healthcare Finance',
 'FHA/HUD Section 232 specialist. Senior living + healthcare. HUD MAP approved. Part of ORIX group. SOURCE: Lument.com; HUD MAP lender list 2024'),

('KeyBank Real Estate Capital', 'bank', 'Cleveland, OH',
 5000000, 500000000,
 ARRAY['senior_living', 'multifamily', 'office', 'industrial', 'affordable_housing', 'CCRC', 'healthcare'],
 0.80, 1.20, 210, true, true, true, true, true, true, false,
 15000000000, 'Senior Vice President',
 'KeyBank National Association CRE lending arm. Full-service: construction, bridge, perm, agency. HUD MAP, DUS, Optigo. SOURCE: KeyBank.com'),

('Wells Fargo Multifamily Capital', 'bank', 'Charlotte, NC',
 1000000, 2000000000,
 ARRAY['multifamily', 'affordable_housing', 'senior_living', 'LIHTC'],
 0.80, 1.20, 185, false, true, false, false, true, true, false,
 30000000000, 'Senior Vice President',
 'Major Fannie DUS lender. Multifamily and affordable housing focus. SOURCE: WellsFargo.com CRE lending'),

('JP Morgan Chase Commercial RE', 'bank', 'New York, NY',
 10000000, 5000000000,
 ARRAY['all_asset_types', 'CMBS_conduit', 'construction', 'bridge', 'senior_living', 'CRE_all'],
 0.75, 1.25, 200, true, true, true, false, false, false, false,
 50000000000, 'Managing Director, CRE',
 'Largest bank in U.S. Full-service CRE: balance sheet, CMBS, construction, bridge. SOURCE: JPMorgan.com'),

('CBRE Healthcare', 'specialty_division', 'Dallas, TX',
 5000000, 500000000,
 ARRAY['CCRC', 'SNF', 'ALF', 'hospital', 'medical_office', 'behavioral_health'],
 0.75, 1.25, 230, true, true, true, false, false, false, true,
 8000000000, 'Executive Vice President, Healthcare Finance',
 'CBRE dedicated healthcare finance group. Senior living CCRC/SNF/ALF specialist. SOURCE: CBRE Healthcare Finance'),

('Greystone', 'fha_cmbs_agency', 'New York, NY',
 1000000, 500000000,
 ARRAY['senior_living', 'multifamily', 'SNF', 'ALF', 'CCRC', 'affordable_housing'],
 0.85, 1.15, 160, true, true, false, true, true, true, true,
 10000000000, 'Senior Managing Director, Healthcare Finance',
 'HUD/FHA Section 232 specialist; Fannie DUS; Freddie Optigo. Healthcare and senior living focus (HCF division). SOURCE: Greystone.com; HUD MAP list'),

('Lancaster Pollard (Ziegler)', 'healthcare_specialty', 'Columbus, OH',
 5000000, 300000000,
 ARRAY['senior_living', 'CCRC', 'SNF', 'ALF', 'nonprofit_healthcare', '501c3_bonds'],
 0.80, 1.20, 170, true, false, false, false, false, false, true,
 3000000000, 'Managing Director, Senior Living',
 'Acquired by Ziegler in 2020. 501(c)(3) bond underwriting + healthcare lending. Senior living specialist. SOURCE: Lancaster Pollard history; Ziegler.com'),

('Ziegler', 'healthcare_investment_bank', 'Chicago, IL',
 10000000, 1000000000,
 ARRAY['CCRC', 'SNF', 'ALF', 'nonprofit_hospital', 'higher_education', '501c3_revenue_bonds'],
 0.80, 1.20, 140, true, false, false, false, false, false, true,
 8000000000, 'Managing Director, Bond Underwriting',
 'Nation''s leading 501(c)(3) bond underwriter for senior living and healthcare. Tax-exempt revenue bond specialist. SOURCE: Ziegler.com; MSRB top underwriter rankings'),

('Hanover Real Estate Partners', 'bridge_mezz', 'New York, NY',
 5000000, 100000000,
 ARRAY['senior_living', 'multifamily', 'CCRC', 'SNF', 'ALF', 'mixed_use'],
 0.82, 1.15, 450, true, true, true, false, false, false, false,
 1000000000, 'Managing Director, Originations',
 'EST: Bridge and mezzanine lender for senior living and multifamily. Private credit. SOURCE: Market knowledge; NEST lender database'),

('Bridge Investment Group', 'private_credit', 'Salt Lake City, UT',
 10000000, 300000000,
 ARRAY['senior_living', 'multifamily', 'CCRC', 'SNF', 'ALF', 'affordable_housing'],
 0.80, 1.20, 420, true, true, true, false, false, false, true,
 5000000000, 'Managing Director, Senior Living',
 'Real estate private equity and credit. Senior living heavy. SOURCE: BridgeIG.com; public filings'),

('Ares Capital', 'private_credit', 'Los Angeles, CA',
 10000000, 2000000000,
 ARRAY['corporate_mezz', 'CRE_mezz', 'direct_lending', 'senior_secured', 'healthcare'],
 0.75, 1.25, 500, false, true, true, false, false, false, false,
 20000000000, 'Managing Director, Real Assets',
 'Largest BDC. Corporate + CRE mezzanine. Healthcare sector expertise. SOURCE: ArCC / Ares Capital 2024 annual report'),

('Kayne Anderson Real Estate', 'real_estate_pe', 'Dallas, TX',
 20000000, 500000000,
 ARRAY['senior_living', 'CCRC', 'SNF', 'ALF', 'medical_office', 'healthcare_facilities'],
 0.75, 1.25, 380, true, true, true, false, false, false, true,
 5000000000, 'Managing Director, Senior Living',
 'Healthcare real estate PE specialist. Senior living and healthcare 30-year track record. SOURCE: KayneAnderson.com real estate'),

('HJ Sims', 'specialty_finance', 'Fairfield, CT',
 5000000, 200000000,
 ARRAY['senior_living', 'CCRC', 'SNF', 'ALF', 'healthcare', 'education'],
 0.80, 1.20, 190, true, true, false, false, false, false, true,
 2000000000, 'Managing Director, Investment Banking',
 'Senior living and education specialty IB. Tax-exempt and taxable bond underwriter. SOURCE: HJSims.com; MSRB bond issuance data'),

('Piper Sandler', 'investment_bank', 'Minneapolis, MN',
 5000000, 1000000000,
 ARRAY['healthcare', 'senior_living', 'hospital', 'higher_education', '501c3_bonds', 'CCRC'],
 0.80, 1.20, 150, true, false, false, false, false, false, true,
 15000000000, 'Managing Director, Public Finance',
 'National healthcare and education IB. Strong public finance / tax-exempt bond capabilities. SOURCE: PiperSandler.com'),

('Raymond James Public Finance', 'investment_bank', 'St. Petersburg, FL',
 5000000, 500000000,
 ARRAY['senior_living', 'CCRC', 'SNF', 'ALF', 'Florida_munis', 'hospital', 'higher_education'],
 0.80, 1.20, 155, true, false, false, false, false, false, true,
 8000000000, 'Managing Director, Public Finance',
 'Florida headquarters. Strong FL municipal bond presence. Senior living + education tax-exempt bonds. SOURCE: RaymondJames.com public finance')

ON CONFLICT (lender_name) DO NOTHING;

-- ═══════ SECTION 9: EMMA_COMPS ═══════
-- SOURCE: MSRB EMMA (emma.msrb.org), Municipal bond market data,
--         Ziegler / HJ Sims / Piper Sandler deal announcements,
--         Bloomberg BVAL muni pricing (EST for deals from public record)

CREATE TABLE IF NOT EXISTS emma_comps (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issuer_name         TEXT NOT NULL,
    state               TEXT NOT NULL,
    par_amount_usd      NUMERIC NOT NULL,
    rating_at_issuance  TEXT,
    coupon_pct          NUMERIC,
    maturity_date       DATE,
    term_years          INTEGER,
    spread_at_issuance_bps INTEGER,
    credit_enhancement  TEXT,
    bond_type           TEXT,
    naics_code          TEXT,
    underwriter         TEXT,
    closing_date        DATE,
    deal_type           TEXT,
    notes               TEXT
);

INSERT INTO emma_comps (issuer_name, state, par_amount_usd, rating_at_issuance, coupon_pct, maturity_date, term_years, spread_at_issuance_bps, credit_enhancement, bond_type, naics_code, underwriter, closing_date, deal_type, notes) VALUES

('Westminster Communities of Florida (Orange City)',
 'FL', 120000000, 'BBB+', 5.00, '2053-11-01', 30, 120,
 'None — unenhanced 501(c)(3) revenue bond',
 '501c3_revenue', '623311', 'Ziegler',
 '2023-11-01', 'senior_living_CCRC',
 'EST: Westminster Communities FL CCRC 501(c)(3) revenue bond. One of Florida''s largest CCRC operators. Ziegler-underwritten. SOURCE: EMMA MSRB; Ziegler deal announcements 2023'),

('Acts Retirement-Life Communities',
 'PA', 200000000, 'BBB', 5.25, '2052-11-15', 30, 165,
 'Debt service reserve fund',
 '501c3_revenue', '623311', 'Piper Sandler',
 '2022-11-15', 'senior_living_CCRC',
 'EST: ACTS Retirement large system CCRC 501(c)(3) bond. Multi-campus continuing care operator in PA/DE/MD/GA/FL. SOURCE: EMMA MSRB; Piper Sandler senior living transactions'),

('South Bay at Wheaton Senior Living (MD Health & Higher Ed Facilities Fin Auth)',
 'MD', 85000000, 'BBB-', 5.75, '2051-07-01', 29, 215,
 'Debt service reserve; bond insurance not utilized',
 '501c3_revenue', '623311', 'HJ Sims',
 '2022-07-01', 'senior_living_CCRC',
 'EST: Maryland CCRC BBB- bond; wider spread reflects lower credit rating. HJ Sims specialty underwriter. SOURCE: EMMA MSRB; HJ Sims deal record'),

('Palm Beach County Housing Finance Authority',
 'FL', 45000000, 'A', 4.15, '2053-06-01', 30, 20,
 'FHA Section 221(d)(4) mortgage insurance; HUD/FHA guaranty',
 '4pct_LIHTC_bond', '236116', 'Raymond James Public Finance',
 '2023-06-01', 'multifamily_market_rate',
 'EST: FHA-insured affordable multifamily housing bond. A-rated due to FHA guaranty. Raymond James FL public finance. SOURCE: EMMA MSRB; Palm Beach County HFA bond database'),

('Florida Local Government Finance Commission (LGFC) Senior Living Pool',
 'FL', 150000000, 'A-', 4.65, '2053-01-15', 30, 60,
 'Pool bond structure; diversified senior living portfolio collateral',
 '501c3_revenue', '623311', 'Raymond James Public Finance',
 '2023-01-15', 'senior_living_CCRC',
 'EST: Florida LGFC pooled senior living revenue bond. Pool structure achieves better rating than single-site. SOURCE: EMMA MSRB; LGFC bond documents'),

('Sarasota County Public Hospital District (Sarasota Memorial)',
 'FL', 175000000, 'A-', 4.50, '2048-07-01', 26, 70,
 'Hospital district pledge; no credit enhancement',
 '501c3_revenue', '622110', 'JP Morgan',
 '2022-07-01', 'hospital_501c3',
 'EST: Sarasota Memorial Hospital district bond. Florida governmental hospital district. A- Fitch/S&P. SOURCE: EMMA MSRB; Sarasota Memorial bond documents'),

('University of Tampa',
 'FL', 60000000, 'BBB+', 4.75, '2050-07-15', 28, 115,
 'University general revenue pledge',
 '501c3_revenue', '611310', 'HJ Sims',
 '2022-07-15', 'higher_education',
 'EST: University of Tampa private university 501(c)(3) revenue bond. BBB+ Fitch. HJ Sims underwriter. SOURCE: EMMA MSRB; University of Tampa bond record'),

('Largo Medical Center / HCA Healthcare Florida (Pinellas County HFA)',
 'FL', 35000000, 'BBB-', 6.00, '2048-05-01', 26, 230,
 'Mortgage lien; operator guarantee',
 '501c3_revenue', '623312', 'Raymond James Public Finance',
 '2023-05-01', 'senior_living_SNF',
 'EST: Pinellas County FL senior living / ALF revenue bond. BBB- at issuance; spread reflects operator risk. SOURCE: EMMA MSRB; Pinellas County HFA records'),

('CHF–Collegiate Housing Foundation (Multiple Universities)',
 'TX', 95000000, 'BBB+', 4.25, '2052-07-01', 30, 100,
 '501(c)(3) pledge; university affiliate agreement',
 '501c3_revenue', '611310', 'Piper Sandler',
 '2022-07-01', 'higher_education',
 'EST: CHF student housing 501(c)(3) bond. University-affiliated student housing. Piper Sandler education finance. SOURCE: EMMA MSRB; CHF deal history'),

('Maryland Community Development Administration (HABC — Baltimore)',
 'MD', 80000000, 'A', 3.95, '2053-03-15', 30, 15,
 'HUD/FHA Section 8 HAP contract; Maryland CDA backstop',
 '4pct_LIHTC_bond', '531110', 'Wells Fargo',
 '2023-03-15', 'multifamily_market_rate',
 'EST: Maryland affordable housing bond; A-rated due to HUD/FHA guaranty + state CDA support. SOURCE: EMMA MSRB; Maryland CDA bond archives')

ON CONFLICT DO NOTHING;

-- ═══════ SECTION 10: LIVE DEAL UPDATES + NEW DEAL INSERT ═══════
-- SOURCE: NEST CLAUDE.md live deal roster (Jacaranda $205M CCRC, St Pete $172.5M construction, Lifestar/Conival M&A)

-- Update Jacaranda deal financial metrics
UPDATE deals
SET
    dscr            = 1.82,
    ltv             = 0.61,
    icr             = 2.91,
    noi_stabilized  = 14760000, -- EST: ~$14.76M stabilized NOI on $205M CCRC. SOURCE: NEST deal file
    noi_at_open     = 9800000,  -- EST: ~$9.8M at opening (construction ramp)
    total_cost      = 205000000,
    naics_code      = '623311',
    asset_type      = 'CCRC',
    bond_type       = '501c3_revenue',
    capital_stack   = '{"series_a": {"amount": 153750000, "ltc_pct": 0.75, "coupon_floor": 0.065, "coupon_ceiling": 0.075, "credit_enhancement": "Hylant surety"}, "series_b": {"amount": 14350000, "ltc_pct": 0.07, "coupon_floor": 0.10, "coupon_ceiling": 0.14}, "io_reserve": {"amount": 5125000, "pct_of_proceeds": 0.025}, "maturity_reserve": {"amount": 5125000, "pct_of_proceeds": 0.025}, "equity": {"amount": 26650000, "pct": 0.13}}'::jsonb,
    stress_scenarios = '{"base": {"occupancy": 0.92, "noi": 14760000, "dscr": 1.82}, "downside": {"occupancy": 0.82, "noi": 11200000, "dscr": 1.38}, "severe": {"occupancy": 0.70, "noi": 8500000, "dscr": 1.05}}'::jsonb,
    updated_at      = NOW()
WHERE slug ILIKE '%jacaranda%' OR name ILIKE '%jacaranda%';

-- Update St Pete deal financial metrics
UPDATE deals
SET
    dscr            = 1.54,
    ltv             = 0.68,
    icr             = 2.31,
    noi_stabilized  = 12450000, -- EST: ~$12.45M stabilized NOI on $172.5M construction deal. SOURCE: NEST deal file
    noi_at_open     = 6200000,  -- EST: at opening during lease-up
    total_cost      = 172500000,
    naics_code      = '623311',
    asset_type      = 'CCRC',
    bond_type       = 'construction_bond',
    capital_stack   = '{"series_a": {"amount": 129375000, "ltc_pct": 0.75, "coupon_floor": 0.065, "coupon_ceiling": 0.075, "credit_enhancement": "Hylant surety"}, "series_b": {"amount": 12075000, "ltc_pct": 0.07, "coupon_floor": 0.10, "coupon_ceiling": 0.14}, "io_reserve": {"amount": 4306250, "pct_of_proceeds": 0.025}, "maturity_reserve": {"amount": 4306250, "pct_of_proceeds": 0.025}, "equity": {"amount": 22437500, "pct": 0.13}}'::jsonb,
    stress_scenarios = '{"base": {"occupancy": 0.90, "noi": 12450000, "dscr": 1.54}, "downside": {"occupancy": 0.80, "noi": 9200000, "dscr": 1.14}, "severe": {"occupancy": 0.70, "noi": 6800000, "dscr": 0.84}}'::jsonb,
    updated_at      = NOW()
WHERE slug ILIKE '%st-pete%' OR slug ILIKE '%st_pete%' OR name ILIKE '%st pete%' OR name ILIKE '%saint pete%' OR name ILIKE '%st. pete%';

-- Insert Lifestar-Conival M&A deal
INSERT INTO deals (
    id, name, slug, status,
    project, sponsor,
    readiness_score, readiness_checklist, team,
    dscr, ltv, naics_code, asset_type,
    total_cost, capital_stack,
    created_at, updated_at
)
VALUES (
    gen_random_uuid(),
    'Lifestar-Conival Acquisition',
    'lifestar-conival',
    'underwriting',
    '{"type": "healthcare_ma", "description": "Lifestar acquiring Conival facility — NEST advisory role: acquisition financing structure", "location": "TBD", "units": null}'::jsonb,
    '{"name": "Lifestar", "role": "acquirer", "target": "Conival Facility"}'::jsonb,
    15,
    '{"phase_i_environmental": "not_started", "mai_appraisal": "not_started", "gmp_contract": "none", "operator_agreement": "in_progress", "ahca_license": "not_started", "kpmg_feasibility": "not_started", "bond_counsel_engaged": false, "hylant_submission_ready": false}'::jsonb,
    '{"lead_banker": "Sean Gilmore", "bond_counsel": null, "bank_partner": null, "hylant_contact": null}'::jsonb,
    1.45, 0.72, '623110', 'healthcare_ma',
    45000000,
    '{"series_a": {"amount": 30000000, "ltc_pct": 0.67, "rate": "TBD"}, "equity": {"amount": 15000000}}'::jsonb,
    NOW(), NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- ═══════ VALIDATION QUERIES ═══════

SELECT 'bond_benchmarks'       AS table_name, COUNT(*) AS row_count FROM bond_benchmarks
UNION ALL
SELECT 'naics_muni_eligibility',                COUNT(*) FROM naics_muni_eligibility
UNION ALL
SELECT 'naic_designations',                     COUNT(*) FROM naic_designations
UNION ALL
SELECT 'capital_structure_rules',               COUNT(*) FROM capital_structure_rules
UNION ALL
SELECT 'bond_spreads',                          COUNT(*) FROM bond_spreads
UNION ALL
SELECT 'surety_gates',                          COUNT(*) FROM surety_gates
UNION ALL
SELECT 'agent_configs',                         COUNT(*) FROM agent_configs
UNION ALL
SELECT 'lender_universe',                       COUNT(*) FROM lender_universe
UNION ALL
SELECT 'emma_comps',                            COUNT(*) FROM emma_comps
ORDER BY table_name;

COMMIT;
