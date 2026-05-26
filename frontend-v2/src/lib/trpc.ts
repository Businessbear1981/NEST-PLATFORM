/**
 * NEST Query Hooks — wraps React Query + Flask REST API client.
 *
 * Provides a `trpc`-shaped object so existing components can swap imports
 * with minimal diff.  Every hook calls the real Flask backend via api.ts.
 *
 * Pattern:
 *   trpc.deals.list.useQuery(input?, opts?)   → useQuery calling api.deals.list()
 *   trpc.deals.create.useMutation(opts?)      → useMutation calling api.deals.create()
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { api } from "./api";

// ── Helpers ──────────────────────────────────────────────────────

function q<TData>(
  key: unknown[],
  fn: () => Promise<TData>,
) {
  return {
    useQuery: (input?: unknown, opts?: Partial<UseQueryOptions<TData>>) => {
      void input; // consumed by key if needed
      return useQuery<TData>({ queryKey: key, queryFn: fn, ...opts });
    },
  };
}

function m<TInput, TData>(
  fn: (input: TInput) => Promise<TData>,
) {
  return {
    useMutation: (opts?: Partial<UseMutationOptions<TData, Error, TInput>>) =>
      useMutation<TData, Error, TInput>({
        mutationFn: fn,
        ...opts,
      }),
  };
}

// ── Auth ─────────────────────────────────────────────────────────

const auth = {
  me: {
    useQuery: (_input?: unknown, opts?: Partial<UseQueryOptions>) =>
      useQuery({
        queryKey: ["auth", "me"],
        queryFn: () => api.auth.me(),
        ...opts,
      }),
  },
  logout: {
    useMutation: (opts?: Partial<UseMutationOptions>) =>
      useMutation({
        mutationFn: () =>
          fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          }).then((r) => r.json()),
        ...opts,
      }),
  },
};

// ── Deals ────────────────────────────────────────────────────────

const deals = {
  list: q(["deals", "list"], () => api.deals.list()),
  get: {
    useQuery: (
      input?: { dealId: number },
      opts?: Partial<UseQueryOptions>,
    ) =>
      useQuery({
        queryKey: ["deals", "get", input?.dealId],
        queryFn: () => api.deals.get(String(input?.dealId ?? 0)),
        enabled: (input?.dealId ?? 0) > 0,
        ...opts,
      }),
  },
  create: m((input: Record<string, unknown>) => api.deals.create(input)),
};

// ── Approvals (in-memory until backend route exists) ─────────────

let _approvals: Array<{
  id: number;
  type: string;
  itemId: number;
  status: string;
  notes: string;
  createdAt: string;
}> = [];
let _approvalSeq = 1;

/** Register a new approval from any mutation */
export function _createApproval(type: string, itemId: number, notes?: string) {
  _approvals.push({
    id: _approvalSeq++,
    type,
    itemId,
    status: "pending",
    notes: notes ?? "",
    createdAt: new Date().toISOString(),
  });
}

const approvals = {
  listPending: q(["approvals", "pending"], async () =>
    _approvals.filter((a) => a.status === "pending"),
  ),
  approve: m(async (input: { approvalId: number; notes?: string }) => {
    const a = _approvals.find((x) => x.id === input.approvalId);
    if (a) {
      a.status = "approved";
      a.notes = input.notes ?? a.notes;
    }
    return a;
  }),
  reject: m(async (input: { approvalId: number; notes?: string }) => {
    const a = _approvals.find((x) => x.id === input.approvalId);
    if (a) {
      a.status = "rejected";
      a.notes = input.notes ?? a.notes;
    }
    return a;
  }),
};

// ── Bonds (per-deal, via deals route) ────────────────────────────

const bonds = {
  listByDeal: {
    useQuery: (input?: { dealId: number }, opts?: Partial<UseQueryOptions>) =>
      useQuery({
        queryKey: ["bonds", "listByDeal", input?.dealId],
        queryFn: () =>
          api.deals
            .get(String(input?.dealId ?? 0))
            .then((deal: any) => deal?.bonds ?? deal?.bond_structure?.series ?? []),
        enabled: (input?.dealId ?? 0) > 0,
        ...opts,
      }),
  },
  create: m(async (input: { dealId: number } & Record<string, unknown>) => {
    const { dealId, ...rest } = input;
    return fetch(
      `${import.meta.env.VITE_API_URL || ""}/api/deals/${dealId}/bond`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(rest),
      },
    )
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.error || "Bond create failed");
        return j.data;
      });
  }),
};

