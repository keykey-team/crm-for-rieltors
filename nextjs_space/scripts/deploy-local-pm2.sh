#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="${APP_ROOT:-$(cd -- "$SCRIPT_DIR/.." && pwd)}"
APP_NAME="${APP_NAME:-realcrm}"
APP_USER="${APP_USER:-$(id -un)}"
PORT="${PORT:-3000}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
APP_PUBLIC_URL="${APP_PUBLIC_URL:-http://localhost:$PORT}"

POSTGRES_DB="${POSTGRES_DB:-realcrm_db}"
POSTGRES_USER="${POSTGRES_USER:-realcrm_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-change_me_db_password}"

NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-}"
AUTOMATION_SECRET="${AUTOMATION_SECRET:-}"

RUN_SEED="${RUN_SEED:-1}"
CREATE_ENV="${CREATE_ENV:-1}"
CREATE_DB="${CREATE_DB:-1}"
INSTALL_PM2="${INSTALL_PM2:-1}"
INSTALL_POSTGRES="${INSTALL_POSTGRES:-0}"
INSTALL_NODEJS="${INSTALL_NODEJS:-0}"

AWS_REGION="${AWS_REGION:-}"
AWS_BUCKET_NAME="${AWS_BUCKET_NAME:-}"
AWS_FOLDER_PREFIX="${AWS_FOLDER_PREFIX:-}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"

SUDO=''
if [[ "${EUID}" -ne 0 ]]; then
  SUDO='sudo'
fi

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

random_secret() {
  openssl rand -hex 32
}

urlencode() {
  node -e "console.log(encodeURIComponent(process.argv[1]))" "$1"
}

ensure_app_root() {
  if [[ ! -f "$APP_ROOT/package.json" ]]; then
    echo "package.json not found in APP_ROOT=$APP_ROOT" >&2
    exit 1
  fi
}

install_system_dependencies_if_requested() {
  if [[ "$INSTALL_NODEJS" == "1" ]]; then
    log "Installing Node.js 20"

    $SUDO apt-get update
    $SUDO apt-get install -y ca-certificates curl gnupg

    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -

    $SUDO apt-get install -y nodejs
  fi

  if [[ "$INSTALL_POSTGRES" == "1" ]]; then
    log "Installing PostgreSQL"

    $SUDO apt-get update
    $SUDO apt-get install -y postgresql postgresql-contrib
  fi
}

ensure_pm2_if_needed() {
  if [[ "$INSTALL_PM2" != "1" ]]; then
    return
  fi

  if ! command -v pm2 >/dev/null 2>&1; then
    log "Installing pm2 globally"

    npm install -g pm2
  fi
}

create_local_database_if_requested() {
  if [[ "$CREATE_DB" != "1" ]]; then
    return
  fi

  require_command psql

  local pg_password_sql
  local psql_as_postgres

  pg_password_sql="${POSTGRES_PASSWORD//\'/\'\'}"

  if [[ "${EUID}" -eq 0 ]]; then
    psql_as_postgres="runuser -u postgres -- psql"
  else
    psql_as_postgres="sudo -u postgres psql"
  fi

  log "Ensuring PostgreSQL service is running"

  $SUDO systemctl enable postgresql
  $SUDO systemctl start postgresql

  log "Creating PostgreSQL role and database"

  $psql_as_postgres <<SQL
DO
\$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = '${POSTGRES_USER}'
  ) THEN
    CREATE ROLE ${POSTGRES_USER}
    LOGIN
    PASSWORD '${pg_password_sql}';
  ELSE
    ALTER ROLE ${POSTGRES_USER}
    WITH LOGIN PASSWORD '${pg_password_sql}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER}'
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_database
  WHERE datname = '${POSTGRES_DB}'
)\gexec

GRANT ALL PRIVILEGES
ON DATABASE ${POSTGRES_DB}
TO ${POSTGRES_USER};
SQL
}

write_env_if_requested() {
  if [[ "$CREATE_ENV" != "1" && -f "$APP_ROOT/.env" ]]; then
    return
  fi

  if [[ -z "$NEXTAUTH_SECRET" ]]; then
    NEXTAUTH_SECRET="$(random_secret)"
  fi

  if [[ -z "$AUTOMATION_SECRET" ]]; then
    AUTOMATION_SECRET="$(random_secret)"
  fi

  local postgres_password_url
  local database_url

  postgres_password_url="$(urlencode "$POSTGRES_PASSWORD")"

  database_url="postgresql://${POSTGRES_USER}:${postgres_password_url}@127.0.0.1:5432/${POSTGRES_DB}?schema=public"

  log "Writing .env"

  cat > "$APP_ROOT/.env" <<EOF
DATABASE_URL="$database_url"
NEXTAUTH_URL="$APP_PUBLIC_URL"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
AUTOMATION_SECRET="$AUTOMATION_SECRET"
NODE_ENV="production"
PORT="$PORT"
EOF

  if [[ -n "$AWS_REGION" ]]; then
    printf 'AWS_REGION="%s"\n' "$AWS_REGION" >> "$APP_ROOT/.env"
  fi

  if [[ -n "$AWS_BUCKET_NAME" ]]; then
    printf 'AWS_BUCKET_NAME="%s"\n' "$AWS_BUCKET_NAME" >> "$APP_ROOT/.env"
  fi

  if [[ -n "$AWS_FOLDER_PREFIX" ]]; then
    printf 'AWS_FOLDER_PREFIX="%s"\n' "$AWS_FOLDER_PREFIX" >> "$APP_ROOT/.env"
  fi

  if [[ -n "$AWS_ACCESS_KEY_ID" ]]; then
    printf 'AWS_ACCESS_KEY_ID="%s"\n' "$AWS_ACCESS_KEY_ID" >> "$APP_ROOT/.env"
  fi

  if [[ -n "$AWS_SECRET_ACCESS_KEY" ]]; then
    printf 'AWS_SECRET_ACCESS_KEY="%s"\n' "$AWS_SECRET_ACCESS_KEY" >> "$APP_ROOT/.env"
  fi

  chmod 600 "$APP_ROOT/.env"
}

install_build_and_seed() {
  log "Installing application dependencies"

  npm install --legacy-peer-deps

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
}

start_with_pm2() {
  export NODE_ENV=production
  export PORT

  log "Starting application with pm2 on $HOSTNAME:$PORT"

  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true

  pm2 start npm \
    --name "$APP_NAME" \
    --cwd "$APP_ROOT" \
    -- run start -- --hostname "$HOSTNAME" --port "$PORT"

  pm2 save
  pm2 status "$APP_NAME"
}

print_summary() {
  log "Deployment complete"

  printf 'App root: %s\n' "$APP_ROOT"
  printf 'App URL: %s\n' "$APP_PUBLIC_URL"
  printf 'PM2 app name: %s\n' "$APP_NAME"
  printf 'Database: %s\n' "$POSTGRES_DB"
  printf 'Database user: %s\n' "$POSTGRES_USER"
  printf 'Seed executed: %s\n' "$RUN_SEED"
  printf 'Test login: john@doe.com / johndoe123\n'
  printf 'To enable pm2 autostart later: pm2 startup systemd -u %s --hp /home/%s && pm2 save\n' "$APP_USER" "$APP_USER"
}

main() {
  install_system_dependencies_if_requested

  require_command node
  require_command npm
  require_command git
  require_command openssl

  cd "$APP_ROOT"

  ensure_app_root
  ensure_pm2_if_needed
  create_local_database_if_requested
  write_env_if_requested
  install_build_and_seed
  start_with_pm2
  print_summary
}

main "$@"