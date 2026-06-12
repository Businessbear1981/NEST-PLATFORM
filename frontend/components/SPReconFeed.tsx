import React from "react";
import { CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SPReconFeed({ dealId, summaryMode }: { dealId?: string; summaryMode?: boolean }) {
  const status = trpc.spRecon.reconStatus.useQuery({ dealId: dealId || "demo-deal" });
  const updates = trpc.spRecon.reconUpdates.useQuery({ dealId: dealId || "demo-deal" });
  const alerts = trpc.spRecon.flagAlerts.useQuery({ dealId: dealId || "demo-deal" });

  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">
          <CheckCircle2 size={14} /> S&P Recon
        </div>
        <p className="mt-2 font-mono text-sm text-[#7A9A82]">Reconciliation feed + alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">
        <CheckCircle2 size={17} /> S&P Recon Feed
      </div>

      {status.data && (
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="grid grid-cols-3 gap-3">
            <div><span className="text-[#7A9A82] text-[0.56rem]">Rating:</span> <span className="text-[#EDE8DC] font-bold">{status.data.sp_rating}</span></div>
            <div><span className="text-[#7A9A82] text-[0.56rem]">Outlook:</span> <span className="text-[#EDE8DC] font-bold">{status.data.outlook}</span></div>
            <div><span className="text-[#7A9A82] text-[0.56rem]">Status:</span> <span className="text-emerald-100 font-bold">Compliant</span></div>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#7A9A82] mb-2">Recent Updates</h3>
        <div className="space-y-2">
          {updates.data?.updates?.map((u: any, i: number) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.56rem] text-[#7A9A82]">{new Date(u.date).toLocaleDateString()}</span>
                <span className={`rounded-full px-2 py-0.5 font-mono text-[0.56rem] uppercase ${u.status === "pass" ? "border border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border border-red-300/30 bg-red-400/10 text-red-200"}`}>
                  {u.status}
                </span>
              </div>
              <p className="font-mono text-sm text-white mt-1">{u.event}</p>
            </div>
          ))}
        </div>
      </div>

      {alerts.data?.alerts?.length === 0 && (
        <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-4">
          <p className="font-mono text-sm text-emerald-200">✓ No alerts — all metrics within tolerance</p>
        </div>
      )}
    </div>
  );
}
