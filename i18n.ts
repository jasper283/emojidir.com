import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

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

export default getRequestConfig(async ({ locale }) => {
  // 验证传入的 locale 参数
  const validatedLocale = locale as Locale;
  if (!locales.includes(validatedLocale)) notFound();

  return {
    locale: validatedLocale,
    messages: (await import(`./messages/${validatedLocale}.json`)).default
  };
});

