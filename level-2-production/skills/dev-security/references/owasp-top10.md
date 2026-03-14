# OWASP Top 10 — Dev Reference

> Quick reference for AI agents generating or reviewing security-sensitive code.
> Source: OWASP Top 10 (2021). For each: what it is → how AI agents introduce it → how to prevent it.

---

## A01 — Broken Access Control

**What:** User can access data or actions they shouldn't (other users' records, admin functions).
**How AI introduces it:** Agent implements the happy path, forgets to check authorization on each endpoint. Or checks auth at the route level but not at the query level.
**Prevention:** Check permissions per operation, not per route. Use RLS or equivalent to enforce at the DB level. Test with a second user account.

---

## A02 — Cryptographic Failures

**What:** Sensitive data exposed due to weak or missing encryption.
**How AI introduces it:** Uses MD5/SHA-1 for passwords, returns sensitive fields in API responses, stores PII in plaintext logs.
**Prevention:** bcrypt/argon2 for passwords. TLS everywhere. Explicit response schemas that exclude sensitive fields. Never log PII.

---

## A03 — Injection

**What:** Untrusted data sent to an interpreter (SQL, shell, LDAP) as a command.
**How AI introduces it:** String interpolation in queries (`"SELECT * FROM users WHERE id = " + userId`), passing user input to `exec()` or shell commands.
**Prevention:** Parameterized queries always. ORM by default. Never pass user strings to system calls.

---

## A04 — Insecure Design

**What:** Security wasn't considered in the design, so no implementation fix can fully remediate it.
**How AI introduces it:** Agent builds what was asked without asking "how could this be abused?"
**Prevention:** During alignment interview: add "abuse cases" to the spec. Ask: what happens if the attacker calls this 1000 times? What if they send someone else's ID?

---

## A05 — Security Misconfiguration

**What:** Default credentials, open S3 buckets, debug mode in production, permissive CORS.
**How AI introduces it:** Copies config from tutorials (which often disable security for simplicity), sets `CORS: *`, enables verbose error output.
**Prevention:** CORS whitelist, not `*`. Debug off in production. Check every `true` flag in security-related config.

---

## A06 — Vulnerable and Outdated Components

**What:** Using dependencies with known vulnerabilities.
**How AI introduces it:** Suggests packages based on training data (which may be years old).
**Prevention:** Run `npm audit` / `pip audit` after every new dependency. Pin versions. Automate dependency updates.

---

## A07 — Identification and Authentication Failures

**What:** Broken login, session fixation, weak password policy, no MFA.
**How AI introduces it:** Implements custom auth instead of using a proven library. Doesn't implement rate limiting on login. Doesn't expire sessions.
**Prevention:** Use an established auth library/provider. Rate limit login. Expire sessions. Rotate tokens.

---

## A08 — Software and Data Integrity Failures

**What:** Assuming that code or data from external sources is trustworthy (unsigned updates, deserialized payloads).
**How AI introduces it:** Trusts webhook payloads without signature verification. Deserializes user-supplied JSON without validation.
**Prevention:** Verify webhook signatures (e.g., Stripe-Signature header). Never deserialize user data without a strict schema.

---

## A09 — Security Logging and Monitoring Failures

**What:** No logging of security-relevant events, so breaches go undetected.
**How AI introduces it:** Doesn't add logging because it wasn't in the spec.
**Prevention:** Log: failed auth attempts, access control denials, input validation failures. Include timestamp, IP, user ID. Alert on anomalies.

---

## A10 — Server-Side Request Forgery (SSRF)

**What:** Attacker causes the server to make HTTP requests to internal systems.
**How AI introduces it:** Implements a URL-fetching feature (preview, webhook, import) without validating the destination.
**Prevention:** Whitelist allowed domains. Block requests to `localhost`, `169.254.x.x` (AWS metadata), and internal IP ranges. Never pass user-supplied URLs directly to `fetch()`.
