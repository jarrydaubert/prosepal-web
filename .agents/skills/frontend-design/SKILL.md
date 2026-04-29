---
name: frontend-design
description: When the user wants to design or redesign a page, component, landing page, dashboard, or visual system and the quality of the UI direction matters. Also use when the user mentions "frontend design," "make this look better," "UI polish," "visual redesign," "landing page design," "marketing page," "avoid generic AI design," "make this feel premium," or "give this a stronger visual identity." Use this whenever the task needs intentional, non-generic interface design plus implementation guidance.
metadata:
  version: 1.0.0
  source: anthropics/skills frontend-design (adapted for prosepal-web)
---

# Frontend Design

Design and implement UI that feels deliberate, distinct, and production-ready.

## Workflow

1. Read the existing page, CSS tokens, and component patterns before designing.
2. Choose a clear visual direction that fits the user task and product category.
3. Implement with existing tokens and responsive constraints first.
4. Preserve accessibility, no-JS readability, and performance.
5. Verify desktop and mobile behavior before calling the work done.

## Prosepal Web Context

- Prosepal is a consumer writing app growth funnel, not an enterprise SaaS dashboard.
- Homepage visuals can be expressive, but the first viewport must still communicate the product and conversion path.
- Use shared CSS tokens as the design source of truth.
- Avoid generic hero-card-grid sameness, one-note palettes, and decorative effects that do not support comprehension.
- Preserve official App Store badge usage.
- Keep no-JS and full-page captures meaningful; avoid hiding content behind JS-only reveals.

## Existing Patterns

- Main site assets live in `public/`.
- Shared tokens live in `public/css/tokens.css`.
- Homepage styles are split between `public/css/home.css` and `public/css/home-deferred.css`.
- Enhancement JS lives in `public/js/home-enhancements.js`.

## Validation

Run:

```bash
bun run check
```

For visual changes, also inspect mobile and desktop screenshots through the repo's visual tooling when practical.

## Output

When used, provide the visual direction, key structural/UI changes, implementation approach, and accessibility/performance checks that must not regress.
