---
name: dev-update
description: "Systematic update manager for the active project monorepo + your server provider infrastructure. Audits ALL dependencies (npm packages, Docker services, Go modules), classifies updates as safe vs breaking, migrates what it can safely, tests everything (type-check, build, unit tests, browser smoke), commits & pushes, and delivers a full status report. Use when the user asks about dependency updates, outdated packages, upgrading libraries, updating the stack, keeping things current, or runs /dev-update. This skill is proactive — when the user says 'actualiza', 'actualízalo', 'revisa dependencias', 'están al día?', or anything update-related, launch this skill immediately."
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Task
argument-hint: "[package name, service name, or 'all']"
---

<!-- ultrathink -->

# dev-update — Dependency & Infrastructure Update Manager

Keeps the monorepo and your server provider stack current without breaking production. The goal is a clean green build — not the highest version numbers. When in doubt, defer and document.

## Two Modes

**Status query** (passive — "están al día?", "revisa dependencias", "qué hay desactualizado?"): Run Phase 1 + Phase 2 + Phase 8 report only. No changes, no commits. Tell the user what's outdated and what would need to happen.

**Update run** (active — "actualiza", "actualízalo", "/dev-update", "update everything"): Run all 8 phases. Apply safe updates automatically. Analyze breaking ones. Test, commit, push.

---

## Phase 1 — Inventory (always start here)

Run everything in parallel:

```bash
# npm packages — full monorepo
pnpm outdated --recursive 2>&1

# Docker services on your server provider
ssh your-server "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"

# your agent runtime Go version
ssh your-server "cd /opt/your-project/agent-runtime && cat go.mod | grep '^go ' && git log --oneline -3"

# Git sync check
git pull origin master && git log --oneline -3
```

Also check latest releases for key services:
- Docker Hub or GitHub releases for: your data engine, Kong, Traefik, PostgREST, your deployment platform, Supabase components (gotrue, realtime, storage-api, postgres-meta, supavisor, edge-runtime)

---

## Phase 2 — Classification

For every outdated item, classify as one of:

| Class | Criteria | Action |
|---|---|---|
| **SAFE** | Patch or minor within same major (`1.2.3 → 1.2.5`, `1.2.0 → 1.4.0`) | Update automatically |
| **BREAKING** | Major version jump (`v2 → v3`, `0.38 → 0.45` for drizzle) | Analyze migration guide first |
| **INFRA-PATCH** | Docker service patch version | Pull + restart (with confirmation) |
| **INFRA-MAJOR** | Docker service major version or Supabase stack | Flag for human review only |
| **HARDCODED-DEFER** | Packages in the NEVER list below | Skip, document why |

### NEVER auto-update (too risky, too pervasive):
- `zod` (used in ALL contracts — coordinate full migration pass)
- `isomorphic-dompurify` v2→v3 (jsdom v28 ESM chain breaks Next.js)
- `@types/node` major version jump (must match runtime Node version)
- your agent runtime PostgreSQL, Supabase PostgreSQL (data integrity risk)
- Any Supabase stack component while users are active

---

## Phase 3 — Safe npm Updates

For each package classified SAFE in Phase 2, update it:

```bash
# Update each SAFE package individually (so you can track what changed)
pnpm update [package-name] --recursive

# Or update all safe ones at once
pnpm update --recursive --latest 2>&1  # review output carefully before committing

# Verify types still compile after every batch
pnpm --filter platform type-check
```

If type-check fails after safe updates: check if TypeScript itself was bumped as a transitive dep. Common fix pattern for `Object.fromEntries` + `as const` arrays in TS 5.9+:
```ts
// Before: CATEGORY_LABELS: Record<string, string> = Object.fromEntries(arr.map(x => [x.value, x.label]))
// After: add explicit return type on the map callback
arr.map((x): [string, string] => [x.value, x.label])
```

---

## Phase 4 — Breaking npm Updates

For each breaking package:

