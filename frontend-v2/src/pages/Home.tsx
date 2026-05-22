import { useMemo } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowUpRight,
  BellRing,
  Bot,
  BrainCircuit,
  Building2,
  Cable,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Cpu,
  DatabaseZap,
  FileCheck2,
  Landmark,
  Layers3,
  LineChart,
  LockKeyhole,
  Network,
  PlugZap,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NestMark from "@/components/NestMark";
import { trpc } from "@/lib/trpc";

const HERO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'%3E%3Crect fill='%23060E1A' width='1200' height='600'/%3E%3C/svg%3E";
const BOND_DESK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23060E1A' width='800' height='400'/%3E%3Ctext x='400' y='200' text-anchor='middle' fill='%23C4A048' font-family='monospace' font-size='24'%3ENEST Bond Desk%3C/text%3E%3C/svg%3E";
const NERVOUS = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='300'%3E%3Crect fill='%230D2218' width='800' height='300'/%3E%3Ctext x='400' y='150' text-anchor='middle' fill='%237A9A82' font-family='monospace' font-size='20'%3ENEST Neural Network%3C/text%3E%3C/svg%3E";
const RATING = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='300'%3E%3Crect fill='%23200A0A' width='800' height='300'/%3E%3Ctext x='400' y='150' text-anchor='middle' fill='%23C4A048' font-family='monospace' font-size='20'%3ERating %26 Surety Room%3C/text%3E%3C/svg%3E";

type Tone = "cyan" | "gold" | "red" | "green" | "violet";

type WorkItem = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const commandNav: NavItem[] = [
  { label: "Command", href: "#command", icon: Activity },
  { label: "AI Brain", href: "#ai-cns", icon: BrainCircuit },
  { label: "Bond Desk", href: "#bond-stack", icon: Landmark },
  { label: "M&A", href: "#ma-desk", icon: Target },
  { label: "Approvals", href: "#approvals", icon: ShieldCheck },
  { label: "Live Ops", href: "/operations/deals", icon: Building2 },
];

const toneClasses: Record<Tone, { border: string; text: string; bg: string; shadow: string; chip: string }> = {
  cyan: {
    border: "border-cyan-300/35",
    text: "text-cyan-200",
    bg: "bg-cyan-400/10",
    shadow: "shadow-[0_0_40px_rgba(34,211,238,0.16)]",
    chip: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
  },
  gold: {
    border: "border-amber-300/40",
    text: "text-amber-200",
    bg: "bg-amber-400/10",
    shadow: "shadow-[0_0_40px_rgba(251,191,36,0.18)]",
    chip: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  },
  red: {
    border: "border-red-400/35",
    text: "text-red-200",
    bg: "bg-red-500/10",
    shadow: "shadow-[0_0_42px_rgba(248,113,113,0.16)]",
    chip: "border-red-400/30 bg-red-500/10 text-red-100",
  },
  green: {
    border: "border-emerald-300/35",
    text: "text-emerald-200",
    bg: "bg-emerald-400/10",
    shadow: "shadow-[0_0_40px_rgba(52,211,153,0.16)]",
    chip: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  },
  violet: {
    border: "border-fuchsia-300/35",
    text: "text-fuchsia-200",
    bg: "bg-fuchsia-500/10",
    shadow: "shadow-[0_0_40px_rgba(217,70,239,0.16)]",
    chip: "border-fuchsia-300/30 bg-fuchsia-500/10 text-fuchsia-100",
  },
};

const deskStatus: Array<[string, string, string, Tone, LucideIcon]> = [
  ["Bond Stack", "A/B tranche sizing · DSCR · spread lane", "ACTIVE", "gold", Landmark],
  ["M&A Intelligence", "Target scoring · recommendation engine", "ACTIVE", "violet", Target],
  ["Approval Rail", "Human gates · retained records", "GOVERNED", "red", ShieldCheck],
  ["Draws + Covenants", "Post-close exception monitoring", "WATCH", "green", FileCheck2],
  ["Tenant Roster", "Lease exposure · rent roll · credit", "PORTFOLIO", "cyan", Users],
  ["Deal Pipeline", "Issuer records · operating stage", "OPS CORE", "cyan", Building2],
];

