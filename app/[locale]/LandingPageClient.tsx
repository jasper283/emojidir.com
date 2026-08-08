'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VISIBLE_PLATFORM_CONFIGS } from '@/lib/platforms';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LandingPageClient() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/fluent-emoji?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const floatingEmojis = ['😊', '🎉', '❤️', '🌟', '🚀', '💡', '🎨', '🌈', '⭐', '🔥'];
  const platforms = Object.values(VISIBLE_PLATFORM_CONFIGS);

  // 分类列表
  const categories = [
    'Smileys & Emotion',
    'People & Body',
    'Animals & Nature',
    'Food & Drink',
    'Travel & Places',
    'Activities',
    'Objects',
    'Symbols',
    'Flags'
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Floating Emoji Background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10">
        {floatingEmojis.map((emoji, index) => (
          <div
            key={index}
            className="absolute text-4xl md:text-6xl"
            style={{
              left: `${(index * 10) % 100}%`,
              top: `${(index * 15) % 100}%`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="container relative z-10 mx-auto max-w-7xl px-4 py-12 md:py-20">
        {/* Hero Section */}
        <section className="text-center mb-20 md:mb-32">
          {/* Main Title */}
          <h1 className="font-display mb-6 text-4xl font-bold leading-tight md:mb-8 md:text-6xl lg:text-7xl">
            <span className="title-gradient">
              {t('landing.hero.title')}
            </span>
            <span className="ml-2 inline-block">💡</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground md:mb-12 md:text-2xl">
            {t('landing.hero.subtitle')}
          </p>

          {/* Search Box */}
          <div className="mx-auto mb-8 max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder={t('landing.hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-full bg-card/90 px-6 pr-32 text-base md:h-16 md:text-lg"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6 md:px-8"
              >
                {t('common.search')}
              </Button>
            </form>
          </div>

          {/* CTA Button */}
          <Link href={`/${locale}/fluent-emoji`}>
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg"
            >
              {t('landing.hero.ctaButton')} →
            </Button>
          </Link>

          {/* Wave Animation */}
          <div className="mt-16 md:mt-24">
            <div className="inline-flex gap-2 text-4xl md:text-5xl">
              <span className="inline-block" style={{ animationDelay: '0s' }}>👋</span>
              <span className="inline-block" style={{ animationDelay: '0.1s' }}>🎨</span>
              <span className="inline-block" style={{ animationDelay: '0.2s' }}>✨</span>
              <span className="inline-block" style={{ animationDelay: '0.3s' }}>🚀</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          {/* Section Title */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display mb-4 text-3xl font-bold md:text-5xl">
              {t('landing.features.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-semibold text-muted-foreground md:text-xl">
              {t('landing.features.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Smart Search */}
            <div className="clay-card clay-interactive group p-6 md:p-8">
              <div className="mb-4 text-5xl md:text-6xl">
                {t('landing.features.smartSearch.icon')}
              </div>
              <h3 className="font-display mb-3 text-xl font-bold md:text-2xl">
                {t('landing.features.smartSearch.title')}
              </h3>
              <p className="font-semibold leading-relaxed text-muted-foreground">
                {t('landing.features.smartSearch.description')}
              </p>
            </div>

            {/* Multi-Platform Support */}
            <div className="clay-card clay-interactive group p-6 md:p-8">
              <div className="mb-4 text-5xl md:text-6xl">
                {t('landing.features.multiPlatform.icon')}
              </div>
              <h3 className="font-display mb-3 text-xl font-bold md:text-2xl">
                {t('landing.features.multiPlatform.title')}
              </h3>
              <p className="font-semibold leading-relaxed text-muted-foreground">
                {t('landing.features.multiPlatform.description')}
              </p>
            </div>

            {/* Free Downloads */}
            <div className="clay-card clay-interactive group p-6 md:p-8">
              <div className="mb-4 text-5xl md:text-6xl">
                {t('landing.features.freeDownload.icon')}
              </div>
              <h3 className="font-display mb-3 text-xl font-bold md:text-2xl">
                {t('landing.features.freeDownload.title')}
              </h3>
              <p className="font-semibold leading-relaxed text-muted-foreground">
                {t('landing.features.freeDownload.description')}
              </p>
            </div>

            {/* No Login Required */}
            <div className="clay-card clay-interactive group p-6 md:p-8">
              <div className="mb-4 text-5xl md:text-6xl">
                {t('landing.features.noLogin.icon')}
              </div>
              <h3 className="font-display mb-3 text-xl font-bold md:text-2xl">
                {t('landing.features.noLogin.title')}
              </h3>
              <p className="font-semibold leading-relaxed text-muted-foreground">
                {t('landing.features.noLogin.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Platforms Section */}
        <section className="py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display mb-4 text-3xl font-bold md:text-5xl">
              {t('landing.platforms.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-semibold text-muted-foreground md:text-xl">
              {t('landing.platforms.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 md:gap-6">
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href={`/${locale}/${platform.id}-emoji`}
                className="group rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="clay-card clay-interactive h-full p-6 text-center">
                  <div className="mb-4 text-5xl md:text-6xl">
                    {platform.icon}
                  </div>
                  <h3 className="font-display mb-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                    {t(`platforms.${platform.id}`)}
                  </h3>
                  <p className="line-clamp-3 text-sm font-semibold leading-6 text-muted-foreground">
                    {t(`platformDescriptions.${platform.id}`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24">
          {/* Section Title */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display mb-4 text-3xl font-bold md:text-5xl">
              {t('landing.categories.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-semibold text-muted-foreground md:text-xl">
              {t('landing.categories.subtitle')}
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => {
              const representativeEmoji = t(`landing.categories.representatives.${category}` as any);
              const categoryName = t(`categories.${category}` as any);

              return (
                <Link
                  key={category}
                  href={`/${locale}/fluent-emoji?category=${encodeURIComponent(category)}`}
                  className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[1.25rem]"
                >
                  <div className="clay-card clay-interactive p-6 text-center md:p-8">
                    <div className="mb-4 text-5xl md:text-6xl">
                      {representativeEmoji}
                    </div>
                    <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary md:text-base">
                      {categoryName}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="text-center mt-10 md:mt-12">
            <Link href={`/${locale}/fluent-emoji`}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base hover:bg-primary hover:text-primary-foreground md:text-lg"
              >
                {t('landing.cta.viewAll')} →
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