1. **Fetch migration guide** — search the web for `[package] v[N] migration guide changelog`
2. **Scan codebase** — `grep -rn "affected-api" apps/ packages/ --include="*.ts"` to count usages
3. **Classify effort**: LOW (<5 files, API-compatible), MEDIUM (5-20 files, minor rewrites), HIGH (>20 files or contract changes)
4. **Attempt if LOW** — apply, run type-check, run tests, verify
5. **Defer if MEDIUM/HIGH** — document the reason

### Known-safe breaking packages (drop-in compatible):
- `tailwind-merge` v2→v3: pure drop-in, no API changes in typical usage
- `@supabase/ssr` 0.5→0.9: safe if code already uses `getAll`/`setAll` pattern
- `@hookform/resolvers` v3→v5: `zodResolver()` signature unchanged
- `resend` v4→v6: only breaks `contentId` on attachments (rarely used)
- `eslint` v9→v10: safe if flat config (`eslint.config.js`) already exists — delete legacy `.eslintrc.json` first with `git rm`

### ESLint v10 migration checklist:
```bash
# Check for legacy config alongside flat config
ls apps/platform/.eslintrc* packages/*/.*eslintrc*

# If legacy exists alongside eslint.config.js: remove the legacy
git rm apps/platform/.eslintrc.json

# Check peer dep compatibility before upgrading
cat node_modules/eslint-config-next/package.json | python3 -c "import json,sys; print(json.load(sys.stdin).get('peerDependencies',{}))"
```

### drizzle-kit migration:
```bash
# Always run 'up' before the kit version bump (one-way operation)
pnpm --filter @repo/db exec drizzle-kit up
# Expected output: "Everything's fine 🐶🔥"
```

---

## Phase 5 — Infrastructure Updates

### Check your data engine version:
```bash
ssh your-server "docker exec data-engine cat /data-engine/backend/src/data-engine/version.py"
```

### For INFRA-PATCH updates (patch version Docker images):
```bash
# Ask user confirmation before proceeding, then:
# Find the compose file for the service first:
ssh your-server "find /opt -name 'docker-compose.yml' -o -name 'docker-compose.yaml' | head -20"
# Then pull and restart:
ssh your-server "cd /opt/[service-path] && docker-compose pull [service] && docker-compose up -d [service]"
```

### Services requiring special care:
| Service | Notes |
|---|---|
| **your agent runtime** | Check `git log` vs upstream tags. If ahead of latest tag, already current. |
| **your data engine** | Uses `:latest` tag — `docker pull data-engine/data-engine:latest` + recreate |
| **Supabase stack** | Update all components together as a set. Uses your deployment platform env vars. |
| **Kong** | Major version (2.x → 3.x) is a big upgrade — flag only, do NOT apply |
| **Traefik** | your deployment platform manages this — check your deployment platform panel instead |
| **your deployment platform** | Self-updates via its own panel — trigger from UI |
| **PostgREST** | Patch updates via docker-compose pull + up at `/opt/supabase/your-project/` |

### Supabase stack update (when requested):
```bash
# Edit docker-compose to bump image tags, then:
ssh your-server "docker-compose -f /opt/supabase/your-project/docker-compose.yml pull && docker-compose up -d"
# Monitor for 60s to ensure healthy status
ssh your-server "docker ps | grep project"
```

---

## Phase 6 — Verification Gates

Run in this order. Stop and report if any gate fails:

```bash
# Gate 1: TypeScript
pnpm --filter platform type-check
# Expected: "Types generated successfully" + exit 0

# Gate 2: Production build (catches runtime import errors)
pnpm --filter platform build
# Expected: all routes listed, no errors

# Gate 3: Unit tests
pnpm test 2>&1 | tail -5
# Expected: failures only in known pre-existing timeouts

# Gate 4: Browser smoke (requires dev server on :3001)
# Navigate to /login → authenticate → /dashboard → /databases → /knowledge
# Verify each page loads without console errors
```

