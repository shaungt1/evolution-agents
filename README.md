# Evolution Agents

Working name for an independent, supervisor-led system that plans and evolves software and non-software projects using existing Claude Code, Codex, and GitHub Copilot sessions.

The owner talks to the supervisor. The supervisor organizes approved work, delegates Agentic Micro Sprints to sidekicks, checks evidence, and brings decisions back to the owner. The production engine, durable message board, and progress UI are planned; they are not implemented yet.

## Repository Map

| Path | Purpose |
|---|---|
| [docs/](docs/) | Preserved owner vision, raw requirements, and design paper. |
| [.agents/](.agents/) | Shared AI-facing control library; currently its manifest and provider rules. |
| [scripts/tests/](scripts/tests/) | One explicit CLI testing entry point per provider. |
| [tests/](tests/README.md) | Test instructions, protocol/output checks, and ignored generated runs. |
| [extensions/vscode/](extensions/vscode/README.md) | Renamed experimental VS Code adapter with source, scripts, and packaging together. |
| [AGENTS.md](AGENTS.md) | Contributor guide and repository operating conventions. |

Private planning and recovery archives live under `.admin-local/` and are excluded from Git and extension packages. Runtime dependencies and old logs are not product source. Existing vendor configuration remains separate from shared control content.

## Current Evidence

Earlier direct CLI runs demonstrated Claude and Copilot continuation in saved sessions, and Codex researcher/SWAPI execution with actual board writes. That evidence is preserved privately. It proves those specific runs, not a complete autonomous engine or reliable native chat-window injection.

The refactored manual recipes isolate output under ignored `tests/.output/`. Offline checks validate command construction, session identity, failure handling, artifact checks, extension naming, and packaging. Live provider checks are explicit; see [tests/README.md](tests/README.md).

The [Codex full-access rule](.agents/rules/codex/full-access/rules.md) records the owner's Codex policy. Markdown records policy; actual provider configuration enforces it.

## Development

### First-Time Setup

1. Install Node.js 20+ and Git Bash for the current test scripts. An editor is optional; [VS Code](https://code.visualstudio.com/download) is a supported development choice.
2. Install **at least one** provider CLI using its official guide: [Claude Code](https://code.claude.com/docs/en/quickstart), [Codex](https://learn.chatgpt.com/docs/cli), or [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli). You do not need all three to begin.
3. Complete that provider's sign-in/authentication process. Confirm `claude --version`, `codex --version`, or `copilot --version` works in your terminal. These commands check installation, not authenticated model execution.
4. Open this independent repository, run the offline checks below, then choose an explicit [provider test](tests/README.md). On Windows the current helper needs a native executable; set the corresponding `CLAUDE_BIN`, `CODEX_BIN`, or `COPILOT_BIN` if it is not on PATH.

Do not copy this entire repository into a project you want workers to manage. Production project registration and device-data setup are not implemented yet. Docker, NATS, and a custom MCP server are not prerequisites for the current tests.

Local-model setup is separate from provider CLI installation. See [VS Code model configuration](https://code.visualstudio.com/docs/agent-customization/language-models); editor model availability does not imply the same model/tool support in every provider CLI. Local/offline worker execution remains untested here.

### Checks

Requirements: Node.js 20+, Git Bash for Windows shell recipes, and an installed/authenticated provider for live tests. There are no root npm dependencies to install.

```bash
npm run check
npm test
```

The VS Code package script creates a VSIX by default; installation requires `-Install`. It is an experimental session adapter, not the completed task engine. No service, database, device-storage bootstrap, or Docker deployment is started by these checks.

## Control-Artifact Standards

Use the configured shared agent-control-framework authoring contracts and manifests for rules, instructions, skills, workflows, plans, and agent definitions. Keep one canonical control artifact and thin vendor-native entry points. Do not copy private toolbox data or credentials into the product repository. Final product naming and license selection remain owner decisions before publication.
