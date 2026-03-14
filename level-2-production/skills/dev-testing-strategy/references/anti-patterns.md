# Testing Anti-Patterns

> Patterns AI agents produce that look like tests but don't catch real bugs.
> For each: name → symptom → root cause → correct alternative.

---

## 1. Tautological tests

**Symptom:** The test verifies that calling `getUser(id)` returns what `getUser(id)` returns. Or asserts that a component renders without crashing.
**Root cause:** Agent writes the test by looking at the implementation and asserting that it does what it currently does.
**Fix:** Write the test from the requirement: "Given a valid user ID, returns the user's name and email." Assert specific values, not just "something was returned."

---

## 2. Testing implementation details

**Symptom:** Test breaks when you rename an internal function, change a state variable, or refactor a component without changing its behavior.
**Root cause:** Agent accesses internal state or mocks private methods.
**Fix:** Test through the public interface only. For UI: interact the way a user would (click, type, navigate). For functions: call with inputs, assert outputs. Don't peek inside.

---

## 3. Over-mocking

**Symptom:** A test has 15 lines of mock setup and 2 lines of actual assertion. Every module the function touches is mocked.
**Root cause:** Agent mocks everything to achieve isolation, making the test unable to catch integration bugs.
**Fix:** Mock only: (a) I/O (network, DB, file system), (b) time-dependent operations, (c) external services you don't control. Let your own code run.

---

## 4. No edge cases

**Symptom:** Tests only cover the happy path. Zero, null, empty string, very long string, and concurrent calls are not tested.
**Root cause:** Agent tests what it just implemented. Edge cases are not obvious from the implementation.
**Fix:** For every function, ask: "What happens if the input is empty? Null? Invalid? Max size? Called twice simultaneously?" Add at least one edge case per behavior.

---

## 5. Flaky async tests

**Symptom:** Test passes locally, fails in CI. Or passes on the second run. Or fails with a timeout 10% of the time.
**Root cause:** Agent uses `setTimeout`, fixed delays, or doesn't await properly.
**Fix:** Use explicit waits (`waitFor`, `findBy*`, or `await` with proper assertions). Never use `setTimeout` in tests. If a test is timing-sensitive, the system design may need fixing.

---

## 6. One giant test per feature

**Symptom:** A single test exercises the entire flow: setup, input, processing, output, side effects, cleanup. When it fails, you don't know which part failed.
**Root cause:** Agent writes one test to verify that "the feature works."
**Fix:** One test per behavior. Each test has a clear name that reads like a requirement: "returns 404 when user not found", "sends welcome email after signup."

---

## 7. Tests that can't fail

**Symptom:** A `try/catch` around the assertion. A test that asserts `expect(result).toBeDefined()` on an optional. An assertion inside an `if` block that is never executed.
**Root cause:** Agent writes defensive code, including in tests.
**Fix:** Tests should be able to fail. Remove `try/catch` from tests. Assert specific values. If the code under test throws, the test should fail.

---

## 8. Testing the framework, not the code

**Symptom:** Tests verify that React's `useState` works, that Express's router dispatches correctly, or that Prisma can execute a query.
**Root cause:** Agent tests what it can see — the framework behavior — rather than the application logic.
**Fix:** Trust the framework. Test your logic, your edge cases, your integration with the framework — not the framework itself.
