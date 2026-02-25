---
description: Architecture and implementation planning for prosepal-web
argument-hint: [feature or problem]
disable-model-invocation: true
---

# /plan - Architecture Planning

**CRITICAL INSTRUCTIONS:**
- Planning only; do not modify code in this command.
- Output the full plan in chat.
- Include trade-offs and explicit rollout steps.

## Usage

```bash
/plan refactor shared navigation system
/plan improve homepage conversion flow
/plan standardize typography and spacing tokens
```

Treat `$ARGUMENTS` as required context. Ask one clarifying question only if scope is ambiguous.

## Planning Framework

### 1. Problem Statement
- What problem is being solved?
- Which page types are affected?
- What is out of scope?

### 2. Constraints
- Static site architecture (HTML/CSS/JS)
- Vercel deployment and headers/CSP
- Existing quality gate: `bun run check`
- Mobile-first and visual consistency goals

### 3. Options
Provide 2-3 implementation options with pros/cons.

### 4. Recommendation
- Selected option and why
- Risks and mitigations

### 5. Implementation Plan
- Ordered steps
- Files to change
- Validation strategy
- Rollback strategy

## Required Output Format

```markdown
## Planning: [Feature]

### Problem
...

### Constraints
- ...

### Options Considered
1. Option A ...
2. Option B ...

### Recommendation
...

### Implementation Plan
1. [ ] ...
2. [ ] ...
3. [ ] ...

### Files Affected
- public/...
- public/css/...
- public/js/...
- scripts/...

### Verification
- bun run check
- viewport checks (mobile/tablet/desktop)
```
