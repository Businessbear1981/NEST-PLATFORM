/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type AuthState = {
  user: { name: string } | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
};

type QueryState<T> = {
  data?: T[];
  isLoading: boolean;
  isError: boolean;
};

const mocks = vi.hoisted(() => {
  const auth: AuthState = {
    user: null,
    loading: false,
    isAuthenticated: false,
    logout: vi.fn(),
  };

  const query = <T,>(data: T[] = []): QueryState<T> => ({
    data,
    isLoading: false,
    isError: false,
  });

  return {
    auth,
    deals: query(),
    approvals: query(),
    targets: query(),
  };
});

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => mocks.auth,
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    deals: {
      list: {
        useQuery: () => mocks.deals,
      },
    },
    approvals: {
      listPending: {
        useQuery: () => mocks.approvals,
      },
    },
    mTargets: {
      list: {
        useQuery: () => mocks.targets,
      },
    },
  },
}));

import Home from "@/pages/Home";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type RenderedPage = {
  container: HTMLDivElement;
  root: Root;
};

const mountedPages: RenderedPage[] = [];

function resetMocks() {
  mocks.auth.user = null;
  mocks.auth.loading = false;
  mocks.auth.isAuthenticated = false;
  mocks.auth.logout = vi.fn();
  mocks.deals = { data: [], isLoading: false, isError: false };
  mocks.approvals = { data: [], isLoading: false, isError: false };
  mocks.targets = { data: [], isLoading: false, isError: false };
}

function renderHome() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(<Home />);
  });

  const rendered = { container, root };
  mountedPages.push(rendered);
  return rendered;
}

describe("Home command page render states", () => {
  beforeEach(() => {
    resetMocks();
  });

  afterEach(() => {
    for (const { root, container } of mountedPages.splice(0)) {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  });

  it("renders protected recent-action and system-health states before authentication", () => {
    const { container } = renderHome();

    expect(container.querySelector('[data-testid="home-recent-actions"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="home-system-health"]')).not.toBeNull();
    expect(container.textContent).toContain("Sign in to hydrate the retained action tape");
    expect(container.textContent).toContain("Login required before backend hydration.");
    expect(container.textContent).toContain("Human gate data is protected.");
    expect(container.textContent).toContain("Target intelligence requires login.");
    expect(container.textContent).toContain("protected");
  });

  it("renders loading recent-action and system-health states while backend desks hydrate", () => {
    mocks.auth.user = { name: "NEST Operator" };
    mocks.auth.isAuthenticated = true;
    mocks.deals = { data: [], isLoading: true, isError: false };
    mocks.approvals = { data: [], isLoading: true, isError: false };
    mocks.targets = { data: [], isLoading: true, isError: false };

    const { container } = renderHome();

    expect(container.textContent).toContain("Loading retained operating actions from protected desks");
    expect(container.textContent).toContain("Deal pipeline API");
    expect(container.textContent).toContain("Approval rail API");
    expect(container.textContent).toContain("M&A radar API");
    expect(container.textContent).toContain("loading");
  });

  it("renders a degraded shell when any protected backend query returns an error", () => {
    mocks.auth.user = { name: "NEST Operator" };
    mocks.auth.isAuthenticated = true;
    mocks.deals = { data: [], isLoading: false, isError: false };
    mocks.approvals = { data: [], isLoading: false, isError: true };
    mocks.targets = { data: [], isLoading: false, isError: false };

    const { container } = renderHome();

    expect(container.textContent).toContain("One or more backend desks returned an error state");
    expect(container.textContent).toContain("Approval query returned an error state.");
    expect(container.textContent).toContain("error");
  });

  it("renders populated recent actions from deals, approvals, and M&A targets", () => {
    mocks.auth.user = { name: "NEST Operator" };
    mocks.auth.isAuthenticated = true;
    mocks.deals = {
      data: [{ id: 1, name: "Riverside Mixed-Use Portfolio", issuer: "Apex Capital", status: "active", amount: 173000000 }],
      isLoading: false,
      isError: false,
    };
    mocks.approvals = {
      data: [{ id: 2, type: "rating-package", itemId: 18, notes: "Rating packet requires retained human review." }],
      isLoading: false,
      isError: false,
    };
    mocks.targets = {
      data: [{ id: 3, name: "Sterling Infrastructure Services", recommendation: "Acquire", sector: "Infrastructure" }],
      isLoading: false,
      isError: false,
    };

    const { container } = renderHome();

    expect(container.textContent).toContain("Approval gate · rating-package");
    expect(container.textContent).toContain("Rating packet requires retained human review.");
    expect(container.textContent).toContain("Deal updated · Riverside Mixed-Use Portfolio");
    expect(container.textContent).toContain("Apex Capital is in active status");
    expect(container.textContent).toContain("M&A target scored · Sterling Infrastructure Services");
    expect(container.textContent).toContain("Acquire recommendation in Infrastructure sector.");
    expect(container.textContent).toContain("1 pending gate records.");
  });

  it("renders an authenticated empty state when protected desks return no records", () => {
    mocks.auth.user = { name: "NEST Operator" };
    mocks.auth.isAuthenticated = true;

    const { container } = renderHome();

    expect(container.textContent).toContain("No retained actions yet. Create a deal, target, or approval gate to populate this tape.");
    expect(container.textContent).toContain("0 deal records visible.");
    expect(container.textContent).toContain("0 pending gate records.");
    expect(container.textContent).toContain("0 target scorecards visible.");
    expect(container.textContent).toContain("online");
  });
});
