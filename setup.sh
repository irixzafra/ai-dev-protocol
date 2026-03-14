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

echo ""
echo "Done. Next steps:"
echo "  1. Edit CLAUDE.md — fill in your tech stack and paths"
echo "  2. Tell your agent: 'Read dev.protocol.md before doing anything.'"
echo "  3. Optional: install the pre-commit hook"
echo "     cp level-0-core/pre-commit .husky/pre-commit && chmod +x .husky/pre-commit"
echo ""
echo "Full docs: https://github.com/irixzafra/ai-dev-protocol"
