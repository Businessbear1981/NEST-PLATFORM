import React from 'react';
import { AlertCircle, CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type EvidenceStatus = 'received' | 'in-review' | 'missing' | 'approved';

interface ChecklistItem {
  id: string;
  category: string;
  document: string;
  coverageType: string;
  status: EvidenceStatus;
  blocking: boolean;
  owner: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'surety-check-1',
    category: 'Contractor Financials',
    document: 'Three-year CPA financial statements and WIP schedule',
    coverageType: 'Performance bond',
    status: 'missing',
    blocking: true,
    owner: 'Client CFO',
  },
  {
    id: 'surety-check-2',
    category: 'Insurance',
    document: 'GL / builder risk certificates with NEST named insured',
    coverageType: 'Wrap and liability stack',
    status: 'in-review',
    blocking: true,
    owner: 'Risk desk',
  },
  {
    id: 'surety-check-3',
    category: 'Project Evidence',
    document: 'GMP contract, schedule, contingency, and draw controls',
    coverageType: 'Completion support',
    status: 'received',
    blocking: false,
    owner: 'Project controls',
  },
  {
    id: 'surety-check-4',
    category: 'Legal / Title',
    document: 'Title commitment, zoning letter, and permit matrix',
    coverageType: 'Surety underwriting file',
    status: 'approved',
    blocking: false,
    owner: 'Counsel',
  },
];

const STATUS_STYLES: Record<EvidenceStatus, string> = {
  received: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  'in-review': 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  missing: 'border-red-400/30 bg-red-400/10 text-red-200',
  approved: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
};

export function SuretySubmissionChecklist() {
  const completed = CHECKLIST_ITEMS.filter((item) => item.status === 'approved' || item.status === 'received').length;
  const completionRate = Math.round((completed / CHECKLIST_ITEMS.length) * 100);
  const blockingItems = CHECKLIST_ITEMS.filter((item) => item.blocking && item.status !== 'approved').length;

  return (
    <Card className="border-slate-700 bg-slate-950/80" data-testid="surety-submission-checklist">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-300">
          <FileCheck2 className="h-5 w-5" />
          Surety Submission Checklist
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Required documents, coverage categories, evidence status, and blocking items for carrier-ready submission.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Readiness</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{completionRate}%</p>
            <Progress value={completionRate} className="mt-2 h-1.5" />
          </div>
          <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-red-200">Blocking items</p>
            <p className="mt-1 text-2xl font-bold text-red-100">{blockingItems}</p>
          </div>
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Coverage classes</p>
            <p className="mt-1 text-2xl font-bold text-emerald-100">4</p>
          </div>
        </div>

        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {item.status === 'approved' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    ) : item.blocking ? (
                      <AlertCircle className="h-4 w-4 text-red-300" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-cyan-300" />
                    )}
                    <p className="font-semibold text-foreground">{item.category}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.document}</p>
                  <p className="mt-2 text-xs text-cyan-200">Coverage: {item.coverageType}</p>
                </div>
                <div className="text-left md:text-right">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${STATUS_STYLES[item.status]}`}>
                    {item.status.replace('-', ' ')}
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground">Owner: {item.owner}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
