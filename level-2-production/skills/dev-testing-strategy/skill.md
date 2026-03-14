# Skill: dev-testing-strategy

> Use when writing or reviewing tests for any feature.
> AI agents produce tests that are tautological, brittle, or testing the wrong thing.
> This skill defines what good tests look like and what to avoid.

## When to activate

- Writing unit, integration, or e2e tests
- Reviewing existing test coverage before calling a feature "done"
- Deciding what to test for a new component or API endpoint

## References to load

| File | Use when |
|---|---|
| `references/anti-patterns.md` | Writing or reviewing any test |
| `your-project/playbook.md` | For project-specific test runner, coverage thresholds, and testing patterns |

## Core rules

1. **Test behavior, not implementation** — tests should survive refactoring. If you can rename a function without breaking the test, the test is testing the right thing.
2. **Arrange, Act, Assert — one assertion per concept** — each test verifies one behavior. If a test needs a long description to explain what it covers, split it.
3. **Tests are documentation** — a failing test should tell you exactly what broke and why, without reading the implementation.
4. **Don't mock what you don't own** — mock external services, not your own modules. If you're mocking your own code to test it, the architecture may be the problem.
5. **Coverage is a floor, not a ceiling** — 80% coverage with behavioral tests is better than 100% with tautological ones. A test that always passes proves nothing.
6. **Flaky tests are bugs** — a test that sometimes fails is worse than no test. Fix or delete it. Never merge flaky tests.
