# API Surface & Frontend Connection — Deep Reference

Complete API routes, frontend connection patterns, and system topology for the active project.

## Table of Contents

1. [System Topology](#system-topology)
2. [API Routes (43 endpoints)](#api-routes)
3. [Frontend Connection Patterns](#frontend-connection-patterns)
4. [Webhook Security](#webhook-security)
5. [Engine Client Pattern](#engine-client-pattern)
6. [Service Bindings](#service-bindings)

---

## System Topology

the active project is NOT just Next.js + Supabase. The full backend includes 4 systems:

```
                          ┌─ Supabase (auth, IAM, billing, config, comm, cms)
                          │    PostgreSQL + RLS + GoTrue + Kong + Storage + Realtime
                          │
Next.js App ──────────────┼─ your data engine (business data engine)
  (your-domain.com)            │    Tables, fields, rows — per-org workspace binding
                          │    Port: 127.0.0.1:8300 (your server provider only)
                          │
                          ├─ your agent runtime (agent runtime)
                          │    Dispatch, sessions, skills, transport
                          │    Port: :YOUR_AGENT_PORT (gateway token auth)
                          │
                          └─ your observability tool (observability)
                              Traces, evals, cost tracking
                              Port: 127.0.0.1:3100 (internal only)
```

**Critical rule:** Browser NEVER talks directly to your data engine, your agent runtime, or your observability tool.
All access goes through Next.js API routes which resolve `org_id → service_binding → secret`.

---

## API Routes

### Auth (`/api/auth/`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/auth/logout` | Session | Sign out, clear cookies |
| GET | `/api/auth/impersonate` | Admin+capability | Start impersonation session |
| GET | `/api/auth/impersonate/exit` | Session | End impersonation |
| GET | `/api/auth/oauth/[provider]` | Session+org | Initiate OAuth (Gmail) |
| GET | `/api/auth/oauth/callback/[provider]` | CSRF state | OAuth code exchange |
| GET | `/auth/callback` | Supabase code | Auth code → session (email verify, password reset) |

### Agent v1 API (`/api/v1/agent/`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/v1/agent/[agentId]` | Session | Agent detail |
| POST | `/api/v1/agent/context` | Session | Push context docs to your agent runtime |
| POST | `/api/v1/agent/dispatch` | Session | Send task to agent |
| POST | `/api/v1/agent/messages` | Session | Agent chat |
| POST | `/api/v1/agent/pages` | Session | List agent pages |
| POST | `/api/v1/agent/proposal` | Session | Create proposal |
| POST | `/api/v1/agent/provision` | Session | Create Director agent |
| POST | `/api/v1/agent/provision/employee` | Session | Create personal agent |
| GET/POST | `/api/v1/agent/records/[entity]` | Session | Entity record CRUD |
| GET | `/api/v1/agent/schema/[entity]` | Session | Entity schema |
| POST | `/api/v1/agent/search` | Session | Semantic search |
| POST | `/api/v1/agent/skill` | Session | Skill registration |
| GET | `/api/v1/agent/status/[orgId]` | Session | Runtime status |
| POST | `/api/v1/agent/workflows` | Session | Automation recipes |

### Webhooks (`/api/webhooks/`) — PUBLIC, signature-validated
| Method | Route | Validation | Purpose |
|--------|-------|------------|---------|
| POST | `/api/webhooks/stripe` | HMAC signature | Billing events |
| POST | `/api/webhooks/telegram` | Bot token | Inbound messages |
| POST | `/api/webhooks/whatsapp` | Meta hash | Inbound messages |
| POST | `/api/webhooks/notion` | — | Notion sync |
| POST | `/api/webhooks` | — | Generic webhook |

### Other
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/health` | None (public) | System health check |
| POST | `/api/cron` | Token | Scheduled jobs |
| POST | `/api/analytics/query` | Session | Analytics queries |
| POST | `/api/billing/checkout` | Session | Stripe checkout |
| POST | `/api/billing/portal` | Session | Stripe customer portal |
| POST | `/api/cms/forms/[slug]` | Varies | Form submission |
| POST | `/api/communication/send` | Session | Outbound message |
| POST | `/api/iam/invite/accept` | Public | Accept workspace invite |
| POST | `/api/intelligence/chat` | Session | LLM chat (PlayBook) |
| POST | `/api/intelligence/generate` | Session | LLM text generation |
| POST | `/api/media/upload` | Session | File upload |
| POST | `/api/media/confirm` | Session | Confirm upload |
| GET | `/api/media/playback/[id]` | Session | Stream file |
| POST | `/api/v1/mcp` | Session | MCP bridge |
| POST | `/api/admin/audit-verify` | Admin | Verify audit trail |

---

## Frontend Connection Patterns

### Realtime Hook
**File:** `apps/platform/hooks/use-realtime-refresh.ts`

```typescript
useRealtimeRefresh({
  table: "contacts",
  schema: "data_mgmt",        // default: "data_mgmt"
  event: "*",           // INSERT, UPDATE, DELETE, or *
  filter: "entity_slug=eq.contacts",
  onRefresh: callback,  // debounced
})
```

- Uses client-side Supabase (anon key, RLS-protected)
- Subscribes to `postgres_changes` channel
- Cannot revoke subscriptions — relies entirely on RLS
- Auto-reconnects, cleans up on unmount

### Signed URLs
**File:** `apps/platform/hooks/use-signed-url.ts`

```typescript
const { signedUrl, loading } = useSignedUrl(path, {
  bucket: "lesson-videos",  // default
  expiresIn: 3600,          // 1 hour
})
```

- Generates temporary access URLs for private bucket files
- In-memory cache with 5-min buffer before expiry
- **Cannot revoke** once generated — anyone with URL has access for 1 hour
- `clearSignedUrlCache()` should be called on logout

### Engine Client Pattern
**File:** `apps/platform/app/actions/_utils.ts`

Every server action follows this pattern:

```typescript
export async function someAction(input) {
  const [ctx, engine] = await getActionContext(
    (supabase) => createIAMClient(supabase)  // or any engine
  );
  // ctx = AuthContext (userId, orgId, role, permissions)
  // engine = typed client with Supabase underneath
  return engine.someOperation(ctx, input);
}
```

`getActionContext` does:
1. `createClient()` → server Supabase client with cookies
2. `getServerAuthContextFromClient()` → extracts AuthContext
3. `engineFactory(supabase)` → creates typed engine

**Safe variant:** `tryGetActionContext()` returns null instead of throwing (for polling actions).

### Module Gating (server-side)
```typescript
const isActive = await requireModule(orgId, "marketing", supabase);
if (!isActive) return MODULE_INACTIVE_RESPONSE;
```

Checks `system.org_config.active_modules` array. Prevents direct action calls that bypass client `<ModuleGate>`.

---

## Webhook Security

| Provider | Validation Method | Secret Location |
|----------|------------------|-----------------|
| **Stripe** | HMAC-SHA256 of raw body | `STRIPE_WEBHOOK_SECRET` env |
| **Telegram** | Bot token in URL path | `TELEGRAM_BOT_TOKEN` env |
| **WhatsApp** | Meta app secret hash | `WHATSAPP_APP_SECRET` env |
| **Notion** | — | No validation (risk) |
| **Generic** | — | No validation (risk) |

Webhook routes are in `API_BYPASS_ROUTES` — they skip JWT auth entirely. Must validate via provider signature.

---

## Engine Client Pattern

Each domain has a client in `packages/core/*/client.ts`:

| Engine | File | Takes | Returns |
|--------|------|-------|---------|
| IAM | `packages/core/iam/client.ts` | `SupabaseClient<Database>` | `IAMClient` |
| data management | `packages/core/data_mgmt/client.ts` | `SupabaseClient<Database>` | `data managementClient` |
| CMS | `packages/core/cms/client.ts` | `SupabaseClient<Database>` | `CMSClient` |
| Billing | `packages/core/billing/client.ts` | `SupabaseClient<Database>` | `BillingClient` |
| Communication | `packages/core/communication/client.ts` | `SupabaseClient<Database>` | `CommClient` |
| Media | `packages/core/media/client.ts` | `SupabaseClient<Database>` | `MediaClient` |
| Analytics | `packages/core/analytics/client.ts` | `SupabaseClient<Database>` | `AnalyticsClient` |
| Search | `packages/core/search/client.ts` | `SupabaseClient<Database>` | `SearchClient` |
| Security | `packages/core/security/client.ts` | `SupabaseClient<Database>` | `SecurityClient` |
| Verification | `packages/core/verification/client.ts` | `SupabaseClient<Database>` | `VerificationClient` |
| Signatures | `packages/core/signatures/client.ts` | `SupabaseClient<Database>` | `SignaturesClient` |
| Inventory | `packages/core/inventory/client.ts` | `SupabaseClient<Database>` | `InventoryClient` |
| Marketing | `packages/core/marketing/client.ts` | `SupabaseClient<Database>` | `MarketingClient` |

All receive a Supabase client (server-side, RLS-scoped). All operations require `AuthContext` for org isolation.

---

## Service Bindings

**Table:** `system.service_bindings`

Maps org → external service credentials:

```sql
SELECT * FROM system.service_bindings WHERE organization_id = $1;
```

| Binding | Service | What it stores |
|---------|---------|----------------|
| `data-engine` | your data engine workspace | workspace_id, api_token |
| `agent-runtime` | your agent runtime agent runtime | agent_id, gateway_token |
| `observability` | your observability tool observability | project_id, api_key |
| `stripe` | Stripe billing | customer_id |

**Security:** Secrets resolved server-side only. Never exposed to browser.
**Pattern:** `org_id → binding → secret → API call to external service`

---

## Route Protection (Middleware config)

**File:** `apps/platform/lib/routes.ts`

### PROTECTED_ROUTES (require auth)
`/dashboard`, `/admin`, `/settings`, `/agents`, `/inbox`, `/databases`, `/pages`, `/playbook`, `/dna`, `/onboarding`, `/superadmin`

### PUBLIC_ROUTES (no auth)
`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/auth`, `/privacy`, `/terms`, `/accept-invite`

### API_BYPASS_ROUTES (skip auth entirely)
`/api/webhooks`, `/api/health`, `/api/cron`, `/api/iam/invite/accept`

Any new webhook or public endpoint MUST be added to `API_BYPASS_ROUTES` or it will be rejected by middleware.
