/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import { PAGE_TRANSITION_DURATION_MS } from "@/lib/pageTransition";

const routeMock = vi.hoisted(() => ({
  location: "/",
  setLocation: vi.fn(),
}));

vi.mock("wouter", () => ({
  useLocation: () => [routeMock.location, routeMock.setLocation] as const,
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type RenderedLoader = {
  container: HTMLDivElement;
  root: Root;
};

const mountedLoaders: RenderedLoader[] = [];

const renderLoader = (initialLocation = "/") => {
  routeMock.location = initialLocation;

  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(<PageTransitionLoader />);
  });

  const rendered = { container, root };
  mountedLoaders.push(rendered);
  return rendered;
};

const rerenderLoader = (rendered: RenderedLoader, nextLocation: string) => {
  routeMock.location = nextLocation;

  act(() => {
    rendered.root.render(<PageTransitionLoader />);
  });
};

const getLoader = (container: HTMLElement) => {
  const loader = container.querySelector(".page-transition-loader");

  if (!(loader instanceof HTMLElement)) {
    throw new Error("Page transition loader was not rendered.");
  }

  return loader;
};

const completeTransitionTimer = () => {
  act(() => {
    vi.advanceTimersByTime(PAGE_TRANSITION_DURATION_MS);
  });
};

describe("PageTransitionLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    routeMock.location = "/";
    routeMock.setLocation.mockClear();
  });

  afterEach(() => {
    for (const { root, container } of mountedLoaders.splice(0)) {
      act(() => {
        root.unmount();
      });
      container.remove();
    }

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("starts hidden on initial mount (no blocking overlay)", () => {
    const { container } = renderLoader("/operations/deals");
    const loader = getLoader(container);

    // Should start hidden — this prevents the black screen on production
    expect(loader.dataset.visible).toBe("false");
    expect(loader.classList.contains("page-transition-loader--visible")).toBe(false);
    expect(container.textContent).toContain("Synchronizing NEST Command Surface");
  });

  it("shows the loader on route change and hides after transition duration", () => {
    const rendered = renderLoader("/operations/deals");
    const loader = getLoader(rendered.container);

    // Initially hidden
    expect(loader.dataset.visible).toBe("false");

    // Navigate to a different route
    rerenderLoader(rendered, "/operations/deals/alpha");

    expect(loader.dataset.visible).toBe("true");
    expect(loader.classList.contains("page-transition-loader--visible")).toBe(true);

    completeTransitionTimer();

    expect(loader.dataset.visible).toBe("false");
  });

  it("stays hidden for query-string or hash-only navigation on the same route", () => {
    const rendered = renderLoader("/operations/deals");
    const loader = getLoader(rendered.container);

    // Initially hidden
    expect(loader.dataset.visible).toBe("false");

    rerenderLoader(rendered, "/operations/deals?tab=bonds#quote");

    expect(loader.dataset.visible).toBe("false");
    expect(loader.classList.contains("page-transition-loader--visible")).toBe(false);
  });
});
