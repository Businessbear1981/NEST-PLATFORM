'use client'
import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, FileText, RadioTower, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'

interface RatingAction {
  id: string
  issuer: string
  agency: "Moody's" | 'S&P'
  date: Date
  action: 'upgrade' | 'downgrade' | 'affirm' | 'watch'
  oldRating: string
  newRating: string
  outlook: 'positive' | 'stable' | 'negative'
  rationale: string
  affectedBonds: string[]
}

interface CreditMemo {
  id: string
  issuer: string
  date: Date
  rating: string
  outlook: string
  strengths: string[]
  risks: string[]
  keyMetrics: Record<string, string>
  recommendation: 'buy' | 'hold' | 'sell'
}

const DEMO_RATING_ACTIONS: RatingAction[] = [
  {
    id: 'ra-001',
    issuer: 'NEST Mixed-Use Portfolio',
    agency: "Moody's",
    date: new Date(Date.now() - 86400000),
    action: 'affirm',
    oldRating: 'Baa1',
    newRating: 'Baa1',
    outlook: 'stable',
    rationale: 'Strong occupancy trends and stable cash flows support current rating.',
    affectedBonds: ['bond-001'],
  },
  {
    id: 'ra-002',
    issuer: 'NEST Hospitality Portfolio',
    agency: 'S&P',
    date: new Date(Date.now() - 172800000),
    action: 'watch',
    oldRating: 'Ba2',
    newRating: 'Ba2',
    outlook: 'negative',
    rationale: 'Elevated debt levels and market softness warrant closer monitoring.',
    affectedBonds: ['bond-002'],
  },
  {
    id: 'ra-003',
    issuer: 'NEST CCRC Portfolio',
    agency: "Moody's",
    date: new Date(Date.now() - 259200000),
    action: 'upgrade',
    oldRating: 'Baa3',
    newRating: 'Baa2',
    outlook: 'stable',
    rationale: 'Improved occupancy and operational efficiency drive upgrade.',
    affectedBonds: ['bond-004'],
  },
]

const DEMO_CREDIT_MEMOS: CreditMemo[] = [
  {
    id: 'cm-001',
    issuer: 'NEST Mixed-Use Portfolio',
    date: new Date(Date.now() - 604800000),
    rating: 'Baa1',
    outlook: 'Stable',
    strengths: ['Diversified tenant base across retail and office', 'Strong location in high-traffic market', 'Experienced management team', 'Stable cash flows'],
    risks: ['Retail sector headwinds', 'Office space oversupply in market', 'Interest rate sensitivity'],
    keyMetrics: { DSCR: '1.45x', LTV: '62%', Occupancy: '94%', 'Avg Lease Term': '5.2 years' },
    recommendation: 'buy',
  },
  {
    id: 'cm-002',
    issuer: 'NEST Hospitality Portfolio',
    date: new Date(Date.now() - 1209600000),
    rating: 'Ba2',
    outlook: 'Negative',
    strengths: ['Premium brand positioning', 'Strong RevPAR growth', 'Renovation completed'],
    risks: ['Travel demand uncertainty', 'Elevated leverage', 'Labor cost inflation', 'Competitive market pressure'],
    keyMetrics: { DSCR: '1.15x', LTV: '75%', Occupancy: '78%', RevPAR: '$185' },
    recommendation: 'hold',
  },
]

