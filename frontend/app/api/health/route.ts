import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface HealthCheck {
  service: string
  status: 'ok' | 'error' | 'missing'
  message?: string
  latencyMs?: number
}

export async function GET() {
  const checks: HealthCheck[] = []
  const t0 = Date.now()

  // 1. Required env vars
  const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_API_URL',
  ] as const
  for (const key of envVars) {
    checks.push({
      service: `env:${key}`,
      status: process.env[key] ? 'ok' : 'missing',
      message: process.env[key] ? 'set' : `Not set — add to Vercel > Settings > Environment Variables`,
    })
  }

  // 2. Supabase table access
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (sbUrl && sbKey) {
    const t = Date.now()
    try {
      const supabase = createClient(sbUrl, sbKey)
      const { error } = await supabase.from('engine_runs').select('id').limit(1)
      checks.push({
        service: 'supabase:engine_runs',
        status: error ? 'error' : 'ok',
        message: error?.message ?? 'reachable',
        latencyMs: Date.now() - t,
      })
    } catch (e) {
      checks.push({ service: 'supabase:engine_runs', status: 'error', message: String(e), latencyMs: Date.now() - t })
    }
  } else {
    checks.push({ service: 'supabase:engine_runs', status: 'missing', message: 'Supabase env vars not set' })
  }

  // 3. Backend Railway reachability
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.RAILWAY_BACKEND_URL || ""
  const t = Date.now()
  try {
    const res = await fetch(`${apiUrl}/api/health`, {
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    })
    checks.push({
      service: `backend:${apiUrl}`,
      status: res.ok ? 'ok' : 'error',
      message: res.ok ? `HTTP ${res.status}` : `HTTP ${res.status} — check Railway service`,
      latencyMs: Date.now() - t,
    })
  } catch (e) {
    checks.push({
      service: `backend:${apiUrl}`,
      status: 'error',
      message: `Unreachable — ${String(e).slice(0, 120)}`,
      latencyMs: Date.now() - t,
    })
  }

  const statuses = checks.map(c => c.status)
  const overall = statuses.every(s => s === 'ok')
    ? 'healthy'
    : statuses.some(s => s === 'missing')
    ? 'degraded'
    : 'unhealthy'

  return NextResponse.json(
    {
      status: overall,
      timestamp: new Date().toISOString(),
      totalMs: Date.now() - t0,
      build: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? 'local',
        env: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION ?? 'unknown',
      },
      checks,
    },
    { status: overall === 'healthy' ? 200 : 503 }
  )
}
