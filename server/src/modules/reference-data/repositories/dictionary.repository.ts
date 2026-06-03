import { prisma } from '../../../common/infrastructure/db/prisma';
import { DEFAULT_DICTIONARIES } from '../config/default-dictionaries';

type DictionaryRow = Awaited<ReturnType<typeof prisma.dictionary.findMany>>[number];

async function countDictionaryUsage(item: DictionaryRow): Promise<number> {
  const whereAgency = { agencyId: item.agencyId };

  switch (item.category) {
    case 'property_type':
      return prisma.property.count({ where: { ...whereAgency, type: item.value } });
    case 'property_status':
      return prisma.property.count({ where: { ...whereAgency, status: item.value } });
    case 'property_deal_type':
    case 'operation_type':
      return prisma.property.count({ where: { ...whereAgency, dealTypes: { has: item.value } } });
    case 'district': {
      const [propertiesCount, leadsCount] = await Promise.all([
        prisma.property.count({ where: { ...whereAgency, district: item.value } }),
        prisma.lead.count({ where: { ...whereAgency, districts: { contains: item.value, mode: 'insensitive' } } }),
      ]);
      return propertiesCount + leadsCount;
    }
    case 'lead_source':
    case 'source':
    case 'object_source':
      return prisma.lead.count({ where: { ...whereAgency, source: item.value } });
    case 'need_type':
      return prisma.lead.count({ where: { ...whereAgency, needType: item.value } });
    case 'showing_status':
      return prisma.showing.count({ where: { ...whereAgency, status: item.value } });
    case 'deal_status':
      return prisma.deal.count({ where: { ...whereAgency, stage: item.value } });
    case 'currency': {
      const [propertiesCount, dealsCount] = await Promise.all([
        prisma.property.count({ where: { ...whereAgency, currency: item.value } }),
        prisma.deal.count({ where: { ...whereAgency, currency: item.value } }),
      ]);
      return propertiesCount + dealsCount;
    }
    default:
      return 0;
  }
}

export async function ensureDefaultDictionaries(agencyId: string, categories?: string[]) {
  const targetCategories = (categories?.length ? categories : Object.keys(DEFAULT_DICTIONARIES)) as Array<keyof typeof DEFAULT_DICTIONARIES>;

  for (const category of targetCategories) {
    const seeds = DEFAULT_DICTIONARIES[category] ?? [];
    if (!seeds.length) continue;

    const existing = await prisma.dictionary.count({
      where: { agencyId, category },
    });

    if (existing > 0) continue;

    await prisma.dictionary.createMany({
      data: seeds.map((item, index) => ({
        agencyId,
        category,
        value: item.value,
        label: item.label,
        order: item.order ?? index,
        isActive: true,
      })),
      skipDuplicates: true,
    });
  }
}

export async function findDictionaries(category?: string, includeInactive = false) {
  const items = await prisma.dictionary.findMany({
    where: { ...(includeInactive ? {} : { isActive: true }), ...(category ? { category } : {}) },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });

  const usage = await Promise.all(
    items.map(async (item) => ({
      ...item,
      usageCount: await countDictionaryUsage(item),
    })),
  );

  return usage;
}

export async function createDictionary(data: Record<string, unknown>) {
  return prisma.dictionary.create({ data: data as any });
}

export async function updateDictionary(id: string, data: Record<string, unknown>) {
  return prisma.dictionary.update({ where: { id }, data: data as any });
}

export async function updateDictionaryOrder(items: { id: string; order: number }[]) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.dictionary.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );
}

export async function deactivateDictionary(id: string) {
  return prisma.dictionary.update({ where: { id }, data: { isActive: false } });
}

