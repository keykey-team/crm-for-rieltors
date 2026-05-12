# 🏠 KeyKey CRM — Повна архітектура системи
## Технічне завдання / Документація

---

## 1. ЗАГАЛЬНИЙ ОПИС

**Назва:** KeyKey CRM
**Призначення:** CRM-система для рієлторів та агентств нерухомості
**Мови інтерфейсу:** Українська (за замовчуванням), Англійська, Російська
**Корпоративні кольори:** `#073B34` (глибокий тіл) + `#CEFD56` (яскравий лайм)
**Теми:** Світла / Темна / Системна

---

## 2. РОЛІ ТА ПРАВА ДОСТУПУ

| Роль       | Опис                        | Права                                                       |
|------------|-----------------------------|------------------------------------------------------------|
| `admin`    | Адміністратор               | Повний доступ. Управління користувачами, налаштуваннями, воронкою |
| `director` | Директор / Керівник відділу  | Перегляд та управління всіма лідами/угодами. Аналітика      |
| `agent`    | Агент                       | Базові операції. Бачить лише свої ліди/угоди                |

**Автентифікація:** Email + пароль (NextAuth.js / Credentials)

---

## 3. СТРУКТУРА СТОРІНОК (НАВІГАЦІЯ)

### 3.1 Основні (для всіх ролей)
| Сторінка     | URL          | Опис                                              |
|-------------|--------------|---------------------------------------------------|
| Дашборд     | `/dashboard`  | Статистика, графіки, останні ліди, воронка         |
| Воронка     | `/deals`      | Kanban-дошка угод з drag-and-drop                  |
| Угода       | `/deals/[id]` | Деталі угоди: контакт, об'єкт, фінанси, коментарі |
| Ліди        | `/leads`      | Таблиця/Kanban лідів з фільтрами та масовими діями |
| Лід         | `/leads/[id]` | Деталі ліда, історія комунікацій                   |
| Об'єкти     | `/properties` | Список нерухомості з картками та швидким переглядом |
| Задачі      | `/tasks`      | Kanban задач (дзвінки, зустрічі, документи)        |
| Календар    | `/calendar`   | Місячний/тижневий вид подій з ICS-експортом         |
| Налаштування| `/settings`   | Профіль, користувачі, воронка, кастомні поля, довідники |

### 3.2 Інструменти (за планом/роллю)
| Сторінка     | URL             | Доступ      | Опис                                      |
|-------------|-----------------|-------------|------------------------------------------|
| Чат         | `/chat`          | feature     | Внутрішній месенджер з кімнатами та @-згадками |
| Аналітика   | `/analytics`     | director+   | Розширені графіки, конверсія, джерела      |
| Автоматизації| `/automations`  | director+   | Правила тригер → дія                       |
| Шаблони     | `/templates`     | feature     | Шаблони повідомлень зі змінними           |
| База знань  | `/knowledge-base`| feature     | Статті, скрипти, чек-лісти, юридичне       |
| Логи дій    | `/activity-log`  | director+   | Аудит всіх змін в системі                 |

### 3.3 Службові
| Сторінка      | URL            | Опис                           |
|--------------|----------------|-------------------------------|
| Можливості   | `/capabilities` | Опис функцій системи           |
| Тарифи       | `/pricing`      | Плани підписки                  |
| Логін        | `/login`        | Вхід в систему                  |
| Реєстрація   | `/signup`       | Створення акаунту               |

---

## 4. БАЗА ДАНИХ — МОДЕЛІ

### 4.1 User (Користувач)
```
id            String    PK, cuid
name          String?
email         String    unique
password      String    (bcrypt hash)
role          String    default("agent")     // admin | director | agent
accountType   String    default("agent")
plan          String    default("free")      // free | basic | pro | business
brandName     String?                        // назва компанії
brandLogo     String?                        // URL логотипу
primaryColor  String?                        // колір бренду
themeMode     String?   default("light")     // light | dark | system
sidebarGlass  Boolean?  default(false)       // скляний ефект сайдбару
sidebarOpacity Float?   default(1)
gradientBg    Boolean?  default(false)       // градієнтний фон
calendarToken String?                        // токен для ICS підписки
phone         String?
avatar        String?                        // URL аватарки
createdAt     DateTime
updatedAt     DateTime
```

