# S{NNN} — {Short title}

**Status:** draft | approved | in-progress | done
**Size:** FULL | MINI
**Date:** YYYY-MM-DD
**Sprint:** S{X}.{NN} (reference in WORKBOARD)

---

## What is being built

[1 paragraph max — the concrete deliverable. What changes for the user or the system.]

## What is NOT being built

- [explicit exclusion 1]
- [explicit exclusion 2]
- [anything someone might assume is included but is not]

## Screen (if UI)

[ASCII mockup or description of layout zones affected.]

```
+-----------------------------+
|  [affected zone]            |
|                             |
+-----------------------------+
```

[If no UI, remove this section entirely.]

## Files affected

- `path/to/file.ts` — [what changes in this file]
- `path/to/other.tsx` — [what changes]

## Dependencies

- [Another spec that must be done first: `S{NNN}`]
- [SQL migration required]
- [External API that must be available]

[If no dependencies, remove this section.]

## Risks

- [what could break]
- [duplicates detected with `grep`]
- [impact on other surfaces]

## Acceptance criteria

- [ ] [verifiable criterion 1 — "the user can X"]
- [ ] [verifiable criterion 2]
- [ ] G1: type-check -> 0 errors
- [ ] G2: lint -> 0 warnings
- [ ] G3: no secrets in diff

## Decisions made

[Only if there were costly-to-revert decisions during spec definition.
If the decision is cross-cutting (affects more than this spec), also document in `planning/MEMORY.md`.
If no decisions were made, remove this section.]

---

_Template: `templates/spec.template.md` -- Protocol: `protocol/protocol.md`_
