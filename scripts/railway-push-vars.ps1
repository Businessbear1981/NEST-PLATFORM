# railway-push-vars.ps1
# Run this AFTER: railway login
# Usage: powershell -File scripts/railway-push-vars.ps1

$ENV_FILE = "$PSScriptRoot\..\backend\.env"
$PROJECT_ID = "871380dd-198b-4d6c-96ab-effa002eca68"

if (-not (Test-Path $ENV_FILE)) {
    Write-Error "Could not find backend/.env at $ENV_FILE"
    exit 1
}

# Read .env into a hashtable
$vars = @{}
$skip = @("RAILWAY_API_TOKEN", "PORT")
Get-Content $ENV_FILE | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.+)$") {
        $k = $Matches[1].Trim()
        $v = $Matches[2].Trim()
        if ($k -notin $skip -and $v) {
            $vars[$k] = $v
        }
    }
}

# Production overrides
$vars["DEBUG"] = "false"
$vars["HOST"] = "0.0.0.0"
$vars["NEST_DEMO_MODE"] = "0"
$vars["ANTHROPIC_MODEL"] = "claude-sonnet-4-6"
$vars["FRONTEND_ORIGIN"] = "https://nest-platform-htdzkbhpq-ardan-edge-capital.vercel.app"

Write-Host "Linking to Railway project $PROJECT_ID ..." -ForegroundColor Cyan
railway link --project $PROJECT_ID 2>&1 | Out-Null

Write-Host "Pushing $($vars.Count) variables to Railway..." -ForegroundColor Cyan
foreach ($k in $vars.Keys | Sort-Object) {
    $v = $vars[$k]
    railway variables set "$k=$v" 2>&1 | Out-Null
    Write-Host "  SET $k" -ForegroundColor Green
}

Write-Host "`nEnabling public domain..." -ForegroundColor Cyan
railway domain 2>&1

Write-Host "`nAll vars pushed. Now run: railway up" -ForegroundColor Yellow
Write-Host "Then grab the domain from: railway status" -ForegroundColor Yellow
