import { BlogListingStructuredData } from '@/components/StructuredData'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/config'
import { getAllPosts, getAllTags } from '@/lib/mdx'
import { createMetaDescription } from '@/lib/seo'
import { format } from 'date-fns'
import { enUS, ja, ko, ptBR, zhCN } from 'date-fns/locale'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

const baseUrl = 'https://emojidir.com'

const dateLocales = {
  'zh-CN': zhCN,
  'zh-TW': zhCN,
  'ja': ja,
  'ko': ko,
  'en': enUS,
  'pt-BR': ptBR,
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ tag?: string }>
}) {
  const [{ locale }, { tag }] = await Promise.all([params, searchParams])
  const t = await getTranslations({ locale, namespace: 'blog' })
  const description = createMetaDescription(t('description'), locale)
  const hasTagParam = tag !== undefined

  return {
    title: t('title'),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
    },
    ...(hasTagParam ? {
      robots: {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
        },
      },
    } : {}),
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
  }
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ tag?: string }>
}) {
  const [{ locale }, { tag: selectedTag }] = await Promise.all([params, searchParams])
  const posts = await getAllPosts(locale)
  const allTags = await getAllTags(locale)

  // 如果选择了标签，过滤文章
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts

  const t = await getTranslations('blog')

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <BlogListingStructuredData
        locale={locale}
        totalPosts={filteredPosts.length}
      />

      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* 页面标题 */}
        <div className="mb-12 text-center">
          <h1 className="title-gradient font-display mb-4 text-4xl font-bold md:text-5xl">{t('title')}</h1>
          <p className="text-lg font-semibold text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* 标签过滤 */}
        {allTags.length > 0 && (
          <div className="clay-card-soft mb-8 p-4 md:p-5">
            <h2 className="font-display mb-4 text-xl font-semibold">{t('filterByTag')}</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/blog`}>
                  <Badge
                    variant={!selectedTag ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground"
                  >
                  {t('allPosts')}
                </Badge>
              </Link>
              {allTags.map((tag) => (
                <Link key={tag} href={`/${locale}/blog?tag=${tag}`}>
                  <Badge
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 文章列表 */}
        {filteredPosts.length === 0 ? (
          <div className="clay-card-soft py-12 text-center">
            <p className="text-lg font-semibold text-muted-foreground">{t('noPosts')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Card className="clay-interactive h-full overflow-hidden">
                  {post.image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <time dateTime={post.date}>
                        {format(
                          new Date(post.date),
                          'PPP',
                          { locale: dateLocales[locale] || enUS }
                        )}
                      </time>
                      <span>{post.readingTime}</span>
                    </div>
                    {post.author && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('by')} {post.author}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
