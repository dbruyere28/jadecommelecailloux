import { kv } from '@vercel/kv';
import { connection, NextResponse } from 'next/server';

interface CachedExchangeRate {
  usdPerEur: number;
  date: string;
  fetchedAt: number;
}

const EXCHANGE_RATE_KEY = 'eur_usd_daily_rate';
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function GET() {
  await connection();
  let cached: CachedExchangeRate | null = null;

  try {
    cached = await kv.get<CachedExchangeRate>(EXCHANGE_RATE_KEY);
    if (cached && Date.now() - cached.fetchedAt < REFRESH_AFTER_MS) {
      return NextResponse.json(
        { usdPerEur: cached.usdPerEur, date: cached.date },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const response = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD', {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Exchange rate service returned ${response.status}`);

    const data: { date?: string; rates?: { USD?: number } } = await response.json();
    const usdPerEur = data.rates?.USD;
    if (!data.date || !usdPerEur || !Number.isFinite(usdPerEur)) {
      throw new Error('Exchange rate response is incomplete');
    }

    const nextRate: CachedExchangeRate = {
      usdPerEur,
      date: data.date,
      fetchedAt: Date.now(),
    };
    await kv.set(EXCHANGE_RATE_KEY, nextRate, { ex: CACHE_TTL_SECONDS });

    return NextResponse.json(
      { usdPerEur, date: data.date },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Unable to load EUR/USD exchange rate:', error);
    if (cached && Number.isFinite(cached.usdPerEur)) {
      return NextResponse.json(
        { usdPerEur: cached.usdPerEur, date: cached.date, stale: true },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }
    return NextResponse.json({ error: 'Exchange rate unavailable' }, { status: 503 });
  }
}
