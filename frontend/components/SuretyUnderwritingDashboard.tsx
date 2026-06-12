"use client";
import { Loader2, ShieldCheck, Building2, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

function money(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export default function SuretyUnderwritingDashboard({ dealId }: { dealId?: string }) {
  const ratingMutation = trpc.ratingEsg.ratingAssess.useMutation();

  const runSurety = () => {
    ratingMutation.mutate({
      stabilized_noi_usd: 12_000_000,
      a_tranche_usd: 112_500_000,
      b_tranche_usd: 10_500_000,
      a_coupon_pct: 6.5,
      b_coupon_pct: 11,
      total_project_cost_usd: 150_000_000,
      appraised_value_usd: 180_000_000,
      sponsor_equity_usd: 37_500_000,
      ebitda_usd: 10_200_000,
    });
  };

  const data = (ratingMutation.data ?? {}) as any;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
          <ShieldCheck size={17} /> Surety Underwriting Dashboard
        </div>
        <Button onClick={runSurety} disabled={ratingMutation.isPending}
          className="rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-amber-100 hover:bg-amber-300/20">
          {ratingMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Run Assessment"}
        </Button>
      </div>

      {/* Hylant provider info */}
      <div className="rounded-2xl border border-amber-300/25 bg-black/35 p-5">
        <h3 className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">
          <Building2 size={14} className="text-amber-200" /> Primary Surety Provider
        </h3>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {[
            { label: "Provider", value: "Hylant Insurance" },
            { label: "Type", value: "Performance Surety" },
            { label: "Premium", value: "8.5%" },
            { label: "Rating", value: "A+" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">{m.label}</p>
              <p className="font-mono text-sm font-semibold text-white">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "DSCR", value: `${data.credit_metrics?.dscr ?? "—"}x`, tone: "text-emerald-200" },
              { label: "LTV", value: `${data.credit_metrics?.ltv_pct ?? "—"}%`, tone: data.credit_metrics?.ltv_pct > 75 ? "text-red-200" : "text-amber-100" },
              { label: "Rating", value: data.indicative_rating ?? "—", tone: "text-amber-100" },
              { label: "LGD (Surety)", value: `${data.credit_metrics?.lgd_with_surety_pct ?? "—"}%`, tone: "text-cyan-100" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">{m.label}</p>
                <p className={`font-mono text-xl font-bold ${m.tone}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-emerald-300/25 bg-black/35 p-5">
            <h3 className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-200">
              <FileCheck2 size={14} /> LGD Analysis (Loss Given Default)
            </h3>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[
                { label: "Bare", value: `${data.credit_metrics?.lgd_bare_pct}%` },
                { label: "With Surety", value: `${data.credit_metrics?.lgd_with_surety_pct}%` },
                { label: "Dual Wrap", value: `${data.credit_metrics?.lgd_dual_wrap_pct}%` },
                { label: "Bank Conduit", value: `${data.credit_metrics?.lgd_bank_conduit_pct}%` },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-center">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">{m.label}</p>
                  <p className="font-mono text-lg font-semibold text-emerald-100">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
