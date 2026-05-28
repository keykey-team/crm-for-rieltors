import { PrismaClient } from '@prisma/client';
import { getAgencyContext } from '../agency/context';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const rawPrisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['warn', 'error'] });

const scopedModels = new Set([
  'Lead',
  'Property',
  'Deal',
  'Task',
  'Event',
  'KnowledgeArticle',
  'Automation',
  'Template',
  'ActivityLog',
  'Funnel',
  'Communication',
  'AftercarePlan',
  'Dictionary',
  'ChatRoom',
  'LeadDistributionRule',
]);

const batchScopedActions = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'deleteMany',
]);

const uniqueScopedActions = new Set(['findUnique', 'findUniqueOrThrow', 'update', 'delete']);

function ensureAgencyInData(data: Record<string, unknown> | undefined, agencyId: string): Record<string, unknown> {
  if (!data) return { agencyId };
  if (data.agencyId && data.agencyId !== agencyId) throw new Error('Cross-agency write is forbidden');
  return { ...data, agencyId };
}

export const prisma = rawPrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: any) {
        if (!model || !scopedModels.has(model)) return query(args);

        const context = getAgencyContext();
        const agencyId = context?.agencyId;

        if (agencyId && batchScopedActions.has(operation)) {
          args = args ?? {};
          args.where = { ...(args.where ?? {}), agencyId };
        }

        if (agencyId && uniqueScopedActions.has(operation)) {
          args = args ?? {};
          args.where = { ...(args.where ?? {}), agencyId };
        }

        if (operation === 'create') {
          const data = args?.data as Record<string, unknown> | undefined;
          if (!agencyId && !data?.agencyId) throw new Error(`Missing agency scope for ${model}.create`);
          if (agencyId) args.data = ensureAgencyInData(data, agencyId);
        }

        if (operation === 'createMany') {
          const data = args?.data;
          if (!agencyId && !data) throw new Error(`Missing agency scope for ${model}.createMany`);
          if (agencyId && Array.isArray(data)) args.data = data.map((item) => ensureAgencyInData(item, agencyId));
          if (agencyId && data && !Array.isArray(data)) args.data = ensureAgencyInData(data, agencyId);
        }

        if (operation === 'upsert' && agencyId) {
          args = args ?? {};
          args.where = { ...(args.where ?? {}), agencyId };
          args.create = ensureAgencyInData(args.create, agencyId);
          args.update = ensureAgencyInData(args.update, agencyId);
        }

        return query(args);
      },
    },
  },
}) as PrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = rawPrisma;
