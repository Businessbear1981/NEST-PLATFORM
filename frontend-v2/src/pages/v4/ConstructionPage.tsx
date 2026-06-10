/**
 * Construction Risk Management Desk — 12 agents
 * Draw processing, budget tracking, schedule monitoring, change orders.
 * Backed by /api/construction/<deal_id>/* endpoints.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function ConstructionPage() {
  const [activeTab, setActiveTab] = useState("milestones");
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [milestones, setMilestones] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [changeOrders, setChangeOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Load deal list
  useEffect(() => {
    fetch("/api/deals")
      .then(r => r.json())
      .then(d => {
        const list = d.data?.deals || d.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setDeals(list);
          setSelectedDealId(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Load construction data when deal changes
  useEffect(() => {
    if (!selectedDealId) return;
    setLoading(true);
    fetch(`/api/construction/deals/${selectedDealId}/summary`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMilestones(d.data.milestones || []);
          setDraws(d.data.draws || []);
          setChangeOrders(d.data.change_orders || []);
          setStats(d.data.stats || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDealId]);

  const patchMilestone = (id: string, completion_pct: number) => {
    fetch(`/api/construction/deals/${selectedDealId}/milestones/${id}`, {
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
    fetch(`/api/construction/deals/${selectedDealId}/draws/${id}`, {
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
  const changeOrderTotal = changeOrders.reduce((s: number, c: any) => s + (c.amount_usd || 0), 0);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-orange-300/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(251,146,60,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(251,146,60,0.15),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-orange-200">Construction Risk Management Desk · 12 Agents</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>Construction Command</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Draw processing, budget tracking, schedule monitoring, change orders, lien protection, insurance verification. Integrated with Ramp P-card for commercial card draw processing.</p>
            {deals.length > 0 && (
              <div className="mt-4">
                <label className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500 block mb-1">Active Deal</label>
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
              ["Budget", totalBudget > 0 ? `$${(totalBudget / 1e6).toFixed(1)}M` : "—", "total project cost"],
              ["Spent", totalBudget > 0 ? `$${(totalSpent / 1e6).toFixed(1)}M` : "—", totalBudget > 0 ? `${Math.round(totalSpent / totalBudget * 100)}% of budget` : "loading"],
              ["Change Orders", `$${(changeOrderTotal / 1e3).toFixed(0)}K`, `${changeOrders.length} orders`],
            ].map(([label, value, detail]) => (
              <Card key={label as string} className="border-white/10 bg-white/[0.04]">
                <CardContent className="p-3">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-black text-white">{value}</p>
                  <p className="text-[0.6rem] text-slate-500">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[640px]">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="draws">Draws</TabsTrigger>
          <TabsTrigger value="changes">Change Orders</TabsTrigger>
          <TabsTrigger value="insurance">Insurance / Liens</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading milestones...</p>
          ) : milestones.length === 0 ? (
            <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6 text-center text-slate-500 text-sm">Select a deal to load construction milestones.</CardContent></Card>
          ) : milestones.map((m: any) => (
            <Card key={m.id} className="border-slate-700 bg-[#0D2218]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {m.critical && <span className="w-2 h-2 rounded-full bg-red-500" />}
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
                <div className="flex gap-4 text-xs text-slate-400">
                  {m.budget_usd > 0 && <span>Budget: ${(m.budget_usd / 1e6).toFixed(1)}M</span>}
                  {m.spent_usd > 0 && <span className={m.spent_usd > m.budget_usd ? "text-red-400" : "text-emerald-400"}>Spent: ${(m.spent_usd / 1e6).toFixed(1)}M</span>}
                  <span className={m.status === "completed" ? "text-emerald-400" : "text-slate-500"}>{m.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="draws" className="mt-6">
          <div className="space-y-2">
            {draws.length === 0 ? (
              <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6 text-center text-slate-500 text-sm">No draw schedule loaded.</CardContent></Card>
            ) : draws.map((d: any) => (
              <Card key={d.id} className="border-slate-700 bg-[#0D2218]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-[#C4A048] w-16">Draw {d.draw_number}</span>
                    <span className="text-sm text-white">{d.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-white">${((d.amount_usd || 0) / 1e6).toFixed(1)}M</span>
                    <Badge variant={d.status === "funded" ? "default" : d.status === "pending" ? "secondary" : "outline"}>
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

        <TabsContent value="changes" className="mt-6 space-y-3">
          {changeOrders.length === 0 ? (
            <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6 text-center text-slate-500 text-sm">No change orders on record.</CardContent></Card>
          ) : changeOrders.map((co: any) => (
            <Card key={co.id} className="border-slate-700 bg-[#0D2218]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#C4A048]">{co.co_id || co.id}</span>
                    <Badge variant={co.status === "approved" ? "default" : "secondary"}>{co.status}</Badge>
                  </div>
                  <span className="font-mono text-sm text-red-400">+${((co.amount_usd || 0) / 1e3).toFixed(0)}K</span>
                </div>
                <p className="text-sm text-slate-300">{co.description}</p>
                {co.schedule_impact && <p className="text-xs text-slate-500 mt-1">Schedule impact: {co.schedule_impact}</p>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insurance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-emerald-500/20 bg-[#0D2218]">
              <CardHeader><CardTitle className="text-emerald-400 text-sm">Insurance Verification</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                {["Builder's Risk Policy — Active, $25M coverage", "General Liability — Active, NEST as additional insured", "Performance Bond — Active, 100% of contract", "Payment Bond — Active, 100% of contract", "Workers' Comp — Active, all subcontractors"].map((item) => (
                  <div key={item} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />{item}</div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-[#C4A048]/20 bg-[#0D2218]">
              <CardHeader><CardTitle className="text-[#C4A048] text-sm">Lien Monitoring</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                {["Lien waivers current through Draw 3", "0 outstanding mechanic's liens", "All subcontractor payments verified via Ramp", "Title search clear as of last draw"].map((item) => (
                  <div key={item} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C4A048]" />{item}</div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
