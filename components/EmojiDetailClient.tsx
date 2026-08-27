'use client';

import PlatformSwitcher from '@/components/PlatformSwitcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAssetUrl } from '@/config/cdn';
import {
  getEmojiAvailableStyles,
  getEmojiStylePath,
  getFirstEmojiAssetPath,
} from '@/lib/emoji-assets';
import { getEmojiKeywords, getEmojiName } from '@/lib/emoji-i18n';
import type { Emoji, EmojiSeoData, EmojipediaEmojiData, PlatformType } from '@/types/emoji';
import { ArrowLeft, Copy, Download, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from '@/components/StaticLink';
import { useCallback, useEffect, useMemo, useState } from 'react';

function getAssetExtension(url: string): 'svg' | 'webp' | 'png' {
  const extension = url.match(/\.(svg|webp|png)(?:[?#]|$)/i)?.[1].toLowerCase();
  if (extension === 'svg' || extension === 'webp') return extension;
  return 'png';
}

interface EmojiDetailClientProps {
  emoji: Emoji;
  seoData?: EmojiSeoData;
  emojipediaData?: EmojipediaEmojiData;
  selectedPlatform: PlatformType;
  otherPlatforms: Array<{
    platform: PlatformType;
    emoji: Emoji | undefined;
    name: string;
  }>;
  variantEmojis: Emoji[];
  pngAssetPath?: string;
  locale: string;
  localeParam: string;
  platformSlug: string;
}

export default function EmojiDetailClient({
  emoji,
  seoData,
  emojipediaData,
  selectedPlatform,
  otherPlatforms,
  variantEmojis,
  pngAssetPath,
  locale,
  localeParam,
  platformSlug,
}: EmojiDetailClientProps) {
  const t = useTranslations();

  const [copiedType, setCopiedType] = useState<'glyph' | 'unicode' | null>(null);
  const [copiedVariantUnicode, setCopiedVariantUnicode] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  // 获取所有可用的样式
  const getAllAvailableStyles = useCallback((): string[] => {
    return getEmojiAvailableStyles(emoji.styles);
  }, [emoji]);

  const availableStyles = useMemo(() => getAllAvailableStyles(), [getAllAvailableStyles]);

  const getCurrentStyleUrl = useCallback((style: string): string => {
    return getEmojiStylePath(emoji.styles, style);
  }, [emoji]);

  const isStyleAvailable = useCallback((style: string): boolean => {
    return Boolean(getEmojiStylePath(emoji.styles, style));
  }, [emoji]);

  const trulyAvailableStyles = useMemo(() =>
    availableStyles.filter(isStyleAvailable),
    [availableStyles, isStyleAvailable]
  );

  const selectedStyle = useMemo(() => {
    if (trulyAvailableStyles.length > 0) {
      return trulyAvailableStyles[0];
    }
    return '3d';
  }, [trulyAvailableStyles]);

  const [currentSelectedStyle, setCurrentSelectedStyle] = useState<string>(selectedStyle);

  useEffect(() => {
    setCurrentSelectedStyle(selectedStyle);
  }, [selectedStyle]);

  const currentStyleUrl = useMemo(() =>
    getCurrentStyleUrl(currentSelectedStyle),
    [getCurrentStyleUrl, currentSelectedStyle]
  );

  // 复制到剪贴板
  const copyTextToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const copyToClipboard = async (text: string, type: 'glyph' | 'unicode') => {
    await copyTextToClipboard(text);
    setCopiedType(type);
    setCopiedVariantUnicode(null);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyVariantToClipboard = async (text: string, unicode: string) => {
    await copyTextToClipboard(text);
    setCopiedType(null);
    setCopiedVariantUnicode(unicode);
    setTimeout(() => setCopiedVariantUnicode(null), 2000);
  };

  // Noto Emoji尺寸
  const natoSizes = [32, 72, 128, 512];

  const unicodeToNatoFilename = (unicode: string): string => {
    const cleaned = unicode
      .replace(/U\+/gi, '')
      .toLowerCase()
      .split(/\s+/)
      .filter(code => code !== 'fe0e' && code !== 'fe0f')
      .join('_');
    return `emoji_u${cleaned}`;
  };

  // 获取多语言名称和关键词
  const displayName = getEmojiName(emoji, locale);
  const displayKeywords = seoData?.keywords[locale] ?? getEmojiKeywords(emoji, locale);
  const displayUnicodeVersion = seoData?.unicodeVersion
    ?? (emojipediaData?.unicodeVersion ? `Unicode ${emojipediaData.unicodeVersion}` : null);
  const displayReleaseVersion = seoData?.releaseVersion
    ?? (emojipediaData?.emojiVersion ? `Emoji ${emojipediaData.emojiVersion}` : null);

  const getUnicodeVersionUrl = (version: string): string | null => {
    const match = version.match(/^Unicode\s+(\d+)(?:\.(\d+))?$/);
    if (!match) return null;

    const [, major, minor = '0'] = match;
    return `https://www.unicode.org/versions/Unicode${major}.${minor}.0/`;
  };

  const unicodeVersionUrl = displayUnicodeVersion
    ? getUnicodeVersionUrl(displayUnicodeVersion)
    : null;
  const emojiVersionUrl = 'https://unicode.org/emoji/charts/emoji-versions.html';

  const handleCategoryClick = useCallback(() => {
    window.location.assign(`/${localeParam}/${platformSlug}?category=${encodeURIComponent(emoji.group)}`);
  }, [emoji, localeParam, platformSlug]);

  const handleKeywordClick = useCallback((keyword: string) => {
    window.location.assign(`/${localeParam}/${platformSlug}?search=${encodeURIComponent(keyword)}`);
  }, [localeParam, platformSlug]);

  const formatRelatedEmojiName = (slug: string): string => slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const downloadEmoji = async (url: string, filename: string) => {
    setDownloading(true);
    setDownloadError(false);
    try {
      // R2 CORS allows us to turn the response into a same-origin Blob URL,
      // which makes the browser honor the requested download filename.
      const response = await fetch(url, { mode: 'cors' });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setDownloadError(true);
      console.warn(t('common.downloadFailed'), error);
    } finally {
      setDownloading(false);
    }
  };

  const hasDownloadableAsset = currentStyleUrl && currentStyleUrl.length > 0;
  const hasPlatformPngAsset = Boolean(pngAssetPath);
  const emojipediaMeaning = emojipediaData?.meaning?.trim() || null;
  const hasEmojipediaContent = Boolean(emojipediaMeaning);
  const getPreviewImageUrl = (item: Emoji | undefined): string => {
    if (!item?.styles) return '';

    return getFirstEmojiAssetPath(item.styles);
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-[65px] z-30 w-full bg-background/80 backdrop-blur-xl md:top-[73px]">
        <div className="container mx-auto max-w-7xl px-4 py-3 md:py-5">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.assign(`/${localeParam}/${platformSlug}`)}
                className="flex-shrink-0 rounded-full hover:bg-card/70"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <Image src="/favicon.svg" alt={t('common.appName')} width={32} height={32} className="w-6 h-6 md:w-10 md:h-10 flex-shrink-0" priority />
                <h1 className="title-gradient font-display truncate text-lg font-bold md:text-3xl">
                  {displayName}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <PlatformSwitcher currentPlatform={selectedPlatform} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-5 md:py-8 lg:py-10">
        <div className="grid gap-5 md:gap-7 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          {/* Left Column - Emoji Display */}
          <div className="mx-auto w-full max-w-sm space-y-3 md:space-y-4 lg:sticky lg:top-36 lg:mx-0 lg:self-start">
            {/* Main Emoji Display */}
            <div className="clay-card mx-auto w-full max-w-[17.5rem] p-4 md:max-w-sm md:p-5 lg:max-w-none">
              <div className="clay-inset relative flex aspect-square items-center justify-center overflow-hidden">
                {currentStyleUrl ? (
                  <Image
                    src={getAssetUrl(currentStyleUrl)}
                    alt={emoji.name}
                    fill
                    sizes="(min-width: 1280px) 310px, (min-width: 1024px) 290px, (min-width: 768px) 304px, 260px"
                    className="object-contain p-5 md:p-7"
                    priority
                  />
                ) : (
                  <div className="text-5xl md:text-7xl lg:text-8xl">{emoji.glyph}</div>
                )}
              </div>
            </div>

            {/* Style Selection */}
            {trulyAvailableStyles.length > 1 && (
              <div className="clay-card-soft p-3 md:p-4">
                <h3 className="font-display mb-2 text-xs font-semibold text-foreground md:text-sm">{t('common.style')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {trulyAvailableStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setCurrentSelectedStyle(style)}
                      className={`min-h-10 cursor-pointer rounded-xl px-2.5 py-2 text-center transition-colors duration-200 ${currentSelectedStyle === style
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card/80 text-card-foreground hover:bg-secondary/70'
                        }`}
                    >
                      <span className="text-xs font-bold md:text-sm">
                        {t(`styles.${style}`, { defaultValue: style })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Download Section - imported platform PNG */}
            {hasPlatformPngAsset && ['fluent', 'apple', 'microsoft', 'twitter'].includes(selectedPlatform) && (
              <div className="w-full">
                <Button
                  onClick={() => {
                    downloadEmoji(
                      getAssetUrl(pngAssetPath as string),
                      `${emoji.id}_${selectedPlatform}.png`
                    );
                  }}
                  className="w-full"
                  variant="default"
                  disabled={downloading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? t('common.downloading') : t('common.downloadFormat', {
                    format: 'PNG'
                  })}
                </Button>
              </div>
            )}

            {downloadError && (
              <p className="text-center text-sm text-destructive" role="alert">
                {t('common.downloadFailedMessage')}
              </p>
            )}

            {/* Download Section - Noto Emoji */}
            {selectedPlatform === 'nato' && (
              <div className="w-full">
                <h4 className="font-display mb-3 text-center text-sm font-semibold">{t('common.downloadNotoEmoji')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {natoSizes.map((size) => (
                    <Button
                      key={size}
                      onClick={() => {
                        const filename = unicodeToNatoFilename(emoji.unicode);
                        const url = getAssetUrl(`nato-emoji/png/${size}/${filename}.png`);
                        downloadEmoji(url, `${emoji.id}_${size}px.png`);
                      }}
                      variant="outline"
                      size="sm"
                      disabled={downloading}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PNG {size}px
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Download Section - Unicode Platform */}
            {hasDownloadableAsset && selectedPlatform === 'unicode' && (
              <div className="w-full">
                <h4 className="font-display mb-3 text-center text-sm font-semibold">{t('common.downloadNotoEmoji')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {natoSizes.map((size) => (
                    <Button
                      key={size}
                      onClick={() => {
                        const filename = unicodeToNatoFilename(emoji.unicode);
                        const url = getAssetUrl(`nato-emoji/png/${size}/${filename}.png`);
                        downloadEmoji(url, `${emoji.id}_${size}px.png`);
                      }}
                      variant="outline"
                      size="sm"
                      disabled={downloading}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PNG {size}px
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-3 md:space-y-4">
            {/* Other Platforms */}
            {otherPlatforms.length > 0 && (
              <div className="clay-card-soft p-4 md:p-5">
                <h2 className="font-display mb-3 text-lg font-bold md:text-xl">{t('common.compareWithOtherPlatforms')}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {otherPlatforms.map(({ platform, emoji: platformEmoji }) => {
                    const platformSlugName = `${platform}-emoji`;
                    const platformName = t(`platforms.${platform}`);
                    const imageUrl = getPreviewImageUrl(platformEmoji);

                    return (
                      <Link
                        key={platform}
                        href={`/${localeParam}/${platformSlugName}/${emoji.id}/`}
                        className="group flex items-center gap-3 rounded-xl bg-card/80 p-2.5 transition-colors duration-200 hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title={t('common.viewOnPlatform', { platform: platformName })}
                      >
                        <div className="clay-inset flex h-12 w-12 flex-shrink-0 items-center justify-center">
                          {imageUrl ? (
                            <Image
                              src={getAssetUrl(imageUrl)}
                              alt={platformEmoji?.name || ''}
                              width={64}
                              height={64}
                              className="h-full w-full object-contain p-1.5"
                            />
                          ) : (
                            <span className="text-2xl">{platformEmoji?.glyph}</span>
                          )}
                        </div>
                        <span className="line-clamp-1 min-w-0 text-sm font-bold">
                          {platformName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {variantEmojis.length > 0 && (
              <div className="clay-card-soft p-4 md:p-5">
                <h2 className="font-display mb-3 text-lg font-bold md:text-xl">{t('common.emojiVariants')}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {variantEmojis.map((variantEmoji) => {
                    const imageUrl = getPreviewImageUrl(variantEmoji);
                    const variantName = getEmojiName(variantEmoji, locale);

                    return (
                      <Link
                        key={variantEmoji.id}
                        href={`/${localeParam}/${platformSlug}/${variantEmoji.id}/`}
                        className="group flex items-center gap-3 rounded-xl bg-card/80 p-2.5 transition-colors duration-200 hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title={variantName}
                      >
                        <div className="clay-inset flex h-12 w-12 flex-shrink-0 items-center justify-center">
                          {imageUrl ? (
                            <Image
                              src={getAssetUrl(imageUrl)}
                              alt={variantEmoji.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-contain p-1.5"
                            />
                          ) : (
                            <span className="text-2xl">{variantEmoji.glyph}</span>
                          )}
                        </div>
                        <span className="line-clamp-1 min-w-0 text-sm font-bold">
                          {variantName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="clay-card-soft p-4 md:p-5">
              <h2 className="font-display mb-4 text-lg font-bold md:text-xl">{t('common.details')}</h2>

              <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold text-muted-foreground md:text-sm">{t('common.name')}</dt>
                  <dd className="font-display mt-1 text-base font-semibold md:text-lg">{displayName}</dd>
                  {displayName !== emoji.name && (
                    <dd className="mt-1 text-sm font-semibold text-muted-foreground">{emoji.name}</dd>
                  )}
                </div>

                <div>
                  <dt className="text-xs font-bold text-muted-foreground md:text-sm">{t('common.glyph')}</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span className="text-2xl leading-none md:text-3xl">{emoji.glyph}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant={copiedType === 'glyph' ? 'default' : 'outline'}
                      className="h-8 w-8 flex-shrink-0 rounded-lg"
                      onClick={() => copyToClipboard(emoji.glyph, 'glyph')}
                      aria-label={copiedType === 'glyph' ? t('common.copied') : t('common.copyToClipboard')}
                      title={copiedType === 'glyph' ? t('common.copied') : t('common.copyToClipboard')}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </dd>
                </div>

                <div className="min-w-0">
                  <dt className="text-xs font-bold text-muted-foreground md:text-sm">{t('common.unicode')}</dt>
                  <dd className="mt-1 flex min-w-0 items-center gap-2">
                    <code className="clay-inset w-fit max-w-[calc(100%-2.5rem)] break-all px-2 py-1 font-mono text-xs md:px-3 md:text-sm">
                      U+{emoji.unicode.toUpperCase()}
                    </code>
                    <Button
                      type="button"
                      size="icon"
                      variant={copiedType === 'unicode' ? 'default' : 'outline'}
                      className="h-8 w-8 flex-shrink-0 rounded-lg"
                      onClick={() => copyToClipboard(emoji.unicode, 'unicode')}
                      aria-label={copiedType === 'unicode' ? t('common.copied') : t('common.copyUnicode')}
                      title={copiedType === 'unicode' ? t('common.copied') : t('common.copyUnicode')}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </dd>
                </div>

                {displayUnicodeVersion && (
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-muted-foreground md:text-sm">{t('common.unicodeVersion')}</dt>
                    <dd className="mt-1 text-sm font-semibold md:text-base">
                      {unicodeVersionUrl ? (
                        <a
                          href={unicodeVersionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-1 text-primary underline underline-offset-4 transition-colors hover:text-accent"
                          aria-label={`${displayUnicodeVersion} - ${t('common.openOfficialReference')}`}
                        >
                          {displayUnicodeVersion}
                          {emojipediaData?.unicodeReleaseYear ? ` (${emojipediaData.unicodeReleaseYear})` : ''}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : `${displayUnicodeVersion}${emojipediaData?.unicodeReleaseYear ? ` (${emojipediaData.unicodeReleaseYear})` : ''}`}
                    </dd>
                  </div>
                )}

                {displayReleaseVersion && (
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-muted-foreground md:text-sm">{t('common.releaseVersion')}</dt>
                    <dd className="mt-1 text-sm font-semibold md:text-base">
                      <a
                        href={emojiVersionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 text-primary underline underline-offset-4 transition-colors hover:text-accent"
                        aria-label={`${displayReleaseVersion} - ${t('common.openOfficialReference')}`}
                      >
                        {displayReleaseVersion}
                        {emojipediaData?.emojiReleaseYear ? ` (${emojipediaData.emojiReleaseYear})` : ''}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs font-bold text-muted-foreground md:text-sm">{t('common.category')}</dt>
                  <dd className="mt-2">
                    <Badge
                      variant="secondary"
                      className="cursor-pointer text-xs transition-colors hover:bg-secondary/80 md:text-sm"
                      onClick={handleCategoryClick}
                      title={t('common.clickToBrowseCategory')}
                    >
                      {t(`categories.${emoji.group}`)}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold text-muted-foreground md:text-sm">{t('common.platform')}</dt>
                  <dd className="mt-2">
                    <Link
                      href={`/${localeParam}/${platformSlug}`}
                      title={t('common.viewOnPlatform', { platform: t(`platforms.${selectedPlatform}`) })}
                      className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer text-xs transition-colors hover:bg-secondary/80 md:text-sm"
                      >
                        {t(`platforms.${selectedPlatform}`)}
                      </Badge>
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Keywords */}
            <div className="clay-card-soft p-4 md:p-5">
              <h3 className="font-display mb-3 text-base font-semibold">{t('common.keywords')}</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {displayKeywords.map((keyword: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer text-xs transition-colors hover:bg-secondary/80 md:text-sm"
                    onClick={() => handleKeywordClick(keyword)}
                    title={t('common.clickToSearch')}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Meaning - server-provided Emojipedia content */}
            {emojipediaData && hasEmojipediaContent && (
              <div className="clay-card-soft p-4 md:p-5">
                <h3 className="font-display mb-2 text-base font-semibold">{t('common.meaning')}</h3>
                <p className="text-sm font-semibold leading-6 text-muted-foreground md:text-base">
                  {emojipediaMeaning}
                </p>
              </div>
            )}

            {emojipediaData && emojipediaData.relatedEmojis.length > 0 && (
              <div className="clay-card-soft p-4 md:p-5">
                <h3 className="font-display mb-3 text-base font-semibold">{t('common.relatedEmojis')}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {emojipediaData.relatedEmojis.slice(0, 12).map((related) => {
                    const relatedName = related.name || formatRelatedEmojiName(related.slug);
                    return (
                      <Link
                        key={related.slug}
                        href={`/${localeParam}/fluent-emoji/${related.slug}/`}
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-card/80 px-2 py-1.5 transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title={relatedName}
                      >
                        <span className="text-xl leading-none" aria-hidden="true">{related.emoji}</span>
                        <span className="line-clamp-1 min-w-0 text-xs font-bold">{relatedName}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {seoData && seoData.copyVariants.length > 1 && (
              <div className="clay-card-soft p-4 md:p-5">
                <h3 className="font-display mb-3 text-base font-semibold">{t('common.copyVariants')}</h3>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                  {seoData.copyVariants.map((variant) => {
                    const isCopied = copiedVariantUnicode === variant.unicode;

                    return (
                      <Button
                        key={variant.unicode}
                        type="button"
                        variant={isCopied ? 'default' : 'outline'}
                        className="h-auto min-h-14 flex-col gap-1 px-2"
                        onClick={() => copyVariantToClipboard(variant.glyph, variant.unicode)}
                        aria-label={isCopied ? t('common.copied') : `${t('common.copyToClipboard')}: ${variant.glyph}`}
                        title={isCopied ? t('common.copied') : `${t('common.copyToClipboard')}: ${variant.glyph}`}
                      >
                        <span className="text-2xl leading-none">{variant.glyph}</span>
                        <span className={isCopied ? 'text-[10px] text-primary-foreground' : 'text-[10px] text-muted-foreground'}>
                          {isCopied ? t('common.copied') : variant.unicode}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
