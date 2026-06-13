"use client";

import React from "react";

const HBO2_ALTERNATIVE_DATA = {
  newsScore: 72,
  emmaComps: [
    { cusip: "456789AB1", name: "Cypress Cove CCRC",  yield: 5.82, rating: "BBB",  dscr: 1.72 },
    { cusip: "234567CD3", name: "Magnolia Gardens",   yield: 6.15, rating: "BBB-", dscr: 1.58 },
    { cusip: "789012EF5", name: "Madera Ridge",       yield: 5.45, rating: "A-",   dscr: 2.08 },
  ],
  edgarFlags: ["Going concern note removed Q3 2024", "Refinancing completed Oct 2024"],
  linkedinGrowth: "+18% headcount YoY",
  glassdoorScore: 4.1,
  shadowRating: "BBB",
  ratingJustification:
    "DSCR 1.62 aligns with BBB-tier at 70th pct of CCRC comps. EMMA comps price 5.82-6.15% for BBB. Positive: sponsor NW $180M covers 116% of bond face, 12yr operational track record. Negative: LTV 68% at BBB+ boundary, occupancy 79% vs 88% stabilized threshold. NEST recommendation: target BBB with Hylant surety LC to bridge to BBB+ at stabilization.",
};

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: "bg-emerald-800 text-emerald-200",
    "A-": "bg-emerald-800 text-emerald-200",
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

export default function ShadowRating() {
  return (
    <div className="space-y-8">
      {/* Deal header */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif text-[#EDE8DC]">HBO2 — CCRC Bond Deal</h2>
          <div className="text-[#7A9A82] font-mono text-sm mt-1">Alternative Data Shadow Rating Analysis</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs font-mono text-[#7A9A82]">BOND FACE</div>
          <div className="text-4xl font-mono text-[#C4A048]">$155M</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Alt data */}
        <div className="space-y-4">
          {/* News score */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
            <h3 className="font-mono text-sm text-[#7A9A82] mb-4">ALTERNATIVE DATA SIGNALS</h3>
            <div className="mb-4">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#EDE8DC]">News Sentiment Score</span>
                <span className="text-[#C4A048]">{HBO2_ALTERNATIVE_DATA.newsScore} / 100</span>
              </div>
              <div className="w-full bg-[#1E4A2E] h-2 rounded-full">
                <div className="bg-[#C4A048] h-2 rounded-full" style={{ width: `${HBO2_ALTERNATIVE_DATA.newsScore}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#1E4A2E] rounded-xl p-3">
                <div className="text-xs text-[#7A9A82] font-mono mb-1">LinkedIn Growth</div>
                <div className="text-sm text-[#C4A048] font-mono">{HBO2_ALTERNATIVE_DATA.linkedinGrowth}</div>
              </div>
              <div className="bg-[#1E4A2E] rounded-xl p-3">
                <div className="text-xs text-[#7A9A82] font-mono mb-1">Glassdoor</div>
                <div className="text-sm text-[#C4A048] font-mono">{HBO2_ALTERNATIVE_DATA.glassdoorScore} / 5.0</div>
              </div>
            </div>
          </div>

          {/* EDGAR flags */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
            <h3 className="font-mono text-sm text-[#7A9A82] mb-3">EDGAR FLAGS</h3>
            <ul className="space-y-2">
              {HBO2_ALTERNATIVE_DATA.edgarFlags.map((flag, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-mono text-[#EDE8DC]">
                  <span className="text-emerald-400">✓</span> {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: EMMA comps + shadow rating */}
        <div className="space-y-4">
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E4A2E]">
              <h3 className="font-serif text-lg text-[#C4A048]">EMMA Comparable Bonds</h3>
            </div>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E4A2E]">
                  {["Name", "Rating", "Yield", "DSCR"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#7A9A82]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HBO2_ALTERNATIVE_DATA.emmaComps.map((comp, i) => (
                  <tr key={i} className="border-b border-[#1E4A2E]/50 hover:bg-[#1E4A2E]/30">
                    <td className="px-4 py-3 text-[#EDE8DC]">{comp.name}</td>
                    <td className="px-4 py-3"><GradeBadge grade={comp.rating} /></td>
                    <td className="px-4 py-3 text-[#C4A048]">{comp.yield.toFixed(2)}%</td>
                    <td className="px-4 py-3">{comp.dscr.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shadow rating badge */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <div className="text-xs font-mono text-[#7A9A82] mb-1">NEST SHADOW RATING</div>
                <div className="text-5xl font-mono text-[#C4A048]">{HBO2_ALTERNATIVE_DATA.shadowRating}</div>
              </div>
              <GradeBadge grade={HBO2_ALTERNATIVE_DATA.shadowRating} />
            </div>
          </div>
        </div>
      </div>

      {/* NEST Recommendation */}
      <div className="bg-[#1E4A2E] rounded-2xl border border-[#2D6B3D] p-8">
        <h3 className="font-serif text-xl text-[#C4A048] mb-4">NEST Recommendation</h3>
        <p className="font-serif text-[#EDE8DC] italic leading-relaxed">
          {HBO2_ALTERNATIVE_DATA.ratingJustification}
        </p>
      </div>
    </div>
  );
}
