"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "";
/**
 * Surveillance Desk — Portfolio monitoring, refunding identification,
 * risk re-rating, restructuring, workouts.
 * Backed by /api/surveillance/* endpoints.
 */
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SurveillancePage() {
  const [activeTab, setActiveTab] = useState("refunding");
  const [refunding, setRefunding] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${_API}/api/surveillance/refunding`).then(r => r.json()),
      fetch(`${_API}/api/surveillance/alerts`).then(r => r.json()),
    ])
      .then(([ref, alrt]) => {
        if (ref.success) setRefunding(ref.data.candidates || []);
        if (alrt.success) setAlerts(alrt.data.alerts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resolveAlert = (id: string) => {
    fetch(`/api/surveillance/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: true, resolved_at: new Date().toISOString() }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setAlerts(prev => prev.filter(a => a.id !== id));
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-violet-300/25 bg-[#060E1A] p-5 text-[#EDE8DC] shadow-[0_0_85px_rgba(139,92,246,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(139,92,246,0.15),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-violet-200">Surveillance Desk · 4 Agents</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>Surveillance Command</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#EDE8DC]">Portfolio monitoring, refunding identification (NPV savings calculator), risk re-rating via Mirror Agents, restructuring opportunities, workout support.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-2xl text-yellow-400">{alerts.length}</p>
            <p className="font-mono text-[0.6rem] uppercase text-[#7A9A82]">Active Alerts</p>
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
          <TabsTrigger value="refunding">Refunding Pipeline</TabsTrigger>
          <TabsTrigger value="alerts">Surveillance Alerts</TabsTrigger>
          <TabsTrigger value="rerating">Risk Re-Rating</TabsTrigger>
        </TabsList>

        <TabsContent value="refunding" className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-[#7A9A82] animate-pulse">Scanning portfolio for refunding candidates...</p>
          ) : refunding.length === 0 ? (
            <Card className="border-[#1E4A2E] bg-[#0D2218]"><CardContent className="p-6 text-center text-[#7A9A82] text-sm">No refunding candidates identified. EMMA bonds are scanned for NPV savings opportunities when portfolio bonds are loaded.</CardContent></Card>
          ) : refunding.map((r: any, i: number) => (
            <Card key={r.cusip || i} className="border-[#1E4A2E] bg-[#0D2218] hover:border-violet-500/30 transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-white">{r.issuer}</span>
                    {r.cusip && <span className="ml-2 font-mono text-xs text-[#7A9A82]">{r.cusip}</span>}
                  </div>
                  <Badge variant={r.urgency === "high" ? "destructive" : r.urgency === "medium" ? "secondary" : "outline"}>{r.urgency}</Badge>
                </div>
                <div className="grid grid-cols-5 gap-4 text-xs">
                  <div><span className="text-[#7A9A82] block">Coupon</span><span className="font-mono text-red-400">{r.coupon}%</span></div>
                  <div><span className="text-[#7A9A82] block">Market Rate</span><span className="font-mono text-emerald-400">{r.market_rate || r.marketRate}%</span></div>
                  <div><span className="text-[#7A9A82] block">Par</span><span className="font-mono text-white">${((r.par || 0) / 1e6).toFixed(0)}M</span></div>
                  <div><span className="text-[#7A9A82] block">PV Savings</span><span className="font-mono text-[#C4A048] text-base font-bold">{r.pv_savings || r.pvSavings}%</span></div>
                  <div><span className="text-[#7A9A82] block">Call Date</span><span className="font-mono text-[#EDE8DC]">{r.call_date || r.callDate}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="alerts" className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-[#7A9A82] animate-pulse">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <Card className="border-[#1E4A2E] bg-[#0D2218]"><CardContent className="p-6 text-center text-[#7A9A82] text-sm">No active surveillance alerts. Portfolio is clean.</CardContent></Card>
          ) : alerts.map((a: any, i: number) => (
            <Card key={a.id || i} className={`bg-[#0D2218] ${a.severity === "warning" ? "border-yellow-500/30" : "border-[#1E4A2E]"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{a.bond}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.severity === "warning" ? "destructive" : "secondary"}>{a.type}</Badge>
                    {a.id && !a.id.startsWith("risk_") && (
                      <Button size="sm" variant="outline"
                        className="border-[#1E4A2E] text-[#7A9A82] h-6 text-[0.65rem] px-2"
                        onClick={() => resolveAlert(a.id)}>Resolve</Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#EDE8DC]">{a.detail}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rerating" className="mt-6">
          <Card className="border-[#1E4A2E] bg-[#0D2218]"><CardContent className="p-6">
            <p className="text-sm text-[#EDE8DC]">Risk re-rating leverages the Moody's and S&P Mirror Agents to re-score administered bonds against current financials. Select a bond from the portfolio to run re-rating analysis via <code className="text-violet-300 text-xs">POST /api/surveillance/rerating/&lt;deal_id&gt;</code>.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
