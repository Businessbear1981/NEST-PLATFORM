"use client";
import { useState } from "react";
import {
  analyzeCall,
  monteCarloCallOptimization,
  JACARANDA_REFI,
  HBO2_REFI,
  type BondCallInputs,
} from "@/lib/engines/refi";
import { logLocal } from "@/lib/engines/feedback";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

function fmt$(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const DEALS = {
  jacaranda: { label: "Jacaranda Trace $231M", inputs: JACARANDA_REFI },
  hbo2:      { label: "HBO2 $116.25M",         inputs: HBO2_REFI },
} as const;

type DealKey = keyof typeof DEALS;

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#0D2218] p-2 font-mono text-[0.7rem] text-[#EDE8DC] shadow-xl">
      <p className="text-[#7A9A82]">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ${p.value?.toFixed(2)}M
        </p>
      ))}
    </div>
  );
};

export default function RefiEngine() {
  const [selectedDeal, setSelectedDeal] = useState<DealKey>("hbo2");
  const [inputs, setInputs] = useState<BondCallInputs>({ ...HBO2_REFI });
  const [result, setResult] = useState<ReturnType<typeof analyzeCall> | null>(null);
  const [mcResult, setMcResult] = useState<ReturnType<typeof monteCarloCallOptimization> | null>(null);

  function selectDeal(key: DealKey) {
    setSelectedDeal(key);
    setInputs({ ...DEALS[key].inputs });
    setResult(null);
    setMcResult(null);
  }

  function runAnalysis() {
    const r = analyzeCall(inputs);
    const mc = monteCarloCallOptimization(inputs);
    setResult(r);
    setMcResult(mc);
    logLocal({
      engine: "dscr",
      dealName: `Refi Analysis — ${DEALS[selectedDeal].label}`,
      inputs: inputs as unknown as Record<string, unknown>,
      outputs: { ...r, mc } as unknown as Record<string, unknown>,
    });
  }

  // Sensitivity chart — 10 points 3% → 7%
  const sensData = inputs
    ? Array.from({ length: 10 }, (_, i) => {
        const rate = 0.03 + i * (0.04 / 9);
        const r = analyzeCall({ ...inputs, refundingCoupon: rate });
        return { rate: `${(rate * 100).toFixed(1)}%`, npvM: r.npvSavings / 1_000_000 };
      })
    : [];

  const recBadgeStyle = (rec: string) => {
    if (rec === "CALL NOW") return "bg-emerald-500/15 text-emerald-400";
    if (rec === "WAIT")     return "bg-amber-500/15 text-amber-400";
    if (rec === "TENDER")   return "bg-blue-500/15 text-blue-400";
    return "bg-[#2D6B3D]/20 text-[#7A9A82]";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-[#EDE8DC]">Refi / Call Optimization Engine</h2>
      <p className="font-mono text-sm text-[#7A9A82]">
        Advance refunding analysis — NPV savings, breakeven, Monte Carlo call probability
      </p>

      {/* Deal selector */}
      <div className="flex gap-2">
        {(Object.keys(DEALS) as DealKey[]).map((key) => (
          <button
            key={key}
            onClick={() => selectDeal(key)}
            className={`rounded-lg px-4 py-2 font-mono text-sm transition-colors ${
              selectedDeal === key
                ? "bg-[#C4A048] text-[#030A06] font-semibold"
                : "border border-[#2D6B3D]/40 text-[#7A9A82] hover:border-[#C4A048] hover:text-[#EDE8DC]"
            }`}
          >
            {DEALS[key].label}
          </button>
        ))}
      </div>

      {/* Input form */}
      <div className="rounded-2xl border border-[#1E4A2E] bg-[#0D2218] p-6">
        <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-[#7A9A82]">Input Parameters</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            { key: "currentCoupon",    label: "Current Coupon",     step: "0.001" },
            { key: "refundingCoupon",  label: "Refunding Coupon",   step: "0.001" },
            { key: "currentOutstanding", label: "Outstanding ($)", step: "100000" },
            { key: "callPrice",        label: "Call Price",         step: "0.001" },
            { key: "refundingCosts",   label: "Refunding Costs ($)",step: "1000" },
            { key: "escrowYield",      label: "Escrow Yield",       step: "0.001" },
          ] as { key: keyof BondCallInputs; label: string; step: string }[]).map(({ key, label, step }) => (
            <div key={key}>
              <label className="block font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[#7A9A82] mb-1">{label}</label>
              <input
                type="number"
                step={step}
                value={inputs[key] as number}
                onChange={(e) => setInputs({ ...inputs, [key]: Number(e.target.value) })}
                className="w-full rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:border-[#C4A048] focus:outline-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={runAnalysis}
          className="mt-6 rounded-xl bg-[#C4A048] px-6 py-3 font-mono text-sm font-semibold text-[#030A06] transition-colors hover:bg-[#E8C87A]"
        >
          Analyze Call
        </button>
      </div>

      {/* Results */}
      {result && mcResult && (
        <div className="rounded-2xl border border-[#1E4A2E] bg-[#0D2218] p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">NPV Savings</p>
              <p className="font-mono text-2xl font-bold text-[#C4A048]">{fmt$(result.npvSavings)}</p>
            </div>
            <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Recommendation</p>
              <div className="mt-1.5">
                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] ${recBadgeStyle(result.recommendation)}`}>
                  {result.recommendation}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Breakeven</p>
              <p className="font-mono text-xl font-bold text-[#EDE8DC]">{result.breakevenYears?.toFixed(1) ?? "—"} yrs</p>
            </div>
            <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Call Probability</p>
              <p className="font-mono text-xl font-bold text-[#EDE8DC]">
                {((mcResult.callProbability ?? 0) * 100).toFixed(0)}%
              </p>
              <p className="font-mono text-[0.62rem] text-[#7A9A82]">MC avg: {fmt$(mcResult.averageNpvSavings ?? 0)}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">
              NPV Sensitivity — Refunding Coupon 3% → 7%
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sensData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <XAxis dataKey="rate" tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `$${v.toFixed(1)}M`} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0} stroke="#2D6B3D" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="npvM" stroke="#C4A048" strokeWidth={2} dot={false} name="NPV ($M)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sensitivity preview (always visible) */}
      {!result && (
        <div className="rounded-2xl border border-[#1E4A2E] bg-[#0D2218] p-6">
          <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">
            Pre-analysis Sensitivity — Current Inputs
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sensData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <XAxis dataKey="rate" tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `$${v.toFixed(1)}M`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#2D6B3D" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="npvM" stroke="#7A9A82" strokeWidth={1.5} dot={false} name="NPV ($M)" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
