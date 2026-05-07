export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, ownershipFilter } from '@/lib/role-guard';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') ?? '';
    const source = searchParams.get('source') ?? '';
    const where: any = { ...ownershipFilter(user) };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' as any } },
        { lastName: { contains: search, mode: 'insensitive' as any } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' as any } },
      ];
    }
    if (status) where.status = status;
    if (source) where.source = source;
    const managerId = searchParams.get('managerId') ?? '';
    if (managerId) where.assignedToId = managerId;
    const leads = await prisma.lead.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 100,
      include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
    });
    return NextResponse.json(leads);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    // ─── Auto-distribution: pick agent from LeadDistributionRule ───
    let resolvedAssignee = body.assignedToId || null;
    if (!resolvedAssignee) {
      try {
        const rules = await prisma.leadDistributionRule.findMany({
          where: { isActive: true },
          orderBy: { priority: 'desc' },
        });
        const src = body.source ?? 'manual';
        const dist = body.districts ?? null;
        const pType = body.propertyType ?? null;
        const nType = body.needType ?? 'buy';
        for (const rule of rules) {
          const matchSource = !rule.source || rule.source === src;
          const matchDistrict = !rule.district || rule.district === dist;
          const matchPropType = !rule.propertyType || rule.propertyType === pType;
          const matchNeedType = !rule.needType || rule.needType === nType;
          if (matchSource && matchDistrict && matchPropType && matchNeedType) {
            resolvedAssignee = rule.assignToId;
            break;
          }
        }
      } catch (_) { /* fallback to current user */ }
    }
    if (!resolvedAssignee) resolvedAssignee = user.id;

    const lead = await prisma.lead.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName ?? null,
        email: body.email ?? null,
        phone: body.phone,
        source: body.source ?? 'manual',
        needType: body.needType ?? 'buy',
        budget: body.budget ? parseFloat(body.budget) : null,
        budgetMax: body.budgetMax ? parseFloat(body.budgetMax) : null,
        districts: body.districts ?? null,
        propertyType: body.propertyType ?? null,
        notes: body.notes ?? null,
        priority: body.priority ?? 'medium',
        assignedToId: resolvedAssignee,
      },
    });
    const autoAssigned = resolvedAssignee !== user.id && resolvedAssignee !== body.assignedToId;
    logActivity({ entityType: 'lead', entityId: lead.id, action: 'create', details: `Створено лід: ${lead.firstName} ${lead.lastName ?? ''}${autoAssigned ? ' (авто-розподіл)' : ''}`, userId: user.id });
    return NextResponse.json(lead);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
