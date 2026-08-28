import { locales } from '@/i18n/config';
import { PLATFORM_CONFIGS, VISIBLE_PLATFORM_CONFIGS } from '@/lib/platforms';
import { createMetaDescription } from '@/lib/seo';
import type { PlatformType } from '@/types/emoji';
import type { Metadata } from 'next';

const baseUrl = 'https://emojidir.com';

type PlatformMetadata = {
  name: string;
  description: string;
  keywords: string;
};

const localizedPlatformNames: Record<string, Record<PlatformType, string>> = {
  en: { fluent: 'Microsoft 3D Fluent Emoji', nato: 'Google Noto Emoji', unicode: 'System Emoji', apple: 'Apple Emoji', microsoft: 'Microsoft Emoji', twitter: 'Twitter Emoji' },
  'zh-CN': { fluent: '微软 3D Fluent Emoji', nato: 'Google Noto Emoji', unicode: '系统 Emoji', apple: 'Apple Emoji', microsoft: '微软 Emoji', twitter: 'Twitter' },
  'zh-TW': { fluent: 'Microsoft 3D Fluent Emoji', nato: 'Google Noto Emoji', unicode: '系統 Emoji', apple: 'Apple Emoji', microsoft: '微軟 Emoji', twitter: 'Twitter' },
  ja: { fluent: 'Microsoft 3D Fluent Emoji', nato: 'Google Noto Emoji', unicode: 'システム Emoji', apple: 'Apple Emoji', microsoft: 'Microsoft Emoji', twitter: 'Twitter' },
  ko: { fluent: 'Microsoft 3D Fluent Emoji', nato: 'Google Noto Emoji', unicode: '시스템 Emoji', apple: 'Apple Emoji', microsoft: 'Microsoft Emoji', twitter: 'Twitter' },
  'pt-BR': { fluent: 'Microsoft 3D Fluent Emoji', nato: 'Google Noto Emoji', unicode: 'Sistema Emoji', apple: 'Apple', microsoft: 'Microsoft', twitter: 'Twitter' },
};

function createPlatformMetadata(locale: string, platformId: PlatformType, defaultName: string): PlatformMetadata {
  const platformName = localizedPlatformNames[locale]?.[platformId] || defaultName;

  switch (locale) {
    case 'zh-CN':
      return {
        name: `${platformName} 表情符号大全：在线复制与 PNG 高清图片下载`,
        description: `查看 ${platformName} 表情符号的含义并探索不同风格，支持在线复制 Unicode 符号、比较平台效果和免费下载 PNG 高清图片，适合聊天、社交媒体和设计项目。`,
        keywords: `${platformName}, ${platformName}表情符号, 表情符号大全, 在线复制表情, PNG表情下载, 高清表情图片`,
      };
    case 'zh-TW':
      return {
        name: `${platformName} 表情符號大全：線上複製與 PNG 高畫質圖片下載`,
        description: `查看 ${platformName} 表情符號的含義並探索不同風格，支援線上複製 Unicode 字元、比較平台效果和免費下載 PNG 高畫質圖片，適合聊天、社群媒體和設計專案。`,
        keywords: `${platformName}, ${platformName}表情符號, 表情符號大全, 線上複製表情, PNG表情下載, 高畫質表情圖片`,
      };
    case 'ja':
      return {
        name: `${platformName} 絵文字一覧：コピペ・PNG画像を無料ダウンロード`,
        description: `${platformName} の絵文字の意味とデザインを一覧で確認。Unicode文字をすぐにコピペでき、プラットフォームごとの表示を比較して高画質PNG画像を無料でダウンロードできます。`,
        keywords: `${platformName}, ${platformName} 絵文字, 絵文字一覧, 絵文字コピペ, 絵文字 PNG, 高画質絵文字`,
      };
    case 'ko':
      return {
        name: `${platformName} 이모지 모음: 복사, 붙여넣기 및 PNG 이미지 다운로드`,
        description: `${platformName} 이모지의 뜻과 디자인을 한눈에 살펴보세요. Unicode 문자를 바로 복사하고 플랫폼별 표시를 비교하며 고화질 PNG 이미지를 무료로 다운로드할 수 있습니다.`,
        keywords: `${platformName}, ${platformName} 이모지, 이모지 모음, 이모지 복사, 이모지 PNG, 고화질 이모지`,
      };
    case 'pt-BR':
      return {
        name: `Emojis ${platformName}: Copiar, Colar e Baixar Imagens PNG`,
        description: `Entenda o significado e explore os designs de emojis ${platformName}. Copie símbolos Unicode online, compare a aparência em diferentes plataformas e baixe imagens PNG em alta resolução gratuitamente.`,
        keywords: `${platformName}, emojis ${platformName}, copiar e colar emoji, baixar emoji PNG, imagem de emoji em alta resolução`,
      };
    default:
      return {
        name: `${platformName}: Copy, Paste & Download Emoji PNGs`,
        description: `Learn the meaning behind ${platformName} emojis and explore their designs. Copy Unicode symbols online, compare emoji styles across platforms, and download free high-resolution PNG images for messages, social posts, and design projects.`,
        keywords: `${platformName}, ${platformName} emojis, copy and paste emoji, emoji PNG download, high resolution emoji image`,
      };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; platform: string }>;
}): Promise<Metadata> {
  const { locale, platform: platformSlug } = await params;
  const platformId = platformSlug?.replace('-emoji', '') as PlatformType;
  const platformConfig = PLATFORM_CONFIGS[platformId];

  if (!platformConfig) {
    return {};
  }

  const platformMetadata = Object.fromEntries(
    locales.map((metadataLocale) => [
      metadataLocale,
      Object.fromEntries(
        (Object.keys(PLATFORM_CONFIGS) as PlatformType[]).map((metadataPlatform) => [
          metadataPlatform,
          createPlatformMetadata(
            metadataLocale,
            metadataPlatform,
            PLATFORM_CONFIGS[metadataPlatform].name,
          ),
        ]),
      ),
    ]),
  ) as Record<string, Record<PlatformType, PlatformMetadata>>;

  const fallbackMetadata = createPlatformMetadata(locale, platformId, platformConfig.name);
  const localeMetadata = platformMetadata[locale]?.[platformId]
    || fallbackMetadata;
  const title = localeMetadata.name || fallbackMetadata.name;
  const description = createMetaDescription(
    localeMetadata.description || fallbackMetadata.description,
    locale
  );
  const keywords = localeMetadata.keywords || fallbackMetadata.keywords;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${baseUrl}/${locale}/${platformSlug}`,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `${baseUrl}/${loc}/${platformSlug}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/${platformSlug}`,
      type: 'website',
      locale,
      siteName: 'EmojiDir',
      images: [
        {
          url: 'https://public.emojidir.com/og/welcome.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://public.emojidir.com/og/welcome.png'],
    },
  };
}

export async function generateStaticParams() {
  const platforms = Object.keys(VISIBLE_PLATFORM_CONFIGS);
  const params = [];

  for (const locale of locales) {
    for (const platform of platforms) {
      params.push({
        locale,
        platform: `${platform}-emoji`
      });
    }
  }

  return params;
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
