# Private Product Mode

Use this file for any the active project private product surface.

## Brand & Design Intent (read alongside this file)

| Reference | When to load |
|---|---|
| `brand-visual-dna.md` | Mandatory for any typography, color, spacing, or geometry decision |
| `ux-architecture.md` | Mandatory for layout decisions, panel strategy, empty states, complexity management |
| `motion-system.md` | Mandatory when adding or modifying animations, transitions, skeletons, or feedback |

## North star

the active project must feel like a real work OS:
- one private grammar
- one app shell language
- few patterns, highly resolved
- direct naming
- no chrome duplication
- no provisional vocabulary

The goal is not to make a page prettier.
The goal is to make the active project feel more like one product.

## Canonical grammar

- `PageLayout` is the canonical host for private surfaces
- only 3 active variants exist:
  - `Overview`
  - `Workbench`
  - `Data`
- `Workbench` surfaces must feel like family
- `Data` surfaces must feel like family
- the right panel is always `Inspector`
- AI must not compete with itself:
  - global FAB or local contextual interaction
  - never two layers fighting for attention

## First questions before touching code

1. What system problem does this request reveal?
2. What canonical pattern already exists?
3. Which primitive or host should own the solution?
4. What must not be duplicated?
5. What is the minimum change that improves coherence?

If the answer points to a shared primitive, do not patch a single route and pretend the system is fixed.

## Classification

Every visible UI change must be classified as:

### `local-safe`
- contained to one surface
- no new naming
- no new primitive
- no shell behavior change

### `surface-family`
- affects a family such as `Workbench` or `Data`
- should improve multiple routes in the same language
- may require one shared component adjustment

### `shared-shell-or-primitive`
- affects `PageLayout`, shared panels, headers, tabs, inspectors, empty-state patterns, or system-wide visual grammar
- must be solved at the common host or primitive

## Shared UI policy

### Allowed
- extending a primitive
- tightening spacing scales
- renaming ambiguous visible labels
- collapsing two patterns into one
- removing obsolete wrappers

### Not allowed
- new bespoke rail for one route
- new header style for one module
- new footer style for one module
- new local naming for an already solved problem
- duplicating interactions that differ only cosmetically

## New primitive gate

Only create a new primitive if all are true:
- no existing primitive is sufficient
- the pattern is reusable
- it will serve at least one family, not one screen only
- it removes or prevents duplication
- it has canonical naming
- a first real consumer is absorbed in the same batch

Mandatory justification:
- problem
- alternatives checked
- reuse failure reason
- planned consumers
- duplicate removed
- naming
- doc owner

## Naming rules

- one name per problem
- visible labels must be direct and human
- internal naming should not drift from visible semantics
- no `Future`, `Temp`, `V2`, `Context rail`, `assistant panel`, `secondary future dock`, or similar sloppy aliases once a canonical name exists

If a name is ambiguous or technical:
- rename it
- absorb the alias
- record the decision if shared

## Design system rules

All visible work must use the design system for:
- type scale
- spacing
- control heights
- border radius
- surface elevation
- semantic color
- state styles

If a rule is missing:
- define the smallest necessary addition
- anchor it with a concrete example
- keep it reusable

Do not invent values ad hoc.

## Contrast and theme rules

- WCAG 2.2 AA minimum
- interactive states must remain clear in hover, focus, active, selected, disabled
- color cannot be the only carrier of meaning
- if light and dark both exist, verify both
- if dark is not shipped yet, do not fake "dark-ready" styling that has not been tested

## Cleanup rule

Every batch must try to leave the system cleaner than before.

When safe and in scope:
- remove obsolete wrappers
- absorb duplicated UI into shared primitives
- rename misleading labels
- delete dead visual branches
- collapse parallel patterns

If cleanup is not safe in the current batch:
- record it explicitly in the active cleanup tracker
- do not leave it as oral memory

## Documentation rule

If the batch changes:
- shared naming
- a primitive
- shell behavior
- a cross-surface pattern

Then:
- update `planning/MEMORY.md`
- update the owning spec/ADR if needed
- use `dev-docs-governor` if there is risk of duplicated authority

## Sprint and batch discipline

Preferred order:
1. primitive or shared shell
2. canonical consumer
3. family adoption
4. cleanup and renaming
5. documentation trace

Do not run giant amorphous design sweeps.
Run small auditable batches.

## Required QA

Follow `responsive-qa.md` for all responsive and layout validation.

Always:
- type-check
- relevant tests
- browser QA for visible changes

## Definition of done

The batch is only done if:
- the active project feels more like one app
- the number of patterns is reduced
- the naming is clearer
- the system is simpler
- the visual result has stronger contrast and cleaner hierarchy
- no silent duplication was introduced
