import { Artwork } from '@/types/artwork';
import { SiteLocale } from '@/lib/messages';

export function localizeArtwork(artwork: Artwork, locale: SiteLocale): Artwork {
  if (locale === 'fr') return artwork;

  const translation = artwork.translations?.[locale];
  if (!translation) return artwork;

  return {
    ...artwork,
    title: translation.title || artwork.title,
    description: translation.description || artwork.description,
    technique: translation.technique || artwork.technique,
    category: translation.category || artwork.category,
    tags: translation.tags?.length ? translation.tags : artwork.tags,
  };
}
