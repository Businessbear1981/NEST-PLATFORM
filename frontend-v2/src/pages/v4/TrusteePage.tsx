/**
 * Trustee Liaison Desk — Trustee relationship management, fee benchmarking,
 * and live task tracking via /api/trustee/tasks.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const TRUSTEE_BANKS = [
  { name: "U.S. Bank", tier: "dominant", specialty: "Largest muni trustee, national", fee_range: "$3,500-$7,500/yr", strengths: ["Dominant market share", "Full-service platform", "National coverage"] },
  { name: "BNY Mellon", tier: "dominant", specialty: "National, large issuances", fee_range: "$4,000-$8,000/yr", strengths: ["Large deal expertise", "Global platform", "Corporate trust leader"] },
  { name: "Wilmington Trust", tier: "major", specialty: "Structured finance", fee_range: "$3,000-$6,500/yr", strengths: ["Structured finance expertise", "Flexible terms", "Growing muni presence"] },
  { name: "UMB Bank", tier: "major", specialty: "Midwest, growing national", fee_range: "$2,500-$5,500/yr", strengths: ["Competitive pricing", "Responsive service", "Growing platform"] },
  { name: "Zions Bank", tier: "regional", specialty: "Western US", fee_range: "$2,000-$4,500/yr", strengths: ["Regional expertise", "Competitive fees", "Personal service"] },
  { name: "Computershare Trust", tier: "major", specialty: "Corporate trust", fee_range: "$3,500-$7,000/yr", strengths: ["Technology platform", "Global reach", "Automated reporting"] },
  { name: "Regions Trust", tier: "regional", specialty: "Southeast", fee_range: "$2,000-$4,000/yr", strengths: ["Southeast coverage", "Relationship-driven", "Competitive"] },
  { name: "Truist", tier: "major", specialty: "Southeast (BB&T/SunTrust)", fee_range: "$2,500-$5,500/yr", strengths: ["Large balance sheet", "Full-service", "Southeast anchor"] },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "border-slate-500 text-slate-400",
  in_progress: "border-cyan-400/40 text-cyan-300",
  completed: "border-emerald-400/40 text-emerald-300",
  blocked: "border-red-400/40 text-red-400",
};

const PHASE_LABEL: Record<string, string> = {
  "pre-issuance": "Pre-Issuance",
  "post-issuance": "Post-Issuance",
  "ongoing": "Ongoing",
};

export default function TrusteePage() {
  const [activeTab, setActiveTab] = useState("providers");
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<string>("");

  useEffect(() => {
    if (activeTab !== "tasks") return;
    setTasksLoading(true);
    const url = `/api/trustee/tasks${phaseFilter ? `?phase=${phaseFilter}` : ""}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { if (d.success) setTasks(d.data); })
      .catch(() => {})
      .finally(() => setTasksLoading(false));
  }, [activeTab, phaseFilter]);

  const patchTask = (taskId: string, status: string) => {
    fetch(`/api/trustee/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      })
      .catch(() => {});
  };

  const grouped = tasks.reduce((acc: Record<string, any[]>, t) => {
    (acc[t.phase] = acc[t.phase] || []).push(t);
    return acc;
  }, {});

  const completedCount = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-cyan-300/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(34,211,238,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-cyan-200">Trustee Liaison Desk · 5 Agents</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>Trustee Management</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Trustee selection, fee benchmarking, performance tracking, document coordination, and reporting. Every bond has a trustee — this desk manages those relationships.</p>
          </div>
          {tasks.length > 0 && (
            <div className="text-right">
              <p className="font-mono text-2xl text-emerald-400">{completedCount}/{tasks.length}</p>
              <p className="font-mono text-[0.6rem] uppercase text-slate-500">Tasks Complete</p>
            </div>
          )}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[640px]">
          <TabsTrigger value="providers">Trustee Banks</TabsTrigger>
          <TabsTrigger value="tasks">Task Tracking</TabsTrigger>
          <TabsTrigger value="fees">Fee Benchmarking</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUSTEE_BANKS.map((t) => (
              <Card key={t.name} className="border-slate-700 bg-[#0D2218] hover:border-cyan-500/40 transition">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm text-white">{t.name}</CardTitle>
                    <Badge variant="outline" className={t.tier === "dominant" ? "border-cyan-400/40 text-cyan-300" : t.tier === "major" ? "border-emerald-400/40 text-emerald-300" : "border-slate-500 text-slate-400"}>{t.tier}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-slate-400">{t.specialty}</p>
                  <p className="font-mono text-sm text-[#C4A048]">{t.fee_range}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.strengths.map((s) => <span key={s} className="text-[0.6rem] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-slate-400">{s}</span>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="flex gap-2 mb-4">
            {["", "pre-issuance", "post-issuance", "ongoing"].map(p => (
              <Button key={p} size="sm" variant={phaseFilter === p ? "default" : "outline"}
                className={phaseFilter === p ? "bg-cyan-700 text-white" : "border-slate-700 text-slate-400"}
                onClick={() => setPhaseFilter(p)}>
                {p ? PHASE_LABEL[p] : "All Phases"}
              </Button>
            ))}
          </div>
          {tasksLoading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6 text-center text-slate-500 text-sm">No tasks loaded. Tasks are seeded per deal when first accessed via /api/trustee/deals/&lt;deal_id&gt;/tasks.</CardContent></Card>
          ) : (
            Object.entries(grouped).map(([phase, phaseTasks]) => (
              <div key={phase} className="mb-6">
                <h3 className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-cyan-300 mb-3">{PHASE_LABEL[phase] || phase}</h3>
                <div className="space-y-2">
                  {(phaseTasks as any[]).map(task => (
                    <Card key={task.id} className="border-slate-700 bg-[#0D2218]">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{task.task_label}</span>
                            <Badge variant="outline" className={STATUS_COLOR[task.status] || "border-slate-500 text-slate-400"}>{task.status.replace("_", " ")}</Badge>
                          </div>
                          {task.assignee && <p className="text-xs text-slate-500 mt-0.5">Assigned: {task.assignee}</p>}
                          {task.due_date && <p className="text-xs text-slate-500">Due: {task.due_date}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {task.status !== "completed" && (
                            <Button size="sm" variant="outline" className="border-emerald-700/50 text-emerald-400 h-7 text-xs"
                              onClick={() => patchTask(task.id, "completed")}>Done</Button>
                          )}
                          {task.status === "pending" && (
                            <Button size="sm" variant="outline" className="border-cyan-700/50 text-cyan-400 h-7 text-xs"
                              onClick={() => patchTask(task.id, "in_progress")}>Start</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="fees" className="mt-6">
          <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6">
            <p className="text-sm text-slate-300">Fee benchmarking module — compare trustee fees across providers by deal size, complexity, and sector. Coming soon: live fee quotes from trustee bank APIs.</p>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-6">
          <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6">
            <p className="text-sm text-slate-300">Trustee performance tracking — response times, reporting quality, error rates, relationship health scores. Populated as deals enter administration.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
