export const ORCHESTRATOR_TOOLS = [
  {
    name: "report_complete",
    description: "Agent reports task completion. Use when you finish a task.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Your agent ID (e.g., gemini-a, qwen-b)" },
        taskId: { type: "string", description: "Task ID (e.g., T24.1.2)" },
        filesChanged: { type: "array", items: { type: "string" }, description: "List of files created/modified" },
        checkpoint: { type: "string", description: "Git commit hash" },
        notes: { type: "string", description: "Completion notes" },
      },
      required: ["agentId", "taskId", "filesChanged", "checkpoint"],
    },
  },
  {
    name: "report_blocker",
    description: "Agent reports a blocker. Use when you cannot proceed.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Your agent ID" },
        taskId: { type: "string", description: "Task ID" },
        blockers: { type: "array", items: { type: "string" }, description: "List of blockers" },
        checkpoint: { type: "string", description: "Git commit hash of last progress" },
        notes: { type: "string", description: "What you tried" },
      },
      required: ["agentId", "taskId", "blockers", "checkpoint"],
    },
  },
  {
    name: "get_my_tasks",
    description: "Get tasks assigned to you. Use at session start.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Your agent ID" },
      },
      required: ["agentId"],
    },
  },
  {
    name: "claim_task",
    description: "Claim a pending task. Use before starting work.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Your agent ID" },
        taskId: { type: "string", description: "Task ID to claim" },
      },
      required: ["agentId", "taskId"],
    },
  },
  {
    name: "assign_task",
    description: "Orchestrator assigns task to agent.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Target agent ID" },
        taskId: { type: "string", description: "Task ID" },
        sprint: { type: "string", description: "Sprint ID (e.g., S24)" },
        description: { type: "string", description: "Task description" },
      },
      required: ["agentId", "taskId", "sprint", "description"],
    },
  },
  {
    name: "send_followup",
    description: "Orchestrator sends follow-up to agent.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Target agent ID" },
        originalTaskId: { type: "string", description: "Original task ID" },
        issue: { type: "string", description: "What went wrong" },
        requiredFix: { type: "string", description: "What needs to be fixed" },
      },
      required: ["agentId", "originalTaskId", "issue", "requiredFix"],
    },
  },
  {
    name: "get_sprint_status",
    description: "Get status of all agents in current sprint.",
    inputSchema: {
      type: "object",
      properties: {
        sprint: { type: "string", description: "Sprint ID (optional, returns all if omitted)" },
      },
    },
  },
  {
    name: "get_all_reports",
    description: "Get all agent reports (for orchestrator analysis).",
    inputSchema: {
      type: "object",
      properties: {
        since: { type: "string", description: "ISO timestamp to filter reports (optional)" },
      },
    },
  },
  {
    name: "clear_completed",
    description: "Archive completed tasks (cleanup).",
    inputSchema: {
      type: "object",
      properties: {
        sprint: { type: "string", description: "Sprint to clean up" },
      },
      required: ["sprint"],
    },
  },
] as const;
