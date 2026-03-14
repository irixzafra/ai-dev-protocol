# Skill: dev-architecture

> Use for decisions that affect multiple components, are hard to reverse, or require explicit documentation for the team and future agents.
> Produces ADRs (Architecture Decision Records) and PDRs (Preliminary Design Reviews).

## When to activate

- Choosing between two architectural approaches
- Adding a new external dependency or service
- Designing a schema that will be hard to change
- Any decision where "we tried X before and it failed" is relevant information

## Two outputs this skill produces

### ADR — Architecture Decision Record
A permanent log of *why* a decision was made. Future agents (and humans) read these to avoid repeating bad decisions.

When to write: after any architectural decision is finalized.
Where to store: `docs/adr/` in your project.

→ Template: [`../../level-0-core/templates/adr.template.md`](../../level-0-core/templates/adr.template.md)

### PDR — Preliminary Design Review
A structured comparison of options *before* a decision is made. Used during the alignment interview to make the trade-offs explicit.

When to write: during Phase 1 (Alignment) for any HIGH or MEDIUM risk task.
Where to store: `specs/active/[task-id]-pdr.md` (draft), move to `docs/pdr/` when finalized.

→ Template: [`../../level-0-core/templates/pdr.template.md`](../../level-0-core/templates/pdr.template.md)

## Core rules

1. **Write ADRs for irreversible decisions** — adding a framework, changing auth strategy, choosing a DB engine, defining a schema with foreign keys.
2. **Write ADRs for decisions that were tried and abandoned** — "we tried X, it failed because Y" is as valuable as "we chose Z because."
3. **Read existing ADRs before proposing a new approach** — the answer may already exist.
4. **PDRs are disposable; ADRs are permanent** — PDRs help you decide; ADRs record the outcome.
5. **One decision per ADR** — don't bundle multiple decisions. Each one should be independently searchable.

## Integration with the protocol

During Phase 1 (Alignment), if the task is MEDIUM or HIGH risk:
- Generate a PDR with at least 2 options
- Include trade-offs: complexity, reversibility, cost, maintenance burden
- Human approves the approach, then work starts
- After work is done: write the ADR recording the final decision

During Phase 4 (Reflect):
- If a significant decision was made mid-implementation, write the ADR then
