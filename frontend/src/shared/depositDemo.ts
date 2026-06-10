/**
 * Client Deposit & Invoicing Platform Demo Data
 */

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'wire' | 'ach' | 'check' | 'credit_card';
export type DepositStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface Invoice {
  id: string;
  dealId: string;
  invoiceNumber: string;
  amount: number;
  description: string;
  status: InvoiceStatus;
  issuedDate: Date;
  dueDate: Date;
  sentDate?: Date;
  viewedDate?: Date;
  lineItems: InvoiceLineItem[];
  notes?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Deposit {
  id: string;
  dealId: string;
  invoiceId: string;
  amount: number;
  status: DepositStatus;
  paymentMethod: PaymentMethod;
  scheduledDate: Date;
  receivedDate?: Date;
  confirmationNumber?: string;
  notes?: string;
}

export interface ClientSubmission {
  id: string;
  dealId: string;
  type: 'initial' | 'update' | 'evidence' | 'approval';
  status: 'pending' | 'received' | 'approved' | 'rejected';
  submittedDate: Date;
  submittedBy: string;
  documents: string[];
  notes?: string;
  approvalDate?: Date;
  approvedBy?: string;
}

// DEMO DATA

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    dealId: 'deal-1',
    invoiceNumber: 'INV-2025-001',
    amount: 50000,
    description: 'Initial Feasibility & Structuring',
    status: 'paid',
    issuedDate: new Date('2025-11-01'),
    dueDate: new Date('2025-11-15'),
    sentDate: new Date('2025-11-01'),
    viewedDate: new Date('2025-11-02'),
    lineItems: [
      {
        id: 'li-001',
        description: 'Feasibility Study',
        quantity: 1,
        unitPrice: 25000,
        amount: 25000,
      },
      {
        id: 'li-002',
        description: 'Structuring & Capital Stack Design',
        quantity: 1,
        unitPrice: 25000,
        amount: 25000,
      },
    ],
    notes: 'Initial engagement for Riverside Mixed-Use project',
  },
  {
    id: 'inv-002',
    dealId: 'deal-1',
    invoiceNumber: 'INV-2025-002',
    amount: 35000,
    description: 'Rating & Credit Memo Preparation',
    status: 'partial',
    issuedDate: new Date('2025-12-01'),
    dueDate: new Date('2025-12-15'),
    sentDate: new Date('2025-12-01'),
    viewedDate: new Date('2025-12-02'),
    lineItems: [
      {
        id: 'li-003',
        description: 'Credit Memo Preparation',
        quantity: 1,
        unitPrice: 20000,
        amount: 20000,
      },
      {
        id: 'li-004',
        description: 'Rating Agency Coordination',
        quantity: 1,
        unitPrice: 15000,
        amount: 15000,
      },
    ],
    notes: 'Rating support for Moody\'s and S&P submission',
  },
  {
    id: 'inv-003',
    dealId: 'deal-1',
    invoiceNumber: 'INV-2025-003',
    amount: 45000,
    description: 'Surety & Insurance Coordination',
    status: 'sent',
    issuedDate: new Date('2025-12-10'),
    dueDate: new Date('2025-12-24'),
    sentDate: new Date('2025-12-10'),
    lineItems: [
      {
        id: 'li-005',
        description: 'Surety Submission & Provider Coordination',
        quantity: 1,
        unitPrice: 25000,
        amount: 25000,
      },
      {
        id: 'li-006',
        description: 'Insurance Package Assembly',
        quantity: 1,
        unitPrice: 20000,
        amount: 20000,
      },
    ],
    notes: 'Surety wrap and insurance coordination',
  },
  {
    id: 'inv-004',
    dealId: 'deal-1',
    invoiceNumber: 'INV-2025-004',
    amount: 30000,
    description: 'Ongoing Monitoring & Surveillance',
    status: 'draft',
    issuedDate: new Date('2025-12-15'),
    dueDate: new Date('2025-12-31'),
    lineItems: [
      {
        id: 'li-007',
        description: 'Monthly Covenant Monitoring',
        quantity: 1,
        unitPrice: 15000,
        amount: 15000,
      },
      {
        id: 'li-008',
        description: 'Quarterly Reporting & Analysis',
        quantity: 1,
        unitPrice: 15000,
        amount: 15000,
      },
    ],
    notes: 'Recurring monthly monitoring fees',
  },
];

