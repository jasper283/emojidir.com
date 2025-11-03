export interface EmojiStyles {
  '3d'?: string;
  'color'?: string;
  'flat'?: string;
  'high-contrast'?: string;
  // 深浅色主题支持
  '3d-default'?: string;
  'color-default'?: string;
  'flat-default'?: string;
  'high-contrast-default'?: string;
  // 允许任意字符串键
  [key: string]: string | undefined;
}

export interface EmojiI18n {
  name: string;
  keywords: string[];
  tts: string;
}

export interface Emoji {
  id: string;
  name: string;
  glyph: string;
  group: string;
  keywords: string[];
  unicode: string;
  tts: string;
  styles: EmojiStyles;
  // 多语言支持：语言代码 -> 名称和关键词
  i18n?: Record<string, EmojiI18n>;
}

export interface EmojiIndex {
  emojis: Emoji[];
  categories: string[];
  emojisByCategory: Record<string, Emoji[]>;
  totalCount: number;
  generatedAt: string;
}

// ============ 缩写版本类型定义（用于减小文件体积）============

export interface CompactEmojiStyles {
  '3'?: string;  // 3d
  'c'?: string;  // color
  'f'?: string;  // flat
  'h'?: string;  // high-contrast
  // 深浅色主题支持
  '3d'?: string;  // 3d-default
  'cd'?: string; // color-default
  'fd'?: string; // flat-default
  'hd'?: string; // high-contrast-default
  // 允许任意字符串键
  [key: string]: string | undefined;
}

export interface CompactEmojiI18n {
  n: string;      // name
  k: string[];    // keywords
  t: string;      // tts
}

export interface CompactEmoji {
  i: string;                                    // id
  n: string;                                    // name
  gl: string;                                   // glyph
  gr: string;                                   // group
  k: string[];                                  // keywords
  u: string;                                    // unicode
  t: string;                                    // tts
  s: CompactEmojiStyles;                        // styles
  i18n?: Record<string, CompactEmojiI18n>;      // i18n (保持原名)
}

export interface CompactEmojiIndex {
  e: CompactEmoji[];                            // emojis
  c: string[];                                  // categories
  ec: Record<string, CompactEmoji[]>;           // emojisByCategory
  tc: number;                                   // totalCount
  g: string;                                    // generatedAt
}

export type StyleType = '3d' | 'color' | 'flat' | 'high-contrast';
export type PlatformType = 'fluent' | 'unicode' | 'nato';

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  description: string;
  icon: string;
  styles: StyleType[];
}

// ============ 数据转换函数 ============

/**
 * 将缩写的样式对象转换为完整格式
 */
export function expandStyles(compact: CompactEmojiStyles): EmojiStyles {
  const expanded: EmojiStyles = {};

  const styleMap: Record<string, string> = {
    '3': '3d',
    'c': 'color',
    'f': 'flat',
    'h': 'high-contrast',
    '3d': '3d-default',
    'cd': 'color-default',
    'fd': 'flat-default',
    'hd': 'high-contrast-default',
  };

  for (const [key, value] of Object.entries(compact)) {
    if (value !== undefined) {
      const expandedKey = styleMap[key] || key;
      expanded[expandedKey] = value;
    }
  }

  return expanded;
}

/**
 * 将缩写的 i18n 对象转换为完整格式
 */
export function expandI18n(compact: CompactEmojiI18n): EmojiI18n {
  return {
    name: compact.n,
    keywords: compact.k,
    tts: compact.t,
  };
}

/**
 * 将缩写的 Emoji 对象转换为完整格式
 */
export function expandEmoji(compact: CompactEmoji): Emoji {
  const expanded: Emoji = {
    id: compact.i,
    name: compact.n,
    glyph: compact.gl,
    group: compact.gr,
    keywords: compact.k,
    unicode: compact.u,
    tts: compact.t,
    styles: expandStyles(compact.s),
  };

  if (compact.i18n) {
    expanded.i18n = {};
    for (const [locale, data] of Object.entries(compact.i18n)) {
      expanded.i18n[locale] = expandI18n(data);
    }
  }

  return expanded;
}

/**
 * 将缩写的 EmojiIndex 转换为完整格式
 */
export function expandEmojiIndex(compact: CompactEmojiIndex): EmojiIndex {
  const emojis = compact.e.map(expandEmoji);

  const emojisByCategory: Record<string, Emoji[]> = {};
  for (const [category, compactEmojis] of Object.entries(compact.ec)) {
    emojisByCategory[category] = compactEmojis.map(expandEmoji);
  }

  return {
    emojis,
    categories: compact.c,
    emojisByCategory,
    totalCount: compact.tc,
    generatedAt: compact.g,
  };
}

