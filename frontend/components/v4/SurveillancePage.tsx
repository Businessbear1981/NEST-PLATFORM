"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";
/**
 * Surveillance Desk — Portfolio monitoring, refunding identification,
 * risk re-rating, restructuring, workouts.
 * Backed by /api/surveillance/pipeline endpoint.
 */
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fmt = (n: number) => `$${(n / 1e6).toFixed(1)}M`;

const statusColor: Record<string, string> = {
  MONITOR: "border-yellow-500/40 bg-yellow-400/10 text-yellow-200",
  WATCH:   "border-blue-500/40 bg-blue-400/10 text-blue-200",
  REFUND:  "border-red-500/40 bg-red-400/10 text-red-200",
  PASS:    "border-emerald-500/40 bg-emerald-400/10 text-emerald-200",
};

function RefundCard({ r }: { r: any }) {
  const spread = (r.current_rate - r.market_rate).toFixed(2);
  const tag = statusColor[r.recommendation] ?? statusColor.WATCH;
  return (
    <Card className="border-[#1E4A2E] bg-[#0D2218] hover:border-violet-500/30 transition">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-white">{r.name}</p>
            <p className="font-mono text-[0.65rem] text-[#7A9A82]">{r.cusip} · {r.sector?.replace("_", " ")} · {r.state}</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 font-mono text-[0.58rem] uppercase border ${tag}`}>
            {r.recommendation}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-[#7A9A82] block mb-0.5">Coupon</span>
            <span className="font-mono text-red-400">{r.current_rate}%</span>
          </div>
          <div>
            <span className="text-[#7A9A82] block mb-0.5">Mkt Rate</span>
            <span className="font-mono text-emerald-400">{r.market_rate}%</span>
          </div>
          <div>
            <span className="text-[#7A9A82] block mb-0.5">Spread</span>
            <span className="font-mono text-[#C4A048] font-bold">+{spread}%</span>
          </div>
          <div>
            <span className="text-[#7A9A82] block mb-0.5">Par</span>
            <span className="font-mono text-white">{fmt(r.par_outstanding)}</span>
          </div>
          <div>
            <span className="text-[#7A9A82] block mb-0.5">NPV Savings</span>
            <span className="font-mono text-[#C4A048] font-bold">{fmt(r.npv_savings)}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[#7A9A82]">Call Date: <span className="font-mono text-[#EDE8DC]">{r.call_date}</span></span>
          <span className="text-[#7A9A82]">DSCR: <span className={`font-mono ${r.dscr < 1.2 ? "text-red-400" : r.dscr < 1.5 ? "text-yellow-400" : "text-emerald-400"}`}>{r.dscr}x</span></span>
          <span className="text-[#7A9A82]">Score: <span className="font-mono text-violet-300">{(r.refunding_score * 100).toFixed(0)}/100</span></span>
        </div>
        {/* Refunding score bar */}
        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500"
            style={{ width: `${r.refunding_score * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function SurveillancePage() {
  const [activeTab, setActiveTab] = useState("refunding");
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${_API}/api/surveillance/pipeline`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setPipeline(d.data || []);
        else setErr(d.error || "Failed to load pipeline");
      })
      .catch(() => setErr("Cannot reach Surveillance API"))
      .finally(() => setLoading(false));
  }, []);

  const totalNPV = pipeline.reduce((s, r) => s + (r.npv_savings || 0), 0);
  const totalPar = pipeline.reduce((s, r) => s + (r.par_outstanding || 0), 0);
  const monitorCount = pipeline.filter(r => r.recommendation === "MONITOR").length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-violet-300/25 bg-[#060E1A] p-5 text-[#EDE8DC] shadow-[0_0_85px_rgba(139,92,246,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(139,92,246,0.15),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-violet-200">Surveillance Desk · 4 Agents</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Surveillance Command
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#EDE8DC]">
              Portfolio monitoring, refunding identification (NPV savings), risk re-rating via Mirror Agents, restructuring opportunities, and workout support.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              ["Candidates", pipeline.length, "in pipeline"],
              ["Total NPV", fmt(totalNPV), "potential savings"],
              ["MONITOR", monitorCount, "priority refundings"],
            ].map(([label, value, sub]) => (
              <div key={label as string} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <p className="font-mono text-[0.58rem] uppercase tracking-wider text-[#7A9A82]">{label}</p>
                <p className="mt-1 text-xl font-black text-[#C4A048]">{value}</p>
                <p className="text-[0.58rem] text-[#7A9A82]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
          <TabsTrigger value="refunding">Refunding Pipeline</TabsTrigger>
          <TabsTrigger value="metrics">Portfolio Metrics</TabsTrigger>
          <TabsTrigger value="rerating">Risk Re-Rating</TabsTrigger>
        </TabsList>

        {/* Refunding Pipeline */}
        <TabsContent value="refunding" className="mt-6 space-y-3">
          {loading && (
            <p className="text-sm text-[#7A9A82] animate-pulse">Scanning portfolio for refunding candidates...</p>
          )}
          {err && (
            <Card className="border-red-500/20 bg-[#0D2218]">
              <CardContent className="p-4 text-sm text-red-400">{err}</CardContent>
            </Card>
          )}
          {!loading && !err && pipeline.length === 0 && (
            <Card className="border-[#1E4A2E] bg-[#0D2218]">
              <CardContent className="p-6 text-center text-[#7A9A82] text-sm">
                No refunding candidates identified. Portfolio is at or below current market rates.
              </CardContent>
            </Card>
          )}
          {pipeline.map((r, i) => <RefundCard key={r.cusip || i} r={r} />)}
        </TabsContent>

        {/* Portfolio Metrics */}
        <TabsContent value="metrics" className="mt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-[#1E4A2E] bg-[#0D2218]">
              <CardContent className="p-4">
                <p className="font-mono text-[0.62rem] uppercase tracking-wider text-[#7A9A82] mb-3">Portfolio Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#7A9A82]">Total Par Outstanding</span>
                    <span className="font-mono text-[#C4A048]">{fmt(totalPar)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A9A82]">Bonds Tracked</span>
                    <span className="font-mono text-white">{pipeline.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A9A82]">Potential NPV Savings</span>
                    <span className="font-mono text-emerald-400">{fmt(totalNPV)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A9A82]">Priority Actions</span>
                    <span className="font-mono text-yellow-400">{monitorCount} MONITOR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#1E4A2E] bg-[#0D2218]">
              <CardContent className="p-4">
                <p className="font-mono text-[0.62rem] uppercase tracking-wider text-[#7A9A82] mb-3">Rate Environment</p>
                {pipeline.map((r, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#EDE8DC]">{r.name}</span>
                      <span className="font-mono text-[#C4A048]">+{(r.current_rate - r.market_rate).toFixed(2)}% above mkt</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${r.refunding_score * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Re-Rating */}
        <TabsContent value="rerating" className="mt-6">
          <Card className="border-[#1E4A2E] bg-[#0D2218]">
            <CardContent className="p-6">
              <p className="font-mono text-[0.65rem] uppercase tracking-wider text-violet-300 mb-3">Mirror Agents — Moody&apos;s / S&P Re-Rating</p>
              <p className="text-sm text-[#EDE8DC] leading-6">
                Risk re-rating leverages the Moody&apos;s and S&P Mirror Agents to re-score administered bonds against current financials.
                Select a bond from the Refunding Pipeline tab then trigger re-rating via{" "}
                <code className="text-violet-300 text-xs">POST /api/surveillance/rerating/&lt;deal_id&gt;</code>.
              </p>
              <div className="mt-4 space-y-2">
                {pipeline.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                    <span className="text-sm text-[#EDE8DC]">{r.name}</span>
                    <span className="font-mono text-xs text-[#7A9A82]">DSCR {r.dscr}x · {r.sector?.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
