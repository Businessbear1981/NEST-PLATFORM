export interface SuretyInputs {
  bondFace: number;
  dscr: number;
  ltv: number;
  sponsorNetWorth: number;
  projectType: "construction" | "performance" | "payment" | "maintenance";
  aumTier: "0-15M" | "15-40M" | "40-80M" | "80M+";
  liquidityRatio: number; // current assets / current liabilities
  yearsInBusiness: number;
}

export interface SuretyResult {
  annualPremiumRate: number; // basis points
  annualPremiumUSD: number;
  totalPremium3yr: number;
  collateralRequirement: number; // % of bond face
  collateralUSD: number;
  lcRequired: boolean;
  lcSizingUSD: number;
  tier: "self-collateralized" | "LC-dominant" | "hybrid" | "surety-only";
  riskScore: number; // 0-100
  notes: string[];
}

export function priceSurety(inputs: SuretyInputs): SuretyResult {
  let baseRate = 150; // bps
  const notes: string[] = [];

  // DSCR adjustment
  if (inputs.dscr >= 2.0) {
    baseRate -= 30;
    notes.push("Strong DSCR: -30bp");
  } else if (inputs.dscr < 1.5) {
    baseRate += 50;
    notes.push("Weak DSCR: +50bp");
  }

  // LTV adjustment
  if (inputs.ltv > 70) {
    baseRate += 40;
    notes.push("High LTV: +40bp");
  } else if (inputs.ltv < 55) {
    baseRate -= 20;
    notes.push("Low LTV: -20bp");
  }

  // Project type
  const typeAdj: Record<string, number> = {
    construction: 40,
    performance: 20,
    payment: 10,
    maintenance: -10,
  };
  baseRate += typeAdj[inputs.projectType] || 0;

  // Sponsor net worth
  if (inputs.sponsorNetWorth > inputs.bondFace * 2) {
    baseRate -= 25;
    notes.push("Strong NW: -25bp");
  }

  // Liquidity adjustment
  if (inputs.liquidityRatio >= 2.0) {
    baseRate -= 10;
    notes.push("Strong liquidity: -10bp");
  } else if (inputs.liquidityRatio < 1.0) {
    baseRate += 25;
    notes.push("Weak liquidity: +25bp");
  }

  // Years in business
  if (inputs.yearsInBusiness >= 10) {
    baseRate -= 10;
    notes.push("Seasoned operator: -10bp");
  } else if (inputs.yearsInBusiness < 3) {
    baseRate += 20;
    notes.push("New operator: +20bp");
  }

  // AUM tier → collateral & LC
  const aumMap: Record<string, { collateralPct: number; lcRequired: boolean }> = {
    "0-15M": { collateralPct: 0.25, lcRequired: false },
    "15-40M": { collateralPct: 0.15, lcRequired: true },
    "40-80M": { collateralPct: 0.08, lcRequired: true },
    "80M+": { collateralPct: 0, lcRequired: false },
  };
  const { collateralPct, lcRequired } = aumMap[inputs.aumTier];
  const collateralUSD = inputs.bondFace * collateralPct;
  const lcSizingUSD = lcRequired ? inputs.bondFace * 0.15 : 0;

  const tier: SuretyResult["tier"] =
    collateralPct === 0
      ? "self-collateralized"
      : lcRequired && collateralPct > 0.1
      ? "hybrid"
      : lcRequired
      ? "LC-dominant"
      : "surety-only";

  const riskScore = Math.min(
    100,
    Math.max(0, 50 + (2.0 - inputs.dscr) * 20 + (inputs.ltv - 60) * 0.5)
  );

  const annualPremiumRate = Math.max(50, Math.min(400, baseRate));
  const annualPremiumUSD = inputs.bondFace * (annualPremiumRate / 10000);

  return {
    annualPremiumRate,
    annualPremiumUSD,
    totalPremium3yr: annualPremiumUSD * 3,
    collateralRequirement: collateralPct,
    collateralUSD,
    lcRequired,
    lcSizingUSD,
    tier,
    riskScore,
    notes,
  };
}
