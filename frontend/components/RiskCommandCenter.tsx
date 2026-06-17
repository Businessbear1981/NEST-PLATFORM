"use client";
import { useEffect, useState, useCallback } from "react";
import { useDealState } from "@/contexts/DealStateContext";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

// ── types ──────────────────────────────────────────────────────────────────────
interface DimScore {
  score: number;
  level: "green" | "yellow" | "red";
}

interface DealRisk {
  deal_id: string;
  deal_name: string;
  composite_score: number;
  risk_level: "green" | "yellow" | "red" | "critical";
  dimension_scores: Record<string, DimScore>;
  recommended_actions: { priority: string; action: string; agent: string }[];
}

interface PortfolioData {
  deals: DealRisk[];
  alerts: DealRisk[];
  total: number;
  green_count: number;
  yellow_count: number;
  alert_count: number;
  portfolio_composite_score: number;
  portfolio_risk_level: "green" | "yellow" | "red";
  dimension_averages: Record<string, DimScore>;
}

// ── helpers ────────────────────────────────────────────────────────────────────
const DIMENSION_LABELS: Record<string, string> = {
  market:        "Market",
  construction:  "Construction",
  credit:        "Credit",
  operational:   "Operational",
  regulatory:    "Regulatory",
  sponsor:       "Sponsor",
  environmental: "Environmental",
};

const DIM_ORDER = ["credit", "market", "construction", "operational", "regulatory", "sponsor", "environmental"];

function levelColor(level: string) {
  if (level === "green")    return "bg-emerald-500/70";
  if (level === "yellow")   return "bg-amber-400/80";
  if (level === "red" || level === "critical") return "bg-red-500/80";
  return "bg-[#7A9A82]/60";
}

function levelBadgeClass(level: string) {
  if (level === "green")    return "bg-emerald-800/40 text-emerald-400";
  if (level === "yellow")   return "bg-amber-800/40 text-amber-300";
  if (level === "red" || level === "critical") return "bg-red-900/40 text-red-400";
  return "bg-[#1E4A2E]/40 text-[#7A9A82]";
}

