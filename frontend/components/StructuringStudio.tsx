"use client";
import { useState } from "react";
import { Loader2, Layers3, Calculator, BarChart3, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const inputClass = "rounded-xl border border-amber-300/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-amber-300/55 focus:ring-2 focus:ring-amber-300/10 font-mono";

function money(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

export default function StructuringStudio({ dealId, summaryMode }: { dealId?: string; summaryMode?: boolean }) {
  const [tpc, setTpc] = useState("150000000");
  const [aLtc, setALtc] = useState("75");
  const [bAddon, setBAddon] = useState("7");
  const [yrs, setYrs] = useState("10");
  const [aCoup, setACoup] = useState("6.5");
  const [bCoup, setBCoup] = useState("11");

  const [structureResult, setStructureResult] = useState<any>(null);
  const [stressResult, setStressResult] = useState<any>(null);
  const [ratingResult, setRatingResult] = useState<any>(null);

  const bondPricing = trpc.powerstrip.bondPricing.useMutation();
  const ratingAssess = trpc.ratingEsg.ratingAssess.useMutation();

  const runStructuring = () => {
    const tpcNum = Number(tpc);
    const aLtcNum = Number(aLtc);
    const bAddonNum = Number(bAddon);
    const aFace = tpcNum * aLtcNum / 100;
    const bFace = tpcNum * bAddonNum / 100;
    const cltv = aLtcNum + bAddonNum;
    const ds = aFace * Number(aCoup) / 100 + bFace * Number(bCoup) / 100;
    const io = ds * 1.5 / 12 * 18;
    const reserve = bFace * 0.25;
    const surety = aFace * 0.085;
    const fee = (aFace + bFace) * 0.015;
    const proceeds = aFace + bFace - io - reserve - surety - fee;

    setStructureResult({
      a_face_usd: aFace, b_face_usd: bFace,
      total_raise_usd: aFace + bFace, cltv_pct: cltv,
      project_proceeds_usd: proceeds,
      io_reserve_usd: io, maturity_reserve_usd: reserve,
      surety_premium_usd: surety, ae_fee_usd: fee,
      b_to_hft_usd: bFace * 0.357,
      annual_debt_service: ds,
    });

    // Run stress test
    const noi = tpcNum * 0.08; // assume 8% stabilized NOI yield
    const cases = {
      base: { rev: 0, cost: 0, desc: "All assumptions as modeled" },
      downside: { rev: -15, cost: 10, desc: "-15% revenue · +10% costs" },
      stress: { rev: -25, cost: 20, desc: "-25% revenue · +20% costs" },
      catastrophic: { rev: -40, cost: 30, desc: "-40% revenue — COVID/hurricane" },
    };
    const stressOut: Record<string, any> = {};
    for (const [name, c] of Object.entries(cases)) {
      const adjNoi = noi * (1 + c.rev / 100);
      const adjDs = ds * (1 + c.cost / 200);
      const dscr = adjDs > 0 ? adjNoi / adjDs : 0;
      stressOut[name] = {
        description: c.desc, dscr: Math.round(dscr * 1000) / 1000,
        status: dscr >= 1.5 ? "green" : dscr >= 1.2 ? "yellow" : dscr >= 1.0 ? "red" : "critical",
      };
    }
    setStressResult(stressOut);

    // Run rating assessment
    ratingAssess.mutate({
      stabilized_noi_usd: noi,
      a_tranche_usd: aFace,
      b_tranche_usd: bFace,
      a_coupon_pct: Number(aCoup),
      b_coupon_pct: Number(bCoup),
      total_project_cost_usd: tpcNum,
      appraised_value_usd: tpcNum * 1.2,
      sponsor_equity_usd: tpcNum * 0.25,
      ebitda_usd: noi * 0.85,
    }, {
      onSuccess: (data) => setRatingResult(data),
    });
  };

  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
          <Layers3 size={14} /> Bond Desk
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Status</p>
            <p className="font-mono text-sm font-semibold text-emerald-200">Ready to structure</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Engine</p>
            <p className="font-mono text-sm font-semibold text-white">CreditEngine + Architect</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
          <Layers3 size={17} /> Bond Desk — Structuring Studio
        </div>
        <p className="mt-1 text-sm text-slate-400">Dual-tranche sizing, stress testing, ratings, and cash waterfall — all powered by CreditEngine.</p>
      </div>

      {/* Input panel */}
      <div className="grid gap-4 rounded-2xl border border-amber-300/25 bg-black/35 p-5 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">Deal Parameters</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Total Project Cost</label>
              <input type="number" value={tpc} onChange={(e) => setTpc(e.target.value)} className={inputClass + " w-full"} />
            </div>
            <div>
              <label className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">A Tranche LTC %</label>
              <input type="number" value={aLtc} onChange={(e) => setALtc(e.target.value)} step="1" className={inputClass + " w-full"} />
            </div>
            <div>
              <label className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">B Addon %</label>
              <input type="number" value={bAddon} onChange={(e) => setBAddon(e.target.value)} step="1" className={inputClass + " w-full"} />
            </div>
            <div>
              <label className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Maturity (yrs)</label>
              <input type="number" value={yrs} onChange={(e) => setYrs(e.target.value)} className={inputClass + " w-full"} />
            </div>
            <div>
              <label className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">A Coupon %</label>
              <input type="number" value={aCoup} onChange={(e) => setACoup(e.target.value)} step="0.25" className={inputClass + " w-full"} />
            </div>
            <div>
              <label className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">B Coupon %</label>
              <input type="number" value={bCoup} onChange={(e) => setBCoup(e.target.value)} step="0.5" className={inputClass + " w-full"} />
            </div>
          </div>
        </div>
        <div className="flex items-end">
          <Button
            onClick={runStructuring}
            className="w-full rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-3 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.13)] hover:bg-amber-300/20"
          >
            <Calculator className="mr-2 h-4 w-4" /> Run Structuring Engine
          </Button>
        </div>
      </div>

      {/* Results */}
      {structureResult && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Capital Stack */}
          <div className="rounded-2xl border border-amber-300/25 bg-black/35 p-5">
            <h3 className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
              <BarChart3 size={14} /> Capital Stack
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Series A (Senior)", value: money(structureResult.a_face_usd), tone: "text-amber-100" },
                { label: "Series B (Sub)", value: money(structureResult.b_face_usd), tone: "text-cyan-100" },
                { label: "Total Raise", value: money(structureResult.total_raise_usd), tone: "text-white" },
                { label: "CLTV", value: `${structureResult.cltv_pct.toFixed(1)}%`, tone: structureResult.cltv_pct > 75 ? "text-red-300" : "text-emerald-200" },
                { label: "Net Proceeds", value: money(structureResult.project_proceeds_usd), tone: "text-emerald-200" },
                { label: "Debt Service", value: money(structureResult.annual_debt_service), tone: "text-amber-100" },
                { label: "Surety Premium", value: money(structureResult.surety_premium_usd), tone: "text-slate-300" },
                { label: "B → HFT Fund", value: money(structureResult.b_to_hft_usd), tone: "text-fuchsia-200" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">{m.label}</p>
                  <p className={`font-mono text-sm font-semibold ${m.tone}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stress Test */}
          <div className="rounded-2xl border border-amber-300/25 bg-black/35 p-5">
            <h3 className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
              <ShieldCheck size={14} /> Stress Test
            </h3>
            <div className="mt-4 space-y-2">
              {stressResult && Object.entries(stressResult).map(([name, data]: [string, any]) => {
                const colorMap: Record<string, string> = {
                  green: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
                  yellow: "border-amber-300/30 bg-amber-300/10 text-amber-200",
                  red: "border-red-400/30 bg-red-500/10 text-red-200",
                  critical: "border-red-500/40 bg-red-600/15 text-red-100",
                };
                const statusColor = colorMap[data.status] ?? "";
                return (
                  <div key={name} className={`flex items-center justify-between rounded-xl border p-3 ${statusColor}`}>
                    <div>
                      <p className="font-mono text-[0.62rem] font-semibold uppercase">{name}</p>
                      <p className="font-mono text-[0.56rem] text-slate-400">{data.description}</p>
                    </div>
                    <p className="font-mono text-lg font-semibold">{data.dscr.toFixed(2)}x</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Rating result */}
      {ratingResult && (
        <div className="rounded-2xl border border-cyan-300/25 bg-black/35 p-5">
          <h3 className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">
            <TrendingUp size={14} /> Rating Intelligence
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Indicative Rating</p>
              <p className="font-mono text-2xl font-bold text-amber-100">{ratingResult.indicative_rating}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Deal Score</p>
              <p className="font-mono text-2xl font-bold text-white">{ratingResult.deal_score}/100</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Grade</p>
              <p className="font-mono text-2xl font-bold text-emerald-200">{ratingResult.deal_score_grade}</p>
            </div>
          </div>
          {ratingResult.ai_rationale && (
            <p className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 font-mono text-sm leading-6 text-slate-300">
              {ratingResult.ai_rationale}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
