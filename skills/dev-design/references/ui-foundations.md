# UI Foundations

Use this file when the task is to create or normalize the visual system of an application.

## Page shells

- Use a single shell language for all related private pages.
- Keep content widths intentional:
  - wide data/admin views: `1200-1440px`
  - reading/course/detail views: `880-1180px`
  - forms: narrower when it improves comprehension
- Keep page padding consistent by breakpoint.
- Use stable alignment anchors for title, helper text, filters, and actions.

## Typography

- Use no more than:
  - `1` display style
  - `2-3` heading sizes
  - `1` body size family
  - `1` small/meta size
- Keep line-height generous enough for reading, tighter for dashboards.
- Use serif only when it is clearly part of the brand voice; otherwise default to a strong sans.
- Do not mix too many font personalities in the same shell.

## Color

- Define:
  - `background`
  - `surface`
  - `surface-muted`
  - `text`
  - `text-muted`
  - `line`
  - `primary`
  - `accent`
  - semantic success/warning/error
- Keep semantic colors reserved for meaning, not decoration.
- Use contrast to create hierarchy, not saturation alone.
- Contrast must support the job of the surface:
  - calm for long reading
  - standard for trust and general product UI
  - strong for operational state and decisive CTAs
- Avoid glare pairs such as pure black on pure white or pure white on pure black for sustained reading surfaces.
- A beautiful app should feel easy on the eye after five minutes, not just impressive in the first ten seconds.

## Spacing and rhythm

- Use a small spacing scale and repeat it.
- Align cards, tables, filters, and forms to the same grid logic.
- Prefer consistent vertical rhythm over highly custom section spacing.
- If the UI feels amateur, first check inconsistent padding before changing colors.

## Cards and surfaces

- Reserve strong shadows for major elevation only.
- Use subtle borders when the UI is dense.
- Keep radius consistent across cards, inputs, and dialogs.
- Avoid "glassmorphism" or heavy effects unless the whole product clearly supports it.

## Navigation

- One primary navigation source per context.
- Remove duplicated menus between theme shell and app shell.
- Sidebar navigation must clearly show:
  - where the user is
  - what belongs to the current section
  - what is secondary
- Topbars should not compete with the main page title.

## Forms

- Keep labels always visible.
- Put helper text below the label or field, not hidden in placeholders.
- Group fields by mental model, not by database structure.
- Inline editing is best for:
  - low-risk
  - frequent
  - obvious
  actions.
- Use full edit screens for complex or destructive changes.

## Data-heavy views

- Improve scan speed with:
  - grouping
  - sticky headers where useful
  - stronger label/value contrast
  - consistent chip/status patterns
- Reduce noise before reducing font size.
- Long admin pages should feel operational, not decorative.

## States

Every serious screen should have clean:

- empty states
- loading states
- success feedback
- validation feedback
- blocked/suspended states

Good empty state formula:

1. what this section is
2. why it is empty
3. what the user can do next

## Pixel-perfection checklist

- Edges align to the same grid.
- Titles, metadata, and actions share anchors.
- Icons are visually balanced with text.
- Buttons share height and padding logic.
- Card headers and bodies have stable spacing.
- Section gaps feel intentional and repeatable.
- Nothing looks nudged, random, or "almost centered."

---

## Accessibility + Neurodivergence

### WCAG 2.2 AA (minimum, mandatory)

- [ ] Contrast normal text >= 4.5:1
- [ ] Contrast large text >= 3:1
- [ ] Contrast non-text (icons, active borders) >= 3:1
- [ ] Touch targets >= 44x44px
- [ ] Focus visible: `focus-visible:ring-2 ring-accent` on all interactive elements
- [ ] Semantic HTML: `nav`, `main`, `section`, `article`, `h1->h6`
- [ ] `alt` on images, `aria-label` where text is insufficient
- [ ] Target size 2.5.8: >= 24x24px with spacing

### Comfort contrast (required beyond WCAG)

- [ ] Long-reading surfaces avoid glare-heavy contrast pairs
- [ ] Muted text used persistently still reads comfortably without strain
- [ ] Selected states, focus rings, and active filters are readable in both light and dark themes
- [ ] Color temperature matches the product objective; do not use cold, harsh palettes for calm editorial experiences
- [ ] Contrast is checked against the actual background/surface it sits on, not just against the page root
- [ ] Surface contrast supports the intent: calm, standard, or strong

### Neurodivergence

- [ ] `prefers-reduced-motion` -> disable all non-essential animations
- [ ] Focus mode: option to hide distracting elements (sidebar, banners)
- [ ] High contrast: support `prefers-contrast: high`
- [ ] No autoplay of video/animation
- [ ] Sufficient reading time (no auto-dismiss on messages)
- [ ] Descriptive link text (no "click here")

### Automated contrast audit

When delivering any design, report:

```
"Contrast verified:
  - main text vs background: X.X:1 (req. 4.5:1)
  - muted persistent text vs background: X.X:1
  - accent vs dark background: X.X:1
  - button text vs button bg: X.X:1"
```

Also report:

```
"Comfort posture:
  - surface intent: [conversion/action/editorial/trust/ops]
  - contrast posture: [calm/standard/strong]
  - eye-strain risk: low/medium/high
  - note: [why this contrast level fits the surface]"
```
