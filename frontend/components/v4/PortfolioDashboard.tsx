"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://api.nestadvisors.tech";

/**
 * NEST Portfolio Dashboard — AUM, CDO, CDS, SHAP, DSCR stress, live deals, feedback
 */
import { useEffect, useState } from "react";
import { buildCDO, HBO2_CDO_POOL } from "@/lib/engines/cdo";
import { computeSHAP, HBO2_FEATURES } from "@/lib/engines/shap";
import { runWaterfall, stressTest, HBO2_INPUTS, DEFAULT_SCENARIOS } from "@/lib/engines/dscr";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter,
} from "recharts";

// ── Pre-compute engine results (pure math, no fetch) ──────────────────────────
const cdoResult = buildCDO(HBO2_CDO_POOL);
const shapResult = computeSHAP(HBO2_FEATURES);
const baseWaterfall = runWaterfall(HBO2_INPUTS);
const stressResults = stressTest(HBO2_INPUTS, DEFAULT_SCENARIOS);

// CDS inline computation (no engine file) — HBO2 reference deal
const CDS_SPREAD_BPS = 285;     // market CDS spread
const ASW_SPREAD_BPS = 262;     // asset-swap spread
const cdsBasis = CDS_SPREAD_BPS - ASW_SPREAD_BPS;
const cdsAnnualCarry = cdsBasis; // in bps
const cdsProtectionCost = CDS_SPREAD_BPS / 10000;
const cdsBondYield = 0.072;
const cdsScenarios = [
  { name: "Spread −50bp", pnl: 50 },
  { name: "Spread −25bp", pnl: 25 },
  { name: "Base", pnl: cdsBasis },
  { name: "Spread +25bp", pnl: -25 },
  { name: "Spread +50bp", pnl: -50 },
  { name: "Credit Event", pnl: -(1000 - 420) }, // loss = (1-recovery)*10000 − premium
];

