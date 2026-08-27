import StaticEmojiDetailClient from '@/components/StaticEmojiDetailClient';
import { EmojiDetailStructuredData } from '@/components/StructuredData';
import { getAssetUrl } from '@/config/cdn';
import { getFirstEmojiAssetPath } from '@/lib/emoji-assets';
import { getEmojiKeywords, getEmojiName } from '@/lib/emoji-i18n';
import { getEmojiSeoData, getEmojiSeoKeywords } from '@/lib/emoji-seo';
import { loadEmojiIndexServer } from '@/lib/emoji-server';
import { getEmojiDataForPlatform, PLATFORM_CONFIGS } from '@/lib/platforms';
import { getEmojipediaEmojiData } from '@/lib/emojipedia';
import type { Emoji, PlatformType } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';

interface EmojiDetailPageProps {
  params: Promise<{
    locale: string;
    platform: string;
    slug: string;
  }>;
}

export default async function EmojiDetailPage({ params }: EmojiDetailPageProps) {
  const { locale, platform: platformSlug, slug: slugParam } = await params;
  const selectedPlatform = platformSlug?.replace('-emoji', '') as PlatformType || 'fluent';

  if (!PLATFORM_CONFIGS[selectedPlatform] || platformSlug !== `${selectedPlatform}-emoji`) {
    notFound();
  }

  // 在服务端加载和合并语言数据
  const localizedEmojiData = await loadEmojiIndexServer(locale);

  // 根据选择的平台获取对应的emoji数据
  const emojiData = getEmojiDataForPlatform(selectedPlatform, localizedEmojiData);

  // 查找当前emoji（通过slug/id）
  const emoji = emojiData.emojis.find((e: Emoji) => e.id === decodeURIComponent(slugParam));

  if (!emoji) {
    notFound();
  }

  // 获取多语言名称和关键词
  const displayName = getEmojiName(emoji, locale);
  const seoData = getEmojiSeoData(emoji.id);
  const emojipediaData = getEmojipediaEmojiData(emoji.id, locale);
  const seoKeywords = getEmojiSeoKeywords(emoji.id, locale);
  const fallbackKeywords = getEmojiKeywords(emoji, locale);
  const displayKeywords = seoKeywords.length > 0 ? seoKeywords : fallbackKeywords;

  // 获取第一个真实图片文件用于结构化数据
  const currentStyleUrl = getFirstEmojiAssetPath(emoji.styles);
  return (
    <>
      {/* JSON-LD结构化数据 - 在服务端渲染 */}
      <EmojiDetailStructuredDataWrapper
        locale={locale}
        platform={platformSlug}
        selectedPlatform={selectedPlatform}
        emoji={{
          id: emoji.id,
          name: displayName,
          glyph: emoji.glyph,
          unicode: emoji.unicode,
          group: emoji.group,
          keywords: displayKeywords,
          emojiVersion: seoData?.emojiVersion ?? (emojipediaData?.emojiVersion ? `E${emojipediaData.emojiVersion}` : undefined),
          unicodeVersion: seoData?.unicodeVersion ?? (emojipediaData?.unicodeVersion ? `Unicode ${emojipediaData.unicodeVersion}` : undefined),
          releaseVersion: seoData?.releaseVersion ?? (emojipediaData?.emojiVersion ? `Emoji ${emojipediaData.emojiVersion}` : undefined),
          meaning: emojipediaData?.meaning ?? undefined,
          sourceUrl: emojipediaData?.sourceUrl ?? undefined,
        }}
        imageUrl={currentStyleUrl ? getAssetUrl(currentStyleUrl) : undefined}
      />

      {/* The interactive detail body loads its data from static JSON in the browser. */}
      <StaticEmojiDetailClient
        locale={locale}
        platformSlug={platformSlug}
        slug={slugParam}
      />
    </>
  );
}

// 单独的结构化数据组件（客户端组件用于翻译）
function EmojiDetailStructuredDataWrapper({
  locale,
  platform,
  selectedPlatform,
  emoji,
  imageUrl
}: {
  locale: string;
  platform: string;
  selectedPlatform: PlatformType;
  emoji: {
    id: string;
    name: string;
    glyph: string;
    unicode: string;
    group: string;
    keywords: string[];
    emojiVersion?: string;
    unicodeVersion?: string;
    releaseVersion?: string;
    meaning?: string;
    sourceUrl?: string;
  };
  imageUrl?: string;
}) {
  const t = useTranslations();

  return (
    <EmojiDetailStructuredData
      locale={locale}
      platform={platform}
      platformName={t(`platforms.${selectedPlatform}`)}
      emoji={emoji}
      imageUrl={imageUrl}
    />
  );
}
