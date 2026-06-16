"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDealState } from "@/contexts/DealStateContext"

const _API = process.env.NEXT_PUBLIC_API_URL || "https://api.ardanedgecapital.com"

type Phase = {
  id: string; phase_num: number; label: string; pillar: string; agent: string
}
type IntakeResult = {
  bond_type_assessment?: { preferred?: Array<{ type: string; rationale: string }> }
  gap_questions?: Array<{ id: string; question: string; priority: string }>
  initial_memo?: string
  aiAssessment?: string
}
type PhaseStatus = {
  current_phase: string; current_phase_num: number; pct_complete: number
  next_phase: Phase | null; pipeline_total: number
}

export default function IntakeAgentPanel() {
  const { state } = useDealState()
  const deal = state.activeDeal

  const [phases, setPhases]           = useState<Phase[]>([])
  const [phaseStatus, setPhaseStatus] = useState<PhaseStatus | null>(null)
  const [intakeResult, setIntakeResult] = useState<IntakeResult | null>(null)
  const [answers, setAnswers]         = useState<Record<string, string>>({})
  const [answersSubmitted, setAnswersSubmitted] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [advanceLoading, setAdvanceLoading] = useState(false)
  const [submitLoading, setSubmitLoading]   = useState(false)
  const [greenlitLoading, setGreenlitLoading] = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    deal_type: "Development",
    sponsor: "",
    location: "",
    naics_code: "6232",
    bond_face: 150000000,
    target_rating: "BBB",
    green_bond_intent: false,
  })

  const dealId = deal?.id

  useEffect(() => {
    fetch(`${_API}/api/bond-workflow/phases`)
      .then(r => r.json())
      .then(j => { if (j.success) setPhases(j.data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!dealId) return
    fetch(`${_API}/api/bond-workflow/deal/${dealId}/phase-status`)
      .then(r => r.json())
      .then(j => { if (j.success) setPhaseStatus(j.data) })
      .catch(() => {})
  }, [dealId])

  async function runIntake() {
    if (!dealId) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${_API}/api/intake-brainstorm/${dealId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      })
      const j = await r.json()
      if (j.success) setIntakeResult(j.data)
      else setError(j.error || "Intake failed")
    } catch (e) {
      setError("Network error. Check Railway is running.")
    } finally {
      setLoading(false)
    }
  }

  async function submitAnswers() {
    if (!dealId) return
    setSubmitLoading(true)
    try {
      await fetch(`${_API}/api/intake-brainstorm/${dealId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: answers }),
      })
      setAnswersSubmitted(true)
    } finally {
      setSubmitLoading(false)
    }
  }

  async function greenlight() {
    if (!dealId) return
    setGreenlitLoading(true)
    try {
      await fetch(`${_API}/api/intake-brainstorm/${dealId}/greenlight`, { method: "POST" })
      const r = await fetch(`${_API}/api/bond-workflow/deal/${dealId}/advance-phase`, {
        method: "POST", headers: { "Content-Type": "application/json" },
      })
      const j = await r.json()
      if (j.success && j.data) {
        const ps = await fetch(`${_API}/api/bond-workflow/deal/${dealId}/phase-status`)
        const pj = await ps.json()
        if (pj.success) setPhaseStatus(pj.data)
      }
    } finally {
      setGreenlitLoading(false)
    }
  }

  const gapQs = intakeResult?.gap_questions || []
  const unanswered = gapQs.filter(q => !answers[q.id])
  const bondType   = intakeResult?.bond_type_assessment?.preferred?.[0]
  const memo       = intakeResult?.initial_memo || intakeResult?.aiAssessment || ""

  if (!deal) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] p-10 text-center">
        <div>
          <p className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#EDE8DC]/60">
            Select a deal from the Pipeline
          </p>
          <p className="mt-2 font-[Space_Grotesk] text-sm text-[#7A9A82]">
            Choose an active deal to begin Bernard intake analysis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── PHASE STRIP ────────────────────────────────────────────────── */}
      {phases.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-1 min-w-max">
            {phases.map((ph, i) => {
              const current  = phaseStatus?.current_phase
              const phaseNum = phaseStatus?.current_phase_num ?? 0
              const done     = ph.phase_num < phaseNum
              const active   = ph.id === current
              return (
                <div key={ph.id} className="flex items-center">
                  <div className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                    active ? "bg-[#C4A048]/15 border border-[#C4A048]/40" :
                    done   ? "opacity-70" : "opacity-35"
                  }`}>
                    <span className={`font-mono text-[0.45rem] uppercase tracking-widest ${
                      active ? "text-[#C4A048]" : done ? "text-[#7A9A82]" : "text-[#7A9A82]/50"
                    }`}>{ph.phase_num}</span>
                    <span className={`font-[Space_Grotesk] text-[0.6rem] font-medium whitespace-nowrap ${
                      active ? "text-[#EDE8DC]" : done ? "text-[#7A9A82]" : "text-[#7A9A82]/50"
                    }`}>{ph.label}</span>
                    {done && <span className="text-[#7A9A82] text-[0.5rem]">✓</span>}
                  </div>
                  {i < phases.length - 1 && (
                    <div className={`h-px w-4 mx-0.5 ${done ? "bg-[#C4A048]/50" : "bg-white/[0.08]"}`} />
                  )}
                </div>
              )
            })}
          </div>
          {phaseStatus && (
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1 flex-1 rounded-full bg-white/[0.08]">
                <motion.div
                  className="h-1 rounded-full bg-gradient-to-r from-[#C4A048] to-[#E8C87A]"
                  initial={{ width: 0 }}
                  animate={{ width: `${phaseStatus.pct_complete}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="font-mono text-[0.55rem] text-[#C4A048]">{phaseStatus.pct_complete}%</span>
            </div>
          )}
        </div>
      )}

      {/* ── INTAKE FORM or RESULTS ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!intakeResult ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg border border-[#C4A048]/30 bg-[#C4A048]/[0.08] flex items-center justify-center">
                <span className="font-[Cormorant_Garamond] text-base font-bold text-[#C4A048]">B</span>
              </div>
              <div>
                <h3 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#EDE8DC]">Bernard Intake Analysis</h3>
                <p className="font-[Space_Grotesk] text-xs text-[#7A9A82]">Stage 0 · Deal: {deal.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Deal Type */}
              <div>
                <label className="mb-1.5 block font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82]">Deal Type</label>
                <select
                  value={form.deal_type}
                  onChange={e => setForm(f => ({ ...f, deal_type: e.target.value }))}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 font-[Space_Grotesk] text-sm text-[#EDE8DC] focus:border-[#C4A048]/60 focus:outline-none"
                >
                  <option value="Development">Development</option>
                  <option value="M_A">M&A</option>
                  <option value="Refinance">Refinance</option>
                </select>
              </div>

              {/* Target Rating */}
              <div>
                <label className="mb-1.5 block font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82]">Target Rating</label>
                <select
                  value={form.target_rating}
                  onChange={e => setForm(f => ({ ...f, target_rating: e.target.value }))}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 font-[Space_Grotesk] text-sm text-[#EDE8DC] focus:border-[#C4A048]/60 focus:outline-none"
                >
                  {["AAA","AA+","AA","AA-","A+","A","A-","BBB+","BBB","BBB-","BB+","BB"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Sponsor */}
              <div>
                <label className="mb-1.5 block font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82]">Sponsor</label>
                <input
                  type="text"
                  value={form.sponsor}
                  onChange={e => setForm(f => ({ ...f, sponsor: e.target.value }))}
                  placeholder="Sponsor name"
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 font-[Space_Grotesk] text-sm text-[#EDE8DC] placeholder:text-[#7A9A82]/40 focus:border-[#C4A048]/60 focus:outline-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82]">Location (City, State)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Tampa, FL"
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 font-[Space_Grotesk] text-sm text-[#EDE8DC] placeholder:text-[#7A9A82]/40 focus:border-[#C4A048]/60 focus:outline-none"
                />
              </div>

              {/* NAICS */}
              <div>
                <label className="mb-1.5 block font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82]">NAICS Code</label>
                <input
                  type="text"
                  value={form.naics_code}
                  onChange={e => setForm(f => ({ ...f, naics_code: e.target.value }))}
                  placeholder="6232"
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 font-[IBM_Plex_Mono] text-sm text-[#EDE8DC] placeholder:text-[#7A9A82]/40 focus:border-[#C4A048]/60 focus:outline-none"
                />
              </div>

              {/* Bond Face */}
              <div>
                <label className="mb-1.5 block font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82]">Bond Face Amount ($)</label>
                <input
                  type="number"
                  value={form.bond_face}
                  onChange={e => setForm(f => ({ ...f, bond_face: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 font-[IBM_Plex_Mono] text-sm text-[#C4A048] focus:border-[#C4A048]/60 focus:outline-none"
                />
              </div>
            </div>

            {/* Green Bond Toggle */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, green_bond_intent: !f.green_bond_intent }))}
                className={`h-5 w-9 rounded-full transition-colors ${form.green_bond_intent ? "bg-[#7A9A82]" : "bg-white/[0.1]"}`}
              >
                <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${form.green_bond_intent ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="font-[Space_Grotesk] text-sm text-[#EDE8DC]/70">Green Bond Intent</span>
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 font-[Space_Grotesk] text-xs text-red-400">{error}</p>
            )}

            <button
              onClick={runIntake}
              disabled={loading}
              className="mt-5 w-full rounded-lg border border-[#C4A048]/40 bg-[#C4A048]/10 px-6 py-3 font-[Space_Grotesk] text-sm font-semibold text-[#C4A048] transition-all hover:bg-[#C4A048]/20 disabled:opacity-50"
            >
              {loading ? "Bernard is analyzing…" : "Run Bernard Intake Analysis →"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            {/* Bernard Assessment */}
            {memo && (
              <div className="rounded-xl border border-[#C4A048]/25 bg-[#C4A048]/[0.05] p-5">
                <h4 className="mb-3 font-[Cormorant_Garamond] text-lg font-semibold text-[#C4A048]">Bernard's Assessment</h4>
                <p className="font-[Space_Grotesk] text-sm leading-relaxed text-[#EDE8DC]/85">{memo}</p>
              </div>
            )}

            {/* Bond Type Recommendation */}
            {bondType && (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="mb-1 font-mono text-[0.5rem] uppercase tracking-widest text-[#7A9A82]">Bond Type Recommendation</p>
                <p className="font-[Cormorant_Garamond] text-xl font-bold text-[#EDE8DC]">{bondType.type}</p>
                {bondType.rationale && (
                  <p className="mt-1 font-[Space_Grotesk] text-xs text-[#7A9A82]">{bondType.rationale}</p>
                )}
              </div>
            )}

            {/* Gap Questions */}
            {gapQs.length > 0 && !answersSubmitted && (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-[Cormorant_Garamond] text-lg font-semibold text-[#EDE8DC]">Gap Questions</h4>
                  <span className="font-mono text-[0.5rem] text-[#7A9A82]">{unanswered.length} unanswered</span>
                </div>
                <div className="space-y-4">
                  {gapQs.map(q => (
                    <div key={q.id}>
                      <label className="mb-1.5 block font-[Space_Grotesk] text-sm text-[#EDE8DC]/80">{q.question}</label>
                      <input
                        type="text"
                        value={answers[q.id] || ""}
                        onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        placeholder="Your answer…"
                        className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 font-[Space_Grotesk] text-sm text-[#EDE8DC] placeholder:text-[#7A9A82]/40 focus:border-[#C4A048]/60 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={submitAnswers}
                  disabled={submitLoading || unanswered.length > 0}
                  className="mt-4 w-full rounded-lg border border-[#7A9A82]/40 bg-[#7A9A82]/10 px-5 py-2.5 font-[Space_Grotesk] text-sm font-medium text-[#7A9A82] transition-all hover:bg-[#7A9A82]/20 disabled:opacity-40"
                >
                  {submitLoading ? "Submitting…" : `Submit Answers (${gapQs.length - unanswered.length}/${gapQs.length} answered)`}
                </button>
              </div>
            )}

            {/* Greenlight */}
            {(answersSubmitted || gapQs.length === 0) && (
              <button
                onClick={greenlight}
                disabled={greenlitLoading}
                className="w-full rounded-xl border border-[#C4A048]/50 bg-[#C4A048]/15 px-6 py-4 font-[Cormorant_Garamond] text-xl font-bold text-[#C4A048] transition-all hover:bg-[#C4A048]/25 disabled:opacity-50"
              >
                {greenlitLoading ? "Advancing pipeline…" : "Greenlight Deal — Advance to Spreads →"}
              </button>
            )}

            <button
              onClick={() => setIntakeResult(null)}
              className="font-[Space_Grotesk] text-xs text-[#7A9A82]/60 hover:text-[#7A9A82] transition-colors"
            >
              ← Re-run intake with different parameters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STATUS CHIPS ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "PHASE",      value: phaseStatus?.current_phase?.toUpperCase() || "INGESTION" },
          { label: "BOND TYPE",  value: bondType?.type || "—" },
          { label: "GAP ITEMS",  value: String(unanswered.length || 0) },
          { label: "STATUS",     value: intakeResult ? (answersSubmitted ? "READY" : "IN PROGRESS") : "PENDING" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-2">
            <p className="font-mono text-[0.45rem] uppercase tracking-widest text-[#7A9A82]">{label}</p>
            <p className="font-[IBM_Plex_Mono] text-sm font-semibold text-[#C4A048]">{value}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
