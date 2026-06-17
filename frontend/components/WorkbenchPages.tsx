"use client";
import Link from "next/link";
/*
Design philosophy for this file: Bloomberg Terminal x Spider-Verse institutional command cockpit.
These routed workbench pages must preserve every NEST module as a docked institutional capability, showing role-specific command surfaces rather than placeholder routes.
*/
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  Bot,
  BrainCircuit,
  Cable,
  CircleDollarSign,
  Cpu,
  DatabaseZap,
  FileCheck2,
  Landmark,
  Layers3,
  LineChart,
  LockKeyhole,
  PlugZap,
  RadioTower,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

const TREE_LOGO = "/nest-logo.png";

// ─── Bernard Intelligence Panel ───────────────────────────────────────────────
// Routes through the CNS orchestrator. Every hollow page calls this.
function BernardIntelPanel({ question, context, label }: { question: string; context?: Record<string, unknown>; label?: string }) {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`${API}/api/desks/bernard/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, context }),
    })
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          if (d.success && d.data?.response) setResponse(d.data.response);
          else setError(true);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [question]);

  return (
    <div className="mt-6 rounded-[1.35rem] border border-[#C4A048]/30 bg-[#06101a]/95 p-5">
      <div className="flex items-center gap-2 mb-3">
        <BrainCircuit size={15} className="text-[#C4A048]" />
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#C4A048]">Bernard Intelligence{label ? ` · ${label}` : ""}</span>
        {loading && <span className="ml-2 font-mono text-[0.6rem] text-[#7A9A82] animate-pulse">Routing through CNS…</span>}
      </div>
      {loading && (
        <div className="space-y-2">
          {[80, 65, 90].map(w => (
            <div key={w} className={`h-3 rounded bg-[#1E4A2E]/60 animate-pulse`} style={{ width: `${w}%` }} />
          ))}
        </div>
      )}
      {error && <p className="font-mono text-xs text-red-400">ANTHROPIC_API_KEY not set in Railway environment. Add it to unlock real intelligence.</p>}
      {!loading && !error && response && (
        <p className="text-sm text-[#EDE8DC] leading-6 whitespace-pre-wrap">{response}</p>
      )}
    </div>
  );
}

// ─── Agent Output Card ────────────────────────────────────────────────────────
// Renders the actual output from a dispatched agent in a compact format.
// Each agent returns different keys — this normalises them for display.
function AgentOutputCard({ module, output }: { module: string; output: any }) {
  const rows: [string, string][] = [];

  if (module === "maxwell") {
    if (output.grade)          rows.push(["Grade", output.grade]);
    if (output.obligor_grade)  rows.push(["Grade", output.obligor_grade]);
    if (output.dscr)           rows.push(["DSCR", String(output.dscr)]);
    if (output.ltv)            rows.push(["LTV", `${(output.ltv * 100).toFixed(1)}%`]);
    if (output.strategy)       rows.push(["Strategy", output.strategy]);
    if (output.summary)        rows.push(["Summary", output.summary]);
  } else if (module === "vector") {
    if (output.action)         rows.push(["Action", output.action]);
    if (output.recommendation) rows.push(["Action", output.recommendation]);
    if (output.score !== undefined) rows.push(["Score", String(output.score)]);
    if (output.annual_savings_usd) rows.push(["Annual Savings", `$${(output.annual_savings_usd / 1e6).toFixed(2)}M`]);
    if (output.rationale)      rows.push(["Rationale", output.rationale]);
  } else if (module === "prometheus") {
    if (output.dscr)           rows.push(["DSCR", String(output.dscr)]);
    if (output.noi_year1_usd)  rows.push(["Year 1 NOI", `$${(output.noi_year1_usd / 1e6).toFixed(1)}M`]);
    if (output.break_even_occupancy_pct) rows.push(["Breakeven Occ.", `${output.break_even_occupancy_pct}%`]);
    if (output.summary)        rows.push(["Summary", output.summary]);
    if (output.recommendation) rows.push(["Rec.", output.recommendation]);
  } else if (module === "sentinel") {
    if (output.risk_level)     rows.push(["Risk Level", output.risk_level]);
    if (output.composite_score !== undefined) rows.push(["Score", String(output.composite_score)]);
    if (output.lgd_estimate_pct !== undefined) rows.push(["LGD Est.", `${output.lgd_estimate_pct}%`]);
    if (output.primary_concern) rows.push(["Primary Concern", output.primary_concern]);
  } else if (module === "morgan") {
    if (output.content)        rows.push(["Memo", output.content.slice(0, 120) + "…"]);
    if (output.content_type)   rows.push(["Type", output.content_type]);
  } else if (module === "cns_chain") {
    if (output.bond_type)      rows.push(["Bond Type", output.bond_type.replace(/_/g, " ")]);
    if (output.amort_label)    rows.push(["Amortization", output.amort_label]);
    if (output.annual_ds_usd)  rows.push(["Annual DS", `$${(output.annual_ds_usd / 1e6).toFixed(2)}M`]);
    if (output.vector_action)  rows.push(["Vector", output.vector_action]);
    if (output.rationale)      rows.push(["Rationale", output.rationale]);
  } else {
    // Generic fallback — first 4 scalar fields
    Object.entries(output).slice(0, 4).forEach(([k, v]) => {
      if (typeof v !== "object") rows.push([k.replace(/_/g, " "), String(v)]);
    });
  }

  if (rows.length === 0) return null;

  return (
    <div className="grid gap-x-4 gap-y-0.5" style={{ gridTemplateColumns: "auto 1fr" }}>
      {rows.map(([k, v]) => (
        <>
          <span key={`k-${k}`} className="font-mono text-[0.5rem] uppercase tracking-[0.08em] text-[#7A9A82] whitespace-nowrap">{k}</span>
          <span key={`v-${k}`} className="font-mono text-[0.55rem] text-[#EDE8DC] break-words">{v}</span>
        </>
      ))}
    </div>
  );
}

