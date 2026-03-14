# Tracking Plan

## Purpose

Define a stable analytics contract for `prosepal-web` so product and growth decisions can be made from consistent event data.

## Privacy Guardrails

- Respect `DNT`, `GPC`, and local opt-out (`prosepal_analytics_opt_out`) before sending events.
- Do not send direct identifiers (email, name, phone, free-text form input).
- Track only behavioral and structural fields needed for funnel analysis.

## Attribution Contract

When present in the landing URL, these fields are captured and persisted in local storage, then attached to conversion events:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `gclid`
- `fbclid`

Persistence behavior:

- Key: `prosepal_analytics_attribution_v1`
- Expiry: 90 days
- Later visits without URL params reuse unexpired stored attribution

## Location Taxonomy

`app_store_click.location` uses this stable enum:

- `hero_primary`
- `header_nav`
- `blog_hub_top_assist`
- `messages_hub_top_assist`
- `content_cta`
- `mobile_menu`
- `footer`
- `inline_link`

## Event Catalog

| Event | Trigger | Required Properties | Optional Properties |
| --- | --- | --- | --- |
| `app_store_click` | User clicks any App Store link | `location`, `page_type`, `page_path` | Attribution fields |
| `demo_chip_click` | User switches a demo chip on homepage (click or keyboard) | `variant`, `interaction` | Attribution fields |
| `waitlist_submit_start` | Waitlist form submit initiated (hero/content/popup) | `surface` | Attribution fields |
| `waitlist_submit_success` | Waitlist submission accepted | `surface` | Attribution fields |
| `waitlist_submit_error` | Waitlist submission failed | `surface` | Attribution fields |
| `tips_popup_open` | Tips popup is opened by timer or exit-intent | `surface`, `trigger` | Attribution fields |
| `tips_popup_dismiss` | Tips popup is closed by user action or submit-close | `surface`, `reason` | Attribution fields |
| `experiment_exposure` | Experiment assignment observed in active session | `experiment_id`, `variant_id` | Attribution fields |

## Conversion Definitions

- Primary conversion: `app_store_click`
- Secondary conversion: `waitlist_submit_success`
- Funnel diagnostics:
  - Attempt volume: `waitlist_submit_start`
  - Failure rate input: `waitlist_submit_error`
  - Popup friction: `tips_popup_open` vs `tips_popup_dismiss` and popup submit outcomes

Experiment context:

- Conversion events inherit active experiment context (`experiment_id`, `variant_id`) when an assignment exists.
- Current homepage hero-copy decision: production defaults to `treatment`, which leads with hard-to-write moments while keeping occasion discovery in navigation and SEO surfaces; QA override remains available via `?exp_hero_copy_clarity_v1=control|treatment`.

## Core Business Questions

- Which channels and campaigns drive App Store intent?
- Which page types and CTA locations convert best to App Store clicks?
- Which waitlist surfaces have strongest completion and weakest failure rates?
- Do attribution mix and conversion patterns differ between home, blog, and message pages?

## QA and Enforcement

- Runtime validator: `bun run validate:events:conversion`
- Interaction coverage: `bun run test:interaction`
- Full quality gate: `bun run check`

Validation expectations:

- Required conversion events emit during runtime checks.
- Attribution fields are present on conversion events when URL parameters are present.
- Event naming and property schema stay backward-compatible unless documented migration is approved.
