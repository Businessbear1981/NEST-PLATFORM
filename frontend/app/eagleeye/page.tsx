"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, TrendingUp, AlertCircle, Database, RefreshCw } from "lucide-react";
import EagleEyeEngine from "@/components/academy/EagleEyeEngine";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

const DATA_SOURCES = ["ATTOM", "CoStar", "EMMA", "LinkedIn", "EDGAR", "NewsAPI", "Mapbox"];

interface PipelineDeal {
  id: string;
  name: string;
  amount: string;
  score: number;
  signal: "BUY" | "WATCH" | "HOLD";
  status: string;
  risk_grade?: string;
}

function scoreFromGrade(grade?: string): number {
  const map: Record<string, number> = {
    "A": 90, "A-": 87, "A+": 92,
    "BBB+": 82, "BBB": 78, "BBB-": 72,
    "BB+": 65, "BB": 60, "BB-": 55,
    "B": 48,
  };
  return grade ? (map[grade] ?? 65) : 65;
}

function signalFromStatus(status: string, grade?: string): "BUY" | "WATCH" | "HOLD" {
  if (status === "placement" || status === "closing") return "BUY";
  if (grade && ["A", "A-", "A+", "BBB+", "BBB"].includes(grade)) return "BUY";
  if (status === "sourcing") return "HOLD";
  return "WATCH";
}

function fmtAmount(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function SignalBadge({ signal }: { signal: "BUY" | "WATCH" | "HOLD" }) {
  const cfg = {
    BUY:  { bg: "rgba(196,160,72,0.15)",   color: "#C4A048", border: "rgba(196,160,72,0.4)",   icon: <TrendingUp size={10} strokeWidth={2.5} /> },
    WATCH:{ bg: "rgba(122,154,130,0.15)",  color: "#7A9A82", border: "rgba(122,154,130,0.4)",  icon: <AlertCircle size={10} strokeWidth={2.5} /> },
    HOLD: { bg: "rgba(74,100,80,0.15)",    color: "#4a7c59", border: "rgba(74,100,80,0.4)",    icon: <AlertCircle size={10} strokeWidth={2.5} /> },
  }[signal];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-widest"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.icon}{signal}
    </span>
  );
}

export default function EagleEyePage() {
  const [pipeline, setPipeline] = useState<PipelineDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/deals`)
      .then((r) => r.json())
      .then((json) => {
        const raw: Record<string, unknown>[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        const mapped: PipelineDeal[] = raw.map((d) => ({
          id: String(d.id ?? ""),
          name: String(d.name ?? "Unnamed Deal"),
          amount: fmtAmount((d.amount as number) || (d.bond_face as number) || 0),
          score: scoreFromGrade(d.risk_grade as string | undefined),
          signal: signalFromStatus(String(d.status ?? ""), d.risk_grade as string | undefined),
          status: String(d.status ?? ""),
          risk_grade: d.risk_grade as string | undefined,
        }));
        setPipeline(mapped);
      })
      .catch(() => setPipeline([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full" style={{ background: "#030A06", color: "#EDE8DC" }}>
      {/* Hero Header */}
      <div className="px-8 pt-10 pb-6 border-b" style={{ borderColor: "rgba(196,160,72,0.15)" }}>
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-start gap-4">
          <div className="mt-1 flex-shrink-0 w-10 h-10 rounded flex items-center justify-center"
            style={{ background: "rgba(196,160,72,0.12)", border: "1px solid rgba(196,160,72,0.3)" }}>
            <Eye size={20} style={{ color: "#C4A048" }} />
          </div>
          <div>
            <h1 className="font-serif text-4xl tracking-[0.2em] uppercase" style={{ color: "#C4A048", letterSpacing: "0.25em" }}>
              Eagle Eye
            </h1>
            <p className="mt-1 text-sm tracking-wide" style={{ color: "#7A9A82" }}>
              Distressed CRE + CCRC acquisition scanner · M&A heat map · NEST deal sourcing
            </p>
          </div>
        </motion.div>
      </div>

      {/* Live Pipeline Row */}
      <div className="px-8 py-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C4A048" }} />
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "#7A9A82" }}>
            Live Pipeline
          </span>
          {loading && <RefreshCw size={11} className="animate-spin" style={{ color: "#7A9A82" }} />}
        </div>

        {!loading && pipeline.length === 0 ? (
          <div className="rounded-lg p-6 text-center font-mono text-sm" style={{ background: "#0D2218", border: "1px solid rgba(196,160,72,0.12)", color: "#7A9A82" }}>
            No deals in pipeline. Submit a deal via New Deal to see it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pipeline.map((deal, i) => (
              <motion.div key={deal.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-lg p-5 flex flex-col gap-3"
                style={{ background: "#0D2218", border: "1px solid rgba(196,160,72,0.12)" }}>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-serif" style={{ color: "#EDE8DC" }}>{deal.name}</span>
                  <SignalBadge signal={deal.signal} />
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-mono text-xl font-semibold" style={{ color: "#C4A048" }}>{deal.amount}</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono" style={{ color: "#7A9A82" }}>
                      {deal.risk_grade ?? "SCORE"}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{
                          width: `${deal.score}%`,
                          background: deal.score >= 75 ? "#C4A048" : deal.score >= 65 ? "#7A9A82" : "#4a7c59",
                        }} />
                      </div>
                      <span className="font-mono text-sm font-semibold" style={{ color: "#EDE8DC" }}>{deal.score}</span>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[0.6rem]" style={{ color: "#7A9A82" }}>
                  {deal.status.replace(/_/g, " ").toUpperCase()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Eagle Eye Engine */}
      <div className="px-8 pb-8">
        <EagleEyeEngine />
      </div>

      {/* Data Sources Banner */}
      <div className="px-8 py-4 border-t flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{ borderColor: "rgba(122,154,130,0.15)", background: "#0D2218" }}>
        <div className="flex items-center gap-2 mr-2">
          <Database size={13} style={{ color: "#7A9A82" }} />
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "#7A9A82" }}>Data Sources</span>
        </div>
        {DATA_SOURCES.map((src) => (
          <span key={src} className="text-xs font-mono tracking-wider" style={{ color: "#EDE8DC", opacity: 0.55 }}>{src}</span>
        ))}
      </div>
    </div>
  );
}
