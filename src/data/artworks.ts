import { Artwork } from '@/types/artwork';

export const artworks: Artwork[] = [];

export function getArtworkById(id: string): Artwork | undefined {
  return artworks.find(artwork => artwork.id === id);
}

export function getAvailableArtworks(): Artwork[] {
  return artworks.filter(a => a.status === 'available');
}

export function getFeaturedArtworks(): Artwork[] {
  return artworks.filter(a => a.featured && a.status === 'available');
}