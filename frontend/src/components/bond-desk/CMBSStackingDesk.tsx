import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { useDealState, type PoolDeal } from "@/contexts/DealStateContext";
import { useBernard } from "@/contexts/BernardContext";
import { trpc } from "@/lib/trpc";

// ─── Brand Colors ────────────────────────────────────────────────────────────
const GOLD   = "#C4A048";
const CYAN   = "#22d3ee";
const AMBER  = "#f59e0b";
const RED    = "#ef4444";
const GREEN  = "#22c55e";
const SLATE  = "#64748b";

const TRANCHE_COLORS: Record<string, string> = {
  AAA:        "#C4A048",   // gold — senior / safest
  AA:         "#E8C87A",   // gold-hi
  A:          "#22d3ee",   // cyan
  BBB:        "#38bdf8",   // sky
  BB:         "#f59e0b",   // amber
  B:          "#ef4444",   // red
  Equity:     "#a855f7",   // purple
};

const SECTOR_COLORS: Record<string, string> = {
  multifamily:   CYAN,
  office:        GOLD,
  retail:        AMBER,
  industrial:    GREEN,
  hospitality:   "#ec4899",
  mixed:         "#a855f7",
  other:         SLATE,
};

// ─── Tranche class definitions for the waterfall ─────────────────────────────
const WATERFALL_CLASSES = [
  { key: "AAA",    label: "AAA / Senior",   color: TRANCHE_COLORS.AAA,    pctOfPool: 0 },
  { key: "AA",     label: "AA",             color: TRANCHE_COLORS.AA,     pctOfPool: 0 },
  { key: "A",      label: "A",              color: TRANCHE_COLORS.A,      pctOfPool: 0 },
  { key: "BBB",    label: "BBB / Mezz",     color: TRANCHE_COLORS.BBB,    pctOfPool: 0 },
  { key: "BB",     label: "BB",             color: TRANCHE_COLORS.BB,     pctOfPool: 0 },
  { key: "B",      label: "B",              color: TRANCHE_COLORS.B,      pctOfPool: 0 },
  { key: "Equity", label: "Equity / NR",   color: TRANCHE_COLORS.Equity, pctOfPool: 0 },
];

// Convert tranche_classes from the API (senior/mezzanine/subordinate/equity)
// into the rating-band buckets the waterfall expects.
function mapToWaterfallBands(
  trancheClasses: Record<string, number>,
  totalPool: number
) {
  // The API returns four broad buckets; spread them across rating bands.
  const senior     = trancheClasses.senior     ?? 0;
  const mezzanine  = trancheClasses.mezzanine  ?? 0;
  const subordinate = trancheClasses.subordinate ?? 0;
  const equity     = trancheClasses.equity     ?? 0;

  // Split senior → AAA (70%) + AA (20%) + A (10%)
  // Split mezzanine → BBB (60%) + BB (40%)
  // Subordinate → B, Equity → Equity
  const bands: Record<string, number> = {
    AAA:    senior     * 0.70,
    AA:     senior     * 0.20,
    A:      senior     * 0.10,
    BBB:    mezzanine  * 0.60,
    BB:     mezzanine  * 0.40,
    B:      subordinate,
    Equity: equity,
  };

  // Build attachment / detachment points (bottom-up stacking)
  let cumulative = 0;
  return WATERFALL_CLASSES.map((cls) => {
    const amount = bands[cls.key] ?? 0;
    const pct    = totalPool > 0 ? (amount / totalPool) * 100 : 0;
    const attach = totalPool > 0 ? (cumulative / totalPool) * 100 : 0;
    cumulative  += amount;
    const detach = totalPool > 0 ? (cumulative / totalPool) * 100 : 0;
    return { ...cls, amount, pct, attach, detach };
  }).filter((b) => b.amount > 0);
}

