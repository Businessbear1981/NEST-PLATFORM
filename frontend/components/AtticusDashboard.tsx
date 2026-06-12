"use client";
import { useState } from "react";
import { Loader2, Scale, FileText, AlertTriangle, CheckCircle2, Shield, BookOpen, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const COMPLIANCE_CHECKLIST = [
  { id: "c1", category: "Securities", item: "Reg D 506(c) filing prepared", required: true },
  { id: "c2", category: "Securities", item: "Blue Sky state filings (all target states)", required: true },
  { id: "c3", category: "Securities", item: "Accredited investor verification protocol", required: true },
  { id: "c4", category: "Securities", item: "Private Placement Memorandum (PPM) reviewed", required: true },
  { id: "c5", category: "Bond", item: "Bond indenture draft — counsel review", required: true },
  { id: "c6", category: "Bond", item: "Trust agreement — paying agent terms", required: true },
  { id: "c7", category: "Bond", item: "Call/put provisions — legal enforceability", required: true },
  { id: "c8", category: "Bond", item: "Covenant package — cure period language", required: true },
  { id: "c9", category: "Entity", item: "SPE formation — bankruptcy remoteness", required: true },
  { id: "c10", category: "Entity", item: "Operating agreement — waterfall provisions", required: true },
  { id: "c11", category: "Insurance", item: "Surety bond — legal opinion on enforceability", required: true },
  { id: "c12", category: "Insurance", item: "D&O coverage confirmed", required: false },
  { id: "c13", category: "Tax", item: "Tax-exempt status analysis (if applicable)", required: false },
  { id: "c14", category: "Tax", item: "REMIC/FASIT structure opinion", required: false },
  { id: "c15", category: "Regulatory", item: "State licensing — senior living (CON if applicable)", required: true },
  { id: "c16", category: "Regulatory", item: "Environmental compliance — Phase I clearance", required: true },
];

export default function AtticusDashboard({ dealId }: { dealId?: string }) {
  const [checklist, setChecklist] = useState(
    COMPLIANCE_CHECKLIST.map((c) => ({ ...c, completed: false }))
  );
  const [activeTab, setActiveTab] = useState("compliance");

  const legalMemoMutation = trpc.powerstrip.route.useMutation();
  const covenantMutation = trpc.ratingEsg.covenantMonitor.useMutation();

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const completed = checklist.filter((c) => c.completed).length;
  const required = checklist.filter((c) => c.required).length;
  const requiredComplete = checklist.filter((c) => c.required && c.completed).length;
  const readinessPct = Math.round((requiredComplete / required) * 100);

  const categories = Array.from(new Set(checklist.map((c) => c.category)));

  const generateLegalMemo = () => {
    legalMemoMutation.mutate({
      taskType: "legal_summary",
      prompt: `Generate a bond counsel legal opinion summary for a NEST dual-tranche senior living bond offering.
      Cover: Reg D 506(c) compliance, SPE bankruptcy remoteness, surety bond enforceability (Hylant),
      covenant cure provisions, call/put legal framework, and tax-exempt status analysis.
      Format as a professional legal memo with sections. Jimmy Lee tone — decisive, no hedging.`,
    });
  };

  const runCovenantReview = () => {
    covenantMutation.mutate({
      covenants: [
        { name: "DSCR Minimum", type: "minimum", threshold: 1.5, current: 1.72 },
        { name: "LTV Maximum", type: "maximum", threshold: 75, current: 68.5 },
        { name: "Occupancy Floor", type: "minimum", threshold: 85, current: 91 },
        { name: "Debt/EBITDA Cap", type: "maximum", threshold: 6.5, current: 5.8 },
        { name: "Interest Coverage", type: "minimum", threshold: 2.25, current: 2.65 },
        { name: "Cash Reserve Ratio", type: "minimum", threshold: 0.25, current: 0.31 },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
            <Gavel size={17} /> Atticus — In-House Counsel
          </div>
          <p className="mt-1 text-sm text-[#7A9A82]">Legal compliance, covenant monitoring, and bond counsel coordination.</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#7A9A82]">Legal Readiness</p>
          <p className={`font-mono text-2xl font-bold ${readinessPct >= 80 ? "text-emerald-200" : readinessPct >= 50 ? "text-amber-200" : "text-red-200"}`}>
            {readinessPct}%
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-fit rounded-xl border border-white/10 bg-black/45">
          <TabsTrigger value="compliance" className="font-mono text-[0.68rem] uppercase">Compliance</TabsTrigger>
          <TabsTrigger value="covenants" className="font-mono text-[0.68rem] uppercase">Covenants</TabsTrigger>
          <TabsTrigger value="memo" className="font-mono text-[0.68rem] uppercase">Legal Memo</TabsTrigger>
        </TabsList>

        {/* Compliance Checklist */}
        <TabsContent value="compliance" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm text-[#7A9A82]">
              {completed}/{checklist.length} items · {requiredComplete}/{required} required
            </p>
          </div>

          {categories.map((cat) => (
            <div key={cat}>
              <h4 className="mb-2 flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7A9A82]">
                <Shield size={12} /> {cat}
              </h4>
              <div className="space-y-1">
                {checklist.filter((c) => c.category === cat).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left transition hover:border-white/15"
                  >
                    {item.completed ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    ) : (
                      <div className={`h-4 w-4 shrink-0 rounded-full border ${item.required ? "border-amber-300/50" : "border-[#1E4A2E]"}`} />
                    )}
                    <span className={`font-mono text-sm ${item.completed ? "text-[#7A9A82] line-through" : "text-white"}`}>
                      {item.item}
                    </span>
                    {item.required && !item.completed && (
                      <span className="ml-auto rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 font-mono text-[0.52rem] uppercase text-amber-200">required</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Covenant Monitor */}
        <TabsContent value="covenants" className="space-y-4 mt-4">
          <Button onClick={runCovenantReview} disabled={covenantMutation.isPending}
            className="rounded-xl border border-[#C4A048]/35 bg-[#C4A048]/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-[#EDE8DC] hover:bg-[#C4A048]/20">
            {covenantMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Scale className="mr-2 h-3.5 w-3.5" />}
            Run Covenant Review
          </Button>

          {covenantMutation.data && (
            <>
              <div className="flex gap-3">
                <div className={`rounded-xl border p-3 text-center ${(covenantMutation.data as any).overall_status === "compliant" ? "border-emerald-300/30 bg-emerald-400/10" : "border-red-400/30 bg-red-500/10"}`}>
                  <p className="font-mono text-[0.56rem] uppercase text-[#7A9A82]">Status</p>
                  <p className={`font-mono text-lg font-bold uppercase ${(covenantMutation.data as any).overall_status === "compliant" ? "text-emerald-200" : "text-red-200"}`}>
                    {(covenantMutation.data as any).overall_status}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
                  <p className="font-mono text-[0.56rem] uppercase text-[#7A9A82]">Compliant</p>
                  <p className="font-mono text-lg font-bold text-emerald-200">{(covenantMutation.data as any).compliant}/{(covenantMutation.data as any).total}</p>
                </div>
                {(covenantMutation.data as any).breaches > 0 && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center">
                    <p className="font-mono text-[0.56rem] uppercase text-[#7A9A82]">Breaches</p>
                    <p className="font-mono text-lg font-bold text-red-200">{(covenantMutation.data as any).breaches}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {(covenantMutation.data as any).covenants?.map((cov: any) => (
                  <div key={cov.name} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${cov.compliant ? "border-emerald-300/20 bg-emerald-400/5" : "border-red-400/25 bg-red-500/8"}`}>
                    <div className="flex items-center gap-2">
                      {cov.compliant ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-red-400" />}
                      <span className="font-mono text-sm text-white">{cov.name}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-sm">
                      <span className="text-[#7A9A82]">{cov.type === "minimum" ? "Min" : "Max"}: {cov.threshold}</span>
                      <span className={cov.compliant ? "text-emerald-200" : "text-red-200"}>Current: {cov.current}</span>
                      <span className={`font-semibold ${cov.headroom >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                        Headroom: {cov.headroom >= 0 ? "+" : ""}{cov.headroom.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Legal Memo */}
        <TabsContent value="memo" className="space-y-4 mt-4">
          <Button onClick={generateLegalMemo} disabled={legalMemoMutation.isPending}
            className="rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-amber-100 hover:bg-amber-300/20">
            {legalMemoMutation.isPending ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Generating...</> : <><FileText className="mr-2 h-3.5 w-3.5" /> Generate Bond Counsel Memo</>}
          </Button>

          {legalMemoMutation.data && (
            <div className="rounded-2xl border border-amber-300/20 bg-black/35 p-5">
              <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
                <BookOpen size={14} /> AI Legal Opinion
              </div>
              <div className="mt-3 whitespace-pre-wrap font-mono text-sm leading-7 text-[#EDE8DC]">
                {(legalMemoMutation.data as any).content}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
