# Marketing Claims Verification

Date: 2026-03-02T14:07:37Z

Status: PARTIAL

Scope:
- Validate prominent quantified/value claims used in public marketing copy.
- Mark each claim as `Verified` or `Needs source`.

## Claim Register

- Claim: "Get three heartfelt options in under 10 seconds."
  - Location: `public/index.html`
  - Status: `Verified (copy + product positioning)`
  - Evidence: homepage hero copy and structured 3-option product framing across site.

- Claim: "No signup. No credit card."
  - Location: `public/index.html`
  - Status: `Verified (copy claim present)`
  - Evidence: explicit CTA-area copy on homepage.

- Claim: "On Android? Join the waitlist."
  - Location: `public/index.html`
  - Status: `Verified`
  - Evidence: active Formspree-backed waitlist form and success/error handling in `public/js/home.js`.

- Claim: "Join 500+ people who get weekly message inspiration + early Android access."
  - Location: `public/index.html`
  - Status: `Needs source`
  - Evidence gap: no repository analytics export or documented source-of-truth count.

- Claim: "40+ Occasions"
  - Location: `public/index.html`, `public/messages/index.html` (generated)
  - Status: `Needs source`
  - Evidence gap: current repository message data (`data/messages-pages.json`) contains 16 unique occasion values across 27 generated pages; this does not independently verify app-level "40+" capability.

- Claim: "14 Relationships"
  - Location: `public/index.html`
  - Status: `Needs source`
  - Evidence gap: current repository message data contains 15 unique relationship values in generated pages; no canonical app-side capability source is included in this repo.

- Claim: "Pro subscribers get up to 500 generations per month"
  - Location: `public/support.html`
  - Status: `Verified (support/policy claim present)`
  - Evidence: support FAQ includes plan-limit statement; privacy page references subscription handling via RevenueCat.

- Claim: "iOS app destination (App Store id 6757088726)"
  - Location: `public/index.html`, `public/support.html`, generated pages
  - Status: `Verified`
  - Evidence: app store URL and app-id metadata appear across templates/pages.

## Data Validation Snapshot

Command:

```bash
node -e "const d=require('./data/messages-pages.json'); const occ=[...new Set(d.pages.map(p=>p.occasion))]; const rel=[...new Set(d.pages.map(p=>p.relationship))]; console.log({pages:d.pages.length,occasions:occ.length,relationships:rel.length});"
```

Observed:
- `pages`: `27`
- `occasions`: `16`
- `relationships`: `15`

## Follow-up Actions

- Keep `WEB-P2-22` open until each quantified claim is either:
  - backed by a documented source in-repo, or
  - updated/removed from public copy.
