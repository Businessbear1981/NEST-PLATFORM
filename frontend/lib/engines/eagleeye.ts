export interface PropertyScan {
  propertyName: string;
  address: string;
  market: string;
  units: number;
  askingPrice: number;
  noi: number;
  occupancy: number;
  propertyType: "CCRC" | "Senior Housing" | "Multifamily" | "Mixed Use" | "Office" | "Industrial";
  yearBuilt: number;
  loanMaturity?: string;
}

export interface EagleEyeScore {
  overall: number;
  financialHealth: number;
  locationScore: number;
  distressLevel: "NONE" | "WATCH" | "DISTRESSED" | "DEEP_VALUE";
  capRate: number;
  pricePerUnit: number;
  yieldOnCost: number;
  recommendation: "BUY" | "WATCH" | "PASS";
  signals: string[];
}

export interface MarketHeatPoint {
  market: string;
  state: string;
  dealCount: number;
  avgCapRate: number;
  avgDSCR: number;
  heatScore: number;
  trend: "HOT" | "WARM" | "COOL";
}

const MARKET_DATA: MarketHeatPoint[] = [
  { market: "Tampa Bay",    state: "FL", dealCount: 14, avgCapRate: 0.062, avgDSCR: 1.71, heatScore: 88, trend: "HOT"  },
  { market: "Jacksonville", state: "FL", dealCount: 9,  avgCapRate: 0.065, avgDSCR: 1.65, heatScore: 76, trend: "HOT"  },
  { market: "Orlando",      state: "FL", dealCount: 11, avgCapRate: 0.060, avgDSCR: 1.74, heatScore: 82, trend: "HOT"  },
  { market: "Austin",       state: "TX", dealCount: 7,  avgCapRate: 0.055, avgDSCR: 1.80, heatScore: 74, trend: "WARM" },
  { market: "Dallas",       state: "TX", dealCount: 12, avgCapRate: 0.058, avgDSCR: 1.72, heatScore: 79, trend: "HOT"  },
  { market: "Phoenix",      state: "AZ", dealCount: 6,  avgCapRate: 0.063, avgDSCR: 1.68, heatScore: 71, trend: "WARM" },
  { market: "Charlotte",    state: "NC", dealCount: 8,  avgCapRate: 0.064, avgDSCR: 1.63, heatScore: 68, trend: "WARM" },
  { market: "Nashville",    state: "TN", dealCount: 5,  avgCapRate: 0.059, avgDSCR: 1.77, heatScore: 72, trend: "WARM" },
  { market: "Atlanta",      state: "GA", dealCount: 10, avgCapRate: 0.066, avgDSCR: 1.60, heatScore: 65, trend: "COOL" },
  { market: "Las Vegas",    state: "NV", dealCount: 4,  avgCapRate: 0.070, avgDSCR: 1.55, heatScore: 58, trend: "COOL" },
];

export function scoreProperty(scan: PropertyScan): EagleEyeScore {
  const capRate = scan.noi / Math.max(1, scan.askingPrice);
  const pricePerUnit = scan.askingPrice / Math.max(1, scan.units);

  // Financial health 0–40
  const capRateScore = Math.min(40, (capRate / 0.08) * 40);
  // Occupancy 0–30
  const occupancyScore = Math.min(30, (scan.occupancy / 100) * 30);
  // Location 0–20
  const marketMatch = MARKET_DATA.find(
    (m) =>
      scan.market.toLowerCase().includes(m.market.toLowerCase()) ||
      scan.address.toLowerCase().includes(m.state.toLowerCase())
  );
  const locationScore = marketMatch ? Math.round((marketMatch.heatScore / 100) * 20) : 10;
  // Age 0–10
  const age = 2026 - scan.yearBuilt;
  const ageScore = Math.max(0, 10 - age / 10);

  const overall = Math.round(capRateScore + occupancyScore + locationScore + ageScore);
  const financialHealth = Math.round(capRateScore + occupancyScore);

  let distressLevel: EagleEyeScore["distressLevel"] = "NONE";
  if (scan.occupancy < 70 || capRate > 0.09)       distressLevel = "DEEP_VALUE";
  else if (scan.occupancy < 80 || capRate > 0.075) distressLevel = "DISTRESSED";
  else if (scan.occupancy < 88)                     distressLevel = "WATCH";

  const signals: string[] = [];
  if (capRate > 0.065) signals.push(`Cap rate ${(capRate * 100).toFixed(2)}% above market avg — value upside`);
  if (scan.occupancy < 85) signals.push(`Occupancy ${scan.occupancy}% below 88% stabilized threshold`);
  if (scan.loanMaturity) signals.push(`Loan maturity ${scan.loanMaturity} — distress window open`);
  if (age > 30) signals.push(`Age ${age} yrs — capex renovation risk`);
  if (marketMatch?.trend === "HOT") signals.push(`${marketMatch.market} trending HOT — ${marketMatch.dealCount} live comps`);
  if (pricePerUnit < 400_000 && scan.propertyType === "CCRC") signals.push("Below-replacement CCRC pricing — dislocation opportunity");

  let recommendation: EagleEyeScore["recommendation"] = "PASS";
  if (overall >= 65 && distressLevel !== "NONE") recommendation = "BUY";
  else if (overall >= 50)                         recommendation = "WATCH";

  return {
    overall,
    financialHealth,
    locationScore,
    distressLevel,
    capRate,
    pricePerUnit,
    yieldOnCost: capRate,
    recommendation,
    signals,
  };
}

export function getMarketHeatData(): MarketHeatPoint[] {
  return MARKET_DATA;
}

export const HBO2_SCAN: PropertyScan = {
  propertyName: "HBO2 — CCRC Senior Living Complex",
  address: "St. Petersburg, FL",
  market: "Tampa Bay",
  units: 280,
  askingPrice: 178_500_000,
  noi: 10_730_000,
  occupancy: 79,
  propertyType: "CCRC",
  yearBuilt: 2004,
  loanMaturity: "2026-Q2",
};
