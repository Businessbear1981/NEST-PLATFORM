#!/usr/bin/env node
/**
 * NEST Platform — Hydration Risk Guard
 * Scans frontend/app/ for common patterns that cause Next.js hydration mismatches.
 * Always exits 0 (never blocks build) — outputs GitHub Actions warnings only.
 *
 * Run: node scripts/hydration-guard.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const APP_DIR = join(ROOT, 'frontend', 'app')
const COMPONENTS_DIR = join(ROOT, 'frontend', 'components')

// ── Patterns that signal a React hook or client-only API ──────────────────
const HOOK_PATTERN = /\b(useState|useEffect|useRef|useCallback|useMemo|useContext|useReducer|useLayoutEffect|useImperativeHandle)\s*[(<(]/
const BROWSER_GLOBALS = /\b(window|document|localStorage|sessionStorage|navigator|location)\b\s*[.[(]/
const RANDOM_IN_RENDER = /\bMath\.random\(\)/
const DATE_NOW_IN_RENDER = /\bDate\.now\(\)/
const DYNAMIC_NO_SSR_MISSING = /import\s*\(\s*['"][^'"]+['"]\s*\)/  // dynamic import without ssr:false
const SUPPRESS_HYDRATION = /suppressHydrationWarning/

const USE_CLIENT = /^\s*['"]use client['"]\s*;?\s*$/m
const USE_SERVER = /^\s*['"]use server['"]\s*;?\s*$/m
const USE_EFFECT_WRAP = /useEffect\s*\(\s*\(\s*\)\s*=>/  // pattern: useEffect(() => { ...browser access... })

// ── Walk directory ─────────────────────────────────────────────────────────
function walk(dir, exts = ['.tsx', '.ts'], results = []) {
  if (!statSync(dir).isDirectory()) return results
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, exts, results)
    else if (exts.some(e => entry.endsWith(e))) results.push(full)
  }
  return results
}

// ── Annotation helpers ──────────────────────────────────────────────────────
const warn = (file, msg) => console.log(`::warning file=${file}::${msg}`)
const notice = (msg) => console.log(`::notice::${msg}`)
const info = (msg) => console.log(msg)

// ── Main scan ───────────────────────────────────────────────────────────────
let totalFiles = 0
let flagged = 0

function scanFile(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, '/')
  let content
  try {
    content = readFileSync(filePath, 'utf8')
  } catch {
    return
  }
  totalFiles++

  const isClientComponent = USE_CLIENT.test(content)
  const isServerAction = USE_SERVER.test(content)
  const isServerComponent = !isClientComponent && !isServerAction

  // ── Rule 1: Hooks in server components ──────────────────────────────────
  // Next.js catches this at build time, but we catch it here as an early warning
  if (isServerComponent && HOOK_PATTERN.test(content)) {
    // Check it's not just a type import or comment
    const lines = content.split('\n')
    const hookLines = lines
      .map((l, i) => ({ line: i + 1, text: l }))
      .filter(({ text }) => HOOK_PATTERN.test(text) && !text.trim().startsWith('//') && !text.trim().startsWith('*'))
    if (hookLines.length > 0) {
      warn(rel, `React hook(s) used without 'use client' directive — will crash at runtime. Add 'use client' at top of file.`)
      flagged++
    }
  }

  // ── Rule 2: Browser globals in server components ─────────────────────────
  if (isServerComponent && BROWSER_GLOBALS.test(content)) {
    const lines = content.split('\n')
    const riskLines = lines
      .map((l, i) => ({ line: i + 1, text: l }))
      .filter(({ text }) => BROWSER_GLOBALS.test(text) && !text.trim().startsWith('//') && !text.includes('useEffect'))
    if (riskLines.length > 0) {
      warn(rel, `Browser global (window/document/localStorage) used in server component — will throw on server. Add 'use client' or wrap in useEffect.`)
      flagged++
    }
  }

  // ── Rule 3: Math.random() in render path (client or server) ─────────────
  // This causes server/client HTML mismatch — must be in useEffect or useState init
  if (RANDOM_IN_RENDER.test(content)) {
    const lines = content.split('\n')
    const riskLines = lines
      .map((l, i) => ({ line: i + 1, text: l }))
      .filter(({ text }) => RANDOM_IN_RENDER.test(text) && !text.trim().startsWith('//'))
    if (riskLines.length > 0) {
      warn(rel, `Math.random() in render path causes hydration mismatch (server/client values differ). Move inside useEffect or useState initializer.`)
      flagged++
    }
  }

  // ── Rule 4: Date.now() in render path ────────────────────────────────────
  if (DATE_NOW_IN_RENDER.test(content) && content.includes('return (')) {
    warn(rel, `Date.now() in component may cause hydration mismatch if used in render. Use useMemo or useState(() => Date.now()) to stabilize.`)
    flagged++
  }

  // ── Rule 5: suppressHydrationWarning abuse ───────────────────────────────
  // This silences the warning but doesn't fix the bug — flag as advisory
  if (SUPPRESS_HYDRATION.test(content)) {
    notice(`${rel} uses suppressHydrationWarning — ensure this is intentional (e.g. theme toggle), not masking a real hydration bug.`)
  }
}

// Scan app/ directory (server components by default in App Router)
info('=== NEST Hydration Guard ===')
info(`Scanning ${APP_DIR} ...`)

let appFiles = []
try {
  appFiles = walk(APP_DIR)
} catch {
  info(`::notice::app/ directory not found at ${APP_DIR} — skipping scan`)
}

for (const f of appFiles) scanFile(f)

// Also scan components/ for hook/browser-global issues
let componentFiles = []
try {
  componentFiles = walk(COMPONENTS_DIR)
} catch {}

for (const f of componentFiles) scanFile(f)

// ── Report ──────────────────────────────────────────────────────────────────
info('')
if (flagged === 0) {
  info(`✓ Hydration guard — no issues found across ${totalFiles} files`)
} else {
  info(`⚠ Hydration guard — ${flagged} potential issue(s) across ${totalFiles} files (see warnings above)`)
  info('  These are warnings only. Build continues. Fix before investor demo.')
}

// Always exit 0 — hydration guard is advisory, never blocks build
process.exit(0)
