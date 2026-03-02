# Tips Popup Lifecycle Regression Coverage

Date: 2026-03-02T15:10:25Z

Status: PASS
Backlog item: `WEB-P2-20`

Automated scope (`tests/integration/tips-popup.spec.js`):

- Focus trap while popup is open (Tab/Shift+Tab loop within dialog).
- Escape dismiss closes popup and restores focus to previously focused trigger element.
- Overlay click dismiss closes popup.
- Dismiss actions persist localStorage suppression around 14 days.
- Submit success persists localStorage suppression around 90 days and closes popup.
- Suppression is verified across page reload (re-open attempt blocked via exit-intent trigger).

Validation commands:

```bash
bun run test:interaction
bun run check
```

Results:

- `bun run test:interaction`: PASS (`9 passed` total interaction tests including popup suite)
- `bun run check`: PASS (includes interaction suite in primary quality gate)
