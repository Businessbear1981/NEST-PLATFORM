/**
 * Roots Platform Demo Data
 * Informational input layer: documents, permits, evidence, project readiness
 */

export type DocumentType = 'feasibility' | 'audit' | 'insurance' | 'title' | 'appraisal' | 'construction_budget' | 'market_study' | 'credit_memo' | 'workpaper' | 'filing' | 'contract';
export type DocumentStatus = 'pending' | 'uploaded' | 'processing' | 'ocr_complete' | 'tagged' | 'approved' | 'rejected';
export type PermitStatus = 'not_started' | 'in_progress' | 'approved' | 'denied' | 'expired';
export type PermitType = 'building' | 'zoning' | 'environmental' | 'fire' | 'health' | 'accessibility' | 'parking' | 'traffic' | 'utility' | 'historic_preservation';

export interface RootsDocument {
  id: string;
  dealId: string;
  name: string;
  type: DocumentType;
  uploadedAt: Date;
  uploadedBy: string;
  fileSize: number;
  status: DocumentStatus;
  ocrProgress?: number; // 0-100
  tags: string[];
  version: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  url: string;
}

export interface Permit {
  id: string;
  dealId: string;
  type: PermitType;
  issuer: string;
  status: PermitStatus;
  deadline?: Date;
  issuedDate?: Date;
  expiryDate?: Date;
  isBlocking: boolean;
  requiredDocuments: string[];
  collectedDocuments: string[];
  notes: string;
}

export interface ReadinessCategory {
  name: string;
  weight: number; // 0-100
  completion: number; // 0-100
  items: ReadinessItem[];
}

export interface ReadinessItem {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'complete' | 'blocked';
  dueDate?: Date;
  owner?: string;
  linkedDocuments: string[];
  blockedBy?: string[];
}

export interface ProjectReadinessScorecard {
  dealId: string;
  overallScore: number; // 0-100
  categories: ReadinessCategory[];
  lastUpdated: Date;
  risks: string[];
  blockers: string[];
}

// DEMO DATA

export const DEMO_DOCUMENTS: RootsDocument[] = [
  {
    id: 'doc-001',
    dealId: 'deal-1',
    name: 'Feasibility Study - Riverside Mixed-Use',
    type: 'feasibility',
    uploadedAt: new Date('2025-12-01'),
    uploadedBy: 'John Smith',
    fileSize: 2400000,
    status: 'ocr_complete',
    ocrProgress: 100,
    tags: ['feasibility', 'pro-forma', 'market-analysis', 'riverside'],
    version: 2,
    approvalStatus: 'approved',
    url: '/manus-storage/feasibility-riverside.pdf',
  },
  {
    id: 'doc-002',
    dealId: 'deal-1',
    name: 'Phase I Environmental Assessment',
    type: 'audit',
    uploadedAt: new Date('2025-12-02'),
    uploadedBy: 'Sarah Chen',
    fileSize: 1800000,
    status: 'ocr_complete',
    ocrProgress: 100,
    tags: ['environmental', 'phase-1', 'site-assessment'],
    version: 1,
    approvalStatus: 'approved',
    url: '/manus-storage/phase1-env.pdf',
  },
  {
    id: 'doc-003',
    dealId: 'deal-1',
    name: 'General Liability Insurance Certificate',
    type: 'insurance',
    uploadedAt: new Date('2025-12-03'),
    uploadedBy: 'Mike Johnson',
    fileSize: 450000,
    status: 'tagged',
    tags: ['insurance', 'general-liability', 'certificate-of-insurance'],
    version: 1,
    approvalStatus: 'pending',
    url: '/manus-storage/insurance-cert.pdf',
  },
  {
    id: 'doc-004',
    dealId: 'deal-1',
    name: 'Title Report & Commitment',
    type: 'title',
    uploadedAt: new Date('2025-12-04'),
    uploadedBy: 'Lisa Park',
    fileSize: 920000,
    status: 'processing',
    ocrProgress: 65,
    tags: ['title', 'commitment', 'exceptions'],
    version: 1,
    approvalStatus: 'pending',
    url: '/manus-storage/title-report.pdf',
  },
  {
    id: 'doc-005',
    dealId: 'deal-1',
    name: 'Professional Appraisal Report',
    type: 'appraisal',
    uploadedAt: new Date('2025-12-05'),
    uploadedBy: 'David Lee',
    fileSize: 3100000,
    status: 'pending',
    tags: ['appraisal', 'valuation', 'market-value'],
    version: 1,
    approvalStatus: 'pending',
    url: '/manus-storage/appraisal.pdf',
  },
  {
    id: 'doc-006',
    dealId: 'deal-1',
    name: 'Construction Budget & Schedule',
    type: 'construction_budget',
    uploadedAt: new Date('2025-12-06'),
    uploadedBy: 'Tom Wilson',
    fileSize: 1200000,
    status: 'ocr_complete',
    ocrProgress: 100,
    tags: ['construction', 'budget', 'schedule', 'timeline'],
    version: 3,
    approvalStatus: 'approved',
    url: '/manus-storage/construction-budget.xlsx',
  },
];

