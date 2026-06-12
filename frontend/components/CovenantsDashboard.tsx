"use client";
import { useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

const inputClass = "rounded-xl border border-red-300/20 bg-black/45 px-3 py-2 text-sm text-[#EDE8DC] outline-none placeholder:text-[#7A9A82] focus:border-red-300/55 focus:ring-2 focus:ring-red-300/10";

function statusClass(status: string) {
  if (status === "compliant") return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  if (status === "watch") return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  return "border-red-300/30 bg-red-400/10 text-red-100";
}

function numberLabel(value?: string | null) {
  if (!value) return "—";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : "—";
}

export function CovenantsDashboard({ dealId }: { dealId: number }) {
  const [newCovenant, setNewCovenant] = useState({ type: "DSCR", threshold: "", current: "" });
  const covenantsQuery = trpc.covenants.listByDeal.useQuery({ dealId });
  const createCovenantMutation = trpc.covenants.create.useMutation({
    onSuccess: () => {
      covenantsQuery.refetch();
      setNewCovenant({ type: "DSCR", threshold: "", current: "" });
    },
  });
  const updateCovenantMutation = trpc.covenants.update.useMutation({ onSuccess: () => covenantsQuery.refetch() });

  const handleCreateCovenant = () => {
    if (!newCovenant.threshold) return;
    createCovenantMutation.mutate({ dealId, type: newCovenant.type, threshold: newCovenant.threshold, current: newCovenant.current || undefined });
  };

  const covenants = covenantsQuery.data ?? [];

  return (
    <div className="space-y-5 text-[#EDE8DC]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-red-200"><ShieldCheck size={17} /> Compliance monitoring</div>
          <p className="mt-1 text-sm leading-6 text-[#7A9A82]">Backend-connected covenant thresholds, current values, and breach/watch states.</p>
        </div>
        <span className="w-fit rounded-full border border-red-300/30 bg-red-400/10 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-red-100">{covenants.length} covenant records</span>
      </div>

      {covenantsQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-red-300/20 bg-black/30 p-8 text-sm text-[#7A9A82]"><Loader2 className="mr-2 animate-spin text-red-200" size={16} /> Loading covenants...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-3 md:grid-cols-2">
            {covenants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-red-300/25 bg-red-400/5 p-6 text-sm text-[#7A9A82] md:col-span-2">No covenants yet. Add DSCR, occupancy, LTV, or leverage tests to activate monitoring.</div>
            ) : (
              covenants.map((covenant) => (
                <article key={covenant.id} className="rounded-2xl border border-red-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(248,113,113,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {covenant.status === "breach" && <AlertTriangle size={16} className="text-red-300" />}
                      <h3 className="font-mono font-semibold uppercase tracking-[0.06em] text-white">{covenant.type}</h3>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.13em] ${statusClass(covenant.status)}`}>{covenant.status}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#7A9A82]">Threshold</span><p className="font-mono font-semibold text-amber-100">{numberLabel(covenant.threshold)}</p></div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#7A9A82]">Current</span><p className="font-mono font-semibold text-[#EDE8DC]">{numberLabel(covenant.current)}</p></div>
                  </div>
                  <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#7A9A82]">Last checked: {covenant.lastChecked ? new Date(covenant.lastChecked).toLocaleDateString() : "Pending"}</p>
                  <button
                    onClick={() => {
                      const current = prompt("Enter current value:");
                      if (current) updateCovenantMutation.mutate({ covenantId: covenant.id, current });
                    }}
                    disabled={updateCovenantMutation.isPending}
                    className="mt-3 w-full rounded-xl border border-red-300/25 bg-red-300/8 px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-red-100 hover:bg-red-300/14 disabled:opacity-60"
                  >
                    {updateCovenantMutation.isPending ? "Updating..." : "Update value"}
                  </button>
                </article>
              ))
            )}
          </div>

          <aside className="rounded-2xl border border-red-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(248,113,113,0.08)]">
            <h3 className="font-mono font-semibold uppercase tracking-[0.08em] text-white">Add covenant</h3>
            <div className="mt-4 grid gap-3">
              <select value={newCovenant.type} onChange={(event) => setNewCovenant({ ...newCovenant, type: event.target.value })} className={inputClass}><option value="DSCR">DSCR</option><option value="Occupancy">Occupancy</option><option value="Leverage">Leverage</option><option value="LTV">LTV</option><option value="LTC">LTC</option><option value="Interest Coverage">Interest Coverage</option></select>
              <input type="number" value={newCovenant.threshold} onChange={(event) => setNewCovenant({ ...newCovenant, threshold: event.target.value })} placeholder="Threshold" step="0.01" className={inputClass} />
              <input type="number" value={newCovenant.current} onChange={(event) => setNewCovenant({ ...newCovenant, current: event.target.value })} placeholder="Current value" step="0.01" className={inputClass} />
              <button onClick={handleCreateCovenant} disabled={createCovenantMutation.isPending} className="rounded-xl border border-red-300/35 bg-red-300/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.13)] transition hover:bg-red-300/20 disabled:opacity-60">{createCovenantMutation.isPending ? "Adding..." : "Add covenant"}</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
