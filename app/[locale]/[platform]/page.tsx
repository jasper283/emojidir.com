import PlatformPageClient from '@/components/PlatformPageClient';
import { CollectionPageStructuredData } from '@/components/StructuredData';
import { searchEmojis } from '@/lib/emoji-i18n';
import { loadEmojiIndexServer } from '@/lib/emoji-server';
import { PLATFORM_PAGE_SIZE, parsePlatformPage } from '@/lib/platform-pagination';
import { getEmojiDataForPlatform, PLATFORM_CONFIGS } from '@/lib/platforms';
import type { Emoji, PlatformType } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const baseUrl = 'https://emojidir.com';

interface PlatformPageProps {
  params: Promise<{
    locale: string;
    platform: string;
  }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PlatformPageProps): Promise<Metadata> {
  const { locale, platform } = await params;
  const { page, search, category } = await searchParams;
  const currentPage = parsePlatformPage(page);

  // Filtered result URLs will receive their indexing policy separately. Only
  // give numbered, unfiltered pages a self-referencing canonical URL here.
  if (currentPage <= 1 || search || category) {
    return {};
  }

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}/${platform}?page=${currentPage}`,
    },
    openGraph: {
      url: `${baseUrl}/${locale}/${platform}?page=${currentPage}`,
    },
  };
}

export default async function PlatformPage({ params, searchParams }: PlatformPageProps) {
  const { locale, platform: platformSlug } = await params;
  const { search, category, page: pageParam } = await searchParams;
  const selectedPlatform = platformSlug?.replace('-emoji', '') as PlatformType || 'fluent';

  if (!PLATFORM_CONFIGS[selectedPlatform] || platformSlug !== `${selectedPlatform}-emoji`) {
    notFound();
  }

  // 在服务端加载和合并语言数据
  const localizedEmojiData = await loadEmojiIndexServer(locale);

  // 根据选择的平台获取对应的emoji数据
  const emojiData = getEmojiDataForPlatform(selectedPlatform, localizedEmojiData);
  const searchQuery = search?.trim() || '';
  const selectedCategory = category || 'all';
  const currentPage = parsePlatformPage(pageParam);

  let filteredEmojis = emojiData.emojis;
  if (selectedCategory !== 'all') {
    filteredEmojis = filteredEmojis.filter((emoji: Emoji) => emoji.group === selectedCategory);
  }
  if (searchQuery) {
    filteredEmojis = searchEmojis(filteredEmojis, searchQuery, locale);
  }

  const totalItems = filteredEmojis.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PLATFORM_PAGE_SIZE));
  if (currentPage > totalPages) {
    notFound();
  }

  const pageStart = (currentPage - 1) * PLATFORM_PAGE_SIZE;
  const pageEmojis = filteredEmojis.slice(pageStart, pageStart + PLATFORM_PAGE_SIZE);
  const categoryCounts = Object.fromEntries(
    emojiData.categories.map((categoryName: string) => [
      categoryName,
      emojiData.emojisByCategory[categoryName]?.length || 0,
    ])
  );

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <CollectionPageStructuredDataWrapper
        locale={locale}
        platform={platformSlug}
        selectedPlatform={selectedPlatform}
        totalEmojis={emojiData.emojis.length}
        page={!searchQuery && selectedCategory === 'all' ? currentPage : 1}
      />

      {/* 客户端交互组件 */}
      <PlatformPageClient
        emojis={pageEmojis}
        categories={emojiData.categories}
        categoryCounts={categoryCounts}
        selectedPlatform={selectedPlatform}
        locale={locale}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
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
