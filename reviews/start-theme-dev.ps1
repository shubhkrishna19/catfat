param(
  [Parameter(Mandatory = $true)]
  [string]$Store,

  [int]$Port = 9292
)

$root = Split-Path -Parent $PSScriptRoot
$log = Join-Path $PSScriptRoot 'theme-dev-catfat.log'
$err = Join-Path $PSScriptRoot 'theme-dev-catfat.err.log'
$pidFile = Join-Path $PSScriptRoot 'theme-dev-catfat.pid'

Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object {
    try {
      Stop-Process -Id $_ -Force -ErrorAction Stop
    } catch {
    }
  }

Remove-Item $log, $err -Force -ErrorAction SilentlyContinue

$arguments = @(
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-Command',
  "Set-Location '$root'; shopify theme dev --store $Store --host 127.0.0.1 --port $Port --no-color"
)

$proc = Start-Process -FilePath 'powershell.exe' `
  -ArgumentList $arguments `
  -RedirectStandardOutput $log `
  -RedirectStandardError $err `
  -PassThru

Set-Content -Path $pidFile -Value $proc.Id
Start-Sleep -Seconds 35

Write-Output ('PID=' + $proc.Id)

if (Test-Path $err) {
  Get-Content -Path $err -Tail 250
}
