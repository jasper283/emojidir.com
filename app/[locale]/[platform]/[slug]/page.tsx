import StaticEmojiDetailClient from '@/components/StaticEmojiDetailClient';
import { EmojiDetailStructuredData } from '@/components/StructuredData';
import { getAssetUrl } from '@/config/cdn';
import { getEmojiDetailImagePath, loadEmojiDetailServer } from '@/lib/emoji-detail-server';
import { getEmojiName } from '@/lib/emoji-i18n';
import { PLATFORM_CONFIGS } from '@/lib/platforms';
import type { PlatformType } from '@/types/emoji';
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

  // Load the complete detail at build time so the static HTML contains the page body.
  const detail = await loadEmojiDetailServer(locale, platformSlug, slugParam);

  if (!detail) {
    notFound();
  }

  const { emoji, seoData, emojipediaData } = detail;

  // 获取第一个真实图片文件用于结构化数据
  const currentStyleUrl = getEmojiDetailImagePath(detail);
  return (
    <>
      {/* JSON-LD结构化数据 - 在服务端渲染 */}
      <EmojiDetailStructuredDataWrapper
        locale={locale}
        platform={platformSlug}
        selectedPlatform={selectedPlatform}
        emoji={{
          id: emoji.id,
          name: getEmojiName(emoji, locale),
          glyph: emoji.glyph,
          unicode: emoji.unicode,
          group: emoji.group,
          keywords: seoData?.keywords[locale] ?? emoji.keywords,
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
        initialDetail={detail}
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
