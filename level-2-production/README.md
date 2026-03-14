# Level 2 — Production

> When code quality and continuous optimization matter.

## What this level adds

Built on top of [Level 0](../level-0-core/) + [Level 1](../level-1-multi-agent/). Adds:

| Requirement | What it enables |
|---|---|
| **R6 — Quality guardrails** | Catches AI-generated UI patterns that look cheap at scale |
| **R7 — Optimization loops** | Autonomous agents that run experiments and improve metrics over time |

## Files in this level

| File | Purpose |
|---|---|
| `skills/dev-design/references/uncodixify.md` | 10 AI-generated UI anti-patterns to eliminate |
| `workboard.template.md` | Task tracking with autonomous queue |
| `program.template.md` | Autonomous optimization loop (inspired by karpathy/autoresearch) |

## When to add this level

- You're building frontend with AI agents and see generic-looking output
- You have a system you want to auto-optimize (RAG, recommenders, pipelines, bundle size)
- You want pre-approved tasks agents can execute without supervision

## Setup (adds to Level 0 + 1)

```bash
# 1. Skills — load uncodixify into your agent's context
mkdir -p your-project/.claude/skills/dev-design/references
cp level-2-production/skills/dev-design/references/uncodixify.md \
   your-project/.claude/skills/dev-design/references/

# 2. Task tracking
cp level-2-production/workboard.template.md your-project/planning/WORKBOARD.md

# 3. Optimization loop (if needed)
# Copy program.template.md next to the system you want to optimize
cp level-2-production/program.template.md your-project/[system]/program.md
# Edit: fill in objective, metrics, parameters, eval set
```

## Uncodixify quick reference

10 patterns AI agents produce by default that signal "generated" output:

1. Floating cards with excessive box-shadow
2. `rounded-2xl` / `rounded-3xl` applied to everything
3. Gradient backgrounds inside private dashboards
4. Decorative labels (subtitles with no informational purpose)
5. Gratuitous glassmorphism (backdrop-blur without context)
6. Icon + label + badge tripling (3 elements saying the same thing)
7. Inconsistent padding per component
8. "AI purple" — saturated accent with no design reason
9. Stat card grids with no visual hierarchy
10. Landing-page section headers inside private apps

→ Full details with root causes and correct alternatives: [`skills/dev-design/references/uncodixify.md`](skills/dev-design/references/uncodixify.md)
