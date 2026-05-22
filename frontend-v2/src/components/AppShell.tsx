import { Link, useLocation } from "wouter";
import {
  Eye, TreePine, Landmark, Target, Shield, Bot,
  Scale, FileCheck, Users, ClipboardCheck, Lock,
  BarChart3, Building2, Briefcase, Radio, Flame, Wallet,
  LayoutDashboard, Crosshair, HandCoins, UserCircle, Settings,
  Megaphone, Calculator, Search, Wrench, Video, FileText, CreditCard,
} from "lucide-react";
import NestMark from "./NestMark";

const NAV_SECTIONS = [
  {
    label: "WORKFLOW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Command Center", href: "/command-center", icon: Radio },
      { label: "Deal Intake", href: "/deal-intake", icon: Briefcase },
      { label: "Operations", href: "/operations/deals", icon: Building2 },
      { label: "Investor Dashboard", href: "/investor-dashboard", icon: BarChart3 },
      { label: "Partner Dashboard", href: "/partner-dashboard", icon: HandCoins },
      { label: "Client Dashboard", href: "/client-dashboard", icon: UserCircle },
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
    label: "COMPLIANCE",
    items: [
      { label: "NightVision", href: "/nightvision", icon: Shield, desc: "Monitoring" },
      { label: "Atticus", href: "/atticus", icon: Scale, desc: "Counsel / CCO" },
      { label: "KYC", href: "/kyc", icon: Lock },
      { label: "Covenant Monitor", href: "/covenants", icon: ClipboardCheck },
    ],
  },
  {
    label: "NEST SUITE",
    items: [
      { label: "C-Suite", href: "/c-suite", icon: LayoutDashboard, desc: "ORCA Management Lair" },
      { label: "Agent Platform", href: "/agents/platform", icon: Bot },
      { label: "Data Connectors", href: "/data-connectors", icon: Radio },
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
