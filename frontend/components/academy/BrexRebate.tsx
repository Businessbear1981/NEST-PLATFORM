"use client";

import React from "react";

const BREX_CONFIG = {
  monthlySpend: 485_000,
  rebateRate: 0.015,
  categories: [
    { name: "Construction Vendor Payments",              spend: 220_000, rebatePct: 0.02  },
    { name: "Professional Services (Legal, Accounting)", spend: 85_000,  rebatePct: 0.015 },
    { name: "Insurance Premiums",                        spend: 65_000,  rebatePct: 0.015 },
    { name: "Technology & SaaS",                         spend: 45_000,  rebatePct: 0.02  },
    { name: "Travel & Meetings",                         spend: 40_000,  rebatePct: 0.01  },
    { name: "Office & Miscellaneous",                    spend: 30_000,  rebatePct: 0.01  },
  ],
};

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtUSD = (n: number) => "$" + fmt(n);

export default function BrexRebate() {
  const brexAnnualRebate = BREX_CONFIG.categories.reduce(
    (sum, c) => sum + c.spend * c.rebatePct * 12,
    0,
  );
  const brexThreeYear = brexAnnualRebate * 3;
  const sofrYield = brexAnnualRebate * 0.0515; // SOFR+15bp ≈ 5.15%

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif text-[#EDE8DC]">Brex Rebate Optimizer</h2>

      {/* Hero numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
          <div className="text-xs text-[#7A9A82] font-mono mb-2">MONTHLY SPEND</div>
          <div className="text-5xl text-[#C4A048] font-mono">${(BREX_CONFIG.monthlySpend / 1000).toFixed(0)}K</div>
        </div>
        <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
          <div className="text-xs text-[#7A9A82] font-mono mb-2">ANNUAL REBATE</div>
          <div className="text-5xl text-[#C4A048] font-mono">{fmtUSD(brexAnnualRebate)}</div>
        </div>
        <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
          <div className="text-xs text-[#7A9A82] font-mono mb-2">3-YEAR REBATE VALUE</div>
          <div className="text-5xl text-[#C4A048] font-mono">{fmtUSD(brexThreeYear)}</div>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E4A2E]">
          <h3 className="font-serif text-lg text-[#C4A048]">Category Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-[#1E4A2E]">
                {["Category", "Monthly Spend", "Rebate Rate", "Monthly Rebate", "Annual Rebate"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[#7A9A82]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BREX_CONFIG.categories.map((cat, i) => (
                <tr key={i} className="border-b border-[#1E4A2E]/50 hover:bg-[#1E4A2E]/20">
                  <td className="px-6 py-3 text-[#EDE8DC]">{cat.name}</td>
                  <td className="px-6 py-3 text-[#EDE8DC]">{fmtUSD(cat.spend)}</td>
                  <td className="px-6 py-3 text-[#EDE8DC]">{(cat.rebatePct * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3 text-[#C4A048]">{fmtUSD(cat.spend * cat.rebatePct)}</td>
                  <td className="px-6 py-3 text-[#C4A048]">{fmtUSD(cat.spend * cat.rebatePct * 12)}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="border-t-2 border-[#C4A048] bg-[#1E4A2E]">
                <td className="px-6 py-4 text-[#C4A048] font-semibold">TOTAL</td>
                <td className="px-6 py-4 text-[#C4A048]">{fmtUSD(BREX_CONFIG.monthlySpend)}</td>
                <td className="px-6 py-4 text-[#C4A048]">blended {(BREX_CONFIG.rebateRate * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-[#C4A048]">{fmtUSD(brexAnnualRebate / 12)}</td>
                <td className="px-6 py-4 text-[#C4A048] font-semibold">{fmtUSD(brexAnnualRebate)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Escrow strategy card */}
      <div className="bg-[#1E4A2E] rounded-2xl border border-[#2D6B3D] p-8">
        <h3 className="font-serif text-xl text-[#C4A048] mb-3">Escrow Strategy</h3>
        <p className="text-[#EDE8DC] font-mono text-sm leading-relaxed">
          Rebate auto-deposited to prefunded escrow. Earns{" "}
          <span className="text-[#C4A048]">SOFR + 15bp</span> ={" "}
          <span className="text-[#C4A048] text-lg">{fmtUSD(sofrYield)}</span>{" "}
          additional annual yield on rebate balance.
          3-year compounded escrow value:{" "}
          <span className="text-[#C4A048] text-xl">{fmtUSD(brexThreeYear + sofrYield * 3)}</span>.
        </p>
      </div>
    </div>
  );
}
