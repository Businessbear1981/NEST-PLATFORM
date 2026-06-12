"use client";
/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RootsWorkspace from "@/components/RootsWorkspace";
import { LiveBondMarketTerminal } from "@/components/LiveBondMarketTerminal";
import { LiveAgentDashboard } from "@/components/LiveAgentDashboard";
import { CompleteSuretyModule } from "@/components/CompleteSuretyModule";
import { InsuranceSuretyModule } from "@/components/InsuranceSuretyModule";
import { ClientDepositPlatform } from "@/components/ClientDepositPlatform";
import { RatingGradingRoom, type RatingAssignment } from "@/components/RatingGradingRoom";
import { AdminPlatform } from "@/components/AdminPlatform";
import { CompliancePortal } from "@/components/CompliancePortal";
import RatingIntelligence from "@/components/RatingIntelligence";
import { DealIntakeModeling } from "@/components/DealIntakeModeling";
import CovenantMonitoring from "@/components/CovenantMonitoring";
import KYCCompliance from "@/components/KYCCompliance";
import { BondOfferingSalesDesk } from "@/components/BondOfferingSalesDesk";

const mocks = vi.hoisted(() => ({
  climate: { physicalRiskAssessment: { useQuery: () => ({ data: { overall_physical_score: 45, flood_risk_pct: 30, wildfire_risk_pct: 15, hurricane_risk_pct: 25, drought_risk_pct: 10 } }) }, transitionRiskAssessment: { useMutation: () => ({ isPending: false, mutate: vi.fn(), data: null }) }, combinedClimateScore: { useQuery: () => ({ data: { combined_climate_score: 50 } }) } },
  ratingHub: { maxwellRating: { useQuery: () => ({ data: { rating: 'A-', outlook: 'Stable' } }) }, jpmorganRating: { useMutation: () => ({ isPending: false, mutate: vi.fn(), data: null }) }, compositeRating: { useQuery: () => ({ data: { composite_rating: 'A', composite_outlook: 'Stable' } }) } },
  surety: { hylantChecklist: { useQuery: () => ({ data: { checklist_items: [], completion_pct: 100 } }) }, premiumModeling: { useMutation: () => ({ isPending: false, mutate: vi.fn(), data: null }) }, lgdTierAssessment: { useQuery: () => ({ data: { lgd_tier: 'Tier 1', lgd_pct: 15 } }) } },
  trustee: { preIssuanceTasks: { useQuery: () => ({ data: { tasks: [], completion_pct: 100 } }) }, postIssuanceTasks: { useQuery: () => ({ data: { tasks: [], completion_pct: 100 } }) } },
  rma: { benchmarks: { useQuery: () => ({ data: { benchmarks: [] } }) }, industryComparison: { useMutation: () => ({ isPending: false, mutate: vi.fn(), data: null }) } },
  bridgeFinancing: { bridgeOptions: { useQuery: () => ({ data: { options: [] } }) }, bridgePricing: { useMutation: () => ({ isPending: false, mutate: vi.fn(), data: null }) } },
  methodologyDiff: { compareMethodologies: { useQuery: () => ({ data: { differences: [] } }) }, riskDiff: { useMutation: () => ({ isPending: false, mutate: vi.fn(), data: null }) } },
  spRecon: { reconStatus: { useQuery: () => ({ data: { sp_rating: 'A', outlook: 'Stable' } }) }, reconUpdates: { useQuery: () => ({ data: { updates: [] } }) }, flagAlerts: { useQuery: () => ({ data: { alerts: [] } }) } },
  kyc: { kycChecklist: { useQuery: () => ({ data: { checklist: [], completion_pct: 100 } }) }, sanctionsScreening: { useMutation: () => ({ isPending: false, mutate: vi.fn(), data: null }) } },
  covenantMonitoring: { covenants: { useQuery: () => ({ data: { covenants: [], compliance_pct: 100 } }) }, flagAlerts: { useQuery: () => ({ data: { alerts: [] } }) } },
}));

vi.mock('@/lib/trpc', () => ({ trpc: mocks }));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as typeof globalThis & { ResizeObserver?: typeof TestResizeObserver }).ResizeObserver = TestResizeObserver;

type RenderedModule = {
  container: HTMLDivElement;
  root: Root;
};

