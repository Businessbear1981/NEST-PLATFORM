/**
 * Insurance & Surety Module Demo Data
 * Surety submission, coverage gaps, provider matching, premium scenarios
 */

export type CoverageType = 'performance' | 'payment' | 'bid' | 'maintenance' | 'warranty' | 'completion';
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ProviderStatus = 'available' | 'quoted' | 'approved' | 'declined';
export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'quoted' | 'approved' | 'issued' | 'declined';

export interface SuretyProvider {
  id: string;
  name: string;
  rating: number; // 1-5
  capacity: number; // in millions
  specialties: CoverageType[];
  premiumRange: { min: number; max: number }; // percentage
  responseTime: number; // days
  status: ProviderStatus;
  contactEmail: string;
  contactPhone: string;
  notes?: string;
}

export interface CoverageRequirement {
  id: string;
  type: CoverageType;
  amount: number;
  required: boolean;
  description: string;
}

export interface UnderwritingGap {
  id: string;
  dealId: string;
  category: string;
  description: string;
  severity: GapSeverity;
  requiredEvidence: string[];
  collectedEvidence: string[];
  remediationSteps: string[];
  dueDate?: Date;
  owner?: string;
}

export interface PremiumScenario {
  id: string;
  dealId: string;
  name: string;
  coverageAmount: number;
  term: number; // years
  riskFactors: Record<string, number>; // factor name -> multiplier
  basePremium: number;
  totalPremium: number;
  premiumRate: number; // percentage
  createdAt: Date;
}

export interface SuretySubmission {
  id: string;
  dealId: string;
  status: SubmissionStatus;
  createdAt: Date;
  submittedAt?: Date;
  coverageRequirements: CoverageRequirement[];
  gaps: UnderwritingGap[];
  selectedProviders: string[]; // provider IDs
  selectedScenario?: PremiumScenario;
  documents: string[];
  notes?: string;
  approvalDate?: Date;
  approvedBy?: string;
  policyNumber?: string;
  effectiveDate?: Date;
}

// DEMO DATA

export const DEMO_SURETY_PROVIDERS: SuretyProvider[] = [
  {
    id: 'provider-001',
    name: 'Surety One Inc.',
    rating: 4.8,
    capacity: 500,
    specialties: ['performance', 'payment', 'completion'],
    premiumRange: { min: 0.5, max: 1.5 },
    responseTime: 2,
    status: 'available',
    contactEmail: 'underwriting@suretyoneinc.com',
    contactPhone: '(212) 555-0101',
    notes: 'Fast turnaround, strong in mixed-use projects',
  },
  {
    id: 'provider-002',
    name: 'National Bonding Corp',
    rating: 4.5,
    capacity: 750,
    specialties: ['performance', 'payment', 'bid', 'maintenance'],
    premiumRange: { min: 0.6, max: 1.8 },
    responseTime: 3,
    status: 'available',
    contactEmail: 'underwriting@nationalbonding.com',
    contactPhone: '(212) 555-0102',
    notes: 'Largest capacity, experienced with construction',
  },
  {
    id: 'provider-003',
    name: 'Premier Surety Group',
    rating: 4.6,
    capacity: 300,
    specialties: ['performance', 'payment', 'warranty'],
    premiumRange: { min: 0.7, max: 2.0 },
    responseTime: 1,
    status: 'available',
    contactEmail: 'quotes@premiersurety.com',
    contactPhone: '(212) 555-0103',
    notes: 'Fastest response, premium pricing',
  },
  {
    id: 'provider-004',
    name: 'Midwest Bonding Partners',
    rating: 4.2,
    capacity: 200,
    specialties: ['performance', 'payment'],
    premiumRange: { min: 0.4, max: 1.2 },
    responseTime: 4,
    status: 'available',
    contactEmail: 'underwriting@midwestbonding.com',
    contactPhone: '(212) 555-0104',
    notes: 'Competitive pricing, regional focus',
  },
];

export const DEMO_COVERAGE_REQUIREMENTS: CoverageRequirement[] = [
  {
    id: 'cov-001',
    type: 'performance',
    amount: 50000000,
    required: true,
    description: 'General contractor performance bond',
  },
  {
    id: 'cov-002',
    type: 'payment',
    amount: 50000000,
    required: true,
    description: 'Labor and material payment bond',
  },
  {
    id: 'cov-003',
    type: 'bid',
    amount: 5000000,
    required: false,
    description: 'Bid bond for competitive bidding',
  },
  {
    id: 'cov-004',
    type: 'maintenance',
    amount: 2500000,
    required: true,
    description: 'Maintenance bond (1-year warranty)',
  },
];

