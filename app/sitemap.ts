import { locales } from '@/i18n/config';
import { PLATFORM_CONFIGS } from '@/lib/platforms';
import type { EmojiIndex } from '@/types/emoji';
import { MetadataRoute } from 'next';
// 构建时导入数据
import emojiIndexData from '@/data/emoji-index.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://emojidir.com';
  const baseEmojiData = emojiIndexData as EmojiIndex;
  const platforms = Object.keys(PLATFORM_CONFIGS);
  const currentDate = new Date();

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. 主页 - 重定向到语言首页（优先级较低）
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}`])
        ),
      },
    });
  });

  // 2. 平台首页（主要着陆页）
  locales.forEach((locale) => {
    platforms.forEach((platform) => {
      const platformSlug = `${platform}-emoji`;
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${platformSlug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 1.0,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, `${baseUrl}/${loc}/${platformSlug}`])
          ),
        },
      });
    });
  });

  // 3. Emoji 详情页（大量页面，优先级适中）
  // 为了避免 sitemap 过大，我们只为 Fluent 平台生成详情页 sitemap
  // 其他平台的页面可以通过站内链接被发现
  const mainPlatform = 'fluent-emoji';
  locales.forEach((locale) => {
    baseEmojiData.emojis.forEach((emoji) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${mainPlatform}/${emoji.id}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              `${baseUrl}/${loc}/${mainPlatform}/${emoji.id}`,
            ])
          ),
        },
      });
    });
  });

  return sitemapEntries;
}

