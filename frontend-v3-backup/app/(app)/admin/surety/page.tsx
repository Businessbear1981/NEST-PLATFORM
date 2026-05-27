'use client'
import { useState } from 'react'
import { AlertCircle, BadgeDollarSign, CheckCircle, Clock, FileCheck, Layers3, Send, ShieldCheck } from 'lucide-react'

interface UnderwritingGap {
  id: string
  category: string
  item: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  dueDate: Date
}

interface Provider {
  id: string
  name: string
  rating: string
  capacity: number
  premiumRange: [number, number]
  turnaround: number
  specialties: string[]
}

interface Quote {
  id: string
  provider: string
  coverage: number
  term: number
  premium: number
  riskFactors: string[]
  status: 'pending' | 'quoted' | 'accepted' | 'rejected'
}

const gaps: UnderwritingGap[] = [
  { id: 'gap-1', category: 'Construction', item: 'Contractor financial statements (last 3 years)', severity: 'critical', status: 'open', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
  { id: 'gap-2', category: 'Insurance', item: 'General liability policy with NEST as additional insured', severity: 'critical', status: 'in-progress', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  { id: 'gap-3', category: 'Title', item: 'Title insurance commitment', severity: 'high', status: 'open', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  { id: 'gap-4', category: 'Appraisal', item: 'Updated property appraisal', severity: 'medium', status: 'resolved', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
]

const suretyCommandRails = [
  ['Insurance evidence', 'GL, builder risk, title, environmental, completion, and indemnity evidence feeds the credit file.'],
  ['Surety wrap economics', 'Premium scenarios test whether a wrap can improve rating posture, spread guidance, and investor appetite.'],
  ['Carrier submission', 'Provider packets, quote requests, exceptions, and negotiated terms are retained before market launch.'],
  ['Offering gate', 'Bond sales cannot leave the platform until surety, rating, and compliance gates are cleared.'],
]

const offeringHandoffs = [
  ['Pre-market clearance', 'Resolve critical underwriting gaps and mark packet as approved before building investor books.'],
  ['Credit enhancement note', 'Attach wrap economics, carrier quote, coverage amount, exclusions, and effective/expiration dates to the offering memo.'],
  ['Sales desk routing', 'Route cleared bonds into the Offering Sales Desk for pooled or single-bond distribution.'],
]

const threeCsScore = [
  ['Character', '84 / 100', 'Sponsor track record, references, claims/litigation history, key-person resumes, and management reputation.'],
  ['Capacity', '79 / 100', 'Backlog, WIP schedule, similar-project completion history, workforce/equipment readiness, and operational controls.'],
  ['Capital', '81 / 100', 'Liquidity, net worth, working capital, audited statements, retained earnings, and leverage/cash-flow strength.'],
]

const lcSuretyOptions = [
  ['Surety wrap', '0.50% - 1.50% premium', 'Potential rating enhancement and investor confidence when carrier terms are approved.'],
  ['Cash-secured LC', 'Collateral reserve burden', 'Bank letter-of-credit support can substitute for or supplement a surety wrap, but traps liquidity.'],
  ['Insurance evidence', 'Policy and exclusion review', 'GL, builder risk, title, environmental, and parametric trigger language supports underwriting diligence.'],
  ['Collateral support', 'Negotiated reserve or pledge', 'Useful when capacity is pending or carrier exclusions require supplemental protection.'],
]

const providers: Provider[] = [
  { id: 'prov-1', name: 'Apex Surety Partners', rating: 'A+', capacity: 500000000, premiumRange: [0.5, 1.2], turnaround: 3, specialties: ['Mixed-use', 'Multifamily', 'Hospitality'] },
  { id: 'prov-2', name: 'Sterling Bond Group', rating: 'A', capacity: 350000000, premiumRange: [0.6, 1.3], turnaround: 5, specialties: ['Multifamily', 'Retail', 'Office'] },
  { id: 'prov-3', name: 'Bridge Insurance Solutions', rating: 'A', capacity: 250000000, premiumRange: [0.7, 1.5], turnaround: 7, specialties: ['Construction', 'Development', 'Hospitality'] },
]

/* ── Surety Submission Checklist (inlined) ── */
function SuretySubmissionChecklist() {
  const items = [
    { label: 'Contractor financial statements (3 years)', done: false },
    { label: 'Bank reference letter', done: true },
    { label: 'Work-in-progress schedule', done: false },
    { label: 'Completed project list (5 years)', done: true },
    { label: 'Organizational documents (articles, bylaws)', done: false },
    { label: 'Personal financial statements (indemnitors)', done: false },
    { label: 'Current year interim financials', done: true },
    { label: 'Insurance certificates (GL, auto, umbrella)', done: false },
  ]
  const [checked, setChecked] = useState<boolean[]>(items.map(i => i.done))
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">Surety submission checklist</p>
      <div className="mt-4 space-y-2">
        {items.map((item, i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 p-3 transition-all hover:bg-white/[0.02]">
            <input type="checkbox" checked={checked[i]} onChange={() => { const n = [...checked]; n[i] = !n[i]; setChecked(n) }} className="h-4 w-4 accent-cyan-500" />
            <span className={`text-sm ${checked[i] ? 'text-emerald-400 line-through' : 'text-slate-200'}`}>{item.label}</span>
          </label>
        ))}
      </div>
      <p className="mt-3 font-mono text-xs text-slate-500">{checked.filter(Boolean).length} / {items.length} complete</p>
    </div>
  )
}

/* ── Underwriting Gaps Panel (inlined) ── */
function UnderwritingGapsPanel() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10'
      case 'high': return 'text-orange-400 bg-orange-500/10'
      case 'medium': return 'text-yellow-400 bg-yellow-500/10'
      case 'low': return 'text-green-400 bg-green-500/10'
      default: return 'text-slate-400'
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />
      case 'in-progress': return <Clock className="h-4 w-4 animate-spin" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      default: return null
    }
  }
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">Underwriting gaps</p>
      <div className="mt-4 space-y-3">
        {gaps.map((gap) => (
          <div key={gap.id} className="flex items-start gap-3 rounded-lg border border-white/5 p-4">
            <div className={`mt-0.5 ${getSeverityColor(gap.severity)}`}>{getStatusIcon(gap.status)}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`mr-2 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${getSeverityColor(gap.severity)}`}>{gap.severity}</span>
                  <span className="text-xs text-slate-400">{gap.category}</span>
                </div>
                <span className="text-xs text-slate-500">Due: {gap.dueDate.toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-sm text-slate-200">{gap.item}</p>
              <span className={`mt-1 inline-block text-xs ${gap.status === 'resolved' ? 'text-emerald-400' : gap.status === 'in-progress' ? 'text-amber-400' : 'text-slate-500'}`}>{gap.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Surety Packet Prep (inlined) ── */
function SuretyPacketPrep() {
  const sections = [
    { title: 'Financial Statements', items: ['3-year audited financials', 'Current year interim', 'Personal financial statements'], complete: 1, total: 3 },
    { title: 'Bank & Trade References', items: ['Bank reference letter', 'Trade references (minimum 5)'], complete: 1, total: 2 },
    { title: 'Project Documentation', items: ['WIP schedule', 'Completed project list', 'Backlog report'], complete: 0, total: 3 },
    { title: 'Organization & Legal', items: ['Articles of incorporation', 'Bylaws', 'Key person resumes'], complete: 0, total: 3 },
  ]
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">Surety packet preparation</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map((sec) => (
          <div key={sec.title} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{sec.title}</p>
              <span className="font-mono text-xs text-slate-400">{sec.complete}/{sec.total}</span>
            </div>
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${(sec.complete / sec.total) * 100}%` }} />
            </div>
            <ul className="space-y-1">
              {sec.items.map((item, i) => (
                <li key={i} className={`text-xs ${i < sec.complete ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {i < sec.complete ? '+ ' : '- '}{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Premium Scenario Builder (inlined) ── */
function PremiumScenarioBuilder() {
  const scenarios = [
    { name: 'Base case', premium: 0.85, coverage: 25000000, rating: 'A-', spread: '+145bps' },
    { name: 'Enhanced wrap', premium: 1.10, coverage: 35000000, rating: 'A', spread: '+120bps' },
    { name: 'Minimal wrap', premium: 0.55, coverage: 15000000, rating: 'BBB+', spread: '+175bps' },
  ]
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">Premium scenario builder</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {scenarios.map((s) => (
          <div key={s.name} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm font-semibold text-white">{s.name}</p>
            <div className="mt-3 space-y-2 font-mono text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Premium</span><span className="text-amber-300">{s.premium}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Coverage</span><span className="text-white">${(s.coverage / 1e6).toFixed(0)}M</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Rating lift</span><span className="text-cyan-300">{s.rating}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Spread</span><span className="text-emerald-300">{s.spread}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Carrier Submission Form (inlined) ── */
function CarrierSubmissionForm({ providers: provs, quotes, onRequestQuote, onAcceptQuote }: { providers: Provider[]; quotes: Quote[]; onRequestQuote: (p: Provider) => void; onAcceptQuote: (id: string) => void }) {
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">Carrier submission & quote tracking</p>
      {quotes.length > 0 && (
        <div className="mt-4 space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-semibold text-white">{q.provider}</p>
                <p className="font-mono text-xs text-slate-400">${(q.coverage / 1e6).toFixed(0)}M coverage | {q.term}yr term | ${q.premium.toLocaleString()} premium</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${q.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-100' : q.status === 'pending' ? 'bg-yellow-500/20 text-yellow-100' : 'bg-slate-700 text-slate-300'}`}>{q.status}</span>
                {q.status === 'pending' && (
                  <button onClick={() => onAcceptQuote(q.id)} className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500">Accept</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {quotes.length === 0 && <p className="mt-4 text-sm text-slate-400">No quotes requested yet. Use the Providers tab to request quotes.</p>}
    </div>
  )
}

/* ── Surety Approval Workflow (inlined) ── */
function SuretyApprovalWorkflow() {
  const gates = [
    { name: 'Underwriting gaps cleared', status: 'pending' },
    { name: 'Carrier quote accepted', status: 'pending' },
    { name: 'Risk review sign-off', status: 'pending' },
    { name: 'Pricing committee approval', status: 'pending' },
    { name: 'Legal review of exclusions', status: 'pending' },
    { name: 'Final release to offering desk', status: 'blocked' },
  ]
  const [gateStatus, setGateStatus] = useState(gates.map(g => g.status))
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">Approval workflow gates</p>
      <div className="mt-4 space-y-3">
        {gates.map((gate, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 p-4">
            <div className="flex items-center gap-3">
              {gateStatus[i] === 'approved' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : gateStatus[i] === 'blocked' ? <AlertCircle className="h-5 w-5 text-red-400" /> : <Clock className="h-5 w-5 text-amber-400" />}
              <span className="text-sm text-slate-200">{gate.name}</span>
            </div>
            {gateStatus[i] !== 'approved' && gateStatus[i] !== 'blocked' && (
              <button onClick={() => { const n = [...gateStatus]; n[i] = 'approved'; setGateStatus(n) }} className="rounded bg-cyan-600 px-3 py-1 text-xs text-white hover:bg-cyan-500">Approve</button>
            )}
            {gateStatus[i] === 'approved' && <span className="text-xs text-emerald-400">Approved</span>}
            {gateStatus[i] === 'blocked' && <span className="text-xs text-red-400">Blocked</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function CompleteSuretyPage() {
  const [activeTab, setActiveTab] = useState('gaps')
  const [quotes, setQuotes] = useState<Quote[]>([])

  const handleRequestQuote = (provider: Provider) => {
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      provider: provider.name,
      coverage: 25000000,
      term: 5,
      premium: Math.round((25000000 * (provider.premiumRange[0] + provider.premiumRange[1]) / 2) / 10000),
      riskFactors: ['Construction phase', 'Market conditions', 'Sponsor strength'],
      status: 'pending',
    }
    setQuotes([newQuote, ...quotes])
    setActiveTab('carrier')
  }

  const handleAcceptQuote = (quoteId: string) => {
    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) => (quote.id === quoteId ? { ...quote, status: 'accepted' as const } : quote)),
    )
    setActiveTab('approval')
  }

  const tabItems = [
    { key: 'gaps', label: 'Checklist' },
    { key: 'providers', label: 'Providers' },
    { key: 'packet', label: 'Packet' },
    { key: 'carrier', label: 'Carrier' },
    { key: 'approval', label: 'Approval' },
  ]

  return (
    <div className="space-y-6" data-testid="complete-surety-module">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-cyan-300/25 bg-[#061018] p-5 text-slate-100 shadow-[0_0_85px_rgba(34,211,238,0.11)] sm:p-7" data-testid="surety-command-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(34,211,238,0.17),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(16,185,129,0.15),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" /> Restored first-class capital protection module
            </div>
            <h1 className="mt-4 flex items-center gap-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
              <FileCheck className="h-9 w-9 text-cyan-300" /> Insurance & Surety Command
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Insurance and surety are core NEST infrastructure, not a side panel. This command room manages underwriting gaps, carrier capacity, coverage evidence, surety wrap economics, quote negotiation, and the approval gates that determine whether a bond can move into sales distribution.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/admin/bond-desk" className="inline-flex items-center rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                <BadgeDollarSign className="mr-2 h-4 w-4" /> Send cleared bond to offering desk
              </a>
              <button type="button" onClick={() => setActiveTab('packet')} className="inline-flex items-center rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/15">
                <Layers3 className="mr-2 h-4 w-4" /> Open wrap packet
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ['Coverage target', '$25M', 'initial demonstration layer'],
              ['Carrier lanes', providers.length.toString(), 'qualified provider options'],
              ['Critical gaps', gaps.filter((gap) => gap.severity === 'critical' && gap.status !== 'resolved').length.toString(), 'must clear before launch'],
              ['Premium corridor', '0.5% - 1.5%', 'modeled provider range'],
            ] as const).map(([label, value, detail]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.045] p-4 text-slate-100 shadow-none">
                <p className="font-mono text-[0.63rem] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-4" aria-label="Insurance and surety command rails">
        {suretyCommandRails.map(([stage, description]) => (
          <div key={stage} className="rounded-xl border border-cyan-300/20 bg-slate-950/80 p-4 text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{stage}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3" aria-label="Three Cs underwriting scorecard">
        {threeCsScore.map(([label, score, detail]) => (
          <div key={label} className="rounded-xl border border-emerald-300/20 bg-slate-950/80 p-4 text-slate-100">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-emerald-200">{label}</p>
              <p className="text-lg font-black text-white">{score}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-300/25 bg-amber-400/10 p-6 text-slate-100" data-testid="lc-surety-comparison">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-100">
          <BadgeDollarSign className="h-5 w-5" /> LC / surety / insurance economics
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {lcSuretyOptions.map(([title, economics, detail]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-amber-200">{economics}</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4" aria-label="Insurance and surety workflow stages">
        {([
          ['Submission checklist', 'Gaps tab tracks required underwriting evidence and blocking items.'],
          ['Packet prep', 'Provider packet is assembled from financial statements, bank references, WIP schedules, completed project lists, organization documents, coverage requirements, and risk factors.'],
          ['Carrier submission', 'Provider quote requests create tracked carrier-submission records.'],
          ['Approval workflow', 'Risk, pricing, rating enhancement, carrier exclusions, parametric trigger language, and final approval gates remain visible before release.'],
        ] as const).map(([stage, description]) => (
          <div key={stage} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{stage}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="w-full">
        <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-slate-800/50 p-1 md:grid-cols-5 lg:w-auto">
          {tabItems.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition-all ${activeTab === t.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Submission checklist and underwriting gaps */}
        {activeTab === 'gaps' && (
          <div className="mt-6 space-y-4">
            <SuretySubmissionChecklist />
            <UnderwritingGapsPanel />
          </div>
        )}

        {/* Provider Matching */}
        {activeTab === 'providers' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-0 transition-all hover:border-cyan-500/50">
                  <div className="border-b border-slate-700 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-cyan-400">{provider.name}</p>
                        <p className="mt-1 text-xs text-slate-400">Rating: {provider.rating}</p>
                      </div>
                      <span className="text-lg font-bold text-green-400">{provider.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="mb-1 text-xs text-slate-400">Capacity</p>
                      <p className="text-sm font-semibold text-slate-100">${(provider.capacity / 1000000).toFixed(0)}M</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-400">Premium Range</p>
                      <p className="text-sm font-semibold text-yellow-400">{provider.premiumRange[0]}% - {provider.premiumRange[1]}%</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-400">Turnaround</p>
                      <p className="text-sm font-semibold text-slate-100">{provider.turnaround} days</p>
                    </div>
                    <div>
                      <p className="mb-2 text-xs text-slate-400">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((spec, i) => (
                          <span key={i} className="rounded bg-slate-700 px-2 py-1 text-xs text-cyan-400">{spec}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRequestQuote(provider)}
                      className="mt-2 w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packet preparation and premium modeling */}
        {activeTab === 'packet' && (
          <div className="mt-6 space-y-4">
            <SuretyPacketPrep />
            <PremiumScenarioBuilder />
          </div>
        )}

        {/* Carrier submission and quote tracking */}
        {activeTab === 'carrier' && (
          <div className="mt-6 space-y-4">
            <CarrierSubmissionForm
              providers={providers}
              quotes={quotes}
              onRequestQuote={handleRequestQuote}
              onAcceptQuote={handleAcceptQuote}
            />
          </div>
        )}

        {/* Approval Workflow */}
        {activeTab === 'approval' && (
          <div className="mt-6 space-y-4">
            <SuretyApprovalWorkflow />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-6 text-slate-100" data-testid="surety-offering-handoff">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-100">
          <Send className="h-5 w-5" /> Surety-to-offering handoff
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {offeringHandoffs.map(([title, detail]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
