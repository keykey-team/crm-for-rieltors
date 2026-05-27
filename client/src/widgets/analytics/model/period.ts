export type Period = 'week' | 'month' | 'quarter' | 'year' | 'all';

export function getPeriodDates(period: Period): { from?: string; to?: string } {
  if (period === 'all') return {};

  const now = new Date();
  const to = now.toISOString();
  const fromDate = new Date(now);

  if (period === 'week') fromDate.setDate(fromDate.getDate() - 7);
  else if (period === 'month') fromDate.setMonth(fromDate.getMonth() - 1);
  else if (period === 'quarter') fromDate.setMonth(fromDate.getMonth() - 3);
  else if (period === 'year') fromDate.setFullYear(fromDate.getFullYear() - 1);

  return { from: fromDate.toISOString(), to };
}
