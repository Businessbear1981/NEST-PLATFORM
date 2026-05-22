import { lazy, Suspense, type ReactNode, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  Layers3,
  Loader2,
  ShieldCheck,
  Target,
  Users,
  Wallet,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AgentTelemetryGraphic } from "@/components/AgentTelemetryGraphic";
import { ApprovalRail } from "@/components/ApprovalRail";
const BondStackDesk = lazy(() => import("@/components/BondStackDesk").then((module) => ({ default: module.BondStackDesk })));
const CovenantsDashboard = lazy(() => import("@/components/CovenantsDashboard").then((module) => ({ default: module.CovenantsDashboard })));
const DrawsManagement = lazy(() => import("@/components/DrawsManagement").then((module) => ({ default: module.DrawsManagement })));
const MADeskComponent = lazy(() => import("@/components/MADeskComponent").then((module) => ({ default: module.MADeskComponent })));
const TenantRoster = lazy(() => import("@/components/TenantRoster"));
const RootsWorkspace = lazy(() => import("@/components/RootsWorkspace"));
const ClientDepositPlatform = lazy(() => import("@/components/ClientDepositPlatform").then((module) => ({ default: module.ClientDepositPlatform })));
const CompleteSuretyModule = lazy(() => import("@/components/CompleteSuretyModule").then((module) => ({ default: module.CompleteSuretyModule })));
const RatingIntelligence = lazy(() => import("@/components/RatingIntelligence"));
const DealIntakeModeling = lazy(() => import("@/components/DealIntakeModeling").then((module) => ({ default: module.DealIntakeModeling })));
const AdminPlatform = lazy(() => import("@/components/AdminPlatform").then((module) => ({ default: module.AdminPlatform })));
const CompliancePortal = lazy(() => import("@/components/CompliancePortal").then((module) => ({ default: module.CompliancePortal })));
const LiveAgentDashboard = lazy(() => import("@/components/LiveAgentDashboard").then((module) => ({ default: module.LiveAgentDashboard })));
const TreasuryDesk = lazy(() => import("@/components/TreasuryDesk").then((module) => ({ default: module.TreasuryDesk })));
const PhoenixDesk = lazy(() => import("@/components/PhoenixDesk").then((module) => ({ default: module.PhoenixDesk })));

const TREE_LOGO = "/nest-logo.webp";
const HERO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'%3E%3Crect fill='%23060E1A' width='1200' height='600'/%3E%3C/svg%3E";

function LazyWorkspace({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="rounded-[1.25rem] border border-cyan-300/25 bg-cyan-300/10 p-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan-100">
          Loading active workspace
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const terminalInput = "rounded-xl border border-cyan-300/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-300/10";
const terminalButton = "rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.13)] transition hover:bg-amber-300/20 disabled:opacity-60";

function formatMoney(value?: string | number | null) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "$0";
  if (Math.abs(numeric) >= 1_000_000) return `$${(numeric / 1_000_000).toFixed(1)}M`;
  if (Math.abs(numeric) >= 1_000) return `$${(numeric / 1_000).toFixed(0)}K`;
  return `$${numeric.toLocaleString()}`;
}

function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function MetricCard({ label, value, detail, icon: Icon, tone = "cyan" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "cyan" | "gold" | "red" | "green" | "violet" }) {
  const toneMap = {
    cyan: "border-cyan-300/30 bg-cyan-400/8 text-cyan-200 shadow-[0_0_34px_rgba(34,211,238,0.12)]",
    gold: "border-amber-300/35 bg-amber-300/9 text-amber-200 shadow-[0_0_34px_rgba(251,191,36,0.13)]",
    red: "border-red-400/30 bg-red-500/9 text-red-200 shadow-[0_0_34px_rgba(248,113,113,0.12)]",
    green: "border-emerald-300/30 bg-emerald-400/8 text-emerald-200 shadow-[0_0_34px_rgba(52,211,153,0.12)]",
    violet: "border-fuchsia-300/30 bg-fuchsia-500/8 text-fuchsia-200 shadow-[0_0_34px_rgba(217,70,239,0.12)]",
  }[tone];

  return (
    <article className={`relative overflow-hidden rounded-[1.25rem] border ${toneMap} p-5`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_28%,transparent_72%,rgba(255,255,255,0.025))]" />
      <div className="relative flex items-center justify-between gap-4">
        <span className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{label}</span>
        <Icon size={18} />
      </div>
      <strong className="relative mt-3 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{value}</strong>
      <p className="relative mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </article>
  );
}

