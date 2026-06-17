"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Eye, Shield, AlertTriangle, CheckCircle2, Lock, Scan, FileWarning, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

function getItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

// Icon map — keyed by category id from backend
const DOMAIN_ICONS: Record<string, React.ElementType> = {
  sec: Shield,
  finra: Lock,
  bsa_aml: Scan,
  state: FileWarning,
  tax: Activity,
};

// Backend returns: pass | warn | fail | pending
// Legacy hardcoded data used: pass | warning | review | na
// statusConfig covers all variants so old and new data render correctly
const statusConfig: Record<string, { color: string; label: string }> = {
  pass:    { color: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",     label: "PASS" },
  warning: { color: "border-amber-300/30 bg-amber-300/10 text-amber-200",           label: "WARNING" },
  warn:    { color: "border-amber-300/30 bg-amber-300/10 text-amber-200",           label: "WARNING" },
  fail:    { color: "border-red-400/30 bg-red-500/10 text-red-200",                 label: "FAIL" },
  review:  { color: "border-[#C4A048]/30 bg-[#C4A048]/10 text-[#E8C87A]",          label: "REVIEW" },
  pending: { color: "border-[#C4A048]/30 bg-[#C4A048]/10 text-[#E8C87A]",          label: "PENDING" },
  na:      { color: "border-[#2D6B3D]/30 bg-[#2D6B3D]/10 text-[#EDE8DC]",          label: "N/A" },
};

interface CheckItem {
  id: string;
  rule: string;
  status: string;
}

interface DomainItem {
  id: string;
  name: string;
  icon: React.ElementType;
  checks: CheckItem[];
}

interface CheckDef {
  id: string;
  name: string;
  description?: string;
}

interface CategoryDef {
  name: string;
  checks: CheckDef[];
}

interface ScanCheck {
  id: string;
  name: string;
  description?: string;
  status: string;
  notes?: string;
}

interface ScanCategory {
  name: string;
  checks: ScanCheck[];
  summary?: {
    total: number;
    pass: number;
    warn: number;
    fail: number;
    pending: number;
    score: number;
  };
}

interface ScanResult {
  overall: {
    score: number;
    pass: number;
    warn: number;
    fail: number;
    pending: number;
    gate_status: string;
    gate_message: string;
    can_proceed: boolean;
  };
  categories: Record<string, ScanCategory>;
}

function buildDomainsFromDefs(defs: Record<string, CategoryDef>): DomainItem[] {
  return Object.entries(defs).map(([id, cat]) => ({
    id,
    name: cat.name,
    icon: DOMAIN_ICONS[id] ?? Eye,
    checks: cat.checks.map((c) => ({
      id: c.id,
      rule: c.name,
      status: "pending",
    })),
  }));
}

function buildDomainsFromScan(result: ScanResult): DomainItem[] {
  return Object.entries(result.categories).map(([id, cat]) => ({
    id,
    name: cat.name,
    icon: DOMAIN_ICONS[id] ?? Eye,
    checks: cat.checks.map((c) => ({
      id: c.id,
      rule: c.name,
      status: c.status,
    })),
  }));
}

export default function NightVisionComplianceLair({ dealId: dealIdProp }: { dealId?: string }) {
  // ── Resolve dealId: prop → URL ?deal_id= → localStorage ───────────
  const searchParams = useSearchParams();
  const dealId: string | undefined =
    dealIdProp ||
    searchParams.get("deal_id") ||
    (typeof window !== "undefined" ? localStorage.getItem("nest_active_deal_id") ?? undefined : undefined) ||
    undefined;

  const domainsState = useState<DomainItem[]>([]);
  const domains = domainsState[0]; const setDomains = domainsState[1];

  const loadingState = useState(true);
  const loading = loadingState[0]; const setLoading = loadingState[1];

  const scanErrorState = useState<string | null>(null);
  const scanError = scanErrorState[0]; const setScanError = scanErrorState[1];

  const activeTabState = useState("overview");
  const activeTab = activeTabState[0]; const setActiveTab = activeTabState[1];

  const scanResultState = useState<ScanResult | null>(null);
  const scanResult = scanResultState[0]; const setScanResult = scanResultState[1];

  const complianceScanMutation = trpc.powerstrip.route.useMutation();

  // On mount: load check definitions so we have rule names with "pending" status.
  // If dealId is resolved, immediately run a live scan to get real statuses.
  // If no dealId after all fallbacks, auto-fire the generic compliance scan.
  useEffect(() => {
    let cancelled = false;

    async function loadChecks() {
      setLoading(true);
      setScanError(null);
      try {
        // Step 1: always load the check catalog (no auth required)
        const defsRes = await fetch(`${API}/api/nightvision/checks`);
        const defsJson = await defsRes.json();
        if (!cancelled && defsJson.success && defsJson.data) {
          setDomains(buildDomainsFromDefs(defsJson.data as Record<string, CategoryDef>));
        }

        // Step 2: run scan — deal-specific if we have a dealId, generic otherwise
        const token = typeof window !== "undefined"
          ? localStorage.getItem("nest_token") ?? ""
          : "";
        const url = dealId
          ? `${API}/api/nightvision/scan/${dealId}`
          : `${API}/api/nightvision/scan`;
        const body = dealId ? {} : {
          deal_type: "REVENUE_BOND",
          offering_type: "506C",
          amount_usd: 231000000,
          issuer_state: "FL",
          target_states: ["FL", "TX", "AZ"],
          project_type: "senior_living",
          tax_exempt: true,
          accredited_investors_only: true,
        };
        const scanRes = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });
        const scanJson = await scanRes.json();
        if (!cancelled && scanJson.success && scanJson.data) {
          setScanResult(scanJson.data as ScanResult);
          setDomains(buildDomainsFromScan(scanJson.data as ScanResult));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setScanError(e instanceof Error ? e.message : "Failed to load compliance data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChecks();
    return () => { cancelled = true; };
  }, [dealId]);

  // Manual scan trigger (no dealId context — uses generic NEST deal defaults)
  const runLiveScan = async () => {
    setLoading(true);
    setScanError(null);
    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("nest_token") ?? ""
        : "";
      const body = dealId ? {} : {
        deal_type: "REVENUE_BOND",
        offering_type: "506C",
        amount_usd: 231000000,
        issuer_state: "FL",
        target_states: ["FL", "TX", "AZ"],
        project_type: "senior_living",
        tax_exempt: true,
        accredited_investors_only: true,
      };
      const url = dealId
        ? `${API}/api/nightvision/scan/${dealId}`
        : `${API}/api/nightvision/scan`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setScanResult(json.data as ScanResult);
        setDomains(buildDomainsFromScan(json.data as ScanResult));
      } else {
        setScanError(json.error ?? "Scan failed.");
      }
    } catch (e: unknown) {
      setScanError(e instanceof Error ? e.message : "Scan request failed.");
    } finally {
      setLoading(false);
    }
  };

  // AI narrative scan (existing tRPC call — unchanged)
  const runAIScan = () => {
    complianceScanMutation.mutate({
      taskType: "risk_assessment",
      prompt: `Run a compliance scan for a NEST dual-tranche senior living bond offering.
      Assess: SEC Reg D 506(c) compliance, FINRA broker-dealer requirements,
      BSA/AML investor screening, state licensing for senior living in FL/TX/AZ,
      and tax-exempt bond eligibility. Identify any red flags or action items.
      Format as a bullet-point compliance report. Be specific and decisive.`,
    });
  };

  const allChecks = domains.flatMap((d) => d.checks);
  const passCount    = allChecks.filter((c) => c.status === "pass").length;
  const warnCount    = allChecks.filter((c) => c.status === "warn" || c.status === "warning").length;
  const failCount    = allChecks.filter((c) => c.status === "fail").length;
  const reviewCount  = allChecks.filter((c) => c.status === "review" || c.status === "pending").length;
  const applicableChecks = allChecks.filter((c) => c.status !== "na").length;
  const compliancePct = applicableChecks > 0 ? Math.round((passCount / applicableChecks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            <Eye size={17} className="text-emerald-400" /> NightVision — Compliance Lair
          </div>
          <p className="mt-1 text-sm text-[#7A9A82]">Regulatory compliance monitoring, audit readiness, and risk detection.</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#7A9A82]">Compliance Score</p>
          {loading ? (
            <Loader2 className="ml-auto h-5 w-5 animate-spin text-[#7A9A82]" />
          ) : (
            <p className={`font-mono text-2xl font-bold ${compliancePct >= 80 ? "text-emerald-200" : compliancePct >= 60 ? "text-amber-200" : "text-red-200"}`}>
              {compliancePct}%
            </p>
          )}
        </div>
      </div>

      {/* Status summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pass",     count: passCount,   color: "text-emerald-200 border-emerald-300/30 bg-emerald-400/8" },
          { label: "Warnings", count: warnCount,   color: "text-amber-200 border-amber-300/30 bg-amber-300/8" },
          { label: "Failures", count: failCount,   color: "text-red-200 border-red-400/30 bg-red-500/8" },
          { label: "Review",   count: reviewCount, color: "text-[#E8C87A] border-[#C4A048]/30 bg-[#C4A048]/8" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em]">{s.label}</p>
            <p className="font-mono text-2xl font-bold">{s.count}</p>
          </div>
        ))}
      </div>

      <Progress value={compliancePct} className="h-2" />

      {scanError && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 font-mono text-[0.72rem] text-red-200">
          {scanError}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-fit rounded-xl border border-white/10 bg-black/45">
          <TabsTrigger value="overview" className="font-mono text-[0.68rem] uppercase">All Domains</TabsTrigger>
          <TabsTrigger value="scan" className="font-mono text-[0.68rem] uppercase">AI Scan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={runLiveScan}
              disabled={loading}
              className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
            >
              {loading
                ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Loading...</>
                : <><Scan className="mr-2 h-3.5 w-3.5" /> {scanResult ? "Refresh Scan" : "Run Compliance Scan"}</>}
            </Button>
            {scanResult && (
              <span className={`font-mono text-[0.62rem] font-semibold uppercase ${scanResult.overall.gate_status === "CLEAR" ? "text-emerald-300" : "text-red-300"}`}>
                {scanResult.overall.gate_status} — {scanResult.overall.gate_message}
              </span>
            )}
          </div>

          {loading && domains.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[#7A9A82]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading compliance checks...
            </div>
          ) : domains.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/35 p-6 text-center font-mono text-[0.72rem] text-[#7A9A82]">
              No compliance checks available. Run a scan to populate.
            </div>
          ) : (
            domains.map((domain) => {
              const Icon = domain.icon;
              const domainPass  = domain.checks.filter((c) => c.status === "pass").length;
              const domainTotal = domain.checks.filter((c) => c.status !== "na").length;
              return (
                <div key={domain.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">
                      <Icon size={14} className="text-emerald-300" /> {domain.name}
                    </div>
                    <span className="font-mono text-[0.56rem] text-[#7A9A82]">{domainPass}/{domainTotal} clear</span>
                  </div>
                  <div className="space-y-1">
                    {domain.checks.map((check) => {
                      const cfg = statusConfig[check.status] ?? statusConfig["pending"];
                      return (
                        <div key={check.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                          <div className="flex items-center gap-2">
                            {check.status === "pass"
                              ? <CheckCircle2 size={13} className="text-emerald-400" />
                              : check.status === "warning" || check.status === "warn"
                              ? <AlertTriangle size={13} className="text-amber-300" />
                              : check.status === "fail"
                              ? <AlertTriangle size={13} className="text-red-400" />
                              : <Eye size={13} className="text-[#C4A048]" />}
                            <span className="font-mono text-[0.72rem] text-[#EDE8DC]">{check.rule}</span>
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
            })
          )}
        </TabsContent>

        <TabsContent value="scan" className="space-y-4 mt-4">
          <Button onClick={runAIScan} disabled={complianceScanMutation.isPending}
            className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.72rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20">
            {complianceScanMutation.isPending ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Scanning...</> : <><Scan className="mr-2 h-3.5 w-3.5" /> Run AI Compliance Scan</>}
          </Button>

          {complianceScanMutation.data && (
            <div className="rounded-2xl border border-emerald-300/20 bg-black/35 p-5">
              <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                <Shield size={14} /> AI Compliance Report
              </div>
              <div className="mt-3 whitespace-pre-wrap font-mono text-sm leading-7 text-[#EDE8DC]">
                {(complianceScanMutation.data as any).content}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
