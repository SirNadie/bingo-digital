param(
  [switch] $NoInstall
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$apiDir = Join-Path $here 'dino-api'
$webDir = Join-Path $here 'dino-web'
# Resolver npm.cmd de forma explícita en Windows
$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue)
if (-not $npmCmd) { $npmCmd = (Get-Command npm -ErrorAction SilentlyContinue) }

Write-Host "== Dino Dev: preparando entornos =="

# Backend: venv y dependencias
$venvPython = Join-Path $apiDir '.venv\Scripts\python.exe'
if (-not (Test-Path $venvPython)) {
  Write-Host "[API] Creando entorno virtual (.venv)"
  Push-Location $apiDir
  & python -m venv .venv
  Pop-Location
}

if (-not $NoInstall) {
  Write-Host "[API] Instalando dependencias"
  & $venvPython -m pip install --upgrade pip | Out-Null
  & $venvPython -m pip install -r (Join-Path $apiDir 'requirements.txt')
}

# Frontend: dependencias
$webNodeModules = Join-Path $webDir 'node_modules'
if (-not (Test-Path $webNodeModules)) {
  Write-Host "[WEB] Instalando dependencias"
  Push-Location $webDir
  & $npmCmd install
  Pop-Location
}

# Arrancar API en background
Write-Host "[API] Iniciando en http://localhost:8000"
$apiJob = Start-Job -Name 'dino-api' -ScriptBlock {
  param($apiDirParam, $venvPythonParam)
  $ErrorActionPreference = 'Stop'
  Set-Location $apiDirParam
  & $venvPythonParam -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} -ArgumentList $apiDir, $venvPython

# Arrancar frontend en foreground
try {
  Write-Host "[WEB] Iniciando en http://localhost:5173"
  Push-Location $webDir
  & $npmCmd run dev
}
finally {
  Write-Host "\n== Saliendo: deteniendo API =="
  if ($apiJob -and $apiJob.State -eq 'Running') {
    Stop-Job $apiJob -ErrorAction SilentlyContinue | Out-Null
  }
  if ($apiJob) {
    Receive-Job $apiJob | Out-Null
    Remove-Job $apiJob | Out-Null
  }
  Pop-Location
}
