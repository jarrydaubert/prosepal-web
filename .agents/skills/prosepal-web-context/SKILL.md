---
name: prosepal-web-context
description: Project-specific marketing and web implementation context for prosepal-web. Use when working on landing-page UX, CRO, SEO content architecture, schema, analytics instrumentation, or style system decisions for prosepal-web.
---

# Prosepal Web Context

## Scope

This skill captures constraints and defaults for the `prosepal-web` project.

Use this context before applying other marketing skills when tasks involve:

1. Homepage and conversion UX.
2. Blog/messages SEO architecture.
3. Analytics and event instrumentation.
4. Design-system and style-governance decisions.
5. Go-to-market planning, RevOps, and sales enablement decisions.

## Project constraints

1. Mobile-first and modern UX direction.
2. Glassmorphism-inspired visual language on homepage.
3. Official Apple App Store badge only (no custom Apple-style button clones).
4. No logo in navbar (text-only brand treatment).
5. Shared style tokens are the design source of truth.
6. Treat Prosepal as a consumer app growth funnel first, not an enterprise sales-led motion.
7. Primary conversion goals are iOS App Store clicks plus Android waitlist and tips-popup capture.
8. Avoid invented business proof; label uncertain claims as inferred until verified from repo evidence.

## Quality gates

Before claiming work complete, run:

```bash
bun run check
```

`check` includes:

1. SEO artifact generation.
2. Lint.
3. Metadata tests.
4. Site validation.
5. Strict style-audit thresholds.

## Local references

Consult these project docs as the source of truth:

1. `AGENTS.md`
2. `docs/WEB_REDESIGN_EXECUTION.md`
3. `docs/BACKLOG_WEB.md`
