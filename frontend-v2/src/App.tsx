/*
Design philosophy for this file: Bloomberg Terminal x Spider-Verse institutional command cockpit.
The shell defaults to a dark institutional environment so dense financial data, neon dimensional accents, and the preserved NEST tree mark remain legible.
*/
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { AgentsPage, ArchitecturePage, DashboardPage, PortalsPage } from "./pages/WorkbenchPages";
import { OperationsDealsPage, OperationsDealDetailPage } from "./pages/OperationsPages";
import {
  RootsPage, AgentPlatformPage, RatingIntelligencePage,
  CovenantMonitoringPage, KYCCompliancePage, InsuranceSuretyPage,
  AdminPlatformPage, CompliancePortalPage, DealIntakeModelingPage,
  ClientDepositPage,
} from "./pages/OperationalModulesPages";
import BondDeskPage from "./components/bond-desk/BondDeskPage";
import BondCommandCenter from "./components/BondCommandCenter";
import EagleEyeScoutDashboard from "./components/EagleEyeScoutDashboard";
import HawkeyePlacementScout from "./components/HawkeyePlacementScout";
import NightVisionComplianceLair from "./components/NightVisionComplianceLair";
import BernardConcierge from "./components/BernardConcierge";
import BondArrangementEngine from "./components/BondArrangementEngine";
import AboutNest from "./components/AboutNest";
import AppShell from "./components/AppShell";
import PhoenixDesk from "./components/PhoenixDesk";
import TreasuryDesk from "./components/TreasuryDesk";
import { useLocation } from "wouter";

