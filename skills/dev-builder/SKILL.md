---
name: dev-builder
description: "Implements features in the active project when the plan is already defined. Structured workflow: schema, core engine, UI, tests, commit. Enforces monorepo conventions (DevOx hooks, barrel exports, max 5 files per commit) and, for product UI work, requires pattern reuse, naming discipline, shared-primitive justification, and cleanup of obsolete UI. Use when the user says 'build this', 'implement this', 'create the component/page/engine' — the WHAT is clear and the task is execution. If the WHAT is unclear, use dev-architect first to define it. NOT for bugs (use dev-debug), NOT for database-only operations (use dev-db), NOT for planning (use dev-architect), NOT for QA/review (use dev-qa)."
user-invocable: true
argument-hint: "[feature description]"
---

# Feature Implementation — Structured Workflow

Workflow for implementing features consistently in the active project's monorepo. Implementation order matters: schema -> contracts -> core -> UI -> tests -> commit.

## Context Loading

**First action in every session:** load the active project's `dev.playbook.md`.

| Playbook section | What this skill needs |
|---|---|
| Stack | Tech choices to use/avoid |
| Key paths | Monorepo structure — where to read/write files |
| Development commands | Type-check, test, build commands |
| Design System | Tokens, component inventory, layout primitives, UI anti-patterns |
| Domain Model | Business entities and invariants |
| Quality Contract | Phase 3 checklist (tsc, tests, no hardcoded colors, no `any`) |
| Patterns we follow | Build order, naming conventions, server actions pattern |
| What NOT to do | Project-specific anti-patterns |
| Naming conventions | How to name new files, engines, contracts, tests |

If `dev.playbook.md` doesn't exist in the project: stop and ask before proceeding.

## Mindset

Factory floor: every line of code is debt. Speed through simplicity, not shortcuts.

- **"Works" is not enough** — works + secure + fast + simple + beautiful
- **Zero tolerance:** no `any`, no TODO, no half-built features, no fake data
- **UX is the product:** instant feedback, designed empty states, hard things look easy
- **Minimum viable:** if it can be solved without new code, do it without new code. 1 file > 5.
- **Every delivered feature is 100% complete** — with empty states, loading, error, and tests. There is no "I'll fix it later".

## Visible product work

**Definition:** any change that affects what a logged-in user sees in the browser — pages,
components, shells, headers, sidebars, panels, empty states, loading states, error states,
form layouts.

**Does NOT include:** server actions (unless they change the response shape consumed by UI),
database schema, engine logic, or test files.

If your task qualifies as visible product work, read
`${CLAUDE_SKILL_DIR}/references/project-product-mode.md` before Phase 1 and apply its
classification, naming, cleanup, and primitive-gate rules throughout.

---

## Protocol

### Phase 1: Analysis

Understand before building to avoid rework. Run these checks before writing a single line.

**Baseline snapshot:**
```bash
git pull origin master
pnpm tsc --noEmit 2>&1 | tail -5    # record baseline error count
pnpm test 2>&1 | tail -5             # record baseline test state
```

**Impact map — answer each before proceeding:**
```
[] Which packages will be touched?
   apps/platform | packages/core | packages/ui | packages/contracts | packages/db
[] Does this need a new DB table or column? -> packages/db/schema/ + SQL migration
[] Does this need new Zod contracts? -> packages/contracts/src/
[] Does this need a new server action? -> apps/platform/app/[route]/actions.ts
[] Does this need a new engine? -> packages/core/src/engines/
[] Does this need new shared UI? -> packages/ui/src/components/
[] Does this need a new page? -> apps/platform/app/[route]/page.tsx
[] Are any of these files currently reserved by another agent?
```

**For visible product work, also answer:**
```
[] Which surface family is this? -> Overview | Workbench | Data
[] Which canonical primitive already solves most of this?
[] Classification: local-safe | surface-family | shared-shell-or-primitive
[] Can I extend what exists instead of creating a new component?
[] If I create something new, which old thing does it replace?
[] What naming or obsolete UI can I clean while I am here?
```

**Check COORDINATION.md:**
```bash
cat /Users/irix/Documents/Projects/the active project/.claude/COORDINATION.md
```
If a file you need is reserved -> stop and coordinate before proceeding.

**Classify the need — pick exactly one:**
```
New data model          -> DB schema + contracts first
Business logic only     -> Core engine or server action
UI only (model exists)  -> packages/ui or page component
Full stack              -> Schema -> Contracts -> Core -> UI -> Tests (in order)
```

**Stop conditions — do not build past these:**

