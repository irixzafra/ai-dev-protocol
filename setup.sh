#!/bin/bash
# AI Dev Protocol — Setup
# Usage:
#   bash setup.sh [target] [--level 0|1|2]           # first install
#   bash setup.sh [target] [--level 0|1|2] --update   # update primitives only
#
# --update mode: overwrites protocol primitives (dev.protocol.md, hooks,
# framework/) but NEVER touches project-specific files (BRIEFINGS.md,
# COORDINATION.md, WORKBOARD.md, MEMORY.md, LESSONS.md, playbook.md).

set -e

TARGET="."
LEVEL="0"
UPDATE=false

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --level) shift; LEVEL="${1:-0}" ;;
    --update) UPDATE=true ;;
    0|1|2) LEVEL="$1" ;;
    *) TARGET="$1" ;;
  esac
  shift
done

REPO="https://raw.githubusercontent.com/irixzafra/ai-dev-protocol/main"

# Helper: download file, skip if exists and not in update mode
install_file() {
  local url="$1"
  local dest="$2"
  local type="${3:-primitive}"  # "primitive" = always overwrite on update; "project" = never overwrite

  if [ -f "$dest" ]; then
    if [ "$type" = "project" ]; then
      echo "  SKIP $dest (project-specific, already exists)"
      return
    fi
    if [ "$UPDATE" = false ]; then
      echo "  SKIP $dest (already exists — use --update to overwrite)"
      return
    fi
    echo "  UPDATE $dest"
  else
    echo "  CREATE $dest"
  fi
  curl -fsSL "$url" -o "$dest"
}

if [ "$UPDATE" = true ]; then
  echo "AI Dev Protocol — Update (Level $LEVEL)"
  echo "Mode: updating primitives, preserving project-specific files"
else
  echo "AI Dev Protocol — Setup (Level $LEVEL)"
fi
echo "Target: $TARGET"
echo ""

# Create directories
mkdir -p "$TARGET/planning"

# --- Level 0: Core (primitives — always updated) ---

echo "Protocol primitives:"
install_file "$REPO/protocol/protocol.md" "$TARGET/dev.protocol.md" primitive

# Framework docs (always update — these are universal standards)
mkdir -p "$TARGET/docs/framework"
for doc in README.md governance.md backlog.md testing.md design-system.md api.md database.md agents.md deployment.md spec-template.md; do
  install_file "$REPO/protocol/framework/$doc" "$TARGET/docs/framework/$doc" primitive
done

# Project-specific files — create on first install, never overwrite
install_file "$REPO/templates/agent-config.template.md" "$TARGET/CLAUDE.md" project
install_file "$REPO/templates/lessons.template.md" "$TARGET/planning/LESSONS.md" project
install_file "$REPO/templates/dev-log.template.md" "$TARGET/planning/dev-log.md" project
install_file "$REPO/templates/audit-log.template.md" "$TARGET/planning/audit-log.md" project

if [ ! -f "$TARGET/planning/MEMORY.md" ]; then
  touch "$TARGET/planning/MEMORY.md"
  echo "  CREATE planning/MEMORY.md"
else
  echo "  SKIP planning/MEMORY.md (project-specific, already exists)"
fi

# GitHub Issue Template (primitive)
mkdir -p "$TARGET/.github/ISSUE_TEMPLATE"
install_file "$REPO/templates/feature-request.issue.md" "$TARGET/.github/ISSUE_TEMPLATE/feature-request.md" primitive

# OpenHands microagent (primitive)
mkdir -p "$TARGET/.openhands/microagents"
cat > "$TARGET/.openhands/microagents/repo.md" <<'MICROEOF'
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
MICROEOF
echo "  .openhands/microagents/repo.md"

# --- Level 1: Multi-agent ---

if [ "$LEVEL" -ge 1 ]; then
  echo ""
  echo "Level 1 — Multi-agent coordination:"

  mkdir -p "$TARGET/.claude"
  mkdir -p "$TARGET/.claude/claims"

  # Project-specific — never overwrite
  install_file "$REPO/templates/workboard.template.md" "$TARGET/planning/WORKBOARD.md" project
  install_file "$REPO/templates/briefings.template.md" "$TARGET/.claude/BRIEFINGS.md" project
  install_file "$REPO/templates/coordination.template.md" "$TARGET/.claude/COORDINATION.md" project
fi

# --- Level 2: Production ---

if [ "$LEVEL" -ge 2 ]; then
  echo ""
  echo "Level 2 — Production quality:"

  install_file "$REPO/templates/playbook.template.md" "$TARGET/playbook.md" project
  install_file "$REPO/templates/program.template.md" "$TARGET/planning/program.md" project
fi

# --- Git hooks (primitives — always updated) ---

echo ""
echo "Git hooks:"

if [ -d "$TARGET/.husky" ]; then
  HOOK_DIR="$TARGET/.husky"
elif [ -d "$TARGET/.git/hooks" ]; then
  HOOK_DIR="$TARGET/.git/hooks"
else
  mkdir -p "$TARGET/.git/hooks"
  HOOK_DIR="$TARGET/.git/hooks"
fi

for hook in pre-commit pre-push commit-msg; do
  install_file "$REPO/packages/hooks/${hook}.sh" "$HOOK_DIR/$hook" primitive
  chmod +x "$HOOK_DIR/$hook" 2>/dev/null || true
done

# --- Summary ---

echo ""
if [ "$UPDATE" = true ]; then
  echo "Update complete. Primitives refreshed, project files preserved."
else
  echo "Setup complete. Next steps:"
  echo "  1. Edit CLAUDE.md — fill in your tech stack and paths"
  echo "  2. Tell your agent: 'Read dev.protocol.md before doing anything.'"
  if [ "$LEVEL" -ge 1 ]; then
    echo "  3. Edit .claude/COORDINATION.md — define your hotspots"
    echo "  4. Add tasks to planning/WORKBOARD.md"
  fi
  if [ "$LEVEL" -ge 2 ]; then
    echo "  5. Edit playbook.md — your project-specific SSOT"
  fi
fi
echo ""
echo "Full docs: https://github.com/irixzafra/ai-dev-protocol"
