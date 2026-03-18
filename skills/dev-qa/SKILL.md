---
name: dev-qa
description: "Quality gate for the active project codebase. Runs type-check, tests, cross-audit between agents, dead code scan, deep 7-point code review, and a deployment or dogfooding readiness gate before release. Also manages session start (git sync + status) and session close (consolidation). Use when starting a work session ('empezamos', 'continuamos'), ending one ('cerramos'), running QA ('verifica el código'), reviewing commits ('audita los commits'), checking project status ('cómo estamos'), or checking whether a change is ready for production or dogfooding. NOT for bugs (use dev-debug), NOT for planning (use dev-architect), NOT for building features (use dev-builder), and NOT for actual server deploys, restarts, or your deployment platform operations (use ops-server)."
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
argument-hint: "[session command, commit hash, file, or engine name]"
keywords: ["ultrathink"]
---

# QA — Session + Quality + Code Review + Deployment Readiness

## Context Loading

**First action in every session:** load the active project's `dev.playbook.md`.

| Playbook section | What this skill needs |
|---|---|
| Development commands | `pnpm tsc --noEmit`, `pnpm test`, `pnpm build` for this project |
| Quality Contract | Phase 3 checklist — the full definition of "done" |
| Key paths | Monorepo structure for dead code scan |
| Stack | Tech choices affecting QA approach |

If `dev.playbook.md` doesn't exist in the project: stop and ask before proceeding.

Session lifecycle (start/work/close), QA (type-check, tests, cross-audit, dead code), 7-point code review, and deployment/dogfooding readiness gate. Hands runtime deploy operations to `ops-server`.

## References

| File | When to read |
|---|---|
| `${CLAUDE_SKILL_DIR}/references/dogfooding-readiness.md` | Mandatory when the user asks if something is ready, closed, shippable for internal beta, or suitable for real use |
| `${CLAUDE_SKILL_DIR}/references/code-review-checklist.md` | Mandatory for deep code review of a commit, engine, file, PR, or agent delivery |
| `${CLAUDE_SKILL_DIR}/references/deployment-gate.md` | Mandatory only for production/deployment readiness, never for routine session close |
| `docs/AUDIT-MATRIX.md` | Mandatory when running a product audit — load before starting, update after |

## Mindset

Factory floor: quality is not a step — it is the standard at all times.

- **Zero tolerance:** a broken test blocks production. A type error is a broken contract. An unjustified `any` is a time bomb.
- **"Works" is not enough** — works + secure + fast + simple. If it passes the checklist but feels fragile, it does not pass.
- **A superficial review is worse than none** — read ALL the code before commenting. Do not approve out of courtesy.
- **Every session leaves the codebase better than it found it** — or at least exactly the same. Never worse.

## QA Verdict — single vocabulary, all phases

| Status | Meaning | Entry criteria |
|---|---|---|
| **cerrado** | Listo. Se puede hacer merge/ship. | Todos los gates verdes, sin riesgos abiertos |
| **cerrado con riesgos** | Listo con riesgos conocidos. | Gates verdes, pero riesgos de dataset/integracion/browser documentados con severidad y mitigacion |
| **bloqueado** | No se puede avanzar. | Cualquier gate rojo, o riesgo HIGH sin mitigacion |

Use this vocabulary in ALL phases. Do not invent alternatives.

## Skill Boundaries

### Relationship with dev-cycle
`dev-cycle`'s GATE phase orchestrates; `dev-qa` executes. When `dev-cycle` calls `dev-qa`, follow the specific phase requested. When `dev-qa` runs standalone, run full Phase 1-4.

### Delegation to dev-browser
For browser journey acceptance, delegate to `dev-browser` with URL and flow list. Do not duplicate browser automation logic here — pass the journey specification and receive PASS/FAIL with evidence (ARIA snapshot or screenshot).

### Readiness boundaries
Distinguish these four states explicitly whenever the task is "is this ready?":
- runtime ready
- browser journey ready
- dataset ready
- external integration ready

Do not collapse them into a single yes/no.

## Protocol

### Phase 0: Session Start

The start establishes a clean baseline — without this you may step on Dev's work or work on broken code.

```bash
cd $PROJECT_ROOT
git pull origin master
git status
git log --oneline -10
pnpm tsc --noEmit
```

Read to understand current state:
- `.claude/COORDINATION.md` — pending audit commits, files reserved by Dev
- `planning/WORKBOARD.md` — current gate, active tasks
- `planning/MEMORY.md` — recent project decisions

