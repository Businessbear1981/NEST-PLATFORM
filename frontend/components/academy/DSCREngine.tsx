"use client";

import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, LineChart, Line, CartesianGrid, Cell,
} from "recharts";
import { runWaterfall, stressTest, DEFAULT_SCENARIOS, HBO2_INPUTS, type OperatingInputs } from "@/lib/engines/dscr";
import { logLocal } from "@/lib/engines/feedback";

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtUSD = (n: number) => "$" + fmt(n);

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: "bg-emerald-800 text-emerald-200",
    "BBB+": "bg-[#1E4A2E] text-[#C4A048]",
    BBB: "bg-[#1E4A2E] text-[#C4A048]",
    "BBB-": "bg-amber-900 text-amber-300",
    "Sub-IG": "bg-red-900 text-red-300",
  };
  return (
    <span className={`font-mono text-sm px-3 py-1 rounded-full ${colors[grade] ?? "bg-zinc-700 text-zinc-200"}`}>
      {grade}
    </span>
  );
}

const getDscrGrade = (dscr: number): string => {
  if (dscr >= 2.0) return "A";
  if (dscr >= 1.75) return "BBB+";
  if (dscr >= 1.5) return "BBB-";
  return "Sub-IG";
};

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#0D2218",
    border: "1px solid rgba(196,160,72,0.3)",
    color: "#EDE8DC",
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "12px",
  },
};

