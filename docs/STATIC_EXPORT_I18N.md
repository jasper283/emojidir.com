# 静态导出 + 国际化说明

## 🎯 问题背景

本项目使用 `output: 'export'` 进行静态导出，这意味着：
- ❌ **不支持** Next.js 服务器端功能
- ❌ **不支持** 中间件（Middleware）
- ❌ **不支持** API 路由
- ✅ **支持** 客户端 JavaScript
- ✅ **支持** 静态 HTML 生成

## 💡 解决方案

### 使用客户端语言检测

由于不能使用中间件，我们采用了**客户端语言检测**方案：

#### 1. 根页面（`app/page.tsx`）
```tsx
'use client';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // 检测浏览器语言
    const browserLang = navigator.language;
    
    // 匹配到支持的语言
    let targetLocale = defaultLocale;
    if (locales.includes(browserLang as any)) {
      targetLocale = browserLang as any;
    } else {
      const langPrefix = browserLang.split('-')[0];
      const matchedLocale = locales.find(locale => 
        locale.startsWith(langPrefix)
      );
      if (matchedLocale) {
        targetLocale = matchedLocale;
      }
    }
    
    // 重定向
    router.replace(`/${targetLocale}`);
  }, [router]);

  return <LoadingSpinner />;
}
```

#### 2. 工作流程

```
用户访问 example.com/
         ↓
    加载 index.html
         ↓
   执行客户端 JS
         ↓
  检测浏览器语言
         ↓
  navigator.language
         ↓
    匹配支持的语言
         ↓
重定向到 /zh-CN/ 或 /en/ 等
```

## 📦 构建产物

```bash
npm run build
```

生成的静态文件：
```
out/
├── index.html              # 根页面（包含重定向逻辑）
├── _next/                  # Next.js 资源
│   ├── static/
│   └── ...
├── en/
│   └── index.html         # 英语版本
├── ja/
│   └── index.html         # 日语版本
├── ko/
│   └── index.html         # 韩语版本
├── zh-TW/
│   └── index.html         # 繁体中文版本
└── zh-CN/
    └── index.html         # 简体中文版本
```

## 🌍 URL 结构

| 访问路径  | 行为                          |
| --------- | ----------------------------- |
| `/`       | 客户端检测 → 重定向到语言版本 |
| `/en/`    | 直接显示英语版本              |
| `/ja/`    | 直接显示日语版本              |
| `/ko/`    | 直接显示韩语版本              |
| `/zh-TW/` | 直接显示繁体中文版本          |
| `/zh-CN/` | 直接显示简体中文版本          |

## 🚀 部署注意事项

### Cloudflare Pages
```bash
# 构建命令
npm run build

# 输出目录
out
```

### Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out"
}
```

### GitHub Pages
```yaml
# .github/workflows/deploy.yml
- name: Build
  run: npm run build

- name: Deploy
  uses: peaceiris/actions-gh-pages@v3
  with:
    publish_dir: ./out
```

## 🔍 语言检测逻辑

### 检测优先级

1. **精确匹配** - `navigator.language === 'zh-CN'`
   ```
   浏览器语言: zh-CN
   匹配结果: zh-CN ✅
   ```

2. **前缀匹配** - `navigator.language.startsWith('zh')`
   ```
   浏览器语言: zh
   匹配结果: zh-CN (第一个匹配) ✅
   ```

3. **默认语言** - 无匹配时使用 `en`
   ```
   浏览器语言: fr-FR
   匹配结果: en (默认) ✅
   ```

### 示例

| 浏览器语言 | 检测结果               |
| ---------- | ---------------------- |
| `zh-CN`    | `zh-CN`                |
| `zh-TW`    | `zh-TW`                |
| `zh`       | `zh-CN` (首个 zh 开头) |
| `ja-JP`    | `ja`                   |
| `ko-KR`    | `ko`                   |
| `en-US`    | `en`                   |
| `fr-FR`    | `en` (默认)            |

## ⚡ 性能优化

### 优点
- ✅ 零服务器成本
- ✅ 全球 CDN 缓存
- ✅ 快速加载（纯静态）
- ✅ 支持离线访问

### 缺点
- ⚠️ 首次加载需要执行 JS
- ⚠️ SEO: 根路径 `/` 无法针对特定语言优化

### SEO 改进建议

创建 `public/index.html` 作为备用：
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Emoji Directory</title>
  <!-- 添加语言备选链接 -->
  <link rel="alternate" hreflang="en" href="/en/" />
  <link rel="alternate" hreflang="ja" href="/ja/" />
  <link rel="alternate" hreflang="ko" href="/ko/" />
  <link rel="alternate" hreflang="zh-TW" href="/zh-TW/" />
  <link rel="alternate" hreflang="zh-CN" href="/zh-CN/" />
  <link rel="alternate" hreflang="x-default" href="/en/" />
</head>
</html>
```

## 🎨 用户体验优化

### 添加语言选择页面（可选）

如果不想自动重定向，可以显示语言选择页面：

```tsx
// app/page.tsx
export default function RootPage() {
  return (
    <div className="language-selector">
      <h1>Choose Your Language</h1>
      <div className="language-grid">
        <Link href="/en">English</Link>
        <Link href="/ja">日本語</Link>
        <Link href="/ko">한국어</Link>
        <Link href="/zh-TW">繁體中文</Link>
        <Link href="/zh-CN">简体中文</Link>
      </div>
    </div>
  );
}
```

### 记住用户选择（可选）

```tsx
useEffect(() => {
  // 检查 localStorage
  const savedLocale = localStorage.getItem('preferred-locale');
  if (savedLocale && locales.includes(savedLocale as any)) {
    router.replace(`/${savedLocale}`);
    return;
  }
  
  // 否则检测浏览器语言
  // ...
}, []);
```

## 📊 对比：中间件 vs 客户端检测

| 特性         | 中间件       | 客户端检测  |
| ------------ | ------------ | ----------- |
| 需要服务器   | ✅ 是         | ❌ 否        |
| SEO 友好     | ✅ 最佳       | ⚠️ 良好      |
| 首次加载速度 | ✅ 快         | ⚠️ 需执行 JS |
| 部署复杂度   | ⚠️ 高         | ✅ 低        |
| 成本         | ⚠️ 服务器费用 | ✅ 零成本    |
| 离线支持     | ❌ 否         | ✅ 是        |
| CDN 缓存     | ⚠️ 复杂       | ✅ 简单      |

## ✅ 总结

对于本项目：
1. **静态导出优先** - 简单、快速、成本低
2. **客户端检测** - 满足国际化需求
3. **用户体验良好** - 自动检测 + 手动切换
4. **部署友好** - 任何静态托管服务

这是在静态导出限制下的**最佳实践**方案。

