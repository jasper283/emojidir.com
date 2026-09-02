import assetsData from '@/data/emojisave-assets.json';
import emojiSeoData from '@/data/emoji-seo.json';
import { getFirstEmojiAssetPath } from '@/lib/emoji-assets';
import {
  getClientEmojiDataForPlatform,
  getClientPngAssetPath,
  hasClientPngAsset,
  type EmojiSaveAssetIndex,
} from '@/lib/emoji-client-data';
import { loadEmojiIndexServer } from '@/lib/emoji-server';
import { getEmojipediaEmojiData } from '@/lib/emojipedia';
import { VISIBLE_PLATFORM_CONFIGS } from '@/lib/platforms';
import type { EmojiSeoData, PlatformType } from '@/types/emoji';
import type { EmojiDetailData } from '@/types/emoji-detail';

interface EmojiSeoIndex {
  emojis: Record<string, EmojiSeoData>;
}

const seoIndex = emojiSeoData as EmojiSeoIndex;
const assets = assetsData as EmojiSaveAssetIndex;

/** Load all data needed to statically render one emoji detail page. */
export async function loadEmojiDetailServer(
  locale: string,
  platformSlug: string,
  slug: string,
): Promise<EmojiDetailData | null> {
  const platform = platformSlug.replace('-emoji', '') as PlatformType;
  const localizedIndex = await loadEmojiIndexServer(locale);
  const emojiData = getClientEmojiDataForPlatform(platform, localizedIndex, assets);
  const emoji = emojiData.emojis.find((candidate) => candidate.id === decodeURIComponent(slug));

  if (!emoji) return null;

  const platforms = Object.keys(VISIBLE_PLATFORM_CONFIGS) as PlatformType[];
  const otherPlatforms = platforms
    .filter((candidatePlatform) => candidatePlatform !== platform)
    .map((candidatePlatform) => {
      const platformData = getClientEmojiDataForPlatform(candidatePlatform, localizedIndex, assets);
      const platformEmoji = platformData.emojis.find((candidate) => candidate.id === emoji.id);
      return { platform: candidatePlatform, emoji: platformEmoji, name: candidatePlatform };
    })
    .filter((item) => item.emoji && Object.values(item.emoji.styles).some(Boolean));

  const variantRootId = emoji.variantOf || emoji.id;
  const variantEmojis = emojiData.emojis
    .filter((candidate) =>
      candidate.id !== emoji.id &&
      (candidate.id === variantRootId || candidate.variantOf === variantRootId)
    )
    .sort((a, b) => {
      if (a.id === variantRootId) return -1;
      if (b.id === variantRootId) return 1;
      return a.name.localeCompare(b.name);
    });

  return {
    emoji,
    seoData: seoIndex.emojis[emoji.id],
    emojipediaData: getEmojipediaEmojiData(emoji.id, locale),
    otherPlatforms,
    variantEmojis,
    pngAssetPath: hasClientPngAsset(assets, platform, emoji.id)
      ? getClientPngAssetPath(platform, emoji.id)
      : undefined,
    platform,
  };
}

export function getEmojiDetailImagePath(detail: EmojiDetailData): string | undefined {
  return getFirstEmojiAssetPath(detail.emoji.styles) || undefined;
}
