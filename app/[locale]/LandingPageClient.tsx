'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating Emoji Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        {floatingEmojis.map((emoji, index) => (
          <div
            key={index}
            className="absolute text-4xl md:text-6xl animate-float"
            style={{
              left: `${(index * 10) % 100}%`,
              top: `${(index * 15) % 100}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${8 + (index % 4) * 2}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-7xl relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-20 md:mb-32">
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {t('landing.hero.title')}
            </span>
            <span className="ml-2 inline-block animate-bounce">💡</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl text-muted-foreground mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder={t('landing.hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 md:h-16 text-base md:text-lg px-6 pr-32 rounded-full border-2 border-primary/20 focus:border-primary shadow-lg"
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
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {t('landing.hero.ctaButton')} →
            </Button>
          </Link>

          {/* Wave Animation */}
          <div className="mt-16 md:mt-24">
            <div className="inline-flex gap-2 text-4xl md:text-5xl animate-wave">
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Smart Search */}
            <div className="group bg-card rounded-2xl p-6 md:p-8 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {t('landing.features.smartSearch.icon')}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {t('landing.features.smartSearch.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.features.smartSearch.description')}
              </p>
            </div>

            {/* Multi-Platform Support */}
            <div className="group bg-card rounded-2xl p-6 md:p-8 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {t('landing.features.multiPlatform.icon')}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {t('landing.features.multiPlatform.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.features.multiPlatform.description')}
              </p>
            </div>

            {/* Free Downloads */}
            <div className="group bg-card rounded-2xl p-6 md:p-8 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {t('landing.features.freeDownload.icon')}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {t('landing.features.freeDownload.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.features.freeDownload.description')}
              </p>
            </div>

            {/* No Login Required */}
            <div className="group bg-card rounded-2xl p-6 md:p-8 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {t('landing.features.noLogin.icon')}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {t('landing.features.noLogin.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.features.noLogin.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24 bg-muted/30 rounded-3xl">
          {/* Section Title */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('landing.categories.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
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
                  className="group"
                >
                  <div className="bg-card rounded-2xl p-6 md:p-8 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer text-center">
                    <div className="text-5xl md:text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">
                      {representativeEmoji}
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
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
                className="text-base md:text-lg px-8 py-6 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                {t('landing.cta.viewAll')} →
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-40px) rotate(-5deg);
          }
          75% {
            transform: translateY(-20px) rotate(3deg);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animate-wave span {
          animation: wave 2s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}

