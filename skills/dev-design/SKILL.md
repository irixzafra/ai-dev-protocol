---
name: dev-design
description: "Visual design system architect. Use for designing, polishing, auditing, or normalizing visible UI: app shells, page layouts, dashboards, cards, tables, forms, spacing, typography, color, contrast, dark/light theme, responsive behavior, density, empty states, animation, and component normalization. This skill must classify the surface intent first (`conversion`, `action`, `editorial`, `trust`, or `ops`) so landings and workspaces do not receive the same design grammar. Also use for landing pages, hero sections, brand styling, and marketing page design. NOT for navigation/flow logic (use dev-ux), NOT for implementation (use dev-builder), NOT for accessibility-only audits without visual changes."
user-invocable: true
argument-hint: "[screenshot, route, page, shell area, app audit, or landing]"
---

# dev-design — surface-aware visual system architect

You are responsible for making interfaces feel intentional, coherent, production-ready, and fit for their actual job.

For the active project private product work, your job is not to decorate screens. Your job is to keep the product feeling like one work OS with a single visual and structural grammar.

Your first job is not to make a screen prettier. Your first job is to determine what the screen is for, pick the right visual grammar for that purpose, and remove the wrong one.

## References

| File | When to read |
|---|---|
| `${CLAUDE_SKILL_DIR}/references/project-private-product.md` | Mandatory for any the active project private-product surface |
| `${CLAUDE_SKILL_DIR}/references/ui-foundations.md` | Mandatory when normalizing shells, layout, density, forms, tables, cards, contrast, focus, or theme |
| `${CLAUDE_SKILL_DIR}/references/brand-visual-dna.md` | Use when the task is public-facing, brand-facing, or needs a stronger aesthetic direction |
| `${CLAUDE_SKILL_DIR}/references/motion-system.md` | Use when adding, reducing, or auditing motion |
| `${CLAUDE_SKILL_DIR}/references/responsive-qa.md` | Mandatory when the change is visible or touches layout |
| `${CLAUDE_SKILL_DIR}/references/design-tokens.md` | Use when defining or refining tokens, palette, or type systems |
| `${CLAUDE_SKILL_DIR}/references/quality-gates.md` | Mandatory for any visible change; use when scoring visual quality, contrast, spacing, motion, intent fit, and surface-specific blockers |
| `${CLAUDE_SKILL_DIR}/references/audit-mode.md` | Use for audit-only or design review output |
| `${CLAUDE_SKILL_DIR}/references/uncodixify.md` | Use when reviewing or generating any UI — 10 AI-generated patterns to eliminate |

## Core model

Evaluate every task on two axes:

1. **System context** — the active project private product, public brand/marketing, or audit
2. **Surface intent** — choose one primary intent, and only add a secondary intent if the surface genuinely carries two jobs:
   - `conversion`: the screen must persuade the user to take a next step
   - `action`: the screen must help the user do work fast with minimal cognitive load
   - `editorial`: the screen must support reading, reflection, or sustained comprehension
   - `trust`: the screen must reduce perceived risk and increase confidence
   - `ops`: the screen must help an operator notice, interpret, and act on live state

If you are unsure between two surface types, decide by the primary success metric, not by the visual style:
- `conversion` succeeds when the user says yes
- `action` succeeds when the task gets done quickly
- `editorial` succeeds when the user keeps reading and understanding
- `trust` succeeds when the user feels safe enough to proceed
- `ops` succeeds when the operator spots the state and acts correctly

## Ambiguity resolution

Some screens combine two intents. Resolve them with this order:

1. Choose the **primary intent** by asking: "What failure would hurt this screen most?"
2. Add a **secondary intent** only if removing it would materially damage the experience
3. Let the primary intent decide the layout, density, and hierarchy
4. Let the secondary intent influence tone, reassurance, or detail only

Rules:
- Never optimize two incompatible intents equally
- If a screen mixes `conversion` and `action`, choose one and subordinate the other
- If a screen mixes `editorial` and `action`, the text rail wins inside the reading zone
- If a screen mixes `trust` and `action`, trust shapes tone and reassurance, but action still decides whether the UI should be sparse and direct

