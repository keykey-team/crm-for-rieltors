import { prisma } from '@/shared/lib/db';
import { hasRole, type SessionUser } from '@/shared/lib/role-guard';

/** Build ownership filter for agents */
function ownerFilter(user: SessionUser, field = 'assignedToId') {
  if (hasRole(user.role, 'director')) return {};
  return { [field]: user.id };
}

/** Parse relative dates from LLM (today, yesterday, this_week, this_month, last_month, etc.) */
function parseDateRange(period?: string): { gte?: Date; lte?: Date } | undefined {
  if (!period) return undefined;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return { gte: today, lte: new Date(today.getTime() + 86400000) };
    case 'yesterday': {
      const y = new Date(today.getTime() - 86400000);
      return { gte: y, lte: today };
    }
    case 'this_week': {
      const d = today.getDay() || 7;
      const mon = new Date(today.getTime() - (d - 1) * 86400000);
      return { gte: mon };
    }
    case 'last_week': {
      const d = today.getDay() || 7;
      const mon = new Date(today.getTime() - (d - 1 + 7) * 86400000);
      const sun = new Date(mon.getTime() + 7 * 86400000);
      return { gte: mon, lte: sun };
    }
    case 'this_month':
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    case 'last_month': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: first, lte: last };
    }
    case 'this_quarter': {
      const q = Math.floor(now.getMonth() / 3);
      return { gte: new Date(now.getFullYear(), q * 3, 1) };
    }
    case 'this_year':
      return { gte: new Date(now.getFullYear(), 0, 1) };
    default: {
      // Try ISO date range: "2026-03-01..2026-03-31"
      const parts = period.split('..');
      if (parts.length === 2) {
        const from = new Date(parts[0]);
        const to = new Date(parts[1]);
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
          return { gte: from, lte: new Date(to.getTime() + 86400000) };
        }
      }
      // Single date
      const d = new Date(period);
      if (!isNaN(d.getTime())) {
        return { gte: d, lte: new Date(d.getTime() + 86400000) };
      }
      return undefined;
    }
  }
}

export interface QueryParams {
  entity: 'leads' | 'deals' | 'properties' | 'tasks' | 'events' | 'analytics' | 'users';
  search?: string;
  status?: string;
  stage?: string;
  source?: string;
  type?: string;
  priority?: string;
  period?: string;
  manager?: string;
  limit?: number;
  sort?: string;
  aggregation?: 'count' | 'sum' | 'list';
}

/** Resolve manager name to user ID */
async function resolveManager(name?: string): Promise<string | undefined> {
  if (!name) return undefined;
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: name, mode: 'insensitive' } },
        { email: { contains: name, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true },
    take: 1,
  });
  return users[0]?.id;
}

