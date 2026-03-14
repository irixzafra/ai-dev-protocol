# Gemini Adapter

> Load `universal-core.md` first. This file only contains Gemini-specific overrides.

## Tools available
- File system tools (Read, Write, Edit, Glob, Grep)
- Bash for commands
- WebFetch for research

## Behavior notes
- Use GEMINI.md in the project root as your project-specific context
- Long context window: read full files before asking questions
- Prefer thorough exploration before proposing changes
