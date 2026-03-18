# Product Mode — dev-builder

> Canonical governance for any dev-builder task that touches **visible product work**.
> For the complete visual governance including contrast, responsive QA, and theme rules,
> see `dev-design/references/project-private-product.md`.

---

## What counts as visible product work

Any change that affects what a logged-in user sees in the browser:

**Included:** pages, components, shells, headers, sidebars, panels, empty states,
loading states, error states, form layouts.

**Excluded:** server actions (unless they change the response shape consumed by UI),
database schema, engine logic, test files.

If your task is excluded, skip this file — the rest of dev-builder's protocol is sufficient.

---

## Classification rubric

Classify every visible UI change before building. Pick exactly one.

### `local-safe`

Contained to one surface. No new naming. No new primitive. No shell behavior change.
Examples: fixing a typo in a label, adjusting padding on a single card, adding a
tooltip to an existing button.

### `surface-family`

Affects a family (`Workbench` or `Data`). Should improve multiple routes that share
the same visual language. May require one shared component adjustment.
Examples: aligning all Workbench rail widths, normalizing empty-state illustrations
across Data pages.

### `shared-shell-or-primitive`

Affects `PageLayout`, shared panels, headers, tabs, inspectors, empty-state patterns,
or system-wide visual grammar. Must be solved at the common host or primitive — never
patched at a single consumer.
Examples: adding a new slot to PageLayout, changing the Inspector collapse behavior,
introducing a new toolbar variant.

---

## New primitive gate (7 criteria)

Only create a new primitive if you can answer ALL seven:

| # | Question | What a valid answer looks like |
|---|----------|-------------------------------|
| 1 | What system problem does it solve? | A concrete pattern gap, not "it was faster" |
| 2 | Which existing primitive was considered? | Name + file path |
| 3 | Why is extension insufficient? | Specific technical or semantic reason |
| 4 | How many real consumers will it have? | At least one family, not one screen |
| 5 | What duplicate does it eliminate? | Name of the old thing it replaces |
| 6 | What is its canonical name? | Single, direct, human-readable |
| 7 | What documentation owns it? | File path of the spec or ADR |

If any answer is missing or weak, do not create the primitive. Extend an existing one
or escalate to the user with your analysis.

---

## Naming rules

- **One name per problem.** If an existing name covers the concept, use it.
- **Visible labels must be direct and human.** No jargon unless the domain requires it.
- **Internal naming must not drift from visible semantics.** The component name should
  match what the user reads.
- **Forbidden aliases:** `Future`, `Temp`, `V2`, `Context rail`, `assistant panel`,
  `secondary future dock`, or any similar sloppy alias once a canonical name exists.
- **If a name is ambiguous or technical:** rename it, absorb the alias, record the
  decision if shared.

---

## Pattern reuse protocol

Before creating any new component for visible product:

```bash
# 1. Search shared packages first
grep -r 'ComponentName' packages/ui/src/ packages/core/

# 2. Search platform components
grep -r 'ComponentName' apps/platform/components/ apps/platform/app/

# 3. Check if the visual pattern already exists under a different name
# Look at siblings in the same surface family
```

If a match exists: extend it. If near-match exists: adapt it. If nothing exists and
the 7-criterion gate passes: create it in the correct package.

---

## Cleanup rule

Every batch that touches visible product must try to leave the system cleaner.

When safe and in scope:
- Remove obsolete wrappers
- Absorb duplicated UI into shared primitives
- Rename misleading labels
- Delete dead visual branches
- Collapse parallel patterns

If cleanup is **not** safe in the current batch:
- Record it explicitly in `planning/WORKBOARD.md`
- Do not leave it as oral memory or a TODO comment

---

## Documentation impact triggers

If your batch changes any of the following, you must update docs before the commit:

| Changed | Update |
|---------|--------|
| Shared naming | `planning/MEMORY.md` |
| A primitive | `planning/MEMORY.md` + owning spec |
| Shell behavior | `planning/MEMORY.md` + owning spec or ADR |
| A cross-surface pattern | `planning/MEMORY.md` + owning spec or ADR |
| An expensive-to-reverse decision | Create or update ADR in `specs/decisions/` |

If there is risk of duplicated authority across docs, flag it to the user.
