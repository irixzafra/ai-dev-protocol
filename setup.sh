#!/bin/bash
# AI Dev Protocol — Level 0 Setup
# Copies the minimum 3 files to get started in any project.
# Usage: bash setup.sh [target-directory]
# Default target: current directory

set -e

TARGET="${1:-.}"
REPO="https://raw.githubusercontent.com/irixzafra/ai-dev-protocol/main"

echo "AI Dev Protocol — Level 0 Setup"
echo "Target: $TARGET"
echo ""

# Create planning dir
mkdir -p "$TARGET/planning"

# Download core files
curl -fsSL "$REPO/level-0-core/protocol.md" -o "$TARGET/dev.protocol.md"
echo "✓ dev.protocol.md"

curl -fsSL "$REPO/level-0-core/templates/agent-config.template.md" -o "$TARGET/CLAUDE.md"
echo "✓ CLAUDE.md (edit this: fill in your stack and paths)"

curl -fsSL "$REPO/level-0-core/templates/lessons.template.md" -o "$TARGET/planning/LESSONS.md"
echo "✓ planning/LESSONS.md"

touch "$TARGET/planning/MEMORY.md"
echo "✓ planning/MEMORY.md"

curl -fsSL "$REPO/level-0-core/templates/dev-log.template.md" -o "$TARGET/planning/dev-log.md"
echo "✓ planning/dev-log.md"

# OpenHands microagent (auto-loads protocol when using OpenHands)
mkdir -p "$TARGET/.openhands/microagents"
cat > "$TARGET/.openhands/microagents/repo.md" <<'EOF'
---
name: repo
type: repo
agent: CodeActAgent
---

Before doing anything:

1. Read `dev.protocol.md` — follow the flow exactly (Align → Execute → Verify → Reflect)
2. Read `planning/project.playbook.md` if it exists — stack, paths, and patterns for this project
3. Read the last 3 entries in `planning/dev-log.md` — recent session context
4. Run: grep '\[pending\]$' planning/LESSONS.md — resolve before starting new work

Then ask: "What should I work on?" or read `planning/WORKBOARD.md` for the next task.
EOF
echo "✓ .openhands/microagents/repo.md (auto-loads protocol in OpenHands)"

echo ""
echo "Done. Next steps:"
echo "  1. Edit CLAUDE.md — fill in your tech stack and paths"
echo "  2. Tell your agent: 'Read dev.protocol.md before doing anything.'"
echo "  3. If using OpenHands: the microagent file loads the protocol automatically"
echo "  4. Optional: install the pre-commit hook"
echo "     cp level-0-core/pre-commit .husky/pre-commit && chmod +x .husky/pre-commit"
echo ""
echo "Full docs: https://github.com/irixzafra/ai-dev-protocol"
