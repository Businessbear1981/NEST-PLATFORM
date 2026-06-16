'use client'
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDealState } from "@/contexts/DealStateContext"

const _API = process.env.NEXT_PUBLIC_API_URL || "https://api.ardanedgecapital.com"

interface OPBAResult {
  opba_score: number
  readiness_pct: number
  indicative_rating: string
  jpm_benchmark: string
  components: {
    dscr_contribution: number
    leverage_contribution: number
    liquidity_contribution: number
    qualitative: number
  }
  weights_used: { dscr: number; leverage: number; liquidity: number }
}

interface BondOption {
  bond_type: string
  amortization: string
  par_value: number
  par_label: string
  coupon_pct: number
  maturity_years: number
  dscr_yr1: number
  suitability_score: number
  green_eligible: boolean
  nest_fee_usd: number
  jpm_grade: string
}

interface AutoResult {
  opba: OPBAResult
  total_options: number
  recommendations: BondOption[]
  all_options: BondOption[]
  ai_recommendation: string
  weights_version: number
  phase_advanced_to: string
}

const RING_R = 36
const RING_C = 2 * Math.PI * RING_R

function OPBARing({ score }: { score: number }) {
  const pct = score / 12
  const dash = pct * RING_C
  const color = pct >= 0.75 ? "#C4A048" : pct >= 0.50 ? "#7A9A82" : "#ef4444"
  return (
    <svg width={96} height={96} className="rotate-[-90deg]">
      <circle cx={48} cy={48} r={RING_R} fill="none" stroke="#1E4A2E" strokeWidth={8} />
      <motion.circle
        cx={48} cy={48} r={RING_R}
        fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={RING_C}
        initial={{ strokeDashoffset: RING_C }}
        animate={{ strokeDashoffset: RING_C - dash }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

function OptionCard({ opt, rank }: { opt: BondOption; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
      className="rounded-xl border border-[#C4A048]/20 bg-[#0D2218] p-4 cursor-pointer hover:border-[#C4A048]/40 transition-colors"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {rank < 3 && (
              <span className="font-mono text-[0.45rem] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#C4A048]/15 text-[#C4A048]">
                #{rank + 1} REC
              </span>
            )}
            {opt.green_eligible && (
              <span className="font-mono text-[0.45rem] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#1E4A2E] text-[#7A9A82]">
                GREEN
              </span>
            )}
          </div>
          <p className="font-[Cormorant_Garamond] text-base font-semibold text-[#EDE8DC]">
            {opt.bond_type}
          </p>
          <p className="font-mono text-[0.6rem] text-[#7A9A82] mt-0.5">{opt.amortization}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-[IBM_Plex_Mono] text-lg font-bold text-[#C4A048]">{opt.par_label}</p>
          <p className="font-mono text-[0.6rem] text-[#7A9A82]">{opt.coupon_pct}% coupon</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { l: "DSCR Yr1",  v: `${opt.dscr_yr1}x` },
          { l: "Maturity",  v: `${opt.maturity_years}yr` },
          { l: "Suitability", v: `${opt.suitability_score}%` },
        ].map(({ l, v }) => (
          <div key={l} className="rounded bg-[#030A06] px-2 py-1.5 text-center">
            <p className="font-mono text-[0.5rem] uppercase tracking-widest text-[#7A9A82]">{l}</p>
            <p className="font-[IBM_Plex_Mono] text-sm font-semibold text-[#EDE8DC]">{v}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="border-t border-white/[0.06] pt-3 space-y-1">
              <p className="font-mono text-[0.55rem] text-[#7A9A82]">
                NEST arrangement fee: <span className="text-[#C4A048]">${(opt.nest_fee_usd / 1_000_000).toFixed(2)}M (2.25%)</span>
              </p>
              <p className="font-mono text-[0.55rem] text-[#7A9A82]">
                JPM benchmark: <span className="text-[#EDE8DC]">{opt.jpm_grade}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FullAutomationPanel() {
  const { state } = useDealState()
  const dealId    = state.activeDeal?.id

  const [running, setRunning]   = useState(false)
  const [result, setResult]     = useState<AutoResult | null>(null)
  const [error, setError]       = useState("")
  const [showAll, setShowAll]   = useState(false)

  const run = async () => {
    if (!dealId) return
    setRunning(true)
    setError("")
    setResult(null)
    try {
      const res  = await fetch(`${_API}/api/bond-workflow/deal/${dealId}/full-automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || "Automation failed")
      setResult(json.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
    }
  }

  if (!dealId) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0D2218] p-6 text-center">
        <p className="font-mono text-xs text-[#7A9A82]">Select an active deal to run full automation</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header + trigger */}
      <div className="rounded-xl border border-[#C4A048]/20 bg-[#0D2218] p-5 flex items-center justify-between gap-6">
        <div>
          <h2 className="font-[Cormorant_Garamond] text-2xl font-bold text-[#EDE8DC]">
            Full End-to-End Automation
          </h2>
          <p className="font-[Space_Grotesk] text-xs text-[#7A9A82] mt-1">
            S&P OPBA · All bond types · All par values · All amortization · Claude structure recommendation
          </p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="relative shrink-0 rounded-lg border border-[#C4A048] px-6 py-3 font-[Space_Grotesk] text-sm font-semibold text-[#C4A048] transition-all hover:bg-[#C4A048]/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? (
            <span className="flex items-center gap-2">
              <motion.div
                className="h-3 w-3 rounded-full border-2 border-[#C4A048] border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              RUNNING…
            </span>
          ) : "RUN FULL AUTOMATION"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/10 p-4">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* OPBA Score */}
            <div className="rounded-xl border border-[#C4A048]/20 bg-[#0D2218] p-5">
              <p className="font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82] mb-4">
                S&P OPBA Score · Self-Learning Weights v{result.weights_version}
              </p>
              <div className="flex items-center gap-8">
                <div className="relative">
                  <OPBARing score={result.opba.opba_score} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-[IBM_Plex_Mono] text-xl font-bold text-[#C4A048]">
                      {result.opba.opba_score}
                    </span>
                    <span className="font-mono text-[0.45rem] text-[#7A9A82]">/12</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-mono text-[0.5rem] uppercase tracking-widest text-[#7A9A82]">Indicative Rating</p>
                    <p className="font-[Cormorant_Garamond] text-2xl font-bold text-[#C4A048]">
                      {result.opba.indicative_rating}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[0.5rem] uppercase tracking-widest text-[#7A9A82]">JPM Benchmark</p>
                    <p className="font-[Space_Grotesk] text-xs text-[#EDE8DC]">{result.opba.jpm_benchmark}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[0.5rem] uppercase tracking-widest text-[#7A9A82] mb-1">Readiness</p>
                    <div className="h-1.5 w-full rounded-full bg-[#030A06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#C4A048] to-[#E8C87A]"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.opba.readiness_pct}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <p className="font-mono text-[0.5rem] text-[#7A9A82] mt-1">{result.opba.readiness_pct}%</p>
                  </div>
                </div>
                {/* Weight bars */}
                <div className="shrink-0 space-y-2">
                  <p className="font-mono text-[0.45rem] uppercase tracking-widest text-[#7A9A82] mb-2">
                    Live Weights
                  </p>
                  {Object.entries(result.opba.weights_used).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="font-mono text-[0.5rem] w-16 text-[#7A9A82] uppercase">{k}</span>
                      <div className="h-1 w-24 rounded-full bg-[#030A06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#C4A048]/60"
                          style={{ width: `${(v as number) * 100}%` }}
                        />
                      </div>
                      <span className="font-[IBM_Plex_Mono] text-[0.5rem] text-[#C4A048]">
                        {((v as number) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Claude recommendation */}
            {result.ai_recommendation && (
              <div className="rounded-xl border border-[#7A9A82]/20 bg-[#060E1A] p-5">
                <p className="font-mono text-[0.5rem] uppercase tracking-widest text-[#7A9A82] mb-2">
                  Morgan · Structure Recommendation
                </p>
                <p className="font-[Space_Grotesk] text-sm text-[#EDE8DC] leading-relaxed">
                  {result.ai_recommendation}
                </p>
              </div>
            )}

            {/* Bond options grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82]">
                  {result.total_options} Options Generated · Top Recommendations
                </p>
                <button
                  onClick={() => setShowAll(s => !s)}
                  className="font-mono text-[0.5rem] uppercase tracking-widest text-[#C4A048] hover:text-[#E8C87A] transition-colors"
                >
                  {showAll ? "SHOW TOP 3" : `VIEW ALL ${result.total_options}`}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(showAll ? result.all_options : result.recommendations).map((opt, i) => (
                  <OptionCard key={`${opt.bond_type}-${opt.par_value}-${opt.amortization}`} opt={opt} rank={i} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
