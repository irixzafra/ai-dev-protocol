export interface AgentTask {
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

export interface AgentReport {
  agentId: string;
  taskId: string;
  status: "complete" | "blocked" | "partial";
  filesChanged: string[];
  blockers: string[];
  checkpoint: string;
  notes: string;
  timestamp: string;
}

export interface OrchestratorState {
  tasks: AgentTask[];
  reports: AgentReport[];
  lastUpdated: string;
}
