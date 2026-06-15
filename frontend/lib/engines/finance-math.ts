// NEST Finance Math Engine — pure computation, no React
// JP Morgan institutional benchmarks. Real math, no stubs.
// Bond blueprint: Jacaranda Trace PLOM (Series 2025, $231M, Florida LGFC)

// ---------------------------------------------------------------------------
// JP Morgan Credit Benchmarks
// ---------------------------------------------------------------------------
export const JPM_BENCHMARKS = {
  A: {
    minDSCR: 2.0,
    maxLTV: 55,
    maxCFLeverage: 1.5,
    maxBSLeverage: 2.0,
    maxDebtEBITDA: 4.5,
    minICR: 3.5,
  },
  "BBB+": {
    minDSCR: 1.75,
    maxLTV: 62,
    maxCFLeverage: 1.75,
    maxBSLeverage: 2.25,
    maxDebtEBITDA: 5.5,
    minICR: 2.75,
  },
  "BBB-": {
    minDSCR: 1.5,
    maxLTV: 70,
    maxCFLeverage: 2.0,
    maxBSLeverage: 2.5,
    maxDebtEBITDA: 6.5,
    minICR: 2.25,
  },
  "Sub-IG": {
    minDSCR: 0,
    maxLTV: 100,
    maxCFLeverage: Infinity,
    maxBSLeverage: Infinity,
    maxDebtEBITDA: Infinity,
    minICR: 0,
  },
} as const;

// ---------------------------------------------------------------------------
// NEST Capital Structure (Series A/B)
// ---------------------------------------------------------------------------
export const NEST_CAPITAL_STRUCTURE = {
  seriesA: { ltcPct: 0.75, couponLow: 0.065, couponHigh: 0.075 },
  seriesB: { cltv: 0.82, couponLow: 0.10, couponHigh: 0.14 },
  reservePct: 0.025,
  ioFromProceeds: true,
} as const;

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Cash-flow entry for duration / convexity calculations */
export interface CashFlow {
  t: number;  // time in years
  cf: number; // cash flow amount
}

/** Output row for DSCR waterfall cascade */
export interface DSCRWaterfallResult {
  trancheName: string;
  debtService: number;
  remainingNOI: number;
  coverage: number;
  pass: boolean;
}

/** Hylant 4-tier surety quote */
export interface SuretyQuote {
  tier: string;
  annualPremium: number;
  premiumPct: number;
  lcEquivalentRate: number;
}

// ---------------------------------------------------------------------------
// 1. calculateYTM — Newton-Raphson solver (≤100 iterations)
//
// Formula: Price = Σ [C / (1+y)^t] + Par / (1+y)^n
// Solve for y where f(y) = Price(y) - dirtyPrice = 0
// ---------------------------------------------------------------------------

/**
 * Calculate Yield to Maturity via Newton-Raphson iteration.
 * @param price   - Dirty price of the bond
 * @param coupon  - Annual coupon payment (dollar amount)
 * @param par     - Par / face value
 * @param years   - Years to maturity (integer or fractional)
 * @param frequency - Coupon payments per year (default 2 = semi-annual)
 * @returns Annual YTM as a decimal (e.g. 0.065 = 6.5%)
 */
export function calculateYTM(
  price: number,
  coupon: number,
  par: number,
  years: number,
  frequency = 2
): number {
  const periods = years * frequency;
  const periodicCoupon = coupon / frequency;

  // Guard: trivial cases
  if (price <= 0 || par <= 0 || periods <= 0) return 0;

  // Initial guess: approximate YTM = (coupon + (par - price) / n) / ((par + price) / 2)
  let y = (coupon + (par - price) / periods) / ((par + price) / 2) / frequency;
  if (!isFinite(y) || y <= -1) y = 0.05 / frequency;

  const MAX_ITER = 100;
  const TOLERANCE = 1e-10;

  for (let i = 0; i < MAX_ITER; i++) {
    // f(y): present value of all cash flows minus dirty price
    let pv = 0;
    let dpv = 0; // derivative with respect to y
    for (let t = 1; t <= periods; t++) {
      const cf = t === periods ? periodicCoupon + par : periodicCoupon;
      const disc = Math.pow(1 + y, t);
      pv += cf / disc;
      dpv -= (t * cf) / (disc * (1 + y));
    }
    const f = pv - price;
    if (Math.abs(f) < TOLERANCE) break;
    if (dpv === 0) break;
    y -= f / dpv;
    // Prevent y from going below -1 (undefined territory)
    if (y <= -1) y = 0.0001;
  }

  return y * frequency; // annualize
}

// ---------------------------------------------------------------------------
// 2. calculateDuration — Macaulay Duration
//
// Formula: D = Σ [t * PV(CFt)] / Price
// ---------------------------------------------------------------------------

