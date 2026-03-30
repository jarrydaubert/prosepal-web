# Skills Version Tracking

Canonical source for upstream skill provenance and local inclusion policy.
Use `.agents/skills/RUN_HISTORY.md` for installed-skill run history and short usage notes.

## Upstream Reference

- Repository: https://github.com/coreyhaines31/marketingskills
- Version tag: `v1.5.0`
- Commit: `7c8c087486c29290b982820d719e1c4a556c0053`

## Freshness Check (2026-03-29)

- Local sync metadata is stored in `.agents/skills/.sources/marketingskills.json`.
- Upstream skills at tag: 34 total
- Included upstream skills: 34
- Local-only skills: 1

## Upstream Skills Included (34/34)

`ab-test-setup`, `ad-creative`, `ai-seo`, `analytics-tracking`, `churn-prevention`, `cold-email`, `competitor-alternatives`, `content-strategy`, `copy-editing`, `copywriting`, `customer-research`, `email-sequence`, `form-cro`, `free-tool-strategy`, `launch-strategy`, `lead-magnets`, `marketing-ideas`, `marketing-psychology`, `onboarding-cro`, `page-cro`, `paid-ads`, `paywall-upgrade-cro`, `popup-cro`, `pricing-strategy`, `product-marketing-context`, `programmatic-seo`, `referral-program`, `revops`, `sales-enablement`, `schema-markup`, `seo-audit`, `signup-flow-cro`, `site-architecture`, `social-content`

## Upstream Skills Excluded (0)

_none_

## Local-Only Skills (1)

`prosepal-web-context`

## Optimization Policy

1. Canonical skills path is `.agents/skills/` (agents-only route).
2. Local context lives in `.agents/product-marketing-context.md`.
3. `prosepal-web-context` remains local and must persist across syncs.
4. `scripts/validate-marketing-skills-setup.sh` must pass after every sync/update.