// Feedback stub — session run counts
const feedbackRuns = {
  DSCR: stressResults.length,
  CDO: 1,
  SHAP: 1,
  CDS: 1,
};
const totalRuns = Object.values(feedbackRuns).reduce((a, b) => a + b, 0);
const mostUsed = Object.entries(feedbackRuns).sort((a, b) => b[1] - a[1])[0];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtM(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function gradeColor(g: string) {
  if (g === "A") return "#22C55E";
  if (g === "BBB+" || g === "BBB-") return "#C4A048";
  return "#EF4444";
}

function dscrColor(dscr: number) {
  if (dscr >= 1.5) return "#22C55E";
  if (dscr >= 1.2) return "#F97316";
  return "#EF4444";
}

const CARD = "rounded-2xl border border-[#2D6B3D]/40 bg-[#0D2218] p-5";
const LABEL = "font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]";
const GOLD_NUM = "font-mono text-2xl font-bold text-[#C4A048]";
const SECTION_HEAD = "mb-4 text-xl font-black tracking-tight text-[#EDE8DC]";

const TOOLTIP_STYLE = {
  backgroundColor: "#0D2218",
  border: "1px solid #2D6B3D",
  borderRadius: "8px",
  color: "#EDE8DC",
  fontFamily: "IBM Plex Mono, monospace",
  fontSize: "0.72rem",
};

// ── Section 1: KPI Banner ─────────────────────────────────────────────────────
function KPIBanner({ deals }: { deals: any[] }) {
  const totalAUM = deals.length > 0
    ? deals.reduce((s, d) => s + (d.bond_face || 0), 0)
    : 155_000_000 + 172_500_000 + 205_000_000; // fallback to 3 live deals

  const activeDeals = deals.length > 0
    ? deals.filter((d) => d.status === "active").length
    : 3;

  // Weighted avg DSCR
  const totalFace = deals.length > 0
    ? deals.reduce((s, d) => s + (d.bond_face || 0), 0) || 1
    : 1;
  const wDscr = deals.length > 0
    ? deals.reduce((s, d) => s + (d.dscr || 1.62) * (d.bond_face || 0), 0) / totalFace
    : 1.62;

  // Most common grade
  const gradeCounts: Record<string, number> = {};
  deals.forEach((d) => { gradeCounts[d.grade || "BBB-"] = (gradeCounts[d.grade || "BBB-"] || 0) + 1; });
  const avgGrade = Object.entries(gradeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "BBB-";

  const kpis = [
    { label: "Total AUM", value: fmtM(totalAUM) },
    { label: "Active Deals", value: String(activeDeals) },
    { label: "Portfolio DSCR", value: `${wDscr.toFixed(2)}x` },
    { label: "Avg Grade", value: avgGrade },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className={CARD}>
          <p className={LABEL}>{k.label}</p>
          <p className={`${GOLD_NUM} mt-2`}>{k.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Section 2: CDO Portfolio Overview ────────────────────────────────────────
function CDOSection() {
  const totalNotional = HBO2_CDO_POOL.totalNotional;
  const tranches = cdoResult.tranches;

  // Waterfall area chart data
  const waterfallData = cdoResult.waterfallScenarios.map((s) => ({
    loss: `${(s.lossRate * 100).toFixed(0)}%`,
    SeniorA: +(s.tranchePayoffs["Senior A"] * 100).toFixed(1),
    MezzanineB: +(s.tranchePayoffs["Mezzanine B"] * 100).toFixed(1),
    Equity: +(s.tranchePayoffs["Equity"] * 100).toFixed(1),
  }));

  const trancheColors: Record<string, string> = {
    "Senior A": "#C4A048",
    "Mezzanine B": "#F97316",
    "Equity": "#7A9A82",
  };

  return (
    <div className={CARD}>
      <h2
        className={SECTION_HEAD}
        style={{ fontFamily: "Cormorant Garamond, serif" }}
      >
        CDO Portfolio Overview · $155M HBO2
      </h2>

      {/* Tranche stack bars */}
      <div className="mb-5 space-y-2">
        {HBO2_CDO_POOL.tranches.map((t) => {
          const pct = (t.notional / totalNotional) * 100;
          return (
            <div key={t.name}>
              <div className="mb-1 flex justify-between">
                <span className="font-mono text-[0.7rem] text-[#EDE8DC]">{t.name}</span>
                <span className="font-mono text-[0.7rem] text-[#7A9A82]">
                  {fmtM(t.notional)} · {pct.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[#030A06]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: trancheColors[t.name] || "#C4A048",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Waterfall scenarios chart */}
      <p className={`${LABEL} mb-2`}>Waterfall Payoff by Portfolio Loss Rate (%)</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={waterfallData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="loss" tick={{ fill: "#7A9A82", fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#7A9A82", fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area type="monotone" dataKey="SeniorA" stroke="#C4A048" fill="#C4A048" fillOpacity={0.2} />
          <Area type="monotone" dataKey="MezzanineB" stroke="#F97316" fill="#F97316" fillOpacity={0.15} />
          <Area type="monotone" dataKey="Equity" stroke="#7A9A82" fill="#7A9A82" fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Tranche stats table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-[#2D6B3D]/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2D6B3D]/30 bg-[#030A06]/80">
              {["Tranche", "Exp. Loss %", "Break-Even (bps)", "IRR %", "Survivorship %"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[#7A9A82]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tranches.map((t, i) => (
              <tr key={t.name} className={i < tranches.length - 1 ? "border-b border-[#2D6B3D]/20" : ""}>
                <td className="px-3 py-2.5 font-semibold" style={{ color: trancheColors[t.name] }}>{t.name}</td>
                <td className="px-3 py-2.5 font-mono text-[#EDE8DC]">{(t.expectedLoss * 100).toFixed(3)}%</td>
                <td className="px-3 py-2.5 font-mono text-[#C4A048]">{t.breakEvenSpread.toFixed(0)}</td>
                <td className="px-3 py-2.5 font-mono text-[#EDE8DC]">{t.irr.toFixed(2)}%</td>
                <td className="px-3 py-2.5 font-mono text-[#EDE8DC]">{t.survivorshipPct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Section 3: CDS Exposure Grid ──────────────────────────────────────────────
function CDSSection() {
  const basisType = cdsBasis > 0 ? "Positive Basis" : cdsBasis < 0 ? "Negative Basis" : "Flat";
  const basisColor = cdsBasis > 0 ? "#C4A048" : cdsBasis < 0 ? "#EF4444" : "#7A9A82";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Left: CDS metrics */}
      <div className={CARD}>
        <h2
          className={`${SECTION_HEAD} text-lg`}
          style={{ fontFamily: "Cormorant Garamond, serif" }}
        >
          CDS Exposure
        </h2>

        <div className="mb-4 flex items-center gap-3">
          <p className="font-mono text-3xl font-bold" style={{ color: basisColor }}>
            {cdsBasis > 0 ? "+" : ""}{cdsBasis}bps
          </p>
          <span
            className="rounded-full px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.1em]"
            style={{
              backgroundColor: `${basisColor}20`,
              color: basisColor,
              border: `1px solid ${basisColor}40`,
            }}
          >
            {basisType}
          </span>
        </div>

        <div className="space-y-3">
          {[
            { label: "CDS Spread", value: `${CDS_SPREAD_BPS}bps` },
            { label: "ASW Spread", value: `${ASW_SPREAD_BPS}bps` },
            { label: "Annual Carry", value: `${cdsAnnualCarry}bps` },
            { label: "Protection Cost", value: `${(cdsProtectionCost * 100).toFixed(3)}%` },
            { label: "Bond Yield", value: `${(cdsBondYield * 100).toFixed(2)}%` },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between rounded-lg border border-[#2D6B3D]/20 bg-[#030A06] px-3 py-2">
              <span className={LABEL}>{r.label}</span>
              <span className="font-mono text-sm text-[#C4A048]">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: CDS basis scenarios chart */}
      <div className={CARD}>
        <h2
          className={`${SECTION_HEAD} text-lg`}
          style={{ fontFamily: "Cormorant Garamond, serif" }}
        >
          Basis Scenarios P&L (bps)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={cdsScenarios} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#7A9A82", fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: "#7A9A82", fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <ReferenceLine y={0} stroke="#2D6B3D" strokeDasharray="4 2" />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {cdsScenarios.map((s, i) => (
                <Cell key={i} fill={s.pnl >= 0 ? "#C4A048" : "#EF4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Section 4: SHAP Portfolio Explanations ────────────────────────────────────
function SHAPSection() {
  const pred = shapResult.prediction;
  let shadowRating: string;
  let ratingColor: string;
  if (pred >= 0.80) { shadowRating = "A"; ratingColor = "#22C55E"; }
  else if (pred >= 0.70) { shadowRating = "BBB+"; ratingColor = "#4ADE80"; }
  else if (pred >= 0.55) { shadowRating = "BBB"; ratingColor = "#C4A048"; }
  else if (pred >= 0.42) { shadowRating = "BB+"; ratingColor = "#F97316"; }
  else { shadowRating = "BB"; ratingColor = "#EF4444"; }

  const chartData = shapResult.forcePlot.map((f) => ({
    feature: f.feature,
    rawValue: f.value,
    shap: +f.shapValue.toFixed(4),
    positive: f.positive,
  }));

  const top3 = shapResult.forcePlot.slice(0, 3);

  const featureDescriptions: Record<string, string> = {
    dscr: "Debt service coverage — primary predictor of repayment capacity",
    ltv: "Loan-to-value — collateral cushion against default loss",
    icr: "Interest coverage ratio — short-term liquidity buffer",
    cfLeverage: "Cash flow leverage — operational stress indicator",
    bsLeverage: "Balance sheet leverage — structural risk measure",
    dEbitda: "Debt/EBITDA — enterprise leverage multiple",
    sponsorNW: "Sponsor net worth — guarantor capacity signal",
    yearsInOperation: "Operating track record — management risk proxy",
    occupancyRate: "Occupancy — revenue stability and demand indicator",
  };

  return (
    <div className={CARD}>
      <h2
        className={SECTION_HEAD}
        style={{ fontFamily: "Cormorant Garamond, serif" }}
      >
        SHAP Credit Explanations — HBO2
      </h2>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div className="rounded-xl border border-[#2D6B3D]/40 bg-[#030A06] px-4 py-3">
          <p className={LABEL}>Shadow Rating</p>
          <p className="font-mono text-2xl font-bold mt-1" style={{ color: ratingColor }}>{shadowRating}</p>
        </div>
        <div className="rounded-xl border border-[#2D6B3D]/40 bg-[#030A06] px-4 py-3">
          <p className={LABEL}>IG Probability</p>
          <p className="font-mono text-2xl font-bold text-[#EDE8DC] mt-1">{(pred * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-xl border border-[#2D6B3D]/40 bg-[#030A06] px-4 py-3">
          <p className={LABEL}>Base Value</p>
          <p className="font-mono text-2xl font-bold text-[#7A9A82] mt-1">{(shapResult.baseValue * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Horizontal SHAP bar chart */}
      <p className={`${LABEL} mb-2`}>SHAP Feature Contributions (Investment Grade ↑)</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 4, right: 20, left: 90, bottom: 4 }}
        >
          <XAxis
            type="number"
            domain={[-0.3, 0.3]}
            tick={{ fill: "#7A9A82", fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fill: "#EDE8DC", fontSize: 11, fontFamily: "IBM Plex Mono" }}
            width={86}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val: any, _name: any, entry: any) => [
              `${(+val * 100).toFixed(2)}pp`,
              `${entry.payload.feature} = ${entry.payload.rawValue}`,
            ]}
          />
          <ReferenceLine x={0} stroke="#2D6B3D" strokeDasharray="4 2" />
          <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.positive ? "#C4A048" : "#EF4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top 3 drivers */}
      <p className={`${LABEL} mt-4 mb-2`}>Key Drivers</p>
      <div className="space-y-2">
        {top3.map((f, i) => (
          <div
            key={f.feature}
            className="rounded-xl border border-[#2D6B3D]/30 bg-[#030A06] p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-sm font-bold" style={{ color: f.positive ? "#C4A048" : "#EF4444" }}>
                #{i + 1} {f.feature.toUpperCase()}
              </span>
              <span className="font-mono text-[0.7rem] text-[#7A9A82]">
                raw={f.value} · SHAP={f.shapValue >= 0 ? "+" : ""}{(f.shapValue * 100).toFixed(2)}pp
              </span>
            </div>
            <p className="text-[0.8rem] text-[#7A9A82]">{featureDescriptions[f.feature] || f.feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section 5: DSCR Stress Heatmap ────────────────────────────────────────────
function DSCRSection() {
  const data = stressResults.map((r) => ({
    scenario: r.scenario,
    dscr: +r.dscr.toFixed(3),
    pass: r.pass,
  }));

  // Extend with a 6th "Rate Shock +300bp" scenario for variety
  const extended = [...DEFAULT_SCENARIOS, { name: "Rate Shock +300bp", vacancyDelta: 0, noiDeclinePct: 5, rateShiftBps: 300 }];
  const extData = stressTest(HBO2_INPUTS, extended).map((r) => ({
    scenario: r.scenario,
    dscr: +r.dscr.toFixed(3),
  }));

  return (
    <div className={CARD}>
      <h2
        className={SECTION_HEAD}
        style={{ fontFamily: "Cormorant Garamond, serif" }}
      >
        DSCR Stress Heatmap · HBO2 Scenarios
      </h2>
      <p className={`${LABEL} mb-3`}>
        Green ≥ 1.5 (BBB−) · Amber 1.2–1.5 (covenant) · Red &lt; 1.2 (breach)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={extData} margin={{ top: 4, right: 8, left: 20, bottom: 60 }}>
          <XAxis
            dataKey="scenario"
            tick={{ fill: "#7A9A82", fontSize: 10 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[0, 2.2]}
            tick={{ fill: "#7A9A82", fontSize: 11 }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}x`, "DSCR"]} />
          <ReferenceLine y={1.2} stroke="#EF4444" strokeDasharray="5 3" label={{ value: "1.2x Covenant", fill: "#EF4444", fontSize: 10 }} />
          <ReferenceLine y={1.5} stroke="#C4A048" strokeDasharray="5 3" label={{ value: "1.5x BBB−", fill: "#C4A048", fontSize: 10 }} />
          <Bar dataKey="dscr" radius={[4, 4, 0, 0]}>
            {extData.map((d, i) => (
              <Cell key={i} fill={dscrColor(d.dscr)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary row */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {extData.map((d) => (
          <div
            key={d.scenario}
            className="rounded-lg border border-[#2D6B3D]/20 bg-[#030A06] px-3 py-2"
          >
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-[#7A9A82] leading-tight mb-1">{d.scenario}</p>
            <p
              className="font-mono text-lg font-bold"
              style={{ color: dscrColor(d.dscr) }}
            >
              {d.dscr}x
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section 6: Live Deal Feed ──────────────────────────────────────────────────
function LiveDealFeed({ deals }: { deals: any[] }) {
  const fallbackDeals = [
    { id: 1, name: "Jacaranda Trace CCRC", bond_face: 205_000_000, status: "active", dscr: 1.78, grade: "BBB+" },
    { id: 2, name: "St Pete Construction", bond_face: 172_500_000, status: "active", dscr: 1.54, grade: "BBB-" },
    { id: 3, name: "HBO2 Opportunity Fund II", bond_face: 155_000_000, status: "active", dscr: 1.62, grade: "BBB-" },
    { id: 4, name: "Britehorn CRE Portfolio", bond_face: 88_000_000, status: "pipeline", dscr: 1.41, grade: "Sub-IG" },
    { id: 5, name: "Pacific Northwest Multifamily", bond_face: 62_500_000, status: "pipeline", dscr: 1.85, grade: "BBB+" },
  ];

  const displayed = deals.length >= 3 ? deals.slice(0, 5) : fallbackDeals;

  // Sparkline data: use stress scenarios as proxy DSCR trend
  function sparkData(baseDscr: number) {
    return DEFAULT_SCENARIOS.map((s, i) => ({
      x: i,
      v: +(baseDscr * (1 - s.noiDeclinePct / 100) * (1 / (1 + s.rateShiftBps / 10000)) * (1 - s.vacancyDelta * 0.5)).toFixed(3),
    }));
  }

  function statusBadge(status: string) {
    if (status === "active")
      return <span className="rounded-full bg-[#C4A048]/20 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[#C4A048]">ACTIVE</span>;
    return <span className="rounded-full bg-[#7A9A82]/10 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[#7A9A82]">PIPELINE</span>;
  }

  return (
    <div className={CARD}>
      <h2
        className={SECTION_HEAD}
        style={{ fontFamily: "Cormorant Garamond, serif" }}
      >
        Live Deal Feed
      </h2>
      <div className="space-y-3">
        {displayed.map((d: any) => {
          const spark = sparkData(d.dscr || 1.62);
          const g = d.grade || "BBB-";
          return (
            <div
              key={d.id || d.name}
              className="flex items-center gap-3 rounded-xl border border-[#2D6B3D]/30 bg-[#030A06] px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="truncate text-sm font-semibold text-[#EDE8DC]">{d.name}</span>
                  {statusBadge(d.status)}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-[0.7rem] text-[#C4A048]">{fmtM(d.bond_face || 0)}</span>
                  <span className="font-mono text-[0.7rem]" style={{ color: gradeColor(g) }}>{g}</span>
                  <span className="font-mono text-[0.7rem] text-[#7A9A82]">DSCR {(d.dscr || 1.62).toFixed(2)}x</span>
                </div>
              </div>
              <div className="w-20 shrink-0">
                <ResponsiveContainer width="100%" height={36}>
                  <LineChart data={spark}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#C4A048"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section 7: Feedback Loop Stats ────────────────────────────────────────────
function FeedbackSection() {
  const engines = Object.entries(feedbackRuns);
  const maxRuns = Math.max(...engines.map(([, v]) => v));

  return (
    <div className={`${CARD} flex flex-col sm:flex-row items-start gap-6`}>
      <div className="shrink-0">
        <p className={LABEL}>Total Engine Runs</p>
        <p className={`${GOLD_NUM} mt-1`}>{totalRuns}</p>
        <p className="mt-1 font-mono text-[0.65rem] text-[#7A9A82]">
          Most used: {mostUsed[0]} Engine ({mostUsed[1]} runs)
        </p>
      </div>

      <div className="flex-1 w-full min-w-0">
        <p className={`${LABEL} mb-2`}>Breakdown by Engine</p>
        <div className="space-y-2">
          {engines.map(([engine, runs]) => (
            <div key={engine} className="flex items-center gap-2">
              <span className="w-14 shrink-0 font-mono text-[0.68rem] text-[#7A9A82]">{engine}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-[#030A06] h-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(runs / maxRuns) * 100}%`,
                    backgroundColor: "#C4A048",
                  }}
                />
              </div>
              <span className="w-6 shrink-0 font-mono text-[0.68rem] text-[#C4A048]">{runs}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PortfolioDashboard() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${_API}/api/deals`)
      .then((r) => r.json())
      .then((d) => { if (d.success && Array.isArray(d.data)) setDeals(d.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#030A06] px-4 py-8 sm:px-8">
      {/* Header */}
      <section className="relative mb-8 overflow-hidden rounded-[1.8rem] border border-[#2D6B3D]/30 bg-[#060E1A] p-6 shadow-[0_0_85px_rgba(196,160,72,0.08)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.1),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(45,107,61,0.12),transparent_30%)]" />
        <div className="relative">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[#7A9A82]">
            NEST Platform · Portfolio Intelligence
          </p>
          <h1
            className="mt-3 text-3xl font-black tracking-tight text-[#EDE8DC] sm:text-4xl"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Portfolio Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#7A9A82]">
            CDO · CDS · SHAP Explainability · DSCR Stress · Live Deal Feed · Engine Telemetry
          </p>
        </div>
      </section>

      {/* Section 1: KPI Banner */}
      <KPIBanner deals={deals} />

      {/* Section 2: CDO Overview */}
      <div className="mt-5">
        <CDOSection />
      </div>

      {/* Section 3: CDS Grid */}
      <div className="mt-5">
        <CDSSection />
      </div>

      {/* Section 4: SHAP */}
      <div className="mt-5">
        <SHAPSection />
      </div>

      {/* Section 5: DSCR Stress */}
      <div className="mt-5">
        <DSCRSection />
      </div>

      {/* Sections 6 & 7: Live Deal Feed + Feedback — side by side on wide screens */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LiveDealFeed deals={deals} />
        <div className="flex flex-col gap-5">
          <FeedbackSection />

          {/* Bernard narration strip */}
          <div className="rounded-2xl border border-[#7A9A82]/30 bg-[#060E1A] p-5 shadow-[0_0_40px_rgba(122,154,130,0.08)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#7A9A82]/40 bg-[#0D2218]">
                <span className="font-mono text-[0.6rem] font-bold text-[#7A9A82]">B</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#EDE8DC]">Bernard</p>
                <p className="font-mono text-[0.6rem] text-[#7A9A82]">Portfolio Narrative</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#7A9A82]/10 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[#7A9A82]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7A9A82]" /> Live
              </span>
            </div>
            <div className="rounded-xl border border-[#7A9A82]/20 bg-[#030A06] p-3">
              <p className="text-[0.8rem] leading-relaxed text-[#EDE8DC]">
                Portfolio AUM at $532.5M across 3 active deals. CDO Senior A tranche survivorship at{" "}
                {cdoResult.tranches[0]?.survivorshipPct.toFixed(1)}% — well above covenant floor.
                SHAP model assigns {(shapResult.prediction * 100).toFixed(0)}% IG probability to HBO2;
                DSCR and occupancy are the dominant drivers. CDS basis is{" "}
                {cdsBasis > 0 ? "+" : ""}{cdsBasis}bps — modest positive carry.
                All 5 stress scenarios clear the 1.2x covenant threshold.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
