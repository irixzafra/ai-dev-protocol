# Alignment — Interview Before Code

> The #1 cause of failed AI coding sessions is not capability — it's misalignment.
> The agent builds the wrong thing because it was never truly aligned on what you wanted.
>
> This document defines the alignment interview: a structured process that eliminates
> ambiguity before a single line of code is written.

---

## Why this matters

When you say "add authentication to the app", the agent hears:
- What kind of auth? (JWT, sessions, OAuth?)
- What provider? (Supabase, Auth.js, custom?)
- What routes need protection?
- What happens on unauthorized access?
- What's the error handling story?
- What must NOT be touched?

If the agent doesn't ask, it picks answers based on pattern-matching from its training data.
Those answers are often wrong for your specific context.

The alignment interview makes assumptions explicit before they become wrong code.

---

## When to run the alignment interview

**Always** for tasks that are:
- 3+ distinct steps
- Architectural decisions
- Multi-file changes
- Unclear requirements ("make it better", "refactor this", "add a feature")
- Any change to shared primitives, layouts, or infrastructure

**Skip** for:
- Single-line fixes (obvious typos, obvious bugs)
- Tasks with fully specified requirements and ≤2 files affected
- AUTO.* tasks (pre-approved, scope already defined)

---

## The interview structure

### Step 1 — Explore first, ask second

Before asking a single question, the agent must:
1. Read the relevant code files
2. Understand the existing patterns
3. Check for existing solutions to the same problem
4. Identify what would be affected by the change

**Rule:** Never ask questions you could answer by reading the codebase.
Only ask questions that genuinely require human judgment.

### Step 2 — Ask targeted questions

After exploration, ask only what's needed to eliminate ambiguity:

**Scope questions:**
- What is the exact outcome you want?
- What should this NOT do? (scope boundary — critical)
- Is there an existing pattern to follow, or is this new?

**Constraint questions:**
- Are there files I must not touch?
- Are there patterns I must follow or avoid?
- Is there a deadline or performance constraint?

**Success questions:**
- How will you know this is done correctly?
- What does "good" look like here?
- What would make you reject this implementation?

**Rule:** Maximum 4-5 questions. If you need more, the task needs to be broken down.

### Step 3 — Write the plan

After the interview, write a structured plan:

```markdown
# [task-id] — [short title]

**Status:** draft
**Date:** YYYY-MM-DD

## Intent
[1-3 sentences in the human's words]

## Scope — what will be built
- [item]

## Scope — what will NOT be built
- [item]

## Files likely affected
- [path]

## Acceptance criteria
- [ ] [verifiable criterion, not vague]

## Risk
LOW / MEDIUM / HIGH — [reason in one line]
```

### Step 4 — Get explicit approval

Present the plan. Wait for approval.

"Does this match what you want?"

If yes → start work.
If no → iterate on the plan, not on code.

**Rule:** No code before explicit approval on non-trivial tasks.
The plan is cheap. Wrong code is expensive.

---

## Common failure modes

### Asking questions in a vacuum
**Wrong:** "What type of authentication do you want?"
**Right:** Read the existing auth setup, then ask: "I see you're using Supabase Auth. Should this new flow use the same provider, or is this for a different system?"

### Asking too many questions
**Wrong:** 12 questions about every detail
**Right:** 3-4 questions that unlock the critical decisions. The rest follows from the answers.

### Missing the non-goals
**Wrong:** Plan only lists what will be built
**Right:** Plan explicitly lists what will NOT be built
The non-goals section prevents "while I'm here" scope creep.

### Vague acceptance criteria
**Wrong:** "The feature works correctly"
**Right:** "The signup form submits without error. The user is redirected to /dashboard. The session persists on page reload."

### Treating plan approval as optional
**Wrong:** "Here's the plan, starting now..."
**Right:** "Here's the plan. Does this match what you want?" — wait for the yes.

---

## The "what NOT to build" principle

This is the most powerful part of the alignment interview.

Saying explicitly what you will NOT build:
1. Prevents scope creep ("while I'm here I'll also fix...")
2. Makes the agent's reasoning visible to the human
3. Forces the human to say if those non-goals are actually wrong
4. Keeps the commit atomic and auditable

**Example:**

```markdown
## Scope — what will NOT be built
- No changes to existing auth middleware
- No new database tables (uses existing users table)
- No email verification flow (deferred to M2)
- No password strength requirements (out of scope)
```

If the human reads "No email verification flow" and says "wait, I need that too" — you caught a misalignment before it became a problem.

---

## Multi-agent alignment

When multiple agents are working on the same repo:

1. Each agent runs its own alignment interview
2. The plan is saved to `specs/active/[task-id].md`
3. The plan declares which files the agent owns
4. Other agents do not touch those files

If two plans claim the same file → escalate to the human before starting.

→ See `AUTONOMOUS.md` for the claim mechanism.

---

## Alignment interview for autonomous tasks

AUTO.* tasks skip the alignment interview because:
- The scope is already defined in WORKBOARD
- The type is pre-approved (fix/chore/docs/test)
- The risk is pre-assessed (rollback trivial)

If an autonomous agent discovers the task is more complex than described:
1. Stop
2. Add a note to WORKBOARD describing the complexity
3. Mark the task as blocked
4. Do not proceed without human review

---

## Quick checklist

Before writing code, confirm:

- [ ] I have read the relevant code files
- [ ] I understand the existing patterns for this type of change
- [ ] I have asked all questions that require human judgment
- [ ] The plan has an explicit scope AND non-goals
- [ ] Acceptance criteria are verifiable (not vague)
- [ ] Risk level is assessed
- [ ] The human has explicitly approved the plan
