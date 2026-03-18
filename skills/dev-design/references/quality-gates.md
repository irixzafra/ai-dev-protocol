# Quality Gates — Scoring, Animation, Spacing, Industry Patterns

## Table of Contents

1. [Design Quality Score (0-100)](#1-design-quality-score-0-100)
2. [Spacing Discipline (4px grid)](#2-spacing-discipline-4px-grid)
3. [Animation Classification](#3-animation-classification)
4. [Color Psychology](#4-color-psychology-decision-guide)
5. [Industry-Specific Patterns](#5-industry-specific-patterns)
6. [Landing Page Archetypes](#6-landing-page-archetypes)
7. [Surface-Intent Gates](#7-surface-intent-gates)

---

## 1. Design Quality Score (0-100)

Evaluate the design across 10 dimensions. Each one 0-10. Total /100.

| Dimension | 0-3 (Poor) | 4-6 (Acceptable) | 7-8 (Good) | 9-10 (Excellent) |
|---|---|---|---|---|
| **Visual hierarchy** | No clear hierarchy | Heading vs body but nothing more | 3+ level consistent hierarchy | Gaze naturally guided to CTA |
| **Typography** | System fonts, no scale | Good font but no system | Complete type scale, 2 fonts max | Memorable pairing, perfect rhythm |
| **Color** | Random colors | Coherent but generic palette | Intentional palette, 60-30-10 ratio | Memorable palette, AA+ contrast |
| **Spacing** | Inconsistent | Mostly consistent | Strict 4px system | Perfect breathing room, vertical rhythm |
| **Consistency** | Every component different | Similar components | Design system applied | Zero deviations, tokens everywhere |
| **Imagery** | Generic stock | Adequate images | Intentional, optimized images | Images that tell a story |
| **Layout** | Stacked blocks | Functional grid | Composition with tension/balance | Memorable layout, negative space |
| **Components** | Basic HTML | Functional components | Well-configured shadcn/ui | Custom components with personality |
| **Branding** | No identity | Logo + colors | Consistent identity throughout | Unique, immediate personality |
| **Intent fit** | Wrong grammar for the surface | Roughly appropriate but generic | Clear fit to the surface job | Perfectly tuned to the surface objective |

**Grades**: A+ (95-100) / A (90-94) / B+ (85-89) / B (80-84) / C (70-79) / D (60-69) / F (<60)

**Quality levels**:
- 90+: Award-worthy — reference for others
- 80-89: Professional — top agency level
- 70-79: Competent — functional and presentable
- 60-69: Draft — needs significant iteration
- <60: Bootstrap template — start over

**Blocker rule**:
- If any blocker from Section 7 fails, the design cannot score above 79 until the blocker is resolved
- High polish does not compensate for wrong surface grammar

**Contrast rule**:
- Passing WCAG is the floor, not the finish line
- A surface can be technically compliant and still be visually fatiguing
- Evaluate contrast for both legibility and comfort relative to the surface intent

---

## 2. Spacing Discipline (4px grid)

All spacing uses a 4px grid. The comfortable base unit is 8px. All values must be multiples of 4.

### Allowed values
```
4px  (0.25rem) — micro-spacing (gap between icon and text)
8px  (0.5rem)  — tight spacing (small internal padding)
12px (0.75rem) — compact (badges, pills padding)
16px (1rem)    — base (input padding, standard gap)
24px (1.5rem)  — comfortable (gap between cards, mobile section padding)
32px (2rem)    — section gap (separation between groups)
40px (2.5rem)  — subsection padding
48px (3rem)    — section padding desktop
64px (4rem)    — hero section gaps
96px (6rem)    — major section separators
128px (8rem)   — hero vertical padding
```

### Rules
- All spacing uses values from the set. Anything outside must be explicitly justified
- Internal component padding: 8/12/16
- Gap between components: 16/24/32
- Page sections: 48/64/96
- **Review pass**: look for any hardcoded value outside the set (`p-[13px]`, `gap-[22px]`, etc.)

### Tailwind mapping
```
p-1 (4px) · p-2 (8px) · p-3 (12px) · p-4 (16px)
gap-4 (16px) · gap-6 (24px) · gap-8 (32px)
py-12 (48px) · py-16 (64px) · py-24 (96px)
```

---

## 3. Animation Classification

Every animation falls into exactly 1 of 4 categories. Each has different rules:

### Entrance (elements appearing)
- **Timing**: 300-500ms
- **Easing**: ease-out (fast start, smooth end)
- **Patterns**: fade-in-up, reveal on scroll, stagger delays (50-100ms between items)
- **prefers-reduced-motion**: reduce to simple fade or eliminate
- **Use**: page load, scroll reveal, content appearing

### Hover/Interaction (immediate response)
- **Timing**: 150-200ms
- **Easing**: ease-out
- **Patterns**: scale(1.02), opacity change, border/shadow change, color transition
- **prefers-reduced-motion**: keep (essential feedback)
- **Use**: buttons, cards, links, toggles

### Ambient (continuous decoration)
- **Timing**: 3-8s loop
- **Easing**: ease-in-out
- **Patterns**: subtle floating, soft pulse, gradient shift
- **prefers-reduced-motion**: ELIMINATE completely
- **Use**: hero sections or decorative backgrounds only. Maximum 1 per page
- **Red flag**: if more than 1 ambient animation -> remove extras

### Attention (drawing attention)
- **Timing**: 1-2s, may repeat 2-3 times
- **Easing**: ease-in-out with pause
- **Patterns**: glow pulse, subtle bounce, ring expansion
- **prefers-reduced-motion**: reduce to static color change
- **Use**: critical CTAs or alerts only. Maximum 1 per screen
- **Red flag**: if more than 1 element competing for attention -> remove extras

### Universal rule
Only `transform` and `opacity` for all animations. Never animate `width`, `height`, `margin`, `padding`, `top`, `left`. These properties cause reflow and destroy performance.

---

## 4. Color Psychology (decision guide)

### Step 1: Brand personality -> Primary hue

| Personality | Hue range | Examples |
|---|---|---|
| Trust / Professional | Blue 200-230 | Fintech, enterprise, legal |
| Energy / Urgency | Red 0-15 | Delivery, sales, alerts |
| Growth / Health | Green 120-160 | Healthtech, sustainability, HR |
| Creativity / Premium | Purple 260-290 | Design tools, luxury, AI |
| Warmth / Optimism | Orange/Yellow 30-50 | Food, education, community |
| Neutrality / Sophistication | Desaturated any | Consulting, editorial, luxury |

### Step 2: Harmony type

| Type | How | When |
|---|---|---|
| **Monochromatic** | Saturation/lightness variations of same hue | Safe, elegant, corporate apps |
| **Analogous** | +/-30 from primary hue | Harmonious, natural, subtle gradients |
| **Complementary** | +180 from primary hue | High contrast, standout CTAs |
| **Split-complementary** | +150 and +210 | Vibrant but balanced |

### Step 3: Ratio 60-30-10
- **60%**: Background/surface (neutral, desaturated)
- **30%**: Secondary elements (primary color, soft)
- **10%**: Accents and CTAs (most intense/complementary color)

---

## 5. Industry-Specific Patterns

When the project is in a specific industry, apply these defaults:

| Industry | Visual mood | Colors | Must-haves | Anti-patterns |
|---|---|---|---|---|
| **SaaS B2B** | Clean, professional, trustworthy | Blue/neutral + vibrant accent | Social proof with logos, ROI numbers, demo CTA | Too colorful, informal language |
| **E-commerce** | Visual-first, fast | Neutral base + urgency accent | Product images hero, trust badges, reviews | Slow loading, complex checkout |
| **Healthcare** | Calm, trustworthy | Soft blue/green | WCAG AAA, privacy badges, clear info hierarchy | Aggressive motion, saturated colors, AI gradients |
| **Fintech** | Secure, modern, premium | Dark + green/blue accent | Security indicators, real-time data, clear numbers | Unnecessary decoration, flashy colors |
| **Education** | Accessible, engaging | Warm + varied colors | Progress indicators, clear CTAs, readable text | Walls of text, complex navigation |
| **Creative/Portfolio** | Bold, memorable | High saturation or B&W | Full-bleed imagery, case studies, personality | Generic templates, stock photos |
| **Legal/Consulting** | Sober, authoritative | Dark + gold/navy | Credentials, testimonials, clear contact | Informal design, excessive animations |
| **Restaurant/Food** | Sensorial, warm | Earth tones + food photography | Menu, hours, location, reservation CTA | Slow loading, tiny text, no mobile |
| **Government/Public** | Accessible, clear | Blue/neutral | WCAG AAA, skip links, large type (18px+), focus rings 3-4px | Ornate design, decoration |
| **Startup/Tech** | Forward-looking, energetic | Saturated primaries | Demo/signup CTA, product screenshot, speed | Over-designed, too many features shown |

---

## 6. Landing Page Archetypes

8 proven patterns. Choose based on industry and objective:

### 1. Hero-Centric
**When**: visual product, app with demo, creative agency
**Structure**: Hero fullscreen -> Features grid -> Social proof -> CTA
**Key element**: Impactful hero (image/video/demo) that communicates everything in 1 view

### 2. Conversion-Optimized
**When**: lead gen, SaaS trial, newsletter
**Structure**: Benefit headline -> Form/CTA -> Objection handling -> Trust -> CTA repeat
**Key element**: CTA visible above-fold without scroll. Simple form (name + email max)

### 3. Feature-Rich Showcase
**When**: SaaS with many features, complex platform
**Structure**: Hero -> Feature 1 (text + visual) -> Feature 2 -> Feature 3 -> Pricing -> FAQ -> CTA
**Key element**: Alternate text-left/visual-right with visual-left/text-right. Max 5-6 features

### 4. Minimal & Direct
**When**: luxury, consulting, artist, simple tool
**Structure**: Hero with tagline -> 1-2 benefits -> CTA
**Key element**: Extreme negative space. Everything non-essential is removed

### 5. Social Proof-Focused
**When**: B2B service, agency, mature product with testimonials
**Structure**: Hero -> Client logos -> Detailed testimonials -> Case study numbers -> CTA
**Key element**: Real numbers and real names. Nothing generic

### 6. Interactive Product Demo
**When**: SaaS, interactive tool, product best explained by using it
**Structure**: Hero -> Embedded/interactive demo -> Features that emerge from demo -> CTA
**Key element**: User touches the product before deciding

### 7. Trust & Authority
**When**: healthcare, legal, finance, enterprise
**Structure**: Hero with credential -> Awards/certs -> Process explanation -> Team -> CTA
**Key element**: Transparency. Show the process, the team, the credentials

### 8. Storytelling-Driven
**When**: brand with mission, emotional product, social cause
**Structure**: Hook story -> Problem -> Solution -> Impact numbers -> Join us CTA
**Key element**: Narrative arc. User identifies with the story

---

## 7. Surface-Intent Gates

Before approving any visible change:
1. Declare the surface type: `conversion`, `action`, `editorial`, `trust`, or `ops`
2. Declare the output contract, including at least one thing that will be removed
3. Run the matching gate set below

If any blocker fails, stop and revise before polishing.

### Universal gates

**Blockers**
- Surface type is not explicitly declared
- The proposal does not name at least one thing to remove
- The chosen surface type does not match the primary job to be done
- A secondary surface is declared without a clear reason it must exist
- The proposal tries to optimize two incompatible intents equally

**Fails**
- Visual style is discussed before objective, primary action, and information priority
- Motion or decoration is introduced without a job
- Contrast is discussed only as WCAG compliance and not as a readability/comfort decision

### Ambiguity resolution gates

**Blockers**
- The primary intent is missing because the screen was described as "hybrid"
- The layout follows the secondary intent instead of the primary one

**Fails**
- The proposal cannot explain in one sentence why the obvious alternative intent is secondary
- Tone, density, or CTA pressure leak from the wrong intent into the main work area

### Conversion surface gates

**Blockers**
- The value proposition is not clear in the first viewport
- The primary CTA is not obvious above the fold on desktop and mobile
- Multiple primary actions compete with equal weight
- There is no proof, evidence, or trust mechanism where the user is asked to believe a claim or take risk
- Visual energy overwhelms the message or the CTA
- CTA contrast is weak against the surrounding surface or the rest of the page is so intense that the CTA stops standing out

**Fails**
- Features appear before the problem or benefit is clear
- Copy explains everything instead of leading to the next step
- Navigation offers too many exits for a focused campaign page
- Motion is decorative but not persuasive or clarifying
- Supporting text is so low-contrast that objections, proof, or details become harder to trust

### Action surface gates

**Blockers**
- Decorative elements do not improve comprehension, priority, or speed
- More than one primary action competes in the same work zone
- The main task entry point is not visible in the initial scan
- Marketing copy, hero sections, or storytelling blocks occupy the primary work area
- Status, selection, or result feedback is delayed, weak, or easy to miss
- Controls, labels, or selected states depend on low-contrast treatments that slow scan speed

**Fails**
- Labels are verbose, brand-like, or indirect
- Secondary controls visually compete with primary actions
- Empty states do not point to the next task
- Motion is ambient rather than functional
- Muted text is too soft to support efficient scanning in repeated use

### Editorial surface gates

**Blockers**
- Text is hard to read at default size or default line length
- Competing CTAs or chrome interrupt the reading rail
- Motion or decoration interferes with concentration
- Contrast relies on extreme black-on-white or white-on-black pairs that create glare or reading fatigue over long sessions

**Fails**
- Hierarchy is shallow or repetitive
- Side panels compete with the body copy
- Spacing breaks reading rhythm
- Supporting notes, metadata, or annotations fall below comfortable reading contrast

### Trust surface gates

**Blockers**
- Credentials, safeguards, or process clarity are missing where trust is required
- Hype language or flashy styling undermines authority
- Risk, cost, or consequence information is buried
- Color contrast makes reassurance elements, warnings, or validation hard to distinguish confidently

**Fails**
- Proof exists but is hard to scan
- Contact, policy, or reassurance mechanisms are secondary when they should sit near the action
- Motion feels promotional instead of reassuring
- The visual palette feels harsher or more saturated than the trust level of the flow can support

### Ops surface gates

**Blockers**
- Critical status, alerts, or anomalies are not visually prioritized
- Changes in system state rely on color alone
- Ownership, timestamp, or next-step data is missing where action depends on it
- Decoration pushes operational signal below the fold
- Severity levels, selected rows, or actionable statuses do not achieve scan-fast contrast

**Fails**
- Non-urgent metrics compete with urgent problems
- Dense data lacks grouping or escalation hierarchy
- Feedback after an operator action is ambiguous
- Low-contrast dividers or muted labels make operational grouping harder to parse

### Contrast verification checklist

Report this on any serious design pass:

```
Contrast verified:
  - primary text vs background: X.X:1
  - secondary/muted persistent text vs background: X.X:1
  - button text vs button background: X.X:1
  - critical state / selected state / focus ring: X.X:1
  - note on comfort: [calm | standard | strong] and why
```

Comfort guidance by surface:
- `conversion`: action contrast should pop; support zones should not glare
- `action`: labels and controls must scan fast for repeated use
- `editorial`: prefer high readability without maximum luminance stress
- `trust`: clarity first, drama last
- `ops`: status contrast must survive density, urgency, and dark/light themes
