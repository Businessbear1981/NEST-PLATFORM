import { useState } from "react";
import { CircleDollarSign, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const inputClass = "rounded-xl border border-emerald-300/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-300/55 focus:ring-2 focus:ring-emerald-300/10";

function formatMoney(value: string | number) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "$0";
  return `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function statusClass(status: string) {
  if (status === "approved") return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  if (status === "funded") return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
  if (status === "rejected") return "border-red-300/30 bg-red-400/10 text-red-100";
  return "border-amber-300/30 bg-amber-400/10 text-amber-100";
}

export function DrawsManagement({ dealId }: { dealId: number }) {
  const [newDraw, setNewDraw] = useState({ drawNumber: 1, amount: "", description: "" });
  const drawsQuery = trpc.draws.listByDeal.useQuery({ dealId });
  const createDrawMutation = trpc.draws.create.useMutation({
    onSuccess: () => {
      drawsQuery.refetch();
      setNewDraw({ drawNumber: (newDraw.drawNumber || 0) + 1, amount: "", description: "" });
    },
  });
  const approveMutation = trpc.draws.approve.useMutation({ onSuccess: () => drawsQuery.refetch() });

  const handleCreateDraw = () => {
    if (!newDraw.amount) return;
    createDrawMutation.mutate({ dealId, drawNumber: newDraw.drawNumber || 1, amount: newDraw.amount, description: newDraw.description || undefined });
  };

  const draws = drawsQuery.data ?? [];

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-emerald-200"><CircleDollarSign size={17} /> Funding workflow</div>
          <p className="mt-1 text-sm leading-6 text-slate-400">Backend-connected construction draw requests, approval state, and funding status.</p>
        </div>
        <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-emerald-100">{draws.length} draw records</span>
      </div>

      {drawsQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-emerald-300/20 bg-black/30 p-8 text-sm text-slate-400"><Loader2 className="mr-2 animate-spin text-emerald-200" size={16} /> Loading draws...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="overflow-hidden rounded-2xl border border-emerald-300/20 bg-black/30 shadow-[0_0_32px_rgba(52,211,153,0.08)]">
            {draws.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No draw requests yet. Request a draw to activate the approval rail.</div>
            ) : (
              <div className="divide-y divide-white/10">
                {draws.map((draw) => (
                  <article key={draw.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_8rem_7rem] sm:items-center">
                    <div>
                      <h3 className="font-mono font-semibold uppercase tracking-[0.05em] text-white">Draw #{draw.drawNumber}</h3>
                      <p className="mt-1 text-sm text-slate-400">{draw.description || "No description supplied"}</p>
                      {draw.approvalNotes && <p className="mt-1 text-xs text-slate-600">Notes: {draw.approvalNotes}</p>}
                    </div>
                    <span className="font-mono text-sm font-semibold text-emerald-100">{formatMoney(draw.amount)}</span>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <span className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.13em] ${statusClass(draw.status)}`}>{draw.status}</span>
                      {draw.status === "requested" && (
                        <button onClick={() => approveMutation.mutate({ drawId: draw.id, approvalNotes: "Approved by operations workbench" })} disabled={approveMutation.isPending} className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-emerald-100 hover:text-amber-100 disabled:opacity-60">
                          {approveMutation.isPending ? "Approving..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-emerald-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(52,211,153,0.08)]">
            <h3 className="font-mono font-semibold uppercase tracking-[0.08em] text-white">Request draw</h3>
            <div className="mt-4 grid gap-3">
              <input type="number" value={newDraw.drawNumber} onChange={(event) => setNewDraw({ ...newDraw, drawNumber: Number.parseInt(event.target.value, 10) || 1 })} className={inputClass} />
              <input type="number" value={newDraw.amount} onChange={(event) => setNewDraw({ ...newDraw, amount: event.target.value })} placeholder="Amount" className={inputClass} />
              <textarea value={newDraw.description} onChange={(event) => setNewDraw({ ...newDraw, description: event.target.value })} placeholder="Draw purpose or invoice detail" rows={3} className={inputClass} />
              <button onClick={handleCreateDraw} disabled={createDrawMutation.isPending} className="rounded-xl border border-emerald-300/35 bg-emerald-300/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.13)] transition hover:bg-emerald-300/20 disabled:opacity-60">{createDrawMutation.isPending ? "Requesting..." : "Request draw"}</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
