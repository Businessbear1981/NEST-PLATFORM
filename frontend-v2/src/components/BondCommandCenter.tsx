import { useState } from "react";
import { Loader2, RefreshCw, Eye, Layers3, Target, TrendingUp, ShieldCheck, Scale, Gavel, Bot, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import NestMark from "./NestMark";

import EagleEyeScoutDashboard from "./EagleEyeScoutDashboard";
import EagleEyeV2 from "./EagleEyeV2";
import RootsWorkspace from "./RootsWorkspace";
import StructuringStudio from "./StructuringStudio";
import HawkeyePlacementScout from "./HawkeyePlacementScout";
import RatingIntelligenceHub from "./RatingIntelligenceHub";
import SuretyUnderwritingDashboard from "./SuretyUnderwritingDashboard";
import ClimateResilienceDashboard from "./ClimateResilienceDashboard";
import TrusteeManagementPanel from "./TrusteeManagementPanel";
import AtticusDashboard from "./AtticusDashboard";
import NightVisionComplianceLair from "./NightVisionComplianceLair";
import DucklingAgentFlow from "./DucklingAgentFlow";

const PILLAR_TABS = [
  { value: "overview", label: "Overview", icon: Bot },
  { value: "eagleeye-v2", label: "EagleEye V2", icon: Zap },
  { value: "eagleeye", label: "EagleEye", icon: Eye },
  { value: "roots", label: "Roots", icon: TrendingUp },
  { value: "bonddesk", label: "Bond Desk", icon: Layers3 },
  { value: "hawkeye", label: "Hawkeye", icon: Target },
  { value: "rating", label: "Rating", icon: TrendingUp },
  { value: "surety", label: "Surety", icon: ShieldCheck },
  { value: "atticus", label: "Atticus", icon: Gavel },
  { value: "nightvision", label: "NightVision", icon: Shield },
  { value: "trustee", label: "Trustee", icon: Scale },
] as const;

export default function BondCommandCenter({ dealId }: { dealId: string }) {
  const [activeTab, setActiveTab] = useState("overview");

  const workflowQuery = trpc.bondWorkflow.getByDeal.useQuery({ dealId });
  const runEvaluation = trpc.bondWorkflow.runFullAIEvaluation.useMutation({
    onSuccess: () => workflowQuery.refetch(),
  });

  const workflow = (workflowQuery.data ?? {}) as any;
  const overallScore = workflow?.overallReadinessScore ?? 0;
  const pillarScores = workflow?.pillarScores ?? {};

  return (
    <div className="space-y-6">
      {/* ── HERO: King Chess Piece / NEST Tree — always centered ── */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-amber-300/25 bg-gradient-to-b from-[#0a1f16]/95 via-[#071a13]/90 to-black/85 py-10 shadow-[0_0_100px_rgba(201,168,76,0.12)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,168,76,0.12),transparent_60%)]" />
        <div className="relative rounded-2xl bg-[#0a1f16] p-4 shadow-[0_0_60px_rgba(201,168,76,0.40),0_0_120px_rgba(201,168,76,0.15)]">
          <NestMark size={88} />
        </div>
        <h1 className="relative mt-5 text-4xl font-bold tracking-[0.14em] text-amber-200/90" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          NEST ADVISORS
        </h1>
        <p className="relative mt-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Arden Edge Capital × Soparrow Capital
        </p>
        <p className="relative mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-slate-600">
          Bond Command Center · Deal {dealId}
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-[0.04em] text-white">Bond Command Center</h1>
          <p className="mt-1 text-sm text-slate-400">
            Deal {dealId} — {workflow?.phase ?? "loading"} phase
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Readiness</p>
            <p className={`font-mono text-2xl font-bold ${overallScore >= 70 ? "text-emerald-200" : overallScore >= 40 ? "text-amber-200" : "text-red-200"}`}>
              {overallScore}%
            </p>
          </div>
          <Button
            onClick={() => runEvaluation.mutate({ dealId })}
            disabled={runEvaluation.isPending}
            className="rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.13)] hover:bg-amber-300/20"
          >
            {runEvaluation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Run Full AI Evaluation
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={overallScore} className="h-3" />

      {/* Pillar score cards */}
      {workflow && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "EagleEye", score: pillarScores.eagleeye, color: "cyan", desc: "Sourcing" },
            { label: "Roots", score: pillarScores.roots, color: "emerald", desc: "Readiness" },
            { label: "Bond Desk", score: pillarScores.bondDesk, color: "amber", desc: "Structuring" },
            { label: "Hawkeye", score: pillarScores.hawkeye, color: "fuchsia", desc: "Placement" },
          ].map((p) => {
            const tone = {
              cyan: "border-cyan-300/30 bg-cyan-400/8 text-cyan-200",
              emerald: "border-emerald-300/30 bg-emerald-400/8 text-emerald-200",
              amber: "border-amber-300/30 bg-amber-300/8 text-amber-200",
              fuchsia: "border-fuchsia-300/30 bg-fuchsia-500/8 text-fuchsia-200",
            }[p.color] ?? "";
            return (
              <div key={p.label} className={`rounded-xl border p-3 ${tone}`}>
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em]">{p.label}</p>
                <p className="mt-1 font-mono text-xl font-bold text-white">{p.score ?? "—"}</p>
                <p className="font-mono text-[0.52rem] uppercase text-slate-400">{p.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Assessment */}
      {workflow?.aiAssessment && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="font-mono text-sm leading-6 text-slate-300">{workflow.aiAssessment}</p>
        </div>
      )}

      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto rounded-xl border border-white/10 bg-black/45">
          {PILLAR_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase">
                <Icon size={13} /> {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Overview — Agent flow + summaries */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <DucklingAgentFlow />
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-cyan-300/25 bg-black/35 shadow-[0_0_32px_rgba(34,211,238,0.06)]">
              <EagleEyeScoutDashboard summaryMode />
            </div>
            <div className="rounded-2xl border border-emerald-300/25 bg-black/35 shadow-[0_0_32px_rgba(52,211,153,0.06)]">
              <RootsWorkspace dealId={dealId} summaryMode />
            </div>
            <div className="rounded-2xl border border-cyan-300/25 bg-black/35 shadow-[0_0_32px_rgba(34,211,238,0.06)]">
              <ClimateResilienceDashboard dealId={dealId} summaryMode />
            </div>
          </div>
        </TabsContent>

        {/* Full views */}
        <TabsContent value="eagleeye-v2" className="mt-4"><EagleEyeV2 /></TabsContent>
        <TabsContent value="eagleeye" className="mt-4"><EagleEyeScoutDashboard /></TabsContent>
        <TabsContent value="roots" className="mt-4"><RootsWorkspace dealId={dealId} /></TabsContent>
        <TabsContent value="bonddesk" className="mt-4"><StructuringStudio dealId={dealId} /></TabsContent>
        <TabsContent value="hawkeye" className="mt-4"><HawkeyePlacementScout dealId={dealId} /></TabsContent>
        <TabsContent value="rating" className="mt-4"><RatingIntelligenceHub dealId={dealId} /></TabsContent>
        <TabsContent value="surety" className="mt-4"><SuretyUnderwritingDashboard dealId={dealId} /></TabsContent>
        <TabsContent value="atticus" className="mt-4"><AtticusDashboard dealId={dealId} /></TabsContent>
        <TabsContent value="nightvision" className="mt-4"><NightVisionComplianceLair dealId={dealId} /></TabsContent>
        <TabsContent value="trustee" className="mt-4"><TrusteeManagementPanel dealId={dealId} /></TabsContent>
      </Tabs>
    </div>
  );
}
