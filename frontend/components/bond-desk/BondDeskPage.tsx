'use client'
import { motion } from "framer-motion";
import { DealStateProvider } from "@/contexts/DealStateContext";
import { BernardProvider } from "@/contexts/BernardContext";
import LiveMarketTape from "./LiveMarketTape";
import DealPulseTicker from "./DealPulseTicker";
import DealPipelineDashboard from "./DealPipelineDashboard";
import BondStructuringEngine from "./BondStructuringEngine";
import CMBSStackingDesk from "./CMBSStackingDesk";
import CounterpartySandbox from "./CounterpartySandbox";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function BondDeskPage() {
  return (
    <DealStateProvider>
      <BernardProvider defaultMode="standard">
        <div
          className="min-h-screen text-[#EDE8DC]"
          style={{
            background:
              "radial-gradient(ellipse at 8% 0%, rgba(196,160,72,0.09) 0%, transparent 45%)," +
              "radial-gradient(ellipse at 92% 0%, rgba(196,160,72,0.11) 0%, transparent 40%)," +
              "radial-gradient(ellipse at 50% 100%, rgba(196,160,72,0.05) 0%, transparent 50%)," +
              "linear-gradient(180deg,#020b14 0%,#030A06 40%,#020b14 100%)",
          }}
        >
          {/* ── LIVE MARKET TAPE ─────────────────────────────────── */}
          <LiveMarketTape />

          <main className="px-4 py-6 sm:px-8">

            {/* ── BLOOMBERG TERMINAL HEADER ────────────────────── */}
            <motion.div {...fade(0)} className="mb-7 flex items-end justify-between border-b border-white/[0.07] pb-5">
              <div className="flex items-end gap-5">
                {/* Scan-line mark */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-[#C4A048]/25 bg-[#C4A048]/[0.06]">
                  <motion.div
                    className="absolute inset-x-0 h-px bg-[#C4A048]/40"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="font-[Cormorant_Garamond] text-2xl font-bold text-[#C4A048]">G</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <h1 className="font-[Cormorant_Garamond] text-4xl font-bold tracking-tight text-[#EDE8DC]">
                      GENIE
                    </h1>
                    <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#7A9A82]">
                      Bond Arrangement Engine
                    </span>
                  </div>
                  <p className="mt-0.5 font-[Space_Grotesk] text-sm text-[#7A9A82]">
                    Structure · Price · Place — any debt vehicle, any sector
                  </p>
                </div>
              </div>

              {/* Status row */}
              <div className="flex items-center gap-6">
                {[
                  { label: "ENGINE", value: "ACTIVE", color: "text-emerald-400" },
                  { label: "FRED FEED", value: "LIVE", color: "text-[#C4A048]" },
                  { label: "CMBS DESK", value: "OPEN", color: "text-[#C4A048]" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-[0.45rem] uppercase tracking-widest text-[#7A9A82]">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        className={`h-1.5 w-1.5 rounded-full ${color.replace("text-", "bg-")}`}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: Math.random() * 0.8 }}
                      />
                      <span className={`font-mono text-[0.65rem] font-semibold ${color}`}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── MODULE 1: MARKET PULSE + YIELD CURVE ────────── */}
            <motion.div {...fade(0.08)} className="mb-6">
              <DealPulseTicker />
            </motion.div>

            {/* ── MODULE 2: DEAL PIPELINE KANBAN ───────────────── */}
            <motion.div {...fade(0.16)} className="mb-6">
              <SectionLabel label="Deal Pipeline" tag="LIVE DEALS" />
              <DealPipelineDashboard />
            </motion.div>

            {/* ── MODULE 3: BOND STRUCTURING ENGINE ────────────── */}
            <motion.div {...fade(0.24)} className="mb-8">
              <SectionLabel label="Bond Structuring" tag="GENIE ENGINE · JPM BENCHMARKS" />
              <BondStructuringEngine />
            </motion.div>

            {/* ── MODULE 4: COUNTERPARTY SANDBOXES ─────────────── */}
            <motion.div {...fade(0.30)} className="mb-6">
              <SectionLabel label="Counterparty Sandboxes" tag="MOODY'S · HYLANT · PLACEMENT" />
              <CounterpartySandbox />
            </motion.div>

            {/* ── DIVIDER ───────────────────────────────────────── */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="my-8 h-px origin-left bg-gradient-to-r from-[#C4A048]/30 via-white/[0.06] to-transparent"
            />

            {/* ── MODULE 5: CMBS STACKING DESK ─────────────────── */}
            <motion.div {...fade(0.42)}>
              <SectionLabel label="CMBS Stacking Desk" tag="POOL ANALYSIS · WATERFALL" />
              <CMBSStackingDesk />
            </motion.div>

          </main>
        </div>
      </BernardProvider>
    </DealStateProvider>
  );
}

function SectionLabel({ label, tag }: { label: string; tag: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/[0.05]" />
      <span className="font-[Cormorant_Garamond] text-base font-semibold text-[#EDE8DC]/70">{label}</span>
      <span className="font-mono text-[0.45rem] uppercase tracking-[0.18em] text-[#7A9A82]">{tag}</span>
      <div className="h-px flex-1 bg-white/[0.05]" />
    </div>
  );
}
