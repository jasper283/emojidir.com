import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Locale } from '@/i18n/config'
import type { BlogPost } from '@/lib/mdx'
import { format } from 'date-fns'
import { enUS, ja, ko, ptBR, zhCN } from 'date-fns/locale'
import Link from '@/components/StaticLink'

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
      className="group block h-full rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="clay-interactive h-full overflow-hidden">
        {post.image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
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
