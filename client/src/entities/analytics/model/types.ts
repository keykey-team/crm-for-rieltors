export interface AnalyticsExtended {
  totalRevenue?: number;
  totalCommission?: number;
  avgDealSize?: number;
  closedDealsCount?: number;
  totalDeals?: number;
  agentStats?: Array<{ id: string; name: string; leadsCount: number; dealsCount: number; tasksCompleted: number }>;
}

export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';
