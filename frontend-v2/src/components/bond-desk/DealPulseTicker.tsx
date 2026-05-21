import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDealState, type MarketSnapshot } from "@/contexts/DealStateContext";
import { useBernard } from "@/contexts/BernardContext";
import { trpc } from "@/lib/trpc";

interface ImpactLine {
  id: string;
  text: string;
  severity: "favorable" | "watch" | "action";
}

const SEVERITY_COLORS = {
  favorable: "text-emerald-400",
  watch: "text-amber-400",
  action: "text-rose-400",
};

export default function DealPulseTicker() {
  const { state, setMarket } = useDealState();
  const bernard = useBernard();
  const [impactLines, setImpactLines] = useState<ImpactLine[]>([]);
  const [visibleLine, setVisibleLine] = useState(0);
  const prevRatesRef = useRef(state.marketSnapshot.treasury_10yr);

  // Fetch live market rates every 15s
  const marketQuery = trpc.powerstrip.marketRates.useQuery(undefined, {
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  // When market data arrives, update context and compute deal impact
  const dealImpactMutation = trpc.bondStructuring.dealImpact.useMutation();

  useEffect(() => {
    if (!marketQuery.data) return;
    const raw = marketQuery.data as Record<string, any>;
    const newSnapshot: MarketSnapshot = {
      treasury_10yr: raw.treasury_10yr_pct ?? raw.treasury_10yr ?? 4.28,
      treasury_5yr: raw.treasury_5yr_pct ?? raw.treasury_5yr ?? 4.05,
      sofr: raw.sofr_pct ?? raw.sofr ?? 5.33,
      ig_spread_bps: (raw.ig_spread ?? 1.12) * 100,
      vix: raw.vix ?? 18.5,
      updated_at: raw.timestamp ?? new Date().toISOString(),
      prev_treasury_10yr: prevRatesRef.current,
    };
    prevRatesRef.current = newSnapshot.treasury_10yr;
    setMarket(newSnapshot);

    // Compute deal impact if we have an active deal with tranches
    if (state.metrics && state.activeDeal) {
      const delta = Math.round((newSnapshot.treasury_10yr - newSnapshot.prev_treasury_10yr) * 100);
      if (delta !== 0) {
        dealImpactMutation.mutate({
          rate_delta_bps: delta,
          current_stack: {
            blended_coupon_pct: state.metrics.blended_coupon_pct,
            total_debt_usd: state.metrics.total_debt_usd,
          },
          deal: {
            stabilized_noi_usd: state.activeDeal.stabilized_noi_usd,
          },
        }, {
          onSuccess: (data: any) => {
            setImpactLines((prev) => [{
              id: crypto.randomUUID(),
              text: data.impact_text,
              severity: data.severity,
            }, ...prev].slice(0, 20));
          },
        });
      }
    }
  }, [marketQuery.data]);

  // Rotate visible impact line every 4s
  useEffect(() => {
    if (impactLines.length <= 1) return;
    const interval = setInterval(() => {
      setVisibleLine((v) => (v + 1) % impactLines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [impactLines.length]);

  const mkt = state.marketSnapshot;
  const delta10yr = Math.round((mkt.treasury_10yr - mkt.prev_treasury_10yr) * 100);
  const win = state.issuanceWindow;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#040a12] via-[#06101c] to-[#040a12] px-6 py-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-amber-500/[0.03]" />

      <div className="relative grid grid-cols-12 gap-4">
        {/* LEFT — Market Vitals (3 cols) */}
        <div className="col-span-3 flex flex-col gap-1.5">
          <div className="mb-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-slate-600">
            Market Vitals
          </div>
          <RateChip label="10yr" value={mkt.treasury_10yr} delta={delta10yr} suffix="%" />
          <RateChip label="SOFR" value={mkt.sofr} suffix="%" />
          <RateChip label="IG Spd" value={mkt.ig_spread_bps} suffix="bp" />
          <RateChip label="VIX" value={mkt.vix} />
        </div>

        {/* CENTER — Deal Impact Stream (6 cols) */}
        <div className="col-span-6 flex flex-col items-center justify-center">
          <div className="mb-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-slate-600">
            Deal Impact
          </div>
          <div className="relative h-8 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {impactLines.length > 0 ? (
                <motion.div
                  key={impactLines[visibleLine]?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] ${
                    SEVERITY_COLORS[impactLines[visibleLine]?.severity ?? "watch"]
                  }`}
                >
                  {impactLines[visibleLine]?.text}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full items-center justify-center font-mono text-[0.65rem] text-slate-600"
                >
                  {state.activeDeal
                    ? "Monitoring deal impact..."
                    : "Set up a deal to see live market impact"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {impactLines.length > 1 && (
            <div className="mt-1 flex gap-1">
              {impactLines.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-1 rounded-full transition-all ${
                    i === visibleLine ? "bg-cyan-400" : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Issuance Window (3 cols) */}
        <div className="col-span-3 flex flex-col items-end gap-1">
          <div className="mb-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-slate-600">
            Issuance Window
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                win.status === "open"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  : win.status === "narrowing"
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse"
                    : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              }`}
            />
            <span className="font-mono text-sm font-semibold text-slate-200 uppercase">
              {win.status}
            </span>
          </div>
          <span className="font-mono text-[0.6rem] text-slate-500">
            {win.hours_remaining}hr window · {Math.round(win.confidence * 100)}% conf
          </span>
          <span className="font-[Space_Grotesk] text-[0.6rem] text-slate-400 italic">
            {win.summary}
          </span>
        </div>
      </div>
    </div>
  );
}

function RateChip({ label, value, delta, suffix = "" }: {
  label: string;
  value: number;
  delta?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[0.75rem] font-semibold text-[#C4A048]">
          {typeof value === "number" ? value.toFixed(2) : value}{suffix}
        </span>
        {delta !== undefined && delta !== 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`font-mono text-[0.55rem] ${delta > 0 ? "text-rose-400" : "text-emerald-400"}`}
          >
            {delta > 0 ? "+" : ""}{delta}bp
          </motion.span>
        )}
      </div>
    </div>
  );
}
