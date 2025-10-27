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
        className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors"
        aria-label="Change platform"
      >
        <span className="text-base md:text-lg">{currentPlatformConfig.icon}</span>
        <span className="hidden sm:inline text-sm font-medium">{t(`platforms.${currentPlatformConfig.id}`)}</span>
        <svg
          className={`hidden sm:block w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-card shadow-lg z-50">
          <div className="py-1">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformChange(platform.id)}
                className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${currentPlatform === platform.id ? 'bg-accent' : ''
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

