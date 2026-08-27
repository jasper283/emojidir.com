'use client';

import EmojiDetailClient from '@/components/EmojiDetailClient';
import { getAssetUrl } from '@/config/cdn';
import { getFirstEmojiAssetPath } from '@/lib/emoji-assets';
import { mergeEmojiIndexWithLocale } from '@/lib/emoji-i18n';
import {
  getClientEmojiDataForPlatform,
  getClientPngAssetPath,
  hasClientPngAsset,
  parseClientEmojiIndex,
  type EmojiSaveAssetIndex,
} from '@/lib/emoji-client-data';
import { VISIBLE_PLATFORM_CONFIGS } from '@/lib/platforms';
import {
  type CompactEmojiIndex,
  type Emoji,
  type EmojiSeoData,
  type EmojipediaEmojiData,
  type EmojiIndex,
  type PlatformType,
} from '@/types/emoji';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface StaticEmojiDetailClientProps {
  locale: string;
  platformSlug: string;
  slug: string;
}

interface EmojiSeoIndex {
  emojis: Record<string, EmojiSeoData>;
}

interface EmojipediaIndex {
  emojis: Record<string, EmojipediaEmojiData>;
}

function hasLocalizedText(content: NonNullable<EmojipediaEmojiData['localizedContent']>[string]) {
  return Boolean(content.meaning || content.commonUses.length > 0 || content.usageNotes.length > 0);
}

function localizeEmojipedia(
  emoji: EmojipediaEmojiData | undefined,
  allEmojis: Record<string, EmojipediaEmojiData>,
  locale: string
): EmojipediaEmojiData | undefined {
  if (!emoji) return undefined;

  const relatedEmojis = emoji.relatedEmojis.map((related) => {
    const relatedData = allEmojis[related.slug];
    return {
      ...related,
      name: relatedData?.localizedContent?.[locale]?.name || relatedData?.name || related.name || null,
    };
  });

  if (locale === 'en') return { ...emoji, relatedEmojis };

  const localized = emoji.localizedContent?.[locale];
  if (!localized || !hasLocalizedText(localized)) {
    return { ...emoji, relatedEmojis };
  }

  return {
    ...emoji,
    name: localized.name || emoji.name,
    meaning: localized.meaning,
    commonUses: localized.commonUses,
    usageNotes: localized.usageNotes,
    relatedEmojis,
    sourceUrl: localized.sourceUrl || emoji.sourceUrl,
  };
}

function getFirstStyleUrl(emoji: Emoji) {
  return getFirstEmojiAssetPath(emoji.styles);
}

