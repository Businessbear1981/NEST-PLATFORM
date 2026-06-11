# NEST deploy — push triggers nest-platform auto-deploy, backend deployed explicitly
# Usage: .\scripts\deploy.ps1 "commit message"
param([string]$msg = "deploy")

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "`n=== NEST Deploy ===" -ForegroundColor Cyan

# 1. Push to GitHub — nest-platform auto-deploys to nestadvisors.tech
Write-Host "`n[1/2] Pushing to GitHub..." -ForegroundColor Yellow
git add -A
git commit -m $msg --allow-empty
git push
Write-Host "  Pushed. Vercel will auto-deploy nest-platform -> nestadvisors.tech" -ForegroundColor Green

# 2. Deploy backend (nest-platform frontend proxies /api/* to this)
Write-Host "`n[2/2] Deploying backend..." -ForegroundColor Yellow
$env:VERCEL_ORG_ID    = "team_EA8e9L8c4Tpl7QT9wXuc92Rr"
$env:VERCEL_PROJECT_ID = "prj_bYwrRoJRNNP3HXJcod8ZkMSeDTHH"
$be = vercel deploy --prod --yes --cwd backend 2>&1
$beUrl = ($be | Select-String "https://backend-[a-z0-9]+-ardan-edge-capital\.vercel\.app").Matches[0].Value
if (-not $beUrl) { throw "Backend deploy failed:`n$be" }
Write-Host "  Backend: $beUrl" -ForegroundColor Green

# 3. Keep the stable backend alias pointing at the new deployment
Write-Host "`n[3/3] Re-aliasing backend-iota-sand-94.vercel.app..." -ForegroundColor Yellow
vercel alias $beUrl backend-iota-sand-94.vercel.app | Out-Null
Write-Host "  Alias updated." -ForegroundColor Green

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
Write-Host "  Site:    https://nestadvisors.tech  (nest-platform, auto via GitHub)"
Write-Host "  API:     https://backend-iota-sand-94.vercel.app"
Write-Host "  BE URL:  $beUrl"
