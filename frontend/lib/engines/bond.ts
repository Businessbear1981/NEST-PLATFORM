/**
 * Bond Pricing + Yield Math
 * Standard fixed-income analytics: price, YTM, modified duration, convexity.
 */

/**
 * Price a fixed-coupon bond using standard DCF.
 * @param faceValue      Par value (e.g. 1000)
 * @param couponRate     Annual coupon rate (e.g. 0.065 for 6.5%)
 * @param yieldToMaturity Annual YTM (e.g. 0.07)
 * @param periods        Total coupon periods (e.g. 20 for 10yr semi-annual)
 * @param periodsPerYear Compounding frequency (2 = semi-annual default)
 */
export function bondPrice(
  faceValue: number,
  couponRate: number,
  yieldToMaturity: number,
  periods: number,
  periodsPerYear = 2
): number {
  const c = (couponRate / periodsPerYear) * faceValue;
  const r = yieldToMaturity / periodsPerYear;
  if (r === 0) return c * periods + faceValue;
  return (
    (c * (1 - Math.pow(1 + r, -periods))) / r +
    faceValue / Math.pow(1 + r, periods)
  );
}

/**
 * Solve for YTM given a market price using Newton-Raphson iteration.
 */
export function yieldToMaturity(
  price: number,
  faceValue: number,
  couponRate: number,
  periods: number,
  periodsPerYear = 2
): number {
  let ytm = couponRate;
  for (let i = 0; i < 100; i++) {
    const p = bondPrice(faceValue, couponRate, ytm, periods, periodsPerYear);
    // Derivative of price w.r.t. ytm (analytical)
    const r = ytm / periodsPerYear;
    const c = (couponRate / periodsPerYear) * faceValue;
    let dpDytm = 0;
    for (let t = 1; t <= periods; t++) {
      const cf =
        t === periods ? c + faceValue : c;
      dpDytm -= (t / periodsPerYear) * cf / Math.pow(1 + r, t + 1) / periodsPerYear;
    }
    const diff = p - price;
    if (Math.abs(diff) < 0.0001) break;
    if (dpDytm === 0) break;
    ytm -= diff / dpDytm;
  }
  return ytm;
}

/**
 * Modified duration (price sensitivity to yield change, in years).
 */
export function modifiedDuration(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
  periodsPerYear = 2
): number {
  const r = ytm / periodsPerYear;
  const p = bondPrice(faceValue, couponRate, ytm, periods, periodsPerYear);
  const c = (couponRate / periodsPerYear) * faceValue;
  let macaulay = 0;
  for (let t = 1; t <= periods; t++) {
    const cashFlow = t === periods ? c + faceValue : c;
    macaulay += (t / periodsPerYear) * (cashFlow / Math.pow(1 + r, t));
  }
  return macaulay / p / (1 + r);
}

/**
 * Convexity — second-order price sensitivity (used to refine duration hedges).
 */
export function convexity(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
  periodsPerYear = 2
): number {
  const r = ytm / periodsPerYear;
  const p = bondPrice(faceValue, couponRate, ytm, periods, periodsPerYear);
  const c = (couponRate / periodsPerYear) * faceValue;
  let conv = 0;
  for (let t = 1; t <= periods; t++) {
    const cf = t === periods ? c + faceValue : c;
    conv += (t * (t + 1) * cf) / Math.pow(1 + r, t + 2);
  }
  return conv / (p * Math.pow(periodsPerYear, 2));
}

/**
 * Dollar value of a 1bp change in yield (DV01).
 */
export function dv01(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
  periodsPerYear = 2
): number {
  const p = bondPrice(faceValue, couponRate, ytm, periods, periodsPerYear);
  const pUp = bondPrice(faceValue, couponRate, ytm + 0.0001, periods, periodsPerYear);
  return Math.abs(pUp - p);
}

/**
 * Price change approximation using duration + convexity.
 * @param deltaYield Change in yield (e.g. 0.01 for +100bp)
 */
export function priceChangeApprox(
  faceValue: number,
  couponRate: number,
  ytm: number,
  periods: number,
  deltaYield: number,
  periodsPerYear = 2
): number {
  const p = bondPrice(faceValue, couponRate, ytm, periods, periodsPerYear);
  const md = modifiedDuration(faceValue, couponRate, ytm, periods, periodsPerYear);
  const cx = convexity(faceValue, couponRate, ytm, periods, periodsPerYear);
  return p * (-md * deltaYield + 0.5 * cx * deltaYield * deltaYield);
}

// NEST reference bond — Jacaranda PLOM Series A
export const JACARANDA_SERIES_A = {
  faceValue: 1_000,
  couponRate: 0.07,    // 7.0% coupon
  periods: 40,         // 20yr semi-annual
  periodsPerYear: 2,
};
