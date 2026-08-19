'use client';

import { localeNames, locales, type Locale } from '@/i18n/config';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// 语言对应的国旗 emoji
const localeFlags: Record<Locale, string> = {
  'en': '🇺🇸',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇨🇳',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'pt-BR': '🇧🇷',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleLocaleChange = (newLocale: Locale) => {
    // 移除当前的语言前缀，添加新的语言前缀
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');

    window.location.assign(newPathname);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="clay-pill flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Change language"
        title={localeNames[locale]}
      >
        <span className="text-xl">{localeFlags[locale]}</span>
      </button>

      {isOpen && (
        <div className="clay-card absolute right-0 z-50 mt-3 w-48 overflow-hidden p-2">
          <div className="space-y-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-left text-sm transition-colors hover:bg-secondary/70 ${locale === loc ? 'bg-secondary/80 font-semibold' : ''
                  }`}
              >
                <span className="text-lg">{localeFlags[loc]}</span>
                <span className="flex-1">{localeNames[loc]}</span>
                {locale === loc && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
