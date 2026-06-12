"use client";
import { useState } from "react";
import { Loader2, TrendingUp, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function RatingIntelligenceHub({ dealId }: { dealId?: string }) {
  const ratingMutation = trpc.ratingEsg.ratingAssess.useMutation();
  const compareMutation = trpc.ratingEsg.ratingCompare.useMutation();
  const esgMutation = trpc.ratingEsg.esgScore.useMutation();

  const runAll = () => {
    const deal = {
      stabilized_noi_usd: 12_000_000,
      a_tranche_usd: 112_500_000,
      b_tranche_usd: 10_500_000,
      a_coupon_pct: 6.5,
      b_coupon_pct: 11,
      total_project_cost_usd: 150_000_000,
      appraised_value_usd: 180_000_000,
      sponsor_equity_usd: 37_500_000,
      ebitda_usd: 10_200_000,
    };
    ratingMutation.mutate(deal);
    compareMutation.mutate(deal);
    esgMutation.mutate({ scores: {} });
  };

  const rating = (ratingMutation.data ?? {}) as any;
  const comparison = (compareMutation.data as any)?.comparison;
  const esg = (esgMutation.data ?? {}) as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">
          <TrendingUp size={17} /> Rating Intelligence Hub
        </div>
        <Button onClick={runAll} disabled={ratingMutation.isPending}
          className="rounded-xl border border-[#C4A048]/35 bg-[#C4A048]/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-[#EDE8DC] hover:bg-[#C4A048]/20">
          {ratingMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Run Full Analysis"}
        </Button>
      </div>

      {rating && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-amber-300/25 bg-black/35 p-5 text-center">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Indicative Rating</p>
            <p className="mt-2 font-mono text-4xl font-bold text-amber-100">{rating.indicative_rating}</p>
            <p className="mt-1 font-mono text-sm text-slate-400">Maxwell Engine</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/25 bg-black/35 p-5 text-center">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Deal Score</p>
            <p className="mt-2 font-mono text-4xl font-bold text-emerald-200">{rating.deal_score}/100</p>
            <p className="mt-1 font-mono text-sm text-slate-400">Grade: {rating.deal_score_grade}</p>
          </div>
          <div className="rounded-2xl border border-[#C4A048]/25 bg-black/35 p-5 text-center">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">ESG Grade</p>
            <p className="mt-2 font-mono text-4xl font-bold text-[#E8C87A]">{esg?.esg_grade ?? "—"}</p>
            <p className="mt-1 font-mono text-sm text-slate-400">{esg?.composite_score ?? "—"}/100</p>
          </div>
        </div>
      )}

      {/* JPM Benchmark Comparison */}
      {comparison && (
        <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
          <h3 className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">
            <BarChart3 size={14} /> JPM Benchmark Comparison
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">
                  <th className="py-2 text-left">Grade</th>
                  <th className="py-2 text-center">DSCR</th>
                  <th className="py-2 text-center">LTV</th>
                  <th className="py-2 text-center">CF Leverage</th>
                  <th className="py-2 text-center">D/E Ratio</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(comparison).map(([grade, metrics]: [string, any]) => (
                  <tr key={grade} className="border-b border-white/5">
                    <td className="py-2 font-semibold text-amber-100">{grade}</td>
                    {["dscr", "ltv", "cf_leverage", "de_ratio"].map((m) => (
                      <td key={m} className="py-2 text-center">
                        <span className="flex items-center justify-center gap-1">
                          {metrics[m]?.pass ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
                          <span className={metrics[m]?.pass ? "text-emerald-200" : "text-red-200"}>
                            {metrics[m]?.actual?.toFixed?.(2) ?? metrics[m]?.actual}
                          </span>
                          <span className="text-slate-600">/ {metrics[m]?.required}</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 font-mono text-[0.56rem] text-slate-500">
            Current grade: <span className="text-amber-200">{(compareMutation.data as any)?.current_grade}</span>
          </p>
        </div>
      )}

      {/* AI Rationale */}
      {rating?.ai_rationale && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-400">AI Rating Rationale</h3>
          <p className="mt-2 font-mono text-sm leading-6 text-slate-300">{rating.ai_rationale}</p>
        </div>
      )}
    </div>
  );
}