| Condition | Recovery |
|-----------|----------|
| Task would create a new layout host | STOP -> escalate to user, suggest dev-architect |
| Task duplicates a rail/header/toolbar pattern | STOP -> read `${CLAUDE_SKILL_DIR}/references/project-product-mode.md`, find the canonical primitive |
| Task introduces a new name for an existing concept | STOP -> rename to canonical, absorb the alias |
| Task should update ADR/docs but does not plan to | STOP -> add the doc update to the plan, then proceed |

### Phase 2: Plan

Present plan to user before writing code — alignment upfront:
```
## Feature: [name]
### Files to create/modify
- packages/db/schema/[name].ts          (if DB work)
- packages/contracts/src/[name].ts      (if new types)
- packages/core/src/engines/[name].ts   (if engine)
- apps/platform/app/[route]/actions.ts  (if server action)
- apps/platform/app/[route]/page.tsx    (if page)
- packages/ui/src/components/[name].tsx  (if shared UI)
### DB Migration: Yes/No — table(s): [list]
### Tests: [what to cover]
### Estimate: X files, Y commits
```

For visible product work, add:
```
### Pattern reuse
- Existing primitive to extend: [name]
- New primitive needed: Yes/No
- If yes, 7-criterion gate answers: [see project-product-mode.md]
### Cleanup in scope
- Naming to normalize: [list]
- Obsolete UI to remove: [list]
### Docs impact
- ADR / MEMORY / WORKBOARD / COORDINATION updates needed: [list or none]
```

---

### Phase 3: Implementation (strict order)

**Templates:** `${CLAUDE_SKILL_DIR}/references/patterns.md` — copy-paste-ready code for each layer (3A schema, 3B contracts, 3C engine, 3D server action, 3E UI components, 3F tests).

**Decision tree A — Where does this code live?**
```
New data model          -> packages/db/schema/ + packages/contracts/src/
Business logic          -> packages/core/src/engines/ OR apps/platform/app/[route]/actions.ts
  Rule: stateless, reusable across routes -> packages/core
  Rule: single route, small, "use server" -> actions.ts in that route
Shared UI component     -> packages/ui/src/components/
Page-specific UI        -> apps/platform/app/[route]/_components/
API route               -> apps/platform/app/api/[path]/route.ts
Server action           -> apps/platform/app/[route]/actions.ts  (with "use server")
Config / constants      -> packages/core/src/config/ or apps/platform/lib/
```

**Decision tree A2 — Should I create a new component?**
```
Extending an existing primitive closes the task         -> extend it
Surface family needs a reusable variant of a primitive  -> add variant, not new host
The same UI problem appears in 2+ surfaces              -> shared primitive may be valid
Only one page wants it and pattern already exists       -> page-specific composition, not new primitive
Name is still fuzzy or duplicated                       -> do not create yet
```

**Decision tree B — Build order (types must exist before code that uses them):**
```
1. DB schema (Drizzle)        -> packages/db/schema/[name].ts + export in schema/index.ts
2. SQL migration              -> packages/db/migrations/YYYYMMDDHHMMSS_[description].sql
3. Zod contracts              -> packages/contracts/src/[name].ts + export in contracts/src/index.ts
4. Core engine or action      -> uses Zod contracts for input/output typing
5. UI component or page       -> calls server action or engine, never raw DB
6. Tests                      -> vitest, covers core logic and server actions
7. Barrel exports             -> update index.ts in any package that exported new symbols
```

**Commit (atomic, max 5 files):**
```bash
git add packages/db/schema/[name].ts packages/contracts/src/[feature].ts
git commit -m "feat([scope]): add [feature] schema and contracts"

git add apps/platform/app/[feature]/actions.ts apps/platform/app/[feature]/page.tsx
git commit -m "feat([scope]): implement [feature] action and page"

git add apps/platform/__tests__/[feature]-actions.test.ts
git commit -m "test([scope]): add [feature] action tests"

git push origin master
```

### Phase 4: Register

- Update `.claude/COORDINATION.md` — release file reservations, add commit hash for audit
- Update `planning/MEMORY.md` if any significant decision was made

---

## Commit checklist (run before every commit)

```
[] pnpm tsc --noEmit         — 0 errors (same as or better than baseline)
[] pnpm test                 — 0 failures, 0 skips
[] git diff --staged         — only the files you intended to touch
[] Max 5 files staged        — split if more
[] Commit message            — type(scope): description, English, imperative, <=72 chars
[] Barrel exports updated    — index.ts in packages/ui, packages/contracts, packages/core
[] No secrets staged         — no .env, no API keys, no credentials
```

---

## Monorepo structure