export const DEMO_DEPOSITS: Deposit[] = [
  {
    id: 'dep-001',
    dealId: 'deal-1',
    invoiceId: 'inv-001',
    amount: 50000,
    status: 'confirmed',
    paymentMethod: 'wire',
    scheduledDate: new Date('2025-11-10'),
    receivedDate: new Date('2025-11-10'),
    confirmationNumber: 'WIRE-2025-11-10-001',
    notes: 'Wire transfer received from sponsor',
  },
  {
    id: 'dep-002',
    dealId: 'deal-1',
    invoiceId: 'inv-002',
    amount: 20000,
    status: 'confirmed',
    paymentMethod: 'ach',
    scheduledDate: new Date('2025-12-05'),
    receivedDate: new Date('2025-12-05'),
    confirmationNumber: 'ACH-2025-12-05-001',
    notes: 'ACH deposit - partial payment',
  },
  {
    id: 'dep-003',
    dealId: 'deal-1',
    invoiceId: 'inv-002',
    amount: 15000,
    status: 'pending',
    paymentMethod: 'check',
    scheduledDate: new Date('2025-12-20'),
    notes: 'Check expected by Dec 20',
  },
  {
    id: 'dep-004',
    dealId: 'deal-1',
    invoiceId: 'inv-003',
    amount: 45000,
    status: 'pending',
    paymentMethod: 'wire',
    scheduledDate: new Date('2025-12-22'),
    notes: 'Wire transfer scheduled for Dec 22',
  },
];

export const DEMO_SUBMISSIONS: ClientSubmission[] = [
  {
    id: 'sub-001',
    dealId: 'deal-1',
    type: 'initial',
    status: 'approved',
    submittedDate: new Date('2025-11-05'),
    submittedBy: 'John Smith (Sponsor)',
    documents: ['doc-001', 'doc-002', 'doc-003'],
    notes: 'Initial project submission with feasibility and environmental docs',
    approvalDate: new Date('2025-11-08'),
    approvedBy: 'Sarah Chen (Underwriter)',
  },
  {
    id: 'sub-002',
    dealId: 'deal-1',
    type: 'evidence',
    status: 'approved',
    submittedDate: new Date('2025-11-20'),
    submittedBy: 'John Smith (Sponsor)',
    documents: ['doc-004', 'doc-005', 'doc-006'],
    notes: 'Title report, appraisal, and construction budget',
    approvalDate: new Date('2025-11-22'),
    approvedBy: 'Sarah Chen (Underwriter)',
  },
  {
    id: 'sub-003',
    dealId: 'deal-1',
    type: 'update',
    status: 'received',
    submittedDate: new Date('2025-12-05'),
    submittedBy: 'John Smith (Sponsor)',
    documents: ['doc-007', 'doc-008'],
    notes: 'Updated construction schedule and contractor financials',
  },
  {
    id: 'sub-004',
    dealId: 'deal-1',
    type: 'approval',
    status: 'pending',
    submittedDate: new Date('2025-12-10'),
    submittedBy: 'John Smith (Sponsor)',
    documents: ['doc-009'],
    notes: 'Sponsor approval for bond structure and terms',
  },
];

export function getInvoicesByDeal(dealId: string): Invoice[] {
  return DEMO_INVOICES.filter((inv) => inv.dealId === dealId);
}

export function getDepositsByDeal(dealId: string): Deposit[] {
  return DEMO_DEPOSITS.filter((dep) => dep.dealId === dealId);
}

export function getSubmissionsByDeal(dealId: string): ClientSubmission[] {
  return DEMO_SUBMISSIONS.filter((sub) => sub.dealId === dealId);
}

export function getTotalInvoiced(dealId: string): number {
  return getInvoicesByDeal(dealId).reduce((sum, inv) => sum + inv.amount, 0);
}

export function getTotalDeposited(dealId: string): number {
  return getDepositsByDeal(dealId)
    .filter((dep) => dep.status === 'confirmed')
    .reduce((sum, dep) => sum + dep.amount, 0);
}

export function getOutstandingBalance(dealId: string): number {
  return getTotalInvoiced(dealId) - getTotalDeposited(dealId);
}
