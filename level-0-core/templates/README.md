# Templates — What to Copy and What Is Reference

## Copy these to your project (once, at setup)

| File | Destination | Purpose |
|---|---|---|
| `agent-config.template.md` | `CLAUDE.md` (or `AGENTS.md`, `GEMINI.md`) | Agent config — fill in your stack and paths |
| `lessons.template.md` | `planning/LESSONS.md` | Correction inbox — agent writes here |
| `dev-log.template.md` | `planning/dev-log.md` | Session log — agent writes here |

`setup.sh` copies these automatically. You only need to fill in `CLAUDE.md`.

---

## Reference formats (use when needed, not copied to project root)

| File | When to use |
|---|---|
| `backlog.template.md` | Capture ideas before they become tasks → `planning/BACKLOG.md` |
| `adr.template.md` | Document an architectural decision → `docs/adr/[decision].md` |
| `pdr.template.md` | Design review before a large feature → `specs/[feature]-pdr.md` |
| `feature-request.issue.md` | Non-technical users requesting work → `.github/ISSUE_TEMPLATE/feature-request.md` |

These are not automatically copied. Pull them when the need arises.
