# Skill: dev-security

> Use when implementing auth, permissions, handling sensitive data, or any code that touches trust boundaries.
> This skill covers application-level security. For infra/server hardening, see your project's ops runbook.

## When to activate

- Implementing authentication or authorization
- Handling user data, PII, or payment info
- Building public-facing endpoints or APIs
- Reviewing code for a security audit
- Any feature that crosses a trust boundary (user → server, server → external service)

## References to load

| File | Use when |
|---|---|
| `references/owasp-top10.md` | Reviewing any endpoint or auth flow |
| `your-project/playbook/stack.md` | For project-specific auth provider, RLS setup, secrets management |

## Core rules

1. **Authenticate, then authorize** — first verify who the caller is, then check what they're allowed to do. Never skip either step.
2. **Deny by default** — if there's no explicit rule allowing access, deny. Don't default to open.
3. **Validate all input** — type, format, length, range. At the boundary. Before anything else.
4. **Hash passwords with bcrypt/argon2** — never SHA-256, never MD5, never plaintext.
5. **Short-lived tokens** — JWTs should expire. Refresh tokens should rotate. Sessions should timeout.
6. **HTTPS everywhere** — no exceptions. Redirect HTTP to HTTPS. HSTS.
7. **Minimal permissions** — API keys, service accounts, and DB users get only what they need for their task.

## Stub: fill in your stack

```
# In your project playbook:

## Auth setup
- Provider: [e.g., Supabase Auth, NextAuth, Clerk, custom JWT]
- Session strategy: [e.g., JWT with 1h expiry + refresh, server-side sessions]
- MFA: [enabled / optional / not implemented]

## Permissions model
- Model: [e.g., RBAC with roles: owner/admin/member, RLS at DB level]
- Enforcement: [e.g., RLS policies enforce row access, API layer enforces role checks]

## Secrets management
- [e.g., .env files locally, environment variables in CI, never committed to git]
```
