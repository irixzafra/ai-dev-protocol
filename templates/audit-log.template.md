# Audit Log — Post-mortem Matrix

> **What:** Every agent appends a row after completing any task.
> **Why:** Pattern detection — when the same failure repeats 3+ times, it graduates to enforcement.
> **How to read:** Sort by Score ascending to find systemic weaknesses. Filter by column to find per-agent or per-gate patterns.

---

## Legend

| Column | Values |
|--------|--------|
| **Size** | NANO / MINI / FULL / AUTO |
| **Q1-Q5** | `Y` = yes/clean, `N` = no/violation, `-` = N/A |
| **G1-G5** | `P` = pass, `F` = fail, `S` = skip, `-` = N/A |
| **Score** | 0-5 (count of Y in Q1-Q5) |
| **Closure** | `L` = LESSONS, `M` = MEMORY, `W` = WORKBOARD, `D` = dev-log. Uppercase = done, lowercase = skipped |

### Questions (Q1-Q5)
- **Q1:** Approved spec or tracker-backed task?
- **Q2:** Grep before creating new files?
- **Q3:** Build→Verify→Commit order respected?
- **Q4:** Zero anti-patterns introduced (any, hex, >300 LOC, console.log)?
- **Q5:** All applicable gates actually run (not assumed)?

---

## Matrix

| Date | Agent | Task | Size | Files | Q1 | Q2 | Q3 | Q4 | Q5 | G1 | G2 | G3 | G4 | G5 | Score | Closure | Lesson graduated? | Notes |
|------|-------|------|------|------:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|------:|---------|-------------------|-------|
| <!-- agents append rows below this line --> |

---

## Pattern Analysis (updated when 5+ rows accumulate)

### Failure frequency

| Question | Total N | Agents affected | Graduated? | Action |
|----------|--------:|-----------------|------------|--------|
| Q1 Spec | | | | |
| Q2 Grep | | | | |
| Q3 Order | | | | |
| Q4 Anti-patterns | | | | |
| Q5 Gates honest | | | | |

### Gate skip frequency

| Gate | Total S or F | Root cause | Graduated? | Action |
|------|-------------:|------------|------------|--------|
| G1 Type-check | | | | |
| G2 Lint | | | | |
| G3 Secrets | | | | |
| G4 Browser | | | | |
| G5 Scope | | | | |

### Agent performance

| Agent | Tasks | Avg Score | Most common failure | Trend |
|-------|------:|----------:|---------------------|-------|
| | | | | |

---

## Graduation log

When a pattern hits 3+ occurrences, document the enforcement here:

| Date | Pattern | Occurrences | Graduated to | Commit |
|------|---------|------------:|-------------|--------|
| <!-- example: 2026-03-18 | G2 skipped | 4 | pre-push hook runs lint | abc1234 --> |
