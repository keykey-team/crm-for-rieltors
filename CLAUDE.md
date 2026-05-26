# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project structure

Monorepo with two separate apps:

- `client/` — Next.js 14 (App Router) frontend, runs on port 3000
- `server/` — Express.js backend (modular monolith), runs on port 4000
- `docker-compose.yml` — starts PostgreSQL + server together

Prisma schema lives in `server/prisma/`, not in client.

## Commands

### Client (run from `client/`)

Package manager: **yarn**

```bash
yarn dev          # dev server on :3000
yarn build        # production build
yarn lint         # ESLint
yarn typecheck    # tsc --noEmit (no build output)
```

### Server (run from `server/`)

Package manager: **npm**

```bash
npm run dev              # dev server on :4000 (tsx watch)
npm run build            # tsc compile to dist/
npm run db:push          # push Prisma schema to DB (dev only)
npm run prisma:generate  # regenerate Prisma client after schema changes
npm run seed:super-admin # create initial admin user
```

### Full stack with Docker

```bash
docker compose up        # starts postgres + server (auto-runs db:push and seed)
```

## API routing

All `/api/*` calls from the client go to the server at `http://localhost:4000` via Next.js fallback rewrites (`next.config.js`). The **only** API routes handled directly by Next.js are:
- `/api/auth/[...nextauth]` — NextAuth.js session
- `/api/auth/crm-session` — session bridge for server JWT

## Client architecture (FSD)

`client/src/` follows Feature-Sliced Design:

```
src/
  shared/      # UI primitives, layout components, lib utilities, global widgets
  entities/    # Domain objects: lead, deal, property, task, calendar, chat, etc.
               # Each has: api/<name>.api.ts, model/types.ts, ui/, index.ts
  features/    # User interactions: create-lead, create-deal, sign-in, update-lead, etc.
               # Each has: model/use-<name>.ts (hook), ui/<name>.tsx, index.ts
```

Pages live in `app/(dashboard)/` and `app/(auth)/` (Next.js App Router), not in an FSD `pages/` layer.

**Import rule:** entities can only import from `shared`; features can import from `entities` and `shared`. Pages import from all layers. Never import upward.

## Shared utilities

Key files in `client/src/shared/lib/`:

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth config, JWT callbacks, session shape |
| `role-guard.ts` | `getSessionUser()`, `hasRole()`, `requireRole()`, `ownershipFilter()` |
| `permissions.ts` | Per-user section access: `CRM_SECTIONS`, `hasPermission()` |
| `constants.ts` | Fallback deal stages, lead statuses, sources |
| `format.ts` | Date/currency formatting helpers |
| `confirm-action.ts` | `confirmAction()` — use instead of `window.confirm()` |
| `activity-logger.ts` | `logActivity()` — call after create/update/delete in API routes |
| `i18n/context.tsx` | `useTranslation()` hook, `I18nProvider` |
| `db.ts` | Prisma client singleton (used by NextAuth routes) |

## UI components

All reusable UI is in `client/src/shared/ui/`. Import from there, not from `@radix-ui` or other libs directly.

Layout components: `client/src/shared/layout/` — `AppShell`, `PageHeader`, `Container`, `Section`, `AuthLayout`.

Global app-level widgets (always mounted): `SearchPalette`, `QuickCreateFab`, `HelperChat` — registered in `app/providers.tsx`. Do not add new always-on widgets outside `providers.tsx`.

## Design system

- Corporate colors: `#073B34` (deep teal) + `#CEFD56` (bright lime) — used for gradients and accents
- Never hardcode color values; always use CSS variable tokens (`bg-primary`, `text-muted-foreground`, etc.)
- Cards: `rounded-2xl`, page headers: gradient badge `from-[#073B34] to-emerald-800`
- Toasts: use `toast` from `sonner`, not `react-hot-toast`
- Fonts: DM Sans (`font-sans`), Plus Jakarta Sans (`font-display`), JetBrains Mono (`font-mono`)

## Auth & roles

Three roles: `admin`, `director`, `agent`. Agents see only their own leads/deals/tasks (enforced via `ownershipFilter()` on the server). `middleware.ts` enforces per-user section permissions for agents.

Test user: `john@doe.com` / `johndoe123` (admin role).

## Server architecture

`server/src/modules/` contains 20 bounded-context modules:

`iam`, `account-management`, `lead-management`, `sales-pipeline`, `property-catalog`, `task-management`, `calendar`, `communication`, `reporting`, `analytics`, `automation`, `template-management`, `knowledge-base`, `activity-audit`, `notification-center`, `assistant`, `reference-data`, `currency`, `file-storage`, `customer-success`

Each module has: `controllers/`, `services/`, `repositories/`, and a public `index.ts`. Modules communicate only through their `index.ts` — never import internal files from another module.

HTTP routes are mounted in `presentation/http/routes.ts`. Auth middleware is applied centrally there.

## i18n

Three locales: `uk` (default), `en`, `ru`. All ~300+ translation keys are in `client/src/shared/lib/i18n/translations.ts`. Use `useTranslation()` hook in components; never hardcode Ukrainian/English strings in UI.
