"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowRight, Shield, TrendingUp, AlertTriangle, CheckCircle2, Landmark, Percent, Clock } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   NEST Bridge Lending Fund — Frontend Module
   Parallel to bonds. Finances soft costs, packaging, surety premiums.
   NEST takes 10-15% equity in perpetuity. Zero risk — bond takes out.
   ═══════════════════════════════════════════════════════════════════ */

const FUND_PARAMS = {
  target_aum_usd: 25_000_000,
  max_single_loan_pct: 20,
  term_months_range: [6, 9] as const,
  interest_rate_pct: 0,
  equity_kicker_pct_range: [10, 15] as const,
  equity_type: "Perpetual preferred or warrant",
  takeout: "Bond proceeds at closing",
  risk_level: "Near-zero",
  risk_note: "Bond takes out bridge at closing. Secured by same collateral as bond.",
  eligible_uses: ["Packaging fees", "Soft costs", "Surety premiums", "Legal fees", "Pre-development costs", "Architect fees"],
  ineligible_uses: ["Land acquisition", "Construction hard costs"],
};

const DEMO_LOANS = [
  { id: "bridge_a1f3", deal: "Pine Lake Mixed-Use", amount: 1_800_000, use: "Packaging fees", equity_pct: 12.5, term: 7, status: "active" as const, takeout_bond: "$24.6M Senior A" },
  { id: "bridge_c7e2", deal: "Riverside Portfolio", amount: 3_200_000, use: "Surety premiums", equity_pct: 14, term: 9, status: "repaid" as const, takeout_bond: "$68M Infrastructure" },
  { id: "bridge_d9b4", deal: "Metro Office Tower", amount: 950_000, use: "Legal fees", equity_pct: 10, term: 6, status: "underwriting" as const, takeout_bond: "$42M Revenue Bond" },
];

const fmt = (v: number) => `$${(v / 1_000_000).toFixed(1)}M`;

