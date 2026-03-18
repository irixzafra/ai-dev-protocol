# [Project Name] — Playbook

> The playbook is the project-specific layer on top of the generic protocol.
> Agents load this alongside `dev.protocol.md` to get project-specific context.
>
> **The protocol tells agents HOW to work.**
> **The playbook tells agents WHERE things are, WHAT the domain is, and WHAT this project's standards are.**
>
> → To generate this file from scratch: see `level-0-core/discovery.md`

---

## Stack

| Layer | Technology |
|---|---|
| Language | [TypeScript / Python / Go / ...] |
| Framework | [Next.js / FastAPI / Express / ...] |
| Database | [PostgreSQL / SQLite / MongoDB / ...] |
| Auth | [Supabase Auth / NextAuth / Clerk / ...] |
| Hosting | [Vercel / Hetzner / Railway / ...] |
| Test runner | [Vitest / Jest / pytest / ...] |

---

## Key paths

| What | Path |
|---|---|
| App entry | `src/` |
| API routes | `src/app/api/` |
| Database schema | `db/schema/` |
| Shared UI components | `packages/ui/src/` |
| Tests | `__tests__/` |
| Planning | `planning/` |

---

## Development commands

```bash
# Start dev server
[command]        # Dev URL: http://localhost:[port]

# Type-check
[command]

# Run tests
[command]

# Build
[command]
```

---

## Variables

> Skills reference these. When a skill says "use your schema validator", it means `{{validation_library}}`.

```
{{db_type}}:             [e.g., PostgreSQL]
{{auth_provider}}:       [e.g., Supabase Auth]
{{validation_library}}:  [e.g., Zod]
{{test_runner}}:         [e.g., Vitest]
{{dev_url}}:             [e.g., http://localhost:3001]
{{css_framework}}:       [e.g., Tailwind CSS v4]
{{ui_package}}:          [e.g., @repo/ui]
{{orm}}:                 [e.g., Drizzle / Prisma / none]
```

---

## Design System

> Used by: `dev-design`, `dev-builder`. Overrides generic skill advice for all UI work.

### Tokens

> List the semantic token names this project uses. Skills must reference tokens, never raw values.

| Token | Usage |
|---|---|
| `[e.g., bg-background / hsl(var(--background))]` | Page background |
| `[e.g., bg-primary text-primary-foreground]` | Primary actions (CTA buttons) |
| `[e.g., bg-muted text-muted-foreground]` | Disabled states, secondary labels |
| `[e.g., bg-destructive]` | Destructive actions |
| `[e.g., border-border]` | All borders |

**Rule:** Never use hardcoded hex colors or raw Tailwind palette classes (`gray-500`, `blue-600`). Always use semantic tokens.

### Component inventory

> Components that already exist and must be reused. Skills must check this before creating new ones.

| Component | Package | When to use |
|---|---|---|
| `[e.g., <EmptyState>]` | `[e.g., @repo/ui]` | [e.g., Any list with no items, error states] |
| `[e.g., <StatCard>]` | `[e.g., @repo/ui]` | [e.g., KPI metrics in dashboards] |
| `[e.g., <FormDialog>]` | `[e.g., @repo/ui]` | [e.g., Any modal with a form] |
| `[e.g., <EnrichedTable>]` | `[e.g., @repo/ui]` | [e.g., Any data table with filters/sorting] |

### Layout primitives

| Component | When |
|---|---|
| `[e.g., <PageLayout>]` | [e.g., Every page — provides rail + content area] |
| `[e.g., <DocumentWorkspace>]` | [e.g., Master-detail views] |

### UI anti-patterns (project-specific)

> These are worse than generic bad practices: they create visual debt specific to this codebase.

- [e.g., "No `rounded-2xl` on data cards — reserved for marketing surfaces"]
- [e.g., "No gradient backgrounds in authenticated pages"]
- [e.g., "No floating stat cards outside a layout hierarchy"]
- [e.g., "No decorative section headers on dashboard pages (not a landing page)"]

---

## Domain Model

