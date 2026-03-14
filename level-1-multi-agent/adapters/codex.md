# Codex / GPT-4o Adapter

> Load `universal-core.md` first. This file only contains Codex-specific overrides.

## Tools available
- File system tools
- Bash for commands
- Browser tools (if configured)

## Behavior notes
- Use AGENTS.md in the project root as your project-specific context
- Explicitly confirm scope before executing — Codex tends to over-execute
- Verify with `git diff --stat` before committing to confirm only declared files were touched
