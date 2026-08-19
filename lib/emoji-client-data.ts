import { expandEmojiIndex, type CompactEmojiIndex, type Emoji, type EmojiIndex, type PlatformType } from '@/types/emoji';

export function parseClientEmojiIndex(data: CompactEmojiIndex | EmojiIndex): EmojiIndex {
  return 'e' in data ? expandEmojiIndex(data) : data;
}

export interface EmojiSaveAssetIndex {
  webp: Record<string, string[]>;
  png: Record<string, string[]>;
}

const assetConfig = {
  fluent: { sourcePlatform: 'microsoft-3D-fluent', webpSize: 'webp-256' },
  nato: { sourcePlatform: 'google', webpSize: 'webp-256' },
  apple: { sourcePlatform: 'apple', webpSize: 'webp-160' },
  microsoft: { sourcePlatform: 'microsoft', webpSize: 'webp-256' },
  twitter: { sourcePlatform: 'twitter', webpSize: 'webp-256' },
} as const;

export function hasClientWebpAsset(
  assets: EmojiSaveAssetIndex,
  platform: PlatformType,
  emojiId: string
) {
  return assets.webp?.[platform]?.includes(emojiId) ?? false;
}

export function hasClientPngAsset(
  assets: EmojiSaveAssetIndex,
  platform: PlatformType,
  emojiId: string
) {
  return assets.png?.[platform]?.includes(emojiId) ?? false;
}

export function getClientAssetPath(platform: PlatformType, emojiId: string) {
  const config = assetConfig[platform as keyof typeof assetConfig];
  if (!config) return '';
  return `${config.sourcePlatform}/${config.webpSize}/${config.sourcePlatform}-${emojiId}.webp`;
}

export function getClientPngAssetPath(platform: PlatformType, emojiId: string) {
  const config = assetConfig[platform as keyof typeof assetConfig];
  if (!config) return '';
  return `${config.sourcePlatform}/png/${config.sourcePlatform}-${emojiId}.png`;
}

export function getClientEmojiDataForPlatform(
  platform: PlatformType,
  baseIndex: EmojiIndex,
  assets: EmojiSaveAssetIndex
): EmojiIndex {
  if (platform === 'unicode') {
    const emojis = baseIndex.emojis.map((emoji) => ({ ...emoji, styles: {} }));
    return { ...baseIndex, emojis, totalCount: emojis.length };
  }

  const config = assetConfig[platform as keyof typeof assetConfig];
  if (!config) return baseIndex;

  const styleKey = platform === 'fluent' ? '3d' : 'color';
  const emojis = baseIndex.emojis.map((emoji) => {
    if (!hasClientWebpAsset(assets, platform, emoji.id)) return emoji;
    return {
      ...emoji,
      styles: {
        ...(platform === 'fluent' ? emoji.styles : {}),
        [styleKey]: getClientAssetPath(platform, emoji.id),
      },
    };
  });

  return { ...baseIndex, emojis, totalCount: emojis.length };
}

export function filterClientPlatformEmojis(
  emojis: Emoji[],
  platform: PlatformType,
  assets: EmojiSaveAssetIndex
) {
  return emojis.filter((emoji) =>
    emoji.listVisibility !== 'variant' &&
    (platform === 'unicode' || hasClientWebpAsset(assets, platform, emoji.id))
  );
}
