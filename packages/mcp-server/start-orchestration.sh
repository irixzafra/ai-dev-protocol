#!/bin/bash
# =============================================================
# Agent Orchestration - Multi-Terminal Setup
# =============================================================
# Creates a tmux session with:
# - HTTP Server (orchestrator API)
# - Agent daemons (one per agent)
# - Monitor pane (status dashboard)
# =============================================================

SESSION="orchestrator"
ORCH_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$ORCH_DIR/../.." && pwd)"

# Kill existing session if any
tmux kill-session -t $SESSION 2>/dev/null

# Create new session with HTTP server
tmux new-session -d -s $SESSION -n "server" -c "$PROJECT_DIR"
tmux send-keys -t $SESSION:server "cd $ORCH_DIR && npm run dev:http" C-m

# Create daemon windows for each agent
AGENTS=("gemini-a" "gemini-b" "qwen-a" "qwen-b" "claude-b" "codex-a" "codex-b")

for agent in "${AGENTS[@]}"; do
  tmux new-window -t $SESSION -n "$agent" -c "$PROJECT_DIR"
  tmux send-keys -t $SESSION:$agent "cd $ORCH_DIR && npm run daemon -- --agent $agent --poll 30" C-m
done

# Create monitor window
tmux new-window -t $SESSION -n "monitor" -c "$PROJECT_DIR"
tmux send-keys -t $SESSION:monitor "watch -n 5 'curl -s localhost:3847/status | jq .'" C-m

# Create orchestrator window (for manual commands)
tmux new-window -t $SESSION -n "orch" -c "$PROJECT_DIR"
tmux send-keys -t $SESSION:orch "echo 'Orchestrator ready. Use curl to assign tasks:'" C-m
tmux send-keys -t $SESSION:orch "echo 'curl -X POST localhost:3847/task/assign -H \"Content-Type: application/json\" -d \"{...}\"'" C-m

# Select the monitor window
tmux select-window -t $SESSION:monitor

echo "Orchestration session started!"
echo ""
echo "Windows created:"
echo "  0: server   - HTTP API (localhost:3847)"
echo "  1-7: agents - Daemon for each agent"
echo "  8: monitor  - Live status dashboard"
echo "  9: orch     - Manual orchestration"
echo ""
echo "Attach with: tmux attach -t $SESSION"
