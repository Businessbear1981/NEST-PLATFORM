import { lazy, Suspense, type ReactNode } from 'react';
import { Link } from 'wouter';

const RootsWorkspace = lazy(() => import('@/components/RootsWorkspace'));
const ClientDepositPlatform = lazy(() =>
  import('@/components/ClientDepositPlatform').then((module) => ({ default: module.ClientDepositPlatform })),
);
const BondMarketTerminal = lazy(() => import('@/components/BondMarketTerminal').then((module) => ({ default: module.BondMarketTerminal })));
const AnimatedBondDesk = lazy(() => import('@/components/AnimatedBondDesk').then((module) => ({ default: module.AnimatedBondDesk })));
const AnimatedAgentPlatform = lazy(() => import('@/components/AnimatedAgentPlatform').then((module) => ({ default: module.AnimatedAgentPlatform })));
const RatingIntelligence = lazy(() => import('@/components/RatingIntelligence'));
const CovenantMonitoring = lazy(() => import('@/components/CovenantMonitoring'));
const KYCCompliance = lazy(() => import('@/components/KYCCompliance'));
const CompleteSuretyModule = lazy(() => import('@/components/CompleteSuretyModule').then((module) => ({ default: module.CompleteSuretyModule })));
const AdminPlatform = lazy(() => import('@/components/AdminPlatform').then((module) => ({ default: module.AdminPlatform })));
const CompliancePortal = lazy(() => import('@/components/CompliancePortal').then((module) => ({ default: module.CompliancePortal })));
const DealIntakeModeling = lazy(() => import('@/components/DealIntakeModeling').then((module) => ({ default: module.DealIntakeModeling })));

function ModuleSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-6 font-mono text-xs uppercase tracking-[0.2em] text-cyan-100">
          Loading workflow module
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function WorkflowRouteHeader({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="mb-5 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-cyan-50" data-testid="workflow-route-header">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Stateful routed module</p>
          <h1 className="mt-1 text-xl font-semibold text-white">{title}</h1>
          <p className="mt-1 text-sm leading-6 text-cyan-50/85">{copy}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/operations/deals" className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-cyan-100">Open deal workspace →</Link>
          <Link href="/dashboard" className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-white">Portfolio dashboard →</Link>
        </div>
      </div>
    </section>
  );
}

export function RootsPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <RootsWorkspace dealId="deal-1" />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function ClientDepositPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <ClientDepositPlatform dealId="deal-1" dealName="Apex Capital Partners" />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function InsuranceSuretyPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <CompleteSuretyModule />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function BondDeskPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <AnimatedBondDesk />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function AgentPlatformPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <AnimatedAgentPlatform />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function RatingIntelligencePage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <RatingIntelligence />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function CovenantMonitoringPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <WorkflowRouteHeader
          title="Covenant Monitoring workflow lane"
          copy="This route now supports covenant sweeps, remediation resolution, watchlist routing, evidence updates, and an on-page audit log while also linking back into the deal workspace."
        />
        <ModuleSuspense>
          <CovenantMonitoring />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function KYCCompliancePage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <WorkflowRouteHeader
          title="KYC Compliance workflow lane"
          copy="This route now supports document requests, profile verification, beneficial-owner remediation, sanctions escalation or clearance, and retained review notes."
        />
        <ModuleSuspense>
          <KYCCompliance />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function AdminPlatformPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <AdminPlatform />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function CompliancePortalPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <CompliancePortal />
        </ModuleSuspense>
      </div>
    </div>
  );
}

export function DealIntakeModelingPage() {
  return (
    <div className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100">
      <div className="container mx-auto py-8">
        <ModuleSuspense>
          <DealIntakeModeling />
        </ModuleSuspense>
      </div>
    </div>
  );
}
