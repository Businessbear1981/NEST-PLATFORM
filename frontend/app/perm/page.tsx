'use client';

import { AlertTriangle, Clock, TrendingUp, Building2 } from 'lucide-react';
import PermDebtPage from '@/components/PermDebtPage';
import RefiEngine from '@/components/academy/RefiEngine';

// ── Static deal data for the Bridge-to-Perm Tracker ──────────────────────────
const BRIDGE_DEALS = [
  {
    id: 'jacaranda',
    name: 'Jacaranda Trace',
    amount: '$231M',
    bridgeClose: '2024-06-01',
    stabilizationTarget: '2025-12-01',
    permWindowOpens: '2025-06-01',
    daysToWindow: 0,
    status: 'URGENT' as const,
  },
  {
    id: 'hbo2',
    name: 'HBO2',
    amount: '$155M',
    bridgeClose: '2025-01-15',
    stabilizationTarget: '2026-07-15',
    permWindowOpens: '2026-01-15',
    daysToWindow: 0,
    status: 'ACTIVE' as const,
  },
];

// ── Perm lender comparison data ───────────────────────────────────────────────
const LENDER_OPTIONS = [
  {
    type: 'Agency (FNMA / FHLMC)',
    rate: '6.2 – 6.8%',
    amortization: '30yr AM',
    ltvMax: '75% LTV max',
    note: 'Best fit ≥$25M stabilized MF',
    icon: Building2,
  },
  {
    type: 'Life Company',
    rate: '5.9 – 6.5%',
    amortization: '25 – 30yr AM',
    ltvMax: '70% LTV',
    note: 'Preferred for CCRC / healthcare',
    icon: TrendingUp,
  },
  {
    type: 'CMBS',
    rate: '6.5 – 7.2%',
    amortization: '30yr AM',
    ltvMax: '80% LTV',
    note: 'Higher leverage, covenant light',
    icon: Clock,
  },
];

const STATUS_STYLES: Record<'URGENT' | 'ACTIVE', string> = {
  URGENT: 'text-red-400 border-red-500',
  ACTIVE: 'text-[#C4A048] border-[#C4A048]',
};

export default function Page() {
  return (
    <main
      className="min-h-screen p-6 max-w-7xl mx-auto"
      style={{ background: '#030A06' }}
    >
      {/* ── Bridge-to-Perm Tracker ─────────────────────────────────────── */}
      <section className="mb-10">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[#7A9A82] mb-1">
          BRIDGE AGENT · STABILIZATION TRACKER
        </p>
        <h2
          className="font-serif text-3xl text-[#EDE8DC] mb-5"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Bridge-to-Perm Window
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRIDGE_DEALS.map((deal) => {
            const statusStyle = STATUS_STYLES[deal.status];
            const isUrgent = deal.status === 'URGENT';
            return (
              <div
                key={deal.id}
                className="rounded-2xl border border-[#1E4A2E] p-5"
                style={{ background: '#0D2218' }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p
                      className="font-serif text-xl text-[#EDE8DC]"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {deal.name}
                    </p>
                    <p className="font-mono text-xs text-[#7A9A82] mt-0.5">
                      {deal.amount} · Bridge Loan
                    </p>
                  </div>
                  <span
                    className={`font-mono text-[0.65rem] uppercase tracking-widest border rounded-full px-3 py-1 flex items-center gap-1.5 ${statusStyle}`}
                  >
                    {isUrgent && <AlertTriangle className="w-3 h-3" />}
                    {deal.status}
                  </span>
                </div>

                {/* Timeline grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#1E4A2E] p-3" style={{ background: '#1E4A2E30' }}>
                    <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#7A9A82] mb-1">
                      Bridge Close
                    </p>
                    <p className="font-mono text-sm text-[#EDE8DC]">{deal.bridgeClose}</p>
                  </div>
                  <div className="rounded-xl border border-[#1E4A2E] p-3" style={{ background: '#1E4A2E30' }}>
                    <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#7A9A82] mb-1">
                      Stabilization
                    </p>
                    <p className="font-mono text-sm text-[#EDE8DC]">{deal.stabilizationTarget}</p>
                  </div>
                  <div className="rounded-xl border border-[#1E4A2E] p-3" style={{ background: '#1E4A2E30' }}>
                    <p className="font-mono text-[0.6rem] uppercase tracking-widest text-[#7A9A82] mb-1">
                      Perm Window
                    </p>
                    <p className="font-mono text-sm text-[#C4A048]">{deal.permWindowOpens}</p>
                  </div>
                </div>

                {/* Days to window */}
                <div className="mt-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#7A9A82]" />
                  <p className="font-mono text-xs text-[#7A9A82]">
                    Days to window:{' '}
                    <span className={isUrgent ? 'text-red-400' : 'text-[#C4A048]'}>
                      {deal.daysToWindow === 0 ? 'OPEN NOW' : deal.daysToWindow}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bridge Agent Status Badge ──────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-[#C4A048]/20 p-4 mb-10 flex items-center gap-3"
        style={{ background: '#0D2218' }}
      >
        <span className="w-2 h-2 rounded-full bg-[#C4A048] animate-pulse flex-shrink-0" />
        <p className="font-mono text-xs text-[#7A9A82] leading-relaxed">
          <span className="text-[#C4A048] font-semibold">Bridge Agent</span> monitoring 18-month
          stabilization window · Next check-in:{' '}
          <span className="text-[#EDE8DC]">auto</span>
        </p>
      </div>

      {/* ── Perm Debt Options Table ────────────────────────────────────────── */}
      <section className="mb-10">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[#7A9A82] mb-1">
          BRIDGE AGENT · LENDER SOURCING
        </p>
        <h2
          className="font-serif text-3xl text-[#EDE8DC] mb-5"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Perm Debt Options
        </h2>

        <div className="rounded-2xl border border-[#1E4A2E] overflow-hidden" style={{ background: '#0D2218' }}>
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-[#1E4A2E]" style={{ background: '#1E4A2E40' }}>
            {['Lender Type', 'Rate Range', 'Structure', 'Best For'].map((h) => (
              <p key={h} className="font-mono text-[0.65rem] uppercase tracking-widest text-[#7A9A82]">
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          {LENDER_OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.type}
                className={`grid grid-cols-4 gap-4 px-5 py-4 items-center ${
                  i < LENDER_OPTIONS.length - 1 ? 'border-b border-[#1E4A2E]' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#7A9A82] flex-shrink-0" />
                  <p className="font-mono text-sm text-[#EDE8DC]">{opt.type}</p>
                </div>
                <p className="font-mono text-sm text-[#C4A048]">{opt.rate}</p>
                <div>
                  <p className="font-mono text-xs text-[#EDE8DC]">{opt.amortization}</p>
                  <p className="font-mono text-xs text-[#7A9A82]">{opt.ltvMax}</p>
                </div>
                <p className="font-mono text-xs text-[#7A9A82] italic">{opt.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Existing live-data Perm Debt Monitor (PermDebtPage) ───────────── */}
      <section className="mb-10">
        <PermDebtPage />
      </section>

      {/* ── RefiEngine: NPV / Monte Carlo / Call Optimization ─────────────── */}
      <section>
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[#7A9A82] mb-1">
          BRIDGE AGENT · CALL OPTIMIZATION
        </p>
        <h2
          className="font-serif text-3xl text-[#EDE8DC] mb-5"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Refi Engine
        </h2>
        <RefiEngine />
      </section>
    </main>
  );
}
