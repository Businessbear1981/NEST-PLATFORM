"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://web-production-5e8af.up.railway.app";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, TrendingUp, TrendingDown, Minus, Radio, Zap,
  BarChart3, MapPin, Building2, FileText, Shield, Clock,
  RefreshCw, ChevronLeft, ChevronRight, AlertTriangle,
  Eye, X, ExternalLink, Flag, Search, Filter,
  CheckCircle2, XCircle, ArrowRight, Link2, Brain,
  ChevronDown, Bell, Send,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

// ── Types ───────────────────────────────────────────────────────

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

interface StatsData {
  total: number;
  by_category: Record<string, number>;
  by_type: Record<string, number>;
  by_source: Record<string, number>;
}

interface VectorSnapshot {
  id: string;
  composite_score: number;
  recommendation: string;
  put_risk_level: string | null;
  reasoning: string[] | null;
  estimated_savings: number | null;
  created_at: string;
}

interface SignalAlert {
  id: string;
  alert_type: string;
  title: string;
  description: string | null;
  severity: string;
  signal_ids: string[];
  entity_name: string | null;
  market: string | null;
  state: string | null;
  status: string;
  created_at: string;
}

// ── Constants ───────────────────────────────────────────────────

const PAGE_SIZE = 20;
const POLL_INTERVAL = 30_000;
const LS_KEY = "eagleeye_last_seen_at";

const CATEGORIES = [
  { key: "all", label: "All Signals", color: "white" },
  { key: "deal_sourcing", label: "Deal Sourcing", color: "cyan" },
  { key: "regulatory", label: "Regulatory", color: "violet" },
  { key: "macro_market", label: "Macro", color: "amber" },
  { key: "property", label: "Property", color: "emerald" },
] as const;

const STATUS_OPTIONS = [
  { key: "all", label: "All", color: "text-[#EDE8DC]" },
  { key: "new", label: "New", color: "text-[#C4A048]" },
  { key: "reviewed", label: "Reviewed", color: "text-[#C4A048]" },
  { key: "actionable", label: "Actionable", color: "text-amber-300" },
  { key: "acted_on", label: "Acted On", color: "text-emerald-300" },
  { key: "dismissed", label: "Dismissed", color: "text-[#7A9A82]" },
] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: { label: "New", color: "text-[#C4A048]", bg: "bg-[#C4A048]/10", border: "border-[#C4A048]/25" },
  reviewed: { label: "Reviewed", color: "text-[#C4A048]", bg: "bg-[#C4A048]/10", border: "border-[#C4A048]/25" },
  actionable: { label: "Actionable", color: "text-amber-300", bg: "bg-amber-400/10", border: "border-amber-400/25" },
  acted_on: { label: "Acted On", color: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/25" },
  dismissed: { label: "Dismissed", color: "text-[#7A9A82]", bg: "bg-[#7A9A82]/10", border: "border-[#2D6B3D]/25" },
};

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"] as const;

const SEVERITY_CONFIG: Record<string, { dots: number; color: string; border: string }> = {
  critical: { dots: 3, color: "bg-red-400", border: "border-l-red-400" },
  high: { dots: 3, color: "bg-amber-300", border: "border-l-amber-300" },
  medium: { dots: 2, color: "bg-cyan-300", border: "border-l-cyan-300" },
  low: { dots: 1, color: "bg-[#7A9A82]", border: "border-l-slate-400" },
  info: { dots: 1, color: "bg-[#2D6B3D]", border: "border-l-slate-500" },
};

const CATEGORY_COLOR: Record<string, string> = {
  deal_sourcing: "text-[#C4A048] bg-[#C4A048]/10 border-[#C4A048]/25",
  regulatory: "text-violet-300 bg-violet-400/10 border-violet-400/25",
  macro_market: "text-amber-300 bg-amber-400/10 border-amber-400/25",
  property: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25",
  entity: "text-[#EDE8DC] bg-[#7A9A82]/10 border-[#2D6B3D]/25",
};

const TYPE_ICONS: Record<string, typeof Activity> = {
  rate_change: TrendingUp,
  yield_curve: BarChart3,
  market_snapshot: Radio,
  permit_filed: Building2,
  ucc_filing: FileText,
  land_transfer: MapPin,
  edgar_filing: FileText,
  emma_filing: Shield,
  webhook_event: Zap,
};

const DATE_RANGES = [
  { key: "1d", label: "Today" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "all", label: "All" },
] as const;

const STATE_GRID: Record<string, { row: number; col: number }> = {
  WA: { row: 0, col: 1 }, OR: { row: 1, col: 0 }, CA: { row: 3, col: 0 },
  NV: { row: 2, col: 1 }, ID: { row: 1, col: 2 }, MT: { row: 0, col: 3 },
  WY: { row: 1, col: 3 }, UT: { row: 2, col: 2 }, CO: { row: 2, col: 3 },
  AZ: { row: 3, col: 1 }, NM: { row: 3, col: 2 }, ND: { row: 0, col: 4 },
  SD: { row: 1, col: 4 }, NE: { row: 2, col: 4 }, KS: { row: 3, col: 4 },
  OK: { row: 4, col: 4 }, TX: { row: 5, col: 3 }, MN: { row: 0, col: 5 },
  IA: { row: 1, col: 5 }, MO: { row: 2, col: 5 }, AR: { row: 3, col: 5 },
  LA: { row: 4, col: 5 }, WI: { row: 0, col: 6 }, IL: { row: 1, col: 6 },
  IN: { row: 2, col: 6 }, MI: { row: 0, col: 7 }, OH: { row: 1, col: 7 },
  KY: { row: 2, col: 7 }, TN: { row: 3, col: 6 }, MS: { row: 4, col: 6 },
  AL: { row: 4, col: 7 }, GA: { row: 4, col: 8 }, FL: { row: 5, col: 8 },
  SC: { row: 3, col: 8 }, NC: { row: 3, col: 9 }, VA: { row: 2, col: 9 },
  WV: { row: 2, col: 8 }, PA: { row: 1, col: 9 }, NY: { row: 0, col: 9 },
  NJ: { row: 1, col: 10 }, CT: { row: 0, col: 10 }, RI: { row: 0, col: 11 },
  MA: { row: 0.5, col: 10.5 }, VT: { row: -0.5, col: 10 },
  NH: { row: -0.5, col: 10.5 }, ME: { row: -1, col: 11 },
  MD: { row: 2, col: 10 }, DE: { row: 1.5, col: 10.5 },
  AK: { row: 5, col: 0 }, HI: { row: 6, col: 1 },
};

