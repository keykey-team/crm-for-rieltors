#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="${APP_ROOT:-$(cd -- "$SCRIPT_DIR/.." && pwd)}"
BRANCH="${BRANCH:-develop}"
PORT="${PORT:-3000}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
RUN_SEED="${RUN_SEED:-0}"
UPDATE_REPO="${UPDATE_REPO:-0}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

ensure_app_root() {
  if [[ ! -f "$APP_ROOT/package.json" ]]; then
    echo "package.json not found in APP_ROOT=$APP_ROOT" >&2
    exit 1
  fi

  if [[ ! -f "$APP_ROOT/.env" ]]; then
    echo "Missing $APP_ROOT/.env" >&2
    echo "Create the environment file before running this script." >&2
    exit 1
  fi
}

update_repo_if_requested() {
  if [[ "$UPDATE_REPO" != "1" ]]; then
    return
  fi

  log "Updating repository"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
}

main() {
  require_command git
  require_command node
  require_command npm

  cd "$APP_ROOT"
  ensure_app_root
  update_repo_if_requested

  log "Installing application dependencies"
  npm install

  log "Generating Prisma client"
  npx prisma generate

  log "Applying database schema"
  npx prisma db push

  if [[ "$RUN_SEED" == "1" ]]; then
    log "Seeding database"
    npx prisma db seed
  fi

  log "Building Next.js application"
  npm run build

  export NODE_ENV=production
  export PORT

  log "Starting Next.js on $HOSTNAME:$PORT"
  exec npm run start -- --hostname "$HOSTNAME" --port "$PORT"
}

main "$@"