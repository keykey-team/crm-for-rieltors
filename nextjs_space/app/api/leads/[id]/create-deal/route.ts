export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const deal = await prisma.deal.create({
    data: {
      title: body.title || `Угода: ${lead.firstName} ${lead.lastName || ''}`.trim(),
      stage: 'new_lead',
      leadId: lead.id,
      assignedToId: lead.assignedToId || (session.user as any).id,
      amount: lead.budget || null,
      propertyId: body.propertyId || null,
    },
  });

  // Update lead status
  await prisma.lead.update({ where: { id }, data: { status: 'active' } });

  return NextResponse.json(deal);
}
