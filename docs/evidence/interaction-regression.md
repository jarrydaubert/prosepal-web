# Interaction Regression Coverage

Date: 2026-03-02T15:07:20Z

Status: PASS
Backlog item: `WEB-P2-19`

Scope:

- Homepage mobile nav open/close, first-link focus, Escape close + focus return.
- Non-home mobile nav parity (`/privacy.html`) for open/close and focus return.
- Demo chip keyboard navigation (`ArrowRight`, `Home`, `End`) with `aria-selected` updates.
- Android waitlist submit UI states using mocked Formspree responses:
  - success path (`200`) -> `data-state="success"`
  - error path (`500`) -> `data-state="error"`

Automated tests:

- Config: `playwright.interaction.config.js`
- Spec: `tests/integration/home-interactions.spec.js`

Validation commands:

```bash
bun run test:interaction
bun run check
```

Results:

- `bun run test:interaction`: PASS (`5 passed`)
- `bun run check`: PASS (includes `bun run test:interaction` in primary gate)
