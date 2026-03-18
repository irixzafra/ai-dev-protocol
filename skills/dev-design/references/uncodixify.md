# Uncodixify — AI-Generated UI Sins to Avoid

> These are the 10 patterns LLMs produce by default. Every one of them makes an
> interface look cheap, generic, and unshipped. Avoid all of them.

---

## 1. Floating cards with excessive shadow

**Symptom:** Every card has `shadow-xl` or `shadow-2xl`, giving the UI a
floating, weightless feeling.

**Why it's cheap:** Heavy shadows were a 2015 pattern. Modern pro tools use
elevation via border + subtle background tint, not theatrical drop shadows.

**Instead:** Use `border border-border/60` + `bg-card` or a 1px ring with a
short shadow (`shadow-sm` at most). Reserve `shadow-md+` for popovers and
dialogs that float above the canvas.

---

## 2. `rounded-2xl` / `rounded-3xl` on everything

**Symptom:** Every button, card, input, badge, and container has a pill or
near-circle radius regardless of context.

**Why it's cheap:** Aggressive rounding is a mobile-app default. Pro desktop
tools (Linear, Notion, Figma) use tighter radii — typically `rounded` (4px)
to `rounded-md` (6px) for controls, `rounded-lg` (8px) for cards and panels.

**Instead:** Follow the design token. the active project uses `rounded` for controls,
`rounded-lg` for cards/panels, `rounded-xl` sparingly for feature blocks.
Never `rounded-3xl` for functional UI.

---

## 3. Gradient dashboards

**Symptom:** The main dashboard area has a full-bleed gradient hero — purple to
teal, dark to darker, or background with radial glow — as if it were a landing
page.

**Why it's cheap:** Private product surfaces are work tools, not marketing pages.
Gradients in app interiors create visual noise and compete with actual data.

**Instead:** Flat backgrounds with clear hierarchy through typography and
whitespace. If you need visual rhythm, use a subtle `border-b` on the header and
a slightly different surface tone for cards vs canvas.

---

## 4. Decorative labels everywhere

**Symptom:** Every section has a subtitle. Every card has an overline. Every
action has a descriptor. Labels stack: `SECTION TITLE / Card title / card
description / button`.

**Why it's cheap:** Decorative copy signals that the structure is not doing its
job. If a label exists only to say what the section obviously is, remove it.

**Instead:** Let the content speak. Use labels only when they carry meaning the
structure cannot express on its own (status, type, metadata). Omit section
headers when the visual grouping is already clear.

---

## 5. Gratuitous glassmorphism

**Symptom:** `backdrop-blur-lg` + semi-transparent background on panels, cards,
and even inline elements with no layered content beneath them.

**Why it's cheap:** Glassmorphism works only when there is real visual depth
underneath — a moving background, a full-bleed image. In an app shell it becomes
"blurry gray" with no payoff.

**Instead:** Use solid `bg-card` or `bg-background`. Reserve backdrop blur for
modals and floating panels that genuinely overlap rich content.

---

## 6. Icon + label + badge stack

**Symptom:** A single UI element communicates its state with an icon, a label,
and a status badge — three signals doing the job of one.

**Why it's cheap:** Redundant signaling creates visual noise and makes the UI
feel noisy and untrustworthy. It also breaks rhythm when some items have badges
and others don't.

**Instead:** Pick one primary signal per element. Use the icon for quick
recognition, the label for semantic clarity, and the badge only when state needs
a distinct callout (count, error, new). Never all three on the same item.

---

## 7. Inconsistent padding per component

**Symptom:** Each card, row, or panel applies its own padding values
(`p-3`, `p-4`, `p-6`, `p-8`) without a system. Similar components feel
slightly different from each other.

**Why it's cheap:** Spacing inconsistency is the #1 signal that a UI was
assembled by concatenation rather than designed as a system.

**Instead:** Use the density tokens. In the active project: compact UI uses `gap-2 / p-3`,
default uses `gap-3 / p-4`, and relaxed uses `gap-4 / p-6`. Pick one density
per surface and stick to it. Only deviate with explicit justification.

---

## 8. "AI purple" — saturated accent without reason

**Symptom:** The primary accent color is a bright indigo/violet/purple that
appears on buttons, borders, highlights, badges, and hover states simultaneously.

**Why it's cheap:** High-saturation accents fight each other when used for
everything. The UI looks like a template, not a product.

**Instead:** Reserve the accent color for exactly one semantic role: the primary
action. Use `text-foreground` / `text-muted-foreground` and `bg-muted` for
supporting elements. If the accent appears more than once per screen on average,
pull it back.

---

## 9. Stat cards floating in a grid without hierarchy

**Symptom:** Dashboard opens with a 4-column grid of KPI cards: Revenue / Users /
Conversion / Churn — each floating independently with no visual relationship.

**Why it's cheap:** A grid of equal-weight cards without a primary metric gives
the user nowhere to look first. It telegraphs "template fill-in" rather than
"designed dashboard."

**Instead:** Establish a clear hierarchy: one primary metric full-width or 2-col,
supporting metrics smaller below or to the side. Use density and weight contrast,
not just color, to communicate importance. Group related metrics with a shared
container.

---

## 10. Dashboard sections with landing-page headers

**Symptom:** Inside a private app dashboard, section headers read like marketing
copy: "Boost your productivity", "Welcome to your workspace", "Everything you
need."

**Why it's cheap:** Private product users are operators, not visitors. They know
what the product is. Marketing copy inside a work tool creates cognitive
dissonance and feels patronizing after the first day.

**Instead:** Use functional headers: "Actividad reciente", "Propuestas pendientes",
"Consumo esta semana." State exactly what the section shows. If the section is
empty, use a compact empty state — not a motivational call to action.

---

## When does the LLM produce these by default?

- When prompted with "generate a dashboard for X" without a design system constraint
- When copying patterns from Dribbble/Behance shots (which optimize for likes, not use)
- When using Tailwind without a config that enforces token usage
- When building a "professional looking" UI without a specific industry reference

## Applying this checklist

Before shipping any UI work, scan for all 10. If any are present:
1. Name the pattern
2. Apply the alternative above
3. Verify the result looks like a work tool, not a portfolio piece

**Applies to:** any frontend product.
