# Architecture Anti-Patterns

> Patterns AI agents produce by default that create structural debt.
> For each: name → symptom → root cause → correct alternative.

---

## 1. Big Bang architecture

**Symptom:** Agent designs the full system upfront (20 tables, 5 services, event bus) before any code exists.
**Root cause:** Agent optimizes for "complete" rather than "shippable."
**Fix:** Design for the next 3 months, not forever. Add complexity only when the simpler version breaks under real load.

---

## 2. Premature abstraction

**Symptom:** A shared utility is created for 2 callers. A base class is written for 1 subclass.
**Root cause:** Agent pattern-matches to "DRY" without asking if the duplication is actually harmful.
**Fix:** 3 identical usages before abstracting. Prefer duplication over the wrong abstraction.

---

## 3. Undocumented decision

**Symptom:** A significant architectural choice (why PostgreSQL instead of MongoDB, why JWT instead of sessions) exists in the code but nowhere in writing.
**Root cause:** Agent implements without recording the reasoning.
**Fix:** Write an ADR for every decision that took more than 5 minutes to make. Future agents (and humans) will ask "why."

---

## 4. Leaky abstractions

**Symptom:** The "user service" knows about HTTP status codes. The "payment module" imports database types directly.
**Root cause:** Agent adds the shortest path between two things without thinking about which layer owns what.
**Fix:** Each layer has one job. Services don't know about HTTP. DB types don't cross into domain logic. Define clear boundaries before implementing.

---

## 5. Synchronous everything

**Symptom:** Long operations (email sends, PDF generation, external API calls) happen inline in request handlers. Response time: 8 seconds.
**Root cause:** Agent takes the simplest path.
**Fix:** Anything over ~200ms or that can fail independently belongs in a background job or queue.

---

## 6. Ignoring failure modes

**Symptom:** The happy path is fully implemented. The failure path is a bare `catch (e) { console.error(e) }`.
**Root cause:** Agent builds what was asked; the spec said nothing about failures.
**Fix:** During alignment, ask: "What happens when X fails?" Add failure paths to the acceptance criteria before building.

---

## 7. Circular dependencies

**Symptom:** Module A imports from Module B which imports from Module A.
**Root cause:** Agent resolves import errors incrementally without checking for cycles.
**Fix:** Dependency graph is a DAG. If you create a cycle, it's a sign the boundary is wrong — move the shared logic to a third module.
