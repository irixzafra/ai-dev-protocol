# [Project Name] — Agent Configuration

> **Read by:** Claude Code, Codex, Gemini, Qwen, or any AI agent.
> **Owner:** [Your name] (human, final authority on specs and merges)

---

## Development Protocol

**Read `dev.protocol.md` before writing any code.**

That file is the single source of truth for: the development flow, git rules,
multi-agent coordination, scope discipline, and gate enforcement.
This file only contains what is specific to this agent.

---

## Before Starting Any Non-AUTO Task

**Default: Alignment first.**

1. Explore the codebase — understand what exists before proposing changes
2. Run the alignment interview — max 4-5 targeted questions
3. Write the plan to `specs/active/[task-id].md`
4. Get human approval
5. Execute fully — self-correct until Phase 3 — Verify passes
6. Reflect → LESSONS.md → graduate lessons → request merge

> For AUTO.* tasks from WORKBOARD: skip alignment, use the claim mechanism.

---

## Project Reference

| What | Where |
|------|-------|
| **Development protocol** | `dev.protocol.md` ← START HERE |
| **Current tasks** | `planning/WORKBOARD.md` |
| **Active decisions** | `planning/MEMORY.md` |
| **Corrections & lessons** | `planning/LESSONS.md` |

---

## Tech Stack

<!-- Fill in your stack -->
- Language: TypeScript / Python / Go / ...
- Framework: Next.js / FastAPI / ...
- Database: PostgreSQL / SQLite / ...
- Test runner: Vitest / Jest / pytest / ...

---

## Paths

<!-- Fill in your key paths -->
- App entry: `src/`
- Tests: `__tests__/`
- DB schema: `db/schema/`
- Contracts: `packages/contracts/`

---

## Agent-Specific Notes

<!-- Anything specific to this agent that isn't in the protocol -->
- Dev URL: `http://localhost:3000`
- Test command: `pnpm test`
- Type-check: `pnpm type-check`
