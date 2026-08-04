# EmojiDir SEO TODO

更新时间：2026-08-04

目标：恢复并提升 Google、Bing 的曝光、收录量、平均排名和点击率。

## 当前证据

- Search Console 报告覆盖 `2025-10-27` 至 `2025-12-31`。
- `2025-11-09` 前日均约 212 次曝光，之后日均约 4.6 次，下降约 97.8%。
- Git 历史没有 2025-11-09 当天的提交，不能仅凭 Git 判断是某个提交导致下降。
- 当前线上仍能访问旧路径 `/en/fluent`，说明最新重定向代码尚未部署。
- 当前线上 Sitemap 约 9,594 个 URL，本地最新版本约 28,754 个 URL，线上部署版本落后。
- 当前线上详情页曾输出重复的 `ImageObject` JSON-LD，本地最新代码已移除重复输出，需部署后复核。
- 当前线上 `emojidir.com` 和 `www.emojidir.com` 都可访问，需要统一主域名。
- 平台页首屏 HTML 约 1.88 MB，但只有 56 个 Emoji 详情链接。

## P0：先处理部署和索引基础

### P0-1 部署当前 SEO 改动

状态：核心线上验收已通过（2026-08-04）。

- [x] 部署 commit `2eb4e6e`。
- [x] 验证 `/en/fluent` 返回 `308` 到 `/en/fluent-emoji`。
- [x] 验证 `/en/nato` 返回 `308` 到 `/en/nato-emoji`。
- [x] 验证 `/en/unicode` 返回 `308` 到 `/en/unicode-emoji`。
- [x] 验证旧路径不再出现在 Sitemap。
- [x] 验证详情页只输出一个详情 JSON-LD（另有一个全站 WebSite JSON-LD）。
- [ ] 部署后在 Search Console 对首页、平台页和详情页请求重新抓取。

验证结果：三个旧平台路径均返回 `308`；规范平台页和详情页返回 `200`；线上 Sitemap 为 28,754 个唯一 URL；没有旧平台路径；详情页包含 2 个 JSON-LD，总数为全站 WebSite 1 个 + 当前详情 ImageObject 1 个。

剩余动作：在 Search Console 对首页、平台页和详情页使用“请求编入索引”，并等待重新抓取。

验收：旧路径不再返回 200；规范 URL、Sitemap 和页面 canonical 一致。

### P0-2 统一 apex 和 www 主域名

- [x] 在 Vercel、Cloudflare 或域名层配置 `www.emojidir.com` 到 `emojidir.com` 的 301/308。
- [x] 确认所有页面、Open Graph、Sitemap、hreflang 都使用同一个主域名。
- [x] 确认 `www` 不再返回可索引的 200 页面。

验收：`www` 只发生一次跳转，最终 URL 为 `https://emojidir.com/...`。

### P0-3 获取新的 Search Console 数据

- [ ] 获取最近 16 个月的 Search Analytics 数据。
- [ ] 获取 Page indexing 报告：已索引、已发现未编入索引、已抓取未编入索引。
- [ ] 检查 Crawl Stats、Manual actions、Security issues、Core Web Vitals。
- [ ] 对比 `2025-11-09` 前后部署、DNS、CDN 和服务器日志。
- [ ] 单独查看旧路径、www URL、参数 URL 的收录状态。

本地脚本：

```bash
pnpm search-console:report \
  --credentials /path/to/oauth-client.json \
  --start 2025-04-05 \
  --end 2026-08-03
```

## P1：改善抓取和索引结构

### P1-1 将平台页改为服务端分页

当前实现位于 `components/PlatformPageClient.tsx`，分页状态只存在客户端，首屏 HTML 只有 56 个详情链接。

状态：已在本地完成，待部署后复验线上响应。

- [x] 使用 URL 分页，例如 `/en/fluent-emoji?page=2`。
- [x] 每个分页 URL 服务端输出真实 `<a href>` 详情链接。
- [x] 分页页码和上一页/下一页使用真实链接。
- [x] 为无筛选分页 URL 设置自引用 canonical，并保持 `index,follow`。
- [x] 搜索和分类通过 URL 触发服务端筛选，搜索参数未加入 Sitemap。

验收：不执行 JavaScript 时，爬虫仍能从分页页面发现所有重要详情 URL。

### P1-2 控制搜索、分类和标签参数 URL

当前可能产生：

```text
/en/fluent-emoji?search=...
/en/fluent-emoji?category=Flags
/en/blog?tag=emoji
```

- [ ] `search`、`category`、`tag` 参数页面默认 `noindex,follow`。
- [ ] 参数页面 canonical 指向无参数页面。
- [ ] Sitemap 不加入参数 URL。
- [ ] 仅为有真实搜索需求的固定分类创建独立静态页面。
- [ ] 检查 Search Console 中参数 URL 是否持续增长。

### P1-3 决定平台详情页索引策略

当前 Sitemap 包含 6 个语言 × 3 个平台 × 1,595 个 Emoji 详情页。

- [ ] 对 Fluent、Noto、Unicode 详情页比较正文、标题、描述和图片差异。
- [ ] 如果平台页内容近似：选择一个主平台详情页，其他平台使用 canonical 或 `noindex`。
- [ ] 如果三个平台都要索引：为每个平台增加独有的渲染、下载、格式和平台说明。
- [ ] 只把真正有搜索价值的平台详情页放入 Sitemap。

