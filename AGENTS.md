# AGENTS.md

## Purpose

Operational guide for contributors and coding agents working in `prosepal-web`.

## Project facts

1. Site type: static web app (HTML/CSS/JS) with generated SEO artifacts.
2. Runtime hosting: Vercel (deployment target).
3. Edge/domain: Cloudflare fronts the public domain.
4. Repository: public GitHub repo with Actions enabled.
5. Primary release gate: `bun run check`.

## Deployment Standard

Production deployment is done via Vercel CLI/SDK workflow only.

Required sequence:

```bash
bun run check
bun run vercel:check-link
bun run deploy:prod
```

Important safety rule:

1. This machine also deploys other projects (including PayeTax).
2. Always run `bun run vercel:check-link` before any preview/prod deploy.
3. If the check fails, relink correctly before continuing:

```bash
vercel link --project prosepal-web
```

## Operating Doctrine

Priorities (in order):

1. User-facing correctness and trust (broken UX, misleading copy, bad links, bad form behavior).
2. SEO and indexability integrity (canonical/meta/schema/sitemap/robots/llms correctness).
3. Security and privacy basics (CSP, form endpoint sanity, no accidental data leakage).
4. Design-system consistency (tokenized styling, low drift, mobile-first quality).
5. Delivery discipline (clear evidence when claiming something is done).

## Definition Of Done

A change is done only when:

1. Behavior matches scope and acceptance criteria.
2. Relevant checks were run (or inability to run is stated explicitly).
3. Any generated artifacts impacted by the change are regenerated and valid.
4. Backlog/docs are updated if scope, standards, or status changed.
5. Summary includes concrete evidence (commands + key outcome).

## Before You Change Code

1. Check existing patterns in `public/`, `public/css/`, `public/js/`, and `scripts/`.
2. Prefer shared tokens/components over one-off styling.
3. Verify whether the change affects generated artifacts (`messages`, `sitemap`, `robots`, `llms`).
4. Confirm any copy/CTA changes are truthful and destination-aligned.

## After You Change Code

Run the smallest relevant gate, then full gate before handoff:

```bash
bun run lint
bun run test:artifacts
bun run validate
bun run check
```

If a command cannot be run, explicitly state what was not run and why.

## Evidence Standard For Completion Claims

When reporting completion, include:

1. Files changed.
2. Commands run.
3. Pass/fail result summary.
4. Remaining risks or follow-up backlog IDs (if any).

## Required local quality flow

Run these before shipping:

```bash
bun run lint
bun run test:artifacts
bun run validate
bun run check
```

`check` already includes:

1. SEO artifact generation.
2. Metadata tests.
3. SEO artifact integrity tests (`robots.txt`, `sitemap.xml`, `llms.txt`).
4. HTML/SEO validation.
5. Strict style audit thresholds.

## Skills source of truth

Marketing skill packs are sourced from:

- `https://github.com/coreyhaines31/marketingskills`
- Pinned ref: `v1.2.0` (current latest tag at time of setup)

Local install target in this project:

- `.claude/skills/`

Synced source metadata:

- `.claude/skills/.sources/marketingskills.json`

## Skills update workflow

Check if upstream changed:

```bash
scripts/sync-marketing-skills.sh --check
```

Sync latest skills into this project:

```bash
scripts/sync-marketing-skills.sh --sync
```

To move to a newer upstream release tag, override the ref explicitly:

```bash
UPSTREAM_REF=v1.3.0 scripts/sync-marketing-skills.sh --sync
```

Apply the Prosepal skill profile (keep/remove set) after syncing:

```bash
scripts/apply-marketing-skill-profile.sh --apply
```

If network is restricted but a local checkout already exists, run in offline mode:

```bash
SKIP_FETCH=1 CACHE_DIR=/tmp/marketingskills scripts/sync-marketing-skills.sh --sync
```

Recommended cadence:

1. Check at least once per month.
2. Check before major redesign, CRO, or SEO planning work.
3. Re-apply profile after each sync to keep the local skill set focused.
4. When a newer release tag appears, update the pinned ref here and resync.

## Skill profile

Current kept upstream skills (29):

1. `ab-test-setup`
2. `ad-creative`
3. `ai-seo`
4. `analytics-tracking`
5. `churn-prevention`
6. `cold-email`
7. `competitor-alternatives`
8. `content-strategy`
9. `copy-editing`
10. `copywriting`
11. `email-sequence`
12. `form-cro`
13. `free-tool-strategy`
14. `launch-strategy`
15. `marketing-ideas`
16. `marketing-psychology`
17. `onboarding-cro`
18. `page-cro`
19. `paid-ads`
20. `paywall-upgrade-cro`
21. `popup-cro`
22. `pricing-strategy`
23. `product-marketing-context`
24. `programmatic-seo`
25. `referral-program`
26. `schema-markup`
27. `seo-audit`
28. `signup-flow-cro`
29. `social-content`

Local project customization skill:

1. `prosepal-web-context`

## Documentation maintenance

Keep these docs current:

1. `CLAUDE.md` should stay minimal and evergreen, pointing here.
2. `docs/BACKLOG_WEB.md` status date and release checklist should reflect current reality.
3. `docs/WEB_REDESIGN_EXECUTION.md` should track active standards and Definition of Done.
4. `docs/guides/DEPLOYMENT.md` should match current Vercel/Cloudflare deployment reality.
5. `docs/guides/CI.md` should match current GitHub Actions + Dependabot behavior.

## Slash Commands

Project-specific Claude slash commands live in:

- `.claude/commands/`

Current command set:

1. `plan`
2. `audit`
3. `cleanup`
4. `compliance`
5. `debug`
6. `security`
7. `test`
8. `web`
