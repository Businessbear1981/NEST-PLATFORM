/**
 * Credit Underwriting Desk — Universal Credit Policy (Appendix F)
 * DSCR, LTV, LGD, obligor grading, credit memo generation.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const POLICY_THRESHOLDS = [
  { label: "DSCR Floor", value: "1.20x", description: "Universal minimum debt service coverage" },
  { label: "Debt Yield Floor", value: "8.0%", description: "Minimum debt yield at stabilization" },
  { label: "Max Leverage", value: "80% LTC", description: "Maximum loan-to-cost ceiling" },
  { label: "Min Equity", value: "20%", description: "Minimum sponsor equity contribution" },
  { label: "DSRF Default", value: "MADS", description: "Maximum annual debt service reserve" },
  { label: "Operating Reserve", value: "3 months", description: "Operating expense reserve floor" },
];

const EXCEPTION_AUTHORITY = [
  { level: "Minor", handler: "Senior Credit Underwriter Agent", description: "Within sector norms, well-supported" },
  { level: "Moderate", handler: "CCO + Founders", description: "Outside norms, documented justification" },
  { level: "Material", handler: "Founders explicit approval", description: "Policy-level deviation" },
];

export default function CreditUWPage() {
  const [activeTab, setActiveTab] = useState("policy");
  const [dscr, setDscr] = useState("1.35");
  const [leverage, setLeverage] = useState("4.2");
  const [equityPct, setEquityPct] = useState("0.30");
  const [experience, setExperience] = useState("10");
  const [screenResult, setScreenResult] = useState<any>(null);

  const underwriteMutation = trpc.intel.underwrite.useMutation({
    onSuccess: (data) => setScreenResult(data),
  });

  function runScreen() {
    underwriteMutation.mutate({
      dscr: parseFloat(dscr),
      total_leverage: parseFloat(leverage),
      equity_pct: parseFloat(equityPct),
      sponsor_experience_years: parseInt(experience),
      deal_type: "stabilized",
    });
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-emerald-300/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(16,185,129,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(16,185,129,0.17),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(196,160,72,0.12),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200">Credit Underwriting Desk · Maxwell Agent</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>Credit Underwriting</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Universal Credit Policy enforcement, credit memo production, obligor grading. Every deal screened against Appendix F thresholds with sector-specific overlays.
          </p>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
          <TabsTrigger value="policy">Credit Policy</TabsTrigger>
          <TabsTrigger value="screen">Quick Screen</TabsTrigger>
          <TabsTrigger value="exceptions">Exception Authority</TabsTrigger>
        </TabsList>

        <TabsContent value="policy" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {POLICY_THRESHOLDS.map((t) => (
              <Card key={t.label} className="border-emerald-300/20 bg-[#0D2218]">
                <CardContent className="p-4">
                  <p className="font-mono text-[0.63rem] uppercase tracking-[0.18em] text-emerald-200">{t.label}</p>
                  <p className="mt-2 text-2xl font-black text-white" style={{ fontFamily: "IBM Plex Mono, monospace" }}>{t.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{t.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="screen" className="mt-6 space-y-4">
          <Card className="border-slate-700 bg-[#0D2218]">
            <CardHeader><CardTitle className="text-[#C4A048]">Quick Credit Screen</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-mono text-[0.6rem] uppercase tracking-wider text-slate-400 mb-1">DSCR</label>
                  <input value={dscr} onChange={(e) => setDscr(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block font-mono text-[0.6rem] uppercase tracking-wider text-slate-400 mb-1">Total Leverage (x)</label>
                  <input value={leverage} onChange={(e) => setLeverage(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block font-mono text-[0.6rem] uppercase tracking-wider text-slate-400 mb-1">Equity %</label>
                  <input value={equityPct} onChange={(e) => setEquityPct(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block font-mono text-[0.6rem] uppercase tracking-wider text-slate-400 mb-1">Sponsor Experience (yrs)</label>
                  <input value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <Button onClick={runScreen} disabled={underwriteMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                {underwriteMutation.isPending ? "Screening..." : "Run Credit Screen"}
              </Button>
            </CardContent>
          </Card>

          {screenResult && (
            <Card className={`border-${screenResult.passed ? "emerald" : "red"}-500/30 bg-[#0D2218]`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className={screenResult.passed ? "text-emerald-400" : "text-red-400"}>
                    {screenResult.passed ? "PASS" : "FAIL — Exception Required"}
                  </span>
                  <Badge variant={screenResult.passed ? "default" : "destructive"}>
                    {screenResult.material_flags} material flags
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {screenResult.flags?.map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                    <span className={`w-2 h-2 rounded-full ${f.severity === "material" ? "bg-red-500" : "bg-yellow-500"}`} />
                    <span className="text-sm text-slate-300">{f.message}</span>
                    <Badge variant="outline" className="ml-auto text-[0.6rem]">{f.severity}</Badge>
                  </div>
                ))}
                {screenResult.exception_required && (
                  <p className="mt-3 text-xs text-red-400">Exception authority: {screenResult.exception_authority}</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="exceptions" className="mt-6">
          <div className="space-y-3">
            {EXCEPTION_AUTHORITY.map((e) => (
              <Card key={e.level} className="border-slate-700 bg-[#0D2218]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{e.level} Deviations</p>
                    <p className="text-xs text-slate-400 mt-1">{e.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[#C4A048] border-[#C4A048]/30">{e.handler}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
