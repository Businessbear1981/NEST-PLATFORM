/**
 * Treasury Desk — Ramp P-Card Program, construction draws, soft costs,
 * arrangement fees, T&E, 1.5% interchange rebate.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TreasuryPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>("deal-1");
  const [overview, setOverview] = useState<any>(null);
  const [budget, setBudget] = useState<any[]>([]);
  const [rebate, setRebate] = useState<any>(null);

  // Load deal list on mount
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

  // Load treasury data when deal changes
  useEffect(() => {
    if (!selectedDealId) return;
    fetch(`/api/treasury/${selectedDealId}/overview`).then(r => r.json()).then(d => d.success && setOverview(d.data)).catch(() => {});
    fetch(`/api/treasury/${selectedDealId}/budget`).then(r => r.json()).then(d => d.success && setBudget(d.data)).catch(() => {});
    fetch(`/api/treasury/${selectedDealId}/rebate`).then(r => r.json()).then(d => d.success && setRebate(d.data)).catch(() => {});
  }, [selectedDealId]);

  const selectedDeal = deals.find(d => d.id === selectedDealId);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(196,160,72,0.13)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.17),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Treasury Desk · Ramp Commercial Card Program</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>Treasury Command</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Ramp P-card program for construction draws, NEST soft costs (rating, legal, feasibility), arrangement fees, T&E for client meetings. 1.5% interchange rebate on all eligible spend.</p>
            {deals.length > 0 && (
              <div className="mt-4">
                <label className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500 block mb-1">Active Deal</label>
                <select
                  value={selectedDealId}
                  onChange={e => setSelectedDealId(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#C4A048]/50"
                >
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>{d.name || d.id}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {overview && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Total Budget", `$${(overview.total_budget / 1e6).toFixed(0)}M`],
                ["Total Spent", `$${(overview.total_spent / 1e6).toFixed(1)}M`],
                ["Active Cards", `${overview.active_cards}`],
                ["Rebate Accrued", `$${(overview.rebate_accrued / 1e3).toFixed(0)}K`],
              ].map(([label, value]) => (
                <Card key={label} className="border-white/10 bg-white/[0.04]">
                  <CardContent className="p-3">
                    <p className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-black text-white" style={{ fontFamily: "IBM Plex Mono" }}>{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[640px]">
          <TabsTrigger value="overview">Budget vs Actual</TabsTrigger>
          <TabsTrigger value="softcosts">Soft Costs</TabsTrigger>
          <TabsTrigger value="te">T&E</TabsTrigger>
          <TabsTrigger value="rebate">Rebate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-2">
          {budget.length === 0 ? (
            <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6 text-center text-slate-500 text-sm">
              {selectedDeal ? `Loading budget for ${selectedDeal.name || selectedDealId}...` : "Select a deal above to load treasury data."}
            </CardContent></Card>
          ) : budget.map((cat: any) => (
            <Card key={cat.category_id} className="border-slate-700 bg-[#0D2218]">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{cat.category_name}</span>
                  <Badge variant={cat.status === "green" ? "default" : cat.status === "amber" ? "secondary" : "destructive"}>
                    {cat.variance_pct > 0 ? `+${cat.variance_pct}%` : `${cat.variance_pct}%`}
                  </Badge>
                </div>
                <div className="h-2 bg-slate-800 rounded overflow-hidden">
                  <div className={`h-full rounded ${cat.status === "green" ? "bg-emerald-500" : cat.status === "amber" ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(100, (cat.spent / cat.budgeted) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[0.6rem] text-slate-500 mt-1">
                  <span>Spent: ${(cat.spent / 1e6).toFixed(2)}M</span>
                  <span>Budget: ${(cat.budgeted / 1e6).toFixed(2)}M</span>
                  <span>Remaining: ${(cat.remaining / 1e6).toFixed(2)}M</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="softcosts" className="mt-6">
          <Card className="border-[#C4A048]/20 bg-[#0D2218]">
            <CardHeader><CardTitle className="text-[#C4A048] text-sm">NEST Pre-Close Soft Costs</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {[
                ["Moody's Rating Fee", "$850,000"],
                ["S&P Rating Fee", "$720,000"],
                ["Greenberg Traurig — Bond Counsel", "$480,000"],
                ["Orrick Herrington — Co-Counsel", "$340,000"],
                ["Deloitte — Audit", "$290,000"],
                ["McKinsey — Advisory", "$380,000"],
                ["AWS — Platform Hosting", "$48,000"],
                ["Travel & Site Visits", "$42,700"],
              ].map(([item, cost]) => (
                <div key={item} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-slate-300">{item}</span>
                  <span className="font-mono text-xs text-[#C4A048]">{cost}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="te" className="mt-6">
          <Card className="border-slate-700 bg-[#0D2218]">
            <CardHeader><CardTitle className="text-sm text-white">T&E — Client Meetings</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[["Airfare", "$18,400"], ["Hotels", "$12,200"], ["Meals", "$6,800"], ["Ground", "$5,300"]].map(([cat, amt]) => (
                  <div key={cat} className="text-center">
                    <p className="font-mono text-[0.6rem] uppercase text-slate-500">{cat}</p>
                    <p className="font-mono text-lg text-white">{amt}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">All T&E processed through Ramp commercial cards. 1.5% rebate earned on eligible spend. MCC codes: 4511 (airlines), 7011 (hotels), 5812 (restaurants), 7512 (car rental).</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rebate" className="mt-6">
          {rebate ? (
            <Card className="border-emerald-500/20 bg-[#0D2218]">
              <CardHeader><CardTitle className="text-emerald-400 text-sm">1.5% Interchange Rebate</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">Eligible Spend</p><p className="font-mono text-2xl text-white">${(rebate.total_eligible_spend / 1e6).toFixed(2)}M</p></div>
                  <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">Accrued</p><p className="font-mono text-2xl text-emerald-400">${(rebate.accrued / 1e3).toFixed(0)}K</p></div>
                  <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">Projected 36mo</p><p className="font-mono text-2xl text-[#C4A048]">${(rebate.projected_36mo / 1e6).toFixed(2)}M</p></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6 text-center text-slate-500 text-sm">Loading rebate data...</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
