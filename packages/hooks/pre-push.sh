#!/bin/sh
# =============================================================
# ai-dev-protocol — Generic Pre-Push Hook
# =============================================================
# Blocks direct pushes of full-track work (feat/refactor) to master/main.
# Fast-track work (fix/chore/docs/test/perf): direct push allowed.
#
# Copy or symlink to .husky/pre-push (or .git/hooks/pre-push).
#
# Checks:
#   1. Full-track direct push blocking
#   2. PDR gate for feat/* branches
#   3. Dev-log warning for feat/* branches
# =============================================================

ALLOW="${DEVOX_ALLOW_PROTECTED_PUSH:-}"
BLOCKED=""
HAS_FULLTRACK=""

# Capture stdin once — multiple while-read loops can't share stdin
PUSH_INPUT=$(cat)

echo "$PUSH_INPUT" | while read local_ref local_sha remote_ref remote_sha; do
  case "$remote_ref" in
    refs/heads/master|refs/heads/main)
      # Write markers to temp files since we're in a subshell
      echo "$remote_ref" > /tmp/_devox_blocked
      # Only check commits that are truly new (not already on remote).
      REMOTE_HEAD=$(git rev-parse "origin/${remote_ref#refs/heads/}" 2>/dev/null || echo "$remote_sha")
      if git log "${REMOTE_HEAD}..${local_sha}" --format="%s" 2>/dev/null | grep -qE "^(feat|refactor)[:(]"; then
        echo "yes" > /tmp/_devox_fulltrack
      fi
      ;;
  esac
done

BLOCKED=$(cat /tmp/_devox_blocked 2>/dev/null || true)
HAS_FULLTRACK=$(cat /tmp/_devox_fulltrack 2>/dev/null || true)
rm -f /tmp/_devox_blocked /tmp/_devox_fulltrack

if [ -n "$BLOCKED" ] && [ -n "$HAS_FULLTRACK" ] && [ "$ALLOW" != "1" ]; then
  echo "ERROR: Direct push to $BLOCKED blocked — full-track commits detected (feat/refactor)."
  echo ""
  echo "Full-track work must go through a feature branch + PR."
  exit 1
fi

# PDR gate — feat/* branches must have a spec or PDR change in the push
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
SKIP_PDR="${DEVOX_SKIP_PDR:-}"

if echo "$CURRENT_BRANCH" | grep -qE "^feat/" && [ "$SKIP_PDR" != "1" ]; then
  echo "$PUSH_INPUT" | while read local_ref local_sha remote_ref remote_sha; do
    if echo "$remote_sha" | grep -qE "^0+$"; then
      SPEC_CHANGES=$(git show "$local_sha" --name-only 2>/dev/null | grep -E "^specs/|PDR-|\.pdr\." || true)
    else
      SPEC_CHANGES=$(git diff "$remote_sha".."$local_sha" --name-only 2>/dev/null | grep -E "^specs/|PDR-|\.pdr\." || true)
    fi
    if [ -z "$SPEC_CHANGES" ]; then
      echo ""
      echo "ERROR: feat/* branch pushed without spec/PDR changes."
      echo "   Every feature must have a PDR in specs/ before implementation."
      echo "   If the spec already exists unchanged, add a reference comment in any staged file."
      echo ""
      echo "   Bypass: DEVOX_SKIP_PDR=1 git push"
      exit 1
    fi
  done
  # Exit with the subshell's exit code
  if [ $? -ne 0 ]; then
    exit 1
  fi
fi

# Dev-log gate — feat/* branches should have dev-log changes (warning only)
if echo "$CURRENT_BRANCH" | grep -qE "^feat/"; then
  DEVLOG_CHANGED=""
  echo "$PUSH_INPUT" | while read local_ref local_sha remote_ref remote_sha; do
    if echo "$remote_sha" | grep -qE "^0+$"; then
      DEVLOG_CHANGED=$(git show "$local_sha" --name-only 2>/dev/null | grep "^planning/dev-log.md$" || true)
    else
      DEVLOG_CHANGED=$(git diff "$remote_sha".."$local_sha" --name-only 2>/dev/null | grep "^planning/dev-log.md$" || true)
    fi
    if [ -z "$DEVLOG_CHANGED" ]; then
      echo ""
      echo "WARNING: feat/* branch pushed without dev-log entry."
      echo "   Consider updating planning/dev-log.md with session notes."
      echo ""
    fi
  done
fi

exit 0
