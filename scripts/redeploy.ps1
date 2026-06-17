# NEST Platform — One-Command Full Redeploy
# Usage: & "C:\Users\sgill\nest\scripts\redeploy.ps1"

# Set VERCEL_TOKEN in your PowerShell profile or pass on the command line:
# $env:VERCEL_TOKEN = "vcp_..."
$VERCEL_TOKEN  = $env:VERCEL_TOKEN
$PROJECT_ID    = "prj_wdWBgl3hTUBVehES5TpIj432UMrA"
$TEAM_ID       = "team_EA8e9L8c4Tpl7QT9wXuc92Rr"

if (-not $VERCEL_TOKEN) {
    Write-Host "ERROR: Set `$env:VERCEL_TOKEN first" -ForegroundColor Red
    exit 1
}
$REPO_ROOT     = "C:\Users\sgill\nest"

$headers = @{ Authorization = "Bearer $VERCEL_TOKEN"; "Content-Type" = "application/json" }

Write-Host "`n=== NEST REDEPLOY ===" -ForegroundColor Cyan

# 1. Push latest code to GitHub (triggers Railway auto-deploy + Vercel auto-deploy)
Write-Host "`n[1/3] Pushing to GitHub..." -ForegroundColor Yellow
Set-Location $REPO_ROOT
$pushResult = git push origin main 2>&1
Write-Host "      $pushResult" -ForegroundColor Gray

# 2. Check Railway backend health
Write-Host "`n[2/3] Railway health check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://nest-platform-production.up.railway.app/api/health" -TimeoutSec 10
    Write-Host "      Railway: OK — uptime $([math]::Round($health.uptime_seconds/60))min" -ForegroundColor Green
} catch {
    Write-Host "      Railway: not responding yet (may be deploying)" -ForegroundColor Yellow
}

# 3. Poll Vercel until READY
Write-Host "`n[3/3] Waiting for Vercel to go READY..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 36; $i++) {
    Start-Sleep -Seconds 10
    try {
        $latest = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&teamId=$TEAM_ID&limit=1&target=production" -Headers $headers
        $dep    = $latest.deployments[0]
        $state  = $dep.state
        Write-Host "      [$([math]::Round(($i+1)*10/60,1))min] $state" -ForegroundColor Gray
        if ($state -eq "READY") { $ready = $true; break }
        if ($state -eq "ERROR") {
            Write-Host "      BUILD FAILED — check: https://vercel.com/ardan-edge-capital/nest-platform" -ForegroundColor Red
            break
        }
    } catch {
        Write-Host "      (polling...)" -ForegroundColor DarkGray
    }
}

if ($ready) {
    Write-Host "`n=== LIVE ===" -ForegroundColor Cyan
    Write-Host "Frontend: https://nest-platform-eight.vercel.app" -ForegroundColor Green
    Write-Host "Backend:  https://nest-platform-production.up.railway.app/api/health" -ForegroundColor Green
} else {
    Write-Host "`n=== CHECK VERCEL ===" -ForegroundColor Yellow
    Write-Host "https://vercel.com/ardan-edge-capital/nest-platform" -ForegroundColor Gray
}
