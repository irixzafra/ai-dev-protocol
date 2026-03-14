# Level 1 — Multi-Agent

> Two or more agents. Same repo. Zero collisions.

## What this level adds

Built on top of [Level 0](../level-0-core/). Adds:

| Requirement | What it enables |
|---|---|
| **R4 — Coordination** | Multiple agents work the same repo without stepping on each other |
| **R5 — Portability** | Any LLM (Claude, Codex, Gemini, Qwen) follows the same protocol |

## Files in this level

| File | Purpose |
|---|---|
| `alignment.md` | Structured alignment interview process |
| `autonomous.md` | Autonomous task pickup + claim mechanism |
| `self-improvement.md` | Self-improvement loop + graduation gate |
| `adapters/universal-core.md` | 6 core rules — loaded by all agents |
| `adapters/claude.md` | Claude Code overrides |
| `adapters/codex.md` | Codex/GPT-4o overrides |
| `adapters/gemini.md` | Gemini overrides |
| `adapters/qwen.md` | Qwen overrides |

## Setup (adds to Level 0)

```bash
# 1. Copy the alignment + autonomous protocols alongside your dev.protocol.md
cp level-1-multi-agent/alignment.md your-project/docs/alignment.md
cp level-1-multi-agent/autonomous.md your-project/docs/autonomous.md
cp level-1-multi-agent/self-improvement.md your-project/docs/self-improvement.md

# 2. Set up agent configs per model
cp level-1-multi-agent/adapters/universal-core.md your-project/docs/universal-core.md
cp level-1-multi-agent/adapters/claude.md your-project/CLAUDE.md
cp level-1-multi-agent/adapters/codex.md your-project/AGENTS.md
cp level-1-multi-agent/adapters/gemini.md your-project/GEMINI.md
cp level-1-multi-agent/adapters/qwen.md your-project/QWEN.md

# 3. Add WORKBOARD with autonomous queue
cp level-2-production/templates/workboard.template.md your-project/planning/WORKBOARD.md
```

## The claim mechanism (collision prevention)

Each agent claims a task atomically:

```bash
git pull origin master
# Update WORKBOARD: change ⏳ libre → 🔒 [agent-name]
git add planning/WORKBOARD.md
git commit -m "chore: claim AUTO.XX — [agent-name]"
git push origin master  # If push fails → another agent claimed it first → re-pull, pick next
```

→ Full details in [`autonomous.md`](autonomous.md)
