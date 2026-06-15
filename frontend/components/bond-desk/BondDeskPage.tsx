'use client'
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DealStateProvider } from "@/contexts/DealStateContext";
import { BernardProvider } from "@/contexts/BernardContext";
import LiveMarketTape from "./LiveMarketTape";
import DealPulseTicker from "./DealPulseTicker";
import DealPipelineDashboard from "./DealPipelineDashboard";
import BondStructuringEngine from "./BondStructuringEngine";
import CMBSStackingDesk from "./CMBSStackingDesk";
import CounterpartySandbox from "./CounterpartySandbox";
import SuretyUnderwritingDashboard from "./SuretyUnderwritingDashboard";
import RatingIntelligenceHub from "./RatingIntelligenceHub";
import InvestorPortalTile from "./InvestorPortalTile";
import TrusteeManagementPanel from "./TrusteeManagementPanel";
import WorkflowReadinessPanel from "./WorkflowReadinessPanel"
import IntakeAgentPanel from "./IntakeAgentPanel";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const TABS = [
  { id: "command",     label: "Command Center", tag: "WORKFLOW · AI SCORE" },
  { id: "intake",      label: "Intake",         tag: "BERNARD · STAGE 0" },
  { id: "arrangement", label: "Arrangement",    tag: "GENIE ENGINE" },
  { id: "surety",      label: "Surety",         tag: "HYLANT · LC" },
  { id: "rating",      label: "Rating & Climate", tag: "MOODY'S · S&P · FITCH" },
  { id: "placement",   label: "Placement",      tag: "IRR · MEZZ · KICKER" },
  { id: "trustee",     label: "Trustee",        tag: "US BANK · BNY · WF" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function BondDeskPage() {
  const [activeTab, setActiveTab] = useState<TabId>("command");

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
            <motion.div {...fade(0)} className="mb-6 flex items-end justify-between border-b border-white/[0.07] pb-5">
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
                      Elite Bond Financing Command Center
                    </span>
                  </div>
                  <p className="mt-0.5 font-[Space_Grotesk] text-sm text-[#7A9A82]">
                    Structure · Surety · Rate · Place · Trustee — full lifecycle, one platform
                  </p>
                </div>
              </div>

              {/* Status row */}
              <div className="flex items-center gap-6">
                {[
                  { label: "ENGINE",    value: "ACTIVE", color: "text-emerald-400" },
                  { label: "FRED FEED", value: "LIVE",   color: "text-[#C4A048]" },
                  { label: "CMBS DESK", value: "OPEN",   color: "text-[#C4A048]" },
                  { label: "SURETY",    value: "READY",  color: "text-[#7A9A82]" },
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

            {/* ── TAB NAVIGATION ───────────────────────────────── */}
            <motion.div {...fade(0.06)} className="mb-6">
              <div className="flex items-end gap-1 border-b border-white/[0.07]">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="group relative flex flex-col items-start gap-0.5 px-4 pb-3 pt-2 transition-all"
                    >
                      <span
                        className={`font-[Space_Grotesk] text-sm font-medium transition-colors ${
                          isActive ? "text-[#EDE8DC]" : "text-[#7A9A82] hover:text-[#EDE8DC]/70"
                        }`}
                      >
                        {tab.label}
                      </span>
                      <span className="font-mono text-[0.42rem] uppercase tracking-widest text-[#7A9A82]/60">
                        {tab.tag}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C4A048] to-[#E8C87A]"
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── TAB CONTENT ──────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {activeTab === "command" && (
                <motion.div
                  key="command"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <WorkflowReadinessPanel />
                </motion.div>
              )}

              {activeTab === "intake" && (
                <motion.div
                  key="intake"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SectionLabel label="Bernard Intake" tag="STAGE 0 · PIPELINE ENTRY · 10-STEP CHAIN" />
                  <IntakeAgentPanel />
                </motion.div>
              )}

              {activeTab === "arrangement" && (
                <motion.div
                  key="arrangement"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* MODULE 1: MARKET PULSE + YIELD CURVE */}
                  <motion.div {...fade(0.0)} className="mb-6">
                    <DealPulseTicker />
                  </motion.div>

                  {/* MODULE 2: DEAL PIPELINE KANBAN */}
                  <motion.div {...fade(0.08)} className="mb-6">
                    <SectionLabel label="Deal Pipeline" tag="LIVE DEALS" />
                    <DealPipelineDashboard />
                  </motion.div>

                  {/* MODULE 3: BOND STRUCTURING ENGINE */}
                  <motion.div {...fade(0.16)} className="mb-8">
                    <SectionLabel label="Bond Structuring" tag="GENIE ENGINE · JPM BENCHMARKS" />
                    <BondStructuringEngine />
                  </motion.div>

                  {/* MODULE 4: COUNTERPARTY SANDBOXES */}
                  <motion.div {...fade(0.22)} className="mb-6">
                    <SectionLabel label="Counterparty Sandboxes" tag="MOODY'S · HYLANT · PLACEMENT" />
                    <CounterpartySandbox />
                  </motion.div>

                  {/* DIVIDER */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="my-8 h-px origin-left bg-gradient-to-r from-[#C4A048]/30 via-white/[0.06] to-transparent"
                  />

                  {/* MODULE 5: CMBS STACKING DESK */}
                  <motion.div {...fade(0.30)}>
                    <SectionLabel label="CMBS Stacking Desk" tag="POOL ANALYSIS · WATERFALL" />
                    <CMBSStackingDesk />
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "surety" && (
                <motion.div
                  key="surety"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SectionLabel label="Surety Underwriting" tag="HYLANT TIERS · THREE C'S · LC PHASE" />
                  <SuretyUnderwritingDashboard />
                </motion.div>
              )}

              {activeTab === "rating" && (
                <motion.div
                  key="rating"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SectionLabel label="Rating & Climate Intelligence" tag="MOODY'S · S&P OPBA · FITCH CLIMATE.VS" />
                  <RatingIntelligenceHub />
                </motion.div>
              )}

              {activeTab === "placement" && (
                <motion.div
                  key="placement"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SectionLabel label="Investor Placement Portal" tag="EQUITY KICKER · CONVERTIBLE · MEZZ · IRR" />
                  <InvestorPortalTile />
                </motion.div>
              )}

              {activeTab === "trustee" && (
                <motion.div
                  key="trustee"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SectionLabel label="Master Trustee Management" tag="US BANK · BNY MELLON · WELLS FARGO · FEE COMPARISON" />
                  <TrusteeManagementPanel />
                </motion.div>
              )}
            </AnimatePresence>

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
