import { getAssetUrl } from '@/config/cdn';
import { locales } from '@/i18n/config';
import { getFirstEmojiAssetPath } from '@/lib/emoji-assets';
import { getEmojiKeywords, getEmojiName } from '@/lib/emoji-i18n';
import { getEmojiSeoKeywords } from '@/lib/emoji-seo';
import { loadEmojiIndexServer } from '@/lib/emoji-server';
import { getLocalizedEmojipediaMeaning } from '@/lib/emojipedia';
import { PLATFORM_CONFIGS } from '@/lib/platforms';
import { createMetaDescription } from '@/lib/seo';
import type { CompactEmojiIndex, Emoji, PlatformType } from '@/types/emoji';
import { expandEmojiIndex } from '@/types/emoji';
import type { Metadata } from 'next';
// 构建时导入数据
import compactEmojiIndexData from '@/data/emoji-index.json';

const baseUrl = 'https://emojidir.com';
const primaryPlatformSlug = 'fluent-emoji';
// 将缩写格式转换为完整格式
const baseEmojiData = expandEmojiIndex(compactEmojiIndexData as CompactEmojiIndex);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; platform: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, platform: platformSlug, slug } = await params;
  const platformId = platformSlug?.replace('-emoji', '') as PlatformType;
  const canonicalPlatformSlug = platformSlug === primaryPlatformSlug
    ? platformSlug
    : primaryPlatformSlug;
  const canonicalUrl = `${baseUrl}/${locale}/${canonicalPlatformSlug}/${slug}`;

  // Metadata 使用与页面正文相同的本地化服务端数据
  const localizedEmojiData = await loadEmojiIndexServer(locale);
  const emoji = localizedEmojiData.emojis.find((e: Emoji) => e.id === slug);

  if (!emoji) {
    return {
      title: 'Emoji Not Found - Emoji Directory',
      description: 'The emoji you are looking for could not be found.',
    };
  }

  // 平台名称多语言映射
  const platformNames: Record<string, Record<string, string>> = {
    'en': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'System Emoji', apple: 'Apple Emoji', microsoft: 'Microsoft Emoji', twitter: 'Twitter Emoji' },
    'zh-CN': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'Emoji大全', apple: 'Apple Emoji', microsoft: '微软 Emoji', twitter: 'Twitter Emoji' },
    'zh-TW': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'Emoji全集', apple: 'Apple Emoji', microsoft: '微軟 Emoji', twitter: 'Twitter Emoji' },
    'ja': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'システムEmoji', apple: 'Apple Emoji', microsoft: 'Microsoft Emoji', twitter: 'Twitter Emoji' },
    'ko': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: '시스템 Emoji', apple: 'Apple Emoji', microsoft: 'Microsoft Emoji', twitter: 'Twitter Emoji' },
    'pt-BR': { fluent: 'Microsoft 3D Emoji', nato: 'Google Noto Emoji', unicode: 'Emoji Nativo', apple: 'Apple Emoji', microsoft: 'Microsoft Emoji', twitter: 'Twitter Emoji' },
  };

  const platformName = platformNames[locale]?.[platformId]
    || platformNames['en']?.[platformId]
    || PLATFORM_CONFIGS[platformId]?.name
    || 'Emoji Directory';
  const displayName = getEmojiName(emoji, locale);
  const displayKeywords = getEmojiSeoKeywords(emoji.id, locale);
  const localizedMeaning = getLocalizedEmojipediaMeaning(emoji.id, locale);
  const fallbackKeywords = getEmojiKeywords(emoji, locale);
  const seoKeywords = displayKeywords.length > 0 ? displayKeywords : fallbackKeywords;

  // SEO优化的标题格式
  const titleTemplates: Record<string, string> = {
    'en': `${emoji.glyph} ${displayName} Emoji: Meaning, Copy & Paste, HD Download | ${platformName}`,
    'zh-CN': `${emoji.glyph} ${displayName}表情符号：含义、一键复制与图片下载 | ${platformName}`,
    'zh-TW': `${emoji.glyph} ${displayName}表情符號：含義、一鍵複製與圖片下載 | ${platformName}`,
    'ja': `${emoji.glyph} ${displayName} 絵文字：意味、コピー＆ペースト、画像ダウンロード | ${platformName}`,
    'ko': `${emoji.glyph} ${displayName} 이모지: 뜻, 복사하기 및 이미지 다운로드 | ${platformName}`,
    'pt-BR': `${emoji.glyph} Emoji ${displayName}: Significado, Copiar e Colar, Baixar Imagem | ${platformName}`,
  };
  const title = titleTemplates[locale] || titleTemplates['en'];

  // 多语言描述模板
  const descriptionTemplates: Record<string, string> = {
    'en': `Discover the true meaning of ${emoji.glyph} ${displayName} emoji! Copy and paste this symbol, view cross-platform designs (Apple, Google、Microsoft、X(Twitter)), and download high-resolution images for free.`,
    'zh-CN': `了解 ${emoji.glyph} ${displayName} 表情符号的真正含义！本站提供苹果、谷歌、微软、推特（X）等各大平台高清图片对比、支持一键复制符号及免费图片下载功能。`,
    'zh-TW': `瞭解 ${emoji.glyph} ${displayName} 表情符號的真正含義！本站提供 Apple、Google、Microsoft、Twitter（X） 等各大平台的高畫質圖片比較，支援一鍵複製符號及免費下載圖片。`,
    'ja': `${emoji.glyph} ${displayName} 絵文字の本当の意味をチェック！ワンクリックでコピー＆ペースト、各プラットフォームでのデザイン比較、高画質画像の無料ダウンロードが可能。`,
    'ko': `${emoji.glyph} ${displayName} 이모지의 진짜 뜻을 알아보세요! 원클릭 복사하기, 애플·구글 등 플랫폼별 디자인 비교 및 고화질 이미지 무료 다운로드 제공.`,
    'pt-BR': `Descubra o verdadeiro significado do emoji ${emoji.glyph} ${displayName}! Copie e cole o símbolo, compare designs em diferentes plataformas (Apple, Google、Microsoft、X(Twitter)) e baixe imagens em alta definição grátis.`,
  };
  const meaningDescriptionSuffixes: Record<string, string> = {
    'en': `Copy, paste, and download ${displayName} in ${platformName}.`,
    'zh-CN': `复制、粘贴并下载${platformName}中的${displayName}。`,
    'zh-TW': `複製、貼上並下載${platformName}中的${displayName}。`,
    'ja': `${platformName}の${displayName}をコピー、貼り付け、ダウンロードできます。`,
    'ko': `${platformName}의 ${displayName} 이모지를 복사, 붙여넣기, 다운로드하세요.`,
    'pt-BR': `Copie, cole e baixe ${displayName} em ${platformName}.`,
  };

  const description = createMetaDescription(
    localizedMeaning
      ? `${localizedMeaning} ${meaningDescriptionSuffixes[locale] || meaningDescriptionSuffixes['en']}`
      : descriptionTemplates[locale] || descriptionTemplates['en'],
    locale
  );

  // 获取表情图片 URL - 优先使用 color、3d 或 flat 样式
  const getEmojiImageUrl = (): string => {
    const firstAssetPath = getFirstEmojiAssetPath(emoji.styles);
    if (firstAssetPath) return getAssetUrl(firstAssetPath);

    // 最后的降级方案
    return `${baseUrl}/favicon.svg`;
  };

  const imageUrl = getEmojiImageUrl();

  return {
    title,
    description,
    keywords: [...seoKeywords, displayName, 'emoji', platformId, emoji.group],
    alternates: {
      // Fluent is the primary detail index; other platform views are resource variants.
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `${baseUrl}/${loc}/${canonicalPlatformSlug}/${slug}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale,
      siteName: 'Emoji Directory',
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: `${displayName} emoji (${emoji.glyph})`,
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
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
