# Contributing to AI Dev Protocol

Every pattern here came from real production use.
If you've found a better way, fix a gap, or have a skill to add — open a PR.

---

## The rule: issue is the spec, PR is the implementation

1. **Open an issue first** (use the templates in `.github/ISSUE_TEMPLATE/`)
2. The issue describes the problem and proposed solution
3. The PR implements exactly that — nothing more

If the issue is approved (or you're fixing something obviously wrong), you can skip step 1 and go straight to PR.

---

## What to contribute

| Type | Where it goes | Template |
|---|---|---|
| New skill | `level-2-production/skills/dev-[domain]/` | Copy an existing skill directory |
| Protocol fix | `level-0-core/protocol.md` or `level-1-multi-agent/` | — |
| New template | `level-0-core/templates/` or `level-2-production/templates/` | — |
| New example | `examples/[name]/` | — |
| Docs improvement | `docs/` or `README.md` | — |

---

## Skill structure (if adding a new one)

```
level-2-production/skills/dev-[domain]/
├── skill.md                      ← when to activate, core rules, how it loads
└── references/
    └── anti-patterns.md          ← N patterns: name → symptom → root cause → fix
```

A skill is worth adding if:
- AI agents produce a specific category of bad output in this domain by default
- The pattern has a name, a root cause, and a correct alternative
- It's generic enough to apply to any project, not just one stack

---

## Style rules

- **Files:** `lowercase-hyphenated.md`
- **Planning artifacts** (LESSONS, WORKBOARD, BACKLOG, MEMORY): `UPPERCASE.md`
- **No emojis** in protocol or skill files
- **English** for all protocol and skill content
- **Concrete over abstract** — every rule should have a "what the agent does wrong" and a "what to do instead"

---

## What not to contribute

- Stack-specific advice (e.g., "in Next.js, use...") — goes in your project's playbook, not here
- Promotional content or tool advertisements
- Theoretical patterns not tested in a real project
- Copies of framework documentation

---

## Running the pre-commit hook locally

```bash
chmod +x level-0-core/pre-commit
cp level-0-core/pre-commit .git/hooks/pre-commit
```

The hook checks: secrets in staged diff, LESSONS.md graduation targets.

---

## PR checklist

- [ ] Issue exists (or it's an obvious fix)
- [ ] Only touches what the issue describes
- [ ] Follows naming and style rules above
- [ ] No secrets or project-specific content
- [ ] Commit message follows: `type(scope): description` (feat/fix/docs/refactor/chore)
