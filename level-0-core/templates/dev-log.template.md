# DEV_LOG — Agent Development Log

> Short-term episodic memory. Not rules. Not decisions. Just: what happened.
> Read the last 3 entries at session start. Write one entry at session close.
> Delete entries older than 7 days — this is not a ledger.

---

## Format

```markdown
## YYYY-MM-DD HH:MM — [Agent/Model]

- **Completed:** [what was built or fixed, 1-2 lines]
- **Decisions (temp):** [shortcuts or workarounds taken, and why — e.g., "mocked the API because backend was down"]
- **Blockers/Oddities:** [anything unexpected — false positives, race conditions, missing env vars]
- **Next:** [the logical next step if the session ended mid-task]
```

Max 4 bullets. If you need more, your entry is a report — this is a standup.

---

## [START HERE — replace with real entries]

## 2026-01-01 00:00 — example-agent

- **Completed:** Added `UserCard` component and connected it to `/api/users`
- **Decisions (temp):** Hardcoded the org ID in the query — RLS was blocking the test account, will fix when auth is stable
- **Blockers/Oddities:** `tsc --noEmit` passes but `next build` throws on dynamic imports — might be Next.js 15 edge case
- **Next:** Resolve the build error before adding the list view
