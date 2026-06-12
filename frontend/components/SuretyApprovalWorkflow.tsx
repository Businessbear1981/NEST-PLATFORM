import React from 'react';
import { CheckCircle2, Clock, FileSignature, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ApprovalStage {
  stage: string;
  reviewer: string;
  status: 'completed' | 'in-progress' | 'pending';
  output: string;
}

const APPROVAL_STAGES: ApprovalStage[] = [
  {
    stage: 'Underwriting Review',
    status: 'completed',
    reviewer: 'Sarah Chen',
    output: 'Evidence file checked; contractor-financial gap remains tracked.',
  },
  {
    stage: 'Risk Assessment',
    status: 'completed',
    reviewer: 'Michael Rodriguez',
    output: 'Sponsor strength, contingency, schedule risk, and title risk scored.',
  },
  {
    stage: 'Pricing Approval',
    status: 'in-progress',
    reviewer: 'Jennifer Park',
    output: 'Waiting for accepted carrier quote and premium sensitivity memo.',
  },
  {
    stage: 'Final Approval',
    status: 'pending',
    reviewer: 'David Thompson',
    output: 'Policy issuance remains locked until risk and pricing sign-off.',
  },
];

function statusStyle(status: ApprovalStage['status']) {
  if (status === 'completed') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (status === 'in-progress') return 'border-[#C4A048]/30 bg-[#C4A048]/10 text-[#E8C87A]';
  return 'border-[#1E4A2E] bg-[#0D2218] text-[#EDE8DC]';
}

function progressFor(status: ApprovalStage['status']) {
  if (status === 'completed') return 100;
  if (status === 'in-progress') return 50;
  return 0;
}

export function SuretyApprovalWorkflow() {
  const completeStages = APPROVAL_STAGES.filter((stage) => stage.status === 'completed').length;
  const workflowProgress = Math.round((completeStages / APPROVAL_STAGES.length) * 100);

  return (
    <Card className="border-[#1E4A2E] bg-black/80" data-testid="surety-approval-workflow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#C4A048]">
          <Users className="h-5 w-5" />
          Approval Workflow
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Risk review, pricing approval, final authorization, and policy issuance gates stay visible before release.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-[#1E4A2E] bg-[#030A06]/70 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">Workflow progress</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{workflowProgress}% released</p>
            </div>
            <FileSignature className="h-9 w-9 text-[#C4A048]" />
          </div>
          <Progress value={workflowProgress} className="mt-3 h-2" />
        </div>

        {APPROVAL_STAGES.map((item) => (
          <div key={item.stage} className="rounded-lg border border-[#1E4A2E] bg-[#030A06]/70 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{item.stage}</p>
                <p className="text-sm text-muted-foreground">Reviewer: {item.reviewer}</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-[0.08em] ${statusStyle(item.status)}`}>
                {item.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                {item.status}
              </span>
            </div>
            <Progress value={progressFor(item.status)} className="h-1" />
            <p className="mt-3 text-sm text-muted-foreground">{item.output}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
