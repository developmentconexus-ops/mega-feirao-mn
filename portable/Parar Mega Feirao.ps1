$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root 'mega-feirao.pid'

if (-not (Test-Path $pidFile)) {
    Write-Host 'Nenhum PID salvo. O aplicativo pode já estar parado.'
    exit 0
}

$processId = [int](Get-Content $pidFile)
$process = Get-Process -Id $processId -ErrorAction SilentlyContinue
if ($null -ne $process) {
    Stop-Process -Id $processId -Force
    Write-Host "Mega Feirão encerrado. PID: $processId"
} else {
    Write-Host 'O processo já não estava em execução.'
}
Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
