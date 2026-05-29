import type { PropertyPricePoint } from '../model/types';

export type PriceTrend = 'up' | 'down' | 'stable';

export function calculatePriceTrend(items: PropertyPricePoint[], depth = 2): PriceTrend {
  const sorted = [...items]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-Math.max(2, depth));
  if (sorted.length < 2) return 'stable';
  const first = sorted[0].price;
  const last = sorted[sorted.length - 1].price;
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'stable';
}
