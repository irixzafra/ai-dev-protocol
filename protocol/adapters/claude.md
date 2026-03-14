# Claude Code Adapter

> Load `universal-core.md` first. This file only contains Claude-specific overrides.

## Tools available
- `Task` tool: spawn parallel subagents (Explore, Plan, Bash, general-purpose)
- `EnterWorktree` tool: isolated git worktree per task
- `EnterPlanMode` / `ExitPlanMode`: structured plan review
- Playwright MCP: real browser testing at `http://localhost:3001`

## Behavior notes
- Use `EnterPlanMode` proactively for non-trivial tasks — do not wait for the human to ask
- Spawn multiple subagents in parallel when tasks are independent
- `EnterWorktree` for any full-track feature (feat/refactor)
- Use `AskUserQuestion` before plan approval only for genuine ambiguity

## Commit message
Always end commits with:
```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
