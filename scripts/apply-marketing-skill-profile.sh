#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/.agents/skills"
PROFILE_DIR="$SKILLS_DIR/.profiles"
PROFILE_FILE="$PROFILE_DIR/prosepal-web-keep.txt"

KEEP_SKILLS=(
  "ab-test-setup"
  "ad-creative"
  "ai-seo"
  "analytics-tracking"
  "churn-prevention"
  "cold-email"
  "competitor-alternatives"
  "content-strategy"
  "copy-editing"
  "copywriting"
  "customer-research"
  "email-sequence"
  "form-cro"
  "free-tool-strategy"
  "launch-strategy"
  "lead-magnets"
  "marketing-ideas"
  "marketing-psychology"
  "onboarding-cro"
  "page-cro"
  "paid-ads"
  "paywall-upgrade-cro"
  "popup-cro"
  "pricing-strategy"
  "product-marketing-context"
  "programmatic-seo"
  "referral-program"
  "revops"
  "sales-enablement"
  "schema-markup"
  "seo-audit"
  "signup-flow-cro"
  "site-architecture"
  "social-content"
)

usage() {
  cat <<'EOF'
Usage:
  scripts/apply-marketing-skill-profile.sh --list
  scripts/apply-marketing-skill-profile.sh --apply
EOF
}

is_kept() {
  local candidate="$1"
  for keep in "${KEEP_SKILLS[@]}"; do
    if [[ "$keep" == "$candidate" ]]; then
      return 0
    fi
  done
  return 1
}

list_profile() {
  echo "Keep skills (${#KEEP_SKILLS[@]}):"
  for keep in "${KEEP_SKILLS[@]}"; do
    echo "  - $keep"
  done

  echo
  echo "Installed skills:"
  find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name ".*" -print \
    | sed "s#^$SKILLS_DIR/##" \
    | sort
}

apply_profile() {
  mkdir -p "$PROFILE_DIR"

  printf "# Prosepal-web marketing skill profile\n" >"$PROFILE_FILE"
  printf "# Generated: %s\n" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >>"$PROFILE_FILE"
  printf "# Keep list:\n" >>"$PROFILE_FILE"
  for keep in "${KEEP_SKILLS[@]}"; do
    printf "%s\n" "$keep" >>"$PROFILE_FILE"
  done

  while IFS= read -r dir_name; do
    if [[ "$dir_name" == "prosepal-web-context" ]]; then
      continue
    fi

    if ! is_kept "$dir_name"; then
      rm -rf "$SKILLS_DIR/$dir_name"
      echo "Removed: $dir_name"
    fi
  done < <(
    find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name ".*" -print \
      | sed "s#^$SKILLS_DIR/##" \
      | sort
  )

  echo "Profile applied."
}

main() {
  if [[ $# -ne 1 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    --list)
      list_profile
      ;;
    --apply)
      apply_profile
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
