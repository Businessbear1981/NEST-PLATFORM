"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

/**
 * HBO2 Bond Automation Pipeline — full end-to-end workflow
 * $155M Equity Raise · Opportunity Capital Partners
 */
import { useEffect, useState } from "react";
import { runWaterfall, HBO2_INPUTS } from "@/lib/engines/dscr";
import { priceSurety } from "@/lib/engines/surety";
import { computeSHAP, HBO2_FEATURES } from "@/lib/engines/shap";

// ── Pre-compute engine results (pure math, no fetch) ──────────────────────────
const waterfallResult = runWaterfall(HBO2_INPUTS);
const HBO2_DSCR = 1.62;
const HBO2_LTV = 68;
const HBO2_ICR = 2.45;
const HBO2_GRADE = "BBB-";

const suretyResult = priceSurety({
  bondFace: 116_250_000,
  dscr: 1.62,
  ltv: 68,
  sponsorNetWorth: 180_000_000,
  projectType: "performance",
  aumTier: "40-80M",
  liquidityRatio: 1.8,
  yearsInBusiness: 12,
});

const shapResult = computeSHAP(HBO2_FEATURES);

// ── Types ──────────────────────────────────────────────────────────────────────
type StageStatus = "complete" | "in-progress" | "pending";

interface Stage {
  id: number;
  label: string;
  agent?: string;
  status: StageStatus;
}

const STAGES: Stage[] = [
  { id: 1, label: "Deal Intake", agent: undefined, status: "complete" },
  { id: 2, label: "Document Ingestion via Roots", agent: "Roots", status: "in-progress" },
  { id: 3, label: "Credit Underwriting", agent: "Maxwell", status: "complete" },
  { id: 4, label: "Surety Assessment", agent: "Hylant Integration", status: "complete" },
  { id: 5, label: "SHAP Rating Analysis", agent: undefined, status: "complete" },
  { id: 6, label: "Bond Structuring (GENIE)", agent: "GENIE", status: "in-progress" },
  { id: 7, label: "Investor Placement", agent: "Sterling", status: "pending" },
  { id: 8, label: "Closing & Settlement", agent: undefined, status: "pending" },
];

// ── Status helpers ─────────────────────────────────────────────────────────────
function statusBadge(status: StageStatus) {
  if (status === "complete")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#C4A048]/20 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#C4A048]">
        COMPLETE
      </span>
    );
  if (status === "in-progress")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-amber-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        IN PROGRESS
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#1E4A2E]/60 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#7A9A82]">
      PENDING
    </span>
  );
}

function stageCircle(status: StageStatus) {
  if (status === "complete")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#C4A048] bg-[#C4A048]/20">
        <svg className="h-4 w-4 text-[#C4A048]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  if (status === "in-progress")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-400/20">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
      </div>
    );
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#2D6B3D] bg-[#0D2218]">
      <span className="h-2.5 w-2.5 rounded-full bg-[#2D6B3D]" />
    </div>
  );
}

function fmt$(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

// ── Stage content panels ───────────────────────────────────────────────────────
function Stage1Content() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        ["Deal", "HBO2 Opportunity Fund II"],
        ["Type", "Equity Raise"],
        ["Size", "$155,000,000"],
        ["Sponsor", "Opportunity Capital Partners"],
      ].map(([k, v]) => (
        <div key={k} className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">{k}</p>
          <p className="mt-1 text-sm font-semibold text-[#EDE8DC]">{v}</p>
        </div>
      ))}
    </div>
  );
}

