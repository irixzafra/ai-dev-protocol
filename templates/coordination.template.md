# COORDINATION — Multi-Agent Protocol

> Prevents collisions between agents working in parallel.
> Read `protocol/claims.md` for the atomic claim mechanism.
> Read `protocol/briefings.md` for the orchestration protocol.

---

## Session start

1. `git pull origin master`
2. Read `.claude/BRIEFINGS.md` — is there a briefing for you?
3. If no briefing: read `planning/WORKBOARD.md` and find an autonomous task
4. Verify active claims: `ls .claude/claims/`
5. Create a claim before starting work

---

## Hotspots

_List files/directories that are frequently edited by multiple agents.
Edits to these without coordination create merge conflicts._

| Area | Hot paths | Risk |
|------|-----------|------|
| Planning | `planning/WORKBOARD.md`, `planning/MEMORY.md` | State conflicts |
| Shared UI | (list your shared component paths) | Breaks shared surfaces |
| Core packages | (list your core package paths) | Affects all consumers |

---

## Active work

_Track what each agent is working on to prevent overlap._

| Agent | Task | Files reserved | Status |
|-------|------|----------------|--------|
| | | | |

---

## Rules

1. One agent writes one file at a time — two agents on the same file = guaranteed conflict
2. Before touching a hotspot, check `git log --oneline -5 -- {path}`
3. If another agent touched it in the last 2 commits, pull first
4. Never overwrite or revert another agent's work without owner confirmation
5. Leave a trail when closing: update WORKBOARD.md + MEMORY.md
