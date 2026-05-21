# Realtor CRM — Полная документация (для PM и разработчиков)

Актуальность: составлено по коду репозитория на 2026-05-20.

## 1) Обзор продукта (PM)

CRM ориентирована на риелторов и агентства недвижимости. Основной контур: лиды -> сделки -> задачи/календарь -> аналитика и операционные инструменты.

Ключевые разделы продукта:
- `Dashboard` — сводные KPI, последние лиды, воронка, задачи.
- `Leads` — список, фильтры, массовые операции, импорт.
- `Deals` — воронка и карточка сделки (комментарии, чеклист, поля).
- `Properties` — база объектов, включая юниты (`PropertyUnit` / шахматка).
- `Tasks` — постановка и трекинг задач.
- `Calendar` — события + ICS-подписка.
- `Settings` — профиль, бренд, пользователи, справочники, этапы воронки, правила распределения.
- `Tools` — чат, шаблоны, база знаний, автоматизации, логи действий, helper/assistant.

Поддерживаемые роли:
- `admin` — полный доступ.
- `director` — расширенный доступ (в т.ч. аналитика/админ-функции).
- `agent` — ограниченный доступ по назначению и/или кастомным permission.

Плановые ограничения функций (feature-gating):
- `free`: базовый набор + helper.
- `pro`: analytics, automations, templates, knowledge base, activity log, branding и др.
- `business`: все из `pro` + chat/team/distribution/aftercare.

## 2) Основные бизнес-процессы (PM)

1. Работа с лидами
- Создание лида вручную или импортом.
- Автораспределение по `LeadDistributionRule` (если пользователь не назначен явно).
- Массовые действия: смена статуса, назначение менеджера, удаление.
- Из лида можно создать сделку (`POST /leads/:id/create-deal`).

2. Воронка сделок
- Сделка содержит этап, сумму, комиссию, связанный лид/объект.
- В деталях доступны комментарии, чеклист и кастомные поля.
- Этапы воронки настраиваются в `Settings -> Funnel stages`.

3. Операционный контур
- Задачи с приоритетом/сроком, выборкой по статусам/типам.
- Календарные события + генерация токена и ICS-ссылки для внешнего календаря.
- Уведомления по просроченным задачам, активностям и новым лидам за день.

4. База знаний и шаблоны
- CRUD для шаблонов сообщений и статей базы знаний.
- Категоризация + публикация статей.

5. Командная и админ-работа
- Управление пользователями (admin/director).
- Настройки бренда (название, лого, цвет, визуальные параметры).
- Управление словарями, aftercare-планами, правилами распределения.

## 3) Ограничения доступа и безопасности (PM + Dev)

- Авторизация: `NextAuth` (frontend) + JWT cookie `crm_token` (backend).
- Middleware в клиенте ограничивает маршруты по role и `permissions`.
- На backend большая часть API под `authMiddleware` (cookie-based).
- Для `agent` действует ownership-фильтрация в ключевых сущностях (leads/deals/tasks/analytics и т.д.).

Важно: доступ к части CRUD проверяется только на frontend/ownership-логике конкретных endpoint’ов; централизованной RBAC-политики по всем маршрутам нет.

## 4) Технологический стек (Dev)

Frontend (`/client`):
- Next.js 14 (App Router), React 18, TypeScript.
- NextAuth (Credentials provider).
- Tailwind + Radix UI + shadcn-style компоненты.
- Recharts, date-fns, framer-motion.

Backend (`/server`):
- Express + TypeScript.
- Prisma + PostgreSQL.
- JWT cookie auth (`crm_token`), bcrypt.
- AWS S3 presigned upload/download.

Инфраструктурно:
- Frontend проксирует `/api/*` на `http://localhost:4000/api/*` через `next.config.js` rewrite.

## 5) Архитектура репозитория (Dev)

- `client/app` — маршруты и layout’ы Next.js.
- `client/src/entities/*` — API-клиенты и типы по доменным сущностям.
- `client/src/screens/*` — экранные контейнеры.
- `client/src/features/*` — пользовательские сценарии (create-lead, create-deal и т.д.).
- `client/src/widgets/*` — композиционные UI-блоки.
- `server/src/app` — bootstrapping Express.
- `server/src/modules/iam` — логин/сессия/регистрация.
- `server/src/modules/system` — основной бизнес-API.
- `server/prisma/schema.prisma` — модель данных.

## 6) Конфигурация окружения (Dev)

Backend обязательные переменные:
- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `PORT` (default `4000`)
- `CLIENT_URL` (default `http://localhost:3000`)
- `AWS_REGION` (default `us-east-1`)
- `AWS_BUCKET_NAME` (optional, но нужен для файлов)
- `AWS_FOLDER_PREFIX` (optional)

