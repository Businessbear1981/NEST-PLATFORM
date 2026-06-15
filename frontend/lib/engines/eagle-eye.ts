// ─────────────────────────────────────────────────────────────────────────────
// EAGLE EYE — Data Room Scoring Engine
// NEST Advisors · Arden Edge Capital
// Jacaranda Trace PLOM ($231M, Florida LGFC, Hylant surety) is the structural
// template for all scoring benchmarks.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'audited_financials'
  | 'appraisal'
  | 'feasibility_study'
  | 'environmental_phase1'
  | 'environmental_phase2'
  | 'permits'
  | 'gmp_contract'
  | 'market_study'
  | 'title_report'
  | 'organizational_docs'
  | 'tax_returns'
  | 'bank_statements'
  | 'sponsor_resume'
  | 'legal_opinion';

export interface Document {
  type: DocumentType;
  present: boolean;
  quality?: 'complete' | 'partial' | 'outdated';
  pageCount?: number;
}

export interface DealInput {
  naicsCode: string;
  bondFace: number;
  dscr?: number;
  ltv?: number;
  noi?: number;
  documents: Document[];
  isNonprofit?: boolean;
  isGreenProject?: boolean;
  state?: string;
  sponsorYearsExperience?: number;
}

export interface EagleEyeScore {
  overall: number;         // 0–100
  proceed: boolean;        // overall >= 65
  decision: 'PROCEED' | 'ENHANCE' | 'DECLINE';
  pillars: {
    documentation: number; // 0–25
    financial: number;     // 0–30
    legal: number;         // 0–20
    market: number;        // 0–15
    sponsor: number;       // 0–10
  };
  gaps: Gap[];
  bondTypeRecommendation: BondTypeRec;
  brief: BriefSection[];
}

export interface Gap {
  item: string;
  severity: 'critical' | 'major' | 'minor';
  action: string;
  estimatedDaysToFix: number;
}

export interface BondTypeRec {
  primary: string;
  rationale: string;
  estimatedCoupon: number;   // percentage, e.g. 6.75
  nestFeeUSD: number;        // flat fee in USD
  hylantRequired: boolean;
}

