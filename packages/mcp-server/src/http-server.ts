#!/usr/bin/env node
/**
 * HTTP API Server for MCP Orchestrator
 *
 * Provides REST endpoints for agents that don't have MCP support.
 * Run alongside or instead of the MCP server.
 */

import * as http from "http";
import * as fs from "fs";
import * as path from "path";

const PORT = process.env.ORCHESTRATOR_PORT || 3847;
const STATE_FILE = path.join(process.cwd(), ".orchestrator-state.json");

// Same types as MCP server
interface AgentTask {
  id: string;
  agentId: string;
  taskId: string;
  sprint: string;
  status: "pending" | "in_progress" | "complete" | "blocked" | "followup";
  description: string;
  filesChanged: string[];
  blockers: string[];
  checkpoint: string;
  startedAt: string | null;
  completedAt: string | null;
  notes: string;
}

interface AgentReport {
  agentId: string;
  taskId: string;
  status: "complete" | "blocked" | "partial";
  filesChanged: string[];
  blockers: string[];
  checkpoint: string;
  notes: string;
  timestamp: string;
}

interface OrchestratorState {
  tasks: AgentTask[];
  reports: AgentReport[];
  lastUpdated: string;
}

function loadState(): OrchestratorState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading state:", e);
  }
  return { tasks: [], reports: [], lastUpdated: new Date().toISOString() };
}

function saveState(state: OrchestratorState): void {
  state.lastUpdated = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Simple body parser
async function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const state = loadState();

  try {
    // === GET /status - Sprint status ===
    if (req.method === "GET" && url.pathname === "/status") {
      const sprint = url.searchParams.get("sprint");
      const tasks = sprint
        ? state.tasks.filter((t) => t.sprint === sprint)
        : state.tasks;

      const byAgent: Record<string, Record<string, number>> = {};
      tasks.forEach((t) => {
        if (!byAgent[t.agentId]) byAgent[t.agentId] = {};
        byAgent[t.agentId][t.status] = (byAgent[t.agentId][t.status] || 0) + 1;
      });

      res.writeHead(200);
      res.end(JSON.stringify({ sprint, agents: byAgent, lastUpdated: state.lastUpdated }));
      return;
    }

    // === GET /tasks/:agentId - Get tasks for agent ===
    if (req.method === "GET" && url.pathname.startsWith("/tasks/")) {
      const agentId = url.pathname.split("/")[2];
      const tasks = state.tasks.filter(
        (t) => t.agentId === agentId && ["pending", "in_progress", "followup"].includes(t.status)
      );
      res.writeHead(200);
      res.end(JSON.stringify({ agentId, tasks }));
      return;
    }

    // === GET /reports - Get all reports ===
    if (req.method === "GET" && url.pathname === "/reports") {
      const since = url.searchParams.get("since");
      const reports = since
        ? state.reports.filter((r) => new Date(r.timestamp) > new Date(since))
        : state.reports;
      res.writeHead(200);
      res.end(JSON.stringify({ reports }));
      return;
    }

    // === POST /report/complete - Report completion ===
    if (req.method === "POST" && url.pathname === "/report/complete") {
      const body = await parseBody(req);
      const report: AgentReport = {
        agentId: body.agentId,
        taskId: body.taskId,
        status: "complete",
        filesChanged: body.filesChanged || [],
        blockers: [],
        checkpoint: body.checkpoint || "",
        notes: body.notes || "",
        timestamp: new Date().toISOString(),
      };
      state.reports.push(report);

      const task = state.tasks.find(
        (t) => t.taskId === body.taskId && t.agentId === body.agentId
      );
      if (task) {
        task.status = "complete";
        task.completedAt = new Date().toISOString();
        task.filesChanged = report.filesChanged;
        task.checkpoint = report.checkpoint;
      }

      saveState(state);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, report }));
      return;
    }

    // === POST /report/blocker - Report blocker ===
    if (req.method === "POST" && url.pathname === "/report/blocker") {
      const body = await parseBody(req);
      const report: AgentReport = {
        agentId: body.agentId,
        taskId: body.taskId,
        status: "blocked",
        filesChanged: [],
        blockers: body.blockers || [],
        checkpoint: body.checkpoint || "",
        notes: body.notes || "",
        timestamp: new Date().toISOString(),
      };
      state.reports.push(report);

      const task = state.tasks.find(
        (t) => t.taskId === body.taskId && t.agentId === body.agentId
      );
      if (task) {
        task.status = "blocked";
        task.blockers = report.blockers;
      }

      saveState(state);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, report }));
      return;
    }

    // === POST /task/assign - Assign task ===
    if (req.method === "POST" && url.pathname === "/task/assign") {
      const body = await parseBody(req);
      const newTask: AgentTask = {
        id: `task-${Date.now()}`,
        agentId: body.agentId,
        taskId: body.taskId,
        sprint: body.sprint,
        status: "pending",
        description: body.description,
        filesChanged: [],
        blockers: [],
        checkpoint: "",
        startedAt: null,
        completedAt: null,
        notes: "",
      };
      state.tasks.push(newTask);
      saveState(state);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, task: newTask }));
      return;
    }

    // === POST /task/claim - Claim task ===
    if (req.method === "POST" && url.pathname === "/task/claim") {
      const body = await parseBody(req);
      const task = state.tasks.find(
        (t) => t.taskId === body.taskId && t.status === "pending"
      );
      if (!task) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: "Task not found or already claimed" }));
        return;
      }
      task.agentId = body.agentId;
      task.status = "in_progress";
      task.startedAt = new Date().toISOString();
      saveState(state);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, task }));
      return;
    }

    // === 404 ===
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: String(error) }));
  }
});

server.listen(PORT, () => {
  console.log(`Orchestrator HTTP API running on http://localhost:${PORT}`);
  console.log(`
Endpoints:
  GET  /status              - Sprint status
  GET  /tasks/:agentId      - Get agent's tasks
  GET  /reports             - Get all reports
  POST /report/complete     - Report task completion
  POST /report/blocker      - Report blocker
  POST /task/assign         - Assign task to agent
  POST /task/claim          - Claim a pending task
`);
});