export async function executeQuery(params: QueryParams, user: SessionUser): Promise<string> {
  const take = Math.min(params.limit || 20, 50);
  const dateRange = parseDateRange(params.period);
  const managerId = await resolveManager(params.manager);

  try {
    switch (params.entity) {
      case 'leads': {
        const where: any = {
          ...ownerFilter(user),
          ...(params.status && { status: params.status }),
          ...(params.source && { source: params.source }),
          ...(params.priority && { priority: params.priority }),
          ...(managerId && { assignedToId: managerId }),
          ...(dateRange && { createdAt: dateRange }),
          ...(params.search && {
            OR: [
              { firstName: { contains: params.search, mode: 'insensitive' } },
              { lastName: { contains: params.search, mode: 'insensitive' } },
              { phone: { contains: params.search } },
              { email: { contains: params.search, mode: 'insensitive' } },
            ],
          }),
        };

        if (params.aggregation === 'count') {
          const count = await prisma.lead.count({ where });
          return `Кількість лідів: ${count}`;
        }

        const leads = await prisma.lead.findMany({
          where,
          include: { assignedTo: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take,
        });

        if (leads.length === 0) return 'Лідів не знайдено за вказаними критеріями.';
        
        return `Знайдено ${leads.length} лідів:\n` +
          leads.map((l: any, i: number) =>
            `${i + 1}. ${l.firstName} ${l.lastName || ''} | Тел: ${l.phone} | Статус: ${l.status} | Джерело: ${l.source} | Менеджер: ${l.assignedTo?.name || 'не призначено'} | Створено: ${l.createdAt.toLocaleDateString('uk-UA')}`
          ).join('\n');
      }

      case 'deals': {
        const where: any = {
          ...ownerFilter(user),
          ...(params.stage && { stage: params.stage }),
          ...(managerId && { assignedToId: managerId }),
          ...(dateRange && { createdAt: dateRange }),
          ...(params.search && {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              { lead: { firstName: { contains: params.search, mode: 'insensitive' } } },
              { lead: { lastName: { contains: params.search, mode: 'insensitive' } } },
            ],
          }),
        };

        if (params.aggregation === 'count') {
          const count = await prisma.deal.count({ where });
          const sum = await prisma.deal.aggregate({ where, _sum: { amount: true } });
          return `Кількість угод: ${count}, загальна сума: ${sum._sum.amount?.toLocaleString('uk-UA') || '0'} (змішані валюти)`;
        }

        const deals = await prisma.deal.findMany({
          where,
          include: {
            assignedTo: { select: { name: true } },
            lead: { select: { firstName: true, lastName: true } },
            property: { select: { title: true, address: true } },
          },
          orderBy: { createdAt: 'desc' },
          take,
        });

        if (deals.length === 0) return 'Угод не знайдено за вказаними критеріями.';

        return `Знайдено ${deals.length} угод:\n` +
          deals.map((d: any, i: number) =>
            `${i + 1}. "${d.title}" | Стадія: ${d.stage} | Сума: ${d.amount?.toLocaleString('uk-UA') || '—'} ${d.currency} | Клієнт: ${d.lead ? `${d.lead.firstName} ${d.lead.lastName || ''}` : '—'} | Об'єкт: ${d.property?.title || '—'} | Менеджер: ${d.assignedTo?.name || '—'} | Створено: ${d.createdAt.toLocaleDateString('uk-UA')}`
          ).join('\n');
      }

      case 'properties': {
        const where: any = {
          ...(params.status && { status: params.status }),
          ...(params.type && { type: params.type }),
          ...(dateRange && { createdAt: dateRange }),
          ...(params.search && {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              { address: { contains: params.search, mode: 'insensitive' } },
              { district: { contains: params.search, mode: 'insensitive' } },
            ],
          }),
        };

        if (params.aggregation === 'count') {
          const count = await prisma.property.count({ where });
          return `Кількість об'єктів: ${count}`;
        }

        const props = await prisma.property.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take,
        });

        if (props.length === 0) return "Об'єктів не знайдено за вказаними критеріями.";

        return `Знайдено ${props.length} об'єктів:\n` +
          props.map((p: any, i: number) =>
            `${i + 1}. "${p.title}" | ${p.type} | ${p.rooms || '—'} кімн. | ${p.area || '—'} м² | ${p.price.toLocaleString('uk-UA')} ${p.currency} | ${p.address} | Статус: ${p.status}`
          ).join('\n');
      }

      case 'tasks': {
        const where: any = {
          ...ownerFilter(user),
          ...(params.status && { status: params.status }),
          ...(params.type && { type: params.type }),
          ...(params.priority && { priority: params.priority }),
          ...(managerId && { assignedToId: managerId }),
          ...(dateRange && { dueDate: dateRange }),
          ...(params.search && {
            title: { contains: params.search, mode: 'insensitive' },
          }),
        };

        if (params.aggregation === 'count') {
          const count = await prisma.task.count({ where });
          return `Кількість задач: ${count}`;
        }

        const tasks = await prisma.task.findMany({
          where,
          include: { assignedTo: { select: { name: true } } },
          orderBy: { dueDate: 'asc' },
          take,
        });

        if (tasks.length === 0) return 'Задач не знайдено за вказаними критеріями.';

        return `Знайдено ${tasks.length} задач:\n` +
          tasks.map((t: any, i: number) =>
            `${i + 1}. "${t.title}" | ${t.type} | Пріоритет: ${t.priority} | Статус: ${t.status} | Дедлайн: ${t.dueDate?.toLocaleDateString('uk-UA') || 'без дедлайну'} | Виконавець: ${t.assignedTo?.name || '—'}`
          ).join('\n');
      }

      case 'events': {
        const evWhere: any = {
          ...(hasRole(user.role, 'director') ? {} : { userId: user.id }),
          ...(dateRange && { startDate: dateRange }),
          ...(params.search && {
            title: { contains: params.search, mode: 'insensitive' },
          }),
        };

        const events = await prisma.event.findMany({
          where: evWhere,
          include: { user: { select: { name: true } } },
          orderBy: { startDate: 'asc' },
          take,
        });

        if (events.length === 0) return 'Подій не знайдено за вказаними критеріями.';

        return `Знайдено ${events.length} подій:\n` +
          events.map((e: any, i: number) =>
            `${i + 1}. "${e.title}" | ${e.type} | ${e.startDate.toLocaleDateString('uk-UA')} ${e.startDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })} | ${e.user?.name || '—'}`
          ).join('\n');
      }

      case 'analytics': {
        const owFilter = ownerFilter(user);
        const leadWhere: any = { ...owFilter, ...(dateRange && { createdAt: dateRange }) };
        const dealWhere: any = { ...owFilter, ...(dateRange && { createdAt: dateRange }) };
        const taskWhere: any = { ...owFilter, ...(dateRange && { createdAt: dateRange }) };

        const [leadsCount, dealsCount, dealsSum, tasksCount, tasksDone, propsCount] = await Promise.all([
          prisma.lead.count({ where: leadWhere }),
          prisma.deal.count({ where: dealWhere }),
          prisma.deal.aggregate({ where: dealWhere, _sum: { amount: true, commission: true } }),
          prisma.task.count({ where: taskWhere }),
          prisma.task.count({ where: { ...taskWhere, status: 'completed' } }),
          prisma.property.count({ where: dateRange ? { createdAt: dateRange } : {} }),
        ]);

        const closedDeals = await prisma.deal.count({
          where: { ...dealWhere, stage: { in: ['closed', 'closed_won'] } },
        });
        const conversion = dealsCount > 0 ? Math.round((closedDeals / dealsCount) * 100) : 0;

        return `📊 Аналітика${params.period ? ` (${params.period})` : ''}:
• Лідів: ${leadsCount}
• Угод: ${dealsCount} (закритих: ${closedDeals}, конверсія: ${conversion}%)
• Сума угод: ${dealsSum._sum.amount?.toLocaleString('uk-UA') || '0'}
• Комісія: ${dealsSum._sum.commission?.toLocaleString('uk-UA') || '0'}
• Задач: ${tasksCount} (виконано: ${tasksDone})
• Об'єктів: ${propsCount}`;
      }

      case 'users': {
        if (!hasRole(user.role, 'director')) {
          return 'У вас немає доступу до списку користувачів.';
        }
        const users = await prisma.user.findMany({
          select: { id: true, name: true, email: true, role: true, plan: true },
          orderBy: { name: 'asc' },
        });
        return `Користувачі (${users.length}):\n` +
          users.map((u: any, i: number) => `${i + 1}. ${u.name || '—'} | ${u.email} | Роль: ${u.role} | План: ${u.plan}`).join('\n');
      }

      default:
        return 'Невідомий тип запиту.';
    }
  } catch (error) {
    console.error('Assistant query error:', error);
    return 'Помилка при виконанні запиту до бази даних.';
  }
}

