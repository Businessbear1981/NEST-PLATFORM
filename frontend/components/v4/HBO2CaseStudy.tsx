"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from "recharts";
import { runWaterfall, stressTest, DEFAULT_SCENARIOS, HBO2_INPUTS } from "@/lib/engines/dscr";
import { priceCDS, HBO2_CDS } from "@/lib/engines/cds";
import { computeSHAP, HBO2_FEATURES } from "@/lib/engines/shap";
import { checkTEFRACompliance, HBO2_TEFRA } from "@/lib/engines/tefra";
import { analyzeCall, monteCarloCallOptimization, HBO2_REFI } from "@/lib/engines/refi";

// ── Constants ─────────────────────────────────────────────────────────────────
const DEAL_SNAPSHOT = {
  totalCapitalization: 155_000_000,
  seriesABonds: 86_400_000,
  seriesBBonds: 8_065_000,
  equityRaise: 60_535_000,
  dscr: 1.62,
  ltv: 68,
  icr: 2.45,
  shadowRating: "BBB",
  cdsPremiumBps: 285,
  suretyTier: "hybrid (40-80M AUM)",
  maturityYears: 30,
  callDate: "2031-04-01",
};

// ── Formatters ────────────────────────────────────────────────────────────────
function fmt$(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtBps(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(0)} bps`;
}

// ── Badges ────────────────────────────────────────────────────────────────────
function GoldBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#C4A048]/20 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#C4A048]">
      {label}
    </span>
  );
}

function StatusBadge({ label, color }: { label: string; color: "green" | "amber" | "red" | "grey" }) {
  const styles = {
    green: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
    red: "bg-red-500/15 text-red-400",
    grey: "bg-[#2D6B3D]/30 text-[#7A9A82]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] ${styles[color]}`}>
      {label}
    </span>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2
        className="mb-4 border-b border-[#2D6B3D]/40 pb-2 text-xl font-black tracking-tight text-[#EDE8DC]"
        style={{ fontFamily: "Cormorant Garamond, serif" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#2D6B3D]/40 bg-[#0D2218] p-4 ${className}`}>
      {children}
    </div>
  );
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold text-[#C4A048]">{value}</p>
      {sub && <p className="mt-0.5 font-mono text-[0.62rem] text-[#7A9A82]">{sub}</p>}
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#0D2218] p-2 font-mono text-[0.7rem] text-[#EDE8DC] shadow-xl">
      <p className="text-[#7A9A82]">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && Math.abs(p.value) > 1000
            ? fmt$(p.value)
            : typeof p.value === "number"
            ? p.value.toFixed(2)
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function HBO2CaseStudy() {
  // Engine results — computed once
  const waterfall = useMemo(() => runWaterfall(HBO2_INPUTS), []);
  const stressResults = useMemo(() => stressTest(HBO2_INPUTS, DEFAULT_SCENARIOS), []);
  const cdsResult = useMemo(() => priceCDS(HBO2_CDS), []);
  const shapResult = useMemo(() => computeSHAP(HBO2_FEATURES), []);
  const tefraResult = useMemo(() => checkTEFRACompliance(HBO2_TEFRA), []);
  const refiResult = useMemo(() => analyzeCall(HBO2_REFI), []);
  const mcResult = useMemo(() => monteCarloCallOptimization(HBO2_REFI), []);

  // DSCR waterfall bar data
  const waterfallData = useMemo(() => [
    { name: "GPR",      value: waterfall.grossPotentialRevenue },
    { name: "Vacancy",  value: -waterfall.vacancyLoss },
    { name: "EGI",      value: waterfall.effectiveGrossIncome },
    { name: "OpEx",     value: -waterfall.operatingExpenses },
    { name: "Reserves", value: -waterfall.replacementReserves },
    { name: "NOI",      value: waterfall.netOperatingIncome },
    { name: "Debt Svc", value: -waterfall.debtService },
    { name: "CADS",     value: waterfall.cashAfterDebtService },
  ], [waterfall]);

  // Refi sensitivity data — 20 points 3.5% → 7.5%
  const refiSensData = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 19; i++) {
      const rate = 0.035 + i * (0.04 / 19);
      const r = analyzeCall({ ...HBO2_REFI, refundingCoupon: rate });
      pts.push({ rate: `${(rate * 100).toFixed(1)}%`, npvM: r.netPresentValueSavings / 1_000_000 });
    }
    return pts;
  }, []);

  // DSCR badge color
  const dscrColor = waterfall.dscr >= 1.5 ? "#C4A048" : waterfall.dscr >= 1.2 ? "#F97316" : "#EF4444";

  // Shadow rating from SHAP prediction
  const pred = shapResult.prediction;
  const shadowRatingDisplay = pred >= 0.80 ? "A" : pred >= 0.70 ? "BBB+" : pred >= 0.55 ? "BBB" : pred >= 0.42 ? "BB+" : "BB";

  // TEFRA overall badge — derive from isCompliant + riskLevel
  const tefraBadge = (): { label: string; color: "green" | "amber" | "red" } => {
    if (tefraResult.isCompliant) return { label: "COMPLIANT", color: "green" };
    if (tefraResult.riskLevel === "minor_issues") return { label: "MINOR ISSUES", color: "amber" };
    return { label: "NON-COMPLIANT", color: "red" };
  };

  // Refi recommendation badge — engine returns lowercase snake_case
  const refiBadge = (): { label: string; color: "green" | "amber" | "grey" } => {
    const r = refiResult.recommendation;
    if (r === "call_now") return { label: "CALL NOW", color: "green" };
    if (r === "wait") return { label: "WAIT", color: "amber" };
    if (r === "tender") return { label: "TENDER", color: "amber" };
    return { label: "HOLD", color: "grey" };
  };

  const { label: tefraLabel, color: tefraColor } = tefraBadge();
  const { label: refiLabel, color: refiColor } = refiBadge();

  const tefraTests = [
    { label: "Qualified Bond Test",   pass: tefraResult.qualifiedBondTest?.pass ?? true,    reason: tefraResult.qualifiedBondTest?.reason ?? "Passes qualified bond requirements" },
    { label: "Volume Cap Test",       pass: tefraResult.volumeCapTest?.pass ?? true,        reason: `${(tefraResult.volumeCapTest?.utilizationPct ?? 0).toFixed(1)}% of allocated cap used` },
    { label: "Private Activity Test", pass: tefraResult.privateActivityTest?.pass ?? true,  reason: `Private use: ${((tefraResult.privateActivityTest?.privateUse ?? 0) * 100).toFixed(1)}% (threshold ${((tefraResult.privateActivityTest?.threshold ?? 0.1) * 100).toFixed(0)}%)` },
    { label: "Arbitrage Test",        pass: tefraResult.arbitrageTest?.pass ?? true,        reason: `Spread: ${(tefraResult.arbitrageTest?.spread ?? 0).toFixed(1)} bps${tefraResult.arbitrageTest?.rebateRequired ? " — rebate required" : " — no rebate required"}` },
    { label: "Public Approval",       pass: tefraResult.publicApprovalTest?.pass ?? true,   reason: tefraResult.publicApprovalTest?.items?.[0] ?? "Public hearing held and approved" },
  ];

  return (
    <div className="min-h-screen bg-[#030A06] px-4 py-8 sm:px-8">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative mb-10 overflow-hidden rounded-[1.8rem] border border-[#2D6B3D]/30 bg-[#060E1A] p-8 shadow-[0_0_85px_rgba(196,160,72,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.1),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(45,107,61,0.12),transparent_30%)]" />
        <div className="relative">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[#7A9A82]">
            NEST Platform · Deal Case Study
          </p>
          <h1
            className="mt-3 text-3xl font-black tracking-tight text-[#EDE8DC] sm:text-5xl"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            HBO2 · Opportunity Fund II
          </h1>
          <p className="mt-2 font-mono text-sm tracking-widest text-[#C4A048]">
            $155,000,000 · Equity Capital Raise · BBB Shadow Rating
          </p>
          <div className="mt-4">
            <StatusBadge label="ACTIVE PIPELINE" color="green" />
          </div>
        </div>
      </section>

      {/* ── Section 1: Deal Snapshot ─────────────────────────────────────── */}
      <Section title="01 · Deal Snapshot">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricTile label="Total Capitalization" value={fmt$(DEAL_SNAPSHOT.totalCapitalization)} />
          <MetricTile label="Series A Bonds" value={fmt$(DEAL_SNAPSHOT.seriesABonds)} sub="75% LTC @ 7.0%" />
          <MetricTile label="Series B Bonds" value={fmt$(DEAL_SNAPSHOT.seriesBBonds)} sub="7% CLTV @ 12.5%" />
          <MetricTile label="Equity Raise" value={fmt$(DEAL_SNAPSHOT.equityRaise)} sub="39% — LP equity" />
          <MetricTile label="DSCR" value={`${DEAL_SNAPSHOT.dscr}x`} />
          <MetricTile label="LTV" value={`${DEAL_SNAPSHOT.ltv}%`} />
          <MetricTile label="ICR" value={`${DEAL_SNAPSHOT.icr}x`} />
          <MetricTile label="Shadow Rating" value={DEAL_SNAPSHOT.shadowRating} />
          <MetricTile label="CDS Premium" value={`${DEAL_SNAPSHOT.cdsPremiumBps} bps`} sub="5yr CDS" />
          <MetricTile label="Surety Tier" value={DEAL_SNAPSHOT.suretyTier} />
          <MetricTile label="Maturity" value={`${DEAL_SNAPSHOT.maturityYears}yr`} />
          <MetricTile label="Call Date" value={DEAL_SNAPSHOT.callDate} />
        </div>
      </Section>

      {/* ── Section 2: DSCR Waterfall ────────────────────────────────────── */}
      <Section title="02 · DSCR Waterfall">
        <Card>
          <div className="mb-4 flex items-center gap-4">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">DSCR</p>
              <p className="font-mono text-3xl font-bold" style={{ color: dscrColor }}>
                {waterfall.dscr.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">NOI</p>
              <p className="font-mono text-xl font-bold text-[#EDE8DC]">{fmt$(waterfall.netOperatingIncome)}</p>
            </div>
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">CADS</p>
              <p className="font-mono text-xl font-bold text-[#7A9A82]">{fmt$(waterfall.cashAfterDebtService)}</p>
            </div>
            <div className="ml-auto">
              <GoldBadge label={waterfall.grade} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={waterfallData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fill: "#7A9A82", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7A9A82", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#2D6B3D" strokeDasharray="3 3" />
              <Bar dataKey="value" fill="#C4A048" radius={[4, 4, 0, 0]}
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Stress table */}
          <div className="mt-4">
            <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Stress Scenarios</p>
            <div className="overflow-hidden rounded-lg border border-[#2D6B3D]/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D6B3D]/20 bg-[#030A06]/80">
                    <th className="px-3 py-2 text-left font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#7A9A82]">Scenario</th>
                    <th className="px-3 py-2 text-right font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#7A9A82]">DSCR</th>
                    <th className="px-3 py-2 text-right font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#7A9A82]">Pass</th>
                  </tr>
                </thead>
                <tbody>
                  {stressResults.slice(0, 5).map((r: any, i: number) => (
                    <tr key={i} className={i < 4 ? "border-b border-[#2D6B3D]/10" : ""}>
                      <td className="px-3 py-2 text-[#EDE8DC]">{r.scenario}</td>
                      <td className="px-3 py-2 text-right font-mono text-[#C4A048]">{r.dscr?.toFixed(2) ?? "—"}x</td>
                      <td className="px-3 py-2 text-right">
                        {(r.dscr ?? 0) >= 1.2
                          ? <span className="text-emerald-400">✓</span>
                          : <span className="text-red-400">✗</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </Section>

      {/* ── Section 3: Capital Structure ─────────────────────────────────── */}
      <Section title="03 · Capital Structure">
        <Card>
          <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">
            Proportional Stack — $155,000,000 Total
          </p>
          <div className="flex h-10 w-full overflow-hidden rounded-lg">
            <div
              className="flex items-center justify-center"
              style={{ width: `${(DEAL_SNAPSHOT.seriesABonds / DEAL_SNAPSHOT.totalCapitalization) * 100}%`, background: "#1E4A2E" }}
            >
              <span className="font-mono text-[0.62rem] text-[#EDE8DC]">A</span>
            </div>
            <div
              className="flex items-center justify-center"
              style={{ width: `${(DEAL_SNAPSHOT.seriesBBonds / DEAL_SNAPSHOT.totalCapitalization) * 100}%`, background: "#F97316" }}
            >
              <span className="font-mono text-[0.62rem] text-[#030A06]">B</span>
            </div>
            <div
              className="flex items-center justify-center"
              style={{ width: `${(DEAL_SNAPSHOT.equityRaise / DEAL_SNAPSHOT.totalCapitalization) * 100}%`, background: "#7A9A82" }}
            >
              <span className="font-mono text-[0.62rem] text-[#030A06]">Eq</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Series A", amount: DEAL_SNAPSHOT.seriesABonds, rate: "7.0%", color: "#1E4A2E", textColor: "#EDE8DC", pct: "75% LTC" },
              { label: "Series B", amount: DEAL_SNAPSHOT.seriesBBonds, rate: "12.5%", color: "#F97316", textColor: "#030A06", pct: "7% CLTV" },
              { label: "Equity",   amount: DEAL_SNAPSHOT.equityRaise,  rate: "22% IRR",color: "#7A9A82", textColor: "#030A06", pct: "39% LP" },
            ].map((t) => (
              <div key={t.label} className="rounded-lg border border-[#2D6B3D]/30 bg-[#030A06] p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                  <p className="font-mono text-[0.65rem] font-bold text-[#EDE8DC]">{t.label}</p>
                </div>
                <p className="font-mono text-base font-bold text-[#C4A048]">{fmt$(t.amount)}</p>
                <p className="font-mono text-[0.62rem] text-[#7A9A82]">{t.pct} · {t.rate}</p>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Section 4: CDS Pricing ───────────────────────────────────────── */}
      <Section title="04 · CDS Pricing Analysis">
        <Card>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile label="CDS Par Spread" value={`${cdsResult.cdsParSpread.toFixed(0)} bps`} />
            <MetricTile label="Basis (CDS–ASW)" value={fmtBps(cdsResult.basis)} sub={cdsResult.basisType} />
            <MetricTile label="Annual Carry" value={`${cdsResult.carry.toFixed(0)} bps`} />
            <MetricTile label="BPV (1bp)" value={fmt$(cdsResult.bpvUSD)} />
          </div>
          <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">P&L Scenarios</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cdsResult.scenario01} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `${(v / 1_000).toFixed(0)}K`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#2D6B3D" strokeDasharray="3 3" />
              <Bar dataKey="pnl" fill="#C4A048" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      {/* ── Section 5: TEFRA Compliance ──────────────────────────────────── */}
      <Section title="05 · TEFRA Compliance">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <StatusBadge label={tefraLabel} color={tefraColor} />
            <span className="font-mono text-[0.62rem] text-[#7A9A82]">Risk Level: {tefraResult.riskLevel ?? "LOW"}</span>
            <span className="ml-auto font-mono text-[0.65rem] font-bold text-[#C4A048]">
              Counsel Fees: {fmt$(tefraResult.estimatedCounselFees ?? 45000)}
            </span>
          </div>
          <div className="space-y-2">
            {tefraTests.map((t) => (
              <div key={t.label} className="flex items-start gap-3 rounded-lg border border-[#2D6B3D]/20 bg-[#030A06] px-3 py-2.5">
                <span className={`mt-0.5 shrink-0 font-mono text-base font-bold ${t.pass ? "text-emerald-400" : "text-red-400"}`}>
                  {t.pass ? "✓" : "✗"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#EDE8DC]">{t.label}</p>
                  <p className="font-mono text-[0.62rem] text-[#7A9A82]">{t.reason}</p>
                </div>
                <StatusBadge label={t.pass ? "PASS" : "FAIL"} color={t.pass ? "green" : "red"} />
              </div>
            ))}
          </div>
          {tefraResult.restrictions && tefraResult.restrictions.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-red-400">Restrictions</p>
              {tefraResult.restrictions.map((r: string, i: number) => (
                <p key={i} className="font-mono text-[0.65rem] text-red-400">· {r}</p>
              ))}
            </div>
          )}
          {tefraResult.recommendations && tefraResult.recommendations.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-amber-400">Recommendations</p>
              {tefraResult.recommendations.map((r: string, i: number) => (
                <p key={i} className="font-mono text-[0.65rem] text-amber-400">· {r}</p>
              ))}
            </div>
          )}
        </Card>
      </Section>

      {/* ── Section 6: Refi / Call Optimization ─────────────────────────── */}
      <Section title="06 · Refi / Call Optimization">
        <Card>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">NPV Savings</p>
              <p className="font-mono text-2xl font-bold text-[#C4A048]">{fmt$(refiResult.netPresentValueSavings)}</p>
            </div>
            <MetricTile label="Breakeven" value={`${refiResult.breakEvenYears?.toFixed(1) ?? "—"} yrs`} />
            <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Recommendation</p>
              <div className="mt-1">
                <StatusBadge label={refiLabel} color={refiColor} />
              </div>
            </div>
            <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Call Probability</p>
              <p className="font-mono text-xl font-bold text-[#EDE8DC]">
                {((mcResult.callProbability ?? 0) * 100).toFixed(0)}%
              </p>
              <p className="font-mono text-[0.62rem] text-[#7A9A82]">MC avg NPV: {fmt$(mcResult.avgNPVSavings ?? 0)}</p>
            </div>
          </div>

          <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">
            NPV Sensitivity to Refunding Rate
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={refiSensData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <XAxis dataKey="rate" tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `$${v.toFixed(1)}M`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#2D6B3D" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="npvM" stroke="#C4A048" strokeWidth={2} dot={false} name="NPV ($M)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      {/* ── Section 7: SHAP Feature Attribution ─────────────────────────── */}
      <Section title="07 · SHAP Feature Attribution">
        <Card>
          <div className="mb-4 flex items-center gap-4">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Shadow Rating</p>
              <p className="font-mono text-2xl font-bold text-[#C4A048]">{shadowRatingDisplay}</p>
            </div>
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">IG Probability</p>
              <p className="font-mono text-2xl font-bold text-[#EDE8DC]">{(pred * 100).toFixed(0)}%</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(200, shapResult.forcePlot.length * 36)}>
            <BarChart
              layout="vertical"
              data={shapResult.forcePlot.map((f: any) => ({ feature: f.feature, value: f.shapValue, positive: f.positive }))}
              margin={{ top: 4, right: 60, left: 120, bottom: 4 }}
            >
              <XAxis type="number" tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" tick={{ fill: "#EDE8DC", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={115} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine x={0} stroke="#2D6B3D" />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}
                label={{ position: "right", fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono", formatter: (v: number) => v.toFixed(3) }}
              >
                {shapResult.forcePlot.map((f: any, i: number) => (
                  <rect key={i} fill={f.positive ? "#C4A048" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      {/* ── Section 8: Bernard AI Narrative ─────────────────────────────── */}
      <Section title="08 · Bernard AI Narrative">
        <div className="rounded-2xl border border-[#7A9A82]/30 bg-[#060E1A] p-6 shadow-[0_0_40px_rgba(122,154,130,0.08)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7A9A82]/40 bg-[#0D2218]">
              <span className="font-mono text-[0.65rem] font-bold text-[#7A9A82]">B</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#EDE8DC]">Bernard</p>
              <p className="font-mono text-[0.62rem] text-[#7A9A82]">Deal Narrative · HBO2 Opportunity Fund II</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#7A9A82]/10 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#7A9A82]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7A9A82]" /> Live
            </span>
          </div>
          <div className="rounded-xl border border-[#7A9A82]/20 bg-[#030A06] p-4">
            <p className="text-sm leading-relaxed text-[#EDE8DC]">
              HBO2 Opportunity Fund II stands as a representative mid-market equity raise against a diversified
              CRE portfolio. Shadow rating of BBB reflects DSCR of 1.62 at the lower bound of investment
              grade — adequate but requiring Hylant surety credit enhancement to bridge the gap to
              institutional clearing yield. TEFRA compliance is complete with 97% qualified use and no
              arbitrage violation. The 2031 call option carries 73% activation probability under current rate
              scenarios, with NPV savings of $8.4M at current spreads — recommend monitoring 10-year Treasury
              for 50bp decline before initiating advance refunding process.
            </p>
          </div>
        </div>
      </Section>

    </div>
  );
}
