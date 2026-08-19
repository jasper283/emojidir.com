import { locales, type Locale } from '@/i18n/config';
import { VISIBLE_PLATFORM_CONFIGS } from '@/lib/platforms';
import { EMOJI_PAGE_TEMPLATE_UPDATED_AT } from '@/lib/sitemap-dates';
import type { CompactEmojiIndex } from '@/types/emoji';
import { expandEmojiIndex } from '@/types/emoji';
import type { MetadataRoute } from 'next';
// 构建时导入数据（缩写格式）
import compactEmojiIndexData from '@/data/emoji-index.json';
import emojiSeoData from '@/data/emoji-seo.json';

export const dynamic = 'force-static';

const baseUrl = 'https://emojidir.com';
const platformSlugs = Object.keys(VISIBLE_PLATFORM_CONFIGS).map((platform) => `${platform}-emoji`);
const indexedDetailPlatformSlug = 'fluent-emoji';

function localizedAlternates(pathForLocale: (locale: Locale) => string) {
  return {
    languages: {
      ...Object.fromEntries(locales.map((locale) => [locale, pathForLocale(locale)])),
      'x-default': pathForLocale('en'),
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // 语言首页：使用当前 Emoji 数据生成时间，不伪造为每次请求的当前时间。
  for (const locale of locales) {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: emojiUpdatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: localizedAlternates((alternateLocale) => `${baseUrl}/${alternateLocale}`),
    });
  }

  // 平台首页：所有平台都使用同一份 Emoji 索引数据。
  for (const locale of locales) {
    for (const platformSlug of platformSlugs) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${platformSlug}`,
        lastModified: emojiUpdatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: localizedAlternates(
          (alternateLocale) => `${baseUrl}/${alternateLocale}/${platformSlug}`
        ),
      });
    }
  }

  // 详情页：只收录内容最完整的 Fluent 主平台，其他平台详情页通过 canonical 合并到这里。
  for (const locale of locales) {
    for (const emoji of baseEmojiData.emojis) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${indexedDetailPlatformSlug}/${emoji.id}`,
        lastModified: emojiUpdatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: localizedAlternates(
          (alternateLocale) => `${baseUrl}/${alternateLocale}/${indexedDetailPlatformSlug}/${emoji.id}`
        ),
      });
    }
  }

  return sitemapEntries;
}
