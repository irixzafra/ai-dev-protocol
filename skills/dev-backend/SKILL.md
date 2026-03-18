---
name: dev-backend
description: "Unified backend expert for the active project: Supabase platform management (Auth, RLS, Storage, Realtime, Edge Functions), connectivity health checks, security audits, query performance optimization, and monitoring diagnostics. Knows every connector, container, network, and env var in the stack. Use when checking backend health, auditing RLS policies, debugging auth issues, optimizing slow queries, reviewing connection pooling, testing API connectivity, managing Storage buckets, deploying Edge Functions, diagnosing middleware auth flow, reviewing CSP/security headers, or any Supabase-as-platform operation. Also use when something 'doesn't connect', 'loads slow', 'auth fails', or 'data leaks between orgs'. NOT for Drizzle schema definitions or SQL migrations (use dev-db). NOT for server ops or Docker restarts (use ops-server). NOT for infrastructure security hardening (use ops-audit)."
user-invocable: true
argument-hint: "[operation: health, audit, performance, auth, storage, realtime, resources]"
examples:
  - "/dev-backend health"
  - "/dev-backend audit"
  - "/dev-backend performance"
  - "/dev-backend resources"
  - "revisar el backend"
  - "está conectado Supabase?"
  - "auditar RLS policies"
  - "queries lentos"
  - "revisar auth config"
  - "gestionar Storage buckets"
  - "cómo va el connection pool"
  - "hay Edge Functions desplegadas?"
  - "latencia del backend"
  - "se ven datos de otro org"
  - "el login no funciona"
  - "revisar la seguridad del backend"
---

# dev-backend — Backend Expert

Backend expert for the active project. Knows every container, every connector, every env var, every network, and every layer between the browser and the database.

## Scope

**This skill owns:**
- Supabase platform: Auth, RLS audit, Storage, Realtime, Edge Functions
- App ↔ Backend connection: middleware auth chain, CSP, Supabase clients, engine clients
- Multi-tenant: Gatekeeper permissions, CapabilityManager, impersonation, lifecycle, module system
- Backend services: your data engine binding, your agent runtime bridge, your observability tool, service bindings
- Performance: query optimization, indexes, connection pooling, cache ratios
- Security: RLS gaps, auth config, OAuth flows, security debt tracking, webhook validation
- API surface: all 43 route.ts endpoints, webhook handlers, cron routes
- Monitoring: logs, error rates, health checks, advisories

**Scope boundaries:**
- **dev-db** owns Drizzle schema definitions, SQL migrations, and writing new RLS policies from scratch
- **ops-server** owns Docker restarts, your deployment platform deploys, and server-level operations
- **ops-audit** owns infrastructure security (firewall, SSH, TLS, Docker hardening)

## References

Read these when you need deep detail beyond this file:

| Reference | When to read |
|---|---|
| `${CLAUDE_SKILL_DIR}/references/stack-map.md` | Full infrastructure map: containers, networks, env vars, Supabase clients, middleware flow, CSP, schemas, your deployment platform manual recovery, resource inventory |
| `${CLAUDE_SKILL_DIR}/references/rls-patterns.md` | RLS policy patterns, anti-patterns, audit SQL queries, diagnostic SSH commands for audit mode |
| `${CLAUDE_SKILL_DIR}/references/supabase-diagnostics.md` | Deep diagnostics: connection issues, lock contention, cache hit ratios, WAL, failure scenarios |
| `${CLAUDE_SKILL_DIR}/references/multitenant-iam.md` | Gatekeeper, CapabilityManager, impersonation, lifecycle, module system, security debt tracker |
| `${CLAUDE_SKILL_DIR}/references/api-surface.md` | All 43 API routes, frontend connection patterns, webhooks, engine clients, service bindings |

Also read these project docs for architecture context:

| Doc | Where | When |
|---|---|---|
| Architecture V2 | `specs/architecture/ARCHITECTURE-V2.md` | Before making architectural recommendations |
| Agent System | `specs/architecture/AGENT-SYSTEM.md` | When auditing your agent runtime integration or agent routes |
| Current State | `planning/MEMORY.md` | Before any session — know active decisions and blockers |
| Data Page Pattern | `docs/DATA_PAGE_PATTERN.md` | When optimizing API response patterns for frontend |