// ── Helpers ─────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function formatValue(value: number | null, signalType: string): string {
  if (value === null) return "";
  if (signalType === "yield_curve") return `${value.toFixed(0)}bps`;
  if (value > 100_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value > 100) return `$${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(2);
}

function getHighestSeverity(signals: SignalEvent[]): string {
  for (const sev of SEVERITY_ORDER) {
    if (signals.some((s) => s.severity === sev)) return sev;
  }
  return "info";
}

function getDateCutoff(range: string): string | null {
  if (range === "all") return null;
  const days = range === "1d" ? 1 : range === "7d" ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function getLastSeenAt(): string | null {
  try { return localStorage.getItem(LS_KEY); } catch { return null; }
}

function setLastSeenAt(ts: string) {
  try { localStorage.setItem(LS_KEY, ts); } catch { /* noop */ }
}

// ── Signal Card ─────────────────────────────────────────────────

/**
 * Promote-to-Deal handler.
 *
 * ADR-0002 INVARIANT: This MUST NOT insert into the `deals` table. EagleEye
 * only navigates the founder to the Deal Input surface with prefilled fields
 * via URL query params. The actual `deals` insert happens when the founder
 * clicks Submit on Deal Input. Deal Input is the single front door.
 */
function promoteSignalToDeal(signal: SignalEvent) {
  // Derive prefill fields from the signal. Payload may carry naics/sector/size.
  const payload = (signal.payload || {}) as Record<string, unknown>;
  const naics = String(payload.naics ?? "");
  const sector = String(payload.sector ?? "");
  const estimatedSizeRaw = payload.estimated_size ?? payload.size ?? signal.value;
  const estimatedSize =
    estimatedSizeRaw === null || estimatedSizeRaw === undefined || estimatedSizeRaw === ""
      ? ""
      : String(estimatedSizeRaw);

  const params = new URLSearchParams();
  params.set("from_signal", signal.id);
  if (naics) params.set("naics", naics);
  if (signal.state) params.set("state", signal.state);
  if (sector) params.set("sector", sector);
  if (signal.entity_name) params.set("entity", signal.entity_name);
  if (estimatedSize) params.set("estimated_size", estimatedSize);
  params.set("source", "eagleeye");

  // Same-window navigation — Deal Input lives in the same SPA.
  // Using window.location.assign avoids importing wouter's useLocation
  // into this file just for this one handler (no new dep pattern).
  window.location.assign(`/deal-input-v4?${params.toString()}`);
}

function SignalCard({
  signal,
  onClick,
  isSelected,
  isNew,
}: {
  signal: SignalEvent;
  onClick: () => void;
  isSelected: boolean;
  isNew?: boolean;
}) {
  const Icon = TYPE_ICONS[signal.signal_type] || Activity;
  const sev = SEVERITY_CONFIG[signal.severity] || SEVERITY_CONFIG.info;
  const catColor = CATEGORY_COLOR[signal.category] || CATEGORY_COLOR.entity;
  const statusCfg = STATUS_CONFIG[signal.status];

  const handlePromote = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    promoteSignalToDeal(signal);
  };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`w-full text-left rounded-lg border-l-[3px] ${sev.border} border border-white/[0.06] bg-black/25 px-3.5 py-3 transition-all duration-150 hover:bg-white/[0.04] hover:border-white/[0.12] ${isSelected ? "ring-1 ring-amber-400/30 bg-white/[0.04]" : ""} ${isNew ? "ring-1 ring-amber-400/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon size={13} className="text-[#7A9A82] shrink-0" />
            <span className="font-mono text-[0.72rem] font-semibold text-white truncate">
              {signal.entity_name || signal.signal_type.replace(/_/g, " ")}
            </span>
            {isNew && (
              <span className="shrink-0 rounded-full bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 font-mono text-[0.42rem] font-bold uppercase tracking-wider text-amber-300">
                new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`rounded border px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider ${catColor}`}>
              {signal.category.replace(/_/g, " ")}
            </span>
            {statusCfg && signal.status !== "new" && (
              <span className={`rounded border px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            )}
            <span className="font-mono text-[0.52rem] text-[#7A9A82] uppercase tracking-wide">
              {signal.signal_type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          {Array.from({ length: sev.dots }).map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${sev.color}`} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3 font-mono text-[0.56rem] text-[#7A9A82]">
          {signal.state && (
            <span className="flex items-center gap-0.5">
              <MapPin size={9} /> {signal.state}{signal.county ? `, ${signal.county}` : ""}
            </span>
          )}
          <span>{signal.source}</span>
        </div>
        <div className="flex items-center gap-2">
          {signal.value !== null && (
            <span className="font-mono text-[0.65rem] font-semibold text-amber-200/80">
              {formatValue(signal.value, signal.signal_type)}
            </span>
          )}
          <span className="font-mono text-[0.5rem] text-[#7A9A82]">
            {timeAgo(signal.captured_at)}
          </span>
          {/* Promote to Deal — ADR-0002: navigation only, NEVER inserts into deals.
              Rendered as a span (role=button) because the outer card is itself a
              <button>; nesting <button> in <button> is invalid HTML. */}
          <span
            role="button"
            tabIndex={0}
            aria-label="Promote signal to Deal Input"
            title="Promote to Deal — prefills Deal Input"
            onClick={handlePromote}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePromote(e);
            }}
            className="inline-flex items-center gap-1 rounded border border-[#C4A048]/40 bg-[#C4A048]/10 px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider text-[#C4A048] hover:bg-[#C4A048]/20 hover:border-[#C4A048]/60 transition cursor-pointer select-none"
          >
            <Send size={9} /> Promote
          </span>
        </div>
      </div>

      {signal.payload?.description && (
        <p className="mt-1.5 font-mono text-[0.62rem] text-[#7A9A82] line-clamp-1">
          {String(signal.payload.description)}
        </p>
      )}
    </motion.button>
  );
}

// ── Intelligence Map ────────────────────────────────────────────

function IntelligenceMap({
  signals,
  activeState,
  onStateFilter,
}: {
  signals: SignalEvent[];
  activeState: string | null;
  onStateFilter: (state: string | null) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const signalsByState = useMemo(() => {
    const map: Record<string, SignalEvent[]> = {};
    for (const s of signals) {
      if (s.state && STATE_GRID[s.state]) {
        if (!map[s.state]) map[s.state] = [];
        map[s.state].push(s);
      }
    }
    return map;
  }, [signals]);

  const maxCount = useMemo(
    () => Math.max(...Object.values(signalsByState).map((a) => a.length), 1),
    [signalsByState],
  );

  const positions = useMemo(() => {
    const entries = Object.entries(STATE_GRID);
    const minRow = Math.min(...entries.map(([, v]) => v.row));
    const maxRow = Math.max(...entries.map(([, v]) => v.row));
    const minCol = Math.min(...entries.map(([, v]) => v.col));
    const maxCol = Math.max(...entries.map(([, v]) => v.col));
    const rowSpan = maxRow - minRow || 1;
    const colSpan = maxCol - minCol || 1;
    const pos: Record<string, { top: string; left: string }> = {};
    for (const [code, { row, col }] of entries) {
      pos[code] = {
        top: `${((row - minRow) / rowSpan) * 85 + 5}%`,
        left: `${((col - minCol) / colSpan) * 88 + 4}%`,
      };
    }
    return pos;
  }, []);

  function getColor(count: number): string {
    if (count === 0) return "#ffffff08";
    const r = count / maxCount;
    if (r > 0.7) return "#ef444488";
    if (r > 0.4) return "#C4A04888";
    return "#22d3ee44";
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden" style={{ background: "#030A06" }}>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(196,160,72,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(196,160,72,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute top-3 left-4 z-20">
        <h3 className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.18em] text-[#7A9A82]">
          Geographic Intelligence
        </h3>
        <p className="font-mono text-[0.48rem] text-[#7A9A82] mt-0.5">
          {Object.keys(signalsByState).length} states · {signals.filter((s) => s.state).length} located signals
        </p>
      </div>

      {activeState && (
        <button
          onClick={() => onStateFilter(null)}
          className="absolute top-3 right-4 z-20 flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-1 font-mono text-[0.52rem] text-amber-300 hover:bg-amber-400/20 transition"
        >
          <X size={10} /> Clear {activeState}
        </button>
      )}

      <div className="absolute inset-0 mt-10">
        {Object.entries(STATE_GRID).map(([code]) => {
          const pos = positions[code];
          const stateSignals = signalsByState[code] ?? [];
          const count = stateSignals.length;
          const isActive = activeState === code;
          const isHov = hovered === code;
          const highSev = count > 0 ? getHighestSeverity(stateSignals) : "info";

          return (
            <motion.button
              key={code}
              className="absolute flex flex-col items-center justify-center z-10"
              style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
              onClick={() => onStateFilter(activeState === code ? null : code)}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ scale: 1.2, zIndex: 30 }}
              whileTap={{ scale: 0.95 }}
            >
              {count >= 3 && (
                <motion.div
                  className="absolute rounded-md"
                  style={{
                    width: 44, height: 30,
                    border: `1px solid ${SEVERITY_CONFIG[highSev]?.color === "bg-red-400" ? "#ef4444" : "#C4A048"}`,
                    opacity: 0.3,
                  }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <div
                className="relative rounded-md px-1.5 py-1 font-mono text-[10px] font-semibold tracking-wider transition-colors"
                style={{
                  background: isActive ? `${getColor(count)}` : count > 0 ? getColor(count) : "#ffffff04",
                  border: `1px solid ${isActive ? "#C4A048" : count > 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}`,
                  color: count > 0 ? "#EDE8DC" : "#ffffff20",
                  boxShadow: isActive ? "0 0 16px 3px rgba(196,160,72,0.3)" : "none",
                  minWidth: 28,
                  textAlign: "center",
                }}
              >
                {code}
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full font-mono text-[8px] font-bold px-0.5 bg-[#C4A048] text-[#030A06]">
                    {count}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {isHov && count > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full mt-2 z-50 rounded-md px-3 py-2 pointer-events-none whitespace-nowrap"
                    style={{ background: "#0D2218ee", border: "1px solid #1E4A2E", backdropFilter: "blur(8px)" }}
                  >
                    <p className="font-mono text-[10px] text-[#C4A048] font-semibold">
                      {code} — {count} signal{count > 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(
                        stateSignals.reduce((acc, s) => {
                          acc[s.signal_type] = (acc[s.signal_type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>),
                      ).map(([type, n]) => (
                        <span key={type} className="font-mono text-[9px] text-[#7A9A82]">
                          {type.replace(/_/g, " ")}: {n}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none z-10"
        style={{ background: "linear-gradient(90deg, transparent, #C4A04812, transparent)" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ── Correlation Panel ───────────────────────────────────────────

function CorrelationPanel({ signal }: { signal: SignalEvent }) {
  const relatedQuery = trpc.signals.related.useQuery(
    {
      signal_id: signal.id,
      entity: signal.entity_name || undefined,
      market: signal.market || undefined,
      state: signal.state || undefined,
      exclude_id: signal.id,
    },
    { staleTime: 60_000 },
  );

  const related: (SignalEvent & { _match_field?: string })[] =
    (relatedQuery.data as any)?.related || [];

  if (relatedQuery.isLoading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={12} className="text-[#C4A048] animate-pulse" />
          <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#7A9A82]">
            Scanning for correlations...
          </span>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const matchFieldLabel: Record<string, string> = {
    entity_name: "Same entity",
    market: "Same market",
    state: "Same state",
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain size={12} className="text-[#C4A048]" />
          <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#7A9A82]">
            Correlation Analysis
          </span>
        </div>
        {related.length > 0 && (
          <Badge variant="outline" className="font-mono text-[0.5rem] border-[#C4A048]/25 text-[#C4A048]">
            {related.length} related
          </Badge>
        )}
      </div>

      {related.length === 0 ? (
        <p className="font-mono text-[0.62rem] text-[#7A9A82] italic">
          No correlated signals found within the 30-day window.
        </p>
      ) : (
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {related.map((r) => {
            const Icon = TYPE_ICONS[r.signal_type] || Activity;
            const matchLabel = matchFieldLabel[r._match_field || ""] || "Related";
            return (
              <div
                key={r.id}
                className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5 hover:bg-white/[0.03] transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon size={11} className="text-[#7A9A82] shrink-0" />
                      <span className="font-mono text-[0.65rem] font-semibold text-white truncate">
                        {r.entity_name || r.signal_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded bg-[#C4A048]/10 border border-[#C4A048]/20 px-1.5 py-0.5 font-mono text-[0.44rem] uppercase tracking-wider text-[#C4A048]">
                        {matchLabel}
                      </span>
                      <span className="font-mono text-[0.48rem] text-[#7A9A82]">
                        {r.signal_type.replace(/_/g, " ")}
                      </span>
                      {r.state && (
                        <span className="font-mono text-[0.48rem] text-[#7A9A82] flex items-center gap-0.5">
                          <MapPin size={8} /> {r.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-[0.48rem] text-[#7A9A82] shrink-0">
                    {timeAgo(r.captured_at)}
                  </span>
                </div>
                {r.value !== null && (
                  <div className="mt-1.5 font-mono text-[0.58rem] text-amber-200/70">
                    {formatValue(r.value, r.signal_type)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {related.length >= 3 && (
        <div className="mt-3 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={10} className="text-amber-300" />
            <span className="font-mono text-[0.56rem] font-semibold text-amber-200">
              Cluster detected — {related.length} converging signals
            </span>
          </div>
          <p className="font-mono text-[0.52rem] text-amber-200/60 mt-0.5">
            Multiple signals for {signal.entity_name || signal.state || "this region"} suggest increased activity.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Signal Detail Sheet ─────────────────────────────────────────

function SignalDetailSheet({
  signal,
  open,
  onClose,
  onStatusChange,
}: {
  signal: SignalEvent | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (signalId: string, status: string) => void;
}) {
  if (!signal) return null;

  const Icon = TYPE_ICONS[signal.signal_type] || Activity;
  const sev = SEVERITY_CONFIG[signal.severity] || SEVERITY_CONFIG.info;
  const catColor = CATEGORY_COLOR[signal.category] || CATEGORY_COLOR.entity;
  const statusCfg = STATUS_CONFIG[signal.status];
  const dirStyle = signal.direction
    ? signal.direction === "bullish" || signal.direction === "positive"
      ? { icon: TrendingUp, color: "text-emerald-400", label: "Bullish" }
      : signal.direction === "bearish" || signal.direction === "negative"
        ? { icon: TrendingDown, color: "text-red-400", label: "Bearish" }
        : { icon: Minus, color: "text-[#7A9A82]", label: "Neutral" }
    : null;

  const payloadEntries = Object.entries(signal.payload || {}).filter(
    ([k]) => k !== "description",
  );

  const statusActions: { status: string; label: string; icon: typeof Eye; color: string }[] = [
    { status: "reviewed", label: "Mark Reviewed", icon: Eye, color: "text-[#C4A048] border-[#C4A048]/20 bg-[#C4A048]/8" },
    { status: "actionable", label: "Escalate", icon: Flag, color: "text-amber-300 border-amber-400/20 bg-amber-400/8" },
    { status: "acted_on", label: "Mark Acted On", icon: CheckCircle2, color: "text-emerald-300 border-emerald-400/20 bg-emerald-400/8" },
    { status: "dismissed", label: "Dismiss", icon: XCircle, color: "text-[#7A9A82] border-[#2D6B3D]/20 bg-[#7A9A82]/8" },
  ].filter((a) => a.status !== signal.status);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[500px] max-w-[92vw] overflow-y-auto border-l border-white/10 bg-[#060E1A] p-0"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#060E1A]/95 backdrop-blur px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-[#C4A048]" />
                <h2 className="font-mono text-sm font-semibold text-white">
                  {signal.entity_name || signal.signal_type.replace(/_/g, " ")}
                </h2>
              </div>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span className={`rounded border px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider ${catColor}`}>
                  {signal.category.replace(/_/g, " ")}
                </span>
                {statusCfg && (
                  <span className={`rounded border px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                    {statusCfg.label}
                  </span>
                )}
                <span className="font-mono text-[0.52rem] uppercase tracking-wide text-[#7A9A82]">
                  {signal.signal_type.replace(/_/g, " ")}
                </span>
                {signal.state && (
                  <span className="font-mono text-[0.52rem] text-[#7A9A82] flex items-center gap-0.5">
                    <MapPin size={9} /> {signal.state}{signal.county ? `, ${signal.county}` : ""}{signal.market ? ` · ${signal.market}` : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: sev.dots }).map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${sev.color}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-3">
            {signal.value !== null && (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-[#7A9A82]">Value</p>
                <p className="font-mono text-base font-semibold text-amber-100">{formatValue(signal.value, signal.signal_type)}</p>
              </div>
            )}
            {dirStyle && (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-[#7A9A82]">Direction</p>
                <p className={`font-mono text-sm font-semibold flex items-center gap-1 ${dirStyle.color}`}>
                  <dirStyle.icon size={14} /> {dirStyle.label}
                </p>
              </div>
            )}
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-[#7A9A82]">Confidence</p>
              <p className="font-mono text-base font-semibold text-white">
                {signal.confidence !== null ? `${(signal.confidence * 100).toFixed(0)}%` : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-[#7A9A82]">Severity</p>
              <p className="font-mono text-sm font-semibold text-white capitalize">{signal.severity}</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-[#7A9A82]">Source</p>
              <p className="font-mono text-sm font-semibold text-white">{signal.source}</p>
            </div>
          </div>

          {/* Description */}
          {signal.payload?.description && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#7A9A82] mb-1.5">Description</p>
              <p className="font-mono text-[0.72rem] leading-5 text-[#EDE8DC]">{String(signal.payload.description)}</p>
            </div>
          )}

          {/* Signal Data */}
          {payloadEntries.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#7A9A82] mb-2">Signal Data</p>
              <div className="space-y-1.5">
                {payloadEntries.map(([key, val]) => (
                  <div key={key} className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[0.58rem] text-[#7A9A82]">{key.replace(/_/g, " ")}</span>
                    <span className="font-mono text-[0.62rem] text-[#EDE8DC] text-right truncate max-w-[240px]">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correlation Panel */}
          <CorrelationPanel signal={signal} />

          {/* Metadata footer */}
          <div className="flex items-center justify-between font-mono text-[0.5rem] text-[#7A9A82] pt-2">
            <span>Ref: {signal.source_ref || "—"}</span>
            <span>Captured: {new Date(signal.captured_at).toLocaleString()}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
            {statusActions.map(({ status, label, icon: ActionIcon, color }) => (
              <Button
                key={status}
                onClick={() => onStatusChange(signal.id, status)}
                className={`rounded-lg border px-3 py-2 font-mono text-[0.58rem] uppercase hover:brightness-125 transition ${color}`}
              >
                <ActionIcon size={11} className="mr-1.5" /> {label}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── New Signals Banner ──────────────────────────────────────────

function NewSignalsBanner({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  if (count <= 0) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      onClick={onClick}
      className="w-full rounded-lg border border-amber-400/30 bg-amber-400/10 backdrop-blur px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-amber-400/15 transition-colors mb-3"
    >
      <Bell size={13} className="text-amber-300" />
      <span className="font-mono text-[0.68rem] font-semibold text-amber-200">
        {count} new signal{count > 1 ? "s" : ""} — click to load
      </span>
      <ChevronDown size={12} className="text-amber-300" />
    </motion.button>
  );
}

// ── Find Similar Deals Panel (Bernard + EagleEye learning loop) ─────────────

function FindSimilarPanel() {
  const [docText, setDocText] = useState("");
  const [sector, setSector] = useState("senior_living");
  const [state, setState] = useState("FL");
  const [sizeMin, setSizeMin] = useState("50000000");
  const [sizeMax, setSizeMax] = useState("300000000");
  const [findResult, setFindResult] = useState<any>(null);
  const [findLoading, setFindLoading] = useState(false);
  const [pipeline, setPipeline] = useState<any>(null);
  const [pipelineLoading, setPipelineLoading] = useState(true);

  // Auto-load the EagleEye operator learning loop on mount → live pipeline aggregate
  useEffect(() => {
    fetch(`${_API}/api/eagleeye/operators/learning-loop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docs: [] }),
    })
      .then((r) => r.json())
      .then((j) => setPipeline(j?.data ?? j))
      .catch(() => setPipeline({ error: "learning-loop failed" }))
      .finally(() => setPipelineLoading(false));
  }, []);

  async function runFindSimilar() {
    setFindLoading(true);
    try {
      const r = await fetch(`${_API}/api/bernard/find-similar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_text: docText || undefined,
          sector,
          state,
          size_min: Number(sizeMin) || 0,
          size_max: Number(sizeMax) || 0,
        }),
      });
      const j = await r.json();
      setFindResult(j?.data ?? j);
    } catch (e: any) {
      setFindResult({ error: e?.message || "find-similar failed" });
    } finally {
      setFindLoading(false);
    }
  }

  const actionItems: any[] = pipeline?.action_items ?? [];
  const pipelineTotalUSD = actionItems.reduce((sum, a) => {
    const m = (a.description || "").match(/\$([\d,]+)/);
    return sum + (m ? parseInt(m[1].replace(/,/g, ""), 10) : 0);
  }, 0);
  const fmtUSD = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n.toLocaleString()}`;
  };
  const comps: any[] = findResult?.emma_comps ?? [];
  const matchedSignals: any[] = findResult?.eagleeye_signals ?? [];
  const extracted = findResult?.extracted_from_document ?? {};

  return (
    <div className="rounded-xl border border-amber-400/20 bg-gradient-to-r from-[#0a1f16]/80 via-[#0b0f14]/80 to-[#0a1f16]/80 backdrop-blur px-5 py-4 mb-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-amber-300/70 mb-1">
            EAGLEEYE × BERNARD · LIVE PIPELINE
          </div>
          <h2
            className="text-xl font-semibold text-amber-200/90"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Find similar deals — feed a doc or set parameters
          </h2>
        </div>
        <div className="text-right">
          <div className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-[#7A9A82]">
            Aggregate pipeline
          </div>
          <div className="font-mono text-2xl text-amber-200" style={{ textShadow: "0 0 18px rgba(196,160,72,0.45)" }}>
            {pipelineLoading ? "—" : fmtUSD(pipelineTotalUSD)}
          </div>
          <div className="font-mono text-[0.55rem] text-[#7A9A82]">
            {actionItems.length} deals · {pipeline?.docs_processed ?? 0} docs
          </div>
        </div>
      </div>

      {/* Find Similar input row */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <input
          value={docText}
          onChange={(e) => setDocText(e.target.value)}
          placeholder="Paste a bond OS, CIM, or term-sheet excerpt..."
          className="md:col-span-3 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-[#EDE8DC] text-sm placeholder:text-[#7A9A82] focus:outline-none focus:border-amber-400/40"
        />
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-2 py-2 rounded-lg bg-black/40 border border-white/10 text-[#EDE8DC] text-xs font-mono"
        >
          <option value="senior_living">senior_living</option>
          <option value="healthcare_services">healthcare</option>
          <option value="hospitality">hospitality</option>
          <option value="data_centers">data_centers</option>
          <option value="real_estate">real_estate</option>
        </select>
        <input
          value={state}
          onChange={(e) => setState(e.target.value.toUpperCase())}
          placeholder="State (FL)"
          maxLength={2}
          className="px-2 py-2 rounded-lg bg-black/40 border border-white/10 text-[#EDE8DC] text-sm font-mono"
        />
        <button
          onClick={runFindSimilar}
          disabled={findLoading}
          className="px-3 py-2 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-mono uppercase tracking-wider hover:bg-amber-400/30 disabled:opacity-50"
        >
          {findLoading ? "Searching…" : "Find similar"}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <input
          value={sizeMin}
          onChange={(e) => setSizeMin(e.target.value)}
          placeholder="Size min ($)"
          className="px-2 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[#EDE8DC] text-xs font-mono"
        />
        <input
          value={sizeMax}
          onChange={(e) => setSizeMax(e.target.value)}
          placeholder="Size max ($)"
          className="px-2 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[#EDE8DC] text-xs font-mono"
        />
      </div>

      {/* Pipeline action items (always shown) */}
      {!pipelineLoading && actionItems.length > 0 && (
        <div className="mb-4">
          <div className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[#7A9A82] mb-1.5">
            Live pipeline · action items
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {actionItems.slice(0, 8).map((a, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-mono text-[0.7rem] text-amber-200 truncate">{a.deal_name}</div>
                  <span
                    className={`shrink-0 text-[0.5rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      a.priority === "high"
                        ? "bg-rose-500/20 text-rose-200 border border-rose-400/30"
                        : "bg-[#C4A048]/20 text-[#E8C87A] border border-[#C4A048]/30"
                    }`}
                  >
                    {a.priority}
                  </span>
                </div>
                <div className="font-mono text-[0.62rem] text-[#7A9A82] mt-0.5 line-clamp-2">
                  {a.description}
                </div>
                <div className="font-mono text-[0.58rem] text-[#C4A048] mt-1 truncate">
                  → {a.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Find-similar results */}
      {findResult && !findResult.error && (
        <div className="border-t border-white/[0.06] pt-3 mt-2">
          {Object.keys(extracted || {}).length > 0 && (
            <div className="mb-2 font-mono text-[0.6rem] text-[#7A9A82]">
              Extracted from document: <span className="text-amber-200">{JSON.stringify(extracted).slice(0, 200)}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[#7A9A82] mb-1.5">
                EMMA comps ({comps.length})
              </div>
              {comps.length === 0 && (
                <div className="font-mono text-[0.7rem] text-[#7A9A82]">No comps matched.</div>
              )}
              {comps.map((c, i) => (
                <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 mb-2">
                  <div className="font-mono text-[0.7rem] text-amber-200">{c.borrower || c.issuer}</div>
                  <div className="font-mono text-[0.62rem] text-[#7A9A82]">
                    {c.sector} · {c.state} · ${(c.par_amount / 1e6).toFixed(0)}M ·{" "}
                    {c.ratings?.sp || c.ratings?.moodys || "NR"}
                  </div>
                  <div className="font-mono text-[0.58rem] text-[#C4A048] mt-0.5">
                    coupon {c.coupon_rate}% · {c.amortization}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[#7A9A82] mb-1.5">
                EagleEye matched signals ({matchedSignals.length})
              </div>
              {matchedSignals.length === 0 && (
                <div className="font-mono text-[0.7rem] text-[#7A9A82]">
                  No active signals match yet — run a scout to populate.
                </div>
              )}
              {matchedSignals.map((s, i) => (
                <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 mb-2">
                  <div className="font-mono text-[0.7rem] text-amber-200">{s.title || s.entity || s.id}</div>
                  <div className="font-mono text-[0.62rem] text-[#7A9A82]">
                    {s.sector} · {s.state} · {s.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {findResult?.error && (
        <div className="mt-2 font-mono text-[0.7rem] text-rose-300">
          {findResult.error}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export default function EagleEyeV2() {
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [page, setPage] = useState(0);
  const [mapFilterState, setMapFilterState] = useState<string | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const [revealedAt, setRevealedAt] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const listRef = useRef<HTMLDivElement>(null);

  // Build query params
  const filterParams = useMemo(() => {
    const params: Record<string, string> = {
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    };
    if (category !== "all") params.category = category;
    if (statusFilter !== "all") params.status = statusFilter;
    if (mapFilterState) params.state = mapFilterState;
    return params;
  }, [category, statusFilter, page, mapFilterState]);

  // Main signal query — full refetch every 30s
  const signalsQuery = trpc.signals.query.useQuery(filterParams, {
    refetchInterval: POLL_INTERVAL,
  });
  const statsQuery = trpc.signals.stats.useQuery(undefined, {
    refetchInterval: POLL_INTERVAL,
  });
  const vectorQuery = trpc.signals.vectorLatest.useQuery(undefined, {
    retry: false,
  });
  const alertsQuery = trpc.signals.alerts.useQuery(
    { status: "new" },
    { refetchInterval: POLL_INTERVAL },
  );

  // Cursor-based new signal detection
  useEffect(() => {
    const interval = setInterval(async () => {
      const lastSeen = getLastSeenAt();
      if (!lastSeen) return;

      try {
        const result: any = await api.signals.query({ since_ts: lastSeen, limit: "1" });
        const newCount = result?.count || 0;
        if (newCount > 0) {
          setPendingNewCount(newCount);
        }
      } catch {
        // Silently fail — next poll will retry
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Track lastSeenAt from query results
  useEffect(() => {
    const allSignals: SignalEvent[] = (signalsQuery.data as any)?.signals || [];
    if (allSignals.length > 0 && pendingNewCount === 0) {
      const newest = allSignals.reduce((a, b) =>
        a.captured_at > b.captured_at ? a : b,
      );
      setLastSeenAt(newest.captured_at);
    }
  }, [signalsQuery.data, pendingNewCount]);

  const handleRevealNew = useCallback(() => {
    const lastSeen = getLastSeenAt();
    setRevealedAt(lastSeen);
    setPendingNewCount(0);
    queryClient.invalidateQueries({ queryKey: ["signals"] });
    setPage(0);
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });

    // Update lastSeenAt after a small delay to let the query return
    setTimeout(() => {
      setRevealedAt(null);
    }, 10_000);
  }, [queryClient]);

  const pollFred = trpc.signals.pollFred.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      setPolling(false);
    },
    onError: () => setPolling(false),
  });

  const [pollingEdgar, setPollingEdgar] = useState(false);
  const pollEdgar = trpc.signals.pollEdgar.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      setPollingEdgar(false);
    },
    onError: () => setPollingEdgar(false),
  });

  const statusMutation = trpc.signals.updateStatus.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  const allSignals: SignalEvent[] = (signalsQuery.data as any)?.signals || [];
  const stats: StatsData | null = (statsQuery.data as any) || null;
  const vector: VectorSnapshot | null = (vectorQuery.data as any) || null;
  const activeAlerts: SignalAlert[] = (alertsQuery.data as any)?.alerts || [];

  const [alertFilterIds, setAlertFilterIds] = useState<Set<string> | null>(null);

  const handleAlertClick = useCallback((alert: SignalAlert) => {
    if (alertFilterIds && alert.signal_ids.every((id) => alertFilterIds.has(id))) {
      setAlertFilterIds(null);
    } else {
      setAlertFilterIds(new Set(alert.signal_ids));
    }
    setPage(0);
  }, [alertFilterIds]);

  const displaySignals = useMemo(() => {
    let filtered = allSignals;
    const cutoff = getDateCutoff(dateRange);
    if (cutoff) {
      filtered = filtered.filter((s) => s.captured_at >= cutoff);
    }
    if (alertFilterIds) {
      filtered = filtered.filter((s) => alertFilterIds.has(s.id));
    }
    return filtered;
  }, [allSignals, dateRange, alertFilterIds]);

  const selectedSignal = useMemo(
    () => allSignals.find((s) => s.id === selectedSignalId) || null,
    [allSignals, selectedSignalId],
  );

  const totalCount = (signalsQuery.data as any)?.count ?? allSignals.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleMapFilter = useCallback((state: string | null) => {
    setMapFilterState(state);
    setPage(0);
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setCategory(cat);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((s: string) => {
    setStatusFilter(s);
    setPage(0);
  }, []);

  const handlePollFred = () => {
    setPolling(true);
    pollFred.mutate(undefined as any);
  };

  const handlePollEdgar = () => {
    setPollingEdgar(true);
    pollEdgar.mutate({});
  };

  const handleStatusChange = useCallback((signalId: string, status: string) => {
    statusMutation.mutate({ signalId, status });
  }, [statusMutation]);

  const highPriorityCount = allSignals.filter(
    (s) => s.severity === "critical" || s.severity === "high",
  ).length;

  const dealSourcingCount = stats?.by_category?.deal_sourcing ?? 0;

  return (
    <div className="space-y-0">
      {/* ── Find Similar Deals + Pipeline (Bernard + EagleEye learning loop) ── */}
      <FindSimilarPanel />
      {/* ── AI Command Strip ────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-r from-[#0a1f16]/80 via-[#060E1A]/80 to-[#0a1f16]/80 backdrop-blur px-5 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C4A048]/20 bg-[#C4A048]/10">
                <Eye size={14} className="text-[#C4A048]" />
              </div>
              <div>
                <h1
                  className="text-lg font-semibold tracking-wide text-amber-200/90"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  EagleEye V2
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-5 font-mono text-[0.58rem]">
              <span className="text-[#7A9A82]">
                <span className="text-white font-semibold">{stats?.total ?? 0}</span> signals tracked
              </span>
              {highPriorityCount > 0 && (
                <span className="text-amber-300">
                  <span className="font-semibold">{highPriorityCount}</span> high priority
                </span>
              )}
              {dealSourcingCount > 0 && (
                <span className="text-[#C4A048]">
                  <span className="font-semibold">{dealSourcingCount}</span> deal sourcing
                </span>
              )}
              {vector && (
                <span className="text-[#7A9A82]">
                  VectorAgent: <span className="text-emerald-400 font-semibold">{Number(vector.composite_score).toFixed(0)}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {statusMutation.isPending && (
              <span className="font-mono text-[0.48rem] text-amber-400/60 flex items-center gap-1">
                <RefreshCw size={9} className="animate-spin" /> saving
              </span>
            )}
            {signalsQuery.isFetching && !statusMutation.isPending && (
              <span className="font-mono text-[0.48rem] text-[#C4A048]/60 flex items-center gap-1">
                <RefreshCw size={9} className="animate-spin" /> syncing
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[0.5rem] text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
            <Button
              onClick={handlePollEdgar}
              disabled={pollingEdgar}
              variant="ghost"
              className="h-7 gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 font-mono text-[0.56rem] uppercase tracking-wider text-[#7A9A82] hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
              {pollingEdgar ? <RefreshCw size={10} className="animate-spin" /> : <FileText size={10} />}
              {pollingEdgar ? "Polling..." : "Poll EDGAR"}
            </Button>
            <Button
              onClick={handlePollFred}
              disabled={polling}
              variant="ghost"
              className="h-7 gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 font-mono text-[0.56rem] uppercase tracking-wider text-[#7A9A82] hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
              {polling ? <RefreshCw size={10} className="animate-spin" /> : <Zap size={10} />}
              {polling ? "Polling..." : "Poll FRED"}
            </Button>
          </div>
        </div>

        {/* Cluster Alert Callouts */}
        {activeAlerts.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {activeAlerts.slice(0, 5).map((alert) => {
              const isFiltered = alertFilterIds && alert.signal_ids.every((id) => alertFilterIds.has(id));
              return (
                <motion.button
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleAlertClick(alert)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.56rem] transition-all ${
                    isFiltered
                      ? "border-amber-400/40 bg-amber-400/20 text-amber-200"
                      : "border-amber-400/20 bg-amber-400/8 text-amber-300/90 hover:bg-amber-400/15 hover:border-amber-400/30"
                  }`}
                >
                  <AlertTriangle size={10} className="shrink-0" />
                  <span className="truncate max-w-[320px]">{alert.title}</span>
                  <span className="shrink-0 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[0.44rem] font-bold">
                    {alert.signal_ids.length}
                  </span>
                  {isFiltered && <X size={9} className="shrink-0 ml-0.5" />}
                </motion.button>
              );
            })}
            {activeAlerts.length > 5 && (
              <span className="font-mono text-[0.5rem] text-amber-400/50">
                +{activeAlerts.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── New Signals Banner ─────────────────────────────── */}
      <AnimatePresence>
        {pendingNewCount > 0 && (
          <NewSignalsBanner count={pendingNewCount} onClick={handleRevealNew} />
        )}
      </AnimatePresence>

      {/* ── Main Content: Stream + Map ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(340px,2fr)_3fr] gap-4">
        {/* LEFT: Signal Stream */}
        <div className="flex flex-col min-h-0">
          {/* Filter Bar */}
          <div className="space-y-2.5 mb-3">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => {
                const count = cat.key === "all"
                  ? stats?.total ?? 0
                  : stats?.by_category?.[cat.key] ?? 0;
                const isActive = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(cat.key)}
                    className={`rounded-md px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-wider transition-all ${
                      isActive
                        ? cat.key === "deal_sourcing" ? "bg-[#C4A048]/15 text-[#E8C87A] border border-[#C4A048]/30"
                        : cat.key === "regulatory" ? "bg-violet-500/15 text-violet-200 border border-violet-400/30"
                        : cat.key === "macro_market" ? "bg-amber-500/15 text-amber-200 border border-amber-400/30"
                        : cat.key === "property" ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30"
                        : "bg-white/10 text-white border border-white/20"
                        : "text-[#7A9A82] border border-transparent hover:text-[#EDE8DC] hover:bg-white/[0.03]"
                    }`}
                  >
                    {cat.label} <span className="ml-1 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Status filter + date range */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] p-0.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleStatusFilterChange(s.key)}
                    className={`rounded px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider transition ${
                      statusFilter === s.key
                        ? `bg-white/10 ${s.color}`
                        : "text-[#7A9A82] hover:text-[#7A9A82]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] p-0.5">
                {DATE_RANGES.map((dr) => (
                  <button
                    key={dr.key}
                    onClick={() => setDateRange(dr.key)}
                    className={`rounded px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider transition ${
                      dateRange === dr.key ? "bg-white/10 text-white" : "text-[#7A9A82] hover:text-[#7A9A82]"
                    }`}
                  >
                    {dr.label}
                  </button>
                ))}
              </div>

              {mapFilterState && (
                <span className="flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[0.5rem] text-amber-300">
                  <MapPin size={9} /> {mapFilterState}
                  <button onClick={() => handleMapFilter(null)} className="ml-1 hover:text-white">
                    <X size={9} />
                  </button>
                </span>
              )}
              {alertFilterIds && (
                <span className="flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[0.5rem] text-amber-300">
                  <AlertTriangle size={9} /> Cluster filter ({alertFilterIds.size} signals)
                  <button onClick={() => setAlertFilterIds(null)} className="ml-1 hover:text-white">
                    <X size={9} />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Signal List */}
          {signalsQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw size={18} className="animate-spin text-[#C4A048]/40" />
            </div>
          ) : displaySignals.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] mx-auto mb-3">
                <Search size={18} className="text-[#7A9A82]" />
              </div>
              <p className="font-mono text-sm text-[#7A9A82]">No signals match filters</p>
              <p className="font-mono text-[0.58rem] text-[#7A9A82] mt-1 max-w-[280px] mx-auto">
                Try broadening your category, status, or date range filters.
              </p>
            </div>
          ) : (
            <>
              <div ref={listRef} className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {displaySignals.map((signal) => (
                    <SignalCard
                      key={signal.id}
                      signal={signal}
                      onClick={() => setSelectedSignalId(signal.id)}
                      isSelected={selectedSignalId === signal.id}
                      isNew={!!(revealedAt && signal.captured_at > revealedAt)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                <span className="font-mono text-[0.5rem] text-[#7A9A82]">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="h-6 w-6 p-0 rounded border border-white/[0.06] text-[#7A9A82] hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft size={12} />
                  </Button>
                  <span className="font-mono text-[0.52rem] text-[#7A9A82] min-w-[40px] text-center">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="h-6 w-6 p-0 rounded border border-white/[0.06] text-[#7A9A82] hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight size={12} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Intelligence Map */}
        <IntelligenceMap
          signals={allSignals}
          activeState={mapFilterState}
          onStateFilter={handleMapFilter}
        />
      </div>

      {/* ── Signal Detail Sheet ─────────────────────────────── */}
      <SignalDetailSheet
        signal={selectedSignal}
        open={!!selectedSignal}
        onClose={() => setSelectedSignalId(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