export const DEMO_PERMITS: Permit[] = [
  {
    id: 'permit-001',
    dealId: 'deal-1',
    type: 'building',
    issuer: 'City of Riverside Building Dept',
    status: 'in_progress',
    deadline: new Date('2026-02-15'),
    issuedDate: new Date('2025-11-20'),
    isBlocking: true,
    requiredDocuments: ['Architectural Plans', 'Structural Calcs', 'MEP Drawings'],
    collectedDocuments: ['Architectural Plans', 'Structural Calcs'],
    notes: 'Awaiting MEP drawings from engineer. Expected by Jan 15.',
  },
  {
    id: 'permit-002',
    dealId: 'deal-1',
    type: 'zoning',
    issuer: 'Riverside Planning & Zoning',
    status: 'approved',
    issuedDate: new Date('2025-11-10'),
    expiryDate: new Date('2027-11-10'),
    isBlocking: false,
    requiredDocuments: ['Zoning Compliance Report', 'Site Plan'],
    collectedDocuments: ['Zoning Compliance Report', 'Site Plan'],
    notes: 'Approved with standard conditions.',
  },
  {
    id: 'permit-003',
    dealId: 'deal-1',
    type: 'environmental',
    issuer: 'County Environmental Office',
    status: 'in_progress',
    deadline: new Date('2026-01-30'),
    isBlocking: true,
    requiredDocuments: ['Phase I ESA', 'Phase II ESA', 'Remediation Plan'],
    collectedDocuments: ['Phase I ESA'],
    notes: 'Phase II ESA in progress. Remediation plan pending Phase II results.',
  },
  {
    id: 'permit-004',
    dealId: 'deal-1',
    type: 'fire',
    issuer: 'Riverside Fire Department',
    status: 'not_started',
    deadline: new Date('2026-02-28'),
    isBlocking: true,
    requiredDocuments: ['Fire Safety Plan', 'Sprinkler Design', 'Exit Analysis'],
    collectedDocuments: [],
    notes: 'Will be submitted after building permit approval.',
  },
  {
    id: 'permit-005',
    dealId: 'deal-1',
    type: 'parking',
    issuer: 'Riverside Planning & Zoning',
    status: 'approved',
    issuedDate: new Date('2025-11-15'),
    expiryDate: new Date('2027-11-15'),
    isBlocking: false,
    requiredDocuments: ['Parking Study', 'Parking Plan'],
    collectedDocuments: ['Parking Study', 'Parking Plan'],
    notes: 'Approved. 250 spaces required, 275 provided.',
  },
];

