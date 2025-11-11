import EmojiDetailClient from '@/components/EmojiDetailClient';
import { EmojiDetailStructuredData } from '@/components/StructuredData';
import { getAssetUrl } from '@/config/cdn';
import { getEmojiKeywords, getEmojiName } from '@/lib/emoji-i18n';
import { loadEmojiIndexServer } from '@/lib/emoji-server';
import { getEmojiDataForPlatform, PLATFORM_CONFIGS } from '@/lib/platforms';
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
  const displayKeywords = getEmojiKeywords(emoji, locale);

  // 获取其他平台的emoji数据
  const platforms = Object.keys(PLATFORM_CONFIGS) as PlatformType[];
  const otherPlatforms = platforms
    .filter(p => p !== selectedPlatform)
    .map(platform => {
      const platformData = getEmojiDataForPlatform(platform, localizedEmojiData);
      const platformEmoji = platformData.emojis.find((e: Emoji) => e.id === emoji.id);
      return {
        platform,
        emoji: platformEmoji,
        // 这里需要在客户端组件中获取翻译
        name: platform
      };
    })
    .filter(item => item.emoji);

  // 获取第一个可用样式的图片URL用于结构化数据
  const getAllAvailableStyles = (): string[] => {
    const allStyles = Object.keys(emoji.styles);
    const standardStyles = allStyles.filter(style =>
      ['3d', 'color', 'flat', 'high-contrast'].includes(style)
    );

    if (standardStyles.length === 0) {
      return allStyles.filter(style =>
        !style.includes('-default') &&
        !style.includes('dark') &&
        !style.includes('light') &&
        !style.includes('medium') &&
        style !== 'default'
      );
    }

    return standardStyles;
  };

  const getCurrentStyleUrl = (style: string): string => {
    let imagePath = emoji.styles[style] || '';

    if (!imagePath && ['3d', 'color', 'flat', 'high-contrast'].includes(style)) {
      const defaultStyleKey = `${style}-default`;
      imagePath = emoji.styles[defaultStyleKey] || '';
    }

    return imagePath;
  };

  const availableStyles = getAllAvailableStyles();
  const firstAvailableStyle = availableStyles.length > 0 ? availableStyles[0] : '3d';
  const currentStyleUrl = getCurrentStyleUrl(firstAvailableStyle);

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
        }}
        imageUrl={currentStyleUrl ? getAssetUrl(currentStyleUrl) : undefined}
      />

      {/* 客户端交互组件 */}
      <EmojiDetailClient
        emoji={emoji}
        selectedPlatform={selectedPlatform}
        otherPlatforms={otherPlatforms}
        locale={locale}
        localeParam={locale}
        platformSlug={platformSlug}
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
