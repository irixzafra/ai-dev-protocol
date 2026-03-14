# Backend Anti-Patterns

> Patterns AI agents produce by default that introduce bugs, security holes, or performance problems.
> For each: name → symptom → root cause → correct alternative.

---

## 1. N+1 query

**Symptom:** A loop calls the database once per item (`for user in users: db.query(orders, user.id)`).
**Root cause:** Agent fetches a list, then queries inside the loop without realizing the cost.
**Fix:** Single query with JOIN, or batch fetch with `WHERE id IN (...)`. Always check: "Am I querying inside a loop?"

---

## 2. Unvalidated input reaching the database

**Symptom:** User-supplied string goes directly into a query, filter, or sort parameter.
**Root cause:** Agent trusts the caller.
**Fix:** Parse and validate at the boundary (Zod, Pydantic, joi). Reject unknown fields. Never pass raw user strings to `ORDER BY` or dynamic column names.

---

## 3. Silent error swallowing

**Symptom:** `try { ... } catch (e) {}` or `except: pass` with no logging, no rethrow.
**Root cause:** Agent adds try/catch "to be safe" without thinking about what happens on failure.
**Fix:** Either handle the error meaningfully (retry, fallback, user-facing message) or rethrow. Never swallow silently.

---

## 4. Missing transaction on multi-step write

**Symptom:** Two writes happen sequentially without a transaction. If the second fails, the first is already committed.
**Root cause:** Agent writes each step separately.
**Fix:** Wrap in a transaction. Partial state is a bug. "It's unlikely to fail" is not an argument.

---

## 5. Plaintext secrets in code

**Symptom:** `const apiKey = "sk-..."` or `DATABASE_URL = "postgresql://user:pass@host/db"` committed to git.
**Root cause:** Agent hardcodes for "convenience" during prototyping.
**Fix:** Environment variables only. Pre-commit hook blocks any commit containing common secret patterns.

---

## 6. Returning more data than needed

**Symptom:** API returns the full DB row including sensitive fields (hashed password, internal IDs, PII).
**Root cause:** Agent does `SELECT *` and returns the result directly.
**Fix:** Explicit field selection. Define a response schema and strip everything not in it. Never expose internal fields.

---

## 7. No rate limiting on mutation endpoints

**Symptom:** POST /signup, POST /login, POST /send-email have no rate limiting.
**Root cause:** Agent implements the happy path and doesn't consider abuse.
**Fix:** Rate limit at the API gateway or middleware level. Especially for auth endpoints.

---

## 8. Synchronous work inside a request handler

**Symptom:** Image processing, email sending, or PDF generation happens inline before returning the HTTP response.
**Root cause:** Agent implements the simplest path.
**Fix:** Offload to a background job or queue. Return 202 Accepted immediately.

---

## 9. Non-idempotent webhook handler

**Symptom:** Receiving the same webhook twice creates duplicate records or charges.
**Root cause:** Agent assumes webhooks arrive exactly once.
**Fix:** Use the event ID as a deduplication key. Check before processing. Mark as processed atomically.

---

## 10. Overly broad error messages to clients

**Symptom:** `{ "error": "Database connection failed at postgres://user:pass@host/db" }` returned to the user.
**Root cause:** Agent returns internal error details for "easier debugging".
**Fix:** Log the full error server-side. Return a generic message to the client. Never expose stack traces, connection strings, or internal paths.
