export interface CreditFeatures {
  dscr: number;
  ltv: number;
  icr: number;
  cfLeverage: number;
  bsLeverage: number;
  dEbitda: number;
  sponsorNW: number;    // millions
  yearsInOperation: number;
  occupancyRate: number; // 0-1
}

export interface SHAPResult {
  baseValue: number;     // mean model output
  prediction: number;    // actual model output
  shapValues: Record<keyof CreditFeatures, number>;
  shapInteractions: Array<{ feature1: string; feature2: string; value: number }>;
  forcePlot: Array<{ feature: string; value: number; shapValue: number; positive: boolean }>;
  summary: Array<{ feature: string; meanAbsShap: number; rank: number }>;
}

// Linear credit model weights (calibrated to JP Morgan thresholds)
const WEIGHTS: Record<keyof CreditFeatures, number> = {
  dscr: 2.8,         // strongest predictor
  ltv: -1.6,         // higher LTV = worse
  icr: 1.4,
  cfLeverage: -0.9,
  bsLeverage: -0.7,
  dEbitda: -0.8,
  sponsorNW: 0.6,
  yearsInOperation: 0.3,
  occupancyRate: 1.2,
};

const BASELINE: CreditFeatures = {
  dscr: 1.75,
  ltv: 62,
  icr: 2.75,
  cfLeverage: 1.75,
  bsLeverage: 2.25,
  dEbitda: 5.5,
  sponsorNW: 50,
  yearsInOperation: 8,
  occupancyRate: 0.88,
};

const BASE_VALUE = 0.65; // baseline probability of investment grade

function modelScore(f: CreditFeatures): number {
  let score = BASE_VALUE;
  for (const [k, w] of Object.entries(WEIGHTS)) {
    const feat = k as keyof CreditFeatures;
    score += w * (f[feat] - BASELINE[feat]) * 0.05;
  }
  return Math.max(0, Math.min(1, score));
}

export function computeSHAP(features: CreditFeatures): SHAPResult {
  const prediction = modelScore(features);

  // Exact SHAP for additive model: φ_i = w_i * (x_i - baseline_i) * 0.05
  const shapValues = {} as Record<keyof CreditFeatures, number>;
  for (const [k, w] of Object.entries(WEIGHTS)) {
    const feat = k as keyof CreditFeatures;
    shapValues[feat] = w * (features[feat] - BASELINE[feat]) * 0.05;
  }

  // Interaction values (simplified — cross products for top pairs)
  const interactions = [
    {
      feature1: "dscr",
      feature2: "ltv",
      value: shapValues.dscr * shapValues.ltv * 0.5,
    },
    {
      feature1: "dscr",
      feature2: "icr",
      value: shapValues.dscr * shapValues.icr * 0.3,
    },
    {
      feature1: "ltv",
      feature2: "bsLeverage",
      value: shapValues.ltv * shapValues.bsLeverage * 0.4,
    },
  ];

  const forcePlot = (Object.entries(shapValues) as [string, number][])
    .map(([feature, shapValue]) => ({
      feature,
      value: features[feature as keyof CreditFeatures] as number,
      shapValue,
      positive: shapValue > 0,
    }))
    .sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  const summary = forcePlot.map((f, i) => ({
    feature: f.feature,
    meanAbsShap: Math.abs(f.shapValue),
    rank: i + 1,
  }));

  return {
    baseValue: BASE_VALUE,
    prediction,
    shapValues,
    shapInteractions: interactions,
    forcePlot,
    summary,
  };
}

export const HBO2_FEATURES: CreditFeatures = {
  dscr: 1.62,
  ltv: 68,
  icr: 2.45,
  cfLeverage: 1.95,
  bsLeverage: 2.48,
  dEbitda: 6.2,
  sponsorNW: 180,
  yearsInOperation: 12,
  occupancyRate: 0.79,
};
