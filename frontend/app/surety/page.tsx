'use client';

import SuretyPricing from '@/components/academy/SuretyPricing';
import {
  ShieldCheck,
  Building2,
  AlertCircle,
  TrendingUp,
  Layers,
} from 'lucide-react';

// ─── Live Deal Pipeline ───────────────────────────────────────────────────────
const LIVE_DEALS = [
  {
    id: 'HBO2',
    name: 'HBO2 Equity Fund',
    type: 'Performance Bond',
    size: 155_000_000,
    status: 'Active',
    phase: 'LC Phase',
    aumTier: '$15–40M',
    collateral: 'Hybrid',
    dscr: 1.62,
    ltv: 0.68,
    statusColor: '#C4A048',
  },
  {
    id: 'JAC',
    name: 'Jacaranda Trace CCRC',
    type: 'Construction Bond',
    size: 231_000_000,
    status: 'Pricing',
    phase: 'Self-Collateralized',
    aumTier: '$80M+',
    collateral: 'Self-Collateralized',
    dscr: 1.82,
    ltv: 0.61,
    statusColor: '#E8C87A',
  },
  {
    id: 'STP',
    name: 'St. Pete Construction',
    type: 'Payment Bond',
    size: 172_500_000,
    status: 'Pending',
    phase: 'Hybrid',
    aumTier: '$40–80M',
    collateral: 'Hybrid',
    dscr: 1.55,
    ltv: 0.71,
    statusColor: '#7A9A82',
  },
];

