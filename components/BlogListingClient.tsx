'use client';

import { BlogCard } from '@/components/BlogCard';
import { Badge } from '@/components/ui/badge';
import type { Locale } from '@/i18n/config';
import type { BlogPost } from '@/lib/mdx';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface BlogListingClientProps {
  locale: Locale;
  posts: BlogPost[];
  allTags: string[];
}

function readSelectedTag() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('tag') || '';
}

export default function BlogListingClient({ locale, posts, allTags }: BlogListingClientProps) {
  const t = useTranslations('blog');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    const syncSelectedTag = () => setSelectedTag(readSelectedTag());
    syncSelectedTag();
    window.addEventListener('popstate', syncSelectedTag);
    return () => window.removeEventListener('popstate', syncSelectedTag);
  }, []);

  const selectTag = (tag: string) => {
    const href = tag
      ? `/${locale}/blog?tag=${encodeURIComponent(tag)}`
      : `/${locale}/blog`;
    window.history.pushState({}, '', href);
    setSelectedTag(tag);
  };

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts;

  return (
    <>
      {allTags.length > 0 && (
        <div className="clay-card-soft mb-8 p-4 md:p-5">
          <h2 className="font-display mb-4 text-xl font-semibold">{t('filterByTag')}</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => selectTag('')}>
              <Badge
                variant={!selectedTag ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground"
              >
                {t('allPosts')}
              </Badge>
            </button>
            {allTags.map((tag) => (
              <button key={tag} type="button" onClick={() => selectTag(tag)}>
                <Badge
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground"
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="clay-card-soft py-12 text-center">
          <p className="text-lg font-semibold text-muted-foreground">{t('noPosts')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}
