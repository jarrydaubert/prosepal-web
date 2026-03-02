# Homepage CSS Path Optimization

Date: 2026-03-02T11:03:00Z

Status: PASS
Backlog item: `WEB-P2-10`

## Change

- Removed the blocking Google Fonts stylesheet `<link rel="stylesheet">` from `public/index.html`.
- Added `public/js/home-font-loader.js` to load the same font stylesheet asynchronously (`media=print` -> `all`) in a CSP-safe way.
- Added a `<noscript>` fallback stylesheet link for non-JavaScript sessions.

## Measurement Method

Local, same-environment Lighthouse comparison (mobile profile):

1. Start local static server:

```bash
python3 -m http.server 3000 --directory public
```

2. Baseline run (pre-change `index.html` from `HEAD`):

```bash
bunx --yes lighthouse http://127.0.0.1:3000 \
  --only-categories=performance \
  --form-factor=mobile \
  --output=json \
  --output-path=/tmp/lh-before-local.json \
  --quiet \
  --chrome-flags="--headless=new --no-sandbox"
```

3. Optimized run (current working copy):

```bash
bunx --yes lighthouse http://127.0.0.1:3000 \
  --only-categories=performance \
  --form-factor=mobile \
  --output=json \
  --output-path=/tmp/lh-after-local.json \
  --quiet \
  --chrome-flags="--headless=new --no-sandbox"
```

## Results

Before (baseline):

- Performance score: `0.92`
- LCP: `2802.3ms`
- FCP: `2502.3ms`
- Speed Index: `2502.3ms`
- Render-blocking requests:
  - Google Fonts CSS (`fonts.googleapis.com`)
  - `/css/home.css`
  - `/css/tokens.css`

After (optimized):

- Performance score: `0.99`
- LCP: `1872.2ms`
- FCP: `1201.7ms`
- Speed Index: `1201.7ms`
- Render-blocking requests:
  - `/css/home.css`
  - `/css/tokens.css`

Delta:

- Performance score: `+0.07`
- LCP: `-930.2ms`
- FCP: `-1300.6ms`
- Speed Index: `-1300.6ms`

## Duplicate Stylesheet Download Check

Lighthouse network request audit (`/tmp/lh-after-local.json`) showed:

- CSS requests: `2`
- Unique CSS URLs: `2`
- Duplicate CSS URLs: `0`

Conclusion:

- PASS: homepage CSS path improved with measured Lighthouse/LCP gains.
- PASS: no duplicate stylesheet download regression introduced.
