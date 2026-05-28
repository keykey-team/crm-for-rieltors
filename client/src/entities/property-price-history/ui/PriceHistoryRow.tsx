'use client';

import { formatPriceChange } from '../lib/formatPriceChange';
import type { PropertyPricePoint } from '../model/types';

export function PriceHistoryRow({ item, previous, t }: { item: PropertyPricePoint; previous?: PropertyPricePoint; t: (k: string) => string }) {
  return (
    <tr className="border-b border-border/40 text-sm">
      <td className="py-2 pr-2">{new Date(item.createdAt).toLocaleDateString()}</td>
      <td className="py-2 pr-2 font-medium">{item.price.toLocaleString('en-US')} {item.currency}</td>
      <td className="py-2 pr-2 text-muted-foreground">{item.reason || t('priceHistory.reason.manual')}</td>
      <td className="py-2 text-xs text-muted-foreground">
        {previous ? formatPriceChange(previous.price, item.price, item.currency) : t('priceHistory.initialPoint')}
      </td>
    </tr>
  );
}
