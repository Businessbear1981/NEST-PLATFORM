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
import SignalIntelligenceFeed from "./components/SignalIntelligenceFeed";
import EagleEyeV2 from "./components/EagleEyeV2";
import AppShell from "./components/AppShell";
import BoxingOutTracker from "./components/BoxingOutTracker";
import BondIntelligence from "./components/BondIntelligence";
import LenderCommandCenter from "./components/LenderCommandCenter";
import RiskCommandCenter from "./components/RiskCommandCenter";
import MarketingStudio from "./components/MarketingStudio";
import ModelingStudio from "./components/ModelingStudio";
import RootsDocumentVault from "./components/RootsDocumentVault";
import BernardPage from "./pages/v4/BernardPage";
import CreditUWPage from "./pages/v4/CreditUWPage";
import TrusteePage from "./pages/v4/TrusteePage";
import ConstructionPage from "./pages/v4/ConstructionPage";
import SurveillancePage from "./pages/v4/SurveillancePage";
import TreasuryPage from "./pages/v4/TreasuryPage";
import EMMAPage from "./pages/v4/EMMAPage";
import DealInputPage from "./pages/v4/DealInputPage";
import DealsPage from "./pages/v4/DealsPage";
import RootsUploadPage from "./pages/v4/RootsUploadPage";
import ClientDashboardPage from "./pages/v4/ClientDashboardPage";

function BondCommandPage(props: any) {
  return (
    <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"
          style={{ background: "radial-gradient(circle at 12% 4%, rgba(34,211,238,0.20), transparent 28rem), radial-gradient(circle at 84% 9%, rgba(251,191,36,0.16), transparent 25rem), linear-gradient(135deg,#02050a 0%,#07101a 50%,#04070d 100%)" }}>
      <BondCommandCenter dealId={props.params?.dealId ?? "dec80007-947f-4310-9aef-7313d0945cf8"} />
    </main>
  );
}

/* Placeholder page for modules under construction */
function ModulePlaceholder({ title, apiEndpoint }: { title: string; apiEndpoint: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6 text-center">
      <div className="rounded-2xl border border-cyan-400/20 bg-[#060E1A] px-12 py-10 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-cyan-300/60 mb-3">NEST Operating Framework</div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>{title}</h1>
        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent my-4" />
        <p className="text-slate-400 text-sm max-w-md">Module under construction. Backend API wiring in progress.</p>
        <div className="mt-4 inline-block rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 font-mono text-xs text-slate-500">
          API → {apiEndpoint}
        </div>
      </div>
    </div>
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
      <Route path={"/operations/deals"} component={OperationsDealsPage} />
      <Route path={"/operations/deal/:dealId"} component={(props: any) => <OperationsDealDetailPage dealId={props.params.dealId} />} />
      <Route path={"/command-center"} component={BondCommandPage} />
      <Route path={"/command-center/:dealId"} component={BondCommandPage} />
      <Route path={"/eagleeye"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><EagleEyeScoutDashboard /></main>}</Route>
      <Route path={"/eagleeye-v2"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><EagleEyeV2 /></main>}</Route>
      <Route path={"/signals"} component={() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><SignalIntelligenceFeed /></main>} />
      <Route path={"/roots"} component={RootsPage} />
      <Route path={"/bond-desk"} component={BondDeskPage} />
      <Route path={"/hawkeye"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><HawkeyePlacementScout /></main>}</Route>
      <Route path={"/nightvision"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><NightVisionComplianceLair /></main>}</Route>
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
      {/* V4 Operating Framework Modules */}
      <Route path={"/bernard"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><BernardPage /></main>}</Route>
      <Route path={"/credit"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><CreditUWPage /></main>}</Route>
      <Route path={"/trustee"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><TrusteePage /></main>}</Route>
      <Route path={"/construction"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ConstructionPage /></main>}</Route>
      <Route path={"/surveillance"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><SurveillancePage /></main>}</Route>
      <Route path={"/treasury"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><TreasuryPage /></main>}</Route>
      <Route path={"/emma"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><EMMAPage /></main>}</Route>
      <Route path={"/deal-input-v4"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><DealInputPage /></main>}</Route>
      <Route path={"/deals"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><DealsPage /></main>}</Route>
      <Route path={"/upload"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><RootsUploadPage /></main>}</Route>
      <Route path={"/client"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ClientDashboardPage /></main>}</Route>
      <Route path={"/client/:dealId"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ClientDashboardPage /></main>}</Route>
      {/* V3 Module Routes */}
      <Route path={"/boxing-out"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><BoxingOutTracker /></main>}</Route>
      <Route path={"/bond-intel"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><BondIntelligence /></main>}</Route>
      <Route path={"/lenders"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><LenderCommandCenter /></main>}</Route>
      <Route path={"/risk"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><RiskCommandCenter /></main>}</Route>
      <Route path={"/marketing"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><MarketingStudio /></main>}</Route>
      <Route path={"/modeling"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModelingStudio /></main>}</Route>
      <Route path={"/documents"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><RootsDocumentVault /></main>}</Route>
      {/* Placeholder Module Routes — Backend APIs built, frontend pending */}
      <Route path={"/feasibility"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModulePlaceholder title="Feasibility Analysis" apiEndpoint="/api/feasibility" /></main>}</Route>
      <Route path={"/feasibility-desk"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModulePlaceholder title="Feasibility Desk" apiEndpoint="/api/feasibility/desk" /></main>}</Route>
      <Route path={"/audit-desk"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModulePlaceholder title="Audit Desk" apiEndpoint="/api/audit" /></main>}</Route>
      <Route path={"/cost-estimate"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModulePlaceholder title="Cost Estimation Engine" apiEndpoint="/api/cost-estimate" /></main>}</Route>
      <Route path={"/atticus"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModulePlaceholder title="Atticus — Legal & Compliance" apiEndpoint="/api/atticus" /></main>}</Route>
      <Route path={"/pricing"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModulePlaceholder title="Pricing Desk" apiEndpoint="/api/pricing" /></main>}</Route>
      <Route path={"/preflight"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModulePlaceholder title="Pre-Flight Checklist" apiEndpoint="/api/preflight" /></main>}</Route>
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