// ─── Capital Threshold Tiers ──────────────────────────────────────────────────
const CAPITAL_TIERS = [
  {
    range: '$0 – 15M',
    label: 'Surety Only',
    description: 'Full third-party surety. Hylant direct capacity.',
    active: false,
    icon: '◎',
  },
  {
    range: '$15 – 40M',
    label: 'Hybrid',
    description: 'Split: surety fronts 50%, LC covers remainder.',
    active: true,
    icon: '◑',
  },
  {
    range: '$40 – 80M',
    label: 'LC Dominant',
    description: 'Bank-issued LC covers primary; surety backstop only.',
    active: false,
    icon: '◕',
  },
  {
    range: '$80M+',
    label: 'Self-Collateralized',
    description: 'Full AUM-backed. No third-party premium drag.',
    active: false,
    icon: '●',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtM = (n: number) =>
  '$' +
  (n >= 1_000_000
    ? (n / 1_000_000).toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + 'M'
    : n.toLocaleString('en-US'));

const statusBadgeClass = (status: string) => {
  if (status === 'Active') return 'bg-[#C4A048]/20 text-[#C4A048] border border-[#C4A048]/40';
  if (status === 'Pricing') return 'bg-[#E8C87A]/20 text-[#E8C87A] border border-[#E8C87A]/40';
  return 'bg-[#7A9A82]/20 text-[#7A9A82] border border-[#7A9A82]/40';
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SuretyPage() {
  return (
    <div className="min-h-screen bg-[#030A06] text-[#EDE8DC] px-6 py-10 space-y-10">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-[#7A9A82] tracking-widest uppercase mb-1">
            NEST · Capital Markets
          </p>
          <h1 className="font-serif text-4xl text-[#EDE8DC] leading-tight">
            Surety Bond Desk
          </h1>
          <p className="mt-2 text-[#7A9A82] text-sm max-w-xl">
            Real-time pricing, collateral structuring, and AUM-based tier
            selection for all active bond obligations.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-[#0D2218] border border-[#1E4A2E] rounded-xl px-4 py-3">
          <ShieldCheck size={18} className="text-[#C4A048]" />
          <span className="font-mono text-xs text-[#7A9A82]">
            Hylant Insurance · Specialty Lines
          </span>
        </div>
      </div>

      {/* ── Hylant Integration Banner ────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#C4A048]/30 bg-[#0D2218] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#C4A048]/10 border border-[#C4A048]/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-[#C4A048]" />
          </div>
          <div>
            <p className="font-serif text-lg text-[#EDE8DC]">
              Hylant Insurance <span className="text-[#7A9A82] font-sans text-sm">· Specialty Lines</span>
            </p>
            <p className="font-mono text-xs text-[#7A9A82] mt-0.5">
              NEST Preferred Surety Partner · Direct underwriting relationship
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="text-center">
            <p className="font-mono text-xs text-[#7A9A82] mb-0.5">Direct Capacity</p>
            <p className="font-mono text-[#C4A048] font-semibold">$50M – $500M</p>
          </div>
          <div className="h-8 w-px bg-[#1E4A2E] hidden md:block self-center" />
          <div className="text-center">
            <p className="font-mono text-xs text-[#7A9A82] mb-0.5">LC Programs</p>
            <p className="font-mono text-[#C4A048] font-semibold">Available</p>
          </div>
          <div className="h-8 w-px bg-[#1E4A2E] hidden md:block self-center" />
          <div className="text-center">
            <p className="font-mono text-xs text-[#7A9A82] mb-0.5">Bond Types</p>
            <p className="font-mono text-[#C4A048] font-semibold">Performance · Payment · Construction</p>
          </div>
        </div>
      </div>

      {/* ── Capital Threshold Tiers ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#1E4A2E] bg-[#0D2218] p-6">
        <div className="flex items-center gap-3 mb-5">
          <Layers size={18} className="text-[#C4A048]" />
          <h2 className="font-serif text-xl text-[#EDE8DC]">Capital Threshold — Collateral Tiers</h2>
          <span className="ml-auto font-mono text-xs text-[#7A9A82] hidden sm:block">
            AUM-gated · Updates automatically as fund grows
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPITAL_TIERS.map((tier) => (
            <div
              key={tier.range}
              className={`rounded-xl p-4 border transition-colors ${
                tier.active
                  ? 'border-[#C4A048]/60 bg-[#C4A048]/8'
                  : 'border-[#1E4A2E] bg-[#1E4A2E]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-lg text-[#C4A048]">{tier.icon}</span>
                {tier.active && (
                  <span className="font-mono text-[10px] text-[#030A06] bg-[#C4A048] px-2 py-0.5 rounded-full">
                    CURRENT
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-[#7A9A82] mb-1">{tier.range} AUM</p>
              <p className="font-serif text-base text-[#EDE8DC] mb-2">{tier.label}</p>
              <p className="font-mono text-xs text-[#7A9A82] leading-relaxed">{tier.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Deal Pipeline ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#1E4A2E] bg-[#0D2218] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1E4A2E] flex items-center gap-3">
          <TrendingUp size={18} className="text-[#C4A048]" />
          <h2 className="font-serif text-xl text-[#EDE8DC]">Live Surety Pipeline</h2>
          <span className="ml-auto font-mono text-xs text-[#7A9A82]">
            {LIVE_DEALS.length} active obligations
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E4A2E]">
                {['Deal', 'Type', 'Bond Size', 'DSCR', 'LTV', 'AUM Tier', 'Collateral Mode', 'Status'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left font-mono text-[10px] text-[#7A9A82] tracking-widest uppercase"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {LIVE_DEALS.map((deal, i) => (
                <tr
                  key={deal.id}
                  className={`border-b border-[#1E4A2E]/50 transition-colors hover:bg-[#1E4A2E]/30 ${
                    i % 2 === 0 ? '' : 'bg-[#1E4A2E]/10'
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="font-serif text-[#EDE8DC]">{deal.name}</div>
                    <div className="font-mono text-[10px] text-[#7A9A82] mt-0.5">{deal.id}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#7A9A82]">{deal.type}</td>
                  <td className="px-5 py-4 font-mono text-[#C4A048] font-semibold">
                    {fmtM(deal.size)}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-[#EDE8DC]">
                    {deal.dscr.toFixed(2)}x
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-[#EDE8DC]">
                    {(deal.ltv * 100).toFixed(0)}%
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#7A9A82]">{deal.aumTier}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-[#EDE8DC] bg-[#1E4A2E] border border-[#2D6B3D] px-2 py-1 rounded-lg">
                      {deal.collateral}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full ${statusBadgeClass(
                        deal.status
                      )}`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: deal.statusColor }}
                      />
                      {deal.status} — {deal.phase}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pipeline Footer */}
        <div className="px-6 py-4 bg-[#030A06]/40 flex flex-wrap items-center gap-6">
          <div>
            <p className="font-mono text-[10px] text-[#7A9A82] uppercase tracking-widest mb-0.5">Total Bond Exposure</p>
            <p className="font-mono text-[#C4A048] font-semibold">
              {fmtM(LIVE_DEALS.reduce((s, d) => s + d.size, 0))}
            </p>
          </div>
          <div className="h-8 w-px bg-[#1E4A2E]" />
          <div>
            <p className="font-mono text-[10px] text-[#7A9A82] uppercase tracking-widest mb-0.5">Avg DSCR</p>
            <p className="font-mono text-[#C4A048] font-semibold">
              {(LIVE_DEALS.reduce((s, d) => s + d.dscr, 0) / LIVE_DEALS.length).toFixed(2)}x
            </p>
          </div>
          <div className="h-8 w-px bg-[#1E4A2E]" />
          <div>
            <p className="font-mono text-[10px] text-[#7A9A82] uppercase tracking-widest mb-0.5">Avg LTV</p>
            <p className="font-mono text-[#C4A048] font-semibold">
              {((LIVE_DEALS.reduce((s, d) => s + d.ltv, 0) / LIVE_DEALS.length) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[#7A9A82]">
            <AlertCircle size={13} />
            <span className="font-mono text-[10px]">
              Data is illustrative · Live feed from Bond Desk
            </span>
          </div>
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#1E4A2E]" />
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-[#C4A048]" />
          <span className="font-mono text-xs text-[#7A9A82] uppercase tracking-widest">
            Pricing Engine
          </span>
        </div>
        <div className="flex-1 h-px bg-[#1E4A2E]" />
      </div>

      {/* ── SuretyPricing Engine ─────────────────────────────────────────── */}
      <SuretyPricing />

    </div>
  );
}
