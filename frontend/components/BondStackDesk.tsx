"use client";
import { useState } from "react";
import { Loader2, Landmark, Activity, TrendingDown, TrendingUp, Radio } from "lucide-react";
import { trpc } from "@/lib/trpc";

const inputClass = "rounded-xl border border-amber-300/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-amber-300/55 focus:ring-2 focus:ring-amber-300/10";
const buttonClass = "rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.13)] transition hover:bg-amber-300/20 disabled:opacity-60";

function money(value: string | number) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "$0";
  return `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
}

function percent(value: string | number) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "—";
  return numeric <= 1 ? `${(numeric * 100).toFixed(1)}%` : `${numeric.toFixed(1)}%`;
}

export function BondStackDesk({ dealId }: { dealId: number }) {
  const [selectedDeal] = useState(dealId);
  const [newBond, setNewBond] = useState({
    tranche: "A" as "A" | "B" | "C",
    size: "",
    ltc: "",
    ltv: "",
    dscr: "",
    spread: "",
  });

  const bondsQuery = trpc.bonds.listByDeal.useQuery({ dealId: selectedDeal });
  const createBondMutation = trpc.bonds.create.useMutation({
    onSuccess: () => {
      bondsQuery.refetch();
      setNewBond({ tranche: "A", size: "", ltc: "", ltv: "", dscr: "", spread: "" });
    },
  });

  // ── Power Strip: live market rates (auto-refresh every 60s) ───
  const marketRatesQuery = trpc.powerstrip.marketRates.useQuery(undefined, {
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // ── Power Strip: refi signal check ────────────────────────────
  const refiMutation = trpc.powerstrip.refiSignals.useMutation();
  const bonds = bondsQuery.data ?? [];

  const checkRefiSignal = () => {
    const totalFace = bonds.reduce((sum: number, b: any) => sum + Number(b.size || 0), 0);
    if (totalFace > 0) {
      refiMutation.mutate({
        bond_face_usd: totalFace * 1_000_000,
        original_rate_pct: 7.0,
        dealId: selectedDeal,
      });
    }
  };

  const handleCreateBond = () => {
    if (!newBond.size || !newBond.ltc || !newBond.ltv || !newBond.dscr || !newBond.spread) return;
    createBondMutation.mutate({ dealId: selectedDeal, ...newBond });
  };

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
            <Landmark size={17} /> Capital stack desk
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-400">Backend-connected tranches, LTC/LTV sizing, DSCR, and spread inputs.</p>
        </div>
        <span className="w-fit rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-amber-100">{bonds.length} tranche records</span>
      </div>

      {bondsQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-amber-300/20 bg-black/30 p-8 text-sm text-slate-400"><Loader2 className="mr-2 animate-spin text-amber-200" size={16} /> Loading bond stack...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-3 md:grid-cols-2">
            {bonds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-300/25 bg-amber-300/5 p-6 text-sm text-slate-400 md:col-span-2">No tranche records yet. Add an A or B tranche to begin sizing this deal.</div>
            ) : (
              bonds.map((bond) => (
                <article key={bond.id} className="rounded-2xl border border-amber-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(251,191,36,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-amber-200">Tranche {bond.tranche}</p>
                      <h3 className="mt-1 font-mono text-xl font-semibold tracking-[-0.03em] text-white">{money(bond.size)}</h3>
                    </div>
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-cyan-100">{bond.status}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2"><span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">LTC</span><p className="font-mono font-semibold text-amber-100">{percent(bond.ltc)}</p></div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2"><span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">LTV</span><p className="font-mono font-semibold text-amber-100">{percent(bond.ltv)}</p></div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2"><span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">DSCR</span><p className="font-mono font-semibold text-emerald-100">{Number(bond.dscr).toFixed(2)}x</p></div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2"><span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Spread</span><p className="font-mono font-semibold text-cyan-100">+{Number(bond.spread).toFixed(0)}</p></div>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="rounded-2xl border border-amber-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(251,191,36,0.08)]">
            <h3 className="font-mono font-semibold uppercase tracking-[0.08em] text-white">Add tranche</h3>
            <div className="mt-4 grid gap-3">
              <select value={newBond.tranche} onChange={(event) => setNewBond({ ...newBond, tranche: event.target.value as "A" | "B" | "C" })} className={inputClass}><option value="A">A senior</option><option value="B">B subordinate</option><option value="C">C equity</option></select>
              <input type="number" value={newBond.size} onChange={(event) => setNewBond({ ...newBond, size: event.target.value })} placeholder="Size ($M)" className={inputClass} />
              <input type="number" value={newBond.ltc} onChange={(event) => setNewBond({ ...newBond, ltc: event.target.value })} placeholder="LTC" step="0.01" className={inputClass} />
              <input type="number" value={newBond.ltv} onChange={(event) => setNewBond({ ...newBond, ltv: event.target.value })} placeholder="LTV" step="0.01" className={inputClass} />
              <input type="number" value={newBond.dscr} onChange={(event) => setNewBond({ ...newBond, dscr: event.target.value })} placeholder="DSCR" step="0.01" className={inputClass} />
              <input type="number" value={newBond.spread} onChange={(event) => setNewBond({ ...newBond, spread: event.target.value })} placeholder="Spread (bp)" className={inputClass} />
              <button onClick={handleCreateBond} disabled={createBondMutation.isPending} className={buttonClass}>{createBondMutation.isPending ? "Adding..." : "Add tranche"}</button>
            </div>
          </aside>
        </div>
      )}

      {/* ── POWER STRIP: Live Market Rates ──────────────────────── */}
      <div className="rounded-2xl border border-amber-300/20 bg-black/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
            <Radio size={14} className="text-emerald-400" /> Power strip — live rates
          </div>
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-slate-500">
            {marketRatesQuery.data?.timestamp ?? "loading"}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">10yr Treasury</span>
            <p className="font-mono text-lg font-semibold text-amber-100">
              {marketRatesQuery.isLoading ? "..." : marketRatesQuery.data?.treasury_10yr_pct != null ? `${marketRatesQuery.data.treasury_10yr_pct}%` : "4.28%"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">SOFR</span>
            <p className="font-mono text-lg font-semibold text-amber-100">
              {marketRatesQuery.isLoading ? "..." : marketRatesQuery.data?.sofr_pct != null ? `${marketRatesQuery.data.sofr_pct}%` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">IG Spread</span>
            <p className="font-mono text-lg font-semibold text-cyan-100">
              {marketRatesQuery.isLoading ? "..." : marketRatesQuery.data?.ig_spread_bps != null ? `+${marketRatesQuery.data.ig_spread_bps}bp` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── POWER STRIP: Refi Signal ───────────────────────────── */}
      {bonds.length > 0 && (
        <div className="rounded-2xl border border-amber-300/20 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
              <Activity size={14} /> Refi signal detector
            </div>
            <button onClick={checkRefiSignal} disabled={refiMutation.isPending} className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-300/20 disabled:opacity-50">
              {refiMutation.isPending ? "Scanning..." : "Check now"}
            </button>
          </div>
          {refiMutation.data && (
            <div className="mt-3 flex items-center gap-3">
              {refiMutation.data.recommendation === "EXECUTE_CALL" || refiMutation.data.recommendation === "CALL_ELIGIBLE" ? (
                <TrendingDown size={18} className="text-emerald-400" />
              ) : refiMutation.data.recommendation === "PUT_ALERT" ? (
                <TrendingUp size={18} className="text-red-400" />
              ) : (
                <Activity size={18} className="text-slate-400" />
              )}
              <div>
                <p className={`font-mono text-sm font-semibold ${
                  refiMutation.data.recommendation === "EXECUTE_CALL" ? "text-emerald-300" :
                  refiMutation.data.recommendation === "CALL_ELIGIBLE" ? "text-emerald-200" :
                  refiMutation.data.recommendation === "PUT_ALERT" ? "text-red-300" :
                  "text-slate-300"
                }`}>
                  {refiMutation.data.recommendation?.replace(/_/g, " ")}
                </p>
                <p className="font-mono text-[0.62rem] text-slate-500">
                  Rate Δ: {refiMutation.data.rate_delta_bps > 0 ? "+" : ""}{refiMutation.data.rate_delta_bps}bp
                  {refiMutation.data.estimated_savings_usd > 0 && (
                    <> · Est. saving: ${(refiMutation.data.estimated_savings_usd / 1_000_000).toFixed(2)}M</>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
