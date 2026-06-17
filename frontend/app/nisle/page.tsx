"use client";

import { useEffect, useState, useCallback } from "react";
import { BrainCircuit, RefreshCw, Zap, Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

interface NISLEStatus {
  active: boolean;
  current_regime: string;
  model_health: string;
  last_run: string | null;
  run_count: number;
  calibrations: number;
  phases: Record<string, string>;
}

interface NISLESignal {
  series: string;
  value: number;
  regime_probability: number;
  signal: string;
  timestamp: string;
}

interface SpreadData {
  tenor: string;
  spread_bps: number;
  adjusted_bps: number;
  vrp_adjustment: number;
}

const REGIME_COLORS: Record<string, string> = {
  LATE_CYCLE: "text-amber-400",
  EARLY_CYCLE: "text-emerald-400",
  RECESSION: "text-red-400",
  EXPANSION: "text-emerald-300",
  DEFAULT: "text-[#7A9A82]",
};

const PHASE_COLORS: Record<string, string> = {
  ACTIVE: "text-emerald-400",
  DEFAULT: "text-[#7A9A82]",
  UNCALIBRATED: "text-amber-400",
  ERROR: "text-red-400",
};

function fmt(v: number, dec = 1): string {
  return v.toFixed(dec);
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NISLEPage() {
  const [status, setStatus] = useState<NISLEStatus | null>(null);
  const [signals, setSignals] = useState<NISLESignal[]>([]);
  const [spreads, setSpreads] = useState<SpreadData[]>([]);
  const [cycle, setCycle] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [sRes, sigRes, spRes, cyRes] = await Promise.all([
        fetch(`${API}/api/nisle/status`),
        fetch(`${API}/api/nisle/signals`),
        fetch(`${API}/api/nisle/spreads`),
        fetch(`${API}/api/nisle/cycle`),
      ]);
      const [s, sig, sp, cy] = await Promise.all([sRes.json(), sigRes.json(), spRes.json(), cyRes.json()]);
      if (s.success) setStatus(s.data);
      if (sig.success) setSignals(Array.isArray(sig.data?.signals) ? sig.data.signals : []);
      if (sp.success) setSpreads(Array.isArray(sp.data?.spreads) ? sp.data.spreads : []);
      if (cy.success) setCycle(cy.data);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await fetch(`${API}/api/nisle/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const json = await res.json();
      if (json.success) {
        await load();
      }
    } finally {
      setRunning(false);
    }
  };

  const regimeColor = REGIME_COLORS[status?.current_regime ?? "DEFAULT"] ?? REGIME_COLORS.DEFAULT;

  return (
    <div className="min-h-screen p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C4A048]/20 bg-[#C4A048]/10">
            <BrainCircuit size={20} className="text-[#C4A048]" />
          </div>
          <div>
            <h1 className="font-[Cormorant_Garamond] text-2xl font-semibold text-white">NISLE Engine</h1>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-[#7A9A82]">
              NEST Intelligence Self-Learning Engine · Regime Detection · ML Spread Model
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={loading}
            className="h-8 gap-1.5 flex items-center rounded-lg border border-white/10 bg-white/5 px-3 font-mono text-[0.65rem] uppercase tracking-wider text-[#7A9A82] hover:bg-white/10 disabled:opacity-50">
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={handleRun} disabled={running}
            className="h-8 gap-1.5 flex items-center rounded-lg border border-[#C4A048]/30 bg-[#C4A048]/10 px-3 font-mono text-[0.65rem] uppercase tracking-wider text-[#E8C87A] hover:bg-[#C4A048]/20 disabled:opacity-50">
            {running ? <RefreshCw size={11} className="animate-spin" /> : <Zap size={11} />}
            {running ? "Running…" : "Run NISLE"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-[#C4A048]/40" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Status Panel */}
          <div className="rounded-2xl border border-white/8 bg-black/30 p-5 space-y-4">
            <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#7A9A82]">Engine Status</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-[#7A9A82]">Status</span>
                <span className={`font-mono text-[0.65rem] font-bold flex items-center gap-1 ${status?.active ? "text-emerald-400" : "text-red-400"}`}>
                  {status?.active ? <><CheckCircle size={11} /> ACTIVE</> : <><AlertTriangle size={11} /> OFFLINE</>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-[#7A9A82]">Regime</span>
                <span className={`font-mono text-[0.65rem] font-bold ${regimeColor}`}>
                  {status?.current_regime?.replace(/_/g, " ") ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-[#7A9A82]">Model Health</span>
                <span className={`font-mono text-[0.65rem] font-bold ${PHASE_COLORS[status?.model_health ?? "DEFAULT"] ?? PHASE_COLORS.DEFAULT}`}>
                  {status?.model_health ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-[#7A9A82]">Last Run</span>
                <span className="font-mono text-[0.65rem] text-white">{timeAgo(status?.last_run ?? null)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-[#7A9A82]">Run Count</span>
                <span className="font-mono text-[0.65rem] text-white">{status?.run_count ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-[#7A9A82]">Calibrations</span>
                <span className="font-mono text-[0.65rem] text-white">{status?.calibrations ?? 0}</span>
              </div>
            </div>

            {/* Phase grid */}
            {status?.phases && (
              <div className="border-t border-white/5 pt-4 space-y-1.5">
                <p className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#7A9A82] mb-2">Phase Status</p>
                {Object.entries(status.phases).map(([phase, state]) => (
                  <div key={phase} className="flex items-center justify-between">
                    <span className="font-mono text-[0.58rem] text-[#7A9A82]">{phase.replace(/_/g, " ")}</span>
                    <span className={`font-mono text-[0.55rem] uppercase font-semibold ${PHASE_COLORS[state] ?? PHASE_COLORS.DEFAULT}`}>{state}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center: Spreads + Cycle */}
          <div className="space-y-5">
            {/* Spread Curve */}
            <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
              <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#7A9A82] mb-4">
                ML Spread Model
              </h2>
              {spreads.length === 0 ? (
                <p className="font-mono text-[0.65rem] text-[#7A9A82]">No spread data — run NISLE to generate.</p>
              ) : (
                <div className="space-y-2">
                  {spreads.map((sp) => (
                    <div key={sp.tenor} className="flex items-center gap-3">
                      <span className="font-mono text-[0.6rem] text-[#7A9A82] w-12">{sp.tenor}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-[#C4A048]" style={{ width: `${Math.min(100, sp.adjusted_bps / 3)}%` }} />
                      </div>
                      <span className="font-mono text-[0.62rem] font-bold text-[#C4A048] w-14 text-right">
                        {fmt(sp.adjusted_bps, 0)}bps
                      </span>
                      {sp.vrp_adjustment !== 0 && (
                        <span className={`font-mono text-[0.52rem] ${sp.vrp_adjustment > 0 ? "text-red-400" : "text-emerald-400"}`}>
                          VRP {sp.vrp_adjustment > 0 ? "+" : ""}{fmt(sp.vrp_adjustment, 1)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cycle Detector */}
            {cycle && (
              <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
                <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#7A9A82] mb-4">
                  Cycle Detector
                </h2>
                <div className="space-y-2">
                  {Object.entries(cycle).map(([k, v]) => (
                    typeof v === "number" || typeof v === "string" ? (
                      <div key={k} className="flex items-center justify-between">
                        <span className="font-mono text-[0.62rem] text-[#7A9A82]">{k.replace(/_/g, " ")}</span>
                        <span className="font-mono text-[0.62rem] font-semibold text-white">
                          {typeof v === "number" ? fmt(v as number) : String(v)}
                        </span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Signals Feed */}
          <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#7A9A82]">
                Intelligence Signals
              </h2>
              <Activity size={13} className="text-[#C4A048]" />
            </div>
            {signals.length === 0 ? (
              <div className="text-center py-8">
                <BrainCircuit size={24} className="mx-auto text-[#7A9A82]/40 mb-2" />
                <p className="font-mono text-[0.65rem] text-[#7A9A82]">No signals yet.</p>
                <p className="font-mono text-[0.58rem] text-[#7A9A82] mt-1">Hit "Run NISLE" to generate live signals.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {signals.map((sig, i) => (
                  <div key={i} className="rounded-xl border border-white/6 bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[0.62rem] font-semibold text-white">{sig.series}</span>
                      <span className={`font-mono text-[0.5rem] uppercase font-bold ${
                        sig.signal === "BUY" ? "text-emerald-400" : sig.signal === "SELL" ? "text-red-400" : "text-[#C4A048]"
                      }`}>{sig.signal}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={10} className="text-[#7A9A82]" />
                        <span className="font-mono text-[0.6rem] text-[#C4A048]">{fmt(sig.value)}</span>
                      </div>
                      <span className="font-mono text-[0.58rem] text-[#7A9A82]">
                        Regime P={fmt(sig.regime_probability * 100, 0)}%
                      </span>
                    </div>
                    <p className="font-mono text-[0.5rem] text-[#7A9A82] mt-1">{timeAgo(sig.timestamp)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
