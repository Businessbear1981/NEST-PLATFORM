#!/usr/bin/env node
/**
 * NEST Platform — Post-Deploy Health Check
 * Pings live Vercel URL to confirm critical routes are returning 200.
 *
 * Usage:
 *   NEST_HEALTH_URL=https://nest-platform.vercel.app node scripts/health-check.mjs
 *
 * Exits 0 if all CRITICAL checks pass (or if NEST_HEALTH_URL is unset — graceful skip).
 * Exits 1 if any CRITICAL check fails.
 */

const BASE_URL = (process.env.NEST_HEALTH_URL || '').replace(/\/$/, '')

if (!BASE_URL) {
  console.log('⚠ NEST_HEALTH_URL not set — skipping live health check')
  console.log('  To enable: add secret NEST_VERCEL_URL in GitHub repo → Settings → Secrets')
  console.log('  Value: your Vercel production URL (e.g. https://nest-platform.vercel.app)')
  process.exit(0)
}

console.log(`\n=== NEST Platform Health Check ===`)
console.log(`Target: ${BASE_URL}`)
console.log(`Time:   ${new Date().toISOString()}\n`)

// ── Check definitions ────────────────────────────────────────────────────────
// critical: true  → failure exits 1 and blocks CI
// critical: false → failure is a ::warning only
const CHECKS = [
  { path: '/api/health',    label: 'Health API',      critical: true,  expectJson: true },
  { path: '/',              label: 'Homepage',         critical: true,  expectJson: false },
  { path: '/dashboard',     label: 'Dashboard',        critical: false, expectJson: false },
  { path: '/bond-desk',     label: 'Bond Desk',        critical: false, expectJson: false },
  { path: '/eagleeye',      label: 'EagleEye',         critical: false, expectJson: false },
  { path: '/audit',         label: 'Audit Page',       critical: false, expectJson: false },
  { path: '/academy',       label: 'NEST Academy',     critical: false, expectJson: false },
  { path: '/deals',         label: 'Deals Pipeline',   critical: false, expectJson: false },
]

// ── Individual check ─────────────────────────────────────────────────────────
async function runCheck({ path, label, critical, expectJson }) {
  const url = `${BASE_URL}${path}`
  const start = Date.now()
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NEST-CI-HealthCheck/1.0',
        'Accept': expectJson ? 'application/json' : 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    })
    const ms = Date.now() - start
    const ok = res.status < 400
    const statusText = `HTTP ${res.status} (${ms}ms)`

    if (ok) {
      // For JSON endpoints, validate the response shape
      if (expectJson) {
        try {
          const body = await res.json()
          const healthStatus = body.status || body.ok || 'unknown'
          console.log(`✓ ${label.padEnd(22)} ${statusText} — status: ${healthStatus}`)
        } catch {
          console.log(`✓ ${label.padEnd(22)} ${statusText} — (non-JSON body)`)
        }
      } else {
        console.log(`✓ ${label.padEnd(22)} ${statusText}`)
      }
      return { ok: true, label, ms, status: res.status }
    } else {
      const level = critical ? '::error::' : '::warning::'
      const icon = critical ? '✗' : '⚠'
      console.log(`${level}${icon} ${label.padEnd(22)} ${statusText} — ${url}`)
      return { ok: false, label, ms, status: res.status, critical }
    }
  } catch (err) {
    const ms = Date.now() - start
    const level = critical ? '::error::' : '::warning::'
    const icon = critical ? '✗' : '⚠'
    const msg = err.name === 'AbortError' ? 'TIMEOUT (12s)' : err.message
    console.log(`${level}${icon} ${label.padEnd(22)} FAILED (${ms}ms) — ${msg}`)
    return { ok: false, label, ms, status: 0, critical, error: msg }
  }
}

// ── Run all checks ───────────────────────────────────────────────────────────
const results = []
for (const check of CHECKS) {
  results.push(await runCheck(check))
}

// ── Summary ──────────────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length
const failed = results.filter(r => !r.ok).length
const criticalFailed = results.filter(r => !r.ok && r.critical)
const avgMs = Math.round(results.reduce((sum, r) => sum + r.ms, 0) / results.length)

console.log(`\n─────────────────────────────────────`)
console.log(`Passed: ${passed}/${results.length} checks | Avg latency: ${avgMs}ms`)

if (criticalFailed.length > 0) {
  console.log(`\n::error::${criticalFailed.length} critical check(s) failed:`)
  criticalFailed.forEach(r => console.log(`  ✗ ${r.label}: ${r.error || `HTTP ${r.status}`}`))
  console.log('\nCheck Vercel deployment logs: https://vercel.com/ardan-edge-capital/nest-platform')
  process.exit(1)
} else if (failed > 0) {
  console.log(`\n⚠ ${failed} non-critical check(s) failed — pages may need backend data to render`)
  process.exit(0)
} else {
  console.log('\n✓ All health checks passed')
  process.exit(0)
}
