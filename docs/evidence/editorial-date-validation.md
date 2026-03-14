# Editorial Date Validation

Date: 2026-03-13

Status: PASS
Backlog item: `WEB-P1-14`

## Contract implemented

- Generated message pages and metadata-only static pages now source `datePublished` and `dateModified` from `data/editorial-metadata.json`.
- Static blog articles keep explicit inline JSON-LD dates in the page HTML.
- `public/sitemap.xml` `lastmod` values now resolve per page from those editorial sources instead of a single build-wide timestamp.
- Missing or invalid editorial dates fail `bun run test:content-date` and block `bun run check`.

## Sample page verification

- `public/messages/birthday-card-message-for-friend.html`
  - `datePublished`: `2025-09-14`
  - `dateModified`: `2026-03-01`
- `public/messages/index.html`
  - `datePublished`: `2026-02-25`
  - `dateModified`: `2026-03-11`
- `public/blog/what-to-write-in-sympathy-card.html`
  - `datePublished`: `2026-01-17`
  - `dateModified`: `2026-01-17`

## Sitemap verification

- `https://www.prosepal.app/` -> `lastmod=2026-03-11`
- `https://www.prosepal.app/messages/` -> `lastmod=2026-03-11`
- `https://www.prosepal.app/messages/birthday-card-message-for-friend.html` -> `lastmod=2026-03-01`
- `https://www.prosepal.app/blog/what-to-write-in-sympathy-card.html` -> `lastmod=2026-01-17`

## Validation

Commands:

```bash
bun run test:content-date
bun run generate:site
bun run check
```

Observed:

- PASS: date resolver and repo-level editorial-date assertions.
- PASS: generated messages hub and sitemap match the editorial metadata contract.
- PASS: full project gate completed after regeneration.
