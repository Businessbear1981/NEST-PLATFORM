import React from 'react';
import { Archive, CheckCircle2, Clock, FileStack, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const PACKET_DOCUMENTS = [
  { label: 'Issuer profile and project narrative', status: 'Complete', progress: 100 },
  { label: 'Contractor financials and WIP schedule', status: 'Blocking gap', progress: 35 },
  { label: 'GMP contract, contingency, and draw controls', status: 'Ready for review', progress: 82 },
  { label: 'Insurance certificates and endorsements', status: 'In review', progress: 64 },
  { label: 'Title, permits, and zoning evidence', status: 'Complete', progress: 100 },
];

const APPROVAL_QUEUE = [
  { desk: 'Risk review', owner: 'Sarah Chen', state: 'Complete' },
  { desk: 'Legal evidence review', owner: 'Counsel', state: 'In review' },
  { desk: 'Pricing desk', owner: 'Jennifer Park', state: 'Waiting for quote' },
  { desk: 'Final release', owner: 'David Thompson', state: 'Not started' },
];

function statusClass(status: string) {
  if (status === 'Complete') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (status === 'Blocking gap') return 'border-red-400/30 bg-red-400/10 text-red-200';
  if (status === 'In review' || status === 'Ready for review') return 'border-[#C4A048]/30 bg-[#C4A048]/10 text-[#E8C87A]';
  return 'border-slate-600 bg-slate-800 text-slate-300';
}

export function SuretyPacketPrep() {
  const packetReadiness = Math.round(PACKET_DOCUMENTS.reduce((sum, doc) => sum + doc.progress, 0) / PACKET_DOCUMENTS.length);

  return (
    <Card className="border-slate-700 bg-slate-950/80" data-testid="surety-packet-prep">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#C4A048]">
          <FileStack className="h-5 w-5" />
          Surety Packet Prep
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Packet status, carrier-ready document checklist, submission readiness, and internal approval queue.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-[#C4A048]/20 bg-[#C4A048]/10 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E8C87A]">Packet readiness</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{packetReadiness}%</p>
              <p className="text-sm text-muted-foreground">Carrier draft can be released after financial-statement gap clears.</p>
            </div>
            <Archive className="h-10 w-10 text-[#C4A048]" />
          </div>
          <Progress value={packetReadiness} className="mt-4 h-2" />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {PACKET_DOCUMENTS.map((doc) => (
            <div key={doc.label} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{doc.label}</p>
                  <Progress value={doc.progress} className="mt-3 h-1.5" />
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
          <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-300" /> Approval Queue
          </p>
          <div className="space-y-2">
            {APPROVAL_QUEUE.map((item) => (
              <div key={item.desk} className="flex items-center justify-between rounded-md bg-slate-950/70 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.desk}</p>
                  <p className="text-xs text-muted-foreground">{item.owner}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${statusClass(item.state)}`}>
                  {item.state === 'Complete' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {item.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
