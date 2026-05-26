/**
 * NEST API Client — replaces tRPC with direct Flask REST calls.
 * Every call expects { success, data, error, timestamp, version }.
 */

const API_BASE = import.meta.env.VITE_API_URL || "";

interface NestResponse<T = unknown> {
  success: boolean;
  data: T;
  error: string | null;
  timestamp: string;
  version?: string;
}

async function nestFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    credentials: "include",
    ...options,
  });
  const json: NestResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || "Unknown error");
  return json.data;
}

// ── Auth ─────────────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) =>
    nestFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => nestFetch("/api/auth/me"),
};

// ── Deals ────────────────────────────────────────────────────
export const deals = {
  list: () => nestFetch("/api/deals"),
  get: (id: string) => nestFetch(`/api/deals/${id}`),
  create: (deal: Record<string, unknown>) =>
    nestFetch("/api/deals", { method: "POST", body: JSON.stringify(deal) }),
  analyze: (id: string) =>
    nestFetch(`/api/deals/${id}/analyze`, { method: "POST" }),
};

// ── Fund ─────────────────────────────────────────────────────
export const fund = {
  snapshot: () => nestFetch("/api/fund/snapshot"),
  simulate: (aum: number, months: number) =>
    nestFetch("/api/fund/simulate", {
      method: "POST",
      body: JSON.stringify({ aum, months }),
    }),
};

// ── Agents ───────────────────────────────────────────────────
export const agents = {
  list: () => nestFetch("/api/agents"),
  run: (name: string, payload?: Record<string, unknown>) =>
    nestFetch(`/api/agents/${name}/run`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),
  status: (name: string) => nestFetch(`/api/agents/${name}/status`),
};

// ── Market ───────────────────────────────────────────────────
export const market = {
  rates: () => nestFetch("/api/market/rates"),
  signals: () => nestFetch("/api/market/signals"),
};

