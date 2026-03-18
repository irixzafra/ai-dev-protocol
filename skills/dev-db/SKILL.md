---
name: dev-db
description: "Manages the active project database operations: Drizzle schema definitions, SQL migrations, RLS policies, seeds, queries, and diagnostics across 23+ PostgreSQL schemas. Use when creating tables, modifying schemas, adding columns, writing migrations, configuring RLS policies, seeding data, querying the database, or any Drizzle/pgSchema/SQL operation in the active project. NOT for building full features with UI (use dev-builder), NOT for debugging runtime errors (use dev-debug), NOT for infrastructure/server ops (use ops-server)."
user-invocable: true
argument-hint: "[operation: new table, alter, query, etc.]"
---

# dev-db — Database Operations

Drizzle schema management, SQL migrations, RLS policies, and DB operations for the active project.

## Mindset

Factory floor: the DB is the foundation. An error here propagates to the entire stack.

- **RLS always** — without RLS, one org's data is visible to all. No exceptions.
- **Migration = contract** — a migration in production is not easy to revert. Think twice, execute once.
- **Zero tolerance:** no CREATE TABLE without RLS. No ALTER without backup. No DROP without explicit confirmation.
- **Drizzle schema = source of truth** — if Drizzle and SQL don't match, there's a bug. Always.

## DB Stack

- **ORM:** Drizzle (schema in TypeScript, source of truth for types)
- **DB:** PostgreSQL (Supabase (self-hosted))
- **PG Schemas:** One schema per engine — logical isolation by domain
- **Migrations:** Pure SQL in `packages/db/migrations/`
- **Container:** `YOUR_DB_CONTAINER` (compose project `project`)

## Protocol

### For a new table

Order matters: Drizzle first (so TypeScript has the types), then SQL (so the DB has the table).

#### 1. Drizzle Schema
```typescript
// packages/db/schema/[engine].ts
import { pgSchema, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("[engine]");

export const myTable = mySchema.table("my_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),
  name: text("name").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

#### 2. Export from barrel
```typescript
// packages/db/schema/index.ts
export * from "./[engine]";
```

#### 3. SQL Migration
```sql
-- packages/db/migrations/YYYYMMDDHHMMSS_[description].sql

CREATE SCHEMA IF NOT EXISTS [engine];

CREATE TABLE [engine].my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: without this any user can see all data
ALTER TABLE [engine].my_table ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_my_table_org ON [engine].my_table(organization_id);

CREATE POLICY "org_isolation" ON [engine].my_table
  USING (organization_id = auth.jwt() ->> 'organization_id');
```

#### 4. Verify
```bash
pnpm tsc --noEmit  # Schema types OK
```

#### 5. Apply migration
```bash
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -f /path/to/migration.sql'
```

### For modifying an existing table

1. Modify Drizzle schema in `packages/db/schema/[engine].ts`
2. Create SQL migration with `ALTER TABLE`
3. Type-check
4. Apply migration

### For querying DB state

```bash
# List schemas
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('"'"'pg_catalog'"'"', '"'"'information_schema'"'"', '"'"'pg_toast'"'"') ORDER BY 1;"'

# List tables in a schema
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT table_name FROM information_schema.tables WHERE table_schema = '"'"'[schema]'"'"' ORDER BY 1;"'

# View table structure
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "\\d [schema].[table]"'

# View RLS policies
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT * FROM pg_policies WHERE schemaname = '"'"'[schema]'"'"';"'
```

## Existing schemas

Adapt this table to your project. List each PostgreSQL schema, the engine/domain it maps to, and the Drizzle schema file:

| PG Schema | Engine | File |
|---|---|---|
| `system` | System (module config) | `system.ts` |
| `iam` | IAM (orgs, members, roles) | `iam.ts` |
| `billing` | Billing | `billing.ts` |
| ... | ... | ... |

## Rules

- **Always create SQL migration** alongside Drizzle schema changes — Drizzle does not auto-migrate, the DB needs the SQL
- **Always enable RLS** on new tables — without RLS one org's data is visible to all
- **Always include `organization_id`** for multi-tenancy — the foundation of data isolation
- **Naming:** snake_case in SQL, camelCase in Drizzle — project convention
- **Gitignore blocks *.sql** — use `git add -f` for migrations
- **Backup before ALTER in prod:** `ssh your-server 'pg_dump ...'`
- **No DROP TABLE without explicit user confirmation**
