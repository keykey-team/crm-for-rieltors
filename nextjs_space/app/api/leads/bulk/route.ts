export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, ownershipFilter } from '@/lib/role-guard';
import { logActivity } from '@/lib/activity-logger';

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { ids, action, value } = body as { ids: string[]; action: string; value?: string };

    if (!ids?.length) return NextResponse.json({ error: 'No ids' }, { status: 400 });

    const ownership = ownershipFilter(user);
    const where = { id: { in: ids }, ...ownership };

    if (action === 'delete') {
      const deleted = await prisma.lead.deleteMany({ where });
      for (const id of ids) {
        logActivity({ entityType: 'lead', entityId: id, action: 'delete', details: 'Масове видалення', userId: user.id });
      }
      return NextResponse.json({ deleted: deleted.count });
    }

    if (action === 'status' && value) {
      const updated = await prisma.lead.updateMany({ where, data: { status: value } });
      for (const id of ids) {
        logActivity({ entityType: 'lead', entityId: id, action: 'update', details: `Масова зміна статусу → ${value}`, userId: user.id });
      }
      return NextResponse.json({ updated: updated.count });
    }

    if (action === 'assign' && value) {
      const updated = await prisma.lead.updateMany({ where, data: { assignedToId: value } });
      for (const id of ids) {
        logActivity({ entityType: 'lead', entityId: id, action: 'update', details: 'Масове призначення менеджера', userId: user.id });
      }
      return NextResponse.json({ updated: updated.count });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
