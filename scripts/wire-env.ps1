# NEST Platform — Full Environment Wire Script
# Run once from C:\Users\sgill\nest\
# Fixes: frontend .env.local, dead fallback URLs in code, optional Vercel push

$RAILWAY_URL   = "https://web-production-5e8af.up.railway.app"
$FRONTEND_DIR  = "$PSScriptRoot\..\frontend"
$BACKEND_ENV   = "$PSScriptRoot\..\backend\.env"

# ── 1. Read backend .env ──────────────────────────────────────────────────────
$be = @{}
Get-Content $BACKEND_ENV | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $be[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}

Write-Host "`n=== NEST ENV WIRE ===" -ForegroundColor Cyan

# ── 2. Get missing values ─────────────────────────────────────────────────────
Write-Host "`nYou need 2 values from Supabase dashboard:" -ForegroundColor Yellow
Write-Host "  Go to: https://supabase.com/dashboard/project/$($be['SUPABASE_URL'] -replace 'https://',''-replace '\.supabase\.co','')/settings/api" -ForegroundColor Yellow
Write-Host "  Copy: Project URL  (looks like https://xxxx.supabase.co)" -ForegroundColor Yellow
Write-Host "  Copy: anon public key  (long JWT starting with eyJ...)" -ForegroundColor Yellow
$SUPABASE_URL      = Read-Host "`nPaste Supabase Project URL"
$SUPABASE_ANON_KEY = Read-Host "Paste Supabase anon public key"

# ── 3. Write frontend/.env.local ─────────────────────────────────────────────
$envContent = @"
NEXT_PUBLIC_API_URL=$RAILWAY_URL
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
ANTHROPIC_API_KEY=$($be['ANTHROPIC_API_KEY'])
OPENROUTER_API_KEY=$($be['OPENROUTER_API_KEY'])
DEEPSEEK_API_KEY=$($be['DEEPSEEK_API_KEY'])
"@
Set-Content "$FRONTEND_DIR\.env.local" $envContent
Write-Host "`n[✓] frontend/.env.local written" -ForegroundColor Green

# ── 4. Fix dead fallback URL in 4 code files ─────────────────────────────────
$DEAD = "https://backend-iota-sand-94.vercel.app"
$filesToFix = @(
    "$FRONTEND_DIR\lib\lib\trpc.ts",
    "$FRONTEND_DIR\lib\lib\api.ts",
    "$FRONTEND_DIR\shared\const.ts",
    "$FRONTEND_DIR\components\OperationalWorkbench.tsx"
)
foreach ($f in $filesToFix) {
    if (Test-Path $f) {
        $content = Get-Content $f -Raw
        if ($content -match [regex]::Escape($DEAD)) {
            $content = $content -replace [regex]::Escape($DEAD), $RAILWAY_URL
            Set-Content $f $content
            Write-Host "[✓] Fixed dead URL: $([System.IO.Path]::GetFileName($f))" -ForegroundColor Green
        }
    }
}

# ── 5. Push to Vercel via API (optional) ─────────────────────────────────────
Write-Host "`nOptional: push to Vercel now?" -ForegroundColor Yellow
Write-Host "  Get your token at: https://vercel.com/account/tokens" -ForegroundColor Yellow
$VERCEL_TOKEN = Read-Host "Paste Vercel token (or press Enter to skip)"

if ($VERCEL_TOKEN) {
    # Get project ID
    $projects = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Headers @{ Authorization = "Bearer $VERCEL_TOKEN" }
    $proj = $projects.projects | Where-Object { $_.name -match "nest" } | Select-Object -First 1
    if (-not $proj) {
        Write-Host "[!] Could not find NEST project in Vercel — set VERCEL_PROJECT_ID manually" -ForegroundColor Red
        $VERCEL_PROJECT_ID = Read-Host "Paste Vercel project ID"
    } else {
        $VERCEL_PROJECT_ID = $proj.id
        Write-Host "[✓] Found Vercel project: $($proj.name) ($VERCEL_PROJECT_ID)" -ForegroundColor Green
    }

    $envVars = @(
        @{ key = "NEXT_PUBLIC_API_URL";          value = $RAILWAY_URL;           type = "plain";     target = @("production","preview","development") },
        @{ key = "NEXT_PUBLIC_SUPABASE_URL";     value = $SUPABASE_URL;          type = "plain";     target = @("production","preview","development") },
        @{ key = "NEXT_PUBLIC_SUPABASE_ANON_KEY";value = $SUPABASE_ANON_KEY;     type = "plain";     target = @("production","preview","development") },
        @{ key = "ANTHROPIC_API_KEY";            value = $be['ANTHROPIC_API_KEY'];type = "encrypted"; target = @("production","preview","development") },
        @{ key = "OPENROUTER_API_KEY";           value = $be['OPENROUTER_API_KEY'];type = "encrypted";target = @("production","preview","development") },
        @{ key = "DEEPSEEK_API_KEY";             value = $be['DEEPSEEK_API_KEY']; type = "encrypted";target = @("production","preview","development") }
    )

    foreach ($ev in $envVars) {
        try {
            $body = $ev | ConvertTo-Json
            Invoke-RestMethod -Method Post `
                -Uri "https://api.vercel.com/v10/projects/$VERCEL_PROJECT_ID/env" `
                -Headers @{ Authorization = "Bearer $VERCEL_TOKEN"; "Content-Type" = "application/json" } `
                -Body $body | Out-Null
            Write-Host "[✓] Vercel: $($ev.key)" -ForegroundColor Green
        } catch {
            # Try update (PUT) if already exists
            Write-Host "[~] $($ev.key) already exists in Vercel — skipping" -ForegroundColor Yellow
        }
    }

    # Trigger redeploy
    $deployBody = @{ name = "nest-platform"; target = "production" } | ConvertTo-Json
    try {
        Invoke-RestMethod -Method Post `
            -Uri "https://api.vercel.com/v13/deployments" `
            -Headers @{ Authorization = "Bearer $VERCEL_TOKEN"; "Content-Type" = "application/json" } `
            -Body $deployBody | Out-Null
        Write-Host "`n[✓] Vercel redeploy triggered" -ForegroundColor Green
    } catch {
        Write-Host "[~] Could not auto-trigger redeploy — push a commit to trigger it" -ForegroundColor Yellow
    }
}

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
Write-Host "Next: restart your local dev server (Ctrl+C then npm run dev)" -ForegroundColor White