验收：每个被索引的平台详情页都有足够独特的正文价值，不只是替换一张图片。

### P1-4 修复博客语言回退

`lib/mdx.ts` 在缺少语言目录时会自动回退到英文。当前没有 `content/blog/pt-BR`，可能产生带 `pt-BR` URL 的英文重复内容。

- [ ] 没有本地化文章时返回 404，或返回 `noindex,follow`。
- [ ] 或补齐 `content/blog/pt-BR` 的文章翻译。
- [ ] 防止 `generateStaticParams` 为缺少翻译的语言生成英文页面。
- [ ] 博客列表和文章页增加 canonical、hreflang、`x-default`。
- [ ] 标签筛选页设置 canonical 和 `noindex,follow`。

### P1-5 增加 Emoji 详情页正文内容

当前详情页已经有 Unicode、版本和 CLDR keywords，但仍缺少有搜索价值的解释性内容。

- [ ] 增加 `Emoji meaning`。
- [ ] 增加 `Common uses`。
- [ ] 增加 Unicode code point 和 Emoji release 的解释。
- [ ] 增加 `Appearance across platforms` 对比说明。
- [ ] 增加 `Similar emojis` 内部链接。
- [ ] 为高曝光 Emoji 优先补充人工审核的内容。
- [ ] 避免批量生成空泛、重复的 SEO 段落。

建议正文至少包含 1 个明确的 H2 和 2-4 段真正回答用户问题的内容。

### P1-6 改进结构化数据和可见面包屑

- [ ] 详情页使用 `WebPage` + `ImageObject` + `BreadcrumbList` 的清晰结构。
- [ ] 页面中增加可见 Breadcrumb：Home → Platform → Emoji。
- [ ] 确认 JSON-LD 中的名称、描述、图片和页面正文一致。
- [ ] 部署后用 Rich Results Test 和 Search Console URL Inspection 验证。

### P1-7 完善详情页内链

- [ ] 在详情页加入同分类 Emoji 链接。
- [ ] 在详情页加入相似 Emoji 链接。
- [ ] 保留跨平台详情页链接，并确保每个链接都是 `<a href>`。
- [ ] 为链接使用描述性锚文本，不只使用图标或事件处理器。

## P2：性能和规模化

### P2-1 减少客户端数据和 HTML 体积

当前 `loadEmojiIndexServer` 会读取并展开完整 Emoji 索引，平台页还会把完整数据传给客户端。

- [ ] 服务端只传当前页需要的 Emoji。
- [ ] 搜索数据通过独立 JSON 按需加载，或改为服务端搜索。
- [ ] 对索引加载函数做模块级缓存或 Next cache。
- [ ] 详情页按 slug 使用轻量 lookup map，避免每次遍历完整数组。
- [ ] 重新评估是否需要一次性静态生成全部 9,570 个详情页。
- [ ] 优先使用 ISR 或按需生成，避免构建磁盘和时间压力。

### P2-2 优化 Emoji 图片

`next.config.js` 当前设置了 `images.unoptimized: true`。

- [ ] 让 CDN 提供 WebP/AVIF 和尺寸变体。
- [ ] 为卡片图片提供 128px/256px 版本。
- [ ] 仅首屏图片使用 `priority`。
- [ ] 用 PageSpeed Insights 和真实用户数据检查 LCP、INP、CLS。

### P2-3 修复 Sitemap 的更新时间来源

当前 `app/sitemap.ts` 使用 `data/emoji-index.json` 的 `generatedAt`。如果 SEO 数据或页面代码更新，详情页的 `lastModified` 可能仍停留在旧时间。

- [ ] 明确页面数据的真实更新时间来源。
- [ ] 让 Emoji 数据、SEO 数据和博客 frontmatter 的更新时间保持一致。
- [ ] 不要每次请求都使用当前时间伪造更新。

### P2-4 清理低质量或错误外链

- [ ] 修复 Footer 中的占位 GitHub 链接：`github.com/yourusername/find-emoji`。
- [ ] Footer 的隐私政策、条款和博客链接使用当前语言路径。
- [ ] 检查所有外链是否返回 200，以及是否真的指向对应项目。

## 发布后监控

- [ ] 每周导出 Search Console：曝光、点击、CTR、平均排名、按页、按查询。
- [ ] 每周检查 Sitemap 是否成功处理。
- [ ] 观察旧 URL、参数 URL 和 www URL 的曝光是否归零。
- [ ] 观察已发现未编入索引和已抓取未编入索引数量。
- [ ] Bing 部署后提交 canonical URL 到 IndexNow。
- [ ] 每次大规模 URL 或 metadata 改动后，抽查 10 个页面的 HTML、canonical、hreflang、JSON-LD 和状态码。

## 官方参考

- Google JavaScript SEO：https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google 可抓取链接：https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Google 分页：https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading
- Google Faceted Navigation：https://developers.google.com/crawling/docs/faceted-navigation
- Google Breadcrumb structured data：https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google Page Experience：https://developers.google.com/search/docs/appearance/page-experience
- Google meta tags：https://developers.google.com/search/docs/crawling-indexing/special-tags
