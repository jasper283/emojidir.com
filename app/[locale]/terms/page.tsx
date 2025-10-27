import MDXComponents from '@/components/MDXComponents'
import { getLegalDocument } from '@/lib/legal'
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
    title: 'Terms of Service - Emoji Directory',
    description: 'Terms of Service for Emoji Directory',
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const mdxContent = await getLegalDocument('terms', locale);

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
    <main className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        {compiledContent}
      </article>
    </main>
  );
}

