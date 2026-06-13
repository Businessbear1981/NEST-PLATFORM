'use client';

import { useState } from 'react';
import { BrainCircuit, TrendingUp, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import ShadowRating from '@/components/academy/ShadowRating';
import SHAPSuite from '@/components/academy/SHAPSuite';

// ─── JP Morgan benchmark thresholds (hardcoded per NEST master context) ───────
const BENCHMARKS = [
  {
    grade: 'A',
    label: 'A-grade',
    color: '#C4A048',
    border: 'border-[#C4A048]',
    badge: 'bg-[#C4A048]/20 text-[#C4A048]',
    metrics: [
      { key: 'DSCR',     threshold: '> 2.0'  },
      { key: 'LTV',      threshold: '< 55%'  },
      { key: 'D/EBITDA', threshold: '< 4.5x' },
      { key: 'ICR',      threshold: '> 3.5'  },
    ],
  },
  {
    grade: 'BBB+',
    label: 'BBB+',
    color: '#7A9A82',
    border: 'border-[#7A9A82]',
    badge: 'bg-[#7A9A82]/20 text-[#7A9A82]',
    metrics: [
      { key: 'DSCR',     threshold: '> 1.75' },
      { key: 'LTV',      threshold: '< 62%'  },
      { key: 'D/EBITDA', threshold: '< 5.5x' },
      { key: 'ICR',      threshold: '> 2.75' },
    ],
  },
  {
    grade: 'BBB-',
    label: 'BBB−',
    color: '#5F8A6A',
    border: 'border-[#5F8A6A]',
    badge: 'bg-[#5F8A6A]/20 text-[#5F8A6A]',
    metrics: [
      { key: 'DSCR',     threshold: '> 1.5'  },
      { key: 'LTV',      threshold: '< 70%'  },
      { key: 'D/EBITDA', threshold: '< 6.5x' },
      { key: 'ICR',      threshold: '> 2.25' },
    ],
  },
  {
    grade: 'Sub-IG',
    label: 'Sub-IG',
    color: '#C0392B',
    border: 'border-red-700',
    badge: 'bg-red-900/30 text-red-400',
    metrics: [
      { key: 'DSCR', threshold: '< 1.5 (any single breach)' },
    ],
  },
];

type Tab = 'hbo2' | 'moodys';

// ─── Moody's Mirror placeholder ───────────────────────────────────────────────
function MoodysMirror() {
  return (
    <div
      className="rounded-xl border border-[#1E4A2E] p-8 flex flex-col items-center justify-center gap-4 min-h-[340px]"
      style={{ background: '#0D2218' }}
    >
      <Activity className="w-10 h-10 text-[#7A9A82] animate-pulse" />
      <p className="font-mono text-[#7A9A82] text-lg tracking-wider">
        Moody&apos;s Mirror agent — running
      </p>
      <p className="text-[#7A9A82]/60 text-sm text-center max-w-md">
        Shadow replication of Moody&apos;s structured finance methodology.
        Factor calibration in progress against EMMA municipal comps.
      </p>
    </div>
  );
}

// ─── JP Morgan Benchmark Card ─────────────────────────────────────────────────
function BenchmarkCard() {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-[#C4A048]" />
        <h2 className="font-serif text-[#EDE8DC] text-lg tracking-wide">
          JP Morgan Credit Benchmarks
        </h2>
        <span className="ml-2 font-mono text-[10px] text-[#7A9A82] uppercase tracking-widest border border-[#1E4A2E] px-2 py-0.5 rounded">
          Hardcoded reference
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {BENCHMARKS.map((b) => (
          <div
            key={b.grade}
            className={`rounded-xl border ${b.border} p-5 flex flex-col gap-3`}
            style={{ background: '#0D2218' }}
          >
            {/* Grade badge */}
            <span
              className={`self-start font-mono text-sm font-semibold px-3 py-1 rounded-full ${b.badge}`}
            >
              {b.label}
            </span>

            {/* Metric rows */}
            <ul className="flex flex-col gap-1.5">
              {b.metrics.map((m) => (
                <li key={m.key} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#7A9A82]">{m.key}</span>
                  <span className="font-mono text-xs text-[#EDE8DC]">{m.threshold}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RatingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hbo2');

  return (
    <div
      className="min-h-screen px-4 py-10 md:px-10"
      style={{ background: '#030A06', color: '#EDE8DC' }}
    >
      {/* ── Header ── */}
      <header className="mb-10">
        <div className="flex items-start gap-4">
          <div
            className="p-3 rounded-xl border border-[#1E4A2E]"
            style={{ background: '#0D2218' }}
          >
            <BrainCircuit className="w-7 h-7 text-[#C4A048]" />
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#EDE8DC] leading-tight">
              AI Shadow Rating Engine —&nbsp;
              <span className="text-[#C4A048]">Moody&apos;s/S&amp;P Mirror</span>
            </h1>
            <p className="mt-1.5 text-[#7A9A82] text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 inline-block" />
              Alternative data + ML explainability&nbsp;·&nbsp;NEST internal rating methodology
            </p>
          </div>
        </div>
      </header>

      {/* ── JP Morgan Benchmark Card ── */}
      <BenchmarkCard />

      {/* ── Tab toggle ── */}
      <div className="flex gap-2 mb-8">
        {([
          { id: 'hbo2',   label: 'HBO2 Analysis' },
          { id: 'moodys', label: "Moody's Mirror" },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={[
              'font-mono text-sm px-5 py-2 rounded-lg border transition-colors',
              activeTab === t.id
                ? 'bg-[#1E4A2E] border-[#C4A048] text-[#C4A048]'
                : 'bg-transparent border-[#1E4A2E] text-[#7A9A82] hover:border-[#7A9A82]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}

        {/* live status dot */}
        <span className="ml-auto self-center flex items-center gap-1.5 font-mono text-xs text-[#7A9A82]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {activeTab === 'hbo2' ? 'HBO2 deal loaded' : 'Mirror calibrating…'}
        </span>
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'hbo2' ? (
        <div className="flex flex-col gap-10">
          {/* Shadow Rating block */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-[#C4A048]" />
              <h2 className="font-serif text-[#EDE8DC] text-lg">
                Shadow Rating — HBO2 Alternative Data
              </h2>
            </div>
            <ShadowRating />
          </section>

          {/* SHAP Explainability block */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-4 h-4 text-[#C4A048]" />
              <h2 className="font-serif text-[#EDE8DC] text-lg">
                SHAP Explainability Suite
              </h2>
              <span className="font-mono text-[10px] text-[#7A9A82] uppercase tracking-widest border border-[#1E4A2E] px-2 py-0.5 rounded ml-1">
                Force · Heatmap · Dependence
              </span>
            </div>
            <SHAPSuite />
          </section>
        </div>
      ) : (
        <MoodysMirror />
      )}
    </div>
  );
}
