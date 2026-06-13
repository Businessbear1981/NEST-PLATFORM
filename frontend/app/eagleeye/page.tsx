"use client";

import { motion } from "framer-motion";
import { Eye, TrendingUp, AlertCircle, Database } from "lucide-react";
import EagleEyeEngine from "@/components/academy/EagleEyeEngine";

const PIPELINE = [
  {
    name: "HBO2 CCRC",
    amount: "$155M",
    score: 74,
    signal: "BUY" as const,
  },
  {
    name: "Jacaranda Trace",
    amount: "$231M",
    score: 81,
    signal: "BUY" as const,
  },
  {
    name: "St. Pete Construction",
    amount: "$172.5M",
    score: 68,
    signal: "WATCH" as const,
  },
];

const DATA_SOURCES = [
  "ATTOM",
  "CoStar",
  "EMMA",
  "LinkedIn",
  "EDGAR",
  "NewsAPI",
  "Mapbox",
];

function SignalBadge({ signal }: { signal: "BUY" | "WATCH" }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-widest"
      style={{
        background: signal === "BUY" ? "rgba(196,160,72,0.15)" : "rgba(122,154,130,0.15)",
        color: signal === "BUY" ? "#C4A048" : "#7A9A82",
        border: `1px solid ${signal === "BUY" ? "rgba(196,160,72,0.4)" : "rgba(122,154,130,0.4)"}`,
      }}
    >
      {signal === "BUY" ? (
        <TrendingUp size={10} strokeWidth={2.5} />
      ) : (
        <AlertCircle size={10} strokeWidth={2.5} />
      )}
      {signal}
    </span>
  );
}

export default function EagleEyePage() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#030A06", color: "#EDE8DC" }}
    >
      {/* ── Hero Header ── */}
      <div className="px-8 pt-10 pb-6 border-b" style={{ borderColor: "rgba(196,160,72,0.15)" }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-4"
        >
          <div
            className="mt-1 flex-shrink-0 w-10 h-10 rounded flex items-center justify-center"
            style={{ background: "rgba(196,160,72,0.12)", border: "1px solid rgba(196,160,72,0.3)" }}
          >
            <Eye size={20} style={{ color: "#C4A048" }} />
          </div>
          <div>
            <h1
              className="font-serif text-4xl tracking-[0.2em] uppercase"
              style={{ color: "#C4A048", letterSpacing: "0.25em" }}
            >
              Eagle Eye
            </h1>
            <p className="mt-1 text-sm tracking-wide" style={{ color: "#7A9A82" }}>
              Distressed CRE + CCRC acquisition scanner · M&A heat map · NEST deal sourcing
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Live Pipeline Row ── */}
      <div className="px-8 py-6">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#C4A048" }}
          />
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "#7A9A82" }}>
            Live Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PIPELINE.map((deal, i) => (
            <motion.div
              key={deal.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-lg p-5 flex flex-col gap-3"
              style={{
                background: "#0D2218",
                border: "1px solid rgba(196,160,72,0.12)",
              }}
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-serif" style={{ color: "#EDE8DC" }}>
                  {deal.name}
                </span>
                <SignalBadge signal={deal.signal} />
              </div>
              <div className="flex items-end justify-between">
                <span className="font-mono text-xl font-semibold" style={{ color: "#C4A048" }}>
                  {deal.amount}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-mono" style={{ color: "#7A9A82" }}>
                    SCORE
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-20 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${deal.score}%`,
                          background:
                            deal.score >= 75
                              ? "#C4A048"
                              : deal.score >= 65
                              ? "#7A9A82"
                              : "#4a7c59",
                        }}
                      />
                    </div>
                    <span className="font-mono text-sm font-semibold" style={{ color: "#EDE8DC" }}>
                      {deal.score}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Eagle Eye Engine ── */}
      <div className="px-8 pb-8">
        <EagleEyeEngine />
      </div>

      {/* ── Data Sources Banner ── */}
      <div
        className="px-8 py-4 border-t flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{ borderColor: "rgba(122,154,130,0.15)", background: "#0D2218" }}
      >
        <div className="flex items-center gap-2 mr-2">
          <Database size={13} style={{ color: "#7A9A82" }} />
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "#7A9A82" }}>
            Data Sources
          </span>
        </div>
        {DATA_SOURCES.map((src) => (
          <span
            key={src}
            className="text-xs font-mono tracking-wider"
            style={{ color: "#EDE8DC", opacity: 0.55 }}
          >
            {src}
          </span>
        ))}
      </div>
    </div>
  );
}