// ── Bond Tools (existing CreditEngine) ───────────────────────
export const bondTools = {
  credit: (deal: Record<string, unknown>) =>
    nestFetch("/api/bond-tools/credit", {
      method: "POST",
      body: JSON.stringify(deal),
    }),
  stack: (params: Record<string, unknown>) =>
    nestFetch("/api/bond-tools/stack", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  callPut: (params: Record<string, unknown>) =>
    nestFetch("/api/bond-tools/call-put", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  stress: (deal: Record<string, unknown>) =>
    nestFetch("/api/bond-tools/stress", {
      method: "POST",
      body: JSON.stringify(deal),
    }),
};

// ── Risk (existing RiskEngine) ───────────────────────────────
export const risk = {
  score: (deal: Record<string, unknown>) =>
    nestFetch("/api/risk/score", {
      method: "POST",
      body: JSON.stringify(deal),
    }),
};

// ── Modeling Module (NEW — Silo 3) ──────────────────────────
export const modeling = {
  noi: (dealId: string, period: string) =>
    nestFetch("/api/modeling/noi", {
      method: "POST",
      body: JSON.stringify({ dealId, period }),
    }),
  dscr: (dealId: string, period: string) =>
    nestFetch("/api/modeling/dscr", {
      method: "POST",
      body: JSON.stringify({ dealId, period }),
    }),
  ccsr: (dealId: string, period: string) =>
    nestFetch("/api/modeling/ccsr", {
      method: "POST",
      body: JSON.stringify({ dealId, period }),
    }),
  pata: (dealId: string, period: string) =>
    nestFetch("/api/modeling/pata", {
      method: "POST",
      body: JSON.stringify({ dealId, period }),
    }),
  leverage: (dealId: string, period: string) =>
    nestFetch("/api/modeling/leverage", {
      method: "POST",
      body: JSON.stringify({ dealId, period }),
    }),
  entranceFeeVelocity: (dealId: string, period: string) =>
    nestFetch("/api/modeling/entrance-fee-velocity", {
      method: "POST",
      body: JSON.stringify({ dealId, period }),
    }),
  stress: (dealId: string, config: Record<string, unknown>) =>
    nestFetch("/api/modeling/stress", {
      method: "POST",
      body: JSON.stringify({ dealId, ...config }),
    }),
};

// ── Maxwell (Silo 4) ────────────────────────────────────────
export const maxwell = {
  score: (dealId: string, methodology?: string) =>
    nestFetch("/api/maxwell/score", {
      method: "POST",
      body: JSON.stringify({ dealId, methodology }),
    }),
  ratings: (dealId: string) => nestFetch(`/api/maxwell/${dealId}/ratings`),
};

// ── Architect (Silo 6) ──────────────────────────────────────
export const architect = {
  candidates: (dealId: string, targetRating: string) =>
    nestFetch("/api/architect/candidates", {
      method: "POST",
      body: JSON.stringify({ dealId, targetRating }),
    }),
  structures: (dealId: string) =>
    nestFetch(`/api/architect/${dealId}/structures`),
};

// ── Pricing (Silo 7) ────────────────────────────────────────
export const pricing = {
  mark: (bondId: string) =>
    nestFetch("/api/pricing/mark", {
      method: "POST",
      body: JSON.stringify({ bondId }),
    }),
  history: (bondId: string) => nestFetch(`/api/pricing/${bondId}/history`),
};

// ── Insurance (Silo 8) ──────────────────────────────────────
export const insurance = {
  analyze: (dealId: string) =>
    nestFetch("/api/insurance/analyze", {
      method: "POST",
      body: JSON.stringify({ dealId }),
    }),
  carriers: () => nestFetch("/api/insurance/carriers"),
};

// ── Roots Marketplace ────────────────────────────────────────
export const roots = {
  offerings: (filters?: Record<string, unknown>) => {
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
    return nestFetch(`/api/roots/offerings?${params}`);
  },
  offering: (id: string) => nestFetch(`/api/roots/offerings/${id}`),
  readiness: (id: string) => nestFetch(`/api/roots/offerings/${id}/readiness`),
  registerInterest: (data: Record<string, unknown>) =>
    nestFetch("/api/roots/interest", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitDeal: (data: Record<string, unknown>) =>
    nestFetch("/api/roots/submit-deal", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Power Strip ─────────────────────────────────────────────
export const powerstrip = {
  status: () => nestFetch("/api/powerstrip/status"),
  plugins: () => nestFetch("/api/powerstrip/plugins"),
  marketRates: () => nestFetch("/api/powerstrip/market-rates"),
  bondPricing: (params: Record<string, unknown>) =>
    nestFetch("/api/powerstrip/bond-pricing", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  refiSignals: (deal: Record<string, unknown>) =>
    nestFetch("/api/powerstrip/refi-signals", {
      method: "POST",
      body: JSON.stringify(deal),
    }),
  route: (taskType: string, prompt: string, options?: Record<string, unknown>) =>
    nestFetch("/api/powerstrip/route", {
      method: "POST",
      body: JSON.stringify({ task_type: taskType, prompt, ...options }),
    }),
  callDirect: (pluginName: string, prompt: string, system?: string) =>
    nestFetch(`/api/powerstrip/call/${pluginName}`, {
      method: "POST",
      body: JSON.stringify({ prompt, system }),
    }),
};

// ── Bond Workflow ────────────────────────────────────────────
export const bondWorkflow = {
  getByDeal: (dealId: string) => nestFetch(`/api/bond-workflow/deal/${dealId}`),
  runFullAIEvaluation: (dealId: string) =>
    nestFetch(`/api/bond-workflow/deal/${dealId}/run-evaluation`, { method: "POST" }),
  updateChecklist: (dealId: string, item: Record<string, unknown>) =>
    nestFetch(`/api/bond-workflow/deal/${dealId}/checklist`, {
      method: "POST",
      body: JSON.stringify(item),
    }),
  updatePhase: (dealId: string, phase: string) =>
    nestFetch(`/api/bond-workflow/deal/${dealId}/phase`, {
      method: "PATCH",
      body: JSON.stringify({ phase }),
    }),
};

// ── EagleEye ────────────────────────────────────────────────
export const eagleeye = {
  signals: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters || {});
    return nestFetch(`/api/eagleeye/signals?${params}`);
  },
  signal: (id: string) => nestFetch(`/api/eagleeye/signals/${id}`),
  updateSignalStatus: (id: string, status: string) =>
    nestFetch(`/api/eagleeye/signals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  scout: (params: Record<string, unknown>) =>
    nestFetch("/api/eagleeye/scout", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  scoutHistory: () => nestFetch("/api/eagleeye/scout/history"),
  convert: (signalId: string) =>
    nestFetch(`/api/eagleeye/convert/${signalId}`, { method: "POST" }),
  stats: () => nestFetch("/api/eagleeye/stats"),
  ipoReadiness: (target: Record<string, unknown>) =>
    nestFetch("/api/eagleeye/ipo-readiness", {
      method: "POST",
      body: JSON.stringify({ target }),
    }),
};

// ── Hawkeye ─────────────────────────────────────────────────
export const hawkeye = {
  buyers: () => nestFetch("/api/hawkeye/buyers"),
  match: (params: Record<string, unknown>) =>
    nestFetch("/api/hawkeye/match", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  teaser: (params: Record<string, unknown>) =>
    nestFetch("/api/hawkeye/teaser", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  orderBook: (dealId: string) => nestFetch(`/api/hawkeye/order-book/${dealId}`),
  indicate: (dealId: string, indication: Record<string, unknown>) =>
    nestFetch(`/api/hawkeye/order-book/${dealId}/indicate`, {
      method: "POST",
      body: JSON.stringify(indication),
    }),
  allocate: (dealId: string, params: Record<string, unknown>) =>
    nestFetch(`/api/hawkeye/order-book/${dealId}/allocate`, {
      method: "POST",
      body: JSON.stringify(params),
    }),
  teasers: (dealId: string) => nestFetch(`/api/hawkeye/teasers/${dealId}`),
};

// ── Rating & ESG ────────────────────────────────────────────
export const ratingEsg = {
  ratingAssess: (deal: Record<string, unknown>) =>
    nestFetch("/api/rating-esg/rating/assess", { method: "POST", body: JSON.stringify(deal) }),
  ratingCompare: (deal: Record<string, unknown>) =>
    nestFetch("/api/rating-esg/rating/compare", { method: "POST", body: JSON.stringify(deal) }),
  esgScore: (scores: Record<string, unknown>) =>
    nestFetch("/api/rating-esg/esg/score", { method: "POST", body: JSON.stringify(scores) }),
  climateAssess: (params: Record<string, unknown>) =>
    nestFetch("/api/rating-esg/climate/assess", { method: "POST", body: JSON.stringify(params) }),
  covenantMonitor: (covenants: Record<string, unknown>) =>
    nestFetch("/api/rating-esg/covenants/monitor", { method: "POST", body: JSON.stringify(covenants) }),
  trusteeTasks: (phase?: string) =>
    nestFetch(`/api/rating-esg/trustee/tasks${phase ? `?phase=${phase}` : ""}`),
  updateTrusteeTask: (taskId: string, status: string) =>
    nestFetch(`/api/rating-esg/trustee/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  rmaBenchmark: (params: Record<string, unknown>) =>
    nestFetch("/api/rating-esg/rma/benchmark", { method: "POST", body: JSON.stringify(params) }),
};

// ── Metrics ──────────────────────────────────────────────────
export const metrics = {
  platform: () => nestFetch("/api/metrics"),
  health: () => nestFetch("/api/health"),
};

// ── Bond Structuring (GENIE) ────────────────────────────────
export const bondStructuring = {
  structure: (params: {
    deal: Record<string, unknown>;
    tranches: Array<Record<string, unknown>>;
  }) =>
    nestFetch("/api/bond-structuring/structure", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  dealImpact: (params: {
    rate_delta_bps: number;
    current_stack: Record<string, unknown>;
    deal: Record<string, unknown>;
  }) =>
    nestFetch("/api/bond-structuring/deal-impact", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  callPutAnalysis: (params: Record<string, unknown>) =>
    nestFetch("/api/bond-structuring/call-put-analysis", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  poolAnalysis: (params: { deals: Array<Record<string, unknown>> }) =>
    nestFetch("/api/bond-structuring/pool-analysis", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};

// ── Signal Intelligence ──────────────────────────────────────
export const signals = {
  query: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters || {});
    return nestFetch(`/api/signals/query?${params}`);
  },
  latest: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters || {});
    return nestFetch(`/api/signals/latest?${params}`);
  },
  stats: () => nestFetch("/api/signals/stats"),
  related: (params: { signal_id?: string; entity?: string; market?: string; state?: string; exclude_id?: string }) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) qs.set(k, v);
    }
    return nestFetch(`/api/signals/related?${qs}`);
  },
  updateStatus: (signalId: string, status: string) =>
    nestFetch(`/api/signals/${signalId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  pollFred: () => nestFetch("/api/signals/poll/fred", { method: "POST" }),
  pollEdgar: (days?: number) =>
    nestFetch(`/api/signals/poll/edgar${days ? `?days=${days}` : ""}`, { method: "POST" }),
  alerts: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters || {});
    return nestFetch(`/api/signals/alerts?${params}`);
  },
  updateAlertStatus: (alertId: string, status: string) =>
    nestFetch(`/api/signals/alerts/${alertId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  vectorLatest: (dealId?: string) =>
    nestFetch(`/api/signals/vector/latest${dealId ? `?deal_id=${dealId}` : ""}`),
  vectorHistory: (limit?: number) =>
    nestFetch(`/api/signals/vector/history?limit=${limit || 50}`),
};

export const api = {
  auth, deals, fund, agents, market, bondTools, risk,
  modeling, maxwell, architect, pricing, insurance, roots, metrics,
  powerstrip, bondWorkflow, eagleeye, hawkeye, ratingEsg, bondStructuring,
  signals,
};

export default api;
