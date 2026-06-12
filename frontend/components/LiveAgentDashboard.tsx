"use client";
import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentFlowVisualization } from '@/components/AgentFlowVisualization';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  DatabaseZap,
  FileCheck2,
  LockKeyhole,
  PlayCircle,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

type AgentStatus = 'ready' | 'running' | 'review' | 'approved' | 'blocked';

type AgentTask = {
  id: string;
  agent: string;
  desk: string;
  mission: string;
  inputs: string[];
  output: string;
  approval: string;
  status: AgentStatus;
  progress: number;
};

const initialTasks: AgentTask[] = [
  {
    id: 'vector-call-put',
    agent: 'Vector',
    desk: 'Bond Desk',
    mission: 'Call/put timing review for NEST-2029-A and the surety-backed pipeline.',
    inputs: ['market tape', 'portfolio bonds', 'curve shift', 'call calendar'],
    output: 'Refinance review memo with savings trigger and hold/put recommendation.',
    approval: 'Bond desk principal approval before investor contact.',
    status: 'ready',
    progress: 22,
  },
  {
    id: 'merlin-ma',
    agent: 'Merlin',
    desk: 'M&A Locator',
    mission: 'Build acquisition target universe and qualify sponsor fit for adjacent operating companies.',
    inputs: ['NAICS screen', 'filings', 'portfolio strategy', 'valuation comps'],
    output: 'Target list, fit score, exclusion reasons, and outreach packet draft.',
    approval: 'Executive sponsor approval before outbound outreach.',
    status: 'review',
    progress: 76,
  },
  {
    id: 'morgan-report',
    agent: 'Morgan',
    desk: 'Content Studio',
    mission: 'Convert evidence and model outputs into an investor update and board-ready summary.',
    inputs: ['document vault', 'modeling outputs', 'approval notes', 'risk register'],
    output: 'Investor update, board brief, and compliance review copy.',
    approval: 'Compliance sign-off before external distribution.',
    status: 'ready',
    progress: 45,
  },
  {
    id: 'sterling-placement',
    agent: 'Sterling',
    desk: 'Placement Desk',
    mission: 'Refresh investor book for the surety-backed pipeline with suitability and follow-up states.',
    inputs: ['investor book', 'offering room', 'rating path', 'surety packet'],
    output: 'Segmented investor queue with suggested next action and owner assignment.',
    approval: 'Human placement approval before any send action.',
    status: 'blocked',
    progress: 61,
  },
  {
    id: 'sentinel-risk',
    agent: 'Sentinel',
    desk: 'Risk + Compliance',
    mission: 'Scan agent outputs for missing evidence, unapproved language, and retained-record requirements.',
    inputs: ['agent outputs', 'policy gates', 'evidence graph', 'communication archive'],
    output: 'Exceptions queue and record-retention checklist.',
    approval: 'Compliance portal resolution before release.',
    status: 'approved',
    progress: 100,
  },
];

const statusClasses: Record<AgentStatus, string> = {
  ready: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100',
  running: 'border-violet-300/30 bg-violet-400/10 text-violet-100',
  review: 'border-amber-300/35 bg-amber-400/10 text-amber-100',
  approved: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100',
  blocked: 'border-rose-300/35 bg-rose-400/10 text-rose-100',
};

function nextTaskState(task: AgentTask): AgentTask {
  if (task.status === 'blocked') return { ...task, status: 'review', progress: 72 };
  if (task.status === 'ready') return { ...task, status: 'running', progress: Math.max(task.progress, 58) };
  if (task.status === 'running') return { ...task, status: 'review', progress: 88 };
  if (task.status === 'review') return { ...task, status: 'approved', progress: 100 };
  return { ...task, status: 'ready', progress: 35 };
}

