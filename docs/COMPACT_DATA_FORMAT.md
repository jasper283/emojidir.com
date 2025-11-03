# Compact Data Format 缩写数据格式

## 概述

为了减少 JSON 文件体积，提升加载速度，我们将 emoji-index.json 的数据结构改为使用缩写字段名。

## 字段映射

### 顶层字段

| 原字段名           | 缩写 | 说明               |
| ------------------ | ---- | ------------------ |
| `emojis`           | `e`  | Emoji 列表         |
| `categories`       | `c`  | 分类列表           |
| `emojisByCategory` | `ec` | 按分类组织的 Emoji |
| `totalCount`       | `tc` | 总数量             |
| `generatedAt`      | `g`  | 生成时间           |

### Emoji 对象字段

| 原字段名   | 缩写 | 说明       |
| ---------- | ---- | ---------- |
| `id`       | `i`  | ID         |
| `name`     | `n`  | 名称       |
| `glyph`    | `gl` | Emoji 字符 |
| `group`    | `gr` | 分组       |
| `keywords` | `k`  | 关键词     |
| `unicode`  | `u`  | Unicode 码 |
| `tts`      | `t`  | TTS 文本   |
| `styles`   | `s`  | 样式对象   |

### Styles 对象字段

| 原字段名                | 缩写 | 说明             |
| ----------------------- | ---- | ---------------- |
| `3d`                    | `3`  | 3D 样式          |
| `color`                 | `c`  | 彩色样式         |
| `flat`                  | `f`  | 扁平样式         |
| `high-contrast`         | `h`  | 高对比度样式     |
| `3d-default`            | `3d` | 3D 默认样式      |
| `color-default`         | `cd` | 彩色默认样式     |
| `flat-default`          | `fd` | 扁平默认样式     |
| `high-contrast-default` | `hd` | 高对比度默认样式 |

### I18n 对象字段

| 原字段名   | 缩写 | 说明     |
| ---------- | ---- | -------- |
| `name`     | `n`  | 名称     |
| `keywords` | `k`  | 关键词   |
| `tts`      | `t`  | TTS 文本 |

## 数据示例

### 缩写格式

```json
{
  "i": "1st-place-medal",
  "n": "1st place medal",
  "gl": "🥇",
  "gr": "Activities",
  "k": [
    "1st place medal",
    "first",
    "gold",
    "medal"
  ],
  "u": "1f947",
  "t": "1st place medal",
  "s": {
    "3": "assets/1st-place-medal/3d/1st_place_medal_3d.png",
    "c": "assets/1st-place-medal/color/1st_place_medal_color.svg",
    "f": "assets/1st-place-medal/flat/1st_place_medal_flat.svg",
    "h": "assets/1st-place-medal/high-contrast/1st_place_medal_high_contrast.svg"
  }
}
```

## 实现细节

### 类型定义

在 `types/emoji.ts` 中定义了两套类型系统：

1. **完整格式**：`Emoji`, `EmojiIndex`, `EmojiStyles` 等
2. **缩写格式**：`CompactEmoji`, `CompactEmojiIndex`, `CompactEmojiStyles` 等

### 数据转换

提供了转换函数将缩写格式转换为完整格式：

- `expandStyles()` - 转换样式对象
- `expandI18n()` - 转换国际化对象
- `expandEmoji()` - 转换 Emoji 对象
- `expandEmojiIndex()` - 转换整个索引对象

### 使用方式

在需要使用数据的地方，导入缩写数据并转换：

```typescript
import compactData from '@/data/emoji-index.json';
import { expandEmojiIndex } from '@/types/emoji';

const data = expandEmojiIndex(compactData as CompactEmojiIndex);
```

### 生成脚本

修改了以下脚本以生成缩写格式：

1. `scripts/generate-index.js` - 生成基础索引
2. `scripts/process-cldr.js` - 处理翻译数据

## 文件体积优化

使用缩写字段后，文件大小显著减少，特别是对于大型数据集：

- 基础索引文件：~2.0-2.1 MB
- 翻译版本索引：~2.7-2.9 MB

缩写字段名可以减少约 20-30% 的文件体积，具体取决于数据的复杂程度。

## 向后兼容

为了保持代码的可读性和维护性：

1. 在内部代码中仍然使用完整的类型定义
2. 只在数据存储和传输层使用缩写格式
3. 通过转换函数实现无缝衔接

## 注意事项

1. JSON 文件使用缩写字段名
2. TypeScript 代码中使用完整类型
3. 导入数据后立即转换为完整格式
4. 国际化数据同样使用缩写格式

## 相关文件

- `types/emoji.ts` - 类型定义和转换函数
- `lib/emoji-i18n.ts` - 国际化数据加载
- `scripts/generate-index.js` - 索引生成脚本
- `scripts/process-cldr.js` - 翻译处理脚本
- 所有导入 `emoji-index.json` 的页面和组件

