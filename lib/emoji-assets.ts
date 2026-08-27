import type { EmojiStyles, StyleType } from '@/types/emoji';

const STANDARD_STYLES: StyleType[] = ['3d', 'color', 'flat', 'high-contrast'];
const ASSET_FILE_PATTERN = /\.(?:png|svg|webp)(?:[?#].*)?$/i;

/** Return true only for a path that identifies a concrete image file. */
export function isEmojiAssetPath(path: string | undefined): path is string {
  return Boolean(path && ASSET_FILE_PATTERN.test(path));
}

/** Resolve a requested style, preferring its direct asset over its default asset. */
export function getEmojiStylePath(styles: EmojiStyles, style: string): string {
  const directPath = styles[style];
  if (isEmojiAssetPath(directPath)) return directPath;

  const defaultPath = styles[`${style}-default`];
  return isEmojiAssetPath(defaultPath) ? defaultPath : '';
}

/** Return the standard style keys that have concrete image files available. */
export function getEmojiAvailableStyles(styles: EmojiStyles): StyleType[] {
  return STANDARD_STYLES.filter((style) => Boolean(getEmojiStylePath(styles, style)));
}

/** Return the first concrete image asset, or an empty string when none exists. */
export function getFirstEmojiAssetPath(styles: EmojiStyles): string {
  const standardPath = STANDARD_STYLES
    .map((style) => getEmojiStylePath(styles, style))
    .find(Boolean);

  if (standardPath) return standardPath;

  return Object.values(styles).find(isEmojiAssetPath) || '';
}
