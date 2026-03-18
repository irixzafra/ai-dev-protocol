# Code Review — 7-Point Deep Checklist

> Referenced by `SKILL.md` Phase 2b.
> Apply when the user explicitly requests a code review (engine, file, commit, PR).
> A superficial review is worse than none — read ALL the code before commenting.

## Checklist

### 1. Correctness

- Does the logic do what it says it does?
- Does it handle edge cases? (null, undefined, empty arrays)
- Are the types correct? (no unnecessary `any`)
- Are SQL queries correct? (JOINs, WHERE, ORDER)

### 2. Security (OWASP)

- Are inputs sanitized before queries?
- No direct string interpolation in SQL/PostgREST?
- RLS enabled on new tables?
- No secrets exposed in responses?
- No XSS in rendering of user content?

### 3. Types & Contracts

- Correct exports from barrels (index.ts)?
- Shared types in `packages/contracts/`?
- No `as any` or `@ts-ignore` without justification?
- Drizzle schemas aligned with SQL migrations?

### 4. Patterns & Consistency

- Follows structure of existing engines?
- Engine pattern: constructor(supabase) + methods with ctx?
- Result type: `{ success: boolean, data?, error? }`?
- Naming: camelCase TS, snake_case SQL?
- No business terms in `packages/core/`?

### 5. Performance

- Queries with indexes? (WHERE on indexed columns)
- No N+1 queries?
- Pagination on lists?
- No unnecessary fetches in server components?

### 6. Tests

- Tests for new functionality?
- Tests cover happy path + error path?
- No flaky tests?

### 7. Dead Code

- No orphaned imports left behind?
- No exports without consumers?
- No commented-out code without reason?

## Severity Definitions

| Severity | Meaning | Merge impact |
|---|---|---|
| **CRITICAL** | Security or data loss risk | Blocks merge. Must fix before any further review. |
| **HIGH** | Degraded UX, crashes, or significant maintenance burden | Should fix before merge. Exceptions require explicit user approval. |
| **MEDIUM** | Minor improvement, suboptimal pattern, loose types | Can merge with tracking. Create a follow-up task or comment. |
| **LOW** | Style, cleanup, naming nit | Note for future. No action required to merge. |

## Review Report Format

```
## Review: [commit/file/engine]

### Summary
[1-2 lines of what the code does]

### Verdict: cerrado / cerrado con riesgos / bloqueado

### Findings
| # | Severity | File:Line | Issue | Suggestion |
|---|---|---|---|---|
| 1 | CRITICAL | file.ts:42 | SQL injection via string concat | Use parameterized query |
| 2 | HIGH | file.ts:15 | Missing Zod schema on API input | Add z.object() validation |
| 3 | MEDIUM | file.ts:90 | any cast on response | Type the API response |
| 4 | LOW | file.ts:8 | Unused import | Remove |

### Severity summary
- CRITICAL: X
- HIGH: X
- MEDIUM: X
- LOW: X
```

### Verdict rules

- Any CRITICAL finding -> `bloqueado`
- 1+ HIGH without user-approved exception -> `bloqueado`
- Only MEDIUM/LOW findings -> `cerrado con riesgos` (list the risks)
- Zero findings -> `cerrado`
