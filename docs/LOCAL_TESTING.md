# 本地测试指南

## ✅ 已修复问题

原来的 `assetPrefix: 'https://your-cloudflare-url.com'` 导致本地测试时资源无法加载。

现已修改为：
```js
assetPrefix: process.env.CDN_URL || '',
```

## 🚀 本地测试步骤

### 1. 构建项目
```bash
npm run build
```

### 2. 启动静态服务器
```bash
npx serve out
# 或指定端口
npx serve out -l 3001
```

### 3. 在浏览器中访问

打开浏览器访问：

- **根路径（自动检测语言）**: http://localhost:3000
- **英语**: http://localhost:3000/en/
- **日语**: http://localhost:3000/ja/
- **韩语**: http://localhost:3000/ko/
- **繁体中文**: http://localhost:3000/zh-TW/
- **简体中文**: http://localhost:3000/zh-CN/

## 🎯 功能测试清单

- [ ] ✅ 页面正常加载
- [ ] ✅ 样式正常显示
- [ ] ✅ 语言切换器工作正常（右上角）
- [ ] ✅ 自动语言检测（访问根路径）
- [ ] ✅ 所有5种语言都能访问
- [ ] ✅ 表情搜索功能正常
- [ ] ✅ 分类筛选正常

## 📦 部署到 CDN

### 使用 CDN 前缀部署

如果你要部署到 CDN（如 Cloudflare Pages），设置环境变量后构建：

```bash
# 设置 CDN URL
export CDN_URL="https://your-cdn-domain.com"

# 构建
npm run build

# 部署 out/ 目录
```

### Cloudflare Pages 部署

```bash
# 构建命令
npm run build

# 输出目录
out

# 环境变量（可选）
CDN_URL=https://your-domain.pages.dev
```

### Vercel 部署

```bash
# 构建命令
npm run build

# 输出目录
out
```

## 🐛 常见问题

### 问题：页面加载但样式不显示

**原因**: `assetPrefix` 配置错误或资源路径问题

**解决**:
1. 本地测试时不设置 `CDN_URL` 环境变量
2. 重新构建: `rm -rf .next out && npm run build`
3. 重新启动服务器

### 问题：开发模式 404

**原因**: `output: 'export'` 与开发模式不完全兼容

**解决**: 
使用构建+预览模式代替开发模式：
```bash
npm run build && npx serve out
```

### 问题：语言切换不工作

**原因**: JavaScript 未正确加载

**检查**:
1. 打开浏览器开发者工具
2. 查看 Console 是否有错误
3. 查看 Network 面板资源是否正常加载

## 📊 性能检查

### 检查构建大小
```bash
npm run build
# 查看输出的路由大小统计
```

### 检查生成的文件
```bash
ls -lh out/en/
ls -lh out/zh-CN/
```

### 测试加载速度
```bash
# 使用 curl 测试响应时间
time curl -I http://localhost:3000/en/
```

## ✨ 完成！

现在你的国际化网站已经完全就绪，可以：

1. ✅ 本地测试所有功能
2. ✅ 部署到任何静态托管服务
3. ✅ 支持 5 种语言
4. ✅ 自动语言检测
5. ✅ 零服务器成本

祝你部署顺利！🎉

