# Prosepal Web Redesign Execution + Definition of Done

Status: Active  
Owner: Web team  
Last updated: 2026-02-25

## Why this document exists

We are moving from ad-hoc page styling to a deliberate, reusable design system with a glassmorphism-forward visual direction.

This document defines:

1. What we are building.
2. How we will build it.
3. How we will know it is complete.

## Product direction (agreed)

1. Mobile-first, modern, high-clarity UX.
2. Glassmorphism-inspired hero and surfaces.
3. Official Apple App Store badge usage (no custom Apple-style button clones).
4. No logo in the navbar (text-only brand treatment).
5. Shared style tokens so visual updates can propagate predictably.

## Scope

In scope:

1. Homepage visual system and interaction quality.
2. Shared typography, spacing, radius, color, and glass tokens.
3. Cross-page token adoption on core pages (`home`, `blog`, `content`, `messages`).
4. Automated style drift detection.
5. Release gates for build, lint, metadata, and validation.

Out of scope (for this phase):

1. Full CMS/content rewrite.
2. New backend services.
3. Non-web app store channel work.

## Current baseline (2026-02-24)

Validation baseline:

1. `bun run check` passes.
2. `bun run lint` passes.
3. `bun run validate` passes.
4. Global header navigation parity now exists on homepage, blog, messages hub, and generated message detail pages (desktop links + mobile menu).
5. Dead generated `grain` markup was removed from message templates/pages.
6. Homepage tips popup now includes focus trapping for keyboard users.
7. SEO artifact governance now includes dedicated tests for `robots.txt`, `sitemap.xml`, and `llms.txt` (`bun run test:artifacts`).
8. `robots.txt` policy now covers Google/Bing/Apple crawlers plus AI indexing/training bot split.
9. `llms.txt` output now groups message guides by occasion and sanitizes markdown text output.

Style drift baseline (`bun run audit:styles`):

1. `hardcoded-font-size`: 0
2. `hardcoded-radius`: 0
3. `hardcoded-color-hex`: 0
4. `hardcoded-font-family`: 0

Interpretation: token migration is complete for currently referenced production stylesheets, and strict audit thresholds are now enforced in the main `check` gate.

## Architecture decisions

1. `public/css/tokens.css` is the single source of truth for primitives.
2. Page styles may compose tokens but should avoid redefining primitives directly.
3. Glass effects are semantic tokens (`--glass-*`) rather than one-off declarations.
4. Typography scale uses tokenized sizes (`--font-size-*`) instead of per-selector literals.
5. Radius and spacing follow token scale (`--radius-*`, `--space-*`) instead of custom per-component values.

## Execution plan

### Phase 1: Foundation hardening

1. Expand tokens where gaps exist (typography, semantic colors, motion durations).
2. Refactor homepage styles to remove remaining hardcoded primitive values where practical.
3. Keep the App Store badge treatment clean (no wrapper border that creates double-border artifacts).

Exit criteria:

1. Homepage uses tokenized typography/spacing/color/radius patterns consistently.
2. No UI regressions at mobile and desktop breakpoints.

### Phase 2: Cross-page migration (completed)

1. `blog.css`, `content.css`, and `messages.css` now consume shared tokens.
2. Hardcoded font stacks and repeated hex colors were replaced with token usage.
3. Shared components (buttons, cards, pills, section shells) were aligned to tokenized patterns.

Exit criteria:

1. Cross-page visual consistency improved without layout regressions.
2. `hardcoded-font-family` is sustained at `0`.
3. `hardcoded-color-hex`, `hardcoded-radius`, and `hardcoded-font-size` are sustained at baseline targets.

### Phase 3: Automation + enforcement

1. Keep `scripts/audit-styles.js` as the drift report.
2. Enforce strict threshold checks in `bun run check`.
3. Set target thresholds and tighten over time.

Initial thresholds before strict CI:

1. `hardcoded-font-family <= 0`
2. `hardcoded-color-hex <= 10`
3. `hardcoded-radius <= 20`
4. `hardcoded-font-size <= 30`
5. Current observed counts: all zero on referenced stylesheets.

## Definition of Done (DoD)

The redesign is done only when all items below are true.

### A) UX + visual quality

1. Homepage matches the intended glassmorphism direction with mobile-first behavior.
2. Navbar is clean and not bubble-container styled.
3. Official Apple App Store badge is used and visually clean (no double-border artifact).
4. Typography hierarchy is consistent and token-driven.

### B) Engineering quality

1. `bun run check` passes.
2. `bun run audit:styles` reports counts at or below agreed thresholds.
3. No inline style attributes or inline executable scripts on indexable pages.
4. No duplicate component variants when a shared tokenized variant exists.

### C) SEO + accessibility guardrails

1. Existing metadata/schema pipelines remain intact.
2. Lighthouse mobile pass is executed before release QA signoff (manual step until automated budget is added).
3. Keyboard/focus behavior remains valid for nav/menu and interactive demo controls.

### D) Operability

1. This document is updated when thresholds or scope change.
2. Backlog reflects open redesign tasks with owner and status.
3. Release QA checklist includes style-audit review.

## Operating workflow (every redesign PR)

1. Implement style/system changes.
2. Run:
   - `bun run lint`
   - `bun run test:artifacts`
   - `bun run validate`
   - `bun run check`
   - `bun run audit:styles`
3. Record audit delta in PR notes:
   - Before: counts from baseline or previous PR.
   - After: updated counts.
4. Confirm mobile + desktop screenshot review for key sections.

## Risks and mitigations

1. Risk: token migration causes subtle regressions on content pages.  
   Mitigation: migrate file-by-file and verify screenshots per page type.
2. Risk: over-constraining early strict gates blocks progress.  
   Mitigation: threshold-based rollout before hard fail.
3. Risk: visual drift returns over time.  
   Mitigation: keep audit script in regular QA and transition to strict CI.

## Immediate next actions

1. Run a manual mobile+desktop visual regression pass for homepage, blog, messages hub, and legal/support pages.
2. Add Lighthouse mobile budget checks to release QA automation.
3. Keep `theme.css` retired so legacy styles cannot drift back into active pages.
