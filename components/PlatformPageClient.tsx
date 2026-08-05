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
    <div className="min-h-screen bg-transparent">
      {/* Platform Title */}
      <div className="w-full bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="text-center mb-6">
            <h1 className="title-gradient font-display text-3xl font-bold md:text-5xl">
              {t(`platforms.${selectedPlatform}`)}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-muted-foreground md:text-base">
              {t(`platformDescriptions.${selectedPlatform}`)}
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="clay-card-soft w-full max-w-2xl p-2">
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
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
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
        <main className="min-w-0 flex-1">
          {/* Results Info */}
          <div className="clay-card-soft mb-4 flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center md:mb-6">
            <div className="text-sm font-semibold text-muted-foreground md:text-base">
              {t('common.found')} <span className="font-display text-base font-bold text-foreground md:text-lg">{totalItems}</span> {t('common.emojis')}
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
