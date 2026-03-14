# Level 0 — Core

> Solo developer. One AI agent. Three requirements.

## What this level solves

| Requirement | What it prevents |
|---|---|
| **R1 — Align before code** | AI builds the wrong thing |
| **R2 — Remember corrections** | Same mistakes repeat every week |
| **R3 — Verify before done** | Broken code reaches the repo |

These three requirements are the non-negotiable minimum. Every other layer in this protocol is built on top of them.

## Files in this level

| File | Purpose |
|---|---|
| `protocol.md` | The core development loop (copy to your project as `dev.protocol.md`) |
| `templates/lessons.template.md` | Corrections inbox with graduation model |
| `templates/agent-config.template.md` | Agent config starting point (Claude Code) |
| `pre-commit` | Lite hook: secrets check + lessons graduation gate |

## Setup

```bash
# 1. Copy the protocol
cp level-0-core/protocol.md your-project/dev.protocol.md

# 2. Create agent config
cp level-0-core/templates/agent-config.template.md your-project/CLAUDE.md
# Edit: fill in your tech stack and paths

# 3. Create planning files
mkdir -p your-project/planning
cp level-0-core/templates/lessons.template.md your-project/planning/LESSONS.md
touch your-project/planning/MEMORY.md

# 4. Install pre-commit hook (optional but recommended)
# Native git (no dependencies):
cp level-0-core/pre-commit your-project/.git/hooks/pre-commit
chmod +x your-project/.git/hooks/pre-commit
# With Husky (if your project uses it):
# cp level-0-core/pre-commit your-project/.husky/pre-commit && chmod +x your-project/.husky/pre-commit
```

## When to add more levels

- You add a second agent → add [Level 1](../level-1-multi-agent/)
- You want autonomous task pickup → add [Level 1](../level-1-multi-agent/)
- You want UI quality guardrails or optimization loops → add [Level 2](../level-2-production/)
