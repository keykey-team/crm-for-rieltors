export function formatPriceChange(previous: number, current: number, currency = 'USD') {
  const diff = current - previous;
  const percent = previous ? (diff / previous) * 100 : 0;
  const sign = diff > 0 ? '+' : diff < 0 ? '-' : '±';
  const absolute = Math.abs(diff).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const percentLabel = `${sign}${Math.abs(percent).toFixed(1)}%`;
  return `${percentLabel} (${sign}${absolute} ${currency})`;
}