---

## Stack at a Glance

```
Browser → Caddy (:443) → Kong (YOUR_KONG_CONTAINER :YOUR_KONG_PORT)
  ├─ /rest/v1/*    → PostgREST  → PostgreSQL (YOUR_DB_CONTAINER)
  ├─ /auth/v1/*    → GoTrue     → PostgreSQL
  ├─ /storage/v1/* → Storage    → PostgreSQL + disk
  └─ /realtime/v1/* → Realtime  → PostgreSQL (logical replication)
```

- **Server:** your server — `ssh your-server` (YOUR_SERVER_IP)
- **Stack path:** `/opt/supabase/your-project/` · Config: `/opt/supabase/your-project/.env`
- **second-project second stack:** `second-project-*` containers, Kong `:YOUR_KONG_PORT_2`, `/opt/supabase/second-project/`
- **App:** `SUPABASE_SERVICE_ROLE_KEY` bypasses ALL RLS — server-only, never expose
- **Middleware cookie:** `project_mw` (5 min TTL) — role changes take up to 5 min to propagate
- **GUC pattern:** server client syncs `app.organization_id` via RPC `set_app_organization_id` — project-specific, not standard Supabase

Read `references/stack-map.md` for full container table, env var list, Docker networks, and connection layer details.

---

## Modes

### 1. Health Check (`health`)

End-to-end connectivity verification. Tests every layer of the request chain.

```bash
# All Supabase containers running?
ssh your-server 'docker ps --filter "name=project-" --format "{{.Names}}\t{{.Status}}" | sort'

# Supabase API via Kong
ssh your-server 'curl -sf -o /dev/null -w "%{http_code} %{time_total}s" https://supabase.your-domain.com/rest/v1/ -H "apikey: $(grep ANON_KEY /opt/supabase/your-project/.env | cut -d= -f2)"'

# PostgreSQL alive
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT version(), now(), pg_postmaster_start_time();"'

# Auth / Storage / Realtime services
ssh your-server 'curl -sf -o /dev/null -w "%{http_code} %{time_total}s" https://supabase.your-domain.com/auth/v1/settings'
ssh your-server 'curl -sf -o /dev/null -w "%{http_code} %{time_total}s" https://supabase.your-domain.com/storage/v1/bucket'
ssh your-server 'curl -sf -o /dev/null -w "%{http_code} %{time_total}s" https://supabase.your-domain.com/realtime/v1/'

# App health endpoint
curl -sf -o /dev/null -w "%{http_code} %{time_total}s" https://your-domain.com/api/health

# Connection pool status
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state ORDER BY count DESC;"'
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT application_name, count(*) FROM pg_stat_activity WHERE state IS NOT NULL GROUP BY application_name ORDER BY count DESC;"'
```

**Report format:**
```
## Backend Health — [date]
| Layer   | Service          | Status  | Latency | Notes         |
|---------|------------------|---------|---------|---------------|
| SSL     | Caddy proxy      | OK/FAIL | Xs      | cert expiry   |
| API     | Kong → PostgREST | OK/FAIL | Xs      | HTTP code     |
| DB      | PostgreSQL 17    | OK/FAIL | Xs      | uptime        |
| Auth    | GoTrue           | OK/FAIL | Xs      | settings OK   |
| Storage | Storage API      | OK/FAIL | Xs      | bucket endpoint |
| Realtime| Realtime         | OK/FAIL | Xs      | WS endpoint   |
| App     | Next.js          | OK/FAIL | Xs      | /api/health   |
| Pool    | pg_stat_activity | X/max   | —       | active/idle   |
```

### 2. Security Audit (`audit`)

RLS completeness, Auth configuration, exposed endpoints, token validation, middleware security.

**Step 1 — RLS Audit:** Read `references/rls-patterns.md` § "Audit: Diagnostic SSH Commands" for the 4 psql queries (tables without RLS, RLS with no policies, permissive policies, missing org scope). Run each via `ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "..."'`.

