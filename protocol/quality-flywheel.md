# Quality Flywheel

> A self-improving loop that turns audit findings into permanent agent memory.
> Each audited defect becomes a rule the next agent cannot ignore.

---

## The loop

```
dev-qa Phase 8: Product Audit
        ↓
AUDIT-MATRIX.md  ←  live findings (surface / unit / category / severity)
        ↓                    ↓
        ↓            Sprint seed  ←  actionable tasks grouped by severity
        ↓                    ↓ Irix approves
        ↓            WORKBOARD  ←  promoted tasks
        ↓                    ↓
        ↓            dev-cycle / dev-debug / dev-builder execute
        ↓                    ↓
        ↓            finding closed in AUDIT-MATRIX
        ↓
  3+ occurrences across different sessions
        ↓
planning/LESSONS.md  [pending graduation]
        ↓ graduated with [graduated → playbook > X]
dev.playbook.md  →  What NOT to do  /  Design System  /  Patterns
        ↓
dev-builder loads playbook as first mandatory action
        ↓
Agent cannot commit the same error
```

The loop is closed only if all five links are operational. Each link is explicit — nothing is assumed.

---

## The four links

### Link 1 — Audit produces structured findings

`dev-qa` Phase 8 runs product audits and writes to `docs/AUDIT-MATRIX.md`.

Every finding has: surface, unit, category, severity (S1/S2/S3), Local verified, Prod verified, open date.

Every audit session produces `docs/audit/YYYY-MM-DD-[superficie].md`: surfaces covered, findings added/closed, lessons extracted. The surface name in the filename gives immediate context when navigating history.

### Link 2 — Patterns graduate from findings to lessons

**Graduation rule:**
- 1 occurrence → note in session record
- 3+ occurrences across different sessions → add to `planning/LESSONS.md` with `[pending]`
- Graduated → mark with destination: `[graduated → playbook > X]` or `[graduated → skill > X]` or `[graduated → protocol > X]`

The pre-commit hook validates graduation format. A lesson without a destination cannot be committed.

### Link 3 — Lessons land in the right place

| Destination | When to use |
|---|---|
| `playbook > What NOT to do` | Project-specific anti-pattern (e.g., "never recreate primitives that already exist in @repo/ui") |
| `playbook > Design System` | Visual/token rule (e.g., "never use hardcoded Tailwind palette classes") |
| `skill > [skill-name]` | Workflow rule that applies across projects (e.g., "always run tsc before reporting done") |
| `protocol > [section]` | Universal development rule that applies to all agents on all projects |

Graduated lessons must appear verbatim in the destination file — not paraphrased.

### Link 4 — Builder loads the playbook

`dev-builder` SKILL.md requires loading `dev.playbook.md` as the first action of every session (before writing any code). This is the enforcement point — the agent reads `What NOT to do` before touching the codebase.

If the playbook doesn't exist in the project, `dev-builder` stops and asks. This is non-negotiable.

---

## Required files per project

| File | Role in flywheel |
|---|---|
| `docs/AUDIT-MATRIX.md` | Link 1 — live findings |
| `docs/audit/YYYY-MM-DD.md` | Link 1 — session history |
| `docs/audit/TEMPLATE.md` | Link 1 — session structure |
| `planning/LESSONS.md` | Link 2 — corrections inbox |
| `dev.playbook.md` | Link 3 — agent permanent memory |
| `dev-builder` SKILL.md (Context Loading) | Link 4 — enforcement point |

---

## Setup

```bash
# 1. Create audit structure
mkdir -p your-project/docs/audit
cp level-2-production/templates/audit-matrix.template.md your-project/docs/AUDIT-MATRIX.md
cp level-2-production/templates/audit-session.template.md your-project/docs/audit/TEMPLATE.md

# 2. Create playbook (if not already done)
cp level-2-production/templates/playbook.template.md your-project/dev.playbook.md

# 3. Ensure LESSONS.md exists
touch your-project/planning/LESSONS.md

# 4. Ensure dev-builder skill has Context Loading section
# See: skills/dev-builder/SKILL.md — Context Loading
```

---

## Verification

Run this check after setup. Each answer must be YES:

1. Does `docs/AUDIT-MATRIX.md` exist with a severity table and coverage table? **YES / NO**
2. Does `docs/audit/TEMPLATE.md` exist with all sections? **YES / NO**
3. Does `planning/LESSONS.md` exist? **YES / NO**
4. Does `dev.playbook.md` have a `What NOT to do` section? **YES / NO**
5. Does `dev-builder` SKILL.md have a `## Context Loading` section that loads the playbook? **YES / NO**

If any answer is NO, the flywheel has a broken link. Fix before running the first audit.

---

## Coverage score formula

For each surface in the coverage table:

```
score = (S1 findings × 3) + (S2 findings × 1)
```

Score 0 = clean. Surfaces with the highest score are audit priority.

---

## Specialized audits

Surface audits (reviewing one page) and specialized audits (reviewing one category across all surfaces) both feed the same flywheel. The difference is the entry point:

| Mode | Entry point | Checklist |
|---|---|---|
| Surface | `AUDIT-MATRIX.md` coverage table — pick least-audited surface | none (use full template) |
| Specialized | `docs/audit/checklists/[category].md` | pre-written grep commands + visual checks |

**Checklists are living documents.** After each specialized audit:
- Add items for findings that weren't covered by any existing item `[from: A-XXX]`
- Mark items `[candidate: remove]` if they caught nothing in 3 consecutive sessions

The checklist itself is subject to the flywheel — it improves from every session that uses it.

Starter checklists: `design`, `typescript`, `backend`, `layout`. Add new ones when a category accumulates 3+ uncovered findings.

## References

- `dev-qa/SKILL.md` — Phase 8: Product Audit (surface + specialized audit protocol)
- `docs/audit/checklists/` — specialized audit checklists (living documents)
- `level-2-production/templates/playbook.template.md` — playbook structure
- `planning/LESSONS.md` — corrections inbox with graduation model
