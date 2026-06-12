/**
 * Bond Desk Arrangement Engine — Demo Data + Types
 * CMBS-style pooling, modular mini-bonds, scenarios, economics, Bernard narration.
 */

// ── Types ────────────────────────────────────────────────────────

export type BondRating = "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "NR";
export type CallType = "hard" | "soft" | "none";
export type PutTrigger = "rate_drop" | "project_delay" | "covenant_breach" | "investor_option" | "none";
export type MiniBondStatus = "active" | "drawn" | "retired" | "called" | "put_exercised" | "restructured";
export type DrawStatus = "scheduled" | "drawn" | "held" | "released";
export type ScenarioType = "base" | "rates_down_50" | "rates_up_75" | "project_delay_6mo" | "early_retire_a" | "put_exercise_d" | "refi_cd" | "custom";

export interface DrawScheduleEntry {
  month: number;
  label: string;
  amount: number; // millions
  purpose: string;
  status: DrawStatus;
}

export interface CallProvision {
  type: CallType;
  price: number; // % of par (e.g., 101 = 101%)
  earliestDate: string;
  lockoutMonths: number;
}

export interface PutProvision {
  trigger: PutTrigger;
  triggerDescription: string;
  price: number; // % of par
  exerciseWindowStart: string;
  exerciseWindowEnd: string;
}

export interface Covenant {
  name: string;
  metric: string;
  threshold: string;
  current: string;
  status: "compliant" | "watch" | "breach";
}

export interface MiniBond {
  id: string;
  label: string;
  letter: string; // A, B, C, D
  amount: number; // millions
  purpose: string;
  termMonths: number;
  termLabel: string;
  coupon: number; // percentage
  spread: number; // bps over treasury
  rating: BondRating;
  ratingScore: number; // 1-10 internal
  status: MiniBondStatus;
  call: CallProvision;
  put: PutProvision;
  drawSchedule: DrawScheduleEntry[];
  covenants: Covenant[];
  dscr: number;
  ltv: number;
  duration: number; // years
  modifiedDuration: number;
  dv01: number; // dollar value of 1bp, in thousands
  accruedInterest: number;
  unusedFee: number; // bps — fee on undrawn amount
  color: string; // for visual
}

export interface DealInPool {
  id: string;
  name: string;
  totalCommitment: number; // millions
  projectType: string;
  location: string;
  sponsor: string;
  miniBonds: MiniBond[];
  inPool: boolean;
}

export interface PoolEconomics {
  totalCommitment: number;
  totalDrawn: number;
  blendedCoupon: number;
  weightedAvgLife: number; // years
  allInCost: number; // percentage
  poolDscr: number;
  poolLtv: number;
  unusedFeeSavings: number; // thousands per year
  rateArbitrageSpread: number; // bps
  nestArrangementFee: number; // percentage
  nestRevenue: number; // thousands
  seniorPct: number; // % of pool that's A or better
  subPct: number; // % that's BBB or below
}

export interface Scenario {
  id: ScenarioType;
  label: string;
  description: string;
  rateShiftBps: number;
  delayMonths: number;
  actions: string[]; // what happens
  bernardSays: string;
  economicsImpact: Partial<PoolEconomics>;
}

export interface BernardMessage {
  id: string;
  timestamp: string;
  context: string; // what triggered this
  message: string;
  tone: "explain" | "warn" | "recommend" | "celebrate";
}

// ── Helpers ──────────────────────────────────────────────────────

