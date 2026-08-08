'use client';

import PlatformSwitcher from '@/components/PlatformSwitcher';
import { Badge } from '@/components/ui/badge';
import { VISIBLE_PLATFORM_CONFIGS } from '@/lib/platforms';
import { detectOS } from '@/lib/utils';
import type { PlatformType, StyleType } from '@/types/emoji';
import { Filter, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface FilterSidebarProps {
  currentPlatform: PlatformType;
  selectedStyle: StyleType;
  onStyleChange: (style: StyleType) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
}

const PLATFORMS = Object.values(VISIBLE_PLATFORM_CONFIGS);

const STYLES = [
  { value: '3d' as StyleType, icon: '🎨' },
  { value: 'color' as StyleType, icon: '🌈' },
  { value: 'flat' as StyleType, icon: '⬜' },
  { value: 'high-contrast' as StyleType, icon: '⚫' },
];

export default function FilterSidebar({
  currentPlatform,
  selectedStyle,
  onStyleChange,
  selectedCategory,
  onCategoryChange,
  categories,
  categoryCounts
}: FilterSidebarProps) {
  const t = useTranslations();
  const platformConfig = PLATFORMS.find(p => p.id === currentPlatform);
  const availableStyles = platformConfig?.styles || [];
  const osInfo = detectOS();
  const [isOpen, setIsOpen] = useState(false);

  // 锁定body滚动当抽屉打开时
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const renderFilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filter</h2>
        </div>
        {/* 移动端关闭按钮 */}
        <button
          onClick={() => setIsOpen(false)}
          className="clay-pill cursor-pointer p-2 transition-colors hover:bg-secondary/70 md:hidden"
          aria-label="关闭过滤器"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Platform Switcher */}
      <div className="mb-6">
        <PlatformSwitcher currentPlatform={currentPlatform} />
      </div>

      {/* Current Platform Display - Only show for unicode platform */}
      {currentPlatform === 'unicode' && (
        <div className="clay-inset mb-6 p-3">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5 flex-shrink-0">{osInfo.icon}</span>
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">{t('common.detected')}: {osInfo.name}</div>
              {osInfo.type === 'macos' || osInfo.type === 'ios' ? (
                <span>{t('common.usingAppleNative')}</span>
              ) : osInfo.type === 'windows' ? (
                <span>{t('common.usingWindowsNative')}</span>
              ) : osInfo.type === 'android' ? (
                <span>{t('common.usingAndroidNative')}</span>
              ) : (
                <span>{t('common.usingNotoFallback')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Style Selection */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-3 text-foreground">{t('common.style')}</h3>
        <div className="space-y-2">
          {STYLES.filter(style => availableStyles.includes(style.value)).map((style) => (
            <button
              key={style.value}
              onClick={() => onStyleChange(style.value)}
              className={`w-full cursor-pointer rounded-2xl p-3 text-left transition-all duration-200 ${selectedStyle === style.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/70 text-card-foreground hover:bg-secondary/70'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{style.icon}</span>
                <span className="font-medium text-sm">{t(`styles.${style.value}`)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-3 text-foreground">{t('common.category')}</h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full cursor-pointer rounded-2xl p-3 text-left transition-all duration-200 ${selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card/70 text-card-foreground hover:bg-secondary/70'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{t('categories.all')}</span>
              <Badge variant="secondary" className="text-xs">
                {Object.values(categoryCounts).reduce((total, count) => total + count, 0)}
              </Badge>
            </div>
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full cursor-pointer rounded-2xl p-3 text-left transition-all duration-200 ${selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/70 text-card-foreground hover:bg-secondary/70'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{t(`categories.${category}`)}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryCounts[category] || 0}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 移动端：浮动按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-4 text-primary-foreground transition-all duration-200 active:translate-y-1 md:hidden"
        aria-label="打开过滤器"
      >
        <Filter className="h-6 w-6" />
      </button>

      {/* 移动端：遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/35 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 移动端：抽屉式侧边栏 */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-50 w-80 overflow-y-auto bg-card p-6 transition-transform duration-300 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {renderFilterContent()}
      </div>

      {/* 桌面端：固定侧边栏 */}
      <div className="clay-card-soft sticky top-24 hidden max-h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto p-5 md:block">
        {renderFilterContent()}
      </div>
    </>
  );
}
