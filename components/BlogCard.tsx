import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/config'
import type { BlogPost } from '@/lib/mdx'
import { format } from 'date-fns'
import { enUS, ja, ko, ptBR, zhCN } from 'date-fns/locale'
import Link from 'next/link'

const dateLocales = {
  'zh-CN': zhCN,
  'zh-TW': zhCN,
  'ja': ja,
  'ko': ko,
  'en': enUS,
  'pt-BR': ptBR,
}

interface BlogCardProps {
  post: BlogPost
  locale: Locale
}

export function BlogCard({ post, locale }: BlogCardProps) {
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group block h-full"
    >
      <Card className="h-full transition-all hover:shadow-lg">
        {post.image && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
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
              {post.author}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

