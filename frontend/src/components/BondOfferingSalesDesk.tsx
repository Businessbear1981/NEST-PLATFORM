import { useMemo, useState } from 'react';
import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeDollarSign,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Layers3,
  LockKeyhole,
  RadioTower,
  Send,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const candidateBonds = [
  {
    id: 'NEST-2029-A',
    issuer: 'Riverside Mixed-Use Portfolio',
    faceValue: 24600000,
    coupon: 4.85,
    rating: 'A target',
    surety: 'wrapped',
    collateral: 'Mixed-use lease income',
    useCase: 'Senior launch anchor',
    dscr: 1.42,
    ltv: 58,
    icr: 2.3,
    climate: 'moderate physical / low transition',
  },
  {
    id: 'NEST-2031-B',
    issuer: 'Infrastructure Sleeve',
    faceValue: 68000000,
    coupon: 5.15,
    rating: 'BBB review',
    surety: 'pending',
    collateral: 'Infrastructure receivables',
    useCase: 'Mezzanine watch lane',
    dscr: 1.28,
    ltv: 64,
    icr: 1.9,
    climate: 'low physical / moderate operational',
  },
  {
    id: 'NEST-2027-C',
    issuer: 'Surety-Backed Pipeline',
    faceValue: 173000000,
    coupon: 4.62,
    rating: 'A target',
    surety: 'pending',
    collateral: 'Development draw pool',
    useCase: 'Large pool candidate',
    dscr: 1.36,
    ltv: 61,
    icr: 2.1,
    climate: 'moderate physical / moderate transition',
  },
  {
    id: 'MUNI-COMP-AA',
    issuer: 'AA Municipal Comp Lane',
    faceValue: 40500000,
    coupon: 4.18,
    rating: 'AA comp',
    surety: 'none',
    collateral: 'Benchmark comp lane',
    useCase: 'Price guidance benchmark',
    dscr: 1.55,
    ltv: 52,
    icr: 2.8,
    climate: 'benchmark disclosure lane',
  },
];

const investorChannels = [
  { name: 'Insurance accounts', appetite: '$40M-$90M', focus: 'Wrapped A-target paper', status: 'ready' },
  { name: 'Regional banks', appetite: '$15M-$45M', focus: 'Short call-window bonds', status: 'draft' },
  { name: 'Family offices', appetite: '$5M-$25M', focus: 'Higher-coupon mezz sleeve', status: 'approval' },
  { name: 'RIA / advisor desk', appetite: '$2M-$12M', focus: 'Approved allocation notes', status: 'locked' },
  { name: 'Credit funds', appetite: '$20M-$75M', focus: 'Mezzanine yield and covenant package', status: 'approval' },
  { name: 'Strategic buyers', appetite: '$10M-$40M', focus: 'Project-aligned relationship capital', status: 'draft' },
];

const trancheBlueprint = [
  { label: 'Senior A tranche', attach: '0% - 62%', target: 'Insurance · bank treasury', spread: 'T + 85-105 bp', rating: 'A / AA target', suitability: 'low-volatility accounts', covenant: 'senior cash sweep and DSCR lockbox' },
  { label: 'Mezzanine B tranche', attach: '62% - 84%', target: 'Yield accounts · family offices', spread: 'T + 145-190 bp', rating: 'BBB / BB review', suitability: 'income accounts accepting subordination', covenant: 'enhanced reporting and draw controls' },
  { label: 'Residual / retained strip', attach: '84% - 100%', target: 'Sponsor / NEST retained economics', spread: 'Retained / negotiated', rating: 'unrated / retained', suitability: 'sponsor economics and negotiated risk', covenant: 'retained-risk surveillance' },
];

const offeringStages = [
  ['Draft package', 'Issuer, collateral, use-of-proceeds, DSCR/LTV/ICR, climate-risk, and surety evidence are assembled.'],
  ['Compliance review', 'Teaser, private placement memorandum, data-room invite, and outbound scripts are locked for human approval.'],
  ['Approved outreach', 'Investor segments are activated only after rating, surety, and compliance gates clear.'],
  ['Indications received', 'Reverse inquiries, price talk, allocation interest, and data-room requests are recorded.'],
  ['Allocation negotiation', 'Class A/B/residual demand is reconciled with suitability and retained-risk policy.'],
  ['Closing monitor', 'Post-sale covenants, draw controls, surety renewals, and reporting obligations are handed off.'],
];

