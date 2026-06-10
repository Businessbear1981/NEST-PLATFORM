import { useState } from "react";
import { Loader2, BarChart3, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function RMABenchmarkUI({ dealId, summaryMode }: { dealId?: string; summaryMode?: boolean }) {
  const [naics, setNaics] = useState("6232");
  const rmaMutation = trpc.ratingEsg.rmaBenchmark.useMutation();

  const comparison = (rmaMutation.data as any)?.comparison;

  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
          <BarChart3 size={14} /> RMA Benchmarks
        </div>
        <p className="mt-2 font-mono text-sm text-slate-400">Industry financial ratio comparison</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
          <BarChart3 size={17} /> RMA Industry Benchmarks
        </div>
        <div className="flex gap-2">
          <select value={naics} onChange={(e) => setNaics(e.target.value)} className="rounded-xl border border-emerald-300/20 bg-black/45 px-3 py-2 font-mono text-sm text-slate-100 outline-none">
            <option value="6232">Assisted Living</option>
            <option value="6231">Nursing Care</option>
            <option value="5311">Property Mgmt</option>
          </select>
          <Button onClick={() => rmaMutation.mutate({ naics })} disabled={rmaMutation.isPending}
            className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20">
            {rmaMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Compare"}
          </Button>
        </div>
      </div>

      {comparison && (
        <div className="grid gap-2">
          {Object.entries(comparison).map(([metric, data]: [string, any]) => (
            <div key={metric} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center gap-2">
                {data.status === "above" ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
                <span className="font-mono text-sm text-white">{metric.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-sm">
                <span className="text-slate-400">Bench: {data.benchmark}</span>
                <span className={data.status === "above" ? "text-emerald-200" : "text-red-200"}>Actual: {data.actual}</span>
                <span className={`font-semibold ${data.delta >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {data.delta >= 0 ? "+" : ""}{data.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
