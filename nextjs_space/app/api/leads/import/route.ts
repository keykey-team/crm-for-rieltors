export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { leads } = await req.json();
  if (!Array.isArray(leads) || leads.length === 0) {
    return NextResponse.json({ error: 'No leads provided' }, { status: 400 });
  }

  const userId = (session.user as any).id;
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Try auto-distribution
  const rules = await prisma.leadDistributionRule.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  });

  for (let i = 0; i < leads.length; i++) {
    const row = leads[i];
    const firstName = (row.firstName || row['Ім\'я'] || row['Имя'] || row.name || '').toString().trim();
    const phone = (row.phone || row['Телефон'] || row['телефон'] || '').toString().trim();
    if (!firstName || !phone) {
      skipped++;
      errors.push(`Рядок ${i + 2}: відсутнє ім'я або телефон`);
      continue;
    }

    // Find matching distribution rule
    let assignToId = userId;
    for (const rule of rules) {
      const sourceMatch = !rule.source || rule.source === (row.source || 'manual');
      const districtMatch = !rule.district || rule.district === (row.districts || '');
      const typeMatch = !rule.propertyType || rule.propertyType === (row.propertyType || '');
      const needMatch = !rule.needType || rule.needType === (row.needType || 'buy');
      if (sourceMatch && districtMatch && typeMatch && needMatch) {
        assignToId = rule.assignToId;
        break;
      }
    }

    try {
      await prisma.lead.create({
        data: {
          firstName,
          lastName: (row.lastName || row['Прізвище'] || row['Фамилия'] || '').toString().trim() || null,
          phone,
          email: (row.email || row['Email'] || row['Пошта'] || '').toString().trim() || null,
          source: row.source || 'manual',
          status: 'new',
          needType: row.needType || 'buy',
          budget: row.budget ? parseFloat(row.budget) : null,
          districts: (row.districts || row['Район'] || '').toString().trim() || null,
          propertyType: (row.propertyType || row['Тип'] || '').toString().trim() || null,
          notes: (row.notes || row['Примітки'] || row['Заметки'] || '').toString().trim() || null,
          assignedToId: assignToId,
        },
      });
      imported++;
    } catch (e: any) {
      skipped++;
      errors.push(`Рядок ${i + 2}: ${e.message?.slice(0, 100)}`);
    }
  }

  return NextResponse.json({ imported, skipped, errors: errors.slice(0, 10) });
}
