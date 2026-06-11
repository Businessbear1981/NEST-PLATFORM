import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Building2, RefreshCw, AlertTriangle, TrendingDown, Clock, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StateHeat {
  state: string;
  heat_score: number;
  signal_count: number;
  pipeline_usd: number;
  top_signal: string;
  deal_types: string[];
}

interface CREProperty {
  name: string;
  asset_type: string;
  state: string;
  city: string;
  signal_type: "bridge_maturing" | "stabilized_refi" | "distressed" | "cmbs_watch";
  loan_amount_usd: number;
  maturity_months: number | null;
  estimated_noi_usd: number;
  opportunity_score: number;
  thesis: string;
}

const SIGNAL_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  bridge_maturing: { label: "Bridge Maturing", color: "text-red-300 bg-red-400/10 border-red-400/25", icon: Clock },
  stabilized_refi: { label: "Stabilized Refi", color: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25", icon: Activity },
  distressed: { label: "Distressed", color: "text-amber-300 bg-amber-400/10 border-amber-400/25", icon: AlertTriangle },
  cmbs_watch: { label: "CMBS Watch", color: "text-violet-300 bg-violet-400/10 border-violet-400/25", icon: TrendingDown },
};

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function HeatBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-red-400" :
    score >= 65 ? "bg-amber-400" :
    score >= 50 ? "bg-amber-300/70" :
    "bg-slate-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="w-7 text-right font-mono text-[0.65rem] text-slate-400">{score}</span>
    </div>
  );
}

function StateCard({ st, index }: { st: StateHeat; index: number }) {
  const intensity =
    st.heat_score >= 80 ? "border-red-400/30 bg-red-400/5" :
    st.heat_score >= 65 ? "border-amber-400/25 bg-amber-400/5" :
    "border-white/10 bg-[#0D2218]/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border p-3 ${intensity}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#0D2218] border border-white/10 flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-slate-200">{st.state}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">{st.signal_count} signals</div>
            <div className="font-mono text-[0.65rem] text-slate-400">{fmt(st.pipeline_usd)} pipeline</div>
          </div>
        </div>
      </div>
      <HeatBar score={st.heat_score} />
      <p className="mt-2 text-[0.68rem] text-slate-400 leading-relaxed line-clamp-2">{st.top_signal}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {st.deal_types.slice(0, 3).map(dt => (
          <span key={dt} className="rounded px-1.5 py-0.5 bg-white/5 border border-white/10 font-mono text-[0.58rem] text-slate-400">
            {dt.replace("_", " ")}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function PropertyCard({ prop, index }: { prop: CREProperty; index: number }) {
  const sig = SIGNAL_CONFIG[prop.signal_type] ?? SIGNAL_CONFIG.distressed;
  const SigIcon = sig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-white/10 bg-[#0D2218]/60 p-4 hover:border-[#C4A048]/30 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 h-9 w-9 rounded-lg border border-white/10 bg-[#060E1A] flex items-center justify-center">
          <Building2 size={16} className="text-[#C4A048]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100 truncate">{prop.name}</span>
            <Badge className={`text-[0.58rem] border ${sig.color}`}>
              <SigIcon size={9} className="mr-1" />{sig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[0.7rem] text-slate-400">
            <MapPin size={10} />
            <span>{prop.city}, {prop.state}</span>
            <span className="text-slate-600">·</span>
            <span className="capitalize">{prop.asset_type.replace("_", " ")}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-sm font-bold text-[#C4A048]">{fmt(prop.loan_amount_usd)}</div>
          {prop.maturity_months && (
            <div className="font-mono text-[0.65rem] text-red-300">{prop.maturity_months}mo maturity</div>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">Est. NOI</div>
          <div className="font-mono text-sm font-semibold text-emerald-400">{fmt(prop.estimated_noi_usd)}</div>
        </div>
        <div>
          <div className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">Cap Rate</div>
          <div className="font-mono text-sm font-semibold text-slate-200">
            {((prop.estimated_noi_usd / prop.loan_amount_usd) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1.5 flex-1 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#C4A048]"
              style={{ width: `${prop.opportunity_score}%` }}
            />
          </div>
          <span className="font-mono text-[0.65rem] text-slate-400 w-7 text-right">{prop.opportunity_score}</span>
        </div>
      </div>

      <p className="mt-2 text-[0.72rem] text-slate-400 leading-relaxed">{prop.thesis}</p>

      <div className="mt-3 flex gap-2">
        <Button size="sm" className="h-7 bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] text-[0.7rem]">
          <ArrowRight size={11} className="mr-1" /> Underwrite
        </Button>
        <Button size="sm" variant="outline" className="h-7 border-white/10 text-slate-300 hover:bg-white/5 text-[0.7rem]">
          Scout Area
        </Button>
      </div>
    </motion.div>
  );
}

export default function EagleEyeCRETab() {
  const [data, setData] = useState<{
    states: StateHeat[];
    top_properties: CREProperty[];
    total_pipeline_usd: number;
    total_signals: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(refresh = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/eagleeye/cre-heatmap${refresh ? "?refresh=true" : ""}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error || "Failed to load heat map");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-red-400/20 bg-[#060E1A] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-red-400">
              CRE Distressed Intelligence · Heat Map Engine
            </div>
            <h2 className="mt-1 text-lg font-black text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Real Estate Heat Map
            </h2>
            <p className="text-[0.72rem] text-slate-400 mt-0.5">
              Bridge maturities · CMBS special servicing · Stabilized refi windows
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <div className="text-right">
                <div className="font-mono text-xs text-slate-400">{fmt(data.total_pipeline_usd)} total pipeline</div>
                <div className="font-mono text-xs text-slate-400">{data.total_signals} active signals</div>
              </div>
            )}
            <Button
              size="sm"
              onClick={() => load(true)}
              disabled={loading}
              className="bg-red-400/10 border border-red-400/30 text-red-300 hover:bg-red-400/20 text-[0.7rem] h-8"
            >
              {loading ? (
                <RefreshCw size={12} className="mr-1.5 animate-spin" />
              ) : (
                <AlertTriangle size={12} className="mr-1.5" />
              )}
              {loading ? "Loading…" : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw size={22} className="mx-auto animate-spin text-red-400" />
            <p className="mt-3 text-sm text-slate-400">Building heat map…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/25 bg-red-400/5 p-4 text-sm text-red-300">{error}</div>
      )}

      {data && (
        <>
          {/* State heat grid */}
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-wider text-slate-500 mb-3">
              State Heat Scores — sorted by distress intensity
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {data.states.map((st, i) => (
                <StateCard key={st.state} st={st} index={i} />
              ))}
            </div>
          </div>

          {/* Top properties */}
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-wider text-slate-500 mb-3">
              Top Property Opportunities — ranked by NEST opportunity score
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {data.top_properties.map((prop, i) => (
                <PropertyCard key={prop.name + i} prop={prop} index={i} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