export interface BriefSection {
  title: string;
  content: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Points allocated per document type (total possible = 29; normalized to 25).
 * audited_financials dominates — no deal advances without it.
 */
const DOC_WEIGHTS: Record<DocumentType, number> = {
  audited_financials:   8,
  appraisal:            5,
  feasibility_study:    4,
  environmental_phase1: 3,
  gmp_contract:         3,
  permits:              2,
  environmental_phase2: 1,
  market_study:         1,
  title_report:         1,
  organizational_docs:  1,
  tax_returns:          1,
  bank_statements:      1,
  sponsor_resume:       1,
  legal_opinion:        1,
};

const DOC_WEIGHT_MAX = Object.values(DOC_WEIGHTS).reduce((s, v) => s + v, 0); // 33

/**
 * Quality multipliers — partial and outdated docs score at a discount.
 */
const QUALITY_MULT: Record<string, number> = {
  complete: 1.0,
  partial:  0.5,
  outdated: 0.3,
};

/**
 * JPMorgan credit benchmarks (hardcoded per CLAUDE.md).
 */
const JPM = {
  A:    { dscr: 2.0,  ltv: 0.55 },
  BBBp: { dscr: 1.75, ltv: 0.62 },
  BBBm: { dscr: 1.5,  ltv: 0.70 },
  subIG: { dscr: 1.5 },           // any DSCR below this = sub-IG
};

/**
 * NAICS → bond type mapping.
 * 6231 nursing · 6232 CCRC · 6233 senior housing · 8011 healthcare · 2211 renewable
 */
const NAICS_BOND_MAP: Record<string, { primary: string; couponBase: number; nonprofit: boolean }> = {
  '6232': { primary: 'Nonprofit Revenue Bond (CCRC)',           couponBase: 6.50,  nonprofit: true  },
  '6231': { primary: 'Nonprofit Revenue Bond (Nursing/SNF)',    couponBase: 6.75,  nonprofit: true  },
  '6233': { primary: 'Senior Housing Revenue Bond',             couponBase: 7.00,  nonprofit: false },
  '8011': { primary: 'Healthcare Facility Revenue Bond',        couponBase: 6.25,  nonprofit: true  },
  '2211': { primary: 'Green/Clean-Energy Revenue Bond',         couponBase: 5.75,  nonprofit: false },
};

const DEFAULT_BOND = { primary: 'Taxable Corporate Revenue Bond', couponBase: 7.50, nonprofit: false };

// NEST fee schedule: 1.5% of bond face, floored at $250k, capped at $2.5M
const NEST_FEE_RATE = 0.015;
const NEST_FEE_MIN  = 250_000;
const NEST_FEE_MAX  = 2_500_000;

// ── 1. scoreDocumentation ─────────────────────────────────────────────────────

/**
 * Score the data room's documentation completeness.
 * Returns 0–25 (pillar max).
 *
 * Logic:
 *  - Each present doc earns its weight × quality multiplier (default 1.0 if quality omitted).
 *  - Raw points are normalized to a 0–25 scale.
 *  - audited_financials absence is treated as a hard 50% pillar cap (deal cannot score
 *    above 12.5 on documentation without financials regardless of other docs).
 */
export function scoreDocumentation(docs: Document[]): number {
  let earned = 0;

  for (const doc of docs) {
    if (!doc.present) continue;
    const weight = DOC_WEIGHTS[doc.type] ?? 1;
    const mult   = doc.quality ? (QUALITY_MULT[doc.quality] ?? 1.0) : 1.0;
    earned += weight * mult;
  }

  const normalized = Math.round((earned / DOC_WEIGHT_MAX) * 25);
  const capped      = Math.min(25, normalized);

  // Hard cap: no audited financials → cannot score above 12 on documentation
  const hasAuditedFinancials = docs.some(
    (d) => d.type === 'audited_financials' && d.present && d.quality !== 'outdated',
  );
  return hasAuditedFinancials ? capped : Math.min(capped, 12);
}

// ── 2. scoreFinancials ────────────────────────────────────────────────────────

/**
 * Score financials against JPMorgan benchmarks.
 * Returns 0–30 (pillar max).
 *
 * DSCR (0–18 pts):
 *   >= 2.0  → 18  (A-grade)
 *   >= 1.75 → 14  (BBB+)
 *   >= 1.5  → 10  (BBB-)
 *   >= 1.25 → 6   (sub-IG but serviceable)
 *   < 1.25  → 0   (non-serviceable)
 *
 * LTV (0–12 pts):
 *   <= 55%  → 12
 *   <= 62%  → 9
 *   <= 70%  → 6
 *   <= 80%  → 3
 *   > 80%   → 0
 */
export function scoreFinancials(
  dscr?: number,
  ltv?: number,
  noi?: number,
  bondFace?: number,
): number {
  let dscrPts = 0;
  let ltvPts  = 0;

  // DSCR scoring
  if (dscr !== undefined) {
    if (dscr >= JPM.A.dscr)    dscrPts = 18;
    else if (dscr >= JPM.BBBp.dscr) dscrPts = 14;
    else if (dscr >= JPM.BBBm.dscr) dscrPts = 10;
    else if (dscr >= 1.25)          dscrPts = 6;
    else                             dscrPts = 0;
  } else if (noi !== undefined && bondFace !== undefined && bondFace > 0) {
    // Derive implied DSCR from NOI / estimated annual debt service (7% coupon proxy)
    const annualDebtService = bondFace * 0.07;
    const impliedDscr = noi / annualDebtService;
    if (impliedDscr >= JPM.A.dscr)     dscrPts = 18;
    else if (impliedDscr >= JPM.BBBp.dscr) dscrPts = 14;
    else if (impliedDscr >= JPM.BBBm.dscr) dscrPts = 10;
    else if (impliedDscr >= 1.25)           dscrPts = 6;
  }

  // LTV scoring
  if (ltv !== undefined) {
    if (ltv <= JPM.A.ltv)     ltvPts = 12;
    else if (ltv <= JPM.BBBp.ltv) ltvPts = 9;
    else if (ltv <= JPM.BBBm.ltv) ltvPts = 6;
    else if (ltv <= 0.80)          ltvPts = 3;
    else                           ltvPts = 0;
  } else {
    // No LTV provided — award half credit (deal may still be viable)
    ltvPts = 6;
  }

  return Math.min(30, dscrPts + ltvPts);
}

// ── 3. identifyGaps ───────────────────────────────────────────────────────────

/**
 * Identify missing documentation and financial shortfalls.
 * Returns gaps sorted by severity (critical → major → minor).
 */
export function identifyGaps(deal: DealInput): Gap[] {
  const gaps: Gap[] = [];
  const docMap = new Map<DocumentType, Document>();
  for (const d of deal.documents) {
    docMap.set(d.type, d);
  }

  // ── Documentation gaps ────────────────────────────────────────────────────

  const missing = (type: DocumentType) => {
    const d = docMap.get(type);
    return !d || !d.present || d.quality === 'outdated';
  };

  if (missing('audited_financials')) {
    gaps.push({
      item: 'Audited Financial Statements (3-year)',
      severity: 'critical',
      action: 'Engage CPA firm immediately; deliver audited statements for past 3 fiscal years.',
      estimatedDaysToFix: 45,
    });
  } else {
    const q = docMap.get('audited_financials')?.quality;
    if (q === 'partial') {
      gaps.push({
        item: 'Audited Financials — incomplete year coverage',
        severity: 'major',
        action: 'Complete missing fiscal years with CPA; full 3-year package required for rating.',
        estimatedDaysToFix: 21,
      });
    }
  }

  if (missing('appraisal')) {
    gaps.push({
      item: 'MAI-Certified Appraisal',
      severity: 'critical',
      action: 'Commission MAI appraisal from FIRREA-compliant firm; must reflect stabilized value.',
      estimatedDaysToFix: 30,
    });
  }

  if (missing('feasibility_study')) {
    gaps.push({
      item: 'Third-Party Feasibility Study',
      severity: 'major',
      action: 'Engage recognized feasibility consultant (e.g., Greystone, HJ Sims) for independent study.',
      estimatedDaysToFix: 35,
    });
  }

  if (missing('environmental_phase1')) {
    gaps.push({
      item: 'Phase I Environmental Site Assessment',
      severity: 'major',
      action: 'Order Phase I ESA from ASTM E1527-21 qualified firm; required before bond closing.',
      estimatedDaysToFix: 20,
    });
  }

  if (missing('permits')) {
    gaps.push({
      item: 'Entitlements / Permits Package',
      severity: 'major',
      action: 'Compile all zoning approvals, building permits, and conditional use orders.',
      estimatedDaysToFix: 30,
    });
  }

  if (missing('gmp_contract')) {
    gaps.push({
      item: 'GMP Construction Contract',
      severity: 'major',
      action: 'Execute Guaranteed Maximum Price contract with bonded general contractor.',
      estimatedDaysToFix: 14,
    });
  }

  if (missing('title_report')) {
    gaps.push({
      item: 'Title Commitment / ALTA Survey',
      severity: 'major',
      action: 'Order ALTA/NSPS title commitment and boundary survey; resolve any Schedule B exceptions.',
      estimatedDaysToFix: 15,
    });
  }

  if (missing('legal_opinion')) {
    gaps.push({
      item: 'Bond Counsel Legal Opinion',
      severity: 'minor',
      action: 'Engage bond counsel (e.g., Akerman, Greenberg Traurig) to issue tax-exemption opinion.',
      estimatedDaysToFix: 20,
    });
  }

  if (missing('market_study')) {
    gaps.push({
      item: 'Market Study',
      severity: 'minor',
      action: 'Commission independent market absorption study from national senior-housing analytics firm.',
      estimatedDaysToFix: 21,
    });
  }

  if (missing('organizational_docs')) {
    gaps.push({
      item: 'Organizational / Entity Documents',
      severity: 'minor',
      action: 'Provide articles of incorporation, operating agreement, board resolutions, and EIN letter.',
      estimatedDaysToFix: 5,
    });
  }

  if (missing('sponsor_resume')) {
    gaps.push({
      item: 'Sponsor Résumé / Track Record',
      severity: 'minor',
      action: 'Prepare sponsor bio with completed project list, references, and personal financial statement.',
      estimatedDaysToFix: 3,
    });
  }

  // ── Financial gaps ────────────────────────────────────────────────────────

  if (deal.dscr !== undefined && deal.dscr < JPM.subIG.dscr) {
    gaps.push({
      item: `DSCR ${deal.dscr.toFixed(2)}x — below 1.5x minimum (sub-investment grade)`,
      severity: 'critical',
      action:
        'Restructure NOI or reduce debt load to achieve minimum 1.5x DSCR before structuring. '
        + 'Consider phased bond issuance or additional equity contribution.',
      estimatedDaysToFix: 60,
    });
  } else if (deal.dscr !== undefined && deal.dscr < JPM.BBBm.dscr) {
    gaps.push({
      item: `DSCR ${deal.dscr.toFixed(2)}x — below BBB- threshold (1.5x)`,
      severity: 'major',
      action: 'Improve NOI through occupancy stabilization or rental rate increase before bond pricing.',
      estimatedDaysToFix: 30,
    });
  }

  if (deal.ltv !== undefined && deal.ltv > 0.80) {
    gaps.push({
      item: `LTV ${(deal.ltv * 100).toFixed(1)}% — exceeds 80% Series A ceiling`,
      severity: 'critical',
      action:
        'Inject additional equity to bring LTV to ≤70% for BBB- rating. '
        + 'Hylant surety line may offset up to 500bps of LTV overage.',
      estimatedDaysToFix: 45,
    });
  } else if (deal.ltv !== undefined && deal.ltv > JPM.BBBm.ltv) {
    gaps.push({
      item: `LTV ${(deal.ltv * 100).toFixed(1)}% — above 70% BBB- ceiling`,
      severity: 'major',
      action: 'Negotiate purchase price reduction or increase equity contribution to reach ≤70% LTV.',
      estimatedDaysToFix: 21,
    });
  }

  // Missing environmental Phase II when Phase I exists but flagged
  const phase1 = docMap.get('environmental_phase1');
  const phase2 = docMap.get('environmental_phase2');
  if (phase1?.present && (!phase2 || !phase2.present)) {
    gaps.push({
      item: 'Phase II Environmental Assessment — not in data room',
      severity: 'minor',
      action: 'If Phase I identified RECs, Phase II is required. Confirm Phase I findings.',
      estimatedDaysToFix: 30,
    });
  }

  // Sort: critical → major → minor
  const ORDER = { critical: 0, major: 1, minor: 2 };
  gaps.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  return gaps;
}

// ── 4. recommendBondType ──────────────────────────────────────────────────────

/**
 * Deterministic NAICS → bond type recommendation.
 * Green projects get a 25bps coupon discount.
 * Nonprofit status enables tax-exempt issuance (federal + state).
 * Hylant surety required if LTV > 70% or bond face > $50M.
 */
export function recommendBondType(deal: DealInput): BondTypeRec {
  const template = NAICS_BOND_MAP[deal.naicsCode] ?? DEFAULT_BOND;

  let coupon = template.couponBase;

  // Green project discount
  if (deal.isGreenProject) coupon -= 0.25;

  // Nonprofit tax-exempt premium relief
  const isNonprofit = deal.isNonprofit ?? template.nonprofit;
  if (isNonprofit) coupon -= 0.50; // tax-exempt saves ~50bps vs taxable

  // Sub-IG uplift if DSCR is below BBB- threshold
  if (deal.dscr !== undefined && deal.dscr < JPM.BBBm.dscr) coupon += 1.25;

  // High-LTV risk premium
  if (deal.ltv !== undefined && deal.ltv > JPM.BBBm.ltv) coupon += 0.75;

  coupon = Math.max(4.5, Math.min(12.0, coupon));

  // NEST fee: 1.5% of bond face, floored at $250k, capped at $2.5M
  const rawFee   = deal.bondFace * NEST_FEE_RATE;
  const nestFee  = Math.min(NEST_FEE_MAX, Math.max(NEST_FEE_MIN, rawFee));

  // Hylant surety required if LTV is elevated or deal is large
  const hylantRequired =
    (deal.ltv !== undefined && deal.ltv > JPM.BBBm.ltv) ||
    deal.bondFace > 50_000_000;

  // Build rationale
  const taxStatus = isNonprofit ? 'tax-exempt' : 'taxable';
  const greenNote = deal.isGreenProject ? ' Green-bond discount applied (−25bps).' : '';
  const hylantNote = hylantRequired
    ? ' Hylant surety/LC credit enhancement required for bond closing.'
    : '';
  const rationale =
    `NAICS ${deal.naicsCode} maps to ${template.primary} (${taxStatus} issuance). `
    + `Jacaranda Trace PLOM ($231M, Florida LGFC) is the structural template.`
    + greenNote
    + hylantNote;

  return {
    primary: template.primary,
    rationale,
    estimatedCoupon: parseFloat(coupon.toFixed(2)),
    nestFeeUSD: Math.round(nestFee),
    hylantRequired,
  };
}

// ── 5. generateBrief ─────────────────────────────────────────────────────────

/**
 * Generate a 5-section deal brief.
 * Jimmy Lee tone: direct, declarative, no hedging.
 */
export function generateBrief(deal: DealInput, score: EagleEyeScore): BriefSection[] {
  const fmt = (n: number, decimals = 0) =>
    n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const fmtUSD = (n: number) =>
    '$' + (n >= 1_000_000 ? fmt(n / 1_000_000, 1) + 'M' : fmt(n / 1_000, 0) + 'K');

  const gradeLabel =
    (deal.dscr ?? 0) >= JPM.A.dscr    ? 'A-grade'
    : (deal.dscr ?? 0) >= JPM.BBBp.dscr ? 'BBB+'
    : (deal.dscr ?? 0) >= JPM.BBBm.dscr ? 'BBB−'
    : 'Sub-Investment-Grade';

  const criticalGaps  = score.gaps.filter((g) => g.severity === 'critical').length;
  const majorGaps     = score.gaps.filter((g) => g.severity === 'major').length;
  const enhancePrefix = criticalGaps > 0 ? 'Critical gaps present. ' : '';

  // ── Section 1: Executive Summary ─────────────────────────────────────────
  const execSummary: BriefSection = {
    title: 'Executive Summary',
    content:
      `Eagle Eye data-room score: ${score.overall}/100 — ${score.decision}. `
      + `Bond face: ${fmtUSD(deal.bondFace)}. `
      + `Recommended structure: ${score.bondTypeRecommendation.primary} at `
      + `${score.bondTypeRecommendation.estimatedCoupon.toFixed(2)}% coupon. `
      + `NEST arrangement fee: ${fmtUSD(score.bondTypeRecommendation.nestFeeUSD)}. `
      + `${enhancePrefix}`
      + (score.proceed
        ? 'Data room supports advancement to structuring. Jacaranda Trace PLOM is the execution template.'
        : `${criticalGaps} critical and ${majorGaps} major gaps must be resolved before structuring.`),
  };

  // ── Section 2: Capital Structure ─────────────────────────────────────────
  const seriesAFace  = deal.bondFace * 0.75;
  const seriesBFace  = deal.bondFace * 0.07;
  const reserveEscrow = deal.bondFace * 0.025;
  const capitalStructure: BriefSection = {
    title: 'Capital Structure',
    content:
      `Series A (75% LTC): ${fmtUSD(seriesAFace)} — investment grade, `
      + `${score.bondTypeRecommendation.estimatedCoupon.toFixed(2)}% coupon, `
      + (score.bondTypeRecommendation.hylantRequired ? 'Hylant surety / LC required.' : 'no surety required.')
      + ` Series B (+7% CLTV): ${fmtUSD(seriesBFace)} — B/BBB bank managed, 10–14% coupon. `
      + `IO pre-funded from proceeds — no cash drag during construction. `
      + `Maturity reserve: ${fmtUSD(reserveEscrow)} escrowed at 2.5%; returned at maturity. `
      + `HFT Fund (Quantum agent) targets 15–25% return on B-tranche AUM.`,
  };

  // ── Section 3: Credit Profile ─────────────────────────────────────────────
  const dscrLine = deal.dscr !== undefined
    ? `DSCR: ${deal.dscr.toFixed(2)}x (${gradeLabel}).`
    : 'DSCR: not provided — financial scoring limited.';
  const ltvLine = deal.ltv !== undefined
    ? ` LTV: ${(deal.ltv * 100).toFixed(1)}%.`
    : ' LTV: not provided.';
  const noiLine = deal.noi !== undefined
    ? ` NOI: ${fmtUSD(deal.noi)}.`
    : '';
  const creditProfile: BriefSection = {
    title: 'Credit Profile',
    content:
      `JPMorgan benchmark comparison — ${dscrLine}${ltvLine}${noiLine} `
      + `Documentation pillar: ${score.pillars.documentation}/25. `
      + `Financial pillar: ${score.pillars.financial}/30. `
      + `Legal pillar: ${score.pillars.legal}/20. `
      + `Market pillar: ${score.pillars.market}/15. `
      + `Sponsor pillar: ${score.pillars.sponsor}/10. `
      + (deal.isNonprofit ? 'Nonprofit status confirmed — tax-exempt issuance eligible. ' : '')
      + (deal.isGreenProject ? 'Green-bond designation reduces coupon 25bps. ' : ''),
  };

  // ── Section 4: Enhancement Strategy ─────────────────────────────────────
  const criticalItems = score.gaps
    .filter((g) => g.severity === 'critical')
    .map((g) => g.item)
    .join('; ');
  const majorItems = score.gaps
    .filter((g) => g.severity === 'major')
    .map((g) => g.item)
    .join('; ');
  const maxDays = score.gaps.length
    ? Math.max(...score.gaps.map((g) => g.estimatedDaysToFix))
    : 0;

  const enhancementStrategy: BriefSection = {
    title: 'Enhancement Strategy',
    content:
      score.gaps.length === 0
        ? 'Data room is complete. No enhancement actions required. Advance to structuring immediately.'
        : (criticalItems
            ? `Critical items — resolve before structuring: ${criticalItems}. `
            : '')
          + (majorItems
            ? `Major items — resolve before bond pricing: ${majorItems}. `
            : '')
          + (score.bondTypeRecommendation.hylantRequired
            ? 'Hylant surety / LC credit enhancement required; engage Hylant immediately. '
            : '')
          + `Estimated data room completion window: ${maxDays} days.`,
  };

  // ── Section 5: Timeline ───────────────────────────────────────────────────
  const gapDaysTotal = score.gaps
    .filter((g) => g.severity !== 'minor')
    .reduce((max, g) => Math.max(max, g.estimatedDaysToFix), 0);
  const structuringDays  = gapDaysTotal + 30;
  const dueDiligenceDays = structuringDays + 45;
  const closingDays      = dueDiligenceDays + 30;

  const timeline: BriefSection = {
    title: 'Timeline',
    content:
      `Day 0: Eagle Eye data room review complete. `
      + (gapDaysTotal > 0 ? `Days 1–${gapDaysTotal}: Resolve critical and major gap items. ` : '')
      + `Day ${structuringDays}: Engage bond counsel; finalize term sheet (${score.bondTypeRecommendation.primary}). `
      + `Day ${dueDiligenceDays}: Rating agency / investor due diligence complete. `
      + `Day ${closingDays}: Target bond closing — ${fmtUSD(deal.bondFace)} face value. `
      + `All milestones reference Jacaranda Trace PLOM (Series 2025) as structural template.`,
  };

  return [execSummary, capitalStructure, creditProfile, enhancementStrategy, timeline];
}

// ── 6. scoreDataRoom — Main Entry Point ──────────────────────────────────────

/**
 * Full Eagle Eye scoring pipeline.
 *
 * Pillar weights:
 *   documentation  25 pts
 *   financial      30 pts
 *   legal          20 pts  (permits + title + legal opinion)
 *   market         15 pts  (market study + feasibility)
 *   sponsor        10 pts  (sponsor experience)
 *   ─────────────────────
 *   total         100 pts
 *
 * Decision thresholds:
 *   >= 80 → PROCEED
 *   >= 65 → ENHANCE (proceed with conditions)
 *   <  65 → DECLINE (fix gaps first)
 */
export function scoreDataRoom(deal: DealInput): EagleEyeScore {
  const docMap = new Map<DocumentType, Document>();
  for (const d of deal.documents) docMap.set(d.type, d);

  const hasDoc = (type: DocumentType) => {
    const d = docMap.get(type);
    return !!(d?.present && d.quality !== 'outdated');
  };

  const qualMult = (type: DocumentType) => {
    const d = docMap.get(type);
    if (!d?.present) return 0;
    return QUALITY_MULT[d.quality ?? 'complete'] ?? 1.0;
  };

  // ── Pillar: Documentation (0–25) ─────────────────────────────────────────
  const documentation = scoreDocumentation(deal.documents);

  // ── Pillar: Financial (0–30) ──────────────────────────────────────────────
  const financial = scoreFinancials(deal.dscr, deal.ltv, deal.noi, deal.bondFace);

  // ── Pillar: Legal (0–20) ──────────────────────────────────────────────────
  // permits (8pts) + title (6pts) + legal opinion (6pts)
  const permitsScore      = hasDoc('permits')       ? Math.round(8  * qualMult('permits'))       : 0;
  const titleScore        = hasDoc('title_report')  ? Math.round(6  * qualMult('title_report'))  : 0;
  const legalOpinionScore = hasDoc('legal_opinion') ? Math.round(6  * qualMult('legal_opinion')) : 0;
  const legal             = Math.min(20, permitsScore + titleScore + legalOpinionScore);

  // ── Pillar: Market (0–15) ─────────────────────────────────────────────────
  // market study (8pts) + feasibility study (7pts)
  const marketStudyScore  = hasDoc('market_study')     ? Math.round(8 * qualMult('market_study'))     : 0;
  const feasibilityScore  = hasDoc('feasibility_study')? Math.round(7 * qualMult('feasibility_study')): 0;
  const market            = Math.min(15, marketStudyScore + feasibilityScore);

  // ── Pillar: Sponsor (0–10) ────────────────────────────────────────────────
  // 1pt per year of experience up to 10pts; sponsor resume presence gives 3 bonus pts
  const yrs           = deal.sponsorYearsExperience ?? 0;
  const resumeBonus   = hasDoc('sponsor_resume') ? 3 : 0;
  const sponsor       = Math.min(10, Math.min(7, yrs) + resumeBonus);

  const overall  = documentation + financial + legal + market + sponsor;
  const proceed  = overall >= 65;
  const decision: EagleEyeScore['decision'] =
    overall >= 80 ? 'PROCEED' : overall >= 65 ? 'ENHANCE' : 'DECLINE';

  const gaps                 = identifyGaps(deal);
  const bondTypeRecommendation = recommendBondType(deal);

  const partialScore: Omit<EagleEyeScore, 'brief'> = {
    overall,
    proceed,
    decision,
    pillars: { documentation, financial, legal, market, sponsor },
    gaps,
    bondTypeRecommendation,
    brief: [],
  };

  const brief = generateBrief(deal, { ...partialScore, brief: [] });

  return { ...partialScore, brief };
}

// ── Live Deal Reference: Jacaranda Trace PLOM ────────────────────────────────

/**
 * Canonical reference deal — Jacaranda Trace PLOM, $231M CCRC, Florida LGFC.
 * Use this to validate Eagle Eye output against a known deal.
 */
export const JACARANDA_TRACE_INPUT: DealInput = {
  naicsCode:              '6232',
  bondFace:               231_000_000,
  dscr:                   1.72,
  ltv:                    0.64,
  noi:                    16_800_000,
  isNonprofit:            true,
  isGreenProject:         false,
  state:                  'FL',
  sponsorYearsExperience: 22,
  documents: [
    { type: 'audited_financials',   present: true,  quality: 'complete', pageCount: 120 },
    { type: 'appraisal',            present: true,  quality: 'complete', pageCount: 85  },
    { type: 'feasibility_study',    present: true,  quality: 'complete', pageCount: 60  },
    { type: 'environmental_phase1', present: true,  quality: 'complete', pageCount: 40  },
    { type: 'environmental_phase2', present: false                                       },
    { type: 'permits',              present: true,  quality: 'partial',  pageCount: 22  },
    { type: 'gmp_contract',         present: true,  quality: 'complete', pageCount: 150 },
    { type: 'market_study',         present: true,  quality: 'complete', pageCount: 55  },
    { type: 'title_report',         present: true,  quality: 'complete', pageCount: 18  },
    { type: 'organizational_docs',  present: true,  quality: 'complete', pageCount: 12  },
    { type: 'tax_returns',          present: true,  quality: 'complete', pageCount: 30  },
    { type: 'bank_statements',      present: true,  quality: 'complete', pageCount: 24  },
    { type: 'sponsor_resume',       present: true,  quality: 'complete', pageCount: 8   },
    { type: 'legal_opinion',        present: false                                       },
  ],
};
