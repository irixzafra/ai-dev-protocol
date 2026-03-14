# Development Protocol

> SSOT for all agents working on this repository.
> Read by: Claude Code, Codex, Gemini, Qwen, or any AI agent.
> **Owner:** [Your name] — final authority on specs and merges

This document defines the only valid way to ship code to this repository.
Any agent that bypasses these gates creates work for the human that the human should not have to do.

---

## Session Start

Before touching any code or docs:

1. `git pull origin master` — sync (other agents push concurrently)
2. Read `planning/WORKBOARD.md` — current tasks
3. Read `planning/MEMORY.md` — active decisions
4. Check `git status --short` — look for other agents' uncommitted work
5. Check `planning/LESSONS.md` for unresolved lessons:
   ```bash
   grep '\[pending\]$' planning/LESSONS.md
   ```
   Only bare `[pending]` (no `→`) requires action. Assign a graduation target before starting new work.

---

## Session Close

Before ending any session where the human gave feedback or made corrections:

1. **If the human corrected something** → capture AND graduate:
   - Add entry to `planning/LESSONS.md` with graduation target
   - Apply the lesson immediately to where it belongs (protocol, skill, hook, runbook)
   - Mark the lesson `[graduated → location]`

2. **If architectural decisions were made** → update `planning/MEMORY.md`

3. **If work is in progress** → update status in `planning/WORKBOARD.md`

4. Commit — **stage the graduation destination alongside the planning docs**

---

## Mid-Session Correction Rule

If the human corrects anything during a session:

1. STOP current work immediately
2. Capture the lesson in `planning/LESSONS.md` (brief, <3 lines)
3. Graduate it now — do not defer to session close
4. Resume the corrected approach

Zero-latency capture prevents lessons from evaporating before session end.

→ Full details in [`SELF_IMPROVEMENT.md`](SELF_IMPROVEMENT.md)

---

## Roles

| Who | Role |
|---|---|
| **Human** | Approves the plan (Phase 1) and the merge (Gate 2). Does not review intermediate work. |
| **Orchestrator agent** | Runs intake, writes the plan, coordinates builder and auditor. |
| **Builder agent** | Implements code in an isolated worktree. Self-verifies before handing off. |
| **Auditor agent** | Reads plan + diff. Tries to break the work. Clears or rejects. |

The human touches the process **twice**: approves the plan, approves the merge. Everything in between is autonomous.

---

## The Flow — Plan → Execute → Verify → Reflect

### Phase 1 — Alignment (required for any non-AUTO task)

The agent enters Plan Mode **proactively** — the human does not need to ask.

1. **Explore**: read the codebase, understand existing patterns, identify what exists
2. **Interview**: ask only questions that require human judgment (max 4-5 questions)
3. **Write the plan** and save to `specs/active/[task-id].md`:
   - What will be built
   - What will NOT be built (explicit scope boundary)
   - Files likely affected
   - Acceptance criteria — verifiable, not vague
   - Risk: LOW / MEDIUM / HIGH
4. **Iterate** until no ambiguity remains
5. **Human approves → work starts. No approval → no code.**

→ Full details in [`ALIGNMENT.md`](ALIGNMENT.md)

---

### Phase 2 — Execute (autonomous — human does not intervene)

**Step 1 — Isolation**
- Create a git worktree from `master`
- All work happens in that worktree. `master` is not touched directly.

**Step 2 — Builder (1-shot)**
- Read the plan. Implement only what the plan says.
- Execute the plan completely without interrupting the human.
- If Phase 3 — Verify fails: self-correct. Do not ask the human.
- If the plan itself is wrong (not the implementation): stop, return to Phase 1.

**Step 3 — Auditor**
- Receives: plan + diff + build summary
- Actively tries to find problems:
  - Does the implementation match the plan?
  - TypeScript errors or type unsafety?
  - Security problems (SQL injection, exposed secrets, broken auth)?
  - Unhandled edge cases?
  - UX friction introduced?
  - Files changed outside the declared scope?
- If problems found: feedback → builder corrects → back to Step 2. No human.
- If clean: writes audit sign-off.

---

### Phase 3 — Verify (automatic — no human intervention)

| Check | Command | Gate |
|---|---|---|
| TypeScript | type-check exits 0 | Required |
| Build | build exits 0 | Required |
| Tests | No regressions vs baseline | Required |
| Secrets | No API keys, passwords, tokens | Pre-commit hook (blocks) |

If any gate fails: back to Phase 2. Phase 3 does not negotiate.

---

### Phase 4 — Reflect

After Phase 3 passes, before requesting merge:

1. What failed during execution? → add to `planning/LESSONS.md`
2. Graduate each lesson to where it lives
3. Architectural decisions? → update `planning/MEMORY.md`

One reflection per task. The system gets smarter with every cycle.

---

## Autonomous Task Pickup

Agents can start work without direct instruction when the task is in the **Autonomous Queue** in WORKBOARD.

Conditions:
- Task ID starts with `AUTO.` — no additional label needed
- No active claim exists
- Task type is `fix`, `chore`, `docs`, or `test` — **never `feat` without human approval**

→ Full details in [`AUTONOMOUS.md`](AUTONOMOUS.md)

---

## Scope Discipline

Agents build what the spec says. Nothing more.

- Do not add features not in the spec
- Do not refactor code you weren't asked to touch
- Do not "improve" things adjacent to your task
- Do not add comments or error handling to code you didn't change

If you notice something that should be fixed but is outside your scope: write it to `planning/WORKBOARD.md` as a new task. Do not fix it now.

---

## Git Rules (non-negotiable)

```
Commit format: type(scope): description in english, imperative, lowercase, ≤72 chars
Types: feat, fix, refactor, chore, docs, test, perf
```

| Rule | Reason |
|---|---|
| Full-track (feat/refactor): no direct push to `master` | Use a feature branch + PR |
| Fast-track (fix/chore/docs/test/perf): direct push allowed | Run Gate 1 locally first |
| No `git add .` or `git add -A` | Prevents accidental secret commits |
| No `git push --force` | Destroys others' work |
| Always `git pull` before starting | Multiple agents push concurrently |
| Builders work in worktrees | Isolation prevents collision |
| Atomic commits: 1 task = 1 commit | Clean audit trail |

---

## Spec File Format

```markdown
# [task-id] — [short title]

**Status:** draft | approved | in-progress | done
**Date:** YYYY-MM-DD

## Intent
[1-3 sentences from the human]

## Scope — what will be built
- [item]

## Scope — what will NOT be built
- [item]

## Files likely affected
- [path]

## Acceptance criteria
- [ ] [verifiable criterion]

## Risk
LOW / MEDIUM / HIGH — [reason]
```
