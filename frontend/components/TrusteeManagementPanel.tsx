"use client";
import { Loader2, Scale, CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";

export default function TrusteeManagementPanel({ dealId }: { dealId?: string }) {
  const tasksQuery = trpc.ratingEsg.trusteeTasks.useQuery();
  const updateTask = trpc.ratingEsg.updateTrusteeTask.useMutation({
    onSuccess: () => tasksQuery.refetch(),
  });

  const data = (tasksQuery.data ?? {}) as any;
  const tasks = data?.tasks ?? [];
  const completionPct = data?.completion_pct ?? 0;

  const phases = ["pre-issuance", "post-issuance", "ongoing"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-200">
          <Scale size={17} /> Trustee Management
        </div>
        <span className="font-mono text-sm text-[#7A9A82]">
          {data?.completed ?? 0}/{data?.total ?? 0} complete
        </span>
      </div>

      <Progress value={completionPct} className="h-2" />

      {phases.map((phase) => {
        const phaseTasks = tasks.filter((t: any) => t.phase === phase);
        if (phaseTasks.length === 0) return null;
        return (
          <div key={phase}>
            <h3 className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7A9A82] mb-2">
              {phase.replace("-", " ")}
            </h3>
            <div className="space-y-1">
              {phaseTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {task.status === "completed" ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : task.status === "in_progress" ? (
                      <Clock size={16} className="text-amber-300" />
                    ) : (
                      <Circle size={16} className="text-[#7A9A82]" />
                    )}
                    <span className={`font-mono text-sm ${task.status === "completed" ? "text-[#7A9A82] line-through" : "text-white"}`}>
                      {task.task}
                    </span>
                  </div>
                  {task.status !== "completed" && (
                    <Button
                      onClick={() => updateTask.mutate({ taskId: task.id, status: "completed" })}
                      disabled={updateTask.isPending}
                      className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 font-mono text-[0.58rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
