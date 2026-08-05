'use client';

import { PLATFORM_CONFIGS } from '@/lib/platforms';
import type { PlatformType } from '@/types/emoji';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PLATFORMS = Object.values(PLATFORM_CONFIGS);

interface PlatformSwitcherProps {
  currentPlatform: PlatformType;
}

export default function PlatformSwitcher({ currentPlatform }: PlatformSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPlatformConfig = PLATFORMS.find(p => p.id === currentPlatform) || PLATFORMS[0];

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlatformChange = (newPlatform: PlatformType) => {
    const platformSlug = `${newPlatform}-emoji`;

    // 检查当前是否在详情页（路径格式：/[locale]/[platform]/[slug]）
    const pathParts = pathname.split('/').filter(Boolean);
    // pathParts 示例: ['zh-CN', 'fluent-emoji', '1st-place-medal']

    if (pathParts.length >= 3 && pathParts[1].includes('-emoji')) {
      // 在详情页，保持在详情页并切换平台
      const slug = pathParts[2];
      router.push(`/${locale}/${platformSlug}/${slug}`);
    } else {
      // 在首页或其他页面，跳转到该平台的首页
      router.push(`/${locale}/${platformSlug}`);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="clay-pill flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Change platform"
        title={t(`platforms.${currentPlatformConfig.id}`)}
      >
        <span className="text-xl">{currentPlatformConfig.icon}</span>
      </button>

      {isOpen && (
        <div className="clay-card absolute right-0 z-50 mt-3 w-64 overflow-hidden p-2">
          <div className="space-y-1">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformChange(platform.id)}
                className={`w-full cursor-pointer rounded-2xl px-4 py-3 text-left transition-colors hover:bg-secondary/70 ${currentPlatform === platform.id ? 'bg-secondary/80' : ''
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{platform.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{t(`platforms.${platform.id}`)}</div>
                    <div className="text-xs text-muted-foreground">{t(`platformDescriptions.${platform.id}`)}</div>
                  </div>
                  {currentPlatform === platform.id && (
                    <span className="text-primary">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
