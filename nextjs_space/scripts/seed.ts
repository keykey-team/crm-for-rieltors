import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Funnel stages (structural config)
  const stages = [
    { value: 'new_lead', label: 'Новий лід', color: '#60B5FF', order: 0, isDefault: true },
    { value: 'contacted', label: 'Контакт встановлено', color: '#80D8C3', order: 1 },
    { value: 'meeting_scheduled', label: 'Зустріч призначено', color: '#A19AD3', order: 2 },
    { value: 'meeting_done', label: 'Зустріч проведено', color: '#72BF78', order: 3 },
    { value: 'showing', label: 'Покази', color: '#FF9149', order: 4 },
    { value: 'negotiation', label: 'Переговори', color: '#FF90BB', order: 5 },
    { value: 'deposit', label: 'Завдаток', color: '#FF9898', order: 6 },
    { value: 'documents', label: 'Документи', color: '#FFD166', order: 7 },
    { value: 'closed', label: 'Угода завершена', color: '#06D6A0', order: 8, isDefault: true },
    { value: 'aftercare', label: 'Aftercare', color: '#118AB2', order: 9 },
    { value: 'cancelled', label: 'Скасовано', color: '#8E8E93', order: 10, isDefault: true },
    { value: 'rejected', label: 'Відмова', color: '#EF476F', order: 11, isDefault: true },
  ];
  for (const s of stages) {
    await prisma.funnelStage.upsert({ where: { value: s.value }, update: {}, create: s });
  }

  // Dictionaries (structural config)
  const dicts = [
    { category: 'district', value: 'pechersk', label: 'Печерський', order: 0 },
    { category: 'district', value: 'holosiiv', label: 'Голосіївський', order: 1 },
    { category: 'district', value: 'obolon', label: 'Оболонь', order: 2 },
    { category: 'district', value: 'shevchenkivsk', label: 'Шевченківський', order: 3 },
    { category: 'district', value: 'podilsk', label: 'Подільський', order: 4 },
    { category: 'district', value: 'darnytsk', label: 'Дарницький', order: 5 },
    { category: 'district', value: 'sviatoshynsk', label: 'Святошинський', order: 6 },
    { category: 'district', value: 'desnianskiy', label: 'Деснянський', order: 7 },
    { category: 'district', value: 'solomianskiy', label: 'Солом\'янський', order: 8 },
    { category: 'district', value: 'dniprovskiy', label: 'Дніпровський', order: 9 },
    { category: 'property_type', value: 'apartment', label: 'Квартира', order: 0 },
    { category: 'property_type', value: 'house', label: 'Будинок', order: 1 },
    { category: 'property_type', value: 'commercial', label: 'Комерція', order: 2 },
    { category: 'property_type', value: 'land', label: 'Ділянка', order: 3 },
    { category: 'lead_source', value: 'manual', label: 'Вручну', order: 0 },
    { category: 'lead_source', value: 'telegram', label: 'Telegram', order: 1 },
    { category: 'lead_source', value: 'instagram', label: 'Instagram', order: 2 },
    { category: 'lead_source', value: 'olx', label: 'OLX', order: 3 },
    { category: 'lead_source', value: 'dom_ria', label: 'DOM.RIA', order: 4 },
    { category: 'lead_source', value: 'website', label: 'Сайт', order: 5 },
    { category: 'lead_source', value: 'referral', label: 'Рекомендація', order: 6 },
    { category: 'lead_source', value: 'other', label: 'Інше', order: 7 },
  ];
  for (const d of dicts) {
    await prisma.dictionary.upsert({
      where: { category_value: { category: d.category, value: d.value } },
      update: {},
      create: d,
    });
  }

  console.log('Seed completed — structural data only (stages + dictionaries).');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());