// 支持的语言列表
export const locales = ['en', 'ja', 'ko', 'zh-TW', 'zh-CN'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
};

