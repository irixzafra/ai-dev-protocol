# [Project Name] — Playbook

> The playbook is the project-specific layer that fills in the blanks left by the generic protocol.
> Agents load this alongside `dev.protocol.md` to get project-specific context.
>
> The protocol tells agents HOW to work.
> The playbook tells agents WHERE things are, WHAT stack is being used, and WHAT patterns we follow here.

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
| Tests | `__tests__/` |
| Shared types | `packages/contracts/` |

---

## Development environment

```bash
# Start dev server
[command]

# Type-check
[command]

# Run tests
[command]

# Build
[command]
```

Dev URL: `http://localhost:[port]`

---

## Patterns we follow in this project

> Fill these in as you discover them. They override generic advice from the skills.

### API
- [e.g., "All API routes validate request body with Zod before touching the DB"]
- [e.g., "Use RLS policies for row isolation — never filter by user_id in application code"]

### UI components
- [e.g., "Use the design system from `packages/ui/` — never write one-off styled components"]
- [e.g., "Empty states use the `<EmptyState>` component, not custom illustrations"]

### Database
- [e.g., "All schema changes go through Drizzle migrations — never alter tables manually"]
- [e.g., "Multi-step writes use transactions — never two separate awaits that both must succeed"]

### Git
- [e.g., "Default branch is `master`, not `main`"]
- [e.g., "Full-track (feat/refactor): open a PR. Fast-track (fix/chore/docs): push directly after verify"]

---

## Skills active in this project

| Skill | Activated for |
|---|---|
| `dev-backend` | All API and DB work |
| `dev-security` | Auth, permissions, any public endpoint |
| `dev-architecture` | Decisions that are hard to reverse |
| `dev-design` | Any frontend component or layout work |

---

## Known decisions (summary)

> Full ADRs live in `docs/adr/`. This is a quick-reference index.

| ADR | Decision | Date |
|---|---|---|
| [ADR-001](docs/adr/ADR-001-[slug].md) | [One-line summary] | YYYY-MM-DD |

---

## What NOT to do in this project

> Specific anti-patterns discovered through production use. More authoritative than generic skill references.

- [e.g., "Do not use `getServerSideProps` — we use RSC + server actions"]
- [e.g., "Do not import from `@/components/ui/` directly — use `@repo/ui` from the workspace"]
- [e.g., "Do not create top-level folders in the repo"]

---

## Contacts and access

| What | Value |
|---|---|
| Owner | [Name] |
| Repo | [URL] |
| Staging | [URL] |
| Production | [URL] |