export default function DSCREngine() {
  const [dscrInputs, setDscrInputs] = useState<OperatingInputs>(HBO2_INPUTS as OperatingInputs);
  const [dscrResult, setDscrResult] = useState<ReturnType<typeof runWaterfall> | null>(null);
  const [stressResult, setStressResult] = useState<ReturnType<typeof stressTest> | null>(null);

  const handleRunWaterfall = () => {
    const r = runWaterfall(dscrInputs);
    setDscrResult(r);
    const s = stressTest(dscrInputs, DEFAULT_SCENARIOS);
    setStressResult(s);
    logLocal({
      engine: "dscr",
      inputs: dscrInputs as unknown as Record<string, unknown>,
      outputs: r as unknown as Record<string, unknown>,
    });
  };

  const waterfallData = dscrResult
    ? [
        { name: "GPR", value: dscrResult.grossPotentialRevenue / 1e6 },
        { name: "−Vacancy", value: -(dscrResult.vacancyLoss / 1e6) },
        { name: "EGI", value: dscrResult.effectiveGrossIncome / 1e6 },
        { name: "−OpEx", value: -(dscrResult.operatingExpenses / 1e6) },
        { name: "−Reserves", value: -(dscrResult.replacementReserves / 1e6) },
        { name: "NOI", value: dscrResult.netOperatingIncome / 1e6 },
        { name: "−Debt Svc", value: -(dscrResult.debtService / 1e6) },
        { name: "CADS", value: dscrResult.cashAfterDebtService / 1e6 },
      ]
    : [];

  const stressChartData = stressResult
    ? stressResult.map((row) => ({
        name: row.scenario,
        dscr: parseFloat(row.dscr.toFixed(2)),
      }))
    : [];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif text-[#EDE8DC]">DSCR Waterfall Engine</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Input panel */}
        <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6 space-y-4">
          <h3 className="font-serif text-xl text-[#C4A048] mb-2">HBO2 Inputs</h3>
          {(
            [
              ["Gross Revenue", "grossRevenue"],
              ["Operating Expense Ratio", "operatingExpenseRatio"],
              ["Reserve / Unit", "replacementReservePerUnit"],
              ["Units", "units"],
              ["Annual Debt Service", "annualDebtService"],
              ["Loan Balance", "loanBalance"],
              ["Cap Rate", "capRate"],
            ] as [string, keyof OperatingInputs][]
          ).map(([label, key]) => (
            <div key={key as string}>
              <label className="block text-xs text-[#7A9A82] font-mono mb-1">{label}</label>
              <input
                type="number"
                value={(dscrInputs as unknown as Record<string, number>)[key as string] ?? ""}
                onChange={(e) =>
                  setDscrInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))
                }
                className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
              />
            </div>
          ))}

          {/* Vacancy Rate slider */}
          <div>
            <label className="block text-xs text-[#7A9A82] font-mono mb-1">
              Vacancy Rate: {(dscrInputs.vacancyRate * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0.01}
              max={0.30}
              step={0.01}
              value={dscrInputs.vacancyRate}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                const updated = { ...dscrInputs, vacancyRate: v };
                setDscrInputs(updated);
                const r = runWaterfall(updated);
                setDscrResult(r);
                const s = stressTest(updated, DEFAULT_SCENARIOS);
                setStressResult(s);
              }}
              className="w-full accent-[#C4A048]"
            />
          </div>

          <button
            onClick={handleRunWaterfall}
            className="w-full mt-4 bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold py-3 rounded-xl"
          >
            Run Waterfall
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {dscrResult && (
            <>
              {/* DSCR hero */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6 flex items-center gap-8">
                <div>
                  <div className="text-xs text-[#7A9A82] font-mono mb-1">DEBT SERVICE COVERAGE RATIO</div>
                  <div className="text-6xl font-mono text-[#C4A048]">{dscrResult.dscr?.toFixed(2) ?? "—"}</div>
                </div>
                <GradeBadge grade={getDscrGrade(dscrResult.dscr ?? 0)} />
              </div>

              {/* Waterfall bar chart */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
                <h3 className="font-serif text-lg text-[#C4A048] mb-4">NOI Waterfall ($M)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={waterfallData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
                    <XAxis dataKey="name" tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <YAxis tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `$${v.toFixed(1)}M`} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toFixed(2)}M`, "Value"]} />
                    <ReferenceLine y={0} stroke="#7A9A82" />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.value >= 0 ? "#C4A048" : "#EF4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Waterfall table */}
              {(() => {
                const rows = [
                  { label: "Gross Potential Revenue",    value: dscrResult.grossPotentialRevenue, isRatio: false },
                  { label: "Less: Vacancy Loss",         value: -dscrResult.vacancyLoss,           isRatio: false },
                  { label: "= Effective Gross Income",   value: dscrResult.effectiveGrossIncome,   isRatio: false },
                  { label: "Less: Operating Expenses",   value: -dscrResult.operatingExpenses,     isRatio: false },
                  { label: "Less: Replacement Reserves", value: -dscrResult.replacementReserves,   isRatio: false },
                  { label: "= Net Operating Income",     value: dscrResult.netOperatingIncome,     isRatio: false },
                  { label: "Less: Annual Debt Service",  value: -dscrResult.debtService,           isRatio: false },
                  { label: "= Cash After Debt Service",  value: dscrResult.cashAfterDebtService,   isRatio: false },
                  { label: "DSCR",                       value: dscrResult.dscr,                   isRatio: true  },
                  { label: "LTV",                        value: dscrResult.ltv,                    isRatio: true  },
                  { label: "Implied Value",              value: dscrResult.impliedValue,           isRatio: false },
                ];
                return (
                  <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
                    <table className="w-full text-sm font-mono">
                      <thead>
                        <tr className="border-b border-[#1E4A2E]">
                          <th className="text-left px-6 py-3 text-[#7A9A82]">Line Item</th>
                          <th className="text-right px-6 py-3 text-[#7A9A82]">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} className="border-b border-[#1E4A2E] hover:bg-[#1E4A2E]/30">
                            <td className="px-6 py-3 text-[#EDE8DC]">{row.label}</td>
                            <td className={`px-6 py-3 text-right ${row.label.startsWith("=") || row.label === "DSCR" ? "text-[#C4A048] font-semibold" : row.value < 0 ? "text-red-400" : "text-[#EDE8DC]"}`}>
                              {row.isRatio ? row.value.toFixed(2) + (row.label === "LTV" ? "%" : "×") : fmtUSD(Math.abs(row.value))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </>
          )}

          {/* Stress test table */}
          {stressResult && (
            <>
              {/* Stress line chart */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
                <h3 className="font-serif text-lg text-[#C4A048] mb-4">Stress Scenario DSCR</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stressChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
                    <XAxis dataKey="name" tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} />
                    <YAxis domain={[0, 3]} tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <ReferenceLine y={1.2} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "Min 1.20", fill: "#EF4444", fontSize: 10 }} />
                    <Line type="monotone" dataKey="dscr" stroke="#C4A048" strokeWidth={2} dot={{ fill: "#C4A048", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1E4A2E]">
                  <h3 className="font-serif text-lg text-[#C4A048]">Stress Scenarios</h3>
                </div>
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-[#1E4A2E]">
                      <th className="text-left px-6 py-3 text-[#7A9A82]">Scenario</th>
                      <th className="text-right px-6 py-3 text-[#7A9A82]">DSCR</th>
                      <th className="text-center px-6 py-3 text-[#7A9A82]">Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stressResult.map((row: { scenario: string; dscr: number; pass: boolean }, i: number) => (
                      <tr key={i} className="border-b border-[#1E4A2E] hover:bg-[#1E4A2E]/30">
                        <td className="px-6 py-3 text-[#EDE8DC]">{row.scenario}</td>
                        <td className="px-6 py-3 text-right text-[#EDE8DC]">{row.dscr?.toFixed(2)}</td>
                        <td className="px-6 py-3 text-center">{row.pass ? "✓" : "✗"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!dscrResult && (
            <div className="flex items-center justify-center h-48 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
              Enter inputs and click Run Waterfall
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
