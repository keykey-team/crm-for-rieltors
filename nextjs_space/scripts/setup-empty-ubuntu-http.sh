#!/usr/bin/env bash

set -Eeuo pipefail

REPO_URL="${REPO_URL:-git@github.com:your-org/your-repo.git}"
BRANCH="${BRANCH:-develop}"
DOMAIN="${DOMAIN:-crm.example.com}"

APP_NAME="${APP_NAME:-realcrm}"
APP_USER="${APP_USER:-ubuntu}"
APP_HOME="${APP_HOME:-/home/$APP_USER}"
PROJECT_NAME="${PROJECT_NAME:-realtor_crm}"
APP_PORT="${APP_PORT:-3000}"

POSTGRES_DB="${POSTGRES_DB:-realcrm_db}"
POSTGRES_USER="${POSTGRES_USER:-realcrm_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-change_me_db_password}"

RUN_SEED="${RUN_SEED:-1}"
ENABLE_FIREWALL="${ENABLE_FIREWALL:-1}"
INSTALL_AWS_CLI="${INSTALL_AWS_CLI:-0}"
CLIENT_MAX_BODY_SIZE="${CLIENT_MAX_BODY_SIZE:-25M}"

NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-}"
AUTOMATION_SECRET="${AUTOMATION_SECRET:-}"

AWS_REGION="${AWS_REGION:-}"
AWS_BUCKET_NAME="${AWS_BUCKET_NAME:-}"
AWS_FOLDER_PREFIX="${AWS_FOLDER_PREFIX:-}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"

SUDO=''
if [[ "${EUID}" -ne 0 ]]; then
  SUDO='sudo'
fi

APP_ROOT="$APP_HOME/$PROJECT_NAME/nextjs_space"
REPO_ROOT="$(dirname "$APP_ROOT")"
BOOTSTRAP_CONFIG="$APP_ROOT/scripts/bootstrap-vps.env"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  echo "$*" >&2
  exit 1
}

require_value() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    fail "Missing required value: $name"
  fi
}

ensure_app_user() {
  if ! id "$APP_USER" >/dev/null 2>&1; then
    fail "User $APP_USER does not exist on this server"
  fi
}

run_as_app_user() {
  if [[ "$(id -un)" == "$APP_USER" ]]; then
    bash -lc "$*"
  else
    $SUDO -u "$APP_USER" -H bash -lc "$*"
  fi
}

install_minimal_prereqs() {
  log "Installing minimal prerequisites"
  $SUDO apt-get update
  $SUDO apt-get install -y ca-certificates curl git
}

clone_repo_if_needed() {
  if [[ -d "$REPO_ROOT/.git" ]]; then
    log "Repository already exists at $REPO_ROOT"
    return
  fi

  log "Cloning repository into $REPO_ROOT"
  $SUDO mkdir -p "$APP_HOME"
  run_as_app_user "git clone --branch '$BRANCH' '$REPO_URL' '$REPO_ROOT'"
}

write_bootstrap_config() {
  log "Writing bootstrap config without SSL"
  cat <<EOF | $SUDO tee "$BOOTSTRAP_CONFIG" >/dev/null
REPO_URL=$REPO_URL
BRANCH=$BRANCH

APP_NAME=$APP_NAME
APP_USER=$APP_USER
APP_HOME=$APP_HOME
PROJECT_NAME=$PROJECT_NAME
APP_PORT=$APP_PORT

DOMAIN=$DOMAIN
APP_SCHEME=http
CLIENT_MAX_BODY_SIZE=$CLIENT_MAX_BODY_SIZE

ENABLE_CERTBOT=0
LETSENCRYPT_EMAIL=
ENABLE_FIREWALL=$ENABLE_FIREWALL
INSTALL_AWS_CLI=$INSTALL_AWS_CLI

POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

RUN_SEED=$RUN_SEED

NEXTAUTH_SECRET=$NEXTAUTH_SECRET
AUTOMATION_SECRET=$AUTOMATION_SECRET

AWS_REGION=$AWS_REGION
AWS_BUCKET_NAME=$AWS_BUCKET_NAME
AWS_FOLDER_PREFIX=$AWS_FOLDER_PREFIX
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
EOF

  $SUDO chown "$APP_USER":"$APP_USER" "$BOOTSTRAP_CONFIG"
  $SUDO chmod 600 "$BOOTSTRAP_CONFIG"
}

run_bootstrap() {
  log "Running full bootstrap"
  run_as_app_user "cd '$APP_ROOT' && CONFIG_FILE='$BOOTSTRAP_CONFIG' bash scripts/bootstrap-vps.sh"
}

print_summary() {
  log "Setup complete"
  printf 'URL: http://%s\n' "$DOMAIN"
  printf 'App root: %s\n' "$APP_ROOT"
  printf 'PM2 app name: %s\n' "$APP_NAME"
  printf 'Test login: john@doe.com / johndoe123\n'
  printf 'SSL is disabled in this script. Add it later in nginx when you are ready.\n'
}

main() {
  require_value REPO_URL "$REPO_URL"
  require_value DOMAIN "$DOMAIN"
  ensure_app_user
  install_minimal_prereqs
  clone_repo_if_needed
  write_bootstrap_config
  run_bootstrap
  print_summary
}

main "$@"