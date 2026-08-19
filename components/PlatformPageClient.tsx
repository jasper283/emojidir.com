'use client';

import EmojiGrid from '@/components/EmojiGrid';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { Badge } from '@/components/ui/badge';
import { buildPlatformPageHref, parsePlatformPage, PLATFORM_PAGE_SIZE } from '@/lib/platform-pagination';
import { mergeEmojiIndexWithLocale, searchEmojis } from '@/lib/emoji-i18n';
import { filterClientPlatformEmojis, getClientEmojiDataForPlatform, parseClientEmojiIndex, type EmojiSaveAssetIndex } from '@/lib/emoji-client-data';
import { PLATFORM_CONFIGS } from '@/lib/platforms';
import type { CompactEmojiIndex, Emoji, EmojiIndex, PlatformType, StyleType } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

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

function readLocationFilters() {
  if (typeof window === 'undefined') {
    return { search: '', category: 'all', page: 1 };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get('search')?.trim() || '',
    category: params.get('category') || 'all',
    page: parsePlatformPage(params.get('page') || undefined),
  };
}

async function loadPlatformEmojis(locale: string, platform: PlatformType): Promise<Emoji[]> {
  const [baseResponse, assetsResponse] = await Promise.all([
    fetch('/data/emoji-index.json', { cache: 'force-cache' }),
    fetch('/data/emojisave-assets.json', { cache: 'force-cache' }),
  ]);
  if (!baseResponse.ok || !assetsResponse.ok) throw new Error('Unable to load emoji index');

  const baseIndex = parseClientEmojiIndex(await baseResponse.json() as CompactEmojiIndex);
  const assets = await assetsResponse.json() as EmojiSaveAssetIndex;
  let localeIndex: EmojiIndex | null = null;

  if (locale !== 'en') {
    const localeResponse = await fetch(`/data/emoji-index-${locale}.json`, { cache: 'force-cache' });
    if (localeResponse.ok) {
      localeIndex = parseClientEmojiIndex(await localeResponse.json() as CompactEmojiIndex);
    }
  }

  const localizedIndex = mergeEmojiIndexWithLocale(baseIndex, localeIndex);
  const platformData = getClientEmojiDataForPlatform(
    platform,
    localizedIndex,
    assets
  );

  return filterClientPlatformEmojis(platformData.emojis, platform, assets);
}

export default function PlatformPageClient({
  emojis: initialEmojis,
  categories: initialCategories,
  categoryCounts: initialCategoryCounts,
  selectedPlatform,
  locale,
}: PlatformPageClientProps) {
  const t = useTranslations();
  const basePath = `/${locale}/${selectedPlatform}-emoji`;
  const [allEmojis, setAllEmojis] = useState<Emoji[] | null>(null);
  const [categories, setCategories] = useState(initialCategories);
  const [categoryCounts, setCategoryCounts] = useState(initialCategoryCounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const defaultStyle = PLATFORM_CONFIGS[selectedPlatform]?.styles[0] || '3d';
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(defaultStyle);

  useEffect(() => {
    const filters = readLocationFilters();
    setSearchQuery(filters.search);
    setSearchInput(filters.search);
    setSelectedCategory(filters.category);
    setCurrentPage(filters.page);
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadPlatformEmojis(locale, selectedPlatform)
      .then((loadedEmojis) => {
        if (cancelled) return;

        const nextCounts = loadedEmojis.reduce<Record<string, number>>((counts, emoji) => {
          counts[emoji.group] = (counts[emoji.group] || 0) + 1;
          return counts;
        }, {});

        setAllEmojis(loadedEmojis);
        setCategories(Object.keys(nextCounts));
        setCategoryCounts(nextCounts);
      })
      .catch((error) => {
        console.error('Failed to load emoji index:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, selectedPlatform]);

  useEffect(() => {
    setSelectedStyle(defaultStyle);
  }, [defaultStyle]);

  const sourceEmojis = allEmojis || initialEmojis;
  const filteredEmojis = useMemo(() => {
    let result = sourceEmojis;

    if (selectedCategory !== 'all') {
      result = result.filter((emoji) => emoji.group === selectedCategory);
    }

    return searchQuery ? searchEmojis(result, searchQuery, locale) : result;
  }, [locale, searchQuery, selectedCategory, sourceEmojis]);

  const totalItems = filteredEmojis.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PLATFORM_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PLATFORM_PAGE_SIZE;
  const pageEmojis = allEmojis
    ? filteredEmojis.slice(pageStart, pageStart + PLATFORM_PAGE_SIZE)
    : safeCurrentPage === 1
      ? initialEmojis
      : [];

  const navigateToFilters = (nextSearch: string, nextCategory: string, nextPage = 1) => {
    const href = buildPlatformPageHref(basePath, nextPage, nextSearch, nextCategory);
    window.history.pushState({}, '', href);
    setSearchQuery(nextSearch.trim());
    setSearchInput(nextSearch);
    setSelectedCategory(nextCategory || 'all');
    setCurrentPage(nextPage);
  };

  return (
    <div className="min-h-screen bg-transparent">
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

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        <FilterSidebar
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          selectedCategory={selectedCategory}
          onCategoryChange={(category) => navigateToFilters(searchInput, category)}
          categories={categories}
          categoryCounts={categoryCounts}
          currentPlatform={selectedPlatform}
        />

        <main className="min-w-0 flex-1">
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

          <EmojiGrid emojis={pageEmojis} style={selectedStyle} />

          {totalItems > 0 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={PLATFORM_PAGE_SIZE}
              basePath={basePath}
              searchQuery={searchQuery}
              category={selectedCategory}
              onNavigate={(page) => navigateToFilters(searchQuery, selectedCategory, page)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
