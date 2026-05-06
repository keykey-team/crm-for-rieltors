# CRM Server (Modular Monolith)

Express + TypeScript backend for CRM with modular monolith architecture.

## Stack

- Express.js
- TypeScript
- Prisma ORM
- tsyringe (Dependency Injection)
- class-validator / class-transformer
- Event Bus for inter-module events

## Structure

```text
server/
├── src/
│   ├── app/
│   ├── common/
│   ├── modules/
│   │   ├── iam/
│   │   ├── leads/
│   │   ├── deals/
│   │   ├── properties/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── analytics/
│   │   └── automation/
│   ├── docs/
│   └── scripts/
├── prisma/
├── uploads/
└── package.json
```

## Run

1. Copy env file:
   ```bash
   cp .env.example .env
   ```
   Required variables:
   - `PORT` (default `4000`)
   - `CLIENT_URL` (default `http://localhost:3000`)
   - `DATABASE_URL`
   - `JWT_SECRET`

2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Main API Endpoints

### IAM module

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`

### Leads module

- `GET /api/leads`
- `GET /api/leads/:id`
- `POST /api/leads`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id`

## Notes

- CORS is configured for `CLIENT_URL` and sends cookies with `credentials: true`.
- Authentication uses signed JWT stored in HTTP-only cookie `crm_token`.
- Cookie options use `sameSite=lax` in development and `sameSite=none` + `secure` in production.

- `deals`, `properties`, `tasks`, `calendar`, `analytics`, `automation` modules have folder scaffolding and route placeholders for next phases.
