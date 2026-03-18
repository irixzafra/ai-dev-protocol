#!/bin/bash
# AI Dev Protocol — Setup
# Copies protocol files to get started in any project.
# Usage: bash setup.sh [target-directory] [--level 0|1|2]
# Default: current directory, level 0

set -e

TARGET="${1:-.}"
LEVEL="${2:-0}"
REPO="https://raw.githubusercontent.com/irixzafra/ai-dev-protocol/main"

# Parse --level flag
for arg in "$@"; do
  case "$arg" in
    --level) shift; LEVEL="${1:-0}"; shift ;;
    0|1|2) LEVEL="$arg" ;;
  esac
done

echo "AI Dev Protocol — Setup (Level $LEVEL)"
echo "Target: $TARGET"
echo ""

# Create directories
mkdir -p "$TARGET/planning"

# --- Level 0: Core ---

curl -fsSL "$REPO/protocol/protocol.md" -o "$TARGET/dev.protocol.md"
echo "  dev.protocol.md"

curl -fsSL "$REPO/templates/agent-config.template.md" -o "$TARGET/CLAUDE.md"
echo "  CLAUDE.md (edit this: fill in your stack and paths)"

curl -fsSL "$REPO/templates/lessons.template.md" -o "$TARGET/planning/LESSONS.md"
echo "  planning/LESSONS.md"

touch "$TARGET/planning/MEMORY.md"
echo "  planning/MEMORY.md"

curl -fsSL "$REPO/templates/dev-log.template.md" -o "$TARGET/planning/dev-log.md"
echo "  planning/dev-log.md"

# GitHub Issue Template for non-technical feature requests
mkdir -p "$TARGET/.github/ISSUE_TEMPLATE"
curl -fsSL "$REPO/templates/feature-request.issue.md" -o "$TARGET/.github/ISSUE_TEMPLATE/feature-request.md"
echo "  .github/ISSUE_TEMPLATE/feature-request.md"

# OpenHands microagent
mkdir -p "$TARGET/.openhands/microagents"
cat > "$TARGET/.openhands/microagents/repo.md" <<'EOF'
---
name: repo
type: repo
agent: CodeActAgent
---

Before doing anything:

1. Read `dev.protocol.md` — follow the flow exactly (Align -> Execute -> Verify -> Reflect)
2. Read `planning/project.playbook.md` if it exists — stack, paths, and patterns for this project
3. Read the last 3 entries in `planning/dev-log.md` — recent session context
4. Run: grep '\[pending\]$' planning/LESSONS.md — resolve before starting new work

Then ask: "What should I work on?"
If `planning/WORKBOARD.md` exists, read it for the next queued task.
EOF
echo "  .openhands/microagents/repo.md"

# --- Level 1: Multi-agent ---

if [ "$LEVEL" -ge 1 ]; then
  echo ""
  echo "Level 1 — Multi-agent coordination:"

  mkdir -p "$TARGET/.claude"

  curl -fsSL "$REPO/templates/workboard.template.md" -o "$TARGET/planning/WORKBOARD.md"
  echo "  planning/WORKBOARD.md"

  curl -fsSL "$REPO/templates/briefings.template.md" -o "$TARGET/.claude/BRIEFINGS.md"
  echo "  .claude/BRIEFINGS.md"

  curl -fsSL "$REPO/templates/coordination.template.md" -o "$TARGET/.claude/COORDINATION.md"
  echo "  .claude/COORDINATION.md"

  mkdir -p "$TARGET/.claude/claims"
  echo "  .claude/claims/ (claim lock directory)"
fi

# --- Level 2: Production ---

if [ "$LEVEL" -ge 2 ]; then
  echo ""
  echo "Level 2 — Production quality:"

  curl -fsSL "$REPO/templates/playbook.template.md" -o "$TARGET/playbook.md"
  echo "  playbook.md (fill in your stack and patterns)"

  curl -fsSL "$REPO/templates/program.template.md" -o "$TARGET/planning/program.md"
  echo "  planning/program.md (autonomous optimization loop)"
fi

# --- Git hooks ---

echo ""
echo "Installing git hooks..."

if [ -d "$TARGET/.husky" ]; then
  HOOK_DIR="$TARGET/.husky"
elif [ -d "$TARGET/.git/hooks" ]; then
  HOOK_DIR="$TARGET/.git/hooks"
else
  mkdir -p "$TARGET/.git/hooks"
  HOOK_DIR="$TARGET/.git/hooks"
fi

curl -fsSL "$REPO/packages/hooks/pre-commit.sh" -o "$HOOK_DIR/pre-commit"
chmod +x "$HOOK_DIR/pre-commit"
echo "  $HOOK_DIR/pre-commit"

curl -fsSL "$REPO/packages/hooks/commit-msg.sh" -o "$HOOK_DIR/commit-msg"
chmod +x "$HOOK_DIR/commit-msg"
echo "  $HOOK_DIR/commit-msg"

curl -fsSL "$REPO/packages/hooks/pre-push.sh" -o "$HOOK_DIR/pre-push"
chmod +x "$HOOK_DIR/pre-push"
echo "  $HOOK_DIR/pre-push"

echo ""
echo "Done. Next steps:"
echo "  1. Edit CLAUDE.md — fill in your tech stack and paths"
echo "  2. Tell your agent: 'Read dev.protocol.md before doing anything.'"
if [ "$LEVEL" -ge 1 ]; then
  echo "  3. Edit .claude/COORDINATION.md — define your hotspots"
  echo "  4. Add tasks to planning/WORKBOARD.md"
fi
if [ "$LEVEL" -ge 2 ]; then
  echo "  5. Edit playbook.md — your project-specific SSOT"
fi
echo ""
echo "Full docs: https://github.com/irixzafra/ai-dev-protocol"
