# Multi-tenant (Agency)

## Архітектура
- Додано `Agency` та `AgencyMembership` (many-to-many між `User` та `Agency`).
- Усі agency-scoped доменні сутності мають обов'язковий `agencyId`.
- У `User` додано `lastAgencyId` для UX-перемикання.

## Tenant scope
- `agencyMiddleware` визначає активне агентство з `X-Agency-Id` або `user.lastAgencyId`.
- Перевіряється активне membership користувача в агентстві.
- Prisma middleware автоматично додає `where.agencyId` та `agencyId` у create/upsert для scoped-моделей.

## Перемикання агентства
- `POST /agencies/:id/switch` оновлює `user.lastAgencyId`.
- Клієнт зберігає поточне агентство в `localStorage` (`crm_current_agency_id`) та додає `X-Agency-Id` до API-запитів.

## Міграція
1. Застосувати Prisma migration `add_agency_multi_tenant`.
2. Запустити data migration:
   ```bash
   cd server
   npm run migrate:multi-tenant
   ```
3. Застосувати migration `agency_scope_not_null`.
