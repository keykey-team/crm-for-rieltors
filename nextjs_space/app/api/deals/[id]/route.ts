export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, hasRole } from '@/lib/role-guard';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        lead: true, property: true,
        assignedTo: { select: { id: true, name: true } },
      },
    });
    if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!hasRole(user.role, 'director') && deal.assignedToId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(deal);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const old = await prisma.deal.findUnique({ where: { id: params.id } });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!hasRole(user.role, 'director') && old.assignedToId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.stage !== undefined && { stage: body.stage }),
        ...(body.amount !== undefined && { amount: body.amount ? parseFloat(body.amount) : null }),
        ...(body.commission !== undefined && { commission: body.commission ? parseFloat(body.commission) : null }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.leadId !== undefined && { leadId: body.leadId }),
        ...(body.propertyId !== undefined && { propertyId: body.propertyId }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });
    const stageChanged = body.stage && old?.stage !== body.stage;
    const action = stageChanged ? 'stage_change' : 'update';
    const det = stageChanged ? `Етап: ${old?.stage} → ${body.stage}` : 'Оновлено угоду';
    logActivity({ entityType: 'deal', entityId: deal.id, action, details: det, userId: user.id });

    // ─── Automatic aftercare: create tasks from AftercarePlan on deal close ───
    if (stageChanged && body.stage === 'closed') {
      try {
        const plan = await prisma.aftercarePlan.findFirst({
          where: { isActive: true },
          include: { steps: { orderBy: { order: 'asc' } } },
        });
        if (plan && plan.steps.length > 0) {
          const now = new Date();
          for (const step of plan.steps) {
            const dueDate = new Date(now.getTime() + step.dayOffset * 24 * 60 * 60 * 1000);
            await prisma.task.create({
              data: {
                title: step.title,
                description: step.content ?? `Aftercare: ${plan.name}`,
                type: step.type === 'call' ? 'call' : step.type === 'meeting' ? 'meeting' : 'other',
                priority: 'medium',
                dueDate,
                assignedToId: deal.assignedToId,
                leadId: deal.leadId,
              },
            });
          }
          logActivity({
            entityType: 'deal', entityId: deal.id, action: 'update',
            details: `Aftercare "${plan.name}": створено ${plan.steps.length} задач`, userId: user.id,
          });
        }
      } catch (_) { /* aftercare is best-effort */ }
    }

    return NextResponse.json(deal);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const old = await prisma.deal.findUnique({ where: { id: params.id } });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!hasRole(user.role, 'director') && old.assignedToId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await prisma.deal.delete({ where: { id: params.id } });
    logActivity({ entityType: 'deal', entityId: params.id, action: 'delete', details: `Видалено угоду: ${old?.title ?? ''}`, userId: user.id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
