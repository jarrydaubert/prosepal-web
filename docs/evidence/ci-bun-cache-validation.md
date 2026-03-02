# CI Bun Cache Validation

Date: 2026-03-02T11:10:00Z

Status: PASS
Backlog item: `WEB-P3-5`

## Scope

Validate that Bun dependency caching is deterministic, visible in logs, and non-regressive for runtime on `main`.

## Deterministic Cache Configuration

Verified in workflow files:

- `.github/workflows/seo-quality.yml`
- `.github/workflows/lighthouse-budget.yml`

Both define:

- `uses: actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830`
- `path: ~/.bun/install/cache`
- `key: ${{ runner.os }}-bun-cache-${{ hashFiles('bun.lock') }}`

## Cache Hit Visibility (Logs)

`Web Quality` run `22571387074`:

- `Setup Bun` step includes:
  - `Cache hit for: swrvKXH4hkDYFKcrNV+Kct676IY=`
  - `Cache restored successfully`

`Lighthouse Budget` run `22571387108`:

- `Setup Bun` step includes:
  - `Cache hit for: swrvKXH4hkDYFKcrNV+Kct676IY=`
  - `Cache restored successfully`

## Runtime Comparison (Main Branch)

### Web Quality

Baseline window (5 latest successful `main` runs before cache-change run):

- `22462631139`: `9s`
- `22454362545`: `13s`
- `22453431618`: `12s`
- `22452937073`: `16s`
- `22452172325`: `14s`

Baseline average: `12.8s`

Post-change successful `main` run:

- `22571387074`: `12s`

Post average: `12.0s`

Result: non-regressive (`-0.8s` vs baseline average).

### Lighthouse Budget

Baseline window (latest successful `main` runs before cache-change run):

- `22454362548`: `75s`
- `22451318866`: `76s`

Baseline average: `75.5s`

Post-change successful `main` run:

- `22571387108`: `66s`

Post average: `66.0s`

Result: non-regressive (`-9.5s` vs baseline average).

## Command References

```bash
gh run list --workflow "Web Quality" --repo jarrydaubert/prosepal-web --limit 20 --json databaseId,createdAt,startedAt,updatedAt,headBranch,conclusion,url
gh run list --workflow "Lighthouse Budget" --repo jarrydaubert/prosepal-web --limit 10 --json databaseId,createdAt,startedAt,updatedAt,headBranch,conclusion,url
gh run view 22571387074 --repo jarrydaubert/prosepal-web --log
gh run view 22571387108 --repo jarrydaubert/prosepal-web --log
```

Conclusion:

- PASS: deterministic Bun cache configuration is present.
- PASS: cache hit behavior is visible in workflow logs.
- PASS: recent `main` workflow runtime is non-regressive.
