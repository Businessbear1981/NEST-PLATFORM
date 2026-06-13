'use client';

import { CheckCircle, XCircle, AlertTriangle, Calendar, FileText } from 'lucide-react';
import TEFRAEngine from '@/components/academy/TEFRAEngine';

const checklist = [
  {
    status: 'pass',
    label: 'TEFRA Public Hearing',
    detail: 'Held 2024-11-14',
  },
  {
    status: 'pass',
    label: 'Volume Cap Allocation',
    detail: '$155M allocated by FL Bond Finance Commission',
  },
  {
    status: 'pass',
    label: 'Private Activity Bond Qualification',
    detail: 'Qualified §501(c)(3) CCRC',
  },
  {
    status: 'pass',
    label: 'Bond Counsel Engaged',
    detail: 'Squire Patton Boggs LLP',
  },
  {
    status: 'fail',
    label: 'IRS Form 8038 Filing',
    detail: 'Due 30 days post-closing',
  },
  {
    status: 'warn',
    label: 'Arbitrage Compliance Certificate',
    detail: 'Pending final yield calculation',
  },
];

const calendar = [
  { date: '2026-07-01', label: 'IRS Form 8038 filing deadline' },
  { date: '2026-09-15', label: 'Annual compliance certification due' },
  { date: '2026-12-31', label: 'Arbitrage rebate calculation period end' },
];

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
  if (status === 'fail') return <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />;
  return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
}

function statusLabel(status: string) {
  if (status === 'pass') return 'text-emerald-400';
  if (status === 'fail') return 'text-red-400';
  return 'text-amber-400';
}

export default function CompliancePage() {
  return (
    <div
      className="min-h-screen px-6 py-10 space-y-10"
      style={{ backgroundColor: '#030A06', color: '#EDE8DC' }}
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl tracking-tight" style={{ color: '#C4A048' }}>
          Compliance Portal
        </h1>
        <p className="text-sm" style={{ color: '#7A9A82' }}>
          HBO2 · $155M Private Activity Bond · Series 2025
        </p>
      </div>

      {/* HBO2 Compliance Checklist */}
      <section
        className="rounded-xl p-6 space-y-4"
        style={{ backgroundColor: '#0D2218' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5" style={{ color: '#C4A048' }} />
          <h2 className="font-serif text-xl" style={{ color: '#EDE8DC' }}>
            HBO2 Compliance Checklist
          </h2>
        </div>

        <div className="space-y-3">
          {checklist.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg p-3"
              style={{ backgroundColor: '#1E4A2E' }}
            >
              <StatusIcon status={item.status} />
              <div className="min-w-0">
                <p className={`text-sm font-medium ${statusLabel(item.status)}`}>
                  {item.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#7A9A82' }}>
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div
          className="flex gap-6 pt-3 border-t font-mono text-xs"
          style={{ borderColor: '#1E4A2E', color: '#7A9A82' }}
        >
          <span className="text-emerald-400">
            {checklist.filter((c) => c.status === 'pass').length} PASS
          </span>
          <span className="text-amber-400">
            {checklist.filter((c) => c.status === 'warn').length} WARN
          </span>
          <span className="text-red-400">
            {checklist.filter((c) => c.status === 'fail').length} FAIL
          </span>
        </div>
      </section>

      {/* Two-column: Calendar + Counsel Fee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regulatory Calendar */}
        <section
          className="rounded-xl p-6 space-y-4"
          style={{ backgroundColor: '#0D2218' }}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: '#C4A048' }} />
            <h2 className="font-serif text-xl" style={{ color: '#EDE8DC' }}>
              Regulatory Calendar
            </h2>
          </div>

          <div className="space-y-3">
            {calendar.map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg p-3"
                style={{ backgroundColor: '#1E4A2E' }}
              >
                <span
                  className="font-mono text-xs pt-0.5 flex-shrink-0"
                  style={{ color: '#C4A048' }}
                >
                  {ev.date}
                </span>
                <p className="text-sm" style={{ color: '#EDE8DC' }}>
                  {ev.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Counsel Fee Estimate */}
        <section
          className="rounded-xl p-6 flex flex-col justify-between"
          style={{ backgroundColor: '#0D2218' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" style={{ color: '#C4A048' }} />
              <h2 className="font-serif text-xl" style={{ color: '#EDE8DC' }}>
                Counsel Fee Estimate
              </h2>
            </div>

            <p className="text-xs mb-5" style={{ color: '#7A9A82' }}>
              Squire Patton Boggs LLP · Bond Counsel · HBO2 Series 2025
            </p>

            <div className="space-y-4">
              <div
                className="flex justify-between items-center rounded-lg p-4"
                style={{ backgroundColor: '#1E4A2E' }}
              >
                <span className="text-sm" style={{ color: '#7A9A82' }}>
                  Estimated Total
                </span>
                <span className="font-mono text-lg font-semibold" style={{ color: '#C4A048' }}>
                  $45,000
                </span>
              </div>

              <div
                className="flex justify-between items-center rounded-lg p-4"
                style={{ backgroundColor: '#1E4A2E' }}
              >
                <span className="text-sm" style={{ color: '#7A9A82' }}>
                  Invoiced to Date
                </span>
                <span className="font-mono text-lg font-semibold text-emerald-400">
                  $38,200
                </span>
              </div>

              <div
                className="flex justify-between items-center rounded-lg p-4"
                style={{ backgroundColor: '#1E4A2E' }}
              >
                <span className="text-sm" style={{ color: '#7A9A82' }}>
                  Remaining
                </span>
                <span className="font-mono text-lg font-semibold text-amber-400">
                  $6,800
                </span>
              </div>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-mono mb-1" style={{ color: '#7A9A82' }}>
              <span>Utilization</span>
              <span style={{ color: '#C4A048' }}>84.9%</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: '#1E4A2E' }}>
              <div
                className="h-2 rounded-full"
                style={{ width: '84.9%', backgroundColor: '#C4A048' }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* TEFRA Engine */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-xl" style={{ color: '#EDE8DC' }}>
            TEFRA Compliance Engine
          </h2>
        </div>
        <TEFRAEngine />
      </section>
    </div>
  );
}
