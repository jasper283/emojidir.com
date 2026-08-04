import emojiSeoData from '@/data/emoji-seo.json';
import type { EmojiSeoData } from '@/types/emoji';

interface EmojiSeoIndex {
  emojis: Record<string, EmojiSeoData>;
}

const seoIndex = emojiSeoData as EmojiSeoIndex;

/** Return the generated Unicode/CLDR SEO fields for an Emoji id. */
export function getEmojiSeoData(id: string): EmojiSeoData | undefined {
  return seoIndex.emojis[id];
}

/** Return CLDR keywords for a locale, falling back to English. */
export function getEmojiSeoKeywords(id: string, locale: string): string[] {
  const data = getEmojiSeoData(id);
  if (!data) return [];
  return data.keywords[locale] ?? data.keywords.en ?? [];
}
