import * as fs from "fs";
import * as path from "path";
import type { OrchestratorState } from "./types.js";

const STATE_FILE = path.join(process.cwd(), ".orchestrator-state.json");

export function loadState(): OrchestratorState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading state:", e);
  }
  return { tasks: [], reports: [], lastUpdated: new Date().toISOString() };
}

export function saveState(state: OrchestratorState): void {
  state.lastUpdated = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
