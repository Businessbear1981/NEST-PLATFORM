"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Brand ───────────────────────────────────────────────────────────────────
const GOLD   = "#C4A048";
const GOLD_HI = "#E8C87A";
const SAGE   = "#7A9A82";
const CREAM  = "#EDE8DC";

// ─── Types ───────────────────────────────────────────────────────────────────
type InstrumentKey = "equity_kicker" | "convertible_note" | "mezzanine";

interface Instrument {
  key: InstrumentKey;
  label: string;
  subtitle: string;
  typical: string;
  risk: string;
  returnRange: string;
}

interface BridgeOpportunity {
  id: number;
  type: string;
  amount: string;
  term: string;
  rate: string;
  status: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────
const INSTRUMENTS: Instrument[] = [
  {
    key: "equity_kicker",
    label: "Equity Kicker",
    subtitle: "Warrants attached to bond; investor gets equity upside",
    typical: "5–15% warrant coverage, 3–5yr exercise window",
    risk: "Dilution",
    returnRange: "15–25% IRR",
  },
  {
    key: "convertible_note",
    label: "Convertible Note",
    subtitle: "Converts to equity at trigger event",
    typical: "8–12% coupon, converts at exit/IPO",
    risk: "Moderate",
    returnRange: "12–20% IRR",
  },
  {
    key: "mezzanine",
    label: "Mezzanine",
    subtitle: "Subordinated debt with higher coupon",
    typical: "12–18% coupon, 3–5yr term, PIK option",
    risk: "Subordinated",
    returnRange: "14–20% IRR",
  },
];

const BRIDGE_OPPORTUNITIES: BridgeOpportunity[] = [
  {
    id: 1,
    type: "Pre-Development Bridge",
    amount: "$2.5M",
    term: "12mo",
    rate: "SOFR+350bps",
    status: "Available",
  },
  {
    id: 2,
    type: "Soft Cost LC Facility",
    amount: "$5M",
    term: "18mo",
    rate: "1.25%/yr LC fee",
    status: "Available",
  },
  {
    id: 3,
    type: "Equity Kicker Bridge",
    amount: "$8M",
    term: "9mo",
    rate: "12%+10% warrants",
    status: "Negotiating",
  },
];

// ─── Helper formatters ────────────────────────────────────────────────────────
function fmt$(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
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
      <p
        className="text-2xl font-bold font-mono"
        style={{ color: accent }}
      >
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
  max?: number;
  step?: number;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
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
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-mono text-right outline-none focus:border-[#C4A048] transition-colors disabled:opacity-30"
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvestorPortalTile() {
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentKey>("mezzanine");
  const [interestedRows, setInterestedRows] = useState<Set<number>>(new Set());

  // Calculator state
  const [investmentAmount, setInvestmentAmount] = useState(10);
  const [couponRate, setCouponRate]             = useState(14);
  const [term, setTerm]                         = useState(3);
  const [equityKicker, setEquityKicker]         = useState(10);
  const [exitMultiple, setExitMultiple]         = useState(1.5);

  // ─── Derived calculations ─────────────────────────────────────────────────
  const totalCashReturn = investmentAmount * (1 + (couponRate / 100) * term);

  const irr =
    totalCashReturn > 0 && investmentAmount > 0 && term > 0
      ? (Math.pow(totalCashReturn / investmentAmount, 1 / term) - 1) * 100
      : 0;

  const dilutionPct =
    selectedInstrument === "equity_kicker"
      ? parseFloat(
          (
            ((equityKicker / 100) * investmentAmount) /
            (exitMultiple * investmentAmount) *
            100
          ).toFixed(1)
        )
      : 0;

  const netIRR = Math.max(0, irr - dilutionPct * 0.5);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function handleIndicate(id: number) {
    setInterestedRows((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  const equityActive = selectedInstrument === "equity_kicker";
  const convertOrEquity =
    selectedInstrument === "convertible_note" || selectedInstrument === "equity_kicker";

  return (
    <div
      className="flex flex-col gap-6 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
      style={{ background: "#030A06" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-semibold"
            style={{ color: CREAM, fontFamily: "Cormorant Garamond, serif", letterSpacing: "0.02em" }}
          >
            Investor Portal
          </h2>
          <p className="text-sm mt-0.5" style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}>
            Instrument selection · IRR modeling · Bridge opportunities
          </p>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1 rounded-full border"
          style={{ color: GOLD, borderColor: `${GOLD}44`, background: `${GOLD}11`, fontFamily: "Space Grotesk, sans-serif" }}
        >
          BOND DESK
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION A — Instrument Picker
         ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionLabel>A — Instrument Selection</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {INSTRUMENTS.map((inst) => {
            const isSelected = selectedInstrument === inst.key;
            return (
              <motion.button
                key={inst.key}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedInstrument(inst.key)}
                className="text-left rounded-2xl border p-4 transition-all duration-200"
                style={{
                  borderColor: isSelected ? GOLD : "rgba(255,255,255,0.08)",
                  background: isSelected ? `${GOLD}14` : "rgba(255,255,255,0.02)",
                  boxShadow: isSelected ? `0 0 0 1px ${GOLD}55` : "none",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p
                    className="text-base font-semibold"
                    style={{
                      color: isSelected ? GOLD_HI : CREAM,
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "1.05rem",
                    }}
                  >
                    {inst.label}
                  </p>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: GOLD }}
                    />
                  )}
                </div>
                <p
                  className="text-xs mb-3 leading-relaxed"
                  style={{ color: SAGE, fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {inst.subtitle}
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-mono" style={{ color: isSelected ? GOLD : SAGE }}>
                    {inst.typical}
                  </p>
                  <div className="flex gap-3 mt-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{
                        color: "#f87171",
                        borderColor: "rgba(248,113,113,0.2)",
                        background: "rgba(248,113,113,0.05)",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      Risk: {inst.risk}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{
                        color: "#34d399",
                        borderColor: "rgba(52,211,153,0.2)",
                        background: "rgba(52,211,153,0.05)",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      {inst.returnRange}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION B — IRR + Dilution Calculator
         ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionLabel>B — IRR &amp; Dilution Calculator</SectionLabel>

        {/* Inputs */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <NumberInput
              label="Investment ($M)"
              value={investmentAmount}
              onChange={setInvestmentAmount}
              min={0.1}
              step={0.5}
              prefix="$"
            />
            <NumberInput
              label="Coupon/Return (%)"
              value={couponRate}
              onChange={setCouponRate}
              min={0}
              max={100}
              step={0.5}
              suffix="%"
            />
            <NumberInput
              label="Term (years)"
              value={term}
              onChange={setTerm}
              min={1}
              max={30}
              step={1}
            />
            <NumberInput
              label="Equity Kicker (%)"
              value={equityKicker}
              onChange={setEquityKicker}
              min={0}
              max={100}
              step={1}
              suffix="%"
              disabled={!equityActive}
            />
            <NumberInput
              label="Exit Multiple (x)"
              value={exitMultiple}
              onChange={setExitMultiple}
              min={0.5}
              max={20}
              step={0.1}
              suffix="x"
              disabled={!convertOrEquity}
            />
          </div>
        </div>

        {/* Output metric cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="Total Cash Return"
            value={`$${fmt$(totalCashReturn)}M`}
            sub={`On $${investmentAmount}M over ${term}yr`}
          />
          <MetricCard
            label="Gross IRR"
            value={fmtPct(irr, 1)}
            sub="Annualised"
            accent={irr >= 15 ? "#34d399" : GOLD}
          />
          <MetricCard
            label="Dilution"
            value={equityActive ? fmtPct(dilutionPct, 1) : "N/A"}
            sub={equityActive ? `${equityKicker}% warrants @ ${exitMultiple}x exit` : "Not applicable"}
            accent={equityActive ? "#f87171" : SAGE}
          />
          <MetricCard
            label="Net IRR (post-dilution)"
            value={fmtPct(netIRR, 1)}
            sub="After dilution adjustment"
            accent={netIRR >= 12 ? "#34d399" : GOLD_HI}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION C — Soft-Cost Bridge Opportunities
         ══════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionLabel>C — Soft-Cost Bridge Opportunities</SectionLabel>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          {/* Table header */}
          <div
            className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-white/[0.06]"
            style={{
              background: "rgba(196,160,72,0.06)",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            {["Type", "Amount", "Term", "Rate", "Status", ""].map((h) => (
              <span
                key={h}
                className="text-xs uppercase tracking-widest"
                style={{ color: SAGE }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {BRIDGE_OPPORTUNITIES.map((opp, idx) => {
            const interested = interestedRows.has(opp.id);
            const isNegotiating = opp.status === "Negotiating";

            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 px-4 py-3.5 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors"
              >
                {/* Type */}
                <span
                  className="text-sm font-medium"
                  style={{ color: CREAM, fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {opp.type}
                </span>

                {/* Amount */}
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color: GOLD }}
                >
                  {opp.amount}
                </span>

                {/* Term */}
                <span
                  className="text-sm font-mono"
                  style={{ color: CREAM }}
                >
                  {opp.term}
                </span>

                {/* Rate */}
                <span
                  className="text-xs font-mono"
                  style={{ color: SAGE }}
                >
                  {opp.rate}
                </span>

                {/* Status badge */}
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border w-fit"
                  style={
                    isNegotiating
                      ? {
                          color: "#fb923c",
                          borderColor: "rgba(251,146,60,0.25)",
                          background: "rgba(251,146,60,0.08)",
                          fontFamily: "Space Grotesk, sans-serif",
                        }
                      : {
                          color: "#34d399",
                          borderColor: "rgba(52,211,153,0.25)",
                          background: "rgba(52,211,153,0.08)",
                          fontFamily: "Space Grotesk, sans-serif",
                        }
                  }
                >
                  {opp.status}
                </span>

                {/* Action */}
                <div className="flex items-center justify-end min-w-[130px]">
                  <AnimatePresence mode="wait">
                    {interested ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-semibold"
                        style={{
                          color: "#34d399",
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                      >
                        ✓ Interest registered
                      </motion.span>
                    ) : (
                      <motion.button
                        key="btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleIndicate(opp.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
                        style={{
                          color: GOLD,
                          borderColor: `${GOLD}55`,
                          background: `${GOLD}11`,
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${GOLD}22`;
                          e.currentTarget.style.color = GOLD_HI;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `${GOLD}11`;
                          e.currentTarget.style.color = GOLD;
                        }}
                      >
                        Indicate Interest
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
