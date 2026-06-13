// TEFRA Compliance Engine
// Governs tax-exempt private activity bonds (PABs)
// Key tests: qualified bond test, volume cap, arbitrage yield restriction, rebate

export interface TEFRAInputs {
  bondFace: number;                    // total bond principal
  issuePrice: number;                  // price bonds sold at (% of par, e.g. 98.5)
  couponRate: number;                  // stated interest rate
  maturityYears: number;               // years to final maturity
  closingDate: string;                 // ISO date
  stateVolumeCapAllocated: number;     // USD — state PAB volume cap allocated
  stateVolumeCapLimit: number;         // state's annual limit
  arbitrageYield: number;              // yield on bond (decimal)
  investmentYield: number;             // yield earned on invested proceeds (decimal)
  qualifiedUsePercent: number;         // % of proceeds used for qualified purpose (0-1)
  privateUsePercent: number;           // % of use by private business (0-1)
  privateSecurityPercent: number;      // % of payments secured by private business (0-1)
  publicHearingHeld: boolean;
  publicHearingDate: string;           // ISO date
  approvalResolutionPassed: boolean;
  bondCounselEngaged: boolean;
  bondType: "501c3" | "IDB" | "housing" | "student_loan" | "mortgage_revenue" | "exempt_facility";
  projectState: string;                // 2-letter state code
}

export interface TEFRAComplianceResult {
  isCompliant: boolean;
  qualifiedBondTest: { pass: boolean; reason: string };
  volumeCapTest: { pass: boolean; used: number; limit: number; utilizationPct: number };
  privateActivityTest: { pass: boolean; privateUse: number; threshold: number };
  arbitrageTest: { pass: boolean; spread: number; rebateRequired: boolean; estimatedRebateLiability: number };
  publicApprovalTest: { pass: boolean; items: string[] };
  restrictions: string[];
  recommendations: string[];
  riskLevel: "compliant" | "minor_issues" | "major_issues" | "non_compliant";
  estimatedCounselFees: number;
}

// TEFRA public approval: must hold public hearing ≥14 days after notice
function daysBetween(d1: string, d2: string): number {
  return Math.abs(new Date(d2).getTime() - new Date(d1).getTime()) / (1000 * 60 * 60 * 24);
}

