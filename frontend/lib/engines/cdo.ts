export interface TrancheSpec {
  name: string;          // "Senior A", "Mezzanine B", "Equity"
  attachmentPct: number; // 0-1 — where losses start hitting this tranche
  detachmentPct: number; // 0-1 — where this tranche is fully wiped
  spread: number;        // annual spread in bps over SOFR
  notional: number;      // USD
}

export interface CDOPool {
  totalNotional: number;
  avgSpread: number;     // bps
  avgRecovery: number;   // 0-1 (typically 0.4)
  defaultCorrelation: number; // 0-1
  tranches: TrancheSpec[];
}

export interface TrancheResult {
  name: string;
  attachment: number;
  detachment: number;
  thickness: number;      // detachment - attachment
  expectedLoss: number;   // 0-1
  expectedLossUSD: number;
  breakEvenSpread: number; // bps
  dollarDuration: number;
  survivorshipPct: number; // % of notional surviving at 5yr
  irr: number;
}

export interface CDOResult {
  tranches: TrancheResult[];
  portfolioExpectedLoss: number;
  seniorOC: number; // over-collateralization of senior
  waterfallScenarios: Array<{ lossRate: number; tranchePayoffs: Record<string, number> }>;
}

function gaussianCopulaEL(
  attachment: number,
  detachment: number,
  avgPD: number,
  recovery: number,
  correlation: number
): number {
  // Vasicek single-factor model: integrate conditional loss over systematic factor
  const lgd = 1 - recovery;
  const thickness = detachment - attachment;
  if (thickness <= 0) return 0;

  let trancheEL = 0;
  const steps = 200;
  for (let i = 0; i < steps; i++) {
    const systemFactor = -3 + (6 * i) / steps; // z from -3 to 3
    const conditionalPD =
      normalCDF(
        (normalInv(avgPD) - Math.sqrt(correlation) * systemFactor) /
          Math.sqrt(1 - correlation)
      );
    const conditionalLoss = conditionalPD * lgd;
    const trancheLoss = Math.max(0, Math.min(conditionalLoss, detachment) - attachment);
    const weight = normalPDF(systemFactor) * (6 / steps);
    trancheEL += trancheLoss * weight;
  }
  return trancheEL / thickness;
}

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function normalInv(p: number): number {
  // Rational approximation (Beasley-Springer-Moro)
  const a = [
    0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    0, -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    0, 7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
      ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1)
    );
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q) /
      (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
    ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1)
  );
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function buildCDO(pool: CDOPool): CDOResult {
  // Implied PD from spread via rough arbitrage relationship
  const avgPD = pool.avgSpread / 10000 / (1 - pool.avgRecovery);

  const trancheResults: TrancheResult[] = pool.tranches.map((t) => {
    const el = gaussianCopulaEL(
      t.attachmentPct,
      t.detachmentPct,
      avgPD,
      pool.avgRecovery,
      pool.defaultCorrelation
    );
    const elUSD = el * t.notional;
    const breakEven = el * 10000 + 50; // EL in bps + 50bp running cost
    const dollarDuration = (t.notional * 4.5) / 100; // simplified 4.5yr duration
    const survivorship = (1 - el) * 100;
    const irr = t.spread / 10000 - el * (1 - pool.avgRecovery);
    return {
      name: t.name,
      attachment: t.attachmentPct,
      detachment: t.detachmentPct,
      thickness: t.detachmentPct - t.attachmentPct,
      expectedLoss: el,
      expectedLossUSD: elUSD,
      breakEvenSpread: breakEven,
      dollarDuration,
      survivorshipPct: survivorship,
      irr: irr * 100,
    };
  });

  const waterfallScenarios = [0, 0.05, 0.1, 0.15, 0.2, 0.3].map((lossRate) => {
    const payoffs: Record<string, number> = {};
    pool.tranches.forEach((t) => {
      const lossAboveAttach = Math.max(0, lossRate - t.attachmentPct);
      const trancheLoss = Math.min(lossAboveAttach, t.detachmentPct - t.attachmentPct);
      const thickness = t.detachmentPct - t.attachmentPct;
      payoffs[t.name] = thickness > 0 ? Math.max(0, 1 - trancheLoss / thickness) : 0;
    });
    return { lossRate, tranchePayoffs: payoffs };
  });

  return {
    tranches: trancheResults,
    portfolioExpectedLoss: avgPD * (1 - pool.avgRecovery),
    seniorOC:
      pool.tranches[0] && avgPD > 0
        ? pool.tranches[0].detachmentPct / avgPD
        : 0,
    waterfallScenarios,
  };
}

export const HBO2_CDO_POOL: CDOPool = {
  totalNotional: 155_000_000,
  avgSpread: 285,
  avgRecovery: 0.42,
  defaultCorrelation: 0.12,
  tranches: [
    {
      name: "Senior A",
      attachmentPct: 0.08,
      detachmentPct: 1.0,
      spread: 180,
      notional: 108_500_000,
    },
    {
      name: "Mezzanine B",
      attachmentPct: 0.04,
      detachmentPct: 0.08,
      spread: 420,
      notional: 31_000_000,
    },
    {
      name: "Equity",
      attachmentPct: 0,
      detachmentPct: 0.04,
      spread: 900,
      notional: 15_500_000,
    },
  ],
};
