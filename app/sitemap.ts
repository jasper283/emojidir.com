import { locales, type Locale } from '@/i18n/config';
import { getAllPosts } from '@/lib/mdx';
import { PLATFORM_CONFIGS } from '@/lib/platforms';
import type { CompactEmojiIndex } from '@/types/emoji';
import { expandEmojiIndex } from '@/types/emoji';
import type { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
// 构建时导入数据（缩写格式）
import compactEmojiIndexData from '@/data/emoji-index.json';

const baseUrl = 'https://emojidir.com';
const platformSlugs = Object.keys(PLATFORM_CONFIGS).map((platform) => `${platform}-emoji`);

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
  const emojiUpdatedAt = new Date(baseEmojiData.generatedAt);
  const blogLocales = locales.filter((locale) =>
    fs.existsSync(path.join(process.cwd(), 'content/blog', locale))
  );
  const postsByLocale = new Map<Locale, Awaited<ReturnType<typeof getAllPosts>>>();

  await Promise.all(
    blogLocales.map(async (locale) => {
      postsByLocale.set(locale, await getAllPosts(locale));
    })
  );

  const allBlogDates = Array.from(postsByLocale.values())
    .flat()
    .map((post) => post.date);
  const blogUpdatedAt = latestDate(allBlogDates, emojiUpdatedAt);
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

  // 详情页：收录三个规范平台的详情 URL，不收录旧的无后缀别名。
  for (const locale of locales) {
    for (const platformSlug of platformSlugs) {
      for (const emoji of baseEmojiData.emojis) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/${platformSlug}/${emoji.id}`,
          lastModified: emojiUpdatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: localizedAlternates(
            (alternateLocale) => `${baseUrl}/${alternateLocale}/${platformSlug}/${emoji.id}`
          ),
        });
      }
    }
  }

  // 博客列表页：只收录真正存在本地化内容的语言目录。
  for (const locale of blogLocales) {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: blogUpdatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          ...Object.fromEntries(
            blogLocales.map((alternateLocale) => [
              alternateLocale,
              `${baseUrl}/${alternateLocale}/blog`,
            ])
          ),
          'x-default': `${baseUrl}/en/blog`,
        },
      },
    });
  }

  // 博客文章页：按文章 frontmatter 的 date 设置 lastModified。
  const blogSlugs = new Set(
    Array.from(postsByLocale.values())
      .flat()
      .map((post) => post.slug)
  );

  for (const slug of blogSlugs) {
    const translatedLocales = blogLocales.filter((locale) =>
      postsByLocale.get(locale)?.some((post) => post.slug === slug)
    );
    const postDates = translatedLocales.flatMap((locale) =>
      (postsByLocale.get(locale) ?? [])
        .filter((post) => post.slug === slug)
        .map((post) => post.date)
    );

    for (const locale of translatedLocales) {
      const localizedPost = postsByLocale.get(locale)?.find((post) => post.slug === slug);
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified: latestDate(localizedPost ? [localizedPost.date] : postDates, blogUpdatedAt),
        changeFrequency: 'yearly',
        priority: 0.5,
        alternates: {
          languages: {
            ...Object.fromEntries(
              translatedLocales.map((alternateLocale) => [
                alternateLocale,
                `${baseUrl}/${alternateLocale}/blog/${slug}`,
              ])
            ),
            'x-default': `${baseUrl}/en/blog/${slug}`,
          },
        },
      });
    }
  }

  return sitemapEntries;
}
