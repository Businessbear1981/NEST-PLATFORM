"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://web-production-5e8af.up.railway.app";

const fmt$ = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;

const BOND_TYPES = [
  { key: "revenue_bond", label: "Revenue Bond", sub: "Muni 30yr level DS" },
  { key: "construction_bond", label: "Construction Bond", sub: "IO 36mo → amortizing" },
  { key: "cmbs", label: "CMBS", sub: "10yr IO balloon" },
  { key: "b_tranche", label: "B-Tranche", sub: "IO floating subordinate" },
  { key: "mini_bond", label: "Mini-Bond", sub: "5yr sinking fund" },
  { key: "go_bond", label: "GO Bond", sub: "20yr level principal" },
];

function ChainStep({ step, label, children }: { step: number; label: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#C4A048]/50 bg-[#0D2218] font-mono text-[0.6rem] text-[#C4A048]">{step}</div>
      {step < 5 && <div className="absolute left-[11px] top-7 h-full w-px bg-[#C4A048]/15" />}
      <div className="mb-6 rounded-[1.1rem] border border-white/10 bg-[#07101a]/90 p-4">
        <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#C4A048]">{label}</p>
        {children}
      </div>
    </div>
  );
}

function BondChainEngine() {
  const [bondType, setBondType] = useState("revenue_bond");
  const [faceM, setFaceM] = useState("205");
  const [coupon, setCoupon] = useState("6.5");
  const [marketRate, setMarketRate] = useState("4.25");
  const [chain, setChain] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState("");

  async function runChain() {
    setRunning(true);
    setErr("");
    setChain(null);
    try {
      const r = await fetch(`${API}/api/cns/bond-chain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bond_type: bondType,
          face_amount_usd: parseFloat(faceM) * 1_000_000,
          coupon_pct: parseFloat(coupon),
          market_rate_pct: parseFloat(marketRate),
          issue_price: 100.0,
        }),
      });
      const d = await r.json();
      if (d.success) setChain(d.data);
      else setErr(d.error || "Chain computation failed");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setRunning(false);
    }
  }

  const actionColor = (action: string) => {
    if (action === "EXECUTE_CALL" || action === "CRITICAL") return "#ef4444";
    if (action === "MONITOR_CLOSELY" || action === "HIGH") return "#f97316";
    if (action === "HOLD" || action === "MEDIUM") return "#C4A048";
    return "#7A9A82";
  };

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="rounded-[1.35rem] border border-[#C4A048]/25 bg-[#07101a]/90 p-5">
        <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#C4A048]">CNS Chain Inputs — each selection drives every downstream value</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">Bond Type</label>
            <select
              value={bondType}
              onChange={e => setBondType(e.target.value)}
              className="w-full rounded-[0.75rem] border border-white/15 bg-[#0D2218] px-3 py-2 font-mono text-xs text-[#EDE8DC] focus:border-[#C4A048] focus:outline-none"
            >
              {BOND_TYPES.map(bt => (
                <option key={bt.key} value={bt.key}>{bt.label} — {bt.sub}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">Face Amount ($M)</label>
            <input
              type="number"
              value={faceM}
              onChange={e => setFaceM(e.target.value)}
              className="w-full rounded-[0.75rem] border border-white/15 bg-[#0D2218] px-3 py-2 font-mono text-xs text-[#EDE8DC] focus:border-[#C4A048] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">Coupon Rate (%)</label>
            <input
              type="number"
              step="0.125"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              className="w-full rounded-[0.75rem] border border-white/15 bg-[#0D2218] px-3 py-2 font-mono text-xs text-[#EDE8DC] focus:border-[#C4A048] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">Market Rate (%)</label>
            <input
              type="number"
              step="0.125"
              value={marketRate}
              onChange={e => setMarketRate(e.target.value)}
              className="w-full rounded-[0.75rem] border border-white/15 bg-[#0D2218] px-3 py-2 font-mono text-xs text-[#EDE8DC] focus:border-[#C4A048] focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={runChain}
          disabled={running}
          className="mt-4 rounded-[1rem] border border-[#C4A048]/50 bg-[#C4A048]/15 px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#C4A048] transition hover:bg-[#C4A048]/25 disabled:opacity-50"
        >
          {running ? "Running CNS Chain…" : "Run Full Computation Chain →"}
        </button>
        {err && <p className="mt-2 font-mono text-xs text-red-400">{err}</p>}
      </div>

      {/* Summary banner */}
      {chain && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Bond Type", value: chain.chain.step1_bond_type.profile.label.split(" ")[0] + " " + (chain.chain.step1_bond_type.profile.label.split(" ")[1] || "") },
            { label: "Annual DS", value: fmt$(chain.summary.annual_ds_usd) },
            { label: "Avg Life", value: `${chain.summary.avg_life_years}yr` },
            { label: "Pricing", value: chain.summary.pricing_status.replace("_", " ").toUpperCase() },
            { label: "YTM", value: `${chain.summary.ytm_pct}%` },
            { label: "Vector Action", value: chain.summary.optimization_action, color: actionColor(chain.summary.optimization_action) },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[1rem] border border-[#C4A048]/20 bg-[#0D2218]/80 p-3 text-center">
              <div className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[#7A9A82]">{label}</div>
              <div className="mt-1 font-mono text-sm font-semibold" style={{ color: color || "#C4A048" }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chain steps */}
      {chain && (
        <div className="mt-2">
          <ChainStep step={1} label="Step 1 — Bond Type Profile (drives all downstream parameters)">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Amortization", chain.chain.step1_bond_type.profile.amort_type.replace(/_/g, " ")],
                ["Term", `${chain.chain.step1_bond_type.profile.typical_term_years}yr`],
                ["IO Period", `${chain.chain.step1_bond_type.profile.io_period_months}mo`],
                ["Coupon Type", chain.chain.step1_bond_type.profile.coupon_type],
                ["Tax Status", chain.chain.step1_bond_type.profile.tax_status.replace("_", "-")],
                ["Enhancement", chain.chain.step1_bond_type.profile.enhancement_required.replace(/_/g, " ")],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 py-1 text-xs">
                  <span className="text-[#7A9A82]">{k}</span>
                  <span className="font-mono text-[#EDE8DC]">{v}</span>
                </div>
              ))}
            </div>
          </ChainStep>

          <ChainStep step={2} label="Step 2 — Amortization (computed from bond type, drives par value)">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Schedule", chain.chain.step2_amortization.label],
                ["Annual DS", fmt$(chain.chain.step2_amortization.annual_ds_usd || chain.chain.step2_amortization.annual_ds_io_phase_usd || 0)],
                ["Annual Interest", fmt$(chain.chain.step2_amortization.annual_interest_usd)],
                ["Balloon", chain.chain.step2_amortization.balloon_usd > 0 ? fmt$(chain.chain.step2_amortization.balloon_usd) : "None"],
                ["Avg Life", `${chain.chain.step2_amortization.avg_life_years}yr`],
                ["IO Period", `${chain.chain.step2_amortization.io_period_years}yr`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 py-1 text-xs">
                  <span className="text-[#7A9A82]">{k}</span>
                  <span className="font-mono text-[#EDE8DC]">{v}</span>
                </div>
              ))}
            </div>
          </ChainStep>

          <ChainStep step={3} label="Step 3 — Par Value (derived from amortization + market rates)">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Face Amount", fmt$(chain.chain.step3_par_value.face_amount_usd)],
                ["Proceeds", fmt$(chain.chain.step3_par_value.proceeds_usd)],
                ["Theoretical Price", `${chain.chain.step3_par_value.theoretical_price}`],
                ["Pricing Status", chain.chain.step3_par_value.pricing_status.replace("_", " ").toUpperCase()],
                ["YTM", `${chain.chain.step3_par_value.yield_to_maturity_pct}%`],
                ["Coupon vs Market", `${chain.chain.step3_par_value.coupon_vs_market_spread_bps}bps`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 py-1 text-xs">
                  <span className="text-[#7A9A82]">{k}</span>
                  <span className="font-mono text-[#EDE8DC]">{v}</span>
                </div>
              ))}
            </div>
            {chain.chain.step3_par_value.oid_flag && (
              <p className="mt-2 rounded-[0.5rem] bg-amber-300/10 px-3 py-1.5 font-mono text-[0.6rem] text-amber-300">
                OID FLAG: Issue price below 97.75 — OID tax amortization rules apply. {fmt$(chain.chain.step3_par_value.oid_discount_usd)} discount.
              </p>
            )}
          </ChainStep>

          <ChainStep step={4} label="Step 4 — Call/Put Layering (driven by amortization schedule + pricing)">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Call Type", chain.chain.step4_call_put.call_type.replace(/_/g, " ")],
                ["Call Protection", `${chain.chain.step4_call_put.call_protection_years}yr`],
                ["First Call Year", `Year ${chain.chain.step4_call_put.first_optional_call_year}`],
                ["Rate Differential", `${chain.chain.step4_call_put.rate_trigger.rate_differential_bps}bps`],
                ["Call Triggered", chain.chain.step4_call_put.rate_trigger.call_triggered ? "YES" : "NO"],
                ["Put Feature", chain.chain.step4_call_put.put_feature.has_put ? `Yes — ${chain.chain.step4_call_put.put_feature.put_period_days}d` : "None"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 py-1 text-xs">
                  <span className="text-[#7A9A82]">{k}</span>
                  <span className={`font-mono ${k === "Call Triggered" && v === "YES" ? "text-[#C4A048]" : "text-[#EDE8DC]"}`}>{v}</span>
                </div>
              ))}
            </div>
            {chain.chain.step4_call_put.rate_trigger.annual_savings_usd > 0 && (
              <p className="mt-2 rounded-[0.5rem] bg-[#C4A048]/10 px-3 py-1.5 font-mono text-[0.6rem] text-[#C4A048]">
                Call trigger active — annual savings if called: {fmt$(chain.chain.step4_call_put.rate_trigger.annual_savings_usd)}
              </p>
            )}
          </ChainStep>

          <ChainStep step={5} label="Step 5 — Vector Agent Optimization (action recommendation)">
            <div
              className="mb-3 rounded-[0.75rem] border px-4 py-3"
              style={{ borderColor: actionColor(chain.chain.step5_optimization.vector_action) + "44", background: actionColor(chain.chain.step5_optimization.vector_action) + "11" }}
            >
              <div className="font-mono text-xs font-bold" style={{ color: actionColor(chain.chain.step5_optimization.vector_action) }}>
                {chain.chain.step5_optimization.priority} — {chain.chain.step5_optimization.vector_action}
              </div>
              <p className="mt-1 text-xs text-[#EDE8DC]">{chain.chain.step5_optimization.rationale}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Annual Savings", fmt$(chain.chain.step5_optimization.annual_savings_usd)],
                ["NPV Savings", fmt$(chain.chain.step5_optimization.npv_savings_usd)],
                ["Refi Cost", fmt$(chain.chain.step5_optimization.refi_cost_usd)],
                ["Breakeven", chain.chain.step5_optimization.breakeven_months ? `${chain.chain.step5_optimization.breakeven_months}mo` : "N/A"],
                ["Optimal New Coupon", `${chain.chain.step5_optimization.optimal_new_coupon_pct}%`],
                ["Add'l Capacity", chain.chain.step5_optimization.additional_capacity_usd > 0 ? fmt$(chain.chain.step5_optimization.additional_capacity_usd) : "None"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 py-1 text-xs">
                  <span className="text-[#7A9A82]">{k}</span>
                  <span className="font-mono text-[#EDE8DC]">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-[0.55rem] text-[#7A9A82]">{chain.chain.step5_optimization.atlas_model_note}</p>
            <p className="font-mono text-[0.55rem] text-[#7A9A82]">{chain.chain.step5_optimization.prometheus_flag}</p>
          </ChainStep>
        </div>
      )}
    </div>
  );
}

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

  const tabs = ["Bond Chain Engine", "Bond Grading", "Stress Testing", "Bond Optimization"];
  const stressScenarios = [
    { name: "Base Case", color: "emerald", dscr: "1.80x", outcome: "Performing - all covenants met" },
    { name: "Downside", color: "amber", dscr: "1.38x", outcome: "Tight but serviceable" },
    { name: "Stress", color: "orange", dscr: "1.08x", outcome: "Reserve activated" },
    { name: "Catastrophic", color: "red", dscr: "0.78x", outcome: "Surety draw required" },
  ];

  const colorMap: Record<string, string> = { emerald: "#2D6B3D", amber: "#C4A048", orange: "#f97316", red: "#ef4444" };

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-[#EDE8DC]">
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
                  : "text-[#7A9A82] hover:text-[#EDE8DC]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* BOND CHAIN ENGINE */}
        {tab === 0 && <BondChainEngine />}

        {/* BOND GRADING */}
        {tab === 1 && (
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
                  <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">Base Grade</div>
                  <div className="mt-2 font-mono text-5xl font-light text-emerald-400">{gradeResult.base_grade}</div>
                  <div className="my-2 font-mono text-[0.6rem] text-[#7A9A82]">{"\u2193"} Enhanced {"\u2193"}</div>
                  <div className="font-mono text-6xl font-normal leading-none text-amber-300">{gradeResult.enhanced_grade}</div>
                  <div className={`mt-2 font-mono text-[0.55rem] ${gradeResult.target_achieved ? "text-emerald-400" : "text-red-400"}`}>
                    Target {gradeResult.target_grade}: {gradeResult.target_achieved ? "ACHIEVED" : "NOT MET"}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Component Scores */}
                  <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
                    <h3 className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">Component Scores</h3>
                    {Object.entries(gradeResult.component_scores || {}).map(([k, v]: [string, any]) => (
                      <div key={k} className="mb-1.5 flex items-center gap-3">
                        <div className="w-36 font-mono text-[0.55rem] uppercase text-[#7A9A82]">{k.replace(/_/g, " ")}</div>
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
                      <h3 className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">Structural Enhancements Applied</h3>
                      {gradeResult.enhancements_applied.map((e: any, i: number) => (
                        <div key={i} className="flex items-center justify-between border-b border-white/5 py-1.5 last:border-b-0">
                          <span className="text-xs text-[#7A9A82]">{e.description}</span>
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
                    <span className="text-xs text-[#7A9A82]">{g.metric}: {g.current} {"\u2192"} need {g.required}</span>
                    <span className="text-xs font-semibold text-red-400">{g.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STRESS TESTING */}
        {tab === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {stressScenarios.map((s) => (
              <div
                key={s.name}
                className="rounded-[1.25rem] border-l-[3px] border border-white/10 bg-[#07101a]/80 p-5"
                style={{ borderLeftColor: colorMap[s.color] }}
              >
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em]" style={{ color: colorMap[s.color] }}>{s.name}</div>
                <div className="mt-2 font-mono text-3xl font-medium" style={{ color: colorMap[s.color] }}>{s.dscr}</div>
                <div className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82]">DSCR</div>
                <div className="mt-2 text-xs text-[#7A9A82]">{s.outcome}</div>
              </div>
            ))}
          </div>
        )}

        {/* BOND OPTIMIZATION */}
        {tab === 3 && (
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
                      <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">{k.label}</span>
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
                    <div className="mt-1 text-sm text-[#EDE8DC]">{a.rationale}</div>
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
                    <div className="mt-1 font-mono text-[0.62rem] text-[#7A9A82]">{optimizeResult.par_value_analysis.note}</div>
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
