"use client";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, BarChart3, Activity, DollarSign,
  Percent, Clock, Shield, Zap, AlertTriangle, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PoolEconomics, Scenario, TREASURY_RATES, SOFR_RATE, PRIME_RATE,
  formatM, formatPct, formatBps,
} from "@/shared/bondArrangementDemo";

// ── Props ────────────────────────────────────────────────────────

interface BondEconomicsPanelProps {
  economics: PoolEconomics;
  baseEconomics: PoolEconomics;
  scenarios: Scenario[];
  activeScenario: string;
  onScenarioChange: (scenarioId: string) => void;
}

// ── Scenario Styling ─────────────────────────────────────────────

const SCENARIO_STYLES: Record<string, { border: string; bg: string; text: string; icon: typeof Zap }> = {
  base: { border: "border-emerald-400/40", bg: "bg-emerald-400/10", text: "text-emerald-200", icon: Activity },
  rates_down_50: { border: "border-cyan-400/40", bg: "bg-cyan-400/10", text: "text-cyan-200", icon: TrendingDown },
  rates_up_75: { border: "border-red-400/40", bg: "bg-red-400/10", text: "text-red-200", icon: TrendingUp },
  project_delay_6mo: { border: "border-amber-400/40", bg: "bg-amber-400/10", text: "text-amber-200", icon: AlertTriangle },
  early_retire_a: { border: "border-emerald-400/40", bg: "bg-emerald-400/10", text: "text-emerald-200", icon: Zap },
};

// ── Main Component ───────────────────────────────────────────────

