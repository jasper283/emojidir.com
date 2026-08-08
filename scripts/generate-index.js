const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/fluent-emoji');
const OUTPUT_FILE = path.join(__dirname, '../data/emoji-index.json');

/**
 * 将样式键转换为缩写格式
 */
function getCompactStyleKey(styleKey) {
  const styleMap = {
    '3d': '3',
    'color': 'c',
    'flat': 'f',
    'high-contrast': 'h',
    '3d-default': '3d',
    'color-default': 'cd',
    'flat-default': 'fd',
    'high-contrast-default': 'hd',
  };

  return styleMap[styleKey] || styleKey;
}

const SKIN_TONE_SUFFIXES = [
  'medium-light-skin-tone',
  'medium-dark-skin-tone',
  'light-skin-tone',
  'medium-skin-tone',
  'dark-skin-tone',
];

const HAIR_SUFFIXES = [
  'red-hair',
  'curly-hair',
  'white-hair',
  'bald',
  'blonde-hair',
];

function firstExisting(ids, candidates) {
  return candidates.find(candidate => candidate && ids.has(candidate)) || null;
}

function determineEmojiVariantFields(id, ids) {
  for (const suffix of SKIN_TONE_SUFFIXES) {
    if (id.endsWith(`-${suffix}`)) {
      const base = id.slice(0, -(suffix.length + 1));
      const variantOf = firstExisting(ids, [base]);
      if (variantOf) return { lv: 'variant', vo: variantOf, vk: 'skin-tone' };
    }
  }

  if (id.endsWith('-facing-right')) {
    const base = id.slice(0, -'-facing-right'.length);
    const variantOf = firstExisting(ids, [base]);
    if (variantOf) return { lv: 'variant', vo: variantOf, vk: 'direction' };
  }

  for (const suffix of HAIR_SUFFIXES) {
    if (id.endsWith(`-${suffix}`)) {
      const base = id.slice(0, -(suffix.length + 1));
      const variantOf = firstExisting(ids, [base]);
      if (variantOf) return { lv: 'variant', vo: variantOf, vk: 'hair' };
    }
  }

  if (id.startsWith('woman-') || id.startsWith('man-')) {
    const withoutGender = id.replace(/^(woman|man)-/, '');
    const variantOf = firstExisting(ids, [
      `person-${withoutGender}`,
      withoutGender,
    ]);
    if (variantOf) return { lv: 'variant', vo: variantOf, vk: 'gender' };
  }

  if (id.startsWith('women-') || id.startsWith('men-')) {
    const withoutGender = id.replace(/^(women|men)-/, '');
    const variantOf = firstExisting(ids, [
      `people-${withoutGender}`,
      withoutGender,
    ]);
    if (variantOf) return { lv: 'variant', vo: variantOf, vk: 'gender' };
  }

  if (id.startsWith('couple-with-heart-')) {
    const variantOf = firstExisting(ids, ['couple-with-heart']);
    if (variantOf) return { lv: 'variant', vo: variantOf, vk: 'couple' };
  }

  if (id.startsWith('kiss-')) {
    const variantOf = firstExisting(ids, ['kiss']);
    if (variantOf) return { lv: 'variant', vo: variantOf, vk: 'couple' };
  }

  if (id.startsWith('family-')) {
    const variantOf = firstExisting(ids, ['family']);
    if (variantOf) return { lv: 'variant', vo: variantOf, vk: 'family' };
  }

  return { lv: 'primary' };
}

