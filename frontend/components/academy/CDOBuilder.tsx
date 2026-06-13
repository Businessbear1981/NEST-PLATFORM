"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";
import { buildCDO, HBO2_CDO_POOL } from "@/lib/engines/cdo";

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtUSD = (n: number) => "$" + fmt(n);
const fmtPct = (n: number, dec = 2) => (n * 100).toFixed(dec) + "%";

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

const cdoPayoffColor = (pct: number) => {
  if (pct >= 90) return "text-emerald-400";
  if (pct >= 50) return "text-amber-400";
  return "text-red-400";
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

const TRANCHE_COLORS = ["#C4A048", "#7A9A82", "#EF4444"];

export default function CDOBuilder() {
  const [cdoResult, setCdoResult] = useState<ReturnType<typeof buildCDO> | null>(null);

  const handleBuildCDO = () => {
    setCdoResult(buildCDO(HBO2_CDO_POOL));
  };

  // Area chart: X = loss rate (0-30%), Y = tranche payoff %
  const areaChartData = cdoResult
    ? cdoResult.waterfallScenarios.map((s) => ({
        lossRate: (s.lossRate * 100).toFixed(0) + "%",
        ...Object.fromEntries(
          Object.entries(s.tranchePayoffs).map(([k, v]) => [k, parseFloat((v * 100).toFixed(1))])
        ),
      }))
    : [];

  // Bar chart: expected loss by tranche in bps
  const elBarData = cdoResult
    ? cdoResult.tranches.map((t) => ({
        name: t.name,
        "Exp Loss (bps)": parseFloat((t.expectedLoss * 10000).toFixed(1)),
      }))
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-[#EDE8DC]">CDO Builder — HBO2 Pool</h2>
        <button
          onClick={handleBuildCDO}
          className="bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold px-8 py-3 rounded-xl"
        >
          Build CDO
        </button>
      </div>

      {/* Pool preview */}
      <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
        <h3 className="font-mono text-sm text-[#7A9A82] mb-3">POOL — HBO2 ASSETS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E4A2E]">
                {["Tranche", "Notional", "Spread (bps)", "Attach %", "Detach %"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-[#7A9A82]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HBO2_CDO_POOL.tranches.map((t, i) => (
                <tr key={i} className="border-b border-[#1E4A2E]/50">
                  <td className="px-4 py-2 text-[#C4A048]">{t.name}</td>
                  <td className="px-4 py-2 text-[#EDE8DC]">{fmtUSD(t.notional)}</td>
                  <td className="px-4 py-2">{t.spread}</td>
                  <td className="px-4 py-2">{fmtPct(t.attachmentPct, 0)}</td>
                  <td className="px-4 py-2">{fmtPct(t.detachmentPct, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {cdoResult && (
        <>
          {/* Tranche table */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E4A2E]">
              <h3 className="font-serif text-lg text-[#C4A048]">Tranche Structure</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1E4A2E]">
                    {["Tranche", "Attach %", "Detach %", "Thickness", "Exp. Loss %", "BE Spread (bps)", "IRR %", "Survivorship %"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#7A9A82]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cdoResult.tranches?.map((t, i) => (
                    <tr key={i} className="border-b border-[#1E4A2E] hover:bg-[#1E4A2E]/30">
                      <td className="px-4 py-3 text-[#C4A048]">{t.name}</td>
                      <td className="px-4 py-3">{fmtPct(t.attachment, 1)}</td>
                      <td className="px-4 py-3">{fmtPct(t.detachment, 1)}</td>
                      <td className="px-4 py-3">{fmtPct(t.thickness, 1)}</td>
                      <td className="px-4 py-3">{fmtPct(t.expectedLoss, 2)}</td>
                      <td className="px-4 py-3">{t.breakEvenSpread.toFixed(0)}</td>
                      <td className="px-4 py-3">{t.irr.toFixed(1)}%</td>
                      <td className="px-4 py-3">{t.survivorshipPct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Area chart: tranche payoff vs pool loss */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
            <h3 className="font-serif text-lg text-[#C4A048] mb-4">Tranche Payoff vs Pool Loss Rate</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={areaChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
                <XAxis dataKey="lossRate" tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `${v}%`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
                <Legend wrapperStyle={{ color: "#7A9A82", fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                {["Senior A", "Mezzanine B", "Equity"].map((name, i) => (
                  <Area
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={TRANCHE_COLORS[i]}
                    fill={TRANCHE_COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Expected loss bar chart */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
            <h3 className="font-serif text-lg text-[#C4A048] mb-4">Expected Loss by Tranche (bps)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={elBarData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
                <XAxis dataKey="name" tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <YAxis tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="Exp Loss (bps)" fill="#C4A048" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Waterfall scenarios */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E4A2E]">
              <h3 className="font-serif text-lg text-[#C4A048]">Loss Scenario Waterfall</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1E4A2E]">
                    <th className="text-left px-4 py-3 text-[#7A9A82]">Loss Rate</th>
                    {cdoResult.tranches?.map((t) => (
                      <th key={t.name} className="text-left px-4 py-3 text-[#7A9A82]">{t.name} Payoff</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cdoResult.waterfallScenarios?.map((row, i) => (
                    <tr key={i} className="border-b border-[#1E4A2E]/50 hover:bg-[#1E4A2E]/20">
                      <td className="px-4 py-3 text-[#EDE8DC]">{fmtPct(row.lossRate, 0)}</td>
                      {Object.values(row.tranchePayoffs).map((p, j) => (
                        <td key={j} className={`px-4 py-3 ${cdoPayoffColor(p * 100)}`}>
                          {(p * 100).toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!cdoResult && (
        <div className="flex items-center justify-center h-32 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
          Click Build CDO to run analysis
        </div>
      )}
    </div>
  );
}
