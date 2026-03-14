# Skill: dev-accessibility

> Use when generating or reviewing any UI component, page, or interactive element.
> Accessibility is not a post-processing step — it must be built in from the start.
> LLMs generate inaccessible UI by default. This skill prevents that.

## When to activate

- Building any UI component with interactive elements (buttons, forms, modals, dropdowns)
- Generating page layouts or navigation
- Reviewing existing components for a11y
- Any component that changes state visually (loading, error, empty, success)

## References to load

| File | Use when |
|---|---|
| `references/wcag-checklist.md` | Reviewing any interactive component |
| `your-project/playbook.md` | For project-specific design system and component library |

## Core rules

1. **Every interactive element needs a label** — buttons, links, inputs, and icon-only controls must have text or `aria-label`. "X" is not a label. "Close dialog" is.
2. **Focus is always visible** — never `outline: none` without a replacement. Keyboard users must see where they are.
3. **Color is never the only signal** — error states need more than red. Success needs more than green. Add icons, text, or patterns.
4. **Heading hierarchy is a document structure** — `<h1>` once per page. `<h2>` for sections. Never skip levels for visual sizing — use CSS for that.
5. **Images need alt text** — decorative images get `alt=""`. Informative images get a description. Icons that convey meaning need `aria-label`.
6. **ARIA only when HTML semantics aren't enough** — use `<button>` before `role="button"`. Use `<nav>` before `role="navigation"`. ARIA supplements, it doesn't replace.
7. **Dynamic changes need announcements** — when content updates (loading done, error appeared, modal opened), use `aria-live` regions or focus management so screen readers know.
