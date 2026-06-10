import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDealState } from "@/contexts/DealStateContext";
import { useBernard } from "@/contexts/BernardContext";

type CounterpartyRole = "credit" | "surety" | "placement";

interface ProposedChange {
  id: string;
  field: string;
  label: string;
  currentValue: string;
  proposedValue: string;
  rationale: string;
  status: "pending" | "accepted" | "rejected" | "countered";
}

interface Sandbox {
  id: string;
  role: CounterpartyRole;
  firm: string;
  analyst: string;
  tokenExpiresHrs: number;
  status: "active" | "frozen" | "burned";
  proposals: ProposedChange[];
}

const ROLE_CONFIG: Record<CounterpartyRole, {
  label: string;
  firm: string;
  analyst: string;
  color: string;
  borderColor: string;
  canModify: string[];
  cannotTouch: string[];
}> = {
  credit: {
    label: "Credit Review",
    firm: "Moody's Investors Service",
    analyst: "Sarah Chen, VP — Structured Finance",
    color: "text-blue-400",
    borderColor: "border-blue-500/30 bg-blue-500/[0.06]",
    canModify: ["DSCR covenant", "Rating inputs", "Enhancement suggestions", "Subordination floor"],
    cannotTouch: ["Tranche sizes", "Coupons", "Spreads"],
  },
  surety: {
    label: "Surety Underwriting",
    firm: "Hylant Insurance",
    analyst: "Marcus Webb, Director — Surety & Specialty",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30 bg-emerald-500/[0.06]",
    canModify: ["Coverage %", "Premium basis points", "3C scoring inputs", "Wrap recommendations"],
    cannotTouch: ["Capital stack", "Coupons", "Deal structure"],
  },
  placement: {
    label: "Placement Desk",
    firm: "Hawkeye Capital Markets",
    analyst: "David Park, MD — Institutional Sales",
    color: "text-amber-400",
    borderColor: "border-amber-500/30 bg-amber-500/[0.06]",
    canModify: ["Spread counter", "Demand indications", "Placability flags", "Book feedback"],
    cannotTouch: ["Structure", "Covenants", "Ratings"],
  },
};

// Simulated proposals per role (what a counterparty would realistically propose)
function generateProposals(role: CounterpartyRole, dealName: string): ProposedChange[] {
  const proposals: Record<CounterpartyRole, ProposedChange[]> = {
    credit: [
      {
        id: crypto.randomUUID(), field: "dscr_covenant", label: "DSCR Covenant Floor",
        currentValue: "1.25x", proposedValue: "1.40x",
        rationale: "Current 1.25x floor provides insufficient cushion for this asset class. Historical default analysis on mixed-use suggests 1.40x minimum for investment grade.",
        status: "pending",
      },
      {
        id: crypto.randomUUID(), field: "cash_sweep", label: "Cash Sweep Trigger",
        currentValue: "None", proposedValue: "Cash sweep at 1.30x DSCR",
        rationale: "Adding a cash sweep covenant at 1.30x provides an early warning mechanism. Tightens credit profile by ~1 notch without changing economics.",
        status: "pending",
      },
      {
        id: crypto.randomUUID(), field: "subordination", label: "Minimum Subordination",
        currentValue: "18%", proposedValue: "22%",
        rationale: "Sector concentration in the pool warrants additional subordination. 22% aligns with recent Moody's CMBS methodology update for single-sponsor pools.",
        status: "pending",
      },
    ],
    surety: [
      {
        id: crypto.randomUUID(), field: "coverage_pct", label: "Surety Coverage",
        currentValue: "100% Series A", proposedValue: "85% Series A + 50% Series B",
        rationale: "Full wrap on A is standard. Adding partial B coverage at 50% extends the credit envelope and may unlock BBB+ on the B tranche. Premium impact: +35bps.",
        status: "pending",
      },
      {
        id: crypto.randomUUID(), field: "premium_bps", label: "Surety Premium",
        currentValue: "85bps", proposedValue: "110bps",
        rationale: "Given construction risk profile and 18-month build schedule, base premium of 85bps is below our floor for this asset type. 110bps reflects current market for ground-up mixed-use with single-sponsor.",
        status: "pending",
      },
    ],
    placement: [
      {
        id: crypto.randomUUID(), field: "series_a_spread", label: "Series A Spread",
        currentValue: "T+85bps", proposedValue: "T+95bps",
        rationale: "Current book won't clear at T+85. Insurance accounts need T+90 minimum for this duration. Regional banks indicate T+95. Recommend widening to ensure full subscription.",
        status: "pending",
      },
      {
        id: crypto.randomUUID(), field: "book_status", label: "Book Status",
        currentValue: "Not started", proposedValue: "Pre-marketing indicates 40% soft interest",
        rationale: "Based on 6 accounts contacted: 2 insurance cos at $25M each (firm), 1 regional bank at $15M (soft), 3 family offices still reviewing. Total soft book: ~$65M of $150M Series A.",
        status: "pending",
      },
      {
        id: crypto.randomUUID(), field: "investor_feedback", label: "Investor Feedback",
        currentValue: "None", proposedValue: "Add make-whole call protection",
        rationale: "3 of 6 investors flagged the par call at year 3 as too aggressive. Make-whole through year 5 with par call after would significantly improve demand. Estimated impact: could tighten spread by 8-12bps.",
        status: "pending",
      },
    ],
  };
  return proposals[role] ?? [];
}

