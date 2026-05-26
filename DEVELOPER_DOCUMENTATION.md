# 🔧 KeyKey CRM — Документація для Розробників

## Зміст
1. [Установка та запуск](#установка-та-запуск)
2. [Архітектура системи](#архітектура-системи)
3. [Стек технологій](#стек-технологій)
4. [Структура проекту](#структура-проекту)
5. [База даних](#база-даних)
6. [API Endpoint'и](#api-endpoints)
7. [Автентифікація](#автентифікація)
8. [Клієнтська архітектура](#клієнтська-архітектура)
9. [Серверна архітектура](#серверна-архітектура)
10. [Гайди з розробки](#гайди-з-розробки)
11. [Інструменти розробника](#інструменти-розробника)
12. [Деплоймент](#деплоймент)

---

## Установка та запуск

### Вимоги
- **Node.js** 18.x або вище
- **PostgreSQL** 14.x або вище
- **npm** або **yarn**
- **Docker** (опціонально, для локальної бази даних)

### Кроки установки

```bash
# 1. Клонування репозиторію
git clone <repo-url>
cd realtor_crm

# 2. Установка залежностей
cd client && npm install
cd ../server && npm install

# 3. Налаштування змінних середовища
# Скопіюйте .env.example в .env і заповніть значення
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Ініціалізація бази даних
cd server
npx prisma generate
npx prisma migrate dev

# 5. Запуск розвиваючих серверів
# Терміналу 1: Клієнт
cd client && npm run dev

# Терміналу 2: Сервер
cd server && npm run dev
```

### Необхідні змінні середовища

**server/.env**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"
JWT_SECRET="your-secret-key-here"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="bucket-name"
AWS_REGION="eu-central-1"
NODE_ENV="development"
```

**client/.env.local**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

---

## Архітектура системи

### Загальна схема

```
┌─────────────────────────────────────────────────────────────┐
│                    Клієнтський браузер                       │
│                  (Next.js 14 + React 18)                     │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes & Pages                      │
│     (Middleware, Authentication, SSR/SSG)                    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Express.js Backend Server                         │
│     (Routes, Controllers, Business Logic)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌────────┐ ┌──────────┐ ┌──────────┐
    │PostgreSQL│ │AWS S3   │ │JWT Auth  │
    │ Database  │ │Storage  │ │Service   │
    └──────────┘ └────────┘ └─────────┘
```

### Архітектурні принципи

1. **Розділення точок відповідальності**
   - Client: UI, forms, state management
   - Server: Business logic, database, security
   - API: Contract between client and server

2. **Автентифікація та авторизація**
   - NextAuth.js для управління сесіями
   - JWT токени для API запитів
   - Role-based access control (RBAC)

3. **Управління даними**
   - Prisma ORM для безпечної роботи з БД
   - Type-safe database queries
   - Automatic migrations

---

## Стек технологій

### Frontend
| Технологія | Версія | Використання |
|-----------|--------|--------------|
| **Next.js** | 14.2.28 | Framework для React |
| **React** | 18.2.0 | UI бібліотека |
| **TypeScript** | 5.2.2 | Type safety |
| **Tailwind CSS** | 3.3.3 | CSS framework |
| **Radix UI** | Latest | Headless UI компоненти |
| **React Hook Form** | 7.53.0 | Form management |
| **NextAuth.js** | 4.24.11 | Authentication |
| **Recharts** | 2.15.3 | Data visualization |
| **Framer Motion** | 10.18.0 | Animations |
| **date-fns** | 3.6.0 | Date utilities |

### Backend
| Технологія | Версія | Використання |
|-----------|--------|--------------|
| **Express.js** | 4.19.2 | Web framework |
| **TypeScript** | 5.5.3 | Type safety |
| **Prisma** | 6.7.0 | ORM |
| **PostgreSQL** | 14+ | Database |
| **JWT** | 9.0.2 | Token auth |
| **bcryptjs** | 2.4.3 | Password hashing |
| **AWS SDK** | 3.0.0 | Cloud storage |

---

## Структура проекту

```
realtor_crm/
├── client/                           # Next.js frontend
│   ├── app/                         # Next.js app directory
│   │   ├── (auth)/                  # Auth pages (login, signup)
│   │   ├── (dashboard)/             # Protected dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── automations/
│   │   │   ├── calendar/
│   │   │   ├── chat/
│   │   │   ├── dashboard/
│   │   │   ├── deals/
│   │   │   ├── leads/
│   │   │   ├── properties/
│   │   │   ├── tasks/
│   │   │   ├── analytics/
│   │   │   ├── knowledge-base/
│   │   │   ├── settings/
│   │   │   └── activity-log/
│   │   ├── api/                     # API routes
│   │   │   ├── auth/
│   │   │   └── [...]
│   │   ├── globals.css
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── src/
│   │   ├── entities/               # Domain entities/data models
│   │   │   ├── account/
│   │   │   ├── lead/
│   │   │   ├── deal/
│   │   │   ├── property/
│   │   │   ├── task/
│   │   │   └── [...]
│   │   ├── features/                # Feature-specific logic
│   │   │   ├── create-lead/
│   │   │   ├── create-deal/
│   │   │   ├── sign-in/
│   │   │   └── [...]
│   │   ├── screens/                 # Full-page components
│   │   │   ├── leads/
│   │   │   ├── deals/
│   │   │   ├── dashboard/
│   │   │   └── [...]
│   │   ├── shared/                  # Shared utilities & hooks
│   │   │   ├── api/                # API client functions
│   │   │   ├── hooks/              # React hooks
│   │   │   ├── lib/                # Utilities
│   │   │   ├── ui/                 # Reusable UI components
│   │   │   └── widgets/            # Feature-agnostic widgets
│   │   ├── widgets/                 # Larger reusable blocks
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   └── [...]
│   │   └── types/                  # TypeScript types
│   ├── public/                       # Static files
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── middleware.ts
│
├── server/                           # Express backend
│   ├── src/
│   │   ├── app/
│   │   │   ├── server.ts            # Entry point
│   │   │   ├── routes.ts            # Route registry
│   │   │   └── config/              # Configuration
│   │   ├── common/
│   │   │   ├── errors/              # Error classes
│   │   │   ├── infrastructure/      # Database, cache, etc.
│   │   │   └── middleware/          # Express middleware
│   │   ├── modules/
│   │   │   ├── iam/                 # Identity & Access Mgmt
│   │   │   │   ├── routes.ts
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── types.ts
│   │   │   └── system/              # CRM-specific logic
│   │   │       ├── routes.ts
│   │   │       ├── controllers/
│   │   │       ├── services/
│   │   │       └── types.ts
│   │   └── utils/                   # Utility functions
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── CRM_ARCHITECTURE.md              # High-level architecture
└── DEVELOPER_DOCUMENTATION.md       # This file
```

---

## База даних

### Модель даних

#### User (Користувач)
```typescript
{
  id: string;              // CUID
  email: string;           // Unique
  password: string;        // Bcrypt hash
  name?: string;
  role: "admin" | "director" | "agent";
  phone?: string;
  avatar?: string;
  plan: "free" | "basic" | "pro" | "business";
  brandName?: string;
  primaryColor?: string;
  themeMode: "light" | "dark" | "system";
  calendarToken?: string;  // ICS subscription
  createdAt: Date;
  updatedAt: Date;
}
```

#### Lead (Лід/Контакт)
```typescript
{
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  source: "manual" | "telegram" | "instagram" | "olx" | "dom_ria" | "website" | "referral" | "other";
  status: "new" | "active" | "warm" | "cold" | "lost";
  needType: "buy" | "rent" | "sell" | "invest";
  budget?: number;
  budgetMax?: number;
  districts?: string;      // Comma-separated
  propertyType?: string;
  priority: "low" | "medium" | "high";
  assignedToId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Deal (Угода)
```typescript
{
  id: string;
  title: string;
  stage: string;           // FunnelStage.value
  amount?: number;
  commission?: number;     // Percentage
  currency: "USD" | "UAH" | "EUR";
  leadId?: string;
  propertyId?: string;
  assignedToId?: string;
  notes?: string;
  meetingDate?: Date;
  showDate?: Date;
  depositDate?: Date;
  closeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Property (Об'єкт нерухомості)
```typescript
{
  id: string;
  title: string;
  type: "apartment" | "house" | "commercial" | "land";
  address: string;
  district?: string;
  city: string;
  rooms?: number;
  area?: number;           // Square meters
  floor?: number;
  totalFloors?: number;
  price: number;
  currency: string;
  status: "active" | "sold" | "reserved" | "inactive";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Task (Задача)
```typescript
{
  id: string;
  title: string;
  description?: string;
  type: "call" | "message" | "meeting" | "showing" | "documents" | "other";
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "done";
  dueDate?: Date;
  completedAt?: Date;
  leadId?: string;
  assignedToId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Зв'язки між моделями

```
User
  ├─ 1:N ──> Lead (assignedTo)
  ├─ 1:N ──> Deal (assignedTo)
  ├─ 1:N ──> Task (assignedTo)
  ├─ 1:N ──> Event
  ├─ 1:N ──> KnowledgeArticle (author)
  ├─ 1:N ──> Template (creator)
  ├─ 1:N ──> Automation (creator)
  └─ 1:N ──> ChatMessage (sender/receiver)

Lead
  ├─ N:1 ──> User (assignedTo)
  ├─ 1:N ──> Deal
  ├─ 1:N ──> Task
  └─ 1:N ──> Communication

Deal
  ├─ N:1 ──> Lead
  ├─ N:1 ──> Property
  ├─ N:1 ──> User (assignedTo)
  ├─ 1:N ──> DealComment
  ├─ 1:N ──> DealChecklist
  └─ 1:N ──> DealCustomFieldValue

Property
  ├─ 1:N ──> PropertyPhoto
  ├─ 1:N ──> PropertyUnit
  └─ 1:N ──> Deal
```

### Міграції

```bash
# Створити нову міграцію
npx prisma migrate dev --name add_new_field

# Переглянути стан міграцій
npx prisma migrate status

# Скинути БД (тільки dev)
npx prisma migrate reset

# Регенерувати Prisma Client
npx prisma generate
```

---

## API Endpoints

### Базовий URL
```
http://localhost:4000/api
```

### Аутентифікація

#### POST `/auth/signup`
Реєстрація нового користувача
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe"
}
```

#### POST `/auth/signin`
Вхід у систему
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

#### POST `/auth/logout`
Вихід з системи (вимагає аутентифікації)

#### GET `/auth/me`
Отримати поточного користувача

### Ліди

#### GET `/leads`
Отримати список лідів
```
Query parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (optional)
  - assignedToId: string (optional)
  - search: string (optional)
```

#### GET `/leads/:id`
Отримати деталі ліда

#### POST `/leads`
Створити новий лід
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+38099123456",
  "email": "john@example.com",
  "source": "manual",
  "needType": "buy",
  "budget": 50000,
  "budgetMax": 150000
}
```

#### PATCH `/leads/:id`
Оновити лід

#### DELETE `/leads/:id`
Видалити лід

### Угоди

#### GET `/deals`
Отримати список угод
```
Query parameters:
  - stage: string (optional)
  - assignedToId: string (optional)
  - leadId: string (optional)
```

#### GET `/deals/:id`
Отримати деталі угоди

#### POST `/deals`
Створити нову угоду
```json
{
  "title": "Deal Title",
  "leadId": "lead-id",
  "propertyId": "property-id",
  "amount": 100000,
  "commission": 3
}
```

#### PATCH `/deals/:id`
Оновити угоду (наприклад, змінити stage)

#### PATCH `/deals/:id/stage`
Змінити stage угоди (для Kanban)

#### DELETE `/deals/:id`
Видалити угоду

### Об'єкти нерухомості

#### GET `/properties`
Отримати список об'єктів
```
Query parameters:
  - type: string
  - status: string
  - minPrice: number
  - maxPrice: number
```

#### GET `/properties/:id`
Отримати деталі об'єкту

#### POST `/properties`
Створити новий об'єкт

#### PATCH `/properties/:id`
Оновити об'єкт

#### DELETE `/properties/:id`
Видалити об'єкт

### Задачі

#### GET `/tasks`
Отримати список задач

#### GET `/tasks/:id`
Отримати деталі задачі

#### POST `/tasks`
Створити нову задачу

#### PATCH `/tasks/:id`
Оновити задачу

#### PATCH `/tasks/:id/complete`
Позначити задачу як виконану

#### DELETE `/tasks/:id`
Видалити задачу

---

## Автентифікація

### NextAuth.js (Клієнт)

```typescript
// middleware.ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*"
  ]
}
```

### JWT Токени (Сервер)

```typescript
// Генерація токену
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Верифікація
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Middleware на серверу

```typescript
// common/middleware/auth.ts
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

### Role-based Access Control (RBAC)

```typescript
const canAccessAnalytics = (role: string) => {
  return ['admin', 'director'].includes(role);
};

const canViewAllLeads = (role: string) => {
  return role !== 'agent'; // Агенти бачать тільки своє
};
```

---

## Клієнтська архітектура

### Структура компонентів

#### Entities
Data models та їх API calls
```typescript
// src/entities/lead/index.ts
export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  // ...
}

export const leadApi = {
  list: () => fetch('/api/leads'),
  get: (id) => fetch(`/api/leads/${id}`),
  create: (data) => fetch('/api/leads', { method: 'POST', body: JSON.stringify(data) }),
};
```

#### Features
Feature-specific logic та components
```typescript
// src/features/create-lead/
├── CreateLeadForm.tsx      // Форма
├── useCreateLead.ts        // Hook
└── types.ts
```

#### Screens
Full-page components
```typescript
// src/screens/leads/LeadsScreen.tsx
// Використовує компоненти з entities, features, widgets
```

#### Shared
Переиспользуемые утилиты и компоненты
```typescript
// src/shared/
├── api/         // API client functions
├── hooks/       // useForm, useAuth, etc.
├── lib/         // Utilities
├── ui/          // Button, Input, etc.
└── widgets/     // Larger reusable blocks
```

### Керування станом

1. **React Context** для глобального стану (auth, theme)
2. **React Hook Form** для форм
3. **Next.js Dynamic Routes** для параметрів
4. **React Query** або **SWR** для кешування (якщо додатиметься)

```typescript
// providers.tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
```

### Типи та типизація

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "admin" | "director" | "agent";
    };
  }
}
```

---

## Серверна архітектура

### Модульна структура

```typescript
// modules/system/routes.ts
import { Router } from 'express';
import * as leadController from './controllers/lead';

const router = Router();

router.get('/leads', authenticateToken, leadController.getLeads);
router.post('/leads', authenticateToken, leadController.createLead);

export { router as systemRoutes };
```

### Controllers

```typescript
// modules/system/controllers/lead.ts
export const getLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        assignedToId: req.user.role === 'agent' ? req.user.id : undefined,
      },
      include: {
        assignedTo: { select: { name: true, email: true } },
      },
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### Services

```typescript
// modules/system/services/lead.ts
export const createLeadService = async (data: CreateLeadInput) => {
  // Валідація
  if (!data.phone) throw new Error('Phone is required');
  
  // Бізнес-логіка
  const existingLead = await prisma.lead.findFirst({
    where: { phone: data.phone },
  });
  
  if (existingLead) {
    throw new Error('Lead with this phone already exists');
  }

  // Створення
  return prisma.lead.create({
    data: {
      firstName: data.firstName,
      phone: data.phone,
      // ...
    },
  });
};
```

### Error Handling

```typescript
// common/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## Гайди з розробки

### Додавання нового API Endpoint

1. **Створіть контролер**
```typescript
// server/src/modules/system/controllers/deal.ts
export const getDeals = async (req, res) => {
  // Implementation
};
```

2. **Зареєструйте маршрут**
```typescript
// server/src/modules/system/routes.ts
router.get('/deals', authenticateToken, dealController.getDeals);
```

3. **Створіть API клієнт на фронті**
```typescript
// client/src/entities/deal/api/index.ts
export const dealApi = {
  list: async () => {
    const res = await fetch('/api/deals');
    return res.json();
  }
};
```

4. **Використайте в компоненті**
```typescript
const [deals, setDeals] = useState([]);

useEffect(() => {
  dealApi.list().then(setDeals);
}, []);
```

### Додавання нового компонента в UI

1. **Використовуйте Radix UI та Tailwind**
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

2. **Слідуйте STYLE_GUIDE.md**
   - Используйте цветовые переменные
   - Используйте типографию правильно
   - Соблюдайте spacing scale

### Додавання нової сторінки в dashboards

```typescript
// client/app/(dashboard)/new-feature/page.tsx
import { NewFeatureScreen } from "@/screens/new-feature";

export default function Page() {
  return <NewFeatureScreen />;
}
```

### Робота з Prisma

```typescript
// Створити мокс для тестування
const mockUser = await prisma.user.create({
  data: {
    email: 'test@example.com',
    password: await bcrypt.hash('password', 10),
    name: 'Test User',
  },
});

// Запит з релаціями
const lead = await prisma.lead.findUnique({
  where: { id: leadId },
  include: {
    assignedTo: true,
    deals: {
      include: { property: true },
    },
  },
});

// Оновлення
await prisma.lead.update({
  where: { id: leadId },
  data: {
    status: 'warm',
    notes: 'Updated notes',
  },
});
```

---

## Інструменти розробника

### VS Code Extensions (рекомендовані)

- **Prisma** — syntax highlighting для schema.prisma
- **Thunder Client** або **REST Client** — тестування API
- **TypeScript Vue Plugin** — якщо буде Vue
- **Tailwind CSS IntelliSense** — автодоповнення Tailwind

### Налагодження

```typescript
// server/src/app/server.ts
import debug from 'debug';
const debugLog = debug('crm:server');

debugLog('Server started on port', process.env.PORT);
```

```bash
DEBUG=crm:* npm run dev
```

### Тестування API

```bash
# За допомогою curl
curl -X GET http://localhost:4000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN"

# За допомогою Thunder Client
# Створіть запит в Thunder Client і збережіть його
```

---

## Деплоймент

### Білди

```bash
# Frontend
cd client && npm run build

# Backend
cd server && npm run build
```

### Середовище production

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret"
NODE_ENV="production"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="prod-bucket"
NEXTAUTH_URL="https://crm.example.com"
```

### Docker (опціонально)

```dockerfile
# server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

```dockerfile
# client/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD ["node", "server.js"]
```

### Масштабування

- **Клієнт**: Deploy на Vercel (рекомендується для Next.js)
- **Сервер**: Deploy на Railway, Render, або власний VPS
- **База даних**: PostgreSQL hosted (AWS RDS, Supabase, Railway)
- **Сховище**: AWS S3 для фотографій об'єктів

---

## Корисні посилання

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/docs/primitives)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Розв'язування проблем

### Проблема: "Cannot find module"
**Рішення**: Переконайтеся, що виконали `npm install` обидва рази (client та server)

### Проблема: Database connection error
**Рішення**: Перевірте `DATABASE_URL` в `.env` та переконайтеся, що PostgreSQL запущена

### Проблема: CORS error
**Рішення**: Перевірте CORS middleware на серверу та `NEXT_PUBLIC_API_URL` на клієнті

### Проблема: TypeScript compilation error
**Рішення**: Запустіть `npm run build` для детальніших повідомлень про помилки

---

**Оновлено**: Травень 2026  
**Версія**: 1.0.0