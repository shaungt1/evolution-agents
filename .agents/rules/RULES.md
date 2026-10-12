---
name: agent-provider-rules
description: "Registry of standing operating rules for Codex, Claude Code, and GitHub Copilot."
version: 1.0.0
author: Shaun Pritchard
license: "Project-specific"
metadata:
  artifact: rules-manifest
  status: active
  tags: [rules, providers, agent-launching]
---

# Provider Rules

A rule defines a standing requirement that applies whenever its scope matches. A skill describes a reusable procedure; a task describes a particular job; a mode changes an agent's working stance. The requirement to launch Codex with full access belongs here as a rule.

## Organization

Store each rule at `<provider>/<rule-name>/rules.md`, relative to this manifest. The provider folders are `codex`, `claude-code`, and `copilot`. This adds a provider grouping to the per-rule folder convention without changing the rule's meaning.

| Provider | Status | Rule or folder | Scope |
|---|---|---|---|
| Codex | active | [Full access](codex/full-access/rules.md) | Codex launch permissions, defaults, and helper sessions. |
| Claude Code | no rules registered | [Claude Code folder](claude-code/README.md) | Separate home for Claude-specific rules. |
| GitHub Copilot | no rules registered | [Copilot folder](copilot/README.md) | Separate home for Copilot-specific rules. |

## Loading and Enforcement

Controllers and launchers must read the applicable provider rule before configuring or starting that provider. This folder is the canonical documentation; it is not a claim that every provider automatically discovers these Markdown files.

Actual permissions are enforced by the provider's configuration, startup arguments, and hosting environment. A Markdown instruction cannot itself remove a sandbox. Do not copy configuration keys or CLI flags from one provider to another.

## Maintenance

Give each rule the fields `name`, `description`, `version`, `author`, `license`, `applies-to`, and `activation`, with tags and status under `metadata`. Include concrete `Rule`, `Rationale`, `Applies To`, `Exceptions`, and `Verification` sections. Register each active rule once in the table above. Keep links relative and never include credentials or private runtime data.
