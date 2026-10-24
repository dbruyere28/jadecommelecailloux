import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Artwork } from '@/types/artwork';

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
    const body = await req.json();
    const { artwork, action } = body;

    if (action === 'delete') {
      const { id, isStatic } = body;
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

      if (artworks.some(a => a.id === id)) {
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

    // Create or update artwork
    const newArtwork = artwork as Artwork;
    
    // Get current artworks
    const currentArtworks = await kv.get<Artwork[]>(ARTWORKS_KEY) || [];
    
    // Check if editing existing
    const existingIndex = currentArtworks.findIndex(a => a.id === newArtwork.id);
    let updatedArtworks: Artwork[];
    
    if (existingIndex >= 0) {
      updatedArtworks = currentArtworks.map(a => a.id === newArtwork.id ? newArtwork : a);
    } else {
      // New artwork
      updatedArtworks = [newArtwork, ...currentArtworks];
    }

    await kv.set(ARTWORKS_KEY, updatedArtworks);
    return NextResponse.json({ success: true, artwork: newArtwork });
  } catch (error) {
    console.error('Error saving artwork:', error);
    return NextResponse.json({ error: 'Failed to save artwork' }, { status: 500 });
  }
}