import emojipediaData from '@/data/emojipedia-emoji.json';
import type { EmojipediaEmojiData, EmojipediaLocalizedContent } from '@/types/emoji';

interface EmojipediaIndex {
  emojis: EmojipediaEmojiData[];
}

const data = emojipediaData as EmojipediaIndex;
const emojisBySlug = new Map(
  data.emojis
    .filter((emoji) => emoji.slug)
    .map((emoji) => [emoji.slug as string, emoji])
);

function hasLocalizedText(content: EmojipediaLocalizedContent): boolean {
  return Boolean(content.meaning || content.commonUses.length > 0 || content.usageNotes.length > 0);
}

function getLocalizedEmojiName(emoji: EmojipediaEmojiData, locale: string): string | null {
  if (locale === 'en') return emoji.name;
  return emoji.localizedContent?.[locale]?.name || emoji.name;
}

function getLocalizedRelatedEmojis(
  emoji: EmojipediaEmojiData,
  locale: string
): EmojipediaEmojiData['relatedEmojis'] {
  return emoji.relatedEmojis.map((relatedEmoji) => {
    const relatedEmojiData = emojisBySlug.get(relatedEmoji.slug);
    return {
      ...relatedEmoji,
      name: relatedEmojiData ? getLocalizedEmojiName(relatedEmojiData, locale) : relatedEmoji.name ?? null,
    };
  });
}

/** Return Emojipedia content for an Emoji slug, localized when crawl data exists. */
export function getEmojipediaEmojiData(id: string, locale = 'en'): EmojipediaEmojiData | undefined {
  const emoji = emojisBySlug.get(id);
  if (!emoji) return undefined;

  const relatedEmojis = getLocalizedRelatedEmojis(emoji, locale);
  if (locale === 'en') return { ...emoji, relatedEmojis };

  const localized = emoji.localizedContent?.[locale];
  if (!localized || !hasLocalizedText(localized)) return { ...emoji, relatedEmojis };

  return {
    ...emoji,
    name: localized.name || emoji.name,
    meaning: localized.meaning,
    commonUses: localized.commonUses,
    usageNotes: localized.usageNotes,
    relatedEmojis,
    sourceUrl: localized.sourceUrl || emoji.sourceUrl,
  };
}
