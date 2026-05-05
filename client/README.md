# CRM Client (Next.js)

## Run

```bash
npm install
npm run dev
```

Default port: `3000`.

## Environment

Create `.env.local` from `.env.local.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The shared HTTP client appends `/api` automatically and sends credentials (`cookies`) with every request.

## API Integration

- Main API communication uses `src/shared/api/httpClient.ts`
- Auth endpoints: `src/features/auth/api/authApi.ts`
- Entity clients: `src/entities/*/api/*Api.ts`
- Next.js rewrite in `next.config.js` proxies `/api/:path*` to Express backend

## Notes

Legacy Next.js API routes under `app/api` were removed in favor of Express backend integration.
