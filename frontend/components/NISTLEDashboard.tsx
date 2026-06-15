"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://web-production-5e8af.up.railway.app";
/**
 * NISLE Dashboard — NEST Intelligence Self-Learning Engine
 *
 * Displays all 8 DAPT phases in NEST brand:
 * - Credit cycle regime
 * - SDF stress meter
 * - Term structure decomposition
 * - VRP signal
 * - Dynamic spread table
 * - Disaster scenarios
 * - ML model health
 * - Agent injection status
 */

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────

interface NISLEPacket {
  nisle_version: string;
  run_count: number;
  generated_at: string;
  regime: {
    phase: "EXPANSION" | "LATE_CYCLE" | "STRESS" | "DISTRESS";
    confidence: number;
    quarter_in_cycle: number;
    days_in_regime: number;
  };
  sdf: {
    hj_bound: number;
    sdf_vol_implied: number;
    risk_aversion_implied: number;
    stress_multiplier: number;
    sdf_regime: string;
    sdf_covariance_premium_bps: number;
  };
  term_structure: {
    sofr: number;
    treasury_10yr: number;
    yield_curve_slope_bps: number;
    rate_expectation_10yr_pct: number;
    term_premium_bps: number;
    shadow_rate_pct: number;
    curve_regime: string;
    decomposition: string;
  };
  vrp: {
    vix: number;
    vrp_monthly: number;
    vrp_zscore: number;
    regime: "CALM" | "NORMAL" | "ELEVATED" | "CRISIS";
    spread_widening_signal_bps: number;
    interpretation: string;
  };
  ml_model: {
    predicted_spread_bps: number;
    fitted: boolean;
    model_rmse: number | null;
    active_factors: string[];
    calibration_count: number;
  };
  disaster_scenarios: {
    scenarios: Record<string, {
      name: string;
      annual_prob: number;
      expected_loss_pct: number;
      credit_enhancement_required_bps: number;
      aaa_spread_widen_bps: number;
      description: string;
    }>;
    total_prob_weighted_el_pct: number;
    disaster_spread_premium_bps: number;
    interpretation: string;
  };
  cycle: {
    regime: string;
    lrr_signal: number;
    lrr_trend: string;
    surplus_ratio: number;
    implied_risk_premium_bps: number;
    noi_growth_used: number;
  };
  dynamic_spreads: {
    total_adj_bps: number;
    components: Record<string, number>;
    by_rating: Record<string, {
      base_bps: [number, number];
      nisle_bps: [number, number];
      adj_bps: number;
    }>;
  };
  model_health: {
    status: string;
    n_predictions: number;
    rmse: number | null;
    rmse_trend: string | null;
    calibrations: number;
    factors_active: number;
    recalibration_needed: boolean;
  };
  agent_injections: Record<string, Record<string, unknown>>;
}

// ── Color constants ────────────────────────────────────────────────────────

const NEST = {
  void:   "#030A06",
  forest: "#0D2218",
  green:  "#1E4A2E",
  pine:   "#2D6B3D",
  gold:   "#C4A048",
  goldHi: "#E8C87A",
  sage:   "#7A9A82",
  cream:  "#EDE8DC",
};

const REGIME_COLOR: Record<string, string> = {
  EXPANSION:  "#2D6B3D",
  LATE_CYCLE: "#C4A048",
  STRESS:     "#B85C38",
  DISTRESS:   "#8B1A1A",
};

const VRP_COLOR: Record<string, string> = {
  CALM:     "#2D6B3D",
  NORMAL:   "#7A9A82",
  ELEVATED: "#C4A048",
  CRISIS:   "#B85C38",
};

const RATING_ORDER = ["AAA", "AA", "A", "BBB", "BB", "B"];

// ── Sub-components ─────────────────────────────────────────────────────────

function RegimeBadge({ phase }: { phase: string }) {
  const color = REGIME_COLOR[phase] || NEST.sage;
  return (
    <span
      className="px-3 py-1 rounded text-xs font-mono font-bold tracking-widest"
      style={{ backgroundColor: color + "33", color, border: `1px solid ${color}` }}
    >
      {phase.replace("_", " ")}
    </span>
  );
}

