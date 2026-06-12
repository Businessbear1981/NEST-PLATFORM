"use client";
import React, { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardCheck, LockKeyhole, PlayCircle, ShieldCheck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ExerciseType = 'call' | 'put';

type ExerciseStatus = 'draft' | 'review' | 'confirmed';

export type CallPutBond = {
  id: string;
  issuer: string;
  faceValue: number;
  coupon: number;
  price: number;
  spread: number;
  callWindowMonths: number;
  putWindowMonths: number;
};

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function statusClass(status: ExerciseStatus) {
  if (status === 'confirmed') return 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100';
  if (status === 'review') return 'border-amber-300/35 bg-amber-400/10 text-amber-100';
  return 'border-[#C4A048]/30 bg-[#C4A048]/10 text-[#EDE8DC]';
}

export function CallPutExerciseDialog({ bond, onConfirm }: { bond: CallPutBond; onConfirm?: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('call');
  const [status, setStatus] = useState<ExerciseStatus>('draft');
  const schedule = useMemo(() => {
    const activeMonths = exerciseType === 'call' ? bond.callWindowMonths : bond.putWindowMonths;
    const windowLabel = activeMonths > 0 ? `${activeMonths} months` : 'not currently active';
    const recommendation = exerciseType === 'call'
      ? bond.callWindowMonths <= 18 ? 'Model refinance savings and route to principal approval.' : 'Monitor; call window is outside active execution range.'
      : bond.putWindowMonths > 0 ? 'Prepare investor put-liquidity analysis and desk communication draft.' : 'No put right is available on this monitored lane.';
    const economics = exerciseType === 'call'
      ? Math.max(0, (bond.coupon - 4.35) / 100) * bond.faceValue
      : Math.max(0, (100 - bond.price) / 100) * bond.faceValue;
    return { activeMonths, windowLabel, recommendation, economics };
  }, [bond, exerciseType]);

  const routeReview = () => {
    setStatus('review');
  };

  const confirmExercise = () => {
    const message = `${exerciseType.toUpperCase()} exercise package confirmed for human approval gate; ${schedule.recommendation}`;
    setStatus('confirmed');
    onConfirm?.(message);
  };

  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4" data-testid="call-put-exercise-dialog">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-amber-200">
            <CalendarClock className="h-4 w-4" /> Call / put exercise workflow
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">Open a controlled exercise ticket, review schedule economics, and confirm routing to the human approval gate.</p>
        </div>
        <Badge className={statusClass(status)}>{status}</Badge>
      </div>

      <Button type="button" className="mt-4 bg-amber-300 text-slate-950 hover:bg-amber-200" onClick={() => setOpen((value) => !value)}>
        <PlayCircle className="mr-2 h-4 w-4" /> {open ? 'Hide exercise dialog' : 'Open exercise dialog'}
      </Button>

      {open ? (
        <div className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-[0_0_45px_rgba(251,191,36,0.08)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">{bond.id}</p>
              <h3 className="mt-1 text-xl font-black text-white">{bond.issuer}</h3>
              <p className="mt-1 text-sm text-slate-400">{money(bond.faceValue)} face · {bond.coupon.toFixed(2)}% coupon · {bond.price.toFixed(2)} px · +{bond.spread} bp</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
              <Button type="button" size="sm" variant={exerciseType === 'call' ? 'default' : 'outline'} onClick={() => { setExerciseType('call'); setStatus('draft'); }}>Call</Button>
              <Button type="button" size="sm" variant={exerciseType === 'put' ? 'default' : 'outline'} onClick={() => { setExerciseType('put'); setStatus('draft'); }}>Put</Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-slate-500">Window</p>
              <p className="mt-1 text-lg font-black text-white">{schedule.windowLabel}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-slate-500">Economics</p>
              <p className="mt-1 text-lg font-black text-emerald-100">{money(schedule.economics)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-slate-500">Approval</p>
              <p className="mt-1 text-lg font-black text-amber-100">Human gate</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#C4A048]/20 bg-[#C4A048]/10 p-4 text-sm text-[#EDE8DC]">
            <div className="flex items-center gap-2 font-semibold text-cyan-50"><ClipboardCheck className="h-4 w-4" /> Exercise package recommendation</div>
            <p className="mt-2">{schedule.recommendation}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Button type="button" variant="outline" className="border-[#C4A048]/35 bg-[#C4A048]/10 text-[#EDE8DC] hover:bg-[#C4A048]/15" onClick={routeReview}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Route review
            </Button>
            <Button type="button" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300" onClick={confirmExercise}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm exercise routing
            </Button>
            <Button type="button" variant="outline" className="border-rose-300/35 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15" onClick={() => { setOpen(false); setStatus('draft'); }}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>

          {status === 'confirmed' ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" /> Confirmation is staged behind the approval gate. No outbound trade, investor communication, or exercise notice is represented as executed.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
