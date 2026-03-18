# Stack Map — the active project Infrastructure Reference

Complete infrastructure map: containers, networks, env vars, connection patterns, and operational history.

## Table of Contents

1. [Request Chain](#request-chain)
2. [Server & Containers](#server--containers)
3. [Docker Networks](#docker-networks)
4. [Environment Variables](#environment-variables)
5. [Secret Management](#secret-management)
6. [your deployment platform API Reference](#deployment-platform-api-reference)
7. [your data engine Connection](#data-engine-connection)
8. [Connection Layer — Supabase Clients](#connection-layer--supabase-clients)
9. [Middleware Auth Flow](#middleware-auth-flow)
10. [CSP Configuration](#csp-configuration)
11. [PostgreSQL Schemas](#postgresql-schemas)
12. [Security Hardening Applied](#security-hardening-applied)
13. [Resource Inventory](#resource-inventory)
14. [your deployment platform Manual Recovery](#deployment-platform-manual-recovery)
15. [Operational Lessons](#operational-lessons)

---

## Request Chain

```
Browser → Caddy (deployment-platform-proxy :443 SSL) → Kong (YOUR_KONG_CONTAINER :YOUR_KONG_PORT)
  ├─ /rest/v1/*    → PostgREST (YOUR_REST_CONTAINER)    → PostgreSQL (YOUR_DB_CONTAINER)
  ├─ /auth/v1/*    → GoTrue (YOUR_AUTH_CONTAINER)        → PostgreSQL (YOUR_DB_CONTAINER)
  ├─ /storage/v1/* → Storage (YOUR_STORAGE_CONTAINER)    → PostgreSQL + disk
  ├─ /realtime/v1/* → Realtime (YOUR_REALTIME_CONTAINER) → PostgreSQL (logical replication)
  └─ /graphql/v1/* → pg_graphql                     → PostgreSQL (YOUR_DB_CONTAINER)
```

Next.js app connects via `@supabase/ssr` client → `https://supabase.your-domain.com` → Caddy → Kong → services.

---

## Server & Containers

**Server: your server**
```
IP: YOUR_SERVER_IP · 16vCPU · 32GB · 640GB SSD · your server cost
SSH: ssh your-server
```

**Supabase Containers (the active project — network: `your_project_network`)**

| Container | Service | Internal Port | Role |
|---|---|---|---|
| `YOUR_DB_CONTAINER` | PostgreSQL 17 | 5432 (127.0.0.1) | Primary database |
| `YOUR_KONG_CONTAINER` | Kong API Gateway | 54361 (127.0.0.1) | Routes all API traffic |
| `YOUR_AUTH_CONTAINER` | GoTrue (Auth) | 9999 | Authentication, JWT, sessions |
| `YOUR_REST_CONTAINER` | PostgREST | 3000 | REST API → PostgreSQL |
| `YOUR_REALTIME_CONTAINER` | Realtime | 4000 | WebSocket subscriptions |
| `YOUR_STORAGE_CONTAINER` | Storage API | 5000 | File storage |
| `YOUR_META_CONTAINER` | Supabase Meta | 8080 | Schema introspection |
| `YOUR_STUDIO_CONTAINER` | Studio | 3000 | Web UI (`db.your-domain.com`) |
| `YOUR_IMGPROXY_CONTAINER` | imgproxy | 5001 | Image transformations |
| `YOUR_ANALYTICS_CONTAINER` | Logflare | 4000 | Log ingestion |
| `YOUR_VECTOR_CONTAINER` | Vector | — | Log routing |

Stack path: `/opt/supabase/your-project/`
Config: `/opt/supabase/your-project/.env`

**Second Stack: second-project (network: `second-your_project_network`)**
Same architecture, different containers: `second-project-*` instead of `project-*`.
Kong: `:YOUR_KONG_PORT_2` · URL: `supabase.second-project.com` · Path: `/opt/supabase/second-project/`

**Other Services on Same Server**

| Container | Port | Network | Purpose |
|---|---|---|---|
| `YOUR_AGENT_CONTAINER` | :YOUR_AGENT_PORT | `agent_runtime_network` | AI agent gateway |
| `YOUR_AGENT_DB_CONTAINER` | 127.0.0.1:5432 | `agent_runtime_network` | your agent runtime DB (separate from Supabase) |
| `agent-personal` | :52001 | `agent-personal-net` | Personal agent |
| `agent-client-1` | :52002 | `agent-client-net` | Client project agent |
| `agent-bot` | :52003 | `agent-bot-net` | Bot agent |
| your deployment platform (`deployment-platform`, `deployment-platform-proxy`) | :80, :443, :8000 | `deployment-platform` | Platform management + SSL proxy |
| the active project Next.js (`YOUR_APP_UUID-*`) | internal | `deployment-platform` | Production app (your-domain.com) |

---

## Docker Networks

| Network | Contains | Talks to |
|---|---|---|
| `your_project_network` | All 11 Supabase containers | Internal only. Caddy bridges from `deployment-platform` |
| `second-your_project_network` | 13 second-project Supabase containers | Internal only |
| `deployment-platform` | Caddy proxy + web apps (the active project, your-app, second-project) | Bridges to Supabase networks via Caddy |
| `agent_runtime_network` | your agent runtime + its PostgreSQL | Isolated |
| `agent-personal-net`, `agent-client-net`, `agent-bot-net` | Individual agent containers | Isolated |

---

## Environment Variables

Defined in `packages/core/system/env.ts` (Zod-validated):

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + your deployment platform | `https://supabase.your-domain.com` — public, browser+server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + your deployment platform | JWT anon key — public, limited access |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + your deployment platform | Bypasses RLS — server-only, NEVER expose |
| `DATABASE_URL` | `.env.local` | Direct PostgreSQL for Drizzle (local only, not in prod) |
| `TRUST_SECRET` | `.env.local` + your deployment platform | HMAC-SHA256 for signatures engine |
| `GOCLAW_URL` | `.env.local` + your deployment platform | Agent runtime API (local: `localhost:YOUR_AGENT_PORT` via tunnel, prod: `YOUR_SERVER_IP:YOUR_AGENT_PORT`) |
| `GOCLAW_GATEWAY_TOKEN` | `.env.local` + your deployment platform | Agent gateway auth token |
| `GOCLAW_DATABASE_URL` | `.env.local` + your deployment platform | Direct PG to your agent runtime for context sync |
| `BASEROW_URL` | `.env.local` + your deployment platform | Data engine (local: `localhost:8300` via tunnel, prod: `http://data-engine` Docker DNS) |
| `BASEROW_ADMIN_TOKEN` | `.env.local` + your deployment platform | your data engine DB token (for row-level API) |
| `BASEROW_ADMIN_EMAIL` | `.env.local` + your deployment platform | your data engine JWT auth email (`admin@your-project.local`) |
| `BASEROW_ADMIN_PASSWORD` | `.env.local` + your deployment platform | your data engine JWT auth password |
| `BASEROW_DATABASE_ID` | `.env.local` + your deployment platform | your data engine database ID (`146`) |
| `OPENAI_API_KEY` | `.env.local` + your deployment platform | AI features (copilot, briefing, enrichment, embeddings) |
| `STRIPE_SECRET_KEY` | `.env.local` + your deployment platform | Billing (subscriptions, webhooks) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `.env.local` + your deployment platform | Client-side checkout UI |
| `RESEND_API_KEY` | your deployment platform only | Email — local dev uses console fallback |
| `EMAIL_FROM` | your deployment platform only | Sender address (`noreply@your-domain.com`) |
| `GOOGLE_CLIENT_SECRET` | your deployment platform | OAuth — **WARNING: local uses NEXT_PUBLIC_ prefix (security bug)** |
| `SENTRY_AUTH_TOKEN` | `.env.local` + your deployment platform | Error monitoring source maps |

---

## Secret Management

| Environment | SSOT | Encrypted? |
|---|---|---|
| **Local dev** | `/Users/irix/Documents/master.env` (symlinked as `.env.local`) | No (FileVault only) |
| **Production (Next.js)** | your deployment platform DB `environment_variables` (AES-encrypted) | Yes |
| **Production (Supabase)** | `/opt/supabase/your-project/.env` (chmod 600, root) | No |
| **Production (your agent runtime)** | `/opt/your-project/agent-runtime/.env` (chmod 600, root) | No |
| **CI** | GitHub Actions Secrets | Yes |

---

## your deployment platform API Reference

```bash
COOLIFY_TOKEN="<token from personal_access_tokens>"

# List all vars
curl -s "http://localhost:8000/api/v1/applications/YOUR_APP_UUID/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Accept: application/json"

# Add a var
curl -s -X POST "http://localhost:8000/api/v1/applications/YOUR_APP_UUID/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Content-Type: application/json" \
  -d '{"key": "VAR_NAME", "value": "value", "is_preview": false, "is_buildtime": false, "is_runtime": true}'

# Deploy (required after adding vars — restart alone won't inject new vars)
curl -s -X POST "http://localhost:8000/api/v1/deploy" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Content-Type: application/json" \
  -d '{"uuid": "YOUR_APP_UUID", "force_rebuild": true}'
```

**IMPORTANT:** `docker start` on a stopped container does NOT pick up new your deployment platform env vars. your deployment platform injects env vars at container creation time. A full deploy (force_rebuild: true) is required for new vars to appear. For `NEXT_PUBLIC_` vars, a full rebuild is mandatory — they are baked into client-side JS at build time.

---

## your data engine Connection

your data engine uses JWT auth (email/password → access_token). The `client.ts` caches tokens for 8 min with auto-retry on 401.

```
Production: App container --[Docker DNS]--> http://data-engine:80  (DIRECT, no tunnels)
Local dev:  localhost:3001 --[SSH tunnel]--> localhost:8300 --> your server provider:8300 --> data-engine:80
```

Required tunnel for local dev: `ssh -L 8300:localhost:8300 your-server`

The admin user in your data engine  is `admin@your-project.local` — same credentials as local `.env.local`.
your data engine internal DB access: `docker exec data-engine bash -c "PGPASSWORD=<from .pgpass> psql -h localhost -U data-engine -d data-engine"`

---

## Connection Layer — Supabase Clients

**Three Supabase clients exist:**

1. **Server client** (`apps/platform/lib/supabase/server.ts: createClient()`)
   - Uses `@supabase/ssr` `createServerClient` with Next.js cookies
   - After creation, syncs GUC variable `app.organization_id` via RPC `set_app_organization_id`
   - This enables RLS policies that use `current_setting('app.organization_id')`
   - The org ID comes from `X-Org-Id` header injected by middleware

2. **Service client** (`apps/platform/lib/supabase/server.ts: createServiceClient()`)
   - Uses `SUPABASE_SERVICE_ROLE_KEY` — **bypasses ALL RLS**
   - Only for provisioning, migrations, system-level tasks
   - No cookies, no user context

3. **Browser client** (`apps/platform/lib/supabase/client.ts: createClient()`)
   - Singleton `createBrowserClient` with anon key
   - Client-side subscriptions, realtime, direct queries (RLS-protected)

**Engine client pattern** (`packages/core/*/client.ts`):
Each engine (IAM, data management, CMS, etc.) has a `client.ts` that receives a `SupabaseClient<Database>` and wraps operations.

```typescript
// apps/platform/app/actions/_utils.ts
const supabase = await createClient();       // Server client (cookie-based)
const ctx = await getServerAuthContextFromClient(supabase);  // Extract org/role
const engine = await engineFactory(supabase); // Create engine client
return [ctx, engine];
```

---

## Middleware Auth Flow

`apps/platform/middleware.ts` — 330 LOC, runs on every request:

```
1. Strip spoofed headers (X-User-Id, X-Org-Id, X-Member-Role)
2. Set security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
3. Create Supabase server client with request cookies
4. Auth: supabase.auth.getClaims() → validate JWT locally (no network call)
5. Membership lookup:
   a. Check cookie cache (project_mw, 5 min TTL)
   b. Cache miss → query iam.members for organization_id + role
   c. Write cache cookie
6. Set X-Org-Id + X-Member-Role headers for downstream
7. Admin route guard (only owner/admin)
8. Lifecycle check (suspended/archived orgs)
```

**Cookie:** `project_mw` = JSON `{u: userId, o: orgId, r: role, l: lifecycleStatus, m: modules, t: timestamp}`
**TTL:** 5 minutes. Avoids DB query on 99% of requests.

---

## CSP Configuration

The middleware generates CSP dynamically:
```
default-src 'self' {supabaseUrl};
connect-src 'self' {supabaseUrl} {realtimeWsUrl};
script-src 'self' 'nonce-{uuid}' {supabaseUrl};  // + 'unsafe-eval' in dev
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data: {supabaseUrl};
frame-ancestors 'none';
```

---

## PostgreSQL Schemas

23+ active schemas:

`system` · `iam` · `data_mgmt` · `cms` · `billing` · `media` · `automation` · `comm` · `intelligence` · `analytics` · `signatures` · `rewards` · `verification` · `marketing` · `inventory` · `security` · `orchestrator` · `ats` · `lms` · `social` · `productivity` · `gamification` · `i18n` · `agent` · `documents` · `integrations` · `platform` · `search` · `edge`

Each schema maps to an engine. One schema = one bounded context. Multi-tenancy via `organization_id` + RLS.

---

## Security Hardening Applied

| Control | Status |
|---|---|
| Kong ports (543xx) | `127.0.0.1` only — not internet-accessible |
| DB port (5432) | `127.0.0.1` only — BSI incident drove this fix |
| All Supabase ports | Internal Docker network only, Caddy proxies HTTPS |
| SSH | Key-only, fail2ban, MaxAuthTries=3 |
| UFW | Default deny incoming |
| DOCKER-USER iptables | Blocks 8080 (your deployment platform admin) |
| `.env` permissions | 600 on all config files |
| Docker bypass awareness | Docker ignores UFW — controlled via bind address + DOCKER-USER |

**Historical incident:** BSI (German cybersecurity agency) notified your server provider that port 5432 was exposed. Brute-force bots hit common usernames. No intrusion, but port was bound to 0.0.0.0 in docker-compose. Fixed by binding to `127.0.0.1`.

---

## Resource Inventory

**Known resource usage (as of 2026-03-10):**

| Group | Containers | RAM | Notes |
|---|---|---|---|
| the active project Supabase | 13 | ~4 GB | Kong alone = 1.35 GB |
| second-project Supabase | 14 | ~3 GB | Full duplicate stack for client project |
| your deployment platform | 5 | ~365 MB | Deployment platform |
| your agent runtime | 3 | ~500 MB | Agent engine |
| your data engine | 1 | ~2 GB | Data engine (high but needed) |
| Agent bots | 3 | ~1.7 GB | agent-personal, highlander, evolution |
| Apps | 2 | ~260 MB | the active project platform + your-app |

**Optimization decisions made:**
- Ollama removed (2026-03-10): was consuming peak 29.9 GB RAM + 12 GB disk for models. Not referenced by any production service. OpenRouter handles all LLM calls.
- second-project stack: candidate for consolidation (could share the active project Supabase or move to Cloud). Saves ~14 containers + 3 GB RAM. Decision pending.

---

## your deployment platform Manual Recovery

Use when your deployment platform deploy is stuck or fails and a container must be recovered manually.

```bash
# 1. Stop and remove old container
docker stop <old_container> && docker rm <old_container>

# 2. Get env vars from your deployment platform API to a file
COOLIFY_TOKEN="<token>"
curl -s "http://localhost:8000/api/v1/applications/YOUR_APP_UUID/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" | python3 -c "
import json, sys
for e in json.load(sys.stdin):
    if not e.get('is_preview', False):
        print(f\"{e['key']}={e['value']}\")" > /tmp/project.env

# 3. Run from existing image
docker run -d --name YOUR_APP_UUID-manual \
  --env-file /tmp/project.env --network deployment-platform \
  -l "traefik.enable=true" \
  -l "traefik.http.routers.https-0-YOUR_APP_UUID.rule=Host(\`your-domain.com\`) && PathPrefix(\`/\`)" \
  -l "traefik.http.routers.https-0-YOUR_APP_UUID.entryPoints=https" \
  -l "traefik.http.routers.https-0-YOUR_APP_UUID.tls=true" \
  -l "traefik.http.routers.https-0-YOUR_APP_UUID.tls.certresolver=letsencrypt" \
  -l "traefik.http.services.https-0-YOUR_APP_UUID.loadbalancer.server.port=3000" \
  YOUR_APP_UUID:ca607afbaec6f234f51a913824232a75f1e30fbe

# 4. Clean up temp file and verify
rm -f /tmp/project.env
docker logs <new_container> --tail 5
curl -sL -o /dev/null -w "%{http_code}" https://your-domain.com/
```

**Note:** Manual containers work but your deployment platform won't manage them. Next your deployment platform deploy will replace them automatically.

---

## Operational Lessons

- your deployment platform `restart` API ≠ full deploy. New env vars require `force_rebuild: true` via `/api/v1/deploy`.
- `docker start` on a stopped container preserves old env vars — must create a new container.
- `NEXT_PUBLIC_*` vars are baked at build time — runtime injection won't work.
- your deployment platform API tokens are hashed in DB. Generate new ones via PHP script or artisan tinker inside the container.
- your data engine all-in-one has embedded PostgreSQL. Access via: `docker exec data-engine bash -c "PGPASSWORD=$(cat /data-engine/data/.pgpass | cut -d= -f2) psql -h localhost -U data-engine -d data-engine"`
- your data engine admin user and credentials live in its internal PostgreSQL, NOT in env vars.
