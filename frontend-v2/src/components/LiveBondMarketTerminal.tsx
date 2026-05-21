import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StreamingMTMTicker } from '@/components/StreamingMTMTicker';
import { CallPutExerciseDialog } from '@/components/CallPutExerciseDialog';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Landmark,
  LineChart,
  LockKeyhole,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';

type BondStatus = 'watch' | 'review' | 'ready' | 'blocked';

type DeskBond = {
  id: string;
  issuer: string;
  faceValue: number;
  coupon: number;
  maturity: string;
  price: number;
  spread: number;
  callWindowMonths: number;
  putWindowMonths: number;
  surety: 'wrapped' | 'pending' | 'none';
  ratingPath: 'A target' | 'BBB review' | 'AA comp';
  status: BondStatus;
  action: string;
};

const deskBonds: DeskBond[] = [
  {
    id: 'NEST-2029-A',
    issuer: 'Riverside Mixed-Use Portfolio',
    faceValue: 24600000,
    coupon: 4.85,
    maturity: '2029-09-01',
    price: 101.42,
    spread: 94,
    callWindowMonths: 14,
    putWindowMonths: 0,
    surety: 'wrapped',
    ratingPath: 'A target',
    status: 'review',
    action: 'Review refinance window and investor reverse inquiry.',
  },
  {
    id: 'NEST-2031-B',
    issuer: 'Infrastructure Sleeve',
    faceValue: 68000000,
    coupon: 5.15,
    maturity: '2031-04-15',
    price: 98.17,
    spread: 121,
    callWindowMonths: 28,
    putWindowMonths: 9,
    surety: 'pending',
    ratingPath: 'BBB review',
    status: 'watch',
    action: 'Hold pending surety packet and rating-gap closure.',
  },
  {
    id: 'NEST-2027-C',
    issuer: 'Surety-Backed Pipeline',
    faceValue: 173000000,
    coupon: 4.62,
    maturity: '2027-12-01',
    price: 100.08,
    spread: 76,
    callWindowMonths: 5,
    putWindowMonths: 0,
    surety: 'pending',
    ratingPath: 'A target',
    status: 'ready',
    action: 'Prepare launch grid with wrap economics and placement list.',
  },
  {
    id: 'MUNI-COMP-AA',
    issuer: 'AA Municipal Comp Lane',
    faceValue: 40500000,
    coupon: 4.18,
    maturity: '2030-06-01',
    price: 102.03,
    spread: 64,
    callWindowMonths: 34,
    putWindowMonths: 0,
    surety: 'none',
    ratingPath: 'AA comp',
    status: 'ready',
    action: 'Use as benchmark lane for coupon and spread commentary.',
  },
];

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function statusBadge(status: BondStatus) {
  if (status === 'ready') return 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100';
  if (status === 'blocked') return 'border-red-300/30 bg-red-500/10 text-red-100';
  if (status === 'review') return 'border-amber-300/35 bg-amber-400/10 text-amber-100';
  return 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100';
}

