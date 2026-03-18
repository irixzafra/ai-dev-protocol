# Multi-Tenant IAM — Deep Reference

the active project multi-tenancy architecture: permission enforcement, feature gating, impersonation, lifecycle.

## Table of Contents

1. [Gatekeeper — Permission Engine](#gatekeeper)
2. [Capability Manager — Feature Gating](#capability-manager)
3. [Assistance Manager — Impersonation](#assistance-manager)
4. [Auth Context Builder](#auth-context-builder)
5. [Lifecycle Middleware](#lifecycle-middleware)
6. [Superadmin Middleware](#superadmin-middleware)
7. [Module System](#module-system)
8. [Error Mapping](#error-mapping)
9. [Known Security Debt](#known-security-debt)

---

## Gatekeeper

**File:** `packages/core/iam/gatekeeper.ts`

Hybrid RBAC + ReBAC permission enforcement. Every sensitive operation goes through:

```typescript
canDo(authContext, action, resource, resourceContext?) → boolean
assertCanDo(...) → throws PermissionDeniedError
```

- **In-memory cache** keyed by `(organizationId, userId)`, **60s TTL**
- No Redis / distributed cache — permission changes may lag across fleet instances
- RBAC check first (role → permissions), ReBAC fallback (ownership, org membership)
- Optional audit logging via `auditPermissionChecks` config

### Audit concerns
- Cache is per-process, not shared — role changes take up to 60s to propagate
- No distributed invalidation — if multiple Next.js workers exist, they each have separate caches

---

## Capability Manager

**File:** `packages/core/iam/capability-manager.ts`

Subscription-tier feature gating:

```typescript
checkCapability(id: CapabilityId, auth: AuthContext, amount?: number)
→ { allowed: boolean, reason?: string }
```

### Flow
1. Lookup `billing.subscriptions` for org → get `price_id + status`
2. Map to tier (`free|starter|pro|enterprise`)
3. Check `organizations.settings.capability_overrides` for org-specific overrides
4. `UsageTracker` increments monthly counters per capability

### Key details
- Monthly quota resets by calendar month (not anniversary)
- `-1` = unlimited, numeric = hard limit, boolean = feature flag
- No distributed lock — usage increments have race condition potential
- Usage is counter-based, not event-logged — thin audit trail

---

## Assistance Manager

**File:** `packages/core/iam/assistance-manager.ts`

Support impersonation sessions:

1. Creates `iam.assistance_sessions` record: actor_id, target_member_id, token (UUID), expires_at, reason
2. Validation: token + org membership + status=active + not expired
3. Revocation: status→revoked, records revoked_by + revoked_at
4. Audit: logs `assistance.started | assistance.revoked`

### Security concerns
- Token is plaintext UUID — should be signed JWT with claims
- No rate limiting — admin could spam sessions
- Default duration: 30 min
- No granular capability grants — assumes full user impersonation

---

## Auth Context Builder

**File:** `packages/core/iam/context.ts`

### AuthContext (canonical structure)

```typescript
interface AuthContext {
  userId: string;           // auth.uid()
  memberId?: string;        // member record ID
  organizationId: string;   // from iam.members
  role: string;             // role_slug
  permissions: string[];    // from role_definitions
  impersonatedBy?: string;  // if assistance session
  correlationId: string;    // request tracing UUID
  locale: string;           // default "en"
  timezone: string;         // default "UTC"
  source: "session" | "header" | "cache" | "internal" | "api_key";
}
```

### Resolution pipeline
1. `getOrganizationId()` → Supabase session → auth.uid() → iam.members → organization_id
2. `getOrganizationIdFromHeader()` → X-Organization-ID header (API routes fallback)
3. `getOrganizationIdHybrid()` → try session first, fall back to header

### Known issue
No `.eq("organization_id", expectedOrgId)` in membership query — user with multiple org memberships gets first match, not intended org. Patched by middleware layer but core doesn't enforce it.

---

## Lifecycle Middleware

**File:** `apps/platform/lib/middleware/lifecycle-check.ts`

Blocks requests to suspended/archived organizations:

```
IF lifecycle_status IN ("suspended", "archived"):
  BLOCK all except:
    - Public routes (/login, /signup, /forgot-password, /api/auth/*)
    - Reactivation page (/org/settings/lifecycle) — GET only
    - Superadmin bypass (env OPENBOX_SUPERADMIN_ORG_ID + owner/admin role)
```

- Accepts pre-fetched lifecycleStatus (zero extra DB query)
- Returns 303 redirect to `/suspended` with `X-Lifecycle-Status` header
- No logging of which org was blocked

---

## Superadmin Middleware

**File:** `apps/platform/lib/middleware/superadmin-check.ts`

Gates `/superadmin/*` routes:

```sql
SELECT user_id FROM iam.superadmins WHERE user_id = $1
```

- Global — not scoped to any org
- One DB query per request (no cache)
- Returns 403 HTML page on denial
- No audit log on denied access
- No IP whitelist, no rate limiting

---

## Module System

**Table:** `system.org_config.active_modules`

Per-org feature activation:

```typescript
// Schema
orgConfig: {
  organization_id: uuid,
  vertical: "school" | "talent" | "legal" | "custom",
  activeModules: string[], // ["02b_ATS", "12a_LMS", ...]
  navigationPreset: "minimal" | "standard" | "advanced" | "custom",
  branding: jsonb,
}
```

- Client-side hook `useOrgConfig()` with 5-min in-memory cache
- No permission check — anyone loading org_config can read activeModules
- No version history — can't track when/why modules were toggled
- No dependency checks — can activate LMS without data management

---

## Error Mapping

**File:** `packages/core/system/error-mapping/supabase-rules.ts`

Translates Supabase/PostgREST codes to the active project codes:

| Supabase | the active project | HTTP |
|----------|---------|------|
| INVALID_CREDENTIALS | AUTH_INVALID_CREDENTIALS | 401 |
| EMAIL_NOT_CONFIRMED | AUTH_EMAIL_NOT_VERIFIED | 401 |
| EXPIRED_TOKEN | AUTH_TOKEN_EXPIRED | 401 (retryable) |
| PGRST301 | AUTH_TOKEN_EXPIRED | 401 (retryable) |
| PGRST116 | RESOURCE_NOT_FOUND | 404 |

### Gaps
- No mapping for RLS violation errors
- Static templates, no dynamic context from original error
- If Supabase SDK changes error codes, mappings break silently

---

## Known Security Debt

| ID | Issue | Severity | Location | Status |
|----|-------|----------|----------|--------|
| SEC-DEBT-01 | OAuth tokens stored as plaintext | HIGH | `iam.identities.metadata.access_token` | V2 will encrypt via Vault |
| SEC-DEBT-02 | Signed URLs irrevocable for 1 hour | MEDIUM | `use-signed-url.ts` | Use backend proxy for sensitive files |
| SEC-DEBT-03 | Demo mode bypasses all auth | HIGH | `lib/engine-clients.ts` DEMO_MODE_ENABLED | Never enable in production |
| SEC-DEBT-04 | Auth callback open redirect | MEDIUM | `app/auth/callback/route.ts` `next` param | Whitelist allowed redirect targets |
| SEC-DEBT-05 | Impersonation tokens are plaintext UUIDs | MEDIUM | `assistance-manager.ts` | Upgrade to signed JWTs |
| SEC-DEBT-06 | Permission cache not distributed | LOW | `gatekeeper.ts` 60s in-memory | Add Redis when fleet scales |
| SEC-DEBT-07 | Usage counter race condition | LOW | `capability-manager.ts` | Add atomic DB increment |
