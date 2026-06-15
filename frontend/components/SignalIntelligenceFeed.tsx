"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Activity, TrendingUp, TrendingDown, Minus, Radio, Zap,
  BarChart3, Building2, FileText, Shield, Clock,
  RefreshCw, ChevronRight, AlertTriangle, CheckCircle,
  Eye, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const API = process.env.NEXT_PUBLIC_API_URL || "https://web-production-5e8af.up.railway.app";

// ── Types ──────────────────────────────────────────────────────

interface DealSignal {
  id: string;
  name?: string;
  entity?: string;
  desk: "ma" | "cre" | "bond_desk";
  grade: "HOT" | "WARM" | "COLD";
  amount_usd?: number;
  naics?: string;
  state?: string;
  source?: string;
  status?: string;
  actioned_at?: string;
  score?: number;
  rationale?: string[];
}

interface SignalMeta {
  total: number;
  hot: number;
  warm: number;
  run_at: string | null;
  next_refresh: string;
}

interface SignalStats {
  last_run: string | null;
  total_qualified: number;
  hot: number;
  warm: number;
  cold: number;
  by_desk: { ma: number; cre: number; bond_desk: number };
  edgar_sources: number;
  permit_sources: number;
}

interface NodeStatus {
  node1: { name: string; status: string; last_scan: string | null; sources: string[] };
  node2: { name: string; status: string; benchmarks: string[] };
  node3: { name: string; status: string; desks: string[] };
}

interface VectorSnapshot {
  captured_at: string;
  signals: {
    treasury_10yr_pct: number;
    sofr_pct: number;
    credit_spread_ig_bps: number;
    credit_spread_hy_bps: number;
    tlt_price: number;
    vix: number;
    refi_market_access: string;
  };
  vector_score: number;
  vector_recommendation: string;
  apex_short_active: boolean;
}

// ── Helpers ────────────────────────────────────────────────────

const GRADE_STYLES: Record<string, string> = {
  HOT: "border-red-400/40 bg-red-500/10 text-red-300",
  WARM: "border-[#C4A048]/40 bg-[#C4A048]/10 text-[#C4A048]",
  COLD: "border-[#7A9A82]/30 bg-[#7A9A82]/10 text-[#7A9A82]",
};

const DESK_LABELS: Record<string, string> = {
  ma: "M&A",
  cre: "CRE",
  bond_desk: "Bond Desk",
};

const DESK_COLORS: Record<string, string> = {
  ma: "border-violet-300/20 bg-violet-400/8 text-violet-200",
  cre: "border-emerald-300/20 bg-emerald-400/8 text-emerald-200",
  bond_desk: "border-[#C4A048]/20 bg-[#C4A048]/8 text-[#E8C87A]",
};

const REC_STYLES: Record<string, string> = {
  execute_call: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  call_eligible: "border-[#C4A048]/40 bg-[#C4A048]/15 text-[#C4A048]",
  monitor: "border-amber-400/40 bg-amber-500/15 text-amber-300",
  hold: "border-[#2D6B3D]/40 bg-[#2D6B3D]/15 text-[#EDE8DC]",
  put_alert: "border-red-400/40 bg-red-500/15 text-red-300",
};

const REC_LABELS: Record<string, string> = {
  execute_call: "EXECUTE CALL",
  call_eligible: "CALL ELIGIBLE",
  monitor: "MONITOR",
  hold: "HOLD",
  put_alert: "PUT ALERT",
};

function fmtAmount(n?: number): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Signal Card ────────────────────────────────────────────────

