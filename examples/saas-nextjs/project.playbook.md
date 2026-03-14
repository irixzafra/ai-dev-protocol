# Project Playbook: SaaS Starter (Next.js + Supabase)

> Example output from running the discovery prompt in `level-0-core/discovery.md`.
> This is what a real generated playbook looks like — not a template, but a filled-in instance.

---

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Framework | Next.js 15 (App Router + RSC) |
| Database | PostgreSQL via Supabase (self-hosted) |
| Auth | Supabase Auth (email + OAuth) |
| Styles | Tailwind CSS v4 |
| ORM/queries | Drizzle ORM |
| Test runner | Vitest + React Testing Library |
| Hosting | Hetzner (Coolify) |

---

## Key paths

| What | Path |
|---|---|
| App | `apps/platform/app/` |
| API routes | `apps/platform/app/api/` |
| DB schema | `packages/db/src/schema/` |
| Shared UI | `packages/ui/src/` |
| Tests | `apps/platform/__tests__/` |
| Migrations | `packages/db/src/migrations/` |

---

## Development commands

```bash
# Start dev server (with SSH tunnels to remote Supabase)
pnpm dev                        # Dev URL: http://localhost:3001

# Type-check (all packages)
pnpm type-check

# Run tests
pnpm test

# Build
pnpm build
```

---

## Variables

```
{{db_type}}:             PostgreSQL
{{auth_provider}}:       Supabase Auth
{{validation_library}}:  Zod
{{test_runner}}:         Vitest
{{dev_url}}:             http://localhost:3001
{{css_framework}}:       Tailwind CSS v4
{{orm}}:                 Drizzle
{{ui_package}}:          @repo/ui
```

---

## Patterns we follow in this project

- All API routes validate request body with Zod before touching the DB
- Row-level isolation via Supabase RLS — never filter by `user_id` in application code
- Design system lives in `packages/ui/` — never write one-off styled components
- Schema changes go through Drizzle migrations — never `ALTER TABLE` manually
- Multi-step writes use transactions — never two separate `await`s that both must succeed
- Empty states use `<EmptyState>` from `@repo/ui` — no custom illustrations per page
- Default branch is `master`, not `main`
- Full-track (feat/refactor): branch + PR. Fast-track (fix/chore/docs/test/perf): push directly after verify

---

## What NOT to do in this project

- Do not use `getServerSideProps` — this project uses RSC + server actions
- Do not import from `@/components/ui/` directly — use `@repo/ui` from the workspace
- Do not create top-level folders in the repo — use existing `apps/`, `packages/`, `docs/`
- Do not `git add .` or `git add -A` — the pre-commit hook checks for secrets
- Do not run Supabase locally — the dev setup connects to the remote staging instance via SSH tunnel

---

## Locked decisions (ADR index)

| ADR | Decision | Date |
|---|---|---|
| ADR-001 | Supabase self-hosted on Hetzner over Supabase Cloud | 2026-01-10 |
| ADR-002 | Drizzle over Prisma for type-safe queries without runtime overhead | 2026-01-15 |
| ADR-003 | RSC + server actions over tRPC for internal APIs | 2026-02-01 |

---

## Active skills

| Skill | When |
|---|---|
| `dev-backend` | API routes, DB queries, background jobs |
| `dev-security` | Auth flows, RLS policies, public endpoints |
| `dev-architecture` | Schema design, new service decisions |
| `dev-design` | Any component or layout work in `apps/platform/` |