async function loadEmojiDetail(locale: string, platformSlug: string, slug: string) {
  const platform = platformSlug.replace('-emoji', '') as PlatformType;
  const [baseResponse, localeResponse, seoResponse, emojipediaResponse, assetsResponse] = await Promise.all([
    fetch('/data/emoji-index.json', { cache: 'force-cache' }),
    locale === 'en'
      ? Promise.resolve(null)
      : fetch(`/data/emoji-index-${locale}.json`, { cache: 'force-cache' }),
    fetch('/data/emoji-seo.json', { cache: 'force-cache' }),
    fetch('/data/emojipedia-content.json', { cache: 'force-cache' }),
    fetch('/data/emojisave-assets.json', { cache: 'force-cache' }),
  ]);

  if (!baseResponse.ok || !seoResponse.ok || !emojipediaResponse.ok || !assetsResponse.ok) {
    throw new Error('Unable to load static emoji detail data');
  }

  const baseIndex = parseClientEmojiIndex(await baseResponse.json() as CompactEmojiIndex);
  const localeIndex: EmojiIndex | null = localeResponse?.ok
    ? parseClientEmojiIndex(await localeResponse.json() as CompactEmojiIndex)
    : null;
  const assets = await assetsResponse.json() as EmojiSaveAssetIndex;
  const localizedIndex = mergeEmojiIndexWithLocale(baseIndex, localeIndex);
  const emojiData = getClientEmojiDataForPlatform(platform, localizedIndex, assets);
  const emoji = emojiData.emojis.find((candidate: Emoji) => candidate.id === decodeURIComponent(slug));

  if (!emoji) throw new Error('Emoji not found');

  const seoIndex = await seoResponse.json() as EmojiSeoIndex;
  const emojipediaIndex = await emojipediaResponse.json() as EmojipediaIndex;
  const seoData = seoIndex.emojis[emoji.id];
  const emojipediaData = localizeEmojipedia(emojipediaIndex.emojis[emoji.id], emojipediaIndex.emojis, locale);
  const platforms = Object.keys(VISIBLE_PLATFORM_CONFIGS) as PlatformType[];
  const otherPlatforms = platforms
    .filter((candidatePlatform) => candidatePlatform !== platform)
    .map((candidatePlatform) => {
      const platformData = getClientEmojiDataForPlatform(candidatePlatform, localizedIndex, assets);
      const platformEmoji = platformData.emojis.find((candidate: Emoji) => candidate.id === emoji.id);
      return { platform: candidatePlatform, emoji: platformEmoji, name: candidatePlatform };
    })
    .filter((item) => item.emoji && Object.values(item.emoji.styles).some(Boolean));

  const variantRootId = emoji.variantOf || emoji.id;
  const variantEmojis = emojiData.emojis
    .filter((candidate: Emoji) =>
      candidate.id !== emoji.id &&
      (candidate.id === variantRootId || candidate.variantOf === variantRootId)
    )
    .sort((a: Emoji, b: Emoji) => {
      if (a.id === variantRootId) return -1;
      if (b.id === variantRootId) return 1;
      return a.name.localeCompare(b.name);
    });

  const pngAssetPath = hasClientPngAsset(assets, platform, emoji.id)
    ? getClientPngAssetPath(platform, emoji.id)
    : undefined;

  return {
    emoji,
    seoData,
    emojipediaData,
    otherPlatforms,
    variantEmojis,
    pngAssetPath,
    platform,
    imageUrl: getFirstStyleUrl(emoji) ? getAssetUrl(getFirstStyleUrl(emoji)) : undefined,
  };
}

export default function StaticEmojiDetailClient({
  locale,
  platformSlug,
  slug,
}: StaticEmojiDetailClientProps) {
  const pathname = usePathname();
  const route = useMemo(() => {
    const parts = pathname?.split('/').filter(Boolean) ?? [];
    if (parts.length >= 3) {
      return {
        locale: parts[0],
        platformSlug: parts[1],
        slug: parts.slice(2).join('/'),
      };
    }

    return { locale, platformSlug, slug };
  }, [locale, pathname, platformSlug, slug]);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof loadEmojiDetail>> | null>(null);

  // Cloudflare Pages proxies alternate platform detail URLs to the generated
  // Fluent HTML to stay within the free file limit. Recover the original URL
  // from the active pathname so client-side platform switches reload the
  // requested platform's data and assets.

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    loadEmojiDetail(route.locale, route.platformSlug, route.slug)
      .then((loadedDetail) => {
        if (!cancelled) setDetail(loadedDetail);
      })
      .catch((error) => {
        console.error('Failed to load emoji detail:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [route.locale, route.platformSlug, route.slug]);

  if (!detail) {
    return <div className="min-h-screen bg-transparent" aria-busy="true" />;
  }

  return (
    <EmojiDetailClient
      key={`${route.locale}/${route.platformSlug}/${route.slug}`}
      emoji={detail.emoji}
      seoData={detail.seoData}
      emojipediaData={detail.emojipediaData}
      selectedPlatform={detail.platform}
      otherPlatforms={detail.otherPlatforms}
      variantEmojis={detail.variantEmojis}
      pngAssetPath={detail.pngAssetPath}
      locale={route.locale}
      localeParam={route.locale}
      platformSlug={route.platformSlug}
    />
  );
}