function MetricRow({
  label,
  value,
  unit = "",
  highlight = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs" style={{ color: NEST.sage }}>{label}</span>
      <span
        className="font-mono text-sm font-semibold"
        style={{ color: highlight ? NEST.gold : NEST.cream }}
      >
        {value}{unit}
      </span>
    </div>
  );
}

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: NEST.sage }}>
        {title}
      </h3>
      {badge && (
        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: NEST.pine + "44", color: NEST.goldHi }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function NISTLEDashboard() {
  const [packet, setPacket] = useState<NISLEPacket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const runNISLE = useCallback(async (marketSignals?: Record<string, number>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${_API}/api/nisle/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market_signals: marketSignals || {},
          deal_data: {},
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPacket(json.data);
        setLastRefresh(new Date());
      } else {
        setError(json.error || "NISLE run failed");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-run on mount
  useEffect(() => { runNISLE(); }, [runNISLE]);

  if (error) {
    return (
      <div className="p-6 rounded-lg" style={{ backgroundColor: NEST.forest, border: `1px solid #8B1A1A` }}>
        <p className="font-mono text-sm" style={{ color: "#B85C38" }}>NISLE ERROR: {error}</p>
        <Button size="sm" className="mt-3" onClick={() => runNISLE()}>Retry</Button>
      </div>
    );
  }

  const p = packet;

  return (
    <div className="space-y-4 p-4" style={{ backgroundColor: NEST.void, minHeight: "100%" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "Cormorant Garamond, serif", color: NEST.cream }}>
            NISLE — Intelligence Engine
          </h2>
          <p className="text-xs mt-0.5" style={{ color: NEST.sage }}>
            Dynamic Asset Pricing Theory · 8-Phase Self-Learning Model
          </p>
        </div>
        <div className="flex items-center gap-3">
          {p && <RegimeBadge phase={p.regime.phase} />}
          <Button
            size="sm"
            onClick={() => runNISLE()}
            disabled={loading}
            style={{ backgroundColor: NEST.pine, color: NEST.cream, border: "none" }}
          >
            {loading ? "Running..." : "↻ Refresh"}
          </Button>
        </div>
      </div>

      {loading && !p && (
        <div className="text-center py-12">
          <p className="font-mono text-sm animate-pulse" style={{ color: NEST.sage }}>
            Calibrating SDF · Term Structure · VRP · Cycle Detector...
          </p>
        </div>
      )}

      {p && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* ── Panel 1: Regime + Cycle ────────────────────────── */}
          <Card style={{ backgroundColor: NEST.forest, border: `1px solid ${NEST.green}` }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <SectionHeader title="Credit Cycle" badge={`Q${p.regime.quarter_in_cycle}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1">
              <div className="flex items-center justify-between mb-3">
                <RegimeBadge phase={p.regime.phase} />
                <span className="font-mono text-xs" style={{ color: NEST.sage }}>
                  {Math.round(p.regime.confidence * 100)}% conf.
                </span>
              </div>
              <MetricRow label="LRR Signal (x_t)" value={p.cycle.lrr_signal.toFixed(5)} highlight />
              <MetricRow label="LRR Trend" value={p.cycle.lrr_trend} />
              <MetricRow label="Surplus Ratio (S_t)" value={p.cycle.surplus_ratio.toFixed(3)} />
              <MetricRow label="Eff. Risk Aversion" value={`${(1 / Math.max(p.cycle.surplus_ratio, 0.1)).toFixed(1)}×`} highlight />
              <Separator className="my-2" style={{ backgroundColor: NEST.green }} />
              <MetricRow
                label="Cycle Risk Premium"
                value={`+${p.cycle.implied_risk_premium_bps}`}
                unit=" bps"
                highlight
              />
              <MetricRow label="NOI Growth Used" value={`${p.cycle.noi_growth_used}%`} />
            </CardContent>
          </Card>

          {/* ── Panel 2: SDF Calibration ───────────────────────── */}
          <Card style={{ backgroundColor: NEST.forest, border: `1px solid ${NEST.green}` }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <SectionHeader title="SDF Calibration" badge={p.sdf.sdf_regime} />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1">
              <MetricRow label="HJ Bound (min SDF vol)" value={p.sdf.hj_bound.toFixed(4)} highlight />
              <MetricRow label="Implied SDF Vol" value={p.sdf.sdf_vol_implied.toFixed(4)} />
              <MetricRow label="Risk Aversion (γ)" value={`${p.sdf.risk_aversion_implied}×`} highlight />
              <MetricRow label="VIX" value={`${p.sdf.vix_used}`} />
              <MetricRow label="Risk-Free Rate" value={`${p.sdf.rf_used}%`} />
              <Separator className="my-2" style={{ backgroundColor: NEST.green }} />
              <MetricRow label="Stress Multiplier" value={`${p.sdf.stress_multiplier}×`} highlight />
              <MetricRow
                label="SDF Covariance Premium"
                value={`+${p.sdf.sdf_covariance_premium_bps}`}
                unit=" bps"
                highlight
              />
              <p className="text-xs mt-2 leading-relaxed" style={{ color: NEST.sage }}>
                H-J bound: σ(M)/E(M) ≥ Sharpe ratio of any traded portfolio
              </p>
            </CardContent>
          </Card>

          {/* ── Panel 3: Term Structure ────────────────────────── */}
          <Card style={{ backgroundColor: NEST.forest, border: `1px solid ${NEST.green}` }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <SectionHeader title="Term Structure" badge={p.term_structure.curve_regime.replace("_", " ")} />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1">
              <MetricRow label="SOFR" value={`${p.term_structure.sofr}%`} />
              <MetricRow label="10yr Treasury" value={`${p.term_structure.treasury_10yr}%`} />
              <MetricRow
                label="Curve Slope"
                value={`${p.term_structure.yield_curve_slope_bps > 0 ? "+" : ""}${p.term_structure.yield_curve_slope_bps}`}
                unit=" bps"
                highlight
              />
              <Separator className="my-2" style={{ backgroundColor: NEST.green }} />
              <MetricRow label="Rate Expectation (10yr)" value={`${p.term_structure.rate_expectation_10yr_pct}%`} />
              <MetricRow
                label="Term Premium"
                value={`${p.term_structure.term_premium_bps > 0 ? "+" : ""}${p.term_structure.term_premium_bps}`}
                unit=" bps"
                highlight
              />
              <MetricRow label="Shadow Rate" value={`${p.term_structure.shadow_rate_pct}%`} />
              <p className="text-xs mt-2 font-mono leading-relaxed" style={{ color: NEST.sage }}>
                {p.term_structure.decomposition}
              </p>
            </CardContent>
          </Card>

          {/* ── Panel 4: VRP Signal ────────────────────────────── */}
          <Card style={{ backgroundColor: NEST.forest, border: `1px solid ${VRP_COLOR[p.vrp.regime]}44` }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <SectionHeader title="Variance Risk Premium" badge={`VRP: ${p.vrp.regime}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1">
              <MetricRow label="VIX" value={p.vrp.vix} />
              <MetricRow
                label="VRP Z-Score"
                value={p.vrp.vrp_zscore.toFixed(2)}
                highlight={Math.abs(p.vrp.vrp_zscore) > 1.5}
              />
              <MetricRow label="Monthly VRP" value={p.vrp.vrp_monthly.toFixed(6)} />
              <div className="mt-2 px-2 py-2 rounded text-xs leading-relaxed"
                style={{ backgroundColor: VRP_COLOR[p.vrp.regime] + "22", color: NEST.cream }}>
                {p.vrp.interpretation}
              </div>
              <Separator className="my-2" style={{ backgroundColor: NEST.green }} />
              <MetricRow
                label="Spread Widening Signal"
                value={`+${p.vrp.spread_widening_signal_bps}`}
                unit=" bps"
                highlight={p.vrp.spread_widening_signal_bps > 0}
              />
            </CardContent>
          </Card>

          {/* ── Panel 5: Dynamic Spread Table ─────────────────── */}
          <Card style={{ backgroundColor: NEST.forest, border: `1px solid ${NEST.green}` }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <SectionHeader
                title="Dynamic Spreads"
                badge={`+${p.dynamic_spreads.total_adj_bps} bps regime adj`}
              />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1 mb-3">
                {RATING_ORDER.map((rating) => {
                  const entry = p.dynamic_spreads.by_rating[rating];
                  if (!entry) return null;
                  return (
                    <div key={rating} className="flex items-center justify-between">
                      <span className="font-mono text-xs w-10" style={{ color: NEST.sage }}>{rating}</span>
                      <span className="font-mono text-xs line-through" style={{ color: NEST.sage + "88" }}>
                        {entry.base_bps[0]}-{entry.base_bps[1]}
                      </span>
                      <span className="font-mono text-xs font-bold" style={{ color: NEST.gold }}>
                        {entry.nisle_bps[0]}-{entry.nisle_bps[1]} bps
                      </span>
                      <span className="font-mono text-xs" style={{ color: "#B85C38" }}>
                        +{entry.adj_bps}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Separator style={{ backgroundColor: NEST.green }} />
              <div className="mt-2 space-y-0.5">
                {Object.entries(p.dynamic_spreads.components).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span style={{ color: NEST.sage }}>{k.replace(/_/g, " ")}</span>
                    <span className="font-mono" style={{ color: NEST.cream }}>+{v as number} bps</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Panel 6: Disaster Scenarios ───────────────────── */}
          <Card style={{ backgroundColor: NEST.forest, border: `1px solid #8B1A1A44` }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <SectionHeader
                title="Disaster Scenarios"
                badge={`EL: ${p.disaster_scenarios.total_prob_weighted_el_pct.toFixed(3)}%`}
              />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {Object.entries(p.disaster_scenarios.scenarios).map(([key, sc]) => (
                <div key={key} className="rounded p-2" style={{ backgroundColor: NEST.void, border: "1px solid #8B1A1A33" }}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold" style={{ color: NEST.cream }}>{sc.name}</span>
                    <span className="font-mono text-xs" style={{ color: "#B85C38" }}>
                      {(sc.annual_prob * 100).toFixed(1)}%/yr
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: NEST.sage }}>Expected loss</span>
                    <span className="font-mono" style={{ color: NEST.gold }}>{sc.expected_loss_pct}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: NEST.sage }}>CE required</span>
                    <span className="font-mono" style={{ color: NEST.gold }}>{sc.credit_enhancement_required_bps} bps</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: NEST.sage }}>AAA widen</span>
                    <span className="font-mono" style={{ color: "#B85C38" }}>+{sc.aaa_spread_widen_bps} bps</span>
                  </div>
                </div>
              ))}
              <Separator style={{ backgroundColor: NEST.green }} />
              <MetricRow
                label="Disaster Spread Premium"
                value={`+${p.disaster_scenarios.disaster_spread_premium_bps}`}
                unit=" bps"
                highlight
              />
            </CardContent>
          </Card>

          {/* ── Panel 7: ML Model Health ───────────────────────── */}
          <Card style={{ backgroundColor: NEST.forest, border: `1px solid ${NEST.green}` }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <SectionHeader
                title="ML Spread Model"
                badge={p.ml_model.fitted ? "FITTED" : "DEFAULT"}
              />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1">
              <MetricRow
                label="Predicted Spread"
                value={p.ml_model.predicted_spread_bps !== undefined ? `${p.ml_model.predicted_spread_bps}` : "—"}
                unit=" bps"
                highlight
              />
              <MetricRow label="Model RMSE" value={p.ml_model.model_rmse !== null ? `±${p.ml_model.model_rmse}` : "uncalibrated"} unit=" bps" />
              <MetricRow label="Calibrations" value={p.ml_model.calibration_count} />
              <Separator className="my-2" style={{ backgroundColor: NEST.green }} />
              <p className="text-xs mb-1" style={{ color: NEST.sage }}>Active factors</p>
              <div className="flex flex-wrap gap-1">
                {(p.ml_model.active_factors || []).map((f) => (
                  <span key={f} className="font-mono text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: NEST.pine + "44", color: NEST.cream }}>
                    {f}
                  </span>
                ))}
              </div>
              <div className="mt-3 text-xs" style={{ color: NEST.sage }}>
                <p>Self-learning: submit deal outcomes via</p>
                <p className="font-mono mt-0.5" style={{ color: NEST.goldHi }}>POST /api/nisle/train</p>
                <p className="mt-1">RMSE drift &gt;15% triggers auto-recalibration (McLean-Pontiff guard)</p>
              </div>
            </CardContent>
          </Card>

          {/* ── Panel 8: Agent Injections ─────────────────────── */}
          <Card style={{ backgroundColor: NEST.forest, border: `1px solid ${NEST.green}` }} className="md:col-span-2">
            <CardHeader className="pb-2 pt-4 px-4">
              <SectionHeader title="Agent Injection Matrix" badge="Phase 8" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(p.agent_injections).map(([agent, data]) => (
                  <div key={agent} className="rounded p-2" style={{ backgroundColor: NEST.void, border: `1px solid ${NEST.green}` }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: NEST.pine }}>
                      {agent}
                    </p>
                    {Object.entries(data as Record<string, unknown>).slice(0, 3).map(([k, v]) => {
                      if (typeof v === "object") return null;
                      return (
                        <div key={k} className="flex justify-between text-xs">
                          <span style={{ color: NEST.sage }}>{k.replace(/_/g, " ").slice(0, 20)}</span>
                          <span className="font-mono ml-1" style={{ color: NEST.cream }}>
                            {typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(3)) : String(v).slice(0, 12)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      {p && (
        <div className="text-xs flex justify-between items-center pt-2" style={{ color: NEST.sage }}>
          <span>
            NISLE v{p.nisle_version} · Run #{p.run_count} ·{" "}
            {lastRefresh?.toLocaleTimeString()}
          </span>
          <span className="font-mono">
            Vasicek [1977] · Bansal-Yaron [2004] · Barro [2006] · Gu-Kelly-Xiu [2020]
          </span>
        </div>
      )}
    </div>
  );
}
