import { useState } from "react";
import { Loader2, Eye, Shield, AlertTriangle, CheckCircle2, Lock, Scan, FileWarning, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

const REGULATORY_DOMAINS = [
  {
    id: "sec", name: "SEC / Securities", icon: Shield,
    checks: [
      { id: "sec_1", rule: "Reg D 506(c) — accredited investor verification", status: "pass" },
      { id: "sec_2", rule: "Form D filing — within 15 days of first sale", status: "pass" },
      { id: "sec_3", rule: "Blue Sky compliance — all target states", status: "warning" },
      { id: "sec_4", rule: "Anti-fraud provisions — PPM disclosure review", status: "pass" },
      { id: "sec_5", rule: "General solicitation — advertising compliance", status: "pass" },
    ],
  },
  {
    id: "finra", name: "FINRA", icon: Lock,
    checks: [
      { id: "fin_1", rule: "Broker-dealer registration — placement agent", status: "pass" },
      { id: "fin_2", rule: "Suitability — investor qualification", status: "pass" },
      { id: "fin_3", rule: "Communications — marketing material review", status: "warning" },
    ],
  },
  {
    id: "bsa_aml", name: "BSA / AML", icon: Scan,
    checks: [
      { id: "aml_1", rule: "KYC — all investors verified", status: "pass" },
      { id: "aml_2", rule: "AML screening — OFAC/SDN list check", status: "pass" },
      { id: "aml_3", rule: "SAR filing procedures — documented", status: "pass" },
      { id: "aml_4", rule: "CDD — beneficial ownership identified", status: "pass" },
    ],
  },
  {
    id: "state", name: "State Licensing", icon: FileWarning,
    checks: [
      { id: "st_1", rule: "Certificate of Need (CON) — if applicable", status: "na" },
      { id: "st_2", rule: "Senior living licensure — state-specific", status: "warning" },
      { id: "st_3", rule: "Healthcare facility permits", status: "pass" },
      { id: "st_4", rule: "Environmental compliance — Phase I/II", status: "pass" },
    ],
  },
  {
    id: "tax", name: "Tax / IRS", icon: Activity,
    checks: [
      { id: "tx_1", rule: "Tax-exempt bond eligibility analysis", status: "review" },
      { id: "tx_2", rule: "Private activity bond volume cap", status: "review" },
      { id: "tx_3", rule: "Arbitrage rebate requirements", status: "pass" },
    ],
  },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  pass: { color: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200", label: "PASS" },
  warning: { color: "border-amber-300/30 bg-amber-300/10 text-amber-200", label: "WARNING" },
  fail: { color: "border-red-400/30 bg-red-500/10 text-red-200", label: "FAIL" },
  review: { color: "border-cyan-300/30 bg-cyan-400/10 text-cyan-200", label: "REVIEW" },
  na: { color: "border-slate-400/30 bg-slate-500/10 text-slate-300", label: "N/A" },
};

export default function NightVisionComplianceLair({ dealId }: { dealId?: string }) {
  const [domains, setDomains] = useState(REGULATORY_DOMAINS);
  const [activeTab, setActiveTab] = useState("overview");

  const complianceScanMutation = trpc.powerstrip.route.useMutation();

  const allChecks = domains.flatMap((d) => d.checks);
  const passCount = allChecks.filter((c) => c.status === "pass").length;
  const warnCount = allChecks.filter((c) => c.status === "warning").length;
  const failCount = allChecks.filter((c) => c.status === "fail").length;
  const reviewCount = allChecks.filter((c) => c.status === "review").length;
  const applicableChecks = allChecks.filter((c) => c.status !== "na").length;
  const compliancePct = Math.round((passCount / applicableChecks) * 100);

  const runComplianceScan = () => {
    complianceScanMutation.mutate({
      taskType: "risk_assessment",
      prompt: `Run a compliance scan for a NEST dual-tranche senior living bond offering.
      Assess: SEC Reg D 506(c) compliance, FINRA broker-dealer requirements,
      BSA/AML investor screening, state licensing for senior living in FL/TX/AZ,
      and tax-exempt bond eligibility. Identify any red flags or action items.
      Format as a bullet-point compliance report. Be specific and decisive.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            <Eye size={17} className="text-emerald-400" /> NightVision — Compliance Lair
          </div>
          <p className="mt-1 text-sm text-slate-400">Regulatory compliance monitoring, audit readiness, and risk detection.</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Compliance Score</p>
          <p className={`font-mono text-2xl font-bold ${compliancePct >= 80 ? "text-emerald-200" : compliancePct >= 60 ? "text-amber-200" : "text-red-200"}`}>
            {compliancePct}%
          </p>
        </div>
      </div>

      {/* Status summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pass", count: passCount, color: "text-emerald-200 border-emerald-300/30 bg-emerald-400/8" },
          { label: "Warnings", count: warnCount, color: "text-amber-200 border-amber-300/30 bg-amber-300/8" },
          { label: "Failures", count: failCount, color: "text-red-200 border-red-400/30 bg-red-500/8" },
          { label: "Review", count: reviewCount, color: "text-cyan-200 border-cyan-300/30 bg-cyan-400/8" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em]">{s.label}</p>
            <p className="font-mono text-2xl font-bold">{s.count}</p>
          </div>
        ))}
      </div>

      <Progress value={compliancePct} className="h-2" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-fit rounded-xl border border-white/10 bg-black/45">
          <TabsTrigger value="overview" className="font-mono text-[0.68rem] uppercase">All Domains</TabsTrigger>
          <TabsTrigger value="scan" className="font-mono text-[0.68rem] uppercase">AI Scan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {domains.map((domain) => {
            const Icon = domain.icon;
            const domainPass = domain.checks.filter((c) => c.status === "pass").length;
            const domainTotal = domain.checks.filter((c) => c.status !== "na").length;
            return (
              <div key={domain.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">
                    <Icon size={14} className="text-emerald-300" /> {domain.name}
                  </div>
                  <span className="font-mono text-[0.56rem] text-slate-400">{domainPass}/{domainTotal} clear</span>
                </div>
                <div className="space-y-1">
                  {domain.checks.map((check) => {
                    const cfg = statusConfig[check.status];
                    return (
                      <div key={check.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                        <div className="flex items-center gap-2">
                          {check.status === "pass" ? <CheckCircle2 size={13} className="text-emerald-400" /> :
                           check.status === "warning" ? <AlertTriangle size={13} className="text-amber-300" /> :
                           check.status === "fail" ? <AlertTriangle size={13} className="text-red-400" /> :
                           <Eye size={13} className="text-cyan-300" />}
                          <span className="font-mono text-[0.72rem] text-slate-200">{check.rule}</span>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="scan" className="space-y-4 mt-4">
          <Button onClick={runComplianceScan} disabled={complianceScanMutation.isPending}
            className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20">
            {complianceScanMutation.isPending ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Scanning...</> : <><Scan className="mr-2 h-3.5 w-3.5" /> Run AI Compliance Scan</>}
          </Button>

          {complianceScanMutation.data && (
            <div className="rounded-2xl border border-emerald-300/20 bg-black/35 p-5">
              <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                <Shield size={14} /> AI Compliance Report
              </div>
              <div className="mt-3 whitespace-pre-wrap font-mono text-sm leading-7 text-slate-300">
                {(complianceScanMutation.data as any).content}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
