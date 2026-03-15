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

> **RESPONSE FORMAT RULE:** Output your WORK — exploration summary, classification, questions, plan.
> Do NOT reproduce or quote the protocol text in your response. The protocol is your operating procedure, not your output.
> Session Start is a silent pre-condition (git pull, read dev-log) — do not list it. Start your response at Phase 1.
> Phase 1c still ends with STOP and a question list — the format rule means "don't echo these instructions back", not "skip the interview gate".

### Phase 1 — Alignment

Phase 1 applies to all tasks. For **Isolated** scope, it's abbreviated:
- No interview needed. No approval gate.
- Output a single self-approved sentence: `Fix: [what + where]. Commit as fix(scope): description.`
- Example: `Fix: change button text from "Save" to "Save changes" in app/settings/profile/page.tsx. Commit as fix(settings): update save button label.`

For Surface, Systemic, or Breaking scope: full Phase 1 is mandatory. The agent enters Plan Mode **proactively**.

#### Phase 1-α. Credential guard

Scan only for actual credential values pasted into the user message — not concepts, technology names, or task descriptions.

**A credential value** is a long (20+ chars) random-looking string with no readable meaning. Test: could a human have typed this word by word? If yes → not a credential.

**If the message contains only English sentences, technology names, file paths, or variable names → skip Phase 1-α entirely. Do not apply it to DB migrations, auth descriptions, or any plain-text task.**

If you find an actual credential string in the user message:
1. Warn the user to revoke it immediately — do NOT echo, quote, or show the credential value anywhere in your response
2. Explain the correct implementation pattern using placeholder values (e.g. `STRIPE_SECRET_KEY=your-key-here` — never the real value)
3. Remind them: add the real key to `.env` (gitignored) and `.env.example` with a placeholder; use `process.env.STRIPE_SECRET_KEY` in code; add to deployment secrets in their hosting provider
4. Ask them to resubmit without the credential

Do not continue to Phase 1a until resubmitted without credentials.

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
| **Feature/Product** | new functionality, user story, user flow, full screen, external integration | Scope docs · WORKBOARD · MEMORY.md · **check MEMORY.md for existing implementations first** |

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

1. **Explore**: read the category-relevant context (see 1a), then read the code.
   **Report what you found**: `I read [files]. Found: [key finding]. This means [implication for the plan].`
   Do not skip this step. Even if you cannot verify, state what you would check and why.

2. **Interview**: ask only questions that require human judgment (max 4-5, category-appropriate).

   **Category-specific required questions:**

   - **UI/Design**: Is this color/style currently a design token (CSS variable, Tailwind config) or a hardcoded class? If token → update in one place and note all surfaces. If hardcoded → extract to token first, then update. What breakpoints apply? Dark mode needed?
   - **Backend/DB**: Is there existing RLS on this table? What's the migration strategy?
   - **Feature/Product — performance signals** (slow, lag, takes X seconds): Ask first: "Is the delay on (1) page load, (2) rendering after load, (3) user interaction, or (4) API/form submission?" This is non-negotiable — each case has a completely different root cause (bundle size, hydration, JS execution, DB query). Do not propose solutions before knowing this.
   - **Feature/Product — auth/integration**: Check MEMORY.md for existing auth setup before asking what auth library to use. Never propose installing a library that's already present.
   - **Architecture — technology choice**: If the human expresses uncertainty ("not sure which", "which should we use?", "A or B?"), do NOT write the plan yet. First state: "I will shadow branch both options." Then ask requirements questions (scale, directionality, infra constraints) and STOP. After you receive answers, write the full shadow branch plan in 1e.

3. **STOP HERE** — wait for the human to answer before writing anything else.

Silence after the interview = the agent is blocked. Do not proceed without answers.

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
**Why I cannot proceed:** [specific reason]

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

**If the task had explicit uncertainty about approach** ("not sure which", "which should we use?", "A or B?"):
The plan MUST propose shadow branching — not a recommendation. Example:
```
## Scope — what will be built
- shadow/[task-id]-a: WebSocket implementation
- shadow/[task-id]-b: SSE implementation
- Full verification on both, then compare: complexity, bundle size, error handling
- Delete losing branch, PR winner with concrete rationale
```

**For all other tasks**, present the plan with an explicit gate:

