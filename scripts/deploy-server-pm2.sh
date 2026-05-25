#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_DIR="$ROOT_DIR/server"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install Node.js 20 LTS first."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed. Install npm first."
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is not installed. Run: npm install -g pm2"
  exit 1
fi

if [ ! -f "$SERVER_DIR/.env" ]; then
  echo "Missing $SERVER_DIR/.env. Create it from server/.env.example before deploy."
  exit 1
fi

cd "$SERVER_DIR"

npm ci
npm run prisma:generate
npm run db:push
npm run seed:super-admin
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "crm-server deployed with PM2."
