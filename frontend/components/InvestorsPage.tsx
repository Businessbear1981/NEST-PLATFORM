"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, Users, Building2, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

interface Investor {
  id: string;
  name: string;
  entity_type: string;
  accredited_verified: boolean;
  qib_qualified: boolean;
  kyc_aml_cleared: boolean;
  total_committed_usd: number;
  positions: unknown[];
  fund_positions: unknown[];
  created_at: string;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const TYPE_LABEL: Record<string, string> = {
  family_office: "Family Office",
  institutional: "Institutional",
  hnwi: "HNWI",
  fund: "Fund",
};

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/investors`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Load failed");
      setInvestors(json.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalCommitted = investors.reduce((s, i) => s + i.total_committed_usd, 0);
  const qibCount = investors.filter((i) => i.qib_qualified).length;
  const clearedCount = investors.filter((i) => i.kyc_aml_cleared).length;

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#1E4A2E]">
        <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">
          HAWKEYE PLACEMENT · STERLING AGENT
        </p>
        <div className="flex items-end justify-between mt-1">
          <h1 className="font-[Cormorant_Garamond] text-5xl text-[#C4A048] leading-none">
            Investor Management
          </h1>
          <button
            onClick={load}
            className="flex items-center gap-1.5 font-mono text-xs text-[#7A9A82] hover:text-[#C4A048] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            REFRESH
          </button>
        </div>
        <p className="font-mono text-xs text-[#2D6B3D] mt-3">/api/investors</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">
            Total Committed
          </p>
          <strong className="font-mono text-2xl text-[#C4A048]">{fmt(totalCommitted)}</strong>
        </div>
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">
            QIB Qualified
          </p>
          <strong className="font-mono text-2xl text-[#C4A048]">{qibCount} / {investors.length}</strong>
        </div>
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82] mb-1">
            KYC / AML Clear
          </p>
          <strong className="font-mono text-2xl text-[#C4A048]">{clearedCount} / {investors.length}</strong>
        </div>
      </div>

      {/* Investor Table */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[1.35rem] bg-[#0D2218]/70 h-16 animate-pulse border border-[#1E4A2E]" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.35rem] border border-red-500/30 bg-[#0D2218]/70 p-6 font-mono text-sm text-red-400">
          {error}
        </div>
      ) : investors.length === 0 ? (
        <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-10 text-center">
          <Users className="w-8 h-8 text-[#7A9A82] mx-auto mb-3" />
          <p className="font-mono text-sm text-[#7A9A82]">No investors on record.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investors.map((inv) => (
            <div
              key={inv.id}
              className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4 flex items-center gap-6"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1E4A2E] flex items-center justify-center">
                {inv.entity_type === "family_office" ? (
                  <Users className="w-4 h-4 text-[#C4A048]" />
                ) : (
                  <Building2 className="w-4 h-4 text-[#C4A048]" />
                )}
              </div>

              {/* Name + type */}
              <div className="flex-1 min-w-0">
                <p className="font-[Cormorant_Garamond] text-xl text-[#EDE8DC] leading-tight">
                  {inv.name}
                </p>
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">
                  {TYPE_LABEL[inv.entity_type] ?? inv.entity_type}
                </p>
              </div>

              {/* Committed */}
              <div className="text-right flex-shrink-0 w-28">
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">Committed</p>
                <strong className="font-mono text-lg text-[#C4A048]">
                  {fmt(inv.total_committed_usd)}
                </strong>
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-shrink-0">
                <span
                  className={`font-mono text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-full border ${
                    inv.accredited_verified
                      ? "border-[#7A9A82]/50 text-[#7A9A82]"
                      : "border-red-500/30 text-red-400"
                  }`}
                >
                  ACCRED
                </span>
                <span
                  className={`font-mono text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-full border ${
                    inv.qib_qualified
                      ? "border-[#C4A048]/50 text-[#C4A048]"
                      : "border-[#1E4A2E] text-[#2D6B3D]"
                  }`}
                >
                  QIB
                </span>
                <span
                  className={`font-mono text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-full border flex items-center gap-1 ${
                    inv.kyc_aml_cleared
                      ? "border-emerald-500/40 text-emerald-400"
                      : "border-red-500/30 text-red-400"
                  }`}
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                  KYC
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
