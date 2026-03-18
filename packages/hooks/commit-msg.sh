#!/bin/sh
# =============================================================
# ai-dev-protocol — Generic Commit Message Hook
# =============================================================
# Blocks full-track commit messages (feat/refactor) on protected branches.
# These must go through a feature branch + PR.
#
# Copy or symlink to .husky/commit-msg (or .git/hooks/commit-msg).
#
# Bypass: DEVOX_ALLOW_FULLTRACK_ON_MASTER=1
# =============================================================

ALLOW="${DEVOX_ALLOW_FULLTRACK_ON_MASTER:-}"
if [ "$ALLOW" = "1" ]; then
  exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
case "$BRANCH" in
  master|main)
    MSG=$(head -1 "$1")
    if echo "$MSG" | grep -qE "^(feat|refactor)[:(]"; then
      echo ""
      echo "ERROR: Full-track commit (feat/refactor) blocked on $BRANCH."
      echo "   Create a feature branch first:"
      echo "     git checkout -b feat/<name>"
      echo "   Then commit and open a PR."
      echo ""
      echo "   Bypass (emergency only): DEVOX_ALLOW_FULLTRACK_ON_MASTER=1 git commit ..."
      echo ""
      exit 1
    fi
    ;;
esac

exit 0
