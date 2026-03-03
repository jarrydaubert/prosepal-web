# Content Authorship Policy

Last updated: 2026-03-03

## Visible Attribution Standard

- Blog and message detail pages must display:
  - `Reviewed by Prosepal Editorial Team`
  - Role descriptor: `Greeting card writing specialists`

## Credentials Policy

- `Prosepal Editorial Team` represents the in-house editorial workflow for card-writing guidance.
- Content is reviewed for:
  - occasion appropriateness,
  - tone clarity,
  - practical usefulness for real card-writing scenarios.
- Public pages should not claim individual credentials unless a named reviewer profile is added and maintained.

## Schema Model Decision

- Current schema authorship model: `Organization`.
- JSON-LD `Article.author.name` is set to `Prosepal Editorial Team` to match visible attribution.
- Rationale:
  - Articles are collaboratively drafted and revised.
  - Ownership/review responsibility is team-based rather than single-author.

## Change Control

- If moving to `Person` authorship later, update:
  - visible byline blocks,
  - template/schema output,
  - validation evidence in `docs/evidence/`.
