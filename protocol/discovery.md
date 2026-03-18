# Discovery — Project Kickoff

> Run this once per project, before writing any code.
> Output: `dev.playbook.md` + seed entries for `planning/WORKBOARD.md`
>
> Two modes:
> - **New project** — interview with client/stakeholder → generate playbook
> - **Existing codebase** — agent reads the code → generates draft for your review

---

## Why this matters

Without a playbook, every agent session starts blind:
- What stack are we using?
- What does this domain actually mean?
- What visual standards apply?
- What are the features we're building?

The discovery session runs **once**. After that, every agent loads the playbook and already knows. The playbook is your onboarding doc for AI — and for new human developers too.

---

## Mode A — New project (interview with client/stakeholder)

Paste this into any agent. It runs 4 phases of questions, one at a time, and generates the complete playbook at the end.

```
You are helping me start a new project. Before writing any code, we need to capture
everything important into a project playbook — a single file that AI agents will load
at the start of every session.

Run a structured discovery interview in 4 phases.
Ask questions ONE AT A TIME. Wait for my answer before continuing.
Do not skip any question, but keep them conversational — no jargon.

---

PHASE A — Project & Stack (5 questions)

A1. Project name and one-line description. What does it do and for whom?

A2. Main tech stack:
    - Frontend framework?
    - Backend / API layer?
    - Database and ORM?
    - Auth provider?
    - Hosting / deployment?
    - Test runner?

A3. Key paths — where do things live in the repo?
    - App entry point?
    - API routes?
    - Database schemas?
    - Shared UI components?
    - Tests?

A4. Development commands:
    - How do you start the dev server? (and what port?)
    - How do you type-check?
    - How do you run tests?
    - How do you build?

A5. Key constraints:
    - Any compliance requirements (GDPR, HIPAA, etc.)?
    - Performance targets?
    - Mobile-first or desktop-first?
    - Any hard deadlines that affect scope?

---

PHASE B — Design System (4 questions)

B1. Does the project have an existing design system or brand guide?
    If yes: what are the primary/secondary colors and typography?
    If no: is there a reference product whose visual style you want to match?

B2. What UI component library are you using (if any)?
    Examples: shadcn/ui, MUI, Radix, custom, none.

B3. List any UI components that already exist and must be reused.
    Examples: buttons, modals, data tables, empty states, error cards.

B4. What are the UI rules that matter most in this project?
    Examples: "no gradients in authenticated pages", "always use semantic color tokens",
    "no inline styles", "dark mode required from day 1".

---

PHASE C — Domain Model (4 questions)

C1. What are the 3–6 core business entities this product manages?
    Think: what are the "nouns" of your product?
    Examples: Organization, User, Order, Invoice, Project, Task, Agent, Document.

C2. For each entity, what is its most important relationship?
    Example: "A User belongs to an Organization. An Order belongs to a User."

C3. What are the 2–4 business rules that can NEVER be violated?
    These are invariants — things that, if broken, would corrupt data or violate trust.
    Example: "An org always has at least one owner."
    Example: "A payment cannot be refunded after 30 days."

C4. What roles exist and what can each role do?
    Example: owner (everything), admin (manage members), member (read own data).
    Is there multi-tenancy (multiple organizations sharing the same system)?

---

PHASE D — Features (3 questions)

D1. What are the 5–10 most important things the product needs to do?
    List them as user actions: "User can create an invoice", "Admin can invite members".
    Don't filter yet — just list.

D2. If you could only ship 3 of those for the MVP, which 3?
    These are your Must-have features.

D3. What is explicitly OUT OF SCOPE for the first version?
    Name things that seem obvious but you want to deliberately defer.

---

After all questions are answered, do two things:

FIRST — Generate `dev.playbook.md`:

# [Project Name] — Playbook

> The playbook is the project-specific layer on top of the generic protocol.
> Agents load this alongside `dev.protocol.md` to get project-specific context.

---

## Stack

| Layer | Technology |
|---|---|
| Language | [from A2] |
| Framework | [from A2] |
| Database | [from A2] |
| Auth | [from A2] |
| Hosting | [from A2] |
| Test runner | [from A2] |

---

## Key paths

| What | Path |
|---|---|
| App entry | [from A3] |
| API routes | [from A3] |
| Database schema | [from A3] |
| Shared UI components | [from A3] |
| Tests | [from A3] |

---

## Development commands

```bash
# Start dev server
[from A4]   # Dev URL: http://localhost:[port]

# Type-check
[from A4]

# Run tests
[from A4]

