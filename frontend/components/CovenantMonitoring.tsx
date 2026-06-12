"use client";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CovenantMonitoring({ dealId, summaryMode }: { dealId?: string; summaryMode?: boolean }) {
  const covenantMutation = trpc.ratingEsg.covenantMonitor.useMutation();
  const data = (covenantMutation.data ?? {}) as any;

  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">
          <CheckCircle2 size={14} /> Covenant Monitoring
        </div>
        <p className="mt-2 font-mono text-sm text-[#7A9A82]">Real-time covenant compliance tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">
          <CheckCircle2 size={17} /> Covenant Monitoring
        </div>
        <button
          onClick={() => covenantMutation.mutate({ dealId: dealId || "demo-deal", covenants: [] })}
          className="rounded-lg border border-[#C4A048]/30 bg-[#C4A048]/10 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-wider text-[#E8C87A] hover:bg-[#C4A048]/20"
        >
          {covenantMutation.isPending ? "Running..." : "Run Covenant Sweep"}
        </button>
      </div>

      {data?.covenants?.map((c: any) => (
        <div key={c.id || c.covenant} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm font-bold text-white">{c.covenant || c.metric}</span>
            <span className={`rounded-full px-2 py-0.5 font-mono text-[0.56rem] uppercase border ${c.status === "compliant" || c.in_compliance ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border-red-300/30 bg-red-400/10 text-red-200"}`}>
              {c.status || (c.in_compliance ? "compliant" : "breach")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[0.56rem] text-[#7A9A82]">
            <div>Threshold: {c.threshold ?? c.threshold_value}</div>
            <div>Current: {c.current ?? c.current_value}</div>
            <div className="text-[#E8C87A]">Margin: {c.margin_pct ?? "—"}%</div>
          </div>
        </div>
      ))}

      {!data?.covenants && !covenantMutation.isPending && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <p className="font-mono text-sm text-[#7A9A82]">Click "Run Covenant Sweep" to analyze deal covenants</p>
        </div>
      )}

      {data?.overall_status === "compliant" && (
        <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-4">
          <p className="font-mono text-sm text-emerald-200">All covenants compliant</p>
        </div>
      )}
    </div>
  );
}