// ─── Leverage slider rating hint ─────────────────────────────────────────────
function getRatingHint(sub: number): string {
  if (sub <= 8)  return `At ${sub}% subordination: Senior tranche likely AA–, Mezz likely BB+ (thin protection, rating risk elevated)`;
  if (sub <= 14) return `At ${sub}% subordination: Senior tranche likely AAA–, Mezz likely BBB– (approach investment grade)`;
  if (sub <= 20) return `At ${sub}% subordination: Senior tranche likely AAA, Mezz likely BBB (standard CMBS profile)`;
  if (sub <= 25) return `At ${sub}% subordination: Senior tranche likely AAA+, Mezz likely BBB+ (strong credit enhancement)`;
  return `At ${sub}% subordination: Senior tranche likely AAA+, Mezz likely A– (conservative, lower yield, strongest ratings)`;
}

function getLeverageLabel(sub: number): { label: string; color: string } {
  if (sub <= 8)  return { label: "Max Leverage — highest yield, rating risk",     color: RED   };
  if (sub <= 14) return { label: "High Leverage — elevated but manageable risk",  color: AMBER };
  if (sub <= 20) return { label: "Standard CMBS — balanced yield & protection",   color: GOLD  };
  if (sub <= 25) return { label: "Conservative — stronger ratings, lower yield",  color: CYAN  };
  return             { label: "Very Conservative — maximum credit enhancement",   color: GREEN };
}

// Pool Health
function getPoolHealth(
  diversificationScore: number,
  poolDscr: number,
  maxSectorPct: number
): { label: string; color: string } {
  const issues = [];
  if (diversificationScore < 50) issues.push("low diversification");
  if (poolDscr < 1.5)           issues.push("weak DSCR");
  if (maxSectorPct > 40)        issues.push("concentration risk");
  if (issues.length === 0)      return { label: "Healthy",  color: GREEN };
  if (issues.length === 1)      return { label: "Watch",    color: AMBER };
  return                               { label: "Risk",     color: RED   };
}

