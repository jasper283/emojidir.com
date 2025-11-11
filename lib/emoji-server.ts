import type { CompactEmojiIndex, EmojiIndex } from '@/types/emoji';
import { expandEmojiIndex } from '@/types/emoji';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * 服务端加载emoji索引数据（带语言支持）
 * 在构建时或运行时在服务端读取文件，避免客户端异步加载
 */
export async function loadEmojiIndexServer(locale: string): Promise<EmojiIndex> {
  try {
    // 先加载基础英文数据
    const baseDataPath = join(process.cwd(), 'data', 'emoji-index.json');
    const baseData = JSON.parse(readFileSync(baseDataPath, 'utf-8')) as CompactEmojiIndex;
    const baseIndex = expandEmojiIndex(baseData);

    // 如果是英文，直接返回基础数据
    if (locale === 'en') {
      return baseIndex;
    }

    // 加载对应语言的数据
    const localeDataPath = join(process.cwd(), 'data', `emoji-index-${locale}.json`);

    try {
      const localeData = JSON.parse(readFileSync(localeDataPath, 'utf-8')) as CompactEmojiIndex;
      const localeIndex = expandEmojiIndex(localeData);

      // 合并数据
      return mergeEmojiIndexWithLocaleServer(baseIndex, localeIndex);
    } catch (error) {
      // 如果语言文件不存在，返回基础数据
      console.warn(`未找到 ${locale} 的 emoji 索引，使用基础索引`);
      return baseIndex;
    }
  } catch (error) {
    console.error('加载 emoji 索引失败:', error);
    throw error;
  }
}

/**
 * 服务端合并基础索引和语言特定的翻译数据
 */
function mergeEmojiIndexWithLocaleServer(
  baseIndex: EmojiIndex,
  localeIndex: EmojiIndex
): EmojiIndex {
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

