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

→ See `templates/program.template.md`

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

## What this protocol solves that the others don't

| Problem | Boris | Karpathy | Uncodixify | This protocol |
|---|---|---|---|---|
| Wrong output from misalignment | ⚠️ (plan mode) | ❌ | ❌ | ✅ structured alignment interview |
| Lessons that disappear next session | ⚠️ (CLAUDE.md) | ❌ | ❌ | ✅ graduation system + pre-commit gate |
| 4 agents colliding on same file | ❌ | ❌ | ❌ | ✅ claim mechanism |
| AI-generated UI looking generic | ❌ | ❌ | ✅ | ✅ integrated as skill reference |
| Autonomous optimization loops | ❌ | ✅ | ❌ | ✅ program.md pattern (generalized) |
| Pre-approved tasks without supervision | ❌ | ❌ | ❌ | ✅ AUTO.* queue + claim mechanism |
| Lessons not actually applied | ❌ | ❌ | ❌ | ✅ graduation gate in pre-commit |
| Mid-session corrections lost | ⚠️ (session close) | ❌ | ❌ | ✅ zero-latency capture rule |