### Handling dev server port conflicts (multi-agent environment):
```bash
lsof -i -P | grep node | grep LISTEN
# Use whichever port is responding (3001, 3101, 3111...)
curl -s -o /dev/null -w "%{http_code}" http://localhost:[port]/ --max-time 10
```

---

## Phase 7 — Commit & Push

```bash
git pull origin master  # sync with other agents first

# Stage ONLY dependency files — never other agents' uncommitted work
git add -f \
  package.json \
  apps/platform/package.json \
  packages/core/package.json \
  packages/db/package.json \
  packages/ui/package.json \
  pnpm-lock.yaml
# Also stage any legacy config files removed during migration (e.g. git rm'd .eslintrc.json)

# Commit with structured message
git commit -m "chore(deps): [summary]

Safe updates:
- package: X.Y.Z → X.Y.Z+1

Breaking migrations:
- package: vN → vN+1 (reason it was safe)

Deferred:
- package: vN → vN+1 (reason: too risky)

Verified: type-check ✅ · build ✅ · tests ✅

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push origin master
```

---

## Phase 8 — Report

Always end with a full status table:

```
## Update Summary — [date]

### npm Packages
| Package | Before | After | Status |
|---|---|---|---|
| package-name | v1.0 | v1.1 | ✅ Updated |
| package-name | v3.0 | v4.0 | ⏸️ Deferred: [reason] |

### Infrastructure 
| Service | Running | Latest | Status |
|---|---|---|---|
| your agent runtime | dev (post-v1.9.0) | v1.9.0 | ✅ Current |
| your data engine | 2.1.4 | 2.x | ⚠️ Check docker pull |
| Kong | 2.8.1 | 3.9.1 | 🚨 Major — human review needed |

### Test Gates
| Gate | Result |
|---|---|
| TypeScript | ✅ Clean |
| Production build | ✅ All routes |
| Unit tests | ✅ 1641/1649 (8 pre-existing timeouts) |
| Browser smoke | ✅ /databases loads with data |

### Deferred (next run)
1. **zod v3→v4**: Used in all contracts. Needs coordinated migration of packages/contracts/* in one pass.
2. **isomorphic-dompurify v3**: jsdom v28 ESM chain breaks require() in Next.js. Defer until upstream fix.
3. **Kong 2.8.1→3.9.1**: Major version. Supabase manages this config. Needs manual validation.
```

---

## Multi-Agent Safety

the active project has multiple concurrent agents (Claude Code, Codex, Gemini, your agent runtime/G). Before any git operation:

1. `git pull origin master` — always sync first
2. `git status --short` — check for other agents' uncommitted work
3. Only stage YOUR files — never commit other agents' unstaged changes
4. Check `.claude/COORDINATION.md` for active work zones
5. After push: update `planning/MEMORY.md` if you made architectural decisions

---

## Quick Reference — Known Package Risks

| Package | Risk | Notes |
|---|---|---|
| `zod` | 🚨 Critical | Used in all contracts/schemas. v3→v4 is a full rewrite. |
| `drizzle-orm` | ⚠️ High | 0.38→0.45 is large jump. Check relations API. Always run `drizzle-kit up` first. |
| `tailwind-merge` | ✅ Low | v2→v3 is drop-in in this codebase |
| `@supabase/ssr` | ✅ Low | Already uses getAll/setAll — safe to bump |
| `@hookform/resolvers` | ✅ Low | zodResolver() unchanged v3→v5 |
| `resend` | ✅ Low | No contentId or react-email usage |
| `eslint` | ✅ Low if flat config exists | Delete legacy .eslintrc.json first |
| `isomorphic-dompurify` | 🚨 High | v3 breaks Next.js via jsdom/parse5 ESM chain |
| `@types/node` | 📌 Pin | Match runtime Node version (Node 22 → keep ^22.x) |
| `tailwindcss` | ✅ Low | Within v4 minor updates are safe |