export function BridgeFinancing() {
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [showUnderwrite, setShowUnderwrite] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const totalDeployed = DEMO_LOANS.filter(l => l.status === "active").reduce((s, l) => s + l.amount, 0);
  const totalEquity = DEMO_LOANS.filter(l => l.status !== "underwriting").length;
  const available = FUND_PARAMS.target_aum_usd - totalDeployed;

  const statusColor: Record<string, string> = {
    active: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
    repaid: "text-[#C4A048] border-[#C4A048]/30 bg-[#C4A048]/10",
    underwriting: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  };

  return (
    <div className="space-y-6" data-testid="bridge-financing">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            <Landmark size={17} /> NEST Bridge Lending Fund
          </div>
          <p className="mt-1 text-sm text-[#7A9A82]">
            Zero-interest bridge loans for soft costs, packaging, and surety premiums. NEST takes 10–15% perpetual equity. Bond proceeds repay at closing.
          </p>
        </div>
        <Button
          onClick={() => { setShowUnderwrite(!showUnderwrite); setLog(prev => [...prev, "Opened new bridge underwriting form."]); }}
          className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
        >
          + New Bridge Loan
        </Button>
      </div>

      {/* Fund Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Fund AUM Target", value: fmt(FUND_PARAMS.target_aum_usd), icon: DollarSign, color: "text-emerald-200" },
          { label: "Deployed", value: fmt(totalDeployed), icon: TrendingUp, color: "text-[#E8C87A]" },
          { label: "Available", value: fmt(available), icon: Shield, color: "text-amber-200" },
          { label: "Equity Positions", value: String(totalEquity), icon: Percent, color: "text-fuchsia-200" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-1.5">
              <m.icon size={12} className={m.color} />
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#7A9A82]">{m.label}</p>
            </div>
            <p className={`mt-1 font-mono text-xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Fund Parameters */}
      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
        <h3 className="mb-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#7A9A82]">Fund Structure</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
          <div><span className="text-[#7A9A82]">Interest Rate:</span> <span className="font-semibold text-emerald-200">{FUND_PARAMS.interest_rate_pct}%</span></div>
          <div><span className="text-[#7A9A82]">Equity Kicker:</span> <span className="font-semibold text-fuchsia-200">{FUND_PARAMS.equity_kicker_pct_range[0]}–{FUND_PARAMS.equity_kicker_pct_range[1]}%</span></div>
          <div><span className="text-[#7A9A82]">Term:</span> <span className="font-semibold text-[#E8C87A]">{FUND_PARAMS.term_months_range[0]}–{FUND_PARAMS.term_months_range[1]} months</span></div>
          <div><span className="text-[#7A9A82]">Max Single Loan:</span> <span className="font-semibold text-amber-200">{FUND_PARAMS.max_single_loan_pct}% of AUM</span></div>
          <div><span className="text-[#7A9A82]">Takeout:</span> <span className="font-semibold text-white">{FUND_PARAMS.takeout}</span></div>
          <div><span className="text-[#7A9A82]">Risk:</span> <span className="font-semibold text-emerald-200">{FUND_PARAMS.risk_level}</span></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="font-mono text-[0.56rem] uppercase text-[#7A9A82]">Eligible:</span>
          {FUND_PARAMS.eligible_uses.map(u => (
            <span key={u} className="rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-2 py-0.5 font-mono text-[0.56rem] text-emerald-200">{u}</span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="font-mono text-[0.56rem] uppercase text-[#7A9A82]">Ineligible:</span>
          {FUND_PARAMS.ineligible_uses.map(u => (
            <span key={u} className="rounded-lg border border-red-400/20 bg-red-400/8 px-2 py-0.5 font-mono text-[0.56rem] text-red-300">{u}</span>
          ))}
        </div>
      </div>

      {/* Loan Pipeline */}
      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
        <h3 className="mb-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#7A9A82]">Bridge Loan Pipeline</h3>
        <div className="space-y-2">
          {DEMO_LOANS.map(loan => (
            <button
              key={loan.id}
              onClick={() => setSelectedLoan(selectedLoan === loan.id ? null : loan.id)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${selectedLoan === loan.id ? "border-emerald-400/40 bg-emerald-400/8" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`rounded-lg border px-2 py-0.5 font-mono text-[0.56rem] uppercase ${statusColor[loan.status]}`}>{loan.status}</span>
                  <span className="font-mono text-sm font-semibold text-white">{loan.deal}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-emerald-200">${(loan.amount / 1_000_000).toFixed(1)}M</span>
                  <span className="font-mono text-[0.56rem] text-[#7A9A82]">{loan.equity_pct}% equity</span>
                </div>
              </div>
              {selectedLoan === loan.id && (
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 sm:grid-cols-4">
                  <div><p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Use of Proceeds</p><p className="text-sm text-white">{loan.use}</p></div>
                  <div><p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Term</p><p className="text-sm text-white">{loan.term} months</p></div>
                  <div><p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Takeout Bond</p><p className="text-sm text-[#E8C87A]">{loan.takeout_bond}</p></div>
                  <div><p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Equity Type</p><p className="text-sm text-fuchsia-200">{FUND_PARAMS.equity_type}</p></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Underwrite Form */}
      {showUnderwrite && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
          <h3 className="mb-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-emerald-200">New Bridge Underwriting</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/30 p-2">
              <p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Deal</p>
              <p className="text-sm text-white">New Project TBD</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-2">
              <p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Max Loan</p>
              <p className="text-sm text-amber-200">{fmt(FUND_PARAMS.target_aum_usd * FUND_PARAMS.max_single_loan_pct / 100)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-2">
              <p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">Available Capacity</p>
              <p className="text-sm text-emerald-200">{fmt(available)}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => {
                setLog(prev => [...prev, "Bridge underwriting submitted for human approval gate."]);
                setShowUnderwrite(false);
              }}
              className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
            >
              <CheckCircle2 size={14} className="mr-1" /> Submit for Approval
            </Button>
            <Button
              onClick={() => setShowUnderwrite(false)}
              variant="outline"
              className="rounded-xl border border-white/15 px-4 py-2 font-mono text-[0.68rem] uppercase text-[#7A9A82]"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Risk Note */}
      <div className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
        <Shield size={16} className="mt-0.5 shrink-0 text-emerald-300" />
        <div>
          <p className="font-mono text-[0.62rem] font-semibold uppercase text-emerald-200">Risk Profile</p>
          <p className="text-sm text-[#7A9A82]">{FUND_PARAMS.risk_note}</p>
        </div>
      </div>

      {/* Action Log */}
      {log.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <p className="mb-2 font-mono text-[0.56rem] uppercase text-[#7A9A82]">Action Log</p>
          {log.map((entry, i) => (
            <p key={i} className="font-mono text-[0.62rem] text-[#7A9A82]">→ {entry}</p>
          ))}
        </div>
      )}
    </div>
  );
}
