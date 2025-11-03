'use client';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import PlatformSwitcher from '@/components/PlatformSwitcher';
import { EmojiDetailStructuredData } from '@/components/StructuredData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAssetUrl } from '@/config/cdn';
import { getEmojiKeywords, getEmojiName, loadEmojiIndexForLocale, mergeEmojiIndexWithLocale } from '@/lib/emoji-i18n';
import { getEmojiDataForPlatform } from '@/lib/platforms';
import type { CompactEmojiIndex, Emoji, EmojiIndex, PlatformType } from '@/types/emoji';
import { expandEmojiIndex } from '@/types/emoji';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
// 构建时导入数据（缩写格式）
import compactEmojiIndexData from '@/data/emoji-index.json';

export default function EmojiDetailPage() {
  const t = useTranslations();
  const locale = useLocale(); // 使用 useLocale 获取当前语言
  const params = useParams();
  const router = useRouter();

  // 将缩写格式转换为完整格式（使用 useMemo 缓存，避免每次渲染都创建新对象）
  const baseEmojiData = useMemo(
    () => expandEmojiIndex(compactEmojiIndexData as CompactEmojiIndex),
    []
  );

  // 从 URL 获取参数
  const localeParam = params.locale as string;
  const platformSlug = params.platform as string;
  const selectedPlatform = platformSlug?.replace('-emoji', '') as PlatformType || 'fluent';
  const slugParam = decodeURIComponent(params.slug as string);

  const [copiedType, setCopiedType] = useState<'glyph' | 'unicode' | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [localizedEmojiData, setLocalizedEmojiData] = useState<EmojiIndex>(baseEmojiData);

  // 加载对应语言的 emoji 索引数据
  useEffect(() => {
    async function loadLocaleData() {
      const localeIndex = await loadEmojiIndexForLocale(locale);
      const mergedData = mergeEmojiIndexWithLocale(baseEmojiData, localeIndex);
      setLocalizedEmojiData(mergedData);
    }

    loadLocaleData();
  }, [locale, baseEmojiData]);

  // 根据选择的平台获取对应的emoji数据
  const emojiData = useMemo(() => {
    return getEmojiDataForPlatform(selectedPlatform, localizedEmojiData);
  }, [selectedPlatform, localizedEmojiData]);

  // 查找当前emoji（通过slug/id）
  const emoji = useMemo(() => {
    return emojiData.emojis.find((e: Emoji) => e.id === slugParam);
  }, [emojiData, slugParam]);

  // 获取所有可用的样式，包括特殊样式
  const getAllAvailableStyles = useCallback((): string[] => {
    if (!emoji) return [];

    const allStyles = Object.keys(emoji.styles);

    // 优先显示标准样式
    const standardStyles = allStyles.filter(style =>
      ['3d', 'color', 'flat', 'high-contrast'].includes(style)
    );

    // 如果没有标准样式，显示其他样式
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

  // 获取当前样式的图片路径，支持深浅色主题回退
  const getCurrentStyleUrl = useCallback((style: string): string => {
    if (!emoji) return '';

    // 首先尝试直接获取路径
    let imagePath = emoji.styles[style] || '';

    // 如果标准路径不存在，尝试深浅色主题路径
    if (!imagePath && ['3d', 'color', 'flat', 'high-contrast'].includes(style)) {
      const defaultStyleKey = `${style}-default`;
      imagePath = emoji.styles[defaultStyleKey] || '';
    }

    return imagePath;
  }, [emoji]);

  // 检查样式是否可用
  const isStyleAvailable = useCallback((style: string): boolean => {
    if (!emoji) return false;
    return !!(emoji.styles[style] || emoji.styles[`${style}-default`]);
  }, [emoji]);

  // 过滤出真正可用的样式
  const trulyAvailableStyles = useMemo(() =>
    availableStyles.filter(isStyleAvailable),
    [availableStyles, isStyleAvailable]
  );

  // 动态选择默认样式
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

  // 获取Noto Emoji的不同尺寸
  const natoSizes = [32, 72, 128, 512];

  // 获取Unicode文件名（用于Noto Emoji）
  const unicodeToNatoFilename = (unicode: string): string => {
    const cleaned = unicode
      .replace(/U\+/gi, '')
      .toLowerCase()
      .split(/\s+/)
      .filter(code => code !== 'fe0e' && code !== 'fe0f')
      .join('_');
    return `emoji_u${cleaned}`;
  };

  // 下载emoji图片（通过API路由代理）
  const downloadEmoji = async (url: string, filename: string) => {
    setDownloading(true);
    try {
      // 使用API路由代理下载，绕过CORS限制
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
      console.error('下载失败:', error);
      alert('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  if (!emoji) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Emoji Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The emoji you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push(`/${localeParam}/${platformSlug}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // 判断是否有可下载的资源
  const hasDownloadableAsset = currentStyleUrl && currentStyleUrl.length > 0;

  // 获取多语言名称和关键词
  const displayName = emoji ? getEmojiName(emoji, locale) : '';
  const displayKeywords = emoji ? getEmojiKeywords(emoji, locale) : [];

  return (
    <>
      {/* JSON-LD结构化数据 */}
      {emoji && (
        <EmojiDetailStructuredData
          locale={locale}
          platform={params.platform as string}
          platformName={t(`platforms.${selectedPlatform}`)}
          emoji={{
            id: emoji.id,
            name: displayName,
            glyph: emoji.glyph,
            unicode: emoji.unicode,
            group: emoji.group,
            keywords: displayKeywords,
          }}
          imageUrl={currentStyleUrl ? getAssetUrl(currentStyleUrl) : undefined}
        />
      )}

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
                  <Image src="/favicon.svg" alt={t('common.appName')} width={32} height={32} className="w-6 h-6 md:w-10 md:h-10 flex-shrink-0" />
                  <h1 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate">
                    {displayName}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PlatformSwitcher currentPlatform={selectedPlatform} />
                <LanguageSwitcher />
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
                    />
                  ) : (
                    <div className="text-6xl md:text-9xl">{emoji.glyph}</div>
                  )}
                </div>
              </div>

              {/* Style Selection - 只在有多个样式时显示 */}
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
                  {copiedType === 'unicode' ? t('common.copied') : 'Copy Unicode'}
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
                    {downloading ? 'Downloading...' : `Download ${currentSelectedStyle.toUpperCase()}`}
                  </Button>
                </div>
              )}

              {/* Download Section - Noto Emoji (Multiple Sizes) */}
              {selectedPlatform === 'nato' && (
                <div className="w-full">
                  <h4 className="text-sm font-semibold mb-3 text-center">Download Noto Emoji</h4>
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
                        {size}px
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Section - Unicode Platform (if has URL) */}
              {hasDownloadableAsset && selectedPlatform === 'unicode' && (
                <div className="w-full">
                  <h4 className="text-sm font-semibold mb-3 text-center">Download (Noto Emoji)</h4>
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
                        {size}px
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
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-base md:text-lg font-semibold mt-1">{displayName}</p>
                    {displayName !== emoji.name && (
                      <p className="text-sm text-muted-foreground mt-1">{emoji.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Glyph</label>
                    <p className="text-3xl md:text-4xl mt-2">{emoji.glyph}</p>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Unicode</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm md:text-lg font-mono bg-muted px-2 md:px-3 py-1 rounded">
                        U+{emoji.unicode.toUpperCase()}
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">{t('common.category')}</label>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs md:text-sm">
                        {t(`categories.${emoji.group}`)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Keywords</h3>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {displayKeywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs md:text-sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Platform Info */}
              <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('common.platform')}</h3>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs md:text-sm">
                    {t(`platforms.${selectedPlatform}`)}
                  </Badge>
                  {availableStyles.length > 0 && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">
                      Available in {availableStyles.length} style{availableStyles.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

