"use client";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";

const _API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

// ─── Brand ───────────────────────────────────────────────────────────────────
const GOLD    = "#C4A048";
const GOLD_HI = "#E8C87A";
const SAGE    = "#7A9A82";
const CREAM   = "#EDE8DC";

// ─── Types ───────────────────────────────────────────────────────────────────
type TrusteeKey = "usbank" | "bny" | "wells" | "wilmington";

interface Trustee {
  key: TrusteeKey;
  name: string;
  hq: string;
  aum: string;
  feeRange: string;
  bondTypes: string;
  status: "PREFERRED NEST PARTNER" | "TIER 1" | "SPECIALTY";
  baseFee: number;          // USD
  bpsRate: number;          // decimal — e.g. 0.00008
}

// ─── Static trustee data ──────────────────────────────────────────────────────
const TRUSTEES: Trustee[] = [
  {
    key: "usbank",
    name: "U.S. Bank Corporate Trust",
    hq: "Minneapolis, MN",
    aum: "$8.3T+",
    feeRange: "$15,000–$35,000 base + 0.5–2bps on par",
    bondTypes: "Muni, CMBS, ABS, 501(c)(3)",
    status: "PREFERRED NEST PARTNER",
    baseFee: 25_000,
    bpsRate: 0.00008,
  },
  {
    key: "bny",
    name: "BNY Mellon Corporate Trust",
    hq: "New York, NY",
    aum: "$45T+",
    feeRange: "$20,000–$50,000 base + 0.5–3bps on par",
    bondTypes: "All",
    status: "TIER 1",
    baseFee: 35_000,
    bpsRate: 0.0001,
  },
  {
    key: "wells",
    name: "Wells Fargo Corporate Trust",
    hq: "Charlotte, NC",
    aum: "$6.2T+",
    feeRange: "$12,000–$28,000 base + 0.5–2bps on par",
    bondTypes: "Muni, ABS, 501(c)(3)",
    status: "TIER 1",
    baseFee: 20_000,
    bpsRate: 0.00008,
  },
  {
    key: "wilmington",
    name: "Wilmington Trust",
    hq: "Wilmington, DE",
    aum: "$1.8T+",
    feeRange: "$10,000–$25,000 base + 0.5–2bps",
    bondTypes: "CMBS, Structured Finance, Muni",
    status: "SPECIALTY",
    baseFee: 18_000,
    bpsRate: 0.00007,
  },
];