Present start summary:
```
## the active project Status — [date]

| Metric | Value |
|---|---|
| Branch | master @ [short hash] |
| Type-check | OK/FAIL |
| Last CC commit | [hash] [message] |
| Last Dev commit | [hash] [message] |
| Pending audit commits | X |
| Current gate | [name] [%] |

### Pending
- [workboard tasks]

### What do we do?
[Suggest logical next step]
```

### Phase 1: Type-check + Tests

These are the first line of defense — if they fail, everything else is noise.

1. **Type-check:** `pnpm tsc --noEmit` — must be 0 errors
2. **Tests:** `pnpm test` — must be 0 failures, 0 skips
3. If there are errors, fix them before continuing

### Phase 1b: Dogfooding Readiness

Run this whenever the user asks if something is "ready", "cerrado", or suitable for internal beta/dogfooding. Full protocol in `references/dogfooding-readiness.md`.

Quick checklist: runtime + browser journeys + dataset + integrations. Verdict uses the SSOT table above.

### Phase 2: Cross-audit

the active project has two agents pushing to master concurrently (Dev + Claude Code). Without cross-audit, incompatible changes go unnoticed.

1. Read `.claude/COORDINATION.md`
2. Find commits marked as `PENDING audit by Claude Code`
3. For each pending commit:
   - `git show --stat HASH` to see touched files
   - Grep for orphaned imports from deleted modules
   - Verify type-check is still green
4. Mark as `AUDITED by Claude Code` with verdict

### Phase 2b: Deep Code Review

When the user explicitly requests a code review (engine, file, commit, PR), apply the 7-point checklist in `references/code-review-checklist.md`. A superficial review is worse than none — read ALL the code before commenting.

### Phase 3: Dead code scan

Dead code accumulates confusion and causes grep to return false positives. Quick scan, do not delete without confirmation.

1. Search for files in `apps/platform/lib/` without imports
2. Search for exports in `packages/db/schema/index.ts` without consumers
3. Search for `.ts` files in `packages/` without imports from `apps/`
4. Only report — do not delete without confirming

### Phase 4: Report

Report table: Type-check | Tests (files/passing/failing) | Audited commits | Dead code found | Verdict (`cerrado`/`cerrado con riesgos`/`bloqueado`).

Update `.claude/COORDINATION.md` if there were audits.

When the task is product readiness, add readiness layers (Runtime / Browser journeys / Dataset / External integrations) each as OK / RISK / BLOCKED. Always separate code problems from dataset problems from external provisioning problems.

### Phase 5: Session Close

Closing cleanly avoids leaving landmines for the next session.

1. **Clean state:** `git status` + `pnpm tsc --noEmit` + `pnpm test`
2. **Pending commits** — if uncommitted changes exist, evaluate whether they are complete and functional
3. **Update coordination** — register new commits in COORDINATION.md
4. **Close summary:** commits table (hash/message/files), state at close (type-check/tests/pending audits), next session suggestions

### Phase 6: Deployment Readiness Gate

Full protocol in `references/deployment-gate.md`. Runs only when merging a feature to master for release to production — not on every session close. The last quality barrier before runtime deployment work moves to `ops-server`.

### Phase 7: Dogfooding Close-Out

Full protocol in `references/dogfooding-readiness.md`. When the user wants to move from implementation into real use, the QA close-out must answer what is ready now, what depends on data, and what depends on external provisioning.

### Phase 8: Product Audit

Use when the user asks for a product audit, quality review, or "cómo está el producto visualmente/funcionalmente".

Two audit modes — choose based on the question:

| Mode | Question | File |
|---|---|---|
| **Surface** | ¿Qué tiene mal `/login`? | `YYYY-MM-DD-[superficie].md` |
| **Specialized** | ¿Cómo está el sistema de diseño en todo el producto? | `YYYY-MM-DD-[categoria].md` |

**Before starting:**
1. Read `docs/AUDIT-MATRIX.md` — load active findings and surface coverage
2. For specialized audits: load the relevant checklist from `docs/audit/checklists/`
3. Identify which surfaces/categories haven't been audited recently

**During surface audit:**
```
For each surface being reviewed:
1. Auto layer: pnpm tsc --noEmit + pnpm test + Playwright smoke (if configured)
2. Manual layer (if requested): visual review at 390/1024/1440px, dark + light mode
3. For each finding: classify surface | unit | category | severity (S1/S2/S3)
4. Cross-reference against AUDIT-MATRIX.md — is this already tracked?
```

