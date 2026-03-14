# AI Dev Protocol

> A battle-tested protocol for autonomous AI-assisted development.
> Model-agnostic: works identically with Claude Code, Codex, Gemini, and Qwen.
> Born from production use on a real SaaS product with 4 concurrent agents.

---

## The problem this solves

Most developers use AI coding assistants as fast autocomplete.
They type a vague request, get code, paste it, repeat.
This works for trivial tasks and creates chaos at scale.

Two failures happen constantly:

**1. Misalignment** — the AI builds the wrong thing because it was never truly aligned on what you wanted. This is the #1 cause of wasted sessions.

**2. No memory** — every session starts from zero. Corrections are repeated. The same mistakes appear every week.

This protocol fixes both.

---

## Core ideas

### 1. Alignment interview before code

Before any non-trivial task, the agent must interview you.
Not "what do you want?" — a structured intake:

- Explores the codebase **first**, then asks targeted questions
- Identifies what will be built AND what will NOT (the non-goals section)
- Writes a spec with verifiable acceptance criteria
- Gets explicit approval before a single line of code is written

→ See [`protocol/ALIGNMENT.md`](protocol/ALIGNMENT.md)

### 2. Autonomous task queue

Pre-approved tasks (`fix`, `chore`, `docs`, `test`) live in a queue.
Agents pick them up without asking. A claim mechanism prevents collisions when multiple agents work on the same repo.

→ See [`protocol/AUTONOMOUS.md`](protocol/AUTONOMOUS.md)

### 3. Self-improvement loop with lesson graduation

Every correction from the human → captured immediately → graduated to where it actually gets read.

The key insight: a lesson in `LESSONS.md` that nobody reads is worthless. Every lesson must graduate to:
- The protocol (if it's about agent behavior)
- A skill (if it's about a tool workflow)
- A pre-commit hook (if it's automatable)
- A runbook (if it's operational setup)

A pre-commit hook enforces graduation — you cannot commit "graduated → protocol" without also staging the protocol file.

→ See [`protocol/SELF_IMPROVEMENT.md`](protocol/SELF_IMPROVEMENT.md)

### 4. Verification before done

Type-check + tests + no secrets = the minimum. The agent self-corrects until all gates pass. It does not ask the human for help with verification.

### 5. Model-agnostic

One core protocol, thin per-model adapters.
Works with Claude Code, Codex, Gemini 2.x, Qwen 2.5 Coder, or any LLM.

→ See [`protocol/adapters/`](protocol/adapters/)

---

## File structure

```
ai-dev-protocol/
├── README.md
├── protocol/
│   ├── PROTOCOL.md           ← main development protocol (SSOT)
│   ├── ALIGNMENT.md          ← alignment interview process
│   ├── AUTONOMOUS.md         ← autonomous task pickup + claim mechanism
│   ├── SELF_IMPROVEMENT.md   ← self-improvement loop + graduation
│   └── adapters/
│       ├── universal-core.md ← loaded by all agents
│       ├── claude.md         ← Claude Code overrides
│       ├── codex.md          ← Codex/GPT-4o overrides
│       ├── gemini.md         ← Gemini overrides
│       └── qwen.md           ← Qwen overrides
├── skills/
│   └── dev-design/
│       ├── SKILL.md
│       └── references/
│           └── uncodixify.md ← 10 AI-generated UI patterns to eliminate
├── templates/
│   ├── CLAUDE.md.template    ← starting point for new projects
│   ├── WORKBOARD.template.md ← task tracking format
│   ├── LESSONS.template.md   ← lessons inbox with graduation model
│   └── program.template.md   ← autonomous optimization loop program
├── hooks/
│   └── pre-commit            ← quality gates (secrets, lessons graduation, etc.)
└── docs/
    └── inspirations.md       ← what we built on and what we do differently
```

---

## Quick start

```bash
# 1. Copy the protocol to your project
cp protocol/PROTOCOL.md your-project/dev.protocol.md

# 2. Create your agent config
cp templates/CLAUDE.md.template your-project/CLAUDE.md
# Edit: fill in your project's tech stack and paths

# 3. Setup planning files
cp templates/WORKBOARD.template.md your-project/planning/WORKBOARD.md
cp templates/LESSONS.template.md your-project/planning/LESSONS.md

# 4. Install pre-commit hook
cp hooks/pre-commit your-project/.husky/pre-commit
chmod +x your-project/.husky/pre-commit

# 5. Choose your model adapter
# Point your agent config to: protocol/adapters/universal-core.md
# Then: protocol/adapters/claude.md (or gemini.md, codex.md, qwen.md)
```

---

## Inspirations

This protocol is built on the shoulders of several ideas.

**Boris Cherny (@bcherny)** — engineer who built Claude Code at Anthropic.
His 6 rules are the foundation. We took all of them and added:
the graduation system (lessons must reach where they're read),
the mid-session correction rule (zero-latency capture), and
multi-agent coordination (4 agents on one repo without collision).

**karpathy/autoresearch** — Andrej Karpathy's autonomous research loop.
`init → run → log → compare → iterate`. We generalized this into the
`program.md` pattern for any optimization loop, not just ML research.

**Uncodixify** — community-identified AI-generated UI anti-patterns.
We formalized these as a skill reference with root causes and correct alternatives.

**chatgptjunkie** — circulated the "Workflow Orchestration" config (March 2026).
The "Demand Elegance (Balanced)" rule came from there.

→ Full analysis and what we do differently: [`docs/inspirations.md`](docs/inspirations.md)

---

## What makes this different

| Problem | Boris (6 rules) | karpathy | This protocol |
|---|---|---|---|
| Misalignment before code | ⚠️ plan mode | ❌ | ✅ structured alignment interview |
| Lessons that disappear | ⚠️ update CLAUDE.md | ❌ | ✅ graduation system + pre-commit gate |
| 4 agents colliding | ❌ | ❌ | ✅ claim mechanism |
| AI-generated UI being generic | ❌ | ❌ | ✅ uncodixify as skill reference |
| Autonomous optimization loops | ❌ | ✅ | ✅ program.md (generalized) |
| Pre-approved tasks, no supervision | ❌ | ❌ | ✅ AUTO.* queue |
| Mid-session corrections lost | ⚠️ session close only | ❌ | ✅ zero-latency rule |
| Works with multiple LLMs | ❌ | ❌ | ✅ adapter pattern |

---

## Battle-tested on

- Next.js 15 monorepo with TypeScript strict mode
- 4 concurrent AI agents: Claude Code, Codex, Gemini, Qwen
- 1700+ tests, pre-commit hooks enforcing 9 quality gates
- Multi-tenant SaaS product in beta

---

## Contributing

Every pattern here was extracted from real production use.
If you have a correction, a new skill, or an improvement to the protocol:
open a PR. The issue is the spec. The PR is the implementation.

---

## License

MIT
