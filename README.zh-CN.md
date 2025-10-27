# EmojiDir - Emoji收录站，快速找到你想要的表情

📖 [English](README.md)

---

支持多平台和多样式表情浏览与搜索的现代化目录。

## 功能特性

- 🎨 支持多种显示样式（3D、彩色、扁平、高对比）
- 🏢 支持多个平台（Fluent Emoji、Nato Emoji、iOS/Apple）
- 📂 按分类浏览表情
- 🔍 关键词搜索
- 🎛️ 左侧筛选面板
- 📱 响应式设计
- 🌍 多语言支持（英语、日语、韩语、中文）
- ⚡ 快速加载
- 📊 Google Analytics 集成

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **国际化**: next-intl
- **部署**: Vercel

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

如果需要使用 Google Analytics，创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

详细配置请参考 [docs/GOOGLE_ANALYTICS_SETUP.md](./docs/GOOGLE_ANALYTICS_SETUP.md)

### 3. 生成 emoji 索引

```bash
npm run generate-index
```

这会扫描 `assets` 目录下的所有 emoji 并生成索引文件到 `data/emoji-index.json`。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 构建和部署

### 构建项目

```bash
npm run build
```

### 部署到 Vercel

最简单的部署方式：

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 上导入你的仓库
3. Vercel 会自动检测 Next.js 并配置

或者使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

## 项目结构

```
emoji-directory/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 国际化路由
│   │   ├── [platform]/    # 平台路由
│   │   ├── blog/          # 博客
│   │   ├── privacy/       # 隐私政策
│   │   └── terms/         # 条款
│   ├── api/               # API 路由
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── EmojiGrid.tsx     # 表情网格
│   ├── EmojiCard.tsx     # 表情卡片
│   ├── SearchBar.tsx     # 搜索栏
│   ├── CategoryFilter.tsx # 分类筛选
│   └── FilterSidebar.tsx  # 筛选侧边栏
├── data/                  # 生成的数据
│   └── emoji-index.json  # emoji 索引
├── assets/                # Emoji 资源
├── messages/              # 国际化翻译
└── scripts/               # 脚本
    └── generate-index.js # 生成索引脚本
```

## 自定义配置

### Google Analytics

网站已集成 Google Analytics，用于追踪页面浏览和用户行为。配置方法：

1. 创建 `.env.local` 文件
2. 添加 `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
3. 详细说明请参考 [docs/GOOGLE_ANALYTICS_SETUP.md](./docs/GOOGLE_ANALYTICS_SETUP.md)

### 生产环境变量

在 Vercel 控制台中配置：

- `NEXT_PUBLIC_GA_ID` - Google Analytics ID（可选）

### 修改样式

所有样式使用 Tailwind CSS，可以在 `tailwind.config.ts` 中自定义主题。

## 数据格式

每个 emoji 的 metadata.json 格式：

```json
{
  "cldr": "smiling face with sunglasses",
  "fromVersion": "1.0",
  "glyph": "😎",
  "group": "Smileys & Emotion",
  "keywords": ["bright", "cool", "face", "sunglasses"],
  "unicode": "1f60e"
}
```

## 许可证

Fluent Emoji 资源由 Microsoft 提供。

## 贡献

欢迎提交 Issue 和 Pull Request！
