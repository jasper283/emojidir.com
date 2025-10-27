import Footer from '@/components/Footer';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import Header from '@/components/Header';
import { WebsiteStructuredData } from '@/components/StructuredData';
import { defaultLocale, locales } from '@/i18n/config';
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";

const baseUrl = 'https://emojidir.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  // 根据语言定制 metadata
  const metadataByLocale: Record<string, { title: string; description: string; keywords: string }> = {
    'en': {
      title: 'Emoji Directory - Browse & Search Emoji Collections',
      description: 'Explore thousands of emojis from Fluent Emoji, Noto Emoji, and system platforms. Search, download, and copy emojis in multiple styles including 3D, Color, Flat, and High Contrast.',
      keywords: 'emoji, emoji search, emoji directory, fluent emoji, noto emoji, emoji download, emoji copy, 3d emoji, flat emoji, microsoft emoji, google emoji'
    },
    'zh-CN': {
      title: 'Emoji Directory - 浏览和搜索表情符号集合',
      description: '浏览数千个来自 Fluent Emoji、Noto Emoji 和系统平台的表情符号。搜索、下载和复制多种风格的表情符号，包括 3D、彩色、扁平和高对比度。',
      keywords: '表情符号, emoji搜索, emoji目录, fluent emoji, noto emoji, 表情下载, 表情复制, 3d表情, 扁平表情, 微软表情, 谷歌表情'
    },
    'zh-TW': {
      title: 'Emoji Directory - 瀏覽和搜尋表情符號集合',
      description: '瀏覽數千個來自 Fluent Emoji、Noto Emoji 和系統平台的表情符號。搜尋、下載和複製多種風格的表情符號，包括 3D、彩色、扁平和高對比度。',
      keywords: '表情符號, emoji搜尋, emoji目錄, fluent emoji, noto emoji, 表情下載, 表情複製, 3d表情, 扁平表情, 微軟表情, 谷歌表情'
    },
    'ja': {
      title: 'Emoji Directory - 絵文字コレクションを閲覧・検索',
      description: 'Fluent Emoji、Noto Emoji、システムプラットフォームから数千の絵文字を探索。3D、カラー、フラット、ハイコントラストなど、複数のスタイルで絵文字を検索、ダウンロード、コピー。',
      keywords: '絵文字, emoji検索, emojiディレクトリ, fluent emoji, noto emoji, 絵文字ダウンロード, 絵文字コピー, 3d絵文字, フラット絵文字, マイクロソフト絵文字, グーグル絵文字'
    },
    'ko': {
      title: 'Emoji Directory - 이모지 컬렉션 찾아보기 및 검색',
      description: 'Fluent Emoji, Noto Emoji 및 시스템 플랫폼에서 수천 개의 이모지를 탐색하세요. 3D, 컬러, 플랫, 고대비 등 여러 스타일의 이모지를 검색, 다운로드 및 복사하세요.',
      keywords: '이모지, emoji 검색, emoji 디렉토리, fluent emoji, noto emoji, 이모지 다운로드, 이모지 복사, 3d 이모지, 플랫 이모지, 마이크로소프트 이모지, 구글 이모지'
    },
  };

  const metadata = metadataByLocale[validLocale] || metadataByLocale['en'];

  return {
    title: {
      default: metadata.title,
      template: '%s | Emoji Directory'
    },
    description: metadata.description,
    keywords: metadata.keywords.split(', '),
    authors: [{ name: 'Emoji Directory' }],
    creator: 'Emoji Directory',
    publisher: 'Emoji Directory',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${validLocale}`,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `${baseUrl}/${loc}`])
      ),
    },
    openGraph: {
      type: 'website',
      locale: validLocale,
      url: `${baseUrl}/${validLocale}`,
      title: metadata.title,
      description: metadata.description,
      siteName: 'Emoji Directory',
      images: [
        {
          url: 'https://public.emojidir.com/og/welcome.png',
          width: 1200,
          height: 630,
          alt: 'Emoji Directory Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: ['https://public.emojidir.com/og/welcome.png'],
      creator: '@emojidir',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: 'https://public.emojidir.com/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
        { url: 'https://public.emojidir.com/favicon.png', type: 'image/png', sizes: '256x256' },
      ],
      shortcut: 'https://public.emojidir.com/favicon.svg',
      apple: 'https://public.emojidir.com/favicon.svg',
    },
    verification: {
      // google: 'your-google-verification-code', // 添加您的 Google Search Console 验证码
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 确保 locale 有效
  const validLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  // 使用 next-intl 的 getMessages 获取翻译
  const messages = await getMessages({ locale: validLocale });

  return (
    <html lang={validLocale}>
      <head>
        <WebsiteStructuredData locale={validLocale} />
      </head>
      <body className="antialiased bg-gray-50">
        <GoogleAnalytics />
        <div className="w-full min-h-screen flex flex-col">
          <NextIntlClientProvider locale={validLocale} messages={messages}>
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}

