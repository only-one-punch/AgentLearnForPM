#!/usr/bin/env bash

# Start a server deploy in the background and write a small status file for CI.
# The foreground process exits quickly, so GitHub Actions does not need to keep
# one long SSH session open while Docker is building.

set -Eeuo pipefail

: "${DEPLOY_PATH:?DEPLOY_PATH is required, for example /opt/agent-pm-blog}"
: "${REPO_URL:?REPO_URL is required, for example git@github.com:only-one-punch/AgentLearnForPM.git}"

BRANCH="${BRANCH:-main}"
ENV_FILE="${ENV_FILE:-.env.production}"
DEPLOY_ID="${DEPLOY_ID:-manual-$(date +%Y%m%d%H%M%S)}"
DEPLOY_LOG_DIR="${DEPLOY_LOG_DIR:-$DEPLOY_PATH/.deploy-logs}"

mkdir -p "$DEPLOY_LOG_DIR"

log_file="$DEPLOY_LOG_DIR/$DEPLOY_ID.log"
status_file="$DEPLOY_LOG_DIR/$DEPLOY_ID.status"

printf 'running\n' > "$status_file"

(
  set +e

  {
    echo "Deploy started at $(date -Is)"
    echo "Deploy id: $DEPLOY_ID"
    echo "Deploy path: $DEPLOY_PATH"
    echo "Branch: $BRANCH"
    echo

    DEPLOY_PATH="$DEPLOY_PATH" \
      REPO_URL="$REPO_URL" \
      BRANCH="$BRANCH" \
      ENV_FILE="$ENV_FILE" \
      bash "$DEPLOY_PATH/scripts/server-deploy.sh"

    exit_code=$?
    echo
    echo "Deploy finished at $(date -Is)"
    echo "Exit code: $exit_code"

    if [ "$exit_code" -eq 0 ]; then
      printf 'success\n' > "$status_file"
    else
      printf 'failure\n' > "$status_file"
    fi

    exit "$exit_code"
  } > "$log_file" 2>&1
) &

echo "Started deploy $DEPLOY_ID"
echo "Log: $log_file"
echo "Status: $status_file"
