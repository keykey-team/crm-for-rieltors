import { isAdminRole } from '../../../common/shared-kernel/roles';
import { findAnalyticsRecords } from '../repositories/analytics.repository';

const STAGES = [
  'new_lead',
  'contact_made',
  'meeting_scheduled',
  'meeting_held',
  'showing',
  'negotiation',
  'deposit',
  'documents',
  'closed',
  'aftercare',
  'rejected',
];

function ownership(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { assignedToId: userId };
}

function dateFilter(query: Record<string, unknown>) {
  const filter: Record<string, Date> = {};
  if (typeof query.from === 'string' && query.from) filter.gte = new Date(query.from);
  if (typeof query.to === 'string' && query.to) filter.lte = new Date(query.to);
  return filter;
}

export async function getExtendedAnalytics(query: Record<string, unknown>, userId?: string, role?: string) {
  const [leads, deals, tasks, users] = await findAnalyticsRecords(ownership(role, userId), dateFilter(query));
  const avgResponseMs = leads.length
    ? leads.reduce((sum, lead) => sum + (Date.now() - new Date(lead.createdAt).getTime()), 0) / leads.length
    : 0;
  const agentStats = users.map((user) => ({
    id: user.id,
    name: user.name ?? user.email,
    leadsCount: leads.filter((lead) => lead.assignedToId === user.id).length,
    dealsCount: deals.filter((deal) => deal.assignedToId === user.id).length,
    tasksCompleted: tasks.filter((task) => task.assignedToId === user.id && task.status === 'completed').length,
  }));
  const closedDeals = deals.filter((deal) => deal.stage === 'closed');
  const totalRevenue = closedDeals.reduce((sum, deal) => sum + (deal.amount ?? 0), 0);
  const totalCommission = closedDeals.reduce((sum, deal) => sum + (deal.commission ?? 0), 0);

  return {
    avgResponseMs,
    agentStats,
    totalRevenue,
    totalCommission,
    avgDealSize: closedDeals.length ? totalRevenue / closedDeals.length : 0,
    closedDealsCount: closedDeals.length,
    totalDeals: deals.length,
    stageConversion: STAGES.map((stage) => ({ stage, count: deals.filter((deal) => deal.stage === stage).length })),
  };
}
