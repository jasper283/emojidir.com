# 服务器模式部署指南

## ✅ 已移除静态导出

项目现在使用 **Next.js 服务器模式**，获得完整的国际化功能！

### 🎯 优势

- ✅ **完整的 next-intl 功能** - 所有高级特性都可用
- ✅ **更好的 SEO** - 服务器端渲染，搜索引擎友好
- ✅ **自动语言检测** - Middleware 自动处理语言切换
- ✅ **性能优化** - 服务器端预渲染，首屏加载更快
- ✅ **简单部署** - Vercel、Cloudflare Pages 等平台原生支持

### 🚀 本地开发

```bash
# 开发模式
npm run dev

# 访问
# http://localhost:3000       - 自动重定向到浏览器语言
# http://localhost:3000/en    - 英语
# http://localhost:3000/ja    - 日语
# http://localhost:3000/ko    - 韩语
# http://localhost:3000/zh-TW - 繁体中文
# http://localhost:3000/zh-CN - 简体中文
```

### 🌐 部署选项

#### 1. Vercel（推荐）⭐

**最简单的部署方式！**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

**或通过 GitHub 自动部署：**
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 自动检测 Next.js 并部署
4. 每次 git push 自动重新部署

**环境变量**（可选）：
无需配置，Vercel 自动处理

**自定义域名**：
- 在 Vercel 项目设置中添加域名
- 配置 DNS 指向 Vercel

---

#### 2. Cloudflare Pages

```bash
# 构建命令
npm run build

# 输出目录
.next

# 环境变量
NODE_VERSION=18
```

**部署步骤**：
1. 连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置构建输出：`.next`
4. 部署

---

#### 3. Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

然后推送到 GitHub，Netlify 自动检测并部署。

---

#### 4. Railway

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

---

#### 5. 自托管（Docker）

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```bash
# 构建镜像
docker build -t emoji-directory .

# 运行
docker run -p 3000:3000 emoji-directory
```

---

### 📊 性能对比

| 特性           | 静态导出 | 服务器模式（当前） |
| -------------- | -------- | ------------------ |
| Next-intl 支持 | ❌ 有限   | ✅ 完整             |
| 语言检测       | ⚠️ 客户端 | ✅ 服务器端         |
| SEO            | ⚠️ 一般   | ✅ 优秀             |
| 首屏加载       | ✅ 快     | ✅ 更快（SSR）      |
| 部署复杂度     | ✅ 简单   | ✅ 简单             |
| 托管成本       | ✅ 免费   | ✅ 免费             |
| 动态功能       | ❌ 受限   | ✅ 完整             |

### 🔧 配置说明

#### `next.config.js`
```js
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // 已移除 output: 'export'
  images: {
    unoptimized: true,
  },
}

module.exports = withNextIntl(nextConfig)
```

#### `middleware.ts`
```ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always'
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon|.*\\..*).*)' 
  ]
};
```

### 🎨 语言检测流程

```
用户访问网站
    ↓
Middleware 检测请求
    ↓
├─ 有语言前缀？ → 直接显示对应语言
│
└─ 无语言前缀？
    ↓
    检测浏览器语言
    ↓
    ├─ 匹配支持的语言 → 重定向到该语言
    └─ 不匹配 → 重定向到默认语言（英语）
```

### ✨ 功能清单

- ✅ 5 种语言支持（en, ja, ko, zh-TW, zh-CN）
- ✅ 自动语言检测
- ✅ 语言切换器（右上角）
- ✅ 服务器端渲染（SSR）
- ✅ 静态生成（SSG）
- ✅ 完整的翻译覆盖
- ✅ SEO 友好
- ✅ 支持所有 Next.js 功能

### 🚦 测试清单

本地测试：
- [ ] `npm run dev` 启动成功
- [ ] 访问 `http://localhost:3000` 自动重定向
- [ ] 所有语言页面都能访问
- [ ] 语言切换器工作正常
- [ ] 搜索和筛选功能正常

部署前：
- [ ] `npm run build` 构建成功
- [ ] 无构建错误或警告（除非是已知的）
- [ ] 环境变量配置正确（如有）

部署后：
- [ ] 网站可访问
- [ ] 所有语言版本正常
- [ ] 性能良好
- [ ] 无控制台错误

### 💡 提示

- **Vercel 是最推荐的平台** - 零配置，自动优化
- **使用自定义域名** - 提升专业性和 SEO
- **监控性能** - 使用 Vercel Analytics 或 Google Analytics
- **定期更新** - 保持依赖最新

---

**现在你的国际化 Emoji Directory 已经完全就绪，可以部署了！** 🎉🌍

