import { Link, useLocation } from "wouter";
import {
  Eye, TreePine, Landmark, Target, Shield, Bot,
  Scale, FileCheck, Users, ClipboardCheck, Lock,
  BarChart3, Building2, Briefcase, Radio, Activity,
  Gauge, GitBranch, Megaphone, Swords, Inbox,
  Upload, CheckCircle2, CreditCard, LineChart,
  FlaskConical, AlertTriangle, DollarSign, Tag,
  Send, HandCoins, FileText, Gavel, Calculator,
  Binoculars, Moon, Database, HardHat, ClipboardList,
  Search, Wallet, Cpu,
} from "lucide-react";
import NestMark from "./NestMark";

const NAV_SECTIONS = [
  {
    label: "COMMAND",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Gauge },
      { label: "Pipeline", href: "/deals", icon: GitBranch },
      { label: "Bernard", href: "/bernard", icon: Bot },
    ],
  },
  {
    label: "ORIGINATION",
    items: [
      { label: "EagleEye", href: "/eagleeye-v2", icon: Eye },
      { label: "M&A Intel", href: "/ma", icon: Search },
      { label: "Bullseye Pitch", href: "/marketing", icon: Megaphone },
      { label: "Boxing Out", href: "/boxing-out", icon: Swords },
    ],
  },
  {
    label: "INTAKE",
    items: [
      { label: "Deal Entry", href: "/deal-input-v4", icon: Inbox },
      { label: "Roots — Docs", href: "/upload", icon: TreePine },
      { label: "Preflight", href: "/preflight", icon: CheckCircle2 },
    ],
  },
  {
    label: "ANALYSIS",
    items: [
      { label: "Credit", href: "/credit", icon: CreditCard },
      { label: "Modeling", href: "/modeling", icon: LineChart },
      { label: "Feasibility", href: "/feasibility", icon: FlaskConical },
      { label: "Risk", href: "/risk", icon: AlertTriangle },
    ],
  },
  {
    label: "STRUCTURING",
    items: [
      { label: "Bond Desk", href: "/bond-desk", icon: Landmark },
      { label: "Bond Intel", href: "/bond-intel", icon: Activity },
      { label: "Enhancement", href: "/surety", icon: Shield },
      { label: "Pricing", href: "/pricing", icon: Tag },
    ],
  },
  {
    label: "RATING",
    items: [
      { label: "Rating Desk", href: "/rating", icon: BarChart3 },
    ],
  },
  {
    label: "PLACEMENT",
    items: [
      { label: "Hawkeye", href: "/hawkeye", icon: Target },
      { label: "Lenders", href: "/lenders", icon: HandCoins },
    ],
  },
  {
    label: "CLOSING",
    items: [
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Legal / Atticus", href: "/atticus", icon: Gavel },
      { label: "Cost Estimate", href: "/cost-estimate", icon: Calculator },
    ],
  },
  {
    label: "MONITORING",
    items: [
      { label: "Surveillance", href: "/surveillance", icon: Binoculars },
      { label: "NightVision", href: "/nightvision", icon: Moon },
      { label: "EMMA", href: "/emma", icon: Database },
      { label: "Construction", href: "/construction", icon: HardHat },
    ],
  },
  {
    label: "AUDIT & FEASIBILITY",
    items: [
      { label: "Feasibility Desk", href: "/feasibility-desk", icon: ClipboardList },
      { label: "Audit Desk", href: "/audit-desk", icon: FileCheck },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Treasury", href: "/treasury", icon: Wallet },
      { label: "AI Tools", href: "/agents/platform", icon: Cpu },
      { label: "Admin", href: "/admin", icon: Lock },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-[#03060b]">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-[#040810]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <NestMark className="h-7 w-7" />
          <div>
            <p className="font-[Cormorant_Garamond] text-lg font-semibold tracking-[0.14em] text-[#C4A048]">NEST</p>
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.1em] text-slate-500">Command Platform</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1.5 px-2 font-mono text-[0.5rem] font-bold uppercase tracking-[0.18em] text-slate-600">
                {section.label}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all ${
                      active
                        ? "bg-cyan-400/15 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon size={14} className={active ? "text-cyan-300" : "text-slate-500"} />
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.06em]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 py-3">
          <p className="font-serif text-sm italic text-amber-100/80 tracking-wide">It's Time To Fly</p>
          <div className="mt-2 space-y-0.5">
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.1em] text-slate-500">Sean Gilmore — Founder</p>
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.1em] text-slate-500">Josh Edwards — Founder</p>
          </div>
          <p className="font-mono text-[0.42rem] uppercase tracking-[0.1em] text-slate-600 mt-1.5">
            Arden Edge × Sparrow Capital
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
