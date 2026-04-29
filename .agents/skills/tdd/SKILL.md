---
name: tdd
description: "When the user wants test-driven development for a feature or bug fix. Also use when the user mentions 'TDD,' 'red green refactor,' 'test-first,' or asks how to add tests that catch real regressions."
metadata:
  version: 1.0.0
  source: mattpocock/skills@8e51ff7 (adapted for prosepal-web)
---

# Test-Driven Development

Use Red -> Green -> Refactor in thin vertical slices.

Core rule: every test must answer "what bug will this test catch?"

## Workflow

1. Define the user-visible behavior or generated artifact invariant before code.
2. Pick the narrowest test layer that catches the bug.
3. Write one failing test.
4. Implement only enough to pass.
5. Refactor, rerun the targeted test, then run the relevant gate.

## Prosepal Web Context

Useful test targets:

- SEO artifact generators.
- HTML validation and metadata invariants.
- Analytics/event wiring.
- Homepage enhancement behavior.
- Style audit rules and token usage.
- Critical interaction tests.

## Validation

Run the smallest relevant command first, then the full gate when ready:

```bash
bun run check
```

Avoid fixed sleeps in browser tests; prefer deterministic selectors, events, and assertions.

## Output

State the regression protected, the test added or updated, and the validation result.
