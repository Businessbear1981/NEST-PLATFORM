"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";
import Link from "next/link";
/**
 * Active Deals — master view of all deals with pipeline status.
 * Click any deal to drill into its workflow across all desks.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const PIPELINE_STAGES = [
  { id: "origination", label: "Origination", desk: "BD" },
  { id: "intake", label: "Intake", desk: "Bond Desk" },
  { id: "credit_underwriting", label: "Credit", desk: "Credit UW" },
  { id: "rating", label: "Rating", desk: "Rating" },
  { id: "structuring", label: "Structure", desk: "Structuring" },
  { id: "enhancement", label: "Enhancement", desk: "Enhancement" },
  { id: "documents", label: "Documents", desk: "Documents" },
  { id: "placement", label: "Placement", desk: "Placement" },
  { id: "closing", label: "Closing", desk: "Bond Desk" },
  { id: "operations", label: "Admin", desk: "Operations" },
  { id: "surveillance", label: "Surveillance", desk: "Surveillance" },
];

function stageIndex(stage: string): number {
  const idx = PIPELINE_STAGES.findIndex(s => s.id === stage);
  return idx >= 0 ? idx : 0;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // Load seed deals from EMMA + any real deals
    fetch(`${_API}/api/deal-flow/seed-deals`).then(r => r.json()).then(d => {
      if (d.success) setDeals(d.data);
    }).catch(() => {});
  }, []);

  async function runDealPipeline(deal: any) {
    setRunning(true);
    setSelectedDeal(deal);
    try {
      const res = await fetch(`${_API}/api/deal-flow/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deal),
      });
      const data = await res.json();
      if (data.success) setPipelineResult(data.data);
    } finally { setRunning(false); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-[#EDE8DC] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Deal Pipeline · All Active Deals</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>Active Deals</h1>
            <p className="mt-2 text-sm text-[#7A9A82]">{deals.length} deals in pipeline across {new Set(deals.map(d => d.stage)).size} stages</p>
          </div>
          <div className="flex gap-3">
            <Link href="/deal-input-v4">
              <Button className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A]">New Deal</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pipeline Summary Strip */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-[#0D2218]/60 p-2 overflow-x-auto">
        {PIPELINE_STAGES.map((stage) => {
          const count = deals.filter(d => d.stage === stage.id).length;
          return (
            <div key={stage.id} className="flex-1 min-w-[80px] text-center rounded-lg px-2 py-2" style={{ background: count > 0 ? "rgba(196,160,72,0.08)" : "transparent" }}>
              <p className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7A9A82]">{stage.label}</p>
              <p className={`font-mono text-lg font-bold ${count > 0 ? "text-[#C4A048]" : "text-[#2D6B3D]"}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Deal Cards */}
      <div className="space-y-3">
        {deals.map((deal) => {
          const stageIdx = stageIndex(deal.stage);
          const pct = Math.round(((stageIdx + 1) / PIPELINE_STAGES.length) * 100);
          return (
            <Card key={deal.id} className="border-[#1E4A2E]/60 bg-[#0D2218] hover:border-[#C4A048]/30 transition cursor-pointer"
              onClick={() => setSelectedDeal(deal)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{deal.name}</p>
                    <p className="text-xs text-[#7A9A82] mt-0.5">{deal.borrower} · {deal.state} · {deal.sector?.replace(/_/g, " ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#C4A048]/30 text-[#C4A048]">{deal.credit_grade}</Badge>
                    <span className="font-mono text-sm text-white">${(deal.bond_amount / 1e6).toFixed(0)}M</span>
                    <Badge variant={deal.status === "funded" ? "default" : "secondary"}>{deal.status}</Badge>
                  </div>
                </div>
                {/* Pipeline progress bar */}
                <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-[#0D2218]">
                  {PIPELINE_STAGES.map((stage, i) => (
                    <div key={stage.id} className={`flex-1 rounded-full ${i <= stageIdx ? "bg-[#C4A048]" : "bg-[#1E4A2E]"}`} />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="font-mono text-[0.55rem] text-[#7A9A82]">{PIPELINE_STAGES[stageIdx]?.label}</span>
                  <span className="font-mono text-[0.55rem] text-[#C4A048]">{pct}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deal Detail Drill-Down */}
      {selectedDeal && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>{selectedDeal.name || selectedDeal.borrower}</h2>
            <div className="flex gap-2">
              <Button onClick={() => runDealPipeline(selectedDeal)} disabled={running}
                className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A]">
                {running ? "Running Pipeline..." : "Run Full Pipeline"}
              </Button>
              <Button variant="outline" onClick={() => { setSelectedDeal(null); setPipelineResult(null); }}
                className="border-[#1E4A2E] text-[#7A9A82]">Close</Button>
            </div>
          </div>

          {/* Deal info strip */}
          <div className="grid grid-cols-6 gap-3">
            {[
              ["Bond", `$${((selectedDeal.bond_amount || 0) / 1e6).toFixed(0)}M`],
              ["Coupon", `${selectedDeal.coupon_rate || "—"}%`],
              ["Grade", selectedDeal.credit_grade || "—"],
              ["Enhancement", (selectedDeal.enhancement || "none").replace(/_/g, " ")],
              ["Stage", (selectedDeal.stage || "—").replace(/_/g, " ")],
              ["Trustee", selectedDeal.trustee || "—"],
            ].map(([label, value]) => (
              <Card key={label as string} className="border-white/10 bg-white/[0.03]">
                <CardContent className="p-3">
                  <p className="font-mono text-[0.55rem] uppercase text-[#7A9A82]">{label}</p>
                  <p className="font-mono text-sm text-white mt-1">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workflow stages */}
          <Card className="border-[#1E4A2E] bg-[#0D2218]">
            <CardHeader><CardTitle className="text-[#C4A048] text-sm" style={{ fontFamily: "Cormorant Garamond" }}>Workflow Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PIPELINE_STAGES.map((stage, i) => {
                  const dealStageIdx = stageIndex(selectedDeal.stage);
                  const completed = i <= dealStageIdx;
                  const current = i === dealStageIdx;
                  const hasOutput = pipelineResult?.desk_outputs?.[stage.id];

                  return (
                    <div key={stage.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${current ? "border-[#C4A048]/40 bg-[#C4A048]/8" : completed ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-transparent"}`}>
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${completed ? "bg-emerald-500/20 text-emerald-400" : current ? "bg-[#C4A048]/20 text-[#C4A048]" : "bg-[#0D2218] text-[#7A9A82]"}`}>
                        {completed && !current ? "✓" : i + 1}
                      </span>
                      <div className="flex-1">
                        <span className={`text-sm font-semibold ${current ? "text-[#C4A048]" : completed ? "text-emerald-400" : "text-[#7A9A82]"}`}>{stage.label}</span>
                        <span className="ml-2 font-mono text-[0.6rem] text-[#7A9A82]">{stage.desk}</span>
                      </div>
                      {hasOutput && (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[0.55rem]">Output Ready</Badge>
                      )}
                      {current && (
                        <Badge className="bg-[#C4A048]/20 text-[#C4A048] border-[#C4A048]/30 text-[0.55rem]">Current</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Results (if run) */}
          {pipelineResult && (
            <div className="grid grid-cols-2 gap-4">
              {pipelineResult.desk_outputs && Object.entries(pipelineResult.desk_outputs).map(([desk, output]: [string, any]) => (
                <Card key={desk} className="border-emerald-500/15 bg-[#0D2218]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-emerald-400 text-xs uppercase tracking-wider">{desk.replace(/_/g, " ")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-[0.6rem] text-[#7A9A82] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {JSON.stringify(output, null, 2).slice(0, 500)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
