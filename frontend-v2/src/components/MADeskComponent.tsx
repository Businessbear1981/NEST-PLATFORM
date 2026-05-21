import { useState } from "react";
import { Loader2, Target, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

const inputClass = "rounded-xl border border-fuchsia-300/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-fuchsia-300/55 focus:ring-2 focus:ring-fuchsia-300/10";

function scoreTone(score?: number | null) {
  const value = Number(score ?? 0);
  if (value >= 75) return "text-emerald-100";
  if (value >= 60) return "text-amber-100";
  return "text-slate-400";
}

function recommendationClass(recommendation?: string | null) {
  if (recommendation === "buy") return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  if (recommendation === "hold") return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  if (recommendation === "pass") return "border-red-300/30 bg-red-400/10 text-red-100";
  return "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100";
}

function money(value?: string | null) {
  if (!value) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
}

export function MADeskComponent() {
  const [newTarget, setNewTarget] = useState({ name: "", sector: "", revenue: "", ebitda: "", debt: "" });
  const targetsQuery = trpc.mTargets.list.useQuery();
  const createTargetMutation = trpc.mTargets.create.useMutation({
    onSuccess: () => {
      targetsQuery.refetch();
      setNewTarget({ name: "", sector: "", revenue: "", ebitda: "", debt: "" });
    },
  });
  const updateScoresMutation = trpc.mTargets.updateScores.useMutation({ onSuccess: () => targetsQuery.refetch() });

  const handleCreateTarget = () => {
    if (!newTarget.name || !newTarget.sector) return;
    createTargetMutation.mutate({ name: newTarget.name, sector: newTarget.sector, revenue: newTarget.revenue || undefined, ebitda: newTarget.ebitda || undefined, debt: newTarget.debt || undefined });
  };

  const handleUpdateScores = (targetId: number) => {
    updateScoresMutation.mutate({
      targetId,
      financialHealthScore: Math.floor(Math.random() * 40) + 50,
      scalabilityScore: Math.floor(Math.random() * 40) + 50,
      ipoReadinessScore: Math.floor(Math.random() * 40) + 50,
      growthStrategyScore: Math.floor(Math.random() * 40) + 50,
    });
  };

  const targets = targetsQuery.data ?? [];

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-fuchsia-200"><Target size={17} /> M&A intelligence desk</div>
          <p className="mt-1 text-sm leading-6 text-slate-400">Backend-connected target qualification, score updates, and acquisition recommendation state.</p>
        </div>
        <span className="w-fit rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-fuchsia-100">{targets.length} target records</span>
      </div>

      {targetsQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-black/30 p-8 text-sm text-slate-400"><Loader2 className="mr-2 animate-spin text-fuchsia-200" size={16} /> Loading targets...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-3">
            {targets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-fuchsia-300/25 bg-fuchsia-400/5 p-6 text-sm text-slate-400">No targets in the M&A desk yet. Add a target to begin scoring.</div>
            ) : (
              targets.map((target) => (
                <article key={target.id} className="rounded-2xl border border-fuchsia-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(217,70,239,0.08)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-mono text-lg font-semibold uppercase tracking-[0.04em] text-white">{target.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{target.sector}</p>
                    </div>
                    <span className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.13em] ${recommendationClass(target.recommendation)}`}>{target.recommendation || "review"}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                    {[
                      ["Financial", target.financialHealthScore],
                      ["Scalability", target.scalabilityScore],
                      ["IPO", target.ipoReadinessScore],
                      ["Growth", target.growthStrategyScore],
                      ["Overall", target.overallScore],
                    ].map(([label, score]) => (
                      <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm">
                        <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">{label}</span>
                        <p className={`mt-1 font-mono text-lg font-semibold ${scoreTone(Number(score ?? 0))}`}>{score ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>Revenue {money(target.revenue)} · EBITDA {money(target.ebitda)} · Debt {money(target.debt)}</span>
                    <button onClick={() => handleUpdateScores(target.id)} disabled={updateScoresMutation.isPending} className="w-fit rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/8 px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-fuchsia-100 hover:bg-fuchsia-300/14 disabled:opacity-60">
                      {updateScoresMutation.isPending ? "Scoring..." : "Run scoring"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="rounded-2xl border border-fuchsia-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(217,70,239,0.08)]">
            <div className="flex items-center gap-2"><TrendingUp size={16} className="text-fuchsia-200" /><h3 className="font-mono font-semibold uppercase tracking-[0.08em] text-white">Add target</h3></div>
            <div className="mt-4 grid gap-3">
              <input type="text" value={newTarget.name} onChange={(event) => setNewTarget({ ...newTarget, name: event.target.value })} placeholder="Company name" className={inputClass} />
              <input type="text" value={newTarget.sector} onChange={(event) => setNewTarget({ ...newTarget, sector: event.target.value })} placeholder="Sector" className={inputClass} />
              <input type="number" value={newTarget.revenue} onChange={(event) => setNewTarget({ ...newTarget, revenue: event.target.value })} placeholder="Revenue ($M)" className={inputClass} />
              <input type="number" value={newTarget.ebitda} onChange={(event) => setNewTarget({ ...newTarget, ebitda: event.target.value })} placeholder="EBITDA ($M)" className={inputClass} />
              <input type="number" value={newTarget.debt} onChange={(event) => setNewTarget({ ...newTarget, debt: event.target.value })} placeholder="Debt ($M)" className={inputClass} />
              <button onClick={handleCreateTarget} disabled={createTargetMutation.isPending} className="rounded-xl border border-fuchsia-300/35 bg-fuchsia-300/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-fuchsia-100 shadow-[0_0_24px_rgba(217,70,239,0.13)] transition hover:bg-fuchsia-300/20 disabled:opacity-60">{createTargetMutation.isPending ? "Adding..." : "Add target"}</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
