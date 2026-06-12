"use client";
import React, { useMemo, useState } from "react";
import { ArrowRight, Calculator, GitCompareArrows, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MethodologyFactor {
  id: string;
  factor: string;
  previous: string;
  revised: string;
  direction: "tightened" | "relaxed" | "neutral";
  weightDelta: number;
}

interface AffectedDealScore {
  id: string;
  deal: string;
  currentScore: number;
  revisedScore: number;
  memoImpact: string;
}

const FACTORS: MethodologyFactor[] = [
  {
    id: "vacancy",
    factor: "Office vacancy stress threshold",
    previous: "18% tolerance",
    revised: "15% tolerance",
    direction: "tightened",
    weightDelta: 6,
  },
  {
    id: "dscr",
    factor: "Minimum stressed DSCR",
    previous: "1.20x",
    revised: "1.28x",
    direction: "tightened",
    weightDelta: 8,
  },
  {
    id: "reserves",
    factor: "Liquidity reserve credit",
    previous: "6 months",
    revised: "9 months",
    direction: "tightened",
    weightDelta: 4,
  },
  {
    id: "sponsor",
    factor: "Sponsor operating history",
    previous: "5 years",
    revised: "7 years or equivalent prior projects",
    direction: "neutral",
    weightDelta: 0,
  },
];

const DEALS: AffectedDealScore[] = [
  { id: "deal-001", deal: "Canal Adaptive Reuse", currentScore: 78, revisedScore: 70, memoImpact: "Falls below Baa2 methodology comfort band until permit timing is resolved." },
  { id: "deal-002", deal: "Broadway Commons", currentScore: 86, revisedScore: 83, memoImpact: "Still supportable at Baa1; reserve disclosure needs update." },
  { id: "deal-003", deal: "CCRC Expansion Phase II", currentScore: 81, revisedScore: 84, memoImpact: "Healthcare occupancy recovery offsets new liquidity factor." },
];

const directionStyles: Record<MethodologyFactor["direction"], string> = {
  tightened: "border-red-300/35 bg-red-500/10 text-red-100",
  relaxed: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100",
  neutral: "border-slate-400/35 bg-slate-500/10 text-slate-100",
};

export function MethodologyVersionDiff() {
  const [selectedFactorId, setSelectedFactorId] = useState(FACTORS[0].id);
  const [rescored, setRescored] = useState(false);
  const selectedFactor = FACTORS.find((factor) => factor.id === selectedFactorId) ?? FACTORS[0];

  const aggregateShift = useMemo(() => {
    const base = DEALS.reduce((sum, deal) => sum + deal.currentScore, 0) / DEALS.length;
    const revised = DEALS.reduce((sum, deal) => sum + deal.revisedScore, 0) / DEALS.length;
    return { base, revised, delta: revised - base };
  }, []);

  return (
    <Card className="overflow-hidden border-amber-300/25 bg-[#120f07]/90 p-5 text-slate-100 shadow-[0_0_42px_rgba(245,158,11,0.10)]">
      <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-amber-200">
            <GitCompareArrows size={14} /> Methodology version diff · rescoring lab
          </p>
          <h2 className="mt-2 font-mono text-lg font-semibold uppercase tracking-[0.05em] text-white">
            Factor changes and affected-deal impact
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Compares prior and revised agency criteria, then simulates deal-level score movement so the Rating Room can update memos and route approvals.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-right">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Portfolio score shift</p>
          <p className={`mt-1 font-mono text-2xl font-semibold ${aggregateShift.delta >= 0 ? "text-emerald-200" : "text-red-200"}`}>
            {aggregateShift.delta >= 0 ? "+" : ""}{aggregateShift.delta.toFixed(1)} pts
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-2">
          {FACTORS.map((factor) => (
            <button
              key={factor.id}
              type="button"
              onClick={() => setSelectedFactorId(factor.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selectedFactor.id === factor.id ? "border-amber-300/55 bg-amber-400/12" : "border-white/10 bg-white/[0.035] hover:border-amber-300/35"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-sm font-semibold uppercase tracking-[0.04em] text-white">{factor.factor}</p>
                <Badge variant="outline" className={directionStyles[factor.direction]}>{factor.direction.toUpperCase()}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <span>{factor.previous}</span>
                <ArrowRight size={14} className="text-amber-200" />
                <span className="text-amber-100">{factor.revised}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-black/30 p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs text-slate-500">Selected factor</p>
              <p className="mt-1 text-sm font-semibold text-white">{selectedFactor.factor}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs text-slate-500">Weight delta</p>
              <p className="mt-1 text-sm font-semibold text-amber-100">{selectedFactor.weightDelta >= 0 ? "+" : ""}{selectedFactor.weightDelta} pts</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs text-slate-500">Rescore state</p>
              <p className={rescored ? "mt-1 text-sm font-semibold text-emerald-200" : "mt-1 text-sm font-semibold text-amber-200"}>{rescored ? "UPDATED" : "PENDING"}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {DEALS.map((deal) => {
              const delta = deal.revisedScore - deal.currentScore;
              return (
                <div key={deal.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold uppercase tracking-[0.04em] text-white">{deal.deal}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{deal.memoImpact}</p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <span className="text-slate-400">{deal.currentScore}</span>
                      <ArrowRight size={13} className="text-slate-500" />
                      <span className={delta >= 0 ? "text-emerald-200" : "text-red-200"}>{rescored ? deal.revisedScore : "--"}</span>
                      {delta >= 0 ? <TrendingUp size={14} className="text-emerald-300" /> : <TrendingDown size={14} className="text-red-300" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={() => setRescored(true)} className="mt-5 w-full bg-amber-600 text-white hover:bg-amber-500">
            {rescored ? <RefreshCw className="mr-2 h-4 w-4" /> : <Calculator className="mr-2 h-4 w-4" />}
            {rescored ? "Re-run Methodology Rescore" : "Run Methodology Rescore"}
          </Button>
          {rescored && (
            <p className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
              Rescore complete. Deal impacts are ready for Rating, Compliance, and Admin approval queues.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export { MethodologyVersionDiff as default };
