# Web Brand Alignment

Date: 2026-03-13T21:18:13Z

Status: PASS
Backlog item: `WEB-P1-16`

Implemented:

- Removed remaining legacy `plum/purple/blue` token names from active shared tokens in `public/css/tokens.css`.
- Added explicit shared gold-brand tokens for web surfaces:
  - `--brand-gold`
  - `--brand-gold-strong`
  - `--brand-gold-soft`
  - `--brand-gold-border`
  - `--brand-gold-glow`
- Updated homepage hero badge to use the app-aligned gold accent.
- Replaced the homepage tips popup cream surface with a slate/gold/coral treatment aligned to the app direction.
- Added gold-accent metadata treatments for:
  - legal/support pages via `.updated`
  - blog/message articles via `.article-meta`
  - blog/message hubs via `.hub-breadcrumb`
- Extended automated coverage so the new direction is visible in committed snapshots for:
  - homepage hero
  - homepage popup
  - blog article
  - message article
  - privacy page
  - support page

Visual snapshot files:

- `tests/visual/home-layout.spec.js-snapshots/home-hero-nav-desktop-chromium.png`
- `tests/visual/home-layout.spec.js-snapshots/home-hero-nav-mobile-chromium.png`
- `tests/visual/home-layout.spec.js-snapshots/home-tips-popup-desktop-chromium.png`
- `tests/visual/home-layout.spec.js-snapshots/home-tips-popup-mobile-chromium.png`
- `tests/visual/content-pages.spec.js-snapshots/blog-birthday-card-messages-desktop-chromium.png`
- `tests/visual/content-pages.spec.js-snapshots/blog-birthday-card-messages-mobile-chromium.png`
- `tests/visual/content-pages.spec.js-snapshots/message-birthday-card-for-friend-desktop-chromium.png`
- `tests/visual/content-pages.spec.js-snapshots/message-birthday-card-for-friend-mobile-chromium.png`
- `tests/visual/content-pages.spec.js-snapshots/privacy-page-desktop-chromium.png`
- `tests/visual/content-pages.spec.js-snapshots/privacy-page-mobile-chromium.png`
- `tests/visual/content-pages.spec.js-snapshots/support-page-desktop-chromium.png`
- `tests/visual/content-pages.spec.js-snapshots/support-page-mobile-chromium.png`

Validation commands:

```bash
bun run test:visual:update
bun run test:visual
bun run check
```

Results:

- `bun run test:visual:update`: PASS (`12 passed`)
- `bun run test:visual`: PASS (`12 passed`)
- `bun run check`: PASS

Notes:

- Active homepage, blog, messages, and legal/support surfaces now share the slate background, coral primary accent, gold secondary accent, and Playfair-led heading hierarchy expected by the Flutter app direction.
- No legacy plum/cream styling remains on active UI paths. The prior cream popup surface is now slate-based, and legacy plum/purple token names were removed from the active token source.
