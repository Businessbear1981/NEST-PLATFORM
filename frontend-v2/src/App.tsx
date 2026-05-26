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
