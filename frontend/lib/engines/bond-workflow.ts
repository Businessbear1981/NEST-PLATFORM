/**
 * NEST Bond Workflow — Frontend State Machine
 * 10-phase Bible pipeline: ingestion → spreads → ratios → memo →
 * structure → surety → grading → bond_desk → monitoring → placement
 *
 * Pure TypeScript — no React, no side effects.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PhaseId =
  | 'ingestion'
  | 'spreads'
  | 'ratios'
  | 'memo'
  | 'structure'
  | 'surety'
  | 'grading'
  | 'bond_desk'
  | 'monitoring'
  | 'placement';

export type Pillar = 'roots' | 'bond_desk' | 'hawkeye';

export interface Phase {
  id: PhaseId;
  phase_num: number;
  label: string;
  pillar: Pillar;
  agent: string;
  output: string;
  gate_fields: string[];
  description: string;
}

export interface PhaseStatus {
  id: PhaseId;
  status: 'complete' | 'active' | 'pending' | 'blocked';
  gatesMet: string[];
  gatesMissing: string[];
  completionPct: number;
  blockedReason?: string;
}

export interface WorkflowState {
  dealId: string;
  currentPhase: PhaseId;
  phases: PhaseStatus[];
  overallProgress: number;   // 0–100
  canAdvance: boolean;
  nextPhase: PhaseId | null;
  estimatedDaysRemaining: number;
}

// ─── Pipeline Definition ──────────────────────────────────────────────────────

export const PIPELINE_PHASES: Phase[] = [
  {
    id: 'ingestion',
    phase_num: 1,
    label: 'Document Ingestion',
    pillar: 'roots',
    agent: 'Roots',
    output: 'Parsed financial statements, raw NOI',
    gate_fields: ['uploaded_docs', 'parsed_financials', 'noi_raw'],
    description:
      'Upload sponsor financials; Roots parser extracts rent rolls, T12s, and operating statements.',
  },
  {
    id: 'spreads',
    phase_num: 2,
    label: 'Financial Spreads',
    pillar: 'roots',
    agent: 'Maxwell',
    output: 'Normalized NOI, EBITDA spread, RMA benchmark comparison',
    gate_fields: ['noi_normalized', 'ebitda_spread', 'rma_benchmark'],
    description:
      'Maxwell normalizes income streams against RMA industry benchmarks and produces EBITDA spread.',
  },
  {
    id: 'ratios',
    phase_num: 3,
    label: 'Credit Ratios',
    pillar: 'roots',
    agent: 'Maxwell',
    output: 'DSCR, LTV, ICR, obligor grade',
    gate_fields: ['dscr', 'ltv', 'icr', 'obligor_grade'],
    description:
      'JP Morgan benchmark ratios calculated; obligor grade assigned per NEST credit matrix.',
  },
  {
    id: 'memo',
    phase_num: 4,
    label: 'Credit Memo',
    pillar: 'roots',
    agent: 'Morgan',
    output: 'Credit memo draft, risk factors, recommendation',
    gate_fields: ['credit_memo_draft', 'risk_factors', 'recommendation'],
    description:
      'Morgan drafts Jimmy-Lee-tone credit memo referencing Jacaranda Trace PLOM structure.',
  },
  {
    id: 'structure',
    phase_num: 5,
    label: 'Capital Structure',
    pillar: 'bond_desk',
    agent: 'Atlas',
    output: 'Series A/B capital stack, coupon, sources & uses',
    gate_fields: ['capital_structure', 'series_a_coupon', 'sources_uses'],
    description:
      'Atlas builds layered capital structure: 75% LTC Series A at 6.5–7.5%, Series B at 82% CLTV.',
  },
  {
    id: 'surety',
    phase_num: 6,
    label: 'Surety / LC',
    pillar: 'bond_desk',
    agent: 'Prometheus',
    output: 'Surety tier, LC amount, Hylant submission package',
    gate_fields: ['surety_tier', 'lc_amount', 'hylant_submission'],
    description:
      'Prometheus determines Hylant surety tier based on AUM threshold; triggers LC or self-collateral path.',
  },
  {
    id: 'grading',
    phase_num: 7,
    label: 'Indicative Rating',
    pillar: 'bond_desk',
    agent: 'Sentinel',
    output: 'Indicative rating, Moody\'s / S&P shadow estimates',
    gate_fields: ['indicative_rating', 'moodys_estimate', 'sp_estimate'],
    description:
      'Sentinel produces shadow ratings against Moody\'s and S&P public methodologies.',
  },
  {
    id: 'bond_desk',
    phase_num: 8,
    label: 'Bond Desk / GENIE',
    pillar: 'bond_desk',
    agent: 'Vector + Apex',
    output: 'Stress scenarios, call/put signal, refi trigger',
    gate_fields: ['stress_scenarios', 'call_put_signal', 'refi_trigger'],
    description:
      'Vector runs 14-signal call/put timing; Apex overlays short hedge; GENIE assembles CMBS stacking.',
  },
  {
    id: 'monitoring',
    phase_num: 9,
    label: 'Covenant Monitoring',
    pillar: 'hawkeye',
    agent: 'Bridge + Vector',
    output: 'Covenant compliance, vector signal, Apex position',
    gate_fields: ['covenant_compliance', 'vector_signal', 'apex_position'],
    description:
      'Bridge watches 18-month pre-stabilization window; Vector signals daily; Apex positions hedges.',
  },
  {
    id: 'placement',
    phase_num: 10,
    label: 'Investor Placement',
    pillar: 'hawkeye',
    agent: 'Sterling',
    output: 'Order book coverage, teasers sent, allocation complete',
    gate_fields: ['order_book_covered', 'teasers_sent', 'allocation_complete'],
    description:
      'Sterling drives CRM book-build, distributes teasers, and confirms full allocation.',
  },
];

// ─── Phase ordering helpers ───────────────────────────────────────────────────

const PHASE_ORDER: PhaseId[] = PIPELINE_PHASES.map((p) => p.id);

function phaseIndex(id: PhaseId): number {
  return PHASE_ORDER.indexOf(id);
}

function nextPhaseId(id: PhaseId): PhaseId | null {
  const idx = phaseIndex(id);
  return idx >= 0 && idx < PHASE_ORDER.length - 1
    ? PHASE_ORDER[idx + 1]
    : null;
}

// ─── Gate-field type validation ───────────────────────────────────────────────

/**
 * Validates known gate fields with domain-specific rules.
 * Unknown fields are accepted as long as they are truthy (present).
 */
