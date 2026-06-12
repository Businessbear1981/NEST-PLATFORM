# NEST Backend One-Shot Wire
# Usage:  .\scripts\wire-backend.ps1
# Optionally pass -Port 8000 to override default port
param(
  [int]$Port = 8000,
  [switch]$SkipInstall,
  [switch]$Stop
)

$ROOT     = Split-Path $PSScriptRoot -Parent
$BACKEND  = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"
$VENV     = Join-Path $BACKEND ".venv"
$ENVFILE  = Join-Path $BACKEND ".env"
$PID_FILE = Join-Path $BACKEND ".backend.pid"

# -- Stop mode ---------------------------------------------------------------
if ($Stop) {
  if (Test-Path $PID_FILE) {
    $pid = Get-Content $PID_FILE
    try { Stop-Process -Id $pid -Force -ErrorAction Stop; Write-Host "Backend (PID $pid) stopped." -ForegroundColor Green }
    catch { Write-Host "Process $pid not found (already stopped)." -ForegroundColor Yellow }
    Remove-Item $PID_FILE -Force
  } else {
    Write-Host "No PID file found. Backend may not be running." -ForegroundColor Yellow
  }
  exit 0
}

Write-Host ""
Write-Host "  NEST BACKEND WIRE" -ForegroundColor DarkYellow
Write-Host "  -----------------------------------------" -ForegroundColor DarkGreen
Write-Host ""

# -- Step 1: Python check ----------------------------------------------------
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) {
  Write-Host "  [FAIL] Python not found. Install Python 3.11+ and retry." -ForegroundColor Red
  exit 1
}
$pyVer = & python --version 2>&1
Write-Host "  [OK] $pyVer" -ForegroundColor DarkYellow

# -- Step 2: Virtual env -----------------------------------------------------
if (-not (Test-Path $VENV)) {
  Write-Host "  [SETUP] Creating virtual environment..." -ForegroundColor Cyan
  & python -m venv $VENV
}
$PYTHON = Join-Path $VENV "Scripts\python.exe"
if (-not (Test-Path $PYTHON)) { $PYTHON = "python" }

# -- Step 3: Install dependencies --------------------------------------------
if (-not $SkipInstall) {
  Write-Host "  [INSTALL] Installing requirements..." -ForegroundColor Cyan
  $req = Join-Path $BACKEND "requirements.txt"
  & $PYTHON -m pip install -r $req -q
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] pip install had errors -- attempting to continue..." -ForegroundColor Yellow
  } else {
    Write-Host "  [OK] Dependencies installed" -ForegroundColor DarkYellow
  }
} else {
  Write-Host "  [SKIP] Install skipped (-SkipInstall)" -ForegroundColor DarkGray
}

# -- Step 4: Validate .env ---------------------------------------------------
Write-Host ""
Write-Host "  ENV CHECK" -ForegroundColor DarkYellow
$required = @("ANTHROPIC_API_KEY", "JWT_SECRET_KEY", "SECRET_KEY")
$optional = @("SUPABASE_URL", "SUPABASE_SERVICE_KEY", "FRED_API_KEY", "SENDGRID_API_KEY")
$envVars = @{}

if (Test-Path $ENVFILE) {
  Get-Content $ENVFILE | Where-Object { $_ -match "^[^#].*=.+" } | ForEach-Object {
    $parts = $_ -split "=", 2
    $envVars[$parts[0].Trim()] = $parts[1].Trim()
  }
}

$missing = 0
foreach ($k in $required) {
  if ($envVars[$k] -and $envVars[$k].Length -gt 0 -and $envVars[$k] -ne "your-key-here") {
    Write-Host "  [SET] $k" -ForegroundColor DarkYellow
  } else {
    Write-Host "  [MISSING] $k  (add to backend/.env)" -ForegroundColor Red
    $missing++
  }
}
foreach ($k in $optional) {
  if ($envVars[$k] -and $envVars[$k].Length -gt 0) {
    Write-Host "  [SET] $k" -ForegroundColor DarkGray
  } else {
    Write-Host "  [EMPTY] $k  (optional)" -ForegroundColor DarkGray
  }
}

# Force correct port and CORS in .env
$portLine = "PORT=$Port"
$corsLine = "FRONTEND_ORIGIN=http://localhost:8100"
$envContent = Get-Content $ENVFILE -Raw
if ($envContent -notmatch "^PORT=") {
  Add-Content $ENVFILE "`n$portLine"
} else {
  $envContent = $envContent -replace "PORT=\d+", $portLine
  Set-Content $ENVFILE $envContent -NoNewline
}