const mountedModules: RenderedModule[] = [];

function renderModule(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(element);
  });

  const rendered = { container, root };
  mountedModules.push(rendered);
  return rendered;
}

function findButton(container: HTMLElement, label: string) {
  const button = Array.from(container.querySelectorAll("button")).find((element) =>
    element.textContent?.replace(/\s+/g, " ").includes(label),
  );

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Button with label "${label}" was not found.`);
  }

  return button;
}

function clickElement(element: Element) {
  act(() => {
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

describe("functional demo modules", () => {
  afterEach(() => {
    for (const { root, container } of mountedModules.splice(0)) {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  });

  it("verifies RootsWorkspace source contains 6-tab architecture (vault, readiness, surety, rma, credit, esg)", () => {
    const { readFileSync } = require('node:fs');
    const { resolve } = require('node:path');
    const rootsSource = readFileSync(resolve(process.cwd(), 'client/src/components/RootsWorkspace.tsx'), 'utf8');

    // New archive RootsWorkspace has 6 tabs
    expect(rootsSource).toContain('Doc Vault');
    expect(rootsSource).toContain('Readiness');
    expect(rootsSource).toContain('Surety');
    expect(rootsSource).toContain('RMA');
    expect(rootsSource).toContain('Credit Memo');
    expect(rootsSource).toContain('ESG');
    expect(rootsSource).toContain('Overall Readiness');
    expect(rootsSource).toContain('DOC_CATEGORIES');
    expect(rootsSource).toContain('READINESS_CHECKLIST');
  });

  it("lets the Bond Desk select a market row and route a call-put action into the desk log", () => {
    const { container } = renderModule(<LiveBondMarketTerminal />);

    expect(container.querySelector('[data-testid="live-bond-desk"]')).not.toBeNull();
    expect(container.textContent).toContain("Bond Desk Terminal");
    expect(container.textContent).toContain("NEST-2029-A");

    const secondBondCell = Array.from(container.querySelectorAll("td, p")).find((element) =>
      element.textContent?.includes("NEST-2031-B") && element.closest("tr")?.textContent?.includes("28m call"),
    );
    const row = secondBondCell?.closest("tr");
    if (!(row instanceof HTMLTableRowElement)) {
      throw new Error("NEST-2031-B row was not found.");
    }

    clickElement(row);
    expect(container.textContent).toContain("Infrastructure Sleeve");
    expect(container.textContent).toContain("Hold pending surety packet and rating-gap closure.");

    clickElement(findButton(container, "+25"));
    expect(container.textContent).toContain("+25 bp curve");

    expect(container.textContent).toContain("Streaming MTM ticker");
    clickElement(findButton(container, "Pulse MTM update"));
    expect(container.textContent).toContain("MTM subscription pulse");

    clickElement(findButton(container, "Open exercise dialog"));
    expect(container.textContent).toContain("Exercise package recommendation");
    clickElement(findButton(container, "Route review"));
    expect(container.textContent).toContain("review");
    clickElement(findButton(container, "Confirm exercise routing"));
    expect(container.textContent).toContain("NEST-2031-B: CALL exercise package confirmed for human approval gate");

    clickElement(findButton(container, "Run call/put review"));
    expect(container.textContent).toContain(
      "NEST-2031-B: Vector call/put review generated and sent to approval queue.",
    );
  });

  it("lets the Insurance & Surety module move from checklist gaps to carrier quote and approval gates", () => {
    const { container } = renderModule(<CompleteSuretyModule />);

    expect(container.querySelector('[data-testid="complete-surety-module"]')).not.toBeNull();
    expect(container.textContent).toContain("Submission checklist");
    expect(container.textContent).toContain("Underwriting Gaps");
    expect(container.textContent).toContain("General Contractor audited financials");
    expect(container.textContent).toContain("Required");
    expect(container.textContent).toContain("Remediation Steps");
    expect(container.textContent).toContain("Request audited financials from GC");
    expect(container.textContent).toContain("Character");
    expect(container.textContent).toContain("Capacity");
    expect(container.textContent).toContain("Capital");
    expect(container.textContent).toContain("LC / surety / insurance economics");
    expect(container.textContent).toContain("Surety-to-offering handoff");

    clickElement(findButton(container, "Packet"));
    expect(container.querySelector('[data-testid="surety-packet-prep"]')).not.toBeNull();
    expect(container.textContent).toContain("Surety Packet Prep");
    expect(container.textContent).toContain("Premium Scenarios");

    clickElement(findButton(container, "Carrier"));
    expect(container.querySelector('[data-testid="carrier-submission-form"]')).not.toBeNull();
    expect(container.textContent).toContain("Carrier Submission Form");
    expect(container.textContent).toContain("Apex Surety Partners");
    clickElement(findButton(container, "Request Quote"));

    expect(container.textContent).toContain("Apex Surety Partners");
    expect(container.textContent).toContain("pending");

    clickElement(findButton(container, "Accept"));
    expect(container.querySelector('[data-testid="surety-approval-workflow"]')).not.toBeNull();
    expect(container.textContent).toContain("Pricing Approval");
    expect(container.textContent).toContain("Final Approval");

    const { container: wrapperContainer } = renderModule(
      <InsuranceSuretyModule dealId="deal-1" dealName="Riverside Mixed-Use Portfolio" />,
    );
    expect(wrapperContainer.querySelector('[data-testid="insurance-surety-module"]')).not.toBeNull();
    expect(wrapperContainer.querySelector('[data-testid="complete-surety-module"]')).not.toBeNull();
    expect(wrapperContainer.textContent).toContain("Submission checklist");
  });

  it("renders the Bond Offering Sales Desk with pooled-offering, tranche, outreach, and compliance rails", () => {
    const { container } = renderModule(<BondOfferingSalesDesk />);

    expect(container.querySelector('[data-testid="bond-offering-sales-desk"]')).not.toBeNull();
    expect(container.textContent).toContain("Bond Offering Sales Desk");
    expect(container.textContent).toContain("CMBS-style pooled security");
    expect(container.textContent).toContain("Senior A tranche");
    expect(container.textContent).toContain("Mezzanine B tranche");
    expect(container.textContent).toContain("private placement memorandum");
    expect(container.textContent).toContain("Investor segmentation");
    expect(container.textContent).toContain("post-sale monitoring");
    expect(container.textContent).toContain("Compliance gate");
  });

  it("lets Client Deposit rows open invoice detail and prefill the payment workflow", () => {
    const { container: detailContainer } = renderModule(
      <ClientDepositPlatform dealId="deal-1" dealName="Riverside Mixed-Use Portfolio" />,
    );

    expect(detailContainer.textContent).toContain("Client Deposit Platform");
    expect(detailContainer.textContent).toContain("INV-2025-002");

    const viewButtons = Array.from(detailContainer.querySelectorAll("button")).filter((button) =>
      button.textContent?.replace(/\s+/g, " ").includes("View"),
    );
    const secondViewButton = viewButtons[1];
    if (!(secondViewButton instanceof HTMLButtonElement)) {
      throw new Error("Second invoice view button was not found.");
    }

    clickElement(secondViewButton);
    expect(detailContainer.textContent).toContain("Invoice INV-2025-002");
    expect(detailContainer.textContent).toContain("Invoice ID");
    expect(detailContainer.textContent).toContain("inv-002");

    const { container: payContainer } = renderModule(
      <ClientDepositPlatform dealId="deal-1" dealName="Riverside Mixed-Use Portfolio" />,
    );
    const payButtons = Array.from(payContainer.querySelectorAll("button")).filter((button) =>
      button.textContent?.replace(/\s+/g, " ").includes("Pay Invoice"),
    );
    const firstPayButton = payButtons[0];
    if (!(firstPayButton instanceof HTMLButtonElement)) {
      throw new Error("Pay Invoice button was not found.");
    }

    clickElement(firstPayButton);
    expect(payContainer.textContent).toContain("Payment prefilled for inv-002");
    expect(payContainer.textContent).toContain("Amount Due: $35,000");

    clickElement(findButton(payContainer, "Continue to Review"));
    expect(payContainer.textContent).toContain("Review Payment");
    expect(payContainer.textContent).toContain("inv-002");
    expect(payContainer.textContent).toContain("$35,000");
  });

  it("renders Rating live-demo cues and responds to methodology pulse interactions", () => {
    const ratings: RatingAssignment[] = [
      {
        id: "rating-1",
        issuerName: "Riverside Mixed-Use Portfolio",
        dealName: "Senior Revenue Bond",
        trancheName: "Series 2029-A",
        proposedRating: "A",
        currentRating: "BBB",
        ratingRationale: "Stable occupancy, wrapped construction risk, and covenant reserve support the proposed rating path.",
        scoringModel: {
          financialStrength: 82,
          marketPosition: 76,
          managementQuality: 88,
          covenantStructure: 79,
          marketConditions: 74,
          compositeScore: 80,
        },
        ratingHistory: [{ rating: "BBB", date: "2026-04-12", analyst: "NEST Credit" }],
        status: "Draft",
        analyst: "NEST Credit",
        reviewer: null,
        createdAt: "2026-05-07",
        approvedAt: null,
      },
    ];

    const { container } = renderModule(<RatingGradingRoom ratings={ratings} />);

    expect(container.querySelector('[data-testid="rating-grading-room"]')).not.toBeNull();
    expect(container.textContent).toContain("Rating live/demo surface");
    expect(container.textContent).toContain("interactive cues active");
    expect(container.textContent).toContain("methodology feed idle");

    clickElement(findButton(container, "Pulse methodology feed"));
    expect(container.textContent).toContain("Methodology pulse routed");

    const ratingRow = Array.from(container.querySelectorAll("div.cursor-pointer")).find((element) =>
      element.textContent?.includes("Riverside Mixed-Use Portfolio") && element.textContent?.includes("Series 2029-A"),
    );
    if (!(ratingRow instanceof HTMLDivElement)) {
      throw new Error("Rating row was not found.");
    }
    clickElement(ratingRow);
    expect(container.textContent).toContain("Composite Score");
    expect(container.textContent).toContain("Submit for Approval");
  });

  it("lets the Admin Platform change roles, repair modules, and resolve approvals", () => {
    const { container } = renderModule(<AdminPlatform />);

    expect(container.textContent).toContain("Admin Platform · working control plane");
    expect(container.textContent).toContain("No admin action has been routed yet.");
    expect(container.textContent).toContain("Pending Approvals");

    clickElement(findButton(container, "Users"));
    expect(container.textContent).toContain("Jennifer Park");
    clickElement(findButton(container, "Cycle Role"));
    expect(container.textContent).toContain("Sean Gilmore role changed from admin to viewer.");

    clickElement(findButton(container, "Modules"));
    expect(container.textContent).toContain("Insurance & Surety");
    clickElement(findButton(container, "Run Health Repair"));
    expect(container.textContent).toContain("Insurance & Surety health check completed; status restored to operational.");

    clickElement(findButton(container, "Approvals"));
    clickElement(findButton(container, "Approve"));
    expect(container.textContent).toContain("Bond Issuance approval for NEST Mixed-Use Series B - $25M marked approved.");
    expect(container.textContent).toContain("Decision retained in approval audit log.");
  });

  it("lets the Compliance Portal approve communications, acknowledge surveillance, and extend retention", () => {
    const { container } = renderModule(<CompliancePortal />);

    expect(container.textContent).toContain("Compliance Portal · working governance console");
    expect(container.textContent).toContain("NEST Series B - Investor Update Q2 2026");

    clickElement(findButton(container, "Approve"));
    expect(container.textContent).toContain("NEST Series B - Investor Update Q2 2026 marked approved and retained in compliance history.");

    clickElement(findButton(container, "Surveillance"));
    expect(container.textContent).toContain("Debt Service Coverage Ratio approaching threshold");
    clickElement(findButton(container, "Acknowledge"));
    expect(container.textContent).toContain("covenant surveillance alert acknowledged");

    clickElement(findButton(container, "Archive"));
    expect(container.textContent).toContain("APPROVED");
    clickElement(findButton(container, "Lock Archive"));
    expect(container.textContent).toContain("marked archived and retained in compliance history");

    clickElement(findButton(container, "Records"));
    expect(container.textContent).toContain("Retention: 2555 days");
    clickElement(findButton(container, "Extend Retention"));
    expect(container.textContent).toContain("retention extended by 365 days");
    expect(container.textContent).toContain("Retention: 2920 days");
  });

  it("verifies RatingIntelligence source contains agency recon feeds and methodology rescoring with tRPC", () => {
    const { readFileSync } = require('node:fs');
    const { resolve } = require('node:path');
    const source = readFileSync(resolve(process.cwd(), 'client/src/components/RatingIntelligence.tsx'), 'utf8');

    expect(source).toContain('Rating Intelligence');
    expect(source).toContain('Moody');
    expect(source).toContain('S&P');
    expect(source).toContain('Methodology');
  });

  it("lets Deal Intake and Modeling generate pod codes, route permits, and save stress scenarios", () => {
    const { container } = renderModule(<DealIntakeModeling />);

    expect(container.textContent).toContain("Deal Intake & Modeling");
    expect(container.textContent).toContain("POD-MIX-NYNYC-NEST-26");
    expect(container.textContent).toContain("DRAFT MODE");

    clickElement(findButton(container, "Hospitality"));
    clickElement(findButton(container, "CA-LA"));
    clickElement(findButton(container, "Generate Pod Code and Checklist"));
    expect(container.textContent).toContain("POD-HOS-CALA-NEST-26");
    expect(container.textContent).toContain("POD GENERATED");
    expect(container.textContent).toContain("Hotel operating license");
    expect(container.textContent).toContain("READY");

    clickElement(findButton(container, "Permit Routing"));
    clickElement(findButton(container, "Route Evidence"));
    expect(container.textContent).toContain("Zoning conformance letter routed to Roots evidence vault.");

    clickElement(findButton(container, "Stress Modeling"));
    expect(container.textContent).toContain("UNSAVED STRESS");
    expect(container.textContent).toContain("Scenario comparison chart");
    expect(container.textContent).toContain("Custom Stress");
    expect(container.textContent).toContain("vs. base DSCR");
    clickElement(findButton(container, "Apply Downside Stress"));
    expect(container.textContent).toContain("DSCR 0.83x");
    expect(container.textContent).toContain("Approval Gate");
    clickElement(findButton(container, "Save Scenario to Deal Model"));
    expect(container.textContent).toContain("SAVED TO MODEL");
  });

  it("lets the Agent Platform advance tasks and route selected outputs to human approval", () => {
    const { container } = renderModule(<LiveAgentDashboard />);

    expect(container.querySelector('[data-testid="live-agent-platform"]')).not.toBeNull();
    expect(container.textContent).toContain("AI Agent Operations Console");
    expect(container.textContent).toContain("Vector");
    expect(container.textContent).toContain("Refinance review memo with savings trigger");

    clickElement(findButton(container, "Advance task state"));
    expect(container.textContent).toContain("running");
    expect(container.textContent).toContain("Progress58%");

    clickElement(findButton(container, "Route approval"));
    expect(container.textContent).toContain("review");
    expect(container.textContent).toContain("Progress82%");

    clickElement(findButton(container, "Agent Flow"));
    expect(container.textContent).toContain("Agent-flow subscription simulation");
    expect(container.textContent).toContain("Vector");
    clickElement(findButton(container, "Stream next event"));
    expect(container.textContent).toContain("Workpaper draft");
    clickElement(findButton(container, "Route human gate"));
    expect(container.textContent).toContain("human gate routed");
  });

  it("verifies CovenantMonitoring source contains covenant tracking and tRPC integration", () => {
    const { readFileSync } = require('node:fs');
    const { resolve } = require('node:path');
    const source = readFileSync(resolve(process.cwd(), 'client/src/components/CovenantMonitoring.tsx'), 'utf8');

    expect(source).toContain('trpc.covenantMonitoring.covenants.useQuery');
    expect(source).toContain('Covenant Monitoring');
    expect(source).toContain('compliant');
  });

  it("verifies KYCCompliance source contains KYC checklist and sanctions screening with tRPC", () => {
    const { readFileSync } = require('node:fs');
    const { resolve } = require('node:path');
    const source = readFileSync(resolve(process.cwd(), 'client/src/components/KYCCompliance.tsx'), 'utf8');

    expect(source).toContain('trpc.kyc.kycChecklist.useQuery');
    expect(source).toContain('trpc.kyc.sanctionsScreening.useMutation');
    expect(source).toContain('KYC Compliance');
    expect(source).toContain('Entity verification');
  });
});
