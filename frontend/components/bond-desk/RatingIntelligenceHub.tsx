"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const _API = process.env.NEXT_PUBLIC_API_URL || "https://web-production-5e8af.up.railway.app";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals);
}

function CoverageColor(v: number): string {
  if (v >= 1.5) return "text-emerald-400";
  if (v >= 1.2) return "text-amber-400";
  return "text-red-400";
}

function CoverageBg(v: number): string {
  if (v >= 1.5) return "bg-emerald-400/10 border-emerald-400/30";
  if (v >= 1.2) return "bg-amber-400/10 border-amber-400/30";
  return "bg-red-400/10 border-red-400/30";
}

function CoverageLabel(v: number): string {
  if (v >= 1.5) return "PASS";
  if (v >= 1.2) return "WATCH";
  return "FAIL";
}

// ─── shared card wrapper ────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 ${className}`}>
      {children}
    </div>
  );
}

// ─── mini input card ────────────────────────────────────────────────────────

function InputRow({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  isSlider = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  isSlider?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs font-[Space_Grotesk] text-white/50 shrink-0">{label}</span>
      {isSlider ? (
        <div className="flex items-center gap-2 w-32">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 accent-[#C4A048]"
          />
          <span className="font-mono text-xs text-[#C4A048] w-4 text-right">{value}</span>
        </div>
      ) : (
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 rounded-md border border-white/[0.08] bg-black/30 px-2 py-1 font-mono text-xs text-[#C4A048] text-right focus:outline-none focus:border-[#C4A048]/40"
        />
      )}
    </div>
  );
}

// ─── Section label ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-[10px] font-[Space_Grotesk] uppercase tracking-[0.18em] text-white/30">
        {children}
      </span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

// ─── COLUMN 1: Moody's ─────────────────────────────────────────────────────

function MoodysPanel() {
  const [dscr, setDscr] = useState(1.62);
  const [debtEbitda, setDebtEbitda] = useState(6.0);
  const [ltv, setLtv] = useState(68);

  let tier: "P1" | "P2" | "P3";
  if (dscr >= 2.0 && ltv <= 55) {
    tier = "P1";
  } else if (dscr >= 1.5 && ltv <= 70) {
    tier = "P2";
  } else {
    tier = "P3";
  }

  const config = {
    P1: {
      label: "LOW RISK",
      rating: "Baa1 – A3",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/30",
      dot: "bg-emerald-400",
    },
    P2: {
      label: "MODERATE RISK",
      rating: "Ba1 – Baa3",
      color: "text-[#C4A048]",
      bg: "bg-[#C4A048]/10 border-[#C4A048]/30",
      dot: "bg-[#C4A048]",
    },
    P3: {
      label: "ELEVATED RISK",
      rating: "B1 – Ba3",
      color: "text-red-400",
      bg: "bg-red-400/10 border-red-400/30",
      dot: "bg-red-400",
    },
  }[tier];

  const checks = [
    { label: "Debt Service Coverage", pass: dscr >= 1.5 },
    { label: "Loan-to-Value", pass: ltv <= 70 },
    { label: "Debt / EBITDA", pass: debtEbitda <= 6.5 },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Agency header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">MCO</span>
        <span className="font-[Cormorant_Garamond] text-lg text-[#EDE8DC]">Moody's</span>
        <span className="ml-auto text-[9px] font-mono text-white/30">Binary Risk Model</span>
      </div>

      {/* Inputs */}
      <Card className="gap-0.5 flex flex-col">
        <InputRow label="DSCR (x)" value={dscr} onChange={setDscr} min={0.5} max={4} step={0.01} />
        <InputRow label="Debt/EBITDA" value={debtEbitda} onChange={setDebtEbitda} min={1} max={12} step={0.1} />
        <InputRow label="LTV (%)" value={ltv} onChange={setLtv} min={20} max={100} step={1} />
      </Card>

      {/* Signal badge */}
      <motion.div
        key={tier}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl border px-4 py-3 text-center ${config.bg}`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className={`inline-block w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`font-mono text-xl font-bold ${config.color}`}>{tier}</span>
        </div>
        <div className={`text-[10px] font-[Space_Grotesk] uppercase tracking-widest ${config.color} opacity-80`}>
          {config.label}
        </div>
      </motion.div>

      {/* Estimated rating */}
      <div className="text-center">
        <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1 font-[Space_Grotesk]">Indicative Rating</div>
        <div className="font-[Cormorant_Garamond] text-2xl text-[#C4A048]">{config.rating}</div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            {c.pass ? (
              <span className="text-emerald-400 text-sm">✓</span>
            ) : (
              <span className="text-red-400 text-sm">✗</span>
            )}
            <span className="text-xs font-[Space_Grotesk] text-white/50">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COLUMN 2: S&P ─────────────────────────────────────────────────────────

function SPPanel() {
  const [marketPos, setMarketPos] = useState(3);
  const [revDiv, setRevDiv] = useState(2);
  const [opEff, setOpEff] = useState(3);

  const opbaScore = Math.round(((6 - marketPos + revDiv + opEff) / 3) * 20);
  const clamped = Math.max(0, Math.min(100, opbaScore));

  let category: string;
  let indicativeRating: string;
  if (clamped >= 80) {
    category = "Excellent";
    indicativeRating = "AA– / A+";
  } else if (clamped >= 65) {
    category = "Strong";
    indicativeRating = "A– / BBB+";
  } else if (clamped >= 50) {
    category = "Satisfactory";
    indicativeRating = "BBB / BBB–";
  } else if (clamped >= 35) {
    category = "Weak";
    indicativeRating = "BB+ / BB";
  } else {
    category = "Vulnerable";
    indicativeRating = "BB– / B+";
  }

  const categoryColor =
    clamped >= 80
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
      : clamped >= 65
      ? "text-sky-400 bg-sky-400/10 border-sky-400/30"
      : clamped >= 50
      ? "text-[#C4A048] bg-[#C4A048]/10 border-[#C4A048]/30"
      : clamped >= 35
      ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
      : "text-red-400 bg-red-400/10 border-red-400/30";

  return (
    <div className="flex flex-col gap-4">
      {/* Agency header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">SPGI</span>
        <span className="font-[Cormorant_Garamond] text-lg text-[#EDE8DC]">S&P Global</span>
        <span className="ml-auto text-[9px] font-mono text-white/30">OPBA Model</span>
      </div>

      {/* Inputs */}
      <Card className="gap-1 flex flex-col">
        <InputRow
          label="Market Position"
          value={marketPos}
          onChange={setMarketPos}
          min={1}
          max={5}
          step={1}
          isSlider
        />
        <InputRow
          label="Revenue Diversification"
          value={revDiv}
          onChange={setRevDiv}
          min={1}
          max={5}
          step={1}
          isSlider
        />
        <InputRow
          label="Operating Efficiency"
          value={opEff}
          onChange={setOpEff}
          min={1}
          max={5}
          step={1}
          isSlider
        />
        <div className="text-[9px] text-white/20 font-[Space_Grotesk] mt-1 leading-tight">
          1 = dominant / best · 5 = weakest
        </div>
      </Card>

      {/* OPBA gauge */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">OPBA Score</span>
          <span className="font-mono text-lg font-bold text-[#C4A048]">{clamped}</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-[#C4A048]"
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-white/20">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Category badge */}
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border px-3 py-2 text-center ${categoryColor}`}
      >
        <div className="font-[Space_Grotesk] text-xs font-semibold uppercase tracking-widest">
          {category}
        </div>
      </motion.div>

      {/* Indicative rating */}
      <div className="text-center">
        <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1 font-[Space_Grotesk]">Indicative Rating</div>
        <div className="font-[Cormorant_Garamond] text-2xl text-[#C4A048]">{indicativeRating}</div>
      </div>
    </div>
  );
}

// ─── COLUMN 3: Fitch ───────────────────────────────────────────────────────

function FitchPanel() {
  // Operational stability
  const [cashFlow, setCashFlow] = useState(3);
  const [sponsor, setSponsor] = useState(4);
  const [covenant, setCovenant] = useState(3);

  // Climate.VS
  const [floodZone, setFloodZone] = useState(0); // 0 or 1
  const [physicalRisk, setPhysicalRisk] = useState(2);
  const [mitigation, setMitigation] = useState(1); // 0, 1, 2

  // Stability calculation
  const stabilityScore = Math.round(((cashFlow + sponsor + covenant) / 15) * 100);

  let stabilityLabel: string;
  let stabilityRating: string;
  let stabilityColor: string;
  if (stabilityScore >= 75) {
    stabilityLabel = "Strong Stability";
    stabilityRating = "BBB+ / A–";
    stabilityColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
  } else if (stabilityScore >= 55) {
    stabilityLabel = "Adequate Stability";
    stabilityRating = "BBB– / BBB";
    stabilityColor = "text-[#C4A048] bg-[#C4A048]/10 border-[#C4A048]/30";
  } else {
    stabilityLabel = "Weak Stability";
    stabilityRating = "BB+ / BB";
    stabilityColor = "text-red-400 bg-red-400/10 border-red-400/30";
  }

  // Climate.VS signal
  let climateSignal: string;
  let climateColor: string;
  let climateImpact: string;
  if (physicalRisk <= 2 && mitigation === 2) {
    climateSignal = "Low";
    climateColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    climateImpact = "No tranche adjustment. Climate risk fully mitigated.";
  } else if (physicalRisk <= 2 && mitigation >= 1) {
    climateSignal = "Moderate";
    climateColor = "text-[#C4A048] bg-[#C4A048]/10 border-[#C4A048]/30";
    climateImpact = "Minor adjustment possible. Partial mitigation noted.";
  } else if (physicalRisk <= 3 && floodZone === 0) {
    climateSignal = "Moderate";
    climateColor = "text-[#C4A048] bg-[#C4A048]/10 border-[#C4A048]/30";
    climateImpact = "Watch for transition risk. No flood exposure.";
  } else if (physicalRisk >= 4 || (floodZone === 1 && mitigation === 0)) {
    climateSignal = "Elevated";
    climateColor = "text-amber-500 bg-amber-500/10 border-amber-500/30";
    climateImpact = "Tranche compression likely. Structural protections required.";
  } else if (physicalRisk === 5 && floodZone === 1) {
    climateSignal = "High";
    climateColor = "text-red-400 bg-red-400/10 border-red-400/30";
    climateImpact = "Material downgrade risk. Flood + extreme physical exposure.";
  } else {
    climateSignal = "Moderate";
    climateColor = "text-[#C4A048] bg-[#C4A048]/10 border-[#C4A048]/30";
    climateImpact = "Review mitigation completeness before final tranche pricing.";
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Agency header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">FCO</span>
        <span className="font-[Cormorant_Garamond] text-lg text-[#EDE8DC]">Fitch</span>
        <span className="ml-auto text-[9px] font-mono text-white/30">Stability + Climate.VS</span>
      </div>

      {/* Operational Stability inputs */}
      <Card className="gap-1 flex flex-col">
        <div className="text-[9px] font-[Space_Grotesk] uppercase tracking-widest text-white/30 mb-1">
          Operational Stability
        </div>
        <InputRow
          label="Cash Flow Stability"
          value={cashFlow}
          onChange={setCashFlow}
          min={1}
          max={5}
          step={1}
          isSlider
        />
        <InputRow
          label="Sponsor Track Record"
          value={sponsor}
          onChange={setSponsor}
          min={1}
          max={5}
          step={1}
          isSlider
        />
        <InputRow
          label="Covenant Headroom"
          value={covenant}
          onChange={setCovenant}
          min={1}
          max={5}
          step={1}
          isSlider
        />
      </Card>

      {/* Stability output */}
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[9px] text-white/30 font-mono mb-0.5">Stability Score</div>
          <div className="font-mono text-xl font-bold text-[#C4A048]">{stabilityScore}</div>
        </div>
        <motion.div
          key={stabilityLabel}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex-1 rounded-xl border px-3 py-2 text-center ${stabilityColor}`}
        >
          <div className="text-xs font-[Space_Grotesk] font-semibold">{stabilityLabel}</div>
          <div className="font-[Cormorant_Garamond] text-base mt-0.5">{stabilityRating}</div>
        </motion.div>
      </div>

      {/* Climate.VS divider */}
      <SectionLabel>Climate.VS Signal</SectionLabel>

      {/* Climate inputs */}
      <Card className="flex flex-col gap-1">
        {/* Flood zone toggle */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-[Space_Grotesk] text-white/50">Flood Zone</span>
          <button
            onClick={() => setFloodZone(floodZone === 0 ? 1 : 0)}
            className={`rounded-md px-2.5 py-0.5 text-xs font-mono border transition-colors ${
              floodZone === 1
                ? "bg-red-400/10 border-red-400/30 text-red-400"
                : "bg-white/[0.04] border-white/10 text-white/30"
            }`}
          >
            {floodZone === 1 ? "YES" : "NO"}
          </button>
        </div>
        <InputRow
          label="Physical Risk (1-5)"
          value={physicalRisk}
          onChange={setPhysicalRisk}
          min={1}
          max={5}
          step={1}
          isSlider
        />
        {/* Mitigation selector */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-[Space_Grotesk] text-white/50">Mitigation</span>
          <div className="flex gap-1">
            {["None", "Partial", "Full"].map((label, idx) => (
              <button
                key={label}
                onClick={() => setMitigation(idx)}
                className={`rounded px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                  mitigation === idx
                    ? "bg-[#C4A048]/10 border-[#C4A048]/40 text-[#C4A048]"
                    : "bg-white/[0.03] border-white/[0.06] text-white/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Climate signal output */}
      <motion.div
        key={climateSignal}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl border px-3 py-2.5 ${climateColor}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono uppercase tracking-widest opacity-60">
            Climate.VS
          </span>
          <span className="font-[Space_Grotesk] text-sm font-bold">{climateSignal}</span>
        </div>
        <p className="text-[10px] font-[Space_Grotesk] leading-relaxed opacity-75">
          {climateImpact}
        </p>
      </motion.div>
    </div>
  );
}

// ─── SECTION B: Stress Tester ───────────────────────────────────────────────

function StressTester() {
  const [dscr, setDscr] = useState(1.62);
  const [llcr, setLlcr] = useState(1.85);
  const [plcr, setPlcr] = useState(2.1);

  const metrics = [
    { label: "DSCR", base: dscr, setter: setDscr, min: 0.5, max: 4, step: 0.01 },
    { label: "LLCR", base: llcr, setter: setLlcr, min: 0.5, max: 4, step: 0.01 },
    { label: "PLCR", base: plcr, setter: setPlcr, min: 0.5, max: 4, step: 0.01 },
  ];

  const scenarios = [
    { label: "Base", mult: 1.0 },
    { label: "Downside −15%", mult: 0.85 },
    { label: "Severe −30%", mult: 0.7 },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[Cormorant_Garamond] text-base text-[#EDE8DC]">
          Coverage Ratio Stress Tester
        </h3>
        <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">
          Base → Downside → Severe
        </span>
      </div>

      {/* Inputs row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1">
            <label className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
              {m.label} (Base)
            </label>
            <input
              type="number"
              min={m.min}
              max={m.max}
              step={m.step}
              value={m.base}
              onChange={(e) => m.setter(Number(e.target.value))}
              className="rounded-md border border-white/[0.08] bg-black/30 px-2 py-1.5 font-mono text-sm text-[#C4A048] text-right focus:outline-none focus:border-[#C4A048]/40"
            />
          </div>
        ))}
      </div>

      {/* Results table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left font-mono text-[9px] uppercase tracking-widest text-white/25 pb-2 pr-4">
                Metric
              </th>
              {scenarios.map((s) => (
                <th
                  key={s.label}
                  className="text-right font-mono text-[9px] uppercase tracking-widest text-white/25 pb-2 pr-3"
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {metrics.map((m) => (
              <tr key={m.label}>
                <td className="font-mono text-white/40 py-2 pr-4">{m.label}</td>
                {scenarios.map((s, si) => {
                  const val = m.base * s.mult;
                  return (
                    <td key={si} className="text-right py-2 pr-3">
                      <span className={`font-mono font-medium ${CoverageColor(val)}`}>
                        {fmt(val)}x
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Status row */}
            <tr className="border-t border-white/[0.08]">
              <td className="font-mono text-white/25 py-2 pr-4 text-[9px] uppercase tracking-widest">
                STATUS
              </td>
              {scenarios.map((s, si) => {
                const worstVal = Math.min(dscr, llcr, plcr) * s.mult;
                return (
                  <td key={si} className="text-right py-2 pr-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[9px] font-mono font-semibold border ${CoverageBg(worstVal)} ${CoverageColor(worstVal)}`}
                    >
                      {CoverageLabel(worstVal)}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-white/[0.05]">
        {[
          { label: "≥ 1.50x PASS", color: "text-emerald-400" },
          { label: "1.20 – 1.49x WATCH", color: "text-amber-400" },
          { label: "< 1.20x FAIL", color: "text-red-400" },
        ].map((l) => (
          <div key={l.label} className={`flex items-center gap-1.5 ${l.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="font-mono text-[9px] opacity-70">{l.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── LIVE ANALYSIS PANEL (calls real backend mirror agents) ─────────────────

function LiveAnalysisPanel() {
  const [dscr, setDscr]         = useState(1.62);
  const [ltv, setLtv]           = useState(68);
  const [debtEbitda, setDebt]   = useState(6.0);
  const [state, setState]        = useState("FL");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [error, setError]       = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = { dscr, ltv_pct: ltv, debt_to_ebitda: debtEbitda, bond_face: 150_000_000, state };
      const [dual, climate] = await Promise.all([
        fetch(`${_API}/api/rating/dual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => r.json()),
        fetch(`${_API}/api/rating-esg/climate/assess`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state, ...payload }),
        }).then((r) => r.json()),
      ]);
      setResult({ dual, climate });
    } catch (e: any) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const moodys = result?.dual?.data?.moodys;
  const sp     = result?.dual?.data?.sp;
  const cmp    = result?.dual?.data?.comparison;
  const clim   = result?.climate?.data;

  return (
    <Card className="mb-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-[Cormorant_Garamond] text-lg text-[#EDE8DC]">Live Mirror Analysis</h3>
          <p className="font-[Space_Grotesk] text-[10px] text-white/30 mt-0.5">
            Calls Moody's Mirror Agent + S&P Mirror Agent + State Climate Engine
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-[#C4A048] to-[#E8C87A] px-4 py-2 font-[Space_Grotesk] text-sm font-semibold text-[#030A06] hover:shadow-[0_0_20px_rgba(196,160,72,0.3)] transition-all disabled:opacity-50"
        >
          {loading ? "Running…" : "Run Live Analysis →"}
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 sm:grid-cols-4">
        {[
          { label: "DSCR (x)", val: dscr, set: setDscr, step: 0.01, min: 0.5, max: 4 },
          { label: "LTV (%)", val: ltv, set: setLtv, step: 1, min: 20, max: 100 },
          { label: "Debt/EBITDA", val: debtEbitda, set: setDebt, step: 0.1, min: 1, max: 15 },
        ].map(({ label, val, set, step, min, max }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">{label}</label>
            <input
              type="number"
              value={val}
              min={min}
              max={max}
              step={step}
              onChange={(e) => set(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] focus:border-[#C4A048]/40 focus:outline-none"
            />
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#030A06] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] focus:border-[#C4A048]/40 focus:outline-none"
          >
            {["FL","CA","TX","AZ","WA","NY","GA","NC","OH","PA"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-[10px] font-mono text-red-400 mb-3">{error}</p>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {/* Moody's result */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">MCO</span>
              <span className="font-[Cormorant_Garamond] text-sm text-[#EDE8DC]">Moody's</span>
            </div>
            {moodys ? (
              <>
                <div className="font-[Cormorant_Garamond] text-2xl text-[#C4A048]">
                  {moodys.predicted_rating || "—"}
                </div>
                {moodys.risk_tier && (
                  <div className="font-mono text-[9px] text-white/40 mt-1">{moodys.risk_tier}</div>
                )}
                {moodys.narrative && (
                  <p className="font-[Space_Grotesk] text-[10px] text-white/40 mt-2 leading-relaxed line-clamp-3">
                    {moodys.narrative}
                  </p>
                )}
              </>
            ) : <span className="font-mono text-[10px] text-white/30">No data</span>}
          </div>

          {/* S&P result */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">SPGI</span>
              <span className="font-[Cormorant_Garamond] text-sm text-[#EDE8DC]">S&P Global</span>
            </div>
            {sp ? (
              <>
                <div className="font-[Cormorant_Garamond] text-2xl text-[#C4A048]">
                  {sp.predicted_rating || "—"}
                </div>
                {cmp?.recommendation && (
                  <p className="font-[Space_Grotesk] text-[10px] text-white/40 mt-2 leading-relaxed line-clamp-3">
                    {cmp.recommendation}
                  </p>
                )}
              </>
            ) : <span className="font-mono text-[10px] text-white/30">No data</span>}
          </div>

          {/* Climate result */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">STATE</span>
              <span className="font-[Cormorant_Garamond] text-sm text-[#EDE8DC]">Climate Risk · {state}</span>
            </div>
            {clim ? (
              <>
                <div className={`font-[Cormorant_Garamond] text-xl ${
                  clim.physical_composite > 70 ? "text-red-400"
                  : clim.physical_composite > 50 ? "text-amber-400"
                  : "text-emerald-400"
                }`}>
                  {clim.rating_impact || "Neutral"}
                </div>
                <div className="font-mono text-[9px] text-white/40 mt-1">
                  Physical: {clim.physical_composite}% · Resilience: {clim.resilience_score}/100
                </div>
                {clim.recommended_mitigations?.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {clim.recommended_mitigations.slice(0, 2).map((m: any, i: number) => (
                      <div key={i} className="font-[Space_Grotesk] text-[9px] text-white/35">
                        · {m.action}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : <span className="font-mono text-[10px] text-white/30">No data</span>}
          </div>
        </motion.div>
      )}
    </Card>
  );
}

// ─── ROOT EXPORT ────────────────────────────────────────────────────────────

export default function RatingIntelligenceHub() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-[Cormorant_Garamond] text-2xl text-[#EDE8DC] leading-tight">
            Rating Intelligence Hub
          </h2>
          <p className="font-[Space_Grotesk] text-xs text-white/35 mt-0.5">
            Live mirror agents · agency methodology models · Fitch Climate.VS · stress tester
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {["Moody's", "S&P", "Fitch"].map((a) => (
            <span
              key={a}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 text-[9px] font-mono text-white/30 uppercase tracking-widest"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* ── LIVE MIRROR ANALYSIS ── */}
      <div>
        <SectionLabel>Live Mirror Analysis — Moody's · S&P · Climate</SectionLabel>
        <LiveAnalysisPanel />
      </div>

      {/* ── SECTION A: Agency Rating Panel (local methodology models) ── */}
      <div>
        <SectionLabel>Agency Methodology Preview (Local)</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <MoodysPanel />
          </Card>
          <Card>
            <SPPanel />
          </Card>
          <Card>
            <FitchPanel />
          </Card>
        </div>
      </div>

      {/* ── SECTION B: Stress Tester ── */}
      <div>
        <SectionLabel>Coverage Ratio Stress Testing</SectionLabel>
        <StressTester />
      </div>
    </div>
  );
}
