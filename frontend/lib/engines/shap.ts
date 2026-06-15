// NEST SHAP Engine — SHapley Additive exPlanations (Lloyd Shapley, 1953)
// Pure TypeScript math — no external dependencies.
// Used by: AI Shadow Rating, Credit Memo, Surety Packaging

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Feature {
  name: string;
  value: number;
  baseline: number; // average / expected value for this feature
}

export interface SHAPValue {
  feature: string;
  value: number; // actual feature value
  shapValue: number; // contribution to prediction (+ or -)
  contribution: 'positive' | 'negative' | 'neutral';
  percentageContribution: number;
}

export interface SHAPResult {
  baseValue: number; // average prediction E[f(x)]
  predictedValue: number; // actual prediction
  shapValues: SHAPValue[]; // one per feature
  topPositive: SHAPValue[]; // top 3 pushing UP
  topNegative: SHAPValue[]; // top 3 pushing DOWN
}

export interface ForceplotData {
  base: number;
  prediction: number;
  positiveFeatures: { name: string; value: number; contribution: number }[];
  negativeFeatures: { name: string; value: number; contribution: number }[];
}

export interface WaterfallRow {
  feature: string;
  runningTotal: number;
  contribution: number;
  isBase: boolean;
  isFinal: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Iterate bits of an integer as a boolean mask of length n. */
function coalitionMask(coalition: number, n: number): boolean[] {
  const mask: boolean[] = new Array(n);
  for (let i = 0; i < n; i++) {
    mask[i] = ((coalition >> i) & 1) === 1;
  }
  return mask;
}

/** Number of set bits. */
function popcount(x: number): number {
  let c = 0;
  let v = x;
  while (v) { c += v & 1; v >>= 1; }
  return c;
}

/**
 * KernelSHAP weight for a coalition of size |z| out of n features.
 *   w(z) = (n-1) / (C(n, |z|) * |z| * (n - |z|))
 * Edge cases (|z|=0, |z|=n) are handled by assigning a very large weight so
 * the linear regression respects f(all) and f(none) exactly.
 */
function kernelWeight(coalitionSize: number, n: number): number {
  if (coalitionSize === 0 || coalitionSize === n) return 1e6;
  const binom = binomialCoeff(n, coalitionSize);
  return (n - 1) / (binom * coalitionSize * (n - coalitionSize));
}

function binomialCoeff(n: number, k: number): number {
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/**
 * Build a feature vector by replacing coalition-absent features with their
 * baseline values.
 */
function maskedInput(
  features: Feature[],
  mask: boolean[]
): Record<string, number> {
  const x: Record<string, number> = {};
  for (let i = 0; i < features.length; i++) {
    x[features[i].name] = mask[i] ? features[i].value : features[i].baseline;
  }
  return x;
}

/**
 * Weighted least-squares: solves  W Z φ = W y  for φ.
 * Z is n_samples × n_features binary design matrix.
 * Uses Normal Equations: (Z^T W Z) φ = Z^T W y.
 * We use a simple Gauss–Jordan pivot (sufficient for n ≤ 12).
 */
function wls(
  Z: number[][],
  y: number[],
  w: number[]
): number[] {
  const n = Z[0].length;
  const m = Z.length;

  // Build A = Z^T W Z  and  b = Z^T W y
  const A: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const b: number[] = new Array(n).fill(0);

  for (let s = 0; s < m; s++) {
    for (let i = 0; i < n; i++) {
      b[i] += w[s] * Z[s][i] * y[s];
      for (let j = 0; j < n; j++) {
        A[i][j] += w[s] * Z[s][i] * Z[s][j];
      }
    }
  }

  // Gauss–Jordan elimination with partial pivoting
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // Pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) continue; // singular — skip

    for (let j = col; j <= n; j++) aug[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  return aug.map(row => row[n]);
}

/** Pseudo-random integer in [0, max) — seeded via XorShift32 for reproducibility. */
class XorShift32 {
  private state: number;
  constructor(seed = 42) { this.state = seed >>> 0 || 1; }
  next(): number {
    let x = this.state;
    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }
  nextInt(max: number): number { return this.next() % max; }
}

// ---------------------------------------------------------------------------
// 1. computeKernelSHAP
// ---------------------------------------------------------------------------

/**
 * KernelSHAP for arbitrary black-box models.
 *
 * For n ≤ 10 features: enumerates ALL 2^n coalitions (exact).
 * For n > 10 features: draws 512 random coalitions (approximate).
 *
 * The SHAP constraint Σφ_i = f(x) - E[f(x)] is enforced by the kernel
 * weighting scheme (large weights on empty/full coalition rows).
 */
export function computeKernelSHAP(
  features: Feature[],
  model: (x: Record<string, number>) => number,
  nSamples = 512
): SHAPResult {
  const n = features.length;
  const fullMask = maskedInput(features, new Array(n).fill(true));
  const emptyMask = maskedInput(features, new Array(n).fill(false));

  const baseValue = model(emptyMask);
  const predictedValue = model(fullMask);

  // Build sample set
  const coalitions: boolean[][] = [];
  const weights: number[] = [];
  const outputs: number[] = [];

  if (n <= 10) {
    // Exact: all 2^n coalitions
    for (let c = 0; c < (1 << n); c++) {
      const mask = coalitionMask(c, n);
      coalitions.push(mask);
      weights.push(kernelWeight(popcount(c), n));
      outputs.push(model(maskedInput(features, mask)));
    }
  } else {
    // Approximate: 512 random coalitions + the two boundary coalitions
    const rng = new XorShift32(777);
    // Always include empty and full
    const boundary: number[][] = [
      new Array(n).fill(0),
      new Array(n).fill(1),
    ];
    for (const b of boundary) {
      const mask = b.map(x => x === 1);
      coalitions.push(mask);
      weights.push(kernelWeight(b.filter(Boolean).length, n));
      outputs.push(model(maskedInput(features, mask)));
    }
    // Random samples
    for (let s = 0; s < nSamples - 2; s++) {
      const mask: boolean[] = new Array(n).fill(false);
      const size = rng.nextInt(n - 1) + 1; // 1..n-1
      // Fisher–Yates shuffle to pick `size` distinct indices
      const indices = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) {
        const j = rng.nextInt(i + 1);
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      for (let i = 0; i < size; i++) mask[indices[i]] = true;
      coalitions.push(mask);
      weights.push(kernelWeight(size, n));
      outputs.push(model(maskedInput(features, mask)));
    }
  }

  // Build design matrix Z (binary)
  const Z: number[][] = coalitions.map(mask => mask.map(b => b ? 1 : 0));

  // Solve WLS: φ = argmin_φ Σ w_s (z_s · φ - (f(z_s) - baseValue))^2
  const yShifted = outputs.map(o => o - baseValue);
  const phi = wls(Z, yShifted, weights);

  // Build SHAPValue array
  const totalAbsShap = phi.reduce((s, v) => s + Math.abs(v), 0) || 1;
  const shapValues: SHAPValue[] = features.map((f, i) => ({
    feature: f.name,
    value: f.value,
    shapValue: phi[i],
    contribution:
      phi[i] > 1e-9 ? 'positive' : phi[i] < -1e-9 ? 'negative' : 'neutral',
    percentageContribution: (Math.abs(phi[i]) / totalAbsShap) * 100,
  }));

  const sorted = [...shapValues].sort((a, b) => b.shapValue - a.shapValue);
  const topPositive = sorted.filter(s => s.shapValue > 0).slice(0, 3);
  const topNegative = [...shapValues]
    .sort((a, b) => a.shapValue - b.shapValue)
    .filter(s => s.shapValue < 0)
    .slice(0, 3);

  return { baseValue, predictedValue, shapValues, topPositive, topNegative };
}

// ---------------------------------------------------------------------------
// 2. computeNESTRatingSHAP
// ---------------------------------------------------------------------------

/**
 * NEST Shadow Rating model — calibrated to S&P OPBA methodology.
 *
 * score = dscr * 0.40 + (1 / leverage) * 0.30 + liquidity * 0.30
 *
 * Industry baselines (Moody's CRE sector medians):
 *   dscr=1.5, ltv=70, leverage=3.5, liquidity=0.75, green=0, sponsor_years=10
 *
 * Returns full KernelSHAP breakdown (exact — only 6 features → 64 coalitions).
 */
export function computeNESTRatingSHAP(dealMetrics: {
  dscr: number;
  ltv: number;
  leverage: number;
  liquidity: number;
  green: number;
  sponsor_years: number;
}): SHAPResult {
  const features: Feature[] = [
    { name: 'dscr', value: dealMetrics.dscr, baseline: 1.5 },
    { name: 'ltv', value: dealMetrics.ltv, baseline: 70 },
    { name: 'leverage', value: dealMetrics.leverage, baseline: 3.5 },
    { name: 'liquidity', value: dealMetrics.liquidity, baseline: 0.75 },
    { name: 'green_bond', value: dealMetrics.green, baseline: 0 },
    { name: 'sponsor_experience', value: dealMetrics.sponsor_years, baseline: 10 },
  ];

  // NEST rating model: S&P OPBA weights
  function nestModel(x: Record<string, number>): number {
    const dscrScore = x['dscr'] * 0.40;
    const leverageScore = (x['leverage'] > 0 ? 1 / x['leverage'] : 0) * 0.30;
    const liquidityScore = x['liquidity'] * 0.30;
    // Green bond premium: +2% if green=1
    const greenPremium = (x['green_bond'] ?? 0) * 0.02;
    // Sponsor experience: marginal positive, max 3% boost at 20 years
    const sponsorBoost = Math.min((x['sponsor_experience'] ?? 0) / 20, 1) * 0.03;
    return dscrScore + leverageScore + liquidityScore + greenPremium + sponsorBoost;
  }

  return computeKernelSHAP(features, nestModel);
}

// ---------------------------------------------------------------------------
// 3. generateForcePlot
// ---------------------------------------------------------------------------

export function generateForcePlot(result: SHAPResult): ForceplotData {
  const positiveFeatures = result.shapValues
    .filter(s => s.contribution === 'positive')
    .sort((a, b) => b.shapValue - a.shapValue)
    .map(s => ({ name: s.feature, value: s.value, contribution: s.shapValue }));

  const negativeFeatures = result.shapValues
    .filter(s => s.contribution === 'negative')
    .sort((a, b) => a.shapValue - b.shapValue)
    .map(s => ({ name: s.feature, value: s.value, contribution: s.shapValue }));

  return {
    base: result.baseValue,
    prediction: result.predictedValue,
    positiveFeatures,
    negativeFeatures,
  };
}

// ---------------------------------------------------------------------------
// 4. generateWaterfallData
// ---------------------------------------------------------------------------

/** Ordered waterfall: base → features sorted by |SHAP| desc → prediction. */
export function generateWaterfallData(result: SHAPResult): WaterfallRow[] {
  const rows: WaterfallRow[] = [];

  // Base row
  rows.push({
    feature: 'E[f(x)]',
    runningTotal: result.baseValue,
    contribution: 0,
    isBase: true,
    isFinal: false,
  });

  // Features sorted by absolute SHAP (largest impact first)
  const sorted = [...result.shapValues].sort(
    (a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue)
  );

  let running = result.baseValue;
  for (const sv of sorted) {
    running += sv.shapValue;
    rows.push({
      feature: sv.feature,
      runningTotal: running,
      contribution: sv.shapValue,
      isBase: false,
      isFinal: false,
    });
  }

  // Final prediction row
  rows.push({
    feature: 'f(x)',
    runningTotal: result.predictedValue,
    contribution: result.predictedValue - result.baseValue,
    isBase: false,
    isFinal: true,
  });

  return rows;
}

// ---------------------------------------------------------------------------
// 5. generateSummaryData
// ---------------------------------------------------------------------------

/**
 * Beeswarm summary across multiple deals.
 * Returns features sorted by mean |SHAP| descending.
 */
export function generateSummaryData(
  results: SHAPResult[]
): { feature: string; meanAbsShap: number; values: number[] }[] {
  if (results.length === 0) return [];

  // Collect all feature names
  const featureNames = Array.from(
    new Set(results.flatMap(r => r.shapValues.map(s => s.feature)))
  );

  return featureNames
    .map(feature => {
      const shapEntries = results.flatMap(r =>
        r.shapValues.filter(s => s.feature === feature)
      );
      const absValues = shapEntries.map(s => Math.abs(s.shapValue));
      const meanAbsShap =
        absValues.length > 0
          ? absValues.reduce((a, b) => a + b, 0) / absValues.length
          : 0;
      const values = shapEntries.map(s => s.shapValue);
      return { feature, meanAbsShap, values };
    })
    .sort((a, b) => b.meanAbsShap - a.meanAbsShap);
}

// ---------------------------------------------------------------------------
// 6. explainRating
// ---------------------------------------------------------------------------

const NOTCH_SCALE = 10; // 0.1 score unit ≈ 1 rating notch

function formatNotches(shapValue: number): string {
  const notches = Math.abs(shapValue * NOTCH_SCALE).toFixed(1);
  return notches;
}

/**
 * Human-readable explanation for rating agencies and investors.
 * "The BBB+ rating is driven primarily by DSCR (+2.3 notches)
 *  offset by leverage (-1.1 notches)."
 */
export function explainRating(shapResult: SHAPResult, rating: string): string {
  const { topPositive, topNegative } = shapResult;

  if (topPositive.length === 0) {
    return `The ${rating} rating reflects below-average performance across all key metrics.`;
  }

  const primaryDriver = topPositive[0];
  const primaryLabel =
    primaryDriver.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const primaryNotches = formatNotches(primaryDriver.shapValue);

  let explanation = `The ${rating} rating is driven primarily by ${primaryLabel} (+${primaryNotches} notches)`;

  if (topPositive.length >= 2) {
    const secondDriver = topPositive[1];
    const secondLabel = secondDriver.feature
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    explanation += ` and ${secondLabel} (+${formatNotches(secondDriver.shapValue)} notches)`;
  }

  if (topNegative.length > 0) {
    const primaryRisk = topNegative[0];
    const riskLabel = primaryRisk.feature
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    explanation += `, offset by ${riskLabel} (${formatNotches(primaryRisk.shapValue)} notches)`;

    if (topNegative.length >= 2) {
      const secondRisk = topNegative[1];
      const secondRiskLabel = secondRisk.feature
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      explanation += ` and ${secondRiskLabel} (${formatNotches(secondRisk.shapValue)} notches)`;
    }
  }

  explanation += '.';
  return explanation;
}

// ---------------------------------------------------------------------------
// Legacy exports — backwards-compat with SHAPSuite.tsx if still referenced
// ---------------------------------------------------------------------------

export interface CreditFeatures {
  dscr: number;
  ltv: number;
  icr: number;
  cfLeverage: number;
  bsLeverage: number;
  dEbitda: number;
  sponsorNW: number;
  yearsInOperation: number;
  occupancyRate: number;
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
