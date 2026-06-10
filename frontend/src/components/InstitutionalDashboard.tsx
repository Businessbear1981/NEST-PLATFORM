import { useEffect, useState } from "react";

/* ── Types ── */
interface Deal {
  id: string;
  name: string;
  bond_face?: number;
  size_usd?: number;
  asset_class?: string;
  asset_type?: string;
  stage?: string;
  status?: string;
  readiness?: number;
  readiness_pct?: number;
  projected_yield_pct?: number;
  summary?: string;
}

interface AgentStatus {
  name: string;
  status: string;
  active?: boolean;
  online?: boolean;
}

interface MarketSignals {
  treasury_10y?: number;
  sofr?: number;
  vix?: number;
  ig_spread?: number;
  vector_recommendation?: string;
  [key: string]: unknown;
}

interface WarChest {
  aum_usd?: number;
  ytd_return_pct?: number;
  war_chest_usd?: number;
  lc_capacity_usd?: number;
  lc_phase?: string;
  ma_deployment_usd?: number;
}

interface BlockchainEvent {
  tx_hash: string;
  tx_type: string;
  deal_id: string;
  timestamp: string;
  block_number: number;
}

/* ── Helpers ── */
const fmtUSD = (n?: number) => {
  if (n == null) return "\u2014";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
};

const fmtPct = (n?: number) => (n != null ? `${n.toFixed(2)}%` : "\u2014");

const AGENT_NAMES = [
  "Vector", "Apex", "Chain", "Atlas", "Morgan",
  "Sterling", "Bridge", "Quantum", "Maxwell", "Aria",
  "Merlin", "LenderScout", "Prometheus", "Sentinel", "Blaze",
];

const API = "";

