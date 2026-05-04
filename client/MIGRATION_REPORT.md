# MIGRATION_REPORT.md

## Scope
Phase 1 completed for **client-side FSD restructuring** of the Next.js CRM into a new `client/` workspace at:

`/home/ubuntu/crm-analysis/crm-for-rieltors/client`

Backend/API implementation was not refactored (Phase 2 deferred), but runtime compatibility for current UI routes was preserved.

---

## New Client Structure

```text
client/
├── app/                        # Next.js App Router (routing-only)
├── src/
│   ├── app/                    # providers + app-level styles
│   ├── page-compositions/      # page compositions (aliased as @/pages/*)
│   ├── pages/                  # layer placeholder/readme (see note below)
│   ├── widgets/
│   ├── features/
│   ├── entities/
│   └── shared/
├── prisma/
└── MIGRATION_REPORT.md
```

> Note: due to Next.js App Router conflict with physical `src/pages/*`, page composition code is placed in `src/page-compositions/*` and mapped via TS alias `@/pages/*`.

---

## What Was Moved Where

### 1) App Router (routing-only)
- Route files kept in `app/`:
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/(auth)/**/page.tsx`
  - `app/(dashboard)/**/page.tsx`
  - `app/(dashboard)/layout.tsx`
- Route files now only delegate to page composition/public APIs.
- Old colocated `_components` under `app/**` were removed from routing layer.

### 2) Shared Layer
- `components/ui/*` → `src/shared/ui/*`
- `lib/*` → `src/shared/lib/*`
- New API client:
  - `src/shared/api/client.ts`
  - `src/shared/api/index.ts`
- Shared public APIs created:
  - `src/shared/ui/index.ts`
  - `src/shared/lib/index.ts`
  - `src/shared/api/index.ts`

### 3) App Layer (inside src)
- Providers extracted to:
  - `src/app/providers/providers.tsx`
  - `src/app/providers/auth-provider.tsx`
  - `src/app/providers/query-provider.tsx`
  - `src/app/providers/theme-app-provider.tsx`
  - `src/app/providers/theme-provider.tsx`
  - `src/app/providers/chunk-load-error-handler.tsx`
  - `src/app/providers/index.ts`
- Global styles moved:
  - `app/globals.css` → `src/app/styles/globals.css`

### 4) Features Layer
Created/organized slices:
- `src/features/auth/*`
- `src/features/lead-create/*`
- `src/features/lead-edit/*`
- `src/features/lead-delete/*`
- `src/features/deal-create/*`
- `src/features/deal-edit/*`
- `src/features/deal-delete/*`
- `src/features/property-create/*`
- `src/features/property-edit/*`
- `src/features/property-delete/*`
- `src/features/task-create/*`
- `src/features/task-edit/*`
- `src/features/task-delete/*`

Each has/uses `index.ts` public API.

### 5) Entities Layer
Created/organized slices:
- `src/entities/lead/*`
- `src/entities/deal/*`
- `src/entities/property/*`
- `src/entities/task/*`
- `src/entities/event/*`
- `src/entities/user/*`

Entity `model/types.ts` and `index.ts` public API files added.

### 6) Widgets Layer
Moved composed UI blocks to widgets:
- layout widgets (`sidebar`, wrappers, shell, etc.) in `src/widgets/layout/*`
- dashboard widgets in `src/widgets/dashboard/*`
- Added public APIs (index files) for widget access.

### 7) Pages Layer
- Page composition implementations moved to:
  - `src/page-compositions/*`
- Alias set in `tsconfig.json`:
  - `@/pages/*` → `src/page-compositions/*`
- App routes import these compositions via `@/pages/...`.

---

## Public API / Import Policy

Implemented:
- Slice-level `index.ts` public APIs for entities/features/widgets/pages.
- Cross-layer imports updated away from old `@/components/*`, `@/lib/*`, `@/hooks/*` to FSD paths.
- Direct cross-slice imports to `/ui`, `/model`, `/api` were removed in favor of index exports.

---

## Config Updates

### `tsconfig.json`
- `baseUrl` set to `.`
- path aliases:
  - `@/pages/*` → `./src/page-compositions/*`
  - `@/*` → `./src/*`

### `tailwind.config.ts`
- content globs updated for new structure:
  - `./app/**/*`
  - `./src/**/*`

### `components.json`
- updated shadcn css/aliases to new FSD paths.

---

## Validation

Build check performed:

```bash
cd /home/ubuntu/crm-analysis/crm-for-rieltors/client
npm run build
```

Result: ✅ build successful.

---

## Decisions / Issues

1. **Next.js `src/pages` conflict with App Router**
   - Physical `src/pages/*` causes app/page route conflicts in Next.js.
   - Decision: keep FSD semantic access via alias `@/pages/*`, with implementation in `src/page-compositions/*`.

2. **Toaster export conflict (`sonner` vs custom toaster)**
   - Conflict in shared barrel resolved by keeping non-conflicting exports.

3. **File size target (~100 lines)**
   - Many migrated legacy screens and shadcn components exceed 100 lines.
   - Structural migration done first; further decomposition into smaller units remains as a follow-up refactor pass.

4. **Prisma client generation path**
   - Prisma schema had absolute output path from source project.
   - Normalized and regenerated client in local `client/node_modules/@prisma/client` for build stability.

---

## Phase 1 Completion Status

- [x] Created `client/` with FSD-oriented layering
- [x] Moved routing to `app/` wrappers only
- [x] Migrated shared/ui and shared/lib
- [x] Created shared API client
- [x] Extracted feature/entity slices and public APIs
- [x] Added app providers in `src/app/providers`
- [x] Updated imports and aliases
- [x] Build passes
- [x] Migration report created
