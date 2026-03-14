# Skill: dev-backend

> Use when implementing APIs, database logic, background jobs, or any server-side code.
> Load this alongside your project playbook for stack-specific context.

## When to activate

- Building or modifying an API endpoint
- Writing database queries, migrations, or schema changes
- Implementing auth, sessions, or permissions logic
- Background jobs, queues, or scheduled tasks

## References to load

| File | Use when |
|---|---|
| `references/anti-patterns.md` | Reviewing or generating any backend code |
| `your-project/playbook/stack.md` | Always — for project-specific DB, framework, and patterns |

## Core rules (apply regardless of stack)

1. **Validate at the boundary** — validate all external input (user input, webhooks, external APIs). Trust nothing that crosses a system boundary.
2. **No N+1 queries** — if you're looping and querying inside the loop, stop. Use joins, batch queries, or eager loading.
3. **Errors are data** — return structured errors with enough context to debug. Never swallow exceptions silently.
4. **Idempotency for mutations** — any operation that can be retried (webhooks, queued jobs) must be idempotent.
5. **Secrets never in code** — environment variables only. No hardcoded credentials, tokens, or connection strings.
6. **Transactions for multi-step writes** — if two writes must succeed together, use a transaction. Partial state is a bug.

## Stub: fill in your stack

```
# In your project playbook:

## Stack
- Framework: [e.g., Express, FastAPI, Next.js API routes, Hono]
- ORM/query: [e.g., Drizzle, Prisma, SQLAlchemy, raw SQL]
- Auth: [e.g., Supabase Auth, NextAuth, JWT]
- Queue: [e.g., BullMQ, Celery, pg-boss]

## Patterns we use
- [e.g., "All API routes validate with Zod before touching the DB"]
- [e.g., "Use RLS for row-level isolation — never filter in application code"]
```
