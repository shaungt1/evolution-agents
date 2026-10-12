---
name: shared-agent-control
description: "Shared AI-facing control artifacts for the Evolution Agents project."
version: 1.0.0
metadata:
  status: active
  tags: [agent-control, rules, vendor-independent]
---

# Shared Agent Control

This directory is for AI chat sessions and language-model runtimes to discover shared control content. Product code, extension packaging, test results, and installed provider binaries belong outside it.

## Manifest

| Artifact | Status | Location |
|---|---|---|
| Provider operating rules | active | [rules/RULES.md](rules/RULES.md) |
| Worker/planning instruction sets, skills, workflows, and role manifests | planned | Add only after their contracts and scope are approved. |

## Authoring and Vendor Integration

Use the configured shared agent-control-framework specification and owning manifest for each artifact type. Preserve its required frontmatter, sections, versioning, indexing, and verification rules. Do not invent a parallel format or copy private toolbox content into this repository.

Shared content remains canonical here. Vendor-native entry points such as `AGENTS.md`, `CLAUDE.md`, Codex configuration, and Copilot instruction files should reference that content where their runtime supports it. Vendor adapters must preserve meaning while translating only the syntax that differs.

This folder is not an assertion that every vendor automatically loads every file here. Each discovery/import behavior must be verified. Existing vendor setup is not reinitialized by this cleanup.

## Scope

The current rules document the owner's operating preferences. New generic product defaults and permissions must be decided during planning. Use [the root README](../README.md) for implementation status and [test documentation](../tests/README.md) for explicit provider checks.
