import emojiSaveAssets from '@/data/emojisave-assets.json';

const EMOJISAVE_PLATFORM_ASSETS = {
  fluent: { sourcePlatform: 'microsoft-3D-fluent', webpSize: 'webp-256' },
  nato: { sourcePlatform: 'google', webpSize: 'webp-256' },
  apple: { sourcePlatform: 'apple', webpSize: 'webp-160' },
  microsoft: { sourcePlatform: 'microsoft', webpSize: 'webp-256' },
  twitter: { sourcePlatform: 'twitter', webpSize: 'webp-256' },
} as const;

export type EmojiSavePlatform = keyof typeof EMOJISAVE_PLATFORM_ASSETS;

const availableWebpSlugs = Object.fromEntries(
  Object.entries(emojiSaveAssets.webp).map(([platform, slugs]) => [platform, new Set(slugs)])
) as Record<EmojiSavePlatform, Set<string>>;

const availablePngSlugs = Object.fromEntries(
  Object.entries(emojiSaveAssets.png).map(([platform, slugs]) => [platform, new Set(slugs)])
) as Record<EmojiSavePlatform, Set<string>>;

/**
 * Emoji Save keeps the source platform and the emoji slug in the object key.
 * The importer preserves that layout so these URLs can be derived without a
 * generated manifest in the application bundle.
 */
export function getEmojiSaveAssetPath(platform: EmojiSavePlatform, emojiId: string): string {
  const { sourcePlatform, webpSize } = EMOJISAVE_PLATFORM_ASSETS[platform];
  return `${sourcePlatform}/${webpSize}/${sourcePlatform}-${emojiId}.webp`;
}

export function getEmojiSavePngAssetPath(platform: EmojiSavePlatform, emojiId: string): string {
  const { sourcePlatform } = EMOJISAVE_PLATFORM_ASSETS[platform];
  return `${sourcePlatform}/png/${sourcePlatform}-${emojiId}.png`;
}

export function hasEmojiSaveWebpAsset(platform: EmojiSavePlatform, emojiId: string): boolean {
  return availableWebpSlugs[platform]?.has(emojiId) ?? false;
}

export function hasEmojiSavePngAsset(platform: EmojiSavePlatform, emojiId: string): boolean {
  return availablePngSlugs[platform]?.has(emojiId) ?? false;
}