# Build
[from A4]
```

---

## Variables

```
{{db_type}}:             [from A2]
{{auth_provider}}:       [from A2]
{{validation_library}}:  [detected or asked]
{{test_runner}}:         [from A2]
{{dev_url}}:             [from A4]
{{css_framework}}:       [from A2 or B2]
{{ui_package}}:          [from B2]
{{orm}}:                 [from A2]
```

---

## Design System

### Tokens

> Never use hardcoded hex colors or raw palette classes. Always use semantic tokens.

| Token | Usage |
|---|---|
| `bg-background` | Page background |
| `bg-primary text-primary-foreground` | Primary actions (CTA buttons) |
| `bg-muted text-muted-foreground` | Disabled states, secondary labels |
| `bg-destructive` | Destructive actions |
| `border-border` | All borders |
[Add tokens from B1 — map brand colors to semantic token names]

**Rule:** [from B4 — the most important visual rule]

### Component inventory

| Component | Package | When to use |
|---|---|---|
[from B3 — list each reusable component]

### UI anti-patterns

[from B4 — specific visual rules this project enforces]

---

## Domain Model

### Core entities

| Entity | Table | Description |
|---|---|---|
[from C1 + C2 — one row per entity]

### Business rules (invariants)

[from C3 — one bullet per invariant]

### Roles and permissions

| Role | Can do |
|---|---|
[from C4 — one row per role]

---

## Quality Contract

### Phase 3 checklist

- [ ] Type-check exits 0
- [ ] Build exits 0
- [ ] Tests exit 0 — no failures, no skips
- [ ] No hardcoded color values (hex or raw palette classes)
- [ ] No `console.log` in production code paths
[Add project-specific checks from A5 constraints]

---

## Patterns we follow

- [from A5 constraints and C4 auth rules — project-specific conventions]
- [from B4 — visual/design conventions]

---

## What NOT to do

- [from A5 — things that violate constraints]
- [from B4 — UI anti-patterns]
- [from C3 — things that would violate invariants]

---

## Locked decisions (ADR index)

| ADR | Decision | Date |
|---|---|---|
| ADR-001 | [first locked decision from A5/C] | [today] |

---

## Active skills

| Skill | When to invoke |
|---|---|
| `dev-backend` | API routes, DB queries, auth |
| `dev-design` | Any component or layout work |
| `dev-builder` | Implementing a pre-approved plan |
| `dev-debug` | Diagnosing bugs or unexpected behavior |
| `dev-qa` | Quality gates before merge or deploy |

---

SECOND — Generate seed entries for `planning/WORKBOARD.md`:

## WORKBOARD — Initial features

### Must-have (MVP)
[from D2 — 3 features, each as a one-liner task]

### Should-have
[from D1 minus the 3 MVP features — remaining features]

### Out of scope (v1)
[from D3 — explicit deferrals]

---

Show me both outputs. Then ask:
"Does this look right? Anything missing or wrong?"

After I confirm: tell me to save `dev.playbook.md` in the project root
and add the WORKBOARD entries to `planning/WORKBOARD.md`.
```

---

## Mode B — Existing codebase (cold start)

Use this when dropping the protocol into a codebase with no documentation, unknown stack, or inherited patterns.

The agent reads the code first and generates a draft for you to review and correct.

```
You are helping onboard an AI development protocol into an existing codebase.
Do NOT ask me questions yet. First, explore the code.

STEP 1 — Explore the repository:
- Read root package.json / pyproject.toml / go.mod (whichever exists)
- List the top-level directory structure
- Read 2–3 representative source files
- Check for: tsconfig.json, .eslintrc, docker-compose.yml, .env.example
- Scan for existing UI components (any components/ or ui/ folder)
- Look for DB schema files (any schema/, migrations/, prisma/, or drizzle files)

STEP 2 — Deduce and document:
Generate a draft `dev.playbook.md` based on what you found:
- Stack — what you detected, not what I told you
- Key paths — where source, tests, schema, and config live
- Design System — any tokens, component patterns, or UI libraries you spotted
- Domain Model — the business entities visible in the schema and route names
- Patterns — naming conventions, folder structure, import patterns you observed
- Anti-patterns — things that look inconsistent or risky
- Open questions — things you could not determine from code alone

STEP 3 — Present for review:
Show me the generated playbook draft and the open questions.
I will correct what's wrong and answer the questions.
Then update the playbook and save it.

Start with Step 1. Do not ask questions until Step 3.
```

---

## Step 2 — Save the outputs

```bash
# Save the playbook
git add dev.playbook.md
git commit -m "chore: add project playbook"

# If WORKBOARD is new
mkdir -p planning
git add planning/WORKBOARD.md
git commit -m "chore: add initial feature backlog"
```

---

## Step 3 — Daily usage

Every session, agents load both files:

```
Read dev.protocol.md and dev.playbook.md before doing anything.
Task: [your task here]
```

That's it. From session 1, every agent knows the stack, the domain, the visual rules, and the features being built.

---

## Keeping the playbook current

Update it when:
- Stack changes
- A new anti-pattern is discovered (graduate from `planning/LESSONS.md` if project-specific)
- A business rule or invariant is clarified
- A decision gets locked that wasn't documented

If a section grows beyond ~30 lines, extract the detail to a reference doc and keep only the key rules inline in the playbook.

---

## Feature analysis prompt (ongoing)

Use this when a new idea surfaces mid-project.

```
Read dev.protocol.md and dev.playbook.md.
Also read planning/WORKBOARD.md.

I have a new feature idea. Run a structured analysis — one question at a time:

1. What problem does this solve? For whom? How often does it occur?
2. What is the simplest possible version that delivers real value?
3. What are the risks or downsides of building this now?
4. Does it fit the current constraints and domain model in the playbook?
5. Are there simpler alternatives (config, third-party, defer)?

After the dialogue, give me:
- MoSCoW priority (M/S/C/W) with one-sentence reasoning
- Recommendation: accept, defer, or reject
- If accepted: a one-paragraph spec ready to paste into WORKBOARD

Idea: [describe it here]
```
