---
name: accessibility
version: 1.1.0
description: When discussing accessibility, WCAG compliance, screen readers, keyboard navigation, a11y audits, inclusive design, focus states, contrast, or reduced-motion behavior. Prosepal web targets WCAG 2.2 AA for the static marketing site and conversion flows.
---

# Accessibility

Use this skill for accessibility audits and remediation in `prosepal-web`.

## Prosepal Web Context

- Target WCAG 2.2 AA.
- Primary surfaces are a static marketing homepage, message/blog pages, guides, nav, footer, App Store CTAs, waitlist forms, and popup/modal flows.
- Preserve fast static rendering, semantic HTML, readable mobile layouts, and reduced-motion behavior.
- Read `.agents/skills/prosepal-web-context/SKILL.md` first when the work touches UX, CRO, SEO, analytics, or style-system decisions.

## Checklist

### Perceivable

- Images have meaningful `alt` text; decorative assets are hidden from assistive tech.
- Headings are logical and describe the page structure.
- Color contrast is at least 4.5:1 for normal text and 3:1 for UI components.
- Information is not conveyed by color alone.
- Text remains usable at 200% zoom and at 320px width.

### Operable

- All links, buttons, forms, popups, and menus work by keyboard.
- Focus order follows visual order.
- `:focus-visible` states are obvious and not clipped.
- Touch targets are at least 44px where practical.
- Motion respects `prefers-reduced-motion`.

### Understandable

- Page titles, labels, link text, and CTA copy are specific.
- Form errors are clear and associated with the relevant control.
- Popups and dialogs have predictable close behavior.

### Robust

- HTML validates.
- ARIA is used only when native HTML is not enough.
- Dynamic status or form feedback uses appropriate live regions.

## Testing

Use the repo's existing validation first:

```bash
bun run check
```

For focused manual review:

1. Navigate the page with keyboard only.
2. Test mobile widths and 200% zoom.
3. Check reduced motion.
4. Verify popup/modal focus trapping and close behavior.
5. Test with VoiceOver or another screen reader when interaction semantics changed.

## Output

Report verified issues with file/path references, severity, user impact, and the smallest fix that preserves the existing design system.
