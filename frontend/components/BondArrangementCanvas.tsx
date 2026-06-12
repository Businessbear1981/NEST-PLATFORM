"use client";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Plus, Minus, ArrowRight, Building2, DollarSign,
  Clock, Shield, TrendingUp, ChevronDown, MapPin, AlertTriangle, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DealInPool, MiniBond, formatM, formatPct, formatBps,
  RATING_COLORS, BOND_COLORS, STATUS_COLORS,
} from "@/shared/bondArrangementDemo";

// ── Props ────────────────────────────────────────────────────────

interface BondArrangementCanvasProps {
  deals: DealInPool[];
  onToggleDealInPool: (dealId: string) => void;
  onSelectMiniBond: (bondId: string) => void;
  selectedBondId: string | null;
}

// ── Main Component ───────────────────────────────────────────────

export default function BondArrangementCanvas({
  deals,
  onToggleDealInPool,
  onSelectMiniBond,
  selectedBondId,
}: BondArrangementCanvasProps) {
  const poolDeals = useMemo(() => deals.filter(d => d.inPool), [deals]);
  const availableDeals = useMemo(() => deals.filter(d => !d.inPool), [deals]);
  const allPoolBonds = useMemo(() => poolDeals.flatMap(d => d.miniBonds), [poolDeals]);
  const totalPoolCommitment = useMemo(() => allPoolBonds.reduce((s, b) => s + b.amount, 0), [allPoolBonds]);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* ── Left: Available Deals ─────────────────────────────── */}
      <div className="col-span-4 space-y-3">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-slate-400" />
          <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Available Deals
          </span>
        </div>
        {availableDeals.map(deal => (
          <DealCard key={deal.id} deal={deal} onToggle={() => onToggleDealInPool(deal.id)} onSelectBond={onSelectMiniBond} selectedBondId={selectedBondId} />
        ))}
        {availableDeals.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
            <p className="font-mono text-[0.68rem] text-slate-500">All deals in pool</p>
          </div>
        )}
      </div>

      {/* ── Center: Arrow ─────────────────────────────────────── */}
      <div className="col-span-1 flex flex-col items-center justify-center">
        <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowRight size={24} className="text-amber-400/40" />
        </motion.div>
        <p className="font-mono text-[0.48rem] uppercase text-amber-400/40 mt-2 text-center">Drag to<br />Pool</p>
      </div>

      {/* ── Right: CMBS Pool ──────────────────────────────────── */}
      <div className="col-span-7 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-amber-200" />
            <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
              CMBS Pool — {formatM(totalPoolCommitment)}
            </span>
          </div>
          <span className="font-mono text-[0.56rem] text-slate-500">
            {poolDeals.length} deal{poolDeals.length !== 1 ? "s" : ""} · {allPoolBonds.length} mini-bonds
          </span>
        </div>

        {/* Capital Stack Bar */}
        {allPoolBonds.length > 0 && (
          <CapitalStackBar bonds={allPoolBonds} total={totalPoolCommitment} />
        )}

        {/* Pool Stats */}
        {allPoolBonds.length > 0 && (
          <PoolStats bonds={allPoolBonds} total={totalPoolCommitment} />
        )}

        {/* Pool Deals */}
        {poolDeals.map(deal => (
          <DealCard key={deal.id} deal={deal} onToggle={() => onToggleDealInPool(deal.id)} onSelectBond={onSelectMiniBond} selectedBondId={selectedBondId} inPool />
        ))}
        {poolDeals.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-amber-400/20 bg-amber-400/5 p-8 text-center">
            <Layers size={32} className="text-amber-400/30 mx-auto" />
            <p className="font-mono text-sm text-amber-200/60 mt-3">Add deals to build your CMBS offering</p>
            <p className="font-mono text-[0.62rem] text-slate-500 mt-1">Drag deals from the left or click "Add to Pool"</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Deal Card ────────────────────────────────────────────────────

function DealCard({
  deal,
  onToggle,
  onSelectBond,
  selectedBondId,
  inPool = false,
}: {
  deal: DealInPool;
  onToggle: () => void;
  onSelectBond: (id: string) => void;
  selectedBondId: string | null;
  inPool?: boolean;
}) {
  return (
    <div className={`rounded-2xl border bg-black/35 overflow-hidden transition ${inPool ? "border-amber-400/20" : "border-white/10 hover:border-white/20"}`}>
      {/* Deal Header */}
      <div className="p-3 border-b border-white/5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-mono text-[0.78rem] font-semibold text-white">{deal.name}</h3>
            <p className="font-mono text-[0.56rem] text-slate-400 mt-0.5">{deal.projectType}</p>
            <p className="font-mono text-[0.52rem] text-slate-500 mt-0.5">
              <MapPin size={9} className="inline mr-0.5" />{deal.location} · {deal.sponsor}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-semibold text-amber-100">{formatM(deal.totalCommitment)}</p>
            <Button
              onClick={onToggle}
              className={`mt-1 rounded-lg border px-3 py-1 font-mono text-[0.56rem] font-semibold uppercase ${
                inPool
                  ? "border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                  : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
              }`}
            >
              {inPool ? <><Minus size={10} className="mr-1" /> Remove</> : <><Plus size={10} className="mr-1" /> Add to Pool</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mini-Bonds */}
      <div className="p-2 space-y-1.5">
        {deal.miniBonds.map(bond => (
          <MiniBondCard
            key={bond.id}
            bond={bond}
            selected={selectedBondId === bond.id}
            onClick={() => onSelectBond(bond.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Mini-Bond Card ───────────────────────────────────────────────

function MiniBondCard({
  bond,
  selected,
  onClick,
}: {
  bond: MiniBond;
  selected: boolean;
  onClick: () => void;
}) {
  const drawnAmount = bond.drawSchedule.filter(d => d.status === "drawn").reduce((s, d) => s + d.amount, 0);
  const drawPct = (drawnAmount / bond.amount) * 100;
  const drawWindow = bond.drawSchedule.length > 0
    ? `Mo ${bond.drawSchedule[0].month}-${bond.drawSchedule[bond.drawSchedule.length - 1].month}`
    : "—";

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className={`cursor-pointer rounded-xl border p-2.5 transition ${
        selected
          ? "border-amber-400/40 bg-amber-400/5 shadow-[0_0_12px_rgba(196,160,72,0.15)]"
          : "border-white/5 bg-white/[0.02] hover:border-white/10"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Letter Badge */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold text-[#030A06] flex-shrink-0"
          style={{ backgroundColor: bond.color }}
        >
          {bond.letter}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: label + badges */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[0.68rem] font-semibold text-white truncate">{bond.label}</span>
            <span className={`rounded-full border px-1.5 py-0 font-mono text-[0.48rem] uppercase ${RATING_COLORS[bond.rating]}`}>
              {bond.rating}
            </span>
            <span className={`rounded-full border px-1.5 py-0 font-mono text-[0.48rem] uppercase ${STATUS_COLORS[bond.status]}`}>
              {bond.status}
            </span>
          </div>

          {/* Metrics row */}
          <div className="flex items-center gap-3 mt-1 font-mono text-[0.56rem] text-slate-400">
            <span className="text-amber-100 font-semibold">{formatM(bond.amount)}</span>
            <span>{bond.termLabel}</span>
            <span>{formatPct(bond.coupon)}</span>
            <span>{formatBps(bond.spread)} spread</span>
          </div>

          {/* Put/Call row */}
          <div className="flex items-center gap-3 mt-1 font-mono text-[0.52rem]">
            {bond.call.type !== "none" && (
              <span className="text-[#C4A048]">
                {bond.call.type === "hard" ? "Hard" : "Soft"} Call @ {bond.call.price}
              </span>
            )}
            {bond.put.trigger !== "none" && (
              <span className="text-amber-300">
                PUT: {bond.put.triggerDescription.length > 40 ? bond.put.triggerDescription.slice(0, 40) + "..." : bond.put.triggerDescription}
              </span>
            )}
          </div>

          {/* Draw + DSCR row */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-3 font-mono text-[0.52rem] text-slate-500">
              <span>Draw: {drawWindow} ({bond.drawSchedule.length} draws)</span>
              {bond.dscr > 0 && <span>DSCR: <span className={bond.dscr >= 1.25 ? "text-emerald-300" : "text-amber-200"}>{bond.dscr.toFixed(2)}x</span></span>}
              <span>LTV: <span className={bond.ltv <= 65 ? "text-emerald-300" : bond.ltv <= 75 ? "text-amber-200" : "text-red-300"}>{bond.ltv}%</span></span>
            </div>
          </div>

          {/* Draw Progress Bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: bond.color }}
                initial={{ width: 0 }}
                animate={{ width: `${drawPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="font-mono text-[0.48rem] text-slate-500">{drawPct.toFixed(0)}% drawn</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Capital Stack Bar ────────────────────────────────────────────

function CapitalStackBar({ bonds, total }: { bonds: MiniBond[]; total: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/35 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Layers size={12} className="text-slate-400" />
        <span className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-slate-400">Capital Stack</span>
        <span className="font-mono text-[0.56rem] text-amber-100 ml-auto">{formatM(total)}</span>
      </div>
      <div className="flex h-6 rounded-lg overflow-hidden gap-px">
        {bonds.map(bond => {
          const pct = (bond.amount / total) * 100;
          return (
            <motion.div
              key={bond.id}
              className="relative group flex items-center justify-center"
              style={{ width: `${pct}%`, backgroundColor: bond.color + "cc" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="font-mono text-[0.52rem] font-bold text-[#030A06]">
                {bond.letter}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-20 rounded-md bg-[#0D2218] border border-white/10 px-2 py-1 whitespace-nowrap">
                <p className="font-mono text-[0.56rem] text-white">{bond.label}</p>
                <p className="font-mono text-[0.48rem] text-slate-400">{formatM(bond.amount)} · {formatPct(bond.coupon)} · {bond.rating}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {bonds.map(bond => (
          <div key={bond.id} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: bond.color }} />
            <span className="font-mono text-[0.48rem] text-slate-400">{bond.letter}: {formatM(bond.amount)} ({bond.rating})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pool Stats ───────────────────────────────────────────────────

function PoolStats({ bonds, total }: { bonds: MiniBond[]; total: number }) {
  const blendedCoupon = bonds.reduce((s, b) => s + b.coupon * b.amount, 0) / total;
  const wal = bonds.reduce((s, b) => s + (b.termMonths / 12) * b.amount, 0) / total;
  const avgSpread = bonds.reduce((s, b) => s + b.spread * b.amount, 0) / total;
  const seniorPct = (bonds.filter(b => ["AAA", "AA", "A"].includes(b.rating)).reduce((s, b) => s + b.amount, 0) / total) * 100;

  return (
    <div className="grid grid-cols-6 gap-2">
      {[
        { label: "Commitment", value: formatM(total), tone: "text-amber-100" },
        { label: "Blended Cpn", value: formatPct(blendedCoupon), tone: "text-amber-200" },
        { label: "WAL", value: `${wal.toFixed(1)}yr`, tone: "text-slate-200" },
        { label: "Avg Spread", value: formatBps(avgSpread), tone: "text-[#E8C87A]" },
        { label: "Senior %", value: `${seniorPct.toFixed(0)}%`, tone: "text-emerald-200" },
        { label: "Mini-Bonds", value: `${bonds.length}`, tone: "text-white" },
      ].map(stat => (
        <div key={stat.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center">
          <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
          <p className={`font-mono text-sm font-semibold ${stat.tone}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
