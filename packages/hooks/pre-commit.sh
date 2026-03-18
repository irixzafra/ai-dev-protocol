#!/bin/sh
# =============================================================
# ai-dev-protocol — Generic Pre-Commit Hook
# =============================================================
# Universal checks for any project using the ai-dev-protocol.
# Copy or symlink to .husky/pre-commit (or .git/hooks/pre-commit).
#
# Checks included:
#   0  — Secrets scan (.env files + API key patterns)
#   8  — File size / atomicity warning (files > 300 LOC)
#   9a — Lessons graduation: no bare [pendiente] without target
#   9b — Lessons graduation: graduated targets must be staged
#   F  — No console.log in app/ code
#   H  — Import direction: packages/ must not import from apps/
# =============================================================

echo "Pre-commit: running safety checks..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# --- Check 0: Secrets scan ---------------------------------------------------

# Block .env files (except .env.example)
ENV_FILES=$(echo "$STAGED_FILES" | grep -E '(^|/)\.env(\.[^/]*)?$' | grep -v '\.env\.example$' || true)
if [ -n "$ENV_FILES" ]; then
  echo "ERROR: Attempted to commit .env file(s):"
  echo "$ENV_FILES"
  echo "Environment files must never be committed. Add to .gitignore."
  exit 1
fi

# Scan for known secret patterns
if [ -n "$STAGED_FILES" ]; then
  SECRET_HITS=$(echo "$STAGED_FILES" | xargs grep -rn \
    -e 'AKIA[0-9A-Z]\{16\}' \
    -e 'sk-ant-[a-zA-Z0-9_-]\{20,\}' \
    -e 'sk-proj-[a-zA-Z0-9_-]\{20,\}' \
    -e 'ghp_[a-zA-Z0-9]\{36\}' \
    -e 'glpat-[a-zA-Z0-9_-]\{20,\}' \
    -e 'xoxb-[0-9a-zA-Z-]\{40,\}' \
    2>/dev/null \
    | grep -v 'node_modules\|\.example\|__tests__\|\.test\.\|\.spec\.' || true)
  if [ -n "$SECRET_HITS" ]; then
    echo "ERROR: Possible secret detected in staged files:"
    echo "$SECRET_HITS"
    echo "Remove before committing."
    exit 1
  fi
fi

# --- Check 8: Atomicity warning (files > 300 LOC) ----------------------------

BIG_FILES=""
for f in $(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx|py)$' | grep -v 'node_modules\|\.config\.\|pnpm-lock\|__tests__\|\.test\.\|\.spec\.' || true); do
  if [ -f "$f" ]; then
    lines=$(wc -l < "$f" 2>/dev/null | tr -d ' ')
    if [ "$lines" -gt 300 ]; then
      BIG_FILES="$BIG_FILES\n  $f ($lines lines)"
    fi
  fi
done
if [ -n "$BIG_FILES" ]; then
  echo "WARNING: Files exceed 300 LOC (Law of Atomicity):"
  echo "$BIG_FILES"
  echo "Consider splitting."
fi

# --- Check 9: Lessons graduation gate ----------------------------------------

if echo "$STAGED_FILES" | grep -q "planning/LESSONS\.md$"; then
  # 9a. No bare [pendiente] without a target
  BARE_PENDING=$(grep -c '^\*\*Estado:\*\* `\[pendiente\]`$' planning/LESSONS.md 2>/dev/null || true)
  BARE_PENDING=${BARE_PENDING:-0}
  if [ "$BARE_PENDING" -gt 0 ]; then
    echo "ERROR: LESSONS.md has $BARE_PENDING lesson(s) without graduation target."
    echo "   Each [pendiente] needs a target: \`[pendiente -> location]\`"
    echo "   Or mark as \`[referencia]\` if no systemic change required."
    exit 1
  fi

  # 9b. New [graduada -> path] entries must have their target file staged
  NEW_GRADUATED_PATHS=$(git diff --cached planning/LESSONS.md \
    | grep '^\+' \
    | grep '`\[graduada →' \
    | sed 's/.*`\[graduada → *\([^] `]*\).*/\1/' \
    | grep -v '^$' || true)
  UNSTAGED_TARGETS=""
  for target_path in $NEW_GRADUATED_PATHS; do
    case "$target_path" in
      */*|*.md|*.ts|*.sh|*.yaml|*.json)
        if [ -f "$target_path" ] && ! echo "$STAGED_FILES" | grep -qF "$target_path"; then
          UNSTAGED_TARGETS="$UNSTAGED_TARGETS\n  $target_path"
        fi
        ;;
    esac
  done
  if [ -n "$UNSTAGED_TARGETS" ]; then
    echo "ERROR: Graduation targets not staged alongside LESSONS.md:"
    printf "$UNSTAGED_TARGETS\n"
    echo "   Stage the destination file(s) in the same commit as the graduation."
    exit 1
  fi
fi

# --- Check F: No console.log in app/ code ------------------------------------

STAGED_APPCODE=$(echo "$STAGED_FILES" | grep -E "^apps?/.*\.(ts|tsx|js|jsx)$" || true)
if [ -n "$STAGED_APPCODE" ]; then
  CONSOLE_VIOLATIONS=""
  for f in $STAGED_APPCODE; do
    CONSOLE_VIOLATIONS="$CONSOLE_VIOLATIONS$(git diff --cached -- "$f" | \
      grep "^+" | grep "\bconsole\.log\b" | \
      grep -v "@devox-ignore\|@ignore-console" || true)"
  done
  if [ -n "$CONSOLE_VIOLATIONS" ]; then
    echo "ERROR: console.log in app code — remove or replace with structured logging"
    echo "   Add an ignore comment on the same line for intentional exceptions."
    exit 1
  fi
fi

# --- Check H: Import direction — packages/ must not import from apps/ --------

STAGED_PACKAGES_TS=$(echo "$STAGED_FILES" | grep "^packages/" | grep -E '\.(ts|tsx|js|jsx)$' | grep -v '__tests__\|\.test\.\|\.spec\.' || true)
if [ -n "$STAGED_PACKAGES_TS" ]; then
  IMPORT_VIOLATIONS=$(echo "$STAGED_PACKAGES_TS" | xargs grep -n \
    -E "from ['\"].*\.\..*apps/|from ['\"]@app/|require\(['\"].*apps/" \
    2>/dev/null | grep -v "@devox-ignore\|@ignore-import" || true)
  if [ -n "$IMPORT_VIOLATIONS" ]; then
    echo "ERROR: Import direction violation — packages/ must not import from apps/:"
    echo "$IMPORT_VIOLATIONS"
    echo "   Move shared code to packages/ or restructure the dependency."
    exit 1
  fi
fi

echo "All pre-commit checks passed."
