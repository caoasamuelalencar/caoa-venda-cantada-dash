[CmdletBinding()]
param(
  [string]$ApplicationRoot = 'D:\Apps\VendaCantadaHml\current',
  [string]$EnvironmentFile = 'D:\Apps\VendaCantadaHml\config\.env.homolog',
  [string]$TaskName = 'CAOA Venda Cantada - Homolog',
  [switch]$StartNow
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $ApplicationRoot -PathType Container)) {
  throw "Diretório da aplicação não encontrado: $ApplicationRoot"
}

if (-not (Test-Path -LiteralPath $EnvironmentFile -PathType Leaf)) {
  throw "Arquivo de ambiente de homologação não encontrado: $EnvironmentFile"
}

$runner = Join-Path $ApplicationRoot 'scripts\windows\start-homolog-task.ps1'
if (-not (Test-Path -LiteralPath $runner -PathType Leaf)) {
  throw "Script de inicialização não encontrado: $runner"
}

$logFile = 'D:\Apps\VendaCantadaHml\logs\application.log'
$powershell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$arguments = @(
  '-NoLogo',
  '-NoProfile',
  '-NonInteractive',
  '-ExecutionPolicy', 'Bypass',
  '-File', ('"{0}"' -f $runner),
  '-ApplicationRoot', ('"{0}"' -f $ApplicationRoot),
  '-EnvironmentFile', ('"{0}"' -f $EnvironmentFile),
  '-LogFile', ('"{0}"' -f $logFile)
) -join ' '

$action = New-ScheduledTaskAction -Execute $powershell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Seconds 0) `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal `
  -UserId 'NT AUTHORITY\NETWORK SERVICE' `
  -LogonType ServiceAccount `
  -RunLevel Limited

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

if ($StartNow) {
  Start-ScheduledTask -TaskName $TaskName
}