function Stage2Content({ deals }: { deals: any[] }) {
  const docs = [
    { label: "PPM", done: true },
    { label: "Financial Projections", done: true },
    { label: "Operating Agreement", done: true },
    { label: "Subscription Agreement", done: false },
    { label: "Audited Financials", done: false },
  ];
  return (
    <div className="space-y-4">
      {/* Upload zone (visual only) */}
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[#2D6B3D]/60 bg-[#030A06]/60 p-6 text-center">
        <div>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#2D6B3D] bg-[#0D2218]">
            <svg className="h-5 w-5 text-[#7A9A82]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm text-[#EDE8DC]">Drop documents here or <span className="text-[#C4A048]">browse</span></p>
          <p className="mt-1 font-mono text-[0.62rem] text-[#7A9A82]">PDF · DOCX · XLSX · up to 50MB</p>
        </div>
      </div>
      {/* Document checklist */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {docs.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5 rounded-lg border border-[#2D6B3D]/30 bg-[#030A06] px-3 py-2.5">
            {d.done ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C4A048]/20 text-[#C4A048]">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
            ) : (
              <span className="h-5 w-5 shrink-0 rounded-full border border-[#7A9A82]/40 bg-[#0D2218]" />
            )}
            <span className={`text-sm ${d.done ? "text-[#EDE8DC]" : "text-[#7A9A82]"}`}>{d.label}</span>
            {!d.done && <span className="ml-auto font-mono text-[0.62rem] text-amber-400/80">pending</span>}
          </div>
        ))}
      </div>
      {deals.length > 0 && (
        <p className="font-mono text-[0.62rem] text-[#7A9A82]">
          {deals.length} deal{deals.length !== 1 ? "s" : ""} loaded from API
        </p>
      )}
    </div>
  );
}

function Stage3Content() {
  const metrics = [
    { k: "DSCR", v: `${HBO2_DSCR}x`, ok: true },
    { k: "LTV", v: `${HBO2_LTV}%`, ok: true },
    { k: "ICR", v: `${HBO2_ICR}x`, ok: true },
    { k: "Grade", v: HBO2_GRADE, ok: true },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.k} className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">{m.k}</p>
            <p className="mt-1 font-mono text-xl font-bold text-[#C4A048]">{m.v}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-[#2D6B3D]/30 bg-[#030A06] px-3 py-2.5">
        <span className="font-mono text-[0.62rem] text-[#7A9A82]">Agent:</span>
        <span className="text-sm text-[#EDE8DC]">Maxwell</span>
        <span className="ml-auto font-mono text-[0.62rem] text-[#7A9A82]">Last run: 2 minutes ago</span>
      </div>
    </div>
  );
}

function Stage4Content() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Annual Premium</p>
          <p className="mt-1 font-mono text-xl font-bold text-[#C4A048]">{fmt$(suretyResult.annualPremiumUSD)}</p>
          <p className="mt-0.5 font-mono text-[0.62rem] text-[#7A9A82]">{suretyResult.annualPremiumRate}bps</p>
        </div>
        <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Tier</p>
          <p className="mt-1 text-xl font-bold capitalize text-[#EDE8DC]">{suretyResult.tier}</p>
        </div>
        <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">LC Required</p>
          <p className="mt-1 font-mono text-xl font-bold text-[#EDE8DC]">{suretyResult.lcRequired ? fmt$(suretyResult.lcSizingUSD) : "None"}</p>
        </div>
      </div>
      <div className="space-y-1">
        {suretyResult.notes.map((n, i) => (
          <p key={i} className="font-mono text-[0.62rem] text-[#7A9A82]">· {n}</p>
        ))}
      </div>
    </div>
  );
}

