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

Example: `dev-backend/skill.md` says "validate at the boundary using your schema library."
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

---

## Backlog analysis prompt

Use this when an idea surfaces that isn't a task yet.
Paste it into your agent with the idea appended at the end.

```
Read dev.protocol.md and planning/project.playbook.md before doing anything.
Also read planning/BACKLOG.md if it exists.

I have an idea I want to analyze before deciding whether to build it.
Run a structured analysis. Ask me one question at a time:

1. What problem does this idea solve? (Or what opportunity does it open?)
2. Who benefits and how often does the problem occur?
3. What are the risks or downsides of building this?
4. Does it fit the current roadmap and constraints in the playbook?
5. Are there simpler alternatives?

After the dialogue, give me:
- A MoSCoW priority (M/S/C/W) with your reasoning
- A recommendation: accept (add to WORKBOARD), defer, or reject
- If accepted: a one-paragraph spec I can paste into WORKBOARD

Then update planning/BACKLOG.md with the analysis result.

Idea: [describe it here]
```

This is optional. The manual approach (paste the file or reference it in your first message) works for 80% of use cases.

---

## Legacy codebase mode — cold start

Use this when you're dropping the protocol into an **existing codebase** with no documentation, unknown stack, or inherited patterns you don't fully understand yet.

Instead of answering the discovery interview yourself, the agent reads the code and generates the playbook for you to review and correct.

```
You are helping onboard an AI protocol into an existing codebase.
Do NOT ask me questions yet. First, do a structured code analysis.

Step 1 — Explore the repository:
- Read the root package.json / pyproject.toml / go.mod (whichever exists)
- List the top-level directory structure
- Read 2-3 representative files from the main source directory
- Check for existing config files: tsconfig.json, .eslintrc, docker-compose.yml, .env.example

Step 2 — Deduce and document:
Based on what you found, generate a draft `planning/project.playbook.md` with:
- Stack (what you detected, not what I told you)
- Key paths (where the main source, tests, and config live)
- Patterns you observed in the code (naming conventions, folder structure, import patterns)
- Anti-patterns you spotted (things that look inconsistent or risky)
- Open questions (things you couldn't determine from the code alone)

Step 3 — Present for review:
Show me the generated playbook and the open questions.
I will correct what's wrong and answer the questions.
Then you update the playbook and save it.

Start with Step 1 now. Do not ask questions until Step 3.
```

This typically takes one session. The output is a playbook that reflects the codebase as it actually is — not as it was supposed to be.
