"use client";
import { useState } from "react";

const API = "";

export default function ModelingStudio() {
  const [tab, setTab] = useState(0);
  const [running, setRunning] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [optimizeResult, setOptimizeResult] = useState<any>(null);

  async function runGrade() {
    setRunning(true);
    try {
      const r = await fetch(`${API}/api/bond-tools/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal: { rating_target: "A", sponsor: { track_record_projects: 8, audited_financials_received: true }, readiness_score: 75, project: { project_type: "senior_living", total_project_cost_usd: 231000000 } },
          bond: { b_tranche_overlay: { proceeds_to_bank_aum: true, io_funded_from_proceeds: true, maturity_reserve_pct: 2.5 } },
          credit_metrics: { dscr: 1.8, ltv: 62, debt_to_ebitda: 5.0, interest_coverage: 2.8, lgd_bare: 60 },
        }),
      });
      const d = await r.json();
      if (d.data) setGradeResult(d.data);
    } catch {
      /* swallow */
    } finally {
      setRunning(false);
    }
  }

  async function runOptimize() {
    setRunning(true);
    try {
      const r = await fetch(`${API}/api/bond-tools/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal: { dscr: 1.7, id: "demo" },
          bond: { coupon_rate_pct: 7.5, face_amount_usd: 173000000, months_outstanding: 24, remaining_term_months: 36 },
          market_signals: { treasury_10yr_pct: 4.0, credit_spread_ig_bps: 110, refi_market_access: "open_favorable" },
        }),
      });
      const d = await r.json();
      if (d.data) setOptimizeResult(d.data);
    } catch {
      /* swallow */
    } finally {
      setRunning(false);
    }
  }

  const tabs = ["Bond Grading", "Stress Testing", "Bond Optimization"];
  const stressScenarios = [
    { name: "Base Case", color: "emerald", dscr: "1.80x", outcome: "Performing - all covenants met" },
    { name: "Downside", color: "amber", dscr: "1.38x", outcome: "Tight but serviceable" },
    { name: "Stress", color: "orange", dscr: "1.08x", outcome: "Reserve activated" },
    { name: "Catastrophic", color: "red", dscr: "0.78x", outcome: "Surety draw required" },
  ];

  const colorMap: Record<string, string> = { emerald: "#2D6B3D", amber: "#C4A048", orange: "#f97316", red: "#ef4444" };

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-200">Financial Modeling - Prometheus Agent</p>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Modeling Studio</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-amber-300/15">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.08em] transition ${
                tab === i
                  ? "border-b-2 border-amber-300 text-amber-200"
                  : "text-slate-600 hover:text-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* BOND GRADING */}
        {tab === 0 && (
          <div className="space-y-4">
            <button
              onClick={runGrade}
              disabled={running}
              className="rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 transition hover:bg-amber-300/20 disabled:opacity-50"
            >
              {running ? "Grading..." : "Run Bond Grading - Life Star Pointe Loop"}
            </button>
            {gradeResult && (
              <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
                {/* Grade Display */}
                <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5 text-center">
                  <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-600">Base Grade</div>
                  <div className="mt-2 font-mono text-5xl font-light text-emerald-400">{gradeResult.base_grade}</div>
                  <div className="my-2 font-mono text-[0.6rem] text-slate-600">{"\u2193"} Enhanced {"\u2193"}</div>
                  <div className="font-mono text-6xl font-normal leading-none text-amber-300">{gradeResult.enhanced_grade}</div>
                  <div className={`mt-2 font-mono text-[0.55rem] ${gradeResult.target_achieved ? "text-emerald-400" : "text-red-400"}`}>
                    Target {gradeResult.target_grade}: {gradeResult.target_achieved ? "ACHIEVED" : "NOT MET"}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Component Scores */}
                  <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
                    <h3 className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-600">Component Scores</h3>
                    {Object.entries(gradeResult.component_scores || {}).map(([k, v]: [string, any]) => (
                      <div key={k} className="mb-1.5 flex items-center gap-3">
                        <div className="w-36 font-mono text-[0.55rem] uppercase text-slate-500">{k.replace(/_/g, " ")}</div>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#03060b]">
                          <div
                            className={`h-full rounded-full ${v.score >= 70 ? "bg-emerald-500" : v.score >= 40 ? "bg-amber-300" : "bg-red-500"}`}
                            style={{ width: `${v.score}%` }}
                          />
                        </div>
                        <div className="w-8 text-right font-mono text-xs font-semibold text-amber-300">{v.score}</div>
                      </div>
                    ))}
                  </div>

                  {/* Enhancements */}
                  {gradeResult.enhancements_applied?.length > 0 && (
                    <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
                      <h3 className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-600">Structural Enhancements Applied</h3>
                      {gradeResult.enhancements_applied.map((e: any, i: number) => (
                        <div key={i} className="flex items-center justify-between border-b border-white/5 py-1.5 last:border-b-0">
                          <span className="text-xs text-slate-400">{e.description}</span>
                          <span className="font-mono text-xs font-semibold text-amber-300">+{e.notch_up} notch</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {gradeResult?.gap_analysis?.length > 0 && (
              <div className="rounded-[1.25rem] border border-red-500/20 bg-[#07101a]/80 p-5">
                <h3 className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-red-400">Gap Analysis - What's Needed</h3>
                {gradeResult.gap_analysis.map((g: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 py-1.5 last:border-b-0">
                    <span className="text-xs text-slate-400">{g.metric}: {g.current} {"\u2192"} need {g.required}</span>
                    <span className="text-xs font-semibold text-red-400">{g.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STRESS TESTING */}
        {tab === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {stressScenarios.map((s) => (
              <div
                key={s.name}
                className="rounded-[1.25rem] border-l-[3px] border border-white/10 bg-[#07101a]/80 p-5"
                style={{ borderLeftColor: colorMap[s.color] }}
              >
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em]" style={{ color: colorMap[s.color] }}>{s.name}</div>
                <div className="mt-2 font-mono text-3xl font-medium" style={{ color: colorMap[s.color] }}>{s.dscr}</div>
                <div className="font-mono text-[0.5rem] uppercase tracking-wider text-slate-600">DSCR</div>
                <div className="mt-2 text-xs text-slate-500">{s.outcome}</div>
              </div>
            ))}
          </div>
        )}

        {/* BOND OPTIMIZATION */}
        {tab === 2 && (
          <div className="space-y-4">
            <button
              onClick={runOptimize}
              disabled={running}
              className="rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 transition hover:bg-amber-300/20 disabled:opacity-50"
            >
              {running ? "Optimizing..." : "Run Bond Optimization"}
            </button>

            {optimizeResult && (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Current Rate", value: `${optimizeResult.current_rate}%` },
                    { label: "Market Rate", value: `${optimizeResult.market_rate}%` },
                    { label: "Differential", value: `${optimizeResult.rate_differential_bps}bps` },
                  ].map((k) => (
                    <article key={k.label} className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
                      <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{k.label}</span>
                      <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{k.value}</strong>
                    </article>
                  ))}
                </div>

                {optimizeResult.recommended_actions?.map((a: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-[1.25rem] border-l-[3px] border border-white/10 bg-[#07101a]/80 p-4"
                    style={{ borderLeftColor: a.action === "EXECUTE_CALL" ? "#C4A048" : a.action === "PUT_ALERT" ? "#ef4444" : "#7A9A82" }}
                  >
                    <div className="font-mono text-xs font-semibold" style={{ color: a.action === "EXECUTE_CALL" ? "#C4A048" : "#7A9A82" }}>{a.action}</div>
                    <div className="mt-1 text-sm text-slate-300">{a.rationale}</div>
                    {a.annual_savings_usd && (
                      <div className="mt-1 font-mono text-sm text-amber-300">
                        Annual savings: ${(a.annual_savings_usd / 1e6).toFixed(2)}M - Breakeven: {a.breakeven_months}mo
                      </div>
                    )}
                  </div>
                ))}

                {optimizeResult.par_value_analysis?.can_access_additional_funds && (
                  <div className="rounded-[1.25rem] border border-amber-300/30 bg-[#07101a]/80 p-5">
                    <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-amber-300">Additional Capacity Unlocked</div>
                    <div className="mt-2 font-mono text-2xl font-semibold text-amber-300">
                      ${(optimizeResult.par_value_analysis.additional_capacity_usd / 1e6).toFixed(1)}M
                    </div>
                    <div className="mt-1 font-mono text-[0.62rem] text-slate-500">{optimizeResult.par_value_analysis.note}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
