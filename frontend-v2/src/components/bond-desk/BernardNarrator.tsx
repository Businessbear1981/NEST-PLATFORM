import { useBernard, type BernardMode } from "@/contexts/BernardContext";
import { motion, AnimatePresence } from "framer-motion";

const MODE_COLORS: Record<BernardMode, string> = {
  expert: "border-amber-500/60 bg-amber-500/10",
  standard: "border-cyan-500/60 bg-cyan-500/10",
  educational: "border-emerald-500/60 bg-emerald-500/10",
};

export default function BernardNarrator() {
  const { mode, setMode, optimizerOn, toggleOptimizer, events } = useBernard();

  return (
    <div className="flex h-full flex-col">
      {/* Header + Mode Toggle */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-[Cormorant_Garamond] text-sm font-semibold tracking-wide text-slate-200">
            Bernard
          </span>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          {(["expert", "standard", "educational"] as BernardMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider transition-all ${
                mode === m
                  ? "bg-white/15 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {m[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Optimizer Toggle */}
      <button
        onClick={toggleOptimizer}
        className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-wider transition-all ${
          optimizerOn
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
            : "border-white/10 bg-white/[0.02] text-slate-500"
        }`}
      >
        <div className={`h-1.5 w-1.5 rounded-full ${optimizerOn ? "bg-amber-400" : "bg-slate-600"}`} />
        Deal Optimizer {optimizerOn ? "ON" : "OFF"}
      </button>

      {/* Event Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {events
            .filter((e) => !e.isOptimizer || optimizerOn)
            .map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className={`rounded-xl border p-3 ${
                  event.isOptimizer
                    ? "border-amber-500/25 bg-amber-500/[0.06]"
                    : MODE_COLORS[mode]
                }`}
              >
                {event.isOptimizer && (
                  <div className="mb-1 font-mono text-[0.5rem] uppercase tracking-widest text-amber-400">
                    Optimizer
                  </div>
                )}
                <p className="font-[Space_Grotesk] text-[0.75rem] leading-relaxed text-slate-200">
                  {event.depths[mode]}
                </p>
                <div className="mt-1.5 font-mono text-[0.5rem] text-slate-600">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-2 text-2xl opacity-30">B</div>
            <p className="font-mono text-[0.6rem] text-slate-600">
              Bernard is watching. Add a tranche to begin.
            </p>
          </div>
        )}
      </div>

      {/* Mode Description */}
      <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
        <p className="font-mono text-[0.55rem] text-slate-500">
          {mode === "expert" && "Headlines only. You know what you're doing."}
          {mode === "standard" && "Key implications surfaced. Expands on complex moves."}
          {mode === "educational" && "Full cause-and-effect chains. Every decision explained."}
        </p>
      </div>
    </div>
  );
}
