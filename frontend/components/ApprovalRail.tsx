"use client";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

function typeClass(type: string) {
  if (type === "draw") return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  if (type === "bond") return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
  if (type === "outreach") return "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100";
  return "border-slate-300/20 bg-white/[0.04] text-slate-200";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "approved") return <CheckCircle className="text-emerald-200" size={16} />;
  if (status === "rejected") return <XCircle className="text-red-300" size={16} />;
  return <Clock className="text-amber-200" size={16} />;
}

export function ApprovalRail() {
  const approvalsQuery = trpc.approvals.listPending.useQuery();
  const approveMutation = trpc.approvals.approve.useMutation({ onSuccess: () => approvalsQuery.refetch() });
  const rejectMutation = trpc.approvals.reject.useMutation({ onSuccess: () => approvalsQuery.refetch() });

  const approvals = approvalsQuery.data ?? [];

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-red-200">Approval rail</div>
          <p className="mt-1 text-sm leading-6 text-slate-400">AI prepares work product; humans approve the action record.</p>
        </div>
        <span className="w-fit rounded-full border border-red-300/30 bg-red-400/10 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-red-100">{approvals.length} pending</span>
      </div>

      {approvalsQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-red-300/20 bg-black/30 p-8 text-sm text-slate-400"><Loader2 className="mr-2 animate-spin text-red-200" size={16} /> Loading approval queue...</div>
      ) : approvals.length > 0 ? (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <article key={approval.id} className="rounded-2xl border border-red-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(248,113,113,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusIcon status={approval.status} />
                    <span className={`rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.13em] ${typeClass(approval.type)}`}>{approval.type}</span>
                    <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-slate-500">Item #{approval.itemId}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{approval.notes || "Approval request awaiting review."}</p>
                  <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-slate-600">Requested {new Date(approval.createdAt).toLocaleDateString()}</p>
                </div>

                {approval.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => approveMutation.mutate({ approvalId: approval.id, notes: "Approved from NEST operations workbench" })}
                      disabled={approveMutation.isPending}
                      className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-60"
                    >
                      {approveMutation.isPending ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate({ approvalId: approval.id, notes: "Rejected from NEST operations workbench" })}
                      disabled={rejectMutation.isPending}
                      className="rounded-xl border border-red-300/35 bg-red-400/12 px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-red-100 hover:bg-red-400/20 disabled:opacity-60"
                    >
                      {rejectMutation.isPending ? "..." : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-red-300/25 bg-red-400/5 p-8 text-center text-sm text-slate-400">No pending approvals. New draw, bond, outreach, and committee items will appear here.</div>
      )}
    </div>
  );
}