**Step 2 — Auth Configuration:**
```bash
# Public auth settings
ssh your-server 'curl -sf https://supabase.your-domain.com/auth/v1/settings | python3 -m json.tool'

# Env var names for auth (never display values)
ssh your-server 'grep -E "^(JWT_SECRET|ANON_KEY|SERVICE_ROLE_KEY|GOTRUE|MAILER_|SMTP_|EXTERNAL_)" /opt/supabase/your-project/.env | cut -d= -f1'

# Rate limiting
ssh your-server 'grep -iE "rate|limit|throttle" /opt/supabase/your-project/.env'
```

**Step 3 — Middleware Security:**
```bash
# Verify CSP headers are set
curl -sI https://your-domain.com | grep -iE "content-security|strict-transport|x-frame|x-content-type|permissions-policy|referrer-policy"

# Verify internal headers are NOT leaked to client
curl -sI https://your-domain.com | grep -iE "x-org-id|x-user-id|x-member-role"
```

**Step 4 — Storage Buckets:**
```bash
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets ORDER BY name;"'
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT * FROM pg_policies WHERE schemaname = '"'"'storage'"'"';"'
```

**Step 5 — Security Debt:** Check items in the Security Debt Tracker section below.

**Report format:**
```
## Backend Security Audit — [date]

### RLS Coverage
| Schema | Tables | RLS Enabled | Has Policies | Org-Scoped | Gaps |

### Critical Findings
| Severity | Finding | Location | Fix |
| CRITICAL | No RLS on table with org data | schema.table | ALTER TABLE ENABLE RLS + policy |
| HIGH     | USING (true) on tenant data  | schema.table | Restrict to organization_id |
| MEDIUM   | Public storage bucket        | storage.bucket | Review if intentional |

### Auth Config Summary
- JWT expiry: ... · Rate limiting: ... · MFA: ...

### Middleware Security
- CSP: OK/MISSING · HSTS: OK/MISSING · Internal headers leaked: YES/NO
```

### 3. Performance (`performance`)

```bash
# Enable pg_stat_statements
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"'

# Top 10 slowest queries
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT round(mean_exec_time::numeric, 2) as avg_ms, calls,
  round(total_exec_time::numeric, 2) as total_ms, rows, left(query, 120) as query
FROM pg_stat_statements WHERE query NOT LIKE '"'"'%pg_stat%'"'"'
ORDER BY mean_exec_time DESC LIMIT 10;"'

# Sequential scans on large tables (missing indexes)
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT schemaname, relname, n_live_tup, seq_scan, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > 100 AND n_live_tup > 1000 AND (idx_scan IS NULL OR idx_scan = 0)
ORDER BY seq_tup_read DESC LIMIT 15;"'

# Unused indexes (wasted write overhead)
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT schemaname, relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes WHERE idx_scan = 0 AND pg_relation_size(indexrelid) > 8192
ORDER BY pg_relation_size(indexrelid) DESC LIMIT 15;"'

# Table bloat (dead rows)
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT schemaname, relname, n_live_tup, n_dead_tup,
  CASE WHEN n_live_tup > 0 THEN round(100.0 * n_dead_tup / n_live_tup, 1) ELSE 0 END as dead_pct,
  last_vacuum, last_autovacuum
FROM pg_stat_user_tables WHERE n_dead_tup > 100
ORDER BY n_dead_tup DESC LIMIT 15;"'

# Database sizes
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT datname, pg_size_pretty(pg_database_size(datname)) as size FROM pg_database ORDER BY pg_database_size(datname) DESC;"'

# Connection pool + cache hit ratio (should be >99%)
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SHOW max_connections;"'
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT count(*) as total, state FROM pg_stat_activity GROUP BY state;"'
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT round(100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2) as cache_hit_pct
FROM pg_stat_database WHERE datname = current_database();"'
```

### 4. Auth Deep Dive (`auth`)

