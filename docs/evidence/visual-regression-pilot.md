# Visual Regression Coverage

Date: 2026-03-02T15:03:20Z

Status: PASS
Backlog item: `WEB-P2-17`

Implemented:

- Visual workflow: `.github/workflows/visual-regression.yml`
- Playwright config: `playwright.visual.config.js`
- Visual specs:
  - `tests/visual/home-layout.spec.js`
  - `tests/visual/content-pages.spec.js`
- Baseline snapshots versioned:
  - `tests/visual/home-layout.spec.js-snapshots/home-hero-nav-desktop-chromium.png`
  - `tests/visual/home-layout.spec.js-snapshots/home-hero-nav-mobile-chromium.png`
  - `tests/visual/content-pages.spec.js-snapshots/blog-birthday-card-messages-desktop-chromium.png`
  - `tests/visual/content-pages.spec.js-snapshots/blog-birthday-card-messages-mobile-chromium.png`
  - `tests/visual/content-pages.spec.js-snapshots/message-birthday-card-for-friend-desktop-chromium.png`
  - `tests/visual/content-pages.spec.js-snapshots/message-birthday-card-for-friend-mobile-chromium.png`

Local validation:

```bash
bun run test:visual:update
bun run test:visual
```

Result: PASS (6/6 visual checks across desktop/mobile for homepage, one blog page, and one message detail page).

CI note:

- Visual regression workflow remains enabled on PR/push and executes `bun run test:visual`.
- Latest successful workflow run (as of 2026-03-02): `22581543418`
  - URL: `https://github.com/jarrydaubert/prosepal-web/actions/runs/22581543418`
