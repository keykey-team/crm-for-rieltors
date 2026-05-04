export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, ownershipFilter } from '@/lib/role-guard';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const where: any = {};
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.startDate = { gte: start, lte: end };
    }
    const events = await prisma.event.findMany({
      where, orderBy: { startDate: 'asc' }, take: 200,
      include: { user: { select: { id: true, name: true } } },
    });
    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        type: body.type ?? 'meeting',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        allDay: body.allDay ?? false,
        userId: user.id,
      },
    });
    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
