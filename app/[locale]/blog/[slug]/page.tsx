import { components } from '@/components/MDXComponents'
import { BlogPostStructuredData } from '@/components/StructuredData'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/config'
import { locales } from '@/i18n/config'
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/mdx'
import { format } from 'date-fns'
import { enUS, ja, ko, zhCN } from 'date-fns/locale'
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import remarkGfm from 'remark-gfm'

const dateLocales = {
  'zh-CN': zhCN,
  'zh-TW': zhCN,
  'ja': ja,
  'ko': ko,
  'en': enUS,
}

// 生成静态路径
export async function generateStaticParams() {
  const paths: { locale: Locale; slug: string }[] = []

  for (const locale of locales) {
    const slugs = await getAllPostSlugs(locale)
    slugs.forEach((slug) => {
      paths.push({ locale, slug })
    })
  }

  return paths
}

// 生成元数据
export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: Locale; slug: string }
}) {
  const post = await getPostBySlug(locale, slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author] : [],
      images: post.image ? [post.image] : ['https://public.emojidir.com/og/welcome.png'],
    },
  }
}

export default async function BlogPostPage({
  params: { locale, slug },
}: {
  params: { locale: Locale; slug: string }
}) {
  const post = await getPostBySlug(locale, slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(locale, slug, post.tags)
  const t = await getTranslations('blog')

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <BlogPostStructuredData
        locale={locale}
        post={{
          slug: post.slug,
          title: post.title,
          description: post.description || '',
          date: post.date,
          author: post.author,
          tags: post.tags,
          image: post.image,
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToBlog')}
        </Link>

        {/* 文章头部 */}
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="not-prose mb-8 pb-8 border-b">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            {post.description && (
              <p className="text-xl text-muted-foreground mb-6">
                {post.description}
              </p>
            )}

            {/* 元数据 */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>
                  {format(
                    new Date(post.date),
                    'PPP',
                    { locale: dateLocales[locale] || enUS }
                  )}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime}</span>
              </div>
            </div>

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/${locale}/blog?tag=${tag}`}>
                      <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </header>

          {/* 文章封面图 */}
          {post.image && (
            <div className="not-prose mb-8 rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* MDX 内容 */}
          <div className="mdx-content">
            <MDXRemote
              source={post.content}
              components={components}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        </article>

        {/* 相关文章 */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">{t('relatedPosts')}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/${locale}/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-base group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {relatedPost.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <time className="text-xs text-muted-foreground" dateTime={relatedPost.date}>
                        {format(
                          new Date(relatedPost.date),
                          'PP',
                          { locale: dateLocales[locale] || enUS }
                        )}
                      </time>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

