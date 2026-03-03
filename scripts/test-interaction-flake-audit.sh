#!/usr/bin/env bash
set -euo pipefail

REPEAT_EACH="${REPEAT_EACH:-5}"
WORKERS="${WORKERS:-1}"
LOG_ROOT="${LOG_ROOT:-/tmp/prosepal-web-flake-audit}"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
LOG_FILE="${LOG_ROOT}/interaction-smoke-repeat-${TIMESTAMP}.log"

mkdir -p "${LOG_ROOT}"

echo "Running Playwright smoke flake audit"
echo "repeat_each=${REPEAT_EACH}"
echo "workers=${WORKERS}"
echo "log_file=${LOG_FILE}"

bunx playwright test \
  -c playwright.interaction.config.js \
  --grep @smoke \
  --repeat-each="${REPEAT_EACH}" \
  --workers="${WORKERS}" \
  --retries=0 | tee "${LOG_FILE}"

echo "Flake audit completed successfully."
echo "Log saved to ${LOG_FILE}"
