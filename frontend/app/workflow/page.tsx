"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WorkflowPage } from "@/components/WorkbenchPages";

function WorkflowContent() {
  const params = useSearchParams();
  const dealId = params.get("deal_id") || "";
  return <WorkflowPage dealId={dealId} />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="p-8 text-[#7A9A82] font-mono text-sm">Loading pipeline…</div>
    }>
      <WorkflowContent />
    </Suspense>
  );
}
