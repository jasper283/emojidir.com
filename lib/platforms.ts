import type { PlatformConfig, PlatformType } from '@/types/emoji';

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
    name: 'Noto Emoji',
    description: 'Google Open Source Design',
    icon: '🌐',
    styles: ['color']
  }
};

// 将 unicode 转换为 nato-emoji 文件名格式
function unicodeToNatoFilename(unicode: string): string {
  // unicode 格式如: "U+1F600" 或 "1F600" 或 "1f9d1 200d 1f3a8"（包含空格的复合emoji）
  // nato 文件名格式: "emoji_u1f600.svg" 或 "emoji_u1f9d1_200d_1f3a8.svg"
  // 注意：需要移除变体选择器（fe0e, fe0f）
  const cleaned = unicode
    .replace(/U\+/gi, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(code => code !== 'fe0e' && code !== 'fe0f') // 过滤掉变体选择器
    .join('_');
  return `emoji_u${cleaned}`;
}

// 模拟不同平台的emoji数据
export function getEmojiDataForPlatform(platform: PlatformType, baseEmojiData: any) {
  // 目前只有Fluent Emoji有真实数据，其他平台使用模拟数据
  if (platform === 'fluent') {
    return baseEmojiData;
  }

  // 为 nato 平台生成数据（使用 R2 CDN 上的 nato-emoji PNG 资源）
  if (platform === 'nato') {
    const natoEmojis = baseEmojiData.emojis.map((emoji: any) => ({
      ...emoji,
      // 保持原始 id 不变，以便在不同平台间切换
      styles: {
        color: `nato-emoji/png/128/${unicodeToNatoFilename(emoji.unicode)}.png`
      }
    }));

    return {
      ...baseEmojiData,
      emojis: natoEmojis,
      totalCount: natoEmojis.length,
      emojisByCategory: natoEmojis.reduce((acc: any, emoji: any) => {
        if (!acc[emoji.group]) acc[emoji.group] = [];
        acc[emoji.group].push(emoji);
        return acc;
      }, {})
    };
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