/* ── Moody's Recon Feed (inlined) ── */
function MoodysReconFeed() {
  const [events] = useState([
    { id: 1, type: 'watch', issuer: 'Office REIT Portfolio', date: new Date(Date.now() - 3600000), detail: 'Placed on review for downgrade due to rising vacancy rates and tenant rollover risk.' },
    { id: 2, type: 'affirm', issuer: 'Municipal Water Authority', date: new Date(Date.now() - 7200000), detail: 'Affirmed at Aa2 with stable outlook. Strong revenue coverage and essential-service profile.' },
    { id: 3, type: 'upgrade', issuer: 'Regional Health System', date: new Date(Date.now() - 14400000), detail: 'Upgraded to A1 from A2 reflecting improved operating margins and debt reduction.' },
  ])
  const [acked, setAcked] = useState<number[]>([])
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">
        <RadioTower size={14} /> {"Moody's real-time recon feed"}
      </p>
      <div className="mt-4 space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className={`rounded-lg border p-4 transition-all ${acked.includes(ev.id) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-cyan-500/20 bg-cyan-500/5'}`}>
            <div className="mb-2 flex items-start justify-between">
              <div>
                <span className={`mr-2 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${ev.type === 'watch' ? 'bg-yellow-500/20 text-yellow-100' : ev.type === 'upgrade' ? 'bg-emerald-500/20 text-emerald-100' : 'bg-blue-500/20 text-blue-100'}`}>{ev.type}</span>
                <span className="text-sm font-semibold text-white">{ev.issuer}</span>
              </div>
              <span className="text-xs text-slate-400">{ev.date.toLocaleTimeString()}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">{ev.detail}</p>
            {!acked.includes(ev.id) && (
              <button onClick={() => setAcked([...acked, ev.id])} className="mt-2 rounded bg-cyan-600 px-3 py-1 text-xs text-white hover:bg-cyan-500">Acknowledge</button>
            )}
            {acked.includes(ev.id) && <p className="mt-2 text-xs text-emerald-400">Acknowledged</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── S&P Recon Feed (inlined) ── */
function SPReconFeed() {
  const [events] = useState([
    { id: 1, type: 'downgrade', issuer: 'Hospitality Group Holdings', date: new Date(Date.now() - 5400000), detail: 'Downgraded to BB+ from BBB- reflecting elevated leverage post-acquisition and RevPAR softness.' },
    { id: 2, type: 'affirm', issuer: 'State Transportation Authority', date: new Date(Date.now() - 10800000), detail: 'Affirmed at AA- with positive outlook. Strong toll revenue growth and conservative debt policy.' },
    { id: 3, type: 'watch', issuer: 'Senior Living Operator', date: new Date(Date.now() - 21600000), detail: 'Placed on CreditWatch negative due to occupancy decline and labor cost pressure.' },
  ])
  const [acked, setAcked] = useState<number[]>([])
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">
        <RadioTower size={14} /> S&P real-time recon feed
      </p>
      <div className="mt-4 space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className={`rounded-lg border p-4 transition-all ${acked.includes(ev.id) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-cyan-500/20 bg-cyan-500/5'}`}>
            <div className="mb-2 flex items-start justify-between">
              <div>
                <span className={`mr-2 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${ev.type === 'downgrade' ? 'bg-red-500/20 text-red-100' : ev.type === 'watch' ? 'bg-yellow-500/20 text-yellow-100' : 'bg-blue-500/20 text-blue-100'}`}>{ev.type}</span>
                <span className="text-sm font-semibold text-white">{ev.issuer}</span>
              </div>
              <span className="text-xs text-slate-400">{ev.date.toLocaleTimeString()}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">{ev.detail}</p>
            {!acked.includes(ev.id) && (
              <button onClick={() => setAcked([...acked, ev.id])} className="mt-2 rounded bg-cyan-600 px-3 py-1 text-xs text-white hover:bg-cyan-500">Acknowledge</button>
            )}
            {acked.includes(ev.id) && <p className="mt-2 text-xs text-emerald-400">Acknowledged</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Methodology Version Diff (inlined) ── */
function MethodologyVersionDiff() {
  const diffs = [
    { field: 'DSCR threshold (investment grade)', oldVal: '1.40x', newVal: '1.50x', impact: 'Tighter — deals near 1.40x may slip below IG cutoff.' },
    { field: 'Liquidity days-cash minimum', oldVal: '90 days', newVal: '120 days', impact: 'Operators with thin cash reserves face score reduction.' },
    { field: 'Governance weight', oldVal: '10%', newVal: '15%', impact: 'Board composition and audit controls carry more weight.' },
  ]
  const [rescored, setRescored] = useState(false)
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-6 text-slate-100">
      <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">
        Methodology version diff — v2024.3 vs v2025.1
      </p>
      <div className="mt-4 space-y-3">
        {diffs.map((d) => (
          <div key={d.field} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm font-semibold text-white">{d.field}</p>
            <div className="mt-2 flex items-center gap-4 font-mono text-xs">
              <span className="text-red-400 line-through">{d.oldVal}</span>
              <span className="text-slate-500">{'-->'}</span>
              <span className="text-emerald-400">{d.newVal}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{d.impact}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => setRescored(true)}
        disabled={rescored}
        className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
      >
        {rescored ? 'Rescore queued for affected deals' : 'Trigger rescore on affected deals'}
      </button>
    </div>
  )
}

/* ── Main Page ── */
export default function RatingIntelligencePage() {
  const [selectedAction, setSelectedAction] = useState<RatingAction | null>(DEMO_RATING_ACTIONS[0])
  const [memoDraft, setMemoDraft] = useState('No memo draft routed yet.')
  const [reconPulse, setReconPulse] = useState(0)
  const [activeTab, setActiveTab] = useState('actions')
  const reconEvents = [
    "Moody's office-watch update received",
    'S&P hospitality stress trigger received',
    'Methodology threshold delta synced to affected-deal queue',
  ]
  const currentReconEvent = reconPulse === 0 ? 'Awaiting next agency feed pulse.' : reconEvents[(reconPulse - 1) % reconEvents.length]

  const getActionColor = (action: RatingAction['action']) => {
    switch (action) {
      case 'upgrade': return 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30'
      case 'downgrade': return 'bg-red-500/20 text-red-100 border-red-500/30'
      case 'watch': return 'bg-yellow-500/20 text-yellow-100 border-yellow-500/30'
      case 'affirm': return 'bg-blue-500/20 text-blue-100 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-100 border-gray-500/30'
    }
  }

  const getOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-emerald-400" />
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-400" />
      default: return <Clock className="h-4 w-4 text-amber-400" />
    }
  }

  const tabs = ['actions', 'moodys', 'sp', 'memos', 'methodology', 'routing']
  const tabLabels: Record<string, string> = { actions: 'Actions', moodys: "Moody's", sp: 'S&P', memos: 'Memos', methodology: 'Methodology', routing: 'Routing' }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">
              <RadioTower size={14} /> Rating Intelligence & Recon - working demo console
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Rating Intelligence & Recon</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
              {"Moody's and S&P recon feeds, rating actions, memo routing, and methodology-diff rescoring are exposed as separate interactive workflows instead of static cards."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-slate-500">Actions</p>
              <p className="text-lg font-semibold text-cyan-100">{DEMO_RATING_ACTIONS.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-slate-500">Memos</p>
              <p className="text-lg font-semibold text-amber-100">{DEMO_CREDIT_MEMOS.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-slate-500">Mode</p>
              <p className="text-lg font-semibold text-emerald-100">LIVE</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-300/20 bg-[#06111d]/90 p-4 text-slate-100">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <RadioTower size={14} /> Recon subscription pulse
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Pulse {reconPulse}: {currentReconEvent}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReconPulse((current) => current + 1)}
            className="w-fit rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
          >
            <RefreshCw className="mr-2 inline h-4 w-4" /> Pulse Recon Subscription
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="w-full">
        <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-slate-800/50 p-1 lg:grid-cols-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition-all ${activeTab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {activeTab === 'actions' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="h-fit rounded-xl border border-slate-700 bg-slate-900/70 p-4 lg:col-span-1">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Actions</h2>
                <div className="space-y-2">
                  {DEMO_RATING_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => setSelectedAction(action)}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        selectedAction?.id === action.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="mb-1 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-muted-foreground">{action.agency}</p>
                          <p className="truncate text-sm font-semibold text-foreground">{action.issuer}</p>
                        </div>
                        <span className={`whitespace-nowrap rounded border px-2 py-0.5 text-xs font-semibold ${getActionColor(action.action)}`}>
                          {action.action.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{action.date.toLocaleDateString()}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedAction && (
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6 lg:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{selectedAction.issuer}</h3>
                          <p className="text-sm text-muted-foreground">{selectedAction.agency} - {selectedAction.date.toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getOutlookIcon(selectedAction.outlook)}
                          <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${getActionColor(selectedAction.action)}`}>{selectedAction.action.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 rounded-lg bg-slate-800/30 p-4">
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">Previous Rating</p>
                          <p className="text-2xl font-bold text-foreground">{selectedAction.oldRating}</p>
                        </div>
                        <div className="flex items-center justify-center">
                          {selectedAction.action === 'upgrade' ? <TrendingUp className="h-6 w-6 text-emerald-400" /> : selectedAction.action === 'downgrade' ? <TrendingDown className="h-6 w-6 text-red-400" /> : <span className="text-muted-foreground">{'-->'}</span>}
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">New Rating</p>
                          <p className="text-2xl font-bold text-foreground">{selectedAction.newRating}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-foreground">Rationale</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">{selectedAction.rationale}</p>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-foreground">Affected Bonds</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAction.affectedBonds.map((bond) => <span key={bond} className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200">{bond}</span>)}
                      </div>
                    </div>

                    <button
                      className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                      onClick={() => setMemoDraft(`${selectedAction.agency} ${selectedAction.action} action for ${selectedAction.issuer} routed into credit memo update queue.`)}
                    >
                      <FileText className="mr-2 inline h-4 w-4" /> Route Action to Memo Draft
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'moodys' && (
          <div className="mt-4">
            <MoodysReconFeed />
          </div>
        )}

        {activeTab === 'sp' && (
          <div className="mt-4">
            <SPReconFeed />
          </div>
        )}

        {activeTab === 'memos' && (
          <div className="mt-4 space-y-4">
            {DEMO_CREDIT_MEMOS.map((memo) => (
              <div key={memo.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                  <div><p className="mb-1 text-xs text-muted-foreground">Issuer</p><p className="text-lg font-bold text-foreground">{memo.issuer}</p></div>
                  <div><p className="mb-1 text-xs text-muted-foreground">Rating</p><p className="text-lg font-bold text-amber-400">{memo.rating}</p></div>
                  <div><p className="mb-1 text-xs text-muted-foreground">Outlook</p><p className="text-lg font-bold text-blue-400">{memo.outlook}</p></div>
                  <div><p className="mb-1 text-xs text-muted-foreground">Recommendation</p><span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${memo.recommendation === 'buy' ? 'bg-emerald-500/20 text-emerald-100' : memo.recommendation === 'hold' ? 'bg-yellow-500/20 text-yellow-100' : 'bg-red-500/20 text-red-100'}`}>{memo.recommendation.toUpperCase()}</span></div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-emerald-400">Strengths</h4>
                    <ul className="space-y-2">{memo.strengths.map((strength) => <li key={strength} className="flex items-start gap-2 text-sm text-foreground"><CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" /><span>{strength}</span></li>)}</ul>
                  </div>
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-red-400">Risks</h4>
                    <ul className="space-y-2">{memo.risks.map((risk) => <li key={risk} className="flex items-start gap-2 text-sm text-foreground"><AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" /><span>{risk}</span></li>)}</ul>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {Object.entries(memo.keyMetrics).map(([key, value]) => <div key={key} className="rounded-lg bg-slate-800/30 p-3"><p className="mb-1 text-xs text-muted-foreground">{key}</p><p className="text-lg font-bold text-cyan-400">{value}</p></div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'methodology' && (
          <div className="mt-4">
            <MethodologyVersionDiff />
          </div>
        )}

        {activeTab === 'routing' && (
          <div className="mt-4">
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/5 p-6">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-emerald-200">Memo routing status</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">Credit memo queue is interactive</h3>
              <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-muted-foreground">{memoDraft}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {"Use the Actions tab to route a rating event, then return here to verify the visible state change. Moody's, S&P, and methodology feeds each maintain their own acknowledgement/routing state."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
