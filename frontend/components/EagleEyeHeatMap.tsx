"use client";
import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EagleEyeSignal, SignalStatus } from "@/shared/eagleEyeDemo";

// ── Props ──────────────────────────────────────────────────────────

interface EagleEyeHeatMapProps {
  signals: EagleEyeSignal[];
  activeState: string | null;
  onSignalClick: (signalId: string) => void;
  onStateFilter: (stateCode: string | null) => void;
  category: "ma" | "cre" | "all";
}

// ── Constants ──────────────────────────────────────────────────────

const STATUS_GLOW: Record<SignalStatus, string> = {
  hot: "#ef4444",
  warm: "#C4A048",
  review: "#22d3ee",
  passed: "#64748b",
  converted: "#10b981",
};

const CATEGORY_COLOR = {
  ma: "#22d3ee",
  cre: "#10b981",
};

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

// ── Helpers ────────────────────────────────────────────────────────

function getHeatColor(count: number, maxCount: number): string {
  if (count === 0) return "#1E4A2E";
  const ratio = Math.min(count / Math.max(maxCount, 1), 1);
  if (ratio > 0.7) return "#ef4444";
  if (ratio > 0.4) return "#C4A048";
  if (ratio > 0.1) return "#2D6B3D";
  return "#1E4A2E";
}

function getHeatGlow(count: number, maxCount: number): string {
  if (count === 0) return "none";
  const ratio = Math.min(count / Math.max(maxCount, 1), 1);
  if (ratio > 0.7) return "0 0 18px 4px rgba(239,68,68,0.5)";
  if (ratio > 0.4) return "0 0 14px 3px rgba(196,160,72,0.4)";
  if (ratio > 0.1) return "0 0 10px 2px rgba(30,74,46,0.35)";
  return "none";
}

function getTopSignalStatus(signals: EagleEyeSignal[]): SignalStatus | null {
  const priority: SignalStatus[] = ["hot", "warm", "review", "converted", "passed"];
  for (const s of priority) {
    if (signals.some((sig) => sig.status === s)) return s;
  }
  return null;
}

// ── Component ──────────────────────────────────────────────────────