const monitoringHandoffs = [
  ['Covenants', 'DSCR, LTV, reserve, reporting, and breach-alert state moves to covenant monitoring.'],
  ['Draw controls', 'Construction draws and disbursements stay tied to inspection, retainage, and approval rails.'],
  ['Rating / surety', 'Carrier terms, effective dates, exclusions, and rating-readiness gaps remain visible after sale.'],
  ['Audit trail', 'Every outreach wave, compliance lock, reverse inquiry, and allocation note is retained.'],
];

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function channelBadge(status: string) {
  if (status === 'ready') return 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100';
  if (status === 'approval') return 'border-amber-300/30 bg-amber-400/10 text-amber-100';
  if (status === 'locked') return 'border-red-300/30 bg-red-500/10 text-red-100';
  return 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100';
}

export function BondOfferingSalesDesk() {
  const [selectedBondIds, setSelectedBondIds] = useState<string[]>(['NEST-2029-A', 'NEST-2027-C']);
  const [outreachWave, setOutreachWave] = useState(0);
  const [salesLog, setSalesLog] = useState<string[]>([
    'Offering desk initialized: pooled bond sale, investor queue, surety readiness, and compliance gate are visible.',
    'Sterling prepared preliminary investor segmentation for wrapped and pending-wrap lanes.',
  ]);

  const selectedBonds = useMemo(
    () => candidateBonds.filter((bond) => selectedBondIds.includes(bond.id)),
    [selectedBondIds],
  );

  const totalFace = selectedBonds.reduce((sum, bond) => sum + bond.faceValue, 0);
  const weightedCoupon = totalFace
    ? selectedBonds.reduce((sum, bond) => sum + bond.faceValue * bond.coupon, 0) / totalFace
    : 0;
  const pendingSurety = selectedBonds.filter((bond) => bond.surety !== 'wrapped').length;
  const subscriptionPercent = Math.min(94, 38 + outreachWave * 17 + selectedBonds.length * 8);
  const canLaunch = selectedBonds.length > 0 && pendingSurety <= 1;

  const toggleBond = (bondId: string) => {
    setSelectedBondIds((current) => {
      if (current.includes(bondId)) return current.filter((id) => id !== bondId);
      return [...current, bondId];
    });
  };

  const addLog = (message: string) => {
    setSalesLog((current) => [message, ...current].slice(0, 8));
  };

  const launchOutreach = () => {
    setOutreachWave((current) => current + 1);
    addLog(`Outreach wave ${outreachWave + 1} staged for ${selectedBonds.length} bond lanes and ${investorChannels.length} investor channels; compliance approval remains required before external release.`);
  };

  return (
    <div className="space-y-6 text-slate-100" data-testid="bond-offering-sales-desk">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-emerald-300/25 bg-[#06110e] p-5 shadow-[0_0_85px_rgba(16,185,129,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(251,191,36,0.16),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.74),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200">
              <BadgeDollarSign className="h-4 w-4" /> Bond offering and sales outreach
              <Badge className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100">pooled sale workflow</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">Bond Offering Sales Desk</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Package one or multiple bonds into an institutional offering, shape senior/mezzanine/retained slices, stage investor outreach, and keep distribution behind surety, rating, and human compliance gates. The model borrows CMBS-style pooled security distribution logic without presenting itself as a live public securities sale.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Offering face', money(totalFace), `${selectedBonds.length} selected lanes`],
              ['Weighted coupon', `${weightedCoupon.toFixed(2)}%`, 'selected pool'],
              ['Surety exceptions', pendingSurety.toString(), 'wrap/rating follow-up'],
              ['Book progress', `${subscriptionPercent}%`, `${outreachWave} outreach waves`],
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

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Bond offering sales pipeline stages">
        {offeringStages.map(([stage, detail]) => (
          <Card key={stage} className="border-emerald-300/15 bg-slate-950/70 text-slate-100">
            <CardContent className="p-4">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-emerald-200">{stage}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-800 bg-slate-950/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-100">
              <Layers3 className="h-5 w-5" /> Offering pool builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {candidateBonds.map((bond) => {
              const selected = selectedBondIds.includes(bond.id);
              return (
                <button
                  type="button"
                  key={bond.id}
                  onClick={() => toggleBond(bond.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-emerald-300/45 bg-emerald-400/10' : 'border-white/10 bg-white/[0.035] hover:border-cyan-300/35 hover:bg-cyan-400/5'}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-[0.67rem] uppercase tracking-[0.16em] text-emerald-200">{bond.id}</p>
                      <h2 className="mt-1 text-lg font-bold text-white">{bond.issuer}</h2>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{bond.collateral} · {bond.useCase}</p>
                    </div>
                    <Badge className={bond.surety === 'wrapped' ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100' : bond.surety === 'pending' ? 'border-amber-300/30 bg-amber-400/10 text-amber-100' : 'border-slate-500/30 bg-slate-600/20 text-slate-200'}>
                      {bond.surety === 'wrapped' ? 'surety wrapped' : bond.surety === 'pending' ? 'surety pending' : 'benchmark only'}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <span className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">Face <strong className="block text-sm text-white">{money(bond.faceValue)}</strong></span>
                    <span className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">Coupon <strong className="block text-sm text-white">{bond.coupon.toFixed(2)}%</strong></span>
                    <span className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">Rating path <strong className="block text-sm text-white">{bond.rating}</strong></span>
                    <span className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">DSCR / ICR <strong className="block text-sm text-white">{bond.dscr.toFixed(2)}x / {bond.icr.toFixed(1)}x</strong></span>
                    <span className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">LTV <strong className="block text-sm text-white">{bond.ltv}%</strong></span>
                    <span className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">Climate signal <strong className="block text-sm text-white">{bond.climate}</strong></span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-amber-300/20 bg-slate-950/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-100">
              <BookOpenCheck className="h-5 w-5" /> Offering memo and tranche grid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-amber-200">Draft memo thesis</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                NEST pooled offering aggregates qualified bond lanes, attaches surety and rating evidence, and prepares an investor-ready distribution book with approval-locked outreach.
              </p>
            </div>
            {trancheBlueprint.map((tranche) => (
              <div key={tranche.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{tranche.label}</p>
                    <p className="mt-1 text-xs text-slate-400">Attach: {tranche.attach} · Buyers: {tranche.target}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">Rating: {tranche.rating} · Suitability: {tranche.suitability}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Protection: {tranche.covenant}</p>
                  </div>
                  <span className="font-mono text-xs text-cyan-100">{tranche.spread}</span>
                </div>
              </div>
            ))}
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300" onClick={launchOutreach} disabled={!canLaunch}>
                <Send className="mr-2 h-4 w-4" /> Stage outreach wave
              </Button>
              <Button type="button" variant="outline" className="border-amber-300/35 bg-amber-400/10 text-amber-100 hover:bg-amber-400/15" onClick={() => addLog('Offering memo routed to insurance/surety desk for wrap evidence and carrier quote confirmation.')}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Route to surety
              </Button>
            </div>
            {!canLaunch ? (
              <div className="flex gap-3 rounded-2xl border border-red-300/25 bg-red-500/10 p-4 text-sm text-red-100">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> Select at least one lane and reduce surety exceptions before staging investor outreach.
              </div>
            ) : (
              <div className="flex gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> Offering can be staged internally; outbound investor communication still requires human approval.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-violet-300/20 bg-slate-950/75 text-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-100">
              <BookOpenCheck className="h-5 w-5" /> post-sale monitoring handoff
            </CardTitle>     </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {monitoringHandoffs.map(([title, detail]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-cyan-300/20 bg-slate-950/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-100">
              <Users className="h-5 w-5" /> Investor segmentation and outreach queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {investorChannels.map((channel) => (
              <div key={channel.name} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{channel.name}</p>
                    <p className="mt-1 text-xs text-slate-400">Appetite {channel.appetite} · {channel.focus}</p>
                  </div>
                  <Badge className={channelBadge(channel.status)}>{channel.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-emerald-300/20 bg-slate-950/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-100">
              <ClipboardList className="h-5 w-5" /> Sales action log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">Subscription progress</span>
                <span className="font-mono text-sm text-emerald-100">{subscriptionPercent}% indicated</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 transition-all" style={{ width: `${subscriptionPercent}%` }} />
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full border-red-300/35 bg-red-500/10 text-red-100 hover:bg-red-500/15" onClick={() => addLog('Compliance lock engaged: outreach package retained for human review before release.')}>
              <LockKeyhole className="mr-2 h-4 w-4" /> Compliance gate: lock for approval
            </Button>
            <Button type="button" variant="outline" className="w-full border-cyan-300/35 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15" onClick={() => addLog('Investor reverse inquiry note added to offering book and routed to Sterling for follow-up.')}>
              <RadioTower className="mr-2 h-4 w-4" /> Log reverse inquiry
            </Button>
            {salesLog.map((event, index) => (
              <div key={`${event}-${index}`} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">
                {index === 0 ? <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : <Target className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />}
                <span>{event}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
