---
name: dev-debug
description: "Systematically diagnoses and resolves bugs in the active project using a structured workflow: reproduce, locate, diagnose, fix, verify. Covers TypeScript errors, runtime failures, API issues, test failures, RLS denials, import problems, honest backend degradation, and external dependency blockers. Use when something is broken, crashing, failing, not loading, returning errors, or behaving unexpectedly. NOT for building new features (use dev-builder), NOT for QA/code review (use dev-qa), NOT for UX problems (use dev-ux)."
user-invocable: true
argument-hint: "[error description or file path]"
examples:
  - "/dev-debug TypeError in knowledge page"
  - "/dev-debug API returns 500"
  - "no funciona el login"
  - "falla al guardar"
  - "error en la consola"
  - "no carga la pagina"
  - "se rompe al hacer click"
---

# Debug — Structured Diagnosis

Systematic workflow for diagnosing and resolving bugs in the active project.
Principle: **read before touching, minimum necessary change.**

## Context Loading

**First action in every session:** load the active project's `dev.playbook.md`.

| Playbook section | What this skill needs |
|---|---|
| Key paths | Monorepo structure — where files live |
| Development commands | Type-check and test commands |
| Quality Contract | Phase 3 checklist (tsc, tests) |
| Infrastructure | Server access, container names, log commands |

If `dev.playbook.md` doesn't exist in the project: stop and ask before proceeding.

> **Infrastructure quick-reference (from playbook):** Use `[see playbook > Infrastructure]` for server SSH commands, container names, and DB access patterns for the active project.

## Mindset

Factory floor: a bug in production is an emergency. Real urgency, not haste.

- **Minimum fix possible** — do not refactor during a fix. A fix is a fix, not an opportunity for improvement. This rule applies everywhere: Phase 4, commit scope, PR review. ONE location for this principle.
- **Zero tolerance:** the fix must be correct, not "works for now". If the fix needs a patch, the solution is wrong.
- **Every fix leaves the codebase more robust** — type-check green, tests green, and the bug cannot come back.

## Honest Degradation Mode

Not every failure is a product bug. In the active project, some incidents are really:

- backend-not-ready
- missing dataset
- missing provider/integration
- external dependency down
- local-only environment issue

The job is to classify them correctly.

- **Do not leak raw infrastructure** to users if the expected state is "not ready yet"
- **Do not spam logs** for expected degraded paths
- **Do keep unexpected failures loud** in logs and tests
- **Do not fake readiness** with demo data just to make the UI look healthy
- **Do distinguish code blocker vs external blocker** before fixing anything

See `${CLAUDE_SKILL_DIR}/references/patterns.md` for concrete code patterns (domain errors, degradation UI, logging).

## Protocol

### Phase 1: Reproduce and understand

Without reproduction there is no reliable diagnosis — guessing causes regressions.

1. **What is failing?** — Exact symptom (error message, unexpected behavior)
2. **Where is it failing?** — Frontend, API, DB, server
3. **Since when?** — `git log --oneline -20` to see recent changes
4. **Who touched it?** — `git log --oneline --all -- [file]`
5. **What kind of failure is it?** — classify using the decision tree in Phase 3

### Phase 2: Locate

#### If it is a TypeScript error
```bash
pnpm tsc --noEmit 2>&1 | head -50
```
- Read the file(s) mentioned in the error
- Find the missing type/import

#### If it is a runtime error (browser)
1. Identify the route: `apps/platform/app/[route]/page.tsx`
2. Review server components vs client components (`"use client"`)
3. Verify package imports
4. Find the error in Next.js logs

#### If it is an API error
1. Identify route handler: `apps/platform/app/api/[route]/route.ts`
2. Review Supabase queries
3. Verify RLS policies — cause #1 of silent "data not found"
4. Search in server logs:
```bash
ssh your-server 'docker logs your-platform --tail 50 2>&1 | grep -iE "error|warn"'
```

