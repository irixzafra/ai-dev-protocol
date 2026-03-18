# Briefings — Multi-Agent Orchestration Protocol

> **What:** The single entry point for any agent that opens a session.
> Replaces the need for the owner to copy prompts between sessions.
>
> **Owner:** writes briefings. Agents execute them autonomously.
> **Dev 1 (Orchestrator):** audits deliveries, writes briefings, coordinates.
> **Dev 2, Dev 3, ...:** execute briefings, report, find work.

---

## Session start protocol

```
1. git pull origin master
2. Read .claude/BRIEFINGS.md (THIS FILE in your project)
3. REGISTER: choose an agentId ({model}-{number}) and add yourself to the active agents table
4. Is there a briefing assigned to your agentId? -> Execute it (STEP 6)
5. No briefing assigned?
   a. Read planning/WORKBOARD.md -> section "Autonomous Queue"
   b. Choose a task AUTO.XX that does NOT have a claim in .claude/claims/
   c. Create claim: .claude/claims/AUTO.XX.lock (see protocol/claims.md)
   d. Commit + push the claim BEFORE starting work
   e. If push fails -> another agent got there first -> choose another task
6. Work. Pass the gates indicated in the task or briefing.
7. When done: report in "Deliveries pending review" with your agentId
8. All your commits must include your agentId:
   fix(scope): description [agent: {your-agentId}]
```

**TL;DR for the owner:** open N windows, tell each one "read `.claude/BRIEFINGS.md` and start working."
They register, find work, create claims to avoid collisions, and report when done.

---

## Agent registration

Active agents register in this table format:

| agentId | Type | Session | Status | Last commit |
|---------|------|---------|--------|-------------|
| `opus-1` | Claude Opus | Dev 1 — Orchestrator | active | `abc1234` |
| `codex-2` | Codex | Dev 2 — Cleanup | active | `def5678` |

**Naming rule:** `{model}-{number}`. Examples: `opus-1`, `codex-2`, `gemini-4`, `sonnet-5`.
Each new session picks the next available number.

---

## Anti-collision protocol

**BEFORE touching any file:**

```bash
# 1. Verify no one else is in the same area
ls .claude/claims/
git log --oneline -5  # recent commits from another dev in my zone?

# 2. Check hotspots (COORDINATION.md if present, or WORKBOARD.md)
# If your work touches shared primitives -> check first

# 3. If there's a conflict -> DO NOT start. Report and find another briefing.
```

**High-risk hotspots** (touch only with active claim):
- Shared layout/shell components
- Core packages used by multiple consumers
- `planning/WORKBOARD.md` — only orchestrator or with explicit claim

---

## Gates by work type

### Code work (fix, feat, refactor)

| Gate | Command | When |
|------|---------|------|
| G1 Type-check | project type-check command | After each batch |
| G2 Tests | project test command | Before push |
| G3 Secrets | Automatic in pre-push | Every push |
| G4 Browser | E2E test command | If visible UI was touched |
| G5 Scope | `git diff --stat` matches spec | Before reporting |

### Docs work (docs, chore)

| Gate | Command | When |
|------|---------|------|
| G3 Secrets | Automatic in pre-push | Every push |
| G5 Scope | `git diff --stat` matches spec | Before reporting |
| G6 Links | Spot-check links in modified docs | If files were moved/deleted |

### Cleanup work (delete-only)

| Gate | Command | When |
|------|---------|------|
| G1 Type-check | project type-check command | After each batch |
| G7 Zero refs | grep for imports of deleted files -> 0 | Before commit |

---

## Delivery format (mandatory for all)

When finishing any briefing, the dev reports:

```markdown
## Delivery: {TASK-ID} — {Title}

**Dev:** Dev N
**Files touched:** [git diff --stat]
**Gates:**
- G1 (type-check): pass/fail/N/A
- G2 (tests): pass/fail/N/A
- G3 (secrets): pass/fail
- G4 (browser): pass/fail/N/A
- G5 (scope match): pass/fail
**Commits:** [hash + message]
**Matches briefing:** yes/no
**Decisions made:** [if any unplanned]
**Blockers found:** [if any]
```

---

## How the owner creates a new briefing

```markdown
### Dev N — Short title

**Assigned:** YYYY-MM-DD -- **Priority:** P0/P1/P2 -- **Type:** code/docs/cleanup -- **Branch:** master or name
**Gates:** G1, G2, ... (applicable from the gates table above)

[Clear description of the work]

**When done:** fill in delivery in "Deliveries pending review" below.
```

Rules:
1. One briefing per dev at a time
2. The dev does not start without a claim
3. The dev reports when done using the delivery format
4. The orchestrator reviews before assigning the next briefing
5. If no briefing exists, the dev can claim tasks from the WORKBOARD Autonomous Queue (only `fix/chore/docs/test`)
6. Urgent briefings: mark with `URGENT` at the start

---

## References

- Claims mechanism: `protocol/claims.md`
- Autonomous task protocol: `protocol/autonomous.md`
- Backlog & sprint format: `protocol/framework/backlog.md`
- Governance rules: `protocol/framework/governance.md`
- Development protocol: `protocol/protocol.md`