export default function EagleEyeHeatMap({
  signals,
  activeState,
  onSignalClick,
  onStateFilter,
  category,
}: EagleEyeHeatMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const filteredSignals = useMemo(
    () => category === "all" ? signals : signals.filter((s) => s.category === category),
    [signals, category],
  );

  const signalsByState = useMemo(() => {
    const map: Record<string, EagleEyeSignal[]> = {};
    for (const s of filteredSignals) {
      if (!map[s.state]) map[s.state] = [];
      map[s.state].push(s);
    }
    return map;
  }, [filteredSignals]);

  const maxSignalsInState = useMemo(
    () => Math.max(...Object.values(signalsByState).map((a) => a.length), 1),
    [signalsByState],
  );

  const activeSignals = useMemo(
    () => (activeState ? signalsByState[activeState] ?? [] : []),
    [activeState, signalsByState],
  );

  const statesWithSignals = useMemo(
    () => new Set(Object.keys(signalsByState)),
    [signalsByState],
  );

  const handleStateClick = useCallback(
    (code: string) => {
      onStateFilter(activeState === code ? null : code);
    },
    [activeState, onStateFilter],
  );

  const statePositions = useMemo(() => {
    const entries = Object.entries(STATE_GRID);
    const minRow = Math.min(...entries.map(([, v]) => v.row));
    const maxRow = Math.max(...entries.map(([, v]) => v.row));
    const minCol = Math.min(...entries.map(([, v]) => v.col));
    const maxCol = Math.max(...entries.map(([, v]) => v.col));
    const rowSpan = maxRow - minRow || 1;
    const colSpan = maxCol - minCol || 1;
    const positions: Record<string, { top: string; left: string }> = {};
    for (const [code, { row, col }] of entries) {
      const top = ((row - minRow) / rowSpan) * 85 + 5;
      const left = ((col - minCol) / colSpan) * 88 + 4;
      positions[code] = { top: `${top}%`, left: `${left}%` };
    }
    return positions;
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-lg overflow-hidden select-none" style={{ background: "#030A06" }}>
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(196,160,72,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(196,160,72,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-3">
        <h3 className="font-serif text-[#EDE8DC] text-sm tracking-wide uppercase">Signal Map</h3>
        <span className="font-mono text-[10px] text-[#7A9A82] tracking-widest">
          {filteredSignals.length} SIGNALS · {statesWithSignals.size} STATES
        </span>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-4 flex-wrap">
        {(["hot", "warm", "review"] as SignalStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_GLOW[s], boxShadow: `0 0 6px ${STATUS_GLOW[s]}` }} />
            <span className="font-mono text-[9px] text-[#7A9A82] uppercase tracking-wider">{s}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2 border-l border-[#1E4A2E] pl-3">
          <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLOR.cre }} />
          <span className="font-mono text-[9px] text-[#7A9A82] tracking-wider">CRE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLOR.ma }} />
          <span className="font-mono text-[9px] text-[#7A9A82] tracking-wider">M&A</span>
        </div>
      </div>

      {/* State badge grid */}
      <div className="absolute inset-0 mt-10">
        {Object.entries(STATE_GRID).map(([code]) => {
          const pos = statePositions[code];
          const stateSignals = signalsByState[code] ?? [];
          const count = stateSignals.length;
          const hasSignals = count > 0;
          const isActive = activeState === code;
          const isHovered = hoveredState === code;
          const heatColor = getHeatColor(count, maxSignalsInState);
          const glowShadow = getHeatGlow(count, maxSignalsInState);
          const topStatus = getTopSignalStatus(stateSignals);

          return (
            <motion.button
              key={code}
              className="absolute flex flex-col items-center justify-center cursor-pointer z-10"
              style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
              onClick={() => handleStateClick(code)}
              onMouseEnter={() => setHoveredState(code)}
              onMouseLeave={() => setHoveredState(null)}
              whileHover={{ scale: 1.25, zIndex: 30 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {/* Pulse ring */}
              {hasSignals && (
                <motion.div
                  className="absolute rounded-md"
                  style={{
                    width: isActive ? 52 : 40,
                    height: isActive ? 36 : 28,
                    border: `1px solid ${topStatus ? STATUS_GLOW[topStatus] : heatColor}`,
                    opacity: 0.3,
                  }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Badge body */}
              <div
                className="relative rounded-md px-2 py-1 font-mono text-[11px] font-semibold tracking-wider transition-colors duration-200"
                style={{
                  background: isActive ? `${heatColor}dd` : hasSignals ? `${heatColor}88` : "#0D221822",
                  border: `1px solid ${isActive ? "#C4A048" : hasSignals ? `${heatColor}66` : "#1E4A2E33"}`,
                  color: hasSignals ? "#EDE8DC" : "#7A9A8244",
                  boxShadow: isActive ? `0 0 20px 5px rgba(196,160,72,0.35), ${glowShadow}` : isHovered && hasSignals ? glowShadow : "none",
                  minWidth: 32,
                  textAlign: "center",
                }}
              >
                {code}
                {hasSignals && (
                  <span
                    className="absolute -top-2 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full font-mono text-[9px] font-bold px-1"
                    style={{
                      background: topStatus ? STATUS_GLOW[topStatus] : "#C4A048",
                      color: "#030A06",
                      boxShadow: `0 0 8px ${topStatus ? STATUS_GLOW[topStatus] : "#C4A048"}66`,
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>

              {/* Hover tooltip */}
              <AnimatePresence>
                {isHovered && hasSignals && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full mt-2 z-50 rounded-md px-3 py-2 pointer-events-none"
                    style={{ background: "#0D2218ee", border: "1px solid #1E4A2E", backdropFilter: "blur(8px)", whiteSpace: "nowrap" }}
                  >
                    <p className="font-mono text-[10px] text-[#C4A048] font-semibold tracking-wide">
                      {code} — {count} signal{count > 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-3 mt-1">
                      {stateSignals.filter((s) => s.category === "ma").length > 0 && (
                        <span className="font-mono text-[9px]" style={{ color: CATEGORY_COLOR.ma }}>
                          M&A: {stateSignals.filter((s) => s.category === "ma").length}
                        </span>
                      )}
                      {stateSignals.filter((s) => s.category === "cre").length > 0 && (
                        <span className="font-mono text-[9px]" style={{ color: CATEGORY_COLOR.cre }}>
                          CRE: {stateSignals.filter((s) => s.category === "cre").length}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Active state detail panel */}
      <AnimatePresence>
        {activeState && activeSignals.length > 0 && (
          <motion.div
            key={activeState}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-3 top-12 bottom-3 w-72 z-30 rounded-lg overflow-hidden flex flex-col"
            style={{ background: "linear-gradient(180deg, #0D2218ee 0%, #060E1Aee 100%)", border: "1px solid #1E4A2E", backdropFilter: "blur(12px)" }}
          >
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1E4A2E" }}>
              <div>
                <h4 className="font-serif text-[#EDE8DC] text-sm tracking-wide">{activeState} Signals</h4>
                <p className="font-mono text-[10px] text-[#7A9A82] mt-0.5">
                  {activeSignals.length} active signal{activeSignals.length > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => onStateFilter(null)}
                className="w-6 h-6 flex items-center justify-center rounded text-[#7A9A82] hover:text-[#EDE8DC] hover:bg-[#1E4A2E44] transition-colors font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
              {activeSignals.map((signal, i) => {
                const statusColor = STATUS_GLOW[signal.status];
                const catColor = CATEGORY_COLOR[signal.category];
                return (
                  <motion.button
                    key={signal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => onSignalClick(signal.id)}
                    className="w-full text-left rounded-md px-3 py-2.5 transition-all duration-150 hover:brightness-125 group"
                    style={{ background: "#0D221866", border: `1px solid ${statusColor}33` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <motion.span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
                          animate={signal.status === "hot" ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <span
                          className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                          style={{ color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}22` }}
                        >
                          {signal.category === "ma" ? "M&A" : "CRE"}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold tabular-nums" style={{ color: statusColor }}>
                        {signal.score}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-[#EDE8DC] leading-tight truncate group-hover:text-[#C4A048] transition-colors">
                      {signal.entity}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ color: statusColor, background: `${statusColor}18` }}>
                        {signal.status}
                      </span>
                      <span className="font-mono text-[9px] text-[#7A9A82]">{signal.city}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-3 left-4 z-20">
        <span className="font-mono text-[9px] text-[#7A9A8244] tracking-widest">EAGLEEYE // NEST ADVISORS</span>
      </div>

      {/* Scanline */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none z-10"
        style={{ background: "linear-gradient(90deg, transparent, #C4A04815, transparent)" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
