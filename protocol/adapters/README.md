# Protocol Adapters

> The protocol is model-agnostic. One core, thin per-model adapters.

## How it works

`universal-core.md` defines the full protocol — phases, rules, graduation, autonomous queue.
Each adapter is a 5-15 line override for model-specific behavior.

At session start, the agent loads:
1. `universal-core.md` (always)
2. Its own adapter file (model-specific)

## Adapters

| File | For |
|---|---|
| `universal-core.md` | Base protocol — loaded by everyone |
| `claude.md` | Claude Code (claude-sonnet, claude-opus) |
| `codex.md` | Codex / GPT-4o (OpenAI) |
| `gemini.md` | Gemini 2.x Pro |
| `qwen.md` | Qwen 2.5+ Coder |

## What goes in an adapter

Only things that differ per model:
- Which tools are available
- Which MCP servers are configured
- Context window constraints (if relevant)
- Any model-specific quirks that affect workflow

**Never put protocol rules in adapters.** Rules live in `universal-core.md`.
Adapters only contain what is different per agent.

## Adding a new adapter

1. Copy any existing adapter as starting point
2. Keep it ≤ 15 lines
3. Reference `universal-core.md` as the protocol SSOT
4. Only add what's genuinely different for this model
