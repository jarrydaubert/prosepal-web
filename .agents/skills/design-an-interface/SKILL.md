---
name: design-an-interface
description: "When the user wants to design or compare API/module interfaces before implementation. Also use when discussing refactors, module boundaries, generated-data contracts, script interfaces, or asking for multiple design options."
metadata:
  version: 1.0.0
  source: mattpocock/skills@8e51ff7 (adapted for prosepal-web)
---

# Design An Interface

Design 2-4 meaningfully different interface options before implementation.

## Workflow

1. Define the caller, behavior, data shape, constraints, and compatibility needs.
2. Produce distinct designs with signatures and example usage.
3. Compare simplicity, misuse resistance, testability, migration cost, and fit with the static-site architecture.
4. Recommend one design with files impacted and validation to run.

## Prosepal Web Context

High-value targets:

- Content and SEO generators in `scripts/`.
- Structured data and sitemap/llms contracts.
- Analytics/event payload boundaries.
- Homepage enhancement JS interfaces.
- Shared CSS token and component conventions.

Constraints:

- Prefer deterministic scripts over manual edits for generated artifacts.
- Keep browser JS small and progressive-enhancement friendly.
- Keep product, SEO, analytics, and style-system rules centralized instead of duplicating them across pages.
- Use `.agents/skills/prosepal-web-context/SKILL.md` for project constraints.

## Output

Return candidate interfaces, the recommended choice, files likely impacted, and tests/checks to add or run.
