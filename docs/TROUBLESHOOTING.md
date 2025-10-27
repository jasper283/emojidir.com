# 问题排查指南

## 当前问题：页面显示 404

### 症状
- 构建成功，没有错误
- 但浏览器显示空白或 404 页面
- HTML 包含 `id="__next_error__"` 和 `NEXT_NOT_FOUND`

### 根本原因

这是 **Next.js 静态导出** (`output: 'export'`) 的限制。静态导出不支持：
- 服务器端运行时功能
- 动态路由的完整功能
- Next-intl 的某些特性

### 解决方案

使用浏览器直接打开文件，而不是通过 HTTP 服务器：

```bash
# 直接在浏览器中打开
open out/en/index.html
# 或
open out/zh-CN/index.html
```

### 或者使用简化的国际化方案

考虑以下替代方案：

#### 方案 1: 纯客户端国际化

不使用 next-intl，改用简单的客户端翻译：

```tsx
// lib/translations.ts
export const translations = {
  'en': {
    title: 'Emoji Directory',
    search: 'Search...'
  },
  'zh-CN': {
    title: '表情符号目录',
    search: '搜索...'
  }
}

// components/useTranslation.ts
import { useState } from 'react';
import { translations } from '@/lib/translations';

export function useTranslation() {
  const [lang, setLang] = useState('zh-CN');
  const t = (key: string) => translations[lang][key] || key;
  return { t, lang, setLang };
}
```

#### 方案 2: 使用 Next.js 服务器模式

移除 `output: 'export'`，使用标准的 Next.js 部署：

```js
// next.config.js
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // 移除 output: 'export'
  images: {
    unoptimized: true,
  },
}
```

然后部署到支持 Next.js 的平台：
- Vercel（原生支持）
- Netlify
- Railway
- Cloudflare Pages（支持 Next.js）

### 当前文件说明

由于静态导出的限制，以下文件已创建但可能无法完全工作：
- ❌ `i18n/request.ts` - 需要服务器运行时
- ❌ `app/[locale]/layout.tsx` - 动态路由在静态导出中有限制
- ✅ `messages/*.json` - 翻译文件正常
- ✅ `i18n/config.ts` - 配置正常

### 推荐行动

选择以下之一：

1. **继续静态导出** - 实现简化的客户端国际化
2. **切换到服务器模式** - 获得完整的 next-intl 功能
3. **接受限制** - 直接打开文件使用，不通过 HTTP 服务器

---

我建议切换到**方案 1（纯客户端国际化）**，这样可以保持静态导出的优势同时实现国际化功能。

需要我帮你实现吗？

