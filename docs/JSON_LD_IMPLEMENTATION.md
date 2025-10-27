# JSON-LD 结构化数据实现指南

本指南说明如何为项目的每个页面生成 JSON-LD 结构化数据，以提升 SEO 效果。

## 已实现的页面

### 1. 网站首页 (`app/[locale]/layout.tsx`)
- **组件**: `WebsiteStructuredData`
- **类型**: `WebSite` (Schema.org)
- **功能**: 提供网站基本信息和搜索功能
- **位置**: 在 layout 的 `<head>` 中自动添加

### 2. 平台页面 (`app/[locale]/[platform]/page.tsx`)
- **组件**: `CollectionPageStructuredData`
- **类型**: `CollectionPage` (Schema.org)
- **功能**: 描述 emoji 集合页面，包含面包屑和项目列表
- **数据**: 平台名称、描述、总 emoji 数量

### 3. Emoji 详情页 (`app/[locale]/[platform]/[slug]/page.tsx`)
- **组件**: `EmojiDetailStructuredData`
- **类型**: `ImageObject` (Schema.org)
- **功能**: 描述单个 emoji 的详细信息
- **数据**: emoji 名称、Unicode、关键词、图片 URL、面包屑导航

### 4. 博客列表页 (`app/[locale]/blog/page.tsx`)
- **组件**: `BlogListingStructuredData`
- **类型**: `Blog` (Schema.org)
- **功能**: 描述博客集合
- **数据**: 博客名称、描述、文章数量

### 5. 博客详情页 (`app/[locale]/blog/[slug]/page.tsx`)
- **组件**: `BlogPostStructuredData`
- **类型**: `BlogPosting` (Schema.org)
- **功能**: 描述单篇博客文章
- **数据**: 文章标题、描述、发布日期、作者、标签、图片

## 组件位置

所有 JSON-LD 组件位于 `components/StructuredData.tsx` 文件中：

```typescript
// 网站信息
WebsiteStructuredData

// 集合页面
CollectionPageStructuredData

// Emoji 详情
EmojiDetailStructuredData

// 博客列表
BlogListingStructuredData

// 博客文章
BlogPostStructuredData
```

## 如何使用

### 在 Server Component 中使用

```tsx
import { BlogPostStructuredData } from '@/components/StructuredData'

export default async function Page() {
  return (
    <>
      <BlogPostStructuredData
        locale="en"
        post={{
          slug: 'example',
          title: 'Example Post',
          description: 'Example description',
          date: '2024-01-01',
          author: 'Author Name',
          tags: ['tag1', 'tag2'],
          image: 'https://example.com/image.png'
        }}
      />
      {/* 其他内容 */}
    </>
  )
}
```

### 在 Client Component 中使用

```tsx
'use client'

import { CollectionPageStructuredData } from '@/components/StructuredData'

export default function Page() {
  return (
    <>
      <CollectionPageStructuredData
        locale="en"
        platform="fluent-emoji"
        platformName="Fluent Emoji"
        platformDescription="Description"
        totalEmojis={100}
      />
      {/* 其他内容 */}
    </>
  )
}
```

## 数据结构

### WebsiteStructuredData

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Emoji Directory",
  "url": "https://emojidir.com/{locale}",
  "inLanguage": "{locale}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://emojidir.com/{locale}/fluent-emoji?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### CollectionPageStructuredData

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "{platformName} - Emoji Directory",
  "description": "{platformDescription}",
  "url": "https://emojidir.com/{locale}/{platform}",
  "inLanguage": "{locale}",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  },
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": {totalEmojis}
  }
}
```

### EmojiDetailStructuredData

```json
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "name": "{emoji.name} emoji",
  "description": "...",
  "contentUrl": "{imageUrl}",
  "url": "https://emojidir.com/{locale}/{platform}/{emoji.id}",
  "inLanguage": "{locale}",
  "keywords": "{keywords}",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  },
  "about": {
    "@type": "Thing",
    "name": "{emoji.name}",
    "description": "{emoji.group} emoji"
  }
}
```

### BlogPostStructuredData

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{title}",
  "description": "{description}",
  "datePublished": "{date}",
  "dateModified": "{date}",
  "author": {
    "@type": "Person",
    "name": "{author}"
  },
  "url": "https://emojidir.com/{locale}/blog/{slug}",
  "inLanguage": "{locale}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://emojidir.com/{locale}/blog/{slug}"
  },
  "image": ["{imageUrl}"],
  "keywords": "{tags}",
  "articleSection": "Blog"
}
```

### BlogListingStructuredData

```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Emoji Directory Blog",
  "description": "Blog posts about emoji...",
  "url": "https://emojidir.com/{locale}/blog",
  "inLanguage": "{locale}",
  "numberOfItems": {totalPosts}
}
```

## 添加新页面的步骤

1. **确定页面类型**: 根据页面内容选择合适的 Schema.org 类型
2. **创建组件**: 在 `components/StructuredData.tsx` 中创建新的组件
3. **添加数据**: 确定需要传递给组件的数据
4. **集成使用**: 在页面组件中引入并使用

## Schema.org 类型参考

- `WebSite`: 网站主页
- `CollectionPage`: 集合列表页面
- `ItemList`: 项目列表
- `ImageObject`: 图片/媒体对象
- `Blog`: 博客主页
- `BlogPosting`: 博客文章
- `BreadcrumbList`: 面包屑导航

## 验证 JSON-LD

使用以下工具验证 JSON-LD 数据：

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/
3. **Bing Markup Validator**: https://www.bing.com/webmasters/markup-validator

## 最佳实践

1. **保持数据准确**: 确保 JSON-LD 中的数据与实际页面内容一致
2. **及时更新**: 当页面内容变化时，及时更新 JSON-LD
3. **避免重复**: 每个页面只添加必要的结构化数据
4. **使用正确的类型**: 选择合适的 Schema.org 类型
5. **测试验证**: 使用验证工具确保 JSON-LD 格式正确

## 其他可能需要的页面类型

- **FAQ Page**: 常见问题页面 (FAQPage)
- **About Page**: 关于页面 (AboutPage)
- **Contact Page**: 联系我们 (ContactPage)
- **Product Page**: 产品详情页 (Product, 如果需要)
- **Event Page**: 活动页面 (Event)

## 参考资源

- [Schema.org](https://schema.org/) - Schema.org 官方文档
- [Google Rich Results](https://developers.google.com/search/docs/appearance/structured-data) - Google 结构化数据指南
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata) - Next.js Metadata API
