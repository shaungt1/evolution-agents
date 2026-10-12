---
name: codex-full-access
description: "Launch Codex sessions without a Codex filesystem/network sandbox or command approval prompts."
version: 1.0.0
author: Shaun Pritchard
license: "Project-specific"
applies-to: "Codex CLI and IDE permission configuration, including Codex helper sessions launched by the main agent."
activation: scoped
metadata:
  status: active
  tags: [rules, codex, permissions, sandbox, approvals]
---

# Codex Full Access

## Rule

Use full access for Codex sessions and Codex helpers unless the user explicitly requests a restricted session:

- Set `approval_policy = "never"` and `sandbox_mode = "danger-full-access"` in the user-level Codex configuration.
- When a controller specifies launch permissions explicitly, pass `-a never` and `--sandbox danger-full-access`.
- Do not silently replace full access with `workspace-write`, `read-only`, or an automatic approval-review mode.
- Confirm the effective permissions of a new session rather than assuming a prompt or saved setting took effect.
- Keep full access separate from task authorization. Execute the user's assigned work and continue following the applicable repository instructions.

## Rationale

The owner wants the main agent to launch independent Codex helpers that can read instructions, fetch data, and write results without sandbox-boundary failures or approval interruptions.

The local researcher smoke test initially failed because `workspace-write` protected the `.agents` directory. Adding its output subdirectories did not resolve the Windows sandbox conflict. The same conversation completed after launch with `danger-full-access` and approval policy `never`. The separate SWAPI test also completed with those settings.

The two controls have different jobs:

| Setting | Effect |
|---|---|
| `sandbox_mode = "danger-full-access"` | Removes Codex's filesystem and network sandbox boundaries. |
| `approval_policy = "never"` | Removes Codex command-approval prompts; execution failures are returned to the agent. |

No special permission-granting phrase in the task prompt can substitute for these runtime controls.

## Applies To

This rule applies when the main agent configures Codex, starts a Codex CLI conversation, resumes a helper conversation, or configures the Codex IDE permission control.

The user-level defaults apply to future Codex sessions for this OS user across projects, not just this repository. An already-running session can retain its previous permissions until its active mode is changed or a new session starts.

This rule is specific to Codex. Claude Code and GitHub Copilot have their own configuration and permission mechanisms.

### Persistent Configuration

Edit the user configuration, normally `~/.codex/config.toml` (`%USERPROFILE%\.codex\config.toml` on Windows). If a different `CODEX_HOME` is configured, use its `config.toml` instead. Preserve other settings and make a recoverable backup before editing.

Put these keys at the TOML top level, before the first `[section]` header:

```toml
approval_policy = "never"
sandbox_mode = "danger-full-access"
```

The existing `[windows] sandbox` setting selects the Windows sandbox implementation when sandboxing is used. Changing it to `elevated` is not the switch for full access and is unnecessary for this rule.

### Launch Examples

Interactive CLI conversation:

```bash
codex -a never --sandbox danger-full-access
```

Headless helper that reads an instruction file and acts on it:

```bash
codex -a never exec --sandbox danger-full-access --json \
  "Read tests/instructions/researcher.md and execute its approved steps in an isolated test directory."
```

Resume a specific saved conversation with another instruction:

```bash
codex -a never exec --sandbox danger-full-access resume SESSION_ID \
  "Read the updated instruction file and continue the assigned work."
```

Replace `SESSION_ID` with the actual ID returned by the earlier run. Do not use `--last` to route messages when multiple helpers exist.

### Overrides and IDE Sessions

CLI flags and `--config` overrides take precedence over project configuration, selected profile files, and user defaults. A launcher passing `workspace-write` will therefore restore restrictions even after the user config is updated. Inspect launch arguments when a helper remains restricted.

In the Codex IDE extension, select **Full access** in the permissions control beneath the composer. In an interactive CLI session, `/permissions` opens the active permission picker. Start a fresh session or change the active permission mode when applying the configuration to a running conversation.

Creating a helper without a visible window and opening its transcript in a window are display/lifecycle choices; neither grants additional permissions by itself.

## Exceptions

- A restricted mode is allowed when the user deliberately requests a sandboxed test or a restricted task. Record that choice instead of treating it as the default.
- OS permissions, mandatory organization policy, authentication, unavailable services, model/provider limits, and repository instructions remain applicable. This rule does not grant Windows administrator rights or repair missing MCP credentials.
- Full access does not authorize unrelated work, automatic commits/pushes, database changes, or destructive operations beyond the user's actual request.

## Verification

1. Read the parsed user config and confirm both top-level values match this rule.
2. Check the launch arguments and trusted project/profile overrides for settings that restore a restricted mode.
3. Inspect a fresh session's effective permissions. Do not report the configuration as active merely because the file was edited.
4. For an execution smoke test, launch a Codex helper with an approved instruction file. Verify its recorded tool calls, completed turn, and actual output artifacts. The researcher test must produce a board status entry and `researcher.done`; the SWAPI test must produce real downloaded data, a matching board result, and `swapi-tester.done`.
5. Confirm earlier board entries remain intact. Distinguish the helper's own writes from a controller relaying its reply.

## References

- [OpenAI: sandbox and full-access settings](https://learn.chatgpt.com/docs/sandboxing)
- [OpenAI: configuration location and precedence](https://learn.chatgpt.com/docs/config-file/config-basic)
- [OpenAI: non-interactive execution and session resume](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Provider rule registry](../../RULES.md)