/** Schema description for the LLM to understand available queries */
export const QUERY_SCHEMA = `You are a CRM data assistant. Analyze the user's question and respond in json format with a structured query.

Available entities and their filterable fields:
- leads: search (name/phone/email), status (new/contacted/qualified/negotiation/won/lost), source (olx/website/referral/social/manual/other), priority (low/medium/high), period, manager (name), aggregation (count/list)
- deals: search (title/client name), stage (new_lead/contacted/showing/negotiation/deposit/contract/closed/cancelled/rejected), period, manager (name), aggregation (count/list)
- properties: search (title/address/district), status (active/reserved/sold/rented/inactive), type (apartment/house/commercial/land/office), period, aggregation (count/list)
- tasks: search (title), status (pending/completed), type (call/meeting/viewing/document/other), priority (low/medium/high), period, manager (name), aggregation (count/list)
- events: search (title), period
- analytics: period (for aggregate statistics across all entities)
- users: (admin/director only, no filters)

Period values: today, yesterday, this_week, last_week, this_month, last_month, this_quarter, this_year, or ISO date range "YYYY-MM-DD..YYYY-MM-DD"

Respond with ONLY a raw JSON object (no markdown, no code blocks):
{"entity":"...","search":"...","status":"...","stage":"...","source":"...","type":"...","priority":"...","period":"...","manager":"...","limit":20,"aggregation":"list"}

Only include fields that are relevant to the question. If the question is not about CRM data (e.g. general chat), respond with: {"entity":"none"}`;
