# ============================================================
# NEST-PLATFORM — One-shot deploy: Build → Validate → Git → Vercel + Railway
# Usage: .\deploy.ps1 [-Message "msg"] [-SkipBuild] [-SkipMigrations] [-SkipCheck]
# ============================================================

param(
    [string]$Message        = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    [switch]$SkipBuild,
    [switch]$SkipMigrations,
    [switch]$SkipCheck
)

$ErrorActionPreference = "Stop"
$ROOT    = "C:\Users\sgill\nest"
$FE      = "$ROOT\frontend"
$SB      = "$ROOT\supabase"

function Log  { param($m) Write-Host "`n► $m" -ForegroundColor Cyan }
function OK   { param($m) Write-Host "  ✓ $m" -ForegroundColor Green }
function WARN { param($m) Write-Host "  ⚠ $m" -ForegroundColor Yellow }
function FAIL { param($m) Write-Host "`n  ✗ BLOCKED: $m" -ForegroundColor Red; exit 1 }

# ── 0. Hardcoded URL guard ──────────────────────────────────────────────────
if (-not $SkipCheck) {
    Log "Checking for hardcoded Railway URLs..."
    Push-Location $FE
    try {
        $hits = git grep -rn "web-production-" -- "*.ts" "*.tsx" "*.js" 2>&1 |
                Where-Object { $_ -notmatch "node_modules|\.next|health/route" }
        if ($hits) {
            Write-Host "  Found hardcoded Railway URLs:" -ForegroundColor Red
            $hits | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkRed }
            FAIL "Remove hardcoded Railway URLs and use NEXT_PUBLIC_API_URL instead"
        } else {
            OK "No hardcoded Railway URLs"
        }
    } finally { Pop-Location }
}

# ── 1. Frontend build ────────────────────────────────────────────────────────
if (-not $SkipBuild) {
    Log "Building frontend (Next.js)..."
    Push-Location $FE
    try {
        # TypeScript check — warns but doesn't block (ignoreBuildErrors:true is still set)
        Write-Host "  Running typecheck (warnings only)..." -ForegroundColor DarkGray
        $tsOut = npm run typecheck 2>&1
        $tsErrors = ($tsOut | Where-Object { $_ -match "error TS" }).Count
        if ($tsErrors -gt 0) {
            WARN "$tsErrors TypeScript errors — build will pass (ignoreBuildErrors:true) but fix these"
        } else {
            OK "TypeScript clean"
        }

        # Actual build — this MUST pass
        Write-Host "  Running npm run build..." -ForegroundColor DarkGray
        $buildOut = npm run build 2>&1
        if ($LASTEXITCODE -ne 0) {
            $buildOut | Select-Object -Last 30 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkRed }
            FAIL "npm run build failed — fix before pushing"
        }
        OK "Next.js build passed"
    } finally { Pop-Location }
} else {
    WARN "Build check skipped (-SkipBuild)"
}

# ── 2. Git stage → commit → push ────────────────────────────────────────────
Log "Staging changes..."
Push-Location $ROOT
try {
    git add .
    if ($LASTEXITCODE -ne 0) { FAIL "git add failed" }

    $dirty = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($dirty)) {
        Write-Host "  (working tree clean — nothing to commit)" -ForegroundColor DarkGray
    } else {
        $fileCount = ($dirty -split "`n" | Where-Object { $_ }).Count
        Write-Host "  Committing $fileCount changed file(s)..." -ForegroundColor DarkGray

        git commit -m $Message -m "" -m "Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
        if ($LASTEXITCODE -ne 0) { FAIL "git commit failed" }
        OK "Committed: $Message"

        Log "Pushing to GitHub → triggers Vercel + Railway auto-deploy..."
        git push origin main
        if ($LASTEXITCODE -ne 0) { FAIL "git push failed — check auth or pull first" }
        OK "Pushed → github.com/Businessbear1981/NEST-PLATFORM"
        OK "Vercel auto-deploy triggered (frontend)"
        OK "Railway auto-deploy triggered (backend)"
    }
} finally { Pop-Location }

# ── 3. Supabase migrations ───────────────────────────────────────────────────
if (-not $SkipMigrations) {
    Log "Pushing Supabase migrations..."
    Push-Location $SB
    try {
        # Check if linked first
        $linked = Test-Path ".supabase\project-ref"
        if (-not $linked) {
            WARN "Supabase not linked. Run once to fix:"
            Write-Host "    cd $SB" -ForegroundColor White
            Write-Host "    supabase link --project-ref <YOUR_PROJECT_REF>" -ForegroundColor White
            Write-Host "  (find ref: supabase.com/dashboard → project → Settings → General → Reference ID)" -ForegroundColor DarkGray
        } else {
            supabase db push 2>&1 | Tee-Object -Variable sbOut | Out-Null
            if ($LASTEXITCODE -ne 0) {
                WARN "Supabase push failed — check output above"
                $sbOut | Select-Object -Last 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
            } else {
                OK "Supabase migrations applied"
            }
        }
    } catch {
        WARN "Supabase push error: $($_.Exception.Message)"
    } finally { Pop-Location }
} else {
    Write-Host "  (migrations skipped)" -ForegroundColor DarkGray
}

# ── 4. Summary ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  NEST-PLATFORM DEPLOY COMPLETE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Vercel is building now (takes ~2-3 min)." -ForegroundColor White
Write-Host "  When done, verify the deploy:" -ForegroundColor DarkGray
Write-Host ""
Write-Host "    Your site:  https://nest-platform.vercel.app/audit" -ForegroundColor Cyan
Write-Host "    Health API: https://nest-platform.vercel.app/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Dashboards:" -ForegroundColor DarkGray
Write-Host "    GitHub  → https://github.com/Businessbear1981/NEST-PLATFORM" -ForegroundColor White
Write-Host "    Vercel  → https://vercel.com/team_EA8e9L8c4Tpl7QT9wXuc92Rr/nest-platform" -ForegroundColor White
Write-Host "    Railway → https://railway.app" -ForegroundColor White
Write-Host ""
Write-Host "  If /audit shows env vars missing, go to:" -ForegroundColor DarkGray
Write-Host "    Vercel → Settings → Environment Variables" -ForegroundColor Yellow
Write-Host "    Add NEXT_PUBLIC_API_URL = your Railway service domain" -ForegroundColor Yellow
Write-Host ""
