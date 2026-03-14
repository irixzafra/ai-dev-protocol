# Inspirations — What we built on and what we do differently

This protocol didn't come from nowhere. Here's what we studied,
what we took, and where we diverged.

---

## Boris Cherny — Claude Code workflow

**Source:** [@bcherny on X, Jan 31 2026](https://x.com/bcherny)
**Boris is the engineer who built Claude Code at Anthropic.**

His 6 rules are the foundation:
1. Plan Mode for any non-trivial task
2. Use subagents liberally to keep context clean
3. Self-Improvement Loop — after every correction, update CLAUDE.md
4. Verification Before Done — never mark complete without proving it works
5. Demand Elegance — "Is there a more elegant way?"
6. Autonomous Bug Fixing — point at logs, say fix, don't micromanage

**What we took:** All 6. Especially the graduation insight ("Invest in your CLAUDE.md. Ruthlessly iterate until mistake rate drops.") and the memory files pattern.

**What we added:**
- **Graduation system** — Boris says "update CLAUDE.md." We say: update where it actually gets read. A lesson in a file nobody reads is worthless. Every lesson must graduate to the protocol, the skill, the hook, or the runbook — or it's half-captured.
- **Mid-session rule** — Boris captures corrections at session close. We capture at zero latency: stop, capture, graduate, resume. Prevents lessons from evaporating before session end.
- **Multi-agent coordination** — Boris works solo. We run 4 agents concurrently on the same repo. The claim mechanism prevents collisions without human coordination.
- **`/techdebt` slash command** — Boris mentions it; we implement it.

---

## karpathy/autoresearch

**Source:** [github.com/karpathy/autoresearch](https://github.com/karpathy/autoresearch)
**Andrej Karpathy's framework for autonomous research experiments.**

The core insight: define an experiment as a program, run it autonomously, keep what improves the metric, discard what doesn't. Iterate until stable.

Structure: `init_experiment → run_experiment → log_experiment → compare_vs_baseline → iterate`

**What we took:** The `program.md` pattern. Any complex autonomous agent should have a `program.md` that defines:
- Objective and metric with numerical thresholds
- Parameters the agent CAN modify (closed list)
- Parameters it CANNOT touch
- The loop protocol
- Stop condition
- Max time per iteration

**What we do differently:** Karpathy's focus is ML research (hyperparameter tuning, architecture search). We generalized the pattern to any optimization loop: RAG tuning, performance baselines, UI quality loops.

→ See `level-2-production/templates/program.template.md`

---

## Uncodixify

**Source:** Community-identified AI-generated UI anti-patterns
**The observation:** LLMs produce the same cheap visual patterns by default.

The 10 patterns aren't random — they're what models produce when optimizing for "looks like a professional UI" without a design system constraint:
- Floating cards with excessive shadow
- `rounded-2xl` on everything
- Gradient dashboards
- Decorative labels everywhere
- Gratuitous glassmorphism
- Icon + label + badge triple redundancy
- Inconsistent padding per component
- "AI purple" saturated accent
- Stat cards without hierarchy
- Landing-page headers inside private apps

**What we took:** The 10 patterns as a checklist. Any UI review must scan for these before shipping.

**What we added:** The framing as a skill reference (`dev-design/references/uncodixify.md`) with the root cause of each pattern (when does the LLM produce it by default?) and the correct alternative. Not just "this is bad" but "this is why the model does it and here's the right thing instead."

→ See `skills/dev-design/references/uncodixify.md`

---

## chatgptjunkie — Workflow Orchestration

**Source:** @chatgptjunkie on Instagram/TikTok, circulated March 2026
**A community-compiled AI workflow config with 6 sections.**

Key sections:
- Workflow Orchestration (Plan Node Default, Subagent Strategy, Self-Improvement Loop, Verification Before Done, Demand Elegance, Autonomous Bug Fixing)
- Task Management (Plan First, Verify Plan, Track Progress, Explain Changes, Document Results, Capture Lessons)
- Core Principles (Simplicity First, No Laziness, Minimal Impact)

**What we took:** The "Demand Elegance (Balanced)" rule — we formalized it in our protocol. The distinction between non-trivial changes (pause, ask "is there a more elegant way?") and simple fixes (skip, don't over-engineer) is important and often missing.

**What we do differently:** This config is a set of principles. We have a running system — gates, hooks, skill library, claim mechanism. The principles become enforced behavior, not suggestions.

---

## Garry Tan — gstack / specialist team model

**Source:** Referenced in the Karpathy/autoresearch context, team-of-specialists pattern
**The core idea:** Don't use one generalist agent. Build a team of specialists.

One agent plans (CEO), one reviews architecture (Engineer), one writes code (Code), one breaks it (QA), one optimizes (Self-Improve).

**What we took:** The 4-role model: Orchestrator → Builder → Auditor → the human approves twice. Each role has a specific job and specific authority.

**What we do differently:** We don't need a separate orchestration framework (CrewAI, LangGraph). The protocol itself coordinates agents via WORKBOARD + claim mechanism + spec files. The framework is the protocol, not the runtime.

---

## Aider — paul-gauthier/aider

**Source:** [github.com/paul-gauthier/aider](https://github.com/paul-gauthier/aider)
**The standard terminal-based AI coding agent.**

Aider's key contribution to the field: the **repomap** — an AST-based map of the repository that gives the agent structural awareness without loading every file into context. The agent understands which functions call which, what's exported, and what's related — without reading it all.

**What we take from it:** For very large projects, a `repomap.md` (or equivalent generated summary) is worth maintaining. An agent that knows the shape of the repo makes fewer unnecessary reads and avoids touching unrelated files.

**What we do differently:** Our protocol addresses the *process* layer (align, verify, remember). Aider addresses the *context* layer (what does the agent see?). They're complementary: Aider's repomap improves the quality of Phase 1 (Alignment) by giving the agent better codebase awareness.

---

## SWE-agent — princeton-nlp/SWE-agent

**Source:** [github.com/princeton-nlp/SWE-agent](https://github.com/princeton-nlp/SWE-agent)
**Research agent for automated software engineering tasks.**

SWE-agent introduced the concept of **Agent-Computer Interface (ACI)**: the idea that agents need tools designed specifically for them — not human interfaces adapted post-hoc.

Key finding: agents perform significantly better when given purpose-built interfaces (structured file editing, filtered search, atomic task queues) than when using generic tools designed for humans.

**What we take:** This is the theoretical justification for why the claim mechanism, the WORKBOARD format, and atomic spec files work. We designed them for agents, not humans. A WORKBOARD entry isn't a pretty card — it's a structured row an agent can claim, act on, and close without ambiguity.

**What we do differently:** SWE-agent is a research framework. We're a protocol you add to an existing project with markdown files. Same insight, different application layer.

---

## Eugene Yan — LLM Patterns

**Source:** [eugeneyan.com/writing/llm-patterns](https://eugeneyan.com/writing/llm-patterns/)
**Industry-recognized patterns for LLM-based systems.**

Eugene Yan's taxonomy of LLM system patterns includes: Evals, RAG, Fine-tuning, Caching, Guardrails, **Reflection**, and Self-Correction.

The **Reflection** pattern is directly aligned with what we do:
> "Have the LLM critique and revise its own outputs before returning them to the user."

The **Self-Correction** pattern matches our self-improvement loop:
> "Use external feedback (test results, human corrections) to iteratively improve outputs."

**What we take:** Our program.md loop (init → run → log → compare → iterate) is an application of Self-Correction at the system level. Our Phase 4 (Reflect) is Reflection applied at the task level. Having academic grounding for these patterns strengthens the design rationale.

**What we do differently:** Eugene Yan describes patterns in isolation. We compose them into a running system: Reflection (Phase 4) feeds Self-Correction (LESSONS.md graduation) which produces Guard-railed behavior (pre-commit hooks).

---

## What this protocol solves that the others don't

| Problem | Boris | Karpathy | Aider | SWE-agent | This protocol |
|---|---|---|---|---|---|
| Wrong output from misalignment | ⚠️ plan mode | ❌ | ❌ | ❌ | ✅ structured alignment interview |
| Lessons that disappear | ⚠️ CLAUDE.md | ❌ | ❌ | ❌ | ✅ graduation system + pre-commit gate |
| 4 agents colliding | ❌ | ❌ | ❌ | ❌ | ✅ claim mechanism |
| AI-generated UI being generic | ❌ | ❌ | ❌ | ❌ | ✅ Uncodixify as skill reference |
| Autonomous optimization loops | ❌ | ✅ ML only | ❌ | ❌ | ✅ program.md (any system) |
| Agent stuck in fix loops | ❌ | ❌ | ❌ | ❌ | ✅ rollback rule (fail 3x → reset) |
| Codebase awareness in large repos | ❌ | ❌ | ✅ repomap | ⚠️ | ✅ repomap.md pattern (Level 2) |
| Tools designed for agents not humans | ❌ | ❌ | ✅ | ✅ ACI | ✅ WORKBOARD, spec format, claim |
| Reflection built into the loop | ⚠️ | ✅ | ❌ | ❌ | ✅ Phase 4 + graduation |
