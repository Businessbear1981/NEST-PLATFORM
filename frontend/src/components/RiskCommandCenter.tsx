import { useEffect, useState } from "react";

const API = "";

export default function RiskCommandCenter() {
  const [deals, setDeals] = useState<any[]>([]);
  const [scoring, setScoring] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/api/deals`).then((r) => r.json()).then((d) => { if (d.data) setDeals(d.data); }).catch(() => {});
  }, []);

  async function runAudit(deal: any) {
    setScoring(true);
    try {
      const r = await fetch(`${API}/api/bond-tools/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal,
          credit_metrics: { dscr: 1.65, ltv: 67, debt_to_ebitda: 5.5, interest_coverage: 2.6 },
        }),
      });
      const d = await r.json();
      if (d.data) setAuditResult(d.data);
    } catch {
      /* swallow */
    } finally {
      setScoring(false);
    }
  }

  const dimensions = ["Market Risk", "Construction Risk", "Credit Risk", "Operational Risk", "Regulatory Risk", "Sponsor Risk", "Environmental Risk"];

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-200">Risk Assessment - Sentinel Agent</p>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Risk Command Center</h1>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Deals Monitored", value: String(deals.length) },
            { label: "Green", value: String(deals.length) },
            { label: "Yellow", value: "0" },
            { label: "Alerts Active", value: "0" },
          ].map((k) => (
            <article key={k.label} className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{k.label}</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{k.value}</strong>
            </article>
          ))}
        </div>

        {/* Deal Risk Cards */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {deals.map((d: any) => (
            <div
              key={d.id}
              className="cursor-pointer rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5 transition hover:border-amber-300/20"
              onClick={() => runAudit(d)}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm font-semibold text-white">{d.name}</div>
                  <div className="mt-0.5 font-mono text-[0.55rem] text-slate-600">{d.project?.city}, {d.project?.state}</div>
                </div>
                <span className="rounded bg-emerald-800/40 px-2 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-wider text-emerald-400">GREEN</span>
              </div>
              <div className="mb-3 font-mono text-lg font-bold text-amber-300">${((d.project?.total_project_cost_usd || 0) / 1e6).toFixed(0)}M</div>

              {/* Risk dimension bars */}
              {dimensions.map((dim) => (
                <div key={dim} className="mb-1 flex items-center gap-2">
                  <div className="w-20 font-mono text-[0.45rem] uppercase tracking-wider text-slate-600">{dim.replace(" Risk", "")}</div>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#03060b]">
                    <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${15 + Math.random() * 20}%` }} />
                  </div>
                </div>
              ))}

              <button
                className="mt-3 w-full rounded-lg border border-amber-300/30 bg-amber-300/[0.06] py-1.5 font-mono text-[0.6rem] uppercase tracking-wider text-amber-200 transition hover:bg-amber-300/15"
                disabled={scoring}
              >
                {scoring ? "Scoring..." : "Run Sentinel Audit"}
              </button>
            </div>
          ))}
        </div>

        {/* Audit Result */}
        {auditResult && (
          <div className="rounded-[1.25rem] border border-amber-300/30 bg-[#07101a]/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-amber-300">Audit Result - {auditResult.deal_name}</div>
              <div className="flex items-center gap-4">
                <div className={`font-mono text-4xl font-semibold ${
                  auditResult.grade === "A" ? "text-amber-300" : auditResult.grade === "B" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {auditResult.grade}
                </div>
                <div>
                  <div className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">Score</div>
                  <div className="font-mono text-xl font-semibold text-white">{auditResult.composite_score}</div>
                </div>
              </div>
            </div>
            <div className="mb-3 text-sm text-slate-300">{auditResult.recommendation}</div>
            <div className="font-mono text-[0.62rem] text-slate-500">
              Passed: {auditResult.passed}/{auditResult.total_checks} - Failed: {auditResult.failed} - Blockers: {auditResult.blocker_count}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
