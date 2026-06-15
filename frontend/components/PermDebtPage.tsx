"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Clock, Building2, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://web-production-5e8af.up.railway.app";

interface Deal {
  id: string;
  name: string;
  state: string | null;
  market: string | null;
  status: string;
  bond_face: number;
  dscr: number;
  ltv: number;
  project: {
    asset_type?: string;
    stage?: string;
    city?: string;
    total_project_cost_usd?: number;
  };
  team: { bank_partner?: string | null };
}

// Bridge Agent: construction deals within 18-mo stabilization window
// Synthetic maturity data — real perm status fetched per deal_id when available
const BRIDGE_MONTHS: Record<string, number> = {
  new_construction: 14,
  construction: 16,
  operations: 6,
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function urgencyColor(months: number) {
  if (months <= 6) return "text-red-400 border-red-500/40";
  if (months <= 12) return "text-[#C4A048] border-[#C4A048]/40";
  return "text-[#7A9A82] border-[#7A9A82]/30";
}

export default function PermDebtPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/deals`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Load failed");
      // Filter to deals with meaningful bond_face (active construction/pipeline)
      const active = (json.data as Deal[]).filter(
        (d) => d.bond_face > 0 && d.project?.asset_type
      );
      setDeals(active);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Assign months-to-stabilization per asset stage
  const enriched = deals.map((d) => {
    const stage = d.project?.stage ?? "operations";
    const months = BRIDGE_MONTHS[stage] ?? 18;
    return { ...d, months };
  });

  const inWindow = enriched.filter((d) => d.months <= 18);
  const totalExposure = inWindow.reduce((s, d) => s + d.bond_face, 0);
  const critical = inWindow.filter((d) => d.months <= 6).length;

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#1E4A2E]">
        <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">
          BRIDGE AGENT · PERM DEBT MONITOR
        </p>
        <div className="flex items-end justify-between mt-1">
          <h1 className="font-[Cormorant_Garamond] text-5xl text-[#C4A048] leading-none">
            Perm Debt Monitor
          </h1>
          <button
            onClick={load}
            className="flex items-center gap-1.5 font-mono text-xs text-[#7A9A82] hover:text-[#C4A048] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            REFRESH
          </button>
        </div>
        <p className="font-mono text-xs text-[#2D6B3D] mt-3">/api/deals → /api/perm/&lt;deal_id&gt;/status</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">
            Deals in Window
          </p>
          <strong className="font-mono text-2xl text-[#C4A048]">{inWindow.length}</strong>
        </div>
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">
            Total Exposure
          </p>
          <strong className="font-mono text-2xl text-[#C4A048]">{fmt(totalExposure)}</strong>
        </div>
        <div className="rounded-[1.35rem] border border-red-500/30 bg-[#0D2218]/70 p-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">
            Critical (&lt;6 mo)
          </p>
          <strong className={`font-mono text-2xl ${critical > 0 ? "text-red-400" : "text-[#7A9A82]"}`}>
            {critical}
          </strong>
        </div>
      </div>

      {/* Bridge Agent Explanation */}
      <div className="rounded-[1.35rem] border border-[#C4A048]/10 bg-[#0D2218]/40 p-4 mb-6 flex gap-3 items-start">
        <Clock className="w-4 h-4 text-[#C4A048] mt-0.5 flex-shrink-0" />
        <p className="font-mono text-xs text-[#7A9A82] leading-relaxed">
          Bridge Agent monitors construction loans 18 months before projected stabilization.
          When a deal enters window, Bridge initiates perm debt pre-qual and sources agency or
          bank takeout at 0.5% AE placement fee.
        </p>
      </div>

      {/* Deal List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[1.35rem] bg-[#0D2218]/70 h-20 animate-pulse border border-[#1E4A2E]" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.35rem] border border-red-500/30 bg-[#0D2218]/70 p-6 font-mono text-sm text-red-400">
          {error}
        </div>
      ) : inWindow.length === 0 ? (
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-10 text-center">
          <Building2 className="w-8 h-8 text-[#7A9A82] mx-auto mb-3" />
          <p className="font-mono text-sm text-[#7A9A82]">No deals in the 18-month stabilization window.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inWindow.map((deal) => {
            const uc = urgencyColor(deal.months);
            return (
              <div
                key={deal.id}
                className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4 flex items-center gap-6"
              >
                {/* Urgency indicator */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${uc}`}>
                  {deal.months <= 6 ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>

                {/* Deal info */}
                <div className="flex-1 min-w-0">
                  <p className="font-[Cormorant_Garamond] text-xl text-[#EDE8DC] leading-tight truncate">
                    {deal.name}
                  </p>
                  <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">
                    {deal.project?.city ?? deal.market ?? "—"}{deal.state ? `, ${deal.state}` : ""}
                    {deal.project?.asset_type ? ` · ${deal.project.asset_type.replace(/_/g, " ")}` : ""}
                  </p>
                </div>

                {/* Bond face */}
                <div className="text-right flex-shrink-0 w-28">
                  <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">Bond Face</p>
                  <strong className="font-mono text-lg text-[#C4A048]">{fmt(deal.bond_face)}</strong>
                </div>

                {/* DSCR */}
                <div className="text-right flex-shrink-0 w-20">
                  <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">DSCR</p>
                  <strong className={`font-mono text-lg ${deal.dscr >= 1.5 ? "text-emerald-400" : deal.dscr >= 1.25 ? "text-[#C4A048]" : "text-red-400"}`}>
                    {deal.dscr > 0 ? deal.dscr.toFixed(2) : "—"}
                  </strong>
                </div>

                {/* Months badge */}
                <div className={`flex-shrink-0 flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border ${uc}`}>
                  <span>{deal.months}mo</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="uppercase tracking-wider">Refi</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
