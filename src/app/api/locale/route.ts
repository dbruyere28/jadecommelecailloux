import { NextRequest, NextResponse } from 'next/server';
import { localeFromGeo, SiteLocale } from '@/lib/messages';

const LOCALE_COOKIE = 'site_locale';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isSupportedLocale(value: unknown): value is SiteLocale {
  return value === 'fr' || value === 'en' || value === 'de';
}

export async function GET(request: NextRequest) {
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(savedLocale)
    ? savedLocale
    : localeFromGeo(request.headers.get('x-vercel-ip-country'), request.headers.get('accept-language'));
  return NextResponse.json({ locale }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  let body: { locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid locale request' }, { status: 400 });
  }

  if (!isSupportedLocale(body.locale)) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
  }

  const response = NextResponse.json({ locale: body.locale });
  response.cookies.set(LOCALE_COOKIE, body.locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });
  return response;
}
