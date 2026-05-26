import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity, TrendingUp, TrendingDown, Minus, Radio, Zap,
  BarChart3, MapPin, Building2, FileText, Shield, Clock,
  RefreshCw, ChevronRight, AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────

interface SignalEvent {
  id: string;
  signal_type: string;
  category: string;
  source: string;
  value: number | null;
  direction: string | null;
  confidence: number | null;
  severity: string;
  state: string | null;
  county: string | null;
  market: string | null;
  deal_id: string | null;
  entity_name: string | null;
  status: string;
  source_ref: string | null;
  payload: Record<string, unknown>;
  captured_at: string;
  created_at: string;
}

interface VectorSnapshot {
  id: string;
  composite_score: number;
  recommendation: string;
  signals_used: Record<string, unknown>;
  put_risk_level: string | null;
  reasoning: string[] | null;
  estimated_savings: number | null;
  created_at: string;
}

interface StatsData {
  total: number;
  by_category: Record<string, number>;
  by_type: Record<string, number>;
  by_source: Record<string, number>;
}

// ── Helpers ────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  macro_market: "Macro Market",
  deal_sourcing: "Deal Sourcing",
  regulatory: "Regulatory",
  property: "Property",
  entity: "Entity",
};

const TYPE_ICONS: Record<string, typeof Activity> = {
  rate_change: TrendingUp,
  yield_curve: BarChart3,
  market_snapshot: Radio,
  permit_filed: Building2,
  ucc_filing: FileText,
  land_transfer: MapPin,
  edgar_filing: FileText,
  emma_filing: FileText,
  webhook_event: Zap,
};

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  low: "border-blue-400/30 bg-blue-500/10 text-blue-300",
  medium: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  high: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  critical: "border-red-400/30 bg-red-500/10 text-red-300",
};

const DIRECTION_STYLES: Record<string, { icon: typeof Activity; color: string }> = {
  bullish: { icon: TrendingUp, color: "text-emerald-400" },
  positive: { icon: TrendingUp, color: "text-emerald-400" },
  bearish: { icon: TrendingDown, color: "text-red-400" },
  negative: { icon: TrendingDown, color: "text-red-400" },
  neutral: { icon: Minus, color: "text-slate-400" },
};

const REC_STYLES: Record<string, string> = {
  execute_call: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  call_eligible: "border-cyan-400/40 bg-cyan-500/15 text-cyan-300",
  monitor: "border-amber-400/40 bg-amber-500/15 text-amber-300",
  hold: "border-slate-400/40 bg-slate-500/15 text-slate-300",
  put_alert: "border-red-400/40 bg-red-500/15 text-red-300",
};

const PUT_RISK_STYLES: Record<string, string> = {
  LOW: "text-emerald-400",
  MEDIUM: "text-amber-400",
  HIGH: "text-orange-400",
  CRITICAL: "text-red-400",
};

