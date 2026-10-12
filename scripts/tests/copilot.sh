#!/usr/bin/env bash
# Manual Copilot CLI recipe. Set COPILOT_BIN if its native executable is not on PATH.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
exec node "$SCRIPT_DIR/../../tests/helpers/provider-cli.cjs" copilot "$@"