export function validateGateField(
  field: string,
  value: unknown,
): { valid: boolean; error?: string } {
  if (value === undefined || value === null || value === '') {
    return { valid: false, error: `${field} is missing or empty` };
  }

  switch (field) {
    // ── numeric > 0 fields ─────────────────────────────────────────────────
    case 'noi_raw':
    case 'noi_normalized':
    case 'ebitda_spread':
    case 'lc_amount':
    case 'series_a_coupon': {
      const n = Number(value);
      if (isNaN(n) || n <= 0)
        return { valid: false, error: `${field} must be a number > 0` };
      return { valid: true };
    }

    // ── DSCR: must be > 1.0 (sub-IG below 1.5 is a separate warning) ──────
    case 'dscr': {
      const n = Number(value);
      if (isNaN(n) || n <= 1.0)
        return {
          valid: false,
          error: 'dscr must be > 1.0 (sub-investment grade below 1.5)',
        };
      return { valid: true };
    }

    // ── LTV: 0–100 % ───────────────────────────────────────────────────────
    case 'ltv': {
      const n = Number(value);
      if (isNaN(n) || n <= 0 || n >= 100)
        return { valid: false, error: 'ltv must be between 0 and 100 (exclusive)' };
      return { valid: true };
    }

    // ── ICR: must be > 1.0 ─────────────────────────────────────────────────
    case 'icr': {
      const n = Number(value);
      if (isNaN(n) || n <= 1.0)
        return { valid: false, error: 'icr must be > 1.0' };
      return { valid: true };
    }

    // ── rma_benchmark: number (can be negative delta) ──────────────────────
    case 'rma_benchmark': {
      if (isNaN(Number(value)))
        return { valid: false, error: 'rma_benchmark must be a number' };
      return { valid: true };
    }

    // ── obligor_grade: one of A / BBB+ / BBB- / Sub-IG ────────────────────
    case 'obligor_grade': {
      const allowed = ['A', 'BBB+', 'BBB-', 'Sub-IG'];
      if (!allowed.includes(String(value)))
        return {
          valid: false,
          error: `obligor_grade must be one of ${allowed.join(', ')}`,
        };
      return { valid: true };
    }

    // ── indicative_rating: non-empty string ────────────────────────────────
    case 'indicative_rating':
    case 'moodys_estimate':
    case 'sp_estimate': {
      if (typeof value !== 'string' || value.trim() === '')
        return { valid: false, error: `${field} must be a non-empty string` };
      return { valid: true };
    }

    // ── boolean flags ──────────────────────────────────────────────────────
    case 'order_book_covered':
    case 'allocation_complete': {
      if (value !== true && value !== 'true' && value !== 1)
        return { valid: false, error: `${field} must be true` };
      return { valid: true };
    }

    // ── all other fields: truthy-presence check only ───────────────────────
    default:
      return { valid: true };
  }
}