export const DEMO_READINESS_SCORECARD: ProjectReadinessScorecard = {
  dealId: 'deal-1',
  overallScore: 68,
  categories: [
    {
      name: 'Permits & Approvals',
      weight: 25,
      completion: 60,
      items: [
        {
          id: 'item-001',
          name: 'Building Permit',
          status: 'in_progress',
          dueDate: new Date('2026-02-15'),
          owner: 'Tom Wilson',
          linkedDocuments: ['doc-001'],
          blockedBy: undefined,
        },
        {
          id: 'item-002',
          name: 'Environmental Clearance',
          status: 'in_progress',
          dueDate: new Date('2026-01-30'),
          owner: 'Sarah Chen',
          linkedDocuments: ['doc-002'],
          blockedBy: undefined,
        },
        {
          id: 'item-003',
          name: 'Fire Safety Approval',
          status: 'not_started',
          dueDate: new Date('2026-02-28'),
          owner: 'Mike Johnson',
          linkedDocuments: [],
          blockedBy: ['item-001'],
        },
      ],
    },
    {
      name: 'Documentation & Evidence',
      weight: 25,
      completion: 75,
      items: [
        {
          id: 'item-004',
          name: 'Title Report',
          status: 'in_progress',
          owner: 'Lisa Park',
          linkedDocuments: ['doc-004'],
          blockedBy: undefined,
        },
        {
          id: 'item-005',
          name: 'Appraisal Report',
          status: 'in_progress',
          owner: 'David Lee',
          linkedDocuments: ['doc-005'],
          blockedBy: undefined,
        },
        {
          id: 'item-006',
          name: 'Insurance Certificates',
          status: 'in_progress',
          owner: 'Mike Johnson',
          linkedDocuments: ['doc-003'],
          blockedBy: undefined,
        },
      ],
    },
    {
      name: 'Financial & Construction',
      weight: 25,
      completion: 70,
      items: [
        {
          id: 'item-007',
          name: 'Construction Budget',
          status: 'complete',
          owner: 'Tom Wilson',
          linkedDocuments: ['doc-006'],
          blockedBy: undefined,
        },
        {
          id: 'item-008',
          name: 'Contractor Financials',
          status: 'in_progress',
          owner: 'Tom Wilson',
          linkedDocuments: [],
          blockedBy: undefined,
        },
        {
          id: 'item-009',
          name: 'Performance Bonds',
          status: 'not_started',
          owner: 'Mike Johnson',
          linkedDocuments: [],
          blockedBy: ['item-007'],
        },
      ],
    },
    {
      name: 'Underwriting & Credit',
      weight: 25,
      completion: 65,
      items: [
        {
          id: 'item-010',
          name: 'Credit Memo Draft',
          status: 'in_progress',
          owner: 'John Smith',
          linkedDocuments: ['doc-001'],
          blockedBy: undefined,
        },
        {
          id: 'item-011',
          name: 'Sponsor Financials',
          status: 'in_progress',
          owner: 'John Smith',
          linkedDocuments: [],
          blockedBy: undefined,
        },
        {
          id: 'item-012',
          name: 'Rating Agency Submission',
          status: 'not_started',
          owner: 'John Smith',
          linkedDocuments: [],
          blockedBy: ['item-010', 'item-011'],
        },
      ],
    },
  ],
  lastUpdated: new Date('2025-12-06T14:30:00Z'),
  risks: [
    'Environmental Phase II pending; could delay fire permit',
    'MEP drawings delayed by engineer; may impact building permit timeline',
    'Appraisal not yet received; needed for credit memo',
  ],
  blockers: [
    'Fire Safety Approval blocked by Building Permit',
    'Performance Bonds blocked by Construction Budget approval',
    'Rating Agency Submission blocked by Credit Memo and Sponsor Financials',
  ],
};

export function getDocumentsByDeal(dealId: string): RootsDocument[] {
  return DEMO_DOCUMENTS.filter((doc) => doc.dealId === dealId);
}

export function getPermitsByDeal(dealId: string): Permit[] {
  return DEMO_PERMITS.filter((permit) => permit.dealId === dealId);
}

export function getReadinessScorecard(dealId: string): ProjectReadinessScorecard {
  return DEMO_READINESS_SCORECARD.dealId === dealId ? DEMO_READINESS_SCORECARD : null as any;
}

export function calculateReadinessScore(scorecard: ProjectReadinessScorecard): number {
  const weightedSum = scorecard.categories.reduce((sum, cat) => {
    return sum + (cat.completion * cat.weight) / 100;
  }, 0);
  return Math.round(weightedSum);
}