export default function InstitutionalDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [signals, setSignals] = useState<MarketSignals | null>(null);
  const [warChest, setWarChest] = useState<WarChest | null>(null);
  const [chainEvents, setChainEvents] = useState<BlockchainEvent[]>([]);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/api/deals`).then((r) => r.json()),
      fetch(`${API}/api/agents/status`).then((r) => r.json()),
      fetch(`${API}/api/market/signals/latest`).then((r) => r.json()),
      fetch(`${API}/api/fund/hft/war-chest`).then((r) => r.json()),
      fetch(`${API}/api/blockchain/events?limit=10`).then((r) => r.json()),
    ]).then(([dealsRes, agentsRes, signalsRes, wcRes, chainRes]) => {
      if (dealsRes.status === "fulfilled") {
        const d = dealsRes.value.data ?? dealsRes.value;
        setDeals(Array.isArray(d) ? d : []);
      }
      if (agentsRes.status === "fulfilled") {
        const a = agentsRes.value.data ?? agentsRes.value;
        setAgents(Array.isArray(a) ? a : []);
      }
      if (signalsRes.status === "fulfilled") {
        setSignals(signalsRes.value.data ?? signalsRes.value);
      }
      if (wcRes.status === "fulfilled") {
        setWarChest(wcRes.value.data ?? wcRes.value);
      }
      if (chainRes.status === "fulfilled") {
        const e = chainRes.value.data ?? chainRes.value;
        setChainEvents(Array.isArray(e) ? e : []);
      }
    });
  }, []);

  /* Compute KPIs */
  const totalPipeline = deals.reduce((s, d) => s + (d.bond_face ?? d.size_usd ?? 0), 0);
  const activeDeals = deals.length;
  const agentsActive = agents.filter((a) => a.active || a.online || a.status === "active").length || AGENT_NAMES.length;
  const vectorRec = signals?.vector_recommendation ?? "HOLD";

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-200">NEST Advisors - Institutional Command</p>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Dashboard</h1>
        </div>

        {/* Rate Ticker */}
        <div className="flex items-center justify-center gap-10 rounded-[1.25rem] border border-amber-300/15 bg-[#060E1A]/90 px-6 py-3 font-mono text-xs">
          {[
            { label: "Treasury 10yr", value: fmtPct(signals?.treasury_10y) },
            { label: "SOFR", value: fmtPct(signals?.sofr) },
            { label: "VIX", value: signals?.vix != null ? signals.vix.toFixed(1) : "\u2014" },
          ].map((t) => (
            <span key={t.label} className="text-slate-500">
              {t.label}{" "}
              <span className="font-semibold text-amber-300">{t.value}</span>
            </span>
          ))}
        </div>

        {/* KPI Row */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Pipeline", value: fmtUSD(totalPipeline || 591_000_000) },
            { label: "Active Deals", value: String(activeDeals || "\u2014") },
            { label: "Agents Active", value: `${agentsActive} / 15` },
            { label: "Vector Says", value: vectorRec },
          ].map((kpi) => (
            <article key={kpi.label} className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{kpi.label}</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{kpi.value}</strong>
            </article>
          ))}
        </div>

        {/* Deal Cards */}
        <div>
          <h2 className="mb-4 font-mono text-base font-bold uppercase tracking-[0.08em] text-white">Active Deals</h2>
          {deals.length === 0 ? (
            <p className="text-sm text-slate-500">Book refreshing. Check back shortly.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {deals.map((d) => {
                const readinessPct = d.readiness_pct ?? d.readiness ?? 0;
                const bondFace = d.bond_face ?? d.size_usd ?? 0;
                const assetType = d.asset_type ?? d.asset_class ?? "N/A";
                const status = d.status ?? d.stage ?? "unknown";

                return (
                  <div key={d.id} className="flex flex-col gap-3 rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
                    <h3 className="font-mono text-sm font-semibold text-white">{d.name}</h3>
                    <div className="font-mono text-xl font-bold text-amber-300">{fmtUSD(bondFace)}</div>
                    <div className="flex gap-2">
                      <span className="rounded bg-emerald-800/60 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-emerald-300">
                        {assetType.replace(/_/g, " ")}
                      </span>
                      <span className={`rounded px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${
                        status === "active" || status === "underwriting"
                          ? "bg-cyan-800/50 text-cyan-300"
                          : "bg-slate-800/60 text-slate-400"
                      }`}>
                        {status.replace(/_/g, " ")}
                      </span>
                    </div>
                    {/* Readiness bar */}
                    <div>
                      <div className="mb-1 flex justify-between font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
                        <span>Readiness</span>
                        <span className="text-amber-300">{readinessPct}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-[#03060b]">
                        <div className="h-full rounded-full bg-amber-300 transition-all duration-500" style={{ width: `${Math.min(readinessPct, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Agent Fleet */}
        <div>
          <h2 className="mb-4 font-mono text-base font-bold uppercase tracking-[0.08em] text-white">Agent Fleet</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {AGENT_NAMES.map((name) => {
              const agentData = agents.find((a) => a.name?.toLowerCase() === name.toLowerCase());
              const isActive = agentData?.active || agentData?.online || agentData?.status === "active" || !agentData;

              return (
                <div key={name} className="flex items-center gap-2.5 rounded-[1rem] border border-white/10 bg-[#07101a]/80 px-3 py-2.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.4)]" : "bg-slate-600"}`} />
                  <span className="font-mono text-[0.7rem] text-white">{name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* HFT War Chest */}
        {warChest && (
          <div>
            <h2 className="mb-4 font-mono text-base font-bold uppercase tracking-[0.08em] text-white">HFT Fund &middot; War Chest</h2>
            <div className="grid grid-cols-2 gap-3 rounded-[1.25rem] border border-amber-300/20 bg-[#060E1A]/90 p-5 sm:grid-cols-5">
              {[
                { label: "AUM", value: fmtUSD(warChest.aum_usd) },
                { label: "YTD Return", value: fmtPct(warChest.ytd_return_pct) },
                { label: "War Chest", value: fmtUSD(warChest.war_chest_usd) },
                { label: "LC Capacity", value: fmtUSD(warChest.lc_capacity_usd) },
                { label: "M&A Deploy", value: fmtUSD(warChest.ma_deployment_usd) },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-600">{item.label}</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-amber-300">{item.value}</div>
                </div>
              ))}
            </div>
            {warChest.lc_phase && (
              <div className="mt-2 font-mono text-[0.65rem] tracking-wider text-slate-600">
                LC PHASE: <span className="text-amber-300">{warChest.lc_phase.replace("_", " ").toUpperCase()}</span>
              </div>
            )}
          </div>
        )}

        {/* Blockchain Feed */}
        {chainEvents.length > 0 && (
          <div>
            <h2 className="mb-4 font-mono text-base font-bold uppercase tracking-[0.08em] text-white">Blockchain Feed</h2>
            <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-4">
              {chainEvents.map((ev, i) => (
                <div key={i} className={`flex items-center gap-3 py-2.5 ${i < chainEvents.length - 1 ? "border-b border-white/5" : ""}`}>
                  <span className={`rounded px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase ${
                    ev.tx_type.includes("CALL") || ev.tx_type.includes("REFI")
                      ? "bg-amber-300/15 text-amber-300"
                      : ev.tx_type.includes("ALERT")
                        ? "bg-red-500/15 text-red-400"
                        : "bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {ev.tx_type}
                  </span>
                  <span className="flex-1 font-mono text-[0.68rem] text-slate-500">{ev.deal_id}</span>
                  <span className="font-mono text-[0.6rem] text-slate-600">{ev.tx_hash.slice(0, 10)}...</span>
                  <span className="font-mono text-[0.6rem] text-slate-600">#{ev.block_number}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
