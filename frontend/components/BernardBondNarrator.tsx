"use client";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BernardMessage } from "@/shared/bondArrangementDemo";

// ── Tone Config ─────────────────────────────────────────────────

const TONE_CONFIG: Record<
  BernardMessage["tone"],
  { icon: string; label: string; border: string; accent: string; glow: string }
> = {
  explain: {
    icon: "\u{1F4CB}",
    label: "EXPLANATION",
    border: "border-l-cyan-400",
    accent: "text-[#C4A048]",
    glow: "shadow-[#C4A048]/10",
  },
  warn: {
    icon: "\u26A0\uFE0F",
    label: "WARNING",
    border: "border-l-amber-400",
    accent: "text-amber-300",
    glow: "shadow-amber-500/10",
  },
  recommend: {
    icon: "\u26A1",
    label: "RECOMMENDATION",
    border: "border-l-emerald-400",
    accent: "text-emerald-300",
    glow: "shadow-emerald-500/10",
  },
  celebrate: {
    icon: "\u{1F3AF}",
    label: "MILESTONE",
    border: "border-l-[#C4A048]",
    accent: "text-[#E8C87A]",
    glow: "shadow-[#C4A048]/10",
  },
};

function formatContext(ctx: string): string {
  const map: Record<string, string> = {
    initial_load: "Initial Load",
    scenario_change: "Scenario Change",
    bond_modify: "Bond Modified",
    pool_update: "Pool Updated",
    covenant_alert: "Covenant Alert",
    call_exercise: "Call Exercised",
    put_exercise: "Put Exercised",
    draw_event: "Draw Event",
  };
  return map[ctx] || ctx.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 px-4 py-3 border-l-2 border-l-[#C4A048]/50 bg-[#0D2218]/60 rounded-r"
    >
      <span className="font-mono text-xs text-[#C4A048] tracking-wider uppercase">
        Bernard is thinking
      </span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#C4A048]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </span>
    </motion.div>
  );
}

function NarratorMessage({ msg, index }: { msg: BernardMessage; index: number }) {
  const tone = TONE_CONFIG[msg.tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative border-l-2 ${tone.border} bg-[#030A06]/70 rounded-r px-4 py-3 shadow-lg ${tone.glow} hover:bg-[#030A06]/90 transition-colors duration-200`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{tone.icon}</span>
        <span className={`font-mono text-[10px] tracking-[0.15em] uppercase font-semibold ${tone.accent}`}>
          {tone.label}
        </span>
        <span className="font-mono text-[10px] text-[#7A9A82]">{"\u00B7"}</span>
        <span className="font-mono text-[10px] text-[#7A9A82] tracking-wide">
          {formatContext(msg.context)}
        </span>
      </div>
      <p className="font-mono text-xs leading-relaxed text-[#EDE8DC]/90 whitespace-pre-wrap">
        {msg.message}
      </p>
      <div className="mt-2 text-right">
        <span className="font-mono text-[10px] text-[#7A9A82]/60">
          {formatTimestamp(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

// ── Props ───────────────────────────────────────────────────────

interface BernardBondNarratorProps {
  messages: BernardMessage[];
  isThinking?: boolean;
}

// ── Main Component ──────────────────────────────────────────────

export default function BernardBondNarrator({ messages, isThinking = false }: BernardBondNarratorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messageCount, setMessageCount] = useState(messages.length);

  useEffect(() => {
    if (messages.length !== messageCount || isThinking) {
      setMessageCount(messages.length);
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
      });
    }
  }, [messages.length, messageCount, isThinking]);

  return (
    <div className="flex flex-col h-full bg-[#0D2218] border border-[#1E4A2E]/40 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E4A2E]/40 bg-[#030A06]/60">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#C4A048] opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C4A048]" />
          </span>
          <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[#C4A048] font-semibold">
            Bernard — Bond Advisor
          </h2>
        </div>
        <span className="font-mono text-[10px] text-[#7A9A82]/60">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div>

      {/* Message Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
      >
        {messages.length === 0 && !isThinking && (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono text-xs text-[#7A9A82]/40 text-center">
              No messages yet. Load a deal or change a scenario
              <br />
              and Bernard will start talking.
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <NarratorMessage key={msg.id} msg={msg} index={i} />
          ))}
        </AnimatePresence>

        <AnimatePresence>{isThinking && <ThinkingIndicator />}</AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#1E4A2E]/30 bg-[#030A06]/40">
        <p className="font-mono text-[9px] text-[#7A9A82]/40 text-center tracking-wider uppercase">
          Bernard narrates every decision. No move goes unexplained.
        </p>
      </div>
    </div>
  );
}
