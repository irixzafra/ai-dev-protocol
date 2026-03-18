# RLS Patterns — the active project Multi-Tenant Reference

Standard RLS patterns for the active project. All tenant data is isolated by `organization_id`.

## Table of Contents

1. [Core Pattern](#core-pattern)
2. [Common Patterns](#common-patterns)
3. [Anti-Patterns](#anti-patterns)
4. [Audit Queries](#audit-queries)
5. [Audit: Diagnostic SSH Commands](#audit-diagnostic-ssh-commands)

---

## Core Pattern

the active project uses JWT-based organization isolation. The JWT contains `organization_id` in the app_metadata.

```sql
-- Standard multi-tenant policy
CREATE POLICY "org_isolation" ON schema.table
  FOR ALL
  USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);
```

If the JWT structure uses a different path, check the actual JWT:

```sql
-- Inspect current JWT claims
SELECT auth.jwt();
SELECT auth.uid();
SELECT auth.role();
```

## Common Patterns

### Read-only for members, write for admins

```sql
-- Read: any org member
CREATE POLICY "org_read" ON schema.table
  FOR SELECT
  USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

-- Write: admin role only
CREATE POLICY "admin_write" ON schema.table
  FOR INSERT
  WITH CHECK (
    organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

### Owner-only (user owns the row)

```sql
CREATE POLICY "owner_only" ON schema.table
  FOR ALL
  USING (
    organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    AND user_id = auth.uid()
  );
```

### Public read, org write

```sql
CREATE POLICY "public_read" ON schema.table
  FOR SELECT USING (true);

CREATE POLICY "org_write" ON schema.table
  FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);
```

### Service role bypass

Service role key bypasses RLS by default. No policy needed. But if a policy accidentally restricts service_role:

```sql
CREATE POLICY "service_bypass" ON schema.table
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Storage policies

```sql
-- Upload to org folder only
CREATE POLICY "org_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
  );

-- Read own org's files
CREATE POLICY "org_read" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
  );
```

## Anti-Patterns

### 1. USING (true) on tenant data

```sql
-- BAD: any authenticated user sees all organizations' data
CREATE POLICY "too_open" ON iam.members
  FOR SELECT USING (true);
```

Only acceptable on truly public tables (e.g., system config, public catalog).

### 2. RLS enabled but no policies

```sql
-- This blocks ALL access including service_role in some configurations
ALTER TABLE schema.table ENABLE ROW LEVEL SECURITY;
-- ... but no CREATE POLICY
```

### 3. Missing WITH CHECK on INSERT/UPDATE

```sql
-- BAD: users can read their org's data but INSERT into any org
CREATE POLICY "read_only" ON schema.table
  FOR ALL
  USING (organization_id = ...);
  -- Missing WITH CHECK means INSERT/UPDATE not validated
```

Fix: always include `WITH CHECK` for write operations, or use `FOR ALL` which applies USING to both.

### 4. Hardcoded UUIDs

```sql
-- BAD: hardcoded org ID
CREATE POLICY "hardcoded" ON schema.table
  USING (organization_id = 'abc-123-...');
```

### 5. Text comparison on UUID columns

```sql
-- BAD: type mismatch, may silently fail
USING (organization_id = auth.jwt() ->> 'organization_id');
-- GOOD: explicit cast
USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

## Audit Queries

### Full RLS coverage report

```sql
-- Complete picture: schema, table, RLS status, policy count
SELECT
  n.nspname as schema,
  c.relname as table,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  count(p.policyname) as policy_count,
  string_agg(p.policyname, ', ') as policies
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE c.relkind = 'r'
AND n.nspname NOT IN (
  'pg_catalog', 'information_schema', 'pg_toast',
  'supabase_migrations', 'extensions', '_realtime',
  '_analytics', 'vault', 'pgsodium', 'auth', 'storage',
  'supabase_functions', 'graphql', 'graphql_public'
)
GROUP BY n.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity
ORDER BY c.relrowsecurity, n.nspname, c.relname;
```

### Policy quality check

```sql
-- Policies using (true) — potential security gap
SELECT schemaname, tablename, policyname, cmd,
  CASE
    WHEN qual::text = 'true' THEN 'OPEN READ'
    ELSE 'OK'
  END as read_check,
  CASE
    WHEN with_check::text = 'true' OR with_check IS NULL THEN 'OPEN WRITE'
    ELSE 'OK'
  END as write_check
FROM pg_policies
WHERE schemaname NOT IN ('auth', 'storage', 'pg_catalog', 'information_schema')
AND (qual::text = 'true' OR with_check::text = 'true' OR with_check IS NULL)
ORDER BY schemaname, tablename;
```

### Verify org isolation is enforced

```sql
-- Check that all policies in app schemas reference organization_id or auth.jwt
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE schemaname NOT IN ('auth', 'storage', 'pg_catalog', 'information_schema', 'extensions')
AND qual::text NOT LIKE '%organization_id%'
AND qual::text NOT LIKE '%auth.jwt%'
AND qual::text NOT LIKE '%auth.uid%'
AND qual::text != 'true'
ORDER BY schemaname, tablename;
```

## Audit: Diagnostic SSH Commands

Run these via `ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "..."'` during `/dev-backend audit`.

### Tables without RLS enabled (critical: data exposed between orgs)

```sql
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname NOT IN (
  'pg_catalog', 'information_schema', 'pg_toast', 'supabase_migrations',
  'extensions', '_realtime', '_analytics', 'vault', 'pgsodium', 'storage',
  'auth', 'supabase_functions', 'graphql', 'graphql_public'
)
AND NOT EXISTS (
  SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = schemaname AND c.relname = tablename AND c.relrowsecurity
)
ORDER BY schemaname, tablename;
```

### RLS enabled but no policies (worse than no RLS — blocks all access silently)

```sql
SELECT n.nspname, c.relname
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relrowsecurity = true AND c.relkind = 'r'
AND NOT EXISTS (
  SELECT 1 FROM pg_policies p
  WHERE p.schemaname = n.nspname AND p.tablename = c.relname
)
ORDER BY n.nspname, c.relname;
```

### Overly permissive policies (USING true = any authenticated user sees everything)

```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE (qual::text = 'true' OR qual IS NULL)
AND schemaname NOT IN ('auth', 'storage', 'pg_catalog', 'information_schema');
```

### Policies not referencing organization_id or auth.jwt (potential cross-tenant leak)

```sql
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE schemaname NOT IN (
  'auth', 'storage', 'pg_catalog', 'information_schema', 'extensions'
)
AND qual::text NOT LIKE '%organization_id%'
AND qual::text NOT LIKE '%auth.jwt%'
AND qual::text NOT LIKE '%auth.uid%'
AND qual::text != 'true'
ORDER BY schemaname, tablename;
```
