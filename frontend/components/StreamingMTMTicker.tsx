"use client";
import React, { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Gauge, RadioTower, RefreshCw, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TickerRow = {
  id: string;
  issuer: string;
  faceValue: number;
  basePrice: number;
  baseSpread: number;
  duration: number;
  coupon: number;
  ratingPath: string;
};

const seedRows: TickerRow[] = [
  { id: 'NEST-2029-A', issuer: 'Riverside Mixed-Use Portfolio', faceValue: 24600000, basePrice: 101.42, baseSpread: 94, duration: 3.8, coupon: 4.85, ratingPath: 'A target' },
  { id: 'NEST-2031-B', issuer: 'Infrastructure Sleeve', faceValue: 68000000, basePrice: 98.17, baseSpread: 121, duration: 5.6, coupon: 5.15, ratingPath: 'BBB review' },
  { id: 'NEST-2027-C', issuer: 'Surety-Backed Pipeline', faceValue: 173000000, basePrice: 100.08, baseSpread: 76, duration: 2.4, coupon: 4.62, ratingPath: 'A target' },
  { id: 'MUNI-COMP-AA', issuer: 'AA Municipal Comp Lane', faceValue: 40500000, basePrice: 102.03, baseSpread: 64, duration: 4.7, coupon: 4.18, ratingPath: 'AA comp' },
];

const tickSequence = [
  { curve: -7, spread: -4, label: 'Treasury rally · spreads compress' },
  { curve: 11, spread: 9, label: 'Risk-off tape · investor concession widens' },
  { curve: -3, spread: 2, label: 'Mixed tape · rate rally offset by credit basis' },
  { curve: 6, spread: -8, label: 'Surety bid improves · benchmark rates drift' },
];

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function StreamingMTMTicker({ onDeskEvent }: { onDeskEvent?: (event: string) => void }) {
  const [tickIndex, setTickIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(seedRows[0].id);
  const activeTick = tickSequence[tickIndex % tickSequence.length];
  const selectedRow = seedRows.find((row) => row.id === selectedId) ?? seedRows[0];

  const markedRows = useMemo(() => seedRows.map((row, index) => {
    const rowBias = (index - 1.5) * 0.06;
    const price = row.basePrice - activeTick.curve * row.duration * 0.018 - activeTick.spread * 0.009 + rowBias;
    const spread = row.baseSpread + activeTick.spread + index * 2;
    const mtmValue = row.faceValue * (price / 100);
    const dayChange = price - row.basePrice;
    const yieldSignal = row.coupon + spread / 100;
    return { ...row, price, spread, mtmValue, dayChange, yieldSignal };
  }), [activeTick]);

  const selectedMarkedRow = markedRows.find((row) => row.id === selectedId) ?? markedRows[0];
  const portfolioMtm = markedRows.reduce((sum, row) => sum + row.mtmValue, 0);
  const weightedSpread = markedRows.reduce((sum, row) => sum + row.spread * row.faceValue, 0) / markedRows.reduce((sum, row) => sum + row.faceValue, 0);

  const pulseTick = () => {
    const nextIndex = (tickIndex + 1) % tickSequence.length;
    const nextTick = tickSequence[nextIndex];
    setTickIndex(nextIndex);
    onDeskEvent?.(`MTM subscription pulse: ${nextTick.label}; ${selectedId} repriced through frontend-demo ticker.`);
  };

  return (
    <Card className="border-[#C4A048]/20 bg-black/75 text-[#EDE8DC]" data-testid="streaming-mtm-ticker">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#EDE8DC]"><RadioTower className="h-5 w-5" /> Streaming MTM ticker</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[#7A9A82]">Deterministic subscription simulation for mark-to-market prices, spread changes, value movement, and desk-level derived metrics.</p>
          </div>
          <Badge className="w-fit border-[#C4A048]/30 bg-[#C4A048]/10 font-mono uppercase tracking-[0.14em] text-[#EDE8DC]">
            animated demo feed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7A9A82]">Portfolio MTM</p>
            <p className="mt-2 text-2xl font-black text-white">{money(portfolioMtm)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7A9A82]">Weighted spread</p>
            <p className="mt-2 text-2xl font-black text-[#EDE8DC]">+{weightedSpread.toFixed(0)} bp</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7A9A82]">Active tape</p>
            <p className="mt-2 text-sm font-semibold text-white">{activeTick.label}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-white/[0.035] font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7A9A82]">
              <tr>
                <th className="px-4 py-3">CUSIP lane</th>
                <th className="px-4 py-3">Px</th>
                <th className="px-4 py-3">Δ px</th>
                <th className="px-4 py-3">Spread</th>
                <th className="px-4 py-3">MTM value</th>
                <th className="px-4 py-3">Yield signal</th>
              </tr>
            </thead>
            <tbody>
              {markedRows.map((row) => {
                const selected = row.id === selectedId;
                const up = row.dayChange >= 0;
                return (
                  <tr key={row.id} onClick={() => setSelectedId(row.id)} className={`cursor-pointer border-t border-white/10 transition hover:bg-[#C4A048]/5 ${selected ? 'bg-[#C4A048]/10' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{row.id}</p>
                      <p className="text-xs text-[#7A9A82]">{row.issuer} · {row.ratingPath}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-100">{row.price.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-mono ${up ? 'text-emerald-200' : 'text-rose-200'}`}>{up ? '+' : ''}{row.dayChange.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-[#EDE8DC]">+{row.spread.toFixed(0)} bp</td>
                    <td className="px-4 py-3 font-mono text-[#EDE8DC]">{money(row.mtmValue)}</td>
                    <td className="px-4 py-3 font-mono text-amber-100">{row.yieldSignal.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-2xl border border-[#C4A048]/20 bg-[#C4A048]/10 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#EDE8DC]">
              <Gauge className="h-4 w-4" /> Selected lane <strong>{selectedMarkedRow.id}</strong> reprices to <strong>{selectedMarkedRow.price.toFixed(2)}</strong> with spread <strong>+{selectedMarkedRow.spread.toFixed(0)} bp</strong>.
            </div>
          </div>
          <Button type="button" className="bg-cyan-400 text-[#030A06] hover:bg-cyan-300" onClick={pulseTick}>
            <RefreshCw className="mr-2 h-4 w-4" /> Pulse MTM update
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" /> Positive price movement improves refinance optionality and investor follow-up timing.
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">
            <ArrowDownRight className="mt-0.5 h-4 w-4 shrink-0" /> Spread widening triggers surety/rating review before external placement action.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
