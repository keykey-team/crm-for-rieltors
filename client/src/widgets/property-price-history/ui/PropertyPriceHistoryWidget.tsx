'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PriceHistoryRow, usePriceHistory } from '@/entities/property-price-history';

export function PropertyPriceHistoryWidget({ propertyId, t }: { propertyId: string; t: (k: string) => string }) {
  const { items, stats, loading } = usePriceHistory(propertyId);
  const chartData = [...items].reverse().map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString(),
    price: item.price,
  }));

  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <h3 className="mb-3 text-sm font-semibold">{t('priceHistory.title')}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis width={70} />
            <Tooltip />
            <Line dataKey="price" stroke="#0f766e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span>{t('priceHistory.min')}: {stats?.min?.toFixed(2) ?? '-'}</span>
        <span>{t('priceHistory.max')}: {stats?.max?.toFixed(2) ?? '-'}</span>
        <span>{t('priceHistory.avg')}: {stats?.avg?.toFixed(2) ?? '-'}</span>
        <span>{t('priceHistory.daysOnMarket')}: {stats?.daysOnMarket ?? '-'}</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead><tr className="text-left text-xs text-muted-foreground"><th>{t('priceHistory.date')}</th><th>{t('priceHistory.price')}</th><th>{t('priceHistory.reason')}</th><th>{t('priceHistory.change')}</th></tr></thead>
          <tbody>{loading ? null : items.map((item, index) => <PriceHistoryRow key={item.id} item={item} previous={items[index + 1]} t={t} />)}</tbody>
        </table>
      </div>
    </div>
  );
}
