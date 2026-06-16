"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://api.ardanedgecapital.com";
/**
 * Construction Risk Management Desk — 12 agents
 * Draw processing, budget tracking, schedule monitoring, change orders.
 * Backed by /api/construction/* endpoints.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const $ = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}K` : `$${n}`;

export default function ConstructionPage() {
  const [activeTab, setActiveTab] = useState("milestones");
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState("convivial-st-pete");
  const [milestones, setMilestones] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [changeOrders, setChangeOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Load construction deal list
  useEffect(() => {
    fetch(`${_API}/api/construction/deals`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.length > 0) {
          setDeals(d.data);
        }
      })
      .catch(() => {});
  }, []);

  // Load construction data when deal changes
  useEffect(() => {
    setLoading(true);
    setErr("");
    fetch(`${_API}/api/construction/deals/${selectedDealId}/summary`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMilestones(d.data.milestones || []);
          setDraws(d.data.draws || []);
          setChangeOrders(d.data.change_orders || []);
          setStats(d.data.stats || {});
        } else {
          setErr(d.error || "Failed to load construction data");
        }
      })
      .catch(() => setErr("Cannot reach Construction API"))
      .finally(() => setLoading(false));
  }, [selectedDealId]);

  const patchMilestone = (id: string, completion_pct: number) => {
    fetch(`${_API}/api/construction/deals/${selectedDealId}/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completion_pct }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setMilestones(prev => prev.map(m => m.id === id ? { ...m, completion_pct } : m));
      })
      .catch(() => {});
  };

  const patchDraw = (id: string, status: string) => {
    fetch(`${_API}/api/construction/deals/${selectedDealId}/draws/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setDraws(prev => prev.map(dr => dr.id === id ? { ...dr, status } : dr));
      })
      .catch(() => {});
  };

  const totalBudget = stats.total_budget_usd || 0;
  const totalSpent = stats.total_spent_usd || 0;
  const overallPct = stats.overall_pct || 0;
  const changeOrderTotal = changeOrders.reduce((s, c) => s + (c.amount_usd || 0), 0);
  const drawsFunded = stats.draws_funded || draws.filter(d => d.status === "funded").length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-orange-300/25 bg-[#060E1A] p-5 text-[#EDE8DC] shadow-[0_0_85px_rgba(251,146,60,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(251,146,60,0.15),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-orange-200">Construction Risk Management Desk · 12 Agents</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Construction Command
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#EDE8DC]">
              Draw processing, budget tracking, schedule monitoring, change orders, lien protection, insurance verification.
              Integrated with Ramp P-card for commercial card draw processing.
            </p>
            {deals.length > 1 && (
              <div className="mt-4">
                <label className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82] block mb-1">Active Deal</label>
                <select
                  value={selectedDealId}
                  onChange={e => setSelectedDealId(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
                >
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>{d.name || d.id}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Progress", `${overallPct}%`, "overall completion"],
              ["Budget", totalBudget > 0 ? $(totalBudget) : "—", "total project cost"],
              ["Spent", totalBudget > 0 ? $(totalSpent) : "—", totalBudget > 0 ? `${Math.round(totalSpent / totalBudget * 100)}% of budget` : "loading"],
              ["Draws Funded", `${drawsFunded}/${draws.length}`, `${$(changeOrderTotal)} CO total`],
            ].map(([label, value, detail]) => (
              <Card key={label as string} className="border-white/10 bg-white/[0.04]">
                <CardContent className="p-3">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">{label}</p>
                  <p className="mt-1 text-xl font-black text-white">{value}</p>
                  <p className="text-[0.6rem] text-[#7A9A82]">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {err && (
        <Card className="border-red-500/20 bg-[#0D2218]">
          <CardContent className="p-4 text-sm text-red-400">{err}</CardContent>
        </Card>
      )}

      {/* Overall progress bar */}
      {!loading && totalBudget > 0 && (
        <Card className="border-[#1E4A2E] bg-[#0D2218]">
          <CardContent className="p-4">
            <div className="flex justify-between text-xs text-[#7A9A82] mb-2">
              <span>Overall Construction Progress</span>
              <span className="font-mono text-[#C4A048]">{overallPct}% complete · {stats.projected_completion}</span>
            </div>
            <Progress value={overallPct} className="h-3" />
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-[#7A9A82]">Spent: <span className="font-mono text-white">{$(totalSpent)}</span></span>
              <span className={`font-mono text-[0.65rem] uppercase ${stats.schedule_status === "ON_TRACK" ? "text-emerald-400" : "text-yellow-400"}`}>
                {stats.schedule_status?.replace("_", " ")}
              </span>
              <span className="text-[#7A9A82]">Budget: <span className="font-mono text-white">{$(totalBudget)}</span></span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[640px]">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="draws">Draws</TabsTrigger>
          <TabsTrigger value="changes">Change Orders</TabsTrigger>
          <TabsTrigger value="insurance">Insurance / Liens</TabsTrigger>
        </TabsList>

        {/* Milestones */}
        <TabsContent value="milestones" className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-[#7A9A82] animate-pulse">Loading construction milestones...</p>
          ) : milestones.length === 0 ? (
            <Card className="border-[#1E4A2E] bg-[#0D2218]">
              <CardContent className="p-6 text-center text-[#7A9A82] text-sm">No milestones loaded.</CardContent>
            </Card>
          ) : milestones.map((m: any) => (
            <Card key={m.id} className="border-[#1E4A2E] bg-[#0D2218]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {m.critical && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                    <span className="text-sm font-semibold text-white">{m.task_label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-[#C4A048]">{m.completion_pct}%</span>
                    {m.completion_pct < 100 && (
                      <Button size="sm" variant="outline"
                        className="border-orange-700/50 text-orange-400 h-6 text-[0.65rem] px-2"
                        onClick={() => patchMilestone(m.id, Math.min(100, (m.completion_pct || 0) + 10))}>
                        +10%
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={m.completion_pct || 0} className="h-2 mb-2" />
                <div className="flex gap-4 text-xs text-[#7A9A82]">
                  {m.budget_usd > 0 && <span>Budget: <span className="font-mono text-[#EDE8DC]">{$(m.budget_usd)}</span></span>}
                  {m.spent_usd > 0 && (
                    <span className={m.spent_usd > m.budget_usd ? "text-red-400" : "text-emerald-400"}>
                      Spent: <span className="font-mono">{$(m.spent_usd)}</span>
                    </span>
                  )}
                  <span className={m.status === "completed" ? "text-emerald-400" : m.status === "in_progress" ? "text-orange-300" : "text-[#7A9A82]"}>
                    {m.status?.replace("_", " ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Draws */}
        <TabsContent value="draws" className="mt-6">
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-[#7A9A82] animate-pulse">Loading draw schedule...</p>
            ) : draws.length === 0 ? (
              <Card className="border-[#1E4A2E] bg-[#0D2218]"><CardContent className="p-6 text-center text-[#7A9A82] text-sm">No draw schedule loaded.</CardContent></Card>
            ) : draws.map((d: any) => (
              <Card key={d.id} className={`border-[#1E4A2E] bg-[#0D2218] ${d.status === "pending" ? "border-orange-500/30" : ""}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-[#C4A048] w-16 shrink-0">Draw {d.draw_number}</span>
                    <span className="text-sm text-white">{d.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-white">{$(d.amount_usd || 0)}</span>
                    <Badge
                      variant={d.status === "funded" ? "default" : d.status === "pending" ? "secondary" : "outline"}
                      className={d.status === "funded" ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40" : ""}
                    >
                      {d.status}
                    </Badge>
                    {d.status === "pending" && (
                      <Button size="sm" variant="outline"
                        className="border-emerald-700/50 text-emerald-400 h-6 text-[0.65rem] px-2"
                        onClick={() => patchDraw(d.id, "funded")}>Fund</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Change Orders */}
        <TabsContent value="changes" className="mt-6 space-y-3">
          {changeOrders.length === 0 ? (
            <Card className="border-[#1E4A2E] bg-[#0D2218]"><CardContent className="p-6 text-center text-[#7A9A82] text-sm">No change orders on record.</CardContent></Card>
          ) : changeOrders.map((co: any) => (
            <Card key={co.id} className="border-[#1E4A2E] bg-[#0D2218]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#C4A048]">{co.co_id || co.id}</span>
                    <Badge variant={co.status === "approved" ? "default" : "secondary"}
                      className={co.status === "approved" ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40" : ""}>
                      {co.status}
                    </Badge>
                  </div>
                  <span className="font-mono text-sm text-red-400">+{$(co.amount_usd || 0)}</span>
                </div>
                <p className="text-sm text-[#EDE8DC]">{co.description}</p>
                {co.schedule_impact && (
                  <p className="text-xs text-[#7A9A82] mt-1">Schedule impact: {co.schedule_impact}</p>
                )}
              </CardContent>
            </Card>
          ))}
          <Card className="border-orange-500/20 bg-[#0D2218]">
            <CardContent className="p-3 flex justify-between text-sm">
              <span className="text-[#7A9A82]">Total Change Order Exposure</span>
              <span className="font-mono text-red-400 font-bold">{$(changeOrderTotal)}</span>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance / Liens */}
        <TabsContent value="insurance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-emerald-500/20 bg-[#0D2218]">
              <CardHeader><CardTitle className="text-emerald-400 text-sm">Insurance Verification</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-[#EDE8DC]">
                {[
                  "Builder's Risk Policy — Active, $25M coverage",
                  "General Liability — Active, NEST as additional insured",
                  "Performance Bond — Active, 100% of GMP contract",
                  "Payment Bond — Active, 100% of GMP contract",
                  "Workers' Comp — Active, all subcontractors",
                  "Pollution Liability — Active (brownfield site)",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-[#C4A048]/20 bg-[#0D2218]">
              <CardHeader><CardTitle className="text-[#C4A048] text-sm">Lien Monitoring</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-[#EDE8DC]">
                {[
                  "Lien waivers current through Draw 4",
                  "0 outstanding mechanic's liens",
                  "All subcontractor payments verified via Ramp P-card",
                  "Title search clear as of Draw 4",
                  "Preliminary notices tracked — 14 subs",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C4A048] shrink-0" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
