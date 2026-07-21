$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $root 'python\python.exe'
$project = Join-Path $root 'projeto'
$pidFile = Join-Path $root 'mega-feirao.pid'

if (-not (Test-Path $python)) {
    throw "Python portátil não encontrado em: $python"
}

$process = Start-Process -FilePath $python -ArgumentList 'app.py' -WorkingDirectory $project -WindowStyle Hidden -PassThru
Set-Content -Path $pidFile -Value $process.Id -Encoding ASCII
Write-Host "Mega Feirão iniciado. PID: $($process.Id)"
Write-Host "Acesse http://192.168.0.3:3000"
