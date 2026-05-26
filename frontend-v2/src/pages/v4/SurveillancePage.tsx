/**
 * Surveillance Desk — Portfolio monitoring, refunding identification,
 * risk re-rating, restructuring, workouts.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REFUNDING_CANDIDATES = [
  { issuer: "Sunrise Senior Living", cusip: "867945AA1", coupon: 6.25, marketRate: 4.85, par: 45_000_000, pvSavings: 7.2, callDate: "2027-01-01", urgency: "high" },
  { issuer: "Harbor View CCRC", cusip: "411267AB3", coupon: 5.75, marketRate: 4.90, par: 32_000_000, pvSavings: 5.1, callDate: "2026-10-01", urgency: "high" },
  { issuer: "Metro Charter Academy", cusip: "592034AC5", coupon: 5.50, marketRate: 4.95, par: 18_000_000, pvSavings: 3.8, callDate: "2027-06-01", urgency: "medium" },
  { issuer: "Greenfield Multifamily", cusip: "395821AD7", coupon: 5.25, marketRate: 5.00, par: 28_000_000, pvSavings: 3.2, callDate: "2028-01-01", urgency: "low" },
];

const SURVEILLANCE_ALERTS = [
  { bond: "Sunrise Senior Living 2022A", type: "DSCR Warning", detail: "DSCR declined to 1.25x from 1.42x — approaching 1.20x covenant", severity: "warning" },
  { bond: "Metro Charter Academy 2021", type: "Enrollment Decline", detail: "Enrollment down 8% YoY — below projections", severity: "watch" },
  { bond: "Industrial Services Acq 2024", type: "Leverage Creep", detail: "Total leverage increased to 5.8x from 5.2x after add-on", severity: "warning" },
];

export default function SurveillancePage() {
  const [activeTab, setActiveTab] = useState("refunding");
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-violet-300/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(139,92,246,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(139,92,246,0.15),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-violet-200">Surveillance Desk · 4 Agents</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>Surveillance Command</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Portfolio monitoring, refunding identification (NPV savings calculator), risk re-rating via Mirror Agents, restructuring opportunities, workout support.</p>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
          <TabsTrigger value="refunding">Refunding Pipeline</TabsTrigger>
          <TabsTrigger value="alerts">Surveillance Alerts</TabsTrigger>
          <TabsTrigger value="rerating">Risk Re-Rating</TabsTrigger>
        </TabsList>

        <TabsContent value="refunding" className="mt-6 space-y-3">
          {REFUNDING_CANDIDATES.map((r) => (
            <Card key={r.cusip} className="border-slate-700 bg-[#0D2218] hover:border-violet-500/30 transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-white">{r.issuer}</span>
                    <span className="ml-2 font-mono text-xs text-slate-500">{r.cusip}</span>
                  </div>
                  <Badge variant={r.urgency === "high" ? "destructive" : r.urgency === "medium" ? "secondary" : "outline"}>{r.urgency}</Badge>
                </div>
                <div className="grid grid-cols-5 gap-4 text-xs">
                  <div><span className="text-slate-500 block">Coupon</span><span className="font-mono text-red-400">{r.coupon}%</span></div>
                  <div><span className="text-slate-500 block">Market Rate</span><span className="font-mono text-emerald-400">{r.marketRate}%</span></div>
                  <div><span className="text-slate-500 block">Par</span><span className="font-mono text-white">${(r.par / 1e6).toFixed(0)}M</span></div>
                  <div><span className="text-slate-500 block">PV Savings</span><span className="font-mono text-[#C4A048] text-base font-bold">{r.pvSavings}%</span></div>
                  <div><span className="text-slate-500 block">Call Date</span><span className="font-mono text-slate-300">{r.callDate}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="alerts" className="mt-6 space-y-3">
          {SURVEILLANCE_ALERTS.map((a, i) => (
            <Card key={i} className={`bg-[#0D2218] ${a.severity === "warning" ? "border-yellow-500/30" : "border-slate-700"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{a.bond}</span>
                  <Badge variant={a.severity === "warning" ? "destructive" : "secondary"}>{a.type}</Badge>
                </div>
                <p className="text-xs text-slate-300">{a.detail}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rerating" className="mt-6">
          <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6">
            <p className="text-sm text-slate-300">Risk re-rating leverages the Moody's and S&P Mirror Agents to re-score administered bonds against current financials. Select a bond from the portfolio to run re-rating analysis.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