export const DEMO_UNDERWRITING_GAPS: UnderwritingGap[] = [
  {
    id: 'gap-001',
    dealId: 'deal-1',
    category: 'Contractor Financials',
    description: 'General Contractor audited financials (last 3 years)',
    severity: 'critical',
    requiredEvidence: ['Audited Financial Statements', 'Tax Returns', 'Bank Statements'],
    collectedEvidence: ['Tax Returns'],
    remediationSteps: [
      'Request audited financials from GC',
      'Verify with CPA',
      'Review for liquidity and profitability',
    ],
    dueDate: new Date('2026-01-15'),
    owner: 'John Smith',
  },
  {
    id: 'gap-002',
    dealId: 'deal-1',
    category: 'Project Schedule',
    description: 'Detailed construction schedule with critical path',
    severity: 'high',
    requiredEvidence: ['Primavera Schedule', 'Milestone Dates', 'Resource Plan'],
    collectedEvidence: [],
    remediationSteps: [
      'Request detailed schedule from GC',
      'Verify milestone dates',
      'Identify critical path items',
    ],
    dueDate: new Date('2026-01-10'),
    owner: 'Tom Wilson',
  },
  {
    id: 'gap-003',
    dealId: 'deal-1',
    category: 'Subcontractor List',
    description: 'List of major subcontractors with experience',
    severity: 'high',
    requiredEvidence: ['Subcontractor List', 'Bid Documents', 'Insurance Certificates'],
    collectedEvidence: ['Subcontractor List'],
    remediationSteps: [
      'Verify subcontractor experience',
      'Confirm insurance coverage',
      'Check for prior disputes',
    ],
    dueDate: new Date('2026-01-12'),
    owner: 'Tom Wilson',
  },
  {
    id: 'gap-004',
    dealId: 'deal-1',
    category: 'Equipment & Mobilization',
    description: 'Proof of equipment availability and mobilization plan',
    severity: 'medium',
    requiredEvidence: ['Equipment List', 'Mobilization Plan', 'Rental Agreements'],
    collectedEvidence: ['Equipment List'],
    remediationSteps: [
      'Verify equipment ownership or rental',
      'Confirm delivery timeline',
      'Review mobilization costs',
    ],
    dueDate: new Date('2026-01-20'),
    owner: 'Tom Wilson',
  },
  {
    id: 'gap-005',
    dealId: 'deal-1',
    category: 'Safety Plan',
    description: 'Comprehensive safety and OSHA compliance plan',
    severity: 'medium',
    requiredEvidence: ['Safety Plan', 'OSHA Records', 'Training Certificates'],
    collectedEvidence: [],
    remediationSteps: [
      'Request safety plan from GC',
      'Verify OSHA compliance history',
      'Confirm worker training',
    ],
    dueDate: new Date('2026-01-25'),
    owner: 'Mike Johnson',
  },
];

export const DEMO_PREMIUM_SCENARIOS: PremiumScenario[] = [
  {
    id: 'scenario-001',
    dealId: 'deal-1',
    name: 'Conservative (Full Coverage)',
    coverageAmount: 50000000,
    term: 3,
    riskFactors: {
      contractor_rating: 1.0,
      project_complexity: 1.2,
      market_conditions: 1.1,
      sponsor_strength: 0.9,
    },
    basePremium: 500000,
    totalPremium: 660000,
    premiumRate: 1.32,
    createdAt: new Date('2025-12-01'),
  },
  {
    id: 'scenario-002',
    dealId: 'deal-1',
    name: 'Moderate (Standard)',
    coverageAmount: 50000000,
    term: 3,
    riskFactors: {
      contractor_rating: 1.0,
      project_complexity: 1.0,
      market_conditions: 1.0,
      sponsor_strength: 1.0,
    },
    basePremium: 500000,
    totalPremium: 550000,
    premiumRate: 1.1,
    createdAt: new Date('2025-12-01'),
  },
  {
    id: 'scenario-003',
    dealId: 'deal-1',
    name: 'Aggressive (Reduced Coverage)',
    coverageAmount: 40000000,
    term: 2,
    riskFactors: {
      contractor_rating: 0.95,
      project_complexity: 0.9,
      market_conditions: 0.95,
      sponsor_strength: 1.1,
    },
    basePremium: 400000,
    totalPremium: 380000,
    premiumRate: 0.95,
    createdAt: new Date('2025-12-01'),
  },
];

export const DEMO_SURETY_SUBMISSION: SuretySubmission = {
  id: 'surety-001',
  dealId: 'deal-1',
  status: 'under_review',
  createdAt: new Date('2025-12-01'),
  submittedAt: new Date('2025-12-05'),
  coverageRequirements: DEMO_COVERAGE_REQUIREMENTS,
  gaps: DEMO_UNDERWRITING_GAPS,
  selectedProviders: ['provider-001', 'provider-002'],
  selectedScenario: DEMO_PREMIUM_SCENARIOS[1],
  documents: ['doc-001', 'doc-002', 'doc-003', 'doc-004', 'doc-005'],
  notes: 'Riverside Mixed-Use Project - Standard surety package',
};

export function getSuretySubmission(dealId: string): SuretySubmission {
  return DEMO_SURETY_SUBMISSION.dealId === dealId ? DEMO_SURETY_SUBMISSION : (null as any);
}

export function getUnderwritingGaps(dealId: string): UnderwritingGap[] {
  return DEMO_UNDERWRITING_GAPS.filter((gap) => gap.dealId === dealId);
}

export function getCriticalGaps(dealId: string): UnderwritingGap[] {
  return getUnderwritingGaps(dealId).filter((gap) => gap.severity === 'critical');
}

export function getGapCompletionRate(dealId: string): number {
  const gaps = getUnderwritingGaps(dealId);
  if (gaps.length === 0) return 100;
  const completedGaps = gaps.filter(
    (gap) => gap.collectedEvidence.length === gap.requiredEvidence.length
  ).length;
  return Math.round((completedGaps / gaps.length) * 100);
}

export function calculatePremium(
  coverageAmount: number,
  riskFactors: Record<string, number>
): number {
  const baseRate = 0.01; // 1% base
  const factorMultiplier = Object.values(riskFactors).reduce((a, b) => a * b, 1);
  return Math.round(coverageAmount * baseRate * factorMultiplier);
}
