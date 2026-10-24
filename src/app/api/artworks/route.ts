import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Artwork } from '@/types/artwork';
import { secureStringEqual } from '@/lib/maintenance-auth.server';
import { sameArtworkText, translateArtworkCollection } from '@/lib/deepl.server';

const ARTWORKS_KEY = 'artworks_catalog';
const DELETED_KEY = 'artworks_deleted';

export async function GET() {
  try {
    const [artworks, deletedIds] = await Promise.all([
      kv.get<Artwork[]>(ARTWORKS_KEY),
      kv.get<string[]>(DELETED_KEY),
    ]);

    const artworksList = artworks || [];
    const deletedIdsSet = new Set(deletedIds || []);

    // Filter out deleted static artworks
    const filteredArtworks = artworksList.filter(a => !deletedIdsSet.has(a.id));

    return NextResponse.json({ artworks: filteredArtworks });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: {
      artwork?: Artwork;
      action?: string;
      id?: string;
      adminPassword?: string;
    } = await req.json();
    const { artwork, action } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin password is not configured' }, { status: 503 });
    }
    if (!secureStringEqual(body.adminPassword, adminPassword)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    if (action === 'delete') {
      const id = body.id || artwork?.id;
      if (!id) {
        return NextResponse.json({ error: 'Missing artwork ID' }, { status: 400 });
      }

      // Get current data
      const [artworks, deletedIds] = await Promise.all([
        kv.get<Artwork[]>(ARTWORKS_KEY),
        kv.get<string[]>(DELETED_KEY),
      ]);

      const artworksList = artworks || [];
      const deletedIdsSet = new Set(deletedIds || []);

      if (artworksList.some(a => a.id === id)) {
        // Static artwork - mark as deleted
        deletedIdsSet.add(id);
      } else {
        // User artwork - remove from list
        const filtered = artworksList.filter(a => a.id !== id);
        await kv.set(ARTWORKS_KEY, filtered);
      }

      await kv.set(DELETED_KEY, Array.from(deletedIdsSet));
      return NextResponse.json({ success: true });
    }

    if ((action !== 'create' && action !== 'update') || !artwork?.id) {
      return NextResponse.json({ error: 'Invalid artwork action' }, { status: 400 });
    }

    const currentArtworks = await kv.get<Artwork[]>(ARTWORKS_KEY) || [];
    const existingIndex = currentArtworks.findIndex(a => a.id === artwork.id);
    const existingArtwork = existingIndex >= 0 ? currentArtworks[existingIndex] : undefined;
    const textUnchanged = existingArtwork ? sameArtworkText(existingArtwork, artwork) : false;
    let artworkToSave: Artwork = {
      ...artwork,
      translations: textUnchanged ? existingArtwork?.translations : undefined,
    };
    let translationsGenerated = false;
    let translationWarning: string | undefined;

    if (!textUnchanged) {
      if (!process.env.DEEPL_AUTH_KEY) {
        translationWarning = 'Artwork saved, but DEEPL_AUTH_KEY is not configured; translations were not generated.';
      } else {
        try {
          [artworkToSave] = await translateArtworkCollection([artworkToSave]);
          translationsGenerated = true;
        } catch (translationError) {
          console.error('Automatic artwork translation failed:', translationError);
          translationWarning = 'Artwork saved in French, but automatic translations failed.';
        }
      }
    }

    const updatedArtworks = existingIndex >= 0
      ? currentArtworks.map(a => a.id === artworkToSave.id ? artworkToSave : a)
      : [artworkToSave, ...currentArtworks];

    await kv.set(ARTWORKS_KEY, updatedArtworks);
    return NextResponse.json({
      success: true,
      artwork: artworkToSave,
      translationsGenerated,
      translationWarning,
    });
  } catch (error) {
    console.error('Error saving artwork:', error);
    return NextResponse.json({ error: 'Failed to save artwork' }, { status: 500 });
  }
}
