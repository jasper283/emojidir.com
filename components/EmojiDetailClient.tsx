'use client';

import PlatformSwitcher from '@/components/PlatformSwitcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAssetUrl } from '@/config/cdn';
import { getEmojiKeywords, getEmojiName } from '@/lib/emoji-i18n';
import type { Emoji, PlatformType } from '@/types/emoji';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

interface EmojiDetailClientProps {
  emoji: Emoji;
  selectedPlatform: PlatformType;
  otherPlatforms: Array<{
    platform: PlatformType;
    emoji: Emoji | undefined;
    name: string;
  }>;
  locale: string;
  localeParam: string;
  platformSlug: string;
}

export default function EmojiDetailClient({
  emoji,
  selectedPlatform,
  otherPlatforms,
  locale,
  localeParam,
  platformSlug,
}: EmojiDetailClientProps) {
  const t = useTranslations();
  const router = useRouter();

  const [copiedType, setCopiedType] = useState<'glyph' | 'unicode' | null>(null);
  const [downloading, setDownloading] = useState(false);

  // 获取所有可用的样式
  const getAllAvailableStyles = useCallback((): string[] => {
    const allStyles = Object.keys(emoji.styles);
    const standardStyles = allStyles.filter(style =>
      ['3d', 'color', 'flat', 'high-contrast'].includes(style)
    );

    if (standardStyles.length === 0) {
      return allStyles.filter(style =>
        !style.includes('-default') &&
        !style.includes('dark') &&
        !style.includes('light') &&
        !style.includes('medium') &&
        style !== 'default'
      );
    }

    return standardStyles;
  }, [emoji]);

  const availableStyles = useMemo(() => getAllAvailableStyles(), [getAllAvailableStyles]);

  const getCurrentStyleUrl = useCallback((style: string): string => {
    let imagePath = emoji.styles[style] || '';

    if (!imagePath && ['3d', 'color', 'flat', 'high-contrast'].includes(style)) {
      const defaultStyleKey = `${style}-default`;
      imagePath = emoji.styles[defaultStyleKey] || '';
    }

    return imagePath;
  }, [emoji]);

  const isStyleAvailable = useCallback((style: string): boolean => {
    return !!(emoji.styles[style] || emoji.styles[`${style}-default`]);
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

  const currentStyleUrl = useMemo(() =>
    getCurrentStyleUrl(currentSelectedStyle),
    [getCurrentStyleUrl, currentSelectedStyle]
  );

  // 复制到剪贴板
  const copyToClipboard = (text: string, type: 'glyph' | 'unicode') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
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
  const displayKeywords = getEmojiKeywords(emoji, locale);

  const handleCategoryClick = useCallback(() => {
    router.push(`/${localeParam}/${platformSlug}?category=${encodeURIComponent(emoji.group)}`);
  }, [emoji, router, localeParam, platformSlug]);

  const handleKeywordClick = useCallback((keyword: string) => {
    router.push(`/${localeParam}/${platformSlug}?search=${encodeURIComponent(keyword)}`);
  }, [router, localeParam, platformSlug]);

  const downloadEmoji = async (url: string, filename: string) => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);

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
      console.error(`${t('common.downloadFailed')}:`, error);
      alert(t('common.downloadFailedMessage'));
    } finally {
      setDownloading(false);
    }
  };

  const hasDownloadableAsset = currentStyleUrl && currentStyleUrl.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/30 backdrop-blur-lg border-b sticky top-0 z-40 shadow-sm w-full">
        <div className="container mx-auto px-4 py-3 md:py-6 max-w-7xl">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/${localeParam}/${platformSlug}`)}
                className="hover:bg-accent flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <Image src="/favicon.svg" alt={t('common.appName')} width={32} height={32} className="w-6 h-6 md:w-10 md:h-10 flex-shrink-0" priority />
                <h1 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate">
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
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
          {/* Left Column - Emoji Display */}
          <div className="space-y-4 md:space-y-6">
            {/* Main Emoji Display */}
            <div className="bg-card rounded-xl md:rounded-2xl p-6 md:p-12 border-2 shadow-lg">
              <div className="aspect-square flex items-center justify-center bg-muted/30 rounded-lg md:rounded-xl">
                {currentStyleUrl ? (
                  <Image
                    src={getAssetUrl(currentStyleUrl)}
                    alt={emoji.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain p-4 md:p-8"
                    priority
                  />
                ) : (
                  <div className="text-6xl md:text-9xl">{emoji.glyph}</div>
                )}
              </div>
            </div>

            {/* Style Selection */}
            {trulyAvailableStyles.length > 1 && (
              <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
                <h3 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 text-foreground">{t('common.style')}</h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {trulyAvailableStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setCurrentSelectedStyle(style)}
                      className={`p-3 md:p-4 rounded-md md:rounded-lg border-2 transition-all duration-200 text-center ${currentSelectedStyle === style
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-card-foreground border-border hover:border-primary'
                        }`}
                    >
                      <span className="font-medium text-xs md:text-sm">
                        {t(`styles.${style}`, { defaultValue: style })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Copy Actions */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <Button
                onClick={() => copyToClipboard(emoji.glyph, 'glyph')}
                className="w-full"
                variant={copiedType === 'glyph' ? 'default' : 'outline'}
              >
                <Copy className="w-4 h-4 mr-2" />
                {copiedType === 'glyph' ? t('common.copied') : t('common.copyToClipboard')}
              </Button>
              <Button
                onClick={() => copyToClipboard(emoji.unicode, 'unicode')}
                className="w-full"
                variant={copiedType === 'unicode' ? 'default' : 'outline'}
              >
                <Copy className="w-4 h-4 mr-2" />
                {copiedType === 'unicode' ? t('common.copied') : t('common.copyUnicode')}
              </Button>
            </div>

            {/* Download Section - Fluent Emoji */}
            {hasDownloadableAsset && selectedPlatform === 'fluent' && (
              <div className="w-full">
                <Button
                  onClick={() => {
                    const ext = currentStyleUrl.endsWith('.svg') ? 'svg' : 'png';
                    downloadEmoji(
                      getAssetUrl(currentStyleUrl),
                      `${emoji.id}_${currentSelectedStyle}.${ext}`
                    );
                  }}
                  className="w-full"
                  variant="default"
                  disabled={downloading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? t('common.downloading') : t('common.downloadFormat', {
                    format: currentStyleUrl.endsWith('.svg') ? 'SVG' : 'PNG'
                  })}
                </Button>
              </div>
            )}

            {/* Download Section - Noto Emoji */}
            {selectedPlatform === 'nato' && (
              <div className="w-full">
                <h4 className="text-sm font-semibold mb-3 text-center">{t('common.downloadNotoEmoji')}</h4>
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
                <h4 className="text-sm font-semibold mb-3 text-center">{t('common.downloadNotoEmoji')}</h4>
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
          <div className="space-y-4 md:space-y-6">
            {/* Basic Info */}
            <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t('common.details')}</h2>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">{t('common.name')}</label>
                  <p className="text-base md:text-lg font-semibold mt-1">{displayName}</p>
                  {displayName !== emoji.name && (
                    <p className="text-sm text-muted-foreground mt-1">{emoji.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">{t('common.glyph')}</label>
                  <p className="text-3xl md:text-4xl mt-2">{emoji.glyph}</p>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">{t('common.unicode')}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm md:text-lg font-mono bg-muted px-2 md:px-3 py-1 rounded">
                      U+{emoji.unicode.toUpperCase()}
                    </code>
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">{t('common.category')}</label>
                  <div className="mt-2">
                    <Badge
                      variant="secondary"
                      className="text-xs md:text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={handleCategoryClick}
                      title={t('common.clickToBrowseCategory')}
                    >
                      {t(`categories.${emoji.group}`)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('common.keywords')}</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {displayKeywords.map((keyword: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs md:text-sm cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleKeywordClick(keyword)}
                    title={t('common.clickToSearch')}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Other Platforms */}
            {otherPlatforms.length > 0 && (
              <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('common.otherPlatforms')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {otherPlatforms.map(({ platform, emoji: platformEmoji }) => {
                    const platformSlugName = `${platform}-emoji`;
                    const platformName = t(`platforms.${platform}`);

                    // 优先选择平台合适的样式
                    const getImageUrl = (): string => {
                      if (!platformEmoji?.styles) return '';

                      const styles = platformEmoji.styles;

                      // 优先顺序：color -> 3d -> flat -> high-contrast -> 第一个可用样式
                      if (styles['color']) return styles['color'];
                      if (styles['3d']) return styles['3d'];
                      if (styles['flat']) return styles['flat'];
                      if (styles['high-contrast']) return styles['high-contrast'];

                      // 如果都没有，尝试默认样式
                      if (styles['color-default']) return styles['color-default'];
                      if (styles['3d-default']) return styles['3d-default'];
                      if (styles['flat-default']) return styles['flat-default'];

                      // 最后使用第一个可用样式
                      const firstStyle = Object.keys(styles)[0];
                      return firstStyle ? styles[firstStyle] || '' : '';
                    };

                    const imageUrl = getImageUrl();

                    return (
                      <button
                        key={platform}
                        onClick={() => router.push(`/${localeParam}/${platformSlugName}/${emoji.id}`)}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-all duration-200 group"
                        title={t('common.viewOnPlatform', { platform: platformName })}
                      >
                        <div className="w-16 h-16 flex items-center justify-center bg-muted/30 rounded-lg group-hover:scale-110 transition-transform">
                          {imageUrl ? (
                            <Image
                              src={getAssetUrl(imageUrl)}
                              alt={platformEmoji?.name || ''}
                              width={64}
                              height={64}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-3xl">{platformEmoji?.glyph}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-center line-clamp-1">
                          {platformName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Platform Info */}
            <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('common.platform')}</h3>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs md:text-sm">
                  {t(`platforms.${selectedPlatform}`)}
                </Badge>
                {availableStyles.length > 0 && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">
                    {t('common.availableInStyles', {
                      count: availableStyles.length,
                      plural: availableStyles.length > 1 ? t('common.availableInStylesPlural') : t('common.availableInStylesSingular')
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

