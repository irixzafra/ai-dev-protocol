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
| `templates/playbook.template.md` | Project-specific layer: stack, paths, patterns, ADR index |
| `skills/dev-design/references/uncodixify.md` | 10 AI-generated UI anti-patterns to eliminate |
| `skills/dev-backend/` | Backend anti-patterns + stub for project-specific patterns |
| `skills/dev-security/` | OWASP Top 10 reference + auth/permissions patterns |
| `skills/dev-architecture/` | ADR + PDR generation rules |
| `templates/workboard.template.md` | Task tracking with autonomous queue |
| `templates/program.template.md` | Autonomous optimization loop (inspired by karpathy/autoresearch) |

## The playbook concept

The protocol is generic. Skills are generic stubs. The **playbook** is the project-specific layer that fills in the blanks.

```
ai-dev-protocol/          ← generic (this repo)
  level-2-production/
    skills/               ← structure + anti-patterns, no project specifics

your-project/             ← your playbook
  dev.protocol.md         ← copied from level-0-core, with your overrides
  playbook.md             ← your stack, paths, patterns, what NOT to do
  docs/adr/               ← your architecture decisions
  planning/LESSONS.md     ← your corrections history
  skills/                 ← your filled-in skills (backend with your actual DB, etc.)
```

Agents load the playbook alongside the protocol. The playbook wins over generic skill advice when there's a conflict.

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
cp level-2-production/templates/workboard.template.md your-project/planning/WORKBOARD.md

# 3. Optimization loop (if needed)
# Copy program.template.md next to the system you want to optimize
cp level-2-production/templates/program.template.md your-project/[system]/program.md
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
