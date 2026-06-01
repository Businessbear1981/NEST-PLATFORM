'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import NestMark from '@/components/NestMark'

const NAV_SECTIONS = [
  {
    label: 'COMMAND',
    items: [
      { label: 'Dashboard', href: '/v4/dashboard', icon: Gauge },
      { label: 'Pipeline', href: '/v4/deals', icon: GitBranch },
      { label: 'Bernard', href: '/v4/bernard', icon: Bot },
    ],
  },
  {
    label: 'ORIGINATION',
    items: [
      { label: 'EagleEye', href: '/v4/eagleeye', icon: Eye },
      { label: 'M&A Intel', href: '/v4/ma', icon: Search },
      { label: 'Bullseye Pitch', href: '/v4/marketing', icon: Megaphone },
      { label: 'Boxing Out', href: '/v4/boxing-out', icon: Swords },
    ],
  },
  {
    label: 'INTAKE',
    items: [
      { label: 'Deal Entry', href: '/v4/deal-input', icon: Inbox },
      { label: 'Roots — Docs', href: '/v4/roots', icon: TreePine },
      { label: 'Preflight', href: '/v4/preflight', icon: CheckCircle2 },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { label: 'Credit', href: '/v4/credit', icon: CreditCard },
      { label: 'Modeling', href: '/v4/modeling', icon: LineChart },
      { label: 'Feasibility', href: '/v4/feasibility', icon: FlaskConical },
      { label: 'Risk', href: '/v4/risk', icon: AlertTriangle },
    ],
  },
  {
    label: 'STRUCTURING',
    items: [
      { label: 'Bond Desk', href: '/v4/bond-desk', icon: Landmark },
      { label: 'Bond Intel', href: '/v4/bond-intel', icon: Activity },
      { label: 'Enhancement', href: '/v4/surety', icon: Shield },
      { label: 'Pricing', href: '/v4/pricing', icon: Tag },
    ],
  },
  {
    label: 'RATING',
    items: [
      { label: 'Rating Desk', href: '/v4/rating', icon: BarChart3 },
    ],
  },
  {
    label: 'PLACEMENT',
    items: [
      { label: 'Hawkeye', href: '/v4/hawkeye', icon: Target },
      { label: 'Lenders', href: '/v4/lenders', icon: HandCoins },
    ],
  },
  {
    label: 'CLOSING',
    items: [
      { label: 'Documents', href: '/v4/documents', icon: FileText },
      { label: 'Legal / Atticus', href: '/v4/atticus', icon: Gavel },
      { label: 'Cost Estimate', href: '/v4/cost-estimate', icon: Calculator },
    ],
  },
  {
    label: 'MONITORING',
    items: [
      { label: 'Surveillance', href: '/v4/surveillance', icon: Binoculars },
      { label: 'NightVision', href: '/v4/nightvision', icon: Moon },
      { label: 'EMMA', href: '/v4/emma', icon: Database },
      { label: 'Construction', href: '/v4/construction', icon: HardHat },
    ],
  },
  {
    label: 'AUDIT & FEASIBILITY',
    items: [
      { label: 'Feasibility Desk', href: '/v4/feasibility-desk', icon: ClipboardList },
      { label: 'Audit Desk', href: '/v4/audit-desk', icon: FileCheck },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Treasury', href: '/v4/treasury', icon: Wallet },
      { label: 'AI Tools', href: '/v4/agents', icon: Cpu },
      { label: 'Admin', href: '/v4/admin', icon: Lock },
    ],
  },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''

  return (
    <div className="flex min-h-screen bg-[#03060b]">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-[#040810]">
        {/* Logo */}
        <Link href="/v4" className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
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
                const Icon = item.icon
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all ${
                      active
                        ? 'bg-cyan-400/15 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.1)]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-cyan-300' : 'text-slate-500'} />
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.06em]">{item.label}</span>
                  </Link>
                )
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
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
