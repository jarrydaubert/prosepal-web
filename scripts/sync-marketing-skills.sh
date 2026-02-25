#!/usr/bin/env bash

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/coreyhaines31/marketingskills}"
UPSTREAM_REF="${UPSTREAM_REF:-v1.2.0}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_SKILLS_DIR="$PROJECT_ROOT/.claude/skills"
LOCAL_SOURCE_DIR="$LOCAL_SKILLS_DIR/.sources"
LOCAL_SOURCE_FILE="$LOCAL_SOURCE_DIR/marketingskills.json"
CACHE_DIR="${CACHE_DIR:-/tmp/marketingskills-sync}"
SKIP_FETCH="${SKIP_FETCH:-0}"

usage() {
  cat <<'EOF'
Usage:
  scripts/sync-marketing-skills.sh --sync
  scripts/sync-marketing-skills.sh --check

Options:
  --sync    Fetch upstream skills and sync into .claude/skills
  --check   Compare local synced commit vs upstream commit

Environment overrides:
  REPO_URL      (default: https://github.com/coreyhaines31/marketingskills)
  UPSTREAM_REF  (default: v1.2.0)
  CACHE_DIR     (default: /tmp/marketingskills-sync)
  SKIP_FETCH    (default: 0)
EOF
}

ensure_repo() {
  if [[ "$SKIP_FETCH" == "1" ]]; then
    if [[ ! -d "$CACHE_DIR/.git" ]]; then
      echo "SKIP_FETCH=1 but CACHE_DIR is not a git checkout: $CACHE_DIR" >&2
      exit 1
    fi
    return
  fi

  if [[ ! -d "$CACHE_DIR/.git" ]]; then
    git clone --depth 1 --branch "$UPSTREAM_REF" "$REPO_URL" "$CACHE_DIR" >/dev/null
    return
  fi

  git -C "$CACHE_DIR" fetch origin --tags --quiet

  if git -C "$CACHE_DIR" show-ref --verify --quiet "refs/tags/$UPSTREAM_REF"; then
    git -C "$CACHE_DIR" checkout --detach "$UPSTREAM_REF" --quiet
    return
  fi

  git -C "$CACHE_DIR" fetch origin "$UPSTREAM_REF" --quiet
  git -C "$CACHE_DIR" checkout --detach "$UPSTREAM_REF" --quiet
}

get_upstream_commit() {
  git -C "$CACHE_DIR" rev-parse "$UPSTREAM_REF^{commit}"
}

get_local_commit() {
  if [[ ! -f "$LOCAL_SOURCE_FILE" ]]; then
    echo ""
    return
  fi

  sed -n 's/.*"commit": "\([^"]*\)".*/\1/p' "$LOCAL_SOURCE_FILE" | head -n 1
}

write_source_metadata() {
  local commit="$1"
  local synced_at
  synced_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  mkdir -p "$LOCAL_SOURCE_DIR"
  cat >"$LOCAL_SOURCE_FILE" <<EOF
{
  "repo": "$REPO_URL",
  "ref": "$UPSTREAM_REF",
  "commit": "$commit",
  "synced_at_utc": "$synced_at"
}
EOF
}

sync_skills() {
  mkdir -p "$LOCAL_SKILLS_DIR"
  rsync -a --delete \
    --exclude ".DS_Store" \
    --exclude ".sources/" \
    --exclude ".profiles/" \
    --exclude "prosepal-web-context/" \
    "$CACHE_DIR/skills/" "$LOCAL_SKILLS_DIR/"
}

main() {
  if [[ $# -ne 1 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    --sync)
      ensure_repo
      sync_skills
      upstream_commit="$(get_upstream_commit)"
      write_source_metadata "$upstream_commit"
      echo "Synced marketing skills from $REPO_URL@$upstream_commit"
      ;;
    --check)
      ensure_repo
      upstream_commit="$(get_upstream_commit)"
      local_commit="$(get_local_commit)"

      echo "Upstream commit: $upstream_commit"
      if [[ -n "$local_commit" ]]; then
        echo "Local commit:    $local_commit"
      else
        echo "Local commit:    <none>"
      fi

      if [[ "$upstream_commit" == "$local_commit" ]]; then
        echo "Status: up to date"
      else
        echo "Status: update available"
      fi
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
