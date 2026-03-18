# Deployment Readiness Gate

> Referenced by `SKILL.md` Phase 6.
> Runs only when merging a feature to master for release to production — not on every session close.
> This is the last quality barrier before runtime deployment work moves to `ops-server`.

**Never deploy without user confirmation** — deployment is a business decision.

## Step 1: Pre-flight

Verify the repo is in a clean, deployable state before touching the server.

```bash
cd $PROJECT_ROOT
git status
git log --oneline -5
```

Requirements:
- No uncommitted changes
- On `master`, up-to-date with origin
- No unresolved merge conflicts

## Step 2: Quality gate (blocking)

All three checks must pass. If any fails, stop and fix before deploying.

1. **Type-check:** `pnpm tsc --noEmit` — must be 0 errors
2. **Tests:** `pnpm test` — must be 0 failures
3. **Build:** `pnpm build` — must complete without errors; review significant warnings

### Secrets check

Before any deploy, verify no secrets leaked into the commit history:

```bash
git diff HEAD~5..HEAD -- '*.env*' '*.pem' '*.key' '*credentials*'
```

If any secrets found in diff, verdict is `bloqueado`.

## Step 3: Hand-off to ops-server

If Steps 1 and 2 pass, stop here and hand runtime operations to `ops-server`.

### Hand-off template

```
## Release Gate — the active project

- Branch / commit: master @ [short hash]
- Type-check: OK / FAIL
- Tests: OK / FAIL (X passing, Y failing)
- Build: OK / FAIL
- Secrets check: clean / LEAKED
- Risk notes: [list any known risks with severity]
- Verdict: cerrado / cerrado con riesgos / bloqueado
- Next step: use `ops-server` to execute the your deployment platform deploy and post-deploy verification.
```

## Step 4: Post-deploy verification ownership

The actual production deploy, container inspection, health checks, and rollback belong to `ops-server`, because the active project runtime operations are your deployment platform-managed.

| Responsibility | Owner |
|---|---|
| Release readiness (this gate) | `dev-qa` |
| Container deploy + restart | `ops-server` |
| Health check post-deploy | `ops-server` |
| Rollback decision | `ops-server` + user confirmation |
| Hotfix if deploy breaks | `dev-debug` -> `dev-qa` -> `ops-server` |

## Deploy report

```
| Check | Status |
|---|---|
| Type-check | OK / FAIL |
| Tests | OK / FAIL |
| Build | OK / FAIL |
| Secrets | clean / LEAKED |
| Handoff to ops-server | Ready / Blocked |
```
