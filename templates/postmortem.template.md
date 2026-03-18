# Post-mortem — {TASK-ID}

**Agent:** {agentId} | **Date:** YYYY-MM-DD | **Size:** NANO / MINI / FULL / AUTO

---

## Self-audit

### A — Requirements (FULL and AUTO only)

| # | Question | Answer |
|---|---|---|
| A1 | Approved spec/tracker before starting? | Y / N — [detail] |
| A2 | Asked clarification questions or assumed? | Y / N — [detail] |
| A3 | Read MEMORY, LESSONS, playbook before planning? | Y / N — [what skipped] |
| A4 | Classified task size correctly? | Y / N — [actual vs declared] |

### B — Execution (MINI, FULL, AUTO)

| # | Question | Answer |
|---|---|---|
| B1 | Grep before creating every new file? | Y / N — [which files] |
| B2 | Build→Verify→Commit order respected? | Y / N — [where broken] |
| B3 | Stayed within declared scope? | Y / N — [what leaked] |
| B4 | Zero anti-patterns introduced? | clean / [list: any, hex, >300 LOC, console.log] |

### C — Verification (all sizes)

| # | Question | Answer |
|---|---|---|
| C1 | Gates actually run (not assumed)? | G1 ✓/✗  G2 ✓/✗  G3 ✓/✗  G4 -  G5 ✓/✗ |
| C2 | `git diff --stat` matches spec? | Y / N — [deviation] |
| C3 | WORKBOARD/MEMORY/LESSONS updated? | Y / N — [what skipped] |

### D — Cycle integrity (FULL only)

| # | Question | Answer |
|---|---|---|
| D1 | Followed phases in order? (Define→Plan→Build→Verify→Close) | Y / N — [which skipped] |
| D2 | Generated lessons for things that went wrong? | Y / N — [count] |

---

## Score: X / Y

## Failures (one entry per N answer)

### {Q#} — {short description}

- **What I did:** [concrete action]
- **What I should have done:** [per protocol]
- **Root cause:** [why — not excuse]
- **Lesson in LESSONS.md:** yes — graduation target: [where]
- **Repeat?** First / Second / **Third+ → MUST graduate now**

---

## Closure checklist

- [ ] LESSONS.md updated
- [ ] MEMORY.md updated
- [ ] WORKBOARD.md updated (task marked done)
- [ ] dev-log.md entry appended
- [ ] Audit log row appended to planning/audit-log.md
