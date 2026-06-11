#!/usr/bin/env bash

# 服务器端部署脚本。
# 用法：在服务器上设置好 DEPLOY_PATH / REPO_URL / BRANCH 后执行本脚本。
# 它会进入部署目录，拉取 GitHub 最新代码，然后用 Docker Compose 重新构建并启动。

set -Eeuo pipefail

if [ -z "${DEPLOY_PATH:-}" ] && git rev-parse --show-toplevel >/dev/null 2>&1; then
  DEPLOY_PATH="$(git rev-parse --show-toplevel)"
fi

if [ -z "${REPO_URL:-}" ] && [ -n "${DEPLOY_PATH:-}" ] && [ -d "$DEPLOY_PATH/.git" ]; then
  REPO_URL="$(git -C "$DEPLOY_PATH" remote get-url origin)"
fi

: "${DEPLOY_PATH:?DEPLOY_PATH is required, for example /opt/agent-pm-blog}"
: "${REPO_URL:?REPO_URL is required, for example git@github.com:only-one-punch/AgentLearnForPM.git}"

BRANCH="${BRANCH:-main}"
ENV_FILE="${ENV_FILE:-.env.production}"

parent_dir="$(dirname "$DEPLOY_PATH")"
mkdir -p "$parent_dir"

if [ ! -d "$DEPLOY_PATH/.git" ]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$DEPLOY_PATH"
fi

cd "$DEPLOY_PATH"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $DEPLOY_PATH/$ENV_FILE"
  echo "Create it from .env.example or .env.docker.local before deploying."
  exit 1
fi

docker compose --env-file "$ENV_FILE" up -d --build

host_port="$(grep -E '^HOST_PORT=' "$ENV_FILE" | tail -n 1 | cut -d= -f2- || true)"
host_port="${host_port:-3000}"

base_path="$(grep -E '^NEXT_PUBLIC_BASE_PATH=' "$ENV_FILE" | tail -n 1 | cut -d= -f2- || true)"
base_path="${base_path%\"}"
base_path="${base_path#\"}"
base_path="${base_path%\'}"
base_path="${base_path#\'}"

health_url="http://127.0.0.1:${host_port}${base_path}/api/health"
home_url="http://127.0.0.1:${host_port}${base_path}"

echo "Checking ${health_url}"
if curl -fsS "$health_url" >/dev/null; then
  echo "Health check passed: ${health_url}"
else
  echo "Health endpoint failed, checking home page: ${home_url}"
  curl -fsSI "$home_url" >/dev/null
  echo "Home page check passed: ${home_url}"
fi

docker compose --env-file "$ENV_FILE" ps