function generateIndex() {
  console.log('🔍 扫描 emoji 资源...');

  const emojis = [];
  const categories = new Set();

  // 读取 assets 目录下的所有文件夹
  const folders = fs.readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  const folderIds = new Set(folders);

  console.log(`📁 找到 ${folders.length} 个 emoji 文件夹`);

  folders.forEach((folder, index) => {
    const metadataPath = path.join(ASSETS_DIR, folder, 'metadata.json');

    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

        // 检查可用的样式 - 动态扫描实际存在的子文件夹
        const styles = {};
        const stylesDir = path.join(ASSETS_DIR, folder);

        // 读取实际存在的子文件夹
        const subDirs = fs.readdirSync(stylesDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        subDirs.forEach(styleDir => {
          const stylePath = path.join(stylesDir, styleDir);
          const files = fs.readdirSync(stylePath).filter(f => !f.startsWith('.'));

          if (files.length > 0) {
            // 标准化样式名称作为 key
            const styleKey = styleDir.toLowerCase().replace(/\s+/g, '-');
            // 转换为缩写格式
            const compactStyleKey = getCompactStyleKey(styleKey);
            // 使用实际的文件夹名称构建路径
            styles[compactStyleKey] = `assets/${folder}/${styleDir}/${files[0]}`;
          }
        });

        // 检查是否有 default 子文件夹（深浅色主题支持）
        const defaultDir = path.join(stylesDir, 'default');
        if (fs.existsSync(defaultDir)) {
          const defaultSubDirs = fs.readdirSync(defaultDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

          defaultSubDirs.forEach(styleDir => {
            const stylePath = path.join(defaultDir, styleDir);
            const files = fs.readdirSync(stylePath).filter(f => !f.startsWith('.'));

            if (files.length > 0) {
              // 为深浅色主题添加特殊的样式键
              const styleKey = `${styleDir.toLowerCase().replace(/\s+/g, '-')}-default`;
              // 转换为缩写格式
              const compactStyleKey = getCompactStyleKey(styleKey);
              styles[compactStyleKey] = `assets/${folder}/default/${styleDir}/${files[0]}`;
            }
          });
        }

        // 使用缩写字段名
        const emoji = {
          i: folder,                           // id
          n: metadata.cldr || folder,          // name
          gl: metadata.glyph || '',            // glyph
          gr: metadata.group || 'Other',       // group
          k: metadata.keywords || [],          // keywords
          u: metadata.unicode || '',           // unicode
          t: metadata.tts || '',               // tts
          s: styles,                           // styles
          ...determineEmojiVariantFields(folder, folderIds),
        };

        emojis.push(emoji);
        categories.add(emoji.gr);

        if ((index + 1) % 100 === 0) {
          console.log(`  处理进度: ${index + 1}/${folders.length}`);
        }
      } catch (error) {
        console.error(`❌ 处理 ${folder} 时出错:`, error.message);
      }
    }
  });

  // 按分类组织
  const emojisByCategory = {};
  categories.forEach(cat => {
    emojisByCategory[cat] = emojis.filter(e => e.gr === cat);
  });

  // 使用缩写的顶层字段名
  const data = {
    e: emojis,                              // emojis
    c: Array.from(categories).sort(),       // categories
    ec: emojisByCategory,                   // emojisByCategory
    tc: emojis.length,                      // totalCount
    g: new Date().toISOString(),            // generatedAt
  };

  // 确保 data 目录存在
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log(`✅ 索引生成完成！`);
  console.log(`   总计: ${emojis.length} 个 emoji`);
  console.log(`   分类: ${categories.size} 个`);
  console.log(`   输出: ${OUTPUT_FILE}`);
}

// 运行索引生成
generateIndex();

// 自动处理可用的 CLDR 数据
console.log('\n🌐 检查可用的 CLDR 翻译数据...');
const cldrDir = path.join(__dirname, '../assets/cldr');

if (fs.existsSync(cldrDir)) {
  const { processCLDR, integrateTranslations } = require('./process-cldr');

  // 语言映射
  const localeMap = {
    'zh': 'zh-CN',
    'zh-Hant': 'zh-TW',
    'zh-hant': 'zh-TW',  // 支持小写文件名
    'ja': 'ja',
    'ko': 'ko',
    'en': 'en',
    'pt': 'pt-BR'
  };

  const cldrFiles = fs.readdirSync(cldrDir)
    .filter(file => file.startsWith('annotations-') && file.endsWith('.json'));

  console.log(`找到 ${cldrFiles.length} 个 CLDR 文件`);

  cldrFiles.forEach(file => {
    const match = file.match(/annotations-(.+)\.json/);
    if (match) {
      const cldrLang = match[1];
      const locale = localeMap[cldrLang] || cldrLang;

      console.log(`\n处理 ${locale} (${cldrLang})...`);

      const cldrFilePath = path.join(cldrDir, file);
      const indexFilePath = path.join(__dirname, '../data/emoji-index.json');
      const outputFilePath = path.join(__dirname, `../data/emoji-index-${locale}.json`);

      const translations = processCLDR(cldrFilePath, locale);
      if (Object.keys(translations).length > 0) {
        integrateTranslations(indexFilePath, translations, locale, outputFilePath);

        // 同时复制到 public 目录供前端访问
        const publicOutputPath = path.join(__dirname, `../public/data/emoji-index-${locale}.json`);
        const publicDir = path.dirname(publicOutputPath);
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.copyFileSync(outputFilePath, publicOutputPath);
        console.log(`   ✅ 已复制到 public 目录`);
      }
    }
  });

  console.log('\n🎉 所有翻译处理完成！');
} else {
  console.log('未找到 CLDR 目录，跳过翻译处理');
}
