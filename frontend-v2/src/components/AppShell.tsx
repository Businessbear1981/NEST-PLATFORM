import { Link, useLocation } from "wouter";
import {
  Eye, TreePine, Landmark, Target, Shield, Bot,
  Scale, FileCheck, Users, ClipboardCheck, Lock,
  BarChart3, Building2, Briefcase, Radio, Activity,
} from "lucide-react";
import NestMark from "./NestMark";

const NAV_SECTIONS = [
  {
    label: "DEAL PIPELINE",
    items: [
      { label: "Command Center", href: "/command-center", icon: Radio },
      { label: "Deal Intake", href: "/deal-intake", icon: Briefcase },
      { label: "Operations", href: "/operations/deals", icon: Building2 },
    ],
  },
  {
    label: "PILLARS",
    items: [
      { label: "EagleEye V2", href: "/eagleeye-v2", icon: Activity, desc: "Signal Intelligence" },
      { label: "EagleEye", href: "/eagleeye", icon: Eye, desc: "Deal Sourcing & BD" },
      { label: "Roots", href: "/roots", icon: TreePine, desc: "Readiness & Docs" },
      { label: "Bond Desk", href: "/bond-desk", icon: Landmark, desc: "Structuring & Live Ops" },
      { label: "Hawkeye", href: "/hawkeye", icon: Target, desc: "Placement & Sales" },
      { label: "NightVision", href: "/nightvision", icon: Shield, desc: "Compliance" },
    ],
  },
  {
    label: "MODULES",
    items: [
      { label: "Rating Intelligence", href: "/rating", icon: BarChart3 },
      { label: "Surety & Insurance", href: "/surety", icon: FileCheck },
      { label: "Covenant Monitoring", href: "/covenants", icon: Scale },
      { label: "KYC Compliance", href: "/kyc", icon: Lock },
      { label: "Compliance Portal", href: "/compliance", icon: ClipboardCheck },
      { label: "Client Deposits", href: "/deposits", icon: Users },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Agent Platform", href: "/agents/platform", icon: Bot },
      { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
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
