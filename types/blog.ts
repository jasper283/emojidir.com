export interface BlogFrontmatter {
  title: string
  description: string
  date: string
  author?: string
  tags?: string[]
  image?: string
}

export interface BlogPostMeta {
  slug: string
  locale: string
  frontmatter: BlogFrontmatter
  readingTime: string
}

