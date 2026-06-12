"use client";
import { useState, useEffect, useCallback } from "react";

const API = "";

const PLUGIN_META: Record<string, { label: string; color: string; logo: string; category: string }> = {
  claude:           { label: "Claude",           color: "#D4A574", logo: "C",  category: "AI Intelligence" },
  chatgpt:          { label: "ChatGPT",          color: "#10A37F", logo: "G",  category: "AI Intelligence" },
  grammarly:        { label: "Grammarly",        color: "#15C39A", logo: "Gr", category: "AI Intelligence" },
  higgsfield:       { label: "Higgsfield",       color: "#8B5CF6", logo: "Hf", category: "AI Intelligence" },
  fred:             { label: "FRED",             color: "#2563EB", logo: "FR", category: "Market Data" },
  treasury_direct:  { label: "Treasury Direct",  color: "#1E40AF", logo: "TD", category: "Market Data" },
  attom:            { label: "ATTOM",            color: "#F59E0B", logo: "AT", category: "Property" },
  costar:           { label: "CoStar",           color: "#0EA5E9", logo: "CS", category: "Property" },
  edgar:            { label: "SEC EDGAR",        color: "#DC2626", logo: "ED", category: "Regulatory" },
  emma:             { label: "EMMA/MSRB",        color: "#7C3AED", logo: "EM", category: "Regulatory" },
  finra_brokercheck:{ label: "FINRA BrokerCheck",color: "#0D9488", logo: "FN", category: "Regulatory" },
  dnb:              { label: "Dun & Bradstreet", color: "#EA580C", logo: "DB", category: "Credit" },
  rsmeans:          { label: "RSMeans/Gordian",  color: "#65A30D", logo: "RS", category: "Construction" },
};

const TASK_TYPES = [
  "credit_memo", "business_plan", "risk_assessment", "feasibility_narrative",
  "bd_outreach", "investor_teaser", "bond_structuring", "executive_summary",
  "ma_analysis", "legal_summary", "second_opinion", "general_research",
  "proofread", "compliance_language", "marketing_video", "property_showcase",
];

