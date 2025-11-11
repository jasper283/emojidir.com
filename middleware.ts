import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
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
  // 所有路径由国际化中间件处理
  // next-intl 会自动检测语言并重定向 / 到 /{locale}
  return intlMiddleware(request);
}

export const config = {
  // 匹配所有路径
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon|.*\\..*).*)'
  ]
};

