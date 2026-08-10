'use client';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isMobilePlatformsOpen, setIsMobilePlatformsOpen] = useState(false);

  // 分类列表
  const categories = [
    { name: 'Smileys & Emotion', icon: '😊', key: 'Smileys & Emotion' },
    { name: 'People & Body', icon: '👋', key: 'People & Body' },
    { name: 'Animals & Nature', icon: '🐶', key: 'Animals & Nature' },
    { name: 'Food & Drink', icon: '🍕', key: 'Food & Drink' },
    { name: 'Travel & Places', icon: '✈️', key: 'Travel & Places' },
    { name: 'Activities', icon: '⚽', key: 'Activities' },
    { name: 'Objects', icon: '💡', key: 'Objects' },
    { name: 'Symbols', icon: '❤️', key: 'Symbols' },
    { name: 'Flags', icon: '🏁', key: 'Flags' },
  ];

  // 平台列表
  const platforms = [
    { name: 'fluent', icon: '🎨', key: 'fluent', description: 'Microsoft Design System' },
    { name: 'nato', icon: '🎯', key: 'nato', description: 'Google Open Source Design' },
    { name: 'apple', icon: '🍎', key: 'apple', description: 'Apple Emoji' },
    { name: 'microsoft', icon: '🪟', key: 'microsoft', description: 'Microsoft Emoji' },
    { name: 'twitter', icon: '🐦', key: 'twitter', description: 'Twitter Emoji' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href={`/${locale}`} className="clay-pill flex items-center gap-3 px-3 py-2 transition-colors hover:bg-secondary/70">
            <span className="sr-only">{t('common.appName')}</span>
            <Image src="/favicon.svg" alt={t('common.appName')} width={32} height={32} className="h-8 w-auto" />
            <span className="font-display hidden text-xl font-bold text-foreground sm:inline">
              {t('header.title')}
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="clay-pill inline-flex cursor-pointer items-center justify-center p-2.5 text-foreground transition-colors hover:bg-secondary/70"
          >
            <span className="sr-only">{t('common.openMainMenu')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-6 w-6">
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-10">
          {/* Categories dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              onBlur={() => setTimeout(() => setIsCategoriesOpen(false), 200)}
              className="flex cursor-pointer items-center gap-x-1 rounded-full px-3 py-2 text-sm font-bold leading-6 text-foreground transition-colors hover:bg-card/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('nav.categories')}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={`h-5 w-5 flex-none text-muted-foreground transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
              >
                <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
              </svg>
            </button>

            {/* Categories Dropdown menu */}
            {isCategoriesOpen && (
              <div className="absolute left-1/2 z-50 mt-3 w-screen max-w-md -translate-x-1/2 transform">
                <div className="clay-card overflow-hidden p-2">
                  <div className="p-4 grid grid-cols-1 gap-2">
                    {categories.map((category) => {
                      const categoryName = t(`categories.${category.key}` as any);
                      return (
                        <Link
                          key={category.key}
                          href={`/${locale}/fluent-emoji?category=${encodeURIComponent(category.key)}`}
                          className="group relative flex items-center gap-x-4 rounded-2xl p-3 text-sm leading-6 transition-colors hover:bg-secondary/70"
                        >
                          <div className="clay-inset flex h-11 w-11 flex-none items-center justify-center text-2xl transition-colors group-hover:bg-secondary/80">
                            {category.icon}
                          </div>
                          <div className="flex-auto">
                            <span className="block font-bold text-foreground">
                              {categoryName}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="rounded-2xl bg-secondary/70">
                    <Link
                      href={`/${locale}/fluent-emoji`}
                      className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-bold leading-6 text-foreground transition-colors hover:text-primary"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5 flex-none text-muted-foreground">
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                      {t('nav.viewAll')}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Platforms dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPlatformsOpen(!isPlatformsOpen)}
              onBlur={() => setTimeout(() => setIsPlatformsOpen(false), 200)}
              className="flex cursor-pointer items-center gap-x-1 rounded-full px-3 py-2 text-sm font-bold leading-6 text-foreground transition-colors hover:bg-card/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('nav.platforms')}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={`h-5 w-5 flex-none text-muted-foreground transition-transform ${isPlatformsOpen ? 'rotate-180' : ''}`}
              >
                <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
              </svg>
            </button>

            {/* Platforms Dropdown menu */}
            {isPlatformsOpen && (
              <div className="absolute left-1/2 z-50 mt-3 w-screen max-w-sm -translate-x-1/2 transform">
                <div className="clay-card overflow-hidden p-2">
                  <div className="p-4 grid grid-cols-1 gap-2">
                    {platforms.map((platform) => {
                      const platformName = t(`platforms.${platform.key}` as any);
                      const platformDesc = t(`platformDescriptions.${platform.key}` as any);
                      return (
                        <Link
                          key={platform.key}
                          href={`/${locale}/${platform.key}-emoji`}
                          className="group relative flex items-center gap-x-4 rounded-2xl p-3 text-sm leading-6 transition-colors hover:bg-secondary/70"
                        >
                          <div className="clay-inset flex h-11 w-11 flex-none items-center justify-center text-2xl transition-colors group-hover:bg-secondary/80">
                            {platform.icon}
                          </div>
                          <div className="flex-auto">
                            <span className="block font-bold text-foreground">
                              {platformName}
                            </span>
                            <p className="mt-1 text-muted-foreground text-xs">{platformDesc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Language switcher */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed inset-0 bg-foreground/35 backdrop-blur-sm" aria-hidden="true"></div>
          </div>
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-card px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link href={`/${locale}`} className="clay-pill flex items-center gap-2 px-3 py-2">
                <span className="sr-only">{t('common.appName')}</span>
                <Image src="/favicon.svg" alt={t('common.appName')} width={32} height={32} className="h-8 w-auto" />
                <span className="font-display text-lg font-bold text-foreground">{t('header.title')}</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="clay-pill cursor-pointer p-2.5 text-foreground transition-colors hover:bg-secondary/70"
              >
                <span className="sr-only">{t('common.closeMenu')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-6 w-6">
                  <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6">
                <div className="space-y-2 py-6">
                  {/* Categories accordion */}
                  <div className="-mx-3">
                    <button
                      type="button"
                      onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl py-2 pl-3 pr-3.5 text-base font-bold leading-7 text-foreground transition-colors hover:bg-secondary/70"
                    >
                      {t('nav.categories')}
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className={`h-5 w-5 flex-none transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                    </button>
                    {isMobileCategoriesOpen && (
                      <div className="mt-2 space-y-2">
                        {categories.map((category) => {
                          const categoryName = t(`categories.${category.key}` as any);
                          return (
                            <Link
                              key={category.key}
                              href={`/${locale}/fluent-emoji?category=${encodeURIComponent(category.key)}`}
                              className="block rounded-2xl py-2 pl-6 pr-3 text-sm font-bold leading-7 text-foreground transition-colors hover:bg-secondary/70"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {category.icon} {categoryName}
                            </Link>
                          );
                        })}
                        <Link
                          href={`/${locale}/fluent-emoji`}
                          className="block rounded-2xl py-2 pl-6 pr-3 text-sm font-bold leading-7 text-foreground transition-colors hover:bg-secondary/70"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t('nav.viewAll')}
                        </Link>
                      </div>
                    )}
                  </div>
                  {/* Platforms accordion */}
                  <div className="-mx-3">
                    <button
                      type="button"
                      onClick={() => setIsMobilePlatformsOpen(!isMobilePlatformsOpen)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl py-2 pl-3 pr-3.5 text-base font-bold leading-7 text-foreground transition-colors hover:bg-secondary/70"
                    >
                      {t('nav.platforms')}
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className={`h-5 w-5 flex-none transition-transform ${isMobilePlatformsOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                    </button>
                    {isMobilePlatformsOpen && (
                      <div className="mt-2 space-y-2">
                        {platforms.map((platform) => {
                          const platformName = t(`platforms.${platform.key}` as any);
                          return (
                            <Link
                              key={platform.key}
                              href={`/${locale}/${platform.key}-emoji`}
                              className="block rounded-2xl py-2 pl-6 pr-3 text-sm font-bold leading-7 text-foreground transition-colors hover:bg-secondary/70"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {platform.icon} {platformName}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="py-6">
                  <div className="-mx-3 px-3">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
