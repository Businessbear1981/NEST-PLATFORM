import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, CheckCircle2, Loader2 } from "lucide-react";
import NestMark from "./NestMark";

/**
 * DucklingAgentFlow — "Mr. Beeks" Power Plant
 * Spider-Verse / Matrix power plant visualization.
 * All agents feed into Mr. Beeks (the NEST King chess piece) at center.
 * Energy flows from outer ring → inner ring → Beeks.
 */

interface AgentNode {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  ring: "outer" | "inner";
  state: "idle" | "running" | "complete";
}

const AGENTS: AgentNode[] = [
  // Outer ring — sourcing & data
  { id: "eagleeye", name: "EagleEye", role: "Sourcing", icon: "🦅", color: "cyan", ring: "outer" },
  { id: "merlin", name: "Merlin", role: "M&A Intel", icon: "🧙", color: "cyan", ring: "outer" },
  { id: "aria", name: "Aria", role: "BD Outreach", icon: "🎭", color: "fuchsia", ring: "outer" },
  { id: "lenderscout", name: "LenderScout", role: "Lender Match", icon: "🔍", color: "cyan", ring: "outer" },
  { id: "prometheus", name: "Prometheus", role: "Feasibility", icon: "🔥", color: "amber", ring: "outer" },
  { id: "vector", name: "Vector", role: "Market Signals", icon: "📡", color: "cyan", ring: "outer" },
  // Inner ring — processing & structuring
  { id: "atlas", name: "Atlas", role: "Modeling", icon: "🗺️", color: "amber", ring: "inner" },
  { id: "maxwell", name: "Maxwell", role: "Credit", icon: "⚡", color: "amber", ring: "inner" },
  { id: "sentinel", name: "Sentinel", role: "Risk", icon: "🛡️", color: "red", ring: "inner" },
  { id: "architect", name: "Architect", role: "Structure", icon: "🏛️", color: "amber", ring: "inner" },
  { id: "pricing", name: "Pricing", role: "MTM", icon: "📊", color: "emerald", ring: "inner" },
  { id: "sterling", name: "Sterling", role: "Placement", icon: "💎", color: "fuchsia", ring: "inner" },
  { id: "morgan", name: "Morgan", role: "Memos", icon: "📝", color: "amber", ring: "inner" },
  { id: "apex", name: "Apex", role: "Hedging", icon: "🎯", color: "red", ring: "inner" },
];

const ringColors: Record<string, { border: string; bg: string; glow: string; active: string }> = {
  cyan: {
    border: "border-cyan-300/30",
    bg: "bg-cyan-400/8",
    glow: "shadow-[0_0_14px_rgba(34,211,238,0.20)]",
    active: "shadow-[0_0_30px_rgba(34,211,238,0.50),0_0_60px_rgba(34,211,238,0.20)]",
  },
  amber: {
    border: "border-amber-300/30",
    bg: "bg-amber-300/8",
    glow: "shadow-[0_0_14px_rgba(251,191,36,0.20)]",
    active: "shadow-[0_0_30px_rgba(251,191,36,0.50),0_0_60px_rgba(251,191,36,0.20)]",
  },
  emerald: {
    border: "border-emerald-300/30",
    bg: "bg-emerald-400/8",
    glow: "shadow-[0_0_14px_rgba(52,211,153,0.20)]",
    active: "shadow-[0_0_30px_rgba(52,211,153,0.50),0_0_60px_rgba(52,211,153,0.20)]",
  },
  red: {
    border: "border-red-400/30",
    bg: "bg-red-500/8",
    glow: "shadow-[0_0_14px_rgba(248,113,113,0.20)]",
    active: "shadow-[0_0_30px_rgba(248,113,113,0.50),0_0_60px_rgba(248,113,113,0.20)]",
  },
  fuchsia: {
    border: "border-fuchsia-300/30",
    bg: "bg-fuchsia-500/8",
    glow: "shadow-[0_0_14px_rgba(217,70,239,0.20)]",
    active: "shadow-[0_0_30px_rgba(217,70,239,0.50),0_0_60px_rgba(217,70,239,0.20)]",
  },
};

