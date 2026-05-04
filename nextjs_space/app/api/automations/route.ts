export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, requireRole } from '@/lib/role-guard';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const automations = await prisma.automation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(automations);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const result = await requireRole('director');
    if (result instanceof NextResponse) return result;
    const user = result;
    const body = await req.json();
    const automation = await prisma.automation.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        trigger: body.trigger,
        triggerValue: body.triggerValue ?? null,
        action: body.action,
        actionValue: body.actionValue ?? null,
        isActive: body.isActive ?? true,
        createdById: user.id,
      },
    });
    return NextResponse.json(automation);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
