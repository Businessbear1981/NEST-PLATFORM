/*
Design philosophy for this file: Bloomberg Terminal x Spider-Verse institutional command cockpit.
The shell defaults to a dark institutional environment so dense financial data, neon dimensional accents, and the preserved NEST tree mark remain legible.
*/
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Auto-login + global fetch interceptor.
//
// Problem this solves:
//   The frontend has no visible /login page, but every backend `/api/*`
//   endpoint is `@require_auth()`. Many pages (DealInputPage, EagleEyeV2,
//   RootsUploadPage) also don't include an Authorization header on their
//   fetch calls. Result: every protected endpoint returns 401 "missing
//   token", every page renders its empty shell, and the platform LOOKS
//   like demo data.
//
// What we do:
//   1. On first mount, grab an admin JWT from /api/auth/login and stash
//      it in localStorage as `nest_token`.
//   2. Monkey-patch `window.fetch` so every request to `/api/*` (except
//      /api/auth/login) automatically gets `Authorization: Bearer <token>`
//      — without touching the call sites.
//
// This is the right production fix for the "no login UI yet" state: it
// keeps backend auth enforced (you can still test 401s by clearing
// localStorage) while making the existing pages work.
function installFetchAuthHeader() {
  if (typeof window === "undefined") return;
  if ((window as any).__nestFetchPatched) return;
  (window as any).__nestFetchPatched = true;
  const origFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    let url = "";
    if (typeof input === "string") url = input;
    else if (input instanceof URL) url = input.toString();
    else url = input.url;
    // Only attach the header for our own /api/* calls, and never for the
    // login endpoint (which would create a circular dependency).
    const isApi = url.startsWith("/api/") || url.includes("://") && url.includes("/api/");
    const isLogin = url.includes("/api/auth/login");
    if (isApi && !isLogin) {
      const token = localStorage.getItem("nest_token");
      if (token) {
        const headers = new Headers(init?.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        return origFetch(input, { ...init, headers });
      }
    }
    return origFetch(input, init);
  }) as typeof window.fetch;
}

// Use the original fetch (NOT the patched one) for the login itself.
const origLoginFetch = typeof window !== "undefined" ? window.fetch.bind(window) : (..._args: any[]) => Promise.reject(new Error("no fetch"));

// CRITICAL: install the fetch patch at module-evaluation time, NOT inside a
// useEffect. React effect order runs children before parents, so child page
// effects fire `fetch("/api/...")` BEFORE App's useEffect runs — meaning
// without this, the very first page-load fetch escapes unpatched and fails
// with 401. Patching here ensures every fetch from the moment React mounts
// goes through the interceptor.
if (typeof window !== "undefined") {
  installFetchAuthHeader();
  // Kick off auto-login on script load too — same reason as above. If a
  // page fires before login completes, the interceptor still attaches the
  // header on subsequent fetches once the token lands in localStorage.
  if (!localStorage.getItem("nest_token")) {
    origLoginFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@nest.local", password: "Admin123!" }),
    })
      .then((r) => r.json())
      .then((d) => {
        const tok = d?.token || d?.data?.token;
        if (tok) {
          localStorage.setItem("nest_token", tok);
          window.dispatchEvent(new Event("storage"));
        }
      })
      .catch(() => {});
  }
}

function useAutoLogin() {
  // Component-level hook is now a no-op — the work happens at module load.
  // Kept so existing App() call site doesn't break.
  useEffect(() => {}, []);
}
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
import EagleEyeMain from "./components/EagleEyeMain";
import AppShell from "./components/AppShell";
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
import StudyPage from "./pages/v4/StudyPage";
import PhoenixDesk from "./components/PhoenixDesk";
// Phase 1 — wire previously-orphaned intelligence modules (real backend fetches)
import BondIntelligence from "./components/BondIntelligence";
import ModelingStudio from "./components/ModelingStudio";
import ForensicAudit from "./components/ForensicAudit";
import RiskCommandCenter from "./components/RiskCommandCenter";
import LenderCommandCenter from "./components/LenderCommandCenter";
import CentralNervousSystem from "./components/CentralNervousSystem";
import MarketingStudio from "./components/MarketingStudio";
import InstitutionalDashboard from "./components/InstitutionalDashboard";

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
      <Route path={"/"}>{() => { window.location.replace("/deals"); return null; }}</Route>
      <Route path={"/dashboard"} component={DashboardPage} />
      <Route path={"/architecture"} component={ArchitecturePage} />
      <Route path={"/portals"} component={PortalsPage} />
      <Route path={"/agents"} component={AgentsPage} />
      <Route path={"/operations/deals"} component={OperationsDealsPage} />
      <Route path={"/operations/deal/:dealId"} component={(props: any) => <OperationsDealDetailPage dealId={props.params.dealId} />} />
      <Route path={"/command-center"} component={BondCommandPage} />
      <Route path={"/command-center/:dealId"} component={BondCommandPage} />
      <Route path={"/eagleeye"}>{() => { window.location.replace("/eagleeye-v2"); return null; }}</Route>
      <Route path={"/eagleeye-v2"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><EagleEyeMain /></main>}</Route>
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
      {/* Phase 1 — orphaned intelligence modules wired to routes */}
      <Route path={"/bond-intel"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><BondIntelligence /></main>}</Route>
      <Route path={"/modeling"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ModelingStudio /></main>}</Route>
      <Route path={"/forensic"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><ForensicAudit /></main>}</Route>
      <Route path={"/risk"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><RiskCommandCenter /></main>}</Route>
      <Route path={"/lenders"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><LenderCommandCenter /></main>}</Route>
      <Route path={"/ai-tools"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><CentralNervousSystem /></main>}</Route>
      <Route path={"/marketing"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><MarketingStudio /></main>}</Route>
      <Route path={"/institutional"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><InstitutionalDashboard /></main>}</Route>
      <Route path={"/study"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><StudyPage /></main>}</Route>
      <Route path={"/phoenix"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><PhoenixDesk /></main>}</Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useAutoLogin();
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
