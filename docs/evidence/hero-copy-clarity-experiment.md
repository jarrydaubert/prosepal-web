# Hero Copy Clarity Experiment Decision

Last updated: 2026-03-03

## Scope

- Experiment ID: `hero_copy_clarity_v1`
- Control copy:
  - Badge: `AI-powered card messages`
  - Headline: `Words that actually land`
- Treatment copy:
  - Badge: `Greeting card message generator`
  - Headline: `Greeting card messages that actually land`

## Measurement Contract (defined before launch)

- Primary success metric: lift in homepage `app_store_click` rate at `location=hero_primary`.
- Guardrail metric: no regression in `waitlist_submit_success` rate on homepage hero waitlist.
- Confidence threshold: `95%` (two-sided).
- Minimum sample size target: `>= 1,000` unique sessions per variant.
- MDE target: detect `>= 15%` relative lift on primary metric.
- Decision rule:
  - Declare winner only after sample target is met.
  - Promote treatment only if primary metric meets threshold and guardrail does not regress by more than `5%` relative.
  - If inconclusive, keep clarity-forward copy as default and re-run with larger sample window.

## Current Decision

- Selected variant: `treatment` (clarity-forward category framing).
- Production behavior:
  - Homepage static copy reflects treatment.
  - Experiment assignment defaults to treatment.
  - QA override remains available using `?exp_hero_copy_clarity_v1=control|treatment`.

## Implementation Evidence

- Homepage default treatment copy: `public/index.html`
- Assignment + override logic: `public/js/experiments.js`
- Conversion + exposure analytics context: `public/js/analytics.js`
- Runtime test coverage: `tests/integration/experiments.spec.js`
