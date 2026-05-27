export interface ExchangeRate {
  rate: number;
  date: string;
}

export async function getExchangeRate(): Promise<ExchangeRate | null> {
  const res = await fetch('/api/exchange-rate');
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.rate) return null;
  return { rate: data.rate, date: data.date };
}
