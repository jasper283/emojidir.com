# SEO-Friendly URL Structure

## 📋 **URL 架构说明**

本项目已实现 SEO 友好的 URL 结构，将平台和 emoji 作为独立的路径段。

---

## 🌐 **URL 模式**

### 1. **首页**
```
/
```
- 自动重定向到浏览器语言对应的首页

### 2. **语言首页**
```
/{locale}
```
- 例如：`/en`, `/zh-CN`, `/ja`
- 自动重定向到默认平台页面

### 3. **平台页面** (主要页面)
```
/{locale}/{platform}-emoji
```

**示例：**
- `/en/fluent-emoji` - 英语 + Fluent Emoji 平台
- `/zh-CN/fluent-emoji` - 简体中文 + Fluent Emoji
- `/ja/noto-emoji` - 日语 + Noto Emoji
- `/ko/unicode-emoji` - 韩语 + 系统表情符号

### 4. **Emoji 详情页**
```
/{locale}/{platform}-emoji/{unicode}
```

**示例：**
- `/en/fluent-emoji/1f947` - 🥇 (1st place medal)
- `/zh-CN/fluent-emoji/1f600` - 😀 (grinning face)
- `/ja/noto-emoji/2764` - ❤️ (red heart)

---

## 🎯 **SEO 优势**

### 1. **语义化 URL**
- ✅ 清晰的路径结构
- ✅ 可读性强
- ✅ 包含关键词（emoji, platform）

### 2. **多语言支持**
- ✅ 每种语言都有独立的 URL
- ✅ 正确的 `hreflang` 标签支持
- ✅ 搜索引擎可以索引所有语言版本

### 3. **平台区分**
- ✅ 每个平台都有独立的 URL 空间
- ✅ 便于追踪不同平台的流量
- ✅ 更好的内容组织

### 4. **Emoji 详情页**
- ✅ 每个 emoji 都有唯一的 URL
- ✅ 使用 Unicode 编码作为标识符
- ✅ 便于分享和链接

---

## 📊 **支持的平台**

| 平台 ID   | URL Slug        | 描述                   |
| --------- | --------------- | ---------------------- |
| `fluent`  | `fluent-emoji`  | Microsoft Fluent Emoji |
| `noto`    | `noto-emoji`    | Google Noto Emoji      |
| `unicode` | `unicode-emoji` | 系统表情符号 Emoji     |

---

## 🔍 **URL 示例**

### 完整路径示例

1. **浏览 Fluent Emoji（简体中文）**
   ```
   https://emojidir.com/zh-CN/fluent-emoji
   ```

2. **查看特定 emoji 详情（英语）**
   ```
   https://emojidir.com/en/fluent-emoji/1f947
   ```

3. **Noto Emoji 平台（日语）**
   ```
   https://emojidir.com/ja/noto-emoji
   ```

4. **原生平台（韩语）**
   ```
   https://emojidir.com/ko/unicode-emoji
   ```

---

## 🛠️ **技术实现**

### 文件结构
```
app/
├── [locale]/
│   ├── page.tsx              # 重定向到默认平台
│   ├── layout.tsx            # 语言布局
│   └── [platform]/
│       ├── page.tsx          # 平台主页（emoji列表）
│       ├── layout.tsx        # 平台布局
│       └── [unicode]/
│           └── page.tsx      # Emoji 详情页
```

### 路由参数

1. **`[locale]`**: 语言代码
   - `en`, `ja`, `ko`, `zh-TW`, `zh-CN`

2. **`[platform]`**: 平台 slug
   - `fluent-emoji`, `noto-emoji`, `unicode-emoji`

3. **`[unicode]`**: Unicode 编码（不带 U+ 前缀）
   - `1f947`, `1f600`, `2764`

---

## 🚀 **导航实现**

### 平台切换
使用 `PlatformSwitcher` 组件：
```tsx
<PlatformSwitcher currentPlatform={selectedPlatform} />
```
- 保持当前语言
- 切换到新平台
- URL 自动更新

### 语言切换
使用 `LanguageSwitcher` 组件：
```tsx
<LanguageSwitcher />
```
- 保持当前平台
- 切换到新语言
- URL 自动更新

### Emoji 详情跳转
在 `EmojiCard` 组件中：
```tsx
router.push(`/${locale}/${platform}/${emoji.unicode}`);
```

---

## 📱 **用户体验**

### 自动重定向流程

1. **访问根路径 `/`**
   ```
   / → /{detected-locale}
   ```

2. **访问语言路径 `/{locale}`**
   ```
   /{locale} → /{locale}/fluent-emoji
   ```

3. **浏览器语言检测**
   - 自动检测用户浏览器语言
   - 重定向到对应语言版本
   - 默认使用英语（如果浏览器语言不支持）

---

## 🔗 **内部链接建议**

### 1. 面包屑导航
```
Home > Fluent Emoji > 🥇 1st Place Medal
```

### 2. 相关 Emoji 推荐
在详情页显示同类别或相关的 emoji

### 3. 平台间跳转
在详情页提供"在其他平台查看"的链接

---

## 📈 **SEO 最佳实践**

### 1. Meta 标签
每个页面应包含：
- `<title>`: 包含 emoji 名称、平台、语言
- `<meta description>`: 描述 emoji 和平台
- `<link rel="canonical">`: 规范化 URL

### 2. 结构化数据
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "1st Place Medal Emoji",
  "description": "...",
  "url": "https://emojidir.com/en/fluent-emoji/1f947"
}
```

### 3. Sitemap
生成包含所有语言和平台组合的 sitemap：
- `/sitemap.xml`
- 包含所有 emoji 详情页

---

## ✅ **完成检查清单**

- [x] 实现 `[locale]` 动态路由
- [x] 实现 `[platform]` 动态路由
- [x] 实现 `[unicode]` 动态路由
- [x] 创建 `PlatformSwitcher` 组件
- [x] 更新 `LanguageSwitcher` 保持平台路径
- [x] 更新 `EmojiCard` 支持详情页跳转
- [x] 创建 Emoji 详情页
- [x] 添加自动重定向逻辑
- [ ] 添加 Meta 标签和 SEO 优化
- [ ] 生成 Sitemap
- [ ] 添加结构化数据

---

## 🎊 **总结**

新的 URL 结构为 SEO 优化提供了坚实的基础：
- ✅ 清晰的路径层次
- ✅ 语义化的 URL
- ✅ 多语言支持
- ✅ 平台区分
- ✅ 每个 emoji 都有独立页面
- ✅ 便于分享和索引

