[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ApplicationRoot,

  [Parameter(Mandatory = $true)]
  [string]$EnvironmentFile,

  [Parameter(Mandatory = $true)]
  [string]$LogFile
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $ApplicationRoot -PathType Container)) {
  throw "Diretório da aplicação não encontrado: $ApplicationRoot"
}

if (-not (Test-Path -LiteralPath $EnvironmentFile -PathType Leaf)) {
  throw "Arquivo de ambiente de homologação não encontrado: $EnvironmentFile"
}

$pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if (-not $pnpm) {
  $pnpm = Get-Command pnpm -ErrorAction Stop
}

$logDirectory = Split-Path -Parent $LogFile
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null

$env:ENV_FILE = $EnvironmentFile
$env:SKIP_BUILD = 'true'

Set-Location -LiteralPath $ApplicationRoot
& $pnpm.Source start:homolog *>> $LogFile
exit $LASTEXITCODE
