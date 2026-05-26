import { Link, useLocation } from "wouter";
import {
  Eye, TreePine, Landmark, Target, Shield, Bot,
  Scale, FileCheck, Users, ClipboardCheck, Lock,
  BarChart3, Building2, Briefcase, Radio, Activity,
} from "lucide-react";
import NestMark from "./NestMark";

/*
 * Navigation maps to every process in the Bible's 18 silos + Operating Framework desks:
 * Silo 1: Bond Anatomy → Deal Input (bond type, tax status, amortization)
 * Silo 2: Players → Counterparty management across all desks
 * Silo 3: Workflow → Deal flow pipeline (intake → closing → admin)
 * Silo 4: Documents → Roots/Document desk
 * Silo 5: Fee Architecture → Pricing in bond desk
 * Silo 6: Calls/Puts/Optionality → Structuring in bond desk
 * Silo 7: Covenants → Covenant monitoring
 * Silo 8: Reserves/Waterfalls → Structuring + Treasury
 * Silo 9: Credit Enhancement → Surety/Enhancement desk
 * Silo 10: Tranching → Bond desk structuring
 * Silo 11: Pricing/Spreads → Placement desk + market data
 * Silo 12: Post-Closing Admin → Operations desk
 * Silo 13: Refundings/Restructurings → Surveillance desk
 * Silo 14: Risk Rating/LGD → Rating desk + Mirror Agents
 * Silo 15: Modeling Engine → Prometheus/modeling
 * Silo 16: Rule Library → Intelligence engine
 * Silo 17: Agent Specs → Agent platform
 * Silo 18: Tech Stack → Admin/system
 */
const NAV_SECTIONS = [
  {
    label: "ORCA C-SUITE",
    items: [
      { label: "Bernard CEO", href: "/bernard", icon: Bot },
      { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    ],
  },
  {
    label: "BOND DESK",
    items: [
      { label: "Deal Input", href: "/deal-input-v4", icon: Briefcase },
      { label: "GENIE Structuring", href: "/bond-desk", icon: Landmark },
      { label: "Operations / Pipeline", href: "/operations/deals", icon: Building2 },
    ],
  },
  {
    label: "CREDIT & RATING",
    items: [
      { label: "Credit Underwriting", href: "/credit", icon: Scale },
      { label: "Rating & Submission", href: "/rating", icon: BarChart3 },
    ],
  },
  {
    label: "ENHANCEMENT & INSURANCE",
    items: [
      { label: "Surety & Insurance", href: "/surety", icon: FileCheck },
      { label: "Trustee Liaison", href: "/trustee", icon: Users },
    ],
  },
  {
    label: "PLACEMENT & DOCS",
    items: [
      { label: "Hawkeye Placement", href: "/hawkeye", icon: Target },
      { label: "Roots / Documents", href: "/roots", icon: TreePine },
      { label: "Client Deposits", href: "/deposits", icon: Users },
    ],
  },
  {
    label: "CONSTRUCTION & TREASURY",
    items: [
      { label: "Construction Risk", href: "/construction", icon: Building2 },
      { label: "Treasury / Ramp", href: "/treasury", icon: Landmark },
    ],
  },
  {
    label: "COMPLIANCE & SURVEILLANCE",
    items: [
      { label: "NightVision", href: "/nightvision", icon: Shield },
      { label: "Covenants", href: "/covenants", icon: Scale },
      { label: "Surveillance", href: "/surveillance", icon: Eye },
      { label: "Compliance Portal", href: "/compliance", icon: ClipboardCheck },
      { label: "KYC / AML", href: "/kyc", icon: Lock },
    ],
  },
  {
    label: "BUSINESS DEVELOPMENT",
    items: [
      { label: "EagleEye V2", href: "/eagleeye-v2", icon: Activity },
      { label: "EagleEye Scout", href: "/eagleeye", icon: Eye },
      { label: "Signal Intelligence", href: "/signals", icon: Radio },
    ],
  },
  {
    label: "INTELLIGENCE & AGENTS",
    items: [
      { label: "EMMA Bond Intel", href: "/emma", icon: BarChart3 },
      { label: "Agent Operations", href: "/agents/platform", icon: Bot },
      { label: "Admin Platform", href: "/admin", icon: Lock },
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
