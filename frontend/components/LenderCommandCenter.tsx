"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://web-production-5e8af.up.railway.app";

export default function LenderCommandCenter() {
  const [lenders, setLenders] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [pipeline, setPipeline] = useState<Record<string, any[]>>({});
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    // Surety/insurance providers (no auth required)
    fetch(`${API}/api/surety/providers`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setLenders(d.data); })
      .catch(() => {});

    // Lender pipeline stages
    fetch(`${API}/api/lenders-direct/pipeline`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setPipeline(d.data); })
      .catch(() => {});

    // Active deals count for KPI
    fetch(`${API}/api/deals`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.data)) setDeals(d.data); })
      .catch(() => {});
  }, []);

  async function runSearch() {
    setSearching(true);
    try {
      const r = await fetch(`${API}/api/lenders-direct/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal: { bond_face_usd: 75000000, ltv_pct: 65, dscr_stabilized: 1.7, state: "FL", asset_type: "senior_living" },
        }),
      });
      const d = await r.json();
      if (d.data) setSearchResult(d.data);
    } catch {
      /* swallow */
    } finally {
      setSearching(false);
    }
  }

  const activePipelines = deals.filter((d) => d.status === "active").length;
  const stages = ["TARGETED", "OUTREACH_SENT", "RESPONDED", "TERM_SHEET_RECEIVED", "COMMITTED", "CLOSED"];

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-[#EDE8DC]">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-200">Direct Lender Sourcing - LenderScout Agent</p>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Lender Command Center</h1>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Providers in Database", value: lenders.length > 0 ? `${lenders.length}` : "—" },
            { label: "Active Deals", value: activePipelines > 0 ? `${activePipelines}` : deals.length > 0 ? `${deals.length}` : "—" },
            { label: "Pipeline Stages", value: Object.keys(pipeline).length > 0 ? `${Object.keys(pipeline).length}` : "7" },
            { label: "Partners", value: lenders.filter((l) => l.relationship_status === "partner").length > 0 ? `${lenders.filter((l) => l.relationship_status === "partner").length}` : "—" },
          ].map((k) => (
            <article key={k.label} className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">{k.label}</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{k.value}</strong>
            </article>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={runSearch}
            disabled={searching}
            className="rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 transition hover:bg-amber-300/20 disabled:opacity-50"
          >
            {searching ? "Searching..." : "Run Lender Search"}
          </button>
          <button className="rounded-[1rem] border border-white/15 bg-white/5 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#7A9A82] transition hover:bg-white/10">
            Add Lender Manually
          </button>
        </div>

        {/* Provider Database */}
        <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
          <h3 className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#7A9A82]">Provider Database - {lenders.length} firms</h3>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {lenders.map((l: any) => (
              <div key={l.id || l.name} className="rounded-[1rem] border border-white/5 bg-[#03060b]/60 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="font-mono text-sm font-semibold text-white">{l.name}</div>
                    <div className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82]">{(l.type || l.lender_type || "").replace(/_/g, " ")}</div>
                  </div>
                  <span className={`rounded px-2 py-0.5 font-mono text-[0.5rem] font-semibold ${
                    l.relationship_status === "partner"
                      ? "bg-amber-300/15 text-amber-300"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {l.relationship_status || "cold"}
                  </span>
                </div>
                <div className="flex gap-3 font-mono text-[0.62rem]">
                  <span className="text-amber-300">{l.typical_premium_bps || l.typical_rate_spread_bps || "\u2014"}bps</span>
                  <span className="text-emerald-400">{l.turnaround_days || l.speed_to_close_days || "\u2014"} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Kanban */}
        <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
          <h3 className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#7A9A82]">Lender Pipeline</h3>
          <div className="flex gap-2 overflow-x-auto">
            {stages.map((stage) => {
              const items: any[] = pipeline[stage] || [];
              return (
                <div key={stage} className="min-w-[140px] flex-1 rounded-lg border border-white/5 bg-[#03060b]/60 p-3">
                  <div className="mb-2 text-center font-mono text-[0.45rem] uppercase tracking-[0.12em] text-[#7A9A82]">{stage.replace(/_/g, " ")}</div>
                  {items.length === 0 ? (
                    <div className="py-3 text-center font-mono text-[0.55rem] text-[#2D6B3D]">{"\u2014"}</div>
                  ) : items.map((item: any, i: number) => (
                    <div key={i} className="mb-1 rounded bg-amber-300/10 px-2 py-1 font-mono text-[0.5rem] text-amber-300">{item.name || item.lender_name || item.id}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="rounded-[1.25rem] border border-amber-300/30 bg-[#07101a]/80 p-5">
            <h3 className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-amber-300">Search Results</h3>
            <pre className="whitespace-pre-wrap font-mono text-[0.62rem] leading-relaxed text-[#7A9A82]">
              {JSON.stringify(searchResult, null, 2).slice(0, 1500)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
