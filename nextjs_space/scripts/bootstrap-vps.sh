#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${CONFIG_FILE:-$SCRIPT_DIR/bootstrap-vps.env}"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Missing config file: $CONFIG_FILE" >&2
  echo "Copy bootstrap-vps.env.example to bootstrap-vps.env and fill in the values." >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"

APP_NAME="${APP_NAME:-realcrm}"
APP_USER="${APP_USER:-ubuntu}"
APP_HOME="${APP_HOME:-/home/$APP_USER}"
PROJECT_NAME="${PROJECT_NAME:-realtor_crm}"
APP_PORT="${APP_PORT:-3000}"
APP_SCHEME="${APP_SCHEME:-https}"
BRANCH="${BRANCH:-develop}"
RUN_SEED="${RUN_SEED:-1}"
ENABLE_CERTBOT="${ENABLE_CERTBOT:-0}"
ENABLE_FIREWALL="${ENABLE_FIREWALL:-1}"
INSTALL_AWS_CLI="${INSTALL_AWS_CLI:-0}"
CLIENT_MAX_BODY_SIZE="${CLIENT_MAX_BODY_SIZE:-25M}"
POSTGRES_DB="${POSTGRES_DB:-realcrm_db}"
POSTGRES_USER="${POSTGRES_USER:-realcrm_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-}"
AUTOMATION_SECRET="${AUTOMATION_SECRET:-}"

APP_ROOT="${APP_ROOT:-$APP_HOME/$PROJECT_NAME/nextjs_space}"
REPO_ROOT="$(dirname "$APP_ROOT")"
ENV_FILE="$APP_ROOT/.env"
NGINX_SITE_PATH="/etc/nginx/sites-available/$APP_NAME"
NGINX_SITE_LINK="/etc/nginx/sites-enabled/$APP_NAME"

SUDO=''
if [[ "${EUID}" -ne 0 ]]; then
  SUDO='sudo'
fi

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

require_value() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "Missing required config value: $name" >&2
    exit 1
  fi
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

run_as_app_user() {
  if [[ "$(id -un)" == "$APP_USER" ]]; then
    bash -lc "$*"
  else
    $SUDO -u "$APP_USER" -H bash -lc "$*"
  fi
}

ensure_user_exists() {
  if ! id "$APP_USER" >/dev/null 2>&1; then
    echo "User $APP_USER does not exist on this server." >&2
    exit 1
  fi
}

