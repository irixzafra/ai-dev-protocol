# Skill: dev-design

> Use when generating, reviewing, or polishing any visible UI.
> Load this alongside your project playbook for stack-specific context.

## When to activate

- Generating new UI components or pages
- Reviewing AI-generated frontend output
- Auditing visual consistency across the app
- Designing dashboards, forms, empty states, or data displays

## References to load

| File | Use when |
|---|---|
| `references/uncodixify.md` | Any time you generate or review UI — check against the 10 anti-patterns |
| `your-project/playbook/design.md` | Always — for project-specific tokens, spacing scale, and component library |

## Core rules (apply regardless of stack)

1. **No decorative elements** — every visual element must carry information or afford interaction. If it only exists to look nice, remove it.
2. **Consistent spacing scale** — use your design token scale (e.g., 4/8/16/24/32px). Never invent ad-hoc values.
3. **Hierarchy before style** — establish visual hierarchy (size, weight, contrast) before adding color or decoration.
4. **Empty states are content** — every list, table, or feed needs a designed empty state. "No data" is not acceptable.
5. **Accessible contrast** — text must meet WCAG AA (4.5:1 for body, 3:1 for large text). Test in both light and dark mode.
6. **One accent color** — a second accent is almost always decoration. Use neutrals for secondary actions.

## The Uncodixify check

Before marking any UI task as done, verify against the 10 anti-patterns in `references/uncodixify.md`.
If any pattern is present, fix it — do not ship it.

## Stub: fill in your stack

```
# In your project playbook:

## Design system
- Component library: [e.g., shadcn/ui, Radix, MUI, custom]
- Token file: [e.g., globals.css, tailwind.config.ts]
- Spacing scale: [e.g., Tailwind default, 4px base]
- Border radius: [e.g., --radius: 0.5rem]

## Patterns we use
- [e.g., "Cards never have box-shadow — use border + background"]
- [e.g., "Empty states always use the shared <EmptyState> component"]
- [e.g., "Dark mode via .dark class on <html> — all colors via CSS variables"]
```
