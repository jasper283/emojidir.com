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

    // 简单的语言匹配逻辑
    for (const locale of locales) {
      if (acceptLanguage.includes(locale)) {
        targetLocale = locale;
        break;
      }
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