function Stage5Content() {
  // shapResult.prediction is 0-1 probability; derive shadow rating from it
  const pred = shapResult.prediction;
  let shadowRating: string;
  let ratingColor: string;
  if (pred >= 0.80) { shadowRating = "A"; ratingColor = "#22C55E"; }
  else if (pred >= 0.70) { shadowRating = "BBB+"; ratingColor = "#4ADE80"; }
  else if (pred >= 0.55) { shadowRating = "BBB"; ratingColor = "#C4A048"; }
  else if (pred >= 0.42) { shadowRating = "BB+"; ratingColor = "#F97316"; }
  else { shadowRating = "BB"; ratingColor = "#EF4444"; }

  const top3 = shapResult.forcePlot.slice(0, 3);
  const maxAbs = Math.max(...top3.map((f) => Math.abs(f.shapValue)), 0.001);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Shadow Rating</p>
          <p className="mt-1 font-mono text-2xl font-bold" style={{ color: ratingColor }}>
            {shadowRating}
          </p>
        </div>
        <div className="rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] p-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">IG Probability</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#EDE8DC]">{(pred * 100).toFixed(0)}%</p>
        </div>
      </div>
      <div className="space-y-2.5">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Top SHAP Factors</p>
        {top3.map((f) => {
          const pct = (Math.abs(f.shapValue) / maxAbs) * 100;
          return (
            <div key={f.feature} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-[#EDE8DC]">{f.feature}</span>
                <span className="font-mono text-sm text-[#7A9A82]">{f.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#030A06]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(4, pct)}%`,
                    backgroundColor: f.positive ? "#C4A048" : "#EF4444",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stage6Content() {
  const tranches = [
    { label: "Series A", amount: 86_400_000, pct: "75% LTC", rate: "7.0%", grade: "Investment Grade", color: "#C4A048" },
    { label: "Series B", amount: 8_065_000, pct: "7% CLTV", rate: "12.5%", grade: "B/BB", color: "#F97316" },
    { label: "Equity", amount: 60_535_000, pct: "Remaining", rate: "22% IRR target", grade: "LP Equity", color: "#7A9A82" },
  ];
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-[#2D6B3D]/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2D6B3D]/30 bg-[#030A06]/80">
              <th className="px-3 py-2 text-left font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Tranche</th>
              <th className="px-3 py-2 text-right font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Amount</th>
              <th className="px-3 py-2 text-right font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Stack</th>
              <th className="px-3 py-2 text-right font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Rate</th>
              <th className="px-3 py-2 text-left font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Grade</th>
            </tr>
          </thead>
          <tbody>
            {tranches.map((t, i) => (
              <tr key={t.label} className={i < tranches.length - 1 ? "border-b border-[#2D6B3D]/20" : ""}>
                <td className="px-3 py-2.5 font-semibold" style={{ color: t.color }}>{t.label}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[#C4A048]">{fmt$(t.amount)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[0.75rem] text-[#7A9A82]">{t.pct}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[#EDE8DC]">{t.rate}</td>
                <td className="px-3 py-2.5 text-[#7A9A82]">{t.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-mono text-[0.62rem] text-[#7A9A82]">CUSIP: Pending allocation · EMMA filing: Awaiting bond counsel</p>
    </div>
  );
}

function Stage7Content({ investors }: { investors: any[] }) {
  const defaultInvestors = [
    { name: "Meridian Capital Advisors", type: "Family Office", committed: 25_000_000 },
    { name: "Pacific Rim Opportunity LP", type: "Institutional LP", committed: 20_000_000 },
    { name: "Westgate Asset Management", type: "RIA", committed: 17_500_000 },
  ];
  const displayed = investors.length >= 3 ? investors.slice(0, 3) : defaultInvestors;
  const committed = displayed.reduce((acc, inv) => acc + (inv.committed || inv.allocation || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-lg border border-[#2D6B3D]/40 bg-[#030A06] px-4 py-3">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Committed</p>
          <p className="font-mono text-xl font-bold text-[#C4A048]">{fmt$(committed)}</p>
        </div>
        <span className="text-[#2D6B3D]">/</span>
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Target</p>
          <p className="font-mono text-xl font-bold text-[#7A9A82]">$155.00M</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#7A9A82]">Book Fill</p>
          <p className="font-mono text-xl font-bold text-[#EDE8DC]">{((committed / 155_000_000) * 100).toFixed(1)}%</p>
        </div>
      </div>
      <div className="space-y-2">
        {displayed.map((inv, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-[#2D6B3D]/30 bg-[#030A06] px-3 py-2.5">
            <div>
              <p className="text-sm text-[#EDE8DC]">{inv.name}</p>
              <p className="font-mono text-[0.62rem] text-[#7A9A82]">{inv.type || inv.investor_type || "LP"}</p>
            </div>
            <p className="font-mono font-bold text-[#C4A048]">{fmt$(inv.committed || inv.allocation || 0)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stage8Content() {
  const checks = [
    "Bond counsel opinion",
    "Trustee appointment",
    "EMMA filing",
    "Hylant surety certificate",
  ];
  return (
    <div className="space-y-2 opacity-50">
      <p className="text-sm text-[#7A9A82]">Prerequisites not met — awaiting upstream stage completion.</p>
      {checks.map((c) => (
        <div key={c} className="flex items-center gap-2.5 rounded-lg border border-[#2D6B3D]/20 bg-[#030A06]/60 px-3 py-2.5">
          <span className="h-4 w-4 shrink-0 rounded-full border border-[#7A9A82]/30 bg-[#0D2218]" />
          <span className="text-sm text-[#7A9A82]">{c}</span>
          <span className="ml-auto font-mono text-[0.62rem] text-[#7A9A82]/60">pending</span>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function BondWorkflowPage() {
  const [expandedStage, setExpandedStage] = useState<number | null>(1);
  const [deals, setDeals] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${_API}/api/deals`)
      .then((r) => r.json())
      .then((d) => { if (d.success && Array.isArray(d.data)) setDeals(d.data); })
      .catch(() => {});
    fetch(`${_API}/api/investors`)
      .then((r) => r.json())
      .then((d) => { if (d.success && Array.isArray(d.data)) setInvestors(d.data); })
      .catch(() => {});
  }, []);

  function stageContent(id: number) {
    switch (id) {
      case 1: return <Stage1Content />;
      case 2: return <Stage2Content deals={deals} />;
      case 3: return <Stage3Content />;
      case 4: return <Stage4Content />;
      case 5: return <Stage5Content />;
      case 6: return <Stage6Content />;
      case 7: return <Stage7Content investors={investors} />;
      case 8: return <Stage8Content />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#030A06] px-4 py-8 sm:px-8">
      {/* Header */}
      <section className="relative mb-8 overflow-hidden rounded-[1.8rem] border border-[#2D6B3D]/30 bg-[#060E1A] p-6 shadow-[0_0_85px_rgba(196,160,72,0.08)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.1),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(45,107,61,0.12),transparent_30%)]" />
        <div className="relative">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[#7A9A82]">
            NEST Platform · Bond Automation Pipeline
          </p>
          <h1
            className="mt-3 text-3xl font-black tracking-tight text-[#EDE8DC] sm:text-4xl"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            HBO2 Bond Automation Pipeline · $155M Equity Raise
          </h1>
          <p className="mt-2 text-sm text-[#7A9A82]">
            Opportunity Capital Partners · 8-stage automated pipeline · Maxwell · Sterling · GENIE · Hylant
          </p>
        </div>
      </section>

      {/* Pipeline stepper */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[15px] top-4 h-[calc(100%-2rem)] w-px bg-[#2D6B3D]/40" />

        <div className="space-y-3">
          {STAGES.map((stage) => {
            const isOpen = expandedStage === stage.id;
            return (
              <div key={stage.id} className="relative pl-12">
                {/* Stage circle */}
                <div className="absolute left-0 top-3">
                  {stageCircle(stage.status)}
                </div>

                {/* Stage card */}
                <div
                  className={`rounded-2xl border transition-all ${
                    stage.status === "pending"
                      ? "border-[#1E4A2E]/40 bg-[#0D2218]/50 opacity-60"
                      : "border-[#2D6B3D]/40 bg-[#0D2218] hover:border-[#2D6B3D]/70"
                  }`}
                >
                  {/* Stage header — clickable */}
                  <button
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                    onClick={() => setExpandedStage(isOpen ? null : stage.id)}
                    disabled={stage.status === "pending"}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[0.65rem] text-[#7A9A82]">
                        {String(stage.id).padStart(2, "0")}
                      </span>
                      <div>
                        <span
                          className="text-sm font-semibold text-[#EDE8DC]"
                          style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1rem" }}
                        >
                          {stage.label}
                        </span>
                        {stage.agent && (
                          <span className="ml-2 font-mono text-[0.62rem] text-[#7A9A82]">
                            · {stage.agent}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {statusBadge(stage.status)}
                      {stage.status !== "pending" && (
                        <svg
                          className={`h-4 w-4 text-[#7A9A82] transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && stage.status !== "pending" && (
                    <div className="border-t border-[#2D6B3D]/30 px-4 pb-4 pt-3">
                      {stageContent(stage.id)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bernard AI Narration Panel */}
      <div className="mt-8 rounded-2xl border border-[#7A9A82]/30 bg-[#060E1A] p-6 shadow-[0_0_40px_rgba(122,154,130,0.08)]">
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
            HBO2 Opportunity Fund II presents as a BBB-grade equity raise targeting LP capital for a
            diversified commercial real estate portfolio. Key credit considerations: DSCR of 1.62 sits at
            the lower bound of BBB-tier, supported by sponsor net worth of $180M representing 155% coverage.
            Hylant surety in hybrid configuration (40-80M AUM tier) provides credit enhancement bridging to
            investment grade execution. Sterling has identified 3 qualified institutional buyers with $62.5M
            in soft commitments. Recommend advancing to GENIE for final tranche configuration pending
            subscription agreement execution.
          </p>
        </div>
      </div>
    </div>
  );
}