function ModulePage() {
  const [location] = useLocation();
  const name = location.replace(/^\//, "").replace(/-/g, " ").replace(/\//g, " · ").toUpperCase() || "MODULE";
  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[1.5rem] border border-cyan-300/20 bg-[#07101a]/80 p-8 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-cyan-300">NEST Advisors · Digital Investment Bank</p>
          <h1 className="mt-3 font-mono text-2xl font-bold uppercase tracking-[0.06em] text-white">{name}</h1>
          <div className="mt-4 h-px bg-gradient-to-r from-cyan-300/30 via-amber-300/20 to-transparent" />
          <p className="mt-4 text-sm leading-7 text-slate-400">This module is configured and ready for development. The backend routes are active — the frontend workspace will be built in the next sprint.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "STATUS", value: "CONFIGURED", color: "text-amber-200 border-amber-300/30 bg-amber-300/8" },
              { label: "BACKEND", value: "ACTIVE", color: "text-emerald-200 border-emerald-300/30 bg-emerald-400/8" },
              { label: "FRONTEND", value: "IN PROGRESS", color: "text-cyan-200 border-cyan-300/30 bg-cyan-400/8" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-3 ${s.color}`}>
                <span className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-slate-500">{s.label}</span>
                <p className="mt-1 font-mono text-sm font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function BondCommandPage(props: any) {
  return (
    <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"
          style={{ background: "radial-gradient(circle at 12% 4%, rgba(34,211,238,0.20), transparent 28rem), radial-gradient(circle at 84% 9%, rgba(251,191,36,0.16), transparent 25rem), linear-gradient(135deg,#02050a 0%,#07101a 50%,#04070d 100%)" }}>
      <BondCommandCenter dealId={props.params?.dealId ?? "dec80007-947f-4310-9aef-7313d0945cf8"} />
    </main>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={DashboardPage} />
      <Route path={"/architecture"} component={ArchitecturePage} />
      <Route path={"/portals"} component={PortalsPage} />
      <Route path={"/agents"} component={AgentsPage} />
      <Route path={"/operations"} component={OperationsDealsPage} />
      <Route path={"/operations/deals"} component={OperationsDealsPage} />
      <Route path={"/operations/deal/:dealId"} component={(props: any) => <OperationsDealDetailPage dealId={props.params.dealId} />} />
      <Route path={"/command-center"} component={BondCommandPage} />
      <Route path={"/command-center/:dealId"} component={BondCommandPage} />
      <Route path={"/eagleeye"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><EagleEyeScoutDashboard /></main>}</Route>
      <Route path={"/roots"} component={RootsPage} />
      <Route path={"/bond-desk"} component={BondDeskPage} />
      <Route path={"/hawkeye"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><HawkeyePlacementScout /></main>}</Route>
      <Route path={"/nightvision"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><NightVisionComplianceLair /></main>}</Route>
      <Route path={"/phoenix"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><PhoenixDesk /></main>}</Route>
      <Route path={"/treasury"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><TreasuryDesk dealId="1" /></main>}</Route>
      <Route path={"/agents/platform"} component={AgentPlatformPage} />
      <Route path={"/rating"} component={RatingIntelligencePage} />
      <Route path={"/surety"} component={InsuranceSuretyPage} />
      <Route path={"/covenants"} component={CovenantMonitoringPage} />
      <Route path={"/kyc"} component={KYCCompliancePage} />
      <Route path={"/compliance"} component={CompliancePortalPage} />
      <Route path={"/deal-intake"} component={DealIntakeModelingPage} />
      <Route path={"/deposits"} component={ClientDepositPage} />
      <Route path={"/admin"} component={AdminPlatformPage} />
      <Route path={"/about"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><AboutNest /></main>}</Route>

      {/* ── Dashboards ─────────────────────────────────────── */}
      <Route path={"/dashboard-bond"} component={ModulePage} />
      <Route path={"/dashboard-ma"} component={ModulePage} />
      <Route path={"/dashboard-icre"} component={ModulePage} />
      <Route path={"/dashboard-ou"} component={ModulePage} />
      <Route path={"/dashboard-treasury-co"} component={ModulePage} />
      <Route path={"/dashboard-treasury-emp"} component={ModulePage} />
      <Route path={"/dashboard-comp"} component={ModulePage} />
      <Route path={"/dashboard-pv"} component={ModulePage} />
      <Route path={"/investor-dashboard"} component={ModulePage} />
      <Route path={"/partner-dashboard"} component={ModulePage} />
      <Route path={"/client-dashboard"} component={ModulePage} />

      {/* ── Business Development ───────────────────────────── */}
      <Route path={"/contact-strategy"} component={ModulePage} />
      <Route path={"/outreach"} component={ModulePage} />
      <Route path={"/heat-maps"} component={ModulePage} />
      <Route path={"/eagleeye-bond"} component={ModulePage} />
      <Route path={"/eagleeye-icre"} component={ModulePage} />
      <Route path={"/eagleeye-ou"} component={ModulePage} />
      <Route path={"/eagleeye-ma"} component={ModulePage} />

      {/* ── Tools ──────────────────────────────────────────── */}
      <Route path={"/napkin"} component={ModulePage} />
      <Route path={"/content-library"} component={ModulePage} />
      <Route path={"/video-generator"} component={ModulePage} />
      <Route path={"/teaser-generator"} component={ModulePage} />
      <Route path={"/credit-memo"} component={ModulePage} />

      {/* ── NEST Bond ──────────────────────────────────────── */}
      <Route path={"/deal-intake-bond"} component={ModulePage} />
      <Route path={"/roots-bond"} component={ModulePage} />

      {/* ── Sparrow ────────────────────────────────────────── */}
      <Route path={"/deal-intake-sparrow"} component={ModulePage} />
      <Route path={"/roots-sparrow"} component={ModulePage} />
      <Route path={"/sparrow"} component={ModulePage} />

      {/* ── NEST IB ────────────────────────────────────────── */}
      <Route path={"/deal-intake-ib"} component={ModulePage} />
      <Route path={"/roots-ib"} component={ModulePage} />
      <Route path={"/ma-desk"} component={ModulePage} />
      <Route path={"/equity-raise"} component={ModulePage} />
      <Route path={"/investments"} component={ModulePage} />

      {/* ── NEST Term Lending ──────────────────────────────── */}
      <Route path={"/deal-intake-lending"} component={ModulePage} />
      <Route path={"/roots-lending"} component={ModulePage} />

      {/* ── Compliance & Legal ─────────────────────────────── */}
      <Route path={"/atticus"} component={ModulePage} />

      {/* ── NEST Suite ─────────────────────────────────────── */}
      <Route path={"/c-suite"} component={ModulePage} />

      {/* ── NEST Labs ──────────────────────────────────────── */}
      <Route path={"/tech-stack"} component={ModulePage} />
      <Route path={"/data-connectors"} component={ModulePage} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppShell>
            <Router />
          </AppShell>
          <BernardConcierge />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
