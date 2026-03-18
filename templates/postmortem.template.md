# Post-mortem — {TASK-ID}

**Agent:** {agentId}
**Date:** YYYY-MM-DD
**Task type:** NANO / MINI / FULL / AUTO

---

## Self-audit

| # | Question | Answer |
|---|---|---|
| 1 | Did I work with an approved spec or tracker-backed task? | yes / no — [detail if no] |
| 2 | Did I grep before creating every new file? | yes / no — [which files skipped] |
| 3 | Did I follow Build→Verify→Commit order? | yes / no — [where order broke] |
| 4 | Did I introduce anti-patterns (any, hex, >300 LOC, console.log)? | clean / [list violations] |
| 5 | Which gates did I actually run? | G1 ✓/✗  G2 ✓/✗  G3 ✓/✗  G4 N/A  G5 ✓/✗ |

**Score:** X/5

---

## Failures (one entry per "no" answer)

### Failure: Q{N} — {short description}

- **What I did:** [concrete action]
- **What I should have done:** [per protocol]
- **Why it happened:** [root cause — not excuse]
- **Lesson captured in LESSONS.md:** yes / no
- **Graduation target:** [hook / gate / protocol rule that would prevent this]

---

## Pattern detection

Is this failure similar to failures from previous post-mortems?
- [ ] First occurrence — capture as lesson
- [ ] Second occurrence — flag for graduation review
- [ ] Third+ occurrence — **MUST graduate to enforcement now**

If graduating: describe the enforcement mechanism (hook check, gate addition, protocol rule update).

---

## Proposed improvements

| What | Type | Priority |
|------|------|----------|
| [improvement] | hook / gate / protocol rule / template | P0 / P1 / P2 |

---

## Summary

**Score:** X/5
**Lessons captured:** [count]
**Graduated:** [count] lessons → [destinations]
**MEMORY updated:** yes / no
**Improvements proposed:** [count]
