import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ROLE_PRIORITY = ['admin', 'director'] as const;

type UserRow = { id: string; role: string; createdAt: Date };

function pickOwner(users: UserRow[]): UserRow | null {
  if (!users.length) return null;
  const byPriority = ROLE_PRIORITY.map((role) => users.find((user) => user.role === role)).find(Boolean);
  if (byPriority) return byPriority;
  return [...users].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0] ?? null;
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const owner = pickOwner(users);
  if (!owner) {
    console.log('No users found. Skipping migration.');
    return;
  }

  const agency = await prisma.agency.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Agency',
      slug: 'default',
      ownerId: owner.id,
      plan: 'free',
    },
  });

  for (const user of users) {
    await prisma.agencyMembership.upsert({
      where: { agencyId_userId: { agencyId: agency.id, userId: user.id } },
      update: {
        isActive: true,
        role: user.role || 'agent',
      },
      create: {
        agencyId: agency.id,
        userId: user.id,
        role: user.role || 'agent',
        isActive: true,
      },
    });
  }

  const scopedTables = [
    'Lead',
    'Property',
    'Deal',
    'Task',
    'Event',
    'Template',
    'Automation',
    'Funnel',
    'ChatRoom',
    'KnowledgeArticle',
    'Communication',
    'LeadDistributionRule',
    'AftercarePlan',
    'Dictionary',
    'ActivityLog',
  ];

  await prisma.$transaction(
    scopedTables.map((table) =>
      prisma.$executeRawUnsafe(`UPDATE "${table}" SET "agencyId" = $1 WHERE "agencyId" IS NULL`, agency.id),
    ),
  );
  await prisma.user.updateMany({ where: { lastAgencyId: null }, data: { lastAgencyId: agency.id } });

  console.log(`Multi-tenant migration completed. Default agency: ${agency.id}`);
}

main()
  .catch((error) => {
    console.error('Multi-tenant migration failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
