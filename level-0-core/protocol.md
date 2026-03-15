# Development Protocol

> SSOT for any AI agent working on this repository.
> **Owner:** [Your name] — final authority on specs and merges

This document defines the only valid way to ship code to this repository.
Any agent that bypasses these gates creates work for the human.

---

## Session Start

Before touching any code or docs:

1. `git pull` — sync with remote
2. Read the last 3 entries in `planning/dev-log.md` — understand current state before reading any code
3. Read `planning/LESSONS.md` for unresolved lessons:
   ```bash
   grep '\[pending\]$' planning/LESSONS.md
   ```
   Assign a graduation target before starting new work.
4. Check `planning/MEMORY.md` — active decisions

---

## Session Close

Before ending any session where the human gave feedback:

1. **Write a dev-log entry** → append to `planning/dev-log.md` (max 4 bullets: completed, temp decisions, oddities, next step)
2. **If the human corrected something** → capture AND graduate:
   - Add entry to `planning/LESSONS.md` with graduation target
   - Apply the lesson immediately to where it belongs (protocol, hook, runbook)
   - Mark the lesson `[graduated → location]`
3. **If architectural decisions were made** → update `planning/MEMORY.md`
4. Commit — **stage the graduation destination alongside LESSONS.md**

---

## Mid-Session Correction Rule

If the human corrects anything during a session:

1. STOP current work immediately
2. Capture the lesson in `planning/LESSONS.md` (brief, <3 lines)
3. Graduate it now — do not defer to session close
4. Resume the corrected approach

Zero-latency capture prevents lessons from evaporating before session end.

---

## The Flow — Align → Execute → Verify → Reflect

### Phase 1 — Alignment (required for any non-trivial task)

The agent enters Plan Mode **proactively** — the human does not need to ask.

#### Phase 1-α. Secrets sanity check (runs before anything else)

Before exploring or classifying, scan the task description for:
- API keys (`sk_*`, `pk_*`, `*_secret`, bearer tokens)
- Passwords or credentials
- Private encryption keys or certificates
- OAuth tokens or refresh tokens
- Database passwords

**If any secret is found in the task description, STOP immediately:**

```
⚠️ BLOCKED — SECRET IN PROMPT

The task description contains what appears to be a live secret.
I will not repeat, use, or reference this value anywhere.

What you must do:
1. Revoke this secret immediately if it's live
2. Re-submit the task WITHOUT the secret value
3. The secret should live in your .env or vault — never in a chat message

I'm ready when you resubmit without the secret.
```

Do not continue to Phase 1a until the task is resubmitted without secrets.

**If no secrets found:** proceed to 1a.

---

#### 1a. Classify the category

Before reading any code, classify the task into one primary category:

| Category | Trigger signals | Context to load before interviewing |
|---|---|---|
| **UI/Design** | button, card, layout, style, color, theme, visual component, spacing, responsive | Target component code · design tokens · existing shared components |
| **Architecture** | refactor, structure, pattern, new page, api route, new abstraction, reorganize | `planning/MEMORY.md` · files affected · blast radius (what imports this?) |
| **Backend/DB** | table, column, schema, RLS, query, migration, index, edge function, API endpoint | Current schema · RLS policies · queries touching this resource |
| **Infra/Ops** | docker, deploy, container, server, env, port, nginx, SSL, cron | Server docs · docker-compose · active containers · rollback plan |
| **Feature/Product** | new functionality, user story, user flow, full screen, external integration | Scope docs · WORKBOARD (collision check) · MEMORY.md |

If the task spans multiple categories, pick the dominant one. If unclear, ask — one question.

#### 1b. Classify the change scope

| Class | Definition | Implication |
|---|---|---|
| **Isolated** | One file, no shared impact | Direct push after verify |
| **Surface** | Multiple files, one product area | Branch + PR |
| **Systemic** | Shared primitive, token, schema, or protocol | Branch + PR + all surfaces verified |
| **Breaking** | Changes external contract (API, schema, auth) | Branch + PR + migration plan + human sign-off |

If exploration reveals the task is a higher scope class than it appeared, say so before writing the plan.

#### 1c. Explore and interview

1. **Explore**: read the category-relevant context (see 1a), then read the code
2. **Interview**: ask only questions that require human judgment (max 4-5, category-appropriate)
3. **STOP HERE** — wait for the human to answer before writing anything else

Silence after the interview = the agent is blocked. Do not proceed to 1d without answers.

#### 1d. Breaking change gate

If scope (1b) is **Breaking**, evaluate before writing the plan:

**Escalate immediately (do NOT write a plan yet) if the task has ANY of:**
- Infrastructure decision not yet made (new DB engine, new auth provider, etc.)
- Irreversible data transformation without migration strategy
- External contract change with no rollout plan
- Deadline <1 week for a systemic change
- Removes or replaces a major service (Supabase, Auth0, etc.)

