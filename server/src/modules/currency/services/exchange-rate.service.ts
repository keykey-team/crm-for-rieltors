import { ExchangeRateDto } from '../models/exchange-rate.dto';

let exchangeRateCache: ExchangeRateDto | null = null;

export async function getUsdExchangeRate(): Promise<ExchangeRateDto> {
  if (exchangeRateCache && Date.now() - exchangeRateCache.fetchedAt < 60 * 60 * 1000) {
    return exchangeRateCache;
  }

  try {
    const response = await fetch(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=USD',
    );
    if (!response.ok) throw new Error('NBU API error');

    const data = (await response.json()) as { rate?: number; exchangedate?: string }[];
    const usdRate = data?.[0]?.rate;
    const exchangeDate = data?.[0]?.exchangedate;
    if (!usdRate || !exchangeDate) throw new Error('No rate data');

    exchangeRateCache = { rate: usdRate, date: exchangeDate, fetchedAt: Date.now() };
    return exchangeRateCache;
  } catch (err) {
    if (exchangeRateCache) return { ...exchangeRateCache, stale: true };
    throw err;
  }
}

