# WORKBOARD — [Project Name]
_Dynamic SSOT · Last updated: YYYY-MM-DD · Owner: [Your name]_

> Active milestone: **[Milestone name]**
> Mandatory reading before any session: `dev.protocol.md` → `WORKBOARD.md` → `MEMORY.md`

---

## Active Work

| # | Task | Owner | Status | Priority |
|---|---|---|---|---|
| M1.01 | [Task description] | [agent/human] | ⏳ | P0 |

---

## Autonomous Queue

> Tasks any agent can claim and execute without direct instruction.
> See `dev.protocol.md` § Autonomous Task Pickup and `protocol/AUTONOMOUS.md`.

**Entry criteria:** type `fix/chore/docs/test`, ≤5 files, LOW risk, no visible UI changes.

**To claim:** create `.claude/claims/[ID].lock` + atomic commit + push.

| ID | Task | Type | Required Gates | Files | Status |
|---|---|---|---|---|---|
| AUTO.01 | [Task description] | `docs` | none | 1 | ⏳ free |

---

## Completed

| # | Task | Done |
|---|---|---|
| [ID] | [Task] | ✅ |

---

## Rules

1. Confirm task is in this workboard before starting
2. Atomic commits: 1 task = 1 commit, max 5 files
3. Do not open new product areas — only close what's here
4. If something doesn't work end-to-end: degrade the promise before simulating
