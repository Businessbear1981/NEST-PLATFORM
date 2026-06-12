"use client";
import { useState } from "react";
import { Loader2, CloudRain, Flame, Wind, Thermometer, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const riskIcons: Record<string, any> = {
  flood: CloudRain, hurricane: Wind, wildfire: Flame,
  earthquake: AlertTriangle, heat_stress: Thermometer,
};

function riskColor(val: number) {
  if (val >= 70) return "text-red-300 border-red-400/30 bg-red-500/10";
  if (val >= 40) return "text-amber-200 border-amber-300/30 bg-amber-300/10";
  return "text-emerald-200 border-emerald-300/30 bg-emerald-400/10";
}

export default function ClimateResilienceDashboard({ dealId, summaryMode }: { dealId?: string; summaryMode?: boolean }) {
  const [state, setState] = useState("FL");
  const climateAssess = trpc.ratingEsg.climateAssess.useMutation();

  const data = (climateAssess.data ?? {}) as any;
  const transition = {} as any;
  const combined = {} as any;

  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">
          <CloudRain size={14} /> Climate Resilience
        </div>
        <p className="mt-2 font-mono text-sm text-slate-400">Physical + transition risk scoring</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">
          <CloudRain size={17} /> Climate Resilience Assessment
        </div>
        <div className="flex gap-2">
          <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-xl border border-[#C4A048]/20 bg-black/45 px-3 py-2 font-mono text-sm text-slate-100 outline-none">
            {["FL", "CA", "TX", "AZ", "WA"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button onClick={() => transitionRisk.mutate({ dealId: dealId || "demo-deal", sector: "healthcare" })} disabled={transitionRisk.isPending || physicalRisk.isLoading}
            className="rounded-xl border border-[#C4A048]/35 bg-[#C4A048]/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-[#EDE8DC] hover:bg-[#C4A048]/20">
            {transitionRisk.isPending || physicalRisk.isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Assess"}
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Physical Risk Score</p>
              <p className={`font-mono text-2xl font-bold ${data?.overall_physical_score >= 70 ? "text-red-200" : data?.overall_physical_score >= 40 ? "text-amber-200" : "text-emerald-200"}`}>
                {data?.overall_physical_score || 0}/100
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Transition Risk</p>
              <p className="font-mono text-2xl font-bold text-amber-100">{transition?.overall_transition_score || combined?.combined_climate_score || 0}/100</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Combined Score</p>
              <p className={`font-mono text-lg font-bold ${combined?.combined_climate_score >= 70 ? "text-emerald-200" : "text-amber-200"}`}>{combined?.combined_climate_score || 0}/100</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className={`rounded-xl border p-3 text-center ${riskColor(data?.flood_risk_pct || 0)}`}>
              <CloudRain size={18} className="mx-auto" />
              <p className="mt-1 font-mono text-[0.56rem] uppercase">Flood</p>
              <p className="font-mono text-lg font-bold">{data?.flood_risk_pct || 0}%</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${riskColor(data?.wildfire_risk_pct || 0)}`}>
              <Flame size={18} className="mx-auto" />
              <p className="mt-1 font-mono text-[0.56rem] uppercase">Wildfire</p>
              <p className="font-mono text-lg font-bold">{data?.wildfire_risk_pct || 0}%</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${riskColor(data?.hurricane_risk_pct || 0)}`}>
              <Wind size={18} className="mx-auto" />
              <p className="mt-1 font-mono text-[0.56rem] uppercase">Hurricane</p>
              <p className="font-mono text-lg font-bold">{data?.hurricane_risk_pct || 0}%</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${riskColor(data?.drought_risk_pct || 0)}`}>
              <Thermometer size={18} className="mx-auto" />
              <p className="mt-1 font-mono text-[0.56rem] uppercase">Drought</p>
              <p className="font-mono text-lg font-bold">{data?.drought_risk_pct || 0}%</p>
            </div>
          </div>

          {transition?.mitigation_actions?.length > 0 && (
            <div className="space-y-1">
              <h4 className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-400">Mitigation Actions</h4>
              {transition.mitigation_actions.map((m: string, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                  <span className="font-mono text-sm text-white">{m}</span>
                  <span className="rounded-full border border-[#C4A048]/30 bg-[#C4A048]/10 px-2 py-0.5 font-mono text-[0.56rem] uppercase text-[#E8C87A]">Action</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
