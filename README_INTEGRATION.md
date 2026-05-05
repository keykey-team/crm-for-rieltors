# CLIENT-SERVER Integration Guide

## Overview

This repository now uses a split architecture:

- **client/**: Next.js frontend (port `3000`)
- **server/**: Express API backend (port `4000`)

The client authenticates against server `/api/auth/*` endpoints and uses cookie-based JWT sessions (`crm_token`).

## Environment Variables

### Server (`server/.env`)

Create from `server/.env.example`:

```bash
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm?schema=public
JWT_SECRET=change-me
```

### Client (`client/.env.local`)

Create from `client/.env.local.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Development Run

Open two terminals:

### 1) Start server

```bash
cd server
npm install
npm run dev
```

### 2) Start client

```bash
cd client
npm install
npm run dev
```

## API Routing Strategy

- `httpClient` uses `NEXT_PUBLIC_API_URL` and appends `/api` automatically.
- `client/next.config.js` also contains a rewrite:
  - `/api/:path*` -> `http://localhost:4000/api/:path*`

This keeps existing `/api/*` requests routed to Express during development.

## Auth Flow

1. Login/Register from client calls server auth endpoints.
2. Server sets `crm_token` as `httpOnly` cookie.
3. Middleware checks `crm_token` for protected routes.
4. Auth provider loads session from `GET /api/auth/session`.

## Build Verification

```bash
cd server && npm run build
cd ../client && npm run build
```

If both pass, integration is in a valid state.