```
# PLAN — [task-id]

[full plan content]

## Phase 3 — Verify (automatic after execution)
- [ ] `tsc --noEmit` exits 0
- [ ] Build exits 0
- [ ] No regressions vs baseline

## Phase 4 — Reflect (after Phase 3 passes)
- LESSONS.md entry: [what you expect to learn or what might go wrong]
- MEMORY.md update: [if an architectural decision is being made]
- dev-log entry: append to `planning/dev-log.md`

---
**AWAITING APPROVAL** — I will not write any code until you approve this plan.
Reply with "approved" or request changes.
```

**Rule:** Silence after the plan = blocked. No approval = no code.

---

### Phase 2 — Execute (autonomous — human does not intervene)

- Read the plan. Implement only what the plan says.
- Execute completely without interrupting the human.
- Use `planning/scratchpad.md` (gitignored) to track in-progress state: files touched, steps done, current blocker. If the session is interrupted or the model changes, the next agent reads the scratchpad and picks up from there.
- If Phase 3 — Verify fails: self-correct. Do not ask the human.
- If the plan itself is wrong (not the implementation): stop, return to Phase 1.

**Micro-iteration rule:** Do not write more than 50-100 lines without running the type-checker or linter (`tsc --noEmit`, `eslint`, or equivalent). Catching errors early is cheaper than unwinding 300 lines of cascading mistakes.

**Shadow branching — for persistent architectural uncertainty:**
If Phase 1 left genuine uncertainty between two approaches:
1. Create `shadow/[task-id]-a` and `shadow/[task-id]-b` branches
2. Implement each approach in its branch
3. Run full verification on both
4. Compare outcomes (type errors, test failures, code size, clarity)
5. Delete the losing branch. PR the winner: "Chose A over B because [concrete reason]."

**Shadow branch plan format example (WebSockets vs SSE):**

```markdown
## Scope — what will be built
- shadow/notifications-a: SSE implementation (EventSource + Next.js API route)
- shadow/notifications-b: WebSocket implementation (ws library + custom server)
- Both: working prototype in 50-100 lines, passing type-check
- Comparison: complexity, bundle delta, auth integration, error recovery
- Losing branch deleted. Winner PRed with: "Chose [X] because [concrete data]."

## Scope — what will NOT be built
- Anything outside the notification delivery mechanism
```

---

### Phase 3 — Verify (automatic — no human intervention)

| Check | Command | Gate |
|---|---|---|
| TypeScript | type-check exits 0 | Required |
| Build | build exits 0 | Required |
| Tests | No regressions vs baseline | Required |
| Secrets | No API keys, passwords, tokens | Pre-commit hook (blocks) |

If any gate fails: back to Phase 2. Phase 3 does not negotiate.

**Rollback rule:** If verification fails 3 times in a row on the same issue, stop self-correcting. Do `git stash` or reset to the last clean commit, then return to Phase 1 with the new information.

**Escalation rule:** If the rollback leads to a second round of Phase 1 and you still cannot make progress:
1. Create branch `ai-blocked/[task-id]`
2. Commit partial work: `git commit -m "wip: blocked on [task-id] — see BLOCKER.md"`
3. Write `BLOCKER.md`: what was attempted, what failed, what was ruled out, what human must decide
4. Open a GitHub issue referencing the branch and BLOCKER.md
5. Stop. Do not attempt again until the human responds.

---

### Phase 4 — Reflect

After Phase 3 passes, before requesting merge:

1. What failed during execution? → add to `planning/LESSONS.md`
2. Graduate each lesson to where it lives
3. Architectural decisions? → update `planning/MEMORY.md`
4. Write a dev-log entry → append to `planning/dev-log.md`

**Full cycle reference (what all 4 phases look like for a Surface task):**

1. Phase 1 → explore files → interview → write plan → AWAITING APPROVAL
2. Phase 2 → implement per plan → `tsc --noEmit` every 50 lines → self-correct
3. Phase 3 → type-check ✓ → build ✓ → tests ✓ → secrets ✓
4. Phase 4 → LESSONS.md entry → graduate lessons → MEMORY.md if arch decision → dev-log entry → commit

Missing any phase = incomplete cycle. Phase 4 is not optional.

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
**Scope:** Isolated | Surface | Systemic | Breaking
**Commit type:** fix | feat | refactor | chore | docs | perf
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
