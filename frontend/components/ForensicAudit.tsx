"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function ForensicAudit() {
  const [standards, setStandards] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/audit/standards`).then((r) => r.json()).then((d) => setStandards(d.data)).catch(() => {});
  }, []);

  async function runAudit() {
    setRunning(true);
    try {
      const res = await fetch(`${API}/api/audit/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal: { name: "Current Deal" }, documents: {}, financials: {} }),
      });
      const d = await res.json();
      setAuditResult(d.data);
    } catch {
      /* swallow */
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-[#EDE8DC]">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-200">Compliance Engine</p>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Forensic Audit Engine</h1>
          <p className="mt-1 font-mono text-xs italic text-[#7A9A82]">If it passes this, it passes the rating agencies.</p>
        </div>

        {/* Audit Categories */}
        {standards && (
          <div className="space-y-2">
            <h2 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#7A9A82]">Audit Categories</h2>
            {Object.entries(standards).map(([key, val]: [string, any]) => (
              <div key={key} className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-4">
                <button
                  onClick={() => setExpanded(expanded === key ? null : key)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-white">
                      {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <span className="rounded bg-[#0D2218]/60 px-2 py-0.5 font-mono text-[0.55rem] uppercase text-[#7A9A82]">{val.level}</span>
                  </div>
                  <span className="rounded bg-[#0D2218]/60 px-2 py-0.5 font-mono text-[0.6rem] text-[#7A9A82]">{val.checks?.length} checks</span>
                </button>
                {expanded === key && (
                  <div className="mt-3 space-y-1 border-t border-white/5 pt-3">
                    <p className="text-xs text-[#7A9A82]">{val.description}</p>
                    {val.checks?.map((check: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 py-0.5 text-xs text-[#EDE8DC]">
                        <span className="shrink-0 text-amber-300/60">{"\u2022"}</span>
                        <span>{check}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={runAudit}
          disabled={running}
          className="rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 transition hover:bg-amber-300/20 disabled:opacity-50"
        >
          {running ? "Running FBI/DOJ-standard analysis..." : "Run Full Forensic Audit"}
        </button>

        {/* Audit Results */}
        {auditResult && (
          <div className="space-y-4">
            {/* Score KPIs */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">Overall Score</span>
                <strong className="mt-2 block font-mono text-4xl font-semibold tracking-[-0.03em] text-white">{auditResult.overall_score}</strong>
                <span className="font-mono text-xs text-[#7A9A82]">/100</span>
              </article>
              <article className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">Clean Opinion</span>
                <div className={`mt-2 inline-block rounded px-3 py-1 font-mono text-sm font-bold ${auditResult.clean_opinion ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {auditResult.clean_opinion ? "YES" : "NO"}
                </div>
              </article>
              <article className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">JP Morgan Ready</span>
                <div className={`mt-2 inline-block rounded px-3 py-1 font-mono text-sm font-bold ${auditResult.jp_morgan_ready ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {auditResult.jp_morgan_ready ? "YES" : "NO"}
                </div>
              </article>
              <article className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">Total Findings</span>
                <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{auditResult.total_findings}</strong>
              </article>
            </div>

            {/* Critical Issues */}
            {auditResult.critical_issues?.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-red-400">Critical Issues - Must Resolve</h2>
                {auditResult.critical_issues.map((issue: any, i: number) => (
                  <div key={i} className="rounded-[1rem] border border-red-500/30 bg-red-500/[0.08] p-4">
                    <div className="font-mono text-xs font-semibold text-white">{issue.check}</div>
                    <div className="mt-1 text-xs text-[#7A9A82]">{issue.recommendation}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Category Breakdown */}
            <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
              <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#7A9A82]">Category Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(auditResult.category_scores || {}).map(([cat, data]: [string, any]) => (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-xs capitalize text-[#EDE8DC]">{cat.replace(/_/g, " ")}</span>
                      <span className="font-mono text-xs font-semibold text-amber-300">{data.score}/100</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#03060b]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          data.score >= 80 ? "bg-emerald-400" : data.score >= 50 ? "bg-amber-300" : "bg-red-500"
                        }`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="font-mono text-[0.55rem] text-[#7A9A82]">Audit Trail: {auditResult.audit_trail_hash}</div>
          </div>
        )}
      </div>
    </main>
  );
}
