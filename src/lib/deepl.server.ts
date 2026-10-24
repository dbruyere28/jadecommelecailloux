import 'server-only';

import { Artwork, ArtworkTranslation } from '@/types/artwork';

type TranslatableField = 'title' | 'description' | 'technique' | 'category' | 'tag';
type DeepLTarget = 'EN-GB' | 'DE';

interface TranslationEntry {
  artworkIndex: number;
  field: TranslatableField;
  tagIndex?: number;
  text: string;
}

function getDeepLEndpoint(authKey: string) {
  return authKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';
}

async function translateTexts(texts: string[], targetLang: DeepLTarget, authKey: string) {
  const translations: string[] = [];
  const endpoint = getDeepLEndpoint(authKey);

  for (let index = 0; index < texts.length; index += 50) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${authKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texts.slice(index, index + 50),
        target_lang: targetLang,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`DeepL translation failed with status ${response.status}`);
    }

    const data: { translations?: Array<{ text?: string }> } = await response.json();
    if (!data.translations || data.translations.length !== Math.min(50, texts.length - index)) {
      throw new Error('DeepL returned an incomplete translation batch');
    }
    translations.push(...data.translations.map((item) => item.text || ''));
  }

  return translations;
}

function applyTranslations(
  artwork: Artwork,
  artworkIndex: number,
  entries: TranslationEntry[],
  translatedTexts: string[]
): ArtworkTranslation {
  const translation: ArtworkTranslation = {};
  const tags = artwork.tags ? [...artwork.tags] : [];

  entries.forEach((entry, index) => {
    if (entry.artworkIndex !== artworkIndex) return;
    const text = translatedTexts[index];
    if (entry.field === 'tag' && entry.tagIndex !== undefined) {
      tags[entry.tagIndex] = text;
    } else if (entry.field !== 'tag') {
      translation[entry.field] = text;
    }
  });

  if (artwork.tags?.length) translation.tags = tags;
  return translation;
}

export async function translateArtworkCollection(artworks: Artwork[]): Promise<Artwork[]> {
  const authKey = process.env.DEEPL_AUTH_KEY;
  if (!authKey) throw new Error('DEEPL_AUTH_KEY is not configured');

  const entries: TranslationEntry[] = [];
  artworks.forEach((artwork, artworkIndex) => {
    const add = (field: TranslatableField, value?: string, tagIndex?: number) => {
      if (value?.trim()) entries.push({ artworkIndex, field, tagIndex, text: value });
    };

    add('title', artwork.title);
    add('description', artwork.description);
    add('technique', artwork.technique);
    add('category', artwork.category);
    artwork.tags?.forEach((tag, tagIndex) => add('tag', tag, tagIndex));
  });

  if (!entries.length) return artworks;

  const sourceTexts = entries.map((entry) => entry.text);
  const [english, german] = await Promise.all([
    translateTexts(sourceTexts, 'EN-GB', authKey),
    translateTexts(sourceTexts, 'DE', authKey),
  ]);

  return artworks.map((artwork, index) => ({
    ...artwork,
    translations: {
      ...artwork.translations,
      en: applyTranslations(artwork, index, entries, english),
      de: applyTranslations(artwork, index, entries, german),
    },
  }));
}

export function sameArtworkText(a: Artwork, b: Artwork) {
  return a.title === b.title &&
    a.description === b.description &&
    a.technique === b.technique &&
    a.category === b.category &&
    JSON.stringify(a.tags ?? []) === JSON.stringify(b.tags ?? []);
}
