import type { PlatformConfig, PlatformType } from '@/types/emoji';
import {
  getEmojiSaveAssetPath,
  hasEmojiSaveWebpAsset,
  type EmojiSavePlatform,
} from '@/lib/emojisave-assets';

// Note: name and description fields are no longer used directly in UI.
// Instead, we use i18n translations from messages/*.json (platforms.* and platformDescriptions.*)
export const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  fluent: {
    id: 'fluent',
    name: 'Fluent Emoji',
    description: 'Microsoft Design System',
    icon: '🎨',
    styles: ['3d', 'color', 'flat', 'high-contrast']
  },
  unicode: {
    id: 'unicode',
    name: 'System Emoji',
    description: 'Displayed as a system Unicode emoji on your device',
    icon: '💻',
    styles: ['color']
  },
  nato: {
    id: 'nato',
    name: 'Google Noto Emoji',
    description: 'Google Open Source Design',
    icon: '🌐',
    styles: ['color']
  },
  apple: {
    id: 'apple',
    name: 'Apple Emoji',
    description: 'Apple emoji style used across iOS, iPadOS, and macOS',
    icon: '🍎',
    styles: ['color']
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft Emoji',
    description: 'Microsoft flat color emoji style',
    icon: '🪟',
    styles: ['color']
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter Emoji',
    description: 'Twitter emoji style',
    icon: '🐦',
    styles: ['color']
  }
};

export const VISIBLE_PLATFORM_CONFIGS = Object.fromEntries(
  Object.entries(PLATFORM_CONFIGS).filter(([platform]) => platform !== 'unicode')
) as Omit<Record<PlatformType, PlatformConfig>, 'unicode'>;

function buildEmojiSavePlatformData(platform: EmojiSavePlatform, baseEmojiData: any) {
  const styleKey = platform === 'fluent' ? '3d' : 'color';
  const platformEmojis = baseEmojiData.emojis.map((emoji: any) => {
    const assetPath = hasEmojiSaveWebpAsset(platform, emoji.id)
      ? getEmojiSaveAssetPath(platform, emoji.id)
      : undefined;

    return {
      ...emoji,
      styles: {
        ...(platform === 'fluent' ? emoji.styles : {}),
        ...(assetPath ? { [styleKey]: assetPath } : {}),
      },
    };
  });

  return {
    ...baseEmojiData,
    emojis: platformEmojis,
    totalCount: platformEmojis.length,
    emojisByCategory: platformEmojis.reduce((acc: Record<string, any[]>, emoji: any) => {
      if (!acc[emoji.group]) acc[emoji.group] = [];
      acc[emoji.group].push(emoji);
      return acc;
    }, {}),
  };
}

// 模拟不同平台的emoji数据
export function getEmojiDataForPlatform(platform: PlatformType, baseEmojiData: any) {
  // Use the imported platform images for the two visual platforms. Existing
  // style keys remain available for the alternate Fluent styles and downloads.
  if (platform === 'fluent') {
    return buildEmojiSavePlatformData('fluent', baseEmojiData);
  }

  // Google images are imported from Emoji Save at a stable 256px WebP path.
  if (platform === 'nato') {
    return buildEmojiSavePlatformData('nato', baseEmojiData);
  }

  if (platform === 'apple' || platform === 'microsoft' || platform === 'twitter') {
    return buildEmojiSavePlatformData(platform, baseEmojiData);
  }

  // Unicode 平台：始终使用系统原生 emoji 字符
  // 浏览器会自动根据操作系统显示对应的 emoji 样式
  if (platform === 'unicode') {
    const nativeEmojis = baseEmojiData.emojis.map((emoji: any) => ({
      ...emoji,
      // 保持原始 id 不变，以便在不同平台间切换
      // 使用空 styles，让浏览器自动显示系统原生的 unicode emoji
      styles: {} // 空 styles = 直接显示 emoji 字符，由系统渲染
    }));

    return {
      ...baseEmojiData,
      emojis: nativeEmojis,
      totalCount: nativeEmojis.length,
      emojisByCategory: nativeEmojis.reduce((acc: any, emoji: any) => {
        if (!acc[emoji.group]) acc[emoji.group] = [];
        acc[emoji.group].push(emoji);
        return acc;
      }, {})
    };
  }

  return baseEmojiData;
}
