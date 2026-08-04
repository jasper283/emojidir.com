'use client';

import EmojiGrid from '@/components/EmojiGrid';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { Badge } from '@/components/ui/badge';
import { buildPlatformPageHref, PLATFORM_PAGE_SIZE } from '@/lib/platform-pagination';
import type { Emoji, PlatformType, StyleType } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PlatformPageClientProps {
  emojis: Emoji[];
  categories: string[];
  categoryCounts: Record<string, number>;
  selectedPlatform: PlatformType;
  locale: string;
  searchQuery: string;
  selectedCategory: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function PlatformPageClient({
  emojis,
  categories,
  categoryCounts,
  selectedPlatform,
  locale,
  searchQuery,
  selectedCategory,
  currentPage,
  totalPages,
  totalItems,
}: PlatformPageClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('3d');
  const basePath = `/${locale}/${selectedPlatform}-emoji`;

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const navigateToFilters = (nextSearch: string, nextCategory: string) => {
    router.push(buildPlatformPageHref(basePath, 1, nextSearch, nextCategory));
  };

  return (
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
                value={searchInput}
                onChange={setSearchInput}
                onSubmit={(value) => navigateToFilters(value, selectedCategory)}
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
          onCategoryChange={(category) => navigateToFilters(searchInput, category)}
          categories={categories}
          categoryCounts={categoryCounts}
          currentPlatform={selectedPlatform}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Results Info */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-muted-foreground text-sm md:text-base">
              {t('common.found')} <span className="font-semibold text-foreground text-base md:text-lg">{totalItems}</span> {t('common.emojis')}
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
          <EmojiGrid emojis={emojis} style={selectedStyle} />

          {/* Pagination */}
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={PLATFORM_PAGE_SIZE}
              basePath={basePath}
              searchQuery={searchQuery}
              category={selectedCategory}
            />
          )}
        </main>
      </div>
    </div>
  );
}
