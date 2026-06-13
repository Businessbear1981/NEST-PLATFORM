"use client";
import { useState } from "react";
import { checkTEFRACompliance, HBO2_TEFRA, type TEFRAInputs } from "@/lib/engines/tefra";
import { logLocal } from "@/lib/engines/feedback";

function fmt$(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function TEFRAEngine() {
  const [inputs, setInputs] = useState<TEFRAInputs>({ ...HBO2_TEFRA });
  const [result, setResult] = useState<ReturnType<typeof checkTEFRACompliance> | null>(null);

  function runCheck() {
    const res = checkTEFRACompliance(inputs);
    setResult(res);
    logLocal({
      engine: "tefra",
      dealName: "HBO2 TEFRA Check",
      inputs: inputs as unknown as Record<string, unknown>,
      outputs: res as unknown as Record<string, unknown>,
    });
  }

  const tefraBadgeStyle = (status: string) => {
    if (status === "COMPLIANT") return "bg-emerald-500/15 text-emerald-400";
    if (status === "MINOR_ISSUES") return "bg-amber-500/15 text-amber-400";
    return "bg-red-500/15 text-red-400";
  };

  const tests = result
    ? [
        { label: "Qualified Bond Test",   entry: result.qualifiedBondTest },
        { label: "Volume Cap Test",        entry: result.volumeCapTest },
        { label: "Private Activity Test",  entry: result.privateActivityTest },
        { label: "Arbitrage Test",         entry: result.arbitrageTest },
        { label: "Public Approval",        entry: result.publicApprovalTest },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-[#EDE8DC]">TEFRA Compliance Engine</h2>
      <p className="font-mono text-sm text-[#7A9A82]">
        Tax Equity and Fiscal Responsibility Act — public approval &amp; private activity bond checks
      </p>

      {/* Input form */}
      <div className="rounded-2xl border border-[#1E4A2E] bg-[#0D2218] p-6">
        <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-[#7A9A82]">Input Parameters</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div>
            <label className="block font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[#7A9A82] mb-1">Bond Face ($)</label>
            <input
              type="number"
              value={inputs.bondFace}
              onChange={(e) => setInputs({ ...inputs, bondFace: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:border-[#C4A048] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[#7A9A82] mb-1">Qualified Use %</label>
            <input
              type="number"
              step="0.1"
              value={inputs.qualifiedUsePercent}
              onChange={(e) => setInputs({ ...inputs, qualifiedUsePercent: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:border-[#C4A048] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[#7A9A82] mb-1">Private Use %</label>
            <input
              type="number"
              step="0.1"
              value={inputs.privateUsePercent}
              onChange={(e) => setInputs({ ...inputs, privateUsePercent: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:border-[#C4A048] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {[
              { key: "publicHearingHeld" as keyof TEFRAInputs, label: "Public Hearing Held" },
              { key: "approvalResolutionPassed" as keyof TEFRAInputs, label: "Approval Resolution Passed" },
              { key: "bondCounselEngaged" as keyof TEFRAInputs, label: "Bond Counsel Engaged" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!inputs[key]}
                  onChange={(e) => setInputs({ ...inputs, [key]: e.target.checked })}
                  className="h-4 w-4 rounded border-[#2D6B3D] bg-[#030A06] accent-[#C4A048]"
                />
                <span className="font-mono text-sm text-[#EDE8DC]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={runCheck}
          className="mt-6 rounded-xl bg-[#C4A048] px-6 py-3 font-mono text-sm font-semibold text-[#030A06] transition-colors hover:bg-[#E8C87A]"
        >
          Run TEFRA Check
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-[#1E4A2E] bg-[#0D2218] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] ${tefraBadgeStyle(result.overallStatus)}`}>
              {result.overallStatus}
            </span>
            <span className="font-mono text-[0.65rem] text-[#7A9A82]">Risk: {result.riskLevel ?? "LOW"}</span>
            <span className="ml-auto font-mono text-sm font-bold text-[#C4A048]">
              Counsel Fees: {fmt$(result.estimatedCounselFees ?? 45000)}
            </span>
          </div>

          <div className="space-y-2">
            {tests.map(({ label, entry }) => (
              <div key={label} className="flex items-start gap-3 rounded-lg border border-[#2D6B3D]/20 bg-[#030A06] px-3 py-2.5">
                <span className={`mt-0.5 shrink-0 font-bold ${entry?.pass ?? true ? "text-emerald-400" : "text-red-400"}`}>
                  {entry?.pass ?? true ? "✓" : "✗"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#EDE8DC]">{label}</p>
                  <p className="font-mono text-[0.62rem] text-[#7A9A82]">{entry?.reason ?? ""}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] uppercase ${entry?.pass ?? true ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {entry?.pass ?? true ? "PASS" : "FAIL"}
                </span>
              </div>
            ))}
          </div>

          {result.restrictions && result.restrictions.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[0.62rem] uppercase text-red-400">Restrictions</p>
              {result.restrictions.map((r: string, i: number) => (
                <p key={i} className="font-mono text-[0.65rem] text-red-400">· {r}</p>
              ))}
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[0.62rem] uppercase text-amber-400">Recommendations</p>
              {result.recommendations.map((r: string, i: number) => (
                <p key={i} className="font-mono text-[0.65rem] text-amber-400">· {r}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
