# CI Usage Budget Audit

Date: 2026-03-14T09:41:48.184Z
Repository: jarrydaubert/prosepal-web
Window: last 30 days

Status: FAIL
- Budgets:
  - monthly total <= 180.00m
  - Web Quality avg <= 3.00m
  - CodeQL avg <= 8.00m

- Pages fetched: 4
- API page size: 100
- Oldest fetched run updated_at: 2026-02-25T16:26:57Z
- Completed runs in window: 356
- Total estimated runtime: 618.87m
- Workflow breakdown:
  - .github/workflows/monthly-governance-audit.yml: runs=4, success=0, avg=0.00m, total=0.00m
  - CodeQL Setup: runs=1, success=1, avg=1.42m, total=1.42m
  - github_actions in /. - Update #1258453909: runs=1, success=1, avg=0.57m, total=0.57m
  - github_actions in /. - Update #1264473156: runs=1, success=1, avg=0.43m, total=0.43m
  - github_actions in /. - Update #1265083494: runs=1, success=1, avg=0.65m, total=0.65m
  - github_actions in /. - Update #1272485740: runs=1, success=1, avg=0.98m, total=0.98m
  - Interaction Flake Audit: runs=1, success=1, avg=3.53m, total=3.53m
  - Lighthouse Budget: runs=22, success=21, avg=14.64m, total=321.98m
  - Monthly Governance Audit: runs=5, success=3, avg=0.41m, total=2.05m
  - npm_and_yarn in /. - Update #1258453907: runs=1, success=1, avg=0.73m, total=0.73m
  - npm_and_yarn in /. - Update #1264459462: runs=1, success=1, avg=0.70m, total=0.70m
  - npm_and_yarn in /. - Update #1265083491: runs=1, success=1, avg=0.65m, total=0.65m
  - npm_and_yarn in /. - Update #1272474982: runs=1, success=1, avg=0.82m, total=0.82m
  - PR #1: runs=1, success=1, avg=1.47m, total=1.47m
  - PR #10: runs=1, success=1, avg=1.05m, total=1.05m
  - PR #11: runs=1, success=1, avg=1.05m, total=1.05m
  - PR #12: runs=2, success=2, avg=1.38m, total=2.75m
  - PR #13: runs=1, success=1, avg=1.20m, total=1.20m
  - PR #14: runs=1, success=1, avg=1.20m, total=1.20m
  - PR #15: runs=4, success=4, avg=1.07m, total=4.30m
  - PR #17: runs=2, success=2, avg=1.14m, total=2.28m
  - PR #18: runs=3, success=3, avg=1.06m, total=3.18m
  - PR #19: runs=1, success=1, avg=1.08m, total=1.08m
  - PR #20: runs=1, success=1, avg=1.15m, total=1.15m
  - PR #21: runs=1, success=1, avg=1.13m, total=1.13m
  - PR #22: runs=1, success=1, avg=1.10m, total=1.10m
  - PR #23: runs=4, success=4, avg=1.10m, total=4.38m
  - PR #24: runs=7, success=7, avg=1.18m, total=8.27m
  - PR #25: runs=3, success=3, avg=1.13m, total=3.40m
  - PR #26: runs=1, success=1, avg=1.13m, total=1.13m
  - PR #27: runs=1, success=1, avg=1.25m, total=1.25m
  - PR #28: runs=1, success=1, avg=1.10m, total=1.10m
  - PR #29: runs=4, success=4, avg=1.20m, total=4.82m
  - PR #3: runs=3, success=3, avg=1.17m, total=3.52m
  - PR #30: runs=6, success=6, avg=1.24m, total=7.47m
  - PR #31: runs=4, success=4, avg=1.27m, total=5.08m
  - PR #32: runs=2, success=2, avg=1.17m, total=2.33m
  - PR #33: runs=1, success=1, avg=1.08m, total=1.08m
  - PR #34: runs=2, success=2, avg=1.23m, total=2.47m
  - PR #35: runs=1, success=1, avg=1.20m, total=1.20m
  - PR #36: runs=3, success=3, avg=1.13m, total=3.40m
  - PR #37: runs=5, success=5, avg=1.23m, total=6.15m
  - PR #38: runs=1, success=1, avg=1.12m, total=1.12m
  - PR #39: runs=2, success=2, avg=1.18m, total=2.35m
  - PR #4: runs=2, success=2, avg=1.18m, total=2.37m
  - PR #40: runs=1, success=1, avg=1.27m, total=1.27m
  - PR #41: runs=1, success=1, avg=1.08m, total=1.08m
  - PR #42: runs=1, success=1, avg=1.22m, total=1.22m
  - PR #43: runs=2, success=2, avg=1.15m, total=2.30m
  - PR #5: runs=1, success=1, avg=1.25m, total=1.25m
  - PR #6: runs=1, success=1, avg=1.10m, total=1.10m
  - PR #7: runs=2, success=2, avg=1.30m, total=2.60m
  - PR #8: runs=2, success=2, avg=1.18m, total=2.35m
  - PR #9: runs=1, success=1, avg=1.13m, total=1.13m
  - Push on main: runs=40, success=40, avg=1.40m, total=55.85m
  - Release Automation: runs=24, success=22, avg=0.45m, total=10.77m
  - Scheduled: runs=2, success=2, avg=1.42m, total=2.85m
  - SEO Quality: runs=2, success=2, avg=0.23m, total=0.47m
  - Visual Flake Audit: runs=1, success=1, avg=1.13m, total=1.13m
  - Visual Regression: runs=47, success=34, avg=0.58m, total=27.25m
  - Web Quality: runs=114, success=103, avg=0.75m, total=85.90m

- PASS: Lookback window coverage (available results exhausted after 4 page(s); oldest fetched run updated_at 2026-02-25T16:26:57Z)
- FAIL: Monthly total runtime budget (618.87m <= 180.00m)
- PASS: Web Quality average runtime budget (0.75m <= 3.00m)
- PASS: CodeQL average runtime budget (1.42m <= 8.00m)