```bash
# User stats
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT count(*) as total,
  count(*) FILTER (WHERE created_at > now() - interval '"'"'7 days'"'"') as last_7d,
  count(*) FILTER (WHERE last_sign_in_at > now() - interval '"'"'24 hours'"'"') as active_24h
FROM auth.users;"'

# Auth providers + active sessions
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "SELECT provider, count(*) FROM auth.identities GROUP BY provider ORDER BY count DESC;"'
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT count(*),
  count(*) FILTER (WHERE not_after > now()) as active,
  count(*) FILTER (WHERE not_after <= now()) as expired
FROM auth.sessions;"'

# Auth errors + GoTrue config vars (names only, never values)
ssh your-server 'docker logs YOUR_AUTH_CONTAINER --tail 200 2>&1 | grep -i "error\|invalid\|fail" | tail -20'
ssh your-server 'grep -E "^(GOTRUE_|MAILER_|SMTP_|EXTERNAL_)" /opt/supabase/your-project/.env | cut -d= -f1'
```

### 5. Storage (`storage`)

```bash
# Bucket inventory with sizes
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT b.name, b.public, count(o.id) as objects,
  pg_size_pretty(coalesce(sum((o.metadata->>'"'"'size'"'"')::bigint), 0)) as total_size
FROM storage.buckets b LEFT JOIN storage.objects o ON o.bucket_id = b.id
GROUP BY b.name, b.public ORDER BY b.name;"'

# Largest files
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT bucket_id, name, pg_size_pretty((metadata->>'"'"'size'"'"')::bigint) as size, created_at
FROM storage.objects WHERE metadata->>'"'"'size'"'"' IS NOT NULL
ORDER BY (metadata->>'"'"'size'"'"')::bigint DESC LIMIT 20;"'
```

### 6. Realtime (`realtime`)

```bash
ssh your-server 'docker ps --filter "name=project-realtime" --format "{{.Names}}\t{{.Status}}"'
ssh your-server 'docker logs YOUR_REALTIME_CONTAINER --tail 30 2>&1'
ssh your-server 'grep -E "^(REALTIME_|REPLICATION_)" /opt/supabase/your-project/.env | cut -d= -f1'
```

### 7. Edge Functions (`edge-functions`)

Use Supabase MCP tools (load with `ToolSearch` first):
- `mcp__supabase__list_edge_functions` — inventory
- `mcp__supabase__get_edge_function` — read code
- `mcp__supabase__deploy_edge_function` — deploy
- `mcp__supabase__get_logs` (service: `edge-function`) — execution logs

### 8. Monitoring (`monitoring`)

```bash
# PostgreSQL errors (last hour)
ssh your-server 'docker logs YOUR_DB_CONTAINER --since 1h 2>&1 | grep -iE "error|fatal|panic" | tail -20'

# Auth / Kong / Storage errors
ssh your-server 'docker logs YOUR_AUTH_CONTAINER --since 1h 2>&1 | grep -i "error" | tail -20'
ssh your-server 'docker logs YOUR_KONG_CONTAINER --since 1h 2>&1 | grep -E "5[0-9]{2}" | tail -20'
ssh your-server 'docker logs YOUR_STORAGE_CONTAINER --since 1h 2>&1 | grep -i "error" | tail -10'
```

MCP: `mcp__supabase__get_logs` (services: `api`, `postgres`, `auth`, `storage`, `realtime`)
MCP: `mcp__supabase__get_advisors` — security & performance advisories

### 9. your deployment platform Deploy Troubleshooting

**Key rule:** `docker restart` does NOT inject new env vars. your deployment platform injects them at container creation time.

```bash
# RIGHT: Trigger a full deploy via your deployment platform API
COOLIFY_TOKEN="<token>"
curl -s -X POST "http://localhost:8000/api/v1/deploy" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"uuid": "YOUR_APP_UUID", "force_rebuild": true}'
```

If deploy is stuck or fails and manual container recovery is needed, see `references/stack-map.md` § "your deployment platform Manual Recovery" for the full docker run script.

### 10. Resource Audit (`resources`)

