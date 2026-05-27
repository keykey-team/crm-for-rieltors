"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtendedAnalytics = getExtendedAnalytics;
const roles_1 = require("../../../common/shared-kernel/roles");
const analytics_repository_1 = require("../repositories/analytics.repository");
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
function ownership(role, userId) {
    return (0, roles_1.isAdminRole)(role) ? {} : { assignedToId: userId };
}
function dateFilter(query) {
    const filter = {};
    if (typeof query.from === 'string' && query.from)
        filter.gte = new Date(query.from);
    if (typeof query.to === 'string' && query.to)
        filter.lte = new Date(query.to);
    return filter;
}
async function getExtendedAnalytics(query, userId, role) {
    const [leads, deals, tasks, users] = await (0, analytics_repository_1.findAnalyticsRecords)(ownership(role, userId), dateFilter(query));
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
