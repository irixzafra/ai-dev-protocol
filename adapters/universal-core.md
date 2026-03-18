# Universal Core — Model-Agnostic Protocol

> This file is the SSOT for all agents.
> Works identically with Claude Code, Codex, Gemini, Qwen, or any LLM.
> Load this file. Then load your model-specific adapter if one exists.

---

Read the full protocol: `protocol/protocol.md`
Read the alignment process: `protocol/alignment.md`
Read the autonomous queue: `protocol/autonomous.md`
Read the self-improvement loop: `protocol/self-improvement.md`

---

## Context tiering — load only what you need

Loading every skill file on every task burns context and degrades quality ("lost in the middle" effect).

**Always load:** `dev.protocol.md` + `planning/LESSONS.md` + `planning/project.playbook.md` + last 3 entries of `planning/dev-log.md`

**Load on demand — only when the task requires it:**

| Load this skill | When |
|---|---|
| `dev-security/` | Touching auth, sessions, permissions, public endpoints, or user input |
| `dev-backend/` | Writing API routes, DB queries, background jobs |
| `dev-performance/` | Building data-heavy pages, lists, dashboards, or anything with "this might be slow" |
| `dev-accessibility/` | Generating or modifying any UI component with interactive elements |
| `dev-testing-strategy/` | Writing or reviewing tests |
| `dev-architecture/` | Making decisions that are hard to reverse |
| `dev-design/uncodixify.md` | Any frontend component or layout |

If unsure: skip the skill. Load it only when you're about to touch that domain.

---

## Core rules (universal)

1. **Plan before code.** For any task with 3+ steps or architectural decisions: run the alignment interview, write the spec, get approval. No code before approval.

2. **Use subagents for parallel work.** Offload research, exploration, and independent subtasks to subagents. Keep the main context window for decisions.

3. **Capture corrections immediately.** If the human corrects anything: stop, capture in LESSONS.md, graduate now, resume. Do not defer to session close.

4. **Verify before done.** Never mark a task complete without: type-check passes, tests pass, no secrets in diff, behavior matches spec.

5. **Demand elegance.** For non-trivial work: ask "is there a more elegant way?" If a fix feels hacky: "Knowing everything I know now, implement the elegant solution." Skip for obvious simple fixes.

6. **Fix bugs autonomously.** Given a bug: locate it, fix it, verify it. Don't ask for hand-holding. Point at logs and tests.

---

## Contract-style prompting (works with any LLM)

When activating agent behavior, use contract-style framing:

> "Act as a senior staff engineer. Never mark done without tests passing.
> If a fix feels hacky, say: 'Knowing everything I know now, scrap this
> and implement the elegant solution.' Verify your work before reporting done."

This framing produces consistent behavior across Claude, Gemini, Qwen, and GPT-4o.

---

## Session start (always)

```bash
git pull origin master
grep '\[pending\]$' planning/LESSONS.md   # resolve before starting
```

## Session close (when human gave feedback)

1. Capture + graduate lessons
2. Update MEMORY.md if architectural decisions were made
3. Commit: stage LESSONS.md + graduated files together
