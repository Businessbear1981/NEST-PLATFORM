/**
 * Construction Risk Management Desk — 12 agents
 * Draw processing, budget tracking, schedule monitoring, change orders,
 * lien monitoring, insurance verification, sponsor equity tracking.
 * Integrates with Treasury/Ramp for commercial card draw processing.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const SAMPLE_MILESTONES = [
  { id: "m1", name: "Site Work & Foundation", planned: "2026-01-15", actual: "2026-01-20", pct: 100, budget: 12_500_000, spent: 12_180_000, critical: true, daysAhead: -5 },
  { id: "m2", name: "Structural Steel / Framing", planned: "2026-04-01", actual: "2026-03-28", pct: 85, budget: 28_000_000, spent: 23_100_000, critical: true, daysAhead: 4 },
  { id: "m3", name: "MEP Rough-In", planned: "2026-06-15", actual: null, pct: 40, budget: 18_500_000, spent: 7_200_000, critical: true, daysAhead: 0 },
  { id: "m4", name: "Exterior Envelope", planned: "2026-07-01", actual: null, pct: 25, budget: 15_000_000, spent: 3_600_000, critical: false, daysAhead: 3 },
  { id: "m5", name: "Interior Finishes", planned: "2026-09-01", actual: null, pct: 5, budget: 22_000_000, spent: 1_100_000, critical: false, daysAhead: 0 },
  { id: "m6", name: "FF&E Installation", planned: "2026-11-01", actual: null, pct: 0, budget: 8_500_000, spent: 0, critical: false, daysAhead: 0 },
  { id: "m7", name: "Substantial Completion", planned: "2026-12-15", actual: null, pct: 0, budget: 0, spent: 0, critical: true, daysAhead: 0 },
];

const DRAW_SCHEDULE = [
  { draw: 1, date: "2026-02-01", amount: 8_200_000, status: "funded", category: "Site Work" },
  { draw: 2, date: "2026-03-01", amount: 9_400_000, status: "funded", category: "Foundation" },
  { draw: 3, date: "2026-04-01", amount: 11_800_000, status: "funded", category: "Structural" },
  { draw: 4, date: "2026-05-01", amount: 10_600_000, status: "pending", category: "Structural + MEP" },
  { draw: 5, date: "2026-06-01", amount: 12_100_000, status: "scheduled", category: "MEP + Exterior" },
  { draw: 6, date: "2026-07-01", amount: 8_900_000, status: "scheduled", category: "Exterior + Interior" },
];

const CHANGE_ORDERS = [
  { id: "CO-001", description: "Soil remediation — unexpected contamination at NE corner", amount: 340_000, status: "approved", impact: "2 weeks schedule delay" },
  { id: "CO-002", description: "Upgraded HVAC controls per energy code revision", amount: 185_000, status: "pending", impact: "None" },
  { id: "CO-003", description: "Additional fire suppression — code requirement change", amount: 220_000, status: "approved", impact: "1 week" },
];

export default function ConstructionPage() {
  const [activeTab, setActiveTab] = useState("milestones");
  const totalBudget = SAMPLE_MILESTONES.reduce((s, m) => s + m.budget, 0);
  const totalSpent = SAMPLE_MILESTONES.reduce((s, m) => s + m.spent, 0);
  const overallPct = Math.round(SAMPLE_MILESTONES.reduce((s, m) => s + m.pct, 0) / SAMPLE_MILESTONES.length);
  const changeOrderTotal = CHANGE_ORDERS.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-orange-300/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(251,146,60,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(251,146,60,0.15),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-orange-200">Construction Risk Management Desk · 12 Agents</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>Construction Command</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Draw processing, budget tracking, schedule monitoring, change orders, lien protection, insurance verification. Integrated with Ramp P-card for commercial card draw processing.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Progress", `${overallPct}%`, "overall completion"],
              ["Budget", `$${(totalBudget / 1e6).toFixed(1)}M`, "total project cost"],
              ["Spent", `$${(totalSpent / 1e6).toFixed(1)}M`, `${Math.round(totalSpent / totalBudget * 100)}% of budget`],
              ["Change Orders", `$${(changeOrderTotal / 1e3).toFixed(0)}K`, `${CHANGE_ORDERS.length} orders`],
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
          {SAMPLE_MILESTONES.map((m) => (
            <Card key={m.id} className="border-slate-700 bg-[#0D2218]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {m.critical && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    <span className="text-sm font-semibold text-white">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs ${m.daysAhead > 0 ? "text-emerald-400" : m.daysAhead < 0 ? "text-red-400" : "text-slate-400"}`}>
                      {m.daysAhead > 0 ? `+${m.daysAhead}d ahead` : m.daysAhead < 0 ? `${m.daysAhead}d behind` : "On track"}
                    </span>
                    <span className="font-mono text-sm text-[#C4A048]">{m.pct}%</span>
                  </div>
                </div>
                <Progress value={m.pct} className="h-2 mb-2" />
                <div className="flex gap-4 text-xs text-slate-400">
                  <span>Planned: {m.planned}</span>
                  {m.budget > 0 && <span>Budget: ${(m.budget / 1e6).toFixed(1)}M</span>}
                  {m.spent > 0 && <span className={m.spent > m.budget ? "text-red-400" : "text-emerald-400"}>Spent: ${(m.spent / 1e6).toFixed(1)}M</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="draws" className="mt-6">
          <div className="space-y-2">
            {DRAW_SCHEDULE.map((d) => (
              <Card key={d.draw} className="border-slate-700 bg-[#0D2218]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-[#C4A048] w-16">Draw {d.draw}</span>
                    <span className="text-sm text-white">{d.category}</span>
                    <span className="text-xs text-slate-400">{d.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-white">${(d.amount / 1e6).toFixed(1)}M</span>
                    <Badge variant={d.status === "funded" ? "default" : d.status === "pending" ? "secondary" : "outline"}>
                      {d.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="changes" className="mt-6 space-y-3">
          {CHANGE_ORDERS.map((co) => (
            <Card key={co.id} className="border-slate-700 bg-[#0D2218]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#C4A048]">{co.id}</span>
                    <Badge variant={co.status === "approved" ? "default" : "secondary"}>{co.status}</Badge>
                  </div>
                  <span className="font-mono text-sm text-red-400">+${(co.amount / 1e3).toFixed(0)}K</span>
                </div>
                <p className="text-sm text-slate-300">{co.description}</p>
                <p className="text-xs text-slate-500 mt-1">Schedule impact: {co.impact}</p>
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