### 4.2 Lead (Лід / Контакт)
```
id            String    PK, cuid
firstName     String
lastName      String?
email         String?
phone         String
source        String    default("manual")    // manual | telegram | instagram | olx | dom_ria | website | referral | other
status        String    default("new")       // new | active | warm | cold | lost
needType      String    default("buy")       // buy | rent | sell | invest
budget        Float?                         // мін. бюджет
budgetMax     Float?                         // макс. бюджет
districts     String?                        // бажані райони (через кому)
propertyType  String?                        // бажаний тип нерухомості
notes         String?
priority      String    default("medium")    // low | medium | high
assignedToId  String?   FK → User
createdAt     DateTime
updatedAt     DateTime
```
**Зв'язки:** → User (менеджер), → Deal[], → Task[], → Communication[]

### 4.3 Property (Об'єкт нерухомості)
```
id            String    PK, cuid
title         String                         // "2к квартира, вул. Хрещатик 10"
type          String    default("apartment") // apartment | house | commercial | land
address       String
district      String?
city          String    default("Киев")
rooms         Int?
area          Float?                         // площа м²
floor         Int?
totalFloors   Int?
price         Float
currency      String    default("USD")       // USD | UAH | EUR
status        String    default("active")    // active | sold | reserved | inactive
description   String?
createdAt     DateTime
updatedAt     DateTime
```
**Зв'язки:** → PropertyPhoto[], → PropertyUnit[], → Deal[]

### 4.4 PropertyPhoto (Фото об'єкту)
```
id                String    PK
propertyId        String    FK → Property
cloudStoragePath  String                     // шлях в хмарному сховищі
isPublic          Boolean   default(true)
order             Int       default(0)
```

### 4.5 Deal (Угода)
```
id            String    PK, cuid
title         String
stage         String    default("new_lead")  // динамічний, з FunnelStage
amount        Float?                         // сума угоди
commission    Float?                         // комісія у %
currency      String    default("USD")       // USD | UAH | EUR
leadId        String?   FK → Lead
propertyId    String?   FK → Property
assignedToId  String?   FK → User
notes         String?
meetingDate   DateTime?
showDate      DateTime?
depositDate   DateTime?
closeDate     DateTime?
createdAt     DateTime
updatedAt     DateTime
```
**Зв'язки:** → Lead, → Property, → User, → DealComment[], → DealChecklist[], → DealCustomFieldValue[]

### 4.6 DealComment (Коментар до угоди)
```
id            String    PK
dealId        String    FK → Deal (cascade delete)
authorId      String?   FK → User
text          String                         // підтримує @mention
createdAt     DateTime
```

### 4.7 DealChecklist (Чек-ліст угоди)
```
id            String    PK
dealId        String    FK → Deal (cascade delete)
title         String
completed     Boolean   default(false)
order         Int       default(0)
```

### 4.8 Task (Задача)
```
id            String    PK, cuid
title         String
description   String?
type          String    default("call")      // call | message | meeting | showing | documents | other
priority      String    default("medium")    // low | medium | high
status        String    default("pending")   // pending | in_progress | done
dueDate       DateTime?
completedAt   DateTime?
leadId        String?   FK → Lead
assignedToId  String?   FK → User
createdAt     DateTime
updatedAt     DateTime
```

### 4.9 Event (Подія в календарі)
```
id            String    PK, cuid
title         String
description   String?
type          String    default("meeting")   // meeting | showing | call | other
startDate     DateTime
endDate       DateTime?
allDay        Boolean   default(false)
userId        String?   FK → User
```

