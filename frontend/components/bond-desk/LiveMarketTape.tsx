"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

interface Tick {
  label: string;
  value: string;
  delta?: number;
  suffix: string;
}

const FALLBACK_TICKS: Tick[] = [
  { label: "10Y TSY", value: "4.28", suffix: "%" },
  { label: "5Y TSY",  value: "4.05", suffix: "%" },
  { label: "2Y TSY",  value: "4.55", suffix: "%" },
  { label: "SOFR",    value: "5.33", suffix: "%" },
  { label: "FED FDS", value: "5.33", suffix: "%" },
  { label: "IG SPRD", value: "112",  suffix: "bp" },
  { label: "HY SPRD", value: "312",  suffix: "bp" },
  { label: "VIX",     value: "18.5", suffix: "" },
  { label: "MTGE30",  value: "6.85", suffix: "%" },
  { label: "LIBOR3M", value: "5.59", suffix: "%" },
  { label: "DXY",     value: "104.2",suffix: "" },
  { label: "WTI",     value: "78.4", suffix: "" },
];

function fmt(v: number, decimals = 2) {
  return v.toFixed(decimals);
}

export default function LiveMarketTape() {
  const tapeRef = useRef<HTMLDivElement>(null);
  const [ticks, setTicks] = useState<Tick[]>(FALLBACK_TICKS);
  const [flashKeys, setFlashKeys] = useState<Set<string>>(new Set());

  const mktQuery = trpc.powerstrip.marketRates.useQuery(undefined, {
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!mktQuery.data) return;
    const raw = mktQuery.data as Record<string, any>;
    const t10 = raw.treasury_10yr_pct ?? raw.treasury_10yr ?? 4.28;
    const t5  = raw.treasury_5yr_pct  ?? raw.treasury_5yr  ?? 4.05;
    const sof = raw.sofr_pct ?? raw.sofr ?? 5.33;
    const ig  = (raw.ig_spread ?? 1.12) * 100;
    const vix = raw.vix ?? 18.5;
    const mtge = raw.mortgage_30yr_pct ?? raw.mortgage_30yr ?? 6.85;

    const next: Tick[] = [
      { label: "10Y TSY", value: fmt(t10),  suffix: "%",  delta: raw.treasury_10yr_delta },
      { label: "5Y TSY",  value: fmt(t5),   suffix: "%" },
      { label: "2Y TSY",  value: fmt(raw.treasury_2yr ?? 4.55), suffix: "%" },
      { label: "SOFR",    value: fmt(sof),  suffix: "%" },
      { label: "FED FDS", value: fmt(raw.fed_funds ?? 5.33), suffix: "%" },
      { label: "IG SPRD", value: fmt(ig, 0),suffix: "bp" },
      { label: "HY SPRD", value: fmt(raw.hy_spread ?? 312, 0), suffix: "bp" },
      { label: "VIX",     value: fmt(vix, 1), suffix: "" },
      { label: "MTGE30",  value: fmt(mtge), suffix: "%" },
      { label: "CMBS AAA",value: fmt(raw.cmbs_aaa_spread ?? 105, 0), suffix: "bp" },
      { label: "SOURCE",  value: raw.source ?? "FRED", suffix: "" },
    ];

    // Flash changed values
    const changed = new Set<string>();
    next.forEach((n, i) => {
      if (ticks[i] && ticks[i].value !== n.value) changed.add(n.label);
    });
    if (changed.size > 0) {
      setFlashKeys(changed);
      setTimeout(() => setFlashKeys(new Set()), 1200);
    }
    setTicks(next);
  }, [mktQuery.data]);

  // Duplicate tape for seamless loop
  const tape = [...ticks, ...ticks, ...ticks];

  return (
    <div className="relative overflow-hidden border-b border-white/[0.06] bg-[#020608]">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#020608] to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#020608] to-transparent" />

      {/* Live indicator */}
      <div className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="font-mono text-[0.5rem] uppercase tracking-widest text-emerald-500">
          {mktQuery.isFetching ? "UPDATING" : "LIVE"}
        </span>
      </div>

      {/* Scrolling tape */}
      <motion.div
        ref={tapeRef}
        className="flex items-center gap-0 py-1.5 pl-20"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {tape.map((tick, i) => (
          <div key={`${tick.label}-${i}`} className="flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={tick.value}
                className="flex items-baseline gap-1 px-4"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
              >
                <span className="font-mono text-[0.52rem] uppercase tracking-widest text-slate-500">
                  {tick.label}
                </span>
                <motion.span
                  className={`font-mono text-[0.72rem] font-semibold tabular-nums transition-colors ${
                    flashKeys.has(tick.label)
                      ? "text-emerald-300"
                      : tick.label === "VIX"
                      ? "text-amber-300"
                      : tick.label.includes("SPRD") || tick.label.includes("bp")
                      ? "text-rose-300"
                      : "text-[#C4A048]"
                  }`}
                  animate={flashKeys.has(tick.label) ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {tick.value}{tick.suffix}
                </motion.span>
                {tick.delta !== undefined && tick.delta !== 0 && (
                  <span className={`font-mono text-[0.5rem] ${tick.delta > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {tick.delta > 0 ? "▲" : "▼"}{Math.abs(tick.delta)}bp
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
            <span className="text-white/[0.08]">│</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
