'use client';

import EmojiGrid from '@/components/EmojiGrid';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { CollectionPageStructuredData } from '@/components/StructuredData';
import { Badge } from '@/components/ui/badge';
import { loadEmojiIndexForLocale, mergeEmojiIndexWithLocale, searchEmojis } from '@/lib/emoji-i18n';
import { getEmojiDataForPlatform } from '@/lib/platforms';
import type { Emoji, EmojiIndex, PlatformType, StyleType } from '@/types/emoji';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
// 构建时导入数据
import emojiIndexData from '@/data/emoji-index.json';

// 每页显示的emoji数量（7行 × 8列 = 56，适合所有屏幕尺寸）
const ITEMS_PER_PAGE = 56;

function PlatformPageContent() {
  const t = useTranslations();
  const locale = useLocale(); // 获取当前语言
  const params = useParams();
  const searchParams = useSearchParams();
  const baseEmojiData = emojiIndexData as EmojiIndex;

  // 从 URL 获取平台参数
  const platformSlug = params.platform as string;
  const selectedPlatform = platformSlug?.replace('-emoji', '') as PlatformType || 'fluent';

  // 从 URL 获取搜索参数
  const initialSearchQuery = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('3d');
  const [currentPage, setCurrentPage] = useState(1);
  const [localizedEmojiData, setLocalizedEmojiData] = useState<EmojiIndex>(baseEmojiData);

  // 当URL参数变化时更新状态
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'all';
    setSearchQuery(urlSearchQuery);
    setSelectedCategory(urlCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 加载对应语言的 emoji 索引数据
  useEffect(() => {
    async function loadLocaleData() {
      const localeIndex = await loadEmojiIndexForLocale(locale);
      const mergedData = mergeEmojiIndexWithLocale(baseEmojiData, localeIndex);
      setLocalizedEmojiData(mergedData);
    }

    loadLocaleData();
  }, [locale, baseEmojiData]);

  // 根据选择的平台获取对应的emoji数据
  const emojiData = useMemo(() => {
    return getEmojiDataForPlatform(selectedPlatform, localizedEmojiData);
  }, [selectedPlatform, localizedEmojiData]);

  // 过滤和搜索 emoji（支持多语言）
  const filteredEmojis = useMemo(() => {
    let emojis = emojiData.emojis;

    // 按分类过滤
    if (selectedCategory !== 'all') {
      emojis = emojis.filter((emoji: Emoji) => emoji.group === selectedCategory);
    }

    // 按搜索关键词过滤（使用多语言搜索）
    if (searchQuery.trim()) {
      emojis = searchEmojis(emojis, searchQuery, locale);
    }

    return emojis;
  }, [emojiData, selectedCategory, searchQuery, locale]);

  // 当过滤条件改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStyle]);

  // 计算总页数
  const totalPages = Math.ceil(filteredEmojis.length / ITEMS_PER_PAGE);

  // 获取当前页的emoji
  const paginatedEmojis = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredEmojis.slice(startIndex, endIndex);
  }, [filteredEmojis, currentPage]);

  // 滚动到顶部
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <CollectionPageStructuredData
        locale={locale}
        platform={params.platform as string}
        platformName={t(`platforms.${selectedPlatform}`)}
        platformDescription={t(`platformDescriptions.${selectedPlatform}`)}
        totalEmojis={filteredEmojis.length}
      />

      <div className="min-h-screen bg-background">
        {/* Platform Title */}
        <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 border-b w-full">
          <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                {t(`platforms.${selectedPlatform}`)}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                {t(`platformDescriptions.${selectedPlatform}`)}
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex max-w-7xl mx-auto">
          {/* Filter Sidebar */}
          <FilterSidebar
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={emojiData.categories}
            emojisByCategory={emojiData.emojisByCategory}
            currentPlatform={selectedPlatform}
          />

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {/* Results Info */}
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-muted-foreground text-sm md:text-base">
                {t('common.found')} <span className="font-semibold text-foreground text-base md:text-lg">{filteredEmojis.length}</span> {t('common.emojis')}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {searchQuery && (
                  <Badge variant="outline" className="text-xs md:text-sm">
                    {t('search.searchLabel')} {searchQuery}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs md:text-sm">
                  {t(`platforms.${selectedPlatform}`)}
                </Badge>
              </div>
            </div>

            {/* Emoji Grid */}
            <EmojiGrid
              emojis={paginatedEmojis}
              style={selectedStyle}
            />

            {/* Pagination */}
            {filteredEmojis.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredEmojis.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default function PlatformPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <PlatformPageContent />
    </Suspense>
  );
}