export default function DucklingAgentFlow({ autoRun }: { autoRun?: boolean }) {
  const [agents, setAgents] = useState(AGENTS.map((a) => ({ ...a })));
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [beeksActive, setBeeksActive] = useState(false);

  const completedCount = agents.filter((a) => a.state === "complete").length;
  const allDone = completedCount === agents.length;

  const runPipeline = () => {
    setAgents(AGENTS.map((a) => ({ ...a, state: "idle" })));
    setCurrentIdx(0);
    setIsRunning(true);
    setBeeksActive(false);
  };

  useEffect(() => {
    if (currentIdx < 0 || currentIdx >= agents.length) {
      if (currentIdx >= agents.length) {
        setIsRunning(false);
        setBeeksActive(true);
      }
      return;
    }
    setAgents((prev) => prev.map((a, i) => (i === currentIdx ? { ...a, state: "running" } : a)));
    const delay = 400 + Math.random() * 800;
    const timer = setTimeout(() => {
      setAgents((prev) => prev.map((a, i) => (i === currentIdx ? { ...a, state: "complete" } : a)));
      setCurrentIdx((idx) => idx + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [currentIdx]);

  useEffect(() => {
    if (autoRun) runPipeline();
  }, [autoRun]);

  const outerAgents = agents.filter((a) => a.ring === "outer");
  const innerAgents = agents.filter((a) => a.ring === "inner");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
          <Bot size={17} /> Duckling Power Plant — Mr. Beeks
        </div>
        <button onClick={runPipeline} disabled={isRunning}
          className="flex items-center gap-1.5 rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-300/20 disabled:opacity-50">
          <Zap size={13} /> {isRunning ? "Powering Up..." : "Ignite Pipeline"}
        </button>
      </div>

      {/* ── Power Plant Visualization ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-b from-[#030a06]/95 via-[#07101a]/90 to-black/85 py-8">
        {/* Background energy grid */}
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.08),transparent_50%),radial-gradient(circle,rgba(255,255,255,0.4)_0.5px,transparent_0.6px)] [background-size:100%_100%,20px_20px]" />

        {/* Energy pulse rings */}
        {isRunning && (
          <>
            <motion.div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/15"
              animate={{ width: [100, 500], height: [100, 500], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }} />
            <motion.div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15"
              animate={{ width: [80, 400], height: [80, 400], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }} />
          </>
        )}

        {/* MR. BEEKS — Center piece */}
        <div className="relative flex flex-col items-center">
          <motion.div
            className={`rounded-2xl bg-[#0a1f16] p-3 transition-all duration-500 ${
              beeksActive
                ? "shadow-[0_0_60px_rgba(201,168,76,0.50),0_0_120px_rgba(201,168,76,0.25),0_0_200px_rgba(201,168,76,0.10)]"
                : isRunning
                ? "shadow-[0_0_40px_rgba(201,168,76,0.30),0_0_80px_rgba(201,168,76,0.12)]"
                : "shadow-[0_0_20px_rgba(201,168,76,0.15)]"
            }`}
            animate={beeksActive ? { scale: [1, 1.05, 1] } : isRunning ? { scale: [1, 1.02, 1] } : {}}
            transition={beeksActive || isRunning ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            <NestMark size={72} />
          </motion.div>
          <p className="mt-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-amber-200">
            {beeksActive ? "ALL SYSTEMS ONLINE" : isRunning ? "POWERING UP..." : "MR. BEEKS"}
          </p>
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-slate-500">
            {completedCount}/{agents.length} agents active
          </p>
        </div>

        {/* Inner ring agents */}
        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2 px-6">
          {innerAgents.map((agent, idx) => (
            <AgentChip key={agent.id} agent={agent} idx={idx} />
          ))}
        </div>

        {/* Outer ring agents */}
        <div className="relative mt-3 flex flex-wrap items-center justify-center gap-2 px-6">
          {outerAgents.map((agent, idx) => (
            <AgentChip key={agent.id} agent={agent} idx={idx} />
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-slate-400">
          {completedCount}/{agents.length} agents powered
        </span>
        <span className={`font-mono text-[0.62rem] font-semibold uppercase ${
          allDone ? "text-emerald-200" : isRunning ? "text-amber-200" : "text-slate-500"
        }`}>
          {allDone ? "🦆 All Ducklings Online" : isRunning ? "Feeding Mr. Beeks..." : "Ready to Ignite"}
        </span>
      </div>
    </div>
  );
}

function AgentChip({ agent, idx }: { agent: AgentNode; idx: number }) {
  const rc = ringColors[agent.color] ?? ringColors.amber;
  const isActive = agent.state === "running";
  const isDone = agent.state === "complete";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.03 }}
      className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-2 transition-all duration-300 ${rc.border} ${rc.bg} ${
        isActive ? rc.active : isDone ? rc.glow : "opacity-40"
      }`}
    >
      <motion.span
        className="text-base"
        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
        transition={isActive ? { repeat: Infinity, duration: 0.6 } : {}}
      >
        {agent.icon}
      </motion.span>
      <div>
        <p className="font-mono text-[0.58rem] font-semibold uppercase leading-none text-white">{agent.name}</p>
        <p className="font-mono text-[0.46rem] uppercase leading-none text-slate-400">{agent.role}</p>
      </div>
      <div className="ml-1">
        {isActive && <Loader2 size={10} className="animate-spin text-white" />}
        {isDone && <CheckCircle2 size={10} className="text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]" />}
      </div>
    </motion.div>
  );
}
