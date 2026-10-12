param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('claude', 'codex', 'copilot')]
    [string]$Tool,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9._-]+$')]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$InstructionFile,
    [Parameter(Mandatory = $true)]
    [string]$Task,
    [Parameter(Mandatory = $true)]
    [string]$WorkingDirectory
)
$ErrorActionPreference = 'Stop'
$workingPath = [IO.Path]::GetFullPath($WorkingDirectory)
$instructionPath = [IO.Path]::GetFullPath($InstructionFile)
if (-not (Test-Path -LiteralPath $workingPath -PathType Container)) { throw 'Working directory not found.' }
if (-not (Test-Path -LiteralPath $instructionPath -PathType Leaf)) { throw 'Instruction file not found.' }
$query = @{
    tool = $Tool
    name = $Name
    instructions = $instructionPath
    task = $Task
    cwd = $workingPath
}
$encoded = ($query.GetEnumerator() | ForEach-Object {
    '{0}={1}' -f [Uri]::EscapeDataString($_.Key), [Uri]::EscapeDataString([string]$_.Value)
}) -join '&'
$command = Get-Command code.cmd -ErrorAction SilentlyContinue
$code = if ($command) { $command.Source } else { Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\bin\code.cmd' }
if (-not (Test-Path -LiteralPath $code)) { throw 'VS Code CLI not found.' }
& $code --reuse-window $workingPath
if ($LASTEXITCODE -ne 0) { throw "VS Code could not select the workspace: $LASTEXITCODE" }
& $code --open-url "vscode://frontside.evolution-agents/open?$encoded"
if ($LASTEXITCODE -ne 0) { throw "VS Code rejected the experimental session request: $LASTEXITCODE" }