// ─── CNS Signal Monitor ───────────────────────────────────────────────────────
// The "police force" — emits any signal into the rule engine, shows every
// downstream consequence across all modules.
function CNSSignalMonitor({ defaultSignal = "dscr_change", showDscrFast = false }: {
  defaultSignal?: string;
  showDscrFast?: boolean;
}) {
  const [signalType, setSignalType] = useState(defaultSignal);
  const [dscr, setDscr] = useState("1.65");
  const [ltv, setLtv] = useState("0.60");
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const QUICK_SIGNALS = [
    { key: "dscr_change", label: "DSCR Change" },
    { key: "rate_move", label: "Rate Move" },
    { key: "doc_uploaded", label: "Doc Upload" },
    { key: "grade_assigned", label: "Grade Assigned" },
    { key: "credit_breach", label: "Credit Breach" },
    { key: "surety_bound", label: "Surety Bound" },
  ];

  async function fire() {
    setRunning(true);
    setResult(null);
    const endpoint = (signalType === "dscr_change" || showDscrFast)
      ? `${API}/api/cns/dscr-impact`
      : `${API}/api/cns/signal`;
    const body = signalType === "dscr_change"
      ? { dscr: parseFloat(dscr), ltv: parseFloat(ltv) }
      : { signal_type: signalType, value: parseFloat(dscr), context: { dscr: parseFloat(dscr), ltv: parseFloat(ltv) } };
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.success) setResult(d.data);
    } catch { /* swallow */ }
    setRunning(false);
  }

  const priorityColor = (p: string) => p === "CRITICAL" ? "#ef4444" : p === "HIGH" ? "#f97316" : p === "MEDIUM" ? "#C4A048" : "#7A9A82";

  return (
    <div className="mt-5 rounded-[1.35rem] border border-[#1E4A2E]/60 bg-[#030A06]/90 p-5">
      <div className="flex items-center gap-2 mb-4">
        <RadioTower size={14} className="text-[#2D6B3D]" />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#2D6B3D]">CNS Signal Bus — Platform Rule Engine</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_SIGNALS.map(s => (
          <button
            key={s.key}
            onClick={() => setSignalType(s.key)}
            className={`rounded-[0.6rem] border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition ${
              signalType === s.key
                ? "border-[#2D6B3D] bg-[#2D6B3D]/20 text-[#7A9A82]"
                : "border-white/10 text-[#7A9A82]/60 hover:border-white/20"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label className="mb-1 block font-mono text-[0.5rem] uppercase tracking-[0.1em] text-[#7A9A82]">
            {signalType === "rate_move" ? "Rate Delta (bps)" : "DSCR Value"}
          </label>
          <input
            type="number"
            step="0.01"
            value={dscr}
            onChange={e => setDscr(e.target.value)}
            className="w-28 rounded-[0.6rem] border border-white/10 bg-[#0D2218] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] focus:border-[#2D6B3D] focus:outline-none"
          />
        </div>
        {signalType === "dscr_change" && (
          <div>
            <label className="mb-1 block font-mono text-[0.5rem] uppercase tracking-[0.1em] text-[#7A9A82]">LTV</label>
            <input
              type="number"
              step="0.01"
              value={ltv}
              onChange={e => setLtv(e.target.value)}
              className="w-24 rounded-[0.6rem] border border-white/10 bg-[#0D2218] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] focus:border-[#2D6B3D] focus:outline-none"
            />
          </div>
        )}
        <button
          onClick={fire}
          disabled={running}
          className="rounded-[0.75rem] border border-[#2D6B3D]/60 bg-[#2D6B3D]/15 px-4 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-[#7A9A82] transition hover:bg-[#2D6B3D]/25 disabled:opacity-50"
        >
          {running ? "Evaluating…" : "Fire Signal →"}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          {/* Impact summary for DSCR */}
          {result.impact && (
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              {[
                { label: "Credit Grade", value: result.impact.computed_grade, critical: result.impact.computed_grade === "Sub-IG" },
                { label: "Bond Type", value: result.impact.eligible_bond_type?.replace(/_/g, " "), critical: false },
                { label: "EMMA Gate", value: result.impact.emma_gate_status?.replace(/_/g, " "), critical: result.impact.emma_gate_status?.includes("BREACH") },
                { label: "Surety Tier", value: result.impact.surety_tier, critical: result.impact.surety_tier?.includes("LC") },
              ].map(({ label, value, critical }) => (
                <div key={label} className="rounded-[0.75rem] border border-white/8 bg-[#0D2218]/60 p-2.5">
                  <div className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-[#7A9A82]">{label}</div>
                  <div className={`mt-1 font-mono text-xs font-semibold ${critical ? "text-red-400" : "text-[#C4A048]"}`}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Consequences + live agent outputs */}
          <div className="space-y-1.5">
            <div className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[#7A9A82]">
              {result.consequence_count || result.consequences?.length} Modules Triggered · {result.critical_count || 0} Critical
              {result.agents_dispatched > 0 && <span className="ml-2 text-[#2D6B3D]">· {result.agents_dispatched} Agents Ran</span>}
            </div>
            {(result.next_actions || []).map((a: any, i: number) => {
              // Find this module's agent output from the dispatched outputs array
              const agentOut = result.agent_outputs?.find((o: any) => o.module === a.module && o.action === a.action);
              return (
                <div key={i} className="rounded-[0.6rem] border border-white/5 bg-[#0D2218]/40">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: priorityColor(a.priority) }} />
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em]" style={{ color: priorityColor(a.priority) }}>{a.priority}</span>
                    <span className="font-mono text-[0.62rem] text-[#7A9A82]">{a.module}</span>
                    <span className="font-mono text-[0.62rem] text-[#EDE8DC]/70">→ {a.action.replace(/_/g, " ")}</span>
                    {a.agent_ran && <span className="ml-auto font-mono text-[0.5rem] text-[#2D6B3D] uppercase tracking-wider">● ran</span>}
                  </div>
                  {/* Render agent output inline */}
                  {agentOut?.output && !agentOut.output.error && (
                    <div className="border-t border-white/5 px-3 pb-2.5 pt-2">
                      <AgentOutputCard module={a.module} output={agentOut.output} />
                    </div>
                  )}
                  {agentOut?.output?.error && (
                    <div className="border-t border-white/5 px-3 pb-2 pt-1.5 font-mono text-[0.55rem] text-red-400/70">
                      {agentOut.output.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {result.cascades?.length > 0 && (
            <div className="font-mono text-[0.55rem] text-[#7A9A82]/60">
              Cascades → {result.cascades.join(" → ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const cnsLayerRows = [
  ["Universal Connector Power Strip", "MSRB/EMMA, FRED, Treasury, SEC EDGAR, rating references, surety carriers, CRM, document vault, licensed feeds", "Source timestamp, entitlement, provenance, connector health"],
  ["NEST Agent / Tool Power Strip", "Vector, Apex, Bond Optimizer, Merlin, Morgan, Aria, Sterling, SuretyScout, Auditor, Prometheus, Sentinel, LenderScout, Bridge", "Owner, input evidence, output type, approval status"],
  ["Curated AI Brain", "Routing, retrieval, gap detection, memo drafting, scenario comparison, compliance assist", "Cannot bypass deterministic backend execution"],
  ["Deterministic Execution Backend", "RBAC, workflow state, APIs, databases, queues, approvals, audit logs, retention", "Code decides what runs, who can see it, and what record is written"],
] as const;

// Module deep-link cards. All hrefs verified against App.tsx route table.
// Metric column is rendered live from the dashboard-level fetches (see DashboardPage).
const dashboardCardSpec = [
  { name: "EagleEye V2", href: "/eagleeye-v2", copy: "Signal sourcing across EMMA, EDGAR, FINRA. Geographic intelligence map. Promote to Deal." },
  { name: "Roots", href: "/roots", copy: "Stage 1 document ingestion. NAICS-driven document checklist. Feasibility study slotting." },
  { name: "Bond Desk", href: "/bond-desk", copy: "Sizing, structuring, call/put schedules. NAICS-derived bond type. Cost of Issuance + NEST P&L views." },
  { name: "New Deal", href: "/deal-input-v4", copy: "Stage 0 intake. Triggers Bernard Intake Brainstorm with NAICS rules and credit benchmarks." },
] as const;

const portalRows = [
  ["Admin Command", "Control tower for deals, users, approvals, sources, agents, exception queues, licensing, and audit history.", "/admin-platform", "Approval policy, user roles, module health, incident resolution."],
  ["Client / Issuer Portal", "Submissions, project readiness, missing evidence, feasibility review, credit memo comments, and status transparency.", "/client-deposit", "Invoice selection, deposit receipts, evidence intake, issuer-facing status."],
  ["Investor Portal", "Permissioned offering rooms, approved diligence packs, investor updates, IOI state, and follow-up history.", "/operations/deals", "Deal rooms, investor book state, diligence pack handoff, follow-up trail."],
  ["Advisor / Bond Desk", "Structuring, pricing context, call/put panels, M&A watchlist, outreach queue, and investor segmentation.", "/bond-desk", "Live MTM ticker, call/put exercise review, spread analytics, book-building."],
  ["Compliance Portal", "Communication pre-clearance, retained records, approval locks, surveillance flags, and exception resolution.", "/compliance-portal", "Archive lock, surveillance acknowledgement, approval queue, retention controls."],
  ["Agent Operations", "Connector health, AI routing, input/output inspection, failure states, model drift warnings, and rerun permissions.", "/agents", "Live agent flow, task state transitions, evidence output, human routing."],
] as const;

const agentRows = [
  ["Vector", "Call / Put Radar", "Bond Desk + Rating Room", "Market trigger approval"],
  ["Apex", "Hedge Desk", "Bond Desk + Compliance", "Human trade block"],
  ["Bond Optimizer", "Refi / Restructure Engine", "Rating Room + Bond Desk", "Scenario record"],
  ["Merlin", "M&A Locator", "Bond Desk + Admin", "Conflict screen"],
  ["Morgan", "Document Generator", "Document CNS", "Draft watermark + compliance review"],
  ["Aria", "Relationship Follow-Up", "Client + Bond Desk", "Human send approval"],
  ["Sterling", "Placement Book Builder", "Investor Portal + Bond Desk", "Communication archive"],
  ["SuretyScout", "Surety / Insurance Engine", "Surety Desk", "Carrier handoff approval"],
  ["Auditor", "Readiness Gap Scanner", "Rating Room", "Readiness gate"],
  ["Prometheus", "Feasibility + Stress Engine", "Rating Room + Surety", "Model validation"],
  ["Sentinel", "Risk Watchtower", "Admin + Compliance", "Exception queue"],
  ["LenderScout / Bridge", "Capital Provider Matching", "Bond Desk + Client", "Relationship record"],
] as const;

function formatCompactCurrency(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function numberFromMoneyLike(value: unknown) {
  if (value === null || value === undefined) return 0;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function WorkbenchShell({
  title,
  eyebrow,
  lede,
  icon: Icon,
  children,
}: {
  title: string;
  eyebrow: string;
  lede: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <main className="workbench-page">
      <aside className="workbench-side">
        <div className="tree-lockup compact-logo">
          <img src={TREE_LOGO} alt="NEST tree logo" />
          <div>
            <strong>NEST</strong>
            <span>Workbench</span>
          </div>
        </div>
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Back to cockpit</Link>
        <nav className="workbench-nav">
          <Link href="/dashboard"><Activity size={15} /> Dashboard</Link>
          <Link href="/architecture"><BrainCircuit size={15} /> AI CNS</Link>
          <Link href="/portals"><Users size={15} /> Portals</Link>
          <Link href="/agents"><Bot size={15} /> Agents</Link>
        </nav>
        <div className="rail-alert compact-alert">
          <LockKeyhole size={16} />
          <p>Preserve every module. Govern every action. Retain every external record.</p>
        </div>
      </aside>
      <section className="workbench-main">
        <header className="workbench-hero">
          <p className="kicker"><Icon size={15} /> {eyebrow}</p>
          <h1>{title}</h1>
          <p>{lede}</p>
        </header>
        {children}
      </section>
    </main>
  );
}

type DashMetrics = { total_deals?: number; active_deals?: number; total_pipeline_usd?: number; agents_active?: number; agents_total?: number; bond_structures?: number };
type DashWarChest = { aum_usd?: number; lc_capacity_usd?: number; lc_phase?: string; ytd_return_pct?: number };
type DashEagleStats = { total_signals?: number; hot?: number; warm?: number; total_prospects?: number };
type DashDeal = { id?: string; name?: string; state?: string; bond_face?: number; status?: string; risk_grade?: string };
type DashPipeline = { total_pipeline_usd?: number; deal_count?: number; by_status?: Record<string, number> };

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashMetrics | null>(null);
  const [warChest, setWarChest] = useState<DashWarChest | null>(null);
  const [eagleStats, setEagleStats] = useState<DashEagleStats | null>(null);
  const [deals, setDeals] = useState<DashDeal[]>([]);
  const [pipeline, setPipeline] = useState<DashPipeline | null>(null);

  useEffect(() => {
    fetch(`${API}/api/metrics`).then(r => r.json()).then(d => { if (d.success) setMetrics(d.data); }).catch(() => {});
    fetch(`${API}/api/fund/hft/war-chest`).then(r => r.json()).then(d => { if (d.success) setWarChest(d.data); }).catch(() => {});
    fetch(`${API}/api/eagleeye/stats`).then(r => r.json()).then(d => { if (d.success) setEagleStats(d.data); }).catch(() => {});
    fetch(`${API}/api/deals`).then(r => r.json()).then(d => { if (d.success) setDeals((d.data as DashDeal[]) || []); }).catch(() => {});
    fetch(`${API}/api/deals/pipeline`).then(r => r.json()).then(d => { if (d.success) setPipeline(d.data); }).catch(() => {});
  }, []);

  const livePortfolioMetrics = useMemo(() => [
    { label: "Active Deals", value: String(metrics?.active_deals ?? deals.length), detail: `${metrics?.total_deals ?? deals.length} total in pipeline`, icon: Activity },
    { label: "Pipeline Value", value: formatCompactCurrency(pipeline?.total_pipeline_usd ?? metrics?.total_pipeline_usd ?? 0), detail: "Sum of active deal face amounts", icon: CircleDollarSign },
    { label: "HFT War Chest", value: formatCompactCurrency(warChest?.aum_usd ?? 0), detail: warChest?.lc_phase ? `LC ${warChest.lc_phase} · ${formatCompactCurrency(warChest.lc_capacity_usd || 0)} capacity` : "Treasury arbitrage + Agency MBS basis", icon: ShieldCheck },
    { label: "EagleEye Signals", value: String(eagleStats?.total_signals ?? 0), detail: `${eagleStats?.hot ?? 0} hot · ${eagleStats?.warm ?? 0} warm · ${eagleStats?.total_prospects ?? 0} prospects`, icon: Target },
  ], [metrics, warChest, eagleStats, deals, pipeline]);

  const statusRows = useMemo(() => {
    if (pipeline?.by_status) {
      return Object.entries(pipeline.by_status).map(([status, count]) => ({ status, count }));
    }
    const counts = new Map<string, number>();
    for (const d of deals) counts.set(d.status ?? "intake", (counts.get(d.status ?? "intake") ?? 0) + 1);
    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
  }, [deals, pipeline]);

  const realDeals = useMemo(() => deals.filter(d => {
    const name = (d.name || "").toLowerCase();
    return !name.includes("test") && !name.includes("patch") && !name.includes("lookup");
  }).slice(0, 6), [deals]);

  return (
    <WorkbenchShell
      icon={Activity}
      eyebrow="NEST Command Dashboard"
      title="Live portfolio. Real-time deal pipeline, EagleEye signals, treasury war chest."
      lede="Active deals, pipeline value, and signal flow read from the backend. Click any module card to drill in."
    >
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Live portfolio metrics">
        {livePortfolioMetrics.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-[#C4A048]/20 bg-[#0D2218]/80 p-4 shadow-[0_0_36px_rgba(196,160,72,0.08)]">
            <div className="flex items-center justify-between gap-3 text-amber-100">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-amber-200/80">{label}</span>
              <Icon size={16} className="text-[#C4A048]" />
            </div>
            <strong className="mt-3 block font-mono text-3xl text-[#C4A048]">{value}</strong>
            <p className="mt-2 text-sm text-[#EDE8DC]">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="workbench-card-grid">
          {dashboardCardSpec.map(({ name, href, copy }) => (
            <Link className="workbench-card module-link-card" href={href} key={name}>
              <span>{name}</span>
              <strong className="text-[#C4A048]">Open →</strong>
              <p>{copy}</p>
              <em>Active module</em>
            </Link>
          ))}
        </div>
        <aside className="rounded-2xl border border-[#C4A048]/25 bg-[#0D2218]/80 p-4">
          <p className="kicker text-[#C4A048]"><TrendingUp size={14} /> Deal status rail</p>
          <div className="mt-3 grid gap-2">
            {(statusRows.length ? statusRows : [{ status: "intake", count: 0 }, { status: "active", count: 0 }, { status: "closed", count: 0 }]).map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-sm">
                <span className="uppercase tracking-[0.12em] text-[#EDE8DC]">{status}</span>
                <strong className="text-[#C4A048]">{count}</strong>
              </div>
            ))}
          </div>
          <Link href="/deals" className="mt-4 inline-flex rounded-xl border border-[#C4A048]/30 bg-[#C4A048]/10 px-3 py-2 text-sm text-[#C4A048]">Open deal pipeline →</Link>
        </aside>
      </section>

      {realDeals.length > 0 && (
        <section className="mt-6">
          <p className="kicker text-[#C4A048] mb-3"><Landmark size={14} /> Active deals</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {realDeals.map(d => (
              <Link key={d.id || d.name} href={d.id ? `/operations/deal/${d.id}` : "/deals"} className="rounded-2xl border border-white/[0.06] bg-[#0D2218]/60 hover:border-[#C4A048]/30 transition-colors p-4">
                <p className="font-[Cormorant_Garamond] text-lg text-amber-100">{d.name}</p>
                <div className="mt-2 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#7A9A82]">{d.state || "—"}</span>
                  <span className="text-[#C4A048]">{formatCompactCurrency(d.bond_face || 0)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-wider">
                  <span className="rounded border border-[#C4A048]/30 bg-[#C4A048]/10 text-[#C4A048] px-1.5 py-0.5">{d.status || "intake"}</span>
                  {d.risk_grade && <span className="rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 px-1.5 py-0.5">{d.risk_grade}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </WorkbenchShell>
  );
}

export function ArchitecturePage() {
  const [designer, setDesigner] = useState({
    projectCost: 173,
    seniorAdvance: 68,
    mezzanineAdvance: 17,
    suretyCoverage: 92,
    reservePercent: 4.5,
    spreadBps: 148,
  });

  const capitalStackDesigner = useMemo(() => {
    const senior = designer.projectCost * (designer.seniorAdvance / 100);
    const mezzanine = designer.projectCost * (designer.mezzanineAdvance / 100);
    const reserve = designer.projectCost * (designer.reservePercent / 100);
    const equity = Math.max(designer.projectCost - senior - mezzanine - reserve, 0);
    const wrapped = designer.projectCost * (designer.suretyCoverage / 100);
    const weightedCost = 4.05 + designer.spreadBps / 100 + designer.reservePercent / 120;
    return { senior, mezzanine, reserve, equity, wrapped, weightedCost };
  }, [designer]);

  const updateDesigner = (key: keyof typeof designer, value: number) => {
    setDesigner((current) => ({ ...current, [key]: value }));
  };

  const applyDownsidePreset = () => {
    setDesigner({ projectCost: 173, seniorAdvance: 61, mezzanineAdvance: 14, suretyCoverage: 82, reservePercent: 6.25, spreadBps: 196 });
  };

  return (
    <WorkbenchShell
      icon={BrainCircuit}
      eyebrow="AI Central Nervous System"
      title="Layered power-strip backend architecture with a capital-stack designer."
      lede="Outside platforms plug into one connector strip, NEST tools plug into another, the curated AI Brain reasons across both, and deterministic code executes approved work. The designer below shows how capital-stack assumptions move through governed execution before any external action."
    >
      <section className="workbench-layer-table">
        {cnsLayerRows.map(([layer, examples, controls], index) => (
          <article className="workbench-layer-row" key={layer}>
            <div><Layers3 size={18} /><strong>0{index + 1}</strong></div>
            <h2>{layer}</h2>
            <p>{examples}</p>
            <small>{controls}</small>
          </article>
        ))}
      </section>

      <section className="mt-5 rounded-[1.35rem] border border-amber-300/30 bg-[#06101a]/90 p-5 shadow-[0_0_44px_rgba(251,191,36,0.1)]" aria-label="Capital-stack designer">
        <div className="grid gap-4 xl:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1fr)]">
          <div>
            <p className="kicker"><LineChart size={14} /> Capital-stack designer</p>
            <h2 className="mt-2 font-mono text-2xl uppercase tracking-[0.08em] text-white">A/B tranche and surety wrap simulator</h2>
            <p className="mt-2 text-sm leading-6 text-[#EDE8DC]">Adjust leverage, mezzanine participation, surety coverage, reserves, and spread assumptions. The output remains frontend-demo simulated until a human committee approves a backend bond record.</p>
            <button type="button" onClick={applyDownsidePreset} className="mt-4 rounded-xl border border-red-300/40 bg-red-500/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-red-100">Apply downside preset</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ["projectCost", "Project cost", 80, 260, "$M"],
              ["seniorAdvance", "Senior advance", 45, 78, "%"],
              ["mezzanineAdvance", "B tranche", 0, 28, "%"],
              ["suretyCoverage", "Surety wrap", 60, 100, "%"],
              ["reservePercent", "Reserve", 2, 9, "%"],
              ["spreadBps", "Spread", 70, 260, "bp"],
            ] as const).map(([key, label, min, max, unit]) => (
              <label key={key} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#EDE8DC]">
                  {label}<strong className="text-amber-200">{designer[key]}{unit}</strong>
                </span>
                <input
                  className="mt-3 w-full accent-cyan-300"
                  type="range"
                  min={min}
                  max={max}
                  step={key === "reservePercent" ? 0.25 : 1}
                  value={designer[key]}
                  onChange={(event) => updateDesigner(key, Number(event.target.value))}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {[
            ["Senior A", capitalStackDesigner.senior, "cyan"],
            ["B tranche", capitalStackDesigner.mezzanine, "violet"],
            ["Reserve", capitalStackDesigner.reserve, "gold"],
            ["Sponsor equity", capitalStackDesigner.equity, "green"],
            ["Surety wrapped", capitalStackDesigner.wrapped, "red"],
          ].map(([label, value, tone]) => (
            <article key={label as string} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[#7A9A82]">{label}</span>
              <strong className={`mt-2 block font-mono text-xl ${tone === "cyan" ? "text-[#E8C87A]" : tone === "violet" ? "text-fuchsia-200" : tone === "gold" ? "text-amber-200" : tone === "green" ? "text-emerald-200" : "text-red-200"}`}>{formatCompactCurrency(Number(value) * 1_000_000)}</strong>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-50">
          Simulated weighted cost: <strong className="font-mono text-emerald-200">{capitalStackDesigner.weightedCost.toFixed(2)}%</strong>. Human approval gate: committee must approve tranche creation, surety submission, investor communication, and any call/put exercise before external execution.
        </div>
      </section>

      <section className="workbench-icon-strip">
        {[PlugZap, Cable, BrainCircuit, Cpu, DatabaseZap, ShieldCheck, RadioTower, Landmark].map((Icon, index) => (
          <span key={index}><Icon size={18} /></span>
        ))}
      </section>
    </WorkbenchShell>
  );
}

export function PortalsPage() {
  const [activePortal, setActivePortal] = useState<(typeof portalRows)[number][0]>("Admin Command");
  const selectedPortal = portalRows.find(([name]) => name === activePortal) ?? portalRows[0];

  return (
    <WorkbenchShell
      icon={Users}
      eyebrow="Role-specific platforms"
      title="Six portals over one institutional core."
      lede="Admin, Client, Investor, Advisor, Compliance, and Agent Operations are not separate products. They are permissioned windows into the same evidence, workflow, and approval spine."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="workbench-list-panel">
          {portalRows.map(([name, copy, href]) => (
            <article key={name} className={`portal-workflow-link ${activePortal === name ? "border-[#C4A048]/55 bg-[#C4A048]/10" : ""}`} data-testid="portal-entry-point">
              <button type="button" onClick={() => setActivePortal(name)} className="block w-full text-left">
                <h2>{name}</h2>
                <p>{copy}</p>
              </button>
              <Link href={href} className="mt-3 inline-flex font-mono text-xs uppercase tracking-[0.12em] text-[#EDE8DC]">Launch governed workspace →</Link>
            </article>
          ))}
        </div>
        <aside className="rounded-[1.35rem] border border-amber-300/30 bg-[#06101a]/90 p-5">
          <p className="kicker"><FileCheck2 size={14} /> Active portal path</p>
          <h2 className="mt-2 font-mono text-2xl uppercase tracking-[0.08em] text-white">{selectedPortal[0]}</h2>
          <p className="mt-3 text-sm leading-6 text-[#EDE8DC]">{selectedPortal[3]}</p>
          <div className="mt-4 grid gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[#EDE8DC]">
            <span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">Evidence inherited from shared deal record</span>
            <span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">Critical actions route through human approval gates</span>
            <span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">External communications retained for compliance review</span>
          </div>
          <Link href={selectedPortal[2]} className="mt-5 inline-flex rounded-xl border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">Open {selectedPortal[0]} →</Link>
        </aside>
      </section>
    </WorkbenchShell>
  );
}

// ─── M&A Analysis ────────────────────────────────────────────────────────────
type MASector = { metric: string; quality: string; range: [number, number]; senior: number; total: number; cap_rate_range?: [number, number]; alt_metric?: string; alt_range?: [number, number] };

export function MAAnalysisPage() {
  const [sectors, setSectors] = useState<Record<string, MASector>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/intel/sectors`)
      .then(r => r.json())
      .then(d => { if (d.success) setSectors(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const qualityBadge = (q: string) => {
    if (q === "high") return "border-[#C4A048]/50 bg-[#C4A048]/15 text-[#C4A048]";
    if (q === "mid") return "border-[#7A9A82]/50 bg-[#7A9A82]/10 text-[#7A9A82]";
    return "border-white/20 bg-white/5 text-white/50";
  };

  const sectorLabel = (k: string) => k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const entries = Object.entries(sectors).sort(([, a], [, b]) => {
    const order = { high: 0, mid: 1, low: 2 };
    return (order[a.quality as keyof typeof order] ?? 2) - (order[b.quality as keyof typeof order] ?? 2);
  });

  return (
    <WorkbenchShell
      icon={Target}
      eyebrow="EagleEye Intelligence · M&A Sector Analysis"
      title="EBITDA multiples, leverage thresholds, and deal quality by sector."
      lede="Live sector multiples from Merlin. Senior leverage and total leverage caps derived from JP Morgan credit benchmarks. High-quality sectors carry higher senior advance capacity."
    >
      {loading && <p className="font-mono text-sm text-[#7A9A82] mt-4">Loading sector data…</p>}
      {!loading && entries.length === 0 && <p className="font-mono text-sm text-[#7A9A82] mt-4">No sector data available.</p>}
      {entries.length > 0 && (
        <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {entries.map(([key, s]) => (
            <article key={key} className="rounded-2xl border border-[#C4A048]/15 bg-[#0D2218]/80 p-4 hover:border-[#C4A048]/35 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-[Cormorant_Garamond] text-lg text-[#EDE8DC] leading-tight">{sectorLabel(key)}</h3>
                <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider ${qualityBadge(s.quality)}`}>{s.quality}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2 text-center">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">EV / {s.metric}</p>
                  <strong className="mt-1 block font-mono text-base text-[#C4A048]">{s.range[0]}–{s.range[1]}×</strong>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2 text-center">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">Senior</p>
                  <strong className="mt-1 block font-mono text-base text-emerald-300">{s.senior}×</strong>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2 text-center">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">Total</p>
                  <strong className="mt-1 block font-mono text-base text-amber-200">{s.total}×</strong>
                </div>
              </div>
              {s.cap_rate_range && (
                <p className="mt-2 font-mono text-[0.65rem] text-[#7A9A82]">Cap rate: {s.cap_rate_range[0]}–{s.cap_rate_range[1]}%</p>
              )}
              {s.alt_metric && s.alt_range && (
                <p className="mt-1 font-mono text-[0.65rem] text-[#7A9A82]">Alt: {s.alt_range[0]}–{s.alt_range[1]}× {s.alt_metric}</p>
              )}
            </article>
          ))}
        </section>
      )}
      <div className="mt-6 rounded-2xl border border-[#C4A048]/20 bg-[#0D2218]/60 p-4 font-mono text-xs text-[#7A9A82]">
        JP Morgan benchmark: A-grade requires DSCR &gt; 2.0, LTV &lt; 55%, D/EBITDA &lt; 4.5 · Sub-IG flag triggered at DSCR &lt; 1.5
      </div>
    </WorkbenchShell>
  );
}

// ─── Convergence Engine ───────────────────────────────────────────────────────
type ConvergenceSignal = { id: string; entity: string; type: string; date: string; details: string; location: string; state: string };

const SIGNAL_LABELS: Record<string, string> = {
  llc_formation: "LLC Formation", land_purchase: "Land Purchase", equity_raise: "Equity Raise",
  ucc_filing: "UCC Filing", building_permit: "Building Permit", tenant_vacancy_spike: "Vacancy Spike",
  cmbs_maturity: "CMBS Maturity", property_listed: "Property Listed", large_wire: "Wire Transfer",
  parent_acquisition: "Acquisition", surety_bond_filed: "Surety Bond", construction_loan_ucc: "Const. Loan",
  "8k_filing": "SEC 8-K", tax_lien: "Tax Lien", deed_transfer: "Deed Transfer",
  sc13d_filing: "SC 13D", merger_announcement: "Merger", officer_change: "Officer Change",
};

export function ConvergenceEnginePage() {
  const [signals, setSignals] = useState<ConvergenceSignal[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/convergence/signals`)
      .then(r => r.json())
      .then(d => { if (d.success) setSignals(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isConverged = (s: ConvergenceSignal) => !s.details.includes("single occurrence");
  const convergedEntities = new Set(signals.filter(isConverged).map(s => s.entity));

  const types = Array.from(new Set(signals.map(s => s.type))).sort();
  const shown = filter === "all" ? signals : filter === "converged" ? signals.filter(isConverged) : signals.filter(s => s.type === filter);

  return (
    <WorkbenchShell
      icon={RadioTower}
      eyebrow="EagleEye Intelligence · Convergence Engine"
      title="Multi-signal entity tracking. When signals converge, deals emerge."
      lede="Cross-referencing EMMA, SEC EDGAR, UCC filings, property records, and surety bonds. Entities with 2+ independent signals are flagged for deal origination review."
    >
      <div className="mt-4 flex flex-wrap gap-2 mb-4">
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#7A9A82] self-center mr-1">Filter:</span>
        {["all", "converged", ...types].map(t => (
          <button key={t} type="button"
            onClick={() => setFilter(t)}
            className={`rounded-xl border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider transition-colors ${filter === t ? "border-[#C4A048]/60 bg-[#C4A048]/15 text-[#C4A048]" : "border-white/15 bg-white/[0.03] text-[#7A9A82] hover:border-white/30"}`}>
            {t === "all" ? `All (${signals.length})` : t === "converged" ? `Converged (${signals.filter(isConverged).length})` : (SIGNAL_LABELS[t] || t)}
          </button>
        ))}
      </div>
      {loading && <p className="font-mono text-sm text-[#7A9A82]">Loading signals…</p>}
      <div className="grid gap-2">
        {shown.map(sig => {
          const converged = isConverged(sig);
          const entityConverged = convergedEntities.has(sig.entity);
          return (
            <article key={sig.id} className={`rounded-2xl border p-3 transition-colors ${converged ? "border-[#C4A048]/35 bg-[#0D2218]/90" : "border-white/[0.06] bg-[#0D2218]/50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-[Cormorant_Garamond] text-base ${entityConverged ? "text-[#E8C87A]" : "text-[#EDE8DC]"}`}>{sig.entity}</span>
                    {entityConverged && <span className="rounded border border-[#C4A048]/50 bg-[#C4A048]/15 px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider text-[#C4A048]">Convergence</span>}
                  </div>
                  <p className="mt-1 text-sm text-[#7A9A82] leading-snug">{sig.details}</p>
                  <p className="mt-1 font-mono text-[0.6rem] text-white/30">{sig.location} · {sig.state} · {new Date(sig.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider whitespace-nowrap ${converged ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-white/15 bg-white/[0.03] text-white/40"}`}>
                  {SIGNAL_LABELS[sig.type] || sig.type}
                </span>
              </div>
            </article>
          );
        })}
      </div>
      {!loading && shown.length === 0 && <p className="font-mono text-sm text-[#7A9A82] mt-2">No signals match this filter.</p>}
    </WorkbenchShell>
  );
}

// ─── Pipeline Workflow ────────────────────────────────────────────────────────
type WorkflowStage = { id: string; name: string; description: string; desk: string; gate_conditions: string[]; outputs: string[]; next: string | null };

export function WorkflowPage() {
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<DashPipeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/workflow/stages`)
      .then(r => r.json())
      .then(d => { if (d.success) { setStages(d.data); if (d.data.length) setActive(d.data[0].id); } })
      .catch(() => {})
      .finally(() => setLoading(false));
    fetch(`${API}/api/deals/pipeline`)
      .then(r => r.json())
      .then(d => { if (d.success) setPipeline(d.data); })
      .catch(() => {});
  }, []);

  const activeStage = stages.find(s => s.id === active);
  const deskLabel = (d: string) => d.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <WorkbenchShell
      icon={Layers3}
      eyebrow="Deal Pipeline · Workflow Engine"
      title="11-stage bond origination workflow from intake to ongoing surveillance."
      lede="Each stage has defined gate conditions, desk ownership, and mandatory outputs. No stage is skipped — the deterministic backend enforces transitions."
    >
      {pipeline && (
        <div className="mt-3 mb-5 flex flex-wrap gap-3">
          {[
            { label: "Total Pipeline", value: formatCompactCurrency(pipeline.total_pipeline_usd ?? 0) },
            { label: "Deals Tracked", value: String(pipeline.deal_count ?? 0) },
            ...(pipeline.by_status ? Object.entries(pipeline.by_status).map(([s, c]) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: String(c) })) : []),
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-[#C4A048]/20 bg-[#0D2218]/70 px-3 py-2">
              <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">{label}</span>
              <strong className="ml-2 font-mono text-sm text-[#C4A048]">{value}</strong>
            </div>
          ))}
        </div>
      )}
      {loading && <p className="font-mono text-sm text-[#7A9A82]">Loading stages…</p>}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="grid gap-2">
          {stages.map((s, i) => (
            <button key={s.id} type="button"
              onClick={() => setActive(s.id)}
              className={`w-full rounded-2xl border p-3 text-left transition-colors ${active === s.id ? "border-[#C4A048]/50 bg-[#C4A048]/10" : "border-white/[0.06] bg-[#0D2218]/60 hover:border-[#C4A048]/25"}`}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.6rem] text-[#7A9A82]">{String(i + 1).padStart(2, "0")}</span>
                <strong className="font-[Cormorant_Garamond] text-base text-[#EDE8DC]">{s.name}</strong>
                <span className="ml-auto font-mono text-[0.55rem] uppercase tracking-wider border border-[#7A9A82]/30 rounded px-1.5 py-0.5 text-[#7A9A82]">{deskLabel(s.desk)}</span>
              </div>
              <p className="mt-1 text-sm text-[#7A9A82] pl-6 leading-snug">{s.description}</p>
            </button>
          ))}
        </div>
        {activeStage && (
          <aside className="rounded-[1.35rem] border border-amber-300/25 bg-[#06101a]/90 p-5 self-start sticky top-4">
            <p className="kicker text-[#C4A048]"><Layers3 size={14} /> {deskLabel(activeStage.desk)}</p>
            <h2 className="mt-2 font-[Cormorant_Garamond] text-2xl text-white">{activeStage.name}</h2>
            <p className="mt-2 text-sm text-[#EDE8DC] leading-6">{activeStage.description}</p>
            {activeStage.gate_conditions.length > 0 && (
              <div className="mt-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[#C4A048] mb-2">Gate Conditions</p>
                <div className="grid gap-1">
                  {activeStage.gate_conditions.map(g => (
                    <span key={g} className="flex items-center gap-2 font-mono text-xs text-[#EDE8DC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4A048] shrink-0" />
                      {g.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {activeStage.outputs.length > 0 && (
              <div className="mt-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-emerald-300/70 mb-2">Stage Outputs</p>
                <div className="grid gap-1">
                  {activeStage.outputs.map(o => (
                    <span key={o} className="flex items-center gap-2 font-mono text-xs text-emerald-100/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {o.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {activeStage.next && (
              <p className="mt-4 font-mono text-[0.6rem] text-[#7A9A82]">Next stage → {stages.find(s => s.id === activeStage.next)?.name || activeStage.next}</p>
            )}
          </aside>
        )}
      </div>
    </WorkbenchShell>
  );
}

export function AgentsPage() {
  return (
    <WorkbenchShell
      icon={Bot}
      eyebrow="Docked agent fleet"
      title="Every agent is preserved as a governed institutional dock."
      lede="The redesign keeps Vector, Apex, Bond Optimizer, Merlin, Morgan, Aria, Sterling, SuretyScout, Auditor, Prometheus, Sentinel, LenderScout, Bridge, and the portal tools."
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Link href="/agents" className="portal-workflow-link inline-flex">Open live agent dashboard →</Link>
        <Link href="/operations/deals" className="portal-workflow-link inline-flex">Review deal-level agent switchboard →</Link>
      </div>
      <section className="workbench-agent-table">
        <div className="workbench-agent-row header"><span>Agent</span><span>Role</span><span>Dock</span><span>Control</span></div>
        {agentRows.map(([agent, role, dock, control]) => (
          <div className="workbench-agent-row" key={agent}>
            <strong>{agent}</strong>
            <span>{role}</span>
            <em>{dock}</em>
            <small>{control}</small>
          </div>
        ))}
      </section>
    </WorkbenchShell>
  );
}

// ─── Bond Workflow (re-uses pipeline WorkflowPage) ────────────────────────────
export function BondWorkflowPage() { return <WorkflowPage />; }

// ─── Bond Structure Analysis ──────────────────────────────────────────────────
type StructureResult = {
  tranches?: Array<{ name: string; amount: number; rate: number; ltc: number }>;
  total_debt?: number; total_ltc?: number; weighted_rate?: number;
  summary?: string; error?: string;
};

export function BondStructuringPage() {
  const [faceAmount, setFaceAmount] = useState(50_000_000);
  const [assetClass, setAssetClass] = useState("cre");
  const [seniorAdv, setSeniorAdv] = useState(75);
  const [mezzAdv, setMezzAdv] = useState(7);
  const [seniorRate, setSeniorRate] = useState(6.75);
  const [mezzRate, setMezzRate] = useState(11.5);
  const [structResult, setStructResult] = useState<StructureResult | null>(null);
  const [structLoading, setStructLoading] = useState(false);

  const runStructure = async () => {
    setStructLoading(true);
    try {
      const tranches = [
        { name: "Series A Senior", amount: Math.round(faceAmount * seniorAdv / 100), rate: seniorRate, ltc: seniorAdv },
        ...(mezzAdv > 0 ? [{ name: "Series B Mezzanine", amount: Math.round(faceAmount * mezzAdv / 100), rate: mezzRate, ltc: mezzAdv }] : []),
      ];
      const res = await fetch(`${API}/api/bond-structuring/structure`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: "demo", face_amount: faceAmount, asset_class: assetClass, tranches }),
      });
      const d = await res.json();
      if (d.success) setStructResult(d.data); else setStructResult({ error: d.error || "Structure failed" });
    } catch { setStructResult({ error: "Backend unreachable" }); }
    finally { setStructLoading(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);

  return (
    <WorkbenchShell icon={Landmark} eyebrow="Bond Desk · Structure Analysis"
      title="Capital stack designer. A/B tranche sizing with JP Morgan credit benchmarks."
      lede="Configure tranches. Backend validates DSCR floor, LTV cap, and leverage thresholds.">
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="rounded-[1.35rem] border border-[#C4A048]/25 bg-[#06101a]/90 p-5">
          <p className="kicker text-[#C4A048]"><Landmark size={14} /> Structure inputs</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {([
              ["Face ($M)", faceAmount / 1e6, 10, 500, 5, (v: number) => setFaceAmount(v * 1e6)],
              ["Senior %", seniorAdv, 50, 78, 1, setSeniorAdv],
              ["B Tranche %", mezzAdv, 0, 20, 1, setMezzAdv],
              ["Senior Rate %", seniorRate, 4.0, 9.0, 0.25, setSeniorRate],
              ["Mezz Rate %", mezzRate, 6.0, 16.0, 0.25, setMezzRate],
            ] as const).map(([label, val, min, max, step, setter]) => (
              <label key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="flex justify-between font-mono text-[0.68rem] uppercase tracking-wider text-[#EDE8DC]">
                  {label}<strong className="text-amber-200">{String(Number(val).toFixed(step < 1 ? 2 : 0))}</strong>
                </span>
                <input type="range" min={min} max={max} step={step} value={Number(val)} onChange={e => (setter as (v: number) => void)(Number(e.target.value))} className="mt-2 w-full accent-amber-400" />
              </label>
            ))}
            <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#EDE8DC]">Asset Class</span>
              <select value={assetClass} onChange={e => setAssetClass(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#030A06] px-2 py-1 font-mono text-xs text-[#EDE8DC]">
                {["cre","multifamily","industrial","healthcare","hospitality","mixed_use"].map(c => <option key={c} value={c}>{c.replace(/_/g," ")}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-[#7A9A82]">Senior: <span className="text-[#C4A048]">{fmt(faceAmount * seniorAdv / 100)}</span></div>
            {mezzAdv > 0 && <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-[#7A9A82]">Mezz: <span className="text-fuchsia-200">{fmt(faceAmount * mezzAdv / 100)}</span></div>}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-[#7A9A82]">CLTV: <span className="text-amber-200">{(seniorAdv + mezzAdv).toFixed(0)}%</span></div>
          </div>
          <button type="button" onClick={runStructure} disabled={structLoading} className="mt-4 rounded-xl border border-[#C4A048]/40 bg-[#C4A048]/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#C4A048] disabled:opacity-50">
            {structLoading ? "Structuring…" : "Run Structure Analysis →"}
          </button>
          <CNSSignalMonitor defaultSignal="dscr_change" showDscrFast />
        </div>
        <aside className="rounded-[1.35rem] border border-amber-300/25 bg-[#06101a]/90 p-5 self-start">
          <p className="kicker text-[#C4A048] mb-3"><ShieldCheck size={14} /> JP Morgan benchmarks</p>
          <div className="grid gap-2 font-mono text-xs mb-4">
            {[["A-grade","DSCR>2.0 LTV<55% D/E<4.5","text-[#C4A048]"],["BBB+","DSCR>1.75 LTV<62% D/E<5.5","text-amber-200"],["BBB-","DSCR>1.5 LTV<70% D/E<6.5","text-[#7A9A82]"],["Sub-IG","DSCR<1.5 = sub-IG","text-red-300"]].map(([g,c,col]) => (
              <div key={g as string} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"><span className={col as string}>{g}</span><span className="ml-2 text-white/50">{c}</span></div>
            ))}
          </div>
          {structResult && !structResult.error && (
            <>
              <p className="kicker text-emerald-300 mb-2"><Activity size={14} /> Output</p>
              {structResult.tranches?.map(t => (
                <div key={t.name} className="mb-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-2">
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-emerald-200">{t.name}</span>
                  <div className="mt-1 flex gap-3 font-mono text-xs text-[#EDE8DC]"><span>{fmt(t.amount)}</span><span>{t.rate}%</span><span>{t.ltc}% LTC</span></div>
                </div>
              ))}
              {structResult.weighted_rate !== undefined && <p className="mt-1 font-mono text-[0.65rem] text-[#7A9A82]">Wtd cost: <span className="text-[#C4A048]">{structResult.weighted_rate.toFixed(2)}%</span></p>}
              {structResult.summary && <p className="mt-2 text-xs text-[#EDE8DC]">{structResult.summary}</p>}
            </>
          )}
          {structResult?.error && <p className="mt-3 font-mono text-xs text-red-300">{structResult.error}</p>}
        </aside>
      </div>
    </WorkbenchShell>
  );
}

// ─── Bond Grade / Audit ───────────────────────────────────────────────────────
type RatingResult = { moodys?: string; sp?: string; strategy?: string; rationale?: string; error?: string };

export function BondGradeAuditPage() {
  const [dscr, setDscr] = useState(1.85);
  const [ltv, setLtv] = useState(62);
  const [debtEbitda, setDebtEbitda] = useState(5.2);
  const [icr, setIcr] = useState(2.9);
  const [ratingResult, setRatingResult] = useState<RatingResult | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  const runRating = async () => {
    setRatingLoading(true);
    try {
      const res = await fetch(`${API}/api/rating/dual`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dscr, ltv: ltv / 100, debt_to_ebitda: debtEbitda, icr }),
      });
      const d = await res.json();
      if (d.success) setRatingResult(d.data); else setRatingResult({ error: d.error || "Rating failed" });
    } catch { setRatingResult({ error: "Backend unreachable" }); }
    finally { setRatingLoading(false); }
  };

  const gradeColor = (g?: string) => !g ? "text-[#7A9A82]" : g.startsWith("A") ? "text-[#C4A048]" : g[0] === "B" ? "text-amber-200" : "text-red-300";

  return (
    <WorkbenchShell icon={ShieldCheck} eyebrow="Bond Desk · Grade Audit"
      title="Mirror Agent dual-prediction. Moody's and S&P equivalent rating from live credit metrics."
      lede="Enter DSCR, LTV, D/EBITDA, and ICR. Mirror Agent predicts equivalent bond grades and rating strategy.">
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="rounded-[1.35rem] border border-[#C4A048]/25 bg-[#06101a]/90 p-5">
          <p className="kicker text-[#C4A048]"><ShieldCheck size={14} /> Credit metrics</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {([
              ["DSCR", dscr, 0.8, 4.0, 0.05, setDscr, "Debt Service Coverage"],
              ["LTV %", ltv, 30, 90, 1, setLtv, "Loan to Value"],
              ["D/EBITDA", debtEbitda, 1.0, 10.0, 0.1, setDebtEbitda, "Debt / EBITDA"],
              ["ICR", icr, 1.0, 6.0, 0.05, setIcr, "Interest Coverage"],
            ] as const).map(([label, val, min, max, step, setter, full]) => (
              <label key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="flex justify-between font-mono text-[0.68rem] uppercase tracking-wider text-[#EDE8DC]">
                  {label}<strong className="text-amber-200">{Number(val).toFixed(step < 1 ? 2 : 0)}</strong>
                </span>
                <p className="font-mono text-[0.55rem] text-white/30 mb-1">{full}</p>
                <input type="range" min={min} max={max} step={step} value={Number(val)} onChange={e => (setter as (v: number) => void)(Number(e.target.value))} className="w-full accent-amber-400" />
              </label>
            ))}
          </div>
          <button type="button" onClick={runRating} disabled={ratingLoading} className="mt-4 rounded-xl border border-[#C4A048]/40 bg-[#C4A048]/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#C4A048] disabled:opacity-50">
            {ratingLoading ? "Running Mirror Agent…" : "Run Rating Prediction →"}
          </button>
          <CNSSignalMonitor defaultSignal="dscr_change" showDscrFast />
        </div>
        <aside className="rounded-[1.35rem] border border-amber-300/25 bg-[#06101a]/90 p-5 self-start">
          {ratingResult && !ratingResult.error ? (
            <>
              <p className="kicker text-[#C4A048] mb-3"><Target size={14} /> Mirror Agent prediction</p>
              <div className="grid gap-2">
                <div className="rounded-xl border border-[#C4A048]/25 bg-[#C4A048]/10 p-3 text-center">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">Moody's Equivalent</p>
                  <strong className={`mt-1 block font-mono text-3xl ${gradeColor(ratingResult.moodys)}`}>{ratingResult.moodys || "—"}</strong>
                </div>
                <div className="rounded-xl border border-[#C4A048]/25 bg-[#C4A048]/10 p-3 text-center">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">S&P Equivalent</p>
                  <strong className={`mt-1 block font-mono text-3xl ${gradeColor(ratingResult.sp)}`}>{ratingResult.sp || "—"}</strong>
                </div>
              </div>
              {ratingResult.strategy && <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-2 font-mono text-xs text-emerald-100">{ratingResult.strategy}</p>}
              {ratingResult.rationale && <p className="mt-2 text-sm text-[#EDE8DC]">{ratingResult.rationale}</p>}
            </>
          ) : ratingResult?.error ? (
            <p className="font-mono text-xs text-red-300">{ratingResult.error}</p>
          ) : (
            <>
              <p className="kicker text-[#C4A048] mb-3"><ShieldCheck size={14} /> JP Morgan thresholds</p>
              <div className="grid gap-2 font-mono text-xs">
                {[["A-grade","DSCR 2.0 LTV 55% D/E 4.5 ICR 3.5"],["BBB+","DSCR 1.75 LTV 62% D/E 5.5 ICR 2.75"],["BBB-","DSCR 1.5 LTV 70% D/E 6.5 ICR 2.25"]].map(([g,t]) => (
                  <div key={g} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"><span className="text-[#C4A048]">{g}</span><span className="ml-2 text-white/50">{t}</span></div>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </WorkbenchShell>
  );
}

// ─── Due Diligence ────────────────────────────────────────────────────────────
type DDItem = { id: string; title: string; status: string; category: string; notes?: string };
type DDPhase = { phase: string; items: DDItem[]; completion_pct: number };
type DDChecklist = { deal_id: string; phases?: DDPhase[]; overall_completion?: number; shovel_ready?: boolean };

export function DueDiligencePage() {
  const [deals, setDeals] = useState<Array<{ id: string; name: string }>>([]);
  const [dealId, setDealId] = useState("demo");
  const [checklist, setChecklist] = useState<DDChecklist | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/deals`)
      .then(r => r.json())
      .then(d => {
        const list = d.data?.deals || d.data || [];
        if (Array.isArray(list) && list.length) { setDeals(list); setDealId(list[0].id); }
      }).catch(() => {});
  }, []);

  const initChecklist = () => {
    fetch(`${API}/api/dd/${dealId}/init`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
      .then(() => loadChecklist(dealId)).catch(() => {});
  };

  const loadChecklist = (id: string) => {
    setLoading(true);
    fetch(`${API}/api/dd/${id}/checklist`)
      .then(r => r.json())
      .then(d => { if (d.success) setChecklist(d.data); else setChecklist({ deal_id: id }); })
      .catch(() => setChecklist({ deal_id: id }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (dealId) loadChecklist(dealId); }, [dealId]);

  const statusColor = (s: string) => s === "complete" ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" : s === "in_progress" ? "text-amber-200 border-amber-400/30 bg-amber-400/10" : "text-[#7A9A82] border-white/10 bg-white/[0.03]";

  return (
    <WorkbenchShell icon={FileCheck2} eyebrow="Phoenix Distressed CRE · Due Diligence"
      title="8-phase DD checklist. Shovel-ready assessment across legal, environmental, financial, and structural criteria."
      lede="Initialize DD for any deal. Track phase completion, item status, and overall readiness gate.">
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {deals.length > 0 && (
          <select value={dealId} onChange={e => setDealId(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#030A06] px-3 py-2 font-mono text-xs text-[#EDE8DC]">
            {deals.map(d => <option key={d.id} value={d.id}>{d.name || d.id}</option>)}
          </select>
        )}
        <button type="button" onClick={initChecklist}
          className="rounded-xl border border-[#C4A048]/40 bg-[#C4A048]/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#C4A048]">
          Initialize DD →
        </button>
        {checklist?.overall_completion !== undefined && (
          <span className="font-mono text-xs text-[#7A9A82]">Overall: <strong className="text-[#C4A048]">{checklist.overall_completion}%</strong></span>
        )}
        {checklist?.shovel_ready !== undefined && (
          <span className={`rounded-xl border px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider ${checklist.shovel_ready ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-300"}`}>
            {checklist.shovel_ready ? "Shovel Ready" : "Not Shovel Ready"}
          </span>
        )}
      </div>
      {loading && <p className="mt-4 font-mono text-sm text-[#7A9A82]">Loading checklist…</p>}
      {checklist?.phases && (
        <div className="mt-4 grid gap-3">
          {checklist.phases.map(phase => (
            <div key={phase.phase} className="rounded-[1.35rem] border border-white/[0.06] bg-[#0D2218]/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-[Cormorant_Garamond] text-lg text-[#EDE8DC]">{phase.phase}</h3>
                <span className="font-mono text-xs text-[#C4A048]">{phase.completion_pct ?? 0}%</span>
              </div>
              <div className="grid gap-1.5">
                {(phase.items || []).map(item => (
                  <div key={item.id} className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-[#030A06]/50 px-3 py-2">
                    <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider ${statusColor(item.status)}`}>{item.status}</span>
                    <span className="text-sm text-[#EDE8DC] leading-snug">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !checklist?.phases && (
        <div className="mt-6 rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/60 p-6 text-center">
          <p className="font-mono text-sm text-[#7A9A82]">No DD checklist found for this deal.</p>
          <p className="mt-1 font-mono text-xs text-[#7A9A82]/60">Click "Initialize DD →" to generate the 8-phase checklist.</p>
        </div>
      )}
    </WorkbenchShell>
  );
}

// ─── HFT Fund / Quantum ───────────────────────────────────────────────────────
type FundPosition = { client_id: string; invested_amount: number; current_value: number; days_active: number; b_tranche_units: number };
type FundYield = { gross_return: number; b_coupon: number; mgmt_fee: number; net_return: number; annualized_return_pct: number };
type FundDist = { date: string; amount: number; type: string; description: string };

export function HFTFundPage() {
  const [position, setPosition] = useState<FundPosition | null>(null);
  const [yieldData, setYieldData] = useState<FundYield | null>(null);
  const [distributions, setDistributions] = useState<FundDist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = `${API}/api/fund`;
    Promise.all([
      fetch(`${base}/position`).then(r => r.json()),
      fetch(`${base}/yield`).then(r => r.json()),
      fetch(`${base}/distributions`).then(r => r.json()),
    ]).then(([p, y, d]) => {
      // position: raw object, no {data} wrapper
      if (p.client_id || p.invested_amount) setPosition(p);
      // yield: also raw, field names differ from type definition
      if (y.gross_return !== undefined) {
        setYieldData({
          gross_return: y.gross_return,
          b_coupon: y.b_coupon_paid ?? y.b_coupon ?? 0,
          mgmt_fee: y.management_fee ?? y.mgmt_fee ?? 0,
          net_return: y.net_to_client ?? y.net_return ?? 0,
          annualized_return_pct: (y.annualized_yield_pct ?? y.annualized_return_pct ?? 0) / 100,
        });
      }
      // distributions: returned as raw array, not wrapped
      const dist = Array.isArray(d) ? d : d.data?.distributions || d.distributions || [];
      setDistributions(dist);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n ?? 0);
  const pct = (n: number) => `${((n ?? 0) * 100).toFixed(2)}%`;

  return (
    <WorkbenchShell icon={TrendingUp} eyebrow="Treasury · HFT Fund / Quantum Agent"
      title="$32.4M AUM. B-tranche proceeds deployed via Quantum agent into high-frequency Treasury strategy."
      lede="21.3% YTD target return. Distributions quarterly. Working capital credit line available at 80% NAV.">
      {loading && <p className="mt-4 font-mono text-sm text-[#7A9A82]">Loading Quantum position…</p>}
      {position && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Invested", value: fmt(position.invested_amount) },
            { label: "Current NAV", value: fmt(position.current_value) },
            { label: "Days Active", value: String(position.days_active) },
            { label: "B-Tranche Units", value: (position.b_tranche_units ?? 0).toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">{label}</p>
              <strong className="mt-1 block font-mono text-2xl text-[#C4A048]">{value}</strong>
            </div>
          ))}
        </div>
      )}
      {yieldData && (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[1.35rem] border border-[#C4A048]/25 bg-[#06101a]/90 p-5">
            <p className="kicker text-[#C4A048] mb-3"><TrendingUp size={14} /> Yield breakdown</p>
            <div className="grid gap-2 font-mono text-xs">
              {([
                ["Gross Return", fmt(yieldData.gross_return)],
                ["B-Tranche Coupon", fmt(yieldData.b_coupon)],
                ["Mgmt Fee", `(${fmt(yieldData.mgmt_fee)})`],
                ["Net Return", fmt(yieldData.net_return)],
                ["Annualized Return", `${pct(yieldData.annualized_return_pct)}`],
              ] as const).map(([label, val]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className="text-[#7A9A82]">{label}</span>
                  <span className={label === "Annualized Return" ? "text-[#C4A048] font-bold" : "text-[#EDE8DC]"}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          {distributions.length > 0 && (
            <div className="rounded-[1.35rem] border border-[#C4A048]/25 bg-[#06101a]/90 p-5">
              <p className="kicker text-[#C4A048] mb-3"><CircleDollarSign size={14} /> Distributions</p>
              <div className="grid gap-2">
                {distributions.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div><p className="font-mono text-xs text-[#EDE8DC]">{d.description || d.type}</p><p className="font-mono text-[0.6rem] text-[#7A9A82]">{d.date}</p></div>
                    <strong className="font-mono text-sm text-emerald-300">{fmt(d.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {!loading && !position && (
        <div className="mt-6 rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/60 p-6 text-center">
          <p className="font-mono text-sm text-[#7A9A82]">Quantum position unavailable — backend initializing.</p>
        </div>
      )}
    </WorkbenchShell>
  );
}

// ─── Preflight Interview ──────────────────────────────────────────────────────
type PFQuestion = { id: string; question: string; credit_memo_section?: string; why?: string; why_it_matters?: string; brainstorm?: string };
type PFSection = { section?: string; id?: string; credit_memo_section?: string; questions: PFQuestion[] };
type PFStatus = { total: number; answered: number; completion_pct: number; ready_for_memo: boolean };

export function PreflightPage() {
  const [deals, setDeals] = useState<Array<{ id: string; name: string }>>([]);
  const [dealId, setDealId] = useState("demo");
  const [sections, setSections] = useState<PFSection[]>([]);
  const [status, setStatus] = useState<PFStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeQ, setActiveQ] = useState<PFQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    fetch(`${API}/api/deals`)
      .then(r => r.json())
      .then(d => {
        const list = d.data?.deals || d.data || [];
        if (Array.isArray(list) && list.length) { setDeals(list); setDealId(list[0].id); }
      }).catch(() => {});
  }, []);

  const loadQuestions = (id: string) => {
    setLoading(true);
    fetch(`${API}/api/preflight/${id}/questions`)
      .then(r => r.json())
      .then(d => { if (d.success) { setSections(d.data.sections || []); setStatus(d.data.status || null); } })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { if (dealId) loadQuestions(dealId); }, [dealId]);

  const submitAnswer = async () => {
    if (!activeQ || !answerText.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API}/api/preflight/${dealId}/answer`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: activeQ.id, answer: answerText }),
      });
      setAnswers(prev => ({ ...prev, [activeQ.id]: answerText }));
      setAnswerText(""); setActiveQ(null);
      loadQuestions(dealId);
    } finally { setSaving(false); }
  };

  return (
    <WorkbenchShell icon={Bot} eyebrow="Deal Pipeline · Preflight Interview"
      title="Bernard-driven Q&A for credit memo completion. Answer structured questions to auto-populate the deal record."
      lede="Each answer feeds the credit memo engine. Complete all sections to unlock memo generation.">
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {deals.length > 0 && (
          <select value={dealId} onChange={e => setDealId(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#030A06] px-3 py-2 font-mono text-xs text-[#EDE8DC]">
            {deals.map(d => <option key={d.id} value={d.id}>{d.name || d.id}</option>)}
          </select>
        )}
        {status && (
          <>
            <span className="font-mono text-xs text-[#7A9A82]">{status.answered}/{status.total} answered</span>
            <span className={`rounded-xl border px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider ${status.ready_for_memo ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>
              {status.ready_for_memo ? "Ready for Memo" : `${status.completion_pct ?? 0}% complete`}
            </span>
          </>
        )}
      </div>
      {loading && <p className="mt-4 font-mono text-sm text-[#7A9A82]">Loading questions…</p>}
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="grid gap-3">
          {sections.map(sec => (
            <div key={sec.id ?? sec.section ?? sec.credit_memo_section} className="rounded-[1.35rem] border border-white/[0.06] bg-[#0D2218]/60 p-4">
              <h3 className="font-[Cormorant_Garamond] text-lg text-[#EDE8DC] mb-2">{sec.credit_memo_section ?? sec.section}</h3>
              {sec.questions.map(q => (
                <button key={q.id} type="button" onClick={() => { setActiveQ(q); setAnswerText(answers[q.id] || ""); }}
                  className={`w-full text-left rounded-xl border p-2 mb-1.5 transition-colors ${activeQ?.id === q.id ? "border-[#C4A048]/50 bg-[#C4A048]/10" : answers[q.id] ? "border-emerald-400/20 bg-emerald-400/5" : "border-white/[0.06] hover:border-[#C4A048]/25"}`}>
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${answers[q.id] ? "bg-emerald-400" : "bg-white/20"}`} />
                    <span className="text-sm text-[#EDE8DC] leading-snug">{q.question}</span>
                  </div>
                  {answers[q.id] && <p className="mt-1 pl-4 font-mono text-[0.65rem] text-[#7A9A82] truncate">{answers[q.id]}</p>}
                </button>
              ))}
            </div>
          ))}
          {!loading && sections.length === 0 && (
            <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/60 p-6 text-center">
              <p className="font-mono text-sm text-[#7A9A82]">No questions loaded for this deal.</p>
            </div>
          )}
        </div>
        {activeQ && (
          <aside className="rounded-[1.35rem] border border-amber-300/25 bg-[#06101a]/90 p-5 self-start sticky top-4">
            <p className="kicker text-[#C4A048] mb-2"><Bot size={14} /> Bernard asks</p>
            <p className="text-sm text-[#EDE8DC] leading-6 mb-3">{activeQ.question}</p>
            {(activeQ.why ?? activeQ.why_it_matters ?? activeQ.brainstorm) && <p className="font-mono text-[0.65rem] text-[#7A9A82] mb-3 italic">{activeQ.why ?? activeQ.why_it_matters ?? activeQ.brainstorm}</p>}
            <textarea
              value={answerText} onChange={e => setAnswerText(e.target.value)}
              rows={4} placeholder="Enter your answer…"
              className="w-full rounded-xl border border-white/10 bg-[#030A06] px-3 py-2 font-mono text-xs text-[#EDE8DC] placeholder-white/20 resize-none focus:outline-none focus:border-[#C4A048]/40" />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={submitAnswer} disabled={saving || !answerText.trim()}
                className="flex-1 rounded-xl border border-[#C4A048]/40 bg-[#C4A048]/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#C4A048] disabled:opacity-50">
                {saving ? "Saving…" : "Submit Answer →"}
              </button>
              <button type="button" onClick={() => setActiveQ(null)}
                className="rounded-xl border border-white/10 px-3 py-2 font-mono text-xs text-[#7A9A82]">✕</button>
            </div>
          </aside>
        )}
      </div>
    </WorkbenchShell>
  );
}
