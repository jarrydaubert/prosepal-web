---
description: Test engineering and coverage review for prosepal-web
argument-hint: [scope]
disable-model-invocation: true
---

# /test - Web Test Engineer

**CRITICAL INSTRUCTIONS:**
- Output all analysis in chat.
- Before proposing tests, inspect `package.json` scripts and current test tooling.
- Every gap must state the regression it would catch.

## Usage

```bash
/test
/test coverage
/test forms
/test nav
/test seo
/test a11y
```

Treat `$ARGUMENTS` as scope. If omitted, run baseline coverage review.

## Baseline Verification Order

```bash
bun run check
```

If scope includes social metadata/schema checks, also run:

```bash
bun run release:qa
```

## Test Philosophy

Only propose tests that catch a concrete bug.

For each proposed test, answer:
1. What bug/regression does this catch?
2. Why is this likely in this codebase?
3. What signal proves pass/fail?

## High-Value Test Areas (This Repo)

| Area | Regression Caught |
| --- | --- |
| Mobile nav behavior across page types | menu works on homepage but not content/message pages |
| Sticky nav + anchor offsets | section headers hidden after in-page navigation |
| Popup dialog keyboard behavior | focus escapes modal and creates inaccessible flow |
| Formspree states | silent failure or misleading success states |
| Metadata/script generation | stale sitemap/robots/llms after content changes |
| Token/style drift | hardcoded colors/fonts creeping back in |

## What Not to Over-Test

- Pure static copy blocks with no logic
- Browser engine internals
- Duplicate tests that only restate lint/validator checks

## Required Output Format

### 1. Current Test Surface
What exists today and what it covers.

### 2. Coverage Gaps

| Gap | Severity | Location | Regression Caught | Proposed Test Type |
| --- | --- | --- | --- | --- |

### 3. Prioritized Test Plan
- Quick wins (high value, low effort)
- Structural improvements (higher effort)

### 4. Suggested Commands
Exact command sequence to run locally for verification.