### 4.10 KnowledgeArticle (Стаття бази знань)
```
id            String    PK
title         String
content       String                         // markdown / HTML
category      String    default("general")   // general | scripts | checklists | templates | legal | marketing
authorId      String?   FK → User
published     Boolean   default(true)
```

### 4.11 Automation (Автоматизація)
```
id            String    PK
name          String
description   String?
trigger       String                         // тип тригера (stage_change, lead_created, etc.)
triggerValue  String?                        // значення тригера
action        String                         // тип дії (assign, notify, create_task, etc.)
actionValue   String?                        // значення дії
isActive      Boolean   default(true)
lastRunAt     DateTime?
lastRunResult String?
createdById   String?   FK → User
```

### 4.12 Template (Шаблон повідомлень)
```
id            String    PK
name          String
type          String    default("message")   // message | email | sms
category      String    default("general")
content       String                         // текст із {{змінними}}
variables     String?                        // JSON список змінних
createdById   String?   FK → User
```

### 4.13 FunnelStage (Етап воронки — динамічний)
```
id            String    PK
value         String    unique               // slug: "new_lead", "contacted" ...
label         String                         // "Новий лід"
color         String    default("#60B5FF")   // HEX колір
order         Int       default(0)
isDefault     Boolean   default(false)       // чи є етап за замовчуванням
isActive      Boolean   default(true)
```
**Захищені етапи** (не можна видалити): `new_lead`, `closed`, `cancelled`, `rejected`

### 4.14 DealCustomField (Кастомне поле угоди)
```
id            String    PK
name          String                         // machine_name
label         String                         // відображуване ім'я
fieldType     String    default("text")      // text | number | date | select | boolean
options       String?                        // варіанти для select (через кому)
required      Boolean   default(false)
order         Int       default(0)
isActive      Boolean   default(true)
```

### 4.15 DealCustomFieldValue
```
dealId        String    FK → Deal
fieldId       String    FK → DealCustomField
value         String
unique(dealId, fieldId)
```

### 4.16 Communication (Історія комунікацій ліда)
```
id            String    PK
leadId        String    FK → Lead (cascade delete)
type          String    default("note")      // note | call | email | sms | meeting
direction     String?                        // incoming | outgoing
content       String
userId        String?   FK → User
```

### 4.17 ActivityLog (Лог дій — аудит)
```
id            String    PK
entityType    String                         // Lead | Deal | Property | Task ...
entityId      String
action        String                         // created | updated | deleted | stage_changed ...
details       String?                        // JSON з деталями зміни
userId        String?   FK → User
createdAt     DateTime
```

### 4.18 PropertyUnit (Квартирографія / Шахматка)
```
id            String    PK
propertyId    String    FK → Property (cascade delete)
unitNumber    String                         // "А-101", "Б-305"
floor         Int
section       Int       default(1)           // секція/під'їзд
rooms         Int?
area          Float?
price         Float?
status        String    default("available") // available | reserved | sold | unavailable
dealId        String?
unique(propertyId, unitNumber)
```

### 4.19 AftercarePlan (Aftercare план)
```
id            String    PK
name          String
description   String?
order         Int
isActive      Boolean   default(true)
```

### 4.20 AftercareStep (Крок aftercare)
```
id            String    PK
planId        String    FK → AftercarePlan (cascade delete)
dayOffset     Int                            // через скільки днів
type          String    default("message")   // message | call | gift
title         String
content       String?
order         Int
```

### 4.21 Dictionary (Довідник)
```
id            String    PK
category      String                         // district | property_type | lead_source ...
value         String                         // slug
label         String                         // відображуване
order         Int
isActive      Boolean   default(true)
unique(category, value)
```