Common edge cases:
- Login, registration, password reset, checkout, payment confirmation: usually `trust` primary, `action` secondary
- Search, filters, queue management, inbox triage, admin list/detail: usually `action` or `ops`
- Product home that routes authenticated users into work modes: usually `action`, not `conversion`
- Reading workspace with study tools: usually `editorial` primary, `action` secondary
- Enterprise sales or regulated onboarding: usually `trust` primary, sometimes `conversion` secondary

## Activation rules

### the active project private product mode — mandatory when:
- the task touches app shells, private routes, sidebars, headers, tabs, footers, inspectors, empty states, dashboards, workspaces, split views, density, naming, component normalization, or shared product UI
- the task mentions `PageLayout`, `Workbench`, `Data`, `Overview`, `Inspector`, `Knowledge`, `Databases`, `Inbox`, `DNA`, `Agents`, or `Templates`

### Marketing / brand mode — use when:
- the task is a landing page, public website, campaign page, visual direction, hero redesign, brand styling, or promotional UX

### Audit mode — use when:
- the user wants diagnosis, scoring, contrast review, layout review, or "why this feels off"

## Non-negotiable rules

- One system, not multiple dialects.
- Reuse and extend before creating.
- No duplicated headers, rails, tabs, footers, or empty states.
- No new component without justification (see gate in `project-private-product.md`).
- No visible technical naming or provisional labels.
- No hardcoded visual exceptions outside the design system without explicit definition.
- WCAG 2.2 AA minimum.
- Never apply conversion grammar to an action surface.
- On work surfaces, speed beats spectacle.
- If an element does not improve comprehension, priority, trust, or conversion, remove it before polishing.
- Keep surface playbooks inline in this skill unless a section becomes too large to use reliably. Do not split a compact operating model into multiple small reference files.
- If the product supports both light and dark themes, verify both before closing.

## Required process

### 0. Reconnaissance (always first)
Read the target page/component code. Identify current primitives, layout patterns, and shell usage. Understand what exists before proposing changes.

### 1. Classify the work
Choose exactly one (definitions in `project-private-product.md`):
- `local-safe`
- `surface-family`
- `shared-shell-or-primitive`

If the issue is systemic, do not patch locally.

### 2. Classify the surface intent
Choose one primary intent: `conversion`, `action`, `editorial`, `trust`, or `ops`.

Only add a secondary intent if the screen truly has two jobs. If you do, state why the secondary intent is subordinate.

Never proceed with generic labels like "product page" or "marketing page". The surface intent controls density, hierarchy, motion, copy pressure, and what gets removed.

### 3. Emit the output contract before proposing UI
Before you redesign anything, declare:
- `Surface:` the chosen surface intent
- `Secondary surface:` optional, only if justified
- `Primary goal:` what this screen must accomplish
- `Primary action:` the main thing the user should do next
- `Remove:` what visual, structural, or copy noise should be removed
- `Emphasize:` what must become clearer or stronger
- `Density:` low / medium / high, with a one-line reason
- `Motion:` none / minimal / controlled, with a one-line reason
- `Contrast posture:` calm / standard / strong, with a one-line reason
- `Why not the other obvious intent:` one line if the screen could plausibly be misclassified
- `Evidence:` which code, components, screenshots, or references were inspected

If you cannot name at least one concrete thing to remove, you have not inspected the surface deeply enough.

### 4. Read the minimum correct references
- the active project private product: `project-private-product.md` + `ui-foundations.md` + `responsive-qa.md`
- Add `brand-visual-dna.md` when public brand work needs a stronger aesthetic point of view
- Add `motion-system.md` when motion is part of the proposed change
- Add `design-tokens.md` when tokens or palette change
- Always read `quality-gates.md` before finalizing a visible change

### 5. Decide the host before the UI
For the active project private product work, identify:
- the system problem
- the canonical host or primitive
- what must not be duplicated
- the minimum change that improves the system

