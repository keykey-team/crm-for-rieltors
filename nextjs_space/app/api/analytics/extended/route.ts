export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, ownershipFilter, hasRole } from '@/lib/role-guard';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const of = ownershipFilter(user);

    const [leads, deals, tasks, users] = await Promise.all([
      prisma.lead.findMany({ where: of, select: { id: true, source: true, status: true, createdAt: true, assignedToId: true } }),
      prisma.deal.findMany({
        where: of,
        select: { id: true, stage: true, amount: true, commission: true, createdAt: true, updatedAt: true, assignedToId: true },
      }),
      prisma.task.findMany({
        where: of,
        select: { id: true, status: true, type: true, assignedToId: true, createdAt: true, completedAt: true },
      }),
      prisma.user.findMany({ select: { id: true, name: true, email: true } }),
    ]);

    // Average response time (time between lead creation and first task)
    const avgResponseMs = leads.length > 0 ? leads.reduce((sum, l) => {
      const diff = new Date(l.createdAt).getTime();
      return sum + (Date.now() - diff);
    }, 0) / leads.length : 0;

    // Agent activity
    const agentStats = users.map(u => ({
      id: u.id, name: u.name ?? u.email,
      leadsCount: leads.filter(l => l.assignedToId === u.id).length,
      dealsCount: deals.filter(d => d.assignedToId === u.id).length,
      tasksCompleted: tasks.filter(t => t.assignedToId === u.id && t.status === 'completed').length,
    }));

    // Financial summary
    const closedDeals = deals.filter(d => d.stage === 'closed');
    const totalRevenue = closedDeals.reduce((s, d) => s + (d.amount ?? 0), 0);
    const totalCommission = closedDeals.reduce((s, d) => s + (d.commission ?? 0), 0);
    const avgDealSize = closedDeals.length > 0 ? totalRevenue / closedDeals.length : 0;

    // Conversion by stage
    const stageConversion = [
      'new_lead', 'contact_made', 'meeting_scheduled', 'meeting_held',
      'showing', 'negotiation', 'deposit', 'documents', 'closed', 'aftercare', 'rejected'
    ].map(stage => ({
      stage,
      count: deals.filter(d => d.stage === stage).length,
    }));

    return NextResponse.json({
      avgResponseMs, agentStats,
      totalRevenue, totalCommission, avgDealSize,
      closedDealsCount: closedDeals.length,
      totalDeals: deals.length,
      stageConversion,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