// ── RiskDimBars: deterministic, no Math.random() ────────────────────────────
function RiskDimBars({ scores }: { scores: Record<string, DimScore> }) {
  return (
    <div className="space-y-1">
      {DIM_ORDER.map((key) => {
        const d = scores[key];
        if (!d) return null;
        const pct = Math.min(100, Math.max(0, d.score));
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="w-[4.5rem] shrink-0 font-mono text-[0.45rem] uppercase tracking-wider text-[#7A9A82]">
              {DIMENSION_LABELS[key]}
            </div>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#03060b]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${levelColor(d.level)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right font-mono text-[0.45rem] text-[#7A9A82]">{Math.round(pct)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────
export default function RiskCommandCenter() {
  const { state } = useDealState();
  const { activeDeal, metrics } = state;

  const [portfolio, setPortfolio]   = useState<PortfolioData | null>(null);
  const [dealRisk,  setDealRisk]    = useState<DealRisk | null>(null);
  const [loading,   setLoading]     = useState(true);
  const [scoring,   setScoring]     = useState(false);
  const [error,     setError]       = useState<string | null>(null);

  // ── fetch portfolio (always runs — powers the no-deal view) ────────────────
  const fetchPortfolio = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/risk/portfolio`);
      const d = await r.json();
      if (d.success && d.data) setPortfolio(d.data);
      else setError("Portfolio data unavailable");
    } catch {
      setError("Cannot reach risk service");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── fetch deal-specific risk when activeDeal changes ───────────────────────
  const fetchDealRisk = useCallback(async (dealId: string) => {
    setScoring(true);
    setDealRisk(null);
    try {
      const r = await fetch(`${API}/api/risk/score/${dealId}`);
      const d = await r.json();
      if (d.success && d.data) setDealRisk(d.data);
    } catch {
      /* swallow — portfolio view still visible */
    } finally {
      setScoring(false);
    }
  }, []);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  useEffect(() => {
    if (activeDeal?.id) {
      fetchDealRisk(activeDeal.id);
    } else {
      setDealRisk(null);
    }
  }, [activeDeal?.id, fetchDealRisk]);

  // ── shared header ──────────────────────────────────────────────────────────
  const Header = () => (
    <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-200">
        Risk Assessment — Sentinel Agent
      </p>
      <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">
        Risk Command Center
      </h1>
      {activeDeal && (
        <p className="mt-1 font-mono text-[0.65rem] text-[#7A9A82]">
          Active deal: <span className="text-amber-300">{activeDeal.name}</span>
        </p>
      )}
    </div>
  );

  // ── loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[#03060b] px-6 py-8 text-[#EDE8DC]">
        <div className="mx-auto max-w-6xl space-y-5">
          <Header />
          <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-8 text-center">
            <p className="font-mono text-sm text-[#7A9A82] animate-pulse">Loading portfolio risk data…</p>
          </div>
        </div>
      </main>
    );
  }

  // ── derive KPI values from real portfolio data ─────────────────────────────
  const totalDeals   = portfolio?.total ?? 0;
  const greenCount   = portfolio?.green_count ?? 0;
  const yellowCount  = portfolio?.yellow_count ?? 0;
  const alertCount   = portfolio?.alert_count ?? 0;

  // ── which dimension scores to display for current view ─────────────────────
  // Deal-specific view uses deal dimension_scores; portfolio view uses dimension_averages
  const activeDimScores: Record<string, DimScore> | null =
    dealRisk?.dimension_scores ?? portfolio?.dimension_averages ?? null;

  const activeComposite = dealRisk?.composite_score ?? portfolio?.portfolio_composite_score ?? 0;
  const activeLevel     = dealRisk?.risk_level ?? portfolio?.portfolio_risk_level ?? "green";
  const activeActions   = dealRisk?.recommended_actions ?? [];

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-[#EDE8DC]">
      <div className="mx-auto max-w-6xl space-y-5">
        <Header />

        {/* ── KPI tiles (wired to real portfolio counts) ─────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Deals Monitored", value: String(totalDeals) },
            { label: "Green",           value: String(greenCount) },
            { label: "Yellow",          value: String(yellowCount) },
            { label: "Alerts Active",   value: String(alertCount) },
          ].map((k) => (
            <article key={k.label} className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">
                {k.label}
              </span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">
                {k.value}
              </strong>
            </article>
          ))}
        </div>

        {/* ── Deal-specific panel (shown when activeDeal is set) ────────── */}
        {activeDeal && (
          <div className="rounded-[1.25rem] border border-amber-300/20 bg-[#07101a]/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-amber-300">
                {scoring ? "Sentinel scoring…" : `Deal Risk — ${activeDeal.name}`}
              </div>
              {!scoring && dealRisk && (
                <div className="flex items-center gap-4">
                  <span className={`rounded px-2 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-wider ${levelBadgeClass(dealRisk.risk_level)}`}>
                    {dealRisk.risk_level}
                  </span>
                  <div>
                    <div className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">Composite</div>
                    <div className="font-mono text-xl font-semibold text-white">{dealRisk.composite_score}</div>
                  </div>
                </div>
              )}
              {scoring && (
                <div className="font-mono text-[0.6rem] text-amber-200 animate-pulse">Running Sentinel…</div>
              )}
            </div>

            {dealRisk?.dimension_scores && (
              <div className="mt-2">
                <RiskDimBars scores={dealRisk.dimension_scores} />
              </div>
            )}

            {/* Recommended actions */}
            {activeActions.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <div className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mb-2">
                  Sentinel Actions
                </div>
                {activeActions.map((a, i) => (
                  <div key={i} className={`rounded-lg px-3 py-2 font-mono text-[0.6rem] flex items-start gap-2 ${
                    a.priority === "critical" ? "bg-red-900/30 border border-red-500/30 text-red-300"
                    : a.priority === "high"   ? "bg-amber-900/30 border border-amber-500/30 text-amber-300"
                    : "bg-[#07101a] border border-white/10 text-[#EDE8DC]"
                  }`}>
                    <span className="uppercase tracking-wider opacity-70">{a.priority}</span>
                    <span>{a.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Portfolio risk grid (always visible) ──────────────────────── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-amber-300">
              Portfolio Overview
            </div>
            {portfolio && (
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-wider ${levelBadgeClass(portfolio.portfolio_risk_level)}`}>
                  {portfolio.portfolio_risk_level}
                </span>
                <span className="font-mono text-[0.55rem] text-[#7A9A82]">
                  Portfolio composite: <span className="text-white">{portfolio.portfolio_composite_score}</span>
                </span>
              </div>
            )}
          </div>

          {portfolio && portfolio.deals.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {portfolio.deals.map((d) => (
                <div
                  key={d.deal_id}
                  className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="font-mono text-sm font-semibold text-white">{d.deal_name}</div>
                    <span className={`rounded px-2 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-wider ${levelBadgeClass(d.risk_level)}`}>
                      {d.risk_level}
                    </span>
                  </div>
                  <div className="mb-3 font-mono text-lg font-bold text-amber-300">
                    Score: {d.composite_score}
                  </div>
                  {d.dimension_scores && <RiskDimBars scores={d.dimension_scores} />}
                </div>
              ))}
            </div>
          ) : (
            /* Portfolio dimension averages shown even with no live deals */
            portfolio?.dimension_averages && (
              <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
                <div className="mb-3 font-mono text-[0.62rem] uppercase tracking-wider text-[#7A9A82]">
                  Baseline Risk Profile — No deals loaded
                </div>
                <RiskDimBars scores={portfolio.dimension_averages} />
                <p className="mt-4 font-mono text-[0.6rem] text-[#7A9A82]">
                  Load a deal from the Bond Desk to run deal-specific Sentinel analysis.
                </p>
              </div>
            )
          )}
        </div>

        {/* ── Alerts panel ──────────────────────────────────────────────── */}
        {portfolio && portfolio.alerts.length > 0 && (
          <div className="rounded-[1.25rem] border border-red-500/30 bg-red-900/10 p-5">
            <div className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-red-400">
              Active Alerts — {portfolio.alerts.length} deal{portfolio.alerts.length !== 1 ? "s" : ""} require attention
            </div>
            <div className="space-y-2">
              {portfolio.alerts.map((a) => (
                <div key={a.deal_id} className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-900/20 px-3 py-2">
                  <span className="font-mono text-[0.65rem] text-red-300">{a.deal_name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-2 py-0.5 font-mono text-[0.5rem] font-semibold uppercase tracking-wider ${levelBadgeClass(a.risk_level)}`}>
                      {a.risk_level}
                    </span>
                    <span className="font-mono text-[0.6rem] text-[#7A9A82]">{a.composite_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Error banner ───────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-[1.25rem] border border-red-500/30 bg-red-900/10 p-4 font-mono text-[0.65rem] text-red-400">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
