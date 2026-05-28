import { prisma } from '../src/common/infrastructure/db/prisma';

async function backfillPropertyPriceHistory() {
  const properties = await prisma.property.findMany({
    where: { priceHistory: { none: {} } },
    select: { id: true, price: true, currency: true, createdAt: true },
  });

  if (!properties.length) {
    console.log('No properties require backfill');
    return;
  }

  await prisma.propertyPriceHistory.createMany({
    data: properties.map((property) => ({
      propertyId: property.id,
      price: property.price,
      currency: property.currency,
      reason: 'manual',
      createdAt: property.createdAt,
    })),
  });

  console.log(`Backfilled ${properties.length} properties`);
}

backfillPropertyPriceHistory()
  .catch((error) => {
    console.error('Backfill failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