// ─── Phase evaluation ─────────────────────────────────────────────────────────

/**
 * Checks each gate_field in dealData; returns what is met vs. missing.
 */
export function evaluatePhaseStatus(
  phase: Phase,
  dealData: Record<string, unknown>,
): PhaseStatus {
  const gatesMet: string[] = [];
  const gatesMissing: string[] = [];

  for (const field of phase.gate_fields) {
    const { valid } = validateGateField(field, dealData[field]);
    if (valid) {
      gatesMet.push(field);
    } else {
      gatesMissing.push(field);
    }
  }

  const completionPct =
    phase.gate_fields.length > 0
      ? Math.round((gatesMet.length / phase.gate_fields.length) * 100)
      : 100;

  // status is determined later by buildWorkflowState based on position;
  // default to pending here
  const status: PhaseStatus['status'] =
    gatesMissing.length === 0 ? 'complete' : 'pending';

  return {
    id: phase.id,
    status,
    gatesMet,
    gatesMissing,
    completionPct,
  };
}

// ─── Full workflow state builder ──────────────────────────────────────────────

/**
 * Builds the complete WorkflowState for a deal.
 *
 * Rules:
 *  - Phases before currentPhase with all gates met → 'complete'
 *  - Phases before currentPhase with missing gates → 'blocked'
 *  - currentPhase → 'active'
 *  - Phases after currentPhase → 'pending'
 */
export function buildWorkflowState(
  dealId: string,
  currentPhase: PhaseId,
  dealData: Record<string, unknown>,
): WorkflowState {
  const currentIdx = phaseIndex(currentPhase);

  const phases: PhaseStatus[] = PIPELINE_PHASES.map((phase, idx) => {
    const evaluated = evaluatePhaseStatus(phase, dealData);

    let status: PhaseStatus['status'];
    let blockedReason: string | undefined;

    if (idx < currentIdx) {
      if (evaluated.gatesMissing.length === 0) {
        status = 'complete';
      } else {
        status = 'blocked';
        blockedReason = `Missing: ${evaluated.gatesMissing.join(', ')}`;
      }
    } else if (idx === currentIdx) {
      status = 'active';
    } else {
      status = 'pending';
    }

    return { ...evaluated, status, blockedReason };
  });

  const completeCount = phases.filter((p) => p.status === 'complete').length;
  const overallProgress = Math.round(
    (completeCount / PIPELINE_PHASES.length) * 100,
  );

  const currentStatus = phases[currentIdx];
  const allGatesMet =
    currentStatus.gatesMissing.length === 0;

  const next = nextPhaseId(currentPhase);

  const state: WorkflowState = {
    dealId,
    currentPhase,
    phases,
    overallProgress,
    canAdvance: allGatesMet && next !== null,
    nextPhase: next,
    estimatedDaysRemaining: 0, // filled below
  };

  state.estimatedDaysRemaining = estimateTotalDaysRemaining(state);

  return state;
}

// ─── Advance check ────────────────────────────────────────────────────────────

/**
 * Returns true only when every gate_field for the current phase is present
 * and valid, and there is a next phase to advance to.
 */
export function canAdvancePhase(state: WorkflowState): boolean {
  return state.canAdvance;
}

// ─── Time estimates ───────────────────────────────────────────────────────────

const PHASE_DAYS: Record<PhaseId, number> = {
  ingestion:  2,
  spreads:    3,
  ratios:     1,
  memo:       3,
  structure:  5,
  surety:     10,
  grading:    7,
  bond_desk:  5,
  monitoring: 30,
  placement:  21,
};

/** Estimated business days to complete a single phase. */
export function getPhaseEstimate(phaseId: PhaseId): number {
  return PHASE_DAYS[phaseId];
}

/**
 * Sums getPhaseEstimate() for every phase that is NOT 'complete'.
 * The active phase is included at its full estimate (conservative).
 */
export function estimateTotalDaysRemaining(state: WorkflowState): number {
  return state.phases.reduce((acc, ps) => {
    if (ps.status === 'complete') return acc;
    return acc + getPhaseEstimate(ps.id);
  }, 0);
}
