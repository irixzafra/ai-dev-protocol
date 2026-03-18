# Audit Log — Compliance Matrix

> **What:** Every agent appends a row after completing any task (protocol §4b).
> **Why:** Pattern detection — when the same failure repeats 3+, it graduates to enforcement.
> **When to review:** Every 10 tasks or weekly (protocol §4c — curation review).

---

## Legend

**Task size determines which columns apply:**

| Size | Columns to fill |
|------|----------------|
| NANO | B4, C1 |
| MINI | B1-B4, C1-C2 |
| FULL | A1-A4, B1-B4, C1-C3, D1-D2 |
| AUTO | A1, B1-B4, C1-C3 |

**Values:** `Y` = yes/clean, `N` = no/violation, `-` = N/A for this task size

**Gates (C1):** `G1 G2 G3` = gates actually run. Omit = not run.

**Closure:** `L`ESSONS `M`EMORY `W`ORKBOARD `D`ev-log. Uppercase = done, lowercase = skipped.

### Dimension reference
- **A — Requirements:** A1 spec exists, A2 asked questions, A3 read context, A4 sized correctly
- **B — Execution:** B1 grep before create, B2 build→verify→commit order, B3 scope discipline, B4 no anti-patterns
- **C — Verification:** C1 gates run (not assumed), C2 diff matches spec, C3 state updated
- **D — Cycle:** D1 phases in order, D2 lessons generated

---

## Matrix

| Date | Agent | Task | Size | Files | A1 | A2 | A3 | A4 | B1 | B2 | B3 | B4 | C1 | C2 | C3 | D1 | D2 | Score | Closure | Failures | Notes |
|------|-------|------|------|------:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:---|:--:|:--:|:--:|:--:|------:|---------|----------|-------|
| <!-- agents: append one row per completed task below this line --> |

---

## Pattern Analysis (fill during curation review — every 10 tasks or weekly)

### Failure frequency by question

| Question | Description | Total N | Agents affected | Graduated? | Enforcement |
|----------|-------------|--------:|-----------------|:----------:|-------------|
| A1 | Spec/tracker exists | | | | |
| A2 | Asked questions | | | | |
| A3 | Read context | | | | |
| A4 | Sized correctly | | | | |
| B1 | Grep before create | | | | |
| B2 | Build→Verify→Commit | | | | |
| B3 | Scope discipline | | | | |
| B4 | No anti-patterns | | | | |
| C1 | Gates actually run | | | | |
| C2 | Diff matches spec | | | | |
| C3 | State updated | | | | |
| D1 | Phases in order | | | | |
| D2 | Lessons generated | | | | |

### Gate execution rate

| Gate | Times run | Times skipped | Times failed | Skip rate | Action |
|------|----------:|--------------:|-------------:|----------:|--------|
| G1 Type-check | | | | | |
| G2 Lint | | | | | |
| G3 Secrets | | | | | |
| G4 Browser | | | | | |
| G5 Scope | | | | | |

### Agent performance (last 30 days)

| Agent | Tasks | Avg Score | Worst dimension | Trend (vs prev period) |
|-------|------:|----------:|-----------------|------------------------|
| | | | | |

### Performance by task size

| Size | Tasks | Avg Score | Worst question | Notes |
|------|------:|----------:|----------------|-------|
| NANO | | | | |
| MINI | | | | |
| FULL | | | | |
| AUTO | | | | |

---

## Graduation Log

When a pattern hits 3+ occurrences, the curation review graduates it to enforcement:

| Date | Pattern | Occurrences | Graduated to | Commit | Verified? |
|------|---------|------------:|--------------|--------|:---------:|
| <!-- example: --> |
| <!-- 2026-03-20 | B2 commit before verify | 5 | pre-commit hook: tsc must pass before commit allowed | abc1234 | Y --> |

---

## Curation Review History

| Date | Tasks reviewed | Avg score | Patterns graduated | Reviewer |
|------|---------------:|----------:|-------------------:|----------|
| <!-- append after each curation review --> |
