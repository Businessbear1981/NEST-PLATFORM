import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
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

const DEFAULT_CURVE = [
  { tenor: "1mo", label: "1M", rate: 5.28 },
  { tenor: "3mo", label: "3M", rate: 5.25 },
  { tenor: "6mo", label: "6M", rate: 5.10 },
  { tenor: "1yr", label: "1Y", rate: 4.85 },
  { tenor: "2yr", label: "2Y", rate: 4.55 },
  { tenor: "3yr", label: "3Y", rate: 4.42 },
  { tenor: "5yr", label: "5Y", rate: 4.28 },
  { tenor: "7yr", label: "7Y", rate: 4.30 },
  { tenor: "10yr", label: "10Y", rate: 4.28 },
  { tenor: "20yr", label: "20Y", rate: 4.55 },
  { tenor: "30yr", label: "30Y", rate: 4.48 },
];

interface RateCardData {
  label: string;
  value: number;
  delta?: number;
  suffix: string;
  highlight?: boolean;
}

// Custom tooltip for the yield curve chart
function CurveTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-white/[0.12] bg-[#030A06]/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="font-mono text-[0.6rem] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="font-mono text-sm font-semibold text-cyan-300">
        {payload[0]?.value?.toFixed(2)}%
      </p>
    </div>
  );
}