export default function BondEconomicsPanel({
  economics,
  baseEconomics,
  scenarios,
  activeScenario,
  onScenarioChange,
}: BondEconomicsPanelProps) {
  const activeScenarioData = useMemo(
    () => scenarios.find(s => s.id === activeScenario) ?? scenarios[0],
    [scenarios, activeScenario],
  );

  return (
    <div className="space-y-4">
      {/* ── Treasury Rates Bar ──────────────────────────────── */}
      <div className="rounded-xl border border-white/10 bg-black/35 px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
            US Treasury Curve
          </span>
          <span className="font-mono text-[0.48rem] text-slate-600">
            {new Date(TREASURY_RATES.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1 overflow-x-auto">
          {(["1mo", "3mo", "6mo", "1yr", "2yr", "3yr", "5yr", "7yr", "10yr", "20yr", "30yr"] as const).map(tenor => {
            const rate = TREASURY_RATES[tenor];
            return (
              <div key={tenor} className="flex-shrink-0 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1 text-center">
                <p className="font-mono text-[0.48rem] uppercase text-slate-500">{tenor}</p>
                <p className={`font-mono text-[0.62rem] font-semibold ${rate > 5 ? "text-red-300" : rate > 4.5 ? "text-amber-200" : "text-emerald-200"}`}>
                  {rate.toFixed(2)}%
                </p>
              </div>
            );
          })}
          <div className="mx-1 h-6 w-px bg-white/10" />
          <div className="flex-shrink-0 rounded-md border border-cyan-300/20 bg-cyan-400/5 px-2 py-1 text-center">
            <p className="font-mono text-[0.48rem] text-cyan-400">SOFR</p>
            <p className="font-mono text-[0.62rem] font-semibold text-cyan-200">{SOFR_RATE.toFixed(2)}%</p>
          </div>
          <div className="flex-shrink-0 rounded-md border border-amber-300/20 bg-amber-400/5 px-2 py-1 text-center">
            <p className="font-mono text-[0.48rem] text-amber-400">PRIME</p>
            <p className="font-mono text-[0.62rem] font-semibold text-amber-200">{PRIME_RATE.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* ── Economics Grid ──────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-amber-200" />
          <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
            Pool Economics
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <EconMetric label="Total Commitment" value={formatM(economics.totalCommitment)} base={formatM(baseEconomics.totalCommitment)} changed={economics.totalCommitment !== baseEconomics.totalCommitment} icon={DollarSign} large />
          <EconMetric label="Total Drawn" value={formatM(economics.totalDrawn)} base={formatM(baseEconomics.totalDrawn)} changed={economics.totalDrawn !== baseEconomics.totalDrawn} icon={DollarSign} />
          <EconMetric label="Blended Coupon" value={formatPct(economics.blendedCoupon)} base={formatPct(baseEconomics.blendedCoupon)} changed={economics.blendedCoupon !== baseEconomics.blendedCoupon} icon={Percent} goodIfDown />
          <EconMetric label="Weighted Avg Life" value={`${economics.weightedAvgLife.toFixed(1)}yr`} base={`${baseEconomics.weightedAvgLife.toFixed(1)}yr`} changed={economics.weightedAvgLife !== baseEconomics.weightedAvgLife} icon={Clock} />
          <EconMetric label="All-In Cost" value={formatPct(economics.allInCost)} base={formatPct(baseEconomics.allInCost)} changed={economics.allInCost !== baseEconomics.allInCost} icon={DollarSign} goodIfDown />
          <EconMetric label="Pool DSCR" value={economics.poolDscr > 0 ? `${economics.poolDscr.toFixed(2)}x` : "N/A"} base={baseEconomics.poolDscr > 0 ? `${baseEconomics.poolDscr.toFixed(2)}x` : "N/A"} changed={economics.poolDscr !== baseEconomics.poolDscr} icon={Shield} goodIfUp />
          <EconMetric label="Pool LTV" value={`${economics.poolLtv.toFixed(0)}%`} base={`${baseEconomics.poolLtv.toFixed(0)}%`} changed={economics.poolLtv !== baseEconomics.poolLtv} icon={Activity} goodIfDown />
          <EconMetric label="Fee Savings" value={`$${economics.unusedFeeSavings.toFixed(0)}K/yr`} base={`$${baseEconomics.unusedFeeSavings.toFixed(0)}K/yr`} changed={economics.unusedFeeSavings !== baseEconomics.unusedFeeSavings} icon={Zap} goodIfUp />
          <EconMetric label="Rate Arb Spread" value={formatBps(economics.rateArbitrageSpread)} base={formatBps(baseEconomics.rateArbitrageSpread)} changed={economics.rateArbitrageSpread !== baseEconomics.rateArbitrageSpread} icon={TrendingUp} goodIfUp />
          <EconMetric label="NEST Fee" value={formatPct(economics.nestArrangementFee)} base={formatPct(baseEconomics.nestArrangementFee)} changed={false} icon={DollarSign} />
          <EconMetric label="NEST Revenue" value={`$${economics.nestRevenue.toFixed(0)}K`} base={`$${baseEconomics.nestRevenue.toFixed(0)}K`} changed={economics.nestRevenue !== baseEconomics.nestRevenue} icon={DollarSign} large goodIfUp />
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
            <p className="font-mono text-[0.52rem] uppercase tracking-[0.12em] text-slate-500">Senior / Sub Split</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-emerald-400/60 rounded-full" style={{ width: `${economics.seniorPct}%` }} />
              </div>
              <span className="font-mono text-[0.56rem] text-slate-300">
                {economics.seniorPct.toFixed(0)}% / {economics.subPct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scenario Engine ─────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-cyan-200" />
          <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">
            Scenario Engine
          </span>
        </div>

        {/* Scenario Buttons */}
        <div className="flex flex-wrap gap-2">
          {scenarios.map(scenario => {
            const style = SCENARIO_STYLES[scenario.id] ?? SCENARIO_STYLES.base;
            const isActive = activeScenario === scenario.id;
            const Icon = style.icon;
            return (
              <Button
                key={scenario.id}
                onClick={() => onScenarioChange(scenario.id)}
                className={`rounded-xl border px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase transition ${
                  isActive
                    ? `${style.border} ${style.bg} ${style.text}`
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                <Icon size={12} className="mr-1.5" />
                {scenario.label}
              </Button>
            );
          })}
        </div>

        {/* Active Scenario Detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
          >
            <p className="font-mono text-[0.72rem] text-slate-200">{activeScenarioData.description}</p>
            <div className="mt-3 space-y-1.5">
              {activeScenarioData.actions.map((action, i) => (
                <div key={i} className="flex gap-2 font-mono text-[0.68rem]">
                  <ChevronRight size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{action}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Metric Card ──────────────────────────────────────────────────

function EconMetric({
  label,
  value,
  base,
  changed,
  icon: Icon,
  large = false,
  goodIfUp = false,
  goodIfDown = false,
}: {
  label: string;
  value: string;
  base: string;
  changed: boolean;
  icon: typeof DollarSign;
  large?: boolean;
  goodIfUp?: boolean;
  goodIfDown?: boolean;
}) {
  const isUp = value > base;
  const isGood = (goodIfUp && isUp) || (goodIfDown && !isUp);

  return (
    <div className={`rounded-lg border p-2 transition ${changed ? (isGood ? "border-emerald-400/20 bg-emerald-500/5" : "border-red-400/20 bg-red-500/5") : "border-white/5 bg-white/[0.02]"}`}>
      <div className="flex items-center gap-1">
        <Icon size={10} className="text-slate-500" />
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className={`font-mono ${large ? "text-lg" : "text-base"} font-semibold text-amber-100 mt-0.5`}>
        {value}
      </p>
      {changed && (
        <div className="flex items-center gap-1 mt-0.5">
          {isGood ? <TrendingUp size={9} className="text-emerald-400" /> : <TrendingDown size={9} className="text-red-400" />}
          <span className={`font-mono text-[0.48rem] ${isGood ? "text-emerald-400" : "text-red-400"}`}>
            from {base}
          </span>
        </div>
      )}
    </div>
  );
}