export default function CentralNervousSystem() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [rates, setRates] = useState<any>(null);
  const [taskType, setTaskType] = useState("credit_memo");
  const [prompt, setPrompt] = useState("");
  const [routeResult, setRouteResult] = useState<any>(null);
  const [routing, setRouting] = useState(false);
  const [activePlugin, setActivePlugin] = useState<string | null>(null);

  const loadDashboard = useCallback(() => {
    fetch(`${API}/api/nervous-system/dashboard`)
      .then((r) => r.json()).then((d) => setDashboard(d.data)).catch(() => {});
    fetch(`${API}/api/data/market-rates`)
      .then((r) => r.json()).then((d) => setRates(d.data)).catch(() => {});
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function routeTask() {
    if (!prompt.trim()) return;
    setRouting(true);
    const expectedPlugin = dashboard?.task_routing?.[taskType] || "claude";
    setActivePlugin(expectedPlugin);

    try {
      const res = await fetch(`${API}/api/nervous-system/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_type: taskType, prompt }),
      });
      const d = await res.json();
      setRouteResult(d.data);
    } catch {
      /* swallow */
    }
    setRouting(false);
    setTimeout(() => setActivePlugin(null), 3000);
    loadDashboard();
  }

  const plugins = dashboard?.plugins || {};
  const categories = ["AI Intelligence", "Market Data", "Property", "Regulatory", "Credit", "Construction"];

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-200">Platform Orchestration</p>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Central Nervous System</h1>
          <p className="mt-1 text-xs italic text-slate-500">
            NEST Advisors is the power strip. {dashboard?.plugins_total || 0} plugins. {dashboard?.plugins_connected || 0} connected.
          </p>
        </div>

        {/* System KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Plugins", value: dashboard?.plugins_total || 0 },
            { label: "Connected", value: dashboard?.plugins_connected || 0, accent: true },
            { label: "Total Calls", value: dashboard?.total_calls || 0 },
            { label: "Error Rate", value: `${dashboard?.error_rate_pct || 0}%`, alert: (dashboard?.error_rate_pct || 0) > 5 },
          ].map((k) => (
            <article key={k.label} className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/[0.09] p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{k.label}</span>
              <strong className={`mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] ${k.alert ? "text-red-400" : k.accent ? "text-emerald-400" : "text-white"}`}>
                {k.value}
              </strong>
            </article>
          ))}
        </div>

        {/* Plugin Grid */}
        {categories.map((cat) => {
          const catPlugins = Object.entries(plugins).filter(([name]) => PLUGIN_META[name]?.category === cat);
          if (catPlugins.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="mb-3 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-600">{cat}</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {catPlugins.map(([name, info]: [string, any]) => {
                  const meta = PLUGIN_META[name] || { label: name, color: "#666", logo: "?", category: "" };
                  const connected = info.status === "connected";
                  const isActive = activePlugin === name;

                  return (
                    <div
                      key={name}
                      className="flex items-center gap-3 rounded-[1rem] border p-3.5 transition-all duration-300"
                      style={{
                        background: connected ? "#07101a" : "rgba(3,6,11,0.5)",
                        borderColor: connected ? `${meta.color}55` : "rgba(255,255,255,0.04)",
                        boxShadow: isActive ? `0 0 24px ${meta.color}44` : connected ? `0 0 8px ${meta.color}22` : "none",
                        opacity: connected ? 1 : 0.45,
                      }}
                    >
                      {/* Logo circle */}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-300"
                        style={{
                          background: connected ? `linear-gradient(135deg, ${meta.color}22, ${meta.color}44)` : "rgba(255,255,255,0.03)",
                          border: `1.5px solid ${connected ? meta.color : "rgba(255,255,255,0.06)"}`,
                          color: connected ? meta.color : "#444",
                          boxShadow: isActive ? `0 0 16px ${meta.color}66` : "none",
                        }}
                      >
                        {meta.logo}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-mono text-xs font-semibold" style={{ color: connected ? "#e2e8f0" : "#555" }}>
                          {meta.label}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: connected ? meta.color : "#333" }}
                          />
                          <span className="font-mono text-[0.5rem] uppercase tracking-[0.06em]" style={{ color: connected ? meta.color : "#444" }}>
                            {isActive ? "ACTIVE" : connected ? "ONLINE" : "OFFLINE"}
                          </span>
                        </div>
                        {info.calls > 0 && (
                          <div className="mt-0.5 font-mono text-[0.5rem] text-slate-600">{info.calls} calls | {info.avg_latency_ms}ms avg</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Market Rates + Task Router */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Live Rates */}
          <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
            <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-slate-400">Live Market Rates</h3>
            {rates && (
              <>
                <span className={`mb-3 inline-block rounded px-2 py-0.5 font-mono text-[0.6rem] font-semibold ${
                  rates.source === "grok" ? "bg-amber-300/15 text-amber-300" : rates.source === "FRED" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800/60 text-slate-500"
                }`}>
                  Source: {rates.source}
                </span>
                {rates.rates ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(rates.rates).map(([k, v]: [string, any]) => (
                      <div key={k} className="rounded-lg border border-white/5 bg-[#03060b]/60 p-2.5">
                        <div className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">{k.replace(/_/g, " ")}</div>
                        <div className="mt-1 font-mono text-base font-semibold text-amber-300">{typeof v === "number" ? v.toFixed(2) : v}%</div>
                      </div>
                    ))}
                  </div>
                ) : rates.treasury_10yr_pct ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "10yr Treasury", value: `${rates.treasury_10yr_pct}%` },
                      { label: "SOFR", value: `${rates.sofr_pct}%` },
                      { label: "IG Spread", value: `${rates.ig_spread_bps}bp` },
                    ].map((r) => (
                      <div key={r.label} className="rounded-lg border border-white/5 bg-[#03060b]/60 p-2.5">
                        <div className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">{r.label}</div>
                        <div className="mt-1 font-mono text-base font-semibold text-amber-300">{r.value}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Task Router */}
          <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5 space-y-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-slate-400">Route Task to Nervous System</h3>
            <select
              className="w-full rounded-lg border border-white/10 bg-[#03060b] px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-300/40"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              {TASK_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
            <div className="font-mono text-[0.55rem] text-slate-600">
              Routes to:{" "}
              <span style={{ color: PLUGIN_META[dashboard?.task_routing?.[taskType]]?.color || "#C4A048" }}>
                {PLUGIN_META[dashboard?.task_routing?.[taskType]]?.label || dashboard?.task_routing?.[taskType] || "claude"}
              </span>
            </div>
            <textarea
              className="w-full rounded-lg border border-white/10 bg-[#03060b] px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-300/40"
              rows={3}
              placeholder="Enter prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={routeTask}
              disabled={routing || !prompt.trim()}
              className="rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 hover:bg-amber-300/20 disabled:opacity-50"
            >
              {routing ? "Processing..." : "Send to Nervous System"}
            </button>
          </div>
        </div>

        {/* Route Result */}
        {routeResult && (
          <div className="rounded-[1.25rem] border border-amber-300/20 bg-[#07101a]/80 p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[0.62rem] font-semibold"
                style={{
                  background: `${PLUGIN_META[routeResult.plugin]?.color || "#C4A048"}22`,
                  border: `1px solid ${PLUGIN_META[routeResult.plugin]?.color || "#C4A048"}44`,
                  color: PLUGIN_META[routeResult.plugin]?.color || "#C4A048",
                }}
              >
                {PLUGIN_META[routeResult.plugin]?.logo || "?"} {PLUGIN_META[routeResult.plugin]?.label || routeResult.plugin}
              </span>
              {routeResult.model && <span className="rounded bg-slate-800/60 px-2 py-0.5 font-mono text-[0.55rem] text-slate-500">{routeResult.model}</span>}
              <span className={`rounded px-2 py-0.5 font-mono text-[0.55rem] font-semibold ${routeResult.success ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                {routeResult.success ? "Success" : "Failed"}
              </span>
              {routeResult.latency_ms && <span className="font-mono text-[0.55rem] text-slate-600">{routeResult.latency_ms}ms</span>}
              {routeResult.tokens > 0 && <span className="font-mono text-[0.55rem] text-slate-600">{routeResult.tokens} tokens</span>}
              {routeResult.fallback_used && <span className="rounded bg-amber-300/15 px-2 py-0.5 font-mono text-[0.55rem] text-amber-300">fallback: {routeResult.fallback_used}</span>}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {routeResult.content || routeResult.error || JSON.stringify(routeResult.data, null, 2)}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {dashboard?.recent_calls?.length > 0 && (
          <div className="overflow-x-auto rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
            <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-slate-400">Recent Nervous System Activity</h3>
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[0.6rem] uppercase tracking-wider text-slate-600">
                  <th className="px-3 py-2">Time</th><th className="px-3 py-2">Task</th><th className="px-3 py-2">Plugin</th>
                  <th className="px-3 py-2">Fallback</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Latency</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_calls.slice(-10).reverse().map((call: any, i: number) => (
                  <tr key={i} className="border-b border-white/5 text-slate-400">
                    <td className="px-3 py-2 text-slate-600">{call.timestamp?.split("T")[1]?.split(".")[0]}</td>
                    <td className="px-3 py-2 capitalize text-slate-300">{call.task_type?.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2" style={{ color: PLUGIN_META[call.plugin]?.color || "#7A9A82" }}>
                      {PLUGIN_META[call.plugin]?.label || call.plugin}
                    </td>
                    <td className="px-3 py-2">{call.fallback || "\u2014"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[0.55rem] font-semibold ${call.success ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {call.success ? "OK" : "FAIL"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{call.latency_ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
