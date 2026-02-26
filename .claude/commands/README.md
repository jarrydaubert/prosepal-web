# Prosepal Web Slash Commands

Slash commands optimized for `prosepal-web` (static HTML/CSS/JS on Vercel).

## Available Commands

| Command | Purpose | Primary Output |
| --- | --- | --- |
| `/audit [target]` | Deep system/page audit | Prioritized findings with evidence |
| `/security [scope]` | Security and abuse-path review | Risks + concrete mitigations |
| `/compliance [scope]` | Privacy/cookie/claims compliance review | Policy + UI implementation gaps |
| `/test [scope]` | Test strategy and regression gap analysis | High-signal test plan |
| `/cleanup [scope]` | Dead code/dependency/asset housekeeping | Verified cleanup candidates |
| `/web [task]` | Build/refine marketing web UX and performance | Direct implementation guidance |

All commands in this folder are configured for **manual invocation only** (`disable-model-invocation: true`) to keep agent context lean and avoid accidental auto-triggering.

## Project Baseline

Always align recommendations to these repo commands:

```bash
bun run dev
bun run check
```

`bun run check` is the release gate and already includes generation, lint, metadata tests, validation, and strict style-audit thresholds.

## Recommended Audit Sequence

1. `/audit all`
2. `/security`
3. `/compliance`
4. `/test coverage`
5. `/cleanup`
6. `/web responsive` (apply UX/layout refinements)

After fixes, re-run the same sequence to verify closure.

## Modern Claude Note

Claude now treats custom slash commands and skills as part of the same extensibility model. `.claude/commands/*.md` remains fully supported for single-file workflows; use `.claude/skills/<name>/SKILL.md` when you need multi-file references, scripts, or automatic discovery.
