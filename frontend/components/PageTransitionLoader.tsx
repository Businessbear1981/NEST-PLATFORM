"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  PAGE_TRANSITION_DURATION_MS,
  shouldStartRouteTransition,
} from "@/lib/pageTransition";

export function PageTransitionLoader() {
  const location = usePathname();
  const previousLocation = useRef(location);
  // Start hidden — only show on actual route changes, never on initial mount
  const [isVisible, setIsVisible] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip the initial mount — don't show loader on first page load
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!shouldStartRouteTransition(previousLocation.current, location)) {
      return;
    }

    previousLocation.current = location;
    setIsVisible(true);

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
    }, PAGE_TRANSITION_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [location]);

  return (
    <div
      aria-live="polite"
      aria-label="Loading NEST command surface"
      className={`page-transition-loader ${isVisible ? "page-transition-loader--visible" : ""}`}
      data-visible={isVisible}
    >
      <div className="page-transition-loader__panel" role="status">
        <div className="page-transition-loader__orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p>Synchronizing NEST Command Surface</p>
          <strong>Routing institutional desks</strong>
        </div>
        <div className="page-transition-loader__scan" aria-hidden="true" />
      </div>
    </div>
  );
}
