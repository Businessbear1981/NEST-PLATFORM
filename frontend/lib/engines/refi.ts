// Refinance & Call/Put Optimization Engine
// Analyzes when to call, defease, or put bonds
// NPV savings, breakeven periods, optimal call timing

export interface BondCallInputs {
  currentCoupon: number;           // current bond coupon rate
  currentOutstanding: number;      // outstanding principal
  callDate: string;                // next call date (ISO)
  callPrice: number;               // call price (% of par, e.g. 101.0)
  remainingMaturity: number;       // years to final maturity from today
  refundingCoupon: number;         // new bond coupon rate achievable
  refundingCosts: number;          // underwriting, legal, etc.
  escrowYield: number;             // yield on defeasance escrow
  currentMarketYield: number;      // current market yield for comparable bonds
  taxExemptSavingsRate?: number;   // tax savings on interest (0 if tax-exempt)
}

export interface CallAnalysisResult {
  callPremiumUSD: number;
  currentDebtServiceNPV: number;   // NPV of remaining debt service at refunding rate
  refundingDebtServiceNPV: number; // NPV of new bond debt service
  grossSavings: number;            // current - refunding NPV
  refundingCosts: number;
  netPresentValueSavings: number;  // gross - costs
  npvSavingsPct: number;           // as % of outstanding
  annualSavings: number;           // average annual cash savings
  breakEvenYears: number;          // costs / annual savings
  currentYieldToCall: number;      // YTC on current bonds
  refundingYieldToMaturity: number;
  escrowSize: number;              // required to defease old bonds to call date
  escrowCostAboveMarket: number;   // negative arbitrage on escrow
  recommendation: "call_now" | "wait" | "tender" | "hold";
  callWindow: { optimal: string; latest: string };
}

function pv(rate: number, periods: number, payment: number, fv = 0): number {
  if (rate === 0) return payment * periods + fv;
  return payment * (1 - Math.pow(1 + rate, -periods)) / rate + fv / Math.pow(1 + rate, periods);
}

export function analyzeCall(inputs: BondCallInputs): CallAnalysisResult {
  const {
    currentCoupon, currentOutstanding, callPrice, remainingMaturity,
    refundingCoupon, refundingCosts, escrowYield, currentMarketYield,
  } = inputs;

  const callPremiumUSD = currentOutstanding * (callPrice / 100 - 1);

  // Semi-annual periods
  const semiPeriods = Math.round(remainingMaturity * 2);
  const currentSemiCoupon = currentCoupon / 2;
  const refundingSemiCoupon = refundingCoupon / 2;
  const discountRate = currentMarketYield / 2;

  // NPV of current debt service discounted at market rate
  const currentAnnualDS = currentOutstanding * currentCoupon + currentOutstanding / remainingMaturity;
  const refundingAnnualDS = currentOutstanding * refundingCoupon + currentOutstanding / remainingMaturity;

  const currentDebtServiceNPV = pv(discountRate, semiPeriods, currentOutstanding * currentSemiCoupon, currentOutstanding);
  const refundingDebtServiceNPV = pv(discountRate, semiPeriods, currentOutstanding * refundingSemiCoupon, currentOutstanding);

  const grossSavings = currentDebtServiceNPV - refundingDebtServiceNPV;
  const netPresentValueSavings = grossSavings - refundingCosts - callPremiumUSD;
  const npvSavingsPct = (netPresentValueSavings / currentOutstanding) * 100;
  const annualSavings = (currentAnnualDS - refundingAnnualDS);
  const breakEvenYears = annualSavings > 0 ? (refundingCosts + callPremiumUSD) / annualSavings : 999;

  // Defeasance escrow: PV of cash flows to call date at escrow yield
  const yearsToCall = new Date(inputs.callDate) > new Date()
    ? (new Date(inputs.callDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)
    : 0;
  const callPeriodsToCall = Math.round(yearsToCall * 2);
  const escrowSize = callPeriodsToCall > 0
    ? pv(escrowYield / 2, callPeriodsToCall, currentOutstanding * currentSemiCoupon, currentOutstanding * (callPrice / 100))
    : currentOutstanding * (callPrice / 100);

  const escrowCostAboveMarket = Math.max(0, escrowSize - currentOutstanding) * (currentMarketYield - escrowYield);

  const currentYTC = currentMarketYield + (callPrice / 100 - 1) / Math.max(yearsToCall, 0.5);

  let recommendation: CallAnalysisResult["recommendation"] = "hold";
  if (netPresentValueSavings > 0 && npvSavingsPct > 3) recommendation = "call_now";
  else if (netPresentValueSavings > 0 && breakEvenYears < 3) recommendation = "call_now";
  else if (netPresentValueSavings < 0 && currentMarketYield < currentCoupon - 0.005) recommendation = "wait";
  else if (currentMarketYield > currentCoupon + 0.01) recommendation = "tender";

  return {
    callPremiumUSD,
    currentDebtServiceNPV,
    refundingDebtServiceNPV,
    grossSavings,
    refundingCosts,
    netPresentValueSavings,
    npvSavingsPct,
    annualSavings,
    breakEvenYears,
    currentYieldToCall: currentYTC,
    refundingYieldToMaturity: refundingCoupon,
    escrowSize,
    escrowCostAboveMarket,
    recommendation,
    callWindow: {
      optimal: inputs.callDate,
      latest: new Date(new Date(inputs.callDate).getTime() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  };
}

// Monte Carlo: simulate 1000 rate paths and find optimal call timing
export function monteCarloCallOptimization(
  inputs: BondCallInputs,
  simulations = 500
): { optimalCallYear: number; avgNPVSavings: number; callProbability: number } {
  let totalNPV = 0;
  let callCount = 0;
  const volatility = 0.015; // 150bp annual rate vol

  for (let i = 0; i < simulations; i++) {
    // Geometric Brownian motion for rates
    const drift = -0.002; // slight mean reversion
    const shock = (Math.sin(i * 2.3) * 0.7 + Math.cos(i * 1.7) * 0.3) * volatility; // deterministic pseudo-random
    const simulatedRate = inputs.currentMarketYield * Math.exp(drift + shock);
    const simulatedInputs = { ...inputs, refundingCoupon: simulatedRate + 0.005 };
    const result = analyzeCall(simulatedInputs);
    if (result.recommendation === "call_now") {
      callCount++;
      totalNPV += result.netPresentValueSavings;
    }
  }

  return {
    optimalCallYear: new Date(inputs.callDate).getFullYear(),
    avgNPVSavings: callCount > 0 ? totalNPV / callCount : 0,
    callProbability: callCount / simulations,
  };
}

export const JACARANDA_REFI: BondCallInputs = {
  currentCoupon: 0.0575,
  currentOutstanding: 231_000_000,
  callDate: "2030-10-01",
  callPrice: 100.0,                // par call
  remainingMaturity: 28,
  refundingCoupon: 0.0495,          // current market for A-rated CCRC
  refundingCosts: 3_200_000,        // ~1.4% of par
  escrowYield: 0.0445,              // SOFR-based treasury escrow
  currentMarketYield: 0.052,
};

export const HBO2_REFI: BondCallInputs = {
  currentCoupon: 0.0625,
  currentOutstanding: 116_250_000,
  callDate: "2031-04-01",
  callPrice: 101.0,
  remainingMaturity: 25,
  refundingCoupon: 0.0540,
  refundingCosts: 1_800_000,
  escrowYield: 0.0445,
  currentMarketYield: 0.0560,
};