// ─── Badge styling ────────────────────────────────────────────────────────────
function badgeStyle(status: Trustee["status"]): React.CSSProperties {
  if (status === "PREFERRED NEST PARTNER") {
    return {
      color: GOLD,
      borderColor: `${GOLD}44`,
      background: `${GOLD}11`,
      fontFamily: "Space Grotesk, sans-serif",
    };
  }
  if (status === "TIER 1") {
    return {
      color: "#34d399",
      borderColor: "rgba(52,211,153,0.25)",
      background: "rgba(52,211,153,0.08)",
      fontFamily: "Space Grotesk, sans-serif",
    };
  }
  // SPECIALTY
  return {
    color: SAGE,
    borderColor: `${SAGE}44`,
    background: `${SAGE}11`,
    fontFamily: "Space Grotesk, sans-serif",
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtUSDCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmtUSD(n);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]"
      style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
    >
      {children}
    </p>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function MetricCard({ label, value, sub, accent = GOLD }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-1">
      <p
        className="text-xs uppercase tracking-widest"
        style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
      >
        {label}
      </p>
      <p className="text-xl font-bold font-mono" style={{ color: accent }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  step = 1,
  prefix,
  suffix,
}: NumberInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs uppercase tracking-wider"
        style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
      >
        {label}
      </label>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="text-sm font-mono" style={{ color: SAGE }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-mono text-right outline-none focus:border-[#C4A048] transition-colors"
          style={{ color: CREAM }}
        />
        {suffix && (
          <span className="text-sm font-mono" style={{ color: SAGE }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Waterfall Bar ────────────────────────────────────────────────────────────
interface WaterfallBarProps {
  segments: { label: string; value: number; color: string }[];
  total: number;
}

function WaterfallBar({ segments, total }: WaterfallBarProps) {
  if (total <= 0) return null;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex w-full h-8 rounded-xl overflow-hidden border border-white/[0.08]">
        {segments.map((seg, i) => {
          const pct = Math.max(0, (seg.value / total) * 100);
          return (
            <motion.div
              key={seg.label}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="h-full relative flex items-center justify-center overflow-hidden"
              style={{ background: seg.color, minWidth: pct > 3 ? undefined : 0 }}
            >
              {pct > 8 && (
                <span
                  className="text-[10px] font-mono font-bold absolute"
                  style={{ color: "#030A06" }}
                >
                  {pct.toFixed(0)}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
            <span
              className="text-xs"
              style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
            >
              {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrusteeManagementPanel() {
  const [selectedTrustee, setSelectedTrustee] = useState<TrusteeKey>("usbank");
  const [bondFace, setBondFace]               = useState(150_000_000);

  // Waterfall inputs
  const [bondPar, setBondPar]               = useState(150);   // $M
  const [seniorRecovery, setSeniorRecovery] = useState(85);    // %
  const [subRecovery, setSubRecovery]       = useState(45);    // %
  const [yearsToResolution, setYears]       = useState(2);

  // ─── Fee computations ──────────────────────────────────────────────────────
  const feeTable = useMemo(() => {
    return TRUSTEES.map((t) => {
      const parFee = bondFace * t.bpsRate;
      const total  = t.baseFee + parFee;
      return { key: t.key, name: t.name, baseFee: t.baseFee, parFee, total };
    });
  }, [bondFace]);

  const lowestTotal = useMemo(() => Math.min(...feeTable.map((r) => r.total)), [feeTable]);

  // Fee for selected trustee (annual, in dollars)
  const selectedTrusteeAnnualFee = useMemo(() => {
    return feeTable.find((r) => r.key === selectedTrustee)?.total ?? 0;
  }, [feeTable, selectedTrustee]);

  // ─── Waterfall computations ─────────────────────────────────────────────────
  const {
    seniorRecoveryVal,
    subRecoveryVal,
    trusteeTotalCost,
    netToEstate,
    summary,
    summaryColor,
    waterfallSegments,
    waterfallTotal,
  } = useMemo(() => {
    const bondParUSD   = bondPar * 1_000_000;
    const trusteeFeesUSD = selectedTrusteeAnnualFee;

    const seniorRecoveryVal   = bondParUSD * 0.75 * (seniorRecovery / 100);
    const subRecoveryVal      = bondParUSD * 0.07 * (subRecovery / 100);
    const trusteeTotalCost    = trusteeFeesUSD * yearsToResolution;
    const reserve             = bondParUSD * 0.05;
    const netToEstate         =
      (seniorRecoveryVal + subRecoveryVal) - (trusteeTotalCost) - reserve;

    let summary: string;
    let summaryColor: string;
    if (netToEstate > bondParUSD * 0.8) {
      summary = "ADEQUATE";
      summaryColor = "#34d399";
    } else if (netToEstate > bondParUSD * 0.6) {
      summary = "MODERATE";
      summaryColor = GOLD;
    } else {
      summary = "DISTRESSED";
      summaryColor = "#f87171";
    }

    const remaining = Math.max(0, bondParUSD - seniorRecoveryVal - subRecoveryVal - reserve - trusteeTotalCost);

    const waterfallSegments = [
      { label: "Senior (Series A)", value: seniorRecoveryVal, color: GOLD },
      { label: "Sub (Series B)",    value: subRecoveryVal,    color: "#22d3ee" },
      { label: "Reserve",           value: reserve,           color: SAGE },
      { label: "Trustee Costs",     value: trusteeTotalCost,  color: "#f87171" },
      { label: "Unrecovered",       value: remaining,         color: "rgba(255,255,255,0.08)" },
    ];

    const waterfallTotal = bondParUSD;

    return {
      seniorRecoveryVal,
      subRecoveryVal,
      trusteeTotalCost,
      netToEstate,
      summary,
      summaryColor,
      waterfallSegments,
      waterfallTotal,
    };
  }, [bondPar, seniorRecovery, subRecovery, selectedTrusteeAnnualFee, yearsToResolution]);

  // ─── Real trustee task list from backend ─────────────────────────────────
  const [tasks, setTasks]       = useState<any[]>([]);
  const [tasksLoaded, setTL]    = useState(false);

  useEffect(() => {
    fetch(`${_API}/api/rating-esg/trustee/tasks`)
      .then((r) => r.json())
      .then((d) => { setTasks(d?.data?.tasks || []); setTL(true); })
      .catch(() => setTL(true));
  }, []);

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await fetch(`${_API}/api/rating-esg/trustee/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      setTasks((prev) =>
        prev.map((t) => t.id === taskId ? { ...t, status: nextStatus } : t)
      );
    } catch {}
  };

  return (
    <div
      className="flex flex-col gap-6 p-6 rounded-2xl border border-white/[0.08]"
      style={{ background: "#020b14" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-semibold"
            style={{ color: CREAM, fontFamily: "Cormorant Garamond, serif", letterSpacing: "0.02em" }}
          >
            Trustee Management
          </h2>
          <p className="text-sm mt-0.5" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
            Directory · Fee comparison · Waterfall recovery simulator
          </p>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1 rounded-full border"
          style={{
            color: GOLD,
            borderColor: `${GOLD}44`,
            background: `${GOLD}11`,
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          BOND DESK
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION A — Master Trustee Directory
         ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionLabel>A — Master Trustee Directory</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TRUSTEES.map((trustee) => {
            const isSelected = selectedTrustee === trustee.key;
            return (
              <motion.button
                key={trustee.key}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => setSelectedTrustee(trustee.key)}
                className="text-left rounded-2xl border p-4 transition-all duration-200"
                style={{
                  borderColor: isSelected ? GOLD : "rgba(255,255,255,0.08)",
                  background: isSelected ? `${GOLD}10` : "rgba(255,255,255,0.02)",
                  boxShadow: isSelected ? `0 0 0 1px ${GOLD}44` : "none",
                }}
              >
                {/* Trustee name + status badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p
                    className="text-base font-semibold leading-snug"
                    style={{
                      color: isSelected ? GOLD_HI : CREAM,
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "1.05rem",
                    }}
                  >
                    {trustee.name}
                  </p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 whitespace-nowrap"
                    style={badgeStyle(trustee.status)}
                  >
                    {trustee.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
                      HQ
                    </p>
                    <p className="text-xs font-mono" style={{ color: CREAM }}>
                      {trustee.hq}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
                      AUM Served
                    </p>
                    <p className="text-xs font-mono font-semibold" style={{ color: GOLD }}>
                      {trustee.aum}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
                      Annual Fee
                    </p>
                    <p className="text-xs font-mono" style={{ color: CREAM }}>
                      {trustee.feeRange}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
                      Bond Types
                    </p>
                    <p className="text-xs" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
                      {trustee.bondTypes}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION B — Fee Comparison Table
         ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionLabel>B — Fee Comparison Table</SectionLabel>

        {/* Bond face input */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 mb-4">
          <div className="max-w-xs">
            <NumberInput
              label="Bond Face Amount ($)"
              value={bondFace}
              onChange={setBondFace}
              min={0}
              step={1_000_000}
              prefix="$"
            />
          </div>
          <p className="mt-2 text-xs" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
            {`Current face: ${fmtUSDCompact(bondFace)}`}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          {/* Header */}
          <div
            className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-4 px-4 py-2.5 border-b border-white/[0.06]"
            style={{ background: `${GOLD}0A` }}
          >
            {["Trustee", "Base Fee", "Par-Based Fee", "Total Est. Annual"].map((h) => (
              <span
                key={h}
                className="text-xs uppercase tracking-widest"
                style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {feeTable.map((row, idx) => {
            const isLowest   = row.total === lowestTotal;
            const isSelected = row.key === selectedTrustee;
            return (
              <motion.div
                key={row.key}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-4 px-4 py-3.5 items-center border-b border-white/[0.04] last:border-0 transition-colors"
                style={{
                  background: isSelected
                    ? `${GOLD}08`
                    : "transparent",
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: isSelected ? GOLD_HI : CREAM, fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {row.name}
                </span>
                <span className="text-sm font-mono" style={{ color: CREAM }}>
                  {fmtUSD(row.baseFee)}
                </span>
                <span className="text-sm font-mono" style={{ color: CREAM }}>
                  {fmtUSD(Math.round(row.parFee))}
                </span>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color: isLowest ? "#34d399" : GOLD }}
                >
                  {fmtUSD(Math.round(row.total))}
                  {isLowest && (
                    <span
                      className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color: "#34d399",
                        background: "rgba(52,211,153,0.12)",
                        border: "1px solid rgba(52,211,153,0.2)",
                      }}
                    >
                      LOWEST
                    </span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION C — Waterfall Recovery Simulator
         ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionLabel>C — Waterfall Recovery Simulator</SectionLabel>

        {/* Inputs */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <NumberInput
              label="Total Bond Par ($M)"
              value={bondPar}
              onChange={setBondPar}
              min={1}
              step={5}
              prefix="$"
            />
            <NumberInput
              label="Senior Recovery (%)"
              value={seniorRecovery}
              onChange={setSeniorRecovery}
              min={0}
              step={1}
              suffix="%"
            />
            <NumberInput
              label="Sub Recovery (%)"
              value={subRecovery}
              onChange={setSubRecovery}
              min={0}
              step={1}
              suffix="%"
            />
            <div className="flex flex-col gap-1">
              <label
                className="text-xs uppercase tracking-wider"
                style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
              >
                Trustee Fees ($/yr)
              </label>
              <div
                className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm font-mono"
                style={{ color: GOLD }}
              >
                {fmtUSD(Math.round(selectedTrusteeAnnualFee))}
              </div>
              <p className="text-[10px]" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
                Auto from selected trustee
              </p>
            </div>
            <NumberInput
              label="Years to Resolution"
              value={yearsToResolution}
              onChange={setYears}
              min={1}
              step={1}
            />
          </div>
        </div>

        {/* Waterfall bar */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 mb-4">
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
          >
            Tranche Recovery Waterfall — ${bondPar}M Par
          </p>
          <WaterfallBar segments={waterfallSegments} total={waterfallTotal} />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <MetricCard
            label="Senior Recovery"
            value={fmtUSDCompact(seniorRecoveryVal)}
            sub="Series A — 75% of par"
            accent={GOLD}
          />
          <MetricCard
            label="Sub Recovery"
            value={fmtUSDCompact(subRecoveryVal)}
            sub="Series B — 7% of par"
            accent="#22d3ee"
          />
          <MetricCard
            label="Trustee Total Cost"
            value={fmtUSDCompact(trusteeTotalCost)}
            sub={`${yearsToResolution}yr × ${fmtUSDCompact(selectedTrusteeAnnualFee)}/yr`}
            accent="#f87171"
          />
          <MetricCard
            label="Net to Estate"
            value={netToEstate > 0 ? fmtUSDCompact(netToEstate) : `(${fmtUSDCompact(Math.abs(netToEstate))})`}
            sub="After trustee costs + 5% reserve"
            accent={netToEstate > 0 ? "#34d399" : "#f87171"}
          />
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-1 col-span-2 sm:col-span-1">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
            >
              Recovery Status
            </p>
            <p
              className="text-xl font-bold font-mono"
              style={{ color: summaryColor }}
            >
              {summary}
            </p>
            <div
              className="mt-1 h-1 rounded-full w-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width:
                    summary === "ADEQUATE"
                      ? "90%"
                      : summary === "MODERATE"
                      ? "55%"
                      : "25%",
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ background: summaryColor }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION D — Live Trustee Task Checklist (from backend)
         ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionLabel>D — Trustee Task Checklist (Live)</SectionLabel>
        {!tasksLoaded ? (
          <p className="text-xs font-mono text-white/30">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="text-xs font-mono text-white/30">No tasks returned from backend.</p>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            {/* Phase groups */}
            {["pre-issuance", "post-issuance", "ongoing"].map((phase) => {
              const phaseTasks = tasks.filter((t) => t.phase === phase);
              if (!phaseTasks.length) return null;
              const completed = phaseTasks.filter((t) => t.status === "completed").length;
              return (
                <div key={phase} className="border-b border-white/[0.05] last:border-0">
                  <div
                    className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]"
                    style={{ background: `${GOLD}07` }}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: GOLD }}>
                      {phase.replace("-", " ")}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: SAGE }}>
                      {completed}/{phaseTasks.length} complete
                    </span>
                  </div>
                  {phaseTasks.map((task) => (
                    <motion.button
                      key={task.id}
                      onClick={() => toggleTask(task.id, task.status)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <div
                        className="flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: task.status === "completed" ? GOLD : "rgba(255,255,255,0.15)",
                          background: task.status === "completed" ? `${GOLD}20` : "transparent",
                        }}
                      >
                        {task.status === "completed" && (
                          <span style={{ color: GOLD, fontSize: 10, fontWeight: 700 }}>✓</span>
                        )}
                      </div>
                      <span
                        className="text-sm flex-1"
                        style={{
                          color: task.status === "completed" ? SAGE : CREAM,
                          fontFamily: "Space Grotesk, sans-serif",
                          textDecoration: task.status === "completed" ? "line-through" : "none",
                          opacity: task.status === "completed" ? 0.6 : 1,
                        }}
                      >
                        {task.task}
                      </span>
                    </motion.button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
