"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type AumTier = "$0-15M" | "$15-40M" | "$40-80M" | "$80M+";
type ProjectType = "performance" | "payment" | "completion" | "hybrid";

interface SuretyInputs {
  bondFaceAmount: number;
  dscr: number;
  ltv: number;
  sponsorNetWorth: number;
  aumTier: AumTier;
  yearsInBusiness: number;
  projectType: ProjectType;
}

interface HylantTier {
  tier: number;
  label: string;
  minAmount: number;
  maxAmount: number | null;
  premiumLow: number;
  premiumHigh: number;
  timelineDays: string;
  providers: string[];
}

interface FourCScores {
  character: number;
  capacity: number;
  capital: number;
  conditions: number;
  overall: number;
}

interface LCPhase {
  label: string;
  indicator: string;
  color: string;
  annualFeeBps: string;
  collateralType: string;
  dotColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HYLANT_TIERS: HylantTier[] = [
  {
    tier: 1,
    label: "Tier 1",
    minAmount: 1_000_000,
    maxAmount: 15_000_000,
    premiumLow: 0.5,
    premiumHigh: 1.5,
    timelineDays: "10–21",
    providers: ["Hylant Group", "Berkshire Hathaway Specialty", "Travelers Surety"],
  },
  {
    tier: 2,
    label: "Tier 2",
    minAmount: 15_000_001,
    maxAmount: 50_000_000,
    premiumLow: 0.4,
    premiumHigh: 1.0,
    timelineDays: "14–28",
    providers: ["Hylant Group", "Berkshire Hathaway Specialty", "Travelers Surety"],
  },
  {
    tier: 3,
    label: "Tier 3",
    minAmount: 50_000_001,
    maxAmount: 100_000_000,
    premiumLow: 0.35,
    premiumHigh: 0.75,
    timelineDays: "21–35",
    providers: ["Hylant Group", "Berkshire Hathaway Specialty", "Travelers Surety"],
  },
  {
    tier: 4,
    label: "Tier 4",
    minAmount: 100_000_001,
    maxAmount: 250_000_000,
    premiumLow: 0.3,
    premiumHigh: 0.6,
    timelineDays: "30–45",
    providers: ["Hylant Group", "Berkshire Hathaway Specialty", "Travelers Surety"],
  },
  {
    tier: 5,
    label: "Tier 5",
    minAmount: 250_000_001,
    maxAmount: null,
    premiumLow: 0.25,
    premiumHigh: 0.5,
    timelineDays: "45–60",
    providers: ["Hylant Group", "Berkshire Hathaway Specialty", "Travelers Surety"],
  },
];

const LC_PHASES: Record<AumTier, LCPhase> = {
  "$0-15M": {
    label: "Surety Only",
    indicator: "🟢",
    color: "text-emerald-400",
    annualFeeBps: "N/A",
    collateralType: "Surety Bond",
    dotColor: "#10B981",
  },
  "$15-40M": {
    label: "Hybrid Phase",
    indicator: "🟡",
    color: "text-yellow-400",
    annualFeeBps: "75–125 bps",
    collateralType: "Surety + Partial LC",
    dotColor: "#FBBF24",
  },
  "$40-80M": {
    label: "LC Dominant",
    indicator: "🟠",
    color: "text-orange-400",
    annualFeeBps: "100–175 bps",
    collateralType: "Letter of Credit",
    dotColor: "#F97316",
  },
  "$80M+": {
    label: "Self-Collateralized",
    indicator: "🔵",
    color: "text-blue-400",
    annualFeeBps: "50–100 bps",
    collateralType: "Balance Sheet / BH",
    dotColor: "#60A5FA",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt$(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtRange$(low: number, high: number | null): string {
  if (high === null) return `${fmt$(low)}+`;
  return `${fmt$(low)} – ${fmt$(high)}`;
}

function getHylantTier(amount: number): HylantTier | null {
  return (
    HYLANT_TIERS.find(
      (t) =>
        amount >= t.minAmount && (t.maxAmount === null || amount <= t.maxAmount)
    ) ?? null
  );
}

function computeScores(inputs: SuretyInputs): FourCScores {
  const { dscr, ltv, sponsorNetWorth, aumTier, yearsInBusiness } = inputs;

  const aumBonus =
    aumTier === "$80M+" ? 25 : aumTier === "$40-80M" ? 15 : 5;
  const character = Math.min(100, Math.round(yearsInBusiness * 6 + aumBonus));

  const ltvBonus = ltv < 65 ? 20 : ltv < 75 ? 10 : 0;
  const capacity = Math.min(100, Math.round(dscr * 40 + ltvBonus));

  const aumCapital = aumTier !== "$0-15M" ? 30 : 0;
  const capital = Math.min(
    100,
    Math.round(Math.min((sponsorNetWorth / 10_000_000) * 20, 50) + aumCapital + 20)
  );

  const dscrBonus = dscr > 1.75 ? 15 : 0;
  const conditions = Math.min(
    100,
    Math.round(70 - (ltv - 55) * 0.8 + dscrBonus)
  );

  const overall = Math.round(
    (character + capacity + capital + conditions) / 4
  );

  return { character, capacity, capital, conditions, overall };
}

function scoreColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#C4A048";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Acceptable";
  if (score >= 40) return "Marginal";
  return "Weak";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreCircle({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const color = scoreColor(score);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={72} height={72} viewBox="0 0 72 72" className="-rotate-90">
        <circle
          cx={36}
          cy={36}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={6}
        />
        <circle
          cx={36}
          cy={36}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <span
        className="font-mono text-base font-bold"
        style={{ color, marginTop: -68 + 24, lineHeight: "72px", position: "relative", zIndex: 1 }}
      >
        {score}
      </span>
      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">
        {label}
      </span>
      <span className="font-mono text-[0.55rem] tracking-wide" style={{ color }}>
        {scoreLabel(score)}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_INPUTS: SuretyInputs = {
  bondFaceAmount: 25_000_000,
  dscr: 1.5,
  ltv: 70,
  sponsorNetWorth: 15_000_000,
  aumTier: "$15-40M",
  yearsInBusiness: 8,
  projectType: "performance",
};

export default function SuretyUnderwritingDashboard() {
  const [inputs, setInputs] = useState<SuretyInputs>(DEFAULT_INPUTS);
  const [evaluated, setEvaluated] = useState(false);
  const [scores, setScores] = useState<FourCScores | null>(null);
  const [tier, setTier] = useState<HylantTier | null>(null);

  function handleChange<K extends keyof SuretyInputs>(
    key: K,
    value: SuretyInputs[K]
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setEvaluated(false);
  }

  function handleEvaluate() {
    const computed = computeScores(inputs);
    const hylantTier = getHylantTier(inputs.bondFaceAmount);
    setScores(computed);
    setTier(hylantTier);
    setEvaluated(true);
  }

  const lcPhase = LC_PHASES[inputs.aumTier];

  const alerts: { type: "error" | "ok"; message: string }[] = [];
  if (evaluated && scores) {
    if (scores.overall < 60) {
      alerts.push({
        type: "error",
        message: "HIGH CLAIM RISK — DSCR below surety threshold",
      });
    }
    if (inputs.dscr < 1.25) {
      alerts.push({
        type: "error",
        message: "Min DSCR 1.25 required — current DSCR fails Tier 1 gate",
      });
    }
    if (inputs.ltv > 80) {
      alerts.push({
        type: "error",
        message: "LTV exceeds 80% surety max — reduce leverage",
      });
    }
    if (alerts.length === 0) {
      alerts.push({ type: "ok", message: "No active claim alerts" });
    }
  }

  return (
    <div className="flex flex-col gap-5 p-1">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-[Cormorant_Garamond] text-2xl font-semibold tracking-tight text-[#EDE8DC]">
            Surety Underwriting
          </h2>
          <p className="font-[Space_Grotesk] text-xs text-[#7A9A82] mt-0.5">
            Hylant-tiered surety analysis · Four C&apos;s scorecard · LC phase mapping
          </p>
        </div>
        <span className="rounded-full border border-[#C4A048]/20 bg-[#C4A048]/5 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-[#C4A048]">
          Surety Engine v1
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* ── LEFT: Inputs Panel ─────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-4">
            <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#C4A048]">
              Deal Inputs
            </p>

            {/* Bond Face Amount */}
            <div>
              <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                Bond Face Amount ($)
              </label>
              <input
                type="number"
                value={inputs.bondFaceAmount}
                onChange={(e) =>
                  handleChange("bondFaceAmount", parseFloat(e.target.value) || 0)
                }
                placeholder="25000000"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] placeholder:text-[#2D6B3D] focus:border-[#C4A048]/40 focus:outline-none"
              />
              {inputs.bondFaceAmount > 0 && (
                <p className="mt-0.5 font-mono text-[0.55rem] text-[#7A9A82]">
                  {fmt$(inputs.bondFaceAmount)}
                </p>
              )}
            </div>

            {/* DSCR */}
            <div>
              <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                DSCR (x)
              </label>
              <input
                type="number"
                step={0.01}
                value={inputs.dscr}
                onChange={(e) =>
                  handleChange("dscr", parseFloat(e.target.value) || 0)
                }
                placeholder="1.50"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] placeholder:text-[#2D6B3D] focus:border-[#C4A048]/40 focus:outline-none"
              />
            </div>

            {/* LTV */}
            <div>
              <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                LTV (%)
              </label>
              <input
                type="number"
                step={0.5}
                value={inputs.ltv}
                onChange={(e) =>
                  handleChange("ltv", parseFloat(e.target.value) || 0)
                }
                placeholder="70"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] placeholder:text-[#2D6B3D] focus:border-[#C4A048]/40 focus:outline-none"
              />
            </div>

            {/* Sponsor Net Worth */}
            <div>
              <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                Sponsor Net Worth ($M)
              </label>
              <input
                type="number"
                step={0.5}
                value={inputs.sponsorNetWorth / 1_000_000}
                onChange={(e) =>
                  handleChange(
                    "sponsorNetWorth",
                    (parseFloat(e.target.value) || 0) * 1_000_000
                  )
                }
                placeholder="15"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] placeholder:text-[#2D6B3D] focus:border-[#C4A048]/40 focus:outline-none"
              />
            </div>

            {/* AUM Tier */}
            <div>
              <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                AUM Tier
              </label>
              <select
                value={inputs.aumTier}
                onChange={(e) =>
                  handleChange("aumTier", e.target.value as AumTier)
                }
                className="w-full rounded-lg border border-white/10 bg-[#030A06] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] focus:border-[#C4A048]/40 focus:outline-none"
              >
                <option value="$0-15M">$0–15M</option>
                <option value="$15-40M">$15–40M</option>
                <option value="$40-80M">$40–80M</option>
                <option value="$80M+">$80M+</option>
              </select>
            </div>

            {/* Years in Business */}
            <div>
              <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                Years in Business
              </label>
              <input
                type="number"
                value={inputs.yearsInBusiness}
                onChange={(e) =>
                  handleChange("yearsInBusiness", parseInt(e.target.value) || 0)
                }
                placeholder="8"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] placeholder:text-[#2D6B3D] focus:border-[#C4A048]/40 focus:outline-none"
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                Project Type
              </label>
              <select
                value={inputs.projectType}
                onChange={(e) =>
                  handleChange("projectType", e.target.value as ProjectType)
                }
                className="w-full rounded-lg border border-white/10 bg-[#030A06] px-3 py-1.5 font-mono text-xs text-[#EDE8DC] focus:border-[#C4A048]/40 focus:outline-none"
              >
                <option value="performance">Performance</option>
                <option value="payment">Payment</option>
                <option value="completion">Completion</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluate}
              className="mt-1 rounded-xl bg-gradient-to-r from-[#C4A048] to-[#E8C87A] px-4 py-2 font-[Space_Grotesk] text-sm font-semibold text-[#030A06] hover:shadow-[0_0_20px_rgba(196,160,72,0.3)] transition-all"
            >
              Evaluate Surety
            </button>
          </div>
        </div>

        {/* ── CENTER: Hylant Tier + Four C's ─────────────────────────── */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">

          {/* Hylant Tier Result */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#C4A048] mb-3">
              Hylant Tier Result
            </p>

            {evaluated && tier ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-3"
              >
                {/* Tier Badge */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: "#C4A04866",
                      background: "rgba(196,160,72,0.08)",
                    }}
                  >
                    <span className="font-[Cormorant_Garamond] text-xl font-bold text-[#C4A048]">
                      T{tier.tier}
                    </span>
                  </div>
                  <div>
                    <p className="font-[Cormorant_Garamond] text-lg font-semibold text-[#EDE8DC]">
                      {tier.label}
                    </p>
                    <p className="font-mono text-[0.6rem] text-[#7A9A82]">
                      {fmtRange$(tier.minAmount, tier.maxAmount)}
                    </p>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <p className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82]">
                      Premium Range
                    </p>
                    <p className="font-mono text-sm font-semibold text-[#C4A048] mt-0.5">
                      {tier.premiumLow.toFixed(2)}% – {tier.premiumHigh.toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <p className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82]">
                      UW Timeline
                    </p>
                    <p className="font-mono text-sm font-semibold text-[#EDE8DC] mt-0.5">
                      {tier.timelineDays} days
                    </p>
                  </div>
                </div>

                {/* Estimated Premium */}
                <div className="rounded-xl border border-[#C4A048]/20 bg-[#C4A048]/5 p-2.5">
                  <p className="font-mono text-[0.5rem] uppercase tracking-wider text-[#C4A048]">
                    Estimated Premium on {fmt$(inputs.bondFaceAmount)}
                  </p>
                  <p className="font-mono text-sm font-semibold text-[#EDE8DC] mt-0.5">
                    {fmt$(inputs.bondFaceAmount * tier.premiumLow / 100)}
                    &nbsp;–&nbsp;
                    {fmt$(inputs.bondFaceAmount * tier.premiumHigh / 100)}
                  </p>
                </div>

                {/* Providers */}
                <div>
                  <p className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82] mb-1.5">
                    Typical Providers
                  </p>
                  <div className="flex flex-col gap-1">
                    {tier.providers.map((p) => (
                      <div
                        key={p}
                        className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-[#7A9A82]" />
                        <span className="font-mono text-[0.65rem] text-[#EDE8DC]">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="font-mono text-xs text-[#2D6B3D]">
                  Enter inputs and click Evaluate Surety
                </p>
              </div>
            )}
          </div>

          {/* Four C's Scorecard */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-baseline justify-between mb-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#C4A048]">
                Four C&apos;s Scorecard
              </p>
              {evaluated && scores && (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[0.55rem] text-[#7A9A82]">
                    Overall
                  </span>
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: scoreColor(scores.overall) }}
                  >
                    {scores.overall}
                  </span>
                  <span
                    className="font-mono text-[0.55rem]"
                    style={{ color: scoreColor(scores.overall) }}
                  >
                    / 100
                  </span>
                </div>
              )}
            </div>

            {evaluated && scores ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { label: "Character", key: "character" },
                      { label: "Capacity", key: "capacity" },
                      { label: "Capital", key: "capital" },
                      { label: "Conditions", key: "conditions" },
                    ] as { label: string; key: keyof FourCScores }[]
                  ).map(({ label, key }) => (
                    <div key={key} className="flex flex-col items-center">
                      {/* Score circle reimplemented inline to avoid svg overlap issue */}
                      <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
                        <svg width={64} height={64} viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                          <circle
                            cx={32}
                            cy={32}
                            r={26}
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth={6}
                          />
                          <circle
                            cx={32}
                            cy={32}
                            r={26}
                            fill="none"
                            stroke={scoreColor(scores[key] as number)}
                            strokeWidth={6}
                            strokeDasharray={`${((scores[key] as number) / 100) * (2 * Math.PI * 26)} ${(2 * Math.PI * 26)}`}
                            strokeLinecap="round"
                            style={{
                              filter: `drop-shadow(0 0 5px ${scoreColor(scores[key] as number)}55)`,
                            }}
                          />
                        </svg>
                        <span
                          className="relative z-10 font-mono text-sm font-bold"
                          style={{ color: scoreColor(scores[key] as number) }}
                        >
                          {scores[key]}
                        </span>
                      </div>
                      <span className="mt-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] text-center">
                        {label}
                      </span>
                      <span
                        className="font-mono text-[0.5rem] tracking-wide"
                        style={{ color: scoreColor(scores[key] as number) }}
                      >
                        {scoreLabel(scores[key] as number)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Overall bar */}
                <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                      Surety Score
                    </span>
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: scoreColor(scores.overall) }}
                    >
                      {scores.overall} / 100 · {scoreLabel(scores.overall)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores.overall}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${scoreColor(scores.overall)}aa, ${scoreColor(scores.overall)})`,
                        boxShadow: `0 0 8px ${scoreColor(scores.overall)}44`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-28 items-center justify-center">
                <p className="font-mono text-xs text-[#2D6B3D]">
                  Awaiting evaluation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: LC Phase Indicator ───────────────────────────────── */}
        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-4 h-full">
            <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#C4A048]">
              LC Phase Indicator
            </p>

            {/* Phase display */}
            <motion.div
              key={inputs.aumTier}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3 flex-1 justify-center"
            >
              {/* Pulse dot */}
              <div className="relative flex items-center justify-center">
                <div
                  className="h-16 w-16 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${lcPhase.dotColor}22, transparent 70%)`,
                    border: `2px solid ${lcPhase.dotColor}44`,
                  }}
                />
                <span
                  className="absolute font-mono text-3xl"
                  style={{ filter: "drop-shadow(0 0 12px currentColor)" }}
                >
                  {lcPhase.indicator}
                </span>
              </div>

              <div className="text-center">
                <p
                  className={`font-[Cormorant_Garamond] text-xl font-semibold ${lcPhase.color}`}
                >
                  {lcPhase.label}
                </p>
                <p className="font-mono text-[0.6rem] text-[#7A9A82] mt-0.5">
                  AUM Tier: {inputs.aumTier}
                </p>
              </div>
            </motion.div>

            {/* Phase details */}
            <div className="flex flex-col gap-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <p className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82]">
                  Annual LC Fee
                </p>
                <p className="font-mono text-sm font-semibold text-[#EDE8DC] mt-0.5">
                  {lcPhase.annualFeeBps}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <p className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82]">
                  Collateral Type
                </p>
                <p className="font-mono text-xs font-semibold text-[#EDE8DC] mt-0.5">
                  {lcPhase.collateralType}
                </p>
              </div>
            </div>

            {/* Phase ladder */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <p className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82] mb-2">
                Phase Ladder
              </p>
              <div className="flex flex-col gap-1.5">
                {(Object.entries(LC_PHASES) as [AumTier, LCPhase][]).map(
                  ([tier, phase]) => (
                    <div
                      key={tier}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all ${
                        inputs.aumTier === tier
                          ? "border border-white/10 bg-white/[0.04]"
                          : ""
                      }`}
                    >
                      <div
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ background: phase.dotColor }}
                      />
                      <span className="font-mono text-[0.55rem] text-[#7A9A82] truncate">
                        {tier}
                      </span>
                      <span
                        className={`ml-auto font-mono text-[0.5rem] flex-shrink-0 ${
                          inputs.aumTier === tier
                            ? phase.color
                            : "text-[#2D6B3D]"
                        }`}
                      >
                        {phase.label.split(" ")[0]}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Claims Prevention Alerts (bottom strip) ─────────────────────── */}
      {evaluated && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-2"
        >
          <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#C4A048]">
            Claims Prevention Alerts
          </p>
          <div className="flex flex-col gap-1.5">
            {alerts.map((alert, i) =>
              alert.type === "error" ? (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5"
                >
                  <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="font-mono text-xs font-semibold text-red-400">
                    {alert.message}
                  </span>
                </div>
              ) : (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="font-mono text-xs font-semibold text-emerald-400">
                    {alert.message}
                  </span>
                </div>
              )
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