function formatValue(value: number | null, signalType: string): string {
  if (value === null) return "—";
  if (signalType === "permit_filed" || signalType === "land_transfer" || value > 100000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (signalType === "yield_curve") return `${value.toFixed(0)}bps`;
  return value.toFixed(2);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

// ── Signal Card ────────────────────────────────────────────────

function SignalCard({ signal }: { signal: SignalEvent }) {
  const Icon = TYPE_ICONS[signal.signal_type] || Activity;
  const dirStyle = signal.direction ? DIRECTION_STYLES[signal.direction] : null;
  const DirIcon = dirStyle?.icon || Minus;
  const categoryColor = signal.category === "macro_market"
    ? "border-cyan-300/20 bg-cyan-400/8 text-cyan-200"
    : signal.category === "deal_sourcing"
    ? "border-emerald-300/20 bg-emerald-400/8 text-emerald-200"
    : signal.category === "regulatory"
    ? "border-violet-300/20 bg-violet-400/8 text-violet-200"
    : "border-slate-300/20 bg-slate-400/8 text-slate-200";

  return (
    <div className="rounded-xl border border-white/8 bg-black/30 p-3.5 transition hover:border-white/15 hover:bg-black/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon size={13} className="text-cyan-300 shrink-0" />
            <span className="font-mono text-xs font-semibold text-white truncate">
              {signal.signal_type.replace(/_/g, " ")}
            </span>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.5rem] uppercase ${categoryColor}`}>
              {CATEGORY_LABELS[signal.category] || signal.category}
            </span>
            <span className={`rounded-full border px-1.5 py-0.5 font-mono text-[0.5rem] uppercase ${SEVERITY_STYLES[signal.severity] || SEVERITY_STYLES.info}`}>
              {signal.severity}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-3 font-mono text-[0.62rem] text-slate-500">
            <span className="text-slate-400">{signal.source}</span>
            {signal.state && (
              <span><MapPin size={10} className="inline" /> {signal.state}{signal.county ? `, ${signal.county}` : ""}</span>
            )}
            {signal.entity_name && (
              <span className="text-slate-300 truncate max-w-[180px]">{signal.entity_name}</span>
            )}
            {signal.source_ref && (
              <span className="text-slate-600 truncate max-w-[140px]">{signal.source_ref}</span>
            )}
          </div>

          {signal.payload?.description && (
            <p className="mt-1.5 text-[0.7rem] text-slate-400 line-clamp-1">
              {String(signal.payload.description)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {signal.value !== null && (
            <span className="font-mono text-sm font-bold text-white">
              {formatValue(signal.value, signal.signal_type)}
            </span>
          )}
          {dirStyle && <DirIcon size={14} className={dirStyle.color} />}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[0.5rem] text-slate-600">
          <Clock size={9} className="inline mr-0.5" />
          {timeAgo(signal.captured_at)}
        </span>
        {signal.confidence !== null && (
          <span className="font-mono text-[0.5rem] text-slate-500">
            conf: {(signal.confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ── Vector Snapshot Panel ──────────────────────────────────────

function VectorPanel({ snapshot }: { snapshot: VectorSnapshot | null }) {
  if (!snapshot) {
    return (
      <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
        <h3 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-500 mb-3">
          Vector Agent
        </h3>
        <p className="text-sm text-slate-500">No scoring data yet. Poll FRED to generate.</p>
      </div>
    );
  }

  const score = Number(snapshot.composite_score);
  const rec = snapshot.recommendation?.toLowerCase() || "monitor";
  const recStyle = REC_STYLES[rec] || REC_STYLES.monitor;
  const putStyle = PUT_RISK_STYLES[snapshot.put_risk_level || "LOW"] || PUT_RISK_STYLES.LOW;

  const scoreColor = score >= 82 ? "text-emerald-400" : score >= 65 ? "text-cyan-400" : score >= 45 ? "text-amber-400" : score >= 25 ? "text-slate-300" : "text-red-400";
  const arcPct = score / 100;

  return (
    <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-500">
          Vector Agent — Call/Put Radar
        </h3>
        <span className="font-mono text-[0.5rem] text-slate-600">{timeAgo(snapshot.created_at)}</span>
      </div>

      {/* Score gauge */}
      <div className="flex items-center gap-6 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${arcPct * 264} 264`}
              strokeLinecap="round"
              className={scoreColor}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono text-lg font-bold ${scoreColor}`}>{score.toFixed(0)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <span className={`inline-block rounded-full border px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider ${recStyle}`}>
              {rec.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[0.62rem]">
            <span className="text-slate-400">Put Risk: <span className={`font-semibold ${putStyle}`}>{snapshot.put_risk_level || "—"}</span></span>
            {snapshot.estimated_savings && Number(snapshot.estimated_savings) > 0 && (
              <span className="text-slate-400">Savings: <span className="text-emerald-400 font-semibold">{formatMoney(Number(snapshot.estimated_savings))}</span></span>
            )}
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {snapshot.reasoning && snapshot.reasoning.length > 0 && (
        <div className="space-y-1">
          {snapshot.reasoning.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-[0.68rem] text-slate-400">
              <ChevronRight size={11} className="text-cyan-400/60 mt-0.5 shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stats Panel ────────────────────────────────────────────────

function StatsPanel({ stats }: { stats: StatsData | null }) {
  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
      <h3 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-500 mb-3">
        Signal Inventory
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-white">{stats.total}</p>
          <p className="font-mono text-[0.5rem] uppercase text-slate-500">Total</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-cyan-400">{stats.by_category?.macro_market || 0}</p>
          <p className="font-mono text-[0.5rem] uppercase text-slate-500">Market</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-emerald-400">{stats.by_category?.deal_sourcing || 0}</p>
          <p className="font-mono text-[0.5rem] uppercase text-slate-500">Deal Source</p>
        </div>
      </div>

      {/* By type breakdown */}
      <div className="space-y-1.5">
        <p className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-slate-600">By Type</p>
        {Object.entries(stats.by_type || {}).map(([type, count]) => {
          const Icon = TYPE_ICONS[type] || Activity;
          return (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={11} className="text-slate-500" />
                <span className="font-mono text-[0.62rem] text-slate-400">{type.replace(/_/g, " ")}</span>
              </div>
              <span className="font-mono text-[0.62rem] font-semibold text-white">{count}</span>
            </div>
          );
        })}
      </div>

      {/* By source breakdown */}
      <div className="mt-3 space-y-1.5">
        <p className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-slate-600">By Source</p>
        {Object.entries(stats.by_source || {}).map(([source, count]) => (
          <div key={source} className="flex items-center justify-between">
            <span className="font-mono text-[0.62rem] text-slate-400">{source}</span>
            <span className="font-mono text-[0.62rem] font-semibold text-white">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function SignalIntelligenceFeed() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [polling, setPolling] = useState(false);
  const queryClient = useQueryClient();

  const signalsQuery = trpc.signals.query.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const statsQuery = trpc.signals.stats.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const vectorQuery = trpc.signals.vectorLatest.useQuery(undefined, {
    retry: false,
  });
  const pollFred = trpc.signals.pollFred.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      setPolling(false);
    },
    onError: () => setPolling(false),
  });

  const allSignals: SignalEvent[] = (signalsQuery.data as any)?.signals || [];
  const stats: StatsData | null = (statsQuery.data as any) || null;
  const vector: VectorSnapshot | null = (vectorQuery.data as any) || null;

  const filteredSignals = activeCategory === "all"
    ? allSignals
    : allSignals.filter((s) => s.category === activeCategory);

  const handlePollFred = () => {
    setPolling(true);
    pollFred.mutate(undefined as any);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10">
              <Activity size={18} className="text-cyan-300" />
            </div>
            <div>
              <h1 className="font-[Cormorant_Garamond] text-2xl font-semibold tracking-wide text-white">
                Signal Intelligence
              </h1>
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-slate-500">
                Live Market & Deal Signal Feed
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {signalsQuery.isFetching && (
            <span className="font-mono text-[0.5rem] text-cyan-400/60 flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" /> syncing
            </span>
          )}
          <Button
            onClick={handlePollFred}
            disabled={polling}
            className="h-8 gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 font-mono text-[0.65rem] uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
            variant="ghost"
          >
            {polling ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
            {polling ? "Polling..." : "Poll FRED"}
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Signal feed (2 cols) */}
        <div className="lg:col-span-2">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <div className="flex items-center justify-between mb-3">
              <TabsList className="h-8 bg-white/5 border border-white/8 rounded-lg p-0.5">
                <TabsTrigger value="all" className="h-7 rounded-md px-3 font-mono text-[0.58rem] uppercase tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-500">
                  All ({allSignals.length})
                </TabsTrigger>
                <TabsTrigger value="macro_market" className="h-7 rounded-md px-3 font-mono text-[0.58rem] uppercase tracking-wider data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-200 text-slate-500">
                  Market
                </TabsTrigger>
                <TabsTrigger value="deal_sourcing" className="h-7 rounded-md px-3 font-mono text-[0.58rem] uppercase tracking-wider data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200 text-slate-500">
                  Deal Source
                </TabsTrigger>
                <TabsTrigger value="regulatory" className="h-7 rounded-md px-3 font-mono text-[0.58rem] uppercase tracking-wider data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-200 text-slate-500">
                  Regulatory
                </TabsTrigger>
              </TabsList>
              <span className="font-mono text-[0.5rem] text-slate-600">
                auto-refresh 30s
              </span>
            </div>

            <TabsContent value={activeCategory} forceMount className="mt-0">
              {signalsQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw size={20} className="animate-spin text-cyan-400/40" />
                </div>
              ) : filteredSignals.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-black/20 p-12 text-center">
                  <AlertTriangle size={24} className="mx-auto text-slate-600 mb-2" />
                  <p className="font-mono text-sm text-slate-500">No signals in this category</p>
                  <p className="font-mono text-[0.6rem] text-slate-600 mt-1">
                    Hit "Poll FRED" to ingest live market data
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {filteredSignals.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Vector + Stats */}
        <div className="space-y-5">
          <VectorPanel snapshot={vector} />
          <StatsPanel stats={stats} />
        </div>
      </div>
    </div>
  );
}
