# @ai-dev-protocol/mcp-server

MCP server for coordinating AI agents in multi-agent development workflows. Provides task assignment, progress reporting, and sprint coordination via both MCP (stdio) and HTTP APIs.

## Setup

```bash
cd packages/mcp-server
npm install
npm run build
```

## Add to an MCP-capable desktop client

Add to your desktop client's MCP config file:

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "node",
      "args": ["/path/to/ai-dev-protocol/packages/mcp-server/dist/index.js"],
      "cwd": "/path/to/your-project"
    }
  }
}
```

Or for development:

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "npx",
      "args": ["tsx", "/path/to/ai-dev-protocol/packages/mcp-server/src/index.ts"],
      "cwd": "/path/to/your-project"
    }
  }
}
```

## Tools Available

### For Agents (use from any agent CLI)

| Tool | Description |
|:-----|:------------|
| `report_complete` | Report task completion with files changed |
| `report_blocker` | Report a blocker preventing progress |
| `get_my_tasks` | Get tasks assigned to you |
| `claim_task` | Claim a pending task |

### For the orchestrator operator

| Tool | Description |
|:-----|:------------|
| `assign_task` | Assign task to an agent |
| `send_followup` | Send follow-up fix request |
| `get_sprint_status` | Get status of all agents |
| `get_all_reports` | Get all agent reports |
| `clear_completed` | Archive completed tasks |

## State File

State is persisted to `.orchestrator-state.json` in the project root (cwd). This file tracks all tasks, reports, and agent status. Add it to `.gitignore`.

## HTTP API (for external agents)

External agents (Gemini, Qwen, Codex) that don't have MCP support can use the HTTP server:

```bash
npm run dev:http
# or
npm run build && npm run start:http
```

Server runs on `http://localhost:3847` (configurable via `ORCHESTRATOR_PORT`).

### HTTP Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/status?sprint=S24` | Get sprint status |
| GET | `/tasks/:agentId` | Get agent's pending tasks |
| GET | `/reports?since=ISO` | Get all reports |
| POST | `/report/complete` | Report task completion |
| POST | `/report/blocker` | Report blocker |
| POST | `/task/assign` | Assign task to agent |
| POST | `/task/claim` | Claim a pending task |

### Example: Agent reports completion via curl

```bash
curl -X POST http://localhost:3847/report/complete \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "gemini-a",
    "taskId": "T24.1.2",
    "filesChanged": ["src/feature.ts"],
    "checkpoint": "abc123",
    "notes": "Feature implemented"
  }'
```

## Workflow

```
+--------------+     assign_task      +-----------+
| Orchestrator | ---------------------> |   Agent   |
|   operator   |                      | (Gemini/  |
|              | <--------------------- |  Qwen/etc)|
+--------------+   report_complete    +-----------+
       |                                    |
       | get_sprint_status                  | get_my_tasks
       v                                    v
   +--------------------------------------------+
   |          .orchestrator-state.json          |
   |  (local file - persists across sessions)   |
   +--------------------------------------------+
```