```bash
# Container resource usage
ssh your-server 'docker stats --no-stream --format "{{.Name}} | {{.CPUPerc}} | {{.MemUsage}}" | sort -t"|" -k3 -h -r | head -15'

# System resources + Docker disk
ssh your-server 'free -h && echo "---" && df -h / && echo "---" && uptime'
ssh your-server 'docker system df'

# Dangling images (safe to prune)
ssh your-server 'docker images -f "dangling=true" | wc -l'

# Unused systemd services consuming resources
ssh your-server 'systemctl list-units --type=service --state=running | grep -vE "ssh|docker|system|network|cron|ufw|fail2ban|deployment-platform"'

# Ports exposed to 0.0.0.0 (security risk)
ssh your-server 'ss -tlnp | grep "0.0.0.0" | grep -v "127.0.0.1"'
```

Read `references/stack-map.md` § "Resource Inventory" for current usage baseline and past optimization decisions.

---

## MCP Tools Reference

Load with `ToolSearch` before use. Prefer MCP over SSH when available:

| Tool | Use for |
|---|---|
| `mcp__supabase__execute_sql` | Run diagnostic queries directly |
| `mcp__supabase__list_tables` | Schema inventory (`verbose: true`) |
| `mcp__supabase__get_logs` | Structured logs by service |
| `mcp__supabase__get_advisors` | Security & performance advisories |
| `mcp__supabase__list_edge_functions` | Edge Function inventory |
| `mcp__supabase__deploy_edge_function` | Deploy Edge Functions |
| `mcp__supabase__get_project` | Project config |
| `mcp__supabase__list_extensions` | PostgreSQL extensions |
| `mcp__supabase__list_migrations` | Migration history |

---

## Fixing Issues

This skill both **diagnoses AND fixes**. Protocol:

1. **Show the issue** with evidence (query results, log lines)
2. **Propose the fix** with exact SQL/config change
3. **Classify risk:**
   - **Safe:** read-only queries, VACUUM
   - **Medium:** CREATE INDEX CONCURRENTLY, ENABLE RLS, terminate idle connections
   - **High:** ALTER policy, DROP INDEX, config changes requiring restart
   - **Critical:** anything touching auth config, service_role key, production data
4. **Wait for confirmation** on Medium+ risk
5. **Apply and verify** — re-run diagnostic to confirm fix

### Common Fixes

| Issue | Fix | Risk |
|---|---|---|
| Missing RLS | `ALTER TABLE ENABLE ROW LEVEL SECURITY` + org policy | Medium |
| Missing index | `CREATE INDEX CONCURRENTLY` | Low |
| Unused index | `DROP INDEX` (verify zero scans) | Low |
| Table bloat | `VACUUM (VERBOSE) schema.table` | Low |
| Permissive RLS | Rewrite USING clause | High |
| Dead connections | `pg_terminate_backend(pid)` | Medium |
| Expired sessions | `DELETE FROM auth.sessions WHERE not_after < now() - interval '30 days'` | Low |
| Config change | Edit `/opt/supabase/your-project/.env` + restart container | Medium |
| Missing your deployment platform env var | Add via your deployment platform API + full deploy (not restart) | Medium |
| your data engine JWT auth fails | Check `BASEROW_ADMIN_EMAIL` + `BASEROW_ADMIN_PASSWORD` in container env | Low |
| App container down | Manual recovery via stack-map.md § "your deployment platform Manual Recovery" | High |
| Ollama/unused services | `systemctl stop X && systemctl disable X` | Low |

---

## second-project Stack

Same architecture, separate containers. Replace when auditing second-project:

| the active project | second-project |
|---|---|
| `YOUR_DB_CONTAINER` | `second-YOUR_DB_CONTAINER` |
| `YOUR_KONG_CONTAINER` | `second-YOUR_KONG_CONTAINER` |
| `YOUR_AUTH_CONTAINER` | `second-YOUR_AUTH_CONTAINER` |
| Kong :YOUR_KONG_PORT | Kong :YOUR_KONG_PORT_2 |
| `/opt/supabase/your-project/` | `/opt/supabase/second-project/` |
| `supabase.your-domain.com` | `supabase.second-project.com` |
| Network: `your_project_network` | Network: `second-your_project_network` |

