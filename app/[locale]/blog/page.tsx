import { BlogListingStructuredData } from '@/components/StructuredData'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/config'
import { getAllPosts, getAllTags } from '@/lib/mdx'
import { format } from 'date-fns'
import { enUS, ja, ko, zhCN } from 'date-fns/locale'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

const dateLocales = {
  'zh-CN': zhCN,
  'zh-TW': zhCN,
  'ja': ja,
  'ko': ko,
  'en': enUS,
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const t = await getTranslations({ locale, namespace: 'blog' })

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      images: ['https://public.emojidir.com/og/welcome.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://public.emojidir.com/og/welcome.png'],
    },
  }
}

export default async function BlogPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: { tag?: string }
}) {
  const posts = await getAllPosts(locale)
  const allTags = await getAllTags(locale)
  const selectedTag = searchParams.tag

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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 页面标题 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* 标签过滤 */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('filterByTag')}</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/blog`}>
                <Badge
                  variant={!selectedTag ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90"
                >
                  {t('allPosts')}
                </Badge>
              </Link>
              {allTags.map((tag) => (
                <Link key={tag} href={`/${locale}/blog?tag=${tag}`}>
                  <Badge
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90"
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
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">{t('noPosts')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg">
                  {post.image && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
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

