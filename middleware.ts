import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './i18n/config';

const intlMiddleware = createMiddleware({
  // 支持的语言列表
  locales,
  // 默认语言
  defaultLocale,
  // 启用浏览器语言检测
  localeDetection: true,
  // 始终显示语言前缀（包括默认语言）
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 根路径：直接检测语言并重定向到 unicode-emoji 平台
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    let targetLocale = defaultLocale;

    // 改进的语言匹配逻辑：正确解析 Accept-Language 头
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, q] = lang.trim().split(';q=');
        return {
          locale: locale.toLowerCase().trim(),
          quality: q ? parseFloat(q) : 1.0
        };
      })
      .sort((a, b) => b.quality - a.quality);

    // 按优先级查找匹配的语言
    for (const lang of languages) {
      for (const locale of locales) {
        const localeLower = locale.toLowerCase();
        // 精确匹配或前缀匹配（如 zh-cn 匹配 zh-CN）
        if (lang.locale === localeLower ||
          lang.locale.startsWith(localeLower + '-') ||
          localeLower.startsWith(lang.locale + '-')) {
          targetLocale = locale;
          break;
        }
      }
      if (targetLocale !== defaultLocale) break;
    }

    // 重定向到 unicode-emoji 平台
    return NextResponse.redirect(
      new URL(`/${targetLocale}/unicode-emoji`, request.url)
    );
  }

  // 所有其他路径由国际化中间件处理
  return intlMiddleware(request);
}

export const config = {
  // 匹配所有路径
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon|.*\\..*).*)'
  ]
};

