#!/usr/bin/env node
/**
 * MCP Orchestrator Server
 *
 * MCP server for coordinating AI agents in multi-agent development.
 * Provides tools for agents to report progress and receive tasks.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { loadState, saveState } from "./state.js";
import { ORCHESTRATOR_TOOLS } from "./tools.js";
import type { AgentReport, AgentTask } from "./types.js";

type CallToolRequest = {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
};

const server = new Server(
  {
    name: "ai-dev-protocol-orchestrator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [...ORCHESTRATOR_TOOLS] };
});

server.setRequestHandler(CallToolRequestSchema, async (request: unknown) => {
  const typedRequest = request as CallToolRequest;
  const { name } = typedRequest.params;
  const args = typedRequest.params.arguments;

  if (!args) {
    return {
      content: [{ type: "text", text: `Tool "${name}" requires arguments` }],
      isError: true,
    };
  }

  const state = loadState();

  switch (name) {
    case "report_complete": {
      const report: AgentReport = {
        agentId: args.agentId as string,
        taskId: args.taskId as string,
        status: "complete",
        filesChanged: (args.filesChanged as string[]) || [],
        blockers: [],
        checkpoint: args.checkpoint as string,
        notes: (args.notes as string) || "",
        timestamp: new Date().toISOString(),
      };
      state.reports.push(report);

      const task = state.tasks.find((t) => t.taskId === args.taskId && t.agentId === args.agentId);
      if (task) {
        task.status = "complete";
        task.completedAt = new Date().toISOString();
        task.filesChanged = report.filesChanged;
        task.checkpoint = report.checkpoint;
      }

      saveState(state);
      return {
        content: [
          {
            type: "text",
            text: `Report received for ${args.taskId} by @${args.agentId}\nFiles: ${report.filesChanged.length}\nCheckpoint: ${report.checkpoint}`,
          },
        ],
      };
    }

    case "report_blocker": {
      const report: AgentReport = {
        agentId: args.agentId as string,
        taskId: args.taskId as string,
        status: "blocked",
        filesChanged: [],
        blockers: (args.blockers as string[]) || [],
        checkpoint: args.checkpoint as string,
        notes: (args.notes as string) || "",
        timestamp: new Date().toISOString(),
      };
      state.reports.push(report);

      const task = state.tasks.find((t) => t.taskId === args.taskId && t.agentId === args.agentId);
      if (task) {
        task.status = "blocked";
        task.blockers = report.blockers;
      }

      saveState(state);
      return {
        content: [
          {
            type: "text",
            text: `BLOCKER reported for ${args.taskId} by @${args.agentId}\nBlockers:\n${report.blockers.map((b) => `- ${b}`).join("\n")}`,
          },
        ],
      };
    }

    case "get_my_tasks": {
      const myTasks = state.tasks.filter(
        (t) => t.agentId === args.agentId && ["pending", "in_progress", "followup"].includes(t.status)
      );
      return {
        content: [
          {
            type: "text",
            text:
              myTasks.length > 0
                ? `Tasks for @${args.agentId}:\n\n${myTasks.map((t) => `- [${t.status.toUpperCase()}] ${t.taskId}: ${t.description}`).join("\n")}`
                : `No pending tasks for @${args.agentId}`,
          },
        ],
      };
    }

    case "claim_task": {
      const task = state.tasks.find((t) => t.taskId === args.taskId && t.status === "pending");
      if (!task) {
        return {
          content: [{ type: "text", text: `Task ${args.taskId} not found or already claimed` }],
        };
      }
      task.agentId = args.agentId as string;
      task.status = "in_progress";
      task.startedAt = new Date().toISOString();
      saveState(state);
      return {
        content: [
          {
            type: "text",
            text: `Task ${args.taskId} claimed by @${args.agentId}\nSprint: ${task.sprint}\nDescription: ${task.description}`,
          },
        ],
      };
    }

    case "assign_task": {
      const newTask: AgentTask = {
        id: `task-${Date.now()}`,
        agentId: args.agentId as string,
        taskId: args.taskId as string,
        sprint: args.sprint as string,
        status: "pending",
        description: args.description as string,
        filesChanged: [],
        blockers: [],
        checkpoint: "",
        startedAt: null,
        completedAt: null,
        notes: "",
      };
      state.tasks.push(newTask);
      saveState(state);
      return {
        content: [
          {
            type: "text",
            text: `Task assigned:\n- To: @${args.agentId}\n- Task: ${args.taskId}\n- Sprint: ${args.sprint}\n- Description: ${args.description}`,
          },
        ],
      };
    }

    case "send_followup": {
      const followup: AgentTask = {
        id: `followup-${Date.now()}`,
        agentId: args.agentId as string,
        taskId: `FU-${args.originalTaskId}`,
        sprint: "",
        status: "followup",
        description: `FIX REQUIRED: ${args.issue}\n\nRequired: ${args.requiredFix}`,
        filesChanged: [],
        blockers: [],
        checkpoint: "",
        startedAt: null,
        completedAt: null,
        notes: `Original: ${args.originalTaskId}`,
      };
      state.tasks.push(followup);
      saveState(state);
      return {
        content: [
          {
            type: "text",
            text: `Follow-up sent to @${args.agentId}\nOriginal: ${args.originalTaskId}\nIssue: ${args.issue}`,
          },
        ],
      };
    }

    case "get_sprint_status": {
      const sprintFilter = args.sprint as string | undefined;
      const tasks = sprintFilter ? state.tasks.filter((t) => t.sprint === sprintFilter) : state.tasks;

      const byAgent = tasks.reduce((acc, t) => {
        if (!acc[t.agentId]) acc[t.agentId] = { pending: 0, in_progress: 0, complete: 0, blocked: 0 };
        acc[t.agentId][t.status] = (acc[t.agentId][t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, Record<string, number>>);

      const summary = Object.entries(byAgent)
        .map(
          ([agent, counts]) =>
            `@${agent}: pending=${counts.pending || 0} in_progress=${counts.in_progress || 0} complete=${counts.complete || 0} blocked=${counts.blocked || 0}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Sprint Status${sprintFilter ? ` (${sprintFilter})` : ""}:\n\n${summary || "No tasks found"}\n\nLast updated: ${state.lastUpdated}`,
          },
        ],
      };
    }

    case "get_all_reports": {
      const since = args.since ? new Date(args.since as string) : null;
      const reports = since ? state.reports.filter((r) => new Date(r.timestamp) > since) : state.reports;

      return {
        content: [
          {
            type: "text",
            text:
              reports.length > 0
                ? `Reports (${reports.length}):\n\n${reports.map((r) => `[${r.status.toUpperCase()}] @${r.agentId} - ${r.taskId} (${r.timestamp})`).join("\n")}`
                : "No reports found",
          },
        ],
      };
    }

    case "clear_completed": {
      const before = state.tasks.length;
      state.tasks = state.tasks.filter((t) => !(t.sprint === args.sprint && t.status === "complete"));
      const removed = before - state.tasks.length;
      saveState(state);
      return {
        content: [{ type: "text", text: `Archived ${removed} completed tasks from ${args.sprint}` }],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Orchestrator server running on stdio");
}

main().catch(console.error);