Frontend:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (для metadata и next-auth)
- `NEXT_PUBLIC_API_URL` (используется в login/signup запросах)
- `BACKEND_JWT_SECRET` или `JWT_SECRET` (для `/api/auth/crm-session`)

## 7) Локальный запуск (Dev)

1. Установить зависимости:
- `cd server && npm install`
- `cd client && npm install`

2. Backend:
- Настроить `DATABASE_URL`, `JWT_SECRET`.
- `npm run prisma:generate`
- применить миграции (в репозитории не вижу явного каталога миграций — проверить состояние БД отдельно).
- `npm run dev` (порт `4000`).

3. Frontend:
- Настроить `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- `npm run dev` (порт `3000`).

## 8) Модель данных (Dev)

Ключевые сущности:
- `User`, `Lead`, `Deal`, `Property`, `PropertyPhoto`, `PropertyUnit`, `Task`, `Event`.
- `FunnelStage`, `DealCustomField`, `DealCustomFieldValue`.
- `Template`, `KnowledgeArticle`, `Automation`, `ActivityLog`, `Communication`.
- `LeadDistributionRule`, `AftercarePlan`, `AftercareStep`, `Dictionary`.
- `ChatRoom`, `ChatRoomMember`, `ChatMessage`, `ChatMention`, `HelperMessage`.

Особенности:
- Во многих таблицах есть индексы по operational-полям (`status`, `createdAt`, `assignedToId`).
- Для `DealCustomFieldValue` и `ChatRoomMember` используются составные уникальные ключи.
- Для части связей настроен `onDelete: Cascade`.

## 9) API-контракт (Dev, high-level)

IAM:
- `POST /api/iam/login`
- `POST /api/iam/signup`
- `GET /api/iam/session`
- `POST /api/iam/logout`

Core:
- Users, profile, brand, plan, permissions.
- Leads (CRUD, bulk, import, create-deal).
- Deals (CRUD, comments, checklist, custom fields).
- Properties + Property Units.
- Tasks.
- Events + calendar token + ICS feed.
- Analytics + dashboard stats.
- Templates, knowledge-base, automations.
- Dictionaries, funnel stages, aftercare plans, lead distribution.
- Notifications, global search, helper/assistant.
- Files (`/files`, `/upload/presigned`).

Практически все core-эндпоинты определены в `server/src/modules/system/routes.ts`.

## 10) Известные технические риски и расхождения (важно)

1. Несогласованность chat API (критично):
- Frontend (`client/src/entities/chat/api/chat.api.ts`) работает с `roomId`, `threadId`, `action: createRoom`.
- Backend `GET/POST /api/chat` реализован как direct chat через `userId/receiverId`, а create room там не поддержан.
- При этом есть `PUT/DELETE /api/chat/rooms`, но нет `POST /api/chat/rooms`.

2. Проверки прав неоднородны:
- Часть endpoint’ов строго учитывает ownership/role.
- Часть админских/операционных endpoint’ов полагается на frontend-ограничения.

3. Отсутствует тестовый контур:
- В репозитории фактически нет unit/integration/e2e тестов.

4. Exchange-rate endpoint зависит от внешнего NBU API:
- Есть кэш на 1 час и graceful fallback на stale данные, но при холодном старте без сети вернет 500.

5. Лимиты и пагинация:
- В ряде endpoint используются фиксированные `take` (200/300/500), но нет универсальной пагинации.

## 11) Что важно PM при планировании roadmap

- Приоритет №1: унификация chat domain (rooms/threads/direct) и контрактов FE/BE.
- Приоритет №2: единая серверная RBAC/ABAC политика вместо распределенных проверок.
- Приоритет №3: тестовое покрытие критических flows:
  - auth/session
  - lead -> deal
  - bulk operations
  - calendar token/ics
  - settings (funnel/custom fields/distribution)
- Приоритет №4: унифицированная пагинация и фильтры для больших объемов данных.

## 12) Ключевые файлы для onboarding разработчика

- Backend bootstrap:
  - `server/src/app/server.ts`
  - `server/src/app/routes.ts`
  - `server/src/modules/iam/routes.ts`
  - `server/src/modules/system/routes.ts`
  - `server/prisma/schema.prisma`

- Frontend bootstrap:
  - `client/app/layout.tsx`
  - `client/app/(dashboard)/layout.tsx`
  - `client/src/shared/lib/auth.ts`
  - `client/middleware.ts`
  - `client/src/shared/layout/sidebar.tsx`

---

Если использовать этот файл как “single source of truth”, рекомендую обновлять его после каждого релиза, где меняются:
- Prisma schema,
- маршруты `system/routes.ts`,
- role/plan/permissions логика.