---

## Security Debt Tracker

Read `references/multitenant-iam.md` for full details. Check these items during every `/dev-backend audit`:

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| SEC-DEBT-01 | OAuth tokens stored plaintext in `iam.identities.metadata` | HIGH | V2 will encrypt via Vault |
| SEC-DEBT-02 | Signed URLs irrevocable for 1 hour | MEDIUM | Use backend proxy for sensitive files |
| SEC-DEBT-03 | `DEMO_MODE_ENABLED` bypasses all auth | HIGH | Never enable in production |
| SEC-DEBT-04 | Auth callback `next` param = open redirect | MEDIUM | Whitelist allowed targets |
| SEC-DEBT-05 | Impersonation tokens are plaintext UUIDs | MEDIUM | Upgrade to signed JWTs |
| SEC-DEBT-06 | Permission cache per-process only (60s) | LOW | Add Redis when fleet scales |
| SEC-DEBT-07 | Usage counter race condition | LOW | Atomic DB increment |

---

## Multi-Tenant Architecture (Summary)

Read `references/multitenant-iam.md` for the deep dive.

**Data isolation chain:**
```
Browser → Middleware (strips spoofed headers)
  → JWT validation (supabase.auth.getClaims, local, no network)
  → Membership lookup (iam.members → organization_id + role)
  → Cookie cache (project_mw, 5min TTL)
  → X-Org-Id header injection
  → Server client syncs GUC (set_app_organization_id RPC)
  → RLS policies filter by organization_id
```

**Permission enforcement layers:**
1. **Middleware** — route protection (PROTECTED/PUBLIC/API_BYPASS), admin guards, lifecycle blocks
2. **Gatekeeper** — RBAC + ReBAC canDo() checks (60s in-memory cache)
3. **CapabilityManager** — subscription tier limits + usage quotas
4. **RLS** — PostgreSQL enforces org isolation at query level (last line of defense)

**Key files to audit when checking multi-tenant security:**
- `apps/platform/middleware.ts` — auth flow, header injection, CSP
- `apps/platform/lib/routes.ts` — which routes are protected/public
- `packages/core/iam/gatekeeper.ts` — permission engine
- `packages/core/iam/capability-manager.ts` — feature gating
- `packages/core/iam/assistance-manager.ts` — impersonation sessions
- `apps/platform/lib/engine-clients.ts` — AuthContext builder + DEMO_MODE risk

---

## Backend Services Beyond Supabase

Read `references/api-surface.md` for full API route inventory.

| Service | Access | Purpose | Security |
|---------|--------|---------|----------|
| **your data engine** | 127.0.0.1:8300 | Business data engine (tables, fields, rows) | Per-org workspace binding via `system.service_bindings` |
| **your agent runtime** | :YOUR_AGENT_PORT | Agent runtime (dispatch, sessions, skills) | Gateway token auth |
| **your observability tool** | 127.0.0.1:3100 | Observability (traces, cost tracking) | Internal only |
| **Stripe** | External API | Billing, subscriptions | Webhook HMAC validation |
| **Resend** | External API | Transactional email | API key in env |

Browser NEVER talks to these directly — all proxied through Next.js API routes.

---

## Notes

- This skill complements, never duplicates: dev-db / ops-server / ops-audit
- Supabase self-hosted = no cloud dashboard — use MCP tools + SQL + SSH
- Secrets are NEVER displayed — only existence (OK/FAIL) or key names
- The GUC pattern (`set_app_organization_id`) is project-specific — not standard Supabase
- Middleware cookie cache (`project_mw`, 5min TTL) means role changes take up to 5min to propagate
- The `@supabase/ssr` package handles cookie-based auth; `@supabase/supabase-js` is the base client
- 43 API routes total — webhooks are public (must validate signatures)
- 13 engine client modules in `packages/core/*/client.ts` — all take SupabaseClient
- Service bindings in `system.service_bindings` — org → external service secret resolution
