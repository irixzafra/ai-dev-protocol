# Common Errors in the active project

Expanded error reference for the dev-debug skill. Organized by category.

---

## TypeScript / Build Errors

| Error | Likely cause | Resolution |
|---|---|---|
| `TS2307: Cannot find module` | Import from deleted/moved file | Update import path; check barrel exports in `packages/*/src/index.ts` |
| `TS6133: declared but never read` | Unused import or variable after refactor | Remove the unused declaration |
| `TS2345: Argument not assignable` | Type contract changed upstream | Run `pnpm tsc --noEmit`, read the expected type, update the call site |
| Type error after `git pull` | Another agent changed shared types | Run `pnpm install && pnpm tsc --noEmit`; check `packages/contracts/` diff |
| DevOx "max 5 files" hook | Commit with >5 files | Split into atomic commits, max 5 files each |
| DevOx "business terms" hook | Business-specific term in `packages/core/` | Use generic term; business names belong in `apps/platform/` only |

## Runtime Errors (Browser / Next.js)

| Error | Likely cause | Resolution |
|---|---|---|
| Hydration mismatch | Server/client render difference | Check for `Date.now()`, `Math.random()`, `window`, or `useEffect`-only state used in initial render. Wrap client-only code in `useEffect` or use `suppressHydrationWarning` on the specific element |
| `NEXT_NOT_FOUND` | Route does not exist | Verify `app/` directory structure matches the URL; check for typos in dynamic segments `[slug]` |
| `NEXT_REDIRECT` | Middleware redirect inside server action | Use `redirect()` from `next/navigation`, not `NextResponse.redirect()`. In server actions, `redirect()` throws — do not catch it |
| `ChunkLoadError` | Stale client bundle after deploy | Clear `.next/` cache and rebuild; in prod this self-resolves on page refresh |
| Tiptap extension error | Missing or incompatible extension | Check extension registration order in editor config; verify extension version compatibility in `package.json` |
| `TypeError: X is not a function` | Importing default as named or vice versa | Check export style: `export default` vs `export { name }`. Barrel re-exports can mask this |

## API / Supabase Errors

| Error | Likely cause | Resolution |
|---|---|---|
| `PGRST301` (PostgREST) | RLS policy blocking the query | Check RLS with service role client; verify the user's org context is being passed. Use `supabase.auth.getUser()` to confirm auth state |
| Supabase RLS denied (silent) | Query returns empty instead of error | RLS `SELECT` policies return zero rows, not errors. Test with service role to confirm data exists, then fix the policy |
| `fetch ECONNREFUSED` | Target service not running | Verify the container is up: `ssh your-server 'docker ps \| grep [service]'`. Check the port mapping |
| `ECONNRESET` / `EPIPE` | Connection dropped mid-request | Check if the target service restarted during the request. Review container restart policies |
| OAuth callback error | Redirect URL mismatch | Check Supabase Auth config redirect URLs in `supabase/config.toml` and provider dashboard. URLs must match exactly (including trailing slash) |
| `ZodError` in server action | Input does not match contract schema | Check the Zod schema in `packages/contracts/`; compare the actual payload shape. Common: optional field sent as `null` instead of `undefined` |

## Infrastructure / Server Errors

| Error | Likely cause | Resolution |
|---|---|---|
| your data engine API 500 | your data engine internal error | Check container: `ssh your-server 'docker logs data-engine --tail 30'`. your data engine 500s are often OOM — check `docker stats data-engine` |
| your agent runtime 503 | Gateway overloaded or agent down | Check gateway: `ssh your-server 'docker logs YOUR_AGENT_GATEWAY_CONTAINER --tail 30'`. Verify agent health at `http://localhost:YOUR_AGENT_PORT/health` |
| Middleware cookie stale | `project_mw` cache expired or corrupt | Clear the `MW_CACHE` cookie in browser. Check `proxy.ts` cache TTL. In prod, cookies expire after the configured session duration |
| your deployment platform deploy fails | Build error or resource limit | Check build logs in your deployment platform UI (`localhost:8000`). Common: OOM during `next build` — increase container memory limit |
| `ENV_VALIDATION_FAILED` on startup | Missing or malformed env var | Check `envSchema` in `packages/core/src/env.ts`. Compare `.env.local` against required vars. New vars after `git pull` need manual addition |
| Supabase GoTrue 422 | Auth request rejected | Check request payload (email format, password length). GoTrue returns 422 for constraint violations, not 400 |

## Database / Migration Errors

| Error | Likely cause | Resolution |
|---|---|---|
| Drizzle migration conflict | Schema out of sync with DB | Run `pnpm db:generate` to regenerate; check for pending migrations. If schemas diverged, compare `drizzle/` output with live DB |
| `relation "X" does not exist` | Migration not applied or wrong schema | Check `SET search_path` in the query. the active project uses 23+ schemas — the table might be in `data_mgmt`, `cms`, `iam`, etc. |
| `duplicate key value violates unique constraint` | Seed or migration inserting existing data | Use `ON CONFLICT DO NOTHING` or `INSERT ... ON CONFLICT DO UPDATE`. Check if another agent already ran the seed |

## Test Errors

| Error | Likely cause | Resolution |
|---|---|---|
| Timeout in test | Slow dynamic import or async operation | Add `{ timeout: 15_000 }` to the test. If persistent, the test may have an unresolved promise |
| `ReferenceError: document is not defined` | DOM API used in non-browser test | Mock with `jsdom` environment (`// @vitest-environment jsdom`) or extract the logic into a pure function |
| Mock not resetting between tests | Shared mock state leaking | Use `beforeEach(() => vi.clearAllMocks())` or `vi.restoreAllMocks()` in setup |
| `Cannot find module` in vitest | Path alias not resolved | Check `vitest.config.ts` alias mapping matches `tsconfig.json` paths. Common: `@/` alias missing in test config |

---

## Quick Diagnosis Checklist

When facing an unknown error:

1. **Copy the exact error message** — do not paraphrase
2. **Check this table first** — most the active project errors match a known pattern
3. **If not here**, search the codebase: `grep -r "error message fragment" apps/ packages/`
4. **If it is a new pattern**, add it to this table after fixing it (keep the table current)
