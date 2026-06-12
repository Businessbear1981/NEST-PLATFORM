"use client";
import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Filter, RadioTower, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type ReconSeverity = "watch" | "upgrade" | "downgrade" | "affirm";

export interface RatingReconItem {
  id: string;
  issuer: string;
  sector: string;
  action: ReconSeverity;
  previousRating: string;
  currentRating: string;
  outlook: "positive" | "stable" | "negative";
  probability: number;
  affectedDeals: string[];
  evidence: string;
  timestamp: string;
}

export const moodysReconItems: RatingReconItem[] = [
  {
    id: "moodys-001",
    issuer: "NEST Mixed-Use Portfolio",
    sector: "Mixed-Use",
    action: "affirm",
    previousRating: "Baa1",
    currentRating: "Baa1",
    outlook: "stable",
    probability: 82,
    affectedDeals: ["Broadway Commons", "Hudson Retail Spine"],
    evidence: "Occupancy remains above 93%; rent roll concentration is within methodology tolerance.",
    timestamp: "2026-05-07 09:42 ET",
  },
  {
    id: "moodys-002",
    issuer: "NEST Office Conversion Trust",
    sector: "Office",
    action: "watch",
    previousRating: "Baa2",
    currentRating: "Baa2",
    outlook: "negative",
    probability: 68,
    affectedDeals: ["Canal Adaptive Reuse", "Park Avenue Refi"],
    evidence: "New methodology pressure: office vacancy stress threshold moves from 18% to 15%.",
    timestamp: "2026-05-07 10:16 ET",
  },
  {
    id: "moodys-003",
    issuer: "NEST Senior Living CCRC",
    sector: "Healthcare",
    action: "upgrade",
    previousRating: "Baa3",
    currentRating: "Baa2",
    outlook: "positive",
    probability: 74,
    affectedDeals: ["CCRC Expansion Phase II"],
    evidence: "Debt service coverage improved to 1.42x after stabilized occupancy and reserve funding.",
    timestamp: "2026-05-07 10:31 ET",
  },
];

const actionStyles: Record<ReconSeverity, string> = {
  upgrade: "border-emerald-300/35 bg-emerald-400/12 text-emerald-100",
  affirm: "border-[#C4A048]/35 bg-[#C4A048]/12 text-[#EDE8DC]",
  watch: "border-amber-300/40 bg-amber-300/12 text-amber-100",
  downgrade: "border-red-400/35 bg-red-500/12 text-red-100",
};

export function MoodysReconFeed() {
  const [filter, setFilter] = useState<"all" | ReconSeverity>("all");
  const [selectedId, setSelectedId] = useState(moodysReconItems[0].id);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const visibleItems = useMemo(
    () => moodysReconItems.filter((item) => filter === "all" || item.action === filter),
    [filter]
  );
  const selected = moodysReconItems.find((item) => item.id === selectedId) ?? moodysReconItems[0];

  const acknowledgeSelected = () => {
    setAcknowledged((current) => (current.includes(selected.id) ? current : [...current, selected.id]));
  };

  return (
    <Card className="overflow-hidden border-[#C4A048]/25 bg-[#07101a]/90 p-5 text-[#EDE8DC] shadow-[0_0_42px_rgba(196,160,72,0.10)]">
      <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#E8C87A]">
            <RadioTower size={14} /> Moody's recon feed · live-demo subscription
          </p>
          <h2 className="mt-2 font-mono text-lg font-semibold uppercase tracking-[0.05em] text-white">
            Rating action monitor
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#7A9A82]">
            Simulates a governed recon stream, maps each agency event to affected deals, and requires desk acknowledgement before routing to credit memo updates.
          </p>
        </div>
        <Badge className="w-fit border border-[#C4A048]/30 bg-[#C4A048]/10 text-[#EDE8DC]">
          {acknowledged.length}/{moodysReconItems.length} acknowledged
        </Badge>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#7A9A82]">
          <Filter size={13} /> Filter
        </span>
        {(["all", "watch", "upgrade", "affirm", "downgrade"] as const).map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={filter === option ? "default" : "outline"}
            onClick={() => setFilter(option)}
            className={filter === option ? "bg-cyan-600 text-white hover:bg-cyan-500" : "border-[#1E4A2E] bg-black/20 text-[#EDE8DC] hover:border-[#C4A048]/45"}
          >
            {option.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-2">
          {visibleItems.map((item) => {
            const isSelected = item.id === selected.id;
            const isAcked = acknowledged.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isSelected ? "border-[#C4A048]/55 bg-[#C4A048]/12" : "border-white/10 bg-white/[0.035] hover:border-[#C4A048]/35"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold uppercase tracking-[0.04em] text-white">{item.issuer}</p>
                    <p className="mt-1 text-xs text-[#7A9A82]">{item.sector} · {item.timestamp}</p>
                  </div>
                  <Badge variant="outline" className={`${actionStyles[item.action]} whitespace-nowrap`}>
                    {item.action.toUpperCase()}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[#7A9A82]">{item.previousRating} → <strong className="text-[#E8C87A]">{item.currentRating}</strong></span>
                  <span className={isAcked ? "text-emerald-200" : "text-amber-200"}>{isAcked ? "ACKED" : "NEEDS REVIEW"}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#C4A048]/20 bg-black/30 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-mono text-lg font-semibold uppercase tracking-[0.05em] text-white">{selected.issuer}</h3>
              <p className="mt-1 text-sm text-[#7A9A82]">Outlook: {selected.outlook.toUpperCase()} · Confidence {selected.probability}%</p>
            </div>
            {selected.action === "upgrade" ? <TrendingUp className="text-emerald-300" /> : <Clock3 className="text-amber-300" />}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#E8C87A]">Agency evidence</p>
            <p className="mt-2 text-sm leading-6 text-[#EDE8DC]">{selected.evidence}</p>
          </div>
          <div className="mt-4">
            <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#7A9A82]">Affected deals</p>
            <div className="flex flex-wrap gap-2">
              {selected.affectedDeals.map((deal) => (
                <Badge key={deal} variant="secondary" className="bg-[#0D2218] text-[#EDE8DC]">{deal}</Badge>
              ))}
            </div>
          </div>
          <Button onClick={acknowledgeSelected} className="mt-5 w-full bg-emerald-600 text-white hover:bg-emerald-500">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Acknowledge Moody's Action
          </Button>
          {acknowledged.includes(selected.id) && (
            <p className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
              Action acknowledged and routed to Rating Room credit memo queue.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