validate_identifier() {
  local name="$1"
  local value="$2"
  if [[ ! "$value" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
    echo "$name must match ^[a-zA-Z_][a-zA-Z0-9_]*$" >&2
    exit 1
  fi
}

random_secret() {
  openssl rand -hex 32
}

urlencode() {
  node -e "console.log(encodeURIComponent(process.argv[1]))" "$1"
}

install_system_packages() {
  log "Installing system packages"
  $SUDO apt-get update
  $SUDO apt-get install -y ca-certificates curl gnupg git build-essential openssl nginx postgresql postgresql-contrib

  if [[ "$ENABLE_FIREWALL" == "1" ]]; then
    $SUDO apt-get install -y ufw
  fi

  if [[ "$ENABLE_CERTBOT" == "1" ]]; then
    $SUDO apt-get install -y certbot python3-certbot-nginx
  fi

  if [[ "$INSTALL_AWS_CLI" == "1" ]]; then
    $SUDO apt-get install -y awscli
  fi
}

install_nodejs_if_needed() {
  if command_exists node && [[ "$(node -p 'process.versions.node.split(".")[0]')" == "20" ]]; then
    log "Node.js 20 already installed"
    return
  fi

  log "Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
  $SUDO apt-get install -y nodejs
}

install_pm2_if_needed() {
  if command_exists pm2; then
    log "pm2 already installed"
    return
  fi

  log "Installing pm2 globally"
  $SUDO npm install -g pm2
}

prepare_postgres() {
  local pg_password_sql
  pg_password_sql="${POSTGRES_PASSWORD//\'/\'\'}"

  log "Ensuring PostgreSQL is enabled"
  $SUDO systemctl enable postgresql
  $SUDO systemctl start postgresql

  log "Creating PostgreSQL role and database"
  $SUDO -u postgres psql <<SQL
DO
\$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${POSTGRES_USER}') THEN
    CREATE ROLE ${POSTGRES_USER} LOGIN PASSWORD '${pg_password_sql}';
  ELSE
    ALTER ROLE ${POSTGRES_USER} WITH LOGIN PASSWORD '${pg_password_sql}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER}'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
SQL
}

clone_or_update_repo() {
  if [[ -d "$REPO_ROOT/.git" ]]; then
    log "Repository already exists at $REPO_ROOT"
    return
  fi

  log "Cloning repository into $REPO_ROOT"
  $SUDO mkdir -p "$APP_HOME"
  run_as_app_user "git clone '$REPO_URL' '$REPO_ROOT'"
}

write_env_file() {
  local database_url
  local postgres_password_url

  postgres_password_url="$(urlencode "$POSTGRES_PASSWORD")"
  database_url="postgresql://${POSTGRES_USER}:${postgres_password_url}@127.0.0.1:5432/${POSTGRES_DB}?schema=public"

  log "Writing production .env"
  $SUDO mkdir -p "$APP_ROOT"
  cat <<EOF | $SUDO tee "$ENV_FILE" >/dev/null
DATABASE_URL="$database_url"
NEXTAUTH_URL="${APP_SCHEME}://${DOMAIN}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
AUTOMATION_SECRET="${AUTOMATION_SECRET}"
NODE_ENV="production"
PORT="${APP_PORT}"
EOF

  if [[ -n "${AWS_REGION:-}" ]]; then
    printf 'AWS_REGION="%s"\n' "$AWS_REGION" | $SUDO tee -a "$ENV_FILE" >/dev/null
  fi
  if [[ -n "${AWS_BUCKET_NAME:-}" ]]; then
    printf 'AWS_BUCKET_NAME="%s"\n' "$AWS_BUCKET_NAME" | $SUDO tee -a "$ENV_FILE" >/dev/null
  fi
  if [[ -n "${AWS_FOLDER_PREFIX:-}" ]]; then
    printf 'AWS_FOLDER_PREFIX="%s"\n' "$AWS_FOLDER_PREFIX" | $SUDO tee -a "$ENV_FILE" >/dev/null
  fi
  if [[ -n "${AWS_ACCESS_KEY_ID:-}" ]]; then
    printf 'AWS_ACCESS_KEY_ID="%s"\n' "$AWS_ACCESS_KEY_ID" | $SUDO tee -a "$ENV_FILE" >/dev/null
  fi
  if [[ -n "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
    printf 'AWS_SECRET_ACCESS_KEY="%s"\n' "$AWS_SECRET_ACCESS_KEY" | $SUDO tee -a "$ENV_FILE" >/dev/null
  fi

  $SUDO chown "$APP_USER":"$APP_USER" "$ENV_FILE"
  $SUDO chmod 600 "$ENV_FILE"
}

write_nginx_config() {
  log "Writing nginx configuration"
  cat <<EOF | $SUDO tee "$NGINX_SITE_PATH" >/dev/null
server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size ${CLIENT_MAX_BODY_SIZE};

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

  $SUDO ln -snf "$NGINX_SITE_PATH" "$NGINX_SITE_LINK"
  if [[ -f /etc/nginx/sites-enabled/default ]]; then
    $SUDO rm -f /etc/nginx/sites-enabled/default
  fi

  $SUDO nginx -t
  $SUDO systemctl enable nginx
  $SUDO systemctl reload nginx
}

configure_https_if_requested() {
  if [[ "$ENABLE_CERTBOT" != "1" ]]; then
    return
  fi

  require_value LETSENCRYPT_EMAIL "${LETSENCRYPT_EMAIL:-}"
  log "Requesting TLS certificate with certbot"
  $SUDO certbot --nginx --non-interactive --agree-tos --redirect -m "$LETSENCRYPT_EMAIL" -d "$DOMAIN"
}

configure_firewall_if_requested() {
  if [[ "$ENABLE_FIREWALL" != "1" ]]; then
    return
  fi

  log "Configuring ufw"
  $SUDO ufw allow OpenSSH
  $SUDO ufw allow 'Nginx Full'
  $SUDO ufw --force enable
}

run_app_deploy() {
  log "Running application deploy script"
  run_as_app_user "cd '$APP_ROOT' && INSTALL_PM2=0 RUN_SEED='$RUN_SEED' APP_NAME='$APP_NAME' APP_ROOT='$APP_ROOT' BRANCH='$BRANCH' bash '$APP_ROOT/scripts/deploy-vps.sh'"
}

configure_pm2_startup() {
  log "Configuring pm2 startup"
  PATH="$PATH:/usr/bin" $SUDO pm2 startup systemd -u "$APP_USER" --hp "$APP_HOME"
  run_as_app_user "pm2 save"
}

print_summary() {
  log "Deployment summary"
  printf 'App URL: %s://%s\n' "$APP_SCHEME" "$DOMAIN"
  printf 'App root: %s\n' "$APP_ROOT"
  printf 'PM2 app name: %s\n' "$APP_NAME"
  printf 'Database: %s\n' "$POSTGRES_DB"
  printf 'Database user: %s\n' "$POSTGRES_USER"
  printf 'Seed executed: %s\n' "$RUN_SEED"
  printf 'Test login: john@doe.com / johndoe123\n'
}

main() {
  require_value REPO_URL "${REPO_URL:-}"
  require_value DOMAIN "${DOMAIN:-}"

  ensure_user_exists
  validate_identifier POSTGRES_DB "$POSTGRES_DB"
  validate_identifier POSTGRES_USER "$POSTGRES_USER"

  if [[ -z "$POSTGRES_PASSWORD" ]]; then
    POSTGRES_PASSWORD="$(random_secret)"
  fi
  if [[ -z "$NEXTAUTH_SECRET" ]]; then
    NEXTAUTH_SECRET="$(random_secret)"
  fi
  if [[ -z "$AUTOMATION_SECRET" ]]; then
    AUTOMATION_SECRET="$(random_secret)"
  fi

  install_system_packages
  install_nodejs_if_needed
  install_pm2_if_needed
  clone_or_update_repo
  prepare_postgres
  write_env_file
  run_app_deploy
  write_nginx_config
  configure_https_if_requested
  configure_firewall_if_requested
  configure_pm2_startup
  print_summary
}

main "$@"
