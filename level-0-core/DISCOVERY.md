# Discovery — Cómo generar el playbook de tu proyecto

> Run this once per project. Takes 10-15 minutes.
> Output: `planning/project.playbook.md` — the project's SSOT for all agents.

---

## Why this matters

Every time an agent starts a session without a playbook, it has to rediscover:
- What stack you're using
- What patterns you follow
- What NOT to do in this codebase
- What decisions have already been made

The discovery session runs once. After that, every agent loads the playbook and already knows.

---

## Step 1 — Run the discovery prompt

Open your agent (Claude Code, Codex, Gemini, Qwen — any) and paste this:

---

```
You are helping me create a project playbook — a single file that captures everything
specific about this project so that AI agents don't have to rediscover it every session.

Run a structured discovery interview. Ask me these questions one at a time.
Wait for my answer before moving to the next.

1. Project name and one-line description.
2. Main tech stack: frontend, backend, database, auth, hosting.
3. Key constraints: compliance requirements, performance targets, mobile-first, timeline, etc.
4. Coding preferences: KISS vs flexibility, testing minimum, preferred patterns.
5. Anti-patterns specific to this project — things that have caused bugs or that you want
   to avoid (not generic advice, things that matter HERE specifically).
6. Decisions already made — architectures, libraries, or approaches that are locked in
   and should not be reconsidered.

After all questions, generate a complete `project.playbook.md` following this structure:

---
# Project Playbook: [Name]

## Stack
[Technology table]

## Key paths
[Where things live in the repo]

## Variables
{{db_type}}: [value]
{{auth_provider}}: [value]
{{test_runner}}: [value]
{{dev_url}}: [value]
[Add any variable that skills will reference]

## Patterns we follow here
- [Project-specific conventions]

## What NOT to do
- [Anti-patterns specific to this project]

## Locked decisions
- [Things that are not up for debate]
---

Show me the complete generated playbook and ask: "Does this look right, or should I adjust anything?"
If I say OK, tell me to save it as `planning/project.playbook.md`.

Start with question 1 now.
```

---

## Step 2 — Save the playbook

```bash
mkdir -p planning
# Paste the generated content:
# planning/project.playbook.md
git add planning/project.playbook.md
git commit -m "chore: add project playbook"
```

---

## Step 3 — Daily usage

At the start of every session or task, load both files:

```
Read dev.protocol.md and planning/project.playbook.md before doing anything.
Use the stack, paths, and patterns from the playbook when applying skills.
Task: [your task here]
```

That's it. The agent knows your project from minute 1.

---

## How skills use the playbook

Skills in `level-2-production/skills/` are generic stubs.
The playbook fills in the blanks.

Example: `dev-backend/SKILL.md` says "validate at the boundary using your schema library."
Your playbook says `{{validation_library}}: Zod`.
The agent reads both and applies Zod — without you having to say it.

The convention: if the playbook defines `{{variable}}`, skills that mention that domain
will pick up the value automatically when an agent has both files in context.

---

## Keeping the playbook current

Update it when:
- Stack changes
- A new anti-pattern is discovered (from `LESSONS.md` → graduate here if project-specific)
- A decision is locked that wasn't documented

Keep it under ~100 lines. If it grows beyond that, move the detail to `docs/adr/` and keep only a summary line in the playbook.

---

## Optional: MCP integration

If you want agents to load the playbook automatically without manual copy-paste:
configure an MCP server that exposes `planning/project.playbook.md` as a resource.
The agent reads it at session start without being told.

This is optional. The manual approach (paste the file or reference it in your first message) works for 80% of use cases.
