# Tests

## Offline Checks

Run `npm run check` and `npm test` from the repository root. These use Node's built-in test runner and require no npm installation. Unit fixtures simulate provider event formats; they are not evidence of a real model call.

## Explicit Provider Tests

Use Git Bash on Windows:

```bash
bash scripts/tests/claude.sh run researcher
bash scripts/tests/codex.sh run swapi-tester
bash scripts/tests/copilot.sh run hello-world
```

Choose `hello-world`, `researcher`, or `swapi-tester`. A run creates an isolated ignored directory under `tests/.output/<provider>/<run-id>/`, prints the submitted prompt and tool activity, records UTF-8 events/errors/requests, and saves its provider session in `session.json`. The helper must write the board itself. The controller checks both a successful provider event and the required artifacts.

Native provider executables must be on PATH, or set `CLAUDE_BIN`, `CODEX_BIN`, or `COPILOT_BIN` to an executable path. The former local Copilot installation is preserved privately with the V1 archive; it was not installed globally. On Windows use the native `.exe`, not an npm `.cmd` shim.

To send another instruction to the same saved test conversation:

```bash
bash scripts/tests/codex.sh resume tests/.output/codex/RUN_ID "Read your board and report what you wrote."
```

Replace `RUN_ID` with the generated directory name. The scripts refuse simultaneous owners of one run directory. Claude tests use print/resume instead of mixing native background ownership with headless resume.

These are manual testing recipes, not a production scheduler, message-board server, or background worker engine. Live tests use the provider's installed configuration/authentication and may incur charges. No live test is included in `npm test`. Fixture outputs are test data, not production persistence.

The older provider runs were verified on 2026-10-08 before cleanup. Their transcripts and original scripts remain in the private V1 archive. The new recipes require a fresh live run before their provider integration is described as verified end to end.