function SignalCard({ signal, onAction }: { signal: DealSignal; onAction: (id: string, action: "approve" | "pass" | "watch") => void }) {
  const gradeStyle = GRADE_STYLES[signal.grade] || GRADE_STYLES.COLD;
  const deskStyle = DESK_COLORS[signal.desk] || DESK_COLORS.bond_desk;
  const entityName = signal.entity || signal.name || "Unknown Entity";

  return (
    <div className="rounded-xl border border-white/8 bg-black/30 p-3.5 transition hover:border-white/15 hover:bg-black/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Activity size={13} className="text-[#C4A048] shrink-0" />
            <span className="font-mono text-xs font-semibold text-white truncate max-w-[220px]">
              {entityName}
            </span>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.5rem] uppercase ${deskStyle}`}>
              {DESK_LABELS[signal.desk]}
            </span>
            <span className={`rounded-full border px-1.5 py-0.5 font-mono text-[0.5rem] uppercase ${gradeStyle}`}>
              {signal.grade}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-3 font-mono text-[0.62rem] text-[#7A9A82] flex-wrap">
            {signal.naics && <span>NAICS {signal.naics}</span>}
            {signal.state && <span className="text-[#EDE8DC]">{signal.state}</span>}
            {signal.source && <span className="text-[#7A9A82]">{signal.source}</span>}
          </div>

          {signal.rationale && signal.rationale.length > 0 && (
            <p className="mt-1.5 text-[0.7rem] text-[#7A9A82] line-clamp-1">
              {signal.rationale[0]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {signal.amount_usd != null && (
            <span className="font-mono text-sm font-bold text-white">
              {fmtAmount(signal.amount_usd)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {signal.status === "approved" ? (
            <span className="font-mono text-[0.5rem] text-emerald-400 flex items-center gap-1">
              <CheckCircle size={9} /> approved
            </span>
          ) : signal.status === "passed" ? (
            <span className="font-mono text-[0.5rem] text-red-400 flex items-center gap-1">
              <ThumbsDown size={9} /> passed
            </span>
          ) : signal.status === "watching" ? (
            <span className="font-mono text-[0.5rem] text-amber-300 flex items-center gap-1">
              <Eye size={9} /> watching
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAction(signal.id, "approve")}
                className="rounded px-1.5 py-0.5 font-mono text-[0.5rem] uppercase border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10 transition-colors"
              >approve</button>
              <button
                onClick={() => onAction(signal.id, "watch")}
                className="rounded px-1.5 py-0.5 font-mono text-[0.5rem] uppercase border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 transition-colors"
              >watch</button>
              <button
                onClick={() => onAction(signal.id, "pass")}
                className="rounded px-1.5 py-0.5 font-mono text-[0.5rem] uppercase border border-white/10 text-[#7A9A82] hover:bg-white/5 transition-colors"
              >pass</button>
            </div>
          )}
        </div>
        <span className="font-mono text-[0.5rem] text-[#7A9A82]">
          <Clock size={9} className="inline mr-0.5" />
          {timeAgo(signal.actioned_at || null)}
        </span>
      </div>
    </div>
  );
}

// ── Vector Market Panel ────────────────────────────────────────

function VectorPanel({ snapshot }: { snapshot: VectorSnapshot | null }) {
  if (!snapshot) {
    return (
      <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
        <h3 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#7A9A82] mb-3">
          Vector Agent
        </h3>
        <p className="text-sm text-[#7A9A82]">No market data. Fetching...</p>
      </div>
    );
  }

  const score = snapshot.vector_score;
  const rec = snapshot.vector_recommendation?.toLowerCase() || "monitor";
  const recStyle = REC_STYLES[rec] || REC_STYLES.monitor;
  const scoreColor = score >= 70 ? "text-emerald-400" : score >= 50 ? "text-[#C4A048]" : "text-red-400";
  const arcPct = score / 100;
  const sig = snapshot.signals;

  return (
    <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#7A9A82]">
          Vector — Market Radar
        </h3>
        <span className="font-mono text-[0.5rem] text-[#7A9A82]">{timeAgo(snapshot.captured_at)}</span>
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
            <span className={`font-mono text-lg font-bold ${scoreColor}`}>{score}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <span className={`inline-block rounded-full border px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider ${recStyle}`}>
            {REC_LABELS[rec] ?? rec.replace(/_/g, " ")}
          </span>
          <div className="font-mono text-[0.62rem] text-[#7A9A82]">
            Apex Short: <span className={snapshot.apex_short_active ? "text-red-400" : "text-[#7A9A82]"}>
              {snapshot.apex_short_active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </div>
      </div>

      {/* Key rates from live FRED */}
      {sig && (
        <div className="space-y-1.5 border-t border-white/5 pt-3">
          <p className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#7A9A82] mb-2">Live Rates</p>
          {[
            { label: "10YR Treasury", value: `${sig.treasury_10yr_pct?.toFixed(2)}%` },
            { label: "SOFR", value: `${sig.sofr_pct?.toFixed(2)}%` },
            { label: "IG Spread", value: `${sig.credit_spread_ig_bps}bps` },
            { label: "VIX", value: sig.vix?.toFixed(1) },
            { label: "TLT", value: `$${sig.tlt_price?.toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="font-mono text-[0.62rem] text-[#7A9A82]">{label}</span>
              <span className="font-mono text-[0.62rem] font-semibold text-[#C4A048]">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stats Panel ────────────────────────────────────────────────

function StatsPanel({ stats, nodes }: { stats: SignalStats | null; nodes: NodeStatus | null }) {
  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-black/30 p-5 space-y-4">
      <h3 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#7A9A82]">
        Signal Inventory
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-white">{stats.total_qualified}</p>
          <p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Total</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-red-400">{stats.hot}</p>
          <p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Hot</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-[#C4A048]">{stats.warm}</p>
          <p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Warm</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#7A9A82]">By Desk</p>
        {Object.entries(stats.by_desk || {}).map(([desk, count]) => (
          <div key={desk} className="flex items-center justify-between">
            <span className="font-mono text-[0.62rem] text-[#7A9A82]">{DESK_LABELS[desk] || desk}</span>
            <span className="font-mono text-[0.62rem] font-semibold text-white">{count}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t border-white/5 pt-3">
        <p className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#7A9A82]">Sources</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.62rem] text-[#7A9A82]">EDGAR</span>
          <span className="font-mono text-[0.62rem] font-semibold text-white">{stats.edgar_sources}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.62rem] text-[#7A9A82]">Permits</span>
          <span className="font-mono text-[0.62rem] font-semibold text-white">{stats.permit_sources}</span>
        </div>
        {stats.last_run && (
          <p className="font-mono text-[0.5rem] text-[#7A9A82] mt-1">
            Last run: {timeAgo(stats.last_run)}
          </p>
        )}
      </div>

      {/* Node pipeline status */}
      {nodes && (
        <div className="space-y-1.5 border-t border-white/5 pt-3">
          <p className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#7A9A82]">Pipeline Nodes</p>
          {[nodes.node1, nodes.node2, nodes.node3].map((node, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="font-mono text-[0.62rem] text-[#7A9A82]">{node.name}</span>
              <span className={`font-mono text-[0.5rem] uppercase ${node.status === "active" ? "text-emerald-400" : "text-red-400"}`}>
                {node.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function SignalIntelligenceFeed() {
  const [activeDesk, setActiveDesk] = useState("all");
  const [activeGrade, setActiveGrade] = useState("all");
  const [signals, setSignals] = useState<DealSignal[]>([]);
  const [meta, setMeta] = useState<SignalMeta | null>(null);
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [nodes, setNodes] = useState<NodeStatus | null>(null);
  const [vector, setVector] = useState<VectorSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastFetch, setLastFetch] = useState<string>("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sigRes, statsRes, nodeRes, vectorRes] = await Promise.all([
        fetch(`${API}/api/signals`),
        fetch(`${API}/api/signals/stats`),
        fetch(`${API}/api/signals/node-status`),
        fetch(`${API}/api/market/signals/latest`),
      ]);
      const [sigJson, statsJson, nodeJson, vectorJson] = await Promise.all([
        sigRes.json(),
        statsRes.json(),
        nodeRes.json(),
        vectorRes.json(),
      ]);
      if (sigJson.success) {
        setSignals(sigJson.data?.signals || []);
        setMeta(sigJson.data?.meta || null);
      }
      if (statsJson.success) setStats(statsJson.data);
      if (nodeJson.success) setNodes(nodeJson.data);
      if (vectorJson.success) setVector(vectorJson.data);
      setLastFetch(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${API}/api/signals/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_signals: 50 }),
      });
      const json = await res.json();
      if (json.success) {
        setSignals(json.data?.signals || []);
        setMeta(json.data?.meta || null);
        setLastFetch(new Date().toLocaleTimeString());
      }
    } finally {
      setScanning(false);
    }
  };

  const handleAction = async (signalId: string, action: "approve" | "pass" | "watch") => {
    try {
      const res = await fetch(`${API}/api/signals/${signalId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setSignals(prev => prev.map(s =>
          s.id === signalId
            ? { ...s, status: json.data.status, actioned_at: new Date().toISOString() }
            : s
        ));
      }
    } catch { /* noop */ }
  };

  // Client-side filter
  const filteredSignals = signals.filter(s => {
    const deskMatch = activeDesk === "all" || s.desk === activeDesk;
    const gradeMatch = activeGrade === "all" || s.grade === activeGrade;
    return deskMatch && gradeMatch;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#C4A048]/20 bg-[#C4A048]/10">
              <Activity size={18} className="text-[#C4A048]" />
            </div>
            <div>
              <h1 className="font-[Cormorant_Garamond] text-2xl font-semibold tracking-wide text-white">
                Signal Intelligence
              </h1>
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-[#7A9A82]">
                Three-Node Pipeline · EDGAR + Census Permits · JP Morgan Benchmarks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastFetch && <span className="font-mono text-[0.5rem] text-[#7A9A82]">Updated {lastFetch}</span>}
          {loading && !scanning && (
            <span className="font-mono text-[0.5rem] text-[#C4A048]/60 flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" /> syncing
            </span>
          )}
          <Button
            onClick={loadAll}
            disabled={loading}
            className="h-8 gap-1.5 rounded-lg border border-[#C4A048]/30 bg-[#C4A048]/10 px-3 font-mono text-[0.65rem] uppercase tracking-wider text-[#E8C87A] hover:bg-[#C4A048]/20 disabled:opacity-50"
            variant="ghost"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            onClick={handleScan}
            disabled={scanning}
            className="h-8 gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 font-mono text-[0.65rem] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
            variant="ghost"
          >
            {scanning ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
            {scanning ? "Scanning..." : "Force Scan"}
          </Button>
        </div>
      </div>

      {/* Meta bar */}
      {meta && (
        <div className="flex items-center gap-4 mb-4 font-mono text-[0.62rem]">
          <span className="text-[#7A9A82]">
            {meta.total} signals · <span className="text-red-400">{meta.hot} hot</span> · <span className="text-[#C4A048]">{meta.warm} warm</span>
          </span>
          {meta.run_at && <span className="text-[#7A9A82]">Pipeline ran {timeAgo(meta.run_at)}</span>}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Signal feed (2 cols) */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82] mr-1">Desk</span>
              {["all", "ma", "cre", "bond_desk"].map(d => (
                <button
                  key={d}
                  onClick={() => setActiveDesk(d)}
                  className={`h-7 rounded-md px-3 font-mono text-[0.58rem] uppercase tracking-wider transition-colors ${
                    activeDesk === d
                      ? "bg-white/10 text-white"
                      : "text-[#7A9A82] hover:text-white"
                  }`}
                >
                  {d === "all" ? "All" : DESK_LABELS[d]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82] mr-1">Grade</span>
              {["all", "HOT", "WARM", "COLD"].map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGrade(g)}
                  className={`h-7 rounded-md px-3 font-mono text-[0.58rem] uppercase tracking-wider transition-colors ${
                    activeGrade === g
                      ? g === "HOT" ? "bg-red-500/20 text-red-300"
                        : g === "WARM" ? "bg-[#C4A048]/20 text-[#E8C87A]"
                        : g === "COLD" ? "bg-[#7A9A82]/20 text-[#EDE8DC]"
                        : "bg-white/10 text-white"
                      : "text-[#7A9A82] hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <span className="font-mono text-[0.5rem] text-[#7A9A82] ml-auto">
              {filteredSignals.length} shown · auto-refresh 30s
            </span>
          </div>

          {/* Feed */}
          {loading && signals.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw size={20} className="animate-spin text-[#C4A048]/40" />
            </div>
          ) : filteredSignals.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-black/20 p-12 text-center">
              <AlertTriangle size={24} className="mx-auto text-[#7A9A82] mb-2" />
              <p className="font-mono text-sm text-[#7A9A82]">No signals in pipeline</p>
              <p className="font-mono text-[0.6rem] text-[#7A9A82] mt-1">
                Hit "Force Scan" to run the EDGAR + Permits pipeline
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
              {filteredSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} onAction={handleAction} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Vector + Stats */}
        <div className="space-y-5">
          <VectorPanel snapshot={vector} />
          <StatsPanel stats={stats} nodes={nodes} />
        </div>
      </div>
    </div>
  );
}
