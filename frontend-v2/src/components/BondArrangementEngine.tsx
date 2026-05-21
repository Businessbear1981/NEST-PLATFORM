import { useState, useMemo, useCallback } from "react";
import { Layers, Zap } from "lucide-react";
import BondArrangementCanvas from "./BondArrangementCanvas";
import BondEconomicsPanel from "./BondEconomicsPanel";
import BernardBondNarrator from "./BernardBondNarrator";
import {
  DealInPool, BernardMessage, DEMO_DEAL_1, DEMO_DEAL_2,
  DEMO_SCENARIOS, DEMO_BERNARD_MESSAGES,
  calculatePoolEconomics, formatM,
} from "@/shared/bondArrangementDemo";

// ── Main Bond Desk Page ──────────────────────────────────────────

export default function BondArrangementEngine() {
  // State
  const [deals, setDeals] = useState<DealInPool[]>([
    { ...DEMO_DEAL_1 },
    { ...DEMO_DEAL_2 },
  ]);
  const [selectedBondId, setSelectedBondId] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState("base");
  const [bernardMessages, setBernardMessages] = useState<BernardMessage[]>([...DEMO_BERNARD_MESSAGES]);
  const [isBernardThinking, setIsBernardThinking] = useState(false);

  // Economics
  const economics = useMemo(() => calculatePoolEconomics(deals), [deals]);
  const baseEconomics = useMemo(() => calculatePoolEconomics([{ ...DEMO_DEAL_1 }, { ...DEMO_DEAL_2 }].filter(d => d.id === "deal_001")), []);

  // Apply scenario impact to economics
  const scenarioEconomics = useMemo(() => {
    const scenario = DEMO_SCENARIOS.find(s => s.id === activeScenario);
    if (!scenario || !scenario.economicsImpact) return economics;
    return { ...economics, ...scenario.economicsImpact };
  }, [economics, activeScenario]);

  // Handlers
  const handleToggleDeal = useCallback((dealId: string) => {
    setDeals(prev => prev.map(d =>
      d.id === dealId ? { ...d, inPool: !d.inPool } : d
    ));

    // Bernard narrates
    const deal = deals.find(d => d.id === dealId);
    if (deal) {
      setIsBernardThinking(true);
      setTimeout(() => {
        const adding = !deal.inPool;
        const newMsg: BernardMessage = {
          id: `bm_${Date.now()}`,
          timestamp: new Date().toISOString(),
          context: "pool_update",
          tone: adding ? "celebrate" : "warn",
          message: adding
            ? `${deal.name} added to the pool. Total commitment now ${formatM(deals.filter(d => d.inPool || d.id === dealId).reduce((s, d) => s + d.totalCommitment, 0))} across ${deals.filter(d => d.inPool || d.id === dealId).length} deals and ${deals.filter(d => d.inPool || d.id === dealId).flatMap(d => d.miniBonds).length} mini-bonds. The capital stack just got deeper — more diversification, better risk distribution. Your blended coupon will shift based on the new deal's rating mix.`
            : `${deal.name} removed from the pool. You're back to ${formatM(deals.filter(d => d.inPool && d.id !== dealId).reduce((s, d) => s + d.totalCommitment, 0))}. Removing a deal concentrates risk — make sure your remaining pool has sufficient diversification for your target investors.`,
        };
        setBernardMessages(prev => [...prev, newMsg]);
        setIsBernardThinking(false);
      }, 1500);
    }
  }, [deals]);

  const handleScenarioChange = useCallback((scenarioId: string) => {
    setActiveScenario(scenarioId);

    // Bernard narrates the scenario
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario && scenarioId !== "base") {
      setIsBernardThinking(true);
      setTimeout(() => {
        const newMsg: BernardMessage = {
          id: `bm_scenario_${Date.now()}`,
          timestamp: new Date().toISOString(),
          context: "scenario_change",
          tone: scenarioId.includes("delay") || scenarioId.includes("up") ? "warn" : "recommend",
          message: scenario.bernardSays,
        };
        setBernardMessages(prev => [...prev, newMsg]);
        setIsBernardThinking(false);
      }, 2000);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
            <Layers size={17} /> GENIE — Bond Arrangement Engine
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Modular structuring. CMBS-style pooling. Rate arbitrage. 45-day close.
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold text-amber-100">{formatM(scenarioEconomics.totalCommitment)}</p>
          <p className="font-mono text-[0.56rem] text-slate-500 uppercase">Total Pool</p>
        </div>
      </div>

      {/* Tagline */}
      <div className="rounded-xl border border-amber-300/15 bg-amber-400/5 px-4 py-2 flex items-center gap-3">
        <Zap size={14} className="text-amber-300" />
        <p className="font-mono text-[0.68rem] text-amber-200/80">
          Structure any debt vehicle in 45 days. Modular pieces that retire independently. Rate arbitrage across tenors. Every piece breathes on its own.
        </p>
      </div>

      {/* Main Layout: Canvas + Bernard side by side */}
      <div className="grid grid-cols-12 gap-4">
        {/* Canvas + Economics: 9 cols */}
        <div className="col-span-9 space-y-4">
          <BondArrangementCanvas
            deals={deals}
            onToggleDealInPool={handleToggleDeal}
            onSelectMiniBond={setSelectedBondId}
            selectedBondId={selectedBondId}
          />
          <BondEconomicsPanel
            economics={scenarioEconomics}
            baseEconomics={baseEconomics}
            scenarios={DEMO_SCENARIOS}
            activeScenario={activeScenario}
            onScenarioChange={handleScenarioChange}
          />
        </div>

        {/* Bernard Narrator: 3 cols */}
        <div className="col-span-3 h-[calc(100vh-200px)] sticky top-4">
          <BernardBondNarrator
            messages={bernardMessages}
            isThinking={isBernardThinking}
          />
        </div>
      </div>
    </div>
  );
}