/**
 * Macaulay duration in years.
 * @param cashFlows - Array of {t (years), cf (amount)} — include par in final CF
 * @param ytm       - Annual YTM as decimal
 * @param price     - Dirty price (denominator)
 */
export function calculateDuration(
  cashFlows: CashFlow[],
  ytm: number,
  price: number
): number {
  if (price <= 0 || cashFlows.length === 0) return 0;

  let weightedSum = 0;
  for (const { t, cf } of cashFlows) {
    const pv = cf / Math.pow(1 + ytm, t);
    weightedSum += t * pv;
  }
  return weightedSum / price;
}

// ---------------------------------------------------------------------------
// 3. calculateModifiedDuration
//
// Formula: MD = D_mac / (1 + y/m)   where m = payments per year
// ---------------------------------------------------------------------------

/**
 * Modified duration — price sensitivity per 1% yield change.
 * @param macaulayDuration - Output of calculateDuration()
 * @param ytm              - Annual YTM as decimal
 * @param frequency        - Coupon payments per year (default 2)
 */
export function calculateModifiedDuration(
  macaulayDuration: number,
  ytm: number,
  frequency = 2
): number {
  return macaulayDuration / (1 + ytm / frequency);
}

// ---------------------------------------------------------------------------
// 4. calculateConvexity
//
// Formula: C = (1/P) * Σ [CF_t * t*(t+1) / (1+y)^(t+2)]
// Note: t in periods; divide by m^2 to annualize
// ---------------------------------------------------------------------------

/**
 * Bond convexity — second-order price sensitivity.
 * @param cashFlows - {t (years), cf (amount)}
 * @param ytm       - Annual YTM as decimal
 * @param price     - Dirty price
 * @param frequency - Coupon payments per year (default 2)
 */
export function calculateConvexity(
  cashFlows: CashFlow[],
  ytm: number,
  price: number,
  frequency = 2
): number {
  if (price <= 0 || cashFlows.length === 0) return 0;
  const y = ytm / frequency;

  let sum = 0;
  for (const { t, cf } of cashFlows) {
    const tp = t * frequency; // convert to periods
    sum += (cf * tp * (tp + 1)) / Math.pow(1 + y, tp + 2);
  }
  // Annualize: divide by m^2
  return sum / (price * frequency * frequency);
}

// ---------------------------------------------------------------------------
// 5. calculateDSCR — simple ratio
//
// Formula: DSCR = NOI / Annual Debt Service
// ---------------------------------------------------------------------------

/**
 * Debt Service Coverage Ratio.
 * @param noi               - Net Operating Income
 * @param annualDebtService - Total annual P&I
 */
export function calculateDSCR(noi: number, annualDebtService: number): number {
  if (annualDebtService <= 0) return Infinity;
  return noi / annualDebtService;
}

// ---------------------------------------------------------------------------
// 6. dscrWaterfall — cascade NOI through tranches
// ---------------------------------------------------------------------------

/**
 * DSCR waterfall: cascade NOI through each debt tranche in priority order.
 * Each senior tranche is serviced first; coverage measured cumulatively.
 * @param noi          - Net Operating Income
 * @param debtTranches - Ordered array (senior first) of tranche name + annual DS
 */
