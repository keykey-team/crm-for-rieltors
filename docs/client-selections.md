# Client selections and matching

## Matching algorithm

`GET /api/leads/:id/matches` filters properties by lead profile:

- property type matches `lead.propertyType` (supports CSV values)
- price range is `[budget * 0.85, budget * 1.10]`
- district intersects with `lead.districts`
- optional constraints: rooms/area min/max if fields exist on lead
- excludes archived/sold properties

Ranking score (0..1) prioritizes exact filters and price proximity to lead budget.

## Public link format

Each selection has `publicSlug`; public URL is:

- `/s/:slug` on client
- API endpoint: `GET /api/public/selections/:slug`

Public page is noindex and does not require authentication.

## Reactions and communications

Client reactions are sent to:

- `POST /api/public/selections/:slug/items/:itemId/reaction`

Reaction values: `like`, `dislike`, `want_to_view`.

When reaction is saved, CRM adds a `Communication` record for the lead with type `selection_reaction` and reaction text.

## PDF export

- `GET /api/selections/:id/pdf`

Server renders a PDF summary (title, message, property data, agent comments).