export function checkTEFRACompliance(inputs: TEFRAInputs): TEFRAComplianceResult {
  const restrictions: string[] = [];
  const recommendations: string[] = [];

  // 1. Qualified Bond Test
  const qualifiedBondThreshold = inputs.bondType === "501c3" ? 0.95 : 0.90;
  const qualifiedBondPass = inputs.qualifiedUsePercent >= qualifiedBondThreshold;
  if (!qualifiedBondPass) {
    restrictions.push(`Qualified use at ${(inputs.qualifiedUsePercent * 100).toFixed(1)}% — must reach ${qualifiedBondThreshold * 100}% for ${inputs.bondType}`);
  }

  // 2. Volume Cap Test
  const volumeCapUtilization = inputs.bondFace / inputs.stateVolumeCapLimit;
  const volumeCapPass = inputs.bondFace <= inputs.stateVolumeCapAllocated;
  if (!volumeCapPass) {
    restrictions.push(`Bond face $${(inputs.bondFace / 1e6).toFixed(1)}M exceeds allocated volume cap $${(inputs.stateVolumeCapAllocated / 1e6).toFixed(1)}M`);
    recommendations.push("Apply to state allocation authority for supplemental volume cap; consider phased issuance");
  }

  // 3. Private Activity Tests (10% threshold for private use AND private security)
  const privateActivityFail = inputs.privateUsePercent > 0.10 || inputs.privateSecurityPercent > 0.10;
  const privateActivityThreshold = 0.10;
  if (privateActivityFail) {
    restrictions.push(`Private use ${(inputs.privateUsePercent * 100).toFixed(1)}% or private security ${(inputs.privateSecurityPercent * 100).toFixed(1)}% exceeds 10% threshold`);
    recommendations.push("Structure management contract with IRS Rev. Proc. 2017-13 safe harbor to reduce private use attribution");
  }

  // 4. Arbitrage Yield Restriction
  const arbitrageSpread = inputs.investmentYield - inputs.arbitrageYield;
  const arbitrageViolation = arbitrageSpread > 0.001; // >10bp positive arbitrage
  let estimatedRebateLiability = 0;
  if (arbitrageViolation) {
    // Rebate = 90% of arbitrage profit over bond life
    estimatedRebateLiability = arbitrageSpread * inputs.bondFace * inputs.maturityYears * 0.90;
    restrictions.push(`Investment yield ${(inputs.investmentYield * 100).toFixed(2)}% exceeds bond yield by ${(arbitrageSpread * 100).toFixed(2)}% — rebate required`);
    recommendations.push(`Estimate IRS Form 8038-T rebate liability: ~$${(estimatedRebateLiability / 1e6).toFixed(2)}M. Engage rebate specialist.`);
  }

  // 5. Public Approval (TEFRA hearing)
  const publicApprovalItems: string[] = [];
  const pubApprovalPass =
    inputs.publicHearingHeld &&
    inputs.approvalResolutionPassed &&
    inputs.bondCounselEngaged;

  if (!inputs.publicHearingHeld) publicApprovalItems.push("Public hearing not yet held (required ≥14 days after public notice)");
  else {
    const noticeToHearing = daysBetween(inputs.closingDate, inputs.publicHearingDate);
    if (noticeToHearing < 14) publicApprovalItems.push(`Hearing only ${noticeToHearing.toFixed(0)} days after notice — minimum 14 required`);
  }
  if (!inputs.approvalResolutionPassed) publicApprovalItems.push("Applicable elected representative approval resolution not passed");
  if (!inputs.bondCounselEngaged) publicApprovalItems.push("Bond counsel not yet engaged — required for tax opinion");

  if (publicApprovalItems.length === 0) publicApprovalItems.push("All public approval requirements met ✓");

  // Overall risk assessment
  const issueCount = [!qualifiedBondPass, !volumeCapPass, privateActivityFail, arbitrageViolation, !pubApprovalPass].filter(Boolean).length;
  const riskLevel = issueCount === 0 ? "compliant" : issueCount === 1 ? "minor_issues" : issueCount <= 3 ? "major_issues" : "non_compliant";

  const estimatedCounselFees = inputs.bondFace * 0.0008 + 75_000; // 8bp + $75K base

  return {
    isCompliant: issueCount === 0,
    qualifiedBondTest: { pass: qualifiedBondPass, reason: qualifiedBondPass ? `${(inputs.qualifiedUsePercent * 100).toFixed(1)}% qualified use meets threshold` : `Below ${qualifiedBondThreshold * 100}% threshold` },
    volumeCapTest: { pass: volumeCapPass, used: inputs.bondFace, limit: inputs.stateVolumeCapAllocated, utilizationPct: (inputs.bondFace / inputs.stateVolumeCapAllocated) * 100 },
    privateActivityTest: { pass: !privateActivityFail, privateUse: inputs.privateUsePercent, threshold: privateActivityThreshold },
    arbitrageTest: { pass: !arbitrageViolation, spread: arbitrageSpread * 10000, rebateRequired: arbitrageViolation, estimatedRebateLiability },
    publicApprovalTest: { pass: pubApprovalPass, items: publicApprovalItems },
    restrictions,
    recommendations,
    riskLevel,
    estimatedCounselFees,
  };
}

export const HBO2_TEFRA: TEFRAInputs = {
  bondFace: 155_000_000,
  issuePrice: 98.75,
  couponRate: 0.0625,
  maturityYears: 30,
  closingDate: "2026-09-15",
  stateVolumeCapAllocated: 155_000_000,
  stateVolumeCapLimit: 4_200_000_000, // Florida annual PAB cap
  arbitrageYield: 0.0625,
  investmentYield: 0.0448,            // construction fund invested at SOFR
  qualifiedUsePercent: 0.97,          // 97% of proceeds for qualified facility
  privateUsePercent: 0.03,
  privateSecurityPercent: 0.03,
  publicHearingHeld: true,
  publicHearingDate: "2026-08-01",
  approvalResolutionPassed: true,
  bondCounselEngaged: true,
  bondType: "501c3",
  projectState: "FL",
};

// TEFRA arbitrage rebate calculation (simplified 5-year lookback)
export function calculateArbitrageRebate(
  investedAmounts: Array<{ date: string; amount: number; yield: number }>,
  bondYield: number
): number {
  return investedAmounts.reduce((rebate, inv) => {
    const excess = Math.max(0, inv.yield - bondYield);
    return rebate + excess * inv.amount;
  }, 0) * 0.90; // 90% rebate requirement
}