> Used by: `dev-backend`, `dev-builder`, `dev-db`. Defines the business entities and invariants agents must never violate.

### Core entities

| Entity | Table | Description |
|---|---|---|
| `[e.g., Organization]` | `[e.g., organizations]` | [e.g., Root tenant. Everything belongs to an org.] |
| `[e.g., User]` | `[e.g., auth.users + profiles]` | [e.g., Member of ≥1 org] |
| `[e.g., ...]` | `[...]` | `[...]` |

### Business rules (invariants)

> These are non-negotiable. Any code change that could violate one requires explicit human sign-off.

- [e.g., "An org always has at least one owner — never delete the last one"]
- [e.g., "Billing state determines which features are active — always check before rendering gated features"]
- [e.g., "Row isolation is enforced via RLS on `org_id` — never filter by org in application code"]

### Roles and permissions

| Role | Can do |
|---|---|
| `[e.g., owner]` | [e.g., Everything, including billing and org deletion] |
| `[e.g., admin]` | [e.g., Member management, not billing] |
| `[e.g., member]` | [e.g., Read own resources only] |

### Auth invariants

- [e.g., "Session is managed in middleware — do not re-authenticate per route"]
- [e.g., "Routes under `/admin/*` require role `owner`"]

---

## Quality Contract

> Used by: `dev-qa`, all skills in Phase 3 — Verify. Defines what "done" means for this specific project.

### Phase 3 checklist (project-specific)

> These extend the generic protocol Phase 3. Run these after every change.

- [ ] `[command]` type-check exits 0
- [ ] `[command]` build exits 0
- [ ] No new hardcoded color values (`#[0-9a-f]{3,6}` or raw palette classes)
- [ ] No `console.log` in production code paths
- [ ] [Add project-specific checks here]

### Performance budget

| Metric | Target |
|---|---|
| Lighthouse (public pages) | [e.g., ≥ 90] |
| First load JS bundle | [e.g., < 200KB] |
| API response (p95) | [e.g., < 500ms] |

### Testing requirements

| Scenario | Required test type |
|---|---|
| [e.g., DB mutations] | [e.g., Unit test with mocked DB] |
| [e.g., Auth flows] | [e.g., E2E (Playwright)] |
| [e.g., Components with logic] | [e.g., React Testing Library] |
| [e.g., Critical user paths] | [e.g., E2E smoke test] |

---

## Patterns we follow in this project

> These override generic skill advice when there's a conflict.

- [e.g., "All API routes validate with Zod before touching the DB"]
- [e.g., "Use RLS for row isolation — never filter by user_id in application code"]
- [e.g., "Design system is `packages/ui/` — never write one-off styled components"]
- [e.g., "Schema changes go through Drizzle migrations — never alter tables manually"]
- [e.g., "Default branch is `master`, not `main`"]

---

## What NOT to do in this project

> Anti-patterns discovered through real use. More authoritative than generic skill references for this project.

- [e.g., "Do not use `getServerSideProps` — we use RSC + server actions"]
- [e.g., "Do not create top-level folders in the repo"]
- [e.g., "Do not `git add .` — pre-commit hook checks for secrets"]

---

## Locked decisions (ADR index)

> Full ADRs live in `docs/adr/`. This is the quick-reference index.
> History lives in `planning/LESSONS.md` and `planning/MEMORY.md`.

| ADR | Decision | Date |
|---|---|---|
| [ADR-001](docs/adr/ADR-001.md) | [One-line summary] | YYYY-MM-DD |

---

## Active skills

> Skills that apply to this project. Skills NOT listed here are not configured for this codebase.

| Skill | When to invoke |
|---|---|
| `dev-backend` | API routes, DB queries, background jobs |
| `dev-security` | Auth flows, RLS policies, public endpoints |
| `dev-architecture` | Decisions that are hard to reverse |
| `dev-design` | Any component or layout work |
| `dev-builder` | Implementing a pre-approved plan |
| `dev-debug` | Diagnosing bugs or unexpected behavior |
| `dev-qa` | Quality gates before merge or deploy |