// ─── Custom Tooltip for waterfall ────────────────────────────────────────────
const WaterfallTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-[#060E1A]/95 p-3 shadow-xl font-mono text-[0.6rem]">
      <div className="mb-1 font-semibold text-slate-200">{d.label}</div>
      <div className="text-[#C4A048]">${(d.amount / 1e6).toFixed(1)}M &nbsp; {d.pct.toFixed(1)}%</div>
      <div className="mt-1 text-slate-500">
        Attach {d.attach.toFixed(1)}% → Detach {d.detach.toFixed(1)}%
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CMBSStackingDesk() {
  const { state, addToPool, removeFromPool, log } = useDealState();
  const bernard  = useBernard();
  const poolMutation = trpc.bondStructuring.poolAnalysis.useMutation();
  const [subordination, setSubordination] = useState(18);

  const poolDealIds = new Set(state.cmbsPool.map((p) => p.deal.id));

  // ── Pool Composition derived data ──────────────────────────────────────────
  const sectorBreakdown = useMemo(() => {
    if (state.cmbsPool.length === 0) return [];
    const totals: Record<string, number> = {};
    let grand = 0;
    for (const p of state.cmbsPool) {
      const s = p.deal.sector ?? "other";
      totals[s] = (totals[s] ?? 0) + p.metrics.total_debt_usd;
      grand += p.metrics.total_debt_usd;
    }
    return Object.entries(totals)
      .map(([sector, amount]) => ({
        sector,
        amount,
        pct: grand > 0 ? (amount / grand) * 100 : 0,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [state.cmbsPool]);

  const maxSectorPct = sectorBreakdown.length > 0 ? sectorBreakdown[0].pct : 0;
  const hasConcentrationRisk = maxSectorPct > 40;

  const blendedWAC = useMemo(() => {
    if (state.cmbsPool.length === 0) return 0;
    let weightedSum = 0, total = 0;
    for (const p of state.cmbsPool) {
      weightedSum += p.metrics.blended_coupon_pct * p.metrics.total_debt_usd;
      total += p.metrics.total_debt_usd;
    }
    return total > 0 ? weightedSum / total : 0;
  }, [state.cmbsPool]);

  const blendedDSCR = useMemo(() => {
    if (state.cmbsPool.length === 0) return 0;
    let sum = 0;
    for (const p of state.cmbsPool) sum += p.metrics.dscr;
    return sum / state.cmbsPool.length;
  }, [state.cmbsPool]);

  const poolMetrics   = poolMutation.data as any;
  const totalPool     = state.cmbsPool.reduce((s, p) => s + p.metrics.total_debt_usd, 0);

  // Waterfall bands (only when API data exists)
  const waterfallBands = useMemo(() => {
    if (!poolMetrics?.tranche_classes || totalPool === 0) return [];
    return mapToWaterfallBands(poolMetrics.tranche_classes, totalPool);
  }, [poolMetrics, totalPool]);

  // Build stacked chart data — one column with all bands
  const waterfallChartData = useMemo(() => {
    if (waterfallBands.length === 0) return [];
    // Single bar = full pool; each band is a stack segment
    const row: Record<string, any> = { name: "Pool" };
    for (const b of waterfallBands) row[b.key] = b.amount / 1e6;
    return [row];
  }, [waterfallBands]);

  const poolHealth = poolMetrics
    ? getPoolHealth(
        poolMetrics.pool_metrics.diversification_score,
        poolMetrics.pool_metrics.pool_dscr,
        maxSectorPct
      )
    : null;

  // ── Event handlers ──────────────────────────────────────────────────────────
  const handleAddToPool = () => {
    if (!state.activeDeal || !state.metrics || state.tranches.length === 0) return;
    if (poolDealIds.has(state.activeDeal.id)) return;

    const poolDeal: PoolDeal = {
      deal:    state.activeDeal,
      tranches: [...state.tranches],
      metrics:  { ...state.metrics },
    };
    addToPool(poolDeal);
    log("NEST", "pool_add", `${state.activeDeal.name} added to CMBS pool`);

    const allDeals = [...state.cmbsPool, poolDeal].map((p) => ({
      total_debt_usd:        p.metrics.total_debt_usd,
      blended_coupon_pct:    p.metrics.blended_coupon_pct,
      stabilized_noi_usd:    p.deal.stabilized_noi_usd,
      sector:                p.deal.sector,
      weighted_avg_life_yrs: 10,
      tranches: p.tranches.map((t) => ({ series: t.series, size_usd: t.size_usd })),
    }));

    poolMutation.mutate({ deals: allDeals }, {
      onSuccess: (data: any) => {
        const pm = data.pool_metrics;
        bernard.push({
          type: "pool_updated",
          depths: {
            expert: `Pool: ${pm.deal_count} deals, $${(pm.total_commitment_usd / 1e6).toFixed(0)}M, ${pm.wac_pct.toFixed(2)}% WAC, ${pm.pool_dscr.toFixed(2)}x DSCR.`,
            standard: `Added ${state.activeDeal!.name} to pool. ${pm.deal_count} deals totaling $${(pm.total_commitment_usd / 1e6).toFixed(0)}M. Diversification score: ${pm.diversification_score}/100. Pool DSCR: ${pm.pool_dscr.toFixed(2)}x.`,
            educational: `Adding ${state.activeDeal!.name} brings the CMBS pool to ${pm.deal_count} deals with $${(pm.total_commitment_usd / 1e6).toFixed(0)}M total commitment. The weighted average coupon (WAC) is ${pm.wac_pct.toFixed(2)}% — this is what investors receive on average. Diversification score of ${pm.diversification_score}/100 reflects how spread out the pool is across sectors and deals. Higher diversification generally means lower risk and better ratings. Pool DSCR of ${pm.pool_dscr.toFixed(2)}x ${pm.pool_dscr >= 1.5 ? "is investment grade." : "needs improvement."}`,
          },
        });
      },
    });
  };

  const handleRemoveFromPool = (dealId: string) => {
    const deal = state.cmbsPool.find((p) => p.deal.id === dealId);
    removeFromPool(dealId);
    if (deal) log("NEST", "pool_remove", `${deal.deal.name} removed from CMBS pool`);
  };

  const { label: leverageLabel, color: leverageColor } = getLeverageLabel(subordination);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-[Cormorant_Garamond] text-xl font-semibold text-slate-200">
            CMBS Stacking Desk
          </h2>
          <p className="font-mono text-[0.6rem] text-slate-500">
            Pool structured deals into a CMBS offering
          </p>
        </div>

        {totalPool > 0 && (
          <div className="flex items-start gap-3">
            {/* Pool total */}
            <div className="rounded-xl border border-[#C4A048]/20 bg-[#C4A048]/10 px-4 py-2 text-right">
              <div className="font-mono text-[0.5rem] uppercase tracking-wider text-[#C4A048]/60">Pool Commitment</div>
              <div className="font-mono text-xl font-semibold text-[#C4A048]">
                ${(totalPool / 1e6).toFixed(0)}M
              </div>
            </div>
            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Deals"       value={`${state.cmbsPool.length}`}          />
              <MiniStat label="Blended WAC" value={`${blendedWAC.toFixed(2)}%`}         />
              <MiniStat label="Pool DSCR"   value={`${blendedDSCR.toFixed(2)}x`}        />
            </div>
            {/* Pool Health pill */}
            {poolHealth && (
              <div
                className="self-start rounded-xl border px-3 py-2 text-center"
                style={{ borderColor: `${poolHealth.color}40`, backgroundColor: `${poolHealth.color}10` }}
              >
                <div className="font-mono text-[0.45rem] uppercase tracking-wider" style={{ color: `${poolHealth.color}99` }}>
                  Pool Health
                </div>
                <div className="font-mono text-sm font-bold" style={{ color: poolHealth.color }}>
                  {poolHealth.label}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Pool Builder ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h4 className="mb-2 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              Active Deal
            </h4>
            {state.activeDeal && state.metrics ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-[Space_Grotesk] text-sm text-slate-200">{state.activeDeal.name}</div>
                  <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-[0.6rem]">
                    <span className="text-slate-500">Debt</span>
                    <span className="text-right text-[#C4A048]">${(state.metrics.total_debt_usd / 1e6).toFixed(0)}M</span>
                    <span className="text-slate-500">Grade</span>
                    <span className="text-right text-slate-200">{state.metrics.obligor_grade}</span>
                    <span className="text-slate-500">DSCR</span>
                    <span className="text-right text-slate-200">{state.metrics.dscr.toFixed(2)}x</span>
                  </div>
                </div>
                <button
                  onClick={handleAddToPool}
                  disabled={poolDealIds.has(state.activeDeal.id)}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-4 py-2 font-mono text-xs font-semibold text-[#030A06] disabled:opacity-30 transition-all hover:shadow-[0_0_16px_rgba(34,211,238,0.3)]"
                >
                  {poolDealIds.has(state.activeDeal.id) ? "Already in Pool" : "Add to CMBS Pool"}
                </button>
              </div>
            ) : (
              <p className="font-mono text-[0.65rem] text-slate-600">
                Structure a deal above to add it to the pool
              </p>
            )}
          </div>
        </div>

        <div className="col-span-8">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h4 className="mb-2 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              CMBS Pool ({state.cmbsPool.length} deals)
            </h4>
            {state.cmbsPool.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {state.cmbsPool.map((p) => (
                  <motion.div
                    key={p.deal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-[Space_Grotesk] text-sm text-slate-200">{p.deal.name}</span>
                      <button
                        onClick={() => handleRemoveFromPool(p.deal.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 text-xs transition-all"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-1 flex gap-3 font-mono text-[0.55rem] text-slate-400">
                      <span>${(p.metrics.total_debt_usd / 1e6).toFixed(0)}M</span>
                      <span>{p.metrics.obligor_grade}</span>
                      <span>{p.metrics.dscr.toFixed(2)}x</span>
                      <span className="capitalize">{p.deal.sector}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                <p className="font-mono text-[0.65rem] text-slate-600">No deals in pool yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pool Composition ────────────────────────────────────────────────── */}
      {state.cmbsPool.length > 0 && sectorBreakdown.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              Pool Composition
            </h4>
            {hasConcentrationRisk && (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
                <span className="text-amber-400 text-[0.65rem]">⚠</span>
                <span className="font-mono text-[0.55rem] text-amber-400">
                  Concentration risk: {sectorBreakdown[0].sector} at {sectorBreakdown[0].pct.toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sector diversification bars */}
            <div className="space-y-2">
              <div className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600 mb-2">
                Sector Allocation
              </div>
              {sectorBreakdown.map(({ sector, amount, pct }) => (
                <div key={sector} className="flex items-center gap-2">
                  <div className="w-20 font-mono text-[0.55rem] capitalize text-slate-400 truncate">{sector}</div>
                  <div className="flex-1 h-4 rounded-sm bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-sm"
                      style={{
                        backgroundColor: SECTOR_COLORS[sector] ?? SLATE,
                        opacity: pct > 40 ? 1 : 0.75,
                      }}
                    />
                  </div>
                  <div className="w-12 text-right font-mono text-[0.55rem]" style={{ color: pct > 40 ? AMBER : SLATE }}>
                    {pct.toFixed(0)}%
                  </div>
                  <div className="w-12 text-right font-mono text-[0.5rem] text-slate-600">
                    ${(amount / 1e6).toFixed(0)}M
                  </div>
                </div>
              ))}
            </div>

            {/* Deal count by rating + sector legend */}
            <div className="space-y-2">
              <div className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600 mb-2">
                Deals by Rating Grade
              </div>
              {(() => {
                const byGrade: Record<string, number> = {};
                for (const p of state.cmbsPool) {
                  const g = p.metrics.obligor_grade ?? "NR";
                  byGrade[g] = (byGrade[g] ?? 0) + 1;
                }
                return Object.entries(byGrade)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([grade, count]) => (
                    <div key={grade} className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            grade.startsWith("A") ? GOLD
                            : grade.startsWith("B") ? CYAN
                            : grade.startsWith("BB") ? AMBER
                            : RED,
                        }}
                      />
                      <span className="font-mono text-[0.6rem] text-slate-300 w-12">{grade}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: count }).map((_, i) => (
                          <div key={i} className="h-4 w-4 rounded bg-white/10 border border-white/10 flex items-center justify-center">
                            <span className="font-mono text-[0.45rem] text-slate-400">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                      <span className="font-mono text-[0.55rem] text-slate-500 ml-1">
                        {count} deal{count > 1 ? "s" : ""}
                      </span>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Waterfall + Leverage + Economics ────────────────────────────────── */}
      {poolMetrics && state.cmbsPool.length > 0 && (
        <div className="grid grid-cols-2 gap-4">

          {/* Left: Waterfall + Leverage slider */}
          <div className="space-y-4">

            {/* Capital Structure Waterfall */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <h4 className="mb-3 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
                Capital Structure Waterfall
              </h4>

              {waterfallBands.length > 0 ? (
                <div className="flex gap-3">
                  {/* Recharts stacked bar */}
                  <div className="flex-1" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={waterfallChartData}
                        margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                      >
                        <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                        <YAxis
                          tickFormatter={(v) => `$${v.toFixed(0)}M`}
                          tick={{ fontSize: 8, fill: "#64748b", fontFamily: "IBM Plex Mono" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<WaterfallTooltip />} />
                        {/* Render from equity (top) down to AAA (bottom) for stacking */}
                        {[...waterfallBands].reverse().map((band) => (
                          <Bar key={band.key} dataKey={band.key} stackId="pool" fill={band.color} radius={0}>
                            <Cell fill={band.color} fillOpacity={0.85} />
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Attachment/Detachment labels */}
                  <div className="flex flex-col justify-between py-1" style={{ minWidth: 130 }}>
                    {[...waterfallBands].reverse().map((band) => (
                      <div key={band.key} className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: band.color }}
                        />
                        <div>
                          <div className="font-mono text-[0.55rem] font-semibold" style={{ color: band.color }}>
                            {band.label}
                          </div>
                          <div className="font-mono text-[0.45rem] text-slate-600">
                            {band.attach.toFixed(1)}% → {band.detach.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center">
                  <p className="font-mono text-[0.6rem] text-slate-600">Calculating tranches…</p>
                </div>
              )}
            </div>

            {/* Enhanced Leverage Slider */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-500">
                  Push Leverage / Subordination
                </span>
                <span className="font-mono text-sm font-semibold" style={{ color: leverageColor }}>
                  {subordination}% sub
                </span>
              </div>

              {/* Color-gradient track overlay */}
              <div className="relative mt-1">
                <div
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full pointer-events-none"
                  style={{
                    background: "linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #C4A048 45%, #22d3ee 70%, #22c55e 100%)",
                    opacity: 0.35,
                  }}
                />
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={subordination}
                  onChange={(e) => setSubordination(parseInt(e.target.value))}
                  className="relative w-full accent-[#C4A048] cursor-pointer"
                  style={{ background: "transparent" }}
                />
              </div>

              {/* Key point labels */}
              <div className="mt-1 flex justify-between font-mono text-[0.45rem]">
                <span style={{ color: RED }}>5% — Max Leverage</span>
                <span style={{ color: AMBER }}>15% — Moderate</span>
                <span style={{ color: CYAN }}>18% — Standard</span>
                <span style={{ color: GREEN }}>30% — Conservative</span>
              </div>

              {/* Current leverage label */}
              <div
                className="mt-3 rounded-lg border px-3 py-2"
                style={{ borderColor: `${leverageColor}30`, backgroundColor: `${leverageColor}08` }}
              >
                <div className="font-mono text-[0.55rem] font-semibold" style={{ color: leverageColor }}>
                  {leverageLabel}
                </div>
                <div className="mt-1 font-mono text-[0.5rem] text-slate-500 leading-relaxed">
                  {getRatingHint(subordination)}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pool Economics */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h4 className="mb-3 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              Pool Economics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <PoolStat label="Total Commitment" value={`$${(poolMetrics.pool_metrics.total_commitment_usd / 1e6).toFixed(0)}M`} />
              <PoolStat label="Deals"            value={poolMetrics.pool_metrics.deal_count} />
              <PoolStat label="WAC"              value={`${poolMetrics.pool_metrics.wac_pct.toFixed(2)}%`} />
              <PoolStat label="WAL"              value={`${poolMetrics.pool_metrics.wal_yrs.toFixed(1)} yrs`} />
              <PoolStat label="Pool DSCR"        value={`${poolMetrics.pool_metrics.pool_dscr.toFixed(2)}x`} />
              <PoolStat label="Diversification"  value={`${poolMetrics.pool_metrics.diversification_score}/100`} />
              <PoolStat label="Senior %"         value={`${poolMetrics.pool_metrics.senior_pct.toFixed(0)}%`} />
              <PoolStat label="Subordination"    value={`${poolMetrics.pool_metrics.subordination_pct.toFixed(0)}%`} />
            </div>

            {/* Tranche class quick legend */}
            {poolMetrics.tranche_classes && (
              <div className="mt-4 space-y-1.5">
                <div className="font-mono text-[0.5rem] uppercase tracking-wider text-slate-600 mb-2">
                  Tranche Breakdown
                </div>
                {Object.entries(poolMetrics.tranche_classes as Record<string, number>)
                  .filter(([, v]) => v > 0)
                  .map(([cls, amount]) => {
                    const pct = totalPool > 0 ? (amount / totalPool) * 100 : 0;
                    const color =
                      cls === "senior"      ? GOLD
                      : cls === "mezzanine" ? CYAN
                      : cls === "subordinate" ? AMBER
                      : RED;
                    return (
                      <div key={cls} className="flex items-center gap-2">
                        <div className="w-16 font-mono text-[0.55rem] capitalize text-slate-400">{cls}</div>
                        <div className="flex-1 h-3 rounded-sm bg-white/[0.04] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                        <div className="w-12 text-right font-mono text-[0.55rem]" style={{ color }}>
                          ${(amount / 1e6).toFixed(0)}M
                        </div>
                        <div className="w-8 text-right font-mono text-[0.5rem] text-slate-600">
                          {pct.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PoolStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
      <div className="font-mono text-[0.5rem] uppercase tracking-wider text-slate-600">{label}</div>
      <div className="font-mono text-sm font-semibold text-[#C4A048]">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-center">
      <div className="font-mono text-[0.45rem] uppercase tracking-wider text-slate-600">{label}</div>
      <div className="font-mono text-xs font-semibold text-slate-300">{value}</div>
    </div>
  );
}