// ── M&A Targets ──────────────────────────────────────────────────

let _targets: Array<Record<string, any>> = [];
let _targetSeq = 1;

const mTargets = {
  list: q(["mTargets", "list"], async () => {
    try {
      const result = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/ma/targets`,
        { credentials: "include" },
      ).then((r) => r.json());
      if (result.success && Array.isArray(result.data)) return result.data;
    } catch { /* fall through to local */ }
    return _targets;
  }),
  create: m(async (input: Record<string, unknown>) => {
    const t = {
      id: _targetSeq++,
      ...input,
      status: "review",
      recommendation: null,
      financialHealthScore: null,
      scalabilityScore: null,
      ipoReadinessScore: null,
      growthStrategyScore: null,
      overallScore: null,
      createdAt: new Date().toISOString(),
    };
    _targets.push(t);
    return t;
  }),
  updateScores: m(
    async (input: { targetId: number } & Record<string, unknown>) => {
      const t = _targets.find((x) => x.id === input.targetId);
      if (t) {
        Object.assign(t, input);
        const scores = [
          input.financialHealthScore,
          input.scalabilityScore,
          input.ipoReadinessScore,
          input.growthStrategyScore,
        ].filter((s) => typeof s === "number") as number[];
        t.overallScore = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;
        t.recommendation =
          (t.overallScore ?? 0) >= 75
            ? "buy"
            : (t.overallScore ?? 0) >= 55
              ? "hold"
              : "pass";
      }
      return t;
    },
  ),
};

// ── Tenants (in-memory until backend route) ──────────────────────

let _tenants: Array<Record<string, any>> = [];
let _tenantSeq = 1;

const tenants = {
  listByDeal: {
    useQuery: (input?: { dealId: number }, opts?: Partial<UseQueryOptions>) =>
      useQuery({
        queryKey: ["tenants", "listByDeal", input?.dealId],
        queryFn: async () =>
          _tenants.filter((t) => t.dealId === input?.dealId),
        enabled: (input?.dealId ?? 0) > 0,
        ...opts,
      }),
  },
  create: m(async (input: { dealId: number } & Record<string, unknown>) => {
    const t = {
      id: _tenantSeq++,
      ...input,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    _tenants.push(t);
    _createApproval("tenant", t.id, `New tenant: ${input.name}`);
    return t;
  }),
  update: m(async (input: { tenantId: number } & Record<string, unknown>) => {
    const t = _tenants.find((x) => x.id === input.tenantId);
    if (t) Object.assign(t, input);
    return t;
  }),
};

// ── Draws (in-memory until backend route) ────────────────────────

let _draws: Array<Record<string, any>> = [];
let _drawSeq = 1;

const draws = {
  listByDeal: {
    useQuery: (input?: { dealId: number }, opts?: Partial<UseQueryOptions>) =>
      useQuery({
        queryKey: ["draws", "listByDeal", input?.dealId],
        queryFn: async () =>
          _draws.filter((d) => d.dealId === input?.dealId),
        enabled: (input?.dealId ?? 0) > 0,
        ...opts,
      }),
  },
  create: m(async (input: { dealId: number } & Record<string, unknown>) => {
    const d = {
      id: _drawSeq++,
      ...input,
      status: "requested",
      createdAt: new Date().toISOString(),
    };
    _draws.push(d);
    _createApproval("draw", d.id, `Draw #${input.drawNumber}: $${input.amount}`);
    return d;
  }),
  approve: m(async (input: { drawId: number; approvalNotes?: string }) => {
    const d = _draws.find((x) => x.id === input.drawId);
    if (d) {
      d.status = "approved";
      d.approvalNotes = input.approvalNotes;
    }
    return d;
  }),
};

// ── Covenants (in-memory until backend route) ────────────────────

let _covenants: Array<Record<string, any>> = [];
let _covenantSeq = 1;

const covenants = {
  listByDeal: {
    useQuery: (input?: { dealId: number }, opts?: Partial<UseQueryOptions>) =>
      useQuery({
        queryKey: ["covenants", "listByDeal", input?.dealId],
        queryFn: async () =>
          _covenants.filter((c) => c.dealId === input?.dealId),
        enabled: (input?.dealId ?? 0) > 0,
        ...opts,
      }),
  },
  create: m(
    async (input: { dealId: number } & Record<string, unknown>) => {
      const threshold = Number(input.threshold);
      const current = Number(input.current || 0);
      const status =
        current === 0
          ? "watch"
          : current >= threshold
            ? "compliant"
            : "breach";
      const c = {
        id: _covenantSeq++,
        ...input,
        status,
        lastChecked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      _covenants.push(c);
      return c;
    },
  ),
  update: m(async (input: { covenantId: number; current?: string }) => {
    const c = _covenants.find((x) => x.id === input.covenantId);
    if (c && input.current !== undefined) {
      c.current = input.current;
      const threshold = Number(c.threshold);
      const current = Number(input.current);
      c.status = current >= threshold ? "compliant" : "breach";
      c.lastChecked = new Date().toISOString();
    }
    return c;
  }),
};

// ── Power Strip ─────────────────────────────────────────────────

const powerstrip = {
  status: q(["powerstrip", "status"], () => api.powerstrip.status()),
  plugins: q(["powerstrip", "plugins"], () => api.powerstrip.plugins()),
  marketRates: q(["powerstrip", "marketRates"], () => api.powerstrip.marketRates()),
  bondPricing: m((input: Record<string, unknown>) => api.powerstrip.bondPricing(input)),
  refiSignals: m((input: Record<string, unknown>) => api.powerstrip.refiSignals(input)),
  route: m((input: { taskType: string; prompt: string; options?: Record<string, unknown> }) =>
    api.powerstrip.route(input.taskType, input.prompt, input.options)),
};

// ── Bond Workflow ───────────────────────────────────────────────

const bondWorkflow = {
  getByDeal: {
    useQuery: (input?: { dealId: string }, opts?: Partial<UseQueryOptions>) =>
      useQuery({
        queryKey: ["bondWorkflow", "getByDeal", input?.dealId],
        queryFn: () => api.bondWorkflow.getByDeal(input?.dealId ?? ""),
        enabled: !!input?.dealId,
        ...opts,
      }),
  },
  runFullAIEvaluation: m((input: { dealId: string }) =>
    api.bondWorkflow.runFullAIEvaluation(input.dealId)),
  updateChecklist: m((input: { dealId: string; item: Record<string, unknown> }) =>
    api.bondWorkflow.updateChecklist(input.dealId, input.item)),
  updatePhase: m((input: { dealId: string; phase: string }) =>
    api.bondWorkflow.updatePhase(input.dealId, input.phase)),
};

// ── EagleEye ────────────────────────────────────────────────────

const eagleeye = {
  signals: q(["eagleeye", "signals"], () => api.eagleeye.signals()),
  stats: q(["eagleeye", "stats"], () => api.eagleeye.stats()),
  scoutHistory: q(["eagleeye", "scoutHistory"], () => api.eagleeye.scoutHistory()),
  scout: m((input: Record<string, unknown>) => api.eagleeye.scout(input)),
  convert: m((input: { signalId: string }) => api.eagleeye.convert(input.signalId)),
  updateStatus: m((input: { signalId: string; status: string }) =>
    api.eagleeye.updateSignalStatus(input.signalId, input.status)),
  ipoReadiness: m((input: Record<string, unknown>) => api.eagleeye.ipoReadiness(input)),
};

// ── Hawkeye ─────────────────────────────────────────────────────

const hawkeyeHooks = {
  buyers: q(["hawkeye", "buyers"], () => api.hawkeye.buyers()),
  match: m((input: Record<string, unknown>) => api.hawkeye.match(input)),
  teaser: m((input: Record<string, unknown>) => api.hawkeye.teaser(input)),
  orderBook: {
    useQuery: (input?: { dealId: string }, opts?: Partial<UseQueryOptions>) =>
      useQuery({
        queryKey: ["hawkeye", "orderBook", input?.dealId],
        queryFn: () => api.hawkeye.orderBook(input?.dealId ?? ""),
        enabled: !!input?.dealId,
        ...opts,
      }),
  },
  indicate: m((input: { dealId: string; indication: Record<string, unknown> }) =>
    api.hawkeye.indicate(input.dealId, input.indication)),
  allocate: m((input: { dealId: string; params: Record<string, unknown> }) =>
    api.hawkeye.allocate(input.dealId, input.params)),
};

// ── Rating & ESG ────────────────────────────────────────────────

const ratingEsg = {
  ratingAssess: m((input: Record<string, unknown>) => api.ratingEsg.ratingAssess(input)),
  ratingCompare: m((input: Record<string, unknown>) => api.ratingEsg.ratingCompare(input)),
  esgScore: m((input: Record<string, unknown>) => api.ratingEsg.esgScore(input)),
  climateAssess: m((input: Record<string, unknown>) => api.ratingEsg.climateAssess(input)),
  covenantMonitor: m((input: Record<string, unknown>) => api.ratingEsg.covenantMonitor(input)),
  trusteeTasks: q(["ratingEsg", "trusteeTasks"], () => api.ratingEsg.trusteeTasks()),
  updateTrusteeTask: m((input: { taskId: string; status: string }) =>
    api.ratingEsg.updateTrusteeTask(input.taskId, input.status)),
  rmaBenchmark: m((input: Record<string, unknown>) => api.ratingEsg.rmaBenchmark(input)),
};

// ── Bond Structuring (GENIE) ───────────────────────────────────

const bondStructuring = {
  structure: m((input: { deal: Record<string, unknown>; tranches: Array<Record<string, unknown>> }) =>
    api.bondStructuring.structure(input)),
  dealImpact: m((input: { rate_delta_bps: number; current_stack: Record<string, unknown>; deal: Record<string, unknown> }) =>
    api.bondStructuring.dealImpact(input)),
  callPutAnalysis: m((input: Record<string, unknown>) =>
    api.bondStructuring.callPutAnalysis(input)),
  poolAnalysis: m((input: { deals: Array<Record<string, unknown>> }) =>
    api.bondStructuring.poolAnalysis(input)),
};

// ── useUtils (cache invalidation helper) ─────────────────────────

function useUtils() {
  const qc = useQueryClient();
  return {
    auth: {
      me: {
        setData: (_key: unknown, _data: unknown) =>
          qc.setQueryData(["auth", "me"], _data),
        invalidate: () => qc.invalidateQueries({ queryKey: ["auth", "me"] }),
      },
    },
  };
}

// ── Signal Intelligence ─────────────────────────────────────────

const signalHooks = {
  query: {
    useQuery: (
      input?: Record<string, string>,
      opts?: Partial<UseQueryOptions>,
    ) =>
      useQuery({
        queryKey: ["signals", "query", input],
        queryFn: () => api.signals.query(input),
        ...opts,
      }),
  },
  related: {
    useQuery: (
      input?: { signal_id?: string; entity?: string; market?: string; state?: string; exclude_id?: string },
      opts?: Partial<UseQueryOptions>,
    ) =>
      useQuery({
        queryKey: ["signals", "related", input],
        queryFn: () => api.signals.related(input || {}),
        enabled: !!(input?.entity || input?.market || input?.state),
        ...opts,
      }),
  },
  updateStatus: m((input: { signalId: string; status: string }) =>
    api.signals.updateStatus(input.signalId, input.status),
  ),
  stats: q(["signals", "stats"], () => api.signals.stats()),
  vectorLatest: q(["signals", "vectorLatest"], () => api.signals.vectorLatest()),
  vectorHistory: q(["signals", "vectorHistory"], () => api.signals.vectorHistory()),
  pollFred: m(() => api.signals.pollFred()),
  pollEdgar: m((input?: { days?: number }) => api.signals.pollEdgar(input?.days)),
  alerts: {
    useQuery: (
      input?: Record<string, string>,
      opts?: Partial<UseQueryOptions>,
    ) =>
      useQuery({
        queryKey: ["signals", "alerts", input],
        queryFn: () => api.signals.alerts(input),
        ...opts,
      }),
  },
  updateAlertStatus: m((input: { alertId: string; status: string }) =>
    api.signals.updateAlertStatus(input.alertId, input.status),
  ),
};

// ── Public export ────────────────────────────────────────────────

export const trpc = {
  auth,
  deals,
  approvals,
  bonds,
  mTargets,
  tenants,
  draws,
  covenants,
  powerstrip,
  bondWorkflow,
  eagleeye,
  hawkeye: hawkeyeHooks,
  ratingEsg,
  bondStructuring,
  signals: signalHooks,
  useUtils,
};
