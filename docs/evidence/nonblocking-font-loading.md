# Non-Blocking Font Loading Rollout

Date: 2026-03-02T14:55:11Z

Status: PASS
Backlog item: `WEB-P1-13` (closed)

## Summary

- Introduced shared non-home font loader: `public/js/content-font-loader.js`
- Replaced render-blocking Google Fonts stylesheet links on all non-home pages with:
  - `defer` script loader for async `media="print" -> "all"` swap
  - `noscript` stylesheet fallback
- Updated generation sources to keep output consistent:
  - `templates/message-page.html`
  - `scripts/generate-messages.js`

## Before / After

- Before: `38` non-home HTML files contained render-blocking Playfair/Inter stylesheet links.
- After: `38/38` non-home HTML files include `/js/content-font-loader.js`.
- After: `0` non-home HTML files retain the Playfair/Inter stylesheet link outside `noscript`.

Validation snapshot:

```json
{
  "totalHtml": 39,
  "nonHomeHtml": 38,
  "nonHomeWithLoader": 38,
  "missingLoader": [],
  "blockingOutsideNoscriptCount": 0,
  "blockingOutsideNoscript": []
}
```

## Quality Gate

- `bun run check`: PASS
