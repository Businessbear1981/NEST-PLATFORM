"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Building2, MapPin, RefreshCw, ArrowRight, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MATarget {
  name: string;
  sector: string;
  naics_code: string;
  state: string;
  city: string;
  est_revenue_usd: number;
  est_ebitda_usd: number;
  deal_type: "acquisition" | "recap" | "growth_capital";
  acquisition_thesis: string;
  score: number;
  source: string;
}

const DEAL_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  acquisition: { label: "Acquisition", color: "text-amber-300 bg-amber-400/10 border-amber-400/25" },
  recap: { label: "Recapitalization", color: "text-violet-300 bg-violet-400/10 border-violet-400/25" },
  growth_capital: { label: "Growth Capital", color: "text-[#C4A048] bg-[#C4A048]/10 border-[#C4A048]/25" },
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-300" : "bg-slate-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="w-7 text-right font-mono text-[0.68rem] text-slate-400">{score}</span>
    </div>
  );
}

function MACard({ target, index }: { target: MATarget; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = DEAL_TYPE_LABELS[target.deal_type] ?? DEAL_TYPE_LABELS.acquisition;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-xl border border-white/10 bg-[#0D2218]/60 p-4 hover:border-[#C4A048]/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100 truncate">{target.name}</span>
            <Badge className={`text-[0.6rem] border ${typeConfig.color}`}>{typeConfig.label}</Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[0.72rem] text-slate-400">
            <MapPin size={11} />
            <span>{target.city}, {target.state}</span>
            <span className="text-slate-600">·</span>
            <Building2 size={11} />
            <span className="truncate">{target.sector}</span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <div className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">Revenue Est.</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-[#C4A048]">{fmt(target.est_revenue_usd)}</div>
        </div>
        <div>
          <div className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">EBITDA Est.</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-emerald-400">{fmt(target.est_ebitda_usd)}</div>
        </div>
        <div>
          <div className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">EV/EBITDA</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-slate-200">
            {(target.est_revenue_usd / target.est_ebitda_usd).toFixed(1)}x
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500 mb-1">Opportunity Score</div>
        <ScoreBar score={target.score} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500 mb-1">Acquisition Thesis</div>
              <p className="text-[0.78rem] text-slate-300 leading-relaxed">{target.acquisition_thesis}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="h-7 bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] text-[0.7rem]">
                  <ArrowRight size={11} className="mr-1" /> Add to Pipeline
                </Button>
                <Button size="sm" variant="outline" className="h-7 border-white/10 text-slate-300 hover:bg-white/5 text-[0.7rem]">
                  Run Due Diligence
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EagleEyeMATab() {
  const [data, setData] = useState<{ targets: MATarget[]; total: number; edgar_signals: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan(refresh = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/eagleeye/ma-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          states: ["FL", "TX", "GA", "AZ", "WA", "NC"],
          refresh,
        }),
      });
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error || "Scan failed");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { scan(); }, []);

  return (
    <div className="space-y-4">
      {/* Header strip */}
      <div className="rounded-xl border border-[#C4A048]/20 bg-[#060E1A] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[#C4A048]">
              M&A Intelligence Engine · Lower Middle Market
            </div>
            <h2 className="mt-1 text-lg font-black text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Acquisition Targets
            </h2>
            <p className="text-[0.72rem] text-slate-400 mt-0.5">
              $30M–$150M revenue · Sub-$20M EBITDA · NEST bond financing eligible
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <div className="text-right">
                <div className="font-mono text-xs text-slate-400">{data.edgar_signals} EDGAR signals</div>
                <div className="font-mono text-xs text-slate-400">{data.total} targets found</div>
              </div>
            )}
            <Button
              size="sm"
              onClick={() => scan(true)}
              disabled={loading}
              className="bg-[#C4A048]/10 border border-[#C4A048]/30 text-[#C4A048] hover:bg-[#C4A048]/20 text-[0.7rem] h-8"
            >
              {loading ? (
                <RefreshCw size={12} className="mr-1.5 animate-spin" />
              ) : (
                <Zap size={12} className="mr-1.5" />
              )}
              {loading ? "Scanning…" : "Re-Scan"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      {data && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Active Targets", value: data.targets.length, color: "text-[#C4A048]" },
            {
              label: "Avg Revenue",
              value: fmt(data.targets.reduce((s, t) => s + t.est_revenue_usd, 0) / (data.targets.length || 1)),
              color: "text-emerald-400",
            },
            {
              label: "Avg EBITDA",
              value: fmt(data.targets.reduce((s, t) => s + t.est_ebitda_usd, 0) / (data.targets.length || 1)),
              color: "text-[#C4A048]",
            },
            {
              label: "Top Score",
              value: Math.max(...data.targets.map(t => t.score)),
              color: "text-amber-300",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border border-white/10 bg-[#0D2218]/40 p-3">
              <div className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">{label}</div>
              <div className={`mt-1 font-mono text-base font-semibold ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Target cards */}
      {loading && !data && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <RefreshCw size={24} className="mx-auto animate-spin text-[#C4A048]" />
            <p className="mt-3 text-sm text-slate-400">Scanning EDGAR + market intelligence…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/25 bg-red-400/5 p-4 text-sm text-red-300">{error}</div>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.targets.map((target, i) => (
            <MACard key={target.name + i} target={target} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
