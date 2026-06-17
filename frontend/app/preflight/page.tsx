"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PreflightInterview from "@/components/PreflightInterview";

function PreflightContent() {
  const params = useSearchParams();
  const router = useRouter();
  const dealId = params.get("deal_id") || "";

  if (!dealId) {
    return (
      <div className="p-8 space-y-4">
        <div className="rounded-[1.5rem] border border-[#C4A048]/25 bg-[#060E1A] p-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[#C4A048] mb-2">Preflight Interview</p>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>No Deal Selected</h1>
          <p className="mt-2 text-sm text-[#7A9A82]">
            Start from <a href="/deal-input" className="text-[#C4A048] hover:underline">Deal Intake</a> to create a deal, then return here for the preflight interview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PreflightInterview
      dealId={dealId}
      onComplete={() => router.push(`/workflow?deal_id=${dealId}`)}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="p-8 text-[#7A9A82] font-mono text-sm">Loading preflight…</div>
    }>
      <PreflightContent />
    </Suspense>
  );
}
