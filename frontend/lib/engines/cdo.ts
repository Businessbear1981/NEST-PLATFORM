// ─── CDO Engine — NEST Advisors ───────────────────────────────────────────────
// Synthetic CDO: pool of bond positions → tranched Senior/Mezz A/Mezz B/Equity
// NEST Series B tranche feeds Quantum HFT fund ($32.4M AUM, 15-25% target)
// Reference deal: Jacaranda Trace $231M — Series A 75% LTC IG, Series B +7%

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface Loan {
  id: string;
  face: number;          // principal in USD
  pd: number;            // probability of default (0–1)
  lgd: number;           // loss given default (0–1), typically 0.4–0.6
  coupon: number;        // annual coupon rate (0–1)
  maturityYears: number;
}

export interface Tranche {
  name: string;          // "Senior A", "Mezzanine B", "Equity"
  attachment: number;    // % of pool losses where tranche starts absorbing
  detachment: number;    // % of pool losses where tranche is fully wiped out
  notional: number;      // dollar amount
  rating: string;        // estimated rating
  yield: number;         // required yield (annual, 0–1)
}

export interface TrancheResult extends Tranche {
  expectedLoss: number;       // dollar EL
  expectedLossPct: number;    // EL as fraction of notional (0–1)
  creditEnhancement: number;  // attachment point — buffer below tranche
  priceAtPar: number;         // simplified price (1 – EL_pct discounted)
}

export interface CDOResult {
  poolSize: number;
  expectedPoolLoss: number;   // dollar expected loss across pool
  tranches: TrancheResult[];
  equityIRR: number;          // estimated equity tranche IRR
  seniorCoverage: number;     // senior notional / expected pool loss (OC ratio)
}

export interface MonteCarloResult {
  meanLoss: number;   // mean portfolio loss (fraction of pool)
  stdDev: number;     // std deviation of loss
  var99: number;      // 99th percentile loss (fraction of pool)
}

// ─── Legacy Interfaces (keep for backward compat with bond desk) ───────────────

export interface TrancheSpec {
  name: string;
  attachmentPct: number;
  detachmentPct: number;
  spread: number;       // bps over SOFR
  notional: number;
}

export interface CDOPool {
  totalNotional: number;
  avgSpread: number;          // bps
  avgRecovery: number;        // 0–1
  defaultCorrelation: number; // 0–1
  tranches: TrancheSpec[];
}