### 4.22 ChatMessage / ChatRoom / ChatRoomMember / ChatMention (Чат)
```
ChatRoom:
  id, name?, type (direct|group), createdById

ChatRoomMember:
  roomId FK → ChatRoom, userId FK → User, lastReadAt
  unique(roomId, userId)

ChatMessage:
  id, senderId FK → User, receiverId FK → User
  text, isRead, roomId? FK → ChatRoom
  threadId? FK → ChatMessage (відповіді в тредах)

ChatMention:
  messageId FK → ChatMessage, userId FK → User
```

### 4.23 LeadDistributionRule (Правила розподілу лідів)
```
id            String    PK
name          String
source        String?                        // фільтр по джерелу
district      String?                        // фільтр по району
propertyType  String?                        // фільтр по типу нерухомості
needType      String?                        // фільтр по типу потреби
assignToId    String    FK → User            // кому призначити
priority      Int       default(0)
isActive      Boolean   default(true)
```

---

## 5. API ЕНДПОІНТИ

### 5.1 Аутентифікація
| Метод | URL                      | Опис                    |
|-------|--------------------------|-------------------------|
| POST  | `/api/signup`            | Реєстрація нового користувача |
| POST  | `/api/auth/login`        | Логін                   |
| *     | `/api/auth/[...nextauth]`| NextAuth сесії          |

### 5.2 Ліди (Leads)
| Метод  | URL                           | Опис                         |
|--------|-------------------------------|------------------------------|
| GET    | `/api/leads`                  | Список лідів (з фільтрами: search, status, source, managerId) |
| POST   | `/api/leads`                  | Створити ліда                |
| GET    | `/api/leads/[id]`             | Деталі ліда                  |
| PUT    | `/api/leads/[id]`             | Оновити ліда (status, source, assignedToId, ...) |
| DELETE | `/api/leads/[id]`             | Видалити ліда                |
| POST   | `/api/leads/[id]/create-deal` | Створити угоду з ліда        |
| POST   | `/api/leads/bulk`             | Масові дії (зміна статусу, менеджера, видалення) |
| POST   | `/api/leads/import`           | Імпорт лідів з Excel         |

