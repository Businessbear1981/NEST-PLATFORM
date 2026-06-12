"use client";
import { useState, useEffect } from "react";

const API = "";

function fmt(n: number) { return n?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "\u2014"; }
function fmtM(n: number) { return `$${(n / 1_000_000).toFixed(1)}M`; }

export default function BondIntelligence() {
  const [tab, setTab] = useState("rating");
  const [milestones, setMilestones] = useState<any[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [path, setPath] = useState<any>(null);
  const [bondTypes, setBondTypes] = useState<any>(null);

  // Rating readiness form
  const [dscr, setDscr] = useState("1.50");
  const [ltv, setLtv] = useState("68");
  const [presales, setPresales] = useState("45");
  const [opYears, setOpYears] = useState("7");
  const [hasAudit, setHasAudit] = useState(false);
  const [hasFeasibility, setHasFeasibility] = useState(false);
  const [hasGMP, setHasGMP] = useState(false);
  const [ratingResult, setRatingResult] = useState<any>(null);

  // Phase bonds
  const [tpc, setTpc] = useState("200000000");
  const [baseRate, setBaseRate] = useState("650");
  const [phaseResult, setPhaseResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/api/bond-intel/milestones`).then((r) => r.json()).then((d) => setMilestones(d.data || []));
    fetch(`${API}/api/bond-intel/team`).then((r) => r.json()).then((d) => setTeam(d.data));
    fetch(`${API}/api/bond-intel/100pct-path`).then((r) => r.json()).then((d) => setPath(d.data));
    fetch(`${API}/api/bond-intel/types`).then((r) => r.json()).then((d) => setBondTypes(d.data));
  }, []);

  async function assessRating() {
    const res = await fetch(`${API}/api/bond-intel/rating-readiness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dscr_stabilized: parseFloat(dscr), ltv_pct: parseFloat(ltv),
        presales_pct: parseFloat(presales), operator_years_experience: parseInt(opYears),
        has_audited_financials: hasAudit, has_feasibility_study: hasFeasibility, has_GMP_contract: hasGMP,
      }),
    });
    const d = await res.json();
    setRatingResult(d.data);
  }

  async function structurePhase() {
    const res = await fetch(`${API}/api/phase-bonds/structure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_project_cost_usd: parseFloat(tpc), base_rate_bps: parseInt(baseRate) }),
    });
    const d = await res.json();
    setPhaseResult(d.data);
  }

  const TABS = [
    { key: "rating", label: "Rating Readiness" },
    { key: "milestones", label: "Milestone Gates" },
    { key: "team", label: "Professional Team" },
    { key: "phases", label: "Phase Bonds" },
    { key: "100pct", label: "100% Path" },
  ];

  const inputCls = "mt-1 w-full rounded-lg border border-white/10 bg-[#03060b] px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-300/40";

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-[#EDE8DC]">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-200">Institutional Intelligence</p>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Bond Intelligence</h1>
          <p className="mt-1 text-xs text-[#7A9A82]">Institutional knowledge from real bond transactions. Capital Trust Authority BAN + Jacaranda Trace PLOM.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-amber-300/15">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.08em] transition ${
                tab === t.key
                  ? "border-b-2 border-amber-300 text-amber-200"
                  : "text-[#7A9A82] hover:text-[#EDE8DC]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* RATING READINESS */}
        {tab === "rating" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5 space-y-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#7A9A82]">Deal Parameters</h3>
              {[
                { label: "DSCR at Stabilization", value: dscr, set: setDscr },
                { label: "LTV %", value: ltv, set: setLtv },
                { label: "Presales %", value: presales, set: setPresales },
                { label: "Operator Years", value: opYears, set: setOpYears },
              ].map((f) => (
                <label key={f.label} className="block">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#7A9A82]">{f.label}</span>
                  <input className={inputCls} value={f.value} onChange={(e) => f.set(e.target.value)} />
                </label>
              ))}
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Audited Financials", checked: hasAudit, toggle: () => setHasAudit(!hasAudit) },
                  { label: "Feasibility Study", checked: hasFeasibility, toggle: () => setHasFeasibility(!hasFeasibility) },
                  { label: "GMP Contract", checked: hasGMP, toggle: () => setHasGMP(!hasGMP) },
                ].map((cb) => (
                  <label key={cb.label} className="flex items-center gap-2 font-mono text-[0.65rem] text-[#7A9A82]">
                    <input type="checkbox" checked={cb.checked} onChange={cb.toggle} className="accent-amber-300" /> {cb.label}
                  </label>
                ))}
              </div>
              <button onClick={assessRating} className="rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 hover:bg-amber-300/20">
                Assess Rating
              </button>
            </div>

            {ratingResult && (
              <div className="rounded-[1.25rem] border border-amber-300/25 bg-[#07101a]/80 p-5 space-y-4">
                <h3 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#7A9A82]">Rating Assessment</h3>
                <div className={`font-mono text-5xl font-light ${ratingResult.highest_achievable === "A" ? "text-amber-300" : ratingResult.highest_achievable?.includes("BBB") ? "text-emerald-400" : "text-[#7A9A82]"}`}>
                  {ratingResult.highest_achievable}
                </div>
                {ratingResult.estimated_coupon && (
                  <div className="font-mono text-lg text-amber-300">{ratingResult.estimated_coupon[0]}% - {ratingResult.estimated_coupon[1]}%</div>
                )}
                {ratingResult.achievable_ratings?.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#7A9A82]">Achievable Ratings</h4>
                    <div className="flex flex-wrap gap-2">
                      {ratingResult.achievable_ratings.map((r: string) => (
                        <span key={r} className="rounded bg-amber-300/15 px-2 py-0.5 font-mono text-[0.65rem] font-semibold text-amber-300">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                {ratingResult.gaps?.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-red-400">Gaps to Close</h4>
                    {ratingResult.gaps.map((g: string, i: number) => (
                      <div key={i} className="mb-1 rounded-lg border border-red-500/20 bg-red-500/[0.06] p-2 text-xs text-[#EDE8DC]">
                        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-red-500" /> {g}
                      </div>
                    ))}
                  </div>
                )}
                <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3">
                  <span className="font-mono text-[0.65rem] font-semibold text-amber-300">Next Action: </span>
                  <span className="text-xs text-[#EDE8DC]">{ratingResult.next_action}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MILESTONE GATES */}
        {tab === "milestones" && (
          <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
            <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#7A9A82]">10 Gates to 100% Financing</h3>
            <div className="space-y-0">
              {milestones.map((g: any) => (
                <div key={g.gate} className="flex items-start gap-4 border-b border-white/5 py-4 last:border-b-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 font-mono text-xs font-semibold text-amber-300">
                    {g.gate}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-sm font-semibold text-white">{g.name}</div>
                    <div className="mt-0.5 text-[0.68rem] text-[#7A9A82]">Required for: {g.required_for || "\u2014"}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {g.docs?.map((d: string) => (
                        <span key={d} className="rounded bg-[#0D2218]/60 px-1.5 py-0.5 font-mono text-[0.55rem] text-[#7A9A82]">{d}</span>
                      ))}
                    </div>
                    {g.nest_fee_opportunity && <div className="mt-1 font-mono text-[0.6rem] text-[#7A9A82]">{g.nest_fee_opportunity}</div>}
                    {g.nest_fee && <div className="mt-0.5 font-mono text-[0.6rem] text-amber-300">Fee: {g.nest_fee}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFESSIONAL TEAM */}
        {tab === "team" && team && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(team).map(([key, val]: [string, any]) => (
              <div key={key} className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5 space-y-2">
                <div className="font-mono text-sm font-semibold text-white">{key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</div>
                <div className="text-xs text-[#7A9A82]">{val.role}</div>
                {val.firms && (
                  <div>
                    <h4 className="mb-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[#7A9A82]">Recommended Firms</h4>
                    {val.firms.map((f: string) => <div key={f} className="text-xs text-[#EDE8DC]">{f}</div>)}
                  </div>
                )}
                {val.typical_fee_pct && <div className="font-mono text-xs text-amber-300">Fee: {val.typical_fee_pct[0]}% - {val.typical_fee_pct[1]}%</div>}
                {val.fee_usd && <div className="font-mono text-xs text-amber-300">Fee: ${fmt(val.fee_usd[0])} - ${fmt(val.fee_usd[1])}</div>}
                {val.nest_automates && <span className="inline-block rounded bg-amber-300/15 px-2 py-0.5 font-mono text-[0.6rem] text-amber-300">{val.nest_automates}</span>}
              </div>
            ))}
          </div>
        )}

        {/* PHASE BONDS */}
        {tab === "phases" && (
          <div className="space-y-4">
            <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
              <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#7A9A82]">Structure Phase Bonds</h3>
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex-1">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#7A9A82]">Total Project Cost ($)</span>
                  <input className={inputCls} value={tpc} onChange={(e) => setTpc(e.target.value)} />
                </label>
                <label className="flex-1">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#7A9A82]">Base Rate (bps)</span>
                  <input className={inputCls} value={baseRate} onChange={(e) => setBaseRate(e.target.value)} />
                </label>
                <button onClick={structurePhase} className="rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 hover:bg-amber-300/20">
                  Structure Phase Bonds
                </button>
              </div>
            </div>

            {phaseResult && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Total Phases", value: phaseResult.total_phases },
                    { label: "Construction Months", value: phaseResult.total_construction_months },
                    { label: "Peak Exposure", value: fmtM(phaseResult.peak_exposure_usd) },
                    { label: "Wtd Avg Rate", value: `${(phaseResult.weighted_avg_rate_bps / 100).toFixed(2)}%` },
                  ].map((k) => (
                    <article key={k.label} className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
                      <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">{k.label}</span>
                      <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{k.value}</strong>
                    </article>
                  ))}
                </div>

                {/* Phase Table */}
                <div className="overflow-x-auto rounded-[1.25rem] border border-white/10 bg-[#07101a]/80">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">
                        <th className="px-4 py-3">Phase</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Rate</th>
                        <th className="px-4 py-3">Term</th><th className="px-4 py-3">Call Mo</th><th className="px-4 py-3">Put Mo</th><th className="px-4 py-3">Security</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phaseResult.phases?.map((p: any) => (
                        <tr key={p.phase} className="border-b border-white/5 text-[#EDE8DC]">
                          <td className="px-4 py-2.5 capitalize text-white">{p.phase.replace(/_/g, " ")}</td>
                          <td className="px-4 py-2.5 text-amber-300">{fmtM(p.tranche_amount_usd)}</td>
                          <td className="px-4 py-2.5">{p.rate_pct}%</td>
                          <td className="px-4 py-2.5">{p.duration_months}mo</td>
                          <td className="px-4 py-2.5">{p.call_eligible_month}</td>
                          <td className="px-4 py-2.5">{p.put_protection_until_month}</td>
                          <td className="px-4 py-2.5 text-[#7A9A82]">{p.security?.replace(/_/g, " ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* NEST Economics */}
                <div className="rounded-[1.25rem] border border-amber-300/20 bg-[#07101a]/80 p-5">
                  <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#7A9A82]">NEST Economics - Phase Bonds vs Single Bond</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Phase Bond Fees", value: fmtM(phaseResult.nest_economics?.total_nest_fees_usd || 0) },
                      { label: "Single Bond Fee", value: fmtM(phaseResult.nest_economics?.single_bond_fee_usd || 0) },
                      { label: "Premium", value: `+${phaseResult.nest_economics?.premium_pct_over_single}%` },
                    ].map((k) => (
                      <article key={k.label} className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
                        <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">{k.label}</span>
                        <strong className="mt-2 block font-mono text-xl font-semibold text-white">{k.value}</strong>
                      </article>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#7A9A82]">{phaseResult.nest_economics?.why_phase_bonds}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* 100% FINANCING PATH */}
        {tab === "100pct" && path && (
          <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5 space-y-4">
            <h3 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#7A9A82]">The Path to 100% Financing</h3>
            <p className="text-sm text-[#7A9A82]">{path.description}</p>
            <div className="space-y-0">
              {path.steps?.map((step: string, i: number) => (
                <div key={i} className="flex items-start gap-4 border-b border-white/5 py-3 last:border-b-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-300 font-mono text-xs font-bold text-[#03060b]">{i + 1}</div>
                  <div className="pt-1 text-sm text-[#EDE8DC]">{step}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3">
              <div className="font-mono text-[0.65rem] font-semibold text-amber-300">Key Formula</div>
              <div className="mt-1 font-mono text-sm text-white">{path.key_formula}</div>
            </div>
            <div className="text-xs">
              <span className="font-semibold text-red-400">Risk: </span>
              <span className="text-[#7A9A82]">{path.risk}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