```
apps/platform/             <- Next.js app (pages, API routes, components)
  app/                     <- App Router pages and server actions
    [route]/
      page.tsx             <- RSC page — no data fetching logic inline
      actions.ts           <- "use server" server actions for this route
      _components/         <- page-specific client components
  lib/                     <- Platform utilities (gitignored — use git add -f)
  __tests__/               <- Integration tests for server actions and pages

packages/
  contracts/               <- Shared Zod schemas + inferred TypeScript types
    src/
      [feature].ts         <- one file per domain
      index.ts             <- barrel (export everything)
  core/                    <- Business logic engines (no business terms in filenames)
    src/
      engines/             <- stateless engines (FeatureEngine class pattern)
      types.ts             <- AuthContext, AppResponse<T>
    __tests__/             <- Unit tests for engines
  db/                      <- Drizzle schema + SQL migrations
    schema/
      [name].ts            <- one file per table group
      index.ts             <- barrel
    migrations/            <- YYYYMMDDHHMMSS_[description].sql
  ui/                      <- Shared UI components (shadcn base)
    src/
      components/          <- one file per component
      index.ts             <- barrel (must export anything used outside packages/ui)
```

---

## Naming conventions

- **Engines:** `packages/core/src/engines/[name]-engine.ts` + `index.ts` barrel
- **Contracts:** `packages/contracts/src/[feature].ts` — schemas named `[Verb][Entity]InputSchema`
- **Schema:** `packages/db/schema/[name].ts` with Drizzle `pgTable`
- **Tests:** `[engine]-[feature].test.ts` (engine) / `[feature]-actions.test.ts` (server actions)
- **Pages:** `apps/platform/app/[section]/page.tsx`
- **Migrations:** `packages/db/migrations/YYYYMMDDHHMMSS_[description].sql`
- **Server actions file:** always named `actions.ts`, sibling to `page.tsx`

---

## Rules

- **Max 5 files per commit** — DevOx pre-commit hook enforces this (atomicity)
- **No business terms in packages/core/** — DevOx hook blocks it (separation of concerns)
- **Do not touch files reserved by Dev** — see COORDINATION.md
- **Type-check green before each commit** — a broken commit blocks Dev
- **Tests green before push** — protects master
- **Always export from barrels** (index.ts) — keeps imports clean
- **Never `git add .` or `git add -A`** — explicitly stage named files only
- **Always `git pull origin master` before starting** — other agents push concurrently
- **Always `git push` after committing** — so other agents see your changes
- **Push with:** `git push origin master`
- **`apps/platform/lib/` is gitignored** — use `git add -f` for files there

---

## Repeating Pattern Guard

Rules that prevent the most common rework patterns. Check before writing code.

**Rule 1 — Check packages/ui before creating anything:**
Before creating any component, run: `grep -r 'ComponentName' packages/ui/src/ packages/core/`. If it has potential use in 2+ modules, create in `packages/ui` directly, not in the consuming app.

**Rule 2 — Never use window.confirm:**
Never use `window.confirm()`. Always use `DestructiveConfirm` from `@repo/ui/components/shell/destructive-confirm`. It has `isOpen`, `onClose`, `onConfirm`, `title`, `description` props.

**Rule 3 — Extract hooks before duplicating:**
If you write the same `useState` + `useCallback` combination for the second time in a session, STOP. Extract to a shared hook before continuing. The threshold is 2 — not 3, not 5.

**Rule 4 — No `any` types, no TODO comments in committed code:**
If you're about to write `as any` or `// TODO`, stop. Either solve it now or create a tracked task. Committed `any` types and TODOs are permanent debt.

**Rule 5 — Prefer local state over prop communication:**
If a solution requires an indirect communication prop (a flag, counter, or callback that triggers UI in a PARENT component) — stop. Ask: can each component handle this state locally? If yes, that is the correct solution.

**Rule 6 — Never pass `error.message` to the UI:**
Raw database/API errors leak SQL, table names, and internal structure. Use a central error resolver per surface (like `normalizeError()` in `/databases/actions.ts`) that: (1) catches known error codes → human-friendly message, (2) defaults unknown errors → generic message like "Error inesperado", (3) logs raw error server-side via `console.error`. The anti-pattern `error?.message ?? fallback` looks safe but exposes raw errors when `error.message` exists.

---

## Reference documents

| What | Where |
|------|-------|
| Code templates (copy-paste) | `${CLAUDE_SKILL_DIR}/references/patterns.md` |
| Product UI governance | `${CLAUDE_SKILL_DIR}/references/project-product-mode.md` |
| Visual governance (contrast, responsive, theme) | `dev-design/references/project-private-product.md` |
| Data page pattern (mandatory) | `docs/DATA_PAGE_PATTERN.md` |
| Tech stack and paths | `devox.context.yaml` |
| Current scope | `planning/OPENBOX_CORE_SCOPE.md` |
| Current tasks | `planning/WORKBOARD.md` |
| Project knowledge | `planning/MEMORY.md` |
| Multi-agent coordination | `.claude/COORDINATION.md` |
