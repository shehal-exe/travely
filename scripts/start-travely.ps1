$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$logPath = Join-Path $projectRoot "travely-launcher.log"
Start-Transcript -LiteralPath $logPath -Force | Out-Null

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "package.json"))) {
  throw "TRAVELY package.json was not found in $projectRoot"
}

$npm = Get-Command "npm.cmd" -ErrorAction SilentlyContinue
if (-not $npm) {
  throw "Node.js/npm is not installed or is not available in PATH. Install Node.js LTS and run START-TRAVELY.cmd again."
}

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "node_modules"))) {
  Write-Host "Installing TRAVELY dependencies for the first run..." -ForegroundColor Cyan
  & $npm.Source install
  if ($LASTEXITCODE -ne 0) {
    throw "npm install failed with exit code $LASTEXITCODE."
  }
}

function Test-LocalPortAvailable {
  param(
    [System.Net.IPAddress]$Address,
    [int]$Port
  )

  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new($Address, $Port)
    $listener.Start()
    return $true
  }
  catch {
    return $false
  }
  finally {
    if ($listener) {
      $listener.Stop()
    }
  }
}

$listenAddress = [System.Net.IPAddress]::Loopback
$port = 3210..3220 | Where-Object { Test-LocalPortAvailable -Address $listenAddress -Port $_ } | Select-Object -First 1
if (-not $port) {
  throw "No free local port was found between 3210 and 3220. Close an unused local server and try again."
}

$url = "http://localhost:$port/"
$browserHelper = Join-Path $PSScriptRoot "open-travely-when-ready.ps1"

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot ".next\BUILD_ID"))) {
  Write-Host "Preparing the TRAVELY production build..." -ForegroundColor Cyan
  & $npm.Source run build
  if ($LASTEXITCODE -ne 0) {
    throw "npm run build failed with exit code $LASTEXITCODE."
  }
}

Write-Host "" 
Write-Host "Starting TRAVELY..." -ForegroundColor Cyan
Write-Host "The browser will open automatically at $url" -ForegroundColor Green
Write-Host "Keep this window open while using the website. Press Ctrl+C to stop it." -ForegroundColor Yellow
Write-Host ""

Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -ArgumentList @(
  "-NoLogo",
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $browserHelper,
  "-Url", $url
)

& $npm.Source run start -- --hostname localhost --port $port
if ($LASTEXITCODE -ne 0) {
  throw "The TRAVELY development server stopped with exit code $LASTEXITCODE."
}

Stop-Transcript | Out-Null

