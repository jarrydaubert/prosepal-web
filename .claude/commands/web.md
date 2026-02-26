---
description: Expert web implementation and optimization for prosepal-web
argument-hint: [task]
disable-model-invocation: true
---

# /web - Web Builder

**CRITICAL INSTRUCTIONS:**
- Focus on `prosepal-web` files only.
- Preserve the established Prosepal visual direction (glassmorphism, mobile-first, modern).
- Do not introduce style drift; centralize repeatable patterns.
- Validate with `bun run check` after meaningful edits.

## Usage

```bash
/web responsive
/web a11y
/web performance
/web section hero
/web nav rewrite
```

Treat `$ARGUMENTS` as the requested task mode. If omitted, default to `responsive`.

## Project Context

- Stack: static HTML + CSS + JS
- Hosting: Vercel
- Quality gate: `bun run check`
- Key directories:
  - `public/`
  - `public/css/`
  - `public/js/`
  - `scripts/`
  - `templates/`
  - `data/`

## Default Delivery Standard

### Visual & UX
- Mobile-first spacing and type scale
- Clean section rhythm on large desktop monitors
- Accessible contrast and focus states
- CTA wording reflects actual action

### Engineering
- Shared styles/tokens over hardcoded one-offs
- Shared nav/menu behavior across page types
- No dead style systems left behind
- Keep scripts small and deterministic

### Validation
- `bun run check` passes
- Desktop + mobile viewport sanity verified
- No new warnings in validators/style audit

## Task Modes

| Task | Output |
| --- | --- |
| `responsive` | layout and spacing fixes for mobile/tablet/desktop |
| `a11y` | semantic and keyboard/focus improvements |
| `performance` | render-path and asset loading improvements |
| `nav rewrite` | unified nav architecture + behavior across page types |
| `section [name]` | implement or refine a specific section |

## Done Checklist

- [ ] Files updated with centralized, reusable styling patterns
- [ ] Behavior works across homepage + secondary pages
- [ ] `bun run check` clean
- [ ] Any remaining limitations called out explicitly
