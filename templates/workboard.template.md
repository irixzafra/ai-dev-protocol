# WORKBOARD — [Project Name]
_Dynamic SSOT · Last updated: YYYY-MM-DD · Owner: [Your name]_

> Active milestone: **[Milestone name]**
> Mandatory reading before any session: `dev.protocol.md` → `WORKBOARD.md` → `MEMORY.md`
> Review cadence: [e.g. "Owner reviews PRs at 10am and 6pm"]

---

## Sprint Backlog

Autonomy levels (set by owner at sprint planning):
- 🤖 **Full auto** — agent works end-to-end, pushes directly
- 👁️ **Review gate** — agent works, opens PR, waits for review
- 🔒 **Human first** — agent writes plan, waits for approval before coding

| # | Task | Type | Autonomy | Gates | Files | Owner | Status | Priority |
|---|---|---|:---:|---|---|---|---|---|
| T.01 | [Task description] | `fix` | 🤖 | G1 G3 | ~3 | [agent] | ⏳ | P0 |
| T.02 | [Feature description] | `feat` | 🔒 | G1-G5 | ~10 | — | ⏳ | P1 |

---

## Autonomous Queue

> Pre-approved tasks any agent can pick up. Default autonomy: 🤖.
> **To claim:** create `.claude/claims/[ID].lock` + atomic commit + push.

**Entry criteria:** type `fix/chore/docs/test`, ≤5 files, LOW risk, no visible UI changes.

| ID | Task | Type | Gates | Files | Status |
|---|---|---|---|---|---|
| AUTO.01 | [Task description] | `docs` | G3 | 1 | ⏳ free |

---

## Completed

| # | Task | Agent | Score | Done |
|---|---|---|---|---|
| [ID] | [Task] | [agent] | [post-mortem score] | ✅ |

---

## Rules

1. Confirm task is in this workboard before starting
2. Respect the autonomy level — do not self-promote 👁️ to 🤖
3. Atomic commits: 1 task = 1 commit (batch docs exempt per protocol)
4. Do not open new product areas — only close what's here
5. Post-mortem score goes in Completed table when task is done
6. If blocked: add 🚫 status with reason, keep claim until resolved