export function LiveBondMarketTerminal() {
  const [selectedId, setSelectedId] = useState(deskBonds[0].id);
  const [rateShift, setRateShift] = useState(0);
  const [spreadShift, setSpreadShift] = useState(0);
  const [scenario, setScenario] = useState<'base' | 'refi' | 'placement'>('base');
  const [deskLog, setDeskLog] = useState<string[]>([
    'Bond Desk opened as working module: live rows, scenarios, call/put review, and action states are active.',
    'Vector queued call-window review for NEST-2029-A.',
  ]);

  const selectedBond = deskBonds.find((bond) => bond.id === selectedId) ?? deskBonds[0];

  const adjustedPrice = useMemo(() => {
    const scenarioBump = scenario === 'refi' ? 0.82 : scenario === 'placement' ? -0.35 : 0;
    return selectedBond.price - rateShift * 0.035 - spreadShift * 0.012 + scenarioBump;
  }, [selectedBond, rateShift, spreadShift, scenario]);

  const savingsEstimate = useMemo(() => {
    const couponSavings = Math.max(selectedBond.coupon - (selectedBond.coupon - rateShift / 100 + spreadShift / 400), 0.05);
    return selectedBond.faceValue * (couponSavings / 100) * Math.max(1, Math.min(selectedBond.callWindowMonths || 12, 18) / 12);
  }, [selectedBond, rateShift, spreadShift]);

  const routeAction = (action: string) => {
    setDeskLog((current) => [`${selectedBond.id}: ${action}`, ...current].slice(0, 7));
  };

  return (
    <div className="space-y-6 text-slate-100" data-testid="live-bond-desk">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-rose-300/25 bg-[#06070d] p-5 shadow-[0_0_85px_rgba(244,63,94,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(244,63,94,0.19),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(34,211,238,0.14),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.74),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-rose-200">
              <Landmark className="h-4 w-4" /> Separate working bond desk module
              <Badge className="border-rose-300/30 bg-rose-400/10 text-rose-100">no static image</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">Bond Desk Terminal</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Select bonds, review call/put timing, tune rate and spread scenarios, and route actions to rating, surety, investor, and approval desks. This is a functional demo module with visible state changes rather than a screenshot-style market graphic.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Desk face value', money(deskBonds.reduce((sum, bond) => sum + bond.faceValue, 0)), 'active monitored lanes'],
              ['Call windows', deskBonds.filter((bond) => bond.callWindowMonths <= 18).length.toString(), 'within 18 months'],
              ['Surety pending', deskBonds.filter((bond) => bond.surety === 'pending').length.toString(), 'packet follow-up'],
              ['Selected px', adjustedPrice.toFixed(2), `${rateShift >= 0 ? '+' : ''}${rateShift} bp curve`],
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

      <StreamingMTMTicker onDeskEvent={(event) => setDeskLog((current) => [event, ...current].slice(0, 7))} />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-800 bg-slate-950/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-100">
              <RadioTower className="h-5 w-5" /> Interactive market tape
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
                <tr className="border-b border-slate-800">
                  <th className="py-3 pr-4">Bond</th>
                  <th className="py-3 pr-4">Face</th>
                  <th className="py-3 pr-4">Coupon</th>
                  <th className="py-3 pr-4">Px</th>
                  <th className="py-3 pr-4">Spread</th>
                  <th className="py-3 pr-4">Call/Put</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {deskBonds.map((bond) => {
                  const isSelected = bond.id === selectedId;
                  return (
                    <tr
                      key={bond.id}
                      onClick={() => setSelectedId(bond.id)}
                      className={`cursor-pointer border-b border-slate-900 transition hover:bg-cyan-400/5 ${isSelected ? 'bg-cyan-400/10' : ''}`}
                    >
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-white">{bond.id}</p>
                        <p className="text-xs text-slate-400">{bond.issuer}</p>
                      </td>
                      <td className="py-4 pr-4 font-mono text-slate-200">{money(bond.faceValue)}</td>
                      <td className="py-4 pr-4 font-mono text-slate-200">{bond.coupon.toFixed(2)}%</td>
                      <td className="py-4 pr-4 font-mono text-emerald-200">{(bond.price - rateShift * 0.035 - spreadShift * 0.012).toFixed(2)}</td>
                      <td className="py-4 pr-4 font-mono text-slate-200">{bond.spread + spreadShift} bp</td>
                      <td className="py-4 pr-4 text-slate-300">{bond.callWindowMonths}m call · {bond.putWindowMonths || '—'} put</td>
                      <td className="py-4 pr-4"><Badge className={statusBadge(bond.status)}>{bond.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-rose-300/20 bg-slate-950/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-100">
              <Target className="h-5 w-5" /> Selected bond workbench
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-rose-200">{selectedBond.id}</p>
              <h2 className="mt-2 text-2xl font-black text-white">{selectedBond.issuer}</h2>
              <p className="mt-2 text-sm text-slate-300">{selectedBond.action}</p>
            </div>

            <Tabs value={scenario} onValueChange={(value) => setScenario(value as typeof scenario)}>
              <TabsList className="grid w-full grid-cols-3 border border-slate-800 bg-slate-950">
                <TabsTrigger value="base">Base</TabsTrigger>
                <TabsTrigger value="refi">Refi</TabsTrigger>
                <TabsTrigger value="placement">Placement</TabsTrigger>
              </TabsList>
              <TabsContent value={scenario} className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Adjusted price</p>
                    <p className="mt-2 text-3xl font-black text-white">{adjustedPrice.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Savings signal</p>
                    <p className="mt-2 text-3xl font-black text-emerald-200">{money(savingsEstimate)}</p>
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-300">Curve shift</span>
                    <span className="font-mono text-cyan-100">{rateShift >= 0 ? '+' : ''}{rateShift} bp</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[-50, -25, 0, 25, 50].map((shift) => (
                      <Button key={shift} type="button" size="sm" variant={rateShift === shift ? 'default' : 'outline'} onClick={() => setRateShift(shift)}>
                        {shift >= 0 ? '+' : ''}{shift}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-sm text-slate-300">Spread shift</span>
                    <span className="font-mono text-cyan-100">{spreadShift >= 0 ? '+' : ''}{spreadShift} bp</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[-20, 0, 25, 50, 75].map((shift) => (
                      <Button key={shift} type="button" size="sm" variant={spreadShift === shift ? 'default' : 'outline'} onClick={() => setSpreadShift(shift)}>
                        {shift >= 0 ? '+' : ''}{shift}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <CallPutExerciseDialog bond={selectedBond} onConfirm={(message) => routeAction(message)} />

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => routeAction('Vector call/put review generated and sent to approval queue.')}>
                <Activity className="mr-2 h-4 w-4" /> Run call/put review
              </Button>
              <Button type="button" variant="outline" className="border-emerald-300/35 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15" onClick={() => routeAction('Sterling investor grid refreshed with selected bond and scenario assumptions.')}>
                <TrendingUp className="mr-2 h-4 w-4" /> Refresh investor grid
              </Button>
              <Button type="button" variant="outline" className="border-amber-300/35 bg-amber-400/10 text-amber-100 hover:bg-amber-400/15" onClick={() => routeAction('Surety/rating packet routed for gap review before external distribution.')}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Route packet
              </Button>
              <Button type="button" variant="outline" className="border-rose-300/35 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15" onClick={() => routeAction('Human approval gate locked: no outbound action until compliance approves.')}>
                <LockKeyhole className="mr-2 h-4 w-4" /> Lock approval gate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-amber-300/20 bg-slate-950/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-100">
              <LineChart className="h-5 w-5" /> Scenario ladder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['Base market', selectedBond.spread + spreadShift, adjustedPrice, 'Maintain surveillance'],
              ['Refi window', selectedBond.spread + spreadShift - 18, adjustedPrice + 0.72, 'Model savings'],
              ['Placement stress', selectedBond.spread + spreadShift + 37, adjustedPrice - 1.18, 'Widen investor spread'],
            ].map(([label, spread, price, action]) => (
              <div key={String(label)} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div>
                  <p className="font-semibold text-white">{label}</p>
                  <p className="text-xs text-slate-400">{action}</p>
                </div>
                <div className="text-right font-mono text-sm">
                  <p className="text-cyan-100">{Number(spread).toFixed(0)} bp</p>
                  <p className="text-emerald-100">{Number(price).toFixed(2)} px</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-cyan-300/20 bg-slate-950/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-100">
              <ClipboardCheck className="h-5 w-5" /> Desk action log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deskLog.map((event, index) => (
              <div key={`${event}-${index}`} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">
                {index === 0 ? <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : index % 2 ? <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" /> : <ArrowDownRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />}
                <span>{event}</span>
              </div>
            ))}
            {selectedBond.surety === 'pending' ? (
              <div className="mt-3 flex gap-3 rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Surety packet is pending; outbound placement should remain behind the approval gate.</p>
              </div>
            ) : (
              <div className="mt-3 flex gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Selected lane is cleared for supervised desk review and investor-grid preparation.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
