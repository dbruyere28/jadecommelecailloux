import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Artwork } from '@/types/artwork';
import { secureStringEqual } from '@/lib/maintenance-auth.server';
import { translateArtworkCollection } from '@/lib/deepl.server';

const ARTWORKS_KEY = 'artworks_catalog';

export async function POST(request: NextRequest) {
  let body: { adminPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !secureStringEqual(body.adminPassword, adminPassword)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  if (!process.env.DEEPL_AUTH_KEY) {
    return NextResponse.json({ error: 'DEEPL_AUTH_KEY is not configured' }, { status: 503 });
  }

  try {
    const artworks = await kv.get<Artwork[]>(ARTWORKS_KEY) || [];
    const needsTranslation = artworks.filter((artwork) => !artwork.translations?.en || !artwork.translations?.de);
    if (!needsTranslation.length) {
      return NextResponse.json({ translated: 0, total: artworks.length });
    }

    const translated = await translateArtworkCollection(needsTranslation);
    const translatedById = new Map(translated.map((artwork) => [artwork.id, artwork]));
    const updatedArtworks = artworks.map((artwork) => translatedById.get(artwork.id) ?? artwork);
    await kv.set(ARTWORKS_KEY, updatedArtworks);

    return NextResponse.json({ translated: translated.length, total: artworks.length });
  } catch (error) {
    console.error('Existing artwork translation failed:', error);
    return NextResponse.json({ error: 'Could not translate existing artworks' }, { status: 502 });
  }
}