#### If it is a test error
```bash
pnpm test -- [test-name]
pnpm test -- [test-name] --reporter=verbose
```

### Phase 3: Diagnosis — Decision Tree

Read the code involved. Trace the flow: input -> processing -> output. Then classify:

```
Is the failing service under our control?
  YES -> Is the code wrong?
    YES -> product bug -> fix in code + regression test
    NO  -> Is the data wrong/missing?
      YES -> dataset absence -> honest degradation UI
      NO  -> environment issue -> document + skip
  NO -> external dependency -> document blocker, return domain error, do not write a code fix
```

After classification:
- Search for similar patterns that work: `grep -r "pattern" apps/platform/ packages/`
- Verify dependencies: did something change upstream?
- Determine end-state: fix in code, honest degradation, documented blocker, or external handoff

### Phase 4: Fix

1. **One concern per fix** — no refactoring, no "while I'm here" changes
2. **Prefer domain errors over raw infra errors** when the expected state is "backend not ready" (see `${CLAUDE_SKILL_DIR}/references/patterns.md`)
3. **Silence expected noise, keep unexpected noise visible** (see logging patterns in references)
4. **Type-check:** `pnpm tsc --noEmit`
5. **Tests:** `pnpm test`

### Phase 4.5: Regression Test (MANDATORY)

Every fix requires a test that fails without the fix and passes with it.

1. Find or create the test file: `__tests__/[feature]-regression.test.ts` or append to the existing test file for the module
2. Write a test that reproduces the exact conditions of the bug
3. Confirm the test FAILS when you revert your fix (or reason about it if revert is impractical)
4. Confirm the test PASSES with your fix applied
5. If the bug is in UI rendering, a unit test on the logic is acceptable; Playwright E2E is bonus

See `${CLAUDE_SKILL_DIR}/references/patterns.md` for the regression test template.

Skip this phase ONLY if:
- The fix is purely config/env (no testable code path)
- The fix is a typo in a string literal with no logic dependency

### Phase 5: Commit and Verify

1. Atomic commit:
```bash
git add [files]
git commit -m "fix([scope]): [description]"
git push origin master
```
2. Confirm the fix resolves the original symptom
3. Confirm it did not introduce regressions (type-check + tests)
4. Update `.claude/COORDINATION.md` if other agents are affected
5. Classify the outcome:
   - fixed
   - degraded honestly
   - blocked by external dependency

## Diagnostic Tools

| Tool | Command | When |
|---|---|---|
| Type errors | `pnpm tsc --noEmit` | Always first |
| Test failures | `pnpm test` | After type-check |
| Specific test | `pnpm test -- [pattern]` | To isolate |
| Git blame | `git log --oneline -- [file]` | Who/when changed |
| Broken imports | `grep -r "from.*[module]" apps/ packages/` | Orphaned import |
| Server logs | `ssh your-server 'docker logs your-platform --tail 50'` | Prod errors |
| DB state | `ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "..."'` | Queries/schema |

## Common Errors

See `${CLAUDE_SKILL_DIR}/references/common-errors.md` for the full error table (~20 entries).

Quick reference for the most frequent:

| Error | Likely cause |
|---|---|
| `TS2307: Cannot find module` | Import from deleted/moved file |
| Supabase RLS denied | Missing or misconfigured policy |
| Hydration mismatch | Server/client render difference |
| `NEXT_NOT_FOUND` | Route does not exist |
| `PGRST301` | RLS policy blocking PostgREST |

## Rules

- **Read before touching, not after** — diagnose first, touch second
- **Type-check + tests before commit** — always
- **Regression test for every fix** — Phase 4.5 is not optional
- **Do not ignore warnings** — they may be the clue
- **Expected degradation is not a crash** — map it to a domain state
- **External blockers must be explicit** — no fake code fix for a provisioning problem
- **Coordinate:** update `.claude/COORDINATION.md` when the fix affects shared surfaces
