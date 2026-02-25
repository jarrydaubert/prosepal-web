# Prosepal Web Backlog

> Items to do for prosepal-web. Remove items when complete.

---

## SEO Enhancements

### OG Share Images
**Priority:** Medium

Currently using `logo.png` for Open Graph and Twitter cards. Should create proper 1200x630px share images.

- Create main OG image for homepage (show app UI mockup + tagline)
- Create OG images for each blog post (optional, can use generic)
- Update meta tags in `index.html` and blog posts

**Files:** `public/index.html` lines 15, 22 | `public/blog/*.html` og:image tags

---

### Google Search Console Setup
**Priority:** High

Manual steps after deploy:

- Verify domain ownership at https://search.google.com/search-console
- Submit sitemap: `https://www.prosepal.app/sitemap.xml`
- Request indexing for homepage
- Request indexing for blog index

---

### SoftwareApplication Schema - Add Ratings
**Priority:** Low
**Trigger:** When app has 10+ App Store reviews

Add actual rating values to the SoftwareApplication schema in `public/index.html`:

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "ratingCount": "47",
  "bestRating": "5",
  "worstRating": "1"
}
```

---

## Content Roadmap

### Blog Posts
**Cadence:** 1 post every 2 weeks per MARKETING.md

| Post | Target Keyword | Timing |
|------|----------------|--------|
| Get Well Soon Card Messages | get well soon messages | Evergreen |
| New Baby Card Messages | new baby card message | Evergreen |
| Retirement Card Messages | retirement card message | Evergreen |
| Christmas Card Messages | christmas card message | November |
| Valentine's Day Messages | valentine card message | January |
| Mother's Day Messages | mothers day card message | April |
| Father's Day Messages | fathers day card message | May |

**Template:** See MARKETING.md Section 13

---

## Performance

### Image Optimization
**Priority:** Low

- Convert `logo.png` to WebP with PNG fallback
- Add `srcset` for different device sizes
- Verify all images have explicit width/height

---

### Preconnect Hints
**Priority:** Low

Add to `<head>`:
```html
<link rel="preconnect" href="https://apps.apple.com">
```

---

## Future Enhancements

### Add hreflang When Localizing
**Trigger:** When creating UK/AU-specific landing pages

- `/uk/` - UK-specific (Mum spelling, GBP, UK retailers)
- `/au/` - Australia-specific (AU dates, AUD)

---

### Blog Search/Filter
**Trigger:** When blog has 10+ posts

Add client-side search or category filtering to blog index.

---

### Analytics Events
**Priority:** Low

Consider custom Vercel Analytics events:
- Blog post scroll depth
- CTA click tracking
- Time on page
