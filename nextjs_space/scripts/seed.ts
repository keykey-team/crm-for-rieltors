import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('johndoe123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: { email: 'john@doe.com', name: 'John Doe', password, role: 'admin', phone: '+380501234567' },
  });

  // Leads
  const leadsData = [
    { firstName: 'Олександр', lastName: 'Петренко', phone: '+380671112233', email: 'petrenk@gmail.com', source: 'telegram', status: 'active', needType: 'buy', budget: 85000, priority: 'high', districts: 'Печерський', propertyType: 'apartment' },
    { firstName: 'Марія', lastName: 'Коваль', phone: '+380932223344', email: 'maria.k@ukr.net', source: 'instagram', status: 'new', needType: 'buy', budget: 120000, priority: 'medium', districts: 'Голосіївський', propertyType: 'apartment' },
    { firstName: 'Андрій', lastName: 'Шевченко', phone: '+380503334455', email: 'shevch@mail.com', source: 'olx', status: 'warm', needType: 'sell', budget: 150000, priority: 'high', districts: 'Оболонь', propertyType: 'apartment' },
    { firstName: 'Ірина', lastName: 'Мельник', phone: '+380674445566', email: 'irina.m@gmail.com', source: 'dom_ria', status: 'active', needType: 'rent', budget: 15000, priority: 'medium', districts: 'Шевченківський', propertyType: 'apartment' },
    { firstName: 'Віктор', lastName: 'Бондар', phone: '+380935556677', email: 'bondar.v@ukr.net', source: 'referral', status: 'new', needType: 'buy', budget: 200000, priority: 'low', districts: 'Подільський', propertyType: 'house' },
    { firstName: 'Ольга', lastName: 'Сидоренко', phone: '+380506667788', email: 'olga.s@gmail.com', source: 'website', status: 'cold', needType: 'buy', budget: 65000, priority: 'low', districts: 'Дарницький', propertyType: 'apartment' },
    { firstName: 'Дмитро', lastName: 'Кравченко', phone: '+380677778899', email: 'dmitro.kr@mail.com', source: 'telegram', status: 'active', needType: 'buy', budget: 95000, priority: 'high', districts: 'Святошинський', propertyType: 'apartment' },
    { firstName: 'Наталія', lastName: 'Козлова', phone: '+380938889900', email: 'natalia.k@ukr.net', source: 'manual', status: 'warm', needType: 'sell', budget: 180000, priority: 'medium', districts: 'Печерський', propertyType: 'apartment' },
  ];

  const createdLeads = [];
  for (const lead of leadsData) {
    const created = await prisma.lead.upsert({
      where: { id: `seed-lead-${lead.phone}` },
      update: {},
      create: { id: `seed-lead-${lead.phone}`, ...lead, assignedToId: admin.id },
    });
    createdLeads.push(created);
  }

  // Properties
  const propsData = [
    { id: 'seed-prop-1', title: '2-кім. кв. Печерськ', type: 'apartment', address: 'вул. Хрещатик, 25', district: 'Печерський', rooms: 2, area: 65, floor: 5, totalFloors: 10, price: 89000, status: 'active' },
    { id: 'seed-prop-2', title: '3-кім. кв. Голосіїв', type: 'apartment', address: 'пр-т Науки, 42', district: 'Голосіївський', rooms: 3, area: 85, floor: 7, totalFloors: 16, price: 125000, status: 'active' },
    { id: 'seed-prop-3', title: 'Будинок Поділ', type: 'house', address: 'вул. Садова, 15', district: 'Подільський', rooms: 5, area: 200, floor: 1, totalFloors: 2, price: 210000, status: 'active' },
    { id: 'seed-prop-4', title: '1-кім. студія Оболонь', type: 'apartment', address: 'пр-т Оболонський, 7', district: 'Оболонь', rooms: 1, area: 38, floor: 12, totalFloors: 25, price: 52000, status: 'active' },
    { id: 'seed-prop-5', title: 'Офіс Шевченківський', type: 'commercial', address: 'вул. Володимирська, 33', district: 'Шевченківський', rooms: 4, area: 120, floor: 3, totalFloors: 6, price: 180000, status: 'active' },
    { id: 'seed-prop-6', title: '2-кім. Святошин', type: 'apartment', address: 'вул. Захістю України, 14', district: 'Святошинський', rooms: 2, area: 56, floor: 3, totalFloors: 9, price: 68000, status: 'sold' },
  ];

  const createdProps = [];
  for (const prop of propsData) {
    const created = await prisma.property.upsert({
      where: { id: prop.id },
      update: {},
      create: { ...prop, city: 'Київ', currency: 'USD' },
    });
    createdProps.push(created);
  }

  // Deals across funnel stages
  const dealsData = [
    { id: 'seed-deal-1', title: 'Квартира для Петренко', stage: 'showing', amount: 89000, leadId: createdLeads[0]?.id, propertyId: createdProps[0]?.id },
    { id: 'seed-deal-2', title: '3-кім. для Коваль', stage: 'new_lead', amount: 125000, leadId: createdLeads[1]?.id, propertyId: createdProps[1]?.id },
    { id: 'seed-deal-3', title: 'Продаж кв. Шевченко', stage: 'negotiation', amount: 150000, leadId: createdLeads[2]?.id, propertyId: null },
    { id: 'seed-deal-4', title: 'Оренда для Мельник', stage: 'contacted', amount: 15000, leadId: createdLeads[3]?.id, propertyId: null },
    { id: 'seed-deal-5', title: 'Будинок для Бондар', stage: 'meeting_scheduled', amount: 210000, leadId: createdLeads[4]?.id, propertyId: createdProps[2]?.id },
    { id: 'seed-deal-6', title: 'Студія Оболонь', stage: 'deposit', amount: 52000, leadId: createdLeads[5]?.id, propertyId: createdProps[3]?.id },
    { id: 'seed-deal-7', title: 'Квартира Святошин', stage: 'closed', amount: 68000, leadId: createdLeads[6]?.id, propertyId: createdProps[5]?.id },
    { id: 'seed-deal-8', title: 'Продаж Печерськ', stage: 'documents', amount: 180000, leadId: createdLeads[7]?.id, propertyId: null },
  ];

  for (const deal of dealsData) {
    await prisma.deal.upsert({
      where: { id: deal.id },
      update: {},
      create: { ...deal, commission: 3, assignedToId: admin.id },
    });
  }

  // Tasks
  const now = new Date();
  const tasksData = [
    { id: 'seed-task-1', title: 'Зателефонувати Петренко', type: 'call', priority: 'high', dueDate: new Date(now.getTime() + 3600000), leadId: createdLeads[0]?.id },
    { id: 'seed-task-2', title: 'Підготувати підбірку для Коваль', type: 'other', priority: 'medium', dueDate: new Date(now.getTime() + 86400000), leadId: createdLeads[1]?.id },
    { id: 'seed-task-3', title: 'Організувати показ для Бондар', type: 'showing', priority: 'high', dueDate: new Date(now.getTime() + 172800000), leadId: createdLeads[4]?.id },
    { id: 'seed-task-4', title: 'Надіслати документи Козловій', type: 'documents', priority: 'medium', dueDate: new Date(now.getTime() + 259200000), leadId: createdLeads[7]?.id },
    { id: 'seed-task-5', title: 'Follow-up Сидоренко', type: 'message', priority: 'low', dueDate: new Date(now.getTime() + 604800000), leadId: createdLeads[5]?.id },
  ];

  for (const task of tasksData) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: { ...task, assignedToId: admin.id },
    });
  }

  // Events
  const eventsData = [
    { id: 'seed-event-1', title: 'Показ кв. Хрещатик', type: 'showing', startDate: new Date(now.getTime() + 86400000) },
    { id: 'seed-event-2', title: 'Зустріч з Бондар', type: 'meeting', startDate: new Date(now.getTime() + 172800000) },
    { id: 'seed-event-3', title: 'Підписання договору', type: 'meeting', startDate: new Date(now.getTime() + 432000000) },
  ];

  for (const event of eventsData) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: { ...event, userId: admin.id },
    });
  }

  // Knowledge Base Articles
  const articlesData = [
    { id: 'seed-kb-1', title: 'Скрипт першого дзвінка', category: 'scripts', content: 'Вітаю! Мене звати [I\'mя], я ріелтор компанії [Nазва].\n\nВи залишали заявку на [Iсточник]. Розкажіть, будь ласка, що саме ви шукаєте?\n\nКлючові питання:\n1. Тип нерухомості?\n2. Бюджет?\n3. Бажаний район?\n4. Терміни?' },
    { id: 'seed-kb-2', title: 'Чек-ліст перед показом', category: 'checklists', content: '☐ Перевірити документи на об\'єкт\n☐ Попередньо оглянути об\'єкт\n☐ Підготувати презентацію\n☐ Підтвердити час з клієнтом\n☐ Підготувати альтернативні варіанти' },
    { id: 'seed-kb-3', title: 'Шаблон: Відповідь на заявку', category: 'templates', content: 'Доброго дня, [Iм\'я]!\n\nДякую за звернення. Мене звати [Iм\'я ріелтора], я допоможу вам з питанням нерухомості.\n\nКоли вам зручно поговорити?' },
    { id: 'seed-kb-4', title: 'Юридичні нюанси угоди', category: 'legal', content: 'Основні документи для угоди:\n\n1. Паспорт та IПН сторін\n2. Правовстановлюючі документи\n3. Технічний паспорт\n4. Довідка про відсутність заборон\n5. Згода подружжя (якщо необхідно)' },
  ];

  for (const article of articlesData) {
    await prisma.knowledgeArticle.upsert({
      where: { id: article.id },
      update: {},
      create: { ...article, authorId: admin.id },
    });
  }

  // Funnel stages
  const stages = [
    { value: 'new_lead', label: 'Новий лід', color: '#60B5FF', order: 0, isDefault: true },
    { value: 'contacted', label: 'Контакт встановлено', color: '#80D8C3', order: 1 },
    { value: 'meeting_scheduled', label: 'Зустріч призначено', color: '#A19AD3', order: 2 },
    { value: 'meeting_done', label: 'Зустріч проведено', color: '#72BF78', order: 3 },
    { value: 'showing', label: 'Покази', color: '#FF9149', order: 4 },
    { value: 'negotiation', label: 'Переговори', color: '#FF90BB', order: 5 },
    { value: 'deposit', label: 'Завдаток', color: '#FF9898', order: 6 },
    { value: 'documents', label: 'Документи', color: '#FFD166', order: 7 },
    { value: 'closed', label: 'Угода завершена', color: '#06D6A0', order: 8 },
    { value: 'aftercare', label: 'Aftercare', color: '#118AB2', order: 9 },
    { value: 'rejected', label: 'Відмова', color: '#EF476F', order: 10 },
  ];
  for (const s of stages) {
    await prisma.funnelStage.upsert({ where: { value: s.value }, update: {}, create: s });
  }

  // Dictionaries
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

  console.log('Seed completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
