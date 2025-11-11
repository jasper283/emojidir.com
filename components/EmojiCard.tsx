'use client';

import { Card } from '@/components/ui/card';
import { getAssetUrl } from '@/config/cdn';
import { getEmojiName } from '@/lib/emoji-i18n';
import type { Emoji, StyleType } from '@/types/emoji';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

interface EmojiCardProps {
  emoji: Emoji;
  style: StyleType;
  priority?: boolean; // 是否优先加载（用于首屏图片）
}

export default function EmojiCard({ emoji, style, priority = false }: EmojiCardProps) {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();

  // 快速检查：如果 styles 为空对象或没有任何样式，直接使用原生 emoji 字符
  // 使用 useMemo 缓存，避免每次渲染都重新计算
  const hasAnyStyle = useMemo(() =>
    emoji.styles && Object.keys(emoji.styles).length > 0,
    [emoji.styles]
  );

  // 只有在有样式的情况下才需要状态管理
  const [imageError, setImageError] = useState(false);
  const [useDefaultTheme, setUseDefaultTheme] = useState(false);

  // 使用 useMemo 缓存图片路径和URL计算结果
  const { imagePath, imageUrl } = useMemo(() => {
    // 如果没有任何样式，直接返回空值
    if (!hasAnyStyle) {
      return { imagePath: '', imageUrl: '' };
    }

    // 首先尝试获取标准路径
    let path = emoji.styles[style] || emoji.styles['3d'] || emoji.styles['color'] || emoji.styles['flat'] || '';

    // 如果标准路径不存在或需要使用默认主题，尝试深浅色主题路径
    if (!path || useDefaultTheme) {
      // 首先尝试从数据中获取default路径
      const defaultStyleKey = `${style}-default`;
      path = emoji.styles[defaultStyleKey] || '';

      // 如果数据中没有default路径，则动态构建
      if (!path) {
        // 构建深浅色主题路径：assets/[emoji-name]/default/[style]/xxx.png
        const emojiName = emoji.name.toLowerCase().replace(/\s+/g, '-');
        const styleMap = {
          '3d': '3d',
          'color': 'color',
          'flat': 'flat',
          'high-contrast': 'high-contrast'
        };
        const styleFolder = styleMap[style] || '3d';

        // 构建文件名：emoji_name_style_default.png
        const fileName = `${emojiName.replace(/-/g, '_')}_${styleFolder}_default.${style === '3d' ? 'png' : 'svg'}`;
        path = `assets/${emojiName}/default/${styleFolder}/${fileName}`;
      }
    }

    return {
      imagePath: path,
      imageUrl: path ? getAssetUrl(path) : ''
    };
  }, [hasAnyStyle, style, useDefaultTheme, emoji.styles, emoji.name]);

  const handleImageError = () => {
    console.warn(`图片加载失败: ${imageUrl} (${emoji.name})`);

    // 如果标准路径失败，尝试深浅色主题路径
    if (!useDefaultTheme) {
      setUseDefaultTheme(true);
      setImageError(false); // 重置错误状态，尝试新路径
    } else {
      setImageError(true);
    }
  };

  const handleClick = () => {
    const platform = params.platform as string;
    router.push(`/${locale}/${platform}/${emoji.id}`);
  };

  // 获取当前语言下的 emoji 名称（使用 useMemo 缓存）
  const displayName = useMemo(() =>
    getEmojiName(emoji, locale),
    [emoji, locale]
  );

  // 对于原生平台（无样式），直接渲染 emoji 字符，跳过 Image 组件的开销
  const shouldUseNativeEmoji = useMemo(() =>
    !hasAnyStyle || (!imageUrl && !imageError),
    [hasAnyStyle, imageUrl, imageError]
  );

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer relative group hover:scale-105 border-2 hover:border-primary"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="aspect-square flex items-center justify-center mb-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-md">
          {shouldUseNativeEmoji ? (
            // 直接渲染原生 emoji 字符，性能最优
            <div className="text-5xl">{emoji.glyph}</div>
          ) : (
            // 渲染图片
            <Image
              src={imageUrl}
              alt={emoji.name}
              width={128}
              height={128}
              className="w-full h-full object-contain"
              onError={handleImageError}
              priority={priority}
              loading={priority ? undefined : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmMWY1ZjkiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMmU3ZWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground line-clamp-2" title={displayName}>
            {displayName}
          </p>
        </div>
      </div>
    </Card>
  );
}