# -- Step 5: Kill any process already on the port ---------------------------
$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  $procId = $existing.OwningProcess | Select-Object -First 1
  Write-Host "  [WARN] Port $Port in use by PID $procId -- stopping it..." -ForegroundColor Yellow
  Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 5
}

# -- Step 6: Start Flask -----------------------------------------------------
Write-Host ""
Write-Host "  STARTING BACKEND on port $Port..." -ForegroundColor Cyan
$appFile = Join-Path $BACKEND "app.py"
$proc = Start-Process -FilePath $PYTHON -ArgumentList $appFile -WorkingDirectory $BACKEND `
  -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $BACKEND "nest-backend.log") `
  -RedirectStandardError (Join-Path $BACKEND "nest-backend-err.log")
$proc.Id | Set-Content $PID_FILE

Write-Host "  [STARTED] PID $($proc.Id) -- waiting for health check..." -ForegroundColor DarkYellow

# -- Step 7: Health check (retry 12x / 6s) ----------------------------------
$healthy = $false
for ($i = 1; $i -le 20; $i++) {
  Start-Sleep -Milliseconds 750
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$Port/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($r.StatusCode -eq 200) { $healthy = $true; break }
  } catch { }
  Write-Host "  [WAIT] $i/12..." -ForegroundColor DarkGray
}

if (-not $healthy) {
  Write-Host ""
  Write-Host "  [FAIL] Backend did not become healthy. Check nest-backend-err.log" -ForegroundColor Red
  $errLog = Join-Path $BACKEND "nest-backend-err.log"
  if (Test-Path $errLog) { Get-Content $errLog -Tail 10 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red } }
  exit 1
}

Write-Host "  [HEALTHY] http://localhost:$Port/api/health" -ForegroundColor Green

# -- Step 8: Update frontend .env.local -------------------------------------
$feEnv = Join-Path $FRONTEND ".env.local"
$apiLine = "NEXT_PUBLIC_API_URL=http://localhost:$Port"
if (Test-Path $feEnv) {
  $existing = Get-Content $feEnv -Raw
  if ($existing -match "NEXT_PUBLIC_API_URL") {
    $existing = $existing -replace "NEXT_PUBLIC_API_URL=.*", $apiLine
    Set-Content $feEnv $existing -NoNewline
  } else {
    Add-Content $feEnv "`n$apiLine"
  }
} else {
  $apiLine | Set-Content $feEnv
}
Write-Host "  [WIRED] frontend/.env.local -> localhost:$Port" -ForegroundColor DarkYellow

# -- Step 9: Smoke test critical endpoints ----------------------------------
Write-Host ""
Write-Host "  ENDPOINT SMOKE TEST" -ForegroundColor DarkYellow
$endpoints = @(
  "/api/health",
  "/api/deals",
  "/api/desks/",
  "/api/powerstrip/status",
  "/api/workflow/stages",
  "/api/intel/sectors",
  "/api/hawkeye/buyers",
  "/api/emma/stats"
)
foreach ($ep in $endpoints) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$Port$ep" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    $status = if ($r.StatusCode -eq 200) { "[OK]  " } else { "[$($r.StatusCode)]" }
    $color  = if ($r.StatusCode -eq 200) { "DarkYellow" } else { "Yellow" }
    Write-Host "  $status $ep" -ForegroundColor $color
  } catch {
    $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "ERR" }
    $color = if ($code -eq 401) { "Cyan" } else { "Yellow" }
    Write-Host "  [$code] $ep" -ForegroundColor $color
  }
}

Write-Host ""
Write-Host "  NEST BACKEND LIVE" -ForegroundColor Green
Write-Host "  -----------------------------------------------------" -ForegroundColor DarkGreen
Write-Host "  Backend : http://localhost:$Port" -ForegroundColor DarkYellow
Write-Host "  Logs    : $BACKEND\nest-backend.log" -ForegroundColor DarkGray
Write-Host "  Errors  : $BACKEND\nest-backend-err.log" -ForegroundColor DarkGray
Write-Host "  Stop    : .\scripts\wire-backend.ps1 -Stop" -ForegroundColor DarkGray
Write-Host ""
if ($missing -gt 0) {
  Write-Host "  ACTION: Add $missing missing key(s) to backend/.env then restart." -ForegroundColor Yellow
  Write-Host "  Most important: ANTHROPIC_API_KEY (Bernard returns errors without it)" -ForegroundColor Yellow
  Write-Host ""
}
Write-Host "  401 on deal/agent routes is normal -- auth required. Login via /api/auth/login first." -ForegroundColor DarkGray
Write-Host ""
