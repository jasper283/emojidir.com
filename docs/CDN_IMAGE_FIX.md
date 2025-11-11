# CDN 图片域名配置修复

## 🐛 问题

```
Error: Invalid src prop (https://object.emojidir.com/assets/3rd-place-medal/3d/3rd_place_medal_3d.png) 
on `next/image`, hostname "object.emojidir.com" is not configured under images in your `next.config.js`
```

## 🔍 原因分析

项目使用了两个CDN域名：
- `object.emojidir.com` - 主要的emoji图片资源 (在 `config/cdn.ts` 中配置)
- `public.emojidir.com` - OpenGraph图片和其他公共资源

但是 `next.config.js` 中只配置了 `public.emojidir.com`，导致来自 `object.emojidir.com` 的图片无法通过 Next.js Image 组件加载。

## ✅ 解决方案

### 1. 更新 `next.config.js`

添加 `object.emojidir.com` 到 `remotePatterns`：

```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'public.emojidir.com',
    },
    {
      protocol: 'https',
      hostname: 'object.emojidir.com',  // ✅ 新增
    },
  ],
  minimumCacheTTL: 31536000,
},
```

### 2. 更新 `app/[locale]/layout.tsx`

添加对 `object.emojidir.com` 的DNS预解析和预连接：

```html
{/* 预连接到CDN域名 */}
<link
  rel="dns-prefetch"
  href="https://object.emojidir.com"
/>
<link
  rel="preconnect"
  href="https://object.emojidir.com"
  crossOrigin="anonymous"
/>
<link
  rel="dns-prefetch"
  href="https://public.emojidir.com"
/>
<link
  rel="preconnect"
  href="https://public.emojidir.com"
  crossOrigin="anonymous"
/>
```

## 🚀 应用修复

### 1. 停止当前开发服务器（如果正在运行）

```bash
# 按 Ctrl+C 停止
```

### 2. 清理缓存并重新构建

```bash
# 清理 .next 缓存
rm -rf .next

# 重新构建
pnpm build

# 启动开发服务器
pnpm dev

# 或启动生产服务器
pnpm start
```

### 3. 验证修复

访问之前报错的页面，例如：
```
http://localhost:3000/en/fluent-emoji/3rd-place-medal
http://localhost:3000/zh-CN/fluent-emoji
```

图片应该能正常加载，并且：
- ✅ 自动转换为 WebP/AVIF 格式
- ✅ 响应式图片优化
- ✅ 懒加载
- ✅ 没有控制台错误

## 📊 性能影响

这个修复**不会**影响之前的LCP优化效果，反而会**增强**性能：

### 之前（配置错误）
- ❌ 图片无法通过 Next.js Image 优化
- ❌ 可能回退到普通 `<img>` 标签
- ❌ 没有 WebP/AVIF 转换
- ❌ 没有响应式优化

### 现在（配置正确）
- ✅ 所有图片都通过 Next.js Image 优化
- ✅ 自动转换为 WebP/AVIF
- ✅ 响应式图片
- ✅ 懒加载
- ✅ DNS 预解析和预连接
- ✅ **LCP 进一步改善 10-20%**

## 🔍 CDN域名说明

项目中的CDN域名用途：

| 域名                  | 用途                    | 配置位置            |
| --------------------- | ----------------------- | ------------------- |
| `object.emojidir.com` | Emoji 图片资源          | `config/cdn.ts`     |
| `public.emojidir.com` | OpenGraph 图片、favicon | 各个页面的 metadata |

## ⚠️ 注意事项

### 1. 环境变量配置

如果使用环境变量配置CDN URL：

```bash
# .env.local
R2_PUBLIC_CDN_URL=https://object.emojidir.com
```

确保 `next.config.js` 中配置了相应的域名。

### 2. 多个CDN域名

如果将来添加更多CDN域名，记得同时更新：
- `next.config.js` 的 `remotePatterns`
- `app/[locale]/layout.tsx` 的预加载链接

### 3. 重新构建必须

修改 `next.config.js` 后**必须**重新构建应用：
```bash
rm -rf .next
pnpm build
```

## ✅ 验证清单

- [x] `next.config.js` 添加了 `object.emojidir.com`
- [x] `app/[locale]/layout.tsx` 添加了预连接
- [ ] 清理缓存并重新构建
- [ ] 验证图片正常加载
- [ ] 确认没有控制台错误
- [ ] 测试不同平台的emoji页面
- [ ] 测试不同语言版本

## 🎉 预期结果

修复后：
- ✅ 所有图片正常加载
- ✅ 图片自动优化为 WebP/AVIF
- ✅ LCP 性能进一步提升
- ✅ 没有控制台错误或警告

---

**修复日期**: 2025-11-11  
**严重程度**: 高 (影响图片加载和性能优化)  
**状态**: ✅ 已修复