// ─── Math Utilities ───────────────────────────────────────────────────────────

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function normalInv(p: number): number {
  const a = [0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
             1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
  const b = [0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
             6.680131188771972e1, -1.328068155288572e1];
  const c = [0, -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
             -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0, 7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425, pHigh = 1 - pLow;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) /
           ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
  }
  if (p <= pHigh) {
    const q = p - 0.5, r = q * q;
    return ((((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*q) /
           (((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) /
           ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// ─── Core CDO Functions ────────────────────────────────────────────────────────

/**
 * Simplified Gaussian copula tranche EL.
 * Uses Vasicek single-factor model: integrates conditional loss over systematic factor.
 * poolStdDev drives the correlation proxy (correlation ≈ (stdDev/poolEL)² clamped 0.05–0.5).
 */
export function calculateTrancheExpectedLoss(
  attachment: number,
  detachment: number,
  poolExpectedLoss: number,
  poolStdDev: number
): number {
  const thickness = detachment - attachment;
  if (thickness <= 0) return 0;
  // Back-out implied correlation from stdDev/mean ratio
  const rawCorr = poolStdDev > 0 && poolExpectedLoss > 0
    ? Math.min(0.5, Math.max(0.05, (poolStdDev / poolExpectedLoss) ** 2 * 0.1))
    : 0.12;
  const impliedPD = poolExpectedLoss; // EL ≈ PD * LGD; treat as composite PD
  const recovery = 0.4;
  const steps = 200;
  let trancheEL = 0;
  for (let i = 0; i < steps; i++) {
    const z = -3 + (6 * i) / steps;
    const condPD = normalCDF(
      (normalInv(Math.max(1e-6, Math.min(1 - 1e-6, impliedPD))) - Math.sqrt(rawCorr) * z) /
      Math.sqrt(1 - rawCorr)
    );
    const condLoss = condPD * (1 - recovery);
    const trancheLoss = Math.max(0, Math.min(condLoss, detachment) - attachment);
    trancheEL += trancheLoss * normalPDF(z) * (6 / steps);
  }
  return trancheEL / thickness; // EL as fraction of tranche notional
}

/**
 * Maps expected-loss % to standard rating bucket.
 * Thresholds calibrated to Moody's CDO rating methodology.
 */
export function estimateTrancheRating(expectedLossPct: number): string {
  if (expectedLossPct < 0.0002) return "AAA";
  if (expectedLossPct < 0.0010) return "AA";
  if (expectedLossPct < 0.0030) return "A";
  if (expectedLossPct < 0.0080) return "BBB";
  if (expectedLossPct < 0.0200) return "BB";
  if (expectedLossPct < 0.0500) return "B";
  return "CCC";
}

/**
 * Monte Carlo pool loss simulation — 1,000 runs with default correlation.
 * Each sim draws a systematic factor + idiosyncratic noise per loan.
 * Returns meanLoss, stdDev, VaR99 as fractions of pool face.
 */
export function monteCarloPool(
  loans: Loan[],
  simulations: number = 1000
): MonteCarloResult {
  const correlation = 0.12; // NEST default inter-loan correlation
  const poolFace = loans.reduce((s, l) => s + l.face, 0);
  if (poolFace === 0) return { meanLoss: 0, stdDev: 0, var99: 0 };

  const losses: number[] = [];

  for (let sim = 0; sim < simulations; sim++) {
    // Draw systematic factor via Box-Muller
    const u1 = Math.max(1e-10, Math.random());
    const u2 = Math.random();
    const Z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    let simLoss = 0;
    for (const loan of loans) {
      // Idiosyncratic factor
      const u3 = Math.max(1e-10, Math.random());
      const u4 = Math.random();
      const eps = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);
      // Asset return under Gaussian copula
      const assetReturn = Math.sqrt(correlation) * Z + Math.sqrt(1 - correlation) * eps;
      const defaultThreshold = normalInv(Math.max(1e-6, Math.min(1 - 1e-6, loan.pd)));
      if (assetReturn < defaultThreshold) {
        simLoss += loan.face * loan.lgd;
      }
    }
    losses.push(simLoss / poolFace);
  }

  losses.sort((a, b) => a - b);
  const meanLoss = losses.reduce((s, v) => s + v, 0) / simulations;
  const variance = losses.reduce((s, v) => s + (v - meanLoss) ** 2, 0) / simulations;
  const stdDev = Math.sqrt(variance);
  const var99 = losses[Math.floor(0.99 * simulations)] ?? losses[losses.length - 1];

  return { meanLoss, stdDev, var99 };
}

/**
 * Build a standard 4-tranche CDO from a loan pool.
 * Auto-sizes tranches using expected loss multiples:
 *   Senior A  (AAA target): 0 → EL×3
 *   Mezz A    (A target):   EL×3 → EL×5
 *   Mezz B    (BB target):  EL×5 → EL×8
 *   Equity:   EL×8 → 1.0 (residual)
 */
export function buildStandardCDO(loans: Loan[], targetSeniorPct?: number): CDOResult {
  const poolFace = loans.reduce((s, l) => s + l.face, 0);
  if (poolFace === 0) throw new Error("Pool has zero notional");

  // Pool EL = sum(face * pd * lgd) / poolFace
  const poolELFrac = loans.reduce((s, l) => s + l.face * l.pd * l.lgd, 0) / poolFace;
  const poolELDollars = poolELFrac * poolFace;

  // Run 1,000-sim MC to get stdDev
  const mc = monteCarloPool(loans, 1000);

  // Attachment points
  const seniorDetach = targetSeniorPct ?? Math.min(0.92, Math.max(0.70, 1 - poolELFrac * 3));
  const mezzADetach  = Math.min(seniorDetach, 1 - poolELFrac * 5);
  const mezzBDetach  = Math.min(mezzADetach,  1 - poolELFrac * 8);

  // Clamp to ensure ordering
  const e0 = 0;
  const e1 = Math.max(e0, mezzBDetach);
  const e2 = Math.max(e1, mezzADetach);
  const e3 = Math.max(e2, seniorDetach);
  const e4 = 1.0;

  const rawTranches = [
    { name: "Senior A",      att: e3, det: e4, yld: 0.065, creditEnh: e3 },
    { name: "Mezzanine A",   att: e2, det: e3, yld: 0.085, creditEnh: e2 },
    { name: "Mezzanine B",   att: e1, det: e2, yld: 0.115, creditEnh: e1 },
    { name: "Equity",        att: e0, det: e1, yld: 0.180, creditEnh: e0 },
  ];

  const trancheResults: TrancheResult[] = rawTranches.map((t) => {
    const notional = (t.det - t.att) * poolFace;
    const elFrac = calculateTrancheExpectedLoss(t.att, t.det, poolELFrac, mc.stdDev);
    const elDollars = elFrac * notional;
    const rating = estimateTrancheRating(elFrac);
    const price = Math.max(0.5, 1 - elFrac * 5); // simplified mark — penalizes EL
    return {
      name: t.name,
      attachment: t.att,
      detachment: t.det,
      notional,
      rating,
      yield: t.yld,
      expectedLoss: elDollars,
      expectedLossPct: elFrac,
      creditEnhancement: t.creditEnh,
      priceAtPar: price,
    };
  });

  // Equity IRR: pool yield minus EL minus senior/mezz carry drag
  const poolCoupon = loans.reduce((s, l) => s + l.face * l.coupon, 0) / poolFace;
  const seniorDrag = trancheResults[0].yield * (e4 - e3);
  const mezzDrag   = trancheResults[1].yield * (e3 - e2) + trancheResults[2].yield * (e2 - e1);
  const equityIRR  = (poolCoupon - poolELFrac - seniorDrag - mezzDrag) / Math.max(0.01, e1 - e0);

  return {
    poolSize: poolFace,
    expectedPoolLoss: poolELDollars,
    tranches: trancheResults,
    equityIRR: Math.max(-0.5, equityIRR),
    seniorCoverage: poolELDollars > 0 ? trancheResults[0].notional / poolELDollars : 0,
  };
}

/**
 * NEST-specific dual-tranche structure.
 * Series A: 75% LTC, IG, Hylant surety wrap, 6.5-7.5% coupon
 * Series B: +7% (82% CLTV total), bank-managed HFT, 10-14% coupon
 * B tranche AUM flows to Quantum agent ($32.4M, 15-25% target)
 */
export function buildNESTDualTranche(
  bondFace: number,  // total deal size in USD
  dscr: number,      // debt service coverage ratio
  ltv: number        // loan-to-value (0–1)
): CDOResult {
  if (bondFace <= 0) throw new Error("Bond face must be positive");

  // Series A: 75% LTC
  const seriesALtc = 0.75;
  const seriesANotional = bondFace * seriesALtc;

  // Series B: 82% CLTV - 75% LTC = 7% slice
  const seriesBSlice = 0.07;
  const seriesBNotional = bondFace * seriesBSlice;

  // Equity residual
  const equityNotional = bondFace * (1 - seriesALtc - seriesBSlice);

  // Risk calibration from DSCR / LTV
  // JP Morgan benchmarks: DSCR>1.5 = IG, <1.5 = sub-IG
  const baseELFrac = ltv > 0.82 ? 0.025 : ltv > 0.75 ? 0.012 : 0.006;
  const dscrAdj = dscr >= 2.0 ? 0.7 : dscr >= 1.75 ? 0.85 : dscr >= 1.5 ? 1.0 : 1.4;
  const poolELFrac = baseELFrac * dscrAdj;
  const poolELDollars = poolELFrac * bondFace;

  // Series A expected loss (senior, high CE = 7% + equity below)
  const aAtt = seriesBSlice + (equityNotional / bondFace);
  const aELFrac = calculateTrancheExpectedLoss(aAtt, 1.0, poolELFrac, poolELFrac * 0.5);

  // Series B expected loss (mezzanine layer)
  const bAtt = equityNotional / bondFace;
  const bELFrac = calculateTrancheExpectedLoss(bAtt, bAtt + seriesBSlice, poolELFrac, poolELFrac * 0.5);

  // Equity expected loss (first loss)
  const eqELFrac = calculateTrancheExpectedLoss(0, bAtt, poolELFrac, poolELFrac * 0.5);

  const seriesACoupon = dscr >= 1.75 ? 0.065 : 0.075; // 6.5–7.5%
  const seriesBCoupon = dscr >= 2.0  ? 0.100 : 0.140; // 10–14%

  const tranches: TrancheResult[] = [
    {
      name: "Series A (NEST — Hylant Surety)",
      attachment: aAtt,
      detachment: 1.0,
      notional: seriesANotional,
      rating: estimateTrancheRating(aELFrac),
      yield: seriesACoupon,
      expectedLoss: aELFrac * seriesANotional,
      expectedLossPct: aELFrac,
      creditEnhancement: aAtt,
      priceAtPar: Math.max(0.85, 1 - aELFrac * 5),
    },
    {
      name: "Series B (NEST — Quantum HFT)",
      attachment: bAtt,
      detachment: bAtt + seriesBSlice,
      notional: seriesBNotional,
      rating: estimateTrancheRating(bELFrac),
      yield: seriesBCoupon,
      expectedLoss: bELFrac * seriesBNotional,
      expectedLossPct: bELFrac,
      creditEnhancement: bAtt,
      priceAtPar: Math.max(0.70, 1 - bELFrac * 5),
    },
    {
      name: "Equity (Sponsor / NEST Principal)",
      attachment: 0,
      detachment: bAtt,
      notional: equityNotional,
      rating: estimateTrancheRating(eqELFrac),
      yield: 0.20,
      expectedLoss: eqELFrac * equityNotional,
      expectedLossPct: eqELFrac,
      creditEnhancement: 0,
      priceAtPar: Math.max(0.50, 1 - eqELFrac * 3),
    },
  ];

  // Equity IRR: blended pool income minus senior carry
  const blendedCoupon = 0.085; // NEST deal avg
  const seniorCarry = seriesACoupon * seriesALtc + seriesBCoupon * seriesBSlice;
  const equityWeight = 1 - seriesALtc - seriesBSlice;
  const equityIRR = equityWeight > 0
    ? (blendedCoupon - poolELFrac - seniorCarry) / equityWeight
    : 0;

  return {
    poolSize: bondFace,
    expectedPoolLoss: poolELDollars,
    tranches,
    equityIRR: Math.max(-0.5, equityIRR),
    seniorCoverage: poolELDollars > 0 ? seriesANotional / poolELDollars : 0,
  };
}

// ─── Legacy buildCDO (backward compat — Bond Desk / Academy module) ────────────

function gaussianCopulaEL(
  attachment: number,
  detachment: number,
  avgPD: number,
  recovery: number,
  correlation: number
): number {
  const lgd = 1 - recovery;
  const thickness = detachment - attachment;
  if (thickness <= 0) return 0;
  let trancheEL = 0;
  const steps = 200;
  for (let i = 0; i < steps; i++) {
    const z = -3 + (6 * i) / steps;
    const condPD = normalCDF(
      (normalInv(Math.max(1e-6, Math.min(1 - 1e-6, avgPD))) - Math.sqrt(correlation) * z) /
      Math.sqrt(1 - correlation)
    );
    const condLoss = condPD * lgd;
    const trancheLoss = Math.max(0, Math.min(condLoss, detachment) - attachment);
    trancheEL += trancheLoss * normalPDF(z) * (6 / steps);
  }
  return trancheEL / thickness;
}

interface LegacyTrancheResult {
  name: string;
  attachment: number;
  detachment: number;
  thickness: number;
  expectedLoss: number;
  expectedLossUSD: number;
  breakEvenSpread: number;
  dollarDuration: number;
  survivorshipPct: number;
  irr: number;
}

interface LegacyCDOResult {
  tranches: LegacyTrancheResult[];
  portfolioExpectedLoss: number;
  seniorOC: number;
  waterfallScenarios: Array<{ lossRate: number; tranchePayoffs: Record<string, number> }>;
}

export function buildCDO(pool: CDOPool): LegacyCDOResult {
  const avgPD = pool.avgSpread / 10000 / (1 - pool.avgRecovery);
  const trancheResults: LegacyTrancheResult[] = pool.tranches.map((t) => {
    const el = gaussianCopulaEL(t.attachmentPct, t.detachmentPct, avgPD, pool.avgRecovery, pool.defaultCorrelation);
    return {
      name: t.name,
      attachment: t.attachmentPct,
      detachment: t.detachmentPct,
      thickness: t.detachmentPct - t.attachmentPct,
      expectedLoss: el,
      expectedLossUSD: el * t.notional,
      breakEvenSpread: el * 10000 + 50,
      dollarDuration: (t.notional * 4.5) / 100,
      survivorshipPct: (1 - el) * 100,
      irr: (t.spread / 10000 - el * (1 - pool.avgRecovery)) * 100,
    };
  });
  const waterfallScenarios = [0, 0.05, 0.1, 0.15, 0.2, 0.3].map((lossRate) => {
    const payoffs: Record<string, number> = {};
    pool.tranches.forEach((t) => {
      const lossAbove = Math.max(0, lossRate - t.attachmentPct);
      const trancheLoss = Math.min(lossAbove, t.detachmentPct - t.attachmentPct);
      const thickness = t.detachmentPct - t.attachmentPct;
      payoffs[t.name] = thickness > 0 ? Math.max(0, 1 - trancheLoss / thickness) : 0;
    });
    return { lossRate, tranchePayoffs: payoffs };
  });
  return {
    tranches: trancheResults,
    portfolioExpectedLoss: avgPD * (1 - pool.avgRecovery),
    seniorOC: pool.tranches[0] && avgPD > 0 ? pool.tranches[0].detachmentPct / avgPD : 0,
    waterfallScenarios,
  };
}

// ─── Reference Pools ──────────────────────────────────────────────────────────

export const HBO2_CDO_POOL: CDOPool = {
  totalNotional: 155_000_000,
  avgSpread: 285,
  avgRecovery: 0.42,
  defaultCorrelation: 0.12,
  tranches: [
    { name: "Senior A",    attachmentPct: 0.08, detachmentPct: 1.00, spread: 180, notional: 108_500_000 },
    { name: "Mezzanine B", attachmentPct: 0.04, detachmentPct: 0.08, spread: 420, notional:  31_000_000 },
    { name: "Equity",      attachmentPct: 0.00, detachmentPct: 0.04, spread: 900, notional:  15_500_000 },
  ],
};

// Jacaranda Trace $231M — reference bond blueprint
export const JACARANDA_TRACE_POOL: CDOPool = {
  totalNotional: 231_000_000,
  avgSpread: 260,
  avgRecovery: 0.45,
  defaultCorrelation: 0.10,
  tranches: [
    { name: "Series A (LGFC / IG)",  attachmentPct: 0.07, detachmentPct: 1.00, spread: 165, notional: 173_250_000 },
    { name: "Series B (Bank HFT)",   attachmentPct: 0.02, detachmentPct: 0.07, spread: 385, notional:  46_200_000 },
    { name: "Equity (Sponsor)",      attachmentPct: 0.00, detachmentPct: 0.02, spread: 850, notional:  11_550_000 },
  ],
};
