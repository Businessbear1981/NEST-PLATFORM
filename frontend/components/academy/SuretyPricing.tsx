"use client";

import React, { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { priceSurety, type SuretyInputs } from "@/lib/engines/surety";
import { logLocal } from "@/lib/engines/feedback";

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtUSD = (n: number) => "$" + fmt(n);

const tierColor = (tier: string) => {
  if (tier === "self-collateralized") return "bg-[#C4A048] text-[#030A06]";
  if (tier === "hybrid") return "bg-amber-700 text-amber-100";
  return "bg-red-800 text-red-200";
};

export default function SuretyPricing() {
  const [suretyInputs, setSuretyInputs] = useState<SuretyInputs>({
    bondFace: 155_000_000,
    dscr: 1.62,
    ltv: 0.68,
    sponsorNetWorth: 180_000_000,
    projectType: "performance",
    aumTier: "15-40M",
    liquidityRatio: 0.22,
    yearsInBusiness: 12,
  });
  const [suretyResult, setSuretyResult] = useState<ReturnType<typeof priceSurety> | null>(null);

  const handlePriceBond = () => {
    const r = priceSurety(suretyInputs);
    setSuretyResult(r);
    logLocal({
      engine: "surety",
      inputs: suretyInputs as unknown as Record<string, unknown>,
      outputs: r as unknown as Record<string, unknown>,
    });
  };

  // Build radar data: normalize each dimension to 0-100
  const radarData = suretyResult
    ? [
        { dimension: "DSCR", score: Math.min(100, (suretyInputs.dscr / 2.5) * 100) },
        { dimension: "LTV", score: Math.max(0, 100 - (suretyInputs.ltv * 100 - 40) * 2) },
        { dimension: "Sponsor NW", score: Math.min(100, (suretyInputs.sponsorNetWorth / suretyInputs.bondFace / 2) * 100) },
        { dimension: "Tenure", score: Math.min(100, (suretyInputs.yearsInBusiness / 20) * 100) },
        { dimension: "Liquidity", score: Math.min(100, (suretyInputs.liquidityRatio / 3) * 100) },
      ]
    : [];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif text-[#EDE8DC]">Surety Bond Pricing Engine</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Inputs */}
        <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6 space-y-4">
          <h3 className="font-serif text-xl text-[#C4A048] mb-2">Bond Inputs</h3>

          {([
            ["Bond Face ($)", "bondFace"],
            ["DSCR", "dscr"],
            ["LTV", "ltv"],
            ["Sponsor Net Worth ($)", "sponsorNetWorth"],
            ["Liquidity Ratio", "liquidityRatio"],
            ["Years in Business", "yearsInBusiness"],
          ] as [string, keyof SuretyInputs][]).map(([label, key]) => (
            <div key={key as string}>
              <label className="block text-xs text-[#7A9A82] font-mono mb-1">{label}</label>
              <input
                type="number"
                value={(suretyInputs as unknown as Record<string, number | string>)[key as string] as number}
                onChange={(e) =>
                  setSuretyInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))
                }
                className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs text-[#7A9A82] font-mono mb-1">Project Type</label>
            <select
              value={suretyInputs.projectType}
              onChange={(e) => setSuretyInputs((prev) => ({ ...prev, projectType: e.target.value as SuretyInputs["projectType"] }))}
              className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
            >
              {(["construction", "performance", "payment", "maintenance"] as const).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#7A9A82] font-mono mb-1">AUM Tier</label>
            <select
              value={suretyInputs.aumTier}
              onChange={(e) => setSuretyInputs((prev) => ({ ...prev, aumTier: e.target.value as SuretyInputs["aumTier"] }))}
              className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
            >
              {(["0-15M", "15-40M", "40-80M", "80M+"] as const).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePriceBond}
            className="w-full mt-4 bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold py-3 rounded-xl"
          >
            Price Bond
          </button>
        </div>

        {/* Result */}
        <div className="lg:col-span-2">
          {suretyResult ? (
            <div className="space-y-4">
              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl text-[#EDE8DC]">Pricing Result</h3>
                  <span className={`font-mono text-sm px-3 py-1 rounded-full ${tierColor(suretyResult.tier ?? "")}`}>
                    {suretyResult.tier}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ["Annual Premium Rate", `${suretyResult.annualPremiumRate} bps`],
                    ["Annual Premium", fmtUSD(suretyResult.annualPremiumUSD)],
                    ["3-yr Total", fmtUSD(suretyResult.totalPremium3yr)],
                    ["Collateral Required", fmtUSD(suretyResult.collateralUSD)],
                    ["LC Required", suretyResult.lcRequired ? fmtUSD(suretyResult.lcSizingUSD) : "None"],
                    ["Risk Score", `${suretyResult.riskScore.toFixed(0)} / 100`],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#1E4A2E] rounded-xl p-4">
                      <div className="text-xs text-[#7A9A82] font-mono mb-1">{label}</div>
                      <div className="text-lg text-[#C4A048] font-mono">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar chart */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
                <h3 className="font-serif text-lg text-[#C4A048] mb-4">Risk Dimension Profile</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#1E4A2E" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#7A9A82", fontSize: 9 }} />
                    <Radar name="Score" dataKey="score" stroke="#C4A048" fill="#C4A048" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {suretyResult.notes?.length > 0 && (
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                  <h4 className="font-mono text-sm text-[#7A9A82] mb-3">ADJUSTMENTS APPLIED</h4>
                  <ul className="space-y-2">
                    {suretyResult.notes.map((note: string, i: number) => (
                      <li key={i} className="text-sm text-[#EDE8DC] font-mono flex gap-2">
                        <span className="text-[#C4A048]">›</span> {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
              Enter inputs and click Price Bond
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
