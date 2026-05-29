import { prisma } from '../../../common/infrastructure/db/prisma';

export async function findProperties(where: Record<string, unknown>) {
  return prisma.property.findMany({
    where: where as any,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      priceHistory: {
        orderBy: { createdAt: 'desc' },
        take: 2,
      },
    },
  });
}

export async function createProperty(data: Record<string, unknown>) {
  return prisma.property.create({ data: data as any });
}

export async function updateProperty(id: string, data: Record<string, unknown>) {
  return prisma.property.update({ where: { id }, data: data as any });
}

export async function deleteProperty(id: string) {
  return prisma.property.delete({ where: { id } });
}

export async function findPropertyUnits(propertyId: string) {
  return prisma.propertyUnit.findMany({
    where: { propertyId },
    orderBy: [{ section: 'asc' }, { floor: 'desc' }, { unitNumber: 'asc' }],
  });
}

export async function createPropertyUnit(data: Record<string, unknown>) {
  return prisma.propertyUnit.create({ data: data as any });
}

export async function updatePropertyUnit(id: string, data: Record<string, unknown>) {
  return prisma.propertyUnit.update({ where: { id }, data: data as any });
}

export async function deletePropertyUnit(id: string) {
  return prisma.propertyUnit.delete({ where: { id } });
}

export interface PriceHistoryPayload {
  propertyId: string;
  agencyId: string;
  price: number;
  currency: string;
  changedBy?: string | null;
  reason?: string | null;
  note?: string | null;
  createdAt?: Date;
}

export async function createPropertyWithInitialPrice(
  data: Record<string, unknown>,
  changedBy?: string,
  reason = 'manual',
  note?: string,
) {
  return prisma.$transaction(async (tx) => {
    const property = await tx.property.create({ data: data as any });
    await tx.propertyPriceHistory.create({
      data: {
        propertyId: property.id,
        agencyId: property.agencyId,
        price: property.price,
        currency: property.currency,
        changedBy: changedBy ?? null,
        reason,
        note: note ?? null,
        createdAt: property.createdAt,
      },
    });
    await tx.activityLog.create({
      data: {
        entityType: 'property',
        entityId: property.id,
        agencyId: property.agencyId,
        action: 'price_change',
        details: `Initial price ${property.price} ${property.currency}`,
        userId: changedBy ?? null,
      },
    });
    return property;
  });
}

export async function updatePropertyWithPriceHistory(
  id: string,
  data: Record<string, unknown>,
  changedBy?: string,
  reason = 'manual',
  note?: string,
) {
  return prisma.$transaction(async (tx) => {
    const previous = await tx.property.findUnique({
      where: { id },
      select: { price: true, currency: true },
    });
    const property = await tx.property.update({ where: { id }, data: data as any });
    if (!previous) return property;
    const priceChanged = previous.price !== property.price;
    const currencyChanged = previous.currency !== property.currency;
    if (!priceChanged && !currencyChanged) return property;
    await tx.propertyPriceHistory.create({
      data: {
        propertyId: id,
        agencyId: property.agencyId,
        price: property.price,
        currency: property.currency,
        changedBy: changedBy ?? null,
        reason,
        note: note ?? null,
      },
    });
    await tx.activityLog.create({
      data: {
        entityType: 'property',
        entityId: id,
        agencyId: property.agencyId,
        action: 'price_change',
        details: `${previous.price} ${previous.currency} -> ${property.price} ${property.currency}`,
        userId: changedBy ?? null,
      },
    });
    return property;
  });
}

export async function addPropertyPriceHistoryPoint(data: PriceHistoryPayload) {
  return prisma.$transaction(async (tx) => {
    const point = await tx.propertyPriceHistory.create({
      data: {
        propertyId: data.propertyId,
        agencyId: data.agencyId,
        price: data.price,
        currency: data.currency,
        changedBy: data.changedBy ?? null,
        reason: data.reason ?? 'manual',
        note: data.note ?? null,
        ...(data.createdAt ? { createdAt: data.createdAt } : {}),
      },
    });
    await tx.activityLog.create({
      data: {
        entityType: 'property',
        entityId: data.propertyId,
        agencyId: data.agencyId,
        action: 'price_change',
        details: `History point ${data.price} ${data.currency} (${data.reason ?? 'manual'})`,
        userId: data.changedBy ?? null,
      },
    });
    return point;
  });
}

export async function findPropertyPriceHistory(
  propertyId: string,
  skip: number,
  take: number,
  from?: Date,
  to?: Date,
) {
  const where = {
    propertyId,
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.propertyPriceHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.propertyPriceHistory.count({ where }),
  ]);
  return { items, total };
}

export async function findPropertyPriceStats(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, price: true, currency: true, agencyId: true, createdAt: true },
  });
  if (!property) return null;
  const [aggregate, changesCount] = await prisma.$transaction([
    prisma.propertyPriceHistory.aggregate({
      where: { propertyId },
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
    }),
    prisma.propertyPriceHistory.count({ where: { propertyId } }),
  ]);
  const daysOnMarket = Math.max(
    0,
    Math.floor((Date.now() - new Date(property.createdAt).getTime()) / 86_400_000),
  );
  return {
    min: aggregate._min.price ?? property.price,
    max: aggregate._max.price ?? property.price,
    avg: aggregate._avg.price ?? property.price,
    current: property.price,
    currency: property.currency,
    agencyId: property.agencyId,
    changesCount,
    daysOnMarket,
  };
}