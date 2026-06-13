"use client";

import { useEffect } from "react";

export default function AcademyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[NEST Academy]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030A06] text-[#EDE8DC] flex items-center justify-center p-8">
      <div className="bg-[#0D2218] rounded-2xl border border-red-900/60 p-8 max-w-lg w-full">
        <h2 className="text-2xl font-serif text-red-400 mb-2">Academy Error</h2>
        <p className="font-mono text-xs text-[#7A9A82] mb-6 break-all">
          {error.message ?? "An unexpected error occurred in the academy module."}
        </p>
        <button
          onClick={reset}
          className="bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
