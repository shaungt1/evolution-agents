# Evolution Agents — VS Code Prototype

This is the experimental editor adapter for the Evolution Agents working project. It is not the completed supervisor, worker engine, message board, or dashboard.

Source, command metadata, packaging templates, and invocation/installation scripts are kept together in this directory. Package identity is `frontside.evolution-agents`; commands use `evolutionAgents.experimental.*`. The commands currently exercise provider-native session surfaces, whose automatic sending/persistence remains unproven as a complete lifecycle.

## Packaging

From the repository root on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File extensions/vscode/scripts/package-extension.ps1
```

The package is generated under ignored `.build/`. Add `-Install` only when deliberately installing the prototype. Packaging includes only extension metadata, source, and this README; it does not include private plans, archives, test logs, or installed CLIs.

Renaming source metadata does not rename or uninstall an older installed prototype. Installation/reload is a separate explicit operation; do not leave multiple prototypes enabled.

## Experimental Commands

The Command Palette entries are labeled **Evolution Agents: Experimental ...**. Claude and Codex first-turn experiments use native CLIs; the Copilot editor experiment uses VS Code Chat commands. Headless provider testing is separate and documented in [tests/README.md](../../tests/README.md).

Prototype diagnostics use a temporary OS directory instead of writing into a managed project's source tree. That is disposable debugging output, not the proposed durable storage layer.

## Status

This cleanup changed organization, naming, error checks, and packaging. It did not install the renamed extension, launch a service, initialize a database, or implement the planned UI. Consult the [repository README](../../README.md) before treating a native editor session experiment as verified functionality.
