import { locales, type Locale } from '@/i18n/config';
import { VISIBLE_PLATFORM_CONFIGS } from '@/lib/platforms';
import { EMOJI_PAGE_TEMPLATE_UPDATED_AT } from '@/lib/sitemap-dates';
import type { CompactEmojiIndex } from '@/types/emoji';
import { expandEmojiIndex } from '@/types/emoji';
import type { MetadataRoute } from 'next';
import compactEmojiIndexData from '@/data/emoji-index.json';
import emojiSeoData from '@/data/emoji-seo.json';

const baseUrl = 'https://emojidir.com';
const platformSlugs = Object.keys(VISIBLE_PLATFORM_CONFIGS).map((platform) => `${platform}-emoji`);
const indexedDetailPlatformSlug = 'fluent-emoji';

function sitemapUrl(path: string): string {
  return `${baseUrl}${path.endsWith('/') ? path : `${path}/`}`;
}

function localizedAlternates(pathForLocale: (locale: Locale) => string) {
  return {
    languages: {
      ...Object.fromEntries(locales.map((locale) => [locale, sitemapUrl(pathForLocale(locale))])),
      'x-default': sitemapUrl(pathForLocale('en')),
    },
  };
}

function latestDate(dates: string[], fallback: Date): Date {
  const timestamps = dates
    .map((date) => new Date(date).getTime())
    .filter((timestamp) => Number.isFinite(timestamp));

  return timestamps.length > 0
    ? new Date(Math.max(...timestamps))
    : fallback;
}

export function buildSitemapEntries(
  includedLocales: readonly Locale[] = locales
): MetadataRoute.Sitemap {
  const baseEmojiData = expandEmojiIndex(compactEmojiIndexData as CompactEmojiIndex);
  const emojiUpdatedAt = latestDate(
    [
      baseEmojiData.generatedAt,
      emojiSeoData.source.generatedAt,
      EMOJI_PAGE_TEMPLATE_UPDATED_AT,
    ],
    new Date(EMOJI_PAGE_TEMPLATE_UPDATED_AT)
  );
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of includedLocales) {
    sitemapEntries.push({
      url: sitemapUrl(`/${locale}`),
      lastModified: emojiUpdatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: localizedAlternates((alternateLocale) => `/${alternateLocale}`),
    });
  }

  for (const locale of includedLocales) {
    for (const platformSlug of platformSlugs) {
      sitemapEntries.push({
        url: sitemapUrl(`/${locale}/${platformSlug}`),
        lastModified: emojiUpdatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: localizedAlternates(
          (alternateLocale) => `/${alternateLocale}/${platformSlug}`
        ),
      });
    }
  }

  for (const locale of includedLocales) {
    for (const emoji of baseEmojiData.emojis) {
      sitemapEntries.push({
        url: sitemapUrl(`/${locale}/${indexedDetailPlatformSlug}/${emoji.id}`),
        lastModified: emojiUpdatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: localizedAlternates(
          (alternateLocale) => `/${alternateLocale}/${indexedDetailPlatformSlug}/${emoji.id}`
        ),
      });
    }
  }

  return sitemapEntries;
}

