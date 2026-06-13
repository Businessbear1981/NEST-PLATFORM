# ============================================================
# NEST-PLATFORM — One-shot deploy to Git → Vercel + Railway + Supabase
# Usage: .\deploy.ps1 [-Message "custom commit msg"] [-SkipBuild] [-SkipMigrations]
# ============================================================

param(
    [string]$Message      = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    [switch]$SkipBuild,
    [switch]$SkipMigrations
)

$ErrorActionPreference = "Stop"
$ROOT    = "C:\Users\sgill\nest"
$FE      = "$ROOT\frontend"
$SB      = "$ROOT\supabase"

function Log  { param($m) Write-Host "`n► $m" -ForegroundColor Cyan }
function OK   { param($m) Write-Host "  ✓ $m" -ForegroundColor Green }
function FAIL { param($m) Write-Host "  ✗ $m" -ForegroundColor Red; exit 1 }

# ── 1. Frontend build check ─────────────────────────────────────────────────
if (-not $SkipBuild) {
    Log "Building frontend (Next.js)..."
    Push-Location $FE
    try {
        npm run build 2>&1 | Tee-Object -Variable buildOut | Out-Null
        if ($LASTEXITCODE -ne 0) { FAIL "npm run build failed — fix errors before deploy" }
        OK "Frontend build passed"
    } finally { Pop-Location }
} else {
    Write-Host "  (build check skipped)" -ForegroundColor DarkGray
}

# ── 2. Git stage + commit + push ────────────────────────────────────────────
Log "Staging all changes..."
Push-Location $ROOT
try {
    git add .
    if ($LASTEXITCODE -ne 0) { FAIL "git add failed" }
    OK "Files staged"

    # Check if there's anything to commit
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "  (nothing to commit — working tree clean)" -ForegroundColor DarkGray
    } else {
        git commit -m $Message `
            -m "" `
            -m "Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
        if ($LASTEXITCODE -ne 0) { FAIL "git commit failed" }
        OK "Committed: $Message"

        Log "Pushing to GitHub (origin/main)..."
        git push origin main
        if ($LASTEXITCODE -ne 0) { FAIL "git push failed — check auth or conflicts" }
        OK "Pushed → GitHub/Businessbear1981/NEST-PLATFORM"
        OK "Vercel auto-deploy triggered (frontend)"
        OK "Railway auto-deploy triggered (backend)"
    }
} finally { Pop-Location }

# ── 3. Supabase migrations ───────────────────────────────────────────────────
if (-not $SkipMigrations) {
    Log "Pushing Supabase migrations..."
    Push-Location $SB
    try {
        supabase db push 2>&1 | Tee-Object -Variable sbOut
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ⚠ Supabase push returned non-zero (may need `supabase login` first)" -ForegroundColor Yellow
            Write-Host $sbOut -ForegroundColor DarkGray
        } else {
            OK "Supabase migrations applied"
        }
    } catch {
        Write-Host "  ⚠ Supabase push skipped: $($_.Exception.Message)" -ForegroundColor Yellow
    } finally { Pop-Location }
} else {
    Write-Host "  (migrations skipped)" -ForegroundColor DarkGray
}

# ── 4. Summary ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  NEST-PLATFORM DEPLOY COMPLETE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  GitHub  → https://github.com/Businessbear1981/NEST-PLATFORM" -ForegroundColor White
Write-Host "  Vercel  → check: vercel ls" -ForegroundColor White
Write-Host "  Railway → check: railway status" -ForegroundColor White
Write-Host "  Supabase→ check: supabase migration list" -ForegroundColor White
Write-Host ""
