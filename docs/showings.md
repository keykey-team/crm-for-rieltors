# Showings

## Модель

`Showing` зберігає історію показів обʼєктів клієнтам:

- зв’язки: `dealId`, `propertyId`, `leadId`, `agentId`
- планування: `scheduledAt`, `durationMin`
- статуси: `scheduled`, `completed`, `cancelled`, `no_show`
- результат: `feedback`, `clientRating`, `agentNotes`

`Deal.showDate` залишено для зворотної сумісності.

## API

- `GET /api/showings` — список з фільтрами `dealId`, `propertyId`, `leadId`, `agentId`, `status`, `from`, `to`, `page`, `limit`
- `GET /api/showings/:id` — один показ
- `POST /api/showings` — створення
- `PATCH /api/showings/:id` — оновлення
- `DELETE /api/showings/:id` — видалення
- `GET /api/showings/duplicates?propertyId=&leadId=` — попередні покази для антидубля

## Бізнес-правила

- Дозволені переходи статусів: `scheduled → completed | cancelled | no_show`
- `clientRating` дозволено лише для `completed`
- Для `agent` доступ обмежений власними показами (`agentId = поточний користувач`)
- Для `admin/director` доступ до всіх показів
- При створенні `scheduled` показу може створюватися подія в календарі (`Event`, type=`showing`)
- В `ActivityLog` пишуться записи `create`, `update`, `status_change`, `delete` для `entityType = showing`
