import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Eye, TreePine, Landmark, Target, Shield, Bot,
  Scale, FileCheck, Users, ClipboardCheck, Lock,
  BarChart3, Building2, Briefcase, Radio, Flame, Wallet,
  LayoutDashboard, Crosshair, HandCoins, UserCircle, Settings,
  Megaphone, Calculator, Search, Wrench, Video, FileText, CreditCard,
  ChevronDown,
} from "lucide-react";
import NestMark from "./NestMark";

const NAV_SECTIONS = [
  {
    label: "WORKFLOW",
    items: [
      { label: "Dashboards", href: "/dashboard", icon: LayoutDashboard, children: [
        { label: "Main", href: "/dashboard", icon: LayoutDashboard },
        { label: "Bond", href: "/dashboard-bond", icon: Landmark },
        { label: "M&A", href: "/dashboard-ma", icon: Megaphone },
        { label: "ICRE", href: "/dashboard-icre", icon: Crosshair },
        { label: "Owner/User", href: "/dashboard-ou", icon: Search },
        { label: "Fee / Treasury — Co.", href: "/dashboard-treasury-co", icon: Wallet },
        { label: "Fee / Treasury — Emp.", href: "/dashboard-treasury-emp", icon: Wallet },
        { label: "Comp / Success Fee", href: "/dashboard-comp", icon: HandCoins },
        { label: "P × V", href: "/dashboard-pv", icon: BarChart3 },
        { label: "Investor", href: "/investor-dashboard", icon: BarChart3 },
        { label: "Partner", href: "/partner-dashboard", icon: HandCoins },
        { label: "Client", href: "/client-dashboard", icon: UserCircle },
      ]},
      { label: "Command Center", href: "/command-center", icon: Radio },
      { label: "Operations", href: "/operations/deals", icon: Building2 },
      { label: "Admin", href: "/admin", icon: Settings },
    ],
  },
  {
    label: "BUSINESS DEVELOPMENT",
    items: [
      { label: "EagleEye", href: "/eagleeye", icon: Eye, desc: "Market Outreach & BD" },
      { label: "Contact Strategy", href: "/contact-strategy", icon: Users, desc: "Relationship Management" },
      { label: "Outreach", href: "/outreach", icon: Megaphone, desc: "Campaigns & Sequences" },
      { label: "Heat Maps", href: "/heat-maps", icon: BarChart3, desc: "Market Intelligence" },
      { label: "Bond", href: "/eagleeye-bond", icon: Target, desc: "Bond Placement" },
      { label: "ICRE", href: "/eagleeye-icre", icon: Crosshair, desc: "CRE Placement" },
      { label: "Owner/User", href: "/eagleeye-ou", icon: Search, desc: "Business Placement" },
      { label: "M&A", href: "/eagleeye-ma", icon: Megaphone, desc: "M&A Placement" },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { label: "Back of the Napkin", href: "/napkin", icon: Calculator, desc: "Quick Spread" },
      { label: "Content Library", href: "/content-library", icon: FileCheck, desc: "Decks, Memos, Media" },
      { label: "Video Generator", href: "/video-generator", icon: Video, desc: "AI Video Production" },
      { label: "Teaser Generator", href: "/teaser-generator", icon: FileText, desc: "Investor Teasers" },
      { label: "Credit Memo", href: "/credit-memo", icon: CreditCard, desc: "Memo Generation" },
    ],
  },
  {
    label: "NEST BOND",
    items: [
      { label: "Roots", href: "/roots", icon: TreePine, desc: "Ingestion & Docs" },
      { label: "Deal Intake", href: "/deal-intake", icon: Briefcase, desc: "Submission Portal" },
      { label: "Bond Desk", href: "/bond-desk", icon: Landmark, desc: "Structuring" },
      { label: "Rating Intelligence", href: "/rating", icon: BarChart3 },
      { label: "Surety & Insurance", href: "/surety", icon: FileCheck },
      { label: "Treasury", href: "/treasury", icon: Wallet },
    ],
  },
  {
    label: "NEST M&A",
    items: [
      { label: "M&A Intelligence", href: "/ma-desk", icon: Megaphone, desc: "Target Scoring" },
    ],
  },
  {
    label: "NEST TERM LENDING",
    items: [
      { label: "Phoenix", href: "/phoenix", icon: Flame, desc: "Distressed CRE" },
    ],
  },
  {
    label: "COMPLIANCE & LEGAL",
    items: [
      { label: "NightVision", href: "/nightvision", icon: Shield, desc: "KYC · AML · OFAC" },
      { label: "Atticus", href: "/atticus", icon: Scale, desc: "In-House Counsel" },
    ],
  },
  {
    label: "NEST SUITE",
    items: [
      { label: "C-Suite", href: "/c-suite", icon: LayoutDashboard, desc: "ORCA Management Lair" },
      { label: "Agent Platform", href: "/agents/platform", icon: Bot },
    ],
  },
  {
    label: "NEST LABS",
    items: [
      { label: "Tech Stack", href: "/tech-stack", icon: Wrench, desc: "APIs & Subscriptions" },
      { label: "Data Connectors", href: "/data-connectors", icon: Radio },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-[#03060b]">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-[#040810]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <NestMark className="h-7 w-7" />
          <div>
            <p className="font-[Cormorant_Garamond] text-lg font-semibold tracking-[0.14em] text-[#C4A048]">NEST</p>
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.1em] text-slate-500">Digital Investment Bank</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-3">
              <p className="mb-1 px-2 font-mono text-[0.5rem] font-bold uppercase tracking-[0.18em] text-slate-600">
                {section.label}
              </p>
              {section.items.map((item: any) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openDropdown === item.label;
                const active = location === item.href || location.startsWith(item.href + "/");
                const childActive = hasChildren && item.children.some((c: any) => location === c.href);

                if (hasChildren) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                        className={`mb-0.5 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                          isOpen || childActive
                            ? "bg-cyan-400/10 text-cyan-200"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon size={14} className={isOpen || childActive ? "text-cyan-300" : "text-slate-500"} />
                          <span className="font-mono text-[0.68rem] uppercase tracking-[0.06em]">{item.label}</span>
                        </span>
                        <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""} text-slate-500`} />
                      </button>
                      {isOpen && (
                        <div className="ml-5 border-l border-white/5 pl-2">
                          {item.children.map((child: any) => {
                            const CIcon = child.icon;
                            const cActive = location === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`mb-0.5 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all ${
                                  cActive
                                    ? "bg-cyan-400/15 text-cyan-200"
                                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                                }`}
                              >
                                <CIcon size={12} className={cActive ? "text-cyan-300" : "text-slate-600"} />
                                <span className="font-mono text-[0.62rem] uppercase tracking-[0.06em]">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
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