export function LiveAgentDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedId, setSelectedId] = useState(initialTasks[0].id);
  const [events, setEvents] = useState<string[]>([
    'Agent operations console opened with deterministic runnable workflows.',
    'Sentinel approved retained-record checklist for current demo packet.',
  ]);
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? tasks[0];

  const metrics = useMemo(() => {
    const approved = tasks.filter((task) => task.status === 'approved').length;
    const review = tasks.filter((task) => task.status === 'review').length;
    const blocked = tasks.filter((task) => task.status === 'blocked').length;
    const avgProgress = Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length);
    return { approved, review, blocked, avgProgress };
  }, [tasks]);

  const advanceTask = (id: string) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task;
        const updated = nextTaskState(task);
        setEvents((log) => [`${updated.agent}: ${updated.status.toUpperCase()} — ${updated.output}`, ...log].slice(0, 8));
        return updated;
      }),
    );
  };

  const routeApproval = () => {
    setTasks((current) =>
      current.map((task) =>
        task.id === selectedTask.id ? { ...task, status: 'review', progress: Math.max(task.progress, 82) } : task,
      ),
    );
    setEvents((log) => [`${selectedTask.agent}: approval routed — ${selectedTask.approval}`, ...log].slice(0, 8));
  };

  return (
    <div className="space-y-6 text-slate-100" data-testid="live-agent-platform">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-violet-300/25 bg-[#060716] p-5 shadow-[0_0_85px_rgba(139,92,246,0.13)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_13%_10%,rgba(139,92,246,0.2),transparent_35%),radial-gradient(circle_at_88%_0%,rgba(34,211,238,0.15),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.78),rgba(2,6,23,0.97))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-violet-200">
              <BrainCircuit className="h-4 w-4" /> Working agent operations platform
              <Badge className="border-violet-300/30 bg-violet-400/10 text-violet-100">runnable tasks</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">AI Agent Operations Console</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Run agent tasks, move outputs through evidence review, and route approvals. Each action changes task status, progress, and the event log so the demo behaves like an operations console rather than a static image.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Average progress', `${metrics.avgProgress}%`, 'across active tasks'],
              ['Approved outputs', metrics.approved.toString(), 'ready for release path'],
              ['Review queue', metrics.review.toString(), 'human gate required'],
              ['Blocked tasks', metrics.blocked.toString(), 'evidence or surety gap'],
            ].map(([label, value, detail]) => (
              <Card key={label} className="border-white/10 bg-white/[0.045] text-slate-100 shadow-none">
                <CardContent className="p-4">
                  <p className="font-mono text-[0.63rem] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-xs text-slate-400">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4 border border-slate-800 bg-slate-950 lg:w-[760px]">
          <TabsTrigger value="tasks">Task Board</TabsTrigger>
          <TabsTrigger value="flow">Agent Flow</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Outputs</TabsTrigger>
          <TabsTrigger value="events">Event Stream</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-800 bg-slate-950/75 text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-100"><Bot className="h-5 w-5" /> Runnable agent task board</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedId(task.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:border-cyan-300/40 ${selectedTask.id === task.id ? 'border-cyan-300/35 bg-cyan-400/10' : 'border-white/10 bg-white/[0.035]'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">{task.desk}</p>
                      <h3 className="mt-1 text-lg font-black text-white">{task.agent}</h3>
                    </div>
                    <Badge className={statusClasses[task.status]}>{task.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{task.mission}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400"><span>Progress</span><span>{task.progress}%</span></div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-violet-300/20 bg-slate-950/75 text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-violet-100"><PlayCircle className="h-5 w-5" /> Selected agent workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-violet-300/25 bg-violet-400/10 p-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-violet-200">{selectedTask.desk}</p>
                <h2 className="mt-2 text-2xl font-black text-white">{selectedTask.agent}</h2>
                <p className="mt-2 text-sm text-slate-300">{selectedTask.mission}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedTask.inputs.map((input) => (
                  <div key={input} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
                    <DatabaseZap className="h-4 w-4 text-cyan-300" /> {input}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                <div className="flex items-center gap-2 font-semibold text-emerald-50"><FileCheck2 className="h-4 w-4" /> Output generated</div>
                <p className="mt-2">{selectedTask.output}</p>
              </div>
              <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 text-sm text-amber-100">
                <div className="flex items-center gap-2 font-semibold text-amber-50"><LockKeyhole className="h-4 w-4" /> Human approval gate</div>
                <p className="mt-2">{selectedTask.approval}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" className="bg-violet-400 text-slate-950 hover:bg-violet-300" onClick={() => advanceTask(selectedTask.id)}>
                  <Sparkles className="mr-2 h-4 w-4" /> Advance task state
                </Button>
                <Button type="button" variant="outline" className="border-amber-300/35 bg-amber-400/10 text-amber-100 hover:bg-amber-400/15" onClick={routeApproval}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Route approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="mt-5">
          <AgentFlowVisualization />
        </TabsContent>

        <TabsContent value="evidence" className="mt-5 grid gap-4 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="border-slate-800 bg-slate-950/75 text-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-base text-white">
                  <span>{task.agent}</span>
                  <Badge className={statusClasses[task.status]}>{task.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <p>{task.output}</p>
                <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs text-slate-400">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> {task.approval}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-cyan-300/20 bg-slate-950/75 text-slate-100">
            <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-100"><Activity className="h-5 w-5" /> Control actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button type="button" className="w-full justify-between bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => advanceTask('vector-call-put')}>Run Vector <ArrowRight className="h-4 w-4" /></Button>
              <Button type="button" className="w-full justify-between bg-violet-400 text-slate-950 hover:bg-violet-300" onClick={() => advanceTask('merlin-ma')}>Run Merlin <ArrowRight className="h-4 w-4" /></Button>
              <Button type="button" className="w-full justify-between bg-emerald-400 text-slate-950 hover:bg-emerald-300" onClick={() => advanceTask('sterling-placement')}>Clear Sterling <ArrowRight className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-950/75 text-slate-100">
            <CardHeader><CardTitle className="flex items-center gap-2 text-white"><RadioTower className="h-5 w-5 text-cyan-300" /> Agent event stream</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {events.map((event, index) => (
                <div key={`${event}-${index}`} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">
                  {index === 0 ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : index % 3 === 0 ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> : <Target className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />}
                  <span>{event}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
