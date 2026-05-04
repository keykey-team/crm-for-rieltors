export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/role-guard';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { assignedTo: { select: { id: true, name: true } }, deals: true, tasks: true },
    });
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(lead);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const old = await prisma.lead.findUnique({ where: { id: params.id } });
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.source !== undefined && { source: body.source }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.needType !== undefined && { needType: body.needType }),
        ...(body.budget !== undefined && { budget: body.budget ? parseFloat(body.budget) : null }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.districts !== undefined && { districts: body.districts }),
        ...(body.propertyType !== undefined && { propertyType: body.propertyType }),
      },
    });
    const action = (body.status && old?.status !== body.status) ? 'status_change' : 'update';
    const det = body.status && old?.status !== body.status ? `Статус: ${old?.status} → ${body.status}` : 'Оновлено лід';
    logActivity({ entityType: 'lead', entityId: lead.id, action, details: det, userId: user.id });
    return NextResponse.json(lead);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const old = await prisma.lead.findUnique({ where: { id: params.id } });
    await prisma.lead.delete({ where: { id: params.id } });
    logActivity({ entityType: 'lead', entityId: params.id, action: 'delete', details: `Видалено лід: ${old?.firstName ?? ''} ${old?.lastName ?? ''}`, userId: user.id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
