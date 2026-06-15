"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDealState } from "@/contexts/DealStateContext";

const _API = process.env.NEXT_PUBLIC_API_URL || "https://web-production-5e8af.up.railway.app";

const PHASES = ["sourcing", "readiness", "structuring", "placement", "placed", "closed"] as const;

const PILLARS = [
  { key: "eagleeye", label: "EagleEye",  desc: "Market sourcing · deal origination" },
  { key: "roots",    label: "Roots",     desc: "Document readiness · financial spread" },
  { key: "bondDesk", label: "Bond Desk", desc: "Structuring · tranching · pricing" },
  { key: "hawkeye",  label: "Hawkeye",   desc: "Placement · investor · book build" },
] as const;

function RadialScore({ score, size = 72 }: { score: number; size?: number }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#C4A048" : pct >= 50 ? "#E8B84B" : pct >= 30 ? "#F59E0B" : "#EF4444";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function WorkflowReadinessPanel() {
  const { state }    = useDealState();
  const activeDeal   = state.activeDeal;
  const dealId       = activeDeal?.id;

  const [workflow,    setWorkflow]    = useState<any>(null);
  const [loading,     setLoading]     = useState(false);
  const [running,     setRunning]     = useState(false);
  const [error,       setError]       = useState("");

  const fetchWorkflow = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${_API}/api/bond-workflow/deal/${id}`);
      const json = await res.json();
      if (json.success) setWorkflow(json.data);
      else setError(json.error || "Failed to load workflow");
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dealId) fetchWorkflow(dealId);
    else setWorkflow(null);
  }, [dealId, fetchWorkflow]);

  const runEvaluation = async () => {
    if (!dealId) return;
    setRunning(true);
    try {
      const res  = await fetch(`${_API}/api/bond-workflow/deal/${dealId}/run-evaluation`, { method: "POST" });
      const json = await res.json();
      if (json.success) setWorkflow(json.data);
    } catch {}
    setRunning(false);
  };

  const score        = workflow?.overallReadinessScore ?? 0;
  const pillarScores = workflow?.pillarScores ?? {};
  const phase        = workflow?.phase ?? "sourcing";
  const phaseIdx     = PHASES.indexOf(phase as any);
  const aiNote       = workflow?.aiAssessment ?? "";

  if (!activeDeal) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
        <p className="font-[Cormorant_Garamond] text-xl text-[#7A9A82]">
          Select a deal from the Pipeline to view workflow readiness
        </p>
        <p className="mt-2 font-[Space_Grotesk] text-xs text-white/25">
          Click any deal card in the Arrangement → Deal Pipeline tab
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-[Cormorant_Garamond] text-2xl text-[#EDE8DC]">
            {activeDeal.name || `Deal ${dealId?.slice(0, 8)}`}
          </h2>
          <p className="mt-0.5 font-[Space_Grotesk] text-xs text-[#7A9A82]">
            {activeDeal.sponsor && `${activeDeal.sponsor} · `}
            {activeDeal.sector} · Command Center
          </p>
        </div>

        <button
          onClick={runEvaluation}
          disabled={running || loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C4A048] to-[#E8C87A] px-5 py-2.5 font-[Space_Grotesk] text-sm font-semibold text-[#030A06] hover:shadow-[0_0_20px_rgba(196,160,72,0.3)] transition-all disabled:opacity-50"
        >
          {running ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >⟳</motion.span>
              Running…
            </>
          ) : "Run Full AI Evaluation →"}
        </button>
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {loading && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
          <p className="font-mono text-xs text-[#7A9A82]">Loading workflow…</p>
        </div>
      )}

      {!loading && workflow && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* ── Overall Score ── */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center gap-6">
                {/* Big score ring */}
                <div className="relative flex-shrink-0">
                  <RadialScore score={score} size={88} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-xl font-bold text-[#C4A048]">{Math.round(score)}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-[Cormorant_Garamond] text-lg text-[#EDE8DC]">Overall Readiness</span>
                    <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[#7A9A82]">
                      {score >= 85 ? "PLACEMENT READY" : score >= 65 ? "STRUCTURING" : score >= 40 ? "IN PROGRESS" : "EARLY STAGE"}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.04]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#C4A048] to-[#E8C87A]"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between font-mono text-[0.55rem] text-white/25">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>
              </div>

              {/* AI assessment */}
              {aiNote && (
                <div className="mt-4 rounded-xl border border-[#C4A048]/15 bg-[#C4A048]/[0.04] px-4 py-3">
                  <p className="font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82] mb-1">AI Assessment</p>
                  <p className="font-[Space_Grotesk] text-sm text-[#EDE8DC]/70 leading-relaxed">{aiNote}</p>
                </div>
              )}
            </div>

            {/* ── Pillar Scores ── */}
            <div>
              <p className="mb-3 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#7A9A82]">Four Pillar Scores</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PILLARS.map(({ key, label, desc }, i) => {
                  const ps = pillarScores[key] ?? 0;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col items-center gap-3"
                    >
                      <div className="relative">
                        <RadialScore score={ps} size={60} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-mono text-sm font-bold text-[#C4A048]">{Math.round(ps)}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-[Cormorant_Garamond] text-sm text-[#EDE8DC]">{label}</p>
                        <p className="font-[Space_Grotesk] text-[0.6rem] text-[#7A9A82] leading-tight mt-0.5">{desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Phase Timeline ── */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="mb-4 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#7A9A82]">Phase Progression</p>
              <div className="relative flex items-center">
                {/* Connecting line */}
                <div className="absolute left-0 right-0 top-3.5 h-px bg-white/[0.06]" />
                <motion.div
                  className="absolute left-0 top-3.5 h-px bg-gradient-to-r from-[#C4A048] to-[#E8C87A]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, phaseIdx / (PHASES.length - 1)) * 100}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
                <div className="relative flex w-full justify-between">
                  {PHASES.map((p, idx) => {
                    const isPast    = idx < phaseIdx;
                    const isCurrent = idx === phaseIdx;
                    return (
                      <div key={p} className="flex flex-col items-center gap-2">
                        <div
                          className={`relative z-10 h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCurrent
                              ? "border-[#C4A048] bg-[#C4A048]/20"
                              : isPast
                              ? "border-[#C4A048]/60 bg-[#C4A048]/10"
                              : "border-white/10 bg-[#030A06]"
                          }`}
                        >
                          {isPast && <span className="text-[#C4A048] text-[10px]">✓</span>}
                          {isCurrent && (
                            <motion.div
                              className="h-2 w-2 rounded-full bg-[#C4A048]"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <span
                          className={`font-mono text-[0.5rem] uppercase tracking-wider text-center ${
                            isCurrent ? "text-[#C4A048]" : isPast ? "text-[#7A9A82]" : "text-white/20"
                          }`}
                        >
                          {p}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Deal Metrics ── */}
            {workflow.dealMetrics && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Bond Face", value: workflow.dealMetrics.bondFace ? `$${(workflow.dealMetrics.bondFace / 1e6).toFixed(0)}M` : "—" },
                  { label: "DSCR", value: workflow.dealMetrics.dscr ? `${workflow.dealMetrics.dscr.toFixed(2)}x` : "—" },
                  { label: "LTV", value: workflow.dealMetrics.ltv ? `${workflow.dealMetrics.ltv.toFixed(1)}%` : "—" },
                  { label: "Market", value: workflow.dealMetrics.state || workflow.dealMetrics.market || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="font-mono text-[0.5rem] uppercase tracking-widest text-[#7A9A82] mb-1">{label}</p>
                    <p className="font-mono text-lg font-bold text-[#C4A048]">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
