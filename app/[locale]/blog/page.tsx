import BlogListingClient from '@/components/BlogListingClient';
import { BlogListingStructuredData } from '@/components/StructuredData';
import type { Locale } from '@/i18n/config';
import { getAllPosts, getAllTags } from '@/lib/mdx';
import { createMetaDescription } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

const baseUrl = 'https://emojidir.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const description = createMetaDescription(t('description'), locale);

  return {
    title: t('title'),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
    },
    openGraph: {
      title: t('title'),
      description,
      url: `${baseUrl}/${locale}/blog`,
      type: 'website',
      images: ['https://public.emojidir.com/og/welcome.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description,
      images: ['https://public.emojidir.com/og/welcome.png'],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [posts, allTags] = await Promise.all([
    getAllPosts(locale),
    getAllTags(locale),
  ]);
  const t = await getTranslations('blog');

  return (
    <>
      <BlogListingStructuredData locale={locale} totalPosts={posts.length} />

      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="mb-12 text-center">
          <h1 className="title-gradient font-display mb-4 text-4xl font-bold md:text-5xl">{t('title')}</h1>
          <p className="text-lg font-semibold text-muted-foreground">{t('subtitle')}</p>
        </div>

        <BlogListingClient locale={locale} posts={posts} allTags={allTags} />
      </div>
    </>
  );
}