export function formatM(val: number): string {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}B`;
  return `$${val.toFixed(0)}M`;
}

export function formatPct(val: number): string {
  return `${val.toFixed(2)}%`;
}

export function formatBps(val: number): string {
  return `${val.toFixed(0)}bps`;
}

export const RATING_COLORS: Record<BondRating, string> = {
  AAA: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  AA: "text-emerald-200 border-emerald-300/30 bg-emerald-300/10",
  A: "text-cyan-200 border-cyan-300/30 bg-cyan-300/10",
  BBB: "text-amber-200 border-amber-300/30 bg-amber-300/10",
  BB: "text-orange-200 border-orange-300/30 bg-orange-300/10",
  B: "text-red-200 border-red-300/30 bg-red-300/10",
  NR: "text-[#EDE8DC] border-[#2D6B3D]/30 bg-[#7A9A82]/10",
};

export const BOND_COLORS = {
  A: "#22d3ee", // cyan
  B: "#a78bfa", // purple
  C: "#f59e0b", // amber
  D: "#ef4444", // red
};

export const STATUS_COLORS: Record<MiniBondStatus, string> = {
  active: "text-emerald-200 border-emerald-300/30 bg-emerald-400/10",
  drawn: "text-cyan-200 border-cyan-300/30 bg-cyan-400/10",
  retired: "text-[#EDE8DC] border-[#2D6B3D]/30 bg-[#7A9A82]/10",
  called: "text-amber-200 border-amber-300/30 bg-amber-300/10",
  put_exercised: "text-red-200 border-red-300/30 bg-red-300/10",
  restructured: "text-purple-200 border-purple-300/30 bg-purple-300/10",
};

// ── Demo: Deal 1 — The Preserve at Brushy Creek ($100M) ─────────

export const DEMO_DEAL_1: DealInPool = {
  id: "deal_001",
  name: "The Preserve at Brushy Creek",
  totalCommitment: 100,
  projectType: "Senior Living / 180-Unit AL+MC Campus",
  location: "Round Rock, TX (Travis County)",
  sponsor: "Lone Star Senior Communities LLC",
  inPool: true,
  miniBonds: [
    {
      id: "mb_a",
      label: "Land Acquisition",
      letter: "A",
      amount: 25,
      purpose: "Land purchase — 14.2 acres, Brushy Creek Rd. Entitled, zoned PUD.",
      termMonths: 24,
      termLabel: "2yr",
      coupon: 5.75,
      spread: 185,
      rating: "A",
      ratingScore: 7,
      status: "drawn",
      call: { type: "hard", price: 101, earliestDate: "2027-06-01", lockoutMonths: 12 },
      put: { trigger: "none", triggerDescription: "No put — land is collateral", price: 100, exerciseWindowStart: "", exerciseWindowEnd: "" },
      drawSchedule: [
        { month: 1, label: "Land Close", amount: 22, purpose: "Purchase price", status: "drawn" },
        { month: 1, label: "Title + Legal", amount: 1.5, purpose: "Closing costs, title insurance, legal", status: "drawn" },
        { month: 2, label: "Survey + Geotech", amount: 1.5, purpose: "ALTA survey, geotechnical report", status: "drawn" },
      ],
      covenants: [
        { name: "LTV", metric: "Loan-to-Appraised Value", threshold: "≤ 65%", current: "58%", status: "compliant" },
        { name: "Appraisal", metric: "MAI Appraisal Required", threshold: "Within 12mo", current: "Current (Jan 2026)", status: "compliant" },
      ],
      dscr: 0, // land has no cash flow
      ltv: 58,
      duration: 1.8,
      modifiedDuration: 1.71,
      dv01: 4.5,
      accruedInterest: 0.24,
      unusedFee: 25,
      color: BOND_COLORS.A,
    },
    {
      id: "mb_b",
      label: "Soft Costs & Entitlements",
      letter: "B",
      amount: 25,
      purpose: "Architecture, engineering, permits, impact fees, legal, feasibility study, marketing.",
      termMonths: 36,
      termLabel: "3yr",
      coupon: 6.25,
      spread: 225,
      rating: "BBB",
      ratingScore: 5,
      status: "active",
      call: { type: "soft", price: 102, earliestDate: "2027-12-01", lockoutMonths: 18 },
      put: { trigger: "investor_option", triggerDescription: "Investor can put at par if permits not secured by Month 12", price: 100, exerciseWindowStart: "2027-06-01", exerciseWindowEnd: "2027-09-01" },
      drawSchedule: [
        { month: 1, label: "A&E Phase 1", amount: 3.5, purpose: "Schematic design, civil engineering", status: "drawn" },
        { month: 3, label: "A&E Phase 2", amount: 4.0, purpose: "Construction docs, MEP design", status: "drawn" },
        { month: 4, label: "Permits + Impact", amount: 5.5, purpose: "Building permits, impact fees, utility taps", status: "scheduled" },
        { month: 5, label: "Feasibility", amount: 3.0, purpose: "Market feasibility study (Baker Tilly)", status: "scheduled" },
        { month: 6, label: "Legal + Compliance", amount: 4.0, purpose: "Bond counsel, regulatory, AHCA license app", status: "scheduled" },
        { month: 8, label: "Marketing + Pre-Lease", amount: 5.0, purpose: "Sales center, marketing materials, pre-lease campaign", status: "scheduled" },
      ],
      covenants: [
        { name: "Permit Timeline", metric: "Building permit secured", threshold: "By Month 12", current: "Month 4 (on track)", status: "compliant" },
        { name: "Pre-Lease", metric: "Pre-lease deposits", threshold: "≥ 25% by Month 10", current: "12% (Month 3)", status: "watch" },
      ],
      dscr: 0,
      ltv: 72,
      duration: 2.6,
      modifiedDuration: 2.45,
      dv01: 6.1,
      accruedInterest: 0.47,
      unusedFee: 35,
      color: BOND_COLORS.B,
    },
    {
      id: "mb_c",
      label: "Vertical Construction Ph1",
      letter: "C",
      amount: 25,
      purpose: "Foundation, structural steel, rough MEP, building envelope. 180 units Phase 1.",
      termMonths: 60,
      termLabel: "5yr",
      coupon: 6.75,
      spread: 275,
      rating: "BBB",
      ratingScore: 5,
      status: "active",
      call: { type: "soft", price: 103, earliestDate: "2029-06-01", lockoutMonths: 36 },
      put: { trigger: "rate_drop", triggerDescription: "Investor PUT if 10yr Treasury drops > 75bps from origination. Allows refi at lower rate.", price: 100, exerciseWindowStart: "2028-01-01", exerciseWindowEnd: "2030-06-01" },
      drawSchedule: [
        { month: 4, label: "Foundation", amount: 5.0, purpose: "Excavation, foundation, site work", status: "scheduled" },
        { month: 6, label: "Structural", amount: 6.0, purpose: "Structural steel/wood frame, elevator shafts", status: "scheduled" },
        { month: 8, label: "Rough MEP", amount: 5.5, purpose: "Mechanical, electrical, plumbing rough-in", status: "scheduled" },
        { month: 10, label: "Envelope", amount: 4.5, purpose: "Exterior walls, roofing, windows", status: "scheduled" },
        { month: 12, label: "Contingency", amount: 4.0, purpose: "Construction contingency (16%)", status: "scheduled" },
      ],
      covenants: [
        { name: "DSCR", metric: "Projected stabilized DSCR", threshold: "≥ 1.25x", current: "1.38x (projected)", status: "compliant" },
        { name: "LTC", metric: "Loan-to-Cost", threshold: "≤ 75%", current: "71%", status: "compliant" },
        { name: "GMP", metric: "GMP Contract executed", threshold: "Before first draw", current: "Executed (Feb 2026)", status: "compliant" },
      ],
      dscr: 1.38,
      ltv: 71,
      duration: 4.2,
      modifiedDuration: 3.93,
      dv01: 10.3,
      accruedInterest: 0,
      unusedFee: 30,
      color: BOND_COLORS.C,
    },
    {
      id: "mb_d",
      label: "Vertical Construction Ph2",
      letter: "D",
      amount: 25,
      purpose: "Interior finish, FF&E, landscaping, final inspections, CO, lease-up reserve.",
      termMonths: 60,
      termLabel: "5yr",
      coupon: 7.25,
      spread: 325,
      rating: "BB",
      ratingScore: 4,
      status: "active",
      call: { type: "soft", price: 103, earliestDate: "2029-06-01", lockoutMonths: 36 },
      put: { trigger: "project_delay", triggerDescription: "Investor PUT if project is > 6 months behind GMP schedule. Protects against cost overruns.", price: 100, exerciseWindowStart: "2028-06-01", exerciseWindowEnd: "2031-01-01" },
      drawSchedule: [
        { month: 10, label: "Interior Rough", amount: 4.0, purpose: "Drywall, interior framing, fire suppression", status: "scheduled" },
        { month: 12, label: "Interior Finish", amount: 5.5, purpose: "Flooring, paint, cabinetry, fixtures", status: "scheduled" },
        { month: 14, label: "FF&E", amount: 5.0, purpose: "Furniture, fixtures, equipment, kitchen", status: "scheduled" },
        { month: 16, label: "Site + Landscape", amount: 3.5, purpose: "Parking, landscaping, signage, final site work", status: "scheduled" },
        { month: 17, label: "CO + Punchlist", amount: 2.0, purpose: "Certificate of occupancy, punchlist, inspections", status: "scheduled" },
        { month: 18, label: "Lease-Up Reserve", amount: 5.0, purpose: "12-month operating reserve during lease-up", status: "scheduled" },
      ],
      covenants: [
        { name: "DSCR", metric: "Projected stabilized DSCR", threshold: "≥ 1.15x", current: "1.22x (projected)", status: "compliant" },
        { name: "Schedule", metric: "Construction schedule adherence", threshold: "≤ 3 months behind", current: "On schedule", status: "compliant" },
        { name: "Contingency", metric: "Remaining contingency", threshold: "≥ 5% of GMP", current: "16% ($4M)", status: "compliant" },
      ],
      dscr: 1.22,
      ltv: 75,
      duration: 4.5,
      modifiedDuration: 4.19,
      dv01: 11.2,
      accruedInterest: 0,
      unusedFee: 30,
      color: BOND_COLORS.D,
    },
  ],
};

// ── Demo: Deal 2 — Puyallup Industrial ($75M) ───────────────────

export const DEMO_DEAL_2: DealInPool = {
  id: "deal_002",
  name: "Puyallup Logistics Campus",
  totalCommitment: 75,
  projectType: "Industrial / Logistics — 420K sqft",
  location: "Puyallup, WA (Pierce County)",
  sponsor: "Cascade Logistics Development LLC",
  inPool: false,
  miniBonds: [
    {
      id: "mb_e",
      label: "Land + Site Prep",
      letter: "A",
      amount: 20,
      purpose: "28 acres acquisition + grading + utilities",
      termMonths: 24,
      termLabel: "2yr",
      coupon: 5.50,
      spread: 165,
      rating: "A",
      ratingScore: 7,
      status: "active",
      call: { type: "hard", price: 101, earliestDate: "2027-12-01", lockoutMonths: 12 },
      put: { trigger: "none", triggerDescription: "No put", price: 100, exerciseWindowStart: "", exerciseWindowEnd: "" },
      drawSchedule: [
        { month: 1, label: "Land Close", amount: 14, purpose: "Land purchase", status: "scheduled" },
        { month: 2, label: "Site Prep", amount: 6, purpose: "Grading, utilities, access roads", status: "scheduled" },
      ],
      covenants: [
        { name: "LTV", metric: "Loan-to-Value", threshold: "≤ 60%", current: "55%", status: "compliant" },
      ],
      dscr: 0,
      ltv: 55,
      duration: 1.7,
      modifiedDuration: 1.62,
      dv01: 3.4,
      accruedInterest: 0,
      unusedFee: 25,
      color: BOND_COLORS.A,
    },
    {
      id: "mb_f",
      label: "Building 1 — Cross-Dock",
      letter: "B",
      amount: 25,
      purpose: "180K sqft cross-dock warehouse",
      termMonths: 60,
      termLabel: "5yr",
      coupon: 6.50,
      spread: 250,
      rating: "BBB",
      ratingScore: 5,
      status: "active",
      call: { type: "soft", price: 102, earliestDate: "2029-01-01", lockoutMonths: 30 },
      put: { trigger: "rate_drop", triggerDescription: "PUT if SOFR drops > 100bps", price: 100, exerciseWindowStart: "2028-01-01", exerciseWindowEnd: "2030-01-01" },
      drawSchedule: [
        { month: 3, label: "Foundation", amount: 5, purpose: "Slab + footings", status: "scheduled" },
        { month: 5, label: "Steel + Envelope", amount: 10, purpose: "Pre-eng metal building", status: "scheduled" },
        { month: 8, label: "MEP + Docks", amount: 7, purpose: "Loading docks, HVAC, electrical", status: "scheduled" },
        { month: 10, label: "Finish + CO", amount: 3, purpose: "Paving, landscaping, CO", status: "scheduled" },
      ],
      covenants: [
        { name: "Pre-Lease", metric: "Pre-lease commitment", threshold: "≥ 40% before draw 3", current: "Amazon Fresh LOI (62%)", status: "compliant" },
      ],
      dscr: 1.45,
      ltv: 68,
      duration: 4.0,
      modifiedDuration: 3.76,
      dv01: 9.8,
      accruedInterest: 0,
      unusedFee: 30,
      color: BOND_COLORS.B,
    },
    {
      id: "mb_g",
      label: "Building 2+3 — Cold Storage + Flex",
      letter: "C",
      amount: 30,
      purpose: "140K sqft cold storage + 100K sqft flex industrial",
      termMonths: 84,
      termLabel: "7yr",
      coupon: 7.00,
      spread: 300,
      rating: "BBB",
      ratingScore: 5,
      status: "active",
      call: { type: "soft", price: 103, earliestDate: "2030-01-01", lockoutMonths: 42 },
      put: { trigger: "project_delay", triggerDescription: "PUT if > 6 months behind", price: 100, exerciseWindowStart: "2029-01-01", exerciseWindowEnd: "2032-01-01" },
      drawSchedule: [
        { month: 6, label: "Cold Storage Foundation", amount: 6, purpose: "Refrigerated slab + insulation", status: "scheduled" },
        { month: 9, label: "Cold Storage Shell", amount: 8, purpose: "Insulated panels, refrigeration plant", status: "scheduled" },
        { month: 11, label: "Flex Industrial", amount: 8, purpose: "Standard tilt-up construction", status: "scheduled" },
        { month: 14, label: "MEP + Commissioning", amount: 5, purpose: "Refrigeration commission, electrical, docks", status: "scheduled" },
        { month: 16, label: "Contingency", amount: 3, purpose: "Construction contingency", status: "scheduled" },
      ],
      covenants: [
        { name: "DSCR", metric: "Stabilized DSCR", threshold: "≥ 1.30x", current: "1.42x (projected)", status: "compliant" },
      ],
      dscr: 1.42,
      ltv: 70,
      duration: 5.8,
      modifiedDuration: 5.42,
      dv01: 16.8,
      accruedInterest: 0,
      unusedFee: 30,
      color: BOND_COLORS.C,
    },
  ],
};

// ── Pool Economics Calculator ─────────────────────────────────────

export function calculatePoolEconomics(deals: DealInPool[]): PoolEconomics {
  const activeDeals = deals.filter(d => d.inPool);
  const allBonds = activeDeals.flatMap(d => d.miniBonds);

  if (allBonds.length === 0) {
    return {
      totalCommitment: 0, totalDrawn: 0, blendedCoupon: 0, weightedAvgLife: 0,
      allInCost: 0, poolDscr: 0, poolLtv: 0, unusedFeeSavings: 0,
      rateArbitrageSpread: 0, nestArrangementFee: 1.25, nestRevenue: 0,
      seniorPct: 0, subPct: 0,
    };
  }

  const totalCommitment = allBonds.reduce((s, b) => s + b.amount, 0);
  const totalDrawn = allBonds.reduce((s, b) =>
    s + b.drawSchedule.filter(d => d.status === "drawn").reduce((ds, d) => ds + d.amount, 0), 0);

  // Weighted avg coupon
  const blendedCoupon = allBonds.reduce((s, b) => s + b.coupon * b.amount, 0) / totalCommitment;

  // Weighted avg life (term in years, weighted by amount)
  const weightedAvgLife = allBonds.reduce((s, b) => s + (b.termMonths / 12) * b.amount, 0) / totalCommitment;

  // All-in cost (coupon + arrangement fee + unused fee estimate)
  const avgUnusedFee = allBonds.reduce((s, b) => s + b.unusedFee, 0) / allBonds.length;
  const allInCost = blendedCoupon + 1.25 + (avgUnusedFee / 100);

  // Pool DSCR — weighted by bonds that have cash flow
  const cfBonds = allBonds.filter(b => b.dscr > 0);
  const poolDscr = cfBonds.length > 0
    ? cfBonds.reduce((s, b) => s + b.dscr * b.amount, 0) / cfBonds.reduce((s, b) => s + b.amount, 0)
    : 0;

  // Pool LTV — weighted
  const poolLtv = allBonds.reduce((s, b) => s + b.ltv * b.amount, 0) / totalCommitment;

  // Unused fee savings vs. single bullet bond
  const bulletUnusedFee = totalCommitment * 0.005 * weightedAvgLife; // 50bps on full amount for WAL
  const drawUnusedFee = allBonds.reduce((s, b) => {
    const undrawnMonths = b.drawSchedule.filter(d => d.status === "scheduled").length * 2; // avg 2mo undrawn
    return s + (b.amount * (b.unusedFee / 10000) * (undrawnMonths / 12));
  }, 0);
  const unusedFeeSavings = (bulletUnusedFee - drawUnusedFee) * 1000;

  // Rate arb — spread between shortest and longest tenor
  const spreads = allBonds.map(b => b.spread);
  const rateArbitrageSpread = Math.max(...spreads) - Math.min(...spreads);

  // NEST revenue
  const nestArrangementFee = 1.25;
  const nestRevenue = totalCommitment * (nestArrangementFee / 100) * 1000;

  // Senior vs sub split
  const seniorAmount = allBonds.filter(b => ["AAA", "AA", "A"].includes(b.rating)).reduce((s, b) => s + b.amount, 0);
  const seniorPct = (seniorAmount / totalCommitment) * 100;
  const subPct = 100 - seniorPct;

  return {
    totalCommitment, totalDrawn, blendedCoupon, weightedAvgLife, allInCost,
    poolDscr, poolLtv, unusedFeeSavings, rateArbitrageSpread,
    nestArrangementFee, nestRevenue, seniorPct, subPct,
  };
}

// ── Scenarios ────────────────────────────────────────────────────

export const DEMO_SCENARIOS: Scenario[] = [
  {
    id: "base",
    label: "Base Case",
    description: "Current market conditions. All bonds at origination terms.",
    rateShiftBps: 0,
    delayMonths: 0,
    actions: ["All mini-bonds at face value", "Draw schedule on track", "No options exercised"],
    bernardSays: "This is your $100M commitment for The Preserve at Brushy Creek. Four mini-bonds: Bond A covers land at 5.75%, already drawn. Bond B handles soft costs at 6.25% with phased draws — you're not paying interest on money you haven't spent yet. Bonds C and D are your construction capital at 6.75% and 7.25% — they've got put options built in so investors are protected if things go sideways. Blended coupon is 6.50%. You're saving about $340K per year in unused fees versus a single bullet bond. That's the power of the draw structure.",
    economicsImpact: {},
  },
  {
    id: "rates_down_50",
    label: "Rates Drop 50bps",
    description: "10-year Treasury falls 50bps. Refi opportunity opens.",
    rateShiftBps: -50,
    delayMonths: 0,
    actions: [
      "Bond A: Candidate for early retirement — call at 101, refi at new lower rate",
      "Bond C: PUT option approaches trigger (75bps threshold) — watch closely",
      "Bonds B,D: Hold — not callable yet (lockout period)",
      "Recommendation: Retire A, save ~$125K/year in interest",
    ],
    bernardSays: "Rates just dropped 50 basis points. Bond A is callable at 101 — you should retire it and refi at the new rate. That saves $125K per year on a $25M position. Bond C has a put trigger at 75bps down — we're at 50bps, so not triggered yet, but if rates drop another 25bps your investors can put it back and you'll need to restructure. Bonds B and D are in lockout, so they stay put. Net impact: retire A, blended coupon drops to 6.15%, and you've de-levered by $25M. Smart move.",
    economicsImpact: { blendedCoupon: 6.15, totalCommitment: 75, nestRevenue: 937 },
  },
  {
    id: "rates_up_75",
    label: "Rates Rise 75bps",
    description: "10-year Treasury rises 75bps. Cost of capital increases.",
    rateShiftBps: 75,
    delayMonths: 0,
    actions: [
      "All bonds: Mark-to-market value drops (price below par)",
      "No call/put triggers activated — all options are out-of-the-money",
      "Draw structure protects you — only paying interest on drawn amounts",
      "Recommendation: Accelerate draws on C and D to lock in committed rates before any reset",
    ],
    bernardSays: "Rates are up 75 basis points. Your bonds are now below par on a mark-to-market basis, but that only matters if you're selling. You're not — these are held to maturity by your investors. The good news: your draw structure is protecting you. You're only paying interest on what's been drawn. My recommendation — accelerate your draws on Bonds C and D to lock in the committed rates before any rate reset provisions kick in. Your blended coupon stays at 6.50% on drawn amounts. New money would cost 7.25%+. You're sitting pretty compared to anyone borrowing today.",
    economicsImpact: { allInCost: 8.50 },
  },
  {
    id: "project_delay_6mo",
    label: "Project Delays 6 Months",
    description: "Construction falls 6 months behind GMP schedule.",
    rateShiftBps: 0,
    delayMonths: 6,
    actions: [
      "Bond D: PUT option TRIGGERED — investor can exercise",
      "Bond B: Pre-lease covenant at risk (timeline extended)",
      "Bond C: Schedule covenant moves to WATCH",
      "Recommendation: Negotiate with D investor — extend term 6mo, add 25bps coupon sweetener",
    ],
    bernardSays: "Project is 6 months behind schedule. Bond D's put option just triggered — your investor has the right to put $25M back to you at par. Don't panic. Here's what I recommend: Call the Bond D investor and offer a 6-month extension with a 25bps coupon bump from 7.25% to 7.50%. That costs you $62,500 per year but keeps the $25M in place. If they exercise the put, you'll need to find replacement capital at today's rates — which would cost you 8%+. The extension is cheaper. Bond B's pre-lease covenant is on watch — push your marketing team. Bond C moved to watch on the schedule covenant. Monitor weekly.",
    economicsImpact: { blendedCoupon: 6.56, poolDscr: 1.18 },
  },
  {
    id: "early_retire_a",
    label: "Retire Bond A Early",
    description: "Land is acquired. Retire Bond A via hard call at 101.",
    rateShiftBps: 0,
    delayMonths: 0,
    actions: [
      "Bond A: Called at 101 ($25.25M payment to investor)",
      "Pool shrinks to $75M (3 remaining mini-bonds)",
      "De-levered by 25% — LTV improves, DSCR improves",
      "Blended coupon rises (lowest-cost bond removed) but total interest expense drops",
    ],
    bernardSays: "You just retired Bond A — land is acquired, no need to keep paying 5.75% on it. Investor gets $25.25M (par plus the 1% call premium). Your pool drops to $75M across three remaining bonds. Here's the math: total interest expense drops from $6.5M/year to $5.06M/year — that's a $1.44M annual savings. Your blended coupon goes up to 6.75% because you removed the cheapest bond, but you're paying it on $75M instead of $100M. Net win. DSCR improves because you've got less debt to service. This is exactly what the modular structure is designed for — retire pieces as they're no longer needed.",
    economicsImpact: { totalCommitment: 75, blendedCoupon: 6.75, unusedFeeSavings: 280, poolLtv: 68 },
  },
];

// ── Bernard's Initial Narration ──────────────────────────────────

export const DEMO_BERNARD_MESSAGES: BernardMessage[] = [
  {
    id: "bm_001",
    timestamp: "2026-05-20T20:00:00Z",
    context: "initial_load",
    tone: "explain",
    message: "Welcome to the Arrangement Engine. You're looking at a $100M commitment for The Preserve at Brushy Creek — 180-unit senior living campus in Round Rock, Texas. I've structured this as 4 modular mini-bonds instead of a single bullet. Each one has its own term, coupon, and optionality. Bond A covers land at 5.75% — it's already drawn. Bond B handles soft costs at 6.25%. Bonds C and D are your construction capital with put options protecting investors. The draw structure saves you $340K per year in unused fees compared to a traditional bullet bond. Drag in the Puyallup deal on the right to build a $175M CMBS-style pool.",
  },
  {
    id: "bm_002",
    timestamp: "2026-05-20T20:00:30Z",
    context: "initial_load",
    tone: "recommend",
    message: "Quick optimization note: Bond A has a hard call at 101 with a 12-month lockout. Once the land closes and you've got your entitlements, retire it and refi — you'll save 150bps if rates stay flat. I've flagged it as your first de-leverage target.",
  },
];

// ── Treasury Reference Rates ─────────────────────────────────────

export const TREASURY_RATES = {
  "1mo": 5.28, "3mo": 5.24, "6mo": 5.12, "1yr": 4.89,
  "2yr": 4.52, "3yr": 4.38, "5yr": 4.25, "7yr": 4.32,
  "10yr": 4.42, "20yr": 4.68, "30yr": 4.55,
  lastUpdated: "2026-05-20T19:45:00Z",
};

export const SOFR_RATE = 5.31;
export const PRIME_RATE = 8.50;
