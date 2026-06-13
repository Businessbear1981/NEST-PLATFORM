// CDS Basis Risk & Hedging Engine
// Basis = CDS spread - Bond ASW spread
// Protection leg PV vs Contingent leg PV
// Hedge ratio via DV01 matching

export interface CDSInputs {
  notional: number;           // USD
  maturityYears: number;      // e.g. 5
  cdsPremiumBps: number;      // running spread in bps (e.g. 285)
  bondYield: number;          // bond yield as decimal (e.g. 0.0625)
  riskFreeRate: number;       // SOFR or risk-free (e.g. 0.0445)
  recoveryRate: number;       // e.g. 0.40
  defaultProbabilityPA: number; // annual default probability (e.g. 0.025)
  bondModifiedDuration: number; // e.g. 4.2
}

export interface CDSResult {
  impliedPD: number;          // PD implied by CDS spread
  protectionLegPV: number;    // PV of protection seller's contingent payment
  premiumLegPV: number;       // PV of CDS premium stream
  cdsParSpread: number;       // fair-value spread (bps) where PV=0
  bondASWSpread: number;      // asset swap spread of the bond (bps)
  basis: number;              // CDS spread - bond ASW spread (bps)
  basisType: "negative" | "positive" | "neutral";
  hedgeRatioDV01: number;     // notional ratio to hedge via DV01
  hedgeCostAnnualBps: number; // annual cost of hedge in bps
  carry: number;              // net carry after hedge cost (bps)
  bpvUSD: number;             // BPV = 1bp move = $ change
  scenario01: { name: string; basisChange: number; pnl: number }[];
}

export function priceCDS(inputs: CDSInputs): CDSResult {
  const { notional, maturityYears, cdsPremiumBps, bondYield, riskFreeRate, recoveryRate, defaultProbabilityPA, bondModifiedDuration } = inputs;
  const lgd = 1 - recoveryRate;

  // Survival probability curve (flat hazard rate λ)
  const hazardRate = defaultProbabilityPA; // approx λ ≈ spread / LGD
  const survivalProbs = Array.from({ length: maturityYears }, (_, i) => Math.exp(-hazardRate * (i + 1)));

  // Protection leg PV = sum of PV(default payment in each period)
  const protectionLegPV = survivalProbs.reduce((acc, sp, i) => {
    const defaultProb = i === 0 ? (1 - sp) : (survivalProbs[i - 1] - sp);
    const discountFactor = Math.exp(-riskFreeRate * (i + 1));
    return acc + defaultProb * lgd * notional * discountFactor;
  }, 0);

  // Premium leg PV = sum of PV(premium * survival prob)
  const premiumLegPV = survivalProbs.reduce((acc, sp, i) => {
    const discountFactor = Math.exp(-riskFreeRate * (i + 1));
    return acc + sp * (cdsPremiumBps / 10000) * notional * discountFactor;
  }, 0);

  // Par spread: where premium leg PV = protection leg PV
  const annuityFactor = survivalProbs.reduce((acc, sp, i) => acc + sp * Math.exp(-riskFreeRate * (i + 1)), 0);
  const cdsParSpread = annuityFactor > 0 ? (protectionLegPV / notional / annuityFactor) * 10000 : cdsPremiumBps;

  // Bond ASW spread (simplified) = bond yield - risk-free rate (in bps)
  const bondASWSpread = (bondYield - riskFreeRate) * 10000;

  // Basis
  const basis = cdsPremiumBps - bondASWSpread;
  const basisType = basis < -10 ? "negative" : basis > 10 ? "positive" : "neutral";

  // Hedge ratio via DV01 matching
  const cdsDV01 = annuityFactor * notional / 10000; // $ per bp move
  const bondDV01 = bondModifiedDuration * notional / 10000;
  const hedgeRatioDV01 = bondDV01 / cdsDV01;

  const hedgeCostAnnualBps = cdsPremiumBps; // cost of buying protection
  const carry = bondASWSpread - cdsPremiumBps; // positive carry = earn more than hedge costs
  const bpvUSD = cdsDV01;

  // Scenarios: basis movement impact
  const scenario01 = [
    { name: "Basis narrows 10bp", basisChange: -10, pnl: -10 * bpvUSD / 100 },
    { name: "Basis narrows 25bp", basisChange: -25, pnl: -25 * bpvUSD / 100 },
    { name: "Basis widens 10bp", basisChange: 10, pnl: 10 * bpvUSD / 100 },
    { name: "Basis widens 25bp", basisChange: 25, pnl: 25 * bpvUSD / 100 },
    { name: "Issuer default (40% recovery)", basisChange: 0, pnl: -notional * lgd + protectionLegPV },
    { name: "Spread tightening 100bp", basisChange: -50, pnl: bondModifiedDuration * notional * 0.01 },
  ];

  return { impliedPD: defaultProbabilityPA, protectionLegPV, premiumLegPV, cdsParSpread, bondASWSpread, basis, basisType, hedgeRatioDV01, hedgeCostAnnualBps, carry, bpvUSD, scenario01 };
}

export const HBO2_CDS: CDSInputs = {
  notional: 116_250_000,
  maturityYears: 5,
  cdsPremiumBps: 285,
  bondYield: 0.0625,
  riskFreeRate: 0.0445,
  recoveryRate: 0.42,
  defaultProbabilityPA: 0.028,
  bondModifiedDuration: 4.2,
};

// Basis risk P&L attribution
export interface BasisRiskAttribution {
  spreadContribution: number;   // P&L from spread move
  defaultContribution: number;  // P&L from default probability change
  recoveryContribution: number; // P&L from recovery rate change
  totalPnL: number;
}

export function attributeBasisRisk(
  original: CDSInputs,
  stressed: Partial<CDSInputs>
): BasisRiskAttribution {
  const base = priceCDS(original);
  const stressedCDS = priceCDS({ ...original, ...stressed });
  const spreadContrib = (stressedCDS.cdsParSpread - base.cdsParSpread) * original.notional / 10000 * -4.2;
  const defaultContrib = stressedCDS.protectionLegPV - base.protectionLegPV;
  const recoveryContrib = (stressed.recoveryRate !== undefined)
    ? (stressed.recoveryRate - original.recoveryRate) * original.notional * -0.5
    : 0;
  return {
    spreadContribution: spreadContrib,
    defaultContribution: defaultContrib,
    recoveryContribution: recoveryContrib,
    totalPnL: spreadContrib + defaultContrib + recoveryContrib,
  };
}
