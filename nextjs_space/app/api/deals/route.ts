export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, ownershipFilter } from '@/lib/role-guard';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage') ?? '';
    const where: any = { ...ownershipFilter(user) };
    if (stage) where.stage = stage;
    const deals = await prisma.deal.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 200,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
        property: { select: { id: true, title: true, address: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(deals);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const deal = await prisma.deal.create({
      data: {
        title: body.title,
        stage: body.stage ?? 'new_lead',
        amount: body.amount ? parseFloat(body.amount) : null,
        commission: body.commission ? parseFloat(body.commission) : null,
        leadId: body.leadId ?? null,
        propertyId: body.propertyId ?? null,
        assignedToId: body.assignedToId ?? user.id,
        notes: body.notes ?? null,
      },
    });
    return NextResponse.json(deal);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
