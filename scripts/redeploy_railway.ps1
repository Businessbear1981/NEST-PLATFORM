# ============================================================
# NEST Backend — Railway Redeploy Script
# Service : 54bc6ec3-6f06-435a-b55b-8e13f000ecfa
# Project : 871380dd-198b-4d6c-96ab-effa002eca68
# Environment: 3fc10bfd-0921-46c2-a90f-de812b57384a
# ============================================================

$RAILWAY_TOKEN    = "a3c9c72e-269c-4186-ba98-61567d76cbc5"
$SERVICE_ID       = "54bc6ec3-6f06-435a-b55b-8e13f000ecfa"
$PROJECT_ID       = "871380dd-198b-4d6c-96ab-effa002eca68"
$ENVIRONMENT_ID   = "3fc10bfd-0921-46c2-a90f-de812b57384a"
$RAILWAY_GQL      = "https://backboard.railway.app/graphql/v2"

# ── Method 1: Railway CLI (preferred) ─────────────────────
Write-Host "`n[1/3] Trying Railway CLI..." -ForegroundColor Cyan

$cliPath = (Get-Command railway -ErrorAction SilentlyContinue)?.Source
if ($cliPath) {
    Write-Host "  Railway CLI found at: $cliPath"
    $env:RAILWAY_TOKEN = $RAILWAY_TOKEN

    # Link to the service and trigger redeploy
    $result = railway redeploy --service $SERVICE_ID --yes 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Redeploy triggered via CLI." -ForegroundColor Green
        Write-Host $result
        exit 0
    } else {
        Write-Host "  CLI redeploy failed (exit $LASTEXITCODE). Trying GraphQL..." -ForegroundColor Yellow
        Write-Host $result
    }
} else {
    Write-Host "  Railway CLI not found. Skipping." -ForegroundColor Yellow
}

# ── Method 2: Railway GraphQL API ─────────────────────────
Write-Host "`n[2/3] Trying Railway GraphQL API..." -ForegroundColor Cyan

$mutation = @{
    query = @"
mutation serviceInstanceRedeploy {
  serviceInstanceRedeploy(
    environmentId: "$ENVIRONMENT_ID"
    serviceId: "$SERVICE_ID"
  )
}
"@
} | ConvertTo-Json -Compress

$headers = @{
    "Authorization" = "Bearer $RAILWAY_TOKEN"
    "Content-Type"  = "application/json"
}

try {
    $response = Invoke-RestMethod `
        -Uri $RAILWAY_GQL `
        -Method POST `
        -Headers $headers `
        -Body $mutation `
        -ErrorAction Stop

    if ($response.data.serviceInstanceRedeploy) {
        Write-Host "  [OK] Redeploy triggered via GraphQL." -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5)
        exit 0
    } elseif ($response.errors) {
        Write-Host "  GraphQL returned errors:" -ForegroundColor Yellow
        Write-Host ($response.errors | ConvertTo-Json -Depth 5)
    } else {
        Write-Host "  Unexpected response:" -ForegroundColor Yellow
        Write-Host ($response | ConvertTo-Json -Depth 5)
    }
} catch {
    Write-Host "  GraphQL call failed: $_" -ForegroundColor Red
}

# ── Method 3: Manual fallback ──────────────────────────────
Write-Host "`n[3/3] MANUAL FALLBACK" -ForegroundColor Yellow
Write-Host "  Go to: https://railway.app/project/$PROJECT_ID/service/$SERVICE_ID"
Write-Host "  Click the 'Deployments' tab → find the latest deployment → click 'Redeploy'"
Write-Host ""
Write-Host "  Or use the Railway CLI manually:"
Write-Host "    `$env:RAILWAY_TOKEN = '$RAILWAY_TOKEN'"
Write-Host "    railway redeploy --service $SERVICE_ID --yes"
exit 1
