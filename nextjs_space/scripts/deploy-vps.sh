#!/usr/bin/env bash

set -Eeuo pipefail

APP_NAME="${APP_NAME:-realcrm}"
BRANCH="${BRANCH:-develop}"
REPO_URL="${REPO_URL:-}"
APP_ROOT="${APP_ROOT:-/home/ubuntu/realtor_crm/nextjs_space}"
PROJECT_ROOT="$(dirname "$APP_ROOT")"
RUN_SEED="${RUN_SEED:-0}"
INSTALL_PM2="${INSTALL_PM2:-1}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

ensure_repo() {
  if [[ -d "$APP_ROOT/.git" || -f "$APP_ROOT/package.json" ]]; then
    return
  fi

  if [[ -z "$REPO_URL" ]]; then
    echo "APP_ROOT does not exist and REPO_URL is not set." >&2
    echo "Set REPO_URL to allow the script to clone the repository." >&2
    exit 1
  fi

  mkdir -p "$PROJECT_ROOT"
  log "Cloning repository into $PROJECT_ROOT"
  git clone "$REPO_URL" "$PROJECT_ROOT"
}

update_repo() {
  log "Updating repository"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
}

ensure_env() {
  if [[ ! -f "$APP_ROOT/.env" ]]; then
    echo "Missing $APP_ROOT/.env" >&2
    echo "Create the production .env file before running deploy." >&2
    exit 1
  fi
}

install_pm2_if_needed() {
  if [[ "$INSTALL_PM2" != "1" ]]; then
    return
  fi

  if ! command -v pm2 >/dev/null 2>&1; then
    log "Installing pm2 globally"
    npm install -g pm2
  fi
}

main() {
  require_command git
  require_command node
  require_command npm

  ensure_repo
  cd "$APP_ROOT"
  ensure_env
  update_repo
  install_pm2_if_needed

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

  export APP_ROOT
  export PM2_APP_NAME="$APP_NAME"
  export NODE_ENV=production

  log "Reloading application with pm2"
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" --update-env
  else
    pm2 start ecosystem.config.cjs --only "$APP_NAME" --update-env
  fi

  pm2 save

  log "Deployment complete"
  log "pm2 status"
  pm2 status "$APP_NAME"
  log "If pm2 startup is not configured yet, run: pm2 startup systemd -u $USER --hp $HOME"
}

main "$@"