const operatingLayers: Array<[string, string, string, LucideIcon, Tone]> = [
  ["Layer 01", "Data ingestion roots", "Issuer files, vault evidence, market feeds, covenants, draws, tenants, target records, and approval events enter through controlled source ports.", PlugZap, "cyan"],
  ["Layer 02", "Institutional workflow rail", "Secure operating records coordinate deals, bonds, covenants, tenants, draws, M&A targets, and approvals with durable audit context.", Cable, "gold"],
  ["Layer 03", "AI command brain", "Decision logic sizes bonds, scores M&A targets, detects covenant breaches, computes DSCR, and routes actions into human gates.", BrainCircuit, "green"],
];

const marketTape = [
  ["NEST TREE", "ONLINE", "governed routing"],
  ["BOND DESK", "A/B", "tranche engine"],
  ["APPROVALS", "HUMAN", "gates required"],
  ["M&A RADAR", "LIVE", "target scoring"],
  ["COVENANTS", "WATCH", "breach detection"],
  ["DRAW CTRL", "LOCKED", "approval workflow"],
];

function formatAmount(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numberValue);
}

function CommandCard({ children, tone = "cyan", className = "", id }: { children: React.ReactNode; tone?: Tone; className?: string; id?: string }) {
  const toneClass = toneClasses[tone];
  return (
    <article
      id={id}
      className={`relative overflow-hidden rounded-[1.35rem] border ${toneClass.border} bg-[#07101a]/88 ${toneClass.shadow} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_22%,transparent_72%,rgba(255,255,255,0.035))]" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div className="relative">{children}</div>
    </article>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  const dealsQuery = trpc.deals.list.useQuery(undefined, { enabled: isAuthenticated });
  const approvalsQuery = trpc.approvals.listPending.useQuery(undefined, { enabled: isAuthenticated });
  const targetsQuery = trpc.mTargets.list.useQuery(undefined, { enabled: isAuthenticated });

  const deals = dealsQuery.data ?? [];
  const approvals = approvalsQuery.data ?? [];
  const targets = targetsQuery.data ?? [];
  const activeDeal = deals[0];

  const workItems: WorkItem[] = useMemo(
    () => [
      {
        label: "Active deals",
        value: String(deals.length),
        detail: deals.length ? "Live issuer pipeline connected" : "Pipeline intake ready",
        tone: "cyan",
      },
      {
        label: "Pending gates",
        value: String(approvals.length),
        detail: approvals.length ? "Human approval required" : "No blocked actions",
        tone: approvals.length ? "red" : "green",
      },
      {
        label: "M&A targets",
        value: String(targets.length),
        detail: targets.length ? "Scorecards on the radar" : "Target universe ready",
        tone: "violet",
      },
      {
        label: "Backend desks",
        value: "7",
        detail: "Deals · bonds · covenants · tenants · draws · M&A · approvals",
        tone: "gold",
      },
    ],
    [deals.length, approvals.length, targets.length]
  );

  return (
    <main
      className="min-h-screen bg-[#03060b] text-[#f6eed7]"
      style={{
        background:
          "radial-gradient(circle at 12% 4%, rgba(34, 211, 238, 0.22), transparent 28rem), radial-gradient(circle at 82% 8%, rgba(245, 158, 11, 0.18), transparent 25rem), radial-gradient(circle at 48% 48%, rgba(225, 29, 72, 0.11), transparent 34rem), linear-gradient(135deg, #02050a 0%, #07101a 46%, #04070d 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.24] [background-image:radial-gradient(circle,rgba(255,255,255,0.8)_0.75px,transparent_0.85px),linear-gradient(118deg,transparent_0%,transparent_45%,rgba(34,211,238,0.36)_45.25%,transparent_46%),linear-gradient(63deg,transparent_0%,transparent_58%,rgba(251,191,36,0.28)_58.25%,transparent_59%)] [background-size:16px_16px,100%_100%,100%_100%]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent shadow-[0_0_28px_rgba(34,211,238,0.95)]" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[18.5rem_minmax(0,1fr)]">
        <aside className="border-r border-cyan-300/20 bg-black/55 px-5 py-5 shadow-[18px_0_80px_rgba(0,0,0,0.58)] backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen">
          <div className="relative overflow-hidden rounded-[1.2rem] border border-amber-300/35 bg-gradient-to-br from-amber-300/12 via-cyan-400/8 to-black px-3 py-3 [clip-path:polygon(0_0,92%_0,100%_18%,100%_100%,8%_100%,0_82%)]">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-[#0a1f16] p-1.5 shadow-[0_0_24px_rgba(201,168,76,0.32)] flex items-center justify-center"><NestMark size={44} /></div>
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-amber-200">NEST</p>
                <h1 className="font-mono text-[1.05rem] font-semibold uppercase tracking-[0.08em] text-white">Command OS</h1>
              </div>
            </div>
          </div>

          <nav className="mt-6 grid gap-2" aria-label="NEST command navigation">
            {commandNav.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] px-3 py-2.5 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-slate-300 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-cyan-100 hover:shadow-[0_0_26px_rgba(34,211,238,0.18)]"
              >
                <Icon size={16} className="text-cyan-300 transition group-hover:text-amber-200" />
                <span>{label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-7 rounded-[1.1rem] border border-red-400/30 bg-red-500/10 p-4 shadow-[0_0_34px_rgba(248,113,113,0.12)]">
            <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-red-100">
              <BellRing size={15} /> Human Gate Rail
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              AI prepares institutional work product. Humans approve submissions, outreach, pricing actions, draw releases, and transaction movement.
            </p>
          </div>

          <div className="mt-7 rounded-[1.1rem] border border-emerald-300/25 bg-emerald-400/8 p-4">
            <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={15} /> Session
            </div>
            <div className="mt-3 text-sm text-slate-300">
              {loading ? (
                <span>Checking command credentials...</span>
              ) : isAuthenticated ? (
                <div className="space-y-2">
                  <p>Signed in as <strong className="text-white">{user?.name ?? "NEST user"}</strong></p>
                  <button onClick={() => logout()} className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-cyan-200 hover:text-amber-200">Logout</button>
                </div>
              ) : (
                <a href={getLoginUrl()} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/12 px-3 py-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-400/20">
                  Login to workspace <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-4 sm:px-6 lg:px-8" id="command">
          <header className="relative overflow-hidden rounded-[1.6rem] border border-cyan-300/25 bg-black/45 p-4 shadow-[0_0_70px_rgba(34,211,238,0.10)] sm:p-6">
            <img src={HERO} alt="Institutional terminal texture" className="absolute inset-0 h-full w-full object-cover opacity-[0.18] mix-blend-screen" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.55),rgba(2,6,23,0.88)_46%,rgba(2,6,23,0.62))]" />
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-cyan-300/30 shadow-[0_0_80px_rgba(34,211,238,0.25)]" />
            <div className="absolute -right-6 top-14 h-48 w-48 rounded-full border border-amber-300/35 shadow-[0_0_70px_rgba(251,191,36,0.18)]" />
            <div className="absolute right-20 top-32 h-32 w-32 rounded-full border border-red-400/30 shadow-[0_0_60px_rgba(248,113,113,0.18)]" />

            <div className="relative flex flex-col items-center gap-6 text-center">
              <div className="relative min-h-[25rem] w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/35 p-5 shadow-[inset_0_0_80px_rgba(34,211,238,0.06)]" aria-label="NEST tree command visualization">
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/35 shadow-[0_0_78px_rgba(34,211,238,0.22)] sm:h-80 sm:w-80" />
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/35 shadow-[0_0_68px_rgba(251,191,36,0.18)] sm:h-64 sm:w-64" />
                <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-400/30 shadow-[0_0_62px_rgba(248,113,113,0.16)] sm:h-48 sm:w-48" />
                <div className="absolute left-1/2 top-1/2 z-10 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[1.8rem] border border-amber-200/55 bg-[#06090f]/94 p-4 text-center shadow-[0_0_90px_rgba(251,191,36,0.28)] sm:h-52 sm:w-52">
                  <div className="h-24 w-24 rounded-2xl bg-[#0a1f16] p-2 shadow-[0_0_34px_rgba(201,168,76,0.28)] sm:h-28 sm:w-28 flex items-center justify-center"><NestMark size={80} /></div>
                  <span className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-amber-100">NEST</span>
                  <strong className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white">Route · Score · Govern</strong>
                </div>
                {["Deals", "Bonds", "M&A", "Draws", "Covenants", "Tenants", "Approvals", "Docs"].map((port, index) => {
                  const positions = [
                    "left-6 top-8", "right-6 top-10", "left-8 bottom-14", "right-8 bottom-14",
                    "left-1/2 top-5 -translate-x-1/2", "left-1/2 bottom-6 -translate-x-1/2", "left-5 top-1/2 -translate-y-1/2", "right-5 top-1/2 -translate-y-1/2",
                  ];
                  const tones: Tone[] = ["cyan", "gold", "violet", "green", "red", "cyan", "red", "gold"];
                  return (
                    <span key={port} className={`absolute ${positions[index]} rounded-full border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] ${toneClasses[tones[index]].chip}`}>
                      {port}
                    </span>
                  );
                })}
              </div>

              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  <Zap size={13} /> Institutional command platform
                </p>
                <h2 className="mt-4 font-mono text-[1rem] font-semibold leading-snug tracking-[-0.005em] text-white sm:text-[1.08rem] lg:text-[1.18rem]">
                  NEST coordinates bond finance, credit workflow, and governed operations.
                </h2>
                <p className="mt-3 text-[0.92rem] leading-7 text-slate-300">
                  A precise black interface with cyan, gold, red, green, and fuchsia signal color frames the tree-centered intelligence model and its approval rails.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link href="/operations/deals" className="inline-flex items-center gap-2 rounded-xl border border-amber-300/45 bg-amber-300/15 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.16)] hover:bg-amber-300/22">
                    Open workbench <ArrowUpRight size={15} />
                  </Link>
                  <a href="#ai-cns" className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-400/18">
                    View operating model <ChevronRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-4 overflow-hidden rounded-[1rem] border border-cyan-300/20 bg-black/60">
            <div className="flex min-w-max animate-[pulse_5s_ease-in-out_infinite] divide-x divide-white/10">
              {marketTape.map(([label, value, detail], index) => (
                <div key={`${label}-${index}`} className="grid min-w-[13rem] gap-1 px-4 py-3">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">{label}</span>
                  <strong className="font-mono text-[0.92rem] uppercase tracking-[0.12em] text-white">{value}</strong>
                  <em className="font-mono text-[0.62rem] uppercase not-italic tracking-[0.14em] text-cyan-200">{detail}</em>
                </div>
              ))}
            </div>
          </div>

          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Live workspace metrics">
            {workItems.map((item) => {
              const tone = toneClasses[item.tone];
              return (
                <CommandCard key={item.label} tone={item.tone} className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">{item.label}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${tone.bg} shadow-[0_0_18px_currentColor] ${tone.text}`} />
                  </div>
                  <strong className={`mt-3 block font-mono text-3xl font-semibold tracking-[-0.04em] ${tone.text}`}>{item.value}</strong>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                </CommandCard>
              );
            })}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(23rem,0.82fr)]" id="ai-cns">
            <CommandCard tone="cyan" className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-200"><Layers3 size={14} /> Three-layer operating architecture</p>
                  <h3 className="mt-2 font-mono text-xl font-semibold uppercase tracking-[0.04em] text-white">Data ingestion → workflow rail → AI brain</h3>
                </div>
                <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-emerald-100">22 tests passing</span>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {operatingLayers.map(([layer, title, copy, Icon, tone]) => (
                  <div key={layer} className={`rounded-[1.1rem] border ${toneClasses[tone].border} ${toneClasses[tone].bg} p-4`}>
                    <div className={`flex items-center gap-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${toneClasses[tone].text}`}><Icon size={16} /> {layer}</div>
                    <h4 className="mt-3 font-mono text-[0.95rem] font-semibold uppercase tracking-[0.06em] text-white">{title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                  </div>
                ))}
              </div>
            </CommandCard>

            <CommandCard tone="red" className="p-5" id="approvals">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-red-200">Approval rail</p>
                  <h3 className="mt-2 font-mono text-lg font-semibold uppercase tracking-[0.05em] text-white">Human gates</h3>
                </div>
                <BellRing size={19} className="text-red-200" />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {approvals.length ? `${approvals.length} institutional action${approvals.length === 1 ? "" : "s"} need review before release.` : "No pending approval blocks. The command rail is clear."}
              </p>
              <div className="mt-4 grid gap-2">
                {(approvals.length ? approvals.slice(0, 3) : [{ type: "rating-package", itemId: 0, notes: "AI can prepare. Humans approve." }]).map((approval, index) => (
                  <div key={`${approval.type}-${approval.itemId}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-slate-300">{approval.type}</span>
                      <span className="rounded-full border border-red-300/30 bg-red-400/10 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-red-100">Gate</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{approval.notes ?? "Review required before action."}</p>
                  </div>
                ))}
              </div>
            </CommandCard>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]" id="bond-stack">
            <CommandCard tone="gold" className="p-5 sm:p-6">
              <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-amber-200"><Landmark size={15} /> Bond Stack Desk</div>
              <h3 className="mt-3 font-mono text-xl font-semibold uppercase tracking-[0.04em] text-white">A/B tranche cockpit + call/put watch</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Senior and subordinate bond scenarios are modeled in a dense market-grid workspace with DSCR, spread, call/put timing, and approval controls.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[["Senior lane", "$118M"], ["B sleeve", "$31M"], ["DSCR target", "1.41x"], ["Spread watch", "+94bp"]].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-amber-300/20 bg-amber-300/8 p-3">
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-slate-500">{label}</span>
                    <strong className="mt-1 block font-mono text-lg text-amber-100">{value}</strong>
                  </div>
                ))}
              </div>
              <Link href="/operations/deals" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-300/35 bg-amber-300/10 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-amber-100 hover:bg-amber-300/18">
                Structure live deal <ArrowUpRight size={14} />
              </Link>
            </CommandCard>

            <CommandCard tone="cyan" className="overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                <img src={BOND_DESK} alt="NEST institutional bond desk market grid" className="h-full min-h-[18rem] w-full object-cover opacity-75 mix-blend-screen" />
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-200"><RadioTower size={15} /> Live desk status</div>
                  <div className="mt-5 grid gap-3">
                    {deskStatus.map(([desk, detail, status, tone, Icon], index) => (
                      <div key={desk} className={`grid gap-3 rounded-xl border ${toneClasses[tone].border} bg-white/[0.035] p-3 sm:grid-cols-[2.25rem_minmax(0,1fr)_6.4rem] sm:items-center`}>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone].bg} ${toneClasses[tone].text}`}><Icon size={16} /></span>
                        <div>
                          <h4 className="font-mono text-[0.78rem] font-semibold uppercase tracking-[0.09em] text-white">{String(index + 1).padStart(2, "0")} · {desk}</h4>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
                        </div>
                        <span className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.13em] ${toneClasses[tone].chip}`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CommandCard>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-3" id="ma-desk">
            <CommandCard tone="violet" className="p-5">
              <Target className="text-fuchsia-200" size={20} />
              <h3 className="mt-4 font-mono text-lg font-semibold uppercase tracking-[0.06em] text-white">M&A radar</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {targets.length ? `${targets.length} target${targets.length === 1 ? "" : "s"} in the live acquisition intelligence queue.` : "Target scoring engine is ready for a new acquisition universe."}
              </p>
            </CommandCard>
            <CommandCard tone="green" className="p-5">
              <TrendingUp className="text-emerald-200" size={20} />
              <h3 className="mt-4 font-mono text-lg font-semibold uppercase tracking-[0.06em] text-white">Pipeline signal</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {activeDeal ? `${activeDeal.name} is active with ${formatAmount(activeDeal.amount)} in the command queue.` : "Create a deal to activate post-close monitoring and bond workflow surfaces."}
              </p>
            </CommandCard>
            <CommandCard tone="red" className="p-5">
              <ShieldCheck className="text-red-200" size={20} />
              <h3 className="mt-4 font-mono text-lg font-semibold uppercase tracking-[0.06em] text-white">Controls stay hard</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">No rating submission, investor outreach, surety handoff, draw approval, or transaction action moves without an explicit human gate.</p>
            </CommandCard>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,0.72fr)]">
            <CommandCard tone="cyan" className="p-5 sm:p-6">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-200">Live deal tape</p>
                  <h3 className="mt-2 font-mono text-xl font-semibold uppercase tracking-[0.04em] text-white">Institutional operating records</h3>
                </div>
                <Link href="/operations/deals" className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-3 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-400/18">
                  Open workbench <ChevronRight size={14} />
                </Link>
              </div>
              <div className="mt-4 grid gap-2">
                {(deals.length ? deals.slice(0, 5) : [{ id: 0, name: "No live deal loaded", issuer: "NEST intake", amount: "0", status: "ready" }]).map((deal) => (
                  <div key={deal.id} className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-[minmax(0,1fr)_7rem_7rem] sm:items-center">
                    <div>
                      <h4 className="font-mono text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-white">{deal.name}</h4>
                      <p className="mt-1 text-xs text-slate-500">{deal.issuer}</p>
                    </div>
                    <strong className="font-mono text-sm text-amber-100">{formatAmount(deal.amount)}</strong>
                    <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-cyan-100">{deal.status}</span>
                  </div>
                ))}
              </div>
            </CommandCard>

            <CommandCard tone="gold" className="overflow-hidden">
              <img src={NERVOUS} alt="NEST AI nervous system graphic" className="h-48 w-full object-cover opacity-70 mix-blend-screen" />
              <div className="p-5">
                <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-amber-200"><Cpu size={15} /> Agent fleet</div>
                <p className="mt-3 text-sm leading-6 text-slate-400">Vector, Merlin, Morgan, Sterling, Sentinel, SuretyScout, and the bond optimizer dock into the central tree brain as supervised institutional agents.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Vector", "Merlin", "Morgan", "Sterling", "Sentinel", "SuretyScout"].map((agent) => (
                    <span key={agent} className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-amber-100">{agent}</span>
                  ))}
                </div>
              </div>
            </CommandCard>
          </section>

          <section className="mt-5 grid gap-5 pb-8 xl:grid-cols-2">
            <CommandCard tone="green" className="p-5 sm:p-6">
              <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-emerald-200"><CheckCircle2 size={15} /> Operational continuity</div>
              <p className="mt-3 text-sm leading-6 text-slate-400">Live data connections remain active across deals, approvals, M&A targets, and the operations workbench.</p>
            </CommandCard>
            <CommandCard tone="red" className="overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                <img src={RATING} alt="NEST rating and surety command room" className="h-full min-h-[13rem] w-full object-cover opacity-70 mix-blend-screen" />
                <div className="p-5">
                  <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-red-200"><LockKeyhole size={15} /> Rating / Surety room</div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">Credit memo, surety packet, underwriting gaps, covenant surveillance, and approval queues operate within a vivid command-room visual language.</p>
                </div>
              </div>
            </CommandCard>
          </section>

          {/* ── Bottom Masthead — 3 Phases ────────────────────────── */}

          {/* Phase 1: Bloomberg-style sticky ticker */}
          <section className="mt-5 overflow-hidden rounded-[1rem] border border-cyan-300/20 bg-black/60">
            <div className="flex min-w-max divide-x divide-white/10">
              {[
                ["VECTOR", "LIVE", "14 signals / 15min"],
                ["MORGAN", "READY", "credit memo engine"],
                ["STERLING", "ACTIVE", "placement + CRM"],
                ["SENTINEL", "WATCH", "7-dim risk scoring"],
                ["MERLIN", "SCANNING", "NAICS target radar"],
                ["ATLAS", "ONLINE", "10yr proforma"],
                ["MAXWELL", "READY", "DSCR / LTV / LGD"],
                ["SURETY SCOUT", "ACTIVE", "Hylant pipeline"],
              ].map(([agent, status, detail], i) => (
                <div key={`agent-${i}`} className="grid min-w-[11rem] gap-0.5 px-4 py-2.5">
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-slate-500">{agent}</span>
                  <strong className={`font-mono text-[0.78rem] uppercase tracking-[0.12em] ${status === "LIVE" || status === "ACTIVE" ? "text-emerald-300" : status === "WATCH" || status === "SCANNING" ? "text-amber-200" : "text-cyan-200"}`}>{status}</strong>
                  <em className="font-mono text-[0.52rem] uppercase not-italic tracking-[0.14em] text-slate-500">{detail}</em>
                </div>
              ))}
            </div>
          </section>

          {/* Phase 2: Cinematic closing strip */}
          <section className="mt-5 relative overflow-hidden rounded-[1.6rem] border border-amber-300/25 bg-gradient-to-r from-[#060E1A] via-[#0a1a12] to-[#060E1A] p-6 sm:p-8 shadow-[0_0_80px_rgba(201,168,76,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(201,168,76,0.06),transparent_30%,transparent_70%,rgba(34,211,238,0.04))]" />
            <div className="relative flex flex-col items-center text-center gap-5 lg:flex-row lg:text-left lg:gap-8">
              <div className="flex flex-col items-center lg:items-start">
                <div className="h-16 w-16 rounded-xl bg-[#0a1f16] p-2 shadow-[0_0_34px_rgba(201,168,76,0.28)] flex items-center justify-center"><NestMark size={48} /></div>
                <p className="mt-3 font-serif text-lg italic text-amber-100/80 tracking-wide">It's Time To Fly</p>
              </div>
              <div className="flex-1">
                <h3 className="font-mono text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-white">NEST Advisors</h3>
                <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">Private Bond Structuring · PE Fund · M&A Intelligence · Capital Markets</p>
                <div className="mt-3 flex flex-wrap justify-center lg:justify-start gap-3">
                  {["EagleEye", "Roots", "Bond Desk", "Hawkeye", "Phoenix", "NightVision", "Treasury"].map((pillar) => (
                    <span key={pillar} className="rounded-full border border-amber-300/25 bg-amber-300/8 px-2.5 py-1 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-amber-100">{pillar}</span>
                  ))}
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="space-y-1">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-slate-400">Sean Gilmore — Founder & CEO</p>
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-slate-400">Josh Edwards — Co-Founder</p>
                </div>
                <p className="mt-2 font-mono text-[0.48rem] uppercase tracking-[0.12em] text-slate-600">Arden Edge Capital × Soparrow Capital</p>
              </div>
            </div>
          </section>

          {/* Phase 3: System vitals bar */}
          <section className="mt-5 mb-8 rounded-[1rem] border border-white/10 bg-black/50 px-5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-emerald-200">All systems operational</span>
                </div>
                <div className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-slate-500">16 agents · 267 routes · 7 pillars</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-slate-500">Backend: Flask 8000</span>
                <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-slate-500">Frontend: Vite 8100</span>
                <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-amber-200/60">NEST v2.0</span>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
