# Property Price History

## Data model

`PropertyPriceHistory` stores immutable price points:
- `propertyId`, `price`, `currency`
- `changedBy` (user id), `reason`, `note`
- `createdAt`

`Property` has relation `priceHistory`, `User` has relation `propertyPriceChanges`.

## Endpoints

- `GET /api/properties/:id/price-history?page=1&limit=20&from=&to=`
- `POST /api/properties/:id/price-history` (admin/director)
- `GET /api/properties/:id/price-stats`

Price changes from property create/update are written automatically in the same transaction as the property write.

## Backfill

```bash
cd server
npm run backfill:price-history
```

Creates one history point for each existing property without history using `property.createdAt`.

## Frontend usage

- `@/entities/property-price-history` for domain types/API/helpers/badge
- `@/widgets/property-price-history` for chart + history table
- `@/features/add-price-point` for manual point modal
