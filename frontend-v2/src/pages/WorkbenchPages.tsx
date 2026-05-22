/*
Design philosophy for this file: Bloomberg Terminal x Spider-Verse institutional command cockpit.
These routed workbench pages must preserve every NEST module as a docked institutional capability, showing role-specific command surfaces rather than placeholder routes.
*/
import { useMemo, useState, type ReactNode } from "react";
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
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

const TREE_LOGO = "/nest-logo.webp";

const cnsLayerRows = [
  ["Universal Connector Power Strip", "MSRB/EMMA, FRED, Treasury, SEC EDGAR, rating references, surety carriers, CRM, document vault, licensed feeds", "Source timestamp, entitlement, provenance, connector health"],
  ["NEST Agent / Tool Power Strip", "Vector, Apex, Bond Optimizer, Merlin, Morgan, Aria, Sterling, SuretyScout, Auditor, Prometheus, Sentinel, LenderScout, Bridge", "Owner, input evidence, output type, approval status"],
  ["Curated AI Brain", "Routing, retrieval, gap detection, memo drafting, scenario comparison, compliance assist", "Cannot bypass deterministic backend execution"],
  ["Deterministic Execution Backend", "RBAC, workflow state, APIs, databases, queues, approvals, audit logs, retention", "Code decides what runs, who can see it, and what record is written"],
] as const;

