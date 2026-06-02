# Prosepal Web Backlog (TODO Only)

This backlog contains open, active repo work only.
Every row must define a clear, testable Definition of Done.
Execution order is top-to-bottom.

External account-management tasks, blocked proof-sourcing ideas, and completed process cleanups stay out of this list until we are ready to execute them.

## Backlog Intake Standard

A row is Ready only when:

1. The problem, audience, or operational risk is explicit enough that a reviewer can tell why the work matters.
2. The target outcome is narrow enough to fit in one reviewable slice of work, not an open-ended initiative.
3. The likely surfaces involved are known up front (for example `public/`, `scripts/`, CI/workflows, docs, or external evidence).
4. The verification path is named up front, including the key command, evidence source, or production signal needed to close the item.
5. External blockers, approvals, and dependencies are resolved or called out clearly enough that the item can be worked without hidden setup.

A row is Done only when:

1. Its row-specific Definition of Done is fully met.
2. The repo-wide Definition of Done in `AGENTS.md` is also satisfied.

| ID | Priority | TODO | Definition Of Done |
| --- | --- | --- | --- |
| `WEB-P1-17` | P1 | Raise production real-experience score above the warning band | The highest-impact above-the-fold performance bottlenecks on the homepage are reduced enough that production Speed Insights no longer shows a warning-state real experience score for the primary audience window; changes are tied to specific metrics (at minimum LCP/FCP or their current replacement in Vercel reporting), documented with before/after evidence, and `bun run check` passes without regressing analytics, accessibility, or interaction behavior. |
