'use client';

import { calculatePriceTrend } from '../lib/calculatePriceTrend';
import type { PropertyPricePoint } from '../model/types';

const trendView = {
  up: { symbol: '↑', cls: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
  down: { symbol: '↓', cls: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  stable: { symbol: '=', cls: 'text-muted-foreground bg-muted' },
} as const;

export function PriceHistoryBadge({ items, t }: { items: PropertyPricePoint[]; t: (k: string) => string }) {
  const trend = calculatePriceTrend(items);
  const view = trendView[trend];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${view.cls}`}>
      <span>{view.symbol}</span>
      <span>{t(`priceHistory.trend.${trend}`)}</span>
    </span>
  );
}
