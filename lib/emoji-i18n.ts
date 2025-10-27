import type { Emoji, EmojiIndex } from '@/types/emoji';

/**
 * 获取 emoji 在指定语言下的名称
 */
export function getEmojiName(emoji: Emoji, locale: string): string {
  // 优先使用对应语言的翻译
  if (emoji.i18n && emoji.i18n[locale]) {
    return emoji.i18n[locale].name;
  }

  // 回退到英文名称
  return emoji.name;
}

/**
 * 获取 emoji 在指定语言下的关键词
 */
export function getEmojiKeywords(emoji: Emoji, locale: string): string[] {
  // 优先使用对应语言的翻译
  if (emoji.i18n && emoji.i18n[locale]) {
    return emoji.i18n[locale].keywords;
  }

  // 回退到英文关键词
  return emoji.keywords;
}

/**
 * 获取 emoji 在指定语言下的 TTS 文本
 */
export function getEmojiTTS(emoji: Emoji, locale: string): string {
  // 优先使用对应语言的翻译
  if (emoji.i18n && emoji.i18n[locale]) {
    return emoji.i18n[locale].tts;
  }

  // 回退到英文 TTS
  return emoji.tts;
}

/**
 * 在多语言环境下搜索 emoji
 */
export function searchEmojis(
  emojis: Emoji[],
  query: string,
  locale: string
): Emoji[] {
  if (!query.trim()) {
    return emojis;
  }

  const lowerQuery = query.toLowerCase();

  return emojis.filter((emoji: Emoji) => {
    // 搜索当前语言的名称
    const name = getEmojiName(emoji, locale);
    if (name.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // 搜索当前语言的关键词
    const keywords = getEmojiKeywords(emoji, locale);
    if (keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))) {
      return true;
    }

    // 搜索 emoji 字符本身
    if (emoji.glyph.includes(query)) {
      return true;
    }

    // 如果当前不是英文环境，也搜索英文名称和关键词（作为备选）
    if (locale !== 'en') {
      if (emoji.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      if (emoji.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))) {
        return true;
      }
    }

    return false;
  });
}

/**
 * 异步加载指定语言的 emoji 索引数据
 */
export async function loadEmojiIndexForLocale(locale: string): Promise<EmojiIndex | null> {
  // 英文已经是基础索引，无需额外加载
  if (locale === 'en') {
    return null;
  }

  try {
    // 尝试加载对应语言的索引文件
    const response = await fetch(`/data/emoji-index-${locale}.json`);

    if (response.ok) {
      const data = await response.json();
      return data as EmojiIndex;
    }

    // 如果加载失败，回退到基础索引
    console.warn(`未找到 ${locale} 的 emoji 索引，使用基础索引`);
    return null;
  } catch (error) {
    console.error(`加载 ${locale} emoji 索引失败:`, error);
    return null;
  }
}

/**
 * 合并基础索引和语言特定的翻译数据
 */
export function mergeEmojiIndexWithLocale(
  baseIndex: EmojiIndex,
  localeIndex: EmojiIndex | null
): EmojiIndex {
  if (!localeIndex) {
    return baseIndex;
  }

  // 创建一个 glyph -> i18n 的映射表
  const i18nMap = new Map<string, any>();
  localeIndex.emojis.forEach(emoji => {
    if (emoji.i18n) {
      i18nMap.set(emoji.glyph, emoji.i18n);
    }
  });

  // 将翻译数据合并到基础索引
  const mergedEmojis = baseIndex.emojis.map(emoji => {
    const i18nData = i18nMap.get(emoji.glyph);
    if (i18nData) {
      return {
        ...emoji,
        i18n: {
          ...emoji.i18n,
          ...i18nData
        }
      };
    }
    return emoji;
  });

  return {
    ...baseIndex,
    emojis: mergedEmojis
  };
}

