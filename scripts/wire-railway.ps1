# NEST Railway One-Shot Wiring
# Usage: C:\Users\sgill\nest\scripts\wire-railway.ps1

$TOKEN      = "a3c9c72e-269c-4186-ba98-61567d76cbc5"
$PROJECT    = "2021c2bd-e4a3-4e92-93be-b26810fb1535"
$ENV_ID     = "e6524754-040b-4a1a-9165-545dda6cdf2c"
$SVC        = "ae7ce643-8c71-4def-ab34-491b6b78038b"
$ENV_FILE   = "C:\Users\sgill\nest\backend\.env"
$API        = "https://backboard.railway.app/graphql/v2"
$H          = @{ Authorization = "Bearer $TOKEN"; "Content-Type" = "application/json" }

Write-Host "`n  NEST RAILWAY WIRE" -ForegroundColor DarkYellow
Write-Host "  ----------------------------------------" -ForegroundColor DarkGreen

# Read .env
$vars = @{}
Get-Content $ENV_FILE | Where-Object { $_ -notmatch "^\s*#" -and $_ -match "=." } | ForEach-Object {
    $parts = $_ -split "=", 2
    $k = $parts[0].Trim(); $v = $parts[1].Trim()
    if ($k -and $v) { $vars[$k] = $v }
}
$vars["FRONTEND_ORIGIN"] = "https://nestadvisors.tech"
$vars["NEST_DEMO_MODE"]  = "false"
$vars["ANTHROPIC_MODEL"] = "claude-sonnet-4-6"
Write-Host "  [READ] $($vars.Count) vars from .env" -ForegroundColor DarkYellow

# Push each var individually
$ok = 0; $fail = 0
foreach ($entry in $vars.GetEnumerator()) {
    $k = $entry.Key -replace '\\','\\' -replace '"','\"'
    $v = $entry.Value -replace '\\','\\\\' -replace '"','\"' -replace "`r",'' -replace "`n",'\n'
    $body = '{"query":"mutation { variableUpsert(input: { projectId: \"' + $PROJECT + '\", environmentId: \"' + $ENV_ID + '\", serviceId: \"' + $SVC + '\", name: \"' + $k + '\", value: \"' + $v + '\" }) }"}'
    try {
        $r = Invoke-RestMethod -Uri $API -Method POST -Body $body -Headers $H -ErrorAction Stop
        if ($r.errors) { $fail++; Write-Host "  [WARN] $k : $($r.errors[0].message)" -ForegroundColor Yellow }
        else { $ok++ }
    } catch { $fail++; Write-Host "  [ERR]  $k" -ForegroundColor Red }
}
Write-Host "  [VARS] $ok pushed, $fail failed" -ForegroundColor $(if ($fail -eq 0) { "DarkYellow" } else { "Yellow" })

# Redeploy
Write-Host "  [DEPLOY] Redeploying Railway..." -ForegroundColor Cyan
$rd = '{"query":"mutation { serviceInstanceRedeploy(serviceId: \"' + $SVC + '\", environmentId: \"' + $ENV_ID + '\") }"}'
$r2 = Invoke-RestMethod -Uri $API -Method POST -Body $rd -Headers $H -ErrorAction SilentlyContinue
Write-Host "  [OK]   Redeploying now" -ForegroundColor Green
Write-Host "  Track: https://railway.app/project/$PROJECT`n" -ForegroundColor DarkGray
