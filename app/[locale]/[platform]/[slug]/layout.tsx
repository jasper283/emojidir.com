import { getAssetUrl } from '@/config/cdn';
import { locales } from '@/i18n/config';
import type { CompactEmojiIndex, Emoji, PlatformType } from '@/types/emoji';
import { expandEmojiIndex } from '@/types/emoji';
import type { Metadata } from 'next';
// 构建时导入数据
import { EmojiDetailStructuredData } from '@/components/StructuredData';
import compactEmojiIndexData from '@/data/emoji-index.json';

const baseUrl = 'https://emojidir.com';
// 将缩写格式转换为完整格式
const baseEmojiData = expandEmojiIndex(compactEmojiIndexData as CompactEmojiIndex);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; platform: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, platform: platformSlug, slug } = await params;
  const platformId = platformSlug?.replace('-emoji', '') as PlatformType;

  // 查找emoji（通过slug/id）
  const emoji = baseEmojiData.emojis.find((e: Emoji) => e.id === slug);

  if (!emoji) {
    return {
      title: 'Emoji Not Found - Emoji Directory',
      description: 'The emoji you are looking for could not be found.',
    };
  }

  // 平台名称多语言映射
  const platformNames: Record<string, Record<string, string>> = {
    'en': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'System Emoji' },
    'zh-CN': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'Emoji大全' },
    'zh-TW': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'Emoji全集' },
    'ja': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'システムEmoji' },
    'ko': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: '시스テムEmoji', },
    'pt-BR': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'Emoji Nativo' },
  };

  const platformName = platformNames[locale]?.[platformId] || platformNames['en'][platformId];

  // SEO优化的标题格式
  const title = `${emoji.glyph} ${emoji.name} — Copy, Paste & Download | ${platformName}`;

  // 多语言描述模板
  const descriptionTemplates: Record<string, string> = {
    'en': `Easily copy, paste, and download ${emoji.name} in ${platformName}. Free, fast, and ready for all platforms.`,
    'zh-CN': `轻松复制、粘贴和下载${emoji.name}表情符号，来自${platformName}。免费、快速，支持所有平台。`,
    'zh-TW': `輕鬆複製、貼上和下載${emoji.name}表情符號，來自${platformName}。免費、快速，支援所有平台。`,
    'ja': `${emoji.name}の絵文字を簡単にコピー、貼り付け、ダウンロード。${platformName}から。無料、高速、すべてのプラットフォームに対応。`,
    'ko': `${emoji.name} 이모지를 쉽게 복사, 붙여넣기, 다운로드하세요. ${platformName}에서 제공. 무료, 빠르고, 모든 플랫폼 지원.`,
    'pt-BR': `Copie, cole e baixe facilmente ${emoji.name} em ${platformName}. Gratuito, rápido e pronto para todas as plataformas.`,
  };

  const description = descriptionTemplates[locale] || descriptionTemplates['en'];

  // 获取表情图片 URL - 优先使用 color、3d 或 flat 样式
  const getEmojiImageUrl = (): string => {
    if (emoji.styles['color']) {
      return getAssetUrl(emoji.styles['color']);
    }
    if (emoji.styles['3d']) {
      return getAssetUrl(emoji.styles['3d']);
    }
    if (emoji.styles['flat']) {
      return getAssetUrl(emoji.styles['flat']);
    }
    // 降级到第一个可用的样式
    const firstStyle = Object.keys(emoji.styles)[0];
    if (firstStyle && emoji.styles[firstStyle]) {
      return getAssetUrl(emoji.styles[firstStyle]);
    }
    // 最后的降级方案
    return `${baseUrl}/favicon.svg`;
  };

  const imageUrl = getEmojiImageUrl();

  return {
    title,
    description,
    keywords: [...emoji.keywords, emoji.name, 'emoji', platformId, emoji.group],
    alternates: {
      canonical: `${baseUrl}/${locale}/${platformSlug}/${slug}`,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `${baseUrl}/${loc}/${platformSlug}/${slug}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/${platformSlug}/${slug}`,
      type: 'website',
      locale,
      siteName: 'Emoji Directory',
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: `${emoji.name} emoji (${emoji.glyph})`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export async function generateStaticParams() {
  // 只为主要平台生成静态参数，避免生成过多页面
  const mainPlatform = 'fluent-emoji';
  const params = [];

  for (const locale of locales) {
    for (const emoji of baseEmojiData.emojis) {
      params.push({
        locale,
        platform: mainPlatform,
        slug: emoji.id,
      });
    }
  }

  return params;
}

export default async function EmojiDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; platform: string; slug: string }>;
}) {
  const { locale, platform: platformSlug, slug } = await params;
  const platformId = platformSlug?.replace('-emoji', '') as PlatformType;

  // 查找emoji
  const emoji = baseEmojiData.emojis.find((e: Emoji) => e.id === slug);

  if (!emoji) {
    return <>{children}</>;
  }

  // 平台名称多语言映射
  const platformNames: Record<string, Record<string, string>> = {
    'en': { fluent: 'Fluent Emoji', nato: 'Noto Emoji', unicode: 'System Emoji' },
    'zh-CN': { fluent: 'Fluent Emoji', nato: 'Noto Emoji', unicode: 'Emoji大全' },
    'zh-TW': { fluent: 'Fluent Emoji', nato: 'Noto Emoji', unicode: '系統表情符號' },
    'ja': { fluent: 'Fluent Emoji', nato: 'Noto Emoji', unicode: 'システム絵文字' },
    'ko': { fluent: 'Fluent Emoji', nato: 'Noto Emoji', unicode: '시스템 이모지' },
    'pt-BR': { fluent: 'Fluent Emoji', nato: 'Noto Emoji', unicode: 'Emoji do Sistema' },
  };

  const platformName = platformNames[locale]?.[platformId] || platformNames['en'][platformId];

  // 获取表情图片 URL
  const getEmojiImageUrl = (): string => {
    if (emoji.styles['color']) {
      return getAssetUrl(emoji.styles['color']);
    }
    if (emoji.styles['3d']) {
      return getAssetUrl(emoji.styles['3d']);
    }
    if (emoji.styles['flat']) {
      return getAssetUrl(emoji.styles['flat']);
    }
    const firstStyle = Object.keys(emoji.styles)[0];
    if (firstStyle && emoji.styles[firstStyle]) {
      return getAssetUrl(emoji.styles[firstStyle]);
    }
    return `${baseUrl}/favicon.svg`;
  };

  const imageUrl = getEmojiImageUrl();

  return (
    <>
      <EmojiDetailStructuredData
        locale={locale}
        platform={platformSlug}
        platformName={platformName}
        emoji={{
          id: emoji.id,
          name: emoji.name,
          glyph: emoji.glyph,
          unicode: emoji.unicode,
          group: emoji.group,
          keywords: emoji.keywords,
        }}
        imageUrl={imageUrl}
      />
      {children}
    </>
  );
}

