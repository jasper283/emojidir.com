import PlatformPageClient from '@/components/PlatformPageClient';
import { CollectionPageStructuredData } from '@/components/StructuredData';
import { locales } from '@/i18n/config';
import { hasEmojiSaveWebpAsset, type EmojiSavePlatform } from '@/lib/emojisave-assets';
import { loadEmojiIndexServer } from '@/lib/emoji-server';
import { PLATFORM_PAGE_SIZE } from '@/lib/platform-pagination';
import { getEmojiDataForPlatform, PLATFORM_CONFIGS } from '@/lib/platforms';
import type { Emoji, PlatformType } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const baseUrl = 'https://emojidir.com';
const emojiSavePlatforms = new Set<PlatformType>(['fluent', 'nato', 'apple', 'microsoft', 'twitter']);

function shouldShowOnPlatformList(emoji: Emoji, platform: PlatformType): boolean {
  if (emoji.listVisibility === 'variant') return false;
  if (!emojiSavePlatforms.has(platform)) return true;
  return hasEmojiSaveWebpAsset(platform as EmojiSavePlatform, emoji.id);
}

interface PlatformPageProps {
  params: Promise<{
    locale: string;
    platform: string;
  }>;
}

export async function generateMetadata({ params }: PlatformPageProps): Promise<Metadata> {
  const { locale, platform } = await params;
  const basePath = `${baseUrl}/${locale}/${platform}`;

  return {
    alternates: {
      canonical: basePath,
      languages: Object.fromEntries(
        locales.map((alternateLocale) => [
          alternateLocale,
          `${baseUrl}/${alternateLocale}/${platform}`,
        ])
      ),
    },
    openGraph: {
      url: basePath,
    },
  };
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { locale, platform: platformSlug } = await params;
  const selectedPlatform = platformSlug?.replace('-emoji', '') as PlatformType || 'fluent';

  if (!PLATFORM_CONFIGS[selectedPlatform] || platformSlug !== `${selectedPlatform}-emoji`) {
    notFound();
  }

  // 在服务端加载和合并语言数据
  const localizedEmojiData = await loadEmojiIndexServer(locale);

  // 根据选择的平台获取对应的emoji数据
  const emojiData = getEmojiDataForPlatform(selectedPlatform, localizedEmojiData);
  const listEmojis = emojiData.emojis.filter((emoji: Emoji) =>
    shouldShowOnPlatformList(emoji, selectedPlatform)
  );
  const pageEmojis = listEmojis.slice(0, PLATFORM_PAGE_SIZE);
  const categoryCounts = Object.fromEntries(
    emojiData.categories.map((categoryName: string) => [
      categoryName,
      listEmojis.filter((emoji: Emoji) => emoji.group === categoryName).length,
    ])
  );

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <CollectionPageStructuredDataWrapper
        locale={locale}
        platform={platformSlug}
        selectedPlatform={selectedPlatform}
        totalEmojis={listEmojis.length}
        page={1}
      />

      {/* 客户端交互组件 */}
      <PlatformPageClient
        emojis={pageEmojis}
        categories={emojiData.categories}
        categoryCounts={categoryCounts}
        selectedPlatform={selectedPlatform}
        locale={locale}
        searchQuery=""
        selectedCategory="all"
        currentPage={1}
        totalPages={Math.max(1, Math.ceil(listEmojis.length / PLATFORM_PAGE_SIZE))}
        totalItems={listEmojis.length}
      />
    </>
  );
}

// 单独的结构化数据组件（客户端组件用于翻译）
function CollectionPageStructuredDataWrapper({
  locale,
  platform,
  selectedPlatform,
  totalEmojis,
  page,
}: {
  locale: string;
  platform: string;
  selectedPlatform: PlatformType;
  totalEmojis: number;
  page?: number;
}) {
  const t = useTranslations();

  return (
    <CollectionPageStructuredData
      locale={locale}
      platform={platform}
      platformName={t(`platforms.${selectedPlatform}`)}
      platformDescription={t(`platformDescriptions.${selectedPlatform}`)}
      totalEmojis={totalEmojis}
      page={page}
    />
  );
}
