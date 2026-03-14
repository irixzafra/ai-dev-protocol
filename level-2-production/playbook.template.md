# [Project Name] — Playbook

> The playbook is the project-specific layer on top of the generic protocol.
> Agents load this alongside `dev.protocol.md` to get project-specific context.
>
> The protocol tells agents HOW to work.
> The playbook tells agents WHERE things are, WHAT stack is being used, and WHAT patterns we follow here.
>
> → To generate this file from scratch: see `level-0-core/DISCOVERY.md`

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

> Skills and prompts reference these. When a skill says "use your schema validator",
> it means `{{validation_library}}`. Define yours here.

```
{{db_type}}:             [e.g., PostgreSQL]
{{auth_provider}}:       [e.g., Supabase Auth]
{{validation_library}}:  [e.g., Zod]
{{test_runner}}:         [e.g., Vitest]
{{dev_url}}:             [e.g., http://localhost:3001]
{{css_framework}}:       [e.g., Tailwind CSS v4]
```

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

> Anti-patterns discovered through real use in this codebase.
> More authoritative than generic skill references for this project.

- [e.g., "Do not use `getServerSideProps` — we use RSC + server actions"]
- [e.g., "Do not create top-level folders in the repo"]

---

## Locked decisions (ADR index)

> Full ADRs live in `docs/adr/`. This is a quick-reference index.
> Decision history lives in `planning/LESSONS.md` and `planning/MEMORY.md`.

| ADR | Decision | Date |
|---|---|---|
| [ADR-001](docs/adr/ADR-001.md) | [One-line summary] | YYYY-MM-DD |

---

## Active skills

| Skill | When |
|---|---|
| `dev-backend` | API, DB, background jobs |
| `dev-security` | Auth, permissions, public endpoints |
| `dev-architecture` | Decisions that are hard to reverse |
| `dev-design` | Frontend components and layouts |