**During specialized audit:**
```
1. Load docs/audit/checklists/[categoria].md
2. Execute each checklist item (grep commands are pre-written in the checklist)
3. For each finding: add to AUDIT-MATRIX.md if not already tracked
4. After session: update the checklist itself —
   - Add items for anything found that wasn't covered
   - Mark items with [candidate: remove] if they caught nothing for the 3rd time
```

**After audit — write the session record:**

Create `docs/audit/YYYY-MM-DD-[superficie].md`:
```markdown
# Audit Session — YYYY-MM-DD — [superficie]

## Superficies cubiertas
## Método (auto / manual / mixto)

## Hallazgos añadidos
| ID | Superficie | Unidad | Categoría | Severidad |
|---|---|---|---|---|

## Hallazgos cerrados
| ID | Superficie | Cierre | Referencia |
|---|---|---|---|

## Cambios aplicados en esta sesión

## Lecciones extraídas
| Patrón | Ocurrencias | Destino | Estado |
|---|---|---|---|

## Próximo objetivo de auditoría

---

## Sprint seed

> S1 → dev-cycle inmediato · S2 → próximo ciclo · S3 → backlog

### Inmediato (S1)
- [ ] [A-XXX] descripción → skill sugerida

### Próximo ciclo (S2)
- [ ] [A-XXX] descripción → skill sugerida

### Backlog (S3)
- [ ] [A-XXX] descripción
```

**Generate sprint seed — mandatory last step:**
- Group findings by severity
- For each S1: propose immediate dev-cycle task with skill (`dev-debug`, `dev-cycle`, `dev-builder`)
- For each S2: propose next-cycle task with estimated scope (isolated/surface/systemic)
- S3: backlog entry, no urgency
- Irix reviews and promotes approved tasks to `planning/WORKBOARD.md`

**Update `docs/AUDIT-MATRIX.md`:**
- Add new findings to the active table
- Move resolved findings to the Closed section
- Update the Coverage table with today's date for each surface reviewed
- Update Emerging Patterns: if a pattern now has 3+ occurrences → mark as lesson candidate

**Lesson graduation rule:**
- 1 occurrence → note in session record
- 3+ occurrences across different sessions → add to `planning/LESSONS.md` with `[pending graduation]`
- Graduation target: `playbook > What NOT to do` (project-specific) | skill rule (generalizable) | protocol rule (universal)

**Update `docs/audit/README.md`:**
Add a row to the sessions table with today's date, surfaces covered, and counts.

## Rules

All rules exist because two agents (Dev + Claude Code) work in parallel on master:

- **Do not touch files reserved by Dev** — see COORDINATION.md "Reservation rule" section
- **Do not delete code without verifying 0 imports** — full grep, do not trust intuition
- **Do not commit without green type-check** — a broken commit blocks Dev
- **Always push after committing** — `git push origin master` (fast-track) or open a PR (full-track feat/refactor)
- **Do not run runtime deploys from this skill** — actual production operations belong to `ops-server`
- **Max 5 files per commit** — DevOx Law of Atomicity (pre-commit hook enforces it)
- **Always sync at start** — avoids silent conflicts
- **Do not leave uncommitted changes** at session close
- **Never deploy without type-check + tests green** — protects production
- **Never deploy without user confirmation** — deployment is a business decision
- **Never call something `cerrado` if the code is green but dataset/integration reality is not ready** — use `cerrado con riesgos`

## Key files

| File | Purpose |
|---|---|
| `.claude/COORDINATION.md` | Multi-agent protocol, audit table |
| `planning/WORKBOARD.md` | Gate state and active tasks |
| `planning/MEMORY.md` | Decisions and project context |
| `dev.context.yaml` | Tech stack and paths |

## Project context

- **Stack:** Next.js + Supabase + Turbopack
- **Monorepo:** pnpm workspaces (`apps/platform`, `packages/core`, `packages/db`, `packages/ui`, `packages/contracts`)
- **Type-check:** `pnpm tsc --noEmit` (no `type-check` script)
- **Tests:** `pnpm test` (vitest)
- **Branch:** `master` (not main)
- **Multi-agent:** Dev + Claude Code push to master concurrently
- **Pre-commit hook:** DevOx (max 5 files, no business terms in packages/core/)
- **Pre-push hook:** Protected branch — fast-track commits allowed direct push, full-track requires PR
- **Global gitignore:** `~/.gitignore_global` blocks `*.sql` and `apps/platform/lib` — use `git add -f` when necessary
- **Server:** your server provider YOUR_SERVER_IP (`ssh your-server`) — for full server ops use `ops-server`
- **Supabase:** Self-hosted at `supabase.your-domain.com`
