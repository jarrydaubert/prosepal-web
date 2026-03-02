# Visual Regression Pilot

Date: 2026-03-02T12:34:00Z

Status: PASS
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

CI validation:

- Baseline PR run (PASS):
  - Run: `22576066658`
  - URL: `https://github.com/jarrydaubert/prosepal-web/actions/runs/22576066658`
- Intentional diff workflow-dispatch run (FAIL by design with artifacts):
  - Run: `22576171737`
  - URL: `https://github.com/jarrydaubert/prosepal-web/actions/runs/22576171737`
  - Input: `intentional_diff=true` (`FORCE_VISUAL_DIFF=1` in job env)
  - Artifact: `visual-regression-artifacts` (`artifact id 5721024662`)

Conclusion:

- PASS: lightweight visual regression workflow runs on PRs for homepage hero + nav desktop/mobile.
- PASS: baseline images are versioned in-repo.
- PASS: intentional style diff is demonstrated in CI output with uploaded diff artifacts.
