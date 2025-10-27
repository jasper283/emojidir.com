# Google Analytics 集成指南 📊

## 概述

已为网站集成 Google Analytics (GA4)，用于统计页面浏览量和用户行为。

## ✨ 已完成的集成

### 1. **Google Analytics 组件**
- ✅ 创建 `components/GoogleAnalytics.tsx`
- ✅ 使用 `next/script` 优化加载性能
- ✅ 支持 `afterInteractive` 策略
- ✅ 自动追踪页面浏览

### 2. **在主布局中集成**
- ✅ 在 `app/[locale]/layout.tsx` 中添加 GA 组件
- ✅ 所有页面自动包含 GA 脚本

## 🔧 配置步骤

### 1. 获取 Google Analytics ID

如果您还没有 GA 账号：

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 创建新的分析属性
3. 复制您的 Measurement ID（格式: `G-XXXXXXXXXX`）

### 2. 配置环境变量

创建 `.env.local` 文件（如果不存在）：

```bash
# 在项目根目录创建 .env.local 文件
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**重要提示：**
- 将 `G-XXXXXXXXXX` 替换为您的实际 Google Analytics ID
- `.env.local` 文件不会被提交到 Git 仓库
- 本地开发时使用 `.env.local`
- 生产环境需要在部署平台配置相同环境变量

### 3. 部署环境配置

根据您的部署平台，添加环境变量：

#### Vercel
1. 进入项目设置 → Environment Variables
2. 添加 `NEXT_PUBLIC_GA_ID` = `G-XXXXXXXXXX`

#### Netlify
1. 进入 Site settings → Environment variables
2. 添加 `NEXT_PUBLIC_GA_ID` = `G-XXXXXXXXXX`

#### 其他平台
在对应平台的环境变量设置中添加 `NEXT_PUBLIC_GA_ID`

## 🎯 追踪功能

### 自动追踪
- ✅ 页面浏览 (Page Views)
- ✅ 页面路径 (Page Path)
- ✅ 语言设置
- ✅ 访问时间

### 后续可扩展功能
可以添加自定义事件追踪：
- 表情符号下载
- 表情符号复制
- 搜索查询
- 分类筛选
- 平台切换

## 📊 验证安装

### 1. 本地开发验证

1. 启动开发服务器：
```bash
pnpm dev
```

2. 打开浏览器开发者工具 → Network
3. 查找 `gtag/js` 请求
4. 确认有到 `google-analytics.com` 的连接

### 2. Google Analytics 实时报告

1. 登录 Google Analytics
2. 进入 Reports → Realtime
3. 访问网站后应看到实时访客

### 3. 生产环境验证

部署后等待 24-48 小时查看数据。

## 🔍 高级配置（可选）

### 自定义事件追踪

如果需要追踪特定用户操作，可以在相关组件中添加：

```typescript
// 示例：追踪表情符号下载
import { useRouter } from 'next/router';

const handleDownload = () => {
  // 如果 ga 存在（仅在客户端）
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'emoji_download', {
      emoji_name: 'grinning_face',
      platform: 'fluent',
      emoji_id: '1f600',
    });
  }
  // ... 下载逻辑
};
```

### 无 Cookie 模式（GDPR 合规）

如需增强隐私保护（欧盟用户），可修改 `GoogleAnalytics.tsx`：

```typescript
gtag('config', '${gaId}', {
  page_path: window.location.pathname,
  anonymize_ip: true,  // 匿名化 IP
  cookie_flags: 'SameSite=None;Secure',  // Cookie 设置
});
```

## 📝 文件清单

```
components/
  └── GoogleAnalytics.tsx           # GA 组件（新增）
app/[locale]/
  └── layout.tsx                    # 已集成 GA 组件
.env.local.example                   # 环境变量示例（新增）
GOOGLE_ANALYTICS_SETUP.md            # 本说明文档（新增）
```

## 🚀 部署检查清单

- [ ] 在 `.env.local` 配置 GA ID（本地开发）
- [ ] 在部署平台配置环境变量（生产环境）
- [ ] 重新部署应用
- [ ] 访问网站验证 GA 请求
- [ ] 在 GA 后台查看实时报告
- [ ] 等待 24-48 小时查看完整数据

## ❓ 常见问题

### Q: 为什么本地看不到数据？
A: GA 可能需要几分钟才会显示数据。确保：
- 环境变量正确配置
- 浏览器控制台无错误
- Network 标签页有 `gtag` 请求

### Q: 如何禁用本地开发追踪？
A: 在 `.env.local` 中不设置 `NEXT_PUBLIC_GA_ID`，组件会自动跳过加载。

### Q: 多个域名需要配置什么？
A: 在 GA 后台配置所有授权域名，或在 middleware 中设置 referrer。

## 📚 相关资源

- [Google Analytics 官方文档](https://support.google.com/analytics/)
- [Next.js Script 优化指南](https://nextjs.org/docs/pages/building-your-application/optimizing/scripts)
- [GA4 事件追踪](https://support.google.com/analytics/answer/9322688)

---

**配置完成！** 🎉 现在您的网站已集成 Google Analytics，可以开始追踪访客数据了。

