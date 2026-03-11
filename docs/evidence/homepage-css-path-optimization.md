# Homepage Render Path Optimization

Date: 2026-03-11T21:11:00Z

Status: PASS
Backlog item: `WEB-P1-17`

## Change

- Split below-the-fold homepage styles into [`public/css/home-deferred.css`](/Users/jarrydaubert/Desktop/prosepal-web/public/css/home-deferred.css) and load them asynchronously from [`public/index.html`](/Users/jarrydaubert/Desktop/prosepal-web/public/index.html).
- Reduced above-the-fold paint cost in [`public/css/home.css`](/Users/jarrydaubert/Desktop/prosepal-web/public/css/home.css) by replacing the animated blurred orb layer with a cheaper static ambient gradient.
- Updated [`public/js/home-font-loader.js`](/Users/jarrydaubert/Desktop/prosepal-web/public/js/home-font-loader.js) so the deferred section stylesheet is promoted without inline handlers.
- Reduced first-load work in [`public/js/home.js`](/Users/jarrydaubert/Desktop/prosepal-web/public/js/home.js) by deferring reveal and demo initialization until idle time and throttling scroll progress updates with `requestAnimationFrame`.

## Measurement Method

Local, same-environment Lighthouse comparison (mobile profile) using static `serve`:

1. Serve `origin/main` build:

```bash
git archive origin/main | tar -x -C /tmp/prosepal-web-main
bunx serve /tmp/prosepal-web-main/public -l 3000
```

2. Baseline run:

```bash
bunx --yes lighthouse http://127.0.0.1:3000 \
  --only-categories=performance \
  --form-factor=mobile \
  --output=json \
  --output-path=/tmp/lh-home-before.json \
  --quiet \
  --chrome-flags="--headless=new --no-sandbox"
```

3. Serve current working copy:

```bash
bunx serve public -l 3000
```

4. Current run:

```bash
bunx --yes lighthouse http://127.0.0.1:3000 \
  --only-categories=performance \
  --form-factor=mobile \
  --output=json \
  --output-path=/tmp/lh-home-after.json \
  --quiet \
  --chrome-flags="--headless=new --no-sandbox"
```

## Results

Before (`origin/main`):

- Performance score: `0.89`
- LCP: `2957.4ms`
- FCP: `2955.4ms`
- Speed Index: `2955.4ms`
- TBT: `0ms`

After (current branch):

- Performance score: `1.00`
- LCP: `1216.5ms`
- FCP: `907.3ms`
- Speed Index: `907.3ms`
- TBT: `0ms`

Delta:

- Performance score: `+0.11`
- LCP: `-1740.9ms`
- FCP: `-2048.2ms`
- Speed Index: `-2048.2ms`

## Conclusion

- PASS: homepage render path is materially lighter in local Lighthouse.
- PASS: interaction, analytics, accessibility, and style-audit gates still pass via `bun run check`.
- Remaining gap for `WEB-P1-17`: production Vercel Speed Insights still needs a post-deploy verification window, because the backlog item is defined against real-user metrics rather than local lab runs alone.
