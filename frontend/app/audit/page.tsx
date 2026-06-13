'use client'

import { useEffect, useState } from 'react'
import { runWaterfall } from '@/lib/engines/dscr'
import { scoreProperty } from '@/lib/engines/eagleeye'

interface HealthCheck {
  service: string
  status: 'ok' | 'error' | 'missing'
  message?: string
  latencyMs?: number
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  totalMs: number
  build: { commit: string; env: string; region: string }
  checks: HealthCheck[]
}

interface EngineResult {
  name: string
  status: 'ok' | 'error'
  output?: string
  error?: string
}

const STATUS_COLOR = {
  ok: '#2D6B3D',
  healthy: '#2D6B3D',
  error: '#7F1D1D',
  unhealthy: '#7F1D1D',
  missing: '#78350F',
  degraded: '#78350F',
}

const STATUS_TEXT = {
  ok: '#4ADE80',
  healthy: '#4ADE80',
  error: '#F87171',
  unhealthy: '#F87171',
  missing: '#FCD34D',
  degraded: '#FCD34D',
}

function Badge({ status, label }: { status: string; label?: string }) {
  const text = label ?? status.toUpperCase()
  return (
    <span
      style={{
        background: STATUS_COLOR[status as keyof typeof STATUS_COLOR] ?? '#1E4A2E',
        color: STATUS_TEXT[status as keyof typeof STATUS_TEXT] ?? '#7A9A82',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontFamily: 'IBM Plex Mono, monospace',
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}
    >
      {text}
    </span>
  )
}

export default function AuditPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [engines, setEngines] = useState<EngineResult[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshedAt, setRefreshedAt] = useState<string>('')

  const runChecks = async () => {
    setLoading(true)
    setHealth(null)
    setHealthError(null)

    // Health endpoint
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      const data = await res.json()
      setHealth(data)
    } catch (e) {
      setHealthError(String(e))
    }

    // Engine smoke tests (client-side — pure math, no network)
    const results: EngineResult[] = []

    try {
      const r = runWaterfall({
        grossRevenue: 12_000_000,
        vacancyRate: 0.05,
        operatingExpenseRatio: 0.38,
        replacementReservePerUnit: 350,
        units: 300,
        annualDebtService: 4_200_000,
        loanBalance: 51_000_000,
        capRate: 0.065,
      })
      if (r.dscr > 0 && r.netOperatingIncome > 0) {
        results.push({ name: 'DSCR Waterfall', status: 'ok', output: `DSCR ${r.dscr.toFixed(2)} · NOI $${(r.netOperatingIncome / 1e6).toFixed(2)}M · Grade ${r.grade}` })
      } else {
        results.push({ name: 'DSCR Waterfall', status: 'error', error: 'Returned zero values' })
      }
    } catch (e) {
      results.push({ name: 'DSCR Waterfall', status: 'error', error: String(e) })
    }

    try {
      const score = scoreProperty({
        address: '1234 Test Ave, Tampa FL',
        capRate: 0.068,
        occupancy: 0.93,
        noi: 850_000,
        askingPrice: 13_000_000,
        yearBuilt: 2005,
        units: 120,
        propertyType: 'multifamily',
        msaName: 'Tampa Bay',
        dscr: 1.52,
      })
      if (score.totalScore > 0) {
        results.push({ name: 'Eagle Eye Scanner', status: 'ok', output: `Score ${score.totalScore}/100 · ${score.distressLevel} · ${score.recommendation}` })
      } else {
        results.push({ name: 'Eagle Eye Scanner', status: 'error', error: 'Score returned 0' })
      }
    } catch (e) {
      results.push({ name: 'Eagle Eye Scanner', status: 'error', error: String(e) })
    }

    // Recharts Cell import check (runtime canary)
    try {
      const { Cell } = await import('recharts')
      results.push({ name: 'Recharts Cell import', status: Cell ? 'ok' : 'error', output: 'Cell available for per-bar coloring' })
    } catch (e) {
      results.push({ name: 'Recharts Cell import', status: 'error', error: String(e) })
    }

    setEngines(results)
    setRefreshedAt(new Date().toLocaleTimeString())
    setLoading(false)
  }

  useEffect(() => { runChecks() }, [])

  const card: React.CSSProperties = {
    background: '#0D2218',
    border: '1px solid #1E4A2E',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  }

  const label: React.CSSProperties = {
    color: '#7A9A82',
    fontSize: 11,
    fontFamily: 'IBM Plex Mono, monospace',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 12,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030A06', color: '#EDE8DC', padding: '32px 40px', fontFamily: 'Space Grotesk, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: '#7A9A82', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.15em', marginBottom: 6 }}>
            NEST PLATFORM · SYSTEM AUDIT
          </div>
          <h1 style={{ fontSize: 28, fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, margin: 0 }}>
            Deploy Health
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {refreshedAt && <span style={{ fontSize: 12, color: '#7A9A82' }}>Checked {refreshedAt}</span>}
          <button
            onClick={runChecks}
            disabled={loading}
            style={{
              padding: '8px 20px',
              background: loading ? '#1E4A2E' : '#C4A048',
              color: loading ? '#7A9A82' : '#030A06',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'default' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'IBM Plex Mono, monospace',
            }}
          >
            {loading ? 'Checking…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overall status banner */}
      {health && (
        <div style={{
          ...card,
          borderColor: health.status === 'healthy' ? '#2D6B3D' : health.status === 'degraded' ? '#92400E' : '#7F1D1D',
          background: health.status === 'healthy' ? '#0D2218' : health.status === 'degraded' ? '#1C1200' : '#150808',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 24px',
        }}>
          <div style={{ fontSize: 28 }}>{health.status === 'healthy' ? '✓' : health.status === 'degraded' ? '⚠' : '✗'}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>
              {health.status === 'healthy' ? 'All systems operational' : health.status === 'degraded' ? 'Degraded — some env vars missing' : 'Unhealthy — service errors detected'}
            </div>
            <div style={{ fontSize: 12, color: '#7A9A82', fontFamily: 'IBM Plex Mono, monospace' }}>
              Commit {health.build.commit} · {health.build.env} · {health.build.region} · {health.totalMs}ms
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Badge status={health.status} />
          </div>
        </div>
      )}

      {healthError && (
        <div style={{ ...card, borderColor: '#7F1D1D', background: '#150808', color: '#F87171' }}>
          /api/health unreachable: {healthError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Service checks */}
        <div>
          <div style={card}>
            <div style={label}>Service Checks</div>
            {loading && !health && (
              <div style={{ color: '#7A9A82', fontSize: 13 }}>Running…</div>
            )}
            {health?.checks.map(c => (
              <div key={c.service} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #1E4A2E' }}>
                <Badge status={c.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 2 }}>{c.service}</div>
                  {c.message && <div style={{ fontSize: 11, color: '#7A9A82' }}>{c.message}</div>}
                </div>
                {c.latencyMs !== undefined && (
                  <div style={{ fontSize: 11, color: '#7A9A82', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>{c.latencyMs}ms</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Engine smoke tests */}
        <div>
          <div style={card}>
            <div style={label}>Engine Smoke Tests</div>
            {loading && engines.length === 0 && (
              <div style={{ color: '#7A9A82', fontSize: 13 }}>Running engines…</div>
            )}
            {engines.map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #1E4A2E' }}>
                <Badge status={e.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 2 }}>{e.name}</div>
                  {e.output && <div style={{ fontSize: 11, color: '#7A9A82' }}>{e.output}</div>}
                  {e.error && <div style={{ fontSize: 11, color: '#F87171' }}>{e.error}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Fix instructions for missing env vars */}
      {health?.checks.some(c => c.status === 'missing') && (
        <div style={card}>
          <div style={label}>Action Required — Missing Environment Variables</div>
          <div style={{ fontSize: 13, color: '#EDE8DC', marginBottom: 12 }}>
            Go to{' '}
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#C4A048' }}>
              vercel.com → NEST-PLATFORM → Settings → Environment Variables
            </span>{' '}
            and add:
          </div>
          {[
            { key: 'NEXT_PUBLIC_API_URL', value: 'Your Railway backend URL (check Railway dashboard → service → domain)', fix: true },
            { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'From Supabase → Project Settings → API → Project URL', fix: true },
            { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'From Supabase → Project Settings → API → anon key', fix: true },
          ]
            .filter(v => health.checks.find(c => c.service === `env:${v.key}`)?.status === 'missing')
            .map(v => (
              <div key={v.key} style={{ marginBottom: 8, padding: '8px 12px', background: '#030A06', borderRadius: 4, border: '1px solid #78350F' }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#FCD34D', marginBottom: 2 }}>{v.key}</div>
                <div style={{ fontSize: 11, color: '#7A9A82' }}>{v.value}</div>
              </div>
            ))}
        </div>
      )}

      {/* Dashboard links */}
      <div style={card}>
        <div style={label}>Deploy Dashboards</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: 'Vercel', url: 'https://vercel.com/team_EA8e9L8c4Tpl7QT9wXuc92Rr/nest-platform' },
            { label: 'Railway', url: 'https://railway.app' },
            { label: 'Supabase', url: 'https://supabase.com/dashboard' },
            { label: 'GitHub', url: 'https://github.com/Businessbear1981/NEST-PLATFORM' },
            { label: 'Vercel Env Vars', url: 'https://vercel.com/team_EA8e9L8c4Tpl7QT9wXuc92Rr/nest-platform/settings/environment-variables' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '6px 14px',
                background: '#1E4A2E',
                color: '#EDE8DC',
                borderRadius: 4,
                fontSize: 12,
                textDecoration: 'none',
                fontFamily: 'IBM Plex Mono, monospace',
                border: '1px solid #2D6B3D',
              }}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
