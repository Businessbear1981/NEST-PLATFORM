"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Crosshair,
  Flame,
  Landmark,
  MapPin,
  Radio,
  RefreshCw,
  Target,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Signal {
  id: string;
  type: string;
  entity: string;
  location: string;
  date: string;
  details: string;
}

interface HeatEvent {
  id: string;
  entity: string;
  location: string;
  pattern: string;
  description: string;
  deal_type: string;
  urgency: string;
  matched_signals: string[];
  signal_count: number;
  total_signals_on_entity: number;
  convergence_score: number;
  window_days: number;
  recommended_agents: string[];
  signals: Signal[];
  detected_at: string;
}

interface Stats {
  total_signals: number;
  unique_entities: number;
  heat_events: number;
  critical_events: number;
  high_events: number;
  patterns_monitored: number;
  signal_types_tracked: number;
}

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/convergence${path}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

const URGENCY = {
  critical: { border: "border-red-500/40", bg: "bg-red-500/15", text: "text-red-300", label: "CRITICAL", glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]" },
  high: { border: "border-amber-400/40", bg: "bg-amber-400/15", text: "text-amber-300", label: "HIGH", glow: "shadow-[0_0_16px_rgba(251,191,36,0.2)]" },
  medium: { border: "border-[#C4A048]/30", bg: "bg-[#C4A048]/10", text: "text-[#C4A048]", label: "MEDIUM", glow: "" },
  low: { border: "border-slate-400/20", bg: "bg-slate-500/10", text: "text-slate-400", label: "LOW", glow: "" },
};

const DEAL_TYPE_BADGE: Record<string, string> = {
  bond: "border-amber-300/30 bg-amber-400/10 text-amber-200",
  ma: "border-fuchsia-300/30 bg-fuchsia-500/10 text-fuchsia-200",
  phoenix: "border-red-400/30 bg-red-500/10 text-red-200",
  term_lending: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
};

const AGENT_COLOR: Record<string, string> = {
  merlin: "text-[#C4A048] border-[#C4A048]/30",
  lender_scout: "text-amber-200 border-amber-300/30",
  sentinel: "text-red-300 border-red-400/30",
  maxwell: "text-emerald-300 border-emerald-300/30",
  sterling: "text-fuchsia-200 border-fuchsia-300/30",
  surety_scout: "text-amber-200 border-amber-300/30",
};

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ConvergenceRadar() {
  const [heat, setHeat] = useState<HeatEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<HeatEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData<HeatEvent[]>("/heat").then((d) => setHeat(d ?? [])),
      fetchData<Stats>("/stats").then(setStats),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-red-300" />
        <span className="font-mono text-sm text-slate-400">Scanning signals...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-red-400/20 bg-[#07101a]/80 p-6 shadow-[0_0_40px_rgba(239,68,68,0.06)]">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-red-400 animate-pulse" />
            <div>
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-red-300">CONVERGENCE ENGINE</p>
              <h1 className="mt-1 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Multi-Signal Target Detection</h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-400">Autonomous signal monitoring. When 2-3 signals converge on the same entity — that's a deal. No input required.</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Signals Tracked", value: String(stats.total_signals), tone: "text-[#E8C87A] border-[#C4A048]/30 bg-[#C4A048]/8" },
              { label: "HEAT Events", value: String(stats.heat_events), tone: "text-red-200 border-red-400/30 bg-red-500/8" },
              { label: "Critical", value: String(stats.critical_events), tone: "text-red-300 border-red-500/40 bg-red-500/15" },
              { label: "Entities Monitored", value: String(stats.unique_entities), tone: "text-amber-200 border-amber-300/35 bg-amber-300/9" },
            ].map((m) => (
              <article key={m.label} className={`rounded-[1.25rem] border p-4 ${m.tone}`}>
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{m.label}</span>
                <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{m.value}</strong>
              </article>
            ))}
          </div>
        )}

        {/* HEAT Events */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="border-red-400/15 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-red-300">
                <Zap className="mr-2 inline h-4 w-4" />
                HEAT Events — Convergence Detected ({heat.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {heat.map((h) => {
                  const u = URGENCY[h.urgency as keyof typeof URGENCY] ?? URGENCY.medium;
                  const isSelected = selected?.id === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setSelected(h)}
                      className={`cursor-pointer rounded-xl border p-4 transition ${u.border} ${u.glow} ${isSelected ? u.bg : "bg-white/[0.02] hover:bg-white/[0.04]"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Crosshair size={14} className={u.text} />
                            <h3 className="font-mono text-[0.82rem] font-semibold text-white">{h.pattern}</h3>
                            <Badge variant="outline" className={`text-[0.5rem] ${u.border} ${u.bg} ${u.text}`}>{u.label}</Badge>
                            <Badge variant="outline" className={`text-[0.5rem] ${DEAL_TYPE_BADGE[h.deal_type] ?? ""}`}>{h.deal_type}</Badge>
                          </div>
                          <p className="mt-1 font-mono text-sm text-slate-300">{h.entity}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <MapPin size={11} />
                            <span>{h.location}</span>
                            <span>|</span>
                            <span>{h.signal_count} signals in {h.window_days} days</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono text-lg font-bold ${u.text}`}>{h.convergence_score}</div>
                          <div className="font-mono text-[0.5rem] text-slate-500">SCORE</div>
                        </div>
                      </div>

                      {/* Matched signals */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {h.matched_signals.map((s) => (
                          <span key={s} className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[0.54rem] text-slate-400">
                            {s.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>

                      {/* Deploy agents */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="font-mono text-[0.5rem] text-slate-600">DEPLOY:</span>
                        {h.recommended_agents.map((a) => (
                          <span key={a} className={`rounded border px-2 py-0.5 font-mono text-[0.54rem] font-semibold uppercase ${AGENT_COLOR[a] ?? "text-slate-300 border-white/10"}`}>
                            {a.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card className="border-amber-300/15 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <Target className="mr-2 inline h-4 w-4" />
                {selected ? "Signal Detail" : "Select a HEAT Event"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-mono text-lg font-bold text-white">{selected.entity}</p>
                    <p className="font-mono text-xs text-slate-400">{selected.location}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-sm text-slate-300">{selected.description}</p>
                  </div>

                  <div>
                    <p className="mb-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Converging Signals</p>
                    <div className="space-y-2">
                      {selected.signals.map((sig) => (
                        <div key={sig.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="border-white/10 text-[0.5rem] text-slate-300">
                              {sig.type.replace(/_/g, " ")}
                            </Badge>
                            <span className="font-mono text-[0.56rem] text-slate-500">{shortDate(sig.date)}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">{sig.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Recommended Deployment</p>
                    <div className="space-y-1.5">
                      {selected.recommended_agents.map((a) => (
                        <button
                          key={a}
                          className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition hover:bg-white/5 ${AGENT_COLOR[a] ?? "text-slate-300 border-white/10"}`}
                        >
                          <Zap size={12} />
                          <span className="font-mono text-[0.68rem] font-semibold uppercase">{a.replace(/_/g, " ")}</span>
                          <span className="ml-auto font-mono text-[0.5rem] text-slate-500">DEPLOY</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Click a HEAT event to see signal details and deployment options.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default ConvergenceRadar;