**If escalation is required:**

```markdown
# BLOCKER — [task-id]

**Task:** [description]
**Why I cannot proceed:** [e.g., "MySQL migration requires architectural re-decision — Supabase RLS has no direct equivalent"]

**What I discovered:**
- [finding 1]
- [finding 2]

**Decisions required before I write a plan:**
1. [Decision — context why it's blocking]
2. [Decision — context why it's blocking]

Once you decide, I'll write the plan. Until then: blocked.
```

Push branch `ai-blocked/[task-id]` with BLOCKER.md committed. Stop.

**If no escalation criteria apply:** write the plan normally.

#### 1e. Write and present the plan

After the interview is answered (and breaking gate passed), write the plan using the Spec Format below.

Present it explicitly:

```
# PLAN — [task-id]

[full plan content]

---
**AWAITING APPROVAL** — I will not write any code until you approve this plan.
Reply with "approved" or request changes.
```

**Rule:** Silence after the plan = the agent is blocked. No approval = no code.

---

### Phase 2 — Execute (autonomous — human does not intervene)

- Read the plan. Implement only what the plan says.
- Execute completely without interrupting the human.
- Use `planning/scratchpad.md` (gitignored) to track in-progress state: files touched, steps done, current blocker. If the session is interrupted or the model changes, the next agent reads the scratchpad and picks up from there.
- If Phase 3 — Verify fails: self-correct. Do not ask the human.
- If the plan itself is wrong (not the implementation): stop, return to Phase 1.

**Micro-iteration rule:** Do not write more than 50-100 lines without running the type-checker or linter (`tsc --noEmit`, `eslint`, or equivalent). Use compiler feedback step-by-step to correct types and broken references *as you go* — before considering a function complete and moving to the next file. Catching errors early is cheaper than unwinding 300 lines of cascading mistakes.

**Shadow branching — for persistent architectural uncertainty:**
If Phase 1 leaves a genuine uncertainty between two approaches that cannot be resolved without implementation:
1. Create `shadow/[task-id]-a` and `shadow/[task-id]-b` branches
2. Implement each approach in its branch
3. Run full verification on both
4. Compare outcomes (type errors, test failures, code size, clarity)
5. Delete the losing branch. PR the winner with a one-line rationale: "Chose A over B because [concrete reason]."

Use shadow branches only when the approaches are functionally different. Never for style preferences.

---

### Phase 3 — Verify (automatic — no human intervention)

| Check | Command | Gate |
|---|---|---|
| TypeScript | type-check exits 0 | Required |
| Build | build exits 0 | Required |
| Tests | No regressions vs baseline | Required |
| Secrets | No API keys, passwords, tokens | Pre-commit hook (blocks) |

If any gate fails: back to Phase 2. Phase 3 does not negotiate.

**Rollback rule:** If verification fails 3 times in a row on the same issue, stop self-correcting. Do `git stash` or reset to the last clean commit, then return to Phase 1 with the new information. Agents that keep patching a broken approach usually make it worse.

**Escalation rule:** If the rollback leads to a second round of Phase 1 and you still cannot make progress, escalate to the human:
1. Create branch `ai-blocked/[task-id]`
2. Commit partial work: `git commit -m "wip: blocked on [task-id] — see BLOCKER.md"`
3. Write `BLOCKER.md` in the repo root:
   - What was attempted (exact approach)
   - What failed (exact error or behavior)
   - What was ruled out (approaches that don't work and why)
   - What the human needs to decide or provide
4. Open a GitHub issue referencing the branch and BLOCKER.md
5. Stop. Do not attempt the task again until the human responds.

---

### Phase 4 — Reflect

After Phase 3 passes, before requesting merge:

1. What failed during execution? → add to `planning/LESSONS.md`
2. Graduate each lesson to where it lives
3. Architectural decisions? → update `planning/MEMORY.md`
4. Write a dev-log entry → append to `planning/dev-log.md`

One reflection per task. The system gets smarter with every cycle.

---

## Scope Discipline

Agents build what the spec says. Nothing more.

- Do not add features not in the spec
- Do not refactor code you weren't asked to touch
- Do not add comments or error handling to code you didn't change

If you notice something outside your scope: write it to WORKBOARD or a TODO. Do not fix it now.

---

## Git Rules

```
Commit format: type(scope): description — imperative, lowercase, ≤72 chars
Types: feat, fix, refactor, chore, docs, test, perf
```

| Rule | Reason |
|---|---|
| feat/refactor: branch + PR | Protect main from partial work |
| fix/chore/docs/test/perf: direct push allowed | Run verify locally first |
| No `git add .` or `git add -A` | Prevents accidental secret commits |
| No `git push --force` | Irreversible |

---

## Spec Format

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
