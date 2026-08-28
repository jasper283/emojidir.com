import MDXComponents from '@/components/MDXComponents'
import { getLegalDocument } from '@/lib/legal'
import { createLegalMetaDescription, createLegalMetaTitle } from '@/lib/seo'
import { compileMDX } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: createLegalMetaTitle('privacy', locale),
    description: createLegalMetaDescription('privacy', locale),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const mdxContent = await getLegalDocument('privacy', locale);

  if (!mdxContent) {
    notFound();
  }

  const { content: compiledContent } = await compileMDX({
    source: mdxContent.content,
    components: MDXComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'wrap',
              properties: {
                className: ['anchor'],
              },
            },
          ],
        ],
      },
    },
  })

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <article className="clay-card-soft prose prose-lg max-w-none p-5 dark:prose-invert md:p-10">
        {compiledContent}
      </article>
    </main>
  );
}
