# Agent Reporting Instructions

> All agents MUST report their progress via HTTP API.
> The server runs on `localhost:3847`

---

## For ALL Agents

### 1. At Session Start - Check Pending Tasks

```bash
# Replace {AGENT_ID} with your ID: gemini-a, gemini-b, qwen-a, qwen-b, codex-a, codex-b
curl -s http://localhost:3847/tasks/{AGENT_ID}
```

### 2. Before Working - Claim the Task

```bash
curl -s -X POST http://localhost:3847/task/claim \
  -H "Content-Type: application/json" \
  -d '{"agentId": "{AGENT_ID}", "taskId": "{TASK_ID}"}'
```

### 3. On Completion - Report Success

```bash
curl -s -X POST http://localhost:3847/report/complete \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "{AGENT_ID}",
    "taskId": "{TASK_ID}",
    "filesChanged": ["file1.ts", "file2.ts"],
    "checkpoint": "{GIT_COMMIT_HASH}",
    "notes": "Brief description of what was completed"
  }'
```

### 4. If Blocked - Report Immediately

```bash
curl -s -X POST http://localhost:3847/report/blocker \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "{AGENT_ID}",
    "taskId": "{TASK_ID}",
    "blockers": ["Blocker description 1", "Blocker description 2"],
    "checkpoint": "{GIT_COMMIT_HASH}",
    "notes": "Additional context"
  }'
```

---

## Endpoint Summary

| Action | Method | Endpoint | When to Use |
|:-------|:-------|:---------|:------------|
| Check tasks | GET | `/tasks/{agentId}` | At session start |
| Claim task | POST | `/task/claim` | Before starting |
| Report success | POST | `/report/complete` | On task completion |
| Report blocker | POST | `/report/blocker` | When unable to continue |
| Check status | GET | `/status` | To verify global state |

---

## Template for Agent Prompts

Include at the end of each agent prompt:

```markdown
## REPORTING PROTOCOL

At session start, check for pending tasks:
\`\`\`bash
curl -s http://localhost:3847/tasks/{your-agent-id}
\`\`\`

Before working, claim your task:
\`\`\`bash
curl -s -X POST http://localhost:3847/task/claim -H "Content-Type: application/json" -d '{"agentId": "{your-agent-id}", "taskId": "{task-id}"}'
\`\`\`

On completion, report:
\`\`\`bash
curl -s -X POST http://localhost:3847/report/complete -H "Content-Type: application/json" -d '{"agentId": "{your-agent-id}", "taskId": "{task-id}", "filesChanged": [...], "checkpoint": "{commit}"}'
\`\`\`

On blocker, report immediately:
\`\`\`bash
curl -s -X POST http://localhost:3847/report/blocker -H "Content-Type: application/json" -d '{"agentId": "{your-agent-id}", "taskId": "{task-id}", "blockers": [...]}'
\`\`\`
```

---

## Connectivity Check

Before starting, verify the server is running:

```bash
curl -s http://localhost:3847/status
```

If it fails, the server is not running. Notify the user.
