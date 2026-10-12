param(
    [switch]$Install,
    [string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
$source = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$metadata = Get-Content -LiteralPath (Join-Path $source 'package.json') -Raw | ConvertFrom-Json
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $source '.build' }
$outputRoot = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$output = Join-Path $outputRoot ($metadata.publisher + '.' + $metadata.name + '-' + $metadata.version + '.vsix')
$stage = Join-Path ([IO.Path]::GetTempPath()) ('evolution-agents-package-' + [guid]::NewGuid().ToString('N'))
$extensionStage = Join-Path $stage 'extension'
try {
    New-Item -ItemType Directory -Path $extensionStage -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $source 'packaging\[Content_Types].xml') -Destination $stage
    Copy-Item -LiteralPath (Join-Path $source 'packaging\extension.vsixmanifest') -Destination $stage
    # Explicit allowlist: private plans, archives, dependencies, and tests never enter the VSIX.
    foreach ($name in @('package.json', 'extension.js', 'README.md')) {
        Copy-Item -LiteralPath (Join-Path $source $name) -Destination $extensionStage
    }
    if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output -Force }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [IO.Compression.ZipFile]::CreateFromDirectory($stage, $output)
    Write-Host "Packaged: $output"
    if ($Install) {
        $code = Get-Command code.cmd -ErrorAction SilentlyContinue
        $codePath = if ($code) { $code.Source } else { Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\bin\code.cmd' }
        if (-not (Test-Path -LiteralPath $codePath)) { throw 'VS Code CLI was not found.' }
        & $codePath --install-extension $output --force
        if ($LASTEXITCODE -ne 0) { throw "Extension installation failed: $LASTEXITCODE" }
    }
}
finally {
    $stagePath = [IO.Path]::GetFullPath($stage)
    $temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
    if ($stagePath.StartsWith($temporaryRoot, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $stagePath)) {
        Remove-Item -LiteralPath $stagePath -Recurse -Force
    }
}
