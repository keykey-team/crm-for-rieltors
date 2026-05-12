import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let cache: { rate: number; date: string; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    // Return cached if fresh
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return NextResponse.json(cache);
    }

    // Fetch from NBU API
    const res = await fetch(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=USD',
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error('NBU API error');

    const data = await res.json();
    // Response: [{"r030":840,"txt":"Долар США","rate":41.2345,"cc":"USD","exchangedate":"07.05.2026"}]
    const usdRate = data?.[0]?.rate;
    const exchangeDate = data?.[0]?.exchangedate;

    if (!usdRate) throw new Error('No rate data');

    cache = {
      rate: usdRate,
      date: exchangeDate,
      fetchedAt: Date.now(),
    };

    return NextResponse.json(cache);
  } catch (err: any) {
    // Return stale cache if available
    if (cache) {
      return NextResponse.json({ ...cache, stale: true });
    }
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch rate' }, { status: 500 });
  }
}
