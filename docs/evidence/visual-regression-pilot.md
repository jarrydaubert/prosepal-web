# Visual Regression Pilot

Date: 2026-03-02T11:27:00Z

Status: PARTIAL
Backlog item: `WEB-P3-7`

Implemented:

- PR workflow: `.github/workflows/visual-regression.yml`
- Playwright visual config: `playwright.visual.config.js`
- Baseline snapshots versioned:
  - `tests/visual/home-layout.spec.js-snapshots/home-hero-nav-desktop-chromium.png`
  - `tests/visual/home-layout.spec.js-snapshots/home-hero-nav-mobile-chromium.png`
- Test target covers homepage hero + nav on desktop/mobile:
  - `tests/visual/home-layout.spec.js`

Local validation:

```bash
bun run test:visual:update
bun run test:visual
```

Result: PASS (2/2 baseline checks).

Intentional diff demonstration (local):

```bash
FORCE_VISUAL_DIFF=1 bun run test:visual
```

Result: FAIL by design (2/2), with generated diff artifacts:

- `test-results/home-layout-homepage-hero-and-nav-visual-baseline-desktop-chromium/home-hero-nav-diff.png`
- `test-results/home-layout-homepage-hero-and-nav-visual-baseline-mobile-chromium/home-hero-nav-diff.png`

Remaining close condition:

- Record one PR CI run where the `Visual Regression` workflow publishes intentional-diff artifacts in GitHub Actions output.
