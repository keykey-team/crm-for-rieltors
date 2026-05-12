export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, ownershipFilter } from '@/lib/role-guard';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? '';
    const priority = searchParams.get('priority') ?? '';
    const where: any = { ...ownershipFilter(user) };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    const tasks = await prisma.task.findMany({
      where, orderBy: { dueDate: 'asc' }, take: 200,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        type: body.type ?? 'call',
        priority: body.priority ?? 'medium',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        leadId: body.leadId ?? null,
        assignedToId: body.assignedToId ?? user.id,
      },
    });
    return NextResponse.json(task);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