function TerminalPanel({ title, eyebrow, children, tone = "cyan" }: { title: string; eyebrow?: string; children: ReactNode; tone?: "cyan" | "gold" | "red" | "green" | "violet" }) {
  const border = {
    cyan: "border-cyan-300/25 shadow-[0_0_46px_rgba(34,211,238,0.09)]",
    gold: "border-amber-300/30 shadow-[0_0_46px_rgba(251,191,36,0.10)]",
    red: "border-red-400/25 shadow-[0_0_46px_rgba(248,113,113,0.09)]",
    green: "border-emerald-300/25 shadow-[0_0_46px_rgba(52,211,153,0.09)]",
    violet: "border-fuchsia-300/25 shadow-[0_0_46px_rgba(217,70,239,0.09)]",
  }[tone];
  const text = {
    cyan: "text-cyan-200",
    gold: "text-amber-200",
    red: "text-red-200",
    green: "text-emerald-200",
    violet: "text-fuchsia-200",
  }[tone];

  return (
    <section className={`relative overflow-hidden rounded-[1.5rem] border ${border} bg-[#07101a]/88 p-5 sm:p-6`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_24%,transparent_74%,rgba(255,255,255,0.025))]" />
      <div className="relative mb-5 border-b border-white/10 pb-4">
        {eyebrow && <p className={`font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] ${text}`}>{eyebrow}</p>}
        <h2 className="mt-2 font-mono text-lg font-semibold uppercase tracking-[0.05em] text-white">{title}</h2>
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

function WorkbenchShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const [, navigate] = useLocation();
  const { loading, isAuthenticated, user, logout } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#03060b] text-slate-200">
        <Loader2 className="mr-2 animate-spin text-cyan-200" /> Loading NEST command workspace...
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#03060b] px-4 text-slate-200">
        <section className="max-w-md rounded-[1.75rem] border border-cyan-300/25 bg-[#07101a]/92 p-7 text-center shadow-[0_0_80px_rgba(34,211,238,0.12)]">
          <img src={TREE_LOGO} alt="NEST tree logo" className="mx-auto h-14 w-14 rounded-xl bg-[#f8edd1] p-1.5 shadow-[0_0_28px_rgba(251,191,36,0.22)]" />
          <h1 className="mt-5 font-mono text-xl font-semibold uppercase tracking-[0.06em] text-white">Sign in to the NEST workbench</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">This is the dark operational command layer for deals, approvals, bonds, covenants, draws, tenants, and AI desk work.</p>
          <a href={getLoginUrl()} className="mt-5 inline-flex items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-400/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-400/20">Login</a>
        </section>
      </main>
    );
  }

  const navItems = [
    ["Deals", "/operations/deals", Building2],
    ["Command", "/", Layers3],
  ] as const;

  return (
    <main
      className="min-h-screen bg-[#03060b] text-slate-100"
      style={{ background: "radial-gradient(circle at 12% 4%, rgba(34,211,238,0.20), transparent 28rem), radial-gradient(circle at 84% 9%, rgba(251,191,36,0.16), transparent 25rem), linear-gradient(135deg,#02050a 0%,#07101a 50%,#04070d 100%)" }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.20] [background-image:radial-gradient(circle,rgba(255,255,255,0.75)_0.75px,transparent_0.9px),linear-gradient(118deg,transparent_0%,transparent_45%,rgba(34,211,238,0.30)_45.25%,transparent_46%),linear-gradient(63deg,transparent_0%,transparent_58%,rgba(251,191,36,0.24)_58.25%,transparent_59%)] [background-size:16px_16px,100%_100%,100%_100%]" />
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <aside className="border-r border-cyan-300/20 bg-black/55 px-5 py-5 shadow-[18px_0_80px_rgba(0,0,0,0.58)] backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen">
          <div className="overflow-hidden rounded-[1.15rem] border border-amber-300/35 bg-gradient-to-br from-amber-300/12 via-cyan-400/8 to-black px-3 py-3 [clip-path:polygon(0_0,92%_0,100%_18%,100%_100%,8%_100%,0_82%)]">
            <div className="flex items-center gap-3">
              <img src={TREE_LOGO} alt="NEST tree logo" className="h-12 w-12 rounded-xl bg-[#f8edd1] p-1.5 shadow-[0_0_22px_rgba(251,191,36,0.25)]" />
              <div>
                <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-200">NEST</p>
                <h1 className="font-mono text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-white">Workbench</h1>
              </div>
            </div>
          </div>

          <nav className="mt-6 grid gap-2" aria-label="Operations navigation">
            {navItems.map(([label, href, Icon]) => (
              <button
                key={label}
                onClick={() => navigate(href)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] px-3 py-2.5 text-left font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-slate-300 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-cyan-100"
              >
                <Icon size={16} className="text-cyan-300" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button onClick={() => navigate("/")} className="mt-8 inline-flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cyan-200 hover:text-amber-200">
            <ArrowLeft size={15} /> Back to command
          </button>

          <div className="mt-8 rounded-2xl border border-emerald-300/25 bg-emerald-400/8 p-4 text-sm text-slate-300">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-emerald-100">{user?.name ?? "NEST user"}</p>
            <button onClick={() => logout()} className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-cyan-200 hover:text-amber-200">Logout</button>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-4 sm:px-6 lg:px-8">
          <header className="relative overflow-hidden rounded-[1.5rem] border border-cyan-300/25 bg-black/45 p-5 shadow-[0_0_70px_rgba(34,211,238,0.10)] sm:p-6">
            <img src={HERO} alt="Terminal market texture" className="absolute inset-0 h-full w-full object-cover opacity-[0.14] mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#02050a]/70 via-[#07101a]/90 to-black/65" />
            <div className="relative">
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-200">Spider-Verse / Bloomberg terminal workbench</p>
              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="font-mono text-2xl font-semibold uppercase tracking-[0.04em] text-white sm:text-3xl">{title}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{subtitle}</p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-100"><CheckCircle2 size={14} /> Backend live</span>
              </div>
            </div>
          </header>

          <div className="mt-5">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function OperationsDealsPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [newDeal, setNewDeal] = useState({ name: "", issuer: "", amount: "" });
  const dealsQuery = trpc.deals.list.useQuery(undefined, { enabled: isAuthenticated });
  const approvalsQuery = trpc.approvals.listPending.useQuery(undefined, { enabled: isAuthenticated });
  const targetsQuery = trpc.mTargets.list.useQuery(undefined, { enabled: isAuthenticated });
  const createDeal = trpc.deals.create.useMutation({
    onSuccess: () => {
      dealsQuery.refetch();
      setNewDeal({ name: "", issuer: "", amount: "" });
    },
  });

  const deals = dealsQuery.data ?? [];
  const totalAmount = useMemo(() => deals.reduce((sum, deal) => sum + Number(deal.amount ?? 0), 0), [deals]);

  const handleCreate = () => {
    if (!newDeal.name || !newDeal.issuer || !newDeal.amount) return;
    createDeal.mutate({ name: newDeal.name, issuer: newDeal.issuer, amount: newDeal.amount, status: "intake" });
  };

  return (
    <WorkbenchShell title="Operations workspace" subtitle="A working institutional command view for live deals, transaction status, approvals, M&A target flow, and backend-connected desk modules.">
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active deals" value={String(deals.length)} detail="Backend deal records" icon={Building2} tone="cyan" />
          <MetricCard label="Transaction value" value={formatMoney(totalAmount)} detail="Aggregate active pipeline" icon={CircleDollarSign} tone="gold" />
          <MetricCard label="Pending approvals" value={String(approvalsQuery.data?.length ?? 0)} detail="Human-gated action queue" icon={ShieldCheck} tone="red" />
          <MetricCard label="M&A targets" value={String(targetsQuery.data?.length ?? 0)} detail="Acquisition intelligence desk" icon={Target} tone="violet" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <TerminalPanel title="Live deal portfolio" eyebrow="Command pipeline" tone="cyan">
            {dealsQuery.isLoading ? (
              <div className="flex items-center justify-center p-8 text-sm text-slate-400"><Loader2 className="mr-2 animate-spin text-cyan-200" size={16} /> Loading deals...</div>
            ) : deals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-cyan-300/25 bg-cyan-400/5 p-8 text-center">
                <Building2 className="mx-auto text-cyan-200" />
                <h3 className="mt-3 font-mono font-semibold uppercase tracking-[0.07em] text-white">No deals yet</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Create the first deal to activate the bond stack, tenant roll, draws, covenants, and approval workflows.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                {deals.map((deal) => (
                  <button key={deal.id} onClick={() => navigate(`/operations/deal/${deal.id}`)} className="grid w-full gap-3 bg-white/[0.025] p-4 text-left transition hover:bg-cyan-300/8 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_2rem] sm:items-center">
                    <div>
                      <h3 className="font-mono font-semibold uppercase tracking-[0.05em] text-white">{deal.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{deal.issuer} · Created {formatDate(deal.createdAt)}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-amber-100">{formatMoney(deal.amount)}</span>
                    <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-cyan-100">{deal.status}</span>
                    <ChevronRight size={17} className="text-cyan-200" />
                  </button>
                ))}
              </div>
            )}
          </TerminalPanel>

          <TerminalPanel title="New deal intake" eyebrow="Create record" tone="gold">
            <div className="grid gap-3">
              <input value={newDeal.name} onChange={(event) => setNewDeal({ ...newDeal, name: event.target.value })} placeholder="Deal name" className={terminalInput} />
              <input value={newDeal.issuer} onChange={(event) => setNewDeal({ ...newDeal, issuer: event.target.value })} placeholder="Issuer" className={terminalInput} />
              <input value={newDeal.amount} onChange={(event) => setNewDeal({ ...newDeal, amount: event.target.value })} placeholder="Amount" type="number" className={terminalInput} />
              <button onClick={handleCreate} disabled={createDeal.isPending} className={terminalButton}>
                {createDeal.isPending ? "Creating..." : "Create deal"}
              </button>
            </div>
          </TerminalPanel>
        </div>

        <TerminalPanel title="Agent fleet telemetry" eyebrow="AI command graphics" tone="cyan">
          <AgentTelemetryGraphic activeDeals={deals.length} pendingApprovals={approvalsQuery.data?.length ?? 0} targetCount={targetsQuery.data?.length ?? 0} />
        </TerminalPanel>

        <div className="grid gap-5 xl:grid-cols-2">
          <TerminalPanel title="Global approval rail" eyebrow="Governance" tone="red">
            <ApprovalRail />
          </TerminalPanel>
          <TerminalPanel title="M&A intelligence desk" eyebrow="Acquisition command" tone="violet">
            <LazyWorkspace>
              <MADeskComponent />
            </LazyWorkspace>
          </TerminalPanel>
        </div>
      </div>
    </WorkbenchShell>
  );
}

export function OperationsDealDetailPage({ dealId }: { dealId: string }) {
  const numericDealId = Number.parseInt(dealId, 10);
  const safeDealId = Number.isFinite(numericDealId) ? numericDealId : 0;
  const { isAuthenticated } = useAuth();
  const dealQuery = trpc.deals.get.useQuery({ dealId: safeDealId }, { enabled: isAuthenticated && safeDealId > 0 });
  const deal = dealQuery.data;
  const [activeWorkspace, setActiveWorkspace] = useState("capital-stack");

  const workspaceTabs = [
    { id: "capital-stack", label: "Bond stack", icon: Landmark, tone: "gold" as const, summary: "MTM pricing, call/put routing, spread analytics, investor book, and tranche-level structuring." },
    { id: "roots", label: "Roots", icon: Building2, tone: "cyan" as const, summary: "Evidence roots, document intake, connector health, provenance, and source-to-output controls." },
    { id: "deposit", label: "Client deposit", icon: CircleDollarSign, tone: "green" as const, summary: "Escrow, deposit receipt, reserve release, and client-side funding workflow." },
    { id: "surety", label: "Insurance / Surety", icon: ShieldCheck, tone: "red" as const, summary: "Carrier packet, underwriting gaps, insurance evidence, and surety handoff workflow." },
    { id: "rating", label: "Rating intelligence", icon: FileCheck2, tone: "violet" as const, summary: "Moody's/S&P recon pulse, methodology diff, rating-room cues, and affected-deal scoring." },
    { id: "intake", label: "Intake / Modeling", icon: Target, tone: "gold" as const, summary: "Pod-code generation, permit checklist, scenario stress builder, and comparison chart output." },
    { id: "monitoring", label: "Draws / Covenants", icon: Layers3, tone: "green" as const, summary: "Draw controls, covenant surveillance, tenant roster, and retained approval evidence." },
    { id: "agents", label: "Agent ops", icon: Layers3, tone: "cyan" as const, summary: "Live agent flow, task routing, desk logs, and AI-control observability." },
    { id: "control", label: "Admin / Compliance", icon: Users, tone: "red" as const, summary: "Approval queues, module health, archive lock, surveillance acknowledgements, and control-plane state." },
    { id: "treasury", label: "Treasury", icon: Wallet, tone: "gold" as const, summary: "Prefunded P-card operations, budget reconciliation, NEST soft costs, and rebate economics." },
    { id: "phoenix", label: "Phoenix", icon: Flame, tone: "red" as const, summary: "Distressed CRE acquisition — problem assets and brownfield rehabilitation via bond stabilization." },
  ];

  const activeWorkspaceDefinition = workspaceTabs.find((tab) => tab.id === activeWorkspace) ?? workspaceTabs[0];

  const renderWorkspace = () => {
    if (!deal) return null;

    switch (activeWorkspace) {
      case "roots":
        return <RootsWorkspace dealId={String(deal.id)} />;
      case "deposit":
        return <ClientDepositPlatform dealId={String(deal.id)} dealName={deal.issuer} />;
      case "surety":
        return <CompleteSuretyModule />;
      case "rating":
        return <RatingIntelligence />;
      case "intake":
        return <DealIntakeModeling />;
      case "monitoring":
        return (
          <div className="grid gap-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <TerminalPanel title="Draw management" eyebrow="Post-close funding" tone="green">
                <DrawsManagement dealId={deal.id} />
              </TerminalPanel>
              <TerminalPanel title="Covenant dashboard" eyebrow="Monitoring" tone="red">
                <CovenantsDashboard dealId={deal.id} />
              </TerminalPanel>
            </div>
            <TerminalPanel title="Tenant portfolio" eyebrow="Rent roll command" tone="cyan">
              <TenantRoster dealId={deal.id} />
            </TerminalPanel>
          </div>
        );
      case "agents":
        return <LiveAgentDashboard />;
      case "control":
        return (
          <div className="grid gap-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <AdminPlatform />
              <CompliancePortal />
            </div>
            <TerminalPanel title="Deal approval rail" eyebrow="Human control layer" tone="red">
              <ApprovalRail />
            </TerminalPanel>
          </div>
        );
      case "treasury":
        return (
          <LazyWorkspace>
            <TreasuryDesk dealId={String(deal.id)} />
          </LazyWorkspace>
        );
      case "phoenix":
        return (
          <LazyWorkspace>
            <PhoenixDesk />
          </LazyWorkspace>
        );
      case "capital-stack":
      default:
        return <BondStackDesk dealId={deal.id} />;
    }
  };

  return (
    <WorkbenchShell title={deal?.name ?? "Deal workspace"} subtitle="Deal-level command workbench where every completed NEST module is reachable as a working tab tied to the selected backend deal.">
      {dealQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-[1.5rem] border border-cyan-300/25 bg-[#07101a]/88 p-10 text-sm text-slate-400"><Loader2 className="mr-2 animate-spin text-cyan-200" size={16} /> Loading deal...</div>
      ) : !deal ? (
        <div className="rounded-[1.5rem] border border-red-400/25 bg-[#07101a]/88 p-10 text-center shadow-[0_0_46px_rgba(248,113,113,0.09)]">
          <h2 className="font-mono text-lg font-semibold uppercase tracking-[0.06em] text-white">Deal not found</h2>
          <p className="mt-2 text-sm text-slate-400">Return to the operations workspace and select an active backend deal record.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Issuer" value={deal.issuer} detail="Primary transaction counterparty" icon={Building2} tone="cyan" />
            <MetricCard label="Amount" value={formatMoney(deal.amount)} detail="Deal-level transaction value" icon={CircleDollarSign} tone="gold" />
            <MetricCard label="Status" value={deal.status} detail="Current command stage" icon={FileCheck2} tone="green" />
            <MetricCard label="Created" value={formatDate(deal.createdAt)} detail="Backend record timestamp" icon={CheckCircle2} tone="violet" />
          </div>

          <TerminalPanel title="Deal module switchboard" eyebrow="Working module integration" tone={activeWorkspaceDefinition.tone}>
            <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {workspaceTabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeWorkspace === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveWorkspace(tab.id)}
                    className={`rounded-2xl border p-4 text-left transition ${selected ? "border-cyan-300/55 bg-cyan-300/12 shadow-[0_0_28px_rgba(34,211,238,0.12)]" : "border-white/10 bg-black/25 hover:border-cyan-300/25 hover:bg-white/5"}`}
                    aria-pressed={selected}
                  >
                    <span className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-slate-400"><Icon size={15} /> {tab.label}</span>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{tab.summary}</p>
                  </button>
                );
              })}
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-3 sm:p-4" data-testid="deal-workspace-panel">
              <LazyWorkspace>{renderWorkspace()}</LazyWorkspace>
            </div>
          </TerminalPanel>
        </div>
      )}
    </WorkbenchShell>
  );
}
