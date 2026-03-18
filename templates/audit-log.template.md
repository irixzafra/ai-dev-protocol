# Audit Log — Compliance Matrix

> **What:** Every agent appends an entry after completing any task (protocol §4b).
> **Why:** Pattern detection — when the same failure repeats 3+, it graduates to enforcement.
> **When to review:** Every 10 tasks or weekly (protocol §4c — curation review).
> **On/off:** Set `compliance: off` in your CLAUDE.md to disable during emergency sprints.

---

## How to append an entry

After your post-mortem, append one block. Use `-` for questions that don't apply to your task size.

```markdown
### YYYY-MM-DD | agent-id | TASK-ID | SIZE | X/Y

| Dim | # | Result | Detail |
|-----|---|:------:|--------|
| A   | A1 | Y | spec S042 |
| B   | B2 | N | committed before lint |
| C   | C1 | G1 G3 | G2 skipped |

Failures: B2 — committed before running lint, fixed in 2nd commit
Closure: LMWD
```

**Which questions per size:**
- **NANO:** B4, C1 only
- **MINI:** B1-B4, C1-C2
- **FULL:** A1-A4, B1-B4, C1-C3, D1-D2
- **AUTO:** A1, B1-B4, C1-C3

**Question reference:**
- A1 spec exists · A2 asked questions · A3 read context · A4 sized correctly
- B1 grep before create · B2 build→verify→commit · B3 scope discipline · B4 no anti-patterns
- C1 gates run (list which) · C2 diff matches spec · C3 state updated
- D1 phases in order · D2 lessons generated

---

## Entries

<!-- agents: append entries below this line -->

---

## Pattern Analysis (fill during curation review)

### Failure frequency

| # | Question | Total N | Agents | Graduated? | Enforcement |
|----|----------|--------:|--------|:----------:|-------------|
| A1 | Spec exists | | | | |
| A2 | Asked questions | | | | |
| A3 | Read context | | | | |
| A4 | Sized correctly | | | | |
| B1 | Grep before create | | | | |
| B2 | Build→Verify→Commit | | | | |
| B3 | Scope discipline | | | | |
| B4 | No anti-patterns | | | | |
| C1 | Gates run | | | | |
| C2 | Diff matches spec | | | | |
| C3 | State updated | | | | |
| D1 | Phases in order | | | | |
| D2 | Lessons generated | | | | |

### Gate execution

| Gate | Run | Skipped | Failed | Skip % | Action |
|------|----:|--------:|-------:|-------:|--------|
| G1 Type-check | | | | | |
| G2 Lint | | | | | |
| G3 Secrets | | | | | |
| G4 Browser | | | | | |
| G5 Scope | | | | | |

### Agent health

| Agent | Tasks | Avg score | Worst question | Trend |
|-------|------:|----------:|----------------|-------|

### By task size

| Size | Tasks | Avg score | Worst question |
|------|------:|----------:|----------------|
| NANO | | | |
| MINI | | | |
| FULL | | | |
| AUTO | | | |

---

## Graduation Log

| Date | Pattern | Count | Graduated to | Commit | Verified? |
|------|---------|------:|--------------|--------|:---------:|

---

## Curation Reviews

| Date | Tasks reviewed | Avg score | Graduated | Reviewer |
|------|---------------:|----------:|----------:|----------|
