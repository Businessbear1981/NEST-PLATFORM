"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, RefreshCw, BarChart2, Shield } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

interface MarketSignals {
  treasury_10yr_pct: number;
  treasury_10yr_change_bps: number;
  sofr_pct: number;
  credit_spread_ig_bps: number;
  credit_spread_hy_bps: number;
  tlt_price: number;
  vix: number;
  refi_market_access: string;
}
interface SignalSnapshot {
  captured_at: string;
  signals: MarketSignals;
  vector_score: number;
  vector_recommendation: string;
  apex_short_active: boolean;
}
interface RateSnapshot {
  fed_funds?: number;
  sofr?: number;
  treasury_5yr?: number;
  treasury_10yr?: number;
}

const REC_COLOR: Record<string, string> = {
  execute_call: "#22c55e",
  call_eligible: "#86efac",
  monitor: "#C4A048",
  hold: "#7A9A82",
  put_alert: "#ef4444",
};

const REC_LABEL: Record<string, string> = {
  execute_call: "EXECUTE CALL",
  call_eligible: "CALL ELIGIBLE",
  monitor: "MONITOR",
  hold: "HOLD",
  put_alert: "PUT ALERT",
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#C4A048" : "#ef4444";
  return (
    <div className="w-full bg-[#030A06] rounded-full h-2 mt-2">
      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  );
}

export default function MarketRatesPage() {
  const [snapshot, setSnapshot] = useState<SignalSnapshot | null>(null);
  const [rates, setRates] = useState<RateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<string>("");

  async function load() {
    setLoading(true);
    try {
      const [sigRes, rateRes] = await Promise.all([
        fetch(`${API}/api/market/signals/latest`),
        fetch(`${API}/api/market/rates/snapshot`),
      ]);
      const sigJson = await sigRes.json();
      const rateJson = await rateRes.json();
      if (sigJson.success) setSnapshot(sigJson.data);
      if (rateJson.success) setRates(rateJson.data?.rates ?? null);
      setLastFetch(new Date().toLocaleTimeString());
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const sig = snapshot?.signals;
  const rec = snapshot?.vector_recommendation ?? "monitor";
  const recColor = REC_COLOR[rec] ?? "#C4A048";

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">Vector · Apex · Bond Desk</p>
          <h1 className="font-[Cormorant_Garamond] text-3xl text-[#EDE8DC] mt-1">Market Intelligence</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastFetch && <span className="font-mono text-[0.65rem] text-[#7A9A82]">Updated {lastFetch}</span>}
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C4A048]/10 border border-[#C4A048]/30 text-[#C4A048] font-mono text-xs hover:bg-[#C4A048]/20 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            REFRESH
          </button>
        </div>
      </div>

      {/* Vector Score Banner */}
      {snapshot && (
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">Vector Score</p>
              <strong className="font-mono text-4xl text-[#C4A048]">{snapshot.vector_score}</strong>
              <span className="font-mono text-sm text-[#7A9A82]">/100</span>
              <ScoreBar score={snapshot.vector_score} />
            </div>
            <div className="text-right">
              <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">Recommendation</p>
              <span className="font-mono text-lg font-bold" style={{ color: recColor }}>
                {REC_LABEL[rec] ?? rec.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">Apex Short</p>
              <span className={`font-mono text-sm ${snapshot.apex_short_active ? "text-[#ef4444]" : "text-[#7A9A82]"}`}>
                {snapshot.apex_short_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Rate Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "10YR TREASURY", value: sig ? `${sig.treasury_10yr_pct.toFixed(2)}%` : "—", sub: sig ? `${sig.treasury_10yr_change_bps > 0 ? "+" : ""}${sig.treasury_10yr_change_bps}bps` : "", up: sig ? sig.treasury_10yr_change_bps > 0 : false },
          { label: "SOFR", value: sig ? `${sig.sofr_pct.toFixed(2)}%` : (rates?.sofr ? `${rates.sofr.toFixed(2)}%` : "—"), sub: "Overnight", up: false },
          { label: "FED FUNDS", value: rates?.fed_funds ? `${rates.fed_funds.toFixed(2)}%` : "—", sub: "Target rate", up: false },
          { label: "VIX", value: sig ? sig.vix.toFixed(1) : "—", sub: sig && sig.vix < 20 ? "Low volatility" : "Elevated", up: sig ? sig.vix > 25 : false },
        ].map(({ label, value, sub, up }) => (
          <div key={label} className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[#7A9A82] mb-2">{label}</p>
            <div className="flex items-end gap-2">
              <strong className="font-mono text-2xl text-[#C4A048]">{value}</strong>
              {sub && (
                <span className={`font-mono text-[0.65rem] mb-1 ${up ? "text-[#ef4444]" : "text-[#7A9A82]"}`}>
                  {sub}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Spreads + Market Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Credit Spreads */}
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={14} className="text-[#C4A048]" />
            <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">Credit Spreads</p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs text-[#EDE8DC]">Investment Grade (IG)</span>
                <strong className="font-mono text-sm text-[#C4A048]">{sig ? `${sig.credit_spread_ig_bps}bps` : "—"}</strong>
              </div>
              <div className="w-full bg-[#030A06] rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-[#C4A048]" style={{ width: `${Math.min((sig?.credit_spread_ig_bps ?? 0) / 3, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs text-[#EDE8DC]">High Yield (HY)</span>
                <strong className="font-mono text-sm text-[#C4A048]">{sig ? `${sig.credit_spread_hy_bps}bps` : "—"}</strong>
              </div>
              <div className="w-full bg-[#030A06] rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-[#7A9A82]" style={{ width: `${Math.min((sig?.credit_spread_hy_bps ?? 0) / 10, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Market Access */}
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-[#C4A048]" />
            <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">Market Conditions</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-[#7A9A82]">Refi Market Access</span>
              <span className={`font-mono text-xs px-2 py-0.5 rounded border ${sig?.refi_market_access === "open_favorable" ? "border-[#22c55e]/40 text-[#22c55e] bg-[#22c55e]/10" : "border-[#C4A048]/40 text-[#C4A048] bg-[#C4A048]/10"}`}>
                {sig?.refi_market_access?.replace(/_/g, " ").toUpperCase() ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-[#7A9A82]">TLT Price</span>
              <strong className="font-mono text-sm text-[#C4A048]">{sig ? `$${sig.tlt_price.toFixed(2)}` : "—"}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-[#7A9A82]">5YR Treasury</span>
              <strong className="font-mono text-sm text-[#C4A048]">{rates?.treasury_5yr ? `${rates.treasury_5yr.toFixed(2)}%` : "—"}</strong>
            </div>
          </div>
        </div>
      </div>

      {loading && !snapshot && (
        <div className="text-center py-12">
          <Activity size={24} className="text-[#C4A048] animate-pulse mx-auto mb-3" />
          <p className="font-mono text-xs text-[#7A9A82]">Loading market data...</p>
        </div>
      )}
    </main>
  );
}