### 5.3 Угоди (Deals)
| Метод  | URL                                | Опис                         |
|--------|-------------------------------------|------------------------------|
| GET    | `/api/deals`                       | Список угод                   |
| POST   | `/api/deals`                       | Створити угоду                |
| GET    | `/api/deals/[id]`                  | Деталі угоди (з лідом, об'єктом, логами) |
| PUT    | `/api/deals/[id]`                  | Оновити угоду (stage, amount, commission, currency, notes...) |
| DELETE | `/api/deals/[id]`                  | Видалити угоду                |
| GET    | `/api/deals/[id]/comments`         | Коментарі угоди               |
| POST   | `/api/deals/[id]/comments`         | Додати коментар (з @mention)  |
| GET    | `/api/deals/[id]/checklist`        | Чек-ліст угоди                |
| POST   | `/api/deals/[id]/checklist`        | Додати/оновити пункт чек-лісту |
| GET    | `/api/deals/custom-field-values`   | Значення кастомних полів       |
| POST   | `/api/deals/custom-field-values`   | Зберегти кастомне поле         |

### 5.4 Об'єкти (Properties)
| Метод  | URL                     | Опис                           |
|--------|-------------------------|--------------------------------|
| GET    | `/api/properties`       | Список об'єктів (з фільтрами)  |
| POST   | `/api/properties`       | Створити об'єкт                |
| GET    | `/api/properties/[id]`  | Деталі об'єкту                 |
| PUT    | `/api/properties/[id]`  | Оновити об'єкт                 |
| DELETE | `/api/properties/[id]`  | Видалити об'єкт                |
| *      | `/api/property-units`   | CRUD для шахматки (квартирографія) |

### 5.5 Задачі (Tasks)
| Метод  | URL                | Опис                    |
|--------|--------------------|-------------------------|
| GET    | `/api/tasks`       | Список задач            |
| POST   | `/api/tasks`       | Створити задачу         |
| PUT    | `/api/tasks/[id]`  | Оновити задачу          |
| DELETE | `/api/tasks/[id]`  | Видалити задачу         |

### 5.6 Календар (Events)
| Метод  | URL                     | Опис                      |
|--------|-------------------------|---------------------------|
| GET    | `/api/events`           | Список подій (за період)  |
| POST   | `/api/events`           | Створити подію            |
| PUT    | `/api/events/[id]`      | Оновити подію             |
| DELETE | `/api/events/[id]`      | Видалити подію            |
| GET    | `/api/calendar/ics`     | ICS-файл для підписки     |
| *      | `/api/calendar/token`   | Генерація/перевірка токену |

### 5.7 Чат
| Метод | URL                  | Опис                          |
|-------|----------------------|-------------------------------|
| GET   | `/api/chat`          | Повідомлення (query: roomId)  |
| POST  | `/api/chat`          | Надіслати повідомлення        |
| GET   | `/api/chat/rooms`    | Список кімнат                 |
| POST  | `/api/chat/rooms`    | Створити кімнату              |

### 5.8 Налаштування (Settings)
| Метод | URL                         | Опис                            |
|-------|-----------------------------|---------------------------------|
| GET   | `/api/settings/profile`     | Профіль поточного користувача   |
| PUT   | `/api/settings/profile`     | Оновити профіль                 |
| GET   | `/api/settings/brand`       | Налаштування бренду             |
| PUT   | `/api/settings/brand`       | Оновити бренд (лого, кольори, тема) |
| GET   | `/api/users`                | Список всіх користувачів        |
| POST  | `/api/users`                | Створити користувача (admin)    |
| PUT   | `/api/users/[id]`           | Оновити користувача             |
| DELETE| `/api/users/[id]`           | Видалити користувача            |
| *     | `/api/users/plan`           | Зміна тарифного плану           |

### 5.9 Системні
| Метод | URL                         | Опис                            |
|-------|-----------------------------|---------------------------------|
| GET   | `/api/funnel-stages`        | Етапи воронки                   |
| PUT   | `/api/funnel-stages`        | Оновити етапи                   |
| GET   | `/api/deal-custom-fields`   | Кастомні поля угод              |
| POST  | `/api/deal-custom-fields`   | CRUD кастомних полів            |
| GET   | `/api/dictionaries`         | Довідники                       |
| POST  | `/api/dictionaries`         | CRUD довідників                 |
| GET   | `/api/exchange-rate`        | Курс НБУ (USD/UAH, кеш 1 год) |
| GET   | `/api/dashboard/stats`      | Статистика для дашборду         |
| GET   | `/api/analytics/extended`   | Розширена аналітика             |
| GET   | `/api/activity-log`         | Лог дій                        |
| GET   | `/api/search`               | Глобальний пошук (ліди, угоди, об'єкти) |
| *     | `/api/notifications`        | Сповіщення                     |
| *     | `/api/communications`       | Історія комунікацій ліда        |
| *     | `/api/lead-distribution`    | Правила авто-розподілу лідів    |
| *     | `/api/aftercare-plans`      | CRUD aftercare планів           |
| *     | `/api/automations`          | CRUD автоматизацій              |
| *     | `/api/automations/execute`  | Запуск автоматизації            |
| *     | `/api/templates`            | CRUD шаблонів повідомлень       |
| *     | `/api/knowledge-base`       | CRUD статей бази знань          |
| POST  | `/api/upload/presigned`     | Отримати presigned URL для завантаження файлів |
| GET   | `/api/files`                | Список файлів                   |

---

## 6. ДОВІДНИКИ (КОНСТАНТИ)

### 6.1 Етапи воронки (DEAL_STAGES)
| Slug               | Назва (UK)          | Колір    | Група    |
|--------------------|---------------------|----------|----------|
| `new_lead`         | Новий лід           | #5AC8FA  | incoming |
| `contacted`        | Контакт встановлено | #34C759  | active   |
| `meeting_scheduled`| Зустріч призначено  | #AF52DE  | active   |
| `meeting_done`     | Зустріч проведено   | #30D158  | active   |
| `showing`          | Покази              | #FF9F0A  | active   |
| `negotiation`      | Переговори          | #FF6482  | closing  |
| `deposit`          | Завдаток            | #FF453A  | closing  |
| `documents`        | Документи           | #FFD60A  | closing  |
| `closed`           | Угода завершена     | #30D158  | result   |
| `aftercare`        | Aftercare           | #64D2FF  | result   |
| `cancelled`        | Скасовано           | #8E8E93  | result   |
| `rejected`         | Відмова             | #FF453A  | result   |

### 6.2 Джерела лідів (LEAD_SOURCES)
`manual`, `telegram`, `instagram`, `olx`, `dom_ria`, `website`, `referral`, `other`

### 6.3 Статуси лідів (LEAD_STATUSES)
| Slug     | Назва     | Колір    |
|----------|-----------|----------|
| `new`    | Новий     | #60B5FF  |
| `active` | Активний  | #72BF78  |
| `warm`   | Теплий    | #FF9149  |
| `cold`   | Холодний  | #A19AD3  |
| `lost`   | Втрачений | #EF476F  |

### 6.4 Типи нерухомості
`apartment` (Квартира), `house` (Будинок), `commercial` (Комерція), `land` (Ділянка)

### 6.5 Статуси нерухомості
`active`, `sold`, `reserved`, `inactive`

### 6.6 Типи задач
`call`, `message`, `meeting`, `showing`, `documents`, `other`

### 6.7 Пріоритети
`low` (Низький), `medium` (Середній), `high` (Високий)

### 6.8 Категорії бази знань
`general`, `scripts`, `checklists`, `templates`, `legal`, `marketing`

---

## 7. КЛЮЧОВІ ФІЧІ

### 7.1 Воронка продажів (Kanban)
- Drag-and-drop картки угод між етапами
- Динамічні етапи (можна додавати/видаляти в налаштуваннях)
- Захищені етапи: new_lead, closed, cancelled, rejected
- Кольорове кодування етапів
- Суми по кожному етапу (з групуванням по валютах)
- Прив'язка ліда та об'єкту до угоди

### 7.2 Картка угоди
- **Етапи:** візуальне перемикання
- **Контакт:** пошук/вибір ліда, інлайн створення нового
- **Об'єкт:** пошук/вибір об'єкту, інлайн створення нового
- **Фінанси:** сума, комісія (%), валюта (USD/UAH/EUR), курс НБУ, конвертація
- **Коментарі:** з підтримкою @mention (кирилиця)
- **Чек-ліст:** пункти з чекбоксами
- **Історія:** автоматичний лог всіх змін
- **Кастомні поля:** text, number, date, select, boolean — налаштовуються в Settings

### 7.3 Управління лідами
- Таблиця + Kanban перемикач
- Інлайн зміна: статус, джерело, менеджер (дропдауни прямо в таблиці)
- Фільтри: статус, джерело, менеджер
- Пошук: по імені, телефону
- Масові дії: зміна статусу, призначення менеджера, видалення
- Імпорт з Excel (XLSX)
- Експорт в Excel
- Швидкі дії при наведенні: дзвінок, Telegram, переглянути, редагувати

### 7.4 Мультивалютність
- Підтримка USD, UAH, EUR
- Курс НБУ в реальному часі (API НБУ, кеш 1 год)
- Автоматична конвертація: сума та комісія
- Віджет курсу НБУ в налаштуваннях профілю

### 7.5 Налаштування (8 вкладок)
1. **Профіль** — ім'я, телефон, аватар, пароль, Telegram, курс НБУ
2. **Користувачі** — CRUD, ролі (admin only)
3. **Воронка** — додавання/видалення/переміщення етапів, кольори, drag-and-drop сортування
4. **Кастомні поля** — створення полів для угод (text/number/date/select/boolean)
5. **Довідники** — райони, типи нерухомості, джерела лідів
6. **Розподіл лідів** — правила автоматичного призначення менеджерів
7. **Aftercare** — плани пост-продажного обслуговування
8. **Брендинг** — тема (світла/темна/системна), лого, назва, кольори

### 7.6 Тарифні плани
| Фіча          | Free | Basic | Pro | Business |
|---------------|------|-------|-----|----------|
| Ліди/Угоди    | ✓    | ✓     | ✓   | ✓        |
| Команда       | —    | ✓     | ✓   | ✓        |
| Аналітика     | —    | —     | ✓   | ✓        |
| Чат           | —    | ✓     | ✓   | ✓        |
| Автоматизації | —    | —     | ✓   | ✓        |
| Шаблони       | —    | ✓     | ✓   | ✓        |
| База знань    | —    | —     | ✓   | ✓        |
| Aftercare     | —    | —     | —   | ✓        |
| Розподіл лідів| —    | —     | —   | ✓        |
| Брендинг      | —    | ✓     | ✓   | ✓        |
| Логи дій      | —    | —     | ✓   | ✓        |

### 7.7 Локалізація (i18n)
- 3 мови: uk, en, ru
- ~300+ ключів перекладу
- Переключатель мови в сайдбарі
- Всі константи, статуси, етапи мають переклади
- Формат дат та валют за локаллю

### 7.8 Дашборд
- 4 картки статистики (ліди, угоди, сума, конверсія)
- Графік воронки (BarChart)
- Останні ліди
- Швидкі дії

### 7.9 Додаткові модулі
- **Глобальний пошук** (⌘K) — по лідах, угодах, об'єктах
- **Сповіщення** (дзвіночок) — нові ліди, зміни угод
- **ICS-підписка** — синхронізація календаря з Google/Apple Calendar
- **Завантаження файлів** — presigned URL, хмарне сховище
- **Шахматка** — квартирографія ЖК (юніти, поверхи, секції)

---

## 8. СТЕК ТЕХНОЛОГІЙ (поточна реалізація)

| Компонент     | Технологія                          |
|--------------|-------------------------------------|
| Frontend     | React 18, Next.js 14 (App Router)   |
| Мова         | TypeScript                          |
| Стилі        | Tailwind CSS 3                      |
| UI компоненти| Кастомні (Apple-like дизайн)        |
| Графіки      | Recharts                            |
| ORM          | Prisma                              |
| БД           | PostgreSQL                          |
| Аутентифікація| NextAuth.js (Credentials)          |
| Стан         | React hooks (useState, useEffect, useMemo) |
| Іконки       | Lucide React                        |
| Toast        | Sonner                              |
| Шрифти       | DM Sans, Plus Jakarta Sans, JetBrains Mono |

---

## 9. ДИЗАЙН-СИСТЕМА

### Кольорова палітра
- **Primary:** `#073B34` (deep teal)
- **Accent:** `#CEFD56` (bright lime)
- **Фони:** `bg-card`, `bg-muted`, `bg-background` (CSS змінні)
- **Тексти:** `text-foreground`, `text-muted-foreground`
- **Borders:** `border-border/60 dark:border-border/40`

### Компоненти
- Картки з `rounded-2xl`, `shadow-sm`, легкий hover lift
- Кнопки з `rounded-xl`, стан `active:scale-95`
- Іконки в градієнтних бейджах `rounded-2xl`
- Вкладки з `rounded-xl`, підсвічування primary
- Модальні вікна з `rounded-2xl`, sticky header
- Таблиці з hover рядків, інлайн дропдаунами

---

*Документ створено: 07.05.2026*
*Версія CRM: KeyKey v1.0*