const dashboardCards = [
  ["Document Nervous System", "18 lanes", "Evidence graph, document vault, OCR, approvals, and retained records.", "/roots"],
  ["Rating / Grading Room", "74% ready", "Bond grade, feasibility, credit memo, risk flags, and missing-item schedule.", "/rating-intelligence"],
  ["Surety & Insurance", "A path", "SuretyScout, underwriting packet, insurance evidence, and provider handoff.", "/insurance-surety"],
  ["Bond Desk", "$173M demo", "Market pricing, call/put review, M&A locator, placement book, and investor follow-up.", "/bond-desk"],
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

export function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const dealsQuery = trpc.deals.list.useQuery(undefined, { enabled: isAuthenticated });
  const approvalsQuery = trpc.approvals.listPending.useQuery(undefined, { enabled: isAuthenticated });
  const targetsQuery = trpc.mTargets.list.useQuery(undefined, { enabled: isAuthenticated });

  const deals = dealsQuery.data ?? [];
  const approvals = approvalsQuery.data ?? [];
  const targets = targetsQuery.data ?? [];
  const activeDealId = deals[0]?.id ?? 0;
  const activeBondInput = useMemo(() => ({ dealId: activeDealId }), [activeDealId]);
  const bondsQuery = trpc.bonds.listByDeal.useQuery(activeBondInput, { enabled: isAuthenticated && activeDealId > 0 });
  const activeBonds = bondsQuery.data ?? [];

  const portfolioFaceValue = useMemo(
    () => deals.reduce((sum, deal) => sum + numberFromMoneyLike(deal.amount), 0),
    [deals]
  );
  const activeBondFaceValue = useMemo(
    () => activeBonds.reduce((sum, bond) => sum + numberFromMoneyLike(bond.size), 0),
    [activeBonds]
  );

  const livePortfolioMetrics = useMemo(
    () => [
      { label: "Portfolio deals", value: String(deals.length), detail: isAuthenticated ? "tRPC deals.list live count" : "Sign in to hydrate backend pipeline", icon: Activity },
      { label: "Bond face value", value: activeBondFaceValue > 0 ? formatCompactCurrency(activeBondFaceValue) : formatCompactCurrency(portfolioFaceValue), detail: activeBondFaceValue > 0 ? "Active-deal bond tranches" : "Portfolio deal amount proxy", icon: CircleDollarSign },
      { label: "Pending approvals", value: String(approvals.length), detail: approvals.length ? "Human gates awaiting action" : "No pending human gates", icon: ShieldCheck },
      { label: "M&A targets", value: String(targets.length), detail: targets.length ? "Merlin target scorecards loaded" : "Target universe ready", icon: Target },
    ],
    [activeBondFaceValue, approvals.length, deals.length, isAuthenticated, portfolioFaceValue, targets.length]
  );

  const statusRows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const deal of deals) counts.set(deal.status ?? "draft", (counts.get(deal.status ?? "draft") ?? 0) + 1);
    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
  }, [deals]);

  return (
    <WorkbenchShell
      icon={Activity}
      eyebrow="Institutional dashboard"
      title="Live portfolio command view across documents, grading, surety, and placement."
      lede="The dashboard proves the redesign is not deleting systems. It reorganizes every preserved capability into synchronized institutional desks and hydrates the top line from the backend where authenticated data exists."
    >
      {!isAuthenticated ? (
        <section className="mb-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          Backend portfolio metrics are protected. <a className="underline decoration-amber-200/60 underline-offset-4" href={getLoginUrl()}>Sign in</a> to view live tRPC deal, approval, bond, and M&A counts.
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Live portfolio metrics">
        {livePortfolioMetrics.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-cyan-300/20 bg-[#06101a]/85 p-4 shadow-[0_0_36px_rgba(34,211,238,0.08)]">
            <div className="flex items-center justify-between gap-3 text-cyan-100">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan-200/80">{label}</span>
              <Icon size={16} />
            </div>
            <strong className="mt-3 block font-mono text-3xl text-white">{value}</strong>
            <p className="mt-2 text-sm text-slate-300">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="workbench-card-grid">
          {dashboardCards.map(([name, metric, copy, href]) => (
            <Link className="workbench-card module-link-card" href={href} key={name}>
              <span>{name}</span>
              <strong>{metric}</strong>
              <p>{copy}</p>
              <em>Open working module →</em>
            </Link>
          ))}
        </div>
        <aside className="rounded-2xl border border-amber-300/25 bg-[#080d14]/88 p-4">
          <p className="kicker"><TrendingUp size={14} /> Deal status rail</p>
          <div className="mt-3 grid gap-2">
            {(statusRows.length ? statusRows : [{ status: "intake", count: 0 }, { status: "underwriting", count: 0 }, { status: "closing", count: 0 }]).map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-sm">
                <span className="uppercase tracking-[0.12em] text-slate-300">{status}</span>
                <strong className="text-amber-200">{count}</strong>
              </div>
            ))}
          </div>
          <Link href="/operations/deals" className="mt-4 inline-flex rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100">Open deal pipeline →</Link>
        </aside>
      </section>

      <section className="workbench-wide-panel">
        <h2>Preservation operating rule</h2>
        <p>Every feature must state what it ingests, what decision it supports, who approves the result, and what record is retained. That rule converts breadth into institutional governance.</p>
      </section>
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
            <p className="mt-2 text-sm leading-6 text-slate-300">Adjust leverage, mezzanine participation, surety coverage, reserves, and spread assumptions. The output remains frontend-demo simulated until a human committee approves a backend bond record.</p>
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
                <span className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate-300">
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
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-slate-400">{label}</span>
              <strong className={`mt-2 block font-mono text-xl ${tone === "cyan" ? "text-cyan-200" : tone === "violet" ? "text-fuchsia-200" : tone === "gold" ? "text-amber-200" : tone === "green" ? "text-emerald-200" : "text-red-200"}`}>{formatCompactCurrency(Number(value) * 1_000_000)}</strong>
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
            <article key={name} className={`portal-workflow-link ${activePortal === name ? "border-cyan-300/55 bg-cyan-300/10" : ""}`} data-testid="portal-entry-point">
              <button type="button" onClick={() => setActivePortal(name)} className="block w-full text-left">
                <h2>{name}</h2>
                <p>{copy}</p>
              </button>
              <Link href={href} className="mt-3 inline-flex font-mono text-xs uppercase tracking-[0.12em] text-cyan-100">Launch governed workspace →</Link>
            </article>
          ))}
        </div>
        <aside className="rounded-[1.35rem] border border-amber-300/30 bg-[#06101a]/90 p-5">
          <p className="kicker"><FileCheck2 size={14} /> Active portal path</p>
          <h2 className="mt-2 font-mono text-2xl uppercase tracking-[0.08em] text-white">{selectedPortal[0]}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{selectedPortal[3]}</p>
          <div className="mt-4 grid gap-2 font-mono text-xs uppercase tracking-[0.12em] text-slate-300">
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
