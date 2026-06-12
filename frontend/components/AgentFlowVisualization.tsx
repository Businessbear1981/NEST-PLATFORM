"use client";
import React, { useMemo, useState } from 'react';
import { Activity, ArrowRight, Bot, BrainCircuit, CheckCircle2, Clock3, DatabaseZap, FileCheck2, LockKeyhole, RadioTower, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type FlowPhase = 'ingest' | 'reason' | 'draft' | 'review' | 'approved';

type FlowNode = {
  id: string;
  agent: string;
  desk: string;
  source: string;
  phase: FlowPhase;
  progress: number;
  nextAction: string;
  evidence: string[];
  output: string;
};

const phaseOrder: FlowPhase[] = ['ingest', 'reason', 'draft', 'review', 'approved'];

const phaseLabels: Record<FlowPhase, string> = {
  ingest: 'Evidence ingest',
  reason: 'Agent reasoning',
  draft: 'Workpaper draft',
  review: 'Human review',
  approved: 'Approved output',
};

const phaseClasses: Record<FlowPhase, string> = {
  ingest: 'border-[#C4A048]/30 bg-[#C4A048]/10 text-[#EDE8DC]',
  reason: 'border-violet-300/30 bg-violet-400/10 text-violet-100',
  draft: 'border-amber-300/35 bg-amber-400/10 text-amber-100',
  review: 'border-rose-300/35 bg-rose-400/10 text-rose-100',
  approved: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100',
};

const initialFlows: FlowNode[] = [
  {
    id: 'vector-call-put-flow',
    agent: 'Vector',
    desk: 'Bond Desk',
    source: 'NEST-2029-A market tape + call calendar',
    phase: 'reason',
    progress: 48,
    nextAction: 'Compare 14-month call window against curve rally and spread compression.',
    evidence: ['MSRB-style comp lane', 'portfolio bond ledger', 'call calendar', 'investor reverse inquiry'],
    output: 'Call/put timing memo with refi trigger and approval-route recommendation.',
  },
  {
    id: 'sterling-book-flow',
    agent: 'Sterling',
    desk: 'Placement Desk',
    source: 'Riverside investor book + suitability rules',
    phase: 'ingest',
    progress: 26,
    nextAction: 'Normalize investor segments and flag accounts requiring suitability review.',
    evidence: ['investor book', 'offering room permissions', 'rating path', 'surety packet status'],
    output: 'Segmented investor grid with contact readiness and owner assignment.',
  },
  {
    id: 'sentinel-compliance-flow',
    agent: 'Sentinel',
    desk: 'Compliance Portal',
    source: 'Agent output archive + approval policy',
    phase: 'review',
    progress: 82,
    nextAction: 'Route external-facing language to retained-record and approval queue.',
    evidence: ['communication draft', 'policy gates', 'evidence citations', 'retention checklist'],
    output: 'Exception report and release gate for supervised communications.',
  },
];

function nextPhase(phase: FlowPhase): FlowPhase {
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[(index + 1) % phaseOrder.length];
}

function nextProgress(phase: FlowPhase, progress: number) {
  if (phase === 'approved') return 22;
  return Math.min(100, Math.max(progress + 18, phase === 'review' ? 92 : 44));
}

export function AgentFlowVisualization() {
  const [flows, setFlows] = useState(initialFlows);
  const [selectedId, setSelectedId] = useState(initialFlows[0].id);
  const [events, setEvents] = useState<string[]>([
    'Subscription simulation armed: agent state changes are deterministic frontend-demo events.',
    'Vector subscribed to market tape, portfolio ledger, and call-calendar evidence.',
  ]);

  const selectedFlow = flows.find((flow) => flow.id === selectedId) ?? flows[0];

  const flowStats = useMemo(() => {
    const reviewCount = flows.filter((flow) => flow.phase === 'review').length;
    const approvedCount = flows.filter((flow) => flow.phase === 'approved').length;
    const avgProgress = Math.round(flows.reduce((sum, flow) => sum + flow.progress, 0) / flows.length);
    return { reviewCount, approvedCount, avgProgress };
  }, [flows]);

  const streamNextEvent = () => {
    setFlows((current) =>
      current.map((flow) => {
        if (flow.id !== selectedFlow.id) return flow;
        const phase = nextPhase(flow.phase);
        const progress = nextProgress(flow.phase, flow.progress);
        const updated = { ...flow, phase, progress };
        setEvents((log) => [
          `${updated.agent}: ${phaseLabels[phase]} · ${updated.output}`,
          ...log,
        ].slice(0, 7));
        return updated;
      }),
    );
  };

  const routeHumanGate = () => {
    setFlows((current) =>
      current.map((flow) =>
        flow.id === selectedFlow.id ? { ...flow, phase: 'review', progress: Math.max(flow.progress, 88) } : flow,
      ),
    );
    setEvents((log) => [
      `${selectedFlow.agent}: human gate routed for ${selectedFlow.desk} approval before release.`,
      ...log,
    ].slice(0, 7));
  };

  return (
    <section className="space-y-5 text-[#EDE8DC]" data-testid="agent-flow-visualization">
      <Card className="overflow-hidden border-violet-300/20 bg-black/75 text-[#EDE8DC]">
        <CardHeader className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(196,160,72,0.12),transparent_28%)]" />
          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-violet-100">
                <BrainCircuit className="h-5 w-5" /> Agent-flow subscription simulation
              </CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7A9A82]">
                A live-demo orchestration lane showing how evidence enters the NEST nervous system, moves through agent reasoning and workpaper drafting, then stops at human review before external action.
              </p>
            </div>
            <Badge className="w-fit border-[#C4A048]/30 bg-[#C4A048]/10 font-mono uppercase tracking-[0.14em] text-[#EDE8DC]">
              simulated live · frontend demo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {[
            ['Average flow progress', `${flowStats.avgProgress}%`, 'across subscribed agents'],
            ['Human review gates', flowStats.reviewCount.toString(), 'must be approved'],
            ['Approved outputs', flowStats.approvedCount.toString(), 'release-ready workpapers'],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7A9A82]">{label}</p>
              <p className="mt-2 text-2xl font-black text-white">{value}</p>
              <p className="mt-1 text-xs text-[#7A9A82]">{detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-[#0D2218] bg-black/75 text-[#EDE8DC]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#EDE8DC]"><RadioTower className="h-5 w-5" /> Live agent state lanes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {flows.map((flow) => {
              const isSelected = flow.id === selectedFlow.id;
              return (
                <button
                  key={flow.id}
                  type="button"
                  onClick={() => setSelectedId(flow.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${isSelected ? 'border-[#C4A048]/40 bg-[#C4A048]/10 shadow-[0_0_30px_rgba(196,160,72,0.09)]' : 'border-white/10 bg-white/[0.035] hover:border-[#C4A048]/30'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#7A9A82]">{flow.desk}</p>
                      <h3 className="mt-1 flex items-center gap-2 text-lg font-black text-white"><Bot className="h-4 w-4 text-violet-200" /> {flow.agent}</h3>
                    </div>
                    <Badge className={phaseClasses[flow.phase]}>{phaseLabels[flow.phase]}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-[#EDE8DC]">{flow.source}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-[#7A9A82]"><span>State transition progress</span><span>{flow.progress}%</span></div>
                    <Progress value={flow.progress} className="h-2" />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-violet-300/20 bg-black/75 text-[#EDE8DC]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-100"><Sparkles className="h-5 w-5" /> Selected flow detail panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-violet-300/25 bg-violet-400/10 p-4">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-violet-200">{selectedFlow.agent} · {selectedFlow.desk}</p>
              <h3 className="mt-2 text-2xl font-black text-white">{phaseLabels[selectedFlow.phase]}</h3>
              <p className="mt-2 text-sm leading-6 text-[#EDE8DC]">{selectedFlow.nextAction}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {selectedFlow.evidence.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-[#EDE8DC]">
                  <DatabaseZap className="h-4 w-4 shrink-0 text-[#C4A048]" /> {item}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <div className="flex items-center gap-2 font-semibold text-emerald-50"><FileCheck2 className="h-4 w-4" /> Output artifact</div>
              <p className="mt-2">{selectedFlow.output}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" className="bg-violet-400 text-[#030A06] hover:bg-violet-300" onClick={streamNextEvent}>
                <Activity className="mr-2 h-4 w-4" /> Stream next event
              </Button>
              <Button type="button" variant="outline" className="border-amber-300/35 bg-amber-400/10 text-amber-100 hover:bg-amber-400/15" onClick={routeHumanGate}>
                <LockKeyhole className="mr-2 h-4 w-4" /> Route human gate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#C4A048]/20 bg-black/75 text-[#EDE8DC]">
        <CardHeader><CardTitle className="flex items-center gap-2 text-[#EDE8DC]"><Clock3 className="h-5 w-5" /> Agent state event stream</CardTitle></CardHeader>
        <CardContent className="grid gap-2 lg:grid-cols-2">
          {events.map((event, index) => (
            <div key={`${event}-${index}`} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-[#EDE8DC]">
              {index === 0 ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : index % 2 === 0 ? <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#C4A048]" /> : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />}
              <span>{event}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
