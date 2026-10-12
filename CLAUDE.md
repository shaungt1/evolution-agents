# CLAUDE.md

@AGENTS.md

Follow the [repository contributor guide](AGENTS.md) and [current implementation status](README.md). Shared provider rules are indexed in [.agents/rules/RULES.md](.agents/rules/RULES.md).

The owner vision and requirements are preserved in `docs/`; they describe the intended system, not proof that its full lifecycle already works. Provider recipes in `scripts/tests/` are explicit manual tests, with generated output under ignored `tests/.output/`.

Keep plans in `.admin-local/planning/`. Preserve the owner's existing Claude configuration and private shared-toolbox setup. Do not initialize vendor folders, install packages, start services, publish changes, or implement the proposed runtime/UI merely because a planning document describes them.
