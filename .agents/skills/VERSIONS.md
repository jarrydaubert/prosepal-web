# Skills Version Tracking

Canonical source for upstream skill provenance and local inclusion policy.

## Upstream Reference

- Repository: https://github.com/coreyhaines31/marketingskills
- Version tag: `v1.9.0`
- Commit: `1bcff9fc79c64fd7886c3c7aa583f4bd63916ff2`

## Freshness Check (2026-04-29)

- Local sync metadata is stored in `.agents/skills/.sources/marketingskills.json`.
- Upstream skills at tag: 40 total
- Included upstream skills: 40
- Local-only skills: 8

## Upstream Skills Included (40/40)

`ab-test-setup`, `ad-creative`, `ai-seo`, `analytics-tracking`, `aso-audit`, `churn-prevention`, `cold-email`, `community-marketing`, `competitor-alternatives`, `competitor-profiling`, `content-strategy`, `copy-editing`, `copywriting`, `customer-research`, `directory-submissions`, `email-sequence`, `form-cro`, `free-tool-strategy`, `image`, `launch-strategy`, `lead-magnets`, `marketing-ideas`, `marketing-psychology`, `onboarding-cro`, `page-cro`, `paid-ads`, `paywall-upgrade-cro`, `popup-cro`, `pricing-strategy`, `product-marketing-context`, `programmatic-seo`, `referral-program`, `revops`, `sales-enablement`, `schema-markup`, `seo-audit`, `signup-flow-cro`, `site-architecture`, `social-content`, `video`

## Upstream Skills Excluded (0)

_none_

## Local-Only Skills (8)

`accessibility`, `codebase-cleanup-sweep`, `design-an-interface`, `engineering`, `frontend-design`, `prd-to-issues`, `prosepal-web-context`, `tdd`

## Optimization Policy

1. Canonical skills path is `.agents/skills/` (agents-first route).
2. Shared product context lives in `.agents/product-marketing-context.md`.
3. Shared project constraints live in `.agents/skills/prosepal-web-context/SKILL.md`.
4. Upstream marketing skills stay close to upstream; Prosepal-specific rules are centralized instead of duplicated in every synced skill.
5. `scripts/validate-marketing-skills-setup.sh` must pass after every sync/update.
6. Canonical keep/sync lists live in `.agents/skills/.profiles/` and should be edited there rather than re-hardcoded in scripts.