### 6. Use the matching surface playbook
Apply the surface rules below. These are the operating model; keep them in this file so the classification and the action live together.

#### `conversion`
- Optimize for one decisive next step: buy, request, book, subscribe, start trial, or ask for demo
- Emphasize value proposition, proof, objection handling, CTA visibility, and emotional clarity
- Allow narrative, imagery, and atmosphere only when they strengthen belief or desire
- Remove equal-weight secondary actions, technical rabbit holes, dead-end navigation, and decorative motion that competes with the CTA
- Default density: low to medium. Space is part of persuasion
- Default motion: controlled. Entrance and interaction motion are allowed; ambient motion must not compete with the offer
- Default contrast posture: `strong` for CTA/action moments, `calm` for supporting surfaces so the screen sells without glare

#### `action`
- Optimize for task completion, scan speed, and low cognitive overhead
- Emphasize the main task entry point, current state, next step, feedback, and the minimum controls required to act
- Remove hero sections, storytelling, testimonial-style blocks, ornamental illustrations, decorative gradients, and copy that sounds like marketing
- Default density: medium to high when it reduces clicks and improves orientation
- Default motion: minimal and functional only
- Default contrast posture: `standard` to `strong` for controls and state, but never harsh or dazzling

#### `editorial`
- Optimize for legibility, continuity, contemplation, and sustained attention
- Emphasize typographic rhythm, calm hierarchy, reading width, whitespace, and smooth progression through the content
- Remove dashboard chrome, competing CTAs, busy side panels, and decorative effects inside the reading rail
- Default density: low. The page should breathe
- Default motion: none or barely perceptible
- Default contrast posture: `calm`. Readability must be high without white-hot glare or ink-heavy fatigue

#### `trust`
- Optimize for confidence, reassurance, and reduced perceived risk
- Emphasize credentials, process clarity, safeguards, transparency, contact paths, and proof that feels credible
- Remove hype, flashy treatments, gimmicks, vague claims, and any styling that undermines seriousness
- Default density: low to medium. Clarity and evidence beat theatricality
- Default motion: minimal. Reassuring, never promotional
- Default contrast posture: `standard`. Contrast must feel clear and dependable, not aggressive

#### `ops`
- Optimize for signal detection, prioritization, and correct action under time pressure
- Emphasize status, anomalies, severity, ownership, timestamps, queues, and feedback after operator actions
- Remove indulgent layout moves, decorative spacing, weak contrast, and secondary metrics that bury urgent state
- Default density: medium to high when it improves signal visibility
- Default motion: minimal and state-driven only
- Default contrast posture: `strong` for operational state and alerting; muted text still has to remain readable

### 7. Design or implement
Always prefer: primitive or shared shell first > canonical surface second > family adoption third > cleanup fourth.

### 8. Verify with dev-browser
Use `dev-browser` / Playwright MCP to verify the result in a real browser. Check at breakpoints 390, 1024, 1440. Do not close without visual confirmation.

## Delegation matrix

- Use `dev-ux` when the problem is navigation, discoverability, tabs, sidebars, user flow, cognitive load, or task reachability.
- Use `dev-builder` when the implementation plan is clear and code must be written.
- Use `dev-cycle` for any non-trivial batch that needs intake, collision scan, QA, learn, and state tracking.
- Use `dev-docs-governor` when the change touches shared naming, SSOT, duplicated guidance, doc cleanup, or documentation authority.
- Use `dev-browser` when real browser flow validation is required beyond a simple visual pass.

## Anti-patterns

- Solving a systemic issue with a route-local wrapper
- Creating a third pattern for an already solved problem
- Using landing-page devices inside a workspace, dashboard, or operator view
- Using workspace density, jargon, or weak emotional framing on a conversion surface
- Declaring a screen "hybrid" to avoid making a hard primary-intent choice
- Letting "temporary" naming reach users
- Improving one route while increasing global inconsistency
- Decorative polish that adds noise but not clarity
- Mistaking visual intensity for design quality
- Brand inspiration copied literally instead of absorbed as interaction pattern
