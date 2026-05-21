import { useState } from "react";
import { Loader2, FolderOpen, FileCheck2, CheckCircle2, Circle, AlertTriangle, BarChart3, Shield, Leaf, ShieldCheck, ClipboardCheck, FileText, Calculator, BookOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

// ══════════════════════════════════════════════════════════════════
// DOCUMENT VAULT — every doc needed for bond issuance
// ══════════════════════════════════════════════════════════════════

const DOC_CATEGORIES = [
  {
    name: "Financial", icon: BarChart3, items: [
      { id: "d1", label: "3-Year Audited Financials", required: true },
      { id: "d2", label: "Proforma / Operating Budget", required: true },
      { id: "d3", label: "Tax Returns (3 years)", required: true },
      { id: "d4", label: "Bank Statements (12 months)", required: true },
      { id: "d5", label: "Sponsor Personal Financial Statement", required: true },
      { id: "d6", label: "Interim Financial Statements", required: false },
    ],
  },
  {
    name: "Legal & Entity", icon: Shield, items: [
      { id: "d7", label: "SPE Operating Agreement", required: true },
      { id: "d8", label: "Articles of Organization", required: true },
      { id: "d9", label: "Good Standing Certificate", required: true },
      { id: "d10", label: "Title Report / Commitment", required: true },
      { id: "d11", label: "Environmental Phase I", required: true },
      { id: "d12", label: "Survey / ALTA", required: true },
      { id: "d13", label: "Zoning Confirmation Letter", required: true },
    ],
  },
  {
    name: "Construction", icon: FolderOpen, items: [
      { id: "d14", label: "GMP Contract", required: true },
      { id: "d15", label: "Architect Plans (stamped)", required: true },
      { id: "d16", label: "Geotechnical Report", required: false },
      { id: "d17", label: "Building Permits", required: true },
      { id: "d18", label: "Construction Timeline / Gantt", required: true },
      { id: "d19", label: "Contractor License & Insurance", required: true },
    ],
  },
  {
    name: "Market & Feasibility", icon: Leaf, items: [
      { id: "d20", label: "Market Feasibility Study", required: true },
      { id: "d21", label: "Appraisal (USPAP)", required: true },
      { id: "d22", label: "Competitive Set Analysis", required: false },
      { id: "d23", label: "Demand / Absorption Study", required: true },
      { id: "d24", label: "Management Agreement", required: true },
    ],
  },
  {
    name: "Insurance & Surety", icon: ShieldCheck, items: [
      { id: "d25", label: "Surety Bond Application (Hylant)", required: true },
      { id: "d26", label: "Builder's Risk Insurance", required: true },
      { id: "d27", label: "General Liability COI", required: true },
      { id: "d28", label: "D&O Insurance", required: false },
      { id: "d29", label: "Performance Bond (if applicable)", required: false },
      { id: "d30", label: "Payment Bond", required: false },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════
// PROJECT READINESS CHECKLIST — dynamic toggle
// ══════════════════════════════════════════════════════════════════

const READINESS_CHECKLIST = [
  { id: "r1", category: "Site", label: "Site control confirmed (ownership or option)", required: true },
  { id: "r2", category: "Site", label: "Zoning entitlements approved", required: true },
  { id: "r3", category: "Site", label: "Utility connections confirmed", required: true },
  { id: "r4", category: "Design", label: "Schematic design complete", required: true },
  { id: "r5", category: "Design", label: "Design development 60%+", required: true },
  { id: "r6", category: "Design", label: "Construction documents issued", required: false },
  { id: "r7", category: "Financial", label: "Proforma validated by 3rd party", required: true },
  { id: "r8", category: "Financial", label: "Sources & uses balanced", required: true },
  { id: "r9", category: "Financial", label: "Sponsor equity committed", required: true },
  { id: "r10", category: "Financial", label: "Interest reserve pre-funded", required: true },
  { id: "r11", category: "Regulatory", label: "CON (Certificate of Need) obtained", required: false },
  { id: "r12", category: "Regulatory", label: "State licensing application filed", required: true },
  { id: "r13", category: "Regulatory", label: "Environmental clearance", required: true },
  { id: "r14", category: "Surety", label: "Hylant submission package complete", required: true },
  { id: "r15", category: "Surety", label: "Surety bond indicative terms received", required: true },
  { id: "r16", category: "Surety", label: "3C analysis complete (Character, Capacity, Capital)", required: true },
  { id: "r17", category: "Credit", label: "Credit memo drafted", required: true },
  { id: "r18", category: "Credit", label: "Maxwell scoring complete", required: true },
  { id: "r19", category: "Credit", label: "Stress test scenarios run", required: true },
  { id: "r20", category: "Credit", label: "Rating agency pre-screen (if applicable)", required: false },
];

function money(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  return `$${val.toLocaleString()}`;
}

export default function RootsWorkspace({ dealId, summaryMode }: { dealId?: string; summaryMode?: boolean }) {
  const [subTab, setSubTab] = useState("vault");
  const [docStatus, setDocStatus] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    DOC_CATEGORIES.forEach((c) => c.items.forEach((i) => { init[i.id] = "missing"; }));
    // Seed some as uploaded for demo
    ["d1", "d2", "d4", "d7", "d8", "d11", "d14", "d15", "d18", "d20", "d21", "d25", "d27"].forEach((id) => { init[id] = "uploaded"; });
    ["d5", "d9", "d17", "d23"].forEach((id) => { init[id] = "review"; });
    return init;
  });
  const [readinessStatus, setReadinessStatus] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    READINESS_CHECKLIST.forEach((i) => { init[i.id] = false; });
    ["r1", "r2", "r4", "r7", "r8", "r9"].forEach((id) => { init[id] = true; });
    return init;
  });

  const rmaMutation = trpc.ratingEsg.rmaBenchmark.useMutation();
  const esgMutation = trpc.ratingEsg.esgScore.useMutation();
  const ratingMutation = trpc.ratingEsg.ratingAssess.useMutation();
  const creditMemoMutation = trpc.powerstrip.route.useMutation();

  // Doc vault stats
  const allDocs = DOC_CATEGORIES.flatMap((c) => c.items);
  const requiredDocs = allDocs.filter((i) => i.required);
  const uploadedRequired = requiredDocs.filter((i) => docStatus[i.id] === "uploaded").length;
  const docReadiness = Math.round((uploadedRequired / requiredDocs.length) * 100);

  // Readiness stats
  const requiredChecks = READINESS_CHECKLIST.filter((i) => i.required);
  const completedChecks = requiredChecks.filter((i) => readinessStatus[i.id]).length;
  const checkReadiness = Math.round((completedChecks / requiredChecks.length) * 100);

  // Overall
  const overallReadiness = Math.round((docReadiness + checkReadiness) / 2);

  const toggleDoc = (id: string) => {
    setDocStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "uploaded" ? "missing" : prev[id] === "missing" ? "uploaded" : "uploaded",
    }));
  };

  const toggleCheck = (id: string) => {
    setReadinessStatus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
          <FolderOpen size={14} /> Roots
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Docs</p>
            <p className="font-mono text-xl font-semibold text-white">{docReadiness}%</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Readiness</p>
            <p className="font-mono text-xl font-semibold text-amber-100">{checkReadiness}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            <FolderOpen size={17} /> Roots — Arrangement & Readiness Engine
          </div>
          <p className="mt-1 text-sm text-slate-400">Document vault, project readiness, surety prep, audit, feasibility, RMA spreads, credit memo — all groundwork before it becomes a bond.</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Overall Readiness</p>
          <p className={`font-mono text-2xl font-bold ${overallReadiness >= 75 ? "text-emerald-200" : overallReadiness >= 50 ? "text-amber-200" : "text-red-200"}`}>
            {overallReadiness}%
          </p>
        </div>
      </div>

      <Progress value={overallReadiness} className="h-3" />

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="flex w-full overflow-x-auto rounded-xl border border-white/10 bg-black/45">
          <TabsTrigger value="vault" className="font-mono text-[0.62rem] uppercase"><FolderOpen size={12} className="mr-1" /> Doc Vault</TabsTrigger>
          <TabsTrigger value="readiness" className="font-mono text-[0.62rem] uppercase"><ClipboardCheck size={12} className="mr-1" /> Readiness</TabsTrigger>
          <TabsTrigger value="surety" className="font-mono text-[0.62rem] uppercase"><ShieldCheck size={12} className="mr-1" /> Surety</TabsTrigger>
          <TabsTrigger value="rma" className="font-mono text-[0.62rem] uppercase"><BarChart3 size={12} className="mr-1" /> RMA</TabsTrigger>
          <TabsTrigger value="credit" className="font-mono text-[0.62rem] uppercase"><Calculator size={12} className="mr-1" /> Credit Memo</TabsTrigger>
          <TabsTrigger value="esg" className="font-mono text-[0.62rem] uppercase"><Leaf size={12} className="mr-1" /> ESG</TabsTrigger>
        </TabsList>

        {/* ── DOCUMENT VAULT ──────────────────────────────────────── */}
        <TabsContent value="vault" className="mt-4 space-y-4">
          <div className="flex items-center gap-4 font-mono text-[0.62rem] text-slate-400">
            <span className="text-emerald-200">{uploadedRequired}/{requiredDocs.length} required uploaded</span>
            <span className="text-amber-200">{allDocs.filter((i) => docStatus[i.id] === "review").length} in review</span>
            <span className="text-red-200">{allDocs.filter((i) => i.required && docStatus[i.id] === "missing").length} required missing</span>
          </div>

          {DOC_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const catUploaded = cat.items.filter((i) => docStatus[i.id] === "uploaded").length;
            return (
              <div key={cat.name} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">
                    <Icon size={14} className="text-emerald-300" /> {cat.name}
                  </div>
                  <span className="font-mono text-[0.56rem] text-slate-400">{catUploaded}/{cat.items.length}</span>
                </div>
                <div className="space-y-1">
                  {cat.items.map((item) => {
                    const st = docStatus[item.id];
                    const isOn = st === "uploaded";
                    const isReview = st === "review";
                    return (
                      <button key={item.id} onClick={() => toggleDoc(item.id)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                          isOn ? "border-emerald-300/30 bg-emerald-400/8 shadow-[0_0_20px_rgba(52,211,153,0.10)]"
                          : isReview ? "border-amber-300/25 bg-amber-300/6 shadow-[0_0_16px_rgba(251,191,36,0.08)]"
                          : "border-white/5 bg-white/[0.015]"
                        } hover:border-white/20`}>
                        <div className="flex items-center gap-3">
                          {isOn ? <CheckCircle2 size={16} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                           : isReview ? <AlertTriangle size={16} className="text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                           : <Circle size={16} className="text-slate-600" />}
                          <span className={`font-mono text-sm ${isOn ? "text-white" : "text-slate-400"}`}>{item.label}</span>
                          {item.required && st === "missing" && (
                            <span className="rounded-full border border-red-400/30 bg-red-500/10 px-2 py-0.5 font-mono text-[0.52rem] uppercase text-red-200">required</span>
                          )}
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.52rem] uppercase ${
                          isOn ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                          : isReview ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
                          : "border-slate-600 text-slate-500"
                        }`}>{isOn ? "Uploaded" : isReview ? "Review" : "Missing"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* ── PROJECT READINESS ────────────────────────────────────── */}
        <TabsContent value="readiness" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[0.62rem] text-slate-400">{completedChecks}/{requiredChecks.length} required items complete</p>
            <span className={`font-mono text-lg font-bold ${checkReadiness >= 75 ? "text-emerald-200" : "text-amber-200"}`}>{checkReadiness}%</span>
          </div>
          <Progress value={checkReadiness} className="h-2" />

          {Array.from(new Set(READINESS_CHECKLIST.map((i) => i.category))).map((cat) => (
            <div key={cat}>
              <h4 className="mb-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{cat}</h4>
              <div className="space-y-1">
                {READINESS_CHECKLIST.filter((i) => i.category === cat).map((item) => {
                  const done = readinessStatus[item.id];
                  return (
                    <button key={item.id} onClick={() => toggleCheck(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                        done ? "border-emerald-300/30 bg-emerald-400/8 shadow-[0_0_16px_rgba(52,211,153,0.08)]"
                        : "border-white/5 bg-white/[0.015]"
                      } hover:border-white/20`}>
                      <div className="flex items-center gap-3">
                        {done ? <CheckCircle2 size={16} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                         : <Circle size={16} className="text-slate-600" />}
                        <span className={`font-mono text-sm ${done ? "text-white" : "text-slate-400"}`}>{item.label}</span>
                      </div>
                      {item.required && !done && (
                        <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 font-mono text-[0.52rem] uppercase text-amber-200">required</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ── SURETY READINESS ────────────────────────────────────── */}
        <TabsContent value="surety" className="mt-4 space-y-4">
          <SuretyReadinessPanel ratingMutation={ratingMutation} />
        </TabsContent>

        {/* ── RMA SPREADS ─────────────────────────────────────────── */}
        <TabsContent value="rma" className="mt-4 space-y-4">
          <RMAPanel rmaMutation={rmaMutation} />
        </TabsContent>

        {/* ── CREDIT MEMO ─────────────────────────────────────────── */}
        <TabsContent value="credit" className="mt-4 space-y-4">
          <CreditMemoPanel creditMemoMutation={creditMemoMutation} ratingMutation={ratingMutation} />
        </TabsContent>

        {/* ── ESG ─────────────────────────────────────────────────── */}
        <TabsContent value="esg" className="mt-4 space-y-4">
          <ESGPanel esgMutation={esgMutation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SURETY READINESS
// ══════════════════════════════════════════════════════════════════

function SuretyReadinessPanel({ ratingMutation }: { ratingMutation: any }) {
  const HYLANT_REQS = [
    { id: "h1", label: "Appraisal (USPAP compliant)", status: "complete" },
    { id: "h2", label: "Phase I Environmental", status: "complete" },
    { id: "h3", label: "GMP Contract", status: "complete" },
    { id: "h4", label: "Sponsor Financial Statements (3yr)", status: "pending" },
    { id: "h5", label: "Proforma (36-month NOI ramp)", status: "complete" },
    { id: "h6", label: "Feasibility Study", status: "pending" },
    { id: "h7", label: "3C Analysis (Character, Capacity, Capital)", status: "pending" },
  ];

  const complete = HYLANT_REQS.filter((r) => r.status === "complete").length;
  const pct = Math.round((complete / HYLANT_REQS.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
          <ShieldCheck size={14} /> Hylant Surety Submission Readiness
        </div>
        <span className={`font-mono text-lg font-bold ${pct >= 75 ? "text-emerald-200" : "text-amber-200"}`}>{pct}%</span>
      </div>
      <Progress value={pct} className="h-2" />

      <div className="rounded-2xl border border-amber-300/25 bg-black/35 p-4 space-y-1">
        {HYLANT_REQS.map((req) => (
          <div key={req.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
            req.status === "complete"
              ? "border-emerald-300/25 bg-emerald-400/6 shadow-[0_0_14px_rgba(52,211,153,0.08)]"
              : "border-white/5 bg-white/[0.015]"
          }`}>
            <div className="flex items-center gap-3">
              {req.status === "complete"
                ? <CheckCircle2 size={16} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                : <Circle size={16} className="text-slate-600" />}
              <span className={`font-mono text-sm ${req.status === "complete" ? "text-white" : "text-slate-400"}`}>{req.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Provider", value: "Hylant Insurance", sub: "A+ rated" },
          { label: "Premium", value: "8.5%", sub: "Performance surety" },
          { label: "Max Bond", value: "$500M", sub: "Capacity" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-center">
            <p className="font-mono text-[0.56rem] uppercase text-slate-500">{m.label}</p>
            <p className="font-mono text-lg font-bold text-amber-100">{m.value}</p>
            <p className="font-mono text-[0.52rem] text-slate-500">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// RMA SPREADS
// ══════════════════════════════════════════════════════════════════

function RMAPanel({ rmaMutation }: { rmaMutation: any }) {
  const [naics, setNaics] = useState("6232");
  const comparison = (rmaMutation.data as any)?.comparison;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-200">RMA Industry Benchmark Spreads</h3>
        <div className="flex gap-2">
          <select value={naics} onChange={(e) => setNaics(e.target.value)} className="rounded-xl border border-emerald-300/20 bg-black/45 px-3 py-2 font-mono text-sm text-slate-100 outline-none">
            <option value="6232">Assisted Living</option>
            <option value="6231">Nursing Care</option>
            <option value="5311">Property Mgmt</option>
          </select>
          <Button onClick={() => rmaMutation.mutate({ naics })} disabled={rmaMutation.isPending}
            className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20">
            {rmaMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Compare"}
          </Button>
        </div>
      </div>
      {comparison && (
        <div className="space-y-1">
          {Object.entries(comparison).map(([metric, data]: [string, any]) => (
            <div key={metric} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
              data.status === "above" ? "border-emerald-300/25 bg-emerald-400/6 shadow-[0_0_14px_rgba(52,211,153,0.08)]" : "border-red-400/20 bg-red-500/5"
            }`}>
              <span className="font-mono text-sm text-white">{metric.replace(/_/g, " ")}</span>
              <div className="flex items-center gap-4 font-mono text-sm">
                <span className="text-slate-400">Bench: {data.benchmark}</span>
                <span className={data.status === "above" ? "text-emerald-200" : "text-red-200"}>Actual: {data.actual}</span>
                <span className={`font-semibold ${data.delta >= 0 ? "text-emerald-300" : "text-red-300"}`}>{data.delta >= 0 ? "+" : ""}{data.delta}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CREDIT MEMO
// ══════════════════════════════════════════════════════════════════

function CreditMemoPanel({ creditMemoMutation, ratingMutation }: { creditMemoMutation: any; ratingMutation: any }) {
  const runCreditMemo = () => {
    // Run rating first
    ratingMutation.mutate({
      stabilized_noi_usd: 12_000_000, a_tranche_usd: 112_500_000, b_tranche_usd: 10_500_000,
      a_coupon_pct: 6.5, b_coupon_pct: 11, total_project_cost_usd: 150_000_000,
      appraised_value_usd: 180_000_000, sponsor_equity_usd: 37_500_000, ebitda_usd: 10_200_000,
    });
    // Generate memo
    creditMemoMutation.mutate({
      taskType: "credit_memo",
      prompt: `Generate a full credit memo for a NEST dual-tranche senior living bond:
      - $150M total project cost, $112.5M Series A (6.5%), $10.5M Series B (11%)
      - Stabilized NOI: $12M, DSCR: 1.64x, LTV: 68%, Obligor grade: BBB+
      - Hylant surety wrap, Jacaranda Trace PLOM as structural template
      - Include: Executive Summary, Credit Strengths, Risk Factors, Financial Analysis, Structure, Recommendation
      - Jimmy Lee tone. Lead with the recommendation.`,
    });
  };

  const rating = (ratingMutation.data ?? {}) as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">Credit Memo & Rating</h3>
        <Button onClick={runCreditMemo} disabled={creditMemoMutation.isPending}
          className="rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-amber-100 hover:bg-amber-300/20">
          {creditMemoMutation.isPending ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Generating...</> : <><FileText className="mr-2 h-3.5 w-3.5" /> Generate Credit Memo</>}
        </Button>
      </div>

      {rating && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Rating", value: rating.indicative_rating, tone: "text-amber-100" },
            { label: "DSCR", value: `${rating.credit_metrics?.dscr}x`, tone: "text-emerald-200" },
            { label: "LTV", value: `${rating.credit_metrics?.ltv_pct}%`, tone: rating.credit_metrics?.ltv_pct > 75 ? "text-red-200" : "text-amber-100" },
            { label: "Score", value: `${rating.deal_score}/100`, tone: "text-white" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <p className="font-mono text-[0.56rem] uppercase text-slate-500">{m.label}</p>
              <p className={`font-mono text-xl font-bold ${m.tone}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {creditMemoMutation.data && (
        <div className="rounded-2xl border border-amber-300/20 bg-black/35 p-5">
          <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
            <BookOpen size={14} /> AI Credit Memo
          </div>
          <div className="mt-3 whitespace-pre-wrap font-mono text-sm leading-7 text-slate-300">
            {(creditMemoMutation.data as any).content}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ESG
// ══════════════════════════════════════════════════════════════════

function ESGPanel({ esgMutation }: { esgMutation: any }) {
  const data = (esgMutation.data ?? {}) as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">ESG Scoring & Green Bond Eligibility</h3>
        <Button onClick={() => esgMutation.mutate({ scores: {} })} disabled={esgMutation.isPending}
          className="rounded-xl border border-cyan-300/35 bg-cyan-400/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-cyan-100 hover:bg-cyan-400/20">
          {esgMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Run ESG Score"}
        </Button>
      </div>
      {data && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
              <p className="font-mono text-[0.56rem] uppercase text-slate-500">Composite</p>
              <p className="font-mono text-2xl font-bold text-white">{data.composite_score}</p>
              <p className="font-mono text-[0.52rem] text-slate-500">Grade: {data.esg_grade}</p>
            </div>
            {["environmental", "social", "governance"].map((pillar) => {
              const colors: Record<string, string> = { environmental: "text-emerald-200 border-emerald-300/25 bg-emerald-400/8", social: "text-cyan-200 border-cyan-300/25 bg-cyan-400/8", governance: "text-amber-200 border-amber-300/25 bg-amber-300/8" };
              return (
                <div key={pillar} className={`rounded-xl border p-3 text-center ${colors[pillar]}`}>
                  <p className="font-mono text-[0.56rem] uppercase text-slate-500">{pillar}</p>
                  <p className="font-mono text-2xl font-bold">{data.pillar_scores?.[pillar]?.score ?? "—"}</p>
                </div>
              );
            })}
          </div>
          <div className={`rounded-xl border p-3 text-center ${data.bond_impact?.includes("Green") ? "border-emerald-300/30 bg-emerald-400/8" : "border-white/10 bg-white/[0.035]"}`}>
            <p className={`font-mono text-sm font-semibold ${data.bond_impact?.includes("Green") ? "text-emerald-200" : "text-slate-400"}`}>{data.bond_impact}</p>
          </div>
        </>
      )}
    </div>
  );
}