export default function CounterpartySandbox() {
  const { state, log } = useDealState();
  const bernard = useBernard();
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const handleInvite = useCallback((role: CounterpartyRole) => {
    const config = ROLE_CONFIG[role];
    if (sandboxes.some((s) => s.role === role && s.status === "active")) return;

    const sandbox: Sandbox = {
      id: crypto.randomUUID(),
      role,
      firm: config.firm,
      analyst: config.analyst,
      tokenExpiresHrs: 72,
      status: "active",
      proposals: generateProposals(role, state.activeDeal?.name ?? "Deal"),
    };
    setSandboxes((prev) => [...prev, sandbox]);
    log("NEST", "sandbox_created", `Invited ${config.firm} (${config.label})`);
    bernard.push({
      type: "counterparty_invited",
      depths: {
        expert: `${config.firm} sandbox active. ${sandbox.proposals.length} proposals incoming.`,
        standard: `Invited ${config.analyst} from ${config.firm} as ${config.label}. They can modify: ${config.canModify.slice(0, 2).join(", ")}. Token expires in 72hrs. ${sandbox.proposals.length} proposals received.`,
        educational: `You've invited ${config.firm} to review this deal as a ${config.label} counterparty. ${config.analyst} now has a sandboxed view of your deal model. They can adjust ${config.canModify.join(", ")} — but cannot touch ${config.cannotTouch.join(", ")}. Their changes appear as proposals that you accept, reject, or counter. The access token expires in 72 hours or when you advance the deal phase. ${sandbox.proposals.length} proposals have already been submitted for your review.`,
      },
    });
  }, [sandboxes, state.activeDeal, log, bernard]);

  const handleProposalAction = useCallback((sandboxId: string, proposalId: string, action: "accepted" | "rejected" | "countered") => {
    setSandboxes((prev) =>
      prev.map((s) =>
        s.id === sandboxId
          ? { ...s, proposals: s.proposals.map((p) => p.id === proposalId ? { ...p, status: action } : p) }
          : s
      )
    );
    const sandbox = sandboxes.find((s) => s.id === sandboxId);
    const proposal = sandbox?.proposals.find((p) => p.id === proposalId);
    if (proposal) {
      log("NEST", `proposal_${action}`, `${proposal.label}: ${proposal.proposedValue}`);
    }
  }, [sandboxes, log]);

  const handleBurnToken = useCallback((sandboxId: string) => {
    setSandboxes((prev) =>
      prev.map((s) => s.id === sandboxId ? { ...s, status: "burned" as const } : s)
    );
  }, []);

  if (!state.activeDeal) return null;

  const activeSandboxes = sandboxes.filter((s) => s.status === "active");
  const totalPending = activeSandboxes.reduce((s, sb) => s + sb.proposals.filter((p) => p.status === "pending").length, 0);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-4">
          <h2 className="font-[Cormorant_Garamond] text-lg font-semibold text-slate-200">
            Counterparty Sandboxes
          </h2>
          <div className="flex items-center gap-3 font-mono text-[0.6rem] text-slate-500">
            <span>{activeSandboxes.length} active</span>
            {totalPending > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-400">{totalPending} pending proposals</span>
              </>
            )}
          </div>
        </div>
        <span className="font-mono text-xs text-slate-600">{collapsed ? "▸" : "▾"}</span>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Invite Buttons */}
              <div className="flex gap-3">
                {(Object.entries(ROLE_CONFIG) as [CounterpartyRole, typeof ROLE_CONFIG[CounterpartyRole]][]).map(([role, config]) => {
                  const exists = sandboxes.some((s) => s.role === role && s.status === "active");
                  return (
                    <button
                      key={role}
                      onClick={() => handleInvite(role)}
                      disabled={exists}
                      className={`flex-1 rounded-xl border px-4 py-2.5 font-mono text-[0.65rem] transition-all ${
                        exists
                          ? "border-white/5 bg-white/[0.01] text-slate-600 cursor-not-allowed"
                          : `${config.borderColor} ${config.color} hover:scale-[1.02]`
                      }`}
                    >
                      <div className="font-semibold">{exists ? `${config.label} ✓` : `Invite ${config.label}`}</div>
                      <div className="mt-0.5 text-[0.5rem] opacity-60">{config.firm}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Sandboxes */}
              {activeSandboxes.map((sandbox) => {
                const config = ROLE_CONFIG[sandbox.role];
                const pending = sandbox.proposals.filter((p) => p.status === "pending").length;
                return (
                  <motion.div
                    key={sandbox.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 ${config.borderColor}`}
                  >
                    {/* Sandbox Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${config.color.replace("text-", "bg-")} animate-pulse`} />
                          <span className={`font-[Space_Grotesk] text-sm font-semibold ${config.color}`}>
                            {config.firm}
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-[0.55rem] text-slate-500">
                          {config.analyst} · Token expires in {sandbox.tokenExpiresHrs}hrs
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pending > 0 && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[0.5rem] text-amber-400">
                            {pending} pending
                          </span>
                        )}
                        <button
                          onClick={() => handleBurnToken(sandbox.id)}
                          className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-2 py-1 font-mono text-[0.5rem] text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          Burn Token
                        </button>
                      </div>
                    </div>

                    {/* Guardrails */}
                    <div className="mb-3 flex gap-4 font-mono text-[0.5rem]">
                      <div>
                        <span className="text-slate-600">CAN MODIFY: </span>
                        <span className="text-slate-400">{config.canModify.join(" · ")}</span>
                      </div>
                    </div>

                    {/* Proposals */}
                    <div className="space-y-2">
                      {sandbox.proposals.map((proposal) => (
                        <div
                          key={proposal.id}
                          className={`rounded-xl border p-3 transition-all ${
                            proposal.status === "pending"
                              ? "border-white/10 bg-white/[0.03]"
                              : proposal.status === "accepted"
                                ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                                : proposal.status === "rejected"
                                  ? "border-rose-500/20 bg-rose-500/[0.04] opacity-50"
                                  : "border-amber-500/20 bg-amber-500/[0.04]"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-[Space_Grotesk] text-[0.75rem] font-medium text-slate-200">
                                  {proposal.label}
                                </span>
                                {proposal.status !== "pending" && (
                                  <span className={`rounded-full px-1.5 py-0.5 font-mono text-[0.45rem] uppercase ${
                                    proposal.status === "accepted" ? "bg-emerald-500/20 text-emerald-400" :
                                    proposal.status === "rejected" ? "bg-rose-500/20 text-rose-400" :
                                    "bg-amber-500/20 text-amber-400"
                                  }`}>
                                    {proposal.status}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-3 font-mono text-[0.6rem]">
                                <span className="text-slate-500">{proposal.currentValue}</span>
                                <span className="text-slate-600">→</span>
                                <span className={config.color}>{proposal.proposedValue}</span>
                              </div>
                              <p className="mt-1.5 font-[Space_Grotesk] text-[0.65rem] leading-relaxed text-slate-400">
                                {proposal.rationale}
                              </p>
                            </div>
                          </div>

                          {proposal.status === "pending" && (
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => handleProposalAction(sandbox.id, proposal.id, "accepted")}
                                className="rounded-lg bg-emerald-500/20 px-3 py-1 font-mono text-[0.55rem] text-emerald-400 hover:bg-emerald-500/30 transition-all"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleProposalAction(sandbox.id, proposal.id, "rejected")}
                                className="rounded-lg bg-rose-500/20 px-3 py-1 font-mono text-[0.55rem] text-rose-400 hover:bg-rose-500/30 transition-all"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleProposalAction(sandbox.id, proposal.id, "countered")}
                                className="rounded-lg bg-amber-500/20 px-3 py-1 font-mono text-[0.55rem] text-amber-400 hover:bg-amber-500/30 transition-all"
                              >
                                Counter
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              {/* Burned Sandboxes */}
              {sandboxes.filter((s) => s.status === "burned").map((sandbox) => (
                <div key={sandbox.id} className="rounded-xl border border-white/5 bg-white/[0.01] p-3 opacity-40">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[0.6rem] text-slate-600 line-through">
                      {ROLE_CONFIG[sandbox.role].firm}
                    </span>
                    <span className="rounded-full bg-slate-700/50 px-1.5 py-0.5 font-mono text-[0.45rem] text-slate-500">
                      TOKEN BURNED
                    </span>
                  </div>
                </div>
              ))}

              {activeSandboxes.length === 0 && sandboxes.length === 0 && (
                <div className="py-4 text-center font-mono text-[0.65rem] text-slate-600">
                  Invite counterparties to begin the negotiation process
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
