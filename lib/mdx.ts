import type { Locale } from '@/i18n/config'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author?: string
  tags?: string[]
  image?: string
  readingTime: string
}

export interface BlogPostWithContent extends BlogPost {
  content: string // 原始 MDX 内容字符串
}

const contentDirectory = path.join(process.cwd(), 'content/blog')

// 获取指定语言的所有博客文章
export async function getAllPosts(locale: Locale): Promise<BlogPost[]> {
  const localeDir = path.join(contentDirectory, locale)

  // 如果目录不存在，尝试使用英文版本作为兜底
  if (!fs.existsSync(localeDir)) {
    if (locale !== 'en') {
      return getAllPosts('en')
    }
    return []
  }

  const files = fs.readdirSync(localeDir)
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const fullPath = path.join(localeDir, file)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      const stats = readingTime(content)

      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        author: data.author,
        tags: data.tags || [],
        image: data.image,
        readingTime: stats.text,
      } as BlogPost
    })
    .sort((a, b) => {
      // 按日期降序排列
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return posts
}

// 获取单个博客文章及其内容
export async function getPostBySlug(
  locale: Locale,
  slug: string
): Promise<BlogPostWithContent | null> {
  try {
    const fullPath = path.join(contentDirectory, locale, `${slug}.mdx`)

    // 如果找不到对应语言的文章，尝试使用英文版本
    if (!fs.existsSync(fullPath)) {
      if (locale !== 'en') {
        return getPostBySlug('en', slug)
      }
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const stats = readingTime(content)

    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      author: data.author,
      tags: data.tags || [],
      image: data.image,
      readingTime: stats.text,
      content, // 直接返回原始 MDX 内容字符串
    }
  } catch (error) {
    console.error(`Error loading post ${slug} for locale ${locale}:`, error)
    return null
  }
}

// 获取所有文章的 slugs（用于生成静态路径）
export async function getAllPostSlugs(locale: Locale): Promise<string[]> {
  const localeDir = path.join(contentDirectory, locale)

  // 如果目录不存在，尝试使用英文版本作为兜底
  if (!fs.existsSync(localeDir)) {
    if (locale !== 'en') {
      return getAllPostSlugs('en')
    }
    return []
  }

  const files = fs.readdirSync(localeDir)
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

// 获取相关文章（基于标签）
export async function getRelatedPosts(
  locale: Locale,
  currentSlug: string,
  tags: string[] = [],
  limit: number = 3
): Promise<BlogPost[]> {
  const allPosts = await getAllPosts(locale)

  if (tags.length === 0) {
    return allPosts
      .filter((post) => post.slug !== currentSlug)
      .slice(0, limit)
  }

  // 根据共同标签数量排序
  const postsWithScore = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const commonTags = post.tags?.filter((tag) => tags.includes(tag)) || []
      return {
        post,
        score: commonTags.length,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  return postsWithScore.slice(0, limit).map((item) => item.post)
}

// 按标签获取文章
export async function getPostsByTag(
  locale: Locale,
  tag: string
): Promise<BlogPost[]> {
  const allPosts = await getAllPosts(locale)
  return allPosts.filter((post) => post.tags?.includes(tag))
}

// 获取所有标签
export async function getAllTags(locale: Locale): Promise<string[]> {
  const allPosts = await getAllPosts(locale)
  const tagsSet = new Set<string>()

  allPosts.forEach((post) => {
    post.tags?.forEach((tag) => tagsSet.add(tag))
  })

  return Array.from(tagsSet).sort()
}

