import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDealState, type Deal } from "@/contexts/DealStateContext";
import { useBernard } from "@/contexts/BernardContext";

interface PipelineDeal {
  id: string;
  name: string;
  sponsor: string;
  total_project_cost_usd: number;
  stabilized_noi_usd: number;
  appraised_value_usd: number;
  use_of_proceeds: string;
  sector: string;
  phase: Deal["phase"];
  grade?: string;
  dscr?: number;
  assignedPartners?: string[];
  lastActivity?: string;
}

const PHASES: { key: Deal["phase"]; label: string; color: string; glow: string }[] = [
  { key: "sourcing", label: "Sourcing", color: "border-slate-500/30 bg-slate-500/[0.06]", glow: "bg-slate-400" },
  { key: "structuring", label: "Structuring", color: "border-cyan-500/30 bg-cyan-500/[0.06]", glow: "bg-cyan-400" },
  { key: "placement", label: "Placement", color: "border-amber-500/30 bg-amber-500/[0.06]", glow: "bg-amber-400" },
  { key: "closing", label: "Closing", color: "border-emerald-500/30 bg-emerald-500/[0.06]", glow: "bg-emerald-400" },
];

const DEMO_PIPELINE: PipelineDeal[] = [
  {
    id: "jacaranda-001", name: "Jacaranda Trace PLOM", sponsor: "Soparrow Capital",
    total_project_cost_usd: 231_000_000, stabilized_noi_usd: 18_500_000,
    appraised_value_usd: 277_200_000, use_of_proceeds: "Ground-up mixed use",
    sector: "mixed_use", phase: "structuring", grade: "BBB+", dscr: 1.82,
    assignedPartners: ["Moody's", "Hylant"], lastActivity: "Tranche B added — 2hr ago",
  },
  {
    id: "meridian-002", name: "Meridian Health Campus", sponsor: "Arden Edge Capital",
    total_project_cost_usd: 145_000_000, stabilized_noi_usd: 12_800_000,
    appraised_value_usd: 174_000_000, use_of_proceeds: "Healthcare facility",
    sector: "healthcare", phase: "sourcing", grade: undefined, dscr: undefined,
    assignedPartners: [], lastActivity: "EagleEye flagged — 6hr ago",
  },
  {
    id: "harbor-003", name: "Harbor Point Industrial", sponsor: "Soparrow Capital",
    total_project_cost_usd: 89_000_000, stabilized_noi_usd: 9_200_000,
    appraised_value_usd: 106_800_000, use_of_proceeds: "Industrial warehouse",
    sector: "industrial", phase: "placement", grade: "A", dscr: 2.15,
    assignedPartners: ["Moody's", "Hylant", "Hawkeye"], lastActivity: "Book 62% subscribed — 1hr ago",
  },
  {
    id: "oakwood-004", name: "Oakwood Multifamily", sponsor: "Arden Edge Capital",
    total_project_cost_usd: 67_000_000, stabilized_noi_usd: 5_800_000,
    appraised_value_usd: 80_400_000, use_of_proceeds: "Multifamily development",
    sector: "multifamily", phase: "structuring", grade: "BBB", dscr: 1.65,
    assignedPartners: ["Hylant"], lastActivity: "Call option added — 4hr ago",
  },
  {
    id: "summit-005", name: "Summit Office Tower", sponsor: "Soparrow Capital",
    total_project_cost_usd: 178_000_000, stabilized_noi_usd: 14_200_000,
    appraised_value_usd: 213_600_000, use_of_proceeds: "Class A office",
    sector: "office", phase: "closing", grade: "BBB+", dscr: 1.78,
    assignedPartners: ["Moody's", "Hylant", "Hawkeye"], lastActivity: "Final docs — 30min ago",
  },
];

const GRADE_COLORS: Record<string, string> = {
  A: "text-emerald-400", "BBB+": "text-emerald-300", BBB: "text-cyan-400",
  "BBB-": "text-cyan-300", "BB+": "text-amber-400", "Sub-IG": "text-rose-400",
};

