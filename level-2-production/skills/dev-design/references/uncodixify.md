# Uncodixify — AI-Generated UI Sins to Avoid

> These are the 10 patterns LLMs produce by default.
> Every one of them makes an interface look cheap, generic, and unshipped.
> Scan for all 10 before any UI ships.

---

## 1. Floating cards with excessive shadow

**Symptom:** Every card has `shadow-xl` or `shadow-2xl`.
**Why cheap:** Heavy shadows = 2015. Modern pro tools use border + subtle background tint.
**Instead:** `border border-border/60` + `bg-card`. Reserve `shadow-md+` for popovers/dialogs that genuinely float above content.

---

## 2. `rounded-2xl` / `rounded-3xl` on everything

**Symptom:** Every button, card, input, badge has a pill or near-circle radius.
**Why cheap:** Aggressive rounding is a mobile-app default. Desktop pro tools (Linear, Notion, Figma) use `rounded` (4px) to `rounded-md` (6px) for controls.
**Instead:** `rounded` for controls, `rounded-lg` for cards/panels, `rounded-xl` sparingly for feature blocks. Never `rounded-3xl` for functional UI.

---

## 3. Gradient dashboards

**Symptom:** Dashboard hero has full-bleed gradient — purple to teal, dark to darker, radial glow.
**Why cheap:** Private product surfaces are work tools, not marketing pages. Gradients create noise and compete with actual data.
**Instead:** Flat backgrounds with hierarchy through typography and whitespace. If you need rhythm: `border-b` on the header + slightly different surface tone for cards vs canvas.

---

## 4. Decorative labels everywhere

**Symptom:** Every section has a subtitle. Every card has an overline. Labels stack: `SECTION / title / description / button`.
**Why cheap:** Decorative copy signals the structure isn't doing its job.
**Instead:** Labels only when they carry meaning the structure can't express. Omit section headers when visual grouping is already clear.

---

## 5. Gratuitous glassmorphism

**Symptom:** `backdrop-blur-lg` + semi-transparent background on panels, cards, even inline elements — with nothing behind them.
**Why cheap:** Glassmorphism works only with real depth underneath. In an app shell it becomes "blurry gray" with no payoff.
**Instead:** Solid `bg-card` or `bg-background`. Reserve backdrop blur for modals that genuinely overlap rich content.

---

## 6. Icon + label + badge stack

**Symptom:** A single element communicates state with icon, label, AND status badge — 3 signals doing the job of 1.
**Why cheap:** Redundant signaling creates noise and breaks rhythm when some items have badges and others don't.
**Instead:** One primary signal per element. Badge only when state needs a distinct callout (count, error, new). Never all three on the same item.

---

## 7. Inconsistent padding per component

**Symptom:** Each card, row, or panel applies its own padding (`p-3`, `p-4`, `p-6`, `p-8`) without a system.
**Why cheap:** Spacing inconsistency is the #1 signal a UI was assembled by concatenation, not designed as a system.
**Instead:** Pick one density per surface. Compact: `gap-2 / p-3`. Default: `gap-3 / p-4`. Relaxed: `gap-4 / p-6`. Only deviate with justification.

---

## 8. "AI purple" — saturated accent without reason

**Symptom:** Bright indigo/violet appears on buttons, borders, highlights, badges, and hover states simultaneously.
**Why cheap:** High-saturation accents fight each other when used for everything. The UI looks like a template.
**Instead:** Reserve accent for exactly one semantic role: the primary action. Use `text-foreground` / `text-muted-foreground` for supporting elements. If accent appears more than once per screen on average, pull it back.

---

## 9. Stat cards floating in grid without hierarchy

**Symptom:** Dashboard opens with 4-column grid of equal-weight KPI cards.
**Why cheap:** Equal-weight grid gives the user nowhere to look first. Telegraphs "template fill-in."
**Instead:** One primary metric full-width or 2-col, supporting metrics smaller below. Use density and weight contrast, not just color. Group related metrics with a shared container.

---

## 10. Dashboard sections with landing-page headers

**Symptom:** Inside a private app: "Boost your productivity", "Welcome to your workspace", "Everything you need."
**Why cheap:** Private product users are operators. They know what the product is. Marketing copy creates cognitive dissonance after day one.
**Instead:** Functional headers: "Recent activity", "Pending proposals", "Usage this week." State exactly what the section shows.

---

## When does the LLM produce these by default?

- Prompted with "generate a dashboard for X" without a design system constraint
- Copying patterns from Dribbble/Behance (optimized for likes, not daily use)
- Using Tailwind without a config that enforces token usage
- Building a "professional looking" UI without a specific industry reference

## How to use this checklist

Before shipping any UI, scan for all 10. If any are present:
1. Name the pattern
2. Apply the alternative above
3. Verify the result looks like a work tool, not a portfolio piece