export default function DealPulseTicker() {
  const { state, setMarket } = useDealState();
  const bernard = useBernard();
  const [impactLines, setImpactLines] = useState<ImpactLine[]>([]);
  const [visibleLine, setVisibleLine] = useState(0);
  const [curveData, setCurveData] = useState(DEFAULT_CURVE);
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

    // Update curve if live data provides tenor rates
    if (raw.yield_curve && Array.isArray(raw.yield_curve)) {
      setCurveData(raw.yield_curve);
    } else {
      // Patch known points from the snapshot into the default curve
      setCurveData((prev) =>
        prev.map((pt) => {
          if (pt.tenor === "10yr") return { ...pt, rate: newSnapshot.treasury_10yr };
          if (pt.tenor === "5yr") return { ...pt, rate: newSnapshot.treasury_5yr };
          return pt;
        })
      );
    }

    // Compute deal impact if we have an active deal with tranches
    if (state.metrics && state.activeDeal) {
      const delta = Math.round((newSnapshot.treasury_10yr - newSnapshot.prev_treasury_10yr) * 100);
      if (delta !== 0) {
        dealImpactMutation.mutate(
          {
            rate_delta_bps: delta,
            current_stack: {
              blended_coupon_pct: state.metrics.blended_coupon_pct,
              total_debt_usd: state.metrics.total_debt_usd,
            },
            deal: {
              stabilized_noi_usd: state.activeDeal.stabilized_noi_usd,
            },
          },
          {
            onSuccess: (data: any) => {
              setImpactLines((prev) =>
                [
                  {
                    id: crypto.randomUUID(),
                    text: data.impact_text,
                    severity: data.severity,
                  },
                  ...prev,
                ].slice(0, 20)
              );
            },
          }
        );
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
  const blendedCoupon = state.metrics?.blended_coupon_pct;

  // Rate cards for the right panel
  const rateCards: RateCardData[] = [
    { label: "10Y TSY", value: mkt.treasury_10yr, delta: delta10yr, suffix: "%", highlight: true },
    { label: "5Y TSY", value: mkt.treasury_5yr, suffix: "%" },
    { label: "2Y TSY", value: curveData.find((d) => d.tenor === "2yr")?.rate ?? 4.55, suffix: "%" },
    { label: "SOFR", value: mkt.sofr, suffix: "%", highlight: true },
    { label: "Fed Funds", value: 5.33, suffix: "%" },
    { label: "IG Spd", value: mkt.ig_spread_bps, suffix: "bp" },
    { label: "HY Spd", value: 312, suffix: "bp" },
    { label: "VIX", value: mkt.vix, suffix: "" },
  ];

  // Y-axis domain with padding
  const rates = curveData.map((d) => d.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const yPad = 0.2;
  const yDomain = [
    parseFloat((minRate - yPad).toFixed(2)),
    parseFloat((maxRate + yPad).toFixed(2)),
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#040a12] via-[#06101c] to-[#030A06]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-amber-500/[0.03]" />

      {/* ── TOP BAND: three-zone ticker ─────────────────────────────── */}
      <div className="relative grid grid-cols-12 gap-3 border-b border-white/[0.06] px-4 py-2.5">
        {/* LEFT — Market Vitals (3 cols) */}
        <div className="col-span-3 flex flex-col gap-1">
          <div className="mb-0.5 font-mono text-[0.48rem] uppercase tracking-[0.15em] text-slate-600">
            Market Vitals
          </div>
          <RateChip label="10yr" value={mkt.treasury_10yr} delta={delta10yr} suffix="%" />
          <RateChip label="SOFR" value={mkt.sofr} suffix="%" />
          <RateChip label="IG Spd" value={mkt.ig_spread_bps} suffix="bp" />
          <RateChip label="VIX" value={mkt.vix} />
        </div>

        {/* CENTER — Deal Impact Stream (6 cols) */}
        <div className="col-span-6 flex flex-col items-center justify-center">
          <div className="mb-0.5 font-mono text-[0.48rem] uppercase tracking-[0.15em] text-slate-600">
            Deal Impact
          </div>
          <div className="relative h-7 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {impactLines.length > 0 ? (
                <motion.div
                  key={impactLines[visibleLine]?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 flex items-center justify-center font-mono text-[0.68rem] ${
                    SEVERITY_COLORS[impactLines[visibleLine]?.severity ?? "watch"]
                  }`}
                >
                  {impactLines[visibleLine]?.text}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full items-center justify-center font-mono text-[0.62rem] text-slate-600"
                >
                  {state.activeDeal
                    ? "Monitoring deal impact..."
                    : "Set up a deal to see live market impact"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {impactLines.length > 1 && (
            <div className="mt-0.5 flex gap-1">
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
        <div className="col-span-3 flex flex-col items-end gap-0.5">
          <div className="mb-0.5 font-mono text-[0.48rem] uppercase tracking-[0.15em] text-slate-600">
            Issuance Window
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                win.status === "open"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  : win.status === "narrowing"
                    ? "animate-pulse bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              }`}
            />
            <span className="font-mono text-xs font-semibold uppercase text-slate-200">
              {win.status}
            </span>
          </div>
          <span className="font-mono text-[0.58rem] text-slate-500">
            {win.hours_remaining}hr · {Math.round(win.confidence * 100)}% conf
          </span>
          <span className="font-[Space_Grotesk] text-[0.58rem] italic text-slate-400">
            {win.summary}
          </span>
        </div>
      </div>

      {/* ── BOTTOM SECTION: yield curve + rate cards ────────────────── */}
      <div className="relative grid grid-cols-12 gap-0 px-4 py-3">
        {/* LEFT: yield curve chart (8 cols) */}
        <div className="col-span-8 pr-4">
          {/* Header row */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.48rem] uppercase tracking-[0.15em] text-slate-600">
                US Treasury Yield Curve
              </span>
              {blendedCoupon !== undefined && (
                <span className="rounded border border-[#C4A048]/30 bg-[#C4A048]/10 px-1.5 py-0.5 font-mono text-[0.45rem] uppercase tracking-wider text-[#C4A048]">
                  Deal @ {blendedCoupon.toFixed(2)}%
                </span>
              )}
            </div>
            <span className="font-mono text-[0.45rem] text-slate-700">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ET
            </span>
          </div>

          {/* Chart */}
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={curveData}
                margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{ fill: "#475569", fontSize: 9, fontFamily: "IBM Plex Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />

                <YAxis
                  domain={yDomain}
                  tick={{ fill: "#475569", fontSize: 9, fontFamily: "IBM Plex Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(1)}%`}
                  width={48}
                />

                <Tooltip content={<CurveTooltip />} cursor={{ stroke: "rgba(6,182,212,0.3)", strokeWidth: 1 }} />

                {/* Blended coupon reference line */}
                {blendedCoupon !== undefined && (
                  <ReferenceLine
                    y={blendedCoupon}
                    stroke="#C4A048"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    label={{
                      value: `Deal ${blendedCoupon.toFixed(2)}%`,
                      position: "insideTopRight",
                      fill: "#C4A048",
                      fontSize: 8,
                      fontFamily: "IBM Plex Mono, monospace",
                      fontWeight: 600,
                    }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  fill="url(#curveGradient)"
                  dot={false}
                  activeDot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* SOFR + Prime strip */}
          <div className="mt-2 flex items-center gap-4 border-t border-white/[0.05] pt-1.5">
            <TerminalStat label="SOFR" value={`${mkt.sofr.toFixed(2)}%`} accent="cyan" />
            <TerminalStat label="Prime" value="8.50%" accent="amber" />
            <TerminalStat label="Fed Target" value="5.25–5.50%" accent="slate" />
            <div className="ml-auto font-mono text-[0.45rem] text-slate-700">
              src: UST · SOFR · FRED
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="col-span-0 w-px self-stretch bg-white/[0.06]" />

        {/* RIGHT: rate cards (4 cols) */}
        <div className="col-span-4 pl-4">
          <div className="mb-2 font-mono text-[0.48rem] uppercase tracking-[0.15em] text-slate-600">
            Rates Terminal
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {rateCards.map((card) => (
              <RateCard key={card.label} {...card} />
            ))}
          </div>
        </div>
      </div>

      {/* Terminal scan line effect */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function RateChip({
  label,
  value,
  delta,
  suffix = "",
}: {
  label: string;
  value: number;
  delta?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[0.52rem] uppercase tracking-wider text-slate-600">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[0.72rem] font-semibold text-[#C4A048]">
          {typeof value === "number" ? value.toFixed(2) : value}
          {suffix}
        </span>
        {delta !== undefined && delta !== 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`font-mono text-[0.5rem] ${delta > 0 ? "text-rose-400" : "text-emerald-400"}`}
          >
            {delta > 0 ? "+" : ""}
            {delta}bp
          </motion.span>
        )}
      </div>
    </div>
  );
}

function RateCard({
  label,
  value,
  delta,
  suffix,
  highlight = false,
}: RateCardData) {
  const isUp = delta !== undefined && delta > 0;
  const isDown = delta !== undefined && delta < 0;

  return (
    <div
      className={`rounded border px-2 py-1.5 ${
        highlight
          ? "border-[#C4A048]/20 bg-[#C4A048]/[0.06]"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div className="font-mono text-[0.45rem] uppercase tracking-widest text-slate-600">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span
          className={`font-mono text-[0.78rem] font-semibold leading-none ${
            highlight ? "text-[#C4A048]" : "text-slate-200"
          }`}
        >
          {typeof value === "number" ? value.toFixed(2) : value}
          {suffix}
        </span>
        {delta !== undefined && delta !== 0 && (
          <span
            className={`font-mono text-[0.45rem] ${
              isUp ? "text-rose-400" : isDown ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {isUp ? "▲" : "▼"}
            {Math.abs(delta)}bp
          </span>
        )}
      </div>
    </div>
  );
}

function TerminalStat({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: string;
  accent?: "cyan" | "amber" | "slate";
}) {
  const accentClass = {
    cyan: "text-cyan-400",
    amber: "text-[#C4A048]",
    slate: "text-slate-400",
  }[accent];

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[0.45rem] uppercase tracking-widest text-slate-600">
        {label}
      </span>
      <span className={`font-mono text-[0.7rem] font-semibold ${accentClass}`}>{value}</span>
    </div>
  );
}
