# Repository Guidelines

## Project Structure & Module Organization

Evolution Agents is a working name for an independent system that coordinates existing AI sessions for software and non-software projects. Keep shared AI-facing control artifacts in `.agents/`; keep product code outside that directory. Owner requirements live in `docs/`. The experimental VS Code adapter lives in `extensions/vscode/`, including its packaging assets and scripts. Provider test entry points live in `scripts/tests/`; fixtures and unit tests live in `tests/`.

Store plans only in `.admin-local/planning/`. That directory and private archives are excluded from source control and extension packages. Leave existing vendor configuration folders alone unless the task explicitly includes them.

## Build, Test, and Development Commands

Use Node.js 20+ and Git Bash for shell recipes on Windows.

- `npm run check`: validate JavaScript syntax, JSON/XML metadata, shell syntax, and documentation links.
- `npm test`: run dependency-free Node test-runner checks.
- `bash scripts/tests/codex.sh run researcher`: explicitly run a live provider smoke test; authentication is required.
- `powershell -File extensions/vscode/scripts/package-extension.ps1`: package the experimental adapter without installing it.

No application server or production engine is implemented. Do not start services while performing cleanup or planning.

## Coding Style & Naming Conventions

Use two-space indentation in JavaScript/JSON and four spaces in PowerShell. Use CommonJS `.cjs` for repository helpers. Use descriptive kebab-case paths and `*.test.cjs` test names. Keep provider-specific arguments separate; never assume permission flags are interchangeable.

Author rules, skills, instructions, manifests, and plans using the configured shared agent-control-framework specifications. Register artifacts in their owning index. Preserve owner vision documents verbatim.

## Testing Guidelines

Test failure handling, session identity, output validation, and packaging consistency. Unit checks simulate protocols; they do not prove a live provider ran. Live tests are explicit, may incur provider charges, and write only ignored `tests/.output/` artifacts. Verify actual board entries and completion events.

## Commit & Pull Request Guidelines

No commit convention is established yet. Use concise imperative subjects, optionally scoped, such as `tests: verify session resume`. Include purpose, validation, and screenshots for UI changes in pull requests. Never commit private plans, credentials, runtime transcripts, dependencies, or generated VSIX packages. Do not commit, push, or publish without the owner's instruction.
