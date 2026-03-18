# Claims — Atomic Task Locking for Multi-Agent Work

> Prevents two agents from working on the same task simultaneously.
> Uses git push as the atomic mutex — only one push succeeds.

---

## Lock file format

Create `.claude/claims/[task-id].lock` with this content:

```
agent: [agent name / instance]
started: YYYY-MM-DDTHH:MM:SSZ
description: [what you will do — max 20 words]
```

---

## Atomic push protocol

```bash
# 1. Sync first — ALWAYS
git pull origin master

# 2. Verify no one has the claim
ls .claude/claims/[task-id].lock 2>/dev/null && echo "CLAIMED — pick another task" && exit 1

# 3. Write the lock file
cat > .claude/claims/[task-id].lock <<EOF
agent: [agent-name]
started: $(date -u +%Y-%m-%dT%H:%M:%SZ)
description: [brief description]
EOF

# 4. Commit + push atomically — push will fail if another agent got there first
git add .claude/claims/[task-id].lock
git commit -m "chore: claim [task-id]"
git push origin master
# If push fails: conflict -> rm .claude/claims/[task-id].lock -> pick another task
```

**Why this works:** git push is atomic. If two agents create the lock file at the same time, only one push succeeds. The other gets a rejection and must pick a different task.

---

## Releasing a claim (task done)

```bash
git rm .claude/claims/[task-id].lock
git add planning/WORKBOARD.md   # mark task done
git commit -m "chore: close claim [task-id] — [what was done]"
git push origin master
```

---

## TTL — 4 hours

A claim is considered **abandoned** when more than 4 hours have passed since the `started` timestamp in the lock file, regardless of commits.

### Checking if a claim is expired

```bash
started=$(grep "^started:" .claude/claims/[task-id].lock | awk '{print $2}')
age_min=$(( ($(date -u +%s) - $(date -u -j -f "%Y-%m-%dT%H:%M:%SZ" "$started" +%s 2>/dev/null || date -u -d "$started" +%s)) / 60 ))
[ "$age_min" -gt 240 ] && echo "EXPIRED (${age_min}min)" || echo "ACTIVE (${age_min}min)"
```

### Reclaiming an expired lock

To claim a task whose lock has expired:

```bash
git rm .claude/claims/[task-id].lock
# Then create a new claim using the atomic push protocol above
```

---

## Rules

| Rule | Reason |
|------|--------|
| Always `git pull` before checking claims | Another agent may have just claimed |
| Push is the mutex, not the file creation | Two agents can create the file — only one push wins |
| Do not delete another agent's active claim | Only reclaim if expired (>4h) |
| Commit the claim BEFORE starting work | Establishes ownership |
| Delete the claim AFTER the work is pushed | Clean up after yourself |
