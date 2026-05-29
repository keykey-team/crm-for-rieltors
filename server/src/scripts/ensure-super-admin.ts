import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../common/infrastructure/db/prisma';
import { ensureSystemStages } from '../modules/sales-pipeline/repositories/funnel.repository';

const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@local.crm';
const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

async function main() {
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      id: 'local-super-admin',
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      accountType: 'agency',
      plan: 'business',
      permissions: null,
    },
    update: {
      password: hashedPassword,
      name,
      role: 'admin',
      accountType: 'agency',
      plan: 'business',
      permissions: null,
    },
    select: {
      id: true,
      email: true,
      role: true,
      accountType: true,
      plan: true,
    },
  });

  const agency = await prisma.agency.upsert({
    where: { slug: 'default' },
    update: { ownerId: user.id },
    create: {
      id: 'default-agency',
      name: 'Default Agency',
      slug: 'default',
      ownerId: user.id,
      plan: 'free',
    },
  });

  await prisma.agencyMembership.upsert({
    where: { agencyId_userId: { agencyId: agency.id, userId: user.id } },
    update: { role: 'owner', isActive: true },
    create: { agencyId: agency.id, userId: user.id, role: 'owner', isActive: true },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastAgencyId: agency.id } });

  console.log(`Super admin ready: ${user.email} (${user.role}, ${user.accountType}, ${user.plan}, agency ${agency.slug})`);
  await ensureSystemStages();
}

main()
  .catch((error) => {
    console.error('Failed to ensure super admin');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
