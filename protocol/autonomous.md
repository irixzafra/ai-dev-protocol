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

## Autonomy levels

Every task has an autonomy level, defined by the owner at sprint planning time (not by the agent at execution time). This is the single most important decision in sprint planning: **what can agents do alone, and where must they stop?**

### The 3 levels

| Level | Tag | Agent does | Agent stops at | Merge |
|-------|:---:|-----------|----------------|-------|
| **Full auto** | `🤖` | Pick → Build → Verify → Post-mortem → Pick next | Only BLOCKER (3 failures) | Direct push |
| **Review gate** | `👁️` | Pick → Build → Verify → Post-mortem → PR | After Phase 3 — waits for human review | PR required |
| **Human first** | `🔒` | Read task → Write plan → Stop | Before Phase 2 — waits for plan approval | PR required |

### How to assign levels

The owner tags each task in WORKBOARD.md:

```markdown
## Sprint backlog

| ID | Task | Type | Autonomy | Gates | Files |
|---|---|---|:---:|---|---|
| T.01 | Fix broken link in docs | docs | 🤖 | G3 | 1 |
| T.02 | Add password reset flow | feat | 🔒 | G1-G5 | ~10 |
| T.03 | Migrate 5 components to new API | refactor | 👁️ | G1 G5 | 8 |
```

### Default autonomy by task type

If the owner doesn't tag a task, these defaults apply:

| Task type | Default autonomy | Rationale |
|-----------|:----------------:|-----------|
| `fix`, `chore`, `docs`, `test`, `perf` | 🤖 Full auto | Low risk, reversible |
| `refactor` | 👁️ Review gate | Structural change, needs diff review |
| `feat` | 🔒 Human first | New functionality, needs requirements |

The owner can always override: a trivial `feat` can be tagged `👁️`, a risky `fix` can be tagged `🔒`.

### How agents respect autonomy levels

**🤖 Full auto:**
```
1. Claim task → Build → Verify → Post-mortem → Deliver
2. If all gates pass: push directly to master
3. Pick next task from queue
4. Repeat until queue is empty or session ends
```
The agent runs continuously. No human in the loop unless BLOCKER.

**👁️ Review gate:**
```
1. Claim task → Build → Verify → Post-mortem
2. Create branch: agent/{agentId}/{task-id}
3. Push branch, open PR with delivery format
4. STOP — wait for human review
5. If approved: merge. If changes requested: fix and re-push.
6. Only then: pick next task
```
The agent does all the work but doesn't merge. The human reviews the diff.

**🔒 Human first:**
```
1. Claim task → Read context → Write plan (Phase 1 full)
2. Present plan with AWAITING APPROVAL
3. STOP — wait for human approval
4. Once approved: Build → Verify → Post-mortem → PR
5. Wait for merge approval
```
Two human checkpoints: plan approval + merge approval.

### The continuous development loop

When multiple agents work with a full WORKBOARD, the loop looks like this:

```
Owner defines sprint
    ↓ tags each task with 🤖 / 👁️ / 🔒
    ↓
Agents pick up 🤖 tasks first (no waiting)
    ↓ build → verify → post-mortem → push → next
    ↓
When 🤖 queue is empty, agents pick 👁️ tasks
    ↓ build → verify → post-mortem → PR → wait
    ↓
Owner reviews PRs in batch
    ↓ approve / request changes
    ↓
🔒 tasks wait for owner session
    ↓ owner + agent do Phase 1 together → approve plan
    ↓ agent builds autonomously → PR → review
    ↓
Sprint complete → Curation review (audit-log analysis)
    ↓
Patterns graduated → Protocol updated
    ↓
Next sprint: agents are better
```

### Sprint planning checklist (for the owner)

Before starting a sprint:

1. **Define tasks** in WORKBOARD.md with clear descriptions
2. **Tag autonomy** — 🤖 / 👁️ / 🔒 for each task
3. **Declare gates** — which G1-G5 apply per task
4. **Declare scope** — expected files and what NOT to touch
5. **Set review cadence** — "I'll review PRs at 10am and 6pm" (so 👁️ agents know when to expect feedback)

This is where the human control lives. Not in watching agents work, but in defining the boundaries before they start.

---

### Legacy comparison

| | Previous: Autonomous | Previous: Supervised | New: 🤖 | New: 👁️ | New: 🔒 |
|---|---|---|---|---|---|
| Task type | fix/chore/docs/test | feat/refactor | Any (owner decides) | Any | Any |
| Plan approval | No | Yes | No | No | **Yes** |
| Merge approval | No | Yes | No | **Yes** | **Yes** |
| Human touchpoints | 0 | 2 | 0 | 1 | 2 |

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

---

## Integration with multi-agent systems

### BRIEFINGS system

When multiple agents work in parallel, autonomous tasks are discovered through the BRIEFINGS system. An agent that opens a session and finds no assigned briefing should look at the Autonomous Queue in WORKBOARD.md.

See: `protocol/briefings.md` for the full multi-agent orchestration protocol, including:
- Session start protocol (register, find work, execute, report)
- Agent registration format
- Anti-collision protocol
- Delivery format

### Claims mechanism

The claim mechanism described above is documented in detail as a standalone protocol. For the full specification including lock file format, TTL (4 hours), expiry checks, and reclaiming expired locks, see: `protocol/claims.md`
