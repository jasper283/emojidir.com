'use client';

import PlatformSwitcher from '@/components/PlatformSwitcher';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_CONFIGS } from '@/lib/platforms';
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
  emojisByCategory: Record<string, any[]>;
}

const PLATFORMS = Object.values(PLATFORM_CONFIGS);

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
  emojisByCategory
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

  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filter</h2>
        </div>
        {/* 移动端关闭按钮 */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
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
        <div className="mb-6 p-3 rounded-lg bg-muted/50 border border-border">
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
              className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${selectedStyle === style.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-card-foreground border-border hover:border-primary'
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
            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-card-foreground border-border hover:border-primary'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{t('categories.all')}</span>
              <Badge variant="secondary" className="text-xs">
                {Object.values(emojisByCategory).flat().length}
              </Badge>
            </div>
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${selectedCategory === category
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-card-foreground border-border hover:border-primary'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{t(`categories.${category}`)}</span>
                <Badge variant="secondary" className="text-xs">
                  {emojisByCategory[category]?.length || 0}
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
        className="md:hidden fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        aria-label="打开过滤器"
      >
        <Filter className="h-6 w-6" />
      </button>

      {/* 移动端：遮罩层 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 移动端：抽屉式侧边栏 */}
      <div
        className={`md:hidden fixed left-0 top-0 bottom-0 w-80 bg-card border-r z-50 overflow-y-auto p-6 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <FilterContent />
      </div>

      {/* 桌面端：固定侧边栏 */}
      <div className="hidden md:block w-80 bg-card border-r min-h-screen p-6">
        <FilterContent />
      </div>
    </>
  );
}