export function dscrWaterfall(
  noi: number,
  debtTranches: { name: string; annualDS: number }[]
): DSCRWaterfallResult[] {
  let remaining = noi;
  const results: DSCRWaterfallResult[] = [];

  for (const tranche of debtTranches) {
    const coverage = tranche.annualDS > 0 ? remaining / tranche.annualDS : Infinity;
    remaining -= tranche.annualDS;
    results.push({
      trancheName: tranche.name,
      debtService: tranche.annualDS,
      remainingNOI: remaining,
      coverage,
      pass: coverage >= 1.0,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// 7. calculateSuretyPremium — Hylant 4-tier model
//
// AUM Tiers:
//   surety  $0-15M    → 0.85%
//   hybrid  $15-40M   → 0.60%
//   lc      $40-80M   → 0.40%
//   self    $80M+     → 0.15%
//
// 3C score discount: >80 → -15%; >60 → -8%
// ---------------------------------------------------------------------------

/**
 * Hylant 4-tier surety premium calculation.
 * @param bondFace    - Bond face / principal amount
 * @param tier        - AUM-based tier: 'surety'|'hybrid'|'lc'|'self'
 * @param threeCScore - 3C credit score (0-100); higher = better sponsor quality
 */
export function calculateSuretyPremium(
  bondFace: number,
  tier: "surety" | "hybrid" | "lc" | "self",
  threeCScore: number
): SuretyQuote {
  const BASE_RATES: Record<typeof tier, number> = {
    surety: 0.0085,
    hybrid: 0.0060,
    lc:     0.0040,
    self:   0.0015,
  };

  const TIER_LABELS: Record<typeof tier, string> = {
    surety: "Surety-Only (AUM $0–15M)",
    hybrid: "Hybrid (AUM $15–40M)",
    lc:     "LC-Dominant (AUM $40–80M)",
    self:   "Self-Collateralized (AUM $80M+)",
  };

  let rate = BASE_RATES[tier];

  // 3C score discount
  if (threeCScore > 80) {
    rate *= 1 - 0.15;
  } else if (threeCScore > 60) {
    rate *= 1 - 0.08;
  }

  const annualPremium = bondFace * rate;

  // LC equivalent rate: reference market rate for comparable LC issuance (~1.5-2.5%)
  // Estimate based on tier; tighter tiers approach bank LC pricing
  const lcEquivMap: Record<typeof tier, number> = {
    surety: 0.025,
    hybrid: 0.020,
    lc:     0.018,
    self:   0.015,
  };

  return {
    tier: TIER_LABELS[tier],
    annualPremium,
    premiumPct: rate,
    lcEquivalentRate: lcEquivMap[tier],
  };
}

// ---------------------------------------------------------------------------
// 8. calculateIRR — Newton-Raphson IRR
//
// Formula: 0 = Σ [CF_t / (1+r)^t]
// ---------------------------------------------------------------------------

/**
 * Internal Rate of Return via Newton-Raphson.
 * @param cashFlows - Array of cash flows (index 0 = t=0, usually negative outflow)
 * @param guess     - Initial IRR guess (default 0.1 = 10%)
 * @returns IRR as a decimal, or NaN if solver fails to converge
 */
export function calculateIRR(cashFlows: number[], guess = 0.1): number {
  if (cashFlows.length < 2) return NaN;

  const MAX_ITER = 100;
  const TOLERANCE = 1e-10;
  let r = guess;

  for (let i = 0; i < MAX_ITER; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const disc = Math.pow(1 + r, t);
      npv += cashFlows[t] / disc;
      dnpv -= (t * cashFlows[t]) / (disc * (1 + r));
    }

    if (Math.abs(npv) < TOLERANCE) break;
    if (dnpv === 0) return NaN;
    r -= npv / dnpv;
    if (!isFinite(r) || r <= -1) return NaN;
  }

  return r;
}

// ---------------------------------------------------------------------------
// 9. priceFromYTM — sum of discounted cash flows
//
// Formula: P = Σ [C/m / (1+y/m)^t] + Par / (1+y/m)^n
// ---------------------------------------------------------------------------

/**
 * Price a bond from its YTM.
 * @param ytm       - Annual YTM as decimal
 * @param coupon    - Annual coupon payment (dollar amount)
 * @param par       - Par / face value
 * @param years     - Years to maturity
 * @param frequency - Coupon payments per year (default 2)
 */
export function priceFromYTM(
  ytm: number,
  coupon: number,
  par: number,
  years: number,
  frequency = 2
): number {
  const periods = years * frequency;
  const y = ytm / frequency;
  const c = coupon / frequency;

  if (Math.abs(y) < 1e-12) {
    // Zero YTM: price = sum of undiscounted CFs
    return c * periods + par;
  }

  // PV of coupon stream (annuity) + PV of par
  const pvCoupons = c * (1 - Math.pow(1 + y, -periods)) / y;
  const pvPar = par / Math.pow(1 + y, periods);
  return pvCoupons + pvPar;
}

// ---------------------------------------------------------------------------
// 10. calculateNPV — standard Net Present Value
//
// Formula: NPV = Σ [CF_t / (1+r)^t]   t = 0 … n
// Note: CF at index 0 is typically a negative initial investment (t=0, no discounting)
// ---------------------------------------------------------------------------

/**
 * Net Present Value of a cash flow series.
 * @param rate      - Discount rate per period as decimal
 * @param cashFlows - Array (index 0 = t=0, not discounted)
 */
export function calculateNPV(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((acc, cf, t) => {
    return acc + cf / Math.pow(1 + rate, t);
  }, 0);
}

// ---------------------------------------------------------------------------
// Convenience: grade a deal against JPM benchmarks
// ---------------------------------------------------------------------------

/**
 * Assign an investment grade based on JPM credit benchmarks.
 * @param dscr - Debt Service Coverage Ratio
 * @param ltv  - Loan-to-Value (percentage, 0-100)
 */
export function gradeFromMetrics(
  dscr: number,
  ltv: number
): "A" | "BBB+" | "BBB-" | "Sub-IG" {
  if (dscr >= JPM_BENCHMARKS.A.minDSCR && ltv <= JPM_BENCHMARKS.A.maxLTV) return "A";
  if (dscr >= JPM_BENCHMARKS["BBB+"].minDSCR && ltv <= JPM_BENCHMARKS["BBB+"].maxLTV) return "BBB+";
  if (dscr >= JPM_BENCHMARKS["BBB-"].minDSCR && ltv <= JPM_BENCHMARKS["BBB-"].maxLTV) return "BBB-";
  return "Sub-IG";
}
