# Skills Version Tracking

Canonical source for upstream skill provenance and local inclusion policy.

## Upstream Reference

- Repository: https://github.com/coreyhaines31/marketingskills
- Version tag: `v1.3.0`
- Commit: `a3516be13d24b5e2fc1be6b3c1f24ca380b895d7`

## Freshness Check (2026-03-02)

- Local sync metadata is stored in `.agents/skills/.sources/marketingskills.json`.
- Upstream skills at tag: 32 total
- Included upstream skills: 32
- Local-only skills: 1

## Upstream Skills Included (32/32)

`ab-test-setup`, `ad-creative`, `ai-seo`, `analytics-tracking`, `churn-prevention`, `cold-email`, `competitor-alternatives`, `content-strategy`, `copy-editing`, `copywriting`, `email-sequence`, `form-cro`, `free-tool-strategy`, `launch-strategy`, `marketing-ideas`, `marketing-psychology`, `onboarding-cro`, `page-cro`, `paid-ads`, `paywall-upgrade-cro`, `popup-cro`, `pricing-strategy`, `product-marketing-context`, `programmatic-seo`, `referral-program`, `revops`, `sales-enablement`, `schema-markup`, `seo-audit`, `signup-flow-cro`, `site-architecture`, `social-content`

## Upstream Skills Excluded (0)

_none_

## Local-Only Skills (1)

`prosepal-web-context`

## Optimization Policy

1. Canonical skills path is `.agents/skills/` (agents-only route).
2. Local context lives in `.agents/product-marketing-context.md`.
3. `prosepal-web-context` remains local and must persist across syncs.
4. `scripts/validate-marketing-skills-setup.sh` must pass after every sync/update.