export default function DealPipelineDashboard() {
  const { setDeal, log } = useDealState();
  const bernard = useBernard();
  const [collapsed, setCollapsed] = useState(false);
  const [pipeline] = useState<PipelineDeal[]>(DEMO_PIPELINE);

  const handleLoadDeal = (deal: PipelineDeal) => {
    setDeal({
      id: deal.id,
      name: deal.name,
      sponsor: deal.sponsor,
      total_project_cost_usd: deal.total_project_cost_usd,
      stabilized_noi_usd: deal.stabilized_noi_usd,
      appraised_value_usd: deal.appraised_value_usd,
      use_of_proceeds: deal.use_of_proceeds,
      sector: deal.sector,
      phase: deal.phase,
    });
    log("NEST", "deal_loaded", `${deal.name} loaded from pipeline`);
    bernard.push({
      type: "deal_loaded",
      depths: {
        expert: `Loaded ${deal.name}. ${deal.grade ?? "Ungraded"}. ${deal.phase}.`,
        standard: `Loaded "${deal.name}" (${deal.phase} phase). $${(deal.total_project_cost_usd / 1e6).toFixed(0)}M TPC. ${deal.grade ? `Current grade: ${deal.grade}, DSCR ${deal.dscr?.toFixed(2)}x.` : "Not yet graded — add tranches to begin."}`,
        educational: `You've loaded "${deal.name}" from the deal pipeline. This is a $${(deal.total_project_cost_usd / 1e6).toFixed(0)}M ${deal.sector.replace("_", " ")} project sponsored by ${deal.sponsor}. ${deal.grade ? `It's currently graded ${deal.grade} with a ${deal.dscr?.toFixed(2)}x DSCR. ` : "It hasn't been graded yet — you'll need to add tranches to structure it. "}The deal is in the ${deal.phase} phase. ${deal.assignedPartners && deal.assignedPartners.length > 0 ? `Partners assigned: ${deal.assignedPartners.join(", ")}.` : "No partners assigned yet."}`,
      },
    });
  };

  const totalPipeline = pipeline.reduce((s, d) => s + d.total_project_cost_usd, 0);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-4">
          <h2 className="font-[Cormorant_Garamond] text-lg font-semibold text-slate-200">
            Deal Pipeline
          </h2>
          <div className="flex items-center gap-3 font-mono text-[0.6rem] text-slate-500">
            <span>{pipeline.length} deals</span>
            <span>·</span>
            <span className="text-[#C4A048]">${(totalPipeline / 1e6).toFixed(0)}M total</span>
            <span>·</span>
            {PHASES.map((p) => {
              const count = pipeline.filter((d) => d.phase === p.key).length;
              return count > 0 ? (
                <span key={p.key} className="flex items-center gap-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${p.glow}`} />
                  {count} {p.label.toLowerCase()}
                </span>
              ) : null;
            })}
          </div>
        </div>
        <span className="font-mono text-xs text-slate-600">{collapsed ? "▸" : "▾"}</span>
      </button>

      {/* Pipeline Kanban */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-3 px-5 pb-4">
              {PHASES.map((phase) => {
                const deals = pipeline.filter((d) => d.phase === phase.key);
                return (
                  <div key={phase.key} className="space-y-2">
                    {/* Phase Header */}
                    <div className="flex items-center gap-2 py-1">
                      <div className={`h-2 w-2 rounded-full ${phase.glow}`} />
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-400">
                        {phase.label}
                      </span>
                      <span className="font-mono text-[0.55rem] text-slate-600">({deals.length})</span>
                    </div>

                    {/* Deal Cards */}
                    {deals.map((deal) => (
                      <motion.button
                        key={deal.id}
                        layout
                        onClick={() => handleLoadDeal(deal)}
                        className={`w-full rounded-xl border p-3 text-left transition-all hover:scale-[1.02] hover:shadow-lg ${phase.color}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-[Space_Grotesk] text-[0.8rem] font-medium text-slate-200 leading-tight">
                            {deal.name}
                          </span>
                          {deal.grade && (
                            <span className={`font-mono text-[0.6rem] font-semibold ${GRADE_COLORS[deal.grade] ?? "text-slate-400"}`}>
                              {deal.grade}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 font-mono text-[0.55rem] text-slate-500">
                          {deal.sponsor} · ${(deal.total_project_cost_usd / 1e6).toFixed(0)}M
                        </div>
                        {deal.dscr && (
                          <div className="mt-1 font-mono text-[0.55rem] text-[#C4A048]">
                            DSCR {deal.dscr.toFixed(2)}x
                          </div>
                        )}
                        {deal.assignedPartners && deal.assignedPartners.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {deal.assignedPartners.map((p) => (
                              <span key={p} className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.45rem] text-slate-400">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                        {deal.lastActivity && (
                          <div className="mt-1.5 font-mono text-[0.5rem] text-slate-600 italic">
                            {deal.lastActivity}
                          </div>
                        )}
                      </motion.button>
                    ))}

                    {deals.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/[0.06] py-6 text-center font-mono text-[0.55rem] text-slate-700">
                        No deals
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
