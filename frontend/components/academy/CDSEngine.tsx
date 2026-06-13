"use client";

import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, CartesianGrid, Cell,
} from "recharts";
import { priceCDS, attributeBasisRisk, HBO2_CDS, type CDSInputs } from "@/lib/engines/cds";
import { logLocal } from "@/lib/engines/feedback";

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtUSD = (n: number) => "$" + fmt(n);

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#0D2218",
    border: "1px solid rgba(196,160,72,0.3)",
    color: "#EDE8DC",
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "12px",
  },
};

export default function CDSEngine() {
  const [cdsInputs, setCdsInputs] = useState<CDSInputs>(HBO2_CDS);
  const [cdsResult, setCdsResult] = useState<ReturnType<typeof priceCDS> | null>(null);

  const handlePriceCDS = () => {
    const r = priceCDS(cdsInputs);
    setCdsResult(r);
    logLocal({
      engine: "cds",
      inputs: cdsInputs as unknown as Record<string, unknown>,
      outputs: r as unknown as Record<string, unknown>,
    });
  };

  // Survival probability curve over maturity
  const survivalCurve = cdsResult
    ? Array.from({ length: cdsInputs.maturityYears }, (_, i) => ({
        year: `Yr ${i + 1}`,
        survivalProb: parseFloat(
          (Math.exp(-cdsInputs.defaultProbabilityPA * (i + 1)) * 100).toFixed(2)
        ),
      }))
    : [];

  // Basis risk scenario P&L chart
  const scenarioData = cdsResult
    ? cdsResult.scenario01.map((s) => ({
        name: s.name.length > 22 ? s.name.slice(0, 22) + "…" : s.name,
        pnl: parseFloat((s.pnl / 1000).toFixed(1)),
      }))
    : [];

  // Basis risk attribution
  const attribution = cdsResult
    ? attributeBasisRisk(cdsInputs, { cdsPremiumBps: cdsInputs.cdsPremiumBps * 1.1 })
    : null;

  const basisBadge =
    cdsResult?.basisType === "negative"
      ? { label: "CHEAP HEDGE", cls: "bg-emerald-800 text-emerald-200" }
      : cdsResult?.basisType === "positive"
      ? { label: "EXPENSIVE", cls: "bg-red-800 text-red-200" }
      : { label: "NEUTRAL", cls: "bg-amber-800 text-amber-200" };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif text-[#EDE8DC]">CDS Basis Risk Engine — HBO2</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Input panel */}
        <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6 space-y-4">
          <h3 className="font-serif text-xl text-[#C4A048] mb-2">CDS Inputs</h3>
          {([
            ["Notional ($)", "notional"],
            ["Maturity (yrs)", "maturityYears"],
            ["CDS Premium (bps)", "cdsPremiumBps"],
            ["Bond Yield (decimal)", "bondYield"],
            ["Risk-Free Rate (SOFR)", "riskFreeRate"],
            ["Recovery Rate", "recoveryRate"],
            ["Default Prob PA", "defaultProbabilityPA"],
            ["Bond Mod Duration", "bondModifiedDuration"],
          ] as [string, keyof CDSInputs][]).map(([label, key]) => (
            <div key={key as string}>
              <label className="block text-xs text-[#7A9A82] font-mono mb-1">{label}</label>
              <input
                type="number"
                step="any"
                value={(cdsInputs as unknown as Record<string, number>)[key as string]}
                onChange={(e) =>
                  setCdsInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))
                }
                className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
              />
            </div>
          ))}
          <button
            onClick={handlePriceCDS}
            className="w-full mt-4 bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold py-3 rounded-xl"
          >
            Price CDS
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {cdsResult ? (
            <>
              {/* Key metrics grid */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl text-[#EDE8DC]">CDS Pricing</h3>
                  <span className={`font-mono text-sm px-3 py-1 rounded-full ${basisBadge.cls}`}>
                    {basisBadge.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[#1E4A2E] rounded-xl p-4 col-span-1">
                    <div className="text-xs text-[#7A9A82] font-mono mb-1">CDS PAR SPREAD</div>
                    <div className="text-3xl text-[#C4A048] font-mono">{cdsResult.cdsParSpread.toFixed(0)}<span className="text-base ml-1">bps</span></div>
                  </div>
                  {[
                    ["Bond ASW Spread", `${cdsResult.bondASWSpread.toFixed(0)} bps`],
                    ["BASIS (CDS − ASW)", `${cdsResult.basis >= 0 ? "+" : ""}${cdsResult.basis.toFixed(0)} bps`],
                    ["Hedge Ratio (DV01)", cdsResult.hedgeRatioDV01.toFixed(3)],
                    ["Annual Carry", `${cdsResult.carry.toFixed(0)} bps`],
                    ["BPV", fmtUSD(cdsResult.bpvUSD)],
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-[#1E4A2E] rounded-xl p-4">
                      <div className="text-xs text-[#7A9A82] font-mono mb-1">{label}</div>
                      <div className={`text-lg font-mono ${label === "BASIS (CDS − ASW)" ? (cdsResult.basis < 0 ? "text-emerald-400" : "text-red-400") : "text-[#C4A048]"}`}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Survival probability curve */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
                <h3 className="font-serif text-lg text-[#C4A048] mb-4">Survival Probability Curve</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={survivalCurve} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
                    <XAxis dataKey="year" tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <YAxis domain={[50, 100]} tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v.toFixed(2)}%`, "Survival Prob"]} />
                    <ReferenceLine y={90} stroke="#7A9A82" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="survivalProb" stroke="#C4A048" strokeWidth={2} dot={{ fill: "#C4A048", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Basis risk scenario P&L */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
                <h3 className="font-serif text-lg text-[#C4A048] mb-4">Basis Risk Scenarios (P&amp;L $K)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={scenarioData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
                    <XAxis
                      dataKey="name"
                      tick={false}
                      interval={0}
                    />
                    <YAxis tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `$${v}K`} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toFixed(1)}K`, "P&L"]} />
                    <ReferenceLine y={0} stroke="#7A9A82" />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {scenarioData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.pnl >= 0 ? "#C4A048" : "#EF4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Basis Risk Attribution */}
              {attribution && (
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                  <h3 className="font-serif text-lg text-[#C4A048] mb-4">Basis Risk Attribution</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      ["Spread Contribution", attribution.spreadContribution],
                      ["Default Contribution", attribution.defaultContribution],
                      ["Recovery Contribution", attribution.recoveryContribution],
                    ].map(([label, val]) => (
                      <div key={label as string} className="bg-[#1E4A2E] rounded-xl p-4">
                        <div className="text-xs text-[#7A9A82] font-mono mb-1">{label as string}</div>
                        <div className={`text-lg font-mono ${(val as number) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {(val as number) >= 0 ? "+" : ""}{fmtUSD(val as number)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-[#1E4A2E] rounded-xl p-4">
                    <div className="text-xs text-[#7A9A82] font-mono mb-1">TOTAL P&L</div>
                    <div className={`text-2xl font-mono ${attribution.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {attribution.totalPnL >= 0 ? "+" : ""}{fmtUSD(attribution.totalPnL)}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
              Enter inputs and click Price CDS
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
