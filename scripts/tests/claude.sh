#!/usr/bin/env bash
# Manual Claude CLI recipe. Examples: run researcher; resume RUN_DIRECTORY "next task"
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
exec node "$SCRIPT_DIR/../../tests/helpers/provider-cli.cjs" claude "$@"
