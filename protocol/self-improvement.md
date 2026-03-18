# Self-Improvement Loop

> A correction not graduated is only half-captured.
> The goal is not to remember mistakes — it's to make them impossible.

---

## The problem with "just write it down"

Most AI dev setups have some version of a lessons file.
Most of them don't work, because:

1. The lesson is written but never read
2. Agents only read LESSONS.md when they remember to — which is never
3. The correction fixes one session but repeats in the next

**The insight:** the lesson must live where it will actually be read.

If the correction is about agent behavior → it belongs in the protocol.
If it's about a tool workflow → it belongs in the skill.
If it's automatable → it belongs in the pre-commit hook.

The LESSONS.md file is an **inbox**, not a destination.
Every lesson must graduate out of it.

---

## The graduation model

```
LESSONS.md
    │
    ├── Behavior rule ──────────────────→ dev.protocol.md (or equivalent)
    ├── Tool/workflow insight ───────────→ the affected skill
    ├── Automatable check ───────────────→ .husky/pre-commit
    ├── Multi-agent coordination rule ───→ COORDINATION.md
    ├── Operational setup ───────────────→ runbook in docs/
    └── Module-specific knowledge ───────→ [reference] stays in LESSONS.md
```

A lesson with no graduation target is incomplete. Write the graduation target when you write the lesson.

---

## Lesson format

```markdown
### YYYY-MM-DD — [Short title]
**Status:** `[pending]` | `[reference]` | `[graduated → path/to/file]`

**Correction:** [what the human corrected, in 1-2 sentences]

**Root cause:** [why the mistake happened]

**Rule:** [the rule that prevents this mistake]

**Commit:** [if applicable]
```

Status meanings:
- `[pending]` — captured, not yet graduated. Requires action.
- `[reference]` — module-specific knowledge that doesn't need a systemic change. Stays here.
- `[graduated → path]` — applied to the system. This entry is only for traceability.

---

## The mid-session rule

Boris Cherny (who built Claude Code) says: invest in your CLAUDE.md.
After every correction, update it so you don't make that mistake again.

We take it further: **don't wait for session close**.

If the human corrects anything mid-session:
1. STOP current work immediately
2. Capture the lesson in LESSONS.md (brief, <3 lines)
3. Graduate it now — don't defer
4. Resume the corrected approach

Zero-latency capture prevents lessons from evaporating before the session ends.

---

## The graduation gate

The pre-commit hook enforces graduation. If a `[graduated → path]` entry exists in LESSONS.md, the target file must be staged alongside it.

This means: you cannot commit "graduated → dev.protocol.md" without also staging `dev.protocol.md`.

This prevents graduation theater — marking a lesson as graduated without actually applying it.

---

## Session start ritual

At the start of every session:
```bash
grep '\[pending\]$' planning/LESSONS.md
```

Unresolved `[pending]` lessons must be graduated or marked `[reference]` before starting new work. A pending lesson is an open debt.

---

## Session close ritual

Before ending a session where the human gave feedback:

1. Check: did the human correct anything?
   - Yes → write + graduate to the target
   - No → nothing to do here
2. Check: were architectural decisions made?
   - Yes → update `planning/MEMORY.md`
3. Check: is work in progress?
   - Yes → update status in WORKBOARD

Then commit:
```bash
git add planning/LESSONS.md planning/MEMORY.md planning/WORKBOARD.md
git add [graduated-file-1] [graduated-file-2]
git commit -m "docs(planning): session close YYYY-MM-DD"
```

---

## LESSONS.md pruning

LESSONS.md is an inbox, not a ledger. Let it grow unbounded and it becomes noise.

**Rule:** When LESSONS.md exceeds 50 lines, create a task to refactor it:
- Group similar `[graduated]` lessons into a single "Principles" summary
- Delete graduated lessons older than 3 months (they're already in the protocol/skill/hook)
- Keep all `[pending]` and `[reference]` entries untouched
- Keep the most recent 5 graduated entries as examples

The point is that LESSONS.md stays readable and uses minimal tokens in context.

---

## Dev log — short-term episodic memory

LESSONS.md captures permanent rules. Scratchpad captures in-flight state. MEMORY.md captures architectural decisions.

None of them answer: *"what happened in this codebase in the last few days?"*

`planning/dev-log.md` fills that gap:

| What | Where |
|---|---|
| Permanent rules (never repeat this mistake) | LESSONS.md |
| In-flight state (where I am mid-task) | scratchpad.md |
| Architectural decisions (locked choices) | MEMORY.md |
| What happened recently (situational awareness) | **dev-log.md** |

**Format:** One timestamped entry per session. Max 4 bullets:
- What was completed
- Temporary decisions taken (and why — so the next agent can reverse them knowingly)
- Blockers or oddities encountered
- Logical next step

**Pruning rule:** Delete entries older than 7 days. Keep the file under 30 lines.

**The human value:** A maintainer opening the project after a weekend can read the last 3 entries and immediately understand the current state — without decoding git commits or asking the agent to re-explain.

→ Template: `level-0-core/templates/dev-log.template.md`

---

## The compound effect

Session 1: agent makes mistake → lesson captured → protocol updated
Session 2: protocol prevents the mistake → different mistake → lesson captured
Session 3: two mistakes prevented → new surface area discovered

The protocol gets smarter with every session. The mistake rate drops measurably.

This is not theoretical. After ~30 sessions with real corrections, the agent should:
- Ask better clarifying questions
- Write less speculative code
- Touch fewer files than needed
- Verify before claiming done

Measure it: track how often the human corrects the same type of mistake. If it keeps happening, the lesson wasn't graduated to the right place.

---

## What to capture

Capture corrections about:
- Wrong assumptions the agent made
- Output that was technically correct but not what the human wanted
- Scope creep (agent touched files it shouldn't have)
- Missing context the agent should have read first
- Verification that was skipped
- Communication that wasted the human's time

Do NOT capture:
- Corrections that were due to incomplete requirements (fix the requirements, not the lesson)
- One-time project-specific decisions (those go in MEMORY.md)
- Things the agent cannot control (external API failures, etc.)

---

## Example lessons

### Good lesson (with graduation)

```markdown
### 2026-03-13 — Never pass error.message to UI
**Status:** `[graduated → skills/dev-builder/SKILL.md]`

**Correction:** `/inbox` and `/databases` were showing raw SQL error messages.

**Root cause:** Pattern `error?.message ?? fallback` gives false safety.
Supabase errors always have `.message` with SQL detail, so the fallback never triggers.

**Rule:** Use `normalizeError()` centrally. Log server-side. Generic message to UI.
```

### Bad lesson (no graduation)

```markdown
### 2026-03-10 — Remember to check imports
**Status:** `[pending]`

Just be more careful with imports.
```

The bad lesson has no root cause, no specific rule, and no graduation target. It will be forgotten.

---

## Template

Copy [`../templates/LESSONS.template.md`](../templates/LESSONS.template.md) to start.
