# Autonomous Task Protocol

> Agents can work without direct instruction — but only within defined boundaries.
> This document defines those boundaries: what can be picked up autonomously,
> how to claim a task, and how to know when to stop and escalate.

---

## The core idea

Not every task needs a human to say "do this."
Some tasks are pre-approved by type, scope, and risk.

When a task is in the Autonomous Queue, any agent can:
1. Read the task
2. Claim it (atomically — prevents duplicate work)
3. Implement it
4. Verify it
5. Commit and push
6. Mark it done

No permission required. No context switching for the human.

---

## What qualifies for autonomous pickup

A task qualifies when ALL of these are true:

| Criterion | Required value |
|---|---|
| Commit type | `fix`, `chore`, `docs`, or `test` — never `feat` |
| File scope | ≤ 5 files affected |
| Risk | Rollback trivial via `git revert` |
| UI changes | None (or only in non-visible surfaces) |
| Shared primitives | Not touched |
| Required gates | None the agent cannot fulfill alone |

**Never autonomous:**
- `feat` or `refactor` commits — these require human approval
- Changes to authentication, authorization, or billing
- Changes to shared layout primitives
- Database migrations (schema changes in production)
- Any change that affects other tenants or users

---

## The WORKBOARD format

Autonomous tasks live in a dedicated section of `WORKBOARD.md`:

```markdown
## Autonomous Queue

| ID | Task | Type | Required Gates | Files | Status |
|---|---|---|---|---|---|
| AUTO.01 | Document SSH tunnel setup | `docs` | none | 1 | ⏳ free |
| AUTO.02 | Remove legacy `Operations` refs from docs | `docs` | none | ≤5 | ⏳ free |
| AUTO.03 | Lighthouse + bundle size baseline | `docs` | none | 1 | ⏳ free |
```

Status values: `⏳ free` → `🔒 claimed by [agent]` → `✅ done`

---

## The claim mechanism

**Why claims exist:** without a claim mechanism, two agents can start the same task simultaneously, produce different implementations, and create a merge conflict.

**How to claim:**

```bash
# 1. Pull latest (another agent may have just claimed this)
git pull origin master

# 2. Check if already claimed
ls .claude/claims/AUTO.01.lock 2>/dev/null && echo "CLAIMED" || echo "FREE"

# 3. If free: create the claim atomically
echo "agent: claude-code\nstarted: $(date -u +%Y-%m-%dT%H:%M:%SZ)" > .claude/claims/AUTO.01.lock
git add .claude/claims/AUTO.01.lock
git commit -m "chore(claims): claim AUTO.01"
git push origin master

# 4. If push succeeds: you own the task
# 5. If push fails (someone else pushed first): abort, pick a different task
```

**Rule:** The claim is atomic because git push is atomic. If two agents create the lock file at the same time, only one push succeeds.

---

## Autonomous execution loop

```
1. git pull origin master
2. Read WORKBOARD — find a free AUTO.* task
3. ls .claude/claims/[ID].lock → if exists, skip
4. Create and push claim
5. Read the full task description
6. Implement (within declared scope — no extras)
7. Run verification gates:
   - type-check passes
   - tests pass (no new failures)
   - no secrets in diff
8. If verification fails: self-correct, do not ask human
9. Update WORKBOARD: mark task done
10. Delete claim file
11. git add [specific files] && git commit && git push
12. Done
```

---

## Autonomous vs. supervised work

| | Autonomous | Supervised |
|---|---|---|
| Task type | `fix`, `chore`, `docs`, `test` | `feat`, `refactor` |
| Scope | Declared in WORKBOARD | Defined in alignment interview |
| Plan approval | Not needed (pre-approved) | Required |
| Files affected | ≤5, pre-declared | Declared in spec |
| Merge | Direct push | PR required |
| Gate | Agent self-verifies | Auditor agent + human |

---

## When to stop and escalate

An autonomous agent must stop and flag to the human when:

1. **Scope creep discovered** — the task requires touching more files than declared
2. **Complexity discovered** — the fix reveals a deeper architectural problem
3. **Conflicting claims** — another agent's uncommitted changes overlap with this task
4. **Gate fails after 2 attempts** — type-check or tests won't pass after 2 self-correction cycles
5. **Ambiguity in the task description** — the task can be interpreted in 2+ ways with meaningfully different outcomes

When stopping:
```markdown
<!-- Add to WORKBOARD next to the task -->
🚫 Blocked by [agent]: [reason in one sentence]. Needs human review.
```

Do not delete the claim until the human resolves the blocker.

---

## Hotspots — files that need coordination

Some files are modified frequently by multiple agents. Edits to these without coordination create merge conflicts.

Common hotspots:
- `planning/WORKBOARD.md`
- `planning/MEMORY.md`
- `planning/LESSONS.md`
- Shared layout/shell components
- Package barrel files (`src/index.ts`)
- Pre-commit hooks

**Rule:** Before editing a hotspot, check git log for recent changes:
```bash
git log --oneline -5 -- planning/WORKBOARD.md
```
If another agent touched it in the last 2 commits, pull first.

---

## Autonomous task lifecycle example

```
[08:00] Agent A: git pull → sees AUTO.03 free
[08:00] Agent A: creates .claude/claims/AUTO.03.lock → push succeeds → claimed
[08:01] Agent B: git pull → sees AUTO.03 claimed → picks AUTO.01 instead
[08:15] Agent A: runs Lighthouse, documents baseline → writes docs/PERFORMANCE_BASELINE.md
[08:16] Agent A: tsc ✅, tests ✅
[08:16] Agent A: marks AUTO.03 done in WORKBOARD
[08:16] Agent A: deletes .claude/claims/AUTO.03.lock
[08:16] Agent A: git add planning/WORKBOARD.md docs/PERFORMANCE_BASELINE.md
[08:16] Agent A: git commit -m "docs(perf): add Lighthouse + bundle size baseline"
[08:16] Agent A: git push origin master
[08:17] Agent B: finishes AUTO.01, git pull first (gets Agent A's commit), then pushes
```

No collisions. No human intervention required.

---

## Expanding the Autonomous Queue

Any team member (human or agent) can add tasks to the queue when:
1. The task is clearly `fix/chore/docs/test`
2. Scope is ≤5 files and can be declared upfront
3. The task description is unambiguous (no alignment interview needed)
4. Risk is pre-assessed as LOW

When in doubt: make it supervised. The autonomous queue is for tasks where the path is clear